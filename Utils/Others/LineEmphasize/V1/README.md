// 1. 基本用法（使用默认配置：u_radio字段，1浅蓝、2浅黄、3浅绿）
const rowColorManager = TableRowColorManager.createDefault();

// 需要手动初始化（当gridApi就绪后）
setTimeout(() => {
const gridApi = $NG.getCmpApi("grid");
if (gridApi) {
rowColorManager.init(gridApi);
}
}, 200);

// 2. 自定义字段和颜色映射
const customManager = new TableRowColorManager({
field: 'status', // 监听status字段
colorMap: {
'pending': '#fffbe6', // 待处理：浅黄色
'completed': '#f6ffed', // 已完成：浅绿色
'error': '#fff1f0' // 错误：浅红色
},
debug: true // 开启调试模式
});

// 初始化
setTimeout(() => {
const gridApi = $NG.getCmpApi("grid");
if (gridApi) {
customManager.init(gridApi);
}
}, 200);

// 3. 使用createCustom快速创建
const quickManager = TableRowColorManager.createCustom(
'priority', // 字段名
{
'high': '#fff1f0', // 高优先级：浅红色
'medium': '#fffbe6', // 中优先级：浅黄色
'low': '#f6ffed' // 低优先级：浅绿色
},
true // 开启调试
);

// 初始化
setTimeout(() => {
const gridApi = $NG.getCmpApi("grid");
if (gridApi) {
quickManager.init(gridApi);
}
}, 200);

// 4. 自动初始化（推荐用法）
TableRowColorManager.create({
field: 'u_radio',
colorMap: {
1: '#e6f7ff',
2: '#fffbe6',
3: '#f6ffed'
},
debug: true
}).then(manager => {
console.log('自动初始化成功', manager);
}).catch(error => {
console.error('自动初始化失败', error);
});

// 5. 动态修改配置
const manager = new TableRowColorManager();
manager.setField('new_field')
.setColorMap({ 4: '#f9f0ff', 5: '#fcf4e8' })
.setDebug(true);

// 初始化
setTimeout(() => {
const gridApi = $NG.getCmpApi("grid");
if (gridApi) {
manager.init(gridApi);
}
}, 200);

// 6. 手动刷新
manager.refresh(); // 或 manager.forceRefresh();

// 7. 销毁管理器
manager.destroy();
