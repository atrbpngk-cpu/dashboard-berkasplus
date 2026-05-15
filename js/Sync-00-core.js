/* ======================================================
HELPER
====================================================== */

window.API_CACHE = new Map();
window.API_PENDING = new Map();

window.PREFETCH_DATA = {};
window.PREFETCH_LOADING = {};
window.REALTIME_ACTIONS = [
  "inbox",
  "notif",
  "dashboard"
];

window.smartFetch = async function (
  url,
  options = {},
  ttl = 3000
) {

  const method =
    (options.method || "GET")
      .toUpperCase();
  if (method !== "GET") {

    return fetch(url, options)
      .then(async r => {

        const data =
          await r.json();
        clearApiCache("inbox");
        clearApiCache("notif");
        clearApiCache("dashboard");
        clearApiCache("beban");
        clearApiCache("bebanPU");

        return data;
      });
  }

  const isRealtime =
    window.REALTIME_ACTIONS.some(
      x => url.includes(`action=${x}`)
    );

  const cacheKey = url;
  if (isRealtime) {
    ttl = 1000;
  }
  const now = Date.now();

  if (window.API_CACHE.has(cacheKey)) {

    const cached =
      window.API_CACHE.get(cacheKey);

    if (
      now - cached.time < ttl
    ) {

      return cached.data;
    }
  }
  if (
    window.API_PENDING.has(cacheKey)
  ) {

    return window.API_PENDING.get(
      cacheKey
    );
  }

  const requestPromise =
    fetch(url, options)

    .then(async r => {

      const data =
        await r.json();

      window.API_CACHE.set(
        cacheKey,
        {
          data,
          time: Date.now()
        }
      );

      return data;
    })

    .catch(err => {

      console.error(
        "smartFetch Error:",
        err
      );

      return {
        success: false,
        message: err.toString()
      };
    })

    .finally(() => {

      window.API_PENDING.delete(
        cacheKey
      );
    });

  window.API_PENDING.set(
    cacheKey,
    requestPromise
  );

  return requestPromise;
};

window.clearApiCache = function (
  keyword = ""
) {

  if (!keyword) {

    window.API_CACHE.clear();

    return;
  }

  [...window.API_CACHE.keys()]
    .forEach(key => {

      if (
        key.includes(keyword)
      ) {

        window.API_CACHE.delete(key);
      }
    });
};

window.prefetchData =
async function (
  key,
  url,
  ttl = 3000
) {

  if (
    window.PREFETCH_LOADING[key]
  ) {

    return;
  }

  window.PREFETCH_LOADING[key] =
    true;

  try {

    const data =
      await smartFetch(
        url,
        {},
        ttl
      );

    window.PREFETCH_DATA[key] = {

      data,

      time: Date.now()
    };

  } catch (err) {

    console.error(
      "Prefetch Error:",
      key,
      err
    );

  } finally {

    window.PREFETCH_LOADING[key] =
      false;
  }
};

window.getPrefetchData =
function (key) {

  return (
    window.PREFETCH_DATA[key]
      ?.data
  );
};

setInterval(() => {

  const now = Date.now();

  [...window.API_CACHE.entries()]
    .forEach(([key, val]) => {

      if (
        now - val.time > 60000
      ) {

        window.API_CACHE.delete(key);
      }
    });

}, 30000);

window.startRealtimeBackground =
function(username = "") {

  if (window.__REALTIME_STARTED) {
    return;
  }

  window.__REALTIME_STARTED = true;

  setInterval(() => {

    if (document.hidden) {
      return;
    }

    prefetchData(
      "inbox",
      `${APP_CONFIG.API_WEB}?action=inbox&user=${username}&realtime=1`,
      1000
    );

    prefetchData(
      "notif",
      `${APP_CONFIG.API_WEB}?action=notif&user=${username}&realtime=1`,
      1000
    );
    prefetchData(
      "dashboard",
      `${APP_CONFIG.API_WEB}?action=dashboard&realtime=1`,
      2000
    );
    prefetchData(
      "beban",
      `${APP_CONFIG.API_WEB}?action=beban`,
      5000
    );

    prefetchData(
      "bebanPU",
      `${APP_CONFIG.API_WEB}?action=bebanPU`,
      5000
    );

  }, 3000);
};

document.addEventListener(
  "visibilitychange",
  () => {

    if (!document.hidden) {

      clearApiCache("inbox");
      clearApiCache("notif");
      clearApiCache("dashboard");
    }
  }
);



window.renderFromPrefetch =
async function(
  key,
  url,
  renderFn,
  ttl = 3000
){

  let data =
    getPrefetchData(key);

  if (!data) {

    data =
      await smartFetch(
        url,
        {},
        ttl
      );
  }

  renderFn(data);
};
