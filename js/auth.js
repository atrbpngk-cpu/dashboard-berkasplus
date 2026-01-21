// ===============================
// KONFIGURASI
// ===============================
const API_WEB = "https://webapi.berkasplus.my.id";

// ===============================
// LOGIN
// ===============================
async function login(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  if (error) error.classList.add("hidden");

  try {
    const res = await fetch(API_WEB, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        payload: { username, password }
      })
    });

    const data = await res.json();

    if (!data.status) {
      if (error) {
        error.textContent = data.message || "Login gagal";
        error.classList.remove("hidden");
      }
      return;
    }

    // simpan session
    localStorage.setItem("login", "true");
    localStorage.setItem("token", data.user.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // reset welcome
    sessionStorage.removeItem("welcomeShown");

    // redirect berdasar role
    if (data.user.role === "Administrator") {
      window.location.href = "index.html";
    } else {
      window.location.href = "index.html";
    }

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
// CEK LOGIN (PROTEKSI HALAMAN)
// ===============================
function requireLogin() {
  if (localStorage.getItem("login") !== "true") {
    window.location.href = "login.html";
  }
}
