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
        fontSize: "inherit",
        marginLeft: "2px",
        fontWeight: "normal",
      },
      options.style || {},
    );

    this.observer = null;
    this.isObserving = false;
    this.uniqueCellIds = new Set(); // 使用Set记录唯一标识
  }

  /**
   * 初始化并开始监听表格变化
   */
  init() {
    this.processExistingRows();
    this.startObserving();
  }

  /**
   * 处理已存在的行
   */
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
      numberSpan.parentNode.insertBefore(suffixElement, numberSpan.nextSibling);
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
    if (!row) return `${fieldKey}_${Math.random()}`;

    // 使用更可靠的方式获取行索引
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

    // 使用单元格在页面中的位置作为标识
    const rect = cell.getBoundingClientRect();
    return `${fieldKey}_${rowIndex}_${rect.top}_${rect.left}`;
  }

  /**
   * 开始监听DOM变化
   */
  startObserving() {
    const tableContainer = document.getElementById(this.tableId);
    if (!tableContainer || this.isObserving) return;

    // 创建MutationObserver监听DOM变化
    this.observer = new MutationObserver((mutations) => {
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
                }
              }
            });
          }, 0);
        }
      });
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
    // 移除所有已存在的后缀
    const tableContainer = document.getElementById(this.tableId);
    if (tableContainer) {
      const existingSuffixes = tableContainer.querySelectorAll(".cell-suffix");
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
      suffixes.forEach((suffix) => suffix.remove());
    }
  }
}

/**
 * 便捷函数：快速初始化表格后缀
 * @param {Object} options 配置选项
 * @returns {TableCellSuffixAppender} 实例
 */
function initTableCellSuffix(options) {
  const appender = new TableCellSuffixAppender(options);
  appender.init();
  return appender;
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
    // 如果已存在实例，先销毁再创建新的
    existingInstances.get(key).destroy();
  }

  const instance = initTableCellSuffix(options);
  existingInstances.set(key, instance);

  return instance;
}

// 导出到全局作用域
window.TableCellSuffixAppender = TableCellSuffixAppender;
window.initTableCellSuffix = initTableCellSuffix;
window.safeInitTableCellSuffix = safeInitTableCellSuffix;
// if (typeof window !== "undefined") {
//   window.TableCellSuffixAppender = TableCellSuffixAppender;
//   window.initTableCellSuffix = initTableCellSuffix;
//   window.safeInitTableCellSuffix = safeInitTableCellSuffix;
// }

// 示例使用
/*
// 1. 基础使用（推荐使用safeInitTableCellSuffix避免重复初始化）
const suffixAppender = safeInitTableCellSuffix({
    tableId: 'p_form_expert_fee_apply_d1',
    fieldSuffixMap: {
        'u_unit_price': { 
            suffix: '元',
            style: { color: '#1890ff' }
        },
        'u_days': { 
            suffix: '天',
            style: { color: '#52c41a' }
        },
        'u_sum_amt': { 
            suffix: '元',
            style: { color: '#fa8c16', fontWeight: 'bold' }
        }
    },
    style: {
        color: '#1890ff',
        fontSize: '12px',
        marginLeft: '2px'
    }
});

// 2. 检查状态
console.log(suffixAppender.getStatus());

// 3. 重新扫描（如果发现有些行没有处理）
suffixAppender.rescan();

// 4. 刷新所有后缀
suffixAppender.refresh();

// 5. 更新配置
suffixAppender.update({
    fieldSuffixMap: {
        'u_unit_price': { suffix: '元/天', style: { color: '#ff4d4f' } }
    }
});

// 6. 销毁
suffixAppender.destroy();
*/
