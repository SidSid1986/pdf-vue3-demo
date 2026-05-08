/*
 * @Author: Sid Li
 * @Date: 2026-02-27 10:09:45
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-02-27 10:09:52
 * @FilePath: \nuxt-free\public\rem-init.js
 * @Description: 
 */
// public/rem-init.js
/**
 * REM 适配初始化脚本 (同步阻塞执行，防止页面闪烁)
 * 此文件会被 Nuxt 注入到 <head> 中，在 body 渲染前执行
 */
(function () {
  var designWidth = 1920;
  var designHeight = 1080;
  var baseFontSize = 10;
  var designRootFontSize = (designWidth / 100) * baseFontSize;

  var resolutionConfig = { 2560: 1.2, 3840: 1.4, 7680: 1.6 };
  var fontSizeMaxConfig = { default: 10, 2560: 12, 3840: 14, 7680: 16 };

  function setRootFontSize() {
    if (typeof document === "undefined") return;

    var currentWidth =
      document.documentElement.clientWidth || window.innerWidth;
    var currentHeight =
      document.documentElement.clientHeight || window.innerHeight;

    var widthRatio = currentWidth / designWidth;
    var heightRatio = currentHeight / designHeight;
    var scaleRatio = Math.min(widthRatio, heightRatio);

    var zoomFactor = 1;
    var currentMaxFontSize = fontSizeMaxConfig.default;

    if (currentWidth >= 7680) {
      zoomFactor = resolutionConfig[7680];
      currentMaxFontSize = fontSizeMaxConfig[7680];
    } else if (currentWidth >= 3840) {
      zoomFactor = resolutionConfig[3840];
      currentMaxFontSize = fontSizeMaxConfig[3840];
    } else if (currentWidth >= 2560) {
      zoomFactor = resolutionConfig[2560];
      currentMaxFontSize = fontSizeMaxConfig[2560];
    }

    scaleRatio = scaleRatio * zoomFactor;
    var fontSize = scaleRatio * designRootFontSize;
    var minFontSize = 7;
    fontSize = Math.max(Math.min(fontSize, currentMaxFontSize), minFontSize);

    document.documentElement.style.fontSize = fontSize + "px";
  }

  // 【关键】立即同步执行，阻塞后续渲染
  setRootFontSize();

  // 绑定监听器用于后续动态调整
  window.addEventListener("resize", setRootFontSize);
  window.addEventListener("orientationchange", setRootFontSize);
})();
