/**
 * 表格金额后缀管理器 - 最终版（强制包裹方案）
 * 针对 .editor-container 结构的专项修复
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
        display: "inline-block",
        verticalAlign: "middle",
        lineHeight: "1", // 防止行高导致的偏移
      },
      debug: false,
      ...options,
    };

    this.container = null;
    this.observer = null;
    this.processedCells = new WeakSet();
    this.init();
  }

  init() {
    this.injectStyles();
    this.waitForContainer();
  }

  injectStyles() {
    if (document.getElementById("table-amount-suffix-styles")) return;
    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";
    // 核心CSS：强制单元格内部使用Flex布局，且不换行
    styleEl.textContent = `
            .virtual-table-cell.has-amount-suffix {
                display: inline-flex !important; 
                align-items: center !important;
                justify-content: flex-end !important; /* 右对齐 */
                flex-wrap: nowrap !important; /* 禁止换行 */
            }
            /* 后缀样式 */
            .amount-suffix-separate {
                display: inline-block !important;
                flex-shrink: 0 !important; /* 禁止收缩 */
                vertical-align: middle !important;
            }
            /* 关键：让编辑器容器也变成行内Flex，不要独占一行 */
            .virtual-table-cell .editor-container {
                display: inline-flex !important;
                align-items: center !important;
                flex-shrink: 1 !important; /* 允许收缩 */
                min-width: 0 !important; /* 防止溢出 */
            }
            /* 针对 nowrap span 的修复 */
            .virtual-table-cell .nowrap {
                display: inline-block !important;
                vertical-align: middle !important;
            }
        `;
    document.head.appendChild(styleEl);
  }

  waitForContainer() {
    const check = () => {
      const el = document.getElementById(this.config.containerId);
      if (el) {
        this.container = el;
        if (this.config.debug) console.log("[Suffix] 容器就绪");
        this.startObserving();
        this.processTable(); // 初始执行
      } else {
        if (this.config.debug) console.log("[Suffix] 等待容器...");
        setTimeout(check, 300);
      }
    };
    check();
  }

  startObserving() {
    if (!this.container) return;
    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver(() => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.processTable(), 200);
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  processTable() {
    if (!this.container) return;

    this.config.fieldKeys.forEach((fieldKey) => {
      const cells = this.container.querySelectorAll(`[data-key="${fieldKey}"]`);
      cells.forEach((cell) => this.fixCell(cell));
    });
  }

  fixCell(cell) {
    // 1. 防重入：如果已经处理过，或者正在处理中，跳过
    if (this.processedCells.has(cell)) return;

    // 2. 检查是否已有后缀（通过类名判断）
    if (cell.querySelector(".amount-suffix-separate")) {
      cell.classList.add("has-amount-suffix");
      this.processedCells.add(cell);
      return;
    }

    // 3. 查找核心元素
    const editor = cell.querySelector(".editor-container");

    // 情况A：还没有渲染出 editor，只有纯文本（初始状态）
    if (!editor && cell.textContent.trim()) {
      const match = cell.textContent.match(/[-+]?[0-9,]*\.?[0-9]+/);
      if (match) {
        this.createWrapper(cell, match[0], null);
        this.processedCells.add(cell);
      }
      return;
    }

    // 情况B：已经有 editor 了（这是导致重叠的主要场景）
    if (editor) {
      // 核心逻辑：创建一个 Wrapper，把 editor 和 后缀包在一起
      const wrapper = document.createElement("div");
      wrapper.className = "amount-suffix-wrapper-inner";

      // 应用 Flex 布局
      Object.assign(wrapper.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
        height: "100%",
      });

      // 创建后缀
      const suffix = document.createElement("span");
      suffix.className = `amount-suffix-separate ${this.config.suffixClass}`;
      suffix.textContent = ` ${this.config.suffixText}`;
      Object.assign(suffix.style, this.config.suffixStyle);

      // --- 关键操作：替换 DOM ---
      // 1. 把 editor 从原位置移除
      const parent = editor.parentNode;

      // 2. 把 wrapper 插入到 editor 原来的位置
      if (parent) {
        parent.insertBefore(wrapper, editor);
      } else {
        cell.appendChild(wrapper);
      }

      // 3. 把 editor 和 suffix 放进 wrapper
      wrapper.appendChild(editor);
      wrapper.appendChild(suffix);

      // 4. 标记单元格
      cell.classList.add("has-amount-suffix");
      this.processedCells.add(cell);

      if (this.config.debug) console.log("[Suffix] 已包裹编辑器:", fieldKey);
    }
  }

  // 备用方案：处理纯文本单元格
  createWrapper(cell, numericText, originalFullText) {
    cell.innerHTML = ""; // 清空
    cell.classList.add("has-amount-suffix");

    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "flex-end",
      width: "100%",
      height: "100%",
    });

    const valSpan = document.createElement("span");
    valSpan.textContent = numericText;
    // 保持原有的文本样式继承
    Object.assign(valSpan.style, {
      display: "inline-block",
      verticalAlign: "middle",
    });

    const suffixSpan = document.createElement("span");
    suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
    suffixSpan.textContent = ` ${this.config.suffixText}`;
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    wrapper.appendChild(valSpan);
    wrapper.appendChild(suffixSpan);
    cell.appendChild(wrapper);
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    clearTimeout(this.timer);
    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();
  }
}

window.TableAmountSuffix = TableAmountSuffix;
