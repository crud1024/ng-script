/**
 * 数据变更比较器类 - 用于比较和可视化数据变更结果
 * 使用wordcloud2.js开源库渲染彩色词云
 * 成功 -> 优雅蓝绿色 (#85caef)，失败 -> 柔和珊瑚粉 (#FFA07A)
 * 加入UI设计师审美的视觉效果
 */

class DataChangeComparator {
  /**
   * 创建数据变更比较器实例
   * @param {string|HTMLElement} container - 容器ID或DOM元素
   * @param {Object} config - 配置选项
   */
  constructor(container, config = {}) {
    // 容器设置
    this.container =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!this.container) {
      throw new Error(`容器不存在: ${container}`);
    }

    // UI设计师推荐的优雅配色
    this.config = {
      // 颜色配置 - 美观的配色方案
      colors: {
        success: "#85caef", // 优雅蓝绿色
        error: "#FFA07A", // 柔和珊瑚粉
        successLight: "#7FFFD4", // 浅绿色（用于渐变）
        errorLight: "#FFB6C1", // 浅粉色（用于渐变）
      },
      // 权重配置 - 调整权重使视觉效果更好
      weights: {
        success: 22,
        error: 18,
      },
      // 词云配置 - 优化视觉效果
      wordcloud: {
        gridSize: 16, // 增大网格间距，避免过于拥挤
        rotateRatio: 0.2, // 减少旋转比例，让文字更易读
        shape: "circle", // 圆形布局
        ellipticity: 0.7, // 椭圆度
        fontFamily:
          '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif',
        backgroundColor: "#F8F9FA", // 极浅灰背景
        borderColor: "#E9ECEF", // 浅灰边框
        minFontSize: 14,
        maxFontSize: 72,
        fontWeight: 500, // 中等字重
        textShadow: "0 2px 4px rgba(0,0,0,0.1)", // 文字阴影
      },
      // CDN配置
      cdn: {
        primary:
          "https://cdnjs.cloudflare.com/ajax/libs/wordcloud2.js/1.0.6/wordcloud2.min.js",
        backup:
          "https://cdn.jsdelivr.net/npm/wordcloud@1.2.0/src/wordcloud2.min.js",
      },
      // 其他配置
      showStats: true,
      autoLoadLibrary: true,
      enableAnimation: true, // 启用动画效果
      onRenderStart: null,
      onRenderComplete: null,
      onRenderError: null,
      ...config,
    };

    // 内部状态
    this._libraryLoaded = false;
    this._loading = false;
    this._loadingCallbacks = [];
    this._currentResponse = null;
    this._words = null;
    this._instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
    this._animationFrame = null;

    // 如果配置了自动加载库，则开始加载
    if (this.config.autoLoadLibrary) {
      this.loadLibrary();
    }
  }

  /**
   * 加载wordcloud2.js库
   * @param {Function} callback - 加载完成回调
   */
  loadLibrary(callback) {
    // 如果库已加载，直接执行回调
    if (typeof WordCloud !== "undefined") {
      this._libraryLoaded = true;
      if (callback) callback(null);
      return;
    }

    // 保存回调
    if (callback) {
      this._loadingCallbacks.push(callback);
    }

    // 如果已经在加载中，不再重复加载
    if (this._loading) return;
    this._loading = true;

    const loadScript = (url, isBackup = false) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;

      script.onload = () => {
        this._libraryLoaded = true;
        this._loading = false;
        // 执行所有等待的回调
        this._loadingCallbacks.forEach((cb) => cb(null));
        this._loadingCallbacks = [];
      };

      script.onerror = () => {
        if (!isBackup) {
          console.warn("主CDN加载失败，尝试备用CDN...");
          loadScript(this.config.cdn.backup, true);
        } else {
          this._loading = false;
          const error = new Error("词云库加载失败，请检查网络");
          this._loadingCallbacks.forEach((cb) => cb(error));
          this._loadingCallbacks = [];

          if (this.container) {
            this._showError("词云库加载失败，请刷新重试");
          }
        }
      };

      document.head.appendChild(script);
    };

    loadScript(this.config.cdn.primary);
  }

  /**
   * 显示错误信息（美化版）
   * @private
   */
  _showError(message) {
    console.log(message);
    this.container.innerHTML = `
<div style="
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
">
  <svg style="width: 60px; height: 60px; margin-bottom: 20px; color: #bbb;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2v4m0 12v4m-8-8H2m20 0h-2m-2-6.24A7.12 7.12 0 0 0 19 8a7 7 0 0 0-14 0c0 1.76.65 3.36 1.71 4.6"></path>
    <path d="M7.21 15.26A6.972 6.972 0 0 0 12 20a6.972 6.972 0 0 0 4.79-4.74"></path>
  </svg>
  <h3 style="margin: 0 0 8px 0; font-weight: 500; color: #444;">组织迁移中</h3>
  <p style="margin: 0; font-size: 14px; line-height: 1.5; max-width: 300px;">
    正在处理迁移信息
  </p>
  <div style="margin-top: 20px; width: 120px; height: 4px; background: #eaeaea; border-radius: 2px; overflow: hidden;">
    <div style="width: 40%; height: 100%; background: #4dabf7; border-radius: 2px; animation: loading 2s ease-in-out infinite;"></div>
  </div>
</div>
<style>
  @keyframes loading {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(200%); }
  }
</style>
`;
  }

  /**
   * 显示加载中（美化版）
   * @private
   */
  _showLoading() {
    this.container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                min-height: 200px;
                background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
                border-radius: 12px;
                border: 1px solid #e9ecef;
                padding: 24px;
                text-align: center;
                color: #6c757d;
                font-family: 'Microsoft YaHei', sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            ">
                <div>
                    <div style="
                        width: 40px;
                        height: 40px;
                        margin: 0 auto 16px;
                        border: 3px solid #e9ecef;
                        border-top-color: #85caef;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <div style="font-size: 14px; color: #6c757d;">正在加载词云库...</div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
  }

  /**
   * 显示空数据（美化版）
   * @private
   */
  _showEmpty() {
    this.container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                min-height: 200px;
                background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
                border-radius: 12px;
                border: 1px solid #e9ecef;
                padding: 24px;
                text-align: center;
                color: #adb5bd;
                font-family: 'Microsoft YaHei', sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            ">
                <div>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" stroke-width="1.5" style="margin-bottom: 12px;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                    <div style="font-size: 14px;">没有可显示的词云数据</div>
                </div>
            </div>
        `;
  }

  /**
   * 解析响应数据 - 支持多种数据格式
   * @param {Object} responseData - 输入数据
   * @returns {Array} 解析后的词云数据
   */
  parseData(responseData) {
    let parsedData = responseData;

    // 情况1: 数据直接是 {success: [...], errors: [...]} 格式
    if (
      responseData &&
      (Array.isArray(responseData.success) ||
        Array.isArray(responseData.errors))
    ) {
      parsedData = responseData;
    }
    // 情况2: 数据是 {IsOk: true, Message: "{\"success\":[...]}"} 格式
    else if (responseData && responseData.Message) {
      try {
        parsedData = JSON.parse(responseData.Message);
      } catch (e) {
        throw new Error("Message字段JSON解析失败");
      }
    }
    // 情况3: 数据本身就是字符串
    else if (typeof responseData === "string") {
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        throw new Error("数据字符串解析失败");
      }
    } else {
      throw new Error("无法识别的数据格式");
    }

    if (!parsedData.success && !parsedData.errors) {
      throw new Error("数据格式不正确，需要包含success和/或errors数组");
    }

    const wordItems = [];
    const { colors, weights } = this.config;

    // 处理成功列表
    if (Array.isArray(parsedData.success)) {
      parsedData.success.forEach((item) => {
        let tableName = item;
        if (item && typeof item === "object") {
          tableName = item.tableName || item.name || JSON.stringify(item);
        }

        if (tableName && String(tableName).trim()) {
          wordItems.push([
            String(tableName).trim(),
            weights.success,
            colors.success,
          ]);
        }
      });
    }

    // 处理错误列表
    if (Array.isArray(parsedData.errors)) {
      parsedData.errors.forEach((errMsg) => {
        const tableName = this._extractTableNameFromError(errMsg);
        if (tableName) {
          wordItems.push([tableName, weights.error, colors.error]);
        }
      });
    }

    // 去重并合并权重
    return this._deduplicateWords(wordItems);
  }

  /**
   * 从错误消息中提取表名
   * @private
   */
  _extractTableNameFromError(errMsg) {
    if (!errMsg) return null;

    const errStr = String(errMsg);

    // 错误消息格式: "迁移xxx错误：\n### Error updating "
    const match = errStr.match(/^迁移([a-zA-Z0-9_]+)错误/);
    if (match && match[1]) {
      return match[1];
    }

    // 尝试匹配 "同步xxx错误"
    const syncMatch = errStr.match(/^同步([a-zA-Z0-9_]+)错误/);
    if (syncMatch && syncMatch[1]) {
      return syncMatch[1];
    }

    // 尝试提取第一个合法的表名
    const words = errStr.split(/[\s:：\n]/);
    for (let word of words) {
      if (word && word.length > 0 && /^[a-zA-Z0-9_]+$/.test(word)) {
        return word;
      }
    }

    return null;
  }

  /**
   * 去重并合并权重
   * @private
   */
  _deduplicateWords(wordItems) {
    const wordMap = new Map();

    wordItems.forEach(([text, weight, color]) => {
      if (!wordMap.has(text) || wordMap.get(text)[1] < weight) {
        wordMap.set(text, [text, weight, color]);
      }
    });

    return Array.from(wordMap.values());
  }

  /**
   * 计算权重到字体大小的映射函数
   * @private
   */
  _createWeightFactor() {
    const words = this._words;
    const minWeight = Math.min(...words.map((w) => w[1]));
    const maxWeight = Math.max(...words.map((w) => w[1]));
    const range = maxWeight - minWeight || 1;
    const { minFontSize, maxFontSize } = this.config.wordcloud;

    return (weight) => {
      const normalized = (weight - minWeight) / range;
      // 使用非线性映射让权重差异更明显
      const curved = Math.pow(normalized, 0.8);
      return Math.round(minFontSize + curved * (maxFontSize - minFontSize));
    };
  }

  /**
   * 渲染词云
   * @param {Object} responseData - 输入数据
   * @param {Function} callback - 渲染完成回调 (error, result)
   */
  render(responseData, callback) {
    try {
      // 触发渲染开始回调
      if (this.config.onRenderStart) {
        this.config.onRenderStart();
      }

      // 保存数据
      this._currentResponse = responseData;

      // 解析数据
      this._words = this.parseData(responseData);

      if (this._words.length === 0) {
        this._showEmpty();
        const emptyResult = {
          words: [],
          successCount: 0,
          errorCount: 0,
          total: 0,
          successTables: [],
          errorTables: [],
        };
        if (callback) callback(null, emptyResult);
        if (this.config.onRenderComplete)
          this.config.onRenderComplete(emptyResult);
        return;
      }

      // 显示加载中
      this._showLoading();

      // 加载库并渲染
      this.loadLibrary((error) => {
        if (error) {
          this._handleError(error, callback);
          return;
        }

        try {
          this._renderCanvas();

          const result = {
            words: this._words,
            successCount: this._getSuccessCount(),
            errorCount: this._getErrorCount(),
            total: this._words.length,
            successTables: this.getSuccessTables(),
            errorTables: this.getErrorTables(),
          };

          console.log(
            `[${this._instanceId}] 词云渲染完成，成功: ${result.successCount}个，失败: ${result.errorCount}个`,
          );

          if (callback) callback(null, result);
          if (this.config.onRenderComplete)
            this.config.onRenderComplete(result);
        } catch (renderError) {
          this._handleError(renderError, callback);
        }
      });
    } catch (error) {
      this._handleError(error, callback);
    }
  }

  /**
   * 处理错误
   * @private
   */
  _handleError(error, callback) {
    console.error(`[${this._instanceId}] 渲染失败:`, error);
    this._showError(error.message);

    if (callback) callback(error);
    if (this.config.onRenderError) this.config.onRenderError(error);
  }

  /**
   * 获取成功数量
   * @private
   */
  _getSuccessCount() {
    if (!this._words) return 0;
    return this._words.filter((w) => w[2] === this.config.colors.success)
      .length;
  }

  /**
   * 获取失败数量
   * @private
   */
  _getErrorCount() {
    if (!this._words) return 0;
    return this._words.filter((w) => w[2] === this.config.colors.error).length;
  }

  /**
   * 渲染画布 - 美化版
   * @private
   */
  _renderCanvas() {
    // 清空容器
    this.container.innerHTML = "";

    // 创建外层容器（用于美化）
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            border: 1px solid rgba(255,255,255,0.5);
            backdrop-filter: blur(10px);
        `;

    this.container.appendChild(wrapper);

    // 计算画布尺寸
    const containerWidth = wrapper.clientWidth || 800;
    const containerHeight = wrapper.clientHeight || 400;

    // 创建canvas
    const canvas = document.createElement("canvas");
    canvas.width = containerWidth - 40;
    canvas.height = containerHeight - (this.config.showStats ? 80 : 40);
    canvas.style.cssText = `
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            display: block;
        `;

    wrapper.appendChild(canvas);

    // 配置词云选项
    const options = {
      list: this._words,
      gridSize: this.config.wordcloud.gridSize,
      weightFactor: this._createWeightFactor(),
      fontFamily: this.config.wordcloud.fontFamily,
      fontWeight: this.config.wordcloud.fontWeight,
      color: (word, weight, fontSize, index) => {
        return this._words[index][2];
      },
      rotateRatio: this.config.wordcloud.rotateRatio,
      minRotation: -0.3,
      maxRotation: 0.3,
      backgroundColor: "transparent",
      shape: this.config.wordcloud.shape,
      ellipticity: this.config.wordcloud.ellipticity,
      shuffle: false,
      weightMode: "size",
      hover: null,
      click: null,
    };

    // 执行渲染
    WordCloud(canvas, options);

    // 添加统计信息卡片
    if (this.config.showStats) {
      this._renderStatsCard(wrapper);
    }
  }

  /**
   * 渲染统计信息卡片 - 美观版
   * @private
   */
  _renderStatsCard(wrapper) {
    const successCount = this._getSuccessCount();
    const errorCount = this._getErrorCount();
    const total = successCount + errorCount;

    const statsCard = document.createElement("div");
    statsCard.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.03);
            font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
        `;

    // 左侧统计信息
    const statsLeft = document.createElement("div");
    statsLeft.style.cssText = `
            display: flex;
            gap: 24px;
            align-items: center;
        `;

    // 总计
    const totalEl = document.createElement("div");
    totalEl.style.cssText = `
            display: flex;
            align-items: baseline;
            gap: 6px;
        `;
    totalEl.innerHTML = `
            <span style="font-size: 13px; color: #6c757d;">总计</span>
            <span style="font-size: 20px; font-weight: 600; color: #212529;">${total}</span>
        `;

    // 成功
    const successEl = document.createElement("div");
    successEl.style.cssText = `
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding-left: 16px;
            border-left: 1px solid #e9ecef;
        `;
    successEl.innerHTML = `
            <span style="font-size: 13px; color: #6c757d;">成功</span>
            <span style="font-size: 20px; font-weight: 600; color: ${this.config.colors.success};">${successCount}</span>
        `;

    // 失败
    const errorEl = document.createElement("div");
    errorEl.style.cssText = `
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding-left: 16px;
            border-left: 1px solid #e9ecef;
        `;
    errorEl.innerHTML = `
            <span style="font-size: 13px; color: #6c757d;">失败</span>
            <span style="font-size: 20px; font-weight: 600; color: ${this.config.colors.error};">${errorCount}</span>
        `;

    statsLeft.appendChild(totalEl);
    statsLeft.appendChild(successEl);
    statsLeft.appendChild(errorEl);

    // 右侧颜色说明
    const legend = document.createElement("div");
    legend.style.cssText = `
            display: flex;
            gap: 16px;
            align-items: center;
        `;

    legend.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 12px; height: 12px; background: ${this.config.colors.success}; border-radius: 4px; box-shadow: 0 2px 4px rgba(72, 209, 204, 0.3);"></span>
                <span style="font-size: 13px; color: #495057;">成功表</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 12px; height: 12px; background: ${this.config.colors.error}; border-radius: 4px; box-shadow: 0 2px 4px rgba(255, 160, 122, 0.3);"></span>
                <span style="font-size: 13px; color: #495057;">失败表</span>
            </div>
        `;

    statsCard.appendChild(statsLeft);
    statsCard.appendChild(legend);

    wrapper.appendChild(statsCard);
  }

  /**
   * 重新渲染（使用相同的数据）
   * @param {Function} callback - 渲染完成回调
   */
  refresh(callback) {
    if (this._currentResponse) {
      this.render(this._currentResponse, callback);
    }
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  /**
   * 清除渲染内容
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = "";
    }
    this._words = null;
  }

  /**
   * 销毁实例
   */
  destroy() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
    this.clear();
    this.container = null;
    this._currentResponse = null;
    this._words = null;
    this._loadingCallbacks = [];
  }

  /**
   * 获取当前词云数据
   * @returns {Array} 词云数据
   */
  getWords() {
    return this._words ? [...this._words] : [];
  }

  /**
   * 获取成功列表
   * @returns {Array} 成功表名数组
   */
  getSuccessTables() {
    if (!this._words) return [];
    return this._words
      .filter((w) => w[2] === this.config.colors.success)
      .map((w) => w[0]);
  }

  /**
   * 获取失败列表
   * @returns {Array} 失败表名数组
   */
  getErrorTables() {
    if (!this._words) return [];
    return this._words
      .filter((w) => w[2] === this.config.colors.error)
      .map((w) => w[0]);
  }
}
// 暴露到全局
if (typeof window !== "undefined") {
  window.DataChangeComparator = DataChangeComparator;
}
// ==================== 使用示例 ====================

// 使用方式：
// const comparator = new DataChangeComparator('u:db51c830710c');
// const responseData = mstform.getValues().u_response;
// comparator.render(responseData, (error, result) => {
//     if (error) {
//         console.error('渲染失败', error);
//     } else {
//         console.log('渲染成功', result);
//     }
// });
