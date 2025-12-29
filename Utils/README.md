**OrgOrProJectTreeEventBinder（Utils）**

简介：该目录提供用于按需加载并管理 `OrgOrProJectTreeEventBinder` 组件的脚本加载器与元信息，便于在运行时动态加载、缓存与查询组件状态。

**主要特点**

- 专用组件支持：内置对 `OrgOrProJectTreeEventBinder` 的加载与信息查询接口。
- 扩展性：保留通用接口，可加载其他组件名/版本。
- 事件通知：加载成功或失败可触发自定义事件以供上层处理。
- 缓存机制：避免重复加载相同脚本，提升性能。

**组件路径**

- 组件主文件：`/Utils/OrgOrProJectTreeEventBinder/V1/OrgOrProJectTreeEventBinder.js`

**暴露的方法（示例）**

- `ComponentScriptLoader.loadOrgOrProJectTreeEventBinder()`：加载该组件（返回 Promise）。
- `ComponentScriptLoader.getOrgOrProJectTreeEventBinderInfo()`：同步返回组件元信息对象。
- `ComponentScriptLoader.isOrgOrProJectTreeEventBinderLoaded()`：返回布尔，指示组件是否已加载。
- `ComponentScriptLoader.loadComponent(name, version)`：通用加载接口（返回 Promise）。

**使用示例**

```javascript
// 使用专用加载器
ComponentScriptLoader.loadOrgOrProJectTreeEventBinder()
  .then(() => console.log("OrgOrProJectTreeEventBinder 加载完成"))
  .catch((err) => console.error("加载失败", err));

// 或使用通用方法
ComponentScriptLoader.loadComponent("OrgOrProJectTreeEventBinder", "V1").then(
  () => console.log("组件加载完成")
);

// 获取组件信息
const info = ComponentScriptLoader.getOrgOrProJectTreeEventBinderInfo();
console.log("组件信息:", info);

// 检查是否已加载
const isLoaded = ComponentScriptLoader.isOrgOrProJectTreeEventBinderLoaded();
console.log("组件是否已加载:", isLoaded);
```

**注意事项**

- 若组件依赖于全局状态或其他脚本，请确保相关依赖已按序加载。
- 对于频繁创建/销毁的视图，建议先调用 `is...Loaded()` 检查，避免重复加载。

如需我将本 README 翻译为英文、补充事件名称与回调签名，或把这些加载器改成 TypeScript 类型定义，我可以继续实现。
