/* =====================================================
 * DISTRIBUSI BERKAS
 * ENTRY + DAFTAR ISI + DISTRIBUSI
 * =====================================================
 */

console.log("distribusi-berkas.js loaded");

window.initDistribusiBerkas = function () {
  console.log("INIT DISTRIBUSI BERKAS");

  if (!window.APP_CONFIG?.API_WEB) {
    console.error("API_WEB belum tersedia");
    return;
  }

  const API = window.APP_CONFIG.API_WEB;

  let currentBerkas = null;
  let currentInformasi = null;
  let daftarIsiData = null;

  let cacheStaff = [];

  let listJenis = [];
  let listDesa = [];

  let entryInited = false;

  const statusPanel = document.getElementById("statusPanel");
  const statusMessage = document.getElementById("statusMessage");

  const mainPanel = document.getElementById("mainPanel");
  const informasiPanel = document.getElementById("informasiPanel");
  const entryPanel = document.getElementById("entryPanel");
  const distribusiPanel = document.getElementById("distribusiPanel");
  const daftarIsiPanel = document.getElementById("daftarIsiPanel");


  const nomorBerkasCari = document.getElementById("nomorBerkasCari");

  const tahunCari = document.getElementById("tahunCari");

  const btnCariBerkas = document.getElementById("btnCariBerkas");

  const btnResetCari = document.getElementById("btnResetCari");

  const infoNomor = document.getElementById("infoNomor");

  const infoNama = document.getElementById("infoNama");

  const infoJenis = document.getElementById("infoJenis");

  const infoDesa = document.getElementById("infoDesa");

  const infoPukur = document.getElementById("infoPukur");

  const entryNomorBerkas = document.getElementById("entryNomorBerkas");

  const entryTahun = document.getElementById("entryTahun");

  const tglMulai = document.getElementById("tglMulai");

  const entryNama = document.getElementById("entryNama");

  const entryDesa = document.getElementById("entryDesa");

  const jenisPermohonan = document.getElementById("JenisPermohonan");

 

  const no301 = document.getElementById("no301");
  const tgl301 = document.getElementById("tgl301");

  const no302 = document.getElementById("no302");
  const tgl302 = document.getElementById("tgl302");

  const no303 = document.getElementById("no303");
  const tgl303 = document.getElementById("tgl303");

  const no307 = document.getElementById("no307");
  const tgl307 = document.getElementById("tgl307");



  const seksiDistribusi = document.getElementById("seksiDistribusi");

  const petugasDistribusi = document.getElementById("petugasDistribusi");

  const tujuanDistribusi = document.getElementById("tujuanDistribusi");

  const keteranganDistribusi = document.getElementById("keteranganDistribusi");

  const btnDistribusikan = document.getElementById("btnDistribusikan");

  const btnBatalDistribusi = document.getElementById("btnBatalDistribusi");



  async function apiGet(action, params = {}) {
    const qs = new URLSearchParams({
      action,
      ...params,
    }).toString();

    const res = await fetch(`${API}?${qs}`);

    return res.json();
  }

  async function apiPost(payload) {
    const res = await fetch(API, {
      method: "POST",

      body: JSON.stringify(payload),
    });

    return res.json();
  }

  function fillSelect(el, data = [], placeholder) {
    if (!el) return;

    el.innerHTML = `<option value="">${placeholder}</option>`;

    data.forEach((item) => {
      const opt = document.createElement("option");

      opt.value = item;
      opt.textContent = item;

      el.appendChild(opt);
    });
  }

  function show(el) {
    el?.classList.remove("hidden");
  }

  function hide(el) {
    el?.classList.add("hidden");
  }

  function tampilStatus(text) {
    if (!statusPanel) return;

    statusPanel.classList.remove("hidden");

    statusMessage.textContent = text;
  }

  function hideStatus() {
    statusPanel?.classList.add("hidden");
  }

  hide(mainPanel);
  hide(entryPanel);
  hide(informasiPanel);



  function initEntryBerkas() {
    if (entryInited) return;

    entryInited = true;

    loadJenisPermohonan();
    loadDesaKecamatan();
  }



  async function loadJenisPermohonan() {
    try {
      const res = await fetch(`${API}?action=jenis`);
      const json = await res.json();

      if (!json.success) return;
      if (!Array.isArray(json.data)) return;

      listJenis = json.data;

      fillSelect(JenisPermohonan, listJenis, "-- Pilih Jenis Permohonan --");
    } catch (err) {
      console.error("Load jenis permohonan gagal:", err);
    }
  }



  async function loadDesaKecamatan() {
    try {
      const res = await fetch(`${API}?action=desa`);
      const json = await res.json();

      if (!json.success) return;
      if (!Array.isArray(json.data)) return;

      listDesa = json.data;

      fillSelect(entryDesa, listDesa, "-- Pilih Desa / Kecamatan --");
    } catch (err) {
      console.error("Load desa/kecamatan gagal:", err);
    }
  }



  function validasiEntry() {
    if (!tglMulai.value) return "Tanggal Mulai wajib diisi";

    if (!entryNomorBerkas.value.trim()) return "Nomor Berkas wajib diisi";

    if (!entryTahun.value.trim()) return "Tahun wajib diisi";

    if (!entryNama.value.trim()) return "Nama Pemohon wajib diisi";

    if (!entryDesa.value.trim()) return "Desa / Kecamatan wajib diisi";

    if (!jenisPermohonan.value.trim()) return "Jenis Permohonan wajib diisi";

    return "";
  }



  async function submitEntry() {
    try {
      const pesan = validasiEntry();

      if (pesan) {
        alert(pesan);
        return false;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.username) {
        alert("Session login tidak valid");
        return false;
      }

      const payload = {
        action: "entry",

        username: user.username,

        tanggal_mulai: tglMulai.value,

        nomor_berkas: entryNomorBerkas.value.trim(),

        tahun: entryTahun.value.trim(),

        nama_pemohon: entryNama.value.trim(),

        jenis_permohonan: jenisPermohonan.value.trim(),

        desa_kecamatan: entryDesa.value.trim(),
      };

      const body = new URLSearchParams(payload).toString();

      const res = await fetch(API, {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body,
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Gagal menyimpan data");

        return false;
      }

      return true;
    } catch (err) {
      console.error("Submit gagal:", err);

      alert("Koneksi ke server gagal");

      return false;
    }
  }
  async function simpanEntryBaru() {
    btnSimpanEntry.disabled = true;

    try {
      const ok = await submitEntry();

      if (!ok) return;

      const res = await apiGet("informasi", {
        nomor: entryNomorBerkas.value.trim(),
        tahun: entryTahun.value.trim(),
      });

      if (!res.success || !res.data || !res.data.info) {
        tampilStatus("error", "Gagal memuat informasi berkas.");

        return;
      }

      /* ===== REVISI 5 ===== */

      nomorBerkasCari.value = entryNomorBerkas.value;

      tahunCari.value = entryTahun.value;

      /* ==================== */

      const info = res.data.info;

      const master = res.data.master || {};

      tampilkanInformasiBerkas(info, master);
      await loadDaftarIsi();
      seksiDistribusi.focus();
    } finally {
      btnSimpanEntry.disabled = false;
    }
  }
  function tampilkanInformasiBerkas(info, master) {
    currentInformasi = info;

    currentBerkas = {
      nomor: info.nomor_berkas,
      tahun: info.tahun,
    };

    infoNomor.textContent = info.nomor_berkas || "-";
    infoNama.textContent = info.nama_pemohon || "-";
    infoJenis.textContent = info.jenis_permohonan || "-";
    infoDesa.textContent = info.desa_kecamatan || "-";
    infoPukur.textContent = info.petugas_ukur || "-";

    fillSelect(seksiDistribusi, master.seksi || [], "-- Pilih Seksi --");

    fillSelect(
      petugasDistribusi,
      master.petugas || [],
      "-- Pilih Petugas Ukur --"
    );

    cacheStaff = master.staff || [];

    fillSelect(tujuanDistribusi, [], "-- Pilih Tujuan --");

    if (info.petugas_ukur) {
      petugasDistribusi.value = info.petugas_ukur;
      petugasDistribusi.disabled = true;
    } else {
      petugasDistribusi.disabled = false;
      petugasDistribusi.value = "";
    }

    show(mainPanel);

    show(informasiPanel);

    hide(entryPanel);

    show(daftarIsiPanel);

    show(distribusiPanel);
  }


  seksiDistribusi.addEventListener("change", () => {
    fillSelect(tujuanDistribusi, cacheStaff, "-- Pilih Tujuan --");
  });


  async function prosesCariBerkas() {
    hideStatus();

    try {
      const nomor = nomorBerkasCari.value.trim();

      const tahun = tahunCari.value.trim();

      if (!nomor || !tahun) {
        alert("Nomor dan Tahun wajib diisi");

        return;
      }

      const res = await apiGet("informasi", {
        nomor,
        tahun,
      });


      if (!res.success || !res.data || !res.data.info) {
        currentBerkas = null;
        currentInformasi = null;

        show(mainPanel);
        hide(informasiPanel);
        show(entryPanel);
        hide(daftarIsiPanel);
        hide(distribusiPanel);

        /* Muat ulang master Entry */
        await initEntryBerkas();

        /* Kosongkan daftar isi */
        kosongkanDaftarIsi();

        /* Isi nomor & tahun */
        entryNomorBerkas.value = nomor;
        entryTahun.value = tahun;

        tampilStatus(
          "Berkas belum tersedia. Silakan lakukan entry data berkas baru."
        );

        return;
      }


      const info = res.data.info;

      const master = res.data.master || {};

      tampilkanInformasiBerkas(info, master);

      await loadDaftarIsi();

      tampilStatus("Berkas berhasil ditemukan.");
    } catch (err) {
      console.error(err);

      tampilStatus("Terjadi kesalahan saat mencari berkas.");
    }
  }


  function resetInformasi() {
    infoNomor.textContent = "-";
    infoNama.textContent = "-";
    infoJenis.textContent = "-";
    infoDesa.textContent = "-";
    infoPukur.textContent = "-";
  }
  function resetEntry() {
    entryNomorBerkas.value = "";
    entryTahun.value = "";
    tglMulai.value = "";
    entryNama.value = "";

    entryDesa.selectedIndex = 0;
    JenisPermohonan.selectedIndex = 0;
  }


  function resetDistribusi() {
    seksiDistribusi.value = "";

    petugasDistribusi.disabled = false;
    petugasDistribusi.value = "";

    fillSelect(tujuanDistribusi, [], "-- Pilih Tujuan --");

    keteranganDistribusi.value = "";
  }



  function resetPencarian() {
    nomorBerkasCari.value = "";
    tahunCari.value = "";

    currentBerkas = null;
    currentInformasi = null;

    hideStatus();

    resetInformasi();

    resetEntry();

    kosongkanDaftarIsi();

    resetDistribusi();

    hide(mainPanel);

    hide(informasiPanel);

    hide(entryPanel);

    hide(daftarIsiPanel);

    hide(distribusiPanel);
  }



  btnCariBerkas.addEventListener("click", prosesCariBerkas);

  btnResetCari.addEventListener("click", resetPencarian);



  function kosongkanDaftarIsi() {
    no301.value = "";
    tgl301.value = "";

    no302.value = "";
    tgl302.value = "";

    no303.value = "";
    tgl303.value = "";

    no307.value = "";
    tgl307.value = "";

    daftarIsiData = {};
  }



  function isiDaftarIsi(data = {}) {
    daftarIsiData = data;

    no301.value = data.no301 || "";
    tgl301.value = data.tgl301 || "";

    no302.value = data.no302 || "";
    tgl302.value = data.tgl302 || "";

    no303.value = data.no303 || "";
    tgl303.value = data.tgl303 || "";

    no307.value = data.no307 || "";
    tgl307.value = data.tgl307 || "";
  }



  function ambilDataDaftarIsi() {
    return {
      nomor_berkas: currentBerkas?.nomor || entryNomorBerkas.value.trim(),

      no301: no301.value.trim(),

      tgl301: tgl301.value,

      no302: no302.value.trim(),

      tgl302: tgl302.value,

      no303: no303.value.trim(),

      tgl303: tgl303.value,

      no307: no307.value.trim(),

      tgl307: tgl307.value,
    };
  }



  function validasiDaftarIsi() {
    return true;
  }



  async function simpanDaftarIsi() {
    if (!validasiDaftarIsi()) {
      return false;
    }

    const data = ambilDataDaftarIsi();

    try {
      const payload = {
        action: "simpanDaftarIsi",

        nomor_berkas: currentBerkas.nomor,

        no301: data.no301,
        tgl301: data.tgl301,

        no302: data.no302,
        tgl302: data.tgl302,

        no303: data.no303,
        tgl303: data.tgl303,

        no307: data.no307,
        tgl307: data.tgl307,
      };

      console.log(payload);

      const res = await apiPost(payload);

      if (!res.success) {
        alert(res.message || "Gagal menyimpan Daftar Isi.");

        return false;
      }

      return true;
    } catch (err) {
      console.error(err);

      alert("Gagal menyimpan Daftar Isi.");

      return false;
    }
  }



  async function loadDaftarIsi() {
    kosongkanDaftarIsi();

    if (!currentBerkas) return;

    try {
      const res = await apiGet("ambilDaftarIsi", {
        nomor_berkas: currentBerkas.nomor,
      });

      console.log(res);

      if (!res.success) return;

      const d = res.data || {};

      no301.value = d.no301 || "";
      tgl301.value = d.tgl301 || "";

      no302.value = d.no302 || "";
      tgl302.value = d.tgl302 || "";

      no303.value = d.no303 || "";
      tgl303.value = d.tgl303 || "";

      no307.value = d.no307 || "";
      tgl307.value = d.tgl307 || "";

    } catch (err) {
      console.error(err);
    }
  }


  function validasiDistribusi() {
    if (!currentBerkas) {
      alert("Cari berkas terlebih dahulu.");
      return false;
    }

    if (!seksiDistribusi.value) {
      alert("Seksi wajib dipilih.");
      return false;
    }

    return true;
  }



  async function distribusikanBerkas() {
    if (!validasiDistribusi()) {
      return;
    }

    /* Simpan daftar isi terlebih dahulu */

    const daftarIsiOK = await simpanDaftarIsi();

    if (!daftarIsiOK) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        action: "kirimBerkas",

        nomor_berkas: currentBerkas.nomor,

        pengirim: user.nama_lengkap || user.nama || user.username,

        nama_seksi: seksiDistribusi.value,

        dikirim_ke: tujuanDistribusi.value || "",

        petugas_ukur: petugasDistribusi.disabled
          ? infoPukur.textContent
          : petugasDistribusi.value,

        keterangan: keteranganDistribusi.value || "",
      };

      const res = await apiPost(payload);

      if (!res.success) {
        alert(res.message || "Distribusi gagal.");

        return;
      }

      alert(res.data || "Distribusi berhasil.");

      resetPencarian();
    } catch (err) {
      console.error(err);

      alert("Terjadi kesalahan saat distribusi.");
    }
  }


  function batalDistribusi() {
    if (confirm("Batalkan proses distribusi?")) {
      resetPencarian();
    }
  }



  btnDistribusikan.addEventListener("click", distribusikanBerkas);

  btnBatalDistribusi.addEventListener("click", batalDistribusi);

  btnSimpanEntry.addEventListener("click", simpanEntryBaru);



  resetPencarian();
};
