/**
 * 表格金额字段后缀管理器（修复版）
 * @class TableAmountSuffix
 */
class TableAmountSuffix {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    // 合并默认配置
    this.config = {
      containerId: "p_form_no_collected_cost_d1",
      fieldKeys: ["u_no_collected_amt"],
      suffixText: "元",
      suffixClass: "amount-suffix",
      suffixStyle: {
        color: "#999",
        marginLeft: "2px",
        fontSize: "inherit",
        fontWeight: "normal",
      },
      useSeparateElement: true,
      scrollDebounceTime: 300,
      updateInterval: 1000,
      autoObserve: true,
      debug: false,
      maxRetryCount: 10,
      retryDelay: 500,
      ...options,
    };

    // 状态变量
    this.observer = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isProcessing = false;
    this.modifiedCount = 0;
    this.rowCache = new Map();
    this.retryCount = 0;
    this.isInitialized = false;

    // 初始化
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    // 创建样式
    this.createStyles();

    // 等待DOM就绪
    this.waitForDOMReady()
      .then(() => {
        // 启动监听
        if (this.config.autoObserve) {
          this.startObserving();
          this.isInitialized = true;

          if (this.config.debug) {
            console.log("TableAmountSuffix 初始化完成");
          }
        }
      })
      .catch((error) => {
        console.error("TableAmountSuffix 初始化失败:", error);
      });
  }

  /**
   * 等待DOM就绪
   */
  waitForDOMReady() {
    return new Promise((resolve) => {
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        resolve();
        return;
      }

      const checkReady = () => {
        const container = document.getElementById(this.config.containerId);
        if (container) {
          resolve();
        } else if (this.retryCount < this.config.maxRetryCount) {
          this.retryCount++;
          setTimeout(checkReady, this.config.retryDelay);
        } else {
          resolve(); // 即使没找到也继续
        }
      };

      document.addEventListener("DOMContentLoaded", checkReady);
      setTimeout(checkReady, 100);
    });
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
            flex-wrap: nowrap;
        }
        
        .amount-value {
            flex-shrink: 0;
            white-space: nowrap;
        }
        
        .amount-suffix {
            white-space: nowrap;
        }
        
        .has-amount-suffix .nowrap {
            display: inline-flex !important;
            align-items: center !important;
        }
        
        .has-amount-suffix .nowrap > span {
            display: inline-flex !important;
            align-items: center !important;
        }
    `;

    // 如果使用独立元素，添加默认样式
    if (this.config.useSeparateElement) {
      styles += `
            .amount-suffix-separate {
                display: inline-block;
                white-space: nowrap;
                ${this.objectToCss(this.config.suffixStyle)}
            }
            
            .virtual-table-cell.has-amount-suffix {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
            }
        `;
    }

    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
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
          console.log(`TableAmountSuffix: 处理了 ${result} 个字段`);
        }
      } catch (error) {
        console.error("TableAmountSuffix 处理表格时出错:", error);
      } finally {
        this.isProcessing = false;
        this.timeoutId = null;
      }
    }, 150);
  }

  /**
   * 添加后缀到表格
   */
  addSuffixToTable() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      if (this.config.debug) {
        console.warn(
          `TableAmountSuffix: 容器 ${this.config.containerId} 未找到`,
        );
      }
      return 0;
    }

    // 查找所有包含金额字段的单元格
    let currentModified = 0;

    // 遍历配置的字段
    this.config.fieldKeys.forEach((fieldKey) => {
      // 查找所有包含该字段的单元格
      const cells = tableContainer.querySelectorAll(`[data-key="${fieldKey}"]`);

      cells.forEach((cell, index) => {
        const rowKey = this.getCellKey(cell, index);

        // 检查是否已经处理过
        if (
          this.rowCache.has(rowKey) &&
          this.rowCache.get(rowKey) === "processed"
        ) {
          return;
        }

        // 尝试处理单元格
        if (this.processCell(cell, fieldKey)) {
          currentModified++;
          this.rowCache.set(rowKey, "processed");
        }
      });
    });

    if (currentModified > 0) {
      this.modifiedCount += currentModified;
      if (this.config.debug) {
        console.log(
          `TableAmountSuffix: 表格金额后缀添加完成，累计处理 ${this.modifiedCount} 个字段`,
        );
      }
    }

    return currentModified;
  }

  /**
   * 获取单元格唯一标识
   */
  getCellKey(cell, index) {
    const rowIndex = cell.closest("[data-row-index], [data-index]");
    const dataKey = cell.getAttribute("data-key");

    if (rowIndex) {
      const rowId =
        rowIndex.getAttribute("data-row-index") ||
        rowIndex.getAttribute("data-index") ||
        rowIndex.getAttribute("id");
      return `${dataKey}-${rowId}`;
    }

    return `${dataKey}-${index}`;
  }

  /**
   * 处理单个单元格
   */
  processCell(cell, fieldKey) {
    if (!cell) return false;

    // 检查是否已有后缀
    if (this.hasSuffix(cell)) {
      return false;
    }

    // 找到实际显示文本的元素
    const textElement = this.findTextElement(cell);
    if (!textElement) return false;

    // 获取当前文本
    const currentText = this.getElementText(textElement);
    if (!currentText) return false;

    // 提取数字部分
    const numericMatch = this.extractNumericValue(currentText);
    if (!numericMatch) return false;

    const { numericText } = numericMatch;

    // 根据配置添加后缀
    if (this.config.useSeparateElement) {
      return this.addSuffixAsSeparateElement(cell, textElement, numericText);
    } else {
      return this.addSuffixAsText(cell, textElement, numericText);
    }
  }

  /**
   * 查找包含文本的元素
   */
  findTextElement(cell) {
    // 尝试多种可能的选择器
    const selectors = [
      ".nowrap",
      ".nowrap > span",
      ".editor-container",
      ".editor-container > span",
      '[class*="text"]',
      '[class*="value"]',
      "span",
    ];

    for (const selector of selectors) {
      const element = cell.querySelector(selector);
      if (element && this.getElementText(element).trim()) {
        return element;
      }
    }

    // 如果没有找到，返回单元格本身
    return cell;
  }

  /**
   * 检查是否已有后缀
   */
  hasSuffix(element) {
    if (element.classList.contains("has-amount-suffix")) {
      return true;
    }

    if (element.querySelector(".amount-suffix-separate")) {
      return true;
    }

    const text = this.getElementText(element);
    return text.includes(this.config.suffixText);
  }

  /**
   * 提取数字值
   */
  extractNumericValue(text) {
    // 移除空白字符
    const cleanText = text.replace(/\s+/g, "");

    // 匹配数字（包括千位分隔符和小数）
    const numericMatch = cleanText.match(/[-+]?[0-9,]*\.?[0-9]+/);
    if (!numericMatch) return null;

    const numericText = numericMatch[0];
    const numericValue = numericText.replace(/,/g, "");

    if (isNaN(parseFloat(numericValue))) {
      return null;
    }

    return { numericText, numericValue };
  }

  /**
   * 添加后缀作为独立元素
   */
  addSuffixAsSeparateElement(cell, textElement, numericText) {
    try {
      // 标记单元格
      cell.classList.add("has-amount-suffix");

      // 创建包装器
      const wrapper = document.createElement("span");
      wrapper.className = "amount-suffix-wrapper";

      // 获取现有的内容结构
      let contentElement = textElement;

      // 如果 textElement 内部有 span 包含文本，就用那个
      if (textElement.querySelector("span")) {
        const innerSpan = textElement.querySelector("span");
        if (innerSpan.textContent.trim() === numericText) {
          contentElement = innerSpan;
        }
      }

      // 备份原有内容
      const originalContent = contentElement.innerHTML;

      // 清空并重新构建
      wrapper.innerHTML = `
                <span class="amount-value">${numericText}</span>
                <span class="amount-suffix-separate ${this.config.suffixClass}">${this.config.suffixText}</span>
            `;

      // 应用自定义样式到后缀
      const suffixSpan = wrapper.querySelector(".amount-suffix-separate");
      Object.assign(suffixSpan.style, this.config.suffixStyle);

      // 替换内容
      if (contentElement === cell) {
        cell.innerHTML = "";
        cell.appendChild(wrapper);
      } else {
        contentElement.innerHTML = "";
        contentElement.appendChild(wrapper);
      }

      return true;
    } catch (error) {
      console.error("添加后缀失败:", error);
      return false;
    }
  }

  /**
   * 添加后缀作为文本
   */
  addSuffixAsText(cell, textElement, numericText) {
    try {
      // 直接在文本后添加后缀
      const newText = numericText + ` ${this.config.suffixText}`;

      if (textElement.textContent !== undefined) {
        textElement.textContent = newText;
      } else if (textElement.innerText !== undefined) {
        textElement.innerText = newText;
      }

      // 标记元素
      cell.classList.add("has-amount-suffix");
      textElement.classList.add(this.config.suffixClass);

      // 应用自定义样式
      Object.assign(textElement.style, this.config.suffixStyle);

      return true;
    } catch (error) {
      console.error("添加后缀文本失败:", error);
      return false;
    }
  }

  /**
   * 获取元素文本
   */
  getElementText(element) {
    if (!element) return "";

    // 尝试多种获取文本的方式
    const text =
      element.textContent || element.innerText || element.value || "";
    return text.toString().trim();
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
   * 启动监听
   */
  startObserving() {
    this.setupMutationObserver();
    this.startPeriodicCheck();

    // 初始处理，尝试多次以确保处理成功
    setTimeout(() => this.processTable(), 100);
    setTimeout(() => this.processTable(), 500);
    setTimeout(() => this.processTable(), 1000);
  }

  /**
   * 设置MutationObserver
   */
  setupMutationObserver() {
    const tableContainer = document.getElementById(this.config.containerId);
    if (!tableContainer) {
      if (this.config.debug) {
        console.warn("TableAmountSuffix: 未找到表格容器，稍后重试");
      }
      setTimeout(() => this.setupMutationObserver(), 1000);
      return;
    }

    // 如果已有观察器，先断开
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(() => {
      // 清除缓存，重新处理
      this.rowCache.clear();
      this.processTable();
    });

    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    if (this.config.debug) {
      console.log("TableAmountSuffix: MutationObserver 已启动");
    }
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
    this.rowCache.clear();
    this.processTable();
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) {
      styleEl.remove();
    }

    this.rowCache.clear();
    this.isInitialized = false;
  }
}

// 导出到全局
window.TableAmountSuffix = TableAmountSuffix;

// 自动初始化函数（可选）
window.initTableAmountSuffix = function (options) {
  return new TableAmountSuffix(options);
};
