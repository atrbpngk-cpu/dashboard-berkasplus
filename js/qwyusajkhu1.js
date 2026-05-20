/* ======================================================
   INBOX.JS
====================================================== */

if (!window.__INBOX_JS_LOADED__) {
  window.__INBOX_JS_LOADED__ = true;

  const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
  const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();
  const namaSeksi = (userLogin.seksi || "").trim();

  let tableBody, badgeBaru, notifInbox, notifText;
  let btnPrev, btnNext;

  let originalInboxData = [];
  let inboxData = [];
  let selectedRow = null;

  let currentPage = 1;
  const perPage = 10;


  window.initDashboardInbox = function () {

    const countEl = document.getElementById("dashboardInboxCount");
    const badgeEl = document.getElementById("dashboardInboxBadge");
  
    if (!countEl) return;
  
    const userLogin = JSON.parse(localStorage.getItem("user") || "{}");
    const namaUser  = (userLogin.nama_lengkap || userLogin.nama || "").trim();
  
    if (!window.APP_CONFIG?.API_WEB || !namaUser) {
      countEl.innerText = 0;
      return;
    }
  
    fetch(`${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`)
      .then(r => r.json())
      .then(res => {
  
        let data = [];
  
        if (Array.isArray(res)) {
          data = res;
        } 
        else if (res && res.success === true && Array.isArray(res.data)) {
          data = res.data;
        }
  
        const total = data.length;
        countEl.innerText = total;
  
        if (badgeEl) {
          if (total > 0) {
            badgeEl.classList.remove("hidden");
          } else {
            badgeEl.classList.add("hidden");
          }
        }
  
        if (total === 0) {
          countEl.className = "text-2xl font-bold text-gray-400";
        } else if (total < 10) {
          countEl.className = "text-2xl font-bold text-yellow-600";
        } else {
          countEl.className = "text-2xl font-bold text-red-600";
        }
  
      })
      .catch(() => {
        countEl.innerText = 0;
      });
  };
  
  window.initInboxBerkas = function () {
    if (!window.APP_CONFIG?.API_WEB || !namaUser) return;

    tableBody   = document.getElementById("tableBody");
    badgeBaru   = document.getElementById("badgeBaru");
    notifInbox = document.getElementById("notifInbox");
    notifText  = document.getElementById("notifText");
    btnPrev    = document.getElementById("btnPrev");
    btnNext    = document.getElementById("btnNext");

    if (!tableBody) return;

    loadInboxData();
  };

  function loadInboxData() {
    fetch(`${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`)
      .then(r => r.json())
      .then(res => {
  
        if (Array.isArray(res)) {
          originalInboxData = res;
        } 
        else if (res && res.success === true && Array.isArray(res.data)) {
          originalInboxData = res.data;
        } 
        else {
          originalInboxData = [];
        }
  
        inboxData = [...originalInboxData];
        currentPage = 1;
  
        updateBadge(inboxData.length);
        updateNotifInbox();
        renderTable();
      })
      .catch(err => {
        console.error("Inbox API error:", err);
        inboxData = [];
        updateBadge(0);
        renderTable();
      });
  }
  
  window.applyFilter = function () {
    const nomor = document.getElementById("filterNomor").value.trim();
    const tahun = document.getElementById("filterTahun").value.trim();

    inboxData = originalInboxData.filter(r => {
      const nt = String(r[0] || "");
      if (nomor && !nt.includes(nomor)) return false;
      if (tahun && !nt.includes(tahun)) return false;
      return true;
    });

    currentPage = 1;
    updateBadge(inboxData.length);
    updateNotifInbox();
    renderTable();
  };

  window.resetFilter = function () {
    document.getElementById("filterNomor").value = "";
    document.getElementById("filterTahun").value = "";

    inboxData = [...originalInboxData];
    currentPage = 1;

    updateBadge(inboxData.length);
    updateNotifInbox();
    renderTable();
  };

  function renderTable() {
    tableBody.innerHTML = "";

    if (inboxData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-gray-500 py-6">
            Tidak ada inbox masuk
          </td>
        </tr>`;
      updatePagination();
      return;
    }

    const start = (currentPage - 1) * perPage;
    const pageData = inboxData.slice(start, start + perPage);

    pageData.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.dataset.nomor = r[0];
      tr.onclick = () => selectRow(tr);

      tr.innerHTML = `
        <td>${start + i + 1}</td>
        <td>${r[0]}</td>
        <td>${r[1]}</td>
        <td>${formatTanggal(r[2])}</td>
        <td>${r[3]}</td>
        <td>${r[4]}</td>
        <td>${r[5] || "-"}</td>
        <td>${formatTanggal(r[6])}</td>
        <td class="font-semibold text-green-600">${r[7]}</td>
        <td>${r[8] || "-"}</td>
      `;
      tableBody.appendChild(tr);
    });

    updatePagination();
  }

  window.aksiInbox = function (status) {
    if (!selectedRow) {
      alert("Pilih berkas terlebih dahulu");
      return;
    }
  
    const nomor = selectedRow.dataset.nomor;
  
    document.getElementById("btnTerima")?.setAttribute("disabled", true);
    document.getElementById("btnTolak")?.setAttribute("disabled", true);
  
    fetch(APP_CONFIG.API_WEB, {
      method: "POST",
      body: JSON.stringify({
        action: "inboxAction",
        nomor,
        status,
        user: namaUser,
        seksi: namaSeksi
      })
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
  
        selectedRow.classList.remove("bg-blue-100");
        selectedRow.classList.add(
          status === "Diterima" ? "bg-green-100" : "bg-red-100"
        );
  
        showToast(
          `Berkas ${nomor} berhasil ${status.toLowerCase()}`,
          "success"
        );
  
        setTimeout(() => {
          selectedRow = null;
          loadInboxData();
        }, 800);
  
      } else {
        showToast(res.message || "Gagal memproses berkas", "error");
      }
    })
    .catch(() => {
      showToast("Gagal terhubung ke server", "error");
    })
    .finally(() => {
      document.getElementById("btnTerima")?.removeAttribute("disabled");
      document.getElementById("btnTolak")?.removeAttribute("disabled");
    });
  };
  
  function updatePagination() {
    const totalPage = Math.max(1, Math.ceil(inboxData.length / perPage));
  
    const elCurrent = document.getElementById("currentPage");
    const elTotal   = document.getElementById("totalPage");
  
    if (elCurrent) elCurrent.innerText = currentPage;
    if (elTotal)   elTotal.innerText   = totalPage;
  
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext) btnNext.disabled = currentPage >= totalPage;
  }
  

  window.nextPage = () => {
    if (currentPage * perPage < inboxData.length) {
      currentPage++;
      renderTable();
    }
  };

  window.prevPage = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  };

  function selectRow(row) {
    document.querySelectorAll("#tableBody tr")
      .forEach(tr => tr.classList.remove("bg-blue-100"));
    row.classList.add("bg-blue-100");
    selectedRow = row;
  }

  function updateBadge(n) {
    if (badgeBaru) badgeBaru.innerText = n;
  }

  function updateNotifInbox() {
    if (!notifInbox || !notifText) return;
    if (inboxData.length > 0) {
      notifInbox.classList.remove("hidden");
      notifText.innerText = `📥 ${inboxData.length} inbox baru masuk`;
    } else {
      notifInbox.classList.add("hidden");
    }
  }

  function formatTanggal(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d)) return v;
    const p = n => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
}
