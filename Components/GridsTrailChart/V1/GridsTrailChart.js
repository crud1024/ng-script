/**
 * 表格金额字段后缀管理器 (修复版)
 * @class TableAmountSuffix
 */
class TableAmountSuffix {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {string} options.containerId 表格容器ID
   * @param {string[]} options.fieldKeys 金额字段key数组
   * @param {string} options.suffixText 后缀文本，默认"元"
   * @param {string} options.suffixClass 后缀样式类名
   * @param {Object} options.suffixStyle 自定义后缀样式对象
   * @param {boolean} options.useSeparateElement 是否使用独立元素包裹后缀
   * @param {number} options.scrollDebounceTime 滚动防抖时间(ms)
   * @param {number} options.updateInterval 定期检查间隔(ms)
   */
  constructor(options = {}) {
    // 合并默认配置
    this.config = {
      containerId: "p_form_no_collected_cost_d1",
      fieldKeys: ["u_no_collected_amt"],
      suffixText: "元",
      suffixClass: "ant-input-number-suffix",
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
      ...options,
    };

    // 状态变量
    this.observer = null;
    this.scrollObserver = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Set();
    this.initRetryCount = 0; // 新增：初始化重试计数器

    // 初始化
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    this.createStyles();

    if (this.config.autoObserve) {
      this.startObserving();
    }
  }

  /**
   * 创建必要的样式
   */
  createStyles() {
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";
    let styles = `
        .amount-suffix-wrapper {
            display: inline-flex;
            align-items: center;
            width: 100%; /* 确保 wrapper 撑满父元素 */
            height: 100%;
        }
        
        .amount-value {
            flex-shrink: 0;
        }

        /* 关键修复：让后缀元素不影响布局，并能正确对齐 */
        .amount-suffix-separate {
            display: inline-block;
            flex-shrink: 0; /* 防止后缀被压缩 */
            ${this.objectToCss(this.config.suffixStyle)}
        }
    `;

    if (this.config.useSeparateElement) {
      styles += `
            .amount-suffix-separate.${this.config.suffixClass} {
                /* 这里可以添加额外的样式覆盖 */
            }
        `;
    }

    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  /**
   * 将样式对象转换为CSS字符串
   * @param {Object} styleObj 样式对象
   * @returns {string} CSS字符串
   */
  objectToCss(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value};`)
      .join(" ");
  }

  /**
   * 驼峰转连字符
   * @param {string} str 驼峰字符串
   * @returns {string} 连字符字符串
   */
  camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * 主处理函数 (使用 requestAnimationFrame 优化性能)
   */
  processTable() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      // 使用 rAF 确保在浏览器下一次重绘前执行，减少布局抖动
      requestAnimationFrame(() => {
        try {
          const result = this.addSuffixToTable();
          if (result > 0 && this.config.debug) {
            console.log(`[TableAmountSuffix] 处理了 ${result} 个字段`);
          }
        } catch (error) {
          console.error("[TableAmountSuffix] 处理表格时出错:", error);
        } finally {
          this.isProcessing = false;
          this.timeoutId = null;
        }
      });
    }, 50); // 缩短防抖时间，配合 rAF
  }

  /**
   * 添加后缀到表格
   * @returns {number} 处理的字段数量
   */
  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      // 如果容器还未加载，安排一次重试
      this.scheduleInitRetry();
      return 0;
    }

    const tableRows = this.findTableRows(tableContainer);
    let currentModified = 0;

    tableRows.forEach((row) => {
      const rowKey = this.getRowKey(row);

      if (this.rowCache.has(rowKey)) {
        return;
      }

      this.config.fieldKeys.forEach((fieldKey) => {
        const element = this.findFieldElement(row, fieldKey);
        if (element && !element.classList.contains("has-amount-suffix")) {
          // 优化：直接检查class
          if (this.addSuffixToElement(element, rowKey)) {
            currentModified++;
            this.modifiedCount++;
          }
        }
      });

      this.rowCache.add(rowKey);
    });

    if (currentModified > 0 && this.config.debug) {
      console.log(
        `[TableAmountSuffix] 表格金额后缀添加完成，本次处理 ${currentModified} 个字段`,
      );
    }

    return currentModified;
  }

  /**
   * 查找表格行
   */
  findTableRows(container) {
    // 优先使用更具体的选择器
    const rowSelectors = [
      "[data-row-index]", // 虚拟滚动表格常用
      ".table-row",
      "tr",
      '[class*="row-"]',
      "tbody > *",
    ];

    for (const selector of rowSelectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) {
        return rows;
      }
    }
    // 如果都找不到，回退到所有子元素
    return Array.from(container.children);
  }

  /**
   * 获取行的唯一标识
   */
  getRowKey(row) {
    // 优先使用 data-key 或 data-index
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    if (dataKey) return `data-key:${dataKey}`;
    if (dataIndex) return `data-index:${dataIndex}`;
    // 最后才用 id 或 index，因为它们可能不唯一或不稳定
    return `id:${row.id || "no-id"}-index:${Array.from(row.parentNode.children).indexOf(row)}`;
  }

  /**
   * 查找字段元素
   */
  findFieldElement(row, fieldKey) {
    // 组合多种选择器以提高命中率
    const selectors = [
      `[data-key="${fieldKey}"]`,
      `[fieldname="${fieldKey}"]`,
      `[name="${fieldKey}"]`,
      `.${fieldKey}`,
    ];

    for (const selector of selectors) {
      const element = row.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  /**
   * 添加后缀到元素 (核心修复逻辑)
   */
  addSuffixToElement(element, rowKey) {
    // 如果已经处理过，直接返回
    if (element.classList.contains("has-amount-suffix")) {
      return false;
    }

    const currentText = this.getElementText(element);
    if (!currentText) return false;

    if (this.hasSuffix(element, currentText)) {
      return false;
    }

    const numericMatch = this.extractNumericValue(currentText);
    if (!numericMatch) return false;

    const { numericText } = numericMatch;

    if (this.config.useSeparateElement) {
      this.addSuffixAsSeparateElement(element, numericText);
    } else {
      this.addSuffixAsText(element, currentText);
    }

    element.classList.add("has-amount-suffix");
    return true;
  }

  /**
   * 获取元素文本
   */
  getElementText(element) {
    // 优先使用 textContent，因为它更快且不受CSS影响
    return (element.textContent || "").trim();
  }

  /**
   * 检查是否已有后缀
   */
  hasSuffix(element, text) {
    if (text.endsWith(this.config.suffixText)) {
      return true;
    }
    if (element.querySelector(".amount-suffix-separate")) {
      return true;
    }
    return false;
  }

  /**
   * 提取数字值
   */
  extractNumericValue(text) {
    // 更精确的匹配，避免匹配到 "1.2.3" 这样的无效数字
    const numericMatch = text.match(
      /[-+]?[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?/,
    );
    if (!numericMatch) return null;

    const numericText = numericMatch[0];
    const numericValue = numericText.replace(/,/g, "");

    if (isNaN(parseFloat(numericValue))) {
      return null;
    }

    return { numericText, numericValue };
  }

  /**
   * 【核心修复】添加后缀作为独立元素
   * 这个版本会智能地处理已有的子元素，如 .editor-container
   */
  addSuffixAsSeparateElement(element, numericText) {
    // 关键修复：检查是否存在像 .editor-container 这样的包装器
    // 我们不再粗暴地 element.innerHTML = ''
    let valueWrapper = element.querySelector(
      '.amount-value-wrapper, .nowrap, [class*="editor-container"]',
    );

    // 如果没有找到特定的包装器，或者元素内容就是纯文本/数字
    if (
      !valueWrapper ||
      element.childElementCount === 0 ||
      (element.childElementCount === 1 &&
        element.firstElementChild.tagName === "SPAN" &&
        element.firstElementChild.textContent.trim() === numericText)
    ) {
      // 情况1：元素是干净的，或者已经被我们处理过
      // 直接重建结构
      element.innerHTML = ""; // 在这种情况下清空是安全的
      const wrapper = document.createElement("span");
      wrapper.className = "amount-suffix-wrapper";

      const valueSpan = document.createElement("span");
      valueSpan.className = "amount-value";
      valueSpan.textContent = numericText;

      const suffixSpan = document.createElement("span");
      suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
      suffixSpan.textContent = ` ${this.config.suffixText}`;
      Object.assign(suffixSpan.style, this.config.suffixStyle);

      wrapper.appendChild(valueSpan);
      wrapper.appendChild(suffixSpan);
      element.appendChild(wrapper);
    } else {
      // 情况2：元素内部有框架生成的复杂结构 (如 <div class="editor-container"><span>18.00</span></div>)
      // 我们的目标是把后缀加在这个结构的“后面”或“旁边”，而不是破坏它

      // 查找包含数值的直接子元素
      let valueElement = valueWrapper.querySelector("span") || valueWrapper;
      if (!valueElement) return; // 安全退出

      // 检查后缀是否已经存在
      if (
        valueElement.nextSibling &&
        valueElement.nextSibling.classList &&
        valueElement.nextSibling.classList.contains("amount-suffix-separate")
      ) {
        return; // 已经添加过了
      }

      // 创建后缀元素
      const suffixSpan = document.createElement("span");
      suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
      suffixSpan.textContent = ` ${this.config.suffixText}`;
      Object.assign(suffixSpan.style, this.config.suffixStyle);

      // 将后缀插入到数值元素的后面
      valueElement.parentNode.insertBefore(
        suffixSpan,
        valueElement.nextSibling,
      );

      // 为了布局正确，可能需要将父容器(wrapper)也设置为flex
      const parentOfValue = valueElement.parentNode;
      if (parentOfValue && parentOfValue !== element) {
        parentOfValue.style.display = "inline-flex";
        parentOfValue.style.alignItems = "center";
      }
    }
  }

  /**
   * 添加后缀作为文本 (备用方案)
   */
  addSuffixAsText(element, originalText) {
    // 这个方法风险较高，容易导致问题，但保留作为选项
    const newText = originalText + ` ${this.config.suffixText}`;
    element.textContent = newText;
    element.classList.add("has-amount-suffix");
  }

  /**
   * 启动监听
   */
  startObserving() {
    this.initRetryCount = 0; // 重置重试计数
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();
    this.processTable(); // 初始处理
  }

  /**
   * 设置MutationObserver
   */
  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      this.scheduleInitRetry();
      return;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      // 简单有效的策略：任何变动都清空缓存并重新处理
      // 对于高频变动的表格，这是最稳妥的方式
      if (this.rowCache.size > 0) {
        this.rowCache.clear();
        this.processTable();
      }
    });

    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 【新增】安排初始化重试
   */
  scheduleInitRetry() {
    if (this.initRetryCount > 10) {
      // 最多重试10次
      console.error(
        "[TableAmountSuffix] 初始化失败：长时间未找到容器 " +
          this.config.containerId,
      );
      return;
    }
    this.initRetryCount++;
    console.log(
      `[TableAmountSuffix] 容器 ${this.config.containerId} 未找到，将在 1 秒后重试... (第 ${this.initRetryCount} 次)`,
    );
    setTimeout(() => {
      this.setupMutationObserver(); // 尝试重新设置观察器
      this.setupScrollListener();
      this.startPeriodicCheck();
      this.processTable();
    }, 1000);
  }

  /**
   * 设置滚动监听
   */
  setupScrollListener() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return;

    let scrollTimer = null;
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.processTable();
      }, this.config.scrollDebounceTime);
    };

    tableContainer.addEventListener("scroll", handleScroll);
    this.scrollHandler = handleScroll;
  }

  /**
   * 启动定期检查
   */
  startPeriodicCheck() {
    if (this.intervalId) clearInterval(this.intervalId);
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
    Object.assign(this.config, newOptions);
    this.createStyles();
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
    };
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.observer) this.observer.disconnect();

    const tableContainer = document.getElementById(this.config.containerId);
    if (tableContainer && this.scrollHandler) {
      tableContainer.removeEventListener("scroll", this.scrollHandler);
    }

    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();

    this.rowCache.clear();
    console.log("[TableAmountSuffix] 组件已销毁");
  }
}

// 默认导出
window.TableAmountSuffix = TableAmountSuffix;

// === 使用方式 (保持不变) ===
/*
$NG.loadScript('https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Components.all.osd.min.js', function () {
    console.log('组件加载完成，开始修复表格后缀...');

    // 直接初始化，构造函数内部会处理重试逻辑
    const suffixManager = new TableAmountSuffix({
        containerId: 'p_form_expert_fee_apply_d1',
        fieldKeys: ['u_unit_price'],
        suffixText: '元',
        suffixClass: '',
        suffixStyle: {
            color: '#999',
            marginLeft: '2px',
            fontSize: 'inherit'
        },
        debug: true
    });

    // 你可以在需要时手动重新应用
    // setTimeout(() => suffixManager.reapply(), 5000);

}, function (error) {
    console.error('加载失败:', error);
});
*/
