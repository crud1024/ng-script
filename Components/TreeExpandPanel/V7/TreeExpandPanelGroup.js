/**
 * 树形结构展开控制面板（支持多Tab页签 + 直接传入元素 + 自动记忆并展开新数据）
 * 提供树形结构的展开/收起控制功能，自动识别当前激活的Tab页签，或使用直接指定的元素
 * 新增功能：记忆用户选择的展开层级，并通过MutationObserver自动应用到后续动态添加的节点
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
   * @param {boolean} [options.enableAutoExpand=true] - 是否启用自动展开新数据（记忆用户层级）
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
      enableAutoExpand: true, // 新增：是否启用自动展开新数据
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
      // 新增：记忆的目标层级（0表示未设置，1表示全部收起，大于1表示展开到该层级）
      targetLevel:
        this.config.defaultState === "collapsed"
          ? 1
          : this.config.defaultState === "level"
            ? this.config.defaultLevel
            : this.config.defaultLevels + 1, // 展开状态时默认设置一个大于最大按钮数的值
    };

    // DOM元素引用
    this.elements = {
      panel: null,
      panelBody: null,
      levelInput: null,
      expandBtn: null,
      buttons: [],
    };

    // 存储直接传入的元素（用于快速访问，避免重复查找）
    this._toolbarElement = null;
    this._containerElement = null;

    // Tab切换观察器
    this.tabObserver = null;
    // 新增：自动展开观察器
    this.autoExpandObserver = null;
    // 当前正在操作的目标容器（防止异步操作期间Tab切换导致混乱）
    this.currentOperationContainer = null;
    // 新增：防止自动展开递归的标志
    this._isAutoExpanding = false;

    // 初始化组件
    this.init();
  }

  /**
   * 解析配置项，将选择器或元素转换为元素
   * @param {string|HTMLElement} selectorOrElement - 选择器或元素
   * @param {string} defaultValue - 默认选择器（如果为undefined则返回null）
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

    // 启动自动展开监听（如果启用）
    if (this.config.enableAutoExpand) {
      this.startAutoExpandObserver();
    }
  }

  /**
   * 获取当前激活Tab页签中的树形容器，或直接返回用户指定的容器
   * @returns {HTMLElement|null} 当前应操作的容器元素
   * @private
   */
  _getCurrentContainer() {
    // 如果正在进行操作且有记录的操作容器，优先使用操作容器（防止异步操作期间Tab切换）
    if (
      this.currentOperationContainer &&
      document.body.contains(this.currentOperationContainer)
    ) {
      return this.currentOperationContainer;
    }

    // 如果用户直接指定了容器元素，则直接返回该元素（不跟随Tab）
    if (
      this._containerElement &&
      document.body.contains(this._containerElement)
    ) {
      return this._containerElement;
    }

    // 否则根据选择器查找所有匹配的容器，并找到位于激活Tab页签中的容器
    const containers = document.querySelectorAll(this.config.containerSelector);
    if (containers.length === 0) return null;

    for (const container of containers) {
      // 查找最近的tabpane祖先
      const tabPane = container.closest(".ant-tabs-tabpane");
      if (tabPane) {
        // 检查是否为激活的tabpane
        const isActive =
          tabPane.classList.contains("ant-tabs-tabpane-active") &&
          getComputedStyle(tabPane).display !== "none";
        if (isActive) {
          return container;
        }
      } else {
        // 不在Tab组件内，使用第一个容器（兼容老场景）
        return containers[0];
      }
    }

    // 未找到激活Tab中的容器，回退到第一个
    return containers[0];
  }

  /**
   * 从容器同步面板状态（按钮文本、展开状态）
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
      // 没有折叠图标，有展开图标 => 全部展开
      isFullyExpanded = true;
      isFullyCollapsed = false;
    } else if (expandedIcons.length === 0 && collapsedIcons.length > 0) {
      // 没有展开图标，有折叠图标 => 全部折叠
      isFullyExpanded = false;
      isFullyCollapsed = true;
    } else {
      // 混合状态，默认为部分展开（按钮显示"展开"）
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

    // 尝试估算当前层级（简单估算：查找最深节点的层级）
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

    // 监听整个文档的class变化，检测Tab页签的激活状态变化
    this.tabObserver = new MutationObserver((mutations) => {
      let needSync = false;
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const target = mutation.target;
          // 检查是否是tabpane且class变化涉及激活类
          if (
            target.classList &&
            (target.classList.contains("ant-tabs-tabpane") ||
              target.closest(".ant-tabs-tabpane"))
          ) {
            // 延迟同步，等待DOM完全更新
            needSync = true;
            break;
          }
        }
      }
      if (needSync) {
        setTimeout(() => {
          this._syncStateFromCurrentContainer();
          // 切换Tab后，重新启动自动展开观察器（如果启用）
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

  // ========== 新增：自动展开相关方法 ==========

  /**
   * 启动自动展开观察器（监听容器内新增节点并自动展开到目标层级）
   * @private
   */
  startAutoExpandObserver() {
    if (!this.config.enableAutoExpand) return;
    // 如果已有观察器，先停止
    this.stopAutoExpandObserver();

    const container = this._getCurrentContainer();
    if (!container) return;

    // 创建MutationObserver监听子节点变化
    this.autoExpandObserver = new MutationObserver((mutations) => {
      if (this._isAutoExpanding) return; // 防止递归
      // 检查是否有新增节点
      let hasNewNodes = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (hasNewNodes && this.state.targetLevel > 1) {
        // 延迟执行，确保新节点已完全渲染
        setTimeout(() => {
          this._applyTargetLevelToContainer(container);
        }, this.config.animationDelay);
      }
    });

    // 观察容器的子节点变化（包括子树）
    this.autoExpandObserver.observe(container, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 停止自动展开观察器
   * @private
   */
  stopAutoExpandObserver() {
    if (this.autoExpandObserver) {
      this.autoExpandObserver.disconnect();
      this.autoExpandObserver = null;
    }
  }

  /**
   * 将当前目标层级应用到指定容器的所有节点
   * @param {HTMLElement} container - 目标容器
   * @private
   */
  _applyTargetLevelToContainer(container) {
    if (!container) return;
    const targetLevel = this.state.targetLevel;
    if (targetLevel <= 1) return; // 无需展开

    this._isAutoExpanding = true;

    // 获取所有行节点（根据实际DOM结构选择合适的选择器）
    const rows = container.querySelectorAll(".level-row");
    rows.forEach((row) => {
      // 获取当前行的层级
      const levelMatch = row.className.match(/level-(\d+)/);
      if (levelMatch) {
        const currentLevel = parseInt(levelMatch[1], 10);
        // 如果当前层级小于目标层级，且该节点有折叠图标（即尚未展开），则尝试展开
        if (currentLevel < targetLevel) {
          const expandIcon = row.querySelector(
            ".udp-row-expand-icon.udp-row-expand-icon-collapsed",
          );
          if (expandIcon && expandIcon.offsetParent !== null) {
            // 只展开可见节点（防止展开不可见节点导致性能问题）
            expandIcon.click();
          }
        }
      }
    });

    this._isAutoExpanding = false;
  }

  /**
   * 更新目标层级并应用到当前容器
   * @param {number} newLevel - 新的目标层级（1表示全部收起，大于1表示展开到该层）
   * @private
   */
  _updateTargetLevelAndApply(newLevel) {
    this.state.targetLevel = newLevel;
    const container = this._getCurrentContainer();
    if (container && newLevel > 1) {
      this._applyTargetLevelToContainer(container);
    }
  }

  // ========== 原有方法（已修改部分逻辑） ==========

  /**
   * 创建面板DOM结构（未修改，省略）
   * ... 此处保留原有所有创建UI的方法 ...
   */

  // 为了节省篇幅，中间原有的 createPanel, createLevelButtons, createButton, createExpandButton,
  // createSeparator, createToButton, createLevelInput, createLayerLabel, insertPanel,
  // bindEvents 等方法保持不变，这里省略。
  // 注意：实际使用时需要将下面注释的原有方法完整保留。

  /**
   * 层级按钮点击事件处理（修改：记忆层级并自动应用）
   * @param {number} level - 层级
   * @private
   */
  onLevelButtonClick(level) {
    console.log(`点击了层级按钮: ${level}`);
    this.state.currentLevel = level;

    // 更新目标层级（实际展开层级为 level-1）
    const targetLevel = level === 1 ? 1 : level - 1;
    this._updateTargetLevelAndApply(targetLevel);

    // 同步按钮状态
    if (level === 1) {
      this.state.isExpanded = false;
      if (this.elements.expandBtn) {
        this.elements.expandBtn.firstChild.textContent = "展开";
      }
    } else {
      this.state.isExpanded = true;
      if (this.elements.expandBtn) {
        this.elements.expandBtn.firstChild.textContent = "收起";
      }
    }
  }

  /**
   * 展开按钮点击事件处理（修改：记忆层级）
   * @private
   */
  onExpandButtonClick() {
    this.state.isExpanded = !this.state.isExpanded;

    if (this.state.isExpanded) {
      this.elements.expandBtn.firstChild.textContent = "收起";
      console.log("执行了展开操作");
      // 全部展开：目标层级设为一个大数（如999）
      this._updateTargetLevelAndApply(999);
    } else {
      this.elements.expandBtn.firstChild.textContent = "展开";
      console.log("执行了收起操作");
      // 全部收起：目标层级设为1
      this._updateTargetLevelAndApply(1);
    }

    console.log("当前展开状态:", this.state.isExpanded);
  }

  /**
   * To按钮点击事件处理（修改：记忆层级）
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
    this._updateTargetLevelAndApply(actualLevel);
  }

  /**
   * 展开到指定层级（修改：支持更新目标层级标志）
   * @param {number} level - 要展开到的层级
   * @param {HTMLElement} [targetContainer] - 目标容器（可选，用于递归时保持同一容器）
   * @param {boolean} [updateTargetLevel=true] - 是否更新目标层级记忆
   */
  expandToLevel(level = 0, targetContainer = null, updateTargetLevel = true) {
    if (level <= 0) return;

    if (updateTargetLevel) {
      this._updateTargetLevelAndApply(level);
    }

    // 记录当前操作的容器，防止异步操作期间Tab切换
    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器");
      return;
    }
    this.currentOperationContainer = container;

    const collapseRecursive = (callback) => {
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
        this._syncStateFromContainer(container);
        this.currentOperationContainer = null;
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
        this._syncStateFromContainer(container);
        this.currentOperationContainer = null;
      }
    };

    collapseRecursive(() => startLevelExpansion());
  }

  /**
   * 展开所有元素（修改：支持更新目标层级标志）
   * @param {HTMLElement} [targetContainer] - 目标容器（可选，用于递归时保持同一容器）
   * @param {boolean} [updateTargetLevel=true] - 是否更新目标层级记忆
   */
  expandAll(targetContainer = null, updateTargetLevel = true) {
    if (updateTargetLevel) {
      this._updateTargetLevelAndApply(999);
    }

    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器");
      return;
    }
    this.currentOperationContainer = container;

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-collapsed",
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

  /**
   * 收起所有元素（修改：支持更新目标层级标志）
   * @param {HTMLElement} [targetContainer] - 目标容器（可选，用于递归时保持同一容器）
   * @param {boolean} [updateTargetLevel=true] - 是否更新目标层级记忆
   */
  collapseAll(targetContainer = null, updateTargetLevel = true) {
    if (updateTargetLevel) {
      this._updateTargetLevelAndApply(1);
    }

    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器");
      return;
    }
    this.currentOperationContainer = container;

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-expanded",
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

  /**
   * 初始化默认状态（修改：同时设置目标层级）
   * @private
   */
  initializeDefaultState() {
    console.log(
      `初始化默认状态: ${this.config.defaultState}, 层级: ${this.config.defaultLevel}`,
    );

    setTimeout(() => {
      const container = this._getCurrentContainer();
      if (!container) return;

      switch (this.config.defaultState) {
        case "collapsed":
          this.collapseAll(container, true);
          this.state.isExpanded = false;
          if (this.elements.expandBtn) {
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
            if (this.elements.expandBtn) {
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
            if (this.elements.expandBtn) {
              this.elements.expandBtn.firstChild.textContent = "展开";
            }
          }
          break;

        case "expanded":
        default:
          this.expandAll(container, true);
          this.state.isExpanded = true;
          if (this.elements.expandBtn) {
            this.elements.expandBtn.firstChild.textContent = "收起";
          }
          this.state.currentLevel = this.config.defaultLevels;
          this.state.targetLevel = 999; // 全部展开
          break;
      }
    }, 100);
  }

  /**
   * 显示提示信息（未修改）
   * @param {string} message - 提示消息
   * @private
   */
  showToast(message) {
    console.log("提示:", message);
    alert(message);
  }

  /**
   * 设置面板状态（修改：同时设置目标层级）
   * @param {string} state - 状态 ('collapsed' | 'level' | 'expanded')
   * @param {number} [level] - 层级（当state='level'时有效）
   */
  setState(state, level) {
    const container = this._getCurrentContainer();
    if (!container) return;

    switch (state) {
      case "collapsed":
        this.collapseAll(container, true);
        this.state.isExpanded = false;
        if (this.elements.expandBtn) {
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
          if (this.elements.expandBtn) {
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
        if (this.elements.expandBtn) {
          this.elements.expandBtn.firstChild.textContent = "收起";
        }
        this.state.currentLevel = this.config.defaultLevels;
        this.state.targetLevel = 999;
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
   * 更新配置（修改：重启自动展开观察器）
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
   * 销毁组件（修改：停止自动展开观察器）
   */
  destroy() {
    // 停止Tab监听
    this.stopTabSync();
    // 停止自动展开监听
    this.stopAutoExpandObserver();

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

    this._toolbarElement = null;
    this._containerElement = null;
    this.currentOperationContainer = null;
  }
}

// 以下保持原有的示例封装和导出部分不变
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
