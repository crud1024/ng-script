// NGCollapse.js - 使用细线条图标的版本
class NGCollapse {
  constructor(container, options = {}) {
    // 验证容器
    this.container = this._validateContainer(container);

    // 合并默认配置
    this.config = {
      // 基础配置
      accordion: false,
      activeKey: null,
      defaultActiveKey: null,
      bordered: true,
      ghost: false,
      size: "default",
      expandIconPosition: "start",
      collapsible: "header",
      destroyInactivePanel: false,

      // 事件回调
      onChange: null,

      // 自定义
      expandIcon: null,
      collapseIcon: null,
      classNames: {},
      styles: {},

      // 图标相关配置
      iconProps: {
        width: 16,
        height: 16,
        strokeWidth: 2,
        stroke: "rgba(0, 0, 0, 0.45)",
        fill: "none",
        style: {},
      },

      // 面板配置
      items: [],

      // NG Design特有配置
      forceRender: false,
      showArrow: true,
      ...options,
    };

    // 状态管理
    this.state = {
      activeKeys: this._getInitialActiveKeys(),
      panels: this._normalizePanels(this.config.items || []),
      isFirstRender: true,
    };

    // 初始化
    this._init();
  }

  // ==================== 私有方法 ====================

  _validateContainer(container) {
    if (typeof container === "string") {
      const elem = document.querySelector(container);
      if (!elem) throw new Error(`未找到容器元素: ${container}`);
      return elem;
    } else if (container instanceof HTMLElement) {
      return container;
    } else {
      throw new Error("容器必须是选择器字符串或DOM元素");
    }
  }

  _getInitialActiveKeys() {
    let keys = [];
    if (this.config.activeKey !== null && this.config.activeKey !== undefined) {
      keys = Array.isArray(this.config.activeKey)
        ? [...this.config.activeKey]
        : [this.config.activeKey];
    } else if (
      this.config.defaultActiveKey !== null &&
      this.config.defaultActiveKey !== undefined
    ) {
      keys = Array.isArray(this.config.defaultActiveKey)
        ? [...this.config.defaultActiveKey]
        : [this.config.defaultActiveKey];
    }
    return keys;
  }

  _normalizePanels(items) {
    return items.map((item, index) => ({
      key: item.key || `panel-${index}`,
      label: item.label || item.header || `Panel ${index + 1}`,
      children: item.children || item.content || "",
      className: item.className || "",
      style: item.style || {},
      disabled: item.disabled || false,
      showArrow:
        item.showArrow !== undefined ? item.showArrow : this.config.showArrow,
      extra: item.extra || null,
      collapsible: item.collapsible || this.config.collapsible,
      forceRender: item.forceRender || this.config.forceRender,
      destroyInactivePanel:
        item.destroyInactivePanel !== undefined
          ? item.destroyInactivePanel
          : this.config.destroyInactivePanel,
      expandIcon: item.expandIcon,
      collapseIcon: item.collapseIcon,
      iconProps: { ...this.config.iconProps, ...(item.iconProps || {}) },
    }));
  }

  _init() {
    // 注入NG Design样式
    this._injectNGStyles();

    // 设置容器
    this._setupContainer();

    // 渲染
    this._render();

    // 绑定事件
    this._bindEvents();

    // 标记首次渲染完成
    this.state.isFirstRender = false;
  }

  _injectNGStyles() {
    if (document.getElementById("ng-collapse-styles")) return;

    const style = document.createElement("style");
    style.id = "ng-collapse-styles";
    style.textContent = this._getNGStyles();
    document.head.appendChild(style);
  }

  _getNGStyles() {
    return `
        /* ========== NG Design Collapse 样式 ========== */
        
        /* 基础容器 */
        .ng-collapse {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            color: rgba(0, 0, 0, 0.88);
            font-size: 14px;
            line-height: 1.5714285714285714;
            list-style: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #ffffff;
            border-radius: 8px;
            width: 100%;
        }
        
        /* 有边框模式 */
        .ng-collapse-borderless {
            background-color: transparent;
            border: 0;
        }
        
        .ng-collapse-borderless > .ng-collapse-item {
            border-bottom: 1px solid #d9d9d9;
        }
        
        .ng-collapse-borderless > .ng-collapse-item:last-child,
        .ng-collapse-borderless > .ng-collapse-item:last-child .ng-collapse-header {
            border-radius: 0;
        }
        
        /* 幽灵模式 */
        .ng-collapse-ghost {
            background-color: transparent;
            border: 0;
        }
        
        .ng-collapse-ghost > .ng-collapse-item {
            border-bottom: 0;
        }
        
        .ng-collapse-ghost > .ng-collapse-item > .ng-collapse-content {
            background-color: transparent;
            border-top: 0;
        }
        
        .ng-collapse-ghost > .ng-collapse-item > .ng-collapse-content > .ng-collapse-content-box {
            padding-top: 4px;
        }
        
        /* Collapse项 */
        .ng-collapse-item {
            border-bottom: 1px solid #d9d9d9;
        }
        
        .ng-collapse-item:last-child {
            border-bottom: 0;
        }
        
        .ng-collapse-item-disabled > .ng-collapse-header,
        .ng-collapse-item-disabled > .ng-collapse-header > .arrow {
            color: rgba(0, 0, 0, 0.25);
            cursor: not-allowed;
        }
        
        /* 头部 */
        .ng-collapse-header {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            padding: 12px 16px;
            color: rgba(0, 0, 0, 0.88);
            line-height: 1.5714285714285714;
            cursor: pointer;
            transition: all 0.3s, visibility 0s;
            background-color: #fafafa;
        }
        
        .ng-collapse-header:hover:not(.ng-collapse-header-disabled) {
            background-color: #f5f5f5;
        }
        
        .ng-collapse-header:focus:not(.ng-collapse-header-disabled) {
            outline: none;
            background-color: #f5f5f5;
        }
        
        .ng-collapse-item-active > .ng-collapse-header {
            background-color: #f0f7ff;
        }
        
        .ng-collapse-header-disabled {
            cursor: not-allowed !important;
            opacity: 0.4;
        }
        
        /* 箭头图标区域 */
        .ng-collapse-expand-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.3s;
            color: rgba(0, 0, 0, 0.45);
            line-height: 1;
        }
        
        .ng-collapse-expand-icon.ng-collapse-expand-icon-start {
            margin-right: 12px;
        }
        
        .ng-collapse-expand-icon.ng-collapse-expand-icon-end {
            margin-left: auto;
            margin-right: 0;
        }
        
        .ng-collapse-expand-icon svg {
            display: block;
            transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }
        
        .ng-collapse-item-active .ng-collapse-expand-icon svg {
            transform: rotate(90deg);
        }
        
        /* 图标位置配置 */
        .ng-collapse-icon-position-start .ng-collapse-expand-icon {
            order: 0;
        }
        
        .ng-collapse-icon-position-start .ng-collapse-header-text {
            order: 1;
        }
        
        .ng-collapse-icon-position-start .ng-collapse-extra {
            order: 2;
            margin-left: auto;
        }
        
        .ng-collapse-icon-position-end .ng-collapse-header-text {
            order: 0;
            flex: 1;
        }
        
        .ng-collapse-icon-position-end .ng-collapse-extra {
            order: 1;
            margin-right: 12px;
        }
        
        .ng-collapse-icon-position-end .ng-collapse-expand-icon {
            order: 2;
        }
        
        /* 标题 */
        .ng-collapse-header-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        /* 额外内容 */
        .ng-collapse-extra {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.45);
            margin-left: 8px;
        }
        
        /* 内容区域 */
        .ng-collapse-content {
            color: rgba(0, 0, 0, 0.88);
            background-color: #ffffff;
            border-top: 1px solid #d9d9d9;
            overflow: hidden;
            transition: height 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        
        .ng-collapse-content-hidden {
            display: none;
        }
        
        .ng-collapse-content-box {
            padding: 16px;
            font-size: 14px;
            line-height: 1.5714285714285714;
        }
        
        /* 尺寸 */
        .ng-collapse-small > .ng-collapse-item > .ng-collapse-header {
            padding: 8px 12px;
            font-size: 13px;
        }
        
        .ng-collapse-small > .ng-collapse-item > .ng-collapse-content > .ng-collapse-content-box {
            padding: 12px;
            font-size: 13px;
        }
        
        .ng-collapse-large > .ng-collapse-item > .ng-collapse-header {
            padding: 16px 20px;
            font-size: 16px;
        }
        
        .ng-collapse-large > .ng-collapse-item > .ng-collapse-content > .ng-collapse-content-box {
            padding: 20px;
            font-size: 16px;
        }
        
        /* 手风琴模式 */
        .ng-collapse-accordion .ng-collapse-item-active .ng-collapse-header {
            border-bottom-color: transparent;
        }
        
        /* 无箭头 */
        .ng-collapse-no-arrow .ng-collapse-expand-icon {
            display: none;
        }
        
        /* 响应式 */
        @media (max-width: 768px) {
            .ng-collapse-header {
                padding: 10px 12px;
            }
            
            .ng-collapse-content-box {
                padding: 12px;
            }
        }
    `;
  }

  _setupContainer() {
    this.container.className = "ng-collapse";

    if (this.config.bordered === false) {
      this.container.classList.add("ng-collapse-borderless");
    }

    if (this.config.ghost) {
      this.container.classList.add("ng-collapse-ghost");
    }

    if (this.config.size !== "default") {
      this.container.classList.add(`ng-collapse-${this.config.size}`);
    }

    this.container.classList.add(
      `ng-collapse-icon-position-${this.config.expandIconPosition}`
    );

    if (this.config.accordion) {
      this.container.classList.add("ng-collapse-accordion");
    }

    if (this.config.classNames.container) {
      const customClasses = Array.isArray(this.config.classNames.container)
        ? this.config.classNames.container
        : [this.config.classNames.container];
      customClasses.forEach((className) => {
        if (className) this.container.classList.add(className);
      });
    }

    if (this.config.styles.container) {
      Object.assign(this.container.style, this.config.styles.container);
    }
  }

  _render() {
    this.container.innerHTML = "";

    this.state.panels.forEach((panel) => {
      const panelElement = this._createPanelElement(panel);
      this.container.appendChild(panelElement);
    });

    this._updatePanelsState();
  }

  _createPanelElement(panel) {
    const panelElem = document.createElement("div");
    panelElem.className = "ng-collapse-item";

    if (panel.disabled) {
      panelElem.classList.add("ng-collapse-item-disabled");
    }

    if (panel.className) {
      panelElem.classList.add(panel.className);
    }

    if (this.config.classNames.item) {
      const customClasses = Array.isArray(this.config.classNames.item)
        ? this.config.classNames.item
        : [this.config.classNames.item];
      customClasses.forEach((className) => {
        if (className) panelElem.classList.add(className);
      });
    }

    if (this.config.styles.item) {
      Object.assign(panelElem.style, this.config.styles.item);
    }

    Object.assign(panelElem.style, panel.style);

    const header = this._createPanelHeader(panel);
    panelElem.appendChild(header);

    const content = this._createPanelContent(panel);
    panelElem.appendChild(content);

    return panelElem;
  }

  _createPanelHeader(panel) {
    const header = document.createElement("div");
    header.className = "ng-collapse-header";
    header.dataset.key = panel.key;
    header.tabIndex = panel.disabled ? -1 : 0;

    if (panel.disabled) {
      header.classList.add("ng-collapse-header-disabled");
    }

    if (this.config.classNames.header) {
      const customClasses = Array.isArray(this.config.classNames.header)
        ? this.config.classNames.header
        : [this.config.classNames.header];
      customClasses.forEach((className) => {
        if (className) header.classList.add(className);
      });
    }

    if (this.config.styles.header) {
      Object.assign(header.style, this.config.styles.header);
    }

    const iconArea = this._createExpandIcon(panel);
    header.appendChild(iconArea);

    const title = this._createTitle(panel);
    header.appendChild(title);

    if (panel.extra) {
      const extra = this._createExtraContent(panel);
      header.appendChild(extra);
    }

    return header;
  }

  _createExpandIcon(panel) {
    const iconArea = document.createElement("div");
    iconArea.className = `ng-collapse-expand-icon ng-collapse-expand-icon-${this.config.expandIconPosition}`;

    if (!panel.showArrow) {
      iconArea.classList.add("ng-collapse-no-arrow");
      return iconArea;
    }

    // 获取图标
    const isActive = this.state.activeKeys.includes(panel.key);

    // 创建图标
    const icon = this._createIconElement(isActive, panel.iconProps);
    iconArea.appendChild(icon);

    return iconArea;
  }

  _createIconElement(isActive, iconProps) {
    const {
      width = 16,
      height = 16,
      strokeWidth = 2,
      stroke = "rgba(0, 0, 0, 0.45)",
      fill = "none",
      style = {},
    } = iconProps;

    // 创建SVG元素
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    // 应用样式
    Object.assign(svg.style, {
      display: "block",
      transition: "transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
      ...style,
    });

    // 创建path元素 - 细线条向右箭头
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // 使用细线条的向右箭头路径
    const pathData = "M9 6l6 6-6 6";

    path.setAttribute("d", pathData);
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", strokeWidth.toString());
    path.setAttribute("fill", fill);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);

    // 如果当前是展开状态，旋转图标90度（变成向下箭头）
    if (isActive) {
      svg.style.transform = "rotate(90deg)";
    }

    return svg;
  }

  _createTitle(panel) {
    const title = document.createElement("div");
    title.className = "ng-collapse-header-text";
    title.textContent = panel.label;
    return title;
  }

  _createExtraContent(panel) {
    const extra = document.createElement("div");
    extra.className = "ng-collapse-extra";

    if (typeof panel.extra === "string") {
      extra.innerHTML = panel.extra;
    } else if (panel.extra instanceof HTMLElement) {
      extra.appendChild(panel.extra);
    } else if (typeof panel.extra === "function") {
      const extraContent = panel.extra();
      if (typeof extraContent === "string") {
        extra.innerHTML = extraContent;
      } else if (extraContent instanceof HTMLElement) {
        extra.appendChild(extraContent);
      }
    }

    return extra;
  }

  _createPanelContent(panel) {
    const content = document.createElement("div");
    content.className = "ng-collapse-content";
    content.dataset.key = panel.key;

    if (this.config.classNames.content) {
      const customClasses = Array.isArray(this.config.classNames.content)
        ? this.config.classNames.content
        : [this.config.classNames.content];
      customClasses.forEach((className) => {
        if (className) content.classList.add(className);
      });
    }

    if (this.config.styles.content) {
      Object.assign(content.style, this.config.styles.content);
    }

    const contentBox = document.createElement("div");
    contentBox.className = "ng-collapse-content-box";

    if (this.config.classNames.contentBox) {
      const customClasses = Array.isArray(this.config.classNames.contentBox)
        ? this.config.classNames.contentBox
        : [this.config.classNames.contentBox];
      customClasses.forEach((className) => {
        if (className) contentBox.classList.add(className);
      });
    }

    if (this.config.styles.contentBox) {
      Object.assign(contentBox.style, this.config.styles.contentBox);
    }

    // 渲染内容
    if (
      panel.forceRender ||
      this.state.activeKeys.includes(panel.key) ||
      !panel.destroyInactivePanel
    ) {
      this._renderPanelContent(panel, contentBox);
    }

    content.appendChild(contentBox);
    return content;
  }

  _renderPanelContent(panel, container) {
    container.innerHTML = "";

    if (!panel.children) return;

    if (typeof panel.children === "string") {
      container.innerHTML = panel.children;
    } else if (panel.children instanceof HTMLElement) {
      container.appendChild(panel.children.cloneNode(true));
    } else if (typeof panel.children === "function") {
      const content = panel.children();
      if (typeof content === "string") {
        container.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        container.appendChild(content);
      }
    }
  }

  _updatePanelsState() {
    const panels = this.container.querySelectorAll(".ng-collapse-item");

    panels.forEach((panel) => {
      const key = panel.querySelector(".ng-collapse-header")?.dataset.key;
      if (!key) return;

      const header = panel.querySelector(".ng-collapse-header");
      const content = panel.querySelector(".ng-collapse-content");
      const contentBox = panel.querySelector(".ng-collapse-content-box");
      const expandIcon = panel.querySelector(".ng-collapse-expand-icon");
      const svg = expandIcon?.querySelector("svg");

      const isActive = this.state.activeKeys.includes(key);
      const panelConfig = this.state.panels.find((p) => p.key === key);

      if (isActive) {
        panel.classList.add("ng-collapse-item-active");

        // 更新图标旋转状态
        if (svg) {
          svg.style.transform = "rotate(90deg)";
        }

        if (content) {
          content.classList.remove("ng-collapse-content-hidden");

          if (contentBox && panelConfig && !panelConfig.forceRender) {
            const height = contentBox.scrollHeight;
            content.style.height = `${height}px`;

            setTimeout(() => {
              if (content.style.height !== "0px") {
                content.style.height = "auto";
              }
            }, 300);
          }
        }

        if (
          panelConfig &&
          (panelConfig.forceRender || !panelConfig.destroyInactivePanel)
        ) {
          this._renderPanelContent(panelConfig, contentBox);
        }
      } else {
        panel.classList.remove("ng-collapse-item-active");

        // 更新图标旋转状态
        if (svg) {
          svg.style.transform = "rotate(0deg)";
        }

        if (content) {
          if (contentBox && !panelConfig?.forceRender) {
            const height = contentBox.scrollHeight;
            content.style.height = `${height}px`;

            // 强制重绘
            content.offsetHeight;

            content.style.height = "0px";

            setTimeout(() => {
              if (!this.state.activeKeys.includes(key)) {
                content.classList.add("ng-collapse-content-hidden");
                content.style.height = "";
              }
            }, 300);
          } else {
            content.classList.add("ng-collapse-content-hidden");
          }
        }

        if (
          panelConfig &&
          panelConfig.destroyInactivePanel &&
          !panelConfig.forceRender
        ) {
          contentBox.innerHTML = "";
        }
      }
    });
  }

  _bindEvents() {
    this.container.addEventListener("click", (e) => {
      this._handleCollapseClick(e);
    });

    this.container.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const header = e.target.closest(".ng-collapse-header");
        if (header) {
          this._togglePanelByHeader(header);
        }
      }
    });
  }

  _handleCollapseClick(e) {
    const header = e.target.closest(".ng-collapse-header");
    if (header) {
      this._togglePanelByHeader(header);
    }
  }

  _togglePanelByHeader(header) {
    const panel = header.closest(".ng-collapse-item");
    const key = header.dataset.key;
    const panelConfig = this.state.panels.find((p) => p.key === key);

    if (
      panel.classList.contains("ng-collapse-item-disabled") ||
      header.classList.contains("ng-collapse-header-disabled")
    ) {
      return;
    }

    if (panelConfig) {
      const clickTarget = event.target;
      const isIconClick = clickTarget.closest(".ng-collapse-expand-icon");

      if (panelConfig.collapsible === "icon" && !isIconClick) {
        return;
      } else if (panelConfig.collapsible === "disabled") {
        return;
      }
    }

    this._togglePanel(key);
  }

  _togglePanel(key) {
    const wasActive = this.state.activeKeys.includes(key);
    let newActiveKeys;

    if (this.config.accordion) {
      newActiveKeys = wasActive ? [] : [key];
    } else {
      newActiveKeys = wasActive
        ? this.state.activeKeys.filter((k) => k !== key)
        : [...this.state.activeKeys, key];
    }

    this.state.activeKeys = newActiveKeys;

    this._updatePanelsState();

    if (this.config.onChange) {
      if (this.config.accordion) {
        this.config.onChange(
          newActiveKeys.length > 0 ? newActiveKeys[0] : undefined
        );
      } else {
        this.config.onChange(newActiveKeys);
      }
    }
  }

  // ==================== 公共API ====================

  addPanel(panelConfig, index = -1) {
    const normalizedPanel = {
      key: panelConfig.key || `panel-${this.state.panels.length}`,
      label:
        panelConfig.label ||
        panelConfig.header ||
        `Panel ${this.state.panels.length + 1}`,
      children: panelConfig.children || panelConfig.content || "",
      className: panelConfig.className || "",
      style: panelConfig.style || {},
      disabled: panelConfig.disabled || false,
      showArrow:
        panelConfig.showArrow !== undefined
          ? panelConfig.showArrow
          : this.config.showArrow,
      extra: panelConfig.extra || null,
      collapsible: panelConfig.collapsible || this.config.collapsible,
      forceRender: panelConfig.forceRender || this.config.forceRender,
      destroyInactivePanel:
        panelConfig.destroyInactivePanel !== undefined
          ? panelConfig.destroyInactivePanel
          : this.config.destroyInactivePanel,
      expandIcon: panelConfig.expandIcon,
      collapseIcon: panelConfig.collapseIcon,
      iconProps: { ...this.config.iconProps, ...(panelConfig.iconProps || {}) },
    };

    if (index === -1 || index >= this.state.panels.length) {
      this.state.panels.push(normalizedPanel);
    } else {
      this.state.panels.splice(index, 0, normalizedPanel);
    }

    this._render();
    return normalizedPanel.key;
  }

  removePanel(key) {
    const index = this.state.panels.findIndex((p) => p.key === key);
    if (index === -1) return false;

    this.state.panels.splice(index, 1);
    this.state.activeKeys = this.state.activeKeys.filter((k) => k !== key);

    this._render();
    return true;
  }

  updatePanel(key, updates) {
    const index = this.state.panels.findIndex((p) => p.key === key);
    if (index === -1) return false;

    this.state.panels[index] = {
      ...this.state.panels[index],
      ...updates,
      key: key,
    };

    this._render();
    return true;
  }

  expandPanel(key) {
    if (this.state.activeKeys.includes(key)) return;

    if (this.config.accordion) {
      this.state.activeKeys = [key];
    } else {
      this.state.activeKeys.push(key);
    }

    this._updatePanelsState();

    if (this.config.onChange) {
      if (this.config.accordion) {
        this.config.onChange(key);
      } else {
        this.config.onChange([...this.state.activeKeys]);
      }
    }
  }

  collapsePanel(key) {
    if (!this.state.activeKeys.includes(key)) return;

    this.state.activeKeys = this.state.activeKeys.filter((k) => k !== key);
    this._updatePanelsState();

    if (this.config.onChange) {
      if (this.config.accordion) {
        this.config.onChange(undefined);
      } else {
        this.config.onChange([...this.state.activeKeys]);
      }
    }
  }

  expandAll() {
    if (this.config.accordion) return;

    this.state.activeKeys = this.state.panels
      .filter((p) => !p.disabled && p.collapsible !== "disabled")
      .map((p) => p.key);

    this._updatePanelsState();

    if (this.config.onChange) {
      this.config.onChange([...this.state.activeKeys]);
    }
  }

  collapseAll() {
    this.state.activeKeys = [];
    this._updatePanelsState();

    if (this.config.onChange) {
      this.config.onChange(this.config.accordion ? undefined : []);
    }
  }

  getActiveKey() {
    if (this.config.accordion) {
      return this.state.activeKeys.length > 0
        ? this.state.activeKeys[0]
        : undefined;
    }
    return [...this.state.activeKeys];
  }

  getPanel(key) {
    return this.state.panels.find((p) => p.key === key);
  }

  getPanels() {
    return [...this.state.panels];
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this._setupContainer();
    this._render();
  }

  forceUpdate() {
    this._updatePanelsState();
  }

  updateIconConfig(key, iconConfig) {
    const panel = this.state.panels.find((p) => p.key === key);
    if (panel) {
      panel.iconProps = { ...panel.iconProps, ...iconConfig };
      this._render();
      return true;
    }
    return false;
  }

  updateAllIcons(iconConfig) {
    this.config.iconProps = { ...this.config.iconProps, ...iconConfig };
    this.state.panels.forEach((panel) => {
      panel.iconProps = { ...panel.iconProps, ...iconConfig };
    });
    this._render();
  }

  // 添加自定义图标方法
  setCustomIcon(key, iconType = "chevron") {
    const panel = this.state.panels.find((p) => p.key === key);
    if (!panel) return false;

    // 清除已有的自定义图标
    delete panel.expandIcon;
    delete panel.collapseIcon;

    if (iconType === "chevron") {
      // 使用chevron细箭头
      panel.iconProps = {
        ...panel.iconProps,
        strokeWidth: 2,
        stroke: "rgba(0, 0, 0, 0.45)",
      };
    } else if (iconType === "caret") {
      // 使用caret细箭头
      panel.iconProps = {
        ...panel.iconProps,
        strokeWidth: 1.5,
        stroke: "rgba(0, 0, 0, 0.6)",
      };
    } else if (iconType === "plus") {
      // 使用加号/减号图标
      panel.expandIcon = (isActive) => {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.setAttribute("aria-hidden", "true");

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        if (isActive) {
          // 减号
          path.setAttribute("d", "M5 12h14");
        } else {
          // 加号
          path.setAttribute("d", "M12 5v14M5 12h14");
        }
        path.setAttribute("stroke", "rgba(0, 0, 0, 0.45)");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");

        svg.appendChild(path);
        return svg;
      };
    }

    this._render();
    return true;
  }

  destroy() {
    this.container.innerHTML = "";
    this.container.className = "";
    this.container.style = "";

    this.container.replaceWith(this.container.cloneNode(true));

    this.state = {
      activeKeys: [],
      panels: [],
      isFirstRender: true,
    };
  }
}

// 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = NGCollapse;
} else {
  window.NGCollapse = NGCollapse;
}
