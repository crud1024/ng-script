# NgTabs 组件使用文档

## 概述

NgTabs 是一个纯 JavaScript 封装的标签页组件，提供丰富的配置选项和灵活的 API，支持动态添加/删除标签、自定义样式、响应式布局等功能。

---

## 快速开始

### 1. 基本使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NgTabs 示例</title>
  </head>
  <body>
    <div id="tabs-container" style="height: 400px;"></div>

    <script src="ng-tabs.js"></script>
    <script>
      // 创建标签页实例
      const tabs = new NgTabs("#tabs-container", {
        items: [
          {
            key: "1",
            label: "标签一",
            content: "<h3>标签一内容</h3><p>这是第一个标签页的内容</p>",
          },
          {
            key: "2",
            label: "标签二",
            content: "<h3>标签二内容</h3><p>这是第二个标签页的内容</p>",
          },
          {
            key: "3",
            label: "标签三",
            content: "<h3>标签三内容</h3><p>这是第三个标签页的内容</p>",
          },
        ],
        defaultActiveKey: "1",
      });
    </script>
  </body>
</html>
```

### 2. 完整示例（包含所有功能）

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NgTabs 完整示例</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .demo-container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .control-panel {
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
      }
      .control-group {
        margin-bottom: 15px;
      }
      label {
        display: inline-block;
        width: 180px;
        font-weight: bold;
      }
      select,
      input,
      button {
        padding: 8px 12px;
        margin: 5px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      button {
        background: #1890ff;
        color: white;
        border: none;
        cursor: pointer;
      }
      button:hover {
        background: #40a9ff;
      }
      .button-group {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .code-block {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
        margin: 20px 0;
        font-family: "Courier New", monospace;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="demo-container">
      <h1>NgTabs 组件演示</h1>

      <div class="control-panel">
        <h3>控制面板</h3>

        <div class="control-group">
          <label>标签位置:</label>
          <select id="tabPosition">
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="start">start</option>
            <option value="end">end</option>
          </select>

          <label>标签类型:</label>
          <select id="tabType">
            <option value="line">line</option>
            <option value="card">card</option>
          </select>

          <label>标签尺寸:</label>
          <select id="tabSize">
            <option value="small">small</option>
            <option value="middle" selected>middle</option>
            <option value="large">large</option>
          </select>
        </div>

        <div class="control-group">
          <label>指示条尺寸:</label>
          <select id="indicatorSize">
            <option value="auto">auto</option>
            <option value="50px">50px</option>
            <option value="80px">80px</option>
          </select>

          <label>指示条对齐:</label>
          <select id="indicatorAlign">
            <option value="left">left</option>
            <option value="center" selected>center</option>
            <option value="right">right</option>
          </select>
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" id="centered" />
            标签居中
          </label>

          <label>
            <input type="checkbox" id="closable" />
            允许关闭
          </label>

          <label>
            <input type="checkbox" id="showCloseButton" checked />
            显示关闭按钮
          </label>
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" id="showAddButton" checked />
            显示添加按钮
          </label>

          <label>添加按钮位置:</label>
          <select id="addButtonPosition">
            <option value="start">start</option>
            <option value="end" selected>end</option>
          </select>
        </div>

        <div class="control-group">
          <label>新增标签配置:</label>
          <label>
            <input type="checkbox" id="newTabClosable" checked />
            新增标签可关闭
          </label>
          <label>
            <input type="checkbox" id="newTabShowClose" checked />
            新增标签显示关闭按钮
          </label>
        </div>

        <div class="button-group">
          <button onclick="addTab()">添加新标签</button>
          <button onclick="removeCurrentTab()">删除当前标签</button>
          <button onclick="updateCurrentTab()">更新当前标签</button>
          <button onclick="tabs.refresh()">刷新组件</button>
          <button onclick="showActiveKey()">显示当前标签Key</button>
          <button onclick="showTabCount()">显示标签数量</button>
        </div>
      </div>

      <div id="tabs-container" style="height: 300px;"></div>

      <div class="code-block">
        <h3>当前配置</h3>
        <pre id="configOutput"></pre>
      </div>
    </div>

    <script src="ng-tabs.js"></script>
    <script>
      // 初始化配置
      let config = {
        items: [
          {
            key: "1",
            label: "首页",
            content:
              '<div style="padding: 20px;"><h3>欢迎使用 NgTabs</h3><p>这是一个功能强大的标签页组件，支持丰富的配置选项。</p><ul><li>支持动态添加/删除标签</li><li>支持多种标签位置</li><li>支持卡片式标签</li><li>支持响应式布局</li></ul></div>',
          },
          {
            key: "2",
            label: "文档",
            content:
              '<div style="padding: 20px;"><h3>API 文档</h3><p><strong>构造函数:</strong> new NgTabs(container, options)</p><p><strong>方法:</strong></p><ul><li>addItem(item, index) - 添加标签</li><li>removeItem(key) - 删除标签</li><li>updateItem(key, newItem) - 更新标签</li><li>setActiveTab(key) - 设置活动标签</li><li>refresh() - 刷新组件</li><li>destroy() - 销毁组件</li></ul></div>',
          },
          {
            key: "3",
            label: "设置",
            content:
              '<div style="padding: 20px;"><h3>设置面板</h3><p>在这里可以配置组件的各种参数。</p><p>尝试使用上方的控制面板调整标签页的样式和行为。</p></div>',
          },
          {
            key: "4",
            label: "关于",
            content:
              '<div style="padding: 20px;"><h3>关于 NgTabs</h3><p><strong>版本:</strong> 2.0.0</p><p><strong>作者:</strong> NgTabs 团队</p><p><strong>特点:</strong></p><ul><li>纯 JavaScript 实现，无依赖</li><li>支持 TypeScript 类型定义</li><li>完善的 API 文档</li><li>响应式设计</li><li>高度可定制</li></ul></div>',
            closable: false, // 这个标签不可关闭
          },
        ],
        defaultActiveKey: "1",
        tabPosition: "top",
        type: "line",
        size: "middle",
        centered: false,
        closable: true,
        showCloseButton: true,
        showAddButton: true,
        addButtonPosition: "end",
        newTabClosable: true,
        newTabShowClose: true,
        indicator: {
          size: "auto",
          align: "center",
        },
        onChange: function (key) {
          console.log("标签切换:", key);
        },
        onEdit: function (key, action) {
          console.log("标签编辑:", action, key);
          if (action === "add") {
            // 默认添加行为
            const newKey = `tab-${Date.now()}`;
            tabs.addItem({
              key: newKey,
              label: `新标签 ${tabs.getTabCount() + 1}`,
              content: `<div style="padding: 20px;">这是新增的标签页 ${newKey}</div>`,
              isNewTab: true,
            });
            tabs.setActiveTab(newKey);
          }
        },
      };

      // 创建标签页实例
      const tabs = new NgTabs("#tabs-container", config);

      // 更新配置显示
      function updateConfigDisplay() {
        document.getElementById("configOutput").textContent = JSON.stringify(
          config,
          null,
          2
        );
      }

      // 绑定控制面板事件
      document
        .getElementById("tabPosition")
        .addEventListener("change", function (e) {
          tabs.setTabPosition(e.target.value);
          config.tabPosition = e.target.value;
          updateConfigDisplay();
        });

      document
        .getElementById("tabType")
        .addEventListener("change", function (e) {
          tabs.setType(e.target.value);
          config.type = e.target.value;
          updateConfigDisplay();
        });

      document
        .getElementById("tabSize")
        .addEventListener("change", function (e) {
          tabs.setSize(e.target.value);
          config.size = e.target.value;
          updateConfigDisplay();
        });

      document
        .getElementById("indicatorSize")
        .addEventListener("change", function (e) {
          config.indicator.size = e.target.value;
          tabs.setIndicator(config.indicator);
          updateConfigDisplay();
        });

      document
        .getElementById("indicatorAlign")
        .addEventListener("change", function (e) {
          config.indicator.align = e.target.value;
          tabs.setIndicator(config.indicator);
          updateConfigDisplay();
        });

      document
        .getElementById("centered")
        .addEventListener("change", function (e) {
          tabs.setCentered(e.target.checked);
          config.centered = e.target.checked;
          updateConfigDisplay();
        });

      document
        .getElementById("closable")
        .addEventListener("change", function (e) {
          tabs.setClosable(e.target.checked);
          config.closable = e.target.checked;
          updateConfigDisplay();
        });

      document
        .getElementById("showCloseButton")
        .addEventListener("change", function (e) {
          tabs.setShowCloseButton(e.target.checked);
          config.showCloseButton = e.target.checked;
          updateConfigDisplay();
        });

      document
        .getElementById("showAddButton")
        .addEventListener("change", function (e) {
          tabs.setShowAddButton(e.target.checked);
          config.showAddButton = e.target.checked;
          updateConfigDisplay();
        });

      document
        .getElementById("addButtonPosition")
        .addEventListener("change", function (e) {
          tabs.setAddButtonPosition(e.target.value);
          config.addButtonPosition = e.target.value;
          updateConfigDisplay();
        });

      document
        .getElementById("newTabClosable")
        .addEventListener("change", function (e) {
          tabs.setNewTabClosable(e.target.checked);
          config.newTabClosable = e.target.checked;
          updateConfigDisplay();
        });

      document
        .getElementById("newTabShowClose")
        .addEventListener("change", function (e) {
          tabs.setNewTabShowClose(e.target.checked);
          config.newTabShowClose = e.target.checked;
          updateConfigDisplay();
        });

      // 添加标签
      function addTab() {
        const newKey = `custom-${Date.now()}`;
        const isClosable = document.getElementById("newTabClosable").checked;
        const showClose = document.getElementById("newTabShowClose").checked;

        tabs.addItem({
          key: newKey,
          label: `自定义标签 ${tabs.getTabCount() + 1}`,
          content: `<div style="padding: 20px;">
          <h3>自定义标签</h3>
          <p>这是一个通过控制面板添加的标签页。</p>
          <p>Key: ${newKey}</p>
          <p>创建时间: ${new Date().toLocaleString()}</p>
        </div>`,
          isNewTab: true,
          closable: isClosable,
          // showClose 由组件内部根据配置决定
        });

        tabs.setActiveTab(newKey);
      }

      // 删除当前标签
      function removeCurrentTab() {
        const activeKey = tabs.getActiveKey();
        if (activeKey && tabs.getTabCount() > 1) {
          tabs.removeItem(activeKey);
        } else {
          alert("不能删除最后一个标签或没有活动标签");
        }
      }

      // 更新当前标签
      function updateCurrentTab() {
        const activeKey = tabs.getActiveKey();
        if (activeKey) {
          tabs.updateItem(activeKey, {
            label: `更新后的标签 (${new Date().toLocaleTimeString()})`,
            content: `<div style="padding: 20px;">
            <h3>已更新的标签</h3>
            <p>这个标签的内容已经被更新。</p>
            <p>更新时间: ${new Date().toLocaleString()}</p>
          </div>`,
          });
        }
      }

      // 显示当前活动标签Key
      function showActiveKey() {
        const activeKey = tabs.getActiveKey();
        alert(`当前活动标签Key: ${activeKey}`);
      }

      // 显示标签数量
      function showTabCount() {
        const count = tabs.getTabCount();
        alert(`当前标签数量: ${count}`);
      }

      // 初始化配置显示
      updateConfigDisplay();

      // 设置控制面板初始值
      document.getElementById("tabPosition").value = config.tabPosition;
      document.getElementById("tabType").value = config.type;
      document.getElementById("tabSize").value = config.size;
      document.getElementById("indicatorSize").value = config.indicator.size;
      document.getElementById("indicatorAlign").value = config.indicator.align;
      document.getElementById("centered").checked = config.centered;
      document.getElementById("closable").checked = config.closable;
      document.getElementById("showCloseButton").checked =
        config.showCloseButton;
      document.getElementById("showAddButton").checked = config.showAddButton;
      document.getElementById("addButtonPosition").value =
        config.addButtonPosition;
      document.getElementById("newTabClosable").checked = config.newTabClosable;
      document.getElementById("newTabShowClose").checked =
        config.newTabShowClose;
    </script>
  </body>
</html>
```

---

## API 文档

### 构造函数

```javascript
new NgTabs(container, options);
```

#### 参数:

- **container** (string | HTMLElement): 容器元素或选择器
- **options** (Object): 配置对象

### 配置选项

| 参数              | 类型     | 默认值                          | 说明                                      |
| ----------------- | -------- | ------------------------------- | ----------------------------------------- |
| items             | Array    | []                              | 标签项数组                                |
| defaultActiveKey  | string   | '0'                             | 默认激活的标签 key                        |
| tabPosition       | string   | 'top'                           | 标签位置：'top', 'bottom', 'start', 'end' |
| type              | string   | 'line'                          | 标签类型：'line', 'card'                  |
| size              | string   | 'middle'                        | 尺寸：'small', 'middle', 'large'          |
| centered          | boolean  | false                           | 是否居中显示标签                          |
| closable          | boolean  | false                           | 是否允许关闭标签（功能控制）              |
| showCloseButton   | boolean  | true                            | 是否显示关闭按钮（视觉控制）              |
| newTabClosable    | boolean  | true                            | 新增标签页是否可关闭（功能控制）          |
| newTabShowClose   | boolean  | true                            | 新增标签页是否显示关闭按钮（视觉控制）    |
| showAddButton     | boolean  | false                           | 是否显示添加按钮                          |
| addButtonPosition | string   | 'end'                           | 添加按钮位置：'start', 'end'              |
| indicator         | Object   | {size: 'auto', align: 'center'} | 指示条配置                                |
| onChange          | Function | null                            | 标签切换回调                              |
| onEdit            | Function | null                            | 标签编辑回调                              |
| destroyOnHide     | boolean  | false                           | 是否在隐藏时销毁内容                      |
| animated          | boolean  | true                            | 是否启用动画                              |
| extraContent      | string   | null                            | 额外内容 HTML                             |
| addIcon           | string   | '+'                             | 添加按钮图标                              |
| moreIcon          | string   | '⋯'                             | 更多按钮图标                              |
| style             | Object   | {}                              | 容器样式                                  |
| className         | string   | ''                              | 容器额外类名                              |

---

### 标签项格式

```javascript
{
  key: 'unique-key', // 唯一标识，必需
  label: '标签名称', // 标签显示文本
  content: '标签内容', // 标签内容，可以是 HTML 字符串、DOM 元素或函数
  disabled: false, // 是否禁用
  closable: true, // 是否可关闭（覆盖全局设置）
  isNewTab: false // 是否为新增标签页（用于特殊配置）
}
```

---

### 实例方法

| 方法                           | 参数                             | 返回值  | 说明                         |
| ------------------------------ | -------------------------------- | ------- | ---------------------------- |
| addItem(item, index)           | item: 标签项, index: 插入位置    | boolean | 添加标签项                   |
| removeItem(key)                | key: 标签 key                    | void    | 删除标签项                   |
| updateItem(key, newItem)       | key: 标签 key, newItem: 新标签项 | boolean | 更新标签项                   |
| setActiveTab(key)              | key: 标签 key                    | void    | 设置活动标签                 |
| setTabPosition(position)       | position: 位置                   | void    | 设置标签位置                 |
| setType(type)                  | type: 类型                       | void    | 设置标签类型                 |
| setSize(size)                  | size: 尺寸                       | void    | 设置标签尺寸                 |
| setCentered(centered)          | centered: boolean                | void    | 设置是否居中                 |
| setClosable(closable)          | closable: boolean                | void    | 设置是否可关闭               |
| setShowCloseButton(show)       | show: boolean                    | void    | 设置是否显示关闭按钮         |
| setNewTabClosable(closable)    | closable: boolean                | void    | 设置新增标签是否可关闭       |
| setNewTabShowClose(show)       | show: boolean                    | void    | 设置新增标签是否显示关闭按钮 |
| setShowAddButton(show)         | show: boolean                    | void    | 设置是否显示添加按钮         |
| setAddButtonPosition(position) | position: 位置                   | void    | 设置添加按钮位置             |
| setIndicator(indicator)        | indicator: 配置对象              | void    | 设置指示条配置               |
| setExtraContent(content)       | content: HTML 字符串             | void    | 设置额外内容                 |
| getActiveKey()                 | 无                               | string  | 获取当前活动标签 key         |
| getItems()                     | 无                               | Array   | 获取所有标签项               |
| getTabCount()                  | 无                               | number  | 获取标签数量                 |
| refresh()                      | 无                               | void    | 刷新组件                     |
| destroy()                      | 无                               | void    | 销毁组件                     |

---

### 事件回调

```javascript
// 标签切换回调
onChange: function(key) {
  console.log('切换到标签:', key);
}

// 标签编辑回调
onEdit: function(key, action) {
  console.log('编辑动作:', action, '标签:', key);
  // action: 'add' 或 'remove'

  if (action === 'add') {
    // 可以在这里实现自定义的添加逻辑
    const newKey = 'new-tab';
    tabs.addItem({
      key: newKey,
      label: '新标签',
      content: '新标签内容'
    });
    tabs.setActiveTab(newKey);
  }
}
```

---

## 特殊功能说明

### 1. 新增标签页的关闭按钮控制

NgTabs 提供了对新增标签页关闭按钮的精细控制：

```javascript
const tabs = new NgTabs("#container", {
  // 全局关闭按钮设置
  closable: true,
  showCloseButton: true,

  // 新增标签页的特殊设置
  newTabClosable: true, // 新增标签页是否可关闭（功能）
  newTabShowClose: true, // 新增标签页是否显示关闭按钮（视觉）

  onEdit: function (key, action) {
    if (action === "add") {
      // 添加新标签页，会自动应用 newTabClosable 和 newTabShowClose 配置
      const newKey = "tab-" + Date.now();
      tabs.addItem({
        key: newKey,
        label: "新标签",
        content: "内容",
        isNewTab: true, // 标记为新增标签页
      });
    }
  },
});
```

### 2. 标签关闭按钮的双重控制

组件提供了两层控制机制：

- **功能控制** (closable, newTabClosable): 控制标签是否可关闭
- **视觉控制** (showCloseButton, newTabShowClose): 控制是否显示关闭按钮图标

这种设计使得你可以：

- 允许关闭但不显示关闭按钮（通过其他方式触发关闭）
- 显示关闭按钮但禁用关闭功能（仅作为装饰）
- 对新标签和旧标签采用不同的策略

### 3. 响应式设计

组件自动适应不同屏幕尺寸：

- 在移动设备上，垂直布局会自动转换为水平布局
- 支持滚动按钮，当标签过多时自动显示
- 支持触摸滑动（通过滚动实现）

### 4. 自定义样式

可以通过多种方式自定义样式：

```javascript
// 方式 1: 通过配置对象
new NgTabs('#container', {
  style: {
    border: '1px solid #ddd',
    borderRadius: '8px'
  },
  className: 'my-custom-tabs'
});

// 方式 2: 通过 CSS 覆盖
.ng-tabs.my-custom-tabs .ng-tabs-tab {
  background-color: #f0f0f0;
}

// 方式 3: 修改内置样式
// 组件会自动注入样式，可以通过 CSS 选择器覆盖
```

---

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- IE 11（需要 polyfill）

---

## 注意事项

- **容器高度**: 建议为容器设置固定高度，否则内容区域可能无法正常显示
- **标签 Key**: 确保每个标签有唯一的 key，否则可能导致不可预期的行为
- **动态内容**: 如果标签内容包含动态脚本，建议在 `onChange` 回调中处理
- **销毁组件**: 在组件不再使用时调用 `destroy()` 方法，避免内存泄漏
