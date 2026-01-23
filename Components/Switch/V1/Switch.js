// ============================
// NG Design Switch 组件封装
// ============================

class NgSwitch {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string|HTMLElement} options.target - 目标元素或选择器
   * @param {boolean} options.checked - 初始状态，默认false
   * @param {boolean} options.disabled - 是否禁用，默认false
   * @param {string} options.size - 大小 'small' 或 'default'
   * @param {Object} options.style - 自定义样式
   * @param {string} options.style.checkedColor - 选中颜色
   * @param {string} options.style.uncheckedColor - 未选中颜色
   * @param {string} options.style.checkedText - 选中时文字
   * @param {string} options.style.uncheckedText - 未选中时文字
   * @param {Function} options.onChange - 状态变化回调
   */
  constructor(options = {}) {
    // 确保CSS样式已注入
    this.injectStyles();

    // 默认配置
    this.config = {
      target: null,
      checked: false,
      disabled: false,
      size: "default",
      style: {
        checkedColor: "#1890ff",
        uncheckedColor: "#bfbfbf",
        checkedText: "",
        uncheckedText: "",
      },
      onChange: null,
      ...options,
    };

    // 状态
    this.checked = this.config.checked;
    this.disabled = this.config.disabled;

    // 创建Switch元素
    this.createElement();

    // 添加到目标元素
    this.appendToTarget();

    // 绑定事件
    this.bindEvents();
  }

  /**
   * 注入CSS样式
   */
  injectStyles() {
    // 如果样式已经注入，直接返回
    if (document.getElementById("ng-switch-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "ng-switch-styles";
    style.textContent = `
            /* Switch 组件样式 */
            .ng-switch {
                position: relative;
                display: inline-block;
                box-sizing: border-box;
                border-radius: 100px;
                border: 1px solid transparent;
                background-color: #bfbfbf;
                cursor: pointer;
                transition: all 0.3s;
                user-select: none;
                vertical-align: middle;
                overflow: hidden;
                width: 60px;
                height: 30px;
                min-width: 60px;
                min-height: 30px;
            }
            
            .ng-switch:hover {
                opacity: 0.8;
            }
            
            .ng-switch:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
            }
            
            .ng-switch-handle {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 26px;
                height: 26px;
                background-color: white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: all 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
            }
            
            .ng-switch-inner {
                display: block;
                margin: 0 8px 0 30px;
                color: white;
                font-size: 12px;
                line-height: 26px;
                transition: margin 0.3s;
                font-weight: 500;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            /* 小型Switch样式 */
            .ng-switch-small {
                width: 40px !important;
                height: 20px !important;
                min-width: 40px !important;
                min-height: 20px !important;
            }
            
            .ng-switch-small .ng-switch-handle {
                width: 16px !important;
                height: 16px !important;
                top: 2px !important;
                left: 2px !important;
            }
            
            .ng-switch-small .ng-switch-inner {
                line-height: 16px;
                font-size: 10px;
                margin: 0 5px 0 20px;
            }
            
            .ng-switch-small.ng-switch-checked .ng-switch-inner {
                margin: 0 20px 0 5px !important;
            }
            
            /* 选中状态样式 */
            .ng-switch-checked {
                background-color: #1890ff !important;
            }
            
            .ng-switch-checked .ng-switch-handle {
                left: calc(100% - 26px - 2px) !important;
            }
            
            .ng-switch-checked .ng-switch-inner {
                margin: 0 30px 0 8px !important;
            }
            
            /* 小型选中状态 */
            .ng-switch-small.ng-switch-checked .ng-switch-handle {
                left: calc(100% - 16px - 2px) !important;
            }
            
            /* 禁用状态 */
            .ng-switch-disabled {
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }
            
            .ng-switch-disabled:hover {
                opacity: 0.5 !important;
            }
            
            /* 加载动画 */
            @keyframes ng-switch-loading {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            
            .ng-switch-loading .ng-switch-handle {
                position: relative;
            }
            
            .ng-switch-loading .ng-switch-handle::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 2px solid #f0f0f0;
                border-top-color: #1890ff;
                border-radius: 50%;
                animation: ng-switch-loading 1s linear infinite;
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * 创建Switch DOM元素
   */
  createElement() {
    // 创建外层容器
    this.switchElement = document.createElement("div");
    this.switchElement.className = "ng-switch";
    this.switchElement.setAttribute("role", "switch");
    this.switchElement.setAttribute("aria-checked", this.checked);
    this.switchElement.setAttribute("tabindex", this.disabled ? "-1" : "0");

    if (this.checked) {
      this.switchElement.classList.add("ng-switch-checked");
    }

    if (this.disabled) {
      this.switchElement.classList.add("ng-switch-disabled");
    }

    if (this.config.size === "small") {
      this.switchElement.classList.add("ng-switch-small");
    }

    // 创建内部滑块
    this.handleElement = document.createElement("div");
    this.handleElement.className = "ng-switch-handle";

    // 创建内部节点（用于显示文字）
    this.innerElement = document.createElement("div");
    this.innerElement.className = "ng-switch-inner";

    // 组装元素
    this.switchElement.appendChild(this.innerElement);
    this.switchElement.appendChild(this.handleElement);

    // 应用初始样式
    this.applyStyle();
    this.updateDisabledState();
  }

  /**
   * 将Switch添加到目标元素
   */
  appendToTarget() {
    if (!this.config.target) return;

    let targetElement;
    if (typeof this.config.target === "string") {
      // 如果是选择器字符串
      targetElement = document.querySelector(this.config.target);
    } else if (this.config.target instanceof HTMLElement) {
      // 如果是DOM元素
      targetElement = this.config.target;
    }

    if (targetElement) {
      // 清空目标元素并添加Switch
      targetElement.innerHTML = "";
      targetElement.appendChild(this.switchElement);
    }
  }

  /**
   * 应用样式
   */
  applyStyle() {
    const { checkedColor, uncheckedColor, checkedText, uncheckedText } =
      this.config.style;

    // 设置背景色
    this.switchElement.style.backgroundColor = this.checked
      ? checkedColor
      : uncheckedColor;

    // 设置文字
    this.innerElement.textContent = this.checked ? checkedText : uncheckedText;

    // 更新选中状态类
    if (this.checked) {
      this.switchElement.classList.add("ng-switch-checked");
    } else {
      this.switchElement.classList.remove("ng-switch-checked");
    }
  }

  /**
   * 更新大小
   */
  updateSize() {
    if (this.config.size === "small") {
      this.switchElement.classList.add("ng-switch-small");
    } else {
      this.switchElement.classList.remove("ng-switch-small");
    }
  }

  /**
   * 更新禁用状态
   */
  updateDisabledState() {
    if (this.disabled) {
      this.switchElement.classList.add("ng-switch-disabled");
      this.switchElement.style.cursor = "not-allowed";
      this.switchElement.setAttribute("tabindex", "-1");
    } else {
      this.switchElement.classList.remove("ng-switch-disabled");
      this.switchElement.style.cursor = "pointer";
      this.switchElement.setAttribute("tabindex", "0");
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (this.disabled) return;

    // 点击切换
    this.switchElement.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // 键盘支持（空格和回车）
    this.switchElement.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * 切换开关状态
   * @param {boolean} checked - 可选，直接设置状态
   */
  toggle(checked = null) {
    if (this.disabled) return;

    // 如果传入了checked参数，直接设置
    if (checked !== null) {
      this.checked = checked;
    } else {
      // 否则切换状态
      this.checked = !this.checked;
    }

    // 更新DOM
    this.switchElement.setAttribute("aria-checked", this.checked);
    this.applyStyle();

    // 触发回调
    if (typeof this.config.onChange === "function") {
      this.config.onChange(this.checked);
    }

    return this.checked;
  }

  /**
   * 设置禁用状态
   * @param {boolean} disabled - 是否禁用
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    this.updateDisabledState();

    // 重新绑定或解绑事件
    if (disabled) {
      // 移除事件监听（简化处理，实际应移除具体监听器）
      const newElement = this.switchElement.cloneNode(true);
      this.switchElement.parentNode.replaceChild(
        newElement,
        this.switchElement,
      );
      this.switchElement = newElement;
    } else {
      this.bindEvents();
    }
  }

  /**
   * 设置大小
   * @param {string} size - 'small' 或 'default'
   */
  setSize(size) {
    if (size !== "small" && size !== "default") {
      console.warn('NgSwitch: size参数应为 "small" 或 "default"');
      return;
    }

    this.config.size = size;
    this.updateSize();
  }

  /**
   * 更新样式配置
   * @param {Object} style - 样式配置
   */
  setStyle(style) {
    this.config.style = { ...this.config.style, ...style };
    this.applyStyle();
  }

  /**
   * 获取当前状态
   * @returns {boolean} 当前开关状态
   */
  getChecked() {
    return this.checked;
  }

  /**
   * 获取DOM元素
   * @returns {HTMLElement} Switch DOM元素
   */
  getElement() {
    return this.switchElement;
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.switchElement && this.switchElement.parentNode) {
      this.switchElement.parentNode.removeChild(this.switchElement);
    }
  }

  /**
   * 显示加载状态
   * @param {boolean} loading - 是否显示加载状态
   */
  setLoading(loading) {
    if (loading) {
      this.switchElement.classList.add("ng-switch-loading");
      this.setDisabled(true);
    } else {
      this.switchElement.classList.remove("ng-switch-loading");
      this.setDisabled(false);
    }
  }
}

// ============================
// 工具函数：通过选择器初始化Switch
// ============================

/**
 * 通过选择器初始化多个Switch
 * @param {string} selector - 选择器
 * @param {Object} options - Switch配置
 * @returns {Array} 返回Switch实例数组
 */
function initSwitchesBySelector(selector, options = {}) {
  const elements = document.querySelectorAll(selector);
  const switches = [];

  elements.forEach((element) => {
    const switchInstance = new NgSwitch({
      target: element,
      ...options,
    });
    switches.push(switchInstance);
  });

  return switches;
}
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = { NgSwitch, initSwitchesBySelector };
} else {
  window.NgSwitch = NgSwitch;
  window.initSwitchesBySelector = initSwitchesBySelector;
}
