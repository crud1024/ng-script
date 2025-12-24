// 动态加载JS库函数
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = false; // 保持顺序执行
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// 动态加载CSS库函数
function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.type = 'text/css';
        link.onload = () => resolve(`CSS加载成功: ${url}`);
        link.onerror = () => reject(`CSS加载失败: ${url}`);
        document.head.appendChild(link);
    });
}

// 引入 React + Ant Design
function loadReactAndAntd() {
    console.log('开始加载 React 和 Ant Design...');
    
    // 按顺序加载
    return loadScript('https://unpkg.com/react@17/umd/react.production.min.js')
        .then(() => {
            console.log('React 加载成功');
            return loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js');
        })
        .then(() => {
            console.log('React DOM 加载成功');
            return loadCSS('https://unpkg.com/antd@4/dist/antd.min.css');
        })
        .then(() => {
            console.log('Ant Design CSS 加载成功');
            return loadScript('https://unpkg.com/antd@4/dist/antd.min.js');
        })
        .then(() => {
            console.log('Ant Design JS 加载成功');
            console.log('React 和 Ant Design 加载完成！');
            // 这里可以初始化 React 应用
            initReactApp();
        })
        .catch(error => {
            console.error('加载失败:', error);
        });
}

// React 应用初始化函数
function initReactApp() {
    // 检查全局变量是否存在
    if (window.React && window.ReactDOM && window.antd) {
        console.log('React, ReactDOM, Antd 已就绪:', {
            React: window.React,
            ReactDOM: window.ReactDOM,
            antd: window.antd
        });
        
        /** // 这里可以创建 React 组件
        // 示例：创建一个简单的 React 应用
        const { Button, Card } = window.antd;
        const { createElement: h } = window.React;
        
        // 创建根元素
        const rootElement = document.createElement('div');
        rootElement.id = 'react-root';
        rootElement.innerHTML = '<h3>React + Ant Design 应用</h3>';
        document.body.appendChild(rootElement);
        
        // 简单的 React 组件渲染
        try {
            const App = () => h('div', { 
                style: { padding: '20px', border: '1px solid #ddd', margin: '10px' }
            }, [
                h('h4', null, 'React + Ant Design 示例'),
                h(Button, { type: 'primary' }, 'Ant Design 按钮')
            ]);
            
            window.ReactDOM.render(h(App), rootElement);
        } catch (e) {
            console.log('React 渲染可能需要 babel 转换:', e);
        } */
    }
}

// 引入 Vue + Element Plus
function loadVueAndElementPlus() {
    console.log('开始加载 Vue 和 Element Plus...');
    
    // 按顺序加载
    return loadCSS('https://unpkg.com/element-plus/dist/index.css')
        .then(() => {
            console.log('Element Plus CSS 加载成功');
            return loadScript('https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js');
        })
        .then(() => {
            console.log('Vue 3 加载成功');
            return loadScript('https://unpkg.com/element-plus');
        })
        .then(() => {
            console.log('Element Plus 加载成功');
            console.log('Vue 和 Element Plus 加载完成！');
            // 这里可以初始化 Vue 应用
            initVueApp();
        })
        .catch(error => {
            console.error('加载失败:', error);
        });
}

// Vue 应用初始化函数
function initVueApp() {
    // 检查全局变量是否存在
    if (window.Vue && window.ElementPlus) {
        console.log('Vue, ElementPlus 已就绪:', {
            Vue: window.Vue,
            ElementPlus: window.ElementPlus
        });
        
        // 创建 Vue 应用
        const { createApp } = window.Vue;
        
        const app = createApp({
            data() {
                return {
                    message: 'Vue 3 + Element Plus 应用'
                };
            },
            template: `
                <div style="padding: 20px; border: 1px solid #ddd; margin: 10px;">
                    <h4>{{ message }}</h4>
                    <el-button type="primary">Element Plus 按钮</el-button>
                    <el-alert title="成功提示" type="success" style="margin-top: 10px;"></el-alert>
                </div>
            `
        });
        
        // 使用 Element Plus
        app.use(window.ElementPlus);
        
        // 挂载到 DOM
        const vueContainer = document.createElement('div');
        vueContainer.id = 'vue-app';
        document.body.appendChild(vueContainer);
        
        app.mount('#vue-app');
    }
}

// 分别加载两个框架
function loadAllLibraries() {
    // 先加载 React + Ant Design
    loadReactAndAntd()
        .then(() => {
            console.log('=== React 部分加载完成 ===');
            // 然后加载 Vue + Element Plus
            return loadVueAndElementPlus();
        })
        .then(() => {
            console.log('=== 所有库加载完成 ===');
        })
        .catch(error => {
            console.error('整体加载失败:', error);
        });
}

// 或者按需加载
function loadReactOnly() {
    loadReactAndAntd();
}

function loadVueOnly() {
    loadVueAndElementPlus();
}

// 启动加载
// loadAllLibraries();
// loadReactOnly();

/**
 * 创建可复用的提示框组件
 * @param {string} message - 提示框显示的文本内容
 * @param {string} [type='info'] - 提示框类型，可选值: 'info' | 'success' | 'error' | 'warning' | 'tip'
 * @param {number} [duration=3000] - 提示框显示时长（毫秒），默认3000ms
 * @returns {void}
 * 
 * @example
 * // 基础用法
 * showToast('操作成功', 'success');
 * 
 * @example
 * // 自定义时长
 * showToast('加载中...', 'info', 5000);
 * 
 * @example
 * // 不同类型示例
 * showToast('这是一个信息提示', 'info');
 * showToast('操作成功完成', 'success');
 * showToast('发生了一个错误', 'error');
 * showToast('请注意风险', 'warning');
 * showToast('这是一个小贴士', 'tip');
 */
function showToast(message, type = 'info', duration = 3000) {
    // 移除已存在的提示框
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 定义不同类型对应的样式
    const typeStyles = {
        info: {
            backgroundColor: 'rgba(24, 144, 255, 0.9)',
            icon: 'ℹ️'
        },
        success: {
            backgroundColor: 'rgba(82, 196, 26, 0.9)',
            icon: '✅'
        },
        error: {
            backgroundColor: 'rgba(245, 34, 45, 0.9)',
            icon: '❌'
        },
        warning: {
            backgroundColor: 'rgba(250, 173, 20, 0.9)',
            icon: '⚠️'
        },
        tip: {
            backgroundColor: 'rgba(114, 46, 209, 0.9)',
            icon: '💡'
        }
    };

    // 获取对应类型的样式，如果类型不存在则使用默认的info样式
    const style = typeStyles[type] || typeStyles.info;

    // 创建提示框元素
    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        background-color: ${style.backgroundColor};
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 1002;
        opacity: 1;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 200px;
        max-width: 400px;
        word-break: break-word;
        line-height: 1.5;
        border-left: 4px solid rgba(255, 255, 255, 0.3);
    `;

    // 添加图标和消息内容
    toast.innerHTML = `
        <span style="font-size: 16px;">${style.icon}</span>
        <span>${message}</span>
    `;

    // 添加到页面
    document.body.appendChild(toast);

    // 强制重绘，确保动画能正常触发
    toast.offsetHeight;

    // 设置定时器，在指定时间后开始消失动画
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-40px)';

        // 动画结束后移除元素
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }, duration);
}

/**
 * 封装工具条按钮下载功能
 * @param {Object} config 配置对象
 * @param {string} config.containerId 工具条容器ID
 * @param {string} config.buttonOriginId 按钮originid属性值
 * @param {string} config.downloadUrl 下载请求URL
 * @param {string} config.dbToken 账套号
 * @param {Object} config.requestData 请求数据
 * @param {Array} config.requestData.asrFids 文件ID数组
 * @param {string} config.requestData.loginId 登录ID
 * @param {string} config.requestData.orgId 组织ID
 * @param {string} config.requestData.busTypeCode 业务类型编码
 * @param {string} config.requestData.wmDisabled 水印禁用标志
 * @param {string} config.requestData.billWM 业务水印内容
 * @param {string} config.fileName 下载文件名
 */
function initToolbarDownload(config) {
    const {
        containerId,
        buttonOriginId,
        downloadUrl,
        dbToken,
        requestData,
        fileName
    } = config;

    // 参数校验
    if (!containerId || !buttonOriginId || !downloadUrl) {
        console.error('缺少必要参数：containerId、buttonOriginId、downloadUrl');
        return;
    }

    // 获取目标div容器
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`未找到ID为"${containerId}"的容器`);
        return;
    }

    // 在容器内查找所有符合条件的按钮
    const buttons = container.querySelectorAll(`button[originid="${buttonOriginId}"]`);
    if (buttons.length === 0) {
        console.warn(`在容器"${containerId}"中未找到originid为"${buttonOriginId}"的按钮`);
        return;
    }

    // 下载文件函数
    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // 为每个符合条件的按钮添加点击事件
    buttons.forEach(button => {
        // 移除已存在的事件监听器，避免重复绑定
        button.replaceWith(button.cloneNode(true));
        const newButton = container.querySelector(`button[originid="${buttonOriginId}"]`);
        
        newButton.addEventListener('click', function () {
            console.log(`按钮"${buttonOriginId}"被点击`);
            
            // 发送下载请求
            $NG.request.post({
                url: downloadUrl,
                headers: {
                    dbToken: dbToken,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(requestData)
            }).then((res) => {
                console.log('下载响应:', res);
                
                if (res.data && res.data[requestData.asrFids[0]]) {
                    const downloadUrl = res.data[requestData.asrFids[0]];
                    downloadFile(downloadUrl, fileName);
                    console.log(`开始下载文件: ${fileName}`);
                } else {
                    console.error('未获取到有效的下载URL');
                }
            }).catch((error) => {
                console.error('下载请求失败:', error);
            });
        });
    });
    
    console.log(`成功为容器"${containerId}"中的"${buttonOriginId}"按钮绑定下载事件`);
}

/**
 * 树形结构展开控制面板
 * @param {Object} options - 配置选项
 * @param {number} [options.defaultLevels=5] - 默认显示的层级按钮数量
 * @param {number} [options.maxCustomLevel=25] - 自定义输入的最大层级
 * @param {string} [options.toolbarSelector='div.udp-panel-title#_rq_'] - 工具栏容器选择器
 * @param {string} [options.containerSelector='.row-hover.rows-container.editable'] - 树形结构容器选择器
 * @param {number} [options.animationDelay=100] - 动画延迟时间(ms)
 */
function createTreeExpandPanel(options = {}) {
    // 合并默认配置
    const config = {
        defaultLevels: 5,
        maxCustomLevel: 25,
        toolbarSelector: 'div.udp-panel-title#_rq_',
        containerSelector: '.row-hover.rows-container.editable',
        animationDelay: 100,
        ...options
    };

    // 获取目标元素
    const toolbarDiv = document.querySelector(config.toolbarSelector);
    if (!toolbarDiv) {
        console.error(`未找到工具栏容器: ${config.toolbarSelector}`);
        return;
    }

    // 全局函数定义
    function expandToLevel(level = 0) {
        if (level <= 0) return;

        function collapseAllElements(callback) {
            const container = document.querySelector(config.containerSelector);
            if (!container) {
                console.log('未找到容器');
                return;
            }

            const elements = container.querySelectorAll('.udp-row-expand-icon.udp-row-expand-icon-expanded');
            if (elements.length > 0) {
                console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
                elements.forEach(el => el.click());
                setTimeout(() => collapseAllElements(callback), config.animationDelay);
            } else {
                console.log('所有元素已收起');
                if (callback) callback();
            }
        }

        function startLevelExpansion(currentLevel = 0) {
            if (currentLevel >= level) {
                console.log(`已展开到第 ${level} 层，停止`);
                return;
            }

            const container = document.querySelector(config.containerSelector);
            if (!container) {
                console.log('未找到容器');
                return;
            }

            const elements = container.querySelectorAll('.udp-row-expand-icon.udp-row-expand-icon-collapsed');
            if (elements.length > 0) {
                console.log(`展开第 ${currentLevel + 1} 层，找到 ${elements.length} 个元素`);
                elements.forEach(el => el.click());
                setTimeout(() => startLevelExpansion(currentLevel + 1), config.animationDelay);
            } else {
                console.log(`第 ${currentLevel + 1} 层无更多可展开元素，提前终止`);
            }
        }

        collapseAllElements(() => startLevelExpansion());
    }

    function expandAllElements() {
        const container = document.querySelector(config.containerSelector);
        if (!container) {
            console.log('未找到容器');
            return;
        }

        const elements = container.querySelectorAll('.udp-row-expand-icon.udp-row-expand-icon-collapsed');
        if (elements.length > 0) {
            console.log(`找到 ${elements.length} 个折叠元素，正在展开...`);
            elements.forEach(el => el.click());
            setTimeout(expandAllElements, config.animationDelay);
        } else {
            console.log('所有元素已展开');
        }
    }

    function collapseAllElements() {
        const container = document.querySelector(config.containerSelector);
        if (!container) {
            console.log('未找到容器');
            return;
        }

        const elements = container.querySelectorAll('.udp-row-expand-icon.udp-row-expand-icon-expanded');
        if (elements.length > 0) {
            console.log(`找到 ${elements.length} 个展开元素，正在收起...`);
            elements.forEach(el => el.click());
            setTimeout(collapseAllElements, config.animationDelay);
        } else {
            console.log('所有元素已收起');
        }
    }
		
    // 创建状态对象
    const panelState = {
        isExpanded: false,
        currentLevel: 1
    };

    // 创建主面板 - 政府网站风格
    const panel = document.createElement('div');
    panel.className = 'x-panel x-box-item x-panel-default';
    panel.id = 'tree-expand-panel';
    panel.style.cssText = `
        margin: 0 1% 0 1%;
        height: 40px;
        width: auto;
        min-width: ${480 + (config.defaultLevels - 5) * 40}px;
        background: #f8f9fa;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #d1d7dc;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        padding: 0 15px;
    `;

    // 创建"层级："标签
    const levelLabel = document.createElement('span');
    levelLabel.textContent = '层级';
    levelLabel.style.cssText = `
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
        color: #333;
        margin-right: 10px;
        white-space: nowrap;
    `;
    panel.appendChild(levelLabel);

    // 面板body
    const panelBody = document.createElement('div');
    panelBody.id = 'tree-expand-panel-body';
    panelBody.style.cssText = `
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
    `;

    // 创建按钮的函数
    const createButton = (id, text, left, level) => {
        const btn = document.createElement('div');
        btn.className = 'x-btn x-box-item';
        btn.id = id;

        btn.style.cssText = `
            position: absolute;
            left: ${left}px;
            height: 30px;
            width: 30px;
            background: #fff;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            border: 1px solid #d1d7dc;
            user-select: none;
            font-family: "Microsoft YaHei", sans-serif;
        `;

        // 悬停效果
        btn.onmouseenter = () => {
            btn.style.background = '#f0f5ff';
            btn.style.borderColor = '#409eff';
        };

        btn.onmouseleave = () => {
            btn.style.background = '#fff';
            btn.style.borderColor = '#d1d7dc';
        };

        // 点击效果
        btn.onmousedown = () => {
            btn.style.transform = 'translateY(1px)';
        };

        btn.onmouseup = () => {
            btn.style.transform = 'translateY(0)';
        };

        const btnInner = document.createElement('span');
        btnInner.textContent = text;
        btnInner.style.cssText = `
            font-size: 14px;
            color: #333;
        `;

        btn.appendChild(btnInner);

        // 添加点击事件
        btn.addEventListener('click', () => {
            console.log(`点击了层级按钮: ${text}`);
            panelState.currentLevel = level;
            console.log('当前层级状态:', panelState);
            if (level == 1) {
                collapseAllElements();//收起就是一级
            } else {
                expandToLevel(level - 1);
            }
        });

        return btn;
    };

    // 创建层级按钮
    const buttons = [];
    for (let i = 1; i <= config.defaultLevels; i++) {
        const button = createButton(`level-btn-${i}`, i.toString(), (i - 1) * 40, i);
        buttons.push(button);
        panelBody.appendChild(button);
    }

    // 全展/收起按钮
    const expandBtnLeft = config.defaultLevels * 40;
    const expandBtn = createButton('expandAllTreeBtn', '展开', expandBtnLeft, 0);
    expandBtn.style.width = '50px';
    expandBtn.style.background = '#409eff';
    expandBtn.style.color = '#fff';
    expandBtn.style.borderColor = '#409eff';
    expandBtn.firstChild.style.color = '#fff';

    // 悬停效果
    expandBtn.onmouseenter = () => {
        expandBtn.style.background = '#66b1ff';
        expandBtn.style.borderColor = '#66b1ff';
    };
    expandBtn.onmouseleave = () => {
        expandBtn.style.background = '#409eff';
        expandBtn.style.borderColor = '#409eff';
    };

    expandBtn.addEventListener('click', () => {
        panelState.isExpanded = !panelState.isExpanded;

        if (panelState.isExpanded) {
            expandBtn.firstChild.textContent = '收起';
            console.log('执行了展开操作');
            expandAllElements();
        } else {
            expandBtn.firstChild.textContent = '展开';
            console.log('执行了收起操作');
            collapseAllElements();
        }

        console.log('当前展开状态:', panelState.isExpanded);
    });

    panelBody.appendChild(expandBtn);

    // 添加分隔线
    const separatorLeft = expandBtnLeft + 70;
    const separator = document.createElement('div');
    separator.style.cssText = `
        position: absolute;
        left: ${separatorLeft}px;
        height: 25px;
        width: 1px;
        background-color: #d1d7dc;
        margin: 0 2%;
    `;
    panelBody.appendChild(separator);

    // To按钮
    const toButtonLeft = separatorLeft + 20;
    const toButton = document.createElement('div');
    toButton.className = 'x-btn x-box-item';
    toButton.id = 'toButton';
    toButton.textContent = 'To';
    toButton.style.cssText = `
        position: absolute;
        left: ${toButtonLeft}px;
        height: 30px;
        width: 40px;
        background: #409eff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid #409eff;
        user-select: none;
        font-family: "Microsoft YaHei", sans-serif;
        color: #fff;
    `;
    // 悬停效果
    toButton.onmouseenter = () => {
        toButton.style.background = '#66b1ff';
        toButton.style.borderColor = '#66b1ff';
    };
    toButton.onmouseleave = () => {
        toButton.style.background = '#409eff';
        toButton.style.borderColor = '#409eff';
    };
    // 点击效果
    toButton.onmousedown = () => {
        toButton.style.transform = 'translateY(1px)';
    };
    toButton.onmouseup = () => {
        toButton.style.transform = 'translateY(0)';
    };
    // 点击事件
    toButton.addEventListener('click', () => {
        const inputValue = levelInput.value;
        if (!inputValue) {
            showToast('请输入层级数字');
            return;
        }
        const level = parseInt(inputValue);
        if (level < (config.defaultLevels + 1) || level > config.maxCustomLevel) {
            showToast(`请输入${config.defaultLevels + 1}到${config.maxCustomLevel}之间的数字`);
            return;
        }
        const actualLevel = level - 1;  // 对输入值减一
        console.log(`展开到自定义层级: ${level} (实际参数: ${actualLevel})`);
        expandToLevel(actualLevel);
    });
    panelBody.appendChild(toButton);

    // 输入框
    const inputLeft = toButtonLeft + 50;
    const levelInput = document.createElement('input');
    levelInput.type = 'text';
    levelInput.id = 'levelInput';
    levelInput.placeholder = `${config.defaultLevels + 1}-${config.maxCustomLevel}`;
    levelInput.style.cssText = `
        position: absolute;
        left: ${inputLeft}px;
        width: 50px;
        height: 26px;
        border: 1px solid #d1d7dc;
        border-radius: 4px;
        padding: 0 5px;
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
    `;
    // 限制只能输入数字
    levelInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    panelBody.appendChild(levelInput);

    // "层"标签
    const labelLeft = inputLeft + 60;
    const layerLabel = document.createElement('span');
    layerLabel.textContent = '层';
    layerLabel.style.cssText = `
        position: absolute;
        left: ${labelLeft}px;
        font-family: "Microsoft YaHei", sans-serif;
        font-size: 14px;
        color: #333;
        margin-right: 5px;
        white-space: nowrap;
    `;
    panelBody.appendChild(layerLabel);

    panel.appendChild(panelBody);
    toolbarDiv.appendChild(panel);

    // 返回销毁方法
    return {
        destroy: () => {
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
        }
    };
}
/**
 * 创建下拉按钮组组件
 * @param {string} toolbarSelector - 工具栏选择器
 * @param {Array} buttonConfigs - 按钮配置数组
 * @param {Object} options - 可选配置
 */
function createDropdownButtonGroup(toolbarSelector, buttonConfigs, options = {}) {
    // 获取目标元素
    const toolbar = document.querySelector(toolbarSelector);
    if (!toolbar) {
        console.warn(`未找到工具栏元素: ${toolbarSelector}`);
        return;
    }

    // 默认配置
    const defaultOptions = {
        mainButtonText: '查询报表',
        mainButtonColor: '#007bff',
        mainButtonHoverColor: '#0056b3',
        zIndex: 9999,
        ...options
    };

    // 创建按钮组容器
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'query-report-group';
    buttonGroup.style.position = 'relative';
    buttonGroup.style.display = 'inline-block';

    // 创建主按钮
    const mainButton = createMainButton(defaultOptions);
    
    // 创建子按钮容器
    const subButtonsContainer = createSubButtonsContainer(defaultOptions);
    
    // 创建子按钮
    createSubButtons(subButtonsContainer, buttonConfigs);

    // 将子按钮容器添加到body
    document.body.appendChild(subButtonsContainer);

    // 显示/隐藏控制函数
    const { showSubButtons, hideSubButtons } = createVisibilityControls(
        mainButton, 
        subButtonsContainer, 
        defaultOptions
    );

    // 绑定事件
    bindEvents(mainButton, buttonGroup, subButtonsContainer, showSubButtons, hideSubButtons);

    // 组装元素
    buttonGroup.appendChild(mainButton);
    toolbar.appendChild(buttonGroup);

    return {
        buttonGroup,
        mainButton,
        subButtonsContainer,
        showSubButtons,
        hideSubButtons
    };
}

/**
 * 创建主按钮
 */
function createMainButton(options) {
    const mainButton = document.createElement('button');
    mainButton.textContent = options.mainButtonText;
    mainButton.style.padding = '8px 16px';
    mainButton.style.backgroundColor = options.mainButtonColor;
    mainButton.style.color = 'white';
    mainButton.style.border = 'none';
    mainButton.style.borderRadius = '4px';
    mainButton.style.cursor = 'pointer';
    mainButton.style.marginLeft = '10px';
    mainButton.style.fontSize = '14px';
    mainButton.style.fontWeight = '500';
    mainButton.style.transition = 'all 0.2s ease';
    mainButton.style.display = 'flex';
    mainButton.style.alignItems = 'center';
    mainButton.style.justifyContent = 'space-between';
    mainButton.style.minWidth = '120px';

    // 添加下拉箭头
    const arrowIcon = document.createElement('span');
    arrowIcon.innerHTML = '▼';
    arrowIcon.style.fontSize = '10px';
    arrowIcon.style.marginLeft = '8px';
    arrowIcon.style.transition = 'transform 0.2s ease';
    mainButton.appendChild(arrowIcon);

    return mainButton;
}

/**
 * 创建子按钮容器
 */
function createSubButtonsContainer(options) {
    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.className = 'sub-buttons-container';
    subButtonsContainer.style.display = 'none';
    subButtonsContainer.style.position = 'fixed';
    subButtonsContainer.style.backgroundColor = 'white';
    subButtonsContainer.style.border = '1px solid #ddd';
    subButtonsContainer.style.borderRadius = '4px';
    subButtonsContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    subButtonsContainer.style.zIndex = options.zIndex;
    subButtonsContainer.style.minWidth = '120px';
    subButtonsContainer.style.overflow = 'hidden';
    
    return subButtonsContainer;
}

/**
 * 创建子按钮
 */
function createSubButtons(container, buttonConfigs) {
    buttonConfigs.forEach((config, index) => {
        const subButton = document.createElement('button');
        subButton.textContent = config.text;
        subButton.dataset.id = config.id;
        subButton.style.display = 'block';
        subButton.style.width = '100%';
        subButton.style.padding = '10px 16px';
        subButton.style.border = 'none';
        subButton.style.backgroundColor = 'transparent';
        subButton.style.textAlign = 'left';
        subButton.style.cursor = 'pointer';
        subButton.style.fontSize = '14px';
        subButton.style.transition = 'background-color 0.2s ease';

        // 添加分隔线（除了最后一个按钮）
        if (index < buttonConfigs.length - 1) {
            subButton.style.borderBottom = '1px solid #f0f0f0';
        }

        // 添加悬停效果
        subButton.addEventListener('mouseenter', () => {
            subButton.style.backgroundColor = '#f8f9fa';
        });
        subButton.addEventListener('mouseleave', () => {
            subButton.style.backgroundColor = 'transparent';
        });

        // 添加点击事件
        subButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (config.onClick && typeof config.onClick === 'function') {
                config.onClick();
            }
            
            // 关闭子按钮菜单
            const event = new CustomEvent('hideSubButtons');
            document.dispatchEvent(event);
        });

        container.appendChild(subButton);
    });
}

/**
 * 创建显示/隐藏控制
 */
function createVisibilityControls(mainButton, subButtonsContainer, options) {
    const arrowIcon = mainButton.querySelector('span');
    
    const showSubButtons = () => {
        const rect = mainButton.getBoundingClientRect();
        subButtonsContainer.style.left = rect.left + 'px';
        subButtonsContainer.style.top = (rect.bottom + window.scrollY) + 'px';
        subButtonsContainer.style.width = rect.width + 'px';
        subButtonsContainer.style.display = 'block';
        arrowIcon.style.transform = 'rotate(180deg)';
        mainButton.style.backgroundColor = options.mainButtonHoverColor;
    };

    const hideSubButtons = () => {
        subButtonsContainer.style.display = 'none';
        arrowIcon.style.transform = 'rotate(0deg)';
        mainButton.style.backgroundColor = options.mainButtonColor;
    };

    return { showSubButtons, hideSubButtons };
}

/**
 * 绑定事件
 */
function bindEvents(mainButton, buttonGroup, subButtonsContainer, showSubButtons, hideSubButtons) {
    const arrowIcon = mainButton.querySelector('span');
    
    // 主按钮点击事件
    mainButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (subButtonsContainer.style.display === 'none') {
            showSubButtons();
        } else {
            hideSubButtons();
        }
    });

    // 鼠标悬停效果
    mainButton.addEventListener('mouseenter', () => {
        if (subButtonsContainer.style.display === 'none') {
            mainButton.style.backgroundColor = '#0056b3';
        }
    });

    mainButton.addEventListener('mouseleave', () => {
        if (subButtonsContainer.style.display === 'none') {
            mainButton.style.backgroundColor = '#007bff';
        }
    });

    // 检查是否点击在按钮组外部
    const isClickOutside = (target) => {
        return !buttonGroup.contains(target) && !subButtonsContainer.contains(target);
    };

    // 点击页面其他区域时隐藏子按钮
    document.addEventListener('click', (e) => {
        if (isClickOutside(e.target)) {
            hideSubButtons();
        }
    });

    // 自定义事件监听隐藏子按钮
    document.addEventListener('hideSubButtons', hideSubButtons);

    // 窗口事件
    window.addEventListener('blur', hideSubButtons);
    
    window.addEventListener('scroll', () => {
        if (subButtonsContainer.style.display === 'block') {
            const rect = mainButton.getBoundingClientRect();
            subButtonsContainer.style.left = rect.left + 'px';
            subButtonsContainer.style.top = (rect.bottom + window.scrollY) + 'px';
            subButtonsContainer.style.width = rect.width + 'px';
        }
    });

    window.addEventListener('resize', () => {
        if (subButtonsContainer.style.display === 'block') {
            const rect = mainButton.getBoundingClientRect();
            subButtonsContainer.style.left = rect.left + 'px';
            subButtonsContainer.style.top = (rect.bottom + window.scrollY) + 'px';
            subButtonsContainer.style.width = rect.width + 'px';
        }
    });

    // ESC键隐藏子按钮
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && subButtonsContainer.style.display === 'block') {
            hideSubButtons();
        }
    });
}
/**
 * 打开报表功能
 * @param {Object} options - 报表配置参数
 * @param {string} options.url - 报表URL
 * @param {string} options.title - 报表标题
 * @param {number} options.preview - 预览模式
 * @param {number} options.defaultSheet - 默认工作表
 * @param {number} options.rep_id - 报表ID
 */
function openReport(options) {
    const { url, title, preview, defaultSheet, rep_id } = options;
    
    console.log(`打开报表: ${title}`);
    
    $NG.confirm('确定打开？', {
        onOk: async () => {
            $NG.open(url, {
                AppTitle: title,
                preview: preview,
                rep_id: rep_id,
                defaultSheet: defaultSheet,
                name: title
            });
        }
    });
}

/**
 * 2025.10.10
 * 导出excel配置
 * @param editPage 页面对象
 * @param mstform 表单对象
 * @param busCode 业务编码
 * @param mainTable 主表配置 {tableName: string, sheetName: string}
 * @param detailTables 明细表配置数组 [{tableName: string, sheetName: string}]
 * @param exportButtonId 导出按钮的ID，默认为'u_export'
 */
const exportExcel = (editPage, mstform, busCode, mainTable, detailTables = [], exportButtonId = 'u_export') => {
    let res_data = {}; // 详细数据
    let res_style = {}; // 样式数据
    let xlsxLoadingPromise = null; // 用于存储加载脚本的Promise
    let isExporting = false; // 防止重复点击
    
    if (!editPage.isList) {
        const phid = mstform.getValues().phid;
        
        // 获取表单数据
        $NG.request.get({
            url: `/sup/customServer/getInfo?id=${phid}&oType=view&customBusCode=${busCode}&encryptPrimaryKey=${$NG.CryptoJS.encode(phid)}`
        }).then((res) => {
            console.log('表单数据:', res);
            res_data = res;
        });

        // 获取表单样式配置
        $NG.request.get({
            url: `/sup/customFrontend/getFrontendInfo?busType=${busCode}&formType=reactpc&pageType=edit&needMenuName=false&orgId=&isSso=0`
        }).then((res) => {
            console.log('样式配置:', res);
            res_style = res;
        });
    }

    /**
     * 绑定导出按钮点击事件
     */
    function bindExportButton() {
        // 查找导出按钮
        const exportButton = document.querySelector(`[originid="${exportButtonId}"]`);
        
        if (!exportButton) {
            console.warn(`未找到 originid 为 "${exportButtonId}" 的导出按钮`);
            // 延迟重试，适用于按钮动态生成的情况
            setTimeout(() => {
                const retryButton = document.querySelector(`[originid="${exportButtonId}"]`);
                if (retryButton) {
                    console.log('重试找到按钮，重新绑定');
                    bindSingleButton(retryButton);
                }
            }, 500);
            return;
        }
        
        bindSingleButton(exportButton);
    }
    
    /**
     * 绑定单个按钮事件
     */
    function bindSingleButton(button) {
        // 移除已存在的事件监听器（避免重复绑定）
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 绑定新的点击事件
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isExporting) {
                console.log('正在导出中，请稍候...');
                return;
            }
            
            isExporting = true;
            // 添加加载状态
            const originalText = newButton.textContent;
            newButton.textContent = '导出中...';
            newButton.disabled = true;
            
            try {
                await exportToXLSX();
            } catch (error) {
                console.error('导出失败:', error);
                $NG.alert('导出失败，请稍后重试');
            } finally {
                isExporting = false;
                // 恢复按钮状态
                newButton.textContent = originalText;
                newButton.disabled = false;
            }
        });
        
        console.log(`成功绑定导出按钮: ${exportButtonId}`);
    }

    /**
     * 根据列配置转换值（如下拉选项的键值转换）
     */
    function convertValueByColumn(col, value) {
        if (!value && value !== 0) return value;

        // 处理下拉选项的键值转换
        if (col.format && col.format.type === 'option' && Array.isArray(col.format.formatter)) {
            const option = col.format.formatter.find(opt => String(opt.value) === String(value));
            if (option) return option.label;
        }

        // 处理编辑器配置的下拉选项
        if (col.editor && col.editor.data && Array.isArray(col.editor.data)) {
            const option = col.editor.data.find(opt => String(opt.value) === String(value));
            if (option) return option.label;
        }

        return value;
    }

    /**
     * 动态加载XLSX库
     */
    function loadXLSXScript() {
        return new Promise((resolve, reject) => {
            if (typeof XLSX !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    /**
     * 获取嵌套属性值，优先获取_EXName后缀字段
     */
    function getNestedProperty(obj, path) {
        if (!obj || !path) return '';

        // 检查是否存在_EXName后缀的字段
        const exNamePath = path + '_EXName';
        let exNameValue = '';

        // 安全获取_EXName字段值
        try {
            exNameValue = exNamePath.split('.').reduce((acc, part) => {
                return (acc && acc[part] !== undefined) ? acc[part] : '';
            }, obj);
        } catch (e) {
            exNameValue = '';
        }

        // 当_EXName字段有值（非空字符串）时直接返回
        if (exNameValue !== null && exNameValue !== undefined && exNameValue !== '') {
            return exNameValue;
        }

        // 安全获取原始字段值
        try {
            return path.split('.').reduce((acc, part) => {
                return (acc && acc[part] !== undefined) ? acc[part] : '';
            }, obj);
        } catch (e) {
            return '';
        }
    }

    /**
     * 递归获取所有叶子列（处理分组列）
     */
    function getLeafColumns(columns) {
        let leafColumns = [];

        columns.forEach(col => {
            if (col.columns && Array.isArray(col.columns)) {
                // 处理分组列，递归获取子列
                leafColumns = leafColumns.concat(getLeafColumns(col.columns));
            } else if (col.dataIndex) {
                // 添加叶子列
                leafColumns.push(col);
            }
        });

        return leafColumns;
    }

    /**
     * 计算字符串宽度（用于列宽自适应）
     * 中文字符算2个宽度，英文字符算1个宽度
     */
    function getStringWidth(str) {
        if (!str) return 8;
        let width = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charAt(i);
            // 中文字符宽度为2，英文字符宽度为1
            width += /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
        }
        return width;
    }

    /**
     * 导出单个表格到XLSX工作表
     */
    function exportTableToXLSX(wb, data, columns, sheetName) {
        if (!columns || columns.length === 0) {
            console.warn(`表 ${sheetName} 没有列配置`);
            return;
        }

        // 获取所有叶子列（处理分组列）
        const leafColumns = getLeafColumns(columns);

        // 过滤掉隐藏列和没有dataIndex的列
        const visibleColumns = leafColumns.filter(col =>
            !col.hidden && col.dataIndex && col.header
        );

        if (visibleColumns.length === 0) {
            console.warn(`表 ${sheetName} 没有有效的列配置`);
            return;
        }

        // 准备数据
        const excelData = [];

        // 添加表头（中文标签）
        const headers = visibleColumns.map(col => col.header);
        excelData.push(headers);

        // 添加数据行
        if (Array.isArray(data)) {
            data.forEach(row => {
                const rowData = visibleColumns.map(col => {
                    let value = getNestedProperty(row, col.dataIndex);
                    value = convertValueByColumn(col, value); // 键值转换
                    return value;
                });
                excelData.push(rowData);
            });
        } else if (typeof data === 'object') {
            const rowData = visibleColumns.map(col => {
                let value = getNestedProperty(data, col.dataIndex);
                value = convertValueByColumn(col, value); // 键值转换
                return value;
            });
            excelData.push(rowData);
        }

        // 创建工作表
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // 设置表头样式（橙色背景）和所有数据居中
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // 遍历所有单元格设置样式
        for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
                
                if (ws[cellAddress]) {
                    // 确保单元格有样式对象
                    if (!ws[cellAddress].s) {
                        ws[cellAddress].s = {};
                    }
                    
                    // 设置对齐方式 - 所有单元格都居中
                    ws[cellAddress].s.alignment = {
                        horizontal: "center",
                        vertical: "center"
                    };
                    
                    // 第一行（表头）设置橙色背景和粗体
                    if (rowNum === 0) {
                        ws[cellAddress].s.fill = {
                            patternType: "solid",
                            fgColor: { rgb: "FFA500" } // 橙色
                        };
                        ws[cellAddress].s.font = {
                            bold: true,
                            color: { rgb: "000000" } // 黑色字体
                        };
                    }
                }
            }
        }

        // 设置列宽自适应
        const colWidths = [];
        for (let col = 0; col < visibleColumns.length; col++) {
            let maxWidth = getStringWidth(headers[col]); // 表头宽度作为初始值
            
            // 遍历该列的所有数据行，找到最长的内容
            for (let row = 1; row < excelData.length; row++) {
                const cellValue = excelData[row][col];
                if (cellValue !== null && cellValue !== undefined) {
                    const cellWidth = getStringWidth(String(cellValue));
                    if (cellWidth > maxWidth) {
                        maxWidth = cellWidth;
                    }
                }
            }
            
            // 设置列宽，添加一些边距，最小宽度为8，最大宽度为50
            const colWidth = Math.min(Math.max(maxWidth + 2, 8), 50);
            colWidths.push({ width: colWidth });
        }
        
        ws['!cols'] = colWidths;

        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        console.log(`表 ${sheetName} 导出完成，列宽设置:`, colWidths);
    }

    /**
     * 主导出函数
     */
    async function exportToXLSX() {
        if (!res_data.data || !res_style.data) {
            $NG.alert('数据未准备好，请稍后再试');
            return;
        }

        // 确保XLSX库已加载
        if (typeof XLSX === 'undefined') {
            try {
                if (!xlsxLoadingPromise) {
                    xlsxLoadingPromise = loadXLSXScript();
                }
                await xlsxLoadingPromise;
            } catch (e) {
                $NG.alert('加载XLSX库失败，无法导出');
                return;
            }
        }

        // 动态识别需要导出的表
        const tables = [];

        // 添加主表
        if (res_data.data[mainTable.tableName]) {
            const mainTableColumns = res_style.data.uiContent.grid[mainTable.tableName + '_list']?.columns || [];
            tables.push({
                name: mainTable.tableName,
                sheetName: mainTable.sheetName,
                columns: mainTableColumns,
                data: [res_data.data[mainTable.tableName]]
            });
        }

        // 添加明细表
        detailTables.forEach(detailTable => {
            if (res_data.data[detailTable.tableName] && res_data.data[detailTable.tableName].length > 0) {
                const detailTableColumns = res_style.data.uiContent.grid[detailTable.tableName]?.columns || [];
                tables.push({
                    name: detailTable.tableName,
                    sheetName: detailTable.sheetName,
                    columns: detailTableColumns,
                    data: res_data.data[detailTable.tableName]
                });
            }
        });

        if (tables.length === 0) {
            $NG.alert('没有找到可导出的数据');
            return;
        }

        // 创建XLSX工作簿
        const wb = XLSX.utils.book_new();

        // 导出所有表到同一个XLSX文件的不同sheet页
        tables.forEach(table => {
            exportTableToXLSX(wb, table.data, table.columns, table.sheetName);
        });

        // 生成XLSX文件并下载
        const fileName = `${mainTable.sheetName}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        // $NG.alert('导出成功！');
    }

    // 绑定导出按钮
    bindExportButton();
}

/**
 * 根据 editPage.compIds 动态生成配置的便捷函数
 */
function createExportConfig(editPage, mainSheetName = '主表数据') {
    console.log('editPage.compIds:', editPage.compIds); // 调试信息
    
    // 检查 editPage.compIds 是否存在
    if (!editPage.compIds) {
        console.error('editPage.compIds 未定义');
        return null;
    }
    
    // 获取主表配置 - 尝试多种可能的属性名
    let mainTableSet;
    
    // 处理 formSets（可能是 Set 对象）
    if (editPage.compIds.formSets && editPage.compIds.formSets.size > 0) {
        // 如果是 Set，转换为数组并取第一个元素
        mainTableSet = Array.from(editPage.compIds.formSets)[0];
        console.log('从 formSets 获取到主表:', mainTableSet);
    }
    // 处理 forms（可能是 Set 对象）
    else if (editPage.compIds.forms && editPage.compIds.forms.size > 0) {
        mainTableSet = Array.from(editPage.compIds.forms)[0];
        console.log('从 forms 获取到主表:', mainTableSet);
    }
    // 尝试从 formSet 获取（单数形式）
    else if (editPage.compIds.formSet) {
        mainTableSet = editPage.compIds.formSet;
        console.log('从 formSet 获取到主表:', mainTableSet);
    }
    // 尝试从其他可能的位置获取
    else if (editPage.compIds.mainTable) {
        mainTableSet = editPage.compIds.mainTable;
        console.log('从 mainTable 获取到主表:', mainTableSet);
    }

    if (!mainTableSet) {
        console.error('未找到主表配置，可用的属性:', Object.keys(editPage.compIds));
        return null;
    }

    const mainTable = {
        tableName: mainTableSet,
        sheetName: mainSheetName
    };

    // 获取明细表配置 - 排除主表
    let detailTables = [];
    
    // 处理 grids（可能是 Set 对象）
    if (editPage.compIds.grids && editPage.compIds.grids.size > 0) {
        const gridArray = Array.from(editPage.compIds.grids);
        detailTables = gridArray
            .filter(gridName => gridName !== mainTableSet) // 排除主表
            .map((gridName, index) => ({
                tableName: gridName,
                sheetName: `明细表${index + 1}`
            }));
    }

    console.log('生成的配置 - 主表:', mainTable, '明细表:', detailTables);
    return { mainTable, detailTables };
}

/**
 * 便捷调用函数 - 增强版本
 */
function setupExport(editPage, mstform, busCode, options = {}) {
    if (editPage.isList) {
        console.log('当前为列表页面，跳过导出设置');
        return;
    }
    
    console.log('开始设置导出功能...');
    
    const config = createExportConfig(editPage, options.mainSheetName);
    
    if (!config) {
        const errorMsg = '导出配置创建失败：无法识别主表配置。请检查 editPage.compIds 结构。';
        console.error(errorMsg);
        
        // 提供更友好的错误信息
        if (editPage.compIds) {
            console.error('可用的 compIds 属性:', Object.keys(editPage.compIds));
            if (editPage.compIds.formSets) {
                console.error('formSets 内容:', editPage.compIds.formSets);
                console.error('formSets 类型:', typeof editPage.compIds.formSets);
                console.error('formSets size:', editPage.compIds.formSets.size);
            }
            if (editPage.compIds.grids) {
                console.error('grids 内容:', editPage.compIds.grids);
                console.error('grids 类型:', typeof editPage.compIds.grids);
                console.error('grids size:', editPage.compIds.grids.size);
            }
        } else {
            console.error('editPage.compIds 未定义');
        }
        
        $NG.alert('导出配置创建失败，请查看控制台获取详细信息');
        return;
    }

    // 如果有自定义的明细表sheet名称，可以在这里覆盖
    if (options.detailSheetNames) {
        config.detailTables.forEach((detail, index) => {
            if (options.detailSheetNames[detail.tableName]) {
                detail.sheetName = options.detailSheetNames[detail.tableName];
            }
        });
    }

    // 获取导出按钮ID，默认为'u_export'
    const exportButtonId = options.exportButtonId || 'u_export';

    console.log('最终导出配置:', config);
    exportExcel(editPage, mstform, busCode, config.mainTable, config.detailTables, exportButtonId);
}

/**
 * 手动配置版本的导出设置函数
 * 当自动检测失败时使用此函数
 */
function setupExportManual(editPage, mstform, busCode, manualConfig) {
    if (editPage.isList) return;
    
    const { mainTable, detailTables = [], exportButtonId = 'u_export' } = manualConfig;
    
    if (!mainTable || !mainTable.tableName) {
        $NG.alert('手动配置失败：缺少主表配置');
        return;
    }
    
    console.log('使用手动配置:', manualConfig);
    exportExcel(editPage, mstform, busCode, mainTable, detailTables, exportButtonId);
}


// 简化版元素隐藏工具 - 原生JavaScript实现
    const ElementHider = {
        // 存储隐藏的元素信息
        hiddenElements: [],

        // 配置选择器
        selectors: {
            toolbarSelector: 'div.udp-panel-title#_rq_',
            containerSelector: '.row-hover.rows-container.editable'
        },

        // 初始化函数
        init: function () {
            // 从localStorage加载之前隐藏的元素
            this.loadFromStorage();

            // 重新应用隐藏状态（防止页面刷新后元素恢复显示）
            this.reapplyHiddenState();

            console.log('ElementHider 初始化完成');
        },

        // 通过通用选择器隐藏元素
        hide: function (selector) {
            if (!selector || typeof selector !== 'string') {
                console.error('无效的选择器');
                return 0;
            }

            // 使用querySelectorAll获取所有匹配的元素
            const elements = document.querySelectorAll(selector);

            if (elements.length === 0) {
                console.warn(`未找到匹配 "${selector}" 的元素`);
                return 0;
            }

            // 隐藏元素并记录
            let hiddenCount = 0;
            elements.forEach(element => {
                // 检查元素是否已经隐藏
                if (element.style.display === 'none') {
                    return;
                }

                // 保存原始display属性以便恢复
                const originalDisplay = element.style.display || '';

                // 隐藏元素
                element.style.display = 'none';

                // 记录隐藏的元素
                this.hiddenElements.push({
                    selector: selector,
                    element: element,
                    originalDisplay: originalDisplay,
                    timestamp: new Date().toISOString()
                });

                hiddenCount++;
            });

            // 保存到localStorage
            this.saveToStorage();

            console.log(`成功隐藏 ${hiddenCount} 个元素 (选择器: ${selector})`);
            return hiddenCount;
        },

        // 显示所有隐藏的元素
        showAll: function () {
            if (this.hiddenElements.length === 0) {
                console.log('没有隐藏的元素可显示');
                return 0;
            }

            const count = this.hiddenElements.length;

            // 恢复所有隐藏的元素
            this.hiddenElements.forEach(item => {
                if (item.element && item.element.style) {
                    item.element.style.display = item.originalDisplay;
                }
            });

            // 清空记录
            this.hiddenElements = [];
            this.saveToStorage();

            console.log(`成功显示 ${count} 个隐藏元素`);
            return count;
        },

        // 显示特定选择器的元素
        show: function (selector) {
            if (!selector) {
                console.error('无效的选择器');
                return 0;
            }

            const elementsToShow = this.hiddenElements.filter(item => item.selector === selector);

            if (elementsToShow.length === 0) {
                console.warn(`没有找到与 "${selector}" 匹配的隐藏元素`);
                return 0;
            }

            // 恢复显示
            elementsToShow.forEach(item => {
                if (item.element && item.element.style) {
                    item.element.style.display = item.originalDisplay;
                }
            });

            // 从记录中移除
            this.hiddenElements = this.hiddenElements.filter(item => item.selector !== selector);
            this.saveToStorage();

            console.log(`成功显示 ${elementsToShow.length} 个元素 (选择器: ${selector})`);
            return elementsToShow.length;
        },

        // 获取隐藏历史
        getHistory: function () {
            return [...this.hiddenElements];
        },

        // 清除所有隐藏记录
        clearHistory: function () {
            this.hiddenElements = [];
            this.saveToStorage();
            console.log('隐藏历史已清除');
        },

        // 保存到localStorage
        saveToStorage: function () {
            try {
                // 只保存必要信息，不能保存DOM元素的引用
                const storageData = this.hiddenElements.map(item => ({
                    selector: item.selector,
                    originalDisplay: item.originalDisplay,
                    timestamp: item.timestamp
                }));

                localStorage.setItem('elementHiderData', JSON.stringify(storageData));
            } catch (e) {
                console.error('保存到localStorage失败:', e);
            }
        },

        // 从localStorage加载
        loadFromStorage: function () {
            try {
                const storedData = localStorage.getItem('elementHiderData');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    this.hiddenElements = parsedData || [];
                }
            } catch (e) {
                console.error('从localStorage加载数据失败:', e);
                this.hiddenElements = [];
            }
        },

        // 重新应用隐藏状态（用于页面刷新后）
        reapplyHiddenState: function () {
            // 由于DOM元素引用不能保存，我们需要重新查找并隐藏
            const elementsToRehide = [...this.hiddenElements];
            this.hiddenElements = [];

            elementsToRehide.forEach(item => {
                this.hide(item.selector);
            });
        },

        // 使用预定义选择器隐藏工具栏
        hideToolbar: function () {
            return this.hide(this.selectors.toolbarSelector);
        },

        // 使用预定义选择器隐藏容器
        hideContainer: function () {
            return this.hide(this.selectors.containerSelector);
        },

        // 更新选择器配置
        updateSelectors: function (newSelectors) {
            this.selectors = { ...this.selectors, ...newSelectors };
            console.log('选择器配置已更新', this.selectors);
        }
    };

    // 初始化
    ElementHider.init();

// 使用示例：
// 1. 隐藏预定义的工具栏
// ElementHider.hideToolbar();

// 2. 隐藏预定义的容器
// ElementHider.hideContainer();

// 3. 使用自定义选择器隐藏元素
// ElementHider.hide('div.udp-panel-title#_rq_');

// 4. 显示所有隐藏的元素
// ElementHider.showAll();

// 5. 显示特定选择器的元素
// ElementHider.show('div.udp-panel-title#_rq_');

// 6. 获取隐藏历史
// const history = ElementHider.getHistory();

// 7. 清除历史记录
// ElementHider.clearHistory();

// 8. 更新选择器配置
// ElementHider.updateSelectors({
//     toolbarSelector: 'div.new-toolbar',
//     containerSelector: '.new-container'
// });




 /**
 * 创建授权验证覆盖界面
 * @param {string} contactPerson - 联系人姓名
 * @param {string} correctCode - 正确的授权码
 * @param {Function} onSuccess - 校验成功时的回调函数
 * @returns {Object} 返回包含hide、show和事件绑定方法的对象
 */
    function createAuthOverlay(contactPerson, correctCode, onSuccess) {
        // 创建样式
        const style = document.createElement('style');
        style.textContent = `
        .auth-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .auth-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 40px;
            width: 90%;
            max-width: 420px;
            text-align: center;
            animation: authFadeIn 0.5s ease-out;
        }
        
        @keyframes authFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .lock-icon {
            font-size: 70px;
            margin-bottom: 25px;
            color: #3498db;
        }
        
        .auth-prompt {
            color: #7f8c8d;
            margin-bottom: 25px;
            line-height: 1.5;
            font-size: 16px;
            padding: 0 10px;
        }
        
        .auth-input-container {
            margin-bottom: 25px;
            display: flex;
            justify-content: center;
        }
        
        .auth-input {
            width: 200px;
            padding: 14px 18px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s;
            text-align: center;
        }
        
        .auth-input:focus {
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
        
        .auth-button {
            width: 200px;
            padding: 14px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .auth-button:hover {
            background-color: #2980b9;
            transform: translateY(-2px);
        }
        
        .auth-message {
            margin-top: 15px;
            font-size: 14px;
            min-height: 20px;
        }
        
        .auth-error {
            color: #e74c3c;
        }
        
        .auth-success {
            color: #2ecc71;
        }
        
        .auth-hidden {
            display: none !important;
        }
    `;
        document.head.appendChild(style);

        // 创建覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';

        // 创建授权容器
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-container';

        // 创建锁图标
        const lockIcon = document.createElement('div');
        lockIcon.className = 'lock-icon';
        lockIcon.innerHTML = '<svg t="1760610445556" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6985" width="100" height="100"><path d="M720.64 24.32H245.76C160 24.32 90.88 93.44 90.88 179.2v643.84c0 40.96 16.64 79.36 46.08 108.8 26.88 26.88 61.44 42.24 98.56 44.8h213.76c19.2 0 34.56-15.36 34.56-34.56s-15.36-34.56-34.56-34.56H245.76c-46.08 0-84.48-38.4-84.48-84.48V179.2c0-46.08 38.4-84.48 84.48-84.48h474.88c46.08 0 84.48 38.4 84.48 84.48v282.88c0 19.2 15.36 34.56 34.56 34.56s34.56-15.36 34.56-34.56V179.2c0-85.76-69.12-154.88-153.6-154.88z" fill="#1296db" p-id="6986"></path><path d="M678.4 249.6H282.88c-19.2 0-34.56 15.36-34.56 34.56 0 19.2 15.36 34.56 34.56 34.56H678.4c19.2 0 34.56-15.36 34.56-34.56 1.28-19.2-14.08-34.56-34.56-34.56zM528.64 463.36H282.88c-19.2 0-34.56 15.36-34.56 34.56 0 19.2 15.36 34.56 34.56 34.56h244.48c8.96 0 17.92-3.84 24.32-10.24s10.24-15.36 10.24-25.6c1.28-17.92-14.08-33.28-33.28-33.28zM387.84 677.12h-103.68c-12.8 0-24.32 6.4-30.72 17.92-6.4 10.24-6.4 24.32 0 34.56 6.4 10.24 17.92 17.92 30.72 17.92h103.68c12.8 0 24.32-6.4 30.72-17.92 6.4-10.24 6.4-24.32 0-34.56-7.68-10.24-19.2-17.92-30.72-17.92z" fill="#1296db" p-id="6987"></path><path d="M876.8 999.68H616.96c-32 0-56.32-28.16-56.32-60.16V759.04c0-34.56 25.6-60.16 56.32-60.16h15.36c0-6.4-2.56-15.36-2.56-21.76v-25.6c0-62.72 51.2-116.48 116.48-116.48 62.72 0 116.48 51.2 116.48 116.48v21.76c0 8.96 0 15.36-2.56 21.76h15.36c32 0 56.32 28.16 56.32 60.16v180.48c1.28 38.4-24.32 64-55.04 64zM724.48 853.76v53.76c0 12.8 8.96 21.76 21.76 21.76s21.76-8.96 21.76-21.76v-53.76c12.8-8.96 21.76-21.76 21.76-40.96 2.56-21.76-19.2-44.8-44.8-44.8s-47.36 21.76-47.36 47.36c1.28 16.64 11.52 32 26.88 38.4z m92.16-202.24c0-38.4-32-69.12-69.12-69.12-38.4 0-69.12 32-69.12 69.12v47.36h139.52v-47.36z m0 0" p-id="6988" fill="#1296db"></path></svg>';

        // 创建提示文字
        const prompt = document.createElement('div');
        prompt.className = 'auth-prompt';
        prompt.textContent = `请联系录入人 ${contactPerson} 获取授权码进行操作`;

        // 创建输入容器
        const inputContainer = document.createElement('div');
        inputContainer.className = 'auth-input-container';

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '请输入授权码';
        input.className = 'auth-input';

        // 创建按钮
        const button = document.createElement('button');
        button.textContent = '授权认证';
        button.className = 'auth-button';

        // 创建消息区域
        const message = document.createElement('div');
        message.className = 'auth-message';

        // 组装元素
        inputContainer.appendChild(input);
        authContainer.appendChild(lockIcon);
        authContainer.appendChild(prompt);
        authContainer.appendChild(inputContainer);
        authContainer.appendChild(button);
        authContainer.appendChild(message);
        overlay.appendChild(authContainer);

        // 添加到页面
        document.body.appendChild(overlay);

        // 聚焦输入框
        input.focus();

        // 校验成功事件处理器数组
        const successHandlers = [];

        // 如果有初始回调，添加到处理器数组
        if (onSuccess && typeof onSuccess === 'function') {
            successHandlers.push(onSuccess);
        }

        // 验证函数
        function validateCode() {
            const enteredCode = input.value.trim();

            if (enteredCode === correctCode) {
                // 验证成功
                message.textContent = '验证成功！正在进入单据...';
                message.className = 'auth-message auth-success';

                // 延迟隐藏覆盖层，让用户看到成功消息
                setTimeout(() => {
                    overlay.classList.add('auth-hidden');

                    // 执行所有成功事件处理器
                    successHandlers.forEach(handler => {
                        try {
                            handler();
                        } catch (error) {
                            console.error('执行校验成功事件处理器时出错:', error);
                        }
                    });

                    console.log('校验通过');
                }, 1000);
            } else {
                // 验证失败
                message.textContent = '授权码错误，请重新输入';
                message.className = 'auth-message auth-error';
                input.value = '';
                input.focus();
            }
        }

        // 添加事件监听
        button.addEventListener('click', validateCode);
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                validateCode();
            }
        });

        // 返回控制方法
        return {
            hide: function () {
                overlay.classList.add('auth-hidden');
            },
            show: function () {
                overlay.classList.remove('auth-hidden');
                input.value = '';
                message.textContent = '';
                input.focus();
            },
            // 添加校验成功事件处理器
            onSuccess: function (handler) {
                if (handler && typeof handler === 'function') {
                    successHandlers.push(handler);
                }
                return this; // 支持链式调用
            },
            // 移除校验成功事件处理器
            offSuccess: function (handler) {
                const index = successHandlers.indexOf(handler);
                if (index !== -1) {
                    successHandlers.splice(index, 1);
                }
                return this; // 支持链式调用
            },
            // 清除所有校验成功事件处理器
            clearSuccessHandlers: function () {
                successHandlers.length = 0;
                return this; // 支持链式调用
            },
            // 可选：更新联系人信息
            updateContactPerson: function (newContactPerson) {
                contactPerson = newContactPerson;
                prompt.textContent = `请联系录入人 ${contactPerson} 获取授权码进行操作`;
            },
            // 可选：更新正确授权码
            updateCorrectCode: function (newCorrectCode) {
                correctCode = newCorrectCode;
            }
        };
    }

// 使用示例：
// 1. 创建授权覆盖界面，参数1为联系人姓名，参数2为正确授权码，参数3为可选的成功回调
// const authOverlay = createAuthOverlay('张三', '2024', function() {
//     // 校验通过后执行的操作
//     ElementHider.show('#root');
//     console.log('执行自定义操作');
// });

// 2. 使用onSuccess方法动态添加事件处理器
// authOverlay.onSuccess(function() {
//     ElementHider.show('#root');
//     console.log('显示root元素');
// }).onSuccess(function() {
//     // 可以添加多个处理器
//     console.log('执行其他操作');
// });

// 3. 如果需要手动隐藏覆盖层（例如在其他逻辑中）：
// authOverlay.hide();

// 4. 如果需要重新显示覆盖层：
// authOverlay.show();

// 5. 如果需要移除特定事件处理器：
// const handler = function() { console.log('处理器'); };
// authOverlay.onSuccess(handler);
// authOverlay.offSuccess(handler);

// 6. 如果需要清除所有事件处理器：
// authOverlay.clearSuccessHandlers();

// 7. 如果需要更新联系人信息：
// authOverlay.updateContactPerson('李四');

// 8. 如果需要更新正确授权码：
// authOverlay.updateCorrectCode('5678');



// 修复加载文字位置的钓鱼动画函数
function createFishingAnimation(selector, loadingText = 'Loading') {
    // 生成唯一ID
    const animationId = 'fishing-animation-' + Date.now();

    // 检查是否已经添加了样式
    if (!document.getElementById('fishing-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'fishing-animation-styles';
        style.textContent = `
        /* 引入字体库 */
        @import url('https://fonts.googleapis.com/css?family=Montserrat:300,400,700');
        
        .fishing-animation-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 998;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        
        .fishing-animation-content {
            position: relative;
            width: 400px;
            height: 400px;
            transform: scale(0.8);
            margin-bottom: 5px; /* 为文字留出空间 */
        }
        
        .fishing-animation-bowl {
            width: 250px;
            height: 250px;
            border: 5px solid #fff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(90, 201, 226, 0.3);
            overflow: hidden;
        }
        
        .fishing-animation-bowl:before {
            content: "";
            position: absolute;
            bottom: -25px;
            left: 50px;
            width: 150px;
            height: 50px;
            border-radius: 50%;
            background: rgba(0,0,0,0.15);
        }
        
        .fishing-animation-bowl:after {
            content: "";
            position: absolute;
            top: 10px;
            left: calc(25% - 3px);
            width: 50%;
            height: 40px;
            border: 3px solid #fff;
            border-radius: 50%;
        }
        
        .fishing-animation-water {
            position: absolute;
            bottom: 5%;
            left: 0;
            width: 100%;
            height: 50%;
            overflow: hidden;
            animation: fishing-top-inner 5s ease infinite;
        }
        
        @keyframes fishing-top-inner {
            from {
                transform: rotate(0deg);
                margin-left: 0px;
            }
            25% {
                transform: rotate(3deg);
                margin-left: -3px;
            }
            50% {
                transform: rotate(-6deg);
                margin-left: 6px;
            }
            75% {
                transform: rotate(5deg);
                margin-left: -5px;
            }
            to {
                transform: rotate(0deg);
                margin-left: 0px;
            }
        }
        
        .fishing-animation-water-inner {
            width: 225px;
            height: 225px;
            border-radius: 50%;
            background: #4e99ce;
            position: absolute;
            bottom: 0;
            left: 12.5px;
        }
        
        .fishing-animation-top-water {
            position: absolute;
            width: 225px;
            height: 60px;
            border-radius: 50%;
            background: #82bde6;
            bottom: 105px;
            left: 12.5px;
            animation: fishing-top 5s ease infinite;
        }
        
        @keyframes fishing-top {
            from {
                transform: rotate(0deg);
            }
            25% {
                transform: rotate(3deg);
            }
            50% {
                transform: rotate(-6deg);
            }
            75% {
                transform: rotate(5deg);
            }
            to {
                transform: rotate(0deg);
            }
        }
        
        .fishing-animation-center-box {
            height: 300px;
            width: 300px;
            position: absolute;
            top: calc(50% - 190px);
            left: calc(50% - 147px); /* 修改这里：从 -150px 改为 -147px，向右移动3px */
            animation: fishing-float 5s ease infinite;
            transform: scale(0.4);
        }
        
        @keyframes fishing-float {
            from {
                transform: translate(0, 0px) scale(0.4);
            }
            25% {
                transform: translate(0, 4px) scale(0.4);
            }
            50% {
                transform: translate(0, -7px) scale(0.4);
            }
            75% {
                transform: translate(0, 7px) scale(0.4);
            }
            to {
                transform: translate(0, -0px) scale(0.4);
            }
        }
        
        .fishing-animation-fisherman {
            width: 300px;
            height: 200px;
            position: relative;
        }
        
        .fishing-animation-fisherman .body {
            width: 60px;
            height: 120px;
            background: #d2bd24;
            position: absolute;
            bottom: 20px;
            right: 30px;
            -webkit-clip-path: ellipse(40% 50% at 0% 50%);
            clip-path: ellipse(40% 50% at 0% 50%);
            transform: rotate(-20deg);
        }
        
        .fishing-animation-fisherman .body:before {
            content: "";
            width: 60px;
            height: 160px;
            background: #d2bd24;
            position: absolute;
            bottom: -8px;
            right: 12px;
            -webkit-clip-path: ellipse(90% 50% at 0% 50%);
            clip-path: ellipse(90% 50% at 0% 50%);
            transform: rotate(10deg);
        }
        
        .fishing-animation-fisherman .right-arm {
            width: 15px;
            height: 90px;
            background: #d2bd24;
            border-radius: 15px;
            position: absolute;
            bottom: 40px;
            right: 120px;
            transform: rotate(40deg);
        }
        
        .fishing-animation-fisherman .right-arm:before {
            content: "";
            background: #ffd1b5;
            width: 20px;
            height: 20px;
            position: absolute;
            top: 65px;
            right: 40px;
            border-radius: 15px;
        }
        
        .fishing-animation-fisherman .right-arm:after {
            content: "";
            width: 15px;
            height: 40px;
            background: #d2bd24;
            border-radius: 15px;
            position: absolute;
            bottom: -12px;
            right: 15px;
            transform: rotate(-80deg);
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
        }
        
        .fishing-animation-fisherman .right-leg {
            width: 15px;
            height: 90px;
            background: #bf3526;
            border-radius: 15px;
            position: absolute;
            bottom: -15px;
            right: 120px;
            transform: rotate(-60deg);
        }
        
        .fishing-animation-fisherman .right-leg:before {
            content: "";
            width: 15px;
            height: 80px;
            background: #bf3526;
            border-radius: 15px;
            position: absolute;
            bottom: 35px;
            left: -30px;
            transform: rotate(80deg);
        }
        
        .fishing-animation-fisherman .right-leg:after {
            content: "";
            position: absolute;
            bottom: 30px;
            left: -60px;
            width: 25px;
            height: 80px;
            background: #338ca0;
            transform: rotate(80deg);
        }
        
        .fishing-animation-rod {
            position: absolute;
            width: 280px;
            height: 4px;
            bottom: 100px;
            left: -105px;
            background: #331604;
            transform: rotate(10deg);
        }
        
        .fishing-animation-rod .handle {
            width: 15px;
            height: 15px;
            border-radius: 15px;
            left: 230px;
            top: 2px;
            background: #efdddb;
        }
        
        .fishing-animation-rod .handle:before {
            content: "";
            position: absolute;
            width: 10px;
            height: 3px;
            left: 8px;
            top: 5px;
            background: #1a1a1a;
        }
        
        .fishing-animation-rod .rope {
            width: 2px;
            height: 190px;
            top: -14px;
            left: 17px;
            transform: rotate(-10deg);
            background: #fff;
        }
        
        .fishing-animation-fisherman .butt {
            position: absolute;
            width: 40px;
            height: 15px;
            border-radius: 15px;
            bottom: 5px;
            right: 70px;
            background: #bf3526;
        }
        
        .fishing-animation-fisherman .left-arm {
            position: absolute;
            width: 15px;
            height: 70px;
            bottom: 45px;
            right: 100px;
            border-radius: 15px;
            transform: rotate(30deg);
            background: #e8d93d;
        }
        
        .fishing-animation-fisherman .left-arm:before {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            top: 40px;
            right: 40px;
            border-radius: 15px;
            background: #ffd1b5;
        }
        
        .fishing-animation-fisherman .left-arm:after {
            content: "";
            position: absolute;
            width: 15px;
            height: 45px;
            bottom: -12px;
            right: 15px;
            border-radius: 15px;
            transform: rotate(-70deg);
            background: #e8d93d;
        }
        
        .fishing-animation-fisherman .left-leg {
            position: absolute;
            width: 15px;
            height: 80px;
            bottom: -10px;
            right: 90px;
            border-radius: 15px;
            transform: rotate(-50deg);
            background: #de4125;
        }
        
        .fishing-animation-fisherman .left-leg:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 80px;
            bottom: 15px;
            left: -28px;
            border-radius: 15px;
            transform: rotate(60deg);
            background: #de4125;
        }
        
        .fishing-animation-fisherman .left-leg:after {
            content: "";
            position: absolute;
            width: 25px;
            height: 80px;
            bottom: 2px;
            left: -55px;
            transform: rotate(60deg);
            background: #338ca0;
        }
        
        .fishing-animation-head {
            position: absolute;
            width: 45px;
            height: 60px;
            bottom: 100px;
            right: 85px;
            border-radius: 50%;
            transform: rotate(10deg);
        }
        
        .fishing-animation-head .face {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            background: #d76540;
        }
        
        .fishing-animation-head .face:before {
            content: "";
            position: absolute;
            width: 45px;
            height: 65px;
            top: -15px;
            left: -8px;
            border-radius: 50%;
            background: #ffd1b5;
            transform: rotate(-10deg);
        }
        
        .fishing-animation-head .eyebrows {
            position: absolute;
            width: 12px;
            height: 5px;
            top: 12px;
            left: -2px;
            transform: rotate(-10deg);
            background: #e67e5b;
        }
        
        .fishing-animation-head .eyebrows:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 5px;
            top: 0px;
            left: 17px;
            background: #e67e5b;
        }
        
        .fishing-animation-head .eyes {
            position: absolute;
            width: 4px;
            height: 6px;
            top: 20px;
            left: 5px;
            border-radius: 50%;
            transform: rotate(-10deg);
            background: #1a1a1a;
        }
        
        .fishing-animation-head .eyes:before {
            content: "";
            position: absolute;
            width: 4px;
            height: 6px;
            top: 0px;
            left: 15px;
            border-radius: 50%;
            background: #1a1a1a;
        }
        
        .fishing-animation-head .nose {
            position: absolute;
            width: 0;
            height: 0;
            border-top: 15px solid transparent;
            border-bottom: 6px solid transparent;
            border-right: 12px solid #fab58e;
            top: 20px;
            left: 5px;
            transform: rotate(-10deg);
        }
        
        .fishing-animation-head .beard {
            position: absolute;
            width: 30px;
            height: 20px;
            top: 30px;
            left: 1px;
            transform: rotate(-10deg);
            clip-path: ellipse(50% 50% at 50% 100%);
            background: #e67e5b;
        }
        
        .fishing-animation-head .hat {
            position: absolute;
            width: 60px;
            height: 6px;
            top: 6px;
            left: -10px;
            background: #3d402b;
        }
        
        .fishing-animation-head .hat:before {
            content: "";
            position: absolute;
            width: 45px;
            height: 30px;
            left: 8px;
            bottom: 6px;
            clip-path: ellipse(50% 50% at 50% 90%);
            background: #7b8445;
        }
        
        .fishing-animation-boat {
            width: 300px;
            height: 75px;
            margin-top: -10px;
        }
        
        .fishing-animation-boat .motor {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            top: -40px;
            right: -280px;
            background: #ef4723;
        }
        
        .fishing-animation-boat .motor:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 75px;
            clip-path: polygon(0 0, 100% 0, 60% 100%, 0% 100%);
            top: 40px;
            right: 15px;
            z-index: -1;
            background: #bf3526;
        }
        
        .fishing-animation-boat .motor:after {
            content: "";
            position: absolute;
            width: 60px;
            height: 15px;
            left: 0;
            top: 0;
            border-top-left-radius: 14px;
            border-top-right-radius: 14px;
            background: #fff;
        }
        
        .fishing-animation-boat .parts,
        .fishing-animation-boat .parts:before,
        .fishing-animation-boat .parts:after {
            position: absolute;
            width: 20px;
            height: 4px;
            right: 8px;
            top: 22px;
            border-radius: 15px;
            background: #bf3526;
        }
        
        .fishing-animation-boat .parts:before,
        .fishing-animation-boat .parts:after {
            content: "";
            right: 0px;
        }
        
        .fishing-animation-boat .parts:before {
            top: 8px;
        }
        
        .fishing-animation-boat .parts:after {
            top: 15px;
        }
        
        .fishing-animation-boat .button {
            position: absolute;
            width: 15px;
            height: 8px;
            left: -8px;
            top: 20px;
            border-radius: 15px;
            background: #bf3526;
        }
        
        .fishing-animation-boat .top {
            position: absolute;
            width: 290px;
            height: 4px;
            top: 0;
            right: 0;
            border-bottom: solid 4px #cdab33;
            background: #e8da43;
        }
        
        .fishing-animation-boat .boat-body {
            position: absolute;
            width: 280px;
            height: 70px;
            bottom: 0;
            right: 0;
            border-bottom-left-radius: 70px;
            border-bottom-right-radius: 15px;
            clip-path: polygon(0 0, 100% 0, 99% 100%, 0% 100%);
            background: #cdab33;
        }
        
        .fishing-animation-boat .boat-body:before {
            content: "";
            position: absolute;
            width: 280px;
            height: 55px;
            bottom: 15px;
            right: 0px;
            border-bottom-left-radius: 45px;
            background: #d2bd39;
        }
        
        .fishing-animation-boat .boat-body:after {
            content: "";
            position: absolute;
            width: 280px;
            height: 30px;
            bottom: 40px;
            right: 0px;
            border-bottom-left-radius: 45px;
            background: #e8da43;
        }
        
        .fishing-animation-waves {
            height: 100%;
            box-sizing: border-box;
            border: 5px solid #fff;
            border-radius: 50%;
            transform: translate(22px, -22px);
            z-index: -10;
            animation: fishing-waves 5s ease infinite;
        }
        
        @keyframes fishing-waves {
            from {
                margin-left: 0px;
                margin-right: 0px;
                border-color: #fff;
            }
            to {
                margin-left: -75px;
                margin-right: -75px;
                border-color: transparent;
            }
        }
        
        .fishing-animation-fish {
            position: absolute;
            width: 12px;
            height: 12px;
            margin-left: 6px;
            animation: fishing-jump 3s infinite;
            z-index: 10;
        }
        
        @keyframes fishing-jump {
            0% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 1;
            }
            16.7% {
                left: 52px;
                top: 45px;
                transform: rotate(-20deg);
                opacity: 1;
            }
            33.4% {
                left: 45px;
                top: 90px;
                transform: rotate(-90deg);
                opacity: 0;
            }
            50% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 0;
            }
            100% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 0;
            }
        }
        
        .fishing-animation-text {
            position: absolute;
            width: 100%;
            text-align: center;
            font-size: 32px;
            color: rgba(0, 0, 0, 0.15);
            font-family: 'Montserrat', sans-serif;
            bottom: -5px; /* 将文字放在碗的下方 */
            z-index: 1;
        }
    `;
        document.head.appendChild(style);
    }

    // 获取目标元素
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
        console.error(`元素 ${selector} 未找到`);
        return null;
    }

    // 创建动画容器
    const container = document.createElement('div');
    container.className = 'fishing-animation-container';
    container.id = animationId;

    // 创建内容容器
    const content = document.createElement('div');
    content.className = 'fishing-animation-content';

    // 创建钓鱼动画HTML结构
    content.innerHTML = `
    <div class="fishing-animation-bowl">
        <div class="fishing-animation-water">
            <div class="fishing-animation-water-inner"></div>
        </div>
        <div class="fishing-animation-top-water"></div>
        <div class="fishing-animation-center-box">
            <div class="fishing-animation-fisherman">
                <div class="body"></div>
                <div class="right-arm"></div>
                <div class="right-leg"></div>
                <div class="fishing-animation-rod">
                    <div class="handle"></div>
                    <div class="rope"></div>
                </div>
                <div class="butt"></div>
                <div class="left-arm"></div>
                <div class="left-leg"></div>
                <div class="fishing-animation-head">
                    <div class="face"></div>
                    <div class="eyebrows"></div>
                    <div class="eyes"></div>
                    <div class="nose"></div>
                    <div class="beard"></div>
                    <div class="hat"></div>
                </div>
            </div>
            <div class="fishing-animation-boat">
                <div class="motor">
                    <div class="parts"></div>
                    <div class="button"></div>
                </div>
                <div class="top"></div>
                <div class="boat-body"></div>
                <div class="fishing-animation-waves"></div>
            </div>
        </div>
        <div class="fishing-animation-fish">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px" y="0px" viewBox="0 0 483.7 361.9" style="enable-background:new 0 0 483.7 361.9;" xml:space="preserve">
                <style type="text/css">
                    .fishing-st0 { fill: #E0AC26; }
                    .fishing-st1 { fill: #E0AC26; stroke: #E0AC26; stroke-width: 1.061; stroke-miterlimit: 10; }
                    .fishing-st2 { fill: #FFFFFF; }
                </style>
                <g>
                    <g>
                        <path class="fishing-st0" d="M168.8,298.4c1.2,8.5,0.3,17.1,0.5,25.7c0.2,9.6,2,18.6,8.8,25.9c9.4,10,25.3,14.4,38.7,10.4
                                c17.7-5.3,21.7-23.3,19.9-39.9c-1.9-18.1-36.9-35.6-47.7-49.9" />
                        <g>
                            <path class="fishing-st0" d="M167.6,298.4c2.1,17-3.6,36.8,8.5,51.2c9.6,11.4,26.7,16.2,40.8,11.9c13.3-4,19.8-16,20.9-29.2
                                    c0.5-5.8,0.6-12.3-1.8-17.7c-2.4-5.5-6.6-10-10.9-14.1c-11.2-10.7-25.9-18.5-35.6-30.8c-0.9-1.1-2.5,0.5-1.6,1.6
                                    c6.8,8.7,16.6,15,25.1,21.8c8.2,6.6,19.6,14.9,22,25.8c2.6,11.8-0.2,27.8-9.9,35.7c-12.2,9.9-31.9,7-43.4-2.6
                                    c-16.4-13.6-9.8-35.4-12.1-53.7C169.7,297,167.5,297,167.6,298.4L167.6,298.4z" />
                        </g>
                    </g>
                    <path class="fishing-st1" d="M478.9,117c4.7-9.7,8.2-23.7-1.1-29.1c-14.2-8.2-57.5,45.2-56.5,46.4c-48.6-54.4-77.1-85.6-131.5-106.8
                            c-16.6-6.5-34.3-10.2-52.2-11.2c-6-0.8-12-1.4-18-1.7C156.4,11.3,100.7,51.6,80,64.7C59.3,77.8,2.5,154.2,0.4,158.5
                            c0,0-1.1,9.8,15.3,22.9s22.9,12,16.4,22.9c-6.5,10.9-30.6,17.5-31.7,26.2c-1.1,8.7,0,8.7,8.7,10.9c8.7,2.2,50.2,46.5,103.7,64.7
                            c53.5,18.2,111.7,18.2,146.4,12.8c2.7-0.4,5.5-1,8.2-1.6c12.3-1.9,24.7-4.5,33-8.2c15.7-5.9,28.9-12.5,34.2-15.3
                            c1.6,0.5,3.2,1.1,4.6,1.9c2.1,3.1,5.5,7.9,8.9,11.6c7.6,8.2,20.9,8.6,31.1,4c7.7-3.5,18.9-16.7,21.6-25.2c2.2-6.8,2.3-5.1-0.9-10.3
                            c-0.5-0.9-14.9-8.8-14.7-9c14.3-15.3,34.3-40,34.3-40c10.4,15.9,29.6,47.3,43.1,47.8c17.3,0.7,18.9-18.6,16-30.9
                            C466.5,195.2,456,164,478.9,117z" />
                    <!-- 其余SVG路径保持不变，只需添加fishing-前缀到类名 -->
                </g>
            </svg>
        </div>
    </div>
    <div class="fishing-animation-text">${loadingText}</div>
`;

    // 将内容添加到容器
    container.appendChild(content);

    // 添加到目标元素
    targetElement.appendChild(container);

    // 创建加载文本动画
    let dots = 0;
    const textElement = content.querySelector('.fishing-animation-text');
    let loadingInterval = setInterval(() => {
        let str = "";
        if (dots < 3) {
            dots++;
        } else {
            dots = 1;
        }
        for (let i = 0; i < dots; i++) {
            str += ".";
        }
        textElement.textContent = loadingText + str;
    }, 500);

    // 返回控制对象
    return {
        // 移除动画
        remove: function () {
            clearInterval(loadingInterval);
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        },

        // 更新文本
        updateText: function (newText) {
            loadingText = newText;
            textElement.textContent = newText;
        },

        // 暂停动画
        pause: function () {
            const animatedElements = container.querySelectorAll('*');
            animatedElements.forEach(el => {
                if (el.style.animationPlayState !== undefined) {
                    el.style.animationPlayState = 'paused';
                }
            });
            clearInterval(loadingInterval);
        },

        // 恢复动画
        resume: function () {
            const animatedElements = container.querySelectorAll('*');
            animatedElements.forEach(el => {
                if (el.style.animationPlayState !== undefined) {
                    el.style.animationPlayState = 'running';
                }
            });
            // 重新启动文本动画
            dots = 0;
            loadingInterval = setInterval(() => {
                let str = "";
                if (dots < 3) {
                    dots++;
                } else {
                    dots = 1;
                }
                for (let i = 0; i < dots; i++) {
                    str += ".";
                }
                textElement.textContent = loadingText + str;
            }, 500);
        }
    };
}

// 移除所有钓鱼动画
function removeAllFishingAnimations() {
    const containers = document.querySelectorAll('.fishing-animation-container');
    containers.forEach(container => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
}

// 基本用法 - 在body中创建钓鱼动画
// const animation = createFishingAnimation('body', '正在加载中');



   /**
 * 获取表单附件信息的封装函数
 * @param {Object} params - 参数对象
 * @param {string} params.phidValue - 主键ID
 * @param {string} params.busType - 业务类型
 * @param {string} params.tableName - 表名
 * @param {Array} params.mainTableNames - 主表名数组
 * @param {Array} params.detailTablePrefixes - 明细表前缀数组
 * @returns {Promise} 返回包含附件信息的Promise对象
 */
        function getFormAttachmentInfo(params) {
            return new Promise((resolve, reject) => {
                const { phidValue, busType, tableName, mainTableNames, detailTablePrefixes } = params;
                let fromObj = {};
                let mainInfo = {};

                // 处理主表附件信息
                $NG.execServer("selectFromMainAttachmentInfo", {
                    "table": tableName,
                    "phid": phidValue,
                    "bus": busType
                }, function (res) {
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
                    $NG.request.get({
                        url: `/sup/customServer/getInfo?id=${phidValue}&oType=view&customBusCode=${busType}&encryptPrimaryKey=${$NG.CryptoJS.encode(phidValue)}`
                    }).then((res) => {
                        console.log("明细表响应:", res);

                        // 处理响应数据
                        fromObj = processResponseData(res, mainTableNames, detailTablePrefixes);
                        // 合并主表信息
                        fromObj = { ...fromObj, ...mainInfo };
                        console.log("最终结果:", fromObj);

                        resolve(fromObj);
                    }).catch(error => {
                        reject(error);
                    });
                });
            });
        }

        // 处理响应数据的函数（保持不变）
        function processResponseData(responseData, mainTableNames, detailTablePrefixes) {
            const fromObj = {};

            // 处理主表（可能有多个主表）
            for (const mainTableName of mainTableNames) {
                const mainTable = responseData.data[mainTableName];
                if (mainTable && mainTable.u_file) {
                    // 移除 @@数字 部分
                    fromObj.mGuid = mainTable.u_file.replace(/@@\d+$/, '');
                    break; // 只取第一个有值的主表
                }
            }

            // 处理明细表（可能有多种前缀）
            for (const detailPrefix of detailTablePrefixes) {
                // 找出所有匹配该前缀的明细表
                const detailTables = Object.keys(responseData.data)
                    .filter(key => key.startsWith(detailPrefix))
                    .map(key => ({
                        tableName: key,
                        suffix: key.replace(detailPrefix, '')
                    }));

                for (const { tableName, suffix } of detailTables) {
                    const detailTable = responseData.data[tableName];
                    if (Array.isArray(detailTable)) {
                        const propName = suffix ? `d${suffix}Guids` : 'dGuids';

                        fromObj[propName] = detailTable
                            .map(item => {
                                // 尝试可能的字段名
                                const fileValue = item.u_file || item.u_body_file;
                                if (fileValue) {
                                    // 移除 @@数字 部分
                                    return fileValue.replace(/@@\d+$/, '');
                                }
                                return null;
                            })
                            .filter(file => file !== null && file !== undefined);
                    }
                }
            }

            return fromObj;
        }

        // 调用示例
        async function exampleUsage(phidValue,busType,tableName,dTableName) {
            try {
                //const params = {
                //    phidValue: "123456", // 替换为实际的主键ID
                //    busType: "fixedassest_store", // 替换为实际的业务类型
                //    tableName: "p_form_fixedassest_store", // 替换为实际的表名
                //    mainTableNames: ["p_form_fixedassest_store"],
                //    detailTablePrefixes: ["p_form__test_d"]
                //};
				const params = {
                phidValue: phidValue,
                busType: busType,
                tableName: tableName,
                mainTableNames: [tableName],
                detailTablePrefixes: [dTableName]
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

        // 或者使用Promise方式调用
        function exampleUsagePromise(phidValue,busType,tableName,dTableName) {
            const params = {
                phidValue: phidValue,
                busType: busType,
                tableName: tableName,
                mainTableNames: [tableName],
                detailTablePrefixes: [dTableName]
            };

            return getFormAttachmentInfo(params)
                .then(fromObj => {
                    console.log("获取到的附件信息:", fromObj);
                    return fromObj;
                })
                .catch(error => {
                    console.error("获取附件信息失败:", error);
                    throw error;
                });
        }
		
		
		
		   /**
     * 获取特定DOM元素的值
     * @param {string} parentId - 父元素ID
     * @param {string} childSelector - 子元素选择器
     * @param {string} [valueType='text'] - 值类型: 'text'或'html'
     * @param {number} [timeout=5000] - 超时时间(毫秒)
     * @returns {Promise<string>} 元素的值
     */
        function getElementValue(parentId, childSelector, valueType = 'text', timeout = 5000) {
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
                        if (valueType === 'html') {
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
		
		
		
		// 引入JSZip库用于创建ZIP文件
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (typeof JSZip !== 'undefined') {
            resolve(JSZip);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve(JSZip);
        script.onerror = () => reject(new Error('Failed to load JSZip'));
        document.head.appendChild(script);
    });
}

// 修改后的下载函数，返回文件的Blob对象
// 修复：改进的下载文件为Blob函数，添加更好的错误处理
function downloadFileAsBlob(config) {
    const {
        downloadUrl,
        dbToken,
        requestData,
        fileName
    } = config;

    return new Promise((resolve, reject) => {
        if (!downloadUrl) {
            reject(new Error('缺少必要参数：downloadUrl'));
            return;
        }

        console.log(`开始下载文件: ${fileName}`, requestData);

        $NG.request.post({
            url: downloadUrl,
            headers: {
                dbToken: dbToken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(requestData)
        }).then((res) => {
            console.log('下载响应:', res);

            if (res.data && res.data[requestData.asrFids[0]]) {
                const fileDownloadUrl = res.data[requestData.asrFids[0]];
                console.log('获取到下载URL:', fileDownloadUrl);

                // 使用fetch获取文件内容
                fetch(fileDownloadUrl, {
                    headers: {
                        'dbToken': dbToken
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        // 修复：检查Blob是否有效
                        if (blob && blob.size > 0) {
                            console.log(`文件下载成功: ${fileName}, 大小: ${blob.size} bytes`);
                            resolve({
                                blob: blob,
                                fileName: fileName
                            });
                        } else {
                            console.error(`文件Blob无效: ${fileName}, 大小: ${blob.size}`);
                            reject(new Error(`文件Blob无效: ${fileName}`));
                        }
                    })
                    .catch(error => {
                        console.error('获取文件内容失败:', error);
                        reject(error);
                    });
            } else {
                console.error('未获取到有效的下载URL', res);
                reject(new Error('未获取到有效的下载URL'));
            }
        }).catch((error) => {
            console.error('下载请求失败:', error);
            reject(error);
        });
    });
}


// 解码URL编码的文件名
function decodeFileName(fileName) {
    try {
        return decodeURIComponent(fileName);
    } catch (e) {
        console.warn('文件名解码失败，使用原文件名:', fileName);
        return fileName;
    }
}

// 主函数：下载所有附件并打包
async function downloadAllAttachmentsAsZipOldSingle(attachmentData, options = {}) {
    try {
        // 加载JSZip库
        const JSZip = await loadJSZip();

        // 合并配置
        const config = {
            downloadUrl: options.downloadUrl || "JFileSrv/api/getDownloadUrlByAsrFids",
            dbToken: options.dbToken || "0001",
            parentFolderName: options.parentFolderName || "测试单据业务",
            wmDisabled: options.wmDisabled || "0",
            billWM: options.billWM || "YEIG",
            orgId: options.orgId || "0"
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
            throw new Error('无法识别的附件数据结构');
        }

        if (!attachmentRecordList || attachmentRecordList.length === 0) {
            throw new Error('未找到附件数据');
        }

        console.log(`开始处理 ${attachmentRecordList.length} 个附件`, config);

        // 创建下载任务数组
        const downloadPromises = attachmentRecordList.map(record => {
            const folderName = record.typeName || '未分类';
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
                    billWM: config.billWM
                },
                fileName: fileName
            }).then(fileData => {
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
                    success: true
                };
            }).catch(error => {
                console.error(`下载文件失败: ${folderName}/${fileName}`, error);
                return {
                    folderName: folderName,
                    fileName: fileName,
                    success: false,
                    error: error.message
                };
            });
        });

        // 等待所有下载完成
        const results = await Promise.allSettled(downloadPromises);

        // 统计下载结果
        const successfulDownloads = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
        const failedDownloads = results.length - successfulDownloads;

        console.log(`下载完成: 成功 ${successfulDownloads} 个, 失败 ${failedDownloads} 个`);

        // 检查是否所有文件都下载失败
        if (successfulDownloads === 0) {
            throw new Error('所有文件下载都失败了，请检查网络连接和参数配置');
        }

        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        });

        console.log(`ZIP文件生成完成，大小: ${zipBlob.size} bytes`);

        // 创建下载链接
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
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
                value: result.status === 'fulfilled' ? result.value : result.reason
            }))
        };

    } catch (error) {
        console.error('下载所有附件失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}


// 主函数：下载所有附件并打包
async function downloadAllAttachmentsAsZip(attachmentData, options = {}) {
    try {
        // 加载JSZip库
        const JSZip = await loadJSZip();

        // 合并配置
        const config = {
            downloadUrl: options.downloadUrl || "JFileSrv/api/getDownloadUrlByAsrFids",
            dbToken: options.dbToken || "0001",
            parentFolderName: options.parentFolderName || "测试单据业务",
            wmDisabled: options.wmDisabled || "0",
            billWM: options.billWM || "YEIG",
            orgId: options.orgId || "0"
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
            console.log('检测到单个对象');
            
            if (attachmentData.data && attachmentData.data.attachmentRecordList) {
                allAttachmentRecords = attachmentData.data.attachmentRecordList;
            } else if (attachmentData.attachmentRecordList) {
                allAttachmentRecords = attachmentData.attachmentRecordList;
            } else if (Array.isArray(attachmentData)) {
                allAttachmentRecords = attachmentData;
            } else {
                throw new Error('无法识别的附件数据结构');
            }
        }

        if (!allAttachmentRecords || allAttachmentRecords.length === 0) {
            throw new Error('未找到附件数据');
        }

        console.log(`总共处理 ${allAttachmentRecords.length} 个附件`);

        // 按 typeName 分组附件
        const groupedAttachments = {};
        allAttachmentRecords.forEach(record => {
            const folderName = record.typeName || '未分类';
            if (!groupedAttachments[folderName]) {
                groupedAttachments[folderName] = [];
            }
            groupedAttachments[folderName].push(record);
        });

        console.log('附件分组情况:', Object.keys(groupedAttachments).map(key => ({
            文件夹: key,
            文件数: groupedAttachments[key].length
        })));

        // 创建下载任务数组（按分组）
        const downloadPromises = [];
        
        Object.keys(groupedAttachments).forEach(folderName => {
            const recordsInFolder = groupedAttachments[folderName];
            
            recordsInFolder.forEach(record => {
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
                        billWM: config.billWM
                    },
                    fileName: fileName
                }).then(fileData => {
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
                        record: record
                    };
                }).catch(error => {
                    console.error(`下载文件失败: ${folderName}/${fileName}`, error);
                    return {
                        folderName: folderName,
                        fileName: fileName,
                        success: false,
                        error: error.message,
                        record: record
                    };
                });
                
                downloadPromises.push(promise);
            });
        });

        // 等待所有下载完成
        const results = await Promise.allSettled(downloadPromises);

        // 统计下载结果
        const successfulDownloads = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
        const failedDownloads = results.length - successfulDownloads;

        console.log(`下载完成: 成功 ${successfulDownloads} 个, 失败 ${failedDownloads} 个`);

        // 检查是否所有文件都下载失败
        if (successfulDownloads === 0) {
            throw new Error('所有文件下载都失败了，请检查网络连接和参数配置');
        }

        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        });

        console.log(`ZIP文件生成完成，大小: ${zipBlob.size} bytes`);

        // 创建下载链接
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
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
            groups: Object.keys(groupedAttachments).map(key => ({
                groupName: key,
                fileCount: groupedAttachments[key].length
            })),
            config: config,
            results: results.map((result, index) => {
                const record = allAttachmentRecords[index];
                return {
                    record: record,
                    status: result.status,
                    value: result.status === 'fulfilled' ? result.value : result.reason
                };
            })
        };

    } catch (error) {
        console.error('下载所有附件失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 便捷函数：创建下载按钮
function createDownloadButton(attachmentData, buttonOptions = {}) {
    const button = document.createElement('button');
    button.textContent = buttonOptions.text || '下载所有附件';
    button.style.cssText = buttonOptions.style || `
        position: fixed;
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

    button.addEventListener('click', async () => {
        if (button.disabled) return;
        
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = '下载中...';
        
        try {
            const result = await downloadAllAttachmentsAsZip(attachmentData, buttonOptions);
            
            if (result.success) {
                alert(`下载完成！成功: ${result.successful} 个文件, 失败: ${result.failed} 个文件`);
            } else {
                alert('下载失败: ' + result.error);
            }
        } catch (error) {
            alert('下载过程出错: ' + error.message);
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
/**
 * 表单附件批量下载管理器
 * @param {Object} config 配置对象
 */
function initAttachmentDownloader(config) {
    // 默认配置
    const defaultConfig = {
        tableName: '',
        busType: '',
        FormName: '',
        sFormGroupKeys: [],
        dFormFormKeys: [],
        sFormName: [],
        dFormName: [],
        mFormName: '表头'
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

    console.log('Attachment Downloader Initialized');
    console.log("---------phid---------" + phidValue);

    /**
     * 获取表单附件信息的封装函数
     */
    function getFormAttachmentInfo(params) {
        return new Promise((resolve, reject) => {
            const { phidValue, busType, tableName, mainTableNames } = params;
            let fromObj = {};
            let mainInfo = {};

            // 处理主表附件信息
            $NG.execServer("selectFromMainAttachmentInfo", {
                "table": tableName,
                "phid": phidValue,
                "bus": busType
            }, function (res) {
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
                $NG.request.get({
                    url: `/sup/customServer/getInfo?id=${phidValue}&oType=view&customBusCode=${busType}&encryptPrimaryKey=${$NG.CryptoJS.encode(phidValue)}`
                }).then((res) => {
                    console.log("明细表响应:", res);

                    // 处理响应数据
                    fromObj = processResponseData(res, mainTableNames);
                    // 合并主表信息
                    fromObj = { ...fromObj, ...mainInfo };
                    console.log("最终结果:", fromObj);

                    resolve(fromObj);
                }).catch(error => {
                    console.error("获取明细表信息失败:", error);
                    fromObj = { ...mainInfo };
                    resolve(fromObj);
                });
            });
        });
    }

    /**
     * 处理响应数据的函数
     */
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
                            guid: fileValue.replace(/@@\d+$/, ''),
                            formName: cfg.sFormName[index] || fieldName
                        });
                        console.log(`找到主表附件字段: ${fieldName} -> ${cfg.sFormName[index]}`);
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
                    .map(item => {
                        const fileValue = item.u_file || item.u_body_file || item.u_file1;
                        if (fileValue) {
                            return fileValue.replace(/@@\d+$/, '');
                        }
                        return null;
                    })
                    .filter(file => file !== null && file !== undefined);

                console.log(`明细表 ${detailTableName} 找到 ${fromObj.detailGuids[formName].length} 个附件`);
            }
        });

        return fromObj;
    }

    /**
     * 构建树形结构信息 - 带行标识
     */
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
                collapsed: false
            },
            totalFiles: 0,
            totalFolders: 0,
            buildTime: new Date().toISOString(),
            type: true
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
                collapsed: false
            };

            const mainAttachments = downloadConfig.mainAttachment[downloadConfig.mFormName];
            if (mainAttachments && mainAttachments.data && mainAttachments.data.attachmentRecordList) {
                const attachments = mainAttachments.data.attachmentRecordList;

                const attachmentsByType = {};
                attachments.forEach(attachment => {
                    const typeName = attachment.typeName || '未分类';
                    if (!attachmentsByType[typeName]) {
                        attachmentsByType[typeName] = [];
                    }
                    attachmentsByType[typeName].push(attachment);
                });

                Object.keys(attachmentsByType).forEach(typeName => {
                    const typeNode = {
                        name: typeName,
                        type: "folder",
                        level: 2,
                        path: `/${downloadConfig.mFormName}/${typeName}`,
                        children: [],
                        fileCount: attachmentsByType[typeName].length,
                        id: generateId(),
                        collapsed: false
                    };

                    attachmentsByType[typeName].forEach(attachment => {
                        const fileNode = {
                            name: decodeFileName(attachment.asrName),
                            type: "file",
                            level: 3,
                            path: `/${downloadConfig.mFormName}/${typeName}/${decodeFileName(attachment.asrName)}`,
                            fileInfo: {
                                ...attachment, // 保存完整的附件信息用于预览
                                asrFid: attachment.asrFid,
                                asrName: attachment.asrName,
                                fileSize: attachment.fileSize,
                                uploadTime: attachment.uploadTime,
                                typeName: attachment.typeName,
                                asrRemark: attachment.asrRemark || '', // 添加备注信息
                                asrSessionGuid: attachment.asrSessionGuid,
                                bustypecode: attachment.bustypecode
                            },
                            id: generateId()
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
            downloadConfig.sFormName.forEach(formName => {
                if (downloadConfig.groupAttachments[formName]) {
                    const groupFormNode = {
                        name: formName,
                        type: "folder",
                        level: 1,
                        path: `/${formName}`,
                        children: [],
                        fileCount: 0,
                        id: generateId(),
                        collapsed: false
                    };

                    const groupAttachments = downloadConfig.groupAttachments[formName];
                    if (groupAttachments.data && groupAttachments.data.attachmentRecordList) {
                        const attachments = groupAttachments.data.attachmentRecordList;

                        const attachmentsByType = {};
                        attachments.forEach(attachment => {
                            const typeName = attachment.typeName || '未分类';
                            if (!attachmentsByType[typeName]) {
                                attachmentsByType[typeName] = [];
                            }
                            attachmentsByType[typeName].push(attachment);
                        });

                        Object.keys(attachmentsByType).forEach(typeName => {
                            const typeNode = {
                                name: typeName,
                                type: "folder",
                                level: 2,
                                path: `/${formName}/${typeName}`,
                                children: [],
                                fileCount: attachmentsByType[typeName].length,
                                id: generateId(),
                                collapsed: false
                            };

                            attachmentsByType[typeName].forEach(attachment => {
                                const fileNode = {
                                    name: decodeFileName(attachment.asrName),
                                    type: "file",
                                    level: 3,
                                    path: `/${formName}/${typeName}/${decodeFileName(attachment.asrName)}`,
                                    fileInfo: {
                                        ...attachment, // 保存完整的附件信息用于预览
                                        asrFid: attachment.asrFid,
                                        asrName: attachment.asrName,
                                        fileSize: attachment.fileSize,
                                        uploadTime: attachment.uploadTime,
                                        typeName: attachment.typeName,
                                        asrRemark: attachment.asrRemark || '', // 添加备注信息
                                        asrSessionGuid: attachment.asrSessionGuid,
                                        bustypecode: attachment.bustypecode
                                    },
                                    id: generateId()
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
            downloadConfig.dFormName.forEach(formName => {
                if (downloadConfig.detailAttachments[formName]) {
                    const detailFormNode = {
                        name: formName,
                        type: "folder",
                        level: 1,
                        path: `/${formName}`,
                        children: [],
                        fileCount: 0,
                        id: generateId(),
                        collapsed: false
                    };

                    const detailAttachments = downloadConfig.detailAttachments[formName];
                    if (Array.isArray(detailAttachments)) {
                        detailAttachments.forEach((detailItem, rowIndex) => {
                            if (detailItem.code === 200 && detailItem.data && detailItem.data.attachmentRecordList) {
                                const rowNode = {
                                    name: `行${rowIndex + 1}`,
                                    type: "folder",
                                    level: 2,
                                    path: `/${formName}/行${rowIndex + 1}`,
                                    children: [],
                                    fileCount: 0,
                                    id: generateId(),
                                    collapsed: false
                                };

                                const attachments = detailItem.data.attachmentRecordList;

                                const attachmentsByType = {};
                                attachments.forEach(attachment => {
                                    const typeName = attachment.typeName || '未分类';
                                    if (!attachmentsByType[typeName]) {
                                        attachmentsByType[typeName] = [];
                                    }
                                    attachmentsByType[typeName].push(attachment);
                                });

                                Object.keys(attachmentsByType).forEach(typeName => {
                                    const typeNode = {
                                        name: typeName,
                                        type: "folder",
                                        level: 3,
                                        path: `/${formName}/行${rowIndex + 1}/${typeName}`,
                                        children: [],
                                        fileCount: attachmentsByType[typeName].length,
                                        id: generateId(),
                                        collapsed: true
                                    };

                                    attachmentsByType[typeName].forEach(attachment => {
                                        const fileNode = {
                                            name: decodeFileName(attachment.asrName),
                                            type: "file",
                                            level: 4,
                                            path: `/${formName}/行${rowIndex + 1}/${typeName}/${decodeFileName(attachment.asrName)}`,
                                            fileInfo: {
                                                ...attachment, // 保存完整的附件信息用于预览
                                                asrFid: attachment.asrFid,
                                                asrName: attachment.asrName,
                                                fileSize: attachment.fileSize,
                                                uploadTime: attachment.uploadTime,
                                                typeName: attachment.typeName,
                                                asrRemark: attachment.asrRemark || '', // 添加备注信息
                                                asrSessionGuid: attachment.asrSessionGuid,
                                                bustypecode: attachment.bustypecode
                                            },
                                            id: generateId()
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
        console.log('带行标识树形结构构建完成:', treeStructure);
        return treeStructure;
    }

    /**
     * 构建树形结构信息 - 不带行标识
     */
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
                collapsed: false
            },
            totalFiles: 0,
            totalFolders: 0,
            buildTime: new Date().toISOString(),
            type: false
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
                collapsed: false
            };

            const mainAttachments = downloadConfig.mainAttachment[downloadConfig.mFormName];
            if (mainAttachments && mainAttachments.data && mainAttachments.data.attachmentRecordList) {
                const attachments = mainAttachments.data.attachmentRecordList;

                const attachmentsByType = {};
                attachments.forEach(attachment => {
                    const typeName = attachment.typeName || '未分类';
                    if (!attachmentsByType[typeName]) {
                        attachmentsByType[typeName] = [];
                    }
                    attachmentsByType[typeName].push(attachment);
                });

                Object.keys(attachmentsByType).forEach(typeName => {
                    const typeNode = {
                        name: typeName,
                        type: "folder",
                        level: 2,
                        path: `/${downloadConfig.mFormName}/${typeName}`,
                        children: [],
                        fileCount: attachmentsByType[typeName].length,
                        id: generateId(),
                        collapsed: false
                    };

                    attachmentsByType[typeName].forEach(attachment => {
                        const fileNode = {
                            name: decodeFileName(attachment.asrName),
                            type: "file",
                            level: 3,
                            path: `/${downloadConfig.mFormName}/${typeName}/${decodeFileName(attachment.asrName)}`,
                            fileInfo: {
                                ...attachment, // 保存完整的附件信息用于预览
                                asrFid: attachment.asrFid,
                                asrName: attachment.asrName,
                                fileSize: attachment.fileSize,
                                uploadTime: attachment.uploadTime,
                                typeName: attachment.typeName,
                                asrRemark: attachment.asrRemark || '', // 添加备注信息
                                asrSessionGuid: attachment.asrSessionGuid,
                                bustypecode: attachment.bustypecode
                            },
                            id: generateId()
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
            downloadConfig.sFormName.forEach(formName => {
                if (downloadConfig.groupAttachments[formName]) {
                    const groupFormNode = {
                        name: formName,
                        type: "folder",
                        level: 1,
                        path: `/${formName}`,
                        children: [],
                        fileCount: 0,
                        id: generateId(),
                        collapsed: false
                    };

                    const groupAttachments = downloadConfig.groupAttachments[formName];
                    if (groupAttachments.data && groupAttachments.data.attachmentRecordList) {
                        const attachments = groupAttachments.data.attachmentRecordList;

                        const attachmentsByType = {};
                        attachments.forEach(attachment => {
                            const typeName = attachment.typeName || '未分类';
                            if (!attachmentsByType[typeName]) {
                                attachmentsByType[typeName] = [];
                            }
                            attachmentsByType[typeName].push(attachment);
                        });

                        Object.keys(attachmentsByType).forEach(typeName => {
                            const typeNode = {
                                name: typeName,
                                type: "folder",
                                level: 2,
                                path: `/${formName}/${typeName}`,
                                children: [],
                                fileCount: attachmentsByType[typeName].length,
                                id: generateId(),
                                collapsed: false
                            };

                            attachmentsByType[typeName].forEach(attachment => {
                                const fileNode = {
                                    name: decodeFileName(attachment.asrName),
                                    type: "file",
                                    level: 3,
                                    path: `/${formName}/${typeName}/${decodeFileName(attachment.asrName)}`,
                                    fileInfo: {
                                        ...attachment, // 保存完整的附件信息用于预览
                                        asrFid: attachment.asrFid,
                                        asrName: attachment.asrName,
                                        fileSize: attachment.fileSize,
                                        uploadTime: attachment.uploadTime,
                                        typeName: attachment.typeName,
                                        asrRemark: attachment.asrRemark || '', // 添加备注信息
                                        asrSessionGuid: attachment.asrSessionGuid,
                                        bustypecode: attachment.bustypecode
                                    },
                                    id: generateId()
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
            downloadConfig.dFormName.forEach(formName => {
                if (downloadConfig.detailAttachments[formName]) {
                    const detailFormNode = {
                        name: formName,
                        type: "folder",
                        level: 1,
                        path: `/${formName}`,
                        children: [],
                        fileCount: 0,
                        id: generateId(),
                        collapsed: false
                    };

                    const detailAttachments = downloadConfig.detailAttachments[formName];
                    if (Array.isArray(detailAttachments)) {
                        const allAttachments = [];
                        detailAttachments.forEach(detailItem => {
                            if (detailItem.code === 200 && detailItem.data && detailItem.data.attachmentRecordList) {
                                allAttachments.push(...detailItem.data.attachmentRecordList);
                            }
                        });

                        const attachmentsByType = {};
                        allAttachments.forEach(attachment => {
                            const typeName = attachment.typeName || '未分类';
                            if (!attachmentsByType[typeName]) {
                                attachmentsByType[typeName] = [];
                            }
                            attachmentsByType[typeName].push(attachment);
                        });

                        Object.keys(attachmentsByType).forEach(typeName => {
                            const typeNode = {
                                name: typeName,
                                type: "folder",
                                level: 2,
                                path: `/${formName}/${typeName}`,
                                children: [],
                                fileCount: attachmentsByType[typeName].length,
                                id: generateId(),
                                collapsed: false
                            };

                            attachmentsByType[typeName].forEach(attachment => {
                                const fileNode = {
                                    name: decodeFileName(attachment.asrName),
                                    type: "file",
                                    level: 3,
                                    path: `/${formName}/${typeName}/${decodeFileName(attachment.asrName)}`,
                                    fileInfo: {
                                        ...attachment, // 保存完整的附件信息用于预览
                                        asrFid: attachment.asrFid,
                                        asrName: attachment.asrName,
                                        fileSize: attachment.fileSize,
                                        uploadTime: attachment.uploadTime,
                                        typeName: attachment.typeName,
                                        asrRemark: attachment.asrRemark || '', // 添加备注信息
                                        asrSessionGuid: attachment.asrSessionGuid,
                                        bustypecode: attachment.bustypecode
                                    },
                                    id: generateId()
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
        console.log('不带行标识树形结构构建完成:', treeStructure);
        return treeStructure;
    }

    /**
     * 生成唯一ID
     */
    function generateId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 创建文件树编辑模态框
     */
    function createTreeEditModal() {
        const existingModal = document.getElementById('tree-edit-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'tree-edit-modal';
        modal.innerHTML = `
        <div class="modal-overlay"></div>
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
        </div>
    `;

        const style = document.createElement('style');
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
    border: none; /* 明确设置为无边框 */
    outline: none; /* 移除焦点时的轮廓 */
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

/* 悬停效果 */
.icon-button:hover {
    transform: scale(1.1);
}

/* 激活效果 */
.icon-button:active {
    transform: scale(0.95);
}

/* 禁用状态 */
.icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* 禁用状态下的SVG图标 - 变为灰色 */
.icon-button:disabled svg {
    filter: 
        grayscale(1) 
        brightness(0.7) 
        drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 自定义SVG样式 */
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

    /**
     * 初始化模态框交互
     */
    function initModalInteractions(modal) {
        const content = modal.querySelector('.modal-content');
        const header = modal.querySelector('.modal-header');
        const minimizeBtn = modal.querySelector('.minimize-btn');
        const maximizeBtn = modal.querySelector('.maximize-btn');
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');
        const toggleRowFolderBtn = modal.querySelector('#toggle-row-folder-btn');

        let isDragging = false;
        let isMaximized = false;
        let isMinimized = false;
        let dragOffset = { x: 0, y: 0 };
        let currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;

        // 添加还原按钮事件
        const resetBtn = modal.querySelector('#reset-btn');
        resetBtn.addEventListener('click', () => {
            treeStructure = buildTreeStructureWithRowFolder(downloadConfig);
            NuTreeStructure = buildTreeStructureWithoutRowFolder(downloadConfig);
            currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;
            refreshTree();
            showToast('已还原默认树结构', 'success');
        });

        // 初始化行标识按钮状态
        updateToggleRowFolderButton();

        // 切换行标识按钮事件
        toggleRowFolderBtn.addEventListener('click', () => {
            currentTreeType = !currentTreeType;
            currentTreeData = currentTreeType ? treeStructure : NuTreeStructure;
            updateToggleRowFolderButton();
            refreshTree();
        });

        function updateToggleRowFolderButton() {
            toggleRowFolderBtn.innerHTML = `${currentTreeType ? '<svg t="1760600527572" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16994" width="20" height="20"><path d="M896 96c41.216 0 74.624 33.472 74.624 74.688v682.624c0 41.216-33.408 74.688-74.624 74.688H128a74.688 74.688 0 0 1-74.688-74.688V170.688C53.312 129.472 86.784 96 128 96h768zM117.312 853.312c0 5.888 4.8 10.688 10.688 10.688h138.624V373.312H117.312v480z m213.312 10.688H896a10.688 10.688 0 0 0 10.624-10.688v-480h-576V864z m-110.848-212.672a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 0 1 0-64h42.688l6.4 0.64z m0-170.688a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 1 1 0-64h42.688l6.4 0.64zM128 160a10.688 10.688 0 0 0-10.688 10.688v138.624h149.312V160H128z m202.624 149.312h576V170.688A10.688 10.688 0 0 0 896 160H330.624v149.312z" p-id="16995" fill="#1677FF"></path></svg>' : '<svg t="1760600527572" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16994" width="20" height="20"><path d="M896 96c41.216 0 74.624 33.472 74.624 74.688v682.624c0 41.216-33.408 74.688-74.624 74.688H128a74.688 74.688 0 0 1-74.688-74.688V170.688C53.312 129.472 86.784 96 128 96h768zM117.312 853.312c0 5.888 4.8 10.688 10.688 10.688h138.624V373.312H117.312v480z m213.312 10.688H896a10.688 10.688 0 0 0 10.624-10.688v-480h-576V864z m-110.848-212.672a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 0 1 0-64h42.688l6.4 0.64z m0-170.688a32 32 0 0 1 0 62.72l-6.464 0.64h-42.688a32 32 0 1 1 0-64h42.688l6.4 0.64zM128 160a10.688 10.688 0 0 0-10.688 10.688v138.624h149.312V160H128z m202.624 149.312h576V170.688A10.688 10.688 0 0 0 896 160H330.624v149.312z" p-id="16995" fill="#bfbfbf"></path></svg>'}`;
            // 移除内联样式的设置，让按钮保持默认样式
			toggleRowFolderBtn.style.backgroundColor = '';
			toggleRowFolderBtn.style.borderColor = '';
			toggleRowFolderBtn.style.color = '';
        }

        // 拖动功能
        header.addEventListener('mousedown', startDrag);

        function startDrag(e) {
            if (e.target.classList.contains('modal-btn')) return;

            isDragging = true;
            const rect = content.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;

            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        }

        function onDrag(e) {
            if (!isDragging) return;

            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;

            content.style.left = x + 'px';
            content.style.top = y + 'px';
            content.style.transform = 'none';
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
        }

        // 最小化/最大化/关闭功能
        minimizeBtn.addEventListener('click', () => {
            isMinimized = !isMinimized;
            if (isMinimized) {
                content.classList.add('minimized');
                minimizeBtn.innerHTML = '❐';
                minimizeBtn.title = '还原';
            } else {
                content.classList.remove('minimized');
                minimizeBtn.innerHTML = '−';
                minimizeBtn.title = '最小化';
            }
        });

        maximizeBtn.addEventListener('click', () => {
            isMaximized = !isMaximized;
            if (isMaximized) {
                content.classList.add('maximized');
                maximizeBtn.innerHTML = '⧉';
                maximizeBtn.title = '还原';
            } else {
                content.classList.remove('maximized');
                maximizeBtn.innerHTML = '□';
                maximizeBtn.title = '最大化';
            }
        });

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        confirmBtn.addEventListener('click', () => {
            editTreeStructure = getEditedTreeStructure();
            console.log('编辑后的树结构:', editTreeStructure);
            modal.remove();

            showToast('树结构已保存，开始下载附件', 'success');
            downloadWithEditedStructure(editTreeStructure, downloadConfig);
        });

        // 初始化可编辑树
        initEditableTree(currentTreeData);

        function refreshTree() {
            const treeContainer = document.getElementById('editable-tree');
            treeContainer.innerHTML = '';
            initEditableTree(currentTreeData);
        }
    }

    /**
     * 初始化可编辑树
     */
    function initEditableTree(treeData) {
        const treeContainer = document.getElementById('editable-tree');
        let selectedNode = null;
        let dragNode = null;
        let searchResults = [];
        let currentSearchIndex = -1;
        let isAllExpanded = false;

        // 渲染树
        renderTree(treeData.root, treeContainer);

        // 工具栏事件
        document.getElementById('add-folder-btn').addEventListener('click', () => {
            if (selectedNode) {
                addNewNode(selectedNode, 'folder');
            } else {
                addNewNode(treeData.root, 'folder');
            }
        });

        document.getElementById('delete-btn').addEventListener('click', () => {
            if (selectedNode && selectedNode.type !== 'root') {
                deleteNode(selectedNode);
            } else {
                showToast('请选择要删除的节点', 'warning');
            }
        });

        // 文件预览按钮事件
        const previewBtn = document.getElementById('preview-btn');
        previewBtn.addEventListener('click', () => {
            if (selectedNode && selectedNode.type === 'file') {
                previewFile(selectedNode);
            }
        });

        // 合并展开/折叠按钮
        const toggleExpandBtn = document.getElementById('toggle-expand-btn');
        toggleExpandBtn.addEventListener('click', () => {
            isAllExpanded = !isAllExpanded;
            if (isAllExpanded) {
                expandAllNodes(treeData.root);
                toggleExpandBtn.textContent = '折叠';
            } else {
                collapseAllNodes(treeData.root);
                toggleExpandBtn.textContent = '展开';
            }
            refreshTree();
        });

        // 展开层级按钮事件
        document.querySelectorAll('.expand-level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.target.dataset.level);
                expandToLevel(treeData.root, level);
                refreshTree();
                showToast(`已展开到${level}级目录`, 'success');
            });
        });

        // 搜索功能
        const searchTypeSelect = document.getElementById('search-type');
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        function performSearch() {
            const searchType = searchTypeSelect.value;
            const keyword = searchInput.value.trim();
            
            if (!keyword) {
                showToast('请输入搜索关键词', 'warning');
                return;
            }

            searchResults = [];
            currentSearchIndex = -1;

            // 递归搜索树
            function searchNodes(node) {
                if (node.type === 'file') {
                    let match = false;
                    if (searchType === 'filename') {
                        // 按文件名搜索
                        match = node.name.toLowerCase().includes(keyword.toLowerCase());
                    } else if (searchType === 'remark') {
                        // 按备注搜索
                        match = node.fileInfo && node.fileInfo.asrRemark && 
                               node.fileInfo.asrRemark.toLowerCase().includes(keyword.toLowerCase());
                    }
                    
                    if (match) {
                        searchResults.push(node);
                        // 展开文件路径上的所有父节点
                        expandNodePath(node, treeData.root);
                    }
                }

                if (node.children) {
                    node.children.forEach(child => {
                        searchNodes(child);
                    });
                }
            }

            searchNodes(treeData.root);

            if (searchResults.length === 0) {
                showToast(`未找到匹配的${searchType === 'filename' ? '文件' : '备注'}`, 'info');
            } else {
                showToast(`找到 ${searchResults.length} 个匹配结果`, 'success');
                highlightSearchResults();
                navigateToNextResult();
            }
        }

        /**
         * 展开节点路径上的所有父节点
         */
        function expandNodePath(targetNode, rootNode) {
            const path = findNodePath(rootNode, targetNode);
            if (path) {
                path.forEach(node => {
                    if (node.type === 'folder' || node.type === 'root') {
                        node.collapsed = false;
                    }
                });
            }
        }

        /**
         * 查找节点路径
         */
        function findNodePath(rootNode, targetNode, currentPath = []) {
            if (rootNode === targetNode) {
                return [...currentPath, rootNode];
            }

            if (rootNode.children) {
                for (const child of rootNode.children) {
                    const path = findNodePath(child, targetNode, [...currentPath, rootNode]);
                    if (path) {
                        return path;
                    }
                }
            }

            return null;
        }

        function highlightSearchResults() {
            // 清除之前的高亮
            document.querySelectorAll('.tree-node-content.search-match').forEach(el => {
                el.classList.remove('search-match');
            });

            // 添加新的高亮
            searchResults.forEach(node => {
                const nodeElement = document.querySelector(`[data-node-id="${node.id}"] .tree-node-content`);
                if (nodeElement) {
                    nodeElement.classList.add('search-match');
                }
            });

            refreshTree();
        }

        function navigateToNextResult() {
            if (searchResults.length === 0) return;

            currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
            const currentNode = searchResults[currentSearchIndex];
            
            // 滚动到对应节点
            const nodeElement = document.querySelector(`[data-node-id="${currentNode.id}"] .tree-node-content`);
            if (nodeElement) {
                nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 添加当前高亮
                document.querySelectorAll('.tree-node-content.search-match').forEach(el => {
                    el.style.background = '#fff9e6';
                });
                nodeElement.style.background = '#ffd666';
                
                showToast(`第 ${currentSearchIndex + 1}/${searchResults.length} 个结果`, 'info', 1500);
            }
        }

        function renderTree(node, container, level = 0) {
            const nodeElement = createNodeElement(node, level);
            container.appendChild(nodeElement);

            if (node.children && node.children.length > 0 && !node.collapsed) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'node-children';

                node.children.forEach(child => {
                    renderTree(child, childrenContainer, level + 1);
                });

                nodeElement.appendChild(childrenContainer);
            }
        }

        function createNodeElement(node, level) {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            nodeDiv.dataset.nodeId = node.id;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'tree-node-content';
            contentDiv.style.paddingLeft = (level * 20) + 'px';

            // 展开/折叠按钮（仅文件夹）
            if (node.type === 'folder' || node.type === 'root') {
                const expandBtn = document.createElement('span');
                expandBtn.className = 'node-expand';
                expandBtn.innerHTML = node.collapsed ? '▶ ' : '▼ ';
                expandBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleNode(node);
                });
                contentDiv.appendChild(expandBtn);
            } else {
                const spacer = document.createElement('span');
                spacer.className = 'node-expand';
                spacer.style.width = '18px';
                contentDiv.appendChild(spacer);
            }

            // 节点图标
            const icon = document.createElement('span');
            icon.className = 'node-icon';
            icon.innerHTML = getNodeIcon(node);
            contentDiv.appendChild(icon);

            // 节点名称（可编辑）
            const nameSpan = document.createElement('span');
            nameSpan.className = 'node-name';
            
            // 如果是文件节点且有备注，显示备注信息
            if (node.type === 'file' && node.fileInfo && node.fileInfo.asrRemark) {
                nameSpan.innerHTML = `${node.name} <span style="color: #999; font-size: 12px; margin-left: 8px;">${node.fileInfo.asrRemark}</span>`;
            } else {
                nameSpan.textContent = node.name;
            }
            
            nameSpan.addEventListener('dblclick', () => {
                makeNameEditable(nameSpan, node);
            });
            contentDiv.appendChild(nameSpan);

            // 点击选择
            contentDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                selectNode(node, contentDiv);
                updateToolbarState();
            });

            // 拖动功能
            contentDiv.draggable = true;
            contentDiv.addEventListener('dragstart', (e) => {
                dragNode = node;
                contentDiv.classList.add('dragging');
                e.dataTransfer.setData('text/plain', node.id);

                const ghost = contentDiv.cloneNode(true);
                ghost.classList.add('drag-ghost');
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 0, 0);

                setTimeout(() => document.body.removeChild(ghost), 0);
            });

            contentDiv.addEventListener('dragend', () => {
                contentDiv.classList.remove('dragging');
                document.querySelectorAll('.tree-node-content').forEach(el => {
                    el.classList.remove('drop-target');
                });
                dragNode = null;
            });

            contentDiv.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (dragNode && canDrop(dragNode, node)) {
                    contentDiv.classList.add('drop-target');
                }
            });

            contentDiv.addEventListener('dragleave', () => {
                contentDiv.classList.remove('drop-target');
            });

            contentDiv.addEventListener('drop', (e) => {
                e.preventDefault();
                contentDiv.classList.remove('drop-target');

                if (dragNode && canDrop(dragNode, node)) {
                    moveNode(dragNode, node);
                }
            });

            nodeDiv.appendChild(contentDiv);
            return nodeDiv;
        }

        function getNodeIcon(node) {
            switch (node.type) {
                case 'root': return '<svg t="1760581609068" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2020" width="20" height="20"><path d="M32 128a64 64 0 0 1 64-64h464.128a64 64 0 0 1 45.312 18.752L714.688 192H32V128zM32 256h896a64 64 0 0 1 64 64v544a64 64 0 0 1-64 64h-832a64 64 0 0 1-64-64V256zM192 672v64a32 32 0 0 0 64 0v-64a32 32 0 0 0-64 0z m192 0a32 32 0 0 0-64 0v64a32 32 0 0 0 64 0v-64z m64 0v64a32 32 0 0 0 64 0v-64a32 32 0 0 0-64 0z" fill="#FF9B29" p-id="2021"></path></svg>';
                case 'folder': return node.collapsed ? '<svg t="1760581533162" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1798" width="20" height="20"><path d="M838.782362 1023.6801H183.627098A184.262418 184.262418 0 0 1 0.00448 838.138082V185.542018A184.262418 184.262418 0 0 1 183.627098 0h87.012808a77.223868 77.223868 0 0 1 48.624805 17.274602l113.244611 93.730709a74.536707 74.536707 0 0 0 47.985005 17.274602h358.288035a184.134458 184.134458 0 0 1 182.982818 185.542018v524.636051a184.134458 184.134458 0 0 1-182.982818 185.542018z" fill="#FFD05C" p-id="1799"></path><path d="M314.786111 442.549703h733.850671a104.41537 104.41537 0 0 1 95.97001 142.419494l-144.594814 372.427616a103.00781 103.00781 0 0 1-95.97001 66.219307H169.551497a104.09547 104.09547 0 0 1-95.97001-142.675414l145.234614-372.427616a103.77557 103.77557 0 0 1 95.97001-65.963387z m0 0" fill="#FCA235" p-id="1800"></path></svg>' : '<svg t="1760581533162" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1798" width="20" height="20"><path d="M838.782362 1023.6801H183.627098A184.262418 184.262418 0 0 1 0.00448 838.138082V185.542018A184.262418 184.262418 0 0 1 183.627098 0h87.012808a77.223868 77.223868 0 0 1 48.624805 17.274602l113.244611 93.730709a74.536707 74.536707 0 0 0 47.985005 17.274602h358.288035a184.134458 184.134458 0 0 1 182.982818 185.542018v524.636051a184.134458 184.134458 0 0 1-182.982818 185.542018z" fill="#FFD05C" p-id="1799"></path><path d="M314.786111 442.549703h733.850671a104.41537 104.41537 0 0 1 95.97001 142.419494l-144.594814 372.427616a103.00781 103.00781 0 0 1-95.97001 66.219307H169.551497a104.09547 104.09547 0 0 1-95.97001-142.675414l145.234614-372.427616a103.77557 103.77557 0 0 1 95.97001-65.963387z m0 0" fill="#FCA235" p-id="1800"></path></svg>';
                case 'file': return '<svg t="1760581379829" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1579" width="20" height="20"><path d="M951.466667 1013.333333h-874.666667c-14.933333 0-27.733333-12.8-27.733333-27.733333V38.4c0-14.933333 12.8-27.733333 27.733333-27.733333h518.4c211.2 0 381.866667 170.666667 381.866667 381.866666v593.066667c0 14.933333-10.666667 27.733333-25.6 27.733333z" fill="#F7F7F7" p-id="1580"></path><path d="M951.466667 1024h-874.666667c-21.333333 0-38.4-17.066667-38.4-38.4V38.4C38.4 17.066667 55.466667 0 76.8 0h518.4c217.6 0 392.533333 177.066667 392.533333 392.533333v593.066667c2.133333 21.333333-17.066667 38.4-36.266666 38.4zM76.8 21.333333c-8.533333 0-14.933333 8.533333-14.933333 17.066667v947.2c0 8.533333 6.4 17.066667 17.066666 17.066667h872.533334c8.533333 0 17.066667-6.4 17.066666-17.066667V392.533333C966.4 187.733333 800 21.333333 595.2 21.333333H76.8z" fill="#E8E8E8" p-id="1581"></path><path d="M704 349.866667H330.666667c-10.666667 0-17.066667 8.533333-17.066667 17.066666v14.933334c0 10.666667 8.533333 17.066667 17.066667 17.066666H704c10.666667 0 17.066667-8.533333 17.066667-17.066666v-14.933334c0-8.533333-8.533333-17.066667-17.066667-17.066666zM654.933333 535.466667c8.533333 0 14.933333-6.4 14.933334-14.933334v-19.2c0-8.533333-6.4-14.933333-14.933334-14.933333H369.066667c-8.533333 0-14.933333 6.4-14.933334 14.933333v19.2c0 8.533333 6.4 14.933333 14.933334 14.933334h285.866666zM704 616.533333H328.533333c-10.666667 0-17.066667 8.533333-17.066666 17.066667v12.8c0 10.666667 8.533333 17.066667 17.066666 17.066667H704c10.666667 0 17.066667-8.533333 17.066667-17.066667v-12.8c0-10.666667-8.533333-17.066667-17.066667-17.066667z" fill="#6E6E6E" p-id="1582"></path></svg>';
                default: return '<svg t="1760581740715" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3085" width="20" height="20"><path d="M512 0C227.555556 0 0 227.555556 0 512s227.555556 512 512 512 512-227.555556 512-512-227.555556-512-512-512z m45.511111 853.333333c-17.066667 11.377778-28.444444 17.066667-51.2 17.066667-17.066667 0-34.133333-5.688889-51.2-17.066667-17.066667-11.377778-22.755556-28.444444-22.755555-51.2s5.688889-34.133333 22.755555-51.2c11.377778-11.377778 28.444444-22.755556 51.2-22.755555s34.133333 5.688889 51.2 22.755555c11.377778 11.377778 22.755556 28.444444 22.755556 51.2s-11.377778 39.822222-22.755556 51.2z m176.355556-443.733333c-11.377778 22.755556-22.755556 39.822222-39.822223 51.2-17.066667 17.066667-39.822222 39.822222-79.644444 73.955556l-28.444444 28.444444c-5.688889 5.688889-11.377778 17.066667-17.066667 22.755556v17.066666c0 5.688889-5.688889 17.066667-5.688889 34.133334-5.688889 34.133333-22.755556 51.2-56.888889 51.2-17.066667 0-28.444444-5.688889-39.822222-17.066667-11.377778-11.377778-17.066667-28.444444-17.066667-45.511111 0-28.444444 5.688889-51.2 11.377778-68.266667 5.688889-17.066667 17.066667-34.133333 34.133333-51.2 11.377778-17.066667 34.133333-34.133333 56.888889-51.2 22.755556-17.066667 34.133333-28.444444 45.511111-39.822222s17.066667-17.066667 22.755556-28.444445c5.688889-11.377778 11.377778-22.755556 11.377778-34.133333 0-22.755556-11.377778-45.511111-28.444445-62.577778-17.066667-17.066667-45.511111-28.444444-73.955555-28.444444-45.511111-11.377778-73.955556 0-85.333334 17.066667-17.066667 17.066667-34.133333 45.511111-45.511111 79.644444-11.377778 34.133333-28.444444 51.2-62.577778 51.2-17.066667 0-34.133333-5.688889-45.511111-17.066667-11.377778-11.377778-17.066667-28.444444-17.066666-39.822222 0-28.444444 11.377778-62.577778 28.444444-91.022222s45.511111-56.888889 85.333333-79.644445c39.822222-22.755556 79.644444-28.444444 130.844445-28.444444 45.511111 0 85.333333 5.688889 119.466667 22.755556 34.133333 17.066667 62.577778 39.822222 79.644444 68.266666 22.755556 28.444444 34.133333 62.577778 34.133333 96.711111 0 28.444444-5.688889 51.2-17.066666 68.266667z" fill="#FF7E11" p-id="3086"></path></svg>';
            }
        }

        function toggleNode(node) {
            node.collapsed = !node.collapsed;
            refreshTree();
        }

        function selectNode(node, element) {
            document.querySelectorAll('.tree-node-content.selected').forEach(el => {
                el.classList.remove('selected');
            });

            element.classList.add('selected');
            selectedNode = node;
            updateToolbarState();
        }

        function makeNameEditable(element, node) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = node.name;
            input.style.cssText = `
                color: #000000 !important;
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
            const wrapper = document.createElement('span');
            wrapper.className = 'node-name editing';
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

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });
        }

        function addNewNode(parentNode, type) {
            if (type === 'file' && parentNode.type === 'file') {
                showToast('不能在文件下添加子节点', 'error');
                return;
            }

            const newNode = {
                id: generateId(),
                name: type === 'folder' ? '新建文件夹' : '新建文件',
                type: type,
                level: parentNode.level + 1,
                children: type === 'folder' ? [] : undefined,
                fileCount: 0,
                collapsed: type === 'folder'
            };

            if (!parentNode.children) {
                parentNode.children = [];
            }

            parentNode.children.push(newNode);
            if (parentNode.type === 'folder' || parentNode.type === 'root') {
                parentNode.collapsed = false;
            }

            refreshTree();
            showToast(`已添加${type === 'folder' ? '文件夹' : '文件'}`, 'success');
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
            showToast('节点已删除', 'success');
        }
    }
}

        function canDrop(draggedNode, targetNode) {
            if (draggedNode === targetNode) return false;
            if (targetNode.type === 'file') return false;
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
                    showToast('节点已移动', 'success');
                }
            }
        }

        function updateNodeLevel(node, newLevel) {
            node.level = newLevel;
            if (node.children) {
                node.children.forEach(child => {
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
                node.children.forEach(child => {
                    expandAllNodes(child);
                });
            }
        }

        function collapseAllNodes(node) {
            if (node.type === 'folder' || node.type === 'root') {
                node.collapsed = true;
            }
            if (node.children) {
                node.children.forEach(child => {
                    collapseAllNodes(child);
                });
            }
        }

        /**
         * 展开到指定层级
         */
        function expandToLevel(node, targetLevel, currentLevel = 0) {
            if (node.type === 'folder' || node.type === 'root') {
                node.collapsed = currentLevel >= targetLevel;

                if (node.children) {
                    node.children.forEach(child => {
                        expandToLevel(child, targetLevel, currentLevel + 1);
                    });
                }
            }
        }

        /**
         * 文件预览功能
         */
        function previewFile(fileNode) {
            if (!fileNode || fileNode.type !== 'file') {
                showToast('请选择有效的文件进行预览', 'warning');
                return;
            }

            const fileInfo = fileNode.fileInfo;
            if (!fileInfo) {
                showToast('文件信息不完整，无法预览', 'error');
                return;
            }

            // 确认预览
            $NG.confirm('确定打开预览？', {
                onOk: async () => {
                    try {
                        const openUrl = "https://ynnterp-mproject.cnyeig.com/JFileSrv/preview/fileSource";
                        const title = fileInfo.asrName || '文件预览';
                        
                        // 构建预览参数
                        const previewParams = {
                            AppTitle: title,
                            name: title,
                            guid: fileInfo.asrSessionGuid || '',
                            fid: fileInfo.asrFid || '',
                            language: 'zh-CN',
                            dbToken: downloadConfig.dbToken || '0001',
                            busTypeCode: fileInfo.bustypecode || downloadConfig.busType || 'design_data',
                            asrFill: 'sys8', // 默认值
                            orgId: downloadConfig.orgId || 1,
                            wMDisabled: downloadConfig.wmDisabled || 0,
                            billWM: downloadConfig.billWM || '',
                            previewType: 'scroll',
                            pureWeb: 1,
                        };

                        console.log('文件预览参数:', previewParams);
                        
                        // 打开预览窗口
                        $NG.open(openUrl, previewParams);
                        
                        showToast('正在打开文件预览...', 'success');
                    } catch (error) {
                        console.error('文件预览失败:', error);
                        showToast('文件预览打开失败: ' + error.message, 'error');
                    }
                },
                onCancel: () => {
                    showToast('已取消预览', 'info');
                }
            });
        }

 function updateToolbarState() {
    const deleteBtn = document.getElementById('delete-btn');
    const addFolderBtn = document.getElementById('add-folder-btn');
    const previewBtn = document.getElementById('preview-btn');

    if (selectedNode) {
        // 根节点不能删除，其他节点可以删除
        deleteBtn.disabled = selectedNode.type === 'root';
        
        // 只能在文件夹类型节点下添加新节点
        addFolderBtn.disabled = selectedNode.type === 'file';
        
        // 只有文件节点可以预览
        previewBtn.disabled = selectedNode.type !== 'file';
        
        console.log('选中节点:', selectedNode.name, '删除按钮禁用:', deleteBtn.disabled, '预览按钮禁用:', previewBtn.disabled);
    } else {
        deleteBtn.disabled = true;
        addFolderBtn.disabled = false; // 没有选中节点时可以在根节点添加
        previewBtn.disabled = true;
        console.log('没有选中节点，删除按钮禁用');
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
    treeContainer.innerHTML = '';
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

        // 默认展开到2级目录
        expandToLevel(treeData.root, 2);
        refreshTree();
    }

    /**
     * 获取编辑后的树结构
     */
    function getEditedTreeStructure() {
        return JSON.parse(JSON.stringify(currentTreeType ? treeStructure : NuTreeStructure));
    }

    /**
     * 引入JSZip库用于创建ZIP文件
     */
    function loadJSZip() {
        return new Promise((resolve, reject) => {
            if (typeof JSZip !== 'undefined') {
                resolve(JSZip);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(JSZip);
            script.onerror = () => reject(new Error('Failed to load JSZip'));
            document.head.appendChild(script);
        });
    }

    /**
     * 获取文件下载URL
     */
    async function getFileDownloadUrl(asrFid, dataObject) {
        try {
            const response = await fetch('/JFileSrv/api/getDownloadUrlByAsrFids', {
                method: 'POST',
                headers: {
                    'dbToken': dataObject.dbToken || '0001',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    asrFids: [asrFid],
                    loginId: dataObject.loginId || "3100000000000009",
                    orgId: dataObject.orgId || "0",
                    busTypeCode: dataObject.busTypeCode || "EFORM9000000080",
                    wmDisabled: dataObject.wmDisabled || "1",
                    billWM: dataObject.billWM || "YEIG"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data && result.data[asrFid] ? result.data[asrFid] : null;
        } catch (error) {
            console.error('Failed to get download URL for asrFid:', asrFid, error);
            return null;
        }
    }

    /**
     * 下载文件内容
     */
    async function downloadFileContent(downloadUrl) {
        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.blob();
        } catch (error) {
            console.error('Failed to download file content:', downloadUrl, error);
            return null;
        }
    }

    /**
     * 根据编辑后的树结构创建ZIP文件
     */
    async function downloadWithEditedStructure(editedStructure, downloadConfig) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library not loaded');
        }

        console.log('开始使用编辑后的结构下载附件:', editedStructure);
        console.log('下载配置:', downloadConfig);

        const zip = new JSZip();
        let totalFiles = 0;
        let downloadedFiles = 0;

        // 创建文件映射，便于查找文件数据
        const fileMap = createFileMap(downloadConfig);

        // 递归构建ZIP结构
        async function buildZipStructure(node, parentFolder) {
            if (node.type === 'folder' || node.type === 'root') {
                const currentFolder = node.type === 'root' ?
                    parentFolder.folder(node.name) :
                    parentFolder.folder(node.name);

                if (node.children && node.children.length > 0) {
                    for (const child of node.children) {
                        await buildZipStructure(child, currentFolder);
                    }
                }
            } else if (node.type === 'file') {
                totalFiles++;
                showToast(`正在下载文件 (${downloadedFiles + 1}/${totalFiles}): ${node.name}`, 'info', 2000);

                // 查找对应的文件数据
                const fileData = findFileData(node, fileMap);

                if (fileData && fileData.asrFid) {
                    try {
                        const downloadUrl = await getFileDownloadUrl(fileData.asrFid, downloadConfig);
                        if (downloadUrl) {
                            const fileContent = await downloadFileContent(downloadUrl);
                            if (fileContent) {
                                parentFolder.file(node.name, fileContent);
                                downloadedFiles++;
                                console.log(`文件下载完成: ${node.name}`);
                            } else {
                                console.warn(`Failed to download content for file: ${node.name}`);
                                parentFolder.file(node.name, '');
                            }
                        } else {
                            console.warn(`Failed to get download URL for file: ${node.name}`);
                            parentFolder.file(node.name, '');
                        }
                    } catch (error) {
                        console.error(`下载文件失败 ${node.name}:`, error);
                        parentFolder.file(node.name, '');
                    }
                } else {
                    console.warn(`未找到文件数据: ${node.name}`);
                    parentFolder.file(node.name, '');
                }
            }
        }

        // 开始构建ZIP
        await buildZipStructure(editedStructure.root, zip);

        // 生成并下载ZIP文件
        return zip.generateAsync({ type: 'blob' }).then(function (content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = editedStructure.root.name + '.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            showToast(`加载完成！总共 ${downloadedFiles} 个文件`, 'success');
            return true;
        });
    }

    /**
     * 创建文件映射表
     */
    function createFileMap(downloadConfig) {
        const fileMap = {};

        // 处理主表单附件
        if (downloadConfig.mainAttachment && downloadConfig.mFormName) {
            const mainAttachments = downloadConfig.mainAttachment[downloadConfig.mFormName];
            if (mainAttachments && mainAttachments.data && mainAttachments.data.attachmentRecordList) {
                mainAttachments.data.attachmentRecordList.forEach(attachment => {
                    const fileName = decodeFileName(attachment.asrName);
                    fileMap[fileName] = {
                        asrFid: attachment.asrFid,
                        asrName: attachment.asrName,
                        typeName: attachment.typeName,
                        asrRemark: attachment.asrRemark || '' // 添加备注信息
                    };
                });
            }
        }

        // 处理分组表单附件
        if (downloadConfig.groupAttachments) {
            for (const formName in downloadConfig.groupAttachments) {
                const groupAttachments = downloadConfig.groupAttachments[formName];
                if (groupAttachments.data && groupAttachments.data.attachmentRecordList) {
                    groupAttachments.data.attachmentRecordList.forEach(attachment => {
                        const fileName = decodeFileName(attachment.asrName);
                        fileMap[fileName] = {
                            asrFid: attachment.asrFid,
                            asrName: attachment.asrName,
                            typeName: attachment.typeName,
                            asrRemark: attachment.asrRemark || '' // 添加备注信息
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
                    detailAttachments.forEach(detailItem => {
                        if (detailItem.code === 200 && detailItem.data && detailItem.data.attachmentRecordList) {
                            detailItem.data.attachmentRecordList.forEach(attachment => {
                                const fileName = decodeFileName(attachment.asrName);
                                fileMap[fileName] = {
                                    asrFid: attachment.asrFid,
                                    asrName: attachment.asrName,
                                    typeName: attachment.typeName,
                                    asrRemark: attachment.asrRemark || '' // 添加备注信息
                                };
                            });
                        }
                    });
                }
            }
        }

        console.log('文件映射表创建完成:', fileMap);
        return fileMap;
    }

    /**
     * 查找文件数据
     */
    function findFileData(fileNode, fileMap) {
        // 直接通过文件名查找
        if (fileMap[fileNode.name]) {
            return fileMap[fileNode.name];
        }

        // 如果文件节点有fileInfo，直接使用
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

    /**
     * 显示文件树编辑模态框
     */
    function showTreeEditModal() {
        const modal = createTreeEditModal();
        initModalInteractions(modal);
    }

    /**
     * 解码URL编码的文件名
     */
    function decodeFileName(fileName) {
        try {
            return decodeURIComponent(fileName);
        } catch (e) {
            console.warn('文件名解码失败，使用原文件名:', fileName);
            return fileName;
        }
    }

    /**
     * 创建可复用的提示框组件
     */
    function showToast(message, type = 'info', duration = 3000) {
    // 移除已存在的提示框
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 定义不同类型对应的样式
    const typeStyles = {
        info: {
            backgroundColor: 'rgba(24, 144, 255, 0.9)',
            icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M507.297959 862.040816c-52.244898 0-102.922449-9.404082-151.510204-27.689796l-116.506122 25.6c-24.032653 5.22449-46.497959 0-60.604082-14.628571-14.628571-14.628571-19.853061-36.571429-14.628571-60.604082l17.240816-77.844898c-43.363265-57.469388-66.35102-122.77551-66.35102-190.693877C114.938776 320.783673 291.004082 161.959184 507.297959 161.959184c107.62449 0 208.457143 36.04898 283.689796 101.877551C867.265306 330.710204 909.061224 420.04898 909.061224 516.179592c0 190.693878-180.244898 345.861224-401.763265 345.861224z" fill="#7BD4EF"></path><path d="M512 581.485714c-38.138776 0-69.485714-31.346939-69.485714-69.485714s31.346939-69.485714 69.485714-69.485714 69.485714 31.346939 69.485714 69.485714-31.346939 69.485714-69.485714 69.485714zM710.530612 581.485714c-38.138776 0-69.485714-31.346939-69.485714-69.485714s31.346939-69.485714 69.485714-69.485714 69.485714 31.346939 69.485715 69.485714-31.346939 69.485714-69.485715 69.485714zM313.469388 581.485714c-38.138776 0-69.485714-31.346939-69.485715-69.485714s31.346939-69.485714 69.485715-69.485714 69.485714 31.346939 69.485714 69.485714-31.346939 69.485714-69.485714 69.485714z" fill="#278DCA"></path></svg>'
        },
        success: {
            backgroundColor: 'rgba(82, 196, 26, 0.9)',
            icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m277.333333 279.466667l-341.333333 341.333333c-4.266667 6.4-12.8 8.533333-21.333333 8.533334s-17.066667-2.133333-23.466667-8.533334l-170.666667-170.666666c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l149.333334 147.2L746.666667 320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32-2.133334 44.8z" fill="#3BBC86"></path></svg>'
        },
        error: {
            backgroundColor: 'rgba(245, 34, 45, 0.9)',
            icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m204.8 586.666667c12.8 10.666667 10.666667 32 0 44.8s-32 12.8-44.8 0L512 556.8l-160 160c-10.666667 12.8-32 12.8-44.8 0-12.8-10.666667-12.8-32 0-44.8l160-160-160-160c-12.8-10.666667-12.8-32 0-44.8 10.666667-12.8 32-12.8 44.8 0l160 160 160-162.133333c12.8-10.666667 34.133333-10.666667 44.8 2.133333 12.8 10.666667 12.8 32 0 44.8L556.8 512l160 160z" fill="#F25858"></path></svg>'
        },
        warning: {
            backgroundColor: 'rgba(250, 173, 20, 0.9)',
            icon: '<svg viewBox="0 0 1217 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M1134.696569 1024H83.026578a83.026578 83.026578 0 0 1-83.026578-83.026578 79.705515 79.705515 0 0 1 3.597818-22.970687L0 913.297896 525.834995 55.356587h4.981595a82.694472 82.694472 0 0 1 156.089967 0H691.888152l490.963833 818.088551A83.026578 83.026578 0 0 1 1134.696569 1024z m-525.834995-110.702104a55.351052 55.351052 0 1 0-55.351052-55.351052 55.517105 55.517105 0 0 0 55.351052 55.351052z m0-636.5371a83.026578 83.026578 0 0 0-83.026579 83.026578l27.675527 304.430787a55.351052 55.351052 0 0 0 110.702104 0l27.675526-304.430787a83.026578 83.026578 0 0 0-83.026578-83.026578z" fill="#F4AA55"></path></svg>'
        },
        tip: {
            backgroundColor: 'rgba(114, 46, 209, 0.9)',
            icon: '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M512 0C231.131 0 0 231.131 0 512s231.131 512 512 512 512-231.131 512-512S792.869 0 512 0z m-51.2 219.429c0-8.778 5.851-14.629 14.629-14.629h73.142c8.778 0 14.629 5.851 14.629 14.629v73.142c0 8.778-5.851 14.629-14.629 14.629H475.43c-8.778 0-14.629-5.851-14.629-14.629V219.43zM614.4 804.57c0 8.778-7.314 14.629-14.629 14.629H475.43c-8.778 0-14.629-5.851-14.629-14.629V526.63c0-8.778-5.851-14.629-14.629-14.629H424.23c-7.315 0-14.629-5.851-14.629-14.629V424.23c0-8.778 7.314-14.629 14.629-14.629H548.57c8.778 0 14.629 5.851 14.629 14.629V702.17c0 8.778 5.851 14.629 14.629 14.629h21.942c7.315 0 14.629 5.851 14.629 14.629v73.142z" fill="#03A4FF"></path></svg>'
        }
    };

    // 获取对应类型的样式，如果类型不存在则使用默认的info样式
    const style = typeStyles[type] || typeStyles.info;

    // 创建提示框元素
    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
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
        border-left: 4px solid rgba(255, 255, 255, 0.3);
    `;

    // 创建图标容器
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    `;
    iconContainer.innerHTML = style.icon;

    // 创建消息容器
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        flex: 1;
        display: flex;
        align-items: center;
        min-height: 20px;
        line-height: 1.4;
    `;
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
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-40px)';

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
                headers: { dbToken: '0001' }
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
                const response = await fetchAttachmentInfo(url, `${description}-dGuid:${dGuid}`);
                return {
                    dGuid: dGuid,
                    response: response,
                    success: !!response
                };
            } catch (error) {
                return {
                    dGuid: dGuid,
                    response: null,
                    success: false,
                    error: error
                };
            }
        });

        const detailResults = await Promise.all(detailPromises);
        const validDetails = detailResults
            .filter(item => item.success && item.response)
            .map(item => item.response);

        console.log(`${description}获取完成: 总共${dGuids.length}个, 有效${validDetails.length}个`);
        return validDetails;
    }

    // 检查是否有有效的附件数据
    function hasValidAttachments(downloadConfig) {
        let hasValid = false;

        // 检查主附件
        if (downloadConfig.mainAttachment) {
            for (const formName in downloadConfig.mainAttachment) {
                const mainAttach = downloadConfig.mainAttachment[formName];
                if (mainAttach && mainAttach.data && mainAttach.data.attachmentRecordList && mainAttach.data.attachmentRecordList.length > 0) {
                    console.log(`主附件 ${formName} 有 ${mainAttach.data.attachmentRecordList.length} 个文件`);
                    hasValid = true;
                }
            }
        }

        // 检查分组附件
        if (downloadConfig.groupAttachments) {
            for (const formName in downloadConfig.groupAttachments) {
                const groupAttach = downloadConfig.groupAttachments[formName];
                if (groupAttach && groupAttach.data && groupAttach.data.attachmentRecordList && groupAttach.data.attachmentRecordList.length > 0) {
                    console.log(`分组附件 ${formName} 有 ${groupAttach.data.attachmentRecordList.length} 个文件`);
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
                        if (detailAttach && detailAttach.data && detailAttach.data.attachmentRecordList && detailAttach.data.attachmentRecordList.length > 0) {
                            console.log(`明细附件 ${formName} 有 ${detailAttach.data.attachmentRecordList.length} 个文件`);
                            hasValid = true;
                        }
                    }
                }
            }
        }

        console.log('附件有效性检查结果:', hasValid);
        return hasValid;
    }

    // 内部变量
    let fromObj = {};
    let attachmentData = {
        mainAttachment: null,
        groupAttachments: {},
        detailAttachments: {}
    };

    // 主执行函数
    async function mainExecution() {
        try {
            // 1. 首先获取基础表单附件信息
            const params = {
                phidValue: phidValue,
                busType: cfg.busType,
                tableName: cfg.tableName,
                mainTableNames: [cfg.tableName]
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
                        attachmentData.mainAttachment = await fetchAttachmentInfo(mainUrl, "单据附件");
                    })()
                );
            }

            // 获取分组附件信息 - 使用配置的 sFormGroupKeys
            if (fromObj.mGuids && fromObj.mGuids.length > 0) {
                // 为每个分组附件分别获取信息
                const groupPromises = fromObj.mGuids.map(async (mGuidObj) => {
                    const formName = mGuidObj.formName;
                    const groupUrl = `/JFileSrv/reactAttach/tableAttachInit?asrSessionGuid=${mGuidObj.guid}&busTypeCode=${cfg.busType}&asrFill=${fromObj.asrfill}&asrFillName=${fromObj.asrfillname}&asrTable=${fromObj.asrtable}&asrCode=${phidValue}&orgId=1&colAttach=0&uCode=0001`;
                    const groupResponse = await fetchAttachmentInfo(groupUrl, `分组附件-${formName}`);
                    if (groupResponse) {
                        attachmentData.groupAttachments[formName] = groupResponse;
                        console.log(`分组附件 ${formName} (字段: ${mGuidObj.fieldName}) 获取成功`);
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
                                const detailAttachments = await fetchDetailAttachments(dGuids, `明细附件-${formName}`);
                                if (detailAttachments.length > 0) {
                                    attachmentData.detailAttachments[formName] = detailAttachments;
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
                dFormName: cfg.dFormName
            };

            console.log('完整的下载配置:', downloadConfig);

            // 4. 构建两种树形结构
            treeStructure = buildTreeStructureWithRowFolder(downloadConfig);
            NuTreeStructure = buildTreeStructureWithoutRowFolder(downloadConfig);

            console.log('文件树编辑功能初始化完成');

            // 5. 加载JSZip
            await loadJSZip();
            console.log('JSZip加载完成');

            return {
                success: true,
                message: '附件下载管理器初始化完成',
                hasAttachments: hasValidAttachments(downloadConfig)
            };

        } catch (error) {
            console.error('主执行流程出错:', error);
            showToast('处理附件时发生错误: ' + error.message, 'error');
            return {
                success: false,
                message: '初始化失败: ' + error.message,
                error: error
            };
        }
    }

    // 公共方法 - 显示编辑模态框
    function showAttachmentModal() {
        if (!hasValidAttachments(downloadConfig)) {
            console.warn('没有找到有效的附件数据');
            $NG.alert('当前没有可下载的附件');
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
        reinitialize: mainExecution
    };
}



//代码仓库动态逻辑
/**
 * 动态加载并显示表单附件信息
 * @param {Object} config - 配置参数对象
 * @param {string} config.tableName - 表名
 * @param {string} config.busType - 业务类型
 * @param {string} config.Guid - 唯一标识符
 * @param {string} config.dbToken - 数据库令牌
 * @param {string} config.creator - 创建者ID
 * @param {string} config.creatorName - 创建者姓名
 * @param {string} config.targetDivId - 目标div的ID
 * @param {string} [config.editor] - 编辑者ID（可选）
 * @param {string} [config.phid] - 表单PHID（可选）
 */
function loadAttachmentInfo(config) {
    // 参数验证
    const requiredParams = ['tableName', 'busType', 'Guid', 'dbToken', 'creator', 'creatorName', 'targetDivId'];
    const missingParams = requiredParams.filter(param => !config[param]);
    
    if (missingParams.length > 0) {
        console.error('缺少必要参数:', missingParams.join(', '));
        return;
    }

    const {
        tableName,
        busType,
        Guid,
        dbToken,
        creator,
        creatorName,
        targetDivId,
        editor = $NG.getUser().userID,
        phid = $NG.getCmpApi(tableName).getValues().phid
    } = config;

    console.log('开始加载附件信息...', {
        tableName, busType, Guid, dbToken, creator, creatorName, targetDivId
    });

    // 构建请求URL - 修复uCode参数使用dbToken值
    const requestUrl = `https://ynnterp-mproject.cnyeig.com/JFileSrv/reactAttach/tableAttachInit?asrSessionGuid=${Guid}&busTypeCode=${busType}&asrFill=${creator}&asrFillName=${creatorName}&asrTable=${tableName}&asrCode=${phid}&orgId=1&colAttach=1&uCode=${dbToken}`;

    // 发送请求获取附件信息
    $NG.request.get({
        url: requestUrl,
        headers: { dbToken: dbToken }
    }).then((res) => {
        console.log("分组附件信息响应:", res);
        
        // 处理并显示附件信息
        processAndDisplayAttachment(res, targetDivId);
        
        // 同时更新表单状态（如果需要）
        updateFormState(res, tableName);
        
    }).catch((error) => {
        console.error("获取附件信息失败:", error);
        displayErrorMessage(targetDivId, error.message || '网络请求失败');
    });
}

/**
 * 处理并显示附件信息
 */
function processAndDisplayAttachment(res, targetDivId) {
    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) {
        console.error(`未找到ID为'${targetDivId}'的div元素`);
        return;
    }

    // 清空div内容并显示加载骨架屏
    targetDiv.innerHTML = createSkeletonHTML();
    addAttachmentStyles();

    if (res.code === 200 && res.data && res.data.attachmentRecordList) {
        const attachmentList = res.data.attachmentRecordList;

        if (attachmentList.length === 0) {
            // 没有附件时显示空状态，但保持有数据时的样式格式
            displayEmptyState(targetDivId);
            return;
        }

        // 处理并显示附件列表
        displayAttachmentList(targetDivId, attachmentList);
        
    } else {
        displayDataError(targetDivId, res);
    }
}

/**
 * 创建加载骨架屏HTML
 */
function createSkeletonHTML() {
    return `
        <div class="attachment-container">
            <div class="attachment-title">动态</div>
            <div class="attachment-list">
                <div class="attachment-record skeleton">
                    <div class="record-header">
                        <span class="record-index skeleton-text"></span>
                        <span class="record-time skeleton-text"></span>
                    </div>
                    <div class="record-content">
                        <span class="skeleton-text" style="width: 60%"></span>
                    </div>
                    <div class="record-remark">
                        <span class="skeleton-text" style="width: 80%"></span>
                    </div>
                    <div class="record-footer">
                        <span class="skeleton-text" style="width: 30%"></span>
                        <span class="skeleton-text" style="width: 40%"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 显示空状态（保持有数据时的样式格式）
 */
function displayEmptyState(targetDivId) {
    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) return;
    
    targetDiv.innerHTML = `
        <div class="attachment-container">
            <div class="attachment-title">动态</div>
            <div class="attachment-list">
                <div class="attachment-record empty-record">
                    <div class="record-header">
                        <span class="record-index">0</span>
                        <span class="record-time">${formatDateTime(new Date())}</span>
                    </div>
                    <div class="record-content">
                        <span class="user-name">系统</span>
                        <span class="action-text">当前</span>
                        <span class="file-name">暂无附件</span>
                        <span class="action-text">请上传文件</span>
                    </div>
                    <div class="record-remark">
                        <span class="remark-label">版本说明：</span>
                        <span class="remark-content">等待首次文件上传</span>
                    </div>
                    <div class="record-footer">
                        <span class="file-size">文件大小: 0 B</span>
                        <span class="file-code">编码: 无</span>
                        <div class="copy-buttons">
                            <button class="copy-btn copy-fid" data-fid="无" disabled>📋 复制标识</button>
                            <button class="copy-btn copy-code" data-code="无" disabled>📋 复制编码</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 显示附件列表
 */
function displayAttachmentList(targetDivId, attachmentList) {
    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) return;
    
    const container = document.createElement('div');
    container.className = 'attachment-container';

    // 添加标题
    const title = document.createElement('div');
    title.className = 'attachment-title';
    title.textContent = '动态';
    container.appendChild(title);

    // 按时间倒序排列
    const sortedList = [...attachmentList].sort((a, b) => 
        new Date(b.asrFilldt) - new Date(a.asrFilldt)
    );

    // 创建附件列表
    const listContainer = document.createElement('div');
    listContainer.className = 'attachment-list';

    sortedList.forEach((record, index) => {
        const recordElement = createAttachmentRecordElement(record, index);
        listContainer.appendChild(recordElement);
    });

    container.appendChild(listContainer);
    targetDiv.innerHTML = '';
    targetDiv.appendChild(container);

    // 添加复制按钮事件监听
    addCopyButtonListeners(targetDivId);
}

/**
 * 创建单个附件记录元素
 */
function createAttachmentRecordElement(record, index) {
    const recordElement = document.createElement('div');
    recordElement.className = 'attachment-record';

    // 解码文件名和备注
    const decodedFileName = safeDecodeURIComponent(record.asrName);
    const decodedFillName = safeDecodeURIComponent(record.asrFillName || '未知用户');
    const decodedRemark = safeDecodeURIComponent(record.asrRemark || '');

    // 格式化时间
    const formatTime = formatDateTime(record.asrFilldt);

    recordElement.innerHTML = `
        <div class="record-header">
            <span class="record-index">${index + 1}</span>
            <span class="record-time">${formatTime}</span>
        </div>
        <div class="record-content">
            <span class="user-name">${decodedFillName}</span>
            <span class="action-text">更新了</span>
            <span class="file-name">${decodedFileName}</span>
            <span class="action-text">标识为</span>
            <span class="file-id">${record.asrFid}</span>
        </div>
        <div class="record-remark">
            <span class="remark-label">版本说明：</span>
            <span class="remark-content">${decodedRemark || '无版本说明'}</span>
        </div>
        <div class="record-footer">
            <span class="file-size">文件大小: ${formatFileSize(record.asrSize)}</span>
            <span class="file-code">编码: ${record.asrCode}</span>
            <div class="copy-buttons">
                <button class="copy-btn copy-fid" data-fid="${record.asrFid}" title="复制文件标识">
                    📋 复制标识
                </button>
                <button class="copy-btn copy-code" data-code="${record.asrCode}" title="复制文件编码">
                    📋 复制编码
                </button>
            </div>
        </div>
    `;

    return recordElement;
}

/**
 * 更新表单状态
 */
function updateFormState(res, tableName) {
    if (res.code === 200 && res.data && res.data.attachmentRecordList) {
        const list = res.data.attachmentRecordList;
        
        if (list.length > 0) {
            // 最新记录
            const latest = [...list].sort((a, b) => 
                new Date(b.asrFilldt) - new Date(a.asrFilldt)
            )[0];
            
            // 全部记录信息
            const allInfo = list.map(item => 
                `${safeDecodeURIComponent(item.asrName)} - ${item.asrFid}`
            ).join(' | ');

            // 更新表头单据状态信息
            $NG.updateState((updater) => {
                updater.data[tableName].setProps({
                    u_recently: `${safeDecodeURIComponent(latest.asrName)} - ${latest.asrFid}`,
                    u_complete: allInfo
                });
            });
        }
    }
}

/**
 * 显示错误信息
 */
function displayErrorMessage(targetDivId, message) {
    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) return;

    targetDiv.innerHTML = `
        <div class="attachment-container">
            <div class="attachment-title">动态</div>
            <div class="attachment-list">
                <div class="attachment-record error-record">
                    <div class="record-header">
                        <span class="record-index">!</span>
                        <span class="record-time">${formatDateTime(new Date())}</span>
                    </div>
                    <div class="record-content">
                        <span class="user-name">系统</span>
                        <span class="action-text">数据加载失败:</span>
                        <span class="file-name error-message">${message}</span>
                    </div>
                    <div class="record-remark">
                        <span class="remark-label">错误说明：</span>
                        <span class="remark-content">请检查网络连接或联系管理员</span>
                    </div>
                    <div class="record-footer">
                        <span class="file-size">状态: 异常</span>
                        <span class="file-code">编码: 无</span>
                        <div class="copy-buttons">
                            <button class="copy-btn" onclick="location.reload()">🔄 重新加载</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    addAttachmentStyles();
}

/**
 * 显示数据格式错误
 */
function displayDataError(targetDivId, res) {
    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) return;
    
    targetDiv.innerHTML = `
        <div class="attachment-container">
            <div class="attachment-title">动态</div>
            <div class="attachment-list">
                <div class="attachment-record error-record">
                    <div class="record-header">
                        <span class="record-index">⚠️</span>
                        <span class="record-time">${formatDateTime(new Date())}</span>
                    </div>
                    <div class="record-content">
                        <span class="user-name">系统</span>
                        <span class="action-text">数据格式异常，响应码:</span>
                        <span class="file-name">${res.code || '未知'}</span>
                    </div>
                    <div class="record-remark">
                        <span class="remark-label">错误说明：</span>
                        <span class="remark-content">服务器返回的数据格式不符合预期</span>
                    </div>
                    <div class="record-footer">
                        <span class="file-size">状态: 数据异常</span>
                        <span class="file-code">编码: 无</span>
                        <div class="copy-buttons">
                            <button class="copy-btn" onclick="console.log('Response:', ${JSON.stringify(res).replace(/"/g, '&quot;')})">📊 查看详情</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== 工具函数 ==========

/**
 * 添加复制按钮事件监听
 */
function addCopyButtonListeners(targetDivId) {
    const targetDiv = document.getElementById(targetDivId);
    if (!targetDiv) return;
    
    // 复制文件标识按钮
    targetDiv.querySelectorAll('.copy-fid').forEach(button => {
        button.addEventListener('click', function() {
            const fid = this.getAttribute('data-fid');
            copyToClipboard(fid, this);
        });
    });

    // 复制文件编码按钮
    targetDiv.querySelectorAll('.copy-code').forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            copyToClipboard(code, this);
        });
    });
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(text, button) {
    const originalText = button.textContent;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button, originalText);
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyText(text, button, originalText);
        });
    } else {
        fallbackCopyText(text, button, originalText);
    }
}

function fallbackCopyText(text, button, originalText) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button, originalText);
        } else {
            showCopyError(button, originalText);
        }
    } catch (err) {
        console.error('复制失败:', err);
        showCopyError(button, originalText);
    }

    document.body.removeChild(textArea);
}

function showCopySuccess(button, originalText) {
    button.textContent = '✅ 已复制';
    button.style.backgroundColor = '#28a745';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

function showCopyError(button, originalText) {
    button.textContent = '❌ 复制失败';
    button.style.backgroundColor = '#dc3545';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

/**
 * 安全URL解码
 */
function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str || '');
    } catch (e) {
        console.warn('URL解码失败，返回原字符串:', e);
        return str || '';
    }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateString) {
    if (!dateString) return '未知时间';

    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * 添加样式
 */
function addAttachmentStyles() {
    if (document.getElementById('attachment-styles')) return;

    const style = document.createElement('style');
    style.id = 'attachment-styles';
    style.textContent = `
        .attachment-container {
            font-family: "Microsoft YaHei", "SimHei", "STHeiti", sans-serif;
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            padding: 16px;
            margin: 8px 0;
        }
        
        .attachment-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a5bb8;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #1a5bb8;
        }
        
        .attachment-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .attachment-record {
            background: #ffffff;
            border: 1px solid #d1d5da;
            border-radius: 4px;
            padding: 12px;
            transition: all 0.2s ease;
        }
        
        .attachment-record:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-color: #1a5bb8;
        }
        
        .empty-record {
            background: #f8f9fa;
            border: 1px dashed #6c757d;
        }
        
        .error-record {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        
        .error-message {
            color: #dc3545 !important;
        }
        
        .record-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .record-index {
            background: #1a5bb8;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .empty-record .record-index {
            background: #6c757d;
        }
        
        .error-record .record-index {
            background: #dc3545;
        }
        
        .record-time {
            font-size: 12px;
            color: #6c757d;
        }
        
        .record-content {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        .user-name {
            color: #1a5bb8;
            font-weight: 500;
        }
        
        .action-text {
            color: #495057;
            margin: 0 4px;
        }
        
        .file-name {
            color: #28a745;
            font-weight: 500;
            background: #f8fff9;
            padding: 1px 4px;
            border-radius: 2px;
        }
        
        .empty-record .file-name {
            color: #6c757d;
            background: #e9ecef;
        }
        
        .file-id {
            color: #e83e8c;
            font-family: "Consolas", "Monaco", monospace;
            font-weight: 500;
            background: #fff5f7;
            padding: 1px 4px;
            border-radius: 2px;
        }
        
        .record-remark {
            background: #fff3cd;
            border-left: 3px solid #ffc107;
            padding: 8px 12px;
            margin: 8px 0;
            border-radius: 2px;
            font-size: 13px;
        }
        
        .empty-record .record-remark {
            background: #e2e3e5;
            border-left-color: #6c757d;
        }
        
        .error-record .record-remark {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        
        .remark-label {
            color: #856404;
            font-weight: 500;
        }
        
        .empty-record .remark-label {
            color: #6c757d;
        }
        
        .error-record .remark-label {
            color: #721c24;
        }
        
        .remark-content {
            color: #856404;
            line-height: 1.4;
        }
        
        .empty-record .remark-content {
            color: #6c757d;
        }
        
        .error-record .remark-content {
            color: #721c24;
        }
        
        .record-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #6c757d;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #f1f1f1;
        }
        
        .file-size, .file-code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .copy-buttons {
            display: flex;
            gap: 8px;
        }
        
        .copy-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .copy-btn:hover:not(:disabled) {
            background: #5a6268;
            transform: translateY(-1px);
        }
        
        .copy-btn:disabled {
            background: #adb5bd;
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        .copy-btn:active:not(:disabled) {
            transform: translateY(0);
        }
        
        /* 骨架屏样式 */
        .skeleton .skeleton-text {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            height: 12px;
            border-radius: 2px;
            display: inline-block;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;

    document.head.appendChild(style);
}

// ========== 使用示例 ==========

/**
 * 使用示例：
 * 
 * // 基本用法 - 动态传入目标div ID
 * loadAttachmentInfo({
 *     tableName: 'p_form_public_script_m',
 *     busType: 'public_script',
 *     Guid: mstform.getValues().u_script.replace(/@@\d+$/, ''),
 *     dbToken: '0001',
 *     creator: mstform.getValues().creator,
 *     creatorName: mstform.getValues().creator_EXName,
 *     targetDivId: 'u:1ede5f55593c_ctx'  // 动态传入目标div ID
 * });
 * 
 * // 完整参数用法
 * loadAttachmentInfo({
 *     tableName: 'p_form_public_script_m',
 *     busType: 'public_script',
 *     Guid: 'your-guid-here',
 *     dbToken: '0001',
 *     creator: 'user123',
 *     creatorName: '张三',
 *     targetDivId: 'any-dynamic-div-id',  // 可以传入任意div ID
 *     editor: 'current-editor',
 *     phid: 'form-phid-value'
 * });
 */
 
 
 
 
 
 //仓库附件相关逻辑
 /**
 * 政府风格样式管理器 - 保持原有逻辑不变
 */
function createGovernmentStyleManager(targetElementId) {
    
    // 获取目标元素
    function getTargetElement() {
        return document.getElementById(targetElementId);
    }

    // 政府风格样式配置 - 更现代化的设计
    const governmentStyle = {
        // 主色调 - 更加稳重的配色
        primaryColor: '#2563eb',
        secondaryColor: '#2563eb',
        accentColor: '#2563eb',
        backgroundColor: '#ffffff',
        cardBackground: '#f8fafc',
        borderColor: '#e5e7eb',
        textColor: '#1f2937',
        textLight: '#6b7280',

        // 字体
        fontFamily: '"Microsoft YaHei", "SimHei", "PingFang SC", sans-serif',
        fontSize: '14px',
        titleFontSize: '16px',

        // 边框和圆角
        borderWidth: '1px',

        // 阴影
        cardShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        buttonShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
        hoverShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',

        // 间距
        spacing: {
            small: '8px',
            medium: '12px',
            large: '16px',
            xlarge: '20px'
        }
    };

    // 应用政府风格样式
    function applyGovernmentStyle() {
        const targetElement = getTargetElement();
        if (!targetElement) {
            console.warn('未找到目标元素，等待DOM加载...');
            setTimeout(applyGovernmentStyle, 1);
            return;
        }

        // 添加自定义CSS样式
        addCustomCSS();

        // 应用主要样式
        applyMainStyles(targetElement);

        // 优化按钮布局
        optimizeButtonLayout(targetElement);

        // 美化表单元素
        beautifyFormElements(targetElement);

        // 添加装饰元素
        addDecorationElements(targetElement);

        console.log('政府风格样式应用完成');
    }

    // 添加自定义CSS样式 - 更彻底地覆盖原有样式
    function addCustomCSS() {
        const styleId = `government-style-${targetElementId}`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
    /* 全局重置 */
    #${targetElementId} * {
        box-sizing: border-box !important;
    }
    
    /* 主面板样式 */
    .udp-panel {
        background: ${governmentStyle.backgroundColor} !important;
        border: 1px solid ${governmentStyle.borderColor} !important;
        border-radius: ${governmentStyle.borderRadius} !important;
        box-shadow: ${governmentStyle.cardShadow} !important;
        overflow: hidden !important;
        font-family: ${governmentStyle.fontFamily} !important;
    }
    
    /* 标题栏样式 */
    .udp-panel-title {
        background: ${governmentStyle.primaryColor} !important;
        color: white !important;
        border-bottom: 3px solid ${governmentStyle.accentColor} !important;
        font-weight: 600 !important;
        font-size: ${governmentStyle.titleFontSize} !important;
        padding: ${governmentStyle.spacing.medium} ${governmentStyle.spacing.large} !important;
        position: relative !important;
    }
    
    /* 标题装饰条 */
    .udp-panel-title::before {
        content: '' !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        width: 4px !important;
        background: ${governmentStyle.secondaryColor} !important;
    }
    
    /* 按钮容器统一样式 */
    .ant-space, .ant-btn-group, [class*="button-container"] {
        display: flex !important;
        flex-direction: column !important;
        gap: ${governmentStyle.spacing.small} !important;
        width: 100% !important;
    }
    
    /* 主要按钮样式 */
    .ant-btn {
        border-radius: ${governmentStyle.borderRadius} !important;
        font-weight: 500 !important;
        transition: all 0.3s ease !important;
        text-align: center !important;
        width: 100% !important;
        margin-bottom: ${governmentStyle.spacing.small} !important;
        padding: 10px 16px !important;
        border: none !important;
        position: relative !important;
        overflow: hidden !important;
    }
    
    /* 默认按钮（上传按钮） */
    .ant-btn-default:not(.ant-btn-dangerous) {
        background: ${governmentStyle.primaryColor} !important;
        color: white !important;
        box-shadow: ${governmentStyle.buttonShadow} !important;
    }
    
    .ant-btn-default:not(.ant-btn-dangerous):hover {
        transform: translateY(-2px) !important;
        box-shadow: ${governmentStyle.hoverShadow} !important;
        background: #1d4ed8 !important;
    }
    
    /* 危险按钮（删除按钮） */
    .ant-btn-dangerous {
        background: ${governmentStyle.secondaryColor} !important;
        color: white !important;
    }
    
    .ant-btn-dangerous:hover {
        background: #b91c1c !important;
    }
    
    /* 附件按钮特殊样式 */
    .attachment-button {
        background: ${governmentStyle.accentColor} !important;
        color: white !important;
        font-weight: 600 !important;
    }
    
    .attachment-button:hover {
        background: #b45309 !important;
    }
    
    /* 附件项样式 */
    .attachment-flex-center {
        background: ${governmentStyle.cardBackground} !important;
        border: 1px solid ${governmentStyle.borderColor} !important;
        border-radius: ${governmentStyle.borderRadius} !important;
        padding: ${governmentStyle.spacing.medium} !important;
        margin-bottom: ${governmentStyle.spacing.small} !important;
        transition: all 0.3s ease !important;
        width: 22% !important;
    }
    
    .attachment-flex-center:hover {
        border-color: ${governmentStyle.primaryColor} !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }
    
    /* 表单项样式 */
    .ant-form-item {
        margin-bottom: ${governmentStyle.spacing.large} !important;
        padding-bottom: ${governmentStyle.spacing.medium} !important;
        border-bottom: 1px solid ${governmentStyle.borderColor} !important;
    }
    
    /* 隐藏不需要的按钮 */
    .ant-space-item:first-child .ant-btn:not(.attachment-button),
    .ant-space-item:last-child .ant-btn:not(.attachment-button) {
        display: none !important;
    }
    
    /* 确保下载按钮显示 */
    .attachment-space-btn .ant-space-item:nth-child(2) .ant-btn {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
    }
    
    /* 附件操作按钮容器宽度调整为50% */
    .attachment-space-btn {
        width: 50% !important;
    }
    
    /* 去掉附件按钮的悬停白色背景效果 */
    .attachment-space-btn .ant-btn.attachment-button:hover {
        background-color: ${governmentStyle.accentColor} !important;
    }
    
    /* 容器高度自适应 */
    [style*="max-height: 200px"] {
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
    }
    
    /* 图标美化 */
    .anticon {
        color: inherit !important;
    }
    
    /* 加载状态 */
    .government-loading {
        opacity: 0.7;
        pointer-events: none;
    }
`;

        document.head.appendChild(style);
    }

    // 应用主要样式
    function applyMainStyles(container) {
        // 确保容器可见
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';

        // 添加加载类（短暂显示加载状态）
        container.classList.add('government-loading');
        setTimeout(() => {
            container.classList.remove('government-loading');
        }, 1);
    }

    // 优化按钮布局
    function optimizeButtonLayout(container) {
        // 处理所有按钮容器
        const buttonContainers = container.querySelectorAll('.ant-space, .ant-btn-group');
        buttonContainers.forEach(container => {
            // 确保垂直布局
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = governmentStyle.spacing.small;
            container.style.width = '100%';

            // 处理容器内的按钮
            const buttons = container.querySelectorAll('.ant-btn');
            buttons.forEach(button => {
                button.style.width = '100%';
                button.style.margin = '0';
            });
        });

        // 特别处理附件操作按钮
        const attachmentActions = container.querySelectorAll('.attachment-space-btn');
        attachmentActions.forEach(action => {
            action.style.width = '50%'; // 修改为50%
            const buttons = action.querySelectorAll('.ant-btn');
            buttons.forEach((btn, index) => {
                // 只显示下载按钮，隐藏其他按钮
                if (index === 1) { // 下载按钮
                    btn.style.display = 'flex';
                } else {
                    btn.style.display = 'none';
                }
            });
        });
    }

    // 美化表单元素
    function beautifyFormElements(container) {
        // 处理所有表单标签
        const labels = container.querySelectorAll('.ant-form-item-label label');
        labels.forEach(label => {
            label.style.color = governmentStyle.textColor;
            label.style.fontWeight = '500';
            label.style.fontSize = governmentStyle.fontSize;
        });

        // 处理输入框等表单控件
        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.border = `1px solid ${governmentStyle.borderColor}`;
            input.style.borderRadius = governmentStyle.borderRadius;
            input.style.padding = '8px 12px';
            input.style.fontFamily = governmentStyle.fontFamily;

            input.addEventListener('focus', function () {
                this.style.borderColor = governmentStyle.primaryColor;
                this.style.boxShadow = `0 0 0 3px ${governmentStyle.primaryColor}20`;
            });

            input.addEventListener('blur', function () {
                this.style.borderColor = governmentStyle.borderColor;
                this.style.boxShadow = 'none';
            });
        });
    }

    // 添加装饰元素
    function addDecorationElements(container) {
        // 添加标题装饰
        const title = container.querySelector('.udp-panel-title');

        // 添加底部装饰线
        const panel = container.querySelector('.udp-panel');
        if (panel && !panel.querySelector('.government-footer-line')) {
            const footerLine = document.createElement('div');
            footerLine.className = 'government-footer-line';
            footerLine.style.height = '3px';
            footerLine.style.background = governmentStyle.primaryColor;
            footerLine.style.marginTop = 'auto';

            panel.appendChild(footerLine);
        }
    }

    // 监听DOM变化，动态应用样式
    function observeChanges() {
        const observer = new MutationObserver(function (mutations) {
            let shouldRefresh = false;

            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1 && (
                            node.classList.contains('ant-btn') ||
                            node.classList.contains('attachment-flex-center') ||
                            node.querySelector('.ant-space')
                        )) {
                            shouldRefresh = true;
                        }
                    });
                }
            });

            if (shouldRefresh) {
                setTimeout(applyGovernmentStyle, 1);
            }
        });

        const targetElement = getTargetElement();
        if (targetElement) {
            observer.observe(targetElement, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            });
        }
    }

    // 初始化函数
    function initGovernmentStyle() {
        console.log('初始化政府风格样式...');

        // 延迟执行以确保DOM完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                setTimeout(applyGovernmentStyle, 1);
                observeChanges();
            });
        } else {
            setTimeout(applyGovernmentStyle, 1);
            observeChanges();
        }
    }
	
	
	// 获取容器并隐藏所有子元素
const container = document.querySelector('.ant-space.css-drr901.ant-space-horizontal.ant-space-align-center');
if (container) {
    // 先隐藏所有子元素
    const items = container.querySelectorAll('.ant-space-item');
    items.forEach(item => item.style.display = 'none');

    // 只显示包含上传按钮的元素
    const uploadItem = container.querySelector('.ant-space-item:has(.ant-upload-wrapper), .ant-space-item:has(.anticon-upload)');
    if (uploadItem) {
        uploadItem.style.display = 'inline-block';
    }
}

    // 导出函数供使用
    return {
        init: initGovernmentStyle,
        refresh: applyGovernmentStyle,
        getConfig: () => governmentStyle
    };
}

// 使用示例：
// const styleManager = createGovernmentStyleManager('u:5c1da319343f_ctx');
// styleManager.init();

// 全局访问
window.createGovernmentStyleManager = createGovernmentStyleManager;

// 自动初始化（可选，保持原有行为）
// const defaultStyleManager = createGovernmentStyleManager('u:5c1da319343f_ctx');
// defaultStyleManager.init();

	
	
	//统计及明细导航组件
	   /**
     * 动态信息展示组件
     * 支持动态传递容器、汇总信息和流程配置
     */
        class DynamicInfoDisplay {
            /**
             * 构造函数
             * @param {Object} options - 配置选项
             * @param {HTMLElement|string} options.container - 容器元素或元素ID
             * @param {Array} [options.displayConfigs] - 汇总信息配置
             * @param {Array} [options.processConfigs] - 流程配置
             * @param {string} [options.activeProcessKey] - 当前激活的流程key
             */
            constructor(options) {
                // 获取容器元素
                if (typeof options.container === 'string') {
                    this.container = document.getElementById(options.container);
                } else {
                    this.container = options.container;
                }

                if (!this.container) {
                    console.error('未找到容器元素');
                    return;
                }

                // 存储配置
                this.displayConfigs = options.displayConfigs || [];
                this.processConfigs = options.processConfigs || [];
                this.activeProcessKey = options.activeProcessKey || '';

                // 初始化
                this.init();
            }

            /**
             * 初始化组件
             */
            init() {
                // 清空容器
                this.container.innerHTML = '';

                // 添加样式
                this.addStyles();

                // 创建内容容器
                this.contentContainer = document.createElement('div');
                this.contentContainer.className = 'dynamic-info-container';
                this.container.appendChild(this.contentContainer);

                // 渲染内容
                this.render();

                // 同步流程状态
                setTimeout(() => this.syncProcessWithTabs(), 100);
            }

            /**
             * 渲染组件内容
             */
            render() {
                // 渲染汇总信息
                if (this.displayConfigs && this.displayConfigs.length > 0) {
                    this.renderDisplayItems();
                }

                // 渲染流程信息
                if (this.processConfigs && this.processConfigs.length > 0) {
                    this.renderProcessFlow();
                }
            }

            /**
             * 渲染汇总信息
             */
            renderDisplayItems() {
                // 创建显示项容器
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'display-items-container';

                // 创建显示项
                this.displayConfigs.forEach(config => {
                    const item = this.createDisplayItem(config);
                    itemsContainer.appendChild(item);
                });

                this.contentContainer.appendChild(itemsContainer);
            }

            /**
             * 创建单个显示项
             * @param {Object} config - 配置对象
             * @returns {HTMLElement} 显示项元素
             */
            createDisplayItem(config) {
                const item = document.createElement('div');
                item.className = 'display-item';

                const nameElem = document.createElement('div');
                nameElem.className = 'item-name';
                nameElem.textContent = config.name;

                const valueElem = document.createElement('div');
                valueElem.className = 'item-value';
                valueElem.textContent = config.value;

                item.appendChild(nameElem);
                item.appendChild(valueElem);

                return item;
            }

            /**
             * 渲染流程信息
             */
            renderProcessFlow() {
                // 创建流程容器
                const processContainer = document.createElement('div');
                processContainer.className = 'process-flow-container';

                // 创建流程项
                this.processConfigs.forEach((config, index) => {
                    // 创建流程项
                    const processItem = this.createProcessItem(config);
                    processContainer.appendChild(processItem);

                    // 如果不是最后一个流程项，添加连接线
                    if (index < this.processConfigs.length - 1) {
                        const connector = this.createProcessConnector();
                        processContainer.appendChild(connector);
                    }
                });

                this.contentContainer.appendChild(processContainer);
            }

            /**
             * 创建单个流程项
             * @param {Object} config - 流程配置
             * @returns {HTMLElement} 流程项元素
             */
            createProcessItem(config) {
                const processItem = document.createElement('div');
                processItem.className = 'process-item';
                processItem.dataset.processKey = config.key;

                if (config.key === this.activeProcessKey) {
                    processItem.classList.add('process-item-active');
                }

                // 创建流程节点
                const node = document.createElement('div');
                node.className = 'process-node';

                // 根据数量添加不同的样式类
                if (config.num === 0) {
                    node.classList.add('process-node-zero');
                } else {
                    node.classList.add('process-node-has-data');
                }

                // 创建节点数量显示
                const nodeNum = document.createElement('div');
                nodeNum.className = 'process-node-num';
                nodeNum.textContent = config.num || '0';

                // 创建流程名称
                const name = document.createElement('div');
                name.className = 'process-name';
                name.textContent = config.name;

                node.appendChild(nodeNum);
                processItem.appendChild(node);
                processItem.appendChild(name);

                // 绑定点击事件
                processItem.addEventListener('click', () => {
                    console.log('点击流程项:', config.key);

                    // 触发对应的tab元素点击事件
                    const targetTab = document.querySelector(`[data-node-key="${config.key}"]`);
                    if (targetTab) {
                        const clickEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });
                        targetTab.dispatchEvent(clickEvent);

                        // 更新激活状态
                        this.updateActiveProcessKey(config.key);
                    } else {
                        console.error(`未找到data-node-key为"${config.key}"的元素`);
                    }
                });

                return processItem;
            }

            /**
             * 创建流程连接线
             * @returns {HTMLElement} 连接线元素
             */
            createProcessConnector() {
                const connector = document.createElement('div');
                connector.className = 'process-connector';

                const line = document.createElement('div');
                line.className = 'process-line';

                const arrow = document.createElement('div');
                arrow.className = 'process-arrow';

                connector.appendChild(line);
                connector.appendChild(arrow);

                return connector;
            }

            /**
             * 更新激活的流程项
             * @param {string} activeKey - 激活的流程key
             */
            updateActiveProcessKey(activeKey) {
                this.activeProcessKey = activeKey;

                const processItems = this.container.querySelectorAll('.process-item');
                processItems.forEach(item => {
                    item.classList.remove('process-item-active');
                    if (item.dataset.processKey === activeKey) {
                        item.classList.add('process-item-active');
                    }
                });
            }

            /**
             * 更新汇总信息配置
             * @param {Array} displayConfigs - 新的汇总信息配置
             */
            updateDisplayConfigs(displayConfigs) {
                this.displayConfigs = displayConfigs || [];

                // 移除现有的汇总信息
                const existingDisplay = this.container.querySelector('.display-items-container');
                if (existingDisplay) {
                    existingDisplay.remove();
                }

                // 重新渲染汇总信息
                if (this.displayConfigs.length > 0) {
                    this.renderDisplayItems();
                }
            }

            /**
             * 更新流程配置
             * @param {Array} processConfigs - 新的流程配置
             * @param {string} [activeKey] - 激活的流程key
             */
            updateProcessConfigs(processConfigs, activeKey) {
                this.processConfigs = processConfigs || [];
                if (activeKey !== undefined) {
                    this.activeProcessKey = activeKey;
                }

                // 移除现有的流程信息
                const existingProcess = this.container.querySelector('.process-flow-container');
                if (existingProcess) {
                    existingProcess.remove();
                }

                // 重新渲染流程信息
                if (this.processConfigs.length > 0) {
                    this.renderProcessFlow();
                }
            }

            /**
             * 同步流程与tab的点击事件
             */
            syncProcessWithTabs() {
                const tabElements = document.querySelectorAll('[data-node-key]');

                tabElements.forEach(tab => {
                    // 移除可能存在的重复监听器
                    tab.removeEventListener('click', this.handleTabClick);
                    // 添加新的监听器
                    tab.addEventListener('click', this.handleTabClick);
                });
            }

            /**
             * tab点击事件处理函数
             */
            handleTabClick() {
                const key = this.getAttribute('data-node-key');
                console.log('Tab点击:', key);

                // 找到所有DynamicInfoDisplay实例并更新激活状态
                document.querySelectorAll('.dynamic-info-container').forEach(container => {
                    const processItems = container.querySelectorAll('.process-item');
                    processItems.forEach(item => {
                        item.classList.remove('process-item-active');
                        if (item.dataset.processKey === key) {
                            item.classList.add('process-item-active');
                        }
                    });
                });
            }

            /**
             * 添加样式
             */
            addStyles() {
                // 检查是否已经添加过样式
                if (document.querySelector('#dynamic-info-display-styles')) return;

                const style = document.createElement('style');
                style.id = 'dynamic-info-display-styles';
                style.textContent = `
            .dynamic-info-container {
                width: 100%;
            }
            
            .display-items-container {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
                padding: 20px;
                background: #ffffff;
                min-height: 90px;
                box-sizing: border-box;
            }
            
            .display-item {
                width: 84px;
                height: 84px;
                border: 2px solid #1a5fb4;
                border-radius: 8px;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 10px;
                box-sizing: border-box;
                box-shadow: 0 2px 4px rgba(26, 95, 180, 0.1);
                transition: all 0.3s ease;
            }
            
            .display-item:hover {
                box-shadow: 0 4px 8px rgba(26, 95, 180, 0.2);
                transform: translateY(-2px);
            }
            
            .item-name {
                font-size: 12px;
                color: #1a5fb4;
                font-weight: 600;
                text-align: center;
                margin-bottom: 6px;
                line-height: 1.2;
            }
            
            .item-value {
                font-size: 16px;
                color: #1c3b6b;
                font-weight: 700;
                text-align: center;
                line-height: 1.2;
            }
            
            .process-flow-container {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                padding: 20px;
                background: #ffffff;
                margin: 16px 0 0;
                border: 1px solid #e8e8e8;
            }
            
            .process-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                padding: 12px 16px;
                border-radius: 6px;
                transition: all 0.3s ease;
                min-width: 100px;
            }
            
            .process-item:hover {
                background: #f0f7ff;
                transform: translateY(-2px);
            }
            
            .process-item-active {
                background: #e6f7ff;
                border: 1px solid #1890ff;
            }
            
            .process-item-active .process-node {
                border-color: #1890ff;
            }
            
            .process-item-active .process-node-has-data {
                background: #1890ff;
                border-color: #1890ff;
            }
            
            .process-item-active .process-node-zero {
                background: #f0f0f0;
                border-color: #1890ff;
            }
            
            .process-item-active .process-node-num {
                color: #ffffff;
            }
            
            .process-item-active .process-node-zero .process-node-num {
                color: #1890ff;
            }
            
            .process-node {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 8px;
                transition: all 0.3s ease;
                border: 2px solid;
            }
            
            .process-node-has-data {
                background: #1a5fb4;
                border-color: #1a5fb4;
            }
            
            .process-node-zero {
                background: #ffffff;
                border-color: #d9d9d9;
            }
            
            .process-node-num {
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .process-node-has-data .process-node-num {
                color: #ffffff;
            }
            
            .process-node-zero .process-node-num {
                color: #999999;
            }
            
            .process-name {
                font-size: 14px;
                color: #1c3b6b;
                text-align: center;
                line-height: 1.4;
                font-weight: 500;
            }
            
            .process-connector {
                display: flex;
                align-items: center;
                margin: 0 8px;
            }
            
            .process-line {
                width: 40px;
                height: 2px;
                background: #d9d9d9;
                position: relative;
            }
            
            .process-arrow {
                width: 0;
                height: 0;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
                border-left: 8px solid #d9d9d9;
                margin-left: -2px;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .display-items-container {
                    gap: 12px;
                    padding: 16px;
                }
                
                .display-item {
                    width: 60px;
                    height: 60px;
                    padding: 8px;
                }
                
                .item-name {
                    font-size: 10px;
                    margin-bottom: 4px;
                }
                
                .item-value {
                    font-size: 14px;
                }
                
                .process-flow-container {
                    padding: 16px 12px;
                }
                
                .process-item {
                    min-width: 80px;
                    padding: 8px 12px;
                }
                
                .process-node {
                    width: 32px;
                    height: 32px;
                }
                
                .process-node-num {
                    font-size: 14px;
                }
                
                .process-name {
                    font-size: 12px;
                }
                
                .process-line {
                    width: 20px;
                }
            }
            
            /* 小屏幕时垂直排列 */
            @media (max-width: 480px) {
                .process-flow-container {
                    flex-direction: column;
                }
                
                .process-connector {
                    margin: 8px 0;
                    transform: rotate(90deg);
                }
                
                .process-line {
                    width: 30px;
                }
            }
        `;

                document.head.appendChild(style);
            }
        }


//文字字符限制组件
function addCharacterCounters(configs) {
    // 验证参数
    if (!Array.isArray(configs)) {
        console.error('参数必须是一个配置数组');
        return;
    }

    // 为每个配置项初始化计数器
    configs.forEach(config => {
        const { selector, limit } = config;
        
        if (!selector || typeof limit !== 'number' || limit <= 0) {
            console.error('无效的配置项:', config);
            return;
        }

        // 获取目标元素（支持多个相同选择器的元素）
        const elements = document.querySelectorAll(selector);
        
        if (elements.length === 0) {
            console.warn(`未找到选择器为 "${selector}" 的元素`);
            return;
        }

        // 为每个匹配的元素初始化计数器
        elements.forEach(element => {
            initCharacterCounter(element, limit);
        });
    });
}

function initCharacterCounter(element, limit) {
    // 自定义 includes 方法
    function arrayIncludes(array, value) {
        if (!array || !Array.isArray(array)) return false;
        
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }

    // 创建计数器显示元素
    const counter = document.createElement('div');
    counter.style.cssText = `
        position: absolute;
        bottom: -20px;
        right: 0;
        font-size: 12px;
        color: #666;
        background: transparent;
        padding: 2px 6px;
        pointer-events: none;
        z-index: 10;
    `;

    // 设置元素父元素为相对定位
    const parent = element.parentElement;
    if (parent && window.getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }

    // 添加计数器到页面
    parent.appendChild(counter);

    // 强制截断函数
    function truncateText() {
        if (element.value.length > limit) {
            element.value = element.value.substring(0, limit);
            // 触发input事件更新计数器
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // 更新计数器显示
    function updateCounter() {
        const currentLength = element.value.length;
        counter.textContent = `${currentLength}/${limit}`;

        // 根据字符数改变样式
        if (currentLength >= limit) {
            counter.style.color = '#ff4d4f';
            element.style.borderColor = '#ff4d4f';
        } else if (currentLength >= limit * 0.9) {
            counter.style.color = '#faad14';
            element.style.borderColor = '';
        } else {
            counter.style.color = '#666';
            element.style.borderColor = '';
        }
    }

    // 监听输入事件
    element.addEventListener('input', function (e) {
        const currentLength = element.value.length;

        // 如果输入后超过限制，立即截断
        if (currentLength > limit) {
            truncateText();
        }

        updateCounter();
    });

    // 监听键盘事件，严格阻止在达到限制时输入更多字符
    element.addEventListener('keydown', function (e) {
        const currentLength = element.value.length;
        const selectionLength = element.selectionEnd - element.selectionStart;

        // 允许的功能键
        const allowedKeys = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
            'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End',
            'Control', 'Alt', 'Meta', 'Shift', 'Escape'
        ];

        // 使用自定义的 arrayIncludes 方法
        const key = e.key;
        const isAllowedKey = key ? arrayIncludes(allowedKeys, key) : false;
        const isSingleCharInput = key && key.length === 1;

        // 如果已达到限制，且不是删除操作或功能键
        if (currentLength >= limit &&
            !isAllowedKey &&
            !(e.ctrlKey || e.metaKey) && // 允许Ctrl+A等组合键
            selectionLength === 0) { // 如果没有选中文本（选中文本时替换操作可以继续）
            e.preventDefault();
        }

        // 如果选中文本后输入，检查替换后的长度是否会超过限制
        if (selectionLength > 0 && currentLength - selectionLength >= limit) {
            if (!isAllowedKey &&
                !(e.ctrlKey || e.metaKey) &&
                isSingleCharInput) { // 单字符输入
                e.preventDefault();
            }
        }
    });

    // 监听粘贴事件，严格限制粘贴内容
    element.addEventListener('paste', function (e) {
        const currentLength = element.value.length;
        const selectionLength = element.selectionEnd - element.selectionStart;
        const clipboardData = e.clipboardData || window.clipboardData;
        
        // 检查 clipboardData 是否存在
        if (!clipboardData) {
            e.preventDefault();
            return;
        }
        
        const pastedText = clipboardData.getData('text');

        // 计算粘贴后的新长度
        const newLength = currentLength - selectionLength + pastedText.length;

        // 如果粘贴后超过限制
        if (newLength > limit) {
            e.preventDefault();

            // 计算可以粘贴的字符数
            const allowedChars = limit - (currentLength - selectionLength);
            if (allowedChars > 0) {
                // 只粘贴允许的字符数
                const textToPaste = pastedText.substring(0, allowedChars);

                // 获取当前光标位置
                const start = element.selectionStart;
                const end = element.selectionEnd;

                // 替换选中文本
                element.value = element.value.substring(0, start) +
                    textToPaste +
                    element.value.substring(end);

                // 设置光标位置
                element.selectionStart = element.selectionEnd = start + textToPaste.length;

                // 触发input事件更新计数器
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    });

    // 监听变化事件，作为额外保障
    element.addEventListener('change', function () {
        truncateText();
        updateCounter();
    });

    // 初始截断和更新
    truncateText();
    updateCounter();
}
window.addCharacterCounters = addCharacterCounters;


//水平平铺按钮组
/**
    * 创建水平平铺按钮组组件
    * @param {string} containerSelector - 容器选择器
    * @param {Array} buttonConfigs - 按钮配置数组
    * @param {Object} options - 可选配置
    */
    function createHorizontalButtonGroup(containerSelector, buttonConfigs, options = {}) {
        // 获取目标容器
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.warn(`未找到容器元素: ${containerSelector}`);
            return;
        }

        // 默认配置
        const defaultOptions = {
            buttonColor: '#007bff',
            buttonHoverColor: '#0056b3',
            buttonMargin: '5px',
            insertPosition: 'afterSecond', // afterSecond, afterLast, beforeThirdLast
            ...options
        };

        // 创建按钮组容器
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'horizontal-button-group';
        buttonGroup.style.display = 'flex';
        buttonGroup.style.flexWrap = 'wrap';
        buttonGroup.style.gap = defaultOptions.buttonMargin;
        buttonGroup.style.alignItems = 'center'; // 添加垂直居中
        buttonGroup.style.marginTop = '5px';
        buttonGroup.style.marginBottom = '5px';
        buttonGroup.style.marginLeft = '5px';

        // 创建按钮
        buttonConfigs.forEach(config => {
            const button = createHorizontalButton(config, defaultOptions);
            buttonGroup.appendChild(button);
        });

        // 获取容器中的所有直接子元素
        const children = Array.from(container.children);

        // 根据插入位置选项确定插入点
        let insertPoint;
        switch (defaultOptions.insertPosition) {
            case 'afterSecond':
                // 插入到第二个元素后边
                insertPoint = children.length >= 2 ? children[1] : null;
                if (insertPoint) {
                    insertPoint.insertAdjacentElement('afterend', buttonGroup);
                } else {
                    // 如果没有足够的子元素，则添加到容器末尾
                    container.appendChild(buttonGroup);
                }
                break;

            case 'afterLast':
                // 插入到最后一个元素后边
                insertPoint = children.length > 0 ? children[children.length - 1] : null;
                if (insertPoint) {
                    insertPoint.insertAdjacentElement('afterend', buttonGroup);
                } else {
                    // 如果没有子元素，则添加到容器末尾
                    container.appendChild(buttonGroup);
                }
                break;

            case 'beforeThirdLast':
                // 插入到倒数第三个元素前边
                if (children.length >= 3) {
                    insertPoint = children[children.length - 3];
                    insertPoint.insertAdjacentElement('beforebegin', buttonGroup);
                } else {
                    // 如果没有足够的子元素，则添加到容器开头
                    container.insertBefore(buttonGroup, container.firstChild);
                }
                break;

            default:
                // 默认添加到容器末尾
                container.appendChild(buttonGroup);
        }

        return {
            buttonGroup,
            buttons: buttonGroup.querySelectorAll('button')
        };
    }

    /**
     * 创建水平按钮组中的单个按钮
     */
    function createHorizontalButton(config, options) {
        const button = document.createElement('button');
        button.textContent = config.text;
        button.dataset.id = config.id;

        // 设置样式
        button.style.padding = '8px 16px';
        button.style.backgroundColor = options.buttonColor;
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.transition = 'all 0.2s ease';
        button.style.whiteSpace = 'nowrap';
        button.style.display = 'flex';
        button.style.alignItems = 'center'; // 确保按钮内文本垂直居中
        button.style.justifyContent = 'center'; // 确保按钮内文本水平居中

        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = options.buttonHoverColor;
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = options.buttonColor;
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });

        // 添加点击事件
        button.addEventListener('click', (e) => {
            e.stopPropagation();

            // 添加点击反馈
            button.style.transform = 'scale(0.98)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);

            if (config.onClick && typeof config.onClick === 'function') {
                config.onClick();
            }
        });

        return button;
    }
	
	//默认参数
	// 配置数据
    const initButtonConfigs = [
        {
            text: '战略性新兴产业和未来产业投资明细表',
            id: 'strategic',
            onClick: () => openReport({
                url: "https://ynnterp-mproject.cnyeig.com/report/index.html?v=1759131182925#/tableDesign/TableManager/preview?AppTitle=%E6%8A%A5%E8%A1%A8%E9%A2%84%E8%A7%88&defaultSheet=0&name=%E6%88%98%E7%95%A5%E6%80%A7%E6%96%B0%E5%85%B4%E4%BA%A7%E4%B8%9A%E5%92%8C%E6%9C%AA%E6%9D%A5%E4%BA%A7%E4%B8%9A%E6%8A%95%E8%B5%84%E6%98%8E%E7%BB%86%E8%A1%A8",
                title: '战略性新兴产业和未来产业投资明细表',
                preview: 1,
                rep_id: 3100000000000009,
                defaultSheet: 0
            })
        },
        {
            text: '投资项目明细表(续投)',
            id: 'continue',
            onClick: () => openReport({
                url: "https://ynnterp-mproject.cnyeig.com/report/index.html?v=1759131182925#/tableDesign/TableManager/preview?AppTitle=%E6%8A%A5%E8%A1%A8%E9%A2%84%E8%A7%88&defaultSheet=0&name=%E6%88%98%E7%95%A5%E6%80%A7%E6%96%B0%E5%85%B4%E4%BA%A7%E4%B8%9A%E5%92%8C%E6%9C%AA%E6%9D%A5%E4%BA%A7%E4%B8%9A%E6%8A%95%E8%B5%84%E6%98%8E%E7%BB%86%E8%A1%A8",
                title: '投资项目明细表（续投）',
                preview: 1,
                rep_id: 3100000000000008,
                defaultSheet: 0
            })
        },
        {
            text: '投资项目明细表(新投)',
            id: 'new',
            onClick: () => openReport({
                url: "https://ynnterp-mproject.cnyeig.com/report/index.html?v=1759131182925#/tableDesign/TableManager/preview?AppTitle=%E6%8A%A5%E8%A1%A8%E9%A2%84%E8%A7%88&defaultSheet=0&name=%E6%88%98%E7%95%A5%E6%80%A7%E6%96%B0%E5%85%B4%E4%BA%A7%E4%B8%9A%E5%92%8C%E6%9C%AA%E6%9D%A5%E4%BA%A7%E4%B8%9A%E6%8A%95%E8%B5%84%E6%98%8E%E7%BB%86%E8%A1%A8",
                title: '投资项目明细表（新投）',
                preview: 1,
                rep_id: 3100000000000007,
                defaultSheet: 0
            })
        },
        {
            text: '投资项目明细表(前期)',
            id: 'preliminary',
            onClick: () => openReport({
                url: "https://ynnterp-mproject.cnyeig.com/report/index.html?v=1759131182925#/tableDesign/TableManager/preview?AppTitle=%E6%8A%A5%E8%A1%A8%E9%A2%84%E8%A7%88&defaultSheet=0&name=%E6%88%98%E7%95%A5%E6%80%A7%E6%96%B0%E5%85%B4%E4%BA%A7%E4%B8%9A%E5%92%8C%E6%9C%AA%E6%9D%A5%E4%BA%A7%E4%B8%9A%E6%8A%95%E8%B5%84%E6%98%8E%E7%BB%86%E8%A1%A8",
                title: '投资项目明细表（前期）',
                preview: 1,
                rep_id: 3100000000000005,
                defaultSheet: 0
            })
        }
    ];
	
	// 选项1：默认插入到第二个元素后边
    // createHorizontalButtonGroup('#_r1m_.udp-panel-title', buttonConfigs, {
    //     buttonColor: '#007bff',
    //     buttonHoverColor: '#0056b3',
    //     buttonMargin: '8px',
    //     insertPosition: 'afterSecond' // 默认值，可省略
    // });

    // 选项2：插入到最后一个元素后边
    // createHorizontalButtonGroup('#_r1m_.udp-panel-title', buttonConfigs, {
    //     buttonColor: '#28a745',
    //     buttonHoverColor: '#218838',
    //     buttonMargin: '8px',
    //     insertPosition: 'afterLast'
    // });

    // 选项3：插入到倒数第三个元素前边
    // createHorizontalButtonGroup('#_r1m_.udp-panel-title', buttonConfigs, {
    //     buttonColor: '#dc3545',
    //     buttonHoverColor: '#c82333',
    //     buttonMargin: '8px',
    //     insertPosition: 'beforeThirdLast'
    // });
	
	
	
	//列表页面统计面板组件
	function initSummaryPanel(config) {
        // 参数验证和默认值
        const {
            serverMethod = 'selectAllInfoProject',
            userIdField = 'userId',
            types = ['GT', 'GQ', 'JR', 'QT'],
            containerSelector = '.layout-flex-column.udp-layout',
            queryCtxSelector = '.query-ctx',
            initialCode = '000001',
            options = {
                collapsible: true,
                defaultCollapsed: false,
                itemWidth: '160px',
                itemHeight: '60px',
                gap: '12px'
            }
        } = config;

        let CCode = initialCode;
        let currentConfig = null;

        // 获取目标容器
        const layoutContainer = document.querySelector(containerSelector);
        if (!layoutContainer) {
            console.error(`未找到选择器为"${containerSelector}"的元素`);
            return;
        }

        // 获取查询面板元素
        const queryCtx = layoutContainer.querySelector(queryCtxSelector);
        if (!queryCtx) {
            console.error(`未找到选择器为"${queryCtxSelector}"的元素`);
            return;
        }

        // 获取查询面板后面的下一个兄弟元素（表格面板）
        const tablePanel = queryCtx.nextElementSibling;
        if (!tablePanel) {
            console.error('未找到查询面板后面的表格面板元素');
            return;
        }

        // 创建汇总信息div
        const summaryDiv = document.createElement('div');
        summaryDiv.id = 'summary-panel';
        summaryDiv.style.height = 'auto';
        summaryDiv.style.minHeight = '120px';
        summaryDiv.style.marginTop = '3px';
        summaryDiv.style.marginBottom = '3px';

        // 在查询面板和表格面板之间插入汇总div
        queryCtx.parentNode.insertBefore(summaryDiv, tablePanel);

        /**
         * 从服务器获取所有类型的数据并更新汇总面板
         * @param {string} code - 组织编码
         */
        function fetchAllDataAndUpdateSummary(code) {
            console.log('开始获取所有类型数据，编码:', code);

            const promises = [];
            const results = {};

            // 初始化结果对象
            types.forEach(type => {
                results[type] = { price: 0, count: 0 };
            });

            // 为每个类型创建请求
            types.forEach(type => {
                const promise = new Promise((resolve, reject) => {
                    // 动态构建请求参数
                    const requestParams = {
                        'oCode': code,
                        [userIdField]: $NG.getUser().userID,
                        'Ptype': type
                    };

                    $NG.execServer(serverMethod, requestParams, res => {
                        console.log(`类型 ${type} 返回数据:`, res);

                        if (res.count == 0) {
                            console.log(`类型 ${type} 未查询到数据`);
                            resolve({ type, data: null });
                            return;
                        }

                        try {
                            const data = JSON.parse(res.data);
                            if (data.length == 0) {
                                console.log(`类型 ${type} 数据为空`);
                                resolve({ type, data: null });
                                return;
                            }

                            const { extendObjects } = data[0];
                            console.log(`类型 ${type} 扩展对象数据:`, extendObjects);

                            let parsedData = { price: 0, count: 0 };

                            if (extendObjects) {
                                if (typeof extendObjects === 'string') {
                                    const lines = extendObjects.trim().split('\n');
                                    for (let line of lines) {
                                        const parts = line.trim().split('\t');
                                        if (parts.length >= 3) {
                                            const priceStr = parts[1];
                                            const countStr = parts[2];

                                            const cleanpriceStr = priceStr.replace(/[,，]/g, '');
                                            parsedData.price = parseFloat(cleanpriceStr) || 0;
                                            parsedData.count = parseInt(countStr) || 0;
                                            break;
                                        }
                                    }
                                } else if (typeof extendObjects === 'object') {
                                    parsedData.price = extendObjects.price || extendObjects.money || extendObjects.price || extendObjects.MONEY ||
                                        extendObjects.je || extendObjects.JE || extendObjects.AMT || extendObjects.amt || 0;
                                    parsedData.count = extendObjects.count || extendObjects.num || extendObjects.COUNT || extendObjects.NUM ||
                                        extendObjects.sl || extendObjects.SL || extendObjects.QTY || extendObjects.qty || 0;
                                }
                            }

                            console.log(`类型 ${type} 解析后数据:`, parsedData);
                            resolve({ type, data: parsedData });

                        } catch (error) {
                            console.error(`解析类型 ${type} 数据时出错:`, error);
                            resolve({ type, data: null });
                        }
                    });
                });
                promises.push(promise);
            });

            // 等待所有请求完成
            Promise.all(promises).then(allResults => {
                console.log('所有请求完成:', allResults);

                // 处理每个类型的数据
                allResults.forEach(result => {
                    if (result.data) {
                        results[result.type] = result.data;
                    }
                });

                console.log('处理后的结果:', results);
                processDataAndUpdateSummary(results);
            }).catch(error => {
                console.error('请求数据时出错:', error);
                updateSummaryWithError('数据加载失败');
            });
        }

        /**
         * 处理所有类型的数据并更新汇总面板
         * @param {Object} allData - 所有类型的数据
         */
        function processDataAndUpdateSummary(allData) {
            console.log('处理所有数据:', allData);

            let totalCount = 0;
            let totalprice = 0;

            Object.values(allData).forEach(item => {
                totalCount += item.count || 0;
                totalprice += item.price || 0;
            });

            console.log(`总计 - 数量: ${totalCount}, 金额: ${totalprice}`);

            // 转换为万元显示
            const totalpriceInTenThousand = (totalprice / 10000).toFixed(2);

            // 动态生成金额数据
            const priceData = {};
            types.forEach(type => {
                priceData[`${type}price`] = ((allData[type].price || 0) / 10000).toFixed(2);
            });

            console.log('金额计算结果:', { totalpriceInTenThousand, ...priceData });

            // 动态创建数量统计配置
            const countItems = [
                { name: '项目总数', value: formatNumber(totalCount) }
            ];

            types.forEach(type => {
                const typeNames = {
                    'GT': '固投项目数',
                    'GQ': '股权项目数',
                    'JR': '金融项目数',
                    'QT': '其他项目数'
                };
                countItems.push({
                    name: typeNames[type] || `${type}项目数`,
                    value: formatNumber(allData[type].count || 0)
                });
            });

            // 动态创建金额统计配置
            const priceItems = [
                { name: '项目总金额', value: formatprice(totalpriceInTenThousand) }
            ];

            types.forEach(type => {
                const typeNames = {
                    'GT': '固投项目金额',
                    'GQ': '股权项目金额',
                    'JR': '金融项目金额',
                    'QT': '其他项目金额'
                };
                priceItems.push({
                    name: typeNames[type] || `${type}项目金额`,
                    value: formatprice(priceData[`${type}price`])
                });
            });

            const dynamicConfig = [
                {
                    title: '项目数量统计（个）',
                    items: countItems
                },
                {
                    title: '项目金额统计（万元）',
                    items: priceItems
                }
            ];

            updateSummaryWithConfig(dynamicConfig);
        }

        /**
         * 格式化数字（添加千位分隔符）
         */
        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        /**
         * 格式化金额（添加千位分隔符，保留2位小数）
         */
        function formatprice(price) {
            const num = parseFloat(price);
            if (isNaN(num)) return '0.00';
            return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        /**
         * 使用配置更新汇总面板
         */
        function updateSummaryWithConfig(config) {
            currentConfig = config;
            createSummaryPanel(config, summaryDiv, options);
        }

        /**
         * 显示错误信息
         */
        function updateSummaryWithError(message) {
            const errorConfig = [
                {
                    title: '数据加载状态',
                    items: [
                        { name: '状态', value: message },
                        { name: '请检查', value: '网络连接' },
                        { name: '或联系', value: '技术支持' }
                    ]
                }
            ];
            updateSummaryWithConfig(errorConfig);
        }

        /**
         * 创建显示面板
         */
        function createSummaryPanel(rowsConfig, container, options = {}) {
            if (!container) return;

            const defaultOptions = {
                collapsible: true,
                defaultCollapsed: false,
                itemWidth: '160px',
                itemHeight: '60px',
                gap: '12px'
            };

            const settings = { ...defaultOptions, ...options };
            container.innerHTML = '';
            addStyles(settings);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'summary-items-container';

            rowsConfig.forEach((rowConfig, index) => {
                const row = createDisplayRow(rowConfig, index, settings);
                itemsContainer.appendChild(row);
            });

            container.appendChild(itemsContainer);
        }

        /**
         * 创建单行显示项
         */
        function createDisplayRow(rowConfig, index, settings) {
            const row = document.createElement('div');
            row.className = 'summary-row';
            row.dataset.rowIndex = index;

            const header = document.createElement('div');
            header.className = 'row-header';

            const titleElem = document.createElement('div');
            titleElem.className = 'row-title';
            titleElem.textContent = rowConfig.title;
            header.appendChild(titleElem);

            if (settings.collapsible) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'collapse-toggle';
                toggleBtn.innerHTML = settings.defaultCollapsed ? '▶' : '▼';
                toggleBtn.title = settings.defaultCollapsed ? '展开' : '折叠';

                toggleBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    toggleRowCollapse(row, toggleBtn);
                });

                header.appendChild(toggleBtn);
                titleElem.style.cursor = 'pointer';
                titleElem.addEventListener('click', function () {
                    toggleRowCollapse(row, toggleBtn);
                });
            }

            row.appendChild(header);

            const itemsWrapper = document.createElement('div');
            itemsWrapper.className = 'row-items-wrapper';

            if (settings.defaultCollapsed) {
                itemsWrapper.style.display = 'none';
                row.classList.add('collapsed');
            }

            rowConfig.items.forEach(itemConfig => {
                const item = createDisplayItem(itemConfig, settings);
                itemsWrapper.appendChild(item);
            });

            row.appendChild(itemsWrapper);
            return row;
        }

        /**
         * 切换行折叠状态
         */
        function toggleRowCollapse(row, toggleBtn) {
            const itemsWrapper = row.querySelector('.row-items-wrapper');
            const isCollapsed = itemsWrapper.style.display === 'none';

            if (isCollapsed) {
                itemsWrapper.style.display = 'flex';
                toggleBtn.innerHTML = '▼';
                toggleBtn.title = '折叠';
                row.classList.remove('collapsed');
            } else {
                itemsWrapper.style.display = 'none';
                toggleBtn.innerHTML = '▶';
                toggleBtn.title = '展开';
                row.classList.add('collapsed');
            }
        }

        /**
         * 创建单个显示项
         */
        function createDisplayItem(config, settings) {
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.style.width = settings.itemWidth;
            item.style.height = settings.itemHeight;

            const nameElem = document.createElement('div');
            nameElem.className = 'item-name';
            nameElem.textContent = config.name;

            const valueElem = document.createElement('div');
            valueElem.className = 'item-value';
            valueElem.textContent = config.value;

            if (config.onClick) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', config.onClick);
            }

            item.appendChild(nameElem);
            item.appendChild(valueElem);
            return item;
        }

        /**
         * 添加样式
         */
        function addStyles(settings) {
            if (document.getElementById('summary-panel-styles')) return;

            const style = document.createElement('style');
            style.id = 'summary-panel-styles';
            style.textContent = `
            .summary-items-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
                background: #ffffff;
                min-height: 120px;
                box-sizing: border-box;
                margin: 16px 15px 0;
                border: 1px solid #e1e5e9;
            }
            
            .summary-row {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .row-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 8px;
                background: #f8f9fa;
                border-radius: 4px;
                border-left: 3px solid #1a5fb4;
            }
            
            .row-title {
                font-size: 14px;
                font-weight: 600;
                color: #1a5fb4;
            }
            
            .collapse-toggle {
                background: none;
                border: none;
                font-size: 12px;
                color: #666;
                cursor: pointer;
                padding: 2px 6px;
                border-radius: 3px;
                transition: background-color 0.2s;
            }
            
            .collapse-toggle:hover {
                background-color: #e9ecef;
            }
            
            .row-items-wrapper {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex-wrap: wrap;
                gap: ${settings.gap};
                padding: 8px;
                transition: all 0.3s ease;
            }
            
            .summary-item {
                border: 1px solid #1a5fb4;
                border-radius: 6px;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 8px;
                box-sizing: border-box;
                box-shadow: 0 1px 3px rgba(26, 95, 180, 0.1);
                transition: all 0.3s ease;
            }
            
            .summary-item:hover {
                box-shadow: 0 2px 6px rgba(26, 95, 180, 0.2);
                transform: translateY(-1px);
                background: #e3f2fd;
            }
            
            .item-name {
                font-size: 12px;
                color: #1a5fb4;
                font-weight: 600;
                text-align: center;
                margin-bottom: 4px;
                line-height: 1.2;
            }
            
            .item-value {
                font-size: 16px;
                color: #1c3b6b;
                font-weight: 700;
                text-align: center;
                line-height: 1.2;
            }
            
            .summary-row.collapsed {
                margin-bottom: 0;
            }
            
            .summary-row.collapsed .row-header {
                background: #f1f3f4;
            }
            
            @media (max-width: 768px) {
                .summary-items-container {
                    gap: 6px;
                    padding: 8px;
                    margin: 0 5px;
                }
                
                .summary-row {
                    gap: 6px;
                }
                
                .row-header {
                    padding: 3px 6px;
                }
                
                .row-title {
                    font-size: 13px;
                }
                
                .row-items-wrapper {
                    gap: 8px;
                    padding: 6px;
                }
                
                .summary-item {
                    padding: 6px;
                }
                
                .item-name {
                    font-size: 11px;
                }
                
                .item-value {
                    font-size: 14px;
                }
            }

            @media (max-width: 480px) {
                .row-items-wrapper {
                    gap: 6px;
                    justify-content: space-around;
                }
                
                .summary-item {
                    min-width: 140px;
                    flex: 1;
                    max-width: 45%;
                }
            }
        `;

            document.head.appendChild(style);
        }

        /**
         * 从title属性中提取编码
         */
        function extractCodeFromTitle(title) {
            if (!title) return null;
            const match = title.match(/\[(\d+)\]/);
            return match ? match[1] : null;
        }

        /**
         * 为所有树节点添加点击事件
         */
        function addTreeItemClickEvents() {
            const treeContainer = document.querySelector('.ant-tree-list-holder-inner');

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
                if (treeItem.hasAttribute('data-summary-event-added')) {
                    return;
                }

                treeItem.setAttribute('data-summary-event-added', 'true');
                const originalClickHandler = treeItem.onclick;

                treeItem.addEventListener('click', function (event) {
                    console.log(`点击了树节点 ${index + 1}`);

                    const spans = treeItem.querySelectorAll('span');
                    let foundCode = null;

                    for (let span of spans) {
                        const title = span.getAttribute('title');
                        if (title) {
                            const code = extractCodeFromTitle(title);
                            if (code) {
                                foundCode = code;
                                CCode = code;
                                console.log(`提取到编码: ${code} (来自title: "${title}")`);
                                fetchAllDataAndUpdateSummary(code);
                                break;
                            }
                        }
                    }

                    if (!foundCode) {
                        console.log('未找到包含编码的span元素');
                    }

                    if (originalClickHandler) {
                        try {
                            originalClickHandler.call(this, event);
                        } catch (e) {
                            console.error('执行原有点击事件时出错:', e);
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
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        let hasTreeItems = false;
                        mutation.addedNodes.forEach(function (node) {
                            if (node.nodeType === 1) {
                                if (node.matches && node.matches('div[role="treeitem"]')) {
                                    hasTreeItems = true;
                                }
                                if (node.querySelector && node.querySelector('div[role="treeitem"]')) {
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
                subtree: true
            });
        }

        // 初始化
        setTimeout(() => {
            addTreeItemClickEvents();
            observeTreeChanges();
        }, 500);

        // 页面加载时获取初始数据
        fetchAllDataAndUpdateSummary(CCode);

        // 暴露公共方法
        return {
            updateSummaryPanel: function (configKey) {
                // 这里可以添加配置映射逻辑
                console.log('更新汇总面板配置:', configKey);
            },
            getCurrentSummaryConfig: function () {
                return currentConfig;
            },
            fetchSummaryData: function (code) {
                fetchAllDataAndUpdateSummary(code);
            },
            setCurrentCode: function (code) {
                CCode = code;
            }
        };
    }
	
	
	
	
	
//新复合统计组件
/**
 * 动态信息展示组件
 * 支持动态传递容器、汇总信息和流程配置
 */
class NewDynamicInfoDisplay {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {HTMLElement|string} options.container - 容器元素或元素ID
     * @param {Array} [options.displayConfigs] - 汇总信息配置
     * @param {Array} [options.processConfigs] - 流程配置
     * @param {string} [options.activeProcessKey] - 当前激活的流程key
     * @param {string} [options.titleFontSize] - 标题字体大小
     * @param {string} [options.mobileTitleFontSize] - 移动端标题字体大小
     */
    constructor(options) {
        this.initProperties(options);
        this.init();
    }

    /**
     * 初始化属性
     */
    initProperties(options) {
        // 获取容器元素
        if (typeof options.container === 'string') {
            this.container = document.getElementById(options.container);
        } else {
            this.container = options.container;
        }

        if (!this.container) {
            console.error('未找到容器元素');
            return;
        }

        // 存储配置
        this.displayConfigs = options.displayConfigs || [];
        this.processConfigs = options.processConfigs || [];
        this.activeProcessKey = options.activeProcessKey || '';

        // 存储字体大小配置
        this.titleFontSize = options.titleFontSize || '18px';
        this.mobileTitleFontSize = options.mobileTitleFontSize || '12px';

        // 折叠状态
        this.isDisplayCollapsed = false;
        this.isProcessCollapsed = false;

        // 默认图标
        this.defaultIcons = {
            main: '<svg t="1761536545835" class="icon" viewBox="0 0 1253 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4719" width="30" height="30"><path d="M606.239041 847.928236H163.181714A163.300305 163.300305 0 0 1 0 684.865113v-521.801991A163.300305 163.300305 0 0 1 163.181714 0h770.84385a163.300305 163.300305 0 0 1 162.588757 163.063122V416.255679a23.718272 23.718272 0 0 1-46.606405 0V163.063122a116.6939 116.6939 0 0 0-116.575309-116.456717h-770.84385a116.6939 116.6939 0 0 0-116.575309 116.456717v521.801991a116.6939 116.6939 0 0 0 116.575309 116.456717h443.650284a23.718272 23.718272 0 1 1 0 46.606406z" fill="#3A77D9" p-id="4720"></path><path d="M64.039335 914.932355m22.176585 0l763.254003 0q22.176585 0 22.176585 22.176584l0 0.118592q0 22.176585-22.176585 22.176584l-763.254003 0q-22.176585 0-22.176585-22.176584l0-0.118592q0-22.176585 22.176585-22.176584Z" fill="#3A77D9" p-id="4721"></path><path d="M123.335016 227.102457m22.176585 0l598.174828 0q22.176585 0 22.176584 22.176585l0 0.118591q0 22.176585-22.176584 22.176585l-598.174828 0q-22.176585 0-22.176585-22.176585l0-0.118591q0-22.176585 22.176585-22.176585Z" fill="#3A77D9" p-id="4722"></path><path d="M123.335016 382.694324m22.176585 0l471.756436 0q22.176585 0 22.176585 22.176585l0 0.118591q0 22.176585-22.176585 22.176585l-471.756436 0q-22.176585 0-22.176585-22.176585l0-0.118591q0-22.176585 22.176585-22.176585Z" fill="#3A77D9" p-id="4723"></path><path d="M123.335016 538.404782m22.176585 0l298.73164 0q22.176585 0 22.176584 22.176584l0 0.118592q0 22.176585-22.176584 22.176584l-298.73164 0q-22.176585 0-22.176585-22.176584l0-0.118592q0-22.176585 22.176585-22.176584Z" fill="#3A77D9" p-id="4724"></path><path d="M846.505139 474.365446a120.251641 120.251641 0 1 1-120.133049 120.251641A120.370232 120.370232 0 0 1 846.505139 474.365446m0-59.29568a179.42873 179.42873 0 1 0 179.42873 179.547321A179.42873 179.42873 0 0 0 846.505139 415.069766z" fill="#3A77D9" p-id="4725"></path><path d="M922.555993 730.311643m20.964189-20.964189l10.398237-10.398237q20.964189-20.964189 41.928378 0l177.86018 177.860179q20.964189 20.964189 0 41.928378l-10.398238 10.398238q-20.964189 20.964189-41.928378 0l-177.860179-177.86018q-20.964189-20.964189 0-41.928378Z" fill="#3A77D9" p-id="4726"></path></svg>',
            risk: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L15 14H1L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>'
        };

        // 风险提示框实例
        this.riskTooltip = null;
        this.contentContainer = null;
    }

    /**
     * 初始化组件
     */
    init() {
        // 清空容器
        this.container.innerHTML = '';

        // 添加样式
        this.addStyles();

        // 创建内容容器
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'dynamic-info-container';
        this.container.appendChild(this.contentContainer);

        // 创建风险提示框
        this.createRiskTooltip();

        // 渲染内容
        this.render();

        // 同步流程状态
        setTimeout(() => this.syncProcessWithTabs(), 100);
    }

    /**
     * 创建风险提示框
     */
    createRiskTooltip() {
        this.riskTooltip = document.createElement('div');
        this.riskTooltip.className = 'risk-tooltip';
        this.riskTooltip.style.display = 'none';
        document.body.appendChild(this.riskTooltip);
    }

    /**
     * 显示风险提示框
     * @param {Object} config - 配置对象
     * @param {HTMLElement} target - 目标元素
     */
    showRiskTooltip(config, target) {
        if (!this.riskTooltip) return;

        // 获取风险详情数据
        const riskDetails = config.riskDetails || this.getDefaultRiskDetails(config);

        // 构建提示框内容
        let tooltipContent = `<div class="risk-tooltip-title">${config.title || config.name} - 风险详情</div>`;

        riskDetails.forEach(detail => {
            tooltipContent += `
                <div class="risk-detail-item">
                    <span class="risk-level risk-level-${detail.level || 'medium'}">
                        ${detail.level === 'high' ? '高' : (detail.level === 'low' ? '低' : '中')}
                    </span>
                    <span class="risk-desc">${detail.description}</span>
                </div>
            `;
        });

        this.riskTooltip.innerHTML = tooltipContent;
        this.riskTooltip.style.display = 'block';

        // 定位提示框
        this.positionTooltip(target);
    }

    /**
     * 隐藏风险提示框
     */
    hideRiskTooltip() {
        if (this.riskTooltip) {
            this.riskTooltip.style.display = 'none';
        }
    }

    /**
     * 定位提示框
     * @param {HTMLElement} target - 目标元素
     */
    positionTooltip(target) {
        if (!this.riskTooltip || !target) return;

        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // 计算位置 - 在元素上方显示
        let top = rect.top + scrollTop - this.riskTooltip.offsetHeight - 10;
        let left = rect.left + scrollLeft + (rect.width / 2) - (this.riskTooltip.offsetWidth / 2);

        // 边界检查
        if (top < 10) {
            top = rect.bottom + scrollTop + 10; // 如果上方空间不足，显示在下方
        }
        if (left < 10) {
            left = 10;
        }
        if (left + this.riskTooltip.offsetWidth > window.innerWidth - 10) {
            left = window.innerWidth - this.riskTooltip.offsetWidth - 10;
        }

        this.riskTooltip.style.top = top + 'px';
        this.riskTooltip.style.left = left + 'px';
    }

    /**
     * 获取默认风险详情
     * @param {Object} config - 配置对象
     * @returns {Array} 风险详情数组
     */
    getDefaultRiskDetails(config) {
        const riskNum = config.riskNum || 0;
        const details = [];

        for (let i = 1; i <= riskNum; i++) {
            details.push({
                level: i % 3 === 0 ? 'high' : (i % 3 === 1 ? 'medium' : 'low'),
                description: `${config.title || config.name}风险项 ${i}`
            });
        }

        return details;
    }

    /**
     * 渲染组件内容
     */
    render() {
        // 渲染汇总信息
        if (this.displayConfigs && this.displayConfigs.length > 0) {
            this.renderDisplayItems();
        }

        // 渲染流程信息
        if (this.processConfigs && this.processConfigs.length > 0) {
            this.renderProcessFlow();
        }
    }

    /**
     * 渲染汇总信息
     */
    renderDisplayItems() {
        // 创建显示项容器
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'summary-section';

        // 创建标题栏
        const headerElem = document.createElement('div');
        headerElem.className = 'section-header';

        const titleElem = document.createElement('div');
        titleElem.className = 'section-title';
        titleElem.textContent = '汇总信息';
        titleElem.style.cursor = 'pointer';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'collapse-toggle';
        toggleBtn.title = '折叠';
        toggleBtn.innerHTML = '▼';

        headerElem.appendChild(titleElem);
        headerElem.appendChild(toggleBtn);

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'section-content';

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'display-items-container';

        // 创建显示项
        this.displayConfigs.forEach(config => {
            const item = this.createDisplayItem(config);
            itemsContainer.appendChild(item);
        });

        contentContainer.appendChild(itemsContainer);
        sectionContainer.appendChild(headerElem);
        sectionContainer.appendChild(contentContainer);
        this.contentContainer.appendChild(sectionContainer);

        // 添加折叠事件
        this.addCollapseEvents(titleElem, toggleBtn, contentContainer, 'display');
    }

    /**
     * 创建单个显示项
     * @param {Object} config - 配置对象
     * @returns {HTMLElement} 显示项元素
     */
    createDisplayItem(config) {
        const item = document.createElement('div');
        item.className = 'display-item';

        // 上部分：标题（占25%高度）
        const headerElem = document.createElement('div');
        headerElem.className = 'item-header';
        headerElem.textContent = config.title || config.name || '';

        // 下部分主体
        const bodyElem = document.createElement('div');
        bodyElem.className = 'item-body';

        // 左边部分：图标（占25%宽度）
        const leftElem = document.createElement('div');
        leftElem.className = 'item-left';

        // 使用配置的图标或默认图标
        const iconSvg = config.icon || this.defaultIcons.main;
        leftElem.innerHTML = iconSvg;

        // 右边部分
        const rightElem = document.createElement('div');
        rightElem.className = 'item-right';

        // 右上部分：主数值和小图标
        const rightTopElem = document.createElement('div');
        rightTopElem.className = 'item-right-top';

        const mainValueElem = document.createElement('span');
        mainValueElem.className = 'item-main-value';
        mainValueElem.textContent = config.mainValue || config.value || '0';

        const valueIconElem = document.createElement('span');
        valueIconElem.className = 'item-value-icon';
        const valueIconSvg = config.valueIcon || this.defaultIcons.risk;
        valueIconElem.innerHTML = valueIconSvg;

        rightTopElem.appendChild(mainValueElem);
        rightTopElem.appendChild(valueIconElem);

        // 右下部分：描述和风险信息
        const rightBottomElem = document.createElement('div');
        rightBottomElem.className = 'item-right-bottom';

        const descElem = document.createElement('span');
        descElem.className = 'item-desc';
        descElem.textContent = config.description || '';

        const riskElem = document.createElement('span');
        riskElem.className = 'item-risk';
        riskElem.title = '点击查看风险详情';

        const riskIconElem = document.createElement('span');
        riskIconElem.className = 'item-risk-icon';
        const riskIconSvg = config.riskIcon || this.defaultIcons.risk;
        riskIconElem.innerHTML = riskIconSvg;

        const riskNumElem = document.createElement('span');
        riskNumElem.className = 'item-risk-num';
        riskNumElem.textContent = `${config.riskNum || 0}个风险`;

        riskElem.appendChild(riskIconElem);
        riskElem.appendChild(riskNumElem);

        rightBottomElem.appendChild(descElem);
        rightBottomElem.appendChild(riskElem);

        // 组装右边部分
        rightElem.appendChild(rightTopElem);
        rightElem.appendChild(rightBottomElem);

        // 组装主体部分
        bodyElem.appendChild(leftElem);
        bodyElem.appendChild(rightElem);

        // 组装完整项目
        item.appendChild(headerElem);
        item.appendChild(bodyElem);

        // 添加风险提示事件
        this.addRiskTooltipEvents(riskElem, config);

        return item;
    }

    /**
     * 添加风险提示事件
     * @param {HTMLElement} riskElem - 风险元素
     * @param {Object} config - 配置对象
     */
    addRiskTooltipEvents(riskElem, config) {
        let hideTimeout;

        riskElem.addEventListener('mouseenter', (e) => {
            clearTimeout(hideTimeout);
            this.showRiskTooltip(config, riskElem);
        });

        riskElem.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                this.hideRiskTooltip();
            }, 100);
        });

        // 防止鼠标移动到提示框时立即隐藏
        if (this.riskTooltip) {
            this.riskTooltip.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
            });

            this.riskTooltip.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                    this.hideRiskTooltip();
                }, 100);
            });
        }

        // 点击风险区域也可以显示/隐藏提示框
        riskElem.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.riskTooltip && this.riskTooltip.style.display === 'block') {
                this.hideRiskTooltip();
            } else {
                this.showRiskTooltip(config, riskElem);
            }
        });
    }

    /**
     * 渲染流程信息
     */
    renderProcessFlow() {
        // 创建流程容器
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'process-section';

        // 创建标题栏
        const headerElem = document.createElement('div');
        headerElem.className = 'section-header';

        const titleElem = document.createElement('div');
        titleElem.className = 'section-title';
        titleElem.textContent = '流程导航';
        titleElem.style.cursor = 'pointer';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'collapse-toggle';
        toggleBtn.title = '折叠';
        toggleBtn.innerHTML = '▼';

        headerElem.appendChild(titleElem);
        headerElem.appendChild(toggleBtn);

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'section-content';

        const processContainer = document.createElement('div');
        processContainer.className = 'process-flow-container';

        // 创建流程项
        this.processConfigs.forEach((config, index) => {
            // 创建流程项
            const processItem = this.createProcessItem(config);
            processContainer.appendChild(processItem);

            // 如果不是最后一个流程项，添加连接线
            if (index < this.processConfigs.length - 1) {
                const connector = this.createProcessConnector();
                processContainer.appendChild(connector);
            }
        });

        contentContainer.appendChild(processContainer);
        sectionContainer.appendChild(headerElem);
        sectionContainer.appendChild(contentContainer);
        this.contentContainer.appendChild(sectionContainer);

        // 添加折叠事件
        this.addCollapseEvents(titleElem, toggleBtn, contentContainer, 'process');
    }

    /**
     * 创建单个流程项
     * @param {Object} config - 流程配置
     * @returns {HTMLElement} 流程项元素
     */
    createProcessItem(config) {
        const processItem = document.createElement('div');
        processItem.className = 'process-item';
        processItem.dataset.processKey = config.key;

        if (config.key === this.activeProcessKey) {
            processItem.classList.add('process-item-active');
        }

        // 创建流程节点
        const node = document.createElement('div');
        node.className = 'process-node';

        // 根据数量添加不同的样式类
        if (config.num === 0) {
            node.classList.add('process-node-zero');
        } else {
            node.classList.add('process-node-has-data');
        }

        // 创建节点数量显示
        const nodeNum = document.createElement('div');
        nodeNum.className = 'process-node-num';
        nodeNum.textContent = config.num || '0';

        // 创建流程名称
        const name = document.createElement('div');
        name.className = 'process-name';
        name.textContent = config.name;

        node.appendChild(nodeNum);
        processItem.appendChild(node);
        processItem.appendChild(name);

        // 绑定点击事件
        processItem.addEventListener('click', () => {
            console.log('点击流程项:', config.key);

            // 触发对应的tab元素点击事件
            const targetTab = document.querySelector(`[data-node-key="${config.key}"]`);
            if (targetTab) {
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                targetTab.dispatchEvent(clickEvent);

                // 更新激活状态
                this.updateActiveProcessKey(config.key);
            } else {
                console.error(`未找到data-node-key为"${config.key}"的元素`);
            }
        });

        return processItem;
    }

    /**
     * 创建流程连接线
     * @returns {HTMLElement} 连接线元素
     */
    createProcessConnector() {
        const connector = document.createElement('div');
        connector.className = 'process-connector';

        const line = document.createElement('div');
        line.className = 'process-line';

        const arrow = document.createElement('div');
        arrow.className = 'process-arrow';

        connector.appendChild(line);
        connector.appendChild(arrow);

        return connector;
    }

    /**
     * 添加折叠事件
     * @param {HTMLElement} titleElem - 标题元素
     * @param {HTMLElement} toggleBtn - 切换按钮
     * @param {HTMLElement} contentContainer - 内容容器
     * @param {string} type - 类型 ('display' 或 'process')
     */
    addCollapseEvents(titleElem, toggleBtn, contentContainer, type) {
        const toggleCollapse = () => {
            if (type === 'display') {
                this.isDisplayCollapsed = !this.isDisplayCollapsed;
                if (this.isDisplayCollapsed) {
                    contentContainer.style.display = 'none';
                    toggleBtn.innerHTML = '▲';
                    toggleBtn.title = '展开';
                } else {
                    contentContainer.style.display = 'block';
                    toggleBtn.innerHTML = '▼';
                    toggleBtn.title = '折叠';
                }
            } else if (type === 'process') {
                this.isProcessCollapsed = !this.isProcessCollapsed;
                if (this.isProcessCollapsed) {
                    contentContainer.style.display = 'none';
                    toggleBtn.innerHTML = '▲';
                    toggleBtn.title = '展开';
                } else {
                    contentContainer.style.display = 'block';
                    toggleBtn.innerHTML = '▼';
                    toggleBtn.title = '折叠';
                }
            }
        };

        titleElem.addEventListener('click', toggleCollapse);
        toggleBtn.addEventListener('click', toggleCollapse);
    }

    /**
     * 更新激活的流程项
     * @param {string} activeKey - 激活的流程key
     */
    updateActiveProcessKey(activeKey) {
        this.activeProcessKey = activeKey;

        const processItems = this.container.querySelectorAll('.process-item');
        processItems.forEach(item => {
            item.classList.remove('process-item-active');
            if (item.dataset.processKey === activeKey) {
                item.classList.add('process-item-active');
            }
        });
    }

    /**
     * 同步流程与tab的点击事件
     */
    syncProcessWithTabs() {
        const tabElements = document.querySelectorAll('[data-node-key]');

        tabElements.forEach(tab => {
            // 移除可能存在的重复监听器
            tab.removeEventListener('click', this.handleTabClick);
            // 添加新的监听器
            tab.addEventListener('click', this.handleTabClick);
        });
    }

    /**
     * tab点击事件处理函数
     */
    handleTabClick() {
        const key = this.getAttribute('data-node-key');
        console.log('Tab点击:', key);

        // 找到所有DynamicInfoDisplay实例并更新激活状态
        document.querySelectorAll('.dynamic-info-container').forEach(container => {
            const processItems = container.querySelectorAll('.process-item');
            processItems.forEach(item => {
                item.classList.remove('process-item-active');
                if (item.dataset.processKey === key) {
                    item.classList.add('process-item-active');
                }
            });
        });
    }

    /**
     * 添加样式
     */
    addStyles() {
        // 检查是否已经添加过样式
        if (document.querySelector('#dynamic-info-display-styles')) return;

        const style = document.createElement('style');
        style.id = 'dynamic-info-display-styles';
        style.textContent = this.getStyles();
        document.head.appendChild(style);
    }

    /**
     * 获取样式字符串
     */
    getStyles() {
        return `.dynamic-info-container {
    width: 100%;
}

/* 模块标题栏样式 */
.summary-section, .process-section {
    margin-bottom: 16px;
    border: 1px solid #e1e5e9;
    background: #ffffff;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a5fb4;
    cursor: pointer;
}

.collapse-toggle {
    background: none;
    border: none;
    font-size: 12px;
    color: #666;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 3px;
    transition: all 0.2s ease;
}

.collapse-toggle:hover {
    background-color: #e9ecef;
    transform: scale(1.1);
}

.section-content {
    transition: all 0.3s ease;
}

/* 汇总信息样式 */
.display-items-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
    background: #ffffff;
    min-height: 90px;
    box-sizing: border-box;
}

.display-item {
    width: 200px;
    height: 80px;
    border: 1px solid #e8e8e8;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 0;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.display-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #1a5fb4;
}

.item-header {
    height: 25%;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${this.titleFontSize};
    color: #1A5FB4;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
    padding: 0 8px;
    text-align: center;
}

.item-body {
    height: 75%;
    display: flex;
    padding: 8px;
}

.item-left {
    width: 25%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a5fb4;
}

.item-left svg {
    width: 30px;
    height: 30px;
}

.item-right {
    width: 75%;
    display: flex;
    flex-direction: column;
    padding-left: 8px;
}

.item-right-top {
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.item-main-value {
    font-size: 18px;
    font-weight: 700;
    color: #1c3b6b;
}

.item-value-icon {
    color: #1a5fb4;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px; 
}

.item-value-icon svg {
    width: 20px;
    height: 20px;
}

.item-right-bottom {
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}

.item-desc {
    color: #666;
}

.item-risk {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.item-risk:hover {
    color: #ff4d4f;
    transform: scale(1.05);
}

.item-risk-icon {
    color: #ff4d4f;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-risk-icon svg {
    width: 12px;
    height: 12px;
}

.item-risk-num {
    color: #ff4d4f;
    font-weight: 500;
}

/* 流程信息样式 */
.process-flow-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
    background: #ffffff;
}

.process-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 6px;
    transition: all 0.3s ease;
    min-width: 100px;
}

.process-item:hover {
    background: #f0f7ff;
    transform: translateY(-2px);
}

.process-item-active {
    background: #e6f7ff;
    border: 1px solid #1890ff;
}

.process-item-active .process-node {
    border-color: #1890ff;
}

.process-item-active .process-node-has-data {
    background: #1890ff;
    border-color: #1890ff;
}

.process-item-active .process-node-zero {
    background: #f0f0f0;
    border-color: #1890ff;
}

.process-item-active .process-node-num {
    color: #ffffff;
}

.process-item-active .process-node-zero .process-node-num {
    color: #1890ff;
}

.process-node {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    border: 2px solid;
}

.process-node-has-data {
    background: #1a5fb4;
    border-color: #1a5fb4;
}

.process-node-zero {
    background: #ffffff;
    border-color: #d9d9d9;
}

.process-node-num {
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.process-node-has-data .process-node-num {
    color: #ffffff;
}

.process-node-zero .process-node-num {
    color: #999999;
}

.process-name {
    font-size: 14px;
    color: #1c3b6b;
    text-align: center;
    line-height: 1.4;
    font-weight: 500;
}

.process-connector {
    display: flex;
    align-items: center;
    margin: 0 8px;
}

.process-line {
    width: 40px;
    height: 2px;
    background: #d9d9d9;
    position: relative;
}

.process-arrow {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid #d9d9d9;
    margin-left: -2px;
}

/* 风险提示框样式 */
.risk-tooltip {
    position: absolute;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 300px;
    min-width: 200px;
    font-size: 12px;
    line-height: 1.4;
}

.risk-tooltip-title {
    font-weight: 600;
    color: #1c3b6b;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f0f0f0;
}

.risk-detail-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 6px;
    gap: 8px;
}

.risk-level {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.risk-level-high {
    background: #ff4d4f;
    color: white;
}

.risk-level-medium {
    background: #faad14;
    color: white;
}

.risk-level-low {
    background: #52c41a;
    color: white;
}

.risk-desc {
    color: #666;
    flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .section-header {
        padding: 6px 10px;
    }
    
    .section-title {
        font-size: 13px;
    }
    
    .display-items-container {
        gap: 12px;
        padding: 16px;
    }
    
    .display-item {
        width: 140px;
        height: 70px;
    }
    
    .item-header {
        font-size: ${this.mobileTitleFontSize};
    }
    
    .item-main-value {
        font-size: 16px;
    }
    
    .item-right-bottom {
        font-size: 11px;
    }
    
    .process-flow-container {
        padding: 16px 12px;
    }
    
    .process-item {
        min-width: 80px;
        padding: 8px 12px;
    }
    
    .process-node {
        width: 32px;
        height: 32px;
    }
    
    .process-node-num {
        font-size: 14px;
    }
    
    .process-name {
        font-size: 12px;
    }
    
    .process-line {
        width: 20px;
    }
    
    .risk-tooltip {
        max-width: 250px;
        min-width: 180px;
    }
}

/* 小屏幕时垂直排列 */
@media (max-width: 480px) {
    .display-items-container {
        justify-content: space-around;
    }
    
    .display-item {
        width: 45%;
        min-width: 140px;
    }
    
    .process-flow-container {
        flex-direction: column;
    }
    
    .process-connector {
        margin: 8px 0;
        transform: rotate(90deg);
    }
    
    .process-line {
        width: 50px;
    }
    
    .risk-tooltip {
        max-width: 200px;
        min-width: 160px;
    }
}`;
    }

    // ==================== 公共API方法 ====================

    /**
     * 动态更新汇总信息
     * @param {Array} displayConfigs - 新的汇总信息配置
     * @param {boolean} keepCollapseState - 是否保持折叠状态
     */
    updateDisplayInfo(displayConfigs, keepCollapseState = true) {
        this.displayConfigs = displayConfigs || [];

        // 移除现有的汇总信息section
        const existingDisplaySection = this.container.querySelector('.summary-section');
        if (existingDisplaySection) {
            existingDisplaySection.remove();
        }

        // 重新渲染汇总信息
        if (this.displayConfigs.length > 0) {
            this.renderDisplayItems();

            // 如果之前是折叠状态，重新应用折叠
            if (keepCollapseState && this.isDisplayCollapsed) {
                const contentContainer = this.container.querySelector('.summary-section .section-content');
                const toggleBtn = this.container.querySelector('.summary-section .collapse-toggle');
                if (contentContainer && toggleBtn) {
                    contentContainer.style.display = 'none';
                    toggleBtn.innerHTML = '▲';
                    toggleBtn.title = '展开';
                }
            }
        }
    }

    /**
     * 动态更新单个汇总项
     * @param {string} title - 要更新的项标题
     * @param {Object} newData - 新数据
     */
    updateDisplayItem(title, newData) {
        const displayItems = this.container.querySelectorAll('.display-item');
        let found = false;

        displayItems.forEach(item => {
            const header = item.querySelector('.item-header');
            if (header && header.textContent === title) {
                // 更新主数值
                const mainValueElem = item.querySelector('.item-main-value');
                if (mainValueElem && newData.mainValue !== undefined) {
                    mainValueElem.textContent = newData.mainValue;
                }

                // 更新描述
                const descElem = item.querySelector('.item-desc');
                if (descElem && newData.description !== undefined) {
                    descElem.textContent = newData.description;
                }

                // 更新风险数量
                const riskNumElem = item.querySelector('.item-risk-num');
                if (riskNumElem && newData.riskNum !== undefined) {
                    riskNumElem.textContent = `${newData.riskNum}个风险`;
                }

                // 更新风险详情数据
                if (newData.riskDetails !== undefined) {
                    // 找到对应的配置项并更新
                    const configIndex = this.displayConfigs.findIndex(config =>
                        config.title === title
                    );
                    if (configIndex !== -1) {
                        this.displayConfigs[configIndex].riskDetails = newData.riskDetails;
                        this.displayConfigs[configIndex].riskNum = newData.riskNum;
                    }
                }

                found = true;
            }
        });

        return found;
    }

    /**
     * 动态更新流程信息
     * @param {Array} processConfigs - 新的流程配置
     * @param {string} activeKey - 激活的流程key
     * @param {boolean} keepCollapseState - 是否保持折叠状态
     */
    updateProcessInfo(processConfigs, activeKey = '', keepCollapseState = true) {
        this.processConfigs = processConfigs || [];
        if (activeKey) {
            this.activeProcessKey = activeKey;
        }

        // 移除现有的流程section
        const existingProcessSection = this.container.querySelector('.process-section');
        if (existingProcessSection) {
            existingProcessSection.remove();
        }

        // 重新渲染流程信息
        if (this.processConfigs.length > 0) {
            this.renderProcessFlow();

            // 如果之前是折叠状态，重新应用折叠
            if (keepCollapseState && this.isProcessCollapsed) {
                const contentContainer = this.container.querySelector('.process-section .section-content');
                const toggleBtn = this.container.querySelector('.process-section .collapse-toggle');
                if (contentContainer && toggleBtn) {
                    contentContainer.style.display = 'none';
                    toggleBtn.innerHTML = '▲';
                    toggleBtn.title = '展开';
                }
            }
        }
    }

    /**
     * 动态更新单个流程项数量
     * @param {string} processKey - 流程key
     * @param {number} newNum - 新数量
     */
    updateProcessItemNum(processKey, newNum) {
        const processItems = this.container.querySelectorAll('.process-item');
        let found = false;

        processItems.forEach(item => {
            if (item.dataset.processKey === processKey) {
                const nodeNum = item.querySelector('.process-node-num');
                const node = item.querySelector('.process-node');

                if (nodeNum) {
                    nodeNum.textContent = newNum;
                }

                // 更新节点样式
                if (node) {
                    node.classList.remove('process-node-zero', 'process-node-has-data');
                    if (newNum === 0) {
                        node.classList.add('process-node-zero');
                    } else {
                        node.classList.add('process-node-has-data');
                    }
                }

                // 更新配置数据
                const configIndex = this.processConfigs.findIndex(config =>
                    config.key === processKey
                );
                if (configIndex !== -1) {
                    this.processConfigs[configIndex].num = newNum;
                }

                found = true;
            }
        });

        return found;
    }

    /**
     * 设置激活的流程项
     * @param {string} activeKey - 激活的流程key
     */
    setActiveProcess(activeKey) {
        this.updateActiveProcessKey(activeKey);
    }

    /**
     * 获取当前配置
     * @returns {Object} 当前配置对象
     */
    getConfig() {
        return {
            displayConfigs: this.displayConfigs,
            processConfigs: this.processConfigs,
            activeProcessKey: this.activeProcessKey,
            isDisplayCollapsed: this.isDisplayCollapsed,
            isProcessCollapsed: this.isProcessCollapsed
        };
    }

    /**
     * 完全重新配置组件
     * @param {Object} newConfig - 新配置
     */
    reconfigure(newConfig) {
        if (newConfig.displayConfigs !== undefined) {
            this.displayConfigs = newConfig.displayConfigs;
        }
        if (newConfig.processConfigs !== undefined) {
            this.processConfigs = newConfig.processConfigs;
        }
        if (newConfig.activeProcessKey !== undefined) {
            this.activeProcessKey = newConfig.activeProcessKey;
        }

        // 清空容器并重新初始化
        this.container.innerHTML = '';
        this.init();
    }

    /**
     * 销毁组件，清理资源
     */
    destroy() {
        if (this.riskTooltip && this.riskTooltip.parentNode) {
            this.riskTooltip.parentNode.removeChild(this.riskTooltip);
        }
        
        // 移除事件监听器
        const tabElements = document.querySelectorAll('[data-node-key]');
        tabElements.forEach(tab => {
            tab.removeEventListener('click', this.handleTabClick);
        });

        // 清空容器
        this.container.innerHTML = '';
    }
}



//多表体明细行计数统计
class DataTableCounter {
    /**
     * 数据表统计类
     * @param {string} baseUrl - API基础URL
     */
    constructor(baseUrl = 'https://ynnterp-mproject.cnyeig.com/sup/customServer/getInfo') {
        this.baseUrl = baseUrl;
    }

    /**
     * 构建请求参数
     * @param {string} id - 主ID
     * @param {string} customBusCode - 自定义业务代码
     * @param {string} oType - 操作类型，默认为'view'
     * @returns {Object} 请求参数
     */
    buildParams(id, customBusCode, oType = 'view') {
        return {
            id: id,
            oType: oType,
            customBusCode: customBusCode,
            encryptPrimaryKey: $NG.CryptoJS.encode(id)
        };
    }

    /**
     * 构建完整的请求URL
     * @param {string} id - 主ID
     * @param {string} customBusCode - 自定义业务代码
     * @param {string} oType - 操作类型
     * @returns {string} 完整的请求URL
     */
    buildRequestUrl(id, customBusCode, oType = 'view') {
        const params = this.buildParams(id, customBusCode, oType);
        const queryString = new URLSearchParams(params).toString();
        return `${this.baseUrl}?${queryString}`;
    }

    /**
     * 发送API请求获取数据
     * @param {string} id - 主ID
     * @param {string} customBusCode - 自定义业务代码
     * @param {string} oType - 操作类型
     * @returns {Promise<Object>} API响应数据
     */
    async fetchData(id, customBusCode, oType = 'view') {
        const fullUrl = this.buildRequestUrl(id, customBusCode, oType);

        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status !== 'success') {
                throw new Error(`API error: ${result.msg || 'Unknown error'}`);
            }

            return result.data;

        } catch (error) {
            console.error('获取数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取数据并统计 d* 后缀表中的数据条数
     * @param {string} id - 主ID
     * @param {string} customBusCode - 自定义业务代码
     * @param {string} tablePrefix - 表前缀
     * @returns {Promise<Array<{tableName: string, count: number}>>}
     */
    async fetchDataAndCountTables(id, customBusCode, tablePrefix) {
        try {
            const data = await this.fetchData(id, customBusCode);
            const tableStats = [];

            // 遍历所有属性，查找指定前缀的表
            for (const [key, value] of Object.entries(data)) {
                if (key.startsWith(tablePrefix)) {
                    let count = 0;

                    if (Array.isArray(value)) {
                        // 如果是数组，直接计算长度
                        count = value.length;
                    } else if (value && typeof value === 'object') {
                        // 如果是对象，检查是否为空对象
                        count = Object.keys(value).length > 0 ? 1 : 0;
                    }

                    tableStats.push({
                        tableName: key,
                        count: count
                    });
                }
            }

            return tableStats;

        } catch (error) {
            console.error('统计表数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取排序后的count数组
     * @param {string} id - 主ID
     * @param {string} customBusCode - 自定义业务代码
     * @param {string} tablePrefix - 表前缀
     * @returns {Promise<Array<number>>} 排序后的count数组
     */
    async getSortedCountArray(id, customBusCode, tablePrefix) {
        try {
            const stats = await this.fetchDataAndCountTables(id, customBusCode, tablePrefix);
            
            console.log('表统计结果:');
            stats.forEach(stat => {
                console.log(`${stat.tableName}: ${stat.count}`);
            });

            // 按照 d1, d2, d3... 顺序将 count 存到数组
            const countArray = stats
                .sort((a, b) => {
                    const numA = parseInt(a.tableName.match(/d(\d+)/)?.[1] || 0);
                    const numB = parseInt(b.tableName.match(/d(\d+)/)?.[1] || 0);
                    return numA - numB;
                })
                .map(item => item.count);

            console.log('Count 数组:', countArray);
            return countArray;

        } catch (error) {
            console.error('获取count数组失败:', error);
            throw error;
        }
    }
}



// 数字格式化函数 - 动态单位判断
                                        function formatNumberToUnit(num, decimalPlaces = 2) {
                                            if (num === null || num === undefined || isNaN(num)) {
                                                return '0';
                                            }

                                            const absNum = Math.abs(num);
                                            let value, unit;

                                            // 动态选择合适的单位
                                            if (absNum >= 100000000000) { // 千亿及以上
                                                value = num / 100000000000;
                                                unit = '千亿';
                                            } else if (absNum >= 10000000000) { // 百亿
                                                value = num / 10000000000;
                                                unit = '百亿';
                                            } else if (absNum >= 1000000000) { // 十亿
                                                value = num / 1000000000;
                                                unit = '十亿';
                                            } else if (absNum >= 100000000) { // 亿
                                                value = num / 100000000;
                                                unit = '亿';
                                            } else if (absNum >= 10000000) { // 千万
                                                value = num / 10000000;
                                                unit = '千万';
                                            } else if (absNum >= 1000000) { // 百万
                                                value = num / 1000000;
                                                unit = '百万';
                                            } else if (absNum >= 100000) { // 十万
                                                value = num / 100000;
                                                unit = '十万';
                                            } else if (absNum >= 10000) { // 万
                                                value = num / 10000;
                                                unit = '万';
                                            } else if (absNum >= 1000) { // 千
                                                value = num / 1000;
                                                unit = '千';
                                            } else if (absNum >= 100) { // 百
                                                value = num / 100;
                                                unit = '百';
                                            } else {
                                                value = num;
                                                unit = '';
                                            }

                                            // 格式化数字，根据decimalPlaces参数控制小数位数
                                            let formattedValue;
                                            if (decimalPlaces === 0) {
                                                // 不保留小数
                                                formattedValue = Math.round(value).toString();
                                            } else {
                                                // 保留指定小数位数
                                                formattedValue = value.toFixed(decimalPlaces);

                                                // 去除多余的0和小数点（如果小数部分全为0）
                                                formattedValue = formattedValue.replace(/\.?0+$/, '');

                                                // 如果格式化后以小数点结尾，去除小数点
                                                if (formattedValue.endsWith('.')) {
                                                    formattedValue = formattedValue.slice(0, -1);
                                                }
                                            }

                                            return formattedValue + unit;
                                        }




//明细数据导入树化

// TreeStructureGenerator.js - 可复用的树形结构生成器
class TreeStructureGenerator {
  constructor(options = {}) {
    this.options = {
      buttonSelector: '[originid="u_init_tree"]',
      sheetJSUrl: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
      ...options
    };
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindInitTreeButton());
    } else {
      this.bindInitTreeButton();
    }
  }

  // 动态加载 SheetJS 库
  loadSheetJS(callback) {
    if (typeof XLSX !== 'undefined') {
      callback();
      return;
    }

    const script = document.createElement('script');
    script.src = this.options.sheetJSUrl;
    script.onload = callback;
    script.onerror = () => {
      this.showAlert('加载 SheetJS 库失败，请检查网络连接');
    };
    document.head.appendChild(script);
  }

  // 绑定点击事件
  bindInitTreeButton() {
    const buttons = document.querySelectorAll(this.options.buttonSelector);
    if (buttons.length === 0) {
      console.warn(`未找到选择器为 "${this.options.buttonSelector}" 的按钮`);
      return;
    }

    buttons.forEach(button => {
      // 移除已存在的事件监听器
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      newButton.addEventListener('click', () => {
        this.loadSheetJS(() => {
          this.initTreeProcess();
        });
      });
    });
  }

  initTreeProcess() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xls,.xlsx,.csv';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) {
            this.showAlert('文件内容为空或格式不正确');
            return;
          }

          const headers = jsonData[0];
          this.showLevelFieldDialog(headers, jsonData, workbook, firstSheetName);
        } catch (error) {
          console.error('解析 Excel 文件失败:', error);
          this.showAlert('解析 Excel 文件失败: ' + error.message);
        }
      };

      reader.onerror = () => {
        this.showAlert('读取文件失败');
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

  showLevelFieldDialog(headers, data, workbook, sheetName) {
    const overlay = this.createOverlay();
    const dialog = this.createDialog('设置树形结构字段');

    // 选择层级字段
    const levelFieldContainer = this.createFormGroup('选择层级字段：');
    const levelFieldSelect = this.createSelect(headers, '--请选择层级字段--');
    levelFieldContainer.appendChild(levelFieldSelect);
    dialog.appendChild(levelFieldContainer);

    // 分隔符输入
    const separatorContainer = this.createFormGroup('输入层级分隔符：');
    const separatorInput = this.createInput('.', '例如: .');
    separatorContainer.appendChild(separatorInput);
    dialog.appendChild(separatorContainer);

    // 选择树ID字段
    const treeIdContainer = this.createFormGroup('选择树ID字段：');
    const treeIdFieldSelect = this.createSelect(headers, '--请选择树ID字段--');
    treeIdContainer.appendChild(treeIdFieldSelect);
    dialog.appendChild(treeIdContainer);

    // 选择树PID字段
    const treePidContainer = this.createFormGroup('选择树PID字段：');
    const treePidFieldSelect = this.createSelect(headers, '--请选择树PID字段--');
    treePidContainer.appendChild(treePidFieldSelect);
    dialog.appendChild(treePidContainer);

    // 按钮容器
    const buttonContainer = this.createButtonContainer();
    
    const cancelBtn = this.createButton('取消', 'secondary', () => {
      document.body.removeChild(overlay);
    });

    const confirmBtn = this.createButton('确认生成', 'primary', () => {
      const levelField = levelFieldSelect.value;
      const separator = separatorInput.value.trim();
      const treeIdField = treeIdFieldSelect.value;
      const treePidField = treePidFieldSelect.value;

      if (!levelField || !separator || !treeIdField || !treePidField) {
        this.showAlert('请填写完整信息');
        return;
      }

      if (levelField === treeIdField || levelField === treePidField || treeIdField === treePidField) {
        this.showAlert('层级字段、树ID字段和树PID字段不能相同');
        return;
      }

      try {
        const result = this.generateTreeData(data, levelField, separator, treeIdField, treePidField, workbook, sheetName);
        this.showDownloadConfirm(result);
        document.body.removeChild(overlay);
      } catch (error) {
        console.error('生成树形结构失败:', error);
        this.showAlert('生成失败: ' + error.message);
      }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    this.setupOverlayClose(overlay);
  }

  createOverlay() {
    const overlay = document.createElement('div');
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
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      z-index: 1000;
      width: 480px;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid #e6f7ff;
    `;

    const titleEl = document.createElement('h3');
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
    const container = document.createElement('div');
    container.style.marginBottom = '20px';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.cssText = `
      display: block;
      margin-bottom: 6px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    `;

    container.appendChild(label);
    return container;
  }

  createSelect(headers, placeholder) {
    const select = document.createElement('select');
    select.style.cssText = `
      width: 100%;
      padding: 10px 12px;
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

    select.addEventListener('focus', () => {
      select.style.borderColor = '#1890ff';
      select.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
    });

    select.addEventListener('blur', () => {
      select.style.borderColor = '#d9d9d9';
      select.style.boxShadow = 'none';
    });

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = placeholder;
    emptyOption.selected = true;
    select.appendChild(emptyOption);

    headers.forEach(header => {
      if (header && header.trim() !== '') {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        select.appendChild(option);
      }
    });

    return select;
  }

  createInput(value = '', placeholder = '') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.value = value;
    input.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      box-sizing: border-box;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s;
    `;

    input.addEventListener('focus', () => {
      input.style.borderColor = '#1890ff';
      input.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = '#d9d9d9';
      input.style.boxShadow = 'none';
    });

    return input;
  }

  createButtonContainer() {
    const container = document.createElement('div');
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

  createButton(text, type = 'primary', onClick) {
    const button = document.createElement('button');
    button.textContent = text;

    const baseStyles = `
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
      border: none;
    `;

    if (type === 'primary') {
      button.style.cssText = baseStyles + `
        background: #1890ff;
        color: white;
      `;
      button.addEventListener('mouseover', () => {
        button.style.background = '#40a9ff';
      });
      button.addEventListener('mouseout', () => {
        button.style.background = '#1890ff';
      });
    } else {
      button.style.cssText = baseStyles + `
        border: 1px solid #d9d9d9;
        background: white;
        color: #666;
      `;
      button.addEventListener('mouseover', () => {
        button.style.borderColor = '#1890ff';
        button.style.color = '#1890ff';
      });
      button.addEventListener('mouseout', () => {
        button.style.borderColor = '#d9d9d9';
        button.style.color = '#666';
      });
    }

    button.onclick = onClick;
    return button;
  }

  setupOverlayClose(overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  showDownloadConfirm(result) {
    const overlay = this.createOverlay();
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      z-index: 1000;
      width: 360px;
      max-width: 90vw;
      text-align: center;
      border: 1px solid #e6f7ff;
    `;

    const icon = document.createElement('div');
    icon.innerHTML = '<svg t="1763533792112" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3516" width="200" height="200"><path d="M319.9 472.2l-51.2-63h-64l83.2 102.4L204.8 614h64l51.2-63 51.2 63h64L352 511.6l83.2-102.4h-64l-51.3 63zM204.8 716.4h-51.2c-14.1 0-25.6-11.5-25.6-25.6V332.4c0-14.1 11.5-25.6 25.6-25.6h51.2V153.2c0-28.3 22.9-51.2 51.2-51.2h588.8c28.3 0 51.2 22.9 51.2 51.2V870c0 28.3-22.9 51.2-51.2 51.2H255.9c-28.3 0-51.2-22.9-51.2-51.2V716.4z m25.5 0V870c0 14.1 11.5 25.6 25.6 25.6h588.8c14.1 0 25.6-11.5 25.6-25.6V153.2c0-14.1-11.5-25.6-25.6-25.6H255.9c-14.1 0-25.6 11.5-25.6 25.6v153.6h256c14.1 0 25.6 11.5 25.6 25.6v358.4c0 14.1-11.5 25.6-25.6 25.6h-256z m358.5-320h204.8c7.1 0 12.8 5.7 12.8 12.8 0 7.1-5.7 12.8-12.8 12.8H588.8c-7.1 0-12.8-5.7-12.8-12.8-0.1-7.1 5.7-12.8 12.8-12.8z m0 102.4h204.8c7.1 0 12.8 5.7 12.8 12.8 0 7.1-5.7 12.8-12.8 12.8H588.8c-7.1 0-12.8-5.7-12.8-12.8-0.1-7.1 5.7-12.8 12.8-12.8z m0 102.4h204.8c7.1 0 12.8 5.7 12.8 12.8 0 7.1-5.7 12.8-12.8 12.8H588.8c-7.1 0-12.8-5.7-12.8-12.8-0.1-7.1 5.7-12.8 12.8-12.8z m0 0" fill="#8CBA5F" p-id="3517"></path></svg>';
    icon.style.cssText = 'font-size: 48px; margin-bottom: 16px;';
    dialog.appendChild(icon);

    const title = document.createElement('h3');
    title.textContent = '文件生成完成';
    title.style.cssText = `
      margin: 0 0 12px 0;
      color: #1890ff;
      font-size: 18px;
      font-weight: 600;
    `;
    dialog.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = '树形结构已生成完成，是否立即下载文件？';
    desc.style.cssText = `
      margin: 0 0 24px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    `;
    dialog.appendChild(desc);

    const buttonContainer = this.createButtonContainer();
    buttonContainer.style.justifyContent = 'center';

    const cancelBtn = this.createButton('稍后下载', 'secondary', () => {
      document.body.removeChild(overlay);
    });

    const downloadBtn = this.createButton('立即下载', 'primary', () => {
      const downloadLink = document.createElement('a');
      downloadLink.href = result.downloadUrl;
      downloadLink.download = result.fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      document.body.removeChild(overlay);
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(downloadBtn);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    this.setupOverlayClose(overlay);
  }

  generateTreeData(data, levelField, separator, treeIdField, treePidField, workbook, sheetName) {
    const headers = data[0];
    const levelIndex = headers.indexOf(levelField);
    const treeIdIndex = headers.indexOf(treeIdField);
    const treePidIndex = headers.indexOf(treePidField);

    if (levelIndex === -1) throw new Error(`未找到层级字段: ${levelField}`);
    if (treeIdIndex === -1) throw new Error(`未找到树ID字段: ${treeIdField}`);
    if (treePidIndex === -1) throw new Error(`未找到树PID字段: ${treePidField}`);

    const rows = data.slice(1);
    const treeMap = new Map();

    rows.forEach((row) => {
      const levelPath = row[levelIndex];
      if (!levelPath && levelPath !== 0) return;

      const levelPathStr = String(levelPath).trim();
      if (!levelPathStr) return;

      const parts = levelPathStr.split(separator);
      const currentLevel = parts.length;

      const treeId = this.generateTreeId();
      let treePid = '0';

      if (currentLevel > 1) {
        const parentPath = parts.slice(0, -1).join(separator);
        treePid = treeMap.get(parentPath) || '0';
      }

      row[treeIdIndex] = treeId;
      row[treePidIndex] = treePid;
      treeMap.set(levelPathStr, treeId);
    });

    const updatedWorksheet = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = updatedWorksheet;

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    return {
      data: data,
      treeMap: treeMap,
      downloadUrl: url,
      fileName: '生成树形结构后的文件.xlsx'
    };
  }

  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  generateTreeId() {
    const user = 'sys8';
    const timestamp = Date.now().toString();
    const randomStr = this.generateRandomString(18);
    return user + timestamp + randomStr;
  }

  generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  showAlert(message) {
    alert(message);
  }
}

// 使用示例：
// const treeGenerator = new TreeStructureGenerator({
//   buttonSelector: '[originid="u_init_tree"]' // 可以传入不同的选择器
// });



//excel导入自动
// new_tree_structure_generator.js - 动态字段映射的树形结构生成器
    class NewTreeStructureGenerator {
        constructor(options = {}) {
            this.options = {
                buttonSelector: '[originid="u_init_tree"]',
                sheetJSUrl: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
                gridId: 'p_form_pre_work_template_d1',
                apiUrl: '/sup/customFrontend/getFrontendInfo',
                busType: 'pre_work_template',
                formType: 'reactpc',
                ...options
            };

            this.fieldMapping = {};
            this.gridColumns = [];
            this.isInitialized = false;

            this.init();
        }

        async init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeGenerator();
                });
            } else {
                await this.initializeGenerator();
            }
        }

        // 初始化生成器
        async initializeGenerator() {
            if (this.isInitialized) return;

            try {
                // 加载字段映射配置
                await this.loadFieldMapping();

                // 绑定按钮事件
                this.bindInitTreeButton();

                this.isInitialized = true;
                console.log('NewTreeStructureGenerator 初始化完成');
            } catch (error) {
                console.error('初始化失败:', error);
                this.showAlert('初始化失败: ' + error.message);
            }
        }

        // 从API加载字段映射配置
        async loadFieldMapping() {
            try {
                const response = await this.fetchFrontendInfo();

                if (response.status === 'success' && response.data && response.data.uiContent) {
                    const gridConfig = response.data.uiContent.grid[this.options.gridId];

                    if (gridConfig && gridConfig.columns) {
                        this.gridColumns = gridConfig.columns;
                        this.buildFieldMapping();
                    } else {
                        throw new Error(`未找到网格配置: ${this.options.gridId}`);
                    }
                } else {
                    throw new Error('API响应格式不正确');
                }
            } catch (error) {
                console.error('加载字段映射失败:', error);
                throw error;
            }
        }

        // 获取前端配置信息
        async fetchFrontendInfo() {
            const params = new URLSearchParams({
                busType: this.options.busType,
                formType: this.options.formType,
                pageType: 'list',
                needMenuName: 'false',
                orgId: '',
                isSso: '1'
            });

            const response = await fetch(`${this.options.apiUrl}?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        }

        // 构建字段映射
        buildFieldMapping() {
            this.fieldMapping = {};

            // 跳过序号列（第一个列）
            const dataColumns = this.gridColumns.slice(1);

            dataColumns.forEach(column => {
                if (column.editor && column.editor.name && column.dataIndex) {
                    this.fieldMapping[column.editor.name] = {
                        dataIndex: column.dataIndex,
                        label: column.editor.label || column.header,
                        fieldType: column.editor.xtype || 'Input',
                        required: column.editor.required || false,
                        maxLength: column.editor.maxLength,
                        hidden: column.hidden || false
                    };
                }
            });
        }

        // 获取可映射的字段列表（排除隐藏字段和系统字段）
        getMappableFields() {
            const mappableFields = {};

            Object.keys(this.fieldMapping).forEach(fieldName => {
                const fieldConfig = this.fieldMapping[fieldName];

                // 排除隐藏字段和树ID/PID字段（这些会自动生成）
                if (!fieldConfig.hidden &&
                    fieldName !== 's_tree_id' &&
                    fieldName !== 's_tree_pid') {
                    mappableFields[fieldName] = fieldConfig;
                }
            });

            return mappableFields;
        }

        // 动态加载 SheetJS 库
        loadSheetJS(callback) {
            if (typeof XLSX !== 'undefined') {
                callback();
                return;
            }

            const script = document.createElement('script');
            script.src = this.options.sheetJSUrl;
            script.onload = callback;
            script.onerror = () => {
                this.showAlert('加载 SheetJS 库失败，请检查网络连接');
            };
            document.head.appendChild(script);
        }

        // 绑定点击事件
        bindInitTreeButton() {
            const buttons = document.querySelectorAll(this.options.buttonSelector);
            if (buttons.length === 0) {
                console.warn(`未找到选择器为 "${this.options.buttonSelector}" 的按钮`);
                return;
            }

            buttons.forEach(button => {
                // 移除已存在的事件监听器
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                newButton.addEventListener('click', async () => {
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
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.xls,.xlsx,.csv';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        if (jsonData.length < 2) {
                            this.showAlert('文件内容为空或格式不正确');
                            return;
                        }

                        const headers = jsonData[0];
                        this.showImportDialog(headers, jsonData);
                    } catch (error) {
                        console.error('解析 Excel 文件失败:', error);
                        this.showAlert('解析 Excel 文件失败: ' + error.message);
                    }
                };

                reader.onerror = () => {
                    this.showAlert('读取文件失败');
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
            const dialog = this.createDialog('导入模板数据并生成树形结构');

            // 字段映射配置
            const mappingContainer = this.createFormGroup('字段映射配置：');

            const mappableFields = this.getMappableFields();

            // 动态创建字段映射
            Object.keys(mappableFields).forEach(fieldName => {
                const fieldConfig = mappableFields[fieldName];
                const fieldContainer = this.createFieldMapping(
                    fieldConfig.label,
                    headers,
                    fieldName,
                    fieldConfig.required
                );
                mappingContainer.appendChild(fieldContainer);
            });

            dialog.appendChild(mappingContainer);

            // 层级配置
            const levelConfigContainer = this.createFormGroup('层级配置：');

            // 层级字段选择
            const levelFieldContainer = this.createFormGroup('选择层级字段：');
            const levelFieldSelect = this.createSelect(headers, '--请选择层级字段--');
            levelFieldContainer.appendChild(levelFieldSelect);
            levelConfigContainer.appendChild(levelFieldContainer);

            // 分隔符输入
            const separatorContainer = this.createFormGroup('输入层级分隔符：');
            const separatorInput = this.createInput('.', '例如: .');
            separatorContainer.appendChild(separatorInput);
            levelConfigContainer.appendChild(separatorContainer);

            dialog.appendChild(levelConfigContainer);

            // 按钮容器
            const buttonContainer = this.createButtonContainer();

            const cancelBtn = this.createButton('取消', 'secondary', () => {
                document.body.removeChild(overlay);
            });

            const confirmBtn = this.createButton('确认导入', 'primary', () => {
                // 收集字段映射
                const fieldMappings = {};
                const mappingSelects = dialog.querySelectorAll('.field-mapping-select');
                mappingSelects.forEach(select => {
                    const fieldName = select.getAttribute('data-field');
                    const isRequired = select.getAttribute('data-required') === 'true';
                    fieldMappings[fieldName] = select.value;

                    // 验证必填字段
                    if (isRequired && (!select.value || select.value === '')) {
                        this.showAlert(`请配置必填字段"${select.previousElementSibling.textContent}"的映射`);
                        return;
                    }
                });

                const levelField = levelFieldSelect.value;
                const separator = separatorInput.value.trim();

                if (!levelField || !separator) {
                    this.showAlert('请填写完整的层级配置信息');
                    return;
                }

                try {
                    const treeData = this.generateTreeData(data, fieldMappings, levelField, separator);
                    this.importToGrid(treeData);
                    document.body.removeChild(overlay);
                } catch (error) {
                    console.error('生成树形结构失败:', error);
                    this.showAlert('生成失败: ' + error.message);
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
            const container = document.createElement('div');
            container.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    `;

            const label = document.createElement('label');
            label.textContent = isRequired ? `${labelText} *` : labelText;
            label.style.cssText = `
      width: 140px;
      margin-right: 12px;
      color: ${isRequired ? '#ff4d4f' : '#333'};
      font-weight: ${isRequired ? '600' : '500'};
      font-size: 14px;
    `;

            const select = this.createSelect(headers, '--请选择Excel字段--');
            select.className = 'field-mapping-select';
            select.setAttribute('data-field', fieldName);
            select.setAttribute('data-required', isRequired);
            select.style.flex = '1';

            container.appendChild(label);
            container.appendChild(select);

            return container;
        }

        createOverlay() {
            const overlay = document.createElement('div');
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
            const dialog = document.createElement('div');
            dialog.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      z-index: 1000;
      width: 560px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      border: 1px solid #e6f7ff;
    `;

            const titleEl = document.createElement('h3');
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
            const container = document.createElement('div');
            container.style.marginBottom = '20px';

            const label = document.createElement('label');
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
            const select = document.createElement('select');
            select.style.cssText = `
      width: 100%;
      padding: 10px 12px;
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

            select.addEventListener('focus', () => {
                select.style.borderColor = '#1890ff';
                select.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
            });

            select.addEventListener('blur', () => {
                select.style.borderColor = '#d9d9d9';
                select.style.boxShadow = 'none';
            });

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = placeholder;
            emptyOption.selected = true;
            select.appendChild(emptyOption);

            headers.forEach(header => {
                if (header && header.trim() !== '') {
                    const option = document.createElement('option');
                    option.value = header;
                    option.textContent = header;
                    select.appendChild(option);
                }
            });

            return select;
        }

        createInput(value = '', placeholder = '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.value = value;
            input.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      box-sizing: border-box;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s;
    `;

            input.addEventListener('focus', () => {
                input.style.borderColor = '#1890ff';
                input.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
            });

            input.addEventListener('blur', () => {
                input.style.borderColor = '#d9d9d9';
                input.style.boxShadow = 'none';
            });

            return input;
        }

        createButtonContainer() {
            const container = document.createElement('div');
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

        createButton(text, type = 'primary', onClick) {
            const button = document.createElement('button');
            button.textContent = text;

            const baseStyles = `
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
      border: none;
    `;

            if (type === 'primary') {
                button.style.cssText = baseStyles + `
        background: #1890ff;
        color: white;
      `;
                button.addEventListener('mouseover', () => {
                    button.style.background = '#40a9ff';
                });
                button.addEventListener('mouseout', () => {
                    button.style.background = '#1890ff';
                });
            } else {
                button.style.cssText = baseStyles + `
        border: 1px solid #d9d9d9;
        background: white;
        color: #666;
      `;
                button.addEventListener('mouseover', () => {
                    button.style.borderColor = '#1890ff';
                    button.style.color = '#1890ff';
                });
                button.addEventListener('mouseout', () => {
                    button.style.borderColor = '#d9d9d9';
                    button.style.color = '#666';
                });
            }

            button.onclick = onClick;
            return button;
        }

        setupOverlayClose(overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            });
        }

        // 在 generateTreeData 方法中添加字段值处理逻辑
generateTreeData(data, fieldMappings, levelField, separator) {
    const headers = data[0];
    const rows = data.slice(1);
    const treeMap = new Map();
    const treeData = [];

    // 获取字段在Excel中的索引
    const fieldIndexes = {};
    Object.keys(fieldMappings).forEach(field => {
        if (fieldMappings[field]) {
            fieldIndexes[field] = headers.indexOf(fieldMappings[field]);
        }
    });

    const levelIndex = headers.indexOf(levelField);

    if (levelIndex === -1) throw new Error(`未找到层级字段: ${levelField}`);

    // 处理每一行数据
    rows.forEach((row, index) => {
        const levelPath = row[levelIndex];
        if (!levelPath && levelPath !== 0) return;

        const levelPathStr = String(levelPath).trim();
        if (!levelPathStr) return;

        const parts = levelPathStr.split(separator);
        const currentLevel = parts.length;

        const treeId = this.new_generateTreeId();
        let treePid = '0';

        if (currentLevel > 1) {
            const parentPath = parts.slice(0, -1).join(separator);
            treePid = treeMap.get(parentPath) || '0';
        }

        // 构建树节点数据
        const nodeData = {
            s_tree_id: treeId,
            s_tree_pid: treePid
        };

        // 映射其他字段
        Object.keys(fieldIndexes).forEach(field => {
            const excelIndex = fieldIndexes[field];
            if (excelIndex !== -1 && row[excelIndex] !== undefined) {
                const rawValue = row[excelIndex];
                
                // 处理字段值
                const processedValues = this.processFieldValue(field, rawValue);
                
                // 将处理后的值设置到节点数据中
                Object.keys(processedValues).forEach(key => {
                    nodeData[key] = processedValues[key];
                });
            } else {
                // 如果Excel中没有对应字段，设置为空值
                nodeData[field] = '';
            }
        });

        treeData.push(nodeData);
        treeMap.set(levelPathStr, treeId);
    });

    return treeData;
}

// 新增字段值处理方法
processFieldValue(fieldName, rawValue) {
    const result = {};
    
    // 如果原始值为空或未定义，直接返回空值
    if (rawValue === null || rawValue === undefined || rawValue === '') {
        result[fieldName] = '';
        return result;
    }

    const stringValue = String(rawValue).trim();
    
    // 处理格式1: "值|显示文本" (如 "2|修订中")
    if (stringValue.includes('|') && stringValue.split('|').length === 2) {
        const [value, displayText] = stringValue.split('|');
        result[fieldName] = value.trim(); // 只取第一部分的值
        
        // 如果是特定字段，可能需要额外处理
        // 这里可以根据具体业务需求添加特殊逻辑
        
    } 
    // 处理格式2: "值1|值2|显示文本" (如 "3100000000031806|00001|胡均")
    else if (stringValue.includes('|') && stringValue.split('|').length === 3) {
        const [mainValue, subValue, displayText] = stringValue.split('|');
        
        // 主字段取第一个值
        result[fieldName] = mainValue.trim();
        
        // 为同名字段添加 _EXName 后缀存储显示文本
        const exNameField = `${fieldName}_EXName`;
        result[exNameField] = displayText.trim();
        
        // 如果需要，也可以存储第二个值
        // const subValueField = `${fieldName}_SubValue`;
        // result[subValueField] = subValue.trim();
        
    }
    // 其他格式，直接使用原值
    else {
        result[fieldName] = stringValue;
    }

    return result;
}

// 在 buildFieldMapping 方法中也需要考虑 _EXName 字段的映射
buildFieldMapping() {
    this.fieldMapping = {};

    // 跳过序号列（第一个列）
    const dataColumns = this.gridColumns.slice(1);

    dataColumns.forEach(column => {
        if (column.editor && column.editor.name && column.dataIndex) {
            this.fieldMapping[column.editor.name] = {
                dataIndex: column.dataIndex,
                label: column.editor.label || column.header,
                fieldType: column.editor.xtype || 'Input',
                required: column.editor.required || false,
                maxLength: column.editor.maxLength,
                hidden: column.hidden || false
            };

            // 如果是可能需要 _EXName 后缀的字段，预先在映射中考虑
            // 这里可以根据业务需求标记哪些字段可能需要这种处理
            if (this.isFieldLikelyToHaveEXName(column.editor.name)) {
                const exNameField = `${column.editor.name}_EXName`;
                this.fieldMapping[exNameField] = {
                    dataIndex: `${column.dataIndex}_EXName`,
                    label: `${column.editor.label || column.header} (显示名称)`,
                    fieldType: 'Input',
                    required: false,
                    hidden: column.hidden || false
                };
            }
        }
    });
}

// 辅助方法：判断字段是否可能需要 _EXName 后缀
isFieldLikelyToHaveEXName(fieldName) {
    // 根据字段名判断，这里可以根据实际业务需求调整
    const exNameLikelyFields = [
        's_person', 'person', 's_user', 'user', 's_employee', 'employee',
        's_dept', 'dept', 's_department', 'department',
        's_supplier', 'supplier', 's_customer', 'customer'
    ];
    
    return exNameLikelyFields.some(pattern => 
        fieldName.toLowerCase().includes(pattern.toLowerCase())
    );
}

// 在 getMappableFields 方法中也需要包含 _EXName 字段
getMappableFields() {
    const mappableFields = {};

    Object.keys(this.fieldMapping).forEach(fieldName => {
        const fieldConfig = this.fieldMapping[fieldName];

        // 排除隐藏字段和树ID/PID字段（这些会自动生成）
        if (!fieldConfig.hidden &&
            fieldName !== 's_tree_id' &&
            fieldName !== 's_tree_pid' &&
            !fieldName.endsWith('_EXName')) { // 暂时排除 _EXName 字段，因为它们会自动生成
            mappableFields[fieldName] = fieldConfig;
        }
    });

    return mappableFields;
}

        new_generateTreeId() {
            const user = 'sys8';
            const timestamp = Date.now().toString();
            const randomStr = this.new_generateRandomString(18);
            return user + timestamp + randomStr;
        }

        new_generateRandomString(length) {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        /**
         * 将扁平数组转换为树形结构
         * @param {Array} list 扁平数组
         * @param {Object} options 配置项
         * @param {string} options.idKey ID字段名，默认为 's_tree_id'
         * @param {string} options.parentKey 父ID字段名，默认为 's_tree_pid'
         * @param {string} options.childrenKey 子节点字段名，默认为 'children'
         * @returns {Array} 树形结构数组
         */
        new_listToTree(list, options = {}) {
            const {
                idKey = 's_tree_id',
                parentKey = 's_tree_pid',
                childrenKey = 'children'
            } = options;

            // 使用reduce构建节点映射
            const nodeMap = list.reduce((acc, node) => {
                acc[node[idKey]] = {
                    ...node,
                    [childrenKey]: []
                };
                return acc;
            }, {});

            // 使用reduce构建树形结构
            return list.reduce((tree, node) => {
                const currentNode = nodeMap[node[idKey]];
                const parentId = node[parentKey];

                if (parentId && nodeMap[parentId]) {
                    // 如果有父节点，将当前节点添加到父节点的children数组中
                    nodeMap[parentId][childrenKey].push(currentNode);
                } else {
                    // 如果没有父节点，说明是根节点
                    tree.push(currentNode);
                }
                return tree;
            }, []);
        }

        // 导入数据到网格
        importToGrid(treeData) {
            try {
                const D1_FORM = this.options.gridId;
                const dgrid = $NG.getCmpApi(D1_FORM);

                if (!dgrid) {
                    throw new Error('未找到明细网格组件');
                }

                // 转换为树形结构
                const treeStructure = this.new_listToTree(treeData);

                // 添加到网格
                dgrid.addRows(treeStructure).then(() => {
                    this.showAlert('导入成功！');
                }).catch((error) => {
                    console.error('导入失败:', error);
                    this.showAlert('导入失败：' + error.message);
                });

            } catch (error) {
                console.error('导入数据到网格失败:', error);
                this.showAlert('导入失败：' + error.message);
            }
        }

        showAlert(message) {
            if (typeof $NG !== 'undefined' && $NG.alert) {
                $NG.alert(message);
            } else {
                alert(message);
            }
        }
    }