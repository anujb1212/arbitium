/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                base: '#000000',
                panel: '#0a0a0a',
                raised: '#141414',
                line: '#262626',
                hi: '#fafafa',
                mid: '#a1a1aa',
                lo: '#52525b',
                bull: '#10b981',
                bear: '#ef4444',
                accent: '#0071e3',
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
                mono: ['SF Mono', 'Fira Code', 'Cascadia Code', 'ui-monospace', 'monospace'],
            },
        },
    },
    plugins: [],
}
