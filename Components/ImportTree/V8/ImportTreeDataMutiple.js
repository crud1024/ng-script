class NewTreeStructureGenerator {
  /**
   * 优化的树形结构生成器 - 支持多Sheet导入
   * @param {Object} options 配置项
   * @param {string} options.buttonSelector 触发按钮的选择器，默认 '[originid="u_init_tree"]'
   * @param {string} options.sheetJSUrl SheetJS库地址
   * @param {Object} options.gridConfigs 多网格配置对象，key为sheet名称，value为网格配置
   * @param {string} options.defaultGridId 默认网格ID（当sheet名称匹配不到时使用）
   * @param {string} options.dialogTitle 导入对话框标题，默认 '导入模板数据并生成树形结构'
   * @param {boolean} options.defaultTreeMode 默认是否启用树结构模式，默认 true
   * @param {string} options.matchRule 字段匹配规则，默认 'fuzzy'
   * @param {string} options.matchPriority 匹配优先级，默认 'label'
   * @param {Array} options.levelFieldKeywords 层级字段匹配关键字数组
   * @param {Object} options.style 自定义样式覆盖
   * @param {Function} options.onBeforeImport 导入前事件
   * @param {Function} options.onAfterImport 导入后事件
   */
  constructor(options = {}) {
    this.options = {
      buttonSelector: '[originid="u_init_tree"]',
      sheetJSUrl:
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
      gridConfigs: options.gridConfigs || {}, // 多网格配置对象
      defaultGridId: options.defaultGridId || "",
      dialogTitle: "导入模板数据(含层级结构)",
      defaultTreeMode: true,
      matchRule: "fuzzy",
      matchPriority: "label",
      levelFieldKeywords: ["编码", "编号", "代码", "代号", "code", "no"],
      style: {},
      onBeforeImport: null,
      onAfterImport: null,
      ...options,
    };

    this.gridConfigs = this.options.gridConfigs;
    this.currentGridId = this.options.defaultGridId;
    this.currentGridColumns = [];
    this.currentIsTreeMode = this.options.defaultTreeMode;
    this.fieldMapping = {};
    this.isInitialized = false;
    this.treeModeEnabled = this.options.defaultTreeMode;
    this.activeTooltip = null;
    // 存储每个sheet的单独配置
    this.sheetConfigs = {};
    // 当前选中的sheet名称
    this.currentSheetName = "";

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
      this.initGridConfigs();
      this.bindInitTreeButton();
      this.isInitialized = true;
      console.log("NewTreeStructureGenerator 初始化完成", this.gridConfigs);
    } catch (error) {
      console.error("初始化失败:", error);
      this.showAlert("初始化失败: " + error.message);
    }
  }

  /**
   * 初始化网格配置，构建sheet名称到配置的映射
   */
  initGridConfigs() {
    if (this.gridConfigs && typeof this.gridConfigs === "object") {
      // 遍历配置对象，建立sheet名称到配置的映射
      Object.keys(this.gridConfigs).forEach((sheetName) => {
        const config = this.gridConfigs[sheetName];
        if (config && config.columns) {
          this.sheetConfigs[sheetName] = {
            gridId: config.id || config.bindtable || sheetName,
            columns: config.columns,
            isTree: config.isTree !== undefined ? config.isTree : true,
            desTitle: config.desTitle || config.panel?.title || sheetName,
          };
        }
      });

      // 设置默认网格ID
      const firstSheet = Object.keys(this.sheetConfigs)[0];
      if (firstSheet && !this.options.defaultGridId) {
        this.currentGridId = this.sheetConfigs[firstSheet].gridId;
        this.currentGridColumns = this.sheetConfigs[firstSheet].columns;
        this.currentIsTreeMode = this.sheetConfigs[firstSheet].isTree;
      }
    } else if (
      this.options.gridColumns &&
      this.options.gridColumns.length > 0
    ) {
      // 兼容旧的单网格模式
      this.sheetConfigs["default"] = {
        gridId: this.options.gridId,
        columns: this.options.gridColumns,
        isTree: this.options.defaultTreeMode,
        desTitle: this.options.dialogTitle,
      };
      this.currentGridId = this.options.gridId;
      this.currentGridColumns = this.options.gridColumns;
    } else {
      console.error("未提供有效的gridConfigs或gridColumns参数");
    }
  }

  /**
   * 根据sheet名称切换当前网格配置
   * @param {string} sheetName Excel sheet名称
   */
  switchGridConfig(sheetName) {
    // 尝试精确匹配
    if (this.sheetConfigs[sheetName]) {
      this.currentSheetName = sheetName;
      this.currentGridId = this.sheetConfigs[sheetName].gridId;
      this.currentGridColumns = this.sheetConfigs[sheetName].columns;
      this.currentIsTreeMode = this.sheetConfigs[sheetName].isTree;
      this.treeModeEnabled =
        this.currentIsTreeMode && this.options.defaultTreeMode;
      return true;
    }

    // 尝试模糊匹配：查找包含sheetName关键字的配置
    const lowerSheetName = sheetName.toLowerCase();
    for (const [key, config] of Object.entries(this.sheetConfigs)) {
      if (
        lowerSheetName.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(lowerSheetName)
      ) {
        this.currentSheetName = key;
        this.currentGridId = config.gridId;
        this.currentGridColumns = config.columns;
        this.currentIsTreeMode = config.isTree;
        this.treeModeEnabled =
          this.currentIsTreeMode && this.options.defaultTreeMode;
        return true;
      }
    }

    // 使用默认配置
    if (Object.keys(this.sheetConfigs).length > 0) {
      const defaultKey = Object.keys(this.sheetConfigs)[0];
      this.currentSheetName = defaultKey;
      this.currentGridId = this.sheetConfigs[defaultKey].gridId;
      this.currentGridColumns = this.sheetConfigs[defaultKey].columns;
      this.currentIsTreeMode = this.sheetConfigs[defaultKey].isTree;
      this.treeModeEnabled =
        this.currentIsTreeMode && this.options.defaultTreeMode;
      console.warn(
        `未找到sheet "${sheetName}" 的配置，使用默认配置: ${defaultKey}`,
      );
      return true;
    }

    return false;
  }

  /**
   * 获取所有可用的sheet配置名称列表（用于Sheet选择下拉框）
   */
  getAvailableSheetNames() {
    return Object.keys(this.sheetConfigs);
  }

  setGridColumns(columns) {
    if (columns && Array.isArray(columns) && columns.length > 0) {
      this.currentGridColumns = columns;
    }
    this.buildFieldMapping();
  }

  buildFieldMapping() {
    this.fieldMapping = {};

    if (!this.currentGridColumns || this.currentGridColumns.length === 0) {
      console.warn("currentGridColumns为空，无法构建字段映射");
      return;
    }

    const dataColumns = this.currentGridColumns.slice(1);

    dataColumns.forEach((column) => {
      if (column.editor && column.editor.name && column.dataIndex) {
        this.fieldMapping[column.editor.name] = {
          dataIndex: column.dataIndex,
          label: column.editor.label || column.header,
          fieldName: column.editor.name,
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
            fieldName: exNameField,
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

  getMatchStrings(fieldName) {
    const fieldConfig = this.fieldMapping[fieldName];
    const chineseLabel = fieldConfig?.label || "";
    const cleanFieldName = fieldName.replace(/^s_/, "");

    if (this.options.matchPriority === "label") {
      return [chineseLabel, cleanFieldName];
    } else {
      return [cleanFieldName, chineseLabel];
    }
  }

  matchFieldWithRule(fieldName, headers, rule) {
    if (!fieldName || !headers || headers.length === 0) return null;

    const fieldConfig = this.fieldMapping[fieldName];
    const matchStrings = this.getMatchStrings(fieldName);
    const primaryMatch = matchStrings[0];
    const secondaryMatch = matchStrings[1];

    const lowerHeaders = headers.map((h) => (h ? String(h).toLowerCase() : ""));

    switch (rule) {
      case "exact":
        for (let i = 0; i < headers.length; i++) {
          if (
            headers[i] &&
            String(headers[i]).toLowerCase() === primaryMatch.toLowerCase()
          ) {
            return headers[i];
          }
        }
        for (let i = 0; i < headers.length; i++) {
          if (
            headers[i] &&
            secondaryMatch &&
            String(headers[i]).toLowerCase() === secondaryMatch.toLowerCase()
          ) {
            return headers[i];
          }
        }
        break;

      case "prefix":
        for (let i = 0; i < headers.length; i++) {
          if (
            lowerHeaders[i] &&
            lowerHeaders[i].startsWith(primaryMatch.toLowerCase())
          ) {
            return headers[i];
          }
        }
        if (secondaryMatch) {
          for (let i = 0; i < headers.length; i++) {
            if (
              lowerHeaders[i] &&
              lowerHeaders[i].startsWith(secondaryMatch.toLowerCase())
            ) {
              return headers[i];
            }
          }
        }
        break;

      case "suffix":
        for (let i = 0; i < headers.length; i++) {
          if (
            lowerHeaders[i] &&
            lowerHeaders[i].endsWith(primaryMatch.toLowerCase())
          ) {
            return headers[i];
          }
        }
        if (secondaryMatch) {
          for (let i = 0; i < headers.length; i++) {
            if (
              lowerHeaders[i] &&
              lowerHeaders[i].endsWith(secondaryMatch.toLowerCase())
            ) {
              return headers[i];
            }
          }
        }
        break;

      case "chinese":
        const chinesePrimary = this.extractChinese(primaryMatch).toLowerCase();
        if (chinesePrimary) {
          for (let i = 0; i < headers.length; i++) {
            if (headers[i]) {
              const headerChinese = this.extractChinese(
                headers[i],
              ).toLowerCase();
              if (
                headerChinese &&
                (headerChinese.includes(chinesePrimary) ||
                  chinesePrimary.includes(headerChinese))
              ) {
                return headers[i];
              }
            }
          }
        }
        if (secondaryMatch) {
          const chineseSecondary =
            this.extractChinese(secondaryMatch).toLowerCase();
          if (chineseSecondary) {
            for (let i = 0; i < headers.length; i++) {
              if (headers[i]) {
                const headerChinese = this.extractChinese(
                  headers[i],
                ).toLowerCase();
                if (
                  headerChinese &&
                  (headerChinese.includes(chineseSecondary) ||
                    chineseSecondary.includes(headerChinese))
                ) {
                  return headers[i];
                }
              }
            }
          }
        }
        break;

      case "fuzzy":
      default:
        let bestMatch = null;
        let bestScore = 0;

        for (let i = 0; i < headers.length; i++) {
          if (!headers[i]) continue;

          const header = String(headers[i]);
          const lowerHeader = header.toLowerCase();
          let score = 0;

          if (lowerHeader === primaryMatch.toLowerCase()) {
            score = 100;
          } else if (
            secondaryMatch &&
            lowerHeader === secondaryMatch.toLowerCase()
          ) {
            score = 95;
          } else if (lowerHeader.includes(primaryMatch.toLowerCase())) {
            score = 85;
          } else if (
            secondaryMatch &&
            lowerHeader.includes(secondaryMatch.toLowerCase())
          ) {
            score = 75;
          } else {
            const headerChinese = this.extractChinese(header).toLowerCase();
            const primaryChinese =
              this.extractChinese(primaryMatch).toLowerCase();
            const secondaryChinese = secondaryMatch
              ? this.extractChinese(secondaryMatch).toLowerCase()
              : "";

            if (
              primaryChinese &&
              headerChinese &&
              (headerChinese.includes(primaryChinese) ||
                primaryChinese.includes(headerChinese))
            ) {
              score = 70;
            } else if (
              secondaryChinese &&
              headerChinese &&
              (headerChinese.includes(secondaryChinese) ||
                secondaryChinese.includes(headerChinese))
            ) {
              score = 60;
            } else {
              const cleanFieldName = fieldName.replace(/^s_/, "");
              const fieldParts = cleanFieldName.split("_");
              const headerParts = lowerHeader.split(/[_-\s]+/);
              let matchedParts = 0;
              fieldParts.forEach((part) => {
                if (
                  headerParts.some(
                    (hp) => hp.includes(part) || part.includes(hp),
                  )
                ) {
                  matchedParts++;
                }
              });
              if (matchedParts > 0) {
                score = Math.round((matchedParts / fieldParts.length) * 50);
              }
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = header;
          }
        }

        return bestScore >= 60 ? bestMatch : null;
    }

    return null;
  }

  extractChinese(str) {
    if (!str) return "";
    return String(str).replace(/[^\u4e00-\u9fa5]/g, "");
  }

  autoMatchFields(mappableFields, headers) {
    const matches = {};
    const rule = this.options.matchRule;

    Object.keys(mappableFields).forEach((fieldName) => {
      const matchedHeader = this.matchFieldWithRule(fieldName, headers, rule);
      if (matchedHeader) {
        matches[fieldName] = matchedHeader;
      }
    });

    return matches;
  }

  autoMatchLevelField(headers) {
    if (!headers || headers.length === 0) return null;

    const keywords = this.options.levelFieldKeywords;

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (!header) continue;

      const headerLower = String(header).toLowerCase();

      for (const keyword of keywords) {
        const keywordLower = String(keyword).toLowerCase();
        if (headerLower.includes(keywordLower)) {
          return header;
        }
      }
    }

    return null;
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

          // 获取所有sheet页信息
          const sheetsInfo = workbook.SheetNames.map((name) => ({
            name: name,
            data: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
              header: 1,
            }),
          }));

          this.showMultiSheetDialog(sheetsInfo, workbook);
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

  /**
   * 创建多Sheet选择对话框
   * @param {Array} sheetsInfo sheet信息数组
   * @param {Object} workbook Excel工作簿对象
   */
  showMultiSheetDialog(sheetsInfo, workbook) {
    const overlay = this.createOverlay();
    const dialog = this.createDialog("多Sheet数据导入");

    // Sheet选择区域
    const sheetSelectionPanel = this.createCollapsiblePanel(
      "Sheet页选择",
      true,
    );
    const sheetSelectContainer = document.createElement("div");
    sheetSelectContainer.style.cssText = `
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    `;

    // Sheet选择下拉框
    const sheetSelectWrapper = document.createElement("div");
    sheetSelectWrapper.style.cssText = `
      flex: 2;
      min-width: 200px;
    `;

    const sheetLabel = document.createElement("label");
    sheetLabel.textContent = "选择Sheet页:";
    sheetLabel.style.cssText = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
      font-size: 13px;
    `;

    const sheetSelect = document.createElement("select");
    sheetSelect.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    `;

    sheetsInfo.forEach((sheet, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${sheet.name} (${sheet.data.length - 1}行数据)`;
      if (index === 0) option.selected = true;
      sheetSelect.appendChild(option);
    });

    sheetSelectWrapper.appendChild(sheetLabel);
    sheetSelectWrapper.appendChild(sheetSelect);
    sheetSelectContainer.appendChild(sheetSelectWrapper);

    // 目标明细表选择（基于配置的sheet映射）
    const targetTableWrapper = document.createElement("div");
    targetTableWrapper.style.cssText = `
      flex: 2;
      min-width: 200px;
    `;

    const targetLabel = document.createElement("label");
    targetLabel.textContent = "目标明细表:";
    targetLabel.style.cssText = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
      font-size: 13px;
    `;

    const targetSelect = document.createElement("select");
    targetSelect.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    `;

    const availableSheets = this.getAvailableSheetNames();
    availableSheets.forEach((sheetConfigName) => {
      const option = document.createElement("option");
      option.value = sheetConfigName;
      const config = this.sheetConfigs[sheetConfigName];
      option.textContent = config.desTitle || sheetConfigName;
      targetSelect.appendChild(option);
    });

    targetTableWrapper.appendChild(targetLabel);
    targetTableWrapper.appendChild(targetSelect);
    sheetSelectContainer.appendChild(targetTableWrapper);

    sheetSelectionPanel.content.appendChild(sheetSelectContainer);
    dialog.appendChild(sheetSelectionPanel);

    // 当前选中的sheet数据存储
    let currentSheetData = sheetsInfo[0].data;
    let currentHeaders = currentSheetData[0] || [];

    // 更新当前配置
    this.updateConfigByTarget(targetSelect.value);

    // 字段映射配置面板容器（动态刷新）
    let mappingPanel = null;
    let rulePanel = null;
    let levelPanel = null;

    // 刷新整个对话框内容（除了sheet选择区域）
    const refreshDialogContent = () => {
      // 获取当前选中的sheet索引和数据
      const selectedIndex = parseInt(sheetSelect.value);
      const selectedSheet = sheetsInfo[selectedIndex];
      currentSheetData = selectedSheet.data;
      currentHeaders = currentSheetData[0] || [];

      // 更新当前配置
      this.updateConfigByTarget(targetSelect.value);

      // 重新构建字段映射
      this.buildFieldMapping();

      // 移除旧的配置面板（除了sheet选择面板）
      const panelsToRemove = [];
      dialog.childNodes.forEach((child) => {
        if (child !== sheetSelectionPanel && child !== dialog.firstChild) {
          panelsToRemove.push(child);
        }
      });
      panelsToRemove.forEach((panel) => {
        if (panel && panel.parentNode) {
          dialog.removeChild(panel);
        }
      });

      // 重新创建配置面板
      this.appendConfigPanels(
        dialog,
        currentHeaders,
        targetSelect,
        sheetSelect,
      );
    };

    // 监听sheet切换
    sheetSelect.addEventListener("change", () => {
      refreshDialogContent();
    });

    // 监听目标表切换
    targetSelect.addEventListener("change", () => {
      refreshDialogContent();
    });

    // 添加配置面板
    this.appendConfigPanels(dialog, currentHeaders, targetSelect, sheetSelect);

    // 按钮容器
    const buttonContainer = this.createButtonContainer();

    const cancelBtn = this.createButton("取消", "secondary", () => {
      if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
        document.body.removeChild(this.activeTooltip);
        this.activeTooltip = null;
      }
      document.body.removeChild(overlay);
    });

    const confirmBtn = this.createButton("确认导入", "primary", async () => {
      const selectedIndex = parseInt(sheetSelect.value);
      const selectedSheet = sheetsInfo[selectedIndex];
      const sheetName = selectedSheet.name;
      const sheetData = selectedSheet.data;
      const targetSheetName = targetSelect.value;

      await this.processSheetImport(
        sheetData,
        sheetName,
        targetSheetName,
        dialog,
        overlay,
      );
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    this.setupOverlayClose(overlay);
  }

  /**
   * 追加配置面板到对话框
   */
  appendConfigPanels(dialog, headers, targetSelect, sheetSelect) {
    // 自动匹配层级字段
    const autoMatchedLevelField = this.autoMatchLevelField(headers);

    // 匹配规则配置面板
    const rulePanel = this.createCollapsiblePanel("匹配规则配置", true);
    const ruleContent = this.createRuleConfigContent();
    rulePanel.content.appendChild(ruleContent);
    dialog.appendChild(rulePanel);

    // 字段映射配置面板
    const mappingPanel = this.createCollapsiblePanel("字段映射配置", true);
    const mappingContent = this.createFieldMappingContent(headers);
    mappingPanel.content.appendChild(mappingContent);
    dialog.appendChild(mappingPanel);

    // 层级配置面板
    const levelPanel = this.createCollapsiblePanel("层级配置", true);
    const levelContent = this.createLevelConfigContent(
      headers,
      autoMatchedLevelField,
    );
    levelPanel.content.appendChild(levelContent);
    dialog.appendChild(levelPanel);

    // 存储面板引用以便后续更新
    dialog._mappingPanel = mappingPanel;
    dialog._levelPanel = levelPanel;
    dialog._rulePanel = rulePanel;
  }

  /**
   * 创建匹配规则配置内容
   */
  createRuleConfigContent() {
    const ruleRow = document.createElement("div");
    ruleRow.style.cssText = `
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    `;

    const ruleContainer = document.createElement("div");
    ruleContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f5f5f5;
      padding: 8px 16px;
      border-radius: 30px;
      border: 1px solid #e8e8e8;
    `;

    const ruleLabel = document.createElement("span");
    ruleLabel.textContent = "匹配规则:";
    ruleLabel.style.cssText = `font-size: 14px; color: #666; font-weight: 500;`;

    const ruleSelect = document.createElement("select");
    ruleSelect.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 20px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      outline: none;
    `;

    const rules = [
      { value: "fuzzy", label: "模糊匹配" },
      { value: "exact", label: "完全匹配" },
      { value: "prefix", label: "前缀匹配" },
      { value: "suffix", label: "后缀匹配" },
      { value: "chinese", label: "汉字匹配" },
    ];

    rules.forEach((rule) => {
      const option = document.createElement("option");
      option.value = rule.value;
      option.textContent = rule.label;
      if (rule.value === this.options.matchRule) {
        option.selected = true;
      }
      ruleSelect.appendChild(option);
    });

    const priorityContainer = document.createElement("div");
    priorityContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f5f5f5;
      padding: 8px 16px;
      border-radius: 30px;
      border: 1px solid #e8e8e8;
    `;

    const priorityLabel = document.createElement("span");
    priorityLabel.textContent = "匹配优先级:";
    priorityLabel.style.cssText = `font-size: 14px; color: #666; font-weight: 500;`;

    const prioritySelect = document.createElement("select");
    prioritySelect.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 20px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      outline: none;
    `;

    const priorities = [
      { value: "label", label: "优先中文标签" },
      { value: "fieldName", label: "优先英文字段名" },
    ];

    priorities.forEach((priority) => {
      const option = document.createElement("option");
      option.value = priority.value;
      option.textContent = priority.label;
      if (priority.value === this.options.matchPriority) {
        option.selected = true;
      }
      prioritySelect.appendChild(option);
    });

    const autoMatchBtn = this.createButton("自动匹配", "secondary", () => {
      // 需要获取当前的headers，这里通过闭包外部传入
      if (this._currentHeadersForMatch) {
        const mappableFields = this.getMappableFields();
        const matches = this.autoMatchFields(
          mappableFields,
          this._currentHeadersForMatch,
        );

        const mappingPanel = document.querySelector(".field-mapping-container");
        if (mappingPanel) {
          Object.keys(matches).forEach((fieldName) => {
            const select = mappingPanel.querySelector(
              `.field-mapping-select[data-field="${fieldName}"]`,
            );
            if (select) {
              select.value = matches[fieldName];
            }
          });
        }
      }
    });

    ruleContainer.appendChild(ruleLabel);
    ruleContainer.appendChild(ruleSelect);
    priorityContainer.appendChild(priorityLabel);
    priorityContainer.appendChild(prioritySelect);
    ruleRow.appendChild(ruleContainer);
    ruleRow.appendChild(priorityContainer);
    ruleRow.appendChild(autoMatchBtn);

    // 存储以便外部调用
    this._currentRuleSelect = ruleSelect;
    this._currentPrioritySelect = prioritySelect;

    ruleSelect.addEventListener("change", () => {
      this.options.matchRule = ruleSelect.value;
    });

    prioritySelect.addEventListener("change", () => {
      this.options.matchPriority = prioritySelect.value;
    });

    return ruleRow;
  }

  /**
   * 创建字段映射配置内容
   */
  createFieldMappingContent(headers) {
    this._currentHeadersForMatch = headers;

    const mappingScrollContainer = document.createElement("div");
    mappingScrollContainer.className = "field-mapping-container";
    mappingScrollContainer.style.cssText = `
      overflow-x: auto;
      overflow-y: visible;
      padding: 4px 0 8px 0;
      margin: 0 -4px;
      width: 100%;
    `;

    const mappingRow = document.createElement("div");
    mappingRow.style.cssText = `
      display: flex;
      flex-wrap: nowrap;
      gap: 12px;
      min-width: min-content;
      padding: 0 4px;
    `;

    const mappableFields = this.getMappableFields();
    const autoMatches = this.autoMatchFields(mappableFields, headers);

    Object.keys(mappableFields).forEach((fieldName) => {
      const fieldConfig = mappableFields[fieldName];
      const fieldContainer = this.createFieldMapping(
        fieldConfig.label,
        headers,
        fieldName,
        fieldConfig.required,
        autoMatches[fieldName],
      );
      fieldContainer.style.flex = "0 0 auto";
      fieldContainer.style.width = "150px";
      fieldContainer.style.marginBottom = "0";
      mappingRow.appendChild(fieldContainer);
    });

    mappingScrollContainer.appendChild(mappingRow);
    return mappingScrollContainer;
  }

  /**
   * 创建层级配置内容
   */
  createLevelConfigContent(headers, autoMatchedLevelField) {
    const levelRow = document.createElement("div");
    levelRow.style.cssText = `
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    `;

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

    const antSwitch = this.createAntSwitch(
      this.treeModeEnabled && this.currentIsTreeMode,
    );

    const switchLabel = document.createElement("span");
    switchLabel.textContent =
      this.treeModeEnabled && this.currentIsTreeMode ? "层级模式" : "平级模式";
    switchLabel.style.cssText = `
      font-size: 14px;
      color: #333;
      user-select: none;
      font-weight: 500;
      min-width: 70px;
      transition: color 0.2s;
    `;

    if (!this.currentIsTreeMode || !this.options.defaultTreeMode) {
      antSwitch.style.cursor = "not-allowed";
      antSwitch.style.opacity = "0.6";
      switchWrapper.style.opacity = "0.8";
    }

    switchWrapper.appendChild(antSwitch);
    switchWrapper.appendChild(switchLabel);
    levelRow.appendChild(switchWrapper);

    const levelFieldContainer = document.createElement("div");
    levelFieldContainer.style.cssText = `
      flex: 1 1 250px;
      min-width: 200px;
    `;

    const levelFieldSelect = this.createSelect(
      headers,
      "请选择层级字段",
      autoMatchedLevelField,
    );
    levelFieldSelect.style.width = "100%";
    levelFieldSelect.style.padding = "8px 12px";
    levelFieldSelect.style.height = "38px";
    levelFieldSelect.style.fontSize = "14px";
    levelFieldSelect.style.borderRadius = "6px";
    levelFieldSelect.disabled = !(
      this.treeModeEnabled && this.currentIsTreeMode
    );

    if (
      autoMatchedLevelField &&
      this.treeModeEnabled &&
      this.currentIsTreeMode
    ) {
      levelFieldSelect.style.borderColor = "#52c41a";
      levelFieldSelect.style.backgroundColor = "#f6ffed";
    }

    levelFieldContainer.appendChild(levelFieldSelect);
    levelRow.appendChild(levelFieldContainer);

    const separatorContainer = document.createElement("div");
    separatorContainer.style.cssText = `
      flex: 1 1 200px;
      min-width: 150px;
    `;

    const separatorInput = this.createInput(".", "例如: . 或 - 或 /");
    separatorInput.style.width = "100%";
    separatorInput.style.padding = "8px 12px";
    separatorInput.style.height = "38px";
    separatorInput.style.fontSize = "14px";
    separatorInput.style.borderRadius = "6px";
    separatorInput.style.boxSizing = "border-box";
    separatorInput.disabled = !(this.treeModeEnabled && this.currentIsTreeMode);

    separatorInput.addEventListener("mouseenter", () => {
      if (!separatorInput.disabled) {
        this.createGlobalTooltip(
          "层级分隔符，用于分割不同层级的标识，如：. 或 - 或 /",
          separatorInput,
        );
      }
    });

    separatorInput.addEventListener("mouseleave", () => {
      if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
        document.body.removeChild(this.activeTooltip);
        this.activeTooltip = null;
      }
    });

    separatorContainer.appendChild(separatorInput);
    levelRow.appendChild(separatorContainer);

    const toggleSwitch = (enabled) => {
      const canEnable = enabled && this.currentIsTreeMode;
      this.treeModeEnabled = enabled;

      // 更新开关UI
      if (canEnable) {
        antSwitch.style.backgroundColor = "#1890ff";
        const handle = antSwitch.querySelector(".new-tree-switch-handle");
        if (handle) handle.style.transform = "translateX(22px)";
        switchLabel.textContent = "层级模式";
      } else {
        antSwitch.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
        const handle = antSwitch.querySelector(".new-tree-switch-handle");
        if (handle) handle.style.transform = "translateX(2px)";
        switchLabel.textContent = "平级模式";
      }

      // 更新表单禁用状态
      levelFieldSelect.disabled = !canEnable;
      separatorInput.disabled = !canEnable;

      [levelFieldSelect, separatorInput].forEach((el) => {
        el.style.opacity = canEnable ? "1" : "0.5";
        el.style.backgroundColor =
          canEnable && autoMatchedLevelField && el === levelFieldSelect
            ? "#f6ffed"
            : "white";
        el.style.cursor = canEnable ? "pointer" : "not-allowed";
      });
    };

    antSwitch.addEventListener("click", (e) => {
      if (!this.currentIsTreeMode || !this.options.defaultTreeMode) {
        e.preventDefault();
        e.stopPropagation();
        this.showAlert("当前明细表不支持层级模式，请切换其他明细表");
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      toggleSwitch(!this.treeModeEnabled);
    });

    toggleSwitch(this.treeModeEnabled && this.currentIsTreeMode);

    return levelRow;
  }

  /**
   * 更新当前配置（根据目标表）
   */
  updateConfigByTarget(targetSheetName) {
    if (this.sheetConfigs[targetSheetName]) {
      const config = this.sheetConfigs[targetSheetName];
      this.currentGridId = config.gridId;
      this.currentGridColumns = config.columns;
      this.currentIsTreeMode = config.isTree;
      this.treeModeEnabled =
        this.currentIsTreeMode && this.options.defaultTreeMode;
      this.buildFieldMapping();
    }
  }

  /**
   * 处理单个Sheet的导入
   */
  async processSheetImport(
    sheetData,
    sheetName,
    targetSheetName,
    dialog,
    overlay,
  ) {
    // 收集字段映射
    const fieldMappings = {};
    const mappingSelects = dialog.querySelectorAll(".field-mapping-select");
    let missingRequired = false;

    mappingSelects.forEach((select) => {
      const fieldName = select.getAttribute("data-field");
      const isRequired = select.getAttribute("data-required") === "true";
      fieldMappings[fieldName] = select.value;

      if (isRequired && (!select.value || select.value === "")) {
        this.showAlert(
          `请配置必填字段"${select.previousElementSibling?.textContent || fieldName}"的映射`,
        );
        missingRequired = true;
      }
    });

    if (missingRequired) return;

    const headers = sheetData[0];
    const rows = sheetData.slice(1);

    if (this.treeModeEnabled && this.currentIsTreeMode) {
      // 获取层级配置
      const levelPanel =
        dialog.querySelector(".new-tree-level-panel") || dialog._levelPanel;
      const levelFieldSelect =
        dialog.querySelector(".new-tree-level-select") ||
        (levelPanel ? levelPanel.querySelector("select") : null);
      const separatorInput =
        dialog.querySelector(".new-tree-separator-input") ||
        (levelPanel ? levelPanel.querySelector("input") : null);

      const levelField = levelFieldSelect ? levelFieldSelect.value : null;
      const separator = separatorInput ? separatorInput.value.trim() : null;

      if (!levelField || !separator) {
        this.showAlert("请填写完整的层级配置信息");
        return;
      }

      try {
        let parsedData = this.generateTreeData(
          [headers, ...rows],
          fieldMappings,
          levelField,
          separator,
        );

        if (typeof this.options.onBeforeImport === "function") {
          const hookResult = await this.options.onBeforeImport(
            parsedData,
            true,
            sheetName,
            targetSheetName,
          );
          if (hookResult === false) return;
          if (
            hookResult &&
            typeof hookResult === "object" &&
            Array.isArray(hookResult)
          ) {
            parsedData = hookResult;
          }
        }

        await this.importToGrid(parsedData, true, this.currentGridId);

        if (typeof this.options.onAfterImport === "function") {
          await this.options.onAfterImport(
            { success: true, message: "导入成功" },
            true,
            parsedData,
            sheetName,
            targetSheetName,
          );
        }

        if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
          document.body.removeChild(this.activeTooltip);
          this.activeTooltip = null;
        }
        document.body.removeChild(overlay);
      } catch (error) {
        console.error("生成树形结构失败:", error);
        if (typeof this.options.onAfterImport === "function") {
          await this.options.onAfterImport(
            { success: false, message: error.message },
            true,
            null,
            sheetName,
            targetSheetName,
          );
        }
        this.showAlert("生成失败: " + error.message);
      }
    } else {
      try {
        let parsedData = this.generateFlatData(
          [headers, ...rows],
          fieldMappings,
        );

        if (typeof this.options.onBeforeImport === "function") {
          const hookResult = await this.options.onBeforeImport(
            parsedData,
            false,
            sheetName,
            targetSheetName,
          );
          if (hookResult === false) return;
          if (
            hookResult &&
            typeof hookResult === "object" &&
            Array.isArray(hookResult)
          ) {
            parsedData = hookResult;
          }
        }

        await this.importToGrid(parsedData, false, this.currentGridId);

        if (typeof this.options.onAfterImport === "function") {
          await this.options.onAfterImport(
            { success: true, message: "导入成功" },
            false,
            parsedData,
            sheetName,
            targetSheetName,
          );
        }

        if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
          document.body.removeChild(this.activeTooltip);
          this.activeTooltip = null;
        }
        document.body.removeChild(overlay);
      } catch (error) {
        console.error("导入平级数据失败:", error);
        if (typeof this.options.onAfterImport === "function") {
          await this.options.onAfterImport(
            { success: false, message: error.message },
            false,
            null,
            sheetName,
            targetSheetName,
          );
        }
        this.showAlert("导入失败: " + error.message);
      }
    }
  }

  createGlobalTooltip(text, targetElement) {
    if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
      document.body.removeChild(this.activeTooltip);
    }

    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(2px);
      white-space: nowrap;
      letter-spacing: 0.3px;
      z-index: 10000;
      pointer-events: none;
      transition: opacity 0.2s;
    `;

    tooltip.textContent = text;

    const arrow = document.createElement("div");
    arrow.style.cssText = `
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background: rgba(0, 0, 0, 0.85);
      border-right: 1px solid rgba(255,255,255,0.1);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;
    tooltip.appendChild(arrow);

    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = { width: 200, height: 60 };

    tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;

    document.body.appendChild(tooltip);
    this.activeTooltip = tooltip;

    return tooltip;
  }

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

  createFieldMapping(
    labelText,
    headers,
    fieldName,
    isRequired = false,
    autoMatchValue = null,
  ) {
    const container = document.createElement("div");
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      background: #f9f9f9;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
      position: relative;
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

    const select = this.createSelect(headers, "请选择", autoMatchValue);
    select.className = "field-mapping-select";
    select.setAttribute("data-field", fieldName);
    select.setAttribute("data-required", isRequired);
    select.style.width = "100%";
    select.style.padding = "6px 8px";
    select.style.fontSize = "12px";
    select.style.borderRadius = "4px";
    select.style.height = "30px";

    if (autoMatchValue) {
      select.style.borderColor = "#52c41a";
      select.style.backgroundColor = "#f6ffed";

      const matchBadge = document.createElement("span");
      matchBadge.textContent = "✓";
      matchBadge.style.cssText = `
        position: absolute;
        top: -2px;
        right: -2px;
        background: #52c41a;
        color: white;
        font-size: 10px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      `;
      container.appendChild(matchBadge);
    }

    container.appendChild(label);
    container.appendChild(select);

    return container;
  }

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

      if (Object.keys(nodeData).length > 0) {
        flatData.push(nodeData);
      }
    });

    return flatData;
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

  async importToGrid(data, isTreeMode = true, gridId = null) {
    try {
      const targetGridId = gridId || this.currentGridId;
      const dgrid = $NG.getCmpApi(targetGridId);

      if (!dgrid) {
        throw new Error(`未找到明细网格组件: ${targetGridId}`);
      }

      let importData = data;

      if (isTreeMode) {
        importData = this.new_listToTree(data);
      }

      await dgrid.addRows(importData);

      this.showAlert(
        `导入成功！${isTreeMode ? "(层级模式)" : "(平级模式)"} - ${targetGridId}`,
      );
    } catch (error) {
      console.error("导入失败:", error);
      throw error;
    }
  }

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

    const content = document.createElement("div");
    content.style.cssText = `
      padding: ${expanded ? "16px" : "0"};
      max-height: ${expanded ? "none" : "0"};
      overflow: hidden;
      transition: padding 0.2s, max-height 0.2s;
    `;

    header.addEventListener("click", () => {
      const isNowExpanded =
        content.style.maxHeight !== "0px" && content.style.maxHeight !== "0";
      if (isNowExpanded) {
        content.style.padding = "0";
        content.style.maxHeight = "0";
        arrow.innerHTML = "○";
        header.style.borderBottom = "none";
      } else {
        content.style.padding = "16px";
        content.style.maxHeight = "none";
        arrow.innerHTML = "●";
        header.style.borderBottom = "1px solid #e8e8e8";
      }
    });

    panel.appendChild(header);
    panel.appendChild(content);

    panel.content = content;
    return panel;
  }

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
      z-index: 10000;
      width: 950px;
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

  createSelect(headers, placeholder, selectedValue = null) {
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
    emptyOption.selected = !selectedValue;
    select.appendChild(emptyOption);

    headers.forEach((header) => {
      if (header && header.trim() !== "") {
        const option = document.createElement("option");
        option.value = header;
        option.textContent = header;
        if (selectedValue && header === selectedValue) {
          option.selected = true;
        }
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
        if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
          document.body.removeChild(this.activeTooltip);
          this.activeTooltip = null;
        }
        document.body.removeChild(overlay);
      }
    });
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
