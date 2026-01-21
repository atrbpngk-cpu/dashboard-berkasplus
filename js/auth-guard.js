/* ======================================================
   AUTH GUARD
   Proteksi halaman WEB
====================================================== */

(function authGuard() {
    const publicPages = [
      "login.html",
      "register.html"
    ];
  
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();
  
    // jika halaman publik → tidak dicek
    if (publicPages.includes(currentPage)) {
      return;
    }
  
    const loginStatus = localStorage.getItem("login");
    const userRaw = localStorage.getItem("user");
  
    // belum login
    if (loginStatus !== "true" || !userRaw) {
      forceLogout();
      return;
    }
  
    let user;
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      forceLogout();
      return;
    }
  
    // validasi minimal user
    if (!user.username || !user.role || !user.token) {
      forceLogout();
      return;
    }
  
    // kalau lolos → user valid
    console.log("AuthGuard OK:", user.username);
  })();
  
  /* ======================================================
     FORCE LOGOUT
  ====================================================== */
  function forceLogout() {
    localStorage.removeItem("login");
    localStorage.removeItem("user");
    sessionStorage.removeItem("welcomeShown");
  
    window.location.href = "login.html";
  }
  