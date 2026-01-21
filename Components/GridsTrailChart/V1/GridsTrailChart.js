/**
 * 表格金额字段后缀管理器
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

    // 初始化
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    // 创建样式
    this.createStyles();

    // 启动监听
    if (this.config.autoObserve) {
      this.startObserving();
    }
  }

  /**
   * 创建必要的样式
   */
  createStyles() {
    // 如果已经存在样式，先移除
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // 创建样式元素
    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";

    // 基础样式
    let styles = `
        .amount-suffix-wrapper {
            display: inline-flex;
            align-items: center;
        }
        
        .amount-value {
            flex-shrink: 0;
        }
    `;

    // 如果使用独立元素，添加默认样式
    if (this.config.useSeparateElement) {
      styles += `
            .amount-suffix-separate {
                display: inline-block;
                ${this.objectToCss(this.config.suffixStyle)}
            }
            
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
   * 主处理函数
   */
  processTable() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // 防抖处理
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      try {
        const result = this.addSuffixToTable();
        if (result > 0 && this.config.debug) {
          console.log(`处理了 ${result} 个字段`);
        }
      } catch (error) {
        console.error("处理表格时出错:", error);
      } finally {
        this.isProcessing = false;
        this.timeoutId = null;
      }
    }, 100);
  }

  /**
   * 添加后缀到表格
   * @returns {number} 处理的字段数量
   */
  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      console.warn(`未找到表格容器: ${this.config.containerId}`);
      return 0;
    }

    // 查找所有行
    const tableRows = this.findTableRows(tableContainer);
    let currentModified = 0;

    // 遍历每一行
    tableRows.forEach((row, rowIndex) => {
      const rowKey = this.getRowKey(row, rowIndex);

      // 如果这行已经处理过，跳过
      if (this.rowCache.has(rowKey)) {
        return;
      }

      // 遍历配置的字段
      this.config.fieldKeys.forEach((fieldKey) => {
        const element = this.findFieldElement(row, fieldKey);
        if (element) {
          if (this.config.debug) {
            console.log(`找到字段元素: ${fieldKey}`, element);
          }
          if (this.addSuffixToElement(element, rowKey)) {
            currentModified++;
            this.modifiedCount++;
          }
        }
      });

      // 标记这行为已处理
      this.rowCache.add(rowKey);
    });

    // 只在有处理结果时输出一次
    if (currentModified > 0) {
      console.log(`表格金额后缀添加完成，本次处理 ${currentModified} 个字段`);
    }

    return currentModified;
  }

  /**
   * 查找表格行
   * @param {HTMLElement} container 表格容器
   * @returns {NodeList} 行元素列表
   */
  findTableRows(container) {
    // 多种可能的行选择器
    const rowSelectors = [
      '[class*="table-row"]',
      ".table-row",
      "[data-row-index]",
      "tr",
      ".row",
      "tbody > *",
      '[class*="row"]',
    ];

    for (const selector of rowSelectors) {
      const rows = container.querySelectorAll(selector);
      if (rows.length > 0) {
        if (this.config.debug) {
          console.log(`使用选择器 "${selector}" 找到 ${rows.length} 行`);
        }
        return rows;
      }
    }

    return container.children;
  }

  /**
   * 获取行的唯一标识
   * @param {HTMLElement} row 行元素
   * @param {number} index 行索引
   * @returns {string} 行唯一标识
   */
  getRowKey(row, index) {
    const dataKey = row.getAttribute("data-key");
    const dataIndex = row.getAttribute("data-index");
    const rowId = row.getAttribute("id");

    if (dataKey) return `data-key:${dataKey}`;
    if (dataIndex) return `data-index:${dataIndex}`;
    if (rowId) return `id:${rowId}`;

    return `index:${index}`;
  }

  /**
   * 查找字段元素
   * @param {HTMLElement} row 行元素
   * @param {string} fieldKey 字段key
   * @returns {HTMLElement|null} 字段元素
   */
  findFieldElement(row, fieldKey) {
    // 多种可能的元素选择器
    const selectors = [
      `[data-key="${fieldKey}"]`,
      `[fieldname="${fieldKey}"]`,
      `[name="${fieldKey}"]`,
      `[data-field="${fieldKey}"]`,
      `.${fieldKey}`,
      `#${fieldKey}`,
    ];

    for (const selector of selectors) {
      const element = row.querySelector(selector);
      if (element) {
        if (this.config.debug) {
          console.log(
            `使用选择器 "${selector}" 找到字段: ${fieldKey}`,
            element,
          );
        }
        return element;
      }
    }

    return null;
  }

  /**
   * 添加后缀到元素
   * @param {HTMLElement} element 目标元素
   * @param {string} rowKey 行标识
   * @returns {boolean} 是否成功添加
   */
  addSuffixToElement(element, rowKey) {
    // 检查是否已有后缀
    if (this.hasSuffix(element)) {
      if (this.config.debug) {
        console.log("元素已存在后缀，跳过处理", element);
      }
      return false;
    }

    // 查找实际的数值元素
    const numericElement = this.findNumericElement(element);
    if (!numericElement) {
      if (this.config.debug) {
        console.log("未找到数值元素", element);
      }
      return false;
    }

    // 获取当前文本
    const currentText = this.getElementText(numericElement);
    if (!currentText) {
      if (this.config.debug) {
        console.log("数值元素文本为空", numericElement);
      }
      return false;
    }

    // 检查文本是否已有后缀
    if (currentText.includes(this.config.suffixText)) {
      return false;
    }

    // 提取数字部分
    const numericMatch = this.extractNumericValue(currentText);
    if (!numericMatch) {
      if (this.config.debug) {
        console.log("无法从文本提取数字", currentText);
      }
      return false;
    }

    const { numericText } = numericMatch;

    // 根据配置选择不同的添加方式
    if (this.config.useSeparateElement) {
      this.addSuffixAsSeparateElement(numericElement, numericText);
    } else {
      this.addSuffixAsText(numericElement, currentText);
    }

    // 标记元素
    element.classList.add("has-amount-suffix");

    return true;
  }

  /**
   * 查找实际的数值元素
   * 处理多层嵌套的情况
   * @param {HTMLElement} element 字段元素
   * @returns {HTMLElement} 数值元素
   */
  findNumericElement(element) {
    // 如果元素本身就是叶节点，直接返回
    if (!element.children.length) {
      return element;
    }

    // 查找包含数字的元素
    const findDeepestTextElement = (el) => {
      // 如果这个元素有文本内容，且包含数字
      const text = this.getElementText(el);
      if (
        text &&
        /\d/.test(text) &&
        !el.classList.contains("amount-suffix-wrapper")
      ) {
        return el;
      }

      // 否则递归查找子元素
      for (let child of el.children) {
        const result = findDeepestTextElement(child);
        if (result) return result;
      }

      return null;
    };

    return findDeepestTextElement(element) || element;
  }

  /**
   * 获取元素文本
   * @param {HTMLElement} element 元素
   * @returns {string} 文本内容
   */
  getElementText(element) {
    if (element.value !== undefined && element.value !== null) {
      return element.value.trim();
    }
    return (element.textContent || element.innerText || "").trim();
  }

  /**
   * 检查是否已有后缀
   * @param {HTMLElement} element 元素
   * @returns {boolean} 是否有后缀
   */
  hasSuffix(element) {
    // 检查元素是否已被标记
    if (element.classList.contains("has-amount-suffix")) {
      return true;
    }

    // 检查是否有独立的后缀元素
    if (element.querySelector(".amount-suffix-separate")) {
      return true;
    }

    // 检查子元素中是否有后缀包装器
    if (element.querySelector(".amount-suffix-wrapper")) {
      return true;
    }

    return false;
  }

  /**
   * 提取数字值
   * @param {string} text 文本
   * @returns {Object|null} 数字信息
   */
  extractNumericValue(text) {
    // 更灵活的正则表达式，匹配各种格式的数字
    const numericMatch = text.match(
      /[-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|[-+]?\d+(?:\.\d+)?/,
    );
    if (!numericMatch) return null;

    const numericText = numericMatch[0];
    const numericValue = numericText.replace(/,/g, "");

    // 验证是否为有效数字
    if (isNaN(parseFloat(numericValue))) {
      return null;
    }

    return { numericText, numericValue };
  }

  /**
   * 添加后缀作为独立元素
   * 优化版：处理多层嵌套结构
   */
  addSuffixAsSeparateElement(numericElement, numericText) {
    if (this.config.debug) {
      console.log("添加独立元素后缀", numericElement, numericText);
    }

    // 创建包装器
    const wrapper = document.createElement("span");
    wrapper.className = "amount-suffix-wrapper";

    // 创建数值元素
    const valueSpan = document.createElement("span");
    valueSpan.className = "amount-value";
    valueSpan.textContent = numericText;

    // 创建后缀元素
    const suffixSpan = document.createElement("span");
    suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
    suffixSpan.textContent = ` ${this.config.suffixText}`;

    // 应用自定义样式
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    // 组装
    wrapper.appendChild(valueSpan);
    wrapper.appendChild(suffixSpan);

    // 获取父元素
    const parentElement = numericElement.parentElement;

    // 替换原数值元素
    parentElement.replaceChild(wrapper, numericElement);

    // 如果父元素是表格单元格，确保包装器继承正确的样式
    if (parentElement.classList.contains("virtual-table-cell")) {
      wrapper.style.display = "inline-flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "flex-end";
    }
  }

  /**
   * 添加后缀作为文本
   */
  addSuffixAsText(element, originalText) {
    if (this.config.debug) {
      console.log("添加文本后缀", element, originalText);
    }

    // 直接在文本后添加后缀
    const newText = originalText + ` ${this.config.suffixText}`;

    if (element.value !== undefined) {
      element.value = newText;
    } else if (element.textContent !== undefined) {
      element.textContent = newText;
    } else if (element.innerText !== undefined) {
      element.innerText = newText;
    }

    // 标记元素
    element.classList.add("has-amount-suffix");
    element.classList.add(this.config.suffixClass);

    // 应用自定义样式
    Object.assign(element.style, this.config.suffixStyle);
  }

  /**
   * 启动监听
   */
  startObserving() {
    this.setupMutationObserver();
    this.setupScrollListener();
    this.startPeriodicCheck();

    // 初始处理
    setTimeout(() => this.processTable(), 100);
  }

  /**
   * 设置MutationObserver
   */
  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      if (this.config.debug) {
        console.log(`表格容器未找到，等待重试: ${this.config.containerId}`);
      }
      setTimeout(() => this.setupMutationObserver(), 1000);
      return;
    }

    // 如果已有观察器，先断开
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          return true;
        }
        if (mutation.type === "characterData") {
          return true;
        }
        return false;
      });

      if (hasRelevantChanges) {
        if (this.config.debug) {
          console.log("DOM变化检测到，重新处理表格");
        }
        // 清除行缓存，重新处理
        this.rowCache.clear();
        setTimeout(() => this.processTable(), 100);
      }
    });

    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 设置滚动监听
   */
  setupScrollListener() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) return;

    let scrollTimer = null;

    const handleScroll = () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(() => {
        // 滚动后重新处理可见区域
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.processTable();
    }, this.config.updateInterval);
  }

  /**
   * 手动重新处理表格
   */
  reapply() {
    // 清除缓存，重新处理所有行
    this.rowCache.clear();
    this.processTable();
  }

  /**
   * 更新配置
   * @param {Object} newOptions 新的配置选项
   */
  updateConfig(newOptions) {
    Object.assign(this.config, newOptions);

    // 重新创建样式
    this.createStyles();

    // 重新处理表格
    this.reapply();
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
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
  }
}

// 默认导出
window.TableAmountSuffix = TableAmountSuffix;
