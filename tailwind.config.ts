import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-heading)", "Manrope", "Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: { DEFAULT: "hsl(var(--surface))", 2: "hsl(var(--surface-2))" },
        muted: { DEFAULT: "hsl(var(--surface))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))" },
        // совместимость внутренних страниц (/blueprint, /status) со старыми именами
        card: { DEFAULT: "hsl(var(--background))", foreground: "hsl(var(--foreground))" },
        secondary: { DEFAULT: "hsl(var(--surface))", foreground: "hsl(var(--foreground))" },
        primary: { DEFAULT: "hsl(var(--foreground))", foreground: "hsl(var(--background))" },
        ring: "hsl(var(--ring))",
      },
      borderRadius: { lg: "0", md: "0", sm: "0" },
    },
  },
  plugins: [],
} satisfies Config;
