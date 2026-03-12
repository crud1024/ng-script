/**
 * 数据变更比较器类 - 用于比较和可视化数据变更结果
 * 使用wordcloud2.js开源库渲染彩色词云
 * 成功 -> #85caef，失败 -> #c6f3ff
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

    // 默认配置
    this.config = {
      // 颜色配置 - 更新为新颜色
      colors: {
        success: "#85caef", // 成功颜色
        error: "#c6f3ff", // 失败颜色
      },
      // 权重配置
      weights: {
        success: 20,
        error: 15,
      },
      // 词云配置
      wordcloud: {
        gridSize: 12,
        rotateRatio: 0.3,
        shape: "circle",
        ellipticity: 0.7,
        fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
        backgroundColor: "#f9f9f9",
        borderColor: "#ccc",
        minFontSize: 12,
        maxFontSize: 60,
      },
      // CDN配置
      cdn: {
        primary:
          "https://cdnjs.cloudflare.com/ajax/libs/wordcloud2.js/1.0.6/wordcloud2.min.js",
        backup:
          "https://cdn.jsdelivr.net/npm/wordcloud@1.2.0/src/wordcloud2.min.js",
      },
      // 其他配置 - 关闭图例显示
      showLegend: false,
      showStats: true,
      autoLoadLibrary: true,
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
            this.container.innerHTML =
              '<div style="color:red; padding:20px;">错误：词云库加载失败，请刷新重试</div>';
          }
        }
      };

      document.head.appendChild(script);
    };

    loadScript(this.config.cdn.primary);
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
      return minFontSize + normalized * (maxFontSize - minFontSize);
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
        this.container.innerHTML =
          '<div style="text-align:center; padding:40px; color:#666;">没有可显示的词云数据</div>';
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
      this.container.innerHTML =
        '<div style="text-align:center; padding:40px; color:#666;">正在加载词云库...</div>';

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
    this.container.innerHTML = `<div style="color:red; padding:20px;">渲染失败：${error.message}</div>`;

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
   * 渲染画布
   * @private
   */
  _renderCanvas() {
    // 清空容器
    this.container.innerHTML = "";

    // 计算画布尺寸
    const containerWidth = this.container.clientWidth || 800;
    const containerHeight = this.container.clientHeight || 400;

    // 创建canvas
    const canvas = document.createElement("canvas");
    canvas.width = containerWidth - 20;
    canvas.height = containerHeight - (this.config.showStats ? 60 : 20); // 只给统计信息留空间
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.border = `1px solid ${this.config.wordcloud.borderColor}`;
    canvas.style.borderRadius = "4px";
    canvas.style.backgroundColor = this.config.wordcloud.backgroundColor;

    this.container.appendChild(canvas);

    // 配置词云选项
    const options = {
      list: this._words,
      gridSize: this.config.wordcloud.gridSize,
      weightFactor: this._createWeightFactor(),
      fontFamily: this.config.wordcloud.fontFamily,
      color: (word, weight, fontSize, index) => {
        return this._words[index][2];
      },
      rotateRatio: this.config.wordcloud.rotateRatio,
      minRotation: -0.5,
      maxRotation: 0.5,
      backgroundColor: this.config.wordcloud.backgroundColor,
      shape: this.config.wordcloud.shape,
      ellipticity: this.config.wordcloud.ellipticity,
      shuffle: false,
      weightMode: "size",
    };

    // 执行渲染
    WordCloud(canvas, options);

    // 添加统计信息（只保留统计信息，移除了图例）
    if (this.config.showStats) {
      this._renderStats();
    }
  }

  /**
   * 渲染统计信息 - 简化版本，移除了颜色方块
   * @private
   */
  _renderStats() {
    const stats = document.createElement("div");
    stats.style.marginTop = "10px";
    stats.style.padding = "8px 12px";
    stats.style.fontFamily = "Arial, sans-serif";
    stats.style.fontSize = "13px";
    stats.style.backgroundColor = "#f5f5f5";
    stats.style.border = `1px solid ${this.config.wordcloud.borderColor}`;
    stats.style.borderRadius = "4px";

    const successCount = this._getSuccessCount();
    const errorCount = this._getErrorCount();
    const total = successCount + errorCount;

    stats.innerHTML = `
            <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
                <span style="font-weight:bold;">统计:</span>
                <span style="color:#333;">成功: ${successCount}</span>
                <span style="color:#333;">失败: ${errorCount}</span>
                <span style="color:#999;">总计: ${total}</span>
            </div>
        `;

    this.container.insertBefore(stats, this.container.firstChild);
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
