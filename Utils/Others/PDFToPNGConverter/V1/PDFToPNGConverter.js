/**
 * PDF转PNG下载器 - 面向对象封装（支持Blob/URL/File多种输入）
 */
class PDFToPNGConverter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {string|Blob|File|ArrayBuffer} options.pdfSource PDF数据源（URL、Blob、File或ArrayBuffer）
   * @param {string} options.filename 文件名（可选）
   * @param {number} options.scale 缩放比例，默认2.0
   * @param {boolean} options.autoInit 是否自动初始化，默认true
   * @param {boolean} options.skipValidation 是否跳过文件类型验证，默认false
   */
  constructor(options = {}) {
    this.options = {
      pdfSource: options.pdfSource || "",
      filename: options.filename || "",
      scale: options.scale || 2.0,
      autoInit: options.autoInit !== false,
      skipValidation: options.skipValidation || false,
      ...options,
    };

    this.pdfLibLoaded = false;
    this.fileInput = null;
    this.triggerButton = null;

    if (this.options.autoInit) {
      this.init();
    }
  }

  /**
   * 初始化
   */
  init() {
    if (this.options.pdfSource) {
      // 如果有数据源，直接处理
      this.processPDFSource(this.options.pdfSource, this.options.filename);
    } else {
      // 创建文件选择界面
      this.createFileSelector();
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
  loadPDFJS() {
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
    try {
      // 确保PDF.js已加载
      if (!this.pdfLibLoaded) {
        await this.loadPDFJS();
      }

      this.showLoading("正在处理PDF文件...");

      let data;
      let finalFilename = filename;

      // 根据不同的数据源类型进行处理
      if (typeof source === "string") {
        // URL或base64字符串
        if (source.startsWith("http://") || source.startsWith("https://")) {
          // URL
          if (!this.options.skipValidation && !this.validatePDFUrl(source)) {
            console.error("请提供有效的PDF文件URL");
            this.hideLoading();
            return;
          }
          await this.convertPDFFromUrl(source, filename);
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
        }
      } else if (source instanceof Blob || source instanceof File) {
        // Blob或File对象
        if (!this.options.skipValidation && !this.validateFileType(source)) {
          console.error("请提供有效的PDF文件");
          this.hideLoading();
          return;
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
    } catch (error) {
      console.error("PDF处理失败:", error);
      this.hideLoading();
      throw error;
    }
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
    // Blob URL无法直接获取文件名，返回默认值
    return "document.pdf";
  }

  /**
   * 创建文件选择器界面
   */
  createFileSelector() {
    // 创建文件输入元素
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = ".pdf,application/pdf";
    this.fileInput.style.display = "none";
    this.fileInput.id = "pdf-converter-file-input";

    // 创建触发按钮
    this.triggerButton = document.createElement("button");
    this.triggerButton.textContent = "选择PDF文件并转换为PNG";
    this.triggerButton.className = "pdf-converter-btn";

    // 设置样式
    this.addStyles();

    // 绑定事件
    this.triggerButton.addEventListener("click", () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener("change", (event) => {
      this.handleFileSelect(event);
    });

    // 添加到文档
    document.body.appendChild(this.fileInput);
    document.body.appendChild(this.triggerButton);
  }

  /**
   * 从URL加载PDF
   * @param {string} pdfUrl PDF文件URL
   * @param {string} filename 文件名
   */
  async convertPDFFromUrl(pdfUrl, filename = "") {
    try {
      // 加载PDF文档
      const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      // 获取文件名
      const finalFilename =
        filename || this.extractFilenameFromUrl(pdfUrl) || "document";

      // 转换PDF
      await this.convertPDFPages(pdf, finalFilename);

      this.hideLoading();
      console.log(`PDF转换完成！共转换了 ${pdf.numPages} 页。`);
    } catch (error) {
      this.hideLoading();
      throw error;
    }
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
      url.toLowerCase().includes("downloadfile");

    // 对于API接口，不强制要求PDF扩展名
    if (isDownloadAPI) {
      return true;
    }

    // 对于普通URL，检查扩展名或Content-Type
    return hasPdfExtension || url.includes("application/pdf");
  }

  /**
   * 处理文件选择
   * @param {Event} event 文件选择事件
   */
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 确保PDF.js已加载
      if (!this.pdfLibLoaded) {
        await this.loadPDFJS();
      }

      this.showLoading("正在处理PDF文件...");

      // 读取并转换文件
      await this.readAndConvertFile(file);
    } catch (error) {
      console.error("PDF处理失败:", error);
      this.hideLoading();
      alert("PDF处理失败: " + error.message);
    }
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
   * 读取并转换文件
   * @param {File} file 文件对象
   */
  readAndConvertFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          await this.convertPDF(arrayBuffer, file.name);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => {
        reject(new Error("文件读取失败: " + error));
      };

      reader.readAsArrayBuffer(file);
    });
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
    try {
      // 加载PDF文档
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // 转换PDF页面
      await this.convertPDFPages(pdf, originalFilename);

      // 重置文件输入
      if (this.fileInput) {
        this.fileInput.value = "";
      }

      this.hideLoading();
      console.log(`PDF转换完成！共转换了 ${pdf.numPages} 页。`);
    } catch (error) {
      this.hideLoading();
      throw error;
    }
  }

  /**
   * 转换PDF所有页面
   * @param {Object} pdf PDF文档对象
   * @param {string} baseFilename 基础文件名
   */
  async convertPDFPages(pdf, baseFilename) {
    const pagePromises = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pagePromises.push(this.convertPage(pdf, pageNum, baseFilename));
    }

    // 并行处理所有页面
    await Promise.allSettled(pagePromises);
  }

  /**
   * 转换单页
   * @param {Object} pdf PDF文档对象
   * @param {number} pageNum 页码
   * @param {string} baseFilename 基础文件名
   */
  async convertPage(pdf, pageNum, baseFilename) {
    try {
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
      const filename =
        baseFilename.replace(".pdf", "").replace(".PDF", "") +
        `_page_${pageNum}.png`;
      this.downloadPNG(pngDataUrl, filename);

      console.log(`第 ${pageNum} 页转换完成`);
    } catch (pageError) {
      console.error(`处理第 ${pageNum} 页时出错:`, pageError);
      throw pageError;
    }
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

    // 添加到文档并触发点击
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
   * 添加样式
   */
  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .pdf-converter-btn {
                padding: 12px 24px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                margin: 20px;
                transition: background-color 0.3s, transform 0.2s;
            }
            
            .pdf-converter-btn:hover {
                background: #0056b3;
            }
            
            .pdf-converter-btn:active {
                transform: scale(0.98);
            }
            
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
        `;

    document.head.appendChild(style);
  }

  /**
   * 销毁实例
   */
  destroy() {
    // 移除事件监听器
    if (this.triggerButton) {
      this.triggerButton.removeEventListener("click", () => {});
    }

    if (this.fileInput) {
      this.fileInput.removeEventListener("change", () => {});
    }

    // 移除DOM元素
    if (this.fileInput && this.fileInput.parentNode) {
      this.fileInput.parentNode.removeChild(this.fileInput);
    }

    if (this.triggerButton && this.triggerButton.parentNode) {
      this.triggerButton.parentNode.removeChild(this.triggerButton);
    }

    // 移除加载状态
    this.hideLoading();

    // 清理属性
    this.fileInput = null;
    this.triggerButton = null;
    this.pdfLibLoaded = false;
  }
}
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = PDFToPNGConverter;
}
if (typeof window !== "undefined") {
  window.PDFToPNGConverter = PDFToPNGConverter;
}

// 使用方法
// 1. 支持Blob对象
// const converter1 = new PDFToPNGConverter({
//     pdfSource: blobObject,
//     filename: '资质证书.pdf'
// });

// 2. 支持Blob URL
// const converter2 = new PDFToPNGConverter({
//     pdfSource: 'blob:http://localhost:3000/xxx-xxx-xxx',
//     filename: '资质证书.pdf'
// });

// 3. 支持普通URL（跳过验证）
// const converter3 = new PDFToPNGConverter({
//     pdfSource: downloadUrl,
//     filename: '资质证书.pdf',
//     skipValidation: true  // 跳过URL验证
// });

// 4. 支持ArrayBuffer
// const converter4 = new PDFToPNGConverter({
//     pdfSource: arrayBuffer,
//     filename: '资质证书.pdf'
// });
