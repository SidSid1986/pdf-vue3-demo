/*
 * @Author: Sid Li
 * @Date: 2026-04-28 16:55:55
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-04-28 16:57:19
 * @FilePath: \pdf-demo\src\utils\rem.js
 * @Description:
 */
/**
 * 自适应 rem 配置
 * 设计稿基准：1920px
 * 核心策略：大屏自动放大，小屏锁定最小尺寸（防止内容过小看不清）
 */

const designWidth = 1920; // 设计稿宽度
const baseSize = 100; // 基准字体大小（1rem = 100px，计算更友好）
const MIN_REFERENCE_WIDTH = 1280; // 最小参考宽度，按需调整
const MAX_SCALE = 2.5; // 最大放大倍数

// 节流函数：避免 resize/orientationchange 触发过频
function throttle(fn, delay = 100) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      fn.apply(this, args);
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    }
  };
}

function setRem() {
  // 获取当前屏幕宽度，小于最小宽度则锁定为最小宽度
  let currentWidth = document.documentElement.clientWidth;
  if (currentWidth < MIN_REFERENCE_WIDTH) {
    currentWidth = MIN_REFERENCE_WIDTH;
  }

  // 计算缩放比例并限制最大值
  const scale = currentWidth / designWidth;
  const limitedScale = Math.min(scale, MAX_SCALE);

  // 计算根字体大小，兜底最小 12px
  let fontSize = baseSize * limitedScale;
  fontSize = Math.max(fontSize, 12);

  // 设置根字体
  document.documentElement.style.fontSize = fontSize + "px";

  // 调试用（生产环境可注释）
  // console.log(`[REM] 屏幕宽度: ${document.documentElement.clientWidth}, 计算宽度: ${currentWidth}, 根字体: ${fontSize}px`);
}

// 初始化 + 监听事件
setRem();
const throttledSetRem = throttle(setRem, 100);
window.addEventListener("resize", throttledSetRem);
window.addEventListener("orientationchange", throttledSetRem);
