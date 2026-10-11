import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Permite cualquier host (necesario para previews proxy)
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      },
    },
    fs: { allow: [path.resolve(__dirname), path.resolve(__dirname, "../shared")] }
  },
  build: {
    outDir: "dist",
    sourcemap: false
  }
});
