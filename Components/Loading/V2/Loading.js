/**
 * 创建白色系加载动画
 * @param {string} selector - 父元素选择器
 * @param {string} text - 加载提示文字
 * @returns {object} 返回动画控制对象
 */
function createLoading(selector, text = "正在加载中") {
  // 查找父元素
  const parent = document.querySelector(selector);
  if (!parent) {
    console.error(`未找到选择器为 "${selector}" 的元素`);
    return null;
  }

  // 确保父元素有相对定位，用于绝对定位子元素
  const parentPosition = window.getComputedStyle(parent).position;
  if (parentPosition === "static") {
    parent.style.position = "relative";
  }

  // 创建遮罩层 - 白色半透明
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
  overlay.style.zIndex = "9999";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.backdropFilter = "blur(2px)"; // 毛玻璃效果

  // 创建加载容器 - 白色卡片
  const loadingContainer = document.createElement("div");
  loadingContainer.style.display = "flex";
  loadingContainer.style.flexDirection = "column";
  loadingContainer.style.justifyContent = "center";
  loadingContainer.style.alignItems = "center";
  loadingContainer.style.padding = "30px 40px";
  loadingContainer.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  loadingContainer.style.borderRadius = "12px";
  loadingContainer.style.boxShadow =
    "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)";
  loadingContainer.style.border = "1px solid rgba(0, 0, 0, 0.05)";
  loadingContainer.style.minWidth = "180px";
  loadingContainer.style.minHeight = "140px";
  loadingContainer.style.boxSizing = "border-box";

  // 创建旋转动画元素 - 蓝色调
  const spinner = document.createElement("div");
  spinner.style.width = "48px";
  spinner.style.height = "48px";
  spinner.style.border = "3px solid rgba(74, 144, 226, 0.2)"; // 浅蓝色
  spinner.style.borderTop = "3px solid #4a90e2"; // 主蓝色
  spinner.style.borderRight = "3px solid #4a90e2"; // 增加一点颜色
  spinner.style.borderRadius = "50%";
  spinner.style.animation =
    "spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite";
  spinner.style.marginBottom = "20px";

  // 创建加载文字
  const textElement = document.createElement("div");
  textElement.textContent = text;
  textElement.style.color = "#333";
  textElement.style.fontSize = "16px";
  textElement.style.fontWeight = "500";
  textElement.style.textAlign = "center";
  textElement.style.lineHeight = "1.5";
  textElement.style.letterSpacing = "0.5px";

  // 可选：添加小圆点动画
  const dotsContainer = document.createElement("div");
  dotsContainer.style.display = "flex";
  dotsContainer.style.justifyContent = "center";
  dotsContainer.style.alignItems = "center";
  dotsContainer.style.marginTop = "8px";
  dotsContainer.style.height = "20px";

  // 创建三个小圆点
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.style.width = "6px";
    dot.style.height = "6px";
    dot.style.backgroundColor = "#4a90e2";
    dot.style.borderRadius = "50%";
    dot.style.margin = "0 3px";
    dot.style.animation = `pulse 1.4s ease-in-out ${i * 0.2}s infinite`;
    dotsContainer.appendChild(dot);
  }

  // 组装元素
  loadingContainer.appendChild(spinner);
  loadingContainer.appendChild(textElement);
  loadingContainer.appendChild(dotsContainer);
  overlay.appendChild(loadingContainer);
  parent.appendChild(overlay);

  // 添加动画关键帧
  if (!document.querySelector("#loading-animation-style")) {
    const style = document.createElement("style");
    style.id = "loading-animation-style";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { 
          opacity: 0.3;
          transform: scale(0.8);
        }
        50% { 
          opacity: 1;
          transform: scale(1.2);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 返回控制对象
  return {
    remove: function () {
      if (overlay && overlay.parentNode === parent) {
        parent.removeChild(overlay);

        // 如果父元素的position是本次添加的，则恢复原状
        if (
          parent.style.position === "relative" &&
          parentPosition === "static"
        ) {
          parent.style.position = "";
        }
      }
    },

    // 更新加载文字
    updateText: function (newText) {
      textElement.textContent = newText;
    },

    // 获取动画元素
    getElement: function () {
      return overlay;
    },

    // 显示/隐藏动画
    show: function () {
      overlay.style.display = "flex";
    },

    hide: function () {
      overlay.style.display = "none";
    },

    // 设置主题（亮色/暗色）
    setTheme: function (theme) {
      if (theme === "dark") {
        loadingContainer.style.backgroundColor = "rgba(30, 30, 30, 0.95)";
        textElement.style.color = "#fff";
        spinner.style.border = "3px solid rgba(255, 255, 255, 0.2)";
        spinner.style.borderTop = "3px solid #fff";
        spinner.style.borderRight = "3px solid #fff";
        dotsContainer.querySelectorAll("div").forEach((dot) => {
          dot.style.backgroundColor = "#fff";
        });
      } else {
        loadingContainer.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
        textElement.style.color = "#333";
        spinner.style.border = "3px solid rgba(74, 144, 226, 0.2)";
        spinner.style.borderTop = "3px solid #4a90e2";
        spinner.style.borderRight = "3px solid #4a90e2";
        dotsContainer.querySelectorAll("div").forEach((dot) => {
          dot.style.backgroundColor = "#4a90e2";
        });
      }
    },
  };
}
export { createLoading };
//使用示例
// const loading = createLoading('#app', '数据加载中...');
// // 更新文字
// loading.updateText('正在努力加载...');
// // 隐藏动画
// loading.hide();
// // 显示动画
// loading.show();
// // 切换主题
// loading.setTheme('dark');
// // 移除动画
// loading.remove();
// 注意：确保在项目中只引入一次此文件以避免重复定义动画关键帧
