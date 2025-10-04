// orval.config.js

module.exports = {
  // 配置名稱：您可以根據專案需要命名
  mainApi: {
    // 1. 輸入配置 (NestJS Swagger JSON 檔案的位置)
    input: {
      target: "http://localhost:3000/api-json",
    },

    // 2. 輸出配置
    output: {
      // 🎯 輸出主檔案，包含所有 React Query Hooks (useQuery, useMutation)
      target: "api/api-hooks.ts",

      // 🎯 輸出所有 DTO/Model 型別的資料夾
      schemas: "api/models",

      // 🎯 選擇 Client 類型：生成 React Query Hooks (useQuery/useMutation)
      client: "react-query",

      // 🎯 選擇 HTTP 請求庫：Hooks 內部將使用 axios 處理請求
      httpClient: "axios",

      // 🎯 檔案分割模式：根據 @ApiTags 分割檔案
      mode: "tags",

      // 啟用 Prettier 格式化，讓生成的程式碼保持整潔
      prettier: true,

      // 處理認證：這將生成一個用於自定義 Bearer Token 的檔案
    },
    hooks: {
      mutator: {
        path: "./api/custom-instance.ts",
        name: "customInstance",
      },
    },
  },
};
