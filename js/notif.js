/* ======================================================
   NOTIF.JS — GLOBAL INBOX NOTIFICATION
====================================================== */

function loadInboxNotif() {
  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser = (
    userLogin.nama_lengkap ||
    userLogin.nama ||
    userLogin.username ||
    ""
  ).trim();
  

  if (!namaUser || !window.APP_CONFIG?.API_WEB) return;

  fetch(`${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`)
    .then(r => r.json())
    .then(res => {
      let inbox = [];
    
      if (Array.isArray(res)) {
        inbox = res;
      } else if (res && res.success === true && Array.isArray(res.data)) {
        inbox = res.data;
      }
    
      const total = inbox.length;
    
      const badge = document.getElementById("notifBadge");
      const notifInbox = document.getElementById("notifInbox");
      const notifText = document.getElementById("notifText");
      const sidebarBadge = document.getElementById("inbox-badge");
    
      // 🔔 LONCENG
      if (badge) {
        badge.innerText = total;
        badge.classList.toggle("hidden", total === 0);
      }
    
      // 📩 SIDEBAR
      if (sidebarBadge) {
        sidebarBadge.innerText = total;
        sidebarBadge.classList.toggle("hidden", total === 0);
      }
    
      // 🧾 TEKS BERJALAN
      if (notifInbox && notifText) {
        if (total > 0) {
          notifInbox.classList.remove("hidden");
          notifText.innerText = `📥 ${total} inbox baru masuk untuk Anda`;
        } else {
          notifInbox.classList.add("hidden");
        }
      }
    })    
    .catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
  loadInboxNotif();
  setInterval(loadInboxNotif, 30000);
});

/* ======================================================
   GLOBAL TOAST NOTIFICATION
====================================================== */
window.showToast = function (message, type = "info") {

  // buat container kalau belum ada
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    document.body.appendChild(container);
  }

  // buat toast
  const toast = document.createElement("div");

  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#2563eb"
  };

  toast.style.background = colors[type] || colors.info;
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "6px";
  toast.style.fontSize = "13px";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-10px)";
  toast.style.transition = "all .3s ease";

  toast.innerText = message;

  container.appendChild(toast);

  // animasi masuk
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 50);

  // hilang otomatis
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
