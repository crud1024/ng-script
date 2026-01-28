/**
 * PDF转PNG下载器 - 无界面自动转换版本
 * 支持Blob/URL/File/ArrayBuffer多种输入，自动转换并下载
 */
class PDFToPNGConverter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {string|Blob|File|ArrayBuffer} options.pdfSource PDF数据源（URL、Blob、File或ArrayBuffer）
   * @param {string} options.filename 文件名（可选）
   * @param {number} options.scale 缩放比例，默认2.0
   * @param {boolean} options.skipValidation 是否跳过文件类型验证，默认false
   * @param {boolean} options.autoStart 是否自动开始转换，默认true
   * @param {Function} options.onComplete 转换完成回调
   * @param {Function} options.onError 转换错误回调
   */
  constructor(options = {}) {
    this.options = {
      pdfSource: options.pdfSource || "",
      filename: options.filename || "",
      scale: options.scale || 2.0,
      skipValidation: options.skipValidation || false,
      autoStart: options.autoStart !== false,
      onComplete: options.onComplete || null,
      onError: options.onError || null,
      ...options,
    };

    this.pdfLibLoaded = false;
    this.isProcessing = false;

    if (this.options.autoStart && this.options.pdfSource) {
      this.startConversion();
    }
  }

  /**
   * 开始转换
   */
  async startConversion() {
    if (this.isProcessing) {
      console.warn("转换正在进行中，请等待完成");
      return;
    }

    this.isProcessing = true;

    try {
      if (!this.options.pdfSource) {
        throw new Error("未提供PDF数据源");
      }

      await this.processPDFSource(
        this.options.pdfSource,
        this.options.filename,
      );

      // 调用完成回调
      if (typeof this.options.onComplete === "function") {
        this.options.onComplete();
      }
    } catch (error) {
      console.error("PDF转换失败:", error);

      // 调用错误回调
      if (typeof this.options.onError === "function") {
        this.options.onError(error);
      } else {
        // 默认错误处理
        this.showErrorToast(error.message);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 自定义脚本加载器
   * @param {string} url 脚本URL
   * @param {Function} onSuccess 成功回调
   * @param {Function} onError 失败回调
   */
  static loadScript(url, onSuccess, onError) {
    // 检查是否已加载
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        onSuccess && onSuccess();
      } else {
        existingScript.onload = function () {
          existingScript.setAttribute("data-loaded", "true");
          onSuccess && onSuccess();
        };
        existingScript.onerror = function () {
          onError && onError(new Error(`Failed to load script: ${url}`));
        };
      }
      return;
    }

    // 创建新脚本
    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";

    script.onload = function () {
      script.setAttribute("data-loaded", "true");
      onSuccess && onSuccess();
    };

    script.onerror = function () {
      onError && onError(new Error(`Failed to load script: ${url}`));
    };

    document.head.appendChild(script);
  }

  /**
   * 加载PDF.js库
   * @returns {Promise} Promise对象
   */
  async loadPDFJS() {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        this.pdfLibLoaded = true;
        resolve();
        return;
      }

      // 加载PDF.js主库
      PDFToPNGConverter.loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
        () => {
          // 设置worker路径
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          this.pdfLibLoaded = true;
          console.log("PDF.js 加载成功");
          resolve();
        },
        (error) => {
          console.error("PDF.js 加载失败:", error);
          reject(error);
        },
      );
    });
  }

  /**
   * 处理PDF数据源
   * @param {string|Blob|File|ArrayBuffer} source PDF数据源
   * @param {string} filename 文件名
   */
  async processPDFSource(source, filename = "") {
    // 确保PDF.js已加载
    if (!this.pdfLibLoaded) {
      await this.loadPDFJS();
    }

    this.showLoading("正在转换PDF文件...");

    let data;
    let finalFilename = filename;

    // 根据不同的数据源类型进行处理
    if (typeof source === "string") {
      // URL或base64字符串
      if (source.startsWith("http://") || source.startsWith("https://")) {
        // URL
        if (!this.options.skipValidation && !this.validatePDFUrl(source)) {
          throw new Error("请提供有效的PDF文件URL");
        }
        await this.convertPDFFromUrl(source, filename);
        this.hideLoading();
        return;
      } else if (source.startsWith("data:application/pdf")) {
        // base64数据URL
        data = this.dataURLToArrayBuffer(source);
      } else if (source.startsWith("blob:")) {
        // Blob URL
        const blob = await this.fetchBlobFromBlobURL(source);
        data = await this.blobToArrayBuffer(blob);
        finalFilename =
          finalFilename || this.extractFilenameFromBlobURL(source);
      } else {
        throw new Error("不支持的字符串格式");
      }
    } else if (source instanceof Blob || source instanceof File) {
      // Blob或File对象
      if (!this.options.skipValidation && !this.validateFileType(source)) {
        throw new Error("请提供有效的PDF文件");
      }
      data = await this.blobToArrayBuffer(source);
      finalFilename = finalFilename || source.name || "document.pdf";
    } else if (source instanceof ArrayBuffer) {
      // ArrayBuffer
      data = source;
    } else {
      throw new Error("不支持的数据源类型");
    }

    // 转换PDF
    if (data) {
      await this.convertPDF(data, finalFilename);
    }

    this.hideLoading();
  }

  /**
   * 从Blob URL获取Blob对象
   * @param {string} blobURL Blob URL
   * @returns {Promise<Blob>} Blob对象
   */
  async fetchBlobFromBlobURL(blobURL) {
    const response = await fetch(blobURL);
    if (!response.ok) {
      throw new Error(
        `无法获取Blob数据: ${response.status} ${response.statusText}`,
      );
    }
    return await response.blob();
  }

  /**
   * Blob转ArrayBuffer
   * @param {Blob} blob Blob对象
   * @returns {Promise<ArrayBuffer>} ArrayBuffer
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
   * DataURL转ArrayBuffer
   * @param {string} dataURL base64数据URL
   * @returns {ArrayBuffer} ArrayBuffer
   */
  dataURLToArrayBuffer(dataURL) {
    const base64 = dataURL.split(",")[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * 从Blob URL提取文件名
   * @param {string} blobURL Blob URL
   * @returns {string} 文件名
   */
  extractFilenameFromBlobURL(blobURL) {
    return "document.pdf";
  }

  /**
   * 从URL加载PDF
   * @param {string} pdfUrl PDF文件URL
   * @param {string} filename 文件名
   */
  async convertPDFFromUrl(pdfUrl, filename = "") {
    // 加载PDF文档
    const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    // 获取文件名
    const finalFilename =
      filename || this.extractFilenameFromUrl(pdfUrl) || "document";

    // 转换PDF
    await this.convertPDFPages(pdf, finalFilename);

    console.log(`PDF转换完成！共转换了 ${pdf.numPages} 页。`);
  }

  /**
   * 验证PDF URL
   * @param {string} url 文件URL
   * @returns {boolean} 是否有效
   */
  validatePDFUrl(url) {
    // 检查是否为PDF文件
    const pdfExtensions = [".pdf", ".PDF"];
    const hasPdfExtension = pdfExtensions.some((ext) =>
      url.toLowerCase().includes(ext),
    );

    // 如果URL包含download、downLoad等关键字，可能是下载接口，允许通过
    const isDownloadAPI =
      url.toLowerCase().includes("download") ||
      url.toLowerCase().includes("downLoad");

    // 对于API接口，不强制要求PDF扩展名
    if (isDownloadAPI) {
      return true;
    }

    // 对于普通URL，检查扩展名或Content-Type
    return hasPdfExtension || url.includes("application/pdf");
  }

  /**
   * 验证文件类型
   * @param {File|Blob} file 文件对象
   * @returns {boolean} 是否有效
   */
  validateFileType(file) {
    // 对于Blob对象，可能没有type属性
    if (!file.type) {
      console.warn("文件类型未知，跳过验证");
      return true;
    }

    const isValid = file.type === "application/pdf";

    if (!isValid) {
      console.error(`无效的文件类型: ${file.type}`);
    }

    return isValid;
  }

  /**
   * 从URL提取文件名
   * @param {string} url 文件URL
   * @returns {string} 文件名
   */
  extractFilenameFromUrl(url) {
    try {
      // 尝试解析URL
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // 从路径中提取文件名
      let filename = pathname.substring(pathname.lastIndexOf("/") + 1);

      // 如果没有文件名或文件名不合适，尝试从查询参数中获取
      if (!filename || filename.includes("?")) {
        const params = new URLSearchParams(urlObj.search);
        filename =
          params.get("fileName") ||
          params.get("filename") ||
          params.get("file") ||
          params.get("filesName") ||
          "document";
      }

      // 确保有.pdf扩展名
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename += ".pdf";
      }

      return filename;
    } catch (error) {
      // 如果不是有效URL，返回默认值
      return "document.pdf";
    }
  }

  /**
   * 转换PDF
   * @param {ArrayBuffer} arrayBuffer PDF数据
   * @param {string} originalFilename 原始文件名
   */
  async convertPDF(arrayBuffer, originalFilename) {
    // 加载PDF文档
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 转换PDF页面
    await this.convertPDFPages(pdf, originalFilename);

    console.log(`PDF转换完成！共转换了 ${pdf.numPages} 页。`);
  }

  /**
   * 转换PDF所有页面
   * @param {Object} pdf PDF文档对象
   * @param {string} baseFilename 基础文件名
   */
  async convertPDFPages(pdf, baseFilename) {
    const convertedPages = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        await this.convertPage(pdf, pageNum, baseFilename);
        convertedPages.push(pageNum);
      } catch (pageError) {
        console.error(`处理第 ${pageNum} 页时出错:`, pageError);
      }
    }

    if (convertedPages.length === 0) {
      throw new Error("所有页面转换失败");
    }

    console.log(`成功转换了 ${convertedPages.length}/${pdf.numPages} 页`);
  }

  /**
   * 转换单页
   * @param {Object} pdf PDF文档对象
   * @param {number} pageNum 页码
   * @param {string} baseFilename 基础文件名
   */
  async convertPage(pdf, pageNum, baseFilename) {
    // 获取页面
    const page = await pdf.getPage(pageNum);

    // 设置缩放比例
    const viewport = page.getViewport({ scale: this.options.scale });

    // 创建Canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // 设置Canvas尺寸
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 渲染PDF页面到Canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // 生成PNG数据URL
    const pngDataUrl = canvas.toDataURL("image/png");

    // 下载PNG图片
    const filename = this.cleanFilename(baseFilename) + `_page_${pageNum}.png`;
    this.downloadPNG(pngDataUrl, filename);

    console.log(`第 ${pageNum} 页转换完成`);
  }

  /**
   * 清理文件名
   * @param {string} filename 原始文件名
   * @returns {string} 清理后的文件名
   */
  cleanFilename(filename) {
    // 移除扩展名
    let cleanName = filename.replace(/\.pdf$/i, "");

    // 移除特殊字符，只保留字母、数字、中文、下划线和连字符
    cleanName = cleanName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, "_");

    // 如果清理后为空，使用默认名称
    if (!cleanName.trim()) {
      cleanName = "document";
    }

    return cleanName;
  }

  /**
   * 下载PNG图片
   * @param {string} dataUrl PNG数据URL
   * @param {string} filename 文件名
   */
  downloadPNG(dataUrl, filename) {
    // 创建下载链接
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";

    // 添加到文档并触发点击
    document.body.appendChild(link);
    link.click();

    // 延迟清理，确保下载开始
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }

  /**
   * 显示加载状态
   * @param {string} message 加载消息
   */
  showLoading(message) {
    // 移除现有的加载提示
    this.hideLoading();

    // 创建加载遮罩
    const overlay = document.createElement("div");
    overlay.id = "pdf-converter-loading";
    overlay.className = "pdf-converter-loading";
    overlay.innerHTML = `
            <div class="pdf-converter-spinner"></div>
            <div class="pdf-converter-loading-text">${message}</div>
        `;

    document.body.appendChild(overlay);

    // 添加样式（如果尚未添加）
    this.addStyles();
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const overlay = document.getElementById("pdf-converter-loading");
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  /**
   * 显示错误提示
   * @param {string} message 错误消息
   */
  showErrorToast(message) {
    const toast = document.createElement("div");
    toast.className = "pdf-converter-error-toast";
    toast.innerHTML = `
            <div class="pdf-converter-error-content">
                <span class="pdf-converter-error-icon">!</span>
                <span class="pdf-converter-error-message">${message}</span>
            </div>
        `;

    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: fadeIn 0.3s;
        `;

    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  /**
   * 添加样式
   */
  addStyles() {
    // 检查是否已添加样式
    if (document.getElementById("pdf-converter-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "pdf-converter-styles";
    style.textContent = `
            .pdf-converter-loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
                font-size: 18px;
            }
            
            .pdf-converter-spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #007bff;
                border-radius: 50%;
                animation: pdf-converter-spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            .pdf-converter-loading-text {
                text-align: center;
            }
            
            @keyframes pdf-converter-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .pdf-converter-error-toast {
                animation: fadeIn 0.3s;
            }
            
            .pdf-converter-error-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .pdf-converter-error-icon {
                background: white;
                color: #f44336;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            .pdf-converter-error-message {
                font-size: 14px;
            }
        `;

    document.head.appendChild(style);
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.hideLoading();
    this.isProcessing = false;
  }
}

// 全局导出
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = PDFToPNGConverter;
}

if (typeof window !== "undefined") {
  window.PDFToPNGConverter = PDFToPNGConverter;
}

// 便捷函数：直接转换并下载
PDFToPNGConverter.convertAndDownload = async function (source, options = {}) {
  const converter = new PDFToPNGConverter({
    pdfSource: source,
    filename: options.filename,
    scale: options.scale || 2.0,
    skipValidation: options.skipValidation || false,
    onComplete: options.onComplete,
    onError: options.onError,
  });

  return converter;
};

/**
 * 使用示例：
 *
 * 1. 使用Blob对象（推荐方式）
 * const blob = await response.blob();
 * PDFToPNGConverter.convertAndDownload(blob, {
 *     filename: '资质证书.pdf',
 *     skipValidation: true
 * });
 *
 * 2. 使用Blob URL
 * const downloadUrl = window.URL.createObjectURL(blob);
 * PDFToPNGConverter.convertAndDownload(downloadUrl, {
 *     filename: '资质证书.pdf',
 *     skipValidation: true
 * });
 *
 * 3. 使用实例方法
 * const converter = new PDFToPNGConverter({
 *     pdfSource: blob,
 *     filename: '资质证书.pdf',
 *     skipValidation: true
 * });
 */
