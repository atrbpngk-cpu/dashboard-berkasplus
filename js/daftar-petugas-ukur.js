/* ======================================================
   PETUGAS UKUR JS (FINAL PRODUKSI - AMAN SPA)
====================================================== */

/* =====================
   STATE
===================== */
let puTableBody, puBtnTambah, puBtnEdit, puBtnHapus;
let puSelectedNama = null;
let puMode = "add"; // add | edit

/* ======================================================
   INIT (DIPANGGIL ROUTER)
====================================================== */
function initPetugasUkur() {
  puTableBody = document.getElementById("tablePetugasUkur");
  puBtnTambah = document.getElementById("btnTambahUkur");
  puBtnEdit   = document.getElementById("btnEditUkur");
  puBtnHapus  = document.getElementById("btnHapusUkur");

  if (!puTableBody || !puBtnTambah || !puBtnEdit || !puBtnHapus) {
    console.error("Petugas Ukur: element belum siap");
    return;
  }

  puBtnTambah.onclick = puOpenTambah;
  puBtnEdit.onclick   = puOpenEdit;
  puBtnHapus.onclick  = puHapus;

  puLoad();
}

/* ======================================================
   LOAD DATA
====================================================== */
async function puLoad() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.username) throw "Session tidak valid";

    const res = await fetch("https://webapi.berkasplus.my.id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getPetugasUkur",
        username: user.username
      })
    });

    const json = await res.json();
    if (!json.success) throw json.message;

    puRender(json.data || []);
  } catch (err) {
    puTableBody.innerHTML = `
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
function puRender(data) {
  puTableBody.innerHTML = "";
  puClearSelection(); // 🔥 WAJIB

  if (data.length === 0) {
    puTableBody.innerHTML = `
      <tr>
        <td class="py-6 text-center text-gray-400 italic">
          Belum ada petugas ukur
        </td>
      </tr>`;
    return;
  }

  data.forEach(nama => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="border px-3 py-1">${nama}</td>`;
    tr.onclick = () => puSelectRow(tr, nama);
    puTableBody.appendChild(tr);
  });
}

/* ======================================================
   SELECTION
====================================================== */
function puSelectRow(row, nama) {
  puClearSelection();

  row.classList.add("selected");
  puSelectedNama = nama;

  puBtnEdit.disabled = false;
  puBtnHapus.disabled = false;

  puBtnEdit.classList.remove("bg-indigo-400", "cursor-not-allowed");
  puBtnEdit.classList.add("bg-indigo-600");

  puBtnHapus.classList.remove("bg-red-400", "cursor-not-allowed");
  puBtnHapus.classList.add("bg-red-500");
}


function puClearSelection() {
  puSelectedNama = null;

  // clear visual
  document
    .querySelectorAll("#tablePetugasUkur tr")
    .forEach(r => r.classList.remove("selected"));

  // disable buttons
  puBtnEdit.disabled = true;
  puBtnHapus.disabled = true;

  puBtnEdit.classList.remove("bg-indigo-600");
  puBtnEdit.classList.add("bg-indigo-400", "cursor-not-allowed");

  puBtnHapus.classList.remove("bg-red-500");
  puBtnHapus.classList.add("bg-red-400", "cursor-not-allowed");
}

/* ======================================================
   MODAL
====================================================== */
function puOpenTambah() {
  puMode = "add";
  puNama.value = "";
  modalUkur.classList.remove("hidden");
}

function puOpenEdit() {
  if (!puSelectedNama) return;
  puMode = "edit";
  puNama.value = puSelectedNama;
  modalUkur.classList.remove("hidden");
}

function closeModalPetugasUkur() {
  const modal = document.getElementById("modalUkur");
  if (modal) modal.classList.add("hidden");
}

/* ======================================================
   SUBMIT (ADD / EDIT)
====================================================== */
async function submitPetugasUkur() {
  const nama = puNama.value.trim();
  if (!nama) return alert("Nama wajib diisi");

  const user = JSON.parse(localStorage.getItem("user"));

  const payload =
    puMode === "add"
      ? { action: "addPetugasUkur", nama }
      : { action: "updatePetugasUkur", oldNama: puSelectedNama, nama };

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

  closeModalPetugasUkur();
  puLoad();
}

/* ======================================================
   DELETE
====================================================== */
async function puHapus() {
  if (!puSelectedNama) return;
  if (!confirm(`Hapus petugas ukur:\n${puSelectedNama}?`)) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deletePetugasUkur",
      username: user.username,
      nama: puSelectedNama
    })
  });

  const json = await res.json();
  if (!json.success) return alert(json.message);

  puLoad();
}

/* ======================================================
   REGISTER GLOBAL (WAJIB UNTUK ROUTER)
====================================================== */
window.initPetugasUkur = initPetugasUkur;
