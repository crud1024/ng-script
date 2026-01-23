const fs = require("fs");
const path = require("path");

/**
 * 安全地压缩JavaScript代码，避免破坏字符串、正则表达式和模板字符串
 * @param {string} code 源代码
 * @returns {string} 压缩后的代码
 */
function safeMinify(code) {
  let result = "";
  let i = 0;
  const length = code.length;
  let inSingleComment = false;
  let inMultiComment = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateLiteral = false;
  let inRegex = false;
  let lastChar = "";
  let buffer = "";

  /**
   * 安全地添加字符到结果
   */
  const flushBuffer = () => {
    if (buffer.length > 0) {
      // 压缩buffer中的空白字符，但不破坏字符串内容
      result += buffer.replace(/[ \t\n\r]+/g, " ").trim();
      buffer = "";
    }
  };

  while (i < length) {
    const char = code[i];
    const nextChar = code[i + 1] || "";

    // 处理注释状态
    if (!inSingleQuote && !inDoubleQuote && !inTemplateLiteral && !inRegex) {
      if (!inMultiComment && char === "/" && nextChar === "/") {
        inSingleComment = true;
        i += 2;
        continue;
      }

      if (!inSingleComment && char === "/" && nextChar === "*") {
        inMultiComment = true;
        i += 2;
        continue;
      }

      if (inSingleComment && (char === "\n" || char === "\r")) {
        inSingleComment = false;
        // 保留换行符
        result += char;
        i++;
        continue;
      }

      if (inMultiComment && char === "*" && nextChar === "/") {
        inMultiComment = false;
        i += 2;
        continue;
      }
    }

    // 如果在注释中，跳过处理
    if (inSingleComment || inMultiComment) {
      i++;
      continue;
    }

    // 处理字符串和正则表达式
    if (!inSingleComment && !inMultiComment) {
      // 处理单引号字符串
      if (
        char === "'" &&
        lastChar !== "\\" &&
        !inDoubleQuote &&
        !inTemplateLiteral &&
        !inRegex
      ) {
        inSingleQuote = !inSingleQuote;
        flushBuffer();
        result += char;
        i++;
        lastChar = char;
        continue;
      }

      // 处理双引号字符串
      if (
        char === '"' &&
        lastChar !== "\\" &&
        !inSingleQuote &&
        !inTemplateLiteral &&
        !inRegex
      ) {
        inDoubleQuote = !inDoubleQuote;
        flushBuffer();
        result += char;
        i++;
        lastChar = char;
        continue;
      }

      // 处理模板字符串
      if (
        char === "`" &&
        lastChar !== "\\" &&
        !inSingleQuote &&
        !inDoubleQuote &&
        !inRegex
      ) {
        inTemplateLiteral = !inTemplateLiteral;
        flushBuffer();
        result += char;
        i++;
        lastChar = char;
        continue;
      }

      // 处理正则表达式（简化检测）
      if (
        char === "/" &&
        lastChar !== "\\" &&
        !inSingleQuote &&
        !inDoubleQuote &&
        !inTemplateLiteral &&
        [
          "(",
          "[",
          "{",
          "=",
          ":",
          ",",
          ";",
          "?",
          "!",
          "&",
          "|",
          "^",
          "~",
          "+",
          "-",
          "*",
          "%",
          "<",
          ">",
          "\n",
          "\r",
          " ",
          "\t",
        ].includes(lastChar)
      ) {
        inRegex = true;
        flushBuffer();
        result += char;
        i++;
        lastChar = char;
        continue;
      }

      if (inRegex && char === "/" && lastChar !== "\\") {
        inRegex = false;
        result += char;
        i++;
        lastChar = char;
        continue;
      }
    }

    // 如果在字符串、正则或模板字符串中，直接添加字符
    if (inSingleQuote || inDoubleQuote || inTemplateLiteral || inRegex) {
      result += char;
      i++;
      lastChar = char;
      continue;
    }

    // 处理普通代码
    if ([" ", "\t", "\n", "\r"].includes(char)) {
      buffer += " "; // 用单个空格替换空白字符
    } else {
      flushBuffer();
      result += char;
    }

    lastChar = char;
    i++;
  }

  // 清空buffer
  flushBuffer();

  // 移除连续的空白字符
  result = result.replace(/[ \t\n\r]+/g, " ");

  // 移除不必要的分号后空白
  result = result.replace(/; /g, ";");

  // 移除逗号后空白
  result = result.replace(/, /g, ",");

  // 移除运算符周围的空白
  result = result.replace(/\s*([=+*\/%&|^<>!-]+)\s*/g, "$1");

  return result.trim();
}

/**
 * 主函数
 */
async function main() {
  // 使用绝对路径
  const sourcePath = path.resolve(process.cwd(), "./Components.all.js");
  const destPath = path.resolve(process.cwd(), "./Components.all.osd.min.js");

  try {
    console.log(`正在读取文件: ${sourcePath}`);

    // 检查文件是否存在
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`源文件不存在: ${sourcePath}`);
    }

    // 获取文件信息
    const stats = fs.statSync(sourcePath);
    console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

    // 读取文件
    const content = fs.readFileSync(sourcePath, "utf8");
    console.log("文件读取成功，开始压缩...");

    // 使用安全的压缩方法
    const startTime = Date.now();
    const minifiedContent = safeMinify(content);
    const endTime = Date.now();

    console.log(`压缩完成，耗时: ${endTime - startTime}ms`);
    console.log(`压缩前: ${content.length} 字符`);
    console.log(`压缩后: ${minifiedContent.length} 字符`);
    console.log(
      `压缩率: ${((1 - minifiedContent.length / content.length) * 100).toFixed(2)}%`,
    );

    // 写入目标文件
    fs.writeFileSync(destPath, minifiedContent, "utf8");
    console.log(`成功压缩并保存到: ${destPath}`);
  } catch (error) {
    console.error("处理过程中发生错误:");
    console.error("错误信息:", error.message);
    console.error("错误堆栈:", error.stack);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { safeMinify };
