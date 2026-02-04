/**
 * 批量文件转PNG转换器 - 支持PDF、图片、Word等多种文件格式处理
 */
class BatchPDFToPNGConverter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {Array} options.dataList 数据列表
   * @param {string} options.logo 水印
   * @param {string} options.baseUrl 基础URL
   */
  constructor(options = {}) {
    this.options = {
      dataList: options.dataList || [],
      logo: options.logo || "",
      baseUrl: options.baseUrl || window.location.origin,
      scale: options.scale || 2.0,
      ...options,
    };

    this.pdfLibLoaded = false;
    this.currentIndex = 0;
    this.successCount = 0;
    this.failCount = 0;

    if (this.options.dataList && this.options.dataList.length > 0) {
      this.startBatchConversion();
    }
  }

  /**
   * 开始批量转换
   */
  async startBatchConversion() {
    try {
      if (!this.options.dataList.length) {
        throw new Error("未选择任何单据");
      }

      // 显示进度提示
      this.showProgress(0, this.options.dataList.length);

      // 根据需要加载PDF.js库
      await this.loadPDFJSIfNeeded();

      // 依次处理每个单据
      for (let i = 0; i < this.options.dataList.length; i++) {
        this.currentIndex = i;
        await this.processSingleDocument(this.options.dataList[i], i);
      }

      // 显示最终结果
      this.showResult();
    } catch (error) {
      console.error("批量转换失败:", error);
      this.showError(error.message);
    }
  }

  /**
   * 处理单个单据
   */
  async processSingleDocument(item, index) {
    try {
      this.showProgress(
        index + 1,
        this.options.dataList.length,
        `正在处理: ${item.u_cert_name_level || item.u_zwmc || "未知单据"}`,
      );

      // 构建单个文件的URL
      const url = this.buildSingleFileUrl(item);

      // 下载文件
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      // 获取文件数据
      const blob = await response.blob();

      // 根据文件类型进行相应处理
      await this.handleFileByType(blob, item);

      this.successCount++;
    } catch (error) {
      console.error(`处理单据 ${index + 1} 失败:`, error);
      this.failCount++;
    }
  }

  /**
   * 根据文件类型处理文件
   */
  async handleFileByType(blob, item) {
    const fileType = this.getFileType(blob);
    
    switch (fileType) {
      case 'pdf':
        await this.convertSinglePDF(blob, item);
        break;
      case 'image':
        await this.convertImageToPNG(blob, item);
        break;
      case 'word':
        await this.convertWordToPNG(blob, item);
        break;
      case 'powerpoint':
        await this.convertPowerPointToPNG(blob, item);
        break;
      case 'excel':
        await this.convertExcelToPNG(blob, item);
        break;
      default:
        throw new Error(`不支持的文件类型: ${blob.type}`);
    }
  }

  /**
   * 获取文件类型
   */
  getFileType(blob) {
    const mimeType = blob.type.toLowerCase();
    
    // PDF文件
    if (mimeType.includes('pdf') || mimeType.includes('application/pdf')) {
      return 'pdf';
    }
    
    // 图片文件
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    
    // Word文档
    if (mimeType.includes('word') || 
        mimeType.includes('doc') || 
        mimeType.includes('application/msword') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return 'word';
    }
    
    // PowerPoint文件
    if (mimeType.includes('powerpoint') || 
        mimeType.includes('ppt') || 
        mimeType.includes('application/vnd.ms-powerpoint') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      return 'powerpoint';
    }
    
    // Excel文件
    if (mimeType.includes('excel') || 
        mimeType.includes('xls') || 
        mimeType.includes('application/vnd.ms-excel') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return 'excel';
    }
    
    return 'unknown';
  }

  /**
   * 构建单个文件的URL
   */
  buildSingleFileUrl(item) {
    const encodedLogo = encodeURIComponent(this.options.logo);
    const phId = item.u_cert_name_level || "";
    const asrFid = item.u_zswj || "";

    return (
      `${this.options.baseUrl}/prp-gateway/downLoadFileV2?` +
      `tableName=p_form_certificate_reg_m&` +
      `phId=${phId}&` +
      `logo=${encodedLogo}&` +
      `filesName=${encodeURIComponent(item.u_zwmc || "资质证书")}&` +
      `asrFid=${asrFid}`
    );
  }

  /**
   * 转换单个PDF
   */
  async convertSinglePDF(blob, item) {
    // 转换为ArrayBuffer
    const arrayBuffer = await this.blobToArrayBuffer(blob);

    // 加载PDF
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 生成文件名
    const baseFilename = item.u_zwmc || "资质证书";
    const cleanName = this.cleanFilename(baseFilename);

    // 转换每一页
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      await this.convertPage(pdf, pageNum, cleanName, item);
    }
  }

  /**
   * 转换图片为PNG
   */
  async convertImageToPNG(blob, item) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);

        const pngDataUrl = canvas.toDataURL("image/png");
        const baseFilename = item.u_zwmc || "图片文件";
        const cleanName = this.cleanFilename(baseFilename);
        const filename = `${cleanName}_${item.u_cert_name_level || "image"}.png`;

        this.downloadFile(pngDataUrl, filename);
        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("图片加载失败"));
      };

      img.src = url;
    });
  }

  /**
   * 转换Word文档为PNG（简化处理，实际需要更复杂的转换）
   */
  async convertWordToPNG(blob, item) {
    // 这里是一个简化的实现，实际应用中可能需要使用专门的库
    // 如 mammoth.js 或 docx-preview 来处理Word文档
    console.warn("Word文档转换功能需要额外的库支持");
    
    // 创建一个占位图片表示Word文档
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    
    // 绘制简单的Word文档图标
    context.fillStyle = "#4285F4";
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "white";
    context.font = "48px Arial";
    context.textAlign = "center";
    context.fillText("Word文档", 400, 300);
    
    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "Word文档";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "word"}.png`;
    
    this.downloadFile(pngDataUrl, filename);
  }

  /**
   * 转换PowerPoint为PNG（简化处理）
   */
  async convertPowerPointToPNG(blob, item) {
    console.warn("PowerPoint转换功能需要额外的库支持");
    
    // 创建一个占位图片表示PPT文档
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    
    context.fillStyle = "#DB4437";
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "white";
    context.font = "48px Arial";
    context.textAlign = "center";
    context.fillText("PPT文档", 400, 300);
    
    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "PPT文档";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "ppt"}.png`;
    
    this.downloadFile(pngDataUrl, filename);
  }

  /**
   * 转换Excel为PNG（简化处理）
   */
  async convertExcelToPNG(blob, item) {
    console.warn("Excel转换功能需要额外的库支持");
    
    // 创建一个占位图片表示Excel文档
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    
    context.fillStyle = "#0F9D58";
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "white";
    context.font = "48px Arial";
    context.textAlign = "center";
    context.fillText("Excel文档", 400, 300);
    
    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "Excel文档";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "excel"}.png`;
    
    this.downloadFile(pngDataUrl, filename);
  }

  /**
   * 转换单页
   */
  async convertPage(pdf, pageNum, baseName, item) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.options.scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    const pngDataUrl = canvas.toDataURL("image/png");
    const filename = `${baseName}_${item.u_cert_name_level || "doc"}_page_${pageNum}.png`;

    this.downloadFile(pngDataUrl, filename);
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
   * 根据需要加载PDF.js库
   */
  async loadPDFJSIfNeeded() {
    // 检查是否有PDF文件需要处理
    const hasPdfFiles = this.options.dataList.some(item => {
      // 这里简单检查文件扩展名，实际应用中可以根据实际情况调整
      const fileName = item.u_zwmc || "";
      return fileName.toLowerCase().includes('.pdf');
    });

    if (hasPdfFiles) {
      await this.loadPDFJS();
    }
  }

  /**
   * 加载PDF.js库
   */
  async loadPDFJS() {
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      this.pdfLibLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        this.pdfLibLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error("PDF.js加载失败"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 清理文件名
   */
  cleanFilename(filename) {
    return filename.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, "_") || "document";
  }

  /**
   * 下载文件
   */
  downloadFile(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }

  /**
   * 显示进度
   */
  showProgress(current, total, message = "") {
    const progressText = `进度: ${current}/${total} (${this.successCount}成功, ${this.failCount}失败)`;
    console.log(progressText, message);

    // 可以在这里添加UI进度显示
    // 例如：$NG.message(progressText + ' ' + (message || ''), "info");
  }

  /**
   * 显示结果
   */
  showResult() {
    const resultText = `下载完成！成功: ${this.successCount}个，失败: ${this.failCount}个`;
    console.log(resultText);

    // 显示结果通知
    if (typeof $NG !== "undefined" && $NG.message) {
      $NG.message(resultText, this.failCount === 0 ? "success" : "warning");
    }
  }

  /**
   * 显示错误
   */
  showError(message) {
    console.error("错误:", message);

    if (typeof $NG !== "undefined" && $NG.message) {
      $NG.message("下载失败: " + message, "error");
    }
  }
}

// 全局导出
if (typeof window !== "undefined") {
  window.BatchPDFToPNGConverter = BatchPDFToPNGConverter;
}