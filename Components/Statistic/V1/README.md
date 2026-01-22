# NGStatistic 统计数字组件

NGStatistic 是一个灵活易用的统计数字展示组件，可以方便地展示各种统计数据，支持动画效果、自定义样式和多种配置选项。

## 功能特性

- 支持数字格式化显示（千分位分割符）
- 支持数值精度设置
- 可添加前缀和后缀（如货币符号、单位等）
- 支持动画效果
- 可配置每行显示数量
- 支持自定义样式和类名
- 支持响应式布局
- 提供动态数据更新功能

## 安装

将 [Statistic.js](file:///Users/carl/Desktop/GitHub/ng-script/ng-script/Components/Statistic/V1/Statistic.js) 文件引入到项目中即可使用。

## 使用方法

### 基本语法

```javascript
const statistic = new NGStatistic(selector, options);
```

## API 说明

### 构造函数

#### `NGStatistic(selector, options)`

创建一个新的 NGStatistic 实例

- `selector`: DOM 元素选择器或 DOM 元素本身
- `options`: 配置选项

### 配置选项

| 参数                | 类型             | 默认值        | 描述                 |
| ------------------- | ---------------- | ------------- | -------------------- |
| `data`              | Object[]         | []            | 显示的数据数组       |
| `itemsPerRow`       | Number           | 1             | 每行显示的数量       |
| `centered`          | Boolean          | false         | 是否居中对齐         |
| `valueSize`         | Number           | 32            | 数值字体大小         |
| `titleSize`         | Number           | 16            | 标题字体大小         |
| `animationDuration` | Number           | 1000          | 动画持续时间（毫秒） |
| `animationEasing`   | String           | 'easeOutQuad' | 动画缓动函数         |
| `containerStyle`    | Object\|Function | {}            | 容器样式             |

#### 数据项配置 (`data` 数组中的每一项)

| 参数         | 类型          | 默认值 | 描述                     |
| ------------ | ------------- | ------ | ------------------------ |
| `title`      | String        | ''     | 标题文本                 |
| `value`      | Number/String | 0      | 数值                     |
| `prefix`     | String        | ''     | 前缀文本                 |
| `suffix`     | String        | ''     | 后缀文本                 |
| `precision`  | Number        | 0      | 数值精度（小数点后几位） |
| `animation`  | Boolean       | false  | 是否启用动画             |
| `classNames` | Object        | {}     | 自定义类名               |
| `styles`     | Object        | {}     | 自定义样式               |
| `itemStyle`  | Object        | {}     | 单个项目样式             |

### 方法

| 方法名                   | 参数              | 描述           |
| ------------------------ | ----------------- | -------------- |
| `updateData(data)`       | `data`: 新数据    | 更新显示的数据 |
| `updateOptions(options)` | `options`: 新配置 | 更新组件配置   |
| `destroy()`              | 无                | 销毁组件实例   |

## 调用示例

// ==================== 基本用法示例 ====================

// 示例1: 最简单的调用
const demo1 = new NGStatistic('#demo-container-1', {
data: [
{
title: '活跃用户',
value: 45678
}
]
});

// 示例2: 带前缀后缀
const demo2 = new NGStatistic('#demo-container-2', {
data: [
{
title: '销售额',
value: 123456.78,
prefix: '¥',
suffix: '元',
precision: 2
}
]
});

// 示例3: 启用动画
const demo3 = new NGStatistic('#demo-container-3', {
data: [
{
title: '访问量',
value: 8846,
animation: true
}
]
});

// 示例4: 多个统计项
const demo4 = new NGStatistic('#demo-container-4', {
data: [
{
title: '用户数',
value: 10000,
suffix: '人'
},
{
title: '订单数',
value: 5000
},
{
title: '转化率',
value: 65.5,
suffix: '%',
precision: 1
}
]
});

// ==================== 布局配置示例 ====================

// 示例5: 每行显示多个
const demo5 = new NGStatistic('#demo-container-5', {
data: [
{ title: '指标1', value: 1000 },
{ title: '指标2', value: 2000 },
{ title: '指标3', value: 3000 },
{ title: '指标4', value: 4000 }
],
itemsPerRow: 4, // 一行显示4个
centered: true // 居中显示
});

// 示例6: 调整大小
const demo6 = new NGStatistic('#demo-container-6', {
data: [
{ title: '大型数值', value: 999999 },
{ title: '小型数值', value: 99 }
],
valueSize: 48, // 数值字体大小
titleSize: 18 // 标题字体大小
});

// ==================== 样式自定义示例 ====================

// 示例7: 通过classNames自定义
const demo7 = new NGStatistic('#demo-container-7', {
data: [
{
title: '自定义样式',
value: 1234,
classNames: {
container: 'my-stat-item',
value: 'my-value-style',
title: 'my-title-style',
prefix: 'my-prefix-style',
suffix: 'my-suffix-style'
}
}
]
});

// 示例8: 通过styles函数自定义
const demo8 = new NGStatistic('#demo-container-8', {
data: [
{
title: '动态样式',
value: 5678,
styles: {
container: () => ({
padding: '20px',
backgroundColor: '#f0f8ff',
borderRadius: '12px',
border: '2px solid #1890ff'
}),
value: {
color: '#1890ff',
fontWeight: '700',
textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
},
title: {
color: '#666',
fontSize: '16px',
fontWeight: '500'
}
}
}
]
});

// 示例9: 条件样式
const demo9 = new NGStatistic('#demo-container-9', {
data: [
{
title: '完成率',
value: 85,
suffix: '%',
styles: {
value: function() {
const value = this.value;
return {
color: value >= 80 ? '#52c41a' :
value >= 60 ? '#faad14' : '#ff4d4f'
};
}
}.bind({ value: 85 })
}
]
});

// ==================== 容器样式配置 ====================

// 示例10: 自定义容器样式
const demo10 = new NGStatistic('#demo-container-10', {
data: [
{ title: '指标A', value: 1000 },
{ title: '指标B', value: 2000 },
{ title: '指标C', value: 3000 }
],
itemsPerRow: 3,
containerStyle: {
padding: '30px',
backgroundColor: '#fafafa',
borderRadius: '16px',
border: '1px solid #d9d9d9',
margin: '20px 0',
boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
}
});

// 示例11: 响应式布局
const demo11 = new NGStatistic('#demo-container-11', {
data: Array.from({ length: 6 }, (\_, i) => ({
title: `指标${i + 1}`,
value: (i + 1) \* 1000
})),
itemsPerRow: 3,
containerStyle: function() {
const width = window.innerWidth;
if (width < 768) {
return { gridTemplateColumns: 'repeat(1, 1fr)' };
} else if (width < 1024) {
return { gridTemplateColumns: 'repeat(2, 1fr)' };
} else {
return { gridTemplateColumns: 'repeat(3, 1fr)' };
}
}
});

// ==================== 动画配置示例 ====================

// 示例12: 自定义动画
const demo12 = new NGStatistic('#demo-container-12', {
data: [
{
title: '快速动画',
value: 9999,
animation: true,
precision: 0
},
{
title: '慢速动画',
value: 8888,
animation: true,
precision: 0
}
],
animationDuration: 500, // 动画持续时间
animationEasing: 'easeInOutCubic' // 缓动函数
});

// ==================== 复杂数据示例 ====================

// 示例13: 混合配置
const demo13 = new NGStatistic('#demo-container-13', {
data: [
{
title: '总收入',
value: 1234567.89,
prefix: '¥',
precision: 2,
animation: true,
styles: {
value: { color: '#1890ff' }
}
},
{
title: '增长率',
value: 24.68,
suffix: '%',
precision: 2,
animation: true,
styles: {
value: function() {
return {
color: this.value > 0 ? '#52c41a' : '#ff4d4f'
};
}.bind({ value: 24.68 })
}
},
{
title: '用户满意度',
value: 96.5,
suffix: '%',
precision: 1,
animation: true,
classNames: {
container: 'highlight-item'
},
itemStyle: {
padding: '16px',
background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
borderRadius: '12px'
}
}
],
itemsPerRow: 3,
centered: true,
valueSize: 36,
titleSize: 16,
animationDuration: 1000,
containerStyle: {
padding: '24px',
backgroundColor: '#fff',
borderRadius: '8px',
border: '1px solid #f0f0f0'
}
});

// ==================== 动态操作示例 ====================

// 示例14: 动态数据更新
const demo14 = new NGStatistic('#demo-container-14', {
data: [
{ title: '初始值', value: 1000 }
]
});

// 更新数据
setTimeout(() => {
demo14.updateData([
{ title: '更新后', value: 2000, animation: true }
]);
}, 2000);

// 更新配置
setTimeout(() => {
demo14.updateOptions({
valueSize: 40,
titleSize: 18,
centered: true
});
}, 4000);

// ==================== 函数式样式示例 ====================

// 示例15: 高级样式函数
const demo15 = new NGStatistic('#demo-container-15', {
data: [
{
title: '动态颜色',
value: 75,
suffix: '%',
styles: {
container: (function() {
let clickCount = 0;
return function() {
const colors = ['#f0f8ff', '#fff0f6', '#f6ffed', '#fff7e6'];
return {
backgroundColor: colors[clickCount % colors.length],
padding: '20px',
borderRadius: '8px',
cursor: 'pointer',
transition: 'all 0.3s'
};
};
})(),
value: function() {
const value = this.value;
const hue = Math.floor((value / 100) \* 120); // 0-100映射到0-120色相
return {
color: `hsl(${hue}, 70%, 50%)`,
fontSize: '42px',
fontWeight: 'bold'
};
}.bind({ value: 75 })
}
}
]
});

// 添加点击事件
setTimeout(() => {
const item = document.querySelector('#demo-container-15 .ng-statistic-item');
if (item) {
item.addEventListener('click', function() {
const currentValue = parseInt(this.querySelector('.ng-statistic-value').textContent.replace(/,/g, ''));
const newValue = currentValue < 100 ? currentValue + 5 : 0;
demo15.updateData([
{
title: '动态颜色',
value: newValue,
suffix: '%',
styles: demo15.options.data[0].styles
}
]);
});
}
}, 100);

// ==================== 多容器示例 ====================

// 示例16: 多个独立实例
const containers = ['#container-1', '#container-2', '#container-3'];
containers.forEach((container, index) => {
new NGStatistic(container, {
data: [
{
title: `实例${index + 1}`,
value: (index + 1) * 1000,
animation: true
}
],
containerStyle: {
padding: '20px',
backgroundColor: index === 0 ? '#f6ffed' :
index === 1 ? '#fff7e6' : '#f0f8ff',
borderRadius: '8px',
margin: '10px'
}
});
});

// ==================== 完整配置示例 ====================

// 示例17: 所有配置项
const demo17 = new NGStatistic('#demo-container-17', {
data: [
{
title: '完整示例',
value: 123456.789,
prefix: '¥',
suffix: '元',
precision: 3,
animation: true,
animationDuration: 1500, // 覆盖全局配置
classNames: {
container: 'complete-example',
value: 'large-number',
title: 'bold-title'
},
styles: {
container: {
padding: '24px',
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
borderRadius: '16px',
color: 'white'
},
value: {
color: '#fff',
fontSize: '48px',
fontWeight: '800',
textShadow: '0 2px 10px rgba(0,0,0,0.3)'
},
prefix: {
color: 'rgba(255,255,255,0.9)',
fontSize: '24px'
},
suffix: {
color: 'rgba(255,255,255,0.9)',
fontSize: '24px'
},
title: {
color: 'rgba(255,255,255,0.8)',
fontSize: '18px',
fontWeight: '600',
marginTop: '12px'
},
valueContainer: {
alignItems: 'center',
gap: '8px'
}
},
itemStyle: {
textAlign: 'center',
minWidth: '200px'
}
}
],
itemsPerRow: 1,
centered: true,
valueSize: 48, // 被item样式覆盖
titleSize: 18, // 被item样式覆盖
animationDuration: 2000,
animationEasing: 'easeOutQuart',
containerStyle: {
padding: '40px',
backgroundColor: '#f5f5f5',
borderRadius: '20px',
border: '2px solid #1890ff',
maxWidth: '600px',
margin: '0 auto'
}
});

// ==================== 销毁和重建示例 ====================

// 示例18: 销毁和重建
let demo18 = new NGStatistic('#demo-container-18', {
data: [{ title: '实例1', value: 1000 }]
});

// 5秒后销毁
setTimeout(() => {
demo18.destroy();

    // 2秒后重建
    setTimeout(() => {
        demo18 = new NGStatistic('#demo-container-18', {
            data: [{ title: '重建实例', value: 2000, animation: true }],
            containerStyle: {
                padding: '20px',
                backgroundColor: '#f6ffed',
                borderRadius: '8px'
            }
        });
    }, 2000);

}, 5000);

// ==================== 错误处理示例 ====================

// 示例19: 错误容器处理
try {
new NGStatistic('#non-existent-container', {
data: [{ title: '测试', value: 100 }]
});
} catch (error) {
console.log('预期的错误:', error.message);
}

// 示例20: 无效数据
const demo20 = new NGStatistic('#demo-container-20', {
data: [
{
title: '有效数据',
value: 1000
},
{
title: '无效数据',
value: 'not-a-number' // 将显示原始值
}
]
});

// ==================== 实际应用场景示例 ====================

// 示例21: 仪表板统计
const dashboardStats = new NGStatistic('#dashboard-container', {
data: [
{
title: '今日销售额',
value: 23456.78,
prefix: '¥',
precision: 2,
animation: true,
styles: {
container: {
padding: '20px',
backgroundColor: '#fff',
borderRadius: '12px',
boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
}
}
},
{
title: '用户增长',
value: 1234,
suffix: '人',
animation: true,
styles: {
value: { color: '#52c41a' }
}
},
{
title: '转化率',
value: 24.56,
suffix: '%',
precision: 2,
animation: true
},
{
title: '平均响应时间',
value: 156,
suffix: 'ms',
animation: true,
styles: {
value: function() {
return {
color: this.value < 200 ? '#52c41a' :
this.value < 500 ? '#faad14' : '#ff4d4f'
};
}.bind({ value: 156 })
}
}
],
itemsPerRow: 4,
centered: true,
valueSize: 32,
titleSize: 14,
containerStyle: {
gap: '20px',
marginTop: '20px'
}
});

// 示例22: 实时数据更新模拟
const realTimeStats = new NGStatistic('#realtime-container', {
data: [
{ title: '在线用户', value: 100, suffix: '人' },
{ title: '请求数', value: 1000, suffix: '次' },
{ title: '成功率', value: 99.5, suffix: '%', precision: 1 }
],
itemsPerRow: 3
});

// 模拟实时更新
setInterval(() => {
realTimeStats.updateData([
{
title: '在线用户',
value: Math.floor(Math.random() _ 100) + 100,
suffix: '人',
animation: true
},
{
title: '请求数',
value: realTimeStats.options.data[1].value + Math.floor(Math.random() _ 100),
suffix: '次',
animation: true
},
{
title: '成功率',
value: 98 + Math.random() \* 2,
suffix: '%',
precision: 1,
animation: true
}
]);
}, 3000);
