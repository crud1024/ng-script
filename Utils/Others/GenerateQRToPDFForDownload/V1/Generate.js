/**
 * 批量二维码 PDF 生成器
 * 用于将多个二维码（含编码）生成到一个 PDF 文件中，每页一个二维码
 * 依赖库：qrcode-generator、jsPDF（自动从 CDN 加载）
 */
class BatchQRCodePDFExporter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {string} options.fileName 输出 PDF 文件名（如 "qrcodes.pdf"）
   * @param {Array} options.items 二维码数据数组，每项包含 { code: string, url: string }
   * @param {number} [options.qrSize=80] 二维码尺寸（毫米），默认 80mm
   * @param {number} [options.textFontSize=16] 编码文字字号，默认 16
   * @param {number} [options.textMargin=10] 二维码与文字间距（毫米），默认 10mm
   */
  constructor(options = {}) {
    this.options = {
      fileName: options.fileName || "二维码.pdf",
      items: options.items || [],
      qrSize: options.qrSize || 80, // mm
      textFontSize: options.textFontSize || 16,
      textMargin: options.textMargin || 10, // mm
      ...options,
    };

    this.dependenciesLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * 开始导出 PDF
   * @returns {Promise<void>}
   */
  async startExport() {
    try {
      if (!this.options.items || this.options.items.length === 0) {
        throw new Error("没有数据可生成 PDF");
      }

      // 显示开始提示（可自定义）
      this.showMessage("正在准备生成 PDF...", "info");

      // 加载依赖库
      await this.ensureDependencies();

      // 生成 PDF
      await this.generatePDF();

      this.showMessage(`PDF 生成成功：${this.options.fileName}`, "success");
    } catch (error) {
      console.error("生成 PDF 失败:", error);
      this.showMessage("生成 PDF 失败：" + error.message, "error");
    }
  }

  /**
   * 确保依赖库已加载
   * @returns {Promise<void>}
   */
  async ensureDependencies() {
    if (this.dependenciesLoaded) return;

    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.loadDependencies();
    await this.loadingPromise;
    this.dependenciesLoaded = true;
  }

  /**
   * 加载所需的库（qrcode-generator, jsPDF）
   * @returns {Promise<void>}
   */
  loadDependencies() {
    const libs = [
      {
        name: "qrcode-generator",
        global: "qrcode",
        url: "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js",
      },
      {
        name: "jspdf",
        global: "jspdf",
        url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      },
    ];

    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
          resolve(); // 已加载
          return;
        }
        const script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`加载失败: ${url}`));
        document.head.appendChild(script);
      });
    };

    // 检查哪些库未加载
    const toLoad = libs
      .filter((lib) => !window[lib.global])
      .map((lib) => loadScript(lib.url));

    if (toLoad.length === 0) {
      return Promise.resolve();
    }

    return Promise.all(toLoad);
  }

  /**
   * 生成二维码图片的 DataURL
   * @param {string} text 二维码内容（URL）
   * @returns {string} PNG 图片的 DataURL
   */
  generateQRCodeDataURL(text) {
    const qr = window.qrcode(0, "M"); // 版本自动，纠错等级 M
    qr.addData(text);
    qr.make();

    const matrixSize = qr.getModuleCount();
    const cellSize = 8; // 每个模块像素大小（可调整清晰度）
    const canvasSize = matrixSize * cellSize;

    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");

    // 白色背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 绘制黑色模块
    ctx.fillStyle = "#000000";
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    return canvas.toDataURL("image/png");
  }

  /**
   * 生成 PDF 文件并下载
   * @returns {Promise<void>}
   */
  async generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(); // 默认 A4 纵向

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const { items, fileName, qrSize, textFontSize, textMargin } = this.options;

    for (let i = 0; i < items.length; i++) {
      const { code, url } = items[i];
      if (!code || !url) {
        console.warn(`跳过第 ${i + 1} 项：缺少 code 或 url`);
        continue;
      }

      // 生成二维码图片
      const imgData = this.generateQRCodeDataURL(url);

      // 添加新页（第一页除外）
      if (i > 0) {
        doc.addPage();
      }

      // 计算整体内容高度：二维码高度 + 间距 + 文字高度（近似）
      const textHeightApprox = textFontSize * 0.35; // 毫米近似，1pt ≈ 0.35mm
      const totalHeight = qrSize + textMargin + textHeightApprox;

      // 计算起始 y 坐标，使整体垂直居中
      const startY = (pageHeight - totalHeight) / 2;

      // 二维码水平居中
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = startY;

      // 添加二维码图片
      doc.addImage(imgData, "PNG", qrX, qrY, qrSize, qrSize);

      // 设置文字样式
      doc.setFontSize(textFontSize);

      // 计算文字宽度（用于水平居中）
      const textWidth =
        (doc.getStringUnitWidth(code) * textFontSize) /
        doc.internal.scaleFactor;
      const textX = (pageWidth - textWidth) / 2;
      const textY = qrY + qrSize + textMargin + textHeightApprox / 2; // 文字基线位置

      // 添加编码文字
      doc.text(code, textX, textY);
    }

    // 保存 PDF
    doc.save(fileName);
  }

  /**
   * 显示消息（可自定义，目前仅输出到控制台）
   * @param {string} message 消息内容
   * @param {string} type 类型：info/success/error
   */
  showMessage(message, type = "info") {
    console.log(`[${type.toUpperCase()}]`, message);
    // 如果有全局提示组件，可在此调用，例如：
    // if (typeof $NG !== 'undefined' && $NG.message) {
    //   $NG.message(message, type);
    // }
  }
}

// 全局暴露
if (typeof window !== "undefined") {
  window.BatchQRCodePDFExporter = BatchQRCodePDFExporter;
}
