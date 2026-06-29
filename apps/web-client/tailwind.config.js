/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                base: '#05070B',
                panel: '#090D14',
                raised: '#0B111A',
                line: '#1c222b',
                hi: '#ffffff',
                mid: '#9ca3af',
                lo: '#6b7280',
                bull: '#00c278',
                bear: '#FF4D4F',
                accent: '#FF4D4F',
            },
            fontFamily: {
                sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'SF Mono', 'ui-monospace', 'monospace'],
            },
        },
    },
    plugins: [],
}
