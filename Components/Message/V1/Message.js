// Message.js
class Message {
  constructor() {
    this.containers = {};
    this.messageCount = 0;
    this.initContainers();
    this.initStyles();
  }

  // 初始化容器
  initContainers() {
    const positions = ["center-top", "center-bottom", "left", "right"];

    positions.forEach((position) => {
      const container = document.createElement("div");
      container.className = `message-container ${position}`;
      container.id = `message-container-${position}`;
      document.body.appendChild(container);
      this.containers[position] = container;
    });
  }

  // 初始化样式
  initStyles() {
    if (document.getElementById("message-styles")) return;

    const style = document.createElement("style");
    style.id = "message-styles";
    style.textContent = `
            .message-container {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
            }
            
            .message-container.center-top,
            .message-container.center-bottom {
                left: 50%;
                transform: translateX(-50%);
            }
            
            .message-container.center-top {
                top: 24px;
            }
            
            .message-container.center-bottom {
                bottom: 24px;
            }
            
            .message-container.left {
                left: 24px;
                top: 24px;
            }
            
            .message-container.right {
                right: 24px;
                top: 24px;
            }
            
            .message-item {
                pointer-events: auto;
                min-width: 300px;
                max-width: 500px;
                padding: 12px 16px;
                margin-bottom: 16px;
                border-radius: 6px;
                box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                            0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                            0 9px 28px 8px rgba(0, 0, 0, 0.05);
                background-color: white;
                display: flex;
                align-items: flex-start;
                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                position: relative;
                overflow: hidden;
                opacity: 0;
                transform: translateY(-20px);
            }
            
            .message-item.left-entering {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .message-item.right-entering {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .message-item.entered {
                opacity: 1;
                transform: translateY(0) translateX(0);
            }
            
            .message-item.hiding-left {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .message-item.hiding-right {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .message-item.hiding-up {
                transform: translateY(-100%);
                opacity: 0;
            }
            
            .message-item.hiding-down {
                transform: translateY(100%);
                opacity: 0;
            }
            
            .message-icon {
                margin-right: 12px;
                font-size: 18px;
                line-height: 1;
                display: flex;
                align-items: center;
                height: 22px;
                flex-shrink: 0;
            }
            
            .message-content {
                flex: 1;
                font-size: 14px;
                line-height: 1.5715;
                color: rgba(0, 0, 0, 0.85);
            }
            
            .message-close {
                margin-left: 12px;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.45);
                font-size: 14px;
                line-height: 1;
                padding: 2px;
                transition: color 0.3s;
                display: flex;
                align-items: center;
                height: 22px;
                flex-shrink: 0;
            }
            
            .message-close:hover {
                color: rgba(0, 0, 0, 0.85);
            }
            
            .message-normal,
            .message-info {
                border-left: 4px solid #1890ff;
            }
            
            .message-success {
                border-left: 4px solid #52c41a;
            }
            
            .message-error {
                border-left: 4px solid #ff4d4f;
            }
            
            .message-warning {
                border-left: 4px solid #faad14;
            }
            
            .message-important {
                border-left: 4px solid #722ed1;
                background-color: #f9f0ff;
            }
            
            .message-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                background-color: rgba(0, 0, 0, 0.06);
                width: 100%;
            }
            
            .message-progress-bar {
                height: 100%;
                background-color: #1890ff;
                width: 100%;
                transition: width linear;
            }
            
            .message-progress-bar.success {
                background-color: #52c41a;
            }
            
            .message-progress-bar.error {
                background-color: #ff4d4f;
            }
            
            .message-progress-bar.warning {
                background-color: #faad14;
            }
            
            .message-progress-bar.important {
                background-color: #722ed1;
            }
        `;

    document.head.appendChild(style);
  }

  // 显示消息
  show(options) {
    // 处理参数
    const config = typeof options === "string" ? { content: options } : options;

    // 默认配置
    const defaultConfig = {
      type: "info",
      content: "",
      duration: 3,
      position: "center-top",
      hideDirection: "up",
      showClose: null,
      onClose: null,
    };

    // 合并配置
    const mergedConfig = { ...defaultConfig, ...config };

    // 根据位置确定默认行为
    if (mergedConfig.showClose === null) {
      mergedConfig.showClose =
        mergedConfig.position === "left" || mergedConfig.position === "right";
    }

    // 居中底部默认向下消失
    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "center-bottom"
    ) {
      mergedConfig.hideDirection = "down";
    }

    // 左侧默认向左消失，右侧默认向右消失
    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "left"
    ) {
      mergedConfig.hideDirection = "left";
    }

    if (
      mergedConfig.hideDirection === "up" &&
      mergedConfig.position === "right"
    ) {
      mergedConfig.hideDirection = "right";
    }

    // 创建消息元素
    const messageId = `message-${Date.now()}-${this.messageCount++}`;
    const messageItem = document.createElement("div");
    messageItem.id = messageId;
    messageItem.className = `message-item message-${mergedConfig.type}`;

    // 设置入场动画类
    if (mergedConfig.position === "left") {
      messageItem.classList.add("left-entering");
    } else if (mergedConfig.position === "right") {
      messageItem.classList.add("right-entering");
    }

    // 图标
    const iconMap = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      important: "🔔",
    };

    const iconSpan = document.createElement("span");
    iconSpan.className = "message-icon";
    iconSpan.textContent = iconMap[mergedConfig.type] || iconMap["info"];

    // 内容
    const contentSpan = document.createElement("span");
    contentSpan.className = "message-content";
    contentSpan.textContent = mergedConfig.content;

    // 关闭按钮
    const closeSpan = document.createElement("span");
    closeSpan.className = "message-close";
    closeSpan.innerHTML = "&times;";
    closeSpan.onclick = () =>
      this.closeMessage(
        messageId,
        mergedConfig.position,
        mergedConfig.hideDirection,
        mergedConfig.onClose
      );

    // 进度条
    let progressBar = null;
    if (mergedConfig.duration > 0) {
      const progressDiv = document.createElement("div");
      progressDiv.className = "message-progress";

      progressBar = document.createElement("div");
      progressBar.className = `message-progress-bar ${mergedConfig.type}`;

      // 设置进度条动画
      progressBar.style.transitionDuration = `${mergedConfig.duration}s`;
      progressBar.style.width = "100%";

      progressDiv.appendChild(progressBar);
      messageItem.appendChild(progressDiv);

      // 开始进度条动画
      setTimeout(() => {
        if (progressBar) {
          progressBar.style.width = "0%";
        }
      }, 10);
    }

    // 组装消息
    messageItem.appendChild(iconSpan);
    messageItem.appendChild(contentSpan);

    if (mergedConfig.showClose) {
      messageItem.appendChild(closeSpan);
    }

    // 添加到对应容器
    const container = this.containers[mergedConfig.position];
    if (container) {
      // 添加到容器的顶部
      if (container.firstChild) {
        container.insertBefore(messageItem, container.firstChild);
      } else {
        container.appendChild(messageItem);
      }

      // 触发入场动画
      setTimeout(() => {
        messageItem.classList.add("entered");
      }, 10);
    }

    // 自动关闭
    let timeoutId = null;
    if (mergedConfig.duration > 0) {
      timeoutId = setTimeout(() => {
        this.closeMessage(
          messageId,
          mergedConfig.position,
          mergedConfig.hideDirection,
          mergedConfig.onClose
        );
      }, mergedConfig.duration * 1000);
    }

    // 保存关闭信息
    messageItem._messageData = {
      timeoutId,
      onClose: mergedConfig.onClose,
    };

    return messageId;
  }

  // 关闭消息
  closeMessage(messageId, position, hideDirection, onClose) {
    const message = document.getElementById(messageId);
    if (!message) return;

    // 清除定时器
    if (message._messageData && message._messageData.timeoutId) {
      clearTimeout(message._messageData.timeoutId);
    }

    // 触发关闭回调
    if (onClose) {
      onClose();
    } else if (message._messageData && message._messageData.onClose) {
      message._messageData.onClose();
    }

    // 添加消失动画类
    message.classList.add(`hiding-${hideDirection}`);

    // 动画结束后移除元素
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 300);
  }

  // 清除所有消息
  clear() {
    Object.keys(this.containers).forEach((position) => {
      const container = this.containers[position];
      const messages = container.querySelectorAll(".message-item");

      messages.forEach((message) => {
        // 清除定时器
        if (message._messageData && message._messageData.timeoutId) {
          clearTimeout(message._messageData.timeoutId);
        }

        // 触发关闭动画
        let hideDirection = "up";
        if (position === "center-bottom") hideDirection = "down";
        if (position === "left") hideDirection = "left";
        if (position === "right") hideDirection = "right";

        message.classList.add(`hiding-${hideDirection}`);

        // 移除元素
        setTimeout(() => {
          if (message.parentNode === container) {
            container.removeChild(message);
          }
        }, 300);
      });
    });
  }

  // 快捷方法
  info(content, options = {}) {
    return this.show({ ...options, content, type: "info" });
  }

  success(content, options = {}) {
    return this.show({ ...options, content, type: "success" });
  }

  error(content, options = {}) {
    return this.show({ ...options, content, type: "error" });
  }

  warning(content, options = {}) {
    return this.show({ ...options, content, type: "warning" });
  }

  important(content, options = {}) {
    return this.show({ ...options, content, type: "important" });
  }

  // 别名方法
  normal(content, options = {}) {
    return this.info(content, options);
  }

  // 手动关闭指定消息
  close(messageId) {
    const message = document.getElementById(messageId);
    if (!message) return;

    const container = message.parentNode;
    if (!container) return;

    let position = "center-top";
    if (container.id.includes("center-bottom")) position = "center-bottom";
    if (container.id.includes("left")) position = "left";
    if (container.id.includes("right")) position = "right";

    let hideDirection = "up";
    if (position === "center-bottom") hideDirection = "down";
    if (position === "left") hideDirection = "left";
    if (position === "right") hideDirection = "right";

    this.closeMessage(messageId, position, hideDirection);
  }
}

// 创建全局实例（如果不存在）
if (typeof window !== "undefined" && !window.Message) {
  window.Message = new Message();
}

// 导出模块
if (typeof module !== "undefined" && module.exports) {
  module.exports = Message;
}

// // 快捷方法
// Message.info('普通消息');
// Message.success('成功消息');
// Message.error('错误消息');
// Message.warning('警告消息');
// Message.important('重要消息');

// // 完整配置
// Message.show({
//     type: 'success',
//     content: '操作成功',
//     duration: 5,
//     position: 'center-top',
//     hideDirection: 'up'
// });
