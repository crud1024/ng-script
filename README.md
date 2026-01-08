# ng-script

轻量级的前端脚本加载辅助示例，提供按类型加载、按相对路径加载以及加载完整 URL 的能力，并支持动态修改基础路径以便灵活切换环境。

**快速上手**

- 按类型加载（自动在基础路径上拼接）：

```js
ScriptLoader.loadScriptsByType("Map")
  .then(() => console.log("按类型脚本加载完成"))
  .catch((err) => console.error("加载失败", err));
```

- 直接加载相对路径（会使用基础路径）：

````js
以下是时间轴组件（TimelineComponent）的使用示例与配置说明。本文档以示例为主，按场景分类，方便快速查阅与复制。

目录
- 基本用法
- 状态样式
- 节点形状
- 配置项示例
- 交互示例
- 动态操作（增、改、删）
- 特殊场景
- 响应式与移动端
- 完整示例（项目进度）
- 多实例与生命周期
- API 快速参考

1. 基本用法

最简单的初始化与设置事件：

```javascript
// HTML: <div id="timeline1"></div>
const timeline1 = new TimelineComponent('timeline1');
timeline1.setEvents([
  { title: '事件 1', description: '第一个事件', time: '2023-01-01', status: 'completed' },
  { title: '事件 2', description: '第二个事件', time: '2023-02-01', status: 'incomplete' }
]);
````

垂直 / 水平 时间轴示例：

```javascript
const timeline2 = new TimelineComponent("timeline2", {
  mode: "vertical",
  position: "alternate",
});
const timeline3 = new TimelineComponent("timeline3", {
  mode: "horizontal",
  position: "top",
});
```

2. 状态样式

常用状态与样式示例：

```javascript
const events = [
  {
    title: "已办事项",
    time: "2023-01-01",
    status: "completed",
    color: "#52c41a",
    completedStyle: "filled",
  },
  {
    title: "待办事项",
    time: "2023-02-01",
    status: "pending",
    color: "#faad14",
    pendingStyle: "spinning",
  },
  {
    title: "未办事项",
    time: "2023-03-01",
    status: "incomplete",
    color: "#d9d9d9",
    incompleteStyle: "outline",
  },
];
```

支持自定义图标或颜色：

```javascript
{ title: '测试阶段', description: '自定义图标', time: '2023-04-01', status: 'incomplete', icon: '🧪', color: '#ff4d4f' }
```

3. 节点形状

支持常见点样式：`circle`（默认）、`rounded-rect`、`square`。

```javascript
{ title: '方形节点', time: '2023-03-01', status: 'completed', dotStyle: 'square', color: '#faad14' }
```

4. 配置项示例

完整配置示例（常用选项）：

```javascript
const timeline4 = new TimelineComponent("timeline4", {
  mode: "vertical",
  position: "alternate",
  lineColor: "#e8e8e8",
  lineWidth: 2,
  dotSize: 12,
  dotBorderWidth: 2,
  completedStyle: "filled",
  incompleteStyle: "outline",
  pendingStyle: "spinning",
  reverse: false,
  maxEvents: 50,
  dateFormat: "YYYY-MM-DD HH:mm",
  showTooltips: true,
  clickable: true,
  animation: true,
  pending: "更多事件...",
});
```

不同布局：`position: 'left' | 'right' | 'alternate'`。

5. 交互示例

点击事件与标题点击：

```javascript
const interactiveTimeline = new TimelineComponent("interactiveTimeline", {
  clickable: true,
});
interactiveTimeline.setEvents([
  {
    title: "可点击事件",
    time: "2023-01-01",
    status: "completed",
    onClick: (event, e) => {
      console.log("点击事件:", event);
      alert(`点击了: ${event.title}`);
    },
  },
  {
    title: "标题可点击",
    time: "2023-02-01",
    status: "incomplete",
    onTitleClick: (event, e) => {
      e.stopPropagation();
      console.log("点击标题:", event.title);
    },
  },
]);

// API 绑定单个事件点击
timeline.onEventClick("event-id", (event, e) => {
  console.log("API 方式绑定点击:", event);
});
```

工具提示示例：设置 `tooltip` 或启用 `showTooltips`。

6. 动态操作（添加 / 更新 / 删除）

```javascript
// 初始化
dynamicTimeline.setEvents([
  { title: "初始事件 1", time: "2023-01-01", status: "completed" },
]);

// 添加
const newEventId = dynamicTimeline.addEvent(
  {
    title: "新增事件",
    time: "2023-02-01",
    status: "pending",
    color: "#faad14",
  },
  (event) => {
    console.log("新增事件被点击:", event.title);
  }
);

// 更新
dynamicTimeline.updateEventStatus(newEventId, "completed");
dynamicTimeline.updateEvent(newEventId, {
  title: "更新后的标题",
  description: "新增描述信息",
  color: "#52c41a",
});

// 删除
dynamicTimeline.removeEvent(newEventId);
```

7. 特殊场景

- 待办提示：`pending` 可以是字符串或 DOM 节点。
- 倒序显示：`reverse: true`。
- 自定义日期格式：`dateFormat: 'YYYY 年 MM 月 DD 日 HH:mm:ss'` 或 `'relative'`。

8. 响应式与移动端

根据窗口宽度切换模式，并在 `resize` 事件中调用 `updateOptions`：

```javascript
window.addEventListener("resize", () => {
  responsiveTimeline.updateOptions({
    mode: window.innerWidth > 768 ? "vertical" : "horizontal",
  });
});
```

9. 完整示例：项目进度时间轴（简化）

```javascript
const projectTimeline = new TimelineComponent("projectTimeline", {
  mode: "vertical",
  position: "alternate",
  dateFormat: "YYYY-MM-DD",
  showTooltips: true,
  clickable: true,
});
projectTimeline.setEvents([
  {
    id: "project-start",
    title: "项目启动",
    time: "2023-01-05",
    status: "completed",
    color: "#1890ff",
    tooltip: "项目正式启动",
  },
  {
    id: "ui-design",
    title: "UI 设计",
    time: "2023-02-10",
    status: "pending",
    color: "#faad14",
    pendingStyle: "spinning",
  },
]);

// 动态更新示例
setTimeout(() => {
  projectTimeline.updateEventStatus("ui-design", "completed");
}, 5000);
```

10. 多实例与生命周期

支持多个实例并分别管理数据；使用 `destroy()` 清理资源：

```javascript
const temp = new TimelineComponent("tempTimeline");
temp.destroy();
```

11. API 快速参考

- `new TimelineComponent(id, options)`：创建实例。
- `setEvents(events)`：设置事件数组。
- `getEvents()` / `getEvent(id)`：读取事件。
- `addEvent(event, onClick)`：添加事件，返回 id。
- `updateEvent(id, data)` / `updateEventStatus(id, status)`：更新事件。
- `removeEvent(id)`：删除事件。
- `onEventClick(id, handler)`：按事件 id 绑定点击。
- `updateOptions(opts)`：更新配置。
- `destroy()`：销毁实例，清理资源。

更多示例请参考组件目录下的示例代码与注释（Components/TimeShaft 等）。

——
已将原始示例整理为章节化、可复制的代码块，去除重复项并保留关键配置与示例。欢迎告知是否需要：

- 增加中文/英文对照说明
- 生成简短 API 表格
- 将示例抽成可运行的 demo 页面
