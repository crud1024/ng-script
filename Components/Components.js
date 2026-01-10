// Components.js - 动态加载其他组件的加载器
(function () {
  "use strict";

  // 立即创建命名空间
  window.NGDUFU = window.NGDUFU || {};
  window.NGDUFU.Components = window.NGDUFU.Components || {};
  window.NGDUFU.ComponentsReady = window.NGDUFU.ComponentsReady || {
    isReady: false,
    callbacks: [],

    // 等待就绪
    ready: function (callback) {
      if (this.isReady) {
        callback(window.NGDUFU.Components);
      } else {
        this.callbacks.push(callback);
      }
    },

    // 设置就绪状态
    setReady: function () {
      this.isReady = true;
      var callbacks = this.callbacks.slice();
      this.callbacks = [];

      setTimeout(function () {
        callbacks.forEach(function (callback) {
          try {
            callback(window.NGDUFU.Components);
          } catch (e) {
            console.error("回调执行失败:", e);
          }
        });
      }, 0);
    },

    // 获取状态
    getStatus: function () {
      return {
        isReady: this.isReady,
        pendingCallbacks: this.callbacks.length,
      };
    },
  };

  console.log("NGDUFU命名空间已创建");

  // 组件路径数组
  var components = [
    {
      name: "TreeExpandPanel",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/TreeExpandPanel/V1/TreeExpandPanel.js",
      globalVar: "TreeExpandPanel",
      loaded: false,
    },
    {
      name: "TimeShaft",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/TimeShaft/V1/TimeShaft.js",
      globalVar: "TimeShaft",
      loaded: false,
    },
    {
      name: "MessageV1",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Message/V1/Message.js",
      globalVar: "MessageV1",
      loaded: false,
    },
    {
      name: "MessageV2",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Message/V2/Message.js",
      globalVar: "MessageV2",
      loaded: false,
    },
    {
      name: "FishingAnimation",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Loading/V1/FishingAnimation.js",
      globalVar: "FishingAnimation",
      loaded: false,
    },
    {
      name: "Loading",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Loading/V2/Loading.js",
      globalVar: "Loading",
      loaded: false,
    },
    {
      name: "DownloadAttachs",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/DownloadAttachs/V1/DownloadAttachs.js",
      globalVar: "DownloadAttachs",
      loaded: false,
    },
    {
      name: "ButtonGroup",
      url: "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/ButtonGroup/V1/ButtonGroup.js",
      globalVar: "ButtonGroup",
      loaded: false,
    },
  ];

  var loadedCount = 0;
  var totalComponents = components.length;
  var initialized = false;

  // 加载单个组件
  function loadComponent(component) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = component.url;
      script.async = false;

      // 设置加载超时
      var timeoutId = setTimeout(function () {
        console.warn("组件加载超时:", component.name);
        component.loaded = true;
        loadedCount++;
        resolve(component);
      }, 10000);

      script.onload = function () {
        clearTimeout(timeoutId);
        console.log("组件加载成功:", component.name);
        component.loaded = true;
        loadedCount++;
        resolve(component);
      };

      script.onerror = function () {
        clearTimeout(timeoutId);
        console.error("组件加载失败:", component.name);
        component.loaded = true;
        component.error = true;
        loadedCount++;
        resolve(component); // 即使失败也resolve，不中断其他组件加载
      };

      document.head.appendChild(script);
    });
  }

  // 检查组件全局变量
  function checkComponent(component) {
    var globalVarName = component.globalVar;
    if (window[globalVarName] !== undefined) {
      return window[globalVarName];
    }
    return null;
  }

  // 初始化组件到命名空间
  function initializeComponents() {
    if (initialized) return;

    console.log("开始初始化组件到命名空间...");

    components.forEach(function (component) {
      var compInstance = checkComponent(component);
      if (compInstance) {
        // 将组件添加到命名空间
        if (typeof compInstance === "function") {
          window.NGDUFU.Components[component.name] = compInstance;
        } else {
          // 如果组件不是函数，则将其包装为返回自身的函数
          window.NGDUFU.Components[component.name] = function () {
            return compInstance;
          };
        }
        console.log("✓ 组件已注册:", component.name);
      } else {
        // 创建占位函数，避免调用时报错
        window.NGDUFU.Components[component.name] = function () {
          console.error("组件未加载成功:", component.name);
          throw new Error("组件未加载成功: " + component.name);
        };
        console.warn("⚠ 组件未找到:", component.name);
      }
    });

    // 添加一些工具方法
    window.NGDUFU.Components.initAll = function () {
      console.log("初始化所有组件");
      // 可以在这里添加初始化逻辑
    };

    // 标记为已初始化
    initialized = true;
    window.NGDUFU.ComponentsReady.isReady = true;

    // 触发回调
    window.NGDUFU.ComponentsReady.setReady();

    // 触发自定义事件
    triggerReadyEvent();

    console.log(
      "🎉 NGDUFU组件全部加载完成，共加载 " +
        loadedCount +
        "/" +
        totalComponents +
        " 个组件"
    );
  }

  // 触发就绪事件
  function triggerReadyEvent() {
    var event;
    try {
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
    } catch (e) {
      console.error("触发事件失败:", e);
    }
  }

  // 主加载函数
  function loadAllComponents() {
    console.log("开始加载所有组件，共 " + totalComponents + " 个");

    // 使用Promise.all加载所有组件
    var promises = components.map(function (component) {
      return loadComponent(component);
    });

    Promise.all(promises)
      .then(function (results) {
        console.log("所有组件脚本加载完成，等待全局变量初始化...");

        // 给组件一点时间设置全局变量
        setTimeout(function () {
          initializeComponents();
        }, 300);
      })
      .catch(function (error) {
        console.error("组件加载过程中出现错误:", error);
        // 即使出错也尝试初始化
        setTimeout(function () {
          initializeComponents();
        }, 300);
      });
  }

  // 检查是否有组件已经存在（缓存）
  function checkExistingComponents() {
    var foundCount = 0;
    components.forEach(function (component) {
      if (checkComponent(component)) {
        foundCount++;
        component.loaded = true;
        loadedCount++;
        console.log("从缓存中找到组件:", component.name);
      }
    });

    return foundCount;
  }

  // 主入口函数
  function init() {
    // 检查是否已经有组件加载了
    var found = checkExistingComponents();

    if (found === totalComponents) {
      console.log("所有组件已从缓存加载");
      initializeComponents();
    } else {
      loadAllComponents();
    }
  }

  // 立即开始加载
  init();
})();
