/* =====================================================
 * KIRIM.JS — FINAL PRODUKSI (CONFIG BASED)
 * HALAMAN : KIRIM BERKAS
 * =====================================================
 */

console.log("kirim.js loaded");

window.initKirimBerkas = function () {
  console.log("INIT KIRIM BERKAS");

  if (!window.APP_CONFIG?.API_WEB) {
    console.error(" Maaf Layanan sedang tidak tersedia");
    return;
  }

  const API = APP_CONFIG.API_WEB;
  let currentBerkas = null;

  /* ================= DOM ================= */
  const nomorBerkas = document.getElementById("nomorBerkas");
  const tahunBerkas = document.getElementById("tahunBerkas");
  const btnCari = document.getElementById("btnCari");
  const btnReset = document.getElementById("btnReset");
  const btnKirim = document.getElementById("btnKirim");

  const frameBawah = document.getElementById("frameBawah");

  const hasilTanggal = document.getElementById("hasilTanggal");
  const hasilNomor   = document.getElementById("hasilNomor");
  const hasilNama    = document.getElementById("hasilNama");
  const hasilJenis   = document.getElementById("hasilJenis");
  const hasilDesa    = document.getElementById("hasilDesa");
  const hasilPetugas = document.getElementById("hasilPetugas");

  const selectSeksi       = document.getElementById("selectSeksi");
  const selectPetugasUkur = document.getElementById("selectPetugasUkur");
  const selectDikirimKe   = document.getElementById("selectDikirimKe");

  const keterangan = document.getElementById("keterangan");

  frameBawah.classList.add("hidden");

  /* ================= LOADING ================= */
  const loadingCari  = document.getElementById("loadingCari");
  const loadingKirim = document.getElementById("loadingKirim");
  const useGlobalLoading = () => window.USE_GLOBAL_LOADING === true;

  const show = el => el?.classList.remove("hidden");
  const hide = el => el?.classList.add("hidden");

  /* ================= API HELPER ================= */
  async function apiGet(action, params = {}) {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${API}?${qs}`);
    return res.json();
  }

  async function apiPost(payload) {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  function fillSelect(el, data = [], placeholder) {
    el.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
  }

  /* ================= LOAD MASTER ================= */
  async function loadDropdowns() {
    const seksiRes = await apiGet("daftarSeksi");
    if (seksiRes.success) {
      fillSelect(selectSeksi, seksiRes.data, "-- Pilih Seksi --");
    }

    const ukurRes = await apiGet("petugasUkur");
    if (ukurRes.success) {
      fillSelect(selectPetugasUkur, ukurRes.data, "-- Pilih Petugas Ukur --");
    }

    fillSelect(selectDikirimKe, [], "-- Pilih Penerima --");
  }

  /* ================= SEKSI → STAFF ================= */
  selectSeksi.addEventListener("change", async () => {
    const res = await apiGet("staffSeksi");
    if (!res.success) {
      alert("Gagal memuat staff seksi");
      return;
    }
    fillSelect(selectDikirimKe, res.data, "-- Pilih Penerima --");
  });

  /* ================= CARI BERKAS ================= */
  btnCari.onclick = async () => {
    if (!useGlobalLoading()) show(loadingCari);

    try {
      const nomor = nomorBerkas.value.trim();
      const tahun = tahunBerkas.value.trim();

      if (!nomor || !tahun) {
        alert("Nomor dan Tahun wajib diisi");
        return;
      }

      const res = await apiGet("informasi", { nomor, tahun });

      if (!res.success || !res.data?.info) {
        alert("Berkas tidak ditemukan");
        return;
      }

      const info = res.data.info;

      hasilTanggal.innerText = info.tanggal_mulai || "-";
      hasilNomor.innerText   = info.nomor_berkas || "-";
      hasilNama.innerText    = info.nama_pemohon || "-";
      hasilJenis.innerText   = info.jenis_permohonan || "-";
      hasilDesa.innerText    = info.desa_kecamatan || "-";
      hasilPetugas.innerText = info.petugas_ukur || "-";

      currentBerkas = { nomor: info.nomor_berkas };

      await loadDropdowns();

      if (info.petugas_ukur) {
        selectPetugasUkur.value = info.petugas_ukur;
        selectPetugasUkur.disabled = true;
      } else {
        selectPetugasUkur.disabled = false;
        selectPetugasUkur.value = "";
      }

      frameBawah.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mencari berkas");
    } finally {
      if (!useGlobalLoading()) hide(loadingCari);
    }
  };

  /* ================= KIRIM BERKAS ================= */
  btnKirim.onclick = async () => {
    if (!useGlobalLoading()) show(loadingKirim);

    try {
      if (!currentBerkas) {
        alert("Cari berkas terlebih dahulu");
        return;
      }

      if (!selectSeksi.value) {
        alert("Seksi wajib dipilih");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        action: "kirimBerkas",
        nomor_berkas: currentBerkas.nomor,
        pengirim: user.nama_lengkap || user.nama || user.username,
        nama_seksi: selectSeksi.value,
        dikirim_ke: selectDikirimKe.value || "",
        petugas_ukur: selectPetugasUkur.disabled
          ? hasilPetugas.innerText
          : selectPetugasUkur.value,
        keterangan: keterangan.value || ""
      };

      const res = await apiPost(payload);

      if (!res.success) {
        alert(res.message || "Gagal mengirim");
        return;
      }

      alert(res.data || "Berkas berhasil dikirim");
      frameBawah.classList.add("hidden");

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim berkas");
    } finally {
      if (!useGlobalLoading()) hide(loadingKirim);
    }
  };

  /* ================= RESET ================= */
  btnReset.onclick = () => {
    frameBawah.classList.add("hidden");
    nomorBerkas.value = "";
    tahunBerkas.value = "";
    currentBerkas = null;

    selectPetugasUkur.disabled = false;
    selectPetugasUkur.value = "";
    fillSelect(selectDikirimKe, [], "-- Pilih Penerima --");
  };
};
