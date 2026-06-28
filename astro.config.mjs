import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

const isVercel = process.env.VERCEL === "1";

export default defineConfig({
  adapter: isVercel ? vercel() : node({ mode: "standalone" }),
  security: {
    checkOrigin: true,
  },
});
