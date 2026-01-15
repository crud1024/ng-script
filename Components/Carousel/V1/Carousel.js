/**
 * 全配置 NG Carousel 走马灯组件
 * 支持所有配置选项，包括指示器显示/隐藏
 */
class FullConfigNGCarousel {
  static styleInjected = false;

  constructor(selector, options = {}) {
    this.container =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!this.container) {
      console.error("FullConfigNGCarousel: 未找到目标元素");
      return;
    }

    // 默认配置
    this.config = {
      items: options.items || [],
      autoplay: options.autoplay !== false,
      interval: options.interval || 3000,
      dotPosition: options.dotPosition || "bottom",
      dotStyle: options.dotStyle || "circle",
      lineDotWidth: options.lineDotWidth || 24,
      lineDotHeight: options.lineDotHeight || 4,
      showArrows: options.showArrows !== false,
      showDots: options.showDots !== false,
      showIndicator: options.showIndicator !== false, // 新增：是否显示指示器
      arrowBackground: options.arrowBackground !== false,
      arrowStyle: options.arrowStyle || "solid",
      effect: options.effect || "fade",
      speed: options.speed || 500,
      infinite: options.infinite !== false,
      draggable: options.draggable !== false,
      pauseOnHover: options.pauseOnHover !== false,
      progressDots: options.progressDots !== false,

      // 颜色配置
      colors: {
        // 指示点颜色
        dotColor: options.colors?.dotColor || "rgba(255, 255, 255, 0.5)",
        dotActiveColor: options.colors?.dotActiveColor || "#1890ff",
        dotHoverColor:
          options.colors?.dotHoverColor || "rgba(255, 255, 255, 0.7)",

        // 进度条颜色
        progressColor: options.colors?.progressColor || "#1890ff",

        // 箭头颜色
        arrowColor: options.colors?.arrowColor || "#ffffff",
        arrowHoverColor: options.colors?.arrowHoverColor || "#40a9ff",
        arrowBackgroundColor:
          options.colors?.arrowBackgroundColor || "rgba(0, 0, 0, 0.5)",
        arrowHoverBackgroundColor:
          options.colors?.arrowHoverBackgroundColor || "rgba(0, 0, 0, 0.8)",
        arrowBorderColor:
          options.colors?.arrowBorderColor || "rgba(255, 255, 255, 0.8)",
        arrowHoverBorderColor:
          options.colors?.arrowHoverBorderColor || "#ffffff",

        // 指示器颜色
        indicatorBackground:
          options.colors?.indicatorBackground || "rgba(0, 0, 0, 0.5)",
        indicatorColor: options.colors?.indicatorColor || "#ffffff",

        // 整体主题色
        themePrimary: options.colors?.themePrimary || "#1890ff",
        themeSecondary: options.colors?.themeSecondary || "#40a9ff",
      },
    };

    this.currentIndex = 0;
    this.totalItems = this.config.items.length;
    this.isAnimating = false;
    this.timer = null;
    this.progressTimer = null;
    this.dragStartX = 0;
    this.dragEndX = 0;
    this.isDragging = false;
    this.startTime = 0;

    // 生成唯一的实例ID用于样式隔离
    this.instanceId =
      "ng-carousel-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substr(2, 9);

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  /**
   * 注入所有 CSS 样式
   */
  injectStyles() {
    if (!FullConfigNGCarousel.styleInjected) {
      const globalStyle = document.createElement("style");
      globalStyle.textContent = this.getGlobalStyles();
      document.head.appendChild(globalStyle);
      FullConfigNGCarousel.styleInjected = true;
    }

    // 为每个实例注入特定的颜色样式
    this.injectInstanceStyles();
  }

  /**
   * 获取全局通用样式
   */
  getGlobalStyles() {
    return `
            /* 基础样式 */
            .ng-carousel {
                position: relative;
                width: 100%;
                overflow: hidden;
                user-select: none;
            }

            .ng-carousel-slides {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .ng-carousel-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ng-carousel-slide.ng-carousel-slide-active {
                opacity: 1;
            }

            /* 箭头样式 - 基础 */
            .ng-carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s ease;
                user-select: none;
                font-size: 20px;
            }

            /* 箭头样式 - 实心背景 */
            .ng-carousel-arrow.ng-arrow-solid {
                border-radius: 50%;
            }

            /* 箭头样式 - 轮廓 */
            .ng-carousel-arrow.ng-arrow-outline {
                background: transparent;
                border: 2px solid;
                border-radius: 50%;
            }

            /* 箭头样式 - 简约 */
            .ng-carousel-arrow.ng-arrow-minimal {
                background: transparent;
                width: 60px;
                height: 60px;
                font-size: 24px;
            }

            .ng-carousel-arrow-prev {
                left: 20px;
            }

            .ng-carousel-arrow-next {
                right: 20px;
            }

            /* 无背景箭头 */
            .ng-carousel-arrow.ng-arrow-no-bg {
                background: transparent !important;
                font-size: 32px;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            /* 指示点容器 */
            .ng-carousel-dots {
                position: absolute;
                z-index: 10;
                display: flex;
                gap: 8px;
                padding: 10px;
            }

            .ng-carousel-dots-bottom {
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
            }

            .ng-carousel-dots-top {
                top: 0;
                left: 50%;
                transform: translateX(-50%);
            }

            .ng-carousel-dots-left {
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                flex-direction: column;
            }

            .ng-carousel-dots-right {
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                flex-direction: column;
            }

            /* 圆形指示点样式 */
            .ng-carousel-dot-circle {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            /* 条形指示点样式 */
            .ng-carousel-dot-line {
                width: 24px;
                height: 4px;
                border-radius: 2px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            /* 指示点进度条 */
            .ng-carousel-dot-progress {
                position: absolute;
                top: 0;
                left: 0;
                width: 0%;
                height: 100%;
            }

            /* 圆形指示点进度条 */
            .ng-carousel-dot-circle .ng-carousel-dot-progress {
                border-radius: 50%;
            }

            /* 条形指示点进度条 */
            .ng-carousel-dot-line .ng-carousel-dot-progress {
                border-radius: 2px;
            }

            .ng-carousel-slide-content {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .ng-carousel-indicator {
                position: absolute;
                bottom: 30px;
                right: 30px;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 14px;
                z-index: 10;
            }

            /* 响应式 */
            @media (max-width: 768px) {
                .ng-carousel-arrow {
                    width: 32px;
                    height: 32px;
                    font-size: 16px;
                }

                .ng-carousel-arrow.ng-arrow-minimal {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }

                .ng-carousel-arrow.ng-arrow-no-bg {
                    font-size: 24px;
                }

                .ng-carousel-arrow-prev {
                    left: 10px;
                }

                .ng-carousel-arrow-next {
                    right: 10px;
                }

                .ng-carousel-dot-line {
                    width: 20px;
                    height: 3px;
                }
            }
        `;
  }

  /**
   * 注入实例特定的颜色样式
   */
  injectInstanceStyles() {
    // 移除旧的样式
    const oldStyle = document.getElementById(this.instanceId + "-styles");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = this.instanceId + "-styles";
    style.textContent = this.getInstanceStyles();
    document.head.appendChild(style);
  }

  /**
   * 获取实例特定的颜色样式
   */
  getInstanceStyles() {
    const colors = this.config.colors;

    return `
            /* ${this.instanceId} 特定颜色样式 */
            .${this.instanceId} .ng-carousel-arrow.ng-arrow-solid {
                background: ${colors.arrowBackgroundColor};
                color: ${colors.arrowColor};
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-solid:hover {
                background: ${colors.arrowHoverBackgroundColor};
                color: ${colors.arrowHoverColor};
                transform: translateY(-50%) scale(1.1);
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-outline {
                border-color: ${colors.arrowBorderColor};
                color: ${colors.arrowColor};
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-outline:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: ${colors.arrowHoverBorderColor};
                color: ${colors.arrowHoverColor};
                transform: translateY(-50%) scale(1.1);
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-minimal {
                color: ${colors.arrowColor};
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-minimal:hover {
                color: ${colors.arrowHoverColor};
                transform: translateY(-50%) scale(1.2);
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-no-bg {
                color: ${colors.arrowColor};
            }

            .${this.instanceId} .ng-carousel-arrow.ng-arrow-no-bg:hover {
                color: ${colors.arrowHoverColor};
                transform: translateY(-50%) scale(1.2);
            }

            /* 指示点颜色 */
            .${this.instanceId} .ng-carousel-dot-circle {
                background: ${colors.dotColor};
            }

            .${this.instanceId} .ng-carousel-dot-circle:hover {
                transform: scale(1.2);
                background: ${colors.dotHoverColor};
            }

            .${this.instanceId} .ng-carousel-dot-circle.ng-carousel-dot-active {
                background: ${colors.dotActiveColor};
            }

            .${this.instanceId} .ng-carousel-dot-line {
                background: ${colors.dotColor};
            }

            .${this.instanceId} .ng-carousel-dot-line:hover {
                background: ${colors.dotHoverColor};
                transform: scale(1.1);
            }

            .${this.instanceId} .ng-carousel-dot-line.ng-carousel-dot-active {
                background: ${colors.dotActiveColor};
            }

            /* 进度条颜色 */
            .${this.instanceId} .ng-carousel-dot-progress {
                background: ${colors.progressColor};
            }

            /* 指示器颜色 */
            .${this.instanceId} .ng-carousel-indicator {
                background: ${colors.indicatorBackground};
                color: ${colors.indicatorColor};
            }
        `;
  }

  /**
   * 初始化组件
   */
  init() {
    this.container.innerHTML = "";
    this.container.classList.add("ng-carousel", this.instanceId);

    // 创建轮播图容器
    this.slidesContainer = document.createElement("div");
    this.slidesContainer.className = "ng-carousel-slides";
    this.slidesContainer.style.height = "400px";
    this.container.appendChild(this.slidesContainer);

    // 创建轮播项
    this.createSlides();

    // 创建箭头
    if (this.config.showArrows && this.totalItems > 1) {
      this.createArrows();
    }

    // 创建指示点
    if (this.config.showDots && this.totalItems > 1) {
      this.createDots();
    }

    // 创建指示器
    if (this.config.showIndicator) {
      this.createIndicator();
    }

    // 设置拖拽事件
    if (this.config.draggable) {
      this.setupDraggable();
    }

    // 设置悬停事件
    if (this.config.pauseOnHover) {
      this.setupHoverEvents();
    }

    // 开始自动播放
    if (this.config.autoplay && this.totalItems > 1) {
      this.startAutoplay();
    }
  }

  /**
   * 创建轮播项
   */
  createSlides() {
    this.items = this.config.items.map((item, index) => {
      const slide = document.createElement("div");
      slide.className = `ng-carousel-slide ${
        index === 0 ? "ng-carousel-slide-active" : ""
      }`;
      slide.dataset.index = index;

      const content = document.createElement("div");
      content.className = "ng-carousel-slide-content";

      if (typeof item === "string") {
        content.innerHTML = item;
      } else if (item instanceof HTMLElement) {
        content.appendChild(item.cloneNode(true));
      } else if (item.content) {
        if (typeof item.content === "string") {
          content.innerHTML = item.content;
        } else if (item.content instanceof HTMLElement) {
          content.appendChild(item.content.cloneNode(true));
        }
      } else {
        content.innerHTML = `<div style="padding: 20px; font-size: 18px;">Slide ${
          index + 1
        }</div>`;
      }

      slide.appendChild(content);
      this.slidesContainer.appendChild(slide);
      return slide;
    });
  }

  /**
   * 创建箭头
   */
  createArrows() {
    const prevArrow = document.createElement("div");
    prevArrow.className = "ng-carousel-arrow ng-carousel-arrow-prev";
    prevArrow.innerHTML = "❮";

    // 应用箭头样式
    if (!this.config.arrowBackground) {
      prevArrow.classList.add("ng-arrow-no-bg");
    } else {
      prevArrow.classList.add(`ng-arrow-${this.config.arrowStyle}`);

      // 设置自定义样式
      if (this.config.arrowStyle === "minimal") {
        prevArrow.style.width = "60px";
        prevArrow.style.height = "60px";
        prevArrow.style.fontSize = "24px";
      }
    }

    prevArrow.addEventListener("click", (e) => {
      e.stopPropagation();
      this.prev();
    });

    const nextArrow = document.createElement("div");
    nextArrow.className = "ng-carousel-arrow ng-carousel-arrow-next";
    nextArrow.innerHTML = "❯";

    // 应用箭头样式
    if (!this.config.arrowBackground) {
      nextArrow.classList.add("ng-arrow-no-bg");
    } else {
      nextArrow.classList.add(`ng-arrow-${this.config.arrowStyle}`);

      // 设置自定义样式
      if (this.config.arrowStyle === "minimal") {
        nextArrow.style.width = "60px";
        nextArrow.style.height = "60px";
        nextArrow.style.fontSize = "24px";
      }
    }

    nextArrow.addEventListener("click", (e) => {
      e.stopPropagation();
      this.next();
    });

    this.container.appendChild(prevArrow);
    this.container.appendChild(nextArrow);

    this.prevArrow = prevArrow;
    this.nextArrow = nextArrow;
  }

  /**
   * 创建指示点
   */
  createDots() {
    this.dotsContainer = document.createElement("div");
    this.dotsContainer.className = `ng-carousel-dots ng-carousel-dots-${this.config.dotPosition}`;

    this.dots = this.items.map((_, index) => {
      const dot = document.createElement("div");
      const dotClass =
        this.config.dotStyle === "line"
          ? "ng-carousel-dot-line"
          : "ng-carousel-dot-circle";
      dot.className = `${dotClass} ${
        index === 0 ? "ng-carousel-dot-active" : ""
      }`;
      dot.dataset.index = index;

      // 设置条形指示点尺寸
      if (this.config.dotStyle === "line") {
        dot.style.width = `${this.config.lineDotWidth}px`;
        dot.style.height = `${this.config.lineDotHeight}px`;
      }

      if (this.config.progressDots) {
        const progress = document.createElement("div");
        progress.className = "ng-carousel-dot-progress";
        dot.appendChild(progress);
        dot.progressElement = progress;
      }

      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        this.goTo(index);
      });

      this.dotsContainer.appendChild(dot);
      return dot;
    });

    this.container.appendChild(this.dotsContainer);
  }

  /**
   * 创建指示器
   */
  createIndicator() {
    if (this.indicator) {
      this.indicator.remove();
    }

    this.indicator = document.createElement("div");
    this.indicator.className = "ng-carousel-indicator";
    this.updateIndicator();
    this.container.appendChild(this.indicator);
  }

  /**
   * 更新指示器
   */
  updateIndicator() {
    if (this.indicator && this.config.showIndicator) {
      this.indicator.textContent = `${this.currentIndex + 1} / ${
        this.totalItems
      }`;
    }
  }

  /**
   * 设置拖拽事件
   */
  setupDraggable() {
    let startX = 0;
    let isDragging = false;

    const handleDragStart = (e) => {
      startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
      isDragging = true;
      this.pauseAutoplay();
    };

    const handleDragMove = (e) => {
      if (!isDragging) return;

      const currentX = e.type.includes("mouse")
        ? e.clientX
        : e.touches[0].clientX;
      const diff = startX - currentX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
        isDragging = false;
      }
    };

    const handleDragEnd = () => {
      isDragging = false;
      if (this.config.autoplay) {
        this.startAutoplay();
      }
    };

    // 鼠标事件
    this.container.addEventListener("mousedown", handleDragStart);
    this.container.addEventListener("mousemove", handleDragMove);
    this.container.addEventListener("mouseup", handleDragEnd);
    this.container.addEventListener("mouseleave", handleDragEnd);

    // 触摸事件
    this.container.addEventListener("touchstart", handleDragStart);
    this.container.addEventListener("touchmove", handleDragMove);
    this.container.addEventListener("touchend", handleDragEnd);
  }

  /**
   * 设置悬停事件
   */
  setupHoverEvents() {
    this.container.addEventListener("mouseenter", () => {
      this.pauseAutoplay();
    });

    this.container.addEventListener("mouseleave", () => {
      if (this.config.autoplay) {
        this.startAutoplay();
      }
    });
  }

  /**
   * 切换到指定索引
   */
  goTo(index) {
    if (this.isAnimating || index === this.currentIndex) return;

    this.isAnimating = true;

    // 处理无限循环
    if (this.config.infinite) {
      if (index < 0) index = this.totalItems - 1;
      if (index >= this.totalItems) index = 0;
    } else {
      index = Math.max(0, Math.min(index, this.totalItems - 1));
    }

    const oldIndex = this.currentIndex;
    this.currentIndex = index;

    // 更新幻灯片
    this.items[oldIndex].classList.remove("ng-carousel-slide-active");
    this.items[index].classList.add("ng-carousel-slide-active");

    // 更新指示点
    if (this.dots) {
      this.dots[oldIndex].classList.remove("ng-carousel-dot-active");
      this.dots[index].classList.add("ng-carousel-dot-active");

      if (this.config.progressDots) {
        this.resetProgress();
        this.startProgress();
      }
    }

    // 更新指示器
    this.updateIndicator();

    // 触发自定义事件
    this.triggerEvent("slideChange", {
      previousIndex: oldIndex,
      currentIndex: index,
      total: this.totalItems,
    });

    // 动画结束后重置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, this.config.speed);
  }

  /**
   * 下一张
   */
  next() {
    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.totalItems && !this.config.infinite) return;
    this.goTo(nextIndex);
  }

  /**
   * 上一张
   */
  prev() {
    const prevIndex = this.currentIndex - 1;
    if (prevIndex < 0 && !this.config.infinite) return;
    this.goTo(prevIndex);
  }

  /**
   * 开始自动播放
   */
  startAutoplay() {
    this.pauseAutoplay();

    if (this.config.autoplay && this.totalItems > 1) {
      this.timer = setInterval(() => {
        this.next();
      }, this.config.interval);

      if (this.config.progressDots) {
        this.startProgress();
      }
    }
  }

  /**
   * 暂停自动播放
   */
  pauseAutoplay() {
    clearInterval(this.timer);
    clearInterval(this.progressTimer);
  }

  /**
   * 开始进度指示
   */
  startProgress() {
    if (!this.dots || !this.config.progressDots) return;

    const currentDot = this.dots[this.currentIndex];
    if (currentDot && currentDot.progressElement) {
      currentDot.progressElement.style.transition = `width ${this.config.interval}ms linear`;
      currentDot.progressElement.style.width = "100%";
    }
  }

  /**
   * 重置进度指示
   */
  resetProgress() {
    if (!this.dots || !this.config.progressDots) return;

    this.dots.forEach((dot) => {
      if (dot.progressElement) {
        dot.progressElement.style.transition = "none";
        dot.progressElement.style.width = "0%";
        void dot.progressElement.offsetWidth; // 触发重绘
      }
    });
  }

  /**
   * 更新颜色配置
   */
  updateColors(newColors) {
    Object.assign(this.config.colors, newColors);
    this.injectInstanceStyles();

    // 触发颜色更新事件
    this.triggerEvent("colorsUpdated", { colors: this.config.colors });
  }

  /**
   * 更新指示器显示状态
   */
  updateIndicatorVisibility(show) {
    this.config.showIndicator = show;
    if (show && !this.indicator) {
      this.createIndicator();
    } else if (!show && this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }
  }

  /**
   * 添加新项目
   */
  addItem(item) {
    const index = this.totalItems;

    const slide = document.createElement("div");
    slide.className = "ng-carousel-slide";
    slide.dataset.index = index;

    const content = document.createElement("div");
    content.className = "ng-carousel-slide-content";

    if (typeof item === "string") {
      content.innerHTML = item;
    } else if (item instanceof HTMLElement) {
      content.appendChild(item.cloneNode(true));
    } else if (item.content) {
      if (typeof item.content === "string") {
        content.innerHTML = item.content;
      } else if (item.content instanceof HTMLElement) {
        content.appendChild(item.content.cloneNode(true));
      }
    }

    slide.appendChild(content);
    this.slidesContainer.appendChild(slide);
    this.items.push(slide);

    this.totalItems++;

    // 重新创建指示点
    if (this.config.showDots) {
      this.dotsContainer?.remove();
      this.createDots();
    }

    // 创建箭头（如果之前没有）
    if (this.config.showArrows && this.totalItems === 2) {
      this.createArrows();
    }

    this.updateIndicator();
  }

  /**
   * 通过选择器添加项目
   */
  addItemsBySelector(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      this.addItem(element);
    });
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    // 保存当前索引
    const currentIndex = this.currentIndex;

    // 暂停自动播放
    this.pauseAutoplay();

    // 处理颜色配置
    if (newConfig.colors) {
      this.updateColors(newConfig.colors);
      delete newConfig.colors;
    }

    // 处理指示器配置
    if (newConfig.showIndicator !== undefined) {
      this.updateIndicatorVisibility(newConfig.showIndicator);
    }

    // 更新其他配置
    Object.assign(this.config, newConfig);

    // 重新初始化（但保留当前索引）
    this.container.classList.remove(this.instanceId);
    this.instanceId =
      "ng-carousel-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substr(2, 9);
    this.container.classList.add(this.instanceId);

    // 重新注入样式
    this.injectInstanceStyles();

    // 重新创建箭头（如果需要）
    if (this.prevArrow) this.prevArrow.remove();
    if (this.nextArrow) this.nextArrow.remove();
    if (this.config.showArrows && this.totalItems > 1) {
      this.createArrows();
    }

    // 重新创建指示点（如果需要）
    if (this.dotsContainer) this.dotsContainer.remove();
    if (this.config.showDots && this.totalItems > 1) {
      this.createDots();
    }

    // 重新创建指示器（如果需要）
    if (this.indicator) this.indicator.remove();
    this.indicator = null;
    if (this.config.showIndicator) {
      this.createIndicator();
    }

    // 恢复当前索引
    this.currentIndex = Math.min(currentIndex, this.totalItems - 1);
    this.items.forEach((slide, index) => {
      slide.classList.toggle(
        "ng-carousel-slide-active",
        index === this.currentIndex
      );
    });

    // 更新指示点
    if (this.dots) {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle(
          "ng-carousel-dot-active",
          index === this.currentIndex
        );
      });
    }

    // 更新指示器
    this.updateIndicator();

    // 重新开始自动播放
    if (this.config.autoplay && this.totalItems > 1) {
      this.startAutoplay();
    }

    // 触发配置更新事件
    this.triggerEvent("configUpdated", { config: this.config });
  }

  /**
   * 获取当前颜色配置
   */
  getColors() {
    return { ...this.config.colors };
  }

  /**
   * 设置预设颜色主题
   */
  setTheme(themeName) {
    const themes = {
      light: {
        dotColor: "rgba(0, 0, 0, 0.3)",
        dotActiveColor: "#1890ff",
        dotHoverColor: "rgba(0, 0, 0, 0.5)",
        progressColor: "#1890ff",
        arrowColor: "#333333",
        arrowHoverColor: "#1890ff",
        arrowBackgroundColor: "rgba(255, 255, 255, 0.8)",
        arrowHoverBackgroundColor: "rgba(255, 255, 255, 1)",
        arrowBorderColor: "rgba(0, 0, 0, 0.3)",
        arrowHoverBorderColor: "#1890ff",
        indicatorBackground: "rgba(255, 255, 255, 0.8)",
        indicatorColor: "#333333",
      },
      dark: {
        dotColor: "rgba(255, 255, 255, 0.3)",
        dotActiveColor: "#40a9ff",
        dotHoverColor: "rgba(255, 255, 255, 0.5)",
        progressColor: "#40a9ff",
        arrowColor: "#ffffff",
        arrowHoverColor: "#40a9ff",
        arrowBackgroundColor: "rgba(0, 0, 0, 0.5)",
        arrowHoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
        arrowBorderColor: "rgba(255, 255, 255, 0.5)",
        arrowHoverBorderColor: "#40a9ff",
        indicatorBackground: "rgba(0, 0, 0, 0.5)",
        indicatorColor: "#ffffff",
      },
      blue: {
        dotColor: "rgba(255, 255, 255, 0.5)",
        dotActiveColor: "#096dd9",
        dotHoverColor: "rgba(255, 255, 255, 0.7)",
        progressColor: "#096dd9",
        arrowColor: "#ffffff",
        arrowHoverColor: "#69c0ff",
        arrowBackgroundColor: "rgba(24, 144, 255, 0.7)",
        arrowHoverBackgroundColor: "rgba(24, 144, 255, 0.9)",
        arrowBorderColor: "#91d5ff",
        arrowHoverBorderColor: "#69c0ff",
        indicatorBackground: "rgba(24, 144, 255, 0.8)",
        indicatorColor: "#ffffff",
      },
      green: {
        dotColor: "rgba(255, 255, 255, 0.5)",
        dotActiveColor: "#52c41a",
        dotHoverColor: "rgba(255, 255, 255, 0.7)",
        progressColor: "#52c41a",
        arrowColor: "#ffffff",
        arrowHoverColor: "#73d13d",
        arrowBackgroundColor: "rgba(82, 196, 26, 0.7)",
        arrowHoverBackgroundColor: "rgba(82, 196, 26, 0.9)",
        arrowBorderColor: "#95de64",
        arrowHoverBorderColor: "#73d13d",
        indicatorBackground: "rgba(82, 196, 26, 0.8)",
        indicatorColor: "#ffffff",
      },
      purple: {
        dotColor: "rgba(255, 255, 255, 0.5)",
        dotActiveColor: "#722ed1",
        dotHoverColor: "rgba(255, 255, 255, 0.7)",
        progressColor: "#722ed1",
        arrowColor: "#ffffff",
        arrowHoverColor: "#9254de",
        arrowBackgroundColor: "rgba(114, 46, 209, 0.7)",
        arrowHoverBackgroundColor: "rgba(114, 46, 209, 0.9)",
        arrowBorderColor: "#b37feb",
        arrowHoverBorderColor: "#9254de",
        indicatorBackground: "rgba(114, 46, 209, 0.8)",
        indicatorColor: "#ffffff",
      },
    };

    if (themes[themeName]) {
      this.updateColors(themes[themeName]);
    }
  }

  /**
   * 触发自定义事件
   */
  triggerEvent(eventName, detail) {
    const event = new CustomEvent(`ng.carousel.${eventName}`, {
      detail,
      bubbles: true,
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      currentIndex: this.currentIndex,
      totalItems: this.totalItems,
      config: { ...this.config },
      isPlaying: !!this.timer,
    };
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.pauseAutoplay();
    this.container.innerHTML = "";
    this.container.classList.remove("ng-carousel", this.instanceId);

    // 移除实例样式
    const style = document.getElementById(this.instanceId + "-styles");
    if (style) style.remove();
  }
}

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = FullConfigNGCarousel;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return FullConfigNGCarousel;
  });
} else {
  window.FullConfigNGCarousel = FullConfigNGCarousel;
}
