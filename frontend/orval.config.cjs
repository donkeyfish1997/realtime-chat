// orval.config.cjs
module.exports = {
  mainApi: {
    input: {
      target: "http://localhost:3000/api-json",
    },
    output: {
      target: "api/api-hooks.ts",
      schemas: "api/models",
      client: "react-query",
      httpClient: "axios",
      mode: "tags",
      prettier: true,
      override: {
        mutator: {
          path: "./api/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
};
