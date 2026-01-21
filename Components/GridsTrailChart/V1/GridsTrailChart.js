/**
 * TableCellSuffixAppender - 表格数据单元格添加后缀组件
 * 仿 NG-Slider 的实现方式
 * 更新：优化导出方式，确保全局可用
 */

(function () {
  "use strict";

  /**
   * TableCellSuffixAppender 表格数据单元格添加后缀组件
   * @class
   */
  class TableCellSuffixAppender {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
      // 默认配置
      this.config = {
        tableId: "",
        fieldSuffixMap: {},
        style: {
          color: "#1890ff",
          fontSize: "inherit",
          marginLeft: "2px",
          fontWeight: "normal",
        },
        preserveOriginal: true,
        onChange: null,
        onComplete: null,
        ...options,
      };

      // 合并style配置
      if (options.style) {
        this.config.style = {
          ...this.config.style,
          ...options.style,
        };
      }

      // 内部状态
      this.state = {
        uniqueCellIds: new Set(),
        isObserving: false,
        processedRows: 0,
        processedCells: 0,
      };

      // DOM元素引用
      this.elements = {
        tableContainer: null,
        observer: null,
      };

      // 绑定方法上下文
      this.handleMutation = this.handleMutation.bind(this);
      this.processRow = this.processRow.bind(this);

      // 初始化
      this.init();
    }

    /**
     * 初始化组件
     */
    init() {
      // 获取表格容器
      this.elements.tableContainer =
        typeof this.config.tableId === "string"
          ? document.getElementById(this.config.tableId)
          : this.config.tableId;

      if (!this.elements.tableContainer) {
        console.warn(
          `Table container with id "${this.config.tableId}" not found.`,
        );
        return this;
      }

      // 保存原始元素状态（如果需要）
      if (this.config.preserveOriginal) {
        this.preserveOriginalElements();
      }

      // 处理现有行
      this.processExistingRows();

      // 开始监听
      this.startObserving();

      // 触发完成回调
      if (this.config.onComplete) {
        setTimeout(() => {
          this.config.onComplete(this.state);
        }, 0);
      }

      return this;
    }

    /**
     * 保存并隐藏容器中的原始元素
     */
    preserveOriginalElements() {
      // 如果表格容器中有非表格内容，可以在这里处理
      // 当前实现暂不需要
    }

    /**
     * 处理已存在的行
     */
    processExistingRows() {
      if (!this.elements.tableContainer) return;

      // 处理明细行
      const detailRows =
        this.elements.tableContainer.querySelectorAll(".table-row");
      detailRows.forEach((row) => this.processRow(row));

      // 处理合计行
      const aggregateRows =
        this.elements.tableContainer.querySelectorAll(".aggregates-row");
      aggregateRows.forEach((row) => this.processRow(row));

      // 更新状态
      this.state.processedRows = detailRows.length + aggregateRows.length;
    }

    /**
     * 处理单行
     * @param {HTMLElement} row 行元素
     */
    processRow(row) {
      Object.keys(this.config.fieldSuffixMap).forEach((fieldKey) => {
        const suffixConfig = this.config.fieldSuffixMap[fieldKey];
        if (!suffixConfig || !suffixConfig.suffix) return;

        // 在当前行中查找指定字段的单元格
        const cellSelector = `div[data-key="${fieldKey}"]`;
        const cell = row.querySelector(cellSelector);

        if (cell) {
          this.processCell(cell, fieldKey, suffixConfig);
        }
      });
    }

    /**
     * 处理单个单元格
     * @param {HTMLElement} cell 单元格元素
     * @param {string} fieldKey 字段key
     * @param {Object} suffixConfig 后缀配置
     */
    processCell(cell, fieldKey, suffixConfig) {
      // 生成单元格唯一标识
      const cellId = this.generateCellId(cell, fieldKey);

      // 如果已经处理过，跳过
      if (this.state.uniqueCellIds.has(cellId)) {
        return;
      }

      // 标记为已处理
      this.state.uniqueCellIds.add(cellId);

      // 查找包含数字的最内层span元素
      const numberSpan = this.findNumberSpan(cell);

      if (numberSpan) {
        // 检查是否已经添加过后缀
        const existingSuffix =
          numberSpan.parentNode.querySelector(".cell-suffix");
        if (existingSuffix) {
          // 如果已存在后缀，移除旧的
          existingSuffix.remove();
        }

        // 创建并添加后缀元素
        const suffixElement = this.createSuffixElement(suffixConfig);
        numberSpan.parentNode.insertBefore(
          suffixElement,
          numberSpan.nextSibling,
        );

        // 更新处理计数
        this.state.processedCells++;

        // 触发变化回调
        if (this.config.onChange) {
          setTimeout(() => {
            this.config.onChange({
              cell,
              fieldKey,
              suffix: suffixConfig.suffix,
              state: this.state,
            });
          }, 0);
        }
      }
    }

    /**
     * 查找包含数字的最内层span元素
     * @param {HTMLElement} cell 单元格元素
     * @returns {HTMLElement|null} 找到的span元素或null
     */
    findNumberSpan(cell) {
      // 查找所有span元素
      const allSpans = cell.querySelectorAll("span");

      // 正则匹配数字（包括带千分位逗号的数字）
      const numberRegex = /^[\d,]+(\.\d+)?$/;

      // 从最内层开始查找
      for (let i = allSpans.length - 1; i >= 0; i--) {
        const span = allSpans[i];
        const text = span.textContent.trim();

        // 检查是否为纯数字
        if (numberRegex.test(text.replace(/,/g, ""))) {
          // 检查是否有子元素
          if (span.children.length === 0) {
            return span;
          }

          // 如果有子元素，检查子元素中是否包含数字span
          const childSpans = span.querySelectorAll("span");
          let hasChildNumberSpan = false;

          for (let j = 0; j < childSpans.length; j++) {
            const childText = childSpans[j].textContent.trim();
            if (numberRegex.test(childText.replace(/,/g, ""))) {
              hasChildNumberSpan = true;
              break;
            }
          }

          // 如果没有包含数字的子span，返回当前span
          if (!hasChildNumberSpan) {
            return span;
          }
        }
      }

      return null;
    }

    /**
     * 创建后缀元素
     * @param {Object} suffixConfig 后缀配置
     * @returns {HTMLElement} 后缀元素
     */
    createSuffixElement(suffixConfig) {
      const suffixSpan = document.createElement("span");
      suffixSpan.className = "cell-suffix";
      suffixSpan.textContent = suffixConfig.suffix;

      // 应用基础样式
      Object.assign(suffixSpan.style, this.config.style);

      // 应用自定义样式（如果提供）
      if (suffixConfig.style) {
        Object.assign(suffixSpan.style, suffixConfig.style);
      }

      return suffixSpan;
    }

    /**
     * 生成单元格唯一标识
     * @param {HTMLElement} cell 单元格元素
     * @param {string} fieldKey 字段key
     * @returns {string} 单元格唯一标识
     */
    generateCellId(cell, fieldKey) {
      const row = cell.closest(".table-row, .aggregates-row");
      if (!row) return `${fieldKey}_${Date.now()}_${Math.random()}`;

      // 使用行索引和单元格位置
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);
      const cellIndex = Array.from(row.children).indexOf(cell);

      return `${this.config.tableId}_${fieldKey}_${rowIndex}_${cellIndex}`;
    }

    /**
     * 处理DOM变化
     */
    handleMutation(mutations) {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // 处理新增的节点
          setTimeout(() => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                // Element node
                // 检查是否为行元素
                if (
                  node.classList &&
                  (node.classList.contains("table-row") ||
                    node.classList.contains("aggregates-row"))
                ) {
                  this.processRow(node);
                  this.state.processedRows++;
                }
              }
            });
          }, 0);
        }
      });
    }

    /**
     * 开始监听DOM变化
     */
    startObserving() {
      if (!this.elements.tableContainer || this.state.isObserving) return this;

      // 创建MutationObserver监听DOM变化
      this.elements.observer = new MutationObserver(this.handleMutation);

      // 开始观察
      this.elements.observer.observe(this.elements.tableContainer, {
        childList: true,
        subtree: true,
      });

      this.state.isObserving = true;
      return this;
    }

    /**
     * 停止监听DOM变化
     */
    stopObserving() {
      if (this.elements.observer) {
        this.elements.observer.disconnect();
        this.state.isObserving = false;
      }
      return this;
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig = {}) {
      // 合并配置
      if (newConfig.style) {
        this.config.style = {
          ...this.config.style,
          ...newConfig.style,
        };
      }

      if (newConfig.fieldSuffixMap) {
        this.config.fieldSuffixMap = newConfig.fieldSuffixMap;
      }

      // 重新处理所有行
      this.refresh();

      return this;
    }

    /**
     * 刷新表格中的所有后缀
     */
    refresh() {
      // 停止监听
      this.stopObserving();

      // 移除所有已存在的后缀
      if (this.elements.tableContainer) {
        const existingSuffixes =
          this.elements.tableContainer.querySelectorAll(".cell-suffix");
        existingSuffixes.forEach((suffix) => suffix.remove());
      }

      // 清除状态
      this.state.uniqueCellIds.clear();
      this.state.processedCells = 0;
      this.state.processedRows = 0;

      // 重新处理现有行
      this.processExistingRows();

      // 重新开始监听
      this.startObserving();

      return this;
    }

    /**
     * 重新扫描表格，处理新行或未处理的行
     */
    rescan() {
      this.refresh();
      return this;
    }

    /**
     * 获取当前值
     */
    getValue() {
      return {
        tableId: this.config.tableId,
        ...this.state,
      };
    }

    /**
     * 获取处理状态
     */
    getStatus() {
      return {
        tableId: this.config.tableId,
        processedRows: this.state.processedRows,
        processedCells: this.state.processedCells,
        isObserving: this.state.isObserving,
        uniqueCellIds: this.state.uniqueCellIds.size,
      };
    }

    /**
     * 启用组件
     */
    enable() {
      this.startObserving();
      return this;
    }

    /**
     * 禁用组件
     */
    disable() {
      this.stopObserving();
      return this;
    }

    /**
     * 销毁组件
     */
    destroy() {
      this.stopObserving();

      // 移除所有已添加的后缀
      if (this.elements.tableContainer) {
        const suffixes =
          this.elements.tableContainer.querySelectorAll(".cell-suffix");
        suffixes.forEach((suffix) => suffix.remove());
      }

      // 清除状态
      this.state.uniqueCellIds.clear();
      this.state.processedCells = 0;
      this.state.processedRows = 0;
      this.state.isObserving = false;

      return this;
    }
  }

  // ============================================
  // 优化的导出方式 - 确保在window上可用
  // ============================================

  // 先确保window对象存在
  if (typeof window !== "undefined") {
    // 直接赋值给window，使用多个可能的名称确保可用性
    window.TableCellSuffixAppender = TableCellSuffixAppender;

    // 同时设置别名，与Message.js保持一致的模式
    window.TableCellSuffixAppenderClass = TableCellSuffixAppender;

    // 如果有TableAmountSuffix存在，可能是同一个类
    if (!window.TableAmountSuffix) {
      window.TableAmountSuffix = TableCellSuffixAppender;
    }

    // 设置一个标志，表示类已加载
    window.__TableCellSuffixAppenderLoaded = true;

    console.log("TableCellSuffixAppender已注册到全局对象", {
      TableCellSuffixAppender: typeof TableCellSuffixAppender,
      TableAmountSuffix: typeof window.TableAmountSuffix,
      NGSlider: typeof window.NGSlider,
      Message: typeof window.Message,
    });
  }

  // ============================================
  // 初始化辅助函数
  // ============================================

  /**
   * 通用选择器初始化函数
   * @param {string} selector - 选择器
   * @param {Object} options - 默认配置
   * @returns {Array} 初始化的实例数组
   */
  window.initTableSuffix = function (
    selector = ".table-container",
    options = {},
  ) {
    const containers = document.querySelectorAll(selector);
    const instances = [];

    containers.forEach((container) => {
      let dataOptions = {};
      try {
        dataOptions = JSON.parse(container.dataset.suffixOptions || "{}");
      } catch (e) {
        console.warn("Invalid suffix options in data attribute", e);
      }

      const instanceOptions = {
        tableId: container.id || "",
        ...options,
        ...dataOptions,
      };

      const instance = new TableCellSuffixAppender(instanceOptions);
      instances.push(instance);

      // 将实例附加到容器元素上
      container._tableSuffixAppender = instance;
    });

    return instances;
  };

  /**
   * 通过data属性自动初始化
   */
  window.autoInitTableSuffix = function () {
    const containers = document.querySelectorAll("[data-table-suffix]");
    containers.forEach((container) => {
      const tableId = container.id || container.dataset.tableId;
      if (!tableId) {
        console.warn(
          "Table container must have an id or data-table-id attribute",
        );
        return;
      }

      try {
        const options = JSON.parse(container.dataset.tableSuffix || "{}");
        new TableCellSuffixAppender({
          tableId: tableId,
          ...options,
        });
      } catch (e) {
        console.warn("Invalid data-table-suffix attribute", e);
      }
    });
  };

  /**
   * 手动初始化函数，可在任何地方调用
   * @param {string|Object} tableIdOrOptions - 表格ID或配置对象
   * @param {Object} fieldSuffixMap - 字段后缀映射表
   * @returns {TableCellSuffixAppender} 实例
   */
  window.createTableSuffixAppender = function (
    tableIdOrOptions,
    fieldSuffixMap,
  ) {
    let options;

    if (typeof tableIdOrOptions === "string") {
      options = {
        tableId: tableIdOrOptions,
        fieldSuffixMap: fieldSuffixMap || {},
      };
    } else {
      options = tableIdOrOptions;
    }

    if (!options.tableId) {
      console.error("Table ID is required");
      return null;
    }

    try {
      const instance = new TableCellSuffixAppender(options);
      console.log(
        `TableCellSuffixAppender created for table: ${options.tableId}`,
        instance.getStatus(),
      );
      return instance;
    } catch (error) {
      console.error("Failed to create TableCellSuffixAppender:", error);
      return null;
    }
  };

  /**
   * 获取指定表格的实例
   * @param {string} tableId - 表格ID
   * @returns {TableCellSuffixAppender|null} 实例
   */
  window.getTableSuffixAppender = function (tableId) {
    const container = document.getElementById(tableId);
    if (container && container._tableSuffixAppender) {
      return container._tableSuffixAppender;
    }
    return null;
  };

  // ============================================
  // 自动初始化
  // ============================================

  // 如果DOM已经加载完成，立即执行自动初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.autoInitTableSuffix);
  } else {
    // DOM已经加载完成，立即执行
    setTimeout(window.autoInitTableSuffix, 0);
  }

  // ============================================
  // 模块化支持
  // ============================================

  // UMD模式导出，支持CommonJS/AMD/全局变量
  if (typeof define === "function" && define.amd) {
    // AMD
    define([], function () {
      return TableCellSuffixAppender;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    // CommonJS
    module.exports = TableCellSuffixAppender;
    module.exports.initTableSuffix = window.initTableSuffix;
    module.exports.autoInitTableSuffix = window.autoInitTableSuffix;
    module.exports.createTableSuffixAppender = window.createTableSuffixAppender;
    module.exports.getTableSuffixAppender = window.getTableSuffixAppender;
  }
})();
