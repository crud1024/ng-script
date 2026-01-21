(function () {
  "use strict";

  /**
   * 给表格数据单元格添加后缀
   * @param {Object} options 配置选项
   * @param {string} options.tableId 表格容器ID（例如："p_form_expert_fee_apply_d1"）
   * @param {Object} options.fieldSuffixMap 字段后缀映射对象，key为data-key值，value为后缀配置
   * @param {Object} [options.style] 后缀样式配置
   * @param {string} [options.style.color="#1890ff"] 字体颜色
   * @param {string} [options.style.fontSize="inherit"] 字体大小
   * @param {string} [options.style.marginLeft="2px"] 左边距
   * @param {string} [options.style.fontWeight="normal"] 字体粗细
   */
  class TableCellSuffixAppender {
    constructor(options) {
      this.tableId = options.tableId;
      this.fieldSuffixMap = options.fieldSuffixMap || {};
      this.style = Object.assign(
        {
          color: "#1890ff",
          fontSize: "12px",
          marginLeft: "2px",
          fontWeight: "normal",
        },
        options.style || {},
      );

      this.observer = null;
      this.isObserving = false;
      this.uniqueCellIds = new Set();
    }

    /**
     * 初始化并开始监听表格变化
     */
    init() {
      console.log(`TableCellSuffixAppender: 开始初始化表格 ${this.tableId}`);
      this.processExistingRows();
      this.startObserving();
      return this;
    }

    /**
     * 处理已存在的行
     */
    processExistingRows() {
      const tableContainer = document.getElementById(this.tableId);
      if (!tableContainer) {
        console.warn(
          `TableCellSuffixAppender: 表格容器 "${this.tableId}" 未找到`,
        );
        return;
      }

      console.log(`TableCellSuffixAppender: 处理已存在的行`);

      // 处理明细行
      const detailRows = tableContainer.querySelectorAll(".table-row");
      console.log(
        `TableCellSuffixAppender: 找到 ${detailRows.length} 个明细行`,
      );
      detailRows.forEach((row) => this.processRow(row));

      // 处理合计行
      const aggregateRows = tableContainer.querySelectorAll(".aggregates-row");
      console.log(
        `TableCellSuffixAppender: 找到 ${aggregateRows.length} 个合计行`,
      );
      aggregateRows.forEach((row) => this.processRow(row));
    }

    /**
     * 处理单行
     * @param {HTMLElement} row 行元素
     */
    processRow(row) {
      Object.keys(this.fieldSuffixMap).forEach((fieldKey) => {
        const suffixConfig = this.fieldSuffixMap[fieldKey];
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
      if (this.uniqueCellIds.has(cellId)) {
        return;
      }

      // 标记为已处理
      this.uniqueCellIds.add(cellId);

      // 移除已存在的后缀
      const existingSuffixes = cell.querySelectorAll(".cell-suffix");
      if (existingSuffixes.length > 0) {
        existingSuffixes.forEach((suffix) => suffix.remove());
      }

      // 查找包含数字的最内层span元素
      const numberSpan = this.findNumberSpan(cell);

      if (numberSpan) {
        // 创建并添加后缀元素
        const suffixElement = this.createSuffixElement(suffixConfig);

        // 插入到数字span后面
        if (numberSpan.parentNode) {
          numberSpan.parentNode.insertBefore(
            suffixElement,
            numberSpan.nextSibling,
          );
          console.log(
            `TableCellSuffixAppender: 为单元格 ${fieldKey} 添加后缀 "${suffixConfig.suffix}"`,
          );
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
          return span;
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
      suffixSpan.style.color = this.style.color;
      suffixSpan.style.fontSize = this.style.fontSize;
      suffixSpan.style.marginLeft = this.style.marginLeft;
      suffixSpan.style.fontWeight = this.style.fontWeight;

      // 应用自定义样式（如果提供）
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

    /**
     * 生成单元格唯一标识
     * @param {HTMLElement} cell 单元格元素
     * @param {string} fieldKey 字段key
     * @returns {string} 单元格唯一标识
     */
    generateCellId(cell, fieldKey) {
      const row = cell.closest(".table-row, .aggregates-row");
      if (!row) return `${fieldKey}_${Date.now()}_${Math.random()}`;

      const rowIndexAttr =
        row.getAttribute("data-index") || row.getAttribute("index");
      if (rowIndexAttr) {
        return `${fieldKey}_${rowIndexAttr}`;
      }

      // 尝试获取行索引
      const parent = row.parentNode;
      if (parent) {
        const rows = parent.querySelectorAll(".table-row, .aggregates-row");
        for (let i = 0; i < rows.length; i++) {
          if (rows[i] === row) {
            return `${fieldKey}_${i}`;
          }
        }
      }

      return `${fieldKey}_${Date.now()}_${Math.random()}`;
    }

    /**
     * 开始监听DOM变化
     */
    startObserving() {
      const tableContainer = document.getElementById(this.tableId);
      if (!tableContainer || this.isObserving) return;

      console.log(`TableCellSuffixAppender: 开始监听表格变化`);

      // 创建MutationObserver监听DOM变化
      this.observer = new MutationObserver((mutations) => {
        let shouldProcess = false;

        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            shouldProcess = true;
          }
        });

        if (shouldProcess) {
          // 使用setTimeout确保DOM完全更新
          setTimeout(() => {
            console.log(`TableCellSuffixAppender: 检测到表格变化，重新处理`);
            this.processExistingRows();
          }, 100);
        }
      });

      // 开始观察
      this.observer.observe(tableContainer, {
        childList: true,
        subtree: true,
      });

      this.isObserving = true;
    }

    /**
     * 停止监听
     */
    stopObserving() {
      if (this.observer) {
        this.observer.disconnect();
        this.isObserving = false;
        console.log(`TableCellSuffixAppender: 停止监听表格变化`);
      }
    }

    /**
     * 更新配置
     * @param {Object} newOptions 新配置
     */
    update(newOptions) {
      if (newOptions.tableId) {
        this.tableId = newOptions.tableId;
      }

      if (newOptions.fieldSuffixMap) {
        this.fieldSuffixMap = newOptions.fieldSuffixMap;
      }

      if (newOptions.style) {
        Object.assign(this.style, newOptions.style);
      }

      // 重新处理所有行
      this.uniqueCellIds.clear();
      this.processExistingRows();
    }

    /**
     * 刷新表格中的所有后缀
     */
    refresh() {
      console.log(`TableCellSuffixAppender: 刷新所有后缀`);

      // 移除所有已存在的后缀
      const tableContainer = document.getElementById(this.tableId);
      if (tableContainer) {
        const existingSuffixes =
          tableContainer.querySelectorAll(".cell-suffix");
        console.log(
          `TableCellSuffixAppender: 移除 ${existingSuffixes.length} 个已存在的后缀`,
        );
        existingSuffixes.forEach((suffix) => suffix.remove());
      }

      // 重新处理所有行
      this.uniqueCellIds.clear();
      this.processExistingRows();
    }

    /**
     * 重新扫描表格，处理新行或未处理的行
     */
    rescan() {
      console.log(`TableCellSuffixAppender: 重新扫描表格`);
      this.uniqueCellIds.clear();
      this.processExistingRows();
    }

    /**
     * 获取当前处理状态
     * @returns {Object} 状态信息
     */
    getStatus() {
      return {
        tableId: this.tableId,
        processedCells: this.uniqueCellIds.size,
        isObserving: this.isObserving,
      };
    }

    /**
     * 销毁实例
     */
    destroy() {
      this.stopObserving();
      this.uniqueCellIds.clear();

      // 移除所有已添加的后缀
      const tableContainer = document.getElementById(this.tableId);
      if (tableContainer) {
        const suffixes = tableContainer.querySelectorAll(".cell-suffix");
        console.log(
          `TableCellSuffixAppender: 销毁时移除 ${suffixes.length} 个后缀`,
        );
        suffixes.forEach((suffix) => suffix.remove());
      }

      console.log(`TableCellSuffixAppender: 已销毁`);
    }
  }

  /**
   * 便捷函数：快速初始化表格后缀
   * @param {Object} options 配置选项
   * @returns {TableCellSuffixAppender} 实例
   */
  function initTableCellSuffix(options) {
    try {
      console.log(`initTableCellSuffix: 开始初始化表格 ${options.tableId}`);
      const appender = new TableCellSuffixAppender(options);
      return appender.init();
    } catch (error) {
      console.error("initTableCellSuffix: 初始化失败", error);
      throw error;
    }
  }

  // 防止重复初始化
  const existingInstances = new Map();

  /**
   * 安全的初始化函数，避免重复初始化
   * @param {Object} options 配置选项
   * @returns {TableCellSuffixAppender} 实例
   */
  function safeInitTableCellSuffix(options) {
    const key = options.tableId;

    if (existingInstances.has(key)) {
      console.log(
        `safeInitTableCellSuffix: 发现已存在的实例，先销毁再创建新的`,
      );
      existingInstances.get(key).destroy();
    }

    const instance = initTableCellSuffix(options);
    existingInstances.set(key, instance);

    return instance;
  }

  /**
   * 自动初始化，等待表格加载完成后再初始化
   * @param {Object} options 配置选项
   * @param {number} maxRetries 最大重试次数，默认10次
   * @param {number} retryInterval 重试间隔，默认200ms
   * @returns {Promise<TableCellSuffixAppender>} Promise对象
   */
  function autoInitTableCellSuffix(
    options,
    maxRetries = 10,
    retryInterval = 200,
  ) {
    return new Promise((resolve, reject) => {
      let retryCount = 0;

      function tryInit() {
        const tableContainer = document.getElementById(options.tableId);

        if (tableContainer) {
          console.log(
            `autoInitTableCellSuffix: 表格 ${options.tableId} 已找到，开始初始化`,
          );
          try {
            const instance = safeInitTableCellSuffix(options);
            resolve(instance);
          } catch (error) {
            reject(error);
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `autoInitTableCellSuffix: 第 ${retryCount} 次尝试查找表格 ${options.tableId}`,
          );
          setTimeout(tryInit, retryInterval);
        } else {
          reject(
            new Error(
              `表格 ${options.tableId} 未找到，已达到最大重试次数 ${maxRetries}`,
            ),
          );
        }
      }

      tryInit();
    });
  }

  // 挂载到全局对象
  if (typeof window !== "undefined") {
    window.TableCellSuffixAppender = TableCellSuffixAppender;
    window.initTableCellSuffix = initTableCellSuffix;
    window.safeInitTableCellSuffix = safeInitTableCellSuffix;
    window.autoInitTableCellSuffix = autoInitTableCellSuffix;

    console.log("TableCellSuffixAppender: 已挂载到全局对象");
  }
})();
