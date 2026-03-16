/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                base: '#0e1015',
                panel: '#14151b',
                raised: '#1c1d25',
                line: '#282a36',
                hi: '#f3f4f6',
                mid: '#9ca3af',
                lo: '#6b7280',
                bull: '#00c278',
                bear: '#ff3b69',
                accent: '#3b82f6',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'SF Mono', 'ui-monospace', 'monospace'],
            },
        },
    },
    plugins: [],
}
