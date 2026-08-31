import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050816',
          secondary: '#0A1020',
          card: '#111827',
          elevated: '#1F2937',
        },
        neon: {
          blue: '#00D4FF',
          purple: '#8B5CF6',
          green: '#00FF88',
          pink: '#FF0080',
          gold: '#FFD700',
        },
        rarity: {
          common: '#9CA3AF',
          rare: '#3B82F6',
          epic: '#8B5CF6',
          legendary: '#FFD700',
          mythic: '#FF0080',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 2.5s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.3)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0,0)', filter: 'none' },
          '92%': { transform: 'translate(-2px,1px)', filter: 'hue-rotate(15deg)' },
          '94%': { transform: 'translate(2px,-1px)', filter: 'hue-rotate(-15deg)' },
          '96%': { transform: 'translate(-1px,2px)' },
          '98%': { transform: 'translate(1px,-2px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00D4FF, 0 0 20px #00D4FF, 0 0 40px rgba(0, 212, 255, 0.4)',
        'neon-purple': '0 0 5px #8B5CF6, 0 0 20px #8B5CF6, 0 0 40px rgba(139, 92, 246, 0.4)',
        'neon-green': '0 0 5px #00FF88, 0 0 20px #00FF88, 0 0 40px rgba(0, 255, 136, 0.4)',
        'neon-gold': '0 0 5px #FFD700, 0 0 20px #FFD700, 0 0 40px rgba(255, 215, 0, 0.4)',
        'neon-pink': '0 0 5px #FF0080, 0 0 20px #FF0080, 0 0 40px rgba(255, 0, 128, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
