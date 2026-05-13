class ExcelTemplateExporter {
  constructor(options = {}) {
    // 基础配置
    this.options = {
      schema: options.schema || null,
      fileName: options.fileName || null,
      sheetName: options.sheetName || null,
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
      autoWidthDefault: 20,
      maxWidthLimit: 50,
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
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/ExcelJS/V1/exceljs.min.js";
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
   * 扁平化列配置，处理嵌套的 columns 结构
   * @param {Array} columns 原始列配置
   * @param {string} parentHeader 父级表头名称
   * @returns {Array} 扁平化后的列配置数组
   */
  flattenColumns(columns, parentHeader = "") {
    const result = [];

    for (const col of columns) {
      // 如果是 rownumberer，跳过
      if (col.xtype === "rownumberer") continue;

      // 如果有嵌套的 columns 属性，递归处理
      if (col.columns && Array.isArray(col.columns)) {
        const nestedColumns = this.flattenColumns(col.columns, col.header);
        result.push(...nestedColumns);
      } else {
        // 普通列，直接添加
        result.push({
          ...col,
          parentHeader: parentHeader,
          // 如果有父级表头，合并显示
          fullHeader: parentHeader
            ? `${parentHeader} - ${col.header}`
            : col.header,
        });
      }
    }

    return result;
  }

  generateEnumHint(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return "";
    const hints = data.map((item) => `${item.value}=${item.label}`).join(",");
    return `（${hints}）`;
  }

  getProcessedHeader(column) {
    // 使用完整表头（包含父级）
    let originalHeader = column.fullHeader || column.header || "";

    if (
      column.editor &&
      column.editor.data &&
      Array.isArray(column.editor.data) &&
      column.editor.data.length > 0
    ) {
      const enumHint = this.generateEnumHint(column.editor.data);
      // 避免重复添加
      if (!originalHeader.includes(enumHint)) {
        return `${originalHeader} ${enumHint}`;
      }
    }
    return originalHeader;
  }

  calculateColumnWidth(headerText, maxLength) {
    let headerWidth = 0;
    for (let i = 0; i < headerText.length; i++) {
      const char = headerText.charAt(i);
      if (/[\u4e00-\u9fa5]/.test(char)) {
        headerWidth += 2;
      } else {
        headerWidth += 1;
      }
    }
    headerWidth += 2;

    let suggestedWidth = headerWidth;

    if (maxLength && typeof maxLength === "number") {
      const contentWidth = maxLength * 1.5;
      suggestedWidth = Math.max(headerWidth, contentWidth);
    }

    let finalWidth = Math.min(
      Math.max(suggestedWidth, 8),
      this.options.maxWidthLimit,
    );
    finalWidth = Math.min(finalWidth, 255);
    return finalWidth;
  }

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

    // 扁平化列配置
    const flatColumns = this.flattenColumns(schema.columns);

    // 如果没有有效的列，抛出错误
    if (flatColumns.length === 0) {
      throw new Error("没有找到有效的列配置");
    }

    // 处理每个列的表头
    const processedColumns = flatColumns.map((col) => ({
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

    // 自定义列宽（如果配置了width字段）
    processedColumns.forEach((col, index) => {
      if (col.width && typeof col.width === "number") {
        const widthValue = Math.min(col.width / 7, this.options.maxWidthLimit);
        worksheet.getColumn(index + 1).width = Math.max(widthValue, 8);
      }
    });

    // 设置表头样式（合并单元格处理分组表头）
    // 注意：由于我们扁平化了列，分组表头会显示为"父级 - 子级"的形式
    // 如果需要真正的合并单元格，需要更复杂的处理，这里保持简单

    const headerRow = worksheet.getRow(1);
    const headerStyle = this.options.headerStyle;

    headerRow.height = 30; // 设置表头行高
    headerRow.eachCell((cell) => {
      if (headerStyle.fill) cell.fill = headerStyle.fill;
      if (headerStyle.font) cell.font = headerStyle.font;
      if (headerStyle.border) cell.border = headerStyle.border;
      if (headerStyle.alignment) cell.alignment = headerStyle.alignment;

      // 设置自动换行
      cell.alignment = {
        ...cell.alignment,
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    });

    // 添加数据验证
    processedColumns.forEach((col, colIndex) => {
      const editor = col.editor;
      if (
        editor &&
        editor.data &&
        Array.isArray(editor.data) &&
        editor.data.length > 0
      ) {
        const validValues = editor.data.map((item) => String(item.value));
        if (validValues.length > 0) {
          const colLetter = this.getColumnLetter(colIndex + 1);
          const validationAddress = `${colLetter}2:${colLetter}1048576`;
          validationAddress.split(",").forEach((addr) => {
            try {
              worksheet.getCell(addr).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [`"${validValues.join(",")}"`],
                showErrorMessage: true,
                errorTitle: "输入值无效",
                error: "请从下拉列表中选择有效值",
              };
            } catch (e) {
              console.warn(`设置数据验证失败: ${addr}`, e);
            }
          });
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
    if (typeof window.$layer !== "undefined" && type === "error") {
      window.$layer.msg(message, { icon: 2 });
    } else if (typeof window.$layer !== "undefined" && type === "success") {
      window.$layer.msg(message, { icon: 1 });
    } else if (typeof window.$layer !== "undefined") {
      window.$layer.msg(message);
    }
  }
}

if (typeof window !== "undefined") {
  window.ExcelTemplateExporter = ExcelTemplateExporter;
}
