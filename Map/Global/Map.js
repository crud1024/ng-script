// 统一地图API加载器
class MapAPILoader {
  constructor(options = {}) {
    this.options = {
      type: "tianditu", // 默认使用天地图
      protocol: "https",
      ...options,
    };

    this.loaded = false;
    this.loading = false;
    this.callbacks = [];
    this.mapType = null;
  }

  /**
   * 加载地图API
   * @param {string} key - 地图API密钥
   * @param {Object} options - 配置选项
   * @returns {Promise} - 返回Promise对象
   */
  load(key, options = {}) {
    if (!key || typeof key !== "string") {
      return Promise.reject(new Error("请提供有效的地图API密钥"));
    }

    // 合并配置
    const config = { ...this.options, ...options };
    this.mapType = config.type;

    // 检查是否已加载
    if (this._isAPILoaded()) {
      this.loaded = true;
      return Promise.resolve(this._getAPIObject());
    }

    if (this.loading) {
      return new Promise((resolve) => {
        this.callbacks.push(resolve);
      });
    }

    this.loading = true;

    switch (this.mapType) {
      case "baidu":
        return this._loadBaiduMap(key, config);
      case "amap":
        return this._loadAMap(key, config);
      case "tianditu":
      default:
        return this._loadTianDiTu(key, config);
    }
  }

  /**
   * 加载天地图API
   */
  _loadTianDiTu(key, config) {
    return new Promise((resolve, reject) => {
      // 检查是否已存在T对象
      if (window.T) {
        this._onLoadSuccess(window.T, resolve);
        return;
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;

      const protocol = config.protocol || "https";
      const version = config.version || "4.0";
      script.src = `${protocol}://api.tianditu.gov.cn/api?v=${version}&tk=${key}`;

      script.onload = () => {
        const checkT = () => {
          if (window.T) {
            this._onLoadSuccess(window.T, resolve);
          } else {
            setTimeout(checkT, 50);
          }
        };
        setTimeout(checkT, 100);
      };

      script.onerror = (error) => {
        this._onLoadError(`天地图API加载失败: ${error}`, reject);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 加载百度地图API
   */
  _loadBaiduMap(key, config) {
    return new Promise((resolve, reject) => {
      // 检查是否已存在BMapGL对象
      if (window.BMapGL) {
        this._onLoadSuccess(window.BMapGL, resolve);
        return;
      }

      // 生成唯一回调函数名
      const callbackName = `baiduMapInit_${Date.now()}`;
      window[callbackName] = () => {
        if (window.BMapGL) {
          this._onLoadSuccess(window.BMapGL, resolve);
          delete window[callbackName];
        }
      };

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;

      const version = config.version || "1.0";
      const type = config.baiduType || "webgl";
      const services = config.services || "";

      let url = `https://api.map.baidu.com/api?v=${version}&type=${type}&ak=${key}&callback=${callbackName}`;
      if (services) {
        url += `&services=${services}`;
      }

      script.src = url;

      script.onerror = (error) => {
        delete window[callbackName];
        this._onLoadError(`百度地图API加载失败: ${error}`, reject);
      };

      // 设置超时
      setTimeout(() => {
        if (!this.loaded && window[callbackName]) {
          delete window[callbackName];
          this._onLoadError("百度地图API加载超时", reject);
        }
      }, 10000);

      document.head.appendChild(script);
    });
  }

  /**
   * 加载高德地图API
   */
  _loadAMap(key, config) {
    return new Promise((resolve, reject) => {
      // 检查是否已存在AMap对象
      if (window.AMap) {
        this._onLoadSuccess(window.AMap, resolve);
        return;
      }

      // 设置安全密钥（如果需要）
      if (config.securityJsCode) {
        window._AMapSecurityConfig = {
          securityJsCode: config.securityJsCode,
        };
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;

      script.src = "https://webapi.amap.com/loader.js";

      script.onload = () => {
        const version = config.version || "2.0";
        const plugins = config.plugins || [];

        AMapLoader.load({
          key: key,
          version: version,
          plugins: plugins,
        })
          .then((AMap) => {
            this._onLoadSuccess(AMap, resolve);
          })
          .catch((error) => {
            this._onLoadError(`高德地图API加载失败: ${error}`, reject);
          });
      };

      script.onerror = (error) => {
        this._onLoadError(`高德地图Loader加载失败: ${error}`, reject);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 加载成功处理
   */
  _onLoadSuccess(apiObject, resolve) {
    this.loaded = true;
    this.loading = false;

    // 解析对应的API对象
    const result = {
      api: apiObject,
      type: this.mapType,
      instance: this._getAPIInstance(apiObject),
    };

    resolve(result);

    // 执行等待中的回调
    this.callbacks.forEach((cb) => cb(result));
    this.callbacks = [];
  }

  /**
   * 加载失败处理
   */
  _onLoadError(message, reject) {
    this.loading = false;
    reject(new Error(message));

    // 清理等待中的回调
    this.callbacks = [];
  }

  /**
   * 获取API实例对象
   */
  _getAPIInstance(apiObject) {
    switch (this.mapType) {
      case "baidu":
        return {
          Map: apiObject.Map || window.BMapGL?.Map,
          Point: apiObject.Point || window.BMapGL?.Point,
          LngLat: apiObject.LngLat || window.BMapGL?.Point,
        };
      case "amap":
        return {
          Map: apiObject.Map,
          LngLat: apiObject.LngLat,
          Size: apiObject.Size,
        };
      case "tianditu":
      default:
        return {
          Map: apiObject.Map,
          LngLat: apiObject.LngLat,
          Point: apiObject.Point,
        };
    }
  }

  /**
   * 检查API是否已加载
   */
  _isAPILoaded() {
    switch (this.mapType) {
      case "baidu":
        return !!window.BMapGL;
      case "amap":
        return !!window.AMap;
      case "tianditu":
      default:
        return !!window.T;
    }
  }

  /**
   * 获取API对象
   */
  _getAPIObject() {
    switch (this.mapType) {
      case "baidu":
        return {
          api: window.BMapGL,
          type: this.mapType,
          instance: this._getAPIInstance(window.BMapGL),
        };
      case "amap":
        return {
          api: window.AMap,
          type: this.mapType,
          instance: this._getAPIInstance(window.AMap),
        };
      case "tianditu":
      default:
        return {
          api: window.T,
          type: this.mapType,
          instance: this._getAPIInstance(window.T),
        };
    }
  }

  /**
   * 创建地图实例
   * @param {string} containerId - 地图容器ID
   * @param {Object} options - 地图配置选项
   * @returns {Object} - 地图实例
   */
  createMap(containerId, options = {}) {
    if (!this.loaded) {
      throw new Error("请先加载地图API");
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`找不到ID为"${containerId}"的容器`);
    }

    switch (this.mapType) {
      case "baidu": {
        const { center = [116.404, 39.915], zoom = 11 } = options;
        const map = new window.BMapGL.Map(containerId);
        map.centerAndZoom(new window.BMapGL.Point(center[0], center[1]), zoom);
        map.enableScrollWheelZoom(true);
        return map;
      }

      case "amap": {
        const { center = [116.397428, 39.90923], zoom = 11 } = options;
        return new window.AMap.Map(containerId, {
          zoom: zoom,
          center: center,
          viewMode: "2D",
          ...options,
        });
      }

      case "tianditu":
      default: {
        const { center = [116.407, 39.904], zoom = 11 } = options;
        const map = new window.T.Map(containerId);
        map.centerAndZoom(new window.T.LngLat(center[0], center[1]), zoom);
        return map;
      }
    }
  }

  /**
   * 检查是否已加载
   */
  isLoaded() {
    return this.loaded && this._isAPILoaded();
  }

  /**
   * 获取当前加载的地图类型
   */
  getMapType() {
    return this.mapType;
  }

  /**
   * 销毁加载器
   */
  destroy() {
    // 移除相关的script标签
    const mapScripts = document.querySelectorAll(`
      script[src*="tianditu.gov.cn"],
      script[src*="map.baidu.com"],
      script[src*="amap.com"]
    `);

    mapScripts.forEach((script) => script.remove());

    // 清理全局对象
    delete window.T;
    delete window.BMapGL;
    delete window.BMap;
    delete window.AMap;
    delete window._AMapSecurityConfig;

    // 清理回调函数
    const baiduCallbacks = Object.keys(window).filter((key) =>
      key.startsWith("baiduMapInit_")
    );
    baiduCallbacks.forEach((key) => delete window[key]);

    // 重置状态
    this.loaded = false;
    this.loading = false;
    this.callbacks = [];
    this.mapType = null;
  }
}

// 快捷方法
const MapLoader = {
  /**
   * 快速加载地图API
   * @param {string} type - 地图类型: 'tianditu' | 'baidu' | 'amap'
   * @param {string} key - API密钥
   * @param {Object} options - 配置选项
   * @returns {Promise}
   */
  load(type, key, options = {}) {
    const loader = new MapAPILoader({ type, ...options });
    return loader.load(key, options);
  },

  /**
   * 创建地图实例（便捷方法）
   * @param {string} type - 地图类型
   * @param {string} key - API密钥
   * @param {string} containerId - 容器ID
   * @param {Object} options - 配置选项
   * @returns {Promise}
   */
  create(type, key, containerId, options = {}) {
    return this.load(type, key, options).then(({ api, instance }) => {
      const loader = new MapAPILoader({ type });
      return loader.createMap(containerId, options.mapOptions || {});
    });
  },
};

// 导出模块
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MapAPILoader, MapLoader };
} else if (typeof define === "function" && define.amd) {
  define([], () => ({ MapAPILoader, MapLoader }));
} else {
  window.MapLoader = MapLoader;
  window.MapAPILoader = MapAPILoader;
}
