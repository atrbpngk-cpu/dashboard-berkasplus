/* =====================================================
   AUTH.JS - FINAL VERSION (FIXED)
   Sistem Autentikasi & Session
   Backend: https://webapi.berkasplus.my.id
===================================================== */

// ===============================
// KONFIGURASI
// ===============================
const API_WEB = "https://webapi.berkasplus.my.id";

// ===============================
// LOGIN
// ===============================
async function login(e) {
  e.preventDefault();

  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const error = document.getElementById("error");

  if (error) error.classList.add("hidden");

  // Validasi input
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

    // ===============================
    // ✅ VALIDASI RESPONSE (FIX)
    // ===============================
    if (!json.success || !json.data) {
      if (error) {
        error.textContent =
          json.message ||
          "Login gagal! Username atau password salah";
        error.classList.remove("hidden");
      }
      return;
    }

    // ===============================
    // SIMPAN SESSION
    // ===============================
    localStorage.setItem("login", "true");
    localStorage.setItem(
      "user",
      JSON.stringify(json.data) // ⬅️ LANGSUNG data
    );

    // Redirect ke dashboard
    window.location.href = "index.html";

  } catch (err) {
    if (error) {
      error.textContent = "Gagal koneksi ke server";
      error.classList.remove("hidden");
    }
  }
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "login.html";
}

// ===============================
// HELPER
// ===============================
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

// ===============================
// EXPORT GLOBAL
// ===============================
window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isLogin = isLogin;
window.isAdmin = isAdmin;
