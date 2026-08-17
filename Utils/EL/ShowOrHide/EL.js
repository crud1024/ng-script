class ElementToggle {
  constructor(selector) {
    // 支持多种选择器类型
    if (typeof selector === "string") {
      // CSS选择器
      this.elements = document.querySelectorAll(selector);
    } else if (selector instanceof HTMLElement) {
      // 单个DOM元素
      this.elements = [selector];
    } else if (selector instanceof NodeList || Array.isArray(selector)) {
      // 元素列表或数组
      this.elements = Array.from(selector);
    } else {
      throw new Error("Invalid selector type");
    }

    // 存储每个元素的原始显示状态（用于恢复）
    this.originalStates = new Map();
  }

  // 隐藏元素
  hide(useDisplayNone = true) {
    this.elements.forEach((el) => {
      if (!this.originalStates.has(el)) {
        // 保存原始display状态
        const computedStyle = window.getComputedStyle(el);
        this.originalStates.set(el, {
          display: computedStyle.display,
          visibility: computedStyle.visibility,
        });
      }

      if (useDisplayNone) {
        el.style.display = "none";
      } else {
        el.style.visibility = "hidden";
      }
    });
    return this;
  }

  // 显示元素
  show(restoreOriginal = true) {
    this.elements.forEach((el) => {
      if (restoreOriginal && this.originalStates.has(el)) {
        // 恢复原始状态
        const state = this.originalStates.get(el);
        el.style.display = state.display;
        el.style.visibility = state.visibility;
        this.originalStates.delete(el);
      } else {
        // 强制显示
        el.style.display = "";
        el.style.visibility = "";
        // 如果还不可见，设置为block
        if (
          el.style.display === "none" ||
          window.getComputedStyle(el).display === "none"
        ) {
          el.style.display = "block";
        }
      }
    });
    return this;
  }

  // 切换显示状态
  toggle() {
    this.elements.forEach((el) => {
      const isHidden =
        window.getComputedStyle(el).display === "none" ||
        window.getComputedStyle(el).visibility === "hidden";
      if (isHidden) {
        this.show();
      } else {
        this.hide();
      }
    });
    return this;
  }

  // 判断是否隐藏
  isHidden() {
    if (this.elements.length === 0) return true;
    const el = this.elements[0];
    return (
      window.getComputedStyle(el).display === "none" ||
      window.getComputedStyle(el).visibility === "hidden"
    );
  }

  // 判断是否可见
  isVisible() {
    return !this.isHidden();
  }

  // 获取当前元素集合
  getElements() {
    return this.elements;
  }

  // 获取元素数量
  count() {
    return this.elements.length;
  }

  // 批量操作 - 对每个元素执行回调
  each(callback) {
    this.elements.forEach((el, index) => {
      callback(el, index);
    });
    return this;
  }
}

// 暴露到全局（浏览器环境）
if (typeof window !== "undefined") {
  window.ElementToggle = ElementToggle;
  window.createToggle = function (selector, userOptions) {
    return new ElementToggle(selector, userOptions);
  };
  window.createElementToggle = window.createToggle;
}

// 使用示例：

// // 1. 直接使用类
// const toggle1 = new ElementToggle('#zjky_wbs_standard_m');
// toggle1.hide();

// // 2. 使用 createToggle 工厂函数
// const toggle2 = window.createToggle('.my-class');
// toggle2.hide();

// // 3. 使用 createElementToggle（别名）
// const toggle3 = window.createElementToggle('div.container');
// toggle3.toggle();

// // 4. 在浏览器控制台直接测试
// createToggle('#testId').hide().show();

// // 5. 批量操作
// const toggles = createToggle('.item');
// toggles.each((el, index) => {
//     console.log(`元素 ${index} 已处理`);
// }).hide();

// // 6. 检查状态
// const toggle = createToggle('#element');
// if (toggle.isHidden()) {
//     toggle.show();
// } else {
//     toggle.hide();
// }

// // 7. 链式调用
// createToggle('.target')
//     .hide()
//     .each((el) => el.style.color = 'red')
//     .show();
