Usage examples

Below are concise, ready-to-run examples showing common usages: simple menu, styles, dynamic updates, and advanced scenarios.

```javascript
// Example 1 — simple menu
const example1 = new DropdownMenu('[originid="u_button"]', {
  menuItems: [
    { text: "选项 1", onClick: () => alert("选项 1") },
    { text: "选项 2", onClick: () => alert("选项 2") },
    { text: "选项 3", onClick: () => alert("选项 3") },
  ],
});

// Example 2 — three trigger styles
new DropdownMenu('[originid="u_button2"]', {
  triggerStyle: "text-only",
  menuItems: [{ text: "文字样式", onClick: () => console.log("文字样式") }],
});
new DropdownMenu('[originid="u_button3"]', {
  triggerStyle: "button-style",
  menuItems: [{ text: "按钮样式", onClick: () => console.log("按钮样式") }],
});
new DropdownMenu('[originid="u_button4"]', {
  triggerStyle: "split-button",
  menuItems: [{ text: "分割按钮", onClick: () => console.log("分割按钮") }],
  onMainButtonClick: () => alert("主按钮被点击！"),
});

// Example 3 — grouped menu with icons and dividers
const menuItems = [
  {
    text: "文件",
    icon: "file",
    children: [
      {
        text: "新建文件",
        icon: "plus",
        onClick: () => console.log("新建文件"),
      },
      {
        text: "打开文件",
        icon: "folder",
        onClick: () => console.log("打开文件"),
      },
      {
        text: "保存文件",
        icon: "download",
        onClick: () => console.log("保存文件"),
      },
      { type: "divider" },
      { text: "退出", onClick: () => console.log("退出") },
    ],
  },
  {
    text: "编辑",
    icon: "edit",
    group: "操作",
    children: [
      { text: "复制", icon: "copy", onClick: () => console.log("复制") },
      { text: "粘贴", onClick: () => console.log("粘贴") },
      { text: "剪切", onClick: () => console.log("剪切") },
    ],
  },
  { type: "divider" },
  { text: "帮助", icon: "help", onClick: () => console.log("帮助") },
];

new DropdownMenu('[originid="u_button"]', {
  triggerStyle: "button-style",
  showIcons: true,
  showGroups: true,
  menuItems,
});

// Example 4 — dynamic update
const example6 = new DropdownMenu('[originid="u_button2"]', {
  triggerStyle: "button-style",
  menuItems: [{ text: "初始菜单项", onClick: () => alert("初始") }],
});
setTimeout(
  () =>
    example6.updateOptions({
      triggerStyle: "split-button",
      showIcons: false,
      menuItems: [
        { text: "更新后的菜单1", onClick: () => alert("更新1") },
        { text: "更新后的菜单2", onClick: () => alert("更新2") },
      ],
    }),
  3000
);

// Example 5 — setMenuItems / dynamic content
const example7 = new DropdownMenu('[originid="u_button3"]', {
  triggerStyle: "button-style",
  menuItems: [],
});
example7.setMenuItems([
  { text: "动态项1", onClick: () => console.log("动态1") },
  { text: "动态项2", onClick: () => console.log("动态2") },
]);

// Example 6 — event listening
const example8 = new DropdownMenu('[originid="u_button4"]', {
  triggerStyle: "button-style",
  menuItems: [
    { text: "触发事件1", id: "item1", onClick: () => console.log("内部回调") },
  ],
});
document
  .querySelector('[originid="u_button4"]')
  .addEventListener("dropdown-item-click", (e) =>
    console.log("外部监听：", e.detail)
  );

// Example 7 — advanced: manager + API-loaded menus
const example11 = new DropdownMenu("example11", {
  triggerStyle: "split-button",
  showIcons: true,
  menuItems: [],
});
function loadMenuFromAPI() {
  const apiData = [
    { id: 1, name: "用户管理", icon: "user" },
    { id: 2, name: "系统设置", icon: "settings" },
  ];
  example11.setMenuItems(
    apiData.map((i) => ({
      text: i.name,
      icon: i.icon,
      id: String(i.id),
      onClick: () => console.log("选中", i),
    }))
  );
}
loadMenuFromAPI();

// Example 8 — DOM element as container
const customContainer = document.createElement("div");
customContainer.id = "custom-container";
document.body.appendChild(customContainer);
new DropdownMenu(customContainer, {
  triggerStyle: "button-style",
  menuItems: [{ text: "DOM容器示例", onClick: () => console.log("DOM容器") }],
});
```

Integration

Include the script or import as module:

```html
<script src="dropdown-menu.js"></script>
<!-- or as module -->
<script type="module">
  import DropdownMenu from "./dropdown-menu.js";
</script>
```

Dependencies

- Font Awesome: optional for icon classes. Example:

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
/>
```

API / Options (common)

- `triggerStyle`: `text-only` | `button-style` | `split-button`
- `triggerText` / `mainButtonText`: custom trigger text
- `menuItems`: array of item objects (`text`, `icon`, `onClick`, `children`, `group`, `disabled`, `type:'divider'`)
- `showIcons`, `showGroups`, `position`, `zIndex`, `animation`, `closeOnClickOutside`, `closeOnItemClick`
- Methods: `updateOptions()`, `updateMenuItems()`, `setMenuItems()`, `show()`, `hide()`, `destroy()`

Events

- `dropdown-open`, `dropdown-close`, `dropdown-item-click`, `dropdown-main-button-click`

Notes

- Optionally call `DropdownMenu.registerStyles()` to inject default styles.
- Ensure container is available in DOM before initializing.
- Call `destroy()` to remove event listeners and DOM nodes when finished.

This file focuses on examples and practical integration; see source files for implementation details.

// 示例 1：最简单的调用
const example1 = new DropdownMenu('[originid="u_button"]', {
menuItems: [
{ text: '选项 1', onClick: () => alert('选项 1') },
{ text: '选项 2', onClick: () => alert('选项 2') },
{ text: '选项 3', onClick: () => alert('选项 3') }
]
});

    // 示例2：三种按钮样式
    const example2 = new DropdownMenu('[originid="u_button2"]', {
        triggerStyle: 'text-only',
        menuItems: [
            { text: '文字样式', onClick: () => console.log('文字样式') }
        ]
    });

    const example3 = new DropdownMenu('[originid="u_button3"]', {
        triggerStyle: 'button-style',
        menuItems: [
            { text: '按钮样式', onClick: () => console.log('按钮样式') }
        ]
    });

    const example4 = new DropdownMenu('[originid="u_button4"]', {
        triggerStyle: 'split-button',
        menuItems: [
            { text: '分割按钮', onClick: () => console.log('分割按钮') }
        ],
        onMainButtonClick: () => {
            alert('主按钮被点击！');
        }
    });

    // 示例5：带图标和分组的完整菜单
    const menuItems = [
        {
            text: '文件',
            icon: 'file',
            children: [
                { text: '新建文件', icon: 'plus', onClick: () => console.log('新建文件') },
                { text: '打开文件', icon: 'folder', onClick: () => console.log('打开文件') },
                { text: '保存文件', icon: 'download', onClick: () => console.log('保存文件') },
                { type: 'divider' },
                { text: '退出', onClick: () => console.log('退出') }
            ]
        },
        {
            text: '编辑',
            icon: 'edit',
            group: '操作',
            children: [
                { text: '复制', icon: 'copy', onClick: () => console.log('复制') },
                { text: '粘贴', onClick: () => console.log('粘贴') },
                { text: '剪切', onClick: () => console.log('剪切') }
            ]
        },
        { type: 'divider' },
        {
            text: '工具',
            icon: 'settings',
            children: [
                { text: '选项', onClick: () => console.log('选项') },
                { text: '设置', onClick: () => console.log('设置') },
                {
                    text: '高级',
                    children: [
                        { text: '网络设置', onClick: () => console.log('网络设置') },
                        { text: '安全设置', onClick: () => console.log('安全设置') },
                        {
                            text: '更多设置',
                            children: [
                                { text: '子设置1', onClick: () => console.log('子设置1') },
                                { text: '子设置2', onClick: () => console.log('子设置2') }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            text: '帮助',
            icon: 'help',
            disabled: false,
            onClick: () => console.log('帮助')
        }
    ];

    const example5 = new DropdownMenu('[originid="u_button"]', {
        triggerStyle: 'button-style',
        showIcons: true,
        showGroups: true,
        menuItems: menuItems
    });

    // 示例6：动态更新配置
    const example6 = new DropdownMenu('[originid="u_button2"]', {
        triggerStyle: 'button-style',
        menuItems: [
            { text: '初始菜单项', onClick: () => alert('初始') }
        ]
    });

    // 3秒后更新菜单
    setTimeout(() => {
        example6.updateOptions({
            triggerStyle: 'split-button',
            showIcons: false,
            menuItems: [
                { text: '更新后的菜单1', onClick: () => alert('更新1') },
                { text: '更新后的菜单2', onClick: () => alert('更新2') }
            ]
        });
    }, 3000);

    // 示例7：设置菜单项（动态内容）
    const example7 = new DropdownMenu('[originid="u_button3"]', {
        triggerStyle: 'button-style',
        menuItems: [] // 初始为空
    });

    // 动态设置菜单项
    const dynamicMenuItems = [
        { text: '动态项1', onClick: () => console.log('动态1') },
        { text: '动态项2', onClick: () => console.log('动态2') },
        { text: '动态项3', onClick: () => console.log('动态3') }
    ];

    example7.setMenuItems(dynamicMenuItems);

    // 示例8：事件监听
    const example8 = new DropdownMenu('[originid="u_button4"]', {
        triggerStyle: 'button-style',
        menuItems: [
            { text: '触发事件1', id: 'item1', onClick: () => console.log('内部回调') },
            { text: '触发事件2', id: 'item2', onClick: () => console.log('内部回调') }
        ]
    });


    // 示例9：自定义位置和z-index
    const example9 = new DropdownMenu('example9', {
        triggerStyle: 'button-style',
        position: 'bottom-right',
        zIndex: 9999,
        menuItems: [
            { text: '高z-index菜单', onClick: () => console.log('高z-index') },
            { text: '不会被遮挡', onClick: () => console.log('不会被遮挡') }
        ]
    });

    // 示例10：禁用动画和点击外部关闭
    const example10 = new DropdownMenu('example10', {
        triggerStyle: 'button-style',
        animation: false,
        closeOnClickOutside: false,
        closeOnItemClick: false,
        menuItems: [
            { text: '点击不关闭', onClick: () => console.log('点击但不关闭') },
            { text: '手动关闭', onClick: () => example10.closeMenu() }
        ]
    });

    // 示例11：复杂场景 - 动态生成菜单
    const example11 = new DropdownMenu('example11', {
        triggerStyle: 'split-button',
        showIcons: true,
        menuItems: []
    });

    // 模拟API数据加载
    function loadMenuFromAPI() {
        // 模拟API响应
        const apiData = [
            { id: 1, name: '用户管理', icon: 'user', type: 'user' },
            { id: 2, name: '系统设置', icon: 'settings', type: 'system' },
            { id: 3, name: '日志查看', icon: 'file', type: 'log' },
            { id: 4, name: '数据备份', icon: 'copy', type: 'backup' }
        ];

        // 转换为菜单项
        const menuItems = apiData.map(item => ({
            text: item.name,
            icon: item.icon,
            id: item.id.toString(),
            onClick: () => handleMenuItemClick(item)
        }));

        // 更新菜单
        example11.setMenuItems(menuItems);
    }

    function handleMenuItemClick(item) {
        console.log('选择的菜单项:', item);
        alert(`选择了: ${item.name} (类型: ${item.type})`);
    }

    // 加载菜单
    loadMenuFromAPI();

    // 示例12：使用DOM元素作为容器
    const customContainer = document.createElement('div');
    customContainer.id = 'custom-container';
    customContainer.style.margin = '20px 0';
    customContainer.style.padding = '10px';
    customContainer.style.border = '2px dashed #ccc';
    document.body.appendChild(customContainer);

    const example12 = new DropdownMenu(customContainer, {
        triggerStyle: 'button-style',
        menuItems: [
            { text: 'DOM容器示例', onClick: () => console.log('DOM容器') }
        ]
    });
