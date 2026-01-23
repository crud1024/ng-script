/**
 * 树形结构展开控制面板
 * @param {Object} options - 配置选项
 * @param {number} [options.defaultLevels=5] - 默认显示的层级按钮数量
 * @param {number} [options.maxCustomLevel=25] - 自定义输入的最大层级
 * @param {string} [options.toolbarSelector='div.udp-panel-title#_rq_'] - 工具栏容器选择器
 * @param {string} [options.containerSelector='.row-hover.rows-container.editable'] - 树形结构容器选择器
 * @param {number} [options.animationDelay=100] - 动画延迟时间(ms)
 * @param {Object} [options.position] - 插入位置配置
 * @param {number} [options.position.index=0] - 目标元素中的子元素索引
 * @param {string} [options.position.side='after'] - 插入位置 ('before' | 'after')
 * @param {Object} [options.margin] - 边距配置
 * @param {string} [options.margin.left='0 1% 0 1%'] - 左边距
 * @param {string} [options.margin.right=''] - 右边距
 * @param {string} [options.defaultState='expanded'] - 默认状态 ('collapsed' | 'level' | 'expanded')
 * @param {number} [options.defaultLevel=1] - 默认展开层级（当defaultState='level'时有效）
 */
function createTreeExpandPanel(options = {}) {
  // 合并默认配置
  const config = {
    defaultLevels: 5,
    maxCustomLevel: 25,
    toolbarSelector: "div.udp-panel-title#_rq_",
    containerSelector: ".row-hover.rows-container.editable",
    animationDelay: 100,
    position: {
      index: 0,
      side: "after",
    },
    margin: {
      left: "0 1% 0 1%",
      right: "",
    },
    defaultState: "expanded", // 'collapsed', 'level', 'expanded'
    defaultLevel: 1,
    ...options,
  };

  // 确保position和margin对象存在
  config.position = { index: 0, side: "after", ...config.position };
  config.margin = { left: "0 1% 0 1%", right: "", ...config.margin };

  // 获取目标元素
  const toolbarDiv = document.querySelector(config.toolbarSelector);
  if (!toolbarDiv) {
    console.error(`未找到工具栏容器: ${config.toolbarSelector}`);
    return;
  }

  // 全局函数定义
  function expandToLevel(level = 0) {
    if (level <= 0) return;

    function collapseAllElements(callback) {
      const container = document.querySelector(config.containerSelector);
      if (!container) {
        console.log("未找到容器");
        return;
      }

      const elements = container.querySelectorAll(
        ".udp-row-expand-icon.udp-row-expand-icon-expanded"
      );
      if (elements.length > 0) {
        console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
        elements.forEach((el) => el.click());
        setTimeout(() => collapseAllElements(callback), config.animationDelay);
      } else {
        console.log("所有元素已收起");
        if (callback) callback();
      }
    }

    function startLevelExpansion(currentLevel = 0) {
      if (currentLevel >= level) {
        console.log(`已展开到第 ${level} 层，停止`);
        return;
      }

      const container = document.querySelector(config.containerSelector);
      if (!container) {
        console.log("未找到容器");
        return;
      }

      const elements = container.querySelectorAll(
        ".udp-row-expand-icon.udp-row-expand-icon-collapsed"
      );
      if (elements.length > 0) {
        console.log(
          `展开第 ${currentLevel + 1} 层，找到 ${elements.length} 个元素`
        );
        elements.forEach((el) => el.click());
        setTimeout(
          () => startLevelExpansion(currentLevel + 1),
          config.animationDelay
        );
      } else {
        console.log(`第 ${currentLevel + 1} 层无更多可展开元素，提前终止`);
      }
    }

    collapseAllElements(() => startLevelExpansion());
  }

  function expandAllElements() {
    const container = document.querySelector(config.containerSelector);
    if (!container) {
      console.log("未找到容器");
      return;
    }

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-collapsed"
    );
    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个折叠元素，正在展开...`);
      elements.forEach((el) => el.click());
      setTimeout(expandAllElements, config.animationDelay);
    } else {
      console.log("所有元素已展开");
    }
  }

  function collapseAllElements() {
    const container = document.querySelector(config.containerSelector);
    if (!container) {
      console.log("未找到容器");
      return;
    }

    const elements = container.querySelectorAll(
      ".udp-row-expand-icon.udp-row-expand-icon-expanded"
    );
    if (elements.length > 0) {
      console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
      elements.forEach((el) => el.click());
      setTimeout(collapseAllElements, config.animationDelay);
    } else {
      console.log("所有元素已收起");
    }
  }

  // 创建状态对象
  const panelState = {
    isExpanded: false,
    currentLevel: config.defaultLevel,
  };

  // 创建主面板 - 政府网站风格
  const panel = document.createElement("div");
  panel.className = "x-panel x-box-item x-panel-default";
  panel.id = "tree-expand-panel";

  // 构建边距样式
  const marginStyle = `${config.margin.left} ${config.margin.right}`.trim();

  panel.style.cssText = `
        margin: ${marginStyle};
        height: 40px;
        width: auto;
        min-width: ${480 + (config.defaultLevels - 5) * 40}px;
        background: #f8f9fa;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #d1d7dc;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        padding: 0 15px;
    `;

  // 创建"层级："标签
  const levelLabel = document.createElement("span");
  levelLabel.textContent = "层级";
  levelLabel.style.cssText = `
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
        color: #333;
        margin-right: 10px;
        white-space: nowrap;
    `;
  panel.appendChild(levelLabel);

  // 面板body
  const panelBody = document.createElement("div");
  panelBody.id = "tree-expand-panel-body";
  panelBody.style.cssText = `
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
    `;

  // 创建按钮的函数
  const createButton = (id, text, left, level) => {
    const btn = document.createElement("div");
    btn.className = "x-btn x-box-item";
    btn.id = id;

    btn.style.cssText = `
            position: absolute;
            left: ${left}px;
            height: 30px;
            width: 30px;
            background: #fff;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            border: 1px solid #d1d7dc;
            user-select: none;
            font-family: "Microsoft YaHei", sans-serif;
        `;

    // 悬停效果
    btn.onmouseenter = () => {
      btn.style.background = "#f0f5ff";
      btn.style.borderColor = "#409eff";
    };

    btn.onmouseleave = () => {
      btn.style.background = "#fff";
      btn.style.borderColor = "#d1d7dc";
    };

    // 点击效果
    btn.onmousedown = () => {
      btn.style.transform = "translateY(1px)";
    };

    btn.onmouseup = () => {
      btn.style.transform = "translateY(0)";
    };

    const btnInner = document.createElement("span");
    btnInner.textContent = text;
    btnInner.style.cssText = `
            font-size: 14px;
            color: #333;
        `;

    btn.appendChild(btnInner);

    // 添加点击事件
    btn.addEventListener("click", () => {
      console.log(`点击了层级按钮: ${text}`);
      panelState.currentLevel = level;
      console.log("当前层级状态:", panelState);
      if (level == 1) {
        collapseAllElements(); //收起就是一级
      } else {
        expandToLevel(level - 1);
      }
    });

    return btn;
  };

  // 创建层级按钮
  const buttons = [];
  for (let i = 1; i <= config.defaultLevels; i++) {
    const button = createButton(
      `level-btn-${i}`,
      i.toString(),
      (i - 1) * 40,
      i
    );
    buttons.push(button);
    panelBody.appendChild(button);
  }

  // 全展/收起按钮
  const expandBtnLeft = config.defaultLevels * 40;
  const expandBtn = createButton("expandAllTreeBtn", "展开", expandBtnLeft, 0);
  expandBtn.style.width = "50px";
  expandBtn.style.background = "#409eff";
  expandBtn.style.color = "#fff";
  expandBtn.style.borderColor = "#409eff";
  expandBtn.firstChild.style.color = "#fff";

  // 悬停效果
  expandBtn.onmouseenter = () => {
    expandBtn.style.background = "#66b1ff";
    expandBtn.style.borderColor = "#66b1ff";
  };
  expandBtn.onmouseleave = () => {
    expandBtn.style.background = "#409eff";
    expandBtn.style.borderColor = "#409eff";
  };

  expandBtn.addEventListener("click", () => {
    panelState.isExpanded = !panelState.isExpanded;

    if (panelState.isExpanded) {
      expandBtn.firstChild.textContent = "收起";
      console.log("执行了展开操作");
      expandAllElements();
    } else {
      expandBtn.firstChild.textContent = "展开";
      console.log("执行了收起操作");
      collapseAllElements();
    }

    console.log("当前展开状态:", panelState.isExpanded);
  });

  panelBody.appendChild(expandBtn);

  // 添加分隔线
  const separatorLeft = expandBtnLeft + 70;
  const separator = document.createElement("div");
  separator.style.cssText = `
        position: absolute;
        left: ${separatorLeft}px;
        height: 25px;
        width: 1px;
        background-color: #d1d7dc;
        margin: 0 2%;
    `;
  panelBody.appendChild(separator);

  // To按钮
  const toButtonLeft = separatorLeft + 20;
  const toButton = document.createElement("div");
  toButton.className = "x-btn x-box-item";
  toButton.id = "toButton";
  toButton.textContent = "To";
  toButton.style.cssText = `
        position: absolute;
        left: ${toButtonLeft}px;
        height: 30px;
        width: 40px;
        background: #409eff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid #409eff;
        user-select: none;
        font-family: "Microsoft YaHei", sans-serif;
        color: #fff;
    `;
  // 悬停效果
  toButton.onmouseenter = () => {
    toButton.style.background = "#66b1ff";
    toButton.style.borderColor = "#66b1ff";
  };
  toButton.onmouseleave = () => {
    toButton.style.background = "#409eff";
    toButton.style.borderColor = "#409eff";
  };
  // 点击效果
  toButton.onmousedown = () => {
    toButton.style.transform = "translateY(1px)";
  };
  toButton.onmouseup = () => {
    toButton.style.transform = "translateY(0)";
  };
  // 点击事件
  toButton.addEventListener("click", () => {
    const inputValue = levelInput.value;
    if (!inputValue) {
      showToast("请输入层级数字");
      return;
    }
    const level = parseInt(inputValue);
    if (level < config.defaultLevels + 1 || level > config.maxCustomLevel) {
      showToast(
        `请输入${config.defaultLevels + 1}到${config.maxCustomLevel}之间的数字`
      );
      return;
    }
    const actualLevel = level - 1; // 对输入值减一
    console.log(`展开到自定义层级: ${level} (实际参数: ${actualLevel})`);
    expandToLevel(actualLevel);
  });
  panelBody.appendChild(toButton);

  // 输入框
  const inputLeft = toButtonLeft + 50;
  const levelInput = document.createElement("input");
  levelInput.type = "text";
  levelInput.id = "levelInput";
  levelInput.placeholder = `${config.defaultLevels + 1}-${
    config.maxCustomLevel
  }`;
  levelInput.style.cssText = `
        position: absolute;
        left: ${inputLeft}px;
        width: 50px;
        height: 26px;
        border: 1px solid #d1d7dc;
        border-radius: 4px;
        padding: 0 5px;
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
    `;
  // 限制只能输入数字
  levelInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  });
  panelBody.appendChild(levelInput);

  // "层"标签
  const labelLeft = inputLeft + 60;
  const layerLabel = document.createElement("span");
  layerLabel.textContent = "层";
  layerLabel.style.cssText = `
        position: absolute;
        left: ${labelLeft}px;
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
        color: #333;
        margin-right: 5px;
        white-space: nowrap;
    `;
  panelBody.appendChild(layerLabel);

  panel.appendChild(panelBody);

  // 根据配置插入到指定位置
  const children = toolbarDiv.children;
  const targetIndex = Math.min(config.position.index, children.length);

  if (config.position.side === "before") {
    if (targetIndex === 0) {
      toolbarDiv.insertBefore(panel, toolbarDiv.firstChild);
    } else if (targetIndex < children.length) {
      toolbarDiv.insertBefore(panel, children[targetIndex]);
    } else {
      toolbarDiv.appendChild(panel);
    }
  } else {
    // 'after'
    if (targetIndex >= children.length) {
      toolbarDiv.appendChild(panel);
    } else {
      toolbarDiv.insertBefore(panel, children[targetIndex + 1]);
    }
  }

  // 根据默认状态配置初始化
  function initializeDefaultState() {
    console.log(
      `初始化默认状态: ${config.defaultState}, 层级: ${config.defaultLevel}`
    );

    switch (config.defaultState) {
      case "collapsed":
        // 收起全部
        collapseAllElements();
        panelState.isExpanded = false;
        expandBtn.firstChild.textContent = "展开";
        panelState.currentLevel = 1;
        break;

      case "level":
        // 展开到指定层级
        if (
          config.defaultLevel >= 1 &&
          config.defaultLevel <= config.defaultLevels
        ) {
          // 如果是预设的层级按钮
          if (config.defaultLevel === 1) {
            collapseAllElements();
            panelState.currentLevel = 1;
          } else {
            expandToLevel(config.defaultLevel - 1);
            panelState.currentLevel = config.defaultLevel;
          }
          panelState.isExpanded = config.defaultLevel > 1;
          expandBtn.firstChild.textContent = panelState.isExpanded
            ? "收起"
            : "展开";
        } else {
          console.warn(`默认层级 ${config.defaultLevel} 超出范围，使用层级1`);
          collapseAllElements();
          panelState.currentLevel = 1;
          panelState.isExpanded = false;
          expandBtn.firstChild.textContent = "展开";
        }
        break;

      case "expanded":
      default:
        // 全部展开
        expandAllElements();
        panelState.isExpanded = true;
        expandBtn.firstChild.textContent = "收起";
        panelState.currentLevel = config.defaultLevels;
        break;
    }
  }

  // 延迟执行初始化，确保DOM已完全加载
  setTimeout(initializeDefaultState, 100);

  // 返回销毁方法
  return {
    destroy: () => {
      if (panel && panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
    },
    // 添加状态控制方法
    setState: (state, level) => {
      if (state === "collapsed") {
        collapseAllElements();
        panelState.isExpanded = false;
        expandBtn.firstChild.textContent = "展开";
        panelState.currentLevel = 1;
      } else if (state === "level" && level) {
        if (level >= 1 && level <= config.maxCustomLevel) {
          if (level === 1) {
            collapseAllElements();
          } else {
            expandToLevel(level - 1);
          }
          panelState.currentLevel = level;
          panelState.isExpanded = level > 1;
          expandBtn.firstChild.textContent = panelState.isExpanded
            ? "收起"
            : "展开";
        }
      } else if (state === "expanded") {
        expandAllElements();
        panelState.isExpanded = true;
        expandBtn.firstChild.textContent = "收起";
        panelState.currentLevel = config.defaultLevels;
      }
    },
  };
}

// 辅助函数：显示提示信息
function showToast(message) {
  console.log("提示:", message);
  // 这里可以添加更美观的提示方式，比如使用浏览器原生alert或自定义弹窗
  alert(message);
}

// NGTreeExpandPanel 类封装
class NGTreeExpandPanel {
  constructor(options = {}) {
    this.options = {
      defaultLevels: 5,
      maxCustomLevel: 25,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      animationDelay: 100,
      position: {
        index: 0,
        side: "after",
      },
      margin: {
        left: "0 1% 0 1%",
        right: "",
      },
      defaultState: "expanded", // 'collapsed', 'level', 'expanded'
      defaultLevel: 1,
      ...options,
    };

    // 初始化组件
    this.instance = createTreeExpandPanel(this.options);
  }

  // 更新配置
  updateOptions(newOptions) {
    // 销毁当前实例
    if (this.instance) {
      this.instance.destroy();
    }
    
    // 合并新选项
    this.options = { ...this.options, ...newOptions };
    
    // 重建实例
    this.instance = createTreeExpandPanel(this.options);
  }

  // 设置状态
  setState(state, level) {
    if (this.instance && typeof this.instance.setState === 'function') {
      this.instance.setState(state, level);
    }
  }

  // 销毁组件
  destroy() {
    if (this.instance && typeof this.instance.destroy === 'function') {
      this.instance.destroy();
    }
  }
}

// 示例用法
const NGTreeExpandPanelExample = {
  // 基础示例
  basic: function(options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "expanded"
    };
    
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  // 自定义层级数示例
  customLevels: function(options = {}) {
    const defaultOptions = {
      defaultLevels: 7,
      maxCustomLevel: 30,
      toolbarSelector: "div.udp-panel-title#_rq_",
      containerSelector: ".row-hover.rows-container.editable",
      defaultState: "level",
      defaultLevel: 2
    };
    
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  },

  // 自定义选择器示例
  customSelectors: function(toolbarSelector, containerSelector, options = {}) {
    const defaultOptions = {
      defaultLevels: 5,
      toolbarSelector: toolbarSelector || "div.udp-panel-title#_rq_",
      containerSelector: containerSelector || ".row-hover.rows-container.editable",
      defaultState: "collapsed"
    };
    
    return new NGTreeExpandPanel({ ...defaultOptions, ...options });
  }
};

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NGTreeExpandPanel, NGTreeExpandPanelExample };
}

if (typeof window !== "undefined") {
  window.NGTreeExpandPanel = NGTreeExpandPanel;
  window.NGTreeExpandPanelExample = NGTreeExpandPanelExample;
}