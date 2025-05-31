import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  safelist: [
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-5',
    'grid-cols-6',
    'grid-cols-7',
    'grid-cols-8',
  ],
  prefix: '',
  theme: {
    screens: {
      tablet: '768px',
      desktop: '1440px',
      wide: '1920px',
    },
    container: {
      center: true,
    },
    extend: {
      rotate: {
        'x-90': 'rotateX(90deg)',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)'],
      },
      colors: {
        'd-black': '#383838',
        'd-green': '#C9FF55',
        'd-green-secondary': '#ECFFC3',
        'd-yellow-secondary': '#FDFED9',
        'd-gray': '#EAEAEA',
        'd-violet': '#636AFB',
        'd-violet-secondary': '#E6E7FE',
        'd-blue': '#24BFEB',
        'd-blue-secondary': '#D8F3FB',
        'd-light-gray': '#F4F4F4',
        'd-red': '#FF6E6E',
        'd-red-secondary': '#FEF2E0',
        'd-red-disabled': '#FFDADA',
        'd-mint': '#DAFBE2',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        scrollY: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-1': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },

        'pill-bounce': {
          '0%, 20%': { transform: 'translateX(0)' },
          '22%': { transform: 'translateX(-25%) scale(1.1)' },
          '24%, 45%': { transform: 'translateX(-25%) scale(1)' },
          '47%': { transform: 'translateX(-50%) scale(1.1)' },
          '49%, 70%': { transform: 'translateX(-50%) scale(1)' },
          '72%': { transform: 'translateX(-75%) scale(1.1)' },
          '74%, 95%': { transform: 'translateX(-75%) scale(1)' },
          '97%': { transform: 'translateX(-100%) scale(1.1)' },
          '100%': { transform: 'translateX(-100%) scale(1)' },
        },

        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        scroll: 'scroll 20s linear infinite',
        'pill-bounce': 'pill-bounce 16s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        scrollY: 'scrollY 10s linear infinite',
        'float-1': 'float-1 4s ease-in-out infinite',
        'float-2': 'float-2 5s ease-in-out infinite',
        'float-3': 'float-3 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), 'prettier-plugin-tailwindcss', require('tailwind-scrollbar')],
} satisfies Config;

export default config;
