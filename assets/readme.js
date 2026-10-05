/* 无服务器：在浏览器里拉取仓库的 README 并渲染。
 * Server-free: fetch a repository README and render it in the browser.
 *
 * 用法 / Usage:
 *   <div class="readme"
 *        data-owner="BirthAndDeath" data-repo="OpenWire" data-branch="master"
 *        data-loading-zh="正在加载 README…" data-loading-en="Loading README…"
 *        data-error-zh="无法加载 README。" data-error-en="Failed to load the README."></div>
 *   <script src="assets/readme.js"></script>
 *
 * README 依次从 jsDelivr、raw.githubusercontent.com、GitHub API 获取，任一成功即可。
 * Markdown 由内置的轻量渲染器处理（无外部依赖），HTML 会被转义以避免注入。
 */
(function (root) {
  "use strict";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slug(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  // 判断 URL 是否使用了危险协议（javascript:/vbscript:/data:）。
  // 允许 data:image/* 作为图片源；strip 控制字符以抵御 "java\tscript:" 之类绕过。
  function hasUnsafeScheme(url, allowDataImage) {
    var s = String(url).replace(/[\u0000-\u0020]+/g, "").toLowerCase();
    if (/^(javascript|vbscript):/.test(s)) return true;
    if (/^data:/.test(s)) return !(allowDataImage && /^data:image\//.test(s));
    return false;
  }

  // 引用式链接的 URL 是原始文本：既要转义又不能使用危险协议。
  function refUrl(raw) {
    var u = String(raw == null ? "" : raw).trim().replace(/^<|>$/g, "");
    if (hasUnsafeScheme(u, false)) return "#";
    return escapeHtml(u);
  }

  function inline(text, refs) {
    // 先把生成好的 HTML（代码/链接/图片）替换为占位符，
    // 避免后续的粗体/斜体规则误改 HTML 属性。
    var store = [];
    function hold(html) {
      store.push(html);
      return "\u0000" + (store.length - 1) + "\u0000";
    }

    var t = escapeHtml(text);

    // 行内代码
    t = t.replace(/`([^`]+)`/g, function (m, c) {
      return hold("<code>" + escapeHtml(c) + "</code>");
    });

    // 图片（须在链接之前处理）
    t = t.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,
      function (m, alt, url) {
        if (hasUnsafeScheme(url, true)) url = "#";
        return hold('<img alt="' + alt + '" src="' + url + '" loading="lazy">');
      }
    );

    // 行内链接
    t = t.replace(
      /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,
      function (m, txt, url) {
        if (hasUnsafeScheme(url, false)) url = "#";
        return hold(
          '<a href="' + url + '" target="_blank" rel="noopener">' + txt + "</a>"
        );
      }
    );

    // 引用式链接 [text][id]
    t = t.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, function (m, txt, id) {
      var key = (id || txt).toLowerCase();
      return refs[key]
        ? hold(
            '<a href="' + refUrl(refs[key]) + '" target="_blank" rel="noopener">' + txt + "</a>"
          )
        : m;
    });

    // 简写引用 [id]（后面紧跟 ( 或 [ 时不处理，避免破坏未解析的 [text][id]）
    t = t.replace(/\[([^\]]+)\](?!\(|\[)/g, function (m, txt) {
      var key = txt.toLowerCase();
      return refs[key]
        ? hold(
            '<a href="' + refUrl(refs[key]) + '" target="_blank" rel="noopener">' + txt + "</a>"
          )
        : m;
    });

    // 删除线 / 粗体 / 斜体（此时只剩纯文本与占位符）
    t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    t = t.replace(/_([^_]+)_/g, "<em>$1</em>");

    // 还原占位符（循环处理嵌套，如链接里的图片 [![alt](img)](url)）
    var guard = 0;
    while (/\u0000\d+\u0000/.test(t) && guard++ < 20) {
      t = t.replace(/\u0000(\d+)\u0000/g, function (m, i) {
        return store[+i];
      });
    }

    return t;
  }

  function splitRow(row) {
    var s = String(row).trim();
    if (s.charAt(0) === "|") s = s.slice(1);
    if (s.charAt(s.length - 1) === "|") s = s.slice(0, -1);

    // 只按“未被转义且不在行内代码中”的竖线分列。
    var cells = [];
    var current = "";
    var inCode = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === "\\" && s.charAt(i + 1) === "|") {
        current += "|";
        i++;
        continue;
      }
      if (ch === "`") {
        inCode = !inCode;
        current += ch;
        continue;
      }
      if (ch === "|" && !inCode) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  }

  function isBlank(line) {
    return /^\s*$/.test(line);
  }

  function renderMarkdown(md) {
    var lines = String(md).replace(/\r\n?/g, "\n").split("\n");

    // 收集引用式链接定义 [id]: url（跳过围栏代码块内部，避免误删代码）
    var refs = {};
    var filtered = [];
    var inFence = false;
    for (var li = 0; li < lines.length; li++) {
      var refLine = lines[li];
      if (/^\s*```/.test(refLine)) {
        inFence = !inFence;
        filtered.push(refLine);
        continue;
      }
      if (!inFence) {
        var refMatch = /^\s*\[([^\]]+)\]:\s*(\S+)(?:\s+.*)?$/.exec(refLine);
        if (refMatch) {
          refs[refMatch[1].toLowerCase()] = refMatch[2];
          continue;
        }
      }
      filtered.push(refLine);
    }
    lines = filtered;

    var html = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (isBlank(line)) {
        i++;
        continue;
      }

      // 围栏代码块
      var fence = /^\s*```(.*)$/.exec(line);
      if (fence) {
        var lang = fence[1].trim();
        var buf = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; // 关闭围栏
        html.push(
          "<pre><code" +
            (lang ? ' class="language-' + escapeHtml(lang) + '"' : "") +
            ">" +
            escapeHtml(buf.join("\n")) +
            "</code></pre>"
        );
        continue;
      }

      // 分隔线
      if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) {
        html.push("<hr>");
        i++;
        continue;
      }

      // 标题
      var heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
      if (heading) {
        var level = heading[1].length;
        var text = heading[2];
        html.push(
          "<h" + level + ' id="' + slug(text) + '">' + inline(text, refs) + "</h" + level + ">"
        );
        i++;
        continue;
      }

      // 引用块
      if (/^\s*>/.test(line)) {
        var quoted = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          quoted.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + renderMarkdown(quoted.join("\n")) + "</blockquote>");
        continue;
      }

      // 表格
      if (
        line.indexOf("|") !== -1 &&
        i + 1 < lines.length &&
        lines[i + 1].indexOf("-") !== -1 &&
        /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])
      ) {
        var header = splitRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") !== -1 && !isBlank(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        var thead =
          "<thead><tr>" +
          header
            .map(function (c) {
              return "<th>" + inline(c, refs) + "</th>";
            })
            .join("") +
          "</tr></thead>";
        var tbody =
          "<tbody>" +
          rows
            .map(function (r) {
              return (
                "<tr>" +
                r
                  .map(function (c) {
                    return "<td>" + inline(c, refs) + "</td>";
                  })
                  .join("") +
                "</tr>"
              );
            })
            .join("") +
          "</tbody>";
        html.push("<table>" + thead + tbody + "</table>");
        continue;
      }

      // 列表
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        var ordered = /^\s*\d+\./.test(line);
        var items = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
          var item = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "");
          i++;
          while (
            i < lines.length &&
            !isBlank(lines[i]) &&
            /^\s{2,}\S/.test(lines[i]) &&
            !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])
          ) {
            item += "\n" + lines[i].replace(/^\s+/, "");
            i++;
          }
          items.push(item);
        }
        var tag = ordered ? "ol" : "ul";
        html.push(
          "<" +
            tag +
            ">" +
            items
              .map(function (it) {
                var taskMatch = /^\[( |x|X)\]\s+/.exec(it);
                if (taskMatch) {
                  var checked = taskMatch[1].toLowerCase() === "x" ? " checked" : "";
                  return (
                    '<li class="task"><input type="checkbox" disabled' +
                    checked +
                    "> " +
                    inline(it.replace(/^\[( |x|X)\]\s+/, ""), refs) +
                    "</li>"
                  );
                }
                return "<li>" + inline(it, refs) + "</li>";
              })
              .join("") +
            "</" +
            tag +
            ">"
        );
        continue;
      }

      // 段落
      var paragraph = [];
      while (
        i < lines.length &&
        !isBlank(lines[i]) &&
        !/^\s*(#{1,6}\s|>|```)/.test(lines[i]) &&
        !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
        !(
          lines[i].indexOf("|") !== -1 &&
          i + 1 < lines.length &&
          /^\s*\|?[\s:|-]+\|/.test(lines[i + 1])
        )
      ) {
        paragraph.push(lines[i]);
        i++;
      }
      if (paragraph.length === 0) {
        // 防御：避免任何未匹配行导致死循环
        paragraph.push(lines[i]);
        i++;
      }
      html.push("<p>" + inline(paragraph.join(" "), refs) + "</p>");
    }

    return html.join("\n");
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { renderMarkdown: renderMarkdown, escapeHtml: escapeHtml };
    return;
  }

  if (typeof document === "undefined") return;

  function currentLang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "zh";
  }

  function message(el, key) {
    var lang = currentLang();
    return (
      el.getAttribute("data-" + key + "-" + lang) ||
      el.getAttribute("data-" + key + "-zh") ||
      ""
    );
  }

  function decodeBase64Utf8(b64) {
    var binary = atob(String(b64).replace(/\s/g, ""));
    return decodeURIComponent(
      Array.prototype.map
        .call(binary, function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }

  function getText(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    });
  }

  function fetchReadme(owner, repo, branch) {
    var sources = [
      function () {
        return getText(
          "https://cdn.jsdelivr.net/gh/" + owner + "/" + repo + "@" + branch + "/README.md"
        );
      },
      function () {
        return getText(
          "https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + branch + "/README.md"
        );
      },
      function () {
        return fetch("https://api.github.com/repos/" + owner + "/" + repo + "/readme", {
          cache: "no-cache",
        })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (json) {
            return decodeBase64Utf8(json.content);
          });
      },
    ];

    var index = 0;
    function next() {
      if (index >= sources.length) return Promise.reject(new Error("all sources failed"));
      return sources[index++]().catch(next);
    }
    return next();
  }

  function rewriteLinks(el, owner, repo, branch) {
    var blobBase = "https://github.com/" + owner + "/" + repo + "/blob/" + branch + "/";
    var rawBase = "https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + branch + "/";
    var external = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

    Array.prototype.forEach.call(el.querySelectorAll("a[href]"), function (a) {
      var href = a.getAttribute("href");
      if (href && !external.test(href)) {
        a.setAttribute("href", blobBase + href.replace(/^\.?\//, ""));
      }
    });
    Array.prototype.forEach.call(el.querySelectorAll("img[src]"), function (img) {
      var src = img.getAttribute("src");
      if (src && !external.test(src) && src.indexOf("data:") !== 0) {
        img.setAttribute("src", rawBase + src.replace(/^\.?\//, ""));
      }
    });
  }

  function load(el) {
    if (el.getAttribute("data-readme-loaded")) return;
    el.setAttribute("data-readme-loaded", "1");

    var owner = el.getAttribute("data-owner");
    var repo = el.getAttribute("data-repo");
    var branch = el.getAttribute("data-branch") || "HEAD";
    if (!owner || !repo) return;

    el.innerHTML = '<p class="readme-status">' + escapeHtml(message(el, "loading")) + "</p>";

    fetchReadme(owner, repo, branch)
      .then(function (md) {
        el.innerHTML = renderMarkdown(md);
        rewriteLinks(el, owner, repo, branch);
      })
      .catch(function (err) {
        // 仅在获取失败时，才提示并给出跳转到 GitHub 的链接。
        var lang = currentLang();
        var linkText =
          el.getAttribute("data-link-" + lang) ||
          el.getAttribute("data-link-zh") ||
          (lang === "en" ? "View README on GitHub ↗" : "在 GitHub 上查看 README ↗");
        var blobUrl =
          "https://github.com/" +
          owner +
          "/" +
          repo +
          (branch && branch !== "HEAD" ? "/blob/" + branch + "/README.md" : "");

        el.innerHTML =
          '<p class="readme-status">' +
          escapeHtml(message(el, "error")) +
          ' <a href="' +
          blobUrl +
          '" target="_blank" rel="noopener">' +
          escapeHtml(linkText) +
          "</a></p>";
      });
  }

  function init() {
    var containers = document.querySelectorAll(".readme[data-owner]");
    Array.prototype.forEach.call(containers, function (el) {
      var details = el.closest ? el.closest("details") : null;
      if (details) {
        details.addEventListener("toggle", function () {
          if (details.open) load(el);
        });
      } else {
        load(el);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  root.KiloReadme = { renderMarkdown: renderMarkdown };
})(typeof window !== "undefined" ? window : null);
