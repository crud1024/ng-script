/**
 * NG-Slider 滑动输入条组件
 * 仿 Ant Design Slider 的纯 JavaScript 实现
 * 版本：1.0.11 (可配置最大节点数版)
 */

(function () {
  "use strict";

  // 创建并注入样式
  const styleElement = document.createElement("style");
  styleElement.textContent = `
/* NG-Slider 组件样式 */
.ng-slider {
    position: relative;
    width: 100%;
    height: 12px;
    margin: 10px 0;
    padding: 4px 0;
    cursor: pointer;
    touch-action: none;
    box-sizing: border-box;
    isolation: isolate; /* 创建新的层叠上下文 */
}

.ng-slider-vertical {
    width: 12px;
    height: 200px;
    margin: 0 10px;
    padding: 0 4px;
    display: inline-block;
}

.ng-slider-disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.ng-slider-disabled .ng-slider-track,
.ng-slider-disabled .ng-slider-handle {
    cursor: not-allowed;
}

.ng-slider-readonly .ng-slider-handle {
    cursor: default;
}

/* 轨道 */
.ng-slider-rail {
    position: absolute;
    width: 100%;
    height: 4px;
    background-color: #f5f5f5;
    border-radius: 2px;
    transition: background-color 0.3s;
    top: 50%;
    transform: translateY(-50%);
}

.ng-slider-vertical .ng-slider-rail {
    width: 4px;
    height: 100%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
}

.ng-slider:hover .ng-slider-rail {
    background-color: #e1e1e1;
}

/* 选中轨道 */
.ng-slider-track {
    position: absolute;
    height: 4px;
    background-color: #1890ff;
    border-radius: 2px;
    transition: background-color 0.3s, width 0.3s, height 0.3s, left 0.3s, top 0.3s;
    top: 50%;
    transform: translateY(-50%);
}

.ng-slider-vertical .ng-slider-track {
    width: 4px;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
}

.ng-slider:hover .ng-slider-track {
    background-color: #40a9ff;
}

/* 滑块手柄 */
.ng-slider-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    background-color: #fff;
    border: 2px solid #1890ff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: grab;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    z-index: 5; /* 提高z-index */
    top: 50%;
    transform: translate(-50%, -50%);
}

.ng-slider-vertical .ng-slider-handle {
    left: 50%;
    top: auto;
    transform: translate(-50%, 50%);
}

.ng-slider-handle:focus {
    outline: none;
    border-color: #40a9ff;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

.ng-slider-handle:hover {
    border-color: #40a9ff;
    transform: translate(-50%, -50%) scale(1.2);
}

.ng-slider-vertical .ng-slider-handle:hover {
    transform: translate(-50%, 50%) scale(1.2);
}

.ng-slider-handle:active {
    cursor: grabbing;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 优化Tooltip定位 */
.ng-slider-tooltip {
    position: absolute;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 9999; /* 更高的z-index避免被遮盖 */
    pointer-events: none;
    transform: none !important; /* 避免transform干扰 */
    top: 0;
    left: 0;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

.ng-slider-tooltip-open {
    visibility: visible;
    opacity: 1;
}

.ng-slider-tooltip-hidden {
    visibility: hidden !important;
    opacity: 0 !important;
}

.ng-slider-tooltip-content {
    position: relative;
    padding: 6px 10px;
    background-color: rgba(0, 0, 0, 0.95);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.5;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 20px;
    text-align: center;
    z-index: 10000;
}

/* Tooltip箭头样式 - 修复后 */
.ng-slider-tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    z-index: 10001;
}

/* 水平滑块Tooltip箭头 - 在下方 */
.ng-slider:not(.ng-slider-vertical) .ng-slider-tooltip-arrow {
    bottom: -6px;
    left: 50%;
    margin-left: -6px;
    border-width: 6px 6px 0;
    border-color: rgba(0, 0, 0, 0.95) transparent transparent transparent;
}

/* 垂直滑块Tooltip箭头 - 在左侧 */
.ng-slider-vertical .ng-slider-tooltip-arrow {
    left: -6px;
    top: 50%;
    margin-top: -6px;
    border-width: 6px 6px 6px 0;
    border-color: transparent rgba(0, 0, 0, 0.95) transparent transparent;
}

/* 标注 */
.ng-slider-marks {
    position: absolute;
    top: 14px;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.ng-slider-vertical .ng-slider-marks {
    top: 0;
    left: 14px;
    width: 100%;
    height: 100%;
}

.ng-slider-mark {
    position: absolute;
    z-index: 1;
}

.ng-slider-mark-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #fff;
    border: 2px solid #f5f5f5;
    border-radius: 50%;
    cursor: pointer;
    transform: translate(-50%, -50%);
    pointer-events: auto;
    z-index: 2;
}

.ng-slider-vertical .ng-slider-mark-dot {
    transform: translate(-50%, 50%);
}

.ng-slider-mark-dot-active {
    border-color: #1890ff;
}

.ng-slider-mark-text {
    position: absolute;
    margin-top: 12px;
    color: #999;
    font-size: 12px;
    white-space: nowrap;
    transform: translateX(-50%);
    text-align: center;
    min-width: 30px;
    z-index: 1;
}

.ng-slider-vertical .ng-slider-mark-text {
    margin-top: 0;
    margin-left: 12px;
    transform: translateY(50%);
}

/* 输入框 */
.ng-slider-input-container {
    display: inline-block;
    margin-left: 10px;
    vertical-align: middle;
}

.ng-slider-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.3s;
}

.ng-slider-input:focus {
    border-color: #1890ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 动态按钮 - 修改为水平排列 */
.ng-slider-dynamic-buttons {
    display: inline-flex;
    gap: 8px;
    margin-left: 10px;
    vertical-align: middle;
}

.ng-slider-add-point,
.ng-slider-remove-point {
    width: 30px;
    height: 30px;
    padding: 0;
    background-color: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s, opacity 0.3s;
}

.ng-slider-add-point:hover,
.ng-slider-remove-point:hover {
    background-color: rgba(24, 144, 255, 0.1);
}

.ng-slider-add-point:disabled,
.ng-slider-remove-point:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.ng-slider-add-point:disabled:hover,
.ng-slider-remove-point:disabled:hover {
    background-color: transparent;
}

.ng-slider-dynamic-buttons svg {
    width: 30px;
    height: 30px;
}

/* 图标 */
.ng-slider-start-icon,
.ng-slider-end-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.ng-slider-start-icon {
    left: -24px;
}

.ng-slider-end-icon {
    right: -24px;
}

.ng-slider-vertical .ng-slider-start-icon {
    left: 50%;
    top: -24px;
    transform: translateX(-50%);
}

.ng-slider-vertical .ng-slider-end-icon {
    left: 50%;
    bottom: -24px;
    top: auto;
    transform: translateX(-50%);
}

/* 滑块图标样式 */
.ng-slider-start-icon svg,
.ng-slider-end-icon svg {
    width: 16px;
    height: 16px;
}

/* 反向样式 */
.ng-slider-reverse .ng-slider-track {
    background-color: #ff4d4f;
}

.ng-slider-reverse .ng-slider-handle {
    border-color: #ff4d4f;
}

.ng-slider-reverse .ng-slider-handle:focus {
    border-color: #ff7875;
}

.ng-slider-reverse .ng-slider-handle:hover {
    border-color: #ff7875;
}

.ng-slider-reverse .ng-slider-mark-dot-active {
    border-color: #ff4d4f;
}

/* 可拖拽轨道 */
.ng-slider-track-draggable {
    cursor: move;
}

/* 多点滑块 */
.ng-slider-handle-multiple {
    z-index: 5;
}

/* 工具类 */
.ng-slider-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
}

/* 动态滑块容器 */
.ng-slider-dynamic-container {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
}

.ng-slider-dynamic-container .ng-slider {
    flex: 1;
    margin: 0;
}

/* 隐藏原有元素的样式 */
.ng-slider-original-element {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
}
`;

  document.head.appendChild(styleElement);

  // SVG图标定义
  const addIconSVG =
    '<svg t="1768271991434" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4315" width="30" height="30"><path d="M848 232c0 30.928-25.072 56-56 56s-56-25.072-56-56 25.072-56 56-56 56 25.072 56 56z m64 0c0 66.274-53.726 120-120 120-50.802 0-94.232-31.569-111.74-76.16-62.022 13.36-120 37.624-171.825 70.685C517.1 363.116 522 381.986 522 402c0 66.274-53.726 120-120 120-20.014 0-38.883-4.9-55.475-13.565-33.061 51.826-57.325 109.803-70.685 171.825C320.431 697.769 352 741.198 352 792c0 66.274-53.726 120-120 120s-120-53.726-120-120c0-59.401 43.16-108.721 99.831-118.312 15.478-76.287 45.613-147.241 87.34-209.797C288.271 445.82 282 424.642 282 402c0-66.274 53.726-120 120-120 22.643 0 43.82 6.271 61.891 17.171 62.557-41.727 133.511-71.863 209.797-87.34C683.279 155.16 732.599 112 792 112c66.274 0 120 53.726 120 120zM232 848c30.928 0 56-25.072 56-56s-25.072-56-56-56-56 25.072-56 56 25.072 56 56 56z m564-272c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v108H624c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h108v108c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V748h108c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H796V576z" fill="#1296db" p-id="4316"></path></svg>';

  const removeIconSVG =
    '<svg t="1768272056233" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5479" width="30" height="30"><path d="M848 232c0 30.928-25.072 56-56 56s-56-25.072-56-56 25.072-56 56-56 56 25.072 56 56z m64 0c0 66.274-53.726 120-120 120-50.802 0-94.232-31.569-111.74-76.16-62.022 13.36-120 37.624-171.825 70.685C517.1 363.116 522 381.986 522 402c0 66.274-53.726 120-120 120-20.014 0-38.883-4.9-55.475-13.565-33.061 51.826-57.325 109.803-70.685 171.825C320.431 697.769 352 741.198 352 792c0 66.274-53.726 120-120 120s-120-53.726-120-120c0-59.401 43.16-108.721 99.831-118.312 15.478-76.287 45.613-147.241 87.34-209.797C288.271 445.82 282 424.642 282 402c0-66.274 53.726-120 120-120 22.643 0 43.82 6.271 61.891 17.171 62.557-41.727 133.511-71.863 209.797-87.34C683.279 155.16 732.599 112 792 112c66.274 0 120 53.726 120 120zM232 848c30.928 0 56-25.072 56-56s-25.072-56-56-56-56 25.072-56 56 25.072 56 56 56z m392-164h280c4.4 0 8 3.6 8 8v48c0 4.4-3.6 8-8 8H624c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8z" fill="#1296db" p-id="5480"></path></svg>';
  /**
   * NG-Slider 滑动输入条组件
   * @class
   */
  class NGSlider {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
      // 默认配置
      this.config = {
        container: null,
        value: undefined,
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
        range: false,
        disabled: false,
        marks: null,
        included: true,
        vertical: false,
        reverse: false,
        tooltip: {
          formatter: (value) => value,
          open: undefined,
        },
        rangeConfig: {
          draggableTrack: false,
        },
        points: null,
        dynamicPoints: false,
        dynamicPointsConfig: {
          maxPoints: 5, // 添加最大节点数配置
          minPoints: null, // 最小节点数（null表示自动计算：range为2，非range为1）
        },
        icons: null,
        showInput: false,
        preserveOriginal: true,
        onChange: null,
        onChangeComplete: null,
        onFocus: null,
        onBlur: null,
        onKeyDown: null,
        styles: {},
        ...options,
      };

      // 合并dynamicPointsConfig配置
      if (options.dynamicPointsConfig) {
        this.config.dynamicPointsConfig = {
          ...this.config.dynamicPointsConfig,
          ...options.dynamicPointsConfig,
        };
      }

      // 内部状态
      this.state = {
        value:
          this.config.value !== undefined
            ? this.config.value
            : this.config.defaultValue,
        activeHandle: null,
        isDragging: false,
        tooltipVisible: false,
        points: this.config.points || [],
        isTrackDragging: false,
        tooltipMeasurements: {}, // 存储tooltip测量数据
      };

      // DOM元素引用
      this.elements = {
        container: null,
        slider: null,
        rail: null,
        track: null,
        handles: [],
        tooltips: [],
        marksContainer: null,
        input: null,
        originalElements: [],
        wrapper: null,
        dynamicButtons: null,
        dynamicContainer: null,
      };

      // 绑定方法上下文
      this.handleDrag = this.handleDrag.bind(this);
      this.stopDrag = this.stopDrag.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.updateTooltipPosition = this.updateTooltipPosition.bind(this);

      // 初始化
      this.init();
    }

    /**
     * 初始化组件
     */
    init() {
      // 获取容器元素
      this.elements.container =
        typeof this.config.container === "string"
          ? document.querySelector(this.config.container)
          : this.config.container;

      if (!this.elements.container) {
        console.error("容器元素未找到");
        return;
      }

      // 保存原始元素状态
      if (this.config.preserveOriginal) {
        this.preserveOriginalElements();
      }

      // 创建Slider主元素
      this.createSlider();

      // 渲染组件
      this.render();

      // 绑定事件
      this.bindEvents();
    }

    /**
     * 保存并隐藏容器中的原始元素
     */
    preserveOriginalElements() {
      const children = Array.from(this.elements.container.children);

      children.forEach((child) => {
        if (
          !child.classList.contains("ng-slider") &&
          !child.classList.contains("ng-slider-wrapper") &&
          !child.classList.contains("ng-slider-original-element") &&
          !child.classList.contains("ng-slider-dynamic-container")
        ) {
          const originalInfo = {
            element: child,
            originalClasses: Array.from(child.classList),
            originalStyle: child.getAttribute("style") || "",
            originalParent: child.parentNode,
            originalNextSibling: child.nextSibling,
          };

          child.classList.add("ng-slider-original-element");
          this.elements.originalElements.push(originalInfo);
        }
      });
    }

    /**
     * 恢复原始元素显示
     */
    restoreOriginalElements() {
      this.elements.originalElements.forEach((original) => {
        const { element, originalClasses, originalStyle } = original;

        element.classList.remove("ng-slider-original-element");
        element.className = "";
        originalClasses.forEach((className) => {
          if (!className.includes("ng-slider")) {
            element.classList.add(className);
          }
        });

        if (originalStyle) {
          element.setAttribute("style", originalStyle);
        } else {
          element.removeAttribute("style");
        }

        if (element.parentNode !== original.originalParent) {
          original.originalParent.insertBefore(
            element,
            original.originalNextSibling
          );
        }
      });

      this.elements.originalElements = [];
    }

    /**
     * 获取最大节点数
     */
    getMaxPoints() {
      return this.config.dynamicPointsConfig.maxPoints;
    }

    /**
     * 获取最小节点数
     */
    getMinPoints() {
      if (this.config.dynamicPointsConfig.minPoints !== null) {
        return this.config.dynamicPointsConfig.minPoints;
      }
      return this.config.range ? 2 : 1;
    }

    /**
     * 创建Slider主元素
     */
    createSlider() {
      const existingSlider =
        this.elements.container.querySelector(".ng-slider");
      if (existingSlider) {
        existingSlider.remove();
      }

      this.elements.slider = document.createElement("div");
      this.elements.slider.className = "ng-slider";

      if (this.config.vertical) {
        this.elements.slider.classList.add("ng-slider-vertical");
      }

      if (this.config.disabled) {
        this.elements.slider.classList.add("ng-slider-disabled");
      }

      if (this.config.reverse) {
        this.elements.slider.classList.add("ng-slider-reverse");
      }

      Object.keys(this.config.styles).forEach((key) => {
        this.elements.slider.style[key] = this.config.styles[key];
      });

      // 设置高z-index
      this.elements.slider.style.zIndex = "10";

      // 如果配置了图标，添加到slider
      if (this.config.icons) {
        this.addIcons();
      }
    }

    /**
     * 添加图标 - 修复版本
     */
    addIcons() {
      const { start, end } = this.config.icons;

      if (start) {
        const startIcon = document.createElement("div");
        startIcon.className = "ng-slider-start-icon";

        // 直接设置innerHTML，因为传入的已经是SVG字符串
        startIcon.innerHTML = start;

        this.elements.slider.appendChild(startIcon);
      }

      if (end) {
        const endIcon = document.createElement("div");
        endIcon.className = "ng-slider-end-icon";

        // 直接设置innerHTML
        endIcon.innerHTML = end;

        this.elements.slider.appendChild(endIcon);
      }
    }

    /**
     * 渲染组件 - 修复动态按钮问题
     */
    render() {
      // 先清空slider内部
      this.elements.slider.innerHTML = "";

      this.createRail();
      this.createTrack();
      this.createHandles();
      this.createTooltips();

      if (this.config.marks) {
        this.createMarks();
      }

      // 处理动态点滑块的特殊布局
      if (this.config.dynamicPoints) {
        this.createDynamicLayout();
      } else if (this.config.showInput) {
        this.createInputLayout();
      } else {
        // 普通滑块直接添加到容器
        this.elements.container.appendChild(this.elements.slider);
      }
    }

    /**
     * 创建动态点滑块布局
     */
    createDynamicLayout() {
      // 如果动态容器不存在，创建它
      if (!this.elements.dynamicContainer) {
        this.elements.dynamicContainer = document.createElement("div");
        this.elements.dynamicContainer.className =
          "ng-slider-dynamic-container";

        // 将slider添加到容器
        this.elements.dynamicContainer.appendChild(this.elements.slider);

        // 创建动态按钮
        this.createDynamicButtons();

        // 将整个容器添加到原始容器
        this.elements.container.appendChild(this.elements.dynamicContainer);
      } else {
        // 动态容器已存在，只更新slider内容
        // 确保slider在动态容器中
        if (
          this.elements.slider.parentNode !== this.elements.dynamicContainer
        ) {
          this.elements.dynamicContainer.insertBefore(
            this.elements.slider,
            this.elements.dynamicButtons
          );
        }
      }
    }

    /**
     * 创建带输入框的布局
     */
    createInputLayout() {
      if (!this.elements.wrapper) {
        this.elements.wrapper = document.createElement("div");
        this.elements.wrapper.className = "ng-slider-wrapper";
        this.elements.container.appendChild(this.elements.wrapper);
      }

      // 确保slider在wrapper中
      if (this.elements.slider.parentNode !== this.elements.wrapper) {
        this.elements.wrapper.insertBefore(
          this.elements.slider,
          this.elements.input ? this.elements.input.parentNode : null
        );
      }

      // 创建或更新输入框
      if (!this.elements.input) {
        const inputContainer = document.createElement("div");
        inputContainer.className = "ng-slider-input-container";

        this.elements.input = document.createElement("input");
        this.elements.input.className = "ng-slider-input";
        this.elements.input.type = "number";
        this.elements.input.min = this.config.min;
        this.elements.input.max = this.config.max;
        this.elements.input.step = this.config.step || "any";

        if (Array.isArray(this.state.value)) {
          this.elements.input.value = this.state.value[0];
        } else {
          this.elements.input.value = this.state.value;
        }

        inputContainer.appendChild(this.elements.input);
        this.elements.wrapper.appendChild(inputContainer);
      } else {
        // 更新输入框值
        if (Array.isArray(this.state.value)) {
          this.elements.input.value = this.state.value[0];
        } else {
          this.elements.input.value = this.state.value;
        }
      }
    }

    /**
     * 创建轨道背景
     */
    createRail() {
      this.elements.rail = document.createElement("div");
      this.elements.rail.className = "ng-slider-rail";
      this.elements.slider.appendChild(this.elements.rail);
    }

    /**
     * 创建选中轨道
     */
    createTrack() {
      this.elements.track = document.createElement("div");
      this.elements.track.className = "ng-slider-track";

      if (this.config.range && this.config.rangeConfig.draggableTrack) {
        this.elements.track.classList.add("ng-slider-track-draggable");
      }

      this.updateTrackPosition();
      this.elements.slider.appendChild(this.elements.track);
    }

    /**
     * 更新轨道位置
     */
    updateTrackPosition() {
      if (!this.elements.track) return;

      if (Array.isArray(this.state.value)) {
        const min = Math.min(...this.state.value);
        const max = Math.max(...this.state.value);

        if (this.config.vertical) {
          const height =
            ((max - min) / (this.config.max - this.config.min)) * 100;
          const position =
            ((min - this.config.min) / (this.config.max - this.config.min)) *
            100;

          if (this.config.reverse) {
            this.elements.track.style.bottom = `${position}%`;
            this.elements.track.style.height = `${height}%`;
          } else {
            this.elements.track.style.top = `${position}%`;
            this.elements.track.style.height = `${height}%`;
          }
        } else {
          const width =
            ((max - min) / (this.config.max - this.config.min)) * 100;
          const position =
            ((min - this.config.min) / (this.config.max - this.config.min)) *
            100;

          if (this.config.reverse) {
            this.elements.track.style.right = `${position}%`;
            this.elements.track.style.width = `${width}%`;
          } else {
            this.elements.track.style.left = `${position}%`;
            this.elements.track.style.width = `${width}%`;
          }
        }
      } else {
        if (this.config.vertical) {
          const height =
            (this.state.value / (this.config.max - this.config.min)) * 100;

          if (this.config.reverse) {
            this.elements.track.style.bottom = "0";
            this.elements.track.style.height = `${height}%`;
          } else {
            this.elements.track.style.top = "0";
            this.elements.track.style.height = `${height}%`;
          }
        } else {
          const width =
            (this.state.value / (this.config.max - this.config.min)) * 100;

          if (this.config.reverse) {
            this.elements.track.style.right = "0";
            this.elements.track.style.width = `${width}%`;
          } else {
            this.elements.track.style.left = "0";
            this.elements.track.style.width = `${width}%`;
          }
        }
      }
    }

    /**
     * 创建滑块
     */
    createHandles() {
      this.elements.handles = [];

      const values = Array.isArray(this.state.value)
        ? this.state.value
        : [this.state.value];

      values.forEach((value, index) => {
        const handle = document.createElement("div");
        handle.className = "ng-slider-handle";
        if (values.length > 1) {
          handle.classList.add("ng-slider-handle-multiple");
        }
        handle.dataset.index = index;
        handle.setAttribute("tabindex", "0");
        handle.setAttribute("role", "slider");
        handle.setAttribute("aria-valuemin", this.config.min);
        handle.setAttribute("aria-valuemax", this.config.max);
        handle.setAttribute("aria-valuenow", value);
        handle.setAttribute(
          "aria-orientation",
          this.config.vertical ? "vertical" : "horizontal"
        );

        this.updateHandlePosition(handle, value);
        this.elements.slider.appendChild(handle);
        this.elements.handles.push(handle);
      });
    }

    /**
     * 更新滑块位置
     */
    updateHandlePosition(handle, value) {
      const position =
        ((value - this.config.min) / (this.config.max - this.config.min)) * 100;

      if (this.config.vertical) {
        if (this.config.reverse) {
          handle.style.bottom = `${position}%`;
          handle.style.top = "auto";
        } else {
          handle.style.top = `${position}%`;
          handle.style.bottom = "auto";
        }
      } else {
        if (this.config.reverse) {
          handle.style.right = `${position}%`;
          handle.style.left = "auto";
        } else {
          handle.style.left = `${position}%`;
          handle.style.right = "auto";
        }
      }

      handle.setAttribute("aria-valuenow", value);
    }

    /**
     * 测量Tooltip尺寸
     */
    measureTooltip(index) {
      const tooltip = this.elements.tooltips[index];
      if (!tooltip) return { width: 40, height: 30 };

      // 如果已经测量过，直接返回缓存
      if (this.state.tooltipMeasurements[index]) {
        return this.state.tooltipMeasurements[index];
      }

      // 临时显示tooltip以测量尺寸
      const originalDisplay = tooltip.style.display;
      const originalVisibility = tooltip.style.visibility;

      tooltip.style.display = "block";
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";
      tooltip.classList.add("ng-slider-tooltip-open");

      const tooltipContent = tooltip.querySelector(
        ".ng-slider-tooltip-content"
      );
      if (!tooltipContent) {
        tooltip.style.display = originalDisplay;
        tooltip.style.visibility = originalVisibility;
        tooltip.classList.remove("ng-slider-tooltip-open");
        return { width: 40, height: 30 };
      }

      const rect = tooltipContent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // 恢复原始状态
      tooltip.style.display = originalDisplay;
      tooltip.style.visibility = originalVisibility;
      tooltip.style.opacity = "";
      tooltip.classList.remove("ng-slider-tooltip-open");

      // 缓存测量结果
      this.state.tooltipMeasurements[index] = { width, height };

      return { width, height };
    }

    /**
     * 创建提示框 - 优化版本
     */
    createTooltips() {
      this.elements.tooltips = [];
      this.state.tooltipMeasurements = {};

      const values = Array.isArray(this.state.value)
        ? this.state.value
        : [this.state.value];

      values.forEach((value, index) => {
        const tooltip = document.createElement("div");
        tooltip.className = "ng-slider-tooltip";

        // 格式化显示内容
        const displayValue = this.config.tooltip.formatter
          ? this.config.tooltip.formatter(value)
          : value;

        const tooltipContent = document.createElement("div");
        tooltipContent.className = "ng-slider-tooltip-content";
        tooltipContent.textContent = displayValue;

        // 创建箭头元素
        const arrow = document.createElement("div");
        arrow.className = "ng-slider-tooltip-arrow";
        tooltipContent.appendChild(arrow);

        tooltip.appendChild(tooltipContent);

        // 控制显示状态
        if (this.config.tooltip.open === true) {
          tooltip.classList.add("ng-slider-tooltip-open");
        } else if (this.config.tooltip.open === false) {
          tooltip.classList.add("ng-slider-tooltip-hidden");
        }

        // 设置高z-index
        tooltip.style.zIndex = "9999";

        this.elements.slider.appendChild(tooltip);
        this.elements.tooltips.push(tooltip);

        // 延迟更新位置以确保DOM已渲染
        setTimeout(() => {
          this.updateTooltipPosition(tooltip, value, index);
        }, 10);
      });
    }

    /**
     * 更新提示框位置 - 优化后的精确定位方法
     */
    updateTooltipPosition(tooltip, value, index) {
      if (!tooltip || !this.elements.handles[index]) return;

      const handle = this.elements.handles[index];
      const sliderRect = this.elements.slider.getBoundingClientRect();

      // 获取Tooltip内容尺寸
      const measurements = this.measureTooltip(index);
      const tooltipWidth = measurements.width;
      const tooltipHeight = measurements.height;

      // 获取手柄中心位置（相对于slider）
      const handleRect = handle.getBoundingClientRect();
      const handleCenterX =
        handleRect.left + handleRect.width / 2 - sliderRect.left;
      const handleCenterY =
        handleRect.top + handleRect.height / 2 - sliderRect.top;

      // 确保箭头元素存在
      let arrow = tooltip.querySelector(".ng-slider-tooltip-arrow");
      if (!arrow) {
        arrow = document.createElement("div");
        arrow.className = "ng-slider-tooltip-arrow";
        const tooltipContent = tooltip.querySelector(
          ".ng-slider-tooltip-content"
        );
        if (tooltipContent) {
          tooltipContent.appendChild(arrow);
        }
      }

      if (this.config.vertical) {
        // 垂直滑块：Tooltip显示在手柄右侧
        const tooltipLeft = sliderRect.width + 8; // 右侧8px间距
        const tooltipTop = handleCenterY - tooltipHeight / 2;

        // 设置Tooltip位置
        tooltip.style.left = `${tooltipLeft}px`;
        tooltip.style.top = `${tooltipTop}px`;

        // 确保箭头在正确位置
        if (arrow) {
          arrow.style.left = "-6px";
          arrow.style.top = "50%";
          arrow.style.marginTop = "-6px";
          arrow.style.borderWidth = "6px 6px 6px 0";
          arrow.style.borderColor =
            "transparent rgba(0, 0, 0, 0.95) transparent transparent";
        }

        // 边界检查
        if (tooltipTop + tooltipHeight > sliderRect.height) {
          tooltip.style.top = `${sliderRect.height - tooltipHeight}px`;
        }
        if (tooltipTop < 0) {
          tooltip.style.top = "0px";
        }
      } else {
        // 水平滑块：Tooltip显示在手柄上方
        const tooltipLeft = handleCenterX - tooltipWidth / 2;
        const tooltipTop = -tooltipHeight - 6; // 上方6px间距

        // 设置Tooltip位置
        tooltip.style.left = `${tooltipLeft}px`;
        tooltip.style.top = `${tooltipTop}px`;

        // 确保箭头在正确位置
        if (arrow) {
          arrow.style.bottom = "-6px";
          arrow.style.left = "50%";
          arrow.style.marginLeft = "-6px";
          arrow.style.borderWidth = "6px 6px 0";
          arrow.style.borderColor =
            "rgba(0, 0, 0, 0.95) transparent transparent transparent";
        }

        // 边界检查
        if (tooltipLeft < 0) {
          tooltip.style.left = "0px";
          // 调整箭头位置
          if (arrow) {
            const arrowOffset = handleCenterX - 6;
            arrow.style.left = `${Math.max(6, arrowOffset)}px`;
            arrow.style.marginLeft = "0";
          }
        }
        if (tooltipLeft + tooltipWidth > sliderRect.width) {
          tooltip.style.left = `${sliderRect.width - tooltipWidth}px`;
          // 调整箭头位置
          if (arrow) {
            const arrowOffset =
              handleCenterX - (sliderRect.width - tooltipWidth) - 6;
            arrow.style.left = `${Math.min(tooltipWidth - 6, arrowOffset)}px`;
            arrow.style.marginLeft = "0";
          }
        }
      }

      // 确保tooltip在最上层
      tooltip.style.zIndex = "9999";
    }

    /**
     * 创建标注
     */
    createMarks() {
      this.elements.marksContainer = document.createElement("div");
      this.elements.marksContainer.className = "ng-slider-marks";

      const sortedMarks = Object.keys(this.config.marks)
        .map(Number)
        .sort((a, b) => a - b);

      sortedMarks.forEach((markValue) => {
        const markLabel = this.config.marks[markValue];

        const mark = document.createElement("div");
        mark.className = "ng-slider-mark";

        const position =
          ((markValue - this.config.min) /
            (this.config.max - this.config.min)) *
          100;

        if (this.config.vertical) {
          if (this.config.reverse) {
            mark.style.bottom = `${position}%`;
            mark.style.top = "auto";
          } else {
            mark.style.top = `${position}%`;
            mark.style.bottom = "auto";
          }
        } else {
          if (this.config.reverse) {
            mark.style.right = `${position}%`;
            mark.style.left = "auto";
          } else {
            mark.style.left = `${position}%`;
            mark.style.right = "auto";
          }
        }

        const dot = document.createElement("div");
        dot.className = "ng-slider-mark-dot";
        dot.dataset.value = markValue;

        if (this.config.included) {
          const values = Array.isArray(this.state.value)
            ? this.state.value
            : [this.state.value];
          const min = Math.min(...values);
          const max = Math.max(...values);

          if (markValue >= min && markValue <= max) {
            dot.classList.add("ng-slider-mark-dot-active");
          }
        }

        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          this.handleMarkClick(markValue);
        });

        mark.appendChild(dot);

        if (markLabel) {
          const label = document.createElement("span");
          label.className = "ng-slider-mark-text";
          label.textContent = markLabel;
          mark.appendChild(label);
        }

        this.elements.marksContainer.appendChild(mark);
      });

      this.elements.slider.appendChild(this.elements.marksContainer);
    }

    /**
     * 创建动态节点按钮 - 修改为SVG图标按钮
     */
    createDynamicButtons() {
      // 如果按钮容器不存在，创建它
      if (!this.elements.dynamicButtons) {
        this.elements.dynamicButtons = document.createElement("div");
        this.elements.dynamicButtons.className = "ng-slider-dynamic-buttons";

        // 将按钮容器添加到动态容器
        if (this.elements.dynamicContainer) {
          this.elements.dynamicContainer.appendChild(
            this.elements.dynamicButtons
          );
        }
      }

      // 清空按钮容器内容
      this.elements.dynamicButtons.innerHTML = "";

      // 添加按钮
      const addButton = document.createElement("button");
      addButton.className = "ng-slider-add-point";
      addButton.innerHTML = addIconSVG;
      addButton.title = "添加节点";

      // 使用可配置的最大点数
      const maxPoints = this.getMaxPoints();
      if (
        Array.isArray(this.state.value) &&
        this.state.value.length >= maxPoints
      ) {
        addButton.disabled = true;
      }

      addButton.addEventListener("click", () => this.addPoint());

      // 删除按钮
      const removeButton = document.createElement("button");
      removeButton.className = "ng-slider-remove-point";
      removeButton.innerHTML = removeIconSVG;
      removeButton.title = "删除节点";

      // 使用可配置的最小点数
      const minPoints = this.getMinPoints();
      if (
        Array.isArray(this.state.value) &&
        this.state.value.length <= minPoints
      ) {
        removeButton.disabled = true;
      }

      removeButton.addEventListener("click", () => this.removePoint());

      this.elements.dynamicButtons.appendChild(addButton);
      this.elements.dynamicButtons.appendChild(removeButton);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      this.unbindEvents();

      this.elements.handles.forEach((handle, index) => {
        handle.addEventListener("mousedown", (e) => this.startDrag(e, index));
        handle.addEventListener("touchstart", (e) => this.startDrag(e, index));

        handle.addEventListener("keydown", (e) => this.handleKeyDown(e, index));
        handle.addEventListener("keyup", (e) => {
          if (this.config.onChangeComplete) {
            this.config.onChangeComplete(this.state.value);
          }
        });

        handle.addEventListener("focus", () => this.handleFocus(index));
        handle.addEventListener("blur", () => this.handleBlur(index));

        // 鼠标悬停显示tooltip
        handle.addEventListener("mouseenter", () => this.showTooltip(index));
        handle.addEventListener("mouseleave", () => {
          if (!this.state.isDragging && this.config.tooltip.open !== true) {
            this.hideTooltip(index);
          }
        });
      });

      if (
        this.config.range &&
        this.config.rangeConfig.draggableTrack &&
        this.elements.track
      ) {
        this.elements.track.addEventListener("mousedown", (e) =>
          this.startTrackDrag(e)
        );
        this.elements.track.addEventListener("touchstart", (e) =>
          this.startTrackDrag(e)
        );
      }

      this.elements.rail.addEventListener("click", (e) =>
        this.handleRailClick(e)
      );

      if (this.elements.input) {
        this.elements.input.addEventListener("change", (e) =>
          this.handleInputChange(e)
        );
        this.elements.input.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            this.handleInputChange(e);
            if (this.config.onChangeComplete) {
              this.config.onChangeComplete(this.state.value);
            }
          }
        });
      }

      // 监听窗口大小变化，重新定位Tooltip
      this.resizeObserver = new ResizeObserver(() => {
        this.updateAllTooltipPositions();
      });

      if (this.elements.container) {
        this.resizeObserver.observe(this.elements.container);
      }

      if (this.elements.slider) {
        this.resizeObserver.observe(this.elements.slider);
      }

      document.addEventListener("mousemove", this.handleDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchmove", this.handleDrag);
      document.addEventListener("touchend", this.stopDrag);
    }

    /**
     * 更新所有Tooltip位置
     */
    updateAllTooltipPositions() {
      const values = Array.isArray(this.state.value)
        ? this.state.value
        : [this.state.value];
      values.forEach((value, index) => {
        if (this.elements.tooltips[index]) {
          this.updateTooltipPosition(
            this.elements.tooltips[index],
            value,
            index
          );
        }
      });
    }

    /**
     * 移除事件监听器
     */
    unbindEvents() {
      document.removeEventListener("mousemove", this.handleDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchmove", this.handleDrag);
      document.removeEventListener("touchend", this.stopDrag);

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }

    /**
     * 开始拖拽
     */
    startDrag(e, index) {
      if (this.config.disabled) return;

      e.preventDefault();
      e.stopPropagation();

      this.state.activeHandle = index;
      this.state.isDragging = true;

      this.showTooltip(index);

      if (this.config.onFocus) {
        this.config.onFocus(this.state.value);
      }
    }

    /**
     * 开始轨道拖拽
     */
    startTrackDrag(e) {
      if (
        this.config.disabled ||
        !Array.isArray(this.state.value) ||
        this.state.value.length < 2
      )
        return;

      e.preventDefault();
      e.stopPropagation();

      this.state.isTrackDragging = true;
      this.state.isDragging = true;
      this.state.trackStartX = e.clientX || e.touches[0].clientX;
      this.state.trackStartY = e.clientY || e.touches[0].clientY;
      this.state.trackStartValues = [...this.state.value];
    }

    /**
     * 处理拖拽
     */
    handleDrag(e) {
      if (!this.state.isDragging || this.config.disabled) return;

      if (this.state.isTrackDragging) {
        this.handleTrackDrag(e);
      } else {
        this.handleHandleDrag(e);
      }
    }

    /**
     * 处理滑块拖拽
     */
    handleHandleDrag(e) {
      const rect = this.elements.slider.getBoundingClientRect();
      let clientX, clientY;

      if (e.type.includes("touch")) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      let percentage = this.calculatePercentage(clientX, clientY, rect);
      let newValue = this.calculateValueFromPercentage(percentage);

      this.updateValue(newValue, this.state.activeHandle);

      // 立即更新Tooltip位置
      if (this.elements.tooltips[this.state.activeHandle]) {
        const displayValue = this.config.tooltip.formatter
          ? this.config.tooltip.formatter(newValue)
          : newValue;

        const tooltipContent = this.elements.tooltips[
          this.state.activeHandle
        ].querySelector(".ng-slider-tooltip-content");
        if (tooltipContent) {
          tooltipContent.textContent = displayValue;
        }

        // 清除缓存，因为内容可能改变了尺寸
        delete this.state.tooltipMeasurements[this.state.activeHandle];

        // 立即更新位置
        this.updateTooltipPosition(
          this.elements.tooltips[this.state.activeHandle],
          newValue,
          this.state.activeHandle
        );
      }

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }
    }

    /**
     * 处理轨道拖拽
     */
    handleTrackDrag(e) {
      const rect = this.elements.slider.getBoundingClientRect();
      let clientX, clientY;

      if (e.type.includes("touch")) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const deltaX = clientX - this.state.trackStartX;
      const deltaY = clientY - this.state.trackStartY;

      let deltaPercentage;
      if (this.config.vertical) {
        deltaPercentage = deltaY / rect.height;
      } else {
        deltaPercentage = deltaX / rect.width;
      }

      if (this.config.reverse) {
        deltaPercentage = -deltaPercentage;
      }

      const valueRange = this.config.max - this.config.min;
      const deltaValue = deltaPercentage * valueRange;

      const newValues = this.state.trackStartValues.map((value) => {
        let newValue = value + deltaValue;

        if (this.config.step !== null) {
          newValue = Math.round(newValue / this.config.step) * this.config.step;
        }

        newValue = Math.min(
          Math.max(newValue, this.config.min),
          this.config.max
        );

        return newValue;
      });

      this.state.value = newValues;
      this.updateUI();

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }
    }

    /**
     * 计算百分比
     */
    calculatePercentage(clientX, clientY, rect) {
      if (this.config.vertical) {
        let position;

        if (this.config.reverse) {
          position = rect.bottom - clientY;
        } else {
          position = clientY - rect.top;
        }

        return Math.min(Math.max(position / rect.height, 0), 1);
      } else {
        let position;

        if (this.config.reverse) {
          position = rect.right - clientX;
        } else {
          position = clientX - rect.left;
        }

        return Math.min(Math.max(position / rect.width, 0), 1);
      }
    }

    /**
     * 根据百分比计算值
     */
    calculateValueFromPercentage(percentage) {
      let newValue =
        this.config.min + percentage * (this.config.max - this.config.min);

      if (this.config.step !== null) {
        newValue = Math.round(newValue / this.config.step) * this.config.step;
      }

      newValue = Math.min(Math.max(newValue, this.config.min), this.config.max);

      if (this.config.marks && this.config.step === null) {
        const marks = Object.keys(this.config.marks).map(Number);
        newValue = marks.reduce((prev, curr) => {
          return Math.abs(curr - newValue) < Math.abs(prev - newValue)
            ? curr
            : prev;
        });
      }

      return newValue;
    }

    /**
     * 停止拖拽
     */
    stopDrag() {
      if (!this.state.isDragging) return;

      const wasDragging = this.state.isDragging;
      this.state.isDragging = false;
      this.state.isTrackDragging = false;
      this.state.activeHandle = null;

      if (this.config.tooltip.open !== true) {
        this.hideTooltips();
      }

      if (wasDragging && this.config.onChangeComplete) {
        this.config.onChangeComplete(this.state.value);
      }
    }

    /**
     * 处理轨道点击
     */
    handleRailClick(e) {
      if (this.config.disabled) return;

      const rect = this.elements.slider.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      if (!clientX && !clientY) return;

      const percentage = this.calculatePercentage(clientX, clientY, rect);
      const newValue = this.calculateValueFromPercentage(percentage);

      if (Array.isArray(this.state.value)) {
        const distances = this.state.value.map((val) =>
          Math.abs(val - newValue)
        );
        const closestIndex = distances.indexOf(Math.min(...distances));
        this.updateValue(newValue, closestIndex);
      } else {
        this.updateValue(newValue);
      }

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }

      if (this.config.onChangeComplete) {
        this.config.onChangeComplete(this.state.value);
      }
    }

    /**
     * 处理标注点击
     */
    handleMarkClick(value) {
      if (this.config.disabled) return;

      if (Array.isArray(this.state.value)) {
        const distances = this.state.value.map((val) => Math.abs(val - value));
        const closestIndex = distances.indexOf(Math.min(...distances));
        this.updateValue(value, closestIndex);
      } else {
        this.updateValue(value);
      }

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }

      if (this.config.onChangeComplete) {
        this.config.onChangeComplete(this.state.value);
      }
    }

    /**
     * 处理键盘事件
     */
    handleKeyDown(e, index) {
      if (this.config.disabled) return;

      if (this.config.onKeyDown) {
        this.config.onKeyDown(e, this.state.value);
      }

      let newValue;
      const currentValue = Array.isArray(this.state.value)
        ? this.state.value[index]
        : this.state.value;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          newValue = currentValue - (this.config.step || 1);
          break;

        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          newValue = currentValue + (this.config.step || 1);
          break;

        case "Home":
          e.preventDefault();
          newValue = this.config.min;
          break;

        case "End":
          e.preventDefault();
          newValue = this.config.max;
          break;

        case "Delete":
        case "Backspace":
          if (
            this.config.dynamicPoints &&
            Array.isArray(this.state.value) &&
            this.state.value.length > 1
          ) {
            e.preventDefault();
            this.removePointAtIndex(index);
          }
          break;

        default:
          return;
      }

      if (newValue !== undefined) {
        newValue = Math.min(
          Math.max(newValue, this.config.min),
          this.config.max
        );
        this.updateValue(newValue, index);

        if (this.config.onChange) {
          this.config.onChange(this.state.value);
        }
      }
    }

    /**
     * 处理输入框变化
     */
    handleInputChange(e) {
      const newValue = Number(e.target.value);

      if (
        !isNaN(newValue) &&
        newValue >= this.config.min &&
        newValue <= this.config.max
      ) {
        this.updateValue(newValue);

        if (this.config.onChange) {
          this.config.onChange(this.state.value);
        }
      }
    }

    /**
     * 处理焦点事件
     */
    handleFocus(index) {
      this.showTooltip(index);

      if (this.config.onFocus) {
        this.config.onFocus(this.state.value);
      }
    }

    /**
     * 处理失去焦点事件
     */
    handleBlur(index) {
      if (this.config.tooltip.open !== true) {
        this.hideTooltip(index);
      }

      if (this.config.onBlur) {
        this.config.onBlur(this.state.value);
      }
    }

    /**
     * 显示提示框
     */
    showTooltips() {
      if (this.config.tooltip.open === false) return;

      this.elements.tooltips.forEach((tooltip, index) => {
        tooltip.classList.add("ng-slider-tooltip-open");
        // 更新位置
        if (this.elements.handles[index]) {
          const value = Array.isArray(this.state.value)
            ? this.state.value[index]
            : this.state.value;
          this.updateTooltipPosition(tooltip, value, index);
        }
      });

      this.state.tooltipVisible = true;
    }

    /**
     * 隐藏提示框
     */
    hideTooltips() {
      if (this.config.tooltip.open === true) return;

      this.elements.tooltips.forEach((tooltip) => {
        tooltip.classList.remove("ng-slider-tooltip-open");
      });

      this.state.tooltipVisible = false;
    }

    /**
     * 显示指定提示框
     */
    showTooltip(index) {
      if (this.config.tooltip.open === false) return;

      if (this.elements.tooltips[index]) {
        this.elements.tooltips[index].classList.add("ng-slider-tooltip-open");
        // 更新位置
        const value = Array.isArray(this.state.value)
          ? this.state.value[index]
          : this.state.value;
        this.updateTooltipPosition(this.elements.tooltips[index], value, index);
      }
    }

    /**
     * 隐藏指定提示框
     */
    hideTooltip(index) {
      if (this.config.tooltip.open === true) return;

      if (this.elements.tooltips[index]) {
        this.elements.tooltips[index].classList.remove(
          "ng-slider-tooltip-open"
        );
      }
    }

    /**
     * 更新UI - 修复动态按钮更新
     */
    updateUI() {
      this.updateTrackPosition();

      const values = Array.isArray(this.state.value)
        ? this.state.value
        : [this.state.value];
      values.forEach((value, index) => {
        if (this.elements.handles[index]) {
          this.updateHandlePosition(this.elements.handles[index], value);
          this.elements.handles[index].setAttribute("aria-valuenow", value);
        }

        if (this.elements.tooltips[index]) {
          const displayValue = this.config.tooltip.formatter
            ? this.config.tooltip.formatter(value)
            : value;

          const tooltipContent = this.elements.tooltips[index].querySelector(
            ".ng-slider-tooltip-content"
          );
          if (tooltipContent) {
            tooltipContent.textContent = displayValue;
          }

          // 清除缓存，重新测量
          delete this.state.tooltipMeasurements[index];

          // 延迟更新Tooltip位置
          setTimeout(() => {
            this.updateTooltipPosition(
              this.elements.tooltips[index],
              value,
              index
            );
          }, 10);
        }
      });

      if (this.elements.input) {
        if (Array.isArray(this.state.value)) {
          this.elements.input.value = this.state.value[0];
        } else {
          this.elements.input.value = this.state.value;
        }
      }

      if (this.elements.marksContainer) {
        const dots = this.elements.marksContainer.querySelectorAll(
          ".ng-slider-mark-dot"
        );
        dots.forEach((dot) => {
          const dotValue = parseFloat(dot.dataset.value);
          const values = Array.isArray(this.state.value)
            ? this.state.value
            : [this.state.value];
          const min = Math.min(...values);
          const max = Math.max(...values);

          if (this.config.included && dotValue >= min && dotValue <= max) {
            dot.classList.add("ng-slider-mark-dot-active");
          } else {
            dot.classList.remove("ng-slider-mark-dot-active");
          }
        });
      }

      // 只更新动态按钮，不重新创建整个容器
      if (this.config.dynamicPoints && this.elements.dynamicButtons) {
        this.updateDynamicButtons();
      }
    }

    /**
     * 更新动态按钮状态
     */
    updateDynamicButtons() {
      if (!this.elements.dynamicButtons) return;

      const addButton = this.elements.dynamicButtons.querySelector(
        ".ng-slider-add-point"
      );
      const removeButton = this.elements.dynamicButtons.querySelector(
        ".ng-slider-remove-point"
      );

      if (addButton) {
        const maxPoints = this.getMaxPoints();
        if (
          Array.isArray(this.state.value) &&
          this.state.value.length >= maxPoints
        ) {
          addButton.disabled = true;
        } else {
          addButton.disabled = false;
        }
      }

      if (removeButton) {
        const minPoints = this.getMinPoints();
        if (
          Array.isArray(this.state.value) &&
          this.state.value.length <= minPoints
        ) {
          removeButton.disabled = true;
        } else {
          removeButton.disabled = false;
        }
      }
    }

    /**
     * 更新值
     */
    updateValue(newValue, handleIndex = 0) {
      let oldValue = this.state.value;

      if (Array.isArray(this.state.value)) {
        const newValues = [...this.state.value];

        if (this.config.range && newValues.length === 2) {
          if (handleIndex === 0) {
            newValue = Math.min(newValue, newValues[1]);
          } else {
            newValue = Math.max(newValue, newValues[0]);
          }
        }

        newValues[handleIndex] = newValue;
        this.state.value = newValues.sort((a, b) => a - b);
      } else {
        this.state.value = newValue;
      }

      this.updateUI();

      return oldValue;
    }

    /**
     * 添加节点 - 修复按钮丢失问题
     */
    addPoint() {
      if (!this.config.dynamicPoints || !Array.isArray(this.state.value))
        return;

      const maxPoints = this.getMaxPoints();
      if (this.state.value.length >= maxPoints) {
        console.warn(`已达到最大节点数：${maxPoints}`);
        return;
      }

      let newValue;
      if (this.state.value.length === 0) {
        newValue = (this.config.min + this.config.max) / 2;
      } else {
        let maxGap = 0;
        let gapStart = this.config.min;

        if (this.state.value[0] - this.config.min > maxGap) {
          maxGap = this.state.value[0] - this.config.min;
          newValue = this.config.min + maxGap / 2;
        }

        for (let i = 0; i < this.state.value.length - 1; i++) {
          const gap = this.state.value[i + 1] - this.state.value[i];
          if (gap > maxGap) {
            maxGap = gap;
            newValue = this.state.value[i] + gap / 2;
          }
        }

        if (
          this.config.max - this.state.value[this.state.value.length - 1] >
          maxGap
        ) {
          maxGap =
            this.config.max - this.state.value[this.state.value.length - 1];
          newValue = this.state.value[this.state.value.length - 1] + maxGap / 2;
        }
      }

      if (this.config.step !== null) {
        newValue = Math.round(newValue / this.config.step) * this.config.step;
      }

      newValue = Math.min(Math.max(newValue, this.config.min), this.config.max);

      this.state.value.push(newValue);
      this.state.value.sort((a, b) => a - b);

      // 只重新渲染slider部分，保留动态按钮
      this.updateSliderOnly();
      this.bindEvents();

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }
    }

    /**
     * 只更新slider部分，保留动态按钮
     */
    updateSliderOnly() {
      // 清空slider内部
      this.elements.slider.innerHTML = "";

      this.createRail();
      this.createTrack();
      this.createHandles();
      this.createTooltips();

      if (this.config.marks) {
        this.createMarks();
      }

      // 更新UI但不重新创建按钮
      this.updateUI();
    }

    /**
     * 删除节点 - 修复按钮丢失问题
     */
    removePoint() {
      if (!this.config.dynamicPoints || !Array.isArray(this.state.value))
        return;

      const minPoints = this.getMinPoints();
      if (this.state.value.length <= minPoints) {
        console.warn(`已达到最小节点数：${minPoints}`);
        return;
      }

      this.state.value.pop();

      // 只重新渲染slider部分，保留动态按钮
      this.updateSliderOnly();
      this.bindEvents();

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }
    }

    /**
     * 删除指定索引的节点 - 修复按钮丢失问题
     */
    removePointAtIndex(index) {
      if (
        !this.config.dynamicPoints ||
        !Array.isArray(this.state.value) ||
        this.state.value.length <= 1
      )
        return;

      const minPoints = this.getMinPoints();
      if (this.state.value.length <= minPoints) {
        console.warn(`已达到最小节点数：${minPoints}`);
        return;
      }

      this.state.value.splice(index, 1);

      // 只重新渲染slider部分，保留动态按钮
      this.updateSliderOnly();
      this.bindEvents();

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }
    }

    /**
     * 获取当前值
     */
    getValue() {
      return this.state.value;
    }

    /**
     * 设置新值
     */
    setValue(value) {
      this.state.value = value;
      this.updateUI();

      if (this.config.onChange) {
        this.config.onChange(this.state.value);
      }
    }

    /**
     * 启用组件
     */
    enable() {
      this.config.disabled = false;
      this.elements.slider.classList.remove("ng-slider-disabled");
    }

    /**
     * 禁用组件
     */
    disable() {
      this.config.disabled = true;
      this.elements.slider.classList.add("ng-slider-disabled");
    }

    /**
     * 设置只读状态
     */
    setReadOnly(readOnly) {
      if (readOnly) {
        this.elements.slider.classList.add("ng-slider-readonly");
      } else {
        this.elements.slider.classList.remove("ng-slider-readonly");
      }
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.render();
      this.bindEvents();
    }

    /**
     * 销毁组件
     */
    destroy() {
      this.unbindEvents();

      if (this.config.preserveOriginal) {
        this.restoreOriginalElements();
      }

      if (this.elements.container) {
        if (this.elements.dynamicContainer) {
          this.elements.dynamicContainer.remove();
        } else if (this.elements.wrapper) {
          this.elements.wrapper.remove();
        } else if (this.elements.slider && this.elements.slider.parentNode) {
          this.elements.slider.parentNode.removeChild(this.elements.slider);
        }
      }
    }
  }

  /**
   * 通用选择器初始化函数
   * @param {string} selector - 选择器
   * @param {Object} options - 默认配置
   * @returns {Array} 初始化的slider实例数组
   */
  function initSliders(selector = ".ng-slider-container", options = {}) {
    const containers = document.querySelectorAll(selector);
    const sliders = [];

    containers.forEach((container) => {
      let dataOptions = {};
      try {
        dataOptions = JSON.parse(container.dataset.sliderOptions || "{}");
      } catch (e) {
        console.warn("Invalid slider options in data attribute", e);
      }

      const sliderOptions = {
        container,
        ...options,
        ...dataOptions,
      };

      const slider = new NGSlider(sliderOptions);
      sliders.push(slider);

      container._ngSlider = slider;
    });

    return sliders;
  }

  window.NGSlider = NGSlider;
  window.initSliders = initSliders;
})();
