# TreeCodeEventBinder 使用说明

简洁封装，用于给树控件中识别到的“数字编码”和“标识符编码”绑定点击事件处理器，适用于动态渲染的树（例如 Ant Design 的树列表）。

## 特性

- 自动在指定树容器中监听点击并提取编码
- 分别回调数字编码与标识符编码处理函数
- 支持手动触发、重新绑定与销毁

## 构造参数

传入配置对象，常用字段：

- `treeContainerSelector` (string, 可选)：树容器的 CSS 选择器，示例为 `.ant-tree-list-holder-inner`。
- `retryDelay` (number, 可选)：未找到容器时的重试间隔（毫秒）。
- `onNumberCodeExtracted` (function(code, sourceTitle), 可选)：数字编码点击回调。
- `onIdentifierCodeExtracted` (function(code, sourceTitle), 可选)：标识符编码点击回调。

若某回调为 `null` 或 `undefined`，表示不处理该类型编码。

## 实例方法

- `init()`：初始化并开始监听
- `rebind()`：在 DOM 完全更新后重新绑定（适用于虚拟列表或刷新后）
- `destroy()`：移除监听并清理资源
- `triggerNumberCodeEvent(code)`：手动触发数字编码事件
- `triggerIdentifierCodeEvent(code)`：手动触发标识符编码事件

## 使用示例

示例 1 — 基本用法：

```javascript
const binder = new TreeCodeEventBinder({
  treeContainerSelector: ".ant-tree-list-holder-inner",
  retryDelay: 1000,
  onNumberCodeExtracted: (numberCode, sourceTitle) => {
    console.log("数字编码被点击:", numberCode, sourceTitle);
    if (window.mapManager?.refreshData) {
      window.mapManager.refreshData({
        oCode: numberCode,
        userId: window.$NG.getUser().userID,
      });
    }
  },
  onIdentifierCodeExtracted: (identifierCode, sourceTitle) => {
    console.log("标识符编码被点击:", identifierCode, sourceTitle);
    if (window.mapManager?.locateToProject) {
      window.mapManager.locateToProject(identifierCode);
    }
  },
});

binder.init();
```

示例 2 — 自定义容器或只处理一种编码：

```javascript
// 指定自定义容器
const customBinder = new TreeCodeEventBinder({
  treeContainerSelector: "#custom-tree-container",
  onNumberCodeExtracted: (code) => {
    /* 处理数字编码 */
  },
  onIdentifierCodeExtracted: (code) => {
    /* 处理标识符编码 */
  },
});

// 只处理数字编码
const singleCodeBinder = new TreeCodeEventBinder({
  onNumberCodeExtracted: (code) => fetchDataByCode(code),
  onIdentifierCodeExtracted: null,
});

singleCodeBinder.init();
```

示例 3 — 手动触发与重新绑定：

```javascript
binder.triggerNumberCodeEvent("123456");
binder.triggerIdentifierCodeEvent("CS-GQ-00062");

// 树刷新后可调用 rebind()
setTimeout(() => binder.rebind(), 3000);

// 组件卸载时调用销毁
// binder.destroy();
```

## 注意

- 对于虚拟滚动或按需渲染的树，建议在渲染完成后调用 `rebind()`。
- 回调内部使用可选链或短路判断，避免依赖全局对象时抛错。

---
