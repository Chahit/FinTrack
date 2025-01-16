import { type Config } from "tailwindcss";
import { tailwindTheme } from "@/styles/theme";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: tailwindTheme,
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
