/* ======================================================
   INBOX.JS
====================================================== */

const userLogin =
JSON.parse(
localStorage.getItem("user") || "{}"
);

const namaUser =
(
userLogin.nama_lengkap ||
userLogin.nama ||
""
).trim();

let tableBody;
let badgeBaru;
let notifInbox;
let notifText;

let inboxBtnPrev;
let inboxBtnNext;

let originalInboxData = [];
let inboxData = [];

let selectedRow = null;

let inboxCurrentPage = 1;

const INBOX_PER_PAGE = 10;


/* ======================================================
INIT
====================================================== */

function initInboxBerkas(){

tableBody =
document.getElementById(
"tableBody"
);

badgeBaru =
document.getElementById(
"badgeBaru"
);

notifInbox =
document.getElementById(
"notifInbox"
);

notifText =
document.getElementById(
"notifText"
);

inboxBtnPrev =
document.getElementById(
"inboxBtnPrev"
);

inboxBtnNext =
document.getElementById(
"inboxBtnNext"
);

loadInboxData();

}


/* ======================================================
LOAD DATA
====================================================== */

function loadInboxData(){

fetch(
`${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`
)

.then(r=>r.json())

.then(res=>{

console.log(
"RAW API:",
res
);

if(Array.isArray(res)){

originalInboxData =
res;

}
else if(

res &&
res.success &&
Array.isArray(res.data)

){

originalInboxData =
res.data;

}
else{

originalInboxData=[];

}

console.log(
"TOTAL INBOX:",
originalInboxData.length
);

inboxData =
[
...originalInboxData
];

inboxCurrentPage = 1;

updateBadge(
inboxData.length
);

updateNotifInbox();

renderInboxTable();

})

.catch(err=>{

console.error(
"INBOX ERROR:",
err
);

originalInboxData=[];

inboxData=[];

renderInboxTable();

});

}


/* ======================================================
FILTER
====================================================== */

function applyFilter(){

const nomor =
document.getElementById(
"filterNomor"
).value.trim();

const tahun =
document.getElementById(
"filterTahun"
).value.trim();

inboxData =

originalInboxData.filter(
r=>{

const nt =
String(
r[0] || ""
);

if(
nomor &&
!nt.includes(
nomor
)
){
return false;
}

if(
tahun &&
!nt.includes(
tahun
)
){
return false;
}

return true;

});

inboxCurrentPage = 1;

renderInboxTable();

}



function resetFilter(){

document.getElementById(
"filterNomor"
).value="";

document.getElementById(
"filterTahun"
).value="";

inboxData =
[
...originalInboxData
];

inboxCurrentPage = 1;

renderInboxTable();

}


/* ======================================================
RENDER TABLE
====================================================== */

function renderInboxTable(){

if(!tableBody)
return;

tableBody.innerHTML="";

const totalPage =

Math.max(
1,
Math.ceil(
inboxData.length /
INBOX_PER_PAGE
)
);

if(
inboxCurrentPage >
totalPage
){

inboxCurrentPage =
totalPage;

}

const start =

(
inboxCurrentPage-1
)

*
INBOX_PER_PAGE;

const end =
start +
INBOX_PER_PAGE;

const rows =

inboxData.slice(
start,
end
);

if(rows.length===0){

tableBody.innerHTML=

`
<tr>

<td colspan="10"
class="text-center py-4">

Tidak ada inbox

</td>

</tr>
`;

updateInboxPagination();

return;

}

rows.forEach(
(r,i)=>{

const tr =
document.createElement(
"tr"
);

tr.dataset.nomor =
r[0];

tr.onclick =
()=>selectRow(tr);

tr.innerHTML =

`

<td>

${start+i+1}

</td>

<td>

${r[0]||"-"}

</td>

<td>

${r[1]||"-"}

</td>

<td>

${formatTanggal(r[2])}

</td>

<td>

${r[3]||"-"}

</td>

<td>

${r[4]||"-"}

</td>

<td>

${r[5]||"-"}

</td>

<td>

${formatTanggal(r[6])}

</td>

<td>

${r[7]||"-"}

</td>

<td>

${r[8]||"-"}

</td>

`;

tableBody.appendChild(
tr
);

});

updateInboxPagination();

}


/* ======================================================
PAGINATION
====================================================== */

function updateInboxPagination(){

const totalPage =

Math.max(
1,
Math.ceil(
inboxData.length /
INBOX_PER_PAGE
)
);

document.getElementById(
"inboxCurrentPage"
).innerText =
inboxCurrentPage;

document.getElementById(
"inboxTotalPage"
).innerText =
totalPage;

if(inboxBtnPrev){

inboxBtnPrev.disabled =

inboxCurrentPage<=1;

}

if(inboxBtnNext){

inboxBtnNext.disabled =

inboxCurrentPage>=
totalPage;

}

}



function inboxNextPage(){

const totalPage =

Math.max(
1,
Math.ceil(
inboxData.length /
INBOX_PER_PAGE
)
);

if(
inboxCurrentPage <
totalPage
){

inboxCurrentPage++;

renderInboxTable();

}

}



function inboxPrevPage(){

if(
inboxCurrentPage>1
){

inboxCurrentPage--;

renderInboxTable();

}

}


/* ======================================================
SELECT ROW
====================================================== */

function selectRow(row){

document
.querySelectorAll(
"#tableBody tr"
)

.forEach(
x=>

x.classList.remove(
"bg-blue-100"
)

);

row.classList.add(
"bg-blue-100"
);

selectedRow=row;

}


/* ======================================================
BADGE
====================================================== */

function updateBadge(n){

if(
badgeBaru
){

badgeBaru.innerText=n;

}

}


/* ======================================================
NOTIF
====================================================== */

function updateNotifInbox(){

if(
!notifInbox ||
!notifText
){
return;
}

if(
inboxData.length>0
){

notifInbox.classList.remove(
"hidden"
);

notifText.innerText =

`📥 ${inboxData.length} inbox baru`;

}
else{

notifInbox.classList.add(
"hidden"
);

}

}


/* ======================================================
FORMAT TANGGAL
====================================================== */

function formatTanggal(v){

if(!v)
return "-";

const d =
new Date(v);

if(
isNaN(d)
)
return v;

return d.toLocaleString(
"id-ID"
);

}


/* ======================================================
GLOBAL EXPORT
====================================================== */

window.initInboxBerkas =
initInboxBerkas;

window.applyFilter =
applyFilter;

window.resetFilter =
resetFilter;

window.inboxNextPage =
inboxNextPage;

window.inboxPrevPage =
inboxPrevPage;
