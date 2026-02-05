/**
 * 纯JS下拉菜单组件
 * 版本: 2.0
 * 功能: 支持多种按钮风格、多级子菜单、分组、自定义图标
 * 优化: 防止被遮挡、自带SVG图标库
 */
class DropdownMenu {
  /**
   * 构造函数
   * @param {string|HTMLElement} container - 容器ID或DOM元素
   * @param {Object} options - 配置选项
   */
  constructor(container, options = {}) {
    // 初始化配置
    this.options = this.mergeOptions(options);

    // 获取容器元素
    if (typeof container === "string") {
      this.container = document.querySelector(container);
      if (!this.container) {
        console.error(`未找到ID为"${container}"的元素`);
        return;
      }
    } else if (container instanceof HTMLElement) {
      this.container = container;
    } else {
      console.error("container参数必须是元素ID或DOM元素");
      return;
    }

    // 组件状态
    this.isOpen = false;
    this.eventLog = [];

    // SVG图标库
    this.svgIcons = this.createSvgIconLibrary();

    // 初始化组件
    this.init();
  }

  /**
   * 合并默认配置和用户配置
   */
  mergeOptions(userOptions) {
    const defaultOptions = {
      triggerStyle: "button-style", // 'text-only', 'button-style', 'split-button'
      showIcons: true,
      showGroups: true,
      menuItems: [],
      onMainButtonClick: null,
      position: "bottom-left", // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
      zIndex: 1000,
      animation: true,
      closeOnClickOutside: true,
      closeOnItemClick: true,
      buttonText: "下拉菜单", // 新增：自定义按钮文字
      buttonStyle: {}, // 新增：自定义按钮样式
    };

    return { ...defaultOptions, ...userOptions };
  }

  /**
   * 创建SVG图标库
   */
  createSvgIconLibrary() {
    return {
      edit: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
      delete:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
      copy: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
      share:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
      download:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
      user: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
      settings:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
      help: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
      plus: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
      file: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
      folder:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
      link: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
      envelope:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
      cog: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
      sliders:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1zm10.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zm-7 0H5c-.28 0-.5.22-.5.5s.22.5.5.5h2.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm8.5 0h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5zM6 15h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm2.5-1.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm8.5 0h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5z"/></svg>',
      chevronDown:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',
      chevronRight:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
    };
  }

  /**
   * 初始化组件
   */
  init() {
    // 清理容器
    this.container.innerHTML = "";

    // 添加组件wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "dropdown-wrapper";
    this.container.appendChild(wrapper);
    this.wrapper = wrapper;

    // 渲染触发按钮
    this.renderTrigger();

    // 渲染菜单
    this.renderMenu();

    // 绑定事件
    this.bindEvents();

    // 应用初始按钮样式
    this.applyButtonStyle();

    // 添加样式
    this.addStyles();
  }

  /**
   * 渲染触发按钮
   */
  renderTrigger() {
    const { triggerStyle, buttonText } = this.options;
    let triggerHtml = "";

    if (triggerStyle === "split-button") {
      triggerHtml = `
                    <div class="dropdown-trigger ${triggerStyle}">
                        <span class="split-button-main">${buttonText}</span>
                        <div class="split-button-divider-wrapper">
                            <div class="split-button-divider"></div>
                        </div>
                        <span class="split-button-dropdown">
                            <span class="dropdown-icon">${this.svgIcons.chevronDown}</span>
                        </span>
                    </div>
                `;
    } else {
      triggerHtml = `
                    <div class="dropdown-trigger ${triggerStyle}">
                        <span>${buttonText}</span>
                        <span class="dropdown-icon">${this.svgIcons.chevronDown}</span>
                    </div>
                `;
    }

    this.wrapper.innerHTML = triggerHtml;
    this.trigger = this.wrapper.querySelector(".dropdown-trigger");

    // 为split-button模式保存主按钮和下拉按钮的引用
    if (triggerStyle === "split-button") {
      this.mainButton = this.wrapper.querySelector(".split-button-main");
      this.dropdownButton = this.wrapper.querySelector(
        ".split-button-dropdown",
      );
    }
  }

  /**
   * 应用按钮样式
   */
  applyButtonStyle() {
    const { buttonStyle } = this.options;

    if (!buttonStyle || Object.keys(buttonStyle).length === 0) return;

    // 应用样式到主按钮
    Object.keys(buttonStyle).forEach((styleKey) => {
      if (this.trigger) {
        this.trigger.style[styleKey] = buttonStyle[styleKey];
      }

      // 如果是split-button模式，还需要应用到各个部分
      if (this.options.triggerStyle === "split-button") {
        // 应用样式到主按钮部分
        if (this.mainButton) {
          // 对于split-button，某些样式可能需要特殊处理
          const isBackgroundColor =
            styleKey === "backgroundColor" || styleKey === "background-color";
          const isColor = styleKey === "color";

          if (isBackgroundColor) {
            this.mainButton.style.backgroundColor = buttonStyle[styleKey];
            this.dropdownButton.style.backgroundColor = buttonStyle[styleKey];
            this.wrapper
              .querySelector(".split-button-divider")
              ?.style.setProperty("background-color", buttonStyle[styleKey]);
            this.wrapper
              .querySelector(".split-button-divider::before")
              ?.style.setProperty("background-color", buttonStyle[styleKey]);
          } else if (isColor) {
            this.mainButton.style.color = buttonStyle[styleKey];
            this.dropdownButton.style.color = buttonStyle[styleKey];
          } else {
            this.mainButton.style[styleKey] = buttonStyle[styleKey];
          }
        }
      }
    });
  }

  /**
   * 渲染菜单
   */
  renderMenu() {
    const menu = document.createElement("div");
    menu.className = "dropdown-menu";
    menu.setAttribute("data-position", this.options.position);
    menu.innerHTML = this.buildMenuHTML(this.options.menuItems);
    this.wrapper.appendChild(menu);
    this.menu = menu;

    // 设置z-index确保不被遮挡
    this.menu.style.zIndex = this.options.zIndex;
  }

  /**
   * 构建菜单HTML
   */
  buildMenuHTML(menuItems, isSubmenu = false) {
    let html = "";
    let currentGroup = null;

    menuItems.forEach((item, index) => {
      // 处理分组
      if (
        item.group &&
        item.group !== currentGroup &&
        this.options.showGroups
      ) {
        if (currentGroup !== null) {
          html += '<div class="dropdown-item divider"></div>';
        }
        html += `<div class="dropdown-item group-title">${item.group}</div>`;
        currentGroup = item.group;
      } else if (!item.group && currentGroup !== null) {
        currentGroup = null;
      }

      // 处理菜单项
      if (item.type === "divider") {
        html += '<div class="dropdown-item divider"></div>';
      } else {
        const hasSubmenu = item.children && item.children.length > 0;
        const disabledClass = item.disabled ? "disabled" : "";
        const submenuClass = hasSubmenu ? "has-submenu" : "";

        html += `
                        <div class="dropdown-item ${disabledClass} ${submenuClass}" 
                             data-index="${index}"
                             ${item.id ? `data-id="${item.id}"` : ""}>
                            ${
                              this.options.showIcons && item.icon
                                ? this.getIconHTML(item.icon)
                                : ""
                            }
                            <span>${item.text}</span>
                            ${
                              hasSubmenu
                                ? this.buildSubmenuHTML(item.children, index)
                                : ""
                            }
                        </div>
                    `;
      }
    });

    return html;
  }

  /**
   * 构建子菜单HTML
   */
  buildSubmenuHTML(children, parentIndex) {
    return `
                <div class="submenu">
                    ${this.buildMenuHTML(children, true)}
                </div>
            `;
  }

  /**
   * 获取图标HTML
   */
  getIconHTML(iconConfig) {
    if (typeof iconConfig === "string") {
      // 如果是内置SVG图标名称
      if (this.svgIcons[iconConfig]) {
        return `<div class="dropdown-icon">${this.svgIcons[iconConfig]}</div>`;
      }
      // 如果是Font Awesome类名（兼容性处理）
      return `<i class="${iconConfig}"></i>`;
    } else if (iconConfig.svg) {
      // 如果是SVG字符串
      return `<div class="dropdown-icon">${iconConfig.svg}</div>`;
    }
    return "";
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const { triggerStyle, closeOnClickOutside } = this.options;

    // 绑定触发按钮事件
    if (triggerStyle === "split-button") {
      // split-button模式，主按钮和下拉按钮分别绑定事件
      if (this.mainButton) {
        this.mainButton.addEventListener("click", (e) => {
          e.stopPropagation();
          this.handleMainButtonClick();
        });
      }

      if (this.dropdownButton) {
        this.dropdownButton.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleMenu();
        });
      }
    } else {
      // 其他模式，整个触发按钮点击时切换菜单
      this.trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // 菜单项点击事件
    this.menu.addEventListener("click", (e) => {
      const menuItem = e.target.closest(
        ".dropdown-item:not(.disabled):not(.divider):not(.group-title)",
      );
      if (!menuItem) return;

      e.stopPropagation();

      const index = menuItem.dataset.index;
      const id = menuItem.dataset.id;

      // 查找对应的菜单项配置
      const menuItemConfig = this.findMenuItem(this.options.menuItems, index);

      if (menuItemConfig) {
        if (menuItemConfig.children && menuItemConfig.children.length > 0) {
          // 如果有子菜单，不关闭主菜单
          return;
        }

        this.handleItemClick(menuItemConfig, id);
      }

      if (this.options.closeOnItemClick) {
        this.closeMenu();
      }
    });

    // 点击页面其他地方关闭菜单
    if (closeOnClickOutside) {
      document.addEventListener("click", () => {
        this.closeMenu();
      });
    }

    // 鼠标悬停显示子菜单
    this.menu.addEventListener("mouseenter", (e) => {
      if (e.target.classList.contains("dropdown-item")) {
        this.menu.querySelectorAll(".dropdown-item").forEach((item) => {
          if (item !== e.target) {
            item.classList.remove("active");
          }
        });
        e.target.classList.add("active");
      }
    });

    // 防止子菜单被遮挡 - 监听窗口变化和滚动
    window.addEventListener("resize", () => this.adjustMenuPosition());
    window.addEventListener("scroll", () => this.adjustMenuPosition(), true);
  }

  /**
   * 处理主按钮点击（仅split-button模式）
   */
  handleMainButtonClick() {
    // 触发自定义事件
    const event = new CustomEvent("main-button-click", {
      bubbles: true,
      detail: { source: "main-button" },
    });
    this.container.dispatchEvent(event);

    // 执行回调函数
    if (
      this.options.onMainButtonClick &&
      typeof this.options.onMainButtonClick === "function"
    ) {
      this.options.onMainButtonClick();
    }
  }

  /**
   * 查找菜单项
   */
  findMenuItem(menuItems, index) {
    let currentIndex = 0;

    for (const item of menuItems) {
      if (item.type === "divider") continue;

      if (currentIndex == index) {
        return item;
      }

      currentIndex++;

      if (item.children && item.children.length > 0) {
        const found = this.findMenuItem(item.children, index);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * 处理菜单项点击
   */
  handleItemClick(item, id) {
    const eventDetail = {
      item,
      id,
      text: item.text,
      timestamp: new Date().toLocaleTimeString(),
    };

    // 触发自定义事件
    const event = new CustomEvent("menu-item-click", {
      detail: eventDetail,
      bubbles: true,
    });
    this.container.dispatchEvent(event);

    // 执行菜单项点击回调
    if (item.onClick && typeof item.onClick === "function") {
      item.onClick(item);
    }
  }

  /**
   * 调整菜单位置以防止被遮挡
   */
  adjustMenuPosition() {
    if (!this.menu || !this.menu.classList.contains("show")) return;

    const menuRect = this.menu.getBoundingClientRect();
    const triggerRect = this.trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 计算最佳位置
    let top = triggerRect.bottom + 5;
    let left = triggerRect.left;

    // 检查底部空间是否足够
    if (menuRect.height + triggerRect.bottom > viewportHeight - 20) {
      // 空间不足，尝试显示在上方
      if (triggerRect.top > menuRect.height + 20) {
        top = triggerRect.top - menuRect.height - 5;
      }
    }

    // 检查右侧空间是否足够
    if (menuRect.width + triggerRect.left > viewportWidth - 20) {
      left = Math.max(10, viewportWidth - menuRect.width - 20);
    }

    // 应用新位置
    this.menu.style.top = `${top}px`;
    this.menu.style.left = `${left}px`;
    this.menu.style.position = "fixed";
  }

  /**
   * 切换菜单显示/隐藏
   */
  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  /**
   * 打开菜单
   */
  openMenu() {
    this.menu.classList.add("show");

    // 仅text-only模式不添加active类
    if (this.options.triggerStyle !== "text-only") {
      this.trigger.classList.add("active");
    }

    this.isOpen = true;

    // 调整菜单位置
    setTimeout(() => {
      this.adjustMenuPosition();
    }, 10);
  }

  /**
   * 关闭菜单
   */
  closeMenu() {
    this.menu.classList.remove("show");
    this.trigger.classList.remove("active");

    // 关闭所有活动的子菜单项
    this.menu.querySelectorAll(".dropdown-item.active").forEach((item) => {
      item.classList.remove("active");
    });

    this.isOpen = false;
  }

  /**
   * 更新配置
   */
  updateOptions(newOptions) {
    const oldButtonStyle = this.options.buttonStyle;
    const oldButtonText = this.options.buttonText;

    this.options = { ...this.options, ...newOptions };

    // 如果buttonText有变化，重新渲染触发按钮
    if (
      newOptions.buttonText !== undefined &&
      this.trigger &&
      oldButtonText !== newOptions.buttonText
    ) {
      this.renderTrigger();
      this.bindEvents();
      this.applyButtonStyle();
    }

    // 如果buttonStyle有变化，重新应用样式
    if (newOptions.buttonStyle !== undefined && this.trigger) {
      this.applyButtonStyle();
    }

    // 如果menuItems有变化，重新渲染菜单
    if (newOptions.menuItems !== undefined && this.menu) {
      this.menu.innerHTML = this.buildMenuHTML(this.options.menuItems);
    }
  }

  /**
   * 设置菜单项
   */
  setMenuItems(menuItems) {
    this.options.menuItems = menuItems;

    // 更新菜单内容
    if (this.menu) {
      this.menu.innerHTML = this.buildMenuHTML(menuItems);
    }
  }

  /**
   * 设置按钮文字
   */
  setButtonText(text) {
    this.options.buttonText = text;

    // 更新按钮文字
    const buttonTextElement = this.trigger.querySelector("span:first-child");
    if (
      buttonTextElement &&
      !buttonTextElement.classList.contains("split-button-main") &&
      !buttonTextElement.classList.contains("split-button-dropdown")
    ) {
      buttonTextElement.textContent = text;
    }

    // 如果是split-button模式，更新主按钮文字
    if (this.options.triggerStyle === "split-button" && this.mainButton) {
      this.mainButton.textContent = text;
    }
  }

  /**
   * 设置按钮样式
   */
  setButtonStyle(styleObject) {
    this.options.buttonStyle = { ...this.options.buttonStyle, ...styleObject };
    this.applyButtonStyle();
  }

  /**
   * 重置按钮样式
   */
  resetButtonStyle() {
    this.options.buttonStyle = {};
    if (this.trigger) {
      this.trigger.style.cssText = "";
      this.renderTrigger();
      this.bindEvents();
      this.addStyles(); // 重新添加基础样式
    }
  }

  /**
   * 添加样式
   */
  addStyles() {
    // 如果样式已经添加，则跳过
    if (document.getElementById("dropdown-menu-styles")) return;

    const style = document.createElement("style");
    style.id = "dropdown-menu-styles";
    style.textContent = `
                .dropdown-wrapper {
                    position: relative;
                    display: inline-block;
                }
                
                .dropdown-trigger {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background-color: #fff;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    padding: 8px 15px;
                    font-size: 14px;
                    color: #262626;
                    cursor: pointer;
                    transition: all 0.3s;
                    user-select: none;
                    height: 32px;
                    line-height: 1;
                }
                
                .dropdown-trigger:hover {
                    border-color: #1890ff;
                    color: #1890ff;
                }
                
                .dropdown-trigger:active,
                .dropdown-trigger.active {
                    border-color: #1890ff;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                }
                
                .dropdown-trigger.text-only {
                    border: none;
                    padding: 8px 5px;
                    color: #1890ff;
                    background-color: transparent;
                    height: auto;
                }
                
                .dropdown-trigger.text-only:active,
                .dropdown-trigger.text-only.active {
                    border: none;
                    box-shadow: none;
                    background-color: transparent;
                }
                
                .dropdown-trigger.button-style {
                    background-color: #1890ff;
                    color: white;
                    border-color: #1890ff;
                }
                
                .dropdown-trigger.button-style:hover {
                    background-color: #40a9ff;
                    border-color: #40a9ff;
                }
                
                .dropdown-trigger.split-button {
                    padding: 0;
                    overflow: hidden;
                    display: inline-flex;
                    align-items: stretch;
                    height: 32px;
                    gap: 0;
                }
                
                .split-button-main {
                    padding: 0 15px;
                    background-color: #1890ff;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.3s;
                    min-width: 70px;
                }
                
                .split-button-main:hover {
                    background-color: #40a9ff;
                }
                
                /* 分割线容器 */
.split-button-divider-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1px;
    position: relative;
    overflow: hidden;
}

/* 上蓝白蓝线条100%：上蓝20%，白60%，下蓝20% */
.split-button-divider {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #1890ff;
    overflow: hidden;
}

/* 上蓝部分（20%） */
.split-button-divider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 20%;
    background-color: #1890ff;
}

/* 中间白部分（60%） */
.split-button-divider::after {
    content: '';
    position: absolute;
    top: 20%;
    left: 0;
    width: 100%;
    height: 60%;
    background-color: rgba(255, 255, 255, 0.3);
}

/* 下蓝部分（20%） */
.split-button-divider span {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20%;
    background-color: #1890ff;
}
                
                .split-button-main,
                .split-button-dropdown {
                    margin: 0;
                    flex-shrink: 0;
                }
                
                .split-button-dropdown {
                    padding: 0 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #1890ff;
                    color: white;
                    transition: all 0.3s;
                    min-width: 32px;
                }
                
                .split-button-dropdown:hover {
                    background-color: #40a9ff;
                }
                
                .dropdown-icon {
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .dropdown-icon svg {
                    width: 100%;
                    height: 100%;
                    fill: currentColor;
                }
                
                .dropdown-trigger.split-button.active .dropdown-icon svg {
                    transform: rotate(180deg);
                    transition: transform 0.3s;
                }
                
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    min-width: 180px;
                    background-color: white;
                    border-radius: 4px;
                    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
                                0 6px 16px 0 rgba(0, 0, 0, 0.08),
                                0 9px 28px 8px rgba(0, 0, 0, 0.05);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s;
                    padding: 8px 0;
                    margin-top: 5px;
                }
                
                .dropdown-menu.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .dropdown-item {
                    padding: 8px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #262626;
                    font-size: 14px;
                    transition: all 0.3s;
                    position: relative;
                    min-height: 32px;
                }
                
                .dropdown-item:hover {
                    background-color: #f5f5f5;
                }
                
                .dropdown-item.has-submenu::after {
                    content: ">";
                    position: absolute;
                    right: 12px;
                    font-size: 12px;
                    color: #999;
                }
                
                .dropdown-item.disabled {
                    color: #bfbfbf;
                    cursor: not-allowed;
                }
                
                .dropdown-item.disabled:hover {
                    background-color: transparent;
                }
                
                /* 优化分隔线高度 - 减少高度占用 */
                .dropdown-item.divider {
                    border-bottom: 1px solid #e8e8e8;
                    margin: 4px 0;
                    padding: 0;
                    height: 1px;
                    min-height: 1px;
                    cursor: default;
                }
                
                .dropdown-item.divider:hover {
                    background-color: transparent;
                }
                
                .dropdown-item.group-title {
                    color: #8c8c8c;
                    font-size: 12px;
                    padding: 5px 16px;
                    cursor: default;
                    min-height: 24px;
                    line-height: 1.2;
                }
                
                .dropdown-item.group-title:hover {
                    background-color: transparent;
                }
                
                .submenu {
                    position: absolute;
                    top: -8px;
                    left: 100%;
                    min-width: 180px;
                    background-color: white;
                    border-radius: 4px;
                    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
                                0 6px 16px 0 rgba(0, 0, 0, 0.08),
                                0 9px 28px 8px rgba(0, 0, 0, 0.05);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateX(-10px);
                    transition: all 0.3s;
                    padding: 8px 0;
                }
                
                .dropdown-item:hover > .submenu {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(5px);
                }
            `;

    document.head.appendChild(style);
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 移除事件监听器
    document.removeEventListener("click", () => this.closeMenu());
    window.removeEventListener("resize", () => this.adjustMenuPosition());
    window.removeEventListener("scroll", () => this.adjustMenuPosition(), true);

    // 清理容器
    if (this.container && this.wrapper) {
      this.container.removeChild(this.wrapper);
    }
  }
}

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = DropdownMenu;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return DropdownMenu;
  });
} else {
  window.DropdownMenu = DropdownMenu;
}
