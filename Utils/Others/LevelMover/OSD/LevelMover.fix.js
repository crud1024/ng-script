class TreeTableManager {
  constructor(config, deps) {
    this.deps = deps || {};
    this.$NG = this.deps.$NG || window.$NG;
    this._eventHandlers = new Map();

    if (typeof config === "string") {
      config = { tables: [config] };
    } else if (Array.isArray(config)) {
      config = { tables: config };
    }

    this.config = this.mergeConfig(config);
    this.tables = new Map();
    this.currentTable = null;

    this.config.tables.forEach((tableName) => {
      this.tables.set(tableName, {
        table: null,
        rows: [],
        selectedRows: [],
        selectedIndex: -1,
        row: null,
        childRow: null,
        parentRow: null,
        flag: false,
        buttonConfigs: null,
      });
    });

    this.initButtonConfigs();

    if (document.readyState === "complete") {
      this.init();
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => this.init(), 100);
      });
    }
  }

  // ==================== 新增：清理前端特有字段 ====================
  cleanFrontendFields(obj) {
    if (!obj || typeof obj !== "object") return obj;

    // 前端特有字段黑名单（这些字段不应该保存到数据库）
    const frontendFields = [
      // treeParent 相关（各种变体）
      "treeParent",
      "treeParent__",
      "treeParent___",
      "treeParent____",
      "treeParent_____",
      "treeParent______",
      "treeParent_______",
      // 父节点引用
      "parent",
      "__parent__",
      "__parent",
      // 树形状态字段
      "treeLevel",
      "treeIndex",
      "treeLeafNode",
      "treeLastChild",
      "isExpanded",
      "myLevel",
      "leaf",
      "level",
      // 选择状态
      "checked",
      "expanded",
      "selected",
      // 其他前端字段
      "key",
      "treeParent",
      "treeParent__",
      "treeParent___",
      "treeParent____",
      // 虚拟滚动相关
      "treeLevel",
      "treeIndex",
      "treeLeafNode",
      "treeLastChild",
      "isExpanded",
      "treeParent",
      "treeParent_____",
      "treeParent______",
      // 前端元数据
      "_XDataId",
      "_XDisabled",
      "_XSelected",
      "treeParent",
      "treeParent__",
      "treeParent___",
      "treeParent____",
      "treeParent_____",
      "__parent",
      "__parent__",
      "parent",
      "treeParent",
      "treeLevel",
      "treeIndex",
      "treeLeafNode",
      "treeLastChild",
      "isExpanded",
      "myLevel",
      "leaf",
      "level",
      "checked",
      "expanded",
      "selected",
      "_XDataId",
      "_XDisabled",
      "_XSelected",
      "key",
    ];

    // 如果是数组，递归处理每个元素
    if (Array.isArray(obj)) {
      return obj.map((item) => this.cleanFrontendFields(item));
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // 跳过前端特有字段
      if (frontendFields.includes(key)) continue;

      // 跳过所有以 treeParent 开头的字段
      if (key.startsWith("treeParent") || key.startsWith("treeParent__"))
        continue;

      // 跳过以 tree 开头的字段（保留 s_tree_* 和 d1_related_*）
      if (
        key.startsWith("tree") &&
        !key.startsWith("s_tree_") &&
        !key.startsWith("d1_related_")
      ) {
        continue;
      }

      // 特殊处理 children：需要递归清理但保留其内容
      if (key === "children") {
        if (Array.isArray(value)) {
          cleaned[key] = this.cleanFrontendFields(value);
        }
        continue;
      }

      // 递归清理子对象
      if (value && typeof value === "object" && value !== null) {
        // 检查是否为日期对象
        if (value instanceof Date) {
          cleaned[key] = value;
          continue;
        }
        // 检查是否为普通对象（非数组、非特殊对象）
        if (value.constructor === Object || Array.isArray(value)) {
          cleaned[key] = this.cleanFrontendFields(value);
        } else {
          cleaned[key] = value;
        }
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  // ==================== 安全深拷贝 ====================
  safeDeepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    // 前端字段黑名单（深拷贝时跳过）
    const skipFields = [
      "treeParent",
      "treeParent__",
      "treeParent___",
      "treeParent____",
      "treeParent_____",
      "treeParent______",
      "treeParent_______",
      "parent",
      "__parent__",
      "__parent",
      "key",
      "treeLevel",
      "treeIndex",
      "treeLeafNode",
      "treeLastChild",
      "isExpanded",
      "myLevel",
      "leaf",
      "checked",
      "expanded",
      "selected",
      "_XDataId",
      "_XDisabled",
      "_XSelected",
    ];

    if (Array.isArray(obj)) {
      return obj.map((item) => this.safeDeepClone(item));
    }

    const cloned = {};
    for (const [key, value] of Object.entries(obj)) {
      // 跳过前端特有字段
      if (skipFields.includes(key)) continue;
      if (key.startsWith("treeParent")) continue;

      if (typeof value !== "function") {
        if (value && typeof value === "object" && value !== null) {
          if (value instanceof Date) {
            cloned[key] = new Date(value);
            continue;
          }
          if (value.constructor === Object || Array.isArray(value)) {
            cloned[key] = this.safeDeepClone(value);
          } else {
            cloned[key] = value;
          }
        } else {
          cloned[key] = value;
        }
      }
    }
    return cloned;
  }

  // ==================== cloneNode ====================
  cloneNode(node) {
    if (!node) return null;
    // 深拷贝并清理前端字段
    const cloned = this.safeDeepClone(node);
    return this.cleanFrontendFields(cloned);
  }

  init() {
    this.initIconOptimization();
    this.initAllTableListeners();
    this.bindToolbarEvents();
    console.log("？ TreeTableManager 初始化完成，表:", this.config.tables);
  }

  mergeConfig(config) {
    const defaultConfig = {
      tables: [],
      buttons: {
        up: {
          text: "升级",
          icon: "default_up",
          originId: "u_up",
          tooltip: "升级节点",
          action: "upgrade",
        },
        down: {
          text: "降级",
          icon: "default_down",
          originId: "u_down",
          tooltip: "降级节点",
          action: "downgrade",
        },
        rise: {
          text: "上移",
          icon: "default_rise",
          originId: "u_rise",
          tooltip: "上移节点",
          action: "moveUp",
        },
        decline: {
          text: "下移",
          icon: "default_decline",
          originId: "u_decline",
          tooltip: "下移节点",
          action: "moveDown",
        },
      },
      customIcons: {},
      buttonMapping: {},
    };

    return {
      ...defaultConfig,
      ...config,
      buttons: {
        ...defaultConfig.buttons,
        ...(config.buttons || {}),
      },
      customIcons: {
        ...defaultConfig.customIcons,
        ...(config.customIcons || {}),
      },
      buttonMapping: {
        ...defaultConfig.buttonMapping,
        ...(config.buttonMapping || {}),
      },
    };
  }

  getDefaultIcons() {
    return {
      default_up: `<svg t="1783322176013" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2271" width="1em" height="1em" fill="currentColor"><path d="M266.666667 821.333333v-469.333333h106.666666l-149.333333-149.333333-149.333333 149.333333h106.666666v469.333333m256-597.333333v85.333333h512v-85.333333h-512z m0 597.333333h512v-85.333333h-512v85.333333z m0-256h512v-85.333333h-512v85.333333z" fill="#1296db" p-id="2272"></path></svg>`,
      default_down: `<svg t="1783322243206" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2502" width="1em" height="1em" fill="currentColor"><path d="M181.333333 202.666667v469.333333h-106.666666l149.333333 149.333333 149.333333-149.333333h-106.666666v-469.333333m170.666666 0v85.333333h512v-85.333333h-512z m0 597.333333h512v-85.333333h-512v85.333333z m0-256h512v-85.333333h-512v85.333333z" fill="#1296db" p-id="2503"></path></svg>`,
      default_rise: `<svg t="1783322291972" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2733" width="1em" height="1em" fill="currentColor"><path d="M912 373.8L756.1 198.7c-12.1-9.4-22.6-13.5-35.2-13.5-13.6 0-25.8 4.7-34.4 13.3L528 373c-5.4 9.2-10.6 19.2-10.6 32.5 0 23.7 20.7 44.3 44.3 44.3 11.9 0 25.1-6 35-16l80.1-87.6v448.1c0 26.9 17.4 44.3 44.3 44.3 26.4 0 45-18.3 45-44.3v-448l80.3 87.8c11 11 20.4 15.8 31.4 15.8 26.2 0 47.6-19.9 47.6-44.3-0.1-12.1-4.7-23.1-13.4-31.8zM396.7 465.2H145.4c-25.8 0-46.8 21-46.8 46.8 0 25.9 20.9 46.8 46.8 46.8h251.3c25.8 0 46.7-21 46.7-46.8 0.1-25.9-20.9-46.8-46.7-46.8zM396.7 700.2H145.4c-25.8 0-46.8 21-46.8 46.8 0 25.9 20.9 46.8 46.8 46.8h251.3c25.8 0 46.7-21 46.7-46.8 0.1-25.8-20.9-46.8-46.7-46.8z" fill="#1296db" p-id="2734"></path></svg>`,
      default_decline: `<svg t="1783322321245" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2952" width="1em" height="1em" fill="currentColor"><path d="M912 650.2c8.7-8.7 13.3-19.6 13.3-31.8 0-24.4-21.4-44.3-47.6-44.3-11 0-20.4 4.8-31.4 15.8L766 677.6v-448c0-26.1-18.5-44.3-45-44.3-26.8 0-44.3 17.4-44.3 44.3v448.1l-80.1-87.6c-9.9-9.9-23.1-16-35-16-23.6 0-44.3 20.7-44.3 44.3 0 13.3 5.2 23.3 10.6 32.5l158.5 174.5c8.6 8.6 20.8 13.3 34.4 13.3 12.5 0 23.1-4 35.2-13.5l156-175zM396.7 558.8c25.8 0 46.7-20.9 46.7-46.8 0-25.8-20.9-46.8-46.7-46.8H145.4c-25.8 0-46.8 20.9-46.8 46.8 0 25.8 20.9 46.8 46.8 46.8h251.3zM396.7 323.8c25.8 0 46.7-21 46.7-46.8 0-25.8-20.9-46.8-46.7-46.8H145.4c-25.8 0-46.8 20.9-46.8 46.8 0 25.8 20.9 46.8 46.8 46.8h251.3z" fill="#1296db" p-id="2953"></path></svg>`,
    };
  }

  buildButtonConfigs(tableName) {
    const defaultIcons = this.getDefaultIcons();
    const buttonConfigs = {
      up: { ...this.config.buttons.up },
      down: { ...this.config.buttons.down },
      rise: { ...this.config.buttons.rise },
      decline: { ...this.config.buttons.decline },
    };

    const customIcons = this.config.customIcons;
    Object.keys(buttonConfigs).forEach((key) => {
      const config = buttonConfigs[key];
      if (customIcons[key]) {
        config.iconSvg = customIcons[key];
      } else if (config.icon && defaultIcons[config.icon]) {
        config.iconSvg = defaultIcons[config.icon];
      } else {
        config.iconSvg = defaultIcons[`default_${key}`];
      }

      if (
        this.config.buttonMapping[tableName] &&
        this.config.buttonMapping[tableName][key]
      ) {
        config.originId = this.config.buttonMapping[tableName][key];
      }
    });

    return buttonConfigs;
  }

  initButtonConfigs() {
    this.config.tables.forEach((tableName) => {
      const context = this.getTableContext(tableName);
      context.buttonConfigs = this.buildButtonConfigs(tableName);
    });
  }

  bindToolbarEvents() {
    const self = this;

    this.config.tables.forEach((tableName) => {
      const toolbarId = `toolbar_${tableName}`;
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) {
        console.warn(`？？ 工具栏 #${toolbarId} 未找到，跳过事件绑定`);
        return;
      }

      const context = this.getTableContext(tableName);
      if (!context.buttonConfigs) {
        context.buttonConfigs = this.buildButtonConfigs(tableName);
      }
      const buttonConfigs = context.buttonConfigs;

      console.log(`？？ 开始绑定工具栏事件: ${tableName}`);

      const actions = ["up", "down", "rise", "decline"];
      actions.forEach((action) => {
        const config = buttonConfigs[action];
        if (!config) {
          console.warn(`？？ 未找到配置: ${action}`);
          return;
        }

        const originId = config.originId;
        const button = toolbar.querySelector(`[originid="${originId}"]`);
        if (!button) {
          console.warn(`？？ 按钮 originid="${originId}" 未找到，跳过事件绑定`);
          return;
        }

        const oldHandler = self._eventHandlers.get(button);
        if (oldHandler) {
          button.removeEventListener("click", oldHandler);
          self._eventHandlers.delete(button);
        }

        const handler = function (e) {
          e.preventDefault();
          e.stopPropagation();
          console.log(`？？？ 点击按钮: ${tableName}.${originId} -> ${action}`);
          self.handleAction(tableName, action);
        };

        self._eventHandlers.set(button, handler);

        button.addEventListener("click", handler);
        console.log(`？ 已绑定按钮: ${tableName}.${originId} -> ${action}`);
      });
    });
  }

  handleAction(tableName, action) {
    const context = this.updateTableContext(tableName);
    const { table } = context;
    const buttonConfigs = context.buttonConfigs;
    const config = buttonConfigs[action];

    if (!config) {
      this.$NG.message("未知操作");
      return;
    }

    const allData = table.getRows();
    const selectedIndexes = table.getSelectedIndexes();

    if (selectedIndexes.length === 0) {
      this.$NG.message(config.tooltip || "请确认已选中分枝");
      return;
    }

    const selectedIndex = selectedIndexes[0];
    const selectedRow = allData[selectedIndex];

    if (!selectedRow) {
      this.$NG.message("请确认已选中分枝");
      return;
    }

    const rows = [selectedRow];
    const parentRow = selectedRow.treeParent;

    switch (action) {
      case "up":
        this.handleUpgrade(table, selectedRow, parentRow);
        break;
      case "down":
        this.handleDowngrade(table, rows, selectedRow);
        break;
      case "rise":
        this.handleMoveUp(table, selectedRow);
        break;
      case "decline":
        this.handleMoveDown(table, selectedRow);
        break;
      default:
        this.$NG.message("未知操作");
    }
  }

  preprocessTreeData(data) {
    if (!Array.isArray(data)) return data;

    const processNode = (node) => {
      if (!node || typeof node !== "object") return node;

      if (node.s_tree_pid === null || node.s_tree_pid === undefined) {
        node.s_tree_pid = "0";
      }

      if (!node.children) {
        node.children = [];
      }

      if (Array.isArray(node.children)) {
        node.children = node.children.map((child) => processNode(child));
      }

      return node;
    };

    return data.map((node) => processNode(node));
  }

  isRootNode(node) {
    if (!node) return false;
    return (
      node.s_tree_pid == "0" || node.s_tree_pid == 0 || node.s_tree_pid == null
    );
  }

  // ==================== cloneTreeStructure ====================
  cloneTreeStructure(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];
    const rootNodes = [];
    for (const node of rawData) {
      if (node && this.isRootNode(node)) {
        // 使用 cloneNode 清理数据
        const cleaned = this.cloneNode(node);
        if (cleaned) rootNodes.push(cleaned);
      }
    }
    if (rootNodes.length === 0 && rawData.length > 0) {
      const cleaned = this.cloneNode(rawData[0]);
      if (cleaned) rootNodes.push(cleaned);
    }
    return rootNodes;
  }

  // ==================== 查找上一个同级节点 ====================
  findPreviousSibling(data, currentRow) {
    if (!currentRow) return null;

    if (this.isRootNode(currentRow)) {
      const rootNodes = data.filter((node) => this.isRootNode(node));
      const currentIndex = rootNodes.findIndex(
        (node) => node.s_tree_id === currentRow.s_tree_id,
      );
      if (currentIndex > 0) {
        return rootNodes[currentIndex - 1];
      }
      return null;
    }

    const parentNode = currentRow.treeParent;
    if (
      !parentNode ||
      !parentNode.children ||
      parentNode.children.length === 0
    ) {
      return null;
    }

    const siblings = parentNode.children;
    const currentIndex = siblings.findIndex(
      (child) => child.s_tree_id === currentRow.s_tree_id,
    );
    if (currentIndex > 0) {
      return siblings[currentIndex - 1];
    }
    return null;
  }

  // ==================== handleUpgrade ====================
  handleUpgrade(table, row, parentRow) {
    if (row && this.isRootNode(row)) {
      this.$NG.message("当前已是根节点");
      return;
    }

    const targetId = row.s_tree_id;
    let data = this.cloneTreeStructure(table.getRows());

    const removeNode = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].s_tree_id === targetId) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          if (removeNode(nodes[i].children)) {
            return true;
          }
        }
      }
      return false;
    };

    removeNode(data);

    // 使用 cloneNode 清理数据
    const rowCopy = this.cloneNode(row);

    if (parentRow && this.isRootNode(parentRow)) {
      rowCopy.s_tree_pid = "0";
      // 再次清理确保没有前端字段
      const cleanedRow = this.cleanFrontendFields(rowCopy);
      data.push(cleanedRow);
    } else if (parentRow && !this.isRootNode(parentRow)) {
      rowCopy.s_tree_pid = parentRow.s_tree_pid;
      const targetParent = this.findNodeById(data, parentRow.s_tree_pid);
      if (targetParent) {
        if (!targetParent.children) {
          targetParent.children = [];
        }
        const cleanedRow = this.cleanFrontendFields(rowCopy);
        targetParent.children.push(cleanedRow);
        targetParent.isExpanded = true;
      } else {
        rowCopy.s_tree_pid = "0";
        const cleanedRow = this.cleanFrontendFields(rowCopy);
        data.push(cleanedRow);
      }
    } else {
      this.$NG.message("升级失败");
      return;
    }

    const normalizedData = this.normalizeTree(data);
    // 再次确保数据干净
    const finalData = this.cleanFrontendFields(normalizedData);
    this.applyTableData(table, finalData);
  }

  // ==================== handleDowngrade ====================
  handleDowngrade(table, rows, row) {
    if (!row) {
      this.$NG.message("请选择要降级的节点");
      return;
    }

    const data = this.cloneTreeStructure(table.getRows());

    const prevSibling = this.findPreviousSibling(data, row);

    if (!prevSibling) {
      this.$NG.message("降级失败，上方无可挂接的同级节点");
      return;
    }

    const targetId = row.s_tree_id;
    const prevSiblingId = prevSibling.s_tree_id;

    // 使用 cloneNode 清理数据
    const rowCopy = this.cloneNode(row);
    if (row.children && row.children.length > 0) {
      rowCopy.children = this.cloneNode(row.children);
    } else {
      rowCopy.children = [];
    }

    rowCopy.s_tree_pid = prevSiblingId;

    const removeNode = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].s_tree_id === targetId) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          if (removeNode(nodes[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    removeNode(data);

    const targetParent = this.findNodeById(data, prevSiblingId);
    if (!targetParent) {
      this.$NG.message("降级失败：找不到目标父节点");
      return;
    }

    if (!targetParent.children) {
      targetParent.children = [];
    }
    const cleanedRow = this.cleanFrontendFields(rowCopy);
    targetParent.children.push(cleanedRow);
    targetParent.isExpanded = true;

    const normalizedData = this.normalizeTree(data);
    const finalData = this.cleanFrontendFields(normalizedData);
    this.applyTableData(table, finalData);
  }

  // ==================== handleMoveUp ====================
  handleMoveUp(table, row) {
    const data = this.cloneTreeStructure(table.getRows());
    const targetId = row.s_tree_id;
    const selectedRow = this.findNodeById(data, targetId);

    if (!selectedRow) {
      this.$NG.message("未找到选中的行");
      return;
    }

    if (this.isRootNode(selectedRow)) {
      const rootIndex = data.findIndex((d) => d.s_tree_id === targetId);
      let prevRootIndex = -1;
      for (let i = rootIndex - 1; i >= 0; i--) {
        if (data[i] && this.isRootNode(data[i])) {
          prevRootIndex = i;
          break;
        }
      }

      if (prevRootIndex === -1) {
        this.$NG.message("上移失败，已是第一个根节点");
        return;
      }

      [data[rootIndex], data[prevRootIndex]] = [
        data[prevRootIndex],
        data[rootIndex],
      ];
    } else {
      const findInTree = (nodes) => {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            const idx = node.children.findIndex(
              (c) => c.s_tree_id === targetId,
            );
            if (idx !== -1) {
              return { parent: node, currentIndex: idx };
            }
            const found = findInTree(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const found = findInTree(data);
      if (!found) {
        this.$NG.message("上移失败，数据异常，未找到节点");
        return;
      }

      if (found.currentIndex === 0) {
        this.$NG.message("上移失败，已是该层级第一个节点");
        return;
      }

      const siblings = found.parent.children;
      [siblings[found.currentIndex - 1], siblings[found.currentIndex]] = [
        siblings[found.currentIndex],
        siblings[found.currentIndex - 1],
      ];
    }

    const normalizedData = this.normalizeTree(data);
    const finalData = this.cleanFrontendFields(normalizedData);
    this.applyTableData(table, finalData);
  }

  // ==================== handleMoveDown ====================
  handleMoveDown(table, row) {
    const data = this.cloneTreeStructure(table.getRows());
    const targetId = row.s_tree_id;
    const selectedRow = this.findNodeById(data, targetId);

    if (!selectedRow) {
      this.$NG.message("未找到选中的行");
      return;
    }

    if (this.isRootNode(selectedRow)) {
      const rootIndex = data.findIndex((d) => d.s_tree_id === targetId);
      let nextRootIndex = -1;
      for (let i = rootIndex + 1; i < data.length; i++) {
        if (data[i] && this.isRootNode(data[i])) {
          nextRootIndex = i;
          break;
        }
      }

      if (nextRootIndex === -1) {
        this.$NG.message("下移失败，已是最后一个根节点");
        return;
      }

      [data[rootIndex], data[nextRootIndex]] = [
        data[nextRootIndex],
        data[rootIndex],
      ];
    } else {
      const findInTree = (nodes) => {
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            const idx = node.children.findIndex(
              (c) => c.s_tree_id === targetId,
            );
            if (idx !== -1) {
              return { parent: node, currentIndex: idx };
            }
            const found = findInTree(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const found = findInTree(data);
      if (!found) {
        this.$NG.message("下移失败，数据异常，未找到节点");
        return;
      }

      if (found.currentIndex >= found.parent.children.length - 1) {
        this.$NG.message("下移失败，已是该层级最后一个节点");
        return;
      }

      const siblings = found.parent.children;
      [siblings[found.currentIndex + 1], siblings[found.currentIndex]] = [
        siblings[found.currentIndex],
        siblings[found.currentIndex + 1],
      ];
    }

    const normalizedData = this.normalizeTree(data);
    const finalData = this.cleanFrontendFields(normalizedData);
    this.applyTableData(table, finalData);
  }

  initIconOptimization() {
    // ... 保持原有代码不变 ...
    const self = this;

    const replaceToolbarIcons = (toolbarId, tableName) => {
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) {
        console.error(`找不到工具栏 #${toolbarId}`);
        return false;
      }

      const context = self.getTableContext(tableName);
      if (!context.buttonConfigs) {
        context.buttonConfigs = self.buildButtonConfigs(tableName);
      }
      const buttonConfigs = context.buttonConfigs;
      let replacedCount = 0;

      const actions = ["up", "down", "rise", "decline"];
      actions.forEach((action) => {
        const config = buttonConfigs[action];
        if (!config) return;

        const originId = config.originId;
        const iconSvg = config.iconSvg;
        if (!originId || !iconSvg) return;

        const button = toolbar.querySelector(`[originid="${originId}"]`);
        if (!button) {
          console.warn(`未找到 originid="${originId}" 的按钮`);
          return;
        }

        const svgElement = button.querySelector("svg");
        if (!svgElement) return;

        try {
          const parser = new DOMParser();
          const newSvgDoc = parser.parseFromString(iconSvg, "text/html");
          const newSvg = newSvgDoc.querySelector("svg");

          if (newSvg) {
            newSvg.style.display = "inline-block";
            newSvg.style.verticalAlign = "middle";
            newSvg.style.lineHeight = "1";
            svgElement.parentNode.replaceChild(newSvg, svgElement);
            replacedCount++;

            if (config.tooltip) {
              button.title = config.tooltip;
            }

            const textNode = button.childNodes[0];
            if (textNode && textNode.nodeType === 3 && config.text) {
              textNode.textContent = config.text;
            }
          }
        } catch (error) {
          console.error(`替换 originid="${originId}" 时出错:`, error);
        }
      });

      return replacedCount > 0;
    };

    const executeAlignmentFix = () => {
      self.config.tables.forEach((tableName) => {
        const toolbarId = `toolbar_${tableName}`;
        if (document.getElementById(toolbarId)) {
          replaceToolbarIcons(toolbarId, tableName);
        }
      });
    };

    executeAlignmentFix();
  }

  convertSymbols(node) {
    if (!node || typeof node !== "object") return;
    if (typeof Symbol !== "undefined" && Object.getOwnPropertySymbols) {
      const symbols = Object.getOwnPropertySymbols(node);
      symbols.forEach((sym) => {
        const desc =
          sym.description || sym.toString().replace(/^Symbol\(|\)$/g, "");
        const newKey = desc.replace(/^__/, "");
        if (!(newKey in node)) {
          node[newKey] = node[sym];
        }
      });
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child) => this.convertSymbols(child));
    }
  }

  isValidTreeStructure(tempRows) {
    if (!Array.isArray(tempRows) || tempRows.length === 0) {
      console.log("失败：不是数组或为空");
      return false;
    }

    tempRows = this.preprocessTreeData(tempRows);
    tempRows.forEach((row) => this.convertSymbols(row));

    const requiredProps = ["s_tree_id", "s_tree_pid", "treeLevel", "treeIndex"];
    for (let i = 0; i < tempRows.length; i++) {
      const node = tempRows[i];
      if (!node) return false;
      for (const prop of requiredProps) {
        if (!(prop in node)) {
          console.log(`失败：tempRows[${i}] 缺少属性 ${prop}`);
          return false;
        }
      }
    }

    const hasRoot = tempRows.some((node) => this.isRootNode(node));
    if (!hasRoot) {
      console.log("失败：没有找到根节点");
      return false;
    }

    console.log("？ 验证通过！这是一个有效的树结构");
    return true;
  }

  // ==================== normalizeTree ====================
  normalizeTree(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    // 先清理数据
    const cleanedData = this.cleanFrontendFields(data);

    const rootNodes = [];
    for (let i = 0; i < cleanedData.length; i++) {
      const node = cleanedData[i];
      if (this.isRootNode(node)) {
        node.s_tree_pid = "0";
        rootNodes.push(node);
      }
    }

    if (rootNodes.length === 0 && cleanedData.length > 0) {
      cleanedData.forEach((node) => {
        node.s_tree_pid = "0";
        rootNodes.push(node);
      });
    }

    const fixNode = (node, parent, level, index) => {
      if (!node) return;

      // 保留必要的树形字段
      node.treeLevel = level;
      node.treeIndex = index;
      node.treeParent = parent || undefined;

      if (!Array.isArray(node.children)) {
        node.children = [];
      }

      node.treeLeafNode = node.children.length === 0;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (this.isRootNode(child)) {
          child.s_tree_pid = node.s_tree_id;
        }
        fixNode(child, node, level + 1, i);
        child.treeLastChild = i === node.children.length - 1;
      }
    };

    for (let i = 0; i < rootNodes.length; i++) {
      const root = rootNodes[i];
      root.s_tree_pid = "0";
      fixNode(root, null, root.treeLevel || 0, i);
      root.treeLastChild = i === rootNodes.length - 1;
      delete root.treeParent;
    }

    return rootNodes;
  }

  getTableContext(tableName) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, {
        table: null,
        rows: [],
        selectedRows: [],
        selectedIndex: -1,
        row: null,
        childRow: null,
        parentRow: null,
        flag: false,
        buttonConfigs: null,
      });
    }
    return this.tables.get(tableName);
  }

  updateTableContext(tableName) {
    const context = this.getTableContext(tableName);
    try {
      const table = this.$NG.getCmpApi(tableName);
      context.table = table;

      const allData = table.getRows();
      const selectedIndexes = table.getSelectedIndexes();
      context.selectedIndex =
        selectedIndexes.length > 0 ? selectedIndexes[0] : 0;

      if (selectedIndexes.length > 0) {
        const idx = selectedIndexes[0];
        context.row = allData[idx] || null;
        context.rows = context.row ? [context.row] : [];
        context.selectedRows = context.rows;
      } else {
        context.row = null;
        context.rows = [];
        context.selectedRows = [];
      }

      if (context.row) {
        this.convertSymbols(context.row);
        if (!context.row.treeParent && context.row.treeParent__) {
          context.row.treeParent = context.row.treeParent__;
        }
        context.childRow = !this.isRootNode(context.row)
          ? context.row.children
          : context.row.treeLastChild;
        context.parentRow = !this.isRootNode(context.row)
          ? context.row.treeParent
          : context.row.treeParent;
      }
    } catch (error) {
      console.warn(`更新表上下文失败: ${tableName}`, error);
    }

    return context;
  }

  initAllTableListeners() {
    const self = this;
    this.config.tables.forEach((tableName) => {
      try {
        this.$NG.getCmpApi(tableName).subscribe(({ args, table }) => {
          const context = self.getTableContext(tableName);
          context.table = table;

          const allData = table.getRows();
          const selectedIndexes = table.getSelectedIndexes();
          context.selectedIndex =
            selectedIndexes.length > 0 ? selectedIndexes[0] : 0;

          if (selectedIndexes.length > 0) {
            const idx = selectedIndexes[0];
            context.row = allData[idx] || null;
            context.rows = context.row ? [context.row] : [];
            context.selectedRows = context.rows;
          } else {
            context.row = null;
            context.rows = [];
            context.selectedRows = [];
          }

          if (context.row) {
            self.convertSymbols(context.row);
            if (!context.row.treeParent && context.row.treeParent__) {
              context.row.treeParent = context.row.treeParent__;
            }
            context.childRow = !self.isRootNode(context.row)
              ? context.row.children
              : context.row.treeLastChild;
            context.parentRow = !self.isRootNode(context.row)
              ? context.row.treeParent
              : context.row.treeParent;
          }

          self.currentTable = tableName;
        }, "onCheckedChange");
      } catch (error) {
        console.warn(`初始化表监听失败: ${tableName}`, error);
      }
    });
  }

  findNodeById(data, targetId) {
    for (const node of data) {
      const found = this.findNodeInTree(node, targetId);
      if (found) return found;
    }
    return null;
  }

  findNodeInTree(node, targetId) {
    if (!node) return null;
    if (node.s_tree_id === targetId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const found = this.findNodeInTree(child, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  // ==================== applyTableData ====================
  applyTableData(table, data) {
    // 清理数据中的前端字段
    const cleanedData = this.cleanFrontendFields(data);
    const processedData = this.preprocessTreeData(cleanedData);
    table.clearSelected();
    table.clearRows();
    table.addRows(processedData);
    table.refreshView();
  }

  fixTreeData(data) {
    return this.cleanFrontendFields(this.preprocessTreeData(data));
  }

  refresh(tableName) {
    if (tableName) {
      this.updateTableContext(tableName);
      const toolbarId = `toolbar_${tableName}`;
      if (document.getElementById(toolbarId)) {
        this.initIconOptimization();
        this.bindToolbarEvents();
      }
    } else {
      this.config.tables.forEach((name) => {
        this.updateTableContext(name);
      });
      this.initIconOptimization();
      this.bindToolbarEvents();
    }
  }

  updateButtonConfig(tableName, action, config) {
    const context = this.getTableContext(tableName);
    if (context.buttonConfigs && context.buttonConfigs[action]) {
      Object.assign(context.buttonConfigs[action], config);
      this.refresh(tableName);
    }
  }

  destroy() {
    if (this._eventHandlers) {
      this._eventHandlers.forEach((handler, button) => {
        button.removeEventListener("click", handler);
      });
      this._eventHandlers.clear();
    }
    this.tables.clear();
    this.currentTable = null;
  }
}

// ==================== 导出 ====================
if (typeof window !== "undefined") {
  window.TreeTableManager = TreeTableManager;
}
