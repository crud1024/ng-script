// Components.js - 动态加载其他组件的加载器
(function () {
  // 组件路径数组
  var components = [
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/TreeExpandPanel/V1/TreeExpandPanel.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/TimeShaft/V1/TimeShaft.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Message/V1/Message.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Message/V2/Message.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Loading/V1/FishingAnimation.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/Loading/V2/Loading.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/DownloadAttachs/V1/DownloadAttachs.js",
    "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Components/ButtonGroup/V1/ButtonGroup.js",
  ];

  // 动态加载所有组件
  components.forEach(function (src) {
    var script = document.createElement("script");
    script.src = src;
    script.async = false; // 保持顺序执行
    document.head.appendChild(script);
  });

  // 等待所有组件加载完成后，创建统一的命名空间
  var checkInterval = setInterval(function () {
    // 检查所有组件是否都已加载（需要知道每个组件的全局变量名）
    if (window.TreeExpandPanel && window.TimeShaft /* 和其他组件 */) {
      clearInterval(checkInterval);

      // 创建统一命名空间
      window.NGDUFU = window.NGDUFU || {};
      window.NGDUFU.Components = {
        TreeExpandPanel: window.TreeExpandPanel,
        TimeShaft: window.TimeShaft,
        MessageV1: window.MessageV1,
        MessageV2: window.MessageV2,
        FishingAnimation: window.FishingAnimation,
        Loading: window.Loading,
        DownloadAttachs: window.DownloadAttachs,
        ButtonGroup: window.ButtonGroup,

        // 可以添加一些便捷方法
        initAll: function () {
          // 初始化所有组件的代码
        },
      };

      // 触发加载完成事件
      if (typeof document.createEvent !== "undefined") {
        var event = document.createEvent("Event");
        event.initEvent("NGComponentsLoaded", true, true);
        window.dispatchEvent(event);
      }
    }
  }, 100);
})();
