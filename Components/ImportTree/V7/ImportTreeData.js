class NewTreeStructureGenerator {
  /**
   * 优化的树形结构生成器
   * @param {Object} options 配置项
   * @param {string} options.buttonSelector 触发按钮的选择器，默认 '[originid="u_init_tree"]'
   * @param {string} options.sheetJSUrl SheetJS库地址
   * @param {string} options.gridId 目标网格ID
   * @param {Array} options.gridColumns 网格列定义，用于构建字段映射
   * @param {string} options.dialogTitle 导入对话框标题，默认 '导入模板数据并生成树形结构'
   * @param {boolean} options.defaultTreeMode 默认是否启用树结构模式，默认 true
   * @param {Object} options.style 自定义样式覆盖
   */
  constructor(options = {}) {
    this.options = {
      buttonSelector: '[originid="u_init_tree"]',
      sheetJSUrl:
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
      gridId: "inv_budget_d2",
      gridColumns: options.gridColumns || [], // 必须传入
      dialogTitle: "导入模板数据(含层级结构)",
      defaultTreeMode: true, // 默认是否启用树结构模式
      style: {}, // 保留给未来样式覆盖
      ...options,
    };

    this.fieldMapping = {};
    this.gridColumns = [];
    this.isInitialized = false;
    this.treeModeEnabled = this.options.defaultTreeMode; // 树模式开关状态

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

  // ================== 美化界面：可折叠面板 + 水平滚动 ==================
  showImportDialog(headers, data) {
    const overlay = this.createOverlay();
    const dialog = this.createDialog(this.options.dialogTitle);

    // ---------- 字段映射配置（可折叠，水平滚动）----------
    const mappingPanel = this.createCollapsiblePanel("字段映射配置", true);
    // 内容区域：水平滚动容器
    const mappingScrollContainer = document.createElement("div");
    mappingScrollContainer.style.cssText = `
      overflow-x: auto;
      overflow-y: visible;
      padding: 4px 0 8px 0;
      margin: 0 -4px;
      width: 100%;
    `;

    // 内部flex行，不换行，形成水平滚动
    const mappingRow = document.createElement("div");
    mappingRow.style.cssText = `
      display: flex;
      flex-wrap: nowrap;
      gap: 12px;
      min-width: min-content;
      padding: 0 4px;
    `;

    const mappableFields = this.getMappableFields();

    Object.keys(mappableFields).forEach((fieldName) => {
      const fieldConfig = mappableFields[fieldName];
      const fieldContainer = this.createFieldMapping(
        fieldConfig.label,
        headers,
        fieldName,
        fieldConfig.required,
      );
      // 每个字段项宽度调整为130px
      fieldContainer.style.flex = "0 0 auto";
      fieldContainer.style.width = "130px";
      fieldContainer.style.marginBottom = "0";
      mappingRow.appendChild(fieldContainer);
    });

    mappingScrollContainer.appendChild(mappingRow);
    mappingPanel.content.appendChild(mappingScrollContainer);
    dialog.appendChild(mappingPanel);

    // ---------- 层级配置（可折叠）----------
    const levelPanel = this.createCollapsiblePanel("层级配置", true);
    const levelRow = document.createElement("div");
    levelRow.style.cssText = `
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    `;

    // 1. 仿Ant Design风格开关组件 - 移除标签，直接放置开关
    const switchWrapper = document.createElement("div");
    switchWrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f5f5f5;
      padding: 6px 12px;
      border-radius: 30px;
      border: 1px solid #e8e8e8;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;

    // 创建仿Ant Design开关
    const antSwitch = this.createAntSwitch(this.treeModeEnabled);

    const switchLabel = document.createElement("span");
    switchLabel.textContent = this.treeModeEnabled ? "层级模式" : "平级模式";
    switchLabel.style.cssText = `
      font-size: 14px;
      color: #333;
      user-select: none;
      font-weight: 500;
      min-width: 70px;
      transition: color 0.2s;
    `;

    // 根据defaultTreeMode决定开关是否可点击
    if (!this.options.defaultTreeMode) {
      antSwitch.style.cursor = "not-allowed";
      antSwitch.style.opacity = "0.6";
      switchWrapper.style.opacity = "0.8";
    }

    switchWrapper.appendChild(antSwitch);
    switchWrapper.appendChild(switchLabel);
    levelRow.appendChild(switchWrapper);

    // 2. 选择层级字段容器
    const levelFieldContainer = document.createElement("div");
    levelFieldContainer.style.cssText = `
      flex: 1 1 250px;
      min-width: 200px;
    `;

    const levelFieldSelect = this.createSelect(headers, "请选择层级字段");
    levelFieldSelect.style.width = "100%";
    levelFieldSelect.style.padding = "8px 12px";
    levelFieldSelect.style.height = "38px";
    levelFieldSelect.style.fontSize = "14px";
    levelFieldSelect.style.borderRadius = "6px";
    levelFieldSelect.disabled = !this.treeModeEnabled;
    levelFieldContainer.appendChild(levelFieldSelect);
    levelRow.appendChild(levelFieldContainer);

    // 3. 分隔符输入容器
    const separatorContainer = document.createElement("div");
    separatorContainer.style.cssText = `
      flex: 1 1 200px;
      min-width: 150px;
      position: relative;
    `;

    const separatorInput = this.createInput(".", "例如: .");
    separatorInput.style.width = "100%";
    separatorInput.style.padding = "8px 12px";
    separatorInput.style.height = "38px";
    separatorInput.style.fontSize = "14px";
    separatorInput.style.borderRadius = "6px";
    separatorInput.style.boxSizing = "border-box";
    separatorInput.disabled = !this.treeModeEnabled;

    // 添加提示信息
    const tooltip = document.createElement("div");
    tooltip.className = "separator-tooltip";
    tooltip.textContent = "层级分隔符，用于分割不同层级的标识，如：. 或 - 或 /";
    tooltip.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.75);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      margin-bottom: 8px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;

    // 添加小箭头
    const arrow = document.createElement("div");
    arrow.style.cssText = `
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background: rgba(0, 0, 0, 0.75);
    `;
    tooltip.appendChild(arrow);

    separatorContainer.appendChild(separatorInput);
    separatorContainer.appendChild(tooltip);

    // 鼠标悬停显示提示
    separatorInput.addEventListener("mouseenter", () => {
      if (!separatorInput.disabled) {
        tooltip.style.opacity = "1";
      }
    });

    separatorInput.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    levelRow.appendChild(separatorContainer);

    levelPanel.content.appendChild(levelRow);
    dialog.appendChild(levelPanel);

    // 开关切换事件 - 修复状态变化
    const toggleSwitch = (enabled) => {
      this.treeModeEnabled = enabled;

      // 更新开关样式 - 按钮变色，文字不变
      if (enabled) {
        antSwitch.style.backgroundColor = "#1890ff";
        antSwitch.querySelector(".new-tree-switch-handle").style.transform =
          "translateX(22px)";
        switchLabel.textContent = "层级模式";
        switchLabel.style.color = "#333";
      } else {
        antSwitch.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
        antSwitch.querySelector(".new-tree-switch-handle").style.transform =
          "translateX(2px)";
        switchLabel.textContent = "平级模式";
        switchLabel.style.color = "#333";
      }

      // 控制层级字段和分隔符的禁用状态
      levelFieldSelect.disabled = !enabled;
      separatorInput.disabled = !enabled;

      // 视觉反馈 - 禁用时降低透明度
      [levelFieldSelect, separatorInput].forEach((el) => {
        el.style.opacity = enabled ? "1" : "0.5";
        el.style.backgroundColor = enabled ? "white" : "#f5f5f5";
        el.style.cursor = enabled ? "pointer" : "not-allowed";
      });
    };

    // 点击开关切换（只有在defaultTreeMode为true时才允许切换）
    antSwitch.addEventListener("click", (e) => {
      if (!this.options.defaultTreeMode) {
        e.preventDefault();
        e.stopPropagation();
        this.showAlert(
          "当前配置已锁定为平级模式，如需启用层级模式请修改初始化参数",
        );
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      toggleSwitch(!this.treeModeEnabled);
    });

    // 初始化视觉状态
    toggleSwitch(this.treeModeEnabled);

    // 如果defaultTreeMode为false，添加禁用提示
    if (!this.options.defaultTreeMode) {
      const disabledTip = document.createElement("div");
      disabledTip.style.cssText = `
        font-size: 12px;
        color: #999;
        margin-left: 10px;
        font-style: italic;
      `;
      disabledTip.textContent = "(已锁定为平级模式)";
      switchWrapper.appendChild(disabledTip);
    }

    // ---------- 按钮区域 ----------
    const buttonContainer = this.createButtonContainer();

    const cancelBtn = this.createButton("取消", "secondary", () => {
      document.body.removeChild(overlay);
    });

    const confirmBtn = this.createButton("确认导入", "primary", () => {
      const fieldMappings = {};
      const mappingSelects = dialog.querySelectorAll(".field-mapping-select");
      let missingRequired = false;

      mappingSelects.forEach((select) => {
        const fieldName = select.getAttribute("data-field");
        const isRequired = select.getAttribute("data-required") === "true";
        fieldMappings[fieldName] = select.value;

        if (isRequired && (!select.value || select.value === "")) {
          this.showAlert(
            `请配置必填字段"${select.previousElementSibling.textContent}"的映射`,
          );
          missingRequired = true;
        }
      });

      if (missingRequired) return;

      // 根据开关状态决定是否需要层级配置
      if (this.treeModeEnabled) {
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
          this.importToGrid(treeData, true); // 树结构模式
          document.body.removeChild(overlay);
        } catch (error) {
          console.error("生成树形结构失败:", error);
          this.showAlert("生成失败: " + error.message);
        }
      } else {
        // 平级结构模式 - 直接导入平级数据
        try {
          const flatData = this.generateFlatData(data, fieldMappings);
          this.importToGrid(flatData, false); // 平级结构模式
          document.body.removeChild(overlay);
        } catch (error) {
          console.error("导入平级数据失败:", error);
          this.showAlert("导入失败: " + error.message);
        }
      }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    this.setupOverlayClose(overlay);
  }

  /**
   * 创建仿Ant Design风格的开关组件
   */
  createAntSwitch(checked = false) {
    const switchContainer = document.createElement("div");
    switchContainer.className = `new-tree-switch ${checked ? "new-tree-switch-checked" : ""}`;
    switchContainer.style.cssText = `
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;
      line-height: 22px;
      border-radius: 22px;
      background-color: ${checked ? "#1890ff" : "rgba(0, 0, 0, 0.25)"};
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `;

    const switchHandle = document.createElement("div");
    switchHandle.className = "new-tree-switch-handle";
    switchHandle.style.cssText = `
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      border-radius: 18px;
      background-color: white;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transform: ${checked ? "translateX(22px)" : "translateX(2px)"};
    `;

    switchContainer.appendChild(switchHandle);

    // 添加鼠标悬停效果
    switchContainer.addEventListener("mouseenter", () => {
      if (!checked) {
        switchContainer.style.backgroundColor = "rgba(0, 0, 0, 0.35)";
      } else {
        switchContainer.style.backgroundColor = "#40a9ff";
      }
    });

    switchContainer.addEventListener("mouseleave", () => {
      if (!checked) {
        switchContainer.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
      } else {
        switchContainer.style.backgroundColor = "#1890ff";
      }
    });

    return switchContainer;
  }

  /**
   * 生成平级数据（非树结构）
   */
  generateFlatData(data, fieldMappings) {
    const headers = data[0];
    const rows = data.slice(1);
    const flatData = [];

    const fieldIndexes = {};
    Object.keys(fieldMappings).forEach((field) => {
      if (fieldMappings[field]) {
        fieldIndexes[field] = headers.indexOf(fieldMappings[field]);
      }
    });

    rows.forEach((row, index) => {
      const nodeData = {};

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

      // 添加唯一标识（可选）
      if (Object.keys(nodeData).length > 0) {
        flatData.push(nodeData);
      }
    });

    return flatData;
  }

  /**
   * 创建可折叠面板 - 使用○和●作为折叠图标
   * @param {string} title 标题
   * @param {boolean} expanded 默认是否展开
   */
  createCollapsiblePanel(title, expanded = true) {
    const panel = document.createElement("div");
    panel.style.cssText = `
      margin-bottom: 20px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    `;

    // 头部
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 12px 16px;
      background: #fafafa;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none;
      border-bottom: ${expanded ? "1px solid #e8e8e8" : "none"};
      transition: background 0.2s;
    `;
    header.addEventListener("mouseenter", () => {
      header.style.background = "#f0f0f0";
    });
    header.addEventListener("mouseleave", () => {
      header.style.background = "#fafafa";
    });

    // 箭头图标 - 改为○和●
    const arrow = document.createElement("span");
    arrow.innerHTML = expanded ? "●" : "○";
    arrow.style.cssText = `
      font-size: 14px;
      color: #1890ff;
      display: inline-block;
      width: 16px;
      text-align: center;
      transition: transform 0.2s;
    `;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;
    titleSpan.style.cssText = `
      font-weight: 600;
      color: #333;
      font-size: 15px;
    `;

    header.appendChild(arrow);
    header.appendChild(titleSpan);

    // 内容区域
    const content = document.createElement("div");
    content.style.cssText = `
      padding: ${expanded ? "16px" : "0"};
      max-height: ${expanded ? "none" : "0"};
      overflow: hidden;
      transition: padding 0.2s, max-height 0.2s;
    `;

    // 点击切换
    header.addEventListener("click", () => {
      const isNowExpanded =
        content.style.maxHeight !== "0px" && content.style.maxHeight !== "0";
      if (isNowExpanded) {
        // 折叠
        content.style.padding = "0";
        content.style.maxHeight = "0";
        arrow.innerHTML = "○";
        header.style.borderBottom = "none";
      } else {
        // 展开
        content.style.padding = "16px";
        content.style.maxHeight = "none";
        arrow.innerHTML = "●";
        header.style.borderBottom = "1px solid #e8e8e8";
      }
    });

    panel.appendChild(header);
    panel.appendChild(content);

    // 保存content引用方便外部添加
    panel.content = content;
    return panel;
  }

  createFieldMapping(labelText, headers, fieldName, isRequired = false) {
    const container = document.createElement("div");
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      background: #f9f9f9;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
    `;

    const label = document.createElement("label");
    label.textContent = isRequired ? `${labelText} *` : labelText;
    label.style.cssText = `
      margin-bottom: 6px;
      color: ${isRequired ? "#cf1322" : "#333"};
      font-weight: ${isRequired ? "600" : "500"};
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;

    const select = this.createSelect(headers, "请选择");
    select.className = "field-mapping-select";
    select.setAttribute("data-field", fieldName);
    select.setAttribute("data-required", isRequired);
    select.style.width = "100%";
    select.style.padding = "6px 8px";
    select.style.fontSize = "12px";
    select.style.borderRadius = "4px";
    select.style.height = "30px";

    container.appendChild(label);
    container.appendChild(select);

    return container;
  }

  // ================== 原有辅助方法（微调样式） ==================

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(3px);
      z-index: 888;
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
      padding: 28px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      z-index: 889;
      width: 850px;
      max-width: 95vw;
      max-height: 85vh;
      overflow-y: auto;
      border: 1px solid #e6f7ff;
    `;

    const titleEl = document.createElement("h3");
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 20px 0;
      color: #1890ff;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.5px;
    `;
    dialog.appendChild(titleEl);

    return dialog;
  }

  createSelect(headers, placeholder) {
    const select = document.createElement("select");
    select.style.cssText = `
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      transition: all 0.2s;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 14px;
      cursor: pointer;
      height: 38px;
      box-sizing: border-box;
    `;

    select.addEventListener("focus", () => {
      if (!select.disabled) {
        select.style.borderColor = "#1890ff";
        select.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)";
      }
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
      padding: 8px 12px;
      box-sizing: border-box;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s;
      height: 38px;
    `;

    input.addEventListener("focus", () => {
      if (!input.disabled) {
        input.style.borderColor = "#1890ff";
        input.style.boxShadow = "0 0 0 2px rgba(24, 144, 255, 0.2)";
      }
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
      padding: 8px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      border: none;
      font-weight: 500;
      height: 38px;
      min-width: 80px;
    `;

    if (type === "primary") {
      button.style.cssText =
        baseStyles +
        `
        background: #1890ff;
        color: white;
        box-shadow: 0 2px 6px rgba(24,144,255,0.3);
      `;
      button.addEventListener("mouseover", () => {
        button.style.background = "#40a9ff";
        button.style.boxShadow = "0 4px 10px rgba(24,144,255,0.4)";
      });
      button.addEventListener("mouseout", () => {
        button.style.background = "#1890ff";
        button.style.boxShadow = "0 2px 6px rgba(24,144,255,0.3)";
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
        button.style.background = "#f5f5f5";
      });
      button.addEventListener("mouseout", () => {
        button.style.borderColor = "#d9d9d9";
        button.style.color = "#666";
        button.style.background = "white";
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

  importToGrid(data, isTreeMode = true) {
    try {
      const D1_FORM = this.options.gridId;
      const dgrid = $NG.getCmpApi(D1_FORM);

      if (!dgrid) {
        throw new Error("未找到明细网格组件");
      }

      let importData = data;

      // 如果是树模式，转换为树结构
      if (isTreeMode) {
        importData = this.new_listToTree(data);
      }

      dgrid
        .addRows(importData)
        .then(() => {
          this.showAlert(
            `导入成功！${isTreeMode ? "(层级模式)" : "(平级模式)"}`,
          );
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
    // 创建自定义弹窗，确保显示在最上层
    if (typeof $NG !== "undefined" && $NG.alert) {
      $NG.alert(message);
    } else {
      // 创建自定义弹窗
      const alertOverlay = document.createElement("div");
      alertOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      const alertBox = document.createElement("div");
      alertBox.style.cssText = `
        background: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
        text-align: center;
        z-index: 1001;
        border: 1px solid #e6f7ff;
      `;

      const messageEl = document.createElement("p");
      messageEl.textContent = message;
      messageEl.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 14px;
        line-height: 1.5;
      `;

      const okButton = document.createElement("button");
      okButton.textContent = "确定";
      okButton.style.cssText = `
        padding: 6px 20px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      `;

      okButton.addEventListener("mouseover", () => {
        okButton.style.background = "#40a9ff";
      });

      okButton.addEventListener("mouseout", () => {
        okButton.style.background = "#1890ff";
      });

      okButton.addEventListener("click", () => {
        document.body.removeChild(alertOverlay);
      });

      alertBox.appendChild(messageEl);
      alertBox.appendChild(okButton);
      alertOverlay.appendChild(alertBox);

      // 点击遮罩层关闭
      alertOverlay.addEventListener("click", (e) => {
        if (e.target === alertOverlay) {
          document.body.removeChild(alertOverlay);
        }
      });

      document.body.appendChild(alertOverlay);
    }
  }
}

if (typeof window !== "undefined") {
  window.NewTreeStructureGenerator = NewTreeStructureGenerator;
}

if (typeof module !== "undefined") {
  module.exports = NewTreeStructureGenerator;
}
