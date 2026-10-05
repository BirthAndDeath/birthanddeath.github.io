import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://birthanddeath.github.io",
  integrations: [sitemap()],
});
