// ======================================================
// ENTRY DATA BERKAS - FRONTEND (FINAL PRODUKSI)
// ======================================================

let listJenis = [];
let listDesa = [];
let entryInited = false;

/* ======================================================
   INIT
   DIPANGGIL SETELAH PARTIAL entry-data-berkas.html DILOAD
====================================================== */
function initEntryBerkas() {
  if (entryInited) return;
  entryInited = true;

  // load master data
  loadJenisPermohonan();
  loadDesaKecamatan();

  // bind submit
  const form = document.getElementById("form-entry-berkas");
  if (form) {
    form.removeEventListener("submit", submitEntry);
    form.addEventListener("submit", submitEntry);
  }
}

/* ======================================================
   LOAD MASTER DATA
====================================================== */
async function loadJenisPermohonan() {
  try {
    const res = await fetch(
      `${window.APP_CONFIG.API_WEB}?action=jenis`
    );
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) return;

    listJenis = json.data;

    setupComboBox(
      "jenis_permohonan",
      "jenis_permohonan_list",
      listJenis
    );
  } catch (err) {
    console.error("Load jenis permohonan gagal:", err);
  }
}

async function loadDesaKecamatan() {
  try {
    const res = await fetch(
      `${window.APP_CONFIG.API_WEB}?action=desa`
    );
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) return;

    listDesa = json.data;

    setupComboBox(
      "desa_kecamatan",
      "desa_kecamatan_list",
      listDesa
    );
  } catch (err) {
    console.error("Load desa/kecamatan gagal:", err);
  }
}

/* ======================================================
   COMBOBOX (DROPDOWN + AUTOCOMPLETE)
====================================================== */
function setupComboBox(inputId, listId, data) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  // Hindari double-binding
  input.onfocus = null;
  input.oninput = null;

  function render(filter = "") {
    list.innerHTML = "";

    const results = data
      .filter(item =>
        item.toLowerCase().includes(filter.toLowerCase())
      )
      .slice(0, 10);

    results.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.className =
        "px-3 py-2 cursor-pointer hover:bg-blue-100";

      // mousedown = aman dari blur
      li.addEventListener("mousedown", () => {
        input.value = item;
        list.classList.add("hidden");
      });

      list.appendChild(li);
    });

    list.classList.toggle("hidden", results.length === 0);
  }

  // Fokus → dropdown muncul
  input.addEventListener("focus", () => {
    render(input.value);
  });

  // Ketik → filter
  input.addEventListener("input", () => {
    render(input.value);
  });

  // Klik di luar → tutup dropdown
  document.addEventListener("mousedown", e => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.add("hidden");
    }
  });
}

/* ======================================================
   SUBMIT ENTRY DATA BERKAS
====================================================== */
async function submitEntry(e) {
  e.preventDefault();

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.username) {
      alert("Session login tidak valid");
      return;
    }

    const payload = {
      action: "entry",
      username: user.username,
      tanggal_mulai: document.getElementById("tanggal_mulai").value,
      nomor_berkas: document.getElementById("nomor_berkas").value.trim(),
      tahun: document.getElementById("tahun").value.trim(),
      nama_pemohon: document.getElementById("nama_pemohon").value.trim(),
      jenis_permohonan: document.getElementById("jenis_permohonan").value.trim(),
      desa_kecamatan: document.getElementById("desa_kecamatan").value.trim()
    };

    // Validasi wajib
    if (
      !payload.tanggal_mulai ||
      !payload.nomor_berkas ||
      !payload.tahun ||
      !payload.nama_pemohon ||
      !payload.jenis_permohonan ||
      !payload.desa_kecamatan
    ) {
      alert("Semua field wajib diisi");
      return;
    }

    const body = new URLSearchParams(payload).toString();

    const res = await fetch(window.APP_CONFIG.API_WEB, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const json = await res.json();

    if (!json.success) {
      alert(json.message || "Gagal menyimpan data");
      return;
    }

    alert("✅ Berkas berhasil di-entry");
    document.getElementById("form-entry-berkas").reset();

  } catch (err) {
    console.error("Submit gagal:", err);
    alert("Koneksi ke server gagal");
  }
}

/* ======================================================
   EXPORT (WAJIB UNTUK SPA)
====================================================== */
window.initEntryBerkas = initEntryBerkas;
