/**
 * 表格金额字段后缀管理器 - 最终优化版
 * 修复的问题：
 * 1. 后缀重叠问题（层级错误）
 * 2. 默认样式类选择器问题
 * 3. 异步加载时机问题
 * 4. 虚拟滚动监听问题
 * 5. 多层DOM结构处理
 */
class TableAmountSuffix {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    // 默认配置
    this.config = {
      containerId: "p_form_expert_fee_apply_d1",
      fieldKeys: ["u_unit_price"],
      suffixText: "元",
      suffixClass: "", // 默认不添加类名
      suffixStyle: {
        color: "#999",
        marginLeft: "2px",
        fontSize: "inherit",
      },
      useSeparateElement: true,
      scrollDebounceTime: 300,
      updateInterval: 1000,
      autoObserve: true,
      debug: false,
      waitForRender: 1500, // 等待表格渲染
      maxAttempts: 10, // 最大重试次数
      ...options,
    };

    // 状态管理
    this.observer = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Set();
    this.attemptCount = 0;

    // 延迟初始化
    this.delayedInit();
  }

  /**
   * 延迟初始化，确保DOM已渲染
   */
  delayedInit() {
    // 如果文档还在加载，等待
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.init(), this.config.waitForRender);
      });
    } else {
      setTimeout(() => this.init(), this.config.waitForRender);
    }
  }

  /**
   * 初始化组件
   */
  init() {
    // 检查表格容器是否存在
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      this.attemptCount++;

      if (this.attemptCount < this.config.maxAttempts) {
        if (this.config.debug) {
          console.log(
            `表格容器 ${this.config.containerId} 未找到，第 ${this.attemptCount} 次重试...`,
          );
        }
        setTimeout(() => this.init(), 500);
        return;
      } else {
        if (this.config.debug) {
          console.error(
            `表格容器 ${this.config.containerId} 不存在，已尝试 ${this.attemptCount} 次`,
          );
        }
        return;
      }
    }

    if (this.config.debug) {
      console.log("TableAmountSuffix 初始化成功");
    }

    // 创建样式
    this.createStyles();

    // 启动监听
    if (this.config.autoObserve) {
      this.startObserving();
    }

    // 立即处理一次
    this.processTable();
  }

  /**
   * 创建样式（最小化样式）
   */
  createStyles() {
    // 移除可能存在的旧样式
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    // 创建新的样式元素（如果需要的话）
    if (this.config.suffixClass) {
      const styleEl = document.createElement("style");
      styleEl.id = "table-amount-suffix-styles";

      // 只对配置的类名添加样式
      const styles = `
                .${this.config.suffixClass} {
                    ${this.objectToCss(this.config.suffixStyle)}
                }
            `;

      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
  }

  /**
   * 将样式对象转换为CSS字符串
   */
  objectToCss(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value};`)
      .join(" ");
  }

  /**
   * 驼峰转连字符
   */
  camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * 主处理函数（带防抖）
   */
  processTable() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // 清除之前的超时
    if (this.timeoutId) clearTimeout(this.timeoutId);

    // 防抖处理
    this.timeoutId = setTimeout(() => {
      try {
        const result = this.addSuffixToTable();
        if (result > 0) {
          console.log(`表格金额后缀添加完成，本次处理 ${result} 个字段`);
        }
      } catch (error) {
        if (this.config.debug) {
          console.error("处理表格时出错:", error);
        }
      } finally {
        this.isProcessing = false;
        this.timeoutId = null;
      }
    }, 100);
  }

  /**
   * 添加后缀到表格
   */
  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      if (this.config.debug) {
        console.log(`表格容器 ${this.config.containerId} 不存在`);
      }
      return 0;
    }

    // 查找表格行
    const rows = this.findTableRows(tableContainer);
    if (rows.length === 0) {
      return 0;
    }

    let currentModified = 0;

    // 遍历每一行
    rows.forEach((row) => {
      const rowKey = this.getRowKey(row);

      // 跳过已处理的行
      if (this.rowCache.has(rowKey)) return;

      // 处理每个配置的字段
      this.config.fieldKeys.forEach((fieldKey) => {
        const element = row.querySelector(`[data-key="${fieldKey}"]`);
        if (element && this.processAmountElement(element)) {
          currentModified++;
          this.modifiedCount++;
        }
      });

      // 标记为已处理
      this.rowCache.add(rowKey);
    });

    return currentModified;
  }

  /**
   * 查找表格行
   */
  findTableRows(container) {
    // 多种可能的行选择器
    const rowSelectors = [
      '[class*="table-row"]',
      ".table-row",
      "[data-row-index]",
      "tr[data-index]",
      "tr",
      ".row",
      ".ant-table-row",
    ];

    for (const selector of rowSelectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) return rows;
    }

    // 尝试查找tbody的子元素
    const tbodyRows = container.querySelectorAll("tbody > *");
    if (tbodyRows.length > 0) return tbodyRows;

    return [];
  }

  /**
   * 获取行的唯一标识
   */
  getRowKey(row) {
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const rowId = row.getAttribute("id");
    const dataRowKey = row.getAttribute("data-row-key");

    // 使用现有标识或生成一个
    return (
      dataKey ||
      dataIndex ||
      rowId ||
      dataRowKey ||
      `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  /**
   * 处理金额元素 - 核心修复逻辑
   */
  processAmountElement(element) {
    // 1. 查找实际的金额容器
    const amountContainer = this.findAmountContainer(element);
    if (!amountContainer) {
      if (this.config.debug) {
        console.log("未找到金额容器");
      }
      return false;
    }

    // 2. 获取文本内容
    const originalText = amountContainer.textContent.trim();
    if (!originalText) {
      return false;
    }

    // 3. 检查是否已有后缀
    if (originalText.includes(this.config.suffixText)) {
      return false;
    }

    // 4. 提取数字
    const numberMatch = originalText.match(/[\d,.]+/);
    if (!numberMatch) {
      return false;
    }

    const numberText = numberMatch[0];

    // 5. 添加后缀
    return this.addSuffixToContainer(amountContainer, numberText);
  }

  /**
   * 查找金额容器 - 修复层级问题
   */
  findAmountContainer(element) {
    // 根据我们观察到的DOM结构，现在有几种可能：
    // 1. .nowrap > span （新结构）
    // 2. .nowrap （旧结构）
    // 3. .editor-container .nowrap
    // 4. 直接包含文本的元素

    const selectors = [
      ".nowrap > span", // 最里层的span
      ".nowrap", // nowrap元素本身
      ".editor-container .nowrap > span",
      ".editor-container .nowrap",
      ".editor-container span",
      "span:first-child", // 第一个span子元素
    ];

    for (const selector of selectors) {
      const container = element.querySelector(selector);
      if (container && container.textContent.trim()) {
        return container;
      }
    }

    return null;
  }

  /**
   * 添加后缀到容器 - 关键修复
   */
  addSuffixToContainer(container, numberText) {
    try {
      // 保存原始的类名（如果有）
      const originalClass = container.className;

      // 清空容器内容
      container.innerHTML = "";

      // 创建新的内容
      if (this.config.useSeparateElement) {
        // 使用独立元素模式

        // 创建数字文本节点
        const textNode = document.createTextNode(numberText);
        container.appendChild(textNode);

        // 创建后缀元素
        const suffixElement = document.createElement("span");
        suffixElement.textContent = ` ${this.config.suffixText}`;

        // 添加类名（如果有配置）
        if (this.config.suffixClass) {
          suffixElement.className = this.config.suffixClass;
        }

        // 应用内联样式
        Object.assign(suffixElement.style, this.config.suffixStyle);

        // 确保后缀正确显示
        suffixElement.style.display = "inline";
        suffixElement.style.whiteSpace = "nowrap";

        container.appendChild(suffixElement);
      } else {
        // 文本模式：直接在数字后添加文本
        container.textContent = numberText + ` ${this.config.suffixText}`;
      }

      // 恢复原始类名
      container.className = originalClass;

      return true;
    } catch (error) {
      if (this.config.debug) {
        console.error("添加后缀失败:", error);
      }
      return false;
    }
  }

  /**
   * 启动监听
   */
  startObserving() {
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();
  }

  /**
   * 设置MutationObserver监听DOM变化
   */
  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return;

    // 断开之前的观察器
    if (this.observer) {
      this.observer.disconnect();
    }

    // 创建新的观察器
    this.observer = new MutationObserver((mutations) => {
      // 检查是否有相关变化
      const hasRelevantChange = mutations.some((mutation) => {
        // 新增节点
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          return true;
        }
        // 文本内容变化
        if (mutation.type === "characterData") {
          return true;
        }
        return false;
      });

      if (hasRelevantChange) {
        // 清空缓存并重新处理
        this.rowCache.clear();
        this.processTable();
      }
    });

    // 开始观察
    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 设置滚动监听（处理虚拟滚动）
   */
  setupScrollListener() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return;

    let scrollTimer = null;

    const handleScroll = () => {
      // 防抖处理
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(() => {
        // 滚动后重新处理可见行
        this.rowCache.clear();
        this.processTable();
      }, this.config.scrollDebounceTime);
    };

    tableContainer.addEventListener("scroll", handleScroll);

    // 保存引用以便清理
    this.scrollHandler = handleScroll;
  }

  /**
   * 启动定期检查
   */
  startPeriodicCheck() {
    // 清除之前的定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 启动新的定时器
    this.intervalId = setInterval(() => {
      this.processTable();
    }, this.config.updateInterval);
  }

  /**
   * 手动重新处理表格
   */
  reapply() {
    this.rowCache.clear();
    this.processTable();
  }

  /**
   * 更新配置
   */
  updateConfig(newOptions) {
    // 合并新配置
    Object.assign(this.config, newOptions);

    // 重新创建样式
    this.createStyles();

    // 重新处理表格
    this.reapply();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalModified: this.modifiedCount,
      cachedRows: this.rowCache.size,
      isProcessing: this.isProcessing,
      config: { ...this.config },
    };
  }

  /**
   * 销毁组件，清理资源
   */
  destroy() {
    // 清除定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // 断开观察器
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // 移除滚动监听
    if (this.scrollHandler) {
      const tableContainer = document.getElementById(this.config.containerId);
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", this.scrollHandler);
      }
      this.scrollHandler = null;
    }

    // 移除样式
    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) {
      styleEl.remove();
    }

    // 清理缓存
    this.rowCache.clear();

    if (this.config.debug) {
      console.log("TableAmountSuffix 已销毁");
    }
  }
}

// 暴露到全局
window.TableAmountSuffix = TableAmountSuffix;
