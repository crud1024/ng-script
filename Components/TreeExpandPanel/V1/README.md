**TreeExpandPanel（V1）——使用说明**

## 简介

本控件用于在页面中创建可折叠的树状面板，支持自定义插入位置、边距和默认展开状态，并在初始化后返回一个用于控制面板状态的对象。

## 快速示例

```javascript
const treePanel = createTreeExpandPanel({
  toolbarSelector: "div.udp-panel-title#_rq_",
  containerSelector: ".row-hover.rows-container.editable",
  animationDelay: 150,
  position: { index: 2, side: "after" },
  margin: { left: "0 2% 0 2%", right: "0 20px 0 0" },
  defaultState: "level", // 'collapsed' | 'level' | 'expanded'
  defaultLevel: 3,
  defaultLevels: 7,
  maxCustomLevel: 30,
});

// 控制方法示例
treePanel.setState("collapsed"); // 收起全部
treePanel.setState("level", 5); // 展开到第 5 层
treePanel.setState("expanded"); // 全部展开
treePanel.destroy(); // 移除控件
```

## 配置项说明

- `toolbarSelector`：可选，工具栏选择器，用于定位面板标题（字符串）。
- `containerSelector`：可选，容器选择器，面板将插入到该容器内部（字符串）。
- `animationDelay`：可选，动画延迟（毫秒，数字）。
- `position`：可选，插入位置对象：
  - `index`（数字）：目标容器子元素索引（从 0 开始）。
  - `side`（字符串）：'before' 或 'after'，表示插入在该子元素之前或之后。
- `margin`：可选，对象，设置左右或其他样式字符串：
  - `left`：左侧边距字符串，例如 `'0 2% 0 2%'`。
  - `right`：右侧边距字符串，例如 `'0 20px 0 0'`。
- `defaultState`：可选，默认展开状态（字符串）：
  - `'collapsed'`：默认全部折叠。
  - `'level'`：默认展开到指定层级，需配合 `defaultLevel` 使用。
  - `'expanded'`：默认全部展开。
- `defaultLevel`：当 `defaultState === 'level'` 时生效（数字）。
- `defaultLevels`：用于配置控件允许的默认最大层级（数字，可选）。
- `maxCustomLevel`：允许的最大自定义层级（数字，可选）。

## 完整示例

```javascript
const treePanel = createTreeExpandPanel({
  defaultLevels: 7,
  maxCustomLevel: 30,
  toolbarSelector: "div.udp-panel-title#_rq_",
  containerSelector: ".row-hover.rows-container.editable",
  animationDelay: 150,
  position: { index: 2, side: "after" },
  margin: { left: "0 2% 0 2%", right: "0 20px 0 0" },
  defaultState: "level",
  defaultLevel: 3,
});
```

## 返回对象与方法

- `setState(state[, level])`：修改当前显示状态。
  - `state`：'collapsed' | 'level' | 'expanded'
  - `level`：当 `state === 'level'` 时，指定展开的层级（可选，数字）。
- `destroy()`：销毁并移除控件，恢复 DOM 原状（若有）。

## 注意事项

- `position.index` 的索引从 0 开始，超出范围时会插入到容器末尾。
- `margin` 参数以字符串形式传入，组件不会对字符串内容解析，仅作为样式值使用（请确保符合目标样式规则）。

## 常见用法汇总

- 默认全部折叠：

```javascript
createTreeExpandPanel({ defaultState: "collapsed" });
```

- 默认展开到第 3 层：

```javascript
createTreeExpandPanel({ defaultState: "level", defaultLevel: 3 });
```

- 默认全部展开：

```javascript
createTreeExpandPanel({ defaultState: "expanded" });
```

如果你需要我同时检查 `createTreeExpandPanel` 的实现以确保示例参数一致，或者要我把 README 翻成英文，请告诉我。

新功能说明：

1. 插入位置配置 (position)
   javascript
   // 示例：插入到目标元素的第 2 个子元素之前
   createTreeExpandPanel({
   position: {
   index: 1, // 索引从 0 开始
   side: 'before' // 'before' 或 'after'
   }
   });

// 示例：插入到目标元素的第 3 个子元素之后
createTreeExpandPanel({
position: {
index: 2,
side: 'after'
}
}); 2. 边距配置 (margin)
javascript
// 示例：设置左右边距
createTreeExpandPanel({
margin: {
left: '0 5% 0 5%', // 左边距
right: '0 10px' // 右边距
}
}); 3. 默认状态配置 (defaultState)
javascript
// 示例 1：默认收起全部
createTreeExpandPanel({
defaultState: 'collapsed'
});

// 示例 2：默认展开到第 3 层
createTreeExpandPanel({
defaultState: 'level',
defaultLevel: 3
});

// 示例 3：默认全部展开
createTreeExpandPanel({
defaultState: 'expanded'
}); 4. 完整示例
javascript
// 完整配置示例
const treePanel = createTreeExpandPanel({
defaultLevels: 7,
maxCustomLevel: 30,
toolbarSelector: 'div.udp-panel-title#_rq_',
containerSelector: '.row-hover.rows-container.editable',
animationDelay: 150,
position: {
index: 2,
side: 'after'
},
margin: {
left: '0 2% 0 2%',
right: '0 20px 0 0'
},
defaultState: 'level',
defaultLevel: 3
});

// 后续可以通过返回的对象控制状态
// treePanel.setState('collapsed'); // 收起全部
// treePanel.setState('level', 5); // 展开到第 5 层
// treePanel.setState('expanded'); // 全部展开
// treePanel.destroy(); // 移除控件
