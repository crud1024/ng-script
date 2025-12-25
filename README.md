# ng-script

public-script
// 1. 加载配置中的脚本（会自动添加基础路径）
ScriptLoader.loadScriptsByType('Map');
// 实际加载：https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Map/V1/ProMapMarks.js

// 2. 直接加载脚本（仍然会添加基础路径）
ScriptLoader.loadScriptsDirectly('/NewFeatures/Latest.js', 'New');
// 实际加载：https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/NewFeatures/Latest.js

// 3. 加载完整 URL（不会添加基础路径）
ScriptLoader.loadSingleScript('https://cdn.example.com/external.js');

// 4. 动态修改基础路径
ScriptLoader.setBasePath('https://cdn.jsdelivr.net/gh/crud1024/ng-script@dev');
// 之后所有相对路径都会使用新的基础路径
