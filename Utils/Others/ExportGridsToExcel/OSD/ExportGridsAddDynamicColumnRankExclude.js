class ExcelExporter {
  constructor(options = {}) {
    // 文件名配置
    this.fileName = options.fileName || "数据信息";

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

    // 动态表格字段配置（用于生成动态列）
    this.tableConfigs = options.tableConfigs || [];

    // 行背景色配置（支持动态配置）
    const defaultColorMap = {
      2: "FFB3DAFF", // 浅蓝色
      1: "FFFFF0B3", // 浅黄色
      3: "FFD9FFCC", // 浅绿色
    };
    this.rowBackgroundConfig = {
      fieldName: options.rowBackgroundConfig?.fieldName || "log_type",
      colorMap: options.rowBackgroundConfig?.colorMap || defaultColorMap,
    };

    // 单元格标记配置（支持动态配置）
    this.markCellConfig = {
      fieldName: options.markCellConfig?.fieldName || "marks",
      alternateFieldName: options.markCellConfig?.alternateFieldName || "Marks",
      markColor: options.markCellConfig?.markColor || "FFFF4D4F", // 红色
    };

    // ========== 排序配置 ==========
    this.sortConfig = {
      enabled: options.sortConfig?.enabled !== false, // 默认启用
      idField: options.sortConfig?.idField || "s_tree_id",
      pidField: options.sortConfig?.pidField || "s_tree_pid",
      sortField: options.sortConfig?.sortField || "s_tree_no",
    };

    // ExcelJS 实例
    this.ExcelJS = null;
    this.workbook = null;

    const defaultBlacklist = [
      "s_tree_pid",
      "s_tree_id",
      "phid_pc",
      "children",
      "key",
      "id",
      "phid",
      "desc",
      "projectName",
    ];

    // 合并默认黑名单和传入的黑名单（去重）
    this.blacklist = options.blacklist
      ? [...new Set([...defaultBlacklist, ...options.blacklist])]
      : defaultBlacklist;
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

  // ==================== 排序工具方法（静态） ====================

  /**
   * 中文数字映射表
   */
  static CHINESE_NUM_MAP = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    壹: 1,
    贰: 2,
    叁: 3,
    肆: 4,
    伍: 5,
    陆: 6,
    柒: 7,
    捌: 8,
    玖: 9,
    拾: 10,
    〇: 0,
  };

  /**
   * 中文单位映射
   */
  static CHINESE_UNIT_MAP = {
    十: 10,
    百: 100,
    千: 1000,
    万: 10000,
    亿: 100000000,
  };

  /**
   * 将中文数字转换为阿拉伯数字
   */
  static chineseToNumber(chineseNum) {
    if (!chineseNum || typeof chineseNum !== "string") return null;

    const trimmed = chineseNum.trim();
    if (trimmed === "") return null;

    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }

    let result = 0;
    let currentNum = 0;
    let hasChineseChar = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (ExcelExporter.CHINESE_NUM_MAP.hasOwnProperty(char)) {
        hasChineseChar = true;
        currentNum = ExcelExporter.CHINESE_NUM_MAP[char];
      } else if (ExcelExporter.CHINESE_UNIT_MAP.hasOwnProperty(char)) {
        hasChineseChar = true;
        const unit = ExcelExporter.CHINESE_UNIT_MAP[char];
        if (currentNum === 0) {
          currentNum = 1;
        }
        if (unit >= 10) {
          if (result === 0) {
            result = currentNum * unit;
          } else {
            result += currentNum * unit;
          }
          currentNum = 0;
        }
      } else {
        if (hasChineseChar) {
          break;
        }
      }
    }

    result += currentNum;
    return hasChineseChar ? result : null;
  }

  /**
   * 解析排序键中的单个段
   */
  static parseSegment(segment) {
    if (!segment || segment === "") {
      return { type: "number", value: 0 };
    }

    const trimmed = segment.trim();

    if (/^\d+$/.test(trimmed)) {
      return { type: "number", value: parseInt(trimmed, 10) };
    }

    const chineseResult = ExcelExporter.chineseToNumber(trimmed);
    if (chineseResult !== null) {
      return { type: "number", value: chineseResult };
    }

    return { type: "string", value: trimmed };
  }

  /**
   * 解析 s_tree_no 为可排序的数组
   */
  static parseTreeNo(treeNo) {
    if (treeNo === null || treeNo === undefined) return [];

    const str = String(treeNo).trim();
    if (str === "") return [];

    let segments = [];

    if (str.includes(".")) {
      segments = str.split(".");
    } else if (str.includes("-")) {
      segments = str.split("-");
    } else if (str.includes("、")) {
      segments = str.split("、");
    } else if (str.includes("/")) {
      segments = str.split("/");
    } else {
      segments = [str];
    }

    return segments.map((seg) => ExcelExporter.parseSegment(seg));
  }

  /**
   * 比较两个排序键
   */
  static compareSortKeys(keyA, keyB) {
    const maxLen = Math.max(keyA.length, keyB.length);

    for (let i = 0; i < maxLen; i++) {
      if (i >= keyA.length) return -1;
      if (i >= keyB.length) return 1;

      const segA = keyA[i];
      const segB = keyB[i];

      if (segA.type !== segB.type) {
        return segA.type === "number" ? -1 : 1;
      }

      if (segA.type === "number") {
        if (segA.value !== segB.value) {
          return segA.value - segB.value;
        }
      } else {
        const cmp = segA.value.localeCompare(segB.value, "zh-CN");
        if (cmp !== 0) return cmp;
      }
    }

    return 0;
  }

  /**
   * 构建树形结构并排序
   */
  static sortTreeData(data, idField, pidField, sortField) {
    if (!Array.isArray(data) || data.length === 0) return data;

    const dataCopy = [...data];
    const nodeMap = new Map();

    for (const item of dataCopy) {
      const id = item[idField];
      const pid = item[pidField];
      const sortValue = item[sortField];
      const sortKey = ExcelExporter.parseTreeNo(sortValue);

      nodeMap.set(id, {
        data: item,
        id: id,
        pid: pid,
        sortKey: sortKey,
        children: [],
      });
    }

    const roots = [];
    const orphanNodes = [];

    for (const [id, node] of nodeMap) {
      const pid = node.pid;

      if (
        pid === null ||
        pid === undefined ||
        pid === 0 ||
        pid === "0" ||
        pid === ""
      ) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(pid);
        if (parent) {
          parent.children.push(node);
        } else {
          orphanNodes.push(node);
        }
      }
    }

    if (roots.length === 0 && orphanNodes.length > 0) {
      roots.push(...orphanNodes);
    } else if (orphanNodes.length > 0) {
      roots.push(...orphanNodes);
    }

    const sortNodes = (nodes) => {
      nodes.sort((a, b) => ExcelExporter.compareSortKeys(a.sortKey, b.sortKey));
      for (const node of nodes) {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      }
    };

    sortNodes(roots);

    const flattenTree = (nodes, result = []) => {
      for (const node of nodes) {
        result.push(node.data);
        if (node.children.length > 0) {
          flattenTree(node.children, result);
        }
      }
      return result;
    };

    return flattenTree(roots);
  }

  /**
   * 对数据进行排序（实例方法）
   */
  _sortData(rowsData) {
    if (!this.sortConfig.enabled) {
      console.log("[排序] 排序已禁用，保持原始数据顺序");
      return rowsData;
    }

    if (!Array.isArray(rowsData) || rowsData.length === 0) {
      return rowsData;
    }

    const firstRow = rowsData[0];
    const hasPidField =
      firstRow && firstRow.hasOwnProperty(this.sortConfig.pidField);
    const hasSortField =
      firstRow && firstRow.hasOwnProperty(this.sortConfig.sortField);
    const hasIdField =
      firstRow && firstRow.hasOwnProperty(this.sortConfig.idField);

    if (!hasPidField && !hasSortField) {
      console.log(
        `[排序] 数据中未找到排序字段 (${this.sortConfig.pidField}, ${this.sortConfig.sortField})，跳过排序`,
      );
      return rowsData;
    }

    console.log(`[排序] 开始树形排序，数据行数: ${rowsData.length}`);

    if (!hasIdField) {
      console.log("[排序] 未找到ID字段，使用简单排序");
      return this._simpleSort(rowsData);
    }

    const sorted = ExcelExporter.sortTreeData(
      rowsData,
      this.sortConfig.idField,
      this.sortConfig.pidField,
      this.sortConfig.sortField,
    );

    if (sorted.length > 0) {
      console.log(
        `[排序] 排序完成，前3条记录:`,
        sorted.slice(0, 3).map((row) => ({
          [this.sortConfig.idField]: row[this.sortConfig.idField],
          [this.sortConfig.pidField]: row[this.sortConfig.pidField],
          [this.sortConfig.sortField]: row[this.sortConfig.sortField],
        })),
      );
    }

    return sorted;
  }

  /**
   * 简单排序（不构建树结构）
   */
  _simpleSort(rowsData) {
    const dataCopy = [...rowsData];
    const sortField = this.sortConfig.sortField;
    const pidField = this.sortConfig.pidField;

    dataCopy.sort((a, b) => {
      const aPid = a[pidField];
      const bPid = b[pidField];
      const aIsRoot = !aPid || aPid === 0 || aPid === "0" || aPid === "";
      const bIsRoot = !bPid || bPid === 0 || bPid === "0" || bPid === "";

      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;

      const keyA = ExcelExporter.parseTreeNo(a[sortField]);
      const keyB = ExcelExporter.parseTreeNo(b[sortField]);
      return ExcelExporter.compareSortKeys(keyA, keyB);
    });

    return dataCopy;
  }

  // ==================== 原有方法 ====================

  /**
   * 递归过滤列配置（剔除隐藏列和指定字段）
   */
  filterColumns(columns) {
    return columns.reduce((acc, col) => {
      if (col.hidden === true) return acc;
      if (col.dataIndex && !col.columns) {
        if (this.blacklist.includes(col.dataIndex)) return acc;
        acc.push({ ...col });
        return acc;
      }
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
   */
  buildHeaderMatrix(tree) {
    if (!tree || tree.length === 0) return [];

    if (this.mode === "standard") {
      for (const root of tree) {
        this.computeNodeDepth(root);
      }
    }

    const maxDepth = Math.max(
      ...tree.map((root) => {
        if (this.mode === "standard") return root.depth;
        return (function getMaxDepth(node) {
          if (!node.columns || node.columns.length === 0) return 1;
          return 1 + Math.max(...node.columns.map(getMaxDepth));
        })(root);
      }),
    );

    const totalCols = tree.reduce(
      (sum, node) => sum + this.countLeaves(node),
      0,
    );

    const matrix = Array(maxDepth)
      .fill()
      .map(() => Array(totalCols).fill(null));

    let startCol = 0;

    const fillNode = (node, row, col) => {
      const colspan = this.countLeaves(node);
      const hasChildren = node.columns && node.columns.length > 0;

      let rowspan;
      if (this.mode === "standard") {
        rowspan = node.depth;
      } else {
        if (hasChildren) {
          rowspan = 1;
        } else {
          rowspan = maxDepth - row;
        }
      }

      const title = this.getNodeTitle(node);

      matrix[row][col] = {
        value: title,
        rowspan: rowspan,
        colspan: colspan,
      };

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
          precision: node.precision,
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
   * 解析 marks 数据（支持 JSON 和 Python 格式）
   */
  _parseMarks(marksData) {
    if (!marksData) return [];
    if (Array.isArray(marksData)) return marksData;

    if (typeof marksData === "string") {
      const trimmed = marksData.trim();
      if (trimmed === "") return [];

      try {
        return JSON.parse(trimmed);
      } catch (e) {
        try {
          const jsonStr = trimmed.replace(/'/g, '"');
          return JSON.parse(jsonStr);
        } catch (e2) {
          console.error("解析 marks 失败:", marksData, e2);
          return [];
        }
      }
    }
    return [];
  }

  /**
   * 检查字段是否在标记数组中（支持动态配置）
   */
  _isFieldMarked(rowData, fieldName) {
    if (!rowData || !fieldName) return false;

    const marksRaw =
      rowData[this.markCellConfig.fieldName] ||
      rowData[this.markCellConfig.alternateFieldName];
    const marks = this._parseMarks(marksRaw);
    return Array.isArray(marks) && marks.includes(fieldName);
  }

  /**
   * 判断是否为数值类型（用于确定对齐方式）
   */
  _isNumeric(value) {
    return typeof value === "number";
  }

  /**
   * 根据字段名判断对齐方式
   */
  _getAlignment(fieldName, value) {
    const numericSuffixes = [
      "_amt",
      "_price",
      "_qty",
      "_num",
      "_rate",
      "_ratio",
      "_total",
      "_sum",
      "_amount",
      "total",
      "amt",
      "price",
    ];
    if (fieldName) {
      const lowerName = fieldName.toLowerCase();
      for (const suffix of numericSuffixes) {
        if (lowerName.endsWith(suffix) || lowerName === suffix) {
          return "right";
        }
      }
    }

    if (typeof value === "number") {
      return "right";
    }

    return "left";
  }

  /**
   * 获取表体单元格样式
   */
  getBodyCellStyle(rowIndex, rowData = null, fieldName = null, value = null) {
    let backgroundColor = this.bodyStyle.backgroundColor;

    const bgFieldName = this.rowBackgroundConfig.fieldName;
    if (
      rowData &&
      rowData[bgFieldName] !== undefined &&
      rowData[bgFieldName] !== null
    ) {
      const bgValue = rowData[bgFieldName];
      if (this.rowBackgroundConfig.colorMap[bgValue]) {
        backgroundColor = this.rowBackgroundConfig.colorMap[bgValue];
      }
    }

    if (
      backgroundColor === this.bodyStyle.backgroundColor &&
      this.bodyStyle.alternateRowColor &&
      rowIndex % 2 === 1
    ) {
      backgroundColor = this.bodyStyle.alternateBackgroundColor;
    }

    let fontColor = this.bodyStyle.fontColor;
    if (rowData && fieldName && this._isFieldMarked(rowData, fieldName)) {
      fontColor = this.markCellConfig.markColor;
    }

    const alignment = this._getAlignment(fieldName, value);

    return {
      font: {
        size: this.bodyStyle.fontSize,
        color: { argb: fontColor },
      },
      alignment: { horizontal: alignment, vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: backgroundColor },
      },
      border: this.getBorder(),
    };
  }

  /**
   * 格式化数值（根据精度）
   */
  formatNumber(value, precision) {
    if (typeof value !== "number") return value;
    if (Math.abs(value) < 0.01 && value !== 0) {
      return value.toFixed(4);
    }
    if (Number.isInteger(value)) {
      return value;
    }
    return value.toFixed(precision || 2);
  }

  /**
   * 计算并设置列宽（智能自适应）
   */
  autoFitColumns(worksheet, leaves, rowsData, headerMatrix) {
    const columnCount = leaves.length;
    const columnContents = Array(columnCount)
      .fill()
      .map(() => []);

    for (let i = 0; i < headerMatrix.length; i++) {
      const row = headerMatrix[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell && cell.value) {
          const colspan = cell.colspan || 1;
          for (let k = 0; k < colspan; k++) {
            if (j + k < columnCount) {
              columnContents[j + k].push(cell.value);
            }
          }
        }
      }
    }

    for (const row of rowsData) {
      for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let value = row[leaf.dataIndex];
        if (value !== undefined && value !== null) {
          if (typeof value === "number") {
            value = this.formatNumber(value, leaf.precision);
          }
          columnContents[idx].push(value.toString());
        }
      }
    }

    for (let idx = 0; idx < columnCount; idx++) {
      let maxLength = 0;

      const configWidth = leaves[idx].width;
      if (configWidth && typeof configWidth === "number") {
        maxLength = Math.max(maxLength, configWidth);
      }

      for (const content of columnContents[idx]) {
        if (content) {
          let contentLength = 0;
          for (let i = 0; i < content.length; i++) {
            const charCode = content.charCodeAt(i);
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

      let columnWidth = Math.min(
        Math.max(maxLength + 2, this.columnConfig.minWidth),
        this.columnConfig.maxWidth,
      );

      if (configWidth && configWidth > columnWidth) {
        columnWidth = Math.min(configWidth, this.columnConfig.maxWidth);
      }

      const column = worksheet.getColumn(idx + 1);
      column.width = columnWidth;
    }
  }

  /**
   * 创建工作表（内部会对数据进行排序）
   */
  createWorksheet(sheetName, filteredTree, rowsData) {
    // ========== 对数据进行排序 ==========
    const sortedData = this._sortData(rowsData);

    const headerMatrix = this.buildHeaderMatrix(filteredTree);
    const leaves = this.flattenLeaves(filteredTree);

    console.log(`${sheetName} 叶子列数量: ${leaves.length}`);

    const worksheet = this.workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });

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

    for (const merge of mergeList) {
      try {
        worksheet.mergeCells(
          merge.startRow,
          merge.startCol,
          merge.endRow,
          merge.endCol,
        );
      } catch (e) {
        console.warn(`合并失败:`, e.message);
      }
    }

    // 写入数据行（使用排序后的数据）
    for (let rowIndex = 0; rowIndex < sortedData.length; rowIndex++) {
      const row = sortedData[rowIndex];
      const dataRow = worksheet.addRow([]);
      dataRow.height = 20;

      for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let value = row[leaf.dataIndex];
        const originalValue = value;

        if (typeof value === "number") {
          value = this.formatNumber(value, leaf.precision);
        } else if (value === undefined || value === null) {
          value = "";
        }

        const cell = dataRow.getCell(idx + 1);
        cell.value = value;

        const bodyStyle = this.getBodyCellStyle(
          rowIndex,
          row,
          leaf.dataIndex,
          originalValue,
        );
        Object.assign(cell, bodyStyle);
      }
    }

    this.autoFitColumns(worksheet, leaves, sortedData, headerMatrix);

    return worksheet;
  }

  /**
   * 获取表格数据（兼容不同结构）
   */
  getTableData(resultData, tableKey) {
    if (!resultData) return [];
    if (Array.isArray(resultData[tableKey])) {
      return resultData[tableKey];
    }
    if (
      resultData.data &&
      resultData.data.uiContent &&
      resultData.data.uiContent.grid
    ) {
      const grid = resultData.data.uiContent.grid[tableKey];
      if (grid && Array.isArray(grid.data)) {
        return grid.data;
      }
      if (grid && Array.isArray(grid)) {
        return grid;
      }
    }
    if (resultData.uiContent && resultData.uiContent.grid) {
      const grid = resultData.uiContent.grid[tableKey];
      if (grid && Array.isArray(grid.data)) {
        return grid.data;
      }
      if (grid && Array.isArray(grid)) {
        return grid;
      }
    }
    console.warn(`无法获取表 ${tableKey} 的数据`);
    return [];
  }

  /**
   * 从数据中提取动态分组信息
   */
  extractDynamicGroups(rowsData) {
    if (!rowsData || rowsData.length === 0)
      return { groupCount: 0, dynamicFieldMap: new Map() };
    const pattern = /^([a-zA-Z_]+)-(\d+)$/;
    const dynamicFieldMap = new Map();
    let maxGroup = 0;

    for (const row of rowsData) {
      for (const key in row) {
        if (this.blacklist.includes(key)) continue;
        const match = key.match(pattern);
        if (match) {
          const baseName = match[1];
          const groupNum = parseInt(match[2], 10);
          maxGroup = Math.max(maxGroup, groupNum);

          if (!dynamicFieldMap.has(baseName)) {
            dynamicFieldMap.set(baseName, new Map());
          }
          const groupMap = dynamicFieldMap.get(baseName);
          if (!groupMap.has(groupNum)) {
            groupMap.set(groupNum, new Set());
          }
          groupMap.get(groupNum).add(key);
        }
      }
    }

    const processedMap = new Map();
    for (const [baseName, groupMap] of dynamicFieldMap.entries()) {
      const newGroupMap = new Map();
      for (const [groupNum, fieldSet] of groupMap.entries()) {
        newGroupMap.set(
          groupNum,
          Array.from(fieldSet).map((fieldName) => ({ fieldName, baseName })),
        );
      }
      processedMap.set(baseName, newGroupMap);
    }

    return { groupCount: maxGroup, dynamicFieldMap: processedMap };
  }

  /**
   * 构建动态分组列树
   */
  buildDynamicColumns(dynamicInfo) {
    const { groupCount, dynamicFieldMap, tableConfig } = dynamicInfo;
    if (groupCount === 0 || dynamicFieldMap.size === 0) return [];

    const dynamicBaseFields =
      tableConfig?.baseFields?.filter(
        (f) => f.groupIn && f.groupIn.length > 0,
      ) || [];

    const groups = new Map();
    for (let i = 1; i <= groupCount; i++) {
      groups.set(i, { groupName: `项目${i}`, fields: [] });
    }

    for (const [baseName, groupMap] of dynamicFieldMap.entries()) {
      const configField = dynamicBaseFields.find(
        (f) => f.baseName === baseName,
      );
      const label = configField?.label || this.getFieldDisplayName(baseName);
      const precision = configField?.precision || 2;
      const groupIn = configField?.groupIn || [];

      for (const [groupNum, fields] of groupMap.entries()) {
        const group = groups.get(groupNum);
        if (group) {
          const subGroup = groupIn.length > 1 ? groupIn[1] : null;
          for (const f of fields) {
            group.fields.push({
              dataIndex: f.fieldName,
              header: label,
              title: label,
              width: this.columnConfig.defaultWidth,
              precision: precision,
              subGroup: subGroup,
            });
          }
        }
      }
    }

    const dynamicColumns = [];
    const hasSubGroup = Array.from(groups.values()).some((g) =>
      g.fields.some((f) => f.subGroup),
    );
    if (hasSubGroup) {
      for (const [groupNum, group] of groups.entries()) {
        const subGroupMap = new Map();
        for (const field of group.fields) {
          const sub = field.subGroup || "其他";
          if (!subGroupMap.has(sub)) subGroupMap.set(sub, []);
          subGroupMap.get(sub).push({
            dataIndex: field.dataIndex,
            header: field.header,
            title: field.header,
            width: field.width,
            precision: field.precision,
          });
        }
        const subColumns = [];
        for (const [subName, subFields] of subGroupMap.entries()) {
          subColumns.push({
            header: subName,
            title: subName,
            columns: subFields,
          });
        }
        dynamicColumns.push({
          header: group.groupName,
          title: group.groupName,
          columns: subColumns,
        });
      }
    } else {
      for (const [groupNum, group] of groups.entries()) {
        if (group.fields.length === 0) continue;
        dynamicColumns.push({
          header: group.groupName,
          title: group.groupName,
          columns: group.fields.map((f) => ({
            dataIndex: f.dataIndex,
            header: f.header,
            title: f.header,
            width: f.width,
            precision: f.precision,
          })),
        });
      }
    }
    return dynamicColumns;
  }

  /**
   * 获取字段的显示名称
   */
  getFieldDisplayName(fieldName) {
    const nameMap = {
      s_tree_no: "序号",
      s_tree_name: "工程或费用名称",
      unit: "计量单位",
      equipment_amt: "设备购置费",
      build_amt: "建安工程费",
      other_amt: "其他费用",
      total_amt: "合计",
      radio: "占总投资比例",
      num: "单位千瓦含量",
      equip_d: "设备费",
      bild_d: "安装费",
      materail_d: "装置性材料费",
      equip_t: "设备费",
      build_t: "安装费",
      meterail_t: "装置性材料费",
      amt: "单价",
      totle_amt: "合价",
      radio_num: "费率（%）/数量",
      basic_amt: "计算基数（万元）/单价（元）",
      total: "合价（万元）",
      u_unit_mw_price: "单位兆瓦造价",
      u_file_name: "文件名称",
      u_pro_name: "项目名称",
      u_pro_short: "项目简称",
      equip_type: "规格型号",
    };
    const cleanName = fieldName.replace(/-\d+$/, "");
    return nameMap[cleanName] || cleanName;
  }

  /**
   * 导出 Excel 文件
   * @param {Object} designData 设计数据
   * @param {Object} resultData 结果数据
   * @param {string} customFileName 自定义文件名（可选）
   * @param {Object} sortOptions 排序选项（可选，覆盖构造函数中的排序配置）
   */
  async export(
    designData,
    resultData,
    customFileName = null,
    sortOptions = null,
  ) {
    console.log("开始导出 Excel...", { mode: this.mode });

    // 如果传入了 sortOptions，临时覆盖排序配置
    if (sortOptions) {
      if (sortOptions.enabled !== undefined) {
        this.sortConfig.enabled = sortOptions.enabled;
      }
      if (sortOptions.idField) {
        this.sortConfig.idField = sortOptions.idField;
      }
      if (sortOptions.pidField) {
        this.sortConfig.pidField = sortOptions.pidField;
      }
      if (sortOptions.sortField) {
        this.sortConfig.sortField = sortOptions.sortField;
      }
      console.log("[排序] 使用传入的排序配置:", this.sortConfig);
    }

    try {
      await this.init();

      const configData = designData.data || designData;
      const busTableChnMap = configData.publicProperty?.busTableChnMap || {};
      let fileName = customFileName || this.fileName;
      if (!fileName.endsWith(".xlsx")) fileName += ".xlsx";
      console.log("导出文件名:", fileName);

      const detailTables = Object.keys(busTableChnMap)
        .filter((key) => /_d\d+$/.test(key))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+$/)[0], 10);
          const numB = parseInt(b.match(/\d+$/)[0], 10);
          return numA - numB;
        });

      if (detailTables.length === 0) throw new Error("未找到明细表配置");

      let sheetCreated = false;

      for (const tableKey of detailTables) {
        const sheetName = busTableChnMap[tableKey] || tableKey;
        const rowsData = this.getTableData(resultData, tableKey);
        if (!rowsData.length) {
          console.warn(`${tableKey} 无数据，跳过`);
          continue;
        }

        console.log(
          `\n========== 处理表 ${tableKey}，Sheet名称: ${sheetName} ==========`,
        );

        const rawColumns =
          configData.uiContent?.grid?.[tableKey]?.columns || [];
        const baseColumnsTree = this.filterColumns(rawColumns);

        const { groupCount, dynamicFieldMap } =
          this.extractDynamicGroups(rowsData);
        console.log(`${tableKey} 动态分组数量: ${groupCount}`);

        const tableConfig = this.tableConfigs.find(
          (cfg) => cfg.tableId === tableKey,
        );
        const dynamicColumnsTree = this.buildDynamicColumns({
          groupCount,
          dynamicFieldMap,
          tableConfig,
        });

        const finalColumnsTree = [...baseColumnsTree, ...dynamicColumnsTree];

        if (finalColumnsTree.length === 0) {
          console.warn(`${tableKey} 合并后无有效列，跳过`);
          continue;
        }

        // createWorksheet 内部会对数据进行排序
        this.createWorksheet(sheetName, finalColumnsTree, rowsData);
        sheetCreated = true;
        console.log(`${tableKey} Sheet 创建完成`);
      }

      if (!sheetCreated)
        throw new Error("没有成功创建任何工作表，请检查数据源");

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
    } catch (error) {
      console.error("导出失败:", error);
      throw error;
    }
  }
}

if (typeof window !== "undefined") {
  window.ExcelExporter = ExcelExporter;
}
