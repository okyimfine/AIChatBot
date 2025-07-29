import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "."),
      "@/lib": path.resolve(__dirname, "."),
      "@/hooks": path.resolve(__dirname, "."),
      "@/pages": path.resolve(__dirname, "."),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
  css: {
    postcss: "./postcss.config.js",
  },
});