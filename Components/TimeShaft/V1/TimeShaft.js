/**
 * 纯JS时间轴组件（Ant Design风格修复版）
 * 图标在时间轴线上，事件信息无背景色
 * 节点样式：实心-已办，空心-未办，空心旋转-待办
 */
class TimelineComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`容器元素 #${containerId} 不存在`);
    }

    // 默认配置
    this.defaultOptions = {
      mode: "vertical", // vertical, horizontal
      position: "alternate", // alternate, left, right
      lineColor: "#f0f0f0", // 时间轴线条颜色
      lineWidth: 2, // 时间轴线条宽度
      dotSize: 10, // 节点大小
      dotBorderWidth: 2, // 节点边框宽度
      pending: null, // 待办项
      reverse: false, // 是否倒序
      dateFormat: "YYYY-MM-DD", // 日期格式
      showTooltips: true, // 显示工具提示
      clickable: true, // 是否可点击
      animation: true, // 动画效果
      maxEvents: 50, // 最大事件数
      timelinePosition: "center", // 时间轴位置
      completedStyle: "filled", // 完成状态样式: filled, outline, icon
      incompleteStyle: "outline", // 未完成状态样式: filled, outline, icon
      pendingStyle: "spinning", // 待办状态样式: spinning, outline, icon
    };

    this.options = { ...this.defaultOptions, ...options };
    this.events = [];
    this.tooltip = null;
    this._initialized = false;
    this._eventHandlers = new Map();

    this._init();
  }

  _init() {
    this._createTooltip();
    this._addStyles();
    this.render();
    this._initialized = true;
  }

  _createTooltip() {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "timeline-tooltip";
    this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            max-width: 250px;
            word-wrap: break-word;
            white-space: normal;
            line-height: 1.5;
        `;
    document.body.appendChild(this.tooltip);
  }

  _addStyles() {
    const styleId = "timeline-component-fixed-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    // 修复的关键CSS - 确保图标在时间轴线上
    style.textContent = `
            /* 时间轴容器 */
            .timeline-container {
                position: relative;
                width: 100%;
                margin: 0 auto;
            }
            
            /* 时间轴 */
            .timeline {
                margin: 0;
                padding: 20px 0;
                list-style: none;
                position: relative;
            }
            
            /* 垂直时间轴 - 中央时间线 */
            .timeline-vertical {
                position: relative;
            }
            
            .timeline-vertical::before {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: var(--timeline-line-width, 2px);
                background: var(--timeline-line-color, #f0f0f0);
                z-index: 1;
            }
            
            /* 水平时间轴 - 中央时间线 */
            .timeline-horizontal {
                display: flex;
                padding: 40px 20px;
                position: relative;
                overflow-x: auto;
            }
            
            .timeline-horizontal::before {
                content: '';
                position: absolute;
                left: 20px;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                height: var(--timeline-line-width, 2px);
                background: var(--timeline-line-color, #f0f0f0);
                z-index: 1;
            }
            
            /* 时间轴项 */
            .timeline-item {
                position: relative;
                margin-bottom: 20px;
                z-index: 2;
            }
            
            .timeline-item:last-child {
                margin-bottom: 0;
            }
            
            .timeline-item-horizontal {
                flex: 1;
                min-width: 200px;
                margin-bottom: 0;
            }
            
            /* 时间轴节点（关键修复） */
            .timeline-dot-container {
                position: absolute;
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* 垂直时间轴的节点位置 */
            .timeline-vertical .timeline-dot-container {
                top: 0;
                width: var(--timeline-dot-size, 10px);
                height: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            /* 水平时间轴的节点位置 */
            .timeline-horizontal .timeline-dot-container {
                left: 0;
                right: 0;
                height: var(--timeline-dot-size, 10px);
                top: 50%;
                transform: translateY(-50%);
            }
            
            /* 节点基础样式 */
            .timeline-dot {
                width: var(--timeline-dot-size, 10px);
                height: var(--timeline-dot-size, 10px);
                border-radius: 50%;
                border: var(--dot-border-width, 2px) solid;
                box-sizing: border-box;
                position: relative;
                z-index: 4;
                transition: all 0.3s;
            }
            
            /* 实心节点 - 已办 */
            .timeline-dot-filled {
                background-color: var(--dot-color, #1890ff);
                border-color: var(--dot-color, #1890ff);
            }
            
            /* 空心节点 - 未办 */
            .timeline-dot-outline {
                background-color: white;
                border-color: var(--dot-color, #d9d9d9);
            }
            
            /* 旋转节点 - 待办 */
            .timeline-dot-spinning {
                background-color: white;
                border-color: var(--dot-color, #1890ff);
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }
            
            /* 圆角矩形节点 */
            .timeline-dot-rounded-rect {
                border-radius: 4px;
            }
            
            /* 方形节点 */
            .timeline-dot-square {
                border-radius: 2px;
            }
            
            /* 事件内容区域 */
            .timeline-content {
                position: relative;
                color: rgba(0, 0, 0, 0.85);
                line-height: 1.5;
            }
            
            /* 垂直时间轴的内容位置 */
            .timeline-vertical .timeline-content {
                width: 45%;
                padding: 0 16px;
            }
            
            .timeline-vertical .timeline-item-left .timeline-content {
                margin-left: 0;
                margin-right: auto;
                text-align: right;
            }
            
            .timeline-vertical .timeline-item-right .timeline-content {
                margin-left: auto;
                margin-right: 0;
                text-align: left;
            }
            
            /* 交替布局 */
            .timeline-position-alternate .timeline-vertical .timeline-item:nth-child(odd) .timeline-content {
                margin-left: 0;
                margin-right: auto;
                text-align: right;
            }
            
            .timeline-position-alternate .timeline-vertical .timeline-item:nth-child(even) .timeline-content {
                margin-left: auto;
                margin-right: 0;
                text-align: left;
            }
            
            /* 左侧布局 */
            .timeline-position-left .timeline-vertical .timeline-content {
                margin-left: 0;
                margin-right: auto;
                text-align: right;
                width: calc(100% - 30px);
            }
            
            /* 右侧布局 */
            .timeline-position-right .timeline-vertical::before {
                left: 30px;
            }
            
            .timeline-position-right .timeline-vertical .timeline-dot-container {
                left: 30px;
            }
            
            .timeline-position-right .timeline-vertical .timeline-content {
                margin-left: 60px;
                margin-right: 0;
                text-align: left;
                width: calc(100% - 60px);
            }
            
            /* 水平时间轴的内容位置 */
            .timeline-horizontal .timeline-content {
                margin-top: 30px;
                text-align: center;
                padding: 0 10px;
            }
            
            .timeline-horizontal .timeline-item-top .timeline-content {
                margin-top: -60px;
                margin-bottom: auto;
            }
            
            .timeline-horizontal .timeline-item-bottom .timeline-content {
                margin-top: 30px;
                margin-bottom: 0;
            }
            
            /* 事件标题 */
            .timeline-title {
                font-weight: 500;
                font-size: 14px;
                margin-bottom: 4px;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .timeline-title-clickable {
                cursor: pointer;
                transition: color 0.3s;
            }
            
            .timeline-title-clickable:hover {
                color: #1890ff;
            }
            
            /* 事件描述 */
            .timeline-description {
                font-size: 13px;
                color: rgba(0, 0, 0, 0.45);
                margin-bottom: 8px;
            }
            
            /* 事件时间 */
            .timeline-time {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.45);
            }
            
            /* 自定义图标 */
            .timeline-custom-dot {
                width: var(--timeline-dot-size, 10px);
                height: var(--timeline-dot-size, 10px);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: calc(var(--timeline-dot-size, 10px) - 4px);
            }
            
            /* 图标节点 */
            .timeline-dot-icon {
                background-color: white;
                border-color: var(--dot-color, #1890ff);
            }
            
            /* 加载动画 */
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .timeline-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                width: calc(var(--timeline-dot-size, 10px) - 4px);
                height: calc(var(--timeline-dot-size, 10px) - 4px);
                margin: -8px 0 0 -8px;
                border: var(--dot-border-width, 2px) solid #1890ff;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .timeline-vertical::before {
                    left: 20px;
                }
                
                .timeline-vertical .timeline-dot-container {
                    left: 20px;
                }
                
                .timeline-vertical .timeline-content {
                    width: calc(100% - 60px);
                    margin-left: 60px !important;
                    margin-right: 0 !important;
                    text-align: left !important;
                }
                
                .timeline-horizontal {
                    flex-direction: column;
                }
                
                .timeline-horizontal::before {
                    left: 50%;
                    top: 20px;
                    width: 2px;
                    height: calc(100% - 40px);
                    transform: translateX(-50%);
                }
                
                .timeline-horizontal .timeline-dot-container {
                    left: 50%;
                    top: 20px;
                    transform: translateX(-50%);
                }
                
                .timeline-horizontal .timeline-content {
                    margin-left: 60px;
                    margin-top: 0;
                    text-align: left;
                }
            }
            
            /* 时间轴位置 */
            .timeline-align-center {
                margin-left: auto;
                margin-right: auto;
            }
            
            .timeline-align-left {
                margin-right: auto;
                margin-left: 0;
            }
            
            .timeline-align-right {
                margin-left: auto;
                margin-right: 0;
            }
        `;

    document.head.appendChild(style);
  }

  setEvents(events) {
    if (!Array.isArray(events)) {
      throw new Error("events参数必须是一个数组");
    }

    if (events.length > this.options.maxEvents) {
      console.warn(`事件数量超过最大限制(${this.options.maxEvents})`);
      events = events.slice(0, this.options.maxEvents);
    }

    this.events = events.map((event, index) => ({
      ...event,
      id: event.id || `timeline-event-${Date.now()}-${index}`,
      color: event.color || "#1890ff",
      status: event.status || "incomplete",
      dotStyle: event.dotStyle || "circle", // circle, rounded-rect, square
      // 新增样式控制
      completedStyle: event.completedStyle || this.options.completedStyle,
      incompleteStyle: event.incompleteStyle || this.options.incompleteStyle,
      pendingStyle: event.pendingStyle || this.options.pendingStyle,
    }));

    if (this.options.reverse) {
      this.events.reverse();
    }

    this.render();
    return this;
  }

  render() {
    this.container.innerHTML = "";

    // 创建时间轴容器
    const timelineContainer = document.createElement("div");
    timelineContainer.className = "timeline-container";

    // 创建时间轴
    const timeline = document.createElement("ul");
    timeline.className = `timeline timeline-${this.options.mode} timeline-position-${this.options.position} timeline-align-${this.options.timelinePosition}`;

    // 设置CSS变量
    timeline.style.setProperty("--timeline-line-color", this.options.lineColor);
    timeline.style.setProperty(
      "--timeline-line-width",
      `${this.options.lineWidth}px`
    );
    timeline.style.setProperty(
      "--timeline-dot-size",
      `${this.options.dotSize}px`
    );
    timeline.style.setProperty(
      "--dot-border-width",
      `${this.options.dotBorderWidth}px`
    );

    // 添加事件
    this.events.forEach((event, index) => {
      const eventElement = this._createEventElement(event, index);
      timeline.appendChild(eventElement);
    });

    // 添加待办项
    if (this.options.pending) {
      const pendingElement = this._createPendingElement();
      timeline.appendChild(pendingElement);
    }

    timelineContainer.appendChild(timeline);
    this.container.appendChild(timelineContainer);

    if (this.options.animation) {
      this._animateEvents();
    }

    return this;
  }

  _createEventElement(event, index) {
    const item = document.createElement("li");
    item.className = `timeline-item timeline-item-${
      this.options.mode
    } ${this._getItemPositionClass(index)}`;
    item.dataset.eventId = event.id;

    // 创建节点容器
    const dotContainer = document.createElement("div");
    dotContainer.className = "timeline-dot-container";

    // 创建节点
    const dot = this._createEventDot(event);
    dotContainer.appendChild(dot);

    // 创建内容
    const content = this._createEventContent(event);

    // 组装
    item.appendChild(dotContainer);
    item.appendChild(content);

    // 添加交互
    if (
      this.options.clickable &&
      (event.onClick || this._eventHandlers.has(event.id))
    ) {
      item.style.cursor = "pointer";
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this._handleEventClick(event, e);
      });
    }

    // 添加工具提示
    if (this.options.showTooltips && event.tooltip) {
      this._addTooltip(item, event.tooltip);
    }

    return item;
  }

  _createEventDot(event) {
    const dot = document.createElement("div");

    // 基础类名
    let dotClass = "timeline-dot";

    // 根据状态和样式配置添加类名
    if (event.icon) {
      // 自定义图标
      dotClass += " timeline-dot-icon";
      const customDot = document.createElement("div");
      customDot.className = "timeline-custom-dot";
      customDot.innerHTML = event.icon;
      dot.appendChild(customDot);
    } else {
      // 根据状态选择样式
      let styleClass = "";
      switch (event.status) {
        case "completed":
          styleClass = event.completedStyle || this.options.completedStyle;
          break;
        case "incomplete":
          styleClass = event.incompleteStyle || this.options.incompleteStyle;
          break;
        case "pending":
          styleClass = event.pendingStyle || this.options.pendingStyle;
          break;
        default:
          styleClass = "outline";
      }
      dotClass += ` timeline-dot-${styleClass}`;
    }

    // 添加形状类名
    dotClass += ` timeline-dot-${event.dotStyle || "circle"}`;
    dot.className = dotClass;

    // 设置颜色
    dot.style.setProperty("--dot-color", event.color || "#1890ff");

    return dot;
  }

  _createEventContent(event) {
    const content = document.createElement("div");
    content.className = "timeline-content";

    // 标题
    if (event.title) {
      const title = document.createElement("div");
      title.className = "timeline-title";

      if (event.onTitleClick) {
        title.classList.add("timeline-title-clickable");
        title.addEventListener("click", (e) => {
          e.stopPropagation();
          event.onTitleClick(event, e);
        });
      }

      title.textContent = event.title;
      content.appendChild(title);
    }

    // 描述
    if (event.description) {
      const description = document.createElement("div");
      description.className = "timeline-description";
      description.textContent = event.description;
      content.appendChild(description);
    }

    // 时间
    if (event.time) {
      const time = document.createElement("div");
      time.className = "timeline-time";
      time.textContent = this._formatDate(event.time);
      content.appendChild(time);
    }

    // 自定义内容
    if (event.content) {
      if (typeof event.content === "string") {
        const customContent = document.createElement("div");
        customContent.innerHTML = event.content;
        content.appendChild(customContent);
      } else {
        content.appendChild(event.content);
      }
    }

    return content;
  }

  _getItemPositionClass(index) {
    const { mode, position } = this.options;

    if (mode === "vertical") {
      if (position === "alternate") {
        return index % 2 === 0 ? "left" : "right";
      }
      return position;
    } else {
      if (position === "alternate") {
        return index % 2 === 0 ? "top" : "bottom";
      }
      return position;
    }
  }

  _createPendingElement() {
    const item = document.createElement("li");
    item.className = `timeline-item timeline-item-${this.options.mode} timeline-item-pending`;

    const dotContainer = document.createElement("div");
    dotContainer.className = "timeline-dot-container";

    const dot = document.createElement("div");
    dot.className = "timeline-dot timeline-dot-spinning";
    dot.style.setProperty("--dot-color", "#1890ff");

    dotContainer.appendChild(dot);

    const content = document.createElement("div");
    content.className = "timeline-content";

    if (typeof this.options.pending === "string") {
      content.textContent = this.options.pending;
    } else {
      content.appendChild(this.options.pending);
    }

    item.appendChild(dotContainer);
    item.appendChild(content);

    return item;
  }

  _formatDate(dateInput) {
    if (!dateInput) return "";

    let date;
    if (typeof dateInput === "string") {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return String(dateInput);
    }

    if (isNaN(date.getTime())) {
      return "无效日期";
    }

    const format = this.options.dateFormat;

    if (format === "relative") {
      return this._getRelativeTime(date);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY年MM月DD日":
        return `${year}年${month}月${day}日`;
      case "YYYY-MM-DD HH:mm":
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case "YYYY-MM-DD HH:mm:ss":
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case "MM/DD/YYYY HH:mm":
        return `${month}/${day}/${year} ${hours}:${minutes}`;
      case "HH:mm":
        return `${hours}:${minutes}`;
      default:
        return format
          .replace("YYYY", year)
          .replace("MM", month)
          .replace("DD", day)
          .replace("HH", hours)
          .replace("mm", minutes)
          .replace("ss", seconds);
    }
  }

  _getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours > 0) return `${diffHours}小时前`;

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes > 0) return `${diffMinutes}分钟前`;

      return "刚刚";
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays > 0) {
      return `${diffDays}天前`;
    }

    return "";
  }

  _handleEventClick(event, e) {
    if (event.onClick) {
      event.onClick(event, e);
    }

    const handler = this._eventHandlers.get(event.id);
    if (handler) {
      handler(event, e);
    }
  }

  _addTooltip(element, text) {
    element.addEventListener("mouseenter", (e) => {
      this.tooltip.textContent = text;
      this.tooltip.style.opacity = "1";

      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      this.tooltip.style.top = `${
        rect.top + scrollTop - this.tooltip.offsetHeight - 10
      }px`;
      this.tooltip.style.left = `${
        rect.left + rect.width / 2 - this.tooltip.offsetWidth / 2
      }px`;
    });

    element.addEventListener("mouseleave", () => {
      this.tooltip.style.opacity = "0";
    });
  }

  _animateEvents() {
    const items = this.container.querySelectorAll(".timeline-item");
    items.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(10px)";

      setTimeout(() => {
        item.style.transition = "opacity 0.3s, transform 0.3s";
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  // 公共API
  addEvent(event, onClick = null) {
    if (this.events.length >= this.options.maxEvents) {
      console.warn(`已达到最大事件数量(${this.options.maxEvents})`);
      return null;
    }

    const newEvent = {
      ...event,
      id: event.id || `timeline-event-${Date.now()}-${this.events.length}`,
      color: event.color || "#1890ff",
      status: event.status || "incomplete",
      dotStyle: event.dotStyle || "circle",
      completedStyle: event.completedStyle || this.options.completedStyle,
      incompleteStyle: event.incompleteStyle || this.options.incompleteStyle,
      pendingStyle: event.pendingStyle || this.options.pendingStyle,
    };

    this.events.push(newEvent);

    if (onClick) {
      this._eventHandlers.set(newEvent.id, onClick);
    }

    this.render();
    return newEvent.id;
  }

  updateEventStatus(eventId, status) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex].status = status;
      this.render();
    }
    return this;
  }

  updateEvent(eventId, eventData) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...eventData,
        id: eventId,
      };
      this.render();
    }
    return this;
  }

  removeEvent(eventId) {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events.splice(eventIndex, 1);
      this._eventHandlers.delete(eventId);
      this.render();
    }
    return this;
  }

  onEventClick(eventId, handler) {
    this._eventHandlers.set(eventId, handler);
    return this;
  }

  updateOptions(options) {
    this.options = { ...this.options, ...options };
    this.render();
    return this;
  }

  clear() {
    this.events = [];
    this._eventHandlers.clear();
    this.render();
    return this;
  }

  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    this.container.innerHTML = "";
    this.events = [];
    this._eventHandlers.clear();
    this._initialized = false;

    return this;
  }

  getEvents() {
    return [...this.events];
  }

  getEvent(eventId) {
    return this.events.find((event) => event.id === eventId) || null;
  }

  getOptions() {
    return { ...this.options };
  }

  isInitialized() {
    return this._initialized;
  }
}

// 使用示例
// const timelineExample = [
//     {
//         title: '项目启动',
//         description: '项目正式启动会议',
//         time: '2023-01-15',
//         status: 'completed',
//         color: '#1890ff',
//         dotStyle: 'circle', // circle, rounded-rect, square
//         completedStyle: 'filled', // 已办：实心
//         tooltip: '项目启动完成',
//         onClick: (event) => console.log('点击了:', event.title)
//     },
//     {
//         title: '需求分析',
//         description: '完成需求文档编写',
//         time: '2023-02-10',
//         status: 'completed',
//         color: '#52c41a',
//         dotStyle: 'rounded-rect', // 圆角矩形
//         completedStyle: 'filled'
//     },
//     {
//         title: 'UI设计',
//         description: '完成界面设计稿',
//         time: '2023-03-05',
//         status: 'pending',
//         color: '#faad14',
//         dotStyle: 'circle',
//         pendingStyle: 'spinning' // 待办：旋转
//     },
//     {
//         title: '前端开发',
//         description: '开始前端功能开发',
//         time: '2023-03-20',
//         status: 'incomplete',
//         color: '#d9d9d9',
//         dotStyle: 'square', // 方形
//         incompleteStyle: 'outline' // 未办：空心
//     },
//     {
//         title: '测试阶段',
//         description: '系统测试',
//         time: '2023-04-10',
//         status: 'incomplete',
//         color: '#ff4d4f',
//         icon: '🧪', // 使用图标
//         dotStyle: 'circle'
//     }
// ];
