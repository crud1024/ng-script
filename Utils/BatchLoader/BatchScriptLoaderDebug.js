class ScriptLoader {
  constructor() {
    this.scripts = [];
    this.currentIndex = 0;
    this.options = {
      parallel: false, // 是否并行加载
      stopOnError: false, // 出错时是否停止
      onProgress: null, // 进度回调
      onComplete: null, // 完成回调
      onError: null, // 错误回调
    };
  }

  /**
   * 添加要加载的脚本
   * @param {string|string[]} urls - 单个 URL 或 URL 数组
   * @returns {ScriptLoader} 返回 this 支持链式调用
   */
  add(urls) {
    if (Array.isArray(urls)) {
      this.scripts = this.scripts.concat(urls);
    } else {
      this.scripts.push(urls);
    }
    return this;
  }

  /**
   * 设置配置选项
   * @param {Object} options
   * @param {boolean} options.parallel - 是否并行加载（默认 false）
   * @param {boolean} options.stopOnError - 出错是否停止（默认 false）
   * @returns {ScriptLoader}
   */
  config(options) {
    Object.assign(this.options, options);
    return this;
  }

  /**
   * 进度回调
   * @param {Function} callback - (loaded, total, url) => void
   * @returns {ScriptLoader}
   */
  progress(callback) {
    this.options.onProgress = callback;
    return this;
  }

  /**
   * 完成回调
   * @param {Function} callback - () => void
   * @returns {ScriptLoader}
   */
  complete(callback) {
    this.options.onComplete = callback;
    return this;
  }

  /**
   * 错误回调
   * @param {Function} callback - (error, url) => void
   * @returns {ScriptLoader}
   */
  error(callback) {
    this.options.onError = callback;
    return this;
  }

  /**
   * 执行加载
   * @returns {Promise} 返回 Promise 对象
   */
  load() {
    return new Promise((resolve, reject) => {
      if (this.scripts.length === 0) {
        resolve([]);
        return;
      }

      if (this.options.parallel) {
        this._loadParallel(resolve, reject);
      } else {
        this._loadSequential(resolve, reject);
      }
    });
  }

  /**
   * 顺序加载（链式）
   */
  _loadSequential(resolve, reject) {
    let loaded = 0;
    const total = this.scripts.length;
    const errors = [];

    const loadNext = (index) => {
      if (index >= total) {
        this._triggerComplete(resolve, errors);
        return;
      }

      const url = this.scripts[index];

      $NG.loadScript(
        url,
        () => {
          loaded++;
          this._triggerProgress(loaded, total, url);
          console.log(`✅ [${loaded}/${total}] 加载成功:`, url);
          loadNext(index + 1);
        },
        (error) => {
          loaded++;
          errors.push({ url, error });
          this._triggerProgress(loaded, total, url);
          console.error(`❌ [${loaded}/${total}] 加载失败:`, url, error);

          if (this.options.stopOnError) {
            this._triggerError(error, url);
            reject(new Error(`脚本加载失败: ${url}`));
          } else {
            loadNext(index + 1);
          }
        },
      );
    };

    loadNext(0);
  }

  /**
   * 并行加载
   */
  _loadParallel(resolve, reject) {
    let loaded = 0;
    const total = this.scripts.length;
    const errors = [];

    this.scripts.forEach((url) => {
      $NG.loadScript(
        url,
        () => {
          loaded++;
          this._triggerProgress(loaded, total, url);
          console.log(`[${loaded}/${total}] 加载成功:`, url);

          if (loaded === total) {
            this._triggerComplete(resolve, errors);
          }
        },
        (error) => {
          loaded++;
          errors.push({ url, error });
          this._triggerProgress(loaded, total, url);
          console.error(`❌ [${loaded}/${total}] 加载失败:`, url, error);

          if (this.options.stopOnError) {
            this._triggerError(error, url);
            reject(new Error(`脚本加载失败: ${url}`));
          } else if (loaded === total) {
            this._triggerComplete(resolve, errors);
          }
        },
      );
    });
  }

  /**
   * 触发进度回调
   */
  _triggerProgress(loaded, total, url) {
    if (this.options.onProgress) {
      this.options.onProgress(loaded, total, url);
    }
  }

  /**
   * 触发完成回调
   */
  _triggerComplete(resolve, errors) {
    if (errors.length > 0) {
      console.warn(`加载完成，但有 ${errors.length} 个失败`);
    } else {
      console.log("Batch加载成功！");
    }

    if (this.options.onComplete) {
      this.options.onComplete(errors);
    }
    resolve(errors);
  }

  /**
   * 触发错误回调
   */
  _triggerError(error, url) {
    if (this.options.onError) {
      this.options.onError(error, url);
    }
  }

  /**
   * 重置加载器
   * @returns {ScriptLoader}
   */
  reset() {
    this.scripts = [];
    this.currentIndex = 0;
    return this;
  }

  /**
   * 静态方法：快速加载
   */
  static load(urls, options = {}) {
    const loader = new ScriptLoader();
    loader.add(urls).config(options);
    return loader.load();
  }
}

// 暴露到全局（浏览器环境）
if (typeof window !== "undefined") {
  window.ScriptLoader = ScriptLoader;
  window.createScriptLoader = function (options) {
    return new ScriptLoader().config(options || {});
  };
  window.loadScripts = function (urls, options) {
    return ScriptLoader.load(urls, options);
  };
}

// 创建加载器并链式调用
// const loader = new ScriptLoader();

// loader
//     .add([
//         "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Sidebar/V1/zjky-sidebar.js",
//         "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Tree/V1/Tree.js",
//         "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/EL/ShowOrHide/EL.js"
//     ])
//     .progress((loaded, total, url) => {
//         console.log(`加载进度: ${loaded}/${total} - ${url}`);
//     })
//     .complete((errors) => {
//         if (errors.length === 0) {
//             console.log('✅ 全部加载完成，开始初始化...');
//             initSidebar();
//         } else {
//             console.warn('⚠️ 部分加载失败，但继续执行');
//             initSidebar(); // 仍然尝试初始化
//         }
//     })
//     .error((error, url) => {
//         console.error('加载出错:', error, url);
//     })
//     .load();
