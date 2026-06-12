/**
 * DynamicTemplateExporter - 动态模板导出器
 *
 * 根据 APIresult 动态解析表结构，生成多工作表 Excel 导入模板。
 *
 * 功能：
 *   1. 从 APIresult.busTableChnMap 自动发现需要导出的表
 *   2. 默认只导出明细表（_d 结尾），可配置是否包含主表（_m 结尾）
 *   3. 从 grid / fieldSetForm 中提取列定义
 *   4. 自动过滤序号、树pid、树id、hidden、toolbar 等不需要的字段
 *   5. 支持动态配置排除字段、排除 xtype
 *   6. Select 类型字段自动生成数据验证（下拉列表）和枚举提示
 *
 * 使用方式：
 *   const exporter = new DynamicTemplateExporter(APIresult, {
 *     includeMaster: false,
 *     excludeFields: ['phid_pc'],
 *     excludeXtypes: ['customWFColumn'],
 *     fileName: '清单库导入模板.xlsx',
 *   });
 *   await exporter.export();
 */

class DynamicTemplateExporter {
  /**
   * @param {Object}  apiResult  - API 返回的完整数据（APIresult）
   * @param {Object}  options    - 配置选项
   * @param {boolean} options.includeMaster    - 是否包含主表（_m 结尾），默认 false
   * @param {string[]} options.excludeFields   - 额外排除的字段（按 dataIndex/name 匹配）
   * @param {string[]} options.excludeXtypes   - 额外排除的 xtype
   * @param {boolean} options.excludeHidden    - 是否排除 hidden:true 的字段，默认 true
   * @param {string}  options.fileName         - 输出文件名，默认 "{模块名}_导入模板.xlsx"
   * @param {boolean} options.showEnumHint     - 是否在表头显示枚举值提示，默认 true
   * @param {Object}  options.headerStyle      - 表头样式（同 ExcelJS fill/font/alignment）
   * @param {boolean} options.freezeHeader     - 是否冻结表头，默认 true
   * @param {string}  options.excelJsUrl       - ExcelJS 库的 CDN 地址
   */
  constructor(apiResult, options) {
    if (!apiResult) {
      throw new Error("apiResult 参数不能为空");
    }

    this.apiResult = apiResult;
    this.options = Object.assign(
      {
        // 是否包含主表 (_m 结尾)
        includeMaster: false,
        // 额外排除的字段名
        excludeFields: [],
        // 额外排除的 xtype
        excludeXtypes: [],
        // 是否排除 hidden 字段
        excludeHidden: true,
        // 输出文件名（null 则自动生成）
        fileName: null,
        // 是否显示枚举提示
        showEnumHint: true,
        // 冻结表头
        freezeHeader: true,
        // ExcelJS CDN 地址
        excelJsUrl:
          "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/ExcelJS/ V1/exceljs.min.js",
        // 表头样式
        headerStyle: null,
      },
      options,
    );

    // ---- 合并排除字段列表 ----
    // 默认排除的 dataIndex/name
    this.defaultExcludeFields = [
      "s_tree_pid", // 树父级ID
      "s_tree_id", // 树节点ID
      "phid_pc", // 工程项目（通常由系统自动关联）
    ];

    // 默认排除的 xtype
    this.defaultExcludeXtypes = [
      "rownumberer", // 序号列
      "toolbar", // 操作按钮列
      "customWFColumn", // 工作流标志列
    ];

    // ---- 内部状态 ----
    this.dependenciesLoaded = false;
    this.loadingPromise = null;
  }

  // ==================== 依赖加载 ====================

  /**
   * 确保 ExcelJS 已加载
   */
  async ensureDependencies() {
    if (this.dependenciesLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    var self = this;
    this.loadingPromise = new Promise(function (resolve, reject) {
      // 已可用
      if (typeof ExcelJS !== "undefined" && ExcelJS.Workbook) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = self.options.excelJsUrl;
      script.onload = function () {
        if (typeof ExcelJS !== "undefined" && ExcelJS.Workbook) {
          resolve();
        } else {
          reject(new Error("ExcelJS 加载后未定义"));
        }
      };
      script.onerror = function () {
        reject(
          new Error(
            "加载 ExcelJS 失败，请检查网络： " + self.options.excelJsUrl,
          ),
        );
      };
      document.head.appendChild(script);
    });

    await this.loadingPromise;
    this.dependenciesLoaded = true;
  }

  // ==================== 主入口 ====================

  /**
   * 执行导出
   */
  async export() {
    try {
      this.showMessage("正在解析表结构...", "info");

      // 1. 从 APIresult 中提取表信息
      var tables = this.extractTables();

      if (tables.length === 0) {
        throw new Error("未找到任何可导出的表");
      }

      this.showMessage(
        "发现 " + tables.length + " 个表，正在提取列定义...",
        "info",
      );

      // 2. 为每个表提取列定义 → 生成 sheet 配置
      var sheets = [];
      for (var i = 0; i < tables.length; i++) {
        var sheetConfig = this.buildSheetConfig(tables[i]);
        if (sheetConfig) {
          sheets.push(sheetConfig);
        }
      }

      if (sheets.length === 0) {
        throw new Error("所有表均无有效列定义，无法生成模板");
      }

      this.showMessage(
        "正在生成 Excel 文件，共 " + sheets.length + " 个工作表...",
        "info",
      );

      // 3. 加载依赖并生成 Excel
      await this.ensureDependencies();

      var fileName = this.getFileName();
      var workbook = new ExcelJS.Workbook();

      for (var j = 0; j < sheets.length; j++) {
        await this.generateWorksheet(workbook, sheets[j], j);
      }

      var buffer = await workbook.xlsx.writeBuffer();
      this.downloadExcel(buffer, fileName);

      this.showMessage(
        "模板生成成功：" + fileName + "，共 " + sheets.length + " 个工作表",
        "success",
      );

      return {
        success: true,
        fileName: fileName,
        sheetCount: sheets.length,
        sheets: sheets.map(function (s) {
          return s.sheetName;
        }),
      };
    } catch (error) {
      console.error("[DynamicTemplateExporter] 导出失败:", error);
      this.showMessage("导出失败：" + error.message, "error");
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== 表发现 ====================

  /**
   * 从 APIresult 中提取需要导出的表信息
   *
   * 返回格式：
   *   [{ tableName: "inv_list_d2", tableChnName: "设备及安装工程清单", isMaster: false, bindtable: "inv_list_d2" }]
   */
  extractTables() {
    var busTableChnMap = this.getNestedValue(
      this.apiResult,
      "data.publicProperty.busTableChnMap",
    );

    if (!busTableChnMap || Object.keys(busTableChnMap).length === 0) {
      console.warn(
        "[DynamicTemplateExporter] 未找到 busTableChnMap，无法确定表结构",
      );
      return [];
    }

    var self = this;
    var tables = [];

    Object.keys(busTableChnMap).forEach(function (tableName) {
      var isMaster = self.isMasterTable(tableName);

      // 根据 includeMaster 配置决定是否包含主表
      if (isMaster && !self.options.includeMaster) {
        console.log(
          "[DynamicTemplateExporter] 跳过主表: " +
            tableName +
            " (" +
            busTableChnMap[tableName] +
            ")",
        );
        return;
      }

      tables.push({
        tableName: tableName,
        tableChnName: busTableChnMap[tableName],
        isMaster: isMaster,
        bindtable: tableName,
      });
    });

    return tables;
  }

  /**
   * 判断是否为主表（表名以 _m 结尾）
   */
  isMasterTable(tableName) {
    // 匹配 _m 结尾（但排除 _m 后面还有字符的情况，即精确匹配 _m 后缀）
    return /_m$/.test(tableName);
  }

  // ==================== 列提取 ====================

  /**
   * 为单个表构建 sheet 配置
   *
   * @returns {Object|null} { sheetName, columns: [{ header, width, validation? }] }
   */
  buildSheetConfig(tableInfo) {
    var columns = [];

    if (tableInfo.isMaster) {
      // 主表：优先从 grid 中找对应列表，其次从 fieldSetForm
      columns = this.extractMasterColumns(tableInfo);
    } else {
      // 明细表：从 grid 中提取
      columns = this.extractDetailColumns(tableInfo);
    }

    // 过滤不需要的列
    columns = this.filterColumns(columns);

    if (columns.length === 0) {
      console.warn(
        "[DynamicTemplateExporter] 表 " +
          tableInfo.tableName +
          " (" +
          tableInfo.tableChnName +
          ") 过滤后无有效列，跳过",
      );
      return null;
    }

    // 转换为导出器需要的格式
    var exportColumns = this.formatColumns(columns);

    console.log(
      "[DynamicTemplateExporter] 表 " +
        tableInfo.tableName +
        " 提取到 " +
        exportColumns.length +
        " 列:",
      exportColumns.map(function (c) {
        return c.header;
      }),
    );

    return {
      sheetName: tableInfo.tableChnName || tableInfo.tableName,
      columns: exportColumns,
      _meta: {
        tableName: tableInfo.tableName,
        isMaster: tableInfo.isMaster,
      },
    };
  }

  /**
   * 提取主表列定义
   * 主表的列来自 grid 中 bindtable 匹配的列表（如 inv_list_m_list）
   * 如果找不到，回退到 fieldSetForm
   */
  extractMasterColumns(tableInfo) {
    var uiContent = this.getNestedValue(this.apiResult, "data.uiContent");
    if (!uiContent) return [];

    var grid = uiContent.grid || {};

    // 遍历 grid 找到 bindtable 匹配的列表
    var gridKeys = Object.keys(grid);
    for (var i = 0; i < gridKeys.length; i++) {
      var entry = grid[gridKeys[i]];
      if (entry && entry.bindtable === tableInfo.tableName && entry.columns) {
        return entry.columns;
      }
    }

    // 回退：从 fieldSetForm 提取
    var fieldSetForm = uiContent.fieldSetForm || {};
    var formEntry = fieldSetForm[tableInfo.tableName];
    if (formEntry && formEntry.fieldSets && formEntry.fieldSets.length > 0) {
      // 取第一个 fieldSet 的所有字段
      var allFields = [];
      for (var j = 0; j < formEntry.fieldSets.length; j++) {
        var fs = formEntry.fieldSets[j];
        if (fs.allfields && Array.isArray(fs.allfields)) {
          allFields = allFields.concat(fs.allfields);
        }
      }
      // 将 form 字段格式转为 grid 列格式
      return this.formFieldsToColumns(allFields);
    }

    return [];
  }

  /**
   * 提取明细表列定义
   * 明细表的列来自 grid 中 bindtable 匹配的配置
   */
  extractDetailColumns(tableInfo) {
    var uiContent = this.getNestedValue(this.apiResult, "data.uiContent");
    if (!uiContent) return [];

    var grid = uiContent.grid || {};

    // 遍历 grid 找到 bindtable 匹配的项
    var gridKeys = Object.keys(grid);
    for (var i = 0; i < gridKeys.length; i++) {
      var entry = grid[gridKeys[i]];
      if (entry && entry.bindtable === tableInfo.tableName && entry.columns) {
        return entry.columns;
      }
    }

    // 尝试通过 tableName_list 模式匹配
    var listKey = tableInfo.tableName + "_list";
    if (grid[listKey] && grid[listKey].columns) {
      return grid[listKey].columns;
    }

    // 尝试直接通过 tableName 匹配
    if (grid[tableInfo.tableName] && grid[tableInfo.tableName].columns) {
      return grid[tableInfo.tableName].columns;
    }

    console.warn(
      "[DynamicTemplateExporter] 未找到明细表 " +
        tableInfo.tableName +
        " 的列定义",
    );
    return [];
  }

  /**
   * 将 fieldSetForm 的 allfields 转为 grid columns 格式
   */
  formFieldsToColumns(allFields) {
    return allFields.map(function (field) {
      return {
        xtype: field.xtype || "Input",
        dataIndex: field.name,
        header: field.label || field.name,
        hidden: field.hidden || false,
        disabled: field.disabled || false,
        maxLength: field.maxLength,
        editor: field.editor || null,
        // Select 类型的枚举数据直接在 field 上
        data: field.data || null,
      };
    });
  }

  // ==================== 列过滤 ====================

  /**
   * 过滤列：排除不需要的字段
   */
  filterColumns(columns) {
    if (!columns || !Array.isArray(columns)) return [];

    var self = this;

    // 合并所有排除项
    var allExcludeFields = this.defaultExcludeFields.concat(
      this.options.excludeFields,
    );
    var allExcludeXtypes = this.defaultExcludeXtypes.concat(
      this.options.excludeXtypes,
    );

    return columns.filter(function (col) {
      // 1. 按 xtype 排除
      if (col.xtype && allExcludeXtypes.indexOf(col.xtype) !== -1) {
        console.log(
          "[DynamicTemplateExporter] 排除 xtype: " +
            col.xtype +
            " (" +
            (col.header || col.dataIndex) +
            ")",
        );
        return false;
      }

      // 2. 按 dataIndex / name 排除
      var fieldKey = col.dataIndex || col.name;
      if (fieldKey && allExcludeFields.indexOf(fieldKey) !== -1) {
        console.log("[DynamicTemplateExporter] 排除字段: " + fieldKey);
        return false;
      }

      // 3. 排除 hidden 字段
      if (self.options.excludeHidden && col.hidden === true) {
        console.log(
          "[DynamicTemplateExporter] 排除隐藏字段: " +
            (col.dataIndex || col.name),
        );
        return false;
      }

      // 4. 排除 disabled 字段（通常是按钮占位）
      if (col.disabled === true) {
        console.log(
          "[DynamicTemplateExporter] 排除禁用字段: " +
            (col.dataIndex || col.name),
        );
        return false;
      }

      // 5. 必须有 header 或 dataIndex
      if (!col.header && !col.dataIndex && !col.name) {
        return false;
      }

      return true;
    });
  }

  /**
   * 将原始列定义格式化为导出器需要的列格式
   */
  formatColumns(columns) {
    var self = this;
    return columns.map(function (col) {
      var header = col.header || col.label || col.dataIndex || col.name || "";
      var validation = self.extractValidation(col);

      return {
        header: header,
        dataIndex: col.dataIndex || col.name || "",
        width: col.width || null,
        xtype: col.xtype || "Input",
        maxLength:
          col.maxLength || (col.editor && col.editor.maxLength) || null,
        validation: validation,
      };
    });
  }

  /**
   * 从列定义中提取数据验证配置
   * 处理两种情况：
   *   1. grid 列：editor.data 中有枚举数据
   *   2. fieldSetForm 字段：data 中有枚举数据
   */
  extractValidation(col) {
    // 从 editor.data 中获取
    if (
      col.editor &&
      col.editor.data &&
      Array.isArray(col.editor.data) &&
      col.editor.data.length > 0
    ) {
      return { data: col.editor.data };
    }

    // 从字段自身的 data 中获取（fieldSetForm 的情况）
    if (col.data && Array.isArray(col.data) && col.data.length > 0) {
      return { data: col.data };
    }

    return null;
  }

  // ==================== Excel 生成 ====================

  /**
   * 生成一个工作表
   */
  async generateWorksheet(workbook, sheetConfig, sheetIndex) {
    var sheetName = this.getValidSheetName(sheetConfig.sheetName, sheetIndex);
    var worksheet = workbook.addWorksheet(sheetName);
    var columns = sheetConfig.columns || [];

    if (columns.length === 0) {
      worksheet.addRow(["提示：无列定义"]);
      return worksheet;
    }

    var self = this;

    // 处理表头（追加枚举提示）
    var processedHeaders = columns.map(function (col) {
      return self.getProcessedHeader(col);
    });

    // 设置列宽
    worksheet.columns = columns.map(function (col, idx) {
      var header = processedHeaders[idx];
      var width = col.width
        ? Math.min(col.width / 7, 50)
        : self.calculateColumnWidth(header);
      return {
        header: header,
        key: "col_" + idx,
        width: Math.max(width, 8),
      };
    });

    // 表头样式
    var headerRow = worksheet.getRow(1);
    var headerStyle = this.getHeaderStyle();

    headerRow.height = 22;
    headerRow.eachCell(function (cell) {
      if (headerStyle.fill) cell.fill = headerStyle.fill;
      if (headerStyle.font) cell.font = headerStyle.font;
      if (headerStyle.alignment) cell.alignment = headerStyle.alignment;
      cell.alignment = Object.assign({}, cell.alignment, {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      });
    });

    // 冻结表头
    if (this.options.freezeHeader) {
      worksheet.views = [
        { state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" },
      ];
    }

    // 数据验证（下拉列表）
    columns.forEach(function (col, colIndex) {
      if (
        col.validation &&
        col.validation.data &&
        col.validation.data.length > 0
      ) {
        var validValues = col.validation.data.map(function (item) {
          return String(item.value);
        });

        if (validValues.length > 0) {
          var colLetter = self.getColumnLetter(colIndex + 1);
          var range = colLetter + "2:" + colLetter + "1048576";

          try {
            worksheet.getCell(range).dataValidation = {
              type: "list",
              allowBlank: true,
              formulae: ['"' + validValues.join(",") + '"'],
              showErrorMessage: true,
              errorTitle: "输入值无效",
              error: "请从下拉列表中选择有效值",
            };
          } catch (e) {
            console.warn(
              "[DynamicTemplateExporter] 设置数据验证失败: " + range,
              e,
            );
          }
        }
      }
    });

    // 添加一行空行
    var emptyRow = [];
    for (var i = 0; i < columns.length; i++) {
      emptyRow.push("");
    }
    worksheet.addRow(emptyRow);

    return worksheet;
  }

  // ==================== 工具方法 ====================

  /**
   * 获取合法的 Excel 工作表名（移除非法字符，限制31字符）
   */
  getValidSheetName(name, index) {
    var sheetName = name || "Sheet" + (index + 1);
    sheetName = sheetName.replace(/[\\/*?:[\]]/g, "");
    if (sheetName.length > 31) {
      sheetName = sheetName.substring(0, 31);
    }
    return sheetName;
  }

  /**
   * 根据表头文本计算列宽
   * 中文字符 ≈ 2 单位，英文 ≈ 1 单位
   */
  calculateColumnWidth(headerText) {
    if (!headerText) return 10;
    var chineseCount = (headerText.match(/[一-龥]/g) || []).length;
    var otherCount = headerText.length - chineseCount;
    var width = chineseCount * 2 + otherCount * 1 + 4;
    return Math.min(Math.max(width, 8), 50);
  }

  /**
   * 生成枚举提示文本
   * 例：[{value:"1",label:"平均值"}] → "（1=平均值,2=去极值均值）"
   */
  generateEnumHint(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return "";
    var hints = data
      .map(function (item) {
        return item.value + "=" + item.label;
      })
      .join(",");
    return "（" + hints + "）";
  }

  /**
   * 获取处理后的表头（追加枚举提示）
   */
  getProcessedHeader(column) {
    var header = column.header || "";

    if (
      this.options.showEnumHint &&
      column.validation &&
      column.validation.data &&
      Array.isArray(column.validation.data) &&
      column.validation.data.length > 0
    ) {
      var enumHint = this.generateEnumHint(column.validation.data);
      if (enumHint && header.indexOf(enumHint) === -1) {
        header = header + " " + enumHint;
      }
    }

    return header;
  }

  /**
   * 列索引 → Excel 列字母（1→A, 2→B, ..., 27→AA）
   */
  getColumnLetter(index) {
    var result = "";
    while (index > 0) {
      index--;
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26);
    }
    return result;
  }

  /**
   * 获取表头样式（带默认值）
   */
  getHeaderStyle() {
    return (
      this.options.headerStyle || {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F0FA" },
        },
        font: {
          bold: true,
          size: 11,
          color: { argb: "FF1F497D" },
        },
        alignment: {
          horizontal: "center",
          vertical: "middle",
        },
      }
    );
  }

  /**
   * 获取输出文件名
   */
  getFileName() {
    if (this.options.fileName) {
      return this.options.fileName;
    }

    // 自动生成：{模块名}_导入模板.xlsx
    var moduleName = "模板";
    try {
      var pp = this.getNestedValue(this.apiResult, "data.publicProperty");
      if (pp) {
        moduleName = pp.busName || pp.busCode || pp.moduleCode || "模板";
      }
    } catch (e) {
      /* ignore */
    }

    return moduleName + "_导入模板.xlsx";
  }

  /**
   * 安全获取嵌套属性值
   */
  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    var keys = path.split(".");
    var current = obj;
    for (var i = 0; i < keys.length; i++) {
      if (current == null) return undefined;
      current = current[keys[i]];
    }
    return current;
  }

  /**
   * 触发浏览器下载
   */
  downloadExcel(buffer, fileName) {
    var blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 显示消息
   */
  showMessage(message, type) {
    type = type || "info";
    console.log("[" + type.toUpperCase() + "]", message);

    // 触发自定义事件
    var event = new CustomEvent("dynamicTemplateExporterMessage", {
      detail: { message: message, type: type },
    });
    window.dispatchEvent(event);

    // 兼容 NG 平台的 $layer
    if (typeof window.$layer !== "undefined") {
      if (type === "error") {
        window.$layer.msg(message, { icon: 2 });
      } else if (type === "success") {
        window.$layer.msg(message, { icon: 1 });
      } else {
        window.$layer.msg(message);
      }
    }
  }
}

// ==================== 挂载到全局 ====================

if (typeof window !== "undefined") {
  window.DynamicTemplateExporter = DynamicTemplateExporter;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = DynamicTemplateExporter;
}
