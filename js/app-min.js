/* 1===============================config.js=============================== */

window.APP_CONFIG = {
    API_WEB: "https://webapi.berkasplus.my.id",
    DEBUG: false
  };


/* 2===============================Console-clean.js========================= */


if (!window.APP_CONFIG?.DEBUG) {
    console.log  = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.debug = () => {};
  }


/* 3===============================auth.js================================== */


const API_WEB = "https://webapi.berkasplus.my.id";
async function login(e) {
  e.preventDefault();

  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const error = document.getElementById("error");

  if (error) error.classList.add("hidden");
  if (!username || !password) {
    if (error) {
      error.textContent = "Username dan password wajib diisi";
      error.classList.remove("hidden");
    }
    return;
  }

  try {
    const res = await fetch(API_WEB, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        username,
        password
      })
    });

    const json = await res.json();

    if (!json.success || !json.data) {
      if (error) {
        error.textContent =
          json.message ||
          "Login gagal! Username atau password salah";
        error.classList.remove("hidden");
      }
      return;
    }

    localStorage.setItem("login", "true");
    localStorage.setItem(
      "user",
      JSON.stringify(json.data)
    );
    window.location.href = "index.html";

  } catch (err) {
    if (error) {
      error.textContent = "Gagal koneksi ke server";
      error.classList.remove("hidden");
    }
  }
}

function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "login.html";
}

function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function isLogin() {
  return localStorage.getItem("login") === "true";
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.Role === "Administrator";
}

window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isLogin = isLogin;
window.isAdmin = isAdmin;


/* 4===============================auth-guard.js=============================== */
    (function authGuard() {
        const publicPages = [
          "login.html",
          "register.html"
        ];
        const currentPage =
          (
            location.pathname
              .split("/")
              .pop()
            || "index.html"
          ).toLowerCase();
        if (publicPages.includes(currentPage)) {
          return;
        }
        const loginStatus =
          localStorage.getItem("login");
        const userRaw =
          localStorage.getItem("user");
        if (
          loginStatus !== "true" ||
          !userRaw
        ) {
          clearSessionAndRedirect();
          return;
        }
        let user;
        try {
          user = JSON.parse(userRaw);
        } catch {
          clearSessionAndRedirect();
          return;
        }
        const username =
          user.username ||
          user.Username ||
          "";
        if (!username) {
          clearSessionAndRedirect();
          return;
        }
    })();

  function clearSessionAndRedirect() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("login.html");
  }
  

/* 5===============================router.js=============================== */


    (function checkAuth() {   
        const login =
          localStorage.getItem("login");   
        const user =
          localStorage.getItem("user");   
        if (
          login !== "true" ||
          !user
        ) {  
          window.location.replace(
            "login.html"
          );   
        }  
    })();

  document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const el = document.getElementById("user-name");
    if (el) {
      el.innerText = user.nama || user.username || "User";
    }
  });
  
  function requireAdminPage() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
  
    if (!user || String(user.role || user.Role).toLowerCase() !== "administrator") {
      alert("Maaf akses ditolak! Halaman ini hanya untuk Administrator.");
      loadPage("dashboard.html");
      return false;
    }
  
    return true;
  }
  function loadPage(page) {
  
    const adminPages = [
      "daftar-petugas.html",
      "petugas-ukur.html",
      "jenis-permohonan.html",
      "daftar-berkas.html"
    ];
  
    if (adminPages.includes(page)) {
      if (!requireAdminPage()) return;
    }
  
    fetch(`pages/${page}`)
      .then(res => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then(html => {
        const content = document.getElementById("content");
        content.innerHTML = html;
  
        setActiveMenu(page);
        setPageTitle(page);
        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
  
          if (page === "dashboard.html") {
  
            if (typeof showWelcomeOnce === "function") {
              showWelcomeOnce();
            }
  
            if (typeof initDashboardBeban === "function") {
              console.log("INIT: Dashboard Beban 📊");
              initDashboardBeban();
            }
            
            if (typeof initDashboardInbox === "function") {
              initDashboardInbox();
            }
  
            if (typeof initDashboardRekapSeksi === "function") {
              console.log("INIT: Dashboard Rekap Seksi 🏢");
              initDashboardRekapSeksi();
            }
  
            if (typeof initDashboardRekapBerkas === "function") {
              console.log("INIT: Dashboard Rekap Berkas 📊");
              initDashboardRekapBerkas();
            }
  
            if (typeof initDashboardPermohonan === "function") {
              console.log("INIT: Dashboard Permohonan 🧾");
              initDashboardPermohonan();
            }
            
            if (typeof initDashboardPU === "function") {
              console.log("INIT: Dashboard Petugas Ukur 📐");
              initDashboardPU();
            }
                      
          }
    
         
          if (page === "informasi-berkas.html" &&
              typeof initInformasiBerkas === "function") {
            console.log("INIT: Informasi Berkas 🚀");
            initInformasiBerkas();
          }
  
          
          if (page === "entry-data-berkas.html" &&
              typeof initEntryBerkas === "function") {
            console.log("INIT: Entry Data Berkas 🚀");
            initEntryBerkas();
          }
  
           
          if (page === "kirim-berkas.html" &&
              typeof initKirimBerkas === "function") {
            console.log("INIT: Kirim Berkas 🚀");
            initKirimBerkas();
          }
  
          
          if (page === "inbox.html" &&
              typeof initInboxBerkas === "function") {
            console.log("INIT: Inbox Berkas");
            initInboxBerkas();
          }
  
          
          if (page === "history-berkas.html" &&
              typeof initHistoryBerkas === "function") {
            console.log("INIT: History Berkas");
            initHistoryBerkas();                
          }
  
          
          if (page === "beban-petugas.html" &&
              typeof initBebanPetugas === "function") {
            console.log("INIT: Beban Petugas 📊");
            initBebanPetugas();
          }
  
          
          if (page === "beban-petugas-ukur.html" &&
              typeof initBebanPetugasUkur === "function") {
            console.log("INIT: Beban Petugas Ukur 📐");
            initBebanPetugasUkur();
          }
  
          
          if (page === "monitoring-petugas-ukur.html" &&
              typeof initBebanPetugasUkur === "function") {
          initBebanPetugasUkur("monitoring");
          }
          
          
          if (page === "ploting.html" && typeof initPloting === "function") {
            initPloting();
          }
  
          
          if (page === "daftar-ploting.html" && typeof initDaftarPloting === "function") {
            console.log("INIT: Daftar Ploting 📊");
            initDaftarPloting();
          }
          
        
  
         
          
          if (
            page === "daftar-petugas.html" &&
            typeof initDaftarPetugas === "function"
          ) {
            console.log("INIT: Daftar Petugas");
            initDaftarPetugas();
          }
  
          
          if (
            page === "petugas-ukur.html" &&
            typeof initPetugasUkur === "function"
          ) {
            console.log("INIT: Daftar Petugas Ukur");
            initPetugasUkur();
          }
  
          
          if (
            page === "jenis-permohonan.html" &&
            typeof initJenisPermohonan === "function"
          ) {
            console.log("INIT: Jenis Permohonan");
            initJenisPermohonan();
          }
          
          
          if (page === "daftar-berkas.html" &&
              typeof initUploadBerkas === "function") {
            initUploadBerkas();
          }
        
  
        }, 50);
      })
      .catch(() => {
        document.getElementById("content").innerHTML =
          `<div class="p-6 text-red-600 font-semibold">
            Halaman tidak ditemukan
          </div>`;
      });
  }

  function setActiveMenu(page) {
    document
      .querySelectorAll(".menu, .submenu-item")
      .forEach(el => el.classList.remove("active"));
  
    document
      .querySelectorAll(`[data-page="${page}"]`)
      .forEach(el => {
        el.classList.add("active");
        el.closest(".menu-group")?.classList.add("open");
      });
  }
  
  function setPageTitle(page) {
    const map = {
      "dashboard.html": "Dashboard",
      "informasi-berkas.html": "Informasi Berkas",
      "entry-data-berkas.html": "Entry Data Berkas",
      "inbox.html": "Inbox",
      "kirim-berkas.html": "Kirim Berkas",
      "history-berkas.html": "History Berkas",
      "beban-petugas.html": "Beban Petugas",
      "beban-petugas-ukur.html": "Beban Petugas Ukur",
      "daftar-petugas.html": "Daftar Petugas",
      "petugas-ukur.html": "Daftar Petugas Ukur",
      "monitoring-petugas-ukur.html": "Monitoring Petugas Ukur",
      "jenis-permohonan.html": "Jenis Permohonan",
      "daftar-berkas.html": "Daftar Berkas",
      "ploting.html": "Ploting SiGundul",
      "daftar-ploting.html": "Daftar Ploting"
    };
  
    const titleEl = document.getElementById("page-title");
    if (titleEl) {
      titleEl.innerText = map[page] || "Dashboard";
    }
  }
  
  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
  
    if (sidebar.classList.contains("collapsed")) {
      document
        .querySelectorAll(".menu-group")
        .forEach(group => group.classList.remove("open"));
    }
  }
  
  function toggleSubmenu(btn) {
    const group = btn.closest(".menu-group");
    document
      .querySelectorAll(".menu-group")
      .forEach(g => g !== group && g.classList.remove("open"));
  
    group.classList.toggle("open");
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadPage("dashboard.html");
  });
  
  function toggleUserMenu() {
    document.getElementById("userMenu")?.classList.toggle("hidden");
  }
  
  document.addEventListener("click", e => {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown && !dropdown.contains(e.target)) {
      document.getElementById("userMenu")?.classList.add("hidden");
    }
  });
  
  function logout() {
    localStorage.clear();
    window.location.href = "login.html";
  }
  

/* 6===============================notif.js=============================== */

let isLoadingInbox = false;
let lastInboxCount = -1;

function loadInboxNotif() {
  
  if (isLoadingInbox) return;

  const userLogin =
    JSON.parse(
      localStorage.getItem("user")
      || "{}"
    );
  const namaUser = (
    userLogin.nama_lengkap ||
    userLogin.nama ||
    userLogin.username ||
    ""
  ).trim();

  if (
    !namaUser ||
    !window.APP_CONFIG?.API_WEB
  ) return;

  isLoadingInbox = true;

  fetch(
    `${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`,
    {
      silent:true
    }
  )

  .then(r => r.json())
  .then(res => {
    let inbox = [];
    if (Array.isArray(res)) {
      inbox = res;
    } else if (
      res &&
      res.success === true &&
      Array.isArray(res.data)
    ) {
      inbox = res.data;
    }
    const total = inbox.length;    
    if (total === lastInboxCount) return;
    lastInboxCount = total;
    const badge =
      document.getElementById(
        "notifBadge"
      );
    const notifInbox =
      document.getElementById(
        "notifInbox"
      );
    const notifText =
      document.getElementById(
        "notifText"
      );
    const sidebarBadge =
      document.getElementById(
        "inbox-badge"
      );

    if (badge) {
      badge.innerText = total;
      badge.classList.toggle(
        "hidden",
        total === 0
      );
    }
    if (sidebarBadge) {
      sidebarBadge.innerText = total;
      sidebarBadge.classList.toggle(
        "hidden",
        total === 0
      );
    }
    if (
      notifInbox &&
      notifText
    ) {
      if (total > 0) {
        notifInbox.classList.remove(
          "hidden"
        );
        notifText.innerText =
          `📥 ${total} inbox baru masuk untuk Anda`;
      }
      else {
        notifInbox.classList.add(
          "hidden"
        );
      }
    }
  })
  .catch(err => {
    console.warn(
      "Inbox notif gagal:",
      err
    );
  })
  .finally(() => {
    isLoadingInbox = false;
  });
}
document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadInboxNotif();
    setInterval(() => {
      if (
        document.visibilityState
        === "visible"
      ) {
        loadInboxNotif();
      }
    }, 30000);
  }
);

window.showToast = function (
  message,
  type = "info"
) {
  let container =
    document.getElementById(
      "toastContainer"
    );
  if (!container) {
    container =
      document.createElement(
        "div"
      );
    container.id =
      "toastContainer";
    container.style.position =
      "fixed";
    container.style.top =
      "20px";
    container.style.right =
      "20px";
    container.style.zIndex =
      "9999";
    container.style.display =
      "flex";
    container.style.flexDirection =
      "column";
    container.style.gap =
      "10px";
    document.body.appendChild(
      container
    );
  }
  const toast =
    document.createElement(
      "div"
    );
  const colors = {
    success:
      "#16a34a",
    error:
      "#dc2626",
    warning:
      "#f59e0b",
    info:
      "#2563eb"
  };
  toast.style.background =
    colors[type] ||
    colors.info;
  toast.style.color =
    "#fff";
  toast.style.padding =
    "10px 16px";
  toast.style.borderRadius =
    "6px";
  toast.style.fontSize =
    "13px";
  toast.style.boxShadow =
    "0 4px 12px rgba(0,0,0,.2)";
  toast.style.opacity =
    "0";
  toast.style.transform =
    "translateY(-10px)";
  toast.style.transition =
    "all .3s ease";
  toast.innerText =
    message;
  container.appendChild(
    toast
  );
  setTimeout(() => {
    toast.style.opacity =
      "1";
    toast.style.transform =
      "translateY(0)";
  }, 50);
  setTimeout(() => {
    toast.style.opacity =
      "0";
    toast.style.transform =
      "translateY(-10px)";
    setTimeout(
      () =>
        toast.remove(),
      300
    );
  }, 3000);
};
/* 7===============================informasi.js=============================== */

function initInformasiBerkas() {
  console.log("initInformasiBerkas() JALAN 🚀");
  if (!window.APP_CONFIG?.API_WEB) {
    console.error("❌ API_WEB tidak tersedia");
    return;
  }

  const inputNomor = document.getElementById("inputNomor");
  const inputTahun = document.getElementById("inputTahun");
  const btnCari = document.getElementById("btnCari");
  const btnReset = document.getElementById("btnReset");
  const hasilContainer = document.getElementById("hasilContainer");
  const detailUtama = document.getElementById("detailUtama");
  const detailKeterangan = document.getElementById("detailKeterangan");
  const riwayatBody = document.getElementById("riwayatBody");
  const qrImage = document.getElementById("qrImage");
  const btnCetakQR = document.getElementById("btnCetakQR");
  const loadingCari = document.getElementById("loadingCari");
  const useGlobalLoading = () => window.USE_GLOBAL_LOADING === true;

  if (!btnCari || !hasilContainer) {
    console.error("❌ Elemen HTML belum siap");
    return;
  }
  hideHasil();
  btnCari.onclick = cariBerkas;
  btnReset.onclick = resetForm;
  /* ================= CARI BERKAS ================= */
  async function cariBerkas() {
    const nomor = inputNomor.value.trim();
    const tahun = inputTahun.value.trim();
    if (!nomor || !tahun) {
      alert("Nomor dan Tahun wajib diisi");
      return;
    }
    if (!useGlobalLoading()) {
      loadingCari?.classList.remove("hidden");
    }
    btnCari.disabled = true;
    hideHasil();
    try {
      const url =
        `${APP_CONFIG.API_WEB}?action=informasi&nomor=${encodeURIComponent(nomor)}&tahun=${encodeURIComponent(tahun)}`;
      const res = await fetch(url);
      const json = await res.json();
      console.log("API RESULT:", json);
      if (!json.success || !json.data || !json.data.info) {
        alert("Data tidak ditemukan");
        return;
      }
      showHasil();
      renderDetail(json.data.info);
      renderHistory(json.data.history || []);
      renderQR(nomor, tahun);

    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data");

    } finally {
      if (!useGlobalLoading()) {
        loadingCari?.classList.add("hidden");
      }
      btnCari.disabled = false;
    }
  }
  /* ================= LABEL MAP ================= */
  const LABEL_MAP = {
    tanggal_mulai: "Tanggal Mulai",
    nomor_berkas: "Nomor Berkas",
    nama_pemohon: "Nama Pemohon",
    jenis_permohonan: "Jenis Permohonan",
    desa_kecamatan: "Desa / Kecamatan",
    petugas_ukur: "Petugas Ukur",
    status_berkas: "Status Berkas",
    tanggal_terakhir: "Tanggal Terakhir",
    posisi_terakhir: "Posisi Terakhir",
    nama_petugas: "Nama Petugas"
  };
  /* ================= RENDER DETAIL ================= */
  function renderDetail(info) {
    detailUtama.innerHTML = "";
    detailKeterangan.textContent = "-";

    Object.entries(info).forEach(([key, val]) => {
      if (!val) return;

      if (key.toLowerCase().includes("keterangan")) {
        detailKeterangan.textContent = val;
        return;
      }
      if (!LABEL_MAP[key]) return;
      detailUtama.insertAdjacentHTML("beforeend", `
        <div class="mb-2">
          <div class="font-semibold text-gray-600">${LABEL_MAP[key]}</div>
          <div class="text-gray-800">${val}</div>
        </div>
      `);
    });
  }
  /* ================= RENDER RIWAYAT ================= */
  function renderHistory(history) {
    riwayatBody.innerHTML = "";

    if (!history.length) {
      riwayatBody.innerHTML = `
        <tr>
          <td colspan="8" class="border px-2 py-3 text-center text-gray-400">
            Tidak ada riwayat
          </td>
        </tr>`;
      return;
    }

    history.forEach(row => {
      riwayatBody.insertAdjacentHTML("beforeend", `
        <tr>
          <td class="border px-2 py-1">${row["Nomor/Tahun Berkas"] || "-"}</td>
          <td class="border px-2 py-1">${row["Pengirim"] || "-"}</td>
          <td class="border px-2 py-1">${row["Tgl dikirim"] || "-"}</td>
          <td class="border px-2 py-1">${row["Dikirim Ke"] || "-"}</td>
          <td class="border px-2 py-1">${row["Penerima"] || "-"}</td>
          <td class="border px-2 py-1">${row["Tgl diterima"] || "-"}</td>
          <td class="border px-2 py-1">${row["Status"] || "-"}</td>
          <td class="border px-2 py-1">${row["Keterangan"] || "-"}</td>
        </tr>
      `);
    });
  }

  /* ================= QR ================= */
  function renderQR(nomor, tahun) {
    const textQR = `${nomor}/${tahun}`;
    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(textQR)}`;
    qrImage.src = qrUrl;
    qrImage.classList.remove("hidden");
    btnCetakQR.classList.remove("hidden");
    btnCetakQR.onclick = () => {
      const w = window.open("", "_blank", "width=400,height=550");
      w.document.write(`
        <html>
        <head><title>QR Code</title></head>
        <body style="text-align:center;font-family:Arial;padding:30px">
          <h3>QR Code</h3>
          <p><b>Nomor</b>: ${nomor} / <b>Tahun</b>: ${tahun}</p>
          <img src="${qrUrl}" width="200">
          <br><br>
          <button onclick="window.print()">Cetak</button>
        </body>
        </html>
      `);
      w.document.close();
    };
  }
  /* ================= RESET ================= */
  function resetForm() {
    inputNomor.value = "";
    inputTahun.value = "";
    hideHasil();
  }
  function hideHasil() {
    hasilContainer.classList.add("hidden");
    detailUtama.innerHTML = "";
    detailKeterangan.textContent = "-";
    riwayatBody.innerHTML = "";
    qrImage.classList.add("hidden");
    btnCetakQR.classList.add("hidden");
  }
  function showHasil() {
    hasilContainer.classList.remove("hidden");
  }
}


/* 8===============================Qr-print.js=============================== */


console.log("qr-print.js aktif 🧩");

(function () {

  function initAddon() {
    const btnCetakQR = document.getElementById("btnCetakQR");
    const qrImage = document.getElementById("qrImage");

    
    if (!btnCetakQR || !qrImage || !qrImage.src) {
      setTimeout(initAddon, 500);
      return;
    }

    btnCetakQR.onclick = () => {

      
      const qrText = decodeURIComponent(
        new URL(qrImage.src).searchParams.get("data") || ""
      );

      const w = window.open(
        "",
        "_blank",
        "width=720,height=620"
      );

      w.document.write(`
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Cetak QR Code</title>

<style>
/* ================= PREVIEW ================= */
body {
  font-family: Arial, sans-serif;
  padding: 16px;
}

.preview {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.print-area {
  position: relative; /* 🔑 PENTING: hanya absolute saat print */
  min-width: 160px;
  text-align: center;
}

.print-area img {
  width: 140px;
  height: 140px;
}

.info {
  font-size: 12px;
  margin-top: 6px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.controls label {
  font-size: 12px;
  font-weight: bold;
}

.controls select {
  padding: 4px 6px;
  font-size: 12px;
}

.controls button {
  margin-top: 12px;
  padding: 6px;
  cursor: pointer;
}

/* ================= CETAK ================= */
@media print {
  body {
    padding: 0;
  }

  .controls {
    display: none;
  }

  .print-area {
    position: absolute;
    top: var(--top);
    left: var(--left);
  }

  .print-area img {
    width: 25mm;
    height: 25mm;
  }

  .info {
    font-size: 9pt;
    margin-top: 2mm;
  }
}
</style>
</head>

<body>

<div class="preview">

  <!-- AREA QR -->
  <div class="print-area" id="printArea">
    <img src="${qrImage.src.replace("size=200x200", "size=600x600")}">
    <div class="info">${qrText}</div>
  </div>

  <!-- KONTROL -->
  <div class="controls">
    <label>Posisi Vertikal</label>
    <select id="posY">
      <option value="20">Atas</option>
      <option value="120">Tengah</option>
      <option value="220">Bawah</option>
    </select>

    <label>Posisi Horizontal</label>
    <select id="posX">
      <option value="15">Kiri</option>
      <option value="90">Tengah</option>
      <option value="160">Kanan</option>
    </select>

    <button onclick="window.print()">Cetak</button>
  </div>

</div>

<script>
  const root = document.documentElement;
  const posY = document.getElementById("posY");
  const posX = document.getElementById("posX");

  function updatePos() {
    root.style.setProperty("--top", posY.value + "mm");
    root.style.setProperty("--left", posX.value + "mm");
  }

  posY.onchange = updatePos;
  posX.onchange = updatePos;
  updatePos();
</script>

</body>
</html>
      `);

      w.document.close();
    };
  }

  initAddon();

})();


/* 9===============================entry-data-berkas.js=============================== */


let listJenis = [];
let listDesa = [];
let entryInited = false;

function initEntryBerkas() {
  if (entryInited) return;
  entryInited = true;

  
  loadJenisPermohonan();
  loadDesaKecamatan();

  
  const form = document.getElementById("form-entry-berkas");
  if (form) {
    form.removeEventListener("submit", submitEntry);
    form.addEventListener("submit", submitEntry);
  }
}

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

function setupComboBox(inputId, listId, data) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  
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

      
      li.addEventListener("mousedown", () => {
        input.value = item;
        list.classList.add("hidden");
      });

      list.appendChild(li);
    });

    list.classList.toggle("hidden", results.length === 0);
  }

  
  input.addEventListener("focus", () => {
    render(input.value);
  });

  
  input.addEventListener("input", () => {
    render(input.value);
  });

  
  document.addEventListener("mousedown", e => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.add("hidden");
    }
  });
}

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

window.initEntryBerkas = initEntryBerkas;


/* 10===============================kirim.js=============================== */

console.log("kirim.js loaded");

window.initKirimBerkas = function () {
  console.log("INIT KIRIM BERKAS");

  if (!window.APP_CONFIG?.API_WEB) {
    console.error(" Maaf Layanan sedang tidak tersedia");
    return;
  }

  const API = APP_CONFIG.API_WEB;
  let currentBerkas = null;
  const CACHE_MASTER = {
      seksi: [],
      petugas: [],
      staff: []
  };

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

    /* ================= SEKSI → STAFF ================= */
    
    let cacheStaff = [];
    
    selectSeksi.addEventListener(
      "change",
      () => {
    
        fillSelect(
          selectDikirimKe,
          cacheStaff,
          "-- Pilih Penerima --"
        );
    
      }
    );
    /* ================= PRELOAD MASTER ================= */
    (async function preloadMaster(){    
       try{    
          const [    
             seksiRes,   
             petugasRes,   
             staffRes   
          ]  
          =  
          await Promise.all([  
             apiGet(
                "daftarSeksi"
             ),  
             apiGet(
                "petugasUkur"
             ),  
             apiGet(
                "staffSeksi"
             ) 
          ]);
    
          CACHE_MASTER.seksi =
             seksiRes.data || [];    
          CACHE_MASTER.petugas =
             petugasRes.data || [];   
          CACHE_MASTER.staff =
             staffRes.data || [];
       } 
       catch(err){ 
          console.error(
             "preload master gagal",
             err
          );   
       }    
    })();
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

        const info=
        res.data.info;
        
         fillSelect(
           selectSeksi,
           CACHE_MASTER.seksi,
           "-- Pilih Seksi --"
        );        
        fillSelect(
           selectPetugasUkur,
           CACHE_MASTER.petugas,
           "-- Pilih Petugas Ukur --"
        );        
        cacheStaff =
           CACHE_MASTER.staff;       
        fillSelect(
        selectDikirimKe,
        [],
        "-- Pilih Penerima --"
        );

      hasilTanggal.innerText = info.tanggal_mulai || "-";
      hasilNomor.innerText   = info.nomor_berkas || "-";
      hasilNama.innerText    = info.nama_pemohon || "-";
      hasilJenis.innerText   = info.jenis_permohonan || "-";
      hasilDesa.innerText    = info.desa_kecamatan || "-";
      hasilPetugas.innerText = info.petugas_ukur || "-";

      currentBerkas = { nomor: info.nomor_berkas };

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
/* 11===============================inbox.js=============================== */
/* 12===============================history.js=============================== */
/* 13===============================beban-petugas.js=============================== */


let dataBeban = [];
let filteredData = [];
let pieChartInstance = null;


function initBebanPetugas() {
  loadBebanFromAPI("pieChart", "pieLegend", true);
}



function initDashboardBeban() {
  loadBebanFromAPI("dashboardPieChart", "dashboardPieLegend", false);
}


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
        <td colspan="6" class="text-center py-4 text-gray-400">
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
        <td class="px-3 py-2 border-b">${row.keterangan}</td>
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
    "Petugas": row.petugas,
    "Keterangan": row.keterangan
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


/* 14===============================beban-petugas-ukur.js=============================== */


let modeBebanUkur = "personal";   
let selectedPetugas = "";         
let bebanUkurData = [];           


function renderTableBebanUkur(rows) {
  const tbody = document.getElementById("tableBody"); 

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

function initBebanPetugasUkur(mode = "personal") {

  modeBebanUkur = mode;

  if (mode === "monitoring") {
    loadDropdownPetugas(); 
  } else {
    loadBebanPetugasUkur();
  }
}

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

function filterMonitoringPetugas() {

  const select = document.getElementById("selectPetugasUkur");
  selectedPetugas = select.value;

  loadBebanPetugasUkur();
}


/* 15===============================dashboard-seksi.js=============================== */


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

function initDashboardRekapSeksi() {

  if (!document.getElementById("seksiChart")) return;

  loadRekapSeksi();
  loadCacheBerkasPU();
}

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

function renderSeksiChart(labels, values) {

  const canvas = document.getElementById("seksiChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (seksiChartInstance) {
    seksiChartInstance.destroy();
  }

  
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
      </tr>
    `;
  });

  container.scrollIntoView({ behavior: "smooth" });
}

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
    "Posisi Terakhir": row["Posisi terakhir"]
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Berkas per Seksi");

  XLSX.writeFile(
    wb,
    `berkas-seksi-${new Date().toISOString().slice(0,10)}.xlsx`
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboardRekapSeksi();
});

function tutupTabelSeksi() {

  const container = document.getElementById("seksiDetailContainer");
  const body = document.getElementById("seksiDetailBody");

  if (!container) return;

  
  container.classList.add("hidden");

  
  cacheDetailSeksi = [];
  if (body) body.innerHTML = "";

  
  const chart = document.getElementById("seksiChart");
  if (chart) {
    chart.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}


/* 16===============================dashboard-rekap.js=============================== */

function initDashboardRekapBerkas() {
    if (!window.APP_CONFIG?.API_WEB) return;
  
    fetch(`${APP_CONFIG.API_WEB}?action=bebanPU`)
      .then(r => r.json())
      .then(res => {
  
        if (!res || !res.success || !Array.isArray(res.data)) {
          console.error("API BebanPU tidak valid", res);
          return;
        }
  
        hitungRekapBerkas(res.data);
      })
      .catch(err => console.error("Dashboard Rekap Error:", err));
  }
  
  function hitungRekapBerkas(data) {

    let total = 0;
    let selesai = 0;
    let prosesBerjalan = 0;
    let lebih60Hari = 0;
  
    data.forEach(row => {
  
      total++;
  
      const status = (row["Status Berkas"] || "").trim().toLowerCase();
      const tglMulai = row["Tanggal mulai"];
      const tglTerakhir = row["Tanggal terakhir berjalan"];
  
      if (status === "selesai") {
        selesai++;
      }
  
      if (tglTerakhir && status !== "selesai") {
        prosesBerjalan++;
      }
  
      const hari = hitungSelisihHari(tglMulai);
      if (status !== "selesai" && hari > 60) {
        lebih60Hari++;
      }
  
    });
  
    renderRekapDashboard({
      total,
      proses: prosesBerjalan,
      selesai,
      proses30: lebih60Hari
    });
  }
    

  function hitungSelisihHari(tgl) {
    if (!tgl) return 0;
  
    // normalize format
    if (typeof tgl === "string" && tgl.includes("/")) {
      const [d, m, y] = tgl.split(" ")[0].split("/");
      tgl = `${y}-${m}-${d}`;
    }
  
    const start = new Date(tgl);
    if (isNaN(start)) return 0;
  
    const today = new Date();
    start.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
  
    return Math.floor((today - start) / 86400000);
  }
     

  function renderRekapDashboard({ total, proses, selesai, proses30 }) {
  
    const elTotal = document.getElementById("rekapTotal");
    if (!elTotal) return;
  
    document.getElementById("rekapTotal").innerText = total;
    document.getElementById("rekapProses").innerText = `${proses} / ${total}`;
    document.getElementById("rekapSelesai").innerText = `${selesai} / ${total}`;
    document.getElementById("rekapProses30").innerText = `${proses30} / ${total}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("rekapTotal")) {
      initDashboardRekapBerkas();
    }
  });
  
/* 17===============================dashboard-permohonan.js=============================== */

window.CACHE_BERKAS = window.CACHE_BERKAS || [];
window.CACHE_READY  = window.CACHE_READY  || false;


function parseTanggalIndonesia(str) {
  if (!str) return null;

  // FORMAT 1: ISO (2026-04-01 atau 2026-04-01T00:00:00)
  if (str.includes("-")) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // FORMAT 2: dd/mm/yyyy
  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts;
    const d = new Date(`${yyyy}-${mm}-${dd}`);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}


let permohonanChartInstance = null;
let cacheDetailPermohonan = [];
//let PERMOHONAN_INITED = false;


const PERMOHONAN_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1"
];

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

function initTahunDropdown() {

  const select = document.getElementById("tahunSelect");
  if (!select) return;

  select.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = "Semua Tahun";
  select.appendChild(optAll);

  const tahunSet = new Set();

  window.CACHE_BERKAS.forEach(row => {
    const tgl = parseTanggalIndonesia(row["Tanggal mulai"]);
    if (tgl && !isNaN(tgl.getTime())) {
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

  select.value = "all";
}


function rekapByField({ field, tahun = null, bulan = null }) {

  const hasil = {};

  window.CACHE_BERKAS.forEach(row => {

    if (tahun || bulan) {
      const tgl = parseTanggalIndonesia(row["Tanggal mulai"]);
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

    const tgl = parseTanggalIndonesia(row["Tanggal mulai"]);
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

function initDashboardPermohonan() {

  const canvas = document.getElementById("permohonanChart");
  if (!canvas) return;

  
  if (permohonanChartInstance) {
    permohonanChartInstance.destroy();
    permohonanChartInstance = null;
  }

  
  cacheDetailPermohonan = [];

  loadCacheBerkas().then(() => {
    initTahunDropdown();
    loadRekapPermohonan();
  });

  
  const tahunSelect = document.getElementById("tahunSelect");
  const bulanSelect = document.getElementById("bulanSelect");

  if (tahunSelect) {
    tahunSelect.onchange = loadRekapPermohonan;
  }

  if (bulanSelect) {
    bulanSelect.onchange = loadRekapPermohonan;
  }
}

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

/* 18===============================daftar-petugas.js=============================== */
/* 19===============================daftar-petugas-ukur.js=============================== */


let puTableBody, puBtnTambah, puBtnEdit, puBtnHapus;
let puSelectedNama = null;
let puMode = "add"; // add | edit

function initPetugasUkur() {
  puTableBody = document.getElementById("tablePetugasUkur");
  puBtnTambah = document.getElementById("btnTambahUkur");
  puBtnEdit   = document.getElementById("btnEditUkur");
  puBtnHapus  = document.getElementById("btnHapusUkur");

  if (!puTableBody || !puBtnTambah || !puBtnEdit || !puBtnHapus) {
    console.error("Petugas Ukur: element belum siap");
    return;
  }

  puBtnTambah.onclick = puOpenTambah;
  puBtnEdit.onclick   = puOpenEdit;
  puBtnHapus.onclick  = puHapus;

  puLoad();
}

async function puLoad() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.username) throw "Session tidak valid";

    const res = await fetch("https://webapi.berkasplus.my.id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getPetugasUkur",
        username: user.username
      })
    });

    const json = await res.json();
    if (!json.success) throw json.message;

    puRender(json.data || []);
  } catch (err) {
    puTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-red-500">
          Gagal mengambil data
        </td>
      </tr>`;
  }
}

function puRender(data) {
  puTableBody.innerHTML = "";
  puClearSelection(); 

  if (data.length === 0) {
    puTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-gray-400 italic">
          Belum ada petugas ukur
        </td>
      </tr>`;
    return;
  }

  data.forEach(nama => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="border px-3 py-1">${nama}</td>`;
    tr.onclick = () => puSelectRow(tr, nama);
    puTableBody.appendChild(tr);
  });
}

function puSelectRow(row, nama) {
  puClearSelection();

  row.classList.add("selected");
  puSelectedNama = nama;

  puBtnEdit.disabled = false;
  puBtnHapus.disabled = false;

  puBtnEdit.classList.remove("bg-indigo-400", "cursor-not-allowed");
  puBtnEdit.classList.add("bg-indigo-600");

  puBtnHapus.classList.remove("bg-red-400", "cursor-not-allowed");
  puBtnHapus.classList.add("bg-red-500");
}


function puClearSelection() {
  puSelectedNama = null;

  
  document
    .querySelectorAll("#tablePetugasUkur tr")
    .forEach(r => r.classList.remove("selected"));

  
  puBtnEdit.disabled = true;
  puBtnHapus.disabled = true;

  puBtnEdit.classList.remove("bg-indigo-600");
  puBtnEdit.classList.add("bg-indigo-400", "cursor-not-allowed");

  puBtnHapus.classList.remove("bg-red-500");
  puBtnHapus.classList.add("bg-red-400", "cursor-not-allowed");
}

function puOpenTambah() {
  puMode = "add";
  puNama.value = "";
  modalUkur.classList.remove("hidden");
}

function puOpenEdit() {
  if (!puSelectedNama) return;
  puMode = "edit";
  puNama.value = puSelectedNama;
  modalUkur.classList.remove("hidden");
}

function closeModalPetugasUkur() {
  const modal = document.getElementById("modalUkur");
  if (modal) modal.classList.add("hidden");
}

async function submitPetugasUkur() {
  const nama = puNama.value.trim();
  if (!nama) return alert("Nama wajib diisi");

  const user = JSON.parse(localStorage.getItem("user"));

  const payload =
    puMode === "add"
      ? { action: "addPetugasUkur", nama }
      : { action: "updatePetugasUkur", oldNama: puSelectedNama, nama };

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      username: user.username
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  closeModalPetugasUkur();
  puLoad();
}

async function puHapus() {
  if (!puSelectedNama) return;
  if (!confirm(`Hapus petugas ukur:\n${puSelectedNama}?`)) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deletePetugasUkur",
      username: user.username,
      nama: puSelectedNama
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  puLoad();
}

window.initPetugasUkur = initPetugasUkur;


/* 20===============================jenis-permohonan.js=============================== */


let jpTableBody, jpBtnTambah, jpBtnEdit, jpBtnHapus;
let jpSelectedNama = null;
let jpMode = "add"; // add | edit


function initJenisPermohonan() {
  jpTableBody = document.getElementById("tableJenisPermohonan");
  jpBtnTambah = document.getElementById("jpBtnTambah");
  jpBtnEdit   = document.getElementById("jpBtnEdit");
  jpBtnHapus  = document.getElementById("jpBtnHapus");

  if (!jpTableBody || !jpBtnTambah || !jpBtnEdit || !jpBtnHapus) {
    console.error("Jenis Permohonan: element belum siap");
    return;
  }

  jpBtnTambah.onclick = jpOpenTambah;
  jpBtnEdit.onclick   = jpOpenEdit;
  jpBtnHapus.onclick  = jpHapus;

  jpLoad();
}

async function jpLoad() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.username) throw "Session tidak valid";

    const res = await fetch("https://webapi.berkasplus.my.id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getJenisPermohonan",
        username: user.username
      })
    });

    const json = await res.json();
    if (!json.success) throw json.message;

    jpRender(json.data || []);
  } catch (err) {
    jpTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-red-500">
          Gagal mengambil data
        </td>
      </tr>`;
  }
}

function jpRender(data) {
  jpTableBody.innerHTML = "";
  jpClearSelection();

  if (data.length === 0) {
    jpTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-gray-400 italic">
          Belum ada jenis permohonan
        </td>
      </tr>`;
    return;
  }

  data.forEach(nama => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="border px-3 py-1">${nama}</td>`;

    tr.onclick = () => jpSelectRow(tr, nama);
    jpTableBody.appendChild(tr);
  });
}

function jpSelectRow(row, nama) {
  document
    .querySelectorAll("#tableJenisPermohonan tr")
    .forEach(r => r.classList.remove("selected"));

  row.classList.add("selected");
  jpSelectedNama = nama;

  jpBtnEdit.disabled = false;
  jpBtnHapus.disabled = false;

  jpBtnEdit.classList.replace("bg-indigo-400", "bg-indigo-600");
  jpBtnEdit.classList.remove("cursor-not-allowed");

  jpBtnHapus.classList.replace("bg-red-400", "bg-red-500");
  jpBtnHapus.classList.remove("cursor-not-allowed");
}

function jpClearSelection() {
  jpSelectedNama = null;

  jpBtnEdit.disabled = true;
  jpBtnHapus.disabled = true;

  jpBtnEdit.classList.replace("bg-indigo-600", "bg-indigo-400");
  jpBtnEdit.classList.add("cursor-not-allowed");

  jpBtnHapus.classList.replace("bg-red-500", "bg-red-400");
  jpBtnHapus.classList.add("cursor-not-allowed");
}

function jpOpenTambah() {
  jpMode = "add";
  jpNama.value = "";
  jpModalTitle.innerText = "Tambah Jenis Permohonan";
  modalJP.classList.remove("hidden");
}

function jpOpenEdit() {
  if (!jpSelectedNama) return;
  jpMode = "edit";
  jpNama.value = jpSelectedNama;
  jpModalTitle.innerText = "Edit Jenis Permohonan";
  modalJP.classList.remove("hidden");
}

function jpCloseModal() {
  modalJP.classList.add("hidden");
}

async function jpSubmit() {
  const nama = jpNama.value.trim();
  if (!nama) return alert("Nama wajib diisi");

  const user = JSON.parse(localStorage.getItem("user"));

  const payload =
    jpMode === "add"
      ? { action: "addJenisPermohonan", nama }
      : { action: "updateJenisPermohonan", oldNama: jpSelectedNama, nama };

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      username: user.username
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  jpCloseModal();
  jpLoad();
}

async function jpHapus() {
  if (!jpSelectedNama) return;
  if (!confirm(`Hapus jenis permohonan:\n${jpSelectedNama}?`)) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deleteJenisPermohonan",
      username: user.username,
      nama: jpSelectedNama
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  jpLoad();
}

window.initJenisPermohonan = initJenisPermohonan;


/* 21===============================upload-berkas.js=============================== */


let STAGING_DATA = [];


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


  function processRows(rows) {
    STAGING_DATA = [];
    const nomorSet = new Set();
    const tahun = new Date().getFullYear();

    rows.slice(1).forEach(r => {
      const rawR = String(r.R || "").toLowerCase();

      
      if (rawR.includes("selesai")) return;

    
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


  function resetAll() {
    STAGING_DATA = [];
    previewTbl.innerHTML = "";
    previewSec.classList.add("hidden");
    fileInput.value = "";
    resultBox.innerHTML = "";
  }
}


function importToServer() {
  if (!STAGING_DATA.length) {
    alert("Tidak ada data preview untuk diimport");
    return;
  }


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


  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });


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


function downloadPreview() {
    if (!STAGING_DATA || !STAGING_DATA.length) {
      alert("Tidak ada data preview untuk diunduh");
      return;
    }
  
   
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
    XLSX.utils.book_append_sheet(wb, ws, "Preview Import");
  
    
    const filename = `Preview_Import_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
  
    
    XLSX.writeFile(wb, filename);
  }

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}


/* 22===============================plotting.js=============================== */

(function () {

    if (window.__PLOTTING_LOADED__) return;
    window.__PLOTTING_LOADED__ = true;
  
    if (!window.APP_CONFIG || !APP_CONFIG.API_WEB) {
      console.error("APP_CONFIG.API_WEB belum diset");
      return;
    }
  
    const API_URL = APP_CONFIG.API_WEB;
  
    let plottingData = [];
    let filteredData = [];
    let selectedData = null;
  
    window.initPloting = function () {
      console.log("INIT PLOTTING ✔");
      resetFormProses();   // ⬅️ WAJIB
      showEmptyProses();
      setupTabs();
      setupEvents();
      loadPlotingData();
    };
  
    function setupTabs() {
      const tabs = document.querySelectorAll(".tab-btn");
      const contents = document.querySelectorAll(".tab-content");
      if (!tabs.length) return;
  
      tabs.forEach(t => t.classList.remove("text-blue-600", "border-b-2"));
      contents.forEach(c => c.classList.add("hidden"));
  
      tabs[0].classList.add("text-blue-600", "border-b-2");
      document.getElementById(tabs[0].dataset.tab)?.classList.remove("hidden");
  
      tabs.forEach(btn => {
        btn.onclick = () => {
          tabs.forEach(t => t.classList.remove("text-blue-600", "border-b-2"));
          contents.forEach(c => c.classList.add("hidden"));
          btn.classList.add("text-blue-600", "border-b-2");
          document.getElementById(btn.dataset.tab)?.classList.remove("hidden");
          if (btn.dataset.tab === "tab-data") {
            resetFormProses();
          }
        };
      });
    }
    function getLoginUser() {
      try {
        return JSON.parse(localStorage.getItem("user")) || {};
      } catch {
        return {};
      }
    }

    function setupEvents() {
  
      
        const fileInput = document.getElementById("uploadFilePlotting");
        const labelFile = document.getElementById("namaFilePlotting");
  
        if (fileInput && labelFile) {
          fileInput.addEventListener("change", e => {
            const file = e.target.files[0];
  
            if (!file) {
              labelFile.innerText = "Belum ada file";
              labelFile.classList.remove("text-green-600");
              labelFile.classList.add("text-gray-500");
              return;
            }
  
            labelFile.innerText = file.name;
            labelFile.classList.remove("text-gray-500");
            labelFile.classList.add("text-green-600");
          });
        }
  
     
      document.querySelector("#tab-data")?.addEventListener("click", e => {
        if (selectedData) {
          alert("Selesaikan atau batalkan proses sebelumnya terlebih dahulu.");
          return;
        }
        const btn = e.target.closest(".btn-pilih");
        if (!btn) return;
      
        const item = JSON.parse(decodeURIComponent(btn.dataset.item));
      
        
        fetch(APP_CONFIG.API_WEB, {
          method: "POST",
          body: JSON.stringify({
            action: "setProcessing",
            row: item.id   
          })
        })
        .then(r => r.json())
        .then(res => {
      
          
          if (!res.success) {
            alert(res.message || "Data sedang diproses petugas lain");
            return;
          }
      
          
          selectedData = item;
      
          
          loadPlotingData();
      
          
          setText("info-Nama", item.nama_pemilik);
          document.getElementById("edit-NoHak").value = item.nomor_hak || "";
          document.getElementById("edit-NIB").value  = item.nib || "";
          document.getElementById("edit-SU").value   = item.surat_ukur || "";
          setText("info-wilayah", item.desa_kecamatan);
      
          setLink("info-Lokasi", item.link_lokasi);
          setLink("info-Lampiran", item.lampiran);
      
          
          showFormProses();
          document.querySelector('[data-tab="tab-proses"]')?.click();
        })
        .catch(err => {
          console.error(err);
          alert("Gagal terhubung ke server");
        });
      });
      
      
      document.getElementById("btnCari")?.addEventListener("click", () => {
        const noHak = getVal("filterNoHak");
        const desa  = getVal("filterDesa");
  
        filteredData = plottingData.filter(d =>
          (!noHak || String(d.nomor_hak).toLowerCase().includes(noHak)) &&
          (!desa  || String(d.desa_kecamatan).toLowerCase().includes(desa))
        );
        renderTable();
      });
  
     
      document.getElementById("btnReset")?.addEventListener("click", () => {
        setVal("filterNoHak", "");
        setVal("filterDesa", "");     
        const status = getVal("filterStatus");      
        if (status === "done") {      
          filteredData = plottingData.filter(
            d => d.status_proses === "DONE"
          );     
        } else if (status === "progress") {     
          filteredData = plottingData.filter(
            d => d.status_proses !== "DONE"
          );     
        } else {      
          filteredData = [...plottingData];      
        }      
        renderTable();     
      });

      document.getElementById("filterStatus")?.addEventListener("change", function () {
        const status = this.value;
        if (status === "all") {
          filteredData = [...plottingData];
        } else if (status === "done") {
          filteredData = plottingData.filter(
            d => d.status_proses === "DONE"
          );
        } else if (status === "progress") {
          filteredData = plottingData.filter(
            d => d.status_proses !== "DONE"
          );
        }
        renderTable();
      });
  
      
      document.getElementById("btnBatal")?.addEventListener("click", () => {
  
        if (!selectedData) {
          alert("Tidak ada data yang sedang diproses");
          return;
        }
  
        if (!confirm("Batalkan proses plotting ini?")) return;
  
        fetch(APP_CONFIG.API_WEB, {
          method: "POST",
          body: JSON.stringify({
            action: "releaseProcessing",
            row: selectedData.id
          })
        })
        .then(r => r.json())
        .then(res => {
          if (!res.success) {
            alert(res.message || "Gagal membatalkan proses");
            return;
          }
  
          
          resetFormProses();
          showEmptyProses();
  
          
          loadPlotingData();
  
         
          document.querySelector('[data-tab="tab-data"]')?.click();
        })
        .catch(err => {
          console.error(err);
          alert("Gagal terhubung ke server");
        });
      });
      
      document.getElementById("btnSimpan")?.addEventListener("click", () => {
  
        if (!selectedData) {
          alert("Tidak ada data yang dipilih");
          return;
        }
        const user = getLoginUser();
        
        const nomorHak  = document.getElementById("edit-NoHak").value.trim();
        const nib       = document.getElementById("edit-NIB").value.trim();
        const suratUkur = document.getElementById("edit-SU").value.trim();
  
        
        if (!nomorHak || !nib || !suratUkur) {
          alert("Nomor Hak, Nomor NIB, dan Nomor Surat Ukur wajib diisi.");
          return;
        }
  
        const payload = {
          action: "simpanPlotting",
          row: selectedData.id,
  
            
          nomor_hak: document.getElementById("edit-NoHak").value.trim(),
          nib: document.getElementById("edit-NIB").value.trim(),
          surat_ukur: document.getElementById("edit-SU").value.trim(),
        
          
          petugas: user.nama_lengkap || user.nama || user.username || "UNKNOWN",
        
          plotting_peta: document.getElementById("cekPlotting")?.checked || false,
          validasi_nib: document.getElementById("cekNIB")?.checked || false,
          validasi_su: document.getElementById("cekSU")?.checked || false,
        
          keterangan: document.getElementById("keteranganProses")?.value || ""
        };
        console.log("KIRIM SIMPAN:", payload); 
  
        fetch(APP_CONFIG.API_WEB, {
          method: "POST",
          body: JSON.stringify(payload)
        })
          .then(r => r.json())
          .then(async res => {
            console.log("RESP SIMPAN:", res);
  
            if (!res.success) {
              alert(res.message || "Gagal menyimpan plotting");
              return;
            }
  
            const noPlot = res.data.no_plotting;
            const fileInput = document.getElementById("uploadFilePlotting");
            const file = fileInput?.files?.[0] || null;
  
            
            const imageBase64 = await fileToBase64(file);
  
            
            fetch(APP_CONFIG.API_WEB, {
              method: "POST",
              body: JSON.stringify({
                action: "generatePlottingPDF",
                no_plotting: noPlot,
                image: imageBase64
              })
            })
            .then(r => r.json())
            .then(pdfRes => {
  
              if (!pdfRes.success) {
                alert("Plotting tersimpan, tapi PDF gagal dibuat");
                console.error(pdfRes);
                return;
              }
            
              
            
              
              document.querySelectorAll(".link-pdf-plotting")
                .forEach(el => el.remove());
            
              const container =
                document.getElementById("tab-proses") || document.body;
            
              
              const link = document.createElement("a");
              link.href = pdfRes.data.pdf_url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.innerText = "Download Pdf Plotting";
              link.className =
                "link-pdf-plotting block mt-4 text-blue-600 underline font-semibold";
            
              container.appendChild(link);
            
              
              const btnDone = document.createElement("button");
              btnDone.innerText = "✔ Selesai & Kembali ke Data";
              btnDone.className =
                "btn-done-plotting mt-3 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300";
            
              btnDone.onclick = () => {
                resetFormProses();
                showEmptyProses();
                loadPlotingData();
                document.querySelector('[data-tab=\"tab-data\"]')?.click();
              };
            
              container.appendChild(btnDone);
            
              alert(`Plotting & PDF berhasil dibuat\nNo Plotting: ${noPlot}`);
            
            })
            .catch(err => {
              console.error(err);
              alert("Gagal generate PDF");
            });
          })
          .catch(err => {
            console.error(err);
            alert("Gagal terhubung ke server");
          });
      });
    }
  
    function loadPlotingData() {
      fetch(`${API_URL}?action=plotting`)
        .then(r => r.json())
        .then(res => {
  
          console.log("RESP PLOTTING:", res);
  
          if (!res || res.success !== true || !Array.isArray(res.data)) {
            alert("Gagal load data plotting");
            return;
          }
  
          plottingData = res.data.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
  
          filteredData = [...plottingData];
          applyStatusFilter();
        })
        .catch(err => {
          console.error("API plotting error:", err);
          alert("API plotting error");
        });
    }

    function applyStatusFilter() {

      const status = getVal("filterStatus");
    
      if (status === "done") {
    
        filteredData = plottingData.filter(
          d => d.status_proses === "DONE"
        );
    
      } else if (status === "progress") {
    
        filteredData = plottingData.filter(
          d => d.status_proses !== "DONE"
        );
    
      } else {
    
        filteredData = [...plottingData];
    
      }
    
      renderTable();
    
    }
  
    function renderTable() {
  
      const tbody = document.querySelector("#tab-data tbody");
      if (!tbody) return;
  
      tbody.innerHTML = "";
  
      if (!filteredData.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="14" class="text-center py-4 text-gray-400">
              Tidak ada data
            </td>
          </tr>`;
        return;
      }
  
      filteredData.forEach((d, i) => {
  
        const disabled = d.status_proses === "PROCESSING";
        const encoded = encodeURIComponent(JSON.stringify(d));
  
        tbody.insertAdjacentHTML("beforeend", `
          <tr class="${disabled ? "bg-yellow-50 opacity-70" : "hover:bg-blue-50"}">
            <td>${i + 1}</td>
            <td>${formatTanggal(d.timestamp)}</td>
            <td>${d.email_address || "-"}</td>
            <td>${makeLink(d.link_lokasi)}</td>
            <td>${makeLink(d.lampiran)}</td>
            <td>${d.nama_pemilik || "-"}</td>
            <td>${formatTanggal(d.tanggal_lahir)}</td>
            <td>${d.telepon || "-"}</td>
            <td>${d.jenis_permohonan || "-"}</td>
            <td>${d.jenis_hak || "-"}</td>
            <td>${d.nomor_hak || "-"}</td>
            <td>${d.nib || "-"}</td>
            <td>${d.surat_ukur || "-"}</td>
            <td>${d.desa_kecamatan || "-"}</td>
            <td>
              ${
                d.status_proses === "PROCESSING"
                  ? `<span class="bg-yellow-400 text-white px-2 py-1 text-xs rounded">
                      Diproses
                    </span>`
                  : d.status_proses === "DONE"
                  ? `<span class="bg-green-600 text-white px-1 py-0 text-xs rounded">
                      DONE
                    </span>`
                  : `<button class="btn-pilih bg-indigo-600 text-white px-1 py-0 text-xs rounded"
                      data-item="${encoded}">
                      Proses
                    </button>`
              }
            </td>
          </tr>
        `);
      });
    }

    function makeLink(v) {
      return v
        ? `<a href="${v}" target="_blank" class="text-blue-600 underline">Buka</a>`
        : "-";
    }
    function setText(id, val) {
      const el = document.getElementById(id);
      if (el) el.innerText = val || "-";
    }
    function setLink(id, val) {
      const el = document.getElementById(id);
      if (!el) return;
      el.href = val || "#";
      el.innerText = val ? "Buka" : "-";
    }
    function getVal(id) {
      return (document.getElementById(id)?.value || "").toLowerCase().trim();
    }
    function setVal(id, v) {
      const el = document.getElementById(id);
      if (el) el.value = v;
    }
  
    function formatTanggal(value) {
      if (!value) return "-";
    
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
    
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
    
      return `${dd}-${mm}-${yyyy}`;
    }
  
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
    
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1]; // buang prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  
    function showEmptyProses() {
      document.getElementById("emptyProses")?.classList.remove("hidden");
      document.getElementById("formProses")?.classList.add("hidden");
    }
    
    function showFormProses() {
      document.getElementById("emptyProses")?.classList.add("hidden");
      document.getElementById("formProses")?.classList.remove("hidden");
    }

    function resetFormProses() {
      selectedData = null;
    
      setText("info-Nama", "-");
      setText("info-wilayah", "-");
      setLink("info-Lokasi", "");
      setLink("info-Lampiran", "");
  
      ["edit-NoHak", "edit-NIB", "edit-SU"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    
      ["cekPlotting", "cekNIB", "cekSU"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
      });
    
      const ket = document.getElementById("keteranganProses");
      if (ket) ket.value = "";
    
      const fileInput = document.getElementById("uploadFilePlotting");
      if (fileInput) fileInput.value = "";
    
      const labelFile = document.getElementById("namaFilePlotting");
      if (labelFile) {
        labelFile.innerText = "Belum ada file";
        labelFile.classList.remove("text-green-600");
        labelFile.classList.add("text-gray-500");
      }
    
     
      document.querySelectorAll(".link-pdf-plotting")
        .forEach(el => el.remove());
    
     
      document.querySelectorAll(".btn-done-plotting")
        .forEach(el => el.remove());
    }
  
  })();


/* 23===============================daftar-plotting.js=============================== */

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


function loadDaftarPloting() {
  const url = `${API_URL}?action=daftarPlot_getPlot`;
  console.log("FETCH:", url);

  fetch(url)
    .then(res => res.json())
    .then(res => {

      console.log("RESPONSE API:", res);

      let data = [];

    
      if (Array.isArray(res)) {
        data = res;
      } 
      else if (res.data && Array.isArray(res.data)) {
        data = res.data;
      } 
      else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } 
      else {
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
    .catch(err => {
      console.error("ERROR:", err);
      alert("Koneksi gagal");
    });
}

function formatTanggal(value){

  if(!value) return "";

  if(typeof value === "string" && value.includes("/")){
    return value;
  }

  if(typeof value === "string" && value.includes("T")){
    value = value.replace("T"," ").split(".")[0];
  }

  const d = new Date(value);
  if(isNaN(d)) return value;

  const tgl = String(d.getDate()).padStart(2,"0");
  const bln = String(d.getMonth()+1).padStart(2,"0");
  const thn = d.getFullYear();
  const jam = String(d.getHours()).padStart(2,"0");
  const min = String(d.getMinutes()).padStart(2,"0");

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
      ${row.map((col, idx) => {

       
        if (idx === 14) {
          col = formatTanggal(col);
        }
      
        return `
          <td class="border px-1 py-1">${col ?? ""}</td>
        `;
      
      }).join("")}
    `;
    tbody.appendChild(tr);
  });
}

let GLOBAL_DATA_PLOTING = [];
let FILTERED_DATA_PLOTING = [];

function initFilterTanggalPloting() {

  const filterBulan =
    document.getElementById("filterBulan");

  const filterTahun =
    document.getElementById("filterTahun");

  if (!filterBulan || !filterTahun) return;

  const bulanSet = new Set();
  const tahunSet = new Set();

  GLOBAL_DATA_PLOTING.forEach(row => {

    const tanggal = formatTanggal(row[14]);

    if (!tanggal) return;

    const tanggalOnly = tanggal.split(" ")[0];

    const parts = tanggalOnly.split("/");

    if (parts.length < 3) return;

    bulanSet.add(parts[1]);
    tahunSet.add(parts[2]);

  });

  const namaBulan = {
    "01":"Januari",
    "02":"Februari",
    "03":"Maret",
    "04":"April",
    "05":"Mei",
    "06":"Juni",
    "07":"Juli",
    "08":"Agustus",
    "09":"September",
    "10":"Oktober",
    "11":"November",
    "12":"Desember"
  };

  filterBulan.innerHTML =
    `<option value="">Semua Bulan</option>`;

  filterTahun.innerHTML =
    `<option value="">Semua Tahun</option>`;

  [...bulanSet]
    .sort()
    .forEach(bulan => {

      filterBulan.innerHTML += `
        <option value="${bulan}">
          ${namaBulan[bulan]}
        </option>
      `;

    });

  [...tahunSet]
    .sort()
    .reverse()
    .forEach(tahun => {

      filterTahun.innerHTML += `
        <option value="${tahun}">
          ${tahun}
        </option>
      `;

    });

  function applyFilterTanggal() {

    const bulan = filterBulan.value;
    const tahun = filterTahun.value;

    const hasil = GLOBAL_DATA_PLOTING.filter(row => {

      const tanggal = formatTanggal(row[14]);

      if (!tanggal) return false;

      const tanggalOnly =
        tanggal.split(" ")[0];

      const parts =
        tanggalOnly.split("/");

      if (parts.length < 3)
        return false;

      const bln = parts[1];
      const thn = parts[2];

      const cocokBulan =
        !bulan || bln === bulan;

      const cocokTahun =
        !tahun || thn === tahun;

      return cocokBulan && cocokTahun;

    });

    FILTERED_DATA_PLOTING = hasil;

    renderTablePloting(hasil);

  }

  filterBulan.addEventListener(
    "change",
    applyFilterTanggal
  );

  filterTahun.addEventListener(
    "change",
    applyFilterTanggal
  );

}


function initFilterDaftarPloting() {
  const btnCari = document.getElementById("btnCari");
  const btnReset = document.getElementById("btnReset");

  if (!btnCari || !btnReset) return;

  btnCari.addEventListener("click", () => {

    const inputNoHak = document.getElementById("filterNoHak").value.toLowerCase();
    const inputDesa  = document.getElementById("filterDesa").value.toLowerCase();

    const hasil = GLOBAL_DATA_PLOTING.filter(row => {

      
      const rawNoHak = (row[9] || "").toString().toLowerCase();

      
      const cleanNoHak = rawNoHak.replace(/[^\d]/g, "");
      const cleanInput = inputNoHak.replace(/[^\d]/g, "");

      
      const desa = (row[12] || "").toString().toLowerCase();

      
      const cocokNoHak =
        rawNoHak.includes(inputNoHak) || 
        cleanNoHak.includes(cleanInput); 

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
  const btn = [...document.querySelectorAll("button")]
    .find(b => b.innerText.includes("Download Excel"));

  if (!btn) return;

  btn.addEventListener("click", () => {

    const dataExport =
      FILTERED_DATA_PLOTING.length
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
      "Keterangan"
    ];
  
    // FORMAT DATA AGAR SAMA DENGAN TABEL WEB
    const rows = dataExport.map(row => {
  
      const newRow = [...row];
  
      // FORMAT TANGGAL PROSES
      newRow[14] = formatTanggal(newRow[14]);
  
      // FORMAT NIB AGAR TIDAK MENJADI SCIENTIFIC
      newRow[10] = "'" + (newRow[10] ?? "");
  
      return newRow;
  
    });
  
    const finalData = [
      headers,
      ...rows
    ];
  
    const workbook =
      XLSX.utils.book_new();
  
    const worksheet =
      XLSX.utils.aoa_to_sheet(finalData);
  
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Daftar_Ploting"
    );
  
    const filename =
      `Daftar_Ploting_${new Date()
        .toISOString()
        .slice(0,10)}.xlsx`;
  
    XLSX.writeFile(workbook, filename);
  
  });
}

function loadDaftarEmail() {
  fetch(`${API_URL}?action=daftarPlot_getEmail`)
    .then(res => res.json())
    .then(res => {
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
    .catch(err => {
      console.error("LOAD EMAIL ERROR:", err);
      alert("Koneksi gagal");
    });
}
function initSearchEmail(){

  const input = document.getElementById("searchEmail");
  if(!input) return;


  if(input.dataset.searchReady) return;
  input.dataset.searchReady = "1";

  input.addEventListener("input", function(){

    const keyword = this.value.toLowerCase();
    const rows = document.querySelectorAll("#tab-email tbody tr");

    rows.forEach(row => {

      const text = row.textContent.toLowerCase();

      row.style.display = text.includes(keyword)
        ? ""
        : "none";

    });

  });

}

function initDaftarEmailTab() {
  const tableBody = document.querySelector("#tab-email tbody");
  const btnTambah = [...document.querySelectorAll("button")]
    .find(b => b.innerText.includes("Tambah Email"));

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
        telp
      },
      loadDaftarEmail
    );
  });


  tableBody.addEventListener("click", e => {
    const tr = e.target.closest("tr");
    if (!tr) return;


    const sheetRow = tr.rowIndex + 1;

    
    if (e.target.classList.contains("edit-email")) {
      const email = prompt("Alamat Email:", tr.cells[1].innerText);
      const nama  = prompt("Nama Notaris:", tr.cells[2].innerText);
      const telp  = prompt("No Telp:", tr.cells[3].innerText);

      if (!email || !nama || !telp) return;

      postAPI(
        {
          action: "daftarPlot_updateEmail",
          row: sheetRow,   
          email,
          nama,
          telp
        },
        loadDaftarEmail
      );
    }

    if (e.target.classList.contains("delete-email")) {
      if (!confirm("Yakin ingin menghapus email ini?")) return;

      postAPI(
        {
          action: "daftarPlot_deleteEmail",
          row: sheetRow  
        },
        loadDaftarEmail
      );
    }
  });
}


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
      console.error("POST ERROR:", err);
      alert("Koneksi gagal");
    });
}
