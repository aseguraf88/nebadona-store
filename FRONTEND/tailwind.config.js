/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
    theme: {
        extend: {
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
            },
            animation: {
                marquee: 'marquee 25s linear infinite',
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: ['halloween'],
        darkTheme: 'dark',
    },
}
