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
      numericWidth: options.columnConfig?.numericWidth || 13.5, // 数值类型列默认宽度
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
   * 解析排序键为可排序的数组
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

    const hasSortField = data.some(
      (item) =>
        item.hasOwnProperty(sortField) &&
        item[sortField] !== undefined &&
        item[sortField] !== null,
    );
    if (!hasSortField) {
      console.log(
        `[排序] 数据中未找到有效的排序字段 "${sortField}"，使用默认顺序`,
      );
      return data;
    }

    const dataCopy = [...data];
    const nodeMap = new Map();

    for (const item of dataCopy) {
      const id = item[idField];
      const pid = item[pidField];
      const sortValue = item[sortField];
      const sortKey =
        sortValue && sortValue !== ""
          ? ExcelExporter.parseTreeNo(sortValue)
          : [];

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
      nodes.sort((a, b) => {
        if (a.sortKey.length > 0 && b.sortKey.length > 0) {
          return ExcelExporter.compareSortKeys(a.sortKey, b.sortKey);
        }
        if (a.sortKey.length > 0) return -1;
        if (b.sortKey.length > 0) return 1;
        return 0;
      });
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
    const hasSortField =
      firstRow && firstRow.hasOwnProperty(this.sortConfig.sortField);

    if (!hasSortField) {
      console.log(
        `[排序] 数据中未找到排序字段 "${this.sortConfig.sortField}"，使用默认顺序`,
      );
      return rowsData;
    }

    const hasValidSortValue = rowsData.some((row) => {
      const val = row[this.sortConfig.sortField];
      return val !== undefined && val !== null && val !== "";
    });

    if (!hasValidSortValue) {
      console.log(
        `[排序] 排序字段 "${this.sortConfig.sortField}" 无有效值，使用默认顺序`,
      );
      return rowsData;
    }

    const hasPidField =
      firstRow && firstRow.hasOwnProperty(this.sortConfig.pidField);
    const hasIdField =
      firstRow && firstRow.hasOwnProperty(this.sortConfig.idField);

    console.log(`[排序] 开始树形排序，数据行数: ${rowsData.length}`);

    if (!hasIdField || !hasPidField) {
      console.log("[排序] 未找到完整的树形结构字段，使用简单排序");
      return this._simpleSort(rowsData);
    }

    const sorted = ExcelExporter.sortTreeData(
      rowsData,
      this.sortConfig.idField,
      this.sortConfig.pidField,
      this.sortConfig.sortField,
    );

    return sorted;
  }

  /**
   * 简单排序（不构建树结构）
   */
  _simpleSort(rowsData) {
    const dataCopy = [...rowsData];
    const sortField = this.sortConfig.sortField;
    const pidField = this.sortConfig.pidField;

    const hasValidSortValue = dataCopy.some((row) => {
      const val = row[sortField];
      return val !== undefined && val !== null && val !== "";
    });

    if (!hasValidSortValue) {
      console.log("[排序] 排序字段无有效值，使用默认顺序");
      return dataCopy;
    }

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
   * 检查字段是否在黑名单中
   */
  _isFieldInBlacklist(fieldName) {
    if (!fieldName) return false;
    // 直接检查
    if (this.blacklist.includes(fieldName)) return true;
    // 检查基础字段名（去除动态后缀）
    const baseFieldName = fieldName.replace(/-\d+$/, "");
    if (this.blacklist.includes(baseFieldName)) return true;
    return false;
  }

  /**
   * 递归过滤列配置（剔除隐藏列和指定字段）
   */
  filterColumns(columns) {
    return columns.reduce((acc, col) => {
      if (col.hidden === true) return acc;

      // 如果有 dataIndex，检查是否在黑名单中
      if (col.dataIndex) {
        if (this._isFieldInBlacklist(col.dataIndex)) {
          return acc;
        }
        acc.push({ ...col });
        return acc;
      }

      // 如果有子列，递归处理
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
        // 再次检查黑名单
        if (this._isFieldInBlacklist(node.dataIndex)) {
          continue;
        }

        // 判断是否为数值类型字段，如果是则使用数值类型宽度
        let width = node.width || this.columnConfig.defaultWidth;
        if (this._isNumericField(node.dataIndex)) {
          // 如果配置了数值宽度，使用配置值，否则使用默认数值宽度
          const numericWidth = this.columnConfig.numericWidth || 13.5;
          // 如果节点自己配置了宽度且大于数值宽度，使用节点配置的宽度
          if (
            node.width &&
            typeof node.width === "number" &&
            node.width > numericWidth
          ) {
            width = node.width;
          } else {
            width = numericWidth;
          }
        }

        result.push({
          dataIndex: node.dataIndex,
          header: this.getNodeTitle(node),
          width: width,
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
      // 去掉动态后缀（如 equipment_amt-1 → equipment_amt），再匹配
      const baseName = fieldName.replace(/-\d+$/, "").toLowerCase();
      for (const suffix of numericSuffixes) {
        if (baseName.endsWith(suffix) || baseName === suffix) {
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
   * 判断字段是否为数值类型（用于列宽判断）
   */
  _isNumericField(fieldName) {
    if (!fieldName) return false;

    // 扩展数值类型后缀列表
    const numericSuffixes = [
      "_amt", // 金额
      "_price", // 价格
      "_qty", // 数量
      "_num", // 数量/数字
      "_rate", // 比率
      "_ratio", // 比率
      "_total", // 合计
      "_sum", // 求和
      "_amount", // 金额
      "_cost", // 成本
      "_fee", // 费用
      "_money", // 货币
      "total", // 合计
      "amt", // 金额
      "price", // 价格
      "num", // 数量
      "rate", // 比率
      "ratio", // 比率
      "radio", // 比率（您的数据中使用的）
      "equipment_amt", // 设备费
      "build_amt", // 建安工程费
      "other_amt", // 其他费用
      "total_amt", // 合计
      "equip_d", // 设备费
      "bild_d", // 安装费
      "materail_d", // 装置性材料费
      "equip_t", // 设备费
      "build_t", // 安装费
      "meterail_t", // 装置性材料费
      "totle_amt", // 合价
      "basic_amt", // 计算基数
      "u_unit_mw_price", // 单位兆瓦造价
    ];

    // 去掉动态后缀（如 equipment_amt-1 → equipment_amt），再匹配
    const baseName = fieldName.replace(/-\d+$/, "").toLowerCase();
    // 先检查完全匹配
    if (numericSuffixes.includes(baseName)) {
      return true;
    }
    // 再检查后缀匹配
    for (const suffix of numericSuffixes) {
      if (baseName.endsWith(suffix)) {
        return true;
      }
    }
    return false;
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
      const fieldName = leaves[idx].dataIndex;
      const configWidth = leaves[idx].width;

      // 数值类型字段：直接使用 numericWidth，不参与 auto-fit
      if (this._isNumericField(fieldName)) {
        const numericWidth = this.columnConfig.numericWidth || 13.5;
        let columnWidth = numericWidth;
        // 如果字段单独配置了更大的宽度，使用配置宽度
        if (
          configWidth &&
          typeof configWidth === "number" &&
          configWidth > columnWidth
        ) {
          columnWidth = configWidth;
        }
        columnWidth = Math.min(columnWidth, this.columnConfig.maxWidth);
        const column = worksheet.getColumn(idx + 1);
        column.width = columnWidth;
        continue;
      }

      // 非数值字段：原有的 auto-fit 逻辑
      let maxLength = 0;

      // 获取配置的宽度作为下限
      if (configWidth && typeof configWidth === "number") {
        maxLength = Math.max(maxLength, configWidth);
      }

      // 计算内容最大宽度
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

      // 计算最终列宽
      let columnWidth = Math.min(
        Math.max(maxLength + 2, this.columnConfig.minWidth),
        this.columnConfig.maxWidth,
      );

      // 如果配置了宽度且大于当前计算值，使用配置宽度
      if (
        configWidth &&
        typeof configWidth === "number" &&
        configWidth > columnWidth
      ) {
        columnWidth = Math.min(configWidth, this.columnConfig.maxWidth);
      }

      // 设置列宽
      const column = worksheet.getColumn(idx + 1);
      column.width = columnWidth;
    }
  }

  /**
   * 提取分组项目的名称映射（从横向对比数据中）
   * 注意：静态列已经占用了第一个项目（索引0），
   * 所以动态列后缀 -1 对应数组索引1，后缀 -2 对应数组索引2，以此类推
   */
  extractGroupNamesFromHorizontalData(resultData) {
    const groupNames = new Map();

    console.log("========== 开始提取项目名称 ==========");

    // 获取横向对比数据 - 尝试多种路径
    let horizontalData = null;

    // 方式1: 直接在 resultData 中
    if (
      resultData?.inv_horizontal_d5 &&
      Array.isArray(resultData.inv_horizontal_d5)
    ) {
      horizontalData = resultData.inv_horizontal_d5;
      console.log("方式1成功: resultData.inv_horizontal_d5");
    }
    // 方式2: 在 resultData.data 中
    else if (
      resultData?.data?.inv_horizontal_d5 &&
      Array.isArray(resultData.data.inv_horizontal_d5)
    ) {
      horizontalData = resultData.data.inv_horizontal_d5;
      console.log("方式2成功: resultData.data.inv_horizontal_d5");
    }
    // 方式3: 在 resultData.data.uiContent.grid 中（你的数据路径）
    else if (
      resultData?.data?.uiContent?.grid?.inv_horizontal_d5 &&
      Array.isArray(resultData.data.uiContent.grid.inv_horizontal_d5)
    ) {
      horizontalData = resultData.data.uiContent.grid.inv_horizontal_d5;
      console.log(
        "方式3成功: resultData.data.uiContent.grid.inv_horizontal_d5",
      );
    }
    // 方式4: 在 resultData.uiContent.grid 中
    else if (
      resultData?.uiContent?.grid?.inv_horizontal_d5 &&
      Array.isArray(resultData.uiContent.grid.inv_horizontal_d5)
    ) {
      horizontalData = resultData.uiContent.grid.inv_horizontal_d5;
      console.log("方式4成功: resultData.uiContent.grid.inv_horizontal_d5");
    }
    // 方式5: 遍历查找
    else if (resultData && typeof resultData === "object") {
      const findHorizontalData = (obj, depth = 0) => {
        if (depth > 3) return null;
        if (!obj || typeof obj !== "object") return null;

        for (const key in obj) {
          if (key === "inv_horizontal_d5" && Array.isArray(obj[key])) {
            return obj[key];
          }
          if (obj[key] && typeof obj[key] === "object") {
            const found = findHorizontalData(obj[key], depth + 1);
            if (found) return found;
          }
        }
        return null;
      };
      horizontalData = findHorizontalData(resultData);
      if (horizontalData) {
        console.log("方式5成功: 递归查找到 inv_horizontal_d5");
      }
    }

    if (horizontalData && horizontalData.length > 1) {
      console.log(`找到横向对比数据，共 ${horizontalData.length} 条记录`);
      console.log(
        `静态列已使用索引0: "${
          horizontalData[0]?.u_file_name || horizontalData[0]?.fileName
        }"`,
      );

      // 关键修改：从索引1开始，对应动态列后缀 1, 2, 3...
      // 后缀-1 对应数组索引1（第二个项目）
      // 后缀-2 对应数组索引2（第三个项目）
      // 后缀-3 对应数组索引3（第四个项目）
      for (let i = 1; i < horizontalData.length; i++) {
        const groupNum = i; // 动态列后缀编号：1, 2, 3...
        const item = horizontalData[i];
        // 使用 u_file_name 字段
        let fileName = item.u_file_name || item.fileName;

        if (fileName) {
          // 提取文件名（去掉路径和扩展名）
          let projectName = fileName;
          if (fileName.includes("/")) {
            projectName = fileName.split("/").pop();
          }
          if (projectName.includes("\\")) {
            projectName = projectName.split("\\").pop();
          }
          if (projectName.endsWith(".xlsx")) {
            projectName = projectName.substring(
              0,
              projectName.lastIndexOf(".xlsx"),
            );
          } else if (projectName.endsWith(".xls")) {
            projectName = projectName.substring(
              0,
              projectName.lastIndexOf(".xls"),
            );
          }

          groupNames.set(groupNum, projectName);
          console.log(
            `✅ 映射: 动态列后缀-${groupNum} -> "${projectName}" (数组索引${i})`,
          );
        } else {
          groupNames.set(groupNum, `项目${groupNum}`);
          console.log(
            `⚠️ 映射: 动态列后缀-${groupNum} -> 项目${groupNum} (无文件名)`,
          );
        }
      }
    } else if (horizontalData && horizontalData.length === 1) {
      console.warn(`⚠️ 横向对比数据只有1条，没有动态列数据`);
      for (let i = 1; i <= 3; i++) {
        groupNames.set(i, `项目${i}`);
      }
    } else {
      console.error("❌ 未找到 inv_horizontal_d5 数据！");
      // 如果没有找到，创建默认映射
      for (let i = 1; i <= 3; i++) {
        groupNames.set(i, `项目${i}`);
      }
    }

    console.log("最终项目名称映射:", Array.from(groupNames.entries()));
    console.log("========== 项目名称提取完成 ==========");
    return groupNames;
  }

  /**
   * 从数据中提取动态分组信息
   */
  extractDynamicGroups(rowsData, resultData = null) {
    if (!rowsData || rowsData.length === 0)
      return {
        groupCount: 0,
        dynamicFieldMap: new Map(),
        groupNames: new Map(),
      };

    // 从横向对比数据中提取项目名称
    const groupNames = this.extractGroupNamesFromHorizontalData(resultData);

    // 匹配格式：字段名-数字，支持中文
    const pattern = /^([a-zA-Z_\u4e00-\u9fa5]+)-(\d+)$/;
    const dynamicFieldMap = new Map();
    let maxGroup = 0;

    for (const row of rowsData) {
      for (const key in row) {
        // 检查是否在黑名单中
        if (this._isFieldInBlacklist(key)) continue;

        const match = key.match(pattern);
        if (match) {
          const baseName = match[1];
          // 检查基础名称是否在黑名单中
          if (this._isFieldInBlacklist(baseName)) continue;

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

    // 如果没有找到动态字段，但 groupNames 有值，说明需要根据 groupNames 创建分组
    if (maxGroup === 0 && groupNames.size > 0) {
      maxGroup = groupNames.size;
    }

    console.log(
      `动态分组统计: maxGroup=${maxGroup}, groupNames大小=${groupNames.size}`,
    );

    return { groupCount: maxGroup, dynamicFieldMap: processedMap, groupNames };
  }

  /**
   * 构建动态分组列树
   */
  buildDynamicColumns(dynamicInfo) {
    const { groupCount, dynamicFieldMap, tableConfig, groupNames } =
      dynamicInfo;

    console.log(
      `构建动态列: groupCount=${groupCount}, dynamicFieldMap大小=${dynamicFieldMap.size}`,
    );
    console.log("传入的groupNames:", Array.from(groupNames.entries()));

    // 如果没有分组，返回空数组
    if (groupCount === 0) return [];

    // 如果没有动态字段，返回空数组
    if (dynamicFieldMap.size === 0) {
      console.log("没有动态字段，跳过动态列创建");
      return [];
    }

    const dynamicBaseFields =
      tableConfig?.baseFields?.filter(
        (f) => f.groupIn && f.groupIn.length > 0,
      ) || [];

    const groups = new Map();

    // 从1开始到 groupCount
    for (let i = 1; i <= groupCount; i++) {
      let groupName = groupNames.get(i);
      if (!groupName) {
        groupName = `项目${i}`;
        console.warn(`警告: 未找到项目${i}的名称，使用默认: ${groupName}`);
      }
      groups.set(i, { groupName: groupName, fields: [] });
      console.log(`创建分组 ${i}: ${groupName}`);
    }

    // 遍历动态字段，分配到对应的分组
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
            // 检查字段是否在黑名单中
            if (this._isFieldInBlacklist(f.fieldName)) continue;
            if (this._isFieldInBlacklist(baseName)) continue;

            // 判断是否为数值类型字段，如果是则使用数值类型宽度
            let width = this.columnConfig.defaultWidth;
            if (
              this._isNumericField(f.fieldName) ||
              this._isNumericField(baseName)
            ) {
              width = this.columnConfig.numericWidth || 13.5;
            }

            group.fields.push({
              dataIndex: f.fieldName,
              header: label,
              title: label,
              width: width,
              precision: precision,
              subGroup: subGroup,
            });
          }
          console.log(
            `分组${groupNum} (${group.groupName}) 添加了 ${group.fields.length} 个字段`,
          );
        } else {
          console.warn(`警告: 找不到分组 ${groupNum}`);
        }
      }
    }

    const dynamicColumns = [];
    const hasSubGroup = Array.from(groups.values()).some((g) =>
      g.fields.some((f) => f.subGroup),
    );

    if (hasSubGroup) {
      for (const [groupNum, group] of groups.entries()) {
        if (group.fields.length === 0) continue;
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

        // 过滤掉空字段
        const filteredFields = group.fields.filter(
          (f) => !this._isFieldInBlacklist(f.dataIndex),
        );
        if (filteredFields.length === 0) continue;

        dynamicColumns.push({
          header: group.groupName,
          title: group.groupName,
          columns: filteredFields.map((f) => ({
            dataIndex: f.dataIndex,
            header: f.header,
            title: f.header,
            width: f.width,
            precision: f.precision,
          })),
        });
        console.log(
          `创建动态列: ${group.groupName}, 字段数: ${filteredFields.length}`,
        );
      }
    }

    console.log(`动态列构建完成，共 ${dynamicColumns.length} 个分组`);
    console.log(
      "动态列标题:",
      dynamicColumns.map((col) => col.header),
    );
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
   * 创建工作表（内部会对数据进行排序）
   */
  createWorksheet(sheetName, filteredTree, rowsData) {
    const sortedData = this._sortData(rowsData);

    const headerMatrix = this.buildHeaderMatrix(filteredTree);
    const leaves = this.flattenLeaves(filteredTree);

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

    // 写入数据行
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
   * 导出 Excel 文件
   */
  async export(
    designData,
    resultData,
    customFileName = null,
    sortOptions = null,
  ) {
    console.log("开始导出 Excel...", { mode: this.mode });

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

        const { groupCount, dynamicFieldMap, groupNames } =
          this.extractDynamicGroups(rowsData, resultData);

        console.log(`${tableKey} 动态分组数量: ${groupCount}`);
        console.log(`项目名称映射:`, Object.fromEntries(groupNames));

        const tableConfig = this.tableConfigs.find(
          (cfg) => cfg.tableId === tableKey,
        );
        const dynamicColumnsTree = this.buildDynamicColumns({
          groupCount,
          dynamicFieldMap,
          tableConfig,
          groupNames,
        });

        const finalColumnsTree = [...baseColumnsTree, ...dynamicColumnsTree];

        if (finalColumnsTree.length === 0) {
          console.warn(`${tableKey} 合并后无有效列，跳过`);
          continue;
        }

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
