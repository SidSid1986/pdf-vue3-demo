/*
 * @Author: Sid Li
 * @Date: 2025-09-28 16:34:04
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-17 14:28:47
 * @FilePath: \admin-demo\src\main.js
 * @Description:
 */
import { createApp } from "vue";
import App from "./App.vue";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "@/styles/main.scss";
// import "@/styles/element/index.scss";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "@/styles/free-icons/iconfont.css";

import router from "@/router/index.js";

import store from "@/store";

// 引入rem适配
import "@/utils/rem.js";

const app = createApp(App);
app.use(store);
app.use(ElementPlus, {
  locale: zhCn,
});
app.use(router);

// app.directive("throttle", throttle);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
