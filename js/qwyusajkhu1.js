/* ======================================================
   INBOX.JS
====================================================== */

if (!window.__INBOX_JS_LOADED__) {

window.__INBOX_JS_LOADED__ = true;

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

const namaSeksi =
(
userLogin.seksi ||
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

let currentPage = 1;

const perPage = 10;


/* ======================================================
DASHBOARD BADGE
====================================================== */

window.initDashboardInbox =
function(){

const countEl =
document.getElementById(
"dashboardInboxCount"
);

const badgeEl =
document.getElementById(
"dashboardInboxBadge"
);

if(!countEl) return;

fetch(
`${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`
)

.then(r=>r.json())

.then(res=>{

let data=[];

if(Array.isArray(res)){

data=res;

}

else if(

res &&
res.success===true &&
Array.isArray(res.data)

){

data=res.data;

}

const total=data.length;

countEl.innerText=total;

if(badgeEl){

badgeEl.classList.toggle(
"hidden",
total===0
);

}

})

.catch(()=>{

countEl.innerText=0;

});

};


/* ======================================================
INIT
====================================================== */

window.initInboxBerkas =
function(){

if(

!window.APP_CONFIG?.API_WEB ||

!namaUser

){

return;

}

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

if(!tableBody) return;

loadInboxData();

};


/* ======================================================
LOAD
====================================================== */

function loadInboxData(){

fetch(
`${APP_CONFIG.API_WEB}?action=inbox&user=${encodeURIComponent(namaUser)}`
)

.then(r=>r.json())

.then(res=>{

console.log(
"RAW API INBOX:",
res
);

if(Array.isArray(res)){

originalInboxData=res;

}

else if(

res &&
res.success===true &&
Array.isArray(res.data)

){

originalInboxData=res.data;

}

else{

originalInboxData=[];

}

console.log(
"TOTAL API:",
originalInboxData.length
);

inboxData=[
...originalInboxData
];

currentPage=1;

updateBadge(
inboxData.length
);

updateNotifInbox();

renderTable();

})

.catch(err=>{

console.error(
"INBOX ERROR:",
err
);

inboxData=[];

renderTable();

});

}


/* ======================================================
FILTER
====================================================== */

window.applyFilter =
function(){

const nomor=

document.getElementById(
"filterNomor"
).value.trim();

const tahun=

document.getElementById(
"filterTahun"
).value.trim();

inboxData=

originalInboxData.filter(
r=>{

const nt=
String(
r[0]||""
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

currentPage=1;

renderTable();

};


window.resetFilter=
function(){

document.getElementById(
"filterNomor"
).value="";

document.getElementById(
"filterTahun"
).value="";

inboxData=[
...originalInboxData
];

currentPage=1;

renderTable();

};


/* ======================================================
RENDER
====================================================== */

function renderTable(){

tableBody.innerHTML="";

if(
inboxData.length===0
){

tableBody.innerHTML=
`
<tr>
<td colspan="10"
class="text-center">

Tidak ada inbox

</td>
</tr>
`;

updatePagination();

return;

}

const start=
(
currentPage-1
)
*
perPage;

const end=
start+perPage;

const pageData=
inboxData.slice(
start,
end
);

console.log(
"PAGE DATA:",
pageData.length
);

pageData.forEach(

(r,i)=>{

const tr=
document.createElement(
"tr"
);

tr.dataset.nomor=
r[0];

tr.onclick=
()=>selectRow(tr);

tr.innerHTML=
`

<td>
${start+i+1}
</td>

<td>${r[0]}</td>

<td>${r[1]}</td>

<td>
${formatTanggal(r[2])}
</td>

<td>${r[3]}</td>

<td>${r[4]}</td>

<td>
${r[5]||"-"}
</td>

<td>
${formatTanggal(r[6])}
</td>

<td>${r[7]}</td>

<td>
${r[8]||"-"}
</td>

`;

tableBody.appendChild(
tr
);

});

updatePagination();

}


/* ======================================================
PAGINATION
====================================================== */

function updatePagination(){

const totalPage=

Math.max(

1,

Math.ceil(
inboxData.length/
perPage
)

);

console.log(
"TOTAL PAGE:",
totalPage
);

const elCurrent=
document.getElementById(
"inboxCurrentPage"
);

const elTotal=
document.getElementById(
"inboxTotalPage"
);

if(elCurrent){

elCurrent.innerText=
currentPage;

}

if(elTotal){

elTotal.innerText=
totalPage;

}

if(inboxBtnPrev){

inboxBtnPrev.disabled=

currentPage===1;

}

if(inboxBtnNext){

inboxBtnNext.disabled=

currentPage>=
totalPage;

}

}


window.inboxNextPage=
function(){

if(

currentPage*
perPage

<

inboxData.length

){

currentPage++;

renderTable();

}

};


window.inboxPrevPage=
function(){

if(
currentPage>1
){

currentPage--;

renderTable();

}

};


/* ======================================================
SELECT
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
UTIL
====================================================== */

function updateBadge(n){

if(badgeBaru){

badgeBaru.innerText=n;

}

}


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

notifText.innerText=

`📥 ${inboxData.length} inbox baru`;

}

else{

notifInbox.classList.add(
"hidden"
);

}

}


function formatTanggal(v){

if(!v)
return "-";

const d=
new Date(v);

if(isNaN(d))
return v;

const p=
n=>

String(n)

.padStart(
2,
"0"
);

return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;

}

}
