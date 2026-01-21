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
  if (el && user.name) {
    el.innerText = user.name;
  }
});

/* ======================================================
   ROUTER / LOAD PAGE
====================================================== */
function loadPage(page) {
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

      // khusus dashboard (opsional)
      if (page === "dashboard.html" && typeof showWelcomeOnce === "function") {
        setTimeout(showWelcomeOnce, 150);
      }
    })
    .catch(() => {
      document.getElementById("content").innerHTML =
        `<div class="p-6 text-red-600">Halaman tidak ditemukan</div>`;
    });
}

/* ======================================================
   ACTIVE MENU & SUBMENU (FINAL – TIDAK MENUTUP SENDIRI)
====================================================== */
function setActiveMenu(page) {
  // reset ACTIVE saja
  document
    .querySelectorAll(".menu, .submenu-item")
    .forEach(el => el.classList.remove("active"));

  // aktifkan menu berdasarkan data-page (EXACT MATCH)
  document
    .querySelectorAll(`[data-page="${page}"]`)
    .forEach(el => {
      el.classList.add("active");

      const group = el.closest(".menu-group");
      if (group) {
        group.classList.add("open"); // pastikan parent terbuka
      }
    });
}

/* ======================================================
   PAGE TITLE
====================================================== */
function setPageTitle(page) {
  const map = {
    "dashboard.html": "Dashboard",

    // BERKAS
    "informasi-berkas.html": "Informasi Berkas",
    "entry-data-berkas.html": "Entry Data Berkas",

    // APLIKASI
    "inbox.html": "Inbox",
    "kirim-berkas.html": "Kirim Berkas",
    "history-berkas.html": "History Berkas",

    // BERKASKU
    "beban-petugas.html": "Beban Petugas",
    "beban-petugas-ukur.html": "Beban Petugas Ukur",

    // TOOLS
    "daftar-petugas.html": "Daftar Petugas",
    "petugas-ukur.html": "Daftar Petugas Ukur",
    "jenis-permohonan.html": "Jenis Permohonan",
    "daftar-berkas.html": "Daftar Berkas",

    // PLOTING
    "ploting.html": "Ploting SiGundul",
    "data-ploting.html": "Data Ploting"
  };

  const titleEl = document.getElementById("page-title");
  if (titleEl) {
    titleEl.innerText = map[page] || "Dashboard";
  }
}

/* ======================================================
   SIDEBAR COLLAPSE
====================================================== */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.classList.toggle("collapsed");

  // saat collapse, tutup semua submenu
  if (sidebar.classList.contains("collapsed")) {
    document
      .querySelectorAll(".menu-group")
      .forEach(group => group.classList.remove("open"));
  }
}

/* ======================================================
   SUBMENU TOGGLE (SINGLE OPEN – USER ACTION ONLY)
====================================================== */
function toggleSubmenu(btn) {
  const group = btn.closest(".menu-group");
  if (!group) return;

  // tutup submenu lain
  document.querySelectorAll(".menu-group").forEach(g => {
    if (g !== group) g.classList.remove("open");
  });

  // toggle submenu yang diklik
  group.classList.toggle("open");
}

/* ======================================================
   INIT DEFAULT PAGE
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadPage("dashboard.html");
});


/* ======================================================
   USER DROPDOWN (LOGOUT ONLY)
====================================================== */
function toggleUserMenu() {
  document.getElementById("userMenu").classList.toggle("hidden");
}

// klik di luar → tutup dropdown
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("userDropdown");
  if (!dropdown) return;

  if (!dropdown.contains(e.target)) {
    document.getElementById("userMenu")?.classList.add("hidden");
  }
});

// logout FINAL
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
