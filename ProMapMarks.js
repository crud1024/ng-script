// 天地图加载器-坐标拾取系统
class TMapLoaderPick {
  constructor(tk) {
    this.tk = tk; // 天地图API密钥
    this.isLoaded = false;
    this.callbacks = [];
  }

  // 加载天地图API
  load(callback) {
    if (this.isLoaded) {
      callback && callback();
      return;
    }

    if (callback) {
      this.callbacks.push(callback);
    }

    // 防止重复加载
    if (window._tMapLoading) {
      return;
    }
    window._tMapLoading = true;

    // 创建script标签加载天地图API
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${this.tk}`;
    script.onerror = () => {
      console.error("天地图API加载失败");
      this.handleError("天地图API加载失败");
    };

    // 检查是否已加载
    const checkLoad = () => {
      if (typeof T !== "undefined" && T.Map) {
        this.isLoaded = true;
        window._tMapLoading = false;
        this.callbacks.forEach((cb) => cb());
        this.callbacks = [];
      } else {
        setTimeout(checkLoad, 100);
      }
    };

    script.onload = checkLoad;
    document.head.appendChild(script);
  }

  // 错误处理
  handleError(message) {
    console.error(message);
    window._tMapLoading = false;
    this.callbacks = [];
  }
}

// 地图管理器
class TMapManagerPick {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = Object.assign(
      {
        center: { lng: 116.397428, lat: 39.90923 }, // 默认中心点(北京)
        zoom: 12, // 默认缩放级别
        enableScrollWheelZoom: true, // 允许鼠标滚轮缩放
        enableMapTypeControl: true, // 启用地图类型控件
      },
      options
    );

    this.map = null;
    this.loader = new TMapLoaderPick(options.tk);
    this.searchControl = null;
    this.mapTypeControl = null; // 地图类型控件
    this.localsearch = null;
    this.currentMarkers = []; // 存储当前标记
    this.currentPolylines = []; // 存储当前线
    this.currentPolygons = []; // 存储当前面

    // 坐标拾取相关
    this.coordinatePanel = null; // 坐标信息面板
    this.lastClickLngLat = null; // 最后点击的坐标
    this.tk = options.tk; // 保存TK

    // 控件状态管理
    this.controlStates = {
      mapTypeControl: this.options.enableMapTypeControl,
    };

    // 自定义事件回调
    this.customCopyCallback = null;

    // 当前几何类型：0-点，1-线，2-面
    this.currentGeometryType = 0;
    this.currentGeometryData = null; // 当前显示的几何数据

    // 定义锚点常量
    this.defineAnchors();
  }

  // 定义锚点常量
  defineAnchors() {
    if (typeof T_ANCHOR_TOP_LEFT === "undefined") {
      window.T_ANCHOR_TOP_LEFT = 0;
      window.T_ANCHOR_TOP_RIGHT = 1;
      window.T_ANCHOR_BOTTOM_LEFT = 2;
      window.T_ANCHOR_BOTTOM_RIGHT = 3;
    }
  }

  // 绑定自定义复制事件
  bindCustomCopyEvent(callback) {
    this.customCopyCallback = callback;
    console.log("自定义复制事件已绑定");
  }

  // 执行自定义复制事件
  executeCustomCopyEvent(data) {
    if (
      this.customCopyCallback &&
      typeof this.customCopyCallback === "function"
    ) {
      try {
        this.customCopyCallback(data);
      } catch (error) {
        console.error("执行自定义复制事件时出错:", error);
      }
    }
  }

  // 初始化地图
  init() {
    // 确保容器存在
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`容器 #${this.containerId} 不存在`);
      return;
    }

    // 创建主容器，用于容纳地图和坐标面板
    container.style.cssText = `
            width: ${this.options.width || "100%"};
            height: ${this.options.height || "600px"};
            position: relative;
            display: flex;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        `;

    // 创建地图容器（占80%）
    const mapContainer = document.createElement("div");
    mapContainer.id = "tmap-container";
    mapContainer.style.cssText = `
            flex: 0 0 80%;
            height: 100%;
            position: relative;
            background: #f5f5f5;
        `;

    // 创建坐标面板容器（占20%）
    const panelContainer = document.createElement("div");
    panelContainer.id = "coordinate-panel-container";
    panelContainer.style.cssText = `
            flex: 0 0 20%;
            height: 100%;
            background: white;
            border-left: 1px solid #e0e0e0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

    // 清空原容器内容并添加新容器
    container.innerHTML = "";
    container.appendChild(mapContainer);
    container.appendChild(panelContainer);

    // 加载天地图API并初始化地图
    this.loader.load(() => {
      try {
        // 创建自定义图层
        const imageURL =
          "https://t0.tianditu.gov.cn/img_w/wmts?" +
          "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles" +
          "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
          this.options.tk;

        const layer = new T.TileLayer(imageURL, {
          minZoom: this.options.minZoom || 1,
          maxZoom: this.options.maxZoom || 18,
        });

        const config = {
          layers: [layer],
          datasourcesControl: true, // 启用数据源控制
        };

        // 初始化地图对象（使用新的地图容器）
        this.map = new T.Map("tmap-container", config);

        // 设置显示地图的中心点和级别
        const point = new T.LngLat(
          this.options.center.lng,
          this.options.center.lat
        );
        this.map.centerAndZoom(point, this.options.zoom);

        if (this.options.enableScrollWheelZoom) {
          this.map.enableScrollWheelZoom();
        }

        console.log("天地图初始化成功");

        // 创建坐标拾取面板
        this.createCoordinatePanel();

        // 添加地图类型控件
        if (this.controlStates.mapTypeControl) {
          this.addMapTypeControl();
        }

        // 创建本地搜索对象
        this.createLocalSearch();

        // 创建搜索定位组件（包含导入按钮）
        this.createSearchControl();

        // 绑定地图点击事件（坐标拾取）
        this.bindCoordinatePickEvents();

        // 触发自定义事件
        if (typeof this.options.onLoad === "function") {
          this.options.onLoad(this.map);
        }

        // 地图加载完成后自动刷新一次
        setTimeout(() => {
          this.refreshControls();
        }, 1000);
      } catch (error) {
        console.error("天地图初始化失败:", error);
        // 显示错误信息
        mapContainer.innerHTML = `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="color: #dc3545; margin-bottom: 10px;">地图加载失败</div>
                        <div style="color: #666; font-size: 12px;">${error.message}</div>
                    </div>
                `;
      }
    });
  }

  // 创建坐标拾取面板
  createCoordinatePanel() {
    const panelContainer = document.getElementById(
      "coordinate-panel-container"
    );
    if (!panelContainer) return;

    // 创建面板容器
    this.coordinatePanel = document.createElement("div");
    this.coordinatePanel.className = "coordinate-panel";
    this.coordinatePanel.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            background: white;
            display: flex;
            flex-direction: column;
        `;

    // 面板标题
    const title = document.createElement("h3");
    title.innerHTML = "坐标拾取信息";
    title.style.cssText = `
            margin: 0 0 20px 0;
            color: #333;
            font-size: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
            flex-shrink: 0;
        `;

    // 坐标信息区域
    const coordinateInfo = document.createElement("div");
    coordinateInfo.id = "coordinateInfo";
    coordinateInfo.style.cssText = `
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            flex-shrink: 0;
        `;

    coordinateInfo.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">经度 (Lng)</div>
                <div class="copyable-value" data-type="lng" style="font-size: 14px; color: #333; font-weight: 500; word-break: break-all; padding: 5px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; cursor: pointer; transition: all 0.2s; position: relative;"
                     onmouseover="this.style.background='#f0f7ff'; this.style.borderColor='#3388ff';"
                     onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                    <div id="lngValue" style="display: inline-block;">--</div>
                    <div class="copy-hint" style="display: none; position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; white-space: nowrap;">点击复制</div>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">纬度 (Lat)</div>
                <div class="copyable-value" data-type="lat" style="font-size: 14px; color: #333; font-weight: 500; word-break: break-all; padding: 5px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; cursor: pointer; transition: all 0.2s; position: relative;"
                     onmouseover="this.style.background='#f0f7ff'; this.style.borderColor='#3388ff';"
                     onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                    <div id="latValue" style="display: inline-block;">--</div>
                    <div class="copy-hint" style="display: none; position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; white-space: nowrap;">点击复制</div>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">详细地址</div>
                <div class="copyable-value" data-type="address" style="font-size: 14px; color: #333; line-height: 1.4; word-break: break-all; padding: 5px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; min-height: 40px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; position: relative;"
                     onmouseover="this.style.background='#f0f7ff'; this.style.borderColor='#3388ff';"
                     onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                    <div id="formattedAddressValue" style="display: inline-block;">--</div>
                    <div class="copy-hint" style="display: none; position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; white-space: nowrap;">点击复制</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <div style="font-size: 12px; color: #666;">行政区</div>
                    <div id="cityValue" style="font-size: 12px; color: #333; font-weight: 500;">--</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <div style="font-size: 12px; color: #666;">最近道路</div>
                    <div id="roadValue" style="font-size: 12px; color: #333; font-weight: 500;">--</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <div style="font-size: 12px; color: #666;">最近POI</div>
                    <div id="poiValue" style="font-size: 12px; color: #333; font-weight: 500;">--</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <div style="font-size: 12px; color: #666;">最近地点</div>
                    <div id="addressValue" style="font-size: 12px; color: #333; font-weight: 500;">--</div>
                </div>
            </div>
        `;

    // 操作按钮区域 - 使用Flex布局
    const buttonArea = document.createElement("div");
    buttonArea.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex-shrink: 0;
        `;

    // 第一行按钮容器（三个按钮）
    const buttonRow1 = document.createElement("div");
    buttonRow1.style.cssText = `
            display: flex;
            gap: 10px;
            width: 100%;
        `;

    // 第二行按钮容器（两个按钮）
    const buttonRow2 = document.createElement("div");
    buttonRow2.style.cssText = `
            display: flex;
            gap: 10px;
            width: 100%;
        `;

    // 添加标记按钮
    const addMarkerButton = this.createButton(
      "添加标记",
      "#3388ff",
      "addMarkerBtn"
    );
    // 清除标记按钮
    const clearMarkerButton = this.createButton(
      "清除标记",
      "#ffc107",
      "clearMarkerBtn"
    );
    // 复制信息按钮
    const copyInfoButton = this.createButton(
      "确认信息",
      "#28a745",
      "copyInfoBtn"
    );

    addMarkerButton.style.flex = "1";
    clearMarkerButton.style.flex = "1";
    copyInfoButton.style.flex = "1";

    buttonRow1.appendChild(addMarkerButton);
    buttonRow1.appendChild(clearMarkerButton);
    buttonRow1.appendChild(copyInfoButton);

    // 添加按钮行到按钮区域
    buttonArea.appendChild(buttonRow1);
    buttonArea.appendChild(buttonRow2);

    // 使用说明
    const instructions = document.createElement("div");
    instructions.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #f1f8ff;
            border-radius: 6px;
            border-left: 4px solid #3388ff;
            font-size: 12px;
            color: #666;
            line-height: 1.5;
            flex-shrink: 0;
        `;
    instructions.innerHTML = `
            <strong>使用说明：</strong><br>
            1. 点击地图任意位置获取坐标<br>
            2. 鼠标悬停在坐标/地址值上，点击可复制<br>
            3. 点击"添加标记"在地图上添加标记<br>
            4. 点击"清除标记"清除所有标记<br>
            5. 点击"确认信息"按钮复制完整信息并添加到明细<br>
            6. 点击搜索控件中的"导入线/面"图标导入ovjsn格式的文件<br>
        `;
    // 7. 自定义复制事件：可通过bindCustomCopyEvent方法绑定额外事件
    // 组装面板
    this.coordinatePanel.appendChild(title);
    this.coordinatePanel.appendChild(coordinateInfo);
    this.coordinatePanel.appendChild(buttonArea);
    this.coordinatePanel.appendChild(instructions);

    // 添加到面板容器
    panelContainer.appendChild(this.coordinatePanel);

    // 绑定按钮事件
    this.bindCoordinatePanelEvents();
  }

  // 创建按钮的辅助方法
  createButton(text, color, id) {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = text;
    button.style.cssText = `
            padding: 12px 8px;
            background: ${color};
            color: ${color === "#ffc107" ? "#333" : "white"};
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            font-weight: 500;
            min-height: 44px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;

    // 悬停效果
    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "none";
    });

    return button;
  }

  // 绑定坐标拾取面板事件
  bindCoordinatePanelEvents() {
    // 添加标记
    document.getElementById("addMarkerBtn").addEventListener("click", () => {
      if (this.lastClickLngLat) {
        this.addMarker(this.lastClickLngLat.lng, this.lastClickLngLat.lat, {
          title: `标记点 (${this.lastClickLngLat.lng.toFixed(
            6
          )}, ${this.lastClickLngLat.lat.toFixed(6)})`,
        });
        this.showTempMessage("标记已添加");
      } else {
        this.showTempMessage("请先点击地图选择位置");
      }
    });

    // 清除标记
    document.getElementById("clearMarkerBtn").addEventListener("click", () => {
      this.clearAll();
      this.showTempMessage("所有标记已清除");
    });

    // 复制信息（控制台输出）
    document.getElementById("copyInfoBtn").addEventListener("click", () => {
      if (this.lastClickLngLat) {
        const lng = document.getElementById("lngValue").textContent;
        const lat = document.getElementById("latValue").textContent;
        const formattedAddress = document.getElementById(
          "formattedAddressValue"
        ).textContent;
        const city = document.getElementById("cityValue").textContent;
        const road = document.getElementById("roadValue").textContent;
        const poi = document.getElementById("poiValue").textContent;
        const address = document.getElementById("addressValue").textContent;

        let info = {
          时间: new Date().toLocaleString(),
          坐标系统: "WGS84",
        };

        // 根据当前几何类型构建不同的信息
        if (this.currentGeometryType === 0) {
          // 点
          info = {
            ...info,
            经度: lng,
            纬度: lat,
            详细地址: formattedAddress,
            行政区: city,
            最近道路: road,
            最近POI: poi,
            最近地点: address,
            原始坐标: {
              lng: this.lastClickLngLat.lng,
              lat: this.lastClickLngLat.lat,
            },
            地址信息: this.lastAddressInfo || null,
          };
        } else if (this.currentGeometryType === 1) {
          // 线
          const latlng = this.currentGeometryData?.latlng || [];
          info = {
            ...info,
            几何类型: "线",
            名称: this.currentGeometryData?.name || "未命名线",
            坐标数量: latlng.length / 2,
            示例点经度: lng,
            示例点纬度: lat,
            示例点地址: formattedAddress,
            原始数据: this.currentGeometryData,
          };
        } else if (this.currentGeometryType === 2) {
          // 面
          const latlng = this.currentGeometryData?.latlng || [];
          info = {
            ...info,
            几何类型: "面",
            名称: this.currentGeometryData?.name || "未命名面",
            坐标数量: latlng.length / 2,
            示例点经度: lng,
            示例点纬度: lat,
            示例点地址: formattedAddress,
            原始数据: this.currentGeometryData,
          };
        }

        console.log("坐标详细信息:", info);
        console.log("完整信息JSON:", JSON.stringify(info, null, 2));

        // 可以复制到剪贴板
        let infoText = `坐标详细信息：\n`;
        for (const [key, value] of Object.entries(info)) {
          if (typeof value === "object") {
            infoText += `${key}: ${JSON.stringify(value)}\n`;
          } else {
            infoText += `${key}: ${value}\n`;
          }
        }

        this.copyToClipboard(infoText, "完整坐标信息");

        // 执行自定义复制事件
        this.executeCustomCopyEvent(info);
      } else {
        this.showTempMessage("请先点击地图选择位置或导入几何数据");
      }
    });

    // 绑定可复制值的点击事件
    const copyableValues = document.querySelectorAll(".copyable-value");
    copyableValues.forEach((element) => {
      // 鼠标悬停显示提示
      element.addEventListener("mouseenter", (e) => {
        const hint = element.querySelector(".copy-hint");
        if (hint && !element.classList.contains("no-data")) {
          hint.style.display = "block";
        }
      });

      element.addEventListener("mouseleave", (e) => {
        const hint = element.querySelector(".copy-hint");
        if (hint) {
          hint.style.display = "none";
        }
      });

      // 点击复制
      element.addEventListener("click", (e) => {
        const type = element.getAttribute("data-type");
        let value = "";
        let message = "";

        switch (type) {
          case "lng":
            value = document.getElementById("lngValue").textContent;
            message = "经度";
            break;
          case "lat":
            value = document.getElementById("latValue").textContent;
            message = "纬度";
            break;
          case "address":
            value = document.getElementById(
              "formattedAddressValue"
            ).textContent;
            message = "详细地址";
            break;
        }

        if (value !== "--") {
          this.copyToClipboard(value, message);
        } else {
          this.showTempMessage("请先点击地图选择位置");
        }
      });
    });
  }

  // 导入几何数据（线或面）
  importGeometryData(type) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ovjsn";
    input.style.display = "none";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          this.processGeometryData(jsonData, type, file.name);
        } catch (error) {
          console.error("文件解析失败:", error);
          this.showTempMessage("文件格式错误，请选择正确的ovjsn文件");
        }
      };
      reader.readAsText(file);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  // 处理几何数据
  processGeometryData(jsonData, type, fileName) {
    try {
      // 验证数据格式
      if (
        !jsonData.ObjItems ||
        !jsonData.ObjItems[0] ||
        !jsonData.ObjItems[0].Object
      ) {
        throw new Error("数据格式不正确");
      }

      const objItem = jsonData.ObjItems[0];
      const obj = objItem.Object;
      const objDetail = obj.ObjectDetail;

      if (!objDetail || !objDetail.Latlng || objDetail.Latlng.length < 4) {
        throw new Error("坐标数据不完整");
      }

      // 清除所有现有几何图形
      this.clearAll();

      // 设置当前几何类型和数据
      this.currentGeometryType = type;
      this.currentGeometryData = {
        name: obj.Name || fileName.replace(".ovjsn", ""),
        latlng: objDetail.Latlng,
        jsonData: jsonData,
      };

      const latlng = objDetail.Latlng;
      const lnglats = [];

      // 转换坐标格式：Latlng数组是 [lat1, lng1, lat2, lng2, ...]
      for (let i = 0; i < latlng.length; i += 2) {
        if (i + 1 < latlng.length) {
          const lat = latlng[i];
          const lng = latlng[i + 1];
          lnglats.push(new T.LngLat(lng, lat));
        }
      }

      if (type === 1) {
        // 绘制线
        const polyline = new T.Polyline(lnglats, {
          color: "blue",
          weight: 3,
          opacity: 1,
          lineStyle: "solid",
        });
        this.map.addOverLay(polyline);
        this.currentPolylines.push(polyline);

        // 计算线的中心点
        const centerLng =
          lnglats.reduce((sum, point) => sum + point.lng, 0) / lnglats.length;
        const centerLat =
          lnglats.reduce((sum, point) => sum + point.lat, 0) / lnglats.length;

        // 设置地图视图
        this.map.centerAndZoom(new T.LngLat(centerLng, centerLat), 10);

        // 更新坐标面板（使用第一个点作为示例）
        if (lnglats.length > 0) {
          this.lastClickLngLat = lnglats[0];
          const lng = lnglats[0].lng.toFixed(6);
          const lat = lnglats[0].lat.toFixed(6);

          document.getElementById("lngValue").textContent = lng;
          document.getElementById("latValue").textContent = lat;
          document.getElementById("formattedAddressValue").textContent = `线：${
            obj.Name || "未命名线"
          }（${lnglats.length}个点）`;

          // 执行逆地理编码获取地址
          this.reverseGeocode(lng, lat);
        }

        this.showTempMessage("线数据导入成功");
      } else if (type === 2) {
        // 绘制面
        const polygon = new T.Polygon(lnglats, {
          color: "green",
          weight: 2,
          opacity: 0.5,
          fillColor: "green",
          fillOpacity: 0.2,
        });
        this.map.addOverLay(polygon);
        this.currentPolygons.push(polygon);

        // 计算面的中心点
        const centerLng =
          lnglats.reduce((sum, point) => sum + point.lng, 0) / lnglats.length;
        const centerLat =
          lnglats.reduce((sum, point) => sum + point.lat, 0) / lnglats.length;

        // 设置地图视图
        this.map.centerAndZoom(new T.LngLat(centerLng, centerLat), 10);

        // 更新坐标面板（使用第一个点作为示例）
        if (lnglats.length > 0) {
          this.lastClickLngLat = lnglats[0];
          const lng = lnglats[0].lng.toFixed(6);
          const lat = lnglats[0].lat.toFixed(6);

          document.getElementById("lngValue").textContent = lng;
          document.getElementById("latValue").textContent = lat;
          document.getElementById("formattedAddressValue").textContent = `面：${
            obj.Name || "未命名面"
          }（${lnglats.length}个点）`;

          // 执行逆地理编码获取地址
          this.reverseGeocode(lng, lat);
        }

        this.showTempMessage("面数据导入成功");
      }

      console.log("几何数据导入成功:", this.currentGeometryData);
    } catch (error) {
      console.error("处理几何数据失败:", error);
      this.showTempMessage(`导入失败: ${error.message}`);
    }
  }

  // 绑定坐标拾取事件
  bindCoordinatePickEvents() {
    if (!this.map) return;

    // 地图点击事件
    this.map.addEventListener("click", (e) => {
      this.lastClickLngLat = e.lnglat;
      this.currentGeometryType = 0; // 点击地图时重置为点
      this.currentGeometryData = null;

      // 更新坐标显示
      const lng = e.lnglat.lng.toFixed(6);
      const lat = e.lnglat.lat.toFixed(6);

      document.getElementById("lngValue").textContent = lng;
      document.getElementById("latValue").textContent = lat;

      // 清空地址信息
      document.getElementById("formattedAddressValue").textContent =
        "获取地址中...";
      document.getElementById("cityValue").textContent = "--";
      document.getElementById("roadValue").textContent = "--";
      document.getElementById("poiValue").textContent = "--";
      document.getElementById("addressValue").textContent = "--";

      // 更新可复制值的状态
      const copyableValues = document.querySelectorAll(".copyable-value");
      copyableValues.forEach((element) => {
        element.classList.remove("no-data");
      });

      // 执行逆地理编码获取地址
      this.reverseGeocode(lng, lat);

      console.log("坐标拾取:", lng, lat);
    });
  }

  // 逆地理编码获取地址 - 根据文档格式
  reverseGeocode(lng, lat) {
    // 根据文档构造请求URL
    const postStr = `{'lon':${lng},'lat':${lat},'ver':1}`;
    const url = `https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lng},'lat':${lat},'ver':1}&type=geocode&tk=${this.tk}`;

    console.log("逆地理编码请求URL:", url);

    // 使用fetch API请求
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("逆地理编码响应:", data);

        if (data.status === "0" && data.result) {
          const result = data.result;

          // 更新详细地址
          const addressValue = result.formatted_address || "未知地址";
          document.getElementById("formattedAddressValue").textContent =
            addressValue;

          // 更新地址组件信息
          if (result.addressComponent) {
            const addrComp = result.addressComponent;

            document.getElementById("cityValue").textContent =
              addrComp.city || "--";

            document.getElementById("roadValue").textContent = addrComp.road
              ? `${addrComp.road} (${addrComp.road_distance || 0}米)`
              : "--";

            document.getElementById("poiValue").textContent = addrComp.poi
              ? `${addrComp.poi} (${addrComp.poi_distance || 0}米)`
              : "--";

            document.getElementById("addressValue").textContent =
              addrComp.address
                ? `${addrComp.address} (${addrComp.address_distance || 0}米)`
                : "--";
          } else {
            // 如果没有地址组件信息，只显示详细地址
            document.getElementById("cityValue").textContent = "--";
            document.getElementById("roadValue").textContent = "--";
            document.getElementById("poiValue").textContent = "--";
            document.getElementById("addressValue").textContent = "--";
          }

          // 保存完整的地址信息
          this.lastAddressInfo = data;
          console.log("地址获取成功");
        } else {
          // 处理错误情况
          console.error("逆地理编码错误:", data.msg || "未知错误");
          document.getElementById(
            "formattedAddressValue"
          ).textContent = `地址获取失败: ${data.msg || "未知错误"}`;
          this.clearAddressComponents();
        }
      })
      .catch((error) => {
        console.error("逆地理编码请求失败:", error);
        document.getElementById("formattedAddressValue").textContent =
          "地址获取失败: 网络错误";
        this.clearAddressComponents();

        // 尝试备用方案
        this.fallbackGeocode(lng, lat);
      });
  }

  // 清空地址组件
  clearAddressComponents() {
    document.getElementById("cityValue").textContent = "--";
    document.getElementById("roadValue").textContent = "--";
    document.getElementById("poiValue").textContent = "--";
    document.getElementById("addressValue").textContent = "--";
  }

  // 备用的逆地理编码方法
  fallbackGeocode(lng, lat) {
    // 尝试使用天地图的另一个API端点
    const backupUrl = `https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lng},'lat':${lat},'ver':1}&type=geocode&tk=${this.tk}`;

    fetch(backupUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 0 && data.location) {
          // 简化的地址显示
          document.getElementById("formattedAddressValue").textContent =
            data.location.formatted_address || `${lng}, ${lat}`;
          this.clearAddressComponents();
        } else {
          document.getElementById(
            "formattedAddressValue"
          ).textContent = `${lng}, ${lat}`;
        }
      })
      .catch(() => {
        // 如果都失败，至少显示坐标
        document.getElementById(
          "formattedAddressValue"
        ).textContent = `${lng}, ${lat}`;
      });
  }

  // 添加地图类型控件
  addMapTypeControl() {
    if (!this.map) return;

    try {
      // 先移除现有的地图类型控件
      if (this.mapTypeControl) {
        this.map.removeControl(this.mapTypeControl);
      }

      // 创建地图类型控件
      this.mapTypeControl = new T.Control.MapType({
        anchor: T_ANCHOR_TOP_RIGHT,
        offset: new T.Point(10, 80),
      });

      // 添加地图类型控件到地图
      this.map.addControl(this.mapTypeControl);

      console.log("地图类型控件添加成功");
    } catch (error) {
      console.error("添加地图类型控件失败:", error);
    }
  }

  // 移除地图类型控件
  removeMapTypeControl() {
    if (this.mapTypeControl) {
      this.map.removeControl(this.mapTypeControl);
      this.mapTypeControl = null;
    }
  }

  // 刷新控件
  refreshControls() {
    console.log("刷新地图控件");

    if (this.controlStates.mapTypeControl) {
      this.addMapTypeControl();
    }

    this.showTempMessage("地图控件已刷新");
  }

  // 创建本地搜索对象
  createLocalSearch() {
    const config = {
      pageCapacity: 10,
      onSearchComplete: (result) => {
        this.localSearchResult(result);
      },
    };
    this.localsearch = new T.LocalSearch(this.map, config);
  }

  // 创建搜索定位组件 - 优化按钮显示效果，添加导入按钮
  createSearchControl() {
    const mapContainer = document.getElementById("tmap-container");
    if (!mapContainer) return;

    // 创建搜索控件容器
    this.searchControl = document.createElement("div");
    this.searchControl.className = "tmap-search-control";
    this.searchControl.style.cssText = `
            position: absolute;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            min-width: 300;
            max-width: 300;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

    // 搜索容器（输入框和按钮在一行）
    const searchRow = document.createElement("div");
    searchRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
        `;

    // 搜索输入框
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "搜索地点...";
    searchInput.style.cssText = `
            flex: 1;
            padding: 8px 10px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            font-size: 14px;
            outline: none;
            background: rgba(255, 255, 255, 0.9);
            box-sizing: border-box;
            min-width: 160px;
        `;

    // 搜索按钮 - 精美SVG图标
    const searchButton = document.createElement("button");
    searchButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3388ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        `;
    searchButton.title = "搜索";
    searchButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 0;
            background: transparent;
            color: #3388ff;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

    // 控件管理按钮 - 精美SVG图标
    const controlButton = document.createElement("button");
    controlButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;
    controlButton.title = "地图控件";
    controlButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 0;
            background: transparent;
            color: #28a745;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

    // 导入线按钮
    const importLineButton = document.createElement("button");
    importLineButton.innerHTML = `
            <svg t="1765880910663" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1732" width="20" height="20">
                <path d="M933.5296 66.1504a163.84 163.84 0 0 1-201.5744 255.488 37.7344 37.7344 0 0 1-2.9696 3.3792l-405.504 405.504a39.424 39.424 0 0 1-3.328 2.9696A163.8912 163.8912 0 1 1 266.24 679.5264a38.912 38.912 0 0 1 2.9696-3.328l405.504-405.504c1.024-1.024 2.1504-2.048 3.328-2.9696a163.8912 163.8912 0 0 1 255.488-201.5744z m-54.272 54.272a87.04 87.04 0 1 1-123.136 123.136 87.04 87.04 0 0 1 123.136-123.0848zM242.0736 880.7936a87.04 87.04 0 1 0-123.136-123.0848 87.04 87.04 0 0 0 123.136 123.0848z" p-id="1733" fill="#9c27b0"></path>
            </svg>
        `;
    importLineButton.title = "导入线";
    importLineButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

    // 导入面按钮
    const importPolygonButton = document.createElement("button");
    importPolygonButton.innerHTML = `
            <svg t="1765880975025" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3221" width="20" height="20">
                <path d="M896 801.632V222.368c36.48-7.424 64-39.744 64-78.368C960 99.904 924.128 64 880 64c-38.656 0-70.944 27.52-78.368 64H222.368A80.096 80.096 0 0 0 144 64 80.096 80.096 0 0 0 64 144c0 38.624 27.52 70.944 64 78.368V801.6c-36.48 7.424-64 39.744-64 78.368A80.096 80.096 0 0 0 144 960c38.624 0 70.944-27.52 78.368-64H801.6c7.424 36.48 39.744 64 78.368 64A80 80 0 1 0 896 801.632z m-704 14.784V207.584c5.888-4.448 11.136-9.696 15.584-15.584h608.8c4.48 5.888 9.696 11.136 15.584 15.584v608.8c-5.92 4.48-11.136 9.696-15.616 15.616H207.584A79.04 79.04 0 0 0 192 816.416z" p-id="3222" fill="#ff9800"></path>
            </svg>
        `;
    importPolygonButton.title = "导入面";
    importPolygonButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

    // 搜索结果容器
    const resultsContainer = document.createElement("div");
    resultsContainer.style.cssText = `
            max-height: 0;
            overflow-y: auto;
            transition: max-height 0.2s ease;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 4px;
            margin-top: 8px;
        `;

    // 控件管理面板
    const controlPanel = document.createElement("div");
    controlPanel.className = "control-panel";
    controlPanel.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            margin-top: 5px;
            min-width: 150px;
            z-index: 1001;
        `;

    controlPanel.innerHTML = `
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #333;">地图控件</div>
            <label style="display: flex; align-items: center; margin-bottom: 6px; font-size: 12px; cursor: pointer;">
                <input type="checkbox" id="toggleMapType" ${
                  this.controlStates.mapTypeControl ? "checked" : ""
                }>
                <span style="margin-left: 5px;">地图类型</span>
            </label>
            <button id="refreshControls" style="width: 100%; padding: 4px 8px; background: #3388ff; color: white; border: none; border-radius: 3px; font-size: 11px; cursor: pointer; margin-top: 5px;">
                刷新控件
            </button>
        `;

    // 组装搜索行
    searchRow.appendChild(searchInput);
    searchRow.appendChild(searchButton);
    searchRow.appendChild(controlButton);
    searchRow.appendChild(importLineButton);
    searchRow.appendChild(importPolygonButton);

    // 组装组件
    this.searchControl.appendChild(searchRow);
    this.searchControl.appendChild(resultsContainer);
    this.searchControl.appendChild(controlPanel);
    mapContainer.appendChild(this.searchControl);

    // 搜索功能
    searchButton.onclick = () => {
      const keyword = searchInput.value.trim();
      if (keyword) {
        this.performSearch(keyword, resultsContainer);
      }
    };

    searchInput.onkeypress = (e) => {
      if (e.key === "Enter") {
        const keyword = searchInput.value.trim();
        if (keyword) {
          this.performSearch(keyword, resultsContainer);
        }
      }
    };

    // 控件管理功能
    controlButton.onclick = () => {
      controlPanel.style.display =
        controlPanel.style.display === "none" ? "block" : "none";
    };

    // 导入线功能
    importLineButton.onclick = () => {
      this.importGeometryData(1); // 1表示线
    };

    // 导入面功能
    importPolygonButton.onclick = () => {
      this.importGeometryData(2); // 2表示面
    };

    // 控件管理事件
    controlPanel
      .querySelector("#toggleMapType")
      .addEventListener("change", (e) => {
        this.controlStates.mapTypeControl = e.target.checked;
        if (e.target.checked) {
          this.addMapTypeControl();
        } else {
          this.removeMapTypeControl();
        }
      });

    controlPanel
      .querySelector("#refreshControls")
      .addEventListener("click", () => {
        this.refreshControls();
      });

    // 点击其他地方关闭控件面板
    document.addEventListener("click", (e) => {
      if (!this.searchControl.contains(e.target)) {
        controlPanel.style.display = "none";
      }
    });

    // 按钮悬停效果
    const addButtonHoverEffects = (button, color) => {
      button.addEventListener("mouseenter", () => {
        button.style.background = `${color}15`;
        button.style.transform = "translateY(-1px) scale(1.1)";
        button.style.boxShadow = `0 4px 12px ${color}40`;
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "transparent";
        button.style.transform = "translateY(0) scale(1)";
        button.style.boxShadow = "none";
      });

      button.addEventListener("mousedown", () => {
        button.style.transform = "translateY(1px) scale(0.95)";
        button.style.boxShadow = `0 2px 6px ${color}30`;
      });

      button.addEventListener("mouseup", () => {
        button.style.transform = "translateY(-1px) scale(1.1)";
        button.style.boxShadow = `0 4px 12px ${color}40`;
      });

      // 触摸设备适配
      button.addEventListener("touchstart", () => {
        button.style.transform = "translateY(1px) scale(0.95)";
        button.style.boxShadow = `0 2px 6px ${color}30`;
      });

      button.addEventListener("touchend", () => {
        button.style.transform = "translateY(0) scale(1)";
        button.style.boxShadow = "none";
      });
    };

    addButtonHoverEffects(searchButton, "#3388ff");
    addButtonHoverEffects(controlButton, "#28a745");
    addButtonHoverEffects(importLineButton, "#9c27b0");
    addButtonHoverEffects(importPolygonButton, "#ff9800");

    // 为搜索输入框添加焦点效果
    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = "#3388ff";
      searchInput.style.boxShadow = "0 0 0 3px rgba(51, 136, 255, 0.1)";
    });

    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = "rgba(0, 0, 0, 0.1)";
      searchInput.style.boxShadow = "none";
    });
  }

  // 执行搜索
  performSearch(keyword, resultsContainer) {
    if (!this.map || !this.localsearch) return;

    this.clearAll();

    resultsContainer.innerHTML = "";
    resultsContainer.style.maxHeight = "180px";
    resultsContainer.style.marginTop = "8px";

    resultsContainer.innerHTML = `
            <div style="padding: 10px; text-align: center; color: #666; font-size: 12px;">
                搜索中...
            </div>
        `;

    this.localsearch.search(keyword);
  }

  // 处理搜索结果
  localSearchResult(result) {
    const resultsContainer =
      this.searchControl?.querySelector("div:nth-child(2)");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = "";
    resultsContainer.style.maxHeight = "180px";
    resultsContainer.style.marginTop = "8px";

    this.showPromptResults(result, resultsContainer);

    switch (parseInt(result.getResultType())) {
      case 1:
        this.showPoisResults(result.getPois(), resultsContainer);
        break;
      case 2:
        this.showStatisticsResults(result.getStatistics(), resultsContainer);
        break;
      case 3:
        this.showAreaResults(result.getArea(), resultsContainer);
        break;
      case 4:
        this.showSuggestsResults(result.getSuggests(), resultsContainer);
        break;
      case 5:
        this.showLineDataResults(result.getLineData(), resultsContainer);
        break;
      default:
        this.showNoResults(resultsContainer);
    }
  }

  // 显示提示词结果
  showPromptResults(result, container) {
    const prompts = result.getPrompt && result.getPrompt();
    if (!prompts || prompts.length === 0) return;

    let promptHtml = "";
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      const promptType = prompt.type;
      const promptAdmins = prompt.admins;
      const meanprompt = prompt.DidYouMean;
      const keyword = result.getKeyword && result.getKeyword();

      if (promptType == 1) {
        promptHtml += `<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">
                    您是否要在<strong>${promptAdmins[0].name}</strong>搜索更多包含<strong>${keyword}</strong>的相关内容？
                </div>`;
      } else if (promptType == 2) {
        promptHtml += `<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">
                    在<strong>${promptAdmins[0].name}</strong>没有搜索到与<strong>${keyword}</strong>相关的结果。`;
        if (meanprompt) {
          promptHtml += `<br>您是否要找：<strong style="color: #3388ff; cursor: pointer;" onclick="this.closest('.tmap-search-control').querySelector('input').value='${meanprompt}'; this.closest('.tmap-search-control').querySelector('button').click()">${meanprompt}</strong>`;
        }
        promptHtml += `</div>`;
      } else if (promptType == 3) {
        promptHtml += `<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">
                    <div style="margin-bottom: 5px;">有以下相关结果，您是否要找：</div>`;
        for (let j = 0; j < promptAdmins.length; j++) {
          promptHtml += `<div style="color: #3388ff; cursor: pointer; margin: 2px 0;" 
                        onclick="this.closest('.tmap-search-control').querySelector('input').value='${promptAdmins[j].name}'; this.closest('.tmap-search-control').querySelector('button').click()">
                        ${promptAdmins[j].name}
                    </div>`;
        }
        promptHtml += `</div>`;
      }
    }

    if (promptHtml !== "") {
      container.innerHTML += promptHtml;
    }
  }

  // 显示点数据结果
  showPoisResults(pois, container) {
    if (!pois || pois.length === 0) {
      this.showNoResults(container);
      return;
    }

    const zoomArr = [];
    let resultsHtml = "";

    for (let i = 0; i < pois.length; i++) {
      const poi = pois[i];
      const name = poi.name;
      const address = poi.address;
      const lnglatArr = poi.lonlat.split(",");
      const lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);

      const marker = this.addMarker(lnglat.lng, lnglat.lat, {
        title: name,
        address: address,
      });

      zoomArr.push(lnglat);

      resultsHtml += `
                <div class="search-result-item" style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; font-size: 12px; transition: background 0.2s;"
                     onmouseover="this.style.background='rgba(51, 136, 255, 0.1)'"
                     onmouseout="this.style.background='transparent'"
                     onclick="
                         const mapManager = window.mapManager;
                         if (mapManager) {
                             const lnglat = new T.LngLat(${lnglatArr[0]}, ${lnglatArr[1]});
                             mapManager.map.centerAndZoom(lnglat, 15);
                             
                             // 更新坐标面板
                             document.getElementById('lngValue').textContent = ${lnglatArr[0]};
                             document.getElementById('latValue').textContent = ${lnglatArr[1]};
                             document.getElementById('formattedAddressValue').textContent = '${address}';
                             
                             // 其他地址信息设置为默认
                             document.getElementById('cityValue').textContent = '--';
                             document.getElementById('roadValue').textContent = '--';
                             document.getElementById('poiValue').textContent = '--';
                             document.getElementById('addressValue').textContent = '--';
                             
                             // 保存坐标
                             mapManager.lastClickLngLat = lnglat;
                             mapManager.currentGeometryType = 0;
                             mapManager.currentGeometryData = null;
                             
                             // 触发逆地理编码
                             mapManager.reverseGeocode(${lnglatArr[0]}, ${lnglatArr[1]});
                             
                             const resultsContainer = this.closest('.tmap-search-control').querySelector('div:nth-child(2)');
                             if (resultsContainer) {
                                 resultsContainer.style.maxHeight = '0';
                                 resultsContainer.style.marginTop = '0';
                             }
                         }
                     ">
                    <div style="font-weight: 500; color: #333;">${name}</div>
                    <div style="color: #666; font-size: 11px;">${address}</div>
                </div>
            `;
    }

    container.innerHTML += resultsHtml;

    if (zoomArr.length > 0) {
      this.map.setViewport(zoomArr);
    }
  }

  // 显示统计结果
  showStatisticsResults(statistics, container) {
    if (!statistics) return;

    let html =
      '<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">推荐城市:</div>';
    const priorityCitys = statistics.priorityCitys;

    if (priorityCitys && priorityCitys.length > 0) {
      html +=
        '<ul style="margin: 5px 0; padding-left: 15px; font-size: 12px;">';
      for (let i = 0; i < priorityCitys.length; i++) {
        html += `<li style="margin: 3px 0;">${priorityCitys[i].name} (${priorityCitys[i].count})</li>`;
      }
      html += "</ul>";
    }

    const allAdmins = statistics.allAdmins;
    if (allAdmins && allAdmins.length > 0) {
      html +=
        '<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">更多城市:</div>';
      html +=
        '<ul style="margin: 5px 0; padding-left: 15px; font-size: 12px;">';
      for (let i = 0; i < allAdmins.length; i++) {
        html += `<li style="margin: 3px 0;">${allAdmins[i].name} (${allAdmins[i].count})`;
        const childAdmins = allAdmins[i].childAdmins;
        if (childAdmins) {
          html += '<ul style="padding-left: 15px; margin: 2px 0;">';
          for (let m = 0; m < childAdmins.length; m++) {
            html += `<li style="margin: 2px 0;">${childAdmins[m].name} (${childAdmins[m].count})</li>`;
          }
          html += "</ul>";
        }
        html += "</li>";
      }
      html += "</ul>";
    }

    container.innerHTML += html;
  }

  // 显示区域结果
  showAreaResults(area, container) {
    if (!area) return;

    let html =
      '<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">行政区划:</div>';

    if (area.points) {
      const points = area.points;
      for (let i = 0; i < points.length; i++) {
        const regionLngLats = [];
        const regionArr = points[i].region.split(",");
        for (let m = 0; m < regionArr.length; m++) {
          const lnglatArr = regionArr[m].split(" ");
          const lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
          regionLngLats.push(lnglat);
        }
        const line = new T.Polyline(regionLngLats, {
          color: "blue",
          weight: 3,
          opacity: 1,
          lineStyle: "dashed",
        });
        this.map.addOverLay(line);
      }
    }

    if (area.lonlat) {
      const regionArr = area.lonlat.split(",");
      this.map.panTo(new T.LngLat(regionArr[0], regionArr[1]));
    }

    container.innerHTML += html;
  }

  // 显示建议词结果
  showSuggestsResults(suggests, container) {
    if (!suggests || suggests.length === 0) return;

    let html =
      '<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">建议词:</div>';
    html += '<ul style="margin: 5px 0; padding-left: 15px; font-size: 12px;">';
    for (let i = 0; i < suggests.length; i++) {
      html += `<li style="margin: 3px 0; color: #3388ff; cursor: pointer;" 
                onclick="this.closest('.tmap-search-control').querySelector('input').value='${suggests[i].name}'; this.closest('.tmap-search-control').querySelector('button').click()">
                ${suggests[i].name}
            </li>`;
    }
    html += "</ul>";

    container.innerHTML += html;
  }

  // 显示公交数据结果
  showLineDataResults(lineData, container) {
    if (!lineData || lineData.length === 0) return;

    let html =
      '<div style="padding: 8px 10px; border-bottom: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666;">公交线路:</div>';
    html += '<ul style="margin: 5px 0; padding-left: 15px; font-size: 12px;">';
    for (let i = 0; i < lineData.length; i++) {
      html += `<li style="margin: 3px 0;">${lineData[i].name} (${lineData[i].stationNum}站)</li>`;
    }
    html += "</ul>";

    container.innerHTML += html;
  }

  // 显示无结果
  showNoResults(container) {
    container.innerHTML = `
            <div style="padding: 10px; text-align: center; color: #666; font-size: 12px;">
                未找到相关结果
            </div>
        `;
  }

  // 清除所有标记和覆盖物
  clearAll() {
    if (this.map) {
      this.map.clearOverLays();
    }
    this.currentMarkers = [];
    this.currentPolylines = [];
    this.currentPolygons = [];
    this.currentGeometryType = 0;
    this.currentGeometryData = null;
  }

  // 添加标记
  addMarker(lng, lat, options = {}) {
    if (!this.map) return null;

    const point = new T.LngLat(lng, lat);
    const marker = new T.Marker(point);
    this.map.addOverLay(marker);
    this.currentMarkers.push(marker);

    if (options.title) {
      marker.setTitle(options.title);
    }

    if (options.title || options.address) {
      const infoContent = options.address
        ? `<div style="padding: 5px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${
                      options.title
                    }</div>
                    <div style="color: #666; font-size: 12px;">${
                      options.address
                    }</div>
                    <div style="margin-top: 5px; font-size: 11px; color: #999;">
                        坐标: ${lng.toFixed(6)}, ${lat.toFixed(6)}
                    </div>
                </div>`
        : `<div style="padding: 5px;">
                    <div style="font-weight: bold;">${options.title}</div>
                    <div style="margin-top: 5px; font-size: 11px; color: #999;">
                        坐标: ${lng.toFixed(6)}, ${lat.toFixed(6)}
                    </div>
                </div>`;

      const infoWindow = new T.InfoWindow(infoContent, {
        autoPan: true,
      });
      marker.addEventListener("click", () => {
        marker.openInfoWindow(infoWindow);
      });
    }

    return marker;
  }

  // 复制到剪贴板
  copyToClipboard(text, type = "内容") {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showTempMessage(`${type}已复制到剪贴板`);
        })
        .catch((err) => {
          console.error("复制失败:", err);
          this.fallbackCopyToClipboard(text, type);
        });
    } else {
      this.fallbackCopyToClipboard(text, type);
    }
  }

  // 兼容性复制方法
  fallbackCopyToClipboard(text, type = "内容") {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      this.showTempMessage(`${type}已复制到剪贴板`);
    } catch (err) {
      console.error("复制失败:", err);
      alert(`${type}:\n${text}\n\n请手动复制`);
    }
    document.body.removeChild(textArea);
  }

  // 显示临时消息
  showTempMessage(message) {
    // 创建临时消息元素
    const messageEl = document.createElement("div");
    messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            pointer-events: none;
        `;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    // 2秒后移除
    setTimeout(() => {
      if (document.body.contains(messageEl)) {
        document.body.removeChild(messageEl);
      }
    }, 2000);
  }

  // 设置中心点
  setCenter(lng, lat) {
    if (!this.map) return;

    const point = new T.LngLat(lng, lat);
    this.map.panTo(point);
  }

  // 显示/隐藏搜索控件
  toggleSearchControl(show) {
    if (this.searchControl) {
      this.searchControl.style.display = show ? "block" : "none";
    }
  }
}
