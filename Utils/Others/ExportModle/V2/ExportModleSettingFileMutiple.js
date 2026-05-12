/**
 * MultiSheetExcelExporter - 多工作表Excel模板导出器
 * 使用方式：
 *   const exporter = new MultiSheetExcelExporter();
 *   await exporter.exportFromTemplateString(templateString, "输出文件名.xlsx");
 */

class MultiSheetExcelExporter {
  constructor(options = {}) {
    this.options = {
      headerStyle: options.headerStyle || {
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
      },
      freezeHeader: options.freezeHeader !== false,
      ...options,
    };

    this.dependenciesLoaded = false;
    this.loadingPromise = null;
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
        "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js";
      script.onload = () => {
        if (typeof ExcelJS !== "undefined") {
          resolve();
        } else {
          // 如果没有ExcelJS，使用SheetJS作为备选
          if (typeof XLSX !== "undefined") {
            window.ExcelJS = { version: "sheetjs-fallback" };
            resolve();
          } else {
            reject(new Error("无法加载Excel库"));
          }
        }
      };
      script.onerror = () => reject(new Error("加载依赖失败"));
      document.head.appendChild(script);
    });
  }

  getValidSheetName(name, index) {
    let sheetName = name || `Sheet${index + 1}`;
    sheetName = sheetName.replace(/[\\/*?:[\]]/g, "");
    if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
    return sheetName;
  }

  calculateColumnWidth(headerText) {
    const chineseCount = (headerText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherCount = headerText.length - chineseCount;
    let width = chineseCount * 2 + otherCount * 1 + 4;
    width = Math.min(Math.max(width, 10), 50);
    return width;
  }

  async generateWorksheet(workbook, sheetConfig, sheetIndex) {
    const sheetName = this.getValidSheetName(sheetConfig.sheetName, sheetIndex);
    const worksheet = workbook.addWorksheet(sheetName);

    const columns = sheetConfig.columns || [];

    if (columns.length === 0) {
      worksheet.addRow(["提示：无列定义"]);
      return worksheet;
    }

    // 设置列宽
    worksheet.columns = columns.map((col, idx) => ({
      header: col.header,
      key: `col_${idx}`,
      width: col.width
        ? Math.min(col.width / 7, 50)
        : this.calculateColumnWidth(col.header),
    }));

    // 表头样式 - 只设置表头行，不修改表头文字
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      if (this.options.headerStyle.fill)
        cell.fill = this.options.headerStyle.fill;
      if (this.options.headerStyle.font)
        cell.font = this.options.headerStyle.font;
      if (this.options.headerStyle.alignment)
        cell.alignment = this.options.headerStyle.alignment;
    });
    headerRow.height = 22;

    // 冻结表头
    if (this.options.freezeHeader) {
      worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
    }

    // 添加一行空行供用户填写
    const emptyRow = [];
    for (let i = 0; i < columns.length; i++) {
      emptyRow.push("");
    }
    worksheet.addRow(emptyRow);

    return worksheet;
  }

  async exportMultiSheet(schemasList, fileName = "Template.xlsx") {
    await this.ensureDependencies();

    if (
      !schemasList ||
      !Array.isArray(schemasList) ||
      schemasList.length === 0
    ) {
      throw new Error("schemasList 必须是非空数组");
    }

    let workbook;

    // 使用ExcelJS（如果可用）或SheetJS
    if (typeof ExcelJS !== "undefined" && ExcelJS.Workbook) {
      workbook = new ExcelJS.Workbook();
      for (let i = 0; i < schemasList.length; i++) {
        await this.generateWorksheet(workbook, schemasList[i], i);
      }
      const buffer = await workbook.xlsx.writeBuffer();
      this.downloadExcel(buffer, fileName);
    } else if (typeof XLSX !== "undefined") {
      // 使用SheetJS作为备选
      const sheets = {};
      for (let i = 0; i < schemasList.length; i++) {
        const sheet = schemasList[i];
        const headers = (sheet.columns || []).map((c) => c.header);
        const data = [headers, []]; // 表头 + 空行
        sheets[sheet.sheetName] = XLSX.utils.aoa_to_sheet(data);
      }
      const wb = XLSX.utils.book_new();
      for (const [name, sheet] of Object.entries(sheets)) {
        XLSX.utils.book_append_sheet(wb, sheet, name);
      }
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      this.downloadExcel(buffer, fileName);
    } else {
      throw new Error("无法找到Excel处理库");
    }

    this.showMessage(
      `模板生成成功：${fileName}，共 ${schemasList.length} 个工作表`,
      "success",
    );
    return true;
  }

  async exportFromTemplateString(templateString, fileName = "Template.xlsx") {
    let parsed;
    try {
      parsed = JSON.parse(templateString);
    } catch (e) {
      throw new Error("模板字符串JSON格式错误");
    }

    let schemasList;

    if (parsed.sheets && Array.isArray(parsed.sheets)) {
      schemasList = parsed.sheets;
    } else if (Array.isArray(parsed)) {
      schemasList = parsed;
    } else {
      throw new Error("模板格式无效，需要包含 sheets 数组");
    }

    if (schemasList.length === 0) {
      throw new Error("未找到任何工作表定义");
    }

    return this.exportMultiSheet(schemasList, fileName);
  }

  downloadExcel(buffer, fileName) {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  showMessage(message, type = "info") {
    console.log(`[${type}]`, message);
    const event = new CustomEvent("exporterMessage", {
      detail: { message, type },
    });
    window.dispatchEvent(event);
  }
}

if (typeof window !== "undefined") {
  window.MultiSheetExcelExporter = MultiSheetExcelExporter;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = MultiSheetExcelExporter;
}
