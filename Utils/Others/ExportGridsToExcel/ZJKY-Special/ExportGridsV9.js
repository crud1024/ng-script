// ==================== Excel 导出类 ====================

class ExcelExporter {
  constructor(options = {}) {
    this.fileName = options.fileName || "AI测算导出";
    this.mode = options.mode || "leafSpan";

    this.headerStyle = {
      backgroundColor: options.headerStyle?.backgroundColor || "FFE0E0E0",
      fontColor: options.headerStyle?.fontColor || "FF000000",
      fontSize: options.headerStyle?.fontSize || 11,
      bold: options.headerStyle?.bold !== false,
      ...options.headerStyle,
    };

    this.bodyStyle = {
      backgroundColor: options.bodyStyle?.backgroundColor || "FFFFFFFF",
      fontColor: options.bodyStyle?.fontColor || "FF000000",
      fontSize: options.bodyStyle?.fontSize || 10,
      alternateRowColor: options.bodyStyle?.alternateRowColor || false,
      alternateBackgroundColor:
        options.bodyStyle?.alternateBackgroundColor || "FFF5F5F5",
      ...options.bodyStyle,
    };

    this.borderStyle = {
      color: options.borderStyle?.color || "FF000000",
      style: options.borderStyle?.style || "thin",
      ...options.borderStyle,
    };

    this.columnConfig = {
      minWidth: options.columnConfig?.minWidth || 8,
      maxWidth: options.columnConfig?.maxWidth || 50,
      defaultWidth: options.columnConfig?.defaultWidth || 12,
      ...options.columnConfig,
    };

    this.logTypeColorMap = {
      1: "FFB3DAFF",
      2: "FFFFF0B3",
      3: "FFD9FFCC",
    };

    this.markCellColor = "FFFF4D4F";
    this.manualHighlightColor = "FFFFF0B3"; // 高亮颜色 #fff0b3 转换
    this.ExcelJS = null;
    this.workbook = null;
    this.blacklist = ["s_tree_pid", "s_tree_id", "phid_pc"];

    // 定义需要高亮处理的表格配置
    this.highlightConfig = {
      inv_xmdx_budget_d2: {
        column: "ref_unit_quota",
        conditionField: "is_manual",
      },
      inv_xmdx_budget_d3: {
        column: "ref_unit_quota",
        conditionField: "is_manual",
      },
      inv_xmdx_budget_d4: {
        column: "ref_equip_unit_price",
        conditionField: "is_manual",
      },
      inv_xmdx_budget_d5: {
        column: "ref_unit_quota",
        conditionField: "is_manual",
      },
    };
  }

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

  // ==================== 数据扁平化工具函数 ====================

  flattenTreeData(treeData, childrenKey = "children", parentContext = {}) {
    if (!Array.isArray(treeData)) return [];
    const result = [];

    for (const node of treeData) {
      const flatNode = { ...node };
      for (const [key, value] of Object.entries(parentContext)) {
        if (flatNode[key] === undefined || flatNode[key] === null) {
          flatNode[key] = value;
        }
      }
      if (parentContext.myLevel) {
        flatNode.myLevel = parentContext.myLevel + 1;
      } else if (flatNode.myLevel === undefined) {
        flatNode.myLevel = 1;
      }
      const children = flatNode[childrenKey];
      delete flatNode[childrenKey];
      result.push(flatNode);
      if (children && Array.isArray(children) && children.length > 0) {
        const childContext = { ...parentContext };
        childContext.parent_name = flatNode.s_tree_name;
        childContext.parent_id = flatNode.s_tree_id;
        childContext.myLevel = flatNode.myLevel;
        const childResults = this.flattenTreeData(
          children,
          childrenKey,
          childContext,
        );
        result.push(...childResults);
      }
    }
    return result;
  }

  flattenTreeDataByParentId(flatData) {
    if (!Array.isArray(flatData)) return flatData;
    const result = [];
    for (const item of flatData) {
      const node = { ...item };
      if (node.s_tree_no) {
        node.myLevel = (node.s_tree_no.match(/\./g) || []).length + 1;
      } else if (
        node.s_tree_pid === "0" ||
        node.s_tree_pid === 0 ||
        node.s_tree_pid === null
      ) {
        node.myLevel = 1;
      } else {
        node.myLevel = 2;
      }
      result.push(node);
    }
    // 排序：优先按层级，同层级内先正常项后尾部项（#/空/sort_trail），再按 s_tree_no
    result.sort((a, b) => {
      const levelA = a.myLevel || 0;
      const levelB = b.myLevel || 0;
      if (levelA !== levelB) return levelA - levelB;
      return this._tailSortCompare(a, b);
    });
    return result;
  }

  smartFlattenData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return data || [];
    }
    // 检查是否有 children 字段（树形结构）
    const hasChildrenField = data.some(
      (item) => item.children !== undefined && Array.isArray(item.children),
    );
    // 检查是否有树形ID字段
    const hasTreeIdField = data.some(
      (item) =>
        (item.s_tree_id !== undefined && item.s_tree_pid !== undefined) ||
        item.s_tree_no !== undefined,
    );

    if (hasChildrenField) {
      console.log("检测到 children 字段，执行树形数据扁平化");
      const flattened = this.flattenTreeData(data, "children");
      console.log(`扁平化: ${data.length} 行 -> ${flattened.length} 行`);
      return flattened;
    }
    if (hasTreeIdField) {
      console.log("检测到 s_tree_id/s_tree_pid 字段，执行层级数据处理");
      const processed = this.flattenTreeDataByParentId(data);
      console.log(`处理: ${data.length} 行 -> ${processed.length} 行`);
      return processed;
    }
    console.log("未检测到树形结构，使用原始数据");
    return data;
  }

  /**
   * 判断数据行是否应该排在最后
   * 规则：名称包含 #、名称为空、s_tree_no 为空、或存在 sort_trail 标记
   * @param {string} name - 名称（如 s_tree_name）
   * @param {string} treeNo - 编号（如 s_tree_no）
   * @param {*} sortTrail - sort_trail 字段值
   * @returns {boolean}
   */
  _shouldSortLast(name, treeNo, sortTrail) {
    // 名称中包含 #
    if (name && name.includes("#")) return true;
    // 名称或编号为空
    if (!name || !treeNo || treeNo === "") return true;
    // 存在 sort_trail 标记（不为 undefined/null）
    if (sortTrail !== undefined && sortTrail !== null) return true;
    return false;
  }

  /**
   * 通用尾部排序比较器
   * 正常项按 s_tree_no 数字排序，#/空/sort_trail 项排在最后
   * sort_trail 项之间按其数值排序
   */
  _tailSortCompare(a, b) {
    const noA = a.s_tree_no || "";
    const noB = b.s_tree_no || "";
    const nameA = a.s_tree_name || "";
    const nameB = b.s_tree_name || "";
    const trailA = a.sort_trail;
    const trailB = b.sort_trail;

    const isTailA = this._shouldSortLast(nameA, noA, trailA);
    const isTailB = this._shouldSortLast(nameB, noB, trailB);

    // 非 tail 项排在 tail 项前面
    if (isTailA && !isTailB) return 1;
    if (!isTailA && isTailB) return -1;

    // 两个都是 tail 项
    if (isTailA && isTailB) {
      // 都有 sort_trail 数值，按数值排序
      if (
        trailA !== undefined &&
        trailA !== null &&
        trailB !== undefined &&
        trailB !== null
      ) {
        return Number(trailA) - Number(trailB);
      }
      // 只有 A 有 sort_trail，A 排后面
      if (trailA !== undefined && trailA !== null) return 1;
      // 只有 B 有 sort_trail，B 排后面
      if (trailB !== undefined && trailB !== null) return -1;
      // 都没有 sort_trail，按 s_tree_no 排
      return noA.localeCompare(noB, undefined, { numeric: true });
    }

    // 两个都不是 tail，正常按 s_tree_no 数字排序
    return noA.localeCompare(noB, undefined, { numeric: true });
  }

  // 专门为 d0 数据排序：按 s_tree_no 排序，#/空/sort_trail 项排在最后
  sortD0Data(data) {
    if (!Array.isArray(data)) return data;
    return [...data].sort((a, b) => this._tailSortCompare(a, b));
  }

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
        acc.push({ ...col, columns: filteredChildren });
      }
      return acc;
    }, []);
  }

  countLeaves(node) {
    if (!node.columns || node.columns.length === 0) return 1;
    return node.columns.reduce(
      (sum, child) => sum + this.countLeaves(child),
      0,
    );
  }

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

  getNodeTitle(node) {
    return node.header || node.title || node.langKey || node.name || "";
  }

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
      matrix[row][col] = { value: title, rowspan: rowspan, colspan: colspan };
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
   * 获取单元格样式（支持高亮配置）
   * @param {number} rowIndex - 行索引
   * @param {object} rowData - 行数据
   * @param {string} fieldName - 字段名
   * @param {string} tableKey - 表格标识（如 inv_xmdx_budget_d2）
   * @returns {object} 样式对象
   */
  getBodyCellStyle(
    rowIndex,
    rowData = null,
    fieldName = null,
    tableKey = null,
  ) {
    let backgroundColor = this.bodyStyle.backgroundColor;

    // 检查是否需要高亮显示（根据 is_manual 字段）
    const shouldHighlight = this.shouldHighlightCell(
      tableKey,
      fieldName,
      rowData,
    );

    if (shouldHighlight) {
      backgroundColor = this.manualHighlightColor;
      console.log(
        `高亮单元格: 表=${tableKey}, 列=${fieldName}, 行=${rowIndex + 1}, is_manual=${rowData?.is_manual}`,
      );
    }
    // 原有日志类型颜色处理（优先级低于高亮）
    else if (
      rowData &&
      rowData.u_log_type !== undefined &&
      rowData.u_log_type !== null
    ) {
      const logType = rowData.u_log_type;
      if (this.logTypeColorMap[logType]) {
        backgroundColor = this.logTypeColorMap[logType];
      }
    }
    // 交替行颜色
    else if (
      backgroundColor === this.bodyStyle.backgroundColor &&
      this.bodyStyle.alternateRowColor &&
      rowIndex % 2 === 1
    ) {
      backgroundColor = this.bodyStyle.alternateBackgroundColor;
    }

    let fontColor = this.bodyStyle.fontColor;
    if (rowData && fieldName) {
      const marks = rowData.marks || rowData.Marks || [];
      if (Array.isArray(marks) && marks.includes(fieldName)) {
        fontColor = this.markCellColor;
      }
    }

    return {
      font: { size: this.bodyStyle.fontSize, color: { argb: fontColor } },
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
   * 判断单元格是否需要高亮
   * @param {string} tableKey - 表格标识
   * @param {string} fieldName - 字段名
   * @param {object} rowData - 行数据
   * @returns {boolean}
   */
  shouldHighlightCell(tableKey, fieldName, rowData) {
    if (!tableKey || !fieldName || !rowData) return false;

    const config = this.highlightConfig[tableKey];
    if (!config) return false;

    // 检查是否是需要高亮的列
    if (config.column !== fieldName) return false;

    // 检查条件字段的值是否为 1
    const conditionValue = rowData[config.conditionField];
    return conditionValue === 1 || conditionValue === "1";
  }

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

  createWorksheet(
    sheetName,
    filteredTree,
    rowsData,
    skipFlatten = false,
    tableKey = null,
  ) {
    // 确保 rowsData 是数组
    const dataArray = Array.isArray(rowsData) ? rowsData : [];

    // 关键修改：如果 skipFlatten 为 true，直接使用原始数据，不再扁平化
    let flattenedData;
    if (skipFlatten) {
      flattenedData = dataArray;
      console.log(
        `${sheetName} 跳过扁平化，直接使用原始数据，共 ${flattenedData.length} 行`,
      );
    } else {
      flattenedData = this.smartFlattenData(dataArray);
      console.log(
        `${sheetName} 数据扁平化: ${dataArray.length} 行 -> ${flattenedData.length} 行`,
      );
    }

    // 如果没有数据，也要创建表头
    if (flattenedData.length === 0) {
      console.log(`${sheetName} 无数据，只创建表头`);
    } else {
      console.log(`${sheetName} 数据示例第一行:`, flattenedData[0]);
    }

    const headerMatrix = this.buildHeaderMatrix(filteredTree);
    const leaves = this.flattenLeaves(filteredTree);
    console.log(`${sheetName} 叶子列数量: ${leaves.length}`);

    const worksheet = this.workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });
    worksheet.properties.defaultRowHeight = 20;

    // 创建表头
    for (let i = 0; i < headerMatrix.length; i++) {
      const rowCells = headerMatrix[i];
      const excelRow = worksheet.addRow([]);
      excelRow.height = 25;
      for (let j = 0; j < rowCells.length; j++) {
        const cellInfo = rowCells[j];
        const cell = excelRow.getCell(j + 1);
        cell.value = cellInfo?.value || "";
        if (cellInfo) {
          Object.assign(cell, this.getHeaderCellStyle());
        }
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
        console.warn(
          `合并失败: ${merge.startRow},${merge.startCol} -> ${merge.endRow},${merge.endCol}`,
          e.message,
        );
      }
    }

    // 填充数据行
    for (let rowIndex = 0; rowIndex < flattenedData.length; rowIndex++) {
      const row = flattenedData[rowIndex];
      const dataRow = worksheet.addRow([]);
      dataRow.height = 20;
      for (let idx = 0; idx < leaves.length; idx++) {
        const leaf = leaves[idx];
        let value = row[leaf.dataIndex];
        const isNumberType = typeof value === "number"; // 在格式化前保存原始类型
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
        const alignment = { vertical: "middle" };
        alignment.horizontal = isNumberType ? "right" : "left";
        // 传入 tableKey 以便判断是否需要高亮
        const bodyStyle = this.getBodyCellStyle(
          rowIndex,
          row,
          leaf.dataIndex,
          tableKey,
        );
        bodyStyle.alignment = { ...bodyStyle.alignment, ...alignment };
        Object.assign(cell, bodyStyle);
      }
    }

    this.autoFitColumns(worksheet, leaves, flattenedData, headerMatrix);
    return worksheet;
  }

  // d0 表默认列配置 - 使用 s_tree_no 作为序号
  getDefaultD0Columns() {
    return [
      { header: "序号", dataIndex: "s_tree_no", width: 12 }, // 改为使用 s_tree_no
      { header: "工程或费用名称", dataIndex: "s_tree_name", width: 35 },
      {
        header: "建筑工程费(ks)",
        dataIndex: "construction_cost_ks",
        width: 18,
      },
      { header: "设备购置费(ks)", dataIndex: "equipment_cost_ks", width: 18 },
      {
        header: "安装工程费(ks)",
        dataIndex: "installation_cost_ks",
        width: 18,
      },
      { header: "其他费用(ks)", dataIndex: "other_cost_wan", width: 18 },
      { header: "合计(ks)", dataIndex: "total_amount_wan", width: 18 },
      { header: "经济指标(ks/t)", dataIndex: "economic_tech_ratio", width: 15 },
    ];
  }

  async export(designData, resultData, customFileName = null) {
    console.log("开始导出 Excel...", { mode: this.mode });
    console.log("designData:", designData);
    console.log("resultData keys:", Object.keys(resultData));

    try {
      await this.init();
      const configData = designData.data || designData;
      const busTableChnMap = configData.publicProperty?.busTableChnMap || {};
      console.log("表名映射:", busTableChnMap);

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

      const allDetailTables = Object.keys(busTableChnMap)
        .filter((key) => key.match(/_d\d+$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+$/)[0], 10);
          const numB = parseInt(b.match(/\d+$/)[0], 10);
          return numA - numB;
        });

      console.log("明细表列表:", allDetailTables);

      if (allDetailTables.length === 0) {
        throw new Error("未找到明细表配置");
      }

      // 分离 d0 和其他表
      const d0Key = allDetailTables.find((key) => key.endsWith("_d0"));
      const otherTables = allDetailTables.filter((key) => !key.endsWith("_d0"));

      // ========== 处理 d0 表 ==========
      if (d0Key) {
        const sheetName = busTableChnMap[d0Key] || "工程总估算(定案)";
        let d0Data = resultData[d0Key];

        // 确保 d0Data 是数组
        if (!Array.isArray(d0Data)) {
          console.warn(`d0 数据不是数组，尝试转换:`, d0Data);
          if (d0Data && typeof d0Data === "object") {
            d0Data = [d0Data];
          } else {
            d0Data = [];
          }
        }

        console.log(
          `\n========== 处理 d0 表: ${d0Key}，Sheet名称: ${sheetName} ==========`,
        );
        console.log(`d0 原始数据行数: ${d0Data.length}`);

        // 关键修改1：对 d0 数据按 s_tree_no 排序，保持父子顺序（使用数字排序）
        d0Data = this.sortD0Data(d0Data);
        console.log(`d0 排序后数据顺序:`);
        d0Data.forEach((item) => {
          console.log(`  ${item.s_tree_no} - ${item.s_tree_name}`);
        });

        let filteredTree = null;
        const d0GridConfig = configData.uiContent?.grid?.[d0Key];

        if (
          d0GridConfig &&
          d0GridConfig.columns &&
          d0GridConfig.columns.length > 0
        ) {
          const rawColumns = d0GridConfig.columns;
          // 如果配置中有 "序号" 列，将其 dataIndex 改为 s_tree_no
          const modifiedColumns = this.modifySerialColumn(rawColumns);
          filteredTree = this.filterColumns(modifiedColumns);
          console.log(`使用 d0 自己的列配置，共 ${filteredTree.length} 列`);
        } else {
          console.log(`未找到 d0 列配置，使用默认配置`);
          const defaultColumns = this.getDefaultD0Columns();
          filteredTree = this.filterColumns(defaultColumns);
          console.log(`使用默认列配置，共 ${filteredTree.length} 列`);
        }

        if (filteredTree && filteredTree.length > 0) {
          // 关键修改2：d0表跳过扁平化，传入 true，tableKey 传 null（d0 不需要高亮）
          this.createWorksheet(sheetName, filteredTree, d0Data, true, null);
          console.log(`d0 Sheet 创建完成: ${sheetName}`);
        } else {
          console.warn(`d0 无有效列配置，跳过`);
        }
      }

      // ========== 处理其他明细表 ==========
      for (const tableKey of otherTables) {
        const sheetName = busTableChnMap[tableKey] || tableKey;
        const gridConfig = configData.uiContent?.grid?.[tableKey];

        console.log(
          `\n========== 处理表 ${tableKey}，Sheet名称: ${sheetName} ==========`,
        );

        if (!gridConfig) {
          console.warn(`未找到表格配置: ${tableKey}`);
          continue;
        }

        const rawColumns = gridConfig.columns || [];
        const filteredTree = this.filterColumns(rawColumns);

        if (filteredTree.length === 0) {
          console.warn(`${tableKey} 无有效列，跳过`);
          continue;
        }

        let rowsData = resultData[tableKey] || [];

        // 确保 rowsData 是数组
        if (!Array.isArray(rowsData)) {
          console.warn(`${tableKey} 数据不是数组，尝试转换`);
          if (rowsData && typeof rowsData === "object") {
            rowsData = [rowsData];
          } else {
            rowsData = [];
          }
        }

        console.log(`${tableKey} 原始数据行数: ${rowsData.length}`);

        // 打印 is_manual 字段信息以便调试
        if (this.highlightConfig[tableKey]) {
          rowsData.forEach((row, idx) => {
            if (row.is_manual === 1 || row.is_manual === "1") {
              console.log(
                `${tableKey} 第${idx + 1}行 is_manual=1，需要高亮 ${this.highlightConfig[tableKey].column} 列`,
              );
            }
          });
        }

        // 其他表正常处理（可能需要扁平化），传入 tableKey 以便高亮判断
        this.createWorksheet(
          sheetName,
          filteredTree,
          rowsData,
          false,
          tableKey,
        );
        console.log(`${tableKey} Sheet 创建完成`);
      }

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

  // 修改序号列，将 dataIndex 从 sort_num 改为 s_tree_no
  modifySerialColumn(columns) {
    if (!Array.isArray(columns)) return columns;

    return columns.map((col) => {
      const newCol = { ...col };

      // 如果是列组，递归处理子列
      if (newCol.columns && Array.isArray(newCol.columns)) {
        newCol.columns = this.modifySerialColumn(newCol.columns);
      }

      // 如果是序号列（header 包含"序号"或 dataIndex 是 sort_num）
      if (
        newCol.dataIndex === "sort_num" ||
        (newCol.header &&
          (newCol.header.includes("序号") || newCol.header === "serial"))
      ) {
        newCol.dataIndex = "s_tree_no";
        console.log(`将序号列从 ${col.dataIndex} 改为 s_tree_no`);
      }

      return newCol;
    });
  }

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
