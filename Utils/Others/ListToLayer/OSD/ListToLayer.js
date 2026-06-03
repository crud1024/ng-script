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
   * @param {string} options.sortNoKey - 排序号键名，默认's_tree_no'
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
      sortNoKey: "s_tree_no",
      fieldMapping: null,
      sortKey: null,
      ascending: true,
    };

    // 合并配置
    this.config = { ...this.defaultOptions, ...options };
    this.idKey = this.config.idKey;
    this.parentKey = this.config.parentKey;
    this.childrenKey = this.config.childrenKey;
    this.sortNoKey = this.config.sortNoKey;
    this.fieldMapping = this.config.fieldMapping;
    this.sortKey = this.config.sortKey;
    this.ascending = this.config.ascending;

    // 中文数字映射
    this.chineseNumMap = {
      零: 0,
      〇: 0,
      一: 1,
      壹: 1,
      二: 2,
      贰: 2,
      三: 3,
      叁: 3,
      四: 4,
      肆: 4,
      五: 5,
      伍: 5,
      六: 6,
      陆: 6,
      七: 7,
      柒: 7,
      八: 8,
      捌: 8,
      九: 9,
      玖: 9,
      十: 10,
      拾: 10,
      百: 100,
      佰: 100,
      千: 1000,
      仟: 1000,
    };
  }

  /**
   * 检测字符串是否为路径编码格式
   * 支持: 01, 0101, 01-01, 01.01.02, 1.1, 1-1, 01.01.02.02
   * @param {*} value - 检测的值
   * @returns {boolean}
   */
  isPathCode(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    // 匹配路径格式：纯数字路径(01, 0101)、带分隔符(01-01, 01.01.02)、数字路径(1.1, 1-1)
    return /^(\d+)([\.\-]\d+)*$/.test(value.trim());
  }

  /**
   * 检测字符串是否为中文数字
   * @param {*} value - 检测的值
   * @returns {boolean}
   */
  isChineseNumber(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    return /^[零〇一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾佰仟百]+$/.test(
      value.trim(),
    );
  }

  /**
   * 中文数字转阿拉伯数字
   * @param {string} chineseNum - 中文数字
   * @returns {number} 阿拉伯数字
   */
  chineseToNumber(chineseNum) {
    const trimmed = chineseNum.trim();

    // 直接映射一位数字
    if (trimmed.length === 1) {
      return this.chineseNumMap[trimmed] || 0;
    }

    let result = 0;
    let current = 0;
    let section = 0;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const num = this.chineseNumMap[char];

      if (num === undefined) continue;

      if (num >= 10) {
        // 处理十、百、千等位权
        if (current === 0) current = 1;
        current *= num;
        result += current;
        current = 0;
      } else {
        current = num;
      }
    }

    result += current;

    // 处理"十二"这种格式
    if (trimmed.startsWith("十")) {
      result += 10;
    }

    return result;
  }

  /**
   * 将路径编码转换为数字数组用于比较
   * @param {string} pathCode - 路径编码，如 "01.01.02" 或 "1-1-1"
   * @returns {number[]} 数字数组，如 [1, 1, 2]
   */
  parsePathCode(pathCode) {
    const trimmed = pathCode.trim();
    let parts;

    // 按分隔符分割
    if (trimmed.includes(".")) {
      parts = trimmed.split(".");
    } else if (trimmed.includes("-")) {
      parts = trimmed.split("-");
    } else {
      // 纯数字路径，按固定长度或智能分割
      parts = this.splitByHierarchy(trimmed);
    }

    return parts.map((p) => parseInt(p, 10) || 0);
  }

  /**
   * 智能分割路径编码（识别层级规律）
   * 例如: "010101" -> ["01", "01", "01"]
   *      "0102" -> ["01", "02"]
   * @param {string} code - 路径编码
   * @returns {string[]}
   */
  splitByHierarchy(code) {
    const parts = [];

    // 如果长度是2的倍数，按每2位分割
    if (code.length % 2 === 0 && /^(\d{2})+$/.test(code)) {
      for (let i = 0; i < code.length; i += 2) {
        parts.push(code.substring(i, i + 2));
      }
      return parts;
    }

    // 其他情况按2位分割
    let remaining = code;
    while (remaining.length > 0) {
      const partLen = remaining.length >= 2 ? 2 : remaining.length;
      parts.push(remaining.substring(0, partLen));
      remaining = remaining.substring(partLen);
    }

    return parts;
  }

  /**
   * 解析 s_tree_no 为可比较的数值
   * @param {*} value - s_tree_no 的值
   * @returns {*} 解析后的值（数字、数字数组或原字符串）
   */
  parseSortNo(value) {
    if (value === null || value === undefined) return null;

    const strValue = String(value).trim();

    // 中文数字
    if (this.isChineseNumber(strValue)) {
      return this.chineseToNumber(strValue);
    }

    // 路径编码（含点、横线分隔或纯数字路径）
    if (this.isPathCode(strValue)) {
      return this.parsePathCode(strValue);
    }

    // 纯数字
    if (/^\d+$/.test(strValue)) {
      return parseInt(strValue, 10);
    }

    // 尝试解析为浮点数（如 1.5 这种单层小数）
    if (/^\d+\.\d+$/.test(strValue)) {
      return parseFloat(strValue);
    }

    // 其他情况返回原字符串
    return strValue;
  }

  /**
   * 比较两个值，支持多种类型
   * @param {*} a - 值A
   * @param {*} b - 值B
   * @returns {number} 比较结果
   */
  compareValues(a, b) {
    // 处理 null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return this.ascending ? 1 : -1;
    if (b == null) return this.ascending ? -1 : 1;

    const parsedA = this.parseSortNo(a);
    const parsedB = this.parseSortNo(b);

    // 两个都是数字
    if (typeof parsedA === "number" && typeof parsedB === "number") {
      return this.ascending ? parsedA - parsedB : parsedB - parsedA;
    }

    // 两个都是数组（路径编码）
    if (Array.isArray(parsedA) && Array.isArray(parsedB)) {
      const minLen = Math.min(parsedA.length, parsedB.length);
      for (let i = 0; i < minLen; i++) {
        if (parsedA[i] !== parsedB[i]) {
          return this.ascending
            ? parsedA[i] - parsedB[i]
            : parsedB[i] - parsedA[i];
        }
      }
      // 前缀相同，层级少的排在前面
      return this.ascending
        ? parsedA.length - parsedB.length
        : parsedB.length - parsedA.length;
    }

    // 数组与数字：数字转成单元素数组比较
    if (Array.isArray(parsedA) && typeof parsedB === "number") {
      return this.ascending ? parsedA[0] - parsedB : parsedB - parsedA[0];
    }
    if (typeof parsedA === "number" && Array.isArray(parsedB)) {
      return this.ascending ? parsedA - parsedB[0] : parsedB[0] - parsedA;
    }

    // 其他情况转为字符串比较
    const strA = String(a);
    const strB = String(b);
    return this.ascending
      ? strA.localeCompare(strB, undefined, { numeric: true })
      : strB.localeCompare(strA, undefined, { numeric: true });
  }

  /**
   * 比较两个路径编码值
   * @param {*} a - 值A
   * @param {*} b - 值B
   * @returns {number} 比较结果
   */
  comparePathCodes(a, b) {
    const aIsPath = this.isPathCode(a);
    const bIsPath = this.isPathCode(b);

    if (aIsPath && bIsPath) {
      return this.compareValues(a, b);
    }

    if (aIsPath !== bIsPath) {
      return aIsPath ? -1 : 1;
    }

    return 0;
  }

  /**
   * 按层级排序数组
   * @param {Array} arr - 需要排序的数组
   * @returns {Array} 排序后的数组
   */
  sortArray(arr) {
    if (!this.sortKey) return arr;

    const sortFn =
      typeof this.sortKey === "function"
        ? this.sortKey
        : (a, b) => {
            // 优先按父节点分组排序（保证同父节点的节点在一起）
            const aParentId = a[this.parentKey];
            const bParentId = b[this.parentKey];

            // 空值（根节点）排在前面
            if (aParentId == null && bParentId == null) {
              return this.compareValues(a[this.sortNoKey], b[this.sortNoKey]);
            }
            if (aParentId == null) return this.ascending ? -1 : 1;
            if (bParentId == null) return this.ascending ? 1 : -1;

            // 按父节点排序
            const parentCompare = String(aParentId).localeCompare(
              String(bParentId),
            );
            if (parentCompare !== 0)
              return this.ascending ? parentCompare : -parentCompare;

            // 父节点相同时，按 s_tree_no 排序
            return this.compareValues(a[this.sortNoKey], b[this.sortNoKey]);
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
    // 临时覆盖配置
    const tempSortKey =
      options.sortKey !== undefined ? options.sortKey : this.sortKey;
    const tempAscending =
      options.ascending !== undefined ? options.ascending : this.ascending;

    // 如果没有数据，返回空数组
    if (!list || !Array.isArray(list) || list.length === 0) {
      return [];
    }

    // 先对原始列表排序
    let processedList = list;
    if (tempSortKey) {
      const originalAscending = this.ascending;
      this.ascending = tempAscending;
      processedList = this.sortArray(list);
      this.ascending = originalAscending;
    }

    // 使用 reduce 构建节点映射
    const nodeMap = processedList.reduce((acc, node) => {
      const mappedNode = this.mapFields(node);
      const nodeId = node[this.idKey];

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

    // 构建父子关系
    processedList.forEach((node) => {
      const currentNode = nodeMap[node[this.idKey]];
      const parentId = node[this.parentKey];

      if (!currentNode) return;

      if (
        parentId !== undefined &&
        parentId !== null &&
        parentId !== 0 &&
        parentId !== "0" &&
        nodeMap[parentId]
      ) {
        // 有父节点且父节点存在
        nodeMap[parentId][this.childrenKey].push(currentNode);
      } else {
        // 作为根节点
        roots.push(currentNode);
      }
    });

    // 对树结构递归排序
    let result = roots;
    if (tempSortKey) {
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

// 全局暴露
if (typeof window !== "undefined") {
  window.ListToLayer = ListToLayer;
  window.new_listToTree = function (list, options = {}) {
    const instance = new ListToLayer(options);
    return instance.convert(list);
  };
}
