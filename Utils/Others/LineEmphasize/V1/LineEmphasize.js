/**
 * 表格行背景色管理器
 * 用于根据指定字段的值动态设置表格行的背景色
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
      ],
      applyToCells: true,
      ...config,
    };

    this.gridApi = null;
    this.observer = null;
    this.initInterval = null;
    this.isInitialized = false;
    this._rowCache = new Map(); // 行数据缓存，用于优化性能
  }

  /**
   * 设置颜色映射
   * @param {Object} colorMap - 颜色映射配置
   * @returns {TableRowColorManager}
   */
  setColorMap(colorMap) {
    this.config.colorMap = { ...this.config.colorMap, ...colorMap };
    return this;
  }

  /**
   * 设置监听的字段
   * @param {string} field - 字段名
   * @returns {TableRowColorManager}
   */
  setField(field) {
    this.config.field = field;
    return this;
  }

  /**
   * 设置调试模式
   * @param {boolean} enabled - 是否启用
   * @returns {TableRowColorManager}
   */
  setDebug(enabled) {
    this.config.debug = enabled;
    return this;
  }

  /**
   * 初始化管理器
   * @param {Object} gridApi - 表格API实例
   * @param {Object} options - 额外选项
   * @returns {TableRowColorManager}
   */
  init(gridApi, options = {}) {
    if (options.field) this.setField(options.field);
    if (options.colorMap) this.setColorMap(options.colorMap);
    if (options.debug !== undefined) this.setDebug(options.debug);

    this.gridApi = gridApi;
    this.isInitialized = true;

    this._log("管理器已初始化", {
      field: this.config.field,
      colorMap: this.config.colorMap,
    });

    // 初次刷新
    this.refresh();

    return this;
  }

  /**
   * 自动初始化（等待gridApi就绪）
   * @param {number} maxAttempts - 最大尝试次数，默认20次
   * @param {number} interval - 尝试间隔(ms)，默认100ms
   * @returns {Promise<TableRowColorManager>}
   */
  autoInit(maxAttempts = 20, interval = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const tryInit = () => {
        attempts++;
        const gridApi = window.$NG?.getCmpApi?.("grid");

        if (gridApi) {
          this.init(gridApi);
          this._startObserver();
          resolve(this);
        } else if (attempts >= maxAttempts) {
          this._log("自动初始化失败：未找到gridApi", "warn");
          reject(new Error("gridApi not found"));
        } else {
          setTimeout(tryInit, interval);
        }
      };

      tryInit();
      return this;
    });
  }

  /**
   * 根据字段值获取背景色
   * @param {*} value - 字段值
   * @returns {string} 背景色，如果没有映射则返回空字符串
   */
  getColorByValue(value) {
    if (value === undefined || value === null) return "";

    // 处理可能的字符串或数字
    const configValue = this.config.colorMap[value];
    if (configValue !== undefined) return configValue;

    // 尝试转换为数字
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      return this.config.colorMap[numValue] || "";
    }

    return "";
  }

  /**
   * 查找表格行元素
   * @returns {NodeList|Array} 行元素集合
   */
  findTableRows() {
    for (const selector of this.config.rowSelectors) {
      const rows = document.querySelectorAll(selector);
      if (rows.length > 0) {
        this._log(`使用选择器找到 ${rows.length} 行: ${selector}`);
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

    // 获取要监听的字段
    const field = this.config.field;

    // 处理每一行
    const minLength = Math.min(rowElements.length, rows.length);

    for (let i = 0; i < minLength; i++) {
      const rowElement = rowElements[i];
      const rowData = rows[i];

      if (!rowData) continue;

      const fieldValue = rowData[field];
      const bgColor = this.getColorByValue(fieldValue);

      // 更新缓存
      const phid = rowData.phid || `row_${i}`;
      this._rowCache.set(phid, { fieldValue, bgColor });

      // 应用背景色
      this._applyBackground(rowElement, bgColor, fieldValue);
    }

    this._log("背景色刷新完成");
  }

  /**
   * 应用背景色到行元素
   * @param {HTMLElement} rowElement - 行元素
   * @param {string} bgColor - 背景色
   * @param {*} fieldValue - 字段值（用于日志）
   * @private
   */
  _applyBackground(rowElement, bgColor, fieldValue) {
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
        `行 ${fieldValue ? `[${this.config.field}=${fieldValue}]` : ""} 设置为 ${bgColor}`,
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
   * 强制刷新（别名，便于调用）
   */
  forceRefresh() {
    this.refresh();
  }

  /**
   * 更新指定行的背景色
   * @param {number|string} rowIndex - 行索引或phid
   * @param {Object} rowData - 行数据
   */
  updateRow(rowIndex, rowData) {
    if (!this.gridApi || !rowData) return;

    const rowElements = this.findTableRows();
    if (rowElements.length <= rowIndex) return;

    const rowElement = rowElements[rowIndex];
    const fieldValue = rowData[this.config.field];
    const bgColor = this.getColorByValue(fieldValue);

    this._applyBackground(rowElement, bgColor, fieldValue);
  }

  /**
   * 批量更新变化的行
   * @param {Array} newRows - 新的行数据
   */
  updateChangedRows(newRows) {
    if (!this.gridApi || !newRows) return;

    const rowElements = this.findTableRows();
    const minLength = Math.min(rowElements.length, newRows.length);

    for (let i = 0; i < minLength; i++) {
      const rowData = newRows[i];
      if (!rowData) continue;

      const phid = rowData.phid || `row_${i}`;
      const cached = this._rowCache.get(phid);
      const newValue = rowData[this.config.field];

      // 如果值发生变化，更新背景色
      if (!cached || cached.fieldValue !== newValue) {
        const bgColor = this.getColorByValue(newValue);
        this._applyBackground(rowElements[i], bgColor, newValue);

        // 更新缓存
        this._rowCache.set(phid, {
          fieldValue: newValue,
          bgColor,
        });
      }
    }
  }

  /**
   * 开始监听DOM变化
   * @private
   */
  _startObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      // 当DOM有显著变化时刷新背景色
      setTimeout(() => this.refresh(), this.config.refreshDelay);
    });

    // 等待表格容器出现
    setTimeout(() => {
      const tableContainer = document.querySelector(
        ".ant-table, .virtual-grid, .ng-grid, .table-container",
      );
      if (tableContainer) {
        this.observer.observe(tableContainer, {
          childList: true,
          subtree: true,
          attributes: false,
        });
        this._log("开始监听表格DOM变化");
      }
    }, 1000);
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
   * 清除缓存
   */
  clearCache() {
    this._rowCache.clear();
    this._log("缓存已清除");
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
    this._rowCache.clear();
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

    const prefix = "[TableRowColorManager]";
    if (level === "warn") {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * 工厂方法：创建并自动初始化的实例
   * @param {Object} config - 配置
   * @returns {Promise<TableRowColorManager>}
   */
  static create(config = {}) {
    const manager = new TableRowColorManager(config);
    return manager.autoInit();
  }

  /**
   * 创建预配置的实例（同步方式，需要手动调用init）
   * @param {Object} config - 配置
   * @returns {TableRowColorManager}
   */
  static createSync(config = {}) {
    return new TableRowColorManager(config);
  }
}

/**
 * 工具函数：快速创建默认配置的实例
 */
TableRowColorManager.createDefault = function () {
  return TableRowColorManager.createSync({
    field: "u_radio",
    colorMap: {
      1: "#e6f7ff", // 浅蓝色
      2: "#fffbe6", // 浅黄色
      3: "#f6ffed", // 浅绿色
    },
    debug: false,
  });
};

/**
 * 工具函数：创建自定义颜色映射的实例
 * @param {string} field - 字段名
 * @param {Object} colorMap - 颜色映射
 * @param {boolean} debug - 调试模式
 */
TableRowColorManager.createCustom = function (field, colorMap, debug = false) {
  return TableRowColorManager.createSync({
    field: field,
    colorMap: colorMap,
    debug: debug,
  });
};

// 导出到全局作用域
if (typeof window !== "undefined") {
  window.TableRowColorManager = TableRowColorManager;
}

// 导出模块（如果支持模块系统）
if (typeof module !== "undefined" && module.exports) {
  module.exports = TableRowColorManager;
}

if (typeof define === "function" && define.amd) {
  define([], function () {
    return TableRowColorManager;
  });
}
