// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify'; 
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({}),
  vite: {
    plugins: [tailwindcss()]
  }
});