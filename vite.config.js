/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:07:07
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-04-07 09:55:47
 * @FilePath: \admin-demo\vite.config.js
 * @Description:
 */
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import viteImagemin from "vite-plugin-imagemin";
// import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import postCssPxToRem from "postcss-pxtorem";
import { resolve } from "path";
// 导入对应包
import ElementPlus from "unplugin-element-plus/vite";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false, //
          javascriptEnabled: true, //
          additionalData: `@use "@/styles/element/index.scss" as *;`,
          // additionalData: `@use "@/styles/global.scss" as *; @use "@/styles/element/index.scss" as *;`,
        },
      },
      // loaderOptions: {
      //   sass: {
      //     // 自动导入定制化样式文件进行样式覆盖
      //     additionalData: `@use "@/styles/element/index.scss" as *;`,
      //   },
      // },
      postcss: {
        plugins: [
          postCssPxToRem({
            // 与 rem.js 中的 baseSize 保持一致（100px）
            // 逻辑：设计稿 1920px -> 19.2rem (因为 1920/100 = 19.2)
            // 此时 1rem 在 1920 屏幕下等于 100px
            rootValue: 100,
            // 所有属性都转换，除了 border
            propList: ["*", "!border"],
            //  防止第三方库样式错乱
            selectorBlackList: ["norem", "el-icon"],
            unitPrecision: 5,
            replace: true,
            mediaQuery: true,
            // 小于 2px 的不转换，保证精细度
            minPixelValue: 2,
          }),
        ],
      },
    },

    optimizeDeps: {
      include: [
        "element-plus",
        "@element-plus/icons-vue",
        "@element-plus/theme-chalk/src/index.css",
      ],
    },
    plugins: [
      vue(),
      viteImagemin({
        optipng: { optimizationLevel: 2 },
      }),
    ],

    base: "./", // 设置基础路径，用于生成静态资源的URL
    server: {
      host: "0.0.0.0", // 监听所有网络接口
      port: 5173, // 端口号
      proxy: {
        "/api": {
          target: env.VITE_APP_API_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "api"),
        },
        "/static": {
          target: env.VITE_APP_API_HOST,
          changeOrigin: true,
        },
      },
    },

    build: {
      assetsInlineLimit: 4096,
      assetsDir: "assets",
      outDir: "dist",
    },
    assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
    configureWebpack: {
      devtool: process.env.NODE_ENV !== "production" ? "source-map" : "",
    },
  });
};
