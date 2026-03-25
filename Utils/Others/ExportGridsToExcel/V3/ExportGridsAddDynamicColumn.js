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

    // ExcelJS 实例
    this.ExcelJS = null;
    this.workbook = null;

    // 黑名单字段
    this.blacklist = [
      "s_tree_pid",
      "s_tree_id",
      "phid_pc",
      "children",
      "key",
      "id",
    ];
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
   * 格式化数值（根据精度）
   * @param {*} value 原始值
   * @param {number} precision 精度
   * @returns {string|number} 格式化后的值
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
          // 格式化数值（根据精度）
          if (typeof value === "number") {
            value = this.formatNumber(value, leaf.precision);
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
          value = this.formatNumber(value, leaf.precision);
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
   * 获取表格数据（兼容不同结构）
   * @param {Object} resultData 结果数据
   * @param {string} tableKey 表key
   * @returns {Array} 数据数组
   */
  getTableData(resultData, tableKey) {
    if (!resultData) return [];
    // 直接属性
    if (Array.isArray(resultData[tableKey])) {
      return resultData[tableKey];
    }
    // 嵌套在 data.uiContent.grid 下
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
    // 尝试从 resultData 根下找 grid
    if (resultData.uiContent && resultData.uiContent.grid) {
      const grid = resultData.uiContent.grid[tableKey];
      if (grid && Array.isArray(grid.data)) {
        return grid.data;
      }
      if (grid && Array.isArray(grid)) {
        return grid;
      }
    }
    console.warn(`无法获取表 ${tableKey} 的数据，尝试的结构均无效`);
    return [];
  }

  /**
   * 从数据中提取动态分组信息（确保字段名唯一，避免重复）
   * @param {Array} rowsData
   * @returns {Object} { groupCount, dynamicFieldMap }
   * dynamicFieldMap: baseName -> Map<groupNum, Set<fieldName>>
   */
  extractDynamicGroups(rowsData) {
    if (!rowsData || rowsData.length === 0)
      return { groupCount: 0, dynamicFieldMap: new Map() };
    const pattern = /^([a-zA-Z_]+)-(\d+)$/;
    const dynamicFieldMap = new Map(); // baseName -> Map<groupNum, Set<fieldName>>
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
          // 使用 Set 确保字段名唯一
          groupMap.get(groupNum).add(key);
        }
      }
    }

    // 将 Set 转换为数组，方便后续处理
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
   * @param {Object} dynamicInfo { groupCount, dynamicFieldMap, tableConfig }
   * @returns {Array} 动态列树
   */
  buildDynamicColumns(dynamicInfo) {
    const { groupCount, dynamicFieldMap, tableConfig } = dynamicInfo;
    if (groupCount === 0 || dynamicFieldMap.size === 0) return [];

    // 获取配置中的动态字段定义
    const dynamicBaseFields =
      tableConfig?.baseFields?.filter(
        (f) => f.groupIn && f.groupIn.length > 0,
      ) || [];

    // 按分组编号收集字段
    const groups = new Map(); // groupNum -> { groupName, fields: [] }
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
          // 每个 field 已经是唯一对象，直接添加
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

    // 构建列树
    const dynamicColumns = [];
    const hasSubGroup = Array.from(groups.values()).some((g) =>
      g.fields.some((f) => f.subGroup),
    );
    if (hasSubGroup) {
      // 多级分组：项目组 -> 子组 -> 字段
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
      // 一级分组
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
   * @param {string} fieldName 字段名
   * @returns {string} 显示名称
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
   * @param {string} customFileName 自定义文件名（可选，覆盖构造函数中的文件名）
   */
  async export(designData, resultData, customFileName = null) {
    console.log("开始导出 Excel...", { mode: this.mode });

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

        // 1. 获取原始列配置（包含原有分组结构）
        const rawColumns =
          configData.uiContent?.grid?.[tableKey]?.columns || [];
        // 过滤原始列配置，得到基础列树
        const baseColumnsTree = this.filterColumns(rawColumns);
        console.log(
          `${tableKey} 原始列树（过滤后）:`,
          JSON.stringify(baseColumnsTree, null, 2),
        );

        // 2. 提取动态分组信息（已去重）
        const { groupCount, dynamicFieldMap } =
          this.extractDynamicGroups(rowsData);
        console.log(`${tableKey} 动态分组数量: ${groupCount}`);

        // 3. 构建动态列树
        const tableConfig = this.tableConfigs.find(
          (cfg) => cfg.tableId === tableKey,
        );
        const dynamicColumnsTree = this.buildDynamicColumns({
          groupCount,
          dynamicFieldMap,
          tableConfig,
        });
        console.log(
          `${tableKey} 动态列树:`,
          JSON.stringify(dynamicColumnsTree, null, 2),
        );

        // 4. 合并列树：将动态列树附加到基础列树之后
        const finalColumnsTree = [...baseColumnsTree, ...dynamicColumnsTree];

        if (finalColumnsTree.length === 0) {
          console.warn(`${tableKey} 合并后无有效列，跳过`);
          continue;
        }

        // 创建工作表
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
    }
  }
}

if (typeof window !== "undefined") {
  window.ExcelExporter = ExcelExporter;
}
