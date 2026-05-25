const API_URL = window.APP_CONFIG?.API_WEB;
if (!API_URL) {
  console.error("❌ APP_CONFIG.API_WEB belum diset");
}

function initDaftarPloting() {
  console.log("INIT: Daftar Ploting 📊");

  initTabDaftarPloting();
  initFilterDaftarPloting();
  initDownloadExcelDaftarPloting();
  initDaftarEmailTab();

  loadDaftarPloting();
  loadDaftarEmail();
}

function initTabDaftarPloting() {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) =>
        b.classList.remove("text-blue-600", "border-b-2", "border-blue-600")
      );
      contents.forEach((c) => c.classList.add("hidden"));

      btn.classList.add("text-blue-600", "border-b-2", "border-blue-600");
      document.getElementById(btn.dataset.tab)?.classList.remove("hidden");
    });
  });
}

function loadDaftarPloting() {
  const url = `${API_URL}?action=daftarPlot_getPlot`;
  console.log("FETCH:", url);

  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      console.log("RESPONSE API:", res);

      let data = [];

      if (Array.isArray(res)) {
        data = res;
      } else if (res.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else {
        console.error("FORMAT DATA TIDAK DIKENALI:", res);
        alert("Format data tidak dikenali");
        return;
      }

      console.log("DATA FINAL:", data);
      console.log("JUMLAH DATA:", data.length);

      GLOBAL_DATA_PLOTING = data;
      FILTERED_DATA_PLOTING = data;

      renderTablePloting(GLOBAL_DATA_PLOTING);
      initFilterTanggalPloting();
    })
    .catch((err) => {
      console.error("ERROR:", err);
      alert("Koneksi gagal");
    });
}

function formatTanggal(value) {
  if (!value) return "";

  if (typeof value === "string" && value.includes("/")) {
    return value;
  }

  if (typeof value === "string" && value.includes("T")) {
    value = value.replace("T", " ").split(".")[0];
  }

  const d = new Date(value);
  if (isNaN(d)) return value;

  const tgl = String(d.getDate()).padStart(2, "0");
  const bln = String(d.getMonth() + 1).padStart(2, "0");
  const thn = d.getFullYear();
  const jam = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${tgl}/${bln}/${thn} ${jam}:${min}`;
}
function renderTablePloting(data) {
  const tbody = document.querySelector("#tab-plot tbody");
  tbody.innerHTML = "";

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
      ${row
        .map((col, idx) => {
          if (idx === 14) {
            col = formatTanggal(col);
          }

          return `
          <td class="border px-1 py-1">${col ?? ""}</td>
        `;
        })
        .join("")}
    `;
    tbody.appendChild(tr);
  });
}

let GLOBAL_DATA_PLOTING = [];
let FILTERED_DATA_PLOTING = [];

function initFilterTanggalPloting() {
  const filterBulan = document.getElementById("filterBulan");

  const filterTahun = document.getElementById("filterTahun");

  if (!filterBulan || !filterTahun) return;

  const bulanSet = new Set();

  const tahunSet = new Set();

  GLOBAL_DATA_PLOTING.forEach((row) => {
    const tanggal = formatTanggal(row[14]);

    if (!tanggal) return;

    const p = tanggal.split(" ")[0].split("/");

    if (p.length < 3) return;

    bulanSet.add(p[1]);

    tahunSet.add(p[2]);
  });

  const namaBulan = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
  };

  filterBulan.innerHTML = `<option value="">
      Semua Bulan
    </option>`;

  filterTahun.innerHTML = `<option value="">
      Semua Tahun
    </option>`;

  [...bulanSet].sort().forEach((bulan) => {
    filterBulan.innerHTML += `
        <option value="${bulan}">
          ${namaBulan[bulan]}
        </option>
      `;
  });

  [...tahunSet]
    .sort()
    .reverse()
    .forEach((tahun) => {
      filterTahun.innerHTML += `
        <option value="${tahun}">
          ${tahun}
        </option>
      `;
    });

  function applyFilterTanggal() {
    const bulan = filterBulan.value;

    const tahun = filterTahun.value;

    FILTERED_DATA_PLOTING = GLOBAL_DATA_PLOTING.filter((row) => {
      const tanggal = formatTanggal(row[14]);

      if (!tanggal) return false;

      const p = tanggal.split(" ")[0].split("/");

      if (p.length < 3) return false;

      return (!bulan || p[1] === bulan) && (!tahun || p[2] === tahun);
    });

    renderTablePloting(FILTERED_DATA_PLOTING);
  }

  /* CEGAH DOBEL */

  if (!filterBulan.dataset.ready) {
    filterBulan.dataset.ready = "1";

    filterBulan.addEventListener("change", applyFilterTanggal);

    filterTahun.addEventListener("change", applyFilterTanggal);
  }
}

function initFilterDaftarPloting() {
  const btnCari = document.getElementById("btnCari");
  const btnReset = document.getElementById("btnReset");

  if (!btnCari || !btnReset) return;

  btnCari.addEventListener("click", () => {
    const inputNoHak = document
      .getElementById("filterNoHak")
      .value.toLowerCase();
    const inputDesa = document.getElementById("filterDesa").value.toLowerCase();

    const hasil = GLOBAL_DATA_PLOTING.filter((row) => {
      const rawNoHak = (row[9] || "").toString().toLowerCase();

      const cleanNoHak = rawNoHak.replace(/[^\d]/g, "");
      const cleanInput = inputNoHak.replace(/[^\d]/g, "");

      const desa = (row[12] || "").toString().toLowerCase();

      const cocokNoHak =
        rawNoHak.includes(inputNoHak) || cleanNoHak.includes(cleanInput);

      const cocokDesa = desa.includes(inputDesa);

      return cocokNoHak && cocokDesa;
    });

    renderTablePloting(hasil);
  });

  btnReset.addEventListener("click", () => {
    document.getElementById("filterNoHak").value = "";
    document.getElementById("filterDesa").value = "";
    renderTablePloting(GLOBAL_DATA_PLOTING);
  });
}

function initDownloadExcelDaftarPloting() {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.innerText.includes("Download Excel")
  );

  if (!btn) return;

  btn.addEventListener("click", () => {
    const dataExport = FILTERED_DATA_PLOTING.length
      ? FILTERED_DATA_PLOTING
      : GLOBAL_DATA_PLOTING;

    const headers = [
      "No Plotting",
      "Email Address",
      "Link Lokasi Tanah",
      "Lampiran Kepemilikan",
      "Nama Pemilik",
      "Tanggal Lahir",
      "No Telepon",
      "Jenis Permohonan",
      "Jenis Kepemilikan",
      "No HM / HGB / Wakaf",
      "NIB",
      "Surat Ukur",
      "Desa / Kecamatan",
      "Petugas Plotting",
      "Tanggal Proses",
      "Validasi SU",
      "Validasi NIB",
      "Plotting Pemetaan",
      "Keterangan",
    ];

    // FORMAT DATA AGAR SAMA DENGAN TABEL WEB
    const rows = dataExport.map((row) => {
      const newRow = [...row];

      // FORMAT TANGGAL PROSES
      newRow[14] = formatTanggal(newRow[14]);

      // FORMAT NIB AGAR TIDAK MENJADI SCIENTIFIC
      newRow[10] = "'" + (newRow[10] ?? "");

      return newRow;
    });

    const finalData = [headers, ...rows];

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet(finalData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar_Ploting");

    const filename = `Daftar_Ploting_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, filename);
  });
}

function loadDaftarEmail() {
  fetch(`${API_URL}?action=daftarPlot_getEmail`)
    .then((res) => res.json())
    .then((res) => {
      console.log("RESP EMAIL:", res);

      if (!res.success || !Array.isArray(res.data)) {
        alert("Format data daftar email tidak valid");
        return;
      }

      const tbody = document.querySelector("#tab-email tbody");
      tbody.innerHTML = "";

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
      initSearchEmail();
    })
    .catch((err) => {
      console.error("LOAD EMAIL ERROR:", err);
      alert("Koneksi gagal");
    });
}
function initSearchEmail() {
  const input = document.getElementById("searchEmail");
  if (!input) return;

  if (input.dataset.searchReady) return;
  input.dataset.searchReady = "1";

  input.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const rows = document.querySelectorAll("#tab-email tbody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();

      row.style.display = text.includes(keyword) ? "" : "none";
    });
  });
}

function initDaftarEmailTab() {
  const tableBody = document.querySelector("#tab-email tbody");
  const btnTambah = [...document.querySelectorAll("button")].find((b) =>
    b.innerText.includes("Tambah Email")
  );

  if (!tableBody || !btnTambah) return;

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
        telp,
      },
      loadDaftarEmail
    );
  });

  tableBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;

    const sheetRow = tr.rowIndex + 1;

    if (e.target.classList.contains("edit-email")) {
      const email = prompt("Alamat Email:", tr.cells[1].innerText);
      const nama = prompt("Nama Notaris:", tr.cells[2].innerText);
      const telp = prompt("No Telp:", tr.cells[3].innerText);

      if (!email || !nama || !telp) return;

      postAPI(
        {
          action: "daftarPlot_updateEmail",
          row: sheetRow,
          email,
          nama,
          telp,
        },
        loadDaftarEmail
      );
    }

    if (e.target.classList.contains("delete-email")) {
      if (!confirm("Yakin ingin menghapus email ini?")) return;

      postAPI(
        {
          action: "daftarPlot_deleteEmail",
          row: sheetRow,
        },
        loadDaftarEmail
      );
    }
  });
}

function postAPI(payload, callback) {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) {
        alert("Operasi gagal");
        return;
      }
      if (typeof callback === "function") callback();
    })
    .catch((err) => {
      console.error("POST ERROR:", err);
      alert("Koneksi gagal");
    });
}
