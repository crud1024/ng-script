/**
 * 隐藏特定标签对应元素的工具类
 */
class LabelElementHider {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {Array} options.forPatterns 需要匹配的for属性模式数组
   * @param {number} options.parentLevel 需要隐藏的父级层级（默认4）
   * @param {boolean} options.autoStart 是否自动开始监听（默认true）
   * @param {boolean} options.useDisplayNone 是否使用display:none（默认true）
   * @param {boolean} options.debug 是否启用调试模式（默认false）
   */
  constructor(options = {}) {
    this.options = {
      forPatterns: options.forPatterns || [],
      parentLevel: options.parentLevel || 4,
      autoStart: options.autoStart !== false,
      useDisplayNone: options.useDisplayNone !== false,
      debug: options.debug || false,
      ...options,
    };

    this.observer = null;
    this.hiddenElements = new Set();
    this.initialized = false;

    if (this.options.autoStart) {
      this.init();
    }
  }

  /**
   * 初始化并开始监听
   */
  init() {
    if (this.initialized) {
      console.warn("LabelElementHider 已经初始化过了");
      return;
    }

    this.log("开始初始化 LabelElementHider");

    // 初始执行一次
    this.processAllLabels();

    // 设置 MutationObserver 监听DOM变化
    this.setupObserver();

    this.initialized = true;
    this.log("初始化完成");
  }

  /**
   * 设置 MutationObserver
   */
  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldProcess = true;
        }
      });

      if (shouldProcess) {
        this.processAllLabels();
      }
    });

    // 开始观察整个文档的变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.log("MutationObserver 已启动");
  }

  /**
   * 处理所有匹配的标签
   */
  processAllLabels() {
    if (this.options.forPatterns.length === 0) {
      this.log("未设置 forPatterns，跳过处理");
      return;
    }

    // 获取所有label元素
    const labels = document.querySelectorAll("label");
    let processedCount = 0;

    labels.forEach((label) => {
      const forAttr = label.getAttribute("for");

      if (forAttr) {
        // 检查是否匹配任何模式
        const matchedPattern = this.matchPattern(forAttr);

        if (matchedPattern) {
          if (this.hideLabelParent(label, matchedPattern)) {
            processedCount++;
          }
        }
      }
    });

    if (processedCount > 0) {
      this.log(`本次处理了 ${processedCount} 个匹配的标签`);
    }
  }

  /**
   * 匹配for属性值
   * @param {string} forValue for属性值
   * @returns {string|null} 匹配到的模式，未匹配返回null
   */
  matchPattern(forValue) {
    for (const pattern of this.options.forPatterns) {
      // 将模式转换为正则表达式
      const regexPattern = pattern
        .replace(/\*/g, ".*") // 将 * 替换为 .*
        .replace(/\?/g, "."); // 将 ? 替换为 .

      const regex = new RegExp(`^${regexPattern}$`);

      if (regex.test(forValue)) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * 隐藏标签的指定层级父元素
   * @param {HTMLElement} label label元素
   * @param {string} matchedPattern 匹配到的模式
   * @returns {boolean} 是否成功隐藏
   */
  hideLabelParent(label, matchedPattern) {
    try {
      // 获取指定层级的父元素
      let parent = label;
      let level = 0;

      while (level < this.options.parentLevel && parent.parentElement) {
        parent = parent.parentElement;
        level++;
      }

      // 检查是否达到了指定层级
      if (level < this.options.parentLevel) {
        this.log(
          `标签 for="${label.getAttribute("for")}" 的父级层级不足 ${this.options.parentLevel}`,
          "warn",
        );
        return false;
      }

      // 检查是否已经隐藏过
      if (this.hiddenElements.has(parent)) {
        return false;
      }

      // 隐藏元素
      if (this.options.useDisplayNone) {
        parent.style.display = "none";
      } else {
        parent.style.visibility = "hidden";
        parent.style.opacity = "0";
        parent.style.position = "absolute";
      }

      // 添加标记
      parent.dataset.hiddenByLabelHider = "true";
      parent.dataset.matchedPattern = matchedPattern;
      parent.dataset.originalLabelFor = label.getAttribute("for");

      // 添加到已处理集合
      this.hiddenElements.add(parent);

      this.log(
        `已隐藏元素: label for="${label.getAttribute("for")}" 的第${level}级父元素`,
      );
      return true;
    } catch (error) {
      this.log(`隐藏元素时出错: ${error.message}`, "error");
      return false;
    }
  }

  /**
   * 添加新的匹配模式
   * @param {string|Array} patterns 新的模式或模式数组
   */
  addPatterns(patterns) {
    if (Array.isArray(patterns)) {
      this.options.forPatterns.push(...patterns);
    } else {
      this.options.forPatterns.push(patterns);
    }

    this.log(
      `添加了 ${Array.isArray(patterns) ? patterns.length : 1} 个新模式`,
    );

    // 重新处理所有标签
    if (this.initialized) {
      this.processAllLabels();
    }
  }

  /**
   * 显示所有已隐藏的元素
   */
  showAllHidden() {
    this.hiddenElements.forEach((element) => {
      if (this.options.useDisplayNone) {
        element.style.display = "";
      } else {
        element.style.visibility = "";
        element.style.opacity = "";
        element.style.position = "";
      }

      delete element.dataset.hiddenByLabelHider;
      delete element.dataset.matchedPattern;
      delete element.dataset.originalLabelFor;
    });

    this.hiddenElements.clear();
    this.log("已显示所有隐藏的元素");
  }

  /**
   * 停止监听
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.log("已停止监听DOM变化");
    }
  }

  /**
   * 重新开始监听
   */
  restart() {
    this.stop();
    this.setupObserver();
    this.processAllLabels();
  }

  /**
   * 获取隐藏的元素数量
   * @returns {number}
   */
  getHiddenCount() {
    return this.hiddenElements.size;
  }

  /**
   * 获取匹配的模式列表
   * @returns {Array}
   */
  getPatterns() {
    return [...this.options.forPatterns];
  }

  /**
   * 日志记录
   * @param {string} message 消息
   * @param {string} level 日志级别
   */
  log(message, level = "info") {
    if (this.options.debug) {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      const prefix = `[LabelElementHider ${timestamp}]`;

      switch (level) {
        case "warn":
          console.warn(prefix, message);
          break;
        case "error":
          console.error(prefix, message);
          break;
        default:
          console.log(prefix, message);
      }
    }
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stop();
    this.hiddenElements.clear();
    this.initialized = false;
    this.log("实例已销毁");
  }
}
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = LabelElementHider;
}
if (typeof window !== "undefined") {
  window.LabelElementHider = LabelElementHider;
}

// // 使用示例
// // 1. 基本用法 - 批量处理多个模式
// const hider = new LabelElementHider({
//   forPatterns: [
//     'query_u_form_type*str*eq*1',
//     'query_u_cntname*str*like*1',
//     'query_u_status*str*eq*1',
//     'query_u_date*date*between*1'
//   ],
//   parentLevel: 4,
//   debug: true, // 开启调试模式查看日志
//   autoStart: true
// });

// // 2. 动态添加新的匹配模式
// hider.addPatterns('query_u_amount*num*gt*1');
// hider.addPatterns([
//   'query_u_category*str*in*1',
//   'query_u_tags*str*contains*1'
// ]);

// // 3. 获取信息
// console.log('已隐藏元素数量:', hider.getHiddenCount());
// console.log('当前匹配模式:', hider.getPatterns());

// 4. 如果需要显示所有隐藏的元素
// hider.showAllHidden();

// 5. 停止监听
// hider.stop();

// 6. 重新开始
// hider.restart();

// 7. 销毁实例（清理内存）
// hider.destroy();
