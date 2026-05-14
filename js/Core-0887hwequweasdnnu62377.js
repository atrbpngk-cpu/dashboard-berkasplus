/* =====================================================
   BERKAS+ STORAGE 
===================================================== */

(function () {

  const TARGET_KEY = "user";


  const originalSetItem =
    Storage.prototype.setItem;

  const originalGetItem =
    Storage.prototype.getItem;


  function encode(str) {

    try {

      return btoa(
        unescape(
          encodeURIComponent(str)
        )
      );

    } catch (err) {

      return str;
    }
  }


  function decode(str) {

    try {

      return decodeURIComponent(
        escape(
          atob(str)
        )
      );

    } catch (err) {

      return str;
    }
  }


  Storage.prototype.setItem =
    function (key, value) {

      
      if (key === TARGET_KEY) {

       
        if (typeof value === "string") {

         
          try {

            JSON.parse(value);

            value = "x" + encode(value);

          } catch (e) {}
        }
      }

      return originalSetItem.call(
        this,
        key,
        value
      );
    };


  Storage.prototype.getItem =
    function (key) {

      let value =
        originalGetItem.call(this, key);

      if (!value) return value;


      if (
        key === TARGET_KEY &&
        typeof value === "string" &&
        value.startsWith("x")
      ) {

        value =
          value.replace("x", "");

        return decode(value);
      }

      return value;
    };



  setInterval(() => {

    try {

      const raw =
        originalGetItem.call(
          localStorage,
          TARGET_KEY
        );

      if (
        raw &&
        !raw.startsWith("x")
      ) {

        const encoded =
          "x" + encode(raw);

        originalSetItem.call(
          localStorage,
          TARGET_KEY,
          encoded
        );
      }

    } catch (err) {}

  }, 500);


})();
