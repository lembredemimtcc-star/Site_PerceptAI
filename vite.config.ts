import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    open: false,
    // Nao vigiar pastas gigantes (dataset de treino, dist, artefatos):
    // sem isso o dev server fica pesado/travado em maquina antiga.
    watch: {
      ignored: [
        "**/datasets*/**",
        "**/dist/**",
        "**/outputs*/**",
      ],
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5198",
        changeOrigin: true,
      },
    },
  },
  // Servidor da versao compilada (estatico e leve, sem watcher).
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5198",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
