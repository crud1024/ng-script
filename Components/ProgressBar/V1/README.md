# InvestmentProgress - 投资进度组件

一个专为投资管理系统设计的可定制化进度组件，支持多种进度展示类型，提供流畅的动画效果和灵活的配置选项。

## 特性

- 📊 **三种进度类型**：圆形进度环、水平进度条、投资可视化
- 🎨 **高度可定制**：颜色、大小、文本、位置均可配置
- 📱 **响应式设计**：自适应父容器大小，自动居中
- 🔧 **完整 API**：提供丰富的控制方法和事件
- 🎯 **平滑动画**：进度变化带有平滑过渡效果
- 🚀 **零依赖**：纯原生 JavaScript 实现

## 安装

### 直接引入

将 `investment-progress.js` 文件下载到您的项目中，然后在 HTML 中引入：

```html
<script src="path/to/investment-progress.js"></script>
```

## 快速开始

### 基础使用

```html
<!-- 创建一个容器 -->
<div id="myProgress" style="width: 300px; height: 300px;"></div>

<script>
  // 初始化进度组件
  const progress = new InvestmentProgress("#myProgress", {
    type: "circle",
    progress: 50,
    text: "投资进度",
  });
</script>
```

### 完整示例

```javascript
// 创建组件实例
const progress = new InvestmentProgress("#container", {
  type: "circle", // 类型: 'circle', 'bar', 'investment'
  size: 200, // 组件大小(px)，对于 bar 类型是宽度，其他是直径
  primaryColor: "#3498db", // 已完成进度颜色
  secondaryColor: "#ecf0f1", // 未完成进度颜色
  textColor: "#2c3e50", // 文本颜色
  showPercentage: true, // 是否显示百分比
  text: "投资项目进度", // 说明文本
  textPosition: "bottom", // 文本位置: 'top', 'bottom', 'left', 'right'
  textMargin: 10, // 文本与图示间距(px)
  progress: 0, // 初始进度(0-100)
  animationDuration: 300, // 进度更新动画时长(ms)
  useContainerSize: true, // 是否自适应父容器大小
  containerMaxSize: 300, // 当自适应时最大尺寸(px)
});

// 更新进度到 75%
progress.updateProgress(75);

// 完成进度
progress.complete();

// 重置进度
progress.reset();

// 更改类型
progress.setType("bar");

// 更改颜色
progress.setColors("#e74c3c", "#f8d7da", "#c0392b");

// 更改文本
progress.setText("计算投资收益率");

// 更改文本位置
progress.setTextPosition("right");
```

## 配置选项

| 参数                | 类型      | 默认值      | 说明                                                                              |
| ------------------- | --------- | ----------- | --------------------------------------------------------------------------------- |
| `type`              | `string`  | `'circle'`  | 进度类型：'circle'（圆形进度环）、'bar'（水平进度条）、'investment'（投资可视化） |
| `size`              | `number`  | `200`       | 组件大小（px），对于 bar 类型是宽度，其他是直径                                   |
| `primaryColor`      | `string`  | `'#3498db'` | 已完成进度颜色                                                                    |
| `secondaryColor`    | `string`  | `'#ecf0f1'` | 未完成进度颜色                                                                    |
| `textColor`         | `string`  | `'#2c3e50'` | 文本颜色                                                                          |
| `showPercentage`    | `boolean` | `true`      | 是否显示百分比文本                                                                |
| `text`              | `string`  | `''`        | 说明文本内容                                                                      |
| `textPosition`      | `string`  | `'bottom'`  | 文本位置：'top'、'bottom'、'left'、'right'                                        |
| `textMargin`        | `number`  | `10`        | 文本与图示的间距（px）                                                            |
| `progress`          | `number`  | `0`         | 初始进度值（0-100）                                                               |
| `animationDuration` | `number`  | `300`       | 进度更新动画时长（毫秒）                                                          |
| `useContainerSize`  | `boolean` | `true`      | 是否自适应父容器大小                                                              |
| `containerMaxSize`  | `number`  | `300`       | 自适应时的最大尺寸（px）                                                          |

## API 方法

### `updateProgress(progress, animate = true)`

更新当前进度。

- `progress`：进度值（0-100）
- `animate`：是否使用动画过渡

```javascript
// 更新到 50%进度，使用动画
progress.updateProgress(50);

// 更新到 80%进度，不使用动画
progress.updateProgress(80, false);
```

### `setType(type)`

更改进度组件类型。

- `type`：进度类型（'circle'、'bar'、'investment'）

```javascript
// 切换到水平进度条
progress.setType("bar");
```

### `setColors(primary, secondary, textColor)`

更改组件颜色配置。

- `primary`：已完成进度颜色
- `secondary`：未完成进度颜色
- `textColor`：文本颜色

```javascript
// 更改为红色主题
progress.setColors("#e74c3c", "#f8d7da", "#c0392b");
```

### `setText(text)`

更改说明文本。

- `text`：文本内容

```javascript
// 更改文本
progress.setText("正在计算收益率...");
```

### `setTextPosition(position)`

更改文本位置。

- `position`：位置（'top'、'bottom'、'left'、'right'）

```javascript
// 将文本放在右侧
progress.setTextPosition("right");
```

### `reset()`

重置进度为 0。

```javascript
// 重置进度
progress.reset();
```

### `complete()`

将进度设置为 100%（完成状态）。

```javascript
// 完成进度
progress.complete();
```

### `destroy()`

销毁组件，释放资源。

```javascript
// 销毁组件
progress.destroy();
```

### `getProgress()`

获取当前进度值。

```javascript
// 获取当前进度
const currentProgress = progress.getProgress();
console.log(`当前进度: ${currentProgress}%`);
```

### `getOptions()`

获取当前配置选项。

```javascript
// 获取配置
const options = progress.getOptions();
console.log(options);
```

## 事件

组件支持以下自定义事件，可以通过容器元素监听：

### `investmentProgress:progressUpdate`

进度更新时触发。

```javascript
document
  .getElementById("container")
  .addEventListener("investmentProgress:progressUpdate", (event) => {
    console.log("进度已更新:", event.detail.progress);
    // event.detail 包含:
    // - progress: 当前进度值
    // - instance: 组件实例
  });
```

### `investmentProgress:complete`

进度完成时触发（达到 100%）。

```javascript
document
  .getElementById("container")
  .addEventListener("investmentProgress:complete", (event) => {
    console.log("进度已完成!");
    // event.detail 包含:
    // - progress: 100
    // - instance: 组件实例
  });
```

## 进度类型说明

### 1. 圆形进度环 (type: 'circle')

- 适合显示百分比进度
- 中心显示百分比数字
- 环形进度指示，美观直观

### 2. 水平进度条 (type: 'bar')

- 传统水平进度显示
- 可内部或外部显示百分比
- 适合线性任务进度展示

### 3. 投资可视化 (type: 'investment')

- 模拟投资增长的曲线图
- 网格背景，增长曲线
- 适合投资收益率等可视化展示

## 响应式设计

组件默认自适应父容器大小：

- 自动计算适合的尺寸
- 始终保持水平垂直居中
- 可通过 `useContainerSize` 和 `containerMaxSize` 控制

```javascript
// 自适应父容器，最大 300px
const progress = new InvestmentProgress("#container", {
  useContainerSize: true,
  containerMaxSize: 300,
});

// 固定大小，不自适应
const progress2 = new InvestmentProgress("#container2", {
  useContainerSize: false,
  size: 250,
});
```

## 浏览器兼容性

| 浏览器          | 版本  |
| --------------- | ----- |
| Chrome          | 58+   |
| Firefox         | 54+   |
| Safari          | 10+   |
| Edge            | 16+   |
| iOS Safari      | 10.3+ |
| Android Browser | 91+   |
