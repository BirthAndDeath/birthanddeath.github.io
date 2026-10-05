/* 无服务器、纯前端的简单 i18n。
 * Simple client-side i18n: no server, no fetch, works from file://.
 * 用法 / Usage: 给元素加 data-i18n="key"，脚本会替换其文本。 */
(function () {
  var STORAGE_KEY = "site-lang";
  var SUPPORTED = ["zh", "en"];
  var FALLBACK_LANG = "en";
  var NATIVE_NAMES = { zh: "中文", en: "English" };

  var DICT = {
    zh: {
      "nav.projects": "项目",
      "footer.all": "← 所有项目",
      "footer.built": "静态站点 · 由 GitHub Pages 托管",
      "back": "← 返回项目列表",

      "home.hello": "你好，我是",
      "home.sub": "这里收录我开发的开源项目：从 WebAssembly 安全沙箱、后量子加密的 P2P 聊天，到自学文档站点。",
      "home.browse": "浏览项目",
      "home.github": "GitHub 主页 ↗",
      "home.projects": "项目",
      "home.count": "共 4 个",
      "home.details": "详情 →",
      "home.gh": "GitHub ↗",
      "home.visit": "访问站点 ↗",

      "status.early": "早期开发",
      "status.dev": "开发中",
      "status.liveDev": "在线 · 开发中",
      "status.site": "本站",

      "card.whitebox.desc": "透明、基于能力的 WebAssembly 应用沙箱，细粒度控制文件系统访问，并支持完全回滚。",
      "card.openwire.desc": "跨平台 P2P 聊天应用，采用后量子端到端加密，基于 libp2p 与 Tauri 2。",
      "card.selflearning.desc": "面向自主学习的多语言文档站点，使用 Astro + Starlight 构建。",
      "card.website.desc": "你正在浏览的个人网站，集中介绍与索引上述所有项目。",

      "panel.highlights": "亮点",
      "panel.docs": "完整文档",
      "btn.repo": "GitHub 仓库 ↗",

      "wb.lead": "一个透明、基于能力（capability）的 WebAssembly 应用沙箱。为用户提供对文件系统访问的细粒度控制，并允许完全回滚任何更改——让每个应用都变成临时的、可审计的环境。",
      "wb.note": "状态：核心执行引擎与进程隔离框架已就绪，GUI 和大部分沙箱能力仍在开发中。",
      "wb.h1": "透明沙箱 — 每个应用都在可检查的隔离环境中运行，而非黑盒。",
      "wb.h2": "基于能力的文件系统访问 — 只授予应用所需的精确访问权限。",
      "wb.h3": "完全回滚 — 沙箱内任何更改都可丢弃，应用像临时环境一样运行。",
      "wb.h4": "基于 Wasmtime + WASI，独立 worker 进程隔离执行，跨平台设计。",
      "wb.docs": "以下内容来自仓库的 GitHub README。",

      "ow.lead": "一个跨平台 P2P 聊天应用，采用后量子端到端加密。基于 libp2p 构建 P2P 网络，桌面端使用 Tauri 2 + SvelteKit，并提供 ratatui 终端界面。",
      "ow.note": "仅供演示，生产自负，未经审计。",
      "ow.h1": "后量子 E2EE — ML-DSA-65 + ML-KEM-768 + AES-GCM。",
      "ow.h2": "P2P 网络与 NAT 穿透 — libp2p（QUIC / TCP / WebSocket / mDNS / Kademlia DHT），以及 Circuit Relay v2、DCUtR、AutoNAT。",
      "ow.h3": "文件传输 — 分片流式、断点续传、完整性校验；离线队列在联系人上线后自动重试。",
      "ow.h4": "多端形态 — ratatui TUI / JSON CLI，以及 Tauri 2 + SvelteKit 桌面端，跨 Windows / macOS / Linux。",
      "ow.docs": "以下内容来自仓库的 GitHub README。",

      "sl.lead": "一个面向自主学习的多语言文档站点，使用 Astro + Starlight 构建，使用 MDX 编写内容，支持英文与简体中文。",
      "sl.h1": "基于 Astro + Starlight 的内容驱动文档站。",
      "sl.h2": "多语言 — 英文（en）与简体中文（zh-cn）。",
      "sl.h3": "使用 MDX 编写内容，支持 Starlight 组件与标准 Markdown。",
      "sl.h4": "公有领域（CC0-1.0），欢迎贡献。",
      "sl.docs": "以下内容来自仓库的 GitHub README。",

      "ws.lead": "这是你正在浏览的个人网站。它集中介绍并索引我的所有开源项目，每个项目都有独立的介绍页面。",
      "ws.h1": "首页 — 项目卡片总览与个人简介。",
      "ws.h2": "项目页 — 每个项目一个页面，在构建时抓取并内联渲染该仓库的 README。",
      "ws.h3": "中英双语 — 可在页面右上角一键切换。",
      "ws.t1": "静态站点：构建时抓取 README 并渲染为 HTML，再由 GitHub Actions 部署到 GitHub Pages。",
      "ws.t2": "共享样式表位于 public/assets/style.css，支持深色 / 浅色配色。",
      "ws.t3": "新增项目：在 src/lib/projects.mjs 中登记，并在 src/pages/<项目名>/ 新建页面。",
      "ws.contents": "站点内容",
      "ws.indexed": "收录的项目",
      "ws.notes": "技术说明",
      "ws.col.project": "项目",
      "ws.col.summary": "简介",
      "ws.row.whitebox": "透明、基于能力的 WebAssembly 应用沙箱",
      "ws.row.openwire": "后量子加密的跨平台 P2P 聊天应用",
      "ws.row.selflearning": "多语言自学文档站点",
      "ws.repo": "GitHub 仓库 ↗",
      "ws.home": "访问首页 ↗"
    },
    en: {
      "nav.projects": "Projects",
      "footer.all": "← All projects",
      "footer.built": "Static site · Hosted on GitHub Pages",
      "back": "← Back to projects",

      "home.hello": "Hi, I'm",
      "home.sub": "Open-source projects I build — from a WebAssembly sandbox and post-quantum P2P chat to a self-learning docs site.",
      "home.browse": "Browse projects",
      "home.github": "GitHub profile ↗",
      "home.projects": "Projects",
      "home.count": "4 total",
      "home.details": "Details →",
      "home.gh": "GitHub ↗",
      "home.visit": "Visit site ↗",

      "status.early": "Early development",
      "status.dev": "Developing",
      "status.liveDev": "Live · Developing",
      "status.site": "This site",

      "card.whitebox.desc": "A transparent, capability-based WebAssembly sandbox with fine-grained filesystem control and full rollback.",
      "card.openwire.desc": "A cross-platform P2P chat app with post-quantum end-to-end encryption, built on libp2p and Tauri 2.",
      "card.selflearning.desc": "A multilingual documentation site for self-directed learning, built with Astro + Starlight.",
      "card.website.desc": "The personal website you are viewing now — a hub that introduces and indexes all projects above.",

      "panel.highlights": "Highlights",
      "panel.docs": "Full documentation",
      "btn.repo": "GitHub repository ↗",

      "wb.lead": "A transparent, capability-based sandbox for WebAssembly applications. It gives users fine-grained control over filesystem access and allows full rollback of any changes — turning every app into a temporary, auditable environment.",
      "wb.note": "Status: the core execution engine and process isolation scaffolding exist, but the GUI and most sandbox capabilities are still in development.",
      "wb.h1": "Transparent sandboxing — every app runs in an inspectable isolated environment, not a black box.",
      "wb.h2": "Capability-based filesystem access — grant only the exact access an app needs.",
      "wb.h3": "Full rollback — discard any change made inside the sandbox, so apps behave like temporary environments.",
      "wb.h4": "Built on Wasmtime + WASI with isolated worker processes and a cross-platform design.",
      "wb.docs": "The content below is from the repository's GitHub README.",

      "ow.lead": "A cross-platform P2P chat app with post-quantum end-to-end encryption. It builds its P2P network on libp2p, uses Tauri 2 + SvelteKit on desktop, and ships a ratatui terminal UI.",
      "ow.note": "Demo only — use at your own risk. Not audited.",
      "ow.h1": "Post-quantum E2EE — ML-DSA-65 + ML-KEM-768 + AES-GCM.",
      "ow.h2": "P2P networking and NAT traversal — libp2p (QUIC / TCP / WebSocket / mDNS / Kademlia DHT) plus Circuit Relay v2, DCUtR and AutoNAT.",
      "ow.h3": "File transfer — chunked streaming, resume and integrity checks; an offline queue retries when a contact comes online.",
      "ow.h4": "Multiple front ends — ratatui TUI / JSON CLI and a Tauri 2 + SvelteKit desktop app, across Windows / macOS / Linux.",
      "ow.docs": "The content below is from the repository's GitHub README.",

      "sl.lead": "A multilingual documentation site for self-directed learning, built with Astro + Starlight and authored in MDX, with English and Simplified Chinese.",
      "sl.h1": "A content-driven docs site built with Astro + Starlight.",
      "sl.h2": "Multilingual — English (en) and Simplified Chinese (zh-cn).",
      "sl.h3": "Content authored in MDX, with Starlight components and standard Markdown.",
      "sl.h4": "Public domain (CC0-1.0); contributions welcome.",
      "sl.docs": "The content below is from the repository's GitHub README.",

      "ws.lead": "This is the personal website you are viewing. It introduces and indexes all of my open-source projects, each with its own page.",
      "ws.h1": "Home — an overview of project cards and a short intro.",
      "ws.h2": "Project pages — one page per project that fetches and inlines the repository README at build time.",
      "ws.h3": "Bilingual — switch between Chinese and English from the top-right corner.",
      "ws.t1": "Static site — READMEs are fetched and rendered to HTML at build time, then deployed to GitHub Pages via GitHub Actions.",
      "ws.t2": "Shared stylesheet at public/assets/style.css with dark / light color schemes.",
      "ws.t3": "To add a project: register it in src/lib/projects.mjs and add a page under src/pages/<slug>/.",
      "ws.contents": "Contents",
      "ws.indexed": "Indexed projects",
      "ws.notes": "Technical notes",
      "ws.col.project": "Project",
      "ws.col.summary": "Summary",
      "ws.row.whitebox": "A transparent, capability-based WebAssembly sandbox",
      "ws.row.openwire": "A cross-platform P2P chat app with post-quantum encryption",
      "ws.row.selflearning": "A multilingual self-learning docs site",
      "ws.repo": "GitHub repository ↗",
      "ws.home": "Visit homepage ↗"
    }
  };

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* file:// or privacy mode may block storage; ignore. */
    }
  }

  /* 把任意标签（如 "zh-CN"、"en-US"）规整为受支持的语言代码。 */
  function normalize(tag) {
    if (!tag) return null;
    var lower = String(tag).toLowerCase();
    for (var i = 0; i < SUPPORTED.length; i++) {
      var code = SUPPORTED[i];
      if (lower === code || lower.indexOf(code + "-") === 0) return code;
    }
    return null;
  }

  /* 优先已保存的选择，其次浏览器语言偏好，最后回落英文。 */
  function detectLang() {
    var stored = normalize(getStored());
    if (stored) return stored;
    var prefs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage];
    for (var i = 0; i < prefs.length; i++) {
      var match = normalize(prefs[i]);
      if (match) return match;
    }
    return FALLBACK_LANG;
  }

  function translate(lang, key) {
    var table = DICT[lang] || DICT[FALLBACK_LANG];
    return table[key] != null ? table[key] : null;
  }

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = FALLBACK_LANG;
    var root = document.documentElement;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "zh" ? "zh-CN" : lang);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var value = translate(lang, nodes[i].getAttribute("data-i18n"));
      if (value != null) nodes[i].textContent = value;
    }

    var select = document.getElementById("langSelect");
    if (select) select.value = lang;
  }

  function init() {
    var select = document.getElementById("langSelect");
    if (select) {
      if (!select.options.length) {
        for (var i = 0; i < SUPPORTED.length; i++) {
          var option = document.createElement("option");
          option.value = SUPPORTED[i];
          option.textContent = NATIVE_NAMES[SUPPORTED[i]] || SUPPORTED[i];
          select.appendChild(option);
        }
      }
      select.addEventListener("change", function () {
        setStored(select.value);
        apply(select.value);
      });
    }
    apply(detectLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
