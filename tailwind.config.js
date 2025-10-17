/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 華ちゃんのオレンジベースカラーパレット
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // メインオレンジ
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        cream: {
          50: '#fefdf8',
          100: '#fef9e7',
          200: '#fdf2d1',
          300: '#fce7b8',
          400: '#f9d896',
          500: '#f5c842',
          600: '#e6b800',
          700: '#cc9900',
          800: '#b38600',
          900: '#996600',
        },
        warm: {
          50: '#fefdf8',
          100: '#fef9e7',
          200: '#fdf2d1',
          300: '#fce7b8',
          400: '#f9d896',
          500: '#f5c842',
          600: '#e6b800',
          700: '#cc9900',
          800: '#b38600',
          900: '#996600',
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cdc2',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
      },
      fontFamily: {
        // 日本語対応の可愛いフォント
        'cute': ['Comic Sans MS', 'cursive', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
        'rounded': ['Nunito', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      screens: {
        'xs': '475px',
        // モバイルファーストのブレークポイント
        'sm': '640px',   // スマホ横向き
        'md': '768px',   // タブレット
        'lg': '1024px',  // デスクトップ
        'xl': '1280px',  // 大画面
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};
