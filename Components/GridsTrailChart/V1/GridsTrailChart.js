/**
 * 表格金额字段后缀管理器（简化版 - 在原元素中更新值）
 * @class TableAmountSuffixSimple
 */
class TableAmountSuffixSimple {
  constructor(options = {}) {
    this.config = {
      containerId: "p_form_expert_fee_apply_d1",
      fieldKeys: ["u_unit_price"],
      suffixText: "元",
      suffixClass: "",
      suffixStyle: {
        color: "#999",
        marginLeft: "2px",
        fontSize: "inherit",
      },
      debug: true,
      updateInterval: 1000,
      ...options,
    };

    this.processedCells = new Set();
    this.observer = null;
    this.intervalId = null;
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.createStyles();
    this.startObserving();

    // 初始处理
    setTimeout(() => this.processAllCells(), 500);
    setTimeout(() => this.processAllCells(), 1500);
  }

  /**
   * 创建样式
   */
  createStyles() {
    const styleId = "table-amount-suffix-simple-styles";
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = styleId;

    // 主要样式：确保后缀有正确的颜色和间距
    styleEl.textContent = `
            .amount-suffix-text {
                color: #999 !important;
                margin-left: 2px !important;
            }
            
            .has-amount-suffix-simple {
                display: inline !important;
            }
        `;

    document.head.appendChild(styleEl);
  }

  /**
   * 处理所有单元格
   */
  processAllCells() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      if (this.config.debug)
        console.warn("容器未找到:", this.config.containerId);
      return;
    }

    let processedCount = 0;

    this.config.fieldKeys.forEach((fieldKey) => {
      const cells = container.querySelectorAll(`[data-key="${fieldKey}"]`);

      cells.forEach((cell, index) => {
        if (this.processedCells.has(cell)) return;

        if (this.updateCellValue(cell)) {
          this.processedCells.add(cell);
          processedCount++;
        }
      });
    });

    if (this.config.debug && processedCount > 0) {
      console.log(`处理了 ${processedCount} 个单元格`);
    }
  }

  /**
   * 更新单元格值（在原元素中更新）
   */
  updateCellValue(cell) {
    if (!cell) return false;

    try {
      // 找到包含数字的span元素
      const numberSpan = this.findNumberSpan(cell);
      if (!numberSpan) {
        if (this.config.debug) console.log("未找到数字span:", cell);
        return false;
      }

      // 获取原始文本
      const originalText = numberSpan.textContent || numberSpan.innerText || "";
      const trimmedText = originalText.trim();

      // 检查是否已有后缀
      if (trimmedText.includes(this.config.suffixText)) {
        return false;
      }

      // 提取数字
      const numericValue = this.extractNumeric(trimmedText);
      if (!numericValue) {
        if (this.config.debug) console.log("未提取到数字:", trimmedText);
        return false;
      }

      // 获取当前元素的样式
      const originalStyle = window.getComputedStyle(numberSpan);

      // 创建新的HTML内容
      const newHTML = this.createSuffixHTML(numericValue, originalStyle);

      // 更新元素内容
      numberSpan.innerHTML = newHTML;

      // 标记为已处理
      cell.classList.add("has-amount-suffix-simple");

      if (this.config.debug) {
        console.log("更新单元格成功:", {
          originalText: trimmedText,
          newValue: numericValue + " " + this.config.suffixText,
        });
      }

      return true;
    } catch (error) {
      console.error("更新单元格时出错:", error);
      return false;
    }
  }

  /**
   * 查找包含数字的span元素
   */
  findNumberSpan(cell) {
    // 尝试多种可能的span元素
    const selectors = [
      ".nowrap > span",
      ".nowrap span",
      ".editor-container span",
      "span.nowrap",
      "span",
    ];

    for (const selector of selectors) {
      const span = cell.querySelector(selector);
      if (span && span.textContent) {
        const text = span.textContent.trim();
        if (text && /\d/.test(text)) {
          return span;
        }
      }
    }

    // 如果没有找到合适的span，使用第一个span
    const firstSpan = cell.querySelector("span");
    if (firstSpan) {
      return firstSpan;
    }

    return null;
  }

  /**
   * 提取数字
   */
  extractNumeric(text) {
    // 移除所有空白
    const cleanText = text.replace(/\s+/g, "");

    // 匹配数字（包括小数）
    const match = cleanText.match(/(\d[\d,]*\.?\d*)/);
    if (!match) return null;

    const numericText = match[1];
    const number = parseFloat(numericText.replace(/,/g, ""));

    if (isNaN(number)) return null;

    // 格式化为两位小数
    return number.toFixed(2);
  }

  /**
   * 创建带后缀的HTML
   */
  createSuffixHTML(numericValue, originalStyle) {
    // 创建一个包装器来包含数值和后缀
    return `
            <span style="
                display: inline;
                color: ${originalStyle.color};
                font-size: ${originalStyle.fontSize};
                font-family: ${originalStyle.fontFamily};
                font-weight: ${originalStyle.fontWeight};
            ">
                ${numericValue}
            </span>
            <span class="amount-suffix-text" style="
                color: ${this.config.suffixStyle.color} !important;
                margin-left: ${this.config.suffixStyle.marginLeft} !important;
                font-size: ${this.config.suffixStyle.fontSize || originalStyle.fontSize} !important;
                font-family: ${originalStyle.fontFamily} !important;
                font-weight: ${originalStyle.fontWeight} !important;
                display: inline;
            ">
                ${this.config.suffixText}
            </span>
        `;
  }

  /**
   * 开始观察
   */
  startObserving() {
    // 定期检查
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.processAllCells();
    }, this.config.updateInterval);

    // MutationObserver
    const container = document.getElementById(this.config.containerId);
    if (container) {
      this.setupMutationObserver(container);
    } else {
      // 延迟重试
      setTimeout(() => this.startObserving(), 1000);
    }
  }

  /**
   * 设置MutationObserver
   */
  setupMutationObserver(container) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(() => {
      // 当表格发生变化时，重新处理
      this.processedCells.clear();
      setTimeout(() => this.processAllCells(), 100);
    });

    this.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 重新处理所有单元格
   */
  reapply() {
    this.processedCells.clear();
    this.processAllCells();
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const styleEl = document.getElementById(
      "table-amount-suffix-simple-styles",
    );
    if (styleEl) {
      styleEl.remove();
    }

    this.processedCells.clear();
  }
}

// 导出
window.TableAmountSuffixSimple = TableAmountSuffixSimple;
