function loadPage(page) {
  fetch(page)
    .then(r => r.text())
    .then(html => {
      document.getElementById("content").innerHTML = html;

      // ENTRY BERKAS
      if (page.includes("entry-data-berkas")) {
        if (typeof window.initEntryBerkas === "function") {
          initEntryBerkas();
        }
      }

      // KIRIM BERKAS
      if (page.includes("kirim-berkas")) {
        if (typeof window.initKirimBerkas === "function") {
          initKirimBerkas();
        } else {
          console.error("initKirimBerkas tidak ditemukan");
        }
      }

      // 🔥 INBOX BERKAS (INI KUNCINYA)
      if (page.includes("inbox")) {
        if (typeof window.initInboxBerkas === "function") {
          console.log("INIT PAGE LOADER: Inbox");
          initInboxBerkas();
        } else {
          console.error("initInboxBerkas tidak ditemukan");
        }
      }
    });
}
