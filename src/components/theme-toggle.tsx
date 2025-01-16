"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <RainbowButton
      gradient
      className="w-10 h-10 p-0"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </RainbowButton>
  );
}
