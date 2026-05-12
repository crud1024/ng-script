class ExcelTemplateExporter {
  constructor(options = {}) {
    // 基础配置
    this.options = {
      schema: options.schema || null,
      fileName: options.fileName || null,
      sheetName: options.sheetName || null, // 手动指定sheet名，优先级高于schema.panel.title
      headerStyle: options.headerStyle || {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        },
        font: { bold: true, size: 12, color: { argb: "FF000000" } },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
      },
      freezeHeader: options.freezeHeader !== false,
      autoWidthDefault: 20, // 默认列宽（字符数）
      maxWidthLimit: 50, // 最大列宽限制
      ...options,
    };

    this.dependenciesLoaded = false;
    this.loadingPromise = null;
  }

  async startExport() {
    try {
      if (!this.options.schema) {
        throw new Error("未提供 schema 对象");
      }
      this.showMessage("开始生成 Excel 模板...", "info");
      await this.ensureDependencies();
      const buffer = await this.generateExcel();
      const fileName = this.getFileName();
      this.downloadExcel(buffer, fileName);
      this.showMessage(`Excel 模板生成成功：${fileName}`, "success");
    } catch (error) {
      console.error("生成 Excel 模板失败:", error);
      this.showMessage("生成 Excel 模板失败：" + error.message, "error");
    }
  }

  async ensureDependencies() {
    if (this.dependenciesLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.loadDependencies();
    await this.loadingPromise;
    this.dependenciesLoaded = true;
  }

  loadDependencies() {
    return new Promise((resolve, reject) => {
      if (typeof ExcelJS !== "undefined") {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/ExcelJS/ V1/exceljs.min.js";
      script.onload = () => {
        if (typeof ExcelJS !== "undefined") {
          resolve();
        } else {
          reject(new Error("ExcelJS 加载后未定义"));
        }
      };
      script.onerror = () => reject(new Error("加载 ExcelJS 失败，请检查网络"));
      document.head.appendChild(script);
    });
  }

  /**
   * 根据editor.data生成枚举值说明文本
   * @param {Array} data 枚举数据 [{label, value}, ...]
   * @returns {string} 说明文本，如 "(0=不展示,1=展示)"
   */
  generateEnumHint(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return "";
    const hints = data.map((item) => `${item.value}=${item.label}`).join(",");
    return `（${hints}）`;
  }

  /**
   * 获取处理后的表头文本（自动追加枚举说明）
   * @param {Object} column 列配置
   * @returns {string} 最终表头文本
   */
  getProcessedHeader(column) {
    let originalHeader = column.header || "";
    // 检查是否为RadioGroup等带data枚举的编辑器
    if (
      column.editor &&
      column.editor.data &&
      Array.isArray(column.editor.data) &&
      column.editor.data.length > 0
    ) {
      // 避免重复添加说明
      const enumHint = this.generateEnumHint(column.editor.data);
      if (
        !originalHeader.includes(enumHint) &&
        !originalHeader.includes("（") === false
      ) {
        // 如果原header已经包含类似括号内容，先移除旧的括号内容再追加（简单处理）
        const headerWithoutParen = originalHeader
          .replace(/[（(][^）)]*[）)]/g, "")
          .trim();
        return `${headerWithoutParen} ${enumHint}`;
      } else if (!originalHeader.includes(enumHint)) {
        return `${originalHeader} ${enumHint}`;
      }
    }
    return originalHeader;
  }

  /**
   * 计算最优列宽（基于表头文本和maxLength）
   * @param {string} headerText 表头文本
   * @param {number} maxLength 配置的maxLength（字符数限制）
   * @returns {number} 列宽（Excel列宽单位）
   */
  calculateColumnWidth(headerText, maxLength) {
    // 基础宽度：表头文本宽度（中文字符按2倍计算，英文字符按1倍）
    const chineseCount = (headerText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherCount = headerText.length - chineseCount;
    const headerWidth = chineseCount * 2 + otherCount * 1 + 2; // 加2作为内边距

    let suggestedWidth = headerWidth;

    // 如果有maxLength配置，将其转换为列宽参考值（通常maxLength是字符数，中文按2倍估算）
    if (maxLength && typeof maxLength === "number") {
      // 假设输入内容平均宽度（中文场景下每个字符约占2个单位，英文约占1）
      const contentWidth = maxLength * 1.5; // 取平均估算
      suggestedWidth = Math.max(headerWidth, contentWidth);
    }

    // 限制宽度范围：最小8，最大maxWidthLimit
    let finalWidth = Math.min(
      Math.max(suggestedWidth, 8),
      this.options.maxWidthLimit,
    );
    // Excel列宽范围大约1-255
    finalWidth = Math.min(finalWidth, 255);
    return finalWidth;
  }

  /**
   * 获取工作表名称（优先级：手动指定 > schema.panel.title > schema.bindtable > 默认Sheet1）
   */
  getSheetName() {
    if (this.options.sheetName) return this.options.sheetName;
    const schema = this.options.schema;
    if (schema && schema.panel && schema.panel.title) return schema.panel.title;
    if (schema && schema.bindtable) return schema.bindtable;
    return "Sheet1";
  }

  async generateExcel() {
    const schema = this.options.schema;
    const sheetName = this.getSheetName();

    // 过滤掉xtype为rownumberer的列
    const dataColumns = schema.columns.filter(
      (col) => col.xtype !== "rownumberer",
    );

    // 处理每个列的表头（追加枚举说明）
    const processedColumns = dataColumns.map((col) => ({
      ...col,
      processedHeader: this.getProcessedHeader(col),
    }));

    const columnHeaders = processedColumns.map((col) => col.processedHeader);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // 设置列定义
    worksheet.columns = columnHeaders.map((header, idx) => {
      const originalCol = processedColumns[idx];
      const maxLength = originalCol.editor?.maxLength || originalCol.maxLength;
      const width = this.calculateColumnWidth(header, maxLength);
      return {
        header: header,
        key: `col_${idx}`,
        width: width,
      };
    });

    // 自定义列宽（如果配置了width字段，以配置为准，覆盖自动计算）
    dataColumns.forEach((col, index) => {
      if (col.width && typeof col.width === "number") {
        // 注意：列宽字符和ExcelJS width单位基本一致，这里直接使用
        const widthValue = Math.min(col.width / 7, this.options.maxWidthLimit);
        worksheet.getColumn(index + 1).width = Math.max(widthValue, 8);
      }
    });

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    const headerStyle = this.options.headerStyle;
    headerRow.eachCell((cell) => {
      if (headerStyle.fill) cell.fill = headerStyle.fill;
      if (headerStyle.font) cell.font = headerStyle.font;
      if (headerStyle.border) cell.border = headerStyle.border;
      if (headerStyle.alignment) cell.alignment = headerStyle.alignment;
    });

    // 可选：添加数据验证（针对RadioGroup等枚举字段）
    // 注意：需要在写入数据行之前添加数据验证，这里只设置验证规则，不写入数据
    processedColumns.forEach((col, colIndex) => {
      const editor = col.editor;
      // 检查是否为RadioGroup或有data枚举字段
      if (
        editor &&
        editor.data &&
        Array.isArray(editor.data) &&
        editor.data.length > 0
      ) {
        const validValues = editor.data.map((item) => String(item.value));
        if (validValues.length > 0) {
          // 获取列字母标识
          const colLetter = this.getColumnLetter(colIndex + 1);
          // 设置数据验证：从第2行开始，到第1048576行结束（Excel最大行数）
          const validationAddress = `${colLetter}2:${colLetter}1048576`;
          worksheet.getCell(validationAddress).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${validValues.join(",")}"`],
            showErrorMessage: true,
            errorTitle: "输入值无效",
            error: "请从下拉列表中选择有效值",
          };
        }
      }
    });

    // 冻结表头
    if (this.options.freezeHeader) {
      worksheet.views = [
        { state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" },
      ];
    }

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * 将列索引转换为Excel列字母（例如 1->A, 27->AA）
   * @param {number} index 列索引从1开始
   * @returns {string} 列字母
   */
  getColumnLetter(index) {
    let result = "";
    while (index > 0) {
      index--;
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26);
    }
    return result;
  }

  getFileName() {
    if (this.options.fileName) {
      return this.options.fileName;
    }
    const schema = this.options.schema;
    let baseName = "template";
    if (schema && schema.panel && schema.panel.title) {
      baseName = schema.panel.title;
    } else if (schema && schema.bindtable) {
      baseName = schema.bindtable;
    }
    return `${baseName}_模板.xlsx`;
  }

  downloadExcel(buffer, fileName) {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  showMessage(message, type = "info") {
    console.log(`[${type.toUpperCase()}]`, message);
    // 可根据项目需要接入实际的消息提示组件（如layui, element等）
    if (typeof window.$layer !== "undefined" && type === "error") {
      window.$layer.msg(message, { icon: 2 });
    } else if (typeof window.$layer !== "undefined" && type === "success") {
      window.$layer.msg(message, { icon: 1 });
    } else if (typeof window.$layer !== "undefined") {
      window.$layer.msg(message);
    }
  }
}

// 全局挂载
if (typeof window !== "undefined") {
  window.ExcelTemplateExporter = ExcelTemplateExporter;
}
