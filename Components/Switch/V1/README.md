# AntSwitch 组件 — 使用说明

简要：这是一个轻量的开关组件示例，提供创建、状态控制、样式定制等常用 API。

**快速示例**

```javascript
// 创建并挂载到指定目标（选择器或 DOM 元素）
const sw = new AntSwitch({
  target: 'div[data-cid="u:ab75edc08724_u_is"]',
  checked: true,
  onChange: (checked) => console.log("开关状态:", checked),
});

// 切换状态（无参为取反），或传布尔强制设置
sw.toggle(); // 切换
sw.toggle(true); // 设为开启

// 设置/取消禁用
sw.setDisabled(true);
sw.setDisabled(false);

// 修改大小：'small' 或 'default'
sw.setSize("small");

// 修改样式：颜色/文字
sw.setStyle({
  checkedColor: "#52c41a",
  uncheckedColor: "#ff4d4f",
  checkedText: "ON",
  uncheckedText: "OFF",
});

// 查询
const isChecked = sw.getChecked();
const el = sw.getElement();

// 销毁组件，移除事件和 DOM
// sw.destroy();
```

**配置项（options）**

- `target` (string | Element): 必需，目标选择器或 DOM 元素。
- `checked` (boolean): 初始状态，默认 `false`。
- `disabled` (boolean): 是否禁用，默认 `false`。
- `size` (string): `'small'` 或 `'default'`，默认 `'default'`。
- `style` (object): 自定义样式，如 `checkedColor`、`uncheckedColor`、`checkedText`、`uncheckedText`。
- `onChange` (function): 状态变化回调，参数为当前 `checked` 布尔值。

**常用方法**

- `toggle([boolean])`：切换或设置状态（返回当前状态）。
- `setDisabled(boolean)`：设置禁用状态。
- `setSize('small' | 'default')`：设置尺寸。
- `setStyle(object)`：合并并应用样式配置。
- `getChecked()`：返回当前是否选中（布尔）。
- `getElement()`：返回组件根 DOM 元素。
- `destroy()`：销毁组件，移除事件并清理 DOM（若组件实现提供）。

**示例场景**

- 与表单联动：在 `onChange` 中调用应用状态更新函数（例如 `$NG.updateState`）。
- 动态主题：基于 `setStyle` 在不同主题下改变颜色或文字。

---

源代码（原始示例，保留供参考）:

```javascript
// ============================
// 使用示例
// ============================

// 创建一个默认的Switch
const switch1 = new AntSwitch({
  target: 'div[data-cid="u:ab75edc08724_u_is"]', // 目标元素选择器
  checked: true, // 初始状态为开启
  onChange: (checked) => {
    console.log("开关状态:", checked);
    if (checked) {
      //更新表头单据状态信息
      $NG.updateState((updater) => {
        updater.data.p_form_demo_one_m.setProps({
          u_test: 1,
        });
      });
    } else {
      //更新表头单据状态信息
      $NG.updateState((updater) => {
        updater.data.p_form_demo_one_m.setProps({
          u_test: 0,
        });
      });
    }
  },
});

// 切换状态（如果当前是开，切换为关；如果当前是关，切换为开）
const currentState = switch1.toggle();
// 检查开关状态
console.log(currentState);
// 直接设置状态
// switch1.toggle(true);  // 设置为开启
// switch1.toggle(false); // 设置为关闭
// 禁用开关
switch1.setDisabled(true);

// 启用开关
switch1.setDisabled(false);

// 检查是否禁用
console.log(switch1.disabled);

// 设置为小型
// switch1.setSize('small');

// 设置为默认大小
// switch1.setSize('default');

// 修改颜色
switch1.setStyle({
  checkedColor: "#52c41a", // 绿色
  uncheckedColor: "#ff4d4f", // 红色
});

// 添加/修改文字
switch1.setStyle({
  checkedText: "ON",
  uncheckedText: "OFF",
});

// 移除文字
switch1.setStyle({
  checkedText: "",
  uncheckedText: "",
});

// 获取当前状态
const isChecked = switch1.getChecked();

// 获取DOM元素
const switchElement = switch1.getElement();

// 检查是否禁用
const isDisabled = switch1.disabled;
console.log("isChecked", isChecked);
console.log("isDisabled", isDisabled);

// 从DOM中移除组件
// switch1.destroy();

// const switch2 = new AntSwitch({
//     // 必需：目标元素（选择器字符串或DOM元素）
//     target: '#root',

//     // 可选：初始状态，默认false
//     checked: true,

//     // 可选：是否禁用，默认false
//     disabled: false,

//     // 可选：大小，'small' 或 'default'
//     size: 'default',

//     // 可选：样式配置
//     style: {
//         checkedColor: '#1890ff',      // 选中时颜色
//         uncheckedColor: '#bfbfbf',    // 未选中时颜色
//         checkedText: '开',            // 选中时显示的文字
//         uncheckedText: '关'           // 未选中时显示的文字
//     },

//     // 可选：状态变化回调函数
//     onChange: function (checked) {
//         console.log('开关状态变为:', checked ? '开启' : '关闭');
//     }
// });
```

---

如需我将 `README.md` 再精简成英文版或增加 API 表格，告诉我即可。
