/**
 * 从title属性中提取数字编码（格式：[123456]）
 */
function extractNumberCodeFromTitle(title) {
  if (!title) return null;
  const match = title.match(/\[(\d+)\]/);
  return match ? match[1] : null;
}

/**
 * 从title属性中提取标识符编码（多种格式）
 * 支持格式：
 * 1. CS-GQ-00062 (字母-字母-数字)
 * 2. GQ-2508-0002 (字母-数字-数字)
 * 3. 其他类似格式：X-X-XXXXX (包含字母、数字和连字符)
 */
function extractIdentifierCodeFromTitle(title) {
  if (!title) return null;

  // 第一种模式：字母-字母-数字 (如 CS-GQ-00062)
  const pattern1 = /([A-Za-z]+)-([A-Za-z]+)-(\d+)/;

  // 第二种模式：字母-数字-数字 (如 GQ-2508-0002)
  const pattern2 = /([A-Za-z]+)-(\d+)-(\d+)/;

  // 第三种模式：更通用的模式，匹配包含字母、数字和连字符的编码
  const pattern3 = /([A-Za-z0-9]+(?:-[A-Za-z0-9]+){2,})/;

  // 优先匹配具体的格式
  let match = title.match(pattern1);
  if (match) {
    return match[0];
  }

  match = title.match(pattern2);
  if (match) {
    return match[0];
  }

  // 最后尝试通用模式
  match = title.match(pattern3);
  if (match) {
    // 检查是否至少包含2个连字符
    const parts = match[0].split("-");
    if (parts.length >= 3) {
      return match[0];
    }
  }

  return null;
}

/**
 * 为所有树节点添加点击事件
 */
function addTreeItemClickEvents() {
  const treeContainer = document.querySelector(".ant-tree-list-holder-inner");

  if (!treeContainer) {
    setTimeout(addTreeItemClickEvents, 1000);
    return;
  }

  const treeItems = treeContainer.querySelectorAll('div[role="treeitem"]');

  if (treeItems.length === 0) {
    setTimeout(addTreeItemClickEvents, 1000);
    return;
  }

  treeItems.forEach((treeItem, index) => {
    if (treeItem.hasAttribute("data-summary-event-added")) {
      return;
    }

    treeItem.setAttribute("data-summary-event-added", "true");
    const originalClickHandler = treeItem.onclick;

    treeItem.addEventListener("click", function (event) {
      console.log(`点击了树节点 ${index + 1}`);

      const spans = treeItem.querySelectorAll("span");
      let foundNumberCode = null;
      let foundIdentifierCode = null;

      for (let span of spans) {
        const title = span.getAttribute("title");
        if (title) {
          // 首先尝试提取数字编码
          if (!foundNumberCode) {
            const numberCode = extractNumberCodeFromTitle(title);
            if (numberCode) {
              foundNumberCode = numberCode;
              CCode = numberCode;
              console.log(
                `提取到数字编码: ${numberCode} (来自title: "${title}")`
              );

              // 设置地图查询条件（使用数字编码）
              try {
                window.mapManager.refreshData({
                  oCode: numberCode,
                  userId: window.$NG.getUser().userID,
                });
                console.log("已设置地图查询条件:", {
                  oCode: numberCode,
                  userId: window.$NG.getUser().userID,
                });
              } catch (error) {
                console.error("设置地图查询条件时出错:", error);
              }

              fetchAllDataAndUpdateSummary(numberCode);
            }
          }

          // 同时尝试提取标识符编码
          if (!foundIdentifierCode) {
            const identifierCode = extractIdentifierCodeFromTitle(title);
            if (identifierCode) {
              foundIdentifierCode = identifierCode;
              console.log(
                `提取到标识符编码: ${identifierCode} (来自title: "${title}")`
              );

              // 执行控制台输出标识符编码操作
              console.log("标识符编码:", identifierCode);

              // 新增：根据标识符编码定位到项目
              if (window.mapManager && window.mapManager.locateToProject) {
                console.log(`尝试定位到标识符编码: ${identifierCode}`);
                window.mapManager.locateToProject(identifierCode);
              } else {
                console.error("地图管理器未找到或没有locateToProject方法");
              }
            }
          }

          // 如果两种编码都找到了，可以跳出循环
          if (foundNumberCode && foundIdentifierCode) {
            break;
          }
        }
      }

      // 输出未找到编码的情况
      if (!foundNumberCode && !foundIdentifierCode) {
        console.log("未找到任何编码格式");
      } else if (!foundNumberCode) {
        console.log("未找到数字编码，但找到了标识符编码");
      } else if (!foundIdentifierCode) {
        console.log("未找到标识符编码，但找到了数字编码");
      }

      if (originalClickHandler) {
        try {
          originalClickHandler.call(this, event);
        } catch (e) {
          console.error("执行原有点击事件时出错:", e);
        }
      }
    });
  });
}

/**
 * 使用MutationObserver监听DOM变化
 */
function observeTreeChanges() {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        let hasTreeItems = false;
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            if (node.matches && node.matches('div[role="treeitem"]')) {
              hasTreeItems = true;
            }
            if (
              node.querySelector &&
              node.querySelector('div[role="treeitem"]')
            ) {
              hasTreeItems = true;
            }
          }
        });

        if (hasTreeItems) {
          setTimeout(addTreeItemClickEvents, 100);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// 初始化
setTimeout(() => {
  addTreeItemClickEvents();
  observeTreeChanges();
}, 500);
