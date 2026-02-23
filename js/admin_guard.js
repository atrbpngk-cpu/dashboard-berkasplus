/* ======================================================
   ADMIN GUARD (FINAL & STABIL)
   - Hanya untuk halaman khusus Administrator
   - Sinkron dengan backend (Apps Script)
   - Aman untuk SPA
====================================================== */

(function adminGuard() {
  const userRaw = localStorage.getItem("user");

  // Jika tidak ada session → auth_guard yang handle
  if (!userRaw) return;

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    return;
  }

  // Ambil role secara aman (case-insensitive)
  const role =
    user.role ||
    user.Role ||
    user["Role"] ||
    user["role"];

  if (!role || String(role).toLowerCase() !== "administrator") {
    alert("Akses ditolak! Maaf halaman ini hanya untuk Administrator.");
    window.location.replace("index.html");
    return;
  }

  // ✔ LOLOS ADMIN
})();
