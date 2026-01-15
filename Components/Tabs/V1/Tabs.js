/**
 * NgTabs - 纯JavaScript封装的Tabs组件（完全修复版）
 * 修复通过添加按钮新增tab页的关闭按钮显示问题
 */

class NgTabs {
  constructor(container, options = {}) {
    // 验证容器元素
    if (!container) {
      throw new Error("NgTabs: 必须提供容器元素");
    }

    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      throw new Error(`NgTabs: 未找到容器元素 ${container}`);
    }

    // 默认配置
    this.defaultOptions = {
      items: [],
      defaultActiveKey: "0",
      tabPosition: "top",
      type: "line",
      size: "middle",
      centered: false,
      closable: false,
      showCloseButton: true,
      showAddButton: false,
      addButtonPosition: "end",
      // 新增配置：控制新增tab页的关闭按钮显示
      newTabClosable: true, // 新增tab页是否可关闭
      newTabShowClose: true, // 新增tab页是否显示关闭按钮
      indicator: {
        size: "auto",
        align: "center",
      },
      onChange: null,
      onEdit: null,
      destroyOnHide: false,
      animated: true,
      extraContent: null,
      addIcon: "+",
      moreIcon: "⋯",
      style: {},
      className: "",
    };

    // 合并配置
    this.options = this.deepMerge(this.defaultOptions, options);

    // 验证items配置
    if (!Array.isArray(this.options.items)) {
      console.warn("NgTabs: items 必须是一个数组，已自动修正");
      this.options.items = [];
    }

    // 内部状态
    this.activeKey = this.validateActiveKey(this.options.defaultActiveKey);
    this.tabs = [];
    this.inkBar = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.navList = null;
    this.navWrap = null;
    this.addButton = null;
    this.operations = null;
    this.isDestroyed = false;

    // 绑定方法
    this.handleResize = this.handleResize.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.handleTabCloseClick = this.handleTabCloseClick.bind(this);

    // 初始化
    this.init();
  }

  /**
   * 验证激活的key是否有效
   */
  validateActiveKey(key) {
    // 如果items为空，返回默认值
    if (this.options.items.length === 0) {
      return "0";
    }

    // 检查key是否存在于items中
    const keyExists = this.options.items.some((item, index) => {
      const itemKey = item.key || String(index);
      return itemKey === key;
    });

    // 如果key不存在，使用第一个可用标签
    if (!keyExists) {
      const firstItem = this.options.items[0];
      return firstItem.key || "0";
    }

    return key;
  }

  /**
   * 深度合并对象
   */
  deepMerge(target, source) {
    const output = Object.assign({}, target);

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  }

  /**
   * 判断是否为对象
   */
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * 初始化组件
   */
  init() {
    if (this.isDestroyed) {
      console.warn("NgTabs: 组件已被销毁，无法重新初始化");
      return;
    }

    try {
      // 注入样式
      this.injectStyles();

      // 清空容器
      this.container.innerHTML = "";

      // 创建主容器
      this.tabsContainer = this.createElement("div", {
        className:
          `ng-tabs ng-tabs-${this.options.tabPosition} ng-tabs-${this.options.size} ${this.options.className}`.trim(),
        style: this.options.style,
      });

      // 添加卡片样式类
      if (this.options.type === "card") {
        this.addClass(this.tabsContainer, "ng-tabs-card");
      }

      // 添加居中样式类
      if (this.options.centered) {
        this.addClass(this.tabsContainer, "ng-tabs-centered");
      }

      // 创建导航区域
      this.createNav();

      // 创建内容区域
      this.createContent();

      // 添加到容器
      this.container.appendChild(this.tabsContainer);

      // 渲染标签页
      this.renderTabs();

      // 设置活动标签
      this.setActiveTab(this.activeKey);

      // 更新指示条
      this.updateInkBar();

      // 绑定事件
      this.bindEvents();

      // 检查是否需要显示滚动按钮
      requestAnimationFrame(() => {
        this.checkScrollButtons();
        // 再次检查，确保布局稳定
        setTimeout(() => this.checkScrollButtons(), 100);
      });
    } catch (error) {
      console.error("NgTabs: 初始化失败", error);
      throw error;
    }
  }

  /**
   * 创建DOM元素
   */
  createElement(tag, options = {}) {
    const element = document.createElement(tag);

    // 设置属性
    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.text) element.textContent = options.text;
    if (options.html) element.innerHTML = options.html;

    // 设置样式
    if (options.style) {
      Object.keys(options.style).forEach((key) => {
        if (options.style[key] !== undefined && options.style[key] !== null) {
          element.style[key] = options.style[key];
        }
      });
    }

    // 设置数据属性
    if (options.dataset) {
      Object.keys(options.dataset).forEach((key) => {
        element.dataset[key] = options.dataset[key];
      });
    }

    // 设置事件监听器
    if (options.onClick) {
      element.addEventListener("click", options.onClick);
    }

    return element;
  }

  /**
   * 添加CSS类
   */
  addClass(element, className) {
    if (element && className && !element.classList.contains(className)) {
      element.classList.add(className);
    }
  }

  /**
   * 移除CSS类
   */
  removeClass(element, className) {
    if (element && className && element.classList.contains(className)) {
      element.classList.remove(className);
    }
  }

  /**
   * 注入所有样式
   */
  injectStyles() {
    // 如果已经注入过样式，直接返回
    if (document.getElementById("ng-tabs-styles")) return;

    const style = this.createElement("style", {
      id: "ng-tabs-styles",
      text: this.getStyles(),
    });

    document.head.appendChild(style);
  }

  /**
   * 获取所有CSS样式
   */
  getStyles() {
    return `
      /* NgTabs 基础样式 */
      .ng-tabs {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        color: rgba(0, 0, 0, 0.85);
        font-size: 14px;
        font-variant: tabular-nums;
        line-height: 1.5715;
        list-style: none;
        font-feature-settings: 'tnum';
        position: relative;
        display: flex;
        overflow: hidden;
        width: 100%;
      }
      
      /* 标签位置 */
      .ng-tabs-top {
        flex-direction: column;
      }
      
      .ng-tabs-bottom {
        flex-direction: column-reverse;
      }
      
      .ng-tabs-start {
        flex-direction: row;
      }
      
      .ng-tabs-end {
        flex-direction: row-reverse;
      }
      
      /* 导航区域 */
      .ng-tabs-nav {
        position: relative;
        display: flex;
        flex: none;
        align-items: center;
        background: #fff;
        overflow: hidden;
      }
      
      /* 垂直布局时的导航区域调整 */
      .ng-tabs-start .ng-tabs-nav,
      .ng-tabs-end .ng-tabs-nav {
        flex-direction: column;
        align-items: stretch;
      }
      
      /* 导航包装器 */
      .ng-tabs-nav-wrap {
        position: relative;
        display: inline-block;
        display: flex;
        flex: auto;
        align-self: stretch;
        overflow: hidden;
        white-space: nowrap;
        transform: translate(0);
        scroll-behavior: smooth;
      }
      
      .ng-tabs-start .ng-tabs-nav-wrap,
      .ng-tabs-end .ng-tabs-nav-wrap {
        flex-direction: column;
      }
      
      .ng-tabs-nav-wrap::before,
      .ng-tabs-nav-wrap::after {
        position: absolute;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.3s;
        content: '';
        pointer-events: none;
        width: 20px;
        height: 100%;
        top: 0;
      }
      
      .ng-tabs-start .ng-tabs-nav-wrap::before,
      .ng-tabs-start .ng-tabs-nav-wrap::after,
      .ng-tabs-end .ng-tabs-nav-wrap::before,
      .ng-tabs-end .ng-tabs-nav-wrap::after {
        width: 100%;
        height: 20px;
        left: 0;
      }
      
      .ng-tabs-nav-wrap::before {
        left: 0;
        background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      .ng-tabs-nav-wrap::after {
        right: 0;
        background: linear-gradient(to left, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      .ng-tabs-start .ng-tabs-nav-wrap::before {
        top: 0;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      .ng-tabs-start .ng-tabs-nav-wrap::after {
        bottom: 0;
        background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      .ng-tabs-end .ng-tabs-nav-wrap::before {
        top: 0;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      .ng-tabs-end .ng-tabs-nav-wrap::after {
        bottom: 0;
        background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
      }
      
      /* 导航列表 */
      .ng-tabs-nav-list {
        position: relative;
        display: flex;
        transition: transform 0.3s;
        min-height: 40px;
      }
      
      .ng-tabs-top .ng-tabs-nav-list,
      .ng-tabs-bottom .ng-tabs-nav-list {
        flex-direction: row;
      }
      
      .ng-tabs-start .ng-tabs-nav-list,
      .ng-tabs-end .ng-tabs-nav-list {
        flex-direction: column;
        min-width: 80px;
        width: 100%;
      }
      
      /* 单个标签 */
      .ng-tabs-tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding: 12px 0;
        font-size: 14px;
        background: transparent;
        border: 0;
        outline: none;
        cursor: pointer;
        transition: color 0.3s, background-color 0.3s;
        user-select: none;
        white-space: nowrap;
        box-sizing: border-box;
      }
      
      .ng-tabs-top .ng-tabs-tab,
      .ng-tabs-bottom .ng-tabs-tab {
        margin: 0 32px 0 0;
        min-height: 40px;
      }
      
      .ng-tabs-start .ng-tabs-tab,
      .ng-tabs-end .ng-tabs-tab {
        margin: 0 0 8px 0;
        padding: 8px 16px;
        justify-content: flex-start;
        width: 100%;
      }
      
      .ng-tabs-tab:last-child {
        margin-right: 0;
        margin-bottom: 0;
      }
      
      .ng-tabs-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      
      /* 活动标签 */
      .ng-tabs-tab-active {
        color: #1890ff;
        font-weight: 500;
      }
      
      /* 禁用标签 */
      .ng-tabs-tab-disabled {
        color: rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
      }
      
      /* 标签悬停效果 */
      .ng-tabs-tab:hover:not(.ng-tabs-tab-disabled) {
        color: #40a9ff;
      }
      
      /* 指示条 */
      .ng-tabs-ink-bar {
        position: absolute;
        background: #1890ff;
        pointer-events: none;
        transition: left 0.3s, top 0.3s, width 0.3s, height 0.3s;
        z-index: 1;
      }
      
      .ng-tabs-top .ng-tabs-ink-bar {
        bottom: 0;
        height: 2px;
      }
      
      .ng-tabs-bottom .ng-tabs-ink-bar {
        top: 0;
        height: 2px;
      }
      
      .ng-tabs-start .ng-tabs-ink-bar {
        right: 0;
        width: 2px;
      }
      
      .ng-tabs-end .ng-tabs-ink-bar {
        left: 0;
        width: 2px;
      }
      
      /* 内容区域 */
      .ng-tabs-content-holder {
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      
      .ng-tabs-content {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .ng-tabs-top .ng-tabs-content-holder,
      .ng-tabs-bottom .ng-tabs-content-holder {
        order: 1;
      }
      
      /* 内容项 */
      .ng-tabs-tabpane {
        display: none;
        outline: none;
        transition: opacity 0.3s;
        height: 100%;
        width: 100%;
      }
      
      .ng-tabs-tabpane-active {
        display: block;
        animation: ng-tabs-fade-in 0.3s;
      }
      
      @keyframes ng-tabs-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .ng-tabs-tabpane-hidden {
        display: none;
      }
      
      /* 卡片式标签 */
      .ng-tabs-card > .ng-tabs-nav .ng-tabs-tab {
        margin: 0;
        padding: 8px 16px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
        border-bottom: 0;
        border-radius: 8px 8px 0 0;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      
      .ng-tabs-card.ng-tabs-top > .ng-tabs-nav .ng-tabs-tab {
        border-bottom: 1px solid #f0f0f0;
        border-radius: 8px 8px 0 0;
      }
      
      .ng-tabs-card.ng-tabs-bottom > .ng-tabs-nav .ng-tabs-tab {
        border-top: 1px solid #f0f0f0;
        border-radius: 0 0 8px 8px;
      }
      
      .ng-tabs-card.ng-tabs-top > .ng-tabs-nav .ng-tabs-tab-active {
        background: #fff;
        border-bottom-color: #fff;
      }
      
      .ng-tabs-card.ng-tabs-bottom > .ng-tabs-nav .ng-tabs-tab-active {
        background: #fff;
        border-top-color: #fff;
      }
      
      .ng-tabs-card.ng-tabs-start > .ng-tabs-nav .ng-tabs-tab,
      .ng-tabs-card.ng-tabs-end > .ng-tabs-nav .ng-tabs-tab {
        margin: 0 0 4px 0;
        border-radius: 8px 0 0 8px;
        border-right: 0;
      }
      
      .ng-tabs-card.ng-tabs-start > .ng-tabs-nav .ng-tabs-tab-active {
        border-right-color: #fff;
      }
      
      .ng-tabs-card.ng-tabs-end > .ng-tabs-nav .ng-tabs-tab {
        margin: 0 0 4px 0;
        border-radius: 0 8px 8px 0;
        border-left: 0;
      }
      
      .ng-tabs-card.ng-tabs-end > .ng-tabs-nav .ng-tabs-tab-active {
        border-left-color: #fff;
      }
      
      .ng-tabs-card > .ng-tabs-nav .ng-tabs-ink-bar {
        visibility: hidden;
      }
      
      /* 关闭按钮 */
      .ng-tabs-tab-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-left: 6px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 12px;
        background: transparent;
        border: 0;
        border-radius: 50%;
        outline: none;
        cursor: pointer;
        transition: all 0.3s;
        flex-shrink: 0;
      }
      
      .ng-tabs-tab-close:hover {
        color: rgba(0, 0, 0, 0.85);
        background-color: rgba(0, 0, 0, 0.06);
      }
      
      /* 关闭按钮隐藏状态 */
      .ng-tabs-tab-close-hidden {
        display: none !important;
      }
      
      /* 滚动按钮 */
      .ng-tabs-nav-more {
        display: none;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        background: #fff;
        border: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.3s;
        z-index: 2;
        flex-shrink: 0;
        min-width: 32px;
        min-height: 32px;
      }
      
      .ng-tabs-nav-more:hover {
        color: #1890ff;
        border-color: #1890ff;
      }
      
      .ng-tabs-nav-more-visible {
        display: flex;
      }
      
      .ng-tabs-nav-operations {
        display: flex;
        flex-shrink: 0;
        align-items: center;
      }
      
      .ng-tabs-start .ng-tabs-nav-operations,
      .ng-tabs-end .ng-tabs-nav-operations {
        flex-direction: column;
        justify-content: center;
        width: 100%;
      }
      
      .ng-tabs-nav-operations-hidden {
        display: none !important;
      }
      
      /* 导航包装器的ping效果 */
      .ng-tabs-nav-wrap-ping-left::before,
      .ng-tabs-nav-wrap-ping-right::after,
      .ng-tabs-start.ng-tabs-nav-wrap-ping-left::before,
      .ng-tabs-start.ng-tabs-nav-wrap-ping-right::after,
      .ng-tabs-end.ng-tabs-nav-wrap-ping-left::before,
      .ng-tabs-end.ng-tabs-nav-wrap-ping-right::after {
        opacity: 1;
      }
      
      /* 标签居中 */
      .ng-tabs-centered > .ng-tabs-nav .ng-tabs-nav-list {
        justify-content: center;
      }
      
      /* 尺寸 */
      .ng-tabs-small .ng-tabs-tab {
        padding: 8px 0;
        font-size: 12px;
        min-height: 32px;
      }
      
      .ng-tabs-small .ng-tabs-nav-list {
        min-height: 32px;
      }
      
      .ng-tabs-large .ng-tabs-tab {
        padding: 16px 0;
        font-size: 16px;
        min-height: 48px;
      }
      
      .ng-tabs-large .ng-tabs-nav-list {
        min-height: 48px;
      }
      
      /* 附加内容 */
      .ng-tabs-extra-content {
        display: flex;
        align-items: center;
        margin-left: auto;
        padding: 0 12px;
        border-left: 1px solid #f0f0f0;
        flex-shrink: 0;
      }
      
      .ng-tabs-start .ng-tabs-extra-content,
      .ng-tabs-end .ng-tabs-extra-content {
        margin-left: 0;
        margin-top: auto;
        padding: 12px 0;
        border-left: 0;
        border-top: 1px solid #f0f0f0;
        width: 100%;
        justify-content: center;
      }
      
      /* 添加按钮 */
      .ng-tabs-add {
        display: none;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        min-height: 40px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
        border-radius: 2px;
        outline: none;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 16px;
        color: #595959;
        flex-shrink: 0;
      }
      
      .ng-tabs-add:hover {
        color: #1890ff;
        border-color: #1890ff;
      }
      
      .ng-tabs-add-visible {
        display: flex;
      }
      
      /* 水平布局下的添加按钮 */
      .ng-tabs-top .ng-tabs-add,
      .ng-tabs-bottom .ng-tabs-add {
        height: 100%;
        margin-left: 4px;
      }
      
      /* 垂直布局下的添加按钮 */
      .ng-tabs-start .ng-tabs-add,
      .ng-tabs-end .ng-tabs-add {
        width: 100%;
        margin-top: 4px;
        margin-left: 0;
      }
      
      /* 添加按钮在导航区域的起始位置 */
      .ng-tabs-add-start {
        order: -1;
      }
      
      /* 添加按钮在导航区域的结束位置 */
      .ng-tabs-add-end {
        order: 1;
      }
      
      /* 移动端适配 */
      @media (max-width: 768px) {
        .ng-tabs-start,
        .ng-tabs-end {
          flex-direction: column;
        }
        
        .ng-tabs-start .ng-tabs-nav,
        .ng-tabs-end .ng-tabs-nav {
          min-width: 100%;
          flex-direction: row;
        }
        
        .ng-tabs-start .ng-tabs-nav-list,
        .ng-tabs-end .ng-tabs-nav-list {
          flex-direction: row;
        }
        
        .ng-tabs-start .ng-tabs-tab,
        .ng-tabs-end .ng-tabs-tab {
          margin: 0 16px 0 0;
          padding: 8px 0;
          width: auto;
        }
        
        .ng-tabs-start .ng-tabs-add,
        .ng-tabs-end .ng-tabs-add {
          width: auto;
          margin-top: 0;
          margin-left: 4px;
        }
        
        .ng-tabs-start .ng-tabs-extra-content,
        .ng-tabs-end .ng-tabs-extra-content {
          width: auto;
          margin-top: 0;
          margin-left: auto;
          padding: 0 12px;
          border-top: 0;
          border-left: 1px solid #f0f0f0;
        }
      }
    `;
  }

  /**
   * 创建导航区域
   */
  createNav() {
    this.nav = this.createElement("div", {
      className: "ng-tabs-nav",
    });

    // 创建导航包装器
    this.navWrap = this.createElement("div", {
      className: "ng-tabs-nav-wrap",
    });

    // 创建导航列表
    this.navList = this.createElement("div", {
      className: "ng-tabs-nav-list",
    });

    // 创建指示条
    this.inkBar = this.createElement("div", {
      className: "ng-tabs-ink-bar",
    });

    // 创建滚动按钮
    this.prevBtn = this.createElement("button", {
      className: "ng-tabs-nav-more ng-tabs-nav-prev",
      html: '<span class="ng-tabs-nav-more-icon">‹</span>',
      onClick: this.handlePrevClick,
    });

    this.nextBtn = this.createElement("button", {
      className: "ng-tabs-nav-more ng-tabs-nav-next",
      html: '<span class="ng-tabs-nav-more-icon">›</span>',
      onClick: this.handleNextClick,
    });

    // 创建操作区域
    this.operations = this.createElement("div", {
      className: "ng-tabs-nav-operations ng-tabs-nav-operations-hidden",
    });

    // 添加附加内容
    if (this.options.extraContent) {
      this.extraContent = this.createElement("div", {
        className: "ng-tabs-extra-content",
        html: this.options.extraContent,
      });
    }

    // 创建添加按钮（如果需要）
    if (this.options.showAddButton) {
      this.addButton = this.createElement("button", {
        className: `ng-tabs-add ng-tabs-add-${this.options.addButtonPosition} ng-tabs-add-visible`,
        html: this.options.addIcon,
        dataset: { action: "add" },
        onClick: this.handleAddClick,
      });
    }

    // 组装导航区域
    this.navList.appendChild(this.inkBar);
    this.navWrap.appendChild(this.navList);

    // 添加操作按钮
    this.operations.appendChild(this.prevBtn);
    this.operations.appendChild(this.nextBtn);

    // 根据标签位置和添加按钮位置组装导航区域
    this.rearrangeNav();

    // 添加到主容器
    this.tabsContainer.appendChild(this.nav);
  }

  /**
   * 重新布局导航区域
   */
  rearrangeNav() {
    // 清空导航区域
    this.nav.innerHTML = "";

    // 根据标签位置和添加按钮位置重新组装导航区域
    if (
      this.options.tabPosition === "top" ||
      this.options.tabPosition === "bottom"
    ) {
      // 水平布局
      if (this.addButton && this.options.addButtonPosition === "start") {
        this.nav.appendChild(this.addButton);
      }

      this.nav.appendChild(this.operations);
      this.nav.appendChild(this.navWrap);

      if (this.addButton && this.options.addButtonPosition === "end") {
        this.nav.appendChild(this.addButton);
      }

      // 附加内容
      if (this.options.extraContent) {
        this.nav.appendChild(this.extraContent);
      }
    } else {
      // 垂直布局
      if (this.addButton && this.options.addButtonPosition === "start") {
        this.nav.appendChild(this.addButton);
      }

      this.nav.appendChild(this.navWrap);

      if (this.addButton && this.options.addButtonPosition === "end") {
        this.nav.appendChild(this.addButton);
      }

      // 操作区域
      this.nav.appendChild(this.operations);

      // 附加内容
      if (this.options.extraContent) {
        this.nav.appendChild(this.extraContent);
      }
    }
  }

  /**
   * 创建内容区域
   */
  createContent() {
    this.contentHolder = this.createElement("div", {
      className: "ng-tabs-content-holder",
    });

    this.content = this.createElement("div", {
      className: "ng-tabs-content",
    });

    this.contentHolder.appendChild(this.content);
    this.tabsContainer.appendChild(this.contentHolder);
  }

  /**
   * 渲染所有标签页
   */
  renderTabs() {
    // 清空现有标签
    const existingTabs = this.navList.querySelectorAll(
      ".ng-tabs-tab:not(.ng-tabs-ink-bar)"
    );
    existingTabs.forEach((tab) => tab.remove());

    this.content.innerHTML = "";
    this.tabs = [];

    // 如果没有标签项，显示空状态
    if (this.options.items.length === 0) {
      const emptyTab = this.createElement("div", {
        className: "ng-tabs-tab ng-tabs-tab-disabled",
        text: "无标签页",
      });

      this.navList.insertBefore(emptyTab, this.inkBar);

      const emptyPane = this.createElement("div", {
        className: "ng-tabs-tabpane ng-tabs-tabpane-active",
        text: "暂无内容",
      });

      this.content.appendChild(emptyPane);
      return;
    }

    // 创建标签页
    this.options.items.forEach((item, index) => {
      try {
        const key = item.key || String(index);

        // 创建标签元素
        const tab = this.createElement("div", {
          className: `ng-tabs-tab ${
            item.disabled ? "ng-tabs-tab-disabled" : ""
          }`,
          dataset: { key },
        });

        // 创建标签按钮
        const tabBtn = this.createElement("span", {
          className: "ng-tabs-tab-btn",
          html: item.label || `Tab ${index + 1}`,
        });

        tab.appendChild(tabBtn);

        // 添加关闭按钮（如果可关闭且显示关闭按钮）
        const shouldShowClose = this.shouldShowCloseButton(item);
        if (shouldShowClose) {
          const closeBtn = this.createElement("button", {
            className: "ng-tabs-tab-close",
            html: "×",
            dataset: { key },
          });

          tab.appendChild(closeBtn);
        }

        // 添加到导航列表
        this.navList.insertBefore(tab, this.inkBar);

        // 创建内容面板
        const pane = this.createElement("div", {
          className: "ng-tabs-tabpane ng-tabs-tabpane-hidden",
          dataset: { key },
        });

        // 设置内容
        if (typeof item.content === "string") {
          pane.innerHTML = item.content;
        } else if (item.content instanceof HTMLElement) {
          pane.appendChild(item.content);
        } else if (typeof item.content === "function") {
          const content = item.content();
          if (typeof content === "string") {
            pane.innerHTML = content;
          } else if (content instanceof HTMLElement) {
            pane.appendChild(content);
          } else {
            pane.textContent = "内容加载失败";
          }
        } else if (item.content !== undefined && item.content !== null) {
          pane.textContent = String(item.content);
        } else {
          pane.textContent = `Content of tab ${index + 1}`;
        }

        // 添加到内容区域
        this.content.appendChild(pane);

        // 保存标签引用
        this.tabs.push({
          key,
          tabElement: tab,
          paneElement: pane,
          disabled: item.disabled || false,
          closable:
            item.closable !== undefined ? item.closable : this.options.closable,
          showClose: shouldShowClose,
          // 标记是否为新增的标签页
          isNewTab: item.isNewTab || false,
        });
      } catch (error) {
        console.error("NgTabs: 渲染标签页失败", error, item);
      }
    });
  }

  /**
   * 判断是否应该显示关闭按钮
   */
  shouldShowCloseButton(item) {
    // 如果全局不显示关闭按钮，则不显示
    if (!this.options.showCloseButton) {
      return false;
    }

    // 如果是新增的标签页，使用newTabShowClose配置
    if (item.isNewTab && this.options.newTabShowClose !== undefined) {
      // 新增标签页的特殊配置
      if (!this.options.newTabShowClose) {
        return false;
      }
      // 如果newTabShowClose为true，继续判断closable
    }

    // 如果单个标签页有closable属性，使用该属性
    if (typeof item.closable === "boolean") {
      return item.closable;
    }

    // 如果是新增的标签页，使用newTabClosable配置
    if (item.isNewTab && this.options.newTabClosable !== undefined) {
      return this.options.newTabClosable;
    }

    // 使用全局closable设置
    return this.options.closable;
  }

  /**
   * 设置活动标签
   */
  setActiveTab(key) {
    // 如果没有标签，直接返回
    if (this.tabs.length === 0) {
      return;
    }

    // 查找目标标签
    const targetTab = this.tabs.find((tab) => tab.key === key);

    // 如果未找到目标标签或标签被禁用，返回
    if (!targetTab || targetTab.disabled) {
      return;
    }

    // 移除之前的活动状态
    this.tabs.forEach((tab) => {
      this.removeClass(tab.tabElement, "ng-tabs-tab-active");
      this.addClass(tab.paneElement, "ng-tabs-tabpane-hidden");
      this.removeClass(tab.paneElement, "ng-tabs-tabpane-active");
    });

    // 设置新的活动状态
    this.addClass(targetTab.tabElement, "ng-tabs-tab-active");
    this.removeClass(targetTab.paneElement, "ng-tabs-tabpane-hidden");
    this.addClass(targetTab.paneElement, "ng-tabs-tabpane-active");
    this.activeKey = key;

    // 更新指示条
    this.updateInkBar();

    // 确保活动标签在可视区域内
    requestAnimationFrame(() => {
      this.scrollToActiveTab();
    });

    // 触发onChange回调
    if (this.options.onChange && typeof this.options.onChange === "function") {
      try {
        this.options.onChange(key);
      } catch (error) {
        console.error("NgTabs: onChange回调执行失败", error);
      }
    }
  }

  /**
   * 更新指示条位置
   */
  updateInkBar() {
    const activeTab = this.tabs.find((tab) => tab.key === this.activeKey);
    if (!activeTab) return;

    // 等待DOM更新
    requestAnimationFrame(() => {
      try {
        const tabRect = activeTab.tabElement.getBoundingClientRect();
        const navListRect = this.navList.getBoundingClientRect();

        // 根据指示条配置计算宽度/高度
        let inkBarSize = "auto";
        if (this.options.indicator.size !== "auto") {
          inkBarSize = this.options.indicator.size;
        }

        // 根据标签位置设置指示条
        if (
          this.options.tabPosition === "top" ||
          this.options.tabPosition === "bottom"
        ) {
          // 水平标签
          const left = tabRect.left - navListRect.left;
          const width = inkBarSize === "auto" ? tabRect.width : inkBarSize;

          // 根据对齐方式调整位置
          let finalLeft = left;
          if (this.options.indicator.align === "center") {
            finalLeft = left + (tabRect.width - parseFloat(width)) / 2;
          } else if (this.options.indicator.align === "right") {
            finalLeft = left + tabRect.width - parseFloat(width);
          }

          this.inkBar.style.left = `${finalLeft}px`;
          this.inkBar.style.width = width;
          this.inkBar.style.height = "2px";
          this.inkBar.style.top = "";
        } else {
          // 垂直标签
          const top = tabRect.top - navListRect.top;
          const height = inkBarSize === "auto" ? tabRect.height : inkBarSize;

          // 根据对齐方式调整位置
          let finalTop = top;
          if (this.options.indicator.align === "center") {
            finalTop = top + (tabRect.height - parseFloat(height)) / 2;
          } else if (this.options.indicator.align === "bottom") {
            finalTop = top + tabRect.height - parseFloat(height);
          }

          this.inkBar.style.top = `${finalTop}px`;
          this.inkBar.style.height = height;
          this.inkBar.style.width = "2px";
          this.inkBar.style.left = "";
        }
      } catch (error) {
        console.error("NgTabs: 更新指示条失败", error);
      }
    });
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    this.updateInkBar();
    this.checkScrollButtons();
  }

  /**
   * 处理标签点击事件
   */
  handleTabClick(e) {
    const tabElement = e.target.closest(".ng-tabs-tab");
    const closeButton = e.target.closest(".ng-tabs-tab-close");

    if (closeButton) {
      // 停止事件冒泡，防止触发标签切换
      e.stopPropagation();
      const key = closeButton.dataset.key;
      this.handleTabClose(key);
      return;
    }

    if (tabElement && !tabElement.classList.contains("ng-tabs-tab-disabled")) {
      const key = tabElement.dataset.key;
      if (key && key !== this.activeKey) {
        this.setActiveTab(key);
      }
    }
  }

  /**
   * 处理关闭按钮点击
   */
  handleTabCloseClick(e) {
    e.stopPropagation();
    const closeButton = e.target.closest(".ng-tabs-tab-close");
    if (closeButton) {
      const key = closeButton.dataset.key;
      this.handleTabClose(key);
    }
  }

  /**
   * 处理添加按钮点击
   */
  handleAddClick() {
    this.handleAddTab();
  }

  /**
   * 处理上一个按钮点击
   */
  handlePrevClick() {
    this.scroll("prev");
  }

  /**
   * 处理下一个按钮点击
   */
  handleNextClick() {
    this.scroll("next");
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 标签点击事件
    this.navList.addEventListener("click", this.handleTabClick);

    // 关闭按钮点击事件（单独处理，防止事件冒泡）
    this.navList.addEventListener("click", this.handleTabCloseClick);

    // 窗口大小变化事件
    window.addEventListener("resize", this.handleResize);
  }

  /**
   * 滚动到活动标签
   */
  scrollToActiveTab() {
    const activeTab = this.tabs.find((tab) => tab.key === this.activeKey);
    if (!activeTab) return;

    try {
      const tabRect = activeTab.tabElement.getBoundingClientRect();
      const navWrapRect = this.navWrap.getBoundingClientRect();

      if (
        this.options.tabPosition === "top" ||
        this.options.tabPosition === "bottom"
      ) {
        // 水平滚动
        if (tabRect.right > navWrapRect.right) {
          this.navList.scrollLeft += tabRect.right - navWrapRect.right + 10;
        } else if (tabRect.left < navWrapRect.left) {
          this.navList.scrollLeft -= navWrapRect.left - tabRect.left + 10;
        }
      } else {
        // 垂直滚动
        if (tabRect.bottom > navWrapRect.bottom) {
          this.navList.scrollTop += tabRect.bottom - navWrapRect.bottom + 10;
        } else if (tabRect.top < navWrapRect.top) {
          this.navList.scrollTop -= navWrapRect.top - tabRect.top + 10;
        }
      }

      this.checkScrollButtons();
    } catch (error) {
      console.error("NgTabs: 滚动到活动标签失败", error);
    }
  }

  /**
   * 检查滚动按钮状态
   */
  checkScrollButtons() {
    if (!this.navList || !this.navWrap) return;

    try {
      const hasHorizontalScroll =
        this.navList.scrollWidth > this.navWrap.clientWidth + 1;
      const hasVerticalScroll =
        this.navList.scrollHeight > this.navWrap.clientHeight + 1;

      if (
        this.options.tabPosition === "top" ||
        this.options.tabPosition === "bottom"
      ) {
        // 水平标签
        if (hasHorizontalScroll) {
          this.addClass(this.prevBtn, "ng-tabs-nav-more-visible");
          this.addClass(this.nextBtn, "ng-tabs-nav-more-visible");
          this.removeClass(this.operations, "ng-tabs-nav-operations-hidden");

          // 检查是否到达边界
          const isAtStart = this.navList.scrollLeft <= 1;
          const isAtEnd =
            Math.ceil(this.navList.scrollLeft + this.navWrap.clientWidth) >=
            this.navList.scrollWidth - 1;

          // 添加ping效果
          if (isAtStart) {
            this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-left");
          } else {
            this.addClass(this.navWrap, "ng-tabs-nav-wrap-ping-left");
          }

          if (isAtEnd) {
            this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-right");
          } else {
            this.addClass(this.navWrap, "ng-tabs-nav-wrap-ping-right");
          }
        } else {
          this.removeClass(this.prevBtn, "ng-tabs-nav-more-visible");
          this.removeClass(this.nextBtn, "ng-tabs-nav-more-visible");
          this.addClass(this.operations, "ng-tabs-nav-operations-hidden");
          this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-left");
          this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-right");
        }
      } else {
        // 垂直标签
        if (hasVerticalScroll) {
          this.addClass(this.prevBtn, "ng-tabs-nav-more-visible");
          this.addClass(this.nextBtn, "ng-tabs-nav-more-visible");
          this.removeClass(this.operations, "ng-tabs-nav-operations-hidden");

          // 检查是否到达边界
          const isAtStart = this.navList.scrollTop <= 1;
          const isAtEnd =
            Math.ceil(this.navList.scrollTop + this.navWrap.clientHeight) >=
            this.navList.scrollHeight - 1;

          // 添加ping效果
          if (isAtStart) {
            this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-left");
          } else {
            this.addClass(this.navWrap, "ng-tabs-nav-wrap-ping-left");
          }

          if (isAtEnd) {
            this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-right");
          } else {
            this.addClass(this.navWrap, "ng-tabs-nav-wrap-ping-right");
          }
        } else {
          this.removeClass(this.prevBtn, "ng-tabs-nav-more-visible");
          this.removeClass(this.nextBtn, "ng-tabs-nav-more-visible");
          this.addClass(this.operations, "ng-tabs-nav-operations-hidden");
          this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-left");
          this.removeClass(this.navWrap, "ng-tabs-nav-wrap-ping-right");
        }
      }
    } catch (error) {
      console.error("NgTabs: 检查滚动按钮状态失败", error);
    }
  }

  /**
   * 滚动标签
   */
  scroll(direction) {
    if (!this.navList) return;

    const scrollAmount = 200;

    try {
      if (
        this.options.tabPosition === "top" ||
        this.options.tabPosition === "bottom"
      ) {
        // 水平滚动
        const currentScroll = this.navList.scrollLeft;
        const newScroll =
          direction === "next"
            ? currentScroll + scrollAmount
            : currentScroll - scrollAmount;

        this.navList.scrollLeft = newScroll;
      } else {
        // 垂直滚动
        const currentScroll = this.navList.scrollTop;
        const newScroll =
          direction === "next"
            ? currentScroll + scrollAmount
            : currentScroll - scrollAmount;

        this.navList.scrollTop = newScroll;
      }

      // 更新按钮状态
      setTimeout(() => this.checkScrollButtons(), 50);
    } catch (error) {
      console.error("NgTabs: 滚动标签失败", error);
    }
  }

  /**
   * 处理标签关闭
   */
  handleTabClose(key) {
    // 查找要关闭的标签索引
    const index = this.options.items.findIndex((item) => {
      const itemKey = item.key || String(this.options.items.indexOf(item));
      return itemKey === key;
    });

    if (index === -1) {
      console.warn(`NgTabs: 未找到要关闭的标签 ${key}`);
      return;
    }

    // 触发onEdit回调
    if (this.options.onEdit && typeof this.options.onEdit === "function") {
      try {
        this.options.onEdit(key, "remove");
      } catch (error) {
        console.error("NgTabs: onEdit回调执行失败", error);
      }
    }

    // 如果关闭的是当前活动标签，激活前一个标签
    if (key === this.activeKey) {
      const newIndex = Math.max(0, index - 1);
      const newKey = this.options.items[newIndex]?.key || String(newIndex);
      this.setActiveTab(newKey);
    }

    // 从items中移除
    this.options.items.splice(index, 1);

    // 重新渲染
    this.renderTabs();

    // 确保有一个活动标签
    if (
      !this.tabs.find((tab) => tab.key === this.activeKey) &&
      this.tabs.length > 0
    ) {
      const firstKey = this.tabs[0].key;
      this.setActiveTab(firstKey);
    }

    // 更新指示条
    this.updateInkBar();

    // 检查滚动按钮
    requestAnimationFrame(() => {
      this.checkScrollButtons();
    });
  }

  /**
   * 处理添加标签
   */
  handleAddTab() {
    // 触发onEdit回调
    if (this.options.onEdit && typeof this.options.onEdit === "function") {
      try {
        this.options.onEdit(null, "add");
      } catch (error) {
        console.error("NgTabs: onEdit回调执行失败", error);
      }
    } else {
      // 默认添加一个标签
      const newIndex = this.options.items.length;
      const newKey = `tab-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 创建新的标签项，使用newTabClosable和newTabShowClose配置
      const newTabItem = {
        key: newKey,
        label: `New Tab ${newIndex + 1}`,
        content: `Content of new tab ${newIndex + 1}`,
        isNewTab: true, // 标记为新增标签页
        closable: this.options.newTabClosable, // 使用newTabClosable配置
        // showClose将由shouldShowCloseButton方法根据newTabShowClose决定
      };

      this.options.items.push(newTabItem);

      this.renderTabs();
      this.setActiveTab(newKey);
      this.checkScrollButtons();
    }
  }

  /**
   * 公共API方法
   */

  // 更新标签项
  updateItem(key, newItem) {
    const index = this.options.items.findIndex((item) => {
      const itemKey = item.key || String(this.options.items.indexOf(item));
      return itemKey === key;
    });

    if (index !== -1) {
      this.options.items[index] = { ...this.options.items[index], ...newItem };
      this.renderTabs();
      this.setActiveTab(this.activeKey);
      this.checkScrollButtons();
      return true;
    }

    return false;
  }

  // 添加标签项
  addItem(item, index = -1) {
    try {
      // 如果没有指定isNewTab，默认不是新增标签页
      if (item.isNewTab === undefined) {
        item.isNewTab = false;
      }

      if (index === -1 || index >= this.options.items.length) {
        this.options.items.push(item);
      } else {
        this.options.items.splice(index, 0, item);
      }

      this.renderTabs();
      this.checkScrollButtons();
      return true;
    } catch (error) {
      console.error("NgTabs: 添加标签项失败", error);
      return false;
    }
  }

  // 移除标签项
  removeItem(key) {
    this.handleTabClose(key);
  }

  // 设置标签位置
  setTabPosition(position) {
    const validPositions = ["top", "bottom", "start", "end"];
    if (!validPositions.includes(position)) {
      console.warn(`NgTabs: 无效的标签位置 ${position}，使用默认值 top`);
      position = "top";
    }

    this.options.tabPosition = position;

    // 更新容器类
    ["top", "bottom", "start", "end"].forEach((pos) => {
      this.removeClass(this.tabsContainer, `ng-tabs-${pos}`);
    });

    this.addClass(this.tabsContainer, `ng-tabs-${position}`);

    // 重新布局导航区域
    this.rearrangeNav();

    // 更新指示条
    requestAnimationFrame(() => {
      this.updateInkBar();
      this.checkScrollButtons();
    });
  }

  // 设置标签类型
  setType(type) {
    const validTypes = ["line", "card"];
    if (!validTypes.includes(type)) {
      console.warn(`NgTabs: 无效的标签类型 ${type}，使用默认值 line`);
      type = "line";
    }

    this.options.type = type;

    if (type === "card") {
      this.addClass(this.tabsContainer, "ng-tabs-card");
    } else {
      this.removeClass(this.tabsContainer, "ng-tabs-card");
    }

    this.renderTabs();
    this.setActiveTab(this.activeKey);
  }

  // 设置标签尺寸
  setSize(size) {
    const validSizes = ["small", "middle", "large"];
    if (!validSizes.includes(size)) {
      console.warn(`NgTabs: 无效的标签尺寸 ${size}，使用默认值 middle`);
      size = "middle";
    }

    this.options.size = size;

    // 更新容器类
    ["small", "middle", "large"].forEach((s) => {
      this.removeClass(this.tabsContainer, `ng-tabs-${s}`);
    });

    this.addClass(this.tabsContainer, `ng-tabs-${size}`);
  }

  // 设置是否居中
  setCentered(centered) {
    this.options.centered = !!centered;

    if (centered) {
      this.addClass(this.tabsContainer, "ng-tabs-centered");
    } else {
      this.removeClass(this.tabsContainer, "ng-tabs-centered");
    }
  }

  // 设置是否允许关闭（功能控制）
  setClosable(closable) {
    this.options.closable = !!closable;
    this.renderTabs();
    this.setActiveTab(this.activeKey);
  }

  // 设置是否显示关闭按钮（视觉控制）
  setShowCloseButton(showCloseButton) {
    this.options.showCloseButton = !!showCloseButton;
    this.renderTabs();
    this.setActiveTab(this.activeKey);
  }

  // 设置新增标签页是否可关闭（功能控制）
  setNewTabClosable(newTabClosable) {
    this.options.newTabClosable = !!newTabClosable;
    // 不需要重新渲染，因为只影响后续新增的标签页
  }

  // 设置新增标签页是否显示关闭按钮（视觉控制）
  setNewTabShowClose(newTabShowClose) {
    this.options.newTabShowClose = !!newTabShowClose;
    // 不需要重新渲染，因为只影响后续新增的标签页
  }

  // 设置是否显示添加按钮
  setShowAddButton(showAddButton) {
    this.options.showAddButton = !!showAddButton;

    if (showAddButton && !this.addButton) {
      // 创建添加按钮
      this.addButton = this.createElement("button", {
        className: `ng-tabs-add ng-tabs-add-${this.options.addButtonPosition} ng-tabs-add-visible`,
        html: this.options.addIcon,
        dataset: { action: "add" },
        onClick: this.handleAddClick,
      });

      // 重新布局导航区域
      this.rearrangeNav();
    } else if (!showAddButton && this.addButton) {
      // 移除添加按钮
      this.addButton.remove();
      this.addButton = null;

      // 重新布局导航区域
      this.rearrangeNav();
    }
  }

  // 设置添加按钮位置
  setAddButtonPosition(position) {
    const validPositions = ["start", "end"];
    if (!validPositions.includes(position)) {
      console.warn(`NgTabs: 无效的添加按钮位置 ${position}，使用默认值 end`);
      position = "end";
    }

    if (position !== this.options.addButtonPosition) {
      this.options.addButtonPosition = position;

      if (this.addButton) {
        // 更新添加按钮类名
        this.removeClass(this.addButton, "ng-tabs-add-start");
        this.removeClass(this.addButton, "ng-tabs-add-end");
        this.addClass(this.addButton, `ng-tabs-add-${position}`);

        // 重新布局导航区域
        this.rearrangeNav();
      }
    }
  }

  // 设置指示条
  setIndicator(indicator) {
    this.options.indicator = { ...this.options.indicator, ...indicator };
    this.updateInkBar();
  }

  // 设置附加内容
  setExtraContent(content) {
    this.options.extraContent = content;

    if (this.extraContent) {
      if (content) {
        this.extraContent.innerHTML = content;
        this.removeClass(this.extraContent, "ng-tabs-nav-operations-hidden");
      } else {
        this.extraContent.innerHTML = "";
        this.addClass(this.extraContent, "ng-tabs-nav-operations-hidden");
      }
    } else if (content) {
      this.extraContent = this.createElement("div", {
        className: "ng-tabs-extra-content",
        html: content,
      });

      // 重新布局导航区域
      this.rearrangeNav();
    }
  }

  // 获取当前活动标签的key
  getActiveKey() {
    return this.activeKey;
  }

  // 获取所有标签项
  getItems() {
    return [...this.options.items];
  }

  // 获取标签数量
  getTabCount() {
    return this.options.items.length;
  }

  // 重新渲染组件
  refresh() {
    if (this.isDestroyed) {
      console.warn("NgTabs: 组件已被销毁，无法刷新");
      return;
    }

    this.renderTabs();
    this.setActiveTab(this.activeKey);
    this.updateInkBar();
    this.checkScrollButtons();
  }

  // 销毁组件
  destroy() {
    if (this.isDestroyed) return;

    // 移除事件监听器
    this.navList.removeEventListener("click", this.handleTabClick);
    this.navList.removeEventListener("click", this.handleTabCloseClick);
    window.removeEventListener("resize", this.handleResize);

    // 移除添加按钮事件监听器
    if (this.addButton) {
      this.addButton.removeEventListener("click", this.handleAddClick);
    }

    // 移除滚动按钮事件监听器
    if (this.prevBtn) {
      this.prevBtn.removeEventListener("click", this.handlePrevClick);
    }

    if (this.nextBtn) {
      this.nextBtn.removeEventListener("click", this.handleNextClick);
    }

    // 清空容器
    this.container.innerHTML = "";

    // 重置状态
    this.tabs = [];
    this.activeKey = "0";
    this.addButton = null;
    this.extraContent = null;
    this.isDestroyed = true;
  }
}

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = NgTabs;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return NgTabs;
  });
} else {
  window.NgTabs = NgTabs;
}
