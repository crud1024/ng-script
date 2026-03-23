// ==================== Excel 导出类 ====================

class ExcelExporter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {string} options.fileName 导出文件名（不含扩展名）
   * @param {string} options.mode 表头模式: 'standard' 或 'leafSpan'，默认 'leafSpan'
   * @param {Object} options.headerStyle 表头样式配置
   * @param {string} options.headerStyle.backgroundColor 表头背景色，默认 '#E0E0E0'
   * @param {string} options.headerStyle.fontColor 表头字体颜色，默认 '#000000'
   * @param {number} options.headerStyle.fontSize 表头字体大小，默认 11
   * @param {boolean} options.headerStyle.bold 表头是否粗体，默认 true
   * @param {Object} options.bodyStyle 表体样式配置
   * @param {string} options.bodyStyle.backgroundColor 表体背景色，默认 '#FFFFFF'
   * @param {string} options.bodyStyle.fontColor 表体字体颜色，默认 '#000000'
   * @param {number} options.bodyStyle.fontSize 表体字体大小，默认 10
   * @param {boolean} options.bodyStyle.alternateRowColor 是否启用斑马纹，默认 false
   * @param {string} options.bodyStyle.alternateBackgroundColor 斑马纹背景色，默认 '#F5F5F5'
   * @param {Object} options.borderStyle 边框样式
   * @param {string} options.borderStyle.color 边框颜色，默认 '#000000'
   * @param {string} options.borderStyle.style 边框样式，默认 'thin'
   * @param {Object} options.columnConfig 列宽配置
   * @param {number} options.columnConfig.minWidth 最小列宽，默认 8
   * @param {number} options.columnConfig.maxWidth 最大列宽，默认 50
   * @param {number} options.columnConfig.defaultWidth 默认列宽，默认 12
   */
  constructor(options = {}) {
    // 文件名配置
    this.fileName = options.fileName || "AI测算导出";

    // 表头模式
    this.mode = options.mode || "leafSpan";

    // 表头样式配置
    this.headerStyle = {
      backgroundColor: options.headerStyle?.backgroundColor || "FFE0E0E0",
      fontColor: options.headerStyle?.fontColor || "FF000000",
      fontSize: options.headerStyle?.fontSize || 11,
      bold: options.headerStyle?.bold !== false,
      ...options.headerStyle,
    };

    // 表体样式配置
    this.bodyStyle = {
      backgroundColor: options.bodyStyle?.backgroundColor || "FFFFFFFF",
      fontColor: options.bodyStyle?.fontColor || "FF000000",
      fontSize: options.bodyStyle?.fontSize || 10,
      alternateRowColor: options.bodyStyle?.alternateRowColor || false,
      alternateBackgroundColor:
        options.bodyStyle?.alternateBackgroundColor || "FFF5F5F5",
      ...options.bodyStyle,
    };

    // 边框样式
    this.borderStyle = {
      color: options.borderStyle?.color || "FF000000",
      style: options.borderStyle?.style || "thin",
      ...options.borderStyle,
    };

    // 列宽配置
    this.columnConfig = {
      minWidth: options.columnConfig?.minWidth || 8,
      maxWidth: options.columnConfig?.maxWidth || 50,
      defaultWidth: options.columnConfig?.defaultWidth || 12,
      ...options.columnConfig,
    };

    // ExcelJS 实例
    this.ExcelJS = null;
    this.workbook = null;

    // 黑名单字段
    this.blacklist = ["s_tree_pid", "s_tree_id", "phid_pc"];
  }

  /**
   * 初始化 ExcelJS
   */
  async init() {
    return new Promise((resolve, reject) => {
      if (typeof window.ExcelJS !== "undefined") {
        this.ExcelJS = window.ExcelJS;
        this.workbook = new this.ExcelJS.Workbook();
        this.workbook.creator = "AI测算系统";
        this.workbook.lastModifiedBy = $NG.getUserInfo?.()?.name || "system";
        this.workbook.created = new Date();
        resolve();
        return;
      }

      $NG.loadScript(
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/ExcelJS/ V1/exceljs.min.js",
        () => {
          this.ExcelJS = window.ExcelJS;
          this.workbook = new this.ExcelJS.Workbook();
          this.workbook.creator = "AI测算系统";
          this.workbook.lastModifiedBy = $NG.getUserInfo?.()?.name || "system";
          this.workbook.created = new Date();
          resolve();
        },
        reject,
      );
    });
  }

  /**
   * 递归过滤列配置（剔除隐藏列和指定字段）
   * @param {Array} columns 原始列配置
   * @returns {Array} 过滤后的列树
   */
  filterColumns(columns) {
    return columns.reduce((acc, col) => {
      // 隐藏列直接跳过
      if (col.hidden === true) return acc;
      // 普通列（有 dataIndex）
      if (col.dataIndex && !col.columns) {
        if (this.blacklist.includes(col.dataIndex)) return acc;
        // 保留叶子列
        acc.push({ ...col });
        return acc;
      }
      // 分组列（有 columns 子项）
      if (col.columns && Array.isArray(col.columns)) {
        const filteredChildren = this.filterColumns(col.columns);
        if (filteredChildren.length === 0) return acc;
        acc.push({
          ...col,
          columns: filteredChildren,
        });
      }
      return acc;
    }, []);
  }

  /**
   * 计算节点的叶子数量（colspan）
   */
  countLeaves(node) {
    if (!node.columns || node.columns.length === 0) return 1;
    return node.columns.reduce(
      (sum, child) => sum + this.countLeaves(child),
      0,
    );
  }

  /**
   * 为节点计算深度（包含自身到最深叶子的层数）
   */
  computeNodeDepth(node) {
    if (!node.columns || node.columns.length === 0) {
      node.depth = 1;
      return 1;
    }
    let maxChildDepth = 0;
    for (const child of node.columns) {
      maxChildDepth = Math.max(maxChildDepth, this.computeNodeDepth(child));
    }
    node.depth = maxChildDepth + 1;
    return node.depth;
  }

  /**
   * 获取节点标题（兼容多种字段名）
   */
  getNodeTitle(node) {
    return node.header || node.title || node.langKey || node.name || "";
  }

  /**
   * 构建表头矩阵（支持两种合并模式）
   * @param {Array} tree 过滤后的列树
   * @returns {Array<Array<{value: string, rowspan: number, colspan: number}>>}
   */
  buildHeaderMatrix(tree) {
    if (!tree || tree.length === 0) return [];

    // 先为每个节点计算深度（标准模式需要）
    if (this.mode === "standard") {
      for (const root of tree) {
        this.computeNodeDepth(root);
      }
    }

    // 全局最大深度（即表头行数）
    const maxDepth = Math.max(
      ...tree.map((root) => {
        if (this.mode === "standard") return root.depth;
        // leafSpan 模式下，表头行数 = 树的最大深度（所有节点中最深的深度）
        return (function getMaxDepth(node) {
          if (!node.columns || node.columns.length === 0) return 1;
          return 1 + Math.max(...node.columns.map(getMaxDepth));
        })(root);
      }),
    );

    // 总列数
    const totalCols = tree.reduce(
      (sum, node) => sum + this.countLeaves(node),
      0,
    );

    // 初始化矩阵
    const matrix = Array(maxDepth)
      .fill()
      .map(() => Array(totalCols).fill(null));

    let startCol = 0;

    const fillNode = (node, row, col) => {
      const colspan = this.countLeaves(node);
      const hasChildren = node.columns && node.columns.length > 0;

      let rowspan;
      if (this.mode === "standard") {
        // 标准模式：节点占据其子树深度
        rowspan = node.depth;
      } else {
        // leafSpan 模式
        if (hasChildren) {
          // 有子标题的节点只占一行
          rowspan = 1;
        } else {
          // 叶子节点合并到最大深度
          rowspan = maxDepth - row;
        }
      }

      const title = this.getNodeTitle(node);

      // 填充当前节点
      matrix[row][col] = {
        value: title,
        rowspan: rowspan,
        colspan: colspan,
      };

      // 递归子节点
      if (hasChildren) {
        let childCol = col;
        for (const child of node.columns) {
          fillNode(child, row + 1, childCol);
          childCol += this.countLeaves(child);
        }
      }
    };

    for (const root of tree) {
      fillNode(root, 0, startCol);
      startCol += this.countLeaves(root);
    }

    // 打印调试信息
    console.log(`表头矩阵 (mode=${this.mode}):`);
    for (let i = 0; i < matrix.length; i++) {
      const rowStr = matrix[i]
        .map((cell) => (cell ? cell.value : ""))
        .join("\t");
      console.log(`行${i + 1}: ${rowStr}`);
    }

    return matrix;
  }

  /**
   * 扁平化叶子列（用于数据映射，保持与矩阵列顺序一致）
   */
  flattenLeaves(tree, result = []) {
    for (const node of tree) {
      if (node.columns && node.columns.length) {
        this.flattenLeaves(node.columns, result);
      } else if (node.dataIndex) {
        result.push({
          dataIndex: node.dataIndex,
          header: this.getNodeTitle(node),
          width: node.width || this.columnConfig.defaultWidth,
        });
      }
    }
    return result;
  }

  /**
   * 获取边框样式
   */
  getBorder() {
    return {
      top: {
        style: this.borderStyle.style,
        color: { argb: this.borderStyle.color },
      },
      left: {
        style: this.borderStyle.style,
        color: { argb: this.borderStyle.color },
      },
      bottom: {
        style: this.borderStyle.style,
        color: { argb: this.borderStyle.color },
      },
      right: {
        style: this.borderStyle.style,
        color: { argb: this.borderStyle.color },
      },
    };
  }

  /**
   * 获取表头单元格样式
   */
  getHeaderCellStyle() {
    return {
      font: {
        bold: this.headerStyle.bold,
        size: this.headerStyle.fontSize,
        color: { argb: this.headerStyle.fontColor },
      },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: this.headerStyle.backgroundColor },
      },
      border: this.getBorder(),
    };
  }

  /**
   * 获取表体单元格样式
   * @param {number} rowIndex 行索引
   */
  getBodyCellStyle(rowIndex) {
    let backgroundColor = this.bodyStyle.backgroundColor;

    // 斑马纹
    if (this.bodyStyle.alternateRowColor && rowIndex % 2 === 1) {
      backgroundColor = this.bodyStyle.alternateBackgroundColor;
    }

    return {
      font: {
        size: this.bodyStyle.fontSize,
        color: { argb: this.bodyStyle.fontColor },
      },
      alignment: { vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: backgroundColor },
      },
      border: this.getBorder(),
    };
  }

  /**
   * 计算并设置列宽（智能自适应）
   * @param {Worksheet} worksheet Excel工作表
   * @param {Array} leaves 叶子列配置
   * @param {Array} rowsData 数据行
   * @param {Array} headerMatrix 表头矩阵
   */
  autoFitColumns(worksheet, leaves, rowsData, headerMatrix) {
    const columnCount = leaves.length;

    // 收集所有列的内容（包括表头和数据）
    const columnContents = Array(columnCount)
      .fill()
      .map(() => []);

    // 收集表头内容
    for (let i = 0; i < headerMatrix.length; i++) {
      const row = headerMatrix[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell && cell.value) {
          // 该单元格占据多列时，内容分散到各列
          const colspan = cell.colspan || 1;
          for (let k = 0; k < colspan; k++) {
            if (j + k < columnCount) {
              columnContents[j + k].push(cell.value);
            }
          }
        }
      }
    }

    // 收集数据内容
    for (const row of rowsData) {
      for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let value = row[leaf.dataIndex];
        if (value !== undefined && value !== null) {
          // 格式化数值
          if (typeof value === "number") {
            if (Math.abs(value) < 0.01 && value !== 0) {
              value = value.toFixed(4);
            } else if (Number.isInteger(value)) {
              value = value;
            } else {
              value = value.toFixed(2);
            }
          }
          columnContents[idx].push(value.toString());
        }
      }
    }

    // 计算每列最大宽度
    for (let idx = 0; idx < columnCount; idx++) {
      let maxLength = 0;

      // 检查配置的列宽
      const configWidth = leaves[idx].width;
      if (configWidth && typeof configWidth === "number") {
        maxLength = Math.max(maxLength, configWidth);
      }

      // 检查内容长度
      for (const content of columnContents[idx]) {
        if (content) {
          // 中文字符按2个字符计算，英文按1个字符计算（更精确的宽度估算）
          let contentLength = 0;
          for (let i = 0; i < content.length; i++) {
            const charCode = content.charCodeAt(i);
            // 中文字符范围
            if (
              (charCode >= 0x4e00 && charCode <= 0x9fff) ||
              (charCode >= 0x3400 && charCode <= 0x4dbf) ||
              (charCode >= 0xf900 && charCode <= 0xfaff) ||
              (charCode >= 0x20000 && charCode <= 0x2ffff)
            ) {
              contentLength += 2;
            } else {
              contentLength += 1;
            }
          }
          maxLength = Math.max(maxLength, contentLength);
        }
      }

      // 设置列宽
      let columnWidth = Math.min(
        Math.max(maxLength + 2, this.columnConfig.minWidth),
        this.columnConfig.maxWidth,
      );

      // 如果有配置的宽度且大于计算宽度，优先使用配置宽度
      if (configWidth && configWidth > columnWidth) {
        columnWidth = Math.min(configWidth, this.columnConfig.maxWidth);
      }

      const column = worksheet.getColumn(idx + 1);
      column.width = columnWidth;
    }
  }

  /**
   * 创建工作表
   * @param {string} sheetName 工作表名称
   * @param {Array} filteredTree 过滤后的列树
   * @param {Array} rowsData 数据行
   * @returns {Worksheet} Excel工作表
   */
  createWorksheet(sheetName, filteredTree, rowsData) {
    // 构建表头矩阵
    const headerMatrix = this.buildHeaderMatrix(filteredTree);
    // 获取叶子列
    const leaves = this.flattenLeaves(filteredTree);

    console.log(`${sheetName} 叶子列数量: ${leaves.length}`);
    leaves.forEach((leaf, idx) => {
      console.log(
        `  列${idx + 1}: ${leaf.dataIndex} - ${leaf.header} - 宽度: ${leaf.width || "auto"}`,
      );
    });

    // 创建工作表
    const worksheet = this.workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });

    // 设置默认行高
    worksheet.properties.defaultRowHeight = 20;

    // 写入表头行
    for (let i = 0; i < headerMatrix.length; i++) {
      const rowCells = headerMatrix[i];
      const excelRow = worksheet.addRow([]);
      excelRow.height = 25;

      for (let j = 0; j < rowCells.length; j++) {
        const cellInfo = rowCells[j];
        const cell = excelRow.getCell(j + 1);

        if (!cellInfo) {
          cell.value = "";
          continue;
        }

        cell.value = cellInfo.value;
        Object.assign(cell, this.getHeaderCellStyle());
      }
    }

    // 合并单元格
    const mergeList = [];
    for (let i = 0; i < headerMatrix.length; i++) {
      const rowCells = headerMatrix[i];
      for (let j = 0; j < rowCells.length; j++) {
        const cellInfo = rowCells[j];
        if (cellInfo && (cellInfo.rowspan > 1 || cellInfo.colspan > 1)) {
          mergeList.push({
            startRow: i + 1,
            endRow: i + cellInfo.rowspan,
            startCol: j + 1,
            endCol: j + cellInfo.colspan,
          });
        }
      }
    }

    console.log(`需要合并的单元格数量: ${mergeList.length}`);
    for (const merge of mergeList) {
      try {
        worksheet.mergeCells(
          merge.startRow,
          merge.startCol,
          merge.endRow,
          merge.endCol,
        );
      } catch (e) {
        console.warn(
          `合并失败: ${merge.startRow},${merge.startCol} -> ${merge.endRow},${merge.endCol}`,
          e.message,
        );
      }
    }

    // 写入数据行
    for (let rowIndex = 0; rowIndex < rowsData.length; rowIndex++) {
      const row = rowsData[rowIndex];
      const dataRow = worksheet.addRow([]);
      dataRow.height = 20;

      for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let value = row[leaf.dataIndex];

        // 处理数值格式化
        if (typeof value === "number") {
          if (Math.abs(value) < 0.01 && value !== 0) {
            value = value.toFixed(4);
          } else if (Number.isInteger(value)) {
            value = value;
          } else {
            value = value.toFixed(2);
          }
        } else if (value === undefined || value === null) {
          value = "";
        }

        const cell = dataRow.getCell(idx + 1);
        cell.value = value;

        // 设置对齐方式
        const alignment = { vertical: "middle" };
        alignment.horizontal = typeof value === "number" ? "right" : "left";

        // 应用表体样式
        const bodyStyle = this.getBodyCellStyle(rowIndex);
        bodyStyle.alignment = { ...bodyStyle.alignment, ...alignment };
        Object.assign(cell, bodyStyle);
      }
    }

    // 智能自适应列宽
    this.autoFitColumns(worksheet, leaves, rowsData, headerMatrix);

    return worksheet;
  }

  /**
   * 导出 Excel 文件
   * @param {Object} designData 设计数据
   * @param {Object} resultData 结果数据
   * @param {string} customFileName 自定义文件名（可选，覆盖构造函数中的文件名）
   */
  async export(designData, resultData, customFileName = null) {
    console.log("开始导出 Excel...", { mode: this.mode });

    try {
      // 初始化
      await this.init();

      // 从 designData.data 中获取配置
      const configData = designData.data || designData;

      // 获取表名映射
      const busTableChnMap = configData.publicProperty?.busTableChnMap || {};
      console.log("表名映射:", busTableChnMap);

      // 确定文件名
      let fileName = customFileName || this.fileName;
      if (!customFileName && !fileName.endsWith(".xlsx")) {
        for (const [key, value] of Object.entries(busTableChnMap)) {
          if (key.endsWith("_m")) {
            fileName = value;
            break;
          }
        }
        fileName += ".xlsx";
      } else if (!fileName.endsWith(".xlsx")) {
        fileName += ".xlsx";
      }
      console.log("导出文件名:", fileName);

      // 获取所有明细表 (以 _d 开头，带数字)
      const detailTables = Object.keys(busTableChnMap)
        .filter((key) => key.match(/_d\d+$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+$/)[0], 10);
          const numB = parseInt(b.match(/\d+$/)[0], 10);
          return numA - numB;
        });

      console.log("明细表列表:", detailTables);

      if (detailTables.length === 0) {
        throw new Error("未找到明细表配置");
      }

      // 遍历每个明细表，生成 sheet
      for (const tableKey of detailTables) {
        const sheetName = busTableChnMap[tableKey] || tableKey;
        const gridConfig = configData.uiContent?.grid?.[tableKey];

        console.log(
          `\n========== 处理表 ${tableKey}，Sheet名称: ${sheetName} ==========`,
        );

        if (!gridConfig) {
          console.warn(`未找到表格配置: ${tableKey}`);
          continue;
        }

        // 过滤列配置
        const rawColumns = gridConfig.columns || [];
        const filteredTree = this.filterColumns(rawColumns);

        console.log(
          `${tableKey} 过滤后的列树结构:`,
          JSON.stringify(filteredTree, null, 2),
        );

        if (filteredTree.length === 0) {
          console.warn(`${tableKey} 无有效列，跳过`);
          continue;
        }

        // 获取表格数据
        const rowsData = resultData[tableKey] || [];
        console.log(`${tableKey} 数据行数: ${rowsData.length}`);

        // 创建工作表
        this.createWorksheet(sheetName, filteredTree, rowsData);

        console.log(`${tableKey} Sheet 创建完成`);
      }

      // 导出文件
      console.log("开始导出文件...");
      const buffer = await this.workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Excel 导出完成:", fileName);
      return { success: true, fileName, message: "导出成功" };
    } catch (error) {
      console.error("导出失败:", error);
      throw error;
    }
  }

  /**
   * 静态方法：快速导出
   * @param {Object} designData 设计数据
   * @param {Object} resultData 结果数据
   * @param {Object} options 配置选项
   */
  static async quickExport(designData, resultData, options = {}) {
    const exporter = new ExcelExporter(options);
    try {
      await exporter.export(designData, resultData, options.fileName);
      $NG.alert("导出成功！");
    } catch (error) {
      console.error("导出失败:", error);
      $NG.alert("导出失败：" + (error.message || "未知错误"));
    }
  }
}
if (typeof window !== "undefined") {
  window.ExcelExporter = ExcelExporter;
}

// ==================== 使用示例 ====================

// 方式1: 使用默认配置
// const exporter = new ExcelExporter();
// await exporter.export(designData, resultData);

// 方式2: 自定义配置
// const exporter = new ExcelExporter({
//     fileName: '我的测算报表',
//     mode: 'leafSpan',
//     headerStyle: {
//         backgroundColor: 'FF4CAF50',  // 绿色背景
//         fontColor: 'FFFFFFFF',        // 白色字体
//         fontSize: 12,
//         bold: true
//     },
//     bodyStyle: {
//         backgroundColor: 'FFFFFFFF',    // 白色背景
//         fontColor: 'FF000000',         // 黑色字体
//         fontSize: 10,
//         alternateRowColor: true,       // 启用斑马纹
//         alternateBackgroundColor: 'FFF5F5F5'  // 斑马纹颜色
//     },
//     borderStyle: {
//         color: 'FFCCCCCC',             // 浅灰色边框
//         style: 'thin'
//     },
//     columnConfig: {
//         minWidth: 8,
//         maxWidth: 60,
//         defaultWidth: 15
//     }
// });
// await exporter.export(designData, resultData);

// 方式3: 使用静态方法快速导出
// await ExcelExporter.quickExport(designData, resultData, {
//     fileName: '快速导出',
//     headerStyle: {
//         backgroundColor: 'FF2196F3'   // 蓝色表头
//     },
//     bodyStyle: {
//         alternateRowColor: true        // 斑马纹
//     }
// });
