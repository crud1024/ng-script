/**
 * 磨砂玻璃模态框类
 * 支持多种加载动画类型和自定义标题、描述
 */
class FrostedModal {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.title - 模态框标题
   * @param {string} options.description - 加载描述文字
   * @param {string} options.animationType - 动画类型: 'spinner' | 'pulse' | 'wave' | 'bounce'
   * @param {boolean} options.closeOnClickOutside - 是否点击外部关闭
   */
  constructor(options = {}) {
    this.options = {
      title: "加载中",
      description: "请稍候...",
      animationType: "spinner",
      closeOnClickOutside: false,
      ...options,
    };

    this.modal = null;
    this.isVisible = false;

    // 动画类型配置
    this.animations = {
      spinner: this.createSpinnerAnimation.bind(this),
      pulse: this.createPulseAnimation.bind(this),
      wave: this.createWaveAnimation.bind(this),
      bounce: this.createBounceAnimation.bind(this),
    };
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

    // 创建模态框内容
    const modalContent = document.createElement("div");
    modalContent.className = "frosted-modal-content";

    // 创建标题
    const titleElement = document.createElement("h2");
    titleElement.className = "frosted-modal-title";
    titleElement.textContent = this.options.title;

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
    modalContent.appendChild(titleElement);
    modalContent.appendChild(animationContainer);
    modalContent.appendChild(descriptionElement);
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

    // 添加样式
    this.addStyles();

    this.modal = overlay;
    document.body.appendChild(this.modal);
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
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .frosted-modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            .frosted-modal-container {
                padding: 20px;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .frosted-modal-overlay.show .frosted-modal-container {
                transform: scale(1);
            }
            
            .frosted-modal-content {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 32px;
                padding: 40px;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1),
                            0 4px 12px rgba(0, 0, 0, 0.05),
                            inset 0 1px 2px rgba(255, 255, 255, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.4);
                text-align: center;
            }
            
            .frosted-modal-title {
                margin: 0 0 24px 0;
                font-size: 24px;
                font-weight: 600;
                color: #1a1a1a;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                letter-spacing: -0.5px;
            }
            
            .frosted-modal-animation {
                margin: 30px 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .frosted-modal-description {
                margin: 20px 0 0 0;
                font-size: 16px;
                color: #4a4a4a;
                font-weight: 400;
                text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
            }
            
            /* 旋转动画样式 */
            .spinner-container {
                width: 60px;
                height: 60px;
            }
            
            .spinner {
                width: 100%;
                height: 100%;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #4a90e2;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* 脉冲动画样式 */
            .pulse-container {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .pulse-dot {
                width: 14px;
                height: 14px;
                background: #4a90e2;
                border-radius: 50%;
                animation: pulse 1.5s ease-in-out infinite;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.5);
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
                gap: 5px;
                align-items: center;
                height: 40px;
            }
            
            .wave-bar {
                width: 8px;
                height: 20px;
                background: linear-gradient(180deg, #4a90e2, #67b26f);
                border-radius: 4px;
                animation: wave 1s ease-in-out infinite;
                box-shadow: 0 0 10px rgba(74, 144, 226, 0.4);
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
                gap: 8px;
                align-items: center;
            }
            
            .bounce-dot {
                width: 16px;
                height: 16px;
                background: linear-gradient(135deg, #4a90e2, #9b59b6);
                border-radius: 50%;
                animation: bounce 1.4s ease-in-out infinite;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.5);
            }
            
            @keyframes bounce {
                0%, 80%, 100% { 
                    transform: translateY(0);
                }
                40% { 
                    transform: translateY(-20px);
                }
            }
            
            /* 响应式调整 */
            @media (max-width: 480px) {
                .frosted-modal-content {
                    padding: 30px 20px;
                    min-width: 260px;
                }
                
                .frosted-modal-title {
                    font-size: 20px;
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

    // 延迟一帧以触发动画
    requestAnimationFrame(() => {
      this.modal.classList.add("show");
    });

    this.isVisible = true;
  }

  /**
   * 隐藏模态框
   */
  hide() {
    if (this.modal) {
      this.modal.classList.remove("show");

      // 等待动画完成后移除
      setTimeout(() => {
        if (this.modal && this.modal.parentNode) {
          this.modal.parentNode.removeChild(this.modal);
          this.modal = null;
        }
      }, 300);
    }

    this.isVisible = false;
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
          // 清空并创建新动画
          animationContainer.innerHTML = "";
          const createAnimation = this.animations[animationType];
          const animationElement = createAnimation();
          animationContainer.appendChild(animationElement);
        }
      }
    }
  }

  /**
   * 销毁模态框
   */
  destroy() {
    this.hide();
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

// // 创建模态框实例
//         const modal = new FrostedModal({
//             title: '系统处理中',
//             description: '正在加载数据，请稍候...',
//             animationType: 'spinner',
//             closeOnClickOutside: true
//         });

//         function showSpinner() {
//             modal.setAnimationType('spinner');
//             modal.setTitle('加载中');
//             modal.setDescription('请稍候...');
//             modal.show();

//             // 3秒后自动隐藏
//             setTimeout(() => modal.hide(), 3000);
//         }

//         function showPulse() {
//             modal.setAnimationType('pulse');
//             modal.setTitle('脉冲动画');
//             modal.setDescription('正在处理请求...');
//             modal.show();

//             setTimeout(() => modal.hide(), 3000);
//         }

//         function showWave() {
//             modal.setAnimationType('wave');
//             modal.setTitle('波浪动画');
//             modal.setDescription('数据同步中...');
//             modal.show();

//             setTimeout(() => modal.hide(), 3000);
//         }

//         function showBounce() {
//             modal.setAnimationType('bounce');
//             modal.setTitle('弹跳动画');
//             modal.setDescription('正在提交...');
//             modal.show();

//             setTimeout(() => modal.hide(), 3000);
//         }

//         // 也可以直接创建临时实例
//         function showTemporary() {
//             const tempModal = new FrostedModal({
//                 title: '临时模态框',
//                 description: '3秒后自动关闭',
//                 animationType: 'wave',
//                 closeOnClickOutside: false
//             });
//             tempModal.show();

//             setTimeout(() => tempModal.hide(), 3000);
//         }
