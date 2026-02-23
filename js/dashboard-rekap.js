/* ======================================================
   DASHBOARD – REKAPITULASI BERKAS
   SUMBER DATA: API ?action=bebanPU
   DEFINISI:
   - Proses = ada Tanggal Terakhir Berjalan
====================================================== */

function initDashboardRekapBerkas() {
    if (!window.APP_CONFIG?.API_WEB) return;
  
    fetch(`${APP_CONFIG.API_WEB}?action=bebanPU`)
      .then(r => r.json())
      .then(res => {
  
        if (!res || !res.success || !Array.isArray(res.data)) {
          console.error("API BebanPU tidak valid", res);
          return;
        }
  
        hitungRekapBerkas(res.data);
      })
      .catch(err => console.error("Dashboard Rekap Error:", err));
  }
  
  /* ======================================================
     HITUNG REKAP BERKAS
  ====================================================== */
  function hitungRekapBerkas(data) {

    let total = 0;
    let selesai = 0;
    let prosesBerjalan = 0;
    let lebih60Hari = 0;
  
    data.forEach(row => {
  
      total++;
  
      const status = (row["Status Berkas"] || "").trim().toLowerCase();
      const tglMulai = row["Tanggal mulai"];
      const tglTerakhir = row["Tanggal terakhir berjalan"];
  
      // ===============================
      // SELESAI
      // ===============================
      if (status === "selesai") {
        selesai++;
      }
  
      // ===============================
      // PROSES BERJALAN
      // ===============================
      if (tglTerakhir && status !== "selesai") {
        prosesBerjalan++;
      }
  
      // ===============================
      // PROSES > 60 HARI (BELUM SELESAI)
      // ===============================
      const hari = hitungSelisihHari(tglMulai);
      if (status !== "selesai" && hari > 60) {
        lebih60Hari++;
      }
  
    });
  
    renderRekapDashboard({
      total,
      proses: prosesBerjalan,
      selesai,
      proses30: lebih60Hari
    });
  }
    
  
  /* ======================================================
     HITUNG SELISIH HARI
  ====================================================== */
  function hitungSelisihHari(tgl) {
    if (!tgl) return 0;
  
    // normalize format
    if (typeof tgl === "string" && tgl.includes("/")) {
      const [d, m, y] = tgl.split(" ")[0].split("/");
      tgl = `${y}-${m}-${d}`;
    }
  
    const start = new Date(tgl);
    if (isNaN(start)) return 0;
  
    const today = new Date();
    start.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
  
    return Math.floor((today - start) / 86400000);
  }
     
  
  /* ======================================================
     RENDER KE UI
  ====================================================== */
  function renderRekapDashboard({ total, proses, selesai, proses30 }) {
  
    const elTotal = document.getElementById("rekapTotal");
    if (!elTotal) return;
  
    document.getElementById("rekapTotal").innerText = total;
    document.getElementById("rekapProses").innerText = `${proses} / ${total}`;
    document.getElementById("rekapSelesai").innerText = `${selesai} / ${total}`;
    document.getElementById("rekapProses30").innerText = `${proses30} / ${total}`;
  }
  
  /* ======================================================
     AUTO INIT (AMAN UNTUK ROUTER SPA)
  ====================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("rekapTotal")) {
      initDashboardRekapBerkas();
    }
  });
  