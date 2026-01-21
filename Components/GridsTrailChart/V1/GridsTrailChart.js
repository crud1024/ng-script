/**
 * 表格金额字段后缀管理器（极简版 - 直接修改原span）
 * @class TableAmountSuffixDirect
 */
class TableAmountSuffixDirect {
  constructor(options = {}) {
    this.config = {
      containerId: "p_form_expert_fee_apply_d1",
      fieldKeys: ["u_unit_price"],
      suffixText: "元",
      suffixStyle: {
        color: "#999",
        marginLeft: "2px",
      },
      debug: true,
      ...options,
    };

    this.processedSpans = new Set();
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    // 直接开始处理
    setTimeout(() => this.processTable(), 300);
    setTimeout(() => this.processTable(), 1000);
    setTimeout(() => this.processTable(), 2000);

    // 监听变化
    this.setupObserver();
  }

  /**
   * 处理表格
   */
  processTable() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      if (this.config.debug)
        console.warn("容器未找到:", this.config.containerId);
      return;
    }

    this.config.fieldKeys.forEach((fieldKey) => {
      // 找到所有单元格
      const cells = container.querySelectorAll(`[data-key="${fieldKey}"]`);

      cells.forEach((cell) => {
        // 找到最内层的span（包含数字的）
        const numberSpan = this.findNumberSpan(cell);
        if (!numberSpan) return;

        // 如果已经处理过，跳过
        if (this.processedSpans.has(numberSpan)) return;

        // 获取当前文本
        const currentText = numberSpan.textContent.trim();
        if (!currentText) return;

        // 检查是否已有后缀
        if (currentText.includes(this.config.suffixText)) {
          this.processedSpans.add(numberSpan);
          return;
        }

        // 提取数字
        const numericValue = this.extractNumeric(currentText);
        if (!numericValue) return;

        // 直接在原span中更新HTML
        this.updateSpanContent(numberSpan, numericValue);

        // 标记为已处理
        this.processedSpans.add(numberSpan);

        if (this.config.debug) {
          console.log("更新span内容:", {
            before: currentText,
            after: numericValue + " " + this.config.suffixText,
          });
        }
      });
    });
  }

  /**
   * 找到包含数字的span
   */
  findNumberSpan(cell) {
    // 从内到外查找包含数字的span
    const allSpans = cell.querySelectorAll("span");
    for (let i = allSpans.length - 1; i >= 0; i--) {
      const span = allSpans[i];
      const text = span.textContent.trim();
      if (text && /\d/.test(text)) {
        return span;
      }
    }
    return null;
  }

  /**
   * 提取数字
   */
  extractNumeric(text) {
    const match = text.match(/(\d[\d,]*\.?\d*)/);
    if (!match) return null;

    const numericText = match[1];
    const number = parseFloat(numericText.replace(/,/g, ""));

    if (isNaN(number)) return null;

    return number.toFixed(2);
  }

  /**
   * 更新span内容
   */
  updateSpanContent(span, numericValue) {
    // 创建后缀元素
    const suffixSpan = document.createElement("span");
    suffixSpan.textContent = ` ${this.config.suffixText}`;

    // 应用样式
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    // 清空原span内容
    span.textContent = "";

    // 添加数字和后缀
    span.appendChild(document.createTextNode(numericValue));
    span.appendChild(suffixSpan);
  }

  /**
   * 设置观察者
   */
  setupObserver() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      setTimeout(() => this.setupObserver(), 1000);
      return;
    }

    // MutationObserver 监听变化
    const observer = new MutationObserver(() => {
      // 当表格变化时，重新处理
      this.processTable();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // 定期检查
    setInterval(() => this.processTable(), 3000);
  }

  /**
   * 重新处理
   */
  reapply() {
    this.processedSpans.clear();
    this.processTable();
  }
}

// 导出
window.TableAmountSuffixDirect = TableAmountSuffixDirect;
