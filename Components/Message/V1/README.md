# Message 组件（V1）

简要说明：本组件用于在页面上展示短时提示消息，支持多种消息类型、显示位置、可选关闭按钮以及可配置的消失方向与时长。

## 功能概览

- 支持消息类型：普通、重要、成功、失败、警告。
- 支持显示位置：居中上方、居中下方、左侧、右侧（左右带关闭按钮）。
- 支持快捷方法与通用配置接口。

## 消息类型（type）

- `info` / `normal`：普通提示。
- `important`：重要提示（通常视觉上更突出）。
- `success`：成功提示（例如操作成功）。
- `error`：失败/错误提示（例如异常或错误返回）。
- `warning`：警告提示（例如需注意的情况）。

## 显示位置（position）

- `center-top`：页面上方居中，消息向上消失。
- `center-bottom`：页面下方居中，消息向下消失。
- `left`：页面左侧（通常带关闭按钮），消息向左消失。
- `right`：页面右侧（通常带关闭按钮），消息向右消失。

## 配置项（show / showOne 等接口支持）

- `content` (string) — 必填，消息文本内容。
- `type` (string) — 可选，参见“消息类型”（默认：`info`）。
- `duration` (number) — 可选，显示时长（秒），为 `0` 或 `null` 表示不自动关闭（需要手动关闭）。
- `position` (string) — 可选，参见“显示位置”（默认：`center-top`）。
- `hideDirection` (string) — 可选，控制消失动画方向（如 `up` / `down` / `left` / `right`），组件会根据 position 选择合理的默认方向。
- `showClose` (boolean) — 可选，是否显示关闭按钮（默认：`false`，左/右侧通常为 `true`）。

## 快捷使用

```javascript
// 最常用的快捷方法
Message.info("普通消息");
Message.success("成功消息");
Message.error("错误消息");
Message.warning("警告消息");
Message.important("重要消息");
```

## 完整配置示例

```javascript
Message.show({
  content: "操作成功",
  type: "success",
  duration: 5, // 5 秒后自动隐藏
  position: "center-top",
  hideDirection: "up", // 可省略，组件会根据 position 选择默认方向
  showClose: false,
});
```

## 使用提示与最佳实践

- 如果需要长期驻留的消息，请将 `duration` 设为 `0` 并显示关闭按钮 `showClose: true`。
- 左/右侧消息适合用于带交互的系统通知（例如带“撤回/重试”操作），因此建议启用关闭按钮。
- 若要统一样式或国际化消息文本，可在调用前对 `content` 做统一处理。

## 可定制项（扩展建议）

- 支持自定义图标、颜色或动画；可在组件内部根据 `type` 注入不同的样式类。
- 若需在无 CDN/前端框架环境下使用，建议提供一个轻量 CSS 文件并在全局引入。

---

如果你希望我把文档补充为英文版、增加图示，或把组件 API（事件回调、返回值）展开为更详细的参考，我可以继续完善。
