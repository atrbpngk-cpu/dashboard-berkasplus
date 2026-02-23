/* ======================================================
   DASHBOARD PETUGAS UKUR (PU)
   FINAL – SESUAI SHEET ASLI
   Penilaian: B (Petugas Ukur) → C (Penerima Berikutnya)
====================================================== */

/* ================= KONFIG ================= */
const SLA_PU_HARI = 7;

/* ================= STATE ================= */
let dataInformasiBerkas = [];
let dataHistory = [];
let isDashboardPULoaded = false;

/* ======================================================
   INIT (DIPANGGIL DARI ROUTER)
====================================================== */
function initDashboardPU() {
  if (isDashboardPULoaded) return;
  isDashboardPULoaded = true;

  console.log("INIT: Dashboard Petugas Ukur 📐");
  loadDashboardPU();
}

/* ======================================================
   LOAD DATA
====================================================== */
async function loadDashboardPU() {
  try {
    dataInformasiBerkas = await fetchSheet("InformasiBerkas");
    dataHistory = await fetchSheet("History");

    const statistik = hitungStatistikPU(
      dataInformasiBerkas,
      dataHistory
    );

    renderDashboardPU(statistik);
    window.dashboardPUData = statistik;

  } catch (err) {
    console.error("Gagal load Dashboard PU:", err);
  }
}

/* ======================================================
   AMBIL FIELD SESUAI SHEET
====================================================== */
function getPetugasUkur(row) {
  return (
    row["Petugas ukur"] ||
    row["Petugas Ukur"] ||
    ""
  ).toString().trim();
}

function getTanggalMulai(row) {
  const raw =
    row["Tanggal mulai"] ||
    row["Tanggal Mulai"];

  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? null : d;
}

function getNomorBerkas(row) {
  return (
    row["Nomor berkas"] ||
    row["Nomor/Tahun Berkas"] ||
    ""
  ).toString().trim();
}

/* ======================================================
   TANGGAL SELESAI PU (B → C)
====================================================== */
function getTanggalSelesaiPU(nomorBerkas, namaPU, histories) {
  const kandidat = histories
    .filter(h =>
      getNomorBerkas(h) === nomorBerkas &&
      (
        h["Penerima"] ||
        h["Dikirim Ke"]
      ) &&
      h["Penerima"] !== namaPU &&
      h["Dikirim Ke"] !== namaPU
    )
    .map(h => h["Tgl diterima"] || h["Tgl dikirim"])
    .filter(Boolean)
    .map(d => new Date(d))
    .filter(d => !isNaN(d))
    .sort((a, b) => a - b);

  return kandidat[0] || null;
}

/* ======================================================
   HITUNG STATISTIK PU
====================================================== */
function hitungStatistikPU(infos, histories) {
  const hasil = {};

  infos.forEach(info => {
    const pu = getPetugasUkur(info);
    const nomor = getNomorBerkas(info);
    const tglMulai = getTanggalMulai(info);

    if (!pu || !nomor || !tglMulai) return;

    if (!hasil[pu]) {
      hasil[pu] = {
        ditangani: 0,
        diserahkan: 0,
        tepatWaktu: 0,
        totalDurasi: 0,
        berat: []
      };
    }

    hasil[pu].ditangani++;

    const tglSelesai = getTanggalSelesaiPU(
      nomor,
      pu,
      histories
    );

    if (!tglSelesai) return;

    const durasi = hitungSelisihHari(tglMulai, tglSelesai);

    hasil[pu].diserahkan++;
    hasil[pu].totalDurasi += durasi;

    if (durasi <= SLA_PU_HARI) {
      hasil[pu].tepatWaktu++;
    }

    hasil[pu].berat.push({
      nomor,
      durasi
    });
  });

  Object.values(hasil).forEach(d => {
    d.persentaseKinerja = d.ditangani
      ? Math.round((d.tepatWaktu / d.ditangani) * 100)
      : 0;

    d.rataDurasi = d.diserahkan
      ? Math.round(d.totalDurasi / d.diserahkan)
      : 0;
  });

  return hasil;
}

/* ======================================================
   RENDER KPI
====================================================== */
function renderDashboardPU(statistik) {
  const listPU = Object.keys(statistik);

  const totalBerkas = listPU.reduce(
    (a, pu) => a + statistik[pu].ditangani, 0
  );

  const totalDiserahkan = listPU.reduce(
    (a, pu) => a + statistik[pu].diserahkan, 0
  );

  const avgKinerja = listPU.length
    ? Math.round(
        listPU.reduce(
          (a, pu) => a + statistik[pu].persentaseKinerja, 0
        ) / listPU.length
      )
    : 0;

  const avgDurasi = listPU.length
    ? Math.round(
        listPU.reduce(
          (a, pu) => a + statistik[pu].rataDurasi, 0
        ) / listPU.length
      )
    : 0;

  setTextIfExist("totalBerkasPU", totalBerkas);
  setTextIfExist("berkasSelesaiPU", totalDiserahkan);
  setTextIfExist("persentaseKinerjaPU", avgKinerja + "%");
  setTextIfExist("rataDurasiPU", avgDurasi + " hari");
}

/* ======================================================
   DETAIL TABEL (KLIK KPI)
====================================================== */
function tampilkanDetailPU() {
  const data = window.dashboardPUData || {};
  const body = document.getElementById("puDetailBody");
  const container = document.getElementById("puDetailContainer");

  if (!body || !container) return;

  body.innerHTML = "";
  let no = 1;

  Object.keys(data).forEach(pu => {
    const d = data[pu];

    body.innerHTML += `
      <tr>
        <td class="border px-2 py-1 text-center">${no++}</td>
        <td class="border px-2 py-1">${pu}</td>
        <td class="border px-2 py-1 text-center">${d.ditangani}</td>
        <td class="border px-2 py-1 text-center">${d.diserahkan}</td>
        <td class="border px-2 py-1 text-center">${d.persentaseKinerja}%</td>
        <td class="border px-2 py-1 text-center">${d.rataDurasi}</td>
      </tr>
    `;
  });

  container.classList.remove("hidden");
  container.scrollIntoView({ behavior: "smooth" });
}

function tutupDetailPU() {
  document.getElementById("puDetailContainer")?.classList.add("hidden");
}

/* ======================================================
   DOWNLOAD CSV
====================================================== */
function downloadExcelPU() {
  const data = window.dashboardPUData || {};
  let csv = "Petugas Ukur,Ditangani,Diserahkan,Kinerja(%),Rata Durasi(Hari)\n";

  Object.keys(data).forEach(pu => {
    const d = data[pu];
    csv += `${pu},${d.ditangani},${d.diserahkan},${d.persentaseKinerja},${d.rataDurasi}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "kinerja_petugas_ukur.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* ======================================================
   UTIL
====================================================== */
function hitungSelisihHari(a, b) {
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

function setTextIfExist(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}
