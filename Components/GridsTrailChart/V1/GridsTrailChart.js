/**
 * 表格金额字段后缀管理器（修复执行时机问题）
 * @class TableAmountSuffix
 */
class TableAmountSuffix {
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
      useSeparateElement: true,
      autoObserve: true,
      debug: true,
      waitForStable: 2000, // 等待DOM稳定时间
      retryAttempts: 5,
      ...options,
    };

    this.processedCells = new Map();
    this.observer = null;
    this.intervalId = null;
    this.retryCount = 0;
    this.isInitializing = false;

    this.init();
  }

  /**
   * 初始化
   */
  init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    this.createStyles();

    // 等待DOM完全稳定
    this.waitForStableDOM()
      .then(() => {
        this.startObserving();
        this.forceProcess();
      })
      .catch((err) => {
        console.error("等待DOM稳定失败:", err);
      });
  }

  /**
   * 等待DOM稳定
   */
  waitForStableDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "complete") {
        setTimeout(resolve, 500);
        return;
      }

      const checkStable = () => {
        const container = document.getElementById(this.config.containerId);
        if (container && container.querySelector("[data-key]")) {
          // 等待额外时间确保DOM完全渲染
          setTimeout(resolve, this.config.waitForStable);
        } else {
          setTimeout(checkStable, 300);
        }
      };

      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(checkStable, 500);
      });

      checkStable();
    });
  }

  /**
   * 创建样式
   */
  createStyles() {
    const existingStyle = document.getElementById("table-amount-suffix-styles");
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";
    styleEl.textContent = `
            .amount-suffix-wrapper {
                display: inline-flex;
                align-items: center;
                white-space: nowrap;
            }
            .amount-suffix-separate {
                display: inline-block;
                ${this.objectToCss(this.config.suffixStyle)}
            }
            .virtual-table-cell.amount-suffix-processed {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
            }
        `;
    document.head.appendChild(styleEl);
  }

  /**
   * 强制处理（修复重叠问题）
   */
  forceProcess() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.warn("容器未找到:", this.config.containerId);
      return;
    }

    // 先清除可能存在的重复后缀
    this.cleanupDuplicateSuffixes();

    // 处理每个字段
    this.config.fieldKeys.forEach((fieldKey) => {
      const cells = container.querySelectorAll(`[data-key="${fieldKey}"]`);
      cells.forEach((cell, index) => {
        this.processCellSafely(cell, fieldKey, index);
      });
    });

    if (this.config.debug) {
      console.log("强制处理完成");
    }
  }

  /**
   * 清理重复的后缀
   */
  cleanupDuplicateSuffixes() {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    // 移除所有已添加的后缀元素
    const suffixElements = container.querySelectorAll(
      ".amount-suffix-separate",
    );
    suffixElements.forEach((el) => {
      // 只移除那些不在正确位置的重复后缀
      const wrapper = el.closest(".amount-suffix-wrapper");
      if (!wrapper || !wrapper.contains(el)) {
        el.remove();
      }
    });

    // 清除已处理的标记
    const processedCells = container.querySelectorAll(
      ".amount-suffix-processed",
    );
    processedCells.forEach((cell) => {
      cell.classList.remove("amount-suffix-processed");
    });
  }

  /**
   * 安全处理单元格
   */
  processCellSafely(cell, fieldKey, index) {
    if (!cell || cell.classList.contains("amount-suffix-processed")) {
      return;
    }

    try {
      // 获取单元格的真实文本内容
      const textContent = this.getCellTextContent(cell);
      if (!textContent) return;

      // 检查是否已经有后缀
      if (this.hasSuffix(cell, textContent)) {
        cell.classList.add("amount-suffix-processed");
        return;
      }

      // 提取数字
      const numericValue = this.extractNumeric(textContent);
      if (!numericValue) return;

      // 替换单元格内容
      this.replaceCellContent(cell, numericValue);

      // 标记为已处理
      cell.classList.add("amount-suffix-processed");

      if (this.config.debug) {
        console.log("处理单元格:", { fieldKey, index, numericValue });
      }
    } catch (error) {
      console.error("处理单元格时出错:", error);
    }
  }

  /**
   * 获取单元格文本内容
   */
  getCellTextContent(cell) {
    // 尝试多种方式获取文本
    let text = "";

    // 1. 尝试获取 .nowrap > span 的文本
    const nowrapSpan = cell.querySelector(".nowrap > span");
    if (nowrapSpan && nowrapSpan.textContent) {
      text = nowrapSpan.textContent.trim();
    }

    // 2. 如果上面没有，尝试获取 .nowrap 的文本
    if (!text) {
      const nowrap = cell.querySelector(".nowrap");
      if (nowrap && nowrap.textContent) {
        text = nowrap.textContent.trim();
      }
    }

    // 3. 如果还没有，尝试获取 .editor-container 的文本
    if (!text) {
      const editor = cell.querySelector(".editor-container");
      if (editor && editor.textContent) {
        text = editor.textContent.trim();
      }
    }

    // 4. 最后使用单元格本身的文本
    if (!text && cell.textContent) {
      text = cell.textContent.trim();
    }

    return text;
  }

  /**
   * 检查是否已有后缀
   */
  hasSuffix(cell, textContent) {
    if (textContent.includes(this.config.suffixText)) {
      return true;
    }

    if (cell.querySelector(".amount-suffix-separate")) {
      return true;
    }

    return false;
  }

  /**
   * 提取数字
   */
  extractNumeric(text) {
    // 移除所有空白和货币符号
    const cleanText = text.replace(/\s+/g, "").replace(/[^\d.-]/g, "");
    const match = cleanText.match(/([-+]?[\d,]*\.?\d+)/);

    if (!match) return null;

    // 移除千位分隔符
    const numeric = match[1].replace(/,/g, "");

    // 验证是否为有效数字
    const number = parseFloat(numeric);
    if (isNaN(number)) return null;

    // 格式化为两位小数
    return number.toFixed(2);
  }

  /**
   * 替换单元格内容
   */
  replaceCellContent(cell, numericValue) {
    // 清空单元格内容
    cell.innerHTML = "";

    // 创建包装器
    const wrapper = document.createElement("span");
    wrapper.className = "amount-suffix-wrapper";

    // 创建数值显示
    const valueSpan = document.createElement("span");
    valueSpan.className = "amount-value";
    valueSpan.textContent = numericValue;

    // 创建后缀
    const suffixSpan = document.createElement("span");
    suffixSpan.className = "amount-suffix-separate";
    suffixSpan.textContent = ` ${this.config.suffixText}`;

    // 应用样式
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    // 组装
    wrapper.appendChild(valueSpan);
    wrapper.appendChild(suffixSpan);
    cell.appendChild(wrapper);
  }

  /**
   * 开始观察
   */
  startObserving() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      setTimeout(() => this.startObserving(), 1000);
      return;
    }

    // 设置MutationObserver
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        this.forceProcess();
      }
    });

    this.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // 定期检查
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.forceProcess();
    }, 3000);

    if (this.config.debug) {
      console.log("开始观察表格变化");
    }
  }

  /**
   * 辅助方法：对象转CSS
   */
  objectToCss(obj) {
    return Object.entries(obj)
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`,
      )
      .join(" ");
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

    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) {
      styleEl.remove();
    }
  }
}

// 导出
window.TableAmountSuffix = TableAmountSuffix;
