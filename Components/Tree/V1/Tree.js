var TREE_STYLE = [
  ".zjky-tree{font-size:13px;color:#666;line-height:1.6;}",
  ".zjky-tree-empty{padding:8px;color:#999;}",
  ".zjky-tree-node-row{display:flex;align-items:center;min-height:26px;padding:4px 8px;border-radius:2px;cursor:pointer;user-select:none;gap:4px;}",
  ".zjky-tree-node-row:hover{background:#F5F7FA;color:#333;}",
  ".zjky-tree-node-row--selected{background:#E8F0FE;color:#3877FC;font-weight:600;}",
  ".zjky-tree-node-row--disabled{color:#BBB;cursor:not-allowed;}",
  ".zjky-tree-switcher{width:16px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}",
  ".zjky-tree-switcher--leaf{visibility:hidden;cursor:default;}",
  ".zjky-tree-switcher svg{display:block;}",
  ".zjky-tree-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  ".zjky-tree-children{overflow:hidden;}",
].join("\n");

var TREE_ICONS = {
  collapse:
    '<svg t="1786946036448" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4172" width="15" height="15"><path d="M928 0A96 96 0 0 1 1024 96v832a96 96 0 0 1-96 96h-832A96 96 0 0 1 0 928v-832A96 96 0 0 1 96 0h832z m0 96h-832v832h832v-832z m-176 368a48 48 0 1 1 0 96h-480a48 48 0 0 1 0-96h480z" fill="#1296db" p-id="4173"></path></svg>',
  expand:
    '<svg t="1786946198133" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9501" width="15" height="15"><path d="M910.160382 1023.941721H113.81048c-62.795807 0-113.790081-50.8952-113.790081-113.790081V113.795909c0-62.894881 50.8952-113.790081 113.790081-113.790081h796.35573c62.795807 0 113.790081 50.8952 113.790082 113.790081v796.355731C1023.956292 973.040693 973.055264 1023.941721 910.160382 1023.941721L910.160382 1023.941721z" fill="#1296db" p-id="9502" data-spm-anchor-id="a313x.search_index.0.i3.1de73a81re4ER7" class="selected"></path><path d="M967.058337 170.688036c0-62.795807-50.8952-113.790081-113.790081-113.790081H170.708434c-62.795807 0-113.790081 50.8952-113.790081 113.790081v682.658896c0 62.795807 50.8952 113.790081 113.790081 113.790081h682.658896c62.789979 0 113.790081-50.889372 113.790082-113.790081V170.688036H967.058337z" fill="#1296db" p-id="9503" data-spm-anchor-id="a313x.search_index.0.i2.1de73a81re4ER7" class="selected"></path><path d="M767.970861 540.3703H540.384871v227.585991c0 15.694581-12.704859 28.39944-28.39944 28.39944-15.700409 0-28.39944-12.704859-28.39944-28.39944v-227.585991H256.000001c-15.700409 0-28.39944-12.704859-28.39944-28.39944 0-15.700409 12.699031-28.39944 28.39944-28.39944h227.58599V255.98543c0-15.700409 12.699031-28.39944 28.39944-28.39944 15.694581 0 28.39944 12.699031 28.39944 28.39944V483.57142h227.58599c15.694581 0 28.39944 12.699031 28.39944 28.39944C796.370301 527.665441 783.665442 540.3703 767.970861 540.3703z" fill="#FFFFFF" p-id="9504"></path></svg>',
};

class FormSidebarTree {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {Array} options.data 树数据
   * @param {number} options.defaultExpandLevel 默认展开层级，0 表示全部折叠
   * @param {Array} options.defaultExpandedKeys 额外展开的节点 id 数组
   * @param {string} options.selectedKey 初始选中节点 id
   * @param {string} options.emptyText 空数据提示
   * @param {Function} options.onSelect 节点选中回调
   */
  constructor(options = {}) {
    this._data = Array.isArray(options.data) ? options.data : [];
    this._defaultExpandLevel =
      typeof options.defaultExpandLevel === "number"
        ? options.defaultExpandLevel
        : 0;
    this._defaultExpandedKeys = Array.isArray(options.defaultExpandedKeys)
      ? options.defaultExpandedKeys
      : [];
    this._selectedKey =
      options.selectedKey != null ? options.selectedKey : null;
    this._emptyText = options.emptyText || "暂无数据";
    this._onSelect =
      typeof options.onSelect === "function" ? options.onSelect : null;
    this._expandedKeys = new Set();
    this._elementMap = new Map();
    this._root = null;

    this._ensureStyle();
    this._initExpandedState(this._data, 1);
  }

  render() {
    this._elementMap = new Map();
    this._root = document.createElement("div");
    this._root.className = "zjky-tree";
    this._renderNodes(this._data, this._root, 1);
    return this._root;
  }

  getElement() {
    if (!this._root) {
      this.render();
    }
    return this._root;
  }

  mount(container) {
    if (container) {
      container.appendChild(this.getElement());
    }
    return this;
  }

  getExpandedKeys() {
    return Array.from(this._expandedKeys);
  }

  getSelectedKey() {
    return this._selectedKey;
  }

  setData(data) {
    this._data = Array.isArray(data) ? data : [];
    this._expandedKeys = new Set();
    this._initExpandedState(this._data, 1);

    if (!this._root || !this._root.parentElement) {
      return;
    }

    var parent = this._root.parentElement;
    var oldRoot = this._root;
    var nextRoot = this.render();
    parent.replaceChild(nextRoot, oldRoot);
  }

  toggleNode(id, force) {
    this._toggle(id, force);
  }

  selectNode(id) {
    this._select(id, null);
  }

  _ensureStyle() {
    if (document.getElementById("zjky-tree-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "zjky-tree-style";
    style.textContent = TREE_STYLE;
    var head = document.head || document.documentElement;
    if (head) {
      head.appendChild(style);
    }
  }

  _initExpandedState(nodes, level) {
    if (!Array.isArray(nodes)) {
      return;
    }

    nodes.forEach((node) => {
      if (!node || !node.children || !node.children.length) {
        return;
      }

      var expandedByLevel = level <= this._defaultExpandLevel;
      var expandedByKey = this._defaultExpandedKeys.indexOf(node.id) >= 0;
      if (node.expanded === true || expandedByLevel || expandedByKey) {
        if (node.expanded !== false) {
          this._expandedKeys.add(node.id);
        }
      }

      this._initExpandedState(node.children, level + 1);
    });
  }

  _renderNodes(nodes, parent, level) {
    if (!nodes.length) {
      var empty = document.createElement("div");
      empty.className = "zjky-tree-empty";
      empty.textContent = this._emptyText;
      parent.appendChild(empty);
      return;
    }

    nodes.forEach((node) => {
      parent.appendChild(this._renderNode(node, level));
    });
  }

  _renderNode(node, level) {
    var nodeElement = document.createElement("div");
    nodeElement.className = "zjky-tree-node";

    var row = document.createElement("div");
    row.className = "zjky-tree-node-row";
    row.style.paddingLeft = (level - 1) * 16 + 6 + "px";
    row.setAttribute("data-key", node.id);

    var hasChildren = Array.isArray(node.children) && node.children.length > 0;
    var switcher = document.createElement("span");
    switcher.className = "zjky-tree-switcher";
    if (!hasChildren) {
      switcher.classList.add("zjky-tree-switcher--leaf");
    }

    var title = document.createElement("span");
    title.className = "zjky-tree-title";
    title.textContent = node.label == null ? String(node.id) : node.label;

    row.appendChild(switcher);
    row.appendChild(title);

    var childrenContainer = document.createElement("div");
    childrenContainer.className = "zjky-tree-children";
    if (hasChildren) {
      this._renderNodes(node.children, childrenContainer, level + 1);
      childrenContainer.style.display = this._expandedKeys.has(node.id)
        ? ""
        : "none";
      this._setSwitcherIcon(switcher, this._expandedKeys.has(node.id));
      switcher.addEventListener(
        "click",
        function (event) {
          event.stopPropagation();
          this._toggle(node.id);
        }.bind(this),
      );
    }

    if (node.disabled) {
      row.classList.add("zjky-tree-node-row--disabled");
    } else if (node.selectable !== false) {
      row.setAttribute("tabindex", "0");
    }

    nodeElement.appendChild(row);
    nodeElement.appendChild(childrenContainer);

    this._elementMap.set(node.id, {
      node: node,
      row: row,
      children: childrenContainer,
      switcher: switcher,
    });

    row.addEventListener(
      "click",
      function (event) {
        this._select(node.id, event);
      }.bind(this),
    );

    row.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this._select(node.id, event);
        }
      }.bind(this),
    );

    return nodeElement;
  }

  _setSwitcherIcon(switcher, expanded) {
    switcher.innerHTML = expanded ? TREE_ICONS.collapse : TREE_ICONS.expand;
  }

  _findNode(nodes, id) {
    if (!Array.isArray(nodes)) {
      return null;
    }

    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        return nodes[i];
      }
      var found = this._findNode(nodes[i].children, id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  _toggle(id, force) {
    var entry = this._elementMap.get(id);
    var node = this._findNode(this._data, id);
    if (!entry || !node || !node.children || !node.children.length) {
      return;
    }

    var expanded =
      typeof force === "boolean" ? force : !this._expandedKeys.has(id);
    if (expanded) {
      this._expandedKeys.add(id);
    } else {
      this._expandedKeys.delete(id);
    }

    entry.children.style.display = expanded ? "" : "none";
    this._setSwitcherIcon(entry.switcher, expanded);
  }

  _select(id, event) {
    var node = this._findNode(this._data, id);
    if (!node || node.disabled || node.selectable === false) {
      return;
    }

    this._selectedKey = id;
    this._elementMap.forEach(function (entry, entryId) {
      if (entryId === id) {
        entry.row.classList.add("zjky-tree-node-row--selected");
      } else {
        entry.row.classList.remove("zjky-tree-node-row--selected");
      }
    });

    if (this._onSelect) {
      this._onSelect(node, event);
    }
  }
}

if (typeof window !== "undefined") {
  window.FormSidebarTree = FormSidebarTree;
}

// ==================== 调用 ====================

// const tree = new FormSidebarTree({
//   data: [
//     {
//       id: "root",
//       label: "WBS清单",
//       children: [{ id: "child-1", label: "子节点 1" }],
//     },
//   ],
//   defaultExpandLevel: 1,
//   onSelect(node) {
//     console.log("选中：", node);
//   },
// });
