/**
 * 通用列表转树形结构类
 */
class ListToLayer {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.idKey - 节点 ID 键名，默认's_tree_id'
   * @param {string} options.parentKey - 父节点 ID 键名，默认's_tree_pid'
   * @param {string} options.childrenKey - 子节点键名，默认'children'
   * @param {Object} options.fieldMapping - 字段映射对象，可选
   * @param {Function|string} options.sortKey - 排序字段或排序函数，默认null（不排序）
   * @param {boolean} options.ascending - 是否升序，默认true
   */
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      idKey: "s_tree_id",
      parentKey: "s_tree_pid",
      childrenKey: "children",
      fieldMapping: null,
      sortKey: null,
      ascending: true,
    };

    // 合并配置
    this.config = { ...this.defaultOptions, ...options };
    this.idKey = this.config.idKey;
    this.parentKey = this.config.parentKey;
    this.childrenKey = this.config.childrenKey;
    this.fieldMapping = this.config.fieldMapping;
    this.sortKey = this.config.sortKey;
    this.ascending = this.config.ascending;
  }

  /**
   * 检测字符串是否为路径编码格式（纯数字+可选的分隔符，如 01, 0101, 01-01）
   * @param {*} value - 检测的值
   * @returns {boolean}
   */
  isPathCode(value) {
    if (typeof value !== "string") return false;
    // 匹配纯数字路径格式：01, 0101, 010101, 或带分隔符的 01-01-01
    return /^\d+(-\d+)*$/.test(value);
  }

  /**
   * 将路径编码转换为数字数组用于比较
   * @param {string} pathCode - 路径编码，如 "010101"
   * @returns {number[]} 数字数组，如 [1, 1, 1]
   */
  parsePathCode(pathCode) {
    // 按非数字分割（支持 01-01-01 或 010101 格式）
    let parts;
    if (pathCode.includes("-")) {
      parts = pathCode.split("-");
    } else {
      // 按固定长度分割？路径编码每段长度不固定，需要智能分割
      // 实际上标准路径编码如 "010101" 应该是 [01, 01, 01]
      // 但 "010101" 也可能是 [010, 101]？所以需要按层级递进规律识别
      parts = this.splitByHierarchy(pathCode);
    }
    return parts.map((p) => parseInt(p, 10));
  }

  /**
   * 智能分割路径编码（识别层级规律）
   * 例如: "010101" -> ["01", "01", "01"]
   *      "01010101" -> ["01", "01", "01", "01"]
   *      "0102" -> ["01", "02"]
   *      "010201" -> ["01", "02", "01"]
   * @param {string} code - 路径编码
   * @returns {string[]}
   */
  splitByHierarchy(code) {
    const parts = [];
    let i = 0;
    // 尝试每2位分割（最常见的路径编码长度）
    if (code.length % 2 === 0 && /^(\d{2})+$/.test(code)) {
      for (let i = 0; i < code.length; i += 2) {
        parts.push(code.substring(i, i + 2));
      }
      return parts;
    }

    // 智能识别：从第2位开始，检查是否能形成有效层级
    // 简化处理：按2位分割，如果最后剩余长度不是2的倍数则调整
    let remaining = code;
    while (remaining.length > 0) {
      let partLen = 2;
      // 如果剩余长度是奇数，最后一段可能是3位
      if (remaining.length % 2 === 1 && remaining.length > 2) {
        partLen = 3;
      }
      parts.push(remaining.substring(0, partLen));
      remaining = remaining.substring(partLen);
    }
    return parts;
  }

  /**
   * 比较两个可能的路径编码值
   * @param {*} a - 值A
   * @param {*} b - 值B
   * @returns {number} 比较结果
   */
  comparePathCodes(a, b) {
    const aIsPath = this.isPathCode(a);
    const bIsPath = this.isPathCode(b);

    // 都是路径编码：按层级比较
    if (aIsPath && bIsPath) {
      const aParts = this.parsePathCode(a);
      const bParts = this.parsePathCode(b);
      const minLen = Math.min(aParts.length, bParts.length);

      // 逐级比较
      for (let i = 0; i < minLen; i++) {
        if (aParts[i] !== bParts[i]) {
          return this.ascending ? aParts[i] - bParts[i] : bParts[i] - aParts[i];
        }
      }
      // 前缀相同，层级少的排在前面（父级在前）
      return this.ascending
        ? aParts.length - bParts.length
        : bParts.length - aParts.length;
    }

    // 一个是路径编码，一个不是：路径编码优先？这里按实际值比较
    if (aIsPath !== bIsPath) {
      // 让路径编码排在前面（更符合业务预期）
      return aIsPath ? -1 : 1;
    }

    return 0;
  }

  /**
   * 排序数组
   * @param {Array} arr - 需要排序的数组
   * @returns {Array} 排序后的数组
   */
  sortArray(arr) {
    if (!this.sortKey) return arr;

    const sortFn =
      typeof this.sortKey === "function"
        ? this.sortKey
        : (a, b) => {
            let aVal = a[this.sortKey];
            let bVal = b[this.sortKey];

            // 处理 null/undefined 值
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return this.ascending ? 1 : -1;
            if (bVal == null) return this.ascending ? -1 : 1;

            // 转换为字符串处理（统一类型）
            const aIsPath = typeof aVal === "string" && this.isPathCode(aVal);
            const bIsPath = typeof bVal === "string" && this.isPathCode(bVal);

            // 如果都是路径编码，使用路径编码比较
            if (aIsPath || bIsPath) {
              const result = this.comparePathCodes(String(aVal), String(bVal));
              if (result !== 0) return result;
            }

            // 字符串比较
            if (typeof aVal === "string" && typeof bVal === "string") {
              return this.ascending
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }

            // 数字比较
            if (typeof aVal === "number" && typeof bVal === "number") {
              return this.ascending ? aVal - bVal : bVal - aVal;
            }

            // 混合类型，转为字符串比较
            const aStr = String(aVal);
            const bStr = String(bVal);
            return this.ascending
              ? aStr.localeCompare(bStr)
              : bStr.localeCompare(aStr);
          };

    return [...arr].sort(sortFn);
  }

  /**
   * 递归排序树形结构
   * @param {Array} tree - 树形结构数组
   * @returns {Array} 排序后的树形结构
   */
  sortTree(tree) {
    if (!this.sortKey) return tree;

    // 先对当前层排序
    const sortedTree = this.sortArray(tree);

    // 递归排序子节点
    sortedTree.forEach((node) => {
      if (node[this.childrenKey] && node[this.childrenKey].length > 0) {
        node[this.childrenKey] = this.sortTree(node[this.childrenKey]);
      }
    });

    return sortedTree;
  }

  /**
   * 转换扁平化数据为树形结构
   * @param {Array} list - 扁平化数据列表
   * @param {Object} options - 额外选项（可覆盖构造函数的配置）
   * @returns {Array} 树形结构数据
   */
  convert(list, options = {}) {
    // 临时覆盖配置（用于单次调用）
    const tempSortKey =
      options.sortKey !== undefined ? options.sortKey : this.sortKey;
    const tempAscending =
      options.ascending !== undefined ? options.ascending : this.ascending;

    // 如果没有数据，返回空数组
    if (!list || !Array.isArray(list) || list.length === 0) {
      return [];
    }

    // 先对原始列表按 parentKey 排序（可选，提高性能）
    let processedList = list;
    if (tempSortKey === this.parentKey) {
      processedList = this.sortArray(list);
    }

    // 使用 reduce 构建节点映射
    const nodeMap = processedList.reduce((acc, node) => {
      const mappedNode = this.mapFields(node);
      const nodeId = node[this.idKey];

      // 确保节点有 ID
      if (nodeId !== undefined && nodeId !== null) {
        acc[nodeId] = {
          ...mappedNode,
          [this.childrenKey]: [],
        };
      }
      return acc;
    }, {});

    // 存储根节点
    const roots = [];

    // 第二次遍历，构建父子关系
    processedList.forEach((node) => {
      const currentNode = nodeMap[node[this.idKey]];
      const parentId = node[this.parentKey];

      // 如果当前节点不存在（可能 ID 无效），跳过
      if (!currentNode) return;

      // 查找父节点
      if (parentId !== undefined && parentId !== null && nodeMap[parentId]) {
        // 将当前节点添加到父节点的 children 中
        nodeMap[parentId][this.childrenKey].push(currentNode);
      } else {
        // 没有父节点或父节点不存在，作为根节点
        roots.push(currentNode);
      }
    });

    // 对树进行排序
    let result = roots;
    if (tempSortKey) {
      // 临时设置 ascending 用于排序
      const originalAscending = this.ascending;
      this.ascending = tempAscending;
      result = this.sortTree(roots);
      this.ascending = originalAscending;
    }

    return result;
  }

  /**
   * 处理字段映射
   * @param {Object} node - 原始节点
   * @returns {Object} 映射后的节点
   */
  mapFields(node) {
    if (!this.fieldMapping) return { ...node };

    const mappedNode = {};

    // 处理特殊字段（children 字段在后续步骤添加）
    const specialKeys = [this.childrenKey];

    // 遍历原节点属性
    Object.keys(node).forEach((key) => {
      // 如果存在字段映射，则使用映射后的字段名
      if (this.fieldMapping[key] !== undefined) {
        mappedNode[this.fieldMapping[key]] = node[key];
      }
      // 特殊字段不在这里处理
      else if (!specialKeys.includes(key)) {
        mappedNode[key] = node[key];
      }
    });

    return mappedNode;
  }
}

// 全局暴露
if (typeof window !== "undefined") {
  window.ListToLayer = ListToLayer;
  window.new_listToTree = function (list, options = {}) {
    const instance = new ListToLayer(options);
    return instance.convert(list);
  };
}
