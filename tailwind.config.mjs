/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                // Quiet Luxury Palette
                obsidian: '#0B0C10',
                ivory: '#F4F4F5',
                sapphire: {
                    DEFAULT: '#1E40AF',
                    light: '#3B82F6',
                    dark: '#1E3A8A'
                },
                // Accent for ambient effects
                violet: {
                    900: '#4C1D95',
                    800: '#5B21B6'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif']
            }
        }
    },
    plugins: []
};
