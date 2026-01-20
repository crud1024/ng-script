# TableAmountSuffix - 表格金额字段后缀管理器

一个轻量级、可配置的 JavaScript 组件，用于自动为表格中的金额字段添加后缀（如"元"），支持动态内容加载、虚拟滚动和样式定制。

## 功能特性

✅ **自动检测** - 自动识别表格中的金额字段

✅ **动态监听** - 监听 DOM 变化和滚动事件，处理动态加载内容

✅ **样式定制** - 支持自定义后缀文本、CSS 类和内联样式

✅ **性能优化** - 包含防抖处理、行缓存和批量更新

✅ **多种模式** - 支持独立元素和文本两种后缀模式

✅ **完整 API** - 提供创建、更新、销毁等完整生命周期管理

## 安装

### 直接引入

HTML

```html
<script src="table-amount-suffix.js"></script>
```

### NPM 安装（如果需要）

Bash

```bash
# 如果发布到 npm
npm install table-amount-suffix
```

## 快速开始

### 基本用法

JavaScript

```javascript
// 创建实例
const suffixManager = new TableAmountSuffix({
  containerId: "p_form_no_collected_cost_d1",
  fieldKeys: ["u_no_collected_amt"],
});

// 手动重新处理
suffixManager.reapply();

// 销毁实例
suffixManager.destroy();
```

### 带样式的用法

JavaScript

```javascript
const manager = new TableAmountSuffix({
  containerId: "invoice-table",
  fieldKeys: ["amount", "total_price"],
  suffixText: "元",
  suffixClass: "ant-input-number-suffix",
  suffixStyle: {
    color: "#999",
    marginLeft: "2px",
    fontSize: "12px",
  },
});
```

## 配置选项

| 参数               | 类型     | 默认值                                                  | 说明                      |
| ------------------ | -------- | ------------------------------------------------------- | ------------------------- |
| containerId        | string   | 'p_form_no_collected_cost_d1'                           | 表格容器元素的 ID         |
| fieldKeys          | string[] | ['u_no_collected_amt']                                  | 要处理的金额字段 key 数组 |
| suffixText         | string   | '元'                                                    | 后缀文本内容              |
| suffixClass        | string   | 'ant-input-number-suffix'                               | 后缀 CSS 类名             |
| suffixStyle        | Object   | {color: '#999', marginLeft: '2px', fontSize: 'inherit'} | 自定义样式对象            |
| useSeparateElement | boolean  | true                                                    | 是否使用独立元素包裹后缀  |
| scrollDebounceTime | number   | 300                                                     | 滚动事件防抖时间（毫秒）  |
| updateInterval     | number   | 1000                                                    | 定期检查间隔（毫秒）      |
| autoObserve        | boolean  | true                                                    | 是否自动监听 DOM 变化     |
| debug              | boolean  | false                                                   | 是否启用调试模式          |

## API 参考

### 构造函数

JavaScript

```javascript
new TableAmountSuffix(options);
```

创建新的后缀管理器实例。

**参数：**

- `options` (Object): 配置选项对象

**示例：**

JavaScript

```javascript
const manager = new TableAmountSuffix({
  containerId: "my-table",
  fieldKeys: ["amount", "price"],
  suffixText: "USD",
});
```

### 实例方法

#### .reapply()

手动重新处理表格中的所有金额字段。

JavaScript

```javascript
manager.reapply();
```

**使用场景：**

- 数据动态更新后
- 用户手动触发重新处理
- 表格排序或过滤后

#### .updateConfig(newOptions)

更新配置选项并重新应用。

JavaScript

```javascript
manager.updateConfig({
  suffixText: "RMB",
  suffixStyle: { color: "#1890ff" },
});
```

**参数：**

- `newOptions` (Object): 新的配置选项

#### .getStats()

获取当前统计信息。

JavaScript

```javascript
const stats = manager.getStats();
console.log(stats);
// 输出: { totalModified: 15, cachedRows: 10, isProcessing: false }
```

**返回值：**

- `Object`: 包含以下属性的统计对象
  - `totalModified`: 总共处理的字段数
  - `cachedRows`: 已缓存的行数
  - `isProcessing`: 是否正在处理中

#### .destroy()

销毁实例，清理所有监听器和资源。

JavaScript

```javascript
manager.destroy();
```

## 使用示例

### 示例 1：基础表格处理

JavaScript

```javascript
// 处理应收明细表格
const receivablesManager = new TableAmountSuffix({
  containerId: "receivables-table",
  fieldKeys: ["应收金额", "实收金额", "未收金额"],
  suffixText: "元",
});
```

### 示例 2：发票表格处理

JavaScript

```javascript
// 处理发票表格，自定义样式
const invoiceManager = new TableAmountSuffix({
  containerId: "invoice-table",
  fieldKeys: ["subtotal", "tax", "total"],
  suffixText: "USD",
  suffixClass: "invoice-suffix",
  suffixStyle: {
    color: "#52c41a",
    fontWeight: "bold",
    fontSize: "14px",
    marginLeft: "8px",
  },
  useSeparateElement: false,
});
```

### 示例 3：多表格处理

JavaScript

```javascript
// 同时处理多个表格
const managers = {};

// 表格1
managers.table1 = new TableAmountSuffix({
  containerId: "order-table",
  fieldKeys: ["price", "amount"],
  suffixText: "¥",
});

// 表格2
managers.table2 = new TableAmountSuffix({
  containerId: "inventory-table",
  fieldKeys: ["cost", "value"],
  suffixText: "元",
  debug: true,
});

// 批量重新处理
function refreshAllTables() {
  Object.values(managers).forEach((manager) => manager.reapply());
}

// 批量销毁
function cleanupAll() {
  Object.values(managers).forEach((manager) => manager.destroy());
}
```

### 示例 4：与事件系统集成

JavaScript

```javascript
const manager = new TableAmountSuffix({
  containerId: "data-grid",
  fieldKeys: ["value"],
});

// 在 AJAX 加载完成后重新处理
document.addEventListener("ajaxComplete", () => {
  setTimeout(() => manager.reapply(), 300);
});

// 在表格排序后重新处理
document.getElementById("sort-button").addEventListener("click", () => {
  setTimeout(() => manager.reapply(), 500);
});

// 在窗口大小变化时重新处理
window.addEventListener("resize", () => {
  manager.reapply();
});
```

### 示例 5：高级配置

JavaScript

```javascript
// 针对大型表格的性能优化配置
const largeTableManager = new TableAmountSuffix({
  containerId: "big-data-table",
  fieldKeys: ["value"],

  // 性能优化选项
  scrollDebounceTime: 500, // 增加防抖时间
  updateInterval: 3000, // 减少检查频率
  useSeparateElement: false, // 禁用独立元素减少 DOM 操作

  // 样式配置
  suffixText: "元",
  suffixStyle: {
    color: "#666",
    fontSize: "12px",
  },
});
```

## 集成指南

### 与 React 集成

JSX

```jsx
import { useEffect, useRef } from "react";

function TableComponent() {
  const tableRef = useRef(null);
  const managerRef = useRef(null);

  useEffect(() => {
    // 确保 DOM 已渲染
    setTimeout(() => {
      managerRef.current = new TableAmountSuffix({
        containerId: "my-react-table",
        fieldKeys: ["amount"],
      });
    }, 100);

    // 清理
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
      }
    };
  }, []);

  const handleDataChange = () => {
    if (managerRef.current) {
      managerRef.current.reapply();
    }
  };

  return (
    <div>
      <table id="my-react-table">{/* 表格内容 */}</table>
      <button onClick={handleDataChange}>重新处理</button>
    </div>
  );
}
```

### 与 Vue 集成

Vue

```vue
<template>
  <div>
    <table id="my-vue-table">
      <!-- 表格内容 -->
    </table>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$nextTick(() => {
      this.suffixManager = new TableAmountSuffix({
        containerId: "my-vue-table",
        fieldKeys: ["price", "total"],
      });
    });
  },

  beforeDestroy() {
    if (this.suffixManager) {
      this.suffixManager.destroy();
    }
  },

  methods: {
    refreshSuffix() {
      if (this.suffixManager) {
        this.suffixManager.reapply();
      }
    },
  },
};
</script>
```

### 与 Angular 集成

TypeScript

```typescript
import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";

@Component({
  selector: "app-table",
  template: `
    <table id="angular-table">
      <!-- 表格内容 -->
    </table>
  `,
})
export class TableComponent implements AfterViewInit, OnDestroy {
  private suffixManager: any;

  ngAfterViewInit() {
    // 确保 DOM 已渲染
    setTimeout(() => {
      this.suffixManager = new (window as any).TableAmountSuffix({
        containerId: "angular-table",
        fieldKeys: ["amount"],
      });
    }, 300);
  }

  ngOnDestroy() {
    if (this.suffixManager) {
      this.suffixManager.destroy();
    }
  }

  public refreshSuffix() {
    if (this.suffixManager) {
      this.suffixManager.reapply();
    }
  }
}
```

## 故障排除

### 常见问题

1. **后缀没有显示**
   - 可能原因：容器 ID 错误
   - 解决方案：检查容器元素是否存在

   JavaScript

   ```javascript
   console.log("容器是否存在:", !!document.getElementById("my-table"));
   ```

2. **字段没有被处理**
   - 可能原因：字段 key 不匹配
   - 解决方案：检查 DOM 中实际的字段名

   JavaScript

   ```javascript
   // 查看第一行的元素
   const row = document.querySelector('[class*="table-row"]');
   console.log("行元素:", row?.innerHTML);
   ```

3. **样式不生效**
   - 可能原因：CSS 冲突或优先级问题
   - 解决方案：增加样式权重或使用内联样式

   JavaScript

   ```javascript
   new TableAmountSuffix({
     suffixStyle: {
       color: "#f00 !important",
       fontSize: "14px",
     },
   });
   ```

4. **性能问题**
   - 可能原因：表格数据量过大
   - 解决方案：调整配置优化性能

   JavaScript

   ```javascript
   new TableAmountSuffix({
     scrollDebounceTime: 500,
     updateInterval: 2000,
     useSeparateElement: false,
   });
   ```

### 调试模式

启用调试模式查看详细日志：

JavaScript

```javascript
const manager = new TableAmountSuffix({
  debug: true,
  // 其他配置...
});
```

## 浏览器兼容性

| 浏览器            | 版本 | 支持情况         |
| ----------------- | ---- | ---------------- |
| Chrome            | 60+  | ✅ 完全支持      |
| Firefox           | 55+  | ✅ 完全支持      |
| Safari            | 10+  | ✅ 完全支持      |
| Edge              | 79+  | ✅ 完全支持      |
| Internet Explorer | 11   | ⚠️ 需要 polyfill |

## 版本历史

### v1.0.0 (2024-01-20)

- 初始版本发布
- 支持基本后缀添加功能
- 提供完整的配置选项和 API
- 支持动态监听和虚拟滚动

### v1.1.0 (计划中)

- TypeScript 类型定义
- npm 包发布
- 更多事件钩子
- 性能监控工具

## 贡献指南

欢迎提交 Issue 和 Pull Request。

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 支持

如有问题或建议，请：

- 查看 [故障排除](#故障排除) 部分
- 提交 Issue
- 联系维护者：your-email@example.com

## 附录

### 技术原理

TableAmountSuffix 组件通过以下方式工作：

- **DOM 查询**：使用多种选择器查找表格行和金额字段
- **数值识别**：通过正则表达式识别金额数值
- **后缀添加**：根据配置添加后缀文本或元素
- **变化监听**：使用 MutationObserver 监听 DOM 变化
- **性能优化**：通过缓存和防抖避免性能问题

### 性能建议

- **小型表格（< 100 行）**：可以使用默认配置
- **中型表格（100-1000 行）**：建议增加防抖时间
- **大型表格（> 1000 行）**：建议禁用独立元素模式
