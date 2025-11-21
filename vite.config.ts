import { defineConfig } from "vite"
import { resolve } from "path"
import { ductSSGPlugin } from "@duct-ui/cli/vite-plugin"

export default defineConfig({
  root: ".",
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      "@components": resolve(__dirname, "./src/duct/components"),
      "@services": resolve(__dirname, "./src/duct/services"),
      "@models": resolve(__dirname, "./src/models"),
      "@data": resolve(__dirname, "./src/data"),
    }
  },
  plugins: [
    ductSSGPlugin()
  ],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: "es",
        dir: "dist",
      },
    },
  },
})
