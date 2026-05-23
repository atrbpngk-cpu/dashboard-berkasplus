console.log("dashboard-helper");

const REAL_FETCH = window.fetch.bind(window);
window.__DASH_CACHE = null;
window.__DASH_LOADING = null;
window.__DASH_TIME = 0;

const DASH_TTL = 10000;
async function getDashboardCache(){
  const now = Date.now();
  if(
    window.__DASH_CACHE &&
    now-window.__DASH_TIME < DASH_TTL
  ){
    return window.__DASH_CACHE;
  }
  if(window.__DASH_LOADING){
    return window.__DASH_LOADING;
  }
  const user =
  JSON.parse(
    localStorage.getItem("user")
    || "{}"
  );
  const nama =
    user.nama_lengkap ||
    user.nama ||
    user.username ||
    "";
  window.__DASH_LOADING =
    REAL_FETCH(
      `${APP_CONFIG.API_WEB}`+
      `?action=dashboard`+
      `&user=`+
      encodeURIComponent(nama)
    )
    .then(r=>r.json())
    .then(json=>{
      window.__DASH_CACHE =
        json.data || {};
      window.__DASH_TIME =
        Date.now();
      return window.__DASH_CACHE;
    })
    .catch(err=>{
      console.error(
        "Dashboard cache error",
        err
      );
      return {};
    })
    .finally(()=>{

      window.__DASH_LOADING =
      null;
    });
  return window.__DASH_LOADING;
}
window.fetch = async function(
  input,
  init
){
  const url =
    typeof input==="string"
    ? input
    : input.url;
  try{
    if(
      !url.includes(
        APP_CONFIG.API_WEB
      )
    ){
      return REAL_FETCH(
        input,
        init
      );
    }
    const u =
      new URL(url);
    const action =
      u.searchParams.get(
        "action"
      );
    if(
      action==="beban"
    ){
      const cache =
      await getDashboardCache();
      return new Response(
        JSON.stringify(
          cache.beban || {
            success:true,
            data:{data:[]}
          }
        ),
        {
          headers:{
            "Content-Type":
            "application/json"
          }
        }
      );
    }
    if(
      action==="bebanPU"
    ){
      const cache =
      await getDashboardCache();
      return new Response(
        JSON.stringify({
          success:true,
          data:
          cache.bebanPU || []
        }),
        {
          headers:{
            "Content-Type":
            "application/json"
          }
        }
      );
    }
    if(
      action==="rekapSeksi"
    ){
      const cache =
      await getDashboardCache();
      return new Response(
        JSON.stringify(
          cache.rekapSeksi || {
            success:true,
            data:{data:[]}
          }
        ),
        {
          headers:{
            "Content-Type":
            "application/json"
          }
        }
      );
    }
  }
  catch(err){
    console.error(err);
  }
  return REAL_FETCH(
    input,
    init
  );
};
setInterval(()=>{
  window.__DASH_CACHE =
  null;
},10000);
