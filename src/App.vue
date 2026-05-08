<!--
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-17 15:09:45
 * @FilePath: \admin-demo\src\App.vue
 * @Description: 
-->
<template>
  <div class="app-show">
    <router-view />
  </div>
</template>

<script setup>
// import { onMounted } from "vue";

// const preventGlobalScroll = (e) => {
//   e.preventDefault();
// };
// onMounted(() => {
//   document.addEventListener("touchmove", preventGlobalScroll, {
//     passive: false,
//   });
// });
</script>

<style lang="scss" scoped>
.app-show {
  width: 100%;
  height: 100%;

}
</style>
