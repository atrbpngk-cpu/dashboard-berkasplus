
console.log("informasi.js TERLOAD ");

function initInformasiBerkas() {
  console.log("initInformasiBerkas() JALAN 🚀");
  if (!window.APP_CONFIG?.API_WEB) {
    console.error("❌ API_WEB tidak tersedia");
    return;
  }
  const inputNomor =
    document.getElementById("inputNomor");
  const inputTahun =
    document.getElementById("inputTahun");
  const btnCari =
    document.getElementById("btnCari");
  const btnReset =
    document.getElementById("btnReset");
  const hasilContainer =
    document.getElementById("hasilContainer");
  const detailUtama =
    document.getElementById("detailUtama");
  const detailKeterangan =
    document.getElementById("detailKeterangan");
  const riwayatBody =
    document.getElementById("riwayatBody");
  const qrImage =
    document.getElementById("qrImage");

  const btnCetakQR =
    document.getElementById("btnCetakQR");
  const loadingCari =
    document.getElementById("loadingCari");
  const useGlobalLoading =
    () => window.USE_GLOBAL_LOADING === true;
    
  if (!btnCari || !hasilContainer) {
    console.error("❌ Elemen HTML belum siap");
    return;
  }

  hideHasil();

  if (window.__INFO_INITED) {
    return;
  }

  window.__INFO_INITED = true;

  btnCari.onclick =
    debounce(cariBerkas, 300);
  btnReset.onclick =
    resetForm;
    
  inputTahun.addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {
        btnCari.click();
      }
    }
  );

  async function cariBerkas() {
    const nomor =
      inputNomor.value.trim();
    const tahun =
      inputTahun.value.trim();
    if (!nomor || !tahun) {
      alert(
        "Nomor dan Tahun wajib diisi"
      );
      return;
    }
    const cacheKey =
      `${nomor}_${tahun}`;
    if (!useGlobalLoading()) {
      loadingCari
        ?.classList
        .remove("hidden");
    }
    btnCari.disabled = true;
    hideHasil();
    try {
      const url =
        `${APP_CONFIG.API_WEB}?action=informasi&nomor=${encodeURIComponent(nomor)}&tahun=${encodeURIComponent(tahun)}`;
      const json =
        await searchCache(
          cacheKey,
          async () => {

            return await smartFetch(
              url,
              {},
              5000
            );
          }
        );

      console.log(
        "API RESULT:",
        json
      );

      if (
        !json.success ||
        !json.data ||
        !json.data.info
      ) {
        alert("Data tidak ditemukan");
        return;
      }
      requestAnimationFrame(() => {
        showHasil();
        renderDetail(
          json.data.info
        );
        renderHistory(
          json.data.history || []
        );

        renderQR(
          nomor,
          tahun
        );

      });
    } catch (err) {
      console.error(err);
      alert(
        "Gagal mengambil data"
      );
    } finally {
      if (!useGlobalLoading()) {
        loadingCari
          ?.classList
          .add("hidden");
      }
      btnCari.disabled = false;
    }
  }

  const LABEL_MAP = {
    tanggal_mulai:
      "Tanggal Mulai",
    nomor_berkas:
      "Nomor Berkas",
    nama_pemohon:
      "Nama Pemohon",
    jenis_permohonan:
      "Jenis Permohonan",
    desa_kecamatan:
      "Desa / Kecamatan",
    petugas_ukur:
      "Petugas Ukur",
    status_berkas:
      "Status Berkas",
    tanggal_terakhir:
      "Tanggal Terakhir",
    posisi_terakhir:
      "Posisi Terakhir",
    nama_petugas:
      "Nama Petugas"
  };

  function renderDetail(info) {
    let html = "";
    detailKeterangan.textContent = "-";
    Object.entries(info)
      .forEach(([key, val]) => {
        if (!val) return;
        if (
          key
          .toLowerCase()
          .includes("keterangan")
        ) {
          detailKeterangan
            .textContent = val;
          return;
        }
        if (!LABEL_MAP[key]) {
          return;
        }
        html += `
          <div class="mb-2">
            <div class="font-semibold text-gray-600">
              ${LABEL_MAP[key]}
            </div>

            <div class="text-gray-800">
              ${val}
            </div>
          </div>
        `;
      });

    detailUtama.innerHTML = html;
  }

  function renderHistory(history) {
    if (!history.length) {

      riwayatBody.innerHTML = `
        <tr>
          <td colspan="8"
            class="border px-2 py-3 text-center text-gray-400">

            Tidak ada riwayat

          </td>
        </tr>
      `;
      return;
    }
    let html = "";
    history.forEach(row => {
      html += `
        <tr>
          <td class="border px-2 py-1">
            ${row["Nomor/Tahun Berkas"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Pengirim"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Tgl dikirim"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Dikirim Ke"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Penerima"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Tgl diterima"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Status"] || "-"}
          </td>

          <td class="border px-2 py-1">
            ${row["Keterangan"] || "-"}
          </td>
        </tr>
      `;
    });

    riwayatBody.innerHTML = html;
  }
  /* ==================================================
     QR
  ================================================== */
  function renderQR(
    nomor,
    tahun
  ) {
    const textQR =
      `${nomor}/${tahun}`;
    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(textQR)}`;
    qrImage.loading = "lazy";
    qrImage.src = qrUrl;
    qrImage.classList
      .remove("hidden");
    btnCetakQR.classList
      .remove("hidden");
    btnCetakQR.onclick = () => {
      const w =
        window.open(
          "",
          "_blank",
          "width=400,height=550"
        );
      w.document.write(`
        <html>
        <head>
          <title>QR Code</title>
        </head>
        <body style="
          text-align:center;
          font-family:Arial;
          padding:30px">
          <h3>QR Code</h3>
          <p>
            <b>Nomor</b>:
            ${nomor}
            /
            <b>Tahun</b>:
            ${tahun}
          </p>
          <img
            src="${qrUrl}"
            width="200">
          <br><br>
          <button onclick="window.print()">
            Cetak
          </button>
        </body>
        </html>
      `);
      w.document.close();
    };
  }

  function resetForm() {
    inputNomor.value = "";
    inputTahun.value = "";
    hideHasil();
  }

  function hideHasil() {
    hasilContainer.classList
      .add("hidden");
    detailUtama.innerHTML = "";
    detailKeterangan.textContent = "-";
    riwayatBody.innerHTML = "";
    qrImage.classList
      .add("hidden");
    btnCetakQR.classList
      .add("hidden");
  }

  function showHasil() {
    hasilContainer.classList
      .remove("hidden");
  }
}
