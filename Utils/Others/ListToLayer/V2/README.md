# ListToLayer (V2) 使用说明

简洁版：将扁平列表（包含父子关系字段）转换为树形结构，支持字段映射与自定义子节点键。提供 **Class** 和 **函数** 两种调用方式。

## 主要功能

- 将带有父 ID 的数组转成嵌套树结构。
- 支持自定义 `id`、`parentId`、`children` 字段名。
- 支持字段映射（将原字段重命名到输出节点上）。
- **新增**：同时支持 Class 实例化调用和函数直接调用两种方式。

## 引入

### 方式一：浏览器全局使用（推荐）

```js
// 通过动态脚本加载
const script = document.createElement("script");
script.src = "你的 CDN 路径/Utils/Others/ListToLayer/V2/ListToLayer.js";
document.head.appendChild(script);

// 加载完成后使用（两种方式任选其一）
script.onload = () => {
  // 方式 A: 使用 Class（推荐）
  const converter = new ListToLayer({
    idKey: "s_tree_id",
    parentKey: "s_tree_pid",
    childrenKey: "children",
  });
  const treeData = converter.convert(flatList);

  // 方式 B: 使用工厂函数（兼容 V1）
  const treeData2 = window.new_listToTree(flatList, {
    idKey: "s_tree_id",
    parentKey: "s_tree_pid",
  });
};
```

### 方式二：在已加载脚本后直接使用

```js
// 如果脚本已经加载到 window，可以直接使用

// Class 方式
const converter = new ListToLayer({
  idKey: "id",
  parentKey: "parentId",
  childrenKey: "children",
  fieldMapping: {
    name: "label",
    value: "data",
  },
});
const tree = converter.convert(data);

// 函数方式（兼容 V1）
const tree = new_listToTree(data, {
  idKey: "id",
  parentKey: "parentId",
  childrenKey: "children",
  fieldMapping: {
    name: "label",
    value: "data",
  },
});
```

## 参数说明

### Class 构造函数参数

```js
new ListToLayer(options);
```

- `options` {Object} 配置对象
  - `idKey` {string} 标识节点唯一 id 的字段名，默认 `'s_tree_id'`
  - `parentKey` {string} 标识父节点 id 的字段名，默认 `'s_tree_pid'`
  - `childrenKey` {string} 输出树中子节点数组的字段名，默认 `'children'`
  - `fieldMapping` {Object} 可选，字段映射对象 `{ srcField: targetField }`

### convert 方法参数

```js
converter.convert(list);
```

- `list` {Array<Object>} 待转换的对象数组，每项至少包含 id 和 parentId 字段

### 工厂函数参数

```js
new_listToTree(list, options);
```

- `list` {Array<Object>} 待转换的对象数组
- `options` {Object} 配置对象（同上）

## 返回值

返回一个数组，包含所有顶层节点（根节点），每个节点根据 `childrenKey` 递归包含子节点。

## 示例

### 示例 1：基本用法（Class 方式）

```js
const data = [
  { s_tree_id: 1, s_tree_pid: null, name: "Node 1", extra: "value1" },
  { s_tree_id: 2, s_tree_pid: 1, name: "Node 2", extra: "value2" },
  { s_tree_id: 3, s_tree_pid: 1, name: "Node 3", extra: "value3" },
  { s_tree_id: 4, s_tree_pid: 2, name: "Node 4", extra: "value4" },
];

const converter = new ListToLayer({
  idKey: "s_tree_id",
  parentKey: "s_tree_pid",
  childrenKey: "children",
});

const tree = converter.convert(data);
console.log(tree);
/*
[
  {
    s_tree_id: 1,
    s_tree_pid: null,
    name: "Node 1",
    extra: "value1",
    children: [
      {
        s_tree_id: 2,
        s_tree_pid: 1,
        name: "Node 2",
        extra: "value2",
        children: [
          {
            s_tree_id: 4,
            s_tree_pid: 2,
            name: "Node 4",
            extra: "value4",
            children: []
          }
        ]
      },
      {
        s_tree_id: 3,
        s_tree_pid: 1,
        name: "Node 3",
        extra: "value3",
        children: []
      }
    ]
  }
]
*/
```

### 示例 2：使用字段映射（函数方式）

```js
const data = [
  { id: 1, pid: null, name: "Root", value: 100 },
  { id: 2, pid: 1, name: "Child 1", value: 200 },
  { id: 3, pid: 1, name: "Child 2", value: 300 },
];

// 使用工厂函数（兼容 V1 的调用方式）
const tree = new_listToTree(data, {
  idKey: "id",
  parentKey: "pid",
  childrenKey: "subItems",
  fieldMapping: {
    name: "label",
    value: "data",
  },
});

console.log(tree);
/*
[
  {
    label: "Root",
    data: 100,
    subItems: [
      {
        label: "Child 1",
        data: 200,
        subItems: []
      },
      {
        label: "Child 2",
        data: 300,
        subItems: []
      }
    ]
  }
]
*/
```

### 示例 3：在异步加载场景中使用

```js
// 场景：在 umi 或其他框架中动态加载
function loadAndUseListToLayer() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/Others/ListToLayer/V2/ListToLayer.js";

    script.onload = () => {
      try {
        // 现在可以安全地使用 ListToLayer
        const converter = new ListToLayer({
          idKey: "id",
          parentKey: "parentId",
        });

        const data = [
          { id: 1, parentId: null, name: "Root" },
          { id: 2, parentId: 1, name: "Child" },
        ];

        const tree = converter.convert(data);
        resolve(tree);
      } catch (error) {
        reject(error);
      }
    };

    script.onerror = (error) => {
      reject(new Error("Failed to load ListToLayer script"));
    };

    document.head.appendChild(script);
  });
}

// 使用
loadAndUseListToLayer()
  .then((tree) => console.log("Tree:", tree))
  .catch((err) => console.error("Error:", err));
```

### 示例 4：复用 Class 实例

```js
// Class 方式的优势：可以复用实例
const converter = new ListToLayer({
  idKey: "id",
  parentKey: "parentId",
  childrenKey: "children",
  fieldMapping: {
    name: "title",
  },
});

// 多次转换不同的数据
const tree1 = converter.convert(data1);
const tree2 = converter.convert(data2);
const tree3 = converter.convert(data3);
```

## 注意事项

- **加载时机**：确保在脚本完全加载到 window 对象后再使用，特别是在动态加载场景中
- **孤立节点**：如果输入数组中存在孤立节点（父节点不存在），这些节点会被当作根节点处理
- **父 ID 空值判定**：根节点的 `parentId` 应为 `null` 或 `undefined` 或 `0`
- **性能优化**：当需要多次转换时，建议使用 Class 方式并复用实例，避免重复创建
- **兼容性**：V2 版本向下兼容 V1 的函数调用方式，推荐使用 `new_listToTree` 函数

## 与 V1 的区别

| 特性     | V1                              | V2                                                                          |
| -------- | ------------------------------- | --------------------------------------------------------------------------- |
| 实现方式 | 函数                            | ES6 Class + 工厂函数                                                        |
| 调用方式 | `new_listToTree(list, options)` | `new ListToLayer(options).convert(list)` 或 `new_listToTree(list, options)` |
| 实例复用 | ❌                              | ✅ 可复用 Class 实例                                                        |
| 兼容性   | -                               | ✅ 完全兼容 V1                                                              |

## 反馈

如需添加 TypeScript 类型说明、更多示例或处理边界数据的选项，请告诉我，我可以继续补充或生成测试用例。
