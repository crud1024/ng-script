/**
 * 树形结构展开控制面板（类版本）
 * 提供树形结构的展开/收起控制功能
 */
class NGTreeExpandPanel {
  /**
   * 构造函数
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
  constructor(options = {}) {
    // 合并默认配置
    this.config = {
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
    this.config.position = { index: 0, side: "after", ...this.config.position };
    this.config.margin = {
      left: "0 1% 0 1%",
      right: "",
      ...this.config.margin,
    };

    // 状态管理
    this.state = {
      isExpanded: false,
      currentLevel: this.config.defaultLevel,
    };

    // DOM元素引用
    this.elements = {
      panel: null,
      panelBody: null,
      levelInput: null,
      expandBtn: null,
      buttons: [],
    };

    // 初始化组件
    this.init();
  }

  /**
   * 初始化组件
   * @private
   */
  init() {
    // 获取目标元素
    this.toolbarDiv = document.querySelector(this.config.toolbarSelector);
    if (!this.toolbarDiv) {
      console.error(`未找到工具栏容器: ${this.config.toolbarSelector}`);
      return;
    }

    // 创建面板
    this.createPanel();

    // 绑定事件
    this.bindEvents();

    // 初始化默认状态
    this.initializeDefaultState();
  }

  /**
   * 创建面板DOM结构
   * @private
   */
  createPanel() {
    // 创建主面板 - 政府网站风格
    const panel = document.createElement("div");
    panel.className = "x-panel x-box-item x-panel-default";
    panel.id = "tree-expand-panel";

    // 构建边距样式
    const marginStyle =
      `${this.config.margin.left} ${this.config.margin.right}`.trim();

    panel.style.cssText = `
      margin: ${marginStyle};
      height: 40px;
      width: auto;
      min-width: ${480 + (this.config.defaultLevels - 5) * 40}px;
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

    // 创建层级按钮
    this.createLevelButtons(panelBody);

    // 全展/收起按钮
    this.createExpandButton(panelBody);

    // 添加分隔线
    this.createSeparator(panelBody);

    // To按钮
    this.createToButton(panelBody);

    // 输入框
    this.createLevelInput(panelBody);

    // "层"标签
    this.createLayerLabel(panelBody);

    panel.appendChild(panelBody);

    // 根据配置插入到指定位置
    this.insertPanel(panel);

    // 保存DOM引用
    this.elements.panel = panel;
    this.elements.panelBody = panelBody;
  }

  /**
   * 创建层级按钮
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  createLevelButtons(container) {
    for (let i = 1; i <= this.config.defaultLevels; i++) {
      const button = this.createButton(
        `level-btn-${i}`,
        i.toString(),
        (i - 1) * 40,
        i,
      );
      this.elements.buttons.push(button);
      container.appendChild(button);
    }
  }

  /**
   * 创建按钮
   * @param {string} id - 按钮ID
   * @param {string} text - 按钮文本
   * @param {number} left - 左边距
   * @param {number} level - 对应层级
   * @returns {HTMLElement} 创建的按钮元素
   * @private
   */
  createButton(id, text, left, level) {
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
      this.onLevelButtonClick(level);
    });

    return btn;
  }

  /**
   * 创建展开/收起按钮
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  createExpandButton(container) {
    const expandBtnLeft = this.config.defaultLevels * 40;
    const expandBtn = this.createButton(
      "expandAllTreeBtn",
      "展开",
      expandBtnLeft,
      0,
    );
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
      this.onExpandButtonClick();
    });

    container.appendChild(expandBtn);
    this.elements.expandBtn = expandBtn;
  }

  /**
   * 创建分隔线
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  createSeparator(container) {
    const expandBtnLeft = this.config.defaultLevels * 40;
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
    container.appendChild(separator);
  }

  /**
   * 创建To按钮
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  createToButton(container) {
    const expandBtnLeft = this.config.defaultLevels * 40;
    const separatorLeft = expandBtnLeft + 70;
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
      this.onToButtonClick();
    });

    container.appendChild(toButton);
  }

  /**
   * 创建层级输入框
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  createLevelInput(container) {
    const expandBtnLeft = this.config.defaultLevels * 40;
    const separatorLeft = expandBtnLeft + 70;
    const toButtonLeft = separatorLeft + 20;
    const inputLeft = toButtonLeft + 50;

    const levelInput = document.createElement("input");
    levelInput.type = "text";
    levelInput.id = "levelInput";
    levelInput.placeholder = `${this.config.defaultLevels + 1}-${
      this.config.maxCustomLevel
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

    container.appendChild(levelInput);
    this.elements.levelInput = levelInput;
  }

  /**
   * 创建"层"标签
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  createLayerLabel(container) {
    const expandBtnLeft = this.config.defaultLevels * 40;
    const separatorLeft = expandBtnLeft + 70;
    const toButtonLeft = separatorLeft + 20;
    const inputLeft = toButtonLeft + 50;
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
    container.appendChild(layerLabel);
  }

  /**
   * 插入面板到指定位置
   * @param {HTMLElement} panel - 面板元素
   * @private
   */
  insertPanel(panel) {
    const children = this.toolbarDiv.children;
    const targetIndex = Math.min(this.config.position.index, children.length);

    if (this.config.position.side === "before") {
      if (targetIndex === 0) {
        this.toolbarDiv.insertBefore(panel, this.toolbarDiv.firstChild);
      } else if (targetIndex < children.length) {
        this.toolbarDiv.insertBefore(panel, children[targetIndex]);
      } else {
        this.toolbarDiv.appendChild(panel);
      }
    } else {
      // 'after'
      if (targetIndex >= children.length) {
        this.toolbarDiv.appendChild(panel);
      } else {
        this.toolbarDiv.insertBefore(panel, children[targetIndex + 1]);
      }
    }
  }

  /**
   * 绑定事件处理
   * @private
   */
  bindEvents() {
    // 事件已经在各个创建方法中绑定
  }

  /**
   * 层级按钮点击事件处理
   * @param {number} level - 层级
   * @private
   */
  onLevelButtonClick(level) {
    console.log(`点击了层级按钮: ${level}`);
    this.state.currentLevel = level;
    console.log("当前层级状态:", this.state);

    if (level == 1) {
      this.collapseAll(); // 收起就是一级
    } else {
      this.expandToLevel(level - 1);
    }
  }

  /**
   * 展开按钮点击事件处理
   * @private
   */
  onExpandButtonClick() {
    this.state.isExpanded = !this.state.isExpanded;

    if (this.state.isExpanded) {
      this.elements.expandBtn.firstChild.textContent = "收起";
      console.log("执行了展开操作");
      this.expandAll();
    } else {
      this.elements.expandBtn.firstChild.textContent = "展开";
      console.log("执行了收起操作");
      this.collapseAll();
    }

    console.log("当前展开状态:", this.state.isExpanded);
  }

  /**
   * To按钮点击事件处理
   * @private
   */
  onToButtonClick() {
    const inputValue = this.elements.levelInput.value;
    if (!inputValue) {
      this.showToast("请输入层级数字");
      return;
    }

    const level = parseInt(inputValue);
    if (
      level < this.config.defaultLevels + 1 ||
      level > this.config.maxCustomLevel
    ) {
      this.showToast(
        `请输入${this.config.defaultLevels + 1}到${this.config.maxCustomLevel}之间的数字`,
      );
      return;
    }

    const actualLevel = level - 1; // 对输入值减一
    console.log(`展开到自定义层级: ${level} (实际参数: ${actualLevel})`);
    this.expandToLevel(actualLevel);
  }

  /**
   * 展开到指定层级
   * @param {number} level - 要展开到的层级
   */
  expandToLevel(level = 0) {
    if (level <= 0) return;

    const collapseRecursive = (callback) => {
      const container = document.querySelector(this.config.containerSelector);
      if (!container) {
        console.log("未找到容器");
        return;
      }

      const elements = container.querySelectorAll(
        ".udp-row-expand-icon.udp-row-expand-icon-expanded",
      );

      if (elements.length > 0) {
        console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
        elements.forEach((el) => el.click());
        setTimeout(
          () => collapseRecursive(callback),
          this.config.animationDelay,
        );
      } else {
        console.log("所有元素已收起");
        if (callback) callback();
      }
    };

    const startLevelExpansion = (currentLevel = 0) => {
      if (currentLevel >= level) {
        console.log(`已展开到第 ${level} 层，停止`);
        return;
      }

      const container = document.querySelector(this.config.containerSelector);
      if (!container) {
        console.log("未找到容器");
        return;
      }

      const elements = container.querySelectorAll(
        ".udp-row-expand-icon.udp-row-expand-icon-collapsed",
      );

      if (elements.length > 0) {
        console.log(
          `展开第 ${currentLevel + 1} 层，找到 ${elements.length} 个元素`,
        );
        elements.forEach((el) => el.click());
        setTimeout(
          () => startLevelExpansion(currentLevel + 1),
          this.config.animationDelay,
        );
      } else {
        console.log(`第 ${currentLevel + 1} 层无更多可展开元素，提前终止`);
      }
    };

    collapseRecursive(() => startLevelExpansion());
  }

  /**
   * 展开所有元素
   */
  expandAll() {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) {
      console.log("未找到容器");
      return;
    }

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-collapsed",
    );

    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个折叠元素，正在展开...`);
      elements.forEach((el) => el.click());
      setTimeout(() => this.expandAll(), this.config.animationDelay);
    } else {
      console.log("所有元素已展开");
    }
  }

  /**
   * 收起所有元素
   */
  collapseAll() {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) {
      console.log("未找到容器");
      return;
    }

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-expanded",
    );

    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
      elements.forEach((el) => el.click());
      setTimeout(() => this.collapseAll(), this.config.animationDelay);
    } else {
      console.log("所有元素已收起");
    }
  }

  /**
   * 初始化默认状态
   * @private
   */
  initializeDefaultState() {
    console.log(
      `初始化默认状态: ${this.config.defaultState}, 层级: ${this.config.defaultLevel}`,
    );

    // 延迟执行初始化，确保DOM已完全加载
    setTimeout(() => {
      switch (this.config.defaultState) {
        case "collapsed":
          // 收起全部
          this.collapseAll();
          this.state.isExpanded = false;
          this.elements.expandBtn.firstChild.textContent = "展开";
          this.state.currentLevel = 1;
          break;

        case "level":
          // 展开到指定层级
          if (
            this.config.defaultLevel >= 1 &&
            this.config.defaultLevel <= this.config.defaultLevels
          ) {
            // 如果是预设的层级按钮
            if (this.config.defaultLevel === 1) {
              this.collapseAll();
              this.state.currentLevel = 1;
            } else {
              this.expandToLevel(this.config.defaultLevel - 1);
              this.state.currentLevel = this.config.defaultLevel;
            }
            this.state.isExpanded = this.config.defaultLevel > 1;
            this.elements.expandBtn.firstChild.textContent = this.state
              .isExpanded
              ? "收起"
              : "展开";
          } else {
            console.warn(
              `默认层级 ${this.config.defaultLevel} 超出范围，使用层级1`,
            );
            this.collapseAll();
            this.state.currentLevel = 1;
            this.state.isExpanded = false;
            this.elements.expandBtn.firstChild.textContent = "展开";
          }
          break;

        case "expanded":
        default:
          // 全部展开
          this.expandAll();
          this.state.isExpanded = true;
          this.elements.expandBtn.firstChild.textContent = "收起";
          this.state.currentLevel = this.config.defaultLevels;
          break;
      }
    }, 100);
  }

  /**
   * 显示提示信息
   * @param {string} message - 提示消息
   * @private
   */
  showToast(message) {
    console.log("提示:", message);
    // 这里可以添加更美观的提示方式，比如使用浏览器原生alert或自定义弹窗
    alert(message);
  }

  /**
   * 设置面板状态
   * @param {string} state - 状态 ('collapsed' | 'level' | 'expanded')
   * @param {number} [level] - 层级（当state='level'时有效）
   */
  setState(state, level) {
    switch (state) {
      case "collapsed":
        this.collapseAll();
        this.state.isExpanded = false;
        this.elements.expandBtn.firstChild.textContent = "展开";
        this.state.currentLevel = 1;
        break;

      case "level":
        if (level && level >= 1 && level <= this.config.maxCustomLevel) {
          if (level === 1) {
            this.collapseAll();
          } else {
            this.expandToLevel(level - 1);
          }
          this.state.currentLevel = level;
          this.state.isExpanded = level > 1;
          this.elements.expandBtn.firstChild.textContent = this.state.isExpanded
            ? "收起"
            : "展开";
        }
        break;

      case "expanded":
        this.expandAll();
        this.state.isExpanded = true;
        this.elements.expandBtn.firstChild.textContent = "收起";
        this.state.currentLevel = this.config.defaultLevels;
        break;
    }
  }

  /**
   * 更新配置
   * @param {Object} newOptions - 新配置选项
   */
  updateOptions(newOptions) {
    // 销毁当前实例
    this.destroy();

    // 合并新选项
    this.config = { ...this.config, ...newOptions };

    // 重新初始化
    this.init();
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.elements.panel && this.elements.panel.parentNode) {
      this.elements.panel.parentNode.removeChild(this.elements.panel);
    }

    // 清空引用
    this.elements = {
      panel: null,
      panelBody: null,
      levelInput: null,
      expandBtn: null,
      buttons: [],
    };

    this.toolbarDiv = null;
  }
}

// 示例用法封装
const NGTreeExpandPanelExample = {
  /**
   * 基础示例
   * @param {Object} options - 配置选项
   * @returns {NGTreeExpandPanel} 组件实例
   */
  basic: function (options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "expanded",
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  /**
   * 自定义层级数示例
   * @param {Object} options - 配置选项
   * @returns {NGTreeExpandPanel} 组件实例
   */
  customLevels: function (options = {}) {
    const defaultOptions = {
      defaultLevels: 7,
      maxCustomLevel: 30,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "level",
      defaultLevel: 2,
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  /**
   * 自定义选择器示例
   * @param {string} toolbarSelector - 工具栏选择器
   * @param {string} containerSelector - 容器选择器
   * @param {Object} options - 其他配置选项
   * @returns {NGTreeExpandPanel} 组件实例
   */
  customSelectors: function (toolbarSelector, containerSelector, options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: toolbarSelector || "div.udp-panel-title#_rq_",
      containerSelector:
        containerSelector || ".row-hover.rows-container.editable",
      defaultState: "collapsed",
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },
};

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NGTreeExpandPanel, NGTreeExpandPanelExample };
}

// 确保组件正确暴露到全局window对象
if (typeof window !== "undefined") {
  window.NGTreeExpandPanel = NGTreeExpandPanel;
  window.NGTreeExpandPanelExample = NGTreeExpandPanelExample;
}
