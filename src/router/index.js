/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-04-25 10:41:35
 * @FilePath: \wecom-chat-admin\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/views/index.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/notFound.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

 

export default router;
