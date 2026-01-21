/**
 * 表格金额字段后缀管理器 (动态框架专用版)
 * 核心策略：
 * 1. 等待容器出现
 * 2. 监听 DOM 变化，而不是只执行一次
 * 3. 识别 .editor-container，将后缀作为兄弟节点插入，而不是覆盖内容
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
      debug: false,
      ...options,
    };

    this.observer = null;
    this.container = null;
    this.processedCells = new Set(); // 记录已处理的单元格，防止重复添加
    this.init();
  }

  init() {
    this.createStyles();
    this.waitForContainer();
  }

  createStyles() {
    let styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();

    styleEl = document.createElement("style");
    styleEl.id = "table-amount-suffix-styles";
    // 关键样式：让后缀变成 inline-block，以便能和编辑器容器并排
    styleEl.textContent = `
            .amount-suffix-separate {
                display: inline-block;
                vertical-align: middle;
                ${this.objectToCss(this.config.suffixStyle)}
            }
            /* 确保父容器是 flex 布局以便对齐 */
            .virtual-table-cell {
                display: flex !important; 
                align-items: center !important;
                justify-content: flex-end !important;
            }
        `;
    document.head.appendChild(styleEl);
  }

  objectToCss(obj) {
    return Object.entries(obj)
      .map(([k, v]) => k.replace(/([A-Z])/g, "-$1").toLowerCase() + ":" + v)
      .join(";");
  }

  // 1. 等待容器加载
  waitForContainer() {
    const checkContainer = () => {
      const el = document.getElementById(this.config.containerId);
      if (el) {
        this.container = el;
        if (this.config.debug)
          console.log("[Suffix] 容器已找到:", this.config.containerId);
        this.startObserving();
        // 初始扫描一次
        this.scanAndProcess();
      } else {
        if (this.config.debug)
          console.log("[Suffix] 等待容器:", this.config.containerId);
        setTimeout(checkContainer, 500); // 每500ms检查一次
      }
    };
    checkContainer();
  }

  // 2. 启动 MutationObserver
  startObserving() {
    if (!this.container) return;

    // 断开旧的观察器
    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver((mutations) => {
      // 只要有变化，就重新扫描（防抖处理在 scanAndProcess 内部）
      this.debounce(() => this.scanAndProcess(), 300);
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // 3. 扫描并处理所有行
  scanAndProcess() {
    if (!this.container) return;

    // 查找所有带 data-key 的单元格
    const cells = this.container.querySelectorAll(`[data-key]`);

    cells.forEach((cell) => {
      // 检查是否是我们要处理的字段
      const fieldKey = cell.getAttribute("data-key");
      if (!this.config.fieldKeys.includes(fieldKey)) return;

      // 检查是否已处理过
      const cellId = `${fieldKey}-${cell.getAttribute("data-index") || Math.random()}`;
      if (this.processedCells.has(cellId)) return;

      // 核心逻辑：处理单元格
      this.processCell(cell);
    });
  }

  // 4. 处理单个单元格（核心修复逻辑）
  processCell(cell) {
    // 如果已经有后缀了，跳过
    if (cell.querySelector(".amount-suffix-separate")) {
      const cellId = `${cell.getAttribute("data-key")}-${cell.getAttribute("data-index")}`;
      this.processedCells.add(cellId);
      return;
    }

    // 情况 A：框架还没渲染 editor-container，只有纯文本
    // 情况 B：框架已经渲染了 editor-container
    let valueWrapper = cell.querySelector(
      '.editor-container, .nowrap, [class*="cell-content"]',
    );

    // 如果找不到包装器，且单元格内有文本，说明是情况 A
    if (!valueWrapper && cell.textContent.trim()) {
      // 直接使用单元格本身作为包装器（兼容旧逻辑）
      this.injectSuffix(cell, cell.textContent.trim());
    }
    // 如果找到了包装器，说明是情况 B（这是导致重叠的原因）
    else if (valueWrapper) {
      // 关键修复：不要动 valueWrapper，把后缀插在它后面！
      this.injectSuffix(cell, valueWrapper.textContent.trim(), valueWrapper);
    }

    // 标记为已处理
    const cellId = `${cell.getAttribute("data-key")}-${cell.getAttribute("data-index")}`;
    this.processedCells.add(cellId);
  }

  // 5. 注入后缀的具体实现
  injectSuffix(parentElement, text, afterElement = null) {
    // 提取数字
    const match = text.match(/[-+]?[0-9,]*\.?[0-9]+/);
    if (!match) return;

    const numericText = match[0];

    // 创建后缀元素
    const suffixSpan = document.createElement("span");
    suffixSpan.className = `amount-suffix-separate ${this.config.suffixClass}`;
    suffixSpan.textContent = ` ${this.config.suffixText}`;
    Object.assign(suffixSpan.style, this.config.suffixStyle);

    if (afterElement) {
      // 策略：插入到 editor-container 的后面（作为兄弟节点）
      // 但为了布局，最好把它们包在一个 flex 容器里
      // 如果父元素不是 flex，强制设置
      if (!afterElement.nextSibling) {
        parentElement.insertBefore(suffixSpan, afterElement.nextSibling);
      }

      // 额外保险：如果父元素是虚拟表格的 cell，它本身应该是 flex
      // 我们只需要确保后缀在 DOM 树中位于 editor 之后即可
      // 虚拟表格通常使用 absolute 定位，所以简单的 insertBefore 通常能工作

      // 但是，根据你提供的错误HTML，后缀被放在了 editor-container 之外，但还在 cell 之内
      // 所以我们需要确保 editor-container 和 suffix 都在 cell 里面，且 cell 是 flex

      // 尝试把后缀移到 editor 旁边
      // 注意：这里不再使用 innerHTML = ''，而是直接 append 或 insertBefore
      if (afterElement.nextSibling !== suffixSpan) {
        parentElement.insertBefore(suffixSpan, afterElement.nextSibling);
      }
    } else {
      // 降级方案：替换内容（不推荐，但作为保底）
      parentElement.innerHTML = ""; // 清空
      const wrapper = document.createElement("span");
      wrapper.className = "amount-suffix-wrapper";
      wrapper.style.cssText = "display:inline-flex; align-items:center;";

      const valSpan = document.createElement("span");
      valSpan.className = "amount-value";
      valSpan.textContent = numericText;

      wrapper.appendChild(valSpan);
      wrapper.appendChild(suffixSpan);
      parentElement.appendChild(wrapper);
    }
  }

  // 防抖函数
  debounce(func, wait) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, wait);
  }

  // 销毁
  destroy() {
    if (this.observer) this.observer.disconnect();
    clearTimeout(this.debounceTimer);
    const styleEl = document.getElementById("table-amount-suffix-styles");
    if (styleEl) styleEl.remove();
  }
}

// 导出到全局
window.TableAmountSuffix = TableAmountSuffix;

// ==========================================
// 使用方式（在你的 loadScript 回调中）
// ==========================================
/*
$NG.loadScript('https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Components.all.osd.min.js', function () {
    console.log('组件加载完成，启动后缀管理器...');
    
    // 直接初始化，它会自动等待容器出现
    const manager = new TableAmountSuffix({
        containerId: 'p_form_expert_fee_apply_d1',
        fieldKeys: ['u_unit_price'],
        suffixText: '元',
        suffixClass: '',
        debug: true
    });

    // 如果需要销毁（比如单页应用切换页面）
    // manager.destroy();

}, function (error) {
    console.error('加载失败:', error);
});
*/
