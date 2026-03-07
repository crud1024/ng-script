/**
 * Excel 模板生成器（基于 Schema）
 * 用于根据前端表格 schema 生成包含表头（黄色背景）的 Excel 模板文件
 * 依赖库：ExcelJS（自动从 CDN 加载）
 */
class ExcelTemplateExporter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {Object} options.schema 表格 schema 对象（必须包含 columns 和 bindtable）
   * @param {string} [options.fileName] 输出 Excel 文件名，默认使用 schema.bindtable + '_模板.xlsx'
   * @param {string} [options.sheetName] 工作表名称，默认使用 schema.bindtable 或 'Sheet1'
   * @param {Object} [options.headerStyle] 表头样式，默认黄色背景、加粗、居中、细边框
   * @param {boolean} [options.freezeHeader=true] 是否冻结表头行
   */
  constructor(options = {}) {
    this.options = {
      schema: options.schema || null,
      fileName: options.fileName || null,
      sheetName: options.sheetName || null,
      headerStyle: options.headerStyle || {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" }, // 黄色背景
        },
        font: {
          bold: true,
          size: 12,
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: {
          horizontal: "center",
          vertical: "middle",
        },
      },
      freezeHeader: options.freezeHeader !== false, // 默认冻结
      ...options,
    };

    this.dependenciesLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * 开始导出 Excel 模板
   * @returns {Promise<void>}
   */
  async startExport() {
    try {
      if (!this.options.schema) {
        throw new Error("未提供 schema 对象");
      }

      this.showMessage("开始生成 Excel 模板...", "info");

      // 确保 ExcelJS 已加载
      await this.ensureDependencies();

      // 生成 Excel 文件 buffer
      const buffer = await this.generateExcel();

      // 获取文件名并下载
      const fileName = this.getFileName();
      this.downloadExcel(buffer, fileName);

      this.showMessage(`Excel 模板生成成功：${fileName}`, "success");
    } catch (error) {
      console.error("生成 Excel 模板失败:", error);
      this.showMessage("生成 Excel 模板失败：" + error.message, "error");
    }
  }

  /**
   * 确保依赖库已加载
   * @returns {Promise<void>}
   */
  async ensureDependencies() {
    if (this.dependenciesLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.loadDependencies();
    await this.loadingPromise;
    this.dependenciesLoaded = true;
  }

  /**
   * 加载 ExcelJS 库
   * @returns {Promise<void>}
   */
  loadDependencies() {
    return new Promise((resolve, reject) => {
      // 如果已经存在全局 ExcelJS，直接返回
      if (typeof ExcelJS !== "undefined") {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/ExcelJS/ V1/exceljs.min.js";
      script.onload = () => {
        // 确保加载后全局对象可用
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
   * 根据 schema 生成 Excel 工作簿并返回 buffer
   * @returns {Promise<ArrayBuffer>}
   */
  async generateExcel() {
    const schema = this.options.schema;
    const sheetName = this.options.sheetName || schema.bindtable || "Sheet1";

    // 提取列头（排除 xtype 为 rownumberer 的序号列）
    const dataColumns = schema.columns.filter(
      (col) => col.header && col.xtype !== "rownumberer",
    );
    const columnHeaders = dataColumns.map((col) => col.header);

    // 创建工作簿和工作表
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // 设置列（默认宽度 20）
    worksheet.columns = columnHeaders.map((header) => ({
      header: header,
      key: header,
      width: 20,
    }));

    // 根据 schema 中可能存在的 width 调整列宽（转换比例仅供参考）
    dataColumns.forEach((col, index) => {
      if (col.width) {
        // ExcelJS 列宽单位 ≈ 字符数，简单将像素除以 7 得到字符数
        worksheet.getColumn(index + 1).width = col.width / 7;
      }
    });

    // 获取表头行（第一行）并应用样式
    const headerRow = worksheet.getRow(1);
    const headerStyle = this.options.headerStyle;

    headerRow.eachCell((cell) => {
      if (headerStyle.fill) cell.fill = headerStyle.fill;
      if (headerStyle.font) cell.font = headerStyle.font;
      if (headerStyle.border) cell.border = headerStyle.border;
      if (headerStyle.alignment) cell.alignment = headerStyle.alignment;
    });

    // 冻结表头行
    if (this.options.freezeHeader) {
      worksheet.views = [
        { state: "frozen", xSplit: 0, ySplit: 1, activeCell: "A2" },
      ];
    }

    // 返回文件 buffer
    return await workbook.xlsx.writeBuffer();
  }

  /**
   * 获取最终文件名
   * @returns {string}
   */
  getFileName() {
    if (this.options.fileName) {
      return this.options.fileName;
    }
    const schema = this.options.schema;
    const baseName = schema && schema.bindtable ? schema.bindtable : "template";
    return `${baseName}_模板.xlsx`;
  }

  /**
   * 下载 Excel 文件
   * @param {ArrayBuffer} buffer Excel 文件 buffer
   * @param {string} fileName 文件名
   */
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

  /**
   * 显示消息（可扩展为全局提示，目前仅输出到控制台）
   * @param {string} message 消息内容
   * @param {string} type 类型：info/success/error
   */
  showMessage(message, type = "info") {
    console.log(`[${type.toUpperCase()}]`, message);
    // 如有全局提示组件可在此调用，例如：
    // if (typeof $NG !== 'undefined' && $NG.message) {
    //   $NG.message(message, type);
    // }
  }
}

// 暴露到全局
if (typeof window !== "undefined") {
  window.ExcelTemplateExporter = ExcelTemplateExporter;
}
