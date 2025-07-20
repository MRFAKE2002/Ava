//! Vite
import { defineConfig } from "vite";

//! React
import react from "@vitejs/plugin-react";

//! TailwindCSS
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    //! CORS
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
