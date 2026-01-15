# FullConfigNGCarousel 轮播组件 - 完整使用文档

## 简介

FullConfigNGCarousel 是一个功能齐全、高度可配置的轮播图组件，支持多种过渡效果、指示器样式、箭头样式和主题配置。

## 快速开始

### 1. 基本引入

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>全配置轮播组件示例</title>
  </head>
  <body>
    <!-- 轮播容器 -->
    <div id="carouselDemo1" style="width: 800px; height: 400px;"></div>

    <script src="full-config-ng-carousel.js"></script>
    <script>
      // 初始化轮播
      const carousel1 = new FullConfigNGCarousel("#carouselDemo1", {
        items: [
          '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">Slide 1</div>',
          '<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">Slide 2</div>',
          '<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">Slide 3</div>',
          '<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">Slide 4</div>',
        ],
      });
    </script>
  </body>
</html>
```

### 2. 完整配置示例

```javascript
// 使用所有可用配置
const fullConfigCarousel = new FullConfigNGCarousel("#carouselDemo2", {
  // 轮播项（支持 HTML 字符串或 DOM 元素）
  items: [
    {
      content:
        '<div style="background: #1890ff; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">自定义内容 1</div>',
    },
    {
      content:
        '<div style="background: #52c41a; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">自定义内容 2</div>',
    },
    document.getElementById("slide3"), // DOM 元素
  ],
  // 自动播放配置
  autoplay: true,
  interval: 3000,
  pauseOnHover: true,

  // 指示点配置
  showDots: true,
  dotPosition: "bottom", // 'top' | 'bottom' | 'left' | 'right'
  dotStyle: "circle", // 'circle' | 'line'
  lineDotWidth: 30,
  lineDotHeight: 3,
  progressDots: true, // 进度条效果

  // 箭头配置
  showArrows: true,
  arrowBackground: true,
  arrowStyle: "solid", // 'solid' | 'outline' | 'minimal'

  // 指示器
  showIndicator: true,

  // 动画效果
  effect: "fade", // 当前支持淡入淡出
  speed: 500,
  infinite: true,

  // 交互
  draggable: true,

  // 颜色主题配置
  colors: {
    dotColor: "rgba(255, 255, 255, 0.5)",
    dotActiveColor: "#1890ff",
    dotHoverColor: "rgba(255, 255, 255, 0.7)",
    progressColor: "#1890ff",
    arrowColor: "#ffffff",
    arrowHoverColor: "#40a9ff",
    arrowBackgroundColor: "rgba(0, 0, 0, 0.5)",
    arrowHoverBackgroundColor: "rgba(0, 0, 0, 0.8)",
    arrowBorderColor: "rgba(255, 255, 255, 0.8)",
    arrowHoverBorderColor: "#ffffff",
    indicatorBackground: "rgba(0, 0, 0, 0.5)",
    indicatorColor: "#ffffff",
    themePrimary: "#1890ff",
    themeSecondary: "#40a9ff",
  },
});
```

### 3. 动态添加内容

```javascript
const dynamicCarousel = new FullConfigNGCarousel("#carouselDemo3", {
  items: [
    '<div style="background: #ff4d4f; height: 100%; display: flex; align-items: center; justify-content: center; color: white;">初始项 1</div>',
  ],
  showIndicator: true,
});

// 添加 HTML 字符串
dynamicCarousel.addItem(
  '<div style="background: #faad14; height: 100%; display: flex; align-items: center; justify-content: center; color: white;">动态添加项 1</div>'
);

// 添加 DOM 元素
const newSlide = document.createElement("div");
newSlide.innerHTML =
  '<div style="background: #52c41a; height: 100%; display: flex; align-items: center; justify-content: center; color: white;">动态添加项 2</div>';
dynamicCarousel.addItem(newSlide);

// 通过选择器批量添加
dynamicCarousel.addItemsBySelector(".carousel-slides .slide-item");
```

### 4. 事件监听

```javascript
const eventCarousel = new FullConfigNGCarousel("#carouselDemo4", {
  items: [
    '<div style="background: #722ed1; height: 100%; color: white;">Slide 1</div>',
    '<div style="background: #13c2c2; height: 100%; color: white;">Slide 2</div>',
    '<div style="background: #eb2f96; height: 100%; color: white;">Slide 3</div>',
  ],
});

// 监听轮播变化事件
eventCarousel.container.addEventListener("ng.carousel.slideChange", (e) => {
  console.log("轮播变化:", {
    从: e.detail.previousIndex,
    到: e.detail.currentIndex,
    总数: e.detail.total,
  });
});

// 监听配置更新事件
eventCarousel.container.addEventListener("ng.carousel.configUpdated", (e) => {
  console.log("配置已更新:", e.detail.config);
});

// 监听颜色更新事件
eventCarousel.container.addEventListener("ng.carousel.colorsUpdated", (e) => {
  console.log("颜色已更新:", e.detail.colors);
});
```

### 5. 动态更新配置

```javascript
const configurableCarousel = new FullConfigNGCarousel("#carouselDemo5", {
  items: [
    '<div style="background: #f5222d; height: 100%; color: white;">Slide 1</div>',
    '<div style="background: #fa8c16; height: 100%; color: white;">Slide 2</div>',
    '<div style="background: #52c41a; height: 100%; color: white;">Slide 3</div>',
    '<div style="background: #1890ff; height: 100%; color: white;">Slide 4</div>',
  ],
  showDots: true,
  showIndicator: true,
});

// 动态更新颜色
configurableCarousel.updateColors({
  dotActiveColor: "#eb2f96",
  progressColor: "#eb2f96",
  arrowColor: "#eb2f96",
  indicatorBackground: "rgba(235, 47, 150, 0.8)",
});

// 动态更新配置
configurableCarousel.updateConfig({
  autoplay: false,
  showArrows: false,
  dotPosition: "right",
  dotStyle: "line",
  lineDotWidth: 40,
  lineDotHeight: 4,
});

// 切换指示器显示
configurableCarousel.updateIndicatorVisibility(false);
```

### 6. 预设主题

```javascript
const themedCarousel = new FullConfigNGCarousel("#carouselDemo6", {
  items: [
    '<div style="background: #f0f0f0; height: 100%; color: #333;">Slide 1</div>',
    '<div style="background: #e0e0e0; height: 100%; color: #333;">Slide 2</div>',
    '<div style="background: #d0d0d0; height: 100%; color: #333;">Slide 3</div>',
  ],
});

// 应用预设主题
themedCarousel.setTheme("dark"); // light, dark, blue, green, purple

// 或手动应用自定义主题
themedCarousel.setTheme("blue");

// 获取当前颜色配置
const currentColors = themedCarousel.getColors();
console.log("当前颜色配置:", currentColors);
```

### 7. 获取状态和控制

```javascript
const controlCarousel = new FullConfigNGCarousel("#carouselDemo7", {
  items: [
    '<div style="background: #8c8c8c; height: 100%; color: white;">Slide 1</div>',
    '<div style="background: #595959; height: 100%; color: white;">Slide 2</div>',
    '<div style="background: #262626; height: 100%; color: white;">Slide 3</div>',
  ],
  autoplay: true,
  interval: 2000,
});

// 获取当前状态
const state = controlCarousel.getState();
console.log("当前状态:", state);

// 手动控制
controlCarousel.next(); // 下一张
controlCarousel.prev(); // 上一张
controlCarousel.goTo(2); // 跳转到第三张

// 控制自动播放
controlCarousel.pauseAutoplay(); // 暂停自动播放
controlCarousel.startAutoplay(); // 开始自动播放

// 销毁组件（释放资源）
// controlCarousel.destroy();
```

### 8. 响应式示例

```html
<div
  id="responsiveCarousel"
  style="width: 100%; max-width: 1200px; margin: 0 auto;"
></div>

<script>
  const responsiveCarousel = new FullConfigNGCarousel("#responsiveCarousel", {
    items: [
      `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 20px;">
            <h2 style="margin: 0 0 20px 0;">响应式设计</h2>
            <p style="margin: 0; text-align: center; max-width: 600px;">在不同屏幕尺寸下自动调整箭头、指示点大小和位置</p>
        </div>`,
      `<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 20px;">
            <h2 style="margin: 0 0 20px 0;">移动端优化</h2>
            <p style="margin: 0; text-align: center; max-width: 600px;">在移动设备上，箭头会适当缩小，确保操作区域合适</p>
        </div>`,
      `<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 20px;">
            <h2 style="margin: 0 0 20px 0;">触摸支持</h2>
            <p style="margin: 0; text-align: center; max-width: 600px;">支持触摸设备滑动切换，提供更好的移动端体验</p>
        </div>`,
    ],
    draggable: true,
    showArrows: true,
    arrowStyle: "minimal",
    showDots: true,
    dotStyle: "line",
    progressDots: true,
    showIndicator: true,
    colors: {
      arrowColor: "#ffffff",
      arrowBackgroundColor: "rgba(0, 0, 0, 0.3)",
      arrowHoverBackgroundColor: "rgba(0, 0, 0, 0.6)",
      dotColor: "rgba(255, 255, 255, 0.4)",
      dotActiveColor: "#ffffff",
      progressColor: "#ffffff",
      indicatorBackground: "rgba(0, 0, 0, 0.5)",
      indicatorColor: "#ffffff",
    },
  });
</script>
```

## 配置选项参考

| 参数            | 类型    | 默认值   | 描述                                                                |
| --------------- | ------- | -------- | ------------------------------------------------------------------- |
| items           | Array   | []       | 轮播项目数组，可以是 HTML 字符串、DOM 元素或包含 content 属性的对象 |
| autoplay        | Boolean | true     | 是否自动播放                                                        |
| interval        | Number  | 3000     | 自动播放间隔（毫秒）                                                |
| dotPosition     | String  | 'bottom' | 指示点位置：'top', 'bottom', 'left', 'right'                        |
| dotStyle        | String  | 'circle' | 指示点样式：'circle'（圆形）, 'line'（条形）                        |
| lineDotWidth    | Number  | 24       | 条形指示点宽度（像素）                                              |
| lineDotHeight   | Number  | 4        | 条形指示点高度（像素）                                              |
| showArrows      | Boolean | true     | 是否显示箭头                                                        |
| showDots        | Boolean | true     | 是否显示指示点                                                      |
| showIndicator   | Boolean | false    | 是否显示指示器（当前/总数）                                         |
| arrowBackground | Boolean | true     | 箭头是否有背景                                                      |
| arrowStyle      | String  | 'solid'  | 箭头样式：'solid'（实心）, 'outline'（轮廓）, 'minimal'（简约）     |
| effect          | String  | 'fade'   | 过渡效果（当前支持淡入淡出）                                        |
| speed           | Number  | 500      | 过渡速度（毫秒）                                                    |
| infinite        | Boolean | true     | 是否无限循环                                                        |
| draggable       | Boolean | true     | 是否支持拖拽切换                                                    |
| pauseOnHover    | Boolean | true     | 鼠标悬停是否暂停自动播放                                            |
| progressDots    | Boolean | false    | 指示点是否显示进度条                                                |
| colors          | Object  | 见下文   | 颜色配置对象                                                        |

### 颜色配置（colors）

| 颜色参数                  | 默认值                     | 描述                         |
| ------------------------- | -------------------------- | ---------------------------- |
| dotColor                  | 'rgba(255, 255, 255, 0.5)' | 指示点颜色                   |
| dotActiveColor            | '#1890ff'                  | 激活指示点颜色               |
| dotHoverColor             | 'rgba(255, 255, 255, 0.7)' | 指示点悬停颜色               |
| progressColor             | '#1890ff'                  | 进度条颜色                   |
| arrowColor                | '#ffffff'                  | 箭头颜色                     |
| arrowHoverColor           | '#40a9ff'                  | 箭头悬停颜色                 |
| arrowBackgroundColor      | 'rgba(0, 0, 0, 0.5)'       | 箭头背景色                   |
| arrowHoverBackgroundColor | 'rgba(0, 0, 0, 0.8)'       | 箭头悬停背景色               |
| arrowBorderColor          | 'rgba(255, 255, 255, 0.8)' | 箭头边框颜色（outline 样式） |
| arrowHoverBorderColor     | '#ffffff'                  | 箭头悬停边框颜色             |
| indicatorBackground       | 'rgba(0, 0, 0, 0.5)'       | 指示器背景色                 |
| indicatorColor            | '#ffffff'                  | 指示器文字颜色               |
| themePrimary              | '#1890ff'                  | 主题主色                     |
| themeSecondary            | '#40a9ff'                  | 主题辅色                     |

## API 方法

| 方法                            | 参数                        | 返回值 | 描述                                                     |
| ------------------------------- | --------------------------- | ------ | -------------------------------------------------------- |
| init()                          | -                           | -      | 初始化组件（内部使用）                                   |
| goTo(index)                     | index: Number               | -      | 跳转到指定索引的幻灯片                                   |
| next()                          | -                           | -      | 切换到下一张幻灯片                                       |
| prev()                          | -                           | -      | 切换到上一张幻灯片                                       |
| startAutoplay()                 | -                           | -      | 开始自动播放                                             |
| pauseAutoplay()                 | -                           | -      | 暂停自动播放                                             |
| addItem(item)                   | item: String/Element/Object | -      | 添加新轮播项                                             |
| addItemsBySelector(selector)    | selector: String            | -      | 通过选择器添加多个项目                                   |
| updateConfig(newConfig)         | newConfig: Object           | -      | 更新组件配置                                             |
| updateColors(newColors)         | newColors: Object           | -      | 更新颜色配置                                             |
| updateIndicatorVisibility(show) | show: Boolean               | -      | 更新指示器显示状态                                       |
| setTheme(themeName)             | themeName: String           | -      | 应用预设主题：'light', 'dark', 'blue', 'green', 'purple' |
| getColors()                     | -                           | Object | 获取当前颜色配置                                         |
| getState()                      | -                           | Object | 获取当前组件状态                                         |
| destroy()                       | -                           | -      | 销毁组件实例                                             |

## 事件系统

组件会触发以下自定义事件：

| 事件名称                  | 触发时机     | 事件对象 detail 属性                   |
| ------------------------- | ------------ | -------------------------------------- |
| ng.carousel.slideChange   | 幻灯片切换时 | { previousIndex, currentIndex, total } |
| ng.carousel.configUpdated | 配置更新时   | { config }                             |
| ng.carousel.colorsUpdated | 颜色更新时   | { colors }                             |

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 10.1+
- Edge 79+
- iOS Safari 10.3+
- Android Chrome 67+

## 注意事项

- 组件会自动注入必要的 CSS 样式，无需额外引入 CSS 文件
- 每个实例都有独立的样式隔离，避免样式冲突
- 在组件销毁时，会自动清理定时器和事件监听器
- 建议在组件销毁前调用 destroy() 方法以释放资源
- 组件支持响应式设计，在不同屏幕尺寸下会有适当调整

## 许可证

MIT License
