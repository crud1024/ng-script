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
            const aVal = a[this.sortKey];
            const bVal = b[this.sortKey];

            // 处理 null/undefined 值
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return this.ascending ? 1 : -1;
            if (bVal == null) return this.ascending ? -1 : 1;

            // 比较值
            if (typeof aVal === "string" && typeof bVal === "string") {
              return this.ascending
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }

            // 数字比较
            return this.ascending ? aVal - bVal : bVal - aVal;
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
      result = this.sortTree(roots);
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
  // 暴露到 window 对象
  window.ListToLayer = ListToLayer;

  // 同时提供一个便捷的工厂函数，兼容 V1 的调用方式
  window.new_listToTree = function (list, options = {}) {
    const instance = new ListToLayer(options);
    return instance.convert(list);
  };
}
