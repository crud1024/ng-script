(function () {
  "use strict";

  console.log("开始加载 TableCellSuffixAppender 组件...");

  /**
   * 给表格数据单元格添加后缀
   * @param {Object} options 配置选项
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
    }

    init() {
      this.processExistingRows();
      this.startObserving();
      return this;
    }

    processExistingRows() {
      const tableContainer = document.getElementById(this.tableId);
      if (!tableContainer) {
        console.warn(`Table container with id "${this.tableId}" not found.`);
        return;
      }

      const detailRows = tableContainer.querySelectorAll(".table-row");
      detailRows.forEach((row) => this.processRow(row));

      const aggregateRows = tableContainer.querySelectorAll(".aggregates-row");
      aggregateRows.forEach((row) => this.processRow(row));
    }

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

    processCell(cell, fieldKey, suffixConfig) {
      const cellId = this.generateCellId(cell, fieldKey);
      if (this.uniqueCellIds.has(cellId)) return;

      this.uniqueCellIds.add(cellId);
      const numberSpan = this.findNumberSpan(cell);

      if (numberSpan) {
        const existingSuffix =
          numberSpan.parentNode.querySelector(".cell-suffix");
        if (existingSuffix) {
          existingSuffix.remove();
        }

        const suffixElement = this.createSuffixElement(suffixConfig);
        numberSpan.parentNode.insertBefore(
          suffixElement,
          numberSpan.nextSibling,
        );
      }
    }

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

    startObserving() {
      const tableContainer = document.getElementById(this.tableId);
      if (!tableContainer || this.isObserving) return;

      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            setTimeout(() => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                  if (
                    node.classList &&
                    (node.classList.contains("table-row") ||
                      node.classList.contains("aggregates-row"))
                  ) {
                    this.processRow(node);
                  }
                }
              });
            }, 0);
          }
        });
      });

      this.observer.observe(tableContainer, {
        childList: true,
        subtree: true,
      });

      this.isObserving = true;
    }

    stopObserving() {
      if (this.observer) {
        this.observer.disconnect();
        this.isObserving = false;
      }
    }

    update(newOptions) {
      if (newOptions.tableId) this.tableId = newOptions.tableId;
      if (newOptions.fieldSuffixMap)
        this.fieldSuffixMap = newOptions.fieldSuffixMap;
      if (newOptions.style) Object.assign(this.style, newOptions.style);

      this.uniqueCellIds.clear();
      this.processExistingRows();
    }

    refresh() {
      const tableContainer = document.getElementById(this.tableId);
      if (tableContainer) {
        const existingSuffixes =
          tableContainer.querySelectorAll(".cell-suffix");
        existingSuffixes.forEach((suffix) => suffix.remove());
      }

      this.uniqueCellIds.clear();
      this.processExistingRows();
    }

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

  // 全局实例管理器
  const _tableSuffixInstances = new Map();

  /**
   * 便捷初始化函数
   */
  function initTableCellSuffix(options) {
    const appender = new TableCellSuffixAppender(options);
    return appender.init();
  }

  /**
   * 安全初始化函数（避免重复）
   */
  function safeInitTableCellSuffix(options) {
    const key = options.tableId;

    if (_tableSuffixInstances.has(key)) {
      _tableSuffixInstances.get(key).destroy();
    }

    const instance = initTableCellSuffix(options);
    _tableSuffixInstances.set(key, instance);
    return instance;
  }

  // =============== 关键部分：确保挂载到全局 ===============
  try {
    // 先检查当前环境
    const isBrowser = typeof window !== "undefined";
    const isNode = typeof module !== "undefined" && module.exports;

    if (isBrowser) {
      // 挂载到 window 对象
      window.TableCellSuffixAppender = TableCellSuffixAppender;
      window.initTableCellSuffix = initTableCellSuffix;
      window.safeInitTableCellSuffix = safeInitTableCellSuffix;

      // 添加一个标志，表示组件已加载
      window.__tableCellSuffixLoaded = true;

      console.log("TableCellSuffixAppender 组件已成功挂载到全局！");
      console.log("- 可用类：TableCellSuffixAppender");
      console.log("- 可用函数：initTableCellSuffix, safeInitTableCellSuffix");

      // 触发自定义事件，通知组件已加载
      if (typeof CustomEvent !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("TableCellSuffixAppenderLoaded", {
            detail: {
              TableCellSuffixAppender,
              initTableCellSuffix,
              safeInitTableCellSuffix,
            },
          }),
        );
      }
    }

    if (isNode) {
      // Node.js 环境导出
      module.exports = {
        TableCellSuffixAppender,
        initTableCellSuffix,
        safeInitTableCellSuffix,
        _tableSuffixInstances,
      };
    }
  } catch (error) {
    console.error("挂载 TableCellSuffixAppender 时出错:", error);
  }

  console.log("TableCellSuffixAppender 组件加载完成！");
})();
