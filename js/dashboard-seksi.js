/* ======================================================
   DASHBOARD REKAP BERKAS PER SEKSI
   - Chart: API ?action=rekapSeksi
   - Detail: API ?action=bebanPU
====================================================== */

let seksiChartInstance = null;
let cacheBerkasPU = [];
let cacheDetailSeksi = [];

const SEKSI_COLORS = [
  "#3b82f6", // biru
  "#10b981", // hijau
  "#f59e0b", // kuning
  "#ef4444", // merah
  "#8b5cf6", // ungu
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#6366f1", // indigo
  "#22c55e", // green
  "#eab308"  // amber
];


/* ======================================================
   INIT (DIPANGGIL SAAT DASHBOARD AKTIF)
====================================================== */
function initDashboardRekapSeksi() {

  if (!document.getElementById("seksiChart")) return;

  loadRekapSeksi();
  loadCacheBerkasPU();
}

/* ======================================================
   LOAD DATA DETAIL (UNTUK TABEL & EXCEL)
====================================================== */
function loadCacheBerkasPU() {

  if (!window.APP_CONFIG?.API_WEB) return;

  fetch(`${APP_CONFIG.API_WEB}?action=bebanPU`)
    .then(res => res.json())
    .then(res => {
      if (res?.success && Array.isArray(res.data)) {
        cacheBerkasPU = res.data;
      }
    })
    .catch(err => console.error("Cache bebanPU error:", err));
}

/* ======================================================
   LOAD REKAP SEKSI (UNTUK CHART)
====================================================== */
function loadRekapSeksi() {

  if (!window.APP_CONFIG?.API_WEB) return;

  fetch(`${APP_CONFIG.API_WEB}?action=rekapSeksi`)
    .then(res => res.json())
    .then(res => {

      if (!res?.success) return;

      const data = res.data?.data || [];
      if (!Array.isArray(data) || !data.length) return;
      
      const labels = data.map(d => d.seksi);
      const values = data.map(d => Number(d.jumlah) || 0);

      renderSeksiChart(labels, values);
      renderSeksiLegend(data);
    })
    .catch(err => console.error("API rekapSeksi error:", err));
}

/* ======================================================
   RENDER BAR CHART (KLIK AKTIF)
====================================================== */
function renderSeksiChart(labels, values) {

  const canvas = document.getElementById("seksiChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (seksiChartInstance) {
    seksiChartInstance.destroy();
  }

  // ambil warna sesuai jumlah bar
  const colors = labels.map(
    (_, i) => SEKSI_COLORS[i % SEKSI_COLORS.length]
  );

  seksiChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Jumlah Berkas",
        data: values,
        backgroundColor: colors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} berkas`
          }
        }
      }
    }
  });
}

/* ======================================================
   RENDER LEGEND (KLIK AKTIF)
====================================================== */
function renderSeksiLegend(data) {

  const box = document.getElementById("seksiLegend");
  if (!box) return;

  box.innerHTML = "";
  let total = 0;

  data.forEach((d, i) => {
    const jumlah = Number(d.jumlah) || 0;
    total += jumlah;

    box.innerHTML += `
      <div class="flex justify-between items-center border-b py-1 text-sm cursor-pointer hover:bg-blue-50"
           onclick="lihatBerkasSeksi('${d.seksi}')">
        <span>${i + 1}. ${d.seksi}</span>
        <span class="font-semibold">${jumlah}</span>
      </div>
    `;
  });

  box.innerHTML += `
    <div class="flex justify-between font-bold text-blue-600 pt-2">
      <span>Total</span>
      <span>${total}</span>
    </div>
  `;
}

/* ======================================================
   TAMPILKAN TABEL DETAIL SEKSI
====================================================== */
function lihatBerkasSeksi(namaSeksi) {

  const container = document.getElementById("seksiDetailContainer");
  const body = document.getElementById("seksiDetailBody");
  const title = document.getElementById("seksiDetailTitle");

  if (!container || !body) return;

  title.innerText = namaSeksi;
  body.innerHTML = "";
  container.classList.remove("hidden");

  cacheDetailSeksi = cacheBerkasPU.filter(row =>
    (row["Posisi terakhir"] || "").includes(namaSeksi)
  );

  if (!cacheDetailSeksi.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-gray-400">
          Tidak ada berkas
        </td>
      </tr>`;
    return;
  }

  cacheDetailSeksi.forEach((row, i) => {
    body.innerHTML += `
      <tr>
        <td class="border px-2 py-1">${i + 1}</td>
        <td class="border px-2 py-1">${row["Nomor berkas"] || "-"}</td>
        <td class="border px-2 py-1">${row["Nama Pemohon"] || "-"}</td>
        <td class="border px-2 py-1">${row["Jenis permohonan"] || "-"}</td>
        <td class="border px-2 py-1">${row["Desa/Kecamatan"] || "-"}</td>
        <td class="border px-2 py-1">${row["Status Berkas"] || "-"}</td>
        <td class="border px-2 py-1">${row["Keterangan"] || "-"}</td>
      </tr>
    `;
  });

  container.scrollIntoView({ behavior: "smooth" });
}

/* ======================================================
   DOWNLOAD EXCEL DETAIL SEKSI
====================================================== */
function downloadExcelSeksi() {

  if (!cacheDetailSeksi.length) {
    alert("Tidak ada data untuk diunduh");
    return;
  }

  const excelData = cacheDetailSeksi.map(row => ({
    "Nomor Berkas": row["Nomor berkas"],
    "Nama Pemohon": row["Nama Pemohon"],
    "Jenis Permohonan": row["Jenis permohonan"],
    "Desa / Kecamatan": row["Desa/Kecamatan"],
    "Status": row["Status Berkas"],
    "Posisi Terakhir": row["Posisi terakhir"],
    "Keterangan": row["Keterangan"]
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Berkas per Seksi");

  XLSX.writeFile(
    wb,
    `berkas-seksi-${new Date().toISOString().slice(0,10)}.xlsx`
  );
}

/* ======================================================
   AUTO INIT (AMAN UNTUK ROUTER SPA)
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initDashboardRekapSeksi();
});

/* ======================================================
   TUTUP TABEL DETAIL SEKSI
====================================================== */
function tutupTabelSeksi() {

  const container = document.getElementById("seksiDetailContainer");
  const body = document.getElementById("seksiDetailBody");

  if (!container) return;

  // sembunyikan tabel
  container.classList.add("hidden");

  // reset data cache detail
  cacheDetailSeksi = [];
  if (body) body.innerHTML = "";

  // scroll balik ke chart
  const chart = document.getElementById("seksiChart");
  if (chart) {
    chart.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
