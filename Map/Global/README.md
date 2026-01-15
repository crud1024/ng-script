# 统一地图 API 加载器 - 完整文档

## 安装与引入

### 直接引入

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>统一地图加载器示例</title>
    <style>
      #map-container {
        width: 100%;
        height: 600px;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <div id="map-container"></div>

    <!-- 引入地图加载器 -->
    <script src="map-loader.js"></script>
    <script>
      // 使用示例
    </script>
  </body>
</html>
```

### NPM 包形式

```json
// package.json
{
  "name": "your-project",
  "dependencies": {
    "unified-map-loader": "^1.0.0"
  }
}
```

```javascript
// ES6模块导入
import { MapAPILoader, MapLoader } from "unified-map-loader";

// 或 CommonJS
const { MapAPILoader, MapLoader } = require("unified-map-loader");
```

## 完整 API 文档

### MapAPILoader 类

#### 构造函数

```javascript
new MapAPILoader(options);
```

**参数:**

- `options` (Object): 配置选项
  - `type` (String): 地图类型，可选值: 'tianditu'、'baidu'、'amap'，默认 'tianditu'
  - `protocol` (String): 协议，默认 'https'
  - [其他类型特有参数]

#### 方法

1. **load(key, options)**
   加载地图 API

   ```javascript
   const loader = new MapAPILoader({ type: "amap" });

   loader
     .load("your-api-key", {
       version: "2.0",
       securityJsCode: "your-security-code",
       plugins: ["AMap.ToolBar", "AMap.Scale"],
     })
     .then(({ api, type, instance }) => {
       console.log(`${type} API加载成功`);
     })
     .catch((error) => {
       console.error("加载失败:", error);
     });
   ```

   **参数:**

   - `key` (String): 地图 API 密钥
   - `options` (Object): 配置选项，会覆盖构造函数中的配置

   **返回值:** Promise，解析为包含以下属性的对象：

   - `api`: 地图 API 全局对象（T、BMapGL、AMap）
   - `type`: 地图类型
   - `instance`: 常用类的实例（Map、LngLat 等）

2. **createMap(containerId, options)**
   创建地图实例

   ```javascript
   loader.load("your-api-key").then(() => {
     const map = loader.createMap("map-container", {
       center: [116.397428, 39.90923],
       zoom: 11,
       viewMode: "2D",
     });

     // 添加事件监听
     map.on("click", (e) => {
       console.log("点击位置:", e.lnglat);
     });
   });
   ```

   **参数:**

   - `containerId` (String): DOM 元素 ID
   - `options` (Object): 地图配置选项

   **不同类型的地图配置:**

   | 参数       | 天地图       | 百度地图          | 高德地图        |
   | ---------- | ------------ | ----------------- | --------------- |
   | `center`   | `[lng, lat]` | `[lng, lat]`      | `[lng, lat]`    |
   | `zoom`     | `number`     | `number`          | `number`        |
   | `viewMode` | -            | -                 | `'2D'/'3D'`     |
   | 其他       | `T.Map` 参数 | `BMapGL.Map` 参数 | `AMap.Map` 参数 |

3. **isLoaded()**
   检查 API 是否已加载完成

   ```javascript
   if (loader.isLoaded()) {
     console.log("地图 API 已加载");
     const map = loader.createMap("container", { zoom: 10 });
   }
   ```

4. **getMapType()**
   获取当前地图类型

   ```javascript
   const mapType = loader.getMapType();
   console.log(`当前使用${mapType}地图`);
   ```

5. **destroy()**
   销毁加载器，清理资源

   ```javascript
   // 切换地图类型前清理
   loader.destroy();

   // 重新加载新类型
   const newLoader = new MapAPILoader({ type: "baidu" });
   ```

### MapLoader 工具对象

1. **MapLoader.load(type, key, options)**
   快速加载地图 API

   ```javascript
   // 异步方式
   MapLoader.load("baidu", "your-baidu-ak", {
     baiduType: "webgl",
     services: "tile,vector,traffic",
   }).then(({ api, type }) => {
     console.log(`${type}地图加载成功`);
   });

   // async/await 方式
   async function initMap() {
     try {
       const { api, type } = await MapLoader.load("amap", "your-amap-key", {
         version: "2.0",
         plugins: ["AMap.ToolBar"],
       });

       const map = new api.Map("container", {
         zoom: 12,
         center: [116.397428, 39.90923],
       });
     } catch (error) {
       console.error("初始化失败:", error);
     }
   }
   ```

2. **MapLoader.create(type, key, containerId, options)**
   一键创建地图

   ```javascript
   MapLoader.create("tianditu", "your-tianditu-tk", "map-container", {
     mapOptions: {
       center: [116.407, 39.904],
       zoom: 11,
     },
     version: "4.0",
     protocol: "https",
   })
     .then((map) => {
       console.log("地图创建完成:", map);

       // 添加标记
       const marker = new T.Marker(new T.LngLat(116.407, 39.904));
       map.addOverLay(marker);
     })
     .catch((error) => {
       console.error("创建失败:", error);
     });
   ```

## 示例

### 示例 1: 动态切换地图

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>动态地图切换示例</title>
    <style>
      #map {
        width: 100%;
        height: 500px;
        border: 1px solid #ccc;
      }
      .controls {
        margin: 10px 0;
      }
      button {
        margin: 0 5px;
        padding: 8px 16px;
      }
    </style>
  </head>
  <body>
    <div class="controls">
      <button onclick="switchMap('tianditu')">天地图</button>
      <button onclick="switchMap('baidu')">百度地图</button>
      <button onclick="switchMap('amap')">高德地图</button>
    </div>
    <div id="map"></div>

    <script src="map-loader.js"></script>
    <script>
      let currentLoader = null;
      let currentMap = null;

      // 地图配置
      const mapConfigs = {
        tianditu: {
          key: "your-tianditu-tk",
          options: { version: "4.0" },
        },
        baidu: {
          key: "your-baidu-ak",
          options: {
            baiduType: "webgl",
            services: "tile,vector,traffic",
          },
        },
        amap: {
          key: "your-amap-key",
          options: {
            version: "2.0",
            securityJsCode: "your-security-code",
            plugins: ["AMap.ToolBar", "AMap.Scale"],
          },
        },
      };

      // 切换地图
      async function switchMap(type) {
        if (currentLoader) {
          currentLoader.destroy();
          currentMap = null;
        }

        const config = mapConfigs[type];
        if (!config) return;

        currentLoader = new MapAPILoader({ type });

        try {
          // 加载API
          const { api } = await currentLoader.load(config.key, config.options);

          // 创建地图
          const center = {
            tianditu: [116.407, 39.904],
            baidu: [116.404, 39.915],
            amap: [116.397428, 39.90923],
          }[type];

          currentMap = currentLoader.createMap("map", {
            center: center,
            zoom: 11,
          });

          console.log(`${type}地图加载成功`);

          // 添加示例标记
          addSampleMarker(api, currentMap, type);
        } catch (error) {
          console.error(`加载${type}地图失败:`, error);
          alert(`地图加载失败: ${error.message}`);
        }
      }

      // 添加示例标记
      function addSampleMarker(api, map, type) {
        const positions = {
          tianditu: new api.LngLat(116.407, 39.904),
          baidu: new api.Point(116.404, 39.915),
          amap: new api.LngLat(116.397428, 39.90923),
        };

        let marker;
        switch (type) {
          case "tianditu":
            marker = new api.Marker(positions[type]);
            map.addOverLay(marker);
            break;
          case "baidu":
            marker = new api.Marker(positions[type]);
            map.addOverlay(marker);
            break;
          case "amap":
            marker = new api.Marker({
              position: positions[type],
            });
            map.add(marker);
            break;
        }
      }

      // 默认加载天地图
      window.onload = () => switchMap("tianditu");
    </script>
  </body>
</html>
```

### 示例 2: 多地图对比视图

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>多地图对比</title>
    <style>
      .map-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .map-item {
        flex: 1;
        min-width: 300px;
        height: 400px;
        border: 1px solid #ccc;
      }
      .map-title {
        text-align: center;
        padding: 5px;
        background: #f5f5f5;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="map-container">
      <div class="map-item">
        <div class="map-title">天地图</div>
        <div id="map-tianditu" style="height: calc(100% - 30px);"></div>
      </div>
      <div class="map-item">
        <div class="map-title">百度地图</div>
        <div id="map-baidu" style="height: calc(100% - 30px);"></div>
      </div>
      <div class="map-item">
        <div class="map-title">高德地图</div>
        <div id="map-amap" style="height: calc(100% - 30px);"></div>
      </div>
    </div>

    <script src="map-loader.js"></script>
    <script>
      // 同步加载多个地图
      async function loadAllMaps() {
        const configs = [
          {
            type: "tianditu",
            key: "your-tianditu-tk",
            container: "map-tianditu",
            options: { version: "4.0" },
          },
          {
            type: "baidu",
            key: "your-baidu-ak",
            container: "map-baidu",
            options: { baiduType: "webgl" },
          },
          {
            type: "amap",
            key: "your-amap-key",
            container: "map-amap",
            options: { version: "2.0" },
          },
        ];

        // 并行加载
        const promises = configs.map((config) =>
          MapLoader.create(config.type, config.key, config.container, {
            mapOptions: { zoom: 10 },
          })
        );

        try {
          const maps = await Promise.all(promises);
          console.log("所有地图加载完成");

          // 同步所有地图的中心点
          syncMapCenters(maps);
        } catch (errors) {
          console.error("部分地图加载失败:", errors);
        }
      }

      // 同步地图中心点
      function syncMapCenters(maps) {
        const center = [116.407, 39.904];

        // 为每个地图添加拖拽监听
        maps.forEach((map, index) => {
          if (map.on) {
            map.on("moveend", () => {
              const newCenter = getMapCenter(map, index);
              updateOtherCenters(maps, index, newCenter);
            });
          }
        });
      }

      function getMapCenter(map, typeIndex) {
        // 根据地图类型获取中心点
        // 实现细节根据实际API调整
        return [116.407, 39.904];
      }

      function updateOtherCenters(maps, currentIndex, center) {
        maps.forEach((map, index) => {
          if (index !== currentIndex && map.setCenter) {
            map.setCenter(center);
          }
        });
      }

      // 页面加载完成后初始化
      window.onload = loadAllMaps;
    </script>
  </body>
</html>
```

### 示例 3: 带完整功能的地图应用

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>完整地图应用</title>
    <style>
      body,
      html {
        margin: 0;
        padding: 0;
        height: 100%;
      }
      #app {
        height: 100%;
        display: flex;
      }
      #sidebar {
        width: 300px;
        background: #f8f9fa;
        padding: 20px;
        border-right: 1px solid #dee2e6;
      }
      #map-container {
        flex: 1;
      }
      .control-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      select,
      input,
      button {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        box-sizing: border-box;
      }
      .coordinates {
        background: white;
        padding: 10px;
        border: 1px solid #dee2e6;
        margin-top: 10px;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <div id="sidebar">
        <div class="control-group">
          <label>选择地图类型</label>
          <select id="map-type">
            <option value="tianditu">天地图</option>
            <option value="baidu">百度地图</option>
            <option value="amap">高德地图</option>
          </select>

          <label>API密钥</label>
          <input type="text" id="api-key" placeholder="请输入API密钥" />

          <button onclick="initMap()">初始化地图</button>
          <button onclick="addMarker()" id="add-marker-btn" disabled>
            添加标记
          </button>
          <button onclick="clearMarkers()" id="clear-markers-btn" disabled>
            清除标记
          </button>
        </div>

        <div class="control-group">
          <label>搜索地点</label>
          <input type="text" id="search-input" placeholder="输入地点名称" />
          <button onclick="searchPlace()">搜索</button>
        </div>

        <div id="coordinates" class="coordinates">点击地图查看坐标</div>

        <div id="marker-list" class="control-group">
          <h4>标记列表</h4>
          <ul id="markers"></ul>
        </div>
      </div>
      <div id="map-container"></div>
    </div>

    <script src="map-loader.js"></script>
    <script>
      let mapLoader = null;
      let currentMap = null;
      let markers = [];

      // 初始化地图
      async function initMap() {
        const mapType = document.getElementById("map-type").value;
        const apiKey = document.getElementById("api-key").value;

        if (!apiKey) {
          alert("请输入API密钥");
          return;
        }

        // 清理之前的资源
        if (mapLoader) {
          mapLoader.destroy();
          markers = [];
          updateMarkerList();
        }

        // 配置参数
        const options = {
          tianditu: { version: "4.0" },
          baidu: { baiduType: "webgl" },
          amap: {
            version: "2.0",
            plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.Geocoder"],
          },
        }[mapType];

        // 创建加载器
        mapLoader = new MapAPILoader({ type: mapType });

        try {
          // 加载API
          const { api } = await mapLoader.load(apiKey, options);

          // 创建地图
          const defaultCenter = {
            tianditu: [116.407, 39.904],
            baidu: [116.404, 39.915],
            amap: [116.397428, 39.90923],
          }[mapType];

          currentMap = mapLoader.createMap("map-container", {
            center: defaultCenter,
            zoom: 11,
          });

          // 启用按钮
          document.getElementById("add-marker-btn").disabled = false;
          document.getElementById("clear-markers-btn").disabled = false;

          // 添加点击事件
          setupMapEvents(api, mapType);

          console.log(`${mapType}地图初始化成功`);
        } catch (error) {
          console.error("地图初始化失败:", error);
          alert(`初始化失败: ${error.message}`);
        }
      }

      // 设置地图事件
      function setupMapEvents(api, mapType) {
        const clickHandler = (e) => {
          let lng, lat;

          switch (mapType) {
            case "tianditu":
              lng = e.lnglat.getLng();
              lat = e.lnglat.getLat();
              break;
            case "baidu":
              lng = e.latlng.lng;
              lat = e.latlng.lat;
              break;
            case "amap":
              lng = e.lnglat.getLng();
              lat = e.lnglat.getLat();
              break;
          }

          // 显示坐标
          document.getElementById(
            "coordinates"
          ).innerHTML = `经度: ${lng.toFixed(6)}<br>纬度: ${lat.toFixed(6)}`;

          // 添加标记（双击时）
          if (e.type === "dblclick") {
            addMarkerAt(lng, lat);
          }
        };

        // 绑定事件
        if (currentMap.on) {
          currentMap.on("click", clickHandler);
          currentMap.on("dblclick", clickHandler);
        }
      }

      // 添加标记
      function addMarker() {
        if (!currentMap) return;

        const center = currentMap.getCenter();
        if (center) {
          const lng = center.lng || center.getLng();
          const lat = center.lat || center.getLat();
          addMarkerAt(lng, lat);
        }
      }

      function addMarkerAt(lng, lat) {
        const mapType = document.getElementById("map-type").value;
        const api =
          window[
            mapType === "tianditu"
              ? "T"
              : mapType === "baidu"
              ? "BMapGL"
              : "AMap"
          ];

        if (!api) return;

        // 创建标记
        let marker;
        const position =
          mapType === "baidu"
            ? new api.Point(lng, lat)
            : new api.LngLat(lng, lat);

        if (mapType === "tianditu") {
          marker = new api.Marker(position);
          currentMap.addOverLay(marker);
        } else if (mapType === "baidu") {
          marker = new api.Marker(position);
          currentMap.addOverlay(marker);
        } else if (mapType === "amap") {
          marker = new api.Marker({
            position: position,
          });
          currentMap.add(marker);
        }

        // 存储标记信息
        markers.push({
          id: Date.now(),
          position: { lng, lat },
          marker: marker,
          mapType: mapType,
        });

        updateMarkerList();
      }

      // 清除标记
      function clearMarkers() {
        markers.forEach((markerInfo) => {
          if (currentMap && markerInfo.marker) {
            // 根据地图类型使用不同的移除方法
            if (markerInfo.mapType === "tianditu") {
              currentMap.removeOverLay(markerInfo.marker);
            } else if (markerInfo.mapType === "baidu") {
              currentMap.removeOverlay(markerInfo.marker);
            } else if (markerInfo.mapType === "amap") {
              currentMap.remove(markerInfo.marker);
            }
          }
        });

        markers = [];
        updateMarkerList();
      }

      // 更新标记列表
      function updateMarkerList() {
        const list = document.getElementById("markers");
        list.innerHTML = "";

        markers.forEach((marker) => {
          const li = document.createElement("li");
          li.innerHTML = `
                    标记 ${marker.id}<br>
                    坐标: ${marker.position.lng.toFixed(
                      4
                    )}, ${marker.position.lat.toFixed(4)}
                    <button onclick="removeMarker(${marker.id})">删除</button>
                `;
          list.appendChild(li);
        });
      }

      // 删除单个标记
      function removeMarker(id) {
        const index = markers.findIndex((m) => m.id === id);
        if (index !== -1) {
          const markerInfo = markers[index];

          if (currentMap && markerInfo.marker) {
            if (markerInfo.mapType === "tianditu") {
              currentMap.removeOverLay(markerInfo.marker);
            } else if (markerInfo.mapType === "baidu") {
              currentMap.removeOverlay(markerInfo.marker);
            } else if (markerInfo.mapType === "amap") {
              currentMap.remove(markerInfo.marker);
            }
          }

          markers.splice(index, 1);
          updateMarkerList();
        }
      }

      // 搜索地点（示例）
      function searchPlace() {
        const query = document.getElementById("search-input").value;
        if (!query || !currentMap) return;

        alert("搜索功能需要集成具体的地图搜索API");
        // 实际实现中，这里需要调用各个地图的搜索服务
      }
    </script>
  </body>
</html>
```

## 配置文件示例

### 配置对象示例

```javascript
// config.js - 地图配置管理
export const mapConfigurations = {
  // 开发环境配置
  development: {
    tianditu: {
      key: "your-dev-tianditu-key",
      options: {
        version: "4.0",
        protocol: "http", // 开发环境可用http
      },
    },
    baidu: {
      key: "your-dev-baidu-key",
      options: {
        baiduType: "webgl",
        version: "1.0",
        services: "tile,vector",
      },
    },
    amap: {
      key: "your-dev-amap-key",
      options: {
        version: "2.0",
        plugins: ["AMap.ToolBar"],
      },
    },
  },

  // 生产环境配置
  production: {
    tianditu: {
      key: "your-prod-tianditu-key",
      options: {
        version: "4.0",
        protocol: "https",
      },
    },
    baidu: {
      key: "your-prod-baidu-key",
      options: {
        baiduType: "webgl",
        version: "1.0",
        services: "tile,vector,traffic",
      },
    },
    amap: {
      key: "your-prod-amap-key",
      options: {
        version: "2.0",
        securityJsCode: "your-security-code",
        plugins: ["AMap.ToolBar", "AMap.Scale", "AMap.Geocoder"],
      },
    },
  },
};

// 地图工厂函数
export class MapFactory {
  static async createMap(type, containerId, environment = "production") {
    const config = mapConfigurations[environment]?.[type];
    if (!config) {
      throw new Error(`未找到${type}地图的${environment}环境配置`);
    }

    const loader = new MapAPILoader({ type });
    const { api } = await loader.load(config.key, config.options);

    const defaultCenter = {
      tianditu: [116.407, 39.904],
      baidu: [116.404, 39.915],
      amap: [116.397428, 39.90923],
    }[type];

    return loader.createMap(containerId, {
      center: defaultCenter,
      zoom: 12,
    });
  }
}
```

## 错误处理指南

### 常见错误及解决方案

```javascript
// 1. 密钥错误
try {
  await MapLoader.load("tianditu", "invalid-key");
} catch (error) {
  if (error.message.includes("密钥")) {
    console.error("请检查 API 密钥是否正确");
    // 显示用户友好的错误信息
    showErrorToUser("地图服务暂时不可用，请检查网络或联系管理员");
  }
}

// 2. 网络错误
try {
  await MapLoader.load("baidu", "valid-key", { baiduType: "webgl" });
} catch (error) {
  if (error.message.includes("加载失败") || error.message.includes("超时")) {
    console.error("网络连接失败");
    // 重试机制
    setTimeout(() => retryLoadMap(), 3000);
  }
}

// 3. API 版本不兼容
try {
  await MapLoader.load("amap", "valid-key", { version: "1.0" });
} catch (error) {
  if (error.message.includes("版本")) {
    console.error("API 版本不兼容，尝试使用默认版本");
    // 降级使用默认版本
    await MapLoader.load("amap", "valid-key", { version: "2.0" });
  }
}

// 4. 容器不存在
try {
  const loader = new MapAPILoader({ type: "tianditu" });
  await loader.load("valid-key");
  const map = loader.createMap("non-existent-container", { zoom: 10 });
} catch (error) {
  if (error.message.includes("找不到 ID")) {
    console.error("地图容器不存在");
    // 动态创建容器
    createMapContainer();
  }
}

// 重试机制实现
async function loadWithRetry(type, key, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await MapLoader.load(type, key, options);
    } catch (error) {
      console.log(`第${i + 1}次尝试失败:`, error.message);

      if (i === maxRetries - 1) {
        throw error; // 最后一次失败，抛出异常
      }

      // 等待一段时间后重试
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// 使用重试机制
loadWithRetry("baidu", "your-key", { baiduType: "webgl" })
  .then(() => console.log("加载成功"))
  .catch((error) => console.error("最终失败:", error));
```

## 性能优化建议

1.  懒加载地图

    ```javascript
    // 只在需要时加载地图
    class LazyMapLoader {
      constructor() {
        this.observer = null;
        this.loadedContainers = new Set();
      }
      observe(containerId, mapType, apiKey, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                entry.isIntersecting &&
                !this.loadedContainers.has(containerId)
              ) {
                this.loadMap(containerId, mapType, apiKey, options);
                this.loadedContainers.add(containerId);
                this.observer.unobserve(container);
              }
            });
          },
          { threshold: 0.1 }
        );

        this.observer.observe(container);
      }

      async loadMap(containerId, mapType, apiKey, options) {
        console.log(`懒加载${mapType}地图到${containerId}`);
        return MapLoader.create(mapType, apiKey, containerId, options);
      }
    }

    // 使用示例
    const lazyLoader = new LazyMapLoader();
    lazyLoader.observe("map-container", "amap", "your-key", {
      mapOptions: { zoom: 12 },
    });
    ```

2.  预加载策略

    ```javascript
    // 预加载常用地图 API
    class MapPreloader {
      constructor() {
        this.cache = new Map();
      }

      async preload(type, key, options = {}) {
        if (this.cache.has(type)) {
          return this.cache.get(type);
        }

        console.log(`预加载${type}地图API`);
        const promise = MapLoader.load(type, key, options);
        this.cache.set(type, promise);

        return promise;
      }

      getLoader(type) {
        if (this.cache.has(type)) {
          return this.cache.get(type).then(({ api }) => api);
        }
        return null;
      }
    }

    // 使用示例
    const preloader = new MapPreloader();

    // 页面初始化时预加载
    window.addEventListener("DOMContentLoaded", () => {
      preloader.preload("tianditu", "tianditu-key");
      preloader.preload("amap", "amap-key");
    });

    // 使用时直接获取
    async function showMap(type, containerId) {
      const api = await preloader.getLoader(type);
      if (api) {
        // 使用缓存的 API
      }
    }
    ```

## TypeScript 类型定义

```typescript
// types.ts
declare namespace MapLoader {
  interface MapOptions {
    center?: [number, number];
    zoom?: number;
    [key: string]: any;
  }

  interface LoaderOptions {
    type: "tianditu" | "baidu" | "amap";
    protocol?: string;
    version?: string;
    baiduType?: string;
    services?: string;
    securityJsCode?: string;
    plugins?: string[];
    [key: string]: any;
  }

  interface LoadResult {
    api: any;
    type: string;
    instance: {
      Map: any;
      LngLat?: any;
      Point?: any;
      Size?: any;
    };
  }

  function load(
    type: string,
    key: string,
    options?: LoaderOptions
  ): Promise<LoadResult>;
  function create(
    type: string,
    key: string,
    containerId: string,
    options?: {
      mapOptions?: MapOptions;
      [key: string]: any;
    }
  ): Promise<any>;
}

declare class MapAPILoader {
  constructor(options?: MapLoader.LoaderOptions);
  load(
    key: string,
    options?: MapLoader.LoaderOptions
  ): Promise<MapLoader.LoadResult>;
  createMap(containerId: string, options?: MapLoader.MapOptions): any;
  isLoaded(): boolean;
  getMapType(): string;
  destroy(): void;
}
```

## 浏览器支持

| 浏览器       | 支持情况 | 备注               |
| ------------ | -------- | ------------------ |
| Chrome 60+   | ✅       | 完全支持           |
| Firefox 55+  | ✅       | 完全支持           |
| Safari 11+   | ✅       | 完全支持           |
| Edge 79+     | ✅       | 完全支持           |
| IE 11        | ⚠️       | 有限支持           |
| 移动端浏览器 | ✅       | Android 5+/iOS 10+ |

## 最佳实践

- **密钥管理:** 不要在客户端代码中硬编码密钥，使用后端接口动态获取
- **错误处理:** 总是使用 `try-catch` 处理地图加载错误
- **资源清理:** 页面卸载时调用 `destroy()` 方法清理资源
- **性能监控:** 监控地图加载时间和内存使用
- **降级策略:** 当首选地图服务失败时，自动切换到备用服务

## 常见问题解答

**Q1: 如何同时使用多个地图服务？**

A: 创建多个 `MapAPILoader` 实例，但注意清理资源以避免冲突。

**Q2: 地图加载慢怎么办？**

A: 使用预加载、懒加载策略，或考虑使用 CDN 加速。

**Q3: 如何自定义地图样式？**

A: 各个地图服务都有自定义样式的方法，加载成功后通过各自的 API 进行配置。

**Q4: 支持离线地图吗？**

A: 需要集成各个地图的离线 SDK，本加载器主要处理在线地图加载。

**Q5: 如何测试地图功能？**

A: 使用各个地图服务提供的测试密钥进行开发测试。
