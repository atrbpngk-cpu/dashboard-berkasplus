/* ======================================================
   AUTH CHECK (PROTEKSI HALAMAN)
====================================================== */
(function checkAuth() {
  if (localStorage.getItem("login") !== "true") {
    window.location.href = "login.html";
  }
})();

/* ======================================================
   SET USER NAME (TOPBAR)
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const el = document.getElementById("user-name");
  if (el) {
    el.innerText = user.nama || user.username || "User";
  }
});

/* ======================================================
   ROUTER / LOAD PAGE (FINAL)
====================================================== */
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

  // 🔐 ADMIN ONLY PAGES
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

      /* ======================================
         INIT PAGE SCRIPT (KUNCI UTAMA)
      ====================================== */
      setTimeout(() => {

        // DASHBOARD
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
          // ================== DASHBOARD PETUGAS UKUR ==================
          if (typeof initDashboardPU === "function") {
            console.log("INIT: Dashboard Petugas Ukur 📐");
            initDashboardPU();
          }
                    
        }


        // INFORMASI BERKAS
        if (page === "informasi-berkas.html" &&
            typeof initInformasiBerkas === "function") {
          console.log("INIT: Informasi Berkas 🚀");
          initInformasiBerkas();
        }

        // ENTRY DATA BERKAS
        if (page === "entry-data-berkas.html" &&
            typeof initEntryBerkas === "function") {
          console.log("INIT: Entry Data Berkas 🚀");
          initEntryBerkas();
        }

         // KIRIM BERKAS
        if (page === "kirim-berkas.html" &&
            typeof initKirimBerkas === "function") {
          console.log("INIT: Kirim Berkas 🚀");
          initKirimBerkas();
        }

        // INBOX BERKAS
        if (page === "inbox.html" &&
            typeof initInboxBerkas === "function") {
          console.log("INIT: Inbox Berkas");
          initInboxBerkas();
        }

        // HISTORY BERKAS
        if (page === "history-berkas.html" &&
            typeof initHistoryBerkas === "function") {
          console.log("INIT: History Berkas");
          initHistoryBerkas();                
        }

        // BEBAN PETUGAS
        if (page === "beban-petugas.html" &&
            typeof initBebanPetugas === "function") {
          console.log("INIT: Beban Petugas 📊");
          initBebanPetugas();
        }

        // BEBAN PETUGAS UKUR
        if (page === "beban-petugas-ukur.html" &&
            typeof initBebanPetugasUkur === "function") {
          console.log("INIT: Beban Petugas Ukur 📐");
          initBebanPetugasUkur();
        }

        // MONITORING PETUGAS UKUR
        if (page === "monitoring-petugas-ukur.html" &&
            typeof initBebanPetugasUkur === "function") {
        initBebanPetugasUkur("monitoring");
        }
        
        // ================== PLOTTING ==================
        if (page === "ploting.html" && typeof initPloting === "function") {
          initPloting();
        }

        // ================== DAFTAR PLOTING ==================
        if (page === "daftar-ploting.html" && typeof initDaftarPloting === "function") {
          console.log("INIT: Daftar Ploting 📊");
          initDaftarPloting();
        }
        
      

        // (ADMIN)
        // ================== DAFTAR PETUGAS ==================
        if (
          page === "daftar-petugas.html" &&
          typeof initDaftarPetugas === "function"
        ) {
          console.log("INIT: Daftar Petugas");
          initDaftarPetugas();
        }

        // ================== DAFTAR PETUGAS UKUR ==================
        if (
          page === "petugas-ukur.html" &&
          typeof initPetugasUkur === "function"
        ) {
          console.log("INIT: Daftar Petugas Ukur");
          initPetugasUkur();
        }

        // ================== JENIS PERMOHONAN ==================
        if (
          page === "jenis-permohonan.html" &&
          typeof initJenisPermohonan === "function"
        ) {
          console.log("INIT: Jenis Permohonan");
          initJenisPermohonan();
        }
        
        // ================= UPLOAD BERKAS =================
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

/* ======================================================
   ACTIVE MENU & SUBMENU
====================================================== */
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

/* ======================================================
   PAGE TITLE
====================================================== */
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

/* ======================================================
   SIDEBAR
====================================================== */
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

/* ======================================================
   INIT DEFAULT PAGE
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadPage("dashboard.html");
});

/* ======================================================
   USER MENU
====================================================== */
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
