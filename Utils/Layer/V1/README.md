# 布局工具 使用说明（Layer V1）

简短说明：本模块提供一个基于网格的布局工具，用于以单元格为单位创建、调整和导出/导入布局项。

## 快速开始

```javascript
// 1. 创建布局工具实例
const layoutTool = createLayoutTool("root", {
  horizontalUnits: 24, // 水平单元数
  verticalUnits: 18, // 垂直单元数
  style: "rectangle", // 'rectangle' | 'rounded'
  showTitles: false, // 是否显示标题
});

// 2. 添加布局项（返回项 id）
const item1Id = layoutTool.addItem({
  x: 1,
  y: 1,
  width: 6,
  height: 6,
  title: "侧边栏",
  content: "这里是侧边栏内容",
});

const item2Id = layoutTool.addItem({
  x: 7,
  y: 1,
  width: 12,
  height: 12,
  title: "主内容区",
  content: "这里是主内容区域",
});

// 3. 更新配置
layoutTool.updateConfig({
  style: "rounded",
  showTitles: true,
});

// 4. 监听事件
layoutTool.on("itemResized", (data) => {
  console.log("布局项尺寸已改变:", data.itemId);
});

// 5. 导出 / 导入布局
// const layoutConfig = layoutTool.exportLayout();
// layoutTool.importLayout(layoutConfig);
```

## 配置项说明

- `horizontalUnits`：水平网格单元数（整数）。
- `verticalUnits`：垂直网格单元数（整数）。
- `style`：展示风格，支持 `'rectangle'` 或 `'rounded'`。
- `showTitles`：布尔值，是否在布局项中显示标题。

## 常用方法

- `addItem(item)`：添加布局项，参数 `item` 包含 `x`, `y`, `width`, `height`, `title`, `content` 等字段，返回新项的 id。
- `updateConfig(cfg)`：更新整体配置（同创建时的配置项）。
- `on(eventName, handler)`：监听事件，常见事件：`itemResized`、`itemMoved`、`itemAdded` 等（以实现为准）。
- `exportLayout()`：返回可序列化的布局配置（用于保存）。
- `importLayout(cfg)`：从导出的配置恢复布局。

## 使用注意

- 坐标 `x,y` 与 `width,height` 以网格单元为单位，通常从 `1` 开始。
- 请确保 `x+width-1 <= horizontalUnits` 且 `y+height-1 <= verticalUnits`，以避免越界。
- 导出后的布局可以存为 JSON 并通过 `importLayout` 恢复。

如果需要更详细的 API 说明或示例，请查看源码或在项目 README 中搜索 `createLayoutTool`。
