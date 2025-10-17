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
        target: `http://chat_backend:3000`,
        rewrite: (path) => {
          return path.replace(/^\/apii/, "");
        },
      },
      "/socket.io": {
        target: "http://chat_websocket:3000",
        changeOrigin: true, // 改變 origin header
        ws: true, // 支援 WebSocket 升級
        //
        configure: (proxy, options) => {
          console.log("proxy", proxy);
        },
      },
    },
  },
  // ==================================
});
