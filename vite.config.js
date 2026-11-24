import { fileURLToPath, URL } from "node:url";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react()],
  // A stable origin keeps browser saves in the same place on every launch.
  server: { host: "localhost", port: 5173, strictPort: true },
  preview: { host: "localhost", port: 5173, strictPort: true },
});
