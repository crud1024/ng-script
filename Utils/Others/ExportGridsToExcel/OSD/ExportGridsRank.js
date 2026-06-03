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
   *
   * ========== 新增动态配置项 ==========
   * @param {Object} options.rowBackgroundConfig 行背景色配置
   * @param {string} options.rowBackgroundConfig.fieldName 行背景色判断字段名，默认 'log_type'
   * @param {Object} options.rowBackgroundConfig.colorMap 颜色映射表，格式如 { 1: 'FFXXXXXX', 2: 'FFXXXXXX' }
   *
   * @param {Object} options.markCellConfig 单元格标记配置（红色字体）
   * @param {string} options.markCellConfig.fieldName 标记数组字段名，默认 'marks'
   * @param {string} options.markCellConfig.alternateFieldName 备选字段名，默认 'Marks'
   * @param {string} options.markCellConfig.markColor 标记颜色，默认 'FFFF4D4F'（红色）
   *
   * ========== 新增排序配置项 ==========
   * @param {Object} options.sortConfig 排序配置
   * @param {boolean} options.sortConfig.enabled 是否启用排序，默认 true（当检测到排序字段时自动启用）
   * @param {string} options.sortConfig.idField ID字段名，默认 's_tree_id'
   * @param {string} options.sortConfig.pidField 父ID字段名，默认 's_tree_pid'
   * @param {string} options.sortConfig.sortField 排序字段名，默认 's_tree_no'
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

    // ========== 行背景色映射配置（支持动态配置） ==========
    const defaultColorMap = {
      2: "FFB3DAFF", // 浅蓝色
      1: "FFFFF0B3", // 浅黄色
      3: "FFD9FFCC", // 浅绿色
    };
    this.rowBackgroundConfig = {
      fieldName: options.rowBackgroundConfig?.fieldName || "log_type",
      colorMap: options.rowBackgroundConfig?.colorMap || defaultColorMap,
    };

    // ========== 单元格标记颜色配置（支持动态配置） ==========
    this.markCellConfig = {
      fieldName: options.markCellConfig?.fieldName || "marks",
      alternateFieldName: options.markCellConfig?.alternateFieldName || "Marks",
      markColor: options.markCellConfig?.markColor || "FFFF4D4F", // 默认红色
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

    // 黑名单字段（这些字段在导出的列中会被过滤掉，但保留在数据中用于排序）
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
   * @param {string} chineseNum 中文数字字符串
   * @returns {number|null} 转换后的数字，失败返回 null
   */
  static chineseToNumber(chineseNum) {
    if (!chineseNum || typeof chineseNum !== "string") return null;

    const trimmed = chineseNum.trim();
    if (trimmed === "") return null;

    // 处理纯数字字符串（如 "123"）
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }

    // 处理中文数字
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
        // 处理特殊情况：十一 => 11, 二十 => 20
        if (unit >= 10) {
          if (result === 0) {
            result = currentNum * unit;
          } else {
            result += currentNum * unit;
          }
          currentNum = 0;
        }
      } else {
        // 非中文字符，可能是混合字符串
        if (hasChineseChar) {
          // 如果已经处理了中文，遇到非中文就结束
          break;
        }
      }
    }

    result += currentNum;

    return hasChineseChar ? result : null;
  }

  /**
   * 解析排序键中的单个段
   * @param {string} segment 段字符串
   * @returns {Object} 解析结果 { type: 'number'|'string', value: number|string }
   */
  static parseSegment(segment) {
    if (!segment || segment === "") {
      return { type: "number", value: 0 };
    }

    // 去除前后空格
    const trimmed = segment.trim();

    // 尝试作为纯数字解析
    if (/^\d+$/.test(trimmed)) {
      // 处理前导零：01, 001 等
      const numValue = parseInt(trimmed, 10);
      return { type: "number", value: numValue };
    }

    // 尝试作为中文数字解析
    const chineseResult = ExcelExporter.chineseToNumber(trimmed);
    if (chineseResult !== null) {
      return { type: "number", value: chineseResult };
    }

    // 否则作为字符串处理
    return { type: "string", value: trimmed };
  }

  /**
   * 解析 s_tree_no 为可排序的数组
   * 支持格式：1, 2, 3 | 1.1, 1.2 | 1-1, 1-2 | 一、二、十 | 01, 02 | 01.02.03
   * @param {string|number} treeNo 排序编号
   * @returns {Array} 排序键数组，每个元素为 { type, value }
   */
  static parseTreeNo(treeNo) {
    if (treeNo === null || treeNo === undefined) return [];

    const str = String(treeNo).trim();
    if (str === "") return [];

    // 尝试多种分隔符拆分
    let segments = [];

    // 按点号分割 (1.1.1)
    if (str.includes(".")) {
      segments = str.split(".");
    }
    // 按短横线分割 (1-1-1)
    else if (str.includes("-")) {
      segments = str.split("-");
    }
    // 按顿号分割（中文数字常用：一、二、三）
    else if (str.includes("、")) {
      segments = str.split("、");
    }
    // 按斜杠分割
    else if (str.includes("/")) {
      segments = str.split("/");
    }
    // 单个值
    else {
      segments = [str];
    }

    // 解析每个段
    return segments.map((seg) => ExcelExporter.parseSegment(seg));
  }

  /**
   * 比较两个排序键
   * @param {Array} keyA 排序键A
   * @param {Array} keyB 排序键B
   * @returns {number} -1, 0, 1
   */
  static compareSortKeys(keyA, keyB) {
    const maxLen = Math.max(keyA.length, keyB.length);

    for (let i = 0; i < maxLen; i++) {
      // 如果某个键段不存在，视为 0（短的排在前面）
      if (i >= keyA.length) return -1;
      if (i >= keyB.length) return 1;

      const segA = keyA[i];
      const segB = keyB[i];

      // 类型不同时，数字优先于字符串
      if (segA.type !== segB.type) {
        return segA.type === "number" ? -1 : 1;
      }

      // 同类型比较
      if (segA.type === "number") {
        if (segA.value !== segB.value) {
          return segA.value - segB.value;
        }
      } else {
        // 字符串比较
        const cmp = segA.value.localeCompare(segB.value, "zh-CN");
        if (cmp !== 0) return cmp;
      }
    }

    return 0;
  }

  /**
   * 构建树形结构并排序
   * @param {Array} data 原始数据数组
   * @param {string} idField ID字段名
   * @param {string} pidField 父ID字段名
   * @param {string} sortField 排序字段名
   * @returns {Array} 排序后的扁平数组（保持树形顺序）
   */
  static sortTreeData(data, idField, pidField, sortField) {
    if (!Array.isArray(data) || data.length === 0) return data;

    // 创建副本避免修改原数组
    const dataCopy = [...data];

    // 构建节点映射
    const nodeMap = new Map();

    // 预处理：为每个节点计算排序键
    for (const item of dataCopy) {
      const id = item[idField];
      const pid = item[pidField];
      const sortValue = item[sortField];

      // 计算排序键
      const sortKey = ExcelExporter.parseTreeNo(sortValue);

      nodeMap.set(id, {
        data: item,
        id: id,
        pid: pid,
        sortKey: sortKey,
        children: [],
      });
    }

    // 构建树结构
    const roots = [];
    const orphanNodes = []; // 父节点不存在的节点

    for (const [id, node] of nodeMap) {
      const pid = node.pid;

      // 判断是否为根节点：pid 为 null, undefined, 0, '0', 空字符串
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
          // 父节点不存在，作为孤立节点处理
          orphanNodes.push(node);
          console.warn(
            `[排序] 节点 ${id} 的父节点 ${pid} 不存在，将作为根节点处理`,
          );
        }
      }
    }

    // 如果所有节点都有不存在的父节点，则全部作为根节点
    if (roots.length === 0 && orphanNodes.length > 0) {
      roots.push(...orphanNodes);
    } else if (orphanNodes.length > 0) {
      // 将孤立节点追加到根节点后面
      roots.push(...orphanNodes);
    }

    /**
     * 递归排序节点及其子节点
     * @param {Array} nodes 节点数组
     */
    const sortNodes = (nodes) => {
      // 先排序当前层
      nodes.sort((a, b) => ExcelExporter.compareSortKeys(a.sortKey, b.sortKey));

      // 递归排序子节点
      for (const node of nodes) {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      }
    };

    // 对根节点排序（会递归排序所有层级）
    sortNodes(roots);

    // 展平树结构为数组（深度优先）
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
   * 对数据进行排序（实例方法，使用实例配置）
   * @param {Array} rowsData 数据行
   * @returns {Array} 排序后的数据
   */
  _sortData(rowsData) {
    // 检查是否启用排序
    if (!this.sortConfig.enabled) {
      console.log("[排序] 排序已禁用，保持原始数据顺序");
      return rowsData;
    }

    if (!Array.isArray(rowsData) || rowsData.length === 0) {
      return rowsData;
    }

    // 检查数据是否包含排序所需字段
    const firstRow = rowsData[0];
    const hasPidField = firstRow.hasOwnProperty(this.sortConfig.pidField);
    const hasSortField = firstRow.hasOwnProperty(this.sortConfig.sortField);
    const hasIdField = firstRow.hasOwnProperty(this.sortConfig.idField);

    if (!hasPidField && !hasSortField) {
      console.log(
        `[排序] 数据中未找到排序字段 (${this.sortConfig.pidField}, ${this.sortConfig.sortField})，跳过排序`,
      );
      return rowsData;
    }

    console.log(
      `[排序] 开始树形排序，数据行数: ${rowsData.length}, ` +
        `ID字段: ${this.sortConfig.idField}, ` +
        `父ID字段: ${this.sortConfig.pidField}, ` +
        `排序字段: ${this.sortConfig.sortField}`,
    );

    // 如果没有 id 字段，使用简单排序
    if (!hasIdField) {
      console.log("[排序] 未找到ID字段，使用简单排序");
      return this._simpleSort(rowsData);
    }

    // 使用树形排序
    const sorted = ExcelExporter.sortTreeData(
      rowsData,
      this.sortConfig.idField,
      this.sortConfig.pidField,
      this.sortConfig.sortField,
    );

    // 打印排序结果摘要
    if (sorted.length > 0) {
      console.log(
        `[排序] 排序完成，前5条记录:`,
        sorted.slice(0, 5).map((row) => ({
          [this.sortConfig.idField]: row[this.sortConfig.idField],
          [this.sortConfig.pidField]: row[this.sortConfig.pidField],
          [this.sortConfig.sortField]: row[this.sortConfig.sortField],
        })),
      );
    }

    return sorted;
  }

  /**
   * 简单排序（不构建树结构，仅按 s_tree_no 排序）
   * @param {Array} rowsData 数据行
   * @returns {Array} 排序后的数据
   */
  _simpleSort(rowsData) {
    const dataCopy = [...rowsData];
    const sortField = this.sortConfig.sortField;
    const pidField = this.sortConfig.pidField;

    dataCopy.sort((a, b) => {
      // 判断是否为根节点
      const aPid = a[pidField];
      const bPid = b[pidField];
      const aIsRoot = !aPid || aPid === 0 || aPid === "0" || aPid === "";
      const bIsRoot = !bPid || bPid === 0 || bPid === "0" || bPid === "";

      // 先按是否为根节点排序（根节点优先）
      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;

      // 同级按sortKey排序
      const keyA = ExcelExporter.parseTreeNo(a[sortField]);
      const keyB = ExcelExporter.parseTreeNo(b[sortField]);
      return ExcelExporter.compareSortKeys(keyA, keyB);
    });

    return dataCopy;
  }

  // ==================== 原有方法 ====================

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
   * 解析 marks 数据（支持 JSON 和 Python 格式）
   * @param {any} marksData 原始 marks 数据
   * @returns {Array} 解析后的数组
   */
  _parseMarks(marksData) {
    if (!marksData) return [];
    if (Array.isArray(marksData)) return marksData;

    if (typeof marksData === "string") {
      const trimmed = marksData.trim();
      if (trimmed === "") return [];

      try {
        // 先尝试标准 JSON 解析
        return JSON.parse(trimmed);
      } catch (e) {
        // 如果失败，可能是 Python 风格的列表 ['a','b']，需要转换为 JSON 格式
        try {
          // 将单引号替换为双引号
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
   * 检查字段是否在标记数组中（支持动态配置标记字段名）
   * @param {Object} rowData 行数据
   * @param {string} fieldName 字段名
   * @returns {boolean}
   */
  _isFieldMarked(rowData, fieldName) {
    if (!rowData || !fieldName) return false;

    // 使用动态配置的字段名获取标记数组
    const marksRaw =
      rowData[this.markCellConfig.fieldName] ||
      rowData[this.markCellConfig.alternateFieldName];
    const marks = this._parseMarks(marksRaw);

    // 检查字段是否在 marks 中
    return Array.isArray(marks) && marks.includes(fieldName);
  }

  /**
   * 判断是否为数值类型（用于确定对齐方式）
   * @param {any} value 值
   * @returns {boolean}
   */
  _isNumeric(value) {
    // 注意：不将数字字符串识别为数值，保持左对齐
    if (typeof value === "number") return true;
    if (typeof value === "string") {
      // 排除纯数字字符串（如 "123" 保持字符串原样）
      // 但如果是用户想要右对齐，需要配置 column 的类型
      return false;
    }
    return false;
  }

  /**
   * 根据 dataIndex 或值类型判断对齐方式
   * @param {string} dataIndex 字段名
   * @param {any} value 值
   * @returns {string} 'left' 或 'right'
   */
  _getAlignment(dataIndex, value) {
    // 可以通过字段名后缀判断（常见数值字段命名规则）
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
    ];
    if (dataIndex) {
      const lowerIndex = dataIndex.toLowerCase();
      for (const suffix of numericSuffixes) {
        if (lowerIndex.endsWith(suffix)) {
          return "right";
        }
      }
    }

    // 通过值类型判断
    if (typeof value === "number") {
      return "right";
    }

    // 默认为左对齐
    return "left";
  }

  /**
   * 获取表体单元格样式
   * @param {number} rowIndex 行索引（数据行索引，从0开始）
   * @param {Object} rowData 行数据（用于判断行背景色和单元格字体颜色）
   * @param {string} fieldName 字段名（用于判断是否需要标记字体颜色）
   * @param {any} value 单元格值（用于判断对齐方式）
   */
  getBodyCellStyle(rowIndex, rowData = null, fieldName = null, value = null) {
    let backgroundColor = this.bodyStyle.backgroundColor;

    // ========== 1. 优先检查行背景色（使用动态配置的字段名） ==========
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

    // ========== 2. 如果没有配置的行背景色，再检查斑马纹 ==========
    if (
      backgroundColor === this.bodyStyle.backgroundColor &&
      this.bodyStyle.alternateRowColor &&
      rowIndex % 2 === 1
    ) {
      backgroundColor = this.bodyStyle.alternateBackgroundColor;
    }

    // ========== 3. 检查字体颜色（根据标记字段标记红色） ==========
    let fontColor = this.bodyStyle.fontColor;
    if (rowData && fieldName && this._isFieldMarked(rowData, fieldName)) {
      fontColor = this.markCellConfig.markColor;
    }

    // ========== 4. 对齐方式：数值右对齐，文本左对齐 ==========
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
   * @param {Array} rowsData 数据行（原始数据，内部会进行排序）
   * @returns {Worksheet} Excel工作表
   */
  createWorksheet(sheetName, filteredTree, rowsData) {
    // ========== 数据排序（新增） ==========
    const sortedData = this._sortData(rowsData);

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

    // 写入数据行（使用排序后的数据）
    for (let rowIndex = 0; rowIndex < sortedData.length; rowIndex++) {
      const row = sortedData[rowIndex];
      const dataRow = worksheet.addRow([]);
      dataRow.height = 20;

      for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let value = row[leaf.dataIndex];

        // 处理数值格式化
        const isNumeric = typeof value === "number";
        if (isNumeric) {
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

        // ========== 应用表体样式（包含行背景色、单元格字体颜色和对齐方式） ==========
        // 注意：传入原始数值（未格式化前）用于对齐判断，因为 toFixed 后的字符串会丢失类型信息
        const originalValue = row[leaf.dataIndex];
        const bodyStyle = this.getBodyCellStyle(
          rowIndex,
          row,
          leaf.dataIndex,
          originalValue,
        );
        Object.assign(cell, bodyStyle);
      }
    }

    // 智能自适应列宽（使用排序后的数据）
    this.autoFitColumns(worksheet, leaves, sortedData, headerMatrix);

    return worksheet;
  }

  /**
   * 导出 Excel 文件
   * @param {Object} designData 设计数据
   * @param {Object} resultData 结果数据
   * @param {string} customFileName 自定义文件名（可选，覆盖构造函数中的文件名）
   * @param {Object} sortOptions 排序选项（可选，覆盖构造函数中的排序配置）
   * @param {boolean} sortOptions.enabled 是否启用排序
   * @param {string} sortOptions.idField ID字段名
   * @param {string} sortOptions.pidField 父ID字段名
   * @param {string} sortOptions.sortField 排序字段名
   */
  async export(
    designData,
    resultData,
    customFileName = null,
    sortOptions = null,
  ) {
    console.log("开始导出 Excel...", { mode: this.mode });

    // ========== 如果传入了 sortOptions，临时覆盖排序配置 ==========
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
        console.log(`${tableKey} 数据行数: ${rowsData.length} (排序前)`);

        // ========== 打印包含样式标记的行数据，用于调试 ==========
        const bgFieldName = this.rowBackgroundConfig.fieldName;
        const markFieldName = this.markCellConfig.fieldName;
        const styledRowsCount = rowsData.filter(
          (row) =>
            (row[bgFieldName] !== undefined && row[bgFieldName] !== null) ||
            (row[markFieldName] &&
              (Array.isArray(row[markFieldName])
                ? row[markFieldName].length > 0
                : typeof row[markFieldName] === "string"
                  ? row[markFieldName].trim() !== ""
                  : false)),
        ).length;
        console.log(
          `${tableKey} 包含样式标记的行数: ${styledRowsCount} (背景字段: ${bgFieldName}, 标记字段: ${markFieldName})`,
        );

        // 创建工作表（内部会自动排序）
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
    } catch (error) {
      console.error("导出失败:", error);
    }
  }
}

if (typeof window !== "undefined") {
  window.ExcelExporter = ExcelExporter;
}

// ==================== 使用示例 ====================

// 方式1: 使用默认配置（自动排序）
// const exporter = new ExcelExporter();
// await exporter.export(designData, resultData);

// 方式2: 禁用排序
// const exporter = new ExcelExporter({
//     sortConfig: { enabled: false }
// });
// await exporter.export(designData, resultData);

// 方式3: 自定义排序字段名
// const exporter = new ExcelExporter({
//     sortConfig: {
//         idField: 'my_id',
//         pidField: 'parent_id',
//         sortField: 'sort_order'
//     }
// });
// await exporter.export(designData, resultData);

// 方式4: 在 export 时动态指定排序配置
// const exporter = new ExcelExporter();
// await exporter.export(designData, resultData, null, {
//     enabled: true,
//     sortField: 'custom_sort_field'
// });

// 方式5: 完整配置示例
// const exporter = new ExcelExporter({
//     fileName: '我的测算报表',
//     mode: 'leafSpan',
//     sortConfig: {
//         enabled: true,          // 启用排序
//         idField: 's_tree_id',   // ID字段
//         pidField: 's_tree_pid', // 父ID字段
//         sortField: 's_tree_no'  // 排序编号字段
//     },
//     rowBackgroundConfig: {
//         fieldName: 'log_type',
//         colorMap: {
//             1: 'FFFFF0B3',
//             2: 'FFB3DAFF',
//             3: 'FFD9FFCC'
//         }
//     },
//     markCellConfig: {
//         fieldName: 'marks',
//         markColor: 'FFFF4D4F'
//     }
// });
// await exporter.export(designData, resultData);
