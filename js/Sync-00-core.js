/* ===============================
helper.js
================================== */

window.API_CACHE = new Map();
window.API_PENDING = new Map();



window.smartFetch = async function (
  url,
  options = {},
  ttl = 10000
) {

  const method = (options.method || "GET").toUpperCase();


  if (method !== "GET") {
    return fetch(url, options)
      .then(r => r.json());
  }

  const cacheKey = url;


  const now = Date.now();

  if (window.API_CACHE.has(cacheKey)) {

    const cached = window.API_CACHE.get(cacheKey);

    if (now - cached.time < ttl) {
      return cached.data;
    }
  }


  if (window.API_PENDING.has(cacheKey)) {
    return window.API_PENDING.get(cacheKey);
  }

  const requestPromise = fetch(url, options)
    .then(async r => {

      const data = await r.json();

      window.API_CACHE.set(cacheKey, {
        data,
        time: Date.now()
      });

      return data;
    })
    .finally(() => {
      window.API_PENDING.delete(cacheKey);
    });

  window.API_PENDING.set(cacheKey, requestPromise);

  return requestPromise;
};



window.clearApiCache = function(keyword = "") {

  if (!keyword) {
    window.API_CACHE.clear();
    return;
  }

  [...window.API_CACHE.keys()].forEach(key => {
    if (key.includes(keyword)) {
      window.API_CACHE.delete(key);
    }
  });
};



setInterval(() => {

  const now = Date.now();

  [...window.API_CACHE.entries()].forEach(([key, val]) => {

    if (now - val.time > 60000) {
      window.API_CACHE.delete(key);
    }

  });

}, 30000);