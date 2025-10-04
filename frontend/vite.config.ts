import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// NestJS 後端埠號，請根據您的實際情況修改
const NESTJS_PORT = 3000;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

  // ==================================
  // ✨ 新增這裡的 server.proxy 配置 ✨
  // ==================================
  server: {
    port: 5173, // 你的前端埠號，例如 5173
    proxy: {
      "/apii": {
        // 規則: 瀏覽器向 '/api' 發出的所有請求...
        target: `http://chat_backend:3000`, // ... 都會被轉發到 NestJS 後端

        changeOrigin: true, // 必須: 更改 Host 標頭，讓 NestJS 以為請求來自它自己

        secure: false, // 必須: 確保在 http://localhost 上運作
        rewrite: (path) => {
          return path.replace(/^\/apii/, "");
        },
      },
    },
  },
  // ==================================
});
