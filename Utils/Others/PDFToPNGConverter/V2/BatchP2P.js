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
      
      // 关键改进：强制设置文件名用于类型检测
      blob.name = item.u_zwmc || "unknown_file";

      // 根据文件类型进行相应处理
      await this.handleFileByType(blob, item);

      this.successCount++;
    } catch (error) {
      console.error(`处理单据 ${index + 1} 失败:`, error);
      this.failCount++;
    }
  }

  /**
   * 根据文件类型处理文件 - 增强版
   */
  async handleFileByType(blob, item) {
    const fileType = this.getFileType(blob);
    const fileName = item.u_zwmc || "unknown";

    this.showProgress(
      this.currentIndex + 1,
      this.options.dataList.length,
      `检测到文件类型: ${fileType} (${fileName})`
    );

    // 记录详细的类型检测信息
    console.log(`文件分析详情:`, {
      fileName: fileName,
      mimeType: blob.type,
      detectedType: fileType,
      fileSize: blob.size
    });

    switch (fileType) {
      case "pdf":
        await this.convertSinglePDF(blob, item);
        break;
      case "zip":
        // 对于ZIP类型，首先尝试PDF内容检测
        if (await this.isPdfByContent(blob)) {
          console.warn(`警告: 文件${fileName}被标记为ZIP，但内容检测为PDF，将按PDF处理`);
          await this.convertSinglePDF(blob, item);
        } else {
          await this.handleZipFile(blob, item);
        }
        break;
      case "image":
        await this.convertImageToPNG(blob, item);
        break;
      case "word":
        await this.convertWordToPNG(blob, item);
        break;
      case "powerpoint":
        await this.convertPowerPointToPNG(blob, item);
        break;
      case "excel":
        await this.convertExcelToPNG(blob, item);
        break;
      default:
        // 最后的兜底方案：尝试PDF内容检测
        if (await this.isPdfByContent(blob)) {
          console.warn(`警告: 未知类型${blob.type}，但内容检测为PDF，将按PDF处理`);
          await this.convertSinglePDF(blob, item);
        } else if (fileName.toLowerCase().endsWith('.pdf')) {
          // 如果文件名是.pdf，强制尝试PDF处理
          console.warn(`警告: 文件名为PDF但类型未知，强制尝试PDF处理`);
          try {
            await this.convertSinglePDF(blob, item);
          } catch (pdfError) {
            throw new Error(`文件${fileName}看起来像PDF但无法处理: ${pdfError.message}`);
          }
        } else {
          throw new Error(`不支持的文件类型: ${blob.type || "unknown"} (文件名: ${fileName})`);
        }
    }
  }

  /**
   * 获取文件类型 - 增强版
   */
  getFileType(blob) {
    const mimeType = blob.type.toLowerCase();
    const fileName = (blob.name || "").toLowerCase();
    
    console.log(`类型检测 - MIME: ${mimeType}, 文件名: ${fileName}`);

    // PDF文件 - 多重检测策略
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("application/pdf") ||
      fileName.includes(".pdf")
    ) {
      // 即使MIME类型是ZIP，如果文件名是PDF，仍然标记为PDF
      if (mimeType.includes("zip") && fileName.includes(".pdf")) {
        console.warn(`检测到MIME类型冲突: ${mimeType} vs 文件名: ${fileName}`);
        return "pdf"; // 优先信任文件名
      }
      return "pdf";
    }

    // ZIP文件 - 但排除可能是PDF的情况
    if (
      mimeType.includes("zip") ||
      mimeType.includes("application/zip") ||
      fileName.includes(".zip")
    ) {
      // 如果文件名暗示是PDF，不标记为ZIP
      if (fileName.includes(".pdf")) {
        console.warn(`ZIP MIME但文件名含PDF，暂标记为unknown等待进一步检测`);
        return "unknown";
      }
      return "zip";
    }

    // 图片文件
    if (mimeType.startsWith("image/")) {
      return "image";
    }

    // Word文档
    if (
      mimeType.includes("word") ||
      mimeType.includes("doc") ||
      mimeType.includes("application/msword") ||
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ) ||
      fileName.includes(".doc") ||
      fileName.includes(".docx")
    ) {
      return "word";
    }

    // PowerPoint文件
    if (
      mimeType.includes("powerpoint") ||
      mimeType.includes("ppt") ||
      mimeType.includes("application/vnd.ms-powerpoint") ||
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ) ||
      fileName.includes(".ppt") ||
      fileName.includes(".pptx")
    ) {
      return "powerpoint";
    }

    // Excel文件
    if (
      mimeType.includes("excel") ||
      mimeType.includes("xls") ||
      mimeType.includes("application/vnd.ms-excel") ||
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ) ||
      fileName.includes(".xls") ||
      fileName.includes(".xlsx")
    ) {
      return "excel";
    }

    return "unknown";
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
    const hasPdfFiles = this.options.dataList.some((item) => {
      // 这里简单检查文件扩展名，实际应用中可以根据实际情况调整
      const fileName = item.u_zwmc || "";
      return fileName.toLowerCase().includes(".pdf");
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

  /**
   * 处理ZIP文件
   */
  async handleZipFile(blob, item) {
    console.warn("ZIP文件处理功能需要额外的库支持（如JSZip）");

    // 创建一个占位图片表示ZIP文件
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext("2d");

    context.fillStyle = "#FFA000";
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "white";
    context.font = "48px Arial";
    context.textAlign = "center";
    context.fillText("ZIP压缩包", 400, 300);

    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "压缩文件";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "zip"}.png`;

    this.downloadFile(pngDataUrl, filename);
  }

  /**
   * 通过文件内容检测是否为PDF - 增强版
   */
  async isPdfByContent(blob) {
    try {
      // 读取更大的样本以提高准确性
      const sampleSize = Math.min(4096, blob.size); // 读取前4KB
      const arrayBuffer = await this.blobToArrayBuffer(blob.slice(0, sampleSize));
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 检查PDF文件头
      const pdfSignatures = [
        [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
        [0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E] // %PDF-1.
      ];
      
      for (const signature of pdfSignatures) {
        if (uint8Array.length >= signature.length) {
          let matches = true;
          for (let i = 0; i < signature.length; i++) {
            if (uint8Array[i] !== signature[i]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            console.log(`PDF内容检测成功: 找到签名 ${String.fromCharCode(...signature)}`);
            return true;
          }
        }
      }
      
      // 额外检查：寻找PDF对象引用模式
      const contentString = String.fromCharCode(...uint8Array.slice(0, Math.min(100, uint8Array.length)));
      if (contentString.includes('obj') && contentString.includes('endobj')) {
        console.log('PDF内容检测成功: 找到PDF对象结构');
        return true;
      }
      
      console.log('PDF内容检测失败: 未找到有效PDF签名');
      return false;
    } catch (error) {
      console.error("PDF内容检测异常:", error);
      return false;
    }
  }
}

// 全局导出
if (typeof window !== "undefined") {
  window.BatchPDFToPNGConverter = BatchPDFToPNGConverter;
}
