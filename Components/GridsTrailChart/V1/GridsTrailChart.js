/**
 * 给表格数据单元格添加后缀
 */
class TableCellSuffixAppender {
  constructor(options) {
    this.tableId = options.tableId;
    this.fieldSuffixMap = options.fieldSuffixMap || {};
    this.style = Object.assign(
      {
        color: "#1890ff",
        fontSize: "inherit",
        marginLeft: "2px",
        fontWeight: "normal",
      },
      options.style || {},
    );

    this.observer = null;
    this.isObserving = false;
    this.uniqueCellIds = new Set();

    // 初始化样式
    this.initStyles();
  }

  // 初始化样式
  initStyles() {
    if (document.getElementById("table-suffix-styles")) return;

    const style = document.createElement("style");
    style.id = "table-suffix-styles";
    style.textContent = `
      .cell-suffix {
        color: #1890ff !important;
        font-size: inherit !important;
        margin-left: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化并开始监听表格变化
  init() {
    this.processExistingRows();
    this.startObserving();
    return this;
  }

  // 处理已存在的行
  processExistingRows() {
    const tableContainer = document.getElementById(this.tableId);
    if (!tableContainer) {
      console.warn(`Table container with id "${this.tableId}" not found.`);
      return;
    }

    // 处理明细行
    const detailRows = tableContainer.querySelectorAll(".table-row");
    detailRows.forEach((row) => this.processRow(row));

    // 处理合计行
    const aggregateRows = tableContainer.querySelectorAll(".aggregates-row");
    aggregateRows.forEach((row) => this.processRow(row));
  }

  // 处理单行
  processRow(row) {
    Object.keys(this.fieldSuffixMap).forEach((fieldKey) => {
      const suffixConfig = this.fieldSuffixMap[fieldKey];
      if (!suffixConfig || !suffixConfig.suffix) return;

      const cellSelector = `div[data-key="${fieldKey}"]`;
      const cell = row.querySelector(cellSelector);

      if (cell) {
        this.processCell(cell, fieldKey, suffixConfig);
      }
    });
  }

  // 处理单个单元格
  processCell(cell, fieldKey, suffixConfig) {
    const cellId = this.generateCellId(cell, fieldKey);
    if (this.uniqueCellIds.has(cellId)) return;

    this.uniqueCellIds.add(cellId);
    const numberSpan = this.findNumberSpan(cell);

    if (numberSpan) {
      const existingSuffix =
        numberSpan.parentNode.querySelector(".cell-suffix");
      if (existingSuffix) existingSuffix.remove();

      const suffixElement = this.createSuffixElement(suffixConfig);
      numberSpan.parentNode.insertBefore(suffixElement, numberSpan.nextSibling);
    }
  }

  // 查找包含数字的最内层span元素
  findNumberSpan(cell) {
    const allSpans = cell.querySelectorAll("span");
    const numberRegex = /^[\d,]+(\.\d+)?$/;

    for (let i = allSpans.length - 1; i >= 0; i--) {
      const span = allSpans[i];
      const text = span.textContent.trim();

      if (numberRegex.test(text.replace(/,/g, ""))) {
        if (span.children.length === 0) {
          return span;
        }

        const childSpans = span.querySelectorAll("span");
        let hasChildNumberSpan = false;

        for (let j = 0; j < childSpans.length; j++) {
          const childText = childSpans[j].textContent.trim();
          if (numberRegex.test(childText.replace(/,/g, ""))) {
            hasChildNumberSpan = true;
            break;
          }
        }

        if (!hasChildNumberSpan) {
          return span;
        }
      }
    }

    return null;
  }

  // 创建后缀元素
  createSuffixElement(suffixConfig) {
    const suffixSpan = document.createElement("span");
    suffixSpan.className = "cell-suffix";
    suffixSpan.textContent = suffixConfig.suffix;

    suffixSpan.style.color = this.style.color;
    suffixSpan.style.fontSize = this.style.fontSize;
    suffixSpan.style.marginLeft = this.style.marginLeft;
    suffixSpan.style.fontWeight = this.style.fontWeight;

    if (suffixConfig.style) {
      if (suffixConfig.style.color)
        suffixSpan.style.color = suffixConfig.style.color;
      if (suffixConfig.style.fontSize)
        suffixSpan.style.fontSize = suffixConfig.style.fontSize;
      if (suffixConfig.style.marginLeft)
        suffixSpan.style.marginLeft = suffixConfig.style.marginLeft;
      if (suffixConfig.style.fontWeight)
        suffixSpan.style.fontWeight = suffixConfig.style.fontWeight;
    }

    return suffixSpan;
  }

  // 生成单元格唯一标识
  generateCellId(cell, fieldKey) {
    const row = cell.closest(".table-row, .aggregates-row");
    if (!row) return `${fieldKey}_${Math.random()}`;

    let rowIndex = -1;
    const parent = row.parentNode;
    if (parent) {
      const rows = parent.querySelectorAll(".table-row, .aggregates-row");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] === row) {
          rowIndex = i;
          break;
        }
      }
    }

    const rect = cell.getBoundingClientRect();
    return `${fieldKey}_${rowIndex}_${rect.top}_${rect.left}`;
  }

  // 开始监听DOM变化
  startObserving() {
    const tableContainer = document.getElementById(this.tableId);
    if (!tableContainer || this.isObserving) return;

    this.observer = new MutationObserver(() => {
      this.processExistingRows();
    });

    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
    });

    this.isObserving = true;
  }

  // 停止监听
  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.isObserving = false;
    }
  }

  // 更新配置
  update(newOptions) {
    if (newOptions.tableId) this.tableId = newOptions.tableId;
    if (newOptions.fieldSuffixMap)
      this.fieldSuffixMap = newOptions.fieldSuffixMap;
    if (newOptions.style) Object.assign(this.style, newOptions.style);

    this.uniqueCellIds.clear();
    this.processExistingRows();
  }

  // 刷新表格中的所有后缀
  refresh() {
    const tableContainer = document.getElementById(this.tableId);
    if (tableContainer) {
      const existingSuffixes = tableContainer.querySelectorAll(".cell-suffix");
      existingSuffixes.forEach((suffix) => suffix.remove());
    }

    this.uniqueCellIds.clear();
    this.processExistingRows();
  }

  // 销毁实例
  destroy() {
    this.stopObserving();
    this.uniqueCellIds.clear();

    const tableContainer = document.getElementById(this.tableId);
    if (tableContainer) {
      const suffixes = tableContainer.querySelectorAll(".cell-suffix");
      suffixes.forEach((suffix) => suffix.remove());
    }
  }
}

// === 关键部分：模仿 Message.js 的挂载方式 ===

// 定义辅助函数
function initTableCellSuffix(options) {
  const appender = new TableCellSuffixAppender(options);
  return appender.init();
}

// 全局实例管理器
const _tableSuffixInstances = {};

function safeInitTableCellSuffix(options) {
  const key = options.tableId;

  if (_tableSuffixInstances[key]) {
    _tableSuffixInstances[key].destroy();
  }

  const instance = initTableCellSuffix(options);
  _tableSuffixInstances[key] = instance;
  return instance;
}

// === 按照 Message.js 的方式挂载到全局 ===

// 关键：先检查是否在浏览器环境
if (typeof window !== "undefined") {
  // 1. 挂载类到全局
  window.TableCellSuffixAppender = TableCellSuffixAppender;

  // 2. 挂载辅助函数到全局
  window.initTableCellSuffix = initTableCellSuffix;
  window.safeInitTableCellSuffix = safeInitTableCellSuffix;

  // 3. 挂载管理器到全局
  window._tableSuffixInstances = _tableSuffixInstances;

  // 4. 创建全局对象（可选）
  window.TableCellSuffix = {
    TableCellSuffixAppender: TableCellSuffixAppender,
    initTableCellSuffix: initTableCellSuffix,
    safeInitTableCellSuffix: safeInitTableCellSuffix,
    getInstance: function (tableId) {
      return _tableSuffixInstances[tableId];
    },
  };

  console.log("TableCellSuffixAppender 已成功加载到 window 对象");
}

// === 兼容其他模块系统 ===

// CommonJS 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TableCellSuffixAppender: TableCellSuffixAppender,
    initTableCellSuffix: initTableCellSuffix,
    safeInitTableCellSuffix: safeInitTableCellSuffix,
    _tableSuffixInstances: _tableSuffixInstances,
  };
}

// ES6 模块导出（如果需要）
if (typeof exports !== "undefined") {
  exports.TableCellSuffixAppender = TableCellSuffixAppender;
  exports.initTableCellSuffix = initTableCellSuffix;
  exports.safeInitTableCellSuffix = safeInitTableCellSuffix;
}
