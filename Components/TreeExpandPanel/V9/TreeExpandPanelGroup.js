/**
 * 树形结构展开控制面板（支持多Tab页签 + 直接传入元素 + 自动记忆并展开新数据）
 * 提供树形结构的展开/收起控制功能，自动识别当前激活的Tab页签，或使用直接指定的元素
 */
class NGTreeExpandPanel {
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
      enableAutoExpand: true,
      // 新增：可自定义的选择器配置
      selectors: {
        expandIconCollapsed: ".udp-row-expand-icon-collapsed", // 折叠图标
        expandIconExpanded: ".udp-row-expand-icon-expanded", // 展开图标
        levelRow: ".level-row", // 层级行
        levelPattern: /level-(\d+)/, // 层级正则
      },
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
      targetLevel:
        this.config.defaultState === "collapsed"
          ? 1
          : this.config.defaultState === "level"
            ? this.config.defaultLevel
            : this.config.defaultLevels + 1,
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

    // 观察器
    this.tabObserver = null;
    this.autoExpandObserver = null;
    this.currentOperationContainer = null;
    this._isAutoExpanding = false;
    this._isOperating = false; // 防止操作冲突

    // 初始化组件
    this.init();
  }

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

  init() {
    this._toolbarElement = this._resolveElement(this.config.toolbarSelector);
    if (!this._toolbarElement) {
      console.error(`未找到工具栏容器: ${this.config.toolbarSelector}`);
      return;
    }

    this._containerElement = this._resolveElement(
      this.config.containerSelector,
    );

    this.createPanel();
    this.bindEvents();
    this.initializeDefaultState();

    if (this.config.enableTabSync && !this._containerElement) {
      this.startTabSync();
    }

    if (this.config.enableAutoExpand) {
      this.startAutoExpandObserver();
    }
  }

  _getCurrentContainer() {
    if (
      this.currentOperationContainer &&
      document.body.contains(this.currentOperationContainer)
    ) {
      return this.currentOperationContainer;
    }

    if (
      this._containerElement &&
      document.body.contains(this._containerElement)
    ) {
      return this._containerElement;
    }

    const containers = document.querySelectorAll(this.config.containerSelector);
    if (containers.length === 0) {
      console.warn(`未找到容器元素: ${this.config.containerSelector}`);
      return null;
    }

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

  _syncStateFromContainer(container) {
    if (!container) return;

    const collapsedIcons = container.querySelectorAll(
      this.config.selectors.expandIconCollapsed,
    );
    const expandedIcons = container.querySelectorAll(
      this.config.selectors.expandIconExpanded,
    );

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

    this.state.isExpanded = isFullyExpanded;
    if (this.elements.expandBtn) {
      const btnSpan = this.elements.expandBtn.firstChild;
      if (btnSpan) {
        btnSpan.textContent = isFullyExpanded ? "收起" : "展开";
      }
    }

    let maxLevel = 1;
    const levelRows = container.querySelectorAll(
      this.config.selectors.levelRow,
    );
    levelRows.forEach((row) => {
      const classes = row.className;
      const levelMatch = classes.match(this.config.selectors.levelPattern);
      if (levelMatch) {
        const level = parseInt(levelMatch[1], 10);
        if (level > maxLevel) maxLevel = level;
      }
    });
    this.state.currentLevel = maxLevel;
  }

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
        setTimeout(() => {
          this._syncStateFromCurrentContainer();
          if (this.config.enableAutoExpand) {
            this.startAutoExpandObserver();
          }
        }, 50);
      }
    });

    this.tabObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });
  }

  stopTabSync() {
    if (this.tabObserver) {
      this.tabObserver.disconnect();
      this.tabObserver = null;
    }
  }

  startAutoExpandObserver() {
    if (!this.config.enableAutoExpand) return;
    this.stopAutoExpandObserver();

    const container = this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器，无法启动自动展开观察器");
      return;
    }

    this.autoExpandObserver = new MutationObserver((mutations) => {
      if (this._isAutoExpanding || this._isOperating) return;

      let hasNewNodes = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }

      if (hasNewNodes && this.state.targetLevel > 1) {
        setTimeout(() => {
          this._applyTargetLevelToContainer(container);
        }, this.config.animationDelay);
      }
    });

    this.autoExpandObserver.observe(container, {
      childList: true,
      subtree: true,
    });
  }

  stopAutoExpandObserver() {
    if (this.autoExpandObserver) {
      this.autoExpandObserver.disconnect();
      this.autoExpandObserver = null;
    }
  }

  _applyTargetLevelToContainer(container) {
    if (!container) return;
    const targetLevel = this.state.targetLevel;
    if (targetLevel <= 1) return;

    this._isAutoExpanding = true;

    const rows = container.querySelectorAll(this.config.selectors.levelRow);
    rows.forEach((row) => {
      const levelMatch = row.className.match(
        this.config.selectors.levelPattern,
      );
      if (levelMatch) {
        const currentLevel = parseInt(levelMatch[1], 10);
        if (currentLevel < targetLevel) {
          const expandIcon = row.querySelector(
            this.config.selectors.expandIconCollapsed,
          );
          if (expandIcon && expandIcon.offsetParent !== null) {
            expandIcon.click();
          }
        }
      }
    });

    this._isAutoExpanding = false;
  }

  _updateTargetLevelAndApply(newLevel) {
    this.state.targetLevel = newLevel;
    const container = this._getCurrentContainer();
    if (container && newLevel > 1) {
      setTimeout(() => {
        this._applyTargetLevelToContainer(container);
      }, this.config.animationDelay);
    }
  }

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
    if (expandBtn.firstChild) {
      expandBtn.firstChild.style.color = "#fff";
    }

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

  createLevelInput(container) {
    const expandBtnLeft = this.config.defaultLevels * 40;
    const separatorLeft = expandBtnLeft + 70;
    const toButtonLeft = separatorLeft + 20;
    const inputLeft = toButtonLeft + 50;

    const levelInput = document.createElement("input");
    levelInput.type = "text";
    levelInput.id = "levelInput";
    levelInput.placeholder = `${this.config.defaultLevels + 1}-${this.config.maxCustomLevel}`;
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

  bindEvents() {}

  onLevelButtonClick(level) {
    console.log(`点击层级按钮: ${level}`);

    // 防止快速连续点击
    if (this._isOperating) {
      console.log("操作进行中，请稍后再试");
      return;
    }
    this._isOperating = true;

    this.state.currentLevel = level;
    const targetLevel = level === 1 ? 1 : level - 1;

    if (level === 1) {
      this.collapseAll(null, true);
    } else {
      this.expandToLevel(targetLevel, null, true);
    }

    setTimeout(() => {
      this._isOperating = false;
    }, this.config.animationDelay * 3);
  }

  onExpandButtonClick() {
    if (this._isOperating) return;
    this._isOperating = true;

    this.state.isExpanded = !this.state.isExpanded;

    if (this.state.isExpanded) {
      if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
        this.elements.expandBtn.firstChild.textContent = "收起";
      }
      console.log("执行展开所有操作");
      this.expandAll(null, true);
    } else {
      if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
        this.elements.expandBtn.firstChild.textContent = "展开";
      }
      console.log("执行收起所有操作");
      this.collapseAll(null, true);
    }

    setTimeout(() => {
      this._isOperating = false;
    }, this.config.animationDelay * 3);
  }

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

    const actualLevel = level - 1;
    console.log(`展开到自定义层级: ${level} (实际参数: ${actualLevel})`);
    this._updateTargetLevelAndApply(actualLevel);
    this.expandToLevel(actualLevel, null, true);
  }

  expandToLevel(level = 0, targetContainer = null, updateTargetLevel = true) {
    if (level <= 0) {
      console.log("层级参数无效:", level);
      return;
    }

    if (updateTargetLevel) {
      this._updateTargetLevelAndApply(level);
    }

    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.error("未找到树形容器");
      return;
    }

    console.log(`开始展开到第 ${level} 层`);
    this.currentOperationContainer = container;

    const collapseRecursive = (callback) => {
      const elements = container.querySelectorAll(
        this.config.selectors.expandIconExpanded,
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
        this._syncStateFromContainer(container);
        this.currentOperationContainer = null;
        return;
      }

      const elements = container.querySelectorAll(
        this.config.selectors.expandIconCollapsed,
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
        this._syncStateFromContainer(container);
        this.currentOperationContainer = null;
      }
    };

    collapseRecursive(() => startLevelExpansion());
  }

  expandAll(targetContainer = null, updateTargetLevel = true) {
    if (updateTargetLevel) {
      this._updateTargetLevelAndApply(999);
    }

    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.error("未找到树形容器");
      return;
    }

    console.log("开始展开所有节点");
    this.currentOperationContainer = container;

    const elements = container.querySelectorAll(
      this.config.selectors.expandIconCollapsed,
    );

    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个折叠元素，正在展开...`);
      elements.forEach((el) => el.click());
      setTimeout(
        () => this.expandAll(container, false),
        this.config.animationDelay,
      );
    } else {
      console.log("所有元素已展开");
      this._syncStateFromContainer(container);
      this.currentOperationContainer = null;
    }
  }

  collapseAll(targetContainer = null, updateTargetLevel = true) {
    if (updateTargetLevel) {
      this._updateTargetLevelAndApply(1);
    }

    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.error("未找到树形容器");
      return;
    }

    console.log("开始收起所有节点");
    this.currentOperationContainer = container;

    const elements = container.querySelectorAll(
      this.config.selectors.expandIconExpanded,
    );

    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
      elements.forEach((el) => el.click());
      setTimeout(
        () => this.collapseAll(container, false),
        this.config.animationDelay,
      );
    } else {
      console.log("所有元素已收起");
      this._syncStateFromContainer(container);
      this.currentOperationContainer = null;
    }
  }

  initializeDefaultState() {
    console.log(
      `初始化默认状态: ${this.config.defaultState}, 层级: ${this.config.defaultLevel}`,
    );

    setTimeout(() => {
      const container = this._getCurrentContainer();
      if (!container) {
        console.error("初始化时未找到树形容器");
        return;
      }

      switch (this.config.defaultState) {
        case "collapsed":
          this.collapseAll(container, true);
          this.state.isExpanded = false;
          if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
            this.elements.expandBtn.firstChild.textContent = "展开";
          }
          this.state.currentLevel = 1;
          this.state.targetLevel = 1;
          break;

        case "level":
          if (
            this.config.defaultLevel >= 1 &&
            this.config.defaultLevel <= this.config.defaultLevels
          ) {
            if (this.config.defaultLevel === 1) {
              this.collapseAll(container, true);
              this.state.currentLevel = 1;
              this.state.targetLevel = 1;
            } else {
              this.expandToLevel(this.config.defaultLevel - 1, container, true);
              this.state.currentLevel = this.config.defaultLevel;
              this.state.targetLevel = this.config.defaultLevel - 1;
            }
            this.state.isExpanded = this.config.defaultLevel > 1;
            if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
              this.elements.expandBtn.firstChild.textContent = this.state
                .isExpanded
                ? "收起"
                : "展开";
            }
          } else {
            console.warn(
              `默认层级 ${this.config.defaultLevel} 超出范围，使用层级1`,
            );
            this.collapseAll(container, true);
            this.state.currentLevel = 1;
            this.state.isExpanded = false;
            this.state.targetLevel = 1;
            if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
              this.elements.expandBtn.firstChild.textContent = "展开";
            }
          }
          break;

        case "expanded":
        default:
          this.expandAll(container, true);
          this.state.isExpanded = true;
          if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
            this.elements.expandBtn.firstChild.textContent = "收起";
          }
          this.state.currentLevel = this.config.defaultLevels;
          this.state.targetLevel = 999;
          break;
      }
    }, 200); // 增加延迟确保DOM完全加载
  }

  showToast(message) {
    console.log("提示:", message);
    alert(message);
  }

  setState(state, level) {
    const container = this._getCurrentContainer();
    if (!container) return;

    switch (state) {
      case "collapsed":
        this.collapseAll(container, true);
        this.state.isExpanded = false;
        if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
          this.elements.expandBtn.firstChild.textContent = "展开";
        }
        this.state.currentLevel = 1;
        this.state.targetLevel = 1;
        break;

      case "level":
        if (level && level >= 1 && level <= this.config.maxCustomLevel) {
          if (level === 1) {
            this.collapseAll(container, true);
          } else {
            this.expandToLevel(level - 1, container, true);
          }
          this.state.currentLevel = level;
          this.state.targetLevel = level === 1 ? 1 : level - 1;
          this.state.isExpanded = level > 1;
          if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
            this.elements.expandBtn.firstChild.textContent = this.state
              .isExpanded
              ? "收起"
              : "展开";
          }
        }
        break;

      case "expanded":
        this.expandAll(container, true);
        this.state.isExpanded = true;
        if (this.elements.expandBtn && this.elements.expandBtn.firstChild) {
          this.elements.expandBtn.firstChild.textContent = "收起";
        }
        this.state.currentLevel = this.config.defaultLevels;
        this.state.targetLevel = 999;
        break;
    }
  }

  syncState() {
    this._syncStateFromCurrentContainer();
  }

  updateOptions(newOptions) {
    this.destroy();
    this.config = { ...this.config, ...newOptions };
    this.init();
  }

  destroy() {
    this.stopTabSync();
    this.stopAutoExpandObserver();

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
  }
}

/**
 * 示例用法封装
 */
const NGTreeExpandPanelExample = {
  basic: function (options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "expanded",
      enableTabSync: true,
      enableAutoExpand: true,
    };
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  withElements: function (toolbarElement, containerElement, options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: toolbarElement,
      containerSelector: containerElement,
      defaultState: "expanded",
      enableTabSync: false,
      enableAutoExpand: true,
    };
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  customLevels: function (options = {}) {
    const defaultOptions = {
      defaultLevels: 7,
      maxCustomLevel: 30,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "level",
      defaultLevel: 2,
      enableTabSync: true,
      enableAutoExpand: true,
    };
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  customSelectors: function (toolbarSelector, containerSelector, options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: toolbarSelector || "div.udp-panel-title#_rq_",
      containerSelector:
        containerSelector || ".row-hover.rows-container.editable",
      defaultState: "collapsed",
      enableTabSync: !(containerSelector instanceof HTMLElement),
      enableAutoExpand: true,
    };
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { NGTreeExpandPanel, NGTreeExpandPanelExample };
}

if (typeof window !== "undefined") {
  window.NGTreeExpandPanel = NGTreeExpandPanel;
  window.NGTreeExpandPanelExample = NGTreeExpandPanelExample;
}
