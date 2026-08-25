/* ============================================================
   ALAT PLOTTING
   ============================================================ */

function bukaTabAlatPlotting(tab) {
  const tabCariPdf = document.getElementById("tabCariPdf");
  const tabResetData = document.getElementById("tabResetData");
  const btnCariPdf = document.getElementById("tabBtnCariPdf");
  const btnResetData = document.getElementById("tabBtnResetData");

  /* Jika elemen belum tersedia */
  if (!tabCariPdf || !tabResetData || !btnCariPdf || !btnResetData) {
    return;
  }


  if (tab === "cari-pdf") {
    tabCariPdf.style.display = "block";
    tabResetData.style.display = "none";
    btnCariPdf.classList.add("active");
    btnResetData.classList.remove("active");
  }


  if (tab === "reset-data") {
    tabCariPdf.style.display = "none";
    tabResetData.style.display = "block";
    btnCariPdf.classList.remove("active");
    btnResetData.classList.add("active");
  }
}


async function cariPDFPlotting() {
  const input = document.getElementById("nomorPlotting");
  const hasil = document.getElementById("hasilPDFPlotting");
  const jumlah = document.getElementById("jumlahHasilPDF");

  if (!input || !hasil || !jumlah) {
    console.error("Elemen Alat Plotting tidak ditemukan.");
    return;
  }

  const nomor = input.value.trim();

  if (nomor === "") {
    jumlah.textContent = "0 hasil";

    hasil.innerHTML = `
        <div style="
          text-align:center;
          color:#9ca3af;
          padding:25px;
        ">
          <div style="font-size:11px;">
            Masukkan Nomor Plotting terlebih dahulu.
          </div>
        </div>
      `;

    input.focus();
    return;
  }


  if (!/^[0-9]+$/.test(nomor)) {
    jumlah.textContent = "0 hasil";

    hasil.innerHTML = `
        <div style="
          text-align:center;
          color:#dc2626;
          padding:25px;
        ">
          <div style="font-size:11px;">
            Nomor Plotting hanya boleh berisi angka.
          </div>
        </div>
      `;

    input.focus();

    return;
  }

  const namaFile = "PLOT-" + nomor + ".pdf";

  jumlah.textContent = "Mencari...";

  hasil.innerHTML = `
      <div style="
        width:100%;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:15px;
        padding:12px 14px;
        border:1px solid #e5e7eb;
        border-radius:7px;
        box-sizing:border-box;
      ">
  
        <div style="
          min-width:0;
        ">
  
          <div style="
            font-size:12px;
            font-weight:600;
            color:#374151;
          ">
            ${escapeHTML(namaFile)}
          </div>
  
          <div style="
            margin-top:3px;
            font-size:10px;
            color:#9ca3af;
          ">
            Mencari file...
          </div>
  
        </div>
  
        <div style="
          font-size:11px;
          color:#9ca3af;
          white-space:nowrap;
        ">
          Mohon tunggu...
        </div>
  
      </div>
    `;

  try {
    const url =
      API_URL +
      "?action=alatPlottingSearch" +
      "&nomor=" +
      encodeURIComponent(nomor);

    console.log("Memanggil API Alat Plotting:", url);

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("HTTP Error " + response.status);
    }

    const result = await response.json();

    console.log("Response Alat Plotting:", result);


    if (!result || result.success !== true) {
      throw new Error(
        result && result.message
          ? result.message
          : "Response server tidak valid."
      );
    }


    if (result.found !== true) {
      jumlah.textContent = "0 hasil";

      hasil.innerHTML = `
          <div style="
            text-align:center;
            color:#9ca3af;
            padding:28px 10px;
          ">
  
            <div style="
              font-size:12px;
              font-weight:600;
              color:#6b7280;
            ">
              PDF tidak ditemukan
            </div>
  
            <div style="
              margin-top:5px;
              font-size:10px;
              color:#9ca3af;
            ">
              File
              <strong>
                ${escapeHTML(result.fileName || namaFile)}
              </strong>
              tidak tersedia.
            </div>
  
          </div>
        `;

      return;
    }

    jumlah.textContent = "1 hasil";

    hasil.innerHTML = `
  
        <div style="
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:15px;
          padding:12px 14px;
          border:1px solid #e5e7eb;
          border-radius:7px;
          box-sizing:border-box;
          background:#ffffff;
        ">
  
  
          <!-- INFO FILE -->
  
          <div style="
            display:flex;
            align-items:center;
            gap:10px;
            min-width:0;
          ">
  
            <div style="
              width:34px;
              height:34px;
              display:flex;
              align-items:center;
              justify-content:center;
              border-radius:6px;
              background:#fef2f2;
              color:#dc2626;
              font-size:10px;
              font-weight:700;
              flex-shrink:0;
            ">
              PDF
            </div>
  
  
            <div style="
              min-width:0;
            ">
  
              <div style="
                font-size:12px;
                font-weight:600;
                color:#374151;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              ">
                ${escapeHTML(result.fileName || namaFile)}
              </div>
  
  
              <div style="
                margin-top:3px;
                font-size:10px;
                color:#6b7280;
              ">
                Nomor Plotting:
                ${escapeHTML(result.nomorPlotting || nomor)}
              </div>
  
            </div>
  
          </div>
  
  
          <!-- ACTION -->
  
          <div style="
            display:flex;
            align-items:center;
            gap:6px;
            flex-shrink:0;
          ">
  
  
            <!-- LIHAT -->
  
            <a
              href="${escapeHTML(result.previewUrl || result.driveUrl || "#")}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                height:32px;
                padding:0 12px;
                display:flex;
                align-items:center;
                justify-content:center;
                border:1px solid #e5e7eb;
                border-radius:6px;
                background:#ffffff;
                color:#374151;
                font-size:11px;
                text-decoration:none;
                box-sizing:border-box;
              "
            >
              Lihat
            </a>
  
  
            <!-- DOWNLOAD -->
  
            <a
              href="${escapeHTML(result.downloadUrl || "#")}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                height:32px;
                padding:0 13px;
                display:flex;
                align-items:center;
                justify-content:center;
                border:none;
                border-radius:6px;
                background:#4f46e5;
                color:#ffffff;
                font-size:11px;
                text-decoration:none;
                box-sizing:border-box;
              "
            >
              Download
            </a>
  
  
          </div>
  
        </div>
  
      `;
  } catch (error) {
    console.error("ERROR PENCARIAN PDF:", error);

    jumlah.textContent = "Error";

    hasil.innerHTML = `
        <div style="
          text-align:center;
          color:#dc2626;
          padding:25px 10px;
        ">
  
          <div style="
            font-size:12px;
            font-weight:600;
          ">
            Gagal terhubung ke server
          </div>
  
          <div style="
            margin-top:5px;
            font-size:10px;
            color:#9ca3af;
          ">
            ${escapeHTML(error.message)}
          </div>
  
        </div>
      `;
  }
}


async function cariDataHM() {
  const input = document.getElementById("nomorHM");

  const hasil = document.getElementById("hasilDataHM");

  const jumlah = document.getElementById("jumlahDataHM");

  if (!input || !hasil || !jumlah) {
    console.error("Elemen reset data tidak ditemukan.");
    return;
  }

  const nomorHM = input.value.trim();


  if (nomorHM === "") {
    jumlah.textContent = "0 data";

    hasil.innerHTML = `
        <div style="
          text-align:center;
          padding:25px;
          color:#9ca3af;
          font-size:11px;
        ">
          Masukkan Nomor HM terlebih dahulu.
        </div>
      `;

    input.focus();

    return;
  }


  jumlah.textContent = "Mencari...";

  hasil.innerHTML = `
      <div style="
        text-align:center;
        padding:25px;
        color:#9ca3af;
        font-size:11px;
      ">
        Mencari data Nomor HM
        <strong>${escapeHTML(nomorHM)}</strong>...
      </div>
    `;


  try {
    const url =
      API_URL +
      "?action=alatPlottingResetSearch" +
      "&nomorHM=" +
      encodeURIComponent(nomorHM);

    console.log("Memanggil API Reset Plotting:", url);

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("HTTP Error " + response.status);
    }


    const result = await response.json();

    console.log("Response Reset Plotting:", result);


    if (!result.success) {
      jumlah.textContent = "Error";

      hasil.innerHTML = `
          <div style="
            text-align:center;
            padding:25px;
            color:#dc2626;
            font-size:11px;
          ">
            ${escapeHTML(result.message || "Terjadi kesalahan server.")}
          </div>
        `;

      return;
    }

    if (!result.found || !result.data || result.data.length === 0) {
      jumlah.textContent = "0 data";

      hasil.innerHTML = `
          <div style="
            text-align:center;
            padding:25px;
            color:#9ca3af;
            font-size:11px;
          ">
            Data Nomor HM
            <strong>${escapeHTML(nomorHM)}</strong>
            tidak ditemukan.
          </div>
        `;

      return;
    }


    jumlah.textContent = result.data.length + " data";


    hasil.innerHTML = `
  
        <div style="
          overflow-x:auto;
        ">
  
        <table style="
        width:100%;
        min-width:760px;
        border-collapse:collapse;
        table-layout:fixed;
        font-size:11px;
        ">
        
            <thead>
  
              <tr style="
                background:#f9fafb;
                border-bottom:1px solid #e5e7eb;
              ">
  
                <th style="
                  padding:9px 10px;
                  text-align:left;
                  font-weight:600;
                  color:#374151;
                ">
                  Email
                </th>
  
                <th style="
                  padding:9px 10px;
                  text-align:left;
                  font-weight:600;
                  color:#374151;
                ">
                  Nama Pemilik HM
                </th>
  
                <th style="
                  padding:9px 10px;
                  text-align:left;
                  font-weight:600;
                  color:#374151;
                ">
                  Nomor HM
                </th>
  
                <th style="
                  padding:9px 10px;
                  text-align:left;
                  font-weight:600;
                  color:#374151;
                ">
                  Desa
                </th>
  
                <th style="
                  padding:9px 10px;
                  text-align:center;
                  font-weight:600;
                  color:#374151;
                ">
                  Status
                </th>
  
                <th style="
                  padding:9px 10px;
                  text-align:center;
                  font-weight:600;
                  color:#374151;
                ">
                  Aksi
                </th>
  
              </tr>
  
            </thead>
  
  
            <tbody>
  
              ${result.data
                .map(function (item) {
                  const status = item.status || "-";

                  return `
  
                  <tr style="
                    border-bottom:1px solid #f0f0f0;
                  ">
  
                    <td style="
                      padding:9px 10px;
                      color:#374151;
                    ">
                      ${escapeHTML(item.email || "-")}
                    </td>
  
  
                    <td style="
                      padding:9px 10px;
                      color:#374151;
                      font-weight:500;
                    ">
                      ${escapeHTML(item.namaPemilik || "-")}
                    </td>
  
  
                    <td style="
                      padding:9px 10px;
                      color:#374151;
                    ">
                      ${escapeHTML(item.nomorHM || "-")}
                    </td>
  
  
                    <td style="
                      padding:9px 10px;
                      color:#374151;
                    ">
                      ${escapeHTML(item.desa || "-")}
                    </td>
  
  
                    <td style="
                      padding:9px 10px;
                      text-align:center;
                    ">
  
                      <span style="
                        display:inline-block;
                        padding:4px 8px;
                        border-radius:5px;
                        background:#f3f4f6;
                        color:#6b7280;
                        font-size:10px;
                      ">
                        ${escapeHTML(status)}
                      </span>
  
                    </td>
  
  
                    <td style="
                      padding:9px 10px;
                      text-align:center;
                    ">
  
                      <button
                        type="button"
                        onclick="resetDataPlotting(
                          ${item.rowNumber},
                          '${escapeHTML(item.nomorHM || nomorHM)}'
                        )"
                        style="
                          border:none;
                          border-radius:6px;
                          padding:6px 12px;
                          background:#f59e0b;
                          color:#ffffff;
                          font-size:10px;
                          cursor:pointer;
                        "
                      >
                        Reset
                      </button>
  
                    </td>
  
                  </tr>
  
                `;
                })
                .join("")}
  
            </tbody>
  
          </table>
  
        </div>
  
      `;
  } catch (error) {
    console.error("RESET PLOTTING ERROR:", error);

    jumlah.textContent = "Error";

    hasil.innerHTML = `
  
        <div style="
          text-align:center;
          padding:25px;
          color:#dc2626;
          font-size:11px;
        ">
  
          <div style="
            font-weight:600;
            margin-bottom:5px;
          ">
            Gagal terhubung ke server
          </div>
  
          <div style="
            color:#9ca3af;
            font-size:10px;
          ">
            ${escapeHTML(error.message)}
          </div>
  
        </div>
  
      `;
  }
}


async function resetDataPlotting(rowNumber, nomorHM) {


  if (!rowNumber) {
    alert("Nomor baris data tidak ditemukan.");
    return;
  }


  const konfirmasi = confirm(
    "Reset status plotting untuk HM " + nomorHM + "?"
  );

  if (!konfirmasi) {
    return;
  }

  try {

    const hasil = document.getElementById("hasilDataHM");

    if (hasil) {
      hasil.innerHTML = `
          <div style="
            width:100%;
            text-align:center;
            padding:30px 15px;
            color:#6b7280;
            font-size:11px;
            box-sizing:border-box;
          ">
            Sedang mereset status...
          </div>
        `;
    }


    const formData = new URLSearchParams();
    formData.append("action", "alatPlottingReset");
    formData.append("rows", JSON.stringify([Number(rowNumber)]));
    console.log("RESET ROW:", rowNumber);
    console.log("RESET DATA:", formData.toString());


    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },

      body: formData.toString(),
    });


    if (!response.ok) {
      throw new Error("HTTP Error " + response.status);
    }


    const result = await response.json();
    console.log("Response Reset:", result);


    if (!result.success) {
      alert(result.message || "Reset gagal.");

      /* Cari ulang agar tabel kembali */
      await cariDataHM();

      return;
    }


    alert("Status HM " + nomorHM + " berhasil direset.");

    await cariDataHM();
  } catch (error) {
    console.error("RESET STATUS ERROR:", error);

    alert("Gagal mereset status: " + error.message);

    /* Kembalikan hasil pencarian */
    await cariDataHM();
  }
}


function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}
