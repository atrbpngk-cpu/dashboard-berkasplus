/* ======================================================
   DAFTAR PETUGAS JS (FINAL PRODUKSI)
   SOURCE : Sheet "Users"
   KOLOM  :
   - Nama Lengkap
   - Role
   AKSES  : Administrator ONLY
====================================================== */

/* =====================
   STATE
===================== */
let tableBody, btnTambah, btnEdit, btnHapus;
let selectedRow = null;
let selectedData = null;
let modePetugas = "add"; // add | edit

/* ======================================================
   INIT HALAMAN (DIPANGGIL ROUTER)
====================================================== */
function initDaftarPetugas() {
  tableBody = document.getElementById("tablePetugas");
  btnTambah = document.getElementById("btnTambah");
  btnEdit   = document.getElementById("btnEdit");
  btnHapus  = document.getElementById("btnHapus");

  if (!tableBody || !btnTambah || !btnEdit || !btnHapus) {
    console.error("Daftar Petugas: element belum siap");
    return;
  }

  initButtons();
  loadPetugas();
}

/* ======================================================
   LOAD DATA PETUGAS
====================================================== */
async function loadPetugas() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.username) {
      showErrorRow("Session tidak valid");
      return;
    }

    const res = await fetch("https://webapi.berkasplus.my.id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getUsers",
        username: user.username   // ✅ FLAT (FINAL)
      })
    });

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      console.error(json);
      showErrorRow("Gagal mengambil data petugas");
      return;
    }

    renderTable(json.data);

  } catch (err) {
    console.error(err);
    showErrorRow("Terjadi kesalahan koneksi");
  }
}

/* ======================================================
   RENDER TABLE
====================================================== */
function renderTable(data) {
  tableBody.innerHTML = "";
  clearSelection();

  if (data.length === 0) {
    showEmptyRow();
    return;
  }

  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-3 py-1 text-center">${index + 1}</td>
      <td class="border px-3 py-1">${item["Nama Lengkap"] || ""}</td>
      <td class="border px-3 py-1">${item["Role"] || ""}</td>
    `;

    tr.onclick = () => selectRow(tr, item);
    tableBody.appendChild(tr);
  });
}

/* ======================================================
   ROW STATE
====================================================== */
function showEmptyRow() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-6 text-gray-400 italic">
        Belum ada data petugas
      </td>
    </tr>
  `;
}

function showErrorRow(msg) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-6 text-red-500 italic">
        ${msg}
      </td>
    </tr>
  `;
}

/* ======================================================
   SELECTION
====================================================== */
function selectRow(row, data) {
  clearSelection();

  row.classList.add("selected");
  selectedRow = row;

  selectedData = {
    oldNama: data["Nama Lengkap"], // 🔑 SIMPAN NAMA LAMA
    nama: data["Nama Lengkap"],
    role: data["Role"] || "User"
  };

  btnEdit.disabled = false;
  btnHapus.disabled = false;

  btnEdit.classList.remove("bg-indigo-400", "cursor-not-allowed");
  btnEdit.classList.add("bg-indigo-600");

  btnHapus.classList.remove("bg-red-400", "cursor-not-allowed");
  btnHapus.classList.add("bg-red-500");
}


function clearSelection() {
  document
    .querySelectorAll("#tablePetugas tr")
    .forEach(r => r.classList.remove("selected"));

  selectedRow = null;
  selectedData = null;

  btnEdit.disabled = true;
  btnHapus.disabled = true;

  btnEdit.classList.remove("bg-indigo-600");
  btnEdit.classList.add("bg-indigo-400", "cursor-not-allowed");

  btnHapus.classList.remove("bg-red-500");
  btnHapus.classList.add("bg-red-400", "cursor-not-allowed");
}


/* ======================================================
   BUTTON STATE
====================================================== */
function enableButtons() {
  btnEdit.disabled = false;
  btnHapus.disabled = false;
  btnEdit.classList.replace("bg-indigo-400","bg-indigo-600");
  btnHapus.classList.replace("bg-red-400","bg-red-500");
}

function disableButtons() {
  btnEdit.disabled = true;
  btnHapus.disabled = true;
  btnEdit.classList.replace("bg-indigo-600","bg-indigo-400");
  btnHapus.classList.replace("bg-red-500","bg-red-400");
}

/* ======================================================
   BUTTON ACTION
====================================================== */
function initButtons() {

  btnTambah.onclick = () => openTambah();
  btnEdit.onclick   = () => openEdit();
  btnHapus.onclick  = () => hapusPetugas();
}

/* ======================================================
   MODAL HANDLER
====================================================== */
function openTambah() {
  modePetugas = "add";
  mpNama.value = "";
  mpRole.value = "User";
  modalTitle.innerText = "Tambah Petugas";
  modalPetugas.classList.remove("hidden");
}

function openEdit() {
  if (!selectedData) return;
  modePetugas = "edit";
  mpNama.value = selectedData.nama;
  mpRole.value = selectedData.role;
  modalTitle.innerText = "Edit Petugas";
  modalPetugas.classList.remove("hidden");
}


function closeModal() {
  const modal = document.getElementById("modalPetugas");
  if (modal) modal.classList.add("hidden");
}


/* ======================================================
   SUBMIT TAMBAH / EDIT
====================================================== */
async function submitPetugas() {
  const nama = mpNama.value.trim();
  const role = mpRole.value;

  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  let body;

  if (modePetugas === "add") {
    body = {
      action: "addUser",
      username: user.username,
      nama,
      role
    };
  } else {
    body = {
      action: "updateUser",
      username: user.username,
      oldNama: selectedData.oldNama, // 🔑 KRITIS
      nama,
      role
    };
  }

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();

  if (!json.success) {
    alert("Error: " + json.message);
    return;
  }

  closeModal();
  loadPetugas();
}

/* ======================================================
   HAPUS PETUGAS
====================================================== */
async function hapusPetugas() {
  if (!selectedData) return;

  if (!confirm(`Yakin ingin menghapus:\n\n${selectedData.nama}?`)) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://webapi.berkasplus.my.id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deleteUser",
      username: user.username,
      nama: selectedData.nama
    })
  });

  const json = await res.json();

  if (!json.success) {
    alert("Error: " + json.message);
    return;
  }

  loadPetugas();
}

/* ======================================================
   REGISTER GLOBAL
====================================================== */
window.initDaftarPetugas = initDaftarPetugas;
