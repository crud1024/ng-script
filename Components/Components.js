// Components.js - 动态加载其他组件的加载器
(function () {
  "use strict";

  // 配置对象
  var config = {
    // 组件配置
    components: [
      {
        name: "TreeExpandPanel",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/TreeExpandPanel/V1/TreeExpandPanel.js",
        globalVar: "TreeExpandPanel",
      },
      {
        name: "TimeShaft",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/TimeShaft/V1/TimeShaft.js",
        globalVar: "TimeShaft",
      },
      {
        name: "MessageV1",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Message/V1/Message.js",
        globalVar: "MessageV1",
      },
      {
        name: "MessageV2",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Message/V2/Message.js",
        globalVar: "MessageV2",
      },
      {
        name: "FishingAnimation",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Loading/V1/FishingAnimation.js",
        globalVar: "FishingAnimation",
      },
      {
        name: "Loading",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Loading/V2/Loading.js",
        globalVar: "Loading",
      },
      {
        name: "DownloadAttachs",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/DownloadAttachs/V1/DownloadAttachs.js",
        globalVar: "DownloadAttachs",
      },
      {
        name: "ButtonGroup",
        path: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/ButtonGroup/V1/ButtonGroup.js",
        globalVar: "ButtonGroup",
      },
    ],

    // 超时时间（毫秒）
    timeout: 10000,

    // 检查间隔（毫秒）
    checkInterval: 100,
  };

  // 状态对象
  var state = {
    loaded: {},
    loadingCount: 0,
    totalCount: config.components.length,
    isInitialized: false,
    callbacks: [],
  };

  // 创建命名空间
  window.NGDUFU = window.NGDUFU || {};
  window.NGDUFU.Components = window.NGDUFU.Components || {};

  // 添加状态检查方法
  window.NGDUFU.ComponentsReady = {
    // 检查是否准备就绪
    isReady: function () {
      return state.isInitialized;
    },

    // 等待组件加载完成
    ready: function (callback) {
      if (state.isInitialized) {
        callback(window.NGDUFU.Components);
      } else {
        state.callbacks.push(callback);
      }
    },

    // 获取加载状态
    getStatus: function () {
      return {
        loaded: state.loaded,
        loadingCount: state.loadingCount,
        totalCount: state.totalCount,
        isInitialized: state.isInitialized,
      };
    },
  };

  // 加载单个组件
  function loadComponent(component) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = component.path;
      script.async = false;

      // 设置超时
      var timeoutId = setTimeout(function () {
        reject(new Error("组件加载超时: " + component.name));
      }, config.timeout);

      script.onload = function () {
        clearTimeout(timeoutId);
        console.log("组件加载成功:", component.name);
        state.loaded[component.name] = {
          success: true,
          globalVar: component.globalVar,
          path: component.path,
        };
        resolve(component);
      };

      script.onerror = function () {
        clearTimeout(timeoutId);
        console.error("组件加载失败:", component.name);
        state.loaded[component.name] = {
          success: false,
          globalVar: component.globalVar,
          path: component.path,
          error: "加载失败",
        };
        resolve(component); // 即使失败也resolve，继续其他组件
      };

      document.head.appendChild(script);
    });
  }

  // 检查组件全局变量是否存在
  function checkComponentGlobalVar(component) {
    var globalVarName = component.globalVar;
    if (window[globalVarName]) {
      return window[globalVarName];
    }
    return null;
  }

  // 初始化命名空间
  function initializeNamespace() {
    if (state.isInitialized) return;

    // 将所有找到的组件添加到命名空间
    config.components.forEach(function (component) {
      var componentInstance = checkComponentGlobalVar(component);
      if (componentInstance) {
        window.NGDUFU.Components[component.name] = componentInstance;
        console.log("组件注册成功:", component.name);
      } else {
        console.warn("组件未找到全局变量:", component.globalVar);
        // 创建一个占位函数，避免调用时出错
        window.NGDUFU.Components[component.name] = function () {
          throw new Error("组件未加载成功: " + component.name);
        };
      }
    });

    // 添加便捷方法
    window.NGDUFU.Components.initAll = function () {
      console.log("初始化所有组件");
      // 这里可以添加初始化逻辑
    };

    // 标记为已初始化
    state.isInitialized = true;

    // 执行所有等待的回调
    state.callbacks.forEach(function (callback) {
      try {
        callback(window.NGDUFU.Components);
      } catch (e) {
        console.error("回调执行失败:", e);
      }
    });
    state.callbacks = [];

    // 触发加载完成事件
    triggerLoadedEvent();

    console.log("NGDUFU 组件加载器初始化完成");
  }

  // 触发加载完成事件
  function triggerLoadedEvent() {
    var event;
    if (typeof Event === "function") {
      event = new Event("NGComponentsLoaded");
    } else if (typeof document.createEvent === "function") {
      event = document.createEvent("Event");
      event.initEvent("NGComponentsLoaded", true, true);
    }

    if (event) {
      window.dispatchEvent(event);
      console.log("已触发 NGComponentsLoaded 事件");
    }
  }

  // 开始加载所有组件
  function loadAllComponents() {
    console.log("开始加载组件，共" + config.components.length + "个");

    // 使用 Promise.all 等待所有组件加载完成
    var promises = config.components.map(function (component) {
      return loadComponent(component);
    });

    Promise.all(promises)
      .then(function () {
        console.log("所有组件脚本加载完成");
        // 等待一段时间确保全局变量已设置
        setTimeout(function () {
          initializeNamespace();
        }, 300);
      })
      .catch(function (error) {
        console.error("组件加载过程中出错:", error);
        // 即使出错也尝试初始化
        setTimeout(function () {
          initializeNamespace();
        }, 300);
      });
  }

  // 检查是否已经有组件被加载（例如页面缓存）
  function checkExistingComponents() {
    var foundCount = 0;
    config.components.forEach(function (component) {
      if (checkComponentGlobalVar(component)) {
        foundCount++;
        state.loaded[component.name] = {
          success: true,
          globalVar: component.globalVar,
          path: component.path,
          fromCache: true,
        };
      }
    });

    if (foundCount === config.components.length) {
      console.log("检测到所有组件已从缓存加载");
      initializeNamespace();
      return true;
    }

    return false;
  }

  // 主初始化函数
  function init() {
    // 首先检查是否已经有组件被加载
    if (!checkExistingComponents()) {
      // 开始加载组件
      loadAllComponents();
    }
  }

  // 在DOM准备好后开始加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM已经加载完成
    init();
  }
})();
