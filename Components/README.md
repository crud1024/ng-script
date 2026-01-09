NGComponents 组件库
概述
NGComponents 是一个轻量级的组件自动加载器，支持两种加载模式：ES 模块动态导入和传统的 <script>标签加载。适用于各种前端项目环境。
安装
方式 1：直接引入

<script src="path/to/Components.js"></script>

方式 2：ES 模块导入
import Components from './path/to/Components.js';
API 参考
Components.list
类型: Array<string>
描述: 所有可用组件的路径数组
示例:
console.log(Components.list);
// 输出: ["./ButtonGroup/V1/ButtonGroup.js", "./DownloadAttachs/V1/DownloadAttachs.js", ...]
Components.importAll()
返回: Promise<Object>- 包含所有加载模块的对象
描述: 使用 ES 模块的动态 import()加载所有组件，适合模块化构建环境
适用场景: Webpack、Vite、Rollup 等打包工具
示例:
const modules = await Components.importAll();
// modules["./ButtonGroup/V1/ButtonGroup.js"] 包含该模块的导出
Components.loadAll()
返回: Promise<Array<string>>- 成功加载的组件路径数组
描述: 通过创建 <script>标签同步加载所有组件脚本
适用场景: 传统浏览器环境、不支持 ES 模块的项目
注意: 脚本按顺序加载（async=false），确保依赖顺序
示例:
const loaded = await Components.loadAll();
// loaded = ["./ButtonGroup/V1/ButtonGroup.js", "./Message/V1/Message.js", ...]
快速开始

1. 在 HTML 中使用
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <title>使用 NGComponents</title>
       <!-- 引入组件库 -->
       <script src="./dist/Components.js"></script>
   </head>
   <body>
       <div id="app"></div>
       
       <script>
           // 方法1: 使用 script 标签加载
           NGComponents.Components.loadAll()
               .then(loadedComponents => {
                   console.log('已加载组件:', loadedComponents);
                   // 组件现在全局可用
               })
               .catch(err => {
                   console.error('加载失败:', err);
               });
               
           // 方法2: 使用动态导入
           // NGComponents.Components.importAll().then(/* ... */);
       </script>
   </body>
   </html>
2. 在 ES 模块中使用
   // app.js
   import Components from './Components.js';

// 初始化应用
async function initApp() {
try {
console.log('可用组件:', Components.list);

        // 加载所有组件
        const loaded = await Components.loadAll();
        console.log(`成功加载 ${loaded.length} 个组件`);

        // 或使用 importAll（适用于模块化组件）
        // const modules = await Components.importAll();
        // const ButtonGroup = modules['./ButtonGroup/V1/ButtonGroup.js'].default;

    } catch (error) {
        console.error('初始化失败:', error);
    }

}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
可用组件列表
组件库包含以下组件：
组件路径
描述

./ButtonGroup/V1/ButtonGroup.js
按钮组组件

./DownloadAttachs/V1/DownloadAttachs.js
下载附件组件

./Loading/V1/FishingAnimation.js
钓鱼动画加载组件

./Loading/V2/Loading.js
通用加载组件

./Message/V1/Message.js
消息组件 V1

./Message/V2/Message.js
消息组件 V2

./TimeShaft/V1/TimeShaft.js
时间轴组件

./TreeExpandPanel/V1/TreeExpandPanel.js
树形展开面板组件
扩展组件列表
要添加新的组件，修改 COMPONENT_PATHS 数组：
// 在 Components.js 中
const COMPONENT_PATHS = [
// ... 现有组件
"./NewComponent/V1/NewComponent.js", // 添加新组件
"./AnotherComponent/V1/Another.js", // 添加另一个组件
];
错误处理
组件库包含错误处理机制：
// 加载时自动捕获错误
Components.loadAll()
.then(loaded => {
console.log(`成功: ${loaded.length} 个组件`);
})
.catch(error => {
console.error('加载错误:', error);
});

// 单个组件加载失败不会阻止其他组件
// 错误信息会通过 console.warn 输出
路径解析
组件使用智能路径解析：
优先基于当前脚本位置解析
备用方案：使用当前页面 URL
支持相对路径和绝对路径
加载顺序
importAll(): 并行加载，顺序不保证
loadAll(): 串行加载（async=false），保持声明顺序
浏览器兼容性
功能
Chrome
Firefox
Safari
Edge

importAll()
61+
60+
11.1+
79+

loadAll()
所有版本
所有版本
所有版本
所有版本
注意事项
模块类型: 确保组件文件是有效的 ES 模块（如果使用 importAll()）
CORS: 从不同域加载时需配置 CORS
路径: 确保组件路径相对于本文件正确
依赖: 组件间如有顺序依赖，需要在 COMPONENT_PATHS 中正确排序
示例项目结构
project/
├── index.html
├── Components.js # 本文件
├── components/
│ ├── ButtonGroup/
│ │ └── V1/
│ │ └── ButtonGroup.js
│ ├── Message/
│ │ ├── V1/
│ │ │ └── Message.js
│ │ └── V2/
│ │ └── Message.js
│ └── ...其他组件
└── app.js
故障排除
问题 1: 组件加载失败
解决: 检查路径是否正确，组件文件是否存在
问题 2: import()报错
解决: 确保组件文件是有效的 ES 模块，或改用 loadAll()
问题 3: 路径解析错误
解决: 使用绝对路径或确认相对路径的基准位置
许可证
MIT License
