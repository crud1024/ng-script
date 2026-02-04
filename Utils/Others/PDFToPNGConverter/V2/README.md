# 批量文件转PNG转换器 V2

## 功能介绍

这是一个增强版的批量文件转换工具，支持将多种格式的文件转换为PNG图片格式。

### 支持的文件格式

- **PDF文件** - 转换每一页为单独的PNG图片
- **图片文件** - JPG、PNG、GIF、BMP等格式转换为PNG
- **Word文档** - DOC、DOCX格式（简化处理）
- **PPT文档** - PPT、PPTX格式（简化处理）  
- **Excel文档** - XLS、XLSX格式（简化处理）

### 主要特性

- 🔄 批量处理多个文件
- 🎯 自动识别文件类型
- 💾 支持自定义水印
- 📊 实时进度显示
- 🌐 基于浏览器的客户端处理
- ⚡ 智能库加载（按需加载PDF.js）

## 使用方法

### 基本用法

```javascript
// 创建转换器实例
const converter = new BatchPDFToPNGConverter({
    dataList: [
        {
            u_cert_name_level: "文件ID",
            u_zwmc: "文件名.pdf", 
            u_zswj: "文件标识"
        }
    ],
    logo: "水印文字",
    baseUrl: "https://your-domain.com",
    scale: 2.0  // PDF渲染缩放比例
});
```

### 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dataList` | Array | `[]` | 待转换的文件数据列表 |
| `logo` | String | `""` | 水印文字 |
| `baseUrl` | String | `window.location.origin` | 基础URL |
| `scale` | Number | `2.0` | PDF渲染缩放比例 |

### 数据格式

每个数据项应包含以下字段：

```javascript
{
    u_cert_name_level: "唯一标识符",  // 必填
    u_zwmc: "文件名",               // 必填
    u_zswj: "文件关联ID"            // 必填
}
```

## 文件类型处理说明

### PDF文件
- 使用PDF.js库进行解析
- 每页生成一张PNG图片
- 支持自定义渲染质量

### 图片文件
- 直接转换为PNG格式
- 保持原始尺寸
- 支持常见图片格式

### Office文档
- Word/PPT/Excel文档生成占位图片
- 显示文档类型标识
- 如需完整转换，建议集成专业转换库

## 错误处理

转换过程中会自动处理以下情况：

- ❌ 文件下载失败
- ❌ 不支持的文件格式
- ❌ PDF.js库加载失败
- ❌ 文件读取错误

所有错误都会在控制台显示详细信息。

## 使用示例

请查看 [example.html](./example.html) 文件获取完整的使用示例。

## 注意事项

1. **浏览器兼容性**：需要现代浏览器支持Canvas和Fetch API
2. **文件大小限制**：大文件可能影响性能
3. **Office文档**：当前版本对Office文档的处理较为简化
4. **网络请求**：需要能够访问指定的文件URL

## 更新日志

### V2.0 增强版
- ✅ 新增多格式文件支持（图片、Word、PPT、Excel）
- ✅ 智能文件类型识别
- ✅ 按需加载PDF.js库
- ✅ 改进的错误处理机制
- ✅ 更友好的用户反馈

### V1.0 基础版
- ✅ 基础PDF转PNG功能
- ✅ 批量处理支持
- ✅ 进度显示功能