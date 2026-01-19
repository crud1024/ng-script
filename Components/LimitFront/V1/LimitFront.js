//文字字符限制组件
function addCharacterCounters(configs) {
  // 验证参数
  if (!Array.isArray(configs)) {
    console.error("参数必须是一个配置数组");
    return;
  }

  // 为每个配置项初始化计数器
  configs.forEach((config) => {
    const { selector, limit } = config;

    if (!selector || typeof limit !== "number" || limit <= 0) {
      console.error("无效的配置项:", config);
      return;
    }

    // 获取目标元素（支持多个相同选择器的元素）
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      console.warn(`未找到选择器为 "${selector}" 的元素`);
      return;
    }

    // 为每个匹配的元素初始化计数器
    elements.forEach((element) => {
      initCharacterCounter(element, limit);
    });
  });
}

function initCharacterCounter(element, limit) {
  // 自定义 includes 方法
  function arrayIncludes(array, value) {
    if (!array || !Array.isArray(array)) return false;

    for (let i = 0; i < array.length; i++) {
      if (array[i] === value) {
        return true;
      }
    }
    return false;
  }

  // 创建计数器显示元素
  const counter = document.createElement("div");
  counter.style.cssText = `
        position: absolute;
        bottom: -20px;
        right: 0;
        font-size: 12px;
        color: #666;
        background: transparent;
        padding: 2px 6px;
        pointer-events: none;
        z-index: 10;
    `;

  // 设置元素父元素为相对定位
  const parent = element.parentElement;
  if (parent && window.getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }

  // 添加计数器到页面
  parent.appendChild(counter);

  // 强制截断函数
  function truncateText() {
    if (element.value.length > limit) {
      element.value = element.value.substring(0, limit);
      // 触发input事件更新计数器
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  // 更新计数器显示
  function updateCounter() {
    const currentLength = element.value.length;
    counter.textContent = `${currentLength}/${limit}`;

    // 根据字符数改变样式
    if (currentLength >= limit) {
      counter.style.color = "#ff4d4f";
      element.style.borderColor = "#ff4d4f";
    } else if (currentLength >= limit * 0.9) {
      counter.style.color = "#faad14";
      element.style.borderColor = "";
    } else {
      counter.style.color = "#666";
      element.style.borderColor = "";
    }
  }

  // 监听输入事件
  element.addEventListener("input", function (e) {
    const currentLength = element.value.length;

    // 如果输入后超过限制，立即截断
    if (currentLength > limit) {
      truncateText();
    }

    updateCounter();
  });

  // 监听键盘事件，严格阻止在达到限制时输入更多字符
  element.addEventListener("keydown", function (e) {
    const currentLength = element.value.length;
    const selectionLength = element.selectionEnd - element.selectionStart;

    // 允许的功能键
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "Control",
      "Alt",
      "Meta",
      "Shift",
      "Escape",
    ];

    // 使用自定义的 arrayIncludes 方法
    const key = e.key;
    const isAllowedKey = key ? arrayIncludes(allowedKeys, key) : false;
    const isSingleCharInput = key && key.length === 1;

    // 如果已达到限制，且不是删除操作或功能键
    if (
      currentLength >= limit &&
      !isAllowedKey &&
      !(e.ctrlKey || e.metaKey) && // 允许Ctrl+A等组合键
      selectionLength === 0
    ) {
      // 如果没有选中文本（选中文本时替换操作可以继续）
      e.preventDefault();
    }

    // 如果选中文本后输入，检查替换后的长度是否会超过限制
    if (selectionLength > 0 && currentLength - selectionLength >= limit) {
      if (!isAllowedKey && !(e.ctrlKey || e.metaKey) && isSingleCharInput) {
        // 单字符输入
        e.preventDefault();
      }
    }
  });

  // 监听粘贴事件，严格限制粘贴内容
  element.addEventListener("paste", function (e) {
    const currentLength = element.value.length;
    const selectionLength = element.selectionEnd - element.selectionStart;
    const clipboardData = e.clipboardData || window.clipboardData;

    // 检查 clipboardData 是否存在
    if (!clipboardData) {
      e.preventDefault();
      return;
    }

    const pastedText = clipboardData.getData("text");

    // 计算粘贴后的新长度
    const newLength = currentLength - selectionLength + pastedText.length;

    // 如果粘贴后超过限制
    if (newLength > limit) {
      e.preventDefault();

      // 计算可以粘贴的字符数
      const allowedChars = limit - (currentLength - selectionLength);
      if (allowedChars > 0) {
        // 只粘贴允许的字符数
        const textToPaste = pastedText.substring(0, allowedChars);

        // 获取当前光标位置
        const start = element.selectionStart;
        const end = element.selectionEnd;

        // 替换选中文本
        element.value =
          element.value.substring(0, start) +
          textToPaste +
          element.value.substring(end);

        // 设置光标位置
        element.selectionStart = element.selectionEnd =
          start + textToPaste.length;

        // 触发input事件更新计数器
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  });

  // 监听变化事件，作为额外保障
  element.addEventListener("change", function () {
    truncateText();
    updateCounter();
  });

  // 初始截断和更新
  truncateText();
  updateCounter();
}
window.addCharacterCounters = addCharacterCounters;
