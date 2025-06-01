/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/popup.html"), // public/popup.html を参照
        // ↓は、この後で利用するため、コメントアウトした。
        // options: path.resolve(__dirname, "options.html"), // public/options.html を参照
        // background: path.resolve(__dirname, "src/background/background.ts"),
        // content: path.resolve(__dirname, "src/content/content.ts"),
      },
      output: {
        entryFileNames: "[name].js", // background.js, content.js のように出力
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
    outDir: "dist", // 出力ディレクトリ
    emptyOutDir: true, // ビルド時にdistディレクトリをクリーンアップ
  },
  // publicDir: 'public' (デフォルトでpublicなので明示不要な場合も)
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts", // Setup file (optional)
    css: true, // if you want to test components with CSS
  },
});
