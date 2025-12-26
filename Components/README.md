**ComPonets 组件脚本加载器 — 使用说明**

## 简介

`ComponentScriptLoader` 是一个轻量的组件脚本加载器，负责按名称、版本或分类动态加载项目内的组件脚本（通常位于 `/ComPonets/...`）。它返回 Promise，可用于在脚本加载完成后执行回调。

## 快速示例

```javascript
// 获取所有已注册组件信息
const allComponents = ComponentScriptLoader.getAllComponentsInfo();

// 按分类获取组件
const dataDisplayComponents =
  ComponentScriptLoader.getComponentsByCategory("Data Display");

// 加载指定组件（含版本）
ComponentScriptLoader.loadComponent("TreeExpandPanel", "V1").then(() => {
  console.log("TreeExpandPanel V1 加载完成");
});

// 加载最新版本（不传 version）
ComponentScriptLoader.loadComponent("DataGrid").then(() => {
  console.log("DataGrid 最新版本加载完成");
});

// 同时加载多个组件（支持字符串或对象 { type, version }）
ComponentScriptLoader.loadComponents([
  "TreeExpandPanel",
  { type: "DataGrid", version: "V2" },
  "ChartPanel",
]).then(() => {
  console.log("多个组件加载完成");
});

// 按分类加载组件
ComponentScriptLoader.loadComponentsByCategory([
  "Data Display",
  "Data Visualization",
]).then(() => {
  console.log("数据相关组件加载完成");
});

// 添加新的组件类型及对应脚本路径
ComponentScriptLoader.addComponentType(
  "Notification",
  [
    "/ComPonets/Notification/V1/Notification.js",
    "/ComPonets/Notification/V2/Notification.js",
  ],
  {
    displayName: "通知组件",
    description: "消息通知和提示组件",
    category: "Feedback",
    tags: ["notification", "message", "alert"],
  }
);

// 检查组件是否已加载
const isLoaded = ComponentScriptLoader.isComponentLoaded(
  "TreeExpandPanel",
  "V1"
);
console.log("TreeExpandPanel V1 是否已加载:", isLoaded);
```

## API 说明

- `getAllComponentsInfo()` -> Array
  - 返回已注册组件的元信息数组（名称、可用版本、分类等）。
- `getComponentsByCategory(category)` -> Array
  - 根据分类名返回组件列表。
- `loadComponent(type[, version])` -> Promise
  - 按组件 `type` 加载指定 `version`（可选），不传 `version` 时加载最新版本。Promise 在脚本加载成功时 resolve。
- `loadComponents(items)` -> Promise
  - 批量加载组件；`items` 支持字符串或 `{ type, version }` 对象数组。
- `loadComponentsByCategory(categories)` -> Promise
  - 按分类数组顺序加载分类下的组件。
- `addComponentType(type, urls, meta)` -> void
  - 注册新的组件类型并指定其脚本路径（相对或绝对 URL），`meta` 为可选的元信息对象。
- `isComponentLoaded(type[, version])` -> boolean
  - 判断指定组件（及版本）是否已加载。

## 注意事项

- 推荐使用以 `/ComPonets/...` 为前缀的路径，确保与脚本加载器的基路径解析逻辑一致。
- 所有加载方法均返回 Promise，用于链式调用或等待加载完成。
- 路径可为完整 URL（以 `http://` 或 `https://` 开始），也可以是项目内部相对路径。

如果你希望我把这份 README 同步为英文版或把示例改为更小的可运行 demo，我可以继续处理。
// 1. 获取所有组件信息
const allComponents = ComponentScriptLoader.getAllComponentsInfo();
console.log('所有组件:', allComponents);

// 2. 按分类获取组件
const dataDisplayComponents = ComponentScriptLoader.getComponentsByCategory('Data Display');
console.log('数据展示组件:', dataDisplayComponents);

// 3. 加载单个组件
ComponentScriptLoader.loadComponent('TreeExpandPanel', 'V1').then(() => {
console.log('TreeExpandPanel V1 加载完成');
});

// 4. 加载组件的最新版本
ComponentScriptLoader.loadComponent('DataGrid').then(() => {
console.log('DataGrid 最新版本加载完成');
});

// 5. 加载多个组件
ComponentScriptLoader.loadComponents([
'TreeExpandPanel',
{ type: 'DataGrid', version: 'V2' },
'ChartPanel'
]).then(() => {
console.log('多个组件加载完成');
});

// 6. 按分类加载组件
ComponentScriptLoader.loadComponentsByCategory(['Data Display', 'Data Visualization'])
.then(() => {
console.log('数据相关组件加载完成');
});

// 7. 添加新的组件类型
ComponentScriptLoader.addComponentType('Notification', [
'/ComPonets/Notification/V1/Notification.js',
'/ComPonets/Notification/V2/Notification.js'
], {
displayName: '通知组件',
description: '消息通知和提示组件',
category: 'Feedback',
tags: ['notification', 'message', 'alert']
});

// 8. 检查组件加载状态
const isLoaded = ComponentScriptLoader.isComponentLoaded('TreeExpandPanel', 'V1');
console.log('TreeExpandPanel V1 是否已加载:', isLoaded);
