// LimitFront - 字符限制组件

LimitFront 是一个用于限制文本输入长度并提供实时计数反馈的 JavaScript 组件。它可以为文本框或文本域添加字符限制功能，并在用户输入时显示剩余字符数量。

## 功能特性

- 实时字符计数显示
- 达到限制时自动截断文本
- 限制键盘输入（除功能键外）
- 粘贴内容长度控制
- 响应式 UI 反馈（边框颜色变化）

## 安装与使用

### 引入脚本

将 [LimitFront.js](file:///Users/carl/Desktop/GitHub/ng-script/ng-script/Components/LimitFront/V1/LimitFront.js) 文件引入到您的项目中：

```html
<script src="path/to/LimitFront.js"></script>
```

### 基本用法

```javascript
// 初始化字符限制功能
addCharacterCounters([
  {
    selector: "#myTextarea", // 目标元素的选择器
    limit: 100, // 字符限制数量
  },
  {
    selector: ".limited-input",
    limit: 50,
  },
]);
```

## API 说明

### `addCharacterCounters(configs)`

初始化字符限制功能的主要函数。

#### 参数

| 参数名  | 类型  | 描述                                             |
| ------- | ----- | ------------------------------------------------ |
| configs | Array | 配置对象数组，每个对象定义一个需要限制字符的元素 |

#### 配置对象属性

| 属性名   | 类型   | 必需 | 描述                                 |
| -------- | ------ | ---- | ------------------------------------ |
| selector | String | 是   | CSS 选择器，指定要应用字符限制的元素 |
| limit    | Number | 是   | 正整数，指定最大字符数限制           |

### `initCharacterCounter(element, limit)`

内部函数，用于初始化单个元素的字符限制功能。

#### 参数

| 参数名  | 类型        | 描述                      |
| ------- | ----------- | ------------------------- |
| element | HTMLElement | 要应用字符限制的 DOM 元素 |
| limit   | Number      | 最大字符数限制            |

## 工作原理

1. **字符计数**: 实时计算当前输入的字符数量并显示为 `当前数量/限制数量` 的格式
2. **输入限制**:
   - 当达到限制时，不允许输入新字符（功能键除外）
   - 对于粘贴操作，仅粘贴允许范围内的字符数
3. **视觉反馈**:
   - 正常状态下：灰色计数器文字
   - 接近限制（90%）：黄色计数器文字
   - 达到限制：红色计数器文字和边框
4. **自动截断**: 超出限制的文本会被自动截断

## 事件处理

该组件监听以下事件：

- `input`: 实时更新字符计数
- `keydown`: 阻止超出限制的键盘输入
- `paste`: 控制粘贴内容的长度
- `change`: 额外保障以确保不超出限制

## 样式定制

计数器元素具有以下默认样式：

```css
position: absolute;
bottom: -20px;
right: 0;
font-size: 12px;
color: #666;
background: transparent;
padding: 2px 6px;
pointer-events: none;
z-index: 10;
```

您可以根据需要修改这些样式。

## 注意事项

1. 为了使计数器正确显示，组件会将目标元素的父容器设置为相对定位（如果尚未设置）
2. 仅允许特定的功能键（如退格、删除、方向键等）在达到限制后继续工作
3. Ctrl/Cmd 组合键（如全选、复制、粘贴等）不受字符限制影响
4. 当有文本被选中时，替换操作会考虑选中文本的长度

## 示例

```
<!DOCTYPE html>
<html>
<head>
  <title>字符限制示例</title>
</head>
<body>
  <textarea id="myTextarea" placeholder="请输入内容..." rows="5" cols="50"></textarea>
  <input type="text" class="limited-input" placeholder="输入框限制" />

  <script src="LimitFront.js"></script>
  <script>
    addCharacterCounters([
      {
        selector: '#myTextarea',
        limit: 150
      },
      {
        selector: '.limited-input',
        limit: 20
      }
    ]);
  </script>
</body>
</html>
```

## 浏览器兼容性

该组件使用标准的 Web API，在所有现代浏览器中都能正常工作。

## 错误处理

- 如果提供的配置参数无效，会在控制台输出错误信息
- 如果找不到对应选择器的元素，会在控制台输出警告信息
