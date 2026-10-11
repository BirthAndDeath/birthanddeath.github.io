import path from "node:path";
import { readFile } from "node:fs/promises";
import { domainToUnicode } from "node:url";
import { renderMarkdown, rewriteRelativeUrls } from "./markdown.mjs";

// 缓存目录基于项目根目录解析（构建时 cwd 为项目根），
// 比 import.meta.url 更可靠——后者在打包后可能指向别的路径。
const DATA_DIR = path.join(process.cwd(), "src", "data");

export const OWNER = "BirthAndDeath";
export const SITE = "https://birthanddeath.github.io";

export const projects = [
  {
    slug: "whitebox-forge",
    name: "WhiteBox-Forge",
    repo: "WhiteBox-Forge",
    branch: "main",
    title: "WhiteBox-Forge · 透明 WebAssembly 沙箱",
    description:
      "WhiteBox-Forge：透明、基于能力的 WebAssembly 应用沙箱，提供细粒度文件系统访问控制与完全回滚。完整文档见 GitHub README。",
    status: { key: "status.early", cls: "dev", zh: "早期开发" },
    tags: ["Rust", "Wasmtime", "WASI", "Slint", "Apache-2.0"],
    lead: {
      key: "wb.lead",
      zh: "一个透明、基于能力（capability）的 WebAssembly 应用沙箱。为用户提供对文件系统访问的细粒度控制，并允许完全回滚任何更改——让每个应用都变成临时的、可审计的环境。",
    },
    highlights: [
      { key: "wb.h1", zh: "透明沙箱 — 每个应用都在可检查的隔离环境中运行，而非黑盒。" },
      { key: "wb.h2", zh: "基于能力的文件系统访问 — 只授予应用所需的精确访问权限。" },
      { key: "wb.h3", zh: "完全回滚 — 沙箱内任何更改都可丢弃，应用像临时环境一样运行。" },
      { key: "wb.h4", zh: "基于 Wasmtime + WASI，独立 worker 进程隔离执行，跨平台设计。" },
    ],
    docs: { key: "wb.docs", zh: "以下内容来自仓库的 GitHub README。" },
    note: {
      key: "wb.note",
      zh: "状态：核心执行引擎与进程隔离框架已就绪，GUI 和大部分沙箱能力仍在开发中。",
    },
    repoUrl: "https://github.com/BirthAndDeath/WhiteBox-Forge",
    language: "Rust",
    license: "Apache-2.0",
    links: [
      {
        href: "https://github.com/BirthAndDeath/WhiteBox-Forge",
        key: "btn.repo",
        zh: "GitHub 仓库 ↗",
        cls: "primary",
      },
    ],
    extraLinks: [
      {
        href: "https://github.com/BirthAndDeath/WhiteBox-Forge/blob/main/CONTRIBUTING.md",
        label: "CONTRIBUTING ↗",
      },
    ],
    card: {
      key: "card.whitebox.desc",
      zh: "透明、基于能力的 WebAssembly 应用沙箱，细粒度控制文件系统访问，并支持完全回滚。",
    },
    cardLink: {
      href: "https://github.com/BirthAndDeath/WhiteBox-Forge",
      key: "home.gh",
      zh: "GitHub ↗",
    },
  },
  {
    slug: "openwire",
    name: "OpenWire",
    repo: "OpenWire",
    branch: "master",
    title: "OpenWire · 后量子加密的 P2P 聊天",
    description:
      "OpenWire：跨平台 P2P 聊天应用，采用后量子端到端加密（ML-DSA-65 + ML-KEM-768 + AES-GCM），基于 libp2p 与 Tauri 2。完整文档见 GitHub README。",
    status: { key: "status.dev", cls: "wip", zh: "开发中" },
    tags: ["Rust", "libp2p", "Tauri 2", "SvelteKit", "AGPL-3.0"],
    lead: {
      key: "ow.lead",
      zh: "一个跨平台 P2P 聊天应用，采用后量子端到端加密。基于 libp2p 构建 P2P 网络，桌面端使用 Tauri 2 + SvelteKit，并提供 ratatui 终端界面。",
    },
    highlights: [
      { key: "ow.h1", zh: "后量子 E2EE — ML-DSA-65 + ML-KEM-768 + AES-GCM。" },
      {
        key: "ow.h2",
        zh: "P2P 网络与 NAT 穿透 — libp2p（QUIC / TCP / WebSocket / mDNS / Kademlia DHT），以及 Circuit Relay v2、DCUtR、AutoNAT。",
      },
      {
        key: "ow.h3",
        zh: "文件传输 — 分片流式、断点续传、完整性校验；离线队列在联系人上线后自动重试。",
      },
      {
        key: "ow.h4",
        zh: "多端形态 — ratatui TUI / JSON CLI，以及 Tauri 2 + SvelteKit 桌面端，跨 Windows / macOS / Linux。",
      },
    ],
    docs: { key: "ow.docs", zh: "以下内容来自仓库的 GitHub README。" },
    note: { key: "ow.note", zh: "仅供演示，生产自负，未经审计。" },
    repoUrl: "https://github.com/BirthAndDeath/OpenWire",
    language: "Rust",
    license: "AGPL-3.0",
    links: [
      {
        href: "https://github.com/BirthAndDeath/OpenWire",
        key: "btn.repo",
        zh: "GitHub 仓库 ↗",
        cls: "primary",
      },
    ],
    extraLinks: [
      { href: "https://space.bilibili.com/3494362084280927/", label: "Bilibili ↗" },
    ],
    card: {
      key: "card.openwire.desc",
      zh: "跨平台 P2P 聊天应用，采用后量子端到端加密，基于 libp2p 与 Tauri 2。",
    },
    cardLink: {
      href: "https://github.com/BirthAndDeath/OpenWire",
      key: "home.gh",
      zh: "GitHub ↗",
    },
  },
  {
    slug: "selflearning-pages",
    name: "selflearning-pages",
    repo: "selflearning-pages",
    branch: "main",
    title: "selflearning-pages · 多语言自学文档站点",
    description:
      "selflearning-pages：面向自主学习的多语言文档站点，使用 Astro + Starlight 构建，支持英文与简体中文。完整文档见 GitHub README。",
    status: { key: "status.liveDev", cls: "active", zh: "在线 · 开发中" },
    tags: ["Astro", "Starlight", "MDX", "TypeScript", "CC0-1.0"],
    lead: {
      key: "sl.lead",
      zh: "一个面向自主学习的多语言文档站点，使用 Astro + Starlight 构建，使用 MDX 编写内容，支持英文与简体中文。",
    },
    highlights: [
      { key: "sl.h1", zh: "基于 Astro + Starlight 的内容驱动文档站。" },
      { key: "sl.h2", zh: "多语言 — 英文（en）与简体中文（zh-cn）。" },
      { key: "sl.h3", zh: "使用 MDX 编写内容，支持 Starlight 组件与标准 Markdown。" },
      { key: "sl.h4", zh: "公有领域（CC0-1.0），欢迎贡献。" },
    ],
    docs: { key: "sl.docs", zh: "以下内容来自仓库的 GitHub README。" },
    repoUrl: "https://github.com/BirthAndDeath/selflearning-pages",
    liveUrl: "https://selflearning-pages.pages.dev/",
    language: "Astro",
    license: "CC0-1.0",
    links: [
      {
        href: "https://selflearning-pages.pages.dev/",
        key: "home.visit",
        zh: "访问站点 ↗",
        cls: "primary",
      },
    ],
    extraLinks: [
      {
        href: "https://github.com/BirthAndDeath/selflearning-pages",
        key: "btn.repo",
        zh: "GitHub 仓库 ↗",
      },
    ],
    card: {
      key: "card.selflearning.desc",
      zh: "面向自主学习的多语言文档站点，使用 Astro + Starlight 构建。",
    },
    cardLink: {
      href: "https://selflearning-pages.pages.dev/",
      key: "home.visit",
      zh: "访问站点 ↗",
    },
  },
  {
    slug: "is_gay",
    name: "is_gay",
    repo: "is_gay",
    branch: "main",
    readme: false,
    title: "is_gay · 恶搞小网页",
    description: "is_gay：一个恶搞用的小网页项目（HTML），已部署上线。",
    status: { key: "status.live", cls: "active", zh: "在线" },
    tags: ["HTML", "Netlify", "Apache-2.0"],
    lead: {
      key: "ig.lead",
      zh: "一个恶搞用的小网页，部署在 Netlify 上（点开的人.是.gay），可直接在浏览器打开。",
    },
    highlights: [
      { key: "ig.h1", zh: "恶搞用的小网页（纯 HTML）。" },
      { key: "ig.h2", zh: "已部署上线：可在浏览器直接访问。" },
      { key: "ig.h3", zh: "基于 Apache-2.0 开源。" },
    ],
    note: { key: "ig.note", zh: "仅为娱乐用途。" },
    repoUrl: "https://github.com/BirthAndDeath/is_gay",
    liveUrl: "https://点开的人.是.gay",
    language: "HTML",
    license: "Apache-2.0",
    links: [
      {
        href: "https://点开的人.是.gay",
        key: "home.visit",
        zh: "访问站点 ↗",
        cls: "primary",
      },
    ],
    extraLinks: [
      {
        href: "https://github.com/BirthAndDeath/is_gay",
        key: "btn.repo",
        zh: "GitHub 仓库 ↗",
      },
    ],
    card: {
      key: "card.isgay.desc",
      zh: "恶搞用的小网页项目（HTML），已部署上线。",
    },
    cardLink: {
      href: "https://点开的人.是.gay",
      key: "home.visit",
      zh: "访问站点 ↗",
    },
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Birth_And_Death",
    alternateName: "BirthAndDeath",
    url: SITE,
    sameAs: ["https://github.com/BirthAndDeath"],
    knowsAbout: [
      "WebAssembly",
      "Rust",
      "P2P networking",
      "Post-quantum cryptography",
      "Sandboxing",
    ],
  };
}

export function projectJsonLd(project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.description,
    codeRepository: project.repoUrl,
    programmingLanguage: project.language,
    license: project.license,
    author: { "@type": "Person", name: "Birth_And_Death", url: SITE },
    url: new URL(`/${project.slug}/`, SITE).href,
  };
}

async function fetchText(url, headers, signal) {
  const res = await fetch(url, { headers, signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

function withTimeout(url, headers, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetchText(url, headers, controller.signal).finally(() => clearTimeout(timer));
}

// 依次尝试：GitHub API → jsDelivr → raw.githubusercontent，每个来源重试一次。
// Try: GitHub API → jsDelivr → raw.githubusercontent, with one retry per source.
function readmeSources(repo, branch) {
  return [
    () =>
      withTimeout(`https://api.github.com/repos/${OWNER}/${repo}/readme`, {
        Accept: "application/vnd.github.raw",
        "User-Agent": "birthanddeath-site-build",
      }),
    () => withTimeout(`https://cdn.jsdelivr.net/gh/${OWNER}/${repo}@${branch}/README.md`),
    () => withTimeout(`https://raw.githubusercontent.com/${OWNER}/${repo}/${branch}/README.md`),
  ];
}

async function readmeText({ slug, repo, branch }) {
  let lastError;
  for (const source of readmeSources(repo, branch)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await source();
      } catch (error) {
        lastError = error;
      }
    }
  }
  // 网络全部失败时，回退到本地缓存的 README（若存在）。
  try {
    return await readFile(path.join(DATA_DIR, "readmes", `${slug}.md`), "utf8");
  } catch {
    /* no cache */
  }
  throw lastError || new Error("README fetch failed");
}

const readmeCache = new Map();

// 返回渲染后的 README HTML；失败时返回空字符串（页面会显示回退链接）。
export function getReadmeHtml(project) {
  if (readmeCache.has(project.slug)) return readmeCache.get(project.slug);

  const promise = (async () => {
    try {
      const md = await readmeText(project);
      const html = renderMarkdown(md);
      return rewriteRelativeUrls(html, {
        owner: OWNER,
        repo: project.repo,
        branch: project.branch,
      });
    } catch {
      return "";
    }
  })();

  readmeCache.set(project.slug, promise);
  return promise;
}

async function fetchJson(url, headers, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// 把可能含 punycode 主机的 URL 转成可读的 Unicode 形式（保持可点击）。
function unicodeUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    const host = domainToUnicode(u.hostname);
    const rest = (u.pathname === "/" ? "" : u.pathname) + u.search + u.hash;
    return `${u.protocol}//${host}${rest}`;
  } catch {
    return url;
  }
}

function fallbackMeta(project) {  return {
    stars: null,
    forks: null,
    openIssues: null,
    pushedAt: null,
    license: project.license || null,
    defaultBranch: project.branch || null,
    homepage: project.liveUrl || null,
    topics: [],
    archived: false,
    latestTag: null,
  };
}

async function fetchRepoMeta(project) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "birthanddeath-site-build",
  };
  const base = `https://api.github.com/repos/${OWNER}/${project.repo}`;
  const data = await fetchJson(base, headers, 6000);

  let latestTag = null;
  try {
    const release = await fetchJson(`${base}/releases/latest`, headers, 5000);
    latestTag = release.tag_name || release.name || null;
  } catch {
    /* no release */
  }

  return {
    stars: typeof data.stargazers_count === "number" ? data.stargazers_count : null,
    forks: typeof data.forks_count === "number" ? data.forks_count : null,
    openIssues: typeof data.open_issues_count === "number" ? data.open_issues_count : null,
    pushedAt: data.pushed_at ? String(data.pushed_at).slice(0, 10) : null,
    license:
      (data.license && (data.license.spdx_id || data.license.name)) ||
      project.license ||
      null,
    defaultBranch: data.default_branch || project.branch || null,
    homepage: unicodeUrl(data.homepage) || project.liveUrl || null,
    topics: Array.isArray(data.topics) ? data.topics : [],
    archived: Boolean(data.archived),
    latestTag,
  };
}

const metaCache = new Map();

// 构建时从 GitHub API 拉取仓库最新状态；失败时回退到本地缓存，最后回退到静态默认值。
export function getRepoMeta(project) {
  if (metaCache.has(project.slug)) return metaCache.get(project.slug);

  const readCache = async () =>
    JSON.parse(
      await readFile(path.join(DATA_DIR, "meta", `${project.slug}.json`), "utf8")
    );

  // 设置 SITE_OFFLINE=1 时优先使用本地缓存（适合离线/受限网络构建）。
  const offline =
    process.env.SITE_OFFLINE === "1" || process.env.SITE_OFFLINE === "true";

  const promise = (async () => {
    if (offline) {
      try {
        return await readCache();
      } catch {
        /* fall through to network */
      }
    }
    try {
      return await fetchRepoMeta(project);
    } catch {
      try {
        return await readCache();
      } catch {
        return fallbackMeta(project);
      }
    }
  })();

  metaCache.set(project.slug, promise);
  return promise;
}
