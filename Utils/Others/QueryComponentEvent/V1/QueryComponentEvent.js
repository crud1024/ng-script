/**
 * HoverReveal 类
 * 功能：在指定容器中查找所有 id 以 "_r" 开头的元素，为其下一个兄弟元素添加悬停显示/隐藏效果。
 * @param {HTMLElement|string} container - 容器元素或其 CSS 选择器
 * @param {Object} options - 配置项
 * @param {number} options.delay - 隐藏延迟时间（毫秒），默认 100
 */
class HoverReveal {
  constructor(container, options = {}) {
    // 解析容器元素
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      console.warn("[HoverReveal] 未找到容器元素");
      return;
    }

    this.delay = options.delay || 100;
    this.init();
  }

  /**
   * 初始化：查找目标元素并绑定事件
   */
  init() {
    // 查找所有 id 以 "_r" 开头的元素
    const targetElements = this.container.querySelectorAll('[id^="_r"]');

    targetElements.forEach((element) => {
      const sibling = element.nextElementSibling;
      if (!sibling) return; // 无兄弟元素则跳过

      // 初始隐藏兄弟元素
      sibling.style.display = "none";

      // 绑定事件
      element.addEventListener("mouseenter", () => this.showSibling(sibling));
      element.addEventListener("mouseleave", () =>
        this.hideSiblingDelayed(sibling),
      );
      sibling.addEventListener("mouseleave", () => this.hideSibling(sibling));
    });
  }

  /**
   * 显示兄弟元素
   * @param {HTMLElement} sibling
   */
  showSibling(sibling) {
    if (sibling.style.display === "none") {
      sibling.style.display = ""; // 恢复默认显示
    }
  }

  /**
   * 延迟隐藏兄弟元素（给予鼠标移动到兄弟元素的时间）
   * @param {HTMLElement} sibling
   */
  hideSiblingDelayed(sibling) {
    setTimeout(() => {
      // 检查鼠标是否仍悬停在兄弟元素上
      if (!sibling.matches(":hover") && sibling.style.display !== "none") {
        sibling.style.display = "none";
      }
    }, this.delay);
  }

  /**
   * 直接隐藏兄弟元素
   * @param {HTMLElement} sibling
   */
  hideSibling(sibling) {
    if (sibling.style.display !== "none") {
      sibling.style.display = "none";
    }
  }

  /**
   * 销毁实例，移除所有事件监听（需配合保存的监听器引用，此处仅作示例）
   */
  destroy() {
    // 实际开发中需保存每个事件监听器以便移除，此处为简化，可自行扩展
    console.warn("[HoverReveal] destroy 方法需自行扩展以移除事件监听");
  }
}
if (typeof window !== "undefined") {
  window.HoverReveal = HoverReveal;
}

// // 传入容器 ID（动态传入）
// new HoverReveal('#inv_vertical_m');

// // 也可传入 DOM 元素
// const container = document.getElementById('inv_vertical_m');
// new HoverReveal(container);

// // 可选延迟配置
// new HoverReveal('#inv_vertical_m', { delay: 200 });
