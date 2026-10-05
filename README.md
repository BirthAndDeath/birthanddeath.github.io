# birthanddeath.github.io

My personal website — a hub that introduces and indexes all of my open-source projects.
我的个人网站：集中介绍并索引我的所有开源项目。

**Live:** https://birthanddeath.github.io

Built with [Astro](https://astro.build). Each project README is fetched **at build time**, rendered to Markdown-free static HTML, and inlined into its project page — so all project content is crawlable and works without client-side fetching.

使用 [Astro](https://astro.build) 构建。每个项目的 README 在**构建时**抓取并渲染为静态 HTML 内联进项目页，因此所有项目内容都可被搜索引擎收录，也不依赖浏览器端抓取。

## Commands

| Command | Action |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 本地开发服务器（`localhost:4321`） |
| `npm run build` | 构建静态站点到 `dist/` |
| `npm run preview` | 预览构建产物 |

## Structure

```
.
├── astro.config.mjs        # site + sitemap 集成
├── public/
│   ├── assets/style.css     # 共享样式表（深色 / 浅色）
│   ├── assets/i18n.js       # 纯前端 i18n（构建后仍是静态资源）
│   └── robots.txt
├── src/
│   ├── components/          # Header / Footer
│   ├── layouts/             # BaseLayout（SEO head）+ ProjectLayout
│   ├── lib/
│   │   ├── markdown.mjs     # 轻量 Markdown 渲染器（构建时）
│   │   └── projects.mjs     # 项目元数据 + README 抓取
│   └── pages/
│       ├── index.astro          # /
│       ├── whitebox-forge/      # /whitebox-forge/
│       ├── openwire/            # /openwire/
│       ├── selflearning-pages/  # /selflearning-pages/
│       └── website/             # /website/
└── .github/workflows/deploy.yml  # GitHub Actions 构建并部署到 Pages
```

## README embedding / README 内嵌

At build time `src/lib/projects.mjs` fetches each repository README, trying in order: **GitHub API → jsDelivr → raw.githubusercontent.com**, with retries and a timeout. The Markdown is rendered by `src/lib/markdown.mjs` (no external library; content is HTML-escaped and dangerous URL schemes are filtered), then relative links/images are rewritten to GitHub absolute URLs. If every source fails, it falls back to a committed copy under `src/data/readmes/`, and finally to a link to the README on GitHub.

构建时依次从 **GitHub API → jsDelivr → raw.githubusercontent.com** 获取 README（带重试与超时），由内置渲染器转为 HTML（转义内容、过滤危险协议），并把相对链接/图片改写为 GitHub 绝对地址；全部失败时回退到 `src/data/readmes/` 下的缓存副本，最后再回退为 GitHub 链接。

## i18n

Client-side only, no server required (works from `file://`). Language is chosen from the saved preference, then the browser language, falling back to English; the header list persists the choice in `localStorage`.

纯前端实现，无需服务器（`file://` 直接可用）。语言取自已保存的选择，其次浏览器语言偏好，最后回落英文；右上角列表可手动切换并持久化到 `localStorage`。

## SEO

- Static HTML output (no runtime rendering) — README content is indexable.
- `sitemap-index.xml` via `@astrojs/sitemap`, plus `robots.txt`.
- Per-page `canonical`, Open Graph, and Twitter Card meta.
- JSON-LD structured data: `Person` (home) and `SoftwareSourceCode` (each project).

## Deploy / 部署

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with Astro and deploys `dist/` to GitHub Pages.

**One-time setup:** in the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

推送到 `main` 后，`.github/workflows/deploy.yml` 会用 Astro 构建并将 `dist/` 部署到 GitHub Pages。

**一次性设置：** 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。

## Adding a project / 新增项目

1. Register the project in `src/lib/projects.mjs` (slug, repo, branch, title, description, highlights, links…).
2. Add a page under `src/pages/<slug>/index.astro` that calls `getProject("<slug>")` and `getReadmeHtml(...)`.
3. `npm run build` to verify.

1. 在 `src/lib/projects.mjs` 中登记项目（slug、repo、branch、标题、描述、要点、链接等）。
2. 在 `src/pages/<slug>/index.astro` 新建页面，调用 `getProject("<slug>")` 与 `getReadmeHtml(...)`。
3. 运行 `npm run build` 验证。

## License

Site content © Birth_And_Death.
