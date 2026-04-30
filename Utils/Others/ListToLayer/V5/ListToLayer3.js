/**
 * 通用列表转树形结构类
 */
class ListToLayer {
  constructor(options = {}) {
    this.defaultOptions = {
      idKey: "s_tree_id",
      parentKey: "s_tree_pid",
      childrenKey: "children",
      fieldMapping: null,
      sortKey: null,
      ascending: true,
    };
    this.config = { ...this.defaultOptions, ...options };
    this.idKey = this.config.idKey;
    this.parentKey = this.config.parentKey;
    this.childrenKey = this.config.childrenKey;
    this.fieldMapping = this.config.fieldMapping;
    this.sortKey = this.config.sortKey;
    this.ascending = this.config.ascending;
  }

  isPathCode(value) {
    if (typeof value !== "string") return false;
    return /^\d+$/.test(value);
  }

  parsePathCode(pathCode) {
    const parts = [];
    for (let i = 0; i < pathCode.length; i += 2) {
      const part = pathCode.substring(i, i + 2);
      parts.push(parseInt(part, 10));
    }
    return parts;
  }

  comparePathCodes(a, b) {
    const aParts = this.parsePathCode(a);
    const bParts = this.parsePathCode(b);

    // 单层路径直接数值比较
    if (aParts.length === 1 && bParts.length === 1) {
      const aNum = aParts[0];
      const bNum = bParts[0];
      return this.ascending ? aNum - bNum : bNum - aNum;
    }

    const minLen = Math.min(aParts.length, bParts.length);
    for (let i = 0; i < minLen; i++) {
      if (aParts[i] !== bParts[i]) {
        return this.ascending ? aParts[i] - bParts[i] : bParts[i] - aParts[i];
      }
    }
    return this.ascending
      ? aParts.length - bParts.length
      : bParts.length - aParts.length;
  }

  sortArray(arr) {
    if (!this.sortKey) return arr;

    const sortFn = (a, b) => {
      let aVal = a[this.sortKey];
      let bVal = b[this.sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return this.ascending ? 1 : -1;
      if (bVal == null) return this.ascending ? -1 : 1;

      const aStr = String(aVal);
      const bStr = String(bVal);
      const aIsPathCode = this.isPathCode(aStr);
      const bIsPathCode = this.isPathCode(bStr);

      if (aIsPathCode && bIsPathCode) {
        return this.comparePathCodes(aStr, bStr);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return this.ascending ? aVal - bVal : bVal - aVal;
      }

      return this.ascending
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    };

    return [...arr].sort(sortFn);
  }

  sortTree(tree) {
    if (!this.sortKey) return tree;
    const sortedTree = this.sortArray(tree);
    sortedTree.forEach((node) => {
      if (node[this.childrenKey] && node[this.childrenKey].length > 0) {
        node[this.childrenKey] = this.sortTree(node[this.childrenKey]);
      }
    });
    return sortedTree;
  }

  isRootNode(parentId) {
    return (
      parentId === null ||
      parentId === undefined ||
      parentId === "" ||
      parentId === "0"
    );
  }

  convert(list, options = {}) {
    const tempSortKey =
      options.sortKey !== undefined ? options.sortKey : this.sortKey;
    const tempAscending =
      options.ascending !== undefined ? options.ascending : this.ascending;

    if (!list || !Array.isArray(list) || list.length === 0) {
      return [];
    }

    const nodeMap = list.reduce((acc, node) => {
      const mappedNode = this.mapFields(node);
      const nodeId = node[this.idKey];
      if (nodeId !== undefined && nodeId !== null) {
        acc[nodeId] = { ...mappedNode, [this.childrenKey]: [] };
      }
      return acc;
    }, {});

    const roots = [];

    list.forEach((node) => {
      const currentNode = nodeMap[node[this.idKey]];
      const parentId = node[this.parentKey];
      if (!currentNode) return;

      if (this.isRootNode(parentId)) {
        roots.push(currentNode);
      } else if (nodeMap[parentId]) {
        nodeMap[parentId][this.childrenKey].push(currentNode);
      } else {
        roots.push(currentNode);
      }
    });

    // 排序处理
    let result = roots;
    if (tempSortKey) {
      const originalAscending = this.ascending;
      this.ascending = tempAscending;
      // 对根节点数组排序
      result = this.sortArray(roots);
      // 递归排序子节点
      result.forEach((node) => {
        if (node[this.childrenKey] && node[this.childrenKey].length > 0) {
          node[this.childrenKey] = this.sortTree(node[this.childrenKey]);
        }
      });
      this.ascending = originalAscending;
    }

    return result;
  }

  mapFields(node) {
    if (!this.fieldMapping) return { ...node };
    const mappedNode = {};
    const specialKeys = [this.childrenKey];
    Object.keys(node).forEach((key) => {
      if (this.fieldMapping[key] !== undefined) {
        mappedNode[this.fieldMapping[key]] = node[key];
      } else if (!specialKeys.includes(key)) {
        mappedNode[key] = node[key];
      }
    });
    return mappedNode;
  }
}

if (typeof window !== "undefined") {
  window.ListToLayer = ListToLayer;
  window.new_listToTree = function (list, options = {}) {
    const instance = new ListToLayer(options);
    return instance.convert(list);
  };
}
