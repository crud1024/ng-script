// 网页布局工具 - 纯JavaScript实现（白蓝色系优化版）
class WebLayoutBuilder {
  constructor(containerId, options = {}) {
    // 默认配置
    this.config = {
      horizontalUnits: options.horizontalUnits || 24, // 水平方向最小单元数
      verticalUnits: options.verticalUnits || null, // 垂直方向单元数，null表示自动计算
      style: options.style || "rectangle", // 布局样式：'rectangle'或'rounded'
      showTitles: options.showTitles || false, // 是否显示标题
      containerWidth: options.containerWidth || "100%", // 容器宽度
      containerHeight: options.containerHeight || "600px", // 容器高度
      theme: options.theme || "light-blue", // 主题：'light-blue'
      containerMargin: options.containerMargin || 10, // 整体布局外边距（像素）
      itemMargin: options.itemMargin || 5, // 各区域外边距（像素）
    };

    // 白蓝色系主题配置
    this.themeColors = {
      "light-blue": {
        containerBg: "#f8fafc",
        itemBg: "#ffffff",
        itemBorder: "#e2e8f0",
        itemHoverBorder: "#3b82f6",
        titleBg: "#eff6ff",
        titleText: "#1e40af",
        contentText: "#334155",
        handleColor: "#3b82f6",
        handleHover: "#2563eb",
        gridLine: "#e2e8f0",
        shadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        shadowHover:
          "0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)",
      },
    };

    // 布局项数据
    this.layoutItems = [];

    // 拖拽状态
    this.dragging = null;
    this.activeHandles = new Set(); // 跟踪活动的拖拽手柄

    // DOM元素引用
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`找不到ID为"${containerId}"的容器元素`);
    }

    // 单元格尺寸
    this.cellWidth = 0;
    this.cellHeight = 0;

    // 网格线容器
    this.gridContainer = null;

    // 初始化
    this.init();
  }

  // 初始化布局工具
  init() {
    this.setupContainer();
    this.setupGrid();
    this.setupEventListeners();
    this.render();
  }

  // 设置容器样式
  setupContainer() {
    const theme = this.themeColors[this.config.theme];

    this.container.style.position = "relative";
    this.container.style.width = this.config.containerWidth;
    this.container.style.height = this.config.containerHeight;
    this.container.style.border = "1px solid " + theme.itemBorder;
    this.container.style.overflow = "hidden";
    this.container.style.backgroundColor = theme.containerBg;
    this.container.style.borderRadius = "8px";

    // 设置整体布局外边距
    this.container.style.padding = `${this.config.containerMargin}px`;
    this.container.style.boxSizing = "border-box";
  }

  // 设置网格系统
  setupGrid() {
    // 如果没有指定垂直单元数，根据容器高度自动计算
    if (!this.config.verticalUnits) {
      this.calculateVerticalUnits();
    }

    // 计算单元格尺寸
    this.calculateCellDimensions();

    // 创建网格线
    this.createGridLines();
  }

  // 计算垂直方向单元数
  calculateVerticalUnits() {
    const containerHeight =
      this.container.clientHeight - this.config.containerMargin * 2;
    // 假设每个单元格高度至少为30px
    this.config.verticalUnits = Math.floor(containerHeight / 30);
  }

  // 计算单元格尺寸
  calculateCellDimensions() {
    const containerWidth =
      this.container.clientWidth - this.config.containerMargin * 2;
    const containerHeight =
      this.container.clientHeight - this.config.containerMargin * 2;

    this.cellWidth = containerWidth / this.config.horizontalUnits;
    this.cellHeight = containerHeight / this.config.verticalUnits;
  }

  // 创建网格线
  createGridLines() {
    // 移除旧的网格线
    if (this.gridContainer) {
      this.gridContainer.remove();
    }

    const theme = this.themeColors[this.config.theme];
    this.gridContainer = document.createElement("div");
    this.gridContainer.className = "layout-grid-lines";
    this.gridContainer.style.position = "absolute";
    this.gridContainer.style.top = `${this.config.containerMargin}px`;
    this.gridContainer.style.left = `${this.config.containerMargin}px`;
    this.gridContainer.style.width = `calc(100% - ${
      this.config.containerMargin * 2
    }px)`;
    this.gridContainer.style.height = `calc(100% - ${
      this.config.containerMargin * 2
    }px)`;
    this.gridContainer.style.pointerEvents = "none";
    this.gridContainer.style.zIndex = "0";

    // 创建垂直网格线
    for (let i = 1; i < this.config.horizontalUnits; i++) {
      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.left = `${i * this.cellWidth}px`;
      line.style.top = "0";
      line.style.width = "1px";
      line.style.height = "100%";
      line.style.backgroundColor = theme.gridLine;
      line.style.opacity = "0.3";
      this.gridContainer.appendChild(line);
    }

    // 创建水平网格线
    for (let i = 1; i < this.config.verticalUnits; i++) {
      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.left = "0";
      line.style.top = `${i * this.cellHeight}px`;
      line.style.width = "100%";
      line.style.height = "1px";
      line.style.backgroundColor = theme.gridLine;
      line.style.opacity = "0.3";
      this.gridContainer.appendChild(line);
    }

    this.container.appendChild(this.gridContainer);
  }

  // 设置事件监听器
  setupEventListeners() {
    // 窗口大小改变时重新计算
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.calculateCellDimensions();
        this.createGridLines();
        this.render();
      }, 200);
    };
    window.addEventListener("resize", handleResize);

    // 拖拽事件
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // 添加拖拽手柄事件委托
    this.container.addEventListener(
      "mouseover",
      this.handleHandleHover.bind(this)
    );
    this.container.addEventListener(
      "mouseout",
      this.handleHandleOut.bind(this)
    );
  }

  // 添加布局项
  addItem(options = {}) {
    const defaultItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: 1, // 水平起始位置（基于单元）
      y: 1, // 垂直起始位置（基于单元）
      width: 4, // 宽度（单元数）
      height: 4, // 高度（单元数）
      title: "新区块",
      content: "这里是内容区域",
      minWidth: 2, // 最小宽度（单元数）
      minHeight: 2, // 最小高度（单元数）
      zIndex: 1, // z-index层级
    };

    const item = { ...defaultItem, ...options };

    // 验证位置和尺寸
    this.validateAndAdjustItem(item);

    // 设置z-index，确保新添加的项在最上层
    item.zIndex =
      this.layoutItems.length > 0
        ? Math.max(...this.layoutItems.map((i) => i.zIndex)) + 1
        : 1;

    this.layoutItems.push(item);
    this.render();

    return item.id;
  }

  // 验证和调整布局项
  validateAndAdjustItem(item) {
    item.x = Math.max(
      1,
      Math.min(item.x, this.config.horizontalUnits - item.width + 1)
    );
    item.y = Math.max(
      1,
      Math.min(item.y, this.config.verticalUnits - item.height + 1)
    );
    item.width = Math.max(
      item.minWidth,
      Math.min(item.width, this.config.horizontalUnits - item.x + 1)
    );
    item.height = Math.max(
      item.minHeight,
      Math.min(item.height, this.config.verticalUnits - item.y + 1)
    );
  }

  // 移除布局项
  removeItem(itemId) {
    const index = this.layoutItems.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      this.layoutItems.splice(index, 1);
      this.render();
      return true;
    }
    return false;
  }

  // 更新布局项
  updateItem(itemId, updates) {
    const item = this.layoutItems.find((item) => item.id === itemId);
    if (item) {
      Object.assign(item, updates);
      this.validateAndAdjustItem(item);
      this.render();
      return true;
    }
    return false;
  }

  // 获取布局项
  getItem(itemId) {
    return this.layoutItems.find((item) => item.id === itemId);
  }

  // 获取所有布局项
  getAllItems() {
    return [...this.layoutItems];
  }

  // 更新配置
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);

    // 重新计算网格
    if (
      newConfig.horizontalUnits ||
      newConfig.containerWidth ||
      newConfig.verticalUnits ||
      newConfig.containerHeight ||
      newConfig.containerMargin ||
      newConfig.itemMargin
    ) {
      this.setupGrid();
    }

    this.render();
  }

  // 获取配置
  getConfig() {
    return { ...this.config };
  }

  // 渲染布局
  render() {
    // 清空容器（保留网格线）
    const children = Array.from(this.container.children);
    children.forEach((child) => {
      if (!child.classList.contains("layout-grid-lines")) {
        child.remove();
      }
    });

    // 按z-index排序并渲染
    const sortedItems = [...this.layoutItems].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    sortedItems.forEach((item) => {
      this.renderItem(item);
    });
  }

  // 渲染单个布局项
  renderItem(item) {
    const theme = this.themeColors[this.config.theme];
    const itemElement = document.createElement("div");
    itemElement.id = item.id;
    itemElement.className = "layout-item";

    // 计算实际位置和尺寸（考虑外边距）
    const itemMargin = this.config.itemMargin;
    const containerMargin = this.config.containerMargin;

    // 计算实际坐标：如果是边缘位置，外边距为0；否则为配置的外边距
    const marginLeft = item.x === 1 ? 0 : itemMargin;
    const marginTop = item.y === 1 ? 0 : itemMargin;
    const marginRight =
      item.x + item.width - 1 === this.config.horizontalUnits ? 0 : itemMargin;
    const marginBottom =
      item.y + item.height - 1 === this.config.verticalUnits ? 0 : itemMargin;

    // 计算实际尺寸（减去外边距）
    const actualWidth =
      item.width * this.cellWidth - (marginLeft + marginRight);
    const actualHeight =
      item.height * this.cellHeight - (marginTop + marginBottom);

    // 计算实际位置（考虑容器外边距和项外边距）
    const actualLeft =
      containerMargin + (item.x - 1) * this.cellWidth + marginLeft;
    const actualTop =
      containerMargin + (item.y - 1) * this.cellHeight + marginTop;

    // 设置位置和尺寸
    itemElement.style.position = "absolute";
    itemElement.style.left = `${actualLeft}px`;
    itemElement.style.top = `${actualTop}px`;
    itemElement.style.width = `${actualWidth}px`;
    itemElement.style.height = `${actualHeight}px`;
    itemElement.style.backgroundColor = theme.itemBg;
    itemElement.style.border = `1px solid ${theme.itemBorder}`;
    itemElement.style.boxSizing = "border-box";
    itemElement.style.transition = "all 0.2s ease";
    itemElement.style.zIndex = item.zIndex;

    // 应用样式和阴影
    if (this.config.style === "rounded") {
      itemElement.style.borderRadius = "8px";
    }
    itemElement.style.boxShadow = theme.shadow;

    // 鼠标悬停效果
    itemElement.addEventListener("mouseenter", () => {
      itemElement.style.boxShadow = theme.shadowHover;
      itemElement.style.borderColor = theme.itemHoverBorder;
    });

    itemElement.addEventListener("mouseleave", () => {
      if (!this.dragging || this.dragging.itemId !== item.id) {
        itemElement.style.boxShadow = theme.shadow;
        itemElement.style.borderColor = theme.itemBorder;
      }
    });

    // 添加标题（如果启用）
    if (this.config.showTitles) {
      const titleElement = document.createElement("div");
      titleElement.className = "layout-item-title";
      titleElement.textContent = item.title;
      titleElement.style.padding = "12px 16px";
      titleElement.style.backgroundColor = theme.titleBg;
      titleElement.style.borderBottom = `1px solid ${theme.itemBorder}`;
      titleElement.style.color = theme.titleText;
      titleElement.style.fontWeight = "600";
      titleElement.style.fontSize = "14px";
      titleElement.style.overflow = "hidden";
      titleElement.style.textOverflow = "ellipsis";
      titleElement.style.whiteSpace = "nowrap";
      titleElement.style.userSelect = "none";

      itemElement.appendChild(titleElement);
    }

    // 添加内容区域
    const contentElement = document.createElement("div");
    contentElement.className = "layout-item-content";
    contentElement.textContent = item.content || "";
    contentElement.style.padding = "16px";
    contentElement.style.height = this.config.showTitles
      ? `calc(100% - ${this.getTitleHeight()}px)`
      : "100%";
    contentElement.style.overflow = "auto";
    contentElement.style.fontSize = "13px";
    contentElement.style.color = theme.contentText;
    contentElement.style.lineHeight = "1.6";
    contentElement.style.userSelect = "none";

    itemElement.appendChild(contentElement);

    // 添加拖拽调整手柄
    this.addResizeHandles(
      itemElement,
      item,
      marginLeft,
      marginTop,
      marginRight,
      marginBottom
    );

    // 添加到容器
    this.container.appendChild(itemElement);
  }

  // 获取标题高度
  getTitleHeight() {
    return 45; // 固定高度
  }

  // 添加拖拽调整手柄
  addResizeHandles(
    itemElement,
    item,
    marginLeft,
    marginTop,
    marginRight,
    marginBottom
  ) {
    const handleSize = 6;
    const handleOffset = -handleSize / 2;
    const theme = this.themeColors[this.config.theme];

    // 计算手柄的实际位置（考虑外边距）
    const itemWidth = item.width * this.cellWidth - (marginLeft + marginRight);
    const itemHeight =
      item.height * this.cellHeight - (marginTop + marginBottom);

    const createHandle = (direction) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${direction}`;
      handle.dataset.itemId = item.id;
      handle.dataset.direction = direction;
      handle.dataset.marginLeft = marginLeft;
      handle.dataset.marginTop = marginTop;
      handle.dataset.marginRight = marginRight;
      handle.dataset.marginBottom = marginBottom;

      // 公共样式
      handle.style.position = "absolute";
      handle.style.backgroundColor = theme.handleColor;
      handle.style.opacity = "0";
      handle.style.transition = "opacity 0.2s ease, background-color 0.2s ease";
      handle.style.zIndex = "100";

      // 方向特定样式
      switch (direction) {
        case "bottom":
          handle.style.bottom = `${handleOffset}px`;
          handle.style.left = "0";
          handle.style.width = "100%";
          handle.style.height = `${handleSize}px`;
          handle.style.cursor = "ns-resize";
          break;
        case "right":
          handle.style.right = `${handleOffset}px`;
          handle.style.top = "0";
          handle.style.width = `${handleSize}px`;
          handle.style.height = "100%";
          handle.style.cursor = "ew-resize";
          break;
        case "corner":
          handle.style.right = `${handleOffset}px`;
          handle.style.bottom = `${handleOffset}px`;
          handle.style.width = `${handleSize * 2}px`;
          handle.style.height = `${handleSize * 2}px`;
          handle.style.cursor = "nwse-resize";
          handle.style.borderRadius = "2px";
          break;
      }

      // 悬停效果
      handle.addEventListener("mouseover", () => {
        if (!this.dragging) {
          handle.style.opacity = "1";
          handle.style.backgroundColor = theme.handleHover;
          this.activeHandles.add(handle);
        }
      });

      handle.addEventListener("mouseout", () => {
        if (!this.dragging) {
          handle.style.opacity = "0";
          handle.style.backgroundColor = theme.handleColor;
          this.activeHandles.delete(handle);
        }
      });

      return handle;
    };

    // 添加手柄
    itemElement.appendChild(createHandle("bottom"));
    itemElement.appendChild(createHandle("right"));
    itemElement.appendChild(createHandle("corner"));
  }

  // 处理手柄悬停
  handleHandleHover(event) {
    const handle = event.target.closest(".resize-handle");
    if (handle && !this.dragging) {
      handle.style.opacity = "1";
      const theme = this.themeColors[this.config.theme];
      handle.style.backgroundColor = theme.handleHover;
      this.activeHandles.add(handle);
    }
  }

  // 处理手柄移出
  handleHandleOut(event) {
    const handle = event.target.closest(".resize-handle");
    if (handle && !this.dragging && this.activeHandles.has(handle)) {
      handle.style.opacity = "0";
      const theme = this.themeColors[this.config.theme];
      handle.style.backgroundColor = theme.handleColor;
      this.activeHandles.delete(handle);
    }
  }

  // 鼠标按下事件处理
  handleMouseDown(event) {
    const handle = event.target.closest(".resize-handle");
    if (!handle) return;

    event.preventDefault();
    event.stopPropagation();

    const itemId = handle.dataset.itemId;
    const direction = handle.dataset.direction;
    const marginLeft = parseInt(handle.dataset.marginLeft) || 0;
    const marginTop = parseInt(handle.dataset.marginTop) || 0;
    const marginRight = parseInt(handle.dataset.marginRight) || 0;
    const marginBottom = parseInt(handle.dataset.marginBottom) || 0;

    const item = this.layoutItems.find((item) => item.id === itemId);

    if (!item) return;

    // 查找相邻区域用于联动调整
    const adjacentItems = this.findAdjacentItems(item, direction);

    this.dragging = {
      itemId,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      item: { ...item },
      margins: { marginLeft, marginTop, marginRight, marginBottom },
      adjacentItems: adjacentItems.map((adjItem) => ({
        id: adjItem.id,
        original: { ...adjItem },
      })),
      containerRect: this.container.getBoundingClientRect(),
    };

    // 将当前项提到最前
    this.bringToFront(itemId);

    // 设置拖拽状态
    const itemElement = document.getElementById(itemId);
    if (itemElement) {
      const theme = this.themeColors[this.config.theme];
      itemElement.style.boxShadow = theme.shadowHover;
      itemElement.style.borderColor = theme.handleHover;
      itemElement.style.zIndex = 1000;

      // 显示所有手柄
      const handles = itemElement.querySelectorAll(".resize-handle");
      handles.forEach((h) => {
        h.style.opacity = "1";
        h.style.backgroundColor = theme.handleHover;
      });
    }
  }

  // 查找相邻区域
  findAdjacentItems(item, direction) {
    const adjacentItems = [];

    this.layoutItems.forEach((otherItem) => {
      if (otherItem.id === item.id) return;

      // 检查是否相邻
      switch (direction) {
        case "right":
          // 检查右侧相邻
          if (
            Math.abs(item.x + item.width - otherItem.x) <= 1 &&
            this.isVerticallyOverlapping(item, otherItem)
          ) {
            adjacentItems.push(otherItem);
          }
          break;
        case "bottom":
          // 检查底部相邻
          if (
            Math.abs(item.y + item.height - otherItem.y) <= 1 &&
            this.isHorizontallyOverlapping(item, otherItem)
          ) {
            adjacentItems.push(otherItem);
          }
          break;
        case "corner":
          // 检查右侧和底部相邻
          if (
            (Math.abs(item.x + item.width - otherItem.x) <= 1 &&
              this.isVerticallyOverlapping(item, otherItem)) ||
            (Math.abs(item.y + item.height - otherItem.y) <= 1 &&
              this.isHorizontallyOverlapping(item, otherItem))
          ) {
            adjacentItems.push(otherItem);
          }
          break;
      }
    });

    return adjacentItems;
  }

  // 检查垂直重叠
  isVerticallyOverlapping(item1, item2) {
    return !(
      item1.y >= item2.y + item2.height || item2.y >= item1.y + item1.height
    );
  }

  // 检查水平重叠
  isHorizontallyOverlapping(item1, item2) {
    return !(
      item1.x >= item2.x + item2.width || item2.x >= item1.x + item1.width
    );
  }

  // 将项目提到最前面
  bringToFront(itemId) {
    const item = this.layoutItems.find((item) => item.id === itemId);
    if (item) {
      const maxZIndex = Math.max(...this.layoutItems.map((i) => i.zIndex));
      item.zIndex = maxZIndex + 1;
    }
  }

  // 鼠标移动事件处理
  handleMouseMove(event) {
    if (!this.dragging) return;

    event.preventDefault();

    const item = this.layoutItems.find(
      (item) => item.id === this.dragging.itemId
    );
    if (!item) return;

    // 计算鼠标移动距离
    const deltaX = event.clientX - this.dragging.startX;
    const deltaY = event.clientY - this.dragging.startY;

    // 转换为网格单元
    const gridDeltaX = Math.round(deltaX / this.cellWidth);
    const gridDeltaY = Math.round(deltaY / this.cellHeight);

    // 保存原始值用于回滚
    const originalItem = { ...item };

    // 根据拖拽方向调整尺寸
    let adjusted = false;
    switch (this.dragging.direction) {
      case "bottom":
        adjusted = this.adjustHeight(item, gridDeltaY);
        break;
      case "right":
        adjusted = this.adjustWidth(item, gridDeltaX);
        break;
      case "corner":
        adjusted = this.adjustBoth(item, gridDeltaX, gridDeltaY);
        break;
    }

    if (adjusted) {
      // 更新相邻区域的联动
      this.adjustAdjacentItems(item, originalItem);

      // 重新渲染所有受影响的项
      this.renderAffectedItems(item);
    }
  }

  // 调整高度
  adjustHeight(item, deltaY) {
    const newHeight = this.dragging.item.height + deltaY;
    const marginTop = this.dragging.margins.marginTop;
    const marginBottom = this.dragging.margins.marginBottom;

    // 计算实际可用高度（考虑外边距）
    const totalMargin = marginTop + marginBottom;

    if (
      newHeight >= item.minHeight &&
      item.y + newHeight <= this.config.verticalUnits + 1
    ) {
      item.height = newHeight;
      return true;
    }
    return false;
  }

  // 调整宽度
  adjustWidth(item, deltaX) {
    const newWidth = this.dragging.item.width + deltaX;
    const marginLeft = this.dragging.margins.marginLeft;
    const marginRight = this.dragging.margins.marginRight;

    // 计算实际可用宽度（考虑外边距）
    const totalMargin = marginLeft + marginRight;

    if (
      newWidth >= item.minWidth &&
      item.x + newWidth <= this.config.horizontalUnits + 1
    ) {
      item.width = newWidth;
      return true;
    }
    return false;
  }

  // 同时调整宽度和高度
  adjustBoth(item, deltaX, deltaY) {
    const newWidth = this.dragging.item.width + deltaX;
    const newHeight = this.dragging.item.height + deltaY;
    const marginLeft = this.dragging.margins.marginLeft;
    const marginRight = this.dragging.margins.marginRight;
    const marginTop = this.dragging.margins.marginTop;
    const marginBottom = this.dragging.margins.marginBottom;

    if (
      newWidth >= item.minWidth &&
      newHeight >= item.minHeight &&
      item.x + newWidth <= this.config.horizontalUnits + 1 &&
      item.y + newHeight <= this.config.verticalUnits + 1
    ) {
      item.width = newWidth;
      item.height = newHeight;
      return true;
    }
    return false;
  }

  // 调整相邻区域
  adjustAdjacentItems(mainItem, originalMainItem) {
    this.dragging.adjacentItems.forEach((adjacent) => {
      const adjItem = this.layoutItems.find((item) => item.id === adjacent.id);
      if (!adjItem) return;

      const original = adjacent.original;

      switch (this.dragging.direction) {
        case "right":
          // 右侧区域向左移动并调整宽度
          if (adjItem.x === originalMainItem.x + originalMainItem.width) {
            const widthChange = mainItem.width - originalMainItem.width;
            adjItem.x += widthChange;
            adjItem.width = Math.max(
              adjItem.minWidth,
              adjItem.width - widthChange
            );
          }
          break;

        case "bottom":
          // 底部区域向上移动并调整高度
          if (adjItem.y === originalMainItem.y + originalMainItem.height) {
            const heightChange = mainItem.height - originalMainItem.height;
            adjItem.y += heightChange;
            adjItem.height = Math.max(
              adjItem.minHeight,
              adjItem.height - heightChange
            );
          }
          break;

        case "corner":
          // 处理右侧相邻
          if (adjItem.x === originalMainItem.x + originalMainItem.width) {
            const widthChange = mainItem.width - originalMainItem.width;
            adjItem.x += widthChange;
            adjItem.width = Math.max(
              adjItem.minWidth,
              adjItem.width - widthChange
            );
          }
          // 处理底部相邻
          if (adjItem.y === originalMainItem.y + originalMainItem.height) {
            const heightChange = mainItem.height - originalMainItem.height;
            adjItem.y += heightChange;
            adjItem.height = Math.max(
              adjItem.minHeight,
              adjItem.height - heightChange
            );
          }
          break;
      }
    });
  }

  // 渲染受影响的项
  renderAffectedItems(changedItem) {
    // 收集所有需要重新渲染的项
    const affectedItems = new Set([changedItem.id]);

    // 添加相邻项
    this.dragging.adjacentItems.forEach((adj) => {
      affectedItems.add(adj.id);
    });

    // 重新渲染受影响的项目
    affectedItems.forEach((itemId) => {
      const item = this.layoutItems.find((i) => i.id === itemId);
      if (item) {
        // 移除旧元素
        const oldElement = document.getElementById(itemId);
        if (oldElement) {
          oldElement.remove();
        }
        // 渲染新元素
        this.renderItem(item);
      }
    });
  }

  // 鼠标释放事件处理
  handleMouseUp() {
    if (!this.dragging) return;

    const theme = this.themeColors[this.config.theme];

    // 移除拖拽状态
    const itemElement = document.getElementById(this.dragging.itemId);
    if (itemElement) {
      itemElement.style.boxShadow = theme.shadow;
      itemElement.style.borderColor = theme.itemBorder;

      // 隐藏手柄
      const handles = itemElement.querySelectorAll(".resize-handle");
      handles.forEach((h) => {
        h.style.opacity = "0";
        h.style.backgroundColor = theme.handleColor;
      });

      // 清除活动手柄集合
      this.activeHandles.clear();
    }

    const itemId = this.dragging.itemId;
    this.dragging = null;

    // 触发尺寸改变事件
    this.dispatchEvent("itemResized", { itemId });
  }

  // 清空布局
  clear() {
    this.layoutItems = [];
    this.render();
  }

  // 导出布局配置
  exportLayout() {
    return {
      config: { ...this.config },
      items: this.layoutItems.map((item) => ({ ...item })),
      version: "2.0",
    };
  }

  // 导入布局配置
  importLayout(layoutData) {
    if (layoutData.config) {
      this.updateConfig(layoutData.config);
    }

    if (layoutData.items && Array.isArray(layoutData.items)) {
      this.layoutItems = layoutData.items.map((item) => ({ ...item }));
      this.render();
    }
  }

  // 事件系统
  eventHandlers = {};

  // 添加事件监听
  on(eventName, handler) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
  }

  // 移除事件监听
  off(eventName, handler) {
    if (!this.eventHandlers[eventName]) return;

    const index = this.eventHandlers[eventName].indexOf(handler);
    if (index !== -1) {
      this.eventHandlers[eventName].splice(index, 1);
    }
  }

  // 触发事件
  dispatchEvent(eventName, data) {
    if (!this.eventHandlers[eventName]) return;

    this.eventHandlers[eventName].forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }

  // 销毁布局工具
  destroy() {
    // 移除事件监听器
    const children = Array.from(this.container.children);
    children.forEach((child) => child.remove());

    // 清空容器
    this.container.innerHTML = "";

    // 清除引用
    this.layoutItems = [];
    this.eventHandlers = {};
    this.activeHandles.clear();
  }
}

// 创建布局工具的工厂函数
function createLayoutTool(containerId, options = {}) {
  return new WebLayoutBuilder(containerId, options);
}

// 导出API
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WebLayoutBuilder, createLayoutTool };
}

// 示例使用方式
/*
    // 1. 创建布局工具实例
    const layoutTool = createLayoutTool('layout-container', {
        horizontalUnits: 24,
        verticalUnits: 18,
        style: 'rounded',
        showTitles: true,
        containerMargin: 10,  // 整体外边距
        itemMargin: 5         // 区域外边距
    });
    
    // 2. 添加布局区域（会自动考虑外边距）
    layoutTool.addItem({
        x: 1, y: 1,
        width: 6, height: 18,
        title: '侧边栏',
        content: '左侧区域紧贴整体边缘，没有左边距'
    });
    
    layoutTool.addItem({
        x: 7, y: 1,
        width: 12, height: 12,
        title: '主内容区',
        content: '这个区域与其他区域有5px间距'
    });
    
    layoutTool.addItem({
        x: 7, y: 13,
        width: 12, height: 6,
        title: '页脚',
        content: '底部区域紧贴整体下边缘'
    });
    
    // 3. 更新外边距配置
    layoutTool.updateConfig({
        itemMargin: 8,        // 增加区域间距
        containerMargin: 15   // 增加整体外边距
    });
    */

// 示例使用方式
// // 1. 创建布局工具实例
// const layoutTool = createLayoutTool("u:a89e876b2acd_ctx", {
//   horizontalUnits: 24, // 水平24个单元
//   verticalUnits: 18, // 垂直18个单元
//   style: "rectangle", // 矩形样式
//   showTitles: false, // 不显示标题
// });

// // 2. 添加布局项
// const item1Id = layoutTool.addItem({
//   x: 1,
//   y: 1,
//   width: 6,
//   height: 6,
//   title: "侧边栏",
//   content: "这里是侧边栏内容",
// });

// const item2Id = layoutTool.addItem({
//   x: 7,
//   y: 1,
//   width: 18,
//   height: 6,
//   title: "主内容区",
//   content: "这里是主内容区域",
// });

// // 3. 更新配置
// layoutTool.updateConfig({
//   style: "rounded", // 切换为圆角矩形
//   showTitles: true, // 显示标题
// });

// // 4. 监听事件
// layoutTool.on("itemResized", (data) => {
//   console.log("布局项尺寸已改变:", data.itemId);
// });

// // 5. 导出布局
// // const layoutConfig = layoutTool.exportLayout();

// // 6. 导入布局
// // layoutTool.importLayout(layoutConfig);
