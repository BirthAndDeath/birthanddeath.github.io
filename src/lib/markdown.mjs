// 轻量 Markdown 渲染器（构建时使用，无外部依赖）。
// Lightweight Markdown renderer used at build time; no external dependencies.
// 生成的 HTML 会对内容转义，并过滤危险协议，避免注入。

export function escapeHtml(s) {
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

// 危险协议检测：拒绝 javascript:/vbscript:/data:（允许 data:image/* 作图片源）。
function hasUnsafeScheme(url, allowDataImage) {
  const s = String(url).replace(/[\u0000-\u0020]+/g, "").toLowerCase();
  if (/^(javascript|vbscript):/.test(s)) return true;
  if (/^data:/.test(s)) return !(allowDataImage && /^data:image\//.test(s));
  return false;
}

function refUrl(raw) {
  const u = String(raw == null ? "" : raw).trim().replace(/^<|>$/g, "");
  if (hasUnsafeScheme(u, false)) return "#";
  return escapeHtml(u);
}

function inline(text, refs) {
  const store = [];
  const hold = (html) => {
    store.push(html);
    return "\u0000" + (store.length - 1) + "\u0000";
  };

  let t = escapeHtml(text);

  // 行内代码
  t = t.replace(/`([^`]+)`/g, (m, c) => hold("<code>" + escapeHtml(c) + "</code>"));

  // 图片（须在链接之前）
  t = t.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,
    (m, alt, url) => {
      if (hasUnsafeScheme(url, true)) url = "#";
      return hold('<img alt="' + alt + '" src="' + url + '" loading="lazy">');
    }
  );

  // 行内链接
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,
    (m, txt, url) => {
      if (hasUnsafeScheme(url, false)) url = "#";
      return hold('<a href="' + url + '" target="_blank" rel="noopener">' + txt + "</a>");
    }
  );

  // 引用式链接 [text][id]
  t = t.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (m, txt, id) => {
    const key = (id || txt).toLowerCase();
    return refs[key]
      ? hold('<a href="' + refUrl(refs[key]) + '" target="_blank" rel="noopener">' + txt + "</a>")
      : m;
  });

  // 简写引用 [id]（后面紧跟 ( 或 [ 时不处理）
  t = t.replace(/\[([^\]]+)\](?!\(|\[)/g, (m, txt) => {
    const key = txt.toLowerCase();
    return refs[key]
      ? hold('<a href="' + refUrl(refs[key]) + '" target="_blank" rel="noopener">' + txt + "</a>")
      : m;
  });

  // 删除线 / 粗体 / 斜体
  t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  t = t.replace(/_([^_]+)_/g, "<em>$1</em>");

  // 还原占位符（循环处理嵌套，如链接里的图片）
  let guard = 0;
  while (/\u0000\d+\u0000/.test(t) && guard++ < 20) {
    t = t.replace(/\u0000(\d+)\u0000/g, (m, i) => store[+i]);
  }

  return t;
}

function splitRow(row) {
  let s = String(row).trim();
  if (s.charAt(0) === "|") s = s.slice(1);
  if (s.charAt(s.length - 1) === "|") s = s.slice(0, -1);

  const cells = [];
  let current = "";
  let inCode = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
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

const isBlank = (line) => /^\s*$/.test(line);

export function renderMarkdown(md) {
  let lines = String(md).replace(/\r\n?/g, "\n").split("\n");

  // 收集引用式链接定义（跳过围栏代码块内部）
  const refs = {};
  const filtered = [];
  let inFence = false;
  for (const refLine of lines) {
    if (/^\s*```/.test(refLine)) {
      inFence = !inFence;
      filtered.push(refLine);
      continue;
    }
    if (!inFence) {
      const m = /^\s*\[([^\]]+)\]:\s*(\S+)(?:\s+.*)?$/.exec(refLine);
      if (m) {
        refs[m[1].toLowerCase()] = m[2];
        continue;
      }
    }
    filtered.push(refLine);
  }
  lines = filtered;

  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i++;
      continue;
    }

    // 围栏代码块
    const fence = /^\s*```(.*)$/.exec(line);
    if (fence) {
      const lang = fence[1].trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
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
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      html.push(
        "<h" + level + ' id="' + slug(text) + '">' + inline(text, refs) + "</h" + level + ">"
      );
      i++;
      continue;
    }

    // 引用块
    if (/^\s*>/.test(line)) {
      const quoted = [];
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
      const header = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].indexOf("|") !== -1 && !isBlank(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead =
        "<thead><tr>" +
        header.map((c) => "<th>" + inline(c, refs) + "</th>").join("") +
        "</tr></thead>";
      const tbody =
        "<tbody>" +
        rows
          .map(
            (r) =>
              "<tr>" + r.map((c) => "<td>" + inline(c, refs) + "</td>").join("") + "</tr>"
          )
          .join("") +
        "</tbody>";
      html.push("<table>" + thead + tbody + "</table>");
      continue;
    }

    // 列表
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "");
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
      const tag = ordered ? "ol" : "ul";
      html.push(
        "<" +
          tag +
          ">" +
          items
            .map((it) => {
              const taskMatch = /^\[( |x|X)\]\s+/.exec(it);
              if (taskMatch) {
                const checked = taskMatch[1].toLowerCase() === "x" ? " checked" : "";
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
    const paragraph = [];
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
      paragraph.push(lines[i]);
      i++;
    }
    html.push("<p>" + inline(paragraph.join(" "), refs) + "</p>");
  }

  return html.join("\n");
}

// 将 README 中的相对链接/图片改写为 GitHub 绝对地址。
export function rewriteRelativeUrls(html, { owner, repo, branch }) {
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  const external = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

  return html.replace(/(href|src)="([^"]*)"/g, (m, attr, url) => {
    if (!url || external.test(url) || url.startsWith("data:")) return m;
    const base = attr === "href" ? blobBase : rawBase;
    return `${attr}="${base}${url.replace(/^\.?\//, "")}"`;
  });
}
