module.exports = {
  safelist: [
    "bg-primary", "bg-primary-light", "bg-primary-dark",
    "bg-secondary", "bg-secondary-light", "bg-secondary-dark",
    "bg-accent", "bg-accent-light", "bg-accent-dark",
    "bg-warning", "bg-warning-light",
    "bg-danger", "bg-danger-light",
    "bg-surface", "bg-surface-dark",
    "text-primary", "text-secondary", "text-accent", "text-warning", "text-danger",
    "border-primary", "border-secondary", "border-accent", "border-surface",
    "hover:bg-primary-light", "hover:bg-secondary-light", "hover:bg-accent-light",
    "focus:ring-primary", "focus:ring-secondary", "focus:ring-accent"
  ],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E4B34",
          light: "#2D6B4A",
          dark: "#143624",
        },
        secondary: {
          DEFAULT: "#F2EDE2",
          light: "#FAF8F4",
          dark: "#E8E0D4",
        },
        accent: {
          DEFAULT: "#2E8B57",
          light: "#3CB371",
          dark: "#1E6B3F",
        },
        warning: {
          DEFAULT: "#D4A843",
          light: "#E8C56D",
        },
        danger: {
          DEFAULT: "#C0392B",
          light: "#E74C3C",
        },
        surface: {
          DEFAULT: "#F2EDE2",
          dark: "#E8E0D4",
        },
        text: {
          primary: "#1E4B34",
          secondary: "#4A5D4E",
          muted: "#6B7D70",
          inverse: "#F2EDE2",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(30, 75, 52, 0.08)',
        'card': '0 4px 16px rgba(30, 75, 52, 0.1)',
        'elevated': '0 8px 32px rgba(30, 75, 52, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    }
  },
  plugins: []
};
