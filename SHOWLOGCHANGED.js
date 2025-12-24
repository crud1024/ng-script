/**
 * 数据变更比较器
 * 用于比较股权立项数据和重大变更数据的差异
 */
class DataChangeComparator {
    /**
     * 构造函数
     * @param {Object} options 配置选项
     */
    constructor(options = {}) {
        // 默认配置
        this.config = {
            // 目标元素ID
            targetElementId: '_r5g_',
            // 表单字段
            formFields: {
                billDate: 'bill_dt',
                projectId: 'phid_pc',
            },
            // 需要对比的字段列表
            compareFields: [
                'u_sector',
                'u_invest_type',
                'u_invest_children_type',
                'u_invest_direction',
                'u_zlxxxcy',
                'u_industry_type',
                'u_industry_subclass',
                'u_primary_industry_category',
                'u_invest_region',
                'u_phid_invest_org',
                'u_tzztzcfzl',
                'u_tzsyl',
                'u_return_period',
                'u_zbjnbsyl',
                'u_yjqqzfy',
                'u_pro_manager',
                'u_manager_phone',
                'u_pro_start_date',
                'u_pro_end_date',
                'u_xmjhztze',
                'u_qyjhztze',
                'u_qz_zyzj',
                'u_qz_rz',
                'u_qz_zfzj',
                'u_qz_other',
                'u_pro_country',
                'u_pro_location_province',
                'u_pro_location_city',
                'u_pro_location_county',
                'u_pro_location',
                'u_pro_condition',
                'u_jglx',
                'u_tbjgl',
                'u_jzl',
            ],
            // 字段显示名称映射
            fieldNames: {
                u_sector: '所属板块',
                u_invest_type: '投资类别',
                u_invest_children_type: '投资子类别',
                u_invest_direction: '投资方向',
                u_zlxxxcy: '战略新兴产业',
                u_industry_type: '行业分类',
                u_industry_subclass: '行业子类',
                u_primary_industry_category: '重点产业分类',
                u_invest_region: '投资地域',
                u_phid_invest_org: '投资主体',
                u_tzztzcfzl: '投资总资产负债率',
                u_tzsyl: '投资收益率',
                u_return_period: '回报期',
                u_zbjnbsyl: '资本金内部收益率',
                u_yjqqzfy: '预计前置费用',
                u_pro_manager: '项目负责人',
                u_manager_phone: '负责人联系方式',
                u_pro_start_date: '项目开始日期',
                u_pro_end_date: '项目结束日期',
                u_xmjhztze: '项目计划总投资额',
                u_qyjhztze: '企业计划总投资额',
                u_qz_zyzj: '其中自有资金',
                u_qz_rz: '其中融资',
                u_qz_zfzj: '其中政府资金',
                u_qz_other: '其他',
                u_pro_country: '国家',
                u_pro_location_province: '省份',
                u_pro_location_city: '城市',
                u_pro_location_county: '区县',
                u_pro_location: '详细地址',
                u_pro_condition: '项目状态',
                u_jglx: '监管类型',
                u_tbjgl: '特别监管类型',
                u_jzl: '禁止类型',
            },
            // 表格列头
            tableHeaders: [
                '变更字段',
                '变更前',
                '变更后',
                '变更人',
                '变更日期',
                '变更状态',
            ],
            // API接口名称（需动态传入）
            apiNames: {
                checkExists: 'selectSureAndChangedIsFlag',
                getEquityData: 'selectgqcolumn',
                getChangeData: 'selectChanged',
            },
            // 表格配置
            tableConfig: {
                columnWidths: {
                    field: 220,
                    operator: 100,
                    date: 100,
                    status: 80,
                },
                truncateLength: 20,
                colors: {
                    new: '#52c41a',
                    update: '#1890ff',
                    delete: '#ff4d4f',
                    none: '#9E9E9E',
                    header: '#096dd9',
                },
            },
            // 动态组件引用（可以外部传入）
            components: {
                dgrid: null, // 数据表格组件
                mstform: null, // 表单组件
                $NG: null, // NG框架对象
            },
        };

        // 合并用户配置
        Object.assign(this.config, options);

        // 状态变量
        this.state = {
            equityData: null,
            changeData: null,
            changeBillDate: null,
            hasCompared: false,
            currentUser: null,
            isInitialized: false,
            targetElement: null,
        };

        // 绑定方法
        this.init = this.init.bind(this);
        this.compareDataSources = this.compareDataSources.bind(this);
        this.manualCompare = this.manualCompare.bind(this);
    }

    /**
     * 初始化比较器
     * @param {Object} components 外部传入的组件引用
     */
    init(components = {}) {
        try {
            // 合并外部传入的组件引用
            Object.assign(this.config.components, components);

            // 验证必需组件
            this.validateComponents();

            // 获取用户信息
            this.state.currentUser = this.config.components.$NG.getUser();

            // 获取目标元素
            this.state.targetElement = document.getElementById(
                this.config.targetElementId
            );

            // 初始隐藏控件
            this.hideControl();

            // 检查数据是否存在
            this.checkDataExists();

            this.state.isInitialized = true;
            console.log('数据变更比较器初始化完成');
        } catch (error) {
            console.error('初始化数据变更比较器失败:', error);
            throw error;
        }
    }

    /**
     * 验证必需的组件是否已传入
     */
    validateComponents() {
        const requiredComponents = ['$NG', 'mstform'];
        const missingComponents = [];

        requiredComponents.forEach((component) => {
            if (!this.config.components[component]) {
                missingComponents.push(component);
            }
        });

        if (missingComponents.length > 0) {
            throw new Error(
                `缺少必需的组件: ${missingComponents.join(
                    ', '
                )}。请通过init()方法传入或设置默认值。`
            );
        }

        // 如果dgrid没有传入，尝试从全局获取
        if (!this.config.components.dgrid && typeof dgrid !== 'undefined') {
            this.config.components.dgrid = dgrid;
            console.log('从全局获取dgrid组件');
        }

        // 如果mstform没有传入，尝试从全局获取
        if (!this.config.components.mstform && typeof mstform !== 'undefined') {
            this.config.components.mstform = mstform;
            console.log('从全局获取mstform组件');
        }

        // 如果$NG没有传入，尝试从全局获取
        if (!this.config.components.$NG && typeof $NG !== 'undefined') {
            this.config.components.$NG = $NG;
            console.log('从全局获取$NG组件');
        }
    }

    /**
     * 设置组件引用
     * @param {Object} components 组件对象
     */
    setComponents(components) {
        Object.assign(this.config.components, components);
        console.log('组件引用已更新:', Object.keys(components));
    }

    /**
     * 获取表单值
     * @param {string} fieldName 字段名
     * @returns {any} 字段值
     */
    getFormValue(fieldName) {
        if (!this.config.components.mstform) {
            throw new Error('mstform组件未初始化');
        }

        try {
            const values = this.config.components.mstform.getValues();
            return values ? values[fieldName] : null;
        } catch (error) {
            console.error('获取表单值失败:', error);
            return null;
        }
    }

    /**
     * 获取项目ID
     * @returns {string|null} 项目ID
     */
    getProjectId() {
        return this.getFormValue(this.config.formFields.projectId);
    }

    /**
     * 获取账单日期
     * @returns {string|null} 账单日期
     */
    getBillDate() {
        return this.getFormValue(this.config.formFields.billDate);
    }

    /**
     * 隐藏控件
     */
    hideControl() {
        const element = this.state.targetElement;
        if (
            element &&
            element.parentElement &&
            element.parentElement.parentElement &&
            element.parentElement.parentElement.parentElement
        ) {
            element.parentElement.parentElement.parentElement.style.display =
                'none';
        }
    }

    /**
     * 显示控件
     */
    showControl() {
        const element = this.state.targetElement;
        if (
            element &&
            element.parentElement &&
            element.parentElement.parentElement &&
            element.parentElement.parentElement.parentElement
        ) {
            element.parentElement.parentElement.parentElement.style.display =
                '';
        }
    }

    /**
     * 检查数据是否存在
     */
    checkDataExists() {
        const projectId = this.getProjectId();

        if (!projectId) {
            console.log('项目ID为空，跳过检查');
            return;
        }

        this.config.components.$NG.execServer(
            this.config.apiNames.checkExists,
            { phid_pc: projectId },
            (res) => {
                if (res.count === 0) return;

                const data = JSON.parse(res.data);
                if (data.length === 0) return;

                const { extendObjects } = data[0];
                const { exists_in_both } = extendObjects;

                // 延迟执行以确保DOM准备就绪
                setTimeout(() => {
                    if (projectId && exists_in_both) {
                        this.showControl();
                        this.manualCompare(projectId);
                    }
                }, 100);
            }
        );
    }

    /**
     * 监听表单值变化
     */
    setupFormChangeListener() {
        // 检查useValuesChange函数是否存在
        if (typeof useValuesChange !== 'function') {
            console.warn('useValuesChange函数不存在，跳过表单变化监听');
            return;
        }

        useValuesChange(({ args }) => {
            if (!args || !args[0] || !args[0].phid_pc) {
                return;
            }

            const projectId = args[0].phid_pc.value;
            if (!projectId) return;

            console.log('检测到项目ID变化:', projectId);

            // 重置状态
            this.state.changeBillDate = null;
            this.state.hasCompared = false;

            // 显示控件
            this.showControl();

            // 查询数据
            this.fetchDataForComparison(projectId);
        }, 'p_form_ty_major_change_m.phid_pc');
    }

    /**
     * 获取数据进行比较
     * @param {string} projectId 项目ID
     */
    fetchDataForComparison(projectId) {
        // 查询重大变更数据
        this.config.components.$NG.execServer(
            this.config.apiNames.getChangeData,
            { phid_pc: projectId },
            (res) => {
                this.state.changeData = this.processData(res, '重大变更');
                if (this.state.changeData) {
                    setTimeout(() => this.compareDataSources(), 100);
                }
            }
        );

        // 查询股权立项数据
        this.config.components.$NG.execServer(
            this.config.apiNames.getEquityData,
            { phid_pc: projectId },
            (res) => {
                this.state.equityData = this.processData(res, '股权立项');
                if (this.state.equityData) {
                    setTimeout(() => this.compareDataSources(), 100);
                }
            }
        );
    }

    /**
     * 处理API返回的数据
     * @param {Object} res API响应
     * @param {string} dataType 数据类型
     * @returns {Object|null} 处理后的数据
     */
    processData(res, dataType) {
        console.log(`${dataType}数据原始响应:`, res);

        if (!res || res.count == 0 || !res.data) {
            console.log(`${dataType}: 未查询到数据`);
            return null;
        }

        try {
            const data = JSON.parse(res.data);
            if (!data || data.length == 0) {
                console.log(`${dataType}: 数据为空`);
                return null;
            }

            // 提取数据
            let extendObjects = null;

            if (data[0].extendObjects) {
                extendObjects = data[0].extendObjects;
            } else if (data[0].data) {
                extendObjects = data[0].data;
            } else {
                extendObjects = data[0];
            }

            // 如果是重大变更数据，提取bill_dt
            if (dataType === '重大变更' && data[0].bill_dt) {
                this.state.changeBillDate = data[0].bill_dt;
                console.log(
                    `提取到重大变更的bill_dt: ${this.state.changeBillDate}`
                );
            }

            console.log(`${dataType}提取的数据:`, extendObjects);
            return extendObjects;
        } catch (error) {
            console.error(
                `解析${dataType}数据失败:`,
                error,
                '原始数据:',
                res.data
            );
            return null;
        }
    }

    /**
     * 比较两个值是否相等
     * @param {any} oldVal 旧值
     * @param {any} newVal 新值
     * @returns {boolean} 是否发生变化
     */
    isValueChanged(oldVal, newVal) {
        // 处理null、undefined和空字符串
        const oldValue = oldVal === null || oldVal === undefined ? '' : oldVal;
        const newValue = newVal === null || newVal === undefined ? '' : newVal;

        // 如果是字符串，去掉首尾空格比较
        if (typeof oldValue === 'string' && typeof newValue === 'string') {
            return oldValue.trim() !== newValue.trim();
        }

        // 其他类型直接比较
        return oldValue !== newValue;
    }

    /**
     * 格式化值为可读字符串
     * @param {any} value 值
     * @returns {string} 格式化后的字符串
     */
    formatValue(value) {
        if (value === null || value === undefined) {
            return '';
        }

        if (value === '') {
            return '';
        }

        // 如果是日期类型，可能需要格式化
        if (value instanceof Date) {
            return value.toLocaleDateString();
        }

        return String(value);
    }

    /**
     * 手动触发比较
     * @param {string} projectId 项目ID
     */
    manualCompare(projectId) {
        this.state.hasCompared = false;
        this.state.equityData = null;
        this.state.changeData = null;
        this.state.changeBillDate = null;

        this.fetchDataForComparison(projectId);
    }

    /**
     * 比较两个数据源
     */
    compareDataSources() {
        if (this.state.hasCompared) {
            console.log('已经比较过了，跳过');
            return;
        }

        if (!this.state.equityData || !this.state.changeData) {
            console.log('数据未完全加载完成，等待另一数据源...');
            return;
        }

        this.state.hasCompared = true;

        console.log('开始比较数据...');
        console.log('股权立项数据:', this.state.equityData);
        console.log('重大变更数据:', this.state.changeData);

        const changedFields = [];

        this.config.compareFields.forEach((fieldName) => {
            const oldValue = this.state.equityData[fieldName];
            const newValue = this.state.changeData[fieldName];

            console.log(
                `字段 ${fieldName}: 旧值=${this.formatValue(
                    oldValue
                )}, 新值=${this.formatValue(newValue)}`
            );

            if (this.isValueChanged(oldValue, newValue)) {
                changedFields.push({
                    name: fieldName,
                    displayName: this.config.fieldNames[fieldName] || fieldName,
                    oldValue: oldValue,
                    newValue: newValue,
                });

                console.log(`字段 ${fieldName} 发生变化`);
            }
        });

        console.log(`总共发现 ${changedFields.length} 个变更字段`);

        // 如果有变更记录，添加到dgrid
        if (changedFields.length > 0) {
            this.addChangedRecords(changedFields)
                .then((count) => {
                    console.log(`已完成 ${count} 条记录的添加`);
                })
                .catch((error) => {
                    console.error('处理变更记录时发生错误:', error);
                });
        } else {
            console.log('所有字段均无变更');
        }
    }

    /**
     * 添加变更记录到dgrid
     * @param {Array} changedFields 变更字段数组
     * @returns {Promise<number>} 添加的记录数
     */
    addChangedRecords(changedFields) {
        if (changedFields.length === 0) {
            console.log('没有发现变更的字段');
            return Promise.resolve(0);
        }

        // 使用重大变更的bill_dt作为变更日期
        const changeDate = this.state.changeBillDate || this.getBillDate();

        const rowsToAdd = changedFields.map((field) => ({
            u_column: field.name,
            u_column_name: field.displayName || field.name,
            u_changed_front: this.formatValue(field.oldValue),
            u_changed_trail: this.formatValue(field.newValue),
            phid_emp: this.state.currentUser.userID,
            u_user: this.state.currentUser.userName,
            u_changed_dt: changeDate,
        }));

        console.log('准备添加的变更记录:', rowsToAdd);

        // 检查dgrid组件是否存在
        if (!this.config.components.dgrid) {
            const error = new Error('dgrid组件未初始化，无法添加变更记录');
            console.error(error.message);
            return Promise.reject(error);
        }

        // 使用数组形式调用addRows
        return this.config.components.dgrid
            .addRows(rowsToAdd)
            .then(() => {
                console.log(`成功添加 ${rowsToAdd.length} 条变更记录`);

                // 显示变更记录界面
                this.showChangeRecords(changedFields, rowsToAdd.length);

                // 延迟显示成功提示
                setTimeout(() => {
                    console.log({
                        title: '导入成功',
                        message: `成功导入 ${rowsToAdd.length} 条变更记录！`,
                        type: 'success',
                    });
                }, 300);

                return rowsToAdd.length;
            })
            .catch((error) => {
                console.error('导入变更记录失败:', error);
                this.showErrorOverlay(error, changedFields);

                console.log({
                    title: '导入失败',
                    message: `导入失败: ${error.message}`,
                    type: 'error',
                });

                throw error;
            });
    }

    /**
     * 创建美观的数据变更记录显示界面
     * @returns {HTMLElement|null} 覆盖层元素
     */
    createChangeRecordsOverlay() {
        const targetDiv = this.state.targetElement?.parentNode;
        if (!targetDiv) {
            console.error('找不到目标div');
            return null;
        }

        // 创建覆盖层容器
        const overlay = document.createElement('div');
        overlay.id = 'change-records-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            z-index: 9999;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        `;

        // 创建头部
        const header = document.createElement('div');
        header.style.cssText = `
            background: #f0f7ff;
            color: ${this.config.tableConfig.colors.header};
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            border-bottom: 1px solid #d6e4ff;
        `;

        const title = document.createElement('h2');
        title.innerHTML = `
            <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            数据变更记录
        `;
        title.style.cssText = `
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        header.appendChild(title);

        // 创建内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 24px;
            height: calc(100% - 80px);
            overflow-y: auto;
        `;

        overlay.appendChild(header);
        overlay.appendChild(content);

        // 设置目标div为相对定位
        targetDiv.style.position = 'relative';
        targetDiv.appendChild(overlay);

        return overlay;
    }

    /**
     * 显示变更记录
     * @param {Array} changedFields 变更字段数组
     * @param {number} addedCount 添加的记录数
     */
    showChangeRecords(changedFields, addedCount) {
        let overlay = document.getElementById('change-records-overlay');

        if (!overlay) {
            overlay = this.createChangeRecordsOverlay();
            if (!overlay) return;
        }

        // 更新内容
        this.updateOverlayContent(overlay, changedFields, addedCount);

        // 显示覆盖层
        overlay.style.display = 'block';
    }

    /**
     * 更新覆盖层内容
     * @param {HTMLElement} overlay 覆盖层元素
     * @param {Array} changedFields 变更字段数组
     * @param {number} addedCount 添加的记录数
     */
    updateOverlayContent(overlay, changedFields, addedCount) {
        const content = overlay.querySelector('div:nth-child(2)');
        if (!content) return;

        // 创建统计卡片区域
        const statsContainer = this.createStatsContainer(
            changedFields.length,
            addedCount
        );

        // 创建表格容器
        const tableContainer = this.createTableContainer(changedFields);

        content.innerHTML = '';
        content.appendChild(statsContainer);
        content.appendChild(tableContainer);
    }

    /**
     * 创建统计容器
     * @param {number} totalCount 总变更数
     * @param {number} addedCount 添加记录数
     * @returns {HTMLElement} 统计容器元素
     */
    createStatsContainer(totalCount, addedCount) {
        const container = document.createElement('div');

        // 使用重大变更的实际日期（bill_dt）
        const changeDate = this.state.changeBillDate
            ? new Date(this.state.changeBillDate)
            : new Date();
        const timeStr = changeDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateStr = changeDate.toLocaleDateString();

        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #eaeaea;
            margin-bottom: 20px;
            min-height: auto;
            max-height: 40px;
            height: 40px;
            font-size: 14px;
        `;

        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #666;">检测到变更:</span>
                <span style="font-weight: 600; color: #333;">${totalCount}个字段</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #666;">变更日期:</span>
                <span style="font-weight: 600; color: #333;">${dateStr}</span>
            </div>
        `;

        return container;
    }

    /**
     * 创建表格容器
     * @param {Array} changedFields 变更字段数组
     * @returns {HTMLElement} 表格容器元素
     */
    createTableContainer(changedFields) {
        const container = document.createElement('div');
        container.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        `;

        // 创建表格
        const table = this.createTable(changedFields);
        container.appendChild(table);

        return container;
    }

    /**
     * 创建表格
     * @param {Array} changedFields 变更字段数组
     * @returns {HTMLTableElement} 表格元素
     */
    createTable(changedFields) {
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            table-layout: fixed;
        `;

        // 表格头部
        const thead = document.createElement('thead');
        thead.style.cssText = `
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        `;

        const headerRow = document.createElement('tr');

        this.config.tableHeaders.forEach((text, index) => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.cssText = `
                padding: 16px 12px;
                text-align: left;
                font-weight: 600;
                color: #495057;
                border-bottom: 2px solid #e9ecef;
            `;

            // 设置列宽
            this.setColumnWidth(th, index);
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        // 表格主体
        const tbody = this.createTableBody(changedFields);

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    /**
     * 设置列宽
     * @param {HTMLTableCellElement} th 表头单元格
     * @param {number} index 列索引
     */
    setColumnWidth(th, index) {
        const widths = this.config.tableConfig.columnWidths;

        if (index === 0) {
            // 变更字段列
            th.style.width = `${widths.field}px`;
            th.style.minWidth = `${widths.field}px`;
            th.style.maxWidth = `${widths.field}px`;
        } else if (index === 3) {
            // 变更人列
            th.style.width = `${widths.operator}px`;
            th.style.minWidth = `${widths.operator}px`;
            th.style.maxWidth = `${widths.operator}px`;
        } else if (index === 4) {
            // 变更日期列
            th.style.width = `${widths.date}px`;
            th.style.minWidth = `${widths.date}px`;
            th.style.maxWidth = `${widths.date}px`;
        } else if (index === 5) {
            // 变更状态列
            th.style.width = `${widths.status}px`;
            th.style.minWidth = `${widths.status}px`;
            th.style.maxWidth = `${widths.status}px`;
        }
    }

    /**
     * 创建表格主体
     * @param {Array} changedFields 变更字段数组
     * @returns {HTMLTableSectionElement} 表格主体元素
     */
    createTableBody(changedFields) {
        const tbody = document.createElement('tbody');

        changedFields.forEach((field, index) => {
            const row = this.createTableRow(field, index);
            tbody.appendChild(row);
        });

        return tbody;
    }

    /**
     * 创建表格行
     * @param {Object} field 字段信息
     * @param {number} index 行索引
     * @returns {HTMLTableRowElement} 表格行元素
     */
    createTableRow(field, index) {
        const row = document.createElement('tr');
        row.style.cssText = `
            border-bottom: 1px solid #e9ecef;
            transition: background-color 0.2s ease;
        `;

        row.onmouseover = () => (row.style.backgroundColor = '#f8f9fa');
        row.onmouseout = () => (row.style.backgroundColor = 'transparent');

        // 获取变更状态
        const changeStatus = this.getChangeStatus(
            field.oldValue,
            field.newValue
        );

        // 创建单元格数据
        const cells = [
            field.displayName || field.name,
            this.formatValueForDisplay(field.oldValue),
            this.formatValueForDisplay(field.newValue),
            this.getOperatorDisplayName(),
            this.getChangeDateDisplay(),
            this.createStatusBadge(changeStatus),
        ];

        // 添加单元格
        cells.forEach((content, cellIndex) => {
            const td = this.createTableCell(
                content,
                cellIndex,
                field,
                changeStatus
            );
            row.appendChild(td);
        });

        return row;
    }

    /**
     * 创建表格单元格
     * @param {string} content 单元格内容
     * @param {number} cellIndex 单元格索引
     * @param {Object} field 字段信息
     * @param {string} changeStatus 变更状态
     * @returns {HTMLTableCellElement} 表格单元格
     */
    createTableCell(content, cellIndex, field, changeStatus) {
        const td = document.createElement('td');
        td.style.padding = '16px 12px';
        td.style.verticalAlign = 'top';

        // 设置列宽
        this.setTableCellWidth(td, cellIndex);

        // 根据单元格类型设置内容
        switch (cellIndex) {
            case 5: // 变更状态列
                td.innerHTML = content;
                break;

            case 1: // 变更前列
            case 2: // 变更后列
                td.innerHTML = this.createValueCell(content, cellIndex === 2);
                break;

            case 3: // 变更人列
                td.innerHTML = this.createOperatorCell();
                break;

            case 4: // 变更日期列
                td.innerHTML = this.createDateCell();
                break;

            default: // 其他列
                td.textContent = content;
                if (cellIndex === 0) {
                    td.style.cursor = 'help';
                    td.title = content;
                }
        }

        return td;
    }

    /**
     * 设置表格单元格宽度
     * @param {HTMLTableCellElement} td 表格单元格
     * @param {number} cellIndex 单元格索引
     */
    setTableCellWidth(td, cellIndex) {
        const widths = this.config.tableConfig.columnWidths;

        if (cellIndex === 0) {
            td.style.width = `${widths.field}px`;
            td.style.minWidth = `${widths.field}px`;
            td.style.maxWidth = `${widths.field}px`;
            td.style.overflow = 'hidden';
            td.style.textOverflow = 'ellipsis';
            td.style.whiteSpace = 'nowrap';
        } else if (cellIndex === 3) {
            td.style.width = `${widths.operator}px`;
            td.style.minWidth = `${widths.operator}px`;
            td.style.maxWidth = `${widths.operator}px`;
            td.style.overflow = 'hidden';
            td.style.textOverflow = 'ellipsis';
            td.style.whiteSpace = 'nowrap';
        } else if (cellIndex === 4) {
            td.style.width = `${widths.date}px`;
            td.style.minWidth = `${widths.date}px`;
            td.style.maxWidth = `${widths.date}px`;
        } else if (cellIndex === 5) {
            td.style.width = `${widths.status}px`;
            td.style.minWidth = `${widths.status}px`;
            td.style.maxWidth = `${widths.status}px`;
        }
    }

    /**
     * 创建值单元格
     * @param {string} value 值
     * @param {boolean} isNew 是否为新值
     * @returns {string} HTML字符串
     */
    createValueCell(value, isNew) {
        const truncatedValue = this.truncateText(
            value,
            this.config.tableConfig.truncateLength
        );
        const color = isNew
            ? this.config.tableConfig.colors.new
            : this.config.tableConfig.colors.update;
        const icon = isNew ? '↑' : '↓';

        return `
            <div class="value-cell" 
                 style="
                    cursor: help;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 100%;
                    display: block;
                 "
                 title="${value.replace(/<[^>]*>/g, '')}">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="
                        background: ${color};
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        flex-shrink: 0;
                    ">
                        ${icon}
                    </span>
                    <div style="
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        flex: 1;
                    ">
                        ${truncatedValue}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 创建操作人单元格
     * @returns {string} HTML字符串
     */
    createOperatorCell() {
        const operatorName = this.state.currentUser.userName || '';
        const displayOperator = operatorName.split('(')[0].trim();
        const fullOperatorInfo = `${this.state.currentUser.userName} (${this.state.currentUser.userID})`;

        return `
            <span style="
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
                cursor: help;
            " title="${fullOperatorInfo}">
                ${displayOperator}
            </span>
        `;
    }

    /**
     * 创建日期单元格
     * @returns {string} HTML字符串
     */
    createDateCell() {
        let changeDateDisplay = '';
        let fullDateTime = '';

        if (this.state.changeBillDate) {
            try {
                const changeDate = new Date(this.state.changeBillDate);
                changeDateDisplay = changeDate.toLocaleDateString();
                fullDateTime = changeDate.toLocaleString();
            } catch (e) {
                changeDateDisplay = this.state.changeBillDate;
                fullDateTime = this.state.changeBillDate;
            }
        } else {
            const now = new Date();
            changeDateDisplay = now.toLocaleDateString();
            fullDateTime = now.toLocaleString();
        }

        return `
            <span style="
                display: inline-block;
                overflow: hidden;
                textOverflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
                cursor: help;
            " title="${fullDateTime}">
                ${changeDateDisplay}
            </span>
        `;
    }

    /**
     * 截断文本
     * @param {string} text 文本
     * @param {number} maxLength 最大长度
     * @returns {string} 截断后的文本
     */
    truncateText(text, maxLength = 20) {
        if (!text) return '';
        const str = String(text);
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    /**
     * 获取变更状态
     * @param {any} oldValue 旧值
     * @param {any} newValue 新值
     * @returns {string} 变更状态
     */
    getChangeStatus(oldValue, newValue) {
        const oldVal = this.formatValueForDisplay(oldValue);
        const newVal = this.formatValueForDisplay(newValue);

        if (
            (oldVal === '' || oldVal === '空值') &&
            newVal !== '' &&
            newVal !== '空值'
        ) {
            return '新增';
        } else if (
            oldVal !== '' &&
            oldVal !== '空值' &&
            newVal !== '' &&
            newVal !== '空值' &&
            oldVal !== newVal
        ) {
            return '变更';
        } else if (
            oldVal !== '' &&
            oldVal !== '空值' &&
            (newVal === '' || newVal === '空值')
        ) {
            return '删除';
        } else {
            return '无变化';
        }
    }

    /**
     * 创建状态标签
     * @param {string} changeStatus 变更状态
     * @returns {string} HTML字符串
     */
    createStatusBadge(changeStatus) {
        const colors = this.config.tableConfig.colors;
        let color, statusText;

        switch (changeStatus) {
            case '新增':
                color = colors.new;
                statusText = '新增';
                break;
            case '变更':
                color = colors.update;
                statusText = '变更';
                break;
            case '删除':
                color = colors.delete;
                statusText = '删除';
                break;
            default:
                color = colors.none;
                statusText = '无变化';
        }

        return `
            <span style="
                background: ${color};
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                display: inline-block;
                text-align: center;
                width: 60px;
            ">
                ${statusText}
            </span>
        `;
    }

    /**
     * 格式化值用于显示
     * @param {any} value 值
     * @returns {string} 格式化后的值
     */
    formatValueForDisplay(value) {
        if (value === null || value === undefined || value === '') {
            return '空值';
        }

        if (typeof value === 'boolean') {
            return value ? '是' : '否';
        }

        if (typeof value === 'number') {
            return value.toLocaleString();
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    }

    /**
     * 获取操作人显示名称
     * @returns {string} 操作人显示名称
     */
    getOperatorDisplayName() {
        const operatorName = this.state.currentUser.userName || '';
        return operatorName.split('(')[0].trim();
    }

    /**
     * 获取变更日期显示
     * @returns {string} 变更日期
     */
    getChangeDateDisplay() {
        if (this.state.changeBillDate) {
            try {
                const changeDate = new Date(this.state.changeBillDate);
                return changeDate.toLocaleDateString();
            } catch (e) {
                console.error('日期格式错误:', this.state.changeBillDate, e);
                return new Date().toLocaleDateString();
            }
        } else {
            return new Date().toLocaleDateString();
        }
    }

    /**
     * 显示错误界面
     * @param {Error} error 错误对象
     * @param {Array} changedFields 变更字段数组
     */
    showErrorOverlay(error, changedFields) {
        let overlay = document.getElementById('change-records-overlay');

        if (!overlay) {
            overlay = this.createChangeRecordsOverlay();
            if (!overlay) return;
        }

        // 更新标题为错误状态
        const title = overlay.querySelector('h2');
        if (title) {
            title.innerHTML = `
                <svg style="width: 24px; height: 24px; color: #F44336;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                数据变更记录 - 导入失败
            `;
        }

        // 更新内容为错误信息
        const content = overlay.querySelector('div:nth-child(2)');
        if (content) {
            content.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <div style="
                        background: linear-gradient(135deg, #FF5252 0%, #F44336 100%);
                        color: white;
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    ">
                        <svg style="width: 40px; height: 40px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 style="color: #F44336; margin-bottom: 16px;">导入失败</h3>
                    <div style="
                        background: #FFEBEE;
                        border: 1px solid #FFCDD2;
                        border-radius: 6px;
                        padding: 16px;
                        margin-bottom: 24px;
                        text-align: left;
                    ">
                        <strong>错误信息:</strong>
                        <div style="color: #C62828; margin-top: 8px;">${error.message}</div>
                    </div>
                    <div style="color: #666; margin-bottom: 32px;">
                        共检测到 ${changedFields.length} 条变更记录，但保存失败
                    </div>
                    <button onclick="dataChangeComparator.retryImport()" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 12px 32px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(102, 126, 234, 0.4)'" 
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        重试导入
                    </button>
                </div>
            `;
        }

        overlay.style.display = 'block';
    }

    /**
     * 重试导入（需要根据具体业务逻辑实现）
     */
    retryImport() {
        console.log('重试功能需要根据具体业务逻辑实现');
    }
}

// 创建全局实例（延迟初始化）
let dataChangeComparator = null;

/**
 * 创建并初始化数据变更比较器
 * @param {Object} components 外部组件引用
 * @param {Object} options 配置选项
 * @returns {DataChangeComparator} 比较器实例
 */
function createDataChangeComparator(components = {}, options = {}) {
    // 合并全局可用的组件
    const mergedComponents = {
        $NG: typeof $NG !== 'undefined' ? $NG : null,
        mstform: typeof mstform !== 'undefined' ? mstform : null,
        dgrid: typeof dgrid !== 'undefined' ? dgrid : null,
        ...components,
    };

    // 创建实例
    dataChangeComparator = new DataChangeComparator(options);

    // 初始化
    try {
        dataChangeComparator.init(mergedComponents);
        console.log('数据变更比较器创建并初始化成功');
    } catch (error) {
        console.error('创建数据变更比较器失败:', error);
    }

    return dataChangeComparator;
}

/**
 * 获取数据变更比较器实例
 * @returns {DataChangeComparator|null} 比较器实例
 */
function getDataChangeComparator() {
    return dataChangeComparator;
}

// 导出实例供其他脚本使用
if (typeof window !== 'undefined') {
    window.DataChangeComparator = DataChangeComparator;
    window.createDataChangeComparator = createDataChangeComparator;
    window.getDataChangeComparator = getDataChangeComparator;
}
