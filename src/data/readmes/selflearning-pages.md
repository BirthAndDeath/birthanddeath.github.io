# selflearning-pages

> **Languages:** [English](README.md) | [简体中文](README.zh-CN.md)

A multilingual documentation site for self-directed learning, built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

**Site:** [https://selflearning-pages.pages.dev/](https://selflearning-pages.pages.dev/)

## Tech Stack

- **Astro** `^7.0.2`
- **@astrojs/starlight** `^0.41.3`
- **sharp** `^0.35.3`

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Preview built site |

## Project Structure

```
src/content/docs/
├── en/       # English
└── zh-cn/    # Simplified Chinese
```

## Internationalization

Locale folders use **lowercase** (e.g. `zh-cn`), BCP-47 tag via `lang` in config.

To add a language: create `src/content/docs/<locale>/` and register in `astro.config.mjs` `locales`.

## Contributing

1. Fork & clone.
2. `git checkout -b feat/your-feature`.
3. Add/update pages under `src/content/docs/<locale>/`.
4. Register new directories in `astro.config.mjs` `sidebar`.
5. Verify with `npm run build`.
6. Open a pull request.

Contact us on [GitHub](https://github.com/BirthAndDeath/selflearning-pages).
MDX syntax reference: [MDX Tutorial](https://mdxjs.com/)

## MDX Syntax

### Frontmatter

```mdx
---
title: My Page
description: Short description.
---
```

Optional fields: `template: splash`, `hero`, `sidebar`, `pagefind: false`.

### Starlight components

```mdx
import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid stagger>
  <Card title="Title" icon="pencil">Content</Card>
</CardGrid>
```

### Others

- Code blocks: `` ```language ``.
- Links: `[text](/en/page/)`.
- Images: relative paths from file location.
- Tables: standard Markdown syntax.
- `.mdx` supports JSX; `.md` does not.
- `sidebar.slug` is path relative to `src/content/docs/` without extension.

## License

[CC0 1.0 Universal](LICENSE) — public domain.