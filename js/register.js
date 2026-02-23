// ===============================
// KONFIGURASI
// ===============================
const API_WEB = "https://webapi.berkasplus.my.id";

// ===============================
// REGISTER
// ===============================
async function register(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const nama = document.getElementById("nama").value.trim();

  if (!username || !password || !nama) {
    alert("Semua field wajib diisi");
    return;
  }

  try {
    const res = await fetch(API_WEB, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        username,
        password,
        nama
      })
    });

    const result = await res.json();

    // ❗ cek wrapper
    if (!result.success) {
      alert(result.message || "Registrasi gagal");
      return;
    }

    // ❗ cek hasil API register
    if (!result.data.success) {
      alert(result.data.message || "Registrasi gagal");
      return;
    }

    alert("Registrasi berhasil, silakan login");
    window.location.href = "login.html";

  } catch (err) {
    alert("Gagal terhubung ke server");
    console.error(err);
  }
}
