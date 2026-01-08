以下是时间轴组件所有可能的使用示例：

1. 基础使用示例
   1.1 最简单的使用
   javascript
   // HTML: <div id="timeline1"></div>

const timeline1 = new TimelineComponent('timeline1');
timeline1.setEvents([
{
title: '事件 1',
description: '第一个事件',
time: '2023-01-01',
status: 'completed'
},
{
title: '事件 2',
description: '第二个事件',
time: '2023-02-01',
status: 'incomplete'
}
]);
1.2 垂直时间轴
javascript
const timeline2 = new TimelineComponent('timeline2', {
mode: 'vertical',
position: 'alternate'
});
1.3 水平时间轴
javascript
const timeline3 = new TimelineComponent('timeline3', {
mode: 'horizontal',
position: 'top'
}); 2. 不同状态样式示例
2.1 标准样式（实心/空心/旋转）
javascript
const events = [
{
title: '已办事项',
time: '2023-01-01',
status: 'completed',
color: '#52c41a',
completedStyle: 'filled' // 实心
},
{
title: '待办事项',
time: '2023-02-01',
status: 'pending',
color: '#faad14',
pendingStyle: 'spinning' // 旋转
},
{
title: '未办事项',
time: '2023-03-01',
status: 'incomplete',
color: '#d9d9d9',
incompleteStyle: 'outline' // 空心
}
];
2.2 自定义状态样式
javascript
const customEvents = [
{
title: '项目启动',

# 时间轴组件（TimelineComponent）使用示例

本文档整理自原始示例，按场景分组并提供可复制的代码块，便于快速集成与调试。

## 目录

- 基本用法
- 状态与样式
- 节点形状
- 配置项示例
- 交互示例
- 动态操作（增/改/删）
- 特殊场景
- 响应式与移动端
- 完整示例（项目进度）
- 多实例与生命周期
- API 快速参考

## 1. 基本用法

最简单的初始化与设置事件：

```javascript
// HTML: <div id="timeline1"></div>
const timeline1 = new TimelineComponent("timeline1");
timeline1.setEvents([
  {
    title: "事件 1",
    description: "第一个事件",
    time: "2023-01-01",
    status: "completed",
  },
  {
    title: "事件 2",
    description: "第二个事件",
    time: "2023-02-01",
    status: "incomplete",
  },
]);
```

垂直 / 水平 时间轴：

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

## 2. 状态与样式

常见状态与样式：

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

支持自定义图标：

```javascript
{ title: '测试阶段', description: '自定义图标', time: '2023-04-01', status: 'incomplete', icon: '🧪', color: '#ff4d4f' }
```

## 3. 节点形状

支持 `circle`（默认）、`rounded-rect`、`square`：

```javascript
{ title: '方形节点', time: '2023-03-01', status: 'completed', dotStyle: 'square', color: '#faad14' }
```

## 4. 配置项示例

完整配置（常用选项）：

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

布局选项：`position: 'left' | 'right' | 'alternate'`。

## 5. 交互示例

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

// 按事件 id 绑定点击
timeline.onEventClick("event-id", (event, e) => {
  console.log("API 方式绑定点击:", event);
});
```

工具提示：启用 `showTooltips` 或为事件设置 `tooltip` 字段。

## 6. 动态操作（添加 / 更新 / 删除）

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

## 7. 特殊场景

- 待办提示：`pending` 可为字符串或 DOM 节点。
- 倒序：`reverse: true`。
- 自定义日期格式：`dateFormat: 'YYYY 年 MM 月 DD 日 HH:mm:ss'` 或 `'relative'`。

## 8. 响应式与移动端

根据窗口宽度切换模式：

```javascript
window.addEventListener("resize", () => {
  responsiveTimeline.updateOptions({
    mode: window.innerWidth > 768 ? "vertical" : "horizontal",
  });
});
```

## 9. 完整示例：项目进度（简化）

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

setTimeout(() => {
  projectTimeline.updateEventStatus("ui-design", "completed");
}, 5000);
```

## 10. 多实例与生命周期

支持多个实例，使用 `destroy()` 清理：

```javascript
const temp = new TimelineComponent("tempTimeline");
temp.destroy();
```

## 11. API 快速参考

- `new TimelineComponent(id, options)`：创建实例
- `setEvents(events)`：设置事件数组
- `getEvents()` / `getEvent(id)`：读取事件
- `addEvent(event, onClick)`：添加事件，返回 id
- `updateEvent(id, data)` / `updateEventStatus(id, status)`：更新事件
- `removeEvent(id)`：删除事件
- `onEventClick(id, handler)`：按事件 id 绑定点击
- `updateOptions(opts)`：更新配置
- `destroy()`：销毁实例

更多示例请参考同目录下示例代码或组件实现。

---

已将原始示例整理为章节化、可复制的代码块并精简说明。如需我：

- 增加英文对照
- 生成 API 表格
- 抽出 demo 页面
  请告诉我下一步。

1. 基础使用示例
   1.1 最简单的使用
   javascript
   // HTML: <div id="timeline1"></div>

const timeline1 = new TimelineComponent('timeline1');
timeline1.setEvents([
{
title: '事件 1',
description: '第一个事件',
time: '2023-01-01',
status: 'completed'
},
{
title: '事件 2',
description: '第二个事件',
time: '2023-02-01',
status: 'incomplete'
}
]);
1.2 垂直时间轴
javascript
const timeline2 = new TimelineComponent('timeline2', {
mode: 'vertical',
position: 'alternate'
});
1.3 水平时间轴
javascript
const timeline3 = new TimelineComponent('timeline3', {
mode: 'horizontal',
position: 'top'
}); 2. 不同状态样式示例
2.1 标准样式（实心/空心/旋转）
javascript
const events = [
{
title: '已办事项',
time: '2023-01-01',
status: 'completed',
color: '#52c41a',
completedStyle: 'filled' // 实心
},
{
title: '待办事项',
time: '2023-02-01',
status: 'pending',
color: '#faad14',
pendingStyle: 'spinning' // 旋转
},
{
title: '未办事项',
time: '2023-03-01',
status: 'incomplete',
color: '#d9d9d9',
incompleteStyle: 'outline' // 空心
}
];
2.2 自定义状态样式
javascript
const customEvents = [
{
title: '项目启动',
description: '已完成',
time: '2023-01-10',
status: 'completed',
completedStyle: 'filled', // 实心
color: '#1890ff'
},
{
title: 'UI 设计',
description: '进行中',
time: '2023-02-15',
status: 'pending',
pendingStyle: 'spinning', // 旋转空心
color: '#faad14'
},
{
title: '后端开发',
description: '未开始',
time: '2023-03-20',
status: 'incomplete',
incompleteStyle: 'outline', // 空心
color: '#d9d9d9'
},
{
title: '测试阶段',
description: '自定义图标',
time: '2023-04-01',
status: 'incomplete',
icon: '🧪', // 自定义图标
color: '#ff4d4f'
}
]; 3. 不同节点形状示例
3.1 圆形节点
javascript
const circleEvents = [
{
title: '圆形节点',
time: '2023-01-01',
status: 'completed',
dotStyle: 'circle', // 圆形（默认）
color: '#1890ff'
}
];
3.2 圆角矩形节点
javascript
const roundedRectEvents = [
{
title: '圆角矩形节点',
time: '2023-02-01',
status: 'completed',
dotStyle: 'rounded-rect', // 圆角矩形
color: '#52c41a'
}
];
3.3 方形节点
javascript
const squareEvents = [
{
title: '方形节点',
time: '2023-03-01',
status: 'completed',
dotStyle: 'square', // 方形
color: '#faad14'
}
]; 4. 配置选项示例
4.1 完整配置
javascript
const timeline4 = new TimelineComponent('timeline4', {
// 基本配置
mode: 'vertical',
position: 'alternate',

    // 时间轴样式
    lineColor: '#e8e8e8',
    lineWidth: 2,
    dotSize: 12,
    dotBorderWidth: 2,

    // 状态样式配置
    completedStyle: 'filled',    // 已办：实心
    incompleteStyle: 'outline',  // 未办：空心
    pendingStyle: 'spinning',    // 待办：旋转

    // 布局配置
    reverse: false,
    maxEvents: 50,
    timelinePosition: 'center',

    // 功能配置
    dateFormat: 'YYYY-MM-DD HH:mm',
    showTooltips: true,
    clickable: true,
    animation: true,

    // 待办项
    pending: '更多事件...'

});
4.2 不同位置布局
javascript
// 左侧布局
const leftTimeline = new TimelineComponent('leftTimeline', {
mode: 'vertical',
position: 'left'
});

// 右侧布局
const rightTimeline = new TimelineComponent('rightTimeline', {
mode: 'vertical',
position: 'right'
});

// 交替布局（默认）
const alternateTimeline = new TimelineComponent('alternateTimeline', {
mode: 'vertical',
position: 'alternate'
}); 5. 事件交互示例
5.1 点击事件
javascript
const interactiveTimeline = new TimelineComponent('interactiveTimeline', {
clickable: true
});

interactiveTimeline.setEvents([
{
title: '可点击事件',
time: '2023-01-01',
status: 'completed',
onClick: (event, e) => {
console.log('点击事件:', event);
alert(`点击了: ${event.title}`);
}
},
{
title: '标题可点击',
time: '2023-02-01',
status: 'incomplete',
onTitleClick: (event, e) => {
e.stopPropagation();
console.log('点击标题:', event.title);
}
}
]);

// 或通过 API 添加点击事件
timeline.onEventClick('event-id', (event, e) => {
console.log('API 方式绑定点击:', event);
});
5.2 工具提示
javascript
const tooltipTimeline = new TimelineComponent('tooltipTimeline', {
showTooltips: true
});

tooltipTimeline.setEvents([
{
title: '带提示的事件',
description: '鼠标悬停查看详情',
time: '2023-01-01',
tooltip: '这是详细的工具提示信息，可以显示更多内容',
status: 'completed'
}
]); 6. 动态操作示例
6.1 添加事件
javascript
const dynamicTimeline = new TimelineComponent('dynamicTimeline');

// 初始化事件
dynamicTimeline.setEvents([
{ title: '初始事件 1', time: '2023-01-01', status: 'completed' }
]);

// 动态添加事件
const newEventId = dynamicTimeline.addEvent({
title: '新增事件',
time: '2023-02-01',
status: 'pending',
color: '#faad14'
}, (event) => {
console.log('新增事件被点击:', event.title);
});

// 添加多个事件
setTimeout(() => {
dynamicTimeline.addEvent({
title: '延迟添加',
time: '2023-03-01',
status: 'incomplete'
});
}, 2000);
6.2 更新事件
javascript
// 更新事件状态
dynamicTimeline.updateEventStatus(newEventId, 'completed');

// 更新事件内容
dynamicTimeline.updateEvent(newEventId, {
title: '更新后的标题',
description: '新增描述信息',
color: '#52c41a'
});
6.3 删除事件
javascript
// 删除事件
dynamicTimeline.removeEvent(newEventId); 7. 特殊场景示例
7.1 待办项
javascript
const pendingTimeline = new TimelineComponent('pendingTimeline', {
pending: '正在加载更多事件...'
});

// 或使用自定义内容作为待办项
const pendingTimeline2 = new TimelineComponent('pendingTimeline2', {
pending: document.createElement('div')
});
7.2 倒序时间轴
javascript
const reverseTimeline = new TimelineComponent('reverseTimeline', {
reverse: true
});
7.3 自定义日期格式
javascript
const dateFormatTimeline = new TimelineComponent('dateFormatTimeline', {
dateFormat: 'YYYY 年 MM 月 DD 日 HH:mm:ss'
});

// 或使用相对时间
const relativeTimeTimeline = new TimelineComponent('relativeTimeTimeline', {
dateFormat: 'relative'
}); 8. 响应式示例
8.1 移动端适配
javascript
const responsiveTimeline = new TimelineComponent('responsiveTimeline', {
mode: window.innerWidth > 768 ? 'vertical' : 'horizontal'
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
responsiveTimeline.updateOptions({
mode: window.innerWidth > 768 ? 'vertical' : 'horizontal'
});
}); 9. 完整示例：项目进度时间轴
javascript
const projectTimeline = new TimelineComponent('projectTimeline', {
mode: 'vertical',
position: 'alternate',
lineColor: '#f0f0f0',
dotSize: 14,
dotBorderWidth: 2,
dateFormat: 'YYYY-MM-DD',
showTooltips: true,
clickable: true,
animation: true
});

// 项目事件数据
const projectEvents = [
{
id: 'project-start',
title: '项目启动',
description: '召开项目启动会议',
time: '2023-01-05',
status: 'completed',
color: '#1890ff',
dotStyle: 'circle',
completedStyle: 'filled',
tooltip: '项目正式启动，确定项目目标和范围'
},
{
id: 'requirement-analysis',
title: '需求分析',
description: '完成需求文档编写',
time: '2023-01-20',
status: 'completed',
color: '#52c41a',
dotStyle: 'rounded-rect',
completedStyle: 'filled',
tooltip: '收集用户需求，编写 PRD 文档'
},
{
id: 'ui-design',
title: 'UI 设计',
description: '完成界面设计稿',
time: '2023-02-10',
status: 'pending',
color: '#faad14',
dotStyle: 'circle',
pendingStyle: 'spinning',
tooltip: '正在设计界面，预计 2 月 15 日完成'
},
{
title: '前端开发',
description: '开始前端功能开发',
time: '2023-02-20',
status: 'incomplete',
color: '#d9d9d9',
dotStyle: 'square',
incompleteStyle: 'outline',
tooltip: '计划开始时间'
},
{
title: '后端开发',
description: '开始后端 API 开发',
time: '2023-02-25',
status: 'incomplete',
color: '#d9d9d9',
dotStyle: 'square',
incompleteStyle: 'outline',
tooltip: '计划开始时间'
},
{
title: '测试阶段',
description: '系统测试',
time: '2023-03-20',
status: 'incomplete',
color: '#ff4d4f',
icon: '🧪',
tooltip: '质量保证阶段'
}
];

// 设置事件
projectTimeline.setEvents(projectEvents);

// 绑定点击事件
projectTimeline.onEventClick('project-start', (event) => {
console.log('查看项目启动详情:', event);
// 这里可以打开详情弹窗或跳转到详情页面
});

// 动态更新事件状态
setTimeout(() => {
// 模拟 UI 设计完成
projectTimeline.updateEventStatus('ui-design', 'completed');

    // 更新前端开发状态为进行中
    const frontendEvent = projectTimeline.getEvents().find(e => e.title === '前端开发');
    if (frontendEvent) {
        projectTimeline.updateEvent(frontendEvent.id, {
            status: 'pending',
            color: '#faad14',
            pendingStyle: 'spinning'
        });
    }

}, 5000); 10. 多个时间轴实例
javascript
// 创建多个时间轴实例
const timelines = {};

// 项目 A 时间轴
timelines.projectA = new TimelineComponent('timeline-a', {
mode: 'vertical',
position: 'left',
lineColor: '#1890ff',
dotSize: 10
});

// 项目 B 时间轴
timelines.projectB = new TimelineComponent('timeline-b', {
mode: 'horizontal',
position: 'top',
lineColor: '#52c41a',
dotSize: 12
});

// 个人时间轴
timelines.personal = new TimelineComponent('timeline-personal', {
mode: 'vertical',
position: 'alternate',
lineColor: '#faad14',
dotSize: 8
});

// 分别设置数据
timelines.projectA.setEvents([...]);
timelines.projectB.setEvents([...]);
timelines.personal.setEvents([...]); 11. 销毁和清理
javascript
// 创建时间轴
const tempTimeline = new TimelineComponent('tempTimeline');

// 使用后销毁
setTimeout(() => {
// 清理资源
tempTimeline.destroy();

    // 重新使用
    const newTimeline = new TimelineComponent('tempTimeline');
    newTimeline.setEvents([...]);

}, 10000); 12. 获取状态信息
javascript
const timeline = new TimelineComponent('statusTimeline');
timeline.setEvents([...]);

// 获取所有事件
const allEvents = timeline.getEvents();
console.log('所有事件:', allEvents);

// 获取特定事件
const specificEvent = timeline.getEvent('event-id');
console.log('特定事件:', specificEvent);

// 获取配置
const options = timeline.getOptions();
console.log('当前配置:', options);

// 检查是否初始化
const initialized = timeline.isInitialized();
console.log('是否初始化:', initialized);
