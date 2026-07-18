import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 is driven primarily by CSS (`@import "tailwindcss"` +
 * `@custom-variant` in `src/app/globals.css`).
 *
 * This file documents project intent and is kept for tooling/IDE clarity.
 * Class-based dark mode is enforced in globals.css as:
 *   @custom-variant dark (&:where(.dark, .dark *));
 *
 * That is the v4 equivalent of: darkMode: "class"
 */
const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

export default config;
