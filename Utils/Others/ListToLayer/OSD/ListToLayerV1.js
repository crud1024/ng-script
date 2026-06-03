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

    // 中文数字映射（大写）
    this.chineseUpperMap = {
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
    };

    // 中文数字映射（小写）
    this.chineseLowerMap = {
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
   * 检测是否为纯中文大写数字（如：一、二、三）
   */
  isChineseUpperNumber(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    return /^[一二三四五六七八九十]+$/.test(value.trim());
  }

  /**
   * 检测是否为纯数字（可能包含逗号、小数点）
   */
  isNumericString(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    const cleaned = value.trim().replace(/,/g, "");
    return /^-?\d+\.?\d*$/.test(cleaned);
  }

  /**
   * 检测是否为路径编码（如：01, 0101, 01-01, 01.01）
   */
  isPathCode(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    const trimmed = value.trim();
    // 排除纯数字（可能包含小数点）
    if (/^-?\d+\.?\d*$/.test(trimmed)) return false;
    // 路径格式：数字+分隔符+数字
    return /^\d+([\.\-]\d+)+$/.test(trimmed) || /^\d{2,}$/.test(trimmed);
  }

  /**
   * 解析排序值为可比较的格式
   * @param {*} value - 排序值
   * @returns {Object} { type: 'chinese'|'number'|'path'|'string', value: number|array|string }
   */
  parseSortValue(value) {
    if (value === null || value === undefined) {
      return { type: "empty", value: null };
    }

    const strValue = String(value).trim();

    if (!strValue) {
      return { type: "empty", value: null };
    }

    // 1. 纯中文大写数字（一、二、三...）
    if (this.isChineseUpperNumber(strValue)) {
      return { type: "chinese", value: this.chineseToNumber(strValue) };
    }

    // 2. 数字（可能带逗号，如 "1,000.00"）
    if (this.isNumericString(strValue)) {
      const cleaned = strValue.replace(/,/g, "");
      return { type: "number", value: parseFloat(cleaned) || 0 };
    }

    // 3. 路径编码（01, 01-01, 01.01, 0101）
    if (this.isPathCode(strValue)) {
      const parts = this.parsePathCode(strValue);
      return { type: "path", value: parts };
    }

    // 4. 其他字符串
    return { type: "string", value: strValue };
  }

  /**
   * 中文数字转阿拉伯数字
   */
  chineseToNumber(chineseNum) {
    const trimmed = chineseNum.trim();

    // 单字直接映射
    if (trimmed.length === 1) {
      return (
        this.chineseUpperMap[trimmed] || this.chineseLowerMap[trimmed] || 0
      );
    }

    // 处理"十"开头的情况（如：十二）
    if (trimmed.startsWith("十")) {
      const rest = trimmed.substring(1);
      if (rest.length === 0) return 10;
      const restNum =
        this.chineseUpperMap[rest] || this.chineseLowerMap[rest] || 0;
      return 10 + restNum;
    }

    // 处理"二十"、"三十"等
    let result = 0;
    let current = 0;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const num = this.chineseUpperMap[char] || this.chineseLowerMap[char];

      if (num === undefined) continue;

      if (num >= 10) {
        if (current === 0) current = 1;
        current *= num;
        result += current;
        current = 0;
      } else {
        current = num;
      }
    }

    return result + current;
  }

  /**
   * 解析路径编码为数字数组
   * 例如: "010101" -> [1, 1, 1], "01-02-03" -> [1, 2, 3]
   */
  parsePathCode(pathCode) {
    const trimmed = pathCode.trim();
    let parts;

    if (trimmed.includes(".")) {
      parts = trimmed.split(".");
    } else if (trimmed.includes("-")) {
      parts = trimmed.split("-");
    } else {
      // 纯数字，按2位分割
      parts = [];
      for (let i = 0; i < trimmed.length; i += 2) {
        const part = trimmed.substring(i, Math.min(i + 2, trimmed.length));
        parts.push(part);
      }
    }

    return parts.map((p) => parseInt(p, 10) || 0);
  }

  /**
   * 比较两个排序值
   * @returns {number} 比较结果
   */
  compareSortValues(a, b) {
    const parsedA = this.parseSortValue(a);
    const parsedB = this.parseSortValue(b);

    // 空值处理
    if (parsedA.type === "empty" && parsedB.type === "empty") return 0;
    if (parsedA.type === "empty") return this.ascending ? 1 : -1;
    if (parsedB.type === "empty") return this.ascending ? -1 : 1;

    // 类型优先级：数字 > 路径 > 中文 > 字符串
    const typePriority = { number: 1, path: 2, chinese: 3, string: 4 };
    const priorityA = typePriority[parsedA.type] || 5;
    const priorityB = typePriority[parsedB.type] || 5;

    if (priorityA !== priorityB) {
      return this.ascending ? priorityA - priorityB : priorityB - priorityA;
    }

    // 同类型比较
    switch (parsedA.type) {
      case "number": {
        const diff = parsedA.value - parsedB.value;
        return this.ascending ? diff : -diff;
      }

      case "path": {
        const arrA = parsedA.value;
        const arrB = parsedB.value;
        const minLen = Math.min(arrA.length, arrB.length);

        for (let i = 0; i < minLen; i++) {
          if (arrA[i] !== arrB[i]) {
            return this.ascending ? arrA[i] - arrB[i] : arrB[i] - arrA[i];
          }
        }
        // 层级少的在前
        return this.ascending
          ? arrA.length - arrB.length
          : arrB.length - arrA.length;
      }

      case "chinese": {
        const diff = parsedA.value - parsedB.value;
        return this.ascending ? diff : -diff;
      }

      case "string": {
        const cmp = parsedA.value.localeCompare(parsedB.value, "zh-CN", {
          numeric: true,
        });
        return this.ascending ? cmp : -cmp;
      }

      default:
        return 0;
    }
  }

  /**
   * 排序数组（扁平列表）
   * 先按 parentKey 分组，同组内按 sortNoKey 排序
   */
  sortFlatArray(arr) {
    if (!arr || arr.length === 0) return arr;

    return [...arr].sort((a, b) => {
      // 1. 先按父节点ID排序（空值=根节点，排前面）
      const aParent = a[this.parentKey];
      const bParent = b[this.parentKey];

      const aIsRoot =
        aParent == null || aParent === "" || aParent === 0 || aParent === "0";
      const bIsRoot =
        bParent == null || bParent === "" || bParent === 0 || bParent === "0";

      if (aIsRoot && !bIsRoot) return this.ascending ? -1 : 1;
      if (!aIsRoot && bIsRoot) return this.ascending ? 1 : -1;

      // 都是根节点或都是子节点时
      if (!aIsRoot && !bIsRoot) {
        // 先按父节点排序
        const parentCompare = String(aParent).localeCompare(String(bParent));
        if (parentCompare !== 0) {
          return this.ascending ? parentCompare : -parentCompare;
        }
      }

      // 2. 同组内按 sortNoKey 排序
      const aNo = a[this.sortNoKey];
      const bNo = b[this.sortNoKey];

      return this.compareSortValues(aNo, bNo);
    });
  }

  /**
   * 递归排序树形结构
   */
  sortTree(tree) {
    if (!tree || tree.length === 0) return tree;

    // 对当前层排序
    const sorted = [...tree].sort((a, b) => {
      const aNo = a[this.sortNoKey];
      const bNo = b[this.sortNoKey];
      return this.compareSortValues(aNo, bNo);
    });

    // 递归排序子节点
    sorted.forEach((node) => {
      if (node[this.childrenKey] && node[this.childrenKey].length > 0) {
        node[this.childrenKey] = this.sortTree(node[this.childrenKey]);
      }
    });

    return sorted;
  }

  /**
   * 转换扁平化数据为树形结构
   */
  convert(list, options = {}) {
    const tempAscending =
      options.ascending !== undefined ? options.ascending : this.ascending;

    if (!list || !Array.isArray(list) || list.length === 0) {
      return [];
    }

    // 先对扁平列表排序
    let processedList = list;
    if (this.sortKey) {
      const originalAscending = this.ascending;
      this.ascending = tempAscending;
      processedList = this.sortFlatArray(list);
      this.ascending = originalAscending;
    }

    // 构建节点映射
    const nodeMap = {};
    processedList.forEach((node) => {
      const mappedNode = this.mapFields(node);
      const nodeId = node[this.idKey];

      if (nodeId !== undefined && nodeId !== null && nodeId !== "") {
        nodeMap[nodeId] = {
          ...mappedNode,
          [this.childrenKey]: [],
        };
      }
    });

    // 构建树结构
    const roots = [];
    processedList.forEach((node) => {
      const currentNode = nodeMap[node[this.idKey]];
      if (!currentNode) return;

      const parentId = node[this.parentKey];

      // 判断是否为根节点
      const isRoot =
        parentId == null ||
        parentId === "" ||
        parentId === 0 ||
        parentId === "0" ||
        !nodeMap[parentId];

      if (isRoot) {
        roots.push(currentNode);
      } else {
        nodeMap[parentId][this.childrenKey].push(currentNode);
      }
    });

    // 排序树结构
    const originalAscending = this.ascending;
    this.ascending = tempAscending;
    const result = this.sortTree(roots);
    this.ascending = originalAscending;

    return result;
  }

  /**
   * 处理字段映射
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
