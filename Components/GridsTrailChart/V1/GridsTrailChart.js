/**
 * 表格金额后缀管理器 - 虚拟滚动/动态渲染专用版
 * 核心策略：强制创建 Flex 包裹层，将编辑器和后缀放在一起
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
      },
      debug: false,
      observerDelay: 300,
      ...options,
    };

    this.container = null;
    this.observer = null;
    this.processedCells = new WeakSet(); // 使用 WeakSet 防止内存泄漏
    this.init();
  }

  init() {
    this.injectGlobalStyles();
    this.waitForContainer();
  }

  // 注入全局样式（关键：强制单元格为 Flex 布局）
  injectGlobalStyles() {
    if (document.getElementById("table-amount-suffix-styles")) return;

    const styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";
    styleEl.textContent = `
            /* 关键修复 1: 强制单元格为 Flex 布局，让内部元素能对齐 */
            .virtual-table-cell[class*="virtual-table-cell"] {
                display: inline-flex !important; 
                align-items: center !important;
                justify-content: flex-end !important; /* 右对齐 */
            }
            
            /* 关键修复 2: 后缀样式 */
            .amount-suffix-separate {
                display: inline-block;
                vertical-align: middle;
                flex-shrink: 0; /* 防止被压缩 */
                white-space: nowrap;
            }

            /* 关键修复 3: 如果编辑器容器存在，确保它也能参与 Flex 布局 */
            .editor-container, .cell-disabled, .nowrap {
                display: inline-flex !important;
                align-items: center !important;
            }
        `;
    document.head.appendChild(styleEl);
  }

  // 等待容器加载（轮询机制）
  waitForContainer() {
    const check = () => {
      const el = document.getElementById(this.config.containerId);
      if (el) {
        this.container = el;
        if (this.config.debug) console.log("[Suffix] 容器已加载，启动监听...");
        this.startObserving();
        this.scanTable(); // 初始扫描
      } else {
        if (this.config.debug)
          console.log("[Suffix] 等待容器:", this.config.containerId);
        setTimeout(check, 500);
      }
    };
    check();
  }

  // 启动 MutationObserver
  startObserving() {
    if (!this.container) return;

    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver(() => {
      // 使用防抖，避免高频变动导致的性能问题
      clearTimeout(this.scanTimer);
      this.scanTimer = setTimeout(
        () => this.scanTable(),
        this.config.observerDelay,
      );
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // 扫描表格
  scanTable() {
    if (!this.container) return;

    // 查找所有目标字段的单元格
    this.config.fieldKeys.forEach((fieldKey) => {
      // 优先查找带 data-key 的
      const cells = this.container.querySelectorAll(`[data-key="${fieldKey}"]`);
      cells.forEach((cell) => this.fixCell(cell));
    });
  }

  // 修复单个单元格（核心逻辑）
  fixCell(cell) {
    // 1. 防止重复处理
    if (this.processedCells.has(cell)) return;

    // 2. 检查是否已经有后缀
    if (cell.querySelector(".amount-suffix-separate")) {
      this.processedCells.add(cell);
      return;
    }

    // 3. 查找编辑器容器或数值元素
    let editor = cell.querySelector(
      '.editor-container, .nowrap, [class*="cell-content"]',
    );

    // 4. 如果找不到编辑器（可能还没渲染出来），但有文本内容
    if (!editor && cell.textContent.trim()) {
      const text = cell.textContent.trim();
      const match = text.match(/[-+]?[0-9,]*\.?[0-9]+/);
      if (match) {
        // 临时处理：直接包裹
        this.wrapContent(cell, text, match[0]);
        this.processedCells.add(cell);
      }
      return;
    }

    // 5. 如果找到了编辑器，执行“包裹”操作
    if (editor) {
      // 检查编辑器是否已经被包裹过
      if (
        editor.parentNode.classList &&
        editor.parentNode.classList.contains("amount-suffix-wrapper")
      ) {
        this.processedCells.add(cell);
        return;
      }

      // --- 核心修复开始 ---
      // A. 创建包裹层
      const wrapper = document.createElement("div");
      wrapper.className = "amount-suffix-wrapper";
      wrapper.style.cssText = `
                display: inline-flex; 
                align-items: center; 
                justify-content: flex-end;
                width: 100%;
                height: 100%;
            `;

      // B. 创建后缀元素
      const suffix = document.createElement("span");
      suffix.className = `amount-suffix-separate ${this.config.suffixClass}`;
      suffix.textContent = ` ${this.config.suffixText}`;
      Object.assign(suffix.style, this.config.suffixStyle);

      // C. 把编辑器移动到 wrapper 里
      // 注意：这里使用 insertBefore 确保不破坏 DOM 顺序
      if (editor.parentNode === cell) {
        wrapper.appendChild(editor);
        wrapper.appendChild(suffix);
        cell.appendChild(wrapper); // 把 wrapper 放回 cell
      } else {
        // 如果编辑器已经在别的地方，直接在编辑器后面插入后缀
        editor.parentNode.insertBefore(suffix, editor.nextSibling);
      }

      // D. 标记为已处理
      this.processedCells.add(cell);

      if (this.config.debug) console.log("[Suffix] 已修复单元格:", fieldKey);
    }
  }

  // 包裹纯文本内容的辅助方法
  wrapContent(cell, fullText, numericText) {
    cell.innerHTML = ""; // 清空

    const wrapper = document.createElement("div");
    wrapper.className = "amount-suffix-wrapper";
    wrapper.style.cssText =
      "display:inline-flex; align-items:center; justify-content:flex-end; width:100%; height:100%;";

    const valSpan = document.createElement("span");
    valSpan.className = "amount-value";
    valSpan.textContent = numericText;

    const suffixSpan = document.createElement("span");
    suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
    suffixSpan.textContent = ` ${this.config.suffixText}`;
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    wrapper.appendChild(valSpan);
    wrapper.appendChild(suffixSpan);
    cell.appendChild(wrapper);
  }

  // 销毁
  destroy() {
    if (this.observer) this.observer.disconnect();
    clearTimeout(this.scanTimer);
    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();
    console.log("[Suffix] 组件已销毁");
  }
}

// 导出
window.TableAmountSuffix = TableAmountSuffix;
