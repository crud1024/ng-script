//新复合统计组件
/**
 * 动态信息展示组件
 * 支持动态传递容器、汇总信息和流程配置
 */
class NewDynamicInfoDisplay {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {HTMLElement|string} options.container - 容器元素或元素ID
   * @param {Array} [options.displayConfigs] - 汇总信息配置
   * @param {Array} [options.processConfigs] - 流程配置
   * @param {string} [options.activeProcessKey] - 当前激活的流程key
   * @param {string} [options.titleFontSize] - 标题字体大小
   * @param {string} [options.mobileTitleFontSize] - 移动端标题字体大小
   */
  constructor(options) {
    this.initProperties(options);
    this.init();
  }

  /**
   * 初始化属性
   */
  initProperties(options) {
    // 获取容器元素
    if (typeof options.container === "string") {
      this.container = document.getElementById(options.container);
    } else {
      this.container = options.container;
    }

    if (!this.container) {
      console.error("未找到容器元素");
      return;
    }

    // 存储配置
    this.displayConfigs = options.displayConfigs || [];
    this.processConfigs = options.processConfigs || [];
    this.activeProcessKey = options.activeProcessKey || "";

    // 存储字体大小配置
    this.titleFontSize = options.titleFontSize || "18px";
    this.mobileTitleFontSize = options.mobileTitleFontSize || "12px";

    // 折叠状态
    this.isDisplayCollapsed = false;
    this.isProcessCollapsed = false;

    // 默认图标
    this.defaultIcons = {
      main: '<svg t="1761536545835" class="icon" viewBox="0 0 1253 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4719" width="30" height="30"><path d="M606.239041 847.928236H163.181714A163.300305 163.300305 0 0 1 0 684.865113v-521.801991A163.300305 163.300305 0 0 1 163.181714 0h770.84385a163.300305 163.300305 0 0 1 162.588757 163.063122V416.255679a23.718272 23.718272 0 0 1-46.606405 0V163.063122a116.6939 116.6939 0 0 0-116.575309-116.456717h-770.84385a116.6939 116.6939 0 0 0-116.575309 116.456717v521.801991a116.6939 116.6939 0 0 0 116.575309 116.456717h443.650284a23.718272 23.718272 0 1 1 0 46.606406z" fill="#3A77D9" p-id="4720"></path><path d="M64.039335 914.932355m22.176585 0l763.254003 0q22.176585 0 22.176585 22.176584l0 0.118592q0 22.176585-22.176585 22.176584l-763.254003 0q-22.176585 0-22.176585-22.176584l0-0.118592q0-22.176585 22.176585-22.176584Z" fill="#3A77D9" p-id="4721"></path><path d="M123.335016 227.102457m22.176585 0l598.174828 0q22.176585 0 22.176584 22.176585l0 0.118591q0 22.176585-22.176584 22.176585l-598.174828 0q-22.176585 0-22.176585-22.176585l0-0.118591q0-22.176585 22.176585-22.176585Z" fill="#3A77D9" p-id="4722"></path><path d="M123.335016 382.694324m22.176585 0l471.756436 0q22.176585 0 22.176585 22.176585l0 0.118591q0 22.176585-22.176585 22.176585l-471.756436 0q-22.176585 0-22.176585-22.176585l0-0.118591q0-22.176585 22.176585-22.176585Z" fill="#3A77D9" p-id="4723"></path><path d="M123.335016 538.404782m22.176585 0l298.73164 0q22.176585 0 22.176584 22.176584l0 0.118592q0 22.176585-22.176584 22.176584l-298.73164 0q-22.176585 0-22.176585-22.176584l0-0.118592q0-22.176585 22.176585-22.176584Z" fill="#3A77D9" p-id="4724"></path><path d="M846.505139 474.365446a120.251641 120.251641 0 1 1-120.133049 120.251641A120.370232 120.370232 0 0 1 846.505139 474.365446m0-59.29568a179.42873 179.42873 0 1 0 179.42873 179.547321A179.42873 179.42873 0 0 0 846.505139 415.069766z" fill="#3A77D9" p-id="4725"></path><path d="M922.555993 730.311643m20.964189-20.964189l10.398237-10.398237q20.964189-20.964189 41.928378 0l177.86018 177.860179q20.964189 20.964189 0 41.928378l-10.398238 10.398238q-20.964189 20.964189-41.928378 0l-177.860179-177.86018q-20.964189-20.964189 0-41.928378Z" fill="#3A77D9" p-id="4726"></path></svg>',
      risk: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L15 14H1L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>',
    };

    // 风险提示框实例
    this.riskTooltip = null;
    this.contentContainer = null;
  }

  /**
   * 初始化组件
   */
  init() {
    // 清空容器
    this.container.innerHTML = "";

    // 添加样式
    this.addStyles();

    // 创建内容容器
    this.contentContainer = document.createElement("div");
    this.contentContainer.className = "dynamic-info-container";
    this.container.appendChild(this.contentContainer);

    // 创建风险提示框
    this.createRiskTooltip();

    // 渲染内容
    this.render();

    // 同步流程状态
    setTimeout(() => this.syncProcessWithTabs(), 100);
  }

  /**
   * 创建风险提示框
   */
  createRiskTooltip() {
    this.riskTooltip = document.createElement("div");
    this.riskTooltip.className = "risk-tooltip";
    this.riskTooltip.style.display = "none";
    document.body.appendChild(this.riskTooltip);
  }

  /**
   * 显示风险提示框
   * @param {Object} config - 配置对象
   * @param {HTMLElement} target - 目标元素
   */
  showRiskTooltip(config, target) {
    if (!this.riskTooltip) return;

    // 获取风险详情数据
    const riskDetails =
      config.riskDetails || this.getDefaultRiskDetails(config);

    // 构建提示框内容
    let tooltipContent = `<div class="risk-tooltip-title">${config.title || config.name} - 风险详情</div>`;

    riskDetails.forEach((detail) => {
      tooltipContent += `
                <div class="risk-detail-item">
                    <span class="risk-level risk-level-${detail.level || "medium"}">
                        ${detail.level === "high" ? "高" : detail.level === "low" ? "低" : "中"}
                    </span>
                    <span class="risk-desc">${detail.description}</span>
                </div>
            `;
    });

    this.riskTooltip.innerHTML = tooltipContent;
    this.riskTooltip.style.display = "block";

    // 定位提示框
    this.positionTooltip(target);
  }

  /**
   * 隐藏风险提示框
   */
  hideRiskTooltip() {
    if (this.riskTooltip) {
      this.riskTooltip.style.display = "none";
    }
  }

  /**
   * 定位提示框
   * @param {HTMLElement} target - 目标元素
   */
  positionTooltip(target) {
    if (!this.riskTooltip || !target) return;

    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    // 计算位置 - 在元素上方显示
    let top = rect.top + scrollTop - this.riskTooltip.offsetHeight - 10;
    let left =
      rect.left +
      scrollLeft +
      rect.width / 2 -
      this.riskTooltip.offsetWidth / 2;

    // 边界检查
    if (top < 10) {
      top = rect.bottom + scrollTop + 10; // 如果上方空间不足，显示在下方
    }
    if (left < 10) {
      left = 10;
    }
    if (left + this.riskTooltip.offsetWidth > window.innerWidth - 10) {
      left = window.innerWidth - this.riskTooltip.offsetWidth - 10;
    }

    this.riskTooltip.style.top = top + "px";
    this.riskTooltip.style.left = left + "px";
  }

  /**
   * 获取默认风险详情
   * @param {Object} config - 配置对象
   * @returns {Array} 风险详情数组
   */
  getDefaultRiskDetails(config) {
    const riskNum = config.riskNum || 0;
    const details = [];

    for (let i = 1; i <= riskNum; i++) {
      details.push({
        level: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
        description: `${config.title || config.name}风险项 ${i}`,
      });
    }

    return details;
  }

  /**
   * 渲染组件内容
   */
  render() {
    // 渲染汇总信息
    if (this.displayConfigs && this.displayConfigs.length > 0) {
      this.renderDisplayItems();
    }

    // 渲染流程信息
    if (this.processConfigs && this.processConfigs.length > 0) {
      this.renderProcessFlow();
    }
  }

  /**
   * 渲染汇总信息
   */
  renderDisplayItems() {
    // 创建显示项容器
    const sectionContainer = document.createElement("div");
    sectionContainer.className = "summary-section";

    // 创建标题栏
    const headerElem = document.createElement("div");
    headerElem.className = "section-header";

    const titleElem = document.createElement("div");
    titleElem.className = "section-title";
    titleElem.textContent = "汇总信息";
    titleElem.style.cursor = "pointer";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "collapse-toggle";
    toggleBtn.title = "折叠";
    toggleBtn.innerHTML = "▼";

    headerElem.appendChild(titleElem);
    headerElem.appendChild(toggleBtn);

    // 创建内容容器
    const contentContainer = document.createElement("div");
    contentContainer.className = "section-content";

    const itemsContainer = document.createElement("div");
    itemsContainer.className = "display-items-container";

    // 创建显示项
    this.displayConfigs.forEach((config) => {
      const item = this.createDisplayItem(config);
      itemsContainer.appendChild(item);
    });

    contentContainer.appendChild(itemsContainer);
    sectionContainer.appendChild(headerElem);
    sectionContainer.appendChild(contentContainer);
    this.contentContainer.appendChild(sectionContainer);

    // 添加折叠事件
    this.addCollapseEvents(titleElem, toggleBtn, contentContainer, "display");
  }

  /**
   * 创建单个显示项
   * @param {Object} config - 配置对象
   * @returns {HTMLElement} 显示项元素
   */
  createDisplayItem(config) {
    const item = document.createElement("div");
    item.className = "display-item";

    // 上部分：标题（占25%高度）
    const headerElem = document.createElement("div");
    headerElem.className = "item-header";
    headerElem.textContent = config.title || config.name || "";

    // 下部分主体
    const bodyElem = document.createElement("div");
    bodyElem.className = "item-body";

    // 左边部分：图标（占25%宽度）
    const leftElem = document.createElement("div");
    leftElem.className = "item-left";

    // 使用配置的图标或默认图标
    const iconSvg = config.icon || this.defaultIcons.main;
    leftElem.innerHTML = iconSvg;

    // 右边部分
    const rightElem = document.createElement("div");
    rightElem.className = "item-right";

    // 右上部分：主数值和小图标
    const rightTopElem = document.createElement("div");
    rightTopElem.className = "item-right-top";

    const mainValueElem = document.createElement("span");
    mainValueElem.className = "item-main-value";
    mainValueElem.textContent = config.mainValue || config.value || "0";

    const valueIconElem = document.createElement("span");
    valueIconElem.className = "item-value-icon";
    const valueIconSvg = config.valueIcon || this.defaultIcons.risk;
    valueIconElem.innerHTML = valueIconSvg;

    rightTopElem.appendChild(mainValueElem);
    rightTopElem.appendChild(valueIconElem);

    // 右下部分：描述和风险信息
    const rightBottomElem = document.createElement("div");
    rightBottomElem.className = "item-right-bottom";

    const descElem = document.createElement("span");
    descElem.className = "item-desc";
    descElem.textContent = config.description || "";

    const riskElem = document.createElement("span");
    riskElem.className = "item-risk";
    riskElem.title = "点击查看风险详情";

    const riskIconElem = document.createElement("span");
    riskIconElem.className = "item-risk-icon";
    const riskIconSvg = config.riskIcon || this.defaultIcons.risk;
    riskIconElem.innerHTML = riskIconSvg;

    const riskNumElem = document.createElement("span");
    riskNumElem.className = "item-risk-num";
    riskNumElem.textContent = `${config.riskNum || 0}个风险`;

    riskElem.appendChild(riskIconElem);
    riskElem.appendChild(riskNumElem);

    rightBottomElem.appendChild(descElem);
    rightBottomElem.appendChild(riskElem);

    // 组装右边部分
    rightElem.appendChild(rightTopElem);
    rightElem.appendChild(rightBottomElem);

    // 组装主体部分
    bodyElem.appendChild(leftElem);
    bodyElem.appendChild(rightElem);

    // 组装完整项目
    item.appendChild(headerElem);
    item.appendChild(bodyElem);

    // 添加风险提示事件
    this.addRiskTooltipEvents(riskElem, config);

    return item;
  }

  /**
   * 添加风险提示事件
   * @param {HTMLElement} riskElem - 风险元素
   * @param {Object} config - 配置对象
   */
  addRiskTooltipEvents(riskElem, config) {
    let hideTimeout;

    riskElem.addEventListener("mouseenter", (e) => {
      clearTimeout(hideTimeout);
      this.showRiskTooltip(config, riskElem);
    });

    riskElem.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(() => {
        this.hideRiskTooltip();
      }, 100);
    });

    // 防止鼠标移动到提示框时立即隐藏
    if (this.riskTooltip) {
      this.riskTooltip.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
      });

      this.riskTooltip.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
          this.hideRiskTooltip();
        }, 100);
      });
    }

    // 点击风险区域也可以显示/隐藏提示框
    riskElem.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.riskTooltip && this.riskTooltip.style.display === "block") {
        this.hideRiskTooltip();
      } else {
        this.showRiskTooltip(config, riskElem);
      }
    });
  }

  /**
   * 渲染流程信息
   */
  renderProcessFlow() {
    // 创建流程容器
    const sectionContainer = document.createElement("div");
    sectionContainer.className = "process-section";

    // 创建标题栏
    const headerElem = document.createElement("div");
    headerElem.className = "section-header";

    const titleElem = document.createElement("div");
    titleElem.className = "section-title";
    titleElem.textContent = "流程导航";
    titleElem.style.cursor = "pointer";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "collapse-toggle";
    toggleBtn.title = "折叠";
    toggleBtn.innerHTML = "▼";

    headerElem.appendChild(titleElem);
    headerElem.appendChild(toggleBtn);

    // 创建内容容器
    const contentContainer = document.createElement("div");
    contentContainer.className = "section-content";

    const processContainer = document.createElement("div");
    processContainer.className = "process-flow-container";

    // 创建流程项
    this.processConfigs.forEach((config, index) => {
      // 创建流程项
      const processItem = this.createProcessItem(config);
      processContainer.appendChild(processItem);

      // 如果不是最后一个流程项，添加连接线
      if (index < this.processConfigs.length - 1) {
        const connector = this.createProcessConnector();
        processContainer.appendChild(connector);
      }
    });

    contentContainer.appendChild(processContainer);
    sectionContainer.appendChild(headerElem);
    sectionContainer.appendChild(contentContainer);
    this.contentContainer.appendChild(sectionContainer);

    // 添加折叠事件
    this.addCollapseEvents(titleElem, toggleBtn, contentContainer, "process");
  }

  /**
   * 创建单个流程项
   * @param {Object} config - 流程配置
   * @returns {HTMLElement} 流程项元素
   */
  createProcessItem(config) {
    const processItem = document.createElement("div");
    processItem.className = "process-item";
    processItem.dataset.processKey = config.key;

    if (config.key === this.activeProcessKey) {
      processItem.classList.add("process-item-active");
    }

    // 创建流程节点
    const node = document.createElement("div");
    node.className = "process-node";

    // 根据数量添加不同的样式类
    if (config.num === 0) {
      node.classList.add("process-node-zero");
    } else {
      node.classList.add("process-node-has-data");
    }

    // 创建节点数量显示
    const nodeNum = document.createElement("div");
    nodeNum.className = "process-node-num";
    nodeNum.textContent = config.num || "0";

    // 创建流程名称
    const name = document.createElement("div");
    name.className = "process-name";
    name.textContent = config.name;

    node.appendChild(nodeNum);
    processItem.appendChild(node);
    processItem.appendChild(name);

    // 绑定点击事件
    processItem.addEventListener("click", () => {
      console.log("点击流程项:", config.key);

      // 触发对应的tab元素点击事件
      const targetTab = document.querySelector(
        `[data-node-key="${config.key}"]`,
      );
      if (targetTab) {
        // 尝试点击 Ant Design tab 内部的按钮元素（兼容 React 合成事件）
        const tabBtn =
          targetTab.querySelector('[role="tab"]') ||
          targetTab.querySelector(".ant-tabs-tab-btn") ||
          targetTab;

        // 方式1：直接调用原生 click（最可靠，React 会捕获）
        tabBtn.click();

        // 方式2：同时派发 MouseEvent 作为兜底（不传 view 避免报错）
        try {
          const clickEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
          });
          targetTab.dispatchEvent(clickEvent);
        } catch (e) {
          // 忽略 MouseEvent 构造失败的情况
        }

        // 更新激活状态
        this.updateActiveProcessKey(config.key);
      } else {
        console.error(`未找到data-node-key为"${config.key}"的元素`);
      }
    });

    return processItem;
  }

  /**
   * 创建流程连接线
   * @returns {HTMLElement} 连接线元素
   */
  createProcessConnector() {
    const connector = document.createElement("div");
    connector.className = "process-connector";

    const line = document.createElement("div");
    line.className = "process-line";

    const arrow = document.createElement("div");
    arrow.className = "process-arrow";

    connector.appendChild(line);
    connector.appendChild(arrow);

    return connector;
  }

  /**
   * 添加折叠事件
   * @param {HTMLElement} titleElem - 标题元素
   * @param {HTMLElement} toggleBtn - 切换按钮
   * @param {HTMLElement} contentContainer - 内容容器
   * @param {string} type - 类型 ('display' 或 'process')
   */
  addCollapseEvents(titleElem, toggleBtn, contentContainer, type) {
    const toggleCollapse = () => {
      if (type === "display") {
        this.isDisplayCollapsed = !this.isDisplayCollapsed;
        if (this.isDisplayCollapsed) {
          contentContainer.style.display = "none";
          toggleBtn.innerHTML = "▲";
          toggleBtn.title = "展开";
        } else {
          contentContainer.style.display = "block";
          toggleBtn.innerHTML = "▼";
          toggleBtn.title = "折叠";
        }
      } else if (type === "process") {
        this.isProcessCollapsed = !this.isProcessCollapsed;
        if (this.isProcessCollapsed) {
          contentContainer.style.display = "none";
          toggleBtn.innerHTML = "▲";
          toggleBtn.title = "展开";
        } else {
          contentContainer.style.display = "block";
          toggleBtn.innerHTML = "▼";
          toggleBtn.title = "折叠";
        }
      }
    };

    titleElem.addEventListener("click", toggleCollapse);
    toggleBtn.addEventListener("click", toggleCollapse);
  }

  /**
   * 更新激活的流程项
   * @param {string} activeKey - 激活的流程key
   */
  updateActiveProcessKey(activeKey) {
    this.activeProcessKey = activeKey;

    const processItems = this.container.querySelectorAll(".process-item");
    processItems.forEach((item) => {
      item.classList.remove("process-item-active");
      if (item.dataset.processKey === activeKey) {
        item.classList.add("process-item-active");
      }
    });
  }

  /**
   * 同步流程与tab的点击事件
   */
  syncProcessWithTabs() {
    const tabElements = document.querySelectorAll("[data-node-key]");

    tabElements.forEach((tab) => {
      // 移除可能存在的重复监听器
      tab.removeEventListener("click", this.handleTabClick);
      // 添加新的监听器
      tab.addEventListener("click", this.handleTabClick);
    });
  }

  /**
   * tab点击事件处理函数
   */
  handleTabClick() {
    const key = this.getAttribute("data-node-key");
    console.log("Tab点击:", key);

    // 找到所有DynamicInfoDisplay实例并更新激活状态
    document
      .querySelectorAll(".dynamic-info-container")
      .forEach((container) => {
        const processItems = container.querySelectorAll(".process-item");
        processItems.forEach((item) => {
          item.classList.remove("process-item-active");
          if (item.dataset.processKey === key) {
            item.classList.add("process-item-active");
          }
        });
      });
  }

  /**
   * 添加样式
   */
  addStyles() {
    // 检查是否已经添加过样式
    if (document.querySelector("#dynamic-info-display-styles")) return;

    const style = document.createElement("style");
    style.id = "dynamic-info-display-styles";
    style.textContent = this.getStyles();
    document.head.appendChild(style);
  }

  /**
   * 获取样式字符串
   */
  getStyles() {
    return `.dynamic-info-container {
    width: 100%;
}

/* 模块标题栏样式 */
.summary-section, .process-section {
    margin-bottom: 16px;
    border: 1px solid #e1e5e9;
    background: #ffffff;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a5fb4;
    cursor: pointer;
}

.collapse-toggle {
    background: none;
    border: none;
    font-size: 12px;
    color: #666;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 3px;
    transition: all 0.2s ease;
}

.collapse-toggle:hover {
    background-color: #e9ecef;
    transform: scale(1.1);
}

.section-content {
    transition: all 0.3s ease;
}

/* 汇总信息样式 */
.display-items-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
    background: #ffffff;
    min-height: 90px;
    box-sizing: border-box;
}

.display-item {
    width: 200px;
    height: 80px;
    border: 1px solid #e8e8e8;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 0;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.display-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #1a5fb4;
}

.item-header {
    height: 25%;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${this.titleFontSize};
    color: #1A5FB4;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding: 0 8px;
    text-align: center;
}

.item-body {
    height: 75%;
    display: flex;
    padding: 8px;
}

.item-left {
    width: 25%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a5fb4;
}

.item-left svg {
    width: 30px;
    height: 30px;
}

.item-right {
    width: 75%;
    display: flex;
    flex-direction: column;
    padding-left: 8px;
}

.item-right-top {
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.item-main-value {
    font-size: 18px;
    font-weight: 700;
    color: #1c3b6b;
}

.item-value-icon {
    color: #1a5fb4;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px; 
}

.item-value-icon svg {
    width: 20px;
    height: 20px;
}

.item-right-bottom {
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}

.item-desc {
    color: #666;
}

.item-risk {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.item-risk:hover {
    color: #ff4d4f;
    transform: scale(1.05);
}

.item-risk-icon {
    color: #ff4d4f;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-risk-icon svg {
    width: 12px;
    height: 12px;
}

.item-risk-num {
    color: #ff4d4f;
    font-weight: 500;
}

/* 流程信息样式 */
.process-flow-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
    background: #ffffff;
}

.process-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 6px;
    transition: all 0.3s ease;
    min-width: 100px;
}

.process-item:hover {
    background: #f0f7ff;
    transform: translateY(-2px);
}

.process-item-active {
    background: #e6f7ff;
    border: 1px solid #1890ff;
}

.process-item-active .process-node {
    border-color: #1890ff;
}

.process-item-active .process-node-has-data {
    background: #1890ff;
    border-color: #1890ff;
}

.process-item-active .process-node-zero {
    background: #f0f0f0;
    border-color: #1890ff;
}

.process-item-active .process-node-num {
    color: #ffffff;
}

.process-item-active .process-node-zero .process-node-num {
    color: #1890ff;
}

.process-node {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    border: 2px solid;
}

.process-node-has-data {
    background: #1a5fb4;
    border-color: #1a5fb4;
}

.process-node-zero {
    background: #ffffff;
    border-color: #d9d9d9;
}

.process-node-num {
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.process-node-has-data .process-node-num {
    color: #ffffff;
}

.process-node-zero .process-node-num {
    color: #999999;
}

.process-name {
    font-size: 14px;
    color: #1c3b6b;
    text-align: center;
    line-height: 1.4;
    font-weight: 500;
}

.process-connector {
    display: flex;
    align-items: center;
    margin: 0 8px;
}

.process-line {
    width: 40px;
    height: 2px;
    background: #d9d9d9;
    position: relative;
}

.process-arrow {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid #d9d9d9;
    margin-left: -2px;
}

/* 风险提示框样式 */
.risk-tooltip {
    position: absolute;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 300px;
    min-width: 200px;
    font-size: 12px;
    line-height: 1.4;
}

.risk-tooltip-title {
    font-weight: 600;
    color: #1c3b6b;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f0f0f0;
}

.risk-detail-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 6px;
    gap: 8px;
}

.risk-level {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.risk-level-high {
    background: #ff4d4f;
    color: white;
}

.risk-level-medium {
    background: #faad14;
    color: white;
}

.risk-level-low {
    background: #52c41a;
    color: white;
}

.risk-desc {
    color: #666;
    flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .section-header {
        padding: 6px 10px;
    }
    
    .section-title {
        font-size: 13px;
    }
    
    .display-items-container {
        gap: 12px;
        padding: 16px;
    }
    
    .display-item {
        width: 140px;
        height: 70px;
    }
    
    .item-header {
        font-size: ${this.mobileTitleFontSize};
    }
    
    .item-main-value {
        font-size: 16px;
    }
    
    .item-right-bottom {
        font-size: 11px;
    }
    
    .process-flow-container {
        padding: 16px 12px;
    }
    
    .process-item {
        min-width: 80px;
        padding: 8px 12px;
    }
    
    .process-node {
        width: 32px;
        height: 32px;
    }
    
    .process-node-num {
        font-size: 14px;
    }
    
    .process-name {
        font-size: 12px;
    }
    
    .process-line {
        width: 20px;
    }
    
    .risk-tooltip {
        max-width: 250px;
        min-width: 180px;
    }
}

/* 小屏幕时垂直排列 */
@media (max-width: 480px) {
    .display-items-container {
        justify-content: space-around;
    }
    
    .display-item {
        width: 45%;
        min-width: 140px;
    }
    
    .process-flow-container {
        flex-direction: column;
    }
    
    .process-connector {
        margin: 8px 0;
        transform: rotate(90deg);
    }
    
    .process-line {
        width: 50px;
    }
    
    .risk-tooltip {
        max-width: 200px;
        min-width: 160px;
    }
}`;
  }

  // ==================== 公共API方法 ====================

  /**
   * 动态更新汇总信息
   * @param {Array} displayConfigs - 新的汇总信息配置
   * @param {boolean} keepCollapseState - 是否保持折叠状态
   */
  updateDisplayInfo(displayConfigs, keepCollapseState = true) {
    this.displayConfigs = displayConfigs || [];

    // 移除现有的汇总信息section
    const existingDisplaySection =
      this.container.querySelector(".summary-section");
    if (existingDisplaySection) {
      existingDisplaySection.remove();
    }

    // 重新渲染汇总信息
    if (this.displayConfigs.length > 0) {
      this.renderDisplayItems();

      // 如果之前是折叠状态，重新应用折叠
      if (keepCollapseState && this.isDisplayCollapsed) {
        const contentContainer = this.container.querySelector(
          ".summary-section .section-content",
        );
        const toggleBtn = this.container.querySelector(
          ".summary-section .collapse-toggle",
        );
        if (contentContainer && toggleBtn) {
          contentContainer.style.display = "none";
          toggleBtn.innerHTML = "▲";
          toggleBtn.title = "展开";
        }
      }
    }
  }

  /**
   * 动态更新单个汇总项
   * @param {string} title - 要更新的项标题
   * @param {Object} newData - 新数据
   */
  updateDisplayItem(title, newData) {
    const displayItems = this.container.querySelectorAll(".display-item");
    let found = false;

    displayItems.forEach((item) => {
      const header = item.querySelector(".item-header");
      if (header && header.textContent === title) {
        // 更新主数值
        const mainValueElem = item.querySelector(".item-main-value");
        if (mainValueElem && newData.mainValue !== undefined) {
          mainValueElem.textContent = newData.mainValue;
        }

        // 更新描述
        const descElem = item.querySelector(".item-desc");
        if (descElem && newData.description !== undefined) {
          descElem.textContent = newData.description;
        }

        // 更新风险数量
        const riskNumElem = item.querySelector(".item-risk-num");
        if (riskNumElem && newData.riskNum !== undefined) {
          riskNumElem.textContent = `${newData.riskNum}个风险`;
        }

        // 更新风险详情数据
        if (newData.riskDetails !== undefined) {
          // 找到对应的配置项并更新
          const configIndex = this.displayConfigs.findIndex(
            (config) => config.title === title,
          );
          if (configIndex !== -1) {
            this.displayConfigs[configIndex].riskDetails = newData.riskDetails;
            this.displayConfigs[configIndex].riskNum = newData.riskNum;
          }
        }

        found = true;
      }
    });

    return found;
  }

  /**
   * 动态更新流程信息
   * @param {Array} processConfigs - 新的流程配置
   * @param {string} activeKey - 激活的流程key
   * @param {boolean} keepCollapseState - 是否保持折叠状态
   */
  updateProcessInfo(processConfigs, activeKey = "", keepCollapseState = true) {
    this.processConfigs = processConfigs || [];
    if (activeKey) {
      this.activeProcessKey = activeKey;
    }

    // 移除现有的流程section
    const existingProcessSection =
      this.container.querySelector(".process-section");
    if (existingProcessSection) {
      existingProcessSection.remove();
    }

    // 重新渲染流程信息
    if (this.processConfigs.length > 0) {
      this.renderProcessFlow();

      // 如果之前是折叠状态，重新应用折叠
      if (keepCollapseState && this.isProcessCollapsed) {
        const contentContainer = this.container.querySelector(
          ".process-section .section-content",
        );
        const toggleBtn = this.container.querySelector(
          ".process-section .collapse-toggle",
        );
        if (contentContainer && toggleBtn) {
          contentContainer.style.display = "none";
          toggleBtn.innerHTML = "▲";
          toggleBtn.title = "展开";
        }
      }
    }
  }

  /**
   * 动态更新单个流程项数量
   * @param {string} processKey - 流程key
   * @param {number} newNum - 新数量
   */
  updateProcessItemNum(processKey, newNum) {
    const processItems = this.container.querySelectorAll(".process-item");
    let found = false;

    processItems.forEach((item) => {
      if (item.dataset.processKey === processKey) {
        const nodeNum = item.querySelector(".process-node-num");
        const node = item.querySelector(".process-node");

        if (nodeNum) {
          nodeNum.textContent = newNum;
        }

        // 更新节点样式
        if (node) {
          node.classList.remove("process-node-zero", "process-node-has-data");
          if (newNum === 0) {
            node.classList.add("process-node-zero");
          } else {
            node.classList.add("process-node-has-data");
          }
        }

        // 更新配置数据
        const configIndex = this.processConfigs.findIndex(
          (config) => config.key === processKey,
        );
        if (configIndex !== -1) {
          this.processConfigs[configIndex].num = newNum;
        }

        found = true;
      }
    });

    return found;
  }

  /**
   * 设置激活的流程项
   * @param {string} activeKey - 激活的流程key
   */
  setActiveProcess(activeKey) {
    this.updateActiveProcessKey(activeKey);
  }

  /**
   * 获取当前配置
   * @returns {Object} 当前配置对象
   */
  getConfig() {
    return {
      displayConfigs: this.displayConfigs,
      processConfigs: this.processConfigs,
      activeProcessKey: this.activeProcessKey,
      isDisplayCollapsed: this.isDisplayCollapsed,
      isProcessCollapsed: this.isProcessCollapsed,
    };
  }

  /**
   * 完全重新配置组件
   * @param {Object} newConfig - 新配置
   */
  reconfigure(newConfig) {
    if (newConfig.displayConfigs !== undefined) {
      this.displayConfigs = newConfig.displayConfigs;
    }
    if (newConfig.processConfigs !== undefined) {
      this.processConfigs = newConfig.processConfigs;
    }
    if (newConfig.activeProcessKey !== undefined) {
      this.activeProcessKey = newConfig.activeProcessKey;
    }

    // 清空容器并重新初始化
    this.container.innerHTML = "";
    this.init();
  }

  /**
   * 销毁组件，清理资源
   */
  destroy() {
    if (this.riskTooltip && this.riskTooltip.parentNode) {
      this.riskTooltip.parentNode.removeChild(this.riskTooltip);
    }

    // 移除事件监听器
    const tabElements = document.querySelectorAll("[data-node-key]");
    tabElements.forEach((tab) => {
      tab.removeEventListener("click", this.handleTabClick);
    });

    // 清空容器
    this.container.innerHTML = "";
  }
}

// ==================== 固定数据定义 ====================

/**
 * 默认汇总信息配置（固定数据）
 * 每个配置项包含：标题、主数值、描述、风险数量、风险详情等
 */
const DEFAULT_DISPLAY_CONFIGS = [
  {
    title: "今日订单",
    mainValue: "1,286",
    description: "较昨日+12.5%",
    riskNum: 3,
    riskDetails: [
      { level: "high", description: "超时未处理订单 15 单" },
      { level: "medium", description: "退款申请待审核 8 单" },
      { level: "low", description: "物流异常 2 单" },
    ],
  },
  {
    title: "活跃用户",
    mainValue: "8,520",
    description: "较昨日+5.2%",
    riskNum: 1,
    riskDetails: [{ level: "low", description: "新增注册用户活跃度偏低" }],
  },
  {
    title: "转化率",
    mainValue: "24.8%",
    description: "较昨日-1.2%",
    riskNum: 2,
    riskDetails: [
      { level: "high", description: "购物车放弃率上升至 35%" },
      { level: "medium", description: "支付页面跳出率增加" },
    ],
  },
  {
    title: "总收入",
    mainValue: "¥58K",
    description: "较昨日+8.3%",
    riskNum: 0,
    riskDetails: [],
  },
];

/**
 * 默认流程配置（固定数据）
 * 每个流程项包含：key（关联tab）、名称、数量
 */
const DEFAULT_PROCESS_CONFIGS = [
  { key: "pending", name: "待处理", num: 23 },
  { key: "processing", name: "处理中", num: 45 },
  { key: "reviewing", name: "审核中", num: 12 },
  { key: "completed", name: "已完成", num: 0 },
  { key: "archived", name: "已归档", num: 156 },
];

/**
 * 默认激活的流程 key
 */
const DEFAULT_ACTIVE_PROCESS_KEY = "processing";

// ==================== 封装管理器 ====================

/**
 * 动态信息展示管理器
 * 封装 NewDynamicInfoDisplay，提供固定数据、更新逻辑和一键调用
 *
 * 使用方式：
 *   const manager = new DynamicInfoDisplayManager("my-container");
 *   // 之后可调用 manager 上的更新方法
 */
class DynamicInfoDisplayManager {
  /**
   * @param {string|HTMLElement} container - 容器元素或ID
   * @param {Object} [options] - 可选覆盖配置
   * @param {Array} [options.displayConfigs] - 覆盖默认汇总配置
   * @param {Array} [options.processConfigs] - 覆盖默认流程配置
   * @param {string} [options.activeProcessKey] - 覆盖默认激活流程
   */
  constructor(container, options = {}) {
    const mergedOptions = {
      container,
      displayConfigs: options.displayConfigs || DEFAULT_DISPLAY_CONFIGS,
      processConfigs: options.processConfigs || DEFAULT_PROCESS_CONFIGS,
      activeProcessKey: options.activeProcessKey || DEFAULT_ACTIVE_PROCESS_KEY,
      titleFontSize: options.titleFontSize || "14px",
      mobileTitleFontSize: options.mobileTitleFontSize || "11px",
    };

    this.display = new NewDynamicInfoDisplay(mergedOptions);
    this.containerId =
      typeof container === "string" ? container : container.id || "unknown";
  }

  // ---------- 汇总信息更新 ----------

  /**
   * 用新数据全量替换汇总信息
   * @param {Array} configs - 新的汇总配置数组
   * @param {boolean} [keepCollapseState=true] - 是否保持折叠状态
   */
  updateAllDisplay(configs, keepCollapseState = true) {
    this.display.updateDisplayInfo(configs, keepCollapseState);
  }

  /**
   * 按标题更新单个汇总项（仅更新传入的字段）
   * @param {string} title - 要更新的项标题
   * @param {Object} patch - 要更新的字段 { mainValue?, description?, riskNum?, riskDetails? }
   * @returns {boolean} 是否找到并更新成功
   */
  patchDisplayItem(title, patch) {
    return this.display.updateDisplayItem(title, patch);
  }

  /**
   * 批量更新汇总项（传入标题→数据的映射）
   * @param {Object} patchMap - { "今日订单": { mainValue: "999" }, "活跃用户": { riskNum: 5 } }
   * @returns {string[]} 更新成功的标题列表
   */
  batchPatchDisplay(patchMap) {
    const success = [];
    Object.entries(patchMap).forEach(([title, patch]) => {
      if (this.display.updateDisplayItem(title, patch)) {
        success.push(title);
      }
    });
    return success;
  }

  /**
   * 恢复汇总信息为默认固定数据
   */
  resetDisplayToDefault() {
    this.display.updateDisplayInfo(DEFAULT_DISPLAY_CONFIGS);
  }

  // ---------- 流程信息更新 ----------

  /**
   * 用新数据全量替换流程信息
   * @param {Array} configs - 新的流程配置数组 [{ key, name, num }]
   * @param {string} [activeKey] - 激活的流程key
   * @param {boolean} [keepCollapseState=true] - 是否保持折叠状态
   */
  updateAllProcess(configs, activeKey, keepCollapseState = true) {
    this.display.updateProcessInfo(configs, activeKey || "", keepCollapseState);
  }

  /**
   * 更新单个流程项的数量
   * @param {string} processKey - 流程key（如 "pending"）
   * @param {number} newNum - 新数量
   * @returns {boolean} 是否找到并更新成功
   */
  patchProcessNum(processKey, newNum) {
    return this.display.updateProcessItemNum(processKey, newNum);
  }

  /**
   * 批量更新流程项数量
   * @param {Object} numMap - { "pending": 10, "processing": 99 }
   * @returns {string[]} 更新成功的key列表
   */
  batchPatchProcess(numMap) {
    const success = [];
    Object.entries(numMap).forEach(([key, num]) => {
      if (this.display.updateProcessItemNum(key, num)) {
        success.push(key);
      }
    });
    return success;
  }

  /**
   * 设置激活的流程
   * @param {string} activeKey - 激活的流程key
   */
  setActiveProcess(activeKey) {
    this.display.setActiveProcess(activeKey);
  }

  /**
   * 恢复流程信息为默认固定数据
   */
  resetProcessToDefault() {
    this.display.updateProcessInfo(
      DEFAULT_PROCESS_CONFIGS,
      DEFAULT_ACTIVE_PROCESS_KEY,
    );
  }

  // ---------- 一键操作 ----------

  /**
   * 一键更新所有数据（汇总+流程）
   * @param {Object} data - 完整数据包
   * @param {Array} [data.displayConfigs] - 汇总配置
   * @param {Array} [data.processConfigs] - 流程配置
   * @param {string} [data.activeProcessKey] - 激活流程key
   */
  updateAll(data) {
    if (data.displayConfigs) {
      this.updateAllDisplay(data.displayConfigs);
    }
    if (data.processConfigs) {
      this.updateAllProcess(data.processConfigs, data.activeProcessKey);
    } else if (data.activeProcessKey) {
      this.setActiveProcess(data.activeProcessKey);
    }
  }

  /**
   * 模拟从后端拉取数据并更新（实际使用时替换为 fetch/axios 调用）
   * @returns {Promise<Object>} 返回更新后的数据快照
   */
  async fetchAndUpdate() {
    // 模拟异步请求，实际使用请替换为：
    //   const res = await fetch('/api/dashboard');
    //   const data = await res.json();
    //   this.updateAll(data);
    //   return data;

    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this._mockApiResponse();
        this.updateAll(data);
        resolve(data);
      }, 300);
    });
  }

  /**
   * 获取底层 NewDynamicInfoDisplay 实例（用于调用高级API）
   */
  getInstance() {
    return this.display;
  }

  /**
   * 获取当前配置快照
   */
  getSnapshot() {
    return this.display.getConfig();
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.display.destroy();
  }

  // ---------- 内部模拟数据 ----------

  /**
   * 模拟后端返回的数据（实际使用时删除此方法）
   */
  _mockApiResponse() {
    const randInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    return {
      displayConfigs: [
        {
          title: "今日订单",
          mainValue: randInt(1000, 2000).toLocaleString(),
          description: `较昨日${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 20).toFixed(1)}%`,
          riskNum: randInt(0, 5),
        },
        {
          title: "活跃用户",
          mainValue: randInt(5000, 12000).toLocaleString(),
          description: `较昨日${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 10).toFixed(1)}%`,
          riskNum: randInt(0, 3),
        },
        {
          title: "转化率",
          mainValue: (Math.random() * 40).toFixed(1) + "%",
          description: `较昨日${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 5).toFixed(1)}%`,
          riskNum: randInt(0, 4),
        },
        {
          title: "总收入",
          mainValue: "¥" + randInt(20, 100) + "K",
          description: `较昨日${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 15).toFixed(1)}%`,
          riskNum: randInt(0, 2),
        },
      ],
      processConfigs: DEFAULT_PROCESS_CONFIGS.map((p) => ({
        ...p,
        num: randInt(0, 200),
      })),
      activeProcessKey: DEFAULT_PROCESS_CONFIGS[randInt(0, 4)].key,
    };
  }
}

// ==================== 调用代码示例 ====================

// 示例 1：最简初始化（使用全部固定默认数据）
// const manager = new DynamicInfoDisplayManager("dashboard-container");

// 示例 2：使用自定义容器元素
// const el = document.getElementById("dashboard-container");
// const manager = new DynamicInfoDisplayManager(el);

// 示例 3：覆盖部分默认配置
// const manager = new DynamicInfoDisplayManager("dashboard-container", {
//   activeProcessKey: "pending",               // 初始激活"待处理"
//   titleFontSize: "16px",                      // 自定义标题字号
// });

// 示例 4：完全自定义初始数据
// const manager = new DynamicInfoDisplayManager("u:32b7ca3ff6eb_ctx", {
//   displayConfigs: [
//     {
//       title: "服务器CPU",
//       mainValue: "67%",
//       description: "正常范围",
//       riskNum: 1,
//     },
//     { title: "内存使用", mainValue: "8.2G", description: "偏高", riskNum: 3 },
//   ],
//   processConfigs: [
//     { key: "tabPanel_tab", name: "项目入库", num: 12 },
//     { key: "tabPanel_tab2", name: "项目发起", num: 5 },
//     { key: "tabPanel_tab3", name: "项目立项", num: 24 },
//   ],
//   activeProcessKey: "prd",
// });
// ========== 更新操作示例 ==========
//
// // 1) 更新单个汇总项
// manager.patchDisplayItem("今日订单", {
//   mainValue: "1,500",
//   description: "较昨日+18.2%",
//   riskNum: 0,
// });
//
// // 2) 批量更新汇总项
// manager.batchPatchDisplay({
//   "今日订单": { mainValue: "1,500", riskNum: 0 },
//   "总收入":   { mainValue: "¥72K", description: "较昨日+12.7%" },
// });
//
// // 3) 更新单个流程项数量
// manager.patchProcessNum("pending", 5);
//
// // 4) 批量更新流程项数量
// manager.batchPatchProcess({ pending: 5, processing: 77, completed: 120 });
//
// // 5) 设置激活流程
// manager.setActiveProcess("reviewing");
//
// // 6) 一键更新全部
// manager.updateAll({
//   displayConfigs: [ /* 新的汇总配置 */ ],
//   processConfigs: [ /* 新的流程配置 */ ],
//   activeProcessKey: "pending",
// });
//
// // 7) 模拟从后端拉取数据（实际使用时替换为真实 fetch）
// manager.fetchAndUpdate().then(data => console.log("更新完成:", data));
//
// // 8) 定时轮询更新（每 30 秒拉取一次）
// setInterval(() => manager.fetchAndUpdate(), 30000);
//
// // 9) 恢复默认
// manager.resetDisplayToDefault();
// manager.resetProcessToDefault();
//
// // 10) 获取当前快照
// console.log(manager.getSnapshot());
//
// // 11) 销毁
// manager.destroy();

// ==================== 导出组件 ====================

/**
 * 便捷初始化函数：在指定容器中创建统计面板
 * @param {string|HTMLElement} container - 容器元素或ID
 * @param {Object} [options] - 可选配置（同 DynamicInfoDisplayManager）
 * @returns {DynamicInfoDisplayManager} 面板管理器实例
 */
function initSummaryPanel(container, options = {}) {
  return new DynamicInfoDisplayManager(container, options);
}

// CommonJS 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NewDynamicInfoDisplay,
    DynamicInfoDisplayManager,
    DEFAULT_DISPLAY_CONFIGS,
    DEFAULT_PROCESS_CONFIGS,
    DEFAULT_ACTIVE_PROCESS_KEY,
    initSummaryPanel,
  };
}

// 浏览器全局变量导出
if (typeof window !== "undefined") {
  window.NewDynamicInfoDisplay = NewDynamicInfoDisplay;
  window.DynamicInfoDisplayManager = DynamicInfoDisplayManager;
  window.DEFAULT_DISPLAY_CONFIGS = DEFAULT_DISPLAY_CONFIGS;
  window.DEFAULT_PROCESS_CONFIGS = DEFAULT_PROCESS_CONFIGS;
  window.DEFAULT_ACTIVE_PROCESS_KEY = DEFAULT_ACTIVE_PROCESS_KEY;
  window.initSummaryPanel = initSummaryPanel;
}
