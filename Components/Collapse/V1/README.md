# Collapse 组件 - 完整文档

## 概述

NGCollapse 是一个完全复刻 NG Design 折叠面板的纯 JavaScript 实现，支持 NG Design 的所有核心功能和样式。该组件不依赖任何外部库，轻量级且易于使用。

---

## 安装与使用

### 1. 基础引入方式

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NGCollapse 示例</title>
  </head>
  <body>
    <!-- 容器元素 -->
    <div
      id="collapse-container"
      style="max-width: 800px; margin: 50px auto;"
    ></div>

    <script src="ng-collapse.js"></script>
    <script>
      // 基础示例
      const collapse = new NGCollapse("#collapse-container", {
        items: [
          {
            key: "1",
            label: "面板标题 1",
            children: "这是面板内容 1",
          },
          {
            key: "2",
            label: "面板标题 2",
            children: "<p>这是面板内容 2，支持HTML</p>",
          },
        ],
      });
    </script>
  </body>
</html>
```

### 2. ES6 模块化引入

```javascript
import NGCollapse from "./ng-collapse.js";

const collapse = new NGCollapse("#root", {
  // 配置项
});
```

---

## 完整 API 文档

### 构造函数参数

```javascript
new NGCollapse(container, options);
```

| 参数      | 类型                  | 说明                  | 默认值 |
| --------- | --------------------- | --------------------- | ------ |
| container | String \| HTMLElement | 容器选择器或 DOM 元素 | 必填   |
| options   | Object                | 配置对象              | {}     |

### 配置项（options）

#### 基础配置

```javascript
{
    // 基础配置
    accordion: false, // 手风琴模式
    bordered: true,   // 是否显示边框
    ghost: false,     // 幽灵模式（透明背景）
    size: 'default',  // 尺寸：default, small, large
    expandIconPosition: 'start', // 图标位置：start, end
    collapsible: 'header', // 可触发折叠的区域：header, icon, disabled
    destroyInactivePanel: false, // 销毁未激活的面板内容
    forceRender: false, // 强制渲染所有面板内容

    // 图标配置
    showArrow: true,                    // 是否显示箭头图标
    iconProps: {                        // 图标属性
        width: 16,                      // 图标宽度
        height: 16,                     // 图标高度
        strokeWidth: 2,                 // 线条粗细
        stroke: 'rgba(0, 0, 0, 0.45)',  // 线条颜色
        fill: 'none',                   // 填充颜色
        style: {}                       // 自定义样式
    },

    // 默认激活状态
    activeKey: null,                    // 受控模式：当前激活的面板
    defaultActiveKey: null,             // 默认激活的面板

    // 数据源
    items: [],                          // 面板数据

    // 事件回调
    onChange: null,                     // 面板切换回调

    // 自定义样式
    classNames: {                       // 自定义类名
        container: '',
        item: '',
        header: '',
        content: '',
        contentBox: ''
    },
    styles: {                           // 自定义样式对象
        container: {},
        item: {},
        header: {},
        content: {},
        contentBox: {}
    },

    // 自定义图标（高级）
    expandIcon: null,                   // 自定义展开图标
    collapseIcon: null                  // 自定义收起图标
}
```

---

## 调用示例

### 1. 基础示例

```javascript
// 最简单的折叠面板
const basicCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "基础面板 1",
      children: "这是基础面板内容",
    },
    {
      key: "2",
      label: "基础面板 2",
      children: "这是第二个面板内容",
    },
  ],
});
```

### 2. 手风琴模式

```javascript
const accordionCollapse = new NGCollapse("#container", {
  accordion: true,
  defaultActiveKey: "1",
  items: [
    {
      key: "1",
      label: "手风琴面板 1",
      children: "展开时其他面板会自动收起",
    },
    {
      key: "2",
      label: "手风琴面板 2",
      children: "这是第二个面板",
    },
    {
      key: "3",
      label: "手风琴面板 3",
      children: "这是第三个面板",
    },
  ],
});
```

---

## 更多示例

### 不同尺寸

```javascript
// 小尺寸
const smallCollapse = new NGCollapse("#container", {
  size: "small",
  items: [
    {
      key: "1",
      label: "小尺寸面板",
      children: "适用于紧凑布局",
    },
  ],
});

// 大尺寸
const largeCollapse = new NGCollapse("#container", {
  size: "large",
  items: [
    {
      key: "1",
      label: "大尺寸面板",
      children: "适用于重要内容展示",
    },
  ],
});
```

---

### 边框和幽灵模式

```javascript
// 无边框模式
const borderlessCollapse = new NGCollapse("#container", {
  bordered: false,
  items: [{ key: "1", label: "无边框面板", children: "内容" }],
});

// 幽灵模式（透明背景）
const ghostCollapse = new NGCollapse("#container", {
  ghost: true,
  items: [{ key: "1", label: "幽灵面板", children: "适用于深色背景" }],
});
```

---

### 图标位置配置

```javascript
// 图标在右侧
const rightIconCollapse = new NGCollapse("#container", {
  expandIconPosition: "end",
  items: [{ key: "1", label: "右侧图标", children: "图标在标题右侧" }],
});
```

---

### 自定义图标样式

```javascript
// 自定义图标颜色和粗细
const customIconCollapse = new NGCollapse("#container", {
  iconProps: {
    width: 20,
    height: 20,
    strokeWidth: 1.5,
    stroke: "#1890ff", // NG Design 主题色
    style: {
      marginRight: "10px",
    },
  },
  items: [{ key: "1", label: "自定义图标", children: "蓝色细线条图标" }],
});
```

---

### 带额外内容的面板

```javascript
const extraCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "待办事项",
      children: "任务内容...",
      extra: "2023-12-01",
    },
    {
      key: "2",
      label: "通知面板",
      children: "通知内容...",
      extra: '<span style="color: red;">紧急</span>',
    },
    {
      key: "3",
      label: "高级面板",
      children: "高级内容...",
      extra: () => {
        const btn = document.createElement("button");
        btn.textContent = "操作";
        btn.onclick = (e) => {
          e.stopPropagation();
          alert("按钮被点击");
        };
        return btn;
      },
    },
  ],
});
```

---

### 禁用功能

```javascript
const disabledCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "正常面板",
      children: "可以点击",
    },
    {
      key: "2",
      label: "禁用面板",
      children: "无法点击展开",
      disabled: true,
    },
    {
      key: "3",
      label: "仅图标可点击",
      children: "只能通过点击图标展开",
      collapsible: "icon",
    },
  ],
});
```

---

### 动态内容面板

```javascript
const dynamicCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "动态内容面板",
      children: () => {
        const div = document.createElement("div");
        div.innerHTML = `
                    <p>当前时间: ${new Date().toLocaleTimeString()}</p>
                    <button id="refresh-btn">刷新</button>
                `;

        setTimeout(() => {
          div.querySelector("#refresh-btn").onclick = () => {
            alert("刷新时间");
          };
        }, 0);

        return div;
      },
      forceRender: true, // 强制渲染，即使面板未展开
    },
  ],
});
```

---

### 事件处理

```javascript
const eventCollapse = new NGCollapse("#container", {
  items: [
    { key: "1", label: "面板 1", children: "内容 1" },
    { key: "2", label: "面板 2", children: "内容 2" },
    { key: "3", label: "面板 3", children: "内容 3" },
  ],
  onChange: (activeKeys) => {
    console.log("激活的面板:", activeKeys);
    // 手风琴模式：activeKeys 是字符串或 undefined
    // 非手风琴模式：activeKeys 是数组

    // 可以在这里更新状态、发送请求等
    if (activeKeys && activeKeys.includes("2")) {
      console.log("面板2被展开了");
    }
  },
});
```

---

### 复杂内容面板

```javascript
const complexCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "复杂内容面板",
      children: `
                <div class="complex-content">
                    <h3>标题</h3>
                    <p>段落内容...</p>
                    <ul>
                        <li>列表项 1</li>
                        <li>列表项 2</li>
                        <li>列表项 3</li>
                    </ul>
                    <div class="actions">
                        <button class="btn">按钮 1</button>
                        <button class="btn">按钮 2</button>
                    </div>
                </div>
            `,
      className: "custom-panel",
      style: {
        backgroundColor: "#f9f9f9",
      },
    },
  ],
  classNames: {
    container: "my-collapse-container",
    item: "my-collapse-item",
    header: "my-collapse-header",
  },
  styles: {
    container: {
      border: "2px solid #e8e8e8",
    },
  },
});
```

---

## 实例方法

### 动态操作面板

```javascript
const collapse = new NGCollapse("#container", {
  items: [{ key: "1", label: "初始面板", children: "初始内容" }],
});

// 1. 添加新面板
const newKey = collapse.addPanel({
  key: "2",
  label: "动态添加的面板",
  children: "这是动态添加的内容",
});
console.log("新面板的 key:", newKey);

// 指定位置添加
collapse.addPanel(
  {
    key: "3",
    label: "插入到第一个位置的面板",
    children: "插入内容",
  },
  0
); // 插入到索引 0 的位置

// 2. 删除面板
const removed = collapse.removePanel("1");
console.log("是否删除成功:", removed);

// 3. 更新面板
collapse.updatePanel("2", {
  label: "更新后的标题",
  children: "更新后的内容",
  disabled: true,
});

// 4. 展开/折叠面板
collapse.expandPanel("2"); // 展开指定面板
collapse.collapsePanel("2"); // 折叠指定面板

// 5. 展开/折叠所有面板
collapse.expandAll(); // 展开所有面板
collapse.collapseAll(); // 折叠所有面板

// 6. 获取当前激活的面板
const activeKeys = collapse.getActiveKey();
console.log("当前激活的面板:", activeKeys);

// 7. 获取面板信息
const panelInfo = collapse.getPanel("2");
console.log("面板信息:", panelInfo);

// 8. 获取所有面板
const allPanels = collapse.getPanels();
console.log("所有面板:", allPanels);

// 9. 更新配置
collapse.updateConfig({
  size: "small",
  ghost: true,
});

// 10. 更新图标配置
collapse.updateIconConfig("2", {
  stroke: "#ff4d4f",
  strokeWidth: 3,
});

// 11. 更新所有图标
collapse.updateAllIcons({
  width: 20,
  height: 20,
});

// 12. 使用自定义图标类型
collapse.setCustomIcon("2", "chevron"); // 默认 chevron 图标
collapse.setCustomIcon("2", "caret"); // 更细的 caret 图标
collapse.setCustomIcon("2", "plus"); // 加号/减号图标

// 13. 强制更新
collapse.forceUpdate();

// 14. 销毁实例
// collapse.destroy();
```

---

## 自定义图标

```javascript
// 方法 1：使用内置图标类型
collapse.setCustomIcon("panel-key", "chevron"); // 默认
collapse.setCustomIcon("panel-key", "caret"); // 细线条
collapse.setCustomIcon("panel-key", "plus"); // 加号/减号

// 方法 2：完全自定义 SVG
const customCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "自定义 SVG 图标",
      children: "内容",
      expandIcon: (isActive) => {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        if (isActive) {
          // 展开状态的图标
          path.setAttribute("d", "M19 9l-7 7-7-7");
        } else {
          // 收起状态的图标
          path.setAttribute("d", "M9 5l7 7-7 7");
        }
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");

        svg.appendChild(path);
        return svg;
      },
    },
  ],
});

// 方法 3：使用字符串形式的 SVG
const svgStringCollapse = new NGCollapse("#container", {
  expandIcon: (isActive) => {
    return isActive
      ? '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
  },
  items: [{ key: "1", label: "自定义 SVG 字符串", children: "内容" }],
});
```

---

## 响应式示例

```javascript
// 根据窗口大小调整配置
function createResponsiveCollapse() {
  const isMobile = window.innerWidth < 768;

  return new NGCollapse("#container", {
    size: isMobile ? "small" : "default",
    items: [
      {
        key: "1",
        label: "响应式面板",
        children: isMobile ? "移动端内容（精简版）" : "桌面端内容（完整版）",
      },
    ],
  });
}

// 监听窗口大小变化
let responsiveCollapse = createResponsiveCollapse();
window.addEventListener("resize", () => {
  responsiveCollapse.destroy();
  responsiveCollapse = createResponsiveCollapse();
});
```

---

## 样式自定义

### CSS 覆盖示例

```css
/* _ 自定义容器样式 _ */
.custom-collapse-container {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* _ 自定义面板样式 _ */
.custom-collapse-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
}

/* _ 自定义标题样式 _ */
.custom-collapse-header {
  color: white;
  font-weight: 600;
  padding: 16px 20px;
}

/* _ 自定义图标样式 _ */
.custom-collapse-icon svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* _ 自定义内容样式 _ */
.custom-collapse-content {
  background: white;
}

.custom-collapse-content-box {
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
}

/* _ 悬停效果 _ */
.custom-collapse-header:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* _ 激活状态 _ */
.ant-collapse-item-active .custom-collapse-header {
  background: rgba(255, 255, 255, 0.15) !important;
}
```

---

### JavaScript 样式配置

```javascript
const styledCollapse = new NGCollapse("#container", {
  items: [{ key: "1", label: "样式化面板", children: "内容" }],
  styles: {
    container: {
      border: "2px solid #1890ff",
      borderRadius: "10px",
      overflow: "hidden",
    },
    header: {
      backgroundColor: "#1890ff",
      color: "white",
      fontWeight: "bold",
    },
    content: {
      backgroundColor: "#f0f7ff",
    },
  },
});
```

---

## 高级用法

### 与数据绑定

```javascript
// 动态数据源
let panelData = [
  { key: "1", label: "面板 1", children: "内容 1" },
  { key: "2", label: "面板 2", children: "内容 2" },
];

function renderCollapse() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  new NGCollapse(container, {
    items: panelData,
    onChange: (activeKeys) => {
      console.log("当前激活:", activeKeys);
    },
  });
}

// 添加新面板
function addNewPanel() {
  panelData.push({
    key: Date.now().toString(),
    label: `新面板 ${panelData.length + 1}`,
    children: "新内容",
  });
  renderCollapse();
}

// 更新面板内容
function updatePanel(key, content) {
  const panel = panelData.find((p) => p.key === key);
  if (panel) {
    panel.children = content;
    renderCollapse();
  }
}
```

---

### 嵌套使用

```javascript
const nestedCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "外层面板",
      children: `
                <div id="nested-container"></div>
                <script>
                    new NGCollapse('#nested-container', {
                        items: [
                            { key: 'inner-1', label: '内层面板1', children: '内层内容1' },
                            { key: 'inner-2', label: '内层面板2', children: '内层内容2' }
                        ]
                    });
                </script>
           `,
    },
  ],
});
```

---

### 与其他组件集成

```javascript
// 与表格集成
const tableCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "数据表格",
      children: `
                <table border="1" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>年龄</th>
                            <th>城市</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>张三</td><td>25</td><td>北京</td></tr>
                        <tr><td>李四</td><td>30</td><td>上海</td></tr>
                    </tbody>
                </table>
            `,
    },
  ],
});

// 与表单集成
const formCollapse = new NGCollapse("#container", {
  items: [
    {
      key: "1",
      label: "用户信息",
      children: `
                <form id="user-form">
                    <div style="margin-bottom: 10px;">
                        <label>姓名：</label>
                        <input type="text" name="name">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>邮箱：</label>
                        <input type="email" name="email">
                    </div>
                    <button type="submit">提交</button>
                </form>
                <script>
                    document.getElementById('user-form').onsubmit = function(e) {
                        e.preventDefault();
                        alert('表单提交');
                    };
                </script>
            `,
    },
  ],
});
```

---

## 浏览器兼容性

NGCollapse 支持所有现代浏览器，包括：

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- iOS Safari 11+
- Android Chrome 60+

---

## 性能优化

- 虚拟滚动：对于大量面板，建议结合虚拟滚动技术
- \*\*懒加载
