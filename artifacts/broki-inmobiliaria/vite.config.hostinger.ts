// Hostinger production build config
// Usage: pnpm --filter @workspace/broki-inmobiliaria run build:hostinger
// Output: <repo-root>/public_html/  (Hostinger serves this folder via GitHub Auto Deploy)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "../../attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "../../public_html"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react:   ["react", "react-dom"],
          motion:  ["framer-motion"],
          query:   ["@tanstack/react-query"],
        },
      },
    },
  },
  define: {
    "import.meta.env.VITE_STORAGE_MODE": JSON.stringify("api"),
    "import.meta.env.VITE_API_BASE":     JSON.stringify("/api"),
  },
});
