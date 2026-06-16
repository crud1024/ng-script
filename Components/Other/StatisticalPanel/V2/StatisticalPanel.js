// 列表页面统计面板组件（纯数据驱动，调用方传入 data 即可）
function initSummaryPanel(config) {
  const {
    // ========== DOM 相关 ==========
    containerSelector = ".layout-flex-column.udp-layout",
    queryCtxSelector = ".query-ctx",

    // ========== 面板数据（必传） ==========
    data = null, // [{ title, items: [{ name, value, onClick? }] }]

    // ========== 外观选项 ==========
    options = {
      collapsible: true,
      defaultCollapsed: false,
      itemWidth: "160px",
      itemHeight: "60px",
      gap: "12px",
    },
  } = config;

  // ========== 获取 / 创建容器 ==========
  const layoutContainer = document.querySelector(containerSelector);
  if (!layoutContainer) {
    console.error(`未找到选择器为 "${containerSelector}" 的元素`);
    return;
  }

  const queryCtx = layoutContainer.querySelector(queryCtxSelector);
  if (!queryCtx) {
    console.error(`未找到选择器为 "${queryCtxSelector}" 的元素`);
    return;
  }

  const tablePanel = queryCtx.nextElementSibling;
  if (!tablePanel) {
    console.error("未找到查询面板后面的表格面板元素");
    return;
  }

  // 创建汇总 div 并插入
  const summaryDiv = document.createElement("div");
  summaryDiv.id = "summary-panel";
  summaryDiv.style.height = "auto";
  summaryDiv.style.minHeight = "120px";
  summaryDiv.style.marginTop = "3px";
  summaryDiv.style.marginBottom = "3px";
  queryCtx.parentNode.insertBefore(summaryDiv, tablePanel);

  // 注入样式（只注入一次）
  addStyles(options);

  // ==================== 核心渲染 ====================

  /**
   * 用 rowsConfig 渲染面板
   * @param {Array} rowsConfig  [{ title, items: [{ name, value, onClick? }] }]
   */
  function render(rowsConfig) {
    if (!summaryDiv) return;

    summaryDiv.innerHTML = "";

    const itemsContainer = document.createElement("div");
    itemsContainer.className = "summary-items-container";

    (rowsConfig || []).forEach((rowConfig, index) => {
      const row = createDisplayRow(rowConfig, index, options);
      itemsContainer.appendChild(row);
    });

    summaryDiv.appendChild(itemsContainer);
  }

  // 初始渲染
  if (data) {
    render(data);
  }

  // ==================== 公开 API ====================

  /**
   * 更新面板数据（替换整个面板内容）
   * @param {Array} newData  和 config.data 格式一致
   */
  function setData(newData) {
    render(newData);
  }

  /**
   * 获取当前渲染的数据（不保存副本，仅作调试标记）
   */
  function getData() {
    // 由于没在内部存储，返回 null；使用者应自行管理数据。
    // 如需获取 panel 当前 DOM 状态，可自行读取 summaryDiv
    return null;
  }

  return {
    setData: setData,
    getData: getData,
    /** 返回面板 DOM，方便外部做更细粒度的操作 */
    getPanelElement: function () {
      return summaryDiv;
    },
  };
}

// ==================== 内部工具函数 ====================

/**
 * 创建一行
 */
function createDisplayRow(rowConfig, index, settings) {
  const row = document.createElement("div");
  row.className = "summary-row";
  row.dataset.rowIndex = index;

  const header = document.createElement("div");
  header.className = "row-header";

  const titleElem = document.createElement("div");
  titleElem.className = "row-title";
  titleElem.textContent = rowConfig.title;
  header.appendChild(titleElem);

  if (settings.collapsible) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "collapse-toggle";
    toggleBtn.innerHTML = settings.defaultCollapsed ? "▶" : "▼";
    toggleBtn.title = settings.defaultCollapsed ? "展开" : "折叠";

    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleRowCollapse(row, toggleBtn);
    });

    header.appendChild(toggleBtn);
    titleElem.style.cursor = "pointer";
    titleElem.addEventListener("click", function () {
      toggleRowCollapse(row, toggleBtn);
    });
  }

  row.appendChild(header);

  const itemsWrapper = document.createElement("div");
  itemsWrapper.className = "row-items-wrapper";

  if (settings.defaultCollapsed) {
    itemsWrapper.style.display = "none";
    row.classList.add("collapsed");
  }

  (rowConfig.items || []).forEach(function (itemConfig) {
    const item = createDisplayItem(itemConfig, settings);
    itemsWrapper.appendChild(item);
  });

  row.appendChild(itemsWrapper);
  return row;
}

/**
 * 切换行折叠
 */
function toggleRowCollapse(row, toggleBtn) {
  const itemsWrapper = row.querySelector(".row-items-wrapper");
  const isCollapsed = itemsWrapper.style.display === "none";

  if (isCollapsed) {
    itemsWrapper.style.display = "flex";
    toggleBtn.innerHTML = "▼";
    toggleBtn.title = "折叠";
    row.classList.remove("collapsed");
  } else {
    itemsWrapper.style.display = "none";
    toggleBtn.innerHTML = "▶";
    toggleBtn.title = "展开";
    row.classList.add("collapsed");
  }
}

/**
 * 创建单项
 */
function createDisplayItem(config, settings) {
  const item = document.createElement("div");
  item.className = "summary-item";
  item.style.width = settings.itemWidth;
  item.style.height = settings.itemHeight;

  const nameElem = document.createElement("div");
  nameElem.className = "item-name";
  nameElem.textContent = config.name;

  const valueElem = document.createElement("div");
  valueElem.className = "item-value";
  valueElem.textContent = config.value;

  if (config.onClick) {
    item.style.cursor = "pointer";
    item.addEventListener("click", config.onClick);
  }

  item.appendChild(nameElem);
  item.appendChild(valueElem);
  return item;
}

/**
 * 注入样式
 */
function addStyles(settings) {
  if (document.getElementById("summary-panel-styles")) return;

  const style = document.createElement("style");
  style.id = "summary-panel-styles";
  style.textContent = `
    .summary-items-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: #ffffff;
      min-height: 120px;
      box-sizing: border-box;
      margin: 0px 0px 0;
      border: 1px solid #e1e5e9;
    }
    .summary-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #1a5fb4;
    }
    .row-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a5fb4;
    }
    .collapse-toggle {
      background: none;
      border: none;
      font-size: 12px;
      color: #666;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 3px;
      transition: background-color 0.2s;
    }
    .collapse-toggle:hover {
      background-color: #e9ecef;
    }
    .row-items-wrapper {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      gap: ${settings.gap};
      padding: 8px;
      transition: all 0.3s ease;
    }
    .summary-item {
      border: 1px solid #1a5fb4;
      border-radius: 6px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 8px;
      box-sizing: border-box;
      box-shadow: 0 1px 3px rgba(26, 95, 180, 0.1);
      transition: all 0.3s ease;
    }
    .summary-item:hover {
      box-shadow: 0 2px 6px rgba(26, 95, 180, 0.2);
      transform: translateY(-1px);
      background: #e3f2fd;
    }
    .item-name {
      font-size: 12px;
      color: #1a5fb4;
      font-weight: 600;
      text-align: center;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .item-value {
      font-size: 16px;
      color: #1c3b6b;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
    }
    .summary-row.collapsed {
      margin-bottom: 0;
    }
    .summary-row.collapsed .row-header {
      background: #f1f3f4;
    }
    @media (max-width: 768px) {
      .summary-items-container {
        gap: 6px;
        padding: 8px;
        margin: 0 5px;
      }
      .summary-row {
        gap: 6px;
      }
      .row-header {
        padding: 3px 6px;
      }
      .row-title {
        font-size: 13px;
      }
      .row-items-wrapper {
        gap: 8px;
        padding: 6px;
      }
      .summary-item {
        padding: 6px;
      }
      .item-name {
        font-size: 11px;
      }
      .item-value {
        font-size: 14px;
      }
    }
    @media (max-width: 480px) {
      .row-items-wrapper {
        gap: 6px;
        justify-content: space-around;
      }
      .summary-item {
        min-width: 140px;
        flex: 1;
        max-width: 45%;
      }
    }
  `;
  document.head.appendChild(style);
}

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = { initSummaryPanel };
}

if (typeof window !== "undefined") {
  window.initSummaryPanel = initSummaryPanel;
}
