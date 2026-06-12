class NewTreeStructureGenerator {
  constructor(options = {}) {
    this.options = {
      buttonSelector: '[originid="u_init_tree"]',
      sheetJSUrl:
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
      gridConfigs: options.gridConfigs || {},
      dialogTitle: "导入多Sheet数据（请分别配置各Sheet映射）",
      defaultTreeMode: true,
      matchRule: "fuzzy",
      matchPriority: "label",
      levelFieldKeywords: [
        "编码",
        "编号",
        "代码",
        "代号",
        "code",
        "no",
        "Code",
        "No",
        "CODE",
        "NO",
      ],
      enablePercentageConversion: false,
      style: {},
      onBeforeImport: null,
      onAfterImport: null,
      ...options,
    };

    this.gridConfigs = this.options.gridConfigs;
    this.sheetConfigs = {};
    this.isInitialized = false;
    this.activeTooltip = null;
    this.currentActiveTab = 0;
    this.sheetsInfoCache = null;
    this.tabHeaderCache = null;
    this.tabPanelsCache = {};

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
      console.log("NewTreeStructureGenerator 初始化完成", this.sheetConfigs);
    } catch (error) {
      console.error("初始化失败:", error);
      this.showAlert("初始化失败: " + error.message);
    }
  }

  initGridConfigs() {
    if (this.gridConfigs && typeof this.gridConfigs === "object") {
      Object.keys(this.gridConfigs).forEach((key) => {
        const config = this.gridConfigs[key];
        if (config && config.columns) {
          this.sheetConfigs[key] = {
            gridId: config.id || config.bindtable || key,
            columns: config.columns,
            isTree: config.isTree !== undefined ? config.isTree : true,
            desTitle: config.desTitle || config.panel?.title || key,
            matchPattern: config.matchPattern || "fuzzy",
          };
        }
      });
    } else {
      console.error("未提供有效的gridConfigs参数");
    }
  }

  getConfigForSheet(sheetName) {
    if (this.sheetConfigs[sheetName]) {
      return { configKey: sheetName, config: this.sheetConfigs[sheetName] };
    }

    const lowerSheetName = sheetName.toLowerCase();
    for (const [key, config] of Object.entries(this.sheetConfigs)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerSheetName.includes(lowerKey) ||
        lowerKey.includes(lowerSheetName)
      ) {
        return { configKey: key, config };
      }
    }

    const firstKey = Object.keys(this.sheetConfigs)[0];
    if (firstKey) {
      console.warn(
        `未找到sheet "${sheetName}" 的精确配置，使用默认配置: ${firstKey}`,
      );
      return { configKey: firstKey, config: this.sheetConfigs[firstKey] };
    }

    return null;
  }

  // 递归构建字段映射，支持分组列（g_开头的嵌套columns）
  buildFieldMappingForConfig(columns) {
    const fieldMapping = {};

    if (!columns || columns.length === 0) {
      return fieldMapping;
    }

    // 递归处理列定义
    const processColumns = (cols) => {
      cols.forEach((column) => {
        // 如果是分组列（有 columns 子数组），递归处理
        if (
          column.columns &&
          Array.isArray(column.columns) &&
          column.columns.length > 0
        ) {
          processColumns(column.columns);
          return;
        }

        // 处理普通字段列
        if (column.editor && column.editor.name && column.dataIndex) {
          fieldMapping[column.editor.name] = {
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
            fieldMapping[exNameField] = {
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
    };

    processColumns(columns);
    return fieldMapping;
  }

  getMappableFields(fieldMapping) {
    const mappableFields = {};

    Object.keys(fieldMapping).forEach((fieldName) => {
      const fieldConfig = fieldMapping[fieldName];
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

  getMatchStrings(fieldName, fieldMapping) {
    const fieldConfig = fieldMapping[fieldName];
    const chineseLabel = fieldConfig?.label || "";
    const cleanFieldName = fieldName.replace(/^s_/, "");

    if (this.options.matchPriority === "label") {
      return [chineseLabel, cleanFieldName];
    } else {
      return [cleanFieldName, chineseLabel];
    }
  }

  matchFieldWithRule(fieldName, headers, rule, fieldMapping) {
    if (!fieldName || !headers || headers.length === 0) return null;

    const matchStrings = this.getMatchStrings(fieldName, fieldMapping);
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

  autoMatchFields(mappableFields, headers, fieldMapping) {
    const matches = {};
    const rule = this.options.matchRule;
    Object.keys(mappableFields).forEach((fieldName) => {
      const matchedHeader = this.matchFieldWithRule(
        fieldName,
        headers,
        rule,
        fieldMapping,
      );
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

      const headerStr = String(header);
      const headerLower = headerStr.toLowerCase();

      for (const keyword of keywords) {
        const keywordLower = String(keyword).toLowerCase();
        if (headerLower.includes(keywordLower)) {
          return header;
        }
      }
    }

    return null;
  }

  /**
   * 检测Excel工作表中哪些列是百分比格式
   * 通过扫描单元格的 .z (number format) 属性判断
   * @param {Object} worksheet - XLSX worksheet 原始对象
   * @param {number} headerCount - 表头列数
   * @returns {Array<number>} 百分比格式列的索引数组
   */
  detectPercentageColumns(worksheet, headerCount) {
    const percentageColumns = [];
    if (!worksheet || !headerCount) return percentageColumns;

    // 扫描每个列的前N行数据，判断是否为百分比格式
    for (let col = 0; col < headerCount; col++) {
      let numericCount = 0;
      let percentageCount = 0;

      // 检查前30行数据（避免空行干扰，最多扫描100行）
      for (let row = 1; row <= Math.min(30, 100); row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];

        if (cell && cell.t === "n") {
          numericCount++;
          if (cell.z && cell.z.indexOf("%") !== -1) {
            percentageCount++;
          }
        }
      }

      // 如果该列存在百分比格式的数值单元格，且占比超过50%，判定为百分比列
      if (percentageCount > 0 && percentageCount >= numericCount * 0.5) {
        percentageColumns.push(col);
        console.log(
          `检测到百分比格式列: 列索引 ${col} (${percentageCount}/${numericCount} 个数值单元格为百分比格式)`,
        );
      }
    }

    return percentageColumns;
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
          const sheetsInfo = [];
          workbook.SheetNames.forEach((name) => {
            const worksheet = workbook.Sheets[name];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (jsonData.length >= 2) {
              // 检测百分比格式列
              const percentageColumns = this.detectPercentageColumns(
                worksheet,
                jsonData[0].length,
              );

              sheetsInfo.push({
                name: name,
                headers: jsonData[0],
                rows: jsonData.slice(1),
                totalRows: jsonData.length - 1,
                percentageColumns: percentageColumns,
              });
            }
          });
          if (sheetsInfo.length === 0) {
            this.showAlert("Excel文件中没有有效的数据");
            return;
          }
          this.sheetsInfoCache = sheetsInfo;
          this.showMultiSheetConfigDialog(sheetsInfo);
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

  showMultiSheetConfigDialog(sheetsInfo) {
    const overlay = this.createOverlay();
    const dialog = this.createDialog(this.options.dialogTitle);

    const globalConfigPanel = this.createGlobalConfigPanel(sheetsInfo);
    dialog.appendChild(globalConfigPanel);

    const tabHeader = this.createTabHeader(sheetsInfo);
    dialog.appendChild(tabHeader);
    this.tabHeaderCache = tabHeader;

    const tabContainer = this.createTabContainer();
    dialog.appendChild(tabContainer);

    this.tabPanelsCache = {};

    sheetsInfo.forEach((sheet, index) => {
      const panel = this.createSheetConfigPanel(sheet, index);
      this.tabPanelsCache[index] = panel;
      tabContainer.appendChild(panel);
      if (index === 0) {
        panel.style.display = "block";
      } else {
        panel.style.display = "none";
      }
    });

    const tabs = tabHeader.querySelectorAll(".tab-item");
    const updateTabStyles = (activeIndex) => {
      tabs.forEach((tab, idx) => {
        if (idx === activeIndex) {
          tab.style.background = "#1890ff";
          tab.style.color = "white";
          tab.classList.add("active");
        } else {
          tab.style.background = "transparent";
          tab.style.color = "#666";
          tab.classList.remove("active");
        }
      });
    };

    updateTabStyles(0);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateTabStyles(index);
        Object.keys(this.tabPanelsCache).forEach((key) => {
          this.tabPanelsCache[key].style.display =
            parseInt(key) === index ? "block" : "none";
        });
        this.currentActiveTab = index;
      });
    });

    const buttonContainer = this.createButtonContainer();
    const cancelBtn = this.createButton("取消", "secondary", () => {
      if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
        document.body.removeChild(this.activeTooltip);
        this.activeTooltip = null;
      }
      document.body.removeChild(overlay);
    });
    const confirmBtn = this.createButton(
      "确认导入全部",
      "primary",
      async () => {
        const allConfigs = [];
        let hasError = false;

        for (let i = 0; i < sheetsInfo.length; i++) {
          const sheet = sheetsInfo[i];
          const panel = this.tabPanelsCache[i];

          const fieldMappings = {};
          const mappingSelects = panel.querySelectorAll(
            ".field-mapping-select",
          );
          let missingRequired = false;

          mappingSelects.forEach((select) => {
            const fieldName = select.getAttribute("data-field");
            const isRequired = select.getAttribute("data-required") === "true";
            fieldMappings[fieldName] = select.value;
            if (isRequired && (!select.value || select.value === "")) {
              this.showAlert(
                `Sheet "${sheet.name}" 请配置必填字段"${select.getAttribute("data-label")}"的映射`,
              );
              missingRequired = true;
            }
          });

          if (missingRequired) {
            hasError = true;
            break;
          }

          const switchCheckbox = panel.querySelector(".tree-mode-switch");
          const treeModeEnabled = switchCheckbox
            ? switchCheckbox.checked
            : false;

          const levelFieldSelect = panel.querySelector(".level-field-select");
          const separatorInput = panel.querySelector(".separator-input");

          let levelField = null;
          let separator = null;

          if (treeModeEnabled) {
            levelField = levelFieldSelect?.value;
            separator = separatorInput?.value.trim();
            if (!levelField || !separator) {
              this.showAlert(
                `Sheet "${sheet.name}" 启用了层级模式，请填写完整的层级配置信息`,
              );
              hasError = true;
              break;
            }
          }

          const configResult = this.getConfigForSheet(sheet.name);
          if (!configResult) {
            this.showAlert(
              `Sheet "${sheet.name}" 未找到对应的网格配置，请检查配置`,
            );
            hasError = true;
            break;
          }

          allConfigs.push({
            sheetName: sheet.name,
            headers: sheet.headers,
            rows: sheet.rows,
            fieldMappings: fieldMappings,
            treeModeEnabled: treeModeEnabled,
            levelField: levelField,
            separator: separator,
            gridId: configResult.config.gridId,
            config: configResult.config,
            isTree: treeModeEnabled && configResult.config.isTree,
            percentageColumns: sheet.percentageColumns || [],
          });
        }

        if (!hasError) {
          await this.processAllSheetsImport(allConfigs, overlay);
        }
      },
    );

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    this.setupOverlayClose(overlay);
  }

  createTabHeader(sheetsInfo) {
    const tabHeader = document.createElement("div");
    tabHeader.style.cssText = `
      display: flex;
      gap: 4px;
      border-bottom: 1px solid #e8e8e8;
      margin: 0 0 16px 0;
      padding: 0;
      background: white;
    `;

    sheetsInfo.forEach((sheet, index) => {
      const tab = document.createElement("button");
      tab.className = `tab-item`;
      tab.textContent = `${sheet.name} (${sheet.totalRows}行)`;
      tab.style.cssText = `
        padding: 10px 20px;
        background: transparent;
        color: #666;
        border: none;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        margin-right: 2px;
      `;

      tab.addEventListener("mouseenter", () => {
        if (
          !tab.classList.contains("active") &&
          tab.style.background !== "#1890ff"
        ) {
          tab.style.background = "#f5f5f5";
          tab.style.color = "#1890ff";
        }
      });

      tab.addEventListener("mouseleave", () => {
        if (
          !tab.classList.contains("active") &&
          tab.style.background !== "#1890ff"
        ) {
          tab.style.background = "transparent";
          tab.style.color = "#666";
        }
      });

      tabHeader.appendChild(tab);
    });

    return tabHeader;
  }

  createTabContainer() {
    const container = document.createElement("div");
    container.style.cssText = `
      min-height: 400px;
      max-height: 55vh;
      overflow-y: auto;
      padding: 4px;
    `;
    return container;
  }

  createSheetConfigPanel(sheet, index) {
    const panel = document.createElement("div");
    panel.className = `sheet-config-panel`;
    panel.style.cssText = `
      padding: 0;
      background: #fff;
      border-radius: 8px;
    `;

    const configResult = this.getConfigForSheet(sheet.name);
    const config = configResult?.config;

    if (!config) {
      const errorMsg = document.createElement("div");
      errorMsg.style.cssText = `
        padding: 20px;
        background: #fff2f0;
        border: 1px solid #ffccc7;
        border-radius: 8px;
        color: #ff4d4f;
        text-align: center;
      `;
      errorMsg.textContent = `未找到Sheet "${sheet.name}" 对应的网格配置，请检查gridConfigs配置`;
      panel.appendChild(errorMsg);
      return panel;
    }

    const fieldMapping = this.buildFieldMappingForConfig(config.columns);
    const mappableFields = this.getMappableFields(fieldMapping);
    const headers = sheet.headers;
    const autoMatches = this.autoMatchFields(
      mappableFields,
      headers,
      fieldMapping,
    );
    const autoMatchedLevelField = this.autoMatchLevelField(headers);

    const mappingSection = this.createMappingSection(
      headers,
      mappableFields,
      fieldMapping,
      autoMatches,
      index,
    );
    panel.appendChild(mappingSection);

    const levelSection = this.createLevelSection(
      headers,
      autoMatchedLevelField,
      config.isTree,
      index,
    );
    panel.appendChild(levelSection);

    return panel;
  }

  createMappingSection(
    headers,
    mappableFields,
    fieldMapping,
    autoMatches,
    sheetIndex,
  ) {
    const section = this.createCollapsiblePanel("字段映射配置", true);
    section.style.marginBottom = "16px";

    const mappingScrollContainer = document.createElement("div");
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

    Object.keys(mappableFields).forEach((fieldName) => {
      const fieldConfig = mappableFields[fieldName];
      const fieldContainer = this.createFieldMappingItem(
        fieldConfig.label,
        headers,
        fieldName,
        fieldConfig.required,
        autoMatches[fieldName],
      );
      fieldContainer.style.flex = "0 0 auto";
      fieldContainer.style.width = "130px";
      fieldContainer.style.marginBottom = "0";
      mappingRow.appendChild(fieldContainer);
    });

    const autoMatchBtn = this.createButton("重新自动匹配", "secondary", () => {
      const newAutoMatches = this.autoMatchFields(
        mappableFields,
        headers,
        fieldMapping,
      );
      const selects = section.querySelectorAll(".field-mapping-select");
      selects.forEach((select) => {
        const fieldName = select.getAttribute("data-field");
        if (newAutoMatches[fieldName]) {
          select.value = newAutoMatches[fieldName];
          select.style.borderColor = "#52c41a";
          select.style.backgroundColor = "#f6ffed";
          this.updateMatchBadge(select, true);
        }
      });
    });
    autoMatchBtn.style.marginTop = "12px";

    mappingScrollContainer.appendChild(mappingRow);
    section.content.appendChild(mappingScrollContainer);
    section.content.appendChild(autoMatchBtn);

    return section;
  }

  updateMatchBadge(select, hasMatch) {
    const container = select.parentElement;
    if (!container) return;

    const existingBadge = container.querySelector(".match-badge");
    if (existingBadge) {
      existingBadge.remove();
    }

    if (hasMatch) {
      const matchBadge = document.createElement("span");
      matchBadge.className = "match-badge";
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
      container.style.position = "relative";
      container.appendChild(matchBadge);
    }
  }

  createLevelSection(headers, autoMatchedLevelField, isTreeConfig, sheetIndex) {
    const section = this.createCollapsiblePanel("层级配置", true);
    section.style.marginBottom = "16px";

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
    `;

    const switchCheckbox = document.createElement("input");
    switchCheckbox.type = "checkbox";
    switchCheckbox.className = "tree-mode-switch";
    switchCheckbox.checked = isTreeConfig && this.options.defaultTreeMode;
    switchCheckbox.disabled = !isTreeConfig;
    switchCheckbox.style.cssText = `
      appearance: auto;
      -webkit-appearance: auto;
      width: 18px;
      height: 18px;
      cursor: ${isTreeConfig ? "pointer" : "not-allowed"};
    `;

    const switchLabel = document.createElement("span");
    switchLabel.textContent =
      isTreeConfig && this.options.defaultTreeMode ? "层级模式" : "平级模式";
    switchLabel.style.cssText = `
      font-size: 14px;
      color: #333;
      font-weight: 500;
      min-width: 70px;
    `;

    switchWrapper.appendChild(switchCheckbox);
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
    levelFieldSelect.className = "level-field-select";
    levelFieldSelect.style.width = "100%";
    levelFieldSelect.disabled = !(isTreeConfig && this.options.defaultTreeMode);

    if (autoMatchedLevelField && isTreeConfig && this.options.defaultTreeMode) {
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
    separatorInput.className = "separator-input";
    separatorInput.style.width = "100%";
    separatorInput.disabled = !(isTreeConfig && this.options.defaultTreeMode);

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

    switchCheckbox.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      const canEnable = enabled && isTreeConfig;

      switchLabel.textContent = canEnable ? "层级模式" : "平级模式";
      levelFieldSelect.disabled = !canEnable;
      separatorInput.disabled = !canEnable;
      levelFieldSelect.style.opacity = canEnable ? "1" : "0.5";
      separatorInput.style.opacity = canEnable ? "1" : "0.5";
      levelFieldSelect.style.cursor = canEnable ? "pointer" : "not-allowed";
      separatorInput.style.cursor = canEnable ? "pointer" : "not-allowed";

      if (canEnable && autoMatchedLevelField) {
        levelFieldSelect.style.borderColor = "#52c41a";
        levelFieldSelect.style.backgroundColor = "#f6ffed";
      } else {
        levelFieldSelect.style.borderColor = "#d9d9d9";
        levelFieldSelect.style.backgroundColor = canEnable
          ? "white"
          : "#f5f5f5";
      }
    });

    section.content.appendChild(levelRow);
    return section;
  }

  createGlobalConfigPanel(sheetsInfo) {
    const panel = this.createCollapsiblePanel("全局匹配规则配置", true);

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

    const globalAutoMatchBtn = this.createButton(
      "为所有Sheet自动匹配字段",
      "primary",
      () => {
        Object.keys(this.tabPanelsCache).forEach((key) => {
          const panel = this.tabPanelsCache[key];
          const sheetInfo = sheetsInfo[parseInt(key)];
          if (sheetInfo) {
            const configResult = this.getConfigForSheet(sheetInfo.name);
            if (configResult && configResult.config) {
              const fieldMapping = this.buildFieldMappingForConfig(
                configResult.config.columns,
              );
              const mappableFields = this.getMappableFields(fieldMapping);
              const headers = sheetInfo.headers;
              const newAutoMatches = this.autoMatchFields(
                mappableFields,
                headers,
                fieldMapping,
              );
              const selects = panel.querySelectorAll(".field-mapping-select");
              selects.forEach((select) => {
                const fieldName = select.getAttribute("data-field");
                if (newAutoMatches[fieldName]) {
                  select.value = newAutoMatches[fieldName];
                  select.style.borderColor = "#52c41a";
                  select.style.backgroundColor = "#f6ffed";
                  this.updateMatchBadge(select, true);
                }
              });
              const autoMatchedLevelField = this.autoMatchLevelField(headers);
              const levelFieldSelect = panel.querySelector(
                ".level-field-select",
              );
              if (levelFieldSelect && autoMatchedLevelField) {
                levelFieldSelect.value = autoMatchedLevelField;
                levelFieldSelect.style.borderColor = "#52c41a";
                levelFieldSelect.style.backgroundColor = "#f6ffed";
                this.updateMatchBadge(levelFieldSelect, true);
              }
            }
          }
        });
        this.showAlert("已为所有Sheet完成字段自动匹配");
      },
    );

    ruleContainer.appendChild(ruleLabel);
    ruleContainer.appendChild(ruleSelect);
    priorityContainer.appendChild(priorityLabel);
    priorityContainer.appendChild(prioritySelect);
    ruleRow.appendChild(ruleContainer);
    ruleRow.appendChild(priorityContainer);
    ruleRow.appendChild(globalAutoMatchBtn);

    ruleSelect.addEventListener("change", () => {
      this.options.matchRule = ruleSelect.value;
    });

    prioritySelect.addEventListener("change", () => {
      this.options.matchPriority = prioritySelect.value;
    });

    panel.content.appendChild(ruleRow);
    return panel;
  }

  createFieldMappingItem(
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
    select.setAttribute("data-label", labelText);
    select.style.width = "100%";
    select.style.padding = "6px 8px";
    select.style.fontSize = "12px";
    select.style.borderRadius = "4px";
    select.style.height = "30px";

    if (autoMatchValue) {
      select.style.borderColor = "#52c41a";
      select.style.backgroundColor = "#f6ffed";
      const matchBadge = document.createElement("span");
      matchBadge.className = "match-badge";
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

  async processAllSheetsImport(allConfigs, overlay) {
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const config of allConfigs) {
      try {
        const dataWithHeaders = [config.headers, ...config.rows];

        if (config.treeModeEnabled && config.isTree) {
          let parsedData = this.generateTreeData(
            dataWithHeaders,
            config.fieldMappings,
            config.levelField,
            config.separator,
            config.percentageColumns,
          );

          console.log(
            `Sheet "${config.sheetName}" 生成树形平级数据 (${parsedData.length}条)，数据结构:`,
            parsedData.length > 0 ? Object.keys(parsedData[0]) : [],
          );

          if (typeof this.options.onBeforeImport === "function") {
            const hookResult = await this.options.onBeforeImport(
              parsedData,
              true,
              config.sheetName,
              config.gridId,
            );
            if (hookResult === false) continue;
            if (
              hookResult &&
              typeof hookResult === "object" &&
              Array.isArray(hookResult)
            ) {
              parsedData = hookResult;
            }
          }

          await this.importToGrid(parsedData, true, config.gridId);

          if (typeof this.options.onAfterImport === "function") {
            await this.options.onAfterImport(
              { success: true, message: "导入成功" },
              true,
              parsedData,
              config.sheetName,
              config.gridId,
            );
          }
          successCount++;
        } else {
          let parsedData = this.generateFlatData(
            dataWithHeaders,
            config.fieldMappings,
            config.percentageColumns,
          );

          if (typeof this.options.onBeforeImport === "function") {
            const hookResult = await this.options.onBeforeImport(
              parsedData,
              false,
              config.sheetName,
              config.gridId,
            );
            if (hookResult === false) continue;
            if (
              hookResult &&
              typeof hookResult === "object" &&
              Array.isArray(hookResult)
            ) {
              parsedData = hookResult;
            }
          }

          await this.importToGrid(parsedData, false, config.gridId);

          if (typeof this.options.onAfterImport === "function") {
            await this.options.onAfterImport(
              { success: true, message: "导入成功" },
              false,
              parsedData,
              config.sheetName,
              config.gridId,
            );
          }
          successCount++;
        }
      } catch (error) {
        console.error(`导入Sheet "${config.sheetName}" 失败:`, error);
        failCount++;
        errors.push(`${config.sheetName}: ${error.message}`);
      }
    }

    if (this.activeTooltip && document.body.contains(this.activeTooltip)) {
      document.body.removeChild(this.activeTooltip);
      this.activeTooltip = null;
    }
    document.body.removeChild(overlay);

    if (failCount > 0) {
      this.showAlert(
        `导入完成：成功 ${successCount} 个Sheet，失败 ${failCount} 个Sheet\n错误详情：${errors.join("；")}`,
      );
    } else {
      this.showAlert(`全部导入成功！共导入 ${successCount} 个Sheet的数据`);
    }
  }

  generateFlatData(data, fieldMappings, percentageColumns = null) {
    const headers = data[0];
    const rows = data.slice(1);
    const flatData = [];
    const fieldIndexes = {};
    const shouldConvertPercentage =
      this.options.enablePercentageConversion && percentageColumns && percentageColumns.length > 0;

    Object.keys(fieldMappings).forEach((field) => {
      if (fieldMappings[field]) {
        fieldIndexes[field] = headers.indexOf(fieldMappings[field]);
      }
    });
    rows.forEach((row) => {
      const nodeData = {};
      Object.keys(fieldIndexes).forEach((field) => {
        const excelIndex = fieldIndexes[field];
        if (
          excelIndex !== -1 &&
          row[excelIndex] !== undefined &&
          row[excelIndex] !== null &&
          row[excelIndex] !== ""
        ) {
          let rawValue = row[excelIndex];
          // 百分比格式列：将小数转换为百分数（0.5 → 50）
          if (
            shouldConvertPercentage &&
            percentageColumns.includes(excelIndex) &&
            typeof rawValue === "number"
          ) {
            rawValue = rawValue * 100;
          }
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

  generateTreeData(data, fieldMappings, levelField, separator, percentageColumns = null) {
    const headers = data[0];
    const rows = data.slice(1);
    const treeMap = new Map();
    const treeData = [];
    const fieldIndexes = {};
    const shouldConvertPercentage =
      this.options.enablePercentageConversion && percentageColumns && percentageColumns.length > 0;

    Object.keys(fieldMappings).forEach((field) => {
      if (fieldMappings[field]) {
        fieldIndexes[field] = headers.indexOf(fieldMappings[field]);
      }
    });

    const levelIndex = headers.indexOf(levelField);
    if (levelIndex === -1) throw new Error(`未找到层级字段: ${levelField}`);

    console.log("生成树形数据 - 层级字段:", levelField, "分隔符:", separator);

    const sortedRows = [...rows].sort((a, b) => {
      const pathA =
        a[levelIndex] !== undefined && a[levelIndex] !== null
          ? String(a[levelIndex]).trim()
          : "";
      const pathB =
        b[levelIndex] !== undefined && b[levelIndex] !== null
          ? String(b[levelIndex]).trim()
          : "";
      return pathA.length - pathB.length;
    });

    sortedRows.forEach((row, rowIndex) => {
      const levelPath = row[levelIndex];
      if (levelPath === undefined || levelPath === null || levelPath === "")
        return;

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
        levelCode: levelPathStr,
      };

      Object.keys(fieldIndexes).forEach((field) => {
        const excelIndex = fieldIndexes[field];
        if (
          excelIndex !== -1 &&
          row[excelIndex] !== undefined &&
          row[excelIndex] !== null &&
          row[excelIndex] !== ""
        ) {
          let rawValue = row[excelIndex];
          // 百分比格式列：将小数转换为百分数（0.5 → 50）
          if (
            shouldConvertPercentage &&
            percentageColumns.includes(excelIndex) &&
            typeof rawValue === "number"
          ) {
            rawValue = rawValue * 100;
          }
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

    console.log(`共生成 ${treeData.length} 个树节点`);
    return treeData;
  }

  /**
   * 处理字段值，保持原始数据类型和精度
   * 对于数字类型（整数/浮点数）完全保持原样
   * 只有包含|分隔符的字符串才进行特殊处理
   */
  processFieldValue(fieldName, rawValue) {
    const result = {};

    // 处理 null/undefined/空值
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      result[fieldName] = "";
      return result;
    }

    // 如果是数字类型，直接保持原样（包括整数和浮点数）
    if (typeof rawValue === "number") {
      result[fieldName] = rawValue;
      return result;
    }

    // 对于非数字类型，转为字符串处理
    const stringValue = String(rawValue);

    // 检查是否包含 | 分隔符（这是系统特殊格式）
    if (stringValue.includes("|")) {
      const parts = stringValue.split("|");

      if (parts.length === 2) {
        // 格式：value|displayText
        result[fieldName] = parts[0].trim();
      } else if (parts.length === 3) {
        // 格式：mainValue|subValue|displayText
        result[fieldName] = parts[0].trim();
        const exNameField = `${fieldName}_EXName`;
        result[exNameField] = parts[2].trim();
      } else {
        // 异常情况，保持原值
        result[fieldName] = rawValue;
      }
    } else {
      // 没有 | 分隔符，保持原始值（可能是字符串、布尔值等）
      result[fieldName] = rawValue;
    }

    return result;
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
    const nodeMap = {};
    const roots = [];

    list.forEach((node) => {
      nodeMap[node[idKey]] = {
        ...node,
        [childrenKey]: [],
      };
    });

    list.forEach((node) => {
      const currentNode = nodeMap[node[idKey]];
      const parentId = node[parentKey];

      if (parentId && parentId !== "0" && nodeMap[parentId]) {
        nodeMap[parentId][childrenKey].push(currentNode);
      } else {
        roots.push(currentNode);
      }
    });

    return roots;
  }

  async importToGrid(data, isTreeMode = true, gridId) {
    try {
      const targetGridId = gridId || this.options.gridId;
      const dgrid = $NG.getCmpApi(targetGridId);
      if (!dgrid) {
        throw new Error(`未找到明细网格组件: ${targetGridId}`);
      }
      let importData = data;
      if (isTreeMode) {
        importData = this.new_listToTree(data);
        console.log(
          `导入树形数据到 ${targetGridId} (共${importData.length}个根节点):`,
          importData.length > 0
            ? `示例根节点: ${JSON.stringify(importData[0]).substring(0, 200)}...`
            : "空数据",
        );
      } else {
        console.log(`导入平级数据到 ${targetGridId}: 共${importData.length}条`);
      }
      await dgrid.addRows(importData);
    } catch (error) {
      console.error("导入失败:", error);
      throw error;
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
