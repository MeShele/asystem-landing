import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "Onest", "system-ui", "sans-serif"],
        display: ["var(--font-heading)", "Unbounded", "Onest", "sans-serif"],
      },
      colors: {
        bg: "hsl(var(--bg))",
        surface: { DEFAULT: "hsl(var(--surface))", 2: "hsl(var(--surface-2))" },
        fg: "hsl(var(--fg))",
        muted: { DEFAULT: "hsl(var(--surface-2))", foreground: "hsl(var(--muted))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-fg))" },
        line: "hsl(var(--line) / 0.08)",
        // совместимость внутренних страниц (/blueprint, /status) со старыми именами
        border: "hsl(var(--border))",
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--fg))",
        card: { DEFAULT: "hsl(var(--surface))", foreground: "hsl(var(--fg))" },
        secondary: { DEFAULT: "hsl(var(--surface-2))", foreground: "hsl(var(--fg))" },
        primary: { DEFAULT: "hsl(var(--fg))", foreground: "hsl(var(--bg))" },
        destructive: { DEFAULT: "hsl(var(--danger))" },
        ring: "hsl(var(--ring))",
      },
      borderRadius: { lg: "14px", md: "10px", sm: "8px" },
    },
  },
  plugins: [],
} satisfies Config;
