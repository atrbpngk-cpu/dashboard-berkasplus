/* ======================================================
   HISTORY BERKAS
====================================================== */

if (!window.__HISTORY_JS_LOADED__) {
    window.__HISTORY_JS_LOADED__ = true;
  
    let historyData = [];
    let originalHistoryData = [];
    let currentPage = 1;
    const limit = 10;

    window.initHistoryBerkas = function () {
      currentPage = 1;
      loadHistory();
    };
  
    async function loadHistory() {
      try {
        currentPage = 1;
    
        const url = window.APP_CONFIG.API_WEB + "?action=history";
        const res = await fetch(url);
        const result = await res.json();
    
        if (!result || result.success !== true || !Array.isArray(result.data)) {
          throw new Error("Invalid history response");
        }
    
        historyData = result.data.slice(1);
        sortByTanggalDesc(historyData);
        originalHistoryData = [...historyData];
    
        renderTable();
        updatePagination();
      } catch (err) {
        showEmptyState("Gagal memuat data history");
      }
    }
    

    window.applyHistoryFilter = function () {
      const nomor = document.getElementById("filterNomor")?.value.trim();
      const tahun = document.getElementById("filterTahun")?.value.trim();
  
      historyData = originalHistoryData.filter(row => {
        const nomorTahun = (row[0] || "").toString();
  
        const matchNomor = nomor ? nomorTahun.startsWith(nomor) : true;
        const matchTahun = tahun ? nomorTahun.endsWith(tahun) : true;
  
        return matchNomor && matchTahun;
      });
  
      currentPage = 1;
      renderTable();
      updatePagination();
    };
  
    window.resetHistoryFilter = function () {
      document.getElementById("filterNomor").value = "";
      document.getElementById("filterTahun").value = "";
  
      historyData = [...originalHistoryData];
      currentPage = 1;
      renderTable();
      updatePagination();
    };
  
    function renderTable() {
      const tbody = document.querySelector("#content tbody");
      if (!tbody) return;
  
      tbody.innerHTML = "";
  
      if (historyData.length === 0) {
        showEmptyState("Data tidak ditemukan");
        return;
      }
  
      const start = (currentPage - 1) * limit;
      const end = start + limit;
      const pageData = historyData.slice(start, end);
  
      pageData.forEach((row, i) => {
        const tr = document.createElement("tr");
  
        tr.innerHTML = `
          <td class="border px-2 py-1 text-center">${start + i + 1}</td>
          <td class="border px-2 py-1">${row[0] || "-"}</td>
          <td class="border px-2 py-1">${row[1] || "-"}</td>
          <td class="border px-2 py-1">${formatTanggal(row[2])}</td>
          <td class="border px-2 py-1">${row[3] || "-"}</td>
          <td class="border px-2 py-1">${row[4] || "-"}</td>
          <td class="border px-2 py-1">${row[5] || "-"}</td>
          <td class="border px-2 py-1">${formatTanggal(row[6])}</td>
          <td class="border px-2 py-1 font-medium ${getStatusColor(row[7])}">
            ${row[7] || "-"}
          </td>
          <td class="border px-2 py-1">${row[8] || "-"}</td>
        `;
  
        tbody.appendChild(tr);
      });
    }

    function updatePagination() {
      const totalPage = Math.ceil(historyData.length / limit) || 1;
    
      const btnPrev = document.getElementById("btnPrev");
      const btnNext = document.getElementById("btnNext");
      const info = document.getElementById("paginationInfo");
    
      if (!info) {
        console.error("paginationInfo NOT FOUND");
        return;
      }
    
      if (btnPrev) btnPrev.disabled = currentPage === 1;
      if (btnNext) btnNext.disabled = currentPage === totalPage;
    
      info.innerHTML = `Halaman <b>${currentPage}</b> / <b>${totalPage}</b>`;
    }
    
    
  
    window.nextPage = function () {
      if (currentPage < Math.ceil(historyData.length / limit)) {
        currentPage++;
        renderTable();
        updatePagination();
      }
    };
    
    window.prevPage = function () {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
        updatePagination();
      }
    };
    
      if (!status) return "text-gray-600";
  
      switch (status.toLowerCase()) {
        case "terkirim":
          return "text-green-600";
        case "proses":
          return "text-yellow-600";
        case "diterima":
          return "text-blue-600";
        default:
          return "text-gray-600";
      }
    }
  
    function showEmptyState(message) {
      const tbody = document.querySelector("#content tbody");
      if (!tbody) return;
  
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-gray-500 py-6">
            ${message}
          </td>
        </tr>
      `;
    }
  
    function formatTanggal(value) {
      if (!value) return "-";
  
      try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
  
        const pad = n => n.toString().padStart(2, "0");
  
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {
        return value;
      }
    }

    function sortByTanggalDesc(data) {
      return data.sort((a, b) => {
        const dateA = new Date(a[2]).getTime() || 0; // Tgl Dikirim
        const dateB = new Date(b[2]).getTime() || 0;
        return dateB - dateA; // DESC → terbaru di atas
       });
    }     
  }
  
