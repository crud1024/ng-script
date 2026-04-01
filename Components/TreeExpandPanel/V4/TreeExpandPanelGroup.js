/**
 * 树形结构展开控制面板（支持多Tab页签 + 直接传入元素）
 * 优化版本：支持对所有数据行生效（包括未渲染的节点）
 */
class NGTreeExpandPanel {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {number} [options.defaultLevels=5] - 默认显示的层级按钮数量
   * @param {number} [options.maxCustomLevel=25] - 自定义输入的最大层级
   * @param {string|HTMLElement} [options.toolbarSelector='div.udp-panel-title#_rq_'] - 工具栏容器（选择器或元素）
   * @param {string|HTMLElement} [options.containerSelector='.row-hover.rows-container.editable'] - 树形结构容器（选择器或元素）
   * @param {number} [options.animationDelay=100] - 动画延迟时间(ms)
   * @param {Object} [options.position] - 插入位置配置
   * @param {number} [options.position.index=0] - 目标元素中的子元素索引
   * @param {string} [options.position.side='after'] - 插入位置 ('before' | 'after')
   * @param {Object} [options.margin] - 边距配置
   * @param {string} [options.margin.left='0 1% 0 1%'] - 左边距
   * @param {string} [options.margin.right=''] - 右边距
   * @param {string} [options.defaultState='expanded'] - 默认状态 ('collapsed' | 'level' | 'expanded')
   * @param {number} [options.defaultLevel=1] - 默认展开层级（当defaultState='level'时有效）
   * @param {boolean} [options.enableTabSync=true] - 是否启用Tab页签自动同步（仅在containerSelector为选择器时有效）
   * @param {string} [options.activeTabPaneSelector='.ant-tabs-tabpane-active'] - 激活的Tab页签选择器
   * @param {boolean} [options.useDataModel=false] - 是否使用数据模型操作（默认false，使用DOM操作更可靠）
   * @param {string} [options.dataSourceGetter] - 数据源获取函数（用于获取树形数据）
   * @param {string} [options.rowSelector='.ant-tree-node'] - 树节点的选择器
   * @param {boolean} [options.autoScroll=false] - 是否自动滚动加载所有节点（默认false，可能影响性能）
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
      defaultState: "expanded",
      defaultLevel: 1,
      enableTabSync: true,
      activeTabPaneSelector: ".ant-tabs-tabpane-active",
      useDataModel: false, // 默认使用DOM操作，更可靠
      dataSourceGetter: null,
      rowSelector: ".ant-tree-node",
      autoScroll: false, // 默认不自动滚动，避免性能问题
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
      isOperating: false, // 操作中标志
      operationQueue: [], // 操作队列
    };

    // DOM元素引用
    this.elements = {
      panel: null,
      panelBody: null,
      levelInput: null,
      expandBtn: null,
      buttons: [],
    };

    // 存储直接传入的元素
    this._toolbarElement = null;
    this._containerElement = null;

    // Tab切换观察器
    this.tabObserver = null;
    // 当前正在操作的目标容器
    this.currentOperationContainer = null;

    // 数据模型相关
    this.dataModel = null;

    // 滚动加载相关
    this.scrollTimer = null;

    // 初始化组件
    this.init();
  }

  /**
   * 解析配置项，将选择器或元素转换为元素
   * @param {string|HTMLElement} selectorOrElement - 选择器或元素
   * @param {string} defaultValue - 默认选择器
   * @returns {HTMLElement|null} 解析后的元素
   * @private
   */
  _resolveElement(selectorOrElement, defaultValue = null) {
    if (!selectorOrElement)
      return defaultValue ? document.querySelector(defaultValue) : null;
    if (selectorOrElement instanceof HTMLElement) {
      return selectorOrElement;
    }
    if (typeof selectorOrElement === "string") {
      const element = document.querySelector(selectorOrElement);
      if (!element && defaultValue) {
        return document.querySelector(defaultValue);
      }
      return element;
    }
    return null;
  }

  /**
   * 初始化组件
   * @private
   */
  init() {
    // 解析工具栏容器（必须存在）
    this._toolbarElement = this._resolveElement(this.config.toolbarSelector);
    if (!this._toolbarElement) {
      console.error(`未找到工具栏容器: ${this.config.toolbarSelector}`);
      return;
    }

    // 解析树形容器（可能为空，后续操作时动态获取）
    this._containerElement = this._resolveElement(
      this.config.containerSelector,
    );

    // 创建面板
    this.createPanel();

    // 绑定事件
    this.bindEvents();

    // 初始化默认状态
    this.initializeDefaultState();

    // 启动Tab切换监听（仅当未指定具体容器且启用同步时）
    if (this.config.enableTabSync && !this._containerElement) {
      this.startTabSync();
    }
  }

  /**
   * 获取当前激活Tab页签中的树形容器，或直接返回用户指定的容器
   * @returns {HTMLElement|null} 当前应操作的容器元素
   * @private
   */
  _getCurrentContainer() {
    // 如果正在进行操作且有记录的操作容器，优先使用操作容器
    if (
      this.currentOperationContainer &&
      document.body.contains(this.currentOperationContainer)
    ) {
      return this.currentOperationContainer;
    }

    // 如果用户直接指定了容器元素，则直接返回该元素
    if (
      this._containerElement &&
      document.body.contains(this._containerElement)
    ) {
      return this._containerElement;
    }

    // 否则根据选择器查找所有匹配的容器
    const containers = document.querySelectorAll(this.config.containerSelector);
    if (containers.length === 0) return null;

    for (const container of containers) {
      const tabPane = container.closest(".ant-tabs-tabpane");
      if (tabPane) {
        const isActive =
          tabPane.classList.contains("ant-tabs-tabpane-active") &&
          getComputedStyle(tabPane).display !== "none";
        if (isActive) {
          return container;
        }
      } else {
        return containers[0];
      }
    }

    return containers[0];
  }

  /**
   * 从容器同步面板状态
   * @param {HTMLElement} container - 树形容器
   * @private
   */
  _syncStateFromContainer(container) {
    if (!container) return;

    // 检查容器内的图标状态
    const collapsedIcons = container.querySelectorAll(
      ".udp-row-expand-icon-collapsed",
    );
    const expandedIcons = container.querySelectorAll(
      ".udp-row-expand-icon-expanded",
    );

    // 判断展开状态
    let isFullyExpanded = false;
    let isFullyCollapsed = false;

    if (collapsedIcons.length === 0 && expandedIcons.length > 0) {
      isFullyExpanded = true;
      isFullyCollapsed = false;
    } else if (expandedIcons.length === 0 && collapsedIcons.length > 0) {
      isFullyExpanded = false;
      isFullyCollapsed = true;
    } else {
      isFullyExpanded = false;
      isFullyCollapsed = false;
    }

    // 更新状态
    this.state.isExpanded = isFullyExpanded;
    if (this.elements.expandBtn) {
      const btnSpan = this.elements.expandBtn.firstChild;
      if (btnSpan) {
        btnSpan.textContent = isFullyExpanded ? "收起" : "展开";
      }
    }

    // 估算当前层级
    let maxLevel = 1;
    const levelRows = container.querySelectorAll(".level-row");
    levelRows.forEach((row) => {
      const classes = row.className;
      const levelMatch = classes.match(/level-(\d+)/);
      if (levelMatch) {
        const level = parseInt(levelMatch[1], 10);
        if (level > maxLevel) maxLevel = level;
      }
    });
    this.state.currentLevel = maxLevel;
  }

  /**
   * 从当前激活容器同步面板状态
   * @private
   */
  _syncStateFromCurrentContainer() {
    const container = this._getCurrentContainer();
    if (container) {
      this._syncStateFromContainer(container);
    }
  }

  /**
   * 启动Tab页签切换监听
   * @private
   */
  startTabSync() {
    if (this.tabObserver) return;

    this.tabObserver = new MutationObserver((mutations) => {
      let needSync = false;
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const target = mutation.target;
          if (
            target.classList &&
            (target.classList.contains("ant-tabs-tabpane") ||
              target.closest(".ant-tabs-tabpane"))
          ) {
            needSync = true;
            break;
          }
        }
      }
      if (needSync) {
        setTimeout(() => this._syncStateFromCurrentContainer(), 50);
      }
    });

    this.tabObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });
  }

  /**
   * 停止Tab切换监听
   * @private
   */
  stopTabSync() {
    if (this.tabObserver) {
      this.tabObserver.disconnect();
      this.tabObserver = null;
    }
  }

  /**
   * 创建面板DOM结构
   * @private
   */
  createPanel() {
    const panel = document.createElement("div");
    panel.className = "x-panel x-box-item x-panel-default";
    panel.id = "tree-expand-panel";

    const marginStyle =
      `${this.config.margin.left} ${this.config.margin.right}`.trim();

    panel.style.cssText = `
      margin: ${marginStyle};
      height: 40px;
      width: auto;
      min-width: ${480 + (this.config.defaultLevels - 5) * 40}px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      padding: 0 15px;
      z-index: 100;
    `;

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

    const panelBody = document.createElement("div");
    panelBody.id = "tree-expand-panel-body";
    panelBody.style.cssText = `
      height: 100%;
      display: flex;
      align-items: center;
      position: relative;
    `;

    this.createLevelButtons(panelBody);
    this.createExpandButton(panelBody);
    this.createSeparator(panelBody);
    this.createToButton(panelBody);
    this.createLevelInput(panelBody);
    this.createLayerLabel(panelBody);

    panel.appendChild(panelBody);
    this.insertPanel(panel);

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

    btn.onmouseenter = () => {
      btn.style.background = "#f0f5ff";
      btn.style.borderColor = "#409eff";
    };

    btn.onmouseleave = () => {
      btn.style.background = "#fff";
      btn.style.borderColor = "#d1d7dc";
    };

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

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
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

    expandBtn.onmouseenter = () => {
      expandBtn.style.background = "#66b1ff";
      expandBtn.style.borderColor = "#66b1ff";
    };
    expandBtn.onmouseleave = () => {
      expandBtn.style.background = "#409eff";
      expandBtn.style.borderColor = "#409eff";
    };

    expandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
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

    toButton.onmouseenter = () => {
      toButton.style.background = "#66b1ff";
      toButton.style.borderColor = "#66b1ff";
    };
    toButton.onmouseleave = () => {
      toButton.style.background = "#409eff";
      toButton.style.borderColor = "#409eff";
    };

    toButton.onmousedown = () => {
      toButton.style.transform = "translateY(1px)";
    };
    toButton.onmouseup = () => {
      toButton.style.transform = "translateY(0)";
    };

    toButton.addEventListener("click", (e) => {
      e.stopPropagation();
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
    const children = this._toolbarElement.children;
    const targetIndex = Math.min(this.config.position.index, children.length);

    if (this.config.position.side === "before") {
      if (targetIndex === 0) {
        this._toolbarElement.insertBefore(
          panel,
          this._toolbarElement.firstChild,
        );
      } else if (targetIndex < children.length) {
        this._toolbarElement.insertBefore(panel, children[targetIndex]);
      } else {
        this._toolbarElement.appendChild(panel);
      }
    } else {
      if (targetIndex >= children.length) {
        this._toolbarElement.appendChild(panel);
      } else {
        this._toolbarElement.insertBefore(panel, children[targetIndex + 1]);
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

    if (this.state.isOperating) {
      console.log("操作进行中，请稍后再试");
      this.showToast("操作进行中，请稍后再试");
      return;
    }

    this.state.currentLevel = level;
    const container = this._getCurrentContainer();

    if (!container) {
      console.error("未找到树形容器");
      this.showToast("未找到树形容器");
      return;
    }

    if (level == 1) {
      this.collapseAll(container);
    } else {
      this.expandToLevel(level - 1, container);
    }
  }

  /**
   * 展开按钮点击事件处理
   * @private
   */
  onExpandButtonClick() {
    console.log("展开按钮点击");

    if (this.state.isOperating) {
      console.log("操作进行中，请稍后再试");
      this.showToast("操作进行中，请稍后再试");
      return;
    }

    this.state.isExpanded = !this.state.isExpanded;
    const container = this._getCurrentContainer();

    if (!container) {
      console.error("未找到树形容器");
      this.showToast("未找到树形容器");
      return;
    }

    if (this.state.isExpanded) {
      if (this.elements.expandBtn) {
        this.elements.expandBtn.firstChild.textContent = "收起";
      }
      console.log("执行展开所有操作");
      this.expandAll(container);
    } else {
      if (this.elements.expandBtn) {
        this.elements.expandBtn.firstChild.textContent = "展开";
      }
      console.log("执行收起所有操作");
      this.collapseAll(container);
    }
  }

  /**
   * To按钮点击事件处理
   * @private
   */
  onToButtonClick() {
    console.log("To按钮点击");

    if (this.state.isOperating) {
      console.log("操作进行中，请稍后再试");
      this.showToast("操作进行中，请稍后再试");
      return;
    }

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

    const actualLevel = level - 1;
    console.log(`展开到自定义层级: ${level} (实际参数: ${actualLevel})`);

    const container = this._getCurrentContainer();
    if (container) {
      this.expandToLevel(actualLevel, container);
    }
  }

  /**
   * 递归展开/收起操作（DOM方式）
   * @param {HTMLElement} container - 容器元素
   * @param {string} operation - 操作类型 'expand' 或 'collapse'
   * @param {Function} callback - 完成回调
   * @private
   */
  _operateDOMRecursive(container, operation, callback) {
    const selector =
      operation === "expand"
        ? ".udp-row-expand-icon.udp-row-expand-icon-collapsed"
        : ".udp-row-expand-icon.udp-row-expand-icon-expanded";

    const elements = container.querySelectorAll(selector);

    console.log(
      `${operation === "expand" ? "展开" : "收起"}操作，找到 ${elements.length} 个元素`,
    );

    if (elements.length === 0) {
      console.log(`${operation === "expand" ? "展开" : "收起"}操作完成`);
      if (callback) callback();
      return;
    }

    // 点击所有找到的元素
    elements.forEach((el) => {
      try {
        el.click();
      } catch (e) {
        console.warn("点击元素失败:", e);
      }
    });

    // 延迟后继续递归
    setTimeout(() => {
      this._operateDOMRecursive(container, operation, callback);
    }, this.config.animationDelay);
  }

  /**
   * 展开到指定层级
   * @param {number} level - 要展开到的层级
   * @param {HTMLElement} [targetContainer] - 目标容器
   */
  expandToLevel(level = 0, targetContainer = null) {
    if (level <= 0) {
      console.log("层级参数无效，执行收起所有");
      this.collapseAll(targetContainer);
      return;
    }

    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.error("未找到树形容器");
      this.showToast("未找到树形容器");
      return;
    }

    if (this.state.isOperating) {
      console.log("操作进行中，加入队列");
      this.state.operationQueue.push({
        type: "expandToLevel",
        level,
        container,
      });
      return;
    }

    this.state.isOperating = true;
    this.currentOperationContainer = container;

    console.log(`开始展开到第 ${level} 层`);

    // 先全部收起
    this._operateDOMRecursive(container, "collapse", () => {
      // 然后逐层展开
      let currentLevel = 0;
      const expandNextLevel = () => {
        if (currentLevel >= level) {
          console.log(`已展开到第 ${level} 层`);
          this.state.isOperating = false;
          this.currentOperationContainer = null;
          this._syncStateFromContainer(container);

          // 处理队列中的下一个操作
          if (this.state.operationQueue.length > 0) {
            const nextOp = this.state.operationQueue.shift();
            this[nextOp.type](nextOp.level, nextOp.container);
          }
          return;
        }

        console.log(`正在展开第 ${currentLevel + 1} 层`);
        this._operateDOMRecursive(container, "expand", () => {
          currentLevel++;
          setTimeout(expandNextLevel, this.config.animationDelay);
        });
      };

      expandNextLevel();
    });
  }

  /**
   * 展开所有元素
   * @param {HTMLElement} [targetContainer] - 目标容器
   */
  expandAll(targetContainer = null) {
    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.error("未找到树形容器");
      this.showToast("未找到树形容器");
      return;
    }

    if (this.state.isOperating) {
      console.log("操作进行中，加入队列");
      this.state.operationQueue.push({ type: "expandAll", container });
      return;
    }

    this.state.isOperating = true;
    this.currentOperationContainer = container;

    console.log("开始展开所有节点");

    this._operateDOMRecursive(container, "expand", () => {
      console.log("展开所有节点完成");
      this.state.isOperating = false;
      this.currentOperationContainer = null;
      this._syncStateFromContainer(container);

      // 处理队列中的下一个操作
      if (this.state.operationQueue.length > 0) {
        const nextOp = this.state.operationQueue.shift();
        this[nextOp.type](nextOp.level, nextOp.container);
      }
    });
  }

  /**
   * 收起所有元素
   * @param {HTMLElement} [targetContainer] - 目标容器
   */
  collapseAll(targetContainer = null) {
    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.error("未找到树形容器");
      this.showToast("未找到树形容器");
      return;
    }

    if (this.state.isOperating) {
      console.log("操作进行中，加入队列");
      this.state.operationQueue.push({ type: "collapseAll", container });
      return;
    }

    this.state.isOperating = true;
    this.currentOperationContainer = container;

    console.log("开始收起所有节点");

    this._operateDOMRecursive(container, "collapse", () => {
      console.log("收起所有节点完成");
      this.state.isOperating = false;
      this.currentOperationContainer = null;
      this._syncStateFromContainer(container);

      // 处理队列中的下一个操作
      if (this.state.operationQueue.length > 0) {
        const nextOp = this.state.operationQueue.shift();
        this[nextOp.type](nextOp.level, nextOp.container);
      }
    });
  }

  /**
   * 初始化默认状态
   * @private
   */
  initializeDefaultState() {
    console.log(
      `初始化默认状态: ${this.config.defaultState}, 层级: ${this.config.defaultLevel}`,
    );

    setTimeout(() => {
      const container = this._getCurrentContainer();
      if (!container) {
        console.warn("初始化时未找到树形容器");
        return;
      }

      switch (this.config.defaultState) {
        case "collapsed":
          this.collapseAll(container);
          break;
        case "level":
          if (this.config.defaultLevel === 1) {
            this.collapseAll(container);
          } else {
            this.expandToLevel(this.config.defaultLevel - 1, container);
          }
          break;
        case "expanded":
        default:
          this.expandAll(container);
          break;
      }
    }, 500); // 延迟500ms确保DOM完全加载
  }

  /**
   * 显示提示信息
   * @param {string} message - 提示消息
   * @private
   */
  showToast(message) {
    console.log("提示:", message);
    // 使用更友好的提示方式
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  /**
   * 设置面板状态
   * @param {string} state - 状态 ('collapsed' | 'level' | 'expanded')
   * @param {number} [level] - 层级
   */
  setState(state, level) {
    const container = this._getCurrentContainer();
    if (!container) return;

    switch (state) {
      case "collapsed":
        this.collapseAll(container);
        break;
      case "level":
        if (level === 1) {
          this.collapseAll(container);
        } else if (level > 1) {
          this.expandToLevel(level - 1, container);
        }
        break;
      case "expanded":
        this.expandAll(container);
        break;
    }
  }

  /**
   * 手动同步面板状态到当前激活Tab
   */
  syncState() {
    this._syncStateFromCurrentContainer();
  }

  /**
   * 更新配置
   * @param {Object} newOptions - 新配置选项
   */
  updateOptions(newOptions) {
    this.destroy();
    this.config = { ...this.config, ...newOptions };
    this.init();
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.stopTabSync();

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }

    if (this.elements.panel && this.elements.panel.parentNode) {
      this.elements.panel.parentNode.removeChild(this.elements.panel);
    }

    this.elements = {
      panel: null,
      panelBody: null,
      levelInput: null,
      expandBtn: null,
      buttons: [],
    };

    this._toolbarElement = null;
    this._containerElement = null;
    this.currentOperationContainer = null;
    this.state.isOperating = false;
    this.state.operationQueue = [];
  }
}

/**
 * 示例用法封装
 */
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
      enableTabSync: true,
      useDataModel: false,
      animationDelay: 100,
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  /**
   * 直接传入元素示例
   * @param {HTMLElement} toolbarElement - 工具栏元素
   * @param {HTMLElement} containerElement - 树形容器元素
   * @param {Object} options - 其他配置选项
   * @returns {NGTreeExpandPanel} 组件实例
   */
  withElements: function (toolbarElement, containerElement, options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: toolbarElement,
      containerSelector: containerElement,
      defaultState: "expanded",
      enableTabSync: false,
      useDataModel: false,
      animationDelay: 100,
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
      enableTabSync: true,
      useDataModel: false,
      animationDelay: 100,
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  /**
   * 自定义选择器示例
   * @param {string|HTMLElement} toolbarSelector - 工具栏选择器或元素
   * @param {string|HTMLElement} containerSelector - 容器选择器或元素
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
      enableTabSync: !(containerSelector instanceof HTMLElement),
      useDataModel: false,
      animationDelay: 100,
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },
};

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NGTreeExpandPanel, NGTreeExpandPanelExample };
}

if (typeof window !== "undefined") {
  window.NGTreeExpandPanel = NGTreeExpandPanel;
  window.NGTreeExpandPanelExample = NGTreeExpandPanelExample;
}
