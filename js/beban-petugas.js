/* ======================================================
   DATA GLOBAL
====================================================== */

let dataBeban = [];
let filteredData = [];
let pieChartInstance = null;

/* ======================================================
   INIT HALAMAN BEBAN PETUGAS
====================================================== */

function initBebanPetugas() {
  loadBebanFromAPI("pieChart", "pieLegend", true);
}

/* ======================================================
   INIT DASHBOARD VERSION
====================================================== */

function initDashboardBeban() {
  loadBebanFromAPI("dashboardPieChart", "dashboardPieLegend", false);
}

/* ======================================================
   LOAD DATA DARI API
====================================================== */

function loadBebanFromAPI(canvasId, legendId, withDropdown) {

  if (!window.APP_CONFIG?.API_WEB) return;

  fetch(`${APP_CONFIG.API_WEB}?action=beban`)
    .then(r => r.json())
    .then(res => {

      if (!res.success) return;

      // 🔥 SIMPAN FULL DATA (termasuk detail)
      dataBeban = res.data?.data || [];

      renderBebanChart(canvasId, legendId);
      // 🔥 TAMBAHAN
      if (document.getElementById("totalBerkasProses")) {
        updateDashboardUserTotal();
      }
      
      if (document.getElementById("targetHariIni")) {
        updateDashboardTargetHariIni();
      }
      
      if (document.getElementById("presentaseKinerja")) {
        updateDashboardKinerja();
      }
      

      if (withDropdown) {
        loadDropdown();
      }

    })
    .catch(err => {
      console.error("API BEBAN ERROR:", err);
    });
}

/* ======================================================
   UPDATE DASHBOARD TOTAL USER
====================================================== */

function updateDashboardUserTotal() {

  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();

  if (!namaUser || !dataBeban) return;

  const userData = dataBeban.find(
    item => item.petugas === namaUser
  );

  const totalUser = userData ? userData.jumlah : 0;

  const el = document.getElementById("totalBerkasProses");
  if (el) el.innerText = totalUser;
}
/* ======================================================
   UPDATE DASHBOARD TARGET HARI INI (Overdue ≥ 3 Hari)
====================================================== */

function updateDashboardTargetHariIni() {

  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();

  if (!namaUser || !dataBeban) return;

  const userData = dataBeban.find(
    item => item.petugas === namaUser
  );

  if (!userData || !userData.detail) return;

  const today = new Date();
  let totalTarget = 0;

  userData.detail.forEach(item => {

    if (!item.tanggalKirim) return;

    const tglKirim = new Date(item.tanggalKirim);
    const selisihHari = Math.floor(
      (today.setHours(0,0,0,0) - new Date(tglKirim).setHours(0,0,0,0))
      / (1000 * 60 * 60 * 24)
    );
    

    if (selisihHari >= 3) {
      totalTarget++;
    }

  });

  const el = document.getElementById("targetHariIni");
  if (el) el.innerText = totalTarget;
}

/* ======================================================
   RENDER PIE CHART
====================================================== */

function renderBebanChart(canvasId, legendId) {

  const canvas = document.getElementById(canvasId);
  const legendBox = document.getElementById(legendId);

  if (!canvas || !legendBox) return;

  const ctx = canvas.getContext("2d");

  const sorted = [...dataBeban].sort((a, b) => b.jumlah - a.jumlah);

  const labels = sorted.map(item => item.petugas);
  const values = sorted.map(item => item.jumlah);

  const totalValue = values.reduce((a,b)=>a+b,0);

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#6366f1"
  ];

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  pieChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });

  /* ===== CUSTOM LEGEND ===== */

  legendBox.innerHTML = "";
  let total = 0;

  sorted.forEach((item, index) => {

    const percent = totalValue > 0
      ? ((item.jumlah / totalValue) * 100).toFixed(1)
      : 0;

    total += item.jumlah;

    legendBox.innerHTML += `
      <div class="flex justify-between items-center border-b pb-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-400">${index + 1}.</span>
          <span style="
            width:10px;
            height:10px;
            background:${colors[index]};
            display:inline-block;
            border-radius:2px;">
          </span>
          ${item.petugas}
        </div>
        <div class="text-right">
          <div class="font-semibold">${item.jumlah}</div>
          <div class="text-xs text-gray-500">${percent}%</div>
        </div>
      </div>
    `;
  });

  legendBox.innerHTML += `
    <div class="flex justify-between font-bold text-blue-600 pt-3">
      <div>Total</div>
      <div>${total}</div>
    </div>
  `;
}

/* ======================================================
   DROPDOWN
====================================================== */

function loadDropdown() {

  const select = document.getElementById("selectPetugas");
  if (!select) return;

  select.innerHTML = `
    <option value="">-- Pilih Petugas --</option>
    <option value="all">Semua Petugas</option>
  `;

  dataBeban.forEach(item => {
    select.innerHTML += `
      <option value="${item.petugas}">
        ${item.petugas}
      </option>
    `;
  });
}

/* ======================================================
   FILTER PETUGAS (DETAIL MODE)
====================================================== */

function filterPetugas() {

  const value = document.getElementById("selectPetugas").value;
  const tableContainer = document.getElementById("tableContainer");

  if (!value) {
    filteredData = [];
    tableContainer.classList.add("hidden");
    document.getElementById("totalBeban").innerText = 0;
    return;
  }

  tableContainer.classList.remove("hidden");

  if (value === "all") {
    filteredData = dataBeban.flatMap(p => p.detail || []);
  } else {
    const found = dataBeban.find(p => p.petugas === value);
    filteredData = found ? (found.detail || []) : [];
  }

  renderBebanTable();
}

/* ======================================================
   RENDER TABLE (DETAIL INFORMASIBERKAS)
====================================================== */

function renderBebanTable() {

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  if (!filteredData || filteredData.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-gray-400">
          Tidak ada data
        </td>
      </tr>
    `;

    document.getElementById("totalBeban").innerText = 0;
    return;
  }

  filteredData.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td class="px-3 py-2 border-b">${row.nomor}</td>
        <td class="px-3 py-2 border-b">${row.pemohon}</td>
        <td class="px-3 py-2 border-b">${row.jenis}</td>
        <td class="px-3 py-2 border-b">${row.desa}</td>
        <td class="px-3 py-2 border-b">${row.petugas}</td>
      </tr>
    `;
  });

  document.getElementById("totalBeban").innerText = filteredData.length;
}

/* ======================================================
   DOWNLOAD EXCEL (DETAIL MODE)
====================================================== */

function downloadExcel() {

  if (typeof XLSX === "undefined") {
    alert("Library Excel belum termuat. Silakan refresh halaman.");
    return;
  }

  if (!filteredData || filteredData.length === 0) {
    alert("Tidak ada data untuk didownload");
    return;
  }

  const excelData = filteredData.map(row => ({
    "Nomor Berkas": row.nomor,
    "Nama Pemohon": row.pemohon,
    "Jenis Permohonan": row.jenis,
    "Desa / Kecamatan": row.desa,
    "Petugas": row.petugas
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Beban Petugas");

  XLSX.writeFile(workbook, `beban-petugas-${new Date().toISOString().slice(0,10)}.xlsx`);
}
/* ======================================================
   LIHAT TARGET HARI INI
====================================================== */

function lihatTargetHariIni() {

  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();

  const userData = dataBeban.find(
    item => item.petugas === namaUser
  );

  if (!userData || !userData.detail) return;

  const today = new Date();

  filteredData = userData.detail.filter(item => {

    if (!item.tanggalKirim) return false;

    const tglKirim = new Date(item.tanggalKirim);
    const selisihHari = Math.floor(
      (today.setHours(0,0,0,0) - new Date(tglKirim).setHours(0,0,0,0))
      / (1000 * 60 * 60 * 24)
    );
    

    return selisihHari >= 3;
  });

  loadPage("beban-petugas.html");

  setTimeout(() => {
    renderBebanTable();
    document.getElementById("tableContainer")
      ?.classList.remove("hidden");
  }, 400);
}

/* ======================================================
   LIHAT BERKAS SAYA (Klik Total Berkas Anda)
====================================================== */

function lihatBerkasSaya() {

  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();

  if (!namaUser || !dataBeban) return;

  const userData = dataBeban.find(
    item => item.petugas === namaUser
  );

  if (!userData) return;

  // ambil semua detail milik user
  filteredData = userData.detail || [];

  // buka halaman beban petugas
  loadPage("beban-petugas.html");

  // tunggu halaman render dulu
  setTimeout(() => {
    renderBebanTable();
    document.getElementById("tableContainer")
      ?.classList.remove("hidden");
  }, 400);
}

/* ======================================================
   HITUNG PRESENTASE KINERJA USER
====================================================== */

function updateDashboardKinerja() {

  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();

  if (!namaUser || !dataBeban) return;

  const userData = dataBeban.find(
    item => item.petugas === namaUser
  );

  if (!userData || !userData.detail) return;

  const today = new Date();

  let tepatWaktu = 0;
  let terlambat  = 0;

  userData.detail.forEach(item => {

    if (!item.tanggalKirim) return;

    const tglKirim = new Date(item.tanggalKirim);

    const selisihHari = Math.floor(
      (today - tglKirim) / (1000 * 60 * 60 * 24)
    );

    if (selisihHari < 3) {
      tepatWaktu++;
    } else {
      terlambat++;
    }

  });

  const total = tepatWaktu + terlambat;

  let persen = 100;

  if (total > 0) {
    persen = Math.round((tepatWaktu / total) * 100);
  }

  const el = document.getElementById("presentaseKinerja");
  if (el) el.innerText = persen + "%";
}
