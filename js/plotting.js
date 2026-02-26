/* ======================================================
   PLOTTING.JS — FINAL PRODUKSI (STABLE & FIX TOTAL)
   - SPA SAFE
   - ANTI DOUBLE LOAD
   - FIELD 100% SESUAI apiPlotting
====================================================== */
(function () {

  /* ================= ANTI DOUBLE LOAD ================= */
  if (window.__PLOTTING_LOADED__) return;
  window.__PLOTTING_LOADED__ = true;

  if (!window.APP_CONFIG || !APP_CONFIG.API_WEB) {
    console.error("APP_CONFIG.API_WEB belum diset");
    return;
  }

  const API_URL = APP_CONFIG.API_WEB;

  let plottingData = [];
  let filteredData = [];
  let selectedData = null;

  /* ======================================================
     INIT (DIPANGGIL ROUTER SPA)
  ====================================================== */
  window.initPloting = function () {
    console.log("INIT PLOTTING ✔");
    resetFormProses();   // ⬅️ WAJIB
    setupTabs();
    setupEvents();
    loadPlotingData();
  };

  /* ======================================================
     TAB SETUP
  ====================================================== */
  function setupTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");
    if (!tabs.length) return;

    tabs.forEach(t => t.classList.remove("text-blue-600", "border-b-2"));
    contents.forEach(c => c.classList.add("hidden"));

    tabs[0].classList.add("text-blue-600", "border-b-2");
    document.getElementById(tabs[0].dataset.tab)?.classList.remove("hidden");

    tabs.forEach(btn => {
      btn.onclick = () => {
        tabs.forEach(t => t.classList.remove("text-blue-600", "border-b-2"));
        contents.forEach(c => c.classList.add("hidden"));
        btn.classList.add("text-blue-600", "border-b-2");
        document.getElementById(btn.dataset.tab)?.classList.remove("hidden");
        if (btn.dataset.tab === "tab-data") {
          resetFormProses();
        }
      };
    });
  }
  function getLoginUser() {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }
  /* ======================================================
     EVENTS
  ====================================================== */
  function setupEvents() {

    /* ===== UPLOAD FILE (DISPLAY NAMA FILE) ===== */
      const fileInput = document.getElementById("uploadFilePlotting");
      const labelFile = document.getElementById("namaFilePlotting");

      if (fileInput && labelFile) {
        fileInput.addEventListener("change", e => {
          const file = e.target.files[0];

          if (!file) {
            labelFile.innerText = "Belum ada file";
            labelFile.classList.remove("text-green-600");
            labelFile.classList.add("text-gray-500");
            return;
          }

          labelFile.innerText = file.name;
          labelFile.classList.remove("text-gray-500");
          labelFile.classList.add("text-green-600");
        });
      }

    /* ===== PILIH DATA ===== */
    document.querySelector("#tab-data")?.addEventListener("click", e => {
      if (selectedData) {
        alert("Selesaikan atau batalkan proses sebelumnya terlebih dahulu.");
        return;
      }
      const btn = e.target.closest(".btn-pilih");
      if (!btn) return;
    
      const item = JSON.parse(decodeURIComponent(btn.dataset.item));
    
      // 🔐 MINTA LOCK KE SERVER
      fetch(APP_CONFIG.API_WEB, {
        method: "POST",
        body: JSON.stringify({
          action: "setProcessing",
          row: item.id   // ID BARIS SHEET
        })
      })
      .then(r => r.json())
      .then(res => {
    
        // ❌ JIKA GAGAL LOCK → STOP
        if (!res.success) {
          alert(res.message || "Data sedang diproses petugas lain");
          return;
        }
    
        // ✅ BARU BOLEH SET DATA
        selectedData = item;
    
        // 🔄 REFRESH DATA (AGAR STATUS UPDATE GLOBAL)
        loadPlotingData();
    
        /* ===== ISI TAB PROSES ===== */
        setText("info-Nama", item.nama_pemilik);
        document.getElementById("edit-NoHak").value = item.nomor_hak || "";
        document.getElementById("edit-NIB").value  = item.nib || "";
        document.getElementById("edit-SU").value   = item.surat_ukur || "";
        setText("info-wilayah", item.desa_kecamatan);
    
        setLink("info-Lokasi", item.link_lokasi);
        setLink("info-Lampiran", item.lampiran);
    
        // ➡️ PINDAH TAB SETELAH SERVER OK
        document.querySelector('[data-tab="tab-proses"]')?.click();
      })
      .catch(err => {
        console.error(err);
        alert("Gagal terhubung ke server");
      });
    });
    
    /* ===== CARI ===== */
    document.getElementById("btnCari")?.addEventListener("click", () => {
      const noHak = getVal("filterNoHak");
      const desa  = getVal("filterDesa");

      filteredData = plottingData.filter(d =>
        (!noHak || String(d.nomor_hak).toLowerCase().includes(noHak)) &&
        (!desa  || String(d.desa_kecamatan).toLowerCase().includes(desa))
      );
      renderTable();
    });

    /* ===== RESET ===== */
    document.getElementById("btnReset")?.addEventListener("click", () => {
      setVal("filterNoHak", "");
      setVal("filterDesa", "");
      filteredData = [...plottingData];
      renderTable();
    });

    /* ===== BATAL PROSES PLOTTING ===== */
    document.getElementById("btnBatal")?.addEventListener("click", () => {

      if (!selectedData) {
        alert("Tidak ada data yang sedang diproses");
        return;
      }

      if (!confirm("Batalkan proses plotting ini?")) return;

      fetch(APP_CONFIG.API_WEB, {
        method: "POST",
        body: JSON.stringify({
          action: "releaseProcessing",
          row: selectedData.id
        })
      })
      .then(r => r.json())
      .then(res => {
        if (!res.success) {
          alert(res.message || "Gagal membatalkan proses");
          return;
        }

        // reset state frontend
        resetFormProses();

        // reload tabel
        loadPlotingData();

        // kembali ke tab data
        document.querySelector('[data-tab="tab-data"]')?.click();
      })
      .catch(err => {
        console.error(err);
        alert("Gagal terhubung ke server");
      });
    });
    /* ===== SIMPAN PLOTTING ===== */
    document.getElementById("btnSimpan")?.addEventListener("click", () => {

      if (!selectedData) {
        alert("Tidak ada data yang dipilih");
        return;
      }
      const user = getLoginUser();
        // 🔥 AMBIL NILAI INPUT
      const nomorHak  = document.getElementById("edit-NoHak").value.trim();
      const nib       = document.getElementById("edit-NIB").value.trim();
      const suratUkur = document.getElementById("edit-SU").value.trim();

      // 🔒 VALIDASI WAJIB ISI
      if (!nomorHak || !nib || !suratUkur) {
        alert("Nomor Hak, Nomor NIB, dan Nomor Surat Ukur wajib diisi.");
        return;
      }

      const payload = {
        action: "simpanPlotting",
        row: selectedData.id,

          // 🔥 NILAI HASIL EDIT
        nomor_hak: document.getElementById("edit-NoHak").value.trim(),
        nib: document.getElementById("edit-NIB").value.trim(),
        surat_ukur: document.getElementById("edit-SU").value.trim(),
      
        // 🔥 SAMA PERSIS DENGAN KIRIM.JS
        petugas: user.nama_lengkap || user.nama || user.username || "UNKNOWN",
      
        plotting_peta: document.getElementById("cekPlotting")?.checked || false,
        validasi_nib: document.getElementById("cekNIB")?.checked || false,
        validasi_su: document.getElementById("cekSU")?.checked || false,
      
        keterangan: document.getElementById("keteranganProses")?.value || ""
      };
      console.log("KIRIM SIMPAN:", payload); // 🔍 DEBUG PENTING

      fetch(APP_CONFIG.API_WEB, {
        method: "POST",
        body: JSON.stringify(payload)
      })
        .then(r => r.json())
        .then(async res => {
          console.log("RESP SIMPAN:", res);

          if (!res.success) {
            alert(res.message || "Gagal menyimpan plotting");
            return;
          }

          const noPlot = res.data.no_plotting;
          const fileInput = document.getElementById("uploadFilePlotting");
          const file = fileInput?.files?.[0] || null;

          // 🔄 Convert gambar (jika ada)
          const imageBase64 = await fileToBase64(file);

          // 🔥 GENERATE PDF
          fetch(APP_CONFIG.API_WEB, {
            method: "POST",
            body: JSON.stringify({
              action: "generatePlottingPDF",
              no_plotting: noPlot,
              image: imageBase64
            })
          })
          .then(r => r.json())
          .then(pdfRes => {

            if (!pdfRes.success) {
              alert("Plotting tersimpan, tapi PDF gagal dibuat");
              console.error(pdfRes);
              return;
            }
          
            // ================= TAMPILKAN LINK PDF (AMAN) =================
          
            // hapus link lama (anti dobel)
            document.querySelectorAll(".link-pdf-plotting")
              .forEach(el => el.remove());
          
            const container =
              document.getElementById("tab-proses") || document.body;
          
            // LINK PDF
            const link = document.createElement("a");
            link.href = pdfRes.data.pdf_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.innerText = "Download Pdf Plotting";
            link.className =
              "link-pdf-plotting block mt-4 text-blue-600 underline font-semibold";
          
            container.appendChild(link);
          
            // TOMBOL SELESAI (USER YANG MEMUTUSKAN)
            const btnDone = document.createElement("button");
            btnDone.innerText = "✔ Selesai & Kembali ke Data";
            btnDone.className =
              "btn-done-plotting mt-3 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300";
          
            btnDone.onclick = () => {
              resetFormProses();
              loadPlotingData();
              document.querySelector('[data-tab=\"tab-data\"]')?.click();
            };
          
            container.appendChild(btnDone);
          
            alert(`Plotting & PDF berhasil dibuat\nNo Plotting: ${noPlot}`);
          
          })
          .catch(err => {
            console.error(err);
            alert("Gagal generate PDF");
          });
        })
        .catch(err => {
          console.error(err);
          alert("Gagal terhubung ke server");
        });
    });
  }


  /* ======================================================
     LOAD DATA PLOTTING
  ====================================================== */
  function loadPlotingData() {
    fetch(`${API_URL}?action=plotting`)
      .then(r => r.json())
      .then(res => {

        console.log("RESP PLOTTING:", res);

        if (!res || res.success !== true || !Array.isArray(res.data)) {
          alert("Gagal load data plotting");
          return;
        }

        plottingData = res.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        filteredData = [...plottingData];
        renderTable();
      })
      .catch(err => {
        console.error("API plotting error:", err);
        alert("API plotting error");
      });
  }

  /* ======================================================
     RENDER TABLE
  ====================================================== */
  function renderTable() {

    const tbody = document.querySelector("#tab-data tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!filteredData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center py-4 text-gray-400">
            Tidak ada data
          </td>
        </tr>`;
      return;
    }

    filteredData.forEach((d, i) => {

      const disabled = d.status_proses === "PROCESSING";
      const encoded = encodeURIComponent(JSON.stringify(d));

      tbody.insertAdjacentHTML("beforeend", `
        <tr class="${disabled ? "bg-yellow-50 opacity-70" : "hover:bg-blue-50"}">
          <td>${i + 1}</td>
          <td>${formatTanggal(d.timestamp)}</td>
          <td>${d.email_address || "-"}</td>
          <td>${makeLink(d.link_lokasi)}</td>
          <td>${makeLink(d.lampiran)}</td>
          <td>${d.nama_pemilik || "-"}</td>
          <td>${formatTanggal(d.tanggal_lahir)}</td>
          <td>${d.telepon || "-"}</td>
          <td>${d.jenis_permohonan || "-"}</td>
          <td>${d.jenis_hak || "-"}</td>
          <td>${d.nomor_hak || "-"}</td>
          <td>${d.nib || "-"}</td>
          <td>${d.surat_ukur || "-"}</td>
          <td>${d.desa_kecamatan || "-"}</td>
          <td>
            ${
              d.status_proses === "PROCESSING"
                ? `<span class="bg-yellow-400 text-white px-3 py-0 text-xs rounded">
                    Diproses
                  </span>`
                : d.status_proses === "DONE"
                ? `<span class="bg-green-600 text-white px-3 py-0 text-xs rounded">
                    DONE
                  </span>`
                : `<button class="btn-pilih bg-indigo-600 text-white px-3 py-0 text-xs rounded"
                    data-item="${encoded}">
                    Proses
                  </button>`
            }
          </td>
        </tr>
      `);
    });
  }

  /* ======================================================
     HELPERS
  ====================================================== */
  function makeLink(v) {
    return v
      ? `<a href="${v}" target="_blank" class="text-blue-600 underline">Buka</a>`
      : "-";
  }
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val || "-";
  }
  function setLink(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.href = val || "#";
    el.innerText = val ? "Buka" : "-";
  }
  function getVal(id) {
    return (document.getElementById(id)?.value || "").toLowerCase().trim();
  }
  function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v;
  }

  function formatTanggal(value) {
    if (!value) return "-";
  
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
  
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
  
    return `${dd}-${mm}-${yyyy}`;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
  
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1]; // buang prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
    /* ======================================================
     RESET FORM PROSES (WAJIB ADA)
  ====================================================== */
  function resetFormProses() {
    selectedData = null;
  
    setText("info-Nama", "-");
    setText("info-wilayah", "-");
    setLink("info-Lokasi", "");
    setLink("info-Lampiran", "");

    ["edit-NoHak", "edit-NIB", "edit-SU"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  
    ["cekPlotting", "cekNIB", "cekSU"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
  
    const ket = document.getElementById("keteranganProses");
    if (ket) ket.value = "";
  
    const fileInput = document.getElementById("uploadFilePlotting");
    if (fileInput) fileInput.value = "";
  
    const labelFile = document.getElementById("namaFilePlotting");
    if (labelFile) {
      labelFile.innerText = "Belum ada file";
      labelFile.classList.remove("text-green-600");
      labelFile.classList.add("text-gray-500");
    }
  
    // 🔥 hapus link PDF
    document.querySelectorAll(".link-pdf-plotting")
      .forEach(el => el.remove());
  
    // 🔥 hapus tombol DONE
    document.querySelectorAll(".btn-done-plotting")
      .forEach(el => el.remove());
  }

})();

