import path from "path";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
// import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: "index",
    },
  },
  // plugins: [dts(), nodePolyfills()],
  plugins: [dts()],
});
