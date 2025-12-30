/**
 * 通用列表转树形结构函数
 * @param {Array} list - 扁平化数据列表
 * @param {Object} options - 配置选项
 * @param {string} options.idKey - 节点ID键名，默认's_tree_id'
 * @param {string} options.parentKey - 父节点ID键名，默认's_tree_pid'
 * @param {string} options.childrenKey - 子节点键名，默认'children'
 * @param {Object} options.fieldMapping - 字段映射对象，可选
 * @returns {Array} 树形结构数据
 */
function ListToLayer(list, options = {}) {
  // 默认配置
  const defaultOptions = {
    idKey: "s_tree_id",
    parentKey: "s_tree_pid",
    childrenKey: "children",
    fieldMapping: null,
  };

  // 合并配置
  const config = { ...defaultOptions, ...options };
  const { idKey, parentKey, childrenKey, fieldMapping } = config;

  // 如果没有数据，返回空数组
  if (!list || !Array.isArray(list) || list.length === 0) {
    return [];
  }

  // 处理字段映射
  const mapFields = (node) => {
    if (!fieldMapping) return { ...node };

    const mappedNode = {};

    // 处理特殊字段（children字段在后续步骤添加）
    const specialKeys = [childrenKey];

    // 遍历原节点属性
    Object.keys(node).forEach((key) => {
      // 如果存在字段映射，则使用映射后的字段名
      if (fieldMapping[key] !== undefined) {
        mappedNode[fieldMapping[key]] = node[key];
      }
      // 特殊字段不在这里处理
      else if (!specialKeys.includes(key)) {
        mappedNode[key] = node[key];
      }
    });

    return mappedNode;
  };

  // 使用reduce构建节点映射
  const nodeMap = list.reduce((acc, node) => {
    const mappedNode = mapFields(node);
    const nodeId = node[idKey];

    // 确保节点有ID
    if (nodeId !== undefined && nodeId !== null) {
      acc[nodeId] = {
        ...mappedNode,
        [childrenKey]: [],
      };
    }
    return acc;
  }, {});

  // 存储根节点
  const roots = [];

  // 第二次遍历，构建父子关系
  list.forEach((node) => {
    const currentNode = nodeMap[node[idKey]];
    const parentId = node[parentKey];

    // 如果当前节点不存在（可能ID无效），跳过
    if (!currentNode) return;

    // 查找父节点
    if (parentId !== undefined && parentId !== null && nodeMap[parentId]) {
      // 将当前节点添加到父节点的children中
      nodeMap[parentId][childrenKey].push(currentNode);
    } else {
      // 没有父节点或父节点不存在，作为根节点
      roots.push(currentNode);
    }
  });

  return roots;
}
module.exports = ListToLayer;
