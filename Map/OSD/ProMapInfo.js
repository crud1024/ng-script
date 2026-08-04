// 添加样式 - 整合的控制面板样式
const style = document.createElement("style");
style.textContent = `
        /* 主控制面板样式 */
        .tmap-main-control {
            position: absolute;
            top: 15px;
            left: 15px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 300px;
            max-width: 350px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            font-family: 'Microsoft YaHei', sans-serif;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .tmap-main-control.collapsed {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            max-width: 40px !important;
            overflow: hidden;
        }
        
        .tmap-main-control-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 15px;
            background: #1890ff;
            color: white;
            cursor: pointer;
            user-select: none;
        }
        
        .tmap-main-control-header:hover {
            background: #0d7ae4;
        }
        
        .tmap-main-control-title {
            font-weight: bold;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .tmap-main-control-icon {
            font-size: 16px;
        }
        
        .tmap-main-control-toggle {
            font-size: 18px;
            transition: transform 0.3s ease;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .tmap-main-control-toggle.collapsed {
            transform: rotate(-180deg);
        }
        
        .tmap-main-control-content {
            max-height: 500px;
            overflow-y: auto;
            transition: max-height 0.3s ease;
            padding: 0;
        }
        
        .tmap-main-control.collapsed .tmap-main-control-content {
            max-height: 0;
            padding: 0;
        }
        
        /* 控制组样式 */
        .tmap-control-group {
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }
        
        .tmap-control-group:last-child {
            border-bottom: none;
        }
        
        .tmap-control-group-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 15px;
            background: rgba(248, 249, 250, 0.8);
            cursor: pointer;
            user-select: none;
            border-left: 3px solid #5d83ea;
            transition: all 0.2s ease;
        }
        
        .tmap-control-group-header:hover {
            background: rgba(93, 131, 234, 0.1);
            border-left-color: #4a6fd8;
        }
        
        .tmap-control-group-title {
            font-weight: 600;
            font-size: 13px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .tmap-control-group-icon {
            font-size: 14px;
            color: #5d83ea;
        }
        
        .tmap-control-group-toggle {
            font-size: 14px;
            color: #666;
            transition: transform 0.3s ease;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .tmap-control-group-toggle.collapsed {
            transform: rotate(-90deg);
        }
        
        .tmap-control-group-content {
            padding: 15px;
            background: white;
            transition: all 0.3s ease;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .tmap-control-group.collapsed .tmap-control-group-content {
            max-height: 0;
            padding: 0 15px;
            overflow: hidden;
        }
        
        /* 地图控制内容样式 */
        .tmap-map-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .tmap-control-item {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            border-radius: 4px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        
        .tmap-control-item:hover {
            background: rgba(93, 131, 234, 0.1);
        }
        
        .tmap-control-checkbox {
            margin-right: 10px;
            cursor: pointer;
        }
        
        .tmap-control-label {
            font-size: 12px;
            color: #333;
            flex: 1;
        }
        
        .tmap-control-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
        }
        
        .tmap-control-button {
            padding: 8px 10px;
            background: #1890ff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }
        
        .tmap-control-button:hover {
            background: #0d7ae4;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .tmap-control-button:active {
            transform: translateY(0);
            box-shadow: none;
        }
        
        /* 图层控制内容样式 */
        .tmap-layer-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .tmap-layer-item {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        
        .tmap-layer-item:hover {
            background: rgba(93, 131, 234, 0.1);
        }
        
        .tmap-layer-checkbox {
            margin-right: 10px;
            cursor: pointer;
        }
        
        .tmap-layer-label {
            font-size: 12px;
            color: #333;
            flex: 1;
        }
        
        .tmap-layer-count {
            font-size: 11px;
            color: #666;
            min-width: 40px;
            text-align: right;
        }
        
        /* 项目阶段控制样式 */
        .tmap-stage-controls {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .tmap-stage-all {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            background: rgba(248, 249, 250, 0.8);
            border-radius: 4px;
            margin-bottom: 5px;
        }
        
        .tmap-stage-item {
            display: flex;
            align-items: center;
            padding: 5px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        
        .tmap-stage-item:hover {
            background: rgba(93, 131, 234, 0.1);
        }
        
        .tmap-stage-checkbox {
            margin-right: 8px;
            cursor: pointer;
        }
        
        .tmap-stage-info {
            display: flex;
            align-items: center;
            flex: 1;
            gap: 8px;
        }
        
        .tmap-stage-color {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        
        .tmap-stage-label {
            font-size: 12px;
            color: #333;
            flex: 1;
        }
        
        .tmap-stage-count {
            font-size: 11px;
            color: #666;
            min-width: 30px;
            text-align: right;
        }
        
        /* 统计信息样式 */
        .tmap-stats-panel {
            padding: 12px 15px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 6px;
            margin: 10px 0;
        }
        
        .tmap-stats-title {
            font-weight: 600;
            font-size: 12px;
            color: #333;
            margin-bottom: 8px;
            text-align: center;
        }
        
        .tmap-stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            text-align: center;
        }
        
        .tmap-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        
        .tmap-stat-label {
            font-size: 11px;
            color: #666;
        }
        
        .tmap-stat-value {
            font-weight: bold;
            font-size: 14px;
        }
        
        .tmap-stat-value.markers {
            color: #3388ff;
        }
        
        .tmap-stat-value.lines {
            color: #6610f2;
        }
        
        .tmap-stat-value.polygons {
            color: #20c997;
        }
        
        .tmap-stats-footer {
            font-size: 10px;
            color: #999;
            text-align: center;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            line-height: 1.4;
        }
        
        /* ===== 鼠标悬停提示框 - 美化版 ===== */
.tmap-hover-tooltip {
    position: absolute;
    z-index: 2000;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    padding: 14px 18px;
    min-width: 260px;
    max-width: 360px;
    box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    font-family: -apple-system, 'Microsoft YaHei', 'PingFang SC', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    pointer-events: none;
    color: #1a2332;
    transition: opacity 0.2s ease;
}

/* ---- 标题区域 ---- */
.tmap-hover-tooltip-header {
    margin-bottom: 10px;
}

.tmap-hover-tooltip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: #1a2332;
    letter-spacing: 0.2px;
}

.tmap-hover-title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    border-radius: 7px;
    flex-shrink: 0;
}

.tmap-hover-title-icon svg {
    width: 15px;
    height: 15px;
}

.tmap-hover-stage-badge {
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    height: 22px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    margin-left: auto;
    flex-shrink: 0;
    letter-spacing: 0.3px;
}

.tmap-hover-tooltip-divider {
    height: 2px;
    background: linear-gradient(90deg, #4a6cf7, #a8c0fa);
    border-radius: 3px;
    margin-top: 8px;
    opacity: 0.35;
}

.tmap-hover-tooltip-divider-light {
    height: 1px;
    background: linear-gradient(90deg, rgba(74, 108, 247, 0.15), transparent);
    margin: 8px 0;
}

/* ---- 字段行 ---- */
.tmap-hover-tooltip-row {
    display: flex;
    align-items: center;
    padding: 5px 6px;
    margin: 2px 0;
    border-radius: 8px;
    gap: 6px;
    transition: background 0.2s ease;
}

.tmap-hover-tooltip-row:hover {
    background: rgba(74, 108, 247, 0.05);
}

.tmap-hover-row-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    opacity: 0.7;
}

.tmap-hover-row-icon svg {
    width: 16px;
    height: 16px;
}

.tmap-hover-row-label {
    font-size: 12px;
    color: #7a8ba0;
    font-weight: 500;
    min-width: 62px;
    flex-shrink: 0;
    letter-spacing: 0.2px;
}

.tmap-hover-row-value {
    font-size: 13px;
    color: #1a2332;
    font-weight: 400;
    word-break: break-word;
    flex: 1;
    padding-left: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.tmap-hover-value-highlight {
    color: #4a6cf7;
    font-weight: 600;
}

/* ---- 阶段圆点 ---- */
.tmap-hover-stage-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

/* ---- 坐标样式 ---- */
.tmap-hover-coord-row {
    background: rgba(74, 108, 247, 0.03);
    border-radius: 10px;
    padding: 6px 8px;
    margin-top: 2px;
}

.tmap-hover-coord-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 12px;
    flex: 1;
    justify-content: flex-end;
}

.tmap-hover-coord-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.7);
    padding: 1px 10px 1px 6px;
    border-radius: 12px;
    border: 1px solid rgba(74, 108, 247, 0.08);
}

.tmap-hover-coord-label {
    font-size: 10px;
    color: #8a9baa;
    font-weight: 400;
    font-family: -apple-system, 'Microsoft YaHei', sans-serif;
}

.tmap-hover-coord-value {
    color: #4a6cf7;
    font-weight: 500;
    font-size: 12px;
}

.tmap-hover-coord-divider {
    color: #d0d9e8;
    font-weight: 300;
}

/* ---- 统计行 ---- */
.tmap-hover-stats-row {
    opacity: 0.7;
}

/* ---- 底部 ---- */
.tmap-hover-tooltip-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.tmap-hover-footer-icon {
    display: inline-flex;
    align-items: center;
    opacity: 0.4;
}

.tmap-hover-footer-text {
    font-size: 11px;
    color: #b0c4d9;
    font-weight: 400;
    letter-spacing: 0.2px;
}

/* ---- 响应式 ---- */
@media (max-width: 480px) {
    .tmap-hover-tooltip {
        min-width: 200px;
        max-width: 280px;
        padding: 12px 14px;
        font-size: 12px;
    }
    
    .tmap-hover-tooltip-title {
        font-size: 14px;
    }
    
    .tmap-hover-row-label {
        min-width: 50px;
        font-size: 11px;
    }
    
    .tmap-hover-row-value {
        font-size: 12px;
    }
    
    .tmap-hover-coord-group {
        font-size: 11px;
        flex-wrap: wrap;
        gap: 4px;
    }
}
        
        /* 折叠状态下的控制面板样式 */
        .tmap-main-control.collapsed .tmap-main-control-header {
            justify-content: center;
            padding: 12px;
        }
        
        .tmap-main-control.collapsed .tmap-main-control-title,
        .tmap-main-control.collapsed .tmap-main-control-toggle {
            display: none;
        }
        
        .tmap-main-control.collapsed .tmap-main-control-icon {
            font-size: 20px;
            margin: 0;
        }
        
        /* 地图控制面板图标样式 */
        .tmap-control-icon-svg {
            display: inline-block;
            vertical-align: middle;
        }
        
        /* 新增：搜索控件样式 */
        .tmap-top-search-control {
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1001;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
            height: 68px;
            min-width: 400px;
            max-width: 500px;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .tmap-top-search-control .search-row {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
        }
        
        .tmap-top-search-control .search-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            background: rgba(255, 255, 255, 0.9);
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        
        .tmap-top-search-control .search-input:focus {
            border-color: #3388ff;
            box-shadow: 0 0 0 3px rgba(51, 136, 255, 0.1);
        }
        
        .tmap-top-search-control .search-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            padding: 0;
            background: #3388ff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .tmap-top-search-control .search-button:hover {
            background: #0d7ae4;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .tmap-top-search-control .search-button:active {
            transform: translateY(0);
            box-shadow: none;
        }
        
        .tmap-top-search-control .search-button svg {
            width: 20px;
            height: 20px;
        }
        
        .tmap-top-search-control .search-results {
            max-height: 0;
            overflow-y: auto;
            transition: max-height 0.3s ease;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 6px;
            margin-top: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .tmap-top-search-control .search-results.show {
            max-height: 250px;
        }
        
        .tmap-top-search-control .search-result-item {
            padding: 10px 15px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            cursor: pointer;
            font-size: 13px;
            transition: background 0.2s;
        }
        
        .tmap-top-search-control .search-result-item:hover {
            background: rgba(51, 136, 255, 0.1);
        }
        
        .tmap-top-search-control .search-result-item:last-child {
            border-bottom: none;
        }
        
        .tmap-top-search-control .result-title {
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
        }
        
        .tmap-top-search-control .result-address {
            color: #666;
            font-size: 12px;
        }
    `;
document.head.appendChild(style);

// 天地图加载器
class TMapLoader {
  constructor(tk) {
    this.tk = tk;
    this.isLoaded = false;
    this.callbacks = [];
  }

  load(callback) {
    if (this.isLoaded) {
      callback && callback();
      return;
    }

    if (callback) {
      this.callbacks.push(callback);
    }

    if (window._tMapLoading) {
      return;
    }
    window._tMapLoading = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${this.tk}`;
    script.onerror = () => {
      console.error("天地图API加载失败");
      this.handleError("天地图API加载失败");
    };

    const checkLoad = () => {
      if (typeof T !== "undefined" && T.Map) {
        this.isLoaded = true;
        window._tMapLoading = false;
        this.callbacks.forEach((cb) => cb());
        this.callbacks = [];
        console.log("天地图API加载完成");
      } else {
        setTimeout(checkLoad, 100);
      }
    };

    script.onload = checkLoad;
    document.head.appendChild(script);
  }

  handleError(message) {
    console.error(message);
    window._tMapLoading = false;
    this.callbacks = [];
  }
}

// 标记管理器 - 添加项目阶段过滤功能
class TMapMarkerManager {
  constructor(map, options = {}) {
    this.map = map;
    this.options = Object.assign(
      {
        markerData: [],
        onMarkerClick: null,
        onMarkerMouseOver: null,
        onMarkerMouseOut: null,
      },
      options,
    );

    this.currentMarkers = [];
    this.markerInfoMap = new Map();
    this.originalMarkerData = []; // 保存原始标记数据
    this.hoverTooltip = null; // 鼠标悬停工具提示元素
    this.visibleMarkers = []; // 当前可见的标记
    this.stageVisibility = {}; // 阶段可见性状态
    this.allStages = new Set(); // 所有阶段集合

    if (this.options.markerData && this.options.markerData.length > 0) {
      this.originalMarkerData = [...this.options.markerData]; // 备份原始数据
      this.extractAllStages(); // 提取所有阶段
    }

    // 创建鼠标悬停工具提示
    this.createHoverTooltip();
  }

  // 提取所有项目阶段
  extractAllStages() {
    this.allStages.clear();
    this.originalMarkerData.forEach((marker) => {
      if (marker.u_pro_stage) {
        this.allStages.add(marker.u_pro_stage);
      }
    });

    // 初始化所有阶段为可见
    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = true;
    });

    console.log("提取到项目阶段:", Array.from(this.allStages));
  }

  // 创建鼠标悬停工具提示
  createHoverTooltip() {
    this.hoverTooltip = document.createElement("div");
    this.hoverTooltip.className = "tmap-hover-tooltip";
    this.hoverTooltip.style.display = "none";
    document.body.appendChild(this.hoverTooltip);
  }

  // 显示鼠标悬停提示
  showHoverTooltip(content, x, y) {
    if (!this.hoverTooltip) return;

    this.hoverTooltip.innerHTML = content;
    this.hoverTooltip.style.display = "block";
    this.hoverTooltip.style.left = x + 10 + "px";
    this.hoverTooltip.style.top = y + 10 + "px";

    // 防止工具提示超出屏幕边界
    const rect = this.hoverTooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.hoverTooltip.style.left = x - rect.width - 10 + "px";
    }
    if (rect.bottom > window.innerHeight) {
      this.hoverTooltip.style.top = y - rect.height - 10 + "px";
    }
  }

  // 隐藏鼠标悬停提示
  hideHoverTooltip() {
    if (this.hoverTooltip) {
      this.hoverTooltip.style.display = "none";
    }
  }

  // 根据阶段过滤创建标记
  createMarkersByStage(markerData = null) {
    if (!this.map) return;

    console.time("根据阶段过滤创建标记耗时");

    const dataToUse = markerData || this.options.markerData;
    this.clearAllMarkers();

    // 备份当前使用的数据
    if (markerData) {
      this.originalMarkerData = [...markerData];
      this.extractAllStages(); // 重新提取阶段
    }

    // 过滤显示符合条件的标记
    const filteredData = dataToUse.filter((marker) => {
      if (!marker.u_pro_stage) return true; // 如果没有阶段信息，默认显示
      return this.stageVisibility[marker.u_pro_stage] !== false;
    });

    // 批量创建标记
    for (let i = 0; i < filteredData.length; i++) {
      const data = filteredData[i];

      // 确保经纬度有效
      if (!data.lng || !data.lat || isNaN(data.lng) || isNaN(data.lat)) {
        console.warn(`跳过无效标记数据: ${JSON.stringify(data)}`);
        continue;
      }

      const point = new T.LngLat(parseFloat(data.lng), parseFloat(data.lat));

      // 创建标记
      const marker = new T.Marker(point, {
        title: "", // 清空title，使用自定义的鼠标悬停提示
        draggable: data.draggable || false,
      });

      // 构建详细的鼠标悬停提示HTML
      const hoverTitle = this.buildMarkerHoverTitle(data);

      // 存储标记信息
      this.markerInfoMap.set(marker, {
        title: hoverTitle,
        index: i,
        originalData: data,
        u_pro_no: data.u_pro_no,
        u_pro_stage: data.u_pro_stage, // 存储项目阶段
      });

      // 添加点击事件
      marker.addEventListener(
        "click",
        this.handleMarkerClick.bind(this, marker),
      );

      // 添加鼠标悬停事件 - 使用自定义的鼠标悬停提示
      marker.addEventListener(
        "mouseover",
        this.handleMarkerMouseOver.bind(this, marker),
      );
      marker.addEventListener(
        "mouseout",
        this.handleMarkerMouseOut.bind(this, marker),
      );

      // 添加到地图
      this.map.addOverLay(marker);
      this.currentMarkers.push(marker);
      this.visibleMarkers.push(marker);
    }

    console.timeEnd("根据阶段过滤创建标记耗时");
    console.log(`标记创建成功: ${this.currentMarkers.length}个标记（过滤后）`);

    // 更新统计信息
    this.updateStats();
  }

  // 设置阶段可见性
  setStageVisibility(stage, visible) {
    this.stageVisibility[stage] = visible;
    console.log(`设置阶段 "${stage}" 可见性为: ${visible}`);

    // 重新创建标记（根据新的可见性过滤）
    this.createMarkersByStage();
  }

  // 设置所有阶段可见性
  setAllStagesVisibility(visible) {
    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = visible;
    });
    console.log(`设置所有阶段可见性为: ${visible}`);

    // 重新创建标记
    this.createMarkersByStage();
  }

  // 获取阶段统计信息
  getStageStats() {
    const stats = {};
    this.allStages.forEach((stage) => {
      const count = this.originalMarkerData.filter(
        (marker) => marker.u_pro_stage === stage,
      ).length;
      stats[stage] = {
        count: count,
        visible: this.stageVisibility[stage] !== false,
        color: this.getStageColor(stage),
      };
    });
    return stats;
  }

  // 构建鼠标悬停提示HTML - 美化版
  buildMarkerHoverTitle(markerData) {
    const sections = [];

    // SVG图标集合
    const icons = {
      id: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
      name: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      stage: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/><circle cx="12" cy="16" r="5"/><circle cx="12" cy="16" r="2"/><line x1="4" y1="22" x2="20" y2="22"/></svg>`,
      type: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      org: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      location: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      remark: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
      coords: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      point: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="#4a6cf7"/></svg>`,
      line: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 8 8 12 12 8 16 12 20 8"/><polyline points="4 16 8 20 12 16 16 20 20 16"/></svg>`,
      polygon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8 18 20 6 20 2 8 12 2"/></svg>`,
    };

    // ---- 标题 ----
    const typeMap = {
      point: "📍 普通项目",
      line: "📏 线性项目",
      polygon: "📐 平面项目",
    };
    const type = markerData._hoverType || "point";
    const titleIcon =
      type === "line"
        ? icons.line
        : type === "polygon"
          ? icons.polygon
          : icons.point;

    sections.push(`
        <div class="tmap-hover-tooltip-header">
            <div class="tmap-hover-tooltip-title">
                <span class="tmap-hover-title-icon">${titleIcon}</span>
                <span>${typeMap[type] || "项目信息"}</span>
                ${markerData.u_pro_stage ? `<span class="tmap-hover-stage-badge" style="background:${this.getStageColor(markerData.u_pro_stage)};">${markerData.u_pro_stage}</span>` : ""}
            </div>
            <div class="tmap-hover-tooltip-divider"></div>
        </div>
    `);

    // ---- 字段配置 ----
    const fieldConfigs = [
      { key: "u_pro_no", icon: icons.id, label: "项目编码" },
      {
        key: "u_pro_name",
        icon: icons.name,
        label: "项目名称",
        highlight: true,
      },
      { key: "u_pro_type", icon: icons.type, label: "项目类型" },
      { key: "phid_org_name", icon: icons.org, label: "组织单位" },
      { key: "u_location", icon: icons.location, label: "位置信息" },
      { key: "u_remark", icon: icons.remark, label: "备注说明" },
    ];

    // ---- 添加基本字段 ----
    fieldConfigs.forEach(({ key, icon, label, highlight }) => {
      if (markerData[key]) {
        const highlightClass = highlight ? "tmap-hover-value-highlight" : "";
        sections.push(`
                <div class="tmap-hover-tooltip-row">
                    <span class="tmap-hover-row-icon">${icon}</span>
                    <span class="tmap-hover-row-label">${label}</span>
                    <span class="tmap-hover-row-value ${highlightClass}">${this.escapeHtml(markerData[key])}</span>
                </div>
            `);
      }
    });

    // ---- 添加阶段（如果还没显示在标题中） ----
    if (markerData.u_pro_stage && !markerData._stageInTitle) {
      const stageColor = this.getStageColor(markerData.u_pro_stage);
      sections.push(`
            <div class="tmap-hover-tooltip-row">
                <span class="tmap-hover-row-icon">${icons.stage}</span>
                <span class="tmap-hover-row-label">项目阶段</span>
                <span class="tmap-hover-row-value">
                    <span class="tmap-hover-stage-dot" style="background:${stageColor};"></span>
                    ${this.escapeHtml(markerData.u_pro_stage)}
                </span>
            </div>
        `);
    }

    // ---- 添加经纬度 ----
    if (markerData.lng && markerData.lat) {
      const formattedLng = parseFloat(markerData.lng).toFixed(6);
      const formattedLat = parseFloat(markerData.lat).toFixed(6);
      sections.push(`
            <div class="tmap-hover-tooltip-divider-light"></div>
            <div class="tmap-hover-tooltip-row tmap-hover-coord-row">
                <span class="tmap-hover-row-icon">${icons.coords}</span>
                <span class="tmap-hover-row-label">坐标位置</span>
                <span class="tmap-hover-coord-group">
                    <span class="tmap-hover-coord-item">
                        <span class="tmap-hover-coord-label">经度</span>
                        <span class="tmap-hover-coord-value">${formattedLng}</span>
                    </span>
                    <span class="tmap-hover-coord-divider">|</span>
                    <span class="tmap-hover-coord-item">
                        <span class="tmap-hover-coord-label">纬度</span>
                        <span class="tmap-hover-coord-value">${formattedLat}</span>
                    </span>
                </span>
            </div>
        `);
    }

    // ---- 添加坐标点数量（线和面专用） ----
    if ((type === "line" || type === "polygon") && markerData.coordinates) {
      const count = markerData.coordinates
        .split(";")
        .filter((p) => p.trim()).length;
      sections.push(`
            <div class="tmap-hover-tooltip-row tmap-hover-stats-row">
                <span class="tmap-hover-row-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8a9baa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="#8a9baa"/></svg>
                </span>
                <span class="tmap-hover-row-label">坐标点数</span>
                <span class="tmap-hover-row-value" style="color:#8a9baa;font-family:monospace;">${count} 个</span>
            </div>
        `);
    }

    // ---- 底部提示 ----
    sections.push(`
        <div class="tmap-hover-tooltip-footer">
            <span class="tmap-hover-footer-icon">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#b0c4d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
            <span class="tmap-hover-footer-text">点击查看项目详情</span>
        </div>
    `);

    return sections.join("");
  }

  // ---- 获取阶段颜色 ----
  getStageColor(stage) {
    const colors = {
      已赋码: "#4a6cf7",
      中止: "#ff6b6b",
      终止: "#ee5a24",
      已发起: "#0abde3",
      已立项: "#f9ca24",
      已开工: "#6ab04c",
      已完成: "#2ecc71",
      已竣工: "#1abc9c",
      规划: "#9b59b6",
      设计: "#3498db",
      施工: "#e67e22",
      验收: "#f1c40f",
      运营: "#1abc9c",
      维护: "#95a5a6",
    };
    return colors[stage] || "#4a6cf7";
  }

  // ---- HTML转义（防止XSS） ----
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // 鼠标悬停事件处理
  handleMarkerMouseOver(marker, e) {
    // 获取鼠标位置
    const point = e.containerPoint;

    // 显示自定义鼠标悬停提示
    const info = this.markerInfoMap.get(marker);
    if (info && info.title) {
      this.showHoverTooltip(info.title, point.x, point.y);
    }

    // 触发自定义的鼠标悬停事件
    if (info && typeof this.options.onMarkerMouseOver === "function") {
      this.options.onMarkerMouseOver({
        marker: marker,
        originalData: info.originalData,
      });
    }
  }

  // 鼠标移出事件处理
  handleMarkerMouseOut(marker, e) {
    // 隐藏鼠标悬停提示
    this.hideHoverTooltip();

    // 触发自定义的鼠标移出事件
    const info = this.markerInfoMap.get(marker);
    if (info && typeof this.options.onMarkerMouseOut === "function") {
      this.options.onMarkerMouseOut({
        marker: marker,
        originalData: info.originalData,
      });
    }
  }

  handleMarkerClick(marker, e) {
    const lnglat = marker.getLngLat();
    const info = this.markerInfoMap.get(marker);

    if (typeof this.options.onMarkerClick === "function") {
      this.options.onMarkerClick({
        marker: marker,
        lnglat: lnglat,
        title: info.title,
        index: info.index,
        originalData: info.originalData,
      });
    }
  }

  // 清除所有标记
  clearAllMarkers() {
    console.time("清除标记耗时");

    // 清除单个标记
    if (this.currentMarkers.length > 0) {
      try {
        // 先移除所有事件监听器
        this.currentMarkers.forEach((marker) => {
          try {
            marker.removeEventListener("click", this.handleMarkerClick);
            marker.removeEventListener("mouseover", this.handleMarkerMouseOver);
            marker.removeEventListener("mouseout", this.handleMarkerMouseOut);
          } catch (e) {
            console.log("移除事件监听器时出错:", e);
          }
        });

        // 批量移除标记
        this.map.removeOverLays(this.currentMarkers);
      } catch (e) {
        // 如果批量移除失败，逐个移除
        for (let marker of this.currentMarkers) {
          try {
            marker.removeEventListener("click", this.handleMarkerClick);
            marker.removeEventListener("mouseover", this.handleMarkerMouseOver);
            marker.removeEventListener("mouseout", this.handleMarkerMouseOut);
            this.map.removeOverLay(marker);
          } catch (e) {
            console.log("移除标记时出错:", e);
          }
        }
      }
    }

    this.currentMarkers = [];
    this.visibleMarkers = [];
    this.markerInfoMap.clear();

    console.timeEnd("清除标记耗时");
    console.log(`已清除所有标记`);

    // 更新统计信息
    this.updateStats();
  }

  // 显示标记（从备份数据恢复）
  showMarkers() {
    if (this.originalMarkerData && this.originalMarkerData.length > 0) {
      console.log("从备份数据恢复标记:", this.originalMarkerData.length);
      this.createMarkersByStage(this.originalMarkerData);
    } else if (this.options.markerData && this.options.markerData.length > 0) {
      console.log("从当前数据创建标记:", this.options.markerData.length);
      this.createMarkersByStage(this.options.markerData);
    } else {
      console.log("没有标记数据可显示");
    }
  }

  // 隐藏标记（清除但不删除备份数据）
  hideMarkers() {
    this.clearAllMarkers();
  }

  // 获取标记数量
  getMarkerCount() {
    return this.currentMarkers.length;
  }

  // 获取标记数据
  getMarkerData() {
    return this.options.markerData;
  }

  // 更新标记
  updateMarkers(markerData) {
    this.options.markerData = markerData;
    this.originalMarkerData = [...markerData]; // 更新备份数据
    this.extractAllStages(); // 重新提取阶段

    // 清除旧标记
    this.clearAllMarkers();

    // 创建新标记
    setTimeout(() => {
      this.createMarkersByStage(markerData);
    }, 100);
  }

  // 根据项目编码查找标记
  findMarkerByProNo(u_pro_no) {
    for (let [marker, info] of this.markerInfoMap) {
      if (info.u_pro_no === u_pro_no) {
        return {
          marker: marker,
          info: info,
        };
      }
    }
    return null;
  }

  // 更新统计信息
  updateStats() {
    // 这个函数将被地图管理器调用
  }

  // 清理资源
  destroy() {
    this.clearAllMarkers();
    if (this.hoverTooltip && document.body.contains(this.hoverTooltip)) {
      document.body.removeChild(this.hoverTooltip);
    }
  }
}

// 线和面管理器 - 添加项目阶段过滤功能
class TMapLinePolygonManager {
  constructor(map, options = {}) {
    this.map = map;
    this.options = Object.assign(
      {
        lines: [],
        polygons: [],
        onLineClick: null,
        onPolygonClick: null,
        onLineMouseOver: null,
        onPolygonMouseOver: null,
        onLineMouseOut: null,
        onPolygonMouseOut: null,
      },
      options,
    );

    this.currentLines = [];
    this.currentPolygons = [];
    this.lineInfoMap = new Map();
    this.polygonInfoMap = new Map();

    // 鼠标悬停工具提示元素
    this.hoverTooltip = null;

    // 图层可见性状态
    this.layerVisibility = {
      lines: true,
      polygons: true,
      markers: true,
    };

    // 项目阶段可见性
    this.stageVisibility = {};
    this.allStages = new Set();

    // 备份原始数据
    this.originalLineData = [...(options.lines || [])];
    this.originalPolygonData = [...(options.polygons || [])];

    // 提取所有阶段
    this.extractAllStages();

    // 创建鼠标悬停工具提示
    this.createHoverTooltip();

    // 根据阶段过滤创建线和面
    if (this.options.lines && this.options.lines.length > 0) {
      this.createLinesByStage();
    }

    if (this.options.polygons && this.options.polygons.length > 0) {
      this.createPolygonsByStage();
    }
  }

  // 提取所有项目阶段
  extractAllStages() {
    this.allStages.clear();

    // 从线条数据提取阶段
    this.originalLineData.forEach((line) => {
      if (line.u_pro_stage) {
        this.allStages.add(line.u_pro_stage);
      }
    });

    // 从多边形数据提取阶段
    this.originalPolygonData.forEach((polygon) => {
      if (polygon.u_pro_stage) {
        this.allStages.add(polygon.u_pro_stage);
      }
    });

    // 初始化所有阶段为可见
    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = true;
    });

    console.log("线和面管理器提取到项目阶段:", Array.from(this.allStages));
  }

  // 创建鼠标悬停工具提示
  createHoverTooltip() {
    this.hoverTooltip = document.createElement("div");
    this.hoverTooltip.className = "tmap-hover-tooltip";
    this.hoverTooltip.style.display = "none";
    document.body.appendChild(this.hoverTooltip);
  }

  // 显示鼠标悬停提示
  showHoverTooltip(content, x, y) {
    if (!this.hoverTooltip) return;

    this.hoverTooltip.innerHTML = content;
    this.hoverTooltip.style.display = "block";
    this.hoverTooltip.style.left = x + 10 + "px";
    this.hoverTooltip.style.top = y + 10 + "px";

    // 防止工具提示超出屏幕边界
    const rect = this.hoverTooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.hoverTooltip.style.left = x - rect.width - 10 + "px";
    }
    if (rect.bottom > window.innerHeight) {
      this.hoverTooltip.style.top = y - rect.height - 10 + "px";
    }
  }

  // 隐藏鼠标悬停提示
  hideHoverTooltip() {
    if (this.hoverTooltip) {
      this.hoverTooltip.style.display = "none";
    }
  }

  // 根据阶段过滤创建线条
  createLinesByStage(lineData = null) {
    if (!this.map) return;

    const dataToUse = lineData || this.options.lines;

    // 如果线条图层不可见，不创建但备份数据
    if (!this.layerVisibility.lines) {
      if (lineData) {
        this.originalLineData = [...lineData];
        this.extractAllStages(); // 重新提取阶段
      }
      return;
    }

    this.clearAllLines();

    // 备份数据
    if (lineData) {
      this.originalLineData = [...lineData];
      this.extractAllStages(); // 重新提取阶段
    }

    // 过滤显示符合条件的线条
    const filteredData = dataToUse.filter((line) => {
      if (!line.u_pro_stage) return true; // 如果没有阶段信息，默认显示
      return this.stageVisibility[line.u_pro_stage] !== false;
    });

    filteredData.forEach((line, index) => {
      if (!line.coordinates || typeof line.coordinates !== "string") {
        console.warn(`跳过无效线条数据: ${JSON.stringify(line)}`);
        return;
      }

      const coordinates = this.parseCoordinates(line.coordinates);
      if (coordinates.length < 2) {
        console.warn(`线条坐标点不足: ${line.name || "未命名线条"}`);
        return;
      }

      // 解析颜色
      let color = line.lineColor || "#FF0000";
      if (color.startsWith("0X") || color.startsWith("0x")) {
        color = "#" + color.substring(2);
      }

      // 解析宽度
      const width = parseInt(line.lineWidth) || 2;

      // 解析不透明度
      let opacity = 0.5;
      if (line.lineOpacity !== undefined) {
        opacity = parseInt(line.lineOpacity) / 100 || 0.5;
      }

      // 创建折线
      const polyline = new T.Polyline(coordinates, {
        strokeColor: color,
        strokeWeight: width,
        strokeOpacity: opacity,
        strokeStyle: line.lineStyle || "solid",
      });

      // 构建悬停提示
      const hoverTitle = this.buildLineHoverTitle(line);

      // 存储线条信息
      this.lineInfoMap.set(polyline, {
        name: line.name || `线条${index + 1}`,
        phid_pc: line.phid_pc,
        title: hoverTitle,
        originalData: line,
        u_pro_no: line.u_pro_no,
        u_pro_stage: line.u_pro_stage, // 存储项目阶段
      });

      // 添加点击事件
      polyline.addEventListener(
        "click",
        this.handleLineClick.bind(this, polyline),
      );

      // 添加鼠标悬停事件
      polyline.addEventListener(
        "mouseover",
        this.handleLineMouseOver.bind(this, polyline),
      );
      polyline.addEventListener(
        "mouseout",
        this.handleLineMouseOut.bind(this, polyline),
      );

      // 添加到地图
      this.map.addOverLay(polyline);
      this.currentLines.push(polyline);
    });

    console.log(`线条创建成功: ${this.currentLines.length}条线条（过滤后）`);
  }

  // 根据阶段过滤创建多边形（面）
  createPolygonsByStage(polygonData = null) {
    if (!this.map) return;

    const dataToUse = polygonData || this.options.polygons;

    // 如果多边形图层不可见，不创建但备份数据
    if (!this.layerVisibility.polygons) {
      if (polygonData) {
        this.originalPolygonData = [...polygonData];
        this.extractAllStages(); // 重新提取阶段
      }
      return;
    }

    this.clearAllPolygons();

    // 备份数据
    if (polygonData) {
      this.originalPolygonData = [...polygonData];
      this.extractAllStages(); // 重新提取阶段
    }

    // 过滤显示符合条件的多边形
    const filteredData = dataToUse.filter((polygon) => {
      if (!polygon.u_pro_stage) return true; // 如果没有阶段信息，默认显示
      return this.stageVisibility[polygon.u_pro_stage] !== false;
    });

    filteredData.forEach((polygon, index) => {
      if (!polygon.coordinates || typeof polygon.coordinates !== "string") {
        console.warn(`跳过无效多边形数据: ${JSON.stringify(polygon)}`);
        return;
      }

      const coordinates = this.parseCoordinates(polygon.coordinates);
      if (coordinates.length < 3) {
        console.warn(`多边形坐标点不足: ${polygon.name || "未命名多边形"}`);
        return;
      }

      // 确保多边形闭合
      if (coordinates.length > 0) {
        const firstCoord = coordinates[0];
        const lastCoord = coordinates[coordinates.length - 1];
        if (
          firstCoord.lng !== lastCoord.lng ||
          firstCoord.lat !== lastCoord.lat
        ) {
          coordinates.push(new T.LngLat(firstCoord.lng, firstCoord.lat));
        }
      }

      // 解析线条颜色
      let strokeColor = polygon.lineColor || "#0000FF";
      if (strokeColor.startsWith("0X") || strokeColor.startsWith("0x")) {
        strokeColor = "#" + strokeColor.substring(2);
      }

      // 解析填充颜色 - 改为蓝色系
      let fillColor = polygon.fillColor || "#3388FF"; // 改为蓝色
      if (fillColor.startsWith("0X") || fillColor.startsWith("0x")) {
        fillColor = "#" + fillColor.substring(2);
      }

      // 解析线条宽度
      const strokeWeight = parseInt(polygon.lineWidth) || 1;

      // 解析线条不透明度
      let strokeOpacity = 1.0;
      if (polygon.lineOpacity !== undefined) {
        strokeOpacity = parseInt(polygon.lineOpacity) / 100 || 1.0;
      }

      // 解析填充不透明度 - 增加透明度以更好显示
      let fillOpacity = 0.3; // 调整为更透明的蓝色
      if (polygon.fillOpacity !== undefined) {
        fillOpacity = parseInt(polygon.fillOpacity) / 100 || 0.3;
      }

      // 创建多边形
      const tPolygon = new T.Polygon(coordinates, {
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
        strokeOpacity: strokeOpacity,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
      });

      // 构建悬停提示
      const hoverTitle = this.buildPolygonHoverTitle(polygon);

      // 存储多边形信息
      this.polygonInfoMap.set(tPolygon, {
        name: polygon.name || `多边形${index + 1}`,
        phid_pc: polygon.phid_pc,
        title: hoverTitle,
        originalData: polygon,
        u_pro_no: polygon.u_pro_no,
        u_pro_stage: polygon.u_pro_stage, // 存储项目阶段
      });

      // 添加点击事件
      tPolygon.addEventListener(
        "click",
        this.handlePolygonClick.bind(this, tPolygon),
      );

      // 添加鼠标悬停事件
      tPolygon.addEventListener(
        "mouseover",
        this.handlePolygonMouseOver.bind(this, tPolygon),
      );
      tPolygon.addEventListener(
        "mouseout",
        this.handlePolygonMouseOut.bind(this, tPolygon),
      );

      // 添加到地图
      this.map.addOverLay(tPolygon);
      this.currentPolygons.push(tPolygon);
    });

    console.log(
      `多边形创建成功: ${this.currentPolygons.length}个多边形（过滤后）`,
    );
  }

  // 设置阶段可见性
  setStageVisibility(stage, visible) {
    this.stageVisibility[stage] = visible;
    console.log(`线和面管理器设置阶段 "${stage}" 可见性为: ${visible}`);

    // 重新创建线和面（根据新的可见性过滤）
    if (this.layerVisibility.lines) {
      this.createLinesByStage();
    }
    if (this.layerVisibility.polygons) {
      this.createPolygonsByStage();
    }
  }

  // 设置所有阶段可见性
  setAllStagesVisibility(visible) {
    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = visible;
    });
    console.log(`线和面管理器设置所有阶段可见性为: ${visible}`);

    // 重新创建线和面
    if (this.layerVisibility.lines) {
      this.createLinesByStage();
    }
    if (this.layerVisibility.polygons) {
      this.createPolygonsByStage();
    }
  }

  // 获取阶段统计信息
  getStageStats() {
    const stats = {};

    // 统计线条的阶段
    this.originalLineData.forEach((line) => {
      if (line.u_pro_stage) {
        if (!stats[line.u_pro_stage]) {
          stats[line.u_pro_stage] = {
            lines: 0,
            polygons: 0,
            visible: true,
          };
        }
        stats[line.u_pro_stage].lines += 1;
        stats[line.u_pro_stage].visible =
          this.stageVisibility[line.u_pro_stage] !== false;
      }
    });

    // 统计多边形的阶段
    this.originalPolygonData.forEach((polygon) => {
      if (polygon.u_pro_stage) {
        if (!stats[polygon.u_pro_stage]) {
          stats[polygon.u_pro_stage] = {
            lines: 0,
            polygons: 0,
            visible: true,
          };
        }
        stats[polygon.u_pro_stage].polygons += 1;
        stats[polygon.u_pro_stage].visible =
          this.stageVisibility[polygon.u_pro_stage] !== false;
      }
    });

    return stats;
  }

  // 获取阶段颜色
  getStageColor(stage) {
    // 为不同的阶段分配不同的颜色
    const stageColors = {
      立项: "#ff6b6b",
      设计: "#4ecdc4",
      施工: "#45b7d1",
      验收: "#96ceb4",
      运营: "#ffeaa7",
      维护: "#fab1a0",
      暂停: "#636e72",
      完成: "#55efc4",
    };

    return stageColors[stage] || "#3388ff"; // 默认颜色
  }

  // 构建线条悬停提示
  buildLineHoverTitle(lineData) {
    const lines = [];

    lines.push(`<div class="tmap-hover-tooltip-title">线性项目信息</div>`);

    if (lineData.u_pro_no) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">🔢 编码: ${lineData.u_pro_no}</div>`,
      );
    }

    if (lineData.name || lineData.u_pro_name) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">💡 名称: ${
          lineData.name || lineData.u_pro_name
        }</div>`,
      );
    }

    if (lineData.u_pro_stage) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">📈 阶段: ${lineData.u_pro_stage}</div>`,
      );
    }

    if (lineData.u_pro_type) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">📋 类型: ${lineData.u_pro_type}</div>`,
      );
    }

    if (lineData.phid_org_name) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">🏢 组织: ${lineData.phid_org_name}</div>`,
      );
    }

    if (lineData.u_location) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">🗺️ 位置: ${lineData.u_location}</div>`,
      );
    }

    if (lineData.u_remark) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">📖 备注: ${lineData.u_remark}</div>`,
      );
    }

    lines.push(
      `<div class="tmap-hover-tooltip-line">📏 坐标点数量: ${
        lineData.coordinates ? lineData.coordinates.split(";").length : 0
      }</div>`,
    );

    return lines.join("");
  }

  // 构建多边形悬停提示
  buildPolygonHoverTitle(polygonData) {
    const lines = [];

    lines.push(`<div class="tmap-hover-tooltip-title">平面项目信息</div>`);

    if (polygonData.u_pro_no) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">🔢 编码: ${polygonData.u_pro_no}</div>`,
      );
    }

    if (polygonData.name || polygonData.u_pro_name) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">💡 名称: ${
          polygonData.name || polygonData.u_pro_name
        }</div>`,
      );
    }

    if (polygonData.u_pro_stage) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">📈 阶段: ${polygonData.u_pro_stage}</div>`,
      );
    }

    if (polygonData.u_pro_type) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">📋 类型: ${polygonData.u_pro_type}</div>`,
      );
    }

    if (polygonData.phid_org_name) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">🏢 组织: ${polygonData.phid_org_name}</div>`,
      );
    }

    if (polygonData.u_location) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">🗺️ 位置: ${polygonData.u_location}</div>`,
      );
    }

    if (polygonData.u_remark) {
      lines.push(
        `<div class="tmap-hover-tooltip-line">📖 备注: ${polygonData.u_remark}</div>`,
      );
    }

    lines.push(
      `<div class="tmap-hover-tooltip-line">📏 坐标点数量: ${
        polygonData.coordinates ? polygonData.coordinates.split(";").length : 0
      }</div>`,
    );

    return lines.join("");
  }

  // 解析经纬度字符串
  parseCoordinates(coordinateStr) {
    if (!coordinateStr || typeof coordinateStr !== "string") {
      return [];
    }

    const coordinates = [];
    const points = coordinateStr.split(";").filter((p) => p.trim());

    points.forEach((point) => {
      const cleanPoint = point.trim();
      if (cleanPoint) {
        const [lngStr, latStr] = cleanPoint.split(",");
        const lng = parseFloat(lngStr);
        const lat = parseFloat(latStr);

        if (!isNaN(lng) && !isNaN(lat)) {
          coordinates.push(new T.LngLat(lng, lat));
        }
      }
    });

    return coordinates;
  }

  // 解析ovjsn格式的Latlng数组
  parseOvjsnLatlng(latlngArray) {
    const coordinates = [];

    if (!Array.isArray(latlngArray) || latlngArray.length % 2 !== 0) {
      return coordinates;
    }

    for (let i = 0; i < latlngArray.length; i += 2) {
      const lat = latlngArray[i];
      const lng = latlngArray[i + 1];
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates.push(new T.LngLat(lng, lat));
      }
    }

    return coordinates;
  }

  // 构建坐标字符串
  buildCoordinateString(coordinates) {
    return coordinates.map((coord) => `${coord.lng},${coord.lat}`).join(";");
  }

  // 线条点击事件
  handleLineClick(line, e) {
    const info = this.lineInfoMap.get(line);

    if (typeof this.options.onLineClick === "function") {
      this.options.onLineClick({
        line: line,
        name: info.name,
        phid_pc: info.phid_pc,
        title: info.title,
        originalData: info.originalData,
      });
    }
  }

  // 多边形点击事件
  handlePolygonClick(polygon, e) {
    const info = this.polygonInfoMap.get(polygon);

    if (typeof this.options.onPolygonClick === "function") {
      this.options.onPolygonClick({
        polygon: polygon,
        name: info.name,
        phid_pc: info.phid_pc,
        title: info.title,
        originalData: info.originalData,
      });
    }
  }

  // 线条鼠标悬停事件
  handleLineMouseOver(line, e) {
    const info = this.lineInfoMap.get(line);
    const point = e.containerPoint;

    // 显示鼠标悬停提示
    if (info && info.title) {
      this.showHoverTooltip(info.title, point.x, point.y);
    }

    // 触发自定义的鼠标悬停事件
    if (info && typeof this.options.onLineMouseOver === "function") {
      this.options.onLineMouseOver({
        line: line,
        name: info.name,
        phid_pc: info.phid_pc,
        title: info.title,
        originalData: info.originalData,
      });
    }
  }

  // 线条鼠标移出事件
  handleLineMouseOut(line, e) {
    // 隐藏鼠标悬停提示
    this.hideHoverTooltip();

    const info = this.lineInfoMap.get(line);
    if (info && typeof this.options.onLineMouseOut === "function") {
      this.options.onLineMouseOut({
        line: line,
        name: info.name,
        phid_pc: info.phid_pc,
        title: info.title,
        originalData: info.originalData,
      });
    }
  }

  // 多边形鼠标悬停事件
  handlePolygonMouseOver(polygon, e) {
    const info = this.polygonInfoMap.get(polygon);
    const point = e.containerPoint;

    // 显示鼠标悬停提示
    if (info && info.title) {
      this.showHoverTooltip(info.title, point.x, point.y);
    }

    // 触发自定义的鼠标悬停事件
    if (info && typeof this.options.onPolygonMouseOver === "function") {
      this.options.onPolygonMouseOver({
        polygon: polygon,
        name: info.name,
        phid_pc: info.phid_pc,
        title: info.title,
        originalData: info.originalData,
      });
    }
  }

  // 多边形鼠标移出事件
  handlePolygonMouseOut(polygon, e) {
    // 隐藏鼠标悬停提示
    this.hideHoverTooltip();

    const info = this.polygonInfoMap.get(polygon);
    if (info && typeof this.options.onPolygonMouseOut === "function") {
      this.options.onPolygonMouseOut({
        polygon: polygon,
        name: info.name,
        phid_pc: info.phid_pc,
        title: info.title,
        originalData: info.originalData,
      });
    }
  }

  // 清除所有线条
  clearAllLines() {
    if (this.currentLines.length > 0) {
      try {
        this.map.removeOverLays(this.currentLines);
      } catch (e) {
        this.currentLines.forEach((line) => {
          try {
            this.map.removeOverLay(line);
          } catch (e) {
            console.log("移除线条时出错:", e);
          }
        });
      }
    }
    this.currentLines = [];
    this.lineInfoMap.clear();
    console.log("已清除所有线条");
  }

  // 清除所有多边形
  clearAllPolygons() {
    if (this.currentPolygons.length > 0) {
      try {
        this.map.removeOverLays(this.currentPolygons);
      } catch (e) {
        this.currentPolygons.forEach((polygon) => {
          try {
            this.map.removeOverLay(polygon);
          } catch (e) {
            console.log("移除多边形时出错:", e);
          }
        });
      }
    }
    this.currentPolygons = [];
    this.polygonInfoMap.clear();
    console.log("已清除所有多边形");
  }

  // 清除所有线和面
  clearAll() {
    this.clearAllLines();
    this.clearAllPolygons();
    this.hideHoverTooltip();
  }

  // 更新线条
  updateLines(lineData) {
    this.options.lines = lineData;
    this.createLinesByStage(lineData);
  }

  // 更新多边形
  updatePolygons(polygonData) {
    this.options.polygons = polygonData;
    this.createPolygonsByStage(polygonData);
  }

  // 设置图层可见性
  setLayerVisibility(layerType, visible) {
    this.layerVisibility[layerType] = visible;

    switch (layerType) {
      case "lines":
        if (visible && this.originalLineData.length > 0) {
          this.createLinesByStage(this.originalLineData);
        } else {
          this.clearAllLines();
        }
        break;
      case "polygons":
        if (visible && this.originalPolygonData.length > 0) {
          this.createPolygonsByStage(this.originalPolygonData);
        } else {
          this.clearAllPolygons();
        }
        break;
    }
  }

  // 根据项目编码查找线或面
  findElementByProNo(u_pro_no) {
    // 查找线
    for (let [line, info] of this.lineInfoMap) {
      if (info.u_pro_no === u_pro_no) {
        return {
          type: "line",
          element: line,
          info: info,
        };
      }
    }

    // 查找面
    for (let [polygon, info] of this.polygonInfoMap) {
      if (info.u_pro_no === u_pro_no) {
        return {
          type: "polygon",
          element: polygon,
          info: info,
        };
      }
    }

    return null;
  }

  // 获取统计数据
  getStats() {
    return {
      lines: this.currentLines.length,
      polygons: this.currentPolygons.length,
      lineVisibility: this.layerVisibility.lines,
      polygonVisibility: this.layerVisibility.polygons,
    };
  }

  // 清理资源
  destroy() {
    this.clearAll();
    if (this.hoverTooltip && document.body.contains(this.hoverTooltip)) {
      document.body.removeChild(this.hoverTooltip);
    }
  }
}

// 地图管理器 - 整合的控制面板
class TMapManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = Object.assign(
      {
        center: { lng: 116.40093, lat: 39.90313 },
        zoom: 12,
        enableScrollWheelZoom: true,
        enableOverviewMap: true,
        enableMapTypeControl: true,
        onLoad: null,
        // 添加查询条件字段
        queryConditions: {}, // 初始查询条件
      },
      options,
    );

    this.map = null;
    this.loader = new TMapLoader(options.tk);
    this.overviewMap = null;
    this.mapTypeControl = null;
    this.markerManager = null;
    this.linePolygonManager = null;

    // 新增：搜索相关属性
    this.searchControl = null;
    this.searchResults = null;
    this.localSearch = null;

    // 修改：控制面板默认状态全部收起
    this.controlStates = {
      overviewMap: this.options.enableOverviewMap,
      mapTypeControl: this.options.enableMapTypeControl,
      // 控制面板状态 - 修改为默认全部收起
      mainPanelCollapsed: true, // 主面板默认收起
      mapControlsCollapsed: true, // 地图控制默认收起
      layerControlsCollapsed: true, // 图层控制默认收起
      stageControlsCollapsed: true, // 阶段控制默认收起
    };

    // 当前查询条件
    this.currentConditions = Object.assign({}, this.options.queryConditions);

    // 项目阶段控制相关
    this.allStages = new Set();

    // 控制面板元素
    this.controlPanel = null;

    this.defineAnchors();
  }

  defineAnchors() {
    if (typeof T_ANCHOR_TOP_LEFT === "undefined") {
      window.T_ANCHOR_TOP_LEFT = 0;
      window.T_ANCHOR_TOP_RIGHT = 1;
      window.T_ANCHOR_BOTTOM_LEFT = 2;
      window.T_ANCHOR_BOTTOM_RIGHT = 3;
    }
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`容器 #${this.containerId} 不存在`);
      return;
    }

    container.style.width = this.options.width || "100%";
    container.style.height = this.options.height || "400px";
    container.style.position = "relative";

    this.loader.load(() => {
      try {
        console.time("地图初始化耗时");

        this.map = new T.Map(this.containerId, {
          attributionControl: false,
          inertia: true,
          doubleClickZoom: true,
        });

        const point = new T.LngLat(
          this.options.center.lng,
          this.options.center.lat,
        );
        this.map.centerAndZoom(point, this.options.zoom);

        if (this.options.enableScrollWheelZoom) {
          this.map.enableScrollWheelZoom();
        }

        console.timeEnd("地图初始化耗时");

        // 创建整合的控制面板
        this.createIntegratedControlPanel();

        // 新增：创建顶部搜索控件
        this.createTopSearchControl();

        // 加载服务器数据（使用当前条件）
        this.loadServerData(this.currentConditions);

        // 添加控件
        setTimeout(() => {
          if (this.controlStates.overviewMap) {
            this.addOverviewMap();
          }
          if (this.controlStates.mapTypeControl) {
            this.addMapTypeControl();
          }
        }, 500);

        if (typeof this.options.onLoad === "function") {
          this.options.onLoad(this.map);
        }
      } catch (error) {
        console.error("天地图初始化失败:", error);
      }
    });
  }

  // 新增：创建顶部搜索控件
  createTopSearchControl() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // 创建搜索控件容器
    this.searchControl = document.createElement("div");
    this.searchControl.className = "tmap-top-search-control";

    // 搜索输入框和按钮
    const searchHTML = `
                    <div class="search-row">
                        <input type="text" class="search-input" placeholder="搜索地点..." id="searchInput">
                        <button class="search-button" id="searchButton">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="search-results" id="searchResults"></div>
                `;

    this.searchControl.innerHTML = searchHTML;
    container.appendChild(this.searchControl);

    // 初始化本地搜索
    this.initLocalSearch();

    // 绑定搜索事件
    this.bindSearchEvents();
  }

  // 新增：初始化本地搜索
  initLocalSearch() {
    const config = {
      pageCapacity: 10,
      onSearchComplete: (result) => {
        this.handleSearchResult(result);
      },
    };
    this.localSearch = new T.LocalSearch(this.map, config);
  }

  // 新增：绑定搜索事件
  bindSearchEvents() {
    const searchInput = this.searchControl.querySelector("#searchInput");
    const searchButton = this.searchControl.querySelector("#searchButton");
    this.searchResults = this.searchControl.querySelector("#searchResults");

    // 按钮点击搜索
    searchButton.addEventListener("click", () => {
      this.performSearch(searchInput.value);
    });

    // 回车键搜索
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch(searchInput.value);
      }
    });

    // 输入框获得焦点时显示上次搜索结果
    searchInput.addEventListener("focus", () => {
      if (this.searchResults.children.length > 0) {
        this.searchResults.classList.add("show");
      }
    });

    // 点击其他地方隐藏搜索结果
    document.addEventListener("click", (e) => {
      if (!this.searchControl.contains(e.target)) {
        this.searchResults.classList.remove("show");
      }
    });
  }

  // 新增：执行搜索
  performSearch(keyword) {
    keyword = keyword.trim();
    if (!keyword) {
      this.showTempMessage("请输入搜索关键词");
      return;
    }

    this.searchResults.innerHTML = "";
    this.searchResults.classList.add("show");
    this.searchResults.innerHTML =
      '<div class="search-result-item">搜索中...</div>';

    this.localSearch.search(keyword);
  }

  // 新增：处理搜索结果
  handleSearchResult(result) {
    this.searchResults.innerHTML = "";

    if (!result) {
      this.searchResults.innerHTML =
        '<div class="search-result-item">未找到相关结果</div>';
      return;
    }

    const resultType = parseInt(result.getResultType());
    let hasResults = false;

    switch (resultType) {
      case 1: // 点数据结果
        const pois = result.getPois();
        if (pois && pois.length > 0) {
          this.showSearchResults(pois);
          hasResults = true;
        }
        break;
      case 3: // 区域结果
        const area = result.getArea();
        if (area) {
          this.showAreaResults(area);
          hasResults = true;
        }
        break;
      case 4: // 建议词结果
        const suggests = result.getSuggests();
        if (suggests && suggests.length > 0) {
          this.showSuggestsResults(suggests);
          hasResults = true;
        }
        break;
    }

    if (!hasResults) {
      this.searchResults.innerHTML =
        '<div class="search-result-item">未找到相关结果</div>';
    }
  }

  // 新增：显示搜索结果
  showSearchResults(pois) {
    const zoomArr = [];

    pois.forEach((poi, index) => {
      const name = poi.name;
      const address = poi.address;
      const lnglatArr = poi.lonlat ? poi.lonlat.split(",") : [0, 0];

      if (lnglatArr.length === 2) {
        const lng = parseFloat(lnglatArr[0]);
        const lat = parseFloat(lnglatArr[1]);

        if (!isNaN(lng) && !isNaN(lat)) {
          zoomArr.push(new T.LngLat(lng, lat));
        }
      }

      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";
      resultItem.innerHTML = `
                        <div class="result-title">${name}</div>
                        <div class="result-address">${
                          address || "暂无地址信息"
                        }</div>
                    `;

      // 点击结果定位到该位置
      resultItem.addEventListener("click", () => {
        if (lnglatArr.length === 2) {
          const lng = parseFloat(lnglatArr[0]);
          const lat = parseFloat(lnglatArr[1]);

          if (!isNaN(lng) && !isNaN(lat)) {
            const lnglat = new T.LngLat(lng, lat);
            this.map.centerAndZoom(lnglat, 15);
            this.searchResults.classList.remove("show");

            // 清除现有标记并添加新标记
            if (this.markerManager) {
              this.markerManager.clearAllMarkers();
            }

            const marker = new T.Marker(lnglat, {
              title: name,
            });
            this.map.addOverLay(marker);

            // 显示信息窗口
            const infoContent = `
                                    <div style="padding: 10px; max-width: 200px;">
                                        <div style="font-weight: bold; margin-bottom: 5px;">${name}</div>
                                        <div style="font-size: 12px; color: #666;">${
                                          address || "暂无地址信息"
                                        }</div>
                                    </div>
                                `;
            const infoWindow = new T.InfoWindow(infoContent);
            marker.openInfoWindow(infoWindow);

            this.showTempMessage(`已定位到: ${name}`);
          }
        }
      });

      this.searchResults.appendChild(resultItem);
    });

    // 调整地图视图以显示所有搜索结果
    if (zoomArr.length > 0) {
      this.map.setViewport(zoomArr);
    }
  }

  // 新增：显示区域结果
  showAreaResults(area) {
    const resultItem = document.createElement("div");
    resultItem.className = "search-result-item";
    resultItem.innerHTML = `<div class="result-title">${
      area.name || "区域"
    }</div>`;

    resultItem.addEventListener("click", () => {
      if (area.lonlat) {
        const regionArr = area.lonlat.split(",");
        if (regionArr.length >= 2) {
          const lng = parseFloat(regionArr[0]);
          const lat = parseFloat(regionArr[1]);

          if (!isNaN(lng) && !isNaN(lat)) {
            const lnglat = new T.LngLat(lng, lat);
            this.map.centerAndZoom(lnglat, 10);
            this.searchResults.classList.remove("show");
            this.showTempMessage(`已定位到区域: ${area.name || ""}`);
          }
        }
      }
    });

    this.searchResults.appendChild(resultItem);
  }

  // 新增：显示建议词结果
  showSuggestsResults(suggests) {
    suggests.forEach((suggest) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";
      resultItem.innerHTML = `<div class="result-title">${suggest.name}</div>`;

      resultItem.addEventListener("click", () => {
        const searchInput = this.searchControl.querySelector("#searchInput");
        searchInput.value = suggest.name;
        this.performSearch(suggest.name);
      });

      this.searchResults.appendChild(resultItem);
    });
  }

  // 创建整合的控制面板
  createIntegratedControlPanel() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // 创建主控制面板
    this.controlPanel = document.createElement("div");
    this.controlPanel.className = "tmap-main-control";
    this.controlPanel.style.width = "320px";

    // 修改：添加初始的collapsed类，使控制面板默认收起
    if (this.controlStates.mainPanelCollapsed) {
      this.controlPanel.classList.add("collapsed");
    }

    // 地图控制图标SVG（您提供的图标）
    const mapIconSVG = ``;
    // 创建面板内容
    const panelHTML = `
                    <!-- 面板头部 -->
                    <div class="tmap-main-control-header">
                        <div class="tmap-main-control-title">
                            <span class="tmap-main-control-icon">${mapIconSVG}</span>
                            <span>地图控制面板</span>
                        </div>
                        <div class="tmap-main-control-toggle">${
                          this.controlStates.mainPanelCollapsed ? "+" : "-"
                        }</div>
                    </div>
                    
                    <!-- 面板内容 -->
                    <div class="tmap-main-control-content">
                        <!-- 统计信息 -->
                        <div class="tmap-stats-panel" id="statsPanel">
                            <div class="tmap-stats-title">地图统计</div>
                            <div class="tmap-stats-grid">
                                <div class="tmap-stat-item">
                                    <div class="tmap-stat-label">普通项目</div>
                                    <div class="tmap-stat-value markers" id="statMarkers">0</div>
                                </div>
                                <div class="tmap-stat-item">
                                    <div class="tmap-stat-label">线性项目</div>
                                    <div class="tmap-stat-value lines" id="statLines">0</div>
                                </div>
                                <div class="tmap-stat-item">
                                    <div class="tmap-stat-label">平面项目</div>
                                    <div class="tmap-stat-value polygons" id="statPolygons">0</div>
                                </div>
                            </div>
                            <div class="tmap-stats-footer" id="statsFooter">
                                提示：点击元素查看详情，鼠标悬停查看信息
                            </div>
                        </div>
                        
                        <!-- 地图控制组 - 添加初始的collapsed类 -->
                        <div class="tmap-control-group ${
                          this.controlStates.mapControlsCollapsed
                            ? "collapsed"
                            : ""
                        }" id="mapControlsGroup">
                            <div class="tmap-control-group-header">
                                <div class="tmap-control-group-title">
                                    <span class="tmap-control-group-icon"></span>
                                    <span>地图控制</span>
                                </div>
                                <div class="tmap-control-group-toggle ${
                                  this.controlStates.mapControlsCollapsed
                                    ? "collapsed"
                                    : ""
                                }">${
                                  this.controlStates.mapControlsCollapsed
                                    ? "▶"
                                    : "▼"
                                }</div>
                            </div>
                            <div class="tmap-control-group-content">
                                <div class="tmap-map-controls">
                                    <div class="tmap-control-item">
                                        <input type="checkbox" id="toggleOverview" class="tmap-control-checkbox" ${
                                          this.controlStates.overviewMap
                                            ? "checked"
                                            : ""
                                        }>
                                        <label for="toggleOverview" class="tmap-control-label">鹰眼控件</label>
                                    </div>
                                    <div class="tmap-control-item">
                                        <input type="checkbox" id="toggleMapType" class="tmap-control-checkbox" ${
                                          this.controlStates.mapTypeControl
                                            ? "checked"
                                            : ""
                                        }>
                                        <label for="toggleMapType" class="tmap-control-label">地图类型控件</label>
                                    </div>
                                    <div class="tmap-control-buttons">
                                        <button id="clearAll" class="tmap-control-button">清除全部</button>
                                        <button id="reloadData" class="tmap-control-button">重新加载</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 图层控制组 - 添加初始的collapsed类 -->
                        <div class="tmap-control-group ${
                          this.controlStates.layerControlsCollapsed
                            ? "collapsed"
                            : ""
                        }" id="layerControlsGroup">
                            <div class="tmap-control-group-header">
                                <div class="tmap-control-group-title">
                                    <span class="tmap-control-group-icon"></span>
                                    <span>图层控制</span>
                                </div>
                                <div class="tmap-control-group-toggle ${
                                  this.controlStates.layerControlsCollapsed
                                    ? "collapsed"
                                    : ""
                                }">${
                                  this.controlStates.layerControlsCollapsed
                                    ? "▶"
                                    : "▼"
                                }</div>
                            </div>
                            <div class="tmap-control-group-content">
                                <div class="tmap-layer-controls">
                                    <div class="tmap-layer-item">
                                        <input type="checkbox" id="toggleMarkers" class="tmap-layer-checkbox" checked>
                                        <label for="toggleMarkers" class="tmap-layer-label">普通项目图层(点)</label>
                                        <div class="tmap-layer-count" id="markerCountInfo">0个</div>
                                    </div>
                                    <div class="tmap-layer-item">
                                        <input type="checkbox" id="toggleLines" class="tmap-layer-checkbox" checked>
                                        <label for="toggleLines" class="tmap-layer-label">线性项目图层(线)</label>
                                        <div class="tmap-layer-count" id="lineCountInfo">0条</div>
                                    </div>
                                    <div class="tmap-layer-item">
                                        <input type="checkbox" id="togglePolygons" class="tmap-layer-checkbox" checked>
                                        <label for="togglePolygons" class="tmap-layer-label">平面项目图层(面)</label>
                                        <div class="tmap-layer-count" id="polygonCountInfo">0个</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 项目阶段控制组 - 添加初始的collapsed类 -->
                        <div class="tmap-control-group ${
                          this.controlStates.stageControlsCollapsed
                            ? "collapsed"
                            : ""
                        }" id="stageControlsGroup">
                            <div class="tmap-control-group-header">
                                <div class="tmap-control-group-title">
                                    <span class="tmap-control-group-icon"></span>
                                    <span>项目阶段</span>
                                </div>
                                <div class="tmap-control-group-toggle ${
                                  this.controlStates.stageControlsCollapsed
                                    ? "collapsed"
                                    : ""
                                }">${
                                  this.controlStates.stageControlsCollapsed
                                    ? "▶"
                                    : "▼"
                                }</div>
                            </div>
                            <div class="tmap-control-group-content">
                                <div class="tmap-stage-controls" id="stageControls">
                                    <div class="tmap-stage-all">
                                        <input type="checkbox" id="toggleAllStages" class="tmap-stage-checkbox" checked>
                                        <div class="tmap-stage-info">
                                            <span class="tmap-stage-label" style="font-weight: 500;">全部阶段</span>
                                        </div>
                                    </div>
                                    <!-- 阶段列表将在这里动态生成 -->
                                    <div id="stageList"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

    this.controlPanel.innerHTML = panelHTML;
    container.appendChild(this.controlPanel);

    // 绑定控制面板事件
    setTimeout(() => {
      this.bindControlPanelEvents();
      this.updateStatsDisplay();
    }, 300);
  }

  // 绑定控制面板事件
  bindControlPanelEvents() {
    if (!this.controlPanel) return;

    // 主面板折叠/展开
    const mainHeader = this.controlPanel.querySelector(
      ".tmap-main-control-header",
    );
    const mainToggle = this.controlPanel.querySelector(
      ".tmap-main-control-toggle",
    );

    mainHeader.addEventListener("click", () => {
      this.controlStates.mainPanelCollapsed =
        !this.controlStates.mainPanelCollapsed;
      this.controlPanel.classList.toggle(
        "collapsed",
        this.controlStates.mainPanelCollapsed,
      );
      mainToggle.classList.toggle(
        "collapsed",
        this.controlStates.mainPanelCollapsed,
      );

      // 更新图标
      if (this.controlStates.mainPanelCollapsed) {
        mainToggle.textContent = "+";
      } else {
        mainToggle.textContent = "-";
      }
    });

    // 地图控制组折叠/展开
    this.bindControlGroupEvents("mapControlsGroup", "mapControlsCollapsed");

    // 图层控制组折叠/展开
    this.bindControlGroupEvents("layerControlsGroup", "layerControlsCollapsed");

    // 阶段控制组折叠/展开
    this.bindControlGroupEvents("stageControlsGroup", "stageControlsCollapsed");

    // 绑定控制事件
    this.bindControlEvents();

    // 绑定图层控制事件
    this.bindLayerControlEvents();
  }

  // 绑定控制组事件
  bindControlGroupEvents(groupId, stateKey) {
    const group = this.controlPanel.querySelector(`#${groupId}`);
    if (!group) return;

    const header = group.querySelector(".tmap-control-group-header");
    const toggle = group.querySelector(".tmap-control-group-toggle");

    header.addEventListener("click", () => {
      this.controlStates[stateKey] = !this.controlStates[stateKey];
      group.classList.toggle("collapsed", this.controlStates[stateKey]);
      toggle.classList.toggle("collapsed", this.controlStates[stateKey]);

      // 更新图标
      if (this.controlStates[stateKey]) {
        toggle.textContent = "▶";
      } else {
        toggle.textContent = "▼";
      }
    });
  }

  // 绑定控制事件
  bindControlEvents() {
    // 鹰眼控件切换
    const toggleOverview = this.controlPanel.querySelector("#toggleOverview");
    if (toggleOverview) {
      toggleOverview.addEventListener("change", (e) => {
        this.controlStates.overviewMap = e.target.checked;
        if (e.target.checked) {
          this.addOverviewMap();
          this.showTempMessage("鹰眼控件已打开");
        } else {
          this.removeOverviewMap();
          this.showTempMessage("鹰眼控件已关闭");
        }
      });
    }

    // 地图类型控件切换
    const toggleMapType = this.controlPanel.querySelector("#toggleMapType");
    if (toggleMapType) {
      toggleMapType.addEventListener("change", (e) => {
        this.controlStates.mapTypeControl = e.target.checked;
        if (e.target.checked) {
          this.addMapTypeControl();
          this.showTempMessage("地图类型控件已打开");
        } else {
          this.removeMapTypeControl();
          this.showTempMessage("地图类型控件已关闭");
        }
      });
    }

    // 清除全部
    const clearAllBtn = this.controlPanel.querySelector("#clearAll");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        if (this.markerManager) {
          this.markerManager.clearAllMarkers();
        }
        if (this.linePolygonManager) {
          this.linePolygonManager.clearAll();
        }
        setTimeout(() => {
          this.updateStatsDisplay();
          this.showTempMessage("所有内容已清除");
        }, 300);
      });
    }

    // 重新加载数据
    const reloadBtn = this.controlPanel.querySelector("#reloadData");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => {
        this.showTempMessage("正在重新加载所有数据...");
        if (this.markerManager) {
          this.markerManager.clearAllMarkers();
        }
        if (this.linePolygonManager) {
          this.linePolygonManager.clearAll();
        }
        setTimeout(() => {
          // 使用当前条件重新加载
          this.loadServerData(this.currentConditions);
          setTimeout(() => {
            this.updateStatsDisplay();
            this.showTempMessage("所有数据已重新加载");
          }, 1500);
        }, 500);
      });
    }
  }

  // 绑定图层控制事件
  bindLayerControlEvents() {
    // 标记点图层切换
    const toggleMarkers = this.controlPanel.querySelector("#toggleMarkers");
    if (toggleMarkers) {
      toggleMarkers.addEventListener("change", (e) => {
        const visible = e.target.checked;
        if (this.markerManager) {
          if (visible) {
            this.markerManager.showMarkers();
            this.showTempMessage("标记点图层已显示");
          } else {
            this.markerManager.hideMarkers();
            this.showTempMessage("标记点图层已隐藏");
          }
        }
        this.updateStatsDisplay();
      });
    }

    // 线条图层切换
    const toggleLines = this.controlPanel.querySelector("#toggleLines");
    if (toggleLines) {
      toggleLines.addEventListener("change", (e) => {
        const visible = e.target.checked;
        if (this.linePolygonManager) {
          this.linePolygonManager.setLayerVisibility("lines", visible);
          this.showTempMessage(visible ? "线条图层已显示" : "线条图层已隐藏");
        }
        this.updateStatsDisplay();
      });
    }

    // 多边形图层切换
    const togglePolygons = this.controlPanel.querySelector("#togglePolygons");
    if (togglePolygons) {
      togglePolygons.addEventListener("change", (e) => {
        const visible = e.target.checked;
        if (this.linePolygonManager) {
          this.linePolygonManager.setLayerVisibility("polygons", visible);
          this.showTempMessage(
            visible ? "多边形图层已显示" : "多边形图层已隐藏",
          );
        }
        this.updateStatsDisplay();
      });
    }
  }

  // 绑定阶段控制事件
  bindStageControlEvents() {
    // 全选/全不选
    const toggleAll = this.controlPanel.querySelector("#toggleAllStages");
    if (toggleAll) {
      toggleAll.addEventListener("change", (e) => {
        const visible = e.target.checked;

        // 设置标记点的所有阶段
        if (this.markerManager) {
          this.markerManager.setAllStagesVisibility(visible);
        }

        // 设置线和面的所有阶段
        if (this.linePolygonManager) {
          this.linePolygonManager.setAllStagesVisibility(visible);
        }

        // 更新所有单个阶段的复选框状态
        const stageCheckboxes =
          this.controlPanel.querySelectorAll("input[data-stage]");
        stageCheckboxes.forEach((checkbox) => {
          checkbox.checked = visible;
        });

        this.showTempMessage(visible ? "已显示所有阶段" : "已隐藏所有阶段");
        this.updateStatsDisplay();
      });
    }

    // 单个阶段控制
    const stageCheckboxes =
      this.controlPanel.querySelectorAll("input[data-stage]");
    stageCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const stage = e.target.getAttribute("data-stage");
        const visible = e.target.checked;

        // 设置标记点的阶段可见性
        if (this.markerManager) {
          this.markerManager.setStageVisibility(stage, visible);
        }

        // 设置线和面的阶段可见性
        if (this.linePolygonManager) {
          this.linePolygonManager.setStageVisibility(stage, visible);
        }

        // 更新全选复选框状态
        this.updateToggleAllCheckbox();

        this.showTempMessage(`${visible ? "显示" : "隐藏"}阶段: ${stage}`);
        this.updateStatsDisplay();
      });
    });
  }

  // 更新全选复选框状态
  updateToggleAllCheckbox() {
    const toggleAll = this.controlPanel.querySelector("#toggleAllStages");
    if (!toggleAll) return;

    const stageCheckboxes =
      this.controlPanel.querySelectorAll("input[data-stage]");
    if (stageCheckboxes.length === 0) return;

    const allChecked = Array.from(stageCheckboxes).every((cb) => cb.checked);
    const allUnchecked = Array.from(stageCheckboxes).every((cb) => !cb.checked);

    if (allChecked) {
      toggleAll.checked = true;
      toggleAll.indeterminate = false;
    } else if (allUnchecked) {
      toggleAll.checked = false;
      toggleAll.indeterminate = false;
    } else {
      toggleAll.checked = false;
      toggleAll.indeterminate = true;
    }
  }

  // 从服务器加载数据（支持条件查询）
  loadServerData(conditions = null) {
    console.log("开始从服务器加载数据...");

    // 如果有传入条件，则使用新条件，否则使用当前条件
    const queryConditions = conditions || this.currentConditions;

    // 更新当前条件
    if (conditions) {
      this.currentConditions = Object.assign({}, conditions);
    }

    console.log("查询条件:", queryConditions);

    $NG.execServer(
      "selectAllMapPLA",
      queryConditions,
      (res) => {
        console.log("服务器返回数据:", res);

        if (res.count == 0) {
          console.log("没有查询到数据");
          this.showTempMessage("没有查询到数据");
          return;
        }

        try {
          const data = JSON.parse(res.data);
          if (!data || data.length == 0) {
            console.log("数据为空");
            this.showTempMessage("数据为空");
            return;
          }

          console.log(`成功获取 ${data.length} 条数据`);

          // 处理数据
          this.processServerData(data);

          // 更新阶段控制面板
          setTimeout(() => {
            this.updateStageControlPanel();
          }, 1000);
        } catch (error) {
          console.error("处理服务器数据失败:", error);
          this.showTempMessage("数据处理失败");
        }
      },
      (error) => {
        console.error("服务器请求失败:", error);
        this.showTempMessage("数据加载失败");
      },
    );
  }

  // 处理服务器数据
  processServerData(serverData) {
    const markerData = [];
    const lineData = [];
    const polygonData = [];

    // 清空阶段集合
    this.allStages.clear();

    serverData.forEach((item, index) => {
      const { extendObjects } = item;

      if (!extendObjects) {
        console.warn(`第 ${index + 1} 条数据缺少 extendObjects`);
        return;
      }

      const {
        u_marks,
        phid_pc,
        u_pro_name,
        u_pro_no,
        u_pro_stage,
        phid_org_name,
        u_pro_type,
        u_longitude,
        u_latitude,
        u_location,
        u_remark,
        u_json,
      } = extendObjects;

      // 收集阶段信息
      if (u_pro_stage) {
        this.allStages.add(u_pro_stage);
      }

      // 根据u_marks类型处理数据
      const markType = parseInt(u_marks) || 0;

      // 基础数据对象
      const baseData = {
        phid_pc: phid_pc || "",
        u_pro_name: u_pro_name || "",
        u_pro_no: u_pro_no || "",
        u_pro_stage: u_pro_stage || "",
        phid_org_name: phid_org_name || "",
        u_pro_type: u_pro_type || "",
        u_location: u_location || "",
        u_remark: u_remark || "",
        u_json: u_json || "",
      };

      switch (markType) {
        case 0: // 点
          this.processPointData(markerData, extendObjects);
          break;
        case 1: // 线
          this.processLineData(lineData, baseData, u_json);
          break;
        case 2: // 面
          this.processPolygonData(polygonData, baseData, u_json);
          break;
        default:
          console.warn(`未知的标记类型: ${u_marks}`);
      }
    });

    console.log(
      `数据处理完成: ${markerData.length}个点, ${lineData.length}条线, ${polygonData.length}个面`,
    );
    console.log("所有项目阶段:", Array.from(this.allStages));

    // 创建标记管理器
    this.createMarkerManager(markerData);

    // 创建线和面管理器
    this.createLinePolygonManager(lineData, polygonData);

    // 更新统计显示
    this.updateStatsDisplay();
  }

  // 处理点数据
  processPointData(markerData, data) {
    const lng = parseFloat(data.u_longitude);
    const lat = parseFloat(data.u_latitude);

    if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
      console.warn(`跳过无效经纬度的点数据: phid_pc=${data.phid_pc}`);
      return;
    }

    const marker = {
      lng: lng,
      lat: lat,
      title: data.u_location || data.u_pro_name || "未命名点",
      phid_pc: data.phid_pc || "",
      u_pro_no: data.u_pro_no || "",
      u_pro_name: data.u_pro_name || "",
      u_pro_type: data.u_pro_type || "",
      u_pro_stage: data.u_pro_stage || "",
      phid_org_name: data.phid_org_name || "",
      u_location: data.u_location || "",
      u_remark: data.u_remark || "",
      draggable: false,
    };

    markerData.push(marker);
  }

  // 处理线数据
  processLineData(lineData, baseData, u_json) {
    try {
      // 解析u_json
      const jsonData = u_json ? JSON.parse(u_json) : null;
      let coordinates = "";
      let lineColor = "#FF0000";
      let lineWidth = 2;
      let lineOpacity = 50;
      let name = baseData.u_pro_name || "未命名线";

      if (jsonData && jsonData.ObjItems && jsonData.ObjItems.length > 0) {
        const objItem = jsonData.ObjItems[0];
        const objDetail = objItem.Object.ObjectDetail;

        // 解析名称
        if (objItem.Object.Name) {
          name = objItem.Object.Name;
        }

        // 解析样式
        if (objDetail.TrackDraw) {
          const trackDraw = objDetail.TrackDraw;
          lineWidth = trackDraw.LineWidth || 2;
          lineOpacity = trackDraw.LineAlpha || 50;

          // 转换颜色（ARGB转RGBA）
          const argbColor = trackDraw.LineClr || 4211015680;
          lineColor = this.argbToHex(argbColor);
        }

        // 解析坐标（Latlng数组）
        if (objDetail.Latlng && Array.isArray(objDetail.Latlng)) {
          const latlngArray = objDetail.Latlng;
          const coords = [];
          for (let i = 0; i < latlngArray.length; i += 2) {
            const lat = latlngArray[i];
            const lng = latlngArray[i + 1];
            if (!isNaN(lat) && !isNaN(lng)) {
              coords.push(`${lng},${lat}`);
            }
          }
          coordinates = coords.join(";");
        }
      }

      if (!coordinates) {
        console.warn(`无线条坐标数据: phid_pc=${baseData.phid_pc}`);
        return;
      }

      const line = {
        name: name,
        coordinates: coordinates,
        lineWidth: lineWidth,
        lineColor: lineColor,
        lineOpacity: lineOpacity,
        ...baseData,
      };

      lineData.push(line);
      console.log(
        `解析线条数据成功: ${name}, 坐标点数量: ${
          coordinates.split(";").length
        }`,
      );
    } catch (error) {
      console.error("处理线条数据失败:", error, baseData);
    }
  }

  // 处理面数据 - 将填充色改为蓝色
  processPolygonData(polygonData, baseData, u_json) {
    try {
      // 解析u_json
      const jsonData = u_json ? JSON.parse(u_json) : null;
      let coordinates = "";
      let lineColor = "#0000FF";
      let fillColor = "#3388FF"; // 改为蓝色填充
      let lineWidth = 1;
      let lineOpacity = 50;
      let fillOpacity = 30; // 增加透明度
      let name = baseData.u_pro_name || "未命名面";

      if (jsonData && jsonData.ObjItems && jsonData.ObjItems.length > 0) {
        const objItem = jsonData.ObjItems[0];
        const objDetail = objItem.Object.ObjectDetail;

        // 解析名称
        if (objItem.Object.Name) {
          name = objItem.Object.Name;
        }

        // 解析样式
        lineWidth = objDetail.LineWidth || 1;
        lineOpacity = objDetail.LineAlpha || 50;
        fillOpacity = objDetail.AreaAlpha || 30;

        // 转换颜色（ARGB转RGBA）
        if (objDetail.LineClr) {
          lineColor = this.argbToHex(objDetail.LineClr);
        }
        if (objDetail.AreaClr) {
          fillColor = this.argbToHex(objDetail.AreaClr);
        }

        // 解析坐标（Latlng数组）
        if (objDetail.Latlng && Array.isArray(objDetail.Latlng)) {
          const latlngArray = objDetail.Latlng;
          const coords = [];
          for (let i = 0; i < latlngArray.length; i += 2) {
            const lat = latlngArray[i];
            const lng = latlngArray[i + 1];
            if (!isNaN(lat) && !isNaN(lng)) {
              coords.push(`${lng},${lat}`);
            }
          }
          coordinates = coords.join(";");
        }
      }

      if (!coordinates) {
        console.warn(`无多边形坐标数据: phid_pc=${baseData.phid_pc}`);
        return;
      }

      const polygon = {
        name: name,
        coordinates: coordinates,
        lineWidth: lineWidth,
        lineColor: lineColor,
        lineOpacity: lineOpacity,
        fillColor: fillColor, // 使用蓝色填充
        fillOpacity: fillOpacity,
        ...baseData,
      };

      polygonData.push(polygon);
      console.log(
        `解析多边形数据成功: ${name}, 坐标点数量: ${
          coordinates.split(";").length
        }`,
      );
    } catch (error) {
      console.error("处理多边形数据失败:", error, baseData);
    }
  }

  // ARGB颜色转Hex颜色
  argbToHex(argb) {
    // ARGB格式：AARRGGBB
    const a = ((argb >> 24) & 0xff).toString(16).padStart(2, "0");
    const r = ((argb >> 16) & 0xff).toString(16).padStart(2, "0");
    const g = ((argb >> 8) & 0xff).toString(16).padStart(2, "0");
    const b = (argb & 0xff).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  // 创建标记管理器
  createMarkerManager(markerData) {
    if (!this.map) return;

    // 获取授权信息
    const authDataValue = this.getAuthValue();

    this.markerManager = new TMapMarkerManager(this.map, {
      markerData: markerData,
      onMarkerClick: (data) => {
        const clickedMarkerData = data.originalData;
        if (clickedMarkerData && clickedMarkerData.phid_pc) {
          const url = this.buildProjectUrl(
            clickedMarkerData.phid_pc,
            authDataValue,
          );
          const title = "项目信息";
          $NG.open(url, {
            AppTitle: title,
            name: title,
          });
        } else {
          this.showTempMessage("无法打开项目信息，缺少必要数据", 2000);
        }
      },
      onMarkerMouseOver: (data) => {
        // 不再显示简单的临时消息，使用统一的鼠标悬停提示
      },
      onMarkerMouseOut: (data) => {
        // 可以在这里移除临时消息
      },
    });

    // 创建标记
    setTimeout(() => {
      this.markerManager.createMarkersByStage();
      this.updateStatsDisplay();
      if (markerData.length > 0) {
        this.showTempMessage(`已加载 ${markerData.length} 个普通项目`, 2000);
      }
    }, 500);
  }

  // 创建线和面管理器
  createLinePolygonManager(lineData, polygonData) {
    if (!this.map) return;

    // 获取授权信息
    const authDataValue = this.getAuthValue();

    this.linePolygonManager = new TMapLinePolygonManager(this.map, {
      lines: lineData,
      polygons: polygonData,
      onLineClick: (data) => {
        if (data.phid_pc) {
          const url = this.buildProjectUrl(data.phid_pc, authDataValue);
          const title = "项目信息";
          $NG.open(url, {
            AppTitle: title,
            name: title,
          });
        } else {
          this.showTempMessage(`点击了线条: ${data.name}`, 2000);
        }
      },
      onPolygonClick: (data) => {
        if (data.phid_pc) {
          const url = this.buildProjectUrl(data.phid_pc, authDataValue);
          const title = "项目信息";
          $NG.open(url, {
            AppTitle: title,
            name: title,
          });
        } else {
          this.showTempMessage(`点击了多边形: ${data.name}`, 2000);
        }
      },
      onLineMouseOver: (data) => {
        // 不再显示简单的临时消息，使用统一的鼠标悬停提示
      },
      onPolygonMouseOver: (data) => {
        // 不再显示简单的临时消息，使用统一的鼠标悬停提示
      },
      onLineMouseOut: (data) => {
        // 可以在这里移除临时消息
      },
      onPolygonMouseOut: (data) => {
        // 可以在这里移除临时消息
      },
    });

    console.log(
      `线和面管理器已创建: ${lineData.length}条线, ${polygonData.length}个面`,
    );
    this.updateStatsDisplay();
  }

  // 获取授权信息
  getAuthValue() {
    let authDataValue = "";
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.toLowerCase().startsWith("auth")) {
        authDataValue = sessionStorage.getItem(key);
        break;
      }
    }
    return authDataValue;
  }

  // 构建项目URL
  buildProjectUrl(phid_pc, authDataValue) {
    return `https://ynnterp-mproject.cnyeig.com/PMS/PC/ProjectTable/ProjectTableEdit?AppTitle=%E9%A1%B9%E7%9B%AE%E4%BF%A1%E6%81%AF-%E6%9F%A5%E7%9C%8B&otype=view&mtype=&id=${phid_pc}&phidratepay=0&projprop=3&Authorization=${authDataValue}`;
  }

  // 更新项目阶段控制面板
  updateStageControlPanel() {
    const stageList = this.controlPanel.querySelector("#stageList");
    if (!stageList) return;

    // 获取所有阶段的统计信息
    const markerStageStats = this.markerManager
      ? this.markerManager.getStageStats()
      : {};
    const linePolygonStageStats = this.linePolygonManager
      ? this.linePolygonManager.getStageStats()
      : {};

    // 合并阶段统计信息
    const allStages = new Set([
      ...Object.keys(markerStageStats),
      ...Object.keys(linePolygonStageStats),
    ]);

    if (allStages.size === 0) {
      stageList.innerHTML =
        '<div style="font-size: 11px; color: #999; text-align: center; padding: 10px;">暂无项目阶段数据</div>';
      return;
    }

    let stageHTML = "";

    // 添加各个阶段的控制
    allStages.forEach((stage) => {
      const markerCount = markerStageStats[stage]
        ? markerStageStats[stage].count || 0
        : 0;
      const lineCount = linePolygonStageStats[stage]
        ? linePolygonStageStats[stage].lines || 0
        : 0;
      const polygonCount = linePolygonStageStats[stage]
        ? linePolygonStageStats[stage].polygons || 0
        : 0;

      const totalCount = markerCount + lineCount + polygonCount;
      const stageColor = this.markerManager
        ? this.markerManager.getStageColor(stage)
        : "#3388ff";

      stageHTML += `
                    <div class="tmap-stage-item">
                        <input type="checkbox" id="toggleStage_${this.sanitizeId(
                          stage,
                        )}" 
                               class="tmap-stage-checkbox" checked data-stage="${stage}">
                        <div class="tmap-stage-info">
                            <span class="tmap-stage-color" style="background-color: ${stageColor};"></span>
                            <span class="tmap-stage-label">${stage}</span>
                            <span class="tmap-stage-count">${totalCount}个</span>
                        </div>
                    </div>
                    `;
    });

    stageList.innerHTML = stageHTML;

    // 绑定阶段控制事件
    this.bindStageControlEvents();
  }

  // 清理ID中的特殊字符
  sanitizeId(id) {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }

  // 更新统计显示
  updateStatsDisplay() {
    // 更新主统计面板
    const statMarkers = this.controlPanel.querySelector("#statMarkers");
    const statLines = this.controlPanel.querySelector("#statLines");
    const statPolygons = this.controlPanel.querySelector("#statPolygons");
    const statsFooter = this.controlPanel.querySelector("#statsFooter");

    if (statMarkers) {
      const count = this.markerManager
        ? this.markerManager.getMarkerCount()
        : 0;
      statMarkers.textContent = count;
    }

    if (statLines) {
      const stats = this.linePolygonManager
        ? this.linePolygonManager.getStats()
        : { lines: 0 };
      statLines.textContent = stats.lines;
    }

    if (statPolygons) {
      const stats = this.linePolygonManager
        ? this.linePolygonManager.getStats()
        : { polygons: 0 };
      statPolygons.textContent = stats.polygons;
    }

    if (statsFooter) {
      const allStages = Array.from(this.allStages);
      if (allStages.length > 0) {
        statsFooter.innerHTML = `阶段: ${allStages.join(
          ", ",
        )}<br>点击元素查看详情，鼠标悬停查看信息`;
      } else {
        statsFooter.textContent = "提示：点击元素查看详情，鼠标悬停查看信息";
      }
    }

    // 更新图层控制面板中的统计信息
    const markerCountInfo = this.controlPanel.querySelector("#markerCountInfo");
    const lineCountInfo = this.controlPanel.querySelector("#lineCountInfo");
    const polygonCountInfo =
      this.controlPanel.querySelector("#polygonCountInfo");

    if (markerCountInfo) {
      const count = this.markerManager
        ? this.markerManager.getMarkerCount()
        : 0;
      markerCountInfo.textContent = `${count}个`;
    }

    if (lineCountInfo) {
      const stats = this.linePolygonManager
        ? this.linePolygonManager.getStats()
        : { lines: 0 };
      lineCountInfo.textContent = `${stats.lines}条`;
    }

    if (polygonCountInfo) {
      const stats = this.linePolygonManager
        ? this.linePolygonManager.getStats()
        : { polygons: 0 };
      polygonCountInfo.textContent = `${stats.polygons}个`;
    }
  }

  addOverviewMap() {
    if (!this.map) return;

    try {
      if (this.overviewMap) {
        this.map.removeControl(this.overviewMap);
      }

      this.overviewMap = new T.Control.OverviewMap({
        isOpen: true,
        size: new T.Point(150, 150),
        anchor: T_ANCHOR_BOTTOM_RIGHT,
      });

      this.map.addControl(this.overviewMap);
    } catch (error) {
      console.error("添加鹰眼控件失败:", error);
    }
  }

  addMapTypeControl() {
    if (!this.map) return;

    try {
      if (this.mapTypeControl) {
        this.map.removeControl(this.mapTypeControl);
      }

      this.mapTypeControl = new T.Control.MapType({
        anchor: T_ANCHOR_TOP_RIGHT,
        offset: new T.Point(10, 10),
      });

      this.map.addControl(this.mapTypeControl);
    } catch (error) {
      console.error("添加地图类型控件失败:", error);
    }
  }

  removeOverviewMap() {
    if (this.overviewMap) {
      this.map.removeControl(this.overviewMap);
      this.overviewMap = null;
    }
  }

  removeMapTypeControl() {
    if (this.mapTypeControl) {
      this.map.removeControl(this.mapTypeControl);
      this.mapTypeControl = null;
    }
  }

  showTempMessage(message, duration = 1500) {
    const messageEl = document.createElement("div");
    messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 10000;
                font-size: 13px;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                font-family: 'Microsoft YaHei', sans-serif;
            `;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    setTimeout(() => {
      if (document.body.contains(messageEl)) {
        document.body.removeChild(messageEl);
      }
    }, duration);
  }

  // ============ 条件查询相关函数 ============

  /**
   * 刷新数据函数 - 可以公开调用
   * @param {Object} conditions - 查询条件对象（可选）
   */
  refreshData(conditions = null) {
    console.log(
      "开始刷新地图数据...",
      conditions ? "使用新条件" : "使用当前条件",
    );

    // 清除现有数据
    if (this.markerManager) {
      this.markerManager.clearAllMarkers();
    }
    if (this.linePolygonManager) {
      this.linePolygonManager.clearAll();
    }

    // 显示加载提示
    this.showTempMessage("正在重新加载数据...", 3000);

    // 重新加载服务器数据（可传入新的查询条件）
    this.loadServerData(conditions);

    // 更新统计信息
    setTimeout(() => {
      this.updateStatsDisplay();
    }, 1000);
  }

  /**
   * 设置查询条件并刷新
   * @param {Object} conditions - 查询条件对象
   */
  setQueryConditions(conditions) {
    if (!conditions || typeof conditions !== "object") {
      console.warn("查询条件必须是一个对象");
      return;
    }

    console.log("设置新的查询条件:", conditions);
    this.currentConditions = Object.assign({}, conditions);

    // 使用新条件刷新数据
    this.refreshData(conditions);
  }

  /**
   * 添加过滤条件并刷新
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   */
  addFilterCondition(field, value) {
    if (!field || value === undefined || value === null) {
      console.warn("过滤条件参数无效");
      return;
    }

    // 添加或更新条件
    this.currentConditions[field] = value;
    console.log(`添加过滤条件: ${field} = ${value}`);

    // 使用更新后的条件刷新数据
    this.refreshData(this.currentConditions);
  }

  /**
   * 移除过滤条件并刷新
   * @param {string} field - 要移除的字段名
   */
  removeFilterCondition(field) {
    if (this.currentConditions[field] !== undefined) {
      delete this.currentConditions[field];
      console.log(`移除过滤条件: ${field}`);

      // 使用更新后的条件刷新数据
      this.refreshData(this.currentConditions);
    }
  }

  /**
   * 清除所有查询条件并刷新
   */
  clearAllConditions() {
    this.currentConditions = {};
    console.log("清除所有查询条件");

    // 刷新数据（无条件的查询）
    this.refreshData({});
  }

  /**
   * 获取当前查询条件
   * @returns {Object} 当前查询条件对象
   */
  getCurrentConditions() {
    return Object.assign({}, this.currentConditions);
  }

  // 新增：根据项目编码定位到对应项目
  locateToProject(u_pro_no) {
    console.log(`尝试定位到项目: ${u_pro_no}`);

    // 首先在标记点中查找
    if (this.markerManager) {
      const markerResult = this.markerManager.findMarkerByProNo(u_pro_no);
      if (markerResult) {
        const { marker, info } = markerResult;
        const lnglat = marker.getLngLat();
        console.log(
          `在标记点中找到项目: ${u_pro_no}, 经纬度: ${lnglat.lng}, ${lnglat.lat}`,
        );

        // 定位到该标记点
        this.map.centerAndZoom(lnglat, 15);
        this.showTempMessage(
          `已定位到项目: ${info.originalData.u_pro_name || u_pro_no}`,
          3000,
        );
        return true;
      }
    }

    // 在线和面中查找
    if (this.linePolygonManager) {
      const elementResult =
        this.linePolygonManager.findElementByProNo(u_pro_no);
      if (elementResult) {
        const { type, element, info } = elementResult;
        console.log(
          `在${type === "line" ? "线条" : "多边形"}中找到项目: ${u_pro_no}`,
        );

        // 获取元素的中心点
        let centerLngLat = null;

        try {
          // 天地图API中获取几何对象坐标的方法
          if (type === "line") {
            // 对于线，获取折线点
            const latLngs = this.getPolylineCoordinates(element);
            if (latLngs && latLngs.length > 0) {
              centerLngLat = this.calculateCenterOfLatLngs(latLngs);
            }
          } else if (type === "polygon") {
            // 对于多边形，获取多边形点
            const latLngs = this.getPolygonCoordinates(element);
            if (latLngs && latLngs.length > 0) {
              centerLngLat = this.calculateCenterOfLatLngs(latLngs);
            }
          }
        } catch (error) {
          console.error("获取元素坐标时出错:", error);
        }

        if (centerLngLat) {
          // 定位到该中心点
          this.map.centerAndZoom(centerLngLat, 15);
          this.showTempMessage(
            `已定位到项目: ${info.originalData.u_pro_name || u_pro_no}`,
            3000,
          );
          return true;
        }
      }
    }

    console.log(`未找到项目: ${u_pro_no}`);
    this.showTempMessage(`未找到项目编码为 ${u_pro_no} 的项目`, 3000);
    return false;
  }

  // 获取折线坐标
  getPolylineCoordinates(polyline) {
    try {
      // 尝试从折线获取坐标
      const path = polyline.getPath && polyline.getPath();
      if (path && Array.isArray(path)) {
        return path;
      }

      // 如果getPath不可用，尝试从缓存中获取原始数据
      const lineInfo = this.linePolygonManager.lineInfoMap.get(polyline);
      if (
        lineInfo &&
        lineInfo.originalData &&
        lineInfo.originalData.coordinates
      ) {
        return this.parseCoordinatesString(lineInfo.originalData.coordinates);
      }

      return [];
    } catch (error) {
      console.error("获取折线坐标失败:", error);
      return [];
    }
  }

  // 获取多边形坐标
  getPolygonCoordinates(polygon) {
    try {
      // 尝试从多边形获取坐标
      const path = polygon.getPath && polygon.getPath();
      if (path && Array.isArray(path)) {
        return path;
      }

      // 如果getPath不可用，尝试从缓存中获取原始数据
      const polygonInfo = this.linePolygonManager.polygonInfoMap.get(polygon);
      if (
        polygonInfo &&
        polygonInfo.originalData &&
        polygonInfo.originalData.coordinates
      ) {
        return this.parseCoordinatesString(
          polygonInfo.originalData.coordinates,
        );
      }

      return [];
    } catch (error) {
      console.error("获取多边形坐标失败:", error);
      return [];
    }
  }

  // 解析坐标字符串为T.LngLat数组
  parseCoordinatesString(coordinateStr) {
    if (!coordinateStr || typeof coordinateStr !== "string") {
      return [];
    }

    const coordinates = [];
    const points = coordinateStr.split(";").filter((p) => p.trim());

    points.forEach((point) => {
      const cleanPoint = point.trim();
      if (cleanPoint) {
        const [lngStr, latStr] = cleanPoint.split(",");
        const lng = parseFloat(lngStr);
        const lat = parseFloat(latStr);

        if (!isNaN(lng) && !isNaN(lat)) {
          coordinates.push(new T.LngLat(lng, lat));
        }
      }
    });

    return coordinates;
  }

  // 计算坐标数组的中心点
  calculateCenterOfLatLngs(coordinates) {
    if (!coordinates || coordinates.length === 0) {
      return null;
    }

    let minLng = coordinates[0].lng;
    let maxLng = coordinates[0].lng;
    let minLat = coordinates[0].lat;
    let maxLat = coordinates[0].lat;

    for (let i = 1; i < coordinates.length; i++) {
      const coord = coordinates[i];
      if (coord.lng < minLng) minLng = coord.lng;
      if (coord.lng > maxLng) maxLng = coord.lng;
      if (coord.lat < minLat) minLat = coord.lat;
      if (coord.lat > maxLat) maxLat = coord.lat;
    }

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    return new T.LngLat(centerLng, centerLat);
  }
}
