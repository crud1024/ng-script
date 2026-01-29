/**
 * 业务类型存储管理类
 * 用于在localStorage中按业务类型存储和管理数据
 */
class BusDataManager {
  /**
   * 构造函数
   * @param {string|function} busType - 业务类型标识或获取函数
   */
  constructor(busType = "default") {
    this._busTypeSource = busType;
    this._cache = null; // 内存缓存
  }

  /**
   * 获取当前业务类型
   * @returns {string} 业务类型标识
   */
  getBusType() {
    if (typeof this._busTypeSource === "function") {
      try {
        return this._busTypeSource();
      } catch (error) {
        console.error("BusDataManager: 获取业务类型函数执行失败", error);
        return "default";
      }
    }
    return this._busTypeSource;
  }

  /**
   * 设置业务类型
   * @param {string|function} busType - 新的业务类型标识或获取函数
   */
  setBusType(busType) {
    if (this._busTypeSource !== busType) {
      this._busTypeSource = busType;
      this._cache = null; // 切换业务类型时清空缓存
    }
  }

  /**
   * 获取完整的业务数据
   * @returns {Object} 业务数据对象
   */
  getData() {
    if (this._cache) {
      return this._cache;
    }

    const busType = this.getBusType();

    try {
      const dataStr = localStorage.getItem(busType);
      const data = dataStr ? JSON.parse(dataStr) : {};
      this._cache = data;
      return data;
    } catch (error) {
      console.error(`BusDataManager: 解析存储数据失败 (${busType})`, error);
      return {};
    }
  }

  /**
   * 设置完整的业务数据
   * @param {Object} data - 要存储的业务数据对象
   * @returns {Object} 存储后的数据
   */
  setData(data) {
    const busType = this.getBusType();

    try {
      localStorage.setItem(busType, JSON.stringify(data));
      this._cache = data;
      return data;
    } catch (error) {
      console.error(`BusDataManager: 存储数据失败 (${busType})`, error);
      throw error;
    }
  }

  /**
   * 获取指定键的值
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 键对应的值
   */
  getValue(key, defaultValue = null) {
    const busData = this.getData();
    return busData[key] !== undefined ? busData[key] : defaultValue;
  }

  /**
   * 设置指定键的值
   * @param {string} key - 键名
   * @param {*} value - 要存储的值
   * @returns {*} 存储的值
   */
  setValue(key, value) {
    const busData = this.getData();
    busData[key] = value;
    return this.setData(busData);
  }

  /**
   * 删除指定键
   * @param {string} key - 键名
   * @returns {boolean} 是否删除成功
   */
  removeValue(key) {
    const busData = this.getData();
    if (busData.hasOwnProperty(key)) {
      delete busData[key];
      this.setData(busData);
      return true;
    }
    return false;
  }

  /**
   * 检查指定键是否存在
   * @param {string} key - 键名
   * @returns {boolean} 是否存在
   */
  hasValue(key) {
    const busData = this.getData();
    return busData.hasOwnProperty(key);
  }

  /**
   * 获取所有键名
   * @returns {string[]} 所有存储的键名
   */
  getKeys() {
    const busData = this.getData();
    return Object.keys(busData);
  }

  /**
   * 清空当前业务类型的所有数据
   * @returns {boolean} 是否清空成功
   */
  clear() {
    const busType = this.getBusType();

    try {
      localStorage.removeItem(busType);
      this._cache = {};
      return true;
    } catch (error) {
      console.error(`BusDataManager: 清空数据失败 (${busType})`, error);
      return false;
    }
  }

  /**
   * 获取数据大小（字符数）
   * @returns {number} 存储数据的字符数
   */
  getSize() {
    const busType = this.getBusType();
    const dataStr = localStorage.getItem(busType);
    return dataStr ? dataStr.length : 0;
  }

  /**
   * 批量设置多个值
   * @param {Object} values - 键值对对象
   * @returns {Object} 存储后的数据
   */
  setValues(values) {
    const busData = this.getData();
    Object.assign(busData, values);
    return this.setData(busData);
  }

  /**
   * 批量获取多个值
   * @param {string[]} keys - 键名数组
   * @param {Object} defaultValues - 默认值对象
   * @returns {Object} 键值对结果
   */
  getValues(keys, defaultValues = {}) {
    const result = {};
    keys.forEach((key) => {
      result[key] = this.getValue(key, defaultValues[key]);
    });
    return result;
  }
}

/**
 * 工厂函数：创建预配置的管理器实例
 */
BusDataManager.create = function (busType) {
  return new BusDataManager(busType);
};

/**
 * 工具函数：与原始代码兼容的函数
 */
BusDataManager.utils = {
  /**
   * 获取业务类型数据（与原始getBusData函数兼容）
   * @param {string|function} busType - 业务类型标识或获取函数
   * @returns {Object}
   */
  getBusData(busType) {
    const manager = new BusDataManager(busType);
    return manager.getData();
  },

  /**
   * 设置业务类型数据（与原始setBusData函数兼容）
   * @param {Object} data - 要存储的数据
   * @param {string|function} busType - 业务类型标识或获取函数
   * @returns {Object}
   */
  setBusData(data, busType) {
    const manager = new BusDataManager(busType);
    return manager.setData(data);
  },

  /**
   * 获取业务类型下的特定值（与原始getBusValue函数兼容）
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @param {string|function} busType - 业务类型标识或获取函数
   * @returns {*}
   */
  getBusValue(key, defaultValue = null, busType) {
    const manager = new BusDataManager(busType);
    return manager.getValue(key, defaultValue);
  },

  /**
   * 设置业务类型下的特定值（与原始setBusValue函数兼容）
   * @param {string} key - 键名
   * @param {*} value - 要存储的值
   * @param {string|function} busType - 业务类型标识或获取函数
   * @returns {*}
   */
  setBusValue(key, value, busType) {
    const manager = new BusDataManager(busType);
    return manager.setValue(key, value);
  },

  /**
   * 删除业务类型下的特定值（与原始removeBusValue函数兼容）
   * @param {string} key - 键名
   * @param {string|function} busType - 业务类型标识或获取函数
   * @returns {boolean}
   */
  removeBusValue(key, busType) {
    const manager = new BusDataManager(busType);
    return manager.removeValue(key);
  },
};

// 导出到全局作用域
if (typeof window !== "undefined") {
  window.BusDataManager = BusDataManager;

  // 为了向后兼容，可以保留旧的全局函数
  if (typeof window.$NG !== "undefined" && window.$NG.getBusType) {
    // 创建默认实例（使用$NG.getBusType）
    window.busData = new BusDataManager(function () {
      return window.$NG.getBusType();
    });

    // 快捷方法
    window.getBusData = function () {
      console.warn("getBusData已过时，请使用BusDataManager.utils.getBusData()");
      return BusDataManager.utils.getBusData(window.$NG.getBusType);
    };

    window.setBusData = function (data) {
      console.warn("setBusData已过时，请使用BusDataManager.utils.setBusData()");
      return BusDataManager.utils.setBusData(data, window.$NG.getBusType);
    };

    window.getBusValue = function (key, defaultValue) {
      console.warn(
        "getBusValue已过时，请使用BusDataManager.utils.getBusValue()",
      );
      return BusDataManager.utils.getBusValue(
        key,
        defaultValue,
        window.$NG.getBusType,
      );
    };

    window.setBusValue = function (key, value) {
      console.warn(
        "setBusValue已过时，请使用BusDataManager.utils.setBusValue()",
      );
      return BusDataManager.utils.setBusValue(
        key,
        value,
        window.$NG.getBusType,
      );
    };

    window.removeBusValue = function (key) {
      console.warn(
        "removeBusValue已过时，请使用BusDataManager.utils.removeBusValue()",
      );
      return BusDataManager.utils.removeBusValue(key, window.$NG.getBusType);
    };
  }
}

// 导出模块（如果支持模块系统）
if (typeof module !== "undefined" && module.exports) {
  module.exports = BusDataManager;
}

if (typeof define === "function" && define.amd) {
  define([], function () {
    return BusDataManager;
  });
}
