/**
 * PDF转PNG转换器 - 无界面自动转换版本
 * 支持Blob/URL/File/ArrayBuffer多种输入，自动转换并下载
 */
class PDFToPNGConverter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {string|Blob|File|ArrayBuffer} options.pdfSource PDF数据源（URL、Blob、File或ArrayBuffer）
   * @param {string} options.filename 文件名（可选）
   * @param {number} options.scale 缩放比例，默认2.0
   * @param {boolean} options.skipValidation 是否跳过文件类型验证，默认true（推荐）
   */
  constructor(options = {}) {
    this.options = {
      pdfSource: options.pdfSource || null,
      filename: options.filename || "",
      scale: options.scale || 2.0,
      skipValidation: options.skipValidation !== false, // 默认true
      ...options,
    };

    this.pdfLibLoaded = false;

    // 如果有数据源，立即开始转换
    if (this.options.pdfSource) {
      this.startConversion();
    }
  }

  /**
   * 开始转换
   */
  async startConversion() {
    try {
      if (!this.options.pdfSource) {
        throw new Error("未提供PDF数据源");
      }

      await this.loadPDFJS();
      await this.processPDFSource(
        this.options.pdfSource,
        this.options.filename,
      );
    } catch (error) {
      console.error("PDF转换失败:", error);
      throw error;
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
   * 处理PDF数据源
   */
  async processPDFSource(source, filename = "") {
    let data;
    let finalFilename = filename;

    if (typeof source === "string") {
      if (source.startsWith("http://") || source.startsWith("https://")) {
        // URL
        await this.convertFromUrl(source, filename);
        return;
      } else if (source.startsWith("blob:")) {
        // Blob URL
        data = await this.fetchFromBlobURL(source);
      } else {
        throw new Error("不支持的字符串格式");
      }
    } else if (source instanceof Blob || source instanceof File) {
      // Blob或File对象
      if (!this.options.skipValidation && !this.isValidPDF(source)) {
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

    if (data) {
      await this.convertPDF(data, finalFilename);
    }
  }

  /**
   * 从URL转换
   */
  async convertFromUrl(url, filename = "") {
    const loadingTask = window.pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    const finalFilename =
      filename || this.extractFilenameFromUrl(url) || "document";
    await this.convertPDFPages(pdf, finalFilename);
  }

  /**
   * 从Blob URL获取数据
   */
  async fetchFromBlobURL(blobURL) {
    const response = await fetch(blobURL);
    if (!response.ok) throw new Error("无法获取Blob数据");
    const blob = await response.blob();
    return await this.blobToArrayBuffer(blob);
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
   * 验证PDF文件类型
   */
  isValidPDF(file) {
    return file.type === "application/pdf";
  }

  /**
   * 从URL提取文件名
   */
  extractFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      let filename = pathname.substring(pathname.lastIndexOf("/") + 1);

      if (!filename) {
        const params = new URLSearchParams(urlObj.search);
        filename =
          params.get("fileName") || params.get("filename") || "document";
      }

      return filename.endsWith(".pdf") ? filename : filename + ".pdf";
    } catch {
      return "document.pdf";
    }
  }

  /**
   * 转换PDF数据
   */
  async convertPDF(arrayBuffer, filename) {
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    await this.convertPDFPages(pdf, filename);
  }

  /**
   * 转换PDF所有页面
   */
  async convertPDFPages(pdf, baseFilename) {
    const cleanName = this.cleanFilename(baseFilename);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      await this.convertPage(pdf, pageNum, cleanName);
    }
  }

  /**
   * 转换单页
   */
  async convertPage(pdf, pageNum, baseName) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.options.scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    const pngDataUrl = canvas.toDataURL("image/png");
    const filename = `${baseName}_page_${pageNum}.png`;

    this.downloadFile(pngDataUrl, filename);
  }

  /**
   * 清理文件名
   */
  cleanFilename(filename) {
    return (
      filename
        .replace(/\.pdf$/i, "")
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, "_") || "document"
    );
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
}

// 全局导出
if (typeof window !== "undefined") {
  window.PDFToPNGConverter = PDFToPNGConverter;
}
