// Hostinger production build config
// Usage: pnpm --filter @workspace/broki-inmobiliaria run build:hostinger
// Output: artifacts/broki-inmobiliaria/dist-hostinger/
// Upload contents of dist-hostinger/ to public_html/ on Hostinger

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
    outDir: path.resolve(import.meta.dirname, "dist-hostinger"),
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
