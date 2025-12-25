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

```js
ScriptLoader.loadScriptsDirectly("/NewFeatures/Latest.js", "New")
  .then(() => console.log("直接加载完成"))
  .catch((err) => console.error("加载失败", err));
```

- 加载完整 URL（不会使用基础路径）：

```js
ScriptLoader.loadSingleScript("https://cdn.example.com/external.js")
  .then(() => console.log("外部脚本加载完成"))
  .catch((err) => console.error("加载失败", err));
```

- 修改基础路径（动态生效）：

```js
ScriptLoader.setBasePath("https://cdn.jsdelivr.net/gh/crud1024/ng-script@dev");
```

**API 概览**

- `ScriptLoader.loadScriptsByType(type)`：根据配置中不同类型批量加载脚本，返回 Promise。
- `ScriptLoader.loadScriptsDirectly(path, group?)`：传入相对路径加载脚本，返回 Promise，`group` 可用于区分或记录来源。
- `ScriptLoader.loadSingleScript(url)`：传入完整 URL 加载单个脚本，返回 Promise。
- `ScriptLoader.setBasePath(url)`：设置基本加载路径，后续相对路径将基于此路径。

**推荐实践与示例**

使用一个通用的 Promise 封装来加载任意脚本，从而便于在流程中串联调用与错误处理：

```js
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));

    document.head.appendChild(script);
  });
}

// 先加载核心库，再加载配置中的脚本
loadScript(
  "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/NG-DuFu-V1.js"
)
  .then(() => ScriptLoader.loadScriptsByType("Public"))
  .then(() => console.log("所有脚本加载完成"))
  .catch((err) => console.error("加载过程中出错：", err));
```

错误处理建议：对关键资源添加超时保护并在失败时提供降级（例如加载本地备用脚本或提示用户）。

如需补充：

- 列出可用的类型与对应的脚本映射（配置项）；
- 示例中的基础路径如何配置与默认值；
- 在不同环境（dev/prod）下的推荐使用方式。

如果你希望我把 README 扩展为包含配置示例或自动化测试用例，我可以继续完善并提交更新。
