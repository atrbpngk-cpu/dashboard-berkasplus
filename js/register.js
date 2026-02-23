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
    console.log("REGISTER RESPONSE:", result);

    // ✅ SESUAI DENGAN responseSuccess / responseError
    if (result.status === "success") {
      alert(result.message);
      window.location.href = "login.html";
    } else {
      alert(result.message || "Registrasi gagal");
    }

  } catch (err) {
    alert("Gagal terhubung ke server");
    console.error(err);
  }
}