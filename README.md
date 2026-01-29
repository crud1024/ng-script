# ng-script

ng-script 是一个功能丰富的 JavaScript 组件库，提供了多种常用的 UI 组件。组件库通过模块化方式组织，支持按需使用，每个组件都有独立的命名空间。

## 概述

ng-script 项目包含多个常用的前端 UI 组件，如按钮组、加载动画、消息提示等。这些组件都经过精心设计和封装，具有良好的可扩展性和易用性，能够帮助开发者快速构建现代化的前端界面。

## 主要特性

- **模块化设计**：每个组件都是独立的模块，可以根据需要按需引入
- **版本管理**：支持组件的多版本管理，方便维护和升级
- **易于集成**：提供简单易用的 API，便于快速集成到现有项目中
- **轻量级**：组件库体积小，不会给项目带来过多负担
- **跨浏览器支持**：兼容主流浏览器，确保一致的用户体验

## 组件列表

目前项目包含以下组件：

- **ButtonGroup** - 功能丰富的下拉按钮组组件
- **Loading** - 多种加载动画效果（包括钓鱼动画等）
- **Message** - 消息提示组件（文字图标版和SVG图标版）
- 以及其他多个实用组件

## 使用方法

### 1. 直接引入

在 HTML 页面中直接引入打包好的组件库文件：

```html
<script src="Components/Components.all.js"></script>
```

### 2. 通过 CDN 引入

```html
<script src="https://cdn.jsdelivr.net/gh/crud1024/ng-script@main/Components/Components.all.js"></script>
```

### 3. 访问组件

组件加载完成后，可以通过以下方式访问：

```javascript
// 通过全局对象访问
const ButtonGroup = window.$OSD["ButtonGroup-V1-ButtonGroup"];
const Message = window.$OSD["Message-V2-Message"];

// 创建按钮组实例
new ButtonGroup("#element-id", {
  // 配置选项
});
```

## 目录结构

```
ng-script/
├── Components/           # 组件库主目录
│   ├── ButtonGroup/     # 按钮组组件
│   ├── Loading/         # 加载动画组件
│   ├── Message/         # 消息提示组件
│   ├── Components.js    # 组件打包工具
│   └── README.md        # 组件库使用文档
├── Utils/               # 工具函数库
└── README.md            # 项目主文档
```

## 打包工具

项目提供了 [Components.js](file:///Users/carl/Desktop/GitHub/ng-script/ng-script/Components/Components.js) 工具，可以自动扫描 Components 目录下的所有组件，并将它们打包成一个文件。运行以下命令即可生成打包文件：

```bash
cd Components
node Components.js
```

该命令会生成以下文件：

- [Components.all.js](file:///Users/carl/Desktop/GitHub/ng-script/ng-script/Components/Components.all.js) - 包含所有组件的完整包
- [Components.all.min.js](file:///Users/carl/Desktop/GitHub/ng-script/ng-script/Components/Components.all.min.js) - 压缩版本

## 业主方事业部使用文档

### 概述

业主方事业部使用文档旨在帮助内部开发人员快速了解和使用ng-script组件库。本文档由王智锋（杜甫）维护，英文名Carl，如有问题请联系 crud1024@163.com。

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

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License
