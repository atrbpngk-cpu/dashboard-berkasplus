/* ======================================================
   JENIS PERMOHONAN JS (FINAL PRODUKSI)
====================================================== */

/* =====================
   STATE
===================== */
let jpTableBody, jpBtnTambah, jpBtnEdit, jpBtnHapus;
let jpSelectedNama = null;
let jpMode = "add"; // add | edit

/* ======================================================
   INIT (DIPANGGIL ROUTER)
====================================================== */
function initJenisPermohonan() {
  jpTableBody = document.getElementById("tableJenisPermohonan");
  jpBtnTambah = document.getElementById("jpBtnTambah");
  jpBtnEdit   = document.getElementById("jpBtnEdit");
  jpBtnHapus  = document.getElementById("jpBtnHapus");

  if (!jpTableBody || !jpBtnTambah || !jpBtnEdit || !jpBtnHapus) {
    console.error("Jenis Permohonan: element belum siap");
    return;
  }

  jpBtnTambah.onclick = jpOpenTambah;
  jpBtnEdit.onclick   = jpOpenEdit;
  jpBtnHapus.onclick  = jpHapus;

  jpLoad();
}

/* ======================================================
   LOAD DATA
====================================================== */
async function jpLoad() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.username) throw "Session tidak valid";

    const res = await fetch("https://webapi.berkasplus.my.id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getJenisPermohonan",
        username: user.username
      })
    });

    const json = await res.json();
    if (!json.success) throw json.message;

    jpRender(json.data || []);
  } catch (err) {
    jpTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-red-500">
          Gagal mengambil data
        </td>
      </tr>`;
  }
}

/* ======================================================
   RENDER TABLE
====================================================== */
function jpRender(data) {
  jpTableBody.innerHTML = "";
  jpClearSelection();

  if (data.length === 0) {
    jpTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-gray-400 italic">
          Belum ada jenis permohonan
        </td>
      </tr>`;
    return;
  }

  data.forEach(nama => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="border px-3 py-1">${nama}</td>`;

    tr.onclick = () => jpSelectRow(tr, nama);
    jpTableBody.appendChild(tr);
  });
}

/* ======================================================
   SELECTION
====================================================== */
function jpSelectRow(row, nama) {
  document
    .querySelectorAll("#tableJenisPermohonan tr")
    .forEach(r => r.classList.remove("selected"));

  row.classList.add("selected");
  jpSelectedNama = nama;

  jpBtnEdit.disabled = false;
  jpBtnHapus.disabled = false;

  jpBtnEdit.classList.replace("bg-indigo-400", "bg-indigo-600");
  jpBtnEdit.classList.remove("cursor-not-allowed");

  jpBtnHapus.classList.replace("bg-red-400", "bg-red-500");
  jpBtnHapus.classList.remove("cursor-not-allowed");
}

function jpClearSelection() {
  jpSelectedNama = null;

  jpBtnEdit.disabled = true;
  jpBtnHapus.disabled = true;

  jpBtnEdit.classList.replace("bg-indigo-600", "bg-indigo-400");
  jpBtnEdit.classList.add("cursor-not-allowed");

  jpBtnHapus.classList.replace("bg-red-500", "bg-red-400");
  jpBtnHapus.classList.add("cursor-not-allowed");
}

/* ======================================================
   MODAL
====================================================== */
function jpOpenTambah() {
  jpMode = "add";
  jpNama.value = "";
  jpModalTitle.innerText = "Tambah Jenis Permohonan";
  modalJP.classList.remove("hidden");
}

function jpOpenEdit() {
  if (!jpSelectedNama) return;
  jpMode = "edit";
  jpNama.value = jpSelectedNama;
  jpModalTitle.innerText = "Edit Jenis Permohonan";
  modalJP.classList.remove("hidden");
}

function jpCloseModal() {
  modalJP.classList.add("hidden");
}

/* ======================================================
   SUBMIT
====================================================== */
async function jpSubmit() {
  const nama = jpNama.value.trim();
  if (!nama) return alert("Nama wajib diisi");

  const user = JSON.parse(localStorage.getItem("user"));

  const payload =
    jpMode === "add"
      ? { action: "addJenisPermohonan", nama }
      : { action: "updateJenisPermohonan", oldNama: jpSelectedNama, nama };

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      username: user.username
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  jpCloseModal();
  jpLoad();
}

/* ======================================================
   DELETE
====================================================== */
async function jpHapus() {
  if (!jpSelectedNama) return;
  if (!confirm(`Hapus jenis permohonan:\n${jpSelectedNama}?`)) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deleteJenisPermohonan",
      username: user.username,
      nama: jpSelectedNama
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  jpLoad();
}

/* ======================================================
   REGISTER GLOBAL
====================================================== */
window.initJenisPermohonan = initJenisPermohonan;
