<!--
 * @Author: Sid Li
 * @Date: 2026-03-16 15:22:34
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-04-07 10:06:55
 * @FilePath: \admin-demo\src\views\notFound.vue
 * @Description: 
-->
<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面没有找到</h2>
      <router-link to="/">回到首页</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  /* background-color: #f8f8f8; */
}

.not-found-content {
  width: 600px;
  height: 40vh;
  padding: 5vh;
  background: white;
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.not-found h1 {
  font-size: 24px;
  margin: 0;
  color: #ff6f61;
}

.not-found h2 {
  font-size: 20px;
  margin: 20px 0;
}

.not-found p {
  font-size: 16px;
  margin-bottom: 20px;
}

.not-found a {
  display: inline-block;
  padding: 10px 20px;
  color: white;
  background-color: #009fa8;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.not-found a:hover {
  background-color: #0e939d;
}
</style>
