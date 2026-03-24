/**
 * 批量文件转PNG转换器 - 支持PDF、图片、Word等多种文件格式处理
 * 优化：修正图片和PDF的旋转问题，保持原始尺寸和比例
 */
class BatchPDFToPNGConverter {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   * @param {Array} options.dataList 数据列表
   * @param {string} options.logo 水印
   * @param {string} options.baseUrl 基础URL
   * @param {number} options.scale PDF渲染缩放比例（默认2.0）
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

      this.showProgress(0, this.options.dataList.length);
      await this.loadPDFJSIfNeeded();

      for (let i = 0; i < this.options.dataList.length; i++) {
        this.currentIndex = i;
        await this.processSingleDocument(this.options.dataList[i], i);
      }

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

      const url = this.buildSingleFileUrl(item);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      const blob = await response.blob();
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
      case "pdf":
        await this.convertSinglePDF(blob, item);
        break;
      case "zip":
        await this.handleZipFile(blob, item);
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
        if (await this.isPdfByContent(blob)) {
          await this.convertSinglePDF(blob, item);
        } else {
          throw new Error(`不支持的文件类型: ${blob.type || "unknown"}`);
        }
    }
  }

  /**
   * 获取文件类型（简化MIME与扩展名判断）
   */
  getFileType(blob) {
    const mimeType = blob.type.toLowerCase();
    const fileName = blob.name ? blob.name.toLowerCase() : "";

    if (mimeType.includes("pdf") || fileName.includes(".pdf")) return "pdf";
    if (mimeType.includes("zip") || fileName.includes(".zip")) return "zip";
    if (mimeType.startsWith("image/")) return "image";
    if (
      mimeType.includes("word") ||
      mimeType.includes("doc") ||
      fileName.includes(".doc") ||
      fileName.includes(".docx")
    )
      return "word";
    if (
      mimeType.includes("powerpoint") ||
      mimeType.includes("ppt") ||
      fileName.includes(".ppt") ||
      fileName.includes(".pptx")
    )
      return "powerpoint";
    if (
      mimeType.includes("excel") ||
      mimeType.includes("xls") ||
      fileName.includes(".xls") ||
      fileName.includes(".xlsx")
    )
      return "excel";

    return "unknown";
  }

  /**
   * 构建下载URL（保持原有逻辑）
   */
  buildSingleFileUrl(item) {
    const encodedLogo = encodeURIComponent(this.options.logo);
    const phId = item.u_cert_name_level || "";
    const asrFid = item.u_zswj || "";
    return (
      `${this.options.baseUrl}/prp-gateway/downLoadFileV2?` +
      `tableName=p_form_certificate_reg_m&phId=${phId}&logo=${encodedLogo}&` +
      `filesName=${encodeURIComponent(item.u_zwmc || "资质证书")}&asrFid=${asrFid}`
    );
  }

  // ===================== 图片处理（含EXIF方向矫正） =====================
  /**
   * 转换图片为PNG（自动处理EXIF旋转）
   */
  async convertImageToPNG(blob, item) {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. 读取EXIF方向信息
        const orientation = await this.getExifOrientation(blob);
        const img = new Image();
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          // 2. 根据方向创建canvas并正确绘制
          const { canvas, width, height } = this.getRotatedCanvas(
            img,
            orientation,
          );
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
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 从图片Blob中读取EXIF方向值（1-8），返回0表示无需旋转
   */
  async getExifOrientation(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const view = new DataView(e.target.result);
        // JPEG文件以 0xFFD8 开头
        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(0);
          return;
        }
        let offset = 2;
        let marker;
        while (offset < view.byteLength) {
          marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xffe1) {
            // APP1段（EXIF）
            const length = view.getUint16(offset, false);
            if (length > 2) {
              let exifStart = offset + 2;
              // 检查是否为EXIF头 "Exif\0\0"
              if (
                view.getUint32(exifStart, false) === 0x45786966 &&
                view.getUint16(exifStart + 4, false) === 0x0000
              ) {
                const tiffOffset = exifStart + 6;
                const byteOrder = view.getUint16(tiffOffset, false);
                let getUint16, getUint32;
                if (byteOrder === 0x4949) {
                  // 小端序
                  getUint16 = (offset) => view.getUint16(offset, true);
                  getUint32 = (offset) => view.getUint32(offset, true);
                } else if (byteOrder === 0x4d4d) {
                  // 大端序
                  getUint16 = (offset) => view.getUint16(offset, false);
                  getUint32 = (offset) => view.getUint32(offset, false);
                } else {
                  resolve(0);
                  return;
                }

                const ifdOffset = getUint32(tiffOffset + 4);
                const entryCount = getUint16(tiffOffset + ifdOffset);
                for (let i = 0; i < entryCount; i++) {
                  const entryOffset = tiffOffset + ifdOffset + 2 + i * 12;
                  const tag = getUint16(entryOffset);
                  if (tag === 0x0112) {
                    // Orientation标签
                    const orientation = getUint16(entryOffset + 8);
                    resolve(orientation);
                    return;
                  }
                }
              }
            }
            break;
          }
          offset += view.getUint16(offset, false);
        }
        resolve(0);
      };
      reader.onerror = () => resolve(0);
      // 只读取前64KB足够找到EXIF
      reader.readAsArrayBuffer(blob.slice(0, 64 * 1024));
    });
  }

  /**
   * 根据EXIF方向返回一个已经旋转/翻转后的canvas，并保持原始宽高比
   * @param {HTMLImageElement} img 原始图片对象
   * @param {number} orientation EXIF方向值(1-8)
   * @returns {Object} { canvas, width, height }
   */
  getRotatedCanvas(img, orientation) {
    const { naturalWidth, naturalHeight } = img;
    let width = naturalWidth;
    let height = naturalHeight;
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    // 根据方向决定最终画布的宽高和变换
    switch (orientation) {
      case 2: // 水平翻转
        canvas.width = width;
        canvas.height = height;
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        break;
      case 3: // 旋转180度
        canvas.width = width;
        canvas.height = height;
        ctx.translate(width, height);
        ctx.rotate(Math.PI);
        ctx.drawImage(img, 0, 0);
        break;
      case 4: // 垂直翻转
        canvas.width = width;
        canvas.height = height;
        ctx.translate(0, height);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0);
        break;
      case 5: // 旋转90度并水平翻转
        canvas.width = height;
        canvas.height = width;
        ctx.translate(height, 0);
        ctx.rotate(Math.PI / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        break;
      case 6: // 顺时针旋转90度
        canvas.width = height;
        canvas.height = width;
        ctx.translate(height, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, 0);
        break;
      case 7: // 旋转90度并垂直翻转
        canvas.width = height;
        canvas.height = width;
        ctx.translate(0, width);
        ctx.rotate(-Math.PI / 2);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0);
        break;
      case 8: // 逆时针旋转90度
        canvas.width = height;
        canvas.height = width;
        ctx.translate(0, width);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(img, 0, 0);
        break;
      default: // 方向1或未识别，不做变换
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        break;
    }

    // 恢复变换（可选，不影响后续使用）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return { canvas, width: canvas.width, height: canvas.height };
  }

  // ===================== PDF处理（确保页面方向正确） =====================
  /**
   * 转换单个PDF
   */
  async convertSinglePDF(blob, item) {
    const arrayBuffer = await this.blobToArrayBuffer(blob);
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const baseFilename = item.u_zwmc || "资质证书";
    const cleanName = this.cleanFilename(baseFilename);

    // 遍历每一页
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      // 显式获取页面旋转角度（某些PDF可能包含旋转，默认viewport会应用，但显式传递更可靠）
      const rotation = page.rotate || 0;
      const viewport = page.getViewport({
        scale: this.options.scale,
        rotation: rotation, // 明确应用页面自身的旋转角度
      });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");

      await page.render({ canvasContext: context, viewport }).promise;

      const pngDataUrl = canvas.toDataURL("image/png");
      const filename = `${cleanName}_${item.u_cert_name_level || "doc"}_page_${pageNum}.png`;
      this.downloadFile(pngDataUrl, filename);
    }
  }

  // ===================== 辅助方法 =====================
  async blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Blob读取失败"));
      reader.readAsArrayBuffer(blob);
    });
  }

  async loadPDFJSIfNeeded() {
    const hasPdfFiles = this.options.dataList.some((item) => {
      const fileName = item.u_zwmc || "";
      return fileName.toLowerCase().includes(".pdf");
    });

    if (hasPdfFiles) {
      await this.loadPDFJS();
    }
  }

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
      script.onerror = () => reject(new Error("PDF.js加载失败"));
      document.head.appendChild(script);
    });
  }

  cleanFilename(filename) {
    return filename.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, "_") || "document";
  }

  downloadFile(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }

  showProgress(current, total, message = "") {
    console.log(
      `进度: ${current}/${total} (${this.successCount}成功, ${this.failCount}失败)`,
      message,
    );
    // 可自定义UI提示
  }

  showResult() {
    const resultText = `下载完成！成功: ${this.successCount}个，失败: ${this.failCount}个`;
    console.log(resultText);
    if (typeof $NG !== "undefined" && $NG.message) {
      $NG.message(resultText, this.failCount === 0 ? "success" : "warning");
    }
  }

  showError(message) {
    console.error("错误:", message);
    if (typeof $NG !== "undefined" && $NG.message) {
      $NG.message("下载失败: " + message, "error");
    }
  }

  async handleZipFile(blob, item) {
    console.warn("ZIP文件处理功能需要额外的库支持（如JSZip）");
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

  async isPdfByContent(blob) {
    try {
      const arrayBuffer = await this.blobToArrayBuffer(blob.slice(0, 1024));
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = "%PDF-";
      for (let i = 0; i < pdfHeader.length; i++) {
        if (uint8Array[i] !== pdfHeader.charCodeAt(i)) return false;
      }
      return true;
    } catch (error) {
      console.error("PDF内容检测失败:", error);
      return false;
    }
  }

  // 占位处理Word、PPT、Excel（保持原有简化逻辑）
  async convertWordToPNG(blob, item) {
    console.warn("Word文档转换功能需要额外的库支持");
    const canvas = this.createPlaceholderCanvas("Word文档", "#4285F4");
    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "Word文档";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "word"}.png`;
    this.downloadFile(pngDataUrl, filename);
  }

  async convertPowerPointToPNG(blob, item) {
    console.warn("PowerPoint转换功能需要额外的库支持");
    const canvas = this.createPlaceholderCanvas("PPT文档", "#DB4437");
    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "PPT文档";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "ppt"}.png`;
    this.downloadFile(pngDataUrl, filename);
  }

  async convertExcelToPNG(blob, item) {
    console.warn("Excel转换功能需要额外的库支持");
    const canvas = this.createPlaceholderCanvas("Excel文档", "#0F9D58");
    const pngDataUrl = canvas.toDataURL("image/png");
    const baseFilename = item.u_zwmc || "Excel文档";
    const cleanName = this.cleanFilename(baseFilename);
    const filename = `${cleanName}_${item.u_cert_name_level || "excel"}.png`;
    this.downloadFile(pngDataUrl, filename);
  }

  createPlaceholderCanvas(text, bgColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    context.fillStyle = bgColor;
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "white";
    context.font = "48px Arial";
    context.textAlign = "center";
    context.fillText(text, 400, 300);
    return canvas;
  }
}

// 全局导出
if (typeof window !== "undefined") {
  window.BatchPDFToPNGConverter = BatchPDFToPNGConverter;
}
