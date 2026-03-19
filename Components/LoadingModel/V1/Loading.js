/**
 * 磨砂玻璃模态框类
 * 支持多种加载动画类型和自定义标题、描述
 * 支持最小化和关闭功能，可拖动
 */
class FrostedModal {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.title - 模态框标题
   * @param {string} options.description - 加载描述文字
   * @param {string} options.animationType - 动画类型: 'spinner' | 'pulse' | 'wave' | 'bounce'
   * @param {boolean} options.closeOnClickOutside - 是否点击外部关闭
   * @param {boolean} options.showMinimizeButton - 是否显示最小化按钮
   * @param {boolean} options.showCloseButton - 是否显示关闭按钮
   * @param {Object} options.defaultPosition - 默认位置 { x, y }
   */
  constructor(options = {}) {
    this.options = {
      title: "加载中",
      description: "请稍候...",
      animationType: "spinner",
      closeOnClickOutside: false,
      showMinimizeButton: true,
      showCloseButton: true,
      defaultPosition: { x: window.innerWidth - 340, y: 20 },
      ...options,
    };

    this.modal = null;
    this.isVisible = false;
    this.isMinimized = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // 动画类型配置
    this.animations = {
      spinner: this.createSpinnerAnimation.bind(this),
      pulse: this.createPulseAnimation.bind(this),
      wave: this.createWaveAnimation.bind(this),
      bounce: this.createBounceAnimation.bind(this),
    };

    // 绑定事件处理函数
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragMove = this.handleDragMove.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  /**
   * 创建模态框DOM结构
   */
  createModal() {
    // 创建遮罩层
    const overlay = document.createElement("div");
    overlay.className = "frosted-modal-overlay";

    // 创建模态框容器
    const modalContainer = document.createElement("div");
    modalContainer.className = "frosted-modal-container";

    // 设置初始位置
    modalContainer.style.left = `${this.options.defaultPosition.x}px`;
    modalContainer.style.top = `${this.options.defaultPosition.y}px`;

    // 创建模态框内容
    const modalContent = document.createElement("div");
    modalContent.className = "frosted-modal-content";

    // 创建标题栏（用于拖动）
    const titleBar = document.createElement("div");
    titleBar.className = "frosted-modal-titlebar";

    // 创建标题
    const titleElement = document.createElement("h2");
    titleElement.className = "frosted-modal-title";
    titleElement.textContent = this.options.title;

    // 创建按钮组
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "frosted-modal-buttons";

    // 添加最小化按钮
    if (this.options.showMinimizeButton) {
      const minimizeBtn = document.createElement("button");
      minimizeBtn.className = "frosted-modal-btn minimize-btn";
      minimizeBtn.innerHTML = "−";
      minimizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMinimize();
      });
      buttonGroup.appendChild(minimizeBtn);
    }

    // 添加关闭按钮
    if (this.options.showCloseButton) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "frosted-modal-btn close-btn";
      closeBtn.innerHTML = "×";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hide();
      });
      buttonGroup.appendChild(closeBtn);
    }

    titleBar.appendChild(titleElement);
    titleBar.appendChild(buttonGroup);

    // 创建主体内容容器
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "frosted-modal-body";

    // 创建动画容器
    const animationContainer = document.createElement("div");
    animationContainer.className = "frosted-modal-animation";

    // 根据类型创建动画
    const createAnimation =
      this.animations[this.options.animationType] || this.animations.spinner;
    const animationElement = createAnimation();
    animationContainer.appendChild(animationElement);

    // 创建描述
    const descriptionElement = document.createElement("p");
    descriptionElement.className = "frosted-modal-description";
    descriptionElement.textContent = this.options.description;

    // 组装元素
    bodyContainer.appendChild(animationContainer);
    bodyContainer.appendChild(descriptionElement);

    modalContent.appendChild(titleBar);
    modalContent.appendChild(bodyContainer);
    modalContainer.appendChild(modalContent);
    overlay.appendChild(modalContainer);

    // 添加点击外部关闭事件
    if (this.options.closeOnClickOutside) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.hide();
        }
      });
    }

    // 添加拖动事件
    titleBar.addEventListener("mousedown", this.handleDragStart);

    // 添加样式
    this.addStyles();

    this.modal = overlay;
    document.body.appendChild(this.modal);
  }

  /**
   * 处理拖动开始
   */
  handleDragStart(e) {
    if (e.button !== 0) return; // 只响应左键

    const modalContainer = this.modal.querySelector(".frosted-modal-container");
    const rect = modalContainer.getBoundingClientRect();

    this.isDragging = true;
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    modalContainer.classList.add("dragging");

    document.addEventListener("mousemove", this.handleDragMove);
    document.addEventListener("mouseup", this.handleDragEnd);

    e.preventDefault();
  }

  /**
   * 处理拖动移动
   */
  handleDragMove(e) {
    if (!this.isDragging) return;

    const modalContainer = this.modal.querySelector(".frosted-modal-container");

    let newX = e.clientX - this.dragOffset.x;
    let newY = e.clientY - this.dragOffset.y;

    // 边界限制
    const containerRect = modalContainer.getBoundingClientRect();
    const maxX = window.innerWidth - containerRect.width;
    const maxY = window.innerHeight - containerRect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    modalContainer.style.left = `${newX}px`;
    modalContainer.style.top = `${newY}px`;

    e.preventDefault();
  }

  /**
   * 处理拖动结束
   */
  handleDragEnd(e) {
    if (this.isDragging) {
      this.isDragging = false;

      const modalContainer = this.modal.querySelector(
        ".frosted-modal-container",
      );
      modalContainer.classList.remove("dragging");

      document.removeEventListener("mousemove", this.handleDragMove);
      document.removeEventListener("mouseup", this.handleDragEnd);
    }

    e.preventDefault();
  }

  /**
   * 切换最小化状态
   */
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;

    const modalContainer = this.modal.querySelector(".frosted-modal-container");
    const bodyContainer = this.modal.querySelector(".frosted-modal-body");
    const minimizeBtn = this.modal.querySelector(".minimize-btn");

    if (this.isMinimized) {
      modalContainer.classList.add("minimized");
      bodyContainer.style.display = "none";
      minimizeBtn.innerHTML = "□";
    } else {
      modalContainer.classList.remove("minimized");
      bodyContainer.style.display = "block";
      minimizeBtn.innerHTML = "−";
    }
  }

  /**
   * 创建旋转加载动画
   */
  createSpinnerAnimation() {
    const container = document.createElement("div");
    container.className = "spinner-container";

    const spinner = document.createElement("div");
    spinner.className = "spinner";
    container.appendChild(spinner);

    return container;
  }

  /**
   * 创建脉冲动画
   */
  createPulseAnimation() {
    const container = document.createElement("div");
    container.className = "pulse-container";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "pulse-dot";
      dot.style.animationDelay = `${i * 0.2}s`;
      container.appendChild(dot);
    }

    return container;
  }

  /**
   * 创建波浪动画
   */
  createWaveAnimation() {
    const container = document.createElement("div");
    container.className = "wave-container";

    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("div");
      bar.className = "wave-bar";
      bar.style.animationDelay = `${i * 0.1}s`;
      container.appendChild(bar);
    }

    return container;
  }

  /**
   * 创建弹跳动画
   */
  createBounceAnimation() {
    const container = document.createElement("div");
    container.className = "bounce-container";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "bounce-dot";
      dot.style.animationDelay = `${i * 0.16}s`;
      container.appendChild(dot);
    }

    return container;
  }

  /**
   * 添加CSS样式
   */
  addStyles() {
    const styleId = "frosted-modal-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
            .frosted-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 9999;
            }
            
            .frosted-modal-container {
                position: absolute;
                width: 320px;
                pointer-events: all;
                cursor: default;
                transform: scale(1);
                transition: box-shadow 0.3s ease;
            }
            
            .frosted-modal-container.dragging {
                opacity: 0.9;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
                transition: none;
            }
            
            .frosted-modal-container.minimized {
                width: 200px;
            }
            
            .frosted-modal-content {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 24px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1),
                            0 3px 10px rgba(0, 0, 0, 0.05),
                            inset 0 1px 2px rgba(255, 255, 255, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.4);
                overflow: hidden;
            }
            
            .frosted-modal-titlebar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                cursor: move;
                background: rgba(255, 255, 255, 0.3);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                user-select: none;
            }
            
            .frosted-modal-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1a1a1a;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                letter-spacing: -0.3px;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .frosted-modal-buttons {
                display: flex;
                gap: 8px;
            }
            
            .frosted-modal-btn {
                width: 28px;
                height: 28px;
                border: none;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                color: #4a4a4a;
                font-size: 20px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .frosted-modal-btn:hover {
                background: rgba(255, 255, 255, 0.9);
                transform: scale(1.05);
            }
            
            .minimize-btn:hover {
                background: #4a90e2;
                color: white;
            }
            
            .close-btn:hover {
                background: #ff6b6b;
                color: white;
            }
            
            .frosted-modal-body {
                padding: 30px 20px;
                transition: all 0.3s ease;
            }
            
            .frosted-modal-animation {
                margin: 20px 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 80px;
            }
            
            .frosted-modal-description {
                margin: 20px 0 0 0;
                font-size: 15px;
                color: #4a4a4a;
                font-weight: 400;
                text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
                text-align: center;
            }
            
            /* 最小化状态样式 */
            .minimized .frosted-modal-content {
                border-radius: 16px;
            }
            
            .minimized .frosted-modal-titlebar {
                padding: 12px 16px;
            }
            
            .minimized .frosted-modal-title {
                font-size: 16px;
            }
            
            /* 旋转动画样式 */
            .spinner-container {
                width: 50px;
                height: 50px;
            }
            
            .spinner {
                width: 100%;
                height: 100%;
                border: 3px solid rgba(74, 144, 226, 0.2);
                border-top: 3px solid #4a90e2;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.2);
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* 脉冲动画样式 */
            .pulse-container {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .pulse-dot {
                width: 12px;
                height: 12px;
                background: #4a90e2;
                border-radius: 50%;
                animation: pulse 1.5s ease-in-out infinite;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.4);
            }
            
            @keyframes pulse {
                0%, 100% { 
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                50% { 
                    transform: scale(1.2);
                    opacity: 1;
                }
            }
            
            /* 波浪动画样式 */
            .wave-container {
                display: flex;
                gap: 4px;
                align-items: center;
                height: 40px;
            }
            
            .wave-bar {
                width: 6px;
                height: 20px;
                background: linear-gradient(180deg, #4a90e2, #67b26f);
                border-radius: 3px;
                animation: wave 1s ease-in-out infinite;
                box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
            }
            
            @keyframes wave {
                0%, 100% { 
                    height: 20px;
                }
                50% { 
                    height: 40px;
                }
            }
            
            /* 弹跳动画样式 */
            .bounce-container {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            
            .bounce-dot {
                width: 14px;
                height: 14px;
                background: linear-gradient(135deg, #4a90e2, #9b59b6);
                border-radius: 50%;
                animation: bounce 1.4s ease-in-out infinite;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.4);
            }
            
            @keyframes bounce {
                0%, 80%, 100% { 
                    transform: translateY(0);
                }
                40% { 
                    transform: translateY(-15px);
                }
            }
            
            /* 响应式调整 */
            @media (max-width: 480px) {
                .frosted-modal-container {
                    width: 280px;
                }
                
                .frosted-modal-container.minimized {
                    width: 160px;
                }
                
                .frosted-modal-titlebar {
                    padding: 12px 16px;
                }
                
                .frosted-modal-body {
                    padding: 20px 15px;
                }
            }
        `;

    document.head.appendChild(style);
  }

  /**
   * 显示模态框
   */
  show() {
    if (!this.modal) {
      this.createModal();
    }

    // 重置最小化状态
    if (this.isMinimized) {
      this.toggleMinimize();
    }

    this.isVisible = true;
  }

  /**
   * 隐藏模态框
   */
  hide() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
    }

    this.isVisible = false;
    this.isMinimized = false;
  }

  /**
   * 更新标题
   * @param {string} title - 新标题
   */
  setTitle(title) {
    this.options.title = title;
    if (this.modal) {
      const titleElement = this.modal.querySelector(".frosted-modal-title");
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
  }

  /**
   * 更新描述
   * @param {string} description - 新描述
   */
  setDescription(description) {
    this.options.description = description;
    if (this.modal) {
      const descElement = this.modal.querySelector(
        ".frosted-modal-description",
      );
      if (descElement) {
        descElement.textContent = description;
      }
    }
  }

  /**
   * 更新动画类型
   * @param {string} animationType - 新动画类型
   */
  setAnimationType(animationType) {
    if (this.animations[animationType]) {
      this.options.animationType = animationType;

      if (this.modal) {
        const animationContainer = this.modal.querySelector(
          ".frosted-modal-animation",
        );
        if (animationContainer) {
          animationContainer.innerHTML = "";
          const createAnimation = this.animations[animationType];
          const animationElement = createAnimation();
          animationContainer.appendChild(animationElement);
        }
      }
    }
  }

  /**
   * 设置位置
   * @param {number} x - 左偏移
   * @param {number} y - 上偏移
   */
  setPosition(x, y) {
    if (this.modal) {
      const modalContainer = this.modal.querySelector(
        ".frosted-modal-container",
      );
      modalContainer.style.left = `${x}px`;
      modalContainer.style.top = `${y}px`;
    }
  }

  /**
   * 销毁模态框
   */
  destroy() {
    this.hide();
    // 移除全局事件监听
    document.removeEventListener("mousemove", this.handleDragMove);
    document.removeEventListener("mouseup", this.handleDragEnd);
  }
}

// 导出类（支持CommonJS和AMD模块规范）
if (typeof module !== "undefined" && module.exports) {
  module.exports = FrostedModal;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return FrostedModal;
  });
} else {
  window.FrostedModal = FrostedModal;
}
