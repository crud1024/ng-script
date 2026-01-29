# NG Components 组件库使用文档

这里添加内容

## 概述

NG Components 是一个功能丰富的 JavaScript 组件库，提供了多种常用的 UI 组件。组件库通过模块化方式组织，支持按需使用，每个组件都有独立的命名空间。

## 业主方事业部使用文档

### 概述

业主方事业部使用文档旨在帮助内部开发人员快速了解和使用NG Components组件库。本文档由王智锋（杜甫）维护，英文名Carl，如有问题请联系 crud1024@163.com。

### 快速开始

对于业主方事业部内部项目，推荐使用以下方式引入组件库：

```html
<!-- 内部CDN引入 -->
<script src="./Components.all.js"></script>

<script>
  // 等待组件库加载完成
  $NG.AllReady(
    function () {
      console.log("组件库已就绪");

      // 访问组件
      const buttonGroup = $OSD["ButtonGroup-V1-ButtonGroup"];
      const message = $OSD["Message-V2-Message"];
      const loading = $OSD["Loading-V2-Loading"];

      // 示例：创建按钮组
      new buttonGroup("#my-element", {
        menuItems: [
          { text: "选项1", onClick: () => console.log("点击选项1") },
          { text: "选项2", onClick: () => console.log("点击选项2") },
        ],
      });
    },
    function () {
      console.log("准备就绪");
    },
  );
</script>
```

### 内部组件访问

所有组件都可以通过 `window.$OSD` 对象访问，组件名称采用连字符格式（例如：`ComponentName-Version-ComponentName`）：

- 按钮组：`$OSD["ButtonGroup-V1-ButtonGroup"]`
- 加载动画：`$OSD["Loading-V1-FishingAnimation"]` 或 `$OSD["Loading-V2-Loading"]`
- 消息提示：`$OSD["Message-V1-Message"]` 或 `$OSD["Message-V2-Message"]`

### 内部最佳实践

1. **组件选择**：优先使用V2版本的组件，如Message V2（SVG图标版）
2. **性能优化**：按需引入所需组件，避免加载不必要的功能
3. **错误处理**：始终在组件使用前检查其是否存在
4. **样式定制**：如需定制组件样式，请遵循设计规范

### 技术支持

如在使用过程中遇到问题，请联系：

- 联系人：王智锋（杜甫）
- 英文名：Carl
- 邮箱：crud1024@163.com
- 项目地址：https://github.com/crud1024/ng-script

### 版本管理

业主方事业部使用的组件版本会定期同步最新稳定版本，版本更新前会提前通知相关团队。

## 安装与引入

### CDN 引入

```
<!-- 在主页面中引入组件库 -->
<script>
  $NG.AllReady(
    function () {
      console.log("detail Ready");

      $NG.loadScript(
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/Others/PDFToPNGConverter/V1/PDFToPNGConverter.js",
        function () {
          // 初始化示例
          try {
            console.log($OSD["TreeExpandPanel-V1-TreeExpandPanel"]);
            // 加载指定组件（含版本）
            new $OSD["TreeExpandPanel-V1-TreeExpandPanel"].NGTreeExpandPanel({
              toolbarSelector: "div.udp-panel-title#_re_",
              containerSelector: ".row-hover.rows-container.editable",
              animationDelay: 150,
              position: { index: 2, side: "after" },
              margin: { left: "0 2% 0 2%", right: "0 20px 0 0" },
              defaultState: "level",
              defaultLevel: 3,
              defaultLevels: 5,
              maxCustomLevel: 30,
            });
          } catch (error) {
            console.error("失败", error);
          }
        },
        function (error) {
          console.error("加载失败:", error);
        },
      );
    },
    function () {
      console.log("list Ready");
    },
  );
</script>
```

### 组件访问方式

组件加载完成后，可以通过以下方式访问：

```
// 方式 1：通过全局对象访问
const ButtonGroup = window.NG.Components["ButtonGroup/V1/ButtonGroup"];
const Message = window.NG.Components["Message/V1/Message"];

// 方式 2：直接使用（部分组件会自动注册到全局）
const messageInstance = window.Message; // Message 组件会自动注册到全局
```

## 组件列表

### 1. ButtonGroup/V1/ButtonGroup - 下拉按钮组

#### 概述

一个功能丰富的下拉菜单/按钮组组件，支持多种样式和配置选项。

#### 构造函数

```
const buttonGroup = new ButtonGroup(container, options);
```

**参数：**

- `container` (String | HTMLElement): 容器选择器或 DOM 元素
- `options` (Object): 配置选项（可选）

#### 配置选项

| 参数                  | 类型     | 默认值         | 说明                                                      |
| --------------------- | -------- | -------------- | --------------------------------------------------------- |
| `triggerStyle`        | String   | "button-style" | 触发按钮样式："button-style"、"text-only"、"split-button" |
| `showIcons`           | Boolean  | true           | 是否显示图标                                              |
| `showGroups`          | Boolean  | true           | 是否显示分组标题                                          |
| `menuItems`           | Array    | []             | 菜单项数组                                                |
| `onMainButtonClick`   | Function | null           | 主按钮点击回调（仅 split-button 模式）                    |
| `position`            | String   | "bottom-left"  | 菜单位置                                                  |
| `zIndex`              | Number   | 1000           | 菜单 z-index                                              |
| `animation`           | Boolean  | true           | 是否启用动画                                              |
| `closeOnClickOutside` | Boolean  | true           | 点击外部是否关闭                                          |
| `closeOnItemClick`    | Boolean  | true           | 点击菜单项是否关闭                                        |

#### 菜单项配置

```
const menuItems = [
  {
    text: "编辑",
    icon: "edit", // 内置图标名称或自定义 SVG
    onClick: function (item) {
      console.log("编辑点击", item);
    },
    disabled: false, // 可选，是否禁用
    id: "edit-item", // 可选，自定义 ID
  },
  {
    type: "divider", // 分隔线
  },
  {
    group: "操作组", // 分组标题
    text: "删除",
    icon: "delete",
    onClick: function (item) {
      console.log("删除点击", item);
    },
  },
  {
    text: "复制",
    icon: "copy",
    children: [
      // 子菜单
      {
        text: "复制全部",
        onClick: function () {
          /* ... */
        },
      },
      {
        text: "复制选中",
        onClick: function () {
          /* ... */
        },
      },
    ],
  },
];
```

#### 内置图标列表

- `edit` - 编辑
- `delete` - 删除
- `copy` - 复制
- `share` - 分享
- `download` - 下载
- `user` - 用户
- `settings` - 设置
- `help` - 帮助
- `plus` - 加号
- `file` - 文件
- `folder` - 文件夹
- `link` - 链接
- `envelope` - 信封
- `cog` - 齿轮
- `sliders` - 滑块
- `chevronDown` - 向下箭头
- `chevronRight` - 向右箭头

#### 实例方法

| 方法名          | 参数              | 返回值 | 说明         |
| --------------- | ----------------- | ------ | ------------ |
| `updateOptions` | `options: Object` | -      | 更新配置选项 |
| `setMenuItems`  | `items: Array`    | -      | 设置菜单项   |
| `openMenu`      | -                 | -      | 打开菜单     |
| `closeMenu`     | -                 | -      | 关闭菜单     |
| `toggleMenu`    | -                 | -      | 切换菜单状态 |
| `destroy`       | -                 | -      | 销毁实例     |

#### 事件

| 事件名              | 事件对象                                    | 说明                                   |
| ------------------- | ------------------------------------------- | -------------------------------------- |
| `main-button-click` | `{ detail: { source: "main-button" } }`     | 主按钮点击事件（仅 split-button 模式） |
| `menu-item-click`   | `{ detail: { item, id, text, timestamp } }` | 菜单项点击事件                         |

#### 使用示例

**基本用法：**

```
// 创建普通下拉按钮
const btnGroup = new ButtonGroup("#my-button", {
  triggerStyle: "button-style",
  menuItems: [
    { text: "选项 1", icon: "edit", onClick: () => console.log("选项 1") },
    { text: "选项 2", icon: "delete", onClick: () => console.log("选项 2") },
    { type: "divider" },
    { text: "选项 3", icon: "copy", onClick: () => console.log("选项 3") },
  ],
});

// 监听菜单项点击事件
document
  .querySelector("#my-button")
  .addEventListener("menu-item-click", (e) => {
    console.log("菜单项被点击:", e.detail);
  });
```

**Split Button（分割按钮）：**

```
const splitBtn = new ButtonGroup("#split-button", {
  triggerStyle: "split-button",
  menuItems: [
    { text: "快速编辑", icon: "edit" },
    { text: "高级设置", icon: "settings" },
    { type: "divider" },
    { text: "导出数据", icon: "download" },
  ],
  onMainButtonClick: function () {
    console.log("主按钮被点击，执行默认操作");
  },
});
```

**文本样式按钮：**

```
const textBtn = new ButtonGroup("#text-button", {
  triggerStyle: "text-only",
  menuItems: [
    { text: "查看详情", icon: "user" },
    { text: "修改设置", icon: "settings" },
  ],
});
```

**动态更新菜单：**

```
const dynamicBtn = new ButtonGroup("#dynamic-button", {
  menuItems: [],
});

// 动态添加菜单项
dynamicBtn.setMenuItems([
  { text: "动态选项 1", onClick: () => console.log("动态 1") },
  { text: "动态选项 2", onClick: () => console.log("动态 2") },
]);

// 更新配置
dynamicBtn.updateOptions({
  showIcons: false,
  closeOnItemClick: false,
});
```

### 2. Loading/V1/FishingAnimation - 钓鱼动画加载器

#### 概述

一个美观的钓鱼主题加载动画，支持自定义文本和动画控制。

#### 创建方法

```
const fishingAnimation = createFishingAnimation(containerSelector, loadingText);
```

**参数：**

- `containerSelector` (String): 容器元素选择器
- `loadingText` (String): 加载显示文本，默认 "Loading"

**返回值：**
返回一个包含控制方法的对象。

#### 控制方法

| 方法名       | 参数           | 说明         |
| ------------ | -------------- | ------------ |
| `remove`     | -              | 移除动画     |
| `updateText` | `text: String` | 更新加载文本 |
| `pause`      | -              | 暂停动画     |
| `resume`     | -              | 恢复动画     |

#### 全局方法

```
removeAllFishingAnimations(); // 移除所有钓鱼动画实例
```

#### 使用示例

**基本用法：**

```
// 创建钓鱼动画
const fishingLoader = createFishingAnimation(
  "#loading-container",
  "正在加载中...",
);

// 5 秒后移除
setTimeout(() => {
  fishingLoader.remove();
}, 5000);

// 更新文本
fishingLoader.updateText("加载完成，即将跳转...");

// 暂停动画
fishingLoader.pause();

// 2 秒后恢复
setTimeout(() => {
  fishingLoader.resume();
}, 2000);
```

**批量移除：**

```
// 移除页面上所有钓鱼动画
removeAllFishingAnimations();
```

### 3. Loading/V2/Loading - 通用加载器

#### 概述

一个现代化的通用加载组件，支持自定义文本和主题切换。

#### 创建方法

```
const loadingInstance = createLoading(containerSelector, loadingText);
```

**参数：**

- `containerSelector` (String): 容器元素选择器
- `loadingText` (String): 加载显示文本，默认 "正在加载中"

**返回值：**
返回一个包含控制方法的对象。

#### 控制方法

| 方法名       | 参数            | 说明                |
| ------------ | --------------- | ------------------- | ------------ |
| `remove`     | -               | 移除加载器          |
| `updateText` | `text: String`  | 更新加载文本        |
| `getElement` | -               | 获取加载器 DOM 元素 |
| `show`       | -               | 显示加载器          |
| `hide`       | -               | 隐藏加载器          |
| `setTheme`   | `theme: "light" | "dark"`             | 设置主题样式 |

#### 使用示例

**基本用法：**

```
// 创建加载器
const loader = createLoading("#app-container", "数据加载中...");

// 模拟异步操作
setTimeout(() => {
  loader.updateText("处理中...");
}, 2000);

setTimeout(() => {
  loader.remove(); // 移除加载器
}, 4000);
```

**主题切换：**

```
const loader = createLoading("#app-container", "加载中");

// 切换到暗色主题
loader.setTheme("dark");

// 切换到亮色主题
loader.setTheme("light");
```

**显示/隐藏控制：**

```
const loader = createLoading("#app-container", "加载中");

// 隐藏加载器
loader.hide();

// 显示加载器
loader.show();
```

### 4. Message/V1/Message - 消息提示（文字图标版）

#### 概述

一个功能完整的消息提示组件，支持多种消息类型和位置显示。

#### 初始化

Message 组件会自动创建单例实例并挂载到 window.Message。

```
// 直接使用全局实例
const message = window.Message;
```

#### 显示消息方法

| 方法名      | 参数                               | 返回值               | 说明             |
| ----------- | ---------------------------------- | -------------------- | ---------------- |
| `show`      | `options: Object                   | String`              | 消息 ID 显示消息 |
| `info`      | `content: String, options: Object` | 消息 ID 显示信息消息 |
| `success`   | `content: String, options: Object` | 消息 ID 显示成功消息 |
| `error`     | `content: String, options: Object` | 消息 ID 显示错误消息 |
| `warning`   | `content: String, options: Object` | 消息 ID 显示警告消息 |
| `important` | `content: String, options: Object` | 消息 ID 显示重要消息 |
| `normal`    | `content: String, options: Object` | 消息 ID 显示普通消息 |

#### 消息配置选项

| 参数            | 类型     | 默认值       | 说明                                                                   |
| --------------- | -------- | ------------ | ---------------------------------------------------------------------- |
| `type`          | String   | "info"       | 消息类型："info", "success", "error", "warning", "important", "normal" |
| `content`       | String   | ""           | 消息内容                                                               |
| `duration`      | Number   | 3            | 显示时长（秒），0 表示不自动关闭                                       |
| `position`      | String   | "center-top" | 显示位置："center-top", "center-bottom", "left", "right"               |
| `hideDirection` | String   | "up"         | 关闭动画方向："up", "down", "left", "right"                            |
| `showClose`     | Boolean  | null         | 是否显示关闭按钮（null 时自动根据位置决定）                            |
| `onClose`       | Function | null         | 关闭回调函数                                                           |

#### 其他方法

| 方法名  | 参数                | 说明         |
| ------- | ------------------- | ------------ |
| `close` | `messageId: String` | 关闭指定消息 |
| `clear` | -                   | 清除所有消息 |

#### 使用示例

**基本用法：**

```
// 显示普通消息
const msgId = Message.info("这是一条信息提示");

// 显示成功消息
Message.success("操作成功！", { duration: 5 });

// 显示错误消息
Message.error("操作失败，请重试", {
  duration: 0, // 不自动关闭
  showClose: true,
});

// 显示警告消息
Message.warning("请注意数据安全", {
  position: "center-bottom",
  hideDirection: "down",
});
```

**高级配置：**

```
// 自定义位置和回调
const customMsg = Message.show({
  type: "success",
  content: "自定义配置消息",
  position: "right",
  duration: 5,
  hideDirection: "right",
  showClose: true,
  onClose: () => {
    console.log("消息已关闭");
  },
});

// 手动关闭消息
setTimeout(() => {
  Message.close(customMsg);
}, 2000);
```

**批量操作：**

```
// 清除所有消息
Message.clear();
```

### 5. Message/V2/Message - 消息提示（SVG 图标版）

#### 概述

Message V2 是 V1 的升级版本，使用 SVG 图标替代文字图标，提供更美观的视觉效果。

#### 使用方式

与 V1 完全相同，只是图标显示方式不同。

```
// V2 使用方法与 V1 完全一致
const MessageV2 = window.NG.Components["Message/V2/Message"];
const messageV2 = new MessageV2();

// 或者直接使用全局实例（如果已注册）
messageV2.success("操作成功！");
```

## 组件初始化示例

```
// 初始化函数示例
function initComponents() {
  // 1. 初始化按钮组
  const buttonGroup = new window.NG.Components["ButtonGroup/V1/ButtonGroup"](
    "#action-buttons",
    {
      triggerStyle: "split-button",
      menuItems: [
        { text: "新建", icon: "plus", id: "create" },
        { text: "编辑", icon: "edit", id: "edit" },
        { type: "divider" },
        {
          text: "更多操作",
          icon: "settings",
          children: [
            { text: "导出", icon: "download" },
            { text: "分享", icon: "share" },
          ],
        },
      ],
      onMainButtonClick: function () {
        console.log("执行默认操作");
      },
    },
  );

  // 2. 消息系统（使用V2版本）
  const Message = window.NG.Components["Message/V2/Message"];
  const message = new Message();

  // 3. 监听按钮点击事件
  document
    .querySelector("#action-buttons")
    .addEventListener("menu-item-click", (e) => {
      const action = e.detail.item.id || e.detail.text;

      switch (action) {
        case "create":
          message.success("创建成功！");
          break;
        case "edit":
          message.info("进入编辑模式");
          break;
        default:
          message.info(`执行操作: ${action}`);
      }
    });

  // 4. 演示加载器
  const createLoading =
    window.NG.Components["Loading/V2/Loading"].createLoading;

  // 模拟数据加载
  function loadData() {
    const loader = createLoading("#data-container", "加载数据中...");

    // 模拟API请求
    setTimeout(() => {
      loader.updateText("处理数据...");

      setTimeout(() => {
        loader.remove();
        message.success("数据加载完成！");
      }, 1500);
    }, 2000);
  }

  // 绑定加载数据事件
  document.querySelector("#load-data-btn").addEventListener("click", loadData);
}
```

## 兼容性说明

所有组件支持现代浏览器（Chrome 60+, Firefox 60+, Safari 11+, Edge 79+）

使用 ES6+ 语法，部分旧版浏览器可能需要 polyfill

组件样式使用 CSS3 特性，确保浏览器支持

## 注意事项

组件加载顺序：确保在 DOM 加载完成后初始化组件

样式冲突：组件会动态注入样式，请确保没有样式冲突

内存管理：不使用的组件应及时调用 destroy() 方法

事件监听：组件销毁前应移除外部添加的事件监听器

## 故障排除

### 常见问题

**组件未加载**

- 检查网络连接和 CDN 地址
- 确认 $NG.AllReady 是否正确调用

**样式不正常**

- 检查是否有自定义样式覆盖了组件样式
- 查看浏览器控制台是否有 CSS 错误

**事件不触发**

- 确认事件监听器在组件初始化后绑定
- 检查事件名称是否正确

### 调试建议

```
// 调试组件状态
console.log("可用组件:", Object.keys(window.NG.Components || {}));

// 检查组件实例
if (window.NG.Components["ButtonGroup/V1/ButtonGroup"]) {
  console.log("ButtonGroup 组件可用");
}

// 检查全局实例
if (window.Message) {
  console.log("Message 组件已全局注册");
}
```

## 更新日志

- **V1.0.0 (初始版本)**: 包含 ButtonGroup、Loading、Message 等核心组件
- **V1.1.0**: 增加 Message V2（SVG 图标版）
- **V1.2.0**: 优化 ButtonGroup 的分割按钮样式

## 许可证

本组件库基于 MIT 许可证开源，可自由使用和修改。

更多示例和更新请访问项目仓库： https://github.com/crud1024/ng-script
