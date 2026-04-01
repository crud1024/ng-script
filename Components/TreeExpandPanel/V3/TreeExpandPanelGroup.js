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
   * @param {boolean} [options.useDataModel=true] - 是否使用数据模型操作（推荐true）
   * @param {string} [options.dataSourceGetter] - 数据源获取函数（用于获取树形数据）
   * @param {string} [options.rowSelector='.ant-tree-node'] - 树节点的选择器
   * @param {boolean} [options.autoScroll=true] - 是否自动滚动加载所有节点
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
      useDataModel: true,
      dataSourceGetter: null,
      rowSelector: ".ant-tree-node",
      autoScroll: true,
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
    // 当前正在操作的目标容器（防止异步操作期间Tab切换导致混乱）
    this.currentOperationContainer = null;

    // 数据模型相关
    this.dataModel = null;
    this.nodeClickHandler = null;

    // 滚动加载相关
    this.scrollTimer = null;

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
   * 获取树形数据源
   * @param {HTMLElement} container - 容器元素
   * @returns {Array|null} 树形数据
   * @private
   */
  _getTreeData(container) {
    if (
      this.config.dataSourceGetter &&
      typeof this.config.dataSourceGetter === "function"
    ) {
      return this.config.dataSourceGetter(container);
    }

    // 尝试从常见的框架中获取数据
    // 尝试从React Fiber获取数据
    try {
      const reactKey = Object.keys(container).find(
        (key) =>
          key.startsWith("__reactFiber$") ||
          key.startsWith("__reactInternalInstance$"),
      );
      if (reactKey && container[reactKey]) {
        let fiber = container[reactKey];
        // 向上查找包含stateNode的fiber
        while (fiber && !fiber.stateNode) {
          fiber = fiber.return;
        }
        if (fiber && fiber.stateNode && fiber.stateNode.props) {
          // 尝试获取dataSource或treeData
          const props = fiber.stateNode.props;
          if (props.dataSource) return props.dataSource;
          if (props.treeData) return props.treeData;
          if (props.data) return props.data;
        }
      }
    } catch (e) {
      console.warn("无法从React组件获取数据", e);
    }

    // 尝试从Vue实例获取数据
    try {
      const vueKey = Object.keys(container).find((key) =>
        key.startsWith("__vue"),
      );
      if (vueKey && container[vueKey]) {
        const vm = container[vueKey];
        if (vm.dataSource) return vm.dataSource;
        if (vm.treeData) return vm.treeData;
        if (vm.$props && vm.$props.dataSource) return vm.$props.dataSource;
      }
    } catch (e) {
      console.warn("无法从Vue组件获取数据", e);
    }

    console.warn("无法获取树形数据源，将使用DOM操作方式");
    return null;
  }

  /**
   * 通过数据模型展开到指定层级
   * @param {Array} data - 树形数据
   * @param {number} targetLevel - 目标层级
   * @param {number} currentLevel - 当前层级
   * @returns {Array} 处理后的数据
   * @private
   */
  _expandDataToLevel(data, targetLevel, currentLevel = 1) {
    if (!data || !Array.isArray(data)) return data;

    if (currentLevel >= targetLevel) {
      // 达到目标层级，折叠所有子节点
      return data.map((item) => ({
        ...item,
        expanded: false,
        children: item.children
          ? this._expandDataToLevel(
              item.children,
              targetLevel,
              currentLevel + 1,
            )
          : item.children,
      }));
    } else {
      // 未达到目标层级，展开当前节点
      return data.map((item) => ({
        ...item,
        expanded: true,
        children: item.children
          ? this._expandDataToLevel(
              item.children,
              targetLevel,
              currentLevel + 1,
            )
          : item.children,
      }));
    }
  }

  /**
   * 通过数据模型折叠所有节点
   * @param {Array} data - 树形数据
   * @returns {Array} 处理后的数据
   * @private
   */
  _collapseAllData(data) {
    if (!data || !Array.isArray(data)) return data;

    return data.map((item) => ({
      ...item,
      expanded: false,
      children: item.children
        ? this._collapseAllData(item.children)
        : item.children,
    }));
  }

  /**
   * 通过数据模型展开所有节点
   * @param {Array} data - 树形数据
   * @param {number} maxLevel - 最大层级限制
   * @param {number} currentLevel - 当前层级
   * @returns {Array} 处理后的数据
   * @private
   */
  _expandAllData(data, maxLevel = 10, currentLevel = 1) {
    if (!data || !Array.isArray(data)) return data;

    if (currentLevel >= maxLevel) {
      return data;
    }

    return data.map((item) => ({
      ...item,
      expanded: true,
      children: item.children
        ? this._expandAllData(item.children, maxLevel, currentLevel + 1)
        : item.children,
    }));
  }

  /**
   * 触发数据更新（通过模拟事件或直接调用组件方法）
   * @param {HTMLElement} container - 容器元素
   * @param {Array} newData - 新数据
   * @private
   */
  _triggerDataUpdate(container, newData) {
    if (!container || !newData) return;

    // 尝试触发React组件更新
    try {
      const reactKey = Object.keys(container).find(
        (key) =>
          key.startsWith("__reactFiber$") ||
          key.startsWith("__reactInternalInstance$"),
      );
      if (reactKey && container[reactKey]) {
        let fiber = container[reactKey];
        while (fiber && !fiber.stateNode) {
          fiber = fiber.return;
        }
        if (fiber && fiber.stateNode) {
          // 尝试调用setState或setData
          if (fiber.stateNode.setState) {
            fiber.stateNode.setState({
              dataSource: newData,
              treeData: newData,
            });
          }
          if (fiber.stateNode.setData) {
            fiber.stateNode.setData(newData);
          }
          // 触发props更新
          if (fiber.stateNode.props && fiber.stateNode.props.onChange) {
            fiber.stateNode.props.onChange(newData);
          }
        }
      }
    } catch (e) {
      console.warn("无法触发React组件更新", e);
    }

    // 尝试触发Vue组件更新
    try {
      const vueKey = Object.keys(container).find((key) =>
        key.startsWith("__vue"),
      );
      if (vueKey && container[vueKey]) {
        const vm = container[vueKey];
        if (vm.$set) {
          if (vm.dataSource) vm.$set(vm, "dataSource", newData);
          if (vm.treeData) vm.$set(vm, "treeData", newData);
        } else {
          if (vm.dataSource) vm.dataSource = newData;
          if (vm.treeData) vm.treeData = newData;
        }
      }
    } catch (e) {
      console.warn("无法触发Vue组件更新", e);
    }

    // 触发自定义事件
    const updateEvent = new CustomEvent("tree-data-update", {
      detail: { data: newData },
    });
    container.dispatchEvent(updateEvent);
  }

  /**
   * 滚动加载所有节点
   * @param {HTMLElement} container - 容器元素
   * @returns {Promise} 滚动完成的Promise
   * @private
   */
  _scrollToLoadAll(container) {
    return new Promise((resolve) => {
      if (!this.config.autoScroll || !container) {
        resolve();
        return;
      }

      // 查找可滚动容器
      let scrollContainer = container;
      while (
        scrollContainer &&
        scrollContainer.scrollHeight === scrollContainer.clientHeight
      ) {
        scrollContainer = scrollContainer.parentElement;
        if (scrollContainer === document.body) break;
      }

      if (
        !scrollContainer ||
        scrollContainer.scrollHeight <= scrollContainer.clientHeight
      ) {
        resolve();
        return;
      }

      let currentScrollTop = 0;
      const maxScrollTop =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const scrollStep = 100;

      const scrollInterval = setInterval(() => {
        if (currentScrollTop >= maxScrollTop) {
          clearInterval(scrollInterval);
          resolve();
        } else {
          currentScrollTop = Math.min(
            currentScrollTop + scrollStep,
            maxScrollTop,
          );
          scrollContainer.scrollTop = currentScrollTop;
        }
      }, 50);

      // 设置超时，避免无限滚动
      setTimeout(() => {
        clearInterval(scrollInterval);
        resolve();
      }, 5000);
    });
  }

  /**
   * 通过DOM模拟点击进行展开（降级方案）
   * @param {HTMLElement} container - 容器元素
   * @param {Function} clickAction - 点击动作函数
   * @param {number} maxIterations - 最大迭代次数
   * @param {number} currentIteration - 当前迭代次数
   * @private
   */
  _operateByDOM(
    container,
    clickAction,
    maxIterations = 50,
    currentIteration = 0,
  ) {
    if (this.state.isOperating) {
      setTimeout(
        () =>
          this._operateByDOM(
            container,
            clickAction,
            maxIterations,
            currentIteration,
          ),
        100,
      );
      return;
    }

    this.state.isOperating = true;

    const elements = container.querySelectorAll(clickAction.selector);

    if (elements.length === 0 || currentIteration >= maxIterations) {
      console.log(`${clickAction.name}操作完成`);
      this.state.isOperating = false;
      this._syncStateFromContainer(container);
      this.currentOperationContainer = null;
      return;
    }

    console.log(`${clickAction.name}操作，找到 ${elements.length} 个元素`);
    elements.forEach((el) => {
      if (clickAction.filter && !clickAction.filter(el)) return;
      el.click();
    });

    setTimeout(() => {
      this._operateByDOM(
        container,
        clickAction,
        maxIterations,
        currentIteration + 1,
      );
    }, this.config.animationDelay);
  }

  /**
   * 通过数据模型操作树形结构
   * @param {HTMLElement} container - 容器元素
   * @param {string} operation - 操作类型 ('expandToLevel', 'expandAll', 'collapseAll')
   * @param {number} level - 层级（用于expandToLevel）
   * @private
   */
  async _operateByDataModel(container, operation, level = 0) {
    if (this.state.isOperating) {
      console.log("操作进行中，请稍后再试");
      return;
    }

    this.state.isOperating = true;
    this.currentOperationContainer = container;

    try {
      // 先滚动加载所有节点（如果启用）
      if (this.config.autoScroll) {
        await this._scrollToLoadAll(container);
      }

      // 尝试获取数据模型
      let treeData = this._getTreeData(container);

      if (treeData && this.config.useDataModel) {
        // 使用数据模型操作
        let newData;

        switch (operation) {
          case "expandToLevel":
            if (level <= 0) {
              newData = this._collapseAllData(treeData);
            } else {
              newData = this._expandDataToLevel(treeData, level);
            }
            break;
          case "expandAll":
            newData = this._expandAllData(treeData, this.config.maxCustomLevel);
            break;
          case "collapseAll":
            newData = this._collapseAllData(treeData);
            break;
          default:
            newData = treeData;
        }

        if (newData !== treeData) {
          // 触发数据更新
          this._triggerDataUpdate(container, newData);

          // 等待DOM更新完成
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        console.log(`数据模型操作完成: ${operation}`);
        this._syncStateFromContainer(container);
      } else {
        // 降级到DOM操作
        console.log("降级到DOM操作模式");
        let clickAction;

        switch (operation) {
          case "expandToLevel":
            if (level <= 0) {
              clickAction = {
                name: "收起所有",
                selector: ".udp-row-expand-icon.udp-row-expand-icon-expanded",
              };
            } else {
              // 对于展开到指定层级，需要先全部收起再逐层展开
              await new Promise((resolve) => {
                this._operateByDOM(
                  container,
                  {
                    name: "收起所有",
                    selector:
                      ".udp-row-expand-icon.udp-row-expand-icon-expanded",
                  },
                  30,
                  0,
                );
                setTimeout(resolve, this.config.animationDelay * 3);
              });

              // 逐层展开
              for (let i = 0; i < level; i++) {
                await new Promise((resolve) => {
                  this._operateByDOM(
                    container,
                    {
                      name: `展开第${i + 1}层`,
                      selector:
                        ".udp-row-expand-icon.udp-row-expand-icon-collapsed",
                    },
                    30,
                    0,
                  );
                  setTimeout(resolve, this.config.animationDelay);
                });
              }

              this.state.isOperating = false;
              this.currentOperationContainer = null;
              this._syncStateFromContainer(container);
              return;
            }
            break;
          case "expandAll":
            clickAction = {
              name: "展开所有",
              selector: ".udp-row-expand-icon.udp-row-expand-icon-collapsed",
            };
            break;
          case "collapseAll":
            clickAction = {
              name: "收起所有",
              selector: ".udp-row-expand-icon.udp-row-expand-icon-expanded",
            };
            break;
          default:
            this.state.isOperating = false;
            this.currentOperationContainer = null;
            return;
        }

        this._operateByDOM(container, clickAction, 50, 0);
      }
    } catch (error) {
      console.error(`操作失败: ${operation}`, error);
      this.state.isOperating = false;
      this.currentOperationContainer = null;
    }
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
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
      // 'after'
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
    this.state.currentLevel = level;
    console.log("当前层级状态:", this.state);

    const container = this._getCurrentContainer();
    if (!container) return;

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
    this.state.isExpanded = !this.state.isExpanded;

    const container = this._getCurrentContainer();
    if (!container) return;

    if (this.state.isExpanded) {
      this.elements.expandBtn.firstChild.textContent = "收起";
      console.log("执行了展开操作");
      this.expandAll(container);
    } else {
      this.elements.expandBtn.firstChild.textContent = "展开";
      console.log("执行了收起操作");
      this.collapseAll(container);
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

    const container = this._getCurrentContainer();
    if (container) {
      this.expandToLevel(actualLevel, container);
    }
  }

  /**
   * 展开到指定层级
   * @param {number} level - 要展开到的层级
   * @param {HTMLElement} [targetContainer] - 目标容器（可选，用于递归时保持同一容器）
   */
  async expandToLevel(level = 0, targetContainer = null) {
    if (level <= 0) return;

    // 记录当前操作的容器，防止异步操作期间Tab切换
    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器");
      return;
    }

    await this._operateByDataModel(container, "expandToLevel", level);
  }

  /**
   * 展开所有元素
   * @param {HTMLElement} [targetContainer] - 目标容器（可选，用于递归时保持同一容器）
   */
  async expandAll(targetContainer = null) {
    // 记录当前操作的容器，防止异步操作期间Tab切换
    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器");
      return;
    }

    await this._operateByDataModel(container, "expandAll");
  }

  /**
   * 收起所有元素
   * @param {HTMLElement} [targetContainer] - 目标容器（可选，用于递归时保持同一容器）
   */
  async collapseAll(targetContainer = null) {
    // 记录当前操作的容器，防止异步操作期间Tab切换
    const container = targetContainer || this._getCurrentContainer();
    if (!container) {
      console.log("未找到容器");
      return;
    }

    await this._operateByDataModel(container, "collapseAll");
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
    setTimeout(async () => {
      // 先获取当前容器（此时为默认激活的Tab）
      const container = this._getCurrentContainer();
      if (!container) return;

      switch (this.config.defaultState) {
        case "collapsed":
          await this.collapseAll(container);
          this.state.isExpanded = false;
          if (this.elements.expandBtn) {
            this.elements.expandBtn.firstChild.textContent = "展开";
          }
          this.state.currentLevel = 1;
          break;

        case "level":
          if (
            this.config.defaultLevel >= 1 &&
            this.config.defaultLevel <= this.config.defaultLevels
          ) {
            if (this.config.defaultLevel === 1) {
              await this.collapseAll(container);
              this.state.currentLevel = 1;
            } else {
              await this.expandToLevel(this.config.defaultLevel - 1, container);
              this.state.currentLevel = this.config.defaultLevel;
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
            await this.collapseAll(container);
            this.state.currentLevel = 1;
            this.state.isExpanded = false;
            if (this.elements.expandBtn) {
              this.elements.expandBtn.firstChild.textContent = "展开";
            }
          }
          break;

        case "expanded":
        default:
          await this.expandAll(container);
          this.state.isExpanded = true;
          if (this.elements.expandBtn) {
            this.elements.expandBtn.firstChild.textContent = "收起";
          }
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
    alert(message);
  }

  /**
   * 设置面板状态
   * @param {string} state - 状态 ('collapsed' | 'level' | 'expanded')
   * @param {number} [level] - 层级（当state='level'时有效）
   */
  async setState(state, level) {
    const container = this._getCurrentContainer();
    if (!container) return;

    switch (state) {
      case "collapsed":
        await this.collapseAll(container);
        this.state.isExpanded = false;
        if (this.elements.expandBtn) {
          this.elements.expandBtn.firstChild.textContent = "展开";
        }
        this.state.currentLevel = 1;
        break;

      case "level":
        if (level && level >= 1 && level <= this.config.maxCustomLevel) {
          if (level === 1) {
            await this.collapseAll(container);
          } else {
            await this.expandToLevel(level - 1, container);
          }
          this.state.currentLevel = level;
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
        await this.expandAll(container);
        this.state.isExpanded = true;
        if (this.elements.expandBtn) {
          this.elements.expandBtn.firstChild.textContent = "收起";
        }
        this.state.currentLevel = this.config.defaultLevels;
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
    // 停止Tab监听
    this.stopTabSync();

    // 清除滚动定时器
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }

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
    this.dataModel = null;
    this.state.isOperating = false;
  }
}

/**
 * 示例用法封装
 */
const NGTreeExpandPanelExample = {
  /**
   * 基础示例（支持多Tab，使用选择器）
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
      useDataModel: true,
      autoScroll: true,
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
      enableTabSync: false, // 指定具体元素时自动禁用Tab同步
      useDataModel: true,
      autoScroll: true,
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
      useDataModel: true,
      autoScroll: true,
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
      enableTabSync: !(containerSelector instanceof HTMLElement), // 如果是元素则禁用同步
      useDataModel: true,
      autoScroll: true,
    };

    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  /**
   * 手动指定数据源获取函数示例
   * @param {Function} dataSourceGetter - 数据源获取函数
   * @param {Object} options - 配置选项
   * @returns {NGTreeExpandPanel} 组件实例
   */
  withDataSource: function (dataSourceGetter, options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "expanded",
      enableTabSync: true,
      useDataModel: true,
      autoScroll: true,
      dataSourceGetter: dataSourceGetter,
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
