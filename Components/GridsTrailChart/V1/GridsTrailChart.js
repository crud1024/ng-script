// 方法1: 使用便捷函数
const appender = safeInitTableCellSuffix({
  tableId: "p_form_expert_fee_apply_d1",
  fieldSuffixMap: {
    u_unit_price: {
      suffix: "元",
      style: { color: "#1890ff" },
    },
  },
});

// 方法2: 直接使用类
const appender2 = new TableCellSuffixAppender({
  tableId: "p_form_expert_fee_apply_d1",
  fieldSuffixMap: {
    u_unit_price: {
      suffix: "元",
      style: { color: "#1890ff" },
    },
  },
});
appender2.init();

// 测试组件是否正常工作
if (window.testTableCellSuffix) {
  window.testTableCellSuffix();
}
