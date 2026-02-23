// ======================================================
// LOCAL STAGING UPLOAD DI302
// ======================================================
let STAGING_DATA = [];

// ======================================================
// INIT
// ======================================================
function initUploadBerkas() {
  console.log("INIT Upload Berkas (LOCAL)");


  const btnDownload = document.getElementById("btnDownloadPreview");
    if (btnDownload) btnDownload.onclick = downloadPreview;
  const fileInput  = document.getElementById("fileExcel");
  const btnUpload  = document.getElementById("btnUpload");
  const btnCancel  = document.getElementById("btnCancel");
  const btnImport  = document.getElementById("btnImport");
  const resultBox  = document.getElementById("uploadResult");
  const previewSec = document.getElementById("previewSection");
  const previewTbl = document.getElementById("previewTable");

  if (!fileInput || !btnUpload) {
    console.warn("Upload Berkas: elemen tidak ada");
    return;
  }

  btnUpload.onclick = handleUpload;
  btnCancel.onclick = resetAll;
  if (btnImport) btnImport.onclick = importToServer;

  // ==================================================
  // UPLOAD & PARSE EXCEL
  // ==================================================
  function handleUpload() {
    if (!fileInput.files.length) {
      alert("Pilih file Excel terlebih dahulu");
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: "A", defval: "" });
      processRows(rows);
    };
    reader.readAsBinaryString(fileInput.files[0]);
  }

  // ==================================================
  // VALIDASI & EKSTRAK DI302
  // ==================================================
  function processRows(rows) {
    STAGING_DATA = [];
    const nomorSet = new Set();
    const tahun = new Date().getFullYear();

    rows.slice(1).forEach(r => {
      const rawR = String(r.R || "").toLowerCase();

      // ❌ selesai / selesai diserahkan
      if (rawR.includes("selesai")) return;

      // ambil nomor/tahun
      let match = rawR.match(/\d+\/\d{4}/);
      let nomor = match
        ? match[0]
        : rawR.match(/^\d+$/)
          ? `${rawR}/${tahun}`
          : null;

      if (!nomor || nomorSet.has(nomor)) return;
      nomorSet.add(nomor);

      STAGING_DATA.push({
        tanggal: r.C || "",
        nomor,
        pemohon: r.D || "",
        jenis: r.F || "",
        desa: `${r.G || ""}/${r.H || ""}`.replace(/^\/|\/$/g, ""),
        petugas: r.K || ""
      });
    });

    renderPreview();
  }

  // ==================================================
  // PREVIEW
  // ==================================================
  function renderPreview() {
    previewTbl.innerHTML = "";

    STAGING_DATA.forEach(r => {
      previewTbl.innerHTML += `
        <tr class="bg-green-50">
          <td class="border px-2">${r.tanggal}</td>
          <td class="border px-2">${r.nomor}</td>
          <td class="border px-2">${r.pemohon}</td>
          <td class="border px-2">${r.jenis}</td>
          <td class="border px-2">${r.desa}</td>
          <td class="border px-2">${r.petugas}</td>
        </tr>`;
    });

    resultBox.innerHTML =
      `✔ Preview lokal selesai | Total valid: <b>${STAGING_DATA.length}</b>`;
    previewSec.classList.remove("hidden");
  }

  // ==================================================
  // RESET
  // ==================================================
  function resetAll() {
    STAGING_DATA = [];
    previewTbl.innerHTML = "";
    previewSec.classList.add("hidden");
    fileInput.value = "";
    resultBox.innerHTML = "";
  }
}

// ======================================================
// IMPORT DATA KE SERVER (GLOBAL)
// ======================================================
function importToServer() {
  if (!STAGING_DATA.length) {
    alert("Tidak ada data preview untuk diimport");
    return;
  }

  // ===============================
  // BUAT EXCEL DARI HASIL PREVIEW
  // ===============================
  const data = [
    [
      "Tanggal Mulai",
      "Nomor Berkas",
      "Nama Pemohon",
      "Jenis Permohonan",
      "Desa/Kecamatan",
      "Petugas Ukur"
    ],
    ...STAGING_DATA.map(r => [
      r.tanggal,
      r.nomor,
      r.pemohon,
      r.jenis,
      r.desa,
      r.petugas
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DI302_FINAL");

  // ===============================
  // KONVERSI KE BLOB
  // ===============================
  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  // ===============================
  // UPLOAD KE DRIVE
  // ===============================
  const formData = new FormData();
  formData.append("action", "uploadDI302");
  formData.append("file", blob, `DI302_FINAL_${new Date().toISOString().slice(0,10)}.xlsx`);

  fetch(window.APP_CONFIG.API_WEB_UPLOAD, {
    method: "POST",
    body: formData
  })
  .then(r => r.json())
  .then(res => {
    if (!res.success) {
      alert(res.message || "Gagal upload ke Drive");
      return;
    }

    alert(
      `✅ Import berhasil\n` +
      `File FINAL disimpan di folder UPLOAD302`
    );

    // reset
    STAGING_DATA = [];
    document.getElementById("previewSection").classList.add("hidden");
  })
  .catch(err => {
    console.error(err);
    alert("Gagal upload hasil preview ke server");
  });
}

// ======================================================
// DOWNLOAD PREVIEW KE EXCEL
// ======================================================
function downloadPreview() {
    if (!STAGING_DATA || !STAGING_DATA.length) {
      alert("Tidak ada data preview untuk diunduh");
      return;
    }
  
    // Susun data dengan header
    const data = [
      [
        "Tanggal Mulai",
        "Nomor Berkas",
        "Nama Pemohon",
        "Jenis Permohonan",
        "Desa/Kecamatan",
        "Petugas Ukur"
      ],
      ...STAGING_DATA.map(r => [
        r.tanggal,
        r.nomor,
        r.pemohon,
        r.jenis,
        r.desa,
        r.petugas
      ])
    ];
  
    // Buat worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
  
    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Preview Import");
  
    // Nama file
    const filename = `Preview_Import_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
  
    // Download
    XLSX.writeFile(wb, filename);
  }
  
// ======================================================
// CURRENT USER
// ======================================================
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}
