/**
 * 批量PDF转PNG转换器 - 支持多个PDF文件处理
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

      // 加载PDF.js库
      await this.loadPDFJS();

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

      // 验证是否为PDF
      if (
        !blob.type.includes("pdf") &&
        !blob.type.includes("application/pdf")
      ) {
        throw new Error("文件不是PDF格式");
      }

      // 转换PDF为PNG
      await this.convertSinglePDF(blob, item);

      this.successCount++;
    } catch (error) {
      console.error(`处理单据 ${index + 1} 失败:`, error);
      this.failCount++;
    }
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
