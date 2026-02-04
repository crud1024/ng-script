/**
 * 批量PDF转PNG转换器 - 支持文件夹结构和压缩下载
 * 版本：V3.1
 * 功能：批量处理PDF文件，按明细分文件夹，最后压缩成ZIP下载
 * 优化：解决水印重叠问题，添加自定义进度条，限制水印文字长度
 */
class BatchPDFToPNGConverter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {Array} options.dataList 数据列表
   * @param {string} options.watermark 水印文字（可选）
   * @param {Object} options.watermarkOptions 水印配置
   * @param {string} options.baseUrl 基础URL
   * @param {string} options.parentFolderName 一级文件夹名
   * @param {number} options.scale 图片缩放比例
   * @param {boolean} options.showProgress 是否显示进度条
   * @param {boolean} options.showNotifications 是否显示通知消息
   */
  constructor(options = {}) {
    this.options = {
      dataList: options.dataList || [],
      watermark: options.watermark || "", // 水印文字
      watermarkOptions: {
        fontSize: options.watermarkOptions?.fontSize || 32,
        color: options.watermarkOptions?.color || "rgba(180, 180, 180, 0.6)",
        angle: options.watermarkOptions?.angle || -30,
        xSpacing: options.watermarkOptions?.xSpacing || 300, // 增加间距避免重叠
        ySpacing: options.watermarkOptions?.ySpacing || 200, // 增加间距避免重叠
        offsetX: options.watermarkOptions?.offsetX || 0,
        offsetY: options.watermarkOptions?.offsetY || 0,
        maxCharsPerLine: options.watermarkOptions?.maxCharsPerLine || 25, // 新增：每行最多字符数
        lineHeight: options.watermarkOptions?.lineHeight || 1.5, // 新增：行高倍数
        ...options.watermarkOptions,
      },
      baseUrl: options.baseUrl || window.location.origin,
      parentFolderName: options.parentFolderName || "资质证书",
      scale: options.scale || 2.0,
      showProgress: options.showProgress !== false, // 默认显示进度条
      showNotifications: options.showNotifications !== false, // 默认显示通知
      ...options,
    };

    // 状态变量
    this.pdfLibLoaded = false;
    this.jsZipLoaded = false;
    this.currentIndex = 0;
    this.successCount = 0;
    this.failCount = 0;
    this.totalImages = 0;
    this.processedImages = 0;
    this.zip = null;
    this.startTime = null;
    this.isInitializing = false;
    this.isProcessing = false;
    this.isCancelled = false;

    // 文件处理统计
    this.fileStats = {
      totalFiles: 0,
      processedFiles: 0,
      totalPages: 0,
      processedPages: 0,
    };

    // 错误记录
    this.errors = [];

    // 进度条元素
    this.progressContainer = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;

    // 延迟开始处理，确保构造函数完全执行
    if (this.options.dataList && this.options.dataList.length > 0) {
      // 使用setTimeout确保构造函数完成后再开始初始化
      setTimeout(() => {
        this.initializeAndStart();
      }, 0);
    }
  }

  /**
   * 初始化和开始处理
   */
  async initializeAndStart() {
    if (this.isInitializing || this.isProcessing) {
      console.warn("转换器已经在运行中");
      return;
    }

    this.isInitializing = true;

    try {
      this.startTime = new Date();

      // 创建进度条
      if (this.options.showProgress) {
        this.createProgressBar();
      }

      this.showInitialMessage();

      // 检查数据
      if (!this.options.dataList.length) {
        throw new Error("未选择任何单据");
      }

      // 显示水印信息
      if (this.options.watermark) {
        console.log(`将添加水印: "${this.options.watermark}"`);
        this.updateStatus(`将添加水印: "${this.options.watermark}"`);
      } else {
        console.log("不添加水印");
        this.updateStatus("不添加水印");
      }

      // 显示初始进度
      this.updateProgress(0, `开始处理 ${this.options.dataList.length} 个单据`);

      // 加载必要的库
      await this.loadRequiredLibraries();

      // 只有确保JSZip加载完成后才创建实例
      if (!window.JSZip) {
        throw new Error("JSZip库未正确加载");
      }

      // 初始化JSZip实例
      this.zip = new JSZip();
      console.log("JSZip实例创建成功");

      // 标记为正在处理
      this.isProcessing = true;
      this.isInitializing = false;

      // 依次处理每个单据
      for (let i = 0; i < this.options.dataList.length; i++) {
        // 检查是否已取消
        if (this.isCancelled) {
          console.log("处理已被取消");
          this.updateStatus("处理已被取消");
          break;
        }

        this.currentIndex = i;
        await this.processSingleDocument(this.options.dataList[i], i);

        // 更新进度
        const progress = Math.round(
          ((i + 1) / this.options.dataList.length) * 50,
        );
        this.updateProgress(
          progress,
          `正在处理单据 ${i + 1}/${this.options.dataList.length}`,
        );
      }

      // 检查是否已取消
      if (!this.isCancelled) {
        // 生成并下载ZIP文件
        await this.generateAndDownloadZip();

        // 显示最终结果
        this.showFinalResult();
      } else {
        this.updateProgress(0, "处理已被取消");
      }
    } catch (error) {
      console.error("批量转换失败:", error);
      this.showError(error.message);
    } finally {
      this.isProcessing = false;
      this.isInitializing = false;

      // 处理完成后移除进度条
      setTimeout(() => {
        this.removeProgressBar();
      }, 3000);
    }
  }

  /**
   * 创建进度条元素
   */
  createProgressBar() {
    // 如果已存在则移除
    if (this.progressContainer) {
      this.removeProgressBar();
    }

    // 创建容器
    this.progressContainer = document.createElement("div");
    this.progressContainer.className = "batch-pdf-converter-progress";
    this.progressContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            overflow: hidden;
        `;

    // 标题栏
    const header = document.createElement("div");
    header.style.cssText = `
    background: #1890ff;
    color: white;
    padding: 12px 20px;
    font-weight: 500;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;
    header.innerHTML = `
            <span>证书下载进度</span>
            <button id="batch-pdf-close" style="background:none; border:none; color:white; cursor:pointer; font-size:16px;">×</button>
        `;

    // 内容区域
    const content = document.createElement("div");
    content.style.cssText = `
            padding: 16px;
        `;

    // 进度条
    const progressWrapper = document.createElement("div");
    progressWrapper.style.cssText = `
            margin-bottom: 12px;
        `;

    const progressBarBg = document.createElement("div");
    progressBarBg.style.cssText = `
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        `;

    this.progressBar = document.createElement("div");
    this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            border-radius: 4px;
            transition: width 0.3s ease;
        `;

    this.progressText = document.createElement("div");
    this.progressText.style.cssText = `
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-bottom: 4px;
        `;

    this.statusText = document.createElement("div");
    this.statusText.style.cssText = `
            font-size: 12px;
            color: #333;
            height: 36px;
            overflow: hidden;
            line-height: 1.4;
        `;

    // 组装
    progressBarBg.appendChild(this.progressBar);
    progressWrapper.appendChild(this.progressText);
    progressWrapper.appendChild(progressBarBg);
    progressWrapper.appendChild(this.statusText);
    content.appendChild(progressWrapper);
    this.progressContainer.appendChild(header);
    this.progressContainer.appendChild(content);

    // 添加到页面
    document.body.appendChild(this.progressContainer);

    // 添加关闭按钮事件
    const closeBtn = this.progressContainer.querySelector("#batch-pdf-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.removeProgressBar();
      });
    }
  }

  /**
   * 移除进度条
   */
  removeProgressBar() {
    if (this.progressContainer && this.progressContainer.parentNode) {
      this.progressContainer.parentNode.removeChild(this.progressContainer);
      this.progressContainer = null;
      this.progressBar = null;
      this.progressText = null;
      this.statusText = null;
    }
  }

  /**
   * 显示初始消息
   */
  showInitialMessage() {
    const watermarkText = this.options.watermark
      ? `，将添加水印："${this.options.watermark}"`
      : "，无水印";
    const message = `开始批量处理 ${this.options.dataList.length} 个单据，一级文件夹：${this.options.parentFolderName}${watermarkText}`;
    console.log(message);
    if (
      this.options.showNotifications &&
      typeof $NG !== "undefined" &&
      $NG.message
    ) {
      $NG.message(message, "info");
    }
  }

  /**
   * 加载必要的库
   */
  async loadRequiredLibraries() {
    try {
      // 先检查是否已加载
      const librariesLoaded = await this.checkLibrariesLoaded();

      if (!librariesLoaded.pdfjs) {
        await this.loadPDFJS();
      }

      if (!librariesLoaded.jszip) {
        await this.loadJSZip();
      }

      console.log("所有必要库已加载完成");
    } catch (error) {
      throw new Error(`库加载失败: ${error.message}`);
    }
  }

  /**
   * 检查库是否已加载
   */
  async checkLibrariesLoaded() {
    return {
      pdfjs: !!(window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions),
      jszip: !!window.JSZip,
    };
  }

  /**
   * 加载PDF.js库
   */
  async loadPDFJS() {
    return new Promise((resolve, reject) => {
      // 检查是否已在加载中
      if (document.querySelector('script[src*="pdf.min.js"]')) {
        // 等待加载完成
        const checkInterval = setInterval(() => {
          if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
            clearInterval(checkInterval);
            this.pdfLibLoaded = true;
            console.log("PDF.js库已加载完成");
            resolve();
          }
        }, 100);

        // 设置超时
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("PDF.js加载超时"));
        }, 10000);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.crossOrigin = "anonymous";
      script.id = "pdfjs-library";

      script.onload = () => {
        // 延迟一下确保全局变量已设置
        setTimeout(() => {
          if (!window.pdfjsLib) {
            reject(new Error("PDF.js加载后未正确初始化"));
            return;
          }

          // 设置worker源
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          this.pdfLibLoaded = true;
          console.log("PDF.js库加载成功");
          resolve();
        }, 100);
      };

      script.onerror = () => {
        reject(new Error("PDF.js库加载失败，请检查网络连接"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 加载JSZip库
   */
  async loadJSZip() {
    return new Promise((resolve, reject) => {
      // 检查是否已在加载中
      if (document.querySelector('script[src*="jszip.min.js"]')) {
        // 等待加载完成
        const checkInterval = setInterval(() => {
          if (window.JSZip) {
            clearInterval(checkInterval);
            this.jsZipLoaded = true;
            console.log("JSZip库已加载完成");
            resolve();
          }
        }, 100);

        // 设置超时
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("JSZip加载超时"));
        }, 10000);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.crossOrigin = "anonymous";
      script.id = "jszip-library";

      script.onload = () => {
        // 延迟一下确保全局变量已设置
        setTimeout(() => {
          if (!window.JSZip) {
            reject(new Error("JSZip加载后未正确初始化"));
            return;
          }

          this.jsZipLoaded = true;
          console.log("JSZip库加载成功");
          resolve();
        }, 100);
      };

      script.onerror = () => {
        reject(new Error("JSZip库加载失败，请检查网络连接"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 处理单个单据
   */
  async processSingleDocument(item, index) {
    // 检查是否已取消
    if (this.isCancelled) {
      return;
    }

    const itemName =
      item.u_cert_name_level_EXName || item.u_zwmc || `单据_${index + 1}`;

    try {
      // 构建单个文件的URL（不传logo参数）
      const url = this.buildSingleFileUrl(item);
      console.log(`[${index + 1}] 下载URL（无水印）:`, url);

      // 下载文件
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 获取文件数据
      const blob = await response.blob();
      console.log(
        `[${index + 1}] 文件类型: ${blob.type}, 大小: ${this.formatFileSize(blob.size)}`,
      );

      // 创建二级文件夹
      const folderName = this.getSecondFolderName(item);
      console.log(`[${index + 1}] 二级文件夹: ${folderName}`);

      // 根据文件类型处理
      if (blob.type.includes("zip") || blob.type.includes("application/zip")) {
        console.log(`[${index + 1}] 检测到ZIP文件，开始解压处理`);
        await this.handleZipFile(blob, item, folderName);
      } else if (
        blob.type.includes("pdf") ||
        blob.type.includes("application/pdf")
      ) {
        console.log(`[${index + 1}] 检测到PDF文件，开始转换`);
        await this.convertSinglePDF(blob, item, folderName);
      } else {
        throw new Error(`不支持的文件格式: ${blob.type}`);
      }

      this.successCount++;
      console.log(`[${index + 1}] ${itemName} 处理成功`);
    } catch (error) {
      console.error(`[${index + 1}] ${itemName} 处理失败:`, error);
      this.failCount++;
      this.errors.push({
        index: index + 1,
        name: itemName,
        error: error.message,
      });
    }
  }

  /**
   * 构建单个文件的URL（移除logo参数）
   */
  buildSingleFileUrl(item) {
    // 注意：这里不传logo参数，获取原始文件
    const phId = item.u_cert_name_level || "";
    const asrFid = item.u_zswj || "";
    const fileName = item.u_zwmc || "资质证书";

    // 构建URL，不包含logo参数
    return (
      `${this.options.baseUrl}/prp-gateway/downLoadFileV2?` +
      `tableName=p_form_certificate_reg_m&` +
      `phId=${phId}&` +
      `filesName=${encodeURIComponent(fileName)}&` +
      `asrFid=${asrFid}`
    );
  }

  /**
   * 获取二级文件夹名称
   */
  getSecondFolderName(item) {
    // 优先使用 u_cert_name_level_EXName 字段
    let folderName = item.u_cert_name_level_EXName || item.u_zwmc || "未知单据";

    // 清理文件夹名
    folderName = this.cleanFolderName(folderName);

    // 如果文件夹名为空，使用默认名称
    if (!folderName.trim()) {
      folderName = `单据_${item.u_cert_name_level || Date.now()}`;
    }

    return folderName;
  }

  /**
   * 清理文件夹名
   */
  cleanFolderName(name) {
    if (!name || typeof name !== "string") {
      return "未知文件夹";
    }

    // 移除Windows文件名中不允许的字符
    return name
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\.\.\./g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 100); // 限制长度
  }

  /**
   * 清理文件名
   */
  cleanFilename(filename) {
    if (!filename || typeof filename !== "string") {
      return "document";
    }

    return filename
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, "_")
      .trim()
      .substring(0, 50); // 限制长度
  }

  /**
   * 转换单个PDF并保存到指定文件夹
   */
  async convertSinglePDF(blob, item, folderName) {
    // 检查是否已取消
    if (this.isCancelled) {
      return;
    }

    // 转换为ArrayBuffer
    const arrayBuffer = await this.blobToArrayBuffer(blob);

    // 检查PDF有效性
    if (!this.isValidPDF(arrayBuffer)) {
      throw new Error("无效的PDF文件格式");
    }

    // 加载PDF
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 更新统计
    this.fileStats.totalPages += pdf.numPages;
    console.log(`PDF总页数: ${pdf.numPages}`);

    // 生成基础文件名
    const baseFilename = item.u_zwmc || "资质证书";
    const cleanName = this.cleanFilename(baseFilename);

    // 转换每一页
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      // 检查是否已取消
      if (this.isCancelled) {
        return;
      }

      try {
        await this.convertPage(pdf, pageNum, cleanName, folderName);
        this.fileStats.processedPages++;

        // 更新进度
        if (pageNum % 5 === 0 || pageNum === pdf.numPages) {
          const progress =
            50 +
            Math.round(
              (this.processedImages / Math.max(this.totalImages, 1)) * 50,
            );
          this.updateProgress(
            Math.min(progress, 90),
            `正在转换图片 ${pageNum}/${pdf.numPages}`,
          );
        }
      } catch (pageError) {
        console.error(`第 ${pageNum} 页转换失败:`, pageError);
        throw new Error(`第 ${pageNum} 页转换失败: ${pageError.message}`);
      }
    }
  }

  /**
   * 转换单页并添加到ZIP
   */
  async convertPage(pdf, pageNum, baseName, folderName) {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.options.scale });

      // 创建canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // 设置canvas尺寸
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // 渲染PDF页面到canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // 添加水印（如果有配置水印）
      if (this.options.watermark) {
        this.addWatermarkToCanvas(canvas, context);
      }

      // 将canvas转换为PNG blob
      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas转换PNG失败"));
            }
          },
          "image/png",
          0.95,
        );
      });

      // 生成文件名
      const filename = `${baseName}_${pageNum.toString().padStart(3, "0")}.png`;

      // 构建完整的文件路径
      const filePath = `${this.options.parentFolderName}/${folderName}/${filename}`;

      // 添加到ZIP
      if (this.zip) {
        this.zip.file(filePath, pngBlob);
      }

      this.totalImages++;
      this.processedImages++;

      // 清理canvas
      canvas.width = 0;
      canvas.height = 0;

      return filePath;
    } catch (error) {
      console.error(`页面 ${pageNum} 处理失败:`, error);
      throw error;
    }
  }

  /**
   * 添加水印到Canvas（优化版，避免重叠，支持多行文字，支持交错排列）
   */
  addWatermarkToCanvas(canvas, context) {
    if (!this.options.watermark) return;

    const { watermark, watermarkOptions } = this.options;
    const {
      fontSize,
      color,
      angle,
      xSpacing,
      ySpacing,
      offsetX,
      offsetY,
      maxCharsPerLine,
      lineHeight,
    } = watermarkOptions;

    // 默认每行最多25个字符
    const maxChars = maxCharsPerLine || 25;
    const lineHeightRatio = lineHeight || 1.5;

    // 新增：交错排列偏移量配置
    const staggerOffsetX = watermarkOptions.staggerOffsetX || 0.5; // 交错X偏移比例，0-1之间
    const staggerOffsetY = watermarkOptions.staggerOffsetY || 0.5; // 交错Y偏移比例，0-1之间
    const staggerEvery = watermarkOptions.staggerEvery || 2; // 每N个水印块交错一次

    // 分割水印文字为多行
    const watermarkLines = this.splitWatermarkText(watermark, maxChars);

    // 计算文本块的总高度
    const lineSpacing = fontSize * 0.2; // 行间距
    const textBlockHeight = (fontSize + lineSpacing) * watermarkLines.length;

    // 保存当前上下文状态
    context.save();

    // 设置水印样式
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";

    // 测量最长行的宽度
    let maxTextWidth = 0;
    for (const line of watermarkLines) {
      const textMetrics = context.measureText(line);
      maxTextWidth = Math.max(maxTextWidth, textMetrics.width);
    }

    // 计算实际间距（基于文字大小和行数）
    const actualXSpacing = Math.max(xSpacing, maxTextWidth * 1.5);
    const actualYSpacing = Math.max(ySpacing, textBlockHeight * 2);

    // 旋转画布
    context.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    context.rotate((angle * Math.PI) / 180);

    // 计算需要绘制的水印数量
    const halfWidth =
      Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) /
      2;
    const halfHeight = halfWidth;
    const cols = Math.ceil((halfWidth * 2) / actualXSpacing) + 2;
    const rows = Math.ceil((halfHeight * 2) / actualYSpacing) + 2;

    // 绘制水印网格（从中心向外扩散）
    for (let i = -cols; i <= cols; i++) {
      for (let j = -rows; j <= rows; j++) {
        const x = i * actualXSpacing;
        const y = j * actualYSpacing;

        // 计算交错偏移
        let staggerX = 0;
        let staggerY = 0;

        // 根据网格位置计算是否交错
        if ((i + j) % staggerEvery === 0) {
          staggerX = actualXSpacing * staggerOffsetX;
          staggerY = actualYSpacing * staggerOffsetY;
        }

        // 确保水印在画布范围内
        if (
          Math.abs(x + staggerX) < halfWidth + maxTextWidth / 2 &&
          Math.abs(y + staggerY) < halfHeight + textBlockHeight / 2
        ) {
          // 绘制多行文字
          this.drawWatermarkLines(
            context,
            watermarkLines,
            x + staggerX,
            y + staggerY,
            fontSize,
            lineHeightRatio,
          );
        }
      }
    }

    // 恢复上下文状态
    context.restore();
  }

  /**
   * 分割水印文字为多行
   * @param {string} text 原始水印文字
   * @param {number} maxCharsPerLine 每行最大字符数
   * @returns {string[]} 分割后的行数组
   */
  splitWatermarkText(text, maxCharsPerLine = 25) {
    if (!text) return [];

    const lines = [];
    const words = text.split("");
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      // 检查当前字符是否是中文字符
      const isChinese = /[\u4e00-\u9fff]/.test(words[i]);
      const charWidth = isChinese ? 2 : 1; // 中文字符算2个宽度

      // 如果当前行字符数加上新字符宽度超过限制，则换行
      if (currentLine.length + charWidth > maxCharsPerLine) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = words[i];
      } else {
        currentLine += words[i];
      }
    }

    // 添加最后一行
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    // 如果分割后行数太多，截断并添加省略号
    if (lines.length > 3) {
      return lines
        .slice(0, 3)
        .map((line, index) =>
          index === 2 ? line.substring(0, maxCharsPerLine - 3) + "..." : line,
        );
    }

    return lines;
  }

  /**
   * 绘制多行水印文字
   * @param {CanvasRenderingContext2D} context Canvas上下文
   * @param {string[]} lines 文字行数组
   * @param {number} x 中心X坐标
   * @param {number} y 中心Y坐标
   * @param {number} fontSize 字体大小
   * @param {number} lineHeight 行高倍数
   */
  drawWatermarkLines(context, lines, x, y, fontSize, lineHeight) {
    if (!lines || lines.length === 0) return;

    const lineSpacing = fontSize * 0.2;
    const totalHeight = (fontSize + lineSpacing) * lines.length;
    const startY = y - totalHeight / 2 + fontSize / 2;

    for (let i = 0; i < lines.length; i++) {
      const lineY = startY + i * (fontSize + lineSpacing) * lineHeight;
      context.fillText(lines[i], x, lineY);
    }
  }

  /**
   * 处理ZIP文件
   */
  async handleZipFile(zipBlob, item, folderName) {
    try {
      // 检查是否已取消
      if (this.isCancelled) {
        return;
      }

      // 解压ZIP文件
      const zip = await JSZip.loadAsync(zipBlob);

      // 查找ZIP中的PDF文件
      const pdfFiles = Object.keys(zip.files).filter(
        (filename) =>
          !zip.files[filename].dir && filename.toLowerCase().endsWith(".pdf"),
      );

      if (pdfFiles.length === 0) {
        throw new Error("ZIP文件中未找到PDF文件");
      }

      console.log(`在ZIP中找到 ${pdfFiles.length} 个PDF文件`);

      // 处理每个PDF文件
      for (const filename of pdfFiles) {
        // 检查是否已取消
        if (this.isCancelled) {
          return;
        }

        const pdfFile = zip.files[filename];
        const pdfBlob = await pdfFile.async("blob");

        console.log(
          `处理ZIP中的文件: ${filename}, 大小: ${this.formatFileSize(pdfBlob.size)}`,
        );

        // 提取PDF文件名（不含扩展名）
        const pdfName = filename
          .replace(/\.pdf$/i, "")
          .replace(/\.[^/.]+$/, "");

        // 转换提取的PDF
        await this.convertSinglePDF(
          pdfBlob,
          {
            ...item,
            u_zwmc: pdfName || filename,
          },
          folderName,
        );
      }
    } catch (error) {
      console.error("处理ZIP文件失败:", error);
      throw new Error(`ZIP文件处理失败: ${error.message}`);
    }
  }

  /**
   * Blob转ArrayBuffer
   */
  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Blob读取失败"));
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * 检查PDF有效性
   */
  isValidPDF(arrayBuffer) {
    try {
      if (!arrayBuffer || arrayBuffer.byteLength < 4) {
        return false;
      }

      const uint8Array = new Uint8Array(arrayBuffer);
      // 检查PDF文件头（%PDF-）
      const header = String.fromCharCode(...uint8Array.slice(0, 4));
      return header === "%PDF";
    } catch (error) {
      console.error("PDF有效性检查失败:", error);
      return false;
    }
  }

  /**
   * 生成并下载ZIP文件
   */
  async generateAndDownloadZip() {
    if (!this.zip || Object.keys(this.zip.files).length === 0) {
      throw new Error("没有文件可以压缩");
    }

    this.updateProgress(90, "正在生成ZIP文件...");

    try {
      // 生成ZIP文件
      const zipBlob = await this.zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
        comment: `生成时间: ${new Date().toLocaleString()}\n总文件数: ${this.totalImages}\n一级文件夹: ${this.options.parentFolderName}\n水印: ${this.options.watermark || "无"}`,
      });

      this.updateProgress(95, "ZIP文件生成完成，开始下载...");

      // 下载ZIP文件
      await this.downloadZipFile(zipBlob);

      this.updateProgress(100, "下载完成！");
    } catch (error) {
      console.error("生成ZIP文件失败:", error);
      throw new Error(`ZIP文件生成失败: ${error.message}`);
    }
  }

  /**
   * 下载ZIP文件
   */
  async downloadZipFile(blob) {
    return new Promise((resolve, reject) => {
      try {
        // 生成ZIP文件名
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);
        const zipFilename = `${this.cleanFilename(this.options.parentFolderName)}_${timestamp}.zip`;

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = zipFilename;
        link.style.display = "none";

        // 添加到文档并触发点击
        document.body.appendChild(link);
        link.click();

        // 清理
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }, 100);

        console.log(
          `ZIP文件已下载: ${zipFilename}, 大小: ${this.formatFileSize(blob.size)}`,
        );
      } catch (error) {
        reject(new Error(`下载失败: ${error.message}`));
      }
    });
  }

  /**
   * 更新进度
   */
  updateProgress(percent, message = "") {
    const progressText = `进度: ${Math.min(percent, 100)}% - ${this.successCount}成功, ${this.failCount}失败`;

    // 控制台输出
    console.log(progressText, message);

    // 更新进度条
    if (this.progressBar && this.progressText && this.statusText) {
      this.progressBar.style.width = `${Math.min(percent, 100)}%`;
      this.progressText.textContent = progressText;
      this.statusText.textContent = message;
    }

    // 可选：显示通知消息
    if (
      this.options.showNotifications &&
      typeof $NG !== "undefined" &&
      $NG.message
    ) {
      $NG.message(`${progressText} ${message}`, "info");
    }
  }

  /**
   * 更新状态文本
   */
  updateStatus(message) {
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }

  /**
   * 显示最终结果
   */
  showFinalResult() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);

    const watermarkText = this.options.watermark
      ? `水印: "${this.options.watermark}"`
      : "水印: 无";
    const resultText = `处理完成！
总单据: ${this.options.dataList.length}个
成功: ${this.successCount}个
失败: ${this.failCount}个
总图片: ${this.totalImages}张
总页数: ${this.fileStats.totalPages}页
${watermarkText}
处理时间: ${duration}秒`;

    console.log(resultText);

    // 更新进度条状态
    if (this.statusText) {
      this.statusText.textContent = "处理完成！正在关闭进度条...";

      // 进度条变为绿色
      if (this.progressBar) {
        this.progressBar.style.background = "#4CAF50";
      }
    }

    // 可选：显示通知消息
    if (this.options.showNotifications && typeof $NG !== "undefined") {
      if (this.failCount === 0) {
        $NG.message(resultText, "success");
      } else {
        let errorDetails = "失败详情:\n";
        this.errors.forEach((error) => {
          errorDetails += `${error.index}. ${error.name}: ${error.error}\n`;
        });
        $NG.message(`${resultText}\n\n${errorDetails}`, "warning");
      }
    }
  }

  /**
   * 显示错误
   */
  showError(message) {
    console.error("错误:", message);

    // 更新进度条状态
    if (this.statusText) {
      this.statusText.textContent = `错误: ${message}`;

      // 进度条变为红色
      if (this.progressBar) {
        this.progressBar.style.background = "#f44336";
      }
    }

    // 可选：显示通知消息
    if (
      this.options.showNotifications &&
      typeof $NG !== "undefined" &&
      $NG.message
    ) {
      $NG.message("处理失败: " + message, "error");
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * 取消处理
   */
  cancel() {
    this.isCancelled = true;
    console.log("转换已取消");

    // 更新进度条状态
    if (this.statusText) {
      this.statusText.textContent = "处理已取消";

      // 进度条变为灰色
      if (this.progressBar) {
        this.progressBar.style.background = "#9E9E9E";
      }
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isInitializing: this.isInitializing,
      isProcessing: this.isProcessing,
      isCancelled: this.isCancelled,
      successCount: this.successCount,
      failCount: this.failCount,
      totalImages: this.totalImages,
      errors: this.errors,
      watermark: this.options.watermark, // 返回水印配置
      watermarkOptions: this.options.watermarkOptions,
    };
  }

  /**
   * 设置水印
   */
  setWatermark(text, options = {}) {
    this.options.watermark = text || "";
    if (options) {
      this.options.watermarkOptions = {
        ...this.options.watermarkOptions,
        ...options,
      };
    }
    console.log(`水印已更新: "${text}"`, this.options.watermarkOptions);
  }

  /**
   * 移除水印
   */
  removeWatermark() {
    this.options.watermark = "";
    console.log("水印已移除");
  }

  /**
   * 显示/隐藏进度条
   */
  toggleProgressBar(show) {
    this.options.showProgress = show;
    if (show && !this.progressContainer) {
      this.createProgressBar();
    } else if (!show && this.progressContainer) {
      this.removeProgressBar();
    }
  }
}

// 全局导出
if (typeof window !== "undefined") {
  window.BatchPDFToPNGConverter = BatchPDFToPNGConverter;
}
