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
   * @param {Array} options.sortRules - 排序规则，默认按 parentKey 分组后按 idKey 排序
   * @param {boolean} options.enableSort - 是否启用排序，默认true
   */
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      idKey: "s_tree_id",
      parentKey: "s_tree_pid",
      childrenKey: "children",
      fieldMapping: null,
      enableSort: true,
      sortRules: null, // 自定义排序规则
    };

    // 合并配置
    this.config = { ...this.defaultOptions, ...options };
    this.idKey = this.config.idKey;
    this.parentKey = this.config.parentKey;
    this.childrenKey = this.config.childrenKey;
    this.fieldMapping = this.config.fieldMapping;
    this.enableSort = this.config.enableSort;
    this.sortRules = this.config.sortRules;
  }

  /**
   * 判断是否为根节点
   * @param {*} parentId - 父节点ID
   * @returns {boolean}
   */
  isRootNode(parentId) {
    return (
      parentId === null ||
      parentId === undefined ||
      parentId === 0 ||
      parentId === "0"
    );
  }

  /**
   * 默认排序函数：先按 parentKey 分组，再按 idKey 排序
   * @param {Array} nodes - 需要排序的节点数组
   * @returns {Array} 排序后的数组
   */
  defaultSort(nodes) {
    // 先按 parentKey 排序（null/0 排在最前面）
    const sorted = [...nodes].sort((a, b) => {
      const aParent = a[this.parentKey];
      const bParent = b[this.parentKey];

      // 判断是否为根节点
      const aIsRoot = this.isRootNode(aParent);
      const bIsRoot = this.isRootNode(bParent);

      // 如果一个是根节点一个不是，根节点排在前面
      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;

      // 如果都是根节点或都不是根节点，按 parentKey 排序
      if (aParent !== bParent) {
        // 处理 null/0 的情况
        const aVal = aIsRoot ? 0 : aParent;
        const bVal = bIsRoot ? 0 : bParent;
        return aVal - bVal;
      }

      // parentKey 相同的情况下，按 idKey 排序
      const aId = a[this.idKey];
      const bId = b[this.idKey];
      return aId - bId;
    });

    return sorted;
  }

  /**
   * 使用自定义排序规则排序
   * @param {Array} nodes - 需要排序的节点数组
   * @returns {Array} 排序后的数组
   */
  customSort(nodes) {
    if (!this.sortRules || !Array.isArray(this.sortRules)) {
      return this.defaultSort(nodes);
    }

    return [...nodes].sort((a, b) => {
      for (const rule of this.sortRules) {
        const { key, order = "asc" } = rule;
        const aVal = a[key];
        const bVal = b[key];

        // 处理 null/undefined 值
        if (aVal == null && bVal == null) continue;
        if (aVal == null) return order === "asc" ? -1 : 1;
        if (bVal == null) return order === "asc" ? 1 : -1;

        // 比较值
        let compareResult = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          compareResult = aVal.localeCompare(bVal);
        } else {
          compareResult = aVal - bVal;
        }

        if (compareResult !== 0) {
          return order === "asc" ? compareResult : -compareResult;
        }
      }
      return 0;
    });
  }

  /**
   * 对树形结构进行递归排序
   * @param {Array} tree - 树形结构数组
   * @returns {Array} 排序后的树形结构
   */
  sortTree(tree) {
    if (!this.enableSort) return tree;

    // 先对当前层排序
    const sortedTree = this.sortRules
      ? this.customSort(tree)
      : this.defaultSort(tree);

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
    const tempEnableSort =
      options.enableSort !== undefined ? options.enableSort : this.enableSort;

    // 如果没有数据，返回空数组
    if (!list || !Array.isArray(list) || list.length === 0) {
      return [];
    }

    // 使用 reduce 构建节点映射
    const nodeMap = list.reduce((acc, node) => {
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
    list.forEach((node) => {
      const currentNode = nodeMap[node[this.idKey]];
      const parentId = node[this.parentKey];

      // 如果当前节点不存在（可能 ID 无效），跳过
      if (!currentNode) return;

      // 查找父节点（根节点的 parentId 为 null 或 0）
      if (!this.isRootNode(parentId) && nodeMap[parentId]) {
        // 将当前节点添加到父节点的 children 中
        nodeMap[parentId][this.childrenKey].push(currentNode);
      } else {
        // 没有父节点或父节点不存在，作为根节点
        roots.push(currentNode);
      }
    });

    // 对树进行排序
    let result = roots;
    if (tempEnableSort) {
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
