# NGSlider — 使用示例与快速参考

简体中文说明。此文档提供 `NGSlider` 在页面中常用的初始化示例、关键配置项说明与常见回调。文件末尾保留了一份完整的原始示例源码副本，便于参考或复制。

## 简介

`NGSlider` 是一个轻量级的滑块组件，支持单点、范围、多点、垂直方向、带输入框、刻度标注、工具提示与自定义回调等常见功能。

## 快速开始

1. 在页面中引入 `NGSlider` 脚本（由项目提供）。
2. 在 DOM 中准备一个容器元素，例如 `<div id="my-slider"></div>`。
3. 使用如下方式初始化：

示例 — 双滑块范围选择：

```javascript
const target = document.querySelector('div[data-cid="u:ab75edc08724_u_is"]');
const parent = target.parentElement;

const slider2 = new NGSlider({
  container: parent,
  value: [20, 70],
  range: true,
  min: 0,
  max: 100,
  step: 5,
  onChange: function (value) {
    console.log("当前值: [" + value.join(", ") + "]");
  },
});
```

## 常用配置项（摘要）

- **container**: DOM 元素或选择器字符串，渲染容器。
- **value**: Number 或 Array（范围/多点），初始值。
- **min / max**: 数值范围边界，默认 0 / 100。
- **step**: 步进值，控制可选的增量。
- **range**: 布尔，启用双手柄范围选择。
- **marks**: 对象，指定刻度与标签（例：{0:'0°C',50:'50°C'}）。
- **included**: 布尔，是否显示已选中区域（主要影响视觉）。
- **showInput**: 布尔，显示输入框以手动输入数值。
- **vertical**: 布尔，垂直显示滑块。
- **reverse**: 布尔，反向滑动方向。
- **dynamicPoints**: 布尔，允许动态增减节点（多点模式）。
- **icons**: 对象，支持 `start` / `end` 自定义图标（HTML 字符串）。
- **rangeConfig.draggableTrack**: 布尔，启用拖拽轨道移动范围。
- **tooltip.formatter**: 函数或 null，格式化/隐藏提示文本。

## 常用回调

- **onChange(value)**: 值变化时实时回调（拖动过程中多次触发）。
- **onChangeComplete(value)**: 交互完成后触发（拖动结束/释放）。
- **onFocus(value)**: 控件获得焦点。
- **onBlur(value)**: 控件失去焦点。
- **onKeyDown(e, value)**: 键盘事件处理回调。

## 使用建议

- 对于范围滑块，`value` 使用长度为 2 的数组。
- 需要精确数值时设置合适的 `step`，避免浮点精度问题。
- 若需高度自定义样式，可通过组件导出的 `elements` 引用直接修改 DOM 样式（示例见旧源码片段）。

## 示例集合（概览）

- 单滑块、双滑块、带刻度、带输入框、垂直、反向、带图标、可拖拽轨道等示例均可通过初始化不同配置实现。

---

## 原始示例源码（完整保留）

以下为原始示例代码副本（未改动），便于直接复制回测试页面：

```javascript
// // SVG 图标定义
// const startIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
// const endIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
// const volumeIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
// const muteIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
// 选择目标元素
const target = document.querySelector('div[data-cid="u:ab75edc08724_u_is"]');

// 获取父元素
const parent = target.parentElement;

// 示例1：基本滑块
const slider1 = new NGSlider({
  container: parent,
  value: 30,
  min: 0,
  max: 100,
  step: 1,
  onChange: function (value) {
    document.getElementById("slider1-value").textContent = "当前值: " + value;
    logEvent(`Slider1 值改变: ${value}`);
  },
  onChangeComplete: function (value) {
    logEvent(`Slider1 值改变完成: ${value}`);
  },
  onFocus: function (value) {
    logEvent(`Slider1 获得焦点: ${value}`);
  },
  onBlur: function (value) {
    logEvent(`Slider1 失去焦点: ${value}`);
  },
});

// 添加切换禁用状态方法
slider1.toggleDisabled = function () {
  if (this.config.disabled) {
    this.enable();
    logEvent("Slider1 已启用");
  } else {
    this.disable();
    logEvent("Slider1 已禁用");
  }
};

// 示例2：双滑块范围选择
const slider2 = new NGSlider({
  container: parent,
  value: [20, 70],
  range: true,
  min: 0,
  max: 100,
  step: 5,
  onChange: function (value) {
    console.log("当前值: [" + value.join(", ") + "]");
    // logEvent(`Slider2 值改变: [${value.join(', ')}]`);
  },
});

// 示例3：带标注的滑块
const slider3 = new NGSlider({
  container: "#slider3",
  value: 50,
  min: 0,
  max: 100,
  step: 25,
  marks: {
    0: "0°C",
    25: "25°C",
    50: "50°C",
    75: "75°C",
    100: "100°C",
  },
  included: true,
  onChange: function (value) {
    document.getElementById("slider3-value").textContent = "当前值: " + value;
    logEvent(`Slider3 值改变: ${value}`);
  },
});

// 示例4：带输入框的滑块
const slider4 = new NGSlider({
  container: "#slider4",
  value: 75,
  min: 0,
  max: 100,
  step: 1,
  showInput: true,
  tooltip: {
    formatter: (value) => value + "%",
  },
  onChange: function (value) {
    document.getElementById("slider4-value").textContent = "当前值: " + value;
    logEvent(`Slider4 值改变: ${value}%`);
  },
});

// 示例5：垂直滑块
const slider5 = new NGSlider({
  container: "#slider5",
  value: 60,
  min: 0,
  max: 100,
  step: 10,
  vertical: true,
  styles: {
    height: "200px",
  },
  onChange: function (value) {
    document.getElementById("slider5-value").textContent = "当前值: " + value;
    logEvent(`Slider5 值改变: ${value}`);
  },
});

// 示例6：反向滑块
const slider6 = new NGSlider({
  container: "#slider6",
  value: 30,
  min: 0,
  max: 100,
  step: 10,
  reverse: true,
  tooltip: {
    formatter: null, // 隐藏提示框
  },
  onChange: function (value) {
    document.getElementById("slider6-value").textContent = "当前值: " + value;
    logEvent(`Slider6 值改变: ${value}`);
  },
});

// 示例7：动态增减节点
const slider7 = new NGSlider({
  container: "#slider7",
  value: [20, 50, 80],
  min: 0,
  max: 100,
  step: 10,
  dynamicPoints: true,
  onChange: function (value) {
    document.getElementById("slider7-value").textContent =
      "当前值: [" + value.join(", ") + "]";
    logEvent(`Slider7 值改变: [${value.join(", ")}]`);
  },
  onKeyDown: function (e, value) {
    logEvent(`Slider7 按键: ${e.key}, 当前值: [${value.join(", ")}]`);
  },
});

// 示例8：通用选择器初始化
const genericSliders = initSliders(".ng-slider-container", {
  min: 0,
  max: 100,
  step: 10,
  onChange: function (value) {
    logEvent(`通用Slider值改变: ${value}`);
  },
});

// 批量更新函数
function updateAllSliders() {
  genericSliders.forEach((slider, index) => {
    const randomValue = Math.floor(Math.random() * 101);
    slider.setValue(randomValue);
  });
  logEvent("批量更新了所有通用Slider的值");
}

// 示例9：带图标的滑块
const slider9 = new NGSlider({
  container: "#slider9",
  value: 40,
  min: 0,
  max: 100,
  step: 10,
  icons: {
    start: volumeIcon,
    end: muteIcon,
  },
  onChange: function (value) {
    document.getElementById("slider9-value").textContent = "当前值: " + value;
    logEvent(`Slider9 值改变: ${value}`);
  },
});

// 示例10：可拖拽轨道
const slider10 = new NGSlider({
  container: "#slider10",
  value: [30, 70],
  range: true,
  min: 0,
  max: 100,
  step: 5,
  rangeConfig: {
    draggableTrack: true,
  },
  onChange: function (value) {
    document.getElementById("slider10-value").textContent =
      "当前值: [" + value.join(", ") + "]";
    logEvent(`Slider10 值改变: [${value.join(", ")}]`);
  },
});

// 示例11：Tooltip控制
const slider11 = new NGSlider({
  container: "#slider11",
  value: 60,
  min: 0,
  max: 100,
  step: 10,
  tooltip: {
    formatter: (value) => value + "分",
  },
  onChange: function (value) {
    document.getElementById("slider11-value").textContent = "当前值: " + value;
    logEvent(`Slider11 值改变: ${value}分`);
  },
});

// 示例12：自定义样式
const slider12 = new NGSlider({
  container: "#slider12",
  value: 80,
  min: 0,
  max: 100,
  step: 5,
  styles: {
    margin: "20px 0",
    padding: "10px 0",
  },
  onChange: function (value) {
    document.getElementById("slider12-value").textContent = "当前值: " + value;
    logEvent(`Slider12 值改变: ${value}`);
  },
});

// 添加自定义样式
setTimeout(() => {
  if (slider12.elements.rail) {
    slider12.elements.rail.style.backgroundColor = "#e6f7ff";
    slider12.elements.track.style.backgroundColor = "#0050b3";
    slider12.elements.handles.forEach((handle) => {
      handle.style.borderColor = "#0050b3";
      handle.style.boxShadow = "0 0 0 3px rgba(0, 80, 179, 0.1)";
    });
  }
}, 100);
```

---

若需我帮你再将 README 翻译成英文、补充更多 API 例子或生成示例 HTML 页面用于快速测试，告诉我你想添加的内容即可。
// // SVG 图标定义
// const startIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
// const endIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
// const volumeIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
// const muteIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
// 选择目标元素
const target = document.querySelector('div[data-cid="u:ab75edc08724_u_is"]');

        // 获取父元素
        const parent = target.parentElement;

        // // 示例1：基本滑块
        // const slider1 = new NGSlider({
        //     container: parent,
        //     value: 30,
        //     min: 0,
        //     max: 100,
        //     step: 1,
        //     onChange: function (value) {
        //         document.getElementById('slider1-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider1 值改变: ${value}`);
        //     },
        //     onChangeComplete: function (value) {
        //         logEvent(`Slider1 值改变完成: ${value}`);
        //     },
        //     onFocus: function (value) {
        //         logEvent(`Slider1 获得焦点: ${value}`);
        //     },
        //     onBlur: function (value) {
        //         logEvent(`Slider1 失去焦点: ${value}`);
        //     }
        // });

        // // 添加切换禁用状态方法
        // slider1.toggleDisabled = function () {
        //     if (this.config.disabled) {
        //         this.enable();
        //         logEvent('Slider1 已启用');
        //     } else {
        //         this.disable();
        //         logEvent('Slider1 已禁用');
        //     }
        // };

        // 示例2：双滑块范围选择
        const slider2 = new NGSlider({
            container: parent,
            value: [20, 70],
            range: true,
            min: 0,
            max: 100,
            step: 5,
            onChange: function (value) {
                console.log('当前值: [' + value.join(', ') + ']');
                // logEvent(`Slider2 值改变: [${value.join(', ')}]`);
            }
        });

        // // 示例3：带标注的滑块
        // const slider3 = new NGSlider({
        //     container: '#slider3',
        //     value: 50,
        //     min: 0,
        //     max: 100,
        //     step: 25,
        //     marks: {
        //         0: '0°C',
        //         25: '25°C',
        //         50: '50°C',
        //         75: '75°C',
        //         100: '100°C'
        //     },
        //     included: true,
        //     onChange: function (value) {
        //         document.getElementById('slider3-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider3 值改变: ${value}`);
        //     }
        // });

        // // 示例4：带输入框的滑块
        // const slider4 = new NGSlider({
        //     container: '#slider4',
        //     value: 75,
        //     min: 0,
        //     max: 100,
        //     step: 1,
        //     showInput: true,
        //     tooltip: {
        //         formatter: value => value + '%'
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider4-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider4 值改变: ${value}%`);
        //     }
        // });

        // // 示例5：垂直滑块
        // const slider5 = new NGSlider({
        //     container: '#slider5',
        //     value: 60,
        //     min: 0,
        //     max: 100,
        //     step: 10,
        //     vertical: true,
        //     styles: {
        //         height: '200px'
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider5-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider5 值改变: ${value}`);
        //     }
        // });

        // // 示例6：反向滑块
        // const slider6 = new NGSlider({
        //     container: '#slider6',
        //     value: 30,
        //     min: 0,
        //     max: 100,
        //     step: 10,
        //     reverse: true,
        //     tooltip: {
        //         formatter: null  // 隐藏提示框
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider6-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider6 值改变: ${value}`);
        //     }
        // });

        // // 示例7：动态增减节点
        // const slider7 = new NGSlider({
        //     container: '#slider7',
        //     value: [20, 50, 80],
        //     min: 0,
        //     max: 100,
        //     step: 10,
        //     dynamicPoints: true,
        //     onChange: function (value) {
        //         document.getElementById('slider7-value').textContent = '当前值: [' + value.join(', ') + ']';
        //         logEvent(`Slider7 值改变: [${value.join(', ')}]`);
        //     },
        //     onKeyDown: function (e, value) {
        //         logEvent(`Slider7 按键: ${e.key}, 当前值: [${value.join(', ')}]`);
        //     }
        // });

        // // 示例8：通用选择器初始化
        // const genericSliders = initSliders('.ng-slider-container', {
        //     min: 0,
        //     max: 100,
        //     step: 10,
        //     onChange: function (value) {
        //         logEvent(`通用Slider值改变: ${value}`);
        //     }
        // });

        // // 批量更新函数
        // function updateAllSliders() {
        //     genericSliders.forEach((slider, index) => {
        //         const randomValue = Math.floor(Math.random() * 101);
        //         slider.setValue(randomValue);
        //     });
        //     logEvent('批量更新了所有通用Slider的值');
        // }

        // // 示例9：带图标的滑块
        // const slider9 = new NGSlider({
        //     container: '#slider9',
        //     value: 40,
        //     min: 0,
        //     max: 100,
        //     step: 10,
        //     icons: {
        //         start: volumeIcon,
        //         end: muteIcon
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider9-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider9 值改变: ${value}`);
        //     }
        // });

        // // 示例10：可拖拽轨道
        // const slider10 = new NGSlider({
        //     container: '#slider10',
        //     value: [30, 70],
        //     range: true,
        //     min: 0,
        //     max: 100,
        //     step: 5,
        //     rangeConfig: {
        //         draggableTrack: true
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider10-value').textContent = '当前值: [' + value.join(', ') + ']';
        //         logEvent(`Slider10 值改变: [${value.join(', ')}]`);
        //     }
        // });

        // // 示例11：Tooltip控制
        // const slider11 = new NGSlider({
        //     container: '#slider11',
        //     value: 60,
        //     min: 0,
        //     max: 100,
        //     step: 10,
        //     tooltip: {
        //         formatter: value => value + '分'
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider11-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider11 值改变: ${value}分`);
        //     }
        // });

        // // 示例12：自定义样式
        // const slider12 = new NGSlider({
        //     container: '#slider12',
        //     value: 80,
        //     min: 0,
        //     max: 100,
        //     step: 5,
        //     styles: {
        //         margin: '20px 0',
        //         padding: '10px 0'
        //     },
        //     onChange: function (value) {
        //         document.getElementById('slider12-value').textContent = '当前值: ' + value;
        //         logEvent(`Slider12 值改变: ${value}`);
        //     }
        // });

        // // 添加自定义样式
        // setTimeout(() => {
        //     if (slider12.elements.rail) {
        //         slider12.elements.rail.style.backgroundColor = '#e6f7ff';
        //         slider12.elements.track.style.backgroundColor = '#0050b3';
        //         slider12.elements.handles.forEach(handle => {
        //             handle.style.borderColor = '#0050b3';
        //             handle.style.boxShadow = '0 0 0 3px rgba(0, 80, 179, 0.1)';
        //         });
        //     }
        // }, 100);
