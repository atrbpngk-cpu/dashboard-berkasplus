console.log("qr-print.js aktif 🧩");

(function () {

  function initAddon() {
    const btnCetakQR = document.getElementById("btnCetakQR");
    const qrImage = document.getElementById("qrImage");

    // Tunggu sampai elemen siap
    if (!btnCetakQR || !qrImage || !qrImage.src) {
      setTimeout(initAddon, 500);
      return;
    }

    btnCetakQR.onclick = () => {

      // Ambil teks QR
      const qrText = decodeURIComponent(
        new URL(qrImage.src).searchParams.get("data") || ""
      );

      const w = window.open(
        "",
        "_blank",
        "width=720,height=620"
      );

      w.document.write(`
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Cetak QR Code</title>

<style>
/* ================= PREVIEW ================= */
body {
  font-family: Arial, sans-serif;
  padding: 16px;
}

.preview {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.print-area {
  position: relative; /* 🔑 PENTING: hanya absolute saat print */
  min-width: 160px;
  text-align: center;
}

.print-area img {
  width: 140px;
  height: 140px;
}

.info {
  font-size: 12px;
  margin-top: 6px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.controls label {
  font-size: 12px;
  font-weight: bold;
}

.controls select {
  padding: 4px 6px;
  font-size: 12px;
}

.controls button {
  margin-top: 12px;
  padding: 6px;
  cursor: pointer;
}

/* ================= CETAK ================= */
@media print {
  body {
    padding: 0;
  }

  .controls {
    display: none;
  }

  .print-area {
    position: absolute;
    top: var(--top);
    left: var(--left);
  }

  .print-area img {
    width: 25mm;
    height: 25mm;
  }

  .info {
    font-size: 9pt;
    margin-top: 2mm;
  }
}
</style>
</head>

<body>

<div class="preview">

  <!-- AREA QR -->
  <div class="print-area" id="printArea">
    <img src="${qrImage.src.replace("size=200x200", "size=600x600")}">
    <div class="info">${qrText}</div>
  </div>

  <!-- KONTROL -->
  <div class="controls">
    <label>Posisi Vertikal</label>
    <select id="posY">
      <option value="20">Atas</option>
      <option value="120">Tengah</option>
      <option value="220">Bawah</option>
    </select>

    <label>Posisi Horizontal</label>
    <select id="posX">
      <option value="15">Kiri</option>
      <option value="90">Tengah</option>
      <option value="160">Kanan</option>
    </select>

    <button onclick="window.print()">Cetak</button>
  </div>

</div>

<script>
  const root = document.documentElement;
  const posY = document.getElementById("posY");
  const posX = document.getElementById("posX");

  function updatePos() {
    root.style.setProperty("--top", posY.value + "mm");
    root.style.setProperty("--left", posX.value + "mm");
  }

  posY.onchange = updatePos;
  posX.onchange = updatePos;
  updatePos();
</script>

</body>
</html>
      `);

      w.document.close();
    };
  }

  initAddon();

})();
