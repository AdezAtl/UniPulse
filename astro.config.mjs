import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercelAdapter from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercelAdapter(),
  integrations: [react()],
  security: { checkOrigin: true },
});
