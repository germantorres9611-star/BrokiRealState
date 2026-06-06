// Hostinger production build config
// Usage: pnpm --filter @workspace/broki-inmobiliaria run build:hostinger
//
// Output goes to the REPO ROOT (../../ from this file).
// Hostinger GitHub Auto Deploy maps the entire repo root → public_html on the server.
// Do NOT add a public_html/ subfolder — that creates public_html/public_html/ on Hostinger.

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
    // Outputs directly to repo root; Vite never empties dirs outside its own root, so source files are safe.
    outDir: path.resolve(import.meta.dirname, "../.."),
    emptyOutDir: false,
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
