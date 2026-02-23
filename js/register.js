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
  const nama     = document.getElementById("nama").value.trim();

  if (!username || !password || !nama) {
    alert("Semua field wajib diisi");
    return;
  }

  try {
    const res = await fetch(API_WEB, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "register",
        username: username,
        password: password,
        nama: nama
      })
    });

    const result = await res.json();
    console.log("REGISTER RESPONSE:", result);

    // ✅ KONTRAK SESUAI responseSuccess / responseError
    if (result.success === true) {
      alert("Registrasi berhasil, silakan login");
      window.location.href = "login.html";
    } else {
      alert(result.message || "Registrasi gagal");
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    alert("Gagal terhubung ke server");
  }
}