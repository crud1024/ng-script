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
        
        /* ===== 鼠标悬停提示框 - 简洁版 ===== */
        .tmap-hover-tooltip {
            position: absolute;
            z-index: 2000;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid #e0e6ed;
            border-radius: 6px;
            padding: 10px 14px;
            min-width: 200px;
            max-width: 320px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
            font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            pointer-events: none;
            color: #333;
            transition: none;
        }

        /* ---- 标题 ---- */
        .tmap-hover-tooltip-title {
            font-weight: 700;
            font-size: 13px;
            color: #3388ff;
            border-bottom: 1px solid #eef2f7;
            padding-bottom: 5px;
            margin-bottom: 5px;
        }

        /* ---- 字段行 ---- */
        .tmap-hover-tooltip-line {
            display: flex;
            align-items: center;
            padding: 2px 0;
            gap: 4px;
            min-height: 22px;
        }

        .tmap-hover-line-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            opacity: 0.7;
        }

        .tmap-hover-line-icon svg {
            width: 14px;
            height: 14px;
        }

        .tmap-hover-line-label {
            font-size: 12px;
            color: #888;
            font-weight: 400;
            flex-shrink: 0;
            min-width: 32px;
        }

        .tmap-hover-line-value {
            font-size: 12px;
            color: #333;
            font-weight: 400;
            word-break: break-word;
            flex: 1;
        }

        .tmap-hover-value-highlight {
            color: #3388ff;
            font-weight: 600;
        }

        /* ---- 坐标行（在一行显示） ---- */
        .tmap-hover-coord-line {
            background: rgba(51, 136, 255, 0.06);
            border-radius: 4px;
            padding: 2px 6px;
            margin-top: 2px;
        }

        .tmap-hover-coord-value {
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #3388ff;
            flex-wrap: nowrap;
        }

        .tmap-coord-item {
            white-space: nowrap;
            font-weight: 500;
        }

        .tmap-coord-divider {
            color: #d0d9e8;
            font-weight: 300;
            margin: 0 2px;
        }

        /* ---- 统计行 ---- */
        .tmap-hover-stats-line {
            opacity: 0.6;
            margin-top: 2px;
            padding-top: 2px;
            border-top: 1px dashed #eee;
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
    this.originalMarkerData = [];
    this.hoverTooltip = null;
    this.visibleMarkers = [];
    this.stageVisibility = {};
    this.allStages = new Set();

    if (this.options.markerData && this.options.markerData.length > 0) {
      this.originalMarkerData = [...this.options.markerData];
      this.extractAllStages();
    }

    this.createHoverTooltip();
  }

  extractAllStages() {
    this.allStages.clear();
    this.originalMarkerData.forEach((marker) => {
      if (marker.u_pro_stage) {
        this.allStages.add(marker.u_pro_stage);
      }
    });

    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = true;
    });

    console.log("提取到项目阶段:", Array.from(this.allStages));
  }

  createHoverTooltip() {
    this.hoverTooltip = document.createElement("div");
    this.hoverTooltip.className = "tmap-hover-tooltip";
    this.hoverTooltip.style.display = "none";
    document.body.appendChild(this.hoverTooltip);
  }

  showHoverTooltip(content, x, y) {
    if (!this.hoverTooltip) return;

    this.hoverTooltip.innerHTML = content;
    this.hoverTooltip.style.display = "block";
    this.hoverTooltip.style.left = x + 10 + "px";
    this.hoverTooltip.style.top = y + 10 + "px";

    const rect = this.hoverTooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.hoverTooltip.style.left = x - rect.width - 10 + "px";
    }
    if (rect.bottom > window.innerHeight) {
      this.hoverTooltip.style.top = y - rect.height - 10 + "px";
    }
  }

  hideHoverTooltip() {
    if (this.hoverTooltip) {
      this.hoverTooltip.style.display = "none";
    }
  }

  createMarkersByStage(markerData = null) {
    if (!this.map) return;

    console.time("根据阶段过滤创建标记耗时");

    const dataToUse = markerData || this.options.markerData;
    this.clearAllMarkers();

    if (markerData) {
      this.originalMarkerData = [...markerData];
      this.extractAllStages();
    }

    const filteredData = dataToUse.filter((marker) => {
      if (!marker.u_pro_stage) return true;
      return this.stageVisibility[marker.u_pro_stage] !== false;
    });

    for (let i = 0; i < filteredData.length; i++) {
      const data = filteredData[i];

      if (!data.lng || !data.lat || isNaN(data.lng) || isNaN(data.lat)) {
        console.warn(`跳过无效标记数据: ${JSON.stringify(data)}`);
        continue;
      }

      const point = new T.LngLat(parseFloat(data.lng), parseFloat(data.lat));

      const marker = new T.Marker(point, {
        title: "",
        draggable: data.draggable || false,
      });

      const hoverTitle = this.buildMarkerHoverTitle(data);

      this.markerInfoMap.set(marker, {
        title: hoverTitle,
        index: i,
        originalData: data,
        u_pro_no: data.u_pro_no,
        u_pro_stage: data.u_pro_stage,
      });

      marker.addEventListener(
        "click",
        this.handleMarkerClick.bind(this, marker),
      );
      marker.addEventListener(
        "mouseover",
        this.handleMarkerMouseOver.bind(this, marker),
      );
      marker.addEventListener(
        "mouseout",
        this.handleMarkerMouseOut.bind(this, marker),
      );

      this.map.addOverLay(marker);
      this.currentMarkers.push(marker);
      this.visibleMarkers.push(marker);
    }

    console.timeEnd("根据阶段过滤创建标记耗时");
    console.log(`标记创建成功: ${this.currentMarkers.length}个标记（过滤后）`);

    this.updateStats();
  }

  setStageVisibility(stage, visible) {
    this.stageVisibility[stage] = visible;
    console.log(`设置阶段 "${stage}" 可见性为: ${visible}`);
    this.createMarkersByStage();
  }

  setAllStagesVisibility(visible) {
    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = visible;
    });
    console.log(`设置所有阶段可见性为: ${visible}`);
    this.createMarkersByStage();
  }

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

  // ---- 构建鼠标悬停提示HTML - 简洁版 ----
  buildMarkerHoverTitle(markerData) {
    const sections = [];

    // SVG图标集合（缩小尺寸）
    const icons = {
      id: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
      name: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      stage: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/><circle cx="12" cy="16" r="5"/><circle cx="12" cy="16" r="2"/><line x1="4" y1="22" x2="20" y2="22"/></svg>`,
      type: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      org: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      location: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      remark: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
      coords: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    };

    // 标题（纯文字）
    const typeMap = {
      point: "普通项目",
      line: "线性项目",
      polygon: "平面项目",
    };
    const type = markerData._hoverType || "point";
    const typeName = typeMap[type] || "项目信息";

    sections.push(`<div class="tmap-hover-tooltip-title">${typeName}</div>`);

    // 字段配置
    const fieldConfigs = [
      { key: "u_pro_no", icon: icons.id, label: "编码" },
      { key: "u_pro_name", icon: icons.name, label: "名称", highlight: true },
      { key: "u_pro_stage", icon: icons.stage, label: "阶段" },
      { key: "u_pro_type", icon: icons.type, label: "类型" },
      { key: "phid_org_name", icon: icons.org, label: "组织" },
      { key: "u_location", icon: icons.location, label: "位置" },
      { key: "u_remark", icon: icons.remark, label: "备注" },
    ];

    // 添加基本字段
    fieldConfigs.forEach(({ key, icon, label, highlight }) => {
      if (markerData[key]) {
        const highlightClass = highlight ? "tmap-hover-value-highlight" : "";
        sections.push(`
                    <div class="tmap-hover-tooltip-line">
                        <span class="tmap-hover-line-icon">${icon}</span>
                        <span class="tmap-hover-line-label">${label}:</span>
                        <span class="tmap-hover-line-value ${highlightClass}">${this.escapeHtml(markerData[key])}</span>
                    </div>
                `);
      }
    });

    // 添加经纬度（在一行显示）
    if (markerData.lng && markerData.lat) {
      const formattedLng = parseFloat(markerData.lng).toFixed(6);
      const formattedLat = parseFloat(markerData.lat).toFixed(6);
      sections.push(`
                <div class="tmap-hover-tooltip-line tmap-hover-coord-line">
                    <span class="tmap-hover-line-icon">${icons.coords}</span>
                    <span class="tmap-hover-line-label">坐标:</span>
                    <span class="tmap-hover-line-value tmap-hover-coord-value">
                        <span class="tmap-coord-item">经度 ${formattedLng}</span>
                        <span class="tmap-coord-divider">|</span>
                        <span class="tmap-coord-item">纬度 ${formattedLat}</span>
                    </span>
                </div>
            `);
    }

    // 添加坐标点数量（线和面专用）
    if ((type === "line" || type === "polygon") && markerData.coordinates) {
      const count = markerData.coordinates
        .split(";")
        .filter((p) => p.trim()).length;
      sections.push(`
                <div class="tmap-hover-tooltip-line tmap-hover-stats-line">
                    <span class="tmap-hover-line-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8a9baa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="#8a9baa"/></svg>
                    </span>
                    <span class="tmap-hover-line-label">坐标点数:</span>
                    <span class="tmap-hover-line-value" style="color:#8a9baa;font-family:monospace;">${count}</span>
                </div>
            `);
    }

    return sections.join("");
  }

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

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  handleMarkerMouseOver(marker, e) {
    const point = e.containerPoint;
    const info = this.markerInfoMap.get(marker);
    if (info && info.title) {
      this.showHoverTooltip(info.title, point.x, point.y);
    }
    if (info && typeof this.options.onMarkerMouseOver === "function") {
      this.options.onMarkerMouseOver({
        marker: marker,
        originalData: info.originalData,
      });
    }
  }

  handleMarkerMouseOut(marker, e) {
    this.hideHoverTooltip();
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

  clearAllMarkers() {
    console.time("清除标记耗时");

    if (this.currentMarkers.length > 0) {
      try {
        this.currentMarkers.forEach((marker) => {
          try {
            marker.removeEventListener("click", this.handleMarkerClick);
            marker.removeEventListener("mouseover", this.handleMarkerMouseOver);
            marker.removeEventListener("mouseout", this.handleMarkerMouseOut);
          } catch (e) {
            console.log("移除事件监听器时出错:", e);
          }
        });
        this.map.removeOverLays(this.currentMarkers);
      } catch (e) {
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

    this.updateStats();
  }

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

  hideMarkers() {
    this.clearAllMarkers();
  }

  getMarkerCount() {
    return this.currentMarkers.length;
  }

  getMarkerData() {
    return this.options.markerData;
  }

  updateMarkers(markerData) {
    this.options.markerData = markerData;
    this.originalMarkerData = [...markerData];
    this.extractAllStages();
    this.clearAllMarkers();
    setTimeout(() => {
      this.createMarkersByStage(markerData);
    }, 100);
  }

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

  updateStats() {}

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
    this.hoverTooltip = null;
    this.layerVisibility = {
      lines: true,
      polygons: true,
      markers: true,
    };
    this.stageVisibility = {};
    this.allStages = new Set();
    this.originalLineData = [...(options.lines || [])];
    this.originalPolygonData = [...(options.polygons || [])];

    this.extractAllStages();
    this.createHoverTooltip();

    if (this.options.lines && this.options.lines.length > 0) {
      this.createLinesByStage();
    }

    if (this.options.polygons && this.options.polygons.length > 0) {
      this.createPolygonsByStage();
    }
  }

  extractAllStages() {
    this.allStages.clear();

    this.originalLineData.forEach((line) => {
      if (line.u_pro_stage) {
        this.allStages.add(line.u_pro_stage);
      }
    });

    this.originalPolygonData.forEach((polygon) => {
      if (polygon.u_pro_stage) {
        this.allStages.add(polygon.u_pro_stage);
      }
    });

    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = true;
    });

    console.log("线和面管理器提取到项目阶段:", Array.from(this.allStages));
  }

  createHoverTooltip() {
    this.hoverTooltip = document.createElement("div");
    this.hoverTooltip.className = "tmap-hover-tooltip";
    this.hoverTooltip.style.display = "none";
    document.body.appendChild(this.hoverTooltip);
  }

  showHoverTooltip(content, x, y) {
    if (!this.hoverTooltip) return;

    this.hoverTooltip.innerHTML = content;
    this.hoverTooltip.style.display = "block";
    this.hoverTooltip.style.left = x + 10 + "px";
    this.hoverTooltip.style.top = y + 10 + "px";

    const rect = this.hoverTooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.hoverTooltip.style.left = x - rect.width - 10 + "px";
    }
    if (rect.bottom > window.innerHeight) {
      this.hoverTooltip.style.top = y - rect.height - 10 + "px";
    }
  }

  hideHoverTooltip() {
    if (this.hoverTooltip) {
      this.hoverTooltip.style.display = "none";
    }
  }

  createLinesByStage(lineData = null) {
    if (!this.map) return;

    const dataToUse = lineData || this.options.lines;

    if (!this.layerVisibility.lines) {
      if (lineData) {
        this.originalLineData = [...lineData];
        this.extractAllStages();
      }
      return;
    }

    this.clearAllLines();

    if (lineData) {
      this.originalLineData = [...lineData];
      this.extractAllStages();
    }

    const filteredData = dataToUse.filter((line) => {
      if (!line.u_pro_stage) return true;
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

      let color = line.lineColor || "#FF0000";
      if (color.startsWith("0X") || color.startsWith("0x")) {
        color = "#" + color.substring(2);
      }

      const width = parseInt(line.lineWidth) || 2;
      let opacity = 0.5;
      if (line.lineOpacity !== undefined) {
        opacity = parseInt(line.lineOpacity) / 100 || 0.5;
      }

      const polyline = new T.Polyline(coordinates, {
        strokeColor: color,
        strokeWeight: width,
        strokeOpacity: opacity,
        strokeStyle: line.lineStyle || "solid",
      });

      const hoverTitle = this.buildLineHoverTitle(line);

      this.lineInfoMap.set(polyline, {
        name: line.name || `线条${index + 1}`,
        phid_pc: line.phid_pc,
        title: hoverTitle,
        originalData: line,
        u_pro_no: line.u_pro_no,
        u_pro_stage: line.u_pro_stage,
      });

      polyline.addEventListener(
        "click",
        this.handleLineClick.bind(this, polyline),
      );
      polyline.addEventListener(
        "mouseover",
        this.handleLineMouseOver.bind(this, polyline),
      );
      polyline.addEventListener(
        "mouseout",
        this.handleLineMouseOut.bind(this, polyline),
      );

      this.map.addOverLay(polyline);
      this.currentLines.push(polyline);
    });

    console.log(`线条创建成功: ${this.currentLines.length}条线条（过滤后）`);
  }

  createPolygonsByStage(polygonData = null) {
    if (!this.map) return;

    const dataToUse = polygonData || this.options.polygons;

    if (!this.layerVisibility.polygons) {
      if (polygonData) {
        this.originalPolygonData = [...polygonData];
        this.extractAllStages();
      }
      return;
    }

    this.clearAllPolygons();

    if (polygonData) {
      this.originalPolygonData = [...polygonData];
      this.extractAllStages();
    }

    const filteredData = dataToUse.filter((polygon) => {
      if (!polygon.u_pro_stage) return true;
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

      let strokeColor = polygon.lineColor || "#0000FF";
      if (strokeColor.startsWith("0X") || strokeColor.startsWith("0x")) {
        strokeColor = "#" + strokeColor.substring(2);
      }

      let fillColor = polygon.fillColor || "#3388FF";
      if (fillColor.startsWith("0X") || fillColor.startsWith("0x")) {
        fillColor = "#" + fillColor.substring(2);
      }

      const strokeWeight = parseInt(polygon.lineWidth) || 1;
      let strokeOpacity = 1.0;
      if (polygon.lineOpacity !== undefined) {
        strokeOpacity = parseInt(polygon.lineOpacity) / 100 || 1.0;
      }

      let fillOpacity = 0.3;
      if (polygon.fillOpacity !== undefined) {
        fillOpacity = parseInt(polygon.fillOpacity) / 100 || 0.3;
      }

      const tPolygon = new T.Polygon(coordinates, {
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
        strokeOpacity: strokeOpacity,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
      });

      const hoverTitle = this.buildPolygonHoverTitle(polygon);

      this.polygonInfoMap.set(tPolygon, {
        name: polygon.name || `多边形${index + 1}`,
        phid_pc: polygon.phid_pc,
        title: hoverTitle,
        originalData: polygon,
        u_pro_no: polygon.u_pro_no,
        u_pro_stage: polygon.u_pro_stage,
      });

      tPolygon.addEventListener(
        "click",
        this.handlePolygonClick.bind(this, tPolygon),
      );
      tPolygon.addEventListener(
        "mouseover",
        this.handlePolygonMouseOver.bind(this, tPolygon),
      );
      tPolygon.addEventListener(
        "mouseout",
        this.handlePolygonMouseOut.bind(this, tPolygon),
      );

      this.map.addOverLay(tPolygon);
      this.currentPolygons.push(tPolygon);
    });

    console.log(
      `多边形创建成功: ${this.currentPolygons.length}个多边形（过滤后）`,
    );
  }

  setStageVisibility(stage, visible) {
    this.stageVisibility[stage] = visible;
    console.log(`线和面管理器设置阶段 "${stage}" 可见性为: ${visible}`);

    if (this.layerVisibility.lines) {
      this.createLinesByStage();
    }
    if (this.layerVisibility.polygons) {
      this.createPolygonsByStage();
    }
  }

  setAllStagesVisibility(visible) {
    this.allStages.forEach((stage) => {
      this.stageVisibility[stage] = visible;
    });
    console.log(`线和面管理器设置所有阶段可见性为: ${visible}`);

    if (this.layerVisibility.lines) {
      this.createLinesByStage();
    }
    if (this.layerVisibility.polygons) {
      this.createPolygonsByStage();
    }
  }

  getStageStats() {
    const stats = {};

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

  getStageColor(stage) {
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
    return stageColors[stage] || "#3388ff";
  }

  // ---- 构建线条悬停提示 - 简洁版 ----
  buildLineHoverTitle(lineData) {
    const sections = [];

    const icons = {
      id: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
      name: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      stage: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/><circle cx="12" cy="16" r="5"/><circle cx="12" cy="16" r="2"/><line x1="4" y1="22" x2="20" y2="22"/></svg>`,
      type: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      org: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      location: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      remark: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    };

    sections.push(`<div class="tmap-hover-tooltip-title">线性项目</div>`);

    const fieldConfigs = [
      { key: "u_pro_no", icon: icons.id, label: "编码" },
      { key: "u_pro_name", icon: icons.name, label: "名称", highlight: true },
      { key: "u_pro_stage", icon: icons.stage, label: "阶段" },
      { key: "u_pro_type", icon: icons.type, label: "类型" },
      { key: "phid_org_name", icon: icons.org, label: "组织" },
      { key: "u_location", icon: icons.location, label: "位置" },
      { key: "u_remark", icon: icons.remark, label: "备注" },
    ];

    fieldConfigs.forEach(({ key, icon, label, highlight }) => {
      const value = lineData[key] || (key === "u_pro_name" && lineData.name);
      if (value) {
        const highlightClass = highlight ? "tmap-hover-value-highlight" : "";
        sections.push(`
                    <div class="tmap-hover-tooltip-line">
                        <span class="tmap-hover-line-icon">${icon}</span>
                        <span class="tmap-hover-line-label">${label}:</span>
                        <span class="tmap-hover-line-value ${highlightClass}">${this.escapeHtml(value)}</span>
                    </div>
                `);
      }
    });

    if (lineData.coordinates) {
      const count = lineData.coordinates
        .split(";")
        .filter((p) => p.trim()).length;
      sections.push(`
                <div class="tmap-hover-tooltip-line tmap-hover-stats-line">
                    <span class="tmap-hover-line-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8a9baa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="#8a9baa"/></svg>
                    </span>
                    <span class="tmap-hover-line-label">坐标点数:</span>
                    <span class="tmap-hover-line-value" style="color:#8a9baa;font-family:monospace;">${count}</span>
                </div>
            `);
    }

    return sections.join("");
  }

  // ---- 构建多边形悬停提示 - 简洁版 ----
  buildPolygonHoverTitle(polygonData) {
    const sections = [];

    const icons = {
      id: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
      name: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      stage: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/><circle cx="12" cy="16" r="5"/><circle cx="12" cy="16" r="2"/><line x1="4" y1="22" x2="20" y2="22"/></svg>`,
      type: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      org: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      location: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      remark: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    };

    sections.push(`<div class="tmap-hover-tooltip-title">平面项目</div>`);

    const fieldConfigs = [
      { key: "u_pro_no", icon: icons.id, label: "编码" },
      { key: "u_pro_name", icon: icons.name, label: "名称", highlight: true },
      { key: "u_pro_stage", icon: icons.stage, label: "阶段" },
      { key: "u_pro_type", icon: icons.type, label: "类型" },
      { key: "phid_org_name", icon: icons.org, label: "组织" },
      { key: "u_location", icon: icons.location, label: "位置" },
      { key: "u_remark", icon: icons.remark, label: "备注" },
    ];

    fieldConfigs.forEach(({ key, icon, label, highlight }) => {
      const value =
        polygonData[key] || (key === "u_pro_name" && polygonData.name);
      if (value) {
        const highlightClass = highlight ? "tmap-hover-value-highlight" : "";
        sections.push(`
                    <div class="tmap-hover-tooltip-line">
                        <span class="tmap-hover-line-icon">${icon}</span>
                        <span class="tmap-hover-line-label">${label}:</span>
                        <span class="tmap-hover-line-value ${highlightClass}">${this.escapeHtml(value)}</span>
                    </div>
                `);
      }
    });

    if (polygonData.coordinates) {
      const count = polygonData.coordinates
        .split(";")
        .filter((p) => p.trim()).length;
      sections.push(`
                <div class="tmap-hover-tooltip-line tmap-hover-stats-line">
                    <span class="tmap-hover-line-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8a9baa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="#8a9baa"/></svg>
                    </span>
                    <span class="tmap-hover-line-label">坐标点数:</span>
                    <span class="tmap-hover-line-value" style="color:#8a9baa;font-family:monospace;">${count}</span>
                </div>
            `);
    }

    return sections.join("");
  }

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

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

  handleLineMouseOver(line, e) {
    const info = this.lineInfoMap.get(line);
    const point = e.containerPoint;

    if (info && info.title) {
      this.showHoverTooltip(info.title, point.x, point.y);
    }

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

  handleLineMouseOut(line, e) {
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

  handlePolygonMouseOver(polygon, e) {
    const info = this.polygonInfoMap.get(polygon);
    const point = e.containerPoint;

    if (info && info.title) {
      this.showHoverTooltip(info.title, point.x, point.y);
    }

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

  handlePolygonMouseOut(polygon, e) {
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

  clearAll() {
    this.clearAllLines();
    this.clearAllPolygons();
    this.hideHoverTooltip();
  }

  updateLines(lineData) {
    this.options.lines = lineData;
    this.createLinesByStage(lineData);
  }

  updatePolygons(polygonData) {
    this.options.polygons = polygonData;
    this.createPolygonsByStage(polygonData);
  }

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

  findElementByProNo(u_pro_no) {
    for (let [line, info] of this.lineInfoMap) {
      if (info.u_pro_no === u_pro_no) {
        return {
          type: "line",
          element: line,
          info: info,
        };
      }
    }

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

  getStats() {
    return {
      lines: this.currentLines.length,
      polygons: this.currentPolygons.length,
      lineVisibility: this.layerVisibility.lines,
      polygonVisibility: this.layerVisibility.polygons,
    };
  }

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
        queryConditions: {},
      },
      options,
    );

    this.map = null;
    this.loader = new TMapLoader(options.tk);
    this.overviewMap = null;
    this.mapTypeControl = null;
    this.markerManager = null;
    this.linePolygonManager = null;
    this.searchControl = null;
    this.searchResults = null;
    this.localSearch = null;

    this.controlStates = {
      overviewMap: this.options.enableOverviewMap,
      mapTypeControl: this.options.enableMapTypeControl,
      mainPanelCollapsed: true,
      mapControlsCollapsed: true,
      layerControlsCollapsed: true,
      stageControlsCollapsed: true,
    };

    this.currentConditions = Object.assign({}, this.options.queryConditions);
    this.allStages = new Set();
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

        this.createIntegratedControlPanel();
        this.createTopSearchControl();
        this.loadServerData(this.currentConditions);

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

  createTopSearchControl() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.searchControl = document.createElement("div");
    this.searchControl.className = "tmap-top-search-control";

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

    this.initLocalSearch();
    this.bindSearchEvents();
  }

  initLocalSearch() {
    const config = {
      pageCapacity: 10,
      onSearchComplete: (result) => {
        this.handleSearchResult(result);
      },
    };
    this.localSearch = new T.LocalSearch(this.map, config);
  }

  bindSearchEvents() {
    const searchInput = this.searchControl.querySelector("#searchInput");
    const searchButton = this.searchControl.querySelector("#searchButton");
    this.searchResults = this.searchControl.querySelector("#searchResults");

    searchButton.addEventListener("click", () => {
      this.performSearch(searchInput.value);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch(searchInput.value);
      }
    });

    searchInput.addEventListener("focus", () => {
      if (this.searchResults.children.length > 0) {
        this.searchResults.classList.add("show");
      }
    });

    document.addEventListener("click", (e) => {
      if (!this.searchControl.contains(e.target)) {
        this.searchResults.classList.remove("show");
      }
    });
  }

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
      case 1:
        const pois = result.getPois();
        if (pois && pois.length > 0) {
          this.showSearchResults(pois);
          hasResults = true;
        }
        break;
      case 3:
        const area = result.getArea();
        if (area) {
          this.showAreaResults(area);
          hasResults = true;
        }
        break;
      case 4:
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

  showSearchResults(pois) {
    const zoomArr = [];

    pois.forEach((poi) => {
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
                <div class="result-address">${address || "暂无地址信息"}</div>
            `;

      resultItem.addEventListener("click", () => {
        if (lnglatArr.length === 2) {
          const lng = parseFloat(lnglatArr[0]);
          const lat = parseFloat(lnglatArr[1]);

          if (!isNaN(lng) && !isNaN(lat)) {
            const lnglat = new T.LngLat(lng, lat);
            this.map.centerAndZoom(lnglat, 15);
            this.searchResults.classList.remove("show");

            if (this.markerManager) {
              this.markerManager.clearAllMarkers();
            }

            const marker = new T.Marker(lnglat, {
              title: name,
            });
            this.map.addOverLay(marker);

            const infoContent = `
                            <div style="padding: 10px; max-width: 200px;">
                                <div style="font-weight: bold; margin-bottom: 5px;">${name}</div>
                                <div style="font-size: 12px; color: #666;">${address || "暂无地址信息"}</div>
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

    if (zoomArr.length > 0) {
      this.map.setViewport(zoomArr);
    }
  }

  showAreaResults(area) {
    const resultItem = document.createElement("div");
    resultItem.className = "search-result-item";
    resultItem.innerHTML = `<div class="result-title">${area.name || "区域"}</div>`;

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

  createIntegratedControlPanel() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.controlPanel = document.createElement("div");
    this.controlPanel.className = "tmap-main-control";
    this.controlPanel.style.width = "320px";

    if (this.controlStates.mainPanelCollapsed) {
      this.controlPanel.classList.add("collapsed");
    }

    const mapIconSVG = ``;
    const panelHTML = `
            <!-- 面板头部 -->
            <div class="tmap-main-control-header">
                <div class="tmap-main-control-title">
                    <span class="tmap-main-control-icon">${mapIconSVG}</span>
                    <span>地图控制面板</span>
                </div>
                <div class="tmap-main-control-toggle">${this.controlStates.mainPanelCollapsed ? "+" : "-"}</div>
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
                
                <!-- 地图控制组 -->
                <div class="tmap-control-group ${this.controlStates.mapControlsCollapsed ? "collapsed" : ""}" id="mapControlsGroup">
                    <div class="tmap-control-group-header">
                        <div class="tmap-control-group-title">
                            <span class="tmap-control-group-icon"></span>
                            <span>地图控制</span>
                        </div>
                        <div class="tmap-control-group-toggle ${this.controlStates.mapControlsCollapsed ? "collapsed" : ""}">${this.controlStates.mapControlsCollapsed ? "▶" : "▼"}</div>
                    </div>
                    <div class="tmap-control-group-content">
                        <div class="tmap-map-controls">
                            <div class="tmap-control-item">
                                <input type="checkbox" id="toggleOverview" class="tmap-control-checkbox" ${this.controlStates.overviewMap ? "checked" : ""}>
                                <label for="toggleOverview" class="tmap-control-label">鹰眼控件</label>
                            </div>
                            <div class="tmap-control-item">
                                <input type="checkbox" id="toggleMapType" class="tmap-control-checkbox" ${this.controlStates.mapTypeControl ? "checked" : ""}>
                                <label for="toggleMapType" class="tmap-control-label">地图类型控件</label>
                            </div>
                            <div class="tmap-control-buttons">
                                <button id="clearAll" class="tmap-control-button">清除全部</button>
                                <button id="reloadData" class="tmap-control-button">重新加载</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 图层控制组 -->
                <div class="tmap-control-group ${this.controlStates.layerControlsCollapsed ? "collapsed" : ""}" id="layerControlsGroup">
                    <div class="tmap-control-group-header">
                        <div class="tmap-control-group-title">
                            <span class="tmap-control-group-icon"></span>
                            <span>图层控制</span>
                        </div>
                        <div class="tmap-control-group-toggle ${this.controlStates.layerControlsCollapsed ? "collapsed" : ""}">${this.controlStates.layerControlsCollapsed ? "▶" : "▼"}</div>
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
                
                <!-- 项目阶段控制组 -->
                <div class="tmap-control-group ${this.controlStates.stageControlsCollapsed ? "collapsed" : ""}" id="stageControlsGroup">
                    <div class="tmap-control-group-header">
                        <div class="tmap-control-group-title">
                            <span class="tmap-control-group-icon"></span>
                            <span>项目阶段</span>
                        </div>
                        <div class="tmap-control-group-toggle ${this.controlStates.stageControlsCollapsed ? "collapsed" : ""}">${this.controlStates.stageControlsCollapsed ? "▶" : "▼"}</div>
                    </div>
                    <div class="tmap-control-group-content">
                        <div class="tmap-stage-controls" id="stageControls">
                            <div class="tmap-stage-all">
                                <input type="checkbox" id="toggleAllStages" class="tmap-stage-checkbox" checked>
                                <div class="tmap-stage-info">
                                    <span class="tmap-stage-label" style="font-weight: 500;">全部阶段</span>
                                </div>
                            </div>
                            <div id="stageList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    this.controlPanel.innerHTML = panelHTML;
    container.appendChild(this.controlPanel);

    setTimeout(() => {
      this.bindControlPanelEvents();
      this.updateStatsDisplay();
    }, 300);
  }

  bindControlPanelEvents() {
    if (!this.controlPanel) return;

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

      if (this.controlStates.mainPanelCollapsed) {
        mainToggle.textContent = "+";
      } else {
        mainToggle.textContent = "-";
      }
    });

    this.bindControlGroupEvents("mapControlsGroup", "mapControlsCollapsed");
    this.bindControlGroupEvents("layerControlsGroup", "layerControlsCollapsed");
    this.bindControlGroupEvents("stageControlsGroup", "stageControlsCollapsed");

    this.bindControlEvents();
    this.bindLayerControlEvents();
  }

  bindControlGroupEvents(groupId, stateKey) {
    const group = this.controlPanel.querySelector(`#${groupId}`);
    if (!group) return;

    const header = group.querySelector(".tmap-control-group-header");
    const toggle = group.querySelector(".tmap-control-group-toggle");

    header.addEventListener("click", () => {
      this.controlStates[stateKey] = !this.controlStates[stateKey];
      group.classList.toggle("collapsed", this.controlStates[stateKey]);
      toggle.classList.toggle("collapsed", this.controlStates[stateKey]);

      if (this.controlStates[stateKey]) {
        toggle.textContent = "▶";
      } else {
        toggle.textContent = "▼";
      }
    });
  }

  bindControlEvents() {
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
          this.loadServerData(this.currentConditions);
          setTimeout(() => {
            this.updateStatsDisplay();
            this.showTempMessage("所有数据已重新加载");
          }, 1500);
        }, 500);
      });
    }
  }

  bindLayerControlEvents() {
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

  bindStageControlEvents() {
    const toggleAll = this.controlPanel.querySelector("#toggleAllStages");
    if (toggleAll) {
      toggleAll.addEventListener("change", (e) => {
        const visible = e.target.checked;

        if (this.markerManager) {
          this.markerManager.setAllStagesVisibility(visible);
        }

        if (this.linePolygonManager) {
          this.linePolygonManager.setAllStagesVisibility(visible);
        }

        const stageCheckboxes =
          this.controlPanel.querySelectorAll("input[data-stage]");
        stageCheckboxes.forEach((checkbox) => {
          checkbox.checked = visible;
        });

        this.showTempMessage(visible ? "已显示所有阶段" : "已隐藏所有阶段");
        this.updateStatsDisplay();
      });
    }

    const stageCheckboxes =
      this.controlPanel.querySelectorAll("input[data-stage]");
    stageCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const stage = e.target.getAttribute("data-stage");
        const visible = e.target.checked;

        if (this.markerManager) {
          this.markerManager.setStageVisibility(stage, visible);
        }

        if (this.linePolygonManager) {
          this.linePolygonManager.setStageVisibility(stage, visible);
        }

        this.updateToggleAllCheckbox();
        this.showTempMessage(`${visible ? "显示" : "隐藏"}阶段: ${stage}`);
        this.updateStatsDisplay();
      });
    });
  }

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

  loadServerData(conditions = null) {
    console.log("开始从服务器加载数据...");

    const queryConditions = conditions || this.currentConditions;

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

          this.processServerData(data);

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

  processServerData(serverData) {
    const markerData = [];
    const lineData = [];
    const polygonData = [];

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

      if (u_pro_stage) {
        this.allStages.add(u_pro_stage);
      }

      const markType = parseInt(u_marks) || 0;

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
        case 0:
          this.processPointData(markerData, extendObjects);
          break;
        case 1:
          this.processLineData(lineData, baseData, u_json);
          break;
        case 2:
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

    this.createMarkerManager(markerData);
    this.createLinePolygonManager(lineData, polygonData);
    this.updateStatsDisplay();
  }

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

  processLineData(lineData, baseData, u_json) {
    try {
      const jsonData = u_json ? JSON.parse(u_json) : null;
      let coordinates = "";
      let lineColor = "#FF0000";
      let lineWidth = 2;
      let lineOpacity = 50;
      let name = baseData.u_pro_name || "未命名线";

      if (jsonData && jsonData.ObjItems && jsonData.ObjItems.length > 0) {
        const objItem = jsonData.ObjItems[0];
        const objDetail = objItem.Object.ObjectDetail;

        if (objItem.Object.Name) {
          name = objItem.Object.Name;
        }

        if (objDetail.TrackDraw) {
          const trackDraw = objDetail.TrackDraw;
          lineWidth = trackDraw.LineWidth || 2;
          lineOpacity = trackDraw.LineAlpha || 50;
          const argbColor = trackDraw.LineClr || 4211015680;
          lineColor = this.argbToHex(argbColor);
        }

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
    } catch (error) {
      console.error("处理线条数据失败:", error, baseData);
    }
  }

  processPolygonData(polygonData, baseData, u_json) {
    try {
      const jsonData = u_json ? JSON.parse(u_json) : null;
      let coordinates = "";
      let lineColor = "#0000FF";
      let fillColor = "#3388FF";
      let lineWidth = 1;
      let lineOpacity = 50;
      let fillOpacity = 30;
      let name = baseData.u_pro_name || "未命名面";

      if (jsonData && jsonData.ObjItems && jsonData.ObjItems.length > 0) {
        const objItem = jsonData.ObjItems[0];
        const objDetail = objItem.Object.ObjectDetail;

        if (objItem.Object.Name) {
          name = objItem.Object.Name;
        }

        lineWidth = objDetail.LineWidth || 1;
        lineOpacity = objDetail.LineAlpha || 50;
        fillOpacity = objDetail.AreaAlpha || 30;

        if (objDetail.LineClr) {
          lineColor = this.argbToHex(objDetail.LineClr);
        }
        if (objDetail.AreaClr) {
          fillColor = this.argbToHex(objDetail.AreaClr);
        }

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
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        ...baseData,
      };

      polygonData.push(polygon);
    } catch (error) {
      console.error("处理多边形数据失败:", error, baseData);
    }
  }

  argbToHex(argb) {
    const a = ((argb >> 24) & 0xff).toString(16).padStart(2, "0");
    const r = ((argb >> 16) & 0xff).toString(16).padStart(2, "0");
    const g = ((argb >> 8) & 0xff).toString(16).padStart(2, "0");
    const b = (argb & 0xff).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  createMarkerManager(markerData) {
    if (!this.map) return;

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
      onMarkerMouseOver: (data) => {},
      onMarkerMouseOut: (data) => {},
    });

    setTimeout(() => {
      this.markerManager.createMarkersByStage();
      this.updateStatsDisplay();
      if (markerData.length > 0) {
        this.showTempMessage(`已加载 ${markerData.length} 个普通项目`, 2000);
      }
    }, 500);
  }

  createLinePolygonManager(lineData, polygonData) {
    if (!this.map) return;

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
      onLineMouseOver: (data) => {},
      onPolygonMouseOver: (data) => {},
      onLineMouseOut: (data) => {},
      onPolygonMouseOut: (data) => {},
    });

    console.log(
      `线和面管理器已创建: ${lineData.length}条线, ${polygonData.length}个面`,
    );
    this.updateStatsDisplay();
  }

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

  buildProjectUrl(phid_pc, authDataValue) {
    return `https://ynnterp-mproject.cnyeig.com/PMS/PC/ProjectTable/ProjectTableEdit?AppTitle=%E9%A1%B9%E7%9B%AE%E4%BF%A1%E6%81%AF-%E6%9F%A5%E7%9C%8B&otype=view&mtype=&id=${phid_pc}&phidratepay=0&projprop=3&Authorization=${authDataValue}`;
  }

  updateStageControlPanel() {
    const stageList = this.controlPanel.querySelector("#stageList");
    if (!stageList) return;

    const markerStageStats = this.markerManager
      ? this.markerManager.getStageStats()
      : {};
    const linePolygonStageStats = this.linePolygonManager
      ? this.linePolygonManager.getStageStats()
      : {};

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
                    <input type="checkbox" id="toggleStage_${this.sanitizeId(stage)}" 
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
    this.bindStageControlEvents();
  }

  sanitizeId(id) {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }

  updateStatsDisplay() {
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
        statsFooter.innerHTML = `阶段: ${allStages.join(", ")}<br>点击元素查看详情，鼠标悬停查看信息`;
      } else {
        statsFooter.textContent = "提示：点击元素查看详情，鼠标悬停查看信息";
      }
    }

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

  refreshData(conditions = null) {
    console.log(
      "开始刷新地图数据...",
      conditions ? "使用新条件" : "使用当前条件",
    );

    if (this.markerManager) {
      this.markerManager.clearAllMarkers();
    }
    if (this.linePolygonManager) {
      this.linePolygonManager.clearAll();
    }

    this.showTempMessage("正在重新加载数据...", 3000);
    this.loadServerData(conditions);

    setTimeout(() => {
      this.updateStatsDisplay();
    }, 1000);
  }

  setQueryConditions(conditions) {
    if (!conditions || typeof conditions !== "object") {
      console.warn("查询条件必须是一个对象");
      return;
    }

    console.log("设置新的查询条件:", conditions);
    this.currentConditions = Object.assign({}, conditions);
    this.refreshData(conditions);
  }

  addFilterCondition(field, value) {
    if (!field || value === undefined || value === null) {
      console.warn("过滤条件参数无效");
      return;
    }

    this.currentConditions[field] = value;
    console.log(`添加过滤条件: ${field} = ${value}`);
    this.refreshData(this.currentConditions);
  }

  removeFilterCondition(field) {
    if (this.currentConditions[field] !== undefined) {
      delete this.currentConditions[field];
      console.log(`移除过滤条件: ${field}`);
      this.refreshData(this.currentConditions);
    }
  }

  clearAllConditions() {
    this.currentConditions = {};
    console.log("清除所有查询条件");
    this.refreshData({});
  }

  getCurrentConditions() {
    return Object.assign({}, this.currentConditions);
  }

  locateToProject(u_pro_no) {
    console.log(`尝试定位到项目: ${u_pro_no}`);

    if (this.markerManager) {
      const markerResult = this.markerManager.findMarkerByProNo(u_pro_no);
      if (markerResult) {
        const { marker, info } = markerResult;
        const lnglat = marker.getLngLat();
        this.map.centerAndZoom(lnglat, 15);
        this.showTempMessage(
          `已定位到项目: ${info.originalData.u_pro_name || u_pro_no}`,
          3000,
        );
        return true;
      }
    }

    if (this.linePolygonManager) {
      const elementResult =
        this.linePolygonManager.findElementByProNo(u_pro_no);
      if (elementResult) {
        const { type, element, info } = elementResult;
        let centerLngLat = null;

        try {
          if (type === "line") {
            const latLngs = this.getPolylineCoordinates(element);
            if (latLngs && latLngs.length > 0) {
              centerLngLat = this.calculateCenterOfLatLngs(latLngs);
            }
          } else if (type === "polygon") {
            const latLngs = this.getPolygonCoordinates(element);
            if (latLngs && latLngs.length > 0) {
              centerLngLat = this.calculateCenterOfLatLngs(latLngs);
            }
          }
        } catch (error) {
          console.error("获取元素坐标时出错:", error);
        }

        if (centerLngLat) {
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

  getPolylineCoordinates(polyline) {
    try {
      const path = polyline.getPath && polyline.getPath();
      if (path && Array.isArray(path)) {
        return path;
      }

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

  getPolygonCoordinates(polygon) {
    try {
      const path = polygon.getPath && polygon.getPath();
      if (path && Array.isArray(path)) {
        return path;
      }

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
