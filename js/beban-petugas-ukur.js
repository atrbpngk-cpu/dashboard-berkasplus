/* ======================================================
   GLOBAL STATE
====================================================== */

let modeBebanUkur = "personal";   // personal | monitoring
let selectedPetugas = "";         // dipakai saat monitoring
let bebanUkurData = [];           // untuk Excel

/* ==============================
   RENDER TABLE (WAJIB DI SINI)
============================== */
function renderTableBebanUkur(rows) {
  const tbody = document.getElementById("tableBody"); // ✅ HARUS INI

  if (!tbody) {
    console.error("tbody tableBody tidak ditemukan");
    return;
  }

  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-6 text-gray-400 italic">
          Tidak ada data
        </td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  rows.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-3 py-1">${row["Nomor berkas"] || "-"}</td>
      <td class="border px-3 py-1">${row["Nama Pemohon"] || "-"}</td>
      <td class="border px-3 py-1">${row["Jenis permohonan"] || "-"}</td>
      <td class="border px-3 py-1">${row["Desa/Kecamatan"] || "-"}</td>
      <td class="border px-3 py-1">${row["Petugas ukur"] || "-"}</td>
      <td class="border px-3 py-1">${row["Posisi terakhir"] || "-"}</td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

/* ======================================================
   INIT HALAMAN
====================================================== */

function initBebanPetugasUkur(mode = "personal") {

  modeBebanUkur = mode;

  if (mode === "monitoring") {
    loadDropdownPetugas(); // dropdown akan trigger load sendiri
  } else {
    loadBebanPetugasUkur();
  }
}

/* ======================================================
   LOAD DATA DARI API
====================================================== */

function loadBebanPetugasUkur() {

  if (!window.APP_CONFIG?.API_WEB) return;

  const userData  = JSON.parse(localStorage.getItem("user") || "{}");
  const userLogin = (userData.nama || "").trim();

  fetch(`${APP_CONFIG.API_WEB}?action=bebanPU`)

    .then(res => res.json())
    .then(res => {

      if (!res.success || !Array.isArray(res.data)) {
        ///console.warn("API bebanPU gagal", res);
        return;
      }

      const data = res.data;
      ///console.log("DATA API =", data);

      let total = 0;
      let proses = 0;
      let selesai = 0;

      const filteredRows = data.filter(row => {
        const petugas = (row["Petugas ukur"] || "").trim();

        if (modeBebanUkur === "personal") {
          return petugas === userLogin;
        }

        return !selectedPetugas || petugas === selectedPetugas;
      });

      total = filteredRows.length;

      bebanUkurData = filteredRows.map(row => {
        const posisi = (row["Posisi terakhir"] || "").trim();

        if (posisi) {
          posisi.includes("Seksi Survei dan Pemetaan")
            ? proses++
            : selesai++;
        }

        return {
          nomor: row["Nomor berkas"] || "-",
          pemohon: row["Nama Pemohon"] || "-",
          jenis: row["Jenis permohonan"] || "-",
          desa: row["Desa/Kecamatan"] || "-",
          petugas: row["Petugas ukur"] || "-",
          posisi: posisi || "Belum Diproses"
        };
      });

      renderTableBebanUkur(filteredRows);

      document.getElementById("totalData").innerText   = total;
      document.getElementById("prosesData").innerText  = proses;
      document.getElementById("selesaiData").innerText = selesai;

      const persen = total ? Math.round((selesai / total) * 100) : 0;
      document.getElementById("progressBar").style.width = persen + "%";
      document.getElementById("progressText").innerText  = persen + "%";
    })
    .catch(err => console.error("Beban Petugas Ukur Error:", err));
}

/* ======================================================
   RENDER PERSONAL (5 KOLOM)
====================================================== */

function renderPersonal(tbody, row, posisi) {

  tbody.innerHTML += `
    <tr>
      <td class="border px-3 py-2">${row["Nomor berkas"] || "-"}</td>
      <td class="border px-3 py-2">${row["Nama Pemohon"] || "-"}</td>
      <td class="border px-3 py-2">${row["Jenis permohonan"] || "-"}</td>
      <td class="border px-3 py-2">${row["Desa/Kecamatan"] || "-"}</td>
      <td class="border px-3 py-2">
        ${posisi
          ? posisi
          : "<span class='text-gray-400 italic'>Belum Diproses</span>"}
      </td>
    </tr>
  `;
}


/* ======================================================
   RENDER MONITORING (6 KOLOM)
====================================================== */

function renderMonitoring(tbody, row, posisi, petugasSheet) {

  tbody.innerHTML += `
    <tr>
      <td class="border px-3 py-2">${row["Nomor berkas"] || "-"}</td>
      <td class="border px-3 py-2">${row["Nama Pemohon"] || "-"}</td>
      <td class="border px-3 py-2">${row["Jenis permohonan"] || "-"}</td>
      <td class="border px-3 py-2">${row["Desa/Kecamatan"] || "-"}</td>
      <td class="border px-3 py-2">${petugasSheet || "-"}</td>
      <td class="border px-3 py-2">
        ${posisi
          ? posisi
          : "<span class='text-gray-400 italic'>Belum Diproses</span>"}
      </td>
    </tr>
  `;
}


/* ======================================================
   DOWNLOAD EXCEL
====================================================== */

function downloadExcelBebanUkur() {

  if (typeof XLSX === "undefined") {
    alert("Library Excel belum termuat.");
    return;
  }

  if (!bebanUkurData.length) {
    alert("Tidak ada data untuk didownload.");
    return;
  }

  const excelData = bebanUkurData.map(row => ({
    "Nomor Berkas": row.nomor,
    "Nama Pemohon": row.pemohon,
    "Jenis Permohonan": row.jenis,
    "Desa / Kecamatan": row.desa,
    "Petugas Ukur": row.petugas,
    "Posisi": row.posisi
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Beban Petugas Ukur");

  XLSX.writeFile(
    workbook,
    `beban-petugas-ukur-${new Date().toISOString().slice(0,10)}.xlsx`
  );
}


/* ======================================================
   LOAD DROPDOWN (MONITORING)
====================================================== */

function loadDropdownPetugas() {

  fetch(`${APP_CONFIG.API_WEB}?action=petugasUkur`)
    .then(res => res.json())
    .then(res => {

      if (!res.success) return;

      const select = document.getElementById("selectPetugasUkur");
      if (!select) return;

      select.innerHTML = `<option value="">Semua Petugas</option>`;

      res.data.forEach(nama => {
        select.innerHTML += `<option value="${nama}">${nama}</option>`;
      });

      selectedPetugas = "";
      loadBebanPetugasUkur();
    });
}


/* ======================================================
   FILTER MONITORING
====================================================== */

function filterMonitoringPetugas() {

  const select = document.getElementById("selectPetugasUkur");
  selectedPetugas = select.value;

  loadBebanPetugasUkur();
}
