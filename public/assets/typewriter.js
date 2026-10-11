/* 首页标题打字机效果。
 * - 支持中英切换：i18n 应用后重新打字。
 * - 尊重 prefers-reduced-motion：直接显示完整文本。
 * Home hero typewriter; re-runs on language change; honors reduced motion. */
(function () {
  var h1 = document.querySelector("[data-typewriter]");
  if (!h1) return;

  var spans = Array.prototype.slice.call(h1.querySelectorAll(".js-type"));
  if (spans.length < 2) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var timer = null;
  var caret = null;
  var applied = false;

  // 记录要打出的完整文本：
  // - 第一段带 data-i18n，i18n 每次都会先写入完整文本，直接读取即可；
  // - 第二段（名字）静态，只记录一次，避免打字中途被打断时读到半截。
  function capture() {
    var greeting = spans[0];
    var name = spans[1];
    greeting.dataset.full = greeting.textContent;
    if (!name.dataset.full) name.dataset.full = name.textContent;
    h1.setAttribute("aria-label", greeting.dataset.full + " " + name.dataset.full);
  }

  function ensureCaret() {
    if (!caret) {
      caret = document.createElement("span");
      caret.className = "type-caret";
      caret.setAttribute("aria-hidden", "true");
      h1.appendChild(caret);
    }
  }

  function removeCaret() {
    if (caret && caret.parentNode) caret.parentNode.removeChild(caret);
    caret = null;
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    var texts = spans.map(function (s) {
      return s.dataset.full || s.textContent;
    });

    if (reduce) {
      removeCaret();
      spans.forEach(function (s, i) {
        s.textContent = texts[i];
      });
      return;
    }

    spans.forEach(function (s) {
      s.textContent = "";
    });
    ensureCaret();

    var si = 0;
    var ci = 0;

    function finish() {
      timer = null;
      if (caret) {
        caret.classList.add("type-caret-done");
        setTimeout(function () {
          if (caret && caret.classList.contains("type-caret-done")) removeCaret();
        }, 900);
      }
    }

    function step() {
      if (si >= spans.length) {
        finish();
        return;
      }
      var full = texts[si];
      if (ci < full.length) {
        spans[si].textContent = full.slice(0, ci + 1);
        ci++;
      } else {
        si++;
        ci = 0;
      }
      timer = setTimeout(step, 65);
    }

    step();
  }

  document.addEventListener("i18n:applied", function () {
    applied = true;
    capture();
    start();
  });

  function init() {
    if (applied) return;
    capture();
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
