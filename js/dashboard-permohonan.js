/* ======================================================
   DASHBOARD REKAP JENIS PERMOHONAN
   - Data sumber : API ?action=bebanPU
   - Rekap      : group by "Jenis permohonan"
   - Filter     : Tahun & Bulan dari "Tanggal mulai"
   - INIT       : DIPANGGIL OLEH ROUTER (SPA)
====================================================== */

/* ================= GLOBAL CACHE (SHARED) ================= */
window.CACHE_BERKAS = window.CACHE_BERKAS || [];
window.CACHE_READY  = window.CACHE_READY  || false;

/* ================= STATE ================= */
let permohonanChartInstance = null;
let cacheDetailPermohonan = [];
//let PERMOHONAN_INITED = false;

/* ================= WARNA ================= */
const PERMOHONAN_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1"
];

/* ======================================================
   LOAD CACHE (FETCH SEKALI SAJA)
====================================================== */
function loadCacheBerkas() {

  if (window.CACHE_READY) {
    return Promise.resolve(window.CACHE_BERKAS);
  }

  return fetch(`${APP_CONFIG.API_WEB}?action=bebanPU`)
    .then(res => res.json())
    .then(res => {
      if (res?.success && Array.isArray(res.data)) {
        window.CACHE_BERKAS = res.data;
        window.CACHE_READY = true;
      }
      return window.CACHE_BERKAS;
    })
    .catch(err => {
      console.error("Load CACHE_BERKAS error:", err);
      return [];
    });
}

/* ======================================================
   INIT DROPDOWN TAHUN (DARI TANGGAL MULAI)
====================================================== */
function initTahunDropdown() {

  const select = document.getElementById("tahunSelect");
  if (!select) return;

  select.innerHTML = "";

  // ✅ OPSI SEMUA TAHUN
  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = "Semua Tahun";
  select.appendChild(optAll);

  const tahunSet = new Set();

  window.CACHE_BERKAS.forEach(row => {
    const tgl = new Date(row["Tanggal mulai"]);
    if (!isNaN(tgl)) {
      tahunSet.add(tgl.getFullYear());
    }
  });

  if (!tahunSet.size) {
    select.value = "all";
    return;
  }

  const tahunList = Array.from(tahunSet).sort((a, b) => b - a);

  tahunList.forEach(tahun => {
    const opt = document.createElement("option");
    opt.value = tahun;
    opt.textContent = tahun;
    select.appendChild(opt);
  });

  // ✅ DEFAULT: Semua Tahun
  select.value = "all";
}


/* ======================================================
   REKAP GENERIK (ANTI DUPLIKASI)
====================================================== */
function rekapByField({ field, tahun = null, bulan = null }) {

  const hasil = {};

  window.CACHE_BERKAS.forEach(row => {

    if (tahun || bulan) {
      const tgl = new Date(row["Tanggal mulai"]);
      if (isNaN(tgl)) return;

      if (tahun && tahun !== "all" && tgl.getFullYear() !== Number(tahun)) return;
      if (bulan && bulan !== "all" && (tgl.getMonth() + 1) !== Number(bulan)) return;
    }

    const key = row[field] || "Tidak Diketahui";
    hasil[key] = (hasil[key] || 0) + 1;
  });

  return Object.entries(hasil)
    .map(([label, jumlah]) => ({ label, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);
}

/* ======================================================
   LOAD & RENDER REKAP PERMOHONAN
====================================================== */
function loadRekapPermohonan() {

  if (!window.CACHE_READY) return;

  const tahun = document.getElementById("tahunSelect")?.value;
  const bulan = document.getElementById("bulanSelect")?.value;

  const data = rekapByField({
    field: "Jenis permohonan",
    tahun,
    bulan
  });

  renderPermohonanChart(
    data.map(d => d.label),
    data.map(d => d.jumlah)
  );

  renderPermohonanLegend(data);
}

/* ======================================================
   RENDER CHART (HORIZONTAL BAR)
====================================================== */
function renderPermohonanChart(labels, values) {

  const canvas = document.getElementById("permohonanChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (permohonanChartInstance) {
    permohonanChartInstance.destroy();
  }

  const colors = labels.map(
    (_, i) => PERMOHONAN_COLORS[i % PERMOHONAN_COLORS.length]
  );

  permohonanChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} permohonan`
          }
        }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

/* ======================================================
   RENDER LEGEND (KLIK AKTIF)
====================================================== */
function renderPermohonanLegend(data) {

  const box = document.getElementById("permohonanLegend");
  if (!box) return;

  box.innerHTML = "";
  let total = 0;

  data.forEach((d, i) => {
    total += d.jumlah;

    box.innerHTML += `
      <div class="flex justify-between items-center border-b py-1 text-sm
                  cursor-pointer hover:bg-blue-50"
           onclick="lihatDetailPermohonan('${d.label}')">
        <span>${i + 1}. ${d.label}</span>
        <span class="font-semibold">${d.jumlah}</span>
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
   DETAIL TABEL PERMOHONAN
====================================================== */
function lihatDetailPermohonan(jenis) {

  const container = document.getElementById("permohonanDetailContainer");
  const body = document.getElementById("permohonanDetailBody");
  const title = document.getElementById("permohonanDetailTitle");

  if (!container || !body) return;

  const tahun = document.getElementById("tahunSelect")?.value;
  const bulan = document.getElementById("bulanSelect")?.value;

  title.innerText = jenis;
  body.innerHTML = "";
  container.classList.remove("hidden");

  cacheDetailPermohonan = window.CACHE_BERKAS.filter(row => {

    if (row["Jenis permohonan"] !== jenis) return false;

    const tgl = new Date(row["Tanggal mulai"]);
    if (isNaN(tgl)) return false;

    if (tahun && tahun !== "all" && tgl.getFullYear() !== Number(tahun)) {
      return false;
    }

    if (bulan && bulan !== "all" && (tgl.getMonth() + 1) !== Number(bulan)) {
      return false;
    }

    return true;
  });

  if (!cacheDetailPermohonan.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-gray-400">
          Tidak ada data
        </td>
      </tr>`;
    return;
  }

  cacheDetailPermohonan.forEach((row, i) => {
    body.innerHTML += `
      <tr>
        <td class="border px-2 py-1">${i + 1}</td>
        <td class="border px-2 py-1">${row["Nomor berkas"] || "-"}</td>
        <td class="border px-2 py-1">${row["Nama Pemohon"] || "-"}</td>
        <td class="border px-2 py-1">${row["Desa/Kecamatan"] || "-"}</td>
        <td class="border px-2 py-1">${row["Status Berkas"] || "-"}</td>
        <td class="border px-2 py-1">${row["Posisi terakhir"] || "-"}</td>
      </tr>
    `;
  });

  container.scrollIntoView({ behavior: "smooth" });
}
/* ======================================================
   DOWNLOAD EXCEL DETAIL PERMOHONAN
====================================================== */
function downloadExceljenispermohonan() {

  if (!cacheDetailPermohonan.length) {
    alert("Tidak ada data untuk diunduh");
    return;
  }

  const excelData = cacheDetailPermohonan.map(row => ({
    "Nomor Berkas": row["Nomor berkas"],
    "Nama Pemohon": row["Nama Pemohon"],
    "Jenis Permohonan": row["Jenis permohonan"],
    "Desa / Kecamatan": row["Desa/Kecamatan"],
    "Status": row["Status Berkas"],
    "Posisi Terakhir": row["Posisi terakhir"]
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Berkas per Seksi");

  XLSX.writeFile(
    wb,
    `berkas-jenispermohonan-${new Date().toISOString().slice(0,10)}.xlsx`
  );
}
/* ======================================================
   INIT DASHBOARD (WAJIB DIPANGGIL ROUTER)
====================================================== */
function initDashboardPermohonan() {

  const canvas = document.getElementById("permohonanChart");
  if (!canvas) return;

  // 🔥 RESET CHART JIKA ADA
  if (permohonanChartInstance) {
    permohonanChartInstance.destroy();
    permohonanChartInstance = null;
  }

  // 🔥 RESET DETAIL
  cacheDetailPermohonan = [];

  loadCacheBerkas().then(() => {
    initTahunDropdown();
    loadRekapPermohonan();
  });

  // 🔥 PASANG ULANG EVENT (AMAN KARENA DOM BARU)
  const tahunSelect = document.getElementById("tahunSelect");
  const bulanSelect = document.getElementById("bulanSelect");

  if (tahunSelect) {
    tahunSelect.onchange = loadRekapPermohonan;
  }

  if (bulanSelect) {
    bulanSelect.onchange = loadRekapPermohonan;
  }
}

/* ======================================================
   TUTUP DETAIL
====================================================== */
function tutupDetailPermohonan() {

  const container = document.getElementById("permohonanDetailContainer");
  const body = document.getElementById("permohonanDetailBody");

  if (!container) return;

  container.classList.add("hidden");
  if (body) body.innerHTML = "";
  cacheDetailPermohonan = [];

  document.getElementById("permohonanChart")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}
