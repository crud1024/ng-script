/**
 * 给表格数据单元格添加后缀
 * @param {Object} options 配置选项
 * @param {string} options.tableId 表格容器ID
 * @param {Object} options.fieldSuffixMap 字段后缀映射对象
 * @param {Object} [options.style] 后缀样式配置
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
    this.processedCells = new Set(); // 使用Set记录已处理的单元格

    // 等待表格加载完成
    this.initTimeout = null;
    this.maxRetries = 10;
    this.retryCount = 0;
  }

  /**
   * 初始化并开始监听表格变化
   */
  init() {
    this.waitForTableReady()
      .then(() => {
        this.processExistingRows();
        this.startObserving();
      })
      .catch((err) => {
        console.warn(`表格初始化失败: ${err.message}`);
        // 如果表格还未准备好，延迟重试
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => this.init(), 300);
        }
      });
  }

  /**
   * 等待表格准备好
   */
  waitForTableReady() {
    return new Promise((resolve, reject) => {
      const checkTable = () => {
        const tableContainer = document.getElementById(this.tableId);
        if (!tableContainer) {
          reject(new Error(`表格容器未找到: ${this.tableId}`));
          return;
        }

        // 检查是否有行存在
        const hasRows = tableContainer.querySelector(
          ".table-row, .virtual-table-cell",
        );
        if (hasRows) {
          resolve();
        } else {
          // 如果表格为空，也认为是准备好了
          resolve();
        }
      };

      // 立即检查一次
      checkTable();
    });
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

    // 清除已处理的记录
    this.processedCells.clear();

    // 处理所有行（包括汇总行）
    const allRows = tableContainer.querySelectorAll(".table-row");
    allRows.forEach((row) => this.processRow(row));

    console.log(`已处理 ${this.processedCells.size} 个单元格`);
  }

  /**
   * 处理单行
   */
  processRow(row) {
    Object.keys(this.fieldSuffixMap).forEach((fieldKey) => {
      const suffixConfig = this.fieldSuffixMap[fieldKey];
      if (!suffixConfig || !suffixConfig.suffix) return;

      // 在当前行中查找指定字段的单元格
      const cellSelector = `[data-key="${fieldKey}"]`;
      const cell = row.querySelector(cellSelector);

      if (cell) {
        this.processCell(cell, fieldKey, suffixConfig);
      }
    });
  }

  /**
   * 处理单个单元格
   */
  processCell(cell, fieldKey, suffixConfig) {
    // 生成单元格唯一标识
    const cellId = this.generateCellId(cell, fieldKey);

    // 如果已经处理过，跳过
    if (this.processedCells.has(cellId)) {
      return;
    }

    // 标记为已处理
    this.processedCells.add(cellId);

    // 查找包含数字的元素（可能是a标签或span）
    const numberElement = this.findNumberElement(cell);

    if (numberElement) {
      // 获取父容器，通常是 .editor-container
      const parentContainer =
        numberElement.closest(".editor-container") || numberElement.parentNode;

      // 检查是否已经添加过后缀
      const existingSuffix = parentContainer.querySelector(".cell-suffix");
      if (existingSuffix) {
        // 更新现有后缀的配置
        this.updateSuffixElement(existingSuffix, suffixConfig);
        return;
      }

      // 创建并添加后缀元素
      const suffixElement = this.createSuffixElement(suffixConfig);
      parentContainer.appendChild(suffixElement);
    }
  }

  /**
   * 查找包含数字的元素
   */
  findNumberElement(cell) {
    // 先查找a标签（在提供的HTML中数字在a标签内）
    const anchorElements = cell.querySelectorAll("a");
    for (let i = 0; i < anchorElements.length; i++) {
      const anchor = anchorElements[i];
      const text = anchor.textContent.trim();
      if (this.isNumberText(text)) {
        return anchor;
      }
    }

    // 如果没有找到a标签，查找span元素
    const spanElements = cell.querySelectorAll("span");
    for (let i = spanElements.length - 1; i >= 0; i--) {
      const span = spanElements[i];
      const text = span.textContent.trim();
      if (this.isNumberText(text)) {
        // 检查是否有子元素
        if (span.children.length === 0) {
          return span;
        }

        // 如果有子元素，检查子元素中是否包含数字
        const childHasNumber = Array.from(span.children).some((child) =>
          this.isNumberText(child.textContent.trim()),
        );

        if (!childHasNumber) {
          return span;
        }
      }
    }

    return null;
  }

  /**
   * 判断文本是否为数字
   */
  isNumberText(text) {
    if (!text) return false;

    // 移除千分位逗号
    const cleanedText = text.replace(/,/g, "");

    // 匹配数字（包括整数、小数、负数）
    const numberRegex = /^-?\d+(\.\d+)?$/;

    // 同时检查是否为纯数字文本（排除空白字符）
    return numberRegex.test(cleanedText) && cleanedText.length > 0;
  }

  /**
   * 创建后缀元素
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
    suffixSpan.style.display = "inline-block";

    // 应用自定义样式（如果提供）
    if (suffixConfig.style) {
      Object.assign(suffixSpan.style, suffixConfig.style);
    }

    return suffixSpan;
  }

  /**
   * 更新后缀元素
   */
  updateSuffixElement(suffixElement, suffixConfig) {
    suffixElement.textContent = suffixConfig.suffix;

    if (suffixConfig.style) {
      Object.assign(suffixElement.style, suffixConfig.style);
    }
  }

  /**
   * 生成单元格唯一标识
   */
  generateCellId(cell, fieldKey) {
    const row = cell.closest(".table-row");
    if (!row) return `${fieldKey}_${Math.random()}`;

    // 使用行索引和单元格位置
    const rowIndex = Array.from(
      row.parentNode.querySelectorAll(".table-row"),
    ).indexOf(row);
    const cellIndex = Array.from(row.querySelectorAll("[data-key]")).indexOf(
      cell,
    );

    return `${fieldKey}_${rowIndex}_${cellIndex}`;
  }

  /**
   * 开始监听DOM变化
   */
  startObserving() {
    const tableContainer = document.getElementById(this.tableId);
    if (!tableContainer || this.isObserving) return;

    // 创建MutationObserver监听DOM变化
    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // 检查是否有新增的行或内容更新
          if (mutation.addedNodes.length > 0) {
            shouldProcess = true;
          }

          // 检查是否有内容变化（比如重新查询后内容替换）
          if (mutation.removedNodes.length > 0) {
            const removedRows = Array.from(mutation.removedNodes).filter(
              (node) =>
                node.nodeType === 1 &&
                node.classList &&
                (node.classList.contains("table-row") ||
                  node.querySelector(".table-row")),
            );
            if (removedRows.length > 0) {
              shouldProcess = true;
            }
          }
        }
      });

      if (shouldProcess) {
        // 延迟处理，确保DOM更新完成
        clearTimeout(this.initTimeout);
        this.initTimeout = setTimeout(() => {
          this.processExistingRows();
        }, 100);
      }
    });

    // 开始观察
    this.observer.observe(tableContainer, {
      childList: true,
      subtree: true,
    });

    // 监听表格内容区域的变化
    const contentArea = tableContainer.querySelector(".rows-container");
    if (contentArea) {
      this.observer.observe(contentArea, {
        childList: true,
        subtree: true,
      });
    }

    this.isObserving = true;
    console.log("开始监听表格变化");
  }

  /**
   * 停止监听
   */
  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.isObserving = false;
      console.log("停止监听表格变化");
    }
  }

  /**
   * 强制重新处理所有行（用于重新查询后）
   */
  forceRefresh() {
    // 移除所有已存在的后缀
    const tableContainer = document.getElementById(this.tableId);
    if (tableContainer) {
      const existingSuffixes = tableContainer.querySelectorAll(".cell-suffix");
      existingSuffixes.forEach((suffix) => suffix.remove());
    }

    // 重新处理所有行
    this.processedCells.clear();
    setTimeout(() => {
      this.processExistingRows();
    }, 200);
  }

  /**
   * 更新配置
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
    this.forceRefresh();
  }

  /**
   * 获取当前处理状态
   */
  getStatus() {
    return {
      tableId: this.tableId,
      processedCells: this.processedCells.size,
      isObserving: this.isObserving,
    };
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stopObserving();
    this.processedCells.clear();

    // 移除所有已添加的后缀
    const tableContainer = document.getElementById(this.tableId);
    if (tableContainer) {
      const suffixes = tableContainer.querySelectorAll(".cell-suffix");
      suffixes.forEach((suffix) => suffix.remove());
    }

    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
  }
}

/**
 * 安全的初始化函数
 */
const suffixAppenderInstances = new Map();

function safeInitTableCellSuffix(options) {
  const key = options.tableId;

  // 如果已存在实例，先销毁
  if (suffixAppenderInstances.has(key)) {
    suffixAppenderInstances.get(key).destroy();
  }

  // 创建新实例
  const instance = new TableCellSuffixAppender(options);
  instance.init();

  // 保存实例引用
  suffixAppenderInstances.set(key, instance);

  // 暴露刷新方法到全局，供页面查询后调用
  window.refreshTableSuffix = function () {
    if (instance) {
      instance.forceRefresh();
    }
  };

  return instance;
}
// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TableCellSuffixAppender, safeInitTableCellSuffix };
}
// 导出到全局作用域
if (typeof window !== "undefined") {
  window.TableCellSuffixAppender = TableCellSuffixAppender;
  window.safeInitTableCellSuffix = safeInitTableCellSuffix;
}
