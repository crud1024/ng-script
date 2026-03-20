/**
 * 表格行背景色管理器
 * 根据指定字段的值动态设置表格行的背景色
 */
class TableRowColorManager {
  /**
   * 构造函数
   * @param {Object} config - 配置对象
   * @param {string} config.field - 要监听的字段名，默认 'u_radio'
   * @param {Object} config.colorMap - 颜色映射配置 {值: 颜色}
   * @param {boolean} config.debug - 是否开启调试模式，默认 false
   * @param {number} config.refreshDelay - 刷新延迟(ms)，默认 50
   * @param {string|string[]} config.rowSelectors - 行选择器，默认尝试多种选择器
   * @param {boolean} config.applyToCells - 是否将背景色应用到单元格，默认 true
   */
  constructor(config = {}) {
    // 默认配置
    this.config = {
      field: "u_radio",
      colorMap: {
        1: "#e6f7ff", // 浅蓝色
        2: "#fffbe6", // 浅黄色
        3: "#f6ffed", // 浅绿色
      },
      debug: false,
      refreshDelay: 50,
      rowSelectors: [
        '[class*="table-row"]',
        ".ant-table-row",
        ".virtual-table-row",
        ".ng-grid-row",
        "tr.ant-table-row",
        'div[class*="row"]',
        ".ant-table-tbody > tr",
      ],
      applyToCells: true,
      ...config,
    };

    this.gridApi = null;
    this.observer = null;
    this.initInterval = null;
    this.isInitialized = false;
  }

  /**
   * 初始化管理器
   * @param {Object} gridApi - 表格API实例
   * @returns {TableRowColorManager}
   */
  init(gridApi) {
    this.gridApi = gridApi;
    this.isInitialized = true;
    this._log("管理器已初始化", { field: this.config.field });
    return this;
  }

  /**
   * 根据字段值获取背景色
   * @param {*} value - 字段值
   * @returns {string} 背景色
   */
  getColorByValue(value) {
    if (value === undefined || value === null) return "";

    // 先尝试直接使用原始值
    let color = this.config.colorMap[value];

    // 如果没找到，尝试转换为数字
    if (color === undefined) {
      const numValue = parseInt(value);
      color = this.config.colorMap[numValue];
    }

    if (this.config.debug && color) {
      this._log(`字段值: ${value} -> 颜色: ${color}`);
    }

    return color || "";
  }

  /**
   * 查找表格行元素
   * @returns {NodeList|Array} 行元素集合
   */
  findTableRows() {
    const selectors = Array.isArray(this.config.rowSelectors)
      ? this.config.rowSelectors
      : [this.config.rowSelectors];

    for (const selector of selectors) {
      const rows = document.querySelectorAll(selector);
      if (rows.length > 0) {
        this._log(`找到 ${rows.length} 行，使用选择器: ${selector}`);
        return rows;
      }
    }

    return [];
  }

  /**
   * 刷新所有行的背景色
   */
  refresh() {
    if (!this.gridApi) {
      this._log("gridApi未初始化", "warn");
      return;
    }

    const rows = this.gridApi.getRows?.() || [];
    if (rows.length === 0) {
      this._log("没有数据行");
      return;
    }

    this._log(`开始刷新背景色，数据行数: ${rows.length}`);

    const rowElements = this.findTableRows();

    if (rowElements.length === 0) {
      this._log("未找到行元素，稍后重试...", "warn");
      setTimeout(() => this.refresh(), 100);
      return;
    }

    const field = this.config.field;
    const minLength = Math.min(rowElements.length, rows.length);

    for (let i = 0; i < minLength; i++) {
      const rowElement = rowElements[i];
      const rowData = rows[i];

      if (!rowData) continue;

      const fieldValue = rowData[field];
      const bgColor = this.getColorByValue(fieldValue);

      this._applyBackground(rowElement, bgColor, fieldValue, i);
    }

    this._log("背景色刷新完成");
  }

  /**
   * 应用背景色到行元素
   * @param {HTMLElement} rowElement - 行元素
   * @param {string} bgColor - 背景色
   * @param {*} fieldValue - 字段值
   * @param {number} index - 行索引
   * @private
   */
  _applyBackground(rowElement, bgColor, fieldValue, index) {
    if (!rowElement) return;

    if (bgColor) {
      // 设置行背景色
      rowElement.style.backgroundColor = bgColor;

      // 设置单元格背景色（如果需要）
      if (this.config.applyToCells) {
        const cells = rowElement.querySelectorAll(
          '[class*="cell"], td, [data-key]',
        );
        cells.forEach((cell) => {
          cell.style.backgroundColor = bgColor;
        });
      }

      this._log(
        `行 ${index} [${this.config.field}=${fieldValue}] 设置为 ${bgColor}`,
      );
    } else {
      // 清除背景色
      rowElement.style.backgroundColor = "";

      if (this.config.applyToCells) {
        const cells = rowElement.querySelectorAll(
          '[class*="cell"], td, [data-key]',
        );
        cells.forEach((cell) => {
          cell.style.backgroundColor = "";
        });
      }
    }
  }

  /**
   * 强制刷新
   */
  forceRefresh() {
    this._log("强制刷新背景色");
    this.refresh();
  }

  /**
   * 开始监听DOM变化
   * @param {HTMLElement} container - 表格容器元素
   */
  startObserver(container) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(() => {
      setTimeout(() => this.refresh(), this.config.refreshDelay);
    });

    if (container) {
      this.observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: false,
      });
      this._log("开始监听表格DOM变化");
    }
  }

  /**
   * 停止监听DOM变化
   */
  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.stopObserver();
    if (this.initInterval) {
      clearInterval(this.initInterval);
    }
    this.gridApi = null;
    this.isInitialized = false;
    this._log("管理器已销毁");
  }

  /**
   * 内部日志方法
   * @param {string} message - 日志消息
   * @param {string} level - 日志级别
   * @private
   */
  _log(message, level = "log") {
    if (!this.config.debug) return;

    const prefix = `[TableRowColorManager][${this.config.field}]`;
    if (level === "warn") {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * 自动初始化（等待gridApi就绪）
   * @param {number} maxAttempts - 最大尝试次数
   * @param {number} interval - 尝试间隔(ms)
   * @returns {Promise<TableRowColorManager>}
   */
  autoInit(maxAttempts = 30, interval = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const tryInit = () => {
        attempts++;

        let gridApi = null;
        if (window.$NG) {
          gridApi = window.$NG.getCmpApi?.("grid");
        }

        if (gridApi) {
          this.init(gridApi);
          this.forceRefresh();

          // 查找表格容器并开始监听
          setTimeout(() => {
            const tableContainer = document.querySelector(
              ".ant-table, .virtual-grid, .ng-grid, .ant-table-wrapper",
            );
            if (tableContainer) {
              this.startObserver(tableContainer);
            }
          }, 500);

          resolve(this);
        } else if (attempts >= maxAttempts) {
          reject(new Error("gridApi not found"));
        } else {
          setTimeout(tryInit, interval);
        }
      };

      tryInit();
    });
  }
}

// 导出到全局
if (typeof window !== "undefined") {
  window.TableRowColorManager = TableRowColorManager;
}
