class BatchPDFToPNGConverter {
  constructor(options = {}) {
    this.options = {
      dataList: options.dataList || [],
      watermark: options.watermark || "",
      watermarkOptions: {
        fontSize: options.watermarkOptions?.fontSize || 32,
        color: options.watermarkOptions?.color || "rgba(180, 180, 180, 0.6)",
        angle: options.watermarkOptions?.angle || -30,
        xSpacing: options.watermarkOptions?.xSpacing || 300,
        ySpacing: options.watermarkOptions?.ySpacing || 200,
        offsetX: options.watermarkOptions?.offsetX || 0,
        offsetY: options.watermarkOptions?.offsetY || 0,
        maxCharsPerLine: options.watermarkOptions?.maxCharsPerLine || 25,
        lineHeight: options.watermarkOptions?.lineHeight || 1.5,
        staggerOffsetX: options.watermarkOptions?.staggerOffsetX || 0.5,
        staggerOffsetY: options.watermarkOptions?.staggerOffsetY || 0.5,
        staggerEvery: options.watermarkOptions?.staggerEvery || 2,
        ...options.watermarkOptions,
      },
      baseUrl: options.baseUrl || window.location.origin,
      parentFolderName: options.parentFolderName || "资质证书",
      scale: options.scale || 2.0,
      showProgress: options.showProgress !== false,
      showNotifications: options.showNotifications !== false,
      imageFormat: options.imageFormat || "jpg",
      jpegQuality: options.jpegQuality || 0.92,
      debug: options.debug === true,
      // 强制旋转角度（0, 90, 180, 270）- 如果自动检测失败可以手动指定
      forceRotation: options.forceRotation || null,
      // 是否自动检测并修复旋转
      autoFixRotation: options.autoFixRotation !== false,
      // 是否自动裁剪空白边缘
      autoCrop: options.autoCrop || false,
      ...options,
    };
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
    this.fileStats = {
      totalFiles: 0,
      processedFiles: 0,
      totalPages: 0,
      processedPages: 0,
    };
    this.errors = [];
    this.progressContainer = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.dragData = {
      isDragging: false,
      startX: 0,
      startY: 0,
      left: 0,
      top: 0,
    };
    if (this.options.dataList && this.options.dataList.length > 0) {
      setTimeout(() => {
        this.initializeAndStart();
      }, 0);
    }
  }

  async initializeAndStart() {
    if (this.isInitializing || this.isProcessing) {
      return;
    }
    this.isInitializing = true;
    try {
      this.startTime = new Date();
      if (this.options.showProgress) {
        this.createProgressBar();
      }
      this.showInitialMessage();
      if (!this.options.dataList.length) {
        throw new Error("未选择任何单据");
      }
      if (this.options.watermark) {
        this.updateStatus(`将添加水印: "${this.options.watermark}"`);
      } else {
        this.updateStatus("不添加水印");
      }
      this.updateProgress(0, `开始处理 ${this.options.dataList.length} 个单据`);
      await this.loadRequiredLibraries();
      if (!window.JSZip) {
        throw new Error("JSZip库未正确加载");
      }
      this.zip = new JSZip();
      this.isProcessing = true;
      this.isInitializing = false;
      for (let i = 0; i < this.options.dataList.length; i++) {
        if (this.isCancelled) {
          this.updateStatus("处理已被取消");
          break;
        }
        this.currentIndex = i;
        await this.processSingleDocument(this.options.dataList[i], i);
        const progress = Math.round(
          ((i + 1) / this.options.dataList.length) * 50,
        );
        this.updateProgress(
          progress,
          `正在处理单据 ${i + 1}/${this.options.dataList.length}`,
        );
      }
      if (!this.isCancelled) {
        await this.generateAndDownloadZip();
        this.showFinalResult();
      } else {
        this.updateProgress(0, "处理已被取消");
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.isProcessing = false;
      this.isInitializing = false;
      setTimeout(() => {
        this.removeProgressBar();
      }, 3000);
    }
  }

  createProgressBar() {
    if (this.progressContainer) {
      this.removeProgressBar();
    }
    this.progressContainer = document.createElement("div");
    this.progressContainer.style.cssText = `
      position: fixed;
      top: 15%;
      right: 20px;
      width: 360px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: 'Segoe UI', 'Microsoft YaHei', system-ui, -apple-system, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.4);
      cursor: move;
      user-select: none;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      background: rgba(24, 144, 255, 0.9);
      color: white;
      padding: 14px 18px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      cursor: move;
    `;
    header.innerHTML = `
      <span style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>
        </svg>
        证书下载进度
      </span>
      <button id="batch-pdf-close" style="background:none; border:none; color:white; cursor:pointer; font-size:20px; line-height:1; opacity:0.8; transition:opacity 0.2s; margin: -4px -6px 0 0; padding: 4px 6px;">×</button>
    `;

    const content = document.createElement("div");
    content.style.cssText = "padding: 18px;";

    const progressWrapper = document.createElement("div");
    progressWrapper.style.cssText = "margin-bottom: 14px;";

    const progressBarBg = document.createElement("div");
    progressBarBg.style.cssText = `
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 12px;
    `;
    this.progressBar = document.createElement("div");
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #8bc34a);
      border-radius: 10px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    this.progressText = document.createElement("div");
    this.progressText.style.cssText = `
      font-size: 13px;
      font-weight: 500;
      color: #1f2d3d;
      text-align: center;
      margin-bottom: 10px;
      background: rgba(255, 255, 255, 0.6);
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-block;
      width: auto;
      margin-left: auto;
      margin-right: auto;
    `;

    this.statusText = document.createElement("div");
    this.statusText.style.cssText = `
      font-size: 12px;
      color: #2c3e50;
      text-align: center;
      line-height: 1.45;
      word-break: break-word;
      background: rgba(255, 255, 255, 0.5);
      padding: 8px 12px;
      border-radius: 12px;
      margin-top: 6px;
    `;

    progressBarBg.appendChild(this.progressBar);
    progressWrapper.appendChild(this.progressText);
    progressWrapper.appendChild(progressBarBg);
    progressWrapper.appendChild(this.statusText);
    content.appendChild(progressWrapper);
    this.progressContainer.appendChild(header);
    this.progressContainer.appendChild(content);
    document.body.appendChild(this.progressContainer);

    const headerDrag = this.progressContainer.querySelector("div:first-child");
    headerDrag.addEventListener("mousedown", this.onDragStart.bind(this));
    window.addEventListener("mousemove", this.onDragMove.bind(this));
    window.addEventListener("mouseup", this.onDragEnd.bind(this));

    const closeBtn = this.progressContainer.querySelector("#batch-pdf-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.removeProgressBar();
      });
    }
  }

  onDragStart(e) {
    if (e.target === this.progressContainer.querySelector("#batch-pdf-close"))
      return;
    this.dragData.isDragging = true;
    this.dragData.startX = e.clientX;
    this.dragData.startY = e.clientY;
    const rect = this.progressContainer.getBoundingClientRect();
    this.dragData.left = rect.left;
    this.dragData.top = rect.top;
    this.progressContainer.style.cursor = "grabbing";
    e.preventDefault();
  }

  onDragMove(e) {
    if (!this.dragData.isDragging) return;
    const dx = e.clientX - this.dragData.startX;
    const dy = e.clientY - this.dragData.startY;
    let newLeft = this.dragData.left + dx;
    let newTop = this.dragData.top + dy;
    const maxX = window.innerWidth - this.progressContainer.offsetWidth;
    const maxY = window.innerHeight - this.progressContainer.offsetHeight;
    newLeft = Math.min(Math.max(0, newLeft), maxX);
    newTop = Math.min(Math.max(0, newTop), maxY);
    this.progressContainer.style.left = `${newLeft}px`;
    this.progressContainer.style.top = `${newTop}px`;
    this.progressContainer.style.right = "auto";
    this.dragData.left = newLeft;
    this.dragData.top = newTop;
  }

  onDragEnd() {
    this.dragData.isDragging = false;
    this.progressContainer.style.cursor = "move";
  }

  removeProgressBar() {
    if (this.progressContainer && this.progressContainer.parentNode) {
      window.removeEventListener("mousemove", this.onDragMove);
      window.removeEventListener("mouseup", this.onDragEnd);
      this.progressContainer.parentNode.removeChild(this.progressContainer);
      this.progressContainer = null;
      this.progressBar = null;
      this.progressText = null;
      this.statusText = null;
    }
  }

  showInitialMessage() {
    const watermarkText = this.options.watermark
      ? `，将添加水印："${this.options.watermark}"`
      : "，无水印";
    const formatText =
      this.options.imageFormat === "jpg" ? "JPG格式" : "PNG格式";
    const message = `开始批量处理 ${this.options.dataList.length} 个单据，一级文件夹：${this.options.parentFolderName}，输出格式：${formatText}${watermarkText}`;
    if (
      this.options.showNotifications &&
      typeof $NG !== "undefined" &&
      $NG.message
    ) {
      $NG.message(message, "info");
    }
  }

  async loadRequiredLibraries() {
    try {
      const librariesLoaded = await this.checkLibrariesLoaded();
      if (!librariesLoaded.pdfjs) {
        await this.loadPDFJS();
      }
      if (!librariesLoaded.jszip) {
        await this.loadJSZip();
      }
    } catch (error) {
      throw new Error(`库加载失败: ${error.message}`);
    }
  }

  async checkLibrariesLoaded() {
    return {
      pdfjs: !!(window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions),
      jszip: !!window.JSZip,
    };
  }

  async loadPDFJS() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="pdf.min.js"]')) {
        const checkInterval = setInterval(() => {
          if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
            clearInterval(checkInterval);
            this.pdfLibLoaded = true;
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("PDF.js加载超时"));
        }, 10000);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/PDF/ V1/pdf.min.js";
      script.crossOrigin = "anonymous";
      script.id = "pdfjs-library";
      script.onload = () => {
        setTimeout(() => {
          if (!window.pdfjsLib) {
            reject(new Error("PDF.js加载后未正确初始化"));
            return;
          }
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/PDF/ V1/pdf.worker.min.js";
          this.pdfLibLoaded = true;
          resolve();
        }, 100);
      };
      script.onerror = () => {
        reject(new Error("PDF.js库加载失败，请检查网络连接"));
      };
      document.head.appendChild(script);
    });
  }

  async loadJSZip() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="jszip.min.js"]')) {
        const checkInterval = setInterval(() => {
          if (window.JSZip) {
            clearInterval(checkInterval);
            this.jsZipLoaded = true;
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("JSZip加载超时"));
        }, 10000);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://fastly.jsdelivr.net/gh/crud1024/ng-script@main/Utils/JSZIP/V1/jszip.min.js";
      script.crossOrigin = "anonymous";
      script.id = "jszip-library";
      script.onload = () => {
        setTimeout(() => {
          if (!window.JSZip) {
            reject(new Error("JSZip加载后未正确初始化"));
            return;
          }
          this.jsZipLoaded = true;
          resolve();
        }, 100);
      };
      script.onerror = () => {
        reject(new Error("JSZip库加载失败，请检查网络连接"));
      };
      document.head.appendChild(script);
    });
  }

  async processSingleDocument(item, index) {
    if (this.isCancelled) {
      return;
    }
    const itemName =
      item.u_cert_name_level_EXName || item.u_zwmc || `单据_${index + 1}`;
    try {
      const url = this.buildSingleFileUrl(item);
      console.log("========================================");
      console.log(`📎 【原始文件下载链接】单据 ${index + 1}: ${itemName}`);
      console.log(`🔗 下载URL: ${url}`);
      console.log("========================================");
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      const folderName = this.getSecondFolderName(item);
      if (blob.type.includes("zip") || blob.type.includes("application/zip")) {
        await this.handleZipFile(blob, item, folderName);
      } else if (
        blob.type.includes("pdf") ||
        blob.type.includes("application/pdf")
      ) {
        await this.convertSinglePDF(blob, item, folderName);
      } else {
        throw new Error(`不支持的文件格式: ${blob.type}`);
      }
      this.successCount++;
    } catch (error) {
      this.failCount++;
      this.errors.push({
        index: index + 1,
        name: itemName,
        error: error.message,
      });
    }
  }

  buildSingleFileUrl(item) {
    const phId = item.u_cert_name_level || "";
    const asrFid = item.u_zswj || "";
    const fileName = item.u_zwmc || "资质证书";
    return (
      `${this.options.baseUrl}/prp-gateway/downLoadFileV2?` +
      `tableName=p_form_certificate_reg_m&` +
      `phId=${phId}&` +
      `filesName=${encodeURIComponent(fileName)}&` +
      `asrFid=${asrFid}`
    );
  }

  getSecondFolderName(item) {
    let folderName = item.u_cert_name_level_EXName || item.u_zwmc || "未知单据";
    folderName = this.cleanFolderName(folderName);
    if (!folderName.trim()) {
      folderName = `单据_${item.u_cert_name_level || Date.now()}`;
    }
    return folderName;
  }

  cleanFolderName(name) {
    if (!name || typeof name !== "string") {
      return "未知文件夹";
    }
    return name
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\.\.\./g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 100);
  }

  cleanFilename(filename) {
    if (!filename || typeof filename !== "string") {
      return "document";
    }
    return filename
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, "_")
      .trim()
      .substring(0, 50);
  }

  getImageExtension() {
    return this.options.imageFormat === "jpg" ? "jpg" : "png";
  }

  getImageMimeType() {
    return this.options.imageFormat === "jpg" ? "image/jpeg" : "image/png";
  }

  async convertSinglePDF(blob, item, folderName) {
    if (this.isCancelled) {
      return;
    }
    const arrayBuffer = await this.blobToArrayBuffer(blob);
    if (!this.isValidPDF(arrayBuffer)) {
      throw new Error("无效的PDF文件格式");
    }
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    this.fileStats.totalPages += pdf.numPages;
    const baseFilename = item.u_zwmc || "资质证书";
    const cleanName = this.cleanFilename(baseFilename);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (this.isCancelled) {
        return;
      }
      try {
        await this.convertPage(pdf, pageNum, cleanName, folderName);
        this.fileStats.processedPages++;
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
        throw new Error(`第 ${pageNum} 页转换失败: ${pageError.message}`);
      }
    }
  }

  async convertPage(pdf, pageNum, baseName, folderName) {
    try {
      const page = await pdf.getPage(pageNum);

      // 获取页面原始信息
      const pageRotate = page.rotate || 0;

      // 先获取无旋转的原始视口
      const originalViewport = page.getViewport({ scale: 1, rotation: 0 });
      const originalWidth = originalViewport.width;
      const originalHeight = originalViewport.height;

      if (this.options.debug) {
        console.log(`========== 页面 ${pageNum} 调试信息 ==========`);
        console.log(`PDF页面旋转属性: ${pageRotate}°`);
        console.log(
          `原始尺寸 (无旋转): ${originalWidth.toFixed(2)} x ${originalHeight.toFixed(2)}`,
        );
      }

      // 确定最终旋转角度
      let finalRotation = 0;

      if (this.options.forceRotation !== null) {
        // 使用强制旋转角度
        finalRotation = this.options.forceRotation;
        if (this.options.debug) {
          console.log(`使用强制旋转角度: ${finalRotation}°`);
        }
      } else if (this.options.autoFixRotation) {
        // 自动检测旋转角度
        finalRotation = await this.detectOptimalRotation(
          page,
          originalViewport,
          pageRotate,
        );
        if (this.options.debug) {
          console.log(`自动检测到的旋转角度: ${finalRotation}°`);
        }
      } else {
        // 只使用PDF自带的旋转
        finalRotation = pageRotate;
      }

      // 计算最终渲染尺寸
      let renderWidth, renderHeight;
      let canvasTransform = null;

      if (finalRotation === 0) {
        renderWidth = originalWidth * this.options.scale;
        renderHeight = originalHeight * this.options.scale;
      } else if (finalRotation === 90) {
        renderWidth = originalHeight * this.options.scale;
        renderHeight = originalWidth * this.options.scale;
        canvasTransform = { rotation: 90, swap: true };
      } else if (finalRotation === 180) {
        renderWidth = originalWidth * this.options.scale;
        renderHeight = originalHeight * this.options.scale;
        canvasTransform = { rotation: 180, swap: false };
      } else if (finalRotation === 270) {
        renderWidth = originalHeight * this.options.scale;
        renderHeight = originalWidth * this.options.scale;
        canvasTransform = { rotation: 270, swap: true };
      }

      if (this.options.debug) {
        console.log(`最终旋转角度: ${finalRotation}°`);
        console.log(
          `渲染尺寸: ${renderWidth.toFixed(2)} x ${renderHeight.toFixed(2)}`,
        );
      }

      // 创建主canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = Math.ceil(renderWidth);
      canvas.height = Math.ceil(renderHeight);

      // 先渲染PDF到临时canvas（无旋转，原始尺寸）
      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      const tempViewport = page.getViewport({
        scale: this.options.scale,
        rotation: 0,
      });
      tempCanvas.width = tempViewport.width;
      tempCanvas.height = tempViewport.height;

      const renderContext = {
        canvasContext: tempContext,
        viewport: tempViewport,
        transform: null,
      };
      await page.render(renderContext).promise;

      if (this.options.debug) {
        console.log(
          `临时canvas渲染完成: ${tempCanvas.width} x ${tempCanvas.height}`,
        );
      }

      // 应用旋转变换
      if (finalRotation !== 0) {
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 移动到canvas中心
        context.translate(canvas.width / 2, canvas.height / 2);

        // 应用旋转
        context.rotate((finalRotation * Math.PI) / 180);

        // 计算绘制位置
        let drawX, drawY, drawWidth, drawHeight;

        if (finalRotation === 90) {
          drawWidth = tempCanvas.height;
          drawHeight = tempCanvas.width;
          drawX = -drawWidth / 2;
          drawY = -drawHeight / 2;
          context.drawImage(tempCanvas, drawX, drawY, drawWidth, drawHeight);
        } else if (finalRotation === 270) {
          drawWidth = tempCanvas.height;
          drawHeight = tempCanvas.width;
          drawX = -drawWidth / 2;
          drawY = -drawHeight / 2;
          context.drawImage(tempCanvas, drawX, drawY, drawWidth, drawHeight);
        } else if (finalRotation === 180) {
          drawWidth = tempCanvas.width;
          drawHeight = tempCanvas.height;
          drawX = -drawWidth / 2;
          drawY = -drawHeight / 2;
          context.drawImage(tempCanvas, drawX, drawY, drawWidth, drawHeight);
        }

        context.restore();

        if (this.options.debug) {
          console.log(`旋转变换已应用: ${finalRotation}°`);
        }
      } else {
        // 无需旋转，直接复制
        context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }

      // 可选：自动裁剪空白边缘
      if (this.options.autoCrop) {
        const croppedCanvas = this.autoCropCanvas(canvas);
        if (croppedCanvas) {
          canvas.width = croppedCanvas.width;
          canvas.height = croppedCanvas.height;
          context.drawImage(croppedCanvas, 0, 0);
          if (this.options.debug) {
            console.log(`自动裁剪完成: ${canvas.width} x ${canvas.height}`);
          }
        }
      }

      // 清理临时canvas
      tempCanvas.width = 0;
      tempCanvas.height = 0;

      if (this.options.debug) {
        console.log(`✅ 页面渲染完成`);
      }

      // 添加水印
      if (this.options.watermark) {
        this.addWatermarkToCanvas(canvas, canvas.getContext("2d"));
      }

      // 转换为图片
      const imageBlob = await new Promise((resolve, reject) => {
        const mimeType = this.getImageMimeType();
        const quality =
          this.options.imageFormat === "jpg" ? this.options.jpegQuality : 0.95;
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else
              reject(
                new Error(
                  `Canvas转换${this.options.imageFormat.toUpperCase()}失败`,
                ),
              );
          },
          mimeType,
          quality,
        );
      });

      const extension = this.getImageExtension();
      const filename = `${baseName}_${pageNum.toString().padStart(3, "0")}.${extension}`;
      const filePath = `${this.options.parentFolderName}/${folderName}/${filename}`;

      if (this.zip) {
        this.zip.file(filePath, imageBlob);
      }
      this.totalImages++;
      this.processedImages++;

      if (this.options.debug) {
        console.log(
          `✅ 页面 ${pageNum} 处理完成，已添加为${this.options.imageFormat.toUpperCase()}到ZIP`,
        );
        console.log(`=====================================\n`);
      }

      // 清理
      canvas.width = 0;
      canvas.height = 0;

      return filePath;
    } catch (error) {
      if (this.options.debug) console.error(`页面 ${pageNum} 转换失败:`, error);
      throw error;
    }
  }

  // 自动检测最佳旋转角度
  async detectOptimalRotation(page, viewport, pageRotate) {
    try {
      // 创建采样canvas（较小尺寸以提高性能）
      const sampleScale = 0.2;
      const sampleViewport = page.getViewport({
        scale: sampleScale,
        rotation: 0,
      });
      const sampleCanvas = document.createElement("canvas");
      const sampleContext = sampleCanvas.getContext("2d");
      sampleCanvas.width = sampleViewport.width;
      sampleCanvas.height = sampleViewport.height;

      const renderContext = {
        canvasContext: sampleContext,
        viewport: sampleViewport,
      };
      await page.render(renderContext).promise;

      // 分析四个方向的文本方向
      const rotations = [0, 90, 180, 270];
      let bestRotation = 0;
      let maxScore = -Infinity;

      for (const rotation of rotations) {
        const score = this.analyzeRotationScore(sampleCanvas, rotation);
        if (this.options.debug) {
          console.log(`旋转角度 ${rotation}° 的评分: ${score.toFixed(2)}`);
        }
        if (score > maxScore) {
          maxScore = score;
          bestRotation = rotation;
        }
      }

      // 清理
      sampleCanvas.width = 0;
      sampleCanvas.height = 0;

      return bestRotation;
    } catch (error) {
      if (this.options.debug) {
        console.log(`旋转检测失败: ${error.message}`);
      }
      return pageRotate;
    }
  }

  // 分析特定旋转角度的评分
  analyzeRotationScore(canvas, rotation) {
    // 创建临时canvas进行旋转分析
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");

    let width, height;
    if (rotation === 0 || rotation === 180) {
      width = canvas.width;
      height = canvas.height;
    } else {
      width = canvas.height;
      height = canvas.width;
    }

    tempCanvas.width = width;
    tempCanvas.height = height;

    // 应用旋转
    tempContext.save();
    tempContext.translate(width / 2, height / 2);
    tempContext.rotate((rotation * Math.PI) / 180);

    if (rotation === 0 || rotation === 180) {
      tempContext.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    } else {
      tempContext.drawImage(
        canvas,
        -canvas.height / 2,
        -canvas.width / 2,
        canvas.height,
        canvas.width,
      );
    }
    tempContext.restore();

    // 分析文本特征
    const score = this.analyzeTextOrientation(tempCanvas);

    tempCanvas.width = 0;
    tempCanvas.height = 0;

    return score;
  }

  // 分析文本方向（通过检测字符的水平和垂直分布）
  analyzeTextOrientation(canvas) {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 检测水平方向和垂直方向的边缘强度
    let horizontalEdges = 0;
    let verticalEdges = 0;
    const threshold = 30;

    // 简化的边缘检测（通过相邻像素差异）
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

        // 水平边缘检测
        const leftIdx = (y * canvas.width + (x - 1)) * 4;
        const leftBrightness =
          (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const rightIdx = (y * canvas.width + (x + 1)) * 4;
        const rightBrightness =
          (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

        const horizDiff = Math.abs(leftBrightness - rightBrightness);
        if (horizDiff > threshold) {
          horizontalEdges++;
        }

        // 垂直边缘检测
        const topIdx = ((y - 1) * canvas.width + x) * 4;
        const topBrightness =
          (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
        const bottomIdx = ((y + 1) * canvas.width + x) * 4;
        const bottomBrightness =
          (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;

        const vertDiff = Math.abs(topBrightness - bottomBrightness);
        if (vertDiff > threshold) {
          verticalEdges++;
        }
      }
    }

    // 正常文本应该是水平边缘较多
    // 如果垂直边缘明显多于水平边缘，可能是需要旋转90度
    const totalEdges = horizontalEdges + verticalEdges;
    if (totalEdges === 0) return 0;

    const horizontalRatio = horizontalEdges / totalEdges;

    // 水平边缘占比越高，评分越高
    return horizontalRatio;
  }

  // 自动裁剪空白边缘
  autoCropCanvas(canvas) {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let top = canvas.height;
    let bottom = 0;
    let left = canvas.width;
    let right = 0;

    const threshold = 250; // 接近白色的阈值

    // 查找非空白区域边界
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // 如果不是接近白色
        if (r < threshold || g < threshold || b < threshold) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    // 如果没有找到内容，返回原canvas
    if (top >= bottom || left >= right) {
      return null;
    }

    // 添加少量边距
    const padding = 10;
    top = Math.max(0, top - padding);
    left = Math.max(0, left - padding);
    bottom = Math.min(canvas.height - 1, bottom + padding);
    right = Math.min(canvas.width - 1, right + padding);

    const cropWidth = right - left + 1;
    const cropHeight = bottom - top + 1;

    // 创建裁剪后的canvas
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedContext = croppedCanvas.getContext("2d");

    croppedContext.drawImage(
      canvas,
      left,
      top,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    return croppedCanvas;
  }

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
      staggerOffsetX,
      staggerOffsetY,
      staggerEvery,
    } = watermarkOptions;
    const maxChars = maxCharsPerLine || 25;
    const lineHeightRatio = lineHeight || 1.5;
    const staggerXOffset = staggerOffsetX || 0.5;
    const staggerYOffset = staggerOffsetY || 0.5;
    const staggerCount = staggerEvery || 2;
    const watermarkLines = this.splitWatermarkText(watermark, maxChars);
    const lineSpacing = fontSize * 0.2;
    const textBlockHeight = (fontSize + lineSpacing) * watermarkLines.length;

    context.save();
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";

    let maxTextWidth = 0;
    for (const line of watermarkLines) {
      const textMetrics = context.measureText(line);
      maxTextWidth = Math.max(maxTextWidth, textMetrics.width);
    }

    const actualXSpacing = Math.max(xSpacing, maxTextWidth * 1.5);
    const actualYSpacing = Math.max(ySpacing, textBlockHeight * 2);

    context.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    context.rotate((angle * Math.PI) / 180);

    const halfWidth =
      Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) /
      2;
    const halfHeight = halfWidth;
    const cols = Math.ceil((halfWidth * 2) / actualXSpacing) + 2;
    const rows = Math.ceil((halfHeight * 2) / actualYSpacing) + 2;

    for (let i = -cols; i <= cols; i++) {
      for (let j = -rows; j <= rows; j++) {
        const x = i * actualXSpacing;
        const y = j * actualYSpacing;
        let staggerX = 0;
        let staggerY = 0;
        if ((i + j) % staggerCount === 0) {
          staggerX = actualXSpacing * staggerXOffset;
          staggerY = actualYSpacing * staggerYOffset;
        }
        if (
          Math.abs(x + staggerX) < halfWidth + maxTextWidth / 2 &&
          Math.abs(y + staggerY) < halfHeight + textBlockHeight / 2
        ) {
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
    context.restore();
  }

  splitWatermarkText(text, maxCharsPerLine = 25) {
    if (!text) return [];
    const lines = [];
    const words = text.split("");
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const isChinese = /[\u4e00-\u9fff]/.test(words[i]);
      const charWidth = isChinese ? 2 : 1;
      if (currentLine.length + charWidth > maxCharsPerLine) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = words[i];
      } else {
        currentLine += words[i];
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    if (lines.length > 3) {
      return lines
        .slice(0, 3)
        .map((line, index) =>
          index === 2 ? line.substring(0, maxCharsPerLine - 3) + "..." : line,
        );
    }
    return lines;
  }

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

  async handleZipFile(zipBlob, item, folderName) {
    try {
      if (this.isCancelled) {
        return;
      }
      const zip = await JSZip.loadAsync(zipBlob);
      const pdfFiles = Object.keys(zip.files).filter(
        (filename) =>
          !zip.files[filename].dir && filename.toLowerCase().endsWith(".pdf"),
      );
      if (pdfFiles.length === 0) {
        throw new Error("ZIP文件中未找到PDF文件");
      }
      for (const filename of pdfFiles) {
        if (this.isCancelled) {
          return;
        }
        const pdfFile = zip.files[filename];
        const pdfBlob = await pdfFile.async("blob");
        const pdfName = filename
          .replace(/\.pdf$/i, "")
          .replace(/\.[^/.]+$/, "");
        await this.convertSinglePDF(
          pdfBlob,
          { ...item, u_zwmc: pdfName || filename },
          folderName,
        );
      }
    } catch (error) {
      throw new Error(`ZIP文件处理失败: ${error.message}`);
    }
  }

  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Blob读取失败"));
      reader.readAsArrayBuffer(blob);
    });
  }

  isValidPDF(arrayBuffer) {
    try {
      if (!arrayBuffer || arrayBuffer.byteLength < 4) {
        return false;
      }
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array.slice(0, 4));
      return header === "%PDF";
    } catch (error) {
      return false;
    }
  }

  async generateAndDownloadZip() {
    if (!this.zip || Object.keys(this.zip.files).length === 0) {
      throw new Error("没有文件可以压缩");
    }
    this.updateProgress(90, "正在生成ZIP文件...");
    try {
      const zipBlob = await this.zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
        comment: `生成时间: ${new Date().toLocaleString()}\n总文件数: ${this.totalImages}\n一级文件夹: ${this.options.parentFolderName}\n输出格式: ${this.options.imageFormat.toUpperCase()}\n水印: ${this.options.watermark || "无"}`,
      });
      this.updateProgress(95, "ZIP文件生成完成，开始下载...");
      await this.downloadZipFile(zipBlob);
      this.updateProgress(100, "下载完成！");
    } catch (error) {
      throw new Error(`ZIP文件生成失败: ${error.message}`);
    }
  }

  async downloadZipFile(blob) {
    return new Promise((resolve, reject) => {
      try {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);
        const zipFilename = `${this.cleanFilename(this.options.parentFolderName)}_${timestamp}.zip`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = zipFilename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }, 100);
      } catch (error) {
        reject(new Error(`下载失败: ${error.message}`));
      }
    });
  }

  updateProgress(percent, message = "") {
    const progressText = `进度: ${Math.min(percent, 100)}% - ${this.successCount}成功, ${this.failCount}失败`;
    if (this.progressBar && this.progressText && this.statusText) {
      this.progressBar.style.width = `${Math.min(percent, 100)}%`;
      this.progressText.textContent = progressText;
      this.statusText.textContent = message;
    }
    if (
      this.options.showNotifications &&
      typeof $NG !== "undefined" &&
      $NG.message
    ) {
      $NG.message(`${progressText} ${message}`, "info");
    }
  }

  updateStatus(message) {
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }

  showFinalResult() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);
    const watermarkText = this.options.watermark
      ? `水印: "${this.options.watermark}"`
      : "水印: 无";
    const formatText =
      this.options.imageFormat === "jpg" ? "JPG格式" : "PNG格式";
    const resultText = `处理完成！\n总单据: ${this.options.dataList.length}个\n成功: ${this.successCount}个\n失败: ${this.failCount}个\n总图片: ${this.totalImages}张（${formatText}）\n总页数: ${this.fileStats.totalPages}页\n${watermarkText}\n处理时间: ${duration}秒`;
    if (this.statusText) {
      this.statusText.textContent = "处理完成！正在关闭进度条...";
      if (this.progressBar) {
        this.progressBar.style.background = "#4CAF50";
      }
    }
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

  showError(message) {
    if (this.statusText) {
      this.statusText.textContent = `错误: ${message}`;
      if (this.progressBar) {
        this.progressBar.style.background = "#f44336";
      }
    }
    if (
      this.options.showNotifications &&
      typeof $NG !== "undefined" &&
      $NG.message
    ) {
      $NG.message("处理失败: " + message, "error");
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  cancel() {
    this.isCancelled = true;
    if (this.statusText) {
      this.statusText.textContent = "处理已取消";
      if (this.progressBar) {
        this.progressBar.style.background = "#9E9E9E";
      }
    }
  }

  getStatus() {
    return {
      isInitializing: this.isInitializing,
      isProcessing: this.isProcessing,
      isCancelled: this.isCancelled,
      successCount: this.successCount,
      failCount: this.failCount,
      totalImages: this.totalImages,
      errors: this.errors,
      watermark: this.options.watermark,
      watermarkOptions: this.options.watermarkOptions,
      imageFormat: this.options.imageFormat,
    };
  }

  setWatermark(text, options = {}) {
    this.options.watermark = text || "";
    if (options) {
      this.options.watermarkOptions = {
        ...this.options.watermarkOptions,
        ...options,
      };
    }
  }

  removeWatermark() {
    this.options.watermark = "";
  }

  toggleProgressBar(show) {
    this.options.showProgress = show;
    if (show && !this.progressContainer) {
      this.createProgressBar();
    } else if (!show && this.progressContainer) {
      this.removeProgressBar();
    }
  }
}

if (typeof window !== "undefined") {
  window.BatchPDFToPNGConverter = BatchPDFToPNGConverter;
}
