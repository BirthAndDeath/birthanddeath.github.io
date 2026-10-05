# birthanddeath.github.io

My personal website — a hub that introduces and indexes all of my open-source projects.

我的个人网站：集中介绍并索引我的所有开源项目，每个项目都有一个中英双语介绍页面。

**Live:** https://birthanddeath.github.io

## Structure

```
.
├── index.html               # Homepage / 首页（项目卡片总览）
├── whitebox-forge/
│   └── index.html           # WhiteBox-Forge
├── openwire/
│   └── index.html           # OpenWire
├── selflearning-pages/
│   └── index.html           # selflearning-pages
├── website/
│   └── index.html           # 本站介绍 / About this site
└── assets/
    └── style.css            # Shared stylesheet / 共享样式表（深色 / 浅色）
```

Each project lives in its own folder and is served at a clean URL, e.g. `/whitebox-forge/`.
每个项目位于独立文件夹中，并通过干净的 URL 访问，例如 `/whitebox-forge/`。

Project pages keep only a concise introduction and link to the repository's GitHub README as the single source of truth.
项目页仅保留简洁介绍，完整内容以各仓库的 GitHub README 为准，避免重复与内容漂移。

## i18n / 多语言

Client-side only, no server required (works from `file://`). Language is chosen from the saved preference, then the browser language, falling back to English; the header list persists the choice in `localStorage`.
纯前端实现，无需服务器（`file://` 直接可用）。语言取自已保存的选择，其次浏览器语言偏好，最后回落英文；右上角列表可手动切换并持久化到 `localStorage`。

## README rendering / README 渲染

Each project page fetches its repository README at runtime and renders it inline, trying jsDelivr, then raw.githubusercontent.com, then the GitHub API. This needs network access; if all sources fail, an error message with a link to the repository is shown. Rendering itself is done by a built-in lightweight Markdown renderer (no external library, HTML is escaped).
每个项目页在运行时获取该仓库的 README 并内联渲染，依次尝试 jsDelivr、raw.githubusercontent.com、GitHub API。此功能需要联网；若全部失败会显示错误提示与仓库链接。渲染由内置的轻量 Markdown 渲染器完成（无外部库，HTML 会被转义）。

Plain static HTML + CSS, no build step, hosted directly on GitHub Pages.
纯静态 HTML + CSS，无构建步骤，由 GitHub Pages 直接托管。

## Projects / 项目

| Project | Description |
| --- | --- |
| [WhiteBox-Forge](https://github.com/BirthAndDeath/WhiteBox-Forge) | 透明、基于能力的 WebAssembly 应用沙箱 / Transparent, capability-based WASM sandbox |
| [OpenWire](https://github.com/BirthAndDeath/OpenWire) | 后量子加密的跨平台 P2P 聊天应用 / Post-quantum P2P chat app |
| [selflearning-pages](https://selflearning-pages.pages.dev/) | 多语言自学文档站点 / Multilingual self-learning docs |

## Adding a project / 新增项目

1. Add a card to `index.html`.
2. Create a folder named after the project and add an `index.html` inside it.
3. Optionally list it in this README.

1. 在 `index.html` 中添加一张卡片。
2. 以项目名新建文件夹，并在其中放入 `index.html`。
3. 可选：在本 README 中列出该项目。

## License

Site content © Birth_And_Death.
