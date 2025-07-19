import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://harf.roshan-ai.ir",
        changeOrigin: true,
        secure: true,
        headers: {
          Authorization: "Token a85d08400c622b50b18b61e239b9903645297196",
        },
      },
    },
  },
});
