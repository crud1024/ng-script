class NewTreeStructureGenerator {
  constructor(options = {}) {
    this.options = {
      buttonSelector: '[originid="u_init_tree"]',
      sheetJSUrl:
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
      gridId: "inv_budget_d2",
      gridColumns: options.gridColumns || [], // 接收传入的gridColumns参数
      ...options,
    };

    this.fieldMapping = {};
    this.gridColumns = [];
    this.isInitialized = false;

    this.init();
  }

  async init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.initializeGenerator();
      });
    } else {
      await this.initializeGenerator();
    }
  }

  async initializeGenerator() {
    if (this.isInitialized) return;

    try {
      this.setGridColumns();
      this.bindInitTreeButton();
      this.isInitialized = true;
      console.log("NewTreeStructureGenerator 初始化完成");
    } catch (error) {
      console.error("初始化失败:", error);
      this.showAlert("初始化失败: " + error.message);
    }
  }

  setGridColumns() {
    if (
      this.options.gridColumns &&
      Array.isArray(this.options.gridColumns) &&
      this.options.gridColumns.length > 0
    ) {
      this.gridColumns = this.options.gridColumns;
    } else {
      console.error("未提供有效的gridColumns参数");
      this.gridColumns = [];
    }
    this.buildFieldMapping();
  }

  buildFieldMapping() {
    this.fieldMapping = {};

    if (!this.gridColumns || this.gridColumns.length === 0) {
      console.warn("gridColumns为空，无法构建字段映射");
      return;
    }

    const dataColumns = this.gridColumns.slice(1);

    dataColumns.forEach((column) => {
      if (column.editor && column.editor.name && column.dataIndex) {
        this.fieldMapping[column.editor.name] = {
          dataIndex: column.dataIndex,
          label: column.editor.label || column.header,
          fieldType: column.editor.xtype || "Input",
          required: column.editor.required || false,
          maxLength: column.editor.maxLength,
          hidden: column.hidden || false,
        };

        if (this.isFieldLikelyToHaveEXName(column.editor.name)) {
          const exNameField = `${column.editor.name}_EXName`;
          this.fieldMapping[exNameField] = {
            dataIndex: `${column.dataIndex}_EXName`,
            label: `${column.editor.label || column.header} (显示名称)`,
            fieldType: "Input",
            required: false,
            hidden: column.hidden || false,
          };
        }
      }
    });
  }

  getMappableFields() {
    const mappableFields = {};

    Object.keys(this.fieldMapping).forEach((fieldName) => {
      const fieldConfig = this.fieldMapping[fieldName];

      if (
        !fieldConfig.hidden &&
        fieldName !== "s_tree_id" &&
        fieldName !== "s_tree_pid" &&
        !fieldName.endsWith("_EXName")
      ) {
        mappableFields[fieldName] = fieldConfig;
      }
    });

    return mappableFields;
  }

  isFieldLikelyToHaveEXName(fieldName) {
    const exNameLikelyFields = [
      "s_person",
      "person",
      "s_user",
      "user",
      "s_employee",
      "employee",
      "s_dept",
      "dept",
      "s_department",
      "department",
      "s_supplier",
      "supplier",
      "s_customer",
      "customer",
    ];
    return exNameLikelyFields.some((pattern) =>
      fieldName.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  loadSheetJS(callback) {
    if (typeof XLSX !== "undefined") {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = this.options.sheetJSUrl;
    script.onload = callback;
    script.onerror = () => {
      this.showAlert("加载 SheetJS 库失败，请检查网络连接");
    };
    document.head.appendChild(script);
  }

  bindInitTreeButton() {
    const buttons = document.querySelectorAll(this.options.buttonSelector);
    if (buttons.length === 0) {
      console.warn(`未找到选择器为 "${this.options.buttonSelector}" 的按钮`);
      return;
    }

    buttons.forEach((button) => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener("click", async () => {
        if (!this.isInitialized) {
          await this.initializeGenerator();
        }

        this.loadSheetJS(() => {
          this.initTreeProcess();
        });
      });
    });
  }

  initTreeProcess() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xls,.xlsx,.csv";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) {
            this.showAlert("文件内容为空或格式不正确");
            return;
          }

          const headers = jsonData[0];
          this.showImportDialog(headers, jsonData);
        } catch (error) {
          console.error("解析 Excel 文件失败:", error);
          this.showAlert("解析 Excel 文件失败: " + error.message);
        }
      };

      reader.onerror = () => {
        this.showAlert("读取文件失败");
      };

      reader.readAsArrayBuffer(file);
    });

    fileInput.click();

    setTimeout(() => {
      if (document.body.contains(fileInput)) {
        document.body.removeChild(fileInput);
      }
    }, 1000);
  }

  showImportDialog(headers, data) {
    const overlay = this.createOverlay();
    const dialog = this.createDialog("导入模板数据并生成树形结构");

    // 字段映射配置 - 改为多列水平布局
    const mappingContainer = this.createFormGroup("字段映射配置：");
    mappingContainer.style.display = "flex";
    mappingContainer.style.flexWrap = "wrap";
    mappingContainer.style.gap = "16px";
    // 移除原有的 marginBottom，因为flex容器内不需要
    mappingContainer.querySelector("label").style.marginBottom = "12px"; // 保持标题样式
    mappingContainer.querySelector("label").style.width = "100%"; // 标题占满

    const mappableFields = this.getMappableFields();

    Object.keys(mappableFields).forEach((fieldName) => {
      const fieldConfig = mappableFields[fieldName];
      const fieldContainer = this.createFieldMapping(
        fieldConfig.label,
        headers,
        fieldName,
        fieldConfig.required,
      );
      // 设置字段项宽度：每行两个，减去gap
      fieldContainer.style.flex = "1 1 calc(50% - 16px)";
      fieldContainer.style.minWidth = "240px";
      mappingContainer.appendChild(fieldContainer);
    });

    dialog.appendChild(mappingContainer);

    // 层级配置（水平布局）
    const levelConfigContainer = this.createFormGroup("层级配置：");
    const levelRow = document.createElement("div");
    levelRow.style.cssText = `
                display: flex;
                gap: 20px;
                align-items: flex-start;
                margin-bottom: 0;
            `;

    const levelFieldContainer = this.createFormGroup("选择层级字段：");
    levelFieldContainer.style.marginBottom = "0";
    levelFieldContainer.style.flex = "1";
    const levelFieldSelect = this.createSelect(headers, "请选择层级字段");
    levelFieldContainer.appendChild(levelFieldSelect);
    levelRow.appendChild(levelFieldContainer);

    const separatorContainer = this.createFormGroup("输入层级分隔符：");
    separatorContainer.style.marginBottom = "0";
    separatorContainer.style.flex = "1";
    const separatorInput = this.createInput(".", "例如: .");
    separatorContainer.appendChild(separatorInput);
    levelRow.appendChild(separatorContainer);

    levelConfigContainer.appendChild(levelRow);
    dialog.appendChild(levelConfigContainer);

    const buttonContainer = this.createButtonContainer();

    const cancelBtn = this.createButton("取消", "secondary", () => {
      document.body.removeChild(overlay);
    });

    const confirmBtn = this.createButton("确认导入", "primary", () => {
      const fieldMappings = {};
      const mappingSelects = dialog.querySelectorAll(".field-mapping-select");
      mappingSelects.forEach((select) => {
        const fieldName = select.getAttribute("data-field");
        const isRequired = select.getAttribute("data-required") === "true";
        fieldMappings[fieldName] = select.value;

        if (isRequired && (!select.value || select.value === "")) {
          this.showAlert(
            `请配置必填字段"${select.previousElementSibling.textContent}"的映射`,
          );
          return;
        }
      });

      const levelField = levelFieldSelect.value;
      const separator = separatorInput.value.trim();

      if (!levelField || !separator) {
        this.showAlert("请填写完整的层级配置信息");
        return;
      }

      try {
        const treeData = this.generateTreeData(
          data,
          fieldMappings,
          levelField,
          separator,
        );
        this.importToGrid(treeData);
        document.body.removeChild(overlay);
      } catch (error) {
        console.error("生成树形结构失败:", error);
        this.showAlert("生成失败: " + error.message);
      }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    this.setupOverlayClose(overlay);
  }

  createFieldMapping(labelText, headers, fieldName, isRequired = false) {
    const container = document.createElement("div");
    container.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 0; /* 外边距由父容器的gap控制 */
            `;

    const label = document.createElement("label");
    label.textContent = isRequired ? `${labelText} *` : labelText;
    label.style.cssText = `
                width: 130px;
                margin-right: 8px;
                color: ${isRequired ? "#ff4d4f" : "#333"};
                font-weight: ${isRequired ? "600" : "500"};
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;

    const select = this.createSelect(headers, "请选择字段");
    select.className = "field-mapping-select";
    select.setAttribute("data-field", fieldName);
    select.setAttribute("data-required", isRequired);
    select.style.flex = "1";

    container.appendChild(label);
    container.appendChild(select);

    return container;
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.3);
                z-index: 999;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
    return overlay;
  }

  createDialog(title) {
    const dialog = document.createElement("div");
    dialog.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                z-index: 1000;
                width: 680px; /* 稍微加宽以容纳两列 */
                max-width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid #e6f7ff;
            `;

    const titleEl = document.createElement("h3");
    titleEl.textContent = title;
    titleEl.style.cssText = `
                margin: 0 0 24px 0;
                color: #1890ff;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
            `;
    dialog.appendChild(titleEl);

    return dialog;
  }

  createFormGroup(labelText) {
    const container = document.createElement("div");
    container.style.marginBottom = "20px";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.cssText = `
                display: block;
                margin-bottom: 12px;
                color: #333;
                font-weight: 600;
                font-size: 14px;
            `;

    container.appendChild(label);
    return container;
  }

  createSelect(headers, placeholder) {
    const select = document.createElement("select");
    select.style.cssText = `
                width: 100%;
                padding: 8px 10px;
                border: 1px solid #d9d9d9;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                transition: all 0.3s;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
                background-size: 12px;
            `;

    select.addEventListener("focus", () => {
      select.style.borderColor = "#1890ff";
      select.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)";
    });

    select.addEventListener("blur", () => {
      select.style.borderColor = "#d9d9d9";
      select.style.boxShadow = "none";
    });

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = placeholder;
    emptyOption.selected = true;
    select.appendChild(emptyOption);

    headers.forEach((header) => {
      if (header && header.trim() !== "") {
        const option = document.createElement("option");
        option.value = header;
        option.textContent = header;
        select.appendChild(option);
      }
    });

    return select;
  }

  createInput(value = "", placeholder = "") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.value = value;
    input.style.cssText = `
                width: 100%;
                padding: 8px 10px;
                box-sizing: border-box;
                border: 1px solid #d9d9d9;
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.3s;
            `;

    input.addEventListener("focus", () => {
      input.style.borderColor = "#1890ff";
      input.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)";
    });

    input.addEventListener("blur", () => {
      input.style.borderColor = "#d9d9d9";
      input.style.boxShadow = "none";
    });

    return input;
  }

  createButtonContainer() {
    const container = document.createElement("div");
    container.style.cssText = `
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #f0f0f0;
            `;
    return container;
  }

  createButton(text, type = "primary", onClick) {
    const button = document.createElement("button");
    button.textContent = text;

    const baseStyles = `
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
                border: none;
            `;

    if (type === "primary") {
      button.style.cssText =
        baseStyles +
        `
                    background: #1890ff;
                    color: white;
                `;
      button.addEventListener("mouseover", () => {
        button.style.background = "#40a9ff";
      });
      button.addEventListener("mouseout", () => {
        button.style.background = "#1890ff";
      });
    } else {
      button.style.cssText =
        baseStyles +
        `
                    border: 1px solid #d9d9d9;
                    background: white;
                    color: #666;
                `;
      button.addEventListener("mouseover", () => {
        button.style.borderColor = "#1890ff";
        button.style.color = "#1890ff";
      });
      button.addEventListener("mouseout", () => {
        button.style.borderColor = "#d9d9d9";
        button.style.color = "#666";
      });
    }

    button.onclick = onClick;
    return button;
  }

  setupOverlayClose(overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  generateTreeData(data, fieldMappings, levelField, separator) {
    const headers = data[0];
    const rows = data.slice(1);
    const treeMap = new Map();
    const treeData = [];

    const fieldIndexes = {};
    Object.keys(fieldMappings).forEach((field) => {
      if (fieldMappings[field]) {
        fieldIndexes[field] = headers.indexOf(fieldMappings[field]);
      }
    });

    const levelIndex = headers.indexOf(levelField);
    if (levelIndex === -1) throw new Error(`未找到层级字段: ${levelField}`);

    rows.forEach((row, index) => {
      const levelPath = row[levelIndex];
      if (!levelPath && levelPath !== 0) return;

      const levelPathStr = String(levelPath).trim();
      if (!levelPathStr) return;

      const parts = levelPathStr.split(separator);
      const currentLevel = parts.length;

      const treeId = this.new_generateTreeId();
      let treePid = "0";

      if (currentLevel > 1) {
        const parentPath = parts.slice(0, -1).join(separator);
        treePid = treeMap.get(parentPath) || "0";
      }

      const nodeData = {
        s_tree_id: treeId,
        s_tree_pid: treePid,
      };

      Object.keys(fieldIndexes).forEach((field) => {
        const excelIndex = fieldIndexes[field];
        if (excelIndex !== -1 && row[excelIndex] !== undefined) {
          const rawValue = row[excelIndex];
          const processedValues = this.processFieldValue(field, rawValue);
          Object.keys(processedValues).forEach((key) => {
            nodeData[key] = processedValues[key];
          });
        } else {
          nodeData[field] = "";
        }
      });

      treeData.push(nodeData);
      treeMap.set(levelPathStr, treeId);
    });

    return treeData;
  }

  processFieldValue(fieldName, rawValue) {
    const result = {};

    if (rawValue === null || rawValue === undefined || rawValue === "") {
      result[fieldName] = "";
      return result;
    }

    const stringValue = String(rawValue).trim();

    if (stringValue.includes("|") && stringValue.split("|").length === 2) {
      const [value, displayText] = stringValue.split("|");
      result[fieldName] = value.trim();
    } else if (
      stringValue.includes("|") &&
      stringValue.split("|").length === 3
    ) {
      const [mainValue, subValue, displayText] = stringValue.split("|");
      result[fieldName] = mainValue.trim();
      const exNameField = `${fieldName}_EXName`;
      result[exNameField] = displayText.trim();
    } else {
      result[fieldName] = stringValue;
    }

    return result;
  }

  new_generateTreeId() {
    const user = "sys8";
    const timestamp = Date.now().toString();
    const randomStr = this.new_generateRandomString(18);
    return user + timestamp + randomStr;
  }

  new_generateRandomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  new_listToTree(list, options = {}) {
    const {
      idKey = "s_tree_id",
      parentKey = "s_tree_pid",
      childrenKey = "children",
    } = options;

    const nodeMap = list.reduce((acc, node) => {
      acc[node[idKey]] = {
        ...node,
        [childrenKey]: [],
      };
      return acc;
    }, {});

    return list.reduce((tree, node) => {
      const currentNode = nodeMap[node[idKey]];
      const parentId = node[parentKey];

      if (parentId && nodeMap[parentId]) {
        nodeMap[parentId][childrenKey].push(currentNode);
      } else {
        tree.push(currentNode);
      }
      return tree;
    }, []);
  }

  importToGrid(treeData) {
    try {
      const D1_FORM = this.options.gridId;
      const dgrid = $NG.getCmpApi(D1_FORM);

      if (!dgrid) {
        throw new Error("未找到明细网格组件");
      }

      const treeStructure = this.new_listToTree(treeData);

      dgrid
        .addRows(treeStructure)
        .then(() => {
          this.showAlert("导入成功！");
        })
        .catch((error) => {
          console.error("导入失败:", error);
          this.showAlert("导入失败：" + error.message);
        });
    } catch (error) {
      console.error("导入数据到网格失败:", error);
      this.showAlert("导入失败：" + error.message);
    }
  }

  showAlert(message) {
    if (typeof $NG !== "undefined" && $NG.alert) {
      $NG.alert(message);
    } else {
      alert(message);
    }
  }
}

if (typeof window !== "undefined") {
  window.NewTreeStructureGenerator = NewTreeStructureGenerator;
}

if (typeof module !== "undefined") {
  module.exports = NewTreeStructureGenerator;
}
