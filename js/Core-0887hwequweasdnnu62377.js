/* =====================================================
   STORAGE HELPER GLOBAL
   BERKAS+ SECURITY LAYER
===================================================== */

(function () {

  const TARGET_KEY = "user";

  // ===============================
  // ENCODE
  // ===============================
  function encode(data) {

    try {

      return btoa(
        encodeURIComponent(data)
      );

    } catch (err) {

      console.warn("Encode gagal", err);

      return data;
    }
  }

  // ===============================
  // DECODE
  // ===============================
  function decode(data) {

    try {

      return decodeURIComponent(
        atob(data)
      );

    } catch (err) {

      return data;
    }
  }

  // ===============================
  // OVERRIDE LOCALSTORAGE
  // ===============================

  const originalSetItem =
    localStorage.setItem.bind(localStorage);

  const originalGetItem =
    localStorage.getItem.bind(localStorage);

  // ===============================
  // SET ITEM
  // ===============================
  localStorage.setItem = function (key, value) {

    // encode khusus user
    if (key === TARGET_KEY) {

      value = encode(value);
    }

    originalSetItem(key, value);
  };

  // ===============================
  // GET ITEM
  // ===============================
  localStorage.getItem = function (key) {

    const value = originalGetItem(key);

    if (!value) return value;

    // decode khusus user
    if (key === TARGET_KEY) {

      return decode(value);
    }

    return value;
  };

})();