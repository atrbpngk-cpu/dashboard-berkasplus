/* ======================================================
   AUTH GUARD (FINAL & STABIL)
   - Hanya validasi login
   - Tidak mengatur UI
   - Aman untuk SPA (router fetch)
====================================================== */

(function authGuard() {
  // Halaman yang boleh diakses tanpa login
  const publicPages = ["login.html", "register.html"];

  // Ambil nama file saat ini
  const currentPage = location.pathname
    .split("/")
    .pop()
    .toLowerCase();

  // Jika halaman publik → lewati guard
  if (publicPages.includes(currentPage)) {
    return;
  }

  // Ambil session
  const loginStatus = localStorage.getItem("login");
  const userRaw = localStorage.getItem("user");

  // Tidak login / session rusak
  if (loginStatus !== "true" || !userRaw) {
    clearSessionAndRedirect();
    return;
  }

  // Validasi user JSON
  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    clearSessionAndRedirect();
    return;
  }

  // Validasi minimal user (SESUAI BACKEND)
  if (!user.username) {
    clearSessionAndRedirect();
    return;
  }

  // ✔ LOLOS AUTH
  // Tidak melakukan apa-apa ke UI
  // Router yang bertanggung jawab render
})();

/* ======================================================
   CLEAR SESSION + REDIRECT
====================================================== */
function clearSessionAndRedirect() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace("login.html");
}
