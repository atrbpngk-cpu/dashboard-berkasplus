// js/loading.js

window.USE_GLOBAL_LOADING = true;
const GlobalLoading = (() => {
  const el = document.getElementById(
    "globalLoading"
  );
  const textEl = document.getElementById(
    "globalLoadingText"
  );
  if (!el) {
    console.warn(
      "[GlobalLoading] #globalLoading tidak ditemukan"
    );
    return {};
  }
  let counter = 0;
  let lastUserAction = 0;
  document.addEventListener(
    "click",
    e => {
      const btn = e.target.closest(
        "button, a, input[type=submit]"
      );
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
    return (
      Date.now() -
      lastUserAction
    ) < 10000;
  }
  function show(
    text =
      "Sedang memproses data..."
  ) {
    counter++;
    if (textEl) {
      textEl.textContent =
        text;
    }
    el.classList.remove(
      "hidden"
    );
    el.classList.add(
      "flex"
    );
  }

  function hide() {
    counter = Math.max(
      0,
      counter - 1
    );
    if (counter === 0) {
      el.classList.add(
        "hidden"
      );
      el.classList.remove(
        "flex"
      );
    }
  }
  function forceHide() {
    counter = 0;
    el.classList.add(
      "hidden"
    );
    el.classList.remove(
      "flex"
    );
  }

  async function run(
    fn,
    text =
      "Sedang memproses data..."
  ) {
    show(text);
    try {
      return await fn();
    }
    finally {
      hide();
    }
  }
  function getCounter() {
    return counter;
  }

  const originalFetch =
    window.fetch;
  window.fetch =
    async (...args) => {
      const options =
        args[1] || {};
      const silent =
        options.silent === true;
      delete options.silent;
      const useLoading =
        !silent &&
        isUserAction();
      if (
        useLoading
      ) {
        show();
      }
      try {
        return await originalFetch(
          args[0],
          options
        );
      }
      finally {
        if (
          useLoading
        ) {
          hide();
        }
      }
    };

  return {
    show,
    hide,
    forceHide,
    run,
    getCounter
  };
})();
