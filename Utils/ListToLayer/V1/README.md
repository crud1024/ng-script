# ListToLayer (V1) 使用说明

简洁版：将扁平列表（包含父子关系字段）转换为树形结构，支持字段映射与自定义子节点键。

## 主要功能

- 将带有父 ID 的数组转成嵌套树结构。
- 支持自定义 `id`、`parentId`、`children` 字段名。
- 支持字段映射（将原字段重命名到输出节点上）。

## 引入

直接在浏览器或 Node 环境引入本模块（根据项目现有引入方式）：

```js
// 假设导出函数名为 new_listToTree
import { new_listToTree } from "./ListToLayer/V1/ListToLayer.js";
// 或者在浏览器全局脚本中直接使用已导出的函数
```

## 函数签名（示例）

```js
// new_listToTree(list, options)
// - list: Array<Object> 要转换的扁平数组
// - options: Object 可选配置
//   - idKey: string 默认 's_tree_id'（示例，可根据实现调整）
//   - parentKey: string 默认 's_tree_pid'
//   - childrenKey: string 默认 'children'
//   - fieldMapping: Object 可选，{ srcField: targetField }
```

## 参数说明

- `list`：待转换的对象数组，每项至少包含 id 和 parentId 字段。
- `options.idKey`：标识节点唯一 id 的字段名。
- `options.parentKey`：标识父节点 id 的字段名（根节点的 parentId 通常为 `null` 或 `undefined` 或 `0`，视实现而定）。
- `options.childrenKey`：输出树中子节点数组的字段名，默认 `children`。
- `options.fieldMapping`：一个对象，用于将输入对象的字段重命名到输出节点上，例如 `{ name: 'label' }` 会把每项的 `name` 字段映射为 `label`。

## 返回值

返回一个数组，包含所有顶层节点（根节点），每个节点根据 `childrenKey` 递归包含子节点。

## 示例

示例数据：

```js
const data = [
  { id: 1, parentId: null, name: "Node 1", extra: "value1" },
  { id: 2, parentId: 1, name: "Node 2", extra: "value2" },
  { id: 3, parentId: 1, name: "Node 3", extra: "value3" },
  { id: 4, parentId: 2, name: "Node 4", extra: "value4" },
];

// 示例 1：基本用法
const tree1 = new_listToTree(data, {
  idKey: "id",
  parentKey: "parentId",
  childrenKey: "children",
});

// 示例 2：使用字段映射并自定义 children 键
const tree2 = new_listToTree(data, {
  idKey: "id",
  parentKey: "parentId",
  childrenKey: "subItems",
  fieldMapping: {
    name: "label",
    extra: "data",
  },
});

// 示例 3：使用默认配置（兼容不同字段名的示例）
const data2 = [
  { s_tree_id: 1, s_tree_pid: null, title: "Root" },
  { s_tree_id: 2, s_tree_pid: 1, title: "Child" },
];
const tree3 = new_listToTree(data2);

console.log(tree1, tree2, tree3);
```

## 注意事项

- 如果输入数组中存在孤立节点（父节点不存在），这些节点会被当作根节点或根据实现放入结果集中，请根据业务需要预处理数据。
- 父 ID 的空值判定（`null` / `undefined` / `0` / `''`）取决于实现，使用前请确认当前实现的判定规则。
- 当数据量较大时，建议使用映射（hash）方式构建父子关系以保证性能。

## 反馈

如需添加 TypeScript 类型说明、更多示例或处理边界数据的选项，请告诉我，我可以继续补充或生成测试用例。
