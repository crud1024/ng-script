(function(){
"use strict";
var __modules = {};
__modules["./ButtonGroup/V1/ButtonGroup.js"] = function(module, exports, require){
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

    // 添加样式
    this.addStyles();
  }

  /**
   * 渲染触发按钮
   */
  renderTrigger() {
    const { triggerStyle } = this.options;
    let triggerHtml = "";

    if (triggerStyle === "split-button") {
      triggerHtml = `
                    <div class="dropdown-trigger ${triggerStyle}">
                        <span class="split-button-main">操作</span>
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
                        <span>下拉菜单</span>
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
        ".split-button-dropdown"
      );
    }
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
        ".dropdown-item:not(.disabled):not(.divider):not(.group-title)"
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
    this.options = { ...this.options, ...newOptions };
    this.init();
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

};
__modules["./Collapse/V1/Collapse.js"] = function(module, exports, require){
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

};
__modules["./Components.all.osd.min.js"] = function(module, exports, require){
!function(){"use strict";var n={"./ButtonGroup/V1/ButtonGroup.js":function(n,t,e){class i{constructor(n,t={}){if(this.options=this.mergeOptions(t),"string"==typeof n){if(this.container=document.querySelector(n),!this.container)return void console.error(`未找到ID为"${n}"的元素`)}else{if(!(n instanceof HTMLElement))return void console.error("container参数必须是元素ID或DOM元素");this.container=n}this.isOpen=!1,this.eventLog=[],this.svgIcons=this.createSvgIconLibrary(),this.init()}mergeOptions(n){return{triggerStyle:"button-style",showIcons:!0,showGroups:!0,menuItems:[],onMainButtonClick:null,position:"bottom-left",zIndex:1e3,animation:!0,closeOnClickOutside:!0,closeOnItemClick:!0,...n}}createSvgIconLibrary(){return{edit:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',delete:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',copy:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',share:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',download:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',user:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',settings:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',help:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',plus:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',file:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',folder:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',link:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',envelope:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',cog:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',sliders:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1zm10.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zm-7 0H5c-.28 0-.5.22-.5.5s.22.5.5.5h2.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm8.5 0h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5zM6 15h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm2.5-1.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm8.5 0h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5z"/></svg>',chevronDown:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',chevronRight:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>'}}init(){this.container.innerHTML="";const n=document.createElement("div");n.className="dropdown-wrapper",this.container.appendChild(n),this.wrapper=n,this.renderTrigger(),this.renderMenu(),this.bindEvents(),this.addStyles()}renderTrigger(){const{triggerStyle:n}=this.options;let t="";t="split-button"===n?`\n                    <div class="dropdown-trigger ${n}">\n                        <span class="split-button-main">操作</span>\n                        <div class="split-button-divider-wrapper">\n                            <div class="split-button-divider"></div>\n                        </div>\n                        <span class="split-button-dropdown">\n                            <span class="dropdown-icon">${this.svgIcons.chevronDown}</span>\n                        </span>\n                    </div>\n                `:`\n                    <div class="dropdown-trigger ${n}">\n                        <span>下拉菜单</span>\n                        <span class="dropdown-icon">${this.svgIcons.chevronDown}</span>\n                    </div>\n                `,this.wrapper.innerHTML=t,this.trigger=this.wrapper.querySelector(".dropdown-trigger"),"split-button"===n&&(this.mainButton=this.wrapper.querySelector(".split-button-main"),this.dropdownButton=this.wrapper.querySelector(".split-button-dropdown"))}renderMenu(){const n=document.createElement("div");n.className="dropdown-menu",n.setAttribute("data-position",this.options.position),n.innerHTML=this.buildMenuHTML(this.options.menuItems),this.wrapper.appendChild(n),this.menu=n,this.menu.style.zIndex=this.options.zIndex}buildMenuHTML(n,t=!1){let e="",i=null;return n.forEach((n,t)=>{if(n.group&&n.group!==i&&this.options.showGroups?(null!==i&&(e+='<div class="dropdown-item divider"></div>'),e+=`<div class="dropdown-item group-title">${n.group}</div>`,i=n.group):n.group||null===i||(i=null),"divider"===n.type)e+='<div class="dropdown-item divider"></div>';else{const i=n.children&&n.children.length>0,o=n.disabled?"disabled":"";e+=`\n                        <div class="dropdown-item ${o} ${i?"has-submenu":""}" \n                             data-index="${t}"\n                             ${n.id?`data-id="${n.id}"`:""}>\n                            ${this.options.showIcons&&n.icon?this.getIconHTML(n.icon):""}\n                            <span>${n.text}</span>\n                            ${i?this.buildSubmenuHTML(n.children,t):""}\n                        </div>\n                    `}}),e}buildSubmenuHTML(n,t){return`\n                <div class="submenu">\n                    ${this.buildMenuHTML(n,!0)}\n                </div>\n            `}getIconHTML(n){return"string"==typeof n?this.svgIcons[n]?`<div class="dropdown-icon">${this.svgIcons[n]}</div>`:`<i class="${n}"></i>`:n.svg?`<div class="dropdown-icon">${n.svg}</div>`:""}bindEvents(){const{triggerStyle:n,closeOnClickOutside:t}=this.options;"split-button"===n?(this.mainButton&&this.mainButton.addEventListener("click",n=>{n.stopPropagation(),this.handleMainButtonClick()}),this.dropdownButton&&this.dropdownButton.addEventListener("click",n=>{n.stopPropagation(),this.toggleMenu()})):this.trigger.addEventListener("click",n=>{n.stopPropagation(),this.toggleMenu()}),this.menu.addEventListener("click",n=>{const t=n.target.closest(".dropdown-item:not(.disabled):not(.divider):not(.group-title)");if(!t)return;n.stopPropagation();const e=t.dataset.index,i=t.dataset.id,o=this.findMenuItem(this.options.menuItems,e);if(o){if(o.children&&o.children.length>0)return;this.handleItemClick(o,i)}this.options.closeOnItemClick&&this.closeMenu()}),t&&document.addEventListener("click",()=>{this.closeMenu()}),this.menu.addEventListener("mouseenter",n=>{n.target.classList.contains("dropdown-item")&&(this.menu.querySelectorAll(".dropdown-item").forEach(t=>{t!==n.target&&t.classList.remove("active")}),n.target.classList.add("active"))}),window.addEventListener("resize",()=>this.adjustMenuPosition()),window.addEventListener("scroll",()=>this.adjustMenuPosition(),!0)}handleMainButtonClick(){const n=new CustomEvent("main-button-click",{bubbles:!0,detail:{source:"main-button"}});this.container.dispatchEvent(n),this.options.onMainButtonClick&&"function"==typeof this.options.onMainButtonClick&&this.options.onMainButtonClick()}findMenuItem(n,t){let e=0;for(const i of n)if("divider"!==i.type){if(e==t)return i;if(e++,i.children&&i.children.length>0){const n=this.findMenuItem(i.children,t);if(n)return n}}return null}handleItemClick(n,t){const e={item:n,id:t,text:n.text,timestamp:(new Date).toLocaleTimeString()},i=new CustomEvent("menu-item-click",{detail:e,bubbles:!0});this.container.dispatchEvent(i),n.onClick&&"function"==typeof n.onClick&&n.onClick(n)}adjustMenuPosition(){if(!this.menu||!this.menu.classList.contains("show"))return;const n=this.menu.getBoundingClientRect(),t=this.trigger.getBoundingClientRect(),e=window.innerHeight,i=window.innerWidth;let o=t.bottom+5,s=t.left;n.height+t.bottom>e-20&&t.top>n.height+20&&(o=t.top-n.height-5),n.width+t.left>i-20&&(s=Math.max(10,i-n.width-20)),this.menu.style.top=`${o}px`,this.menu.style.left=`${s}px`,this.menu.style.position="fixed"}toggleMenu(){this.isOpen?this.closeMenu():this.openMenu()}openMenu(){this.menu.classList.add("show"),"text-only"!==this.options.triggerStyle&&this.trigger.classList.add("active"),this.isOpen=!0,setTimeout(()=>{this.adjustMenuPosition()},10)}closeMenu(){this.menu.classList.remove("show"),this.trigger.classList.remove("active"),this.menu.querySelectorAll(".dropdown-item.active").forEach(n=>{n.classList.remove("active")}),this.isOpen=!1}updateOptions(n){this.options={...this.options,...n},this.init()}setMenuItems(n){this.options.menuItems=n,this.menu&&(this.menu.innerHTML=this.buildMenuHTML(n))}addStyles(){if(document.getElementById("dropdown-menu-styles"))return;const n=document.createElement("style");n.id="dropdown-menu-styles",n.textContent="\n                .dropdown-wrapper {\n                    position: relative;\n                    display: inline-block;\n                }\n                \n                .dropdown-trigger {\n                    display: inline-flex;\n                    align-items: center;\n                    justify-content: center;\n                    gap: 8px;\n                    background-color: #fff;\n                    border: 1px solid #d9d9d9;\n                    border-radius: 4px;\n                    padding: 8px 15px;\n                    font-size: 14px;\n                    color: #262626;\n                    cursor: pointer;\n                    transition: all 0.3s;\n                    user-select: none;\n                    height: 32px;\n                    line-height: 1;\n                }\n                \n                .dropdown-trigger:hover {\n                    border-color: #1890ff;\n                    color: #1890ff;\n                }\n                \n                .dropdown-trigger:active,\n                .dropdown-trigger.active {\n                    border-color: #1890ff;\n                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);\n                }\n                \n                .dropdown-trigger.text-only {\n                    border: none;\n                    padding: 8px 5px;\n                    color: #1890ff;\n                    background-color: transparent;\n                    height: auto;\n                }\n                \n                .dropdown-trigger.text-only:active,\n                .dropdown-trigger.text-only.active {\n                    border: none;\n                    box-shadow: none;\n                    background-color: transparent;\n                }\n                \n                .dropdown-trigger.button-style {\n                    background-color: #1890ff;\n                    color: white;\n                    border-color: #1890ff;\n                }\n                \n                .dropdown-trigger.button-style:hover {\n                    background-color: #40a9ff;\n                    border-color: #40a9ff;\n                }\n                \n                .dropdown-trigger.split-button {\n                    padding: 0;\n                    overflow: hidden;\n                    display: inline-flex;\n                    align-items: stretch;\n                    height: 32px;\n                    gap: 0;\n                }\n                \n                .split-button-main {\n                    padding: 0 15px;\n                    background-color: #1890ff;\n                    color: white;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                    font-size: 14px;\n                    transition: all 0.3s;\n                    min-width: 70px;\n                }\n                \n                .split-button-main:hover {\n                    background-color: #40a9ff;\n                }\n                \n                /* 分割线容器 */\n.split-button-divider-wrapper {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 1px;\n    position: relative;\n    overflow: hidden;\n}\n\n/* 上蓝白蓝线条100%：上蓝20%，白60%，下蓝20% */\n.split-button-divider {\n    width: 100%;\n    height: 100%;\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    background-color: #1890ff;\n    overflow: hidden;\n}\n\n/* 上蓝部分（20%） */\n.split-button-divider::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 20%;\n    background-color: #1890ff;\n}\n\n/* 中间白部分（60%） */\n.split-button-divider::after {\n    content: '';\n    position: absolute;\n    top: 20%;\n    left: 0;\n    width: 100%;\n    height: 60%;\n    background-color: rgba(255, 255, 255, 0.3);\n}\n\n/* 下蓝部分（20%） */\n.split-button-divider span {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 20%;\n    background-color: #1890ff;\n}\n                \n                .split-button-main,\n                .split-button-dropdown {\n                    margin: 0;\n                    flex-shrink: 0;\n                }\n                \n                .split-button-dropdown {\n                    padding: 0 10px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                    background-color: #1890ff;\n                    color: white;\n                    transition: all 0.3s;\n                    min-width: 32px;\n                }\n                \n                .split-button-dropdown:hover {\n                    background-color: #40a9ff;\n                }\n                \n                .dropdown-icon {\n                    width: 16px;\n                    height: 16px;\n                    display: inline-flex;\n                    align-items: center;\n                    justify-content: center;\n                    flex-shrink: 0;\n                }\n                \n                .dropdown-icon svg {\n                    width: 100%;\n                    height: 100%;\n                    fill: currentColor;\n                }\n                \n                .dropdown-trigger.split-button.active .dropdown-icon svg {\n                    transform: rotate(180deg);\n                    transition: transform 0.3s;\n                }\n                \n                .dropdown-menu {\n                    position: absolute;\n                    top: 100%;\n                    left: 0;\n                    min-width: 180px;\n                    background-color: white;\n                    border-radius: 4px;\n                    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),\n                                0 6px 16px 0 rgba(0, 0, 0, 0.08),\n                                0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                    opacity: 0;\n                    visibility: hidden;\n                    transform: translateY(-10px);\n                    transition: all 0.3s;\n                    padding: 8px 0;\n                    margin-top: 5px;\n                }\n                \n                .dropdown-menu.show {\n                    opacity: 1;\n                    visibility: visible;\n                    transform: translateY(0);\n                }\n                \n                .dropdown-item {\n                    padding: 8px 16px;\n                    cursor: pointer;\n                    display: flex;\n                    align-items: center;\n                    gap: 10px;\n                    color: #262626;\n                    font-size: 14px;\n                    transition: all 0.3s;\n                    position: relative;\n                    min-height: 32px;\n                }\n                \n                .dropdown-item:hover {\n                    background-color: #f5f5f5;\n                }\n                \n                .dropdown-item.has-submenu::after {\n                    content: \">\";\n                    position: absolute;\n                    right: 12px;\n                    font-size: 12px;\n                    color: #999;\n                }\n                \n                .dropdown-item.disabled {\n                    color: #bfbfbf;\n                    cursor: not-allowed;\n                }\n                \n                .dropdown-item.disabled:hover {\n                    background-color: transparent;\n                }\n                \n                /* 优化分隔线高度 - 减少高度占用 */\n                .dropdown-item.divider {\n                    border-bottom: 1px solid #e8e8e8;\n                    margin: 4px 0;\n                    padding: 0;\n                    height: 1px;\n                    min-height: 1px;\n                    cursor: default;\n                }\n                \n                .dropdown-item.divider:hover {\n                    background-color: transparent;\n                }\n                \n                .dropdown-item.group-title {\n                    color: #8c8c8c;\n                    font-size: 12px;\n                    padding: 5px 16px;\n                    cursor: default;\n                    min-height: 24px;\n                    line-height: 1.2;\n                }\n                \n                .dropdown-item.group-title:hover {\n                    background-color: transparent;\n                }\n                \n                .submenu {\n                    position: absolute;\n                    top: -8px;\n                    left: 100%;\n                    min-width: 180px;\n                    background-color: white;\n                    border-radius: 4px;\n                    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),\n                                0 6px 16px 0 rgba(0, 0, 0, 0.08),\n                                0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                    opacity: 0;\n                    visibility: hidden;\n                    transform: translateX(-10px);\n                    transition: all 0.3s;\n                    padding: 8px 0;\n                }\n                \n                .dropdown-item:hover > .submenu {\n                    opacity: 1;\n                    visibility: visible;\n                    transform: translateX(5px);\n                }\n            ",document.head.appendChild(n)}destroy(){document.removeEventListener("click",()=>this.closeMenu()),window.removeEventListener("resize",()=>this.adjustMenuPosition()),window.removeEventListener("scroll",()=>this.adjustMenuPosition(),!0),this.container&&this.wrapper&&this.container.removeChild(this.wrapper)}}void 0!==n&&n.exports?n.exports=i:"function"==typeof define&&define.amd?define([],function(){return i}):window.DropdownMenu=i},"./Components.osd.all.min.js":function(n,t,e){!function(){var n={"./ButtonGroup/V1/ButtonGroup.js":function(n,t,e){class i{constructor(n,t={}){if(this.options=this.mergeOptions(t),"string"==typeof n){if(this.container=document.querySelector(n),!this.container)return void console.error(`未找到ID为"${n}"的元素`)}else{if(!(n instanceof HTMLElement))return void console.error("container参数必须是元素ID或DOM元素");this.container=n}this.isOpen=!1,this.eventLog=[],this.svgIcons=this.createSvgIconLibrary(),this.init()}mergeOptions(n){return{triggerStyle:"button-style",showIcons:!0,showGroups:!0,menuItems:[],onMainButtonClick:null,position:"bottom-left",zIndex:1e3,animation:!0,closeOnClickOutside:!0,closeOnItemClick:!0,...n}}createSvgIconLibrary(){return{edit:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',delete:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',copy:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',share:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',download:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',user:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',settings:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',help:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',plus:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',file:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',folder:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',link:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',envelope:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',cog:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',sliders:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1zm10.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zm-7 0H5c-.28 0-.5.22-.5.5s.22.5.5.5h2.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm8.5 0h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5zM6 15h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm2.5-1.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm8.5 0h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5z"/></svg>',chevronDown:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',chevronRight:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>'}}init(){this.container.innerHTML="";const n=document.createElement("div");n.className="dropdown-wrapper",this.container.appendChild(n),this.wrapper=n,this.renderTrigger(),this.renderMenu(),this.bindEvents(),this.addStyles()}renderTrigger(){const{triggerStyle:n}=this.options;let t="";t="split-button"===n?`\n                    <div class="dropdown-trigger ${n}">\n                        <span class="split-button-main">操作</span>\n                        <div class="split-button-divider-wrapper">\n                            <div class="split-button-divider"></div>\n                        </div>\n                        <span class="split-button-dropdown">\n                            <span class="dropdown-icon">${this.svgIcons.chevronDown}</span>\n                        </span>\n                    </div>\n                `:`\n                    <div class="dropdown-trigger ${n}">\n                        <span>下拉菜单</span>\n                        <span class="dropdown-icon">${this.svgIcons.chevronDown}</span>\n                    </div>\n                `,this.wrapper.innerHTML=t,this.trigger=this.wrapper.querySelector(".dropdown-trigger"),"split-button"===n&&(this.mainButton=this.wrapper.querySelector(".split-button-main"),this.dropdownButton=this.wrapper.querySelector(".split-button-dropdown"))}renderMenu(){const n=document.createElement("div");n.className="dropdown-menu",n.setAttribute("data-position",this.options.position),n.innerHTML=this.buildMenuHTML(this.options.menuItems),this.wrapper.appendChild(n),this.menu=n,this.menu.style.zIndex=this.options.zIndex}buildMenuHTML(n,t=!1){let e="",i=null;return n.forEach((n,t)=>{if(n.group&&n.group!==i&&this.options.showGroups?(null!==i&&(e+='<div class="dropdown-item divider"></div>'),e+=`<div class="dropdown-item group-title">${n.group}</div>`,i=n.group):n.group||null===i||(i=null),"divider"===n.type)e+='<div class="dropdown-item divider"></div>';else{const i=n.children&&n.children.length>0,o=n.disabled?"disabled":"";e+=`\n                        <div class="dropdown-item ${o} ${i?"has-submenu":""}" \n                             data-index="${t}"\n                             ${n.id?`data-id="${n.id}"`:""}>\n                            ${this.options.showIcons&&n.icon?this.getIconHTML(n.icon):""}\n                            <span>${n.text}</span>\n                            ${i?this.buildSubmenuHTML(n.children,t):""}\n                        </div>\n                    `}}),e}buildSubmenuHTML(n,t){return`\n                <div class="submenu">\n                    ${this.buildMenuHTML(n,!0)}\n                </div>\n            `}getIconHTML(n){return"string"==typeof n?this.svgIcons[n]?`<div class="dropdown-icon">${this.svgIcons[n]}</div>`:`<i class="${n}"></i>`:n.svg?`<div class="dropdown-icon">${n.svg}</div>`:""}bindEvents(){const{triggerStyle:n,closeOnClickOutside:t}=this.options;"split-button"===n?(this.mainButton&&this.mainButton.addEventListener("click",n=>{n.stopPropagation(),this.handleMainButtonClick()}),this.dropdownButton&&this.dropdownButton.addEventListener("click",n=>{n.stopPropagation(),this.toggleMenu()})):this.trigger.addEventListener("click",n=>{n.stopPropagation(),this.toggleMenu()}),this.menu.addEventListener("click",n=>{const t=n.target.closest(".dropdown-item:not(.disabled):not(.divider):not(.group-title)");if(!t)return;n.stopPropagation();const e=t.dataset.index,i=t.dataset.id,o=this.findMenuItem(this.options.menuItems,e);if(o){if(o.children&&o.children.length>0)return;this.handleItemClick(o,i)}this.options.closeOnItemClick&&this.closeMenu()}),t&&document.addEventListener("click",()=>{this.closeMenu()}),this.menu.addEventListener("mouseenter",n=>{n.target.classList.contains("dropdown-item")&&(this.menu.querySelectorAll(".dropdown-item").forEach(t=>{t!==n.target&&t.classList.remove("active")}),n.target.classList.add("active"))}),window.addEventListener("resize",()=>this.adjustMenuPosition()),window.addEventListener("scroll",()=>this.adjustMenuPosition(),!0)}handleMainButtonClick(){const n=new CustomEvent("main-button-click",{bubbles:!0,detail:{source:"main-button"}});this.container.dispatchEvent(n),this.options.onMainButtonClick&&"function"==typeof this.options.onMainButtonClick&&this.options.onMainButtonClick()}findMenuItem(n,t){let e=0;for(const i of n)if("divider"!==i.type){if(e==t)return i;if(e++,i.children&&i.children.length>0){const n=this.findMenuItem(i.children,t);if(n)return n}}return null}handleItemClick(n,t){const e={item:n,id:t,text:n.text,timestamp:(new Date).toLocaleTimeString()},i=new CustomEvent("menu-item-click",{detail:e,bubbles:!0});this.container.dispatchEvent(i),n.onClick&&"function"==typeof n.onClick&&n.onClick(n)}adjustMenuPosition(){if(!this.menu||!this.menu.classList.contains("show"))return;const n=this.menu.getBoundingClientRect(),t=this.trigger.getBoundingClientRect(),e=window.innerHeight,i=window.innerWidth;let o=t.bottom+5,s=t.left;n.height+t.bottom>e-20&&t.top>n.height+20&&(o=t.top-n.height-5),n.width+t.left>i-20&&(s=Math.max(10,i-n.width-20)),this.menu.style.top=`${o}px`,this.menu.style.left=`${s}px`,this.menu.style.position="fixed"}toggleMenu(){this.isOpen?this.closeMenu():this.openMenu()}openMenu(){this.menu.classList.add("show"),"text-only"!==this.options.triggerStyle&&this.trigger.classList.add("active"),this.isOpen=!0,setTimeout(()=>{this.adjustMenuPosition()},10)}closeMenu(){this.menu.classList.remove("show"),this.trigger.classList.remove("active"),this.menu.querySelectorAll(".dropdown-item.active").forEach(n=>{n.classList.remove("active")}),this.isOpen=!1}updateOptions(n){this.options={...this.options,...n},this.init()}setMenuItems(n){this.options.menuItems=n,this.menu&&(this.menu.innerHTML=this.buildMenuHTML(n))}addStyles(){if(document.getElementById("dropdown-menu-styles"))return;const n=document.createElement("style");n.id="dropdown-menu-styles",n.textContent="\n                .dropdown-wrapper {\n                    position: relative;\n                    display: inline-block;\n                }\n                \n                .dropdown-trigger {\n                    display: inline-flex;\n                    align-items: center;\n                    justify-content: center;\n                    gap: 8px;\n                    background-color: #fff;\n                    border: 1px solid #d9d9d9;\n                    border-radius: 4px;\n                    padding: 8px 15px;\n                    font-size: 14px;\n                    color: #262626;\n                    cursor: pointer;\n                    transition: all 0.3s;\n                    user-select: none;\n                    height: 32px;\n                    line-height: 1;\n                }\n                \n                .dropdown-trigger:hover {\n                    border-color: #1890ff;\n                    color: #1890ff;\n                }\n                \n                .dropdown-trigger:active,\n                .dropdown-trigger.active {\n                    border-color: #1890ff;\n                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);\n                }\n                \n                .dropdown-trigger.text-only {\n                    border: none;\n                    padding: 8px 5px;\n                    color: #1890ff;\n                    background-color: transparent;\n                    height: auto;\n                }\n                \n                .dropdown-trigger.text-only:active,\n                .dropdown-trigger.text-only.active {\n                    border: none;\n                    box-shadow: none;\n                    background-color: transparent;\n                }\n                \n                .dropdown-trigger.button-style {\n                    background-color: #1890ff;\n                    color: white;\n                    border-color: #1890ff;\n                }\n                \n                .dropdown-trigger.button-style:hover {\n                    background-color: #40a9ff;\n                    border-color: #40a9ff;\n                }\n                \n                .dropdown-trigger.split-button {\n                    padding: 0;\n                    overflow: hidden;\n                    display: inline-flex;\n                    align-items: stretch;\n                    height: 32px;\n                    gap: 0;\n                }\n                \n                .split-button-main {\n                    padding: 0 15px;\n                    background-color: #1890ff;\n                    color: white;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                    font-size: 14px;\n                    transition: all 0.3s;\n                    min-width: 70px;\n                }\n                \n                .split-button-main:hover {\n                    background-color: #40a9ff;\n                }\n                \n                /* 分割线容器 */\n.split-button-divider-wrapper {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 1px;\n    position: relative;\n    overflow: hidden;\n}\n\n/* 上蓝白蓝线条100%：上蓝20%，白60%，下蓝20% */\n.split-button-divider {\n    width: 100%;\n    height: 100%;\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    background-color: #1890ff;\n    overflow: hidden;\n}\n\n/* 上蓝部分（20%） */\n.split-button-divider::before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 20%;\n    background-color: #1890ff;\n}\n\n/* 中间白部分（60%） */\n.split-button-divider::after {\n    content: '';\n    position: absolute;\n    top: 20%;\n    left: 0;\n    width: 100%;\n    height: 60%;\n    background-color: rgba(255, 255, 255, 0.3);\n}\n\n/* 下蓝部分（20%） */\n.split-button-divider span {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 20%;\n    background-color: #1890ff;\n}\n                \n                .split-button-main,\n                .split-button-dropdown {\n                    margin: 0;\n                    flex-shrink: 0;\n                }\n                \n                .split-button-dropdown {\n                    padding: 0 10px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                    background-color: #1890ff;\n                    color: white;\n                    transition: all 0.3s;\n                    min-width: 32px;\n                }\n                \n                .split-button-dropdown:hover {\n                    background-color: #40a9ff;\n                }\n                \n                .dropdown-icon {\n                    width: 16px;\n                    height: 16px;\n                    display: inline-flex;\n                    align-items: center;\n                    justify-content: center;\n                    flex-shrink: 0;\n                }\n                \n                .dropdown-icon svg {\n                    width: 100%;\n                    height: 100%;\n                    fill: currentColor;\n                }\n                \n                .dropdown-trigger.split-button.active .dropdown-icon svg {\n                    transform: rotate(180deg);\n                    transition: transform 0.3s;\n                }\n                \n                .dropdown-menu {\n                    position: absolute;\n                    top: 100%;\n                    left: 0;\n                    min-width: 180px;\n                    background-color: white;\n                    border-radius: 4px;\n                    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),\n                                0 6px 16px 0 rgba(0, 0, 0, 0.08),\n                                0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                    opacity: 0;\n                    visibility: hidden;\n                    transform: translateY(-10px);\n                    transition: all 0.3s;\n                    padding: 8px 0;\n                    margin-top: 5px;\n                }\n                \n                .dropdown-menu.show {\n                    opacity: 1;\n                    visibility: visible;\n                    transform: translateY(0);\n                }\n                \n                .dropdown-item {\n                    padding: 8px 16px;\n                    cursor: pointer;\n                    display: flex;\n                    align-items: center;\n                    gap: 10px;\n                    color: #262626;\n                    font-size: 14px;\n                    transition: all 0.3s;\n                    position: relative;\n                    min-height: 32px;\n                }\n                \n                .dropdown-item:hover {\n                    background-color: #f5f5f5;\n                }\n                \n                .dropdown-item.has-submenu::after {\n                    content: \">\";\n                    position: absolute;\n                    right: 12px;\n                    font-size: 12px;\n                    color: #999;\n                }\n                \n                .dropdown-item.disabled {\n                    color: #bfbfbf;\n                    cursor: not-allowed;\n                }\n                \n                .dropdown-item.disabled:hover {\n                    background-color: transparent;\n                }\n                \n                /* 优化分隔线高度 - 减少高度占用 */\n                .dropdown-item.divider {\n                    border-bottom: 1px solid #e8e8e8;\n                    margin: 4px 0;\n                    padding: 0;\n                    height: 1px;\n                    min-height: 1px;\n                    cursor: default;\n                }\n                \n                .dropdown-item.divider:hover {\n                    background-color: transparent;\n                }\n                \n                .dropdown-item.group-title {\n                    color: #8c8c8c;\n                    font-size: 12px;\n                    padding: 5px 16px;\n                    cursor: default;\n                    min-height: 24px;\n                    line-height: 1.2;\n                }\n                \n                .dropdown-item.group-title:hover {\n                    background-color: transparent;\n                }\n                \n                .submenu {\n                    position: absolute;\n                    top: -8px;\n                    left: 100%;\n                    min-width: 180px;\n                    background-color: white;\n                    border-radius: 4px;\n                    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),\n                                0 6px 16px 0 rgba(0, 0, 0, 0.08),\n                                0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                    opacity: 0;\n                    visibility: hidden;\n                    transform: translateX(-10px);\n                    transition: all 0.3s;\n                    padding: 8px 0;\n                }\n                \n                .dropdown-item:hover > .submenu {\n                    opacity: 1;\n                    visibility: visible;\n                    transform: translateX(5px);\n                }\n            ",document.head.appendChild(n)}destroy(){document.removeEventListener("click",()=>this.closeMenu()),window.removeEventListener("resize",()=>this.adjustMenuPosition()),window.removeEventListener("scroll",()=>this.adjustMenuPosition(),!0),this.container&&this.wrapper&&this.container.removeChild(this.wrapper)}}void 0!==n&&n.exports?n.exports=i:"function"==typeof define&&define.amd?define([],function(){return i}):window.DropdownMenu=i},"./DownloadAttachs/V1/DownloadAttachs.js":function(n,t,e){},"./Loading/V1/FishingAnimation.js":function(n,t,e){function i(n,t="Loading"){const e="fishing-animation-"+Date.now();if(!document.getElementById("fishing-animation-styles")){const n=document.createElement("style");n.id="fishing-animation-styles",n.textContent='\n        /* 引入字体库 */\n        @import url(\'https://fonts.googleapis.com/css?family=Montserrat:300,400,700\');\n        \n        .fishing-animation-container {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: transparent;\n            z-index: 998;\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            align-items: center;\n            overflow: hidden;\n        }\n        \n        .fishing-animation-content {\n            position: relative;\n            width: 400px;\n            height: 400px;\n            transform: scale(0.8);\n            margin-bottom: 5px; /* 为文字留出空间 */\n        }\n        \n        .fishing-animation-bowl {\n            width: 250px;\n            height: 250px;\n            border: 5px solid #fff;\n            border-radius: 50%;\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            background: rgba(90, 201, 226, 0.3);\n            overflow: hidden;\n        }\n        \n        .fishing-animation-bowl:before {\n            content: "";\n            position: absolute;\n            bottom: -25px;\n            left: 50px;\n            width: 150px;\n            height: 50px;\n            border-radius: 50%;\n            background: rgba(0,0,0,0.15);\n        }\n        \n        .fishing-animation-bowl:after {\n            content: "";\n            position: absolute;\n            top: 10px;\n            left: calc(25% - 3px);\n            width: 50%;\n            height: 40px;\n            border: 3px solid #fff;\n            border-radius: 50%;\n        }\n        \n        .fishing-animation-water {\n            position: absolute;\n            bottom: 5%;\n            left: 0;\n            width: 100%;\n            height: 50%;\n            overflow: hidden;\n            animation: fishing-top-inner 5s ease infinite;\n        }\n        \n        @keyframes fishing-top-inner {\n            from {\n                transform: rotate(0deg);\n                margin-left: 0px;\n            }\n            25% {\n                transform: rotate(3deg);\n                margin-left: -3px;\n            }\n            50% {\n                transform: rotate(-6deg);\n                margin-left: 6px;\n            }\n            75% {\n                transform: rotate(5deg);\n                margin-left: -5px;\n            }\n            to {\n                transform: rotate(0deg);\n                margin-left: 0px;\n            }\n        }\n        \n        .fishing-animation-water-inner {\n            width: 225px;\n            height: 225px;\n            border-radius: 50%;\n            background: #4e99ce;\n            position: absolute;\n            bottom: 0;\n            left: 12.5px;\n        }\n        \n        .fishing-animation-top-water {\n            position: absolute;\n            width: 225px;\n            height: 60px;\n            border-radius: 50%;\n            background: #82bde6;\n            bottom: 105px;\n            left: 12.5px;\n            animation: fishing-top 5s ease infinite;\n        }\n        \n        @keyframes fishing-top {\n            from {\n                transform: rotate(0deg);\n            }\n            25% {\n                transform: rotate(3deg);\n            }\n            50% {\n                transform: rotate(-6deg);\n            }\n            75% {\n                transform: rotate(5deg);\n            }\n            to {\n                transform: rotate(0deg);\n            }\n        }\n        \n        .fishing-animation-center-box {\n            height: 300px;\n            width: 300px;\n            position: absolute;\n            top: calc(50% - 190px);\n            left: calc(50% - 147px); /* 修改这里：从 -150px 改为 -147px，向右移动3px */\n            animation: fishing-float 5s ease infinite;\n            transform: scale(0.4);\n        }\n        \n        @keyframes fishing-float {\n            from {\n                transform: translate(0, 0px) scale(0.4);\n            }\n            25% {\n                transform: translate(0, 4px) scale(0.4);\n            }\n            50% {\n                transform: translate(0, -7px) scale(0.4);\n            }\n            75% {\n                transform: translate(0, 7px) scale(0.4);\n            }\n            to {\n                transform: translate(0, -0px) scale(0.4);\n            }\n        }\n        \n        .fishing-animation-fisherman {\n            width: 300px;\n            height: 200px;\n            position: relative;\n        }\n        \n        .fishing-animation-fisherman .body {\n            width: 60px;\n            height: 120px;\n            background: #d2bd24;\n            position: absolute;\n            bottom: 20px;\n            right: 30px;\n            -webkit-clip-path: ellipse(40% 50% at 0% 50%);\n            clip-path: ellipse(40% 50% at 0% 50%);\n            transform: rotate(-20deg);\n        }\n        \n        .fishing-animation-fisherman .body:before {\n            content: "";\n            width: 60px;\n            height: 160px;\n            background: #d2bd24;\n            position: absolute;\n            bottom: -8px;\n            right: 12px;\n            -webkit-clip-path: ellipse(90% 50% at 0% 50%);\n            clip-path: ellipse(90% 50% at 0% 50%);\n            transform: rotate(10deg);\n        }\n        \n        .fishing-animation-fisherman .right-arm {\n            width: 15px;\n            height: 90px;\n            background: #d2bd24;\n            border-radius: 15px;\n            position: absolute;\n            bottom: 40px;\n            right: 120px;\n            transform: rotate(40deg);\n        }\n        \n        .fishing-animation-fisherman .right-arm:before {\n            content: "";\n            background: #ffd1b5;\n            width: 20px;\n            height: 20px;\n            position: absolute;\n            top: 65px;\n            right: 40px;\n            border-radius: 15px;\n        }\n        \n        .fishing-animation-fisherman .right-arm:after {\n            content: "";\n            width: 15px;\n            height: 40px;\n            background: #d2bd24;\n            border-radius: 15px;\n            position: absolute;\n            bottom: -12px;\n            right: 15px;\n            transform: rotate(-80deg);\n            border-top-left-radius: 0px;\n            border-top-right-radius: 0px;\n        }\n        \n        .fishing-animation-fisherman .right-leg {\n            width: 15px;\n            height: 90px;\n            background: #bf3526;\n            border-radius: 15px;\n            position: absolute;\n            bottom: -15px;\n            right: 120px;\n            transform: rotate(-60deg);\n        }\n        \n        .fishing-animation-fisherman .right-leg:before {\n            content: "";\n            width: 15px;\n            height: 80px;\n            background: #bf3526;\n            border-radius: 15px;\n            position: absolute;\n            bottom: 35px;\n            left: -30px;\n            transform: rotate(80deg);\n        }\n        \n        .fishing-animation-fisherman .right-leg:after {\n            content: "";\n            position: absolute;\n            bottom: 30px;\n            left: -60px;\n            width: 25px;\n            height: 80px;\n            background: #338ca0;\n            transform: rotate(80deg);\n        }\n        \n        .fishing-animation-rod {\n            position: absolute;\n            width: 280px;\n            height: 4px;\n            bottom: 100px;\n            left: -105px;\n            background: #331604;\n            transform: rotate(10deg);\n        }\n        \n        .fishing-animation-rod .handle {\n            width: 15px;\n            height: 15px;\n            border-radius: 15px;\n            left: 230px;\n            top: 2px;\n            background: #efdddb;\n        }\n        \n        .fishing-animation-rod .handle:before {\n            content: "";\n            position: absolute;\n            width: 10px;\n            height: 3px;\n            left: 8px;\n            top: 5px;\n            background: #1a1a1a;\n        }\n        \n        .fishing-animation-rod .rope {\n            width: 2px;\n            height: 190px;\n            top: -14px;\n            left: 17px;\n            transform: rotate(-10deg);\n            background: #fff;\n        }\n        \n        .fishing-animation-fisherman .butt {\n            position: absolute;\n            width: 40px;\n            height: 15px;\n            border-radius: 15px;\n            bottom: 5px;\n            right: 70px;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-fisherman .left-arm {\n            position: absolute;\n            width: 15px;\n            height: 70px;\n            bottom: 45px;\n            right: 100px;\n            border-radius: 15px;\n            transform: rotate(30deg);\n            background: #e8d93d;\n        }\n        \n        .fishing-animation-fisherman .left-arm:before {\n            content: "";\n            position: absolute;\n            width: 20px;\n            height: 20px;\n            top: 40px;\n            right: 40px;\n            border-radius: 15px;\n            background: #ffd1b5;\n        }\n        \n        .fishing-animation-fisherman .left-arm:after {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 45px;\n            bottom: -12px;\n            right: 15px;\n            border-radius: 15px;\n            transform: rotate(-70deg);\n            background: #e8d93d;\n        }\n        \n        .fishing-animation-fisherman .left-leg {\n            position: absolute;\n            width: 15px;\n            height: 80px;\n            bottom: -10px;\n            right: 90px;\n            border-radius: 15px;\n            transform: rotate(-50deg);\n            background: #de4125;\n        }\n        \n        .fishing-animation-fisherman .left-leg:before {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 80px;\n            bottom: 15px;\n            left: -28px;\n            border-radius: 15px;\n            transform: rotate(60deg);\n            background: #de4125;\n        }\n        \n        .fishing-animation-fisherman .left-leg:after {\n            content: "";\n            position: absolute;\n            width: 25px;\n            height: 80px;\n            bottom: 2px;\n            left: -55px;\n            transform: rotate(60deg);\n            background: #338ca0;\n        }\n        \n        .fishing-animation-head {\n            position: absolute;\n            width: 45px;\n            height: 60px;\n            bottom: 100px;\n            right: 85px;\n            border-radius: 50%;\n            transform: rotate(10deg);\n        }\n        \n        .fishing-animation-head .face {\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            border-radius: 50%;\n            overflow: hidden;\n            background: #d76540;\n        }\n        \n        .fishing-animation-head .face:before {\n            content: "";\n            position: absolute;\n            width: 45px;\n            height: 65px;\n            top: -15px;\n            left: -8px;\n            border-radius: 50%;\n            background: #ffd1b5;\n            transform: rotate(-10deg);\n        }\n        \n        .fishing-animation-head .eyebrows {\n            position: absolute;\n            width: 12px;\n            height: 5px;\n            top: 12px;\n            left: -2px;\n            transform: rotate(-10deg);\n            background: #e67e5b;\n        }\n        \n        .fishing-animation-head .eyebrows:before {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 5px;\n            top: 0px;\n            left: 17px;\n            background: #e67e5b;\n        }\n        \n        .fishing-animation-head .eyes {\n            position: absolute;\n            width: 4px;\n            height: 6px;\n            top: 20px;\n            left: 5px;\n            border-radius: 50%;\n            transform: rotate(-10deg);\n            background: #1a1a1a;\n        }\n        \n        .fishing-animation-head .eyes:before {\n            content: "";\n            position: absolute;\n            width: 4px;\n            height: 6px;\n            top: 0px;\n            left: 15px;\n            border-radius: 50%;\n            background: #1a1a1a;\n        }\n        \n        .fishing-animation-head .nose {\n            position: absolute;\n            width: 0;\n            height: 0;\n            border-top: 15px solid transparent;\n            border-bottom: 6px solid transparent;\n            border-right: 12px solid #fab58e;\n            top: 20px;\n            left: 5px;\n            transform: rotate(-10deg);\n        }\n        \n        .fishing-animation-head .beard {\n            position: absolute;\n            width: 30px;\n            height: 20px;\n            top: 30px;\n            left: 1px;\n            transform: rotate(-10deg);\n            clip-path: ellipse(50% 50% at 50% 100%);\n            background: #e67e5b;\n        }\n        \n        .fishing-animation-head .hat {\n            position: absolute;\n            width: 60px;\n            height: 6px;\n            top: 6px;\n            left: -10px;\n            background: #3d402b;\n        }\n        \n        .fishing-animation-head .hat:before {\n            content: "";\n            position: absolute;\n            width: 45px;\n            height: 30px;\n            left: 8px;\n            bottom: 6px;\n            clip-path: ellipse(50% 50% at 50% 90%);\n            background: #7b8445;\n        }\n        \n        .fishing-animation-boat {\n            width: 300px;\n            height: 75px;\n            margin-top: -10px;\n        }\n        \n        .fishing-animation-boat .motor {\n            width: 60px;\n            height: 60px;\n            border-radius: 15px;\n            top: -40px;\n            right: -280px;\n            background: #ef4723;\n        }\n        \n        .fishing-animation-boat .motor:before {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 75px;\n            clip-path: polygon(0 0, 100% 0, 60% 100%, 0% 100%);\n            top: 40px;\n            right: 15px;\n            z-index: -1;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-boat .motor:after {\n            content: "";\n            position: absolute;\n            width: 60px;\n            height: 15px;\n            left: 0;\n            top: 0;\n            border-top-left-radius: 14px;\n            border-top-right-radius: 14px;\n            background: #fff;\n        }\n        \n        .fishing-animation-boat .parts,\n        .fishing-animation-boat .parts:before,\n        .fishing-animation-boat .parts:after {\n            position: absolute;\n            width: 20px;\n            height: 4px;\n            right: 8px;\n            top: 22px;\n            border-radius: 15px;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-boat .parts:before,\n        .fishing-animation-boat .parts:after {\n            content: "";\n            right: 0px;\n        }\n        \n        .fishing-animation-boat .parts:before {\n            top: 8px;\n        }\n        \n        .fishing-animation-boat .parts:after {\n            top: 15px;\n        }\n        \n        .fishing-animation-boat .button {\n            position: absolute;\n            width: 15px;\n            height: 8px;\n            left: -8px;\n            top: 20px;\n            border-radius: 15px;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-boat .top {\n            position: absolute;\n            width: 290px;\n            height: 4px;\n            top: 0;\n            right: 0;\n            border-bottom: solid 4px #cdab33;\n            background: #e8da43;\n        }\n        \n        .fishing-animation-boat .boat-body {\n            position: absolute;\n            width: 280px;\n            height: 70px;\n            bottom: 0;\n            right: 0;\n            border-bottom-left-radius: 70px;\n            border-bottom-right-radius: 15px;\n            clip-path: polygon(0 0, 100% 0, 99% 100%, 0% 100%);\n            background: #cdab33;\n        }\n        \n        .fishing-animation-boat .boat-body:before {\n            content: "";\n            position: absolute;\n            width: 280px;\n            height: 55px;\n            bottom: 15px;\n            right: 0px;\n            border-bottom-left-radius: 45px;\n            background: #d2bd39;\n        }\n        \n        .fishing-animation-boat .boat-body:after {\n            content: "";\n            position: absolute;\n            width: 280px;\n            height: 30px;\n            bottom: 40px;\n            right: 0px;\n            border-bottom-left-radius: 45px;\n            background: #e8da43;\n        }\n        \n        .fishing-animation-waves {\n            height: 100%;\n            box-sizing: border-box;\n            border: 5px solid #fff;\n            border-radius: 50%;\n            transform: translate(22px, -22px);\n            z-index: -10;\n            animation: fishing-waves 5s ease infinite;\n        }\n        \n        @keyframes fishing-waves {\n            from {\n                margin-left: 0px;\n                margin-right: 0px;\n                border-color: #fff;\n            }\n            to {\n                margin-left: -75px;\n                margin-right: -75px;\n                border-color: transparent;\n            }\n        }\n        \n        .fishing-animation-fish {\n            position: absolute;\n            width: 12px;\n            height: 12px;\n            margin-left: 6px;\n            animation: fishing-jump 3s infinite;\n            z-index: 10;\n        }\n        \n        @keyframes fishing-jump {\n            0% {\n                left: 60px;\n                top: 90px;\n                transform: rotate(90deg);\n                opacity: 1;\n            }\n            16.7% {\n                left: 52px;\n                top: 45px;\n                transform: rotate(-20deg);\n                opacity: 1;\n            }\n            33.4% {\n                left: 45px;\n                top: 90px;\n                transform: rotate(-90deg);\n                opacity: 0;\n            }\n            50% {\n                left: 60px;\n                top: 90px;\n                transform: rotate(90deg);\n                opacity: 0;\n            }\n            100% {\n                left: 60px;\n                top: 90px;\n                transform: rotate(90deg);\n                opacity: 0;\n            }\n        }\n        \n        .fishing-animation-text {\n            position: absolute;\n            width: 100%;\n            text-align: center;\n            font-size: 32px;\n            color: rgba(0, 0, 0, 0.15);\n            font-family: \'Montserrat\', sans-serif;\n            bottom: -5px; /* 将文字放在碗的下方 */\n            z-index: 1;\n        }\n    ',document.head.appendChild(n)}const i=document.querySelector(n);if(!i)return console.error(`元素 ${n} 未找到`),null;const o=document.createElement("div");o.className="fishing-animation-container",o.id=e;const s=document.createElement("div");s.className="fishing-animation-content",s.innerHTML=`\n    <div class="fishing-animation-bowl">\n        <div class="fishing-animation-water">\n            <div class="fishing-animation-water-inner"></div>\n        </div>\n        <div class="fishing-animation-top-water"></div>\n        <div class="fishing-animation-center-box">\n            <div class="fishing-animation-fisherman">\n                <div class="body"></div>\n                <div class="right-arm"></div>\n                <div class="right-leg"></div>\n                <div class="fishing-animation-rod">\n                    <div class="handle"></div>\n                    <div class="rope"></div>\n                </div>\n                <div class="butt"></div>\n                <div class="left-arm"></div>\n                <div class="left-leg"></div>\n                <div class="fishing-animation-head">\n                    <div class="face"></div>\n                    <div class="eyebrows"></div>\n                    <div class="eyes"></div>\n                    <div class="nose"></div>\n                    <div class="beard"></div>\n                    <div class="hat"></div>\n                </div>\n            </div>\n            <div class="fishing-animation-boat">\n                <div class="motor">\n                    <div class="parts"></div>\n                    <div class="button"></div>\n                </div>\n                <div class="top"></div>\n                <div class="boat-body"></div>\n                <div class="fishing-animation-waves"></div>\n            </div>\n        </div>\n        <div class="fishing-animation-fish">\n            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\n                x="0px" y="0px" viewBox="0 0 483.7 361.9" style="enable-background:new 0 0 483.7 361.9;" xml:space="preserve">\n                <style type="text/css">\n                    .fishing-st0 { fill: #E0AC26; }\n                    .fishing-st1 { fill: #E0AC26; stroke: #E0AC26; stroke-width: 1.061; stroke-miterlimit: 10; }\n                    .fishing-st2 { fill: #FFFFFF; }\n                </style>\n                <g>\n                    <g>\n                        <path class="fishing-st0" d="M168.8,298.4c1.2,8.5,0.3,17.1,0.5,25.7c0.2,9.6,2,18.6,8.8,25.9c9.4,10,25.3,14.4,38.7,10.4\n                                c17.7-5.3,21.7-23.3,19.9-39.9c-1.9-18.1-36.9-35.6-47.7-49.9" />\n                        <g>\n                            <path class="fishing-st0" d="M167.6,298.4c2.1,17-3.6,36.8,8.5,51.2c9.6,11.4,26.7,16.2,40.8,11.9c13.3-4,19.8-16,20.9-29.2\n                                    c0.5-5.8,0.6-12.3-1.8-17.7c-2.4-5.5-6.6-10-10.9-14.1c-11.2-10.7-25.9-18.5-35.6-30.8c-0.9-1.1-2.5,0.5-1.6,1.6\n                                    c6.8,8.7,16.6,15,25.1,21.8c8.2,6.6,19.6,14.9,22,25.8c2.6,11.8-0.2,27.8-9.9,35.7c-12.2,9.9-31.9,7-43.4-2.6\n                                    c-16.4-13.6-9.8-35.4-12.1-53.7C169.7,297,167.5,297,167.6,298.4L167.6,298.4z" />\n                        </g>\n                    </g>\n                    <path class="fishing-st1" d="M478.9,117c4.7-9.7,8.2-23.7-1.1-29.1c-14.2-8.2-57.5,45.2-56.5,46.4c-48.6-54.4-77.1-85.6-131.5-106.8\n                            c-16.6-6.5-34.3-10.2-52.2-11.2c-6-0.8-12-1.4-18-1.7C156.4,11.3,100.7,51.6,80,64.7C59.3,77.8,2.5,154.2,0.4,158.5\n                            c0,0-1.1,9.8,15.3,22.9s22.9,12,16.4,22.9c-6.5,10.9-30.6,17.5-31.7,26.2c-1.1,8.7,0,8.7,8.7,10.9c8.7,2.2,50.2,46.5,103.7,64.7\n                            c53.5,18.2,111.7,18.2,146.4,12.8c2.7-0.4,5.5-1,8.2-1.6c12.3-1.9,24.7-4.5,33-8.2c15.7-5.9,28.9-12.5,34.2-15.3\n                            c1.6,0.5,3.2,1.1,4.6,1.9c2.1,3.1,5.5,7.9,8.9,11.6c7.6,8.2,20.9,8.6,31.1,4c7.7-3.5,18.9-16.7,21.6-25.2c2.2-6.8,2.3-5.1-0.9-10.3\n                            c-0.5-0.9-14.9-8.8-14.7-9c14.3-15.3,34.3-40,34.3-40c10.4,15.9,29.6,47.3,43.1,47.8c17.3,0.7,18.9-18.6,16-30.9\n                            C466.5,195.2,456,164,478.9,117z" />\n                    \x3c!-- 其余SVG路径保持不变，只需添加fishing-前缀到类名 --\x3e\n                </g>\n            </svg>\n        </div>\n    </div>\n    <div class="fishing-animation-text">${t}</div>\n`,o.appendChild(s),i.appendChild(o);let r=0;const a=s.querySelector(".fishing-animation-text");let d=setInterval(()=>{let n="";r<3?r++:r=1;for(let t=0;t<r;t++)n+=".";a.textContent=t+n},500);return{remove:function(){clearInterval(d),o.parentNode&&o.parentNode.removeChild(o)},updateText:function(n){t=n,a.textContent=n},pause:function(){o.querySelectorAll("*").forEach(n=>{void 0!==n.style.animationPlayState&&(n.style.animationPlayState="paused")}),clearInterval(d)},resume:function(){o.querySelectorAll("*").forEach(n=>{void 0!==n.style.animationPlayState&&(n.style.animationPlayState="running")}),r=0,d=setInterval(()=>{let n="";r<3?r++:r=1;for(let t=0;t<r;t++)n+=".";a.textContent=t+n},500)}}}function o(){document.querySelectorAll(".fishing-animation-container").forEach(n=>{n.parentNode&&n.parentNode.removeChild(n)})}void 0!==i&&(n.exports.createFishingAnimation=i),void 0!==o&&(n.exports.removeAllFishingAnimations=o)},"./Loading/V2/Loading.js":function(n,t,e){function i(n,t="正在加载中"){const e=document.querySelector(n);if(!e)return console.error(`未找到选择器为 "${n}" 的元素`),null;const i=window.getComputedStyle(e).position;"static"===i&&(e.style.position="relative");const o=document.createElement("div");o.style.position="absolute",o.style.top="0",o.style.left="0",o.style.width="100%",o.style.height="100%",o.style.backgroundColor="rgba(255, 255, 255, 0.85)",o.style.zIndex="9999",o.style.display="flex",o.style.justifyContent="center",o.style.alignItems="center",o.style.backdropFilter="blur(2px)";const s=document.createElement("div");s.style.display="flex",s.style.flexDirection="column",s.style.justifyContent="center",s.style.alignItems="center",s.style.padding="30px 40px",s.style.backgroundColor="rgba(255, 255, 255, 0.95)",s.style.borderRadius="12px",s.style.boxShadow="0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",s.style.border="1px solid rgba(0, 0, 0, 0.05)",s.style.minWidth="180px",s.style.minHeight="140px",s.style.boxSizing="border-box";const r=document.createElement("div");r.style.width="48px",r.style.height="48px",r.style.border="3px solid rgba(74, 144, 226, 0.2)",r.style.borderTop="3px solid #4a90e2",r.style.borderRight="3px solid #4a90e2",r.style.borderRadius="50%",r.style.animation="spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite",r.style.marginBottom="20px";const a=document.createElement("div");a.textContent=t,a.style.color="#333",a.style.fontSize="16px",a.style.fontWeight="500",a.style.textAlign="center",a.style.lineHeight="1.5",a.style.letterSpacing="0.5px";const d=document.createElement("div");d.style.display="flex",d.style.justifyContent="center",d.style.alignItems="center",d.style.marginTop="8px",d.style.height="20px";for(let n=0;n<3;n++){const t=document.createElement("div");t.style.width="6px",t.style.height="6px",t.style.backgroundColor="#4a90e2",t.style.borderRadius="50%",t.style.margin="0 3px",t.style.animation=`pulse 1.4s ease-in-out ${.2*n}s infinite`,d.appendChild(t)}if(s.appendChild(r),s.appendChild(a),s.appendChild(d),o.appendChild(s),e.appendChild(o),!document.querySelector("#loading-animation-style")){const n=document.createElement("style");n.id="loading-animation-style",n.textContent="\n      @keyframes spin {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n      }\n      \n      @keyframes pulse {\n        0%, 100% { \n          opacity: 0.3;\n          transform: scale(0.8);\n        }\n        50% { \n          opacity: 1;\n          transform: scale(1.2);\n        }\n      }\n    ",document.head.appendChild(n)}return{remove:function(){o&&o.parentNode===e&&(e.removeChild(o),"relative"===e.style.position&&"static"===i&&(e.style.position=""))},updateText:function(n){a.textContent=n},getElement:function(){return o},show:function(){o.style.display="flex"},hide:function(){o.style.display="none"},setTheme:function(n){"dark"===n?(s.style.backgroundColor="rgba(30, 30, 30, 0.95)",a.style.color="#fff",r.style.border="3px solid rgba(255, 255, 255, 0.2)",r.style.borderTop="3px solid #fff",r.style.borderRight="3px solid #fff",d.querySelectorAll("div").forEach(n=>{n.style.backgroundColor="#fff"})):(s.style.backgroundColor="rgba(255, 255, 255, 0.95)",a.style.color="#333",r.style.border="3px solid rgba(74, 144, 226, 0.2)",r.style.borderTop="3px solid #4a90e2",r.style.borderRight="3px solid #4a90e2",d.querySelectorAll("div").forEach(n=>{n.style.backgroundColor="#4a90e2"}))}}}void 0!==i&&(n.exports.createLoading=i)},"./Message/V1/Message.js":function(n,t,e){class i{constructor(){this.containers={},this.messageCount=0,this.initContainers(),this.initStyles()}initContainers(){["center-top","center-bottom","left","right"].forEach(n=>{const t=document.createElement("div");t.className=`message-container ${n}`,t.id=`message-container-${n}`,document.body.appendChild(t),this.containers[n]=t})}initStyles(){if(document.getElementById("message-styles"))return;const n=document.createElement("style");n.id="message-styles",n.textContent="\n            .message-container {\n                position: fixed;\n                z-index: 9999;\n                pointer-events: none;\n            }\n            \n            .message-container.center-top,\n            .message-container.center-bottom {\n                left: 50%;\n                transform: translateX(-50%);\n            }\n            \n            .message-container.center-top {\n                top: 24px;\n            }\n            \n            .message-container.center-bottom {\n                bottom: 24px;\n            }\n            \n            .message-container.left {\n                left: 24px;\n                top: 24px;\n            }\n            \n            .message-container.right {\n                right: 24px;\n                top: 24px;\n            }\n            \n            .message-item {\n                pointer-events: auto;\n                min-width: 300px;\n                max-width: 500px;\n                padding: 12px 16px;\n                margin-bottom: 16px;\n                border-radius: 6px;\n                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), \n                            0 6px 16px 0 rgba(0, 0, 0, 0.08), \n                            0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                background-color: white;\n                display: flex;\n                align-items: flex-start;\n                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);\n                position: relative;\n                overflow: hidden;\n                opacity: 0;\n                transform: translateY(-20px);\n            }\n            \n            .message-item.left-entering {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.right-entering {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.entered {\n                opacity: 1;\n                transform: translateY(0) translateX(0);\n            }\n            \n            .message-item.hiding-left {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-right {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-up {\n                transform: translateY(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-down {\n                transform: translateY(100%);\n                opacity: 0;\n            }\n            \n            .message-icon {\n                margin-right: 12px;\n                font-size: 18px;\n                line-height: 1;\n                display: flex;\n                align-items: center;\n                height: 22px;\n                flex-shrink: 0;\n            }\n            \n            .message-content {\n                flex: 1;\n                font-size: 14px;\n                line-height: 1.5715;\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-close {\n                margin-left: 12px;\n                cursor: pointer;\n                color: rgba(0, 0, 0, 0.45);\n                font-size: 14px;\n                line-height: 1;\n                padding: 2px;\n                transition: color 0.3s;\n                display: flex;\n                align-items: center;\n                height: 22px;\n                flex-shrink: 0;\n            }\n            \n            .message-close:hover {\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-normal,\n            .message-info {\n                border-left: 4px solid #1890ff;\n            }\n            \n            .message-success {\n                border-left: 4px solid #52c41a;\n            }\n            \n            .message-error {\n                border-left: 4px solid #ff4d4f;\n            }\n            \n            .message-warning {\n                border-left: 4px solid #faad14;\n            }\n            \n            .message-important {\n                border-left: 4px solid #722ed1;\n                background-color: #f9f0ff;\n            }\n            \n            .message-progress {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                height: 2px;\n                background-color: rgba(0, 0, 0, 0.06);\n                width: 100%;\n            }\n            \n            .message-progress-bar {\n                height: 100%;\n                background-color: #1890ff;\n                width: 100%;\n                transition: width linear;\n            }\n            \n            .message-progress-bar.success {\n                background-color: #52c41a;\n            }\n            \n            .message-progress-bar.error {\n                background-color: #ff4d4f;\n            }\n            \n            .message-progress-bar.warning {\n                background-color: #faad14;\n            }\n            \n            .message-progress-bar.important {\n                background-color: #722ed1;\n            }\n        ",document.head.appendChild(n)}show(n){const t={type:"info",content:"",duration:3,position:"center-top",hideDirection:"up",showClose:null,onClose:null,..."string"==typeof n?{content:n}:n};null===t.showClose&&(t.showClose="left"===t.position||"right"===t.position),"up"===t.hideDirection&&"center-bottom"===t.position&&(t.hideDirection="down"),"up"===t.hideDirection&&"left"===t.position&&(t.hideDirection="left"),"up"===t.hideDirection&&"right"===t.position&&(t.hideDirection="right");const e=`message-${Date.now()}-${this.messageCount++}`,i=document.createElement("div");i.id=e,i.className=`message-item message-${t.type}`,"left"===t.position?i.classList.add("left-entering"):"right"===t.position&&i.classList.add("right-entering");const o={info:"ℹ️",success:"✅",error:"❌",warning:"⚠️",important:"🔔"},s=document.createElement("span");s.className="message-icon",s.textContent=o[t.type]||o.info;const r=document.createElement("span");r.className="message-content",r.textContent=t.content;const a=document.createElement("span");a.className="message-close",a.innerHTML="&times;",a.onclick=()=>this.closeMessage(e,t.position,t.hideDirection,t.onClose);let d=null;if(t.duration>0){const n=document.createElement("div");n.className="message-progress",d=document.createElement("div"),d.className=`message-progress-bar ${t.type}`,d.style.transitionDuration=`${t.duration}s`,d.style.width="100%",n.appendChild(d),i.appendChild(n),setTimeout(()=>{d&&(d.style.width="0%")},10)}i.appendChild(s),i.appendChild(r),t.showClose&&i.appendChild(a);const l=this.containers[t.position];l&&(l.firstChild?l.insertBefore(i,l.firstChild):l.appendChild(i),setTimeout(()=>{i.classList.add("entered")},10));let p=null;return t.duration>0&&(p=setTimeout(()=>{this.closeMessage(e,t.position,t.hideDirection,t.onClose)},1e3*t.duration)),i._messageData={timeoutId:p,onClose:t.onClose},e}closeMessage(n,t,e,i){const o=document.getElementById(n);o&&(o._messageData&&o._messageData.timeoutId&&clearTimeout(o._messageData.timeoutId),i?i():o._messageData&&o._messageData.onClose&&o._messageData.onClose(),o.classList.add(`hiding-${e}`),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300))}clear(){Object.keys(this.containers).forEach(n=>{const t=this.containers[n];t.querySelectorAll(".message-item").forEach(e=>{e._messageData&&e._messageData.timeoutId&&clearTimeout(e._messageData.timeoutId);let i="up";"center-bottom"===n&&(i="down"),"left"===n&&(i="left"),"right"===n&&(i="right"),e.classList.add(`hiding-${i}`),setTimeout(()=>{e.parentNode===t&&t.removeChild(e)},300)})})}info(n,t={}){return this.show({...t,content:n,type:"info"})}success(n,t={}){return this.show({...t,content:n,type:"success"})}error(n,t={}){return this.show({...t,content:n,type:"error"})}warning(n,t={}){return this.show({...t,content:n,type:"warning"})}important(n,t={}){return this.show({...t,content:n,type:"important"})}normal(n,t={}){return this.info(n,t)}close(n){const t=document.getElementById(n);if(!t)return;const e=t.parentNode;if(!e)return;let i="center-top";e.id.includes("center-bottom")&&(i="center-bottom"),e.id.includes("left")&&(i="left"),e.id.includes("right")&&(i="right");let o="up";"center-bottom"===i&&(o="down"),"left"===i&&(o="left"),"right"===i&&(o="right"),this.closeMessage(n,i,o)}}"undefined"==typeof window||window.Message||(window.Message=new i),void 0!==n&&n.exports&&(n.exports=i)},"./Message/V2/Message.js":function(n,t,e){class i{constructor(){this.containers={},this.messageCount=0,this.initContainers(),this.initStyles()}initContainers(){["center-top","center-bottom","left","right"].forEach(n=>{const t=document.createElement("div");t.className=`message-container ${n}`,t.id=`message-container-${n}`,document.body.appendChild(t),this.containers[n]=t})}initStyles(){if(document.getElementById("message-styles"))return;const n=document.createElement("style");n.id="message-styles",n.textContent="\n            .message-container {\n                position: fixed;\n                z-index: 9999;\n                pointer-events: none;\n            }\n            \n            .message-container.center-top,\n            .message-container.center-bottom {\n                left: 50%;\n                transform: translateX(-50%);\n            }\n            \n            .message-container.center-top {\n                top: 24px;\n            }\n            \n            .message-container.center-bottom {\n                bottom: 24px;\n            }\n            \n            .message-container.left {\n                left: 24px;\n                top: 24px;\n            }\n            \n            .message-container.right {\n                right: 24px;\n                top: 24px;\n            }\n            \n            .message-item {\n                pointer-events: auto;\n                min-width: 300px;\n                max-width: 500px;\n                padding: 12px 16px;\n                margin-bottom: 16px;\n                border-radius: 6px;\n                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), \n                            0 6px 16px 0 rgba(0, 0, 0, 0.08), \n                            0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                background-color: white;\n                display: flex;\n                align-items: flex-start;\n                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);\n                position: relative;\n                overflow: hidden;\n                opacity: 0;\n                transform: translateY(-20px);\n            }\n            \n            .message-item.left-entering {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.right-entering {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.entered {\n                opacity: 1;\n                transform: translateY(0) translateX(0);\n            }\n            \n            .message-item.hiding-left {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-right {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-up {\n                transform: translateY(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-down {\n                transform: translateY(100%);\n                opacity: 0;\n            }\n            \n            .message-icon {\n                margin-right: 12px;\n                width: 22px;\n                height: 22px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                flex-shrink: 0;\n            }\n            \n            .message-icon svg {\n                width: 20px;\n                height: 20px;\n            }\n            \n            .message-content {\n                flex: 1;\n                font-size: 14px;\n                line-height: 1.5715;\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-close {\n                margin-left: 12px;\n                cursor: pointer;\n                color: rgba(0, 0, 0, 0.45);\n                font-size: 14px;\n                line-height: 1;\n                padding: 2px;\n                transition: color 0.3s;\n                display: flex;\n                align-items: center;\n                height: 22px;\n                flex-shrink: 0;\n            }\n            \n            .message-close:hover {\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-normal,\n            .message-info {\n                border-left: 4px solid #1890ff;\n            }\n            \n            .message-success {\n                border-left: 4px solid #52c41a;\n            }\n            \n            .message-error {\n                border-left: 4px solid #ff4d4f;\n            }\n            \n            .message-warning {\n                border-left: 4px solid #faad14;\n            }\n            \n            .message-important {\n                border-left: 4px solid #722ed1;\n                background-color: #f9f0ff;\n            }\n            \n            .message-progress {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                height: 2px;\n                background-color: rgba(0, 0, 0, 0.06);\n                width: 100%;\n            }\n            \n            .message-progress-bar {\n                height: 100%;\n                background-color: #1890ff;\n                width: 100%;\n                transition: width linear;\n            }\n            \n            .message-progress-bar.success {\n                background-color: #52c41a;\n            }\n            \n            .message-progress-bar.error {\n                background-color: #ff4d4f;\n            }\n            \n            .message-progress-bar.warning {\n                background-color: #faad14;\n            }\n            \n            .message-progress-bar.important {\n                background-color: #722ed1;\n            }\n        ",document.head.appendChild(n)}createMessageIcon(n){const t="http://www.w3.org/2000/svg",e=document.createElementNS(t,"svg");let i;switch(e.setAttribute("viewBox","0 0 1024 1024"),e.setAttribute("version","1.1"),e.setAttribute("xmlns",t),e.setAttribute("width","30"),e.setAttribute("height","30"),n){case"info":case"normal":default:i="#1890ff";break;case"success":i="#52c41a";break;case"error":i="#ff4d4f";break;case"warning":i="#faad14";break;case"important":i="#722ed1"}const o=document.createElementNS(t,"path");return o.setAttribute("d","M410.5 106h203C780 106 915.3 239.6 918 405.5v412.3c0 54.8-44 99.3-98.5 100.2h-409C244 918 108.7 784.4 106 618.5v-208C106 244 239.6 108.7 405.5 106h208-203z m203 62.5h-203c-132.3 0-239.9 106.2-242 238v207c0 132.3 106.2 239.9 238 242h411.3c20.6 0 37.4-16.6 37.7-37.1V410.5c0-133.7-108.3-242-242-242z m58.2 410.2c19.9 0 36 16.1 36 36s-16.1 36-36 36H354.5c-19.9 0-36-16.1-36-36s16.1-36 36-36h317.2zM360.4 406.5h172.7c19.9 0 36 16.1 36 36 0 19.7-15.8 35.7-35.4 36H360.4c-19.9 0-36-16.1-36-36 0-19.7 15.8-35.7 35.4-36H533.1 360.4z"),o.setAttribute("fill",i),e.appendChild(o),e}show(n){const t={type:"info",content:"",duration:3,position:"center-top",hideDirection:"up",showClose:null,onClose:null,..."string"==typeof n?{content:n}:n};null===t.showClose&&(t.showClose="left"===t.position||"right"===t.position),"up"===t.hideDirection&&"center-bottom"===t.position&&(t.hideDirection="down"),"up"===t.hideDirection&&"left"===t.position&&(t.hideDirection="left"),"up"===t.hideDirection&&"right"===t.position&&(t.hideDirection="right");const e=`message-${Date.now()}-${this.messageCount++}`,i=document.createElement("div");i.id=e,i.className=`message-item message-${t.type}`,"left"===t.position?i.classList.add("left-entering"):"right"===t.position&&i.classList.add("right-entering");const o=document.createElement("span");o.className="message-icon";const s=this.createMessageIcon(t.type);o.appendChild(s);const r=document.createElement("span");r.className="message-content",r.textContent=t.content;const a=document.createElement("span");a.className="message-close",a.innerHTML="&times;",a.onclick=()=>this.closeMessage(e,t.position,t.hideDirection,t.onClose);let d=null;if(t.duration>0){const n=document.createElement("div");n.className="message-progress",d=document.createElement("div"),d.className=`message-progress-bar ${t.type}`,d.style.transitionDuration=`${t.duration}s`,d.style.width="100%",n.appendChild(d),i.appendChild(n),setTimeout(()=>{d&&(d.style.width="0%")},10)}i.appendChild(o),i.appendChild(r),t.showClose&&i.appendChild(a);const l=this.containers[t.position];l&&(l.firstChild?l.insertBefore(i,l.firstChild):l.appendChild(i),setTimeout(()=>{i.classList.add("entered")},10));let p=null;return t.duration>0&&(p=setTimeout(()=>{this.closeMessage(e,t.position,t.hideDirection,t.onClose)},1e3*t.duration)),i._messageData={timeoutId:p,onClose:t.onClose},e}closeMessage(n,t,e,i){const o=document.getElementById(n);o&&(o._messageData&&o._messageData.timeoutId&&clearTimeout(o._messageData.timeoutId),i?i():o._messageData&&o._messageData.onClose&&o._messageData.onClose(),o.classList.add(`hiding-${e}`),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300))}clear(){Object.keys(this.containers).forEach(n=>{const t=this.containers[n];t.querySelectorAll(".message-item").forEach(e=>{e._messageData&&e._messageData.timeoutId&&clearTimeout(e._messageData.timeoutId);let i="up";"center-bottom"===n&&(i="down"),"left"===n&&(i="left"),"right"===n&&(i="right"),e.classList.add(`hiding-${i}`),setTimeout(()=>{e.parentNode===t&&t.removeChild(e)},300)})})}info(n,t={}){return this.show({...t,content:n,type:"info"})}success(n,t={}){return this.show({...t,content:n,type:"success"})}error(n,t={}){return this.show({...t,content:n,type:"error"})}warning(n,t={}){return this.show({...t,content:n,type:"warning"})}important(n,t={}){return this.show({...t,content:n,type:"important"})}normal(n,t={}){return this.info(n,t)}close(n){const t=document.getElementById(n);if(!t)return;const e=t.parentNode;if(!e)return;let i="center-top";e.id.includes("center-bottom")&&(i="center-bottom"),e.id.includes("left")&&(i="left"),e.id.includes("right")&&(i="right");let o="up";"center-bottom"===i&&(o="down"),"left"===i&&(o="left"),"right"===i&&(o="right"),this.closeMessage(n,i,o)}}"undefined"==typeof window||window.Message||(window.Message=new i),void 0!==n&&n.exports&&(n.exports=i)},"./TimeShaft/V1/TimeShaft.js":function(n,t,e){},"./TreeExpandPanel/V1/TreeExpandPanel.js":function(n,t,e){}},t={};function e(i){if(t[i])return t[i].exports;var o={exports:{}};return t[i]=o,n[i](o,o.exports,e),o.exports}var i="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;i.NG=i.NG||{},i.NG.Components=i.NG.Components||{},i.NG.Components["ButtonGroup/V1/ButtonGroup"]=e("./ButtonGroup/V1/ButtonGroup.js"),i.NG.Components["DownloadAttachs/V1/DownloadAttachs"]=e("./DownloadAttachs/V1/DownloadAttachs.js"),i.NG.Components["Loading/V1/FishingAnimation"]=e("./Loading/V1/FishingAnimation.js"),i.NG.Components["Loading/V2/Loading"]=e("./Loading/V2/Loading.js"),i.NG.Components["Message/V1/Message"]=e("./Message/V1/Message.js"),i.NG.Components["Message/V2/Message"]=e("./Message/V2/Message.js"),i.NG.Components["TimeShaft/V1/TimeShaft"]=e("./TimeShaft/V1/TimeShaft.js"),i.NG.Components["TreeExpandPanel/V1/TreeExpandPanel"]=e("./TreeExpandPanel/V1/TreeExpandPanel.js")}()},"./DownloadAttachs/V1/DownloadAttachs.js":function(n,t,e){},"./Loading/V1/FishingAnimation.js":function(n,t,e){function i(n,t="Loading"){const e="fishing-animation-"+Date.now();if(!document.getElementById("fishing-animation-styles")){const n=document.createElement("style");n.id="fishing-animation-styles",n.textContent='\n        /* 引入字体库 */\n        @import url(\'https://fonts.googleapis.com/css?family=Montserrat:300,400,700\');\n        \n        .fishing-animation-container {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: transparent;\n            z-index: 998;\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            align-items: center;\n            overflow: hidden;\n        }\n        \n        .fishing-animation-content {\n            position: relative;\n            width: 400px;\n            height: 400px;\n            transform: scale(0.8);\n            margin-bottom: 5px; /* 为文字留出空间 */\n        }\n        \n        .fishing-animation-bowl {\n            width: 250px;\n            height: 250px;\n            border: 5px solid #fff;\n            border-radius: 50%;\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            transform: translate(-50%, -50%);\n            background: rgba(90, 201, 226, 0.3);\n            overflow: hidden;\n        }\n        \n        .fishing-animation-bowl:before {\n            content: "";\n            position: absolute;\n            bottom: -25px;\n            left: 50px;\n            width: 150px;\n            height: 50px;\n            border-radius: 50%;\n            background: rgba(0,0,0,0.15);\n        }\n        \n        .fishing-animation-bowl:after {\n            content: "";\n            position: absolute;\n            top: 10px;\n            left: calc(25% - 3px);\n            width: 50%;\n            height: 40px;\n            border: 3px solid #fff;\n            border-radius: 50%;\n        }\n        \n        .fishing-animation-water {\n            position: absolute;\n            bottom: 5%;\n            left: 0;\n            width: 100%;\n            height: 50%;\n            overflow: hidden;\n            animation: fishing-top-inner 5s ease infinite;\n        }\n        \n        @keyframes fishing-top-inner {\n            from {\n                transform: rotate(0deg);\n                margin-left: 0px;\n            }\n            25% {\n                transform: rotate(3deg);\n                margin-left: -3px;\n            }\n            50% {\n                transform: rotate(-6deg);\n                margin-left: 6px;\n            }\n            75% {\n                transform: rotate(5deg);\n                margin-left: -5px;\n            }\n            to {\n                transform: rotate(0deg);\n                margin-left: 0px;\n            }\n        }\n        \n        .fishing-animation-water-inner {\n            width: 225px;\n            height: 225px;\n            border-radius: 50%;\n            background: #4e99ce;\n            position: absolute;\n            bottom: 0;\n            left: 12.5px;\n        }\n        \n        .fishing-animation-top-water {\n            position: absolute;\n            width: 225px;\n            height: 60px;\n            border-radius: 50%;\n            background: #82bde6;\n            bottom: 105px;\n            left: 12.5px;\n            animation: fishing-top 5s ease infinite;\n        }\n        \n        @keyframes fishing-top {\n            from {\n                transform: rotate(0deg);\n            }\n            25% {\n                transform: rotate(3deg);\n            }\n            50% {\n                transform: rotate(-6deg);\n            }\n            75% {\n                transform: rotate(5deg);\n            }\n            to {\n                transform: rotate(0deg);\n            }\n        }\n        \n        .fishing-animation-center-box {\n            height: 300px;\n            width: 300px;\n            position: absolute;\n            top: calc(50% - 190px);\n            left: calc(50% - 147px); /* 修改这里：从 -150px 改为 -147px，向右移动3px */\n            animation: fishing-float 5s ease infinite;\n            transform: scale(0.4);\n        }\n        \n        @keyframes fishing-float {\n            from {\n                transform: translate(0, 0px) scale(0.4);\n            }\n            25% {\n                transform: translate(0, 4px) scale(0.4);\n            }\n            50% {\n                transform: translate(0, -7px) scale(0.4);\n            }\n            75% {\n                transform: translate(0, 7px) scale(0.4);\n            }\n            to {\n                transform: translate(0, -0px) scale(0.4);\n            }\n        }\n        \n        .fishing-animation-fisherman {\n            width: 300px;\n            height: 200px;\n            position: relative;\n        }\n        \n        .fishing-animation-fisherman .body {\n            width: 60px;\n            height: 120px;\n            background: #d2bd24;\n            position: absolute;\n            bottom: 20px;\n            right: 30px;\n            -webkit-clip-path: ellipse(40% 50% at 0% 50%);\n            clip-path: ellipse(40% 50% at 0% 50%);\n            transform: rotate(-20deg);\n        }\n        \n        .fishing-animation-fisherman .body:before {\n            content: "";\n            width: 60px;\n            height: 160px;\n            background: #d2bd24;\n            position: absolute;\n            bottom: -8px;\n            right: 12px;\n            -webkit-clip-path: ellipse(90% 50% at 0% 50%);\n            clip-path: ellipse(90% 50% at 0% 50%);\n            transform: rotate(10deg);\n        }\n        \n        .fishing-animation-fisherman .right-arm {\n            width: 15px;\n            height: 90px;\n            background: #d2bd24;\n            border-radius: 15px;\n            position: absolute;\n            bottom: 40px;\n            right: 120px;\n            transform: rotate(40deg);\n        }\n        \n        .fishing-animation-fisherman .right-arm:before {\n            content: "";\n            background: #ffd1b5;\n            width: 20px;\n            height: 20px;\n            position: absolute;\n            top: 65px;\n            right: 40px;\n            border-radius: 15px;\n        }\n        \n        .fishing-animation-fisherman .right-arm:after {\n            content: "";\n            width: 15px;\n            height: 40px;\n            background: #d2bd24;\n            border-radius: 15px;\n            position: absolute;\n            bottom: -12px;\n            right: 15px;\n            transform: rotate(-80deg);\n            border-top-left-radius: 0px;\n            border-top-right-radius: 0px;\n        }\n        \n        .fishing-animation-fisherman .right-leg {\n            width: 15px;\n            height: 90px;\n            background: #bf3526;\n            border-radius: 15px;\n            position: absolute;\n            bottom: -15px;\n            right: 120px;\n            transform: rotate(-60deg);\n        }\n        \n        .fishing-animation-fisherman .right-leg:before {\n            content: "";\n            width: 15px;\n            height: 80px;\n            background: #bf3526;\n            border-radius: 15px;\n            position: absolute;\n            bottom: 35px;\n            left: -30px;\n            transform: rotate(80deg);\n        }\n        \n        .fishing-animation-fisherman .right-leg:after {\n            content: "";\n            position: absolute;\n            bottom: 30px;\n            left: -60px;\n            width: 25px;\n            height: 80px;\n            background: #338ca0;\n            transform: rotate(80deg);\n        }\n        \n        .fishing-animation-rod {\n            position: absolute;\n            width: 280px;\n            height: 4px;\n            bottom: 100px;\n            left: -105px;\n            background: #331604;\n            transform: rotate(10deg);\n        }\n        \n        .fishing-animation-rod .handle {\n            width: 15px;\n            height: 15px;\n            border-radius: 15px;\n            left: 230px;\n            top: 2px;\n            background: #efdddb;\n        }\n        \n        .fishing-animation-rod .handle:before {\n            content: "";\n            position: absolute;\n            width: 10px;\n            height: 3px;\n            left: 8px;\n            top: 5px;\n            background: #1a1a1a;\n        }\n        \n        .fishing-animation-rod .rope {\n            width: 2px;\n            height: 190px;\n            top: -14px;\n            left: 17px;\n            transform: rotate(-10deg);\n            background: #fff;\n        }\n        \n        .fishing-animation-fisherman .butt {\n            position: absolute;\n            width: 40px;\n            height: 15px;\n            border-radius: 15px;\n            bottom: 5px;\n            right: 70px;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-fisherman .left-arm {\n            position: absolute;\n            width: 15px;\n            height: 70px;\n            bottom: 45px;\n            right: 100px;\n            border-radius: 15px;\n            transform: rotate(30deg);\n            background: #e8d93d;\n        }\n        \n        .fishing-animation-fisherman .left-arm:before {\n            content: "";\n            position: absolute;\n            width: 20px;\n            height: 20px;\n            top: 40px;\n            right: 40px;\n            border-radius: 15px;\n            background: #ffd1b5;\n        }\n        \n        .fishing-animation-fisherman .left-arm:after {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 45px;\n            bottom: -12px;\n            right: 15px;\n            border-radius: 15px;\n            transform: rotate(-70deg);\n            background: #e8d93d;\n        }\n        \n        .fishing-animation-fisherman .left-leg {\n            position: absolute;\n            width: 15px;\n            height: 80px;\n            bottom: -10px;\n            right: 90px;\n            border-radius: 15px;\n            transform: rotate(-50deg);\n            background: #de4125;\n        }\n        \n        .fishing-animation-fisherman .left-leg:before {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 80px;\n            bottom: 15px;\n            left: -28px;\n            border-radius: 15px;\n            transform: rotate(60deg);\n            background: #de4125;\n        }\n        \n        .fishing-animation-fisherman .left-leg:after {\n            content: "";\n            position: absolute;\n            width: 25px;\n            height: 80px;\n            bottom: 2px;\n            left: -55px;\n            transform: rotate(60deg);\n            background: #338ca0;\n        }\n        \n        .fishing-animation-head {\n            position: absolute;\n            width: 45px;\n            height: 60px;\n            bottom: 100px;\n            right: 85px;\n            border-radius: 50%;\n            transform: rotate(10deg);\n        }\n        \n        .fishing-animation-head .face {\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            border-radius: 50%;\n            overflow: hidden;\n            background: #d76540;\n        }\n        \n        .fishing-animation-head .face:before {\n            content: "";\n            position: absolute;\n            width: 45px;\n            height: 65px;\n            top: -15px;\n            left: -8px;\n            border-radius: 50%;\n            background: #ffd1b5;\n            transform: rotate(-10deg);\n        }\n        \n        .fishing-animation-head .eyebrows {\n            position: absolute;\n            width: 12px;\n            height: 5px;\n            top: 12px;\n            left: -2px;\n            transform: rotate(-10deg);\n            background: #e67e5b;\n        }\n        \n        .fishing-animation-head .eyebrows:before {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 5px;\n            top: 0px;\n            left: 17px;\n            background: #e67e5b;\n        }\n        \n        .fishing-animation-head .eyes {\n            position: absolute;\n            width: 4px;\n            height: 6px;\n            top: 20px;\n            left: 5px;\n            border-radius: 50%;\n            transform: rotate(-10deg);\n            background: #1a1a1a;\n        }\n        \n        .fishing-animation-head .eyes:before {\n            content: "";\n            position: absolute;\n            width: 4px;\n            height: 6px;\n            top: 0px;\n            left: 15px;\n            border-radius: 50%;\n            background: #1a1a1a;\n        }\n        \n        .fishing-animation-head .nose {\n            position: absolute;\n            width: 0;\n            height: 0;\n            border-top: 15px solid transparent;\n            border-bottom: 6px solid transparent;\n            border-right: 12px solid #fab58e;\n            top: 20px;\n            left: 5px;\n            transform: rotate(-10deg);\n        }\n        \n        .fishing-animation-head .beard {\n            position: absolute;\n            width: 30px;\n            height: 20px;\n            top: 30px;\n            left: 1px;\n            transform: rotate(-10deg);\n            clip-path: ellipse(50% 50% at 50% 100%);\n            background: #e67e5b;\n        }\n        \n        .fishing-animation-head .hat {\n            position: absolute;\n            width: 60px;\n            height: 6px;\n            top: 6px;\n            left: -10px;\n            background: #3d402b;\n        }\n        \n        .fishing-animation-head .hat:before {\n            content: "";\n            position: absolute;\n            width: 45px;\n            height: 30px;\n            left: 8px;\n            bottom: 6px;\n            clip-path: ellipse(50% 50% at 50% 90%);\n            background: #7b8445;\n        }\n        \n        .fishing-animation-boat {\n            width: 300px;\n            height: 75px;\n            margin-top: -10px;\n        }\n        \n        .fishing-animation-boat .motor {\n            width: 60px;\n            height: 60px;\n            border-radius: 15px;\n            top: -40px;\n            right: -280px;\n            background: #ef4723;\n        }\n        \n        .fishing-animation-boat .motor:before {\n            content: "";\n            position: absolute;\n            width: 15px;\n            height: 75px;\n            clip-path: polygon(0 0, 100% 0, 60% 100%, 0% 100%);\n            top: 40px;\n            right: 15px;\n            z-index: -1;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-boat .motor:after {\n            content: "";\n            position: absolute;\n            width: 60px;\n            height: 15px;\n            left: 0;\n            top: 0;\n            border-top-left-radius: 14px;\n            border-top-right-radius: 14px;\n            background: #fff;\n        }\n        \n        .fishing-animation-boat .parts,\n        .fishing-animation-boat .parts:before,\n        .fishing-animation-boat .parts:after {\n            position: absolute;\n            width: 20px;\n            height: 4px;\n            right: 8px;\n            top: 22px;\n            border-radius: 15px;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-boat .parts:before,\n        .fishing-animation-boat .parts:after {\n            content: "";\n            right: 0px;\n        }\n        \n        .fishing-animation-boat .parts:before {\n            top: 8px;\n        }\n        \n        .fishing-animation-boat .parts:after {\n            top: 15px;\n        }\n        \n        .fishing-animation-boat .button {\n            position: absolute;\n            width: 15px;\n            height: 8px;\n            left: -8px;\n            top: 20px;\n            border-radius: 15px;\n            background: #bf3526;\n        }\n        \n        .fishing-animation-boat .top {\n            position: absolute;\n            width: 290px;\n            height: 4px;\n            top: 0;\n            right: 0;\n            border-bottom: solid 4px #cdab33;\n            background: #e8da43;\n        }\n        \n        .fishing-animation-boat .boat-body {\n            position: absolute;\n            width: 280px;\n            height: 70px;\n            bottom: 0;\n            right: 0;\n            border-bottom-left-radius: 70px;\n            border-bottom-right-radius: 15px;\n            clip-path: polygon(0 0, 100% 0, 99% 100%, 0% 100%);\n            background: #cdab33;\n        }\n        \n        .fishing-animation-boat .boat-body:before {\n            content: "";\n            position: absolute;\n            width: 280px;\n            height: 55px;\n            bottom: 15px;\n            right: 0px;\n            border-bottom-left-radius: 45px;\n            background: #d2bd39;\n        }\n        \n        .fishing-animation-boat .boat-body:after {\n            content: "";\n            position: absolute;\n            width: 280px;\n            height: 30px;\n            bottom: 40px;\n            right: 0px;\n            border-bottom-left-radius: 45px;\n            background: #e8da43;\n        }\n        \n        .fishing-animation-waves {\n            height: 100%;\n            box-sizing: border-box;\n            border: 5px solid #fff;\n            border-radius: 50%;\n            transform: translate(22px, -22px);\n            z-index: -10;\n            animation: fishing-waves 5s ease infinite;\n        }\n        \n        @keyframes fishing-waves {\n            from {\n                margin-left: 0px;\n                margin-right: 0px;\n                border-color: #fff;\n            }\n            to {\n                margin-left: -75px;\n                margin-right: -75px;\n                border-color: transparent;\n            }\n        }\n        \n        .fishing-animation-fish {\n            position: absolute;\n            width: 12px;\n            height: 12px;\n            margin-left: 6px;\n            animation: fishing-jump 3s infinite;\n            z-index: 10;\n        }\n        \n        @keyframes fishing-jump {\n            0% {\n                left: 60px;\n                top: 90px;\n                transform: rotate(90deg);\n                opacity: 1;\n            }\n            16.7% {\n                left: 52px;\n                top: 45px;\n                transform: rotate(-20deg);\n                opacity: 1;\n            }\n            33.4% {\n                left: 45px;\n                top: 90px;\n                transform: rotate(-90deg);\n                opacity: 0;\n            }\n            50% {\n                left: 60px;\n                top: 90px;\n                transform: rotate(90deg);\n                opacity: 0;\n            }\n            100% {\n                left: 60px;\n                top: 90px;\n                transform: rotate(90deg);\n                opacity: 0;\n            }\n        }\n        \n        .fishing-animation-text {\n            position: absolute;\n            width: 100%;\n            text-align: center;\n            font-size: 32px;\n            color: rgba(0, 0, 0, 0.15);\n            font-family: \'Montserrat\', sans-serif;\n            bottom: -5px; /* 将文字放在碗的下方 */\n            z-index: 1;\n        }\n    ',document.head.appendChild(n)}const i=document.querySelector(n);if(!i)return console.error(`元素 ${n} 未找到`),null;const o=document.createElement("div");o.className="fishing-animation-container",o.id=e;const s=document.createElement("div");s.className="fishing-animation-content",s.innerHTML=`\n    <div class="fishing-animation-bowl">\n        <div class="fishing-animation-water">\n            <div class="fishing-animation-water-inner"></div>\n        </div>\n        <div class="fishing-animation-top-water"></div>\n        <div class="fishing-animation-center-box">\n            <div class="fishing-animation-fisherman">\n                <div class="body"></div>\n                <div class="right-arm"></div>\n                <div class="right-leg"></div>\n                <div class="fishing-animation-rod">\n                    <div class="handle"></div>\n                    <div class="rope"></div>\n                </div>\n                <div class="butt"></div>\n                <div class="left-arm"></div>\n                <div class="left-leg"></div>\n                <div class="fishing-animation-head">\n                    <div class="face"></div>\n                    <div class="eyebrows"></div>\n                    <div class="eyes"></div>\n                    <div class="nose"></div>\n                    <div class="beard"></div>\n                    <div class="hat"></div>\n                </div>\n            </div>\n            <div class="fishing-animation-boat">\n                <div class="motor">\n                    <div class="parts"></div>\n                    <div class="button"></div>\n                </div>\n                <div class="top"></div>\n                <div class="boat-body"></div>\n                <div class="fishing-animation-waves"></div>\n            </div>\n        </div>\n        <div class="fishing-animation-fish">\n            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\n                x="0px" y="0px" viewBox="0 0 483.7 361.9" style="enable-background:new 0 0 483.7 361.9;" xml:space="preserve">\n                <style type="text/css">\n                    .fishing-st0 { fill: #E0AC26; }\n                    .fishing-st1 { fill: #E0AC26; stroke: #E0AC26; stroke-width: 1.061; stroke-miterlimit: 10; }\n                    .fishing-st2 { fill: #FFFFFF; }\n                </style>\n                <g>\n                    <g>\n                        <path class="fishing-st0" d="M168.8,298.4c1.2,8.5,0.3,17.1,0.5,25.7c0.2,9.6,2,18.6,8.8,25.9c9.4,10,25.3,14.4,38.7,10.4\n                                c17.7-5.3,21.7-23.3,19.9-39.9c-1.9-18.1-36.9-35.6-47.7-49.9" />\n                        <g>\n                            <path class="fishing-st0" d="M167.6,298.4c2.1,17-3.6,36.8,8.5,51.2c9.6,11.4,26.7,16.2,40.8,11.9c13.3-4,19.8-16,20.9-29.2\n                                    c0.5-5.8,0.6-12.3-1.8-17.7c-2.4-5.5-6.6-10-10.9-14.1c-11.2-10.7-25.9-18.5-35.6-30.8c-0.9-1.1-2.5,0.5-1.6,1.6\n                                    c6.8,8.7,16.6,15,25.1,21.8c8.2,6.6,19.6,14.9,22,25.8c2.6,11.8-0.2,27.8-9.9,35.7c-12.2,9.9-31.9,7-43.4-2.6\n                                    c-16.4-13.6-9.8-35.4-12.1-53.7C169.7,297,167.5,297,167.6,298.4L167.6,298.4z" />\n                        </g>\n                    </g>\n                    <path class="fishing-st1" d="M478.9,117c4.7-9.7,8.2-23.7-1.1-29.1c-14.2-8.2-57.5,45.2-56.5,46.4c-48.6-54.4-77.1-85.6-131.5-106.8\n                            c-16.6-6.5-34.3-10.2-52.2-11.2c-6-0.8-12-1.4-18-1.7C156.4,11.3,100.7,51.6,80,64.7C59.3,77.8,2.5,154.2,0.4,158.5\n                            c0,0-1.1,9.8,15.3,22.9s22.9,12,16.4,22.9c-6.5,10.9-30.6,17.5-31.7,26.2c-1.1,8.7,0,8.7,8.7,10.9c8.7,2.2,50.2,46.5,103.7,64.7\n                            c53.5,18.2,111.7,18.2,146.4,12.8c2.7-0.4,5.5-1,8.2-1.6c12.3-1.9,24.7-4.5,33-8.2c15.7-5.9,28.9-12.5,34.2-15.3\n                            c1.6,0.5,3.2,1.1,4.6,1.9c2.1,3.1,5.5,7.9,8.9,11.6c7.6,8.2,20.9,8.6,31.1,4c7.7-3.5,18.9-16.7,21.6-25.2c2.2-6.8,2.3-5.1-0.9-10.3\n                            c-0.5-0.9-14.9-8.8-14.7-9c14.3-15.3,34.3-40,34.3-40c10.4,15.9,29.6,47.3,43.1,47.8c17.3,0.7,18.9-18.6,16-30.9\n                            C466.5,195.2,456,164,478.9,117z" />\n                    \x3c!-- 其余SVG路径保持不变，只需添加fishing-前缀到类名 --\x3e\n                </g>\n            </svg>\n        </div>\n    </div>\n    <div class="fishing-animation-text">${t}</div>\n`,o.appendChild(s),i.appendChild(o);let r=0;const a=s.querySelector(".fishing-animation-text");let d=setInterval(()=>{let n="";r<3?r++:r=1;for(let t=0;t<r;t++)n+=".";a.textContent=t+n},500);return{remove:function(){clearInterval(d),o.parentNode&&o.parentNode.removeChild(o)},updateText:function(n){t=n,a.textContent=n},pause:function(){o.querySelectorAll("*").forEach(n=>{void 0!==n.style.animationPlayState&&(n.style.animationPlayState="paused")}),clearInterval(d)},resume:function(){o.querySelectorAll("*").forEach(n=>{void 0!==n.style.animationPlayState&&(n.style.animationPlayState="running")}),r=0,d=setInterval(()=>{let n="";r<3?r++:r=1;for(let t=0;t<r;t++)n+=".";a.textContent=t+n},500)}}}function o(){document.querySelectorAll(".fishing-animation-container").forEach(n=>{n.parentNode&&n.parentNode.removeChild(n)})}void 0!==i&&(n.exports.createFishingAnimation=i),void 0!==o&&(n.exports.removeAllFishingAnimations=o)},"./Loading/V2/Loading.js":function(n,t,e){function i(n,t="正在加载中"){const e=document.querySelector(n);if(!e)return console.error(`未找到选择器为 "${n}" 的元素`),null;const i=window.getComputedStyle(e).position;"static"===i&&(e.style.position="relative");const o=document.createElement("div");o.style.position="absolute",o.style.top="0",o.style.left="0",o.style.width="100%",o.style.height="100%",o.style.backgroundColor="rgba(255, 255, 255, 0.85)",o.style.zIndex="9999",o.style.display="flex",o.style.justifyContent="center",o.style.alignItems="center",o.style.backdropFilter="blur(2px)";const s=document.createElement("div");s.style.display="flex",s.style.flexDirection="column",s.style.justifyContent="center",s.style.alignItems="center",s.style.padding="30px 40px",s.style.backgroundColor="rgba(255, 255, 255, 0.95)",s.style.borderRadius="12px",s.style.boxShadow="0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",s.style.border="1px solid rgba(0, 0, 0, 0.05)",s.style.minWidth="180px",s.style.minHeight="140px",s.style.boxSizing="border-box";const r=document.createElement("div");r.style.width="48px",r.style.height="48px",r.style.border="3px solid rgba(74, 144, 226, 0.2)",r.style.borderTop="3px solid #4a90e2",r.style.borderRight="3px solid #4a90e2",r.style.borderRadius="50%",r.style.animation="spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite",r.style.marginBottom="20px";const a=document.createElement("div");a.textContent=t,a.style.color="#333",a.style.fontSize="16px",a.style.fontWeight="500",a.style.textAlign="center",a.style.lineHeight="1.5",a.style.letterSpacing="0.5px";const d=document.createElement("div");d.style.display="flex",d.style.justifyContent="center",d.style.alignItems="center",d.style.marginTop="8px",d.style.height="20px";for(let n=0;n<3;n++){const t=document.createElement("div");t.style.width="6px",t.style.height="6px",t.style.backgroundColor="#4a90e2",t.style.borderRadius="50%",t.style.margin="0 3px",t.style.animation=`pulse 1.4s ease-in-out ${.2*n}s infinite`,d.appendChild(t)}if(s.appendChild(r),s.appendChild(a),s.appendChild(d),o.appendChild(s),e.appendChild(o),!document.querySelector("#loading-animation-style")){const n=document.createElement("style");n.id="loading-animation-style",n.textContent="\n      @keyframes spin {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n      }\n      \n      @keyframes pulse {\n        0%, 100% { \n          opacity: 0.3;\n          transform: scale(0.8);\n        }\n        50% { \n          opacity: 1;\n          transform: scale(1.2);\n        }\n      }\n    ",document.head.appendChild(n)}return{remove:function(){o&&o.parentNode===e&&(e.removeChild(o),"relative"===e.style.position&&"static"===i&&(e.style.position=""))},updateText:function(n){a.textContent=n},getElement:function(){return o},show:function(){o.style.display="flex"},hide:function(){o.style.display="none"},setTheme:function(n){"dark"===n?(s.style.backgroundColor="rgba(30, 30, 30, 0.95)",a.style.color="#fff",r.style.border="3px solid rgba(255, 255, 255, 0.2)",r.style.borderTop="3px solid #fff",r.style.borderRight="3px solid #fff",d.querySelectorAll("div").forEach(n=>{n.style.backgroundColor="#fff"})):(s.style.backgroundColor="rgba(255, 255, 255, 0.95)",a.style.color="#333",r.style.border="3px solid rgba(74, 144, 226, 0.2)",r.style.borderTop="3px solid #4a90e2",r.style.borderRight="3px solid #4a90e2",d.querySelectorAll("div").forEach(n=>{n.style.backgroundColor="#4a90e2"}))}}}void 0!==i&&(n.exports.createLoading=i)},"./Message/V1/Message.js":function(n,t,e){class i{constructor(){this.containers={},this.messageCount=0,this.initContainers(),this.initStyles()}initContainers(){["center-top","center-bottom","left","right"].forEach(n=>{const t=document.createElement("div");t.className=`message-container ${n}`,t.id=`message-container-${n}`,document.body.appendChild(t),this.containers[n]=t})}initStyles(){if(document.getElementById("message-styles"))return;const n=document.createElement("style");n.id="message-styles",n.textContent="\n            .message-container {\n                position: fixed;\n                z-index: 9999;\n                pointer-events: none;\n            }\n            \n            .message-container.center-top,\n            .message-container.center-bottom {\n                left: 50%;\n                transform: translateX(-50%);\n            }\n            \n            .message-container.center-top {\n                top: 24px;\n            }\n            \n            .message-container.center-bottom {\n                bottom: 24px;\n            }\n            \n            .message-container.left {\n                left: 24px;\n                top: 24px;\n            }\n            \n            .message-container.right {\n                right: 24px;\n                top: 24px;\n            }\n            \n            .message-item {\n                pointer-events: auto;\n                min-width: 300px;\n                max-width: 500px;\n                padding: 12px 16px;\n                margin-bottom: 16px;\n                border-radius: 6px;\n                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), \n                            0 6px 16px 0 rgba(0, 0, 0, 0.08), \n                            0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                background-color: white;\n                display: flex;\n                align-items: flex-start;\n                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);\n                position: relative;\n                overflow: hidden;\n                opacity: 0;\n                transform: translateY(-20px);\n            }\n            \n            .message-item.left-entering {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.right-entering {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.entered {\n                opacity: 1;\n                transform: translateY(0) translateX(0);\n            }\n            \n            .message-item.hiding-left {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-right {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-up {\n                transform: translateY(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-down {\n                transform: translateY(100%);\n                opacity: 0;\n            }\n            \n            .message-icon {\n                margin-right: 12px;\n                font-size: 18px;\n                line-height: 1;\n                display: flex;\n                align-items: center;\n                height: 22px;\n                flex-shrink: 0;\n            }\n            \n            .message-content {\n                flex: 1;\n                font-size: 14px;\n                line-height: 1.5715;\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-close {\n                margin-left: 12px;\n                cursor: pointer;\n                color: rgba(0, 0, 0, 0.45);\n                font-size: 14px;\n                line-height: 1;\n                padding: 2px;\n                transition: color 0.3s;\n                display: flex;\n                align-items: center;\n                height: 22px;\n                flex-shrink: 0;\n            }\n            \n            .message-close:hover {\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-normal,\n            .message-info {\n                border-left: 4px solid #1890ff;\n            }\n            \n            .message-success {\n                border-left: 4px solid #52c41a;\n            }\n            \n            .message-error {\n                border-left: 4px solid #ff4d4f;\n            }\n            \n            .message-warning {\n                border-left: 4px solid #faad14;\n            }\n            \n            .message-important {\n                border-left: 4px solid #722ed1;\n                background-color: #f9f0ff;\n            }\n            \n            .message-progress {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                height: 2px;\n                background-color: rgba(0, 0, 0, 0.06);\n                width: 100%;\n            }\n            \n            .message-progress-bar {\n                height: 100%;\n                background-color: #1890ff;\n                width: 100%;\n                transition: width linear;\n            }\n            \n            .message-progress-bar.success {\n                background-color: #52c41a;\n            }\n            \n            .message-progress-bar.error {\n                background-color: #ff4d4f;\n            }\n            \n            .message-progress-bar.warning {\n                background-color: #faad14;\n            }\n            \n            .message-progress-bar.important {\n                background-color: #722ed1;\n            }\n        ",document.head.appendChild(n)}show(n){const t={type:"info",content:"",duration:3,position:"center-top",hideDirection:"up",showClose:null,onClose:null,..."string"==typeof n?{content:n}:n};null===t.showClose&&(t.showClose="left"===t.position||"right"===t.position),"up"===t.hideDirection&&"center-bottom"===t.position&&(t.hideDirection="down"),"up"===t.hideDirection&&"left"===t.position&&(t.hideDirection="left"),"up"===t.hideDirection&&"right"===t.position&&(t.hideDirection="right");const e=`message-${Date.now()}-${this.messageCount++}`,i=document.createElement("div");i.id=e,i.className=`message-item message-${t.type}`,"left"===t.position?i.classList.add("left-entering"):"right"===t.position&&i.classList.add("right-entering");const o={info:"ℹ️",success:"✅",error:"❌",warning:"⚠️",important:"🔔"},s=document.createElement("span");s.className="message-icon",s.textContent=o[t.type]||o.info;const r=document.createElement("span");r.className="message-content",r.textContent=t.content;const a=document.createElement("span");a.className="message-close",a.innerHTML="&times;",a.onclick=()=>this.closeMessage(e,t.position,t.hideDirection,t.onClose);let d=null;if(t.duration>0){const n=document.createElement("div");n.className="message-progress",d=document.createElement("div"),d.className=`message-progress-bar ${t.type}`,d.style.transitionDuration=`${t.duration}s`,d.style.width="100%",n.appendChild(d),i.appendChild(n),setTimeout(()=>{d&&(d.style.width="0%")},10)}i.appendChild(s),i.appendChild(r),t.showClose&&i.appendChild(a);const l=this.containers[t.position];l&&(l.firstChild?l.insertBefore(i,l.firstChild):l.appendChild(i),setTimeout(()=>{i.classList.add("entered")},10));let p=null;return t.duration>0&&(p=setTimeout(()=>{this.closeMessage(e,t.position,t.hideDirection,t.onClose)},1e3*t.duration)),i._messageData={timeoutId:p,onClose:t.onClose},e}closeMessage(n,t,e,i){const o=document.getElementById(n);o&&(o._messageData&&o._messageData.timeoutId&&clearTimeout(o._messageData.timeoutId),i?i():o._messageData&&o._messageData.onClose&&o._messageData.onClose(),o.classList.add(`hiding-${e}`),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300))}clear(){Object.keys(this.containers).forEach(n=>{const t=this.containers[n];t.querySelectorAll(".message-item").forEach(e=>{e._messageData&&e._messageData.timeoutId&&clearTimeout(e._messageData.timeoutId);let i="up";"center-bottom"===n&&(i="down"),"left"===n&&(i="left"),"right"===n&&(i="right"),e.classList.add(`hiding-${i}`),setTimeout(()=>{e.parentNode===t&&t.removeChild(e)},300)})})}info(n,t={}){return this.show({...t,content:n,type:"info"})}success(n,t={}){return this.show({...t,content:n,type:"success"})}error(n,t={}){return this.show({...t,content:n,type:"error"})}warning(n,t={}){return this.show({...t,content:n,type:"warning"})}important(n,t={}){return this.show({...t,content:n,type:"important"})}normal(n,t={}){return this.info(n,t)}close(n){const t=document.getElementById(n);if(!t)return;const e=t.parentNode;if(!e)return;let i="center-top";e.id.includes("center-bottom")&&(i="center-bottom"),e.id.includes("left")&&(i="left"),e.id.includes("right")&&(i="right");let o="up";"center-bottom"===i&&(o="down"),"left"===i&&(o="left"),"right"===i&&(o="right"),this.closeMessage(n,i,o)}}"undefined"==typeof window||window.Message||(window.Message=new i),void 0!==n&&n.exports&&(n.exports=i)},"./Message/V2/Message.js":function(n,t,e){class i{constructor(){this.containers={},this.messageCount=0,this.initContainers(),this.initStyles()}initContainers(){["center-top","center-bottom","left","right"].forEach(n=>{const t=document.createElement("div");t.className=`message-container ${n}`,t.id=`message-container-${n}`,document.body.appendChild(t),this.containers[n]=t})}initStyles(){if(document.getElementById("message-styles"))return;const n=document.createElement("style");n.id="message-styles",n.textContent="\n            .message-container {\n                position: fixed;\n                z-index: 9999;\n                pointer-events: none;\n            }\n            \n            .message-container.center-top,\n            .message-container.center-bottom {\n                left: 50%;\n                transform: translateX(-50%);\n            }\n            \n            .message-container.center-top {\n                top: 24px;\n            }\n            \n            .message-container.center-bottom {\n                bottom: 24px;\n            }\n            \n            .message-container.left {\n                left: 24px;\n                top: 24px;\n            }\n            \n            .message-container.right {\n                right: 24px;\n                top: 24px;\n            }\n            \n            .message-item {\n                pointer-events: auto;\n                min-width: 300px;\n                max-width: 500px;\n                padding: 12px 16px;\n                margin-bottom: 16px;\n                border-radius: 6px;\n                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), \n                            0 6px 16px 0 rgba(0, 0, 0, 0.08), \n                            0 9px 28px 8px rgba(0, 0, 0, 0.05);\n                background-color: white;\n                display: flex;\n                align-items: flex-start;\n                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);\n                position: relative;\n                overflow: hidden;\n                opacity: 0;\n                transform: translateY(-20px);\n            }\n            \n            .message-item.left-entering {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.right-entering {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.entered {\n                opacity: 1;\n                transform: translateY(0) translateX(0);\n            }\n            \n            .message-item.hiding-left {\n                transform: translateX(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-right {\n                transform: translateX(100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-up {\n                transform: translateY(-100%);\n                opacity: 0;\n            }\n            \n            .message-item.hiding-down {\n                transform: translateY(100%);\n                opacity: 0;\n            }\n            \n            .message-icon {\n                margin-right: 12px;\n                width: 22px;\n                height: 22px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                flex-shrink: 0;\n            }\n            \n            .message-icon svg {\n                width: 20px;\n                height: 20px;\n            }\n            \n            .message-content {\n                flex: 1;\n                font-size: 14px;\n                line-height: 1.5715;\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-close {\n                margin-left: 12px;\n                cursor: pointer;\n                color: rgba(0, 0, 0, 0.45);\n                font-size: 14px;\n                line-height: 1;\n                padding: 2px;\n                transition: color 0.3s;\n                display: flex;\n                align-items: center;\n                height: 22px;\n                flex-shrink: 0;\n            }\n            \n            .message-close:hover {\n                color: rgba(0, 0, 0, 0.85);\n            }\n            \n            .message-normal,\n            .message-info {\n                border-left: 4px solid #1890ff;\n            }\n            \n            .message-success {\n                border-left: 4px solid #52c41a;\n            }\n            \n            .message-error {\n                border-left: 4px solid #ff4d4f;\n            }\n            \n            .message-warning {\n                border-left: 4px solid #faad14;\n            }\n            \n            .message-important {\n                border-left: 4px solid #722ed1;\n                background-color: #f9f0ff;\n            }\n            \n            .message-progress {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                height: 2px;\n                background-color: rgba(0, 0, 0, 0.06);\n                width: 100%;\n            }\n            \n            .message-progress-bar {\n                height: 100%;\n                background-color: #1890ff;\n                width: 100%;\n                transition: width linear;\n            }\n            \n            .message-progress-bar.success {\n                background-color: #52c41a;\n            }\n            \n            .message-progress-bar.error {\n                background-color: #ff4d4f;\n            }\n            \n            .message-progress-bar.warning {\n                background-color: #faad14;\n            }\n            \n            .message-progress-bar.important {\n                background-color: #722ed1;\n            }\n        ",document.head.appendChild(n)}createMessageIcon(n){const t="http://www.w3.org/2000/svg",e=document.createElementNS(t,"svg");let i;switch(e.setAttribute("viewBox","0 0 1024 1024"),e.setAttribute("version","1.1"),e.setAttribute("xmlns",t),e.setAttribute("width","30"),e.setAttribute("height","30"),n){case"info":case"normal":default:i="#1890ff";break;case"success":i="#52c41a";break;case"error":i="#ff4d4f";break;case"warning":i="#faad14";break;case"important":i="#722ed1"}const o=document.createElementNS(t,"path");return o.setAttribute("d","M410.5 106h203C780 106 915.3 239.6 918 405.5v412.3c0 54.8-44 99.3-98.5 100.2h-409C244 918 108.7 784.4 106 618.5v-208C106 244 239.6 108.7 405.5 106h208-203z m203 62.5h-203c-132.3 0-239.9 106.2-242 238v207c0 132.3 106.2 239.9 238 242h411.3c20.6 0 37.4-16.6 37.7-37.1V410.5c0-133.7-108.3-242-242-242z m58.2 410.2c19.9 0 36 16.1 36 36s-16.1 36-36 36H354.5c-19.9 0-36-16.1-36-36s16.1-36 36-36h317.2zM360.4 406.5h172.7c19.9 0 36 16.1 36 36 0 19.7-15.8 35.7-35.4 36H360.4c-19.9 0-36-16.1-36-36 0-19.7 15.8-35.7 35.4-36H533.1 360.4z"),o.setAttribute("fill",i),e.appendChild(o),e}show(n){const t={type:"info",content:"",duration:3,position:"center-top",hideDirection:"up",showClose:null,onClose:null,..."string"==typeof n?{content:n}:n};null===t.showClose&&(t.showClose="left"===t.position||"right"===t.position),"up"===t.hideDirection&&"center-bottom"===t.position&&(t.hideDirection="down"),"up"===t.hideDirection&&"left"===t.position&&(t.hideDirection="left"),"up"===t.hideDirection&&"right"===t.position&&(t.hideDirection="right");const e=`message-${Date.now()}-${this.messageCount++}`,i=document.createElement("div");i.id=e,i.className=`message-item message-${t.type}`,"left"===t.position?i.classList.add("left-entering"):"right"===t.position&&i.classList.add("right-entering");const o=document.createElement("span");o.className="message-icon";const s=this.createMessageIcon(t.type);o.appendChild(s);const r=document.createElement("span");r.className="message-content",r.textContent=t.content;const a=document.createElement("span");a.className="message-close",a.innerHTML="&times;",a.onclick=()=>this.closeMessage(e,t.position,t.hideDirection,t.onClose);let d=null;if(t.duration>0){const n=document.createElement("div");n.className="message-progress",d=document.createElement("div"),d.className=`message-progress-bar ${t.type}`,d.style.transitionDuration=`${t.duration}s`,d.style.width="100%",n.appendChild(d),i.appendChild(n),setTimeout(()=>{d&&(d.style.width="0%")},10)}i.appendChild(o),i.appendChild(r),t.showClose&&i.appendChild(a);const l=this.containers[t.position];l&&(l.firstChild?l.insertBefore(i,l.firstChild):l.appendChild(i),setTimeout(()=>{i.classList.add("entered")},10));let p=null;return t.duration>0&&(p=setTimeout(()=>{this.closeMessage(e,t.position,t.hideDirection,t.onClose)},1e3*t.duration)),i._messageData={timeoutId:p,onClose:t.onClose},e}closeMessage(n,t,e,i){const o=document.getElementById(n);o&&(o._messageData&&o._messageData.timeoutId&&clearTimeout(o._messageData.timeoutId),i?i():o._messageData&&o._messageData.onClose&&o._messageData.onClose(),o.classList.add(`hiding-${e}`),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300))}clear(){Object.keys(this.containers).forEach(n=>{const t=this.containers[n];t.querySelectorAll(".message-item").forEach(e=>{e._messageData&&e._messageData.timeoutId&&clearTimeout(e._messageData.timeoutId);let i="up";"center-bottom"===n&&(i="down"),"left"===n&&(i="left"),"right"===n&&(i="right"),e.classList.add(`hiding-${i}`),setTimeout(()=>{e.parentNode===t&&t.removeChild(e)},300)})})}info(n,t={}){return this.show({...t,content:n,type:"info"})}success(n,t={}){return this.show({...t,content:n,type:"success"})}error(n,t={}){return this.show({...t,content:n,type:"error"})}warning(n,t={}){return this.show({...t,content:n,type:"warning"})}important(n,t={}){return this.show({...t,content:n,type:"important"})}normal(n,t={}){return this.info(n,t)}close(n){const t=document.getElementById(n);if(!t)return;const e=t.parentNode;if(!e)return;let i="center-top";e.id.includes("center-bottom")&&(i="center-bottom"),e.id.includes("left")&&(i="left"),e.id.includes("right")&&(i="right");let o="up";"center-bottom"===i&&(o="down"),"left"===i&&(o="left"),"right"===i&&(o="right"),this.closeMessage(n,i,o)}}"undefined"==typeof window||window.Message||(window.Message=new i),void 0!==n&&n.exports&&(n.exports=i)},"./ProgressBar/V1/ProgressBar.js":function(n,t,e){class i{constructor(n,t={}){this.defaultOptions={type:"circle",size:200,primaryColor:"#3498db",secondaryColor:"#ecf0f1",textColor:"#2c3e50",percentageColor:null,showPercentage:!0,text:"",textPosition:"bottom",textMargin:10,progress:0,animationDuration:300,useContainerSize:!0,containerMaxSize:300},this.options={...this.defaultOptions,...t},this.container="string"==typeof n?document.querySelector(n):n,this.container?(this.progress=this.options.progress,this.type=this.options.type,this.init()):console.error("InvestmentProgress: 未找到容器元素")}init(){this.container.innerHTML="",this.setContainerStyle(),this.createProgressElement(),this.updateProgress(this.progress)}setContainerStyle(){if(Object.assign(this.container.style,{position:"relative",display:"flex",justifyContent:"center",alignItems:"center",width:"100%",height:"100%",overflow:"hidden"}),this.options.useContainerSize){const n=this.container.clientWidth,t=this.container.clientHeight,e=Math.min(n,t,this.options.containerMaxSize);"bar"===this.type?this.options.size=Math.min(n,this.options.containerMaxSize):this.options.size=e}}createProgressElement(){this.progressContainer&&this.progressContainer.remove(),this.progressContainer=document.createElement("div"),this.progressContainer.className="investment-progress-container";const n=this.options.size;"bar"===this.type?Object.assign(this.progressContainer.style,{width:`${n}px`,height:"auto",display:"flex",flexDirection:this.getBarTextDirection(),alignItems:"center",justifyContent:"center"}):Object.assign(this.progressContainer.style,{width:`${n}px`,height:`${n}px`,position:"relative",display:"grid",gridTemplateAreas:this.getGridTemplateAreas(),gridTemplateColumns:this.getGridTemplateColumns(),gridTemplateRows:this.getGridTemplateRows(),alignItems:"center",justifyContent:"center"}),this.createProgressVisual(),this.createTextElement(),this.container.appendChild(this.progressContainer)}getBarTextDirection(){switch(this.options.textPosition){case"top":default:return"column";case"bottom":return"column-reverse";case"left":return"row";case"right":return"row-reverse"}}getGridTemplateAreas(){switch(this.options.textPosition){case"top":return"'text' 'visual'";case"bottom":default:return"'visual' 'text'";case"left":return"'text visual'";case"right":return"'visual text'"}}getGridTemplateColumns(){switch(this.options.textPosition){case"left":case"right":return"auto 1fr";default:return"1fr"}}getGridTemplateRows(){switch(this.options.textPosition){case"top":case"bottom":return"auto 1fr";default:return"1fr"}}getPercentageColor(){return this.options.percentageColor||this.options.textColor}createProgressVisual(){switch(this.visualContainer&&this.visualContainer.remove(),this.visualContainer=document.createElement("div"),this.visualContainer.className="investment-progress-visual","bar"===this.type?(this.visualContainer.style.display="flex",this.visualContainer.style.alignItems="center",this.visualContainer.style.justifyContent="flex-start"):(this.visualContainer.style.gridArea="visual",this.visualContainer.style.display="flex",this.visualContainer.style.alignItems="center",this.visualContainer.style.justifyContent="center"),this.type){case"circle":this.createCircleVisual();break;case"bar":this.createBarVisual();break;case"investment":this.createInvestmentVisual();break;default:return void console.error(`InvestmentProgress: 不支持的类型 "${this.type}"`)}this.progressContainer.appendChild(this.visualContainer)}createCircleVisual(){const n=this.options.size,t="http://www.w3.org/2000/svg",e=document.createElementNS(t,"svg");e.setAttribute("width",n),e.setAttribute("height",n),e.setAttribute("viewBox","0 0 120 120"),e.style.display="block";const i=2*Math.PI*54,o=document.createElementNS(t,"circle");o.setAttribute("cx","60"),o.setAttribute("cy","60"),o.setAttribute("r",54..toString()),o.setAttribute("fill","none"),o.setAttribute("stroke",this.options.secondaryColor),o.setAttribute("stroke-width","12"),e.appendChild(o),this.progressCircle=document.createElementNS(t,"circle"),this.progressCircle.setAttribute("cx","60"),this.progressCircle.setAttribute("cy","60"),this.progressCircle.setAttribute("r",54..toString()),this.progressCircle.setAttribute("fill","none"),this.progressCircle.setAttribute("stroke",this.options.primaryColor),this.progressCircle.setAttribute("stroke-width","12"),this.progressCircle.setAttribute("stroke-linecap","round"),this.progressCircle.setAttribute("stroke-dasharray",i.toString()),this.progressCircle.setAttribute("stroke-dashoffset",i.toString()),this.progressCircle.setAttribute("transform","rotate(-90 60 60)"),e.appendChild(this.progressCircle),this.options.showPercentage&&(this.percentageText=document.createElementNS(t,"text"),this.percentageText.setAttribute("x","60"),this.percentageText.setAttribute("y","65"),this.percentageText.setAttribute("text-anchor","middle"),this.percentageText.setAttribute("font-size","20"),this.percentageText.setAttribute("font-weight","600"),this.percentageText.setAttribute("fill",this.getPercentageColor()),this.percentageText.textContent="0%",e.appendChild(this.percentageText)),this.visualContainer.appendChild(e)}createBarVisual(){const n=this.options.size;Object.assign(this.visualContainer.style,{width:`${n}px`,height:"20px",backgroundColor:this.options.secondaryColor,borderRadius:"10px",overflow:"hidden",position:"relative"}),this.progressBar=document.createElement("div"),Object.assign(this.progressBar.style,{width:"0%",height:"100%",backgroundColor:this.options.primaryColor,borderRadius:"10px",transition:`width ${this.options.animationDuration}ms ease`}),this.visualContainer.appendChild(this.progressBar),this.options.showPercentage&&(this.percentageText=document.createElement("div"),Object.assign(this.percentageText.style,{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",fontSize:"14px",fontWeight:"600",color:this.getPercentageColor(),textShadow:"1px 1px 1px rgba(255,255,255,0.8)"}),this.percentageText.textContent="0%",this.visualContainer.appendChild(this.percentageText))}createInvestmentVisual(){const n=this.options.size;Object.assign(this.visualContainer.style,{width:`${n}px`,height:`${n}px`,position:"relative"});const t="http://www.w3.org/2000/svg",e=document.createElementNS(t,"svg");e.setAttribute("width","100%"),e.setAttribute("height","100%"),e.setAttribute("viewBox","0 0 100 100");for(let n=0;n<=10;n++){const i=document.createElementNS(t,"line");i.setAttribute("x1","0"),i.setAttribute("y1",10*n),i.setAttribute("x2","100"),i.setAttribute("y2",10*n),i.setAttribute("stroke",this.options.secondaryColor),i.setAttribute("stroke-width","0.5"),e.appendChild(i);const o=document.createElementNS(t,"line");o.setAttribute("x1",10*n),o.setAttribute("y1","0"),o.setAttribute("x2",10*n),o.setAttribute("y2","100"),o.setAttribute("stroke",this.options.secondaryColor),o.setAttribute("stroke-width","0.5"),e.appendChild(o)}this.growthPath=document.createElementNS(t,"path"),this.growthPath.setAttribute("d","M10,90 L10,90"),this.growthPath.setAttribute("fill","none"),this.growthPath.setAttribute("stroke",this.options.primaryColor),this.growthPath.setAttribute("stroke-width","3"),this.growthPath.setAttribute("stroke-linecap","round"),this.growthPath.setAttribute("stroke-linejoin","round"),e.appendChild(this.growthPath),this.visualContainer.appendChild(e),this.options.showPercentage&&(this.percentageText=document.createElement("div"),Object.assign(this.percentageText.style,{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",fontSize:"20px",fontWeight:"600",color:this.getPercentageColor()}),this.percentageText.textContent="0%",this.visualContainer.appendChild(this.percentageText))}createTextElement(){if(!this.options.text)return;this.textElement&&this.textElement.remove(),this.textElement=document.createElement("div"),this.textElement.className="investment-progress-text",this.textElement.textContent=this.options.text,"bar"===this.type?(this.textElement.style.display="flex",this.textElement.style.alignItems="center",this.textElement.style.justifyContent="center"):(this.textElement.style.gridArea="text",this.textElement.style.display="flex",this.textElement.style.alignItems="center",this.textElement.style.justifyContent="center");const n={color:this.options.textColor,fontSize:"14px",textAlign:"center",flexShrink:"0"};switch(this.options.textPosition){case"top":n.marginBottom=`${this.options.textMargin}px`,n.width="100%";break;case"bottom":n.marginTop=`${this.options.textMargin}px`,n.width="100%";break;case"left":n.marginRight=`${this.options.textMargin}px`,n.writingMode="vertical-rl",n.textOrientation="mixed",n.height="100%",n.maxWidth="none",n.maxHeight="150px";break;case"right":n.marginLeft=`${this.options.textMargin}px`,n.writingMode="vertical-rl",n.textOrientation="mixed",n.height="100%",n.maxWidth="none",n.maxHeight="150px"}Object.assign(this.textElement.style,n),this.progressContainer.appendChild(this.textElement)}updateProgress(n,t=!0){switch(this.progress=Math.max(0,Math.min(100,n)),this.type){case"circle":this.updateCircleProgress(t);break;case"bar":this.updateBarProgress(t);break;case"investment":this.updateInvestmentProgress(t)}this.options.showPercentage&&this.percentageText&&(this.percentageText.tagName,this.percentageText.textContent=`${Math.round(this.progress)}%`),this.triggerEvent("progressUpdate",{progress:this.progress})}updateCircleProgress(n){if(!this.progressCircle)return;const t=2*Math.PI*54,e=t-this.progress/100*t;this.progressCircle.style.transition=n?`stroke-dashoffset ${this.options.animationDuration}ms ease`:"none",this.progressCircle.setAttribute("stroke-dashoffset",e)}updateBarProgress(n){this.progressBar&&(this.progressBar.style.transition=n?`width ${this.options.animationDuration}ms ease`:"none",this.progressBar.style.width=`${this.progress}%`)}updateInvestmentProgress(n){if(!this.growthPath)return;const t=[];for(let n=0;n<=10;n++){const e=10+8*n,i=Math.min(1,n/10*(this.progress/100)),o=90-80*Math.pow(i,.7);t.push(`${e},${o}`)}const e=`M${t.join(" L")}`;n?(this.growthPath.style.transition=`d ${this.options.animationDuration}ms ease`,requestAnimationFrame(()=>{this.growthPath.setAttribute("d",e)})):(this.growthPath.style.transition="none",this.growthPath.setAttribute("d",e))}setType(n){this.type!==n&&(this.type=n,this.options.type=n,this.createProgressElement(),this.updateProgress(this.progress,!1))}setText(n){this.options.text=n,this.createTextElement()}setTextPosition(n){this.options.textPosition!==n&&(this.options.textPosition=n,this.createProgressElement(),this.updateProgress(this.progress,!1))}setColors(n,t,e,i){this.options.primaryColor=n||this.options.primaryColor,this.options.secondaryColor=t||this.options.secondaryColor,this.options.textColor=e||this.options.textColor,void 0!==i&&(this.options.percentageColor=i),this.init()}setPercentageColor(n){this.options.percentageColor=n,this.updatePercentageColor()}updatePercentageColor(){if(this.percentageText){const n=this.getPercentageColor();"text"===this.percentageText.tagName?this.percentageText.setAttribute("fill",n):this.percentageText.style.color=n}}reset(){this.updateProgress(0,!1)}complete(){this.updateProgress(100),this.triggerEvent("complete",{progress:100})}destroy(){this.container.innerHTML="",this.container.style=""}triggerEvent(n,t={}){const e=new CustomEvent(`investmentProgress:${n}`,{detail:{...t,instance:this}});this.container.dispatchEvent(e)}getProgress(){return this.progress}getOptions(){return{...this.options}}}void 0!==n&&n.exports?n.exports=i:"function"==typeof define&&define.amd?define([],function(){return i}):window.InvestmentProgress=i},"./TimeShaft/V1/TimeShaft.js":function(n,t,e){},"./TreeExpandPanel/V1/TreeExpandPanel.js":function(n,t,e){}},t={};function e(i){if(t[i])return t[i].exports;var o={exports:{}};return t[i]=o,n[i](o,o.exports,e),o.exports}var i="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;i.NG=i.NG||{},i.NG.Components=i.NG.Components||{},i.NG.Components["ButtonGroup/V1/ButtonGroup"]=e("./ButtonGroup/V1/ButtonGroup.js"),i.NG.Components["Components.osd.all.min"]=e("./Components.osd.all.min.js"),i.NG.Components["DownloadAttachs/V1/DownloadAttachs"]=e("./DownloadAttachs/V1/DownloadAttachs.js"),i.NG.Components["Loading/V1/FishingAnimation"]=e("./Loading/V1/FishingAnimation.js"),i.NG.Components["Loading/V2/Loading"]=e("./Loading/V2/Loading.js"),i.NG.Components["Message/V1/Message"]=e("./Message/V1/Message.js"),i.NG.Components["Message/V2/Message"]=e("./Message/V2/Message.js"),i.NG.Components["ProgressBar/V1/ProgressBar"]=e("./ProgressBar/V1/ProgressBar.js"),i.NG.Components["TimeShaft/V1/TimeShaft"]=e("./TimeShaft/V1/TimeShaft.js"),i.NG.Components["TreeExpandPanel/V1/TreeExpandPanel"]=e("./TreeExpandPanel/V1/TreeExpandPanel.js")}();
};
__modules["./DownloadAttachs/V1/DownloadAttachs.js"] = function(module, exports, require){
/**
 * 获取表单附件信息的封装函数
 * @param {Object} params - 参数对象
 * @param {string} params.phidValue - 主键ID
 * @param {string} params.busType - 业务类型
 * @param {string} params.tableName - 表名
 * @param {Array} params.mainTableNames - 主表名数组
 * @param {Array} params.detailTablePrefixes - 明细表前缀数组
 * @returns {Promise} 返回包含附件信息的Promise对象
 */
function getFormAttachmentInfo(params) {
  return new Promise((resolve, reject) => {
    const {
      phidValue,
      busType,
      tableName,
      mainTableNames,
      detailTablePrefixes,
    } = params;
    let fromObj = {};
    let mainInfo = {};

    // 处理主表附件信息
    $NG.execServer(
      "selectFromMainAttachmentInfo",
      {
        table: tableName,
        phid: phidValue,
        bus: busType,
      },
      function (res) {
        console.log(res);
        if (res.count == 0) {
          reject(new Error("未找到主表附件信息"));
          return;
        }

        const data = JSON.parse(res.data);
        if (data.length == 0) {
          reject(new Error("主表数据为空"));
          return;
        }

        const { extendObjects } = data[0];
        mainInfo = extendObjects;
        console.log("主表信息:", mainInfo);

        // 请求获取主表及明细附件标识
        $NG.request
          .get({
            url: `/sup/customServer/getInfo?id=${phidValue}&oType=view&customBusCode=${busType}&encryptPrimaryKey=${$NG.CryptoJS.encode(
              phidValue
            )}`,
          })
          .then((res) => {
            console.log("明细表响应:", res);

            // 处理响应数据
            fromObj = processResponseData(
              res,
              mainTableNames,
              detailTablePrefixes
            );
            // 合并主表信息
            fromObj = { ...fromObj, ...mainInfo };
            console.log("最终结果:", fromObj);

            resolve(fromObj);
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
}

// 处理响应数据的函数（保持不变）
function processResponseData(
  responseData,
  mainTableNames,
  detailTablePrefixes
) {
  const fromObj = {};

  // 处理主表（可能有多个主表）
  for (const mainTableName of mainTableNames) {
    const mainTable = responseData.data[mainTableName];
    if (mainTable && mainTable.u_file) {
      // 移除 @@数字 部分
      fromObj.mGuid = mainTable.u_file.replace(/@@\d+$/, "");
      break; // 只取第一个有值的主表
    }
  }

  // 处理明细表（可能有多种前缀）
  for (const detailPrefix of detailTablePrefixes) {
    // 找出所有匹配该前缀的明细表
    const detailTables = Object.keys(responseData.data)
      .filter((key) => key.startsWith(detailPrefix))
      .map((key) => ({
        tableName: key,
        suffix: key.replace(detailPrefix, ""),
      }));

    for (const { tableName, suffix } of detailTables) {
      const detailTable = responseData.data[tableName];
      if (Array.isArray(detailTable)) {
        const propName = suffix ? `d${suffix}Guids` : "dGuids";

        fromObj[propName] = detailTable
          .map((item) => {
            // 尝试可能的字段名
            const fileValue = item.u_file || item.u_body_file;
            if (fileValue) {
              // 移除 @@数字 部分
              return fileValue.replace(/@@\d+$/, "");
            }
            return null;
          })
          .filter((file) => file !== null && file !== undefined);
      }
    }
  }

  return fromObj;
}

// 调用示例
async function exampleUsage(phidValue, busType, tableName, dTableName) {
  try {
    //const params = {
    //    phidValue: "123456", // 替换为实际的主键ID
    //    busType: "fixedassest_store", // 替换为实际的业务类型
    //    tableName: "p_form_fixedassest_store", // 替换为实际的表名
    //    mainTableNames: ["p_form_fixedassest_store"],
    //    detailTablePrefixes: ["p_form__test_d"]
    //};
    const params = {
      phidValue: phidValue,
      busType: busType,
      tableName: tableName,
      mainTableNames: [tableName],
      detailTablePrefixes: [dTableName],
    };

    const fromObj = await getFormAttachmentInfo(params);
    console.log("获取到的附件信息:", fromObj);

    // 在这里可以使用fromObj进行后续操作
    return fromObj;
  } catch (error) {
    console.error("获取附件信息失败:", error);
    throw error;
  }
}

// 或者使用Promise方式调用
function exampleUsagePromise(phidValue, busType, tableName, dTableName) {
  const params = {
    phidValue: phidValue,
    busType: busType,
    tableName: tableName,
    mainTableNames: [tableName],
    detailTablePrefixes: [dTableName],
  };

  return getFormAttachmentInfo(params)
    .then((fromObj) => {
      console.log("获取到的附件信息:", fromObj);
      return fromObj;
    })
    .catch((error) => {
      console.error("获取附件信息失败:", error);
      throw error;
    });
}

/**
 * 获取特定DOM元素的值
 * @param {string} parentId - 父元素ID
 * @param {string} childSelector - 子元素选择器
 * @param {string} [valueType='text'] - 值类型: 'text'或'html'
 * @param {number} [timeout=5000] - 超时时间(毫秒)
 * @returns {Promise<string>} 元素的值
 */
function getElementValue(
  parentId,
  childSelector,
  valueType = "text",
  timeout = 5000
) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function tryGetElement() {
      const parent = document.getElementById(parentId);
      if (!parent) {
        if (Date.now() - startTime > timeout) {
          reject(`未找到ID为${parentId}的元素`);
          return;
        }
        setTimeout(tryGetElement, 100);
        return;
      }

      const child = parent.querySelector(childSelector);
      if (child) {
        if (valueType === "html") {
          resolve(child.innerHTML.trim());
        } else {
          resolve(child.textContent.trim());
        }
      } else {
        if (Date.now() - startTime > timeout) {
          reject(`在${parentId}中未找到${childSelector}元素`);
          return;
        }
        setTimeout(tryGetElement, 100);
      }
    }

    tryGetElement();
  });
}

// 引入JSZip库用于创建ZIP文件
function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (typeof JSZip !== "undefined") {
      resolve(JSZip);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve(JSZip);
    script.onerror = () => reject(new Error("Failed to load JSZip"));
    document.head.appendChild(script);
  });
}

// 修改后的下载函数，返回文件的Blob对象
// 修复：改进的下载文件为Blob函数，添加更好的错误处理
function downloadFileAsBlob(config) {
  const { downloadUrl, dbToken, requestData, fileName } = config;

  return new Promise((resolve, reject) => {
    if (!downloadUrl) {
      reject(new Error("缺少必要参数：downloadUrl"));
      return;
    }

    console.log(`开始下载文件: ${fileName}`, requestData);

    $NG.request
      .post({
        url: downloadUrl,
        headers: {
          dbToken: dbToken,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(requestData),
      })
      .then((res) => {
        console.log("下载响应:", res);

        if (res.data && res.data[requestData.asrFids[0]]) {
          const fileDownloadUrl = res.data[requestData.asrFids[0]];
          console.log("获取到下载URL:", fileDownloadUrl);

          // 使用fetch获取文件内容
          fetch(fileDownloadUrl, {
            headers: {
              dbToken: dbToken,
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.blob();
            })
            .then((blob) => {
              // 修复：检查Blob是否有效
              if (blob && blob.size > 0) {
                console.log(
                  `文件下载成功: ${fileName}, 大小: ${blob.size} bytes`
                );
                resolve({
                  blob: blob,
                  fileName: fileName,
                });
              } else {
                console.error(`文件Blob无效: ${fileName}, 大小: ${blob.size}`);
                reject(new Error(`文件Blob无效: ${fileName}`));
              }
            })
            .catch((error) => {
              console.error("获取文件内容失败:", error);
              reject(error);
            });
        } else {
          console.error("未获取到有效的下载URL", res);
          reject(new Error("未获取到有效的下载URL"));
        }
      })
      .catch((error) => {
        console.error("下载请求失败:", error);
        reject(error);
      });
  });
}

// 解码URL编码的文件名
function decodeFileName(fileName) {
  try {
    return decodeURIComponent(fileName);
  } catch (e) {
    console.warn("文件名解码失败，使用原文件名:", fileName);
    return fileName;
  }
}

// 主函数：下载所有附件并打包
async function downloadAllAttachmentsAsZipOldSingle(
  attachmentData,
  options = {}
) {
  try {
    // 加载JSZip库
    const JSZip = await loadJSZip();

    // 合并配置
    const config = {
      downloadUrl:
        options.downloadUrl || "JFileSrv/api/getDownloadUrlByAsrFids",
      dbToken: options.dbToken || "0001",
      parentFolderName: options.parentFolderName || "测试单据业务",
      wmDisabled: options.wmDisabled || "0",
      billWM: options.billWM || "YEIG",
      orgId: options.orgId || "0",
    };

    // 创建ZIP实例
    const zip = new JSZip();
    const parentFolder = zip.folder(config.parentFolderName);

    // 获取附件列表
    let attachmentRecordList;
    if (attachmentData.data && attachmentData.data.attachmentRecordList) {
      attachmentRecordList = attachmentData.data.attachmentRecordList;
    } else if (Array.isArray(attachmentData)) {
      attachmentRecordList = attachmentData;
    } else if (attachmentData.attachmentRecordList) {
      attachmentRecordList = attachmentData.attachmentRecordList;
    } else {
      throw new Error("无法识别的附件数据结构");
    }

    if (!attachmentRecordList || attachmentRecordList.length === 0) {
      throw new Error("未找到附件数据");
    }

    console.log(`开始处理 ${attachmentRecordList.length} 个附件`, config);

    // 创建下载任务数组
    const downloadPromises = attachmentRecordList.map((record) => {
      const folderName = record.typeName || "未分类";
      const fileName = decodeFileName(record.asrName);

      return downloadFileAsBlob({
        downloadUrl: config.downloadUrl,
        dbToken: config.dbToken,
        requestData: {
          asrFids: [record.asrFid],
          loginId: record.asrFill,
          orgId: config.orgId,
          busTypeCode: record.bustypecode,
          wmDisabled: config.wmDisabled,
          billWM: config.billWM,
        },
        fileName: fileName,
      })
        .then((fileData) => {
          // 在ZIP中创建对应的文件夹并添加文件
          let folder = parentFolder.folder(folderName);
          if (!folder) {
            folder = parentFolder.folder(folderName);
          }
          folder.file(fileName, fileData.blob);

          console.log(`已添加文件到文件夹: ${folderName}/${fileName}`);
          return {
            folderName: folderName,
            fileName: fileName,
            success: true,
          };
        })
        .catch((error) => {
          console.error(`下载文件失败: ${folderName}/${fileName}`, error);
          return {
            folderName: folderName,
            fileName: fileName,
            success: false,
            error: error.message,
          };
        });
    });

    // 等待所有下载完成
    const results = await Promise.allSettled(downloadPromises);

    // 统计下载结果
    const successfulDownloads = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;
    const failedDownloads = results.length - successfulDownloads;

    console.log(
      `下载完成: 成功 ${successfulDownloads} 个, 失败 ${failedDownloads} 个`
    );

    // 检查是否所有文件都下载失败
    if (successfulDownloads === 0) {
      throw new Error("所有文件下载都失败了，请检查网络连接和参数配置");
    }

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    console.log(`ZIP文件生成完成，大小: ${zipBlob.size} bytes`);

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${config.parentFolderName}_附件包.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 清理URL对象
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);

    console.log(`ZIP文件已生成: ${config.parentFolderName}_附件包.zip`);

    // 返回下载结果
    return {
      success: true,
      total: attachmentRecordList.length,
      successful: successfulDownloads,
      failed: failedDownloads,
      zipFileName: `${config.parentFolderName}_附件包.zip`,
      config: config,
      results: results.map((result, index) => ({
        record: attachmentRecordList[index],
        status: result.status,
        value: result.status === "fulfilled" ? result.value : result.reason,
      })),
    };
  } catch (error) {
    console.error("下载所有附件失败:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 主函数：下载所有附件并打包
async function downloadAllAttachmentsAsZip(attachmentData, options = {}) {
  try {
    // 加载JSZip库
    const JSZip = await loadJSZip();

    // 合并配置
    const config = {
      downloadUrl:
        options.downloadUrl || "JFileSrv/api/getDownloadUrlByAsrFids",
      dbToken: options.dbToken || "0001",
      parentFolderName: options.parentFolderName || "测试单据业务",
      wmDisabled: options.wmDisabled || "0",
      billWM: options.billWM || "YEIG",
      orgId: options.orgId || "0",
    };

    // 创建ZIP实例
    const zip = new JSZip();
    const parentFolder = zip.folder(config.parentFolderName);

    // 处理输入数据：统一转换为附件记录数组
    let allAttachmentRecords = [];

    if (Array.isArray(attachmentData)) {
      // 如果是数组，处理多个对象
      console.log(`检测到 ${attachmentData.length} 个对象`);

      attachmentData.forEach((item, index) => {
        let records = [];

        if (item.data && item.data.attachmentRecordList) {
          // 完整响应结构
          records = item.data.attachmentRecordList;
        } else if (item.attachmentRecordList) {
          // 只有attachmentRecordList字段
          records = item.attachmentRecordList;
        } else if (Array.isArray(item)) {
          // 直接是附件数组
          records = item;
        }

        console.log(`对象 ${index + 1} 包含 ${records.length} 个附件`);
        allAttachmentRecords = allAttachmentRecords.concat(records);
      });
    } else {
      // 单个对象的情况，保持原有逻辑
      console.log("检测到单个对象");

      if (attachmentData.data && attachmentData.data.attachmentRecordList) {
        allAttachmentRecords = attachmentData.data.attachmentRecordList;
      } else if (attachmentData.attachmentRecordList) {
        allAttachmentRecords = attachmentData.attachmentRecordList;
      } else if (Array.isArray(attachmentData)) {
        allAttachmentRecords = attachmentData;
      } else {
        throw new Error("无法识别的附件数据结构");
      }
    }

    if (!allAttachmentRecords || allAttachmentRecords.length === 0) {
      throw new Error("未找到附件数据");
    }

    console.log(`总共处理 ${allAttachmentRecords.length} 个附件`);

    // 按 typeName 分组附件
    const groupedAttachments = {};
    allAttachmentRecords.forEach((record) => {
      const folderName = record.typeName || "未分类";
      if (!groupedAttachments[folderName]) {
        groupedAttachments[folderName] = [];
      }
      groupedAttachments[folderName].push(record);
    });

    console.log(
      "附件分组情况:",
      Object.keys(groupedAttachments).map((key) => ({
        文件夹: key,
        文件数: groupedAttachments[key].length,
      }))
    );

    // 创建下载任务数组（按分组）
    const downloadPromises = [];

    Object.keys(groupedAttachments).forEach((folderName) => {
      const recordsInFolder = groupedAttachments[folderName];

      recordsInFolder.forEach((record) => {
        const fileName = decodeFileName(record.asrName);

        const promise = downloadFileAsBlob({
          downloadUrl: config.downloadUrl,
          dbToken: config.dbToken,
          requestData: {
            asrFids: [record.asrFid],
            loginId: record.asrFill,
            orgId: config.orgId,
            busTypeCode: record.bustypecode,
            wmDisabled: config.wmDisabled,
            billWM: config.billWM,
          },
          fileName: fileName,
        })
          .then((fileData) => {
            // 在ZIP中创建对应的文件夹并添加文件
            let folder = parentFolder.folder(folderName);
            if (!folder) {
              folder = parentFolder.folder(folderName);
            }
            folder.file(fileName, fileData.blob);

            console.log(`已添加文件到文件夹: ${folderName}/${fileName}`);
            return {
              folderName: folderName,
              fileName: fileName,
              success: true,
              record: record,
            };
          })
          .catch((error) => {
            console.error(`下载文件失败: ${folderName}/${fileName}`, error);
            return {
              folderName: folderName,
              fileName: fileName,
              success: false,
              error: error.message,
              record: record,
            };
          });

        downloadPromises.push(promise);
      });
    });

    // 等待所有下载完成
    const results = await Promise.allSettled(downloadPromises);

    // 统计下载结果
    const successfulDownloads = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;
    const failedDownloads = results.length - successfulDownloads;

    console.log(
      `下载完成: 成功 ${successfulDownloads} 个, 失败 ${failedDownloads} 个`
    );

    // 检查是否所有文件都下载失败
    if (successfulDownloads === 0) {
      throw new Error("所有文件下载都失败了，请检查网络连接和参数配置");
    }

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    console.log(`ZIP文件生成完成，大小: ${zipBlob.size} bytes`);

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${config.parentFolderName}_附件包.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 清理URL对象
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);

    console.log(`ZIP文件已生成: ${config.parentFolderName}_附件包.zip`);

    // 返回下载结果
    return {
      success: true,
      total: allAttachmentRecords.length,
      successful: successfulDownloads,
      failed: failedDownloads,
      zipFileName: `${config.parentFolderName}_附件包.zip`,
      groups: Object.keys(groupedAttachments).map((key) => ({
        groupName: key,
        fileCount: groupedAttachments[key].length,
      })),
      config: config,
      results: results.map((result, index) => {
        const record = allAttachmentRecords[index];
        return {
          record: record,
          status: result.status,
          value: result.status === "fulfilled" ? result.value : result.reason,
        };
      }),
    };
  } catch (error) {
    console.error("下载所有附件失败:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 便捷函数：创建下载按钮
function createDownloadButton(attachmentData, buttonOptions = {}) {
  const button = document.createElement("button");
  button.textContent = buttonOptions.text || "下载所有附件";
  button.style.cssText =
    buttonOptions.style ||
    `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
        padding: 10px 20px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;

  button.addEventListener("click", async () => {
    if (button.disabled) return;

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "下载中...";

    try {
      const result = await downloadAllAttachmentsAsZip(
        attachmentData,
        buttonOptions
      );

      if (result.success) {
        alert(
          `下载完成！成功: ${result.successful} 个文件, 失败: ${result.failed} 个文件`
        );
      } else {
        alert("下载失败: " + result.error);
      }
    } catch (error) {
      alert("下载过程出错: " + error.message);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  const container = buttonOptions.container || document.body;
  container.appendChild(button);

  return button;
}

// 保持向后兼容的原始函数
async function originalDownloadFunction() {
  const attachmentData = window.mAttachfromObj || getResponseData();
  return downloadAllAttachmentsAsZip(attachmentData);
}

//附件打包下载及编辑文件树模块
/**
 * 表单附件批量下载管理器
 * @param {Object} config 配置对象
 */
function initAttachmentDownloader(config) {
  // 默认配置
  const defaultConfig = {
    tableName: "",
    busType: "",
    FormName: "",
    sFormGroupKeys: [],
    dFormFormKeys: [],
    sFormName: [],
    dFormName: [],
    mFormName: "表头",
  };

  // 合并配置
  const cfg = { ...defaultConfig, ...config };

  // 内部变量
  const mstForm = $NG.getCmpApi(cfg.tableName);
  const phidValue = mstForm.getValues().phid;

  let treeStructure = {};
  let NuTreeStructure = {};
  let editTreeStructure = {};
  let downloadConfig = {};
  let currentTreeType = false;

  console.log("Attachment Downloader Initialized");
  console.log("---------phid---------" + phidValue);

  /**
   * 获取表单附件信息的封装函数
   */
  function getFormAttachmentInfo(params) {
    return new Promise((resolve, reject) => {
      const { phidValue, busType, tableName, mainTableNames } = params;
      let fromObj = {};
      let mainInfo = {};

      // 处理主表附件信息
      $NG.execServer(
        "selectFromMainAttachmentInfo",
        {
          table: tableName,
          phid: phidValue,
          bus: busType,
        },
        function (res) {
          console.log("主表附件信息查询结果:", res);

          if (res.count == 0 || !res.data) {
            console.log("未找到主表附件信息，继续处理其他附件");
            mainInfo = {};
          } else {
            try {
              const data = JSON.parse(res.data);
              if (data.length == 0) {
                console.log("主表数据为空，继续处理其他附件");
                mainInfo = {};
              } else {
                const { extendObjects } = data[0];
                mainInfo = extendObjects || {};
                console.log("主表信息:", mainInfo);
              }
            } catch (e) {
              console.error("解析主表数据失败:", e);
              mainInfo = {};
            }
          }

          // 请求获取主表及明细附件标识
          $NG.request
            .get({
              url: `/sup/customServer/getInfo?id=${phidValue}&oType=view&customBusCode=${busType}&encryptPrimaryKey=${$NG.CryptoJS.encode(
                phidValue
              )}`,
            })
            .then((res) => {
              console.log("明细表响应:", res);

              // 处理响应数据
              fromObj = processResponseData(res, mainTableNames);
              // 合并主表信息
              fromObj = { ...fromObj, ...mainInfo };
              console.log("最终结果:", fromObj);

              resolve(fromObj);
            })
            .catch((error) => {
              console.error("获取明细表信息失败:", error);
              fromObj = { ...mainInfo };
              resolve(fromObj);
            });
        }
      );
    });
  }

  /**
   * 处理响应数据的函数
   */
  function processResponseData(responseData, mainTableNames) {
    const fromObj = {};

    // 处理主表
    for (const mainTableName of mainTableNames) {
      const mainTable = responseData.data[mainTableName];
      if (mainTable) {
        fromObj.mGuids = [];

        cfg.sFormGroupKeys.forEach((fieldName, index) => {
          if (mainTable[fieldName]) {
            const fileValue = mainTable[fieldName];
            fromObj.mGuids.push({
              fieldName: fieldName,
              guid: fileValue.replace(/@@\d+$/, ""),
              formName: cfg.sFormName[index] || fieldName,
            });
            console.log(
              `找到主表附件字段: ${fieldName} -> ${cfg.sFormName[index]}`
            );
          }
        });

        if (fromObj.mGuids.length > 0) {
          break;
        }
      }
    }

    // 处理多个明细表
    fromObj.detailGuids = {};

    cfg.dFormFormKeys.forEach((detailTableName, index) => {
      const detailTable = responseData.data[detailTableName];
      if (Array.isArray(detailTable)) {
        const formName = cfg.dFormName[index] || detailTableName;
        fromObj.detailGuids[formName] = detailTable
          .map((item) => {
            const fileValue = item.u_file || item.u_body_file || item.u_file1;
            if (fileValue) {
              return fileValue.replace(/@@\d+$/, "");
            }
            return null;
          })
          .filter((file) => file !== null && file !== undefined);

        console.log(
          `明细表 ${detailTableName} 找到 ${fromObj.detailGuids[formName].length} 个附件`
        );
      }
    });

    return fromObj;
  }

  /**
   * 构建树形结构信息 - 带行标识
   */
  function buildTreeStructureWithRowFolder(downloadConfig) {
    const treeStructure = {
      root: {
        name: `${cfg.FormName}`,
        type: "root",
        level: 0,
        path: "/",
        children: [],
        fileCount: 0,
        id: generateId(),
        collapsed: false,
      },
      totalFiles: 0,
      totalFolders: 0,
      buildTime: new Date().toISOString(),
      type: true,
    };

    const rootNode = treeStructure.root;

    // 构建主表单附件树形结构
    if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
      const mainFormNode = {
        name: downloadConfig.mFormName,
        type: "folder",
        level: 1,
        path: `/${downloadConfig.mFormName}`,
        children: [],
        fileCount: 0,
        id: generateId(),
        collapsed: false,
      };

      const mainAttachments =
        downloadConfig.mainAttachment[downloadConfig.mFormName];
      if (
        mainAttachments &&
        mainAttachments.data &&
        mainAttachments.data.attachmentRecordList
      ) {
        const attachments = mainAttachments.data.attachmentRecordList;

        const attachmentsByType = {};
        attachments.forEach((attachment) => {
          const typeName = attachment.typeName || "未分类";
          if (!attachmentsByType[typeName]) {
            attachmentsByType[typeName] = [];
          }
          attachmentsByType[typeName].push(attachment);
        });

        Object.keys(attachmentsByType).forEach((typeName) => {
          const typeNode = {
            name: typeName,
            type: "folder",
            level: 2,
            path: `/${downloadConfig.mFormName}/${typeName}`,
            children: [],
            fileCount: attachmentsByType[typeName].length,
            id: generateId(),
            collapsed: false,
          };

          attachmentsByType[typeName].forEach((attachment) => {
            const fileNode = {
              name: decodeFileName(attachment.asrName),
              type: "file",
              level: 3,
              path: `/${downloadConfig.mFormName}/${typeName}/${decodeFileName(
                attachment.asrName
              )}`,
              fileInfo: {
                ...attachment, // 保存完整的附件信息用于预览
                asrFid: attachment.asrFid,
                asrName: attachment.asrName,
                fileSize: attachment.fileSize,
                uploadTime: attachment.uploadTime,
                typeName: attachment.typeName,
                asrRemark: attachment.asrRemark || "", // 添加备注信息
                asrSessionGuid: attachment.asrSessionGuid,
                bustypecode: attachment.bustypecode,
              },
              id: generateId(),
            };
            typeNode.children.push(fileNode);
            treeStructure.totalFiles++;
          });

          mainFormNode.children.push(typeNode);
          mainFormNode.fileCount += typeNode.fileCount;
          treeStructure.totalFolders++;
        });
      }

      rootNode.children.push(mainFormNode);
      treeStructure.totalFolders++;
    }

    // 构建分组表单附件树形结构
    if (downloadConfig.groupAttachments && downloadConfig.sFormName) {
      downloadConfig.sFormName.forEach((formName) => {
        if (downloadConfig.groupAttachments[formName]) {
          const groupFormNode = {
            name: formName,
            type: "folder",
            level: 1,
            path: `/${formName}`,
            children: [],
            fileCount: 0,
            id: generateId(),
            collapsed: false,
          };

          const groupAttachments = downloadConfig.groupAttachments[formName];
          if (
            groupAttachments.data &&
            groupAttachments.data.attachmentRecordList
          ) {
            const attachments = groupAttachments.data.attachmentRecordList;

            const attachmentsByType = {};
            attachments.forEach((attachment) => {
              const typeName = attachment.typeName || "未分类";
              if (!attachmentsByType[typeName]) {
                attachmentsByType[typeName] = [];
              }
              attachmentsByType[typeName].push(attachment);
            });

            Object.keys(attachmentsByType).forEach((typeName) => {
              const typeNode = {
                name: typeName,
                type: "folder",
                level: 2,
                path: `/${formName}/${typeName}`,
                children: [],
                fileCount: attachmentsByType[typeName].length,
                id: generateId(),
                collapsed: false,
              };

              attachmentsByType[typeName].forEach((attachment) => {
                const fileNode = {
                  name: decodeFileName(attachment.asrName),
                  type: "file",
                  level: 3,
                  path: `/${formName}/${typeName}/${decodeFileName(
                    attachment.asrName
                  )}`,
                  fileInfo: {
                    ...attachment, // 保存完整的附件信息用于预览
                    asrFid: attachment.asrFid,
                    asrName: attachment.asrName,
                    fileSize: attachment.fileSize,
                    uploadTime: attachment.uploadTime,
                    typeName: attachment.typeName,
                    asrRemark: attachment.asrRemark || "", // 添加备注信息
                    asrSessionGuid: attachment.asrSessionGuid,
                    bustypecode: attachment.bustypecode,
                  },
                  id: generateId(),
                };
                typeNode.children.push(fileNode);
                treeStructure.totalFiles++;
              });

              groupFormNode.children.push(typeNode);
              groupFormNode.fileCount += typeNode.fileCount;
              treeStructure.totalFolders++;
            });
          }

          rootNode.children.push(groupFormNode);
          treeStructure.totalFolders++;
        }
      });
    }

    // 构建明细表单附件树形结构 - 带行标识
    if (downloadConfig.detailAttachments && downloadConfig.dFormName) {
      downloadConfig.dFormName.forEach((formName) => {
        if (downloadConfig.detailAttachments[formName]) {
          const detailFormNode = {
            name: formName,
            type: "folder",
            level: 1,
            path: `/${formName}`,
            children: [],
            fileCount: 0,
            id: generateId(),
            collapsed: false,
          };

          const detailAttachments = downloadConfig.detailAttachments[formName];
          if (Array.isArray(detailAttachments)) {
            detailAttachments.forEach((detailItem, rowIndex) => {
              if (
                detailItem.code === 200 &&
                detailItem.data &&
                detailItem.data.attachmentRecordList
              ) {
                const rowNode = {
                  name: `行${rowIndex + 1}`,
                  type: "folder",
                  level: 2,
                  path: `/${formName}/行${rowIndex + 1}`,
                  children: [],
                  fileCount: 0,
                  id: generateId(),
                  collapsed: false,
                };

                const attachments = detailItem.data.attachmentRecordList;

                const attachmentsByType = {};
                attachments.forEach((attachment) => {
                  const typeName = attachment.typeName || "未分类";
                  if (!attachmentsByType[typeName]) {
                    attachmentsByType[typeName] = [];
                  }
                  attachmentsByType[typeName].push(attachment);
                });

                Object.keys(attachmentsByType).forEach((typeName) => {
                  const typeNode = {
                    name: typeName,
                    type: "folder",
                    level: 3,
                    path: `/${formName}/行${rowIndex + 1}/${typeName}`,
                    children: [],
                    fileCount: attachmentsByType[typeName].length,
                    id: generateId(),
                    collapsed: true,
                  };

                  attachmentsByType[typeName].forEach((attachment) => {
                    const fileNode = {
                      name: decodeFileName(attachment.asrName),
                      type: "file",
                      level: 4,
                      path: `/${formName}/行${
                        rowIndex + 1
                      }/${typeName}/${decodeFileName(attachment.asrName)}`,
                      fileInfo: {
                        ...attachment, // 保存完整的附件信息用于预览
                        asrFid: attachment.asrFid,
                        asrName: attachment.asrName,
                        fileSize: attachment.fileSize,
                        uploadTime: attachment.uploadTime,
                        typeName: attachment.typeName,
                        asrRemark: attachment.asrRemark || "", // 添加备注信息
                        asrSessionGuid: attachment.asrSessionGuid,
                        bustypecode: attachment.bustypecode,
                      },
                      id: generateId(),
                    };
                    typeNode.children.push(fileNode);
                    treeStructure.totalFiles++;
                  });

                  rowNode.children.push(typeNode);
                  rowNode.fileCount += typeNode.fileCount;
                  treeStructure.totalFolders++;
                });

                detailFormNode.children.push(rowNode);
                detailFormNode.fileCount += rowNode.fileCount;
                treeStructure.totalFolders++;
              }
            });
          }

          rootNode.children.push(detailFormNode);
          treeStructure.totalFolders++;
        }
      });
    }

    rootNode.fileCount = treeStructure.totalFiles;
    console.log("带行标识树形结构构建完成:", treeStructure);
    return treeStructure;
  }

  /**
   * 构建树形结构信息 - 不带行标识
   */
  function buildTreeStructureWithoutRowFolder(downloadConfig) {
    const treeStructure = {
      root: {
        name: `${cfg.FormName}`,
        type: "root",
        level: 0,
        path: "/",
        children: [],
        fileCount: 0,
        id: generateId(),
        collapsed: false,
      },
      totalFiles: 0,
      totalFolders: 0,
      buildTime: new Date().toISOString(),
      type: false,
    };

    const rootNode = treeStructure.root;

    // 构建主表单附件树形结构
    if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
      const mainFormNode = {
        name: downloadConfig.mFormName,
        type: "folder",
        level: 1,
        path: `/${downloadConfig.mFormName}`,
        children: [],
        fileCount: 0,
        id: generateId(),
        collapsed: false,
      };

      const mainAttachments =
        downloadConfig.mainAttachment[downloadConfig.mFormName];
      if (
        mainAttachments &&
        mainAttachments.data &&
        mainAttachments.data.attachmentRecordList
      ) {
        const attachments = mainAttachments.data.attachmentRecordList;

        const attachmentsByType = {};
        attachments.forEach((attachment) => {
          const typeName = attachment.typeName || "未分类";
          if (!attachmentsByType[typeName]) {
            attachmentsByType[typeName] = [];
          }
          attachmentsByType[typeName].push(attachment);
        });

        Object.keys(attachmentsByType).forEach((typeName) => {
          const typeNode = {
            name: typeName,
            type: "folder",
            level: 2,
            path: `/${downloadConfig.mFormName}/${typeName}`,
            children: [],
            fileCount: attachmentsByType[typeName].length,
            id: generateId(),
            collapsed: false,
          };

          attachmentsByType[typeName].forEach((attachment) => {
            const fileNode = {
              name: decodeFileName(attachment.asrName),
              type: "file",
              level: 3,
              path: `/${downloadConfig.mFormName}/${typeName}/${decodeFileName(
                attachment.asrName
              )}`,
              fileInfo: {
                ...attachment, // 保存完整的附件信息用于预览
                asrFid: attachment.asrFid,
                asrName: attachment.asrName,
                fileSize: attachment.fileSize,
                uploadTime: attachment.uploadTime,
                typeName: attachment.typeName,
                asrRemark: attachment.asrRemark || "", // 添加备注信息
                asrSessionGuid: attachment.asrSessionGuid,
                bustypecode: attachment.bustypecode,
              },
              id: generateId(),
            };
            typeNode.children.push(fileNode);
            treeStructure.totalFiles++;
          });

          mainFormNode.children.push(typeNode);
          mainFormNode.fileCount += typeNode.fileCount;
          treeStructure.totalFolders++;
        });
      }

      rootNode.children.push(mainFormNode);
      treeStructure.totalFolders++;
    }

    // 构建分组表单附件树形结构
    if (downloadConfig.groupAttachments && downloadConfig.sFormName) {
      downloadConfig.sFormName.forEach((formName) => {
        if (downloadConfig.groupAttachments[formName]) {
          const groupFormNode = {
            name: formName,
            type: "folder",
            level: 1,
            path: `/${formName}`,
            children: [],
            fileCount: 0,
            id: generateId(),
            collapsed: false,
          };

          const groupAttachments = downloadConfig.groupAttachments[formName];
          if (
            groupAttachments.data &&
            groupAttachments.data.attachmentRecordList
          ) {
            const attachments = groupAttachments.data.attachmentRecordList;

            const attachmentsByType = {};
            attachments.forEach((attachment) => {
              const typeName = attachment.typeName || "未分类";
              if (!attachmentsByType[typeName]) {
                attachmentsByType[typeName] = [];
              }
              attachmentsByType[typeName].push(attachment);
            });

            Object.keys(attachmentsByType).forEach((typeName) => {
              const typeNode = {
                name: typeName,
                type: "folder",
                level: 2,
                path: `/${formName}/${typeName}`,
                children: [],
                fileCount: attachmentsByType[typeName].length,
                id: generateId(),
                collapsed: false,
              };

              attachmentsByType[typeName].forEach((attachment) => {
                const fileNode = {
                  name: decodeFileName(attachment.asrName),
                  type: "file",
                  level: 3,
                  path: `/${formName}/${typeName}/${decodeFileName(
                    attachment.asrName
                  )}`,
                  fileInfo: {
                    ...attachment, // 保存完整的附件信息用于预览
                    asrFid: attachment.asrFid,
                    asrName: attachment.asrName,
                    fileSize: attachment.fileSize,
                    uploadTime: attachment.uploadTime,
                    typeName: attachment.typeName,
                    asrRemark: attachment.asrRemark || "", // 添加备注信息
                    asrSessionGuid: attachment.asrSessionGuid,
                    bustypecode: attachment.bustypecode,
                  },
                  id: generateId(),
                };
                typeNode.children.push(fileNode);
                treeStructure.totalFiles++;
              });

              groupFormNode.children.push(typeNode);
              groupFormNode.fileCount += typeNode.fileCount;
              treeStructure.totalFolders++;
            });
          }

          rootNode.children.push(groupFormNode);
          treeStructure.totalFolders++;
        }
      });
    }

    // 构建明细表单附件树形结构 - 不带行标识
    if (downloadConfig.detailAttachments && downloadConfig.dFormName) {
      downloadConfig.dFormName.forEach((formName) => {
        if (downloadConfig.detailAttachments[formName]) {
          const detailFormNode = {
            name: formName,
            type: "folder",
            level: 1,
            path: `/${formName}`,
            children: [],
            fileCount: 0,
            id: generateId(),
            collapsed: false,
          };

          const detailAttachments = downloadConfig.detailAttachments[formName];
          if (Array.isArray(detailAttachments)) {
            const allAttachments = [];
            detailAttachments.forEach((detailItem) => {
              if (
                detailItem.code === 200 &&
                detailItem.data &&
                detailItem.data.attachmentRecordList
              ) {
                allAttachments.push(...detailItem.data.attachmentRecordList);
              }
            });

            const attachmentsByType = {};
            allAttachments.forEach((attachment) => {
              const typeName = attachment.typeName || "未分类";
              if (!attachmentsByType[typeName]) {
                attachmentsByType[typeName] = [];
              }
              attachmentsByType[typeName].push(attachment);
            });

            Object.keys(attachmentsByType).forEach((typeName) => {
              const typeNode = {
                name: typeName,
                type: "folder",
                level: 2,
                path: `/${formName}/${typeName}`,
                children: [],
                fileCount: attachmentsByType[typeName].length,
                id: generateId(),
                collapsed: false,
              };

              attachmentsByType[typeName].forEach((attachment) => {
                const fileNode = {
                  name: decodeFileName(attachment.asrName),
                  type: "file",
                  level: 3,
                  path: `/${formName}/${typeName}/${decodeFileName(
                    attachment.asrName
                  )}`,
                  fileInfo: {
                    ...attachment, // 保存完整的附件信息用于预览
                    asrFid: attachment.asrFid,
                    asrName: attachment.asrName,
                    fileSize: attachment.fileSize,
                    uploadTime: attachment.uploadTime,
                    typeName: attachment.typeName,
                    asrRemark: attachment.asrRemark || "", // 添加备注信息
                    asrSessionGuid: attachment.asrSessionGuid,
                    bustypecode: attachment.bustypecode,
                  },
                  id: generateId(),
                };
                typeNode.children.push(fileNode);
                treeStructure.totalFiles++;
              });

              detailFormNode.children.push(typeNode);
              detailFormNode.fileCount += typeNode.fileCount;
              treeStructure.totalFolders++;
            });
          }

          rootNode.children.push(detailFormNode);
          treeStructure.totalFolders++;
        }
      });
    }

    rootNode.fileCount = treeStructure.totalFiles;
    console.log("不带行标识树形结构构建完成:", treeStructure);
    return treeStructure;
  }

  /**
   * 生成唯一ID
   */
  function generateId() {
    return "node_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 创建文件树编辑模态框
   */
  function createTreeEditModal() {
    const existingModal = document.getElementById("tree-edit-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "tree-edit-modal";
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>
					文件树编辑</h3>
                <div class="modal-controls">
                    <button class="modal-btn minimize-btn" title="最小化">−</button>
                    <button class="modal-btn maximize-btn" title="最大化">□</button>
                    <button class="modal-btn close-btn" title="关闭">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div class="toolbar">
                    <button class="icon-button" id="reset-btn" title="还原默认结构">
					<svg t="1760596744739" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4323" width="20" height="20"><path d="M828.586019 442.570786c-33.495897-10.623699-68.366625-15.99804-103.362339-15.99804-94.238456-0.124985-184.352417 38.870238-248.719532 107.611818-0.999878 1.124862-2.374709 1.749786-3.874526 1.749785-9.123882 0.249969-18.247765 0.374954-27.621616 0.374954C222.910212 536.309303 42.807275 476.066683 42.807275 402.200731v-78.615369c0-4.374464 4.749418-6.999143 8.498958-4.624434 87.989222 56.868034 241.095466 83.239803 393.701773 83.239803s305.712551-26.496754 393.701772-83.239803c3.624556-2.374709 8.498959 0.249969 8.498959 4.624434v78.615369c0 14.123269-6.499204 27.621616-18.622718 40.370054zM429.509904 938.510035C214.661223 935.760372 42.807275 876.642613 42.807275 804.526447v-78.740354c0-4.374464 4.874403-6.999143 8.498958-4.624434 75.615737 48.869014 199.475565 75.240783 329.709612 81.739988 2.749663 0.124985 4.874403 2.249724 5.249357 4.874402 5.499326 47.119228 20.622474 91.363808 43.244702 130.733986z m-44.119595-202.475197C191.66404 726.411016 42.807275 670.417875 42.807275 603.301097v-78.61537c0-4.374464 4.874403-6.999143 8.498958-4.624433 82.61488 53.368462 222.722717 79.990201 365.955172 82.989834 4.124495 0.124985 6.624189 4.374464 4.749418 7.99902-19.747581 38.12033-32.496019 80.240171-36.620514 124.98469zM445.008006 0c221.972809 0 402.200731 60.24262 402.200731 133.983587v67.116779c0 73.865952-180.227923 134.108572-402.200731 134.108572C222.910212 335.208938 42.807275 274.966317 42.807275 201.100366v-67.116779C42.807275 60.24262 222.910212 0 445.008006 0z m0 0" fill="#1677FF" p-id="4324"></path><path d="M725.348665 513.062151c67.866686-0.124985 132.858725 26.871708 180.852846 74.740845 47.994121 47.869136 74.990814 112.986159 74.990814 180.727861 0 67.741702-26.996693 132.858725-74.990814 180.727861s-112.986159 74.740844-180.852846 74.740845c-67.866686 0.124985-132.858725-26.871708-180.852846-74.740845-47.994121-47.869136-74.990814-112.986159-74.990814-180.727861 0-67.741702 26.996693-132.73374 74.990814-180.727861 47.994121-47.869136 112.986159-74.740844 180.852846-74.740845z m141.357684 382.578135c40.370055-194.226208-154.356092-203.600059-154.356092-203.600059l-0.124985-43.244703c-3.624556-18.12278-19.247642-7.124127-19.247642-7.124127l-103.862277 88.989099c-22.997183 16.24801-1.249847 28.121555-1.249847 28.121555l102.737415 88.48916c20.497489 15.373117 22.12229-8.24899 22.12229-8.248989v-40.120086c104.487201-32.496019 147.231964 96.613165 147.231965 96.613166 3.874525 7.374097 6.874158 0.124985 6.749173 0.124984zM445.008006 0.624923" fill="#1677FF" opacity=".5" p-id="4325"></path></svg>
					</button>
                    <button class="icon-button" id="toggle-row-folder-btn" title="切换行标识显示">
					<svg t="1760596898460" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6582" width="20" height="20"><path d="M475.356 261.395L364.101 128.066H64.998v166.619H65V895.64h895.354V261.395H475.356z m313.079 634.244c-53.354 0-101.031-24.942-132.564-64.081a169.998 169.998 0 0 1-1.969-2.497H129.881V327.974h765.593v253.202l0.035 0.028c39.515 32.323 64.845 82.132 64.845 138.018 0.001 97.433-76.97 176.417-171.919 176.417z" fill="#1677FF" p-id="6583"></path><path d="M895.509 581.204l-0.035-0.028c-29.37-24.012-66.568-38.37-107.039-38.37-94.948 0-171.919 78.985-171.919 176.417 0 41.528 13.988 79.701 37.386 109.839 0.65 0.838 1.304 1.672 1.969 2.497 31.533 39.14 79.21 64.081 132.564 64.081 94.948 0 171.919-78.985 171.919-176.417 0.001-55.887-25.33-105.696-64.845-138.019z m17.387 167.041h-100.13v102.75h-48.661v-102.75h-100.13v-49.934h100.13v-102.75h48.661v102.75h100.13v49.934z" fill="#1677FF" p-id="6584"></path><path d="M812.766 698.312v-102.75h-48.661v102.75h-100.13v49.933h100.13v102.75h48.661v-102.75h100.13v-49.933z" fill="#ffffff" p-id="6585"></path></svg>
					</button>
                    <button class="icon-button" id="add-folder-btn" title="添加文件夹">
					<svg t="1760596898460" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6582" width="20" height="20"><path d="M475.356 261.395L364.101 128.066H64.998v166.619H65V895.64h895.354V261.395H475.356z m313.079 634.244c-53.354 0-101.031-24.942-132.564-64.081a169.998 169.998 0 0 1-1.969-2.497H129.881V327.974h765.593v253.202l0.035 0.028c39.515 32.323 64.845 82.132 64.845 138.018 0.001 97.433-76.97 176.417-171.919 176.417z" fill="#1677FF" p-id="6583"></path><path d="M895.509 581.204l-0.035-0.028c-29.37-24.012-66.568-38.37-107.039-38.37-94.948 0-171.919 78.985-171.919 176.417 0 41.528 13.988 79.701 37.386 109.839 0.65 0.838 1.304 1.672 1.969 2.497 31.533 39.14 79.21 64.081 132.564 64.081 94.948 0 171.919-78.985 171.919-176.417 0.001-55.887-25.33-105.696-64.845-138.019z m17.387 167.041h-100.13v102.75h-48.661v-102.75h-100.13v-49.934h100.13v-102.75h48.661v102.75h100.13v49.934z" fill="#1677FF" p-id="6584"></path><path d="M812.766 698.312v-102.75h-48.661v102.75h-100.13v49.933h100.13v102.75h48.661v-102.75h100.13v-49.933z" fill="#ffffff" p-id="6585"></path></svg>
					</button>
                    <button class="icon-button" id="delete-btn" title="删除选中项">
					<svg t="1760601704642" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20160" width="20" height="20"><path d="M762.023564 733.556364l78.978327 78.959709 78.996945-78.978328a37.236364 37.236364 0 1 1 52.670837 52.670837l-79.015564 78.978327 79.015564 78.996946a37.236364 37.236364 0 0 1-52.670837 52.670836l-78.996945-79.015564-78.978327 79.015564a37.236364 37.236364 0 0 1-52.652219-52.670836l78.95971-78.996946-78.95971-78.978327a37.236364 37.236364 0 1 1 52.652219-52.670837zM800.581818 0a111.709091 111.709091 0 0 1 111.709091 111.709091v390.981818a37.236364 37.236364 0 1 1-72.927418-10.686836V130.327273a55.854545 55.854545 0 0 0-55.854546-55.854546H166.018327a55.854545 55.854545 0 0 0-55.761454 52.577746L110.163782 130.327273v744.727272a55.854545 55.854545 0 0 0 52.559127 55.761455l3.295418 0.093091h345.199709v0.986764a37.236364 37.236364 0 0 1 0 72.4992V1005.381818H148.945455a111.709091 111.709091 0 0 1-111.709091-111.709091V111.709091a111.709091 111.709091 0 0 1 111.709091-111.709091h651.636363zM577.163636 167.563636a111.709091 111.709091 0 1 1-80.989091 188.639419l-85.4016 49.282327a112.118691 112.118691 0 0 1 14.801455 84.1728l86.984145 50.213236a111.709091 111.709091 0 1 1-25.711709 49.654691l-86.667636-50.045673a111.709091 111.709091 0 1 1-32.395636-173.298036c0.949527-0.8192 2.048-1.545309 3.165091-2.196945l98.061963-56.617891A111.709091 111.709091 0 0 1 577.163636 167.563636z m18.618182 390.981819a55.854545 55.854545 0 1 0 0 111.70909 55.854545 55.854545 0 0 0 0-111.70909z m-279.272727-148.945455a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z m260.654545-186.181818a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z" fill="#1677FF" p-id="20161"></path></svg>
					</button>
                    <button class="icon-button" id="preview-btn" title="预览文件" disabled>
					<svg t="1760665298888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3435" width="20" height="20"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#1677FF" p-id="3436"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#1677FF" p-id="3437"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#1677FF" p-id="3438"></path></svg>
					</button>
                    <!-- 搜索控件 -->
                    <div class="search-container">
                        <select class="search-type-select" id="search-type">
                            <option value="filename">按文件</option>
                            <option value="remark">按备注</option>
                        </select>
                        <input type="text" class="search-input" id="search-input" placeholder="输入搜索关键词...">
                        <button class="icon-button" id="search-btn" title="搜索">
                            <svg t="1760758143032" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5831" width="20" height="20"><path d="M446.112323 177.545051c137.567677 0.219798 252.612525 104.59798 266.162424 241.493333 13.562828 136.895354-78.778182 261.818182-213.617777 289.008485-134.852525 27.203232-268.386263-52.156768-308.945455-183.608889s25.018182-272.252121 151.738182-325.779394A267.235556 267.235556 0 0 1 446.112323 177.545051m0-62.060607c-182.794343 0-330.989899 148.195556-330.989899 330.989899s148.195556 330.989899 330.989899 330.989899 330.989899-148.195556 330.989899-330.989899-148.195556-330.989899-330.989899-330.989899z m431.321212 793.341415a30.849293 30.849293 0 0 1-21.94101-9.102223l-157.220202-157.220202c-11.752727-12.179394-11.584646-31.534545 0.37495-43.50707 11.972525-11.972525 31.327677-12.140606 43.494141-0.37495l157.220202 157.220202a31.036768 31.036768 0 0 1 6.723232 33.810101 31.004444 31.004444 0 0 1-28.651313 19.174142z m0 0" p-id="5832" fill="#1677FF"></path></svg>
                        </button>
                    </div>
                    <div class="expand-levels">
                        <span style="display: inline-flex; justify-content: center; align-items: center;">
							<svg t="1760700387636" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1115" width="25" height="25"><path d="M832.128 768c33.194667 0 60.501333 25.173333 63.573333 57.813333L896 832a64 64 0 0 1-63.872 64h-298.922667A63.786667 63.786667 0 0 1 469.333333 832a64 64 0 0 1 63.872-64h298.922667zM213.333333 874.666667c-23.722667 0-42.666667-19.072-42.666666-42.624V362.666667A42.666667 42.666667 0 0 1 213.333333 320l4.992 0.298667c21.333333 2.432 37.674667 20.48 37.674667 42.325333L255.957333 490.666667h128.298667c21.248 0 39.594667 16.469333 42.112 37.674666L426.666667 533.333333l-0.298667 4.992a42.368 42.368 0 0 1-42.112 37.674667H256l0.042667 213.333333h128.256c22.869333 0 42.410667 19.114667 42.410666 42.666667l-0.298666 4.992a42.368 42.368 0 0 1-42.112 37.674667zM832.128 469.333333c33.194667 0 60.501333 25.173333 63.573333 57.813334L896 533.333333a64 64 0 0 1-63.872 64h-298.922667A63.786667 63.786667 0 0 1 469.333333 533.333333a64 64 0 0 1 63.872-64h298.922667z m-255.957333-341.333333c33.194667 0 60.458667 25.173333 63.573333 57.813333L640 192c0 35.328-29.013333 64-63.829333 64H191.829333A63.744 63.744 0 0 1 128 192C128 156.672 157.013333 128 191.829333 128h384.341334z" fill="#1677FF" p-id="1116"></path></svg>
						</span>
                        <button class="toolbar-btn expand-level-btn" data-level="1">1级</button>
                        <button class="toolbar-btn expand-level-btn" data-level="2">2级</button>
                        <button class="toolbar-btn expand-level-btn" data-level="3">3级</button>
                        <button class="toolbar-btn" id="toggle-expand-btn" title="切换展开/折叠">展开</button>
                    </div>
                </div>
                <div class="tree-container">
                    <div class="tree" id="editable-tree"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="footer-btn cancel-btn">取消</button>
                <button class="footer-btn confirm-btn">确认下载</button>
            </div>
        </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
            #tree-edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999;
                font-family: "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(1px);
            }
            
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 800px;
                height: 600px;
                background: #ffffff;
                border-radius: 4px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s ease;
                border: 1px solid #d1d1d1;
            }
            
            .modal-content.maximized {
                width: 95% !important;
                height: 95% !important;
                top: 2.5% !important;
                left: 2.5% !important;
                transform: none !important;
            }
            
            .modal-content.minimized {
                height: 60px !important;
                width: 300px !important;
            }
            
            .modal-content.minimized .modal-body,
            .modal-content.minimized .modal-footer {
                display: none !important;
            }
            
            .modal-header {
                background: #F8F9FA;
                color: black;
                padding: 14px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                user-select: none;
                border-bottom: 1px solid #F8F9FA;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: black;
            }
            
            .modal-controls {
                display: flex;
                gap: 6px;
            }
            
            .modal-btn {
    background: rgba(0, 0, 0, 0.1);
    color: rgba(255, 255, 255, 0.9);
    width: 26px;
    height: 26px;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s;
    border: none; /* 明确设置为无边框 */
    outline: none; /* 移除焦点时的轮廓 */
}

.modal-btn:hover {
    background: rgba(0, 0, 0, 0.1);
    color: white;
}

.close-btn:hover {
    background: #d32f2f;
    color: white;
}
            
            .modal-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #f5f7fa;
            }
            
            .toolbar {
                padding: 12px 16px;
                background: #ffffff;
                border-bottom: 1px solid #e1e5eb;
                display: flex;
                gap: 8px;
                flex-wrap: nowrap;
                align-items: center;
                overflow-x: auto;
                min-height: 60px;
            }
            
            .toolbar::-webkit-scrollbar {
                height: 4px;
            }
            
            .toolbar::-webkit-scrollbar-thumb {
                background: #d1d1d1;
                border-radius: 2px;
            }
            
            /* 搜索控件样式 */
            .search-container {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-left: 10px;
                flex-shrink: 0;
            }
            
            .search-type-select {
                padding: 6px 8px;
                border: 1px solid #d1d1d1;
                border-radius: 4px;
                background: white;
                font-size: 13px;
                color: #333;
                outline: none;
                min-width: 70px;
                flex-shrink: 0;
                height: 32px;
                box-sizing: border-box;
            }
            
            .search-type-select:focus {
                border-color: #1677FF;
            }
            
            .search-input {
                padding: 6px 10px;
                border: 1px solid #d1d1d1;
                border-radius: 4px;
                font-size: 13px;
                width: 140px;
                outline: none;
                transition: border-color 0.2s;
                flex-shrink: 0;
                height: 32px;
                box-sizing: border-box;
            }
            
            .search-input:focus {
                border-color: #1677FF;
            }
            
            .search-btn {
                padding: 6px;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
                flex-shrink: 0;
                height: 32px;
                width: 32px;
                box-sizing: border-box;
            }
            
            .search-btn:hover {
                background: #f0f4f8;
            }
            
            .expand-levels {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: auto;
                font-size: 13px;
                color: #666;
                flex-shrink: 0;
            }
            
            .expand-level-btn {
                padding: 4px 8px;
                font-size: 12px;
                min-width: 30px;
            }
            
            .toolbar-btn {
                padding: 6px 12px;
                border: 1px solid #d1d1d1;
                background: #ffffff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                color: #333333;
                transition: all 0.2s;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .toolbar-btn:hover {
                background: #f0f4f8;
                border-color: #1677FF;
                color: #1677FF;
            }
            
            .toolbar-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: #f5f5f5;
                border-color: #d1d1d1;
                color: #999999;
            }
			
			
			/* 基础按钮样式 */
.icon-button {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    outline: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

/* 悬停效果 */
.icon-button:hover {
    transform: scale(1.1);
}

/* 激活效果 */
.icon-button:active {
    transform: scale(0.95);
}

/* 禁用状态 */
.icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* 禁用状态下的SVG图标 - 变为灰色 */
.icon-button:disabled svg {
    filter: 
        grayscale(1) 
        brightness(0.7) 
        drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 自定义SVG样式 */
.icon-button svg {
    width: 30px;
    height: 30px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    transition: filter 0.3s ease;
}
			
			
            
            .tree-container {
                flex: 1;
                overflow: auto;
                padding: 16px;
                background: #ffffff;
            }
            
            .tree {
                min-height: 100%;
            }
            
            .tree-node {
                margin: 3px 0;
                position: relative;
            }
            
            .tree-node-content {
                display: flex;
                align-items: center;
                padding: 0px 10px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                user-select: none;
                border: 1px solid transparent;
            }
            
            .tree-node-content:hover {
                background: #f0f4f8;
                border-color: #e1e5eb;
            }
            
            .tree-node-content.selected {
                background: #e3f2fd;
                border: 1px solid #1677FF;
            }
            
            .tree-node-content.dragging {
                opacity: 0.5;
                background: #bbdefb;
            }
            
            .tree-node-content.drop-target {
                background: #e8f5e8;
                border: 1px dashed #4caf50;
            }
            
            /* 搜索高亮样式 */
            .tree-node-content.search-match {
                background: #fff9e6;
                border: 1px solid #ffc53d;
            }
            
            .tree-node-content.search-match .node-name {
                color: #d46b08;
                font-weight: 600;
            }
            
            .node-icon {
                margin-right: 8px;
                font-size: 16px;
            }
            
            .node-expand {
                margin-right: 6px;
                cursor: pointer;
                width: 18px;
                text-align: center;
                font-size: 12px;
                color: #666666;
            }
            
            .node-name {
                flex: 1;
                padding: 4px 6px;
                border: 1px solid transparent;
                border-radius: 3px;
                min-height: 22px;
                color: #333333;
                font-size: 14px;
            }
            
            .node-name.editing {
                border-color: #1677FF;
                background: white;
                outline: none;
                color: #000000 !important;
            }
            
            .node-name.editing input {
                color: #000000 !important;
                background: white;
                border: none;
                outline: none;
                width: 100%;
                font-size: 14px;
                font-family: inherit;
            }
            
            .node-children {
                margin-left: 24px;
                display: block;
            }
            
            .node-children.collapsed {
                display: none;
            }
            
            .drag-ghost {
                position: absolute;
                background: #1677FF;
                color: white;
                padding: 6px 10px;
                border-radius: 4px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0.8;
                transform: rotate(3deg);
                font-size: 14px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }
            
            .modal-footer {
                padding: 14px 20px;
                background: #f8f9fa;
                border-top: 1px solid #e1e5eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .footer-btn {
                padding: 10px 24px;
                border: 1px solid;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
                min-width: 80px;
            }
            
            .cancel-btn {
                background: #ffffff;
                color: #666666;
                border-color: #d1d1d1;
            }
            
            .cancel-btn:hover {
                background: #f5f5f5;
                border-color: #999999;
            }
            
            .confirm-btn {
                background: #1677FF;
                color: white;
                border-color: #1677FF;
            }
            
            .confirm-btn:hover {
                background: #0d5cd6;
                border-color: #0d5cd6;
            }
            
            .empty-message {
                text-align: center;
                color: #999999;
                padding: 40px;
                font-style: italic;
                font-size: 14px;
            }
            
            /* 搜索结果统计 */
            .search-results-info {
                padding: 8px 16px;
                background: #f0f4f8;
                border-bottom: 1px solid #e1e5eb;
                font-size: 13px;
                color: #666;
                display: none;
            }
            
            .search-results-info.visible {
                display: block;
            }
			
        `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    return modal;
  }

  /**
   * 初始化模态框交互
   */
  function initModalInteractions(modal) {
    const content = modal.querySelector(".modal-content");
    const header = modal.querySelector(".modal-header");
    const minimizeBtn = modal.querySelector(".minimize-btn");
    const maximizeBtn = modal.querySelector(".maximize-btn");
    const closeBtn = modal.querySelector(".close-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");
    const confirmBtn = modal.querySelector(".confirm-btn");
    const toggleRowFolderBtn = modal.querySelector("#toggle-row-folder-btn");

    let isDragging = false;
    let isMaximized = false;
    let isMinimized = false;
    let dragOffset = { x: 0, y: 0 };
    let currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;

    // 添加还原按钮事件
    const resetBtn = modal.querySelector("#reset-btn");
    resetBtn.addEventListener("click", () => {
      treeStructure = buildTreeStructureWithRowFolder(downloadConfig);
      NuTreeStructure = buildTreeStructureWithoutRowFolder(downloadConfig);
      currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;
      refreshTree();
      showToast("已还原默认树结构", "success");
    });

    // 初始化行标识按钮状态
    updateToggleRowFolderButton();

    // 切换行标识按钮事件
    toggleRowFolderBtn.addEventListener("click", () => {
      currentTreeType = !currentTreeType;
      currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;
      updateToggleRowFolderButton();
      refreshTree();
    });

    function updateToggleRowFolderButton() {
      toggleRowFolderBtn.innerHTML = `${
        currentTreeType
          ? '<svg t="1760600527572" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16994" width="20" height="20"><path d="M896 96c41.216 0 74.624 33.472 74.624 74.688v682.624c0 41.216-33.408 74.688-74.624 74.688H128a74.688 74.688 0 0 1-74.688-74.688V170.688C53.312 129.472 86.784 96 128 96h768zM117.312 853.312c0 5.888 4.8 10.688 10.688 10.688h138.624V373.312H117.312v480z m213.312 10.688H896a10.688 10.688 0 0 0 10.624-10.688v-480h-576V864z m-110.848-212.672a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 0 1 0-64h42.688l6.4 0.64z m0-170.688a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 1 1 0-64h42.688l6.4 0.64zM128 160a10.688 10.688 0 0 0-10.688 10.688v138.624h149.312V160H128z m202.624 149.312h576V170.688A10.688 10.688 0 0 0 896 160H330.624v149.312z" p-id="16995" fill="#1677FF"></path></svg>'
          : '<svg t="1760600527572" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16994" width="20" height="20"><path d="M896 96c41.216 0 74.624 33.472 74.624 74.688v682.624c0 41.216-33.408 74.688-74.624 74.688H128a74.688 74.688 0 0 1-74.688-74.688V170.688C53.312 129.472 86.784 96 128 96h768zM117.312 853.312c0 5.888 4.8 10.688 10.688 10.688h138.624V373.312H117.312v480z m213.312 10.688H896a10.688 10.688 0 0 0 10.624-10.688v-480h-576V864z m-110.848-212.672a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 0 1 0-64h42.688l6.4 0.64z m0-170.688a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 1 1 0-64h42.688l6.4 0.64zM128 160a10.688 10.688 0 0 0-10.688 10.688v138.624h149.312V160H128z m202.624 149.312h576V170.688A10.688 10.688 0 0 0 896 160H330.624v149.312z" p-id="16995" fill="#bfbfbf"></path></svg>'
      }`;
      // 移除内联样式的设置，让按钮保持默认样式
      toggleRowFolderBtn.style.backgroundColor = "";
      toggleRowFolderBtn.style.borderColor = "";
      toggleRowFolderBtn.style.color = "";
    }

    // 拖动功能
    header.addEventListener("mousedown", startDrag);

    function startDrag(e) {
      if (e.target.classList.contains("modal-btn")) return;

      isDragging = true;
      const rect = content.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", stopDrag);
    }

    function onDrag(e) {
      if (!isDragging) return;

      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;

      content.style.left = x + "px";
      content.style.top = y + "px";
      content.style.transform = "none";
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDrag);
    }

    // 最小化/最大化/关闭功能
    minimizeBtn.addEventListener("click", () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        content.classList.add("minimized");
        minimizeBtn.innerHTML = "❐";
        minimizeBtn.title = "还原";
      } else {
        content.classList.remove("minimized");
        minimizeBtn.innerHTML = "−";
        minimizeBtn.title = "最小化";
      }
    });

    maximizeBtn.addEventListener("click", () => {
      isMaximized = !isMaximized;
      if (isMaximized) {
        content.classList.add("maximized");
        maximizeBtn.innerHTML = "⧉";
        maximizeBtn.title = "还原";
      } else {
        content.classList.remove("maximized");
        maximizeBtn.innerHTML = "□";
        maximizeBtn.title = "最大化";
      }
    });

    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    cancelBtn.addEventListener("click", () => {
      modal.remove();
    });

    confirmBtn.addEventListener("click", () => {
      editTreeStructure = getEditedTreeStructure();
      console.log("编辑后的树结构:", editTreeStructure);
      modal.remove();

      showToast("树结构已保存，开始下载附件", "success");
      downloadWithEditedStructure(editTreeStructure, downloadConfig);
    });

    // 初始化可编辑树
    initEditableTree(currentTreeData);

    function refreshTree() {
      const treeContainer = document.getElementById("editable-tree");
      treeContainer.innerHTML = "";
      initEditableTree(currentTreeData);
    }
  }

  /**
   * 初始化可编辑树
   */
  function initEditableTree(treeData) {
    const treeContainer = document.getElementById("editable-tree");
    let selectedNode = null;
    let dragNode = null;
    let searchResults = [];
    let currentSearchIndex = -1;
    let isAllExpanded = false;

    // 渲染树
    renderTree(treeData.root, treeContainer);

    // 工具栏事件
    document.getElementById("add-folder-btn").addEventListener("click", () => {
      if (selectedNode) {
        addNewNode(selectedNode, "folder");
      } else {
        addNewNode(treeData.root, "folder");
      }
    });

    document.getElementById("delete-btn").addEventListener("click", () => {
      if (selectedNode && selectedNode.type !== "root") {
        deleteNode(selectedNode);
      } else {
        showToast("请选择要删除的节点", "warning");
      }
    });

    // 文件预览按钮事件
    const previewBtn = document.getElementById("preview-btn");
    previewBtn.addEventListener("click", () => {
      if (selectedNode && selectedNode.type === "file") {
        previewFile(selectedNode);
      }
    });

    // 合并展开/折叠按钮
    const toggleExpandBtn = document.getElementById("toggle-expand-btn");
    toggleExpandBtn.addEventListener("click", () => {
      isAllExpanded = !isAllExpanded;
      if (isAllExpanded) {
        expandAllNodes(treeData.root);
        toggleExpandBtn.textContent = "折叠";
      } else {
        collapseAllNodes(treeData.root);
        toggleExpandBtn.textContent = "展开";
      }
      refreshTree();
    });

    // 展开层级按钮事件
    document.querySelectorAll(".expand-level-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const level = parseInt(e.target.dataset.level);
        expandToLevel(treeData.root, level);
        refreshTree();
        showToast(`已展开到${level}级目录`, "success");
      });
    });

    // 搜索功能
    const searchTypeSelect = document.getElementById("search-type");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });

    function performSearch() {
      const searchType = searchTypeSelect.value;
      const keyword = searchInput.value.trim();

      if (!keyword) {
        showToast("请输入搜索关键词", "warning");
        return;
      }

      searchResults = [];
      currentSearchIndex = -1;

      // 递归搜索树
      function searchNodes(node) {
        if (node.type === "file") {
          let match = false;
          if (searchType === "filename") {
            // 按文件名搜索
            match = node.name.toLowerCase().includes(keyword.toLowerCase());
          } else if (searchType === "remark") {
            // 按备注搜索
            match =
              node.fileInfo &&
              node.fileInfo.asrRemark &&
              node.fileInfo.asrRemark
                .toLowerCase()
                .includes(keyword.toLowerCase());
          }

          if (match) {
            searchResults.push(node);
            // 展开文件路径上的所有父节点
            expandNodePath(node, treeData.root);
          }
        }

        if (node.children) {
          node.children.forEach((child) => {
            searchNodes(child);
          });
        }
      }

      searchNodes(treeData.root);

      if (searchResults.length === 0) {
        showToast(
          `未找到匹配的${searchType === "filename" ? "文件" : "备注"}`,
          "info"
        );
      } else {
        showToast(`找到 ${searchResults.length} 个匹配结果`, "success");
        highlightSearchResults();
        navigateToNextResult();
      }
    }

    /**
     * 展开节点路径上的所有父节点
     */
    function expandNodePath(targetNode, rootNode) {
      const path = findNodePath(rootNode, targetNode);
      if (path) {
        path.forEach((node) => {
          if (node.type === "folder" || node.type === "root") {
            node.collapsed = false;
          }
        });
      }
    }

    /**
     * 查找节点路径
     */
    function findNodePath(rootNode, targetNode, currentPath = []) {
      if (rootNode === targetNode) {
        return [...currentPath, rootNode];
      }

      if (rootNode.children) {
        for (const child of rootNode.children) {
          const path = findNodePath(child, targetNode, [
            ...currentPath,
            rootNode,
          ]);
          if (path) {
            return path;
          }
        }
      }

      return null;
    }

    function highlightSearchResults() {
      // 清除之前的高亮
      document
        .querySelectorAll(".tree-node-content.search-match")
        .forEach((el) => {
          el.classList.remove("search-match");
        });

      // 添加新的高亮
      searchResults.forEach((node) => {
        const nodeElement = document.querySelector(
          `[data-node-id="${node.id}"] .tree-node-content`
        );
        if (nodeElement) {
          nodeElement.classList.add("search-match");
        }
      });

      refreshTree();
    }

    function navigateToNextResult() {
      if (searchResults.length === 0) return;

      currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
      const currentNode = searchResults[currentSearchIndex];

      // 滚动到对应节点
      const nodeElement = document.querySelector(
        `[data-node-id="${currentNode.id}"] .tree-node-content`
      );
      if (nodeElement) {
        nodeElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 添加当前高亮
        document
          .querySelectorAll(".tree-node-content.search-match")
          .forEach((el) => {
            el.style.background = "#fff9e6";
          });
        nodeElement.style.background = "#ffd666";

        showToast(
          `第 ${currentSearchIndex + 1}/${searchResults.length} 个结果`,
          "info",
          1500
        );
      }
    }

    function renderTree(node, container, level = 0) {
      const nodeElement = createNodeElement(node, level);
      container.appendChild(nodeElement);

      if (node.children && node.children.length > 0 && !node.collapsed) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "node-children";

        node.children.forEach((child) => {
          renderTree(child, childrenContainer, level + 1);
        });

        nodeElement.appendChild(childrenContainer);
      }
    }

    function createNodeElement(node, level) {
      const nodeDiv = document.createElement("div");
      nodeDiv.className = "tree-node";
      nodeDiv.dataset.nodeId = node.id;

      const contentDiv = document.createElement("div");
      contentDiv.className = "tree-node-content";
      contentDiv.style.paddingLeft = level * 20 + "px";

      // 展开/折叠按钮（仅文件夹）
      if (node.type === "folder" || node.type === "root") {
        const expandBtn = document.createElement("span");
        expandBtn.className = "node-expand";
        expandBtn.innerHTML = node.collapsed ? "▶ " : "▼ ";
        expandBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleNode(node);
        });
        contentDiv.appendChild(expandBtn);
      } else {
        const spacer = document.createElement("span");
        spacer.className = "node-expand";
        spacer.style.width = "18px";
        contentDiv.appendChild(spacer);
      }

      // 节点图标
      const icon = document.createElement("span");
      icon.className = "node-icon";
      icon.innerHTML = getNodeIcon(node);
      contentDiv.appendChild(icon);

      // 节点名称（可编辑）
      const nameSpan = document.createElement("span");
      nameSpan.className = "node-name";

      // 如果是文件节点且有备注，显示备注信息
      if (node.type === "file" && node.fileInfo && node.fileInfo.asrRemark) {
        nameSpan.innerHTML = `${node.name} <span style="color: #999; font-size: 12px; margin-left: 8px;">${node.fileInfo.asrRemark}</span>`;
      } else {
        nameSpan.textContent = node.name;
      }

      nameSpan.addEventListener("dblclick", () => {
        makeNameEditable(nameSpan, node);
      });
      contentDiv.appendChild(nameSpan);

      // 点击选择
      contentDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        selectNode(node, contentDiv);
        updateToolbarState();
      });

      // 拖动功能
      contentDiv.draggable = true;
      contentDiv.addEventListener("dragstart", (e) => {
        dragNode = node;
        contentDiv.classList.add("dragging");
        e.dataTransfer.setData("text/plain", node.id);

        const ghost = contentDiv.cloneNode(true);
        ghost.classList.add("drag-ghost");
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);

        setTimeout(() => document.body.removeChild(ghost), 0);
      });

      contentDiv.addEventListener("dragend", () => {
        contentDiv.classList.remove("dragging");
        document.querySelectorAll(".tree-node-content").forEach((el) => {
          el.classList.remove("drop-target");
        });
        dragNode = null;
      });

      contentDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (dragNode && canDrop(dragNode, node)) {
          contentDiv.classList.add("drop-target");
        }
      });

      contentDiv.addEventListener("dragleave", () => {
        contentDiv.classList.remove("drop-target");
      });

      contentDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        contentDiv.classList.remove("drop-target");

        if (dragNode && canDrop(dragNode, node)) {
          moveNode(dragNode, node);
        }
      });

      nodeDiv.appendChild(contentDiv);
      return nodeDiv;
    }

    function getNodeIcon(node) {
      switch (node.type) {
        case "root":
          return '<svg t="1760581609068" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2020" width="20" height="20"><path d="M32 128a64 64 0 0 1 64-64h464.128a64 64 0 0 1 45.312 18.752L714.688 192H32V128zM32 256h896a64 64 0 0 1 64 64v544a64 64 0 0 1-64 64h-832a64 64 0 0 1-64-64V256zM192 672v64a32 32 0 0 0 64 0v-64a32 32 0 0 0-64 0z m192 0a32 32 0 0 0-64 0v64a32 32 0 0 0 64 0v-64z m64 0v64a32 32 0 0 0 64 0v-64a32 32 0 0 0-64 0z" fill="#FF9B29" p-id="2021"></path></svg>';
        case "folder":
          return node.collapsed
            ? '<svg t="1760581533162" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1798" width="20" height="20"><path d="M838.782362 1023.6801H183.627098A184.262418 184.262418 0 0 1 0.00448 838.138082V185.542018A184.262418 184.262418 0 0 1 183.627098 0h87.012808a77.223868 77.223868 0 0 1 48.624805 17.274602l113.244611 93.730709a74.536707 74.536707 0 0 0 47.985005 17.274602h358.288035a184.134458 184.134458 0 0 1 182.982818 185.542018v524.636051a184.134458 184.134458 0 0 1-182.982818 185.542018z" fill="#FFD05C" p-id="1799"></path><path d="M314.786111 442.549703h733.850671a104.41537 104.41537 0 0 1 95.97001 142.419494l-144.594814 372.427616a103.00781 103.00781 0 0 1-95.97001 66.219307H169.551497a104.09547 104.09547 0 0 1-95.97001-142.675414l145.234614-372.427616a103.77557 103.77557 0 0 1 95.97001-65.963387z m0 0" fill="#FCA235" p-id="1800"></path></svg>'
            : '<svg t="1760581533162" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1798" width="20" height="20"><path d="M838.782362 1023.6801H183.627098A184.262418 184.262418 0 0 1 0.00448 838.138082V185.542018A184.262418 184.262418 0 0 1 183.627098 0h87.012808a77.223868 77.223868 0 0 1 48.624805 17.274602l113.244611 93.730709a74.536707 74.536707 0 0 0 47.985005 17.274602h358.288035a184.134458 184.134458 0 0 1 182.982818 185.542018v524.636051a184.134458 184.134458 0 0 1-182.982818 185.542018z" fill="#FFD05C" p-id="1799"></path><path d="M314.786111 442.549703h733.850671a104.41537 104.41537 0 0 1 95.97001 142.419494l-144.594814 372.427616a103.00781 103.00781 0 0 1-95.97001 66.219307H169.551497a104.09547 104.09547 0 0 1-95.97001-142.675414l145.234614-372.427616a103.77557 103.77557 0 0 1 95.97001-65.963387z m0 0" fill="#FCA235" p-id="1800"></path></svg>';
        case "file":
          return '<svg t="1760581379829" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1579" width="20" height="20"><path d="M951.466667 1013.333333h-874.666667c-14.933333 0-27.733333-12.8-27.733333-27.733333V38.4c0-14.933333 12.8-27.733333 27.733333-27.733333h518.4c211.2 0 381.866667 170.666667 381.866667 381.866666v593.066667c0 14.933333-10.666667 27.733333-25.6 27.733333z" fill="#F7F7F7" p-id="1580"></path><path d="M951.466667 1024h-874.666667c-21.333333 0-38.4-17.066667-38.4-38.4V38.4C38.4 17.066667 55.466667 0 76.8 0h518.4c217.6 0 392.533333 177.066667 392.533333 392.533333v593.066667c2.133333 21.333333-17.066667 38.4-36.266666 38.4zM76.8 21.333333c-8.533333 0-14.933333 8.533333-14.933333 17.066667v947.2c0 8.533333 6.4 17.066667 17.066666 17.066667h872.533334c8.533333 0 17.066667-6.4 17.066666-17.066667V392.533333C966.4 187.733333 800 21.333333 595.2 21.333333H76.8z" fill="#E8E8E8" p-id="1581"></path><path d="M704 349.866667H330.666667c-10.666667 0-17.066667 8.533333-17.066667 17.066666v14.933334c0 10.666667 8.533333 17.066667 17.066667 17.066666H704c10.666667 0 17.066667-8.533333 17.066667-17.066666v-14.933334c0-8.533333-8.533333-17.066667-17.066667-17.066666zM654.933333 535.466667c8.533333 0 14.933333-6.4 14.933334-14.933334v-19.2c0-8.533333-6.4-14.933333-14.933334-14.933333H369.066667c-8.533333 0-14.933333 6.4-14.933334 14.933333v19.2c0 8.533333 6.4 14.933333 14.933334 14.933334h285.866666zM704 616.533333H328.533333c-10.666667 0-17.066667 8.533333-17.066666 17.066667v12.8c0 10.666667 8.533333 17.066667 17.066666 17.066667H704c10.666667 0 17.066667-8.533333 17.066667-17.066667v-12.8c0-10.666667-8.533333-17.066667-17.066667-17.066667z" fill="#6E6E6E" p-id="1582"></path></svg>';
        default:
          return '<svg t="1760581740715" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3085" width="20" height="20"><path d="M512 0C227.555556 0 0 227.555556 0 512s227.555556 512 512 512 512-227.555556 512-512-227.555556-512-512-512z m45.511111 853.333333c-17.066667 11.377778-28.444444 17.066667-51.2 17.066667-17.066667 0-34.133333-5.688889-51.2-17.066667-17.066667-11.377778-22.755556-28.444444-22.755555-51.2s5.688889-34.133333 22.755555-51.2c11.377778-11.377778 28.444444-22.755556 51.2-22.755555s34.133333 5.688889 51.2 22.755555c11.377778 11.377778 22.755556 28.444444 22.755556 51.2s-11.377778 39.822222-22.755556 51.2z m176.355556-443.733333c-11.377778 22.755556-22.755556 39.822222-39.822223 51.2-17.066667 17.066667-39.822222 39.822222-79.644444 73.955556l-28.444444 28.444444c-5.688889 5.688889-11.377778 17.066667-17.066667 22.755556v17.066666c0 5.688889-5.688889 17.066667-5.688889 34.133334-5.688889 34.133333-22.755556 51.2-56.888889 51.2-17.066667 0-28.444444-5.688889-39.822222-17.066667-11.377778-11.377778-17.066667-28.444444-17.066667-45.511111 0-28.444444 5.688889-51.2 11.377778-68.266667 5.688889-17.066667 17.066667-34.133333 34.133333-51.2 11.377778-17.066667 34.133333-34.133333 56.888889-51.2 22.755556-17.066667 34.133333-28.444444 45.511111-39.822222s17.066667-17.066667 22.755556-28.444445c5.688889-11.377778 11.377778-22.755556 11.377778-34.133333 0-22.755556-11.377778-45.511111-28.444445-62.577778-17.066667-17.066667-45.511111-28.444444-73.955555-28.444444-45.511111-11.377778-73.955556 0-85.333334 17.066667-17.066667 17.066667-34.133333 45.511111-45.511111 79.644444-11.377778 34.133333-28.444444 51.2-62.577778 51.2-17.066667 0-34.133333-5.688889-45.511111-17.066667-11.377778-11.377778-17.066667-28.444444-17.066666-39.822222 0-28.444444 11.377778-62.577778 28.444444-91.022222s45.511111-56.888889 85.333333-79.644445c39.822222-22.755556 79.644444-28.444444 130.844445-28.444444 45.511111 0 85.333333 5.688889 119.466667 22.755556 34.133333 17.066667 62.577778 39.822222 79.644444 68.266666 22.755556 28.444444 34.133333 62.577778 34.133333 96.711111 0 28.444444-5.688889 51.2-17.066666 68.266667z" fill="#FF7E11" p-id="3086"></path></svg>';
      }
    }

    function toggleNode(node) {
      node.collapsed = !node.collapsed;
      refreshTree();
    }

    function selectNode(node, element) {
      document.querySelectorAll(".tree-node-content.selected").forEach((el) => {
        el.classList.remove("selected");
      });

      element.classList.add("selected");
      selectedNode = node;
      updateToolbarState();
    }

    function makeNameEditable(element, node) {
      const input = document.createElement("input");
      input.type = "text";
      input.value = node.name;
      input.style.cssText = `
                color: #000000 !important;
                background: white;
                border: none;
                outline: none;
                width: 100%;
                font-size: 14px;
                font-family: inherit;
                padding: 0;
                margin: 0;
            `;

      const parent = element.parentNode;
      const wrapper = document.createElement("span");
      wrapper.className = "node-name editing";
      wrapper.appendChild(input);

      parent.replaceChild(wrapper, element);
      input.focus();
      input.select();

      function saveEdit() {
        const newName = input.value.trim();
        if (newName && newName !== node.name) {
          node.name = newName;
          refreshTree();
        } else {
          refreshTree();
        }
      }

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveEdit();
        }
      });
    }

    function addNewNode(parentNode, type) {
      if (type === "file" && parentNode.type === "file") {
        showToast("不能在文件下添加子节点", "error");
        return;
      }

      const newNode = {
        id: generateId(),
        name: type === "folder" ? "新建文件夹" : "新建文件",
        type: type,
        level: parentNode.level + 1,
        children: type === "folder" ? [] : undefined,
        fileCount: 0,
        collapsed: type === "folder",
      };

      if (!parentNode.children) {
        parentNode.children = [];
      }

      parentNode.children.push(newNode);
      if (parentNode.type === "folder" || parentNode.type === "root") {
        parentNode.collapsed = false;
      }

      refreshTree();
      showToast(`已添加${type === "folder" ? "文件夹" : "文件"}`, "success");
    }

    function deleteNode(node) {
      const parent = findParent(treeData.root, node);
      if (parent && parent.children) {
        const index = parent.children.indexOf(node);
        if (index > -1) {
          parent.children.splice(index, 1);
          selectedNode = null; // 确保在删除后立即清空选中状态
          refreshTree();
          updateToolbarState(); // 确保工具栏状态立即更新
          showToast("节点已删除", "success");
        }
      }
    }

    function canDrop(draggedNode, targetNode) {
      if (draggedNode === targetNode) return false;
      if (targetNode.type === "file") return false;
      if (isDescendant(draggedNode, targetNode)) return false;
      return true;
    }

    function moveNode(draggedNode, targetNode) {
      const oldParent = findParent(treeData.root, draggedNode);
      if (oldParent && oldParent.children) {
        const index = oldParent.children.indexOf(draggedNode);
        if (index > -1) {
          oldParent.children.splice(index, 1);

          if (!targetNode.children) {
            targetNode.children = [];
          }
          targetNode.children.push(draggedNode);

          updateNodeLevel(draggedNode, targetNode.level + 1);
          refreshTree();
          showToast("节点已移动", "success");
        }
      }
    }

    function updateNodeLevel(node, newLevel) {
      node.level = newLevel;
      if (node.children) {
        node.children.forEach((child) => {
          updateNodeLevel(child, newLevel + 1);
        });
      }
    }

    function isDescendant(parent, child) {
      if (!parent.children) return false;

      for (const node of parent.children) {
        if (node === child) return true;
        if (isDescendant(node, child)) return true;
      }

      return false;
    }

    function findParent(root, targetNode) {
      if (root.children) {
        for (const child of root.children) {
          if (child === targetNode) return root;
          const parent = findParent(child, targetNode);
          if (parent) return parent;
        }
      }
      return null;
    }

    function expandAllNodes(node) {
      node.collapsed = false;
      if (node.children) {
        node.children.forEach((child) => {
          expandAllNodes(child);
        });
      }
    }

    function collapseAllNodes(node) {
      if (node.type === "folder" || node.type === "root") {
        node.collapsed = true;
      }
      if (node.children) {
        node.children.forEach((child) => {
          collapseAllNodes(child);
        });
      }
    }

    /**
     * 展开到指定层级
     */
    function expandToLevel(node, targetLevel, currentLevel = 0) {
      if (node.type === "folder" || node.type === "root") {
        node.collapsed = currentLevel >= targetLevel;

        if (node.children) {
          node.children.forEach((child) => {
            expandToLevel(child, targetLevel, currentLevel + 1);
          });
        }
      }
    }

    /**
     * 文件预览功能
     */
    function previewFile(fileNode) {
      if (!fileNode || fileNode.type !== "file") {
        showToast("请选择有效的文件进行预览", "warning");
        return;
      }

      const fileInfo = fileNode.fileInfo;
      if (!fileInfo) {
        showToast("文件信息不完整，无法预览", "error");
        return;
      }

      // 确认预览
      $NG.confirm("确定打开预览？", {
        onOk: async () => {
          try {
            const openUrl =
              "https://ynnterp-mproject.cnyeig.com/JFileSrv/preview/fileSource";
            const title = fileInfo.asrName || "文件预览";

            // 构建预览参数
            const previewParams = {
              AppTitle: title,
              name: title,
              guid: fileInfo.asrSessionGuid || "",
              fid: fileInfo.asrFid || "",
              language: "zh-CN",
              dbToken: downloadConfig.dbToken || "0001",
              busTypeCode:
                fileInfo.bustypecode || downloadConfig.busType || "design_data",
              asrFill: "sys8", // 默认值
              orgId: downloadConfig.orgId || 1,
              wMDisabled: downloadConfig.wmDisabled || 0,
              billWM: downloadConfig.billWM || "",
              previewType: "scroll",
              pureWeb: 1,
            };

            console.log("文件预览参数:", previewParams);

            // 打开预览窗口
            $NG.open(openUrl, previewParams);

            showToast("正在打开文件预览...", "success");
          } catch (error) {
            console.error("文件预览失败:", error);
            showToast("文件预览打开失败: " + error.message, "error");
          }
        },
        onCancel: () => {
          showToast("已取消预览", "info");
        },
      });
    }

    function updateToolbarState() {
      const deleteBtn = document.getElementById("delete-btn");
      const addFolderBtn = document.getElementById("add-folder-btn");
      const previewBtn = document.getElementById("preview-btn");

      if (selectedNode) {
        // 根节点不能删除，其他节点可以删除
        deleteBtn.disabled = selectedNode.type === "root";

        // 只能在文件夹类型节点下添加新节点
        addFolderBtn.disabled = selectedNode.type === "file";

        // 只有文件节点可以预览
        previewBtn.disabled = selectedNode.type !== "file";

        console.log(
          "选中节点:",
          selectedNode.name,
          "删除按钮禁用:",
          deleteBtn.disabled,
          "预览按钮禁用:",
          previewBtn.disabled
        );
      } else {
        deleteBtn.disabled = true;
        addFolderBtn.disabled = false; // 没有选中节点时可以在根节点添加
        previewBtn.disabled = true;
        console.log("没有选中节点，删除按钮禁用");
      }

      // 更新按钮图标状态
      updateDeleteButtonIcon(deleteBtn);
      updatePreviewButtonIcon(previewBtn);
    }

    // 专门处理删除按钮图标状态
    function updateDeleteButtonIcon(deleteBtn) {
      if (deleteBtn.disabled) {
        // 禁用状态 - 灰色图标
        deleteBtn.innerHTML = `<svg t="1760601704642" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20160" width="20" height="20"><path d="M762.023564 733.556364l78.978327 78.959709 78.996945-78.978328a37.236364 37.236364 0 1 1 52.670837 52.670837l-79.015564 78.978327 79.015564 78.996946a37.236364 37.236364 0 0 1-52.670837 52.670836l-78.996945-79.015564-78.978327 79.015564a37.236364 37.236364 0 0 1-52.652219-52.670836l78.95971-78.996946-78.95971-78.978327a37.236364 37.236364 0 1 1 52.652219-52.670837zM800.581818 0a111.709091 111.709091 0 0 1 111.709091 111.709091v390.981818a37.236364 37.236364 0 1 1-72.927418-10.686836V130.327273a55.854545 55.854545 0 0 0-55.854546-55.854546H166.018327a55.854545 55.854545 0 0 0-55.761454 52.577746L110.163782 130.327273v744.727272a55.854545 55.854545 0 0 0 52.559127 55.761455l3.295418 0.093091h345.199709v0.986764a37.236364 37.236364 0 0 1 0 72.4992V1005.381818H148.945455a111.709091 111.709091 0 0 1-111.709091-111.709091V111.709091a111.709091 111.709091 0 0 1 111.709091-111.709091h651.636363zM577.163636 167.563636a111.709091 111.709091 0 1 1-80.989091 188.639419l-85.4016 49.282327a112.118691 112.118691 0 0 1 14.801455 84.1728l86.984145 50.213236a111.709091 111.709091 0 1 1-25.711709 49.654691l-86.667636-50.045673a111.709091 111.709091 0 1 1-32.395636-173.298036c0.949527-0.8192 2.048-1.545309 3.165091-2.196945l98.061963-56.617891A111.709091 111.709091 0 0 1 577.163636 167.563636z m18.618182 390.981819a55.854545 55.854545 0 1 0 0 111.70909 55.854545 55.854545 0 0 0 0-111.70909z m-279.272727-148.945455a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z m260.654545-186.181818a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z" fill="#1677FF" p-id="20161"></path></svg>`;
      } else {
        // 启用状态 - 彩色图标
        deleteBtn.innerHTML = `<svg t="1760597078657" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14537" width="20" height="20"><path d="M762.023564 733.556364l78.978327 78.959709 78.996945-78.978328a37.236364 37.236364 0 1 1 52.670837 52.670837l-79.015564 78.978327 79.015564 78.996946a37.236364 37.236364 0 0 1-52.670837 52.670836l-78.996945-79.015564-78.978327 79.015564a37.236364 37.236364 0 0 1-52.652219-52.670836l78.95971-78.996946-78.95971-78.978327a37.236364 37.236364 0 1 1 52.652219-52.670837zM800.581818 0a111.709091 111.709091 0 0 1 111.709091 111.709091v390.981818a37.236364 37.236364 0 1 1-72.927418-10.686836V130.327273a55.854545 55.854545 0 0 0-55.854546-55.854546H166.018327a55.854545 55.854545 0 0 0-55.761454 52.577746L110.163782 130.327273v744.727272a55.854545 55.854545 0 0 0 52.559127 55.761455l3.295418 0.093091h345.199709v0.986764a37.236364 37.236364 0 0 1 0 72.4992V1005.381818H148.945455a111.709091 111.709091 0 0 1-111.709091-111.709091V111.709091a111.709091 111.709091 0 0 1 111.709091-111.709091h651.636363zM577.163636 167.563636a111.709091 111.709091 0 1 1-80.989091 188.639419l-85.4016 49.282327a112.118691 112.118691 0 0 1 14.801455 84.1728l86.984145 50.213236a111.709091 111.709091 0 1 1-25.711709 49.654691l-86.667636-50.045673a111.709091 111.709091 0 1 1-32.395636-173.298036c0.949527-0.8192 2.048-1.545309 3.165091-2.196945l98.061963-56.617891A111.709091 111.709091 0 0 1 577.163636 167.563636z m18.618182 390.981819a55.854545 55.854545 0 1 0 0 111.70909 55.854545 55.854545 0 0 0 0-111.70909z m-279.272727-148.945455a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z m260.654545-186.181818a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z" fill="#1677FF" p-id="14538"></path></svg>`;
      }
    }

    // 专门处理预览按钮图标状态
    function updatePreviewButtonIcon(previewBtn) {
      if (previewBtn.disabled) {
        // 禁用状态 - 灰色图标
        previewBtn.innerHTML = `<svg t="1760665298888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3435" width="20" height="20"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#1677FF" p-id="3436"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#1677FF" p-id="3437"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#1677FF" p-id="3438"></path></svg>`;
      } else {
        // 启用状态 - 彩色图标
        previewBtn.innerHTML = `<svg t="1760665298888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3435" width="20" height="20"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#1677FF" p-id="3436"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#1677FF" p-id="3437"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#1677FF" p-id="3438"></path></svg>`;
      }
    }

    function refreshTree() {
      treeContainer.innerHTML = "";
      renderTree(treeData.root, treeContainer);
      updateToolbarState(); // 确保每次刷新树都更新工具栏状态

      // 如果选中的节点已经被删除，确保工具栏状态正确
      if (selectedNode && !nodeExists(treeData.root, selectedNode.id)) {
        selectedNode = null;
        updateToolbarState();
      }
    }

    // 添加辅助函数检查节点是否存在
    function nodeExists(root, nodeId) {
      if (root.id === nodeId) return true;
      if (root.children) {
        for (const child of root.children) {
          if (nodeExists(child, nodeId)) return true;
        }
      }
      return false;
    }

    // 初始工具栏状态
    updateToolbarState();

    // 默认展开到2级目录
    expandToLevel(treeData.root, 2);
    refreshTree();
  }

  /**
   * 获取编辑后的树结构
   */
  function getEditedTreeStructure() {
    return JSON.parse(
      JSON.stringify(currentTreeType ? treeStructure : NuTreeStructure)
    );
  }

  /**
   * 引入JSZip库用于创建ZIP文件
   */
  function loadJSZip() {
    return new Promise((resolve, reject) => {
      if (typeof JSZip !== "undefined") {
        resolve(JSZip);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.onload = () => resolve(JSZip);
      script.onerror = () => reject(new Error("Failed to load JSZip"));
      document.head.appendChild(script);
    });
  }

  /**
   * 获取文件下载URL
   */
  async function getFileDownloadUrl(asrFid, dataObject) {
    try {
      const response = await fetch("/JFileSrv/api/getDownloadUrlByAsrFids", {
        method: "POST",
        headers: {
          dbToken: dataObject.dbToken || "0001",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asrFids: [asrFid],
          loginId: dataObject.loginId || "3100000000000009",
          orgId: dataObject.orgId || "0",
          busTypeCode: dataObject.busTypeCode || "EFORM9000000080",
          wmDisabled: dataObject.wmDisabled || "1",
          billWM: dataObject.billWM || "YEIG",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data && result.data[asrFid] ? result.data[asrFid] : null;
    } catch (error) {
      console.error("Failed to get download URL for asrFid:", asrFid, error);
      return null;
    }
  }

  /**
   * 下载文件内容
   */
  async function downloadFileContent(downloadUrl) {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error("Failed to download file content:", downloadUrl, error);
      return null;
    }
  }

  /**
   * 根据编辑后的树结构创建ZIP文件
   */
  async function downloadWithEditedStructure(editedStructure, downloadConfig) {
    if (typeof JSZip === "undefined") {
      throw new Error("JSZip library not loaded");
    }

    console.log("开始使用编辑后的结构下载附件:", editedStructure);
    console.log("下载配置:", downloadConfig);

    const zip = new JSZip();
    let totalFiles = 0;
    let downloadedFiles = 0;

    // 创建文件映射，便于查找文件数据
    const fileMap = createFileMap(downloadConfig);

    // 递归构建ZIP结构
    async function buildZipStructure(node, parentFolder) {
      if (node.type === "folder" || node.type === "root") {
        const currentFolder =
          node.type === "root"
            ? parentFolder.folder(node.name)
            : parentFolder.folder(node.name);

        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            await buildZipStructure(child, currentFolder);
          }
        }
      } else if (node.type === "file") {
        totalFiles++;
        showToast(
          `正在下载文件 (${downloadedFiles + 1}/${totalFiles}): ${node.name}`,
          "info",
          2000
        );

        // 查找对应的文件数据
        const fileData = findFileData(node, fileMap);

        if (fileData && fileData.asrFid) {
          try {
            const downloadUrl = await getFileDownloadUrl(
              fileData.asrFid,
              downloadConfig
            );
            if (downloadUrl) {
              const fileContent = await downloadFileContent(downloadUrl);
              if (fileContent) {
                parentFolder.file(node.name, fileContent);
                downloadedFiles++;
                console.log(`文件下载完成: ${node.name}`);
              } else {
                console.warn(
                  `Failed to download content for file: ${node.name}`
                );
                parentFolder.file(node.name, "");
              }
            } else {
              console.warn(`Failed to get download URL for file: ${node.name}`);
              parentFolder.file(node.name, "");
            }
          } catch (error) {
            console.error(`下载文件失败 ${node.name}:`, error);
            parentFolder.file(node.name, "");
          }
        } else {
          console.warn(`未找到文件数据: ${node.name}`);
          parentFolder.file(node.name, "");
        }
      }
    }

    // 开始构建ZIP
    await buildZipStructure(editedStructure.root, zip);

    // 生成并下载ZIP文件
    return zip.generateAsync({ type: "blob" }).then(function (content) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = editedStructure.root.name + ".zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      showToast(`加载完成！总共 ${downloadedFiles} 个文件`, "success");
      return true;
    });
  }

  /**
   * 创建文件映射表
   */
  function createFileMap(downloadConfig) {
    const fileMap = {};

    // 处理主表单附件
    if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
      const mainAttachments =
        downloadConfig.mainAttachment[downloadConfig.mFormName];
      if (
        mainAttachments &&
        mainAttachments.data &&
        mainAttachments.data.attachmentRecordList
      ) {
        mainAttachments.data.attachmentRecordList.forEach((attachment) => {
          const fileName = decodeFileName(attachment.asrName);
          fileMap[fileName] = {
            asrFid: attachment.asrFid,
            asrName: attachment.asrName,
            typeName: attachment.typeName,
            asrRemark: attachment.asrRemark || "", // 添加备注信息
          };
        });
      }
    }

    // 处理分组表单附件
    if (downloadConfig.groupAttachments) {
      for (const formName in downloadConfig.groupAttachments) {
        const groupAttachments = downloadConfig.groupAttachments[formName];
        if (
          groupAttachments.data &&
          groupAttachments.data.attachmentRecordList
        ) {
          groupAttachments.data.attachmentRecordList.forEach((attachment) => {
            const fileName = decodeFileName(attachment.asrName);
            fileMap[fileName] = {
              asrFid: attachment.asrFid,
              asrName: attachment.asrName,
              typeName: attachment.typeName,
              asrRemark: attachment.asrRemark || "", // 添加备注信息
            };
          });
        }
      }
    }

    // 处理明细表单附件
    if (downloadConfig.detailAttachments) {
      for (const formName in downloadConfig.detailAttachments) {
        const detailAttachments = downloadConfig.detailAttachments[formName];
        if (Array.isArray(detailAttachments)) {
          detailAttachments.forEach((detailItem) => {
            if (
              detailItem.code === 200 &&
              detailItem.data &&
              detailItem.data.attachmentRecordList
            ) {
              detailItem.data.attachmentRecordList.forEach((attachment) => {
                const fileName = decodeFileName(attachment.asrName);
                fileMap[fileName] = {
                  asrFid: attachment.asrFid,
                  asrName: attachment.asrName,
                  typeName: attachment.typeName,
                  asrRemark: attachment.asrRemark || "", // 添加备注信息
                };
              });
            }
          });
        }
      }
    }

    console.log("文件映射表创建完成:", fileMap);
    return fileMap;
  }

  /**
   * 查找文件数据
   */
  function findFileData(fileNode, fileMap) {
    // 直接通过文件名查找
    if (fileMap[fileNode.name]) {
      return fileMap[fileNode.name];
    }

    // 如果文件节点有fileInfo，直接使用
    if (fileNode.fileInfo) {
      return fileNode.fileInfo;
    }

    // 尝试通过解码后的文件名查找
    const decodedName = decodeFileName(fileNode.name);
    if (fileMap[decodedName]) {
      return fileMap[decodedName];
    }

    return null;
  }

  /**
   * 显示文件树编辑模态框
   */
  function showTreeEditModal() {
    const modal = createTreeEditModal();
    initModalInteractions(modal);
  }

  /**
   * 解码URL编码的文件名
   */
  function decodeFileName(fileName) {
    try {
      return decodeURIComponent(fileName);
    } catch (e) {
      console.warn("文件名解码失败，使用原文件名:", fileName);
      return fileName;
    }
  }

  /**
   * 创建可复用的提示框组件
   */
  function showToast(message, type = "info", duration = 3000) {
    // 移除已存在的提示框
    const existingToast = document.getElementById("custom-toast");
    if (existingToast) {
      existingToast.remove();
    }

    // 定义不同类型对应的样式
    const typeStyles = {
      info: {
        backgroundColor: "rgba(24, 144, 255, 0.9)",
        icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M507.297959 862.040816c-52.244898 0-102.922449-9.404082-151.510204-27.689796l-116.506122 25.6c-24.032653 5.22449-46.497959 0-60.604082-14.628571-14.628571-14.628571-19.853061-36.571429-14.628571-60.604082l17.240816-77.844898c-43.363265-57.469388-66.35102-122.77551-66.35102-190.693877C114.938776 320.783673 291.004082 161.959184 507.297959 161.959184c107.62449 0 208.457143 36.04898 283.689796 101.877551C867.265306 330.710204 909.061224 420.04898 909.061224 516.179592c0 190.693878-180.244898 345.861224-401.763265 345.861224z" fill="#7BD4EF"></path><path d="M512 581.485714c-38.138776 0-69.485714-31.346939-69.485714-69.485714s31.346939-69.485714 69.485714-69.485714 69.485714 31.346939 69.485714 69.485714-31.346939 69.485714-69.485714 69.485714zM710.530612 581.485714c-38.138776 0-69.485714-31.346939-69.485714-69.485714s31.346939-69.485714 69.485714-69.485714 69.485714 31.346939 69.485715 69.485714-31.346939 69.485714-69.485715 69.485714zM313.469388 581.485714c-38.138776 0-69.485714-31.346939-69.485715-69.485714s31.346939-69.485714 69.485715-69.485714 69.485714 31.346939 69.485714 69.485714-31.346939 69.485714-69.485714 69.485714z" fill="#278DCA"></path></svg>',
      },
      success: {
        backgroundColor: "rgba(82, 196, 26, 0.9)",
        icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m277.333333 279.466667l-341.333333 341.333333c-4.266667 6.4-12.8 8.533333-21.333333 8.533334s-17.066667-2.133333-23.466667-8.533334l-170.666667-170.666666c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l149.333334 147.2L746.666667 320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32-2.133334 44.8z" fill="#3BBC86"></path></svg>',
      },
      error: {
        backgroundColor: "rgba(245, 34, 45, 0.9)",
        icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m204.8 586.666667c12.8 10.666667 10.666667 32 0 44.8s-32 12.8-44.8 0L512 556.8l-160 160c-10.666667 12.8-32 12.8-44.8 0-12.8-10.666667-12.8-32 0-44.8l160-160-160-160c-12.8-10.666667-12.8-32 0-44.8 10.666667-12.8 32-12.8 44.8 0l160 160 160-162.133333c12.8-10.666667 34.133333-10.666667 44.8 2.133333 12.8 10.666667 12.8 32 0 44.8L556.8 512l160 160z" fill="#F25858"></path></svg>',
      },
      warning: {
        backgroundColor: "rgba(250, 173, 20, 0.9)",
        icon: '<svg viewBox="0 0 1217 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M1134.696569 1024H83.026578a83.026578 83.026578 0 0 1-83.026578-83.026578 79.705515 79.705515 0 0 1 3.597818-22.970687L0 913.297896 525.834995 55.356587h4.981595a82.694472 82.694472 0 0 1 156.089967 0H691.888152l490.963833 818.088551A83.026578 83.026578 0 0 1 1134.696569 1024z m-525.834995-110.702104a55.351052 55.351052 0 1 0-55.351052-55.351052 55.517105 55.517105 0 0 0 55.351052 55.351052z m0-636.5371a83.026578 83.026578 0 0 0-83.026579 83.026578l27.675527 304.430787a55.351052 55.351052 0 0 0 110.702104 0l27.675526-304.430787a83.026578 83.026578 0 0 0-83.026578-83.026578z" fill="#F4AA55"></path></svg>',
      },
      tip: {
        backgroundColor: "rgba(114, 46, 209, 0.9)",
        icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 0C231.131 0 0 231.131 0 512s231.131 512 512 512 512-231.131 512-512S792.869 0 512 0z m-51.2 219.429c0-8.778 5.851-14.629 14.629-14.629h73.142c8.778 0 14.629 5.851 14.629 14.629v73.142c0 8.778-5.851 14.629-14.629 14.629H475.43c-8.778 0-14.629-5.851-14.629-14.629V219.43zM614.4 804.57c0 8.778-7.314 14.629-14.629 14.629H475.43c-8.778 0-14.629-5.851-14.629-14.629V526.63c0-8.778-5.851-14.629-14.629-14.629H424.23c-7.315 0-14.629-5.851-14.629-14.629V424.23c0-8.778 7.314-14.629 14.629-14.629H548.57c8.778 0 14.629 5.851 14.629 14.629V702.17c0 8.778 5.851 14.629 14.629 14.629h21.942c7.315 0 14.629 5.851 14.629 14.629v73.142z" fill="#03A4FF"></path></svg>',
      },
    };

    // 获取对应类型的样式，如果类型不存在则使用默认的info样式
    const style = typeStyles[type] || typeStyles.info;

    // 创建提示框元素
    const toast = document.createElement("div");
    toast.id = "custom-toast";
    toast.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        background-color: ${style.backgroundColor};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 1002;
        opacity: 1;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 240px;
        max-width: 400px;
        word-break: break-word;
        line-height: 1.5;
        border-left: 4px solid rgba(255, 255, 255, 0.3);
    `;

    // 创建图标容器
    const iconContainer = document.createElement("div");
    iconContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    `;
    iconContainer.innerHTML = style.icon;

    // 创建消息容器
    const messageContainer = document.createElement("div");
    messageContainer.style.cssText = `
        flex: 1;
        display: flex;
        align-items: center;
        min-height: 20px;
        line-height: 1.4;
    `;
    messageContainer.textContent = message;

    // 组装元素
    toast.appendChild(iconContainer);
    toast.appendChild(messageContainer);

    // 添加到页面
    document.body.appendChild(toast);

    // 强制重绘，确保动画能正常触发
    toast.offsetHeight;

    // 设置定时器，在指定时间后开始消失动画
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-40px)";

      // 动画结束后移除元素
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, duration);
  }

  // 统一的附件信息获取函数
  async function fetchAttachmentInfo(url, description) {
    try {
      const response = await $NG.request.get({
        url: url,
        headers: { dbToken: "0001" },
      });

      if (response && response.code === 200) {
        console.log(`${description}获取成功:`, response);
        return response;
      } else {
        console.warn(`${description}响应码非200:`, response);
        return null;
      }
    } catch (error) {
      console.error(`获取${description}失败:`, error);
      return null;
    }
  }

  // 获取明细附件信息
  async function fetchDetailAttachments(dGuids, description = "明细附件") {
    if (!dGuids || dGuids.length === 0) {
      console.log(`没有dGuids可获取${description}`);
      return [];
    }

    const detailPromises = dGuids.map(async (dGuid) => {
      const url = `/JFileSrv/reactAttach/tableAttachInit?asrSessionGuid=${dGuid}&busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;

      try {
        const response = await fetchAttachmentInfo(
          url,
          `${description}-dGuid:${dGuid}`
        );
        return {
          dGuid: dGuid,
          response: response,
          success: !!response,
        };
      } catch (error) {
        return {
          dGuid: dGuid,
          response: null,
          success: false,
          error: error,
        };
      }
    });

    const detailResults = await Promise.all(detailPromises);
    const validDetails = detailResults
      .filter((item) => item.success && item.response)
      .map((item) => item.response);

    console.log(
      `${description}获取完成: 总共${dGuids.length}个, 有效${validDetails.length}个`
    );
    return validDetails;
  }

  // 检查是否有有效的附件数据
  function hasValidAttachments(downloadConfig) {
    let hasValid = false;

    // 检查主附件
    if (downloadConfig.mainAttachment) {
      for (const formName in downloadConfig.mainAttachment) {
        const mainAttach = downloadConfig.mainAttachment[formName];
        if (
          mainAttach &&
          mainAttach.data &&
          mainAttach.data.attachmentRecordList &&
          mainAttach.data.attachmentRecordList.length > 0
        ) {
          console.log(
            `主附件 ${formName} 有 ${mainAttach.data.attachmentRecordList.length} 个文件`
          );
          hasValid = true;
        }
      }
    }

    // 检查分组附件
    if (downloadConfig.groupAttachments) {
      for (const formName in downloadConfig.groupAttachments) {
        const groupAttach = downloadConfig.groupAttachments[formName];
        if (
          groupAttach &&
          groupAttach.data &&
          groupAttach.data.attachmentRecordList &&
          groupAttach.data.attachmentRecordList.length > 0
        ) {
          console.log(
            `分组附件 ${formName} 有 ${groupAttach.data.attachmentRecordList.length} 个文件`
          );
          hasValid = true;
        }
      }
    }

    // 检查明细附件
    if (downloadConfig.detailAttachments) {
      for (const formName in downloadConfig.detailAttachments) {
        const detailAttachArray = downloadConfig.detailAttachments[formName];
        if (Array.isArray(detailAttachArray)) {
          for (const detailAttach of detailAttachArray) {
            if (
              detailAttach &&
              detailAttach.data &&
              detailAttach.data.attachmentRecordList &&
              detailAttach.data.attachmentRecordList.length > 0
            ) {
              console.log(
                `明细附件 ${formName} 有 ${detailAttach.data.attachmentRecordList.length} 个文件`
              );
              hasValid = true;
            }
          }
        }
      }
    }

    console.log("附件有效性检查结果:", hasValid);
    return hasValid;
  }

  // 内部变量
  let fromObj = {};
  let attachmentData = {
    mainAttachment: null,
    groupAttachments: {},
    detailAttachments: {},
  };

  // 主执行函数
  async function mainExecution() {
    try {
      // 1. 首先获取基础表单附件信息
      const params = {
        phidValue: phidValue,
        busType: cfg.busType,
        tableName: cfg.tableName,
        mainTableNames: [cfg.tableName],
      };

      fromObj = await getFormAttachmentInfo(params);
      console.log("基础附件信息获取完成:", fromObj);

      // 2. 并行获取所有可能的附件信息，即使某些部分失败也继续
      const attachmentPromises = [];

      // 获取主附件信息
      if (fromObj.asrfill && fromObj.asrfillname && fromObj.asrtable) {
        attachmentPromises.push(
          (async () => {
            const mainUrl = `/JFileSrv/reactAttach/tableAttachInit?busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;
            attachmentData.mainAttachment = await fetchAttachmentInfo(
              mainUrl,
              "单据附件"
            );
          })()
        );
      }

      // 获取分组附件信息 - 使用配置的 sFormGroupKeys
      if (fromObj.mGuids && fromObj.mGuids.length > 0) {
        // 为每个分组附件分别获取信息
        const groupPromises = fromObj.mGuids.map(async (mGuidObj) => {
          const formName = mGuidObj.formName;
          const groupUrl = `/JFileSrv/reactAttach/tableAttachInit?asrSessionGuid=${mGuidObj.guid}&busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;
          const groupResponse = await fetchAttachmentInfo(
            groupUrl,
            `分组附件-${formName}`
          );
          if (groupResponse) {
            attachmentData.groupAttachments[formName] = groupResponse;
            console.log(
              `分组附件 ${formName} (字段: ${mGuidObj.fieldName}) 获取成功`
            );
          }
        });

        attachmentPromises.push(...groupPromises);
      }

      // 获取明细附件信息 - 使用配置的 dFormFormKeys
      if (fromObj.detailGuids && Object.keys(fromObj.detailGuids).length > 0) {
        // 为每个明细表分别获取附件信息
        for (const [formName, dGuids] of Object.entries(fromObj.detailGuids)) {
          if (dGuids && dGuids.length > 0) {
            attachmentPromises.push(
              (async () => {
                const detailAttachments = await fetchDetailAttachments(
                  dGuids,
                  `明细附件-${formName}`
                );
                if (detailAttachments.length > 0) {
                  attachmentData.detailAttachments[formName] =
                    detailAttachments;
                }
              })()
            );
          }
        }
      }

      // 等待所有附件获取完成
      if (attachmentPromises.length > 0) {
        await Promise.allSettled(attachmentPromises);
      }

      // 3. 构建完整的下载配置
      downloadConfig = {
        mainAttachment: { [cfg.mFormName]: attachmentData.mainAttachment },
        groupAttachments: attachmentData.groupAttachments,
        detailAttachments: attachmentData.detailAttachments,
        topLevelFolderName: `${cfg.FormName}`,
        downloadUrl: "JFileSrv/api/getDownloadUrlByAsrFids",
        dbToken: "0001",
        wmDisabled: "1",
        billWM: "YEIG",
        orgId: "0",
        mFormName: cfg.mFormName,
        sFormName: cfg.sFormName,
        dFormName: cfg.dFormName,
      };

      console.log("完整的下载配置:", downloadConfig);

      // 4. 构建两种树形结构
      treeStructure = buildTreeStructureWithRowFolder(downloadConfig);
      NuTreeStructure = buildTreeStructureWithoutRowFolder(downloadConfig);

      console.log("文件树编辑功能初始化完成");

      // 5. 加载JSZip
      await loadJSZip();
      console.log("JSZip加载完成");

      return {
        success: true,
        message: "附件下载管理器初始化完成",
        hasAttachments: hasValidAttachments(downloadConfig),
      };
    } catch (error) {
      console.error("主执行流程出错:", error);
      showToast("处理附件时发生错误: " + error.message, "error");
      return {
        success: false,
        message: "初始化失败: " + error.message,
        error: error,
      };
    }
  }

  // 公共方法 - 显示编辑模态框
  function showAttachmentModal() {
    if (!hasValidAttachments(downloadConfig)) {
      console.warn("没有找到有效的附件数据");
      $NG.alert("当前没有可下载的附件");
      return false;
    }

    showTreeEditModal();
    return true;
  }

  // 立即执行初始化
  const initPromise = mainExecution();

  // 返回公共接口
  return {
    // 初始化状态
    init: initPromise,

    // 显示模态框
    showModal: showAttachmentModal,

    // 检查附件状态
    hasAttachments: () => hasValidAttachments(downloadConfig),

    // 获取配置信息
    getConfig: () => ({ ...downloadConfig }),

    // 重新初始化
    reinitialize: mainExecution,
  };
}

};
__modules["./Loading/V1/FishingAnimation.js"] = function(module, exports, require){
// 加载文字位置的钓鱼动画函数
function createFishingAnimation(selector, loadingText = "Loading") {
  // 生成唯一ID
  const animationId = "fishing-animation-" + Date.now();

  // 检查是否已经添加了样式
  if (!document.getElementById("fishing-animation-styles")) {
    const style = document.createElement("style");
    style.id = "fishing-animation-styles";
    style.textContent = `
        /* 引入字体库 */
        @import url('https://fonts.googleapis.com/css?family=Montserrat:300,400,700');
        
        .fishing-animation-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 998;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        
        .fishing-animation-content {
            position: relative;
            width: 400px;
            height: 400px;
            transform: scale(0.8);
            margin-bottom: 5px; /* 为文字留出空间 */
        }
        
        .fishing-animation-bowl {
            width: 250px;
            height: 250px;
            border: 5px solid #fff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(90, 201, 226, 0.3);
            overflow: hidden;
        }
        
        .fishing-animation-bowl:before {
            content: "";
            position: absolute;
            bottom: -25px;
            left: 50px;
            width: 150px;
            height: 50px;
            border-radius: 50%;
            background: rgba(0,0,0,0.15);
        }
        
        .fishing-animation-bowl:after {
            content: "";
            position: absolute;
            top: 10px;
            left: calc(25% - 3px);
            width: 50%;
            height: 40px;
            border: 3px solid #fff;
            border-radius: 50%;
        }
        
        .fishing-animation-water {
            position: absolute;
            bottom: 5%;
            left: 0;
            width: 100%;
            height: 50%;
            overflow: hidden;
            animation: fishing-top-inner 5s ease infinite;
        }
        
        @keyframes fishing-top-inner {
            from {
                transform: rotate(0deg);
                margin-left: 0px;
            }
            25% {
                transform: rotate(3deg);
                margin-left: -3px;
            }
            50% {
                transform: rotate(-6deg);
                margin-left: 6px;
            }
            75% {
                transform: rotate(5deg);
                margin-left: -5px;
            }
            to {
                transform: rotate(0deg);
                margin-left: 0px;
            }
        }
        
        .fishing-animation-water-inner {
            width: 225px;
            height: 225px;
            border-radius: 50%;
            background: #4e99ce;
            position: absolute;
            bottom: 0;
            left: 12.5px;
        }
        
        .fishing-animation-top-water {
            position: absolute;
            width: 225px;
            height: 60px;
            border-radius: 50%;
            background: #82bde6;
            bottom: 105px;
            left: 12.5px;
            animation: fishing-top 5s ease infinite;
        }
        
        @keyframes fishing-top {
            from {
                transform: rotate(0deg);
            }
            25% {
                transform: rotate(3deg);
            }
            50% {
                transform: rotate(-6deg);
            }
            75% {
                transform: rotate(5deg);
            }
            to {
                transform: rotate(0deg);
            }
        }
        
        .fishing-animation-center-box {
            height: 300px;
            width: 300px;
            position: absolute;
            top: calc(50% - 190px);
            left: calc(50% - 147px); /* 修改这里：从 -150px 改为 -147px，向右移动3px */
            animation: fishing-float 5s ease infinite;
            transform: scale(0.4);
        }
        
        @keyframes fishing-float {
            from {
                transform: translate(0, 0px) scale(0.4);
            }
            25% {
                transform: translate(0, 4px) scale(0.4);
            }
            50% {
                transform: translate(0, -7px) scale(0.4);
            }
            75% {
                transform: translate(0, 7px) scale(0.4);
            }
            to {
                transform: translate(0, -0px) scale(0.4);
            }
        }
        
        .fishing-animation-fisherman {
            width: 300px;
            height: 200px;
            position: relative;
        }
        
        .fishing-animation-fisherman .body {
            width: 60px;
            height: 120px;
            background: #d2bd24;
            position: absolute;
            bottom: 20px;
            right: 30px;
            -webkit-clip-path: ellipse(40% 50% at 0% 50%);
            clip-path: ellipse(40% 50% at 0% 50%);
            transform: rotate(-20deg);
        }
        
        .fishing-animation-fisherman .body:before {
            content: "";
            width: 60px;
            height: 160px;
            background: #d2bd24;
            position: absolute;
            bottom: -8px;
            right: 12px;
            -webkit-clip-path: ellipse(90% 50% at 0% 50%);
            clip-path: ellipse(90% 50% at 0% 50%);
            transform: rotate(10deg);
        }
        
        .fishing-animation-fisherman .right-arm {
            width: 15px;
            height: 90px;
            background: #d2bd24;
            border-radius: 15px;
            position: absolute;
            bottom: 40px;
            right: 120px;
            transform: rotate(40deg);
        }
        
        .fishing-animation-fisherman .right-arm:before {
            content: "";
            background: #ffd1b5;
            width: 20px;
            height: 20px;
            position: absolute;
            top: 65px;
            right: 40px;
            border-radius: 15px;
        }
        
        .fishing-animation-fisherman .right-arm:after {
            content: "";
            width: 15px;
            height: 40px;
            background: #d2bd24;
            border-radius: 15px;
            position: absolute;
            bottom: -12px;
            right: 15px;
            transform: rotate(-80deg);
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
        }
        
        .fishing-animation-fisherman .right-leg {
            width: 15px;
            height: 90px;
            background: #bf3526;
            border-radius: 15px;
            position: absolute;
            bottom: -15px;
            right: 120px;
            transform: rotate(-60deg);
        }
        
        .fishing-animation-fisherman .right-leg:before {
            content: "";
            width: 15px;
            height: 80px;
            background: #bf3526;
            border-radius: 15px;
            position: absolute;
            bottom: 35px;
            left: -30px;
            transform: rotate(80deg);
        }
        
        .fishing-animation-fisherman .right-leg:after {
            content: "";
            position: absolute;
            bottom: 30px;
            left: -60px;
            width: 25px;
            height: 80px;
            background: #338ca0;
            transform: rotate(80deg);
        }
        
        .fishing-animation-rod {
            position: absolute;
            width: 280px;
            height: 4px;
            bottom: 100px;
            left: -105px;
            background: #331604;
            transform: rotate(10deg);
        }
        
        .fishing-animation-rod .handle {
            width: 15px;
            height: 15px;
            border-radius: 15px;
            left: 230px;
            top: 2px;
            background: #efdddb;
        }
        
        .fishing-animation-rod .handle:before {
            content: "";
            position: absolute;
            width: 10px;
            height: 3px;
            left: 8px;
            top: 5px;
            background: #1a1a1a;
        }
        
        .fishing-animation-rod .rope {
            width: 2px;
            height: 190px;
            top: -14px;
            left: 17px;
            transform: rotate(-10deg);
            background: #fff;
        }
        
        .fishing-animation-fisherman .butt {
            position: absolute;
            width: 40px;
            height: 15px;
            border-radius: 15px;
            bottom: 5px;
            right: 70px;
            background: #bf3526;
        }
        
        .fishing-animation-fisherman .left-arm {
            position: absolute;
            width: 15px;
            height: 70px;
            bottom: 45px;
            right: 100px;
            border-radius: 15px;
            transform: rotate(30deg);
            background: #e8d93d;
        }
        
        .fishing-animation-fisherman .left-arm:before {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            top: 40px;
            right: 40px;
            border-radius: 15px;
            background: #ffd1b5;
        }
        
        .fishing-animation-fisherman .left-arm:after {
            content: "";
            position: absolute;
            width: 15px;
            height: 45px;
            bottom: -12px;
            right: 15px;
            border-radius: 15px;
            transform: rotate(-70deg);
            background: #e8d93d;
        }
        
        .fishing-animation-fisherman .left-leg {
            position: absolute;
            width: 15px;
            height: 80px;
            bottom: -10px;
            right: 90px;
            border-radius: 15px;
            transform: rotate(-50deg);
            background: #de4125;
        }
        
        .fishing-animation-fisherman .left-leg:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 80px;
            bottom: 15px;
            left: -28px;
            border-radius: 15px;
            transform: rotate(60deg);
            background: #de4125;
        }
        
        .fishing-animation-fisherman .left-leg:after {
            content: "";
            position: absolute;
            width: 25px;
            height: 80px;
            bottom: 2px;
            left: -55px;
            transform: rotate(60deg);
            background: #338ca0;
        }
        
        .fishing-animation-head {
            position: absolute;
            width: 45px;
            height: 60px;
            bottom: 100px;
            right: 85px;
            border-radius: 50%;
            transform: rotate(10deg);
        }
        
        .fishing-animation-head .face {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            background: #d76540;
        }
        
        .fishing-animation-head .face:before {
            content: "";
            position: absolute;
            width: 45px;
            height: 65px;
            top: -15px;
            left: -8px;
            border-radius: 50%;
            background: #ffd1b5;
            transform: rotate(-10deg);
        }
        
        .fishing-animation-head .eyebrows {
            position: absolute;
            width: 12px;
            height: 5px;
            top: 12px;
            left: -2px;
            transform: rotate(-10deg);
            background: #e67e5b;
        }
        
        .fishing-animation-head .eyebrows:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 5px;
            top: 0px;
            left: 17px;
            background: #e67e5b;
        }
        
        .fishing-animation-head .eyes {
            position: absolute;
            width: 4px;
            height: 6px;
            top: 20px;
            left: 5px;
            border-radius: 50%;
            transform: rotate(-10deg);
            background: #1a1a1a;
        }
        
        .fishing-animation-head .eyes:before {
            content: "";
            position: absolute;
            width: 4px;
            height: 6px;
            top: 0px;
            left: 15px;
            border-radius: 50%;
            background: #1a1a1a;
        }
        
        .fishing-animation-head .nose {
            position: absolute;
            width: 0;
            height: 0;
            border-top: 15px solid transparent;
            border-bottom: 6px solid transparent;
            border-right: 12px solid #fab58e;
            top: 20px;
            left: 5px;
            transform: rotate(-10deg);
        }
        
        .fishing-animation-head .beard {
            position: absolute;
            width: 30px;
            height: 20px;
            top: 30px;
            left: 1px;
            transform: rotate(-10deg);
            clip-path: ellipse(50% 50% at 50% 100%);
            background: #e67e5b;
        }
        
        .fishing-animation-head .hat {
            position: absolute;
            width: 60px;
            height: 6px;
            top: 6px;
            left: -10px;
            background: #3d402b;
        }
        
        .fishing-animation-head .hat:before {
            content: "";
            position: absolute;
            width: 45px;
            height: 30px;
            left: 8px;
            bottom: 6px;
            clip-path: ellipse(50% 50% at 50% 90%);
            background: #7b8445;
        }
        
        .fishing-animation-boat {
            width: 300px;
            height: 75px;
            margin-top: -10px;
        }
        
        .fishing-animation-boat .motor {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            top: -40px;
            right: -280px;
            background: #ef4723;
        }
        
        .fishing-animation-boat .motor:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 75px;
            clip-path: polygon(0 0, 100% 0, 60% 100%, 0% 100%);
            top: 40px;
            right: 15px;
            z-index: -1;
            background: #bf3526;
        }
        
        .fishing-animation-boat .motor:after {
            content: "";
            position: absolute;
            width: 60px;
            height: 15px;
            left: 0;
            top: 0;
            border-top-left-radius: 14px;
            border-top-right-radius: 14px;
            background: #fff;
        }
        
        .fishing-animation-boat .parts,
        .fishing-animation-boat .parts:before,
        .fishing-animation-boat .parts:after {
            position: absolute;
            width: 20px;
            height: 4px;
            right: 8px;
            top: 22px;
            border-radius: 15px;
            background: #bf3526;
        }
        
        .fishing-animation-boat .parts:before,
        .fishing-animation-boat .parts:after {
            content: "";
            right: 0px;
        }
        
        .fishing-animation-boat .parts:before {
            top: 8px;
        }
        
        .fishing-animation-boat .parts:after {
            top: 15px;
        }
        
        .fishing-animation-boat .button {
            position: absolute;
            width: 15px;
            height: 8px;
            left: -8px;
            top: 20px;
            border-radius: 15px;
            background: #bf3526;
        }
        
        .fishing-animation-boat .top {
            position: absolute;
            width: 290px;
            height: 4px;
            top: 0;
            right: 0;
            border-bottom: solid 4px #cdab33;
            background: #e8da43;
        }
        
        .fishing-animation-boat .boat-body {
            position: absolute;
            width: 280px;
            height: 70px;
            bottom: 0;
            right: 0;
            border-bottom-left-radius: 70px;
            border-bottom-right-radius: 15px;
            clip-path: polygon(0 0, 100% 0, 99% 100%, 0% 100%);
            background: #cdab33;
        }
        
        .fishing-animation-boat .boat-body:before {
            content: "";
            position: absolute;
            width: 280px;
            height: 55px;
            bottom: 15px;
            right: 0px;
            border-bottom-left-radius: 45px;
            background: #d2bd39;
        }
        
        .fishing-animation-boat .boat-body:after {
            content: "";
            position: absolute;
            width: 280px;
            height: 30px;
            bottom: 40px;
            right: 0px;
            border-bottom-left-radius: 45px;
            background: #e8da43;
        }
        
        .fishing-animation-waves {
            height: 100%;
            box-sizing: border-box;
            border: 5px solid #fff;
            border-radius: 50%;
            transform: translate(22px, -22px);
            z-index: -10;
            animation: fishing-waves 5s ease infinite;
        }
        
        @keyframes fishing-waves {
            from {
                margin-left: 0px;
                margin-right: 0px;
                border-color: #fff;
            }
            to {
                margin-left: -75px;
                margin-right: -75px;
                border-color: transparent;
            }
        }
        
        .fishing-animation-fish {
            position: absolute;
            width: 12px;
            height: 12px;
            margin-left: 6px;
            animation: fishing-jump 3s infinite;
            z-index: 10;
        }
        
        @keyframes fishing-jump {
            0% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 1;
            }
            16.7% {
                left: 52px;
                top: 45px;
                transform: rotate(-20deg);
                opacity: 1;
            }
            33.4% {
                left: 45px;
                top: 90px;
                transform: rotate(-90deg);
                opacity: 0;
            }
            50% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 0;
            }
            100% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 0;
            }
        }
        
        .fishing-animation-text {
            position: absolute;
            width: 100%;
            text-align: center;
            font-size: 32px;
            color: rgba(0, 0, 0, 0.15);
            font-family: 'Montserrat', sans-serif;
            bottom: -5px; /* 将文字放在碗的下方 */
            z-index: 1;
        }
    `;
    document.head.appendChild(style);
  }

  // 获取目标元素
  const targetElement = document.querySelector(selector);
  if (!targetElement) {
    console.error(`元素 ${selector} 未找到`);
    return null;
  }

  // 创建动画容器
  const container = document.createElement("div");
  container.className = "fishing-animation-container";
  container.id = animationId;

  // 创建内容容器
  const content = document.createElement("div");
  content.className = "fishing-animation-content";

  // 创建钓鱼动画HTML结构
  content.innerHTML = `
    <div class="fishing-animation-bowl">
        <div class="fishing-animation-water">
            <div class="fishing-animation-water-inner"></div>
        </div>
        <div class="fishing-animation-top-water"></div>
        <div class="fishing-animation-center-box">
            <div class="fishing-animation-fisherman">
                <div class="body"></div>
                <div class="right-arm"></div>
                <div class="right-leg"></div>
                <div class="fishing-animation-rod">
                    <div class="handle"></div>
                    <div class="rope"></div>
                </div>
                <div class="butt"></div>
                <div class="left-arm"></div>
                <div class="left-leg"></div>
                <div class="fishing-animation-head">
                    <div class="face"></div>
                    <div class="eyebrows"></div>
                    <div class="eyes"></div>
                    <div class="nose"></div>
                    <div class="beard"></div>
                    <div class="hat"></div>
                </div>
            </div>
            <div class="fishing-animation-boat">
                <div class="motor">
                    <div class="parts"></div>
                    <div class="button"></div>
                </div>
                <div class="top"></div>
                <div class="boat-body"></div>
                <div class="fishing-animation-waves"></div>
            </div>
        </div>
        <div class="fishing-animation-fish">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px" y="0px" viewBox="0 0 483.7 361.9" style="enable-background:new 0 0 483.7 361.9;" xml:space="preserve">
                <style type="text/css">
                    .fishing-st0 { fill: #E0AC26; }
                    .fishing-st1 { fill: #E0AC26; stroke: #E0AC26; stroke-width: 1.061; stroke-miterlimit: 10; }
                    .fishing-st2 { fill: #FFFFFF; }
                </style>
                <g>
                    <g>
                        <path class="fishing-st0" d="M168.8,298.4c1.2,8.5,0.3,17.1,0.5,25.7c0.2,9.6,2,18.6,8.8,25.9c9.4,10,25.3,14.4,38.7,10.4
                                c17.7-5.3,21.7-23.3,19.9-39.9c-1.9-18.1-36.9-35.6-47.7-49.9" />
                        <g>
                            <path class="fishing-st0" d="M167.6,298.4c2.1,17-3.6,36.8,8.5,51.2c9.6,11.4,26.7,16.2,40.8,11.9c13.3-4,19.8-16,20.9-29.2
                                    c0.5-5.8,0.6-12.3-1.8-17.7c-2.4-5.5-6.6-10-10.9-14.1c-11.2-10.7-25.9-18.5-35.6-30.8c-0.9-1.1-2.5,0.5-1.6,1.6
                                    c6.8,8.7,16.6,15,25.1,21.8c8.2,6.6,19.6,14.9,22,25.8c2.6,11.8-0.2,27.8-9.9,35.7c-12.2,9.9-31.9,7-43.4-2.6
                                    c-16.4-13.6-9.8-35.4-12.1-53.7C169.7,297,167.5,297,167.6,298.4L167.6,298.4z" />
                        </g>
                    </g>
                    <path class="fishing-st1" d="M478.9,117c4.7-9.7,8.2-23.7-1.1-29.1c-14.2-8.2-57.5,45.2-56.5,46.4c-48.6-54.4-77.1-85.6-131.5-106.8
                            c-16.6-6.5-34.3-10.2-52.2-11.2c-6-0.8-12-1.4-18-1.7C156.4,11.3,100.7,51.6,80,64.7C59.3,77.8,2.5,154.2,0.4,158.5
                            c0,0-1.1,9.8,15.3,22.9s22.9,12,16.4,22.9c-6.5,10.9-30.6,17.5-31.7,26.2c-1.1,8.7,0,8.7,8.7,10.9c8.7,2.2,50.2,46.5,103.7,64.7
                            c53.5,18.2,111.7,18.2,146.4,12.8c2.7-0.4,5.5-1,8.2-1.6c12.3-1.9,24.7-4.5,33-8.2c15.7-5.9,28.9-12.5,34.2-15.3
                            c1.6,0.5,3.2,1.1,4.6,1.9c2.1,3.1,5.5,7.9,8.9,11.6c7.6,8.2,20.9,8.6,31.1,4c7.7-3.5,18.9-16.7,21.6-25.2c2.2-6.8,2.3-5.1-0.9-10.3
                            c-0.5-0.9-14.9-8.8-14.7-9c14.3-15.3,34.3-40,34.3-40c10.4,15.9,29.6,47.3,43.1,47.8c17.3,0.7,18.9-18.6,16-30.9
                            C466.5,195.2,456,164,478.9,117z" />
                    <!-- 其余SVG路径保持不变，只需添加fishing-前缀到类名 -->
                </g>
            </svg>
        </div>
    </div>
    <div class="fishing-animation-text">${loadingText}</div>
`;

  // 将内容添加到容器
  container.appendChild(content);

  // 添加到目标元素
  targetElement.appendChild(container);

  // 创建加载文本动画
  let dots = 0;
  const textElement = content.querySelector(".fishing-animation-text");
  let loadingInterval = setInterval(() => {
    let str = "";
    if (dots < 3) {
      dots++;
    } else {
      dots = 1;
    }
    for (let i = 0; i < dots; i++) {
      str += ".";
    }
    textElement.textContent = loadingText + str;
  }, 500);

  // 返回控制对象
  return {
    // 移除动画
    remove: function () {
      clearInterval(loadingInterval);
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },

    // 更新文本
    updateText: function (newText) {
      loadingText = newText;
      textElement.textContent = newText;
    },

    // 暂停动画
    pause: function () {
      const animatedElements = container.querySelectorAll("*");
      animatedElements.forEach((el) => {
        if (el.style.animationPlayState !== undefined) {
          el.style.animationPlayState = "paused";
        }
      });
      clearInterval(loadingInterval);
    },

    // 恢复动画
    resume: function () {
      const animatedElements = container.querySelectorAll("*");
      animatedElements.forEach((el) => {
        if (el.style.animationPlayState !== undefined) {
          el.style.animationPlayState = "running";
        }
      });
      // 重新启动文本动画
      dots = 0;
      loadingInterval = setInterval(() => {
        let str = "";
        if (dots < 3) {
          dots++;
        } else {
          dots = 1;
        }
        for (let i = 0; i < dots; i++) {
          str += ".";
        }
        textElement.textContent = loadingText + str;
      }, 500);
    },
  };
}

// 移除所有钓鱼动画
function removeAllFishingAnimations() {
  const containers = document.querySelectorAll(".fishing-animation-container");
  containers.forEach((container) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
}

//使用示例
// const fishingAnimation = createFishingAnimation("#app", "加载中");

// // 5秒后移除动画
// setTimeout(() => {
//   fishingAnimation.remove();
// }, 5000);

if (typeof createFishingAnimation !== 'undefined') module.exports['createFishingAnimation'] = createFishingAnimation;
if (typeof removeAllFishingAnimations !== 'undefined') module.exports['removeAllFishingAnimations'] = removeAllFishingAnimations;

};
__modules["./Loading/V2/Loading.js"] = function(module, exports, require){
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

if (typeof createLoading !== 'undefined') module.exports['createLoading'] = createLoading;

};
__modules["./Message/V1/Message.js"] = function(module, exports, require){
// Message.js
class Message {
  constructor() {
    this.containers = {};
    this.messageCount = 0;
    this.initContainers();
    this.initStyles();
  }

  // 初始化容器
  initContainers() {
    const positions = ["center-top", "center-bottom", "left", "right"];

    positions.forEach((position) => {
      const container = document.createElement("div");
      container.className = `message-container ${position}`;
      container.id = `message-container-${position}`;
      document.body.appendChild(container);
      this.containers[position] = container;
    });
  }

  // 初始化样式
  initStyles() {
    if (document.getElementById("message-styles")) return;

    const style = document.createElement("style");
    style.id = "message-styles";
    style.textContent = `
            .message-container {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
            }
            
            .message-container.center-top,
            .message-container.center-bottom {
                left: 50%;
                transform: translateX(-50%);
            }
            
            .message-container.center-top {
                top: 24px;
            }
            
            .message-container.center-bottom {
                bottom: 24px;
            }
            
            .message-container.left {
                left: 24px;
                top: 24px;
            }
            
            .message-container.right {
                right: 24px;
                top: 24px;
            }
            
            .message-item {
                pointer-events: auto;
                min-width: 300px;
                max-width: 500px;
                padding: 12px 16px;
                margin-bottom: 16px;
                border-radius: 6px;
                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                            0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                            0 9px 28px 8px rgba(0, 0, 0, 0.05);
                background-color: white;
                display: flex;
                align-items: flex-start;
                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                position: relative;
                overflow: hidden;
                opacity: 0;
                transform: translateY(-20px);
            }
            
            .message-item.left-entering {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .message-item.right-entering {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .message-item.entered {
                opacity: 1;
                transform: translateY(0) translateX(0);
            }
            
            .message-item.hiding-left {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .message-item.hiding-right {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .message-item.hiding-up {
                transform: translateY(-100%);
                opacity: 0;
            }
            
            .message-item.hiding-down {
                transform: translateY(100%);
                opacity: 0;
            }
            
            .message-icon {
                margin-right: 12px;
                font-size: 18px;
                line-height: 1;
                display: flex;
                align-items: center;
                height: 22px;
                flex-shrink: 0;
            }
            
            .message-content {
                flex: 1;
                font-size: 14px;
                line-height: 1.5715;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .message-close {
                margin-left: 12px;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.45);
                font-size: 14px;
                line-height: 1;
                padding: 2px;
                transition: color 0.3s;
                display: flex;
                align-items: center;
                height: 22px;
                flex-shrink: 0;
            }
            
            .message-close:hover {
                color: rgba(0, 0, 0, 0.85);
            }
            
            .message-normal,
            .message-info {
                border-left: 4px solid #1890ff;
            }
            
            .message-success {
                border-left: 4px solid #52c41a;
            }
            
            .message-error {
                border-left: 4px solid #ff4d4f;
            }
            
            .message-warning {
                border-left: 4px solid #faad14;
            }
            
            .message-important {
                border-left: 4px solid #722ed1;
                background-color: #f9f0ff;
            }
            
            .message-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                background-color: rgba(0, 0, 0, 0.06);
                width: 100%;
            }
            
            .message-progress-bar {
                height: 100%;
                background-color: #1890ff;
                width: 100%;
                transition: width linear;
            }
            
            .message-progress-bar.success {
                background-color: #52c41a;
            }
            
            .message-progress-bar.error {
                background-color: #ff4d4f;
            }
            
            .message-progress-bar.warning {
                background-color: #faad14;
            }
            
            .message-progress-bar.important {
                background-color: #722ed1;
            }
        `;

    document.head.appendChild(style);
  }

  // 显示消息
  show(options) {
    // 处理参数
    const config = typeof options === "string" ? { content: options } : options;

    // 默认配置
    const defaultConfig = {
      type: "info",
      content: "",
      duration: 3,
      position: "center-top",
      hideDirection: "up",
      showClose: null,
      onClose: null,
    };

    // 合并配置
    const mergedConfig = { ...defaultConfig, ...config };

    // 根据位置确定默认行为
    if (mergedConfig.showClose === null) {
      mergedConfig.showClose =
        mergedConfig.position === "left" || mergedConfig.position === "right";
    }

    // 居中底部默认向下消失
    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "center-bottom"
    ) {
      mergedConfig.hideDirection = "down";
    }

    // 左侧默认向左消失，右侧默认向右消失
    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "left"
    ) {
      mergedConfig.hideDirection = "left";
    }

    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "right"
    ) {
      mergedConfig.hideDirection = "right";
    }

    // 创建消息元素
    const messageId = `message-${Date.now()}-${this.messageCount++}`;
    const messageItem = document.createElement("div");
    messageItem.id = messageId;
    messageItem.className = `message-item message-${mergedConfig.type}`;

    // 设置入场动画类
    if (mergedConfig.position === "left") {
      messageItem.classList.add("left-entering");
    } else if (mergedConfig.position === "right") {
      messageItem.classList.add("right-entering");
    }

    // 图标
    const iconMap = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      important: "🔔",
    };

    const iconSpan = document.createElement("span");
    iconSpan.className = "message-icon";
    iconSpan.textContent = iconMap[mergedConfig.type] || iconMap["info"];

    // 内容
    const contentSpan = document.createElement("span");
    contentSpan.className = "message-content";
    contentSpan.textContent = mergedConfig.content;

    // 关闭按钮
    const closeSpan = document.createElement("span");
    closeSpan.className = "message-close";
    closeSpan.innerHTML = "&times;";
    closeSpan.onclick = () =>
      this.closeMessage(
        messageId,
        mergedConfig.position,
        mergedConfig.hideDirection,
        mergedConfig.onClose
      );

    // 进度条
    let progressBar = null;
    if (mergedConfig.duration > 0) {
      const progressDiv = document.createElement("div");
      progressDiv.className = "message-progress";

      progressBar = document.createElement("div");
      progressBar.className = `message-progress-bar ${mergedConfig.type}`;

      // 设置进度条动画
      progressBar.style.transitionDuration = `${mergedConfig.duration}s`;
      progressBar.style.width = "100%";

      progressDiv.appendChild(progressBar);
      messageItem.appendChild(progressDiv);

      // 开始进度条动画
      setTimeout(() => {
        if (progressBar) {
          progressBar.style.width = "0%";
        }
      }, 10);
    }

    // 组装消息
    messageItem.appendChild(iconSpan);
    messageItem.appendChild(contentSpan);

    if (mergedConfig.showClose) {
      messageItem.appendChild(closeSpan);
    }

    // 添加到对应容器
    const container = this.containers[mergedConfig.position];
    if (container) {
      // 添加到容器的顶部
      if (container.firstChild) {
        container.insertBefore(messageItem, container.firstChild);
      } else {
        container.appendChild(messageItem);
      }

      // 触发入场动画
      setTimeout(() => {
        messageItem.classList.add("entered");
      }, 10);
    }

    // 自动关闭
    let timeoutId = null;
    if (mergedConfig.duration > 0) {
      timeoutId = setTimeout(() => {
        this.closeMessage(
          messageId,
          mergedConfig.position,
          mergedConfig.hideDirection,
          mergedConfig.onClose
        );
      }, mergedConfig.duration * 1000);
    }

    // 保存关闭信息
    messageItem._messageData = {
      timeoutId,
      onClose: mergedConfig.onClose,
    };

    return messageId;
  }

  // 关闭消息
  closeMessage(messageId, position, hideDirection, onClose) {
    const message = document.getElementById(messageId);
    if (!message) return;

    // 清除定时器
    if (message._messageData && message._messageData.timeoutId) {
      clearTimeout(message._messageData.timeoutId);
    }

    // 触发关闭回调
    if (onClose) {
      onClose();
    } else if (message._messageData && message._messageData.onClose) {
      message._messageData.onClose();
    }

    // 添加消失动画类
    message.classList.add(`hiding-${hideDirection}`);

    // 动画结束后移除元素
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 300);
  }

  // 清除所有消息
  clear() {
    Object.keys(this.containers).forEach((position) => {
      const container = this.containers[position];
      const messages = container.querySelectorAll(".message-item");

      messages.forEach((message) => {
        // 清除定时器
        if (message._messageData && message._messageData.timeoutId) {
          clearTimeout(message._messageData.timeoutId);
        }

        // 触发关闭动画
        let hideDirection = "up";
        if (position === "center-bottom") hideDirection = "down";
        if (position === "left") hideDirection = "left";
        if (position === "right") hideDirection = "right";

        message.classList.add(`hiding-${hideDirection}`);

        // 移除元素
        setTimeout(() => {
          if (message.parentNode === container) {
            container.removeChild(message);
          }
        }, 300);
      });
    });
  }

  // 快捷方法
  info(content, options = {}) {
    return this.show({ ...options, content, type: "info" });
  }

  success(content, options = {}) {
    return this.show({ ...options, content, type: "success" });
  }

  error(content, options = {}) {
    return this.show({ ...options, content, type: "error" });
  }

  warning(content, options = {}) {
    return this.show({ ...options, content, type: "warning" });
  }

  important(content, options = {}) {
    return this.show({ ...options, content, type: "important" });
  }

  // 别名方法
  normal(content, options = {}) {
    return this.info(content, options);
  }

  // 手动关闭指定消息
  close(messageId) {
    const message = document.getElementById(messageId);
    if (!message) return;

    const container = message.parentNode;
    if (!container) return;

    let position = "center-top";
    if (container.id.includes("center-bottom")) position = "center-bottom";
    if (container.id.includes("left")) position = "left";
    if (container.id.includes("right")) position = "right";

    let hideDirection = "up";
    if (position === "center-bottom") hideDirection = "down";
    if (position === "left") hideDirection = "left";
    if (position === "right") hideDirection = "right";

    this.closeMessage(messageId, position, hideDirection);
  }
}

// 创建全局实例（如果不存在）
if (typeof window !== "undefined" && !window.Message) {
  window.Message = new Message();
}

// 导出模块
if (typeof module !== "undefined" && module.exports) {
  module.exports = Message;
}

// // 快捷方法
// Message.info('普通消息');
// Message.success('成功消息');
// Message.error('错误消息');
// Message.warning('警告消息');
// Message.important('重要消息');

// // 完整配置
// Message.show({
//     type: 'success',
//     content: '操作成功',
//     duration: 5,
//     position: 'center-top',
//     hideDirection: 'up'
// });

};
__modules["./Message/V2/Message.js"] = function(module, exports, require){
// Message.js
class Message {
  constructor() {
    this.containers = {};
    this.messageCount = 0;
    this.initContainers();
    this.initStyles();
  }

  // 初始化容器
  initContainers() {
    const positions = ["center-top", "center-bottom", "left", "right"];

    positions.forEach((position) => {
      const container = document.createElement("div");
      container.className = `message-container ${position}`;
      container.id = `message-container-${position}`;
      document.body.appendChild(container);
      this.containers[position] = container;
    });
  }

  // 初始化样式
  initStyles() {
    if (document.getElementById("message-styles")) return;

    const style = document.createElement("style");
    style.id = "message-styles";
    style.textContent = `
            .message-container {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
            }
            
            .message-container.center-top,
            .message-container.center-bottom {
                left: 50%;
                transform: translateX(-50%);
            }
            
            .message-container.center-top {
                top: 24px;
            }
            
            .message-container.center-bottom {
                bottom: 24px;
            }
            
            .message-container.left {
                left: 24px;
                top: 24px;
            }
            
            .message-container.right {
                right: 24px;
                top: 24px;
            }
            
            .message-item {
                pointer-events: auto;
                min-width: 300px;
                max-width: 500px;
                padding: 12px 16px;
                margin-bottom: 16px;
                border-radius: 6px;
                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                            0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                            0 9px 28px 8px rgba(0, 0, 0, 0.05);
                background-color: white;
                display: flex;
                align-items: flex-start;
                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                position: relative;
                overflow: hidden;
                opacity: 0;
                transform: translateY(-20px);
            }
            
            .message-item.left-entering {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .message-item.right-entering {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .message-item.entered {
                opacity: 1;
                transform: translateY(0) translateX(0);
            }
            
            .message-item.hiding-left {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .message-item.hiding-right {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .message-item.hiding-up {
                transform: translateY(-100%);
                opacity: 0;
            }
            
            .message-item.hiding-down {
                transform: translateY(100%);
                opacity: 0;
            }
            
            .message-icon {
                margin-right: 12px;
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .message-icon svg {
                width: 20px;
                height: 20px;
            }
            
            .message-content {
                flex: 1;
                font-size: 14px;
                line-height: 1.5715;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .message-close {
                margin-left: 12px;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.45);
                font-size: 14px;
                line-height: 1;
                padding: 2px;
                transition: color 0.3s;
                display: flex;
                align-items: center;
                height: 22px;
                flex-shrink: 0;
            }
            
            .message-close:hover {
                color: rgba(0, 0, 0, 0.85);
            }
            
            .message-normal,
            .message-info {
                border-left: 4px solid #1890ff;
            }
            
            .message-success {
                border-left: 4px solid #52c41a;
            }
            
            .message-error {
                border-left: 4px solid #ff4d4f;
            }
            
            .message-warning {
                border-left: 4px solid #faad14;
            }
            
            .message-important {
                border-left: 4px solid #722ed1;
                background-color: #f9f0ff;
            }
            
            .message-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                background-color: rgba(0, 0, 0, 0.06);
                width: 100%;
            }
            
            .message-progress-bar {
                height: 100%;
                background-color: #1890ff;
                width: 100%;
                transition: width linear;
            }
            
            .message-progress-bar.success {
                background-color: #52c41a;
            }
            
            .message-progress-bar.error {
                background-color: #ff4d4f;
            }
            
            .message-progress-bar.warning {
                background-color: #faad14;
            }
            
            .message-progress-bar.important {
                background-color: #722ed1;
            }
        `;

    document.head.appendChild(style);
  }

  // 创建SVG图标
  createMessageIcon(type) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 1024 1024");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");

    // 为不同消息类型设置不同的颜色
    let fillColor;
    switch (type) {
      case "info":
      case "normal":
        fillColor = "#1890ff"; // 蓝色
        break;
      case "success":
        fillColor = "#52c41a"; // 绿色
        break;
      case "error":
        fillColor = "#ff4d4f"; // 红色
        break;
      case "warning":
        fillColor = "#faad14"; // 橙色
        break;
      case "important":
        fillColor = "#722ed1"; // 紫色
        break;
      default:
        fillColor = "#1890ff";
    }

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      "M410.5 106h203C780 106 915.3 239.6 918 405.5v412.3c0 54.8-44 99.3-98.5 100.2h-409C244 918 108.7 784.4 106 618.5v-208C106 244 239.6 108.7 405.5 106h208-203z m203 62.5h-203c-132.3 0-239.9 106.2-242 238v207c0 132.3 106.2 239.9 238 242h411.3c20.6 0 37.4-16.6 37.7-37.1V410.5c0-133.7-108.3-242-242-242z m58.2 410.2c19.9 0 36 16.1 36 36s-16.1 36-36 36H354.5c-19.9 0-36-16.1-36-36s16.1-36 36-36h317.2zM360.4 406.5h172.7c19.9 0 36 16.1 36 36 0 19.7-15.8 35.7-35.4 36H360.4c-19.9 0-36-16.1-36-36 0-19.7 15.8-35.7 35.4-36H533.1 360.4z"
    );
    path.setAttribute("fill", fillColor);

    svg.appendChild(path);
    return svg;
  }

  // 显示消息
  show(options) {
    // 处理参数
    const config = typeof options === "string" ? { content: options } : options;

    // 默认配置
    const defaultConfig = {
      type: "info",
      content: "",
      duration: 3,
      position: "center-top",
      hideDirection: "up",
      showClose: null,
      onClose: null,
    };

    // 合并配置
    const mergedConfig = { ...defaultConfig, ...config };

    // 根据位置确定默认行为
    if (mergedConfig.showClose === null) {
      mergedConfig.showClose =
        mergedConfig.position === "left" || mergedConfig.position === "right";
    }

    // 居中底部默认向下消失
    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "center-bottom"
    ) {
      mergedConfig.hideDirection = "down";
    }

    // 左侧默认向左消失，右侧默认向右消失
    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "left"
    ) {
      mergedConfig.hideDirection = "left";
    }

    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "right"
    ) {
      mergedConfig.hideDirection = "right";
    }

    // 创建消息元素
    const messageId = `message-${Date.now()}-${this.messageCount++}`;
    const messageItem = document.createElement("div");
    messageItem.id = messageId;
    messageItem.className = `message-item message-${mergedConfig.type}`;

    // 设置入场动画类
    if (mergedConfig.position === "left") {
      messageItem.classList.add("left-entering");
    } else if (mergedConfig.position === "right") {
      messageItem.classList.add("right-entering");
    }

    // 图标容器
    const iconSpan = document.createElement("span");
    iconSpan.className = "message-icon";

    // 创建SVG图标
    const svgIcon = this.createMessageIcon(mergedConfig.type);
    iconSpan.appendChild(svgIcon);

    // 内容
    const contentSpan = document.createElement("span");
    contentSpan.className = "message-content";
    contentSpan.textContent = mergedConfig.content;

    // 关闭按钮
    const closeSpan = document.createElement("span");
    closeSpan.className = "message-close";
    closeSpan.innerHTML = "&times;";
    closeSpan.onclick = () =>
      this.closeMessage(
        messageId,
        mergedConfig.position,
        mergedConfig.hideDirection,
        mergedConfig.onClose
      );

    // 进度条
    let progressBar = null;
    if (mergedConfig.duration > 0) {
      const progressDiv = document.createElement("div");
      progressDiv.className = "message-progress";

      progressBar = document.createElement("div");
      progressBar.className = `message-progress-bar ${mergedConfig.type}`;

      // 设置进度条动画
      progressBar.style.transitionDuration = `${mergedConfig.duration}s`;
      progressBar.style.width = "100%";

      progressDiv.appendChild(progressBar);
      messageItem.appendChild(progressDiv);

      // 开始进度条动画
      setTimeout(() => {
        if (progressBar) {
          progressBar.style.width = "0%";
        }
      }, 10);
    }

    // 组装消息
    messageItem.appendChild(iconSpan);
    messageItem.appendChild(contentSpan);

    if (mergedConfig.showClose) {
      messageItem.appendChild(closeSpan);
    }

    // 添加到对应容器
    const container = this.containers[mergedConfig.position];
    if (container) {
      // 添加到容器的顶部
      if (container.firstChild) {
        container.insertBefore(messageItem, container.firstChild);
      } else {
        container.appendChild(messageItem);
      }

      // 触发入场动画
      setTimeout(() => {
        messageItem.classList.add("entered");
      }, 10);
    }

    // 自动关闭
    let timeoutId = null;
    if (mergedConfig.duration > 0) {
      timeoutId = setTimeout(() => {
        this.closeMessage(
          messageId,
          mergedConfig.position,
          mergedConfig.hideDirection,
          mergedConfig.onClose
        );
      }, mergedConfig.duration * 1000);
    }

    // 保存关闭信息
    messageItem._messageData = {
      timeoutId,
      onClose: mergedConfig.onClose,
    };

    return messageId;
  }

  // 关闭消息
  closeMessage(messageId, position, hideDirection, onClose) {
    const message = document.getElementById(messageId);
    if (!message) return;

    // 清除定时器
    if (message._messageData && message._messageData.timeoutId) {
      clearTimeout(message._messageData.timeoutId);
    }

    // 触发关闭回调
    if (onClose) {
      onClose();
    } else if (message._messageData && message._messageData.onClose) {
      message._messageData.onClose();
    }

    // 添加消失动画类
    message.classList.add(`hiding-${hideDirection}`);

    // 动画结束后移除元素
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 300);
  }

  // 清除所有消息
  clear() {
    Object.keys(this.containers).forEach((position) => {
      const container = this.containers[position];
      const messages = container.querySelectorAll(".message-item");

      messages.forEach((message) => {
        // 清除定时器
        if (message._messageData && message._messageData.timeoutId) {
          clearTimeout(message._messageData.timeoutId);
        }

        // 触发关闭动画
        let hideDirection = "up";
        if (position === "center-bottom") hideDirection = "down";
        if (position === "left") hideDirection = "left";
        if (position === "right") hideDirection = "right";

        message.classList.add(`hiding-${hideDirection}`);

        // 移除元素
        setTimeout(() => {
          if (message.parentNode === container) {
            container.removeChild(message);
          }
        }, 300);
      });
    });
  }

  // 快捷方法
  info(content, options = {}) {
    return this.show({ ...options, content, type: "info" });
  }

  success(content, options = {}) {
    return this.show({ ...options, content, type: "success" });
  }

  error(content, options = {}) {
    return this.show({ ...options, content, type: "error" });
  }

  warning(content, options = {}) {
    return this.show({ ...options, content, type: "warning" });
  }

  important(content, options = {}) {
    return this.show({ ...options, content, type: "important" });
  }

  // 别名方法
  normal(content, options = {}) {
    return this.info(content, options);
  }

  // 手动关闭指定消息
  close(messageId) {
    const message = document.getElementById(messageId);
    if (!message) return;

    const container = message.parentNode;
    if (!container) return;

    let position = "center-top";
    if (container.id.includes("center-bottom")) position = "center-bottom";
    if (container.id.includes("left")) position = "left";
    if (container.id.includes("right")) position = "right";

    let hideDirection = "up";
    if (position === "center-bottom") hideDirection = "down";
    if (position === "left") hideDirection = "left";
    if (position === "right") hideDirection = "right";

    this.closeMessage(messageId, position, hideDirection);
  }
}

// 创建全局实例（如果不存在）
if (typeof window !== "undefined" && !window.Message) {
  window.Message = new Message();
}

// 导出模块
if (typeof module !== "undefined" && module.exports) {
  module.exports = Message;
}

// 使用示例（在需要的时候调用，不要在这里立即执行）
// Message.info('普通消息');
// Message.success('成功消息');

};
__modules["./ProgressBar/V1/ProgressBar.js"] = function(module, exports, require){
/**
 * 投资项目管理系统 - 进度组件
 * 支持圆形进度环、水平进度条、投资可视化三种类型
 * 可自定义颜色、文本位置、大小等属性
 */
class InvestmentProgress {
  constructor(container, options = {}) {
    // 默认配置
    this.defaultOptions = {
      type: "circle", // 类型: 'circle', 'bar', 'investment'
      size: 200, // 组件大小(px)，对于bar类型是宽度，其他是直径
      primaryColor: "#3498db", // 已完成进度颜色
      secondaryColor: "#ecf0f1", // 未完成进度颜色
      textColor: "#2c3e50", // 文本颜色
      percentageColor: null, // 百分比文字颜色，null时使用textColor
      showPercentage: true, // 是否显示百分比
      text: "", // 说明文本
      textPosition: "bottom", // 文本位置: 'top', 'bottom', 'left', 'right'
      textMargin: 10, // 文本与图示间距(px)
      progress: 0, // 初始进度(0-100)
      animationDuration: 300, // 进度更新动画时长(ms)
      useContainerSize: true, // 是否自适应父容器大小
      containerMaxSize: 300, // 当自适应时最大尺寸(px)
    };

    // 合并配置
    this.options = { ...this.defaultOptions, ...options };

    // 容器元素
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      console.error("InvestmentProgress: 未找到容器元素");
      return;
    }

    // 内部状态
    this.progress = this.options.progress;
    this.type = this.options.type;

    // 创建组件
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    // 清空容器
    this.container.innerHTML = "";

    // 设置容器样式，确保水平垂直居中
    this.setContainerStyle();

    // 创建组件结构
    this.createProgressElement();

    // 设置初始进度
    this.updateProgress(this.progress);
  }

  /**
   * 设置容器样式
   */
  setContainerStyle() {
    // 确保容器相对定位，方便内部元素居中
    Object.assign(this.container.style, {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    });

    // 如果自适应父容器大小，计算合适尺寸
    if (this.options.useContainerSize) {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;
      const minSize = Math.min(
        containerWidth,
        containerHeight,
        this.options.containerMaxSize
      );

      // 对于bar类型，宽度使用容器宽度，高度固定
      if (this.type === "bar") {
        this.options.size = Math.min(
          containerWidth,
          this.options.containerMaxSize
        );
      } else {
        this.options.size = minSize;
      }
    }
  }

  /**
   * 创建进度元素
   */
  createProgressElement() {
    // 清除旧元素
    if (this.progressContainer) {
      this.progressContainer.remove();
    }

    // 创建主容器
    this.progressContainer = document.createElement("div");
    this.progressContainer.className = "investment-progress-container";

    // 设置容器尺寸和位置
    const size = this.options.size;

    // 根据类型设置不同的布局
    if (this.type === "bar") {
      // 对于bar类型，使用flex布局
      Object.assign(this.progressContainer.style, {
        width: `${size}px`,
        height: "auto",
        display: "flex",
        flexDirection: this.getBarTextDirection(),
        alignItems: "center",
        justifyContent: "center",
      });
    } else {
      // 对于circle和investment类型，使用grid布局来保持图像居中
      Object.assign(this.progressContainer.style, {
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "grid",
        gridTemplateAreas: this.getGridTemplateAreas(),
        gridTemplateColumns: this.getGridTemplateColumns(),
        gridTemplateRows: this.getGridTemplateRows(),
        alignItems: "center",
        justifyContent: "center",
      });
    }

    // 创建进度图示
    this.createProgressVisual();

    // 创建文本元素
    this.createTextElement();

    // 添加到容器
    this.container.appendChild(this.progressContainer);
  }

  /**
   * 根据文本位置获取flex方向（用于bar类型）
   */
  getBarTextDirection() {
    switch (this.options.textPosition) {
      case "top":
        return "column";
      case "bottom":
        return "column-reverse";
      case "left":
        return "row";
      case "right":
        return "row-reverse";
      default:
        return "column";
    }
  }

  /**
   * 获取网格模板区域（用于非bar类型）
   */
  getGridTemplateAreas() {
    switch (this.options.textPosition) {
      case "top":
        return `'text' 'visual'`;
      case "bottom":
        return `'visual' 'text'`;
      case "left":
        return `'text visual'`;
      case "right":
        return `'visual text'`;
      default:
        return `'visual' 'text'`;
    }
  }

  /**
   * 获取网格模板列（用于非bar类型）
   */
  getGridTemplateColumns() {
    switch (this.options.textPosition) {
      case "left":
      case "right":
        return "auto 1fr";
      default:
        return "1fr";
    }
  }

  /**
   * 获取网格模板行（用于非bar类型）
   */
  getGridTemplateRows() {
    switch (this.options.textPosition) {
      case "top":
      case "bottom":
        return "auto 1fr";
      default:
        return "1fr";
    }
  }

  /**
   * 获取百分比文字颜色
   * 如果设置了percentageColor则使用，否则使用textColor
   */
  getPercentageColor() {
    return this.options.percentageColor || this.options.textColor;
  }

  /**
   * 创建进度图示
   */
  createProgressVisual() {
    // 清除旧图示
    if (this.visualContainer) {
      this.visualContainer.remove();
    }

    this.visualContainer = document.createElement("div");
    this.visualContainer.className = "investment-progress-visual";

    // 根据类型设置不同的布局
    if (this.type === "bar") {
      // 对于bar类型，不使用grid布局
      this.visualContainer.style.display = "flex";
      this.visualContainer.style.alignItems = "center";
      this.visualContainer.style.justifyContent = "flex-start"; // 从左开始
    } else {
      // 对于非bar类型，使用grid布局
      this.visualContainer.style.gridArea = "visual";
      this.visualContainer.style.display = "flex";
      this.visualContainer.style.alignItems = "center";
      this.visualContainer.style.justifyContent = "center";
    }

    // 根据类型创建不同的进度图示
    switch (this.type) {
      case "circle":
        this.createCircleVisual();
        break;
      case "bar":
        this.createBarVisual();
        break;
      case "investment":
        this.createInvestmentVisual();
        break;
      default:
        console.error(`InvestmentProgress: 不支持的类型 "${this.type}"`);
        return;
    }

    // 添加到进度容器
    this.progressContainer.appendChild(this.visualContainer);
  }

  /**
   * 创建圆形进度图示
   */
  createCircleVisual() {
    const size = this.options.size;
    const svgSize = size;

    // 创建SVG容器
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", svgSize);
    svg.setAttribute("height", svgSize);
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.style.display = "block";

    // 计算半径和周长
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    // 背景圆
    const bgCircle = document.createElementNS(svgNS, "circle");
    bgCircle.setAttribute("cx", "60");
    bgCircle.setAttribute("cy", "60");
    bgCircle.setAttribute("r", radius.toString());
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", this.options.secondaryColor);
    bgCircle.setAttribute("stroke-width", "12");
    svg.appendChild(bgCircle);

    // 前景圆（进度圆）
    this.progressCircle = document.createElementNS(svgNS, "circle");
    this.progressCircle.setAttribute("cx", "60");
    this.progressCircle.setAttribute("cy", "60");
    this.progressCircle.setAttribute("r", radius.toString());
    this.progressCircle.setAttribute("fill", "none");
    this.progressCircle.setAttribute("stroke", this.options.primaryColor);
    this.progressCircle.setAttribute("stroke-width", "12");
    this.progressCircle.setAttribute("stroke-linecap", "round");
    this.progressCircle.setAttribute(
      "stroke-dasharray",
      circumference.toString()
    );
    this.progressCircle.setAttribute(
      "stroke-dashoffset",
      circumference.toString()
    );
    this.progressCircle.setAttribute("transform", "rotate(-90 60 60)");
    svg.appendChild(this.progressCircle);

    // 百分比文本
    if (this.options.showPercentage) {
      this.percentageText = document.createElementNS(svgNS, "text");
      this.percentageText.setAttribute("x", "60");
      this.percentageText.setAttribute("y", "65");
      this.percentageText.setAttribute("text-anchor", "middle");
      this.percentageText.setAttribute("font-size", "20");
      this.percentageText.setAttribute("font-weight", "600");
      this.percentageText.setAttribute("fill", this.getPercentageColor());
      this.percentageText.textContent = "0%";
      svg.appendChild(this.percentageText);
    }

    this.visualContainer.appendChild(svg);
  }

  /**
   * 创建水平进度条图示
   */
  createBarVisual() {
    const width = this.options.size;
    const height = 20;

    // 对于bar类型，确保视觉容器宽度正确
    Object.assign(this.visualContainer.style, {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: this.options.secondaryColor,
      borderRadius: "10px",
      overflow: "hidden",
      position: "relative",
    });

    // 进度条 - 确保从左开始
    this.progressBar = document.createElement("div");
    Object.assign(this.progressBar.style, {
      width: "0%",
      height: "100%",
      backgroundColor: this.options.primaryColor,
      borderRadius: "10px",
      transition: `width ${this.options.animationDuration}ms ease`,
    });

    this.visualContainer.appendChild(this.progressBar);

    // 百分比文本（对于bar类型，文本可以在内部显示）
    if (this.options.showPercentage) {
      this.percentageText = document.createElement("div");
      Object.assign(this.percentageText.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "14px",
        fontWeight: "600",
        color: this.getPercentageColor(),
        textShadow: "1px 1px 1px rgba(255,255,255,0.8)",
      });
      this.percentageText.textContent = "0%";
      this.visualContainer.appendChild(this.percentageText);
    }
  }

  /**
   * 创建投资可视化图示
   */
  createInvestmentVisual() {
    const size = this.options.size;
    const visualSize = size;

    Object.assign(this.visualContainer.style, {
      width: `${visualSize}px`,
      height: `${visualSize}px`,
      position: "relative",
    });

    // 创建SVG容器
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 100 100");

    // 网格背景
    for (let i = 0; i <= 10; i++) {
      const lineX = document.createElementNS(svgNS, "line");
      lineX.setAttribute("x1", "0");
      lineX.setAttribute("y1", i * 10);
      lineX.setAttribute("x2", "100");
      lineX.setAttribute("y2", i * 10);
      lineX.setAttribute("stroke", this.options.secondaryColor);
      lineX.setAttribute("stroke-width", "0.5");
      svg.appendChild(lineX);

      const lineY = document.createElementNS(svgNS, "line");
      lineY.setAttribute("x1", i * 10);
      lineY.setAttribute("y1", "0");
      lineY.setAttribute("x2", i * 10);
      lineY.setAttribute("y2", "100");
      lineY.setAttribute("stroke", this.options.secondaryColor);
      lineY.setAttribute("stroke-width", "0.5");
      svg.appendChild(lineY);
    }

    // 增长线
    this.growthPath = document.createElementNS(svgNS, "path");
    this.growthPath.setAttribute("d", "M10,90 L10,90");
    this.growthPath.setAttribute("fill", "none");
    this.growthPath.setAttribute("stroke", this.options.primaryColor);
    this.growthPath.setAttribute("stroke-width", "3");
    this.growthPath.setAttribute("stroke-linecap", "round");
    this.growthPath.setAttribute("stroke-linejoin", "round");
    svg.appendChild(this.growthPath);

    this.visualContainer.appendChild(svg);

    // 百分比文本
    if (this.options.showPercentage) {
      this.percentageText = document.createElement("div");
      Object.assign(this.percentageText.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "20px",
        fontWeight: "600",
        color: this.getPercentageColor(),
      });
      this.percentageText.textContent = "0%";
      this.visualContainer.appendChild(this.percentageText);
    }
  }

  /**
   * 创建文本元素
   */
  createTextElement() {
    // 如果不需要文本，直接返回
    if (!this.options.text) return;

    // 移除旧文本
    if (this.textElement) {
      this.textElement.remove();
    }

    this.textElement = document.createElement("div");
    this.textElement.className = "investment-progress-text";
    this.textElement.textContent = this.options.text;

    // 根据类型设置不同的样式
    if (this.type === "bar") {
      // 对于bar类型，不使用grid布局
      this.textElement.style.display = "flex";
      this.textElement.style.alignItems = "center";
      this.textElement.style.justifyContent = "center";
    } else {
      // 对于非bar类型，使用grid布局
      this.textElement.style.gridArea = "text";
      this.textElement.style.display = "flex";
      this.textElement.style.alignItems = "center";
      this.textElement.style.justifyContent = "center";
    }

    // 设置文本样式
    const textStyle = {
      color: this.options.textColor,
      fontSize: "14px",
      textAlign: "center",
      flexShrink: "0",
    };

    // 根据文本位置设置不同的样式
    switch (this.options.textPosition) {
      case "top":
        textStyle.marginBottom = `${this.options.textMargin}px`;
        textStyle.width = "100%";
        break;
      case "bottom":
        textStyle.marginTop = `${this.options.textMargin}px`;
        textStyle.width = "100%";
        break;
      case "left":
        textStyle.marginRight = `${this.options.textMargin}px`;
        textStyle.writingMode = "vertical-rl"; // 垂直从右到左
        textStyle.textOrientation = "mixed";
        textStyle.height = "100%";
        textStyle.maxWidth = "none";
        textStyle.maxHeight = "150px";
        break;
      case "right":
        textStyle.marginLeft = `${this.options.textMargin}px`;
        textStyle.writingMode = "vertical-rl"; // 垂直从右到左
        textStyle.textOrientation = "mixed";
        textStyle.height = "100%";
        textStyle.maxWidth = "none";
        textStyle.maxHeight = "150px";
        break;
    }

    Object.assign(this.textElement.style, textStyle);

    // 添加到进度容器
    this.progressContainer.appendChild(this.textElement);
  }

  /**
   * 更新进度
   * @param {number} progress 进度值(0-100)
   * @param {boolean} animate 是否使用动画
   */
  updateProgress(progress, animate = true) {
    // 确保进度在0-100范围内
    this.progress = Math.max(0, Math.min(100, progress));

    // 根据类型更新进度显示
    switch (this.type) {
      case "circle":
        this.updateCircleProgress(animate);
        break;
      case "bar":
        this.updateBarProgress(animate);
        break;
      case "investment":
        this.updateInvestmentProgress(animate);
        break;
    }

    // 更新百分比文本
    if (this.options.showPercentage && this.percentageText) {
      if (this.percentageText.tagName === "text") {
        // SVG文本元素
        this.percentageText.textContent = `${Math.round(this.progress)}%`;
      } else {
        // HTML文本元素
        this.percentageText.textContent = `${Math.round(this.progress)}%`;
      }
    }

    // 触发进度更新事件
    this.triggerEvent("progressUpdate", { progress: this.progress });
  }

  /**
   * 更新圆形进度
   */
  updateCircleProgress(animate) {
    if (!this.progressCircle) return;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (this.progress / 100) * circumference;

    if (animate) {
      this.progressCircle.style.transition = `stroke-dashoffset ${this.options.animationDuration}ms ease`;
    } else {
      this.progressCircle.style.transition = "none";
    }

    this.progressCircle.setAttribute("stroke-dashoffset", offset);
  }

  /**
   * 更新水平进度条
   */
  updateBarProgress(animate) {
    if (!this.progressBar) return;

    if (animate) {
      this.progressBar.style.transition = `width ${this.options.animationDuration}ms ease`;
    } else {
      this.progressBar.style.transition = "none";
    }

    this.progressBar.style.width = `${this.progress}%`;
  }

  /**
   * 更新投资可视化进度
   */
  updateInvestmentProgress(animate) {
    if (!this.growthPath) return;

    // 创建增长曲线路径
    const points = [];
    const segments = 10;

    for (let i = 0; i <= segments; i++) {
      const x = 10 + i * 8;
      const progressRatio = Math.min(1, (i / segments) * (this.progress / 100));
      // 模拟投资增长曲线
      const y = 90 - 80 * Math.pow(progressRatio, 0.7);
      points.push(`${x},${y}`);
    }

    const pathData = `M${points.join(" L")}`;

    if (animate) {
      this.growthPath.style.transition = `d ${this.options.animationDuration}ms ease`;
      // 注意：SVG path的d属性过渡需要浏览器支持
      // 可以使用requestAnimationFrame实现平滑过渡
      requestAnimationFrame(() => {
        this.growthPath.setAttribute("d", pathData);
      });
    } else {
      this.growthPath.style.transition = "none";
      this.growthPath.setAttribute("d", pathData);
    }
  }

  /**
   * 设置组件类型
   * @param {string} type 类型: 'circle', 'bar', 'investment'
   */
  setType(type) {
    if (this.type === type) return;

    this.type = type;
    this.options.type = type;

    // 重新创建组件
    this.createProgressElement();

    // 更新进度显示
    this.updateProgress(this.progress, false);
  }

  /**
   * 设置文本
   * @param {string} text 文本内容
   */
  setText(text) {
    this.options.text = text;
    this.createTextElement();
  }

  /**
   * 设置文本位置
   * @param {string} position 位置: 'top', 'bottom', 'left', 'right'
   */
  setTextPosition(position) {
    if (this.options.textPosition === position) return;

    this.options.textPosition = position;

    // 重新创建整个组件以更新布局
    this.createProgressElement();

    // 更新进度显示
    this.updateProgress(this.progress, false);
  }

  /**
   * 设置颜色
   * @param {string} primary 已完成进度颜色
   * @param {string} secondary 未完成进度颜色
   * @param {string} textColor 文本颜色
   * @param {string} percentageColor 百分比文字颜色（可选）
   */
  setColors(primary, secondary, textColor, percentageColor) {
    this.options.primaryColor = primary || this.options.primaryColor;
    this.options.secondaryColor = secondary || this.options.secondaryColor;
    this.options.textColor = textColor || this.options.textColor;

    // 如果提供了百分比颜色，则更新
    if (percentageColor !== undefined) {
      this.options.percentageColor = percentageColor;
    }

    // 重新初始化
    this.init();
  }

  /**
   * 设置百分比文字颜色
   * @param {string} color 百分比文字颜色
   */
  setPercentageColor(color) {
    this.options.percentageColor = color;

    // 更新百分比文字颜色
    this.updatePercentageColor();
  }

  /**
   * 更新百分比文字颜色
   */
  updatePercentageColor() {
    // 如果百分比文本存在，更新其颜色
    if (this.percentageText) {
      const percentageColor = this.getPercentageColor();

      if (this.percentageText.tagName === "text") {
        // SVG文本元素
        this.percentageText.setAttribute("fill", percentageColor);
      } else {
        // HTML文本元素
        this.percentageText.style.color = percentageColor;
      }
    }
  }

  /**
   * 重置进度为0
   */
  reset() {
    this.updateProgress(0, false);
  }

  /**
   * 完成进度(100%)
   */
  complete() {
    this.updateProgress(100);

    // 触发完成事件
    this.triggerEvent("complete", { progress: 100 });
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.container.innerHTML = "";
    this.container.style = "";
  }

  /**
   * 触发自定义事件
   * @param {string} eventName 事件名称
   * @param {Object} detail 事件详情
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(`investmentProgress:${eventName}`, {
      detail: { ...detail, instance: this },
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 获取当前进度
   * @returns {number} 当前进度值
   */
  getProgress() {
    return this.progress;
  }

  /**
   * 获取配置
   * @returns {Object} 当前配置
   */
  getOptions() {
    return { ...this.options };
  }
}

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = InvestmentProgress;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return InvestmentProgress;
  });
} else {
  window.InvestmentProgress = InvestmentProgress;
}

};
__modules["./Slider/V1/Slider.js"] = function(module, exports, require){
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

};
__modules["./Switch/V1/Switch.js"] = function(module, exports, require){
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
        this.switchElement
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

};
__modules["./Tabs/V1/Tabs.js"] = function(module, exports, require){
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

};
__modules["./TimeShaft/V1/TimeShaft.js"] = function(module, exports, require){
/**
 * 纯JS时间轴组件（Ant Design风格修复版）
 * 图标在时间轴线上，事件信息无背景色
 * 节点样式：实心-已办，空心-未办，空心旋转-待办
 */
class TimelineComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`容器元素 #${containerId} 不存在`);
    }

    // 默认配置
    this.defaultOptions = {
      mode: "vertical", // vertical, horizontal
      position: "alternate", // alternate, left, right
      lineColor: "#f0f0f0", // 时间轴线条颜色
      lineWidth: 2, // 时间轴线条宽度
      dotSize: 10, // 节点大小
      dotBorderWidth: 2, // 节点边框宽度
      pending: null, // 待办项
      reverse: false, // 是否倒序
      dateFormat: "YYYY-MM-DD", // 日期格式
      showTooltips: true, // 显示工具提示
      clickable: true, // 是否可点击
      animation: true, // 动画效果
      maxEvents: 50, // 最大事件数
      timelinePosition: "center", // 时间轴位置
      completedStyle: "filled", // 完成状态样式: filled, outline, icon
      incompleteStyle: "outline", // 未完成状态样式: filled, outline, icon
      pendingStyle: "spinning", // 待办状态样式: spinning, outline, icon
    };

    this.options = { ...this.defaultOptions, ...options };
    this.events = [];
    this.tooltip = null;
    this._initialized = false;
    this._eventHandlers = new Map();

    this._init();
  }

  _init() {
    this._createTooltip();
    this._addStyles();
    this.render();
    this._initialized = true;
  }

  _createTooltip() {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "timeline-tooltip";
    this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            max-width: 250px;
            word-wrap: break-word;
            white-space: normal;
            line-height: 1.5;
        `;
    document.body.appendChild(this.tooltip);
  }

  _addStyles() {
    const styleId = "timeline-component-fixed-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    // 修复的关键CSS - 确保图标在时间轴线上
    style.textContent = `
            /* 时间轴容器 */
            .timeline-container {
                position: relative;
                width: 100%;
                margin: 0 auto;
            }
            
            /* 时间轴 */
            .timeline {
                margin: 0;
                padding: 20px 0;
                list-style: none;
                position: relative;
            }
            
            /* 垂直时间轴 - 中央时间线 */
            .timeline-vertical {
                position: relative;
            }
            
            .timeline-vertical::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: var(--timeline-line-width, 2px);
                background: var(--timeline-line-color, #f0f0f0);
                z-index: 1;
            }
            
            /* 水平时间轴 - 中央时间线 */
            .timeline-horizontal {
                display: flex;
                padding: 40px 20px;
                position: relative;
                overflow-x: auto;
            }
            
            .timeline-horizontal::before {
                content: '';
                position: absolute;
                left: 20px;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                height: var(--timeline-line-width, 2px);
                background: var(--timeline-line-color, #f0f0f0);
                z-index: 1;
            }
            
            /* 时间轴项 */
            .timeline-item {
                position: relative;
                margin-bottom: 20px;
                z-index: 2;
            }
            
            .timeline-item:last-child {
                margin-bottom: 0;
            }
            
            .timeline-item-horizontal {
                flex: 1;
                min-width: 200px;
                margin-bottom: 0;
            }
            
            /* 时间轴节点（关键修复） */
            .timeline-dot-container {
                position: absolute;
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* 垂直时间轴的节点位置 */
            .timeline-vertical .timeline-dot-container {
                top: 0;
                width: var(--timeline-dot-size, 10px);
                height: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            /* 水平时间轴的节点位置 */
            .timeline-horizontal .timeline-dot-container {
                left: 0;
                right: 0;
                height: var(--timeline-dot-size, 10px);
                top: 50%;
                transform: translateY(-50%);
            }
            
            /* 节点基础样式 */
            .timeline-dot {
                width: var(--timeline-dot-size, 10px);
                height: var(--timeline-dot-size, 10px);
                border-radius: 50%;
                border: var(--dot-border-width, 2px) solid;
                box-sizing: border-box;
                position: relative;
                z-index: 4;
                transition: all 0.3s;
            }
            
            /* 实心节点 - 已办 */
            .timeline-dot-filled {
                background-color: var(--dot-color, #1890ff);
                border-color: var(--dot-color, #1890ff);
            }
            
            /* 空心节点 - 未办 */
            .timeline-dot-outline {
                background-color: white;
                border-color: var(--dot-color, #d9d9d9);
            }
            
            /* 旋转节点 - 待办 */
            .timeline-dot-spinning {
                background-color: white;
                border-color: var(--dot-color, #1890ff);
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }
            
            /* 圆角矩形节点 */
            .timeline-dot-rounded-rect {
                border-radius: 4px;
            }
            
            /* 方形节点 */
            .timeline-dot-square {
                border-radius: 2px;
            }
            
            /* 事件内容区域 */
            .timeline-content {
                position: relative;
                color: rgba(0, 0, 0, 0.85);
                line-height: 1.5;
            }
            
            /* 垂直时间轴的内容位置 */
            .timeline-vertical .timeline-content {
                width: 45%;
                padding: 0 16px;
            }
            
            .timeline-vertical .timeline-item-left .timeline-content {
                margin-left: 0;
                margin-right: auto;
                text-align: right;
            }
            
            .timeline-vertical .timeline-item-right .timeline-content {
                margin-left: auto;
                margin-right: 0;
                text-align: left;
            }
            
            /* 交替布局 */
            .timeline-position-alternate .timeline-vertical .timeline-item:nth-child(odd) .timeline-content {
                margin-left: 0;
                margin-right: auto;
                text-align: right;
            }
            
            .timeline-position-alternate .timeline-vertical .timeline-item:nth-child(even) .timeline-content {
                margin-left: auto;
                margin-right: 0;
                text-align: left;
            }
            
            /* 左侧布局 */
            .timeline-position-left .timeline-vertical .timeline-content {
                margin-left: 0;
                margin-right: auto;
                text-align: right;
                width: calc(100% - 30px);
            }
            
            /* 右侧布局 */
            .timeline-position-right .timeline-vertical::before {
                left: 30px;
            }
            
            .timeline-position-right .timeline-vertical .timeline-dot-container {
                left: 30px;
            }
            
            .timeline-position-right .timeline-vertical .timeline-content {
                margin-left: 60px;
                margin-right: 0;
                text-align: left;
                width: calc(100% - 60px);
            }
            
            /* 水平时间轴的内容位置 */
            .timeline-horizontal .timeline-content {
                margin-top: 30px;
                text-align: center;
                padding: 0 10px;
            }
            
            .timeline-horizontal .timeline-item-top .timeline-content {
                margin-top: -60px;
                margin-bottom: auto;
            }
            
            .timeline-horizontal .timeline-item-bottom .timeline-content {
                margin-top: 30px;
                margin-bottom: 0;
            }
            
            /* 事件标题 */
            .timeline-title {
                font-weight: 500;
                font-size: 14px;
                margin-bottom: 4px;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .timeline-title-clickable {
                cursor: pointer;
                transition: color 0.3s;
            }
            
            .timeline-title-clickable:hover {
                color: #1890ff;
            }
            
            /* 事件描述 */
            .timeline-description {
                font-size: 13px;
                color: rgba(0, 0, 0, 0.45);
                margin-bottom: 8px;
            }
            
            /* 事件时间 */
            .timeline-time {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.45);
            }
            
            /* 自定义图标 */
            .timeline-custom-dot {
                width: var(--timeline-dot-size, 10px);
                height: var(--timeline-dot-size, 10px);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: calc(var(--timeline-dot-size, 10px) - 4px);
            }
            
            /* 图标节点 */
            .timeline-dot-icon {
                background-color: white;
                border-color: var(--dot-color, #1890ff);
            }
            
            /* 加载动画 */
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .timeline-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                width: calc(var(--timeline-dot-size, 10px) - 4px);
                height: calc(var(--timeline-dot-size, 10px) - 4px);
                margin: -8px 0 0 -8px;
                border: var(--dot-border-width, 2px) solid #1890ff;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .timeline-vertical::before {
                    left: 20px;
                }
                
                .timeline-vertical .timeline-dot-container {
                    left: 20px;
                }
                
                .timeline-vertical .timeline-content {
                    width: calc(100% - 60px);
                    margin-left: 60px !important;
                    margin-right: 0 !important;
                    text-align: left !important;
                }
                
                .timeline-horizontal {
                    flex-direction: column;
                }
                
                .timeline-horizontal::before {
                    left: 50%;
                    top: 20px;
                    width: 2px;
                    height: calc(100% - 40px);
                    transform: translateX(-50%);
                }
                
                .timeline-horizontal .timeline-dot-container {
                    left: 50%;
                    top: 20px;
                    transform: translateX(-50%);
                }
                
                .timeline-horizontal .timeline-content {
                    margin-left: 60px;
                    margin-top: 0;
                    text-align: left;
                }
            }
            
            /* 时间轴位置 */
            .timeline-align-center {
                margin-left: auto;
                margin-right: auto;
            }
            
            .timeline-align-left {
                margin-right: auto;
                margin-left: 0;
            }
            
            .timeline-align-right {
                margin-left: auto;
                margin-right: 0;
            }
        `;

    document.head.appendChild(style);
  }

  setEvents(events) {
    if (!Array.isArray(events)) {
      throw new Error("events参数必须是一个数组");
    }

    if (events.length > this.options.maxEvents) {
      console.warn(`事件数量超过最大限制(${this.options.maxEvents})`);
      events = events.slice(0, this.options.maxEvents);
    }

    this.events = events.map((event, index) => ({
      ...event,
      id: event.id || `timeline-event-${Date.now()}-${index}`,
      color: event.color || "#1890ff",
      status: event.status || "incomplete",
      dotStyle: event.dotStyle || "circle", // circle, rounded-rect, square
      // 新增样式控制
      completedStyle: event.completedStyle || this.options.completedStyle,
      incompleteStyle: event.incompleteStyle || this.options.incompleteStyle,
      pendingStyle: event.pendingStyle || this.options.pendingStyle,
    }));

    if (this.options.reverse) {
      this.events.reverse();
    }

    this.render();
    return this;
  }

  render() {
    this.container.innerHTML = "";

    // 创建时间轴容器
    const timelineContainer = document.createElement("div");
    timelineContainer.className = "timeline-container";

    // 创建时间轴
    const timeline = document.createElement("ul");
    timeline.className = `timeline timeline-${this.options.mode} timeline-position-${this.options.position} timeline-align-${this.options.timelinePosition}`;

    // 设置CSS变量
    timeline.style.setProperty("--timeline-line-color", this.options.lineColor);
    timeline.style.setProperty(
      "--timeline-line-width",
      `${this.options.lineWidth}px`
    );
    timeline.style.setProperty(
      "--timeline-dot-size",
      `${this.options.dotSize}px`
    );
    timeline.style.setProperty(
      "--dot-border-width",
      `${this.options.dotBorderWidth}px`
    );

    // 添加事件
    this.events.forEach((event, index) => {
      const eventElement = this._createEventElement(event, index);
      timeline.appendChild(eventElement);
    });

    // 添加待办项
    if (this.options.pending) {
      const pendingElement = this._createPendingElement();
      timeline.appendChild(pendingElement);
    }

    timelineContainer.appendChild(timeline);
    this.container.appendChild(timelineContainer);

    if (this.options.animation) {
      this._animateEvents();
    }

    return this;
  }

  _createEventElement(event, index) {
    const item = document.createElement("li");
    item.className = `timeline-item timeline-item-${
      this.options.mode
    } ${this._getItemPositionClass(index)}`;
    item.dataset.eventId = event.id;

    // 创建节点容器
    const dotContainer = document.createElement("div");
    dotContainer.className = "timeline-dot-container";

    // 创建节点
    const dot = this._createEventDot(event);
    dotContainer.appendChild(dot);

    // 创建内容
    const content = this._createEventContent(event);

    // 组装
    item.appendChild(dotContainer);
    item.appendChild(content);

    // 添加交互
    if (
      this.options.clickable &&
      (event.onClick || this._eventHandlers.has(event.id))
    ) {
      item.style.cursor = "pointer";
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this._handleEventClick(event, e);
      });
    }

    // 添加工具提示
    if (this.options.showTooltips && event.tooltip) {
      this._addTooltip(item, event.tooltip);
    }

    return item;
  }

  _createEventDot(event) {
    const dot = document.createElement("div");

    // 基础类名
    let dotClass = "timeline-dot";

    // 根据状态和样式配置添加类名
    if (event.icon) {
      // 自定义图标
      dotClass += " timeline-dot-icon";
      const customDot = document.createElement("div");
      customDot.className = "timeline-custom-dot";
      customDot.innerHTML = event.icon;
      dot.appendChild(customDot);
    } else {
      // 根据状态选择样式
      let styleClass = "";
      switch (event.status) {
        case "completed":
          styleClass = event.completedStyle || this.options.completedStyle;
          break;
        case "incomplete":
          styleClass = event.incompleteStyle || this.options.incompleteStyle;
          break;
        case "pending":
          styleClass = event.pendingStyle || this.options.pendingStyle;
          break;
        default:
          styleClass = "outline";
      }
      dotClass += ` timeline-dot-${styleClass}`;
    }

    // 添加形状类名
    dotClass += ` timeline-dot-${event.dotStyle || "circle"}`;
    dot.className = dotClass;

    // 设置颜色
    dot.style.setProperty("--dot-color", event.color || "#1890ff");

    return dot;
  }

  _createEventContent(event) {
    const content = document.createElement("div");
    content.className = "timeline-content";

    // 标题
    if (event.title) {
      const title = document.createElement("div");
      title.className = "timeline-title";

      if (event.onTitleClick) {
        title.classList.add("timeline-title-clickable");
        title.addEventListener("click", (e) => {
          e.stopPropagation();
          event.onTitleClick(event, e);
        });
      }

      title.textContent = event.title;
      content.appendChild(title);
    }

    // 描述
    if (event.description) {
      const description = document.createElement("div");
      description.className = "timeline-description";
      description.textContent = event.description;
      content.appendChild(description);
    }

    // 时间
    if (event.time) {
      const time = document.createElement("div");
      time.className = "timeline-time";
      time.textContent = this._formatDate(event.time);
      content.appendChild(time);
    }

    // 自定义内容
    if (event.content) {
      if (typeof event.content === "string") {
        const customContent = document.createElement("div");
        customContent.innerHTML = event.content;
        content.appendChild(customContent);
      } else {
        content.appendChild(event.content);
      }
    }

    return content;
  }

  _getItemPositionClass(index) {
    const { mode, position } = this.options;

    if (mode === "vertical") {
      if (position === "alternate") {
        return index % 2 === 0 ? "left" : "right";
      }
      return position;
    } else {
      if (position === "alternate") {
        return index % 2 === 0 ? "top" : "bottom";
      }
      return position;
    }
  }

  _createPendingElement() {
    const item = document.createElement("li");
    item.className = `timeline-item timeline-item-${this.options.mode} timeline-item-pending`;

    const dotContainer = document.createElement("div");
    dotContainer.className = "timeline-dot-container";

    const dot = document.createElement("div");
    dot.className = "timeline-dot timeline-dot-spinning";
    dot.style.setProperty("--dot-color", "#1890ff");

    dotContainer.appendChild(dot);

    const content = document.createElement("div");
    content.className = "timeline-content";

    if (typeof this.options.pending === "string") {
      content.textContent = this.options.pending;
    } else {
      content.appendChild(this.options.pending);
    }

    item.appendChild(dotContainer);
    item.appendChild(content);

    return item;
  }

  _formatDate(dateInput) {
    if (!dateInput) return "";

    let date;
    if (typeof dateInput === "string") {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return String(dateInput);
    }

    if (isNaN(date.getTime())) {
      return "无效日期";
    }

    const format = this.options.dateFormat;

    if (format === "relative") {
      return this._getRelativeTime(date);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY年MM月DD日":
        return `${year}年${month}月${day}日`;
      case "YYYY-MM-DD HH:mm":
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case "YYYY-MM-DD HH:mm:ss":
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case "MM/DD/YYYY HH:mm":
        return `${month}/${day}/${year} ${hours}:${minutes}`;
      case "HH:mm":
        return `${hours}:${minutes}`;
      default:
        return format
          .replace("YYYY", year)
          .replace("MM", month)
          .replace("DD", day)
          .replace("HH", hours)
          .replace("mm", minutes)
          .replace("ss", seconds);
    }
  }

  _getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours > 0) return `${diffHours}小时前`;

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes > 0) return `${diffMinutes}分钟前`;

      return "刚刚";
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays > 0) {
      return `${diffDays}天前`;
    }

    return "";
  }

  _handleEventClick(event, e) {
    if (event.onClick) {
      event.onClick(event, e);
    }

    const handler = this._eventHandlers.get(event.id);
    if (handler) {
      handler(event, e);
    }
  }

  _addTooltip(element, text) {
    element.addEventListener("mouseenter", (e) => {
      this.tooltip.textContent = text;
      this.tooltip.style.opacity = "1";

      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      this.tooltip.style.top = `${
        rect.top + scrollTop - this.tooltip.offsetHeight - 10
      }px`;
      this.tooltip.style.left = `${
        rect.left + rect.width / 2 - this.tooltip.offsetWidth / 2
      }px`;
    });

    element.addEventListener("mouseleave", () => {
      this.tooltip.style.opacity = "0";
    });
  }

  _animateEvents() {
    const items = this.container.querySelectorAll(".timeline-item");
    items.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(10px)";

      setTimeout(() => {
        item.style.transition = "opacity 0.3s, transform 0.3s";
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  // 公共API
  addEvent(event, onClick = null) {
    if (this.events.length >= this.options.maxEvents) {
      console.warn(`已达到最大事件数量(${this.options.maxEvents})`);
      return null;
    }

    const newEvent = {
      ...event,
      id: event.id || `timeline-event-${Date.now()}-${this.events.length}`,
      color: event.color || "#1890ff",
      status: event.status || "incomplete",
      dotStyle: event.dotStyle || "circle",
      completedStyle: event.completedStyle || this.options.completedStyle,
      incompleteStyle: event.incompleteStyle || this.options.incompleteStyle,
      pendingStyle: event.pendingStyle || this.options.pendingStyle,
    };

    this.events.push(newEvent);

    if (onClick) {
      this._eventHandlers.set(newEvent.id, onClick);
    }

    this.render();
    return newEvent.id;
  }

  updateEventStatus(eventId, status) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex].status = status;
      this.render();
    }
    return this;
  }

  updateEvent(eventId, eventData) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...eventData,
        id: eventId,
      };
      this.render();
    }
    return this;
  }

  removeEvent(eventId) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events.splice(eventIndex, 1);
      this._eventHandlers.delete(eventId);
      this.render();
    }
    return this;
  }

  onEventClick(eventId, handler) {
    this._eventHandlers.set(eventId, handler);
    return this;
  }

  updateOptions(options) {
    this.options = { ...this.options, ...options };
    this.render();
    return this;
  }

  clear() {
    this.events = [];
    this._eventHandlers.clear();
    this.render();
    return this;
  }

  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    this.container.innerHTML = "";
    this.events = [];
    this._eventHandlers.clear();
    this._initialized = false;

    return this;
  }

  getEvents() {
    return [...this.events];
  }

  getEvent(eventId) {
    return this.events.find((event) => event.id === eventId) || null;
  }

  getOptions() {
    return { ...this.options };
  }

  isInitialized() {
    return this._initialized;
  }
}

// 使用示例
// const timelineExample = [
//     {
//         title: '项目启动',
//         description: '项目正式启动会议',
//         time: '2023-01-15',
//         status: 'completed',
//         color: '#1890ff',
//         dotStyle: 'circle', // circle, rounded-rect, square
//         completedStyle: 'filled', // 已办：实心
//         tooltip: '项目启动完成',
//         onClick: (event) => console.log('点击了:', event.title)
//     },
//     {
//         title: '需求分析',
//         description: '完成需求文档编写',
//         time: '2023-02-10',
//         status: 'completed',
//         color: '#52c41a',
//         dotStyle: 'rounded-rect', // 圆角矩形
//         completedStyle: 'filled'
//     },
//     {
//         title: 'UI设计',
//         description: '完成界面设计稿',
//         time: '2023-03-05',
//         status: 'pending',
//         color: '#faad14',
//         dotStyle: 'circle',
//         pendingStyle: 'spinning' // 待办：旋转
//     },
//     {
//         title: '前端开发',
//         description: '开始前端功能开发',
//         time: '2023-03-20',
//         status: 'incomplete',
//         color: '#d9d9d9',
//         dotStyle: 'square', // 方形
//         incompleteStyle: 'outline' // 未办：空心
//     },
//     {
//         title: '测试阶段',
//         description: '系统测试',
//         time: '2023-04-10',
//         status: 'incomplete',
//         color: '#ff4d4f',
//         icon: '🧪', // 使用图标
//         dotStyle: 'circle'
//     }
// ];

};
__modules["./TreeExpandPanel/V1/TreeExpandPanel.js"] = function(module, exports, require){
/**
 * 树形结构展开控制面板
 * @param {Object} options - 配置选项
 * @param {number} [options.defaultLevels=5] - 默认显示的层级按钮数量
 * @param {number} [options.maxCustomLevel=25] - 自定义输入的最大层级
 * @param {string} [options.toolbarSelector='div.udp-panel-title#_rq_'] - 工具栏容器选择器
 * @param {string} [options.containerSelector='.row-hover.rows-container.editable'] - 树形结构容器选择器
 * @param {number} [options.animationDelay=100] - 动画延迟时间(ms)
 * @param {Object} [options.position] - 插入位置配置
 * @param {number} [options.position.index=0] - 目标元素中的子元素索引
 * @param {string} [options.position.side='after'] - 插入位置 ('before' | 'after')
 * @param {Object} [options.margin] - 边距配置
 * @param {string} [options.margin.left='0 1% 0 1%'] - 左边距
 * @param {string} [options.margin.right=''] - 右边距
 * @param {string} [options.defaultState='expanded'] - 默认状态 ('collapsed' | 'level' | 'expanded')
 * @param {number} [options.defaultLevel=1] - 默认展开层级（当defaultState='level'时有效）
 */
function createTreeExpandPanel(options = {}) {
  // 合并默认配置
  const config = {
    defaultLevels: 5,
    maxCustomLevel: 25,
    toolbarSelector: "div.udp-panel-title#_rq_",
    containerSelector: ".row-hover.rows-container.editable",
    animationDelay: 100,
    position: {
      index: 0,
      side: "after",
    },
    margin: {
      left: "0 1% 0 1%",
      right: "",
    },
    defaultState: "expanded", // 'collapsed', 'level', 'expanded'
    defaultLevel: 1,
    ...options,
  };

  // 确保position和margin对象存在
  config.position = { index: 0, side: "after", ...config.position };
  config.margin = { left: "0 1% 0 1%", right: "", ...config.margin };

  // 获取目标元素
  const toolbarDiv = document.querySelector(config.toolbarSelector);
  if (!toolbarDiv) {
    console.error(`未找到工具栏容器: ${config.toolbarSelector}`);
    return;
  }

  // 全局函数定义
  function expandToLevel(level = 0) {
    if (level <= 0) return;

    function collapseAllElements(callback) {
      const container = document.querySelector(config.containerSelector);
      if (!container) {
        console.log("未找到容器");
        return;
      }

      const elements = container.querySelectorAll(
        ".udp-row-expand-icon.udp-row-expand-icon-expanded"
      );
      if (elements.length > 0) {
        console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
        elements.forEach((el) => el.click());
        setTimeout(() => collapseAllElements(callback), config.animationDelay);
      } else {
        console.log("所有元素已收起");
        if (callback) callback();
      }
    }

    function startLevelExpansion(currentLevel = 0) {
      if (currentLevel >= level) {
        console.log(`已展开到第 ${level} 层，停止`);
        return;
      }

      const container = document.querySelector(config.containerSelector);
      if (!container) {
        console.log("未找到容器");
        return;
      }

      const elements = container.querySelectorAll(
        ".udp-row-expand-icon.udp-row-expand-icon-collapsed"
      );
      if (elements.length > 0) {
        console.log(
          `展开第 ${currentLevel + 1} 层，找到 ${elements.length} 个元素`
        );
        elements.forEach((el) => el.click());
        setTimeout(
          () => startLevelExpansion(currentLevel + 1),
          config.animationDelay
        );
      } else {
        console.log(`第 ${currentLevel + 1} 层无更多可展开元素，提前终止`);
      }
    }

    collapseAllElements(() => startLevelExpansion());
  }

  function expandAllElements() {
    const container = document.querySelector(config.containerSelector);
    if (!container) {
      console.log("未找到容器");
      return;
    }

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-collapsed"
    );
    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个折叠元素，正在展开...`);
      elements.forEach((el) => el.click());
      setTimeout(expandAllElements, config.animationDelay);
    } else {
      console.log("所有元素已展开");
    }
  }

  function collapseAllElements() {
    const container = document.querySelector(config.containerSelector);
    if (!container) {
      console.log("未找到容器");
      return;
    }

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-expanded"
    );
    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
      elements.forEach((el) => el.click());
      setTimeout(collapseAllElements, config.animationDelay);
    } else {
      console.log("所有元素已收起");
    }
  }

  // 创建状态对象
  const panelState = {
    isExpanded: false,
    currentLevel: config.defaultLevel,
  };

  // 创建主面板 - 政府网站风格
  const panel = document.createElement("div");
  panel.className = "x-panel x-box-item x-panel-default";
  panel.id = "tree-expand-panel";

  // 构建边距样式
  const marginStyle = `${config.margin.left} ${config.margin.right}`.trim();

  panel.style.cssText = `
        margin: ${marginStyle};
        height: 40px;
        width: auto;
        min-width: ${480 + (config.defaultLevels - 5) * 40}px;
        background: #f8f9fa;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #d1d7dc;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        padding: 0 15px;
    `;

  // 创建"层级："标签
  const levelLabel = document.createElement("span");
  levelLabel.textContent = "层级";
  levelLabel.style.cssText = `
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
        color: #333;
        margin-right: 10px;
        white-space: nowrap;
    `;
  panel.appendChild(levelLabel);

  // 面板body
  const panelBody = document.createElement("div");
  panelBody.id = "tree-expand-panel-body";
  panelBody.style.cssText = `
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
    `;

  // 创建按钮的函数
  const createButton = (id, text, left, level) => {
    const btn = document.createElement("div");
    btn.className = "x-btn x-box-item";
    btn.id = id;

    btn.style.cssText = `
            position: absolute;
            left: ${left}px;
            height: 30px;
            width: 30px;
            background: #fff;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            border: 1px solid #d1d7dc;
            user-select: none;
            font-family: "Microsoft YaHei", sans-serif;
        `;

    // 悬停效果
    btn.onmouseenter = () => {
      btn.style.background = "#f0f5ff";
      btn.style.borderColor = "#409eff";
    };

    btn.onmouseleave = () => {
      btn.style.background = "#fff";
      btn.style.borderColor = "#d1d7dc";
    };

    // 点击效果
    btn.onmousedown = () => {
      btn.style.transform = "translateY(1px)";
    };

    btn.onmouseup = () => {
      btn.style.transform = "translateY(0)";
    };

    const btnInner = document.createElement("span");
    btnInner.textContent = text;
    btnInner.style.cssText = `
            font-size: 14px;
            color: #333;
        `;

    btn.appendChild(btnInner);

    // 添加点击事件
    btn.addEventListener("click", () => {
      console.log(`点击了层级按钮: ${text}`);
      panelState.currentLevel = level;
      console.log("当前层级状态:", panelState);
      if (level == 1) {
        collapseAllElements(); //收起就是一级
      } else {
        expandToLevel(level - 1);
      }
    });

    return btn;
  };

  // 创建层级按钮
  const buttons = [];
  for (let i = 1; i <= config.defaultLevels; i++) {
    const button = createButton(
      `level-btn-${i}`,
      i.toString(),
      (i - 1) * 40,
      i
    );
    buttons.push(button);
    panelBody.appendChild(button);
  }

  // 全展/收起按钮
  const expandBtnLeft = config.defaultLevels * 40;
  const expandBtn = createButton("expandAllTreeBtn", "展开", expandBtnLeft, 0);
  expandBtn.style.width = "50px";
  expandBtn.style.background = "#409eff";
  expandBtn.style.color = "#fff";
  expandBtn.style.borderColor = "#409eff";
  expandBtn.firstChild.style.color = "#fff";

  // 悬停效果
  expandBtn.onmouseenter = () => {
    expandBtn.style.background = "#66b1ff";
    expandBtn.style.borderColor = "#66b1ff";
  };
  expandBtn.onmouseleave = () => {
    expandBtn.style.background = "#409eff";
    expandBtn.style.borderColor = "#409eff";
  };

  expandBtn.addEventListener("click", () => {
    panelState.isExpanded = !panelState.isExpanded;

    if (panelState.isExpanded) {
      expandBtn.firstChild.textContent = "收起";
      console.log("执行了展开操作");
      expandAllElements();
    } else {
      expandBtn.firstChild.textContent = "展开";
      console.log("执行了收起操作");
      collapseAllElements();
    }

    console.log("当前展开状态:", panelState.isExpanded);
  });

  panelBody.appendChild(expandBtn);

  // 添加分隔线
  const separatorLeft = expandBtnLeft + 70;
  const separator = document.createElement("div");
  separator.style.cssText = `
        position: absolute;
        left: ${separatorLeft}px;
        height: 25px;
        width: 1px;
        background-color: #d1d7dc;
        margin: 0 2%;
    `;
  panelBody.appendChild(separator);

  // To按钮
  const toButtonLeft = separatorLeft + 20;
  const toButton = document.createElement("div");
  toButton.className = "x-btn x-box-item";
  toButton.id = "toButton";
  toButton.textContent = "To";
  toButton.style.cssText = `
        position: absolute;
        left: ${toButtonLeft}px;
        height: 30px;
        width: 40px;
        background: #409eff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid #409eff;
        user-select: none;
        font-family: "Microsoft YaHei", sans-serif;
        color: #fff;
    `;
  // 悬停效果
  toButton.onmouseenter = () => {
    toButton.style.background = "#66b1ff";
    toButton.style.borderColor = "#66b1ff";
  };
  toButton.onmouseleave = () => {
    toButton.style.background = "#409eff";
    toButton.style.borderColor = "#409eff";
  };
  // 点击效果
  toButton.onmousedown = () => {
    toButton.style.transform = "translateY(1px)";
  };
  toButton.onmouseup = () => {
    toButton.style.transform = "translateY(0)";
  };
  // 点击事件
  toButton.addEventListener("click", () => {
    const inputValue = levelInput.value;
    if (!inputValue) {
      showToast("请输入层级数字");
      return;
    }
    const level = parseInt(inputValue);
    if (level < config.defaultLevels + 1 || level > config.maxCustomLevel) {
      showToast(
        `请输入${config.defaultLevels + 1}到${config.maxCustomLevel}之间的数字`
      );
      return;
    }
    const actualLevel = level - 1; // 对输入值减一
    console.log(`展开到自定义层级: ${level} (实际参数: ${actualLevel})`);
    expandToLevel(actualLevel);
  });
  panelBody.appendChild(toButton);

  // 输入框
  const inputLeft = toButtonLeft + 50;
  const levelInput = document.createElement("input");
  levelInput.type = "text";
  levelInput.id = "levelInput";
  levelInput.placeholder = `${config.defaultLevels + 1}-${
    config.maxCustomLevel
  }`;
  levelInput.style.cssText = `
        position: absolute;
        left: ${inputLeft}px;
        width: 50px;
        height: 26px;
        border: 1px solid #d1d7dc;
        border-radius: 4px;
        padding: 0 5px;
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
    `;
  // 限制只能输入数字
  levelInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  });
  panelBody.appendChild(levelInput);

  // "层"标签
  const labelLeft = inputLeft + 60;
  const layerLabel = document.createElement("span");
  layerLabel.textContent = "层";
  layerLabel.style.cssText = `
        position: absolute;
        left: ${labelLeft}px;
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
        color: #333;
        margin-right: 5px;
        white-space: nowrap;
    `;
  panelBody.appendChild(layerLabel);

  panel.appendChild(panelBody);

  // 根据配置插入到指定位置
  const children = toolbarDiv.children;
  const targetIndex = Math.min(config.position.index, children.length);

  if (config.position.side === "before") {
    if (targetIndex === 0) {
      toolbarDiv.insertBefore(panel, toolbarDiv.firstChild);
    } else if (targetIndex < children.length) {
      toolbarDiv.insertBefore(panel, children[targetIndex]);
    } else {
      toolbarDiv.appendChild(panel);
    }
  } else {
    // 'after'
    if (targetIndex >= children.length) {
      toolbarDiv.appendChild(panel);
    } else {
      toolbarDiv.insertBefore(panel, children[targetIndex + 1]);
    }
  }

  // 根据默认状态配置初始化
  function initializeDefaultState() {
    console.log(
      `初始化默认状态: ${config.defaultState}, 层级: ${config.defaultLevel}`
    );

    switch (config.defaultState) {
      case "collapsed":
        // 收起全部
        collapseAllElements();
        panelState.isExpanded = false;
        expandBtn.firstChild.textContent = "展开";
        panelState.currentLevel = 1;
        break;

      case "level":
        // 展开到指定层级
        if (
          config.defaultLevel >= 1 &&
          config.defaultLevel <= config.defaultLevels
        ) {
          // 如果是预设的层级按钮
          if (config.defaultLevel === 1) {
            collapseAllElements();
            panelState.currentLevel = 1;
          } else {
            expandToLevel(config.defaultLevel - 1);
            panelState.currentLevel = config.defaultLevel;
          }
          panelState.isExpanded = config.defaultLevel > 1;
          expandBtn.firstChild.textContent = panelState.isExpanded
            ? "收起"
            : "展开";
        } else {
          console.warn(`默认层级 ${config.defaultLevel} 超出范围，使用层级1`);
          collapseAllElements();
          panelState.currentLevel = 1;
          panelState.isExpanded = false;
          expandBtn.firstChild.textContent = "展开";
        }
        break;

      case "expanded":
      default:
        // 全部展开
        expandAllElements();
        panelState.isExpanded = true;
        expandBtn.firstChild.textContent = "收起";
        panelState.currentLevel = config.defaultLevels;
        break;
    }
  }

  // 延迟执行初始化，确保DOM已完全加载
  setTimeout(initializeDefaultState, 100);

  // 返回销毁方法
  return {
    destroy: () => {
      if (panel && panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
    },
    // 添加状态控制方法
    setState: (state, level) => {
      if (state === "collapsed") {
        collapseAllElements();
        panelState.isExpanded = false;
        expandBtn.firstChild.textContent = "展开";
        panelState.currentLevel = 1;
      } else if (state === "level" && level) {
        if (level >= 1 && level <= config.maxCustomLevel) {
          if (level === 1) {
            collapseAllElements();
          } else {
            expandToLevel(level - 1);
          }
          panelState.currentLevel = level;
          panelState.isExpanded = level > 1;
          expandBtn.firstChild.textContent = panelState.isExpanded
            ? "收起"
            : "展开";
        }
      } else if (state === "expanded") {
        expandAllElements();
        panelState.isExpanded = true;
        expandBtn.firstChild.textContent = "收起";
        panelState.currentLevel = config.defaultLevels;
      }
    },
  };
}

// 辅助函数：显示提示信息
function showToast(message) {
  console.log("提示:", message);
  // 这里可以添加更美观的提示方式，比如使用浏览器原生alert或自定义弹窗
  alert(message);
}

};

var __cache = {};
function __require(id){ if(__cache[id]) return __cache[id].exports; var module = {exports:{}}; __cache[id]=module; __modules[id](module, module.exports, __require); return module.exports; }
var G = (typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:global));
G.NG = G.NG || {}; G.NG.Components = G.NG.Components || {};
G.NG.Components["ButtonGroup/V1/ButtonGroup"] = __require("./ButtonGroup/V1/ButtonGroup.js");
G.NG.Components["Collapse/V1/Collapse"] = __require("./Collapse/V1/Collapse.js");
G.NG.Components["Components.all.osd.min"] = __require("./Components.all.osd.min.js");
G.NG.Components["DownloadAttachs/V1/DownloadAttachs"] = __require("./DownloadAttachs/V1/DownloadAttachs.js");
G.NG.Components["Loading/V1/FishingAnimation"] = __require("./Loading/V1/FishingAnimation.js");
G.NG.Components["Loading/V2/Loading"] = __require("./Loading/V2/Loading.js");
G.NG.Components["Message/V1/Message"] = __require("./Message/V1/Message.js");
G.NG.Components["Message/V2/Message"] = __require("./Message/V2/Message.js");
G.NG.Components["ProgressBar/V1/ProgressBar"] = __require("./ProgressBar/V1/ProgressBar.js");
G.NG.Components["Slider/V1/Slider"] = __require("./Slider/V1/Slider.js");
G.NG.Components["Switch/V1/Switch"] = __require("./Switch/V1/Switch.js");
G.NG.Components["Tabs/V1/Tabs"] = __require("./Tabs/V1/Tabs.js");
G.NG.Components["TimeShaft/V1/TimeShaft"] = __require("./TimeShaft/V1/TimeShaft.js");
G.NG.Components["TreeExpandPanel/V1/TreeExpandPanel"] = __require("./TreeExpandPanel/V1/TreeExpandPanel.js");

})();
