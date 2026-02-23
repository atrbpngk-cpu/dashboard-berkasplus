// ===============================
// KONFIGURASI
// ===============================
const API_WEB = "https://webapi.berkasplus.my.id";
// atau langsung Apps Script:
// const API_WEB = "https://script.google.com/macros/s/AKfycbXXXX/exec";

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
    // 🔑 GUNAKAN FormData (simple request, TANPA CORS preflight)
    const formData = new FormData();
    formData.append("action", "register");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("nama", nama);

    const res = await fetch(API_WEB, {
      method: "POST",
      body: formData
      // ⛔ JANGAN set headers Content-Type
    });

    const result = await res.json();
    console.log("REGISTER RESPONSE:", result);

    // ✅ SESUAI responseSuccess / responseError di Apps Script
    if (result && result.success === true) {
      alert("Registrasi berhasil, silakan login");
      window.location.href = "login.html";
    } else {
      alert(result?.message || "Registrasi gagal");
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    alert("Gagal terhubung ke server");
  }
}
