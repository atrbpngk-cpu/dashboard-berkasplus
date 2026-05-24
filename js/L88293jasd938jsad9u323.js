// js/loading.js
window.USE_GLOBAL_LOADING = true;
const GlobalLoading = (() => {
  const el = document.getElementById("globalLoading");
  const textEl = document.getElementById("globalLoadingText");
  if (!el) {
    console.warn("[GlobalLoading] #globalLoading tidak ditemukan");
    return {};
  }
  let counter = 0;
  let lastUserAction = 0;
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest("button,a,input[type=submit]");
      if (!btn) return;
      lastUserAction = Date.now();
    },
    true
  );
  document.addEventListener(
    "submit",
    () => {
      lastUserAction = Date.now();
    },
    true
  );
  function isUserAction() {
    return Date.now() - lastUserAction < 10000;
  }
  function show(text = "Sedang memproses data...") {
    counter++;
    if (textEl) {
      textEl.textContent = text;
    }
    el.classList.remove("hidden");
    el.classList.add("flex");
  }
  function hide() {
    counter = Math.max(0, counter - 1);
    if (counter === 0) {
      el.classList.add("hidden");
      el.classList.remove("flex");
    }
  }
  function forceHide() {
    counter = 0;
    el.classList.add("hidden");
    el.classList.remove("flex");
  }
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const opt = args[1] || {};
    const headers = opt.headers || {};
    const silent = headers["X-SILENT"] === "1";
    const noLoading = headers["X-NO-LOADING"] === "1";
    const url = String(args[0] || "").toLowerCase();

    /* NOTIF INBOX TANPA LOADING */

    const isNotifInbox =
      url.includes("action=inbox&user=") || url.includes("action=inboxuser");

    if (isNotifInbox) {
      return originalFetch(...args);
    }

    /* LOADING NORMAL */

    const useLoading =
      window.USE_GLOBAL_LOADING === true &&
      !silent &&
      !noLoading &&
      isUserAction();

    if (useLoading) {
      show();
    }

    try {
      return await originalFetch(...args);
    } finally {
      if (useLoading) {
        hide();
      }
    }
  };

  return {
    show,
    hide,
    forceHide,
  };
})();
