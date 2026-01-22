// NGStatistic 统计数值组件
class NGStatistic {
  constructor(selector, options = {}) {
    this.options = {
      data: [],
      itemsPerRow: 1,
      centered: false,
      valueSize: 32,
      titleSize: 14,
      animationDuration: 800,
      animationEasing: "easeOutQuart",
      containerStyle: {},
      ...options,
    };

    // 支持选择器或DOM元素
    this.container =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!this.container) {
      console.error("Container element not found:", selector);
      return;
    }

    // 注入样式
    this.injectStyles();

    this.init();
  }

  // 注入组件样式
  injectStyles() {
    // 防止重复注入
    if (document.getElementById("ng-statistic-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "ng-statistic-styles";
    style.textContent = `
            .ng-statistic-wrapper {
                display: grid;
                gap: 24px;
                align-items: start;
            }
            
            .ng-statistic-item {
                text-align: center;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .ng-statistic-value-container {
                display: flex;
                align-items: baseline;
                gap: 4px;
                margin-bottom: 4px;
            }
            
            .ng-statistic-value {
                font-weight: 600;
                line-height: 1;
                color: #333;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            .ng-statistic-prefix,
            .ng-statistic-suffix {
                font-size: 16px;
                color: #666;
                line-height: 1;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            .ng-statistic-title {
                color: #666;
                line-height: 1.5715;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            @keyframes ng-statistic-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .ng-statistic-item {
                animation: ng-statistic-fade-in 0.3s ease-out;
            }
            
            @keyframes ng-statistic-count-up {
                from {
                    opacity: 0.5;
                }
                to {
                    opacity: 1;
                }
            }
            
            .ng-statistic-value.animating {
                animation: ng-statistic-count-up 0.1s ease-out;
            }
        `;

    document.head.appendChild(style);
  }

  init() {
    this.clearContainer();
    this.render();
  }

  clearContainer() {
    // 清空容器，如果选择器中有其他元素就覆盖
    this.container.innerHTML = "";
  }

  render() {
    const { data, itemsPerRow, centered, containerStyle } = this.options;

    // 创建主容器
    const wrapper = document.createElement("div");
    wrapper.className = "ng-statistic-wrapper";

    // 设置网格布局
    Object.assign(wrapper.style, {
      gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
      justifyItems: centered ? "center" : "start",
    });

    // 应用自定义容器样式
    Object.assign(wrapper.style, this.parseStyles(containerStyle));

    // 渲染每个统计项
    data.forEach((item, index) => {
      const statisticItem = this.createStatisticItem(item, index);
      wrapper.appendChild(statisticItem);
    });

    this.container.appendChild(wrapper);
  }

  createStatisticItem(item, index) {
    const { valueSize, titleSize, animationDuration, animationEasing } =
      this.options;
    const {
      title,
      value,
      prefix = "",
      suffix = "",
      precision = 0,
      animation = false,
      classNames = {},
      styles = {},
      itemStyle = {},
    } = item;

    // 创建统计项容器
    const itemEl = document.createElement("div");
    itemEl.className = "ng-statistic-item";

    // 添加自定义类名
    if (classNames.container) {
      itemEl.className += ` ${classNames.container}`;
    }

    // 应用项容器样式
    Object.assign(itemEl.style, {
      textAlign: "center",
      ...this.parseStyles(itemStyle),
      ...this.parseStyles(styles.container),
    });

    // 创建值容器
    const valueContainer = document.createElement("div");
    valueContainer.className = "ng-statistic-value-container";

    // 应用值容器样式
    Object.assign(
      valueContainer.style,
      this.parseStyles(styles.valueContainer),
    );

    // 前缀
    if (prefix) {
      const prefixEl = document.createElement("span");
      prefixEl.className = "ng-statistic-prefix";
      if (classNames.prefix) prefixEl.className += ` ${classNames.prefix}`;

      Object.assign(prefixEl.style, {
        fontSize: Math.min(valueSize * 0.5, 24) + "px",
        ...this.parseStyles(styles.prefix),
      });

      prefixEl.textContent = prefix;
      valueContainer.appendChild(prefixEl);
    }

    // 数值部分
    const valueEl = document.createElement("span");
    valueEl.className = "ng-statistic-value";
    if (classNames.value) valueEl.className += ` ${classNames.value}`;

    // 应用数值样式
    Object.assign(valueEl.style, {
      fontSize: `${valueSize}px`,
      ...this.parseStyles(styles.value),
    });

    // 格式化数值
    const formattedValue = this.formatNumber(value, precision);

    if (animation) {
      valueEl.textContent = "0";
      this.animateValue(
        valueEl,
        parseFloat(value),
        precision,
        animationDuration,
        animationEasing,
      );
    } else {
      valueEl.textContent = formattedValue;
    }

    valueContainer.appendChild(valueEl);

    // 后缀
    if (suffix) {
      const suffixEl = document.createElement("span");
      suffixEl.className = "ng-statistic-suffix";
      if (classNames.suffix) suffixEl.className += ` ${classNames.suffix}`;

      Object.assign(suffixEl.style, {
        fontSize: Math.min(valueSize * 0.5, 24) + "px",
        ...this.parseStyles(styles.suffix),
      });

      suffixEl.textContent = suffix;
      valueContainer.appendChild(suffixEl);
    }

    itemEl.appendChild(valueContainer);

    // 标题
    if (title) {
      const titleEl = document.createElement("div");
      titleEl.className = "ng-statistic-title";
      if (classNames.title) titleEl.className += ` ${classNames.title}`;

      Object.assign(titleEl.style, {
        fontSize: `${titleSize}px`,
        marginTop: Math.min(valueSize * 0.2, 8) + "px",
        ...this.parseStyles(styles.title),
      });

      titleEl.textContent = title;
      itemEl.appendChild(titleEl);
    }

    return itemEl;
  }

  formatNumber(num, precision) {
    if (typeof num !== "number") return num;

    // 处理小数精度
    const multiplier = Math.pow(10, precision);
    const rounded = Math.round(num * multiplier) / multiplier;

    // 添加千分位分隔符
    const parts = rounded.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return parts.join(".");
  }

  animateValue(element, targetValue, precision, duration, easing) {
    const startValue = 0;
    const startTime = performance.now();

    // 缓动函数
    const easeFunctions = {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => t * (2 - t),
      easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => --t * t * t + 1,
      easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeOutQuart: (t) => 1 - --t * t * t * t,
    };

    const ease = easeFunctions[easing] || easeFunctions.easeOutQuart;

    // 添加动画类
    element.classList.add("animating");

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = ease(progress);

      const currentValue =
        startValue + (targetValue - startValue) * easedProgress;
      element.textContent = this.formatNumber(currentValue, precision);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        element.textContent = this.formatNumber(targetValue, precision);
        element.classList.remove("animating");
      }
    };

    requestAnimationFrame(updateValue);
  }

  parseStyles(styles) {
    if (!styles) return {};
    if (typeof styles === "function") {
      return styles();
    }
    return styles;
  }

  // 更新数据
  updateData(newData) {
    this.options.data = newData;
    this.init();
  }

  // 更新配置
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.init();
  }

  // 重新渲染
  reRender() {
    this.init();
  }

  // 销毁组件
  destroy() {
    this.clearContainer();
    const styleElement = document.getElementById("ng-statistic-styles");
    if (styleElement) {
      styleElement.remove();
    }
  }
}

// 使用示例
const NGStatisticExample = {
  // 基本示例
  basic: function (containerId) {
    return new NGStatistic(containerId, {
      data: [
        {
          title: "活跃用户",
          value: 45678,
          prefix: "$",
          precision: 0,
          animation: true,
        },
        {
          title: "新增用户",
          value: 1234,
          suffix: "人",
          animation: true,
        },
      ],
      itemsPerRow: 2,
      centered: true,
    });
  },

  // 高级示例
  advanced: function (containerId) {
    return new NGStatistic(containerId, {
      data: [
        {
          title: "总销售额",
          value: 126560,
          prefix: "¥",
          suffix: "元",
          precision: 2,
          animation: true,
          styles: {
            value: { color: "#1890ff" },
          },
        },
        {
          title: "访问量",
          value: 8846,
          animation: true,
          styles: {
            value: { color: "#52c41a" },
          },
        },
        {
          title: "转化率",
          value: 65.42,
          suffix: "%",
          precision: 2,
          animation: true,
          styles: {
            value: { color: "#722ed1" },
          },
        },
        {
          title: "订单数",
          value: 6543,
          animation: true,
          styles: {
            value: { color: "#fa8c16" },
          },
        },
      ],
      itemsPerRow: 2,
      centered: true,
      valueSize: 36,
      titleSize: 16,
      containerStyle: {
        padding: "24px",
        backgroundColor: "#fafafa",
        borderRadius: "8px",
        border: "1px solid #f0f0f0",
        margin: "16px 0",
      },
    });
  },

  // 自定义样式示例
  custom: function (containerId) {
    return new NGStatistic(containerId, {
      data: [
        {
          title: "完成率",
          value: 85.5,
          suffix: "%",
          precision: 1,
          animation: true,
          classNames: {
            container: "custom-stat-item",
            value: "custom-value",
          },
          styles: {
            container: {
              padding: "16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            },
            value: {
              color: "#fff",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            },
            title: {
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px",
              fontWeight: "500",
            },
            suffix: {
              color: "rgba(255,255,255,0.9)",
            },
          },
        },
        {
          title: "响应时间",
          value: 124,
          suffix: "ms",
          precision: 0,
          animation: true,
          styles: {
            container: {
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#13c2c2",
              color: "white",
            },
            value: { color: "#fff" },
            title: { color: "rgba(255,255,255,0.8)" },
            suffix: { color: "rgba(255,255,255,0.9)" },
          },
        },
      ],
      itemsPerRow: 2,
      centered: true,
      containerStyle: {
        gap: "16px",
      },
    });
  },
};

// 导出组件
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NGStatistic, NGStatisticExample };
}

if (typeof window !== "undefined") {
  window.NGStatistic = NGStatistic;
  window.NGStatisticExample = NGStatisticExample;
}
