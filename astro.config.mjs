import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind()],
    output: 'static',
    server: {
        host: true,
        port: 4321
    },
    build: {
        assets: '_assets'
    }
});
