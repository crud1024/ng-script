/**
 * 投资项目管理系统 - 进度组件
 * 支持圆形进度环、水平进度条、投资可视化三种类型
 * 可自定义颜色、文本位置、大小等属性
 */
class InvestmentProgress {
  constructor(container, options = {}) {
    // 默认配置
    this.defaultOptions = {
      type: "circle", // 类型: 'circle', 'bar', 'investment'
      size: 200, // 组件大小(px)，对于bar类型是宽度，其他是直径
      primaryColor: "#3498db", // 已完成进度颜色
      secondaryColor: "#ecf0f1", // 未完成进度颜色
      textColor: "#2c3e50", // 文本颜色
      percentageColor: null, // 百分比文字颜色，null时使用textColor
      showPercentage: true, // 是否显示百分比
      text: "", // 说明文本
      textPosition: "bottom", // 文本位置: 'top', 'bottom', 'left', 'right'
      textMargin: 10, // 文本与图示间距(px)
      progress: 0, // 初始进度(0-100)
      animationDuration: 300, // 进度更新动画时长(ms)
      useContainerSize: true, // 是否自适应父容器大小
      containerMaxSize: 300, // 当自适应时最大尺寸(px)
    };

    // 合并配置
    this.options = { ...this.defaultOptions, ...options };

    // 容器元素
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      console.error("InvestmentProgress: 未找到容器元素");
      return;
    }

    // 内部状态
    this.progress = this.options.progress;
    this.type = this.options.type;

    // 创建组件
    this.init();
  }

  /**
   * 初始化组件
   */
  init() {
    // 清空容器
    this.container.innerHTML = "";

    // 设置容器样式，确保水平垂直居中
    this.setContainerStyle();

    // 创建组件结构
    this.createProgressElement();

    // 设置初始进度
    this.updateProgress(this.progress);
  }

  /**
   * 设置容器样式
   */
  setContainerStyle() {
    // 确保容器相对定位，方便内部元素居中
    Object.assign(this.container.style, {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    });

    // 如果自适应父容器大小，计算合适尺寸
    if (this.options.useContainerSize) {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;
      const minSize = Math.min(
        containerWidth,
        containerHeight,
        this.options.containerMaxSize
      );

      // 对于bar类型，宽度使用容器宽度，高度固定
      if (this.type === "bar") {
        this.options.size = Math.min(
          containerWidth,
          this.options.containerMaxSize
        );
      } else {
        this.options.size = minSize;
      }
    }
  }

  /**
   * 创建进度元素
   */
  createProgressElement() {
    // 清除旧元素
    if (this.progressContainer) {
      this.progressContainer.remove();
    }

    // 创建主容器
    this.progressContainer = document.createElement("div");
    this.progressContainer.className = "investment-progress-container";

    // 设置容器尺寸和位置
    const size = this.options.size;

    // 根据类型设置不同的布局
    if (this.type === "bar") {
      // 对于bar类型，使用flex布局
      Object.assign(this.progressContainer.style, {
        width: `${size}px`,
        height: "auto",
        display: "flex",
        flexDirection: this.getBarTextDirection(),
        alignItems: "center",
        justifyContent: "center",
      });
    } else {
      // 对于circle和investment类型，使用grid布局来保持图像居中
      Object.assign(this.progressContainer.style, {
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "grid",
        gridTemplateAreas: this.getGridTemplateAreas(),
        gridTemplateColumns: this.getGridTemplateColumns(),
        gridTemplateRows: this.getGridTemplateRows(),
        alignItems: "center",
        justifyContent: "center",
      });
    }

    // 创建进度图示
    this.createProgressVisual();

    // 创建文本元素
    this.createTextElement();

    // 添加到容器
    this.container.appendChild(this.progressContainer);
  }

  /**
   * 根据文本位置获取flex方向（用于bar类型）
   */
  getBarTextDirection() {
    switch (this.options.textPosition) {
      case "top":
        return "column";
      case "bottom":
        return "column-reverse";
      case "left":
        return "row";
      case "right":
        return "row-reverse";
      default:
        return "column";
    }
  }

  /**
   * 获取网格模板区域（用于非bar类型）
   */
  getGridTemplateAreas() {
    switch (this.options.textPosition) {
      case "top":
        return `'text' 'visual'`;
      case "bottom":
        return `'visual' 'text'`;
      case "left":
        return `'text visual'`;
      case "right":
        return `'visual text'`;
      default:
        return `'visual' 'text'`;
    }
  }

  /**
   * 获取网格模板列（用于非bar类型）
   */
  getGridTemplateColumns() {
    switch (this.options.textPosition) {
      case "left":
      case "right":
        return "auto 1fr";
      default:
        return "1fr";
    }
  }

  /**
   * 获取网格模板行（用于非bar类型）
   */
  getGridTemplateRows() {
    switch (this.options.textPosition) {
      case "top":
      case "bottom":
        return "auto 1fr";
      default:
        return "1fr";
    }
  }

  /**
   * 获取百分比文字颜色
   * 如果设置了percentageColor则使用，否则使用textColor
   */
  getPercentageColor() {
    return this.options.percentageColor || this.options.textColor;
  }

  /**
   * 创建进度图示
   */
  createProgressVisual() {
    // 清除旧图示
    if (this.visualContainer) {
      this.visualContainer.remove();
    }

    this.visualContainer = document.createElement("div");
    this.visualContainer.className = "investment-progress-visual";

    // 根据类型设置不同的布局
    if (this.type === "bar") {
      // 对于bar类型，不使用grid布局
      this.visualContainer.style.display = "flex";
      this.visualContainer.style.alignItems = "center";
      this.visualContainer.style.justifyContent = "flex-start"; // 从左开始
    } else {
      // 对于非bar类型，使用grid布局
      this.visualContainer.style.gridArea = "visual";
      this.visualContainer.style.display = "flex";
      this.visualContainer.style.alignItems = "center";
      this.visualContainer.style.justifyContent = "center";
    }

    // 根据类型创建不同的进度图示
    switch (this.type) {
      case "circle":
        this.createCircleVisual();
        break;
      case "bar":
        this.createBarVisual();
        break;
      case "investment":
        this.createInvestmentVisual();
        break;
      default:
        console.error(`InvestmentProgress: 不支持的类型 "${this.type}"`);
        return;
    }

    // 添加到进度容器
    this.progressContainer.appendChild(this.visualContainer);
  }

  /**
   * 创建圆形进度图示
   */
  createCircleVisual() {
    const size = this.options.size;
    const svgSize = size;

    // 创建SVG容器
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", svgSize);
    svg.setAttribute("height", svgSize);
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.style.display = "block";

    // 计算半径和周长
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    // 背景圆
    const bgCircle = document.createElementNS(svgNS, "circle");
    bgCircle.setAttribute("cx", "60");
    bgCircle.setAttribute("cy", "60");
    bgCircle.setAttribute("r", radius.toString());
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", this.options.secondaryColor);
    bgCircle.setAttribute("stroke-width", "12");
    svg.appendChild(bgCircle);

    // 前景圆（进度圆）
    this.progressCircle = document.createElementNS(svgNS, "circle");
    this.progressCircle.setAttribute("cx", "60");
    this.progressCircle.setAttribute("cy", "60");
    this.progressCircle.setAttribute("r", radius.toString());
    this.progressCircle.setAttribute("fill", "none");
    this.progressCircle.setAttribute("stroke", this.options.primaryColor);
    this.progressCircle.setAttribute("stroke-width", "12");
    this.progressCircle.setAttribute("stroke-linecap", "round");
    this.progressCircle.setAttribute(
      "stroke-dasharray",
      circumference.toString()
    );
    this.progressCircle.setAttribute(
      "stroke-dashoffset",
      circumference.toString()
    );
    this.progressCircle.setAttribute("transform", "rotate(-90 60 60)");
    svg.appendChild(this.progressCircle);

    // 百分比文本
    if (this.options.showPercentage) {
      this.percentageText = document.createElementNS(svgNS, "text");
      this.percentageText.setAttribute("x", "60");
      this.percentageText.setAttribute("y", "65");
      this.percentageText.setAttribute("text-anchor", "middle");
      this.percentageText.setAttribute("font-size", "20");
      this.percentageText.setAttribute("font-weight", "600");
      this.percentageText.setAttribute("fill", this.getPercentageColor());
      this.percentageText.textContent = "0%";
      svg.appendChild(this.percentageText);
    }

    this.visualContainer.appendChild(svg);
  }

  /**
   * 创建水平进度条图示
   */
  createBarVisual() {
    const width = this.options.size;
    const height = 20;

    // 对于bar类型，确保视觉容器宽度正确
    Object.assign(this.visualContainer.style, {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: this.options.secondaryColor,
      borderRadius: "10px",
      overflow: "hidden",
      position: "relative",
    });

    // 进度条 - 确保从左开始
    this.progressBar = document.createElement("div");
    Object.assign(this.progressBar.style, {
      width: "0%",
      height: "100%",
      backgroundColor: this.options.primaryColor,
      borderRadius: "10px",
      transition: `width ${this.options.animationDuration}ms ease`,
    });

    this.visualContainer.appendChild(this.progressBar);

    // 百分比文本（对于bar类型，文本可以在内部显示）
    if (this.options.showPercentage) {
      this.percentageText = document.createElement("div");
      Object.assign(this.percentageText.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "14px",
        fontWeight: "600",
        color: this.getPercentageColor(),
        textShadow: "1px 1px 1px rgba(255,255,255,0.8)",
      });
      this.percentageText.textContent = "0%";
      this.visualContainer.appendChild(this.percentageText);
    }
  }

  /**
   * 创建投资可视化图示
   */
  createInvestmentVisual() {
    const size = this.options.size;
    const visualSize = size;

    Object.assign(this.visualContainer.style, {
      width: `${visualSize}px`,
      height: `${visualSize}px`,
      position: "relative",
    });

    // 创建SVG容器
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 100 100");

    // 网格背景
    for (let i = 0; i <= 10; i++) {
      const lineX = document.createElementNS(svgNS, "line");
      lineX.setAttribute("x1", "0");
      lineX.setAttribute("y1", i * 10);
      lineX.setAttribute("x2", "100");
      lineX.setAttribute("y2", i * 10);
      lineX.setAttribute("stroke", this.options.secondaryColor);
      lineX.setAttribute("stroke-width", "0.5");
      svg.appendChild(lineX);

      const lineY = document.createElementNS(svgNS, "line");
      lineY.setAttribute("x1", i * 10);
      lineY.setAttribute("y1", "0");
      lineY.setAttribute("x2", i * 10);
      lineY.setAttribute("y2", "100");
      lineY.setAttribute("stroke", this.options.secondaryColor);
      lineY.setAttribute("stroke-width", "0.5");
      svg.appendChild(lineY);
    }

    // 增长线
    this.growthPath = document.createElementNS(svgNS, "path");
    this.growthPath.setAttribute("d", "M10,90 L10,90");
    this.growthPath.setAttribute("fill", "none");
    this.growthPath.setAttribute("stroke", this.options.primaryColor);
    this.growthPath.setAttribute("stroke-width", "3");
    this.growthPath.setAttribute("stroke-linecap", "round");
    this.growthPath.setAttribute("stroke-linejoin", "round");
    svg.appendChild(this.growthPath);

    this.visualContainer.appendChild(svg);

    // 百分比文本
    if (this.options.showPercentage) {
      this.percentageText = document.createElement("div");
      Object.assign(this.percentageText.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "20px",
        fontWeight: "600",
        color: this.getPercentageColor(),
      });
      this.percentageText.textContent = "0%";
      this.visualContainer.appendChild(this.percentageText);
    }
  }

  /**
   * 创建文本元素
   */
  createTextElement() {
    // 如果不需要文本，直接返回
    if (!this.options.text) return;

    // 移除旧文本
    if (this.textElement) {
      this.textElement.remove();
    }

    this.textElement = document.createElement("div");
    this.textElement.className = "investment-progress-text";
    this.textElement.textContent = this.options.text;

    // 根据类型设置不同的样式
    if (this.type === "bar") {
      // 对于bar类型，不使用grid布局
      this.textElement.style.display = "flex";
      this.textElement.style.alignItems = "center";
      this.textElement.style.justifyContent = "center";
    } else {
      // 对于非bar类型，使用grid布局
      this.textElement.style.gridArea = "text";
      this.textElement.style.display = "flex";
      this.textElement.style.alignItems = "center";
      this.textElement.style.justifyContent = "center";
    }

    // 设置文本样式
    const textStyle = {
      color: this.options.textColor,
      fontSize: "14px",
      textAlign: "center",
      flexShrink: "0",
    };

    // 根据文本位置设置不同的样式
    switch (this.options.textPosition) {
      case "top":
        textStyle.marginBottom = `${this.options.textMargin}px`;
        textStyle.width = "100%";
        break;
      case "bottom":
        textStyle.marginTop = `${this.options.textMargin}px`;
        textStyle.width = "100%";
        break;
      case "left":
        textStyle.marginRight = `${this.options.textMargin}px`;
        textStyle.writingMode = "vertical-rl"; // 垂直从右到左
        textStyle.textOrientation = "mixed";
        textStyle.height = "100%";
        textStyle.maxWidth = "none";
        textStyle.maxHeight = "150px";
        break;
      case "right":
        textStyle.marginLeft = `${this.options.textMargin}px`;
        textStyle.writingMode = "vertical-rl"; // 垂直从右到左
        textStyle.textOrientation = "mixed";
        textStyle.height = "100%";
        textStyle.maxWidth = "none";
        textStyle.maxHeight = "150px";
        break;
    }

    Object.assign(this.textElement.style, textStyle);

    // 添加到进度容器
    this.progressContainer.appendChild(this.textElement);
  }

  /**
   * 更新进度
   * @param {number} progress 进度值(0-100)
   * @param {boolean} animate 是否使用动画
   */
  updateProgress(progress, animate = true) {
    // 确保进度在0-100范围内
    this.progress = Math.max(0, Math.min(100, progress));

    // 根据类型更新进度显示
    switch (this.type) {
      case "circle":
        this.updateCircleProgress(animate);
        break;
      case "bar":
        this.updateBarProgress(animate);
        break;
      case "investment":
        this.updateInvestmentProgress(animate);
        break;
    }

    // 更新百分比文本
    if (this.options.showPercentage && this.percentageText) {
      if (this.percentageText.tagName === "text") {
        // SVG文本元素
        this.percentageText.textContent = `${Math.round(this.progress)}%`;
      } else {
        // HTML文本元素
        this.percentageText.textContent = `${Math.round(this.progress)}%`;
      }
    }

    // 触发进度更新事件
    this.triggerEvent("progressUpdate", { progress: this.progress });
  }

  /**
   * 更新圆形进度
   */
  updateCircleProgress(animate) {
    if (!this.progressCircle) return;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (this.progress / 100) * circumference;

    if (animate) {
      this.progressCircle.style.transition = `stroke-dashoffset ${this.options.animationDuration}ms ease`;
    } else {
      this.progressCircle.style.transition = "none";
    }

    this.progressCircle.setAttribute("stroke-dashoffset", offset);
  }

  /**
   * 更新水平进度条
   */
  updateBarProgress(animate) {
    if (!this.progressBar) return;

    if (animate) {
      this.progressBar.style.transition = `width ${this.options.animationDuration}ms ease`;
    } else {
      this.progressBar.style.transition = "none";
    }

    this.progressBar.style.width = `${this.progress}%`;
  }

  /**
   * 更新投资可视化进度
   */
  updateInvestmentProgress(animate) {
    if (!this.growthPath) return;

    // 创建增长曲线路径
    const points = [];
    const segments = 10;

    for (let i = 0; i <= segments; i++) {
      const x = 10 + i * 8;
      const progressRatio = Math.min(1, (i / segments) * (this.progress / 100));
      // 模拟投资增长曲线
      const y = 90 - 80 * Math.pow(progressRatio, 0.7);
      points.push(`${x},${y}`);
    }

    const pathData = `M${points.join(" L")}`;

    if (animate) {
      this.growthPath.style.transition = `d ${this.options.animationDuration}ms ease`;
      // 注意：SVG path的d属性过渡需要浏览器支持
      // 可以使用requestAnimationFrame实现平滑过渡
      requestAnimationFrame(() => {
        this.growthPath.setAttribute("d", pathData);
      });
    } else {
      this.growthPath.style.transition = "none";
      this.growthPath.setAttribute("d", pathData);
    }
  }

  /**
   * 设置组件类型
   * @param {string} type 类型: 'circle', 'bar', 'investment'
   */
  setType(type) {
    if (this.type === type) return;

    this.type = type;
    this.options.type = type;

    // 重新创建组件
    this.createProgressElement();

    // 更新进度显示
    this.updateProgress(this.progress, false);
  }

  /**
   * 设置文本
   * @param {string} text 文本内容
   */
  setText(text) {
    this.options.text = text;
    this.createTextElement();
  }

  /**
   * 设置文本位置
   * @param {string} position 位置: 'top', 'bottom', 'left', 'right'
   */
  setTextPosition(position) {
    if (this.options.textPosition === position) return;

    this.options.textPosition = position;

    // 重新创建整个组件以更新布局
    this.createProgressElement();

    // 更新进度显示
    this.updateProgress(this.progress, false);
  }

  /**
   * 设置颜色
   * @param {string} primary 已完成进度颜色
   * @param {string} secondary 未完成进度颜色
   * @param {string} textColor 文本颜色
   * @param {string} percentageColor 百分比文字颜色（可选）
   */
  setColors(primary, secondary, textColor, percentageColor) {
    this.options.primaryColor = primary || this.options.primaryColor;
    this.options.secondaryColor = secondary || this.options.secondaryColor;
    this.options.textColor = textColor || this.options.textColor;

    // 如果提供了百分比颜色，则更新
    if (percentageColor !== undefined) {
      this.options.percentageColor = percentageColor;
    }

    // 重新初始化
    this.init();
  }

  /**
   * 设置百分比文字颜色
   * @param {string} color 百分比文字颜色
   */
  setPercentageColor(color) {
    this.options.percentageColor = color;

    // 更新百分比文字颜色
    this.updatePercentageColor();
  }

  /**
   * 更新百分比文字颜色
   */
  updatePercentageColor() {
    // 如果百分比文本存在，更新其颜色
    if (this.percentageText) {
      const percentageColor = this.getPercentageColor();

      if (this.percentageText.tagName === "text") {
        // SVG文本元素
        this.percentageText.setAttribute("fill", percentageColor);
      } else {
        // HTML文本元素
        this.percentageText.style.color = percentageColor;
      }
    }
  }

  /**
   * 重置进度为0
   */
  reset() {
    this.updateProgress(0, false);
  }

  /**
   * 完成进度(100%)
   */
  complete() {
    this.updateProgress(100);

    // 触发完成事件
    this.triggerEvent("complete", { progress: 100 });
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.container.innerHTML = "";
    this.container.style = "";
  }

  /**
   * 触发自定义事件
   * @param {string} eventName 事件名称
   * @param {Object} detail 事件详情
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(`investmentProgress:${eventName}`, {
      detail: { ...detail, instance: this },
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 获取当前进度
   * @returns {number} 当前进度值
   */
  getProgress() {
    return this.progress;
  }

  /**
   * 获取配置
   * @returns {Object} 当前配置
   */
  getOptions() {
    return { ...this.options };
  }
}

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = InvestmentProgress;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return InvestmentProgress;
  });
} else {
  window.InvestmentProgress = InvestmentProgress;
}
