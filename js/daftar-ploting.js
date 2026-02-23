/* ======================================================
   DAFTAR PLOTING - FRONTEND (FINAL PRODUKSI)
   - SPA ROUTER
   - API ROUTER APPS SCRIPT
   - APP_CONFIG GLOBAL
====================================================== */

/* ===============================
   API CONFIG (GLOBAL)
=============================== */
const API_URL = window.APP_CONFIG?.API_WEB;
if (!API_URL) {
  console.error("❌ APP_CONFIG.API_WEB belum diset");
}

/* ======================================================
   INIT (DIPANGGIL DARI ROUTER SPA)
====================================================== */
function initDaftarPloting() {
  console.log("INIT: Daftar Ploting 📊");

  initTabDaftarPloting();
  initFilterDaftarPloting();
  initDownloadExcelDaftarPloting();
  initDaftarEmailTab();

  loadDaftarPloting();
  loadDaftarEmail();
}

/* ======================================================
   TAB SWITCHING
====================================================== */
function initTabDaftarPloting() {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b =>
        b.classList.remove("text-blue-600", "border-b-2", "border-blue-600")
      );
      contents.forEach(c => c.classList.add("hidden"));

      btn.classList.add("text-blue-600", "border-b-2", "border-blue-600");
      document.getElementById(btn.dataset.tab)?.classList.remove("hidden");
    });
  });
}

/* ======================================================
   TAB 1 : LOAD DATA PLOTING (API)
====================================================== */
function loadDaftarPloting() {
  const noHak = document.getElementById("filterNoHak")?.value || "";
  const desa  = document.getElementById("filterDesa")?.value || "";

  const url = `${API_URL}?action=daftarPlot_getPlot&noHak=${encodeURIComponent(noHak)}&desa=${encodeURIComponent(desa)}`;
  console.log("FETCH:", url);

  fetch(url)
    .then(res => res.json())
    .then(res => {
      if (!res.success || !res.data || !Array.isArray(res.data.data)) {
        console.error("FORMAT DATA API SALAH:", res);
        alert("Format data dari API tidak valid");
        return;
      }
      renderTablePloting(res.data.data);
    })
    .catch(err => {
      console.error("API ERROR:", err);
      alert("Koneksi API gagal");
    });
}

/* ======================================================
   RENDER TABLE PLOTING
====================================================== */
function renderTablePloting(data) {
  const tbody = document.querySelector("#tab-plot tbody");
  tbody.innerHTML = "";

  // DATA KOSONG
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="20" class="text-center text-gray-500 py-4">
          Belum ada data plotting
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-1 py-1 text-center">${i + 1}</td>
      ${row.map(col => `
        <td class="border px-1 py-1">${col ?? ""}</td>
      `).join("")}
    `;
    tbody.appendChild(tr);
  });
}

/* ======================================================
   TAB 1 : FILTER (SERVER SIDE)
====================================================== */
function initFilterDaftarPloting() {
  const btnCari = document.getElementById("btnCari");
  const btnReset = document.getElementById("btnReset");

  if (!btnCari || !btnReset) return;

  btnCari.addEventListener("click", loadDaftarPloting);

  btnReset.addEventListener("click", () => {
    document.getElementById("filterNoHak").value = "";
    document.getElementById("filterDesa").value = "";
    loadDaftarPloting();
  });
}

/* ======================================================
   TAB 1 : DOWNLOAD EXCEL (CSV CLIENT SIDE)
====================================================== */
/* ======================================================
   TAB 1 : DOWNLOAD EXCEL (.XLSX) - FINAL
====================================================== */
function initDownloadExcelDaftarPloting() {
  const btn = [...document.querySelectorAll("button")]
    .find(b => b.innerText.includes("Download Excel"));

  if (!btn) return;

  btn.addEventListener("click", () => {
    const table = document.querySelector("#tab-plot table");
    if (!table) {
      alert("Tabel tidak ditemukan");
      return;
    }

    // 1️⃣ Ambil data dari table HTML
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table, {
      raw: true
    });

    // 2️⃣ Nama sheet
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Daftar_Ploting"
    );

    // 3️⃣ Nama file
    const filename = `Daftar_Ploting_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    // 4️⃣ Download
    XLSX.writeFile(workbook, filename);
  });
}
/* ======================================================
   TAB 2 : LOAD DAFTAR EMAIL (API)
====================================================== */
function loadDaftarEmail() {
  fetch(`${API_URL}?action=daftarPlot_getEmail`)
    .then(res => res.json())
    .then(res => {
      console.log("RESP EMAIL:", res);

      // ✅ FORMAT YANG BENAR
      if (!res.success || !Array.isArray(res.data)) {
        alert("Format data daftar email tidak valid");
        return;
      }

      const tbody = document.querySelector("#tab-email tbody");
      tbody.innerHTML = "";

      // DATA KOSONG
      if (res.data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-gray-500 py-4">
              Belum ada data email
            </td>
          </tr>
        `;
        return;
      }

      res.data.forEach((row, i) => {
        tbody.innerHTML += `
          <tr>
            <td class="border px-2 py-1 text-center">${i + 1}</td>
            <td class="border px-2 py-1">${row[0] ?? ""}</td>
            <td class="border px-2 py-1">${row[1] ?? ""}</td>
            <td class="border px-2 py-1">${row[2] ?? ""}</td>
            <td class="border px-2 py-1 text-center space-x-1">
              <button class="edit-email bg-yellow-500 text-white px-2 py-0.5 rounded">✏️</button>
              <button class="delete-email bg-red-500 text-white px-2 py-0.5 rounded">🗑️</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error("LOAD EMAIL ERROR:", err);
      alert("Koneksi API gagal");
    });
}
/* ======================================================
   TAB 2 : CRUD DAFTAR EMAIL (API) - FINAL & AMAN
====================================================== */
function initDaftarEmailTab() {
  const tableBody = document.querySelector("#tab-email tbody");
  const btnTambah = [...document.querySelectorAll("button")]
    .find(b => b.innerText.includes("Tambah Email"));

  if (!tableBody || !btnTambah) return;

  // ===============================
  // TAMBAH EMAIL
  // ===============================
  btnTambah.addEventListener("click", () => {
    const email = prompt("Alamat Email:");
    if (!email) return;

    const nama = prompt("Nama Notaris:");
    if (!nama) return;

    const telp = prompt("No Telp:");
    if (!telp) return;

    postAPI(
      {
        action: "daftarPlot_addEmail",
        email,
        nama,
        telp
      },
      loadDaftarEmail
    );
  });

  // ===============================
  // EDIT & HAPUS EMAIL
  // ===============================
  tableBody.addEventListener("click", e => {
    const tr = e.target.closest("tr");
    if (!tr) return;

    // 🔑 KONVERSI YANG BENAR
    // HTML rowIndex → Sheet row (skip header)
    const sheetRow = tr.rowIndex + 1;

    // ===== EDIT =====
    if (e.target.classList.contains("edit-email")) {
      const email = prompt("Alamat Email:", tr.cells[1].innerText);
      const nama  = prompt("Nama Notaris:", tr.cells[2].innerText);
      const telp  = prompt("No Telp:", tr.cells[3].innerText);

      if (!email || !nama || !telp) return;

      postAPI(
        {
          action: "daftarPlot_updateEmail",
          row: sheetRow,   // ✅ BENAR
          email,
          nama,
          telp
        },
        loadDaftarEmail
      );
    }

    // ===== DELETE =====
    if (e.target.classList.contains("delete-email")) {
      if (!confirm("Yakin ingin menghapus email ini?")) return;

      postAPI(
        {
          action: "daftarPlot_deleteEmail",
          row: sheetRow    // ✅ BENAR
        },
        loadDaftarEmail
      );
    }
  });
}

/* ======================================================
   UTIL : POST API
====================================================== */
function postAPI(payload, callback) {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        alert("Operasi gagal");
        return;
      }
      if (typeof callback === "function") callback();
    })
    .catch(err => {
      console.error("POST API ERROR:", err);
      alert("Koneksi API gagal");
    });
}