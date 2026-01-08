# DownloadAttachs (V1)

本目录下的 `DownloadAttachs.js` 提供一组用于从表单/单据获取附件信息、按分组下载附件并打包成 ZIP 的工具函数，以及一个可视化的文件树编辑器，用于在下载前自定义文件夹结构。

**主要功能概览**

- **获取附件标识**：从主表和明细表中提取附件 GUID/标识（`getFormAttachmentInfo`）。
- **按文件下载为 Blob**：向文件服务请求下载 URL 并用 `fetch` 获取文件 Blob（`downloadFileAsBlob`）。
- **批量下载并打包 ZIP**：按分组并行下载文件、使用 `JSZip` 生成 ZIP 并触发浏览器下载（`downloadAllAttachmentsAsZip`）。
- **可视化文件树编辑器**：构建树形目录，支持添加/删除/拖拽/重命名、按文件/备注搜索，编辑后使用自定义结构打包下载（`initAttachmentDownloader` / `downloadWithEditedStructure`）。
- **便捷按钮**：提供 `createDownloadButton` 快速生成下载按钮并绑定下载逻辑。

**源码位置**

- 组件实现： [Components/DownloadAttachs/V1/DownloadAttachs.js](Components/DownloadAttachs/V1/DownloadAttachs.js)

**重要依赖 & 运行环境**

- 依赖全局对象 `$NG`（用于请求、执行后端 RPC、UI 提示等）。
- 使用 `JSZip`（从 CDN 动态加载：https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js）。
- 需要后端接口：
  - `/sup/customServer/getInfo`（获取表单明细数据）
  - `/JFileSrv/reactAttach/tableAttachInit`（获取附件记录列表）
  - `/JFileSrv/api/getDownloadUrlByAsrFids`（根据 asrFid 获取真实下载 URL）
  - 预览接口：`/JFileSrv/preview/fileSource`（可选）

**主要 API（简要）**

- `getFormAttachmentInfo(params)`

  - params: `{ phidValue, busType, tableName, mainTableNames, detailTablePrefixes }`
  - 返回：Promise，resolve 为从主表/明细解析出的附件标识对象（如 `mGuid`, `dGuids` 或更复杂的 `mGuids` / `detailGuids` 结构）。

- `downloadFileAsBlob({ downloadUrl, dbToken, requestData, fileName })`

  - 向 `downloadUrl` POST 请求获取实际文件 URL，再用 `fetch` 下载为 Blob。
  - 返回：Promise，resolve 为 `{ blob, fileName }`。

- `downloadAllAttachmentsAsZip(attachmentData, options)`

  - `attachmentData` 可为后端响应对象、包含 `attachmentRecordList` 的对象，或附件记录数组。
  - `options` 支持：`downloadUrl`, `dbToken`, `parentFolderName`, `wmDisabled`, `billWM`, `orgId`。
  - 行为：并行请求每个附件的下载 URL，获取 Blob，按 `typeName` 分组写入 `JSZip`，生成 ZIP 并触发下载。
  - 返回：Promise，resolve 为包含统计信息的对象：`{ success, total, successful, failed, zipFileName, results }`。

- `createDownloadButton(attachmentData, buttonOptions)`

  - 在页面创建一个按钮，点击后调用 `downloadAllAttachmentsAsZip`。支持自定义文本、样式、容器等。

- `initAttachmentDownloader(config)`
  - 返回一个管理器对象：`{ init, showModal, hasAttachments, getConfig, reinitialize }`。
  - `init` 是 Promise（内部会执行 `getFormAttachmentInfo`、并发拉取主/分组/明细附件数据、构建树结构并加载 `JSZip`）。
  - `showModal()` 显示可编辑的文件树，用户编辑后可确认并使用 `downloadWithEditedStructure` 下载。

辅助函数（常用）: `decodeFileName`, `loadJSZip`, `getFileDownloadUrl`, `downloadFileContent`, `createFileMap`, `findFileData`。

示例

- 直接获取附件标识并下载：

```js
const params = {
  phidValue: "123456",
  busType: "fixedassest_store",
  tableName: "p_form_fixedassest_store",
  mainTableNames: ["p_form_fixedassest_store"],
  detailTablePrefixes: ["p_form__test_d"],
};

const fromObj = await getFormAttachmentInfo(params);
// fromObj 可作为后续 downloadAllAttachmentsAsZip 的输入或用来拉取具体附件记录
```

- 使用便捷按钮：

```js
// 假设 attachmentData 是服务端返回的附件记录对象
createDownloadButton(attachmentData, {
  text: "下载所有附件",
  parentFolderName: "单据附件包",
});
```

- 初始化并打开编辑器（推荐在表单页使用）:

```js
const mgr = initAttachmentDownloader({
  tableName: "myTableCmpId",
  busType: "EFORM9000000080",
  FormName: "我的单据",
  sFormGroupKeys: ["u_file"],
  sFormName: ["表头"],
  dFormFormKeys: ["p_form__test_d"],
  dFormName: ["明细"],
});

await mgr.init; // 等待初始化完成
mgr.showModal(); // 显示可编辑树，用户确认后会打包下载
```

注意事项 & 调试

- 组件依赖运行环境提供 `$NG`（常用于该项目内的通用请求/提示/组件 API），请确保 `$NG.request`, `$NG.execServer`, `$NG.getCmpApi`, `$NG.CryptoJS` 可用。
- `JSZip` 会被动态加载；若在受限环境（无 CDN）下使用，应提前引入本地 `jszip`。
- 后端接口返回结构不一致时，模块做了多种兜底处理，但仍建议检查 `attachmentRecordList` 字段与 `asrFid/asrName/typeName` 等字段的存在性。
- 下载失败时会记录到 `results` 中（包含 `error` 信息），可据此做重试或告警。

贡献与修改

- 若需要支持更多后端字段或替换 `JSZip` 配置（压缩等级、输出名），请修改 `downloadAllAttachmentsAsZip` 中的 `config` 合并逻辑。
- 若 `$NG` 接口在你的环境不可用，可将 `$NG.request` 替换为 `fetch`/`axios` 的适配层。

---

如果你想我把 README 转成英文版，或把使用示例扩展为可复制粘贴的完整页面示例，我可以继续补充。
/\*\*

- 获取表单附件信息的封装函数
- @param {Object} params - 参数对象
- @param {string} params.phidValue - 主键 ID
- @param {string} params.busType - 业务类型
- @param {string} params.tableName - 表名
- @param {Array} params.mainTableNames - 主表名数组
- @param {Array} params.detailTablePrefixes - 明细表前缀数组
- @returns {Promise} 返回包含附件信息的 Promise 对象
  \*/
  function getFormAttachmentInfo(params) {
  return new Promise((resolve, reject) => {
  const {
  phidValue,
  busType,
  tableName,
  mainTableNames,
  detailTablePrefixes,
  } = params;
  let fromObj = {};
  let mainInfo = {};

      // 处理主表附件信息
      $NG.execServer(
        "selectFromMainAttachmentInfo",
        {
          table: tableName,
          phid: phidValue,
          bus: busType,
        },
        function (res) {
          console.log(res);
          if (res.count == 0) {
            reject(new Error("未找到主表附件信息"));
            return;
          }

          const data = JSON.parse(res.data);
          if (data.length == 0) {
            reject(new Error("主表数据为空"));
            return;
          }

          const { extendObjects } = data[0];
          mainInfo = extendObjects;
          console.log("主表信息:", mainInfo);

          // 请求获取主表及明细附件标识
          $NG.request
            .get({
              url: `/sup/customServer/getInfo?id=${phidValue}&oType=view&customBusCode=${busType}&encryptPrimaryKey=${$NG.CryptoJS.encode(
                phidValue
              )}`,
            })
            .then((res) => {
              console.log("明细表响应:", res);

              // 处理响应数据
              fromObj = processResponseData(
                res,
                mainTableNames,
                detailTablePrefixes
              );
              // 合并主表信息
              fromObj = { ...fromObj, ...mainInfo };
              console.log("最终结果:", fromObj);

              resolve(fromObj);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );

  });
  }

// 处理响应数据的函数（保持不变）
function processResponseData(
responseData,
mainTableNames,
detailTablePrefixes
) {
const fromObj = {};

// 处理主表（可能有多个主表）
for (const mainTableName of mainTableNames) {
const mainTable = responseData.data[mainTableName];
if (mainTable && mainTable.u_file) {
// 移除 @@数字 部分
fromObj.mGuid = mainTable.u_file.replace(/@@\d+$/, "");
break; // 只取第一个有值的主表
}
}

// 处理明细表（可能有多种前缀）
for (const detailPrefix of detailTablePrefixes) {
// 找出所有匹配该前缀的明细表
const detailTables = Object.keys(responseData.data)
.filter((key) => key.startsWith(detailPrefix))
.map((key) => ({
tableName: key,
suffix: key.replace(detailPrefix, ""),
}));

    for (const { tableName, suffix } of detailTables) {
      const detailTable = responseData.data[tableName];
      if (Array.isArray(detailTable)) {
        const propName = suffix ? `d${suffix}Guids` : "dGuids";

        fromObj[propName] = detailTable
          .map((item) => {
            // 尝试可能的字段名
            const fileValue = item.u_file || item.u_body_file;
            if (fileValue) {
              // 移除 @@数字 部分
              return fileValue.replace(/@@\d+$/, "");
            }
            return null;
          })
          .filter((file) => file !== null && file !== undefined);
      }
    }

}

return fromObj;
}

// 调用示例
async function exampleUsage(phidValue, busType, tableName, dTableName) {
try {
//const params = {
// phidValue: "123456", // 替换为实际的主键 ID
// busType: "fixedassest_store", // 替换为实际的业务类型
// tableName: "p_form_fixedassest_store", // 替换为实际的表名
// mainTableNames: ["p_form_fixedassest_store"],
// detailTablePrefixes: ["p_form__test_d"]
//};
const params = {
phidValue: phidValue,
busType: busType,
tableName: tableName,
mainTableNames: [tableName],
detailTablePrefixes: [dTableName],
};

    const fromObj = await getFormAttachmentInfo(params);
    console.log("获取到的附件信息:", fromObj);

    // 在这里可以使用fromObj进行后续操作
    return fromObj;

} catch (error) {
console.error("获取附件信息失败:", error);
throw error;
}
}

// 或者使用 Promise 方式调用
function exampleUsagePromise(phidValue, busType, tableName, dTableName) {
const params = {
phidValue: phidValue,
busType: busType,
tableName: tableName,
mainTableNames: [tableName],
detailTablePrefixes: [dTableName],
};

return getFormAttachmentInfo(params)
.then((fromObj) => {
console.log("获取到的附件信息:", fromObj);
return fromObj;
})
.catch((error) => {
console.error("获取附件信息失败:", error);
throw error;
});
}

/\*\*

- 获取特定 DOM 元素的值
- @param {string} parentId - 父元素 ID
- @param {string} childSelector - 子元素选择器
- @param {string} [valueType='text'] - 值类型: 'text'或'html'
- @param {number} [timeout=5000] - 超时时间(毫秒)
- @returns {Promise<string>} 元素的值
  \*/
  function getElementValue(
  parentId,
  childSelector,
  valueType = "text",
  timeout = 5000
  ) {
  return new Promise((resolve, reject) => {
  const startTime = Date.now();

      function tryGetElement() {
        const parent = document.getElementById(parentId);
        if (!parent) {
          if (Date.now() - startTime > timeout) {
            reject(`未找到ID为${parentId}的元素`);
            return;
          }
          setTimeout(tryGetElement, 100);
          return;
        }

        const child = parent.querySelector(childSelector);
        if (child) {
          if (valueType === "html") {
            resolve(child.innerHTML.trim());
          } else {
            resolve(child.textContent.trim());
          }
        } else {
          if (Date.now() - startTime > timeout) {
            reject(`在${parentId}中未找到${childSelector}元素`);
            return;
          }
          setTimeout(tryGetElement, 100);
        }
      }

      tryGetElement();

  });
  }

// 引入 JSZip 库用于创建 ZIP 文件
function loadJSZip() {
return new Promise((resolve, reject) => {
if (typeof JSZip !== "undefined") {
resolve(JSZip);
return;
}

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve(JSZip);
    script.onerror = () => reject(new Error("Failed to load JSZip"));
    document.head.appendChild(script);

});
}

// 修改后的下载函数，返回文件的 Blob 对象
// 修复：改进的下载文件为 Blob 函数，添加更好的错误处理
function downloadFileAsBlob(config) {
const { downloadUrl, dbToken, requestData, fileName } = config;

return new Promise((resolve, reject) => {
if (!downloadUrl) {
reject(new Error("缺少必要参数：downloadUrl"));
return;
}

    console.log(`开始下载文件: ${fileName}`, requestData);

    $NG.request
      .post({
        url: downloadUrl,
        headers: {
          dbToken: dbToken,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(requestData),
      })
      .then((res) => {
        console.log("下载响应:", res);

        if (res.data && res.data[requestData.asrFids[0]]) {
          const fileDownloadUrl = res.data[requestData.asrFids[0]];
          console.log("获取到下载URL:", fileDownloadUrl);

          // 使用fetch获取文件内容
          fetch(fileDownloadUrl, {
            headers: {
              dbToken: dbToken,
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.blob();
            })
            .then((blob) => {
              // 修复：检查Blob是否有效
              if (blob && blob.size > 0) {
                console.log(
                  `文件下载成功: ${fileName}, 大小: ${blob.size} bytes`
                );
                resolve({
                  blob: blob,
                  fileName: fileName,
                });
              } else {
                console.error(`文件Blob无效: ${fileName}, 大小: ${blob.size}`);
                reject(new Error(`文件Blob无效: ${fileName}`));
              }
            })
            .catch((error) => {
              console.error("获取文件内容失败:", error);
              reject(error);
            });
        } else {
          console.error("未获取到有效的下载URL", res);
          reject(new Error("未获取到有效的下载URL"));
        }
      })
      .catch((error) => {
        console.error("下载请求失败:", error);
        reject(error);
      });

});
}

// 解码 URL 编码的文件名
function decodeFileName(fileName) {
try {
return decodeURIComponent(fileName);
} catch (e) {
console.warn("文件名解码失败，使用原文件名:", fileName);
return fileName;
}
}

// 主函数：下载所有附件并打包
async function downloadAllAttachmentsAsZipOldSingle(
attachmentData,
options = {}
) {
try {
// 加载 JSZip 库
const JSZip = await loadJSZip();

    // 合并配置
    const config = {
      downloadUrl:
        options.downloadUrl || "JFileSrv/api/getDownloadUrlByAsrFids",
      dbToken: options.dbToken || "0001",
      parentFolderName: options.parentFolderName || "测试单据业务",
      wmDisabled: options.wmDisabled || "0",
      billWM: options.billWM || "YEIG",
      orgId: options.orgId || "0",
    };

    // 创建ZIP实例
    const zip = new JSZip();
    const parentFolder = zip.folder(config.parentFolderName);

    // 获取附件列表
    let attachmentRecordList;
    if (attachmentData.data && attachmentData.data.attachmentRecordList) {
      attachmentRecordList = attachmentData.data.attachmentRecordList;
    } else if (Array.isArray(attachmentData)) {
      attachmentRecordList = attachmentData;
    } else if (attachmentData.attachmentRecordList) {
      attachmentRecordList = attachmentData.attachmentRecordList;
    } else {
      throw new Error("无法识别的附件数据结构");
    }

    if (!attachmentRecordList || attachmentRecordList.length === 0) {
      throw new Error("未找到附件数据");
    }

    console.log(`开始处理 ${attachmentRecordList.length} 个附件`, config);

    // 创建下载任务数组
    const downloadPromises = attachmentRecordList.map((record) => {
      const folderName = record.typeName || "未分类";
      const fileName = decodeFileName(record.asrName);

      return downloadFileAsBlob({
        downloadUrl: config.downloadUrl,
        dbToken: config.dbToken,
        requestData: {
          asrFids: [record.asrFid],
          loginId: record.asrFill,
          orgId: config.orgId,
          busTypeCode: record.bustypecode,
          wmDisabled: config.wmDisabled,
          billWM: config.billWM,
        },
        fileName: fileName,
      })
        .then((fileData) => {
          // 在ZIP中创建对应的文件夹并添加文件
          let folder = parentFolder.folder(folderName);
          if (!folder) {
            folder = parentFolder.folder(folderName);
          }
          folder.file(fileName, fileData.blob);

          console.log(`已添加文件到文件夹: ${folderName}/${fileName}`);
          return {
            folderName: folderName,
            fileName: fileName,
            success: true,
          };
        })
        .catch((error) => {
          console.error(`下载文件失败: ${folderName}/${fileName}`, error);
          return {
            folderName: folderName,
            fileName: fileName,
            success: false,
            error: error.message,
          };
        });
    });

    // 等待所有下载完成
    const results = await Promise.allSettled(downloadPromises);

    // 统计下载结果
    const successfulDownloads = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;
    const failedDownloads = results.length - successfulDownloads;

    console.log(
      `下载完成: 成功 ${successfulDownloads} 个, 失败 ${failedDownloads} 个`
    );

    // 检查是否所有文件都下载失败
    if (successfulDownloads === 0) {
      throw new Error("所有文件下载都失败了，请检查网络连接和参数配置");
    }

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    console.log(`ZIP文件生成完成，大小: ${zipBlob.size} bytes`);

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${config.parentFolderName}_附件包.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 清理URL对象
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);

    console.log(`ZIP文件已生成: ${config.parentFolderName}_附件包.zip`);

    // 返回下载结果
    return {
      success: true,
      total: attachmentRecordList.length,
      successful: successfulDownloads,
      failed: failedDownloads,
      zipFileName: `${config.parentFolderName}_附件包.zip`,
      config: config,
      results: results.map((result, index) => ({
        record: attachmentRecordList[index],
        status: result.status,
        value: result.status === "fulfilled" ? result.value : result.reason,
      })),
    };

} catch (error) {
console.error("下载所有附件失败:", error);
return {
success: false,
error: error.message,
};
}
}

// 主函数：下载所有附件并打包
async function downloadAllAttachmentsAsZip(attachmentData, options = {}) {
try {
// 加载 JSZip 库
const JSZip = await loadJSZip();

    // 合并配置
    const config = {
      downloadUrl:
        options.downloadUrl || "JFileSrv/api/getDownloadUrlByAsrFids",
      dbToken: options.dbToken || "0001",
      parentFolderName: options.parentFolderName || "测试单据业务",
      wmDisabled: options.wmDisabled || "0",
      billWM: options.billWM || "YEIG",
      orgId: options.orgId || "0",
    };

    // 创建ZIP实例
    const zip = new JSZip();
    const parentFolder = zip.folder(config.parentFolderName);

    // 处理输入数据：统一转换为附件记录数组
    let allAttachmentRecords = [];

    if (Array.isArray(attachmentData)) {
      // 如果是数组，处理多个对象
      console.log(`检测到 ${attachmentData.length} 个对象`);

      attachmentData.forEach((item, index) => {
        let records = [];

        if (item.data && item.data.attachmentRecordList) {
          // 完整响应结构
          records = item.data.attachmentRecordList;
        } else if (item.attachmentRecordList) {
          // 只有attachmentRecordList字段
          records = item.attachmentRecordList;
        } else if (Array.isArray(item)) {
          // 直接是附件数组
          records = item;
        }

        console.log(`对象 ${index + 1} 包含 ${records.length} 个附件`);
        allAttachmentRecords = allAttachmentRecords.concat(records);
      });
    } else {
      // 单个对象的情况，保持原有逻辑
      console.log("检测到单个对象");

      if (attachmentData.data && attachmentData.data.attachmentRecordList) {
        allAttachmentRecords = attachmentData.data.attachmentRecordList;
      } else if (attachmentData.attachmentRecordList) {
        allAttachmentRecords = attachmentData.attachmentRecordList;
      } else if (Array.isArray(attachmentData)) {
        allAttachmentRecords = attachmentData;
      } else {
        throw new Error("无法识别的附件数据结构");
      }
    }

    if (!allAttachmentRecords || allAttachmentRecords.length === 0) {
      throw new Error("未找到附件数据");
    }

    console.log(`总共处理 ${allAttachmentRecords.length} 个附件`);

    // 按 typeName 分组附件
    const groupedAttachments = {};
    allAttachmentRecords.forEach((record) => {
      const folderName = record.typeName || "未分类";
      if (!groupedAttachments[folderName]) {
        groupedAttachments[folderName] = [];
      }
      groupedAttachments[folderName].push(record);
    });

    console.log(
      "附件分组情况:",
      Object.keys(groupedAttachments).map((key) => ({
        文件夹: key,
        文件数: groupedAttachments[key].length,
      }))
    );

    // 创建下载任务数组（按分组）
    const downloadPromises = [];

    Object.keys(groupedAttachments).forEach((folderName) => {
      const recordsInFolder = groupedAttachments[folderName];

      recordsInFolder.forEach((record) => {
        const fileName = decodeFileName(record.asrName);

        const promise = downloadFileAsBlob({
          downloadUrl: config.downloadUrl,
          dbToken: config.dbToken,
          requestData: {
            asrFids: [record.asrFid],
            loginId: record.asrFill,
            orgId: config.orgId,
            busTypeCode: record.bustypecode,
            wmDisabled: config.wmDisabled,
            billWM: config.billWM,
          },
          fileName: fileName,
        })
          .then((fileData) => {
            // 在ZIP中创建对应的文件夹并添加文件
            let folder = parentFolder.folder(folderName);
            if (!folder) {
              folder = parentFolder.folder(folderName);
            }
            folder.file(fileName, fileData.blob);

            console.log(`已添加文件到文件夹: ${folderName}/${fileName}`);
            return {
              folderName: folderName,
              fileName: fileName,
              success: true,
              record: record,
            };
          })
          .catch((error) => {
            console.error(`下载文件失败: ${folderName}/${fileName}`, error);
            return {
              folderName: folderName,
              fileName: fileName,
              success: false,
              error: error.message,
              record: record,
            };
          });

        downloadPromises.push(promise);
      });
    });

    // 等待所有下载完成
    const results = await Promise.allSettled(downloadPromises);

    // 统计下载结果
    const successfulDownloads = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;
    const failedDownloads = results.length - successfulDownloads;

    console.log(
      `下载完成: 成功 ${successfulDownloads} 个, 失败 ${failedDownloads} 个`
    );

    // 检查是否所有文件都下载失败
    if (successfulDownloads === 0) {
      throw new Error("所有文件下载都失败了，请检查网络连接和参数配置");
    }

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    console.log(`ZIP文件生成完成，大小: ${zipBlob.size} bytes`);

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${config.parentFolderName}_附件包.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 清理URL对象
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);

    console.log(`ZIP文件已生成: ${config.parentFolderName}_附件包.zip`);

    // 返回下载结果
    return {
      success: true,
      total: allAttachmentRecords.length,
      successful: successfulDownloads,
      failed: failedDownloads,
      zipFileName: `${config.parentFolderName}_附件包.zip`,
      groups: Object.keys(groupedAttachments).map((key) => ({
        groupName: key,
        fileCount: groupedAttachments[key].length,
      })),
      config: config,
      results: results.map((result, index) => {
        const record = allAttachmentRecords[index];
        return {
          record: record,
          status: result.status,
          value: result.status === "fulfilled" ? result.value : result.reason,
        };
      }),
    };

} catch (error) {
console.error("下载所有附件失败:", error);
return {
success: false,
error: error.message,
};
}
}

// 便捷函数：创建下载按钮
function createDownloadButton(attachmentData, buttonOptions = {}) {
const button = document.createElement("button");
button.textContent = buttonOptions.text || "下载所有附件";
button.style.cssText =
buttonOptions.style ||
`      position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
        padding: 10px 20px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
 `;

button.addEventListener("click", async () => {
if (button.disabled) return;

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "下载中...";

    try {
      const result = await downloadAllAttachmentsAsZip(
        attachmentData,
        buttonOptions
      );

      if (result.success) {
        alert(
          `下载完成！成功: ${result.successful} 个文件, 失败: ${result.failed} 个文件`
        );
      } else {
        alert("下载失败: " + result.error);
      }
    } catch (error) {
      alert("下载过程出错: " + error.message);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }

});

const container = buttonOptions.container || document.body;
container.appendChild(button);

return button;
}

// 保持向后兼容的原始函数
async function originalDownloadFunction() {
const attachmentData = window.mAttachfromObj || getResponseData();
return downloadAllAttachmentsAsZip(attachmentData);
}

//附件打包下载及编辑文件树模块
/\*\*

- 表单附件批量下载管理器
- @param {Object} config 配置对象
  \*/
  function initAttachmentDownloader(config) {
  // 默认配置
  const defaultConfig = {
  tableName: "",
  busType: "",
  FormName: "",
  sFormGroupKeys: [],
  dFormFormKeys: [],
  sFormName: [],
  dFormName: [],
  mFormName: "表头",
  };

// 合并配置
const cfg = { ...defaultConfig, ...config };

// 内部变量
const mstForm = $NG.getCmpApi(cfg.tableName);
const phidValue = mstForm.getValues().phid;

let treeStructure = {};
let NuTreeStructure = {};
let editTreeStructure = {};
let downloadConfig = {};
let currentTreeType = false;

console.log("Attachment Downloader Initialized");
console.log("---------phid---------" + phidValue);

/\*\*

- 获取表单附件信息的封装函数
  \*/
  function getFormAttachmentInfo(params) {
  return new Promise((resolve, reject) => {
  const { phidValue, busType, tableName, mainTableNames } = params;
  let fromObj = {};
  let mainInfo = {};

      // 处理主表附件信息
      $NG.execServer(
        "selectFromMainAttachmentInfo",
        {
          table: tableName,
          phid: phidValue,
          bus: busType,
        },
        function (res) {
          console.log("主表附件信息查询结果:", res);

          if (res.count == 0 || !res.data) {
            console.log("未找到主表附件信息，继续处理其他附件");
            mainInfo = {};
          } else {
            try {
              const data = JSON.parse(res.data);
              if (data.length == 0) {
                console.log("主表数据为空，继续处理其他附件");
                mainInfo = {};
              } else {
                const { extendObjects } = data[0];
                mainInfo = extendObjects || {};
                console.log("主表信息:", mainInfo);
              }
            } catch (e) {
              console.error("解析主表数据失败:", e);
              mainInfo = {};
            }
          }

          // 请求获取主表及明细附件标识
          $NG.request
            .get({
              url: `/sup/customServer/getInfo?id=${phidValue}&oType=view&customBusCode=${busType}&encryptPrimaryKey=${$NG.CryptoJS.encode(
                phidValue
              )}`,
            })
            .then((res) => {
              console.log("明细表响应:", res);

              // 处理响应数据
              fromObj = processResponseData(res, mainTableNames);
              // 合并主表信息
              fromObj = { ...fromObj, ...mainInfo };
              console.log("最终结果:", fromObj);

              resolve(fromObj);
            })
            .catch((error) => {
              console.error("获取明细表信息失败:", error);
              fromObj = { ...mainInfo };
              resolve(fromObj);
            });
        }
      );

  });
  }

/\*\*

- 处理响应数据的函数
  \*/
  function processResponseData(responseData, mainTableNames) {
  const fromObj = {};

  // 处理主表
  for (const mainTableName of mainTableNames) {
  const mainTable = responseData.data[mainTableName];
  if (mainTable) {
  fromObj.mGuids = [];

        cfg.sFormGroupKeys.forEach((fieldName, index) => {
          if (mainTable[fieldName]) {
            const fileValue = mainTable[fieldName];
            fromObj.mGuids.push({
              fieldName: fieldName,
              guid: fileValue.replace(/@@\d+$/, ""),
              formName: cfg.sFormName[index] || fieldName,
            });
            console.log(
              `找到主表附件字段: ${fieldName} -> ${cfg.sFormName[index]}`
            );
          }
        });

        if (fromObj.mGuids.length > 0) {
          break;
        }
      }

  }

  // 处理多个明细表
  fromObj.detailGuids = {};

  cfg.dFormFormKeys.forEach((detailTableName, index) => {
  const detailTable = responseData.data[detailTableName];
  if (Array.isArray(detailTable)) {
  const formName = cfg.dFormName[index] || detailTableName;
  fromObj.detailGuids[formName] = detailTable
  .map((item) => {
  const fileValue = item.u_file || item.u_body_file || item.u_file1;
  if (fileValue) {
  return fileValue.replace(/@@\d+$/, "");
  }
  return null;
  })
  .filter((file) => file !== null && file !== undefined);

        console.log(
          `明细表 ${detailTableName} 找到 ${fromObj.detailGuids[formName].length} 个附件`
        );
      }

  });

  return fromObj;

}

/\*\*

- 构建树形结构信息 - 带行标识
  \*/
  function buildTreeStructureWithRowFolder(downloadConfig) {
  const treeStructure = {
  root: {
  name: `${cfg.FormName}`,
  type: "root",
  level: 0,
  path: "/",
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  },
  totalFiles: 0,
  totalFolders: 0,
  buildTime: new Date().toISOString(),
  type: true,
  };

  const rootNode = treeStructure.root;

  // 构建主表单附件树形结构
  if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
  const mainFormNode = {
  name: downloadConfig.mFormName,
  type: "folder",
  level: 1,
  path: `/${downloadConfig.mFormName}`,
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  };

      const mainAttachments =
        downloadConfig.mainAttachment[downloadConfig.mFormName];
      if (
        mainAttachments &&
        mainAttachments.data &&
        mainAttachments.data.attachmentRecordList
      ) {
        const attachments = mainAttachments.data.attachmentRecordList;

        const attachmentsByType = {};
        attachments.forEach((attachment) => {
          const typeName = attachment.typeName || "未分类";
          if (!attachmentsByType[typeName]) {
            attachmentsByType[typeName] = [];
          }
          attachmentsByType[typeName].push(attachment);
        });

        Object.keys(attachmentsByType).forEach((typeName) => {
          const typeNode = {
            name: typeName,
            type: "folder",
            level: 2,
            path: `/${downloadConfig.mFormName}/${typeName}`,
            children: [],
            fileCount: attachmentsByType[typeName].length,
            id: generateId(),
            collapsed: false,
          };

          attachmentsByType[typeName].forEach((attachment) => {
            const fileNode = {
              name: decodeFileName(attachment.asrName),
              type: "file",
              level: 3,
              path: `/${downloadConfig.mFormName}/${typeName}/${decodeFileName(
                attachment.asrName
              )}`,
              fileInfo: {
                ...attachment, // 保存完整的附件信息用于预览
                asrFid: attachment.asrFid,
                asrName: attachment.asrName,
                fileSize: attachment.fileSize,
                uploadTime: attachment.uploadTime,
                typeName: attachment.typeName,
                asrRemark: attachment.asrRemark || "", // 添加备注信息
                asrSessionGuid: attachment.asrSessionGuid,
                bustypecode: attachment.bustypecode,
              },
              id: generateId(),
            };
            typeNode.children.push(fileNode);
            treeStructure.totalFiles++;
          });

          mainFormNode.children.push(typeNode);
          mainFormNode.fileCount += typeNode.fileCount;
          treeStructure.totalFolders++;
        });
      }

      rootNode.children.push(mainFormNode);
      treeStructure.totalFolders++;

  }

  // 构建分组表单附件树形结构
  if (downloadConfig.groupAttachments && downloadConfig.sFormName) {
  downloadConfig.sFormName.forEach((formName) => {
  if (downloadConfig.groupAttachments[formName]) {
  const groupFormNode = {
  name: formName,
  type: "folder",
  level: 1,
  path: `/${formName}`,
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  };

          const groupAttachments = downloadConfig.groupAttachments[formName];
          if (
            groupAttachments.data &&
            groupAttachments.data.attachmentRecordList
          ) {
            const attachments = groupAttachments.data.attachmentRecordList;

            const attachmentsByType = {};
            attachments.forEach((attachment) => {
              const typeName = attachment.typeName || "未分类";
              if (!attachmentsByType[typeName]) {
                attachmentsByType[typeName] = [];
              }
              attachmentsByType[typeName].push(attachment);
            });

            Object.keys(attachmentsByType).forEach((typeName) => {
              const typeNode = {
                name: typeName,
                type: "folder",
                level: 2,
                path: `/${formName}/${typeName}`,
                children: [],
                fileCount: attachmentsByType[typeName].length,
                id: generateId(),
                collapsed: false,
              };

              attachmentsByType[typeName].forEach((attachment) => {
                const fileNode = {
                  name: decodeFileName(attachment.asrName),
                  type: "file",
                  level: 3,
                  path: `/${formName}/${typeName}/${decodeFileName(
                    attachment.asrName
                  )}`,
                  fileInfo: {
                    ...attachment, // 保存完整的附件信息用于预览
                    asrFid: attachment.asrFid,
                    asrName: attachment.asrName,
                    fileSize: attachment.fileSize,
                    uploadTime: attachment.uploadTime,
                    typeName: attachment.typeName,
                    asrRemark: attachment.asrRemark || "", // 添加备注信息
                    asrSessionGuid: attachment.asrSessionGuid,
                    bustypecode: attachment.bustypecode,
                  },
                  id: generateId(),
                };
                typeNode.children.push(fileNode);
                treeStructure.totalFiles++;
              });

              groupFormNode.children.push(typeNode);
              groupFormNode.fileCount += typeNode.fileCount;
              treeStructure.totalFolders++;
            });
          }

          rootNode.children.push(groupFormNode);
          treeStructure.totalFolders++;
        }
      });

  }

  // 构建明细表单附件树形结构 - 带行标识
  if (downloadConfig.detailAttachments && downloadConfig.dFormName) {
  downloadConfig.dFormName.forEach((formName) => {
  if (downloadConfig.detailAttachments[formName]) {
  const detailFormNode = {
  name: formName,
  type: "folder",
  level: 1,
  path: `/${formName}`,
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  };

          const detailAttachments = downloadConfig.detailAttachments[formName];
          if (Array.isArray(detailAttachments)) {
            detailAttachments.forEach((detailItem, rowIndex) => {
              if (
                detailItem.code === 200 &&
                detailItem.data &&
                detailItem.data.attachmentRecordList
              ) {
                const rowNode = {
                  name: `行${rowIndex + 1}`,
                  type: "folder",
                  level: 2,
                  path: `/${formName}/行${rowIndex + 1}`,
                  children: [],
                  fileCount: 0,
                  id: generateId(),
                  collapsed: false,
                };

                const attachments = detailItem.data.attachmentRecordList;

                const attachmentsByType = {};
                attachments.forEach((attachment) => {
                  const typeName = attachment.typeName || "未分类";
                  if (!attachmentsByType[typeName]) {
                    attachmentsByType[typeName] = [];
                  }
                  attachmentsByType[typeName].push(attachment);
                });

                Object.keys(attachmentsByType).forEach((typeName) => {
                  const typeNode = {
                    name: typeName,
                    type: "folder",
                    level: 3,
                    path: `/${formName}/行${rowIndex + 1}/${typeName}`,
                    children: [],
                    fileCount: attachmentsByType[typeName].length,
                    id: generateId(),
                    collapsed: true,
                  };

                  attachmentsByType[typeName].forEach((attachment) => {
                    const fileNode = {
                      name: decodeFileName(attachment.asrName),
                      type: "file",
                      level: 4,
                      path: `/${formName}/行${
                        rowIndex + 1
                      }/${typeName}/${decodeFileName(attachment.asrName)}`,
                      fileInfo: {
                        ...attachment, // 保存完整的附件信息用于预览
                        asrFid: attachment.asrFid,
                        asrName: attachment.asrName,
                        fileSize: attachment.fileSize,
                        uploadTime: attachment.uploadTime,
                        typeName: attachment.typeName,
                        asrRemark: attachment.asrRemark || "", // 添加备注信息
                        asrSessionGuid: attachment.asrSessionGuid,
                        bustypecode: attachment.bustypecode,
                      },
                      id: generateId(),
                    };
                    typeNode.children.push(fileNode);
                    treeStructure.totalFiles++;
                  });

                  rowNode.children.push(typeNode);
                  rowNode.fileCount += typeNode.fileCount;
                  treeStructure.totalFolders++;
                });

                detailFormNode.children.push(rowNode);
                detailFormNode.fileCount += rowNode.fileCount;
                treeStructure.totalFolders++;
              }
            });
          }

          rootNode.children.push(detailFormNode);
          treeStructure.totalFolders++;
        }
      });

  }

  rootNode.fileCount = treeStructure.totalFiles;
  console.log("带行标识树形结构构建完成:", treeStructure);
  return treeStructure;

}

/\*\*

- 构建树形结构信息 - 不带行标识
  \*/
  function buildTreeStructureWithoutRowFolder(downloadConfig) {
  const treeStructure = {
  root: {
  name: `${cfg.FormName}`,
  type: "root",
  level: 0,
  path: "/",
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  },
  totalFiles: 0,
  totalFolders: 0,
  buildTime: new Date().toISOString(),
  type: false,
  };

  const rootNode = treeStructure.root;

  // 构建主表单附件树形结构
  if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
  const mainFormNode = {
  name: downloadConfig.mFormName,
  type: "folder",
  level: 1,
  path: `/${downloadConfig.mFormName}`,
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  };

      const mainAttachments =
        downloadConfig.mainAttachment[downloadConfig.mFormName];
      if (
        mainAttachments &&
        mainAttachments.data &&
        mainAttachments.data.attachmentRecordList
      ) {
        const attachments = mainAttachments.data.attachmentRecordList;

        const attachmentsByType = {};
        attachments.forEach((attachment) => {
          const typeName = attachment.typeName || "未分类";
          if (!attachmentsByType[typeName]) {
            attachmentsByType[typeName] = [];
          }
          attachmentsByType[typeName].push(attachment);
        });

        Object.keys(attachmentsByType).forEach((typeName) => {
          const typeNode = {
            name: typeName,
            type: "folder",
            level: 2,
            path: `/${downloadConfig.mFormName}/${typeName}`,
            children: [],
            fileCount: attachmentsByType[typeName].length,
            id: generateId(),
            collapsed: false,
          };

          attachmentsByType[typeName].forEach((attachment) => {
            const fileNode = {
              name: decodeFileName(attachment.asrName),
              type: "file",
              level: 3,
              path: `/${downloadConfig.mFormName}/${typeName}/${decodeFileName(
                attachment.asrName
              )}`,
              fileInfo: {
                ...attachment, // 保存完整的附件信息用于预览
                asrFid: attachment.asrFid,
                asrName: attachment.asrName,
                fileSize: attachment.fileSize,
                uploadTime: attachment.uploadTime,
                typeName: attachment.typeName,
                asrRemark: attachment.asrRemark || "", // 添加备注信息
                asrSessionGuid: attachment.asrSessionGuid,
                bustypecode: attachment.bustypecode,
              },
              id: generateId(),
            };
            typeNode.children.push(fileNode);
            treeStructure.totalFiles++;
          });

          mainFormNode.children.push(typeNode);
          mainFormNode.fileCount += typeNode.fileCount;
          treeStructure.totalFolders++;
        });
      }

      rootNode.children.push(mainFormNode);
      treeStructure.totalFolders++;

  }

  // 构建分组表单附件树形结构
  if (downloadConfig.groupAttachments && downloadConfig.sFormName) {
  downloadConfig.sFormName.forEach((formName) => {
  if (downloadConfig.groupAttachments[formName]) {
  const groupFormNode = {
  name: formName,
  type: "folder",
  level: 1,
  path: `/${formName}`,
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  };

          const groupAttachments = downloadConfig.groupAttachments[formName];
          if (
            groupAttachments.data &&
            groupAttachments.data.attachmentRecordList
          ) {
            const attachments = groupAttachments.data.attachmentRecordList;

            const attachmentsByType = {};
            attachments.forEach((attachment) => {
              const typeName = attachment.typeName || "未分类";
              if (!attachmentsByType[typeName]) {
                attachmentsByType[typeName] = [];
              }
              attachmentsByType[typeName].push(attachment);
            });

            Object.keys(attachmentsByType).forEach((typeName) => {
              const typeNode = {
                name: typeName,
                type: "folder",
                level: 2,
                path: `/${formName}/${typeName}`,
                children: [],
                fileCount: attachmentsByType[typeName].length,
                id: generateId(),
                collapsed: false,
              };

              attachmentsByType[typeName].forEach((attachment) => {
                const fileNode = {
                  name: decodeFileName(attachment.asrName),
                  type: "file",
                  level: 3,
                  path: `/${formName}/${typeName}/${decodeFileName(
                    attachment.asrName
                  )}`,
                  fileInfo: {
                    ...attachment, // 保存完整的附件信息用于预览
                    asrFid: attachment.asrFid,
                    asrName: attachment.asrName,
                    fileSize: attachment.fileSize,
                    uploadTime: attachment.uploadTime,
                    typeName: attachment.typeName,
                    asrRemark: attachment.asrRemark || "", // 添加备注信息
                    asrSessionGuid: attachment.asrSessionGuid,
                    bustypecode: attachment.bustypecode,
                  },
                  id: generateId(),
                };
                typeNode.children.push(fileNode);
                treeStructure.totalFiles++;
              });

              groupFormNode.children.push(typeNode);
              groupFormNode.fileCount += typeNode.fileCount;
              treeStructure.totalFolders++;
            });
          }

          rootNode.children.push(groupFormNode);
          treeStructure.totalFolders++;
        }
      });

  }

  // 构建明细表单附件树形结构 - 不带行标识
  if (downloadConfig.detailAttachments && downloadConfig.dFormName) {
  downloadConfig.dFormName.forEach((formName) => {
  if (downloadConfig.detailAttachments[formName]) {
  const detailFormNode = {
  name: formName,
  type: "folder",
  level: 1,
  path: `/${formName}`,
  children: [],
  fileCount: 0,
  id: generateId(),
  collapsed: false,
  };

          const detailAttachments = downloadConfig.detailAttachments[formName];
          if (Array.isArray(detailAttachments)) {
            const allAttachments = [];
            detailAttachments.forEach((detailItem) => {
              if (
                detailItem.code === 200 &&
                detailItem.data &&
                detailItem.data.attachmentRecordList
              ) {
                allAttachments.push(...detailItem.data.attachmentRecordList);
              }
            });

            const attachmentsByType = {};
            allAttachments.forEach((attachment) => {
              const typeName = attachment.typeName || "未分类";
              if (!attachmentsByType[typeName]) {
                attachmentsByType[typeName] = [];
              }
              attachmentsByType[typeName].push(attachment);
            });

            Object.keys(attachmentsByType).forEach((typeName) => {
              const typeNode = {
                name: typeName,
                type: "folder",
                level: 2,
                path: `/${formName}/${typeName}`,
                children: [],
                fileCount: attachmentsByType[typeName].length,
                id: generateId(),
                collapsed: false,
              };

              attachmentsByType[typeName].forEach((attachment) => {
                const fileNode = {
                  name: decodeFileName(attachment.asrName),
                  type: "file",
                  level: 3,
                  path: `/${formName}/${typeName}/${decodeFileName(
                    attachment.asrName
                  )}`,
                  fileInfo: {
                    ...attachment, // 保存完整的附件信息用于预览
                    asrFid: attachment.asrFid,
                    asrName: attachment.asrName,
                    fileSize: attachment.fileSize,
                    uploadTime: attachment.uploadTime,
                    typeName: attachment.typeName,
                    asrRemark: attachment.asrRemark || "", // 添加备注信息
                    asrSessionGuid: attachment.asrSessionGuid,
                    bustypecode: attachment.bustypecode,
                  },
                  id: generateId(),
                };
                typeNode.children.push(fileNode);
                treeStructure.totalFiles++;
              });

              detailFormNode.children.push(typeNode);
              detailFormNode.fileCount += typeNode.fileCount;
              treeStructure.totalFolders++;
            });
          }

          rootNode.children.push(detailFormNode);
          treeStructure.totalFolders++;
        }
      });

  }

  rootNode.fileCount = treeStructure.totalFiles;
  console.log("不带行标识树形结构构建完成:", treeStructure);
  return treeStructure;

}

/\*\*

- 生成唯一 ID
  \*/
  function generateId() {
  return "node*" + Date.now() + "*" + Math.random().toString(36).substr(2, 9);
  }

/\*\*

- 创建文件树编辑模态框
  \*/
  function createTreeEditModal() {
  const existingModal = document.getElementById("tree-edit-modal");
  if (existingModal) {
  existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "tree-edit-modal";
  modal.innerHTML = `     <div class="modal-overlay"></div>
     <div class="modal-content">
         <div class="modal-header">
             <h3>
 				文件树编辑</h3>
             <div class="modal-controls">
                 <button class="modal-btn minimize-btn" title="最小化">−</button>
                 <button class="modal-btn maximize-btn" title="最大化">□</button>
                 <button class="modal-btn close-btn" title="关闭">×</button>
             </div>
         </div>
         <div class="modal-body">
             <div class="toolbar">
                 <button class="icon-button" id="reset-btn" title="还原默认结构">
 				<svg t="1760596744739" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4323" width="20" height="20"><path d="M828.586019 442.570786c-33.495897-10.623699-68.366625-15.99804-103.362339-15.99804-94.238456-0.124985-184.352417 38.870238-248.719532 107.611818-0.999878 1.124862-2.374709 1.749786-3.874526 1.749785-9.123882 0.249969-18.247765 0.374954-27.621616 0.374954C222.910212 536.309303 42.807275 476.066683 42.807275 402.200731v-78.615369c0-4.374464 4.749418-6.999143 8.498958-4.624434 87.989222 56.868034 241.095466 83.239803 393.701773 83.239803s305.712551-26.496754 393.701772-83.239803c3.624556-2.374709 8.498959 0.249969 8.498959 4.624434v78.615369c0 14.123269-6.499204 27.621616-18.622718 40.370054zM429.509904 938.510035C214.661223 935.760372 42.807275 876.642613 42.807275 804.526447v-78.740354c0-4.374464 4.874403-6.999143 8.498958-4.624434 75.615737 48.869014 199.475565 75.240783 329.709612 81.739988 2.749663 0.124985 4.874403 2.249724 5.249357 4.874402 5.499326 47.119228 20.622474 91.363808 43.244702 130.733986z m-44.119595-202.475197C191.66404 726.411016 42.807275 670.417875 42.807275 603.301097v-78.61537c0-4.374464 4.874403-6.999143 8.498958-4.624433 82.61488 53.368462 222.722717 79.990201 365.955172 82.989834 4.124495 0.124985 6.624189 4.374464 4.749418 7.99902-19.747581 38.12033-32.496019 80.240171-36.620514 124.98469zM445.008006 0c221.972809 0 402.200731 60.24262 402.200731 133.983587v67.116779c0 73.865952-180.227923 134.108572-402.200731 134.108572C222.910212 335.208938 42.807275 274.966317 42.807275 201.100366v-67.116779C42.807275 60.24262 222.910212 0 445.008006 0z m0 0" fill="#1677FF" p-id="4324"></path><path d="M725.348665 513.062151c67.866686-0.124985 132.858725 26.871708 180.852846 74.740845 47.994121 47.869136 74.990814 112.986159 74.990814 180.727861 0 67.741702-26.996693 132.858725-74.990814 180.727861s-112.986159 74.740844-180.852846 74.740845c-67.866686 0.124985-132.858725-26.871708-180.852846-74.740845-47.994121-47.869136-74.990814-112.986159-74.990814-180.727861 0-67.741702 26.996693-132.73374 74.990814-180.727861 47.994121-47.869136 112.986159-74.740844 180.852846-74.740845z m141.357684 382.578135c40.370055-194.226208-154.356092-203.600059-154.356092-203.600059l-0.124985-43.244703c-3.624556-18.12278-19.247642-7.124127-19.247642-7.124127l-103.862277 88.989099c-22.997183 16.24801-1.249847 28.121555-1.249847 28.121555l102.737415 88.48916c20.497489 15.373117 22.12229-8.24899 22.12229-8.248989v-40.120086c104.487201-32.496019 147.231964 96.613165 147.231965 96.613166 3.874525 7.374097 6.874158 0.124985 6.749173 0.124984zM445.008006 0.624923" fill="#1677FF" opacity=".5" p-id="4325"></path></svg>
 				</button>
                 <button class="icon-button" id="toggle-row-folder-btn" title="切换行标识显示">
 				<svg t="1760596898460" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6582" width="20" height="20"><path d="M475.356 261.395L364.101 128.066H64.998v166.619H65V895.64h895.354V261.395H475.356z m313.079 634.244c-53.354 0-101.031-24.942-132.564-64.081a169.998 169.998 0 0 1-1.969-2.497H129.881V327.974h765.593v253.202l0.035 0.028c39.515 32.323 64.845 82.132 64.845 138.018 0.001 97.433-76.97 176.417-171.919 176.417z" fill="#1677FF" p-id="6583"></path><path d="M895.509 581.204l-0.035-0.028c-29.37-24.012-66.568-38.37-107.039-38.37-94.948 0-171.919 78.985-171.919 176.417 0 41.528 13.988 79.701 37.386 109.839 0.65 0.838 1.304 1.672 1.969 2.497 31.533 39.14 79.21 64.081 132.564 64.081 94.948 0 171.919-78.985 171.919-176.417 0.001-55.887-25.33-105.696-64.845-138.019z m17.387 167.041h-100.13v102.75h-48.661v-102.75h-100.13v-49.934h100.13v-102.75h48.661v102.75h100.13v49.934z" fill="#1677FF" p-id="6584"></path><path d="M812.766 698.312v-102.75h-48.661v102.75h-100.13v49.933h100.13v102.75h48.661v-102.75h100.13v-49.933z" fill="#ffffff" p-id="6585"></path></svg>
 				</button>
                 <button class="icon-button" id="add-folder-btn" title="添加文件夹">
 				<svg t="1760596898460" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6582" width="20" height="20"><path d="M475.356 261.395L364.101 128.066H64.998v166.619H65V895.64h895.354V261.395H475.356z m313.079 634.244c-53.354 0-101.031-24.942-132.564-64.081a169.998 169.998 0 0 1-1.969-2.497H129.881V327.974h765.593v253.202l0.035 0.028c39.515 32.323 64.845 82.132 64.845 138.018 0.001 97.433-76.97 176.417-171.919 176.417z" fill="#1677FF" p-id="6583"></path><path d="M895.509 581.204l-0.035-0.028c-29.37-24.012-66.568-38.37-107.039-38.37-94.948 0-171.919 78.985-171.919 176.417 0 41.528 13.988 79.701 37.386 109.839 0.65 0.838 1.304 1.672 1.969 2.497 31.533 39.14 79.21 64.081 132.564 64.081 94.948 0 171.919-78.985 171.919-176.417 0.001-55.887-25.33-105.696-64.845-138.019z m17.387 167.041h-100.13v102.75h-48.661v-102.75h-100.13v-49.934h100.13v-102.75h48.661v102.75h100.13v49.934z" fill="#1677FF" p-id="6584"></path><path d="M812.766 698.312v-102.75h-48.661v102.75h-100.13v49.933h100.13v102.75h48.661v-102.75h100.13v-49.933z" fill="#ffffff" p-id="6585"></path></svg>
 				</button>
                 <button class="icon-button" id="delete-btn" title="删除选中项">
 				<svg t="1760601704642" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20160" width="20" height="20"><path d="M762.023564 733.556364l78.978327 78.959709 78.996945-78.978328a37.236364 37.236364 0 1 1 52.670837 52.670837l-79.015564 78.978327 79.015564 78.996946a37.236364 37.236364 0 0 1-52.670837 52.670836l-78.996945-79.015564-78.978327 79.015564a37.236364 37.236364 0 0 1-52.652219-52.670836l78.95971-78.996946-78.95971-78.978327a37.236364 37.236364 0 1 1 52.652219-52.670837zM800.581818 0a111.709091 111.709091 0 0 1 111.709091 111.709091v390.981818a37.236364 37.236364 0 1 1-72.927418-10.686836V130.327273a55.854545 55.854545 0 0 0-55.854546-55.854546H166.018327a55.854545 55.854545 0 0 0-55.761454 52.577746L110.163782 130.327273v744.727272a55.854545 55.854545 0 0 0 52.559127 55.761455l3.295418 0.093091h345.199709v0.986764a37.236364 37.236364 0 0 1 0 72.4992V1005.381818H148.945455a111.709091 111.709091 0 0 1-111.709091-111.709091V111.709091a111.709091 111.709091 0 0 1 111.709091-111.709091h651.636363zM577.163636 167.563636a111.709091 111.709091 0 1 1-80.989091 188.639419l-85.4016 49.282327a112.118691 112.118691 0 0 1 14.801455 84.1728l86.984145 50.213236a111.709091 111.709091 0 1 1-25.711709 49.654691l-86.667636-50.045673a111.709091 111.709091 0 1 1-32.395636-173.298036c0.949527-0.8192 2.048-1.545309 3.165091-2.196945l98.061963-56.617891A111.709091 111.709091 0 0 1 577.163636 167.563636z m18.618182 390.981819a55.854545 55.854545 0 1 0 0 111.70909 55.854545 55.854545 0 0 0 0-111.70909z m-279.272727-148.945455a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z m260.654545-186.181818a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z" fill="#1677FF" p-id="20161"></path></svg>
 				</button>
                 <button class="icon-button" id="preview-btn" title="预览文件" disabled>
 				<svg t="1760665298888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3435" width="20" height="20"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#1677FF" p-id="3436"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#1677FF" p-id="3437"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#1677FF" p-id="3438"></path></svg>
 				</button>
                 <!-- 搜索控件 -->
                 <div class="search-container">
                     <select class="search-type-select" id="search-type">
                         <option value="filename">按文件</option>
                         <option value="remark">按备注</option>
                     </select>
                     <input type="text" class="search-input" id="search-input" placeholder="输入搜索关键词...">
                     <button class="icon-button" id="search-btn" title="搜索">
                         <svg t="1760758143032" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5831" width="20" height="20"><path d="M446.112323 177.545051c137.567677 0.219798 252.612525 104.59798 266.162424 241.493333 13.562828 136.895354-78.778182 261.818182-213.617777 289.008485-134.852525 27.203232-268.386263-52.156768-308.945455-183.608889s25.018182-272.252121 151.738182-325.779394A267.235556 267.235556 0 0 1 446.112323 177.545051m0-62.060607c-182.794343 0-330.989899 148.195556-330.989899 330.989899s148.195556 330.989899 330.989899 330.989899 330.989899-148.195556 330.989899-330.989899-148.195556-330.989899-330.989899-330.989899z m431.321212 793.341415a30.849293 30.849293 0 0 1-21.94101-9.102223l-157.220202-157.220202c-11.752727-12.179394-11.584646-31.534545 0.37495-43.50707 11.972525-11.972525 31.327677-12.140606 43.494141-0.37495l157.220202 157.220202a31.036768 31.036768 0 0 1 6.723232 33.810101 31.004444 31.004444 0 0 1-28.651313 19.174142z m0 0" p-id="5832" fill="#1677FF"></path></svg>
                     </button>
                 </div>
                 <div class="expand-levels">
                     <span style="display: inline-flex; justify-content: center; align-items: center;">
 						<svg t="1760700387636" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1115" width="25" height="25"><path d="M832.128 768c33.194667 0 60.501333 25.173333 63.573333 57.813333L896 832a64 64 0 0 1-63.872 64h-298.922667A63.786667 63.786667 0 0 1 469.333333 832a64 64 0 0 1 63.872-64h298.922667zM213.333333 874.666667c-23.722667 0-42.666667-19.072-42.666666-42.624V362.666667A42.666667 42.666667 0 0 1 213.333333 320l4.992 0.298667c21.333333 2.432 37.674667 20.48 37.674667 42.325333L255.957333 490.666667h128.298667c21.248 0 39.594667 16.469333 42.112 37.674666L426.666667 533.333333l-0.298667 4.992a42.368 42.368 0 0 1-42.112 37.674667H256l0.042667 213.333333h128.256c22.869333 0 42.410667 19.114667 42.410666 42.666667l-0.298666 4.992a42.368 42.368 0 0 1-42.112 37.674667zM832.128 469.333333c33.194667 0 60.501333 25.173333 63.573333 57.813334L896 533.333333a64 64 0 0 1-63.872 64h-298.922667A63.786667 63.786667 0 0 1 469.333333 533.333333a64 64 0 0 1 63.872-64h298.922667z m-255.957333-341.333333c33.194667 0 60.458667 25.173333 63.573333 57.813333L640 192c0 35.328-29.013333 64-63.829333 64H191.829333A63.744 63.744 0 0 1 128 192C128 156.672 157.013333 128 191.829333 128h384.341334z" fill="#1677FF" p-id="1116"></path></svg>
 					</span>
                     <button class="toolbar-btn expand-level-btn" data-level="1">1级</button>
                     <button class="toolbar-btn expand-level-btn" data-level="2">2级</button>
                     <button class="toolbar-btn expand-level-btn" data-level="3">3级</button>
                     <button class="toolbar-btn" id="toggle-expand-btn" title="切换展开/折叠">展开</button>
                 </div>
             </div>
             <div class="tree-container">
                 <div class="tree" id="editable-tree"></div>
             </div>
         </div>
         <div class="modal-footer">
             <button class="footer-btn cancel-btn">取消</button>
             <button class="footer-btn confirm-btn">确认下载</button>
         </div>
     </div>`;

  const style = document.createElement("style");
  style.textContent = `
  #tree-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  font-family: "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif;
  }

             .modal-overlay {
                 position: absolute;
                 top: 0;
                 left: 0;
                 width: 100%;
                 height: 100%;
                 background: rgba(0, 0, 0, 0.6);
                 backdrop-filter: blur(1px);
             }

             .modal-content {
                 position: absolute;
                 top: 50%;
                 left: 50%;
                 transform: translate(-50%, -50%);
                 width: 800px;
                 height: 600px;
                 background: #ffffff;
                 border-radius: 4px;
                 box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                 display: flex;
                 flex-direction: column;
                 overflow: hidden;
                 transition: all 0.3s ease;
                 border: 1px solid #d1d1d1;
             }

             .modal-content.maximized {
                 width: 95% !important;
                 height: 95% !important;
                 top: 2.5% !important;
                 left: 2.5% !important;
                 transform: none !important;
             }

             .modal-content.minimized {
                 height: 60px !important;
                 width: 300px !important;
             }

             .modal-content.minimized .modal-body,
             .modal-content.minimized .modal-footer {
                 display: none !important;
             }

             .modal-header {
                 background: #F8F9FA;
                 color: black;
                 padding: 14px 20px;
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 cursor: move;
                 user-select: none;
                 border-bottom: 1px solid #F8F9FA;
             }

             .modal-header h3 {
                 margin: 0;
                 font-size: 16px;
                 font-weight: 600;
                 color: black;
             }

             .modal-controls {
                 display: flex;
                 gap: 6px;
             }

             .modal-btn {

  background: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.9);
  width: 26px;
  height: 26px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  border: none; /_ 明确设置为无边框 _/
  outline: none; /_ 移除焦点时的轮廓 _/

}

.modal-btn:hover {
background: rgba(0, 0, 0, 0.1);
color: white;
}

.close-btn:hover {
background: #d32f2f;
color: white;
}

            .modal-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #f5f7fa;
            }

            .toolbar {
                padding: 12px 16px;
                background: #ffffff;
                border-bottom: 1px solid #e1e5eb;
                display: flex;
                gap: 8px;
                flex-wrap: nowrap;
                align-items: center;
                overflow-x: auto;
                min-height: 60px;
            }

            .toolbar::-webkit-scrollbar {
                height: 4px;
            }

            .toolbar::-webkit-scrollbar-thumb {
                background: #d1d1d1;
                border-radius: 2px;
            }

            /* 搜索控件样式 */
            .search-container {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-left: 10px;
                flex-shrink: 0;
            }

            .search-type-select {
                padding: 6px 8px;
                border: 1px solid #d1d1d1;
                border-radius: 4px;
                background: white;
                font-size: 13px;
                color: #333;
                outline: none;
                min-width: 70px;
                flex-shrink: 0;
                height: 32px;
                box-sizing: border-box;
            }

            .search-type-select:focus {
                border-color: #1677FF;
            }

            .search-input {
                padding: 6px 10px;
                border: 1px solid #d1d1d1;
                border-radius: 4px;
                font-size: 13px;
                width: 140px;
                outline: none;
                transition: border-color 0.2s;
                flex-shrink: 0;
                height: 32px;
                box-sizing: border-box;
            }

            .search-input:focus {
                border-color: #1677FF;
            }

            .search-btn {
                padding: 6px;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
                flex-shrink: 0;
                height: 32px;
                width: 32px;
                box-sizing: border-box;
            }

            .search-btn:hover {
                background: #f0f4f8;
            }

            .expand-levels {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-left: auto;
                font-size: 13px;
                color: #666;
                flex-shrink: 0;
            }

            .expand-level-btn {
                padding: 4px 8px;
                font-size: 12px;
                min-width: 30px;
            }

            .toolbar-btn {
                padding: 6px 12px;
                border: 1px solid #d1d1d1;
                background: #ffffff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                color: #333333;
                transition: all 0.2s;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                white-space: nowrap;
                flex-shrink: 0;
            }

            .toolbar-btn:hover {
                background: #f0f4f8;
                border-color: #1677FF;
                color: #1677FF;
            }

            .toolbar-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: #f5f5f5;
                border-color: #d1d1d1;
                color: #999999;
            }


    		/* 基础按钮样式 */

.icon-button {
border: none;
background: none;
padding: 0;
margin: 0;
outline: none;
cursor: pointer;
display: inline-flex;
align-items: center;
justify-content: center;
transition: all 0.3s ease;
flex-shrink: 0;
}

/_ 悬停效果 _/
.icon-button:hover {
transform: scale(1.1);
}

/_ 激活效果 _/
.icon-button:active {
transform: scale(0.95);
}

/_ 禁用状态 _/
.icon-button:disabled {
cursor: not-allowed;
opacity: 0.6;
}

/_ 禁用状态下的 SVG 图标 - 变为灰色 _/
.icon-button:disabled svg {
filter:
grayscale(1)
brightness(0.7)
drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/_ 自定义 SVG 样式 _/
.icon-button svg {
width: 30px;
height: 30px;
filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
transition: filter 0.3s ease;
}

            .tree-container {
                flex: 1;
                overflow: auto;
                padding: 16px;
                background: #ffffff;
            }

            .tree {
                min-height: 100%;
            }

            .tree-node {
                margin: 3px 0;
                position: relative;
            }

            .tree-node-content {
                display: flex;
                align-items: center;
                padding: 0px 10px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                user-select: none;
                border: 1px solid transparent;
            }

            .tree-node-content:hover {
                background: #f0f4f8;
                border-color: #e1e5eb;
            }

            .tree-node-content.selected {
                background: #e3f2fd;
                border: 1px solid #1677FF;
            }

            .tree-node-content.dragging {
                opacity: 0.5;
                background: #bbdefb;
            }

            .tree-node-content.drop-target {
                background: #e8f5e8;
                border: 1px dashed #4caf50;
            }

            /* 搜索高亮样式 */
            .tree-node-content.search-match {
                background: #fff9e6;
                border: 1px solid #ffc53d;
            }

            .tree-node-content.search-match .node-name {
                color: #d46b08;
                font-weight: 600;
            }

            .node-icon {
                margin-right: 8px;
                font-size: 16px;
            }

            .node-expand {
                margin-right: 6px;
                cursor: pointer;
                width: 18px;
                text-align: center;
                font-size: 12px;
                color: #666666;
            }

            .node-name {
                flex: 1;
                padding: 4px 6px;
                border: 1px solid transparent;
                border-radius: 3px;
                min-height: 22px;
                color: #333333;
                font-size: 14px;
            }

            .node-name.editing {
                border-color: #1677FF;
                background: white;
                outline: none;
                color: #000000 !important;
            }

            .node-name.editing input {
                color: #000000 !important;
                background: white;
                border: none;
                outline: none;
                width: 100%;
                font-size: 14px;
                font-family: inherit;
            }

            .node-children {
                margin-left: 24px;
                display: block;
            }

            .node-children.collapsed {
                display: none;
            }

            .drag-ghost {
                position: absolute;
                background: #1677FF;
                color: white;
                padding: 6px 10px;
                border-radius: 4px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0.8;
                transform: rotate(3deg);
                font-size: 14px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }

            .modal-footer {
                padding: 14px 20px;
                background: #f8f9fa;
                border-top: 1px solid #e1e5eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .footer-btn {
                padding: 10px 24px;
                border: 1px solid;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
                min-width: 80px;
            }

            .cancel-btn {
                background: #ffffff;
                color: #666666;
                border-color: #d1d1d1;
            }

            .cancel-btn:hover {
                background: #f5f5f5;
                border-color: #999999;
            }

            .confirm-btn {
                background: #1677FF;
                color: white;
                border-color: #1677FF;
            }

            .confirm-btn:hover {
                background: #0d5cd6;
                border-color: #0d5cd6;
            }

            .empty-message {
                text-align: center;
                color: #999999;
                padding: 40px;
                font-style: italic;
                font-size: 14px;
            }

            /* 搜索结果统计 */
            .search-results-info {
                padding: 8px 16px;
                background: #f0f4f8;
                border-bottom: 1px solid #e1e5eb;
                font-size: 13px;
                color: #666;
                display: none;
            }

            .search-results-info.visible {
                display: block;
            }

        `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    return modal;

}

/\*\*

- 初始化模态框交互
  \*/
  function initModalInteractions(modal) {
  const content = modal.querySelector(".modal-content");
  const header = modal.querySelector(".modal-header");
  const minimizeBtn = modal.querySelector(".minimize-btn");
  const maximizeBtn = modal.querySelector(".maximize-btn");
  const closeBtn = modal.querySelector(".close-btn");
  const cancelBtn = modal.querySelector(".cancel-btn");
  const confirmBtn = modal.querySelector(".confirm-btn");
  const toggleRowFolderBtn = modal.querySelector("#toggle-row-folder-btn");

  let isDragging = false;
  let isMaximized = false;
  let isMinimized = false;
  let dragOffset = { x: 0, y: 0 };
  let currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;

  // 添加还原按钮事件
  const resetBtn = modal.querySelector("#reset-btn");
  resetBtn.addEventListener("click", () => {
  treeStructure = buildTreeStructureWithRowFolder(downloadConfig);
  NuTreeStructure = buildTreeStructureWithoutRowFolder(downloadConfig);
  currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;
  refreshTree();
  showToast("已还原默认树结构", "success");
  });

  // 初始化行标识按钮状态
  updateToggleRowFolderButton();

  // 切换行标识按钮事件
  toggleRowFolderBtn.addEventListener("click", () => {
  currentTreeType = !currentTreeType;
  currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;
  updateToggleRowFolderButton();
  refreshTree();
  });

  function updateToggleRowFolderButton() {
  toggleRowFolderBtn.innerHTML = `${
    currentTreeType
      ? '<svg t="1760600527572" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16994" width="20" height="20"><path d="M896 96c41.216 0 74.624 33.472 74.624 74.688v682.624c0 41.216-33.408 74.688-74.624 74.688H128a74.688 74.688 0 0 1-74.688-74.688V170.688C53.312 129.472 86.784 96 128 96h768zM117.312 853.312c0 5.888 4.8 10.688 10.688 10.688h138.624V373.312H117.312v480z m213.312 10.688H896a10.688 10.688 0 0 0 10.624-10.688v-480h-576V864z m-110.848-212.672a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 0 1 0-64h42.688l6.4 0.64z m0-170.688a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 1 1 0-64h42.688l6.4 0.64zM128 160a10.688 10.688 0 0 0-10.688 10.688v138.624h149.312V160H128z m202.624 149.312h576V170.688A10.688 10.688 0 0 0 896 160H330.624v149.312z" p-id="16995" fill="#1677FF"></path></svg>'
      : '<svg t="1760600527572" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16994" width="20" height="20"><path d="M896 96c41.216 0 74.624 33.472 74.624 74.688v682.624c0 41.216-33.408 74.688-74.624 74.688H128a74.688 74.688 0 0 1-74.688-74.688V170.688C53.312 129.472 86.784 96 128 96h768zM117.312 853.312c0 5.888 4.8 10.688 10.688 10.688h138.624V373.312H117.312v480z m213.312 10.688H896a10.688 10.688 0 0 0 10.624-10.688v-480h-576V864z m-110.848-212.672a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 0 1 0-64h42.688l6.4 0.64z m0-170.688a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 1 1 0-64h42.688l6.4 0.64zM128 160a10.688 10.688 0 0 0-10.688 10.688v138.624h149.312V160H128z m202.624 149.312h576V170.688A10.688 10.688 0 0 0 896 160H330.624v149.312z" p-id="16995" fill="#bfbfbf"></path></svg>'
  }`;
  // 移除内联样式的设置，让按钮保持默认样式
  toggleRowFolderBtn.style.backgroundColor = "";
  toggleRowFolderBtn.style.borderColor = "";
  toggleRowFolderBtn.style.color = "";
  }

  // 拖动功能
  header.addEventListener("mousedown", startDrag);

  function startDrag(e) {
  if (e.target.classList.contains("modal-btn")) return;

      isDragging = true;
      const rect = content.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", stopDrag);

  }

  function onDrag(e) {
  if (!isDragging) return;

      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;

      content.style.left = x + "px";
      content.style.top = y + "px";
      content.style.transform = "none";

  }

  function stopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  }

  // 最小化/最大化/关闭功能
  minimizeBtn.addEventListener("click", () => {
  isMinimized = !isMinimized;
  if (isMinimized) {
  content.classList.add("minimized");
  minimizeBtn.innerHTML = "❐";
  minimizeBtn.title = "还原";
  } else {
  content.classList.remove("minimized");
  minimizeBtn.innerHTML = "−";
  minimizeBtn.title = "最小化";
  }
  });

  maximizeBtn.addEventListener("click", () => {
  isMaximized = !isMaximized;
  if (isMaximized) {
  content.classList.add("maximized");
  maximizeBtn.innerHTML = "⧉";
  maximizeBtn.title = "还原";
  } else {
  content.classList.remove("maximized");
  maximizeBtn.innerHTML = "□";
  maximizeBtn.title = "最大化";
  }
  });

  closeBtn.addEventListener("click", () => {
  modal.remove();
  });

  cancelBtn.addEventListener("click", () => {
  modal.remove();
  });

  confirmBtn.addEventListener("click", () => {
  editTreeStructure = getEditedTreeStructure();
  console.log("编辑后的树结构:", editTreeStructure);
  modal.remove();

      showToast("树结构已保存，开始下载附件", "success");
      downloadWithEditedStructure(editTreeStructure, downloadConfig);

  });

  // 初始化可编辑树
  initEditableTree(currentTreeData);

  function refreshTree() {
  const treeContainer = document.getElementById("editable-tree");
  treeContainer.innerHTML = "";
  initEditableTree(currentTreeData);
  }

}

/\*\*

- 初始化可编辑树
  \*/
  function initEditableTree(treeData) {
  const treeContainer = document.getElementById("editable-tree");
  let selectedNode = null;
  let dragNode = null;
  let searchResults = [];
  let currentSearchIndex = -1;
  let isAllExpanded = false;

  // 渲染树
  renderTree(treeData.root, treeContainer);

  // 工具栏事件
  document.getElementById("add-folder-btn").addEventListener("click", () => {
  if (selectedNode) {
  addNewNode(selectedNode, "folder");
  } else {
  addNewNode(treeData.root, "folder");
  }
  });

  document.getElementById("delete-btn").addEventListener("click", () => {
  if (selectedNode && selectedNode.type !== "root") {
  deleteNode(selectedNode);
  } else {
  showToast("请选择要删除的节点", "warning");
  }
  });

  // 文件预览按钮事件
  const previewBtn = document.getElementById("preview-btn");
  previewBtn.addEventListener("click", () => {
  if (selectedNode && selectedNode.type === "file") {
  previewFile(selectedNode);
  }
  });

  // 合并展开/折叠按钮
  const toggleExpandBtn = document.getElementById("toggle-expand-btn");
  toggleExpandBtn.addEventListener("click", () => {
  isAllExpanded = !isAllExpanded;
  if (isAllExpanded) {
  expandAllNodes(treeData.root);
  toggleExpandBtn.textContent = "折叠";
  } else {
  collapseAllNodes(treeData.root);
  toggleExpandBtn.textContent = "展开";
  }
  refreshTree();
  });

  // 展开层级按钮事件
  document.querySelectorAll(".expand-level-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
  const level = parseInt(e.target.dataset.level);
  expandToLevel(treeData.root, level);
  refreshTree();
  showToast(`已展开到${level}级目录`, "success");
  });
  });

  // 搜索功能
  const searchTypeSelect = document.getElementById("search-type");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
  performSearch();
  }
  });

  function performSearch() {
  const searchType = searchTypeSelect.value;
  const keyword = searchInput.value.trim();

      if (!keyword) {
        showToast("请输入搜索关键词", "warning");
        return;
      }

      searchResults = [];
      currentSearchIndex = -1;

      // 递归搜索树
      function searchNodes(node) {
        if (node.type === "file") {
          let match = false;
          if (searchType === "filename") {
            // 按文件名搜索
            match = node.name.toLowerCase().includes(keyword.toLowerCase());
          } else if (searchType === "remark") {
            // 按备注搜索
            match =
              node.fileInfo &&
              node.fileInfo.asrRemark &&
              node.fileInfo.asrRemark
                .toLowerCase()
                .includes(keyword.toLowerCase());
          }

          if (match) {
            searchResults.push(node);
            // 展开文件路径上的所有父节点
            expandNodePath(node, treeData.root);
          }
        }

        if (node.children) {
          node.children.forEach((child) => {
            searchNodes(child);
          });
        }
      }

      searchNodes(treeData.root);

      if (searchResults.length === 0) {
        showToast(
          `未找到匹配的${searchType === "filename" ? "文件" : "备注"}`,
          "info"
        );
      } else {
        showToast(`找到 ${searchResults.length} 个匹配结果`, "success");
        highlightSearchResults();
        navigateToNextResult();
      }

  }

  /\*\*

  - 展开节点路径上的所有父节点
    \*/
    function expandNodePath(targetNode, rootNode) {
    const path = findNodePath(rootNode, targetNode);
    if (path) {
    path.forEach((node) => {
    if (node.type === "folder" || node.type === "root") {
    node.collapsed = false;
    }
    });
    }
    }

  /\*\*

  - 查找节点路径
    \*/
    function findNodePath(rootNode, targetNode, currentPath = []) {
    if (rootNode === targetNode) {
    return [...currentPath, rootNode];
    }

    if (rootNode.children) {
    for (const child of rootNode.children) {
    const path = findNodePath(child, targetNode, [
    ...currentPath,
    rootNode,
    ]);
    if (path) {
    return path;
    }
    }
    }

    return null;

  }

  function highlightSearchResults() {
  // 清除之前的高亮
  document
  .querySelectorAll(".tree-node-content.search-match")
  .forEach((el) => {
  el.classList.remove("search-match");
  });

      // 添加新的高亮
      searchResults.forEach((node) => {
        const nodeElement = document.querySelector(
          `[data-node-id="${node.id}"] .tree-node-content`
        );
        if (nodeElement) {
          nodeElement.classList.add("search-match");
        }
      });

      refreshTree();

  }

  function navigateToNextResult() {
  if (searchResults.length === 0) return;

      currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
      const currentNode = searchResults[currentSearchIndex];

      // 滚动到对应节点
      const nodeElement = document.querySelector(
        `[data-node-id="${currentNode.id}"] .tree-node-content`
      );
      if (nodeElement) {
        nodeElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 添加当前高亮
        document
          .querySelectorAll(".tree-node-content.search-match")
          .forEach((el) => {
            el.style.background = "#fff9e6";
          });
        nodeElement.style.background = "#ffd666";

        showToast(
          `第 ${currentSearchIndex + 1}/${searchResults.length} 个结果`,
          "info",
          1500
        );
      }

  }

  function renderTree(node, container, level = 0) {
  const nodeElement = createNodeElement(node, level);
  container.appendChild(nodeElement);

      if (node.children && node.children.length > 0 && !node.collapsed) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "node-children";

        node.children.forEach((child) => {
          renderTree(child, childrenContainer, level + 1);
        });

        nodeElement.appendChild(childrenContainer);
      }

  }

  function createNodeElement(node, level) {
  const nodeDiv = document.createElement("div");
  nodeDiv.className = "tree-node";
  nodeDiv.dataset.nodeId = node.id;

      const contentDiv = document.createElement("div");
      contentDiv.className = "tree-node-content";
      contentDiv.style.paddingLeft = level * 20 + "px";

      // 展开/折叠按钮（仅文件夹）
      if (node.type === "folder" || node.type === "root") {
        const expandBtn = document.createElement("span");
        expandBtn.className = "node-expand";
        expandBtn.innerHTML = node.collapsed ? "▶ " : "▼ ";
        expandBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleNode(node);
        });
        contentDiv.appendChild(expandBtn);
      } else {
        const spacer = document.createElement("span");
        spacer.className = "node-expand";
        spacer.style.width = "18px";
        contentDiv.appendChild(spacer);
      }

      // 节点图标
      const icon = document.createElement("span");
      icon.className = "node-icon";
      icon.innerHTML = getNodeIcon(node);
      contentDiv.appendChild(icon);

      // 节点名称（可编辑）
      const nameSpan = document.createElement("span");
      nameSpan.className = "node-name";

      // 如果是文件节点且有备注，显示备注信息
      if (node.type === "file" && node.fileInfo && node.fileInfo.asrRemark) {
        nameSpan.innerHTML = `${node.name} <span style="color: #999; font-size: 12px; margin-left: 8px;">${node.fileInfo.asrRemark}</span>`;
      } else {
        nameSpan.textContent = node.name;
      }

      nameSpan.addEventListener("dblclick", () => {
        makeNameEditable(nameSpan, node);
      });
      contentDiv.appendChild(nameSpan);

      // 点击选择
      contentDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        selectNode(node, contentDiv);
        updateToolbarState();
      });

      // 拖动功能
      contentDiv.draggable = true;
      contentDiv.addEventListener("dragstart", (e) => {
        dragNode = node;
        contentDiv.classList.add("dragging");
        e.dataTransfer.setData("text/plain", node.id);

        const ghost = contentDiv.cloneNode(true);
        ghost.classList.add("drag-ghost");
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);

        setTimeout(() => document.body.removeChild(ghost), 0);
      });

      contentDiv.addEventListener("dragend", () => {
        contentDiv.classList.remove("dragging");
        document.querySelectorAll(".tree-node-content").forEach((el) => {
          el.classList.remove("drop-target");
        });
        dragNode = null;
      });

      contentDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (dragNode && canDrop(dragNode, node)) {
          contentDiv.classList.add("drop-target");
        }
      });

      contentDiv.addEventListener("dragleave", () => {
        contentDiv.classList.remove("drop-target");
      });

      contentDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        contentDiv.classList.remove("drop-target");

        if (dragNode && canDrop(dragNode, node)) {
          moveNode(dragNode, node);
        }
      });

      nodeDiv.appendChild(contentDiv);
      return nodeDiv;

  }

  function getNodeIcon(node) {
  switch (node.type) {
  case "root":
  return '<svg t="1760581609068" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2020" width="20" height="20"><path d="M32 128a64 64 0 0 1 64-64h464.128a64 64 0 0 1 45.312 18.752L714.688 192H32V128zM32 256h896a64 64 0 0 1 64 64v544a64 64 0 0 1-64 64h-832a64 64 0 0 1-64-64V256zM192 672v64a32 32 0 0 0 64 0v-64a32 32 0 0 0-64 0z m192 0a32 32 0 0 0-64 0v64a32 32 0 0 0 64 0v-64z m64 0v64a32 32 0 0 0 64 0v-64a32 32 0 0 0-64 0z" fill="#FF9B29" p-id="2021"></path></svg>';
  case "folder":
  return node.collapsed
  ? '<svg t="1760581533162" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1798" width="20" height="20"><path d="M838.782362 1023.6801H183.627098A184.262418 184.262418 0 0 1 0.00448 838.138082V185.542018A184.262418 184.262418 0 0 1 183.627098 0h87.012808a77.223868 77.223868 0 0 1 48.624805 17.274602l113.244611 93.730709a74.536707 74.536707 0 0 0 47.985005 17.274602h358.288035a184.134458 184.134458 0 0 1 182.982818 185.542018v524.636051a184.134458 184.134458 0 0 1-182.982818 185.542018z" fill="#FFD05C" p-id="1799"></path><path d="M314.786111 442.549703h733.850671a104.41537 104.41537 0 0 1 95.97001 142.419494l-144.594814 372.427616a103.00781 103.00781 0 0 1-95.97001 66.219307H169.551497a104.09547 104.09547 0 0 1-95.97001-142.675414l145.234614-372.427616a103.77557 103.77557 0 0 1 95.97001-65.963387z m0 0" fill="#FCA235" p-id="1800"></path></svg>'
  : '<svg t="1760581533162" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1798" width="20" height="20"><path d="M838.782362 1023.6801H183.627098A184.262418 184.262418 0 0 1 0.00448 838.138082V185.542018A184.262418 184.262418 0 0 1 183.627098 0h87.012808a77.223868 77.223868 0 0 1 48.624805 17.274602l113.244611 93.730709a74.536707 74.536707 0 0 0 47.985005 17.274602h358.288035a184.134458 184.134458 0 0 1 182.982818 185.542018v524.636051a184.134458 184.134458 0 0 1-182.982818 185.542018z" fill="#FFD05C" p-id="1799"></path><path d="M314.786111 442.549703h733.850671a104.41537 104.41537 0 0 1 95.97001 142.419494l-144.594814 372.427616a103.00781 103.00781 0 0 1-95.97001 66.219307H169.551497a104.09547 104.09547 0 0 1-95.97001-142.675414l145.234614-372.427616a103.77557 103.77557 0 0 1 95.97001-65.963387z m0 0" fill="#FCA235" p-id="1800"></path></svg>';
  case "file":
  return '<svg t="1760581379829" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1579" width="20" height="20"><path d="M951.466667 1013.333333h-874.666667c-14.933333 0-27.733333-12.8-27.733333-27.733333V38.4c0-14.933333 12.8-27.733333 27.733333-27.733333h518.4c211.2 0 381.866667 170.666667 381.866667 381.866666v593.066667c0 14.933333-10.666667 27.733333-25.6 27.733333z" fill="#F7F7F7" p-id="1580"></path><path d="M951.466667 1024h-874.666667c-21.333333 0-38.4-17.066667-38.4-38.4V38.4C38.4 17.066667 55.466667 0 76.8 0h518.4c217.6 0 392.533333 177.066667 392.533333 392.533333v593.066667c2.133333 21.333333-17.066667 38.4-36.266666 38.4zM76.8 21.333333c-8.533333 0-14.933333 8.533333-14.933333 17.066667v947.2c0 8.533333 6.4 17.066667 17.066666 17.066667h872.533334c8.533333 0 17.066667-6.4 17.066666-17.066667V392.533333C966.4 187.733333 800 21.333333 595.2 21.333333H76.8z" fill="#E8E8E8" p-id="1581"></path><path d="M704 349.866667H330.666667c-10.666667 0-17.066667 8.533333-17.066667 17.066666v14.933334c0 10.666667 8.533333 17.066667 17.066667 17.066666H704c10.666667 0 17.066667-8.533333 17.066667-17.066666v-14.933334c0-8.533333-8.533333-17.066667-17.066667-17.066666zM654.933333 535.466667c8.533333 0 14.933333-6.4 14.933334-14.933334v-19.2c0-8.533333-6.4-14.933333-14.933334-14.933333H369.066667c-8.533333 0-14.933333 6.4-14.933334 14.933333v19.2c0 8.533333 6.4 14.933333 14.933334 14.933334h285.866666zM704 616.533333H328.533333c-10.666667 0-17.066667 8.533333-17.066666 17.066667v12.8c0 10.666667 8.533333 17.066667 17.066666 17.066667H704c10.666667 0 17.066667-8.533333 17.066667-17.066667v-12.8c0-10.666667-8.533333-17.066667-17.066667-17.066667z" fill="#6E6E6E" p-id="1582"></path></svg>';
  default:
  return '<svg t="1760581740715" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3085" width="20" height="20"><path d="M512 0C227.555556 0 0 227.555556 0 512s227.555556 512 512 512 512-227.555556 512-512-227.555556-512-512-512z m45.511111 853.333333c-17.066667 11.377778-28.444444 17.066667-51.2 17.066667-17.066667 0-34.133333-5.688889-51.2-17.066667-17.066667-11.377778-22.755556-28.444444-22.755555-51.2s5.688889-34.133333 22.755555-51.2c11.377778-11.377778 28.444444-22.755556 51.2-22.755555s34.133333 5.688889 51.2 22.755555c11.377778 11.377778 22.755556 28.444444 22.755556 51.2s-11.377778 39.822222-22.755556 51.2z m176.355556-443.733333c-11.377778 22.755556-22.755556 39.822222-39.822223 51.2-17.066667 17.066667-39.822222 39.822222-79.644444 73.955556l-28.444444 28.444444c-5.688889 5.688889-11.377778 17.066667-17.066667 22.755556v17.066666c0 5.688889-5.688889 17.066667-5.688889 34.133334-5.688889 34.133333-22.755556 51.2-56.888889 51.2-17.066667 0-28.444444-5.688889-39.822222-17.066667-11.377778-11.377778-17.066667-28.444444-17.066667-45.511111 0-28.444444 5.688889-51.2 11.377778-68.266667 5.688889-17.066667 17.066667-34.133333 34.133333-51.2 11.377778-17.066667 34.133333-34.133333 56.888889-51.2 22.755556-17.066667 34.133333-28.444444 45.511111-39.822222s17.066667-17.066667 22.755556-28.444445c5.688889-11.377778 11.377778-22.755556 11.377778-34.133333 0-22.755556-11.377778-45.511111-28.444445-62.577778-17.066667-17.066667-45.511111-28.444444-73.955555-28.444444-45.511111-11.377778-73.955556 0-85.333334 17.066667-17.066667 17.066667-34.133333 45.511111-45.511111 79.644444-11.377778 34.133333-28.444444 51.2-62.577778 51.2-17.066667 0-34.133333-5.688889-45.511111-17.066667-11.377778-11.377778-17.066667-28.444444-17.066666-39.822222 0-28.444444 11.377778-62.577778 28.444444-91.022222s45.511111-56.888889 85.333333-79.644445c39.822222-22.755556 79.644444-28.444444 130.844445-28.444444 45.511111 0 85.333333 5.688889 119.466667 22.755556 34.133333 17.066667 62.577778 39.822222 79.644444 68.266666 22.755556 28.444444 34.133333 62.577778 34.133333 96.711111 0 28.444444-5.688889 51.2-17.066666 68.266667z" fill="#FF7E11" p-id="3086"></path></svg>';
  }
  }

  function toggleNode(node) {
  node.collapsed = !node.collapsed;
  refreshTree();
  }

  function selectNode(node, element) {
  document.querySelectorAll(".tree-node-content.selected").forEach((el) => {
  el.classList.remove("selected");
  });

      element.classList.add("selected");
      selectedNode = node;
      updateToolbarState();

  }

  function makeNameEditable(element, node) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = node.name;
  input.style.cssText = `             color: #000000 !important;
            background: white;
            border: none;
            outline: none;
            width: 100%;
            font-size: 14px;
            font-family: inherit;
            padding: 0;
            margin: 0;
      `;

      const parent = element.parentNode;
      const wrapper = document.createElement("span");
      wrapper.className = "node-name editing";
      wrapper.appendChild(input);

      parent.replaceChild(wrapper, element);
      input.focus();
      input.select();

      function saveEdit() {
        const newName = input.value.trim();
        if (newName && newName !== node.name) {
          node.name = newName;
          refreshTree();
        } else {
          refreshTree();
        }
      }

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveEdit();
        }
      });

  }

  function addNewNode(parentNode, type) {
  if (type === "file" && parentNode.type === "file") {
  showToast("不能在文件下添加子节点", "error");
  return;
  }

      const newNode = {
        id: generateId(),
        name: type === "folder" ? "新建文件夹" : "新建文件",
        type: type,
        level: parentNode.level + 1,
        children: type === "folder" ? [] : undefined,
        fileCount: 0,
        collapsed: type === "folder",
      };

      if (!parentNode.children) {
        parentNode.children = [];
      }

      parentNode.children.push(newNode);
      if (parentNode.type === "folder" || parentNode.type === "root") {
        parentNode.collapsed = false;
      }

      refreshTree();
      showToast(`已添加${type === "folder" ? "文件夹" : "文件"}`, "success");

  }

  function deleteNode(node) {
  const parent = findParent(treeData.root, node);
  if (parent && parent.children) {
  const index = parent.children.indexOf(node);
  if (index > -1) {
  parent.children.splice(index, 1);
  selectedNode = null; // 确保在删除后立即清空选中状态
  refreshTree();
  updateToolbarState(); // 确保工具栏状态立即更新
  showToast("节点已删除", "success");
  }
  }
  }

  function canDrop(draggedNode, targetNode) {
  if (draggedNode === targetNode) return false;
  if (targetNode.type === "file") return false;
  if (isDescendant(draggedNode, targetNode)) return false;
  return true;
  }

  function moveNode(draggedNode, targetNode) {
  const oldParent = findParent(treeData.root, draggedNode);
  if (oldParent && oldParent.children) {
  const index = oldParent.children.indexOf(draggedNode);
  if (index > -1) {
  oldParent.children.splice(index, 1);

          if (!targetNode.children) {
            targetNode.children = [];
          }
          targetNode.children.push(draggedNode);

          updateNodeLevel(draggedNode, targetNode.level + 1);
          refreshTree();
          showToast("节点已移动", "success");
        }
      }

  }

  function updateNodeLevel(node, newLevel) {
  node.level = newLevel;
  if (node.children) {
  node.children.forEach((child) => {
  updateNodeLevel(child, newLevel + 1);
  });
  }
  }

  function isDescendant(parent, child) {
  if (!parent.children) return false;

      for (const node of parent.children) {
        if (node === child) return true;
        if (isDescendant(node, child)) return true;
      }

      return false;

  }

  function findParent(root, targetNode) {
  if (root.children) {
  for (const child of root.children) {
  if (child === targetNode) return root;
  const parent = findParent(child, targetNode);
  if (parent) return parent;
  }
  }
  return null;
  }

  function expandAllNodes(node) {
  node.collapsed = false;
  if (node.children) {
  node.children.forEach((child) => {
  expandAllNodes(child);
  });
  }
  }

  function collapseAllNodes(node) {
  if (node.type === "folder" || node.type === "root") {
  node.collapsed = true;
  }
  if (node.children) {
  node.children.forEach((child) => {
  collapseAllNodes(child);
  });
  }
  }

  /\*\*

  - 展开到指定层级
    \*/
    function expandToLevel(node, targetLevel, currentLevel = 0) {
    if (node.type === "folder" || node.type === "root") {
    node.collapsed = currentLevel >= targetLevel;

        if (node.children) {
          node.children.forEach((child) => {
            expandToLevel(child, targetLevel, currentLevel + 1);
          });
        }

    }
    }

  /\*\*

  - 文件预览功能
    \*/
    function previewFile(fileNode) {
    if (!fileNode || fileNode.type !== "file") {
    showToast("请选择有效的文件进行预览", "warning");
    return;
    }

    const fileInfo = fileNode.fileInfo;
    if (!fileInfo) {
    showToast("文件信息不完整，无法预览", "error");
    return;
    }

    // 确认预览
    $NG.confirm("确定打开预览？", {
    onOk: async () => {
    try {
    const openUrl =
    "https://ynnterp-mproject.cnyeig.com/JFileSrv/preview/fileSource";
    const title = fileInfo.asrName || "文件预览";

            // 构建预览参数
            const previewParams = {
              AppTitle: title,
              name: title,
              guid: fileInfo.asrSessionGuid || "",
              fid: fileInfo.asrFid || "",
              language: "zh-CN",
              dbToken: downloadConfig.dbToken || "0001",
              busTypeCode:
                fileInfo.bustypecode || downloadConfig.busType || "design_data",
              asrFill: "sys8", // 默认值
              orgId: downloadConfig.orgId || 1,
              wMDisabled: downloadConfig.wmDisabled || 0,
              billWM: downloadConfig.billWM || "",
              previewType: "scroll",
              pureWeb: 1,
            };

            console.log("文件预览参数:", previewParams);

            // 打开预览窗口
            $NG.open(openUrl, previewParams);

            showToast("正在打开文件预览...", "success");
          } catch (error) {
            console.error("文件预览失败:", error);
            showToast("文件预览打开失败: " + error.message, "error");
          }
        },
        onCancel: () => {
          showToast("已取消预览", "info");
        },

    });

  }

  function updateToolbarState() {
  const deleteBtn = document.getElementById("delete-btn");
  const addFolderBtn = document.getElementById("add-folder-btn");
  const previewBtn = document.getElementById("preview-btn");

      if (selectedNode) {
        // 根节点不能删除，其他节点可以删除
        deleteBtn.disabled = selectedNode.type === "root";

        // 只能在文件夹类型节点下添加新节点
        addFolderBtn.disabled = selectedNode.type === "file";

        // 只有文件节点可以预览
        previewBtn.disabled = selectedNode.type !== "file";

        console.log(
          "选中节点:",
          selectedNode.name,
          "删除按钮禁用:",
          deleteBtn.disabled,
          "预览按钮禁用:",
          previewBtn.disabled
        );
      } else {
        deleteBtn.disabled = true;
        addFolderBtn.disabled = false; // 没有选中节点时可以在根节点添加
        previewBtn.disabled = true;
        console.log("没有选中节点，删除按钮禁用");
      }

      // 更新按钮图标状态
      updateDeleteButtonIcon(deleteBtn);
      updatePreviewButtonIcon(previewBtn);

  }

  // 专门处理删除按钮图标状态
  function updateDeleteButtonIcon(deleteBtn) {
  if (deleteBtn.disabled) {
  // 禁用状态 - 灰色图标
  deleteBtn.innerHTML = `<svg t="1760601704642" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20160" width="20" height="20"><path d="M762.023564 733.556364l78.978327 78.959709 78.996945-78.978328a37.236364 37.236364 0 1 1 52.670837 52.670837l-79.015564 78.978327 79.015564 78.996946a37.236364 37.236364 0 0 1-52.670837 52.670836l-78.996945-79.015564-78.978327 79.015564a37.236364 37.236364 0 0 1-52.652219-52.670836l78.95971-78.996946-78.95971-78.978327a37.236364 37.236364 0 1 1 52.652219-52.670837zM800.581818 0a111.709091 111.709091 0 0 1 111.709091 111.709091v390.981818a37.236364 37.236364 0 1 1-72.927418-10.686836V130.327273a55.854545 55.854545 0 0 0-55.854546-55.854546H166.018327a55.854545 55.854545 0 0 0-55.761454 52.577746L110.163782 130.327273v744.727272a55.854545 55.854545 0 0 0 52.559127 55.761455l3.295418 0.093091h345.199709v0.986764a37.236364 37.236364 0 0 1 0 72.4992V1005.381818H148.945455a111.709091 111.709091 0 0 1-111.709091-111.709091V111.709091a111.709091 111.709091 0 0 1 111.709091-111.709091h651.636363zM577.163636 167.563636a111.709091 111.709091 0 1 1-80.989091 188.639419l-85.4016 49.282327a112.118691 112.118691 0 0 1 14.801455 84.1728l86.984145 50.213236a111.709091 111.709091 0 1 1-25.711709 49.654691l-86.667636-50.045673a111.709091 111.709091 0 1 1-32.395636-173.298036c0.949527-0.8192 2.048-1.545309 3.165091-2.196945l98.061963-56.617891A111.709091 111.709091 0 0 1 577.163636 167.563636z m18.618182 390.981819a55.854545 55.854545 0 1 0 0 111.70909 55.854545 55.854545 0 0 0 0-111.70909z m-279.272727-148.945455a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z m260.654545-186.181818a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z" fill="#1677FF" p-id="20161"></path></svg>`;
  } else {
  // 启用状态 - 彩色图标
  deleteBtn.innerHTML = `<svg t="1760597078657" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14537" width="20" height="20"><path d="M762.023564 733.556364l78.978327 78.959709 78.996945-78.978328a37.236364 37.236364 0 1 1 52.670837 52.670837l-79.015564 78.978327 79.015564 78.996946a37.236364 37.236364 0 0 1-52.670837 52.670836l-78.996945-79.015564-78.978327 79.015564a37.236364 37.236364 0 0 1-52.652219-52.670836l78.95971-78.996946-78.95971-78.978327a37.236364 37.236364 0 1 1 52.652219-52.670837zM800.581818 0a111.709091 111.709091 0 0 1 111.709091 111.709091v390.981818a37.236364 37.236364 0 1 1-72.927418-10.686836V130.327273a55.854545 55.854545 0 0 0-55.854546-55.854546H166.018327a55.854545 55.854545 0 0 0-55.761454 52.577746L110.163782 130.327273v744.727272a55.854545 55.854545 0 0 0 52.559127 55.761455l3.295418 0.093091h345.199709v0.986764a37.236364 37.236364 0 0 1 0 72.4992V1005.381818H148.945455a111.709091 111.709091 0 0 1-111.709091-111.709091V111.709091a111.709091 111.709091 0 0 1 111.709091-111.709091h651.636363zM577.163636 167.563636a111.709091 111.709091 0 1 1-80.989091 188.639419l-85.4016 49.282327a112.118691 112.118691 0 0 1 14.801455 84.1728l86.984145 50.213236a111.709091 111.709091 0 1 1-25.711709 49.654691l-86.667636-50.045673a111.709091 111.709091 0 1 1-32.395636-173.298036c0.949527-0.8192 2.048-1.545309 3.165091-2.196945l98.061963-56.617891A111.709091 111.709091 0 0 1 577.163636 167.563636z m18.618182 390.981819a55.854545 55.854545 0 1 0 0 111.70909 55.854545 55.854545 0 0 0 0-111.70909z m-279.272727-148.945455a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z m260.654545-186.181818a55.854545 55.854545 0 1 0 0 111.709091 55.854545 55.854545 0 0 0 0-111.709091z" fill="#1677FF" p-id="14538"></path></svg>`;
  }
  }

  // 专门处理预览按钮图标状态
  function updatePreviewButtonIcon(previewBtn) {
  if (previewBtn.disabled) {
  // 禁用状态 - 灰色图标
  previewBtn.innerHTML = `<svg t="1760665298888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3435" width="20" height="20"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#1677FF" p-id="3436"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#1677FF" p-id="3437"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#1677FF" p-id="3438"></path></svg>`;
  } else {
  // 启用状态 - 彩色图标
  previewBtn.innerHTML = `<svg t="1760665298888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3435" width="20" height="20"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#1677FF" p-id="3436"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#1677FF" p-id="3437"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#1677FF" p-id="3438"></path></svg>`;
  }
  }

  function refreshTree() {
  treeContainer.innerHTML = "";
  renderTree(treeData.root, treeContainer);
  updateToolbarState(); // 确保每次刷新树都更新工具栏状态

      // 如果选中的节点已经被删除，确保工具栏状态正确
      if (selectedNode && !nodeExists(treeData.root, selectedNode.id)) {
        selectedNode = null;
        updateToolbarState();
      }

  }

  // 添加辅助函数检查节点是否存在
  function nodeExists(root, nodeId) {
  if (root.id === nodeId) return true;
  if (root.children) {
  for (const child of root.children) {
  if (nodeExists(child, nodeId)) return true;
  }
  }
  return false;
  }

  // 初始工具栏状态
  updateToolbarState();

  // 默认展开到 2 级目录
  expandToLevel(treeData.root, 2);
  refreshTree();

}

/\*\*

- 获取编辑后的树结构
  \*/
  function getEditedTreeStructure() {
  return JSON.parse(
  JSON.stringify(currentTreeType ? treeStructure : NuTreeStructure)
  );
  }

/\*\*

- 引入 JSZip 库用于创建 ZIP 文件
  \*/
  function loadJSZip() {
  return new Promise((resolve, reject) => {
  if (typeof JSZip !== "undefined") {
  resolve(JSZip);
  return;
  }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.onload = () => resolve(JSZip);
      script.onerror = () => reject(new Error("Failed to load JSZip"));
      document.head.appendChild(script);

  });
  }

/\*\*

- 获取文件下载 URL
  \*/
  async function getFileDownloadUrl(asrFid, dataObject) {
  try {
  const response = await fetch("/JFileSrv/api/getDownloadUrlByAsrFids", {
  method: "POST",
  headers: {
  dbToken: dataObject.dbToken || "0001",
  "Content-Type": "application/json",
  },
  body: JSON.stringify({
  asrFids: [asrFid],
  loginId: dataObject.loginId || "3100000000000009",
  orgId: dataObject.orgId || "0",
  busTypeCode: dataObject.busTypeCode || "EFORM9000000080",
  wmDisabled: dataObject.wmDisabled || "1",
  billWM: dataObject.billWM || "YEIG",
  }),
  });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data && result.data[asrFid] ? result.data[asrFid] : null;

  } catch (error) {
  console.error("Failed to get download URL for asrFid:", asrFid, error);
  return null;
  }
  }

/\*\*

- 下载文件内容
  \*/
  async function downloadFileContent(downloadUrl) {
  try {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.blob();
  } catch (error) {
  console.error("Failed to download file content:", downloadUrl, error);
  return null;
  }
  }

/\*\*

- 根据编辑后的树结构创建 ZIP 文件
  \*/
  async function downloadWithEditedStructure(editedStructure, downloadConfig) {
  if (typeof JSZip === "undefined") {
  throw new Error("JSZip library not loaded");
  }

  console.log("开始使用编辑后的结构下载附件:", editedStructure);
  console.log("下载配置:", downloadConfig);

  const zip = new JSZip();
  let totalFiles = 0;
  let downloadedFiles = 0;

  // 创建文件映射，便于查找文件数据
  const fileMap = createFileMap(downloadConfig);

  // 递归构建 ZIP 结构
  async function buildZipStructure(node, parentFolder) {
  if (node.type === "folder" || node.type === "root") {
  const currentFolder =
  node.type === "root"
  ? parentFolder.folder(node.name)
  : parentFolder.folder(node.name);

        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            await buildZipStructure(child, currentFolder);
          }
        }
      } else if (node.type === "file") {
        totalFiles++;
        showToast(
          `正在下载文件 (${downloadedFiles + 1}/${totalFiles}): ${node.name}`,
          "info",
          2000
        );

        // 查找对应的文件数据
        const fileData = findFileData(node, fileMap);

        if (fileData && fileData.asrFid) {
          try {
            const downloadUrl = await getFileDownloadUrl(
              fileData.asrFid,
              downloadConfig
            );
            if (downloadUrl) {
              const fileContent = await downloadFileContent(downloadUrl);
              if (fileContent) {
                parentFolder.file(node.name, fileContent);
                downloadedFiles++;
                console.log(`文件下载完成: ${node.name}`);
              } else {
                console.warn(
                  `Failed to download content for file: ${node.name}`
                );
                parentFolder.file(node.name, "");
              }
            } else {
              console.warn(`Failed to get download URL for file: ${node.name}`);
              parentFolder.file(node.name, "");
            }
          } catch (error) {
            console.error(`下载文件失败 ${node.name}:`, error);
            parentFolder.file(node.name, "");
          }
        } else {
          console.warn(`未找到文件数据: ${node.name}`);
          parentFolder.file(node.name, "");
        }
      }

  }

  // 开始构建 ZIP
  await buildZipStructure(editedStructure.root, zip);

  // 生成并下载 ZIP 文件
  return zip.generateAsync({ type: "blob" }).then(function (content) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = editedStructure.root.name + ".zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

      showToast(`加载完成！总共 ${downloadedFiles} 个文件`, "success");
      return true;

  });

}

/\*\*

- 创建文件映射表
  \*/
  function createFileMap(downloadConfig) {
  const fileMap = {};

  // 处理主表单附件
  if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
  const mainAttachments =
  downloadConfig.mainAttachment[downloadConfig.mFormName];
  if (
  mainAttachments &&
  mainAttachments.data &&
  mainAttachments.data.attachmentRecordList
  ) {
  mainAttachments.data.attachmentRecordList.forEach((attachment) => {
  const fileName = decodeFileName(attachment.asrName);
  fileMap[fileName] = {
  asrFid: attachment.asrFid,
  asrName: attachment.asrName,
  typeName: attachment.typeName,
  asrRemark: attachment.asrRemark || "", // 添加备注信息
  };
  });
  }
  }

  // 处理分组表单附件
  if (downloadConfig.groupAttachments) {
  for (const formName in downloadConfig.groupAttachments) {
  const groupAttachments = downloadConfig.groupAttachments[formName];
  if (
  groupAttachments.data &&
  groupAttachments.data.attachmentRecordList
  ) {
  groupAttachments.data.attachmentRecordList.forEach((attachment) => {
  const fileName = decodeFileName(attachment.asrName);
  fileMap[fileName] = {
  asrFid: attachment.asrFid,
  asrName: attachment.asrName,
  typeName: attachment.typeName,
  asrRemark: attachment.asrRemark || "", // 添加备注信息
  };
  });
  }
  }
  }

  // 处理明细表单附件
  if (downloadConfig.detailAttachments) {
  for (const formName in downloadConfig.detailAttachments) {
  const detailAttachments = downloadConfig.detailAttachments[formName];
  if (Array.isArray(detailAttachments)) {
  detailAttachments.forEach((detailItem) => {
  if (
  detailItem.code === 200 &&
  detailItem.data &&
  detailItem.data.attachmentRecordList
  ) {
  detailItem.data.attachmentRecordList.forEach((attachment) => {
  const fileName = decodeFileName(attachment.asrName);
  fileMap[fileName] = {
  asrFid: attachment.asrFid,
  asrName: attachment.asrName,
  typeName: attachment.typeName,
  asrRemark: attachment.asrRemark || "", // 添加备注信息
  };
  });
  }
  });
  }
  }
  }

  console.log("文件映射表创建完成:", fileMap);
  return fileMap;

}

/\*\*

- 查找文件数据
  \*/
  function findFileData(fileNode, fileMap) {
  // 直接通过文件名查找
  if (fileMap[fileNode.name]) {
  return fileMap[fileNode.name];
  }

  // 如果文件节点有 fileInfo，直接使用
  if (fileNode.fileInfo) {
  return fileNode.fileInfo;
  }

  // 尝试通过解码后的文件名查找
  const decodedName = decodeFileName(fileNode.name);
  if (fileMap[decodedName]) {
  return fileMap[decodedName];
  }

  return null;

}

/\*\*

- 显示文件树编辑模态框
  \*/
  function showTreeEditModal() {
  const modal = createTreeEditModal();
  initModalInteractions(modal);
  }

/\*\*

- 解码 URL 编码的文件名
  \*/
  function decodeFileName(fileName) {
  try {
  return decodeURIComponent(fileName);
  } catch (e) {
  console.warn("文件名解码失败，使用原文件名:", fileName);
  return fileName;
  }
  }

/\*\*

- 创建可复用的提示框组件
  \*/
  function showToast(message, type = "info", duration = 3000) {
  // 移除已存在的提示框
  const existingToast = document.getElementById("custom-toast");
  if (existingToast) {
  existingToast.remove();
  }

  // 定义不同类型对应的样式
  const typeStyles = {
  info: {
  backgroundColor: "rgba(24, 144, 255, 0.9)",
  icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M507.297959 862.040816c-52.244898 0-102.922449-9.404082-151.510204-27.689796l-116.506122 25.6c-24.032653 5.22449-46.497959 0-60.604082-14.628571-14.628571-14.628571-19.853061-36.571429-14.628571-60.604082l17.240816-77.844898c-43.363265-57.469388-66.35102-122.77551-66.35102-190.693877C114.938776 320.783673 291.004082 161.959184 507.297959 161.959184c107.62449 0 208.457143 36.04898 283.689796 101.877551C867.265306 330.710204 909.061224 420.04898 909.061224 516.179592c0 190.693878-180.244898 345.861224-401.763265 345.861224z" fill="#7BD4EF"></path><path d="M512 581.485714c-38.138776 0-69.485714-31.346939-69.485714-69.485714s31.346939-69.485714 69.485714-69.485714 69.485714 31.346939 69.485714 69.485714-31.346939 69.485714-69.485714 69.485714zM710.530612 581.485714c-38.138776 0-69.485714-31.346939-69.485714-69.485714s31.346939-69.485714 69.485714-69.485714 69.485714 31.346939 69.485715 69.485714-31.346939 69.485714-69.485715 69.485714zM313.469388 581.485714c-38.138776 0-69.485714-31.346939-69.485715-69.485714s31.346939-69.485714 69.485715-69.485714 69.485714 31.346939 69.485714 69.485714-31.346939 69.485714-69.485714 69.485714z" fill="#278DCA"></path></svg>',
  },
  success: {
  backgroundColor: "rgba(82, 196, 26, 0.9)",
  icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m277.333333 279.466667l-341.333333 341.333333c-4.266667 6.4-12.8 8.533333-21.333333 8.533334s-17.066667-2.133333-23.466667-8.533334l-170.666667-170.666666c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l149.333334 147.2L746.666667 320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32-2.133334 44.8z" fill="#3BBC86"></path></svg>',
  },
  error: {
  backgroundColor: "rgba(245, 34, 45, 0.9)",
  icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m204.8 586.666667c12.8 10.666667 10.666667 32 0 44.8s-32 12.8-44.8 0L512 556.8l-160 160c-10.666667 12.8-32 12.8-44.8 0-12.8-10.666667-12.8-32 0-44.8l160-160-160-160c-12.8-10.666667-12.8-32 0-44.8 10.666667-12.8 32-12.8 44.8 0l160 160 160-162.133333c12.8-10.666667 34.133333-10.666667 44.8 2.133333 12.8 10.666667 12.8 32 0 44.8L556.8 512l160 160z" fill="#F25858"></path></svg>',
  },
  warning: {
  backgroundColor: "rgba(250, 173, 20, 0.9)",
  icon: '<svg viewBox="0 0 1217 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M1134.696569 1024H83.026578a83.026578 83.026578 0 0 1-83.026578-83.026578 79.705515 79.705515 0 0 1 3.597818-22.970687L0 913.297896 525.834995 55.356587h4.981595a82.694472 82.694472 0 0 1 156.089967 0H691.888152l490.963833 818.088551A83.026578 83.026578 0 0 1 1134.696569 1024z m-525.834995-110.702104a55.351052 55.351052 0 1 0-55.351052-55.351052 55.517105 55.517105 0 0 0 55.351052 55.351052z m0-636.5371a83.026578 83.026578 0 0 0-83.026579 83.026578l27.675527 304.430787a55.351052 55.351052 0 0 0 110.702104 0l27.675526-304.430787a83.026578 83.026578 0 0 0-83.026578-83.026578z" fill="#F4AA55"></path></svg>',
  },
  tip: {
  backgroundColor: "rgba(114, 46, 209, 0.9)",
  icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 0C231.131 0 0 231.131 0 512s231.131 512 512 512 512-231.131 512-512S792.869 0 512 0z m-51.2 219.429c0-8.778 5.851-14.629 14.629-14.629h73.142c8.778 0 14.629 5.851 14.629 14.629v73.142c0 8.778-5.851 14.629-14.629 14.629H475.43c-8.778 0-14.629-5.851-14.629-14.629V219.43zM614.4 804.57c0 8.778-7.314 14.629-14.629 14.629H475.43c-8.778 0-14.629-5.851-14.629-14.629V526.63c0-8.778-5.851-14.629-14.629-14.629H424.23c-7.315 0-14.629-5.851-14.629-14.629V424.23c0-8.778 7.314-14.629 14.629-14.629H548.57c8.778 0 14.629 5.851 14.629 14.629V702.17c0 8.778 5.851 14.629 14.629 14.629h21.942c7.315 0 14.629 5.851 14.629 14.629v73.142z" fill="#03A4FF"></path></svg>',
  },
  };

  // 获取对应类型的样式，如果类型不存在则使用默认的 info 样式
  const style = typeStyles[type] || typeStyles.info;

  // 创建提示框元素
  const toast = document.createElement("div");
  toast.id = "custom-toast";
  toast.style.cssText = `     position: fixed;
     top: 20%;
     left: 50%;
     transform: translateX(-50%) translateY(0);
     background-color: ${style.backgroundColor};
     color: white;
     padding: 16px 20px;
     border-radius: 8px;
     font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
     font-size: 14px;
     font-weight: 500;
     z-index: 1002;
     opacity: 1;
     transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
     box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
     display: flex;
     align-items: center;
     gap: 10px;
     min-width: 240px;
     max-width: 400px;
     word-break: break-word;
     line-height: 1.5;
     border-left: 4px solid rgba(255, 255, 255, 0.3);`;

  // 创建图标容器
  const iconContainer = document.createElement("div");
  iconContainer.style.cssText = `     display: flex;
     align-items: center;
     justify-content: center;
     width: 20px;
     height: 20px;
     flex-shrink: 0;`;
  iconContainer.innerHTML = style.icon;

  // 创建消息容器
  const messageContainer = document.createElement("div");
  messageContainer.style.cssText = `     flex: 1;
     display: flex;
     align-items: center;
     min-height: 20px;
     line-height: 1.4;`;
  messageContainer.textContent = message;

  // 组装元素
  toast.appendChild(iconContainer);
  toast.appendChild(messageContainer);

  // 添加到页面
  document.body.appendChild(toast);

  // 强制重绘，确保动画能正常触发
  toast.offsetHeight;

  // 设置定时器，在指定时间后开始消失动画
  setTimeout(() => {
  toast.style.opacity = "0";
  toast.style.transform = "translateX(-50%) translateY(-40px)";

       // 动画结束后移除元素
       setTimeout(() => {
         if (toast.parentNode) {
           toast.parentNode.removeChild(toast);
         }
       }, 500);

  }, duration);

}

// 统一的附件信息获取函数
async function fetchAttachmentInfo(url, description) {
try {
const response = await $NG.request.get({
url: url,
headers: { dbToken: "0001" },
});

      if (response && response.code === 200) {
        console.log(`${description}获取成功:`, response);
        return response;
      } else {
        console.warn(`${description}响应码非200:`, response);
        return null;
      }
    } catch (error) {
      console.error(`获取${description}失败:`, error);
      return null;
    }

}

// 获取明细附件信息
async function fetchDetailAttachments(dGuids, description = "明细附件") {
if (!dGuids || dGuids.length === 0) {
console.log(`没有dGuids可获取${description}`);
return [];
}

    const detailPromises = dGuids.map(async (dGuid) => {
      const url = `/JFileSrv/reactAttach/tableAttachInit?asrSessionGuid=${dGuid}&busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;

      try {
        const response = await fetchAttachmentInfo(
          url,
          `${description}-dGuid:${dGuid}`
        );
        return {
          dGuid: dGuid,
          response: response,
          success: !!response,
        };
      } catch (error) {
        return {
          dGuid: dGuid,
          response: null,
          success: false,
          error: error,
        };
      }
    });

    const detailResults = await Promise.all(detailPromises);
    const validDetails = detailResults
      .filter((item) => item.success && item.response)
      .map((item) => item.response);

    console.log(
      `${description}获取完成: 总共${dGuids.length}个, 有效${validDetails.length}个`
    );
    return validDetails;

}

// 检查是否有有效的附件数据
function hasValidAttachments(downloadConfig) {
let hasValid = false;

    // 检查主附件
    if (downloadConfig.mainAttachment) {
      for (const formName in downloadConfig.mainAttachment) {
        const mainAttach = downloadConfig.mainAttachment[formName];
        if (
          mainAttach &&
          mainAttach.data &&
          mainAttach.data.attachmentRecordList &&
          mainAttach.data.attachmentRecordList.length > 0
        ) {
          console.log(
            `主附件 ${formName} 有 ${mainAttach.data.attachmentRecordList.length} 个文件`
          );
          hasValid = true;
        }
      }
    }

    // 检查分组附件
    if (downloadConfig.groupAttachments) {
      for (const formName in downloadConfig.groupAttachments) {
        const groupAttach = downloadConfig.groupAttachments[formName];
        if (
          groupAttach &&
          groupAttach.data &&
          groupAttach.data.attachmentRecordList &&
          groupAttach.data.attachmentRecordList.length > 0
        ) {
          console.log(
            `分组附件 ${formName} 有 ${groupAttach.data.attachmentRecordList.length} 个文件`
          );
          hasValid = true;
        }
      }
    }

    // 检查明细附件
    if (downloadConfig.detailAttachments) {
      for (const formName in downloadConfig.detailAttachments) {
        const detailAttachArray = downloadConfig.detailAttachments[formName];
        if (Array.isArray(detailAttachArray)) {
          for (const detailAttach of detailAttachArray) {
            if (
              detailAttach &&
              detailAttach.data &&
              detailAttach.data.attachmentRecordList &&
              detailAttach.data.attachmentRecordList.length > 0
            ) {
              console.log(
                `明细附件 ${formName} 有 ${detailAttach.data.attachmentRecordList.length} 个文件`
              );
              hasValid = true;
            }
          }
        }
      }
    }

    console.log("附件有效性检查结果:", hasValid);
    return hasValid;

}

// 内部变量
let fromObj = {};
let attachmentData = {
mainAttachment: null,
groupAttachments: {},
detailAttachments: {},
};

// 主执行函数
async function mainExecution() {
try {
// 1. 首先获取基础表单附件信息
const params = {
phidValue: phidValue,
busType: cfg.busType,
tableName: cfg.tableName,
mainTableNames: [cfg.tableName],
};

      fromObj = await getFormAttachmentInfo(params);
      console.log("基础附件信息获取完成:", fromObj);

      // 2. 并行获取所有可能的附件信息，即使某些部分失败也继续
      const attachmentPromises = [];

      // 获取主附件信息
      if (fromObj.asrfill && fromObj.asrfillname && fromObj.asrtable) {
        attachmentPromises.push(
          (async () => {
            const mainUrl = `/JFileSrv/reactAttach/tableAttachInit?busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;
            attachmentData.mainAttachment = await fetchAttachmentInfo(
              mainUrl,
              "单据附件"
            );
          })()
        );
      }

      // 获取分组附件信息 - 使用配置的 sFormGroupKeys
      if (fromObj.mGuids && fromObj.mGuids.length > 0) {
        // 为每个分组附件分别获取信息
        const groupPromises = fromObj.mGuids.map(async (mGuidObj) => {
          const formName = mGuidObj.formName;
          const groupUrl = `/JFileSrv/reactAttach/tableAttachInit?asrSessionGuid=${mGuidObj.guid}&busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;
          const groupResponse = await fetchAttachmentInfo(
            groupUrl,
            `分组附件-${formName}`
          );
          if (groupResponse) {
            attachmentData.groupAttachments[formName] = groupResponse;
            console.log(
              `分组附件 ${formName} (字段: ${mGuidObj.fieldName}) 获取成功`
            );
          }
        });

        attachmentPromises.push(...groupPromises);
      }

      // 获取明细附件信息 - 使用配置的 dFormFormKeys
      if (fromObj.detailGuids && Object.keys(fromObj.detailGuids).length > 0) {
        // 为每个明细表分别获取附件信息
        for (const [formName, dGuids] of Object.entries(fromObj.detailGuids)) {
          if (dGuids && dGuids.length > 0) {
            attachmentPromises.push(
              (async () => {
                const detailAttachments = await fetchDetailAttachments(
                  dGuids,
                  `明细附件-${formName}`
                );
                if (detailAttachments.length > 0) {
                  attachmentData.detailAttachments[formName] =
                    detailAttachments;
                }
              })()
            );
          }
        }
      }

      // 等待所有附件获取完成
      if (attachmentPromises.length > 0) {
        await Promise.allSettled(attachmentPromises);
      }

      // 3. 构建完整的下载配置
      downloadConfig = {
        mainAttachment: { [cfg.mFormName]: attachmentData.mainAttachment },
        groupAttachments: attachmentData.groupAttachments,
        detailAttachments: attachmentData.detailAttachments,
        topLevelFolderName: `${cfg.FormName}`,
        downloadUrl: "JFileSrv/api/getDownloadUrlByAsrFids",
        dbToken: "0001",
        wmDisabled: "1",
        billWM: "YEIG",
        orgId: "0",
        mFormName: cfg.mFormName,
        sFormName: cfg.sFormName,
        dFormName: cfg.dFormName,
      };

      console.log("完整的下载配置:", downloadConfig);

      // 4. 构建两种树形结构
      treeStructure = buildTreeStructureWithRowFolder(downloadConfig);
      NuTreeStructure = buildTreeStructureWithoutRowFolder(downloadConfig);

      console.log("文件树编辑功能初始化完成");

      // 5. 加载JSZip
      await loadJSZip();
      console.log("JSZip加载完成");

      return {
        success: true,
        message: "附件下载管理器初始化完成",
        hasAttachments: hasValidAttachments(downloadConfig),
      };
    } catch (error) {
      console.error("主执行流程出错:", error);
      showToast("处理附件时发生错误: " + error.message, "error");
      return {
        success: false,
        message: "初始化失败: " + error.message,
        error: error,
      };
    }

}

// 公共方法 - 显示编辑模态框
function showAttachmentModal() {
if (!hasValidAttachments(downloadConfig)) {
console.warn("没有找到有效的附件数据");
$NG.alert("当前没有可下载的附件");
return false;
}

    showTreeEditModal();
    return true;

}

// 立即执行初始化
const initPromise = mainExecution();

// 返回公共接口
return {
// 初始化状态
init: initPromise,

    // 显示模态框
    showModal: showAttachmentModal,

    // 检查附件状态
    hasAttachments: () => hasValidAttachments(downloadConfig),

    // 获取配置信息
    getConfig: () => ({ ...downloadConfig }),

    // 重新初始化
    reinitialize: mainExecution,

};
}
