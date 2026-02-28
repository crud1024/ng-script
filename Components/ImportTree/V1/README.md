# ImportTree Data Import Component

## Overview

The ImportTree component is a specialized data import utility that enables users to import Excel/CSV data and automatically generate hierarchical tree structures. This component provides an intuitive interface for mapping spreadsheet columns to grid fields and configuring tree hierarchy parameters.

**Maintainer**: Carl (Wang Zhifeng)  
**Email**: crud1024@163.com  
**Department**: Owner Business Unit

## Component Information

- **Component Name**: NewTreeStructureGenerator
- **File**: ImportTreeData.js
- **Namespace**: Available through `$NG.registerComponent`
- **Module Export**: ImportTreeData (note: potential naming inconsistency in source)

## Quick Start Guide

### Basic Usage

The component automatically initializes when the DOM is ready and binds to buttons matching the configured selector:

```javascript
// Component automatically initializes with default settings
// No manual instantiation required in typical usage
```

### Manual Initialization

```javascript
// If you need custom configuration
const importTree = new NewTreeStructureGenerator({
  buttonSelector: '[originid="u_init_tree"]',
  gridId: "inv_budget_d2",
});
```

### Component Access

Through the NG framework component registry:

```javascript
// The component is registered with $NG framework
$NG.registerComponent("ImportTreeData", ImportTreeData);
```

For module systems:

```javascript
const ImportTreeData = require("./ImportTreeData.js");
const importTree = new ImportTreeData(options);
```

## Features

### Core Functionality

- **Multi-format Support**: Imports `.xls`, `.xlsx`, and `.csv` file formats
- **Interactive Field Mapping**: Drag-and-drop style mapping interface for column assignments
- **Smart Tree Generation**: Automatically creates parent-child relationships based on hierarchy paths
- **Real-time Validation**: Validates required fields and data integrity during import
- **External Library Management**: Automatically loads SheetJS library when needed

### Supported Data Operations

- Text field processing (Input components)
- Numeric field handling (InputNumber components)
- Hierarchical data structure creation
- Display name field support (EXName fields)
- Special value parsing with pipe-separated formats

## API Reference

### Constructor Options

| Option           | Type   | Default                      | Description                      |
| ---------------- | ------ | ---------------------------- | -------------------------------- |
| `buttonSelector` | string | `'[originid="u_init_tree"]'` | CSS selector for trigger buttons |
| `sheetJSUrl`     | string | CDN URL for xlsx@0.18.5      | External SheetJS library source  |
| `gridId`         | string | `'inv_budget_d2'`            | Target grid component identifier |
| `gridColumns`    | array  | DEFAULT_GRID_COLUMNS         | Custom grid column definitions   |

### Class Methods

#### `constructor(options = {})`

Initializes the ImportTree component with configuration options.

#### `async init()`

Handles initialization timing based on document ready state.

#### `async initializeGenerator()`

Performs core initialization including grid column setup and button binding.

#### `setGridColumns()`

Configures grid column mappings and builds field definitions.

#### `bindInitTreeButton()`

Attaches event listeners to trigger buttons.

#### `loadSheetJS(callback)`

Dynamically loads the SheetJS library if not already present.

#### `showAlert(message)`

Displays user notifications through $NG.alert or native alert.

## Configuration Details

### Default Grid Columns

The component includes a comprehensive default column configuration for budget/d2 grids:

```javascript
const DEFAULT_GRID_COLUMNS = [
  {
    xtype: "rownumberer",
    width: 45,
    header: "序号",
  },
  {
    filter: true,
    editor: {
      xtype: "Input",
      name: "s_tree_no",
      label: "子项目编码",
      maxLength: 100,
    },
    dataIndex: "s_tree_no",
    header: "子项目编码",
  },
  // ... additional columns for expense codes, names, costs, etc.
];
```

### Field Mapping Logic

The component automatically identifies mappable fields from grid configurations:

```javascript
// Auto-detected field mapping structure
{
    "fieldName": {
        "dataIndex": "corresponding_data_index",
        "label": "Display Label",
        "fieldType": "Input|InputNumber",
        "required": boolean,
        "maxLength": number,
        "hidden": boolean
    }
}
```

### EXName Field Support

Automatically generates display name fields for reference data:

```javascript
// For fields like s_person, s_dept, s_supplier, etc.
// Automatically creates corresponding _EXName fields
"s_person" -> "s_person_EXName"
"s_dept" -> "s_dept_EXName"
```

## Usage Examples

### Standard Implementation

```html
<!-- Trigger Button -->
<button originid="u_init_tree">导入树形数据</button>

<script>
  // Component auto-initializes when DOM is ready
  // Button click automatically triggers import workflow
</script>
```

### Custom Button Selector

```javascript
const customImportTree = new NewTreeStructureGenerator({
  buttonSelector: '[data-action="import-hierarchy"]',
  gridId: "project_structure_grid",
});
```

### Custom Grid Configuration

```javascript
const importTree = new NewTreeStructureGenerator({
  gridColumns: [
    {
      editor: {
        xtype: "Input",
        name: "custom_field",
        label: "Custom Field",
      },
      dataIndex: "custom_field",
      header: "Custom Field",
    },
    // ... additional custom columns
  ],
});
```

### Value Format Processing

The component supports multiple value formats:

```javascript
// Simple values
"value";

// Values with display text (pipe-separated)
"value|Display Text";

// Complex values with sub-values (triple pipe-separated)
"main_value|sub_value|Display Text";
```

## User Interface

### Import Dialog Components

The import workflow presents a modal dialog containing:

1. **Field Mapping Section**
   - Two-column responsive layout
   - Dropdown selectors for each mappable field
   - Visual indicators for required fields (\*)
   - Real-time validation feedback

2. **Hierarchy Configuration**
   - Level field selection dropdown
   - Separator character input (defaults to ".")
   - Clear labeling and instructions

3. **Control Buttons**
   - Cancel button to abort import
   - Confirm button to process import
   - Disabled states during processing

### Visual Design Elements

- **Color Scheme**: Blue (#1890ff) primary actions, red (#ff4d4f) for required fields
- **Layout**: Responsive flexbox design with appropriate spacing
- **Feedback**: Hover states, focus indicators, and loading states
- **Accessibility**: Proper contrast ratios and keyboard navigation support

## Technical Requirements

### Dependencies

- **SheetJS Library**: Loaded dynamically from CDN (`xlsx@0.18.5`)
- **NG Framework**: Required for component registration and grid integration
- **Modern JavaScript**: ES6+ features (async/await, arrow functions, etc.)

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Modern mobile browsers

### Performance Considerations

- Recommended maximum file size: 10MB
- Optimal column count: Under 50 columns
- Efficient processing of up to 10,000 rows
- Memory management for large file operations

## Error Handling

### Common Error Scenarios

1. **File Processing Errors**

   ```
   - "文件内容为空或格式不正确" (Empty or invalid file format)
   - "解析 Excel 文件失败" (Excel parsing failed)
   - "读取文件失败" (File reading failed)
   ```

2. **Data Validation Errors**

   ```
   - "请配置必填字段" (Required fields not configured)
   - "未找到层级字段" (Hierarchy field not found)
   - "请填写完整的层级配置信息" (Incomplete hierarchy configuration)
   ```

3. **Integration Errors**
   ```
   - "未找到明细网格组件" (Target grid component not found)
   - "导入失败" (Import operation failed)
   ```

### Debugging Features

```javascript
// Console logging for troubleshooting
console.log("NewTreeStructureGenerator 初始化完成");

// Error object inspection
console.error("初始化失败:", error);
```

## Best Practices

### Data Preparation Guidelines

1. **File Structure**
   - First row should contain column headers
   - Consistent data formatting throughout
   - Proper hierarchy path construction

2. **Hierarchy Path Format**

   ```
   Level 1: "Root"
   Level 2: "Root.Child"
   Level 3: "Root.Child.Grandchild"
   ```

3. **Field Requirements**
   - Identify required fields beforehand
   - Prepare clean, validated data
   - Test with sample files first

### Implementation Recommendations

1. **Performance Optimization**
   - Process large files in smaller batches
   - Validate data before import when possible
   - Provide user feedback during long operations

2. **User Experience**
   - Supply template files with proper formatting
   - Include clear instructions for hierarchy setup
   - Implement undo/rollback capabilities

3. **Error Recovery**
   - Log detailed error information
   - Provide actionable error messages
   - Maintain data state during failures

## Troubleshooting Guide

### Common Issues and Solutions

1. **Button Not Responding**

   ```javascript
   // Verify button exists and selector matches
   console.log(document.querySelectorAll('[originid="u_init_tree"]'));

   // Check component initialization
   console.log("Component initialized:", importTree.isInitialized);
   ```

2. **Grid Integration Problems**

   ```javascript
   // Verify grid component exists
   const grid = $NG.getCmpApi("inv_budget_d2");
   console.log("Grid found:", !!grid);
   ```

3. **Field Mapping Issues**

   ```javascript
   // Check available mappable fields
   console.log("Mappable fields:", importTree.getMappableFields());
   ```

4. **Library Loading Failures**
   ```javascript
   // Verify SheetJS availability
   console.log("XLSX available:", typeof XLSX !== "undefined");
   ```

## Version Information

### Current Version: V1

- Initial implementation
- Core import functionality
- Basic field mapping
- Tree structure generation
- Grid integration

### Planned Enhancements

- Batch processing capabilities
- Advanced validation rules
- Template management
- Import history tracking

## Support and Maintenance

**Primary Contact**: Carl (Wang Zhifeng)  
**Email**: crud1024@163.com  
**Department**: Owner Business Unit

### Reporting Issues

When reporting problems, please include:

- Component version information
- Browser and operating system details
- Sample data file (if applicable)
- Console error messages
- Steps to reproduce the issue

## License Information

This component is part of the internal component library and is intended for authorized organizational use only.

## Detailed Usage Examples

### Example 1: Basic Project Budget Import

This example demonstrates importing a simple project budget structure with hierarchical cost centers.

**Sample Excel Data:**

```csv
层级路径,项目编码,项目名称,预算金额,负责人
一级部门,PROJ001,基础设施建设,1000000,张三
一级部门.二级部门,PROJ002,软件开发,500000,李四
一级部门.二级部门.三级组,PROJ003,前端开发,200000,王五
一级部门.二级部门.三级组,PROJ004,后端开发,300000,赵六
```

**Implementation:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Project Budget Import</title>
  </head>
  <body>
    <div class="toolbar">
      <button originid="u_init_tree" class="btn-primary">
        导入项目预算数据
      </button>
    </div>

    <div id="budget-grid"></div>

    <script>
      // The component will automatically initialize
      // Clicking the button will trigger the import dialog

      // Optional: Custom configuration
      const budgetImporter = new NewTreeStructureGenerator({
        buttonSelector: '[originid="u_init_tree"]',
        gridId: "budget-grid",
        gridColumns: [
          {
            editor: {
              xtype: "Input",
              name: "project_code",
              label: "项目编码",
              maxLength: 20,
            },
            dataIndex: "project_code",
            header: "项目编码",
          },
          {
            editor: {
              xtype: "Input",
              name: "project_name",
              label: "项目名称",
              maxLength: 100,
            },
            dataIndex: "project_name",
            header: "项目名称",
          },
          {
            editor: {
              xtype: "InputNumber",
              name: "budget_amount",
              label: "预算金额",
              precision: 2,
            },
            dataIndex: "budget_amount",
            header: "预算金额",
          },
          {
            editor: {
              xtype: "Input",
              name: "responsible_person",
              label: "负责人",
              maxLength: 50,
            },
            dataIndex: "responsible_person",
            header: "负责人",
          },
        ],
      });
    </script>
  </body>
</html>
```

### Example 2: Organization Structure Import

This example shows importing an organizational hierarchy with department relationships.

**Sample Excel Data:**

```csv
组织路径,部门编码,部门名称,部门负责人,员工数量
总部,ORG001,公司总部,总经理,100
总部.人力资源部,ORG002,人力资源部,人事经理,20
总部.财务部,ORG003,财务部,财务总监,15
总部.技术部,ORG004,技术部,技术总监,50
总部.技术部.前端组,ORG005,前端开发组,前端主管,20
总部.技术部.后端组,ORG006,后端开发组,后端主管,30
```

**Implementation:**

```javascript
// Organization structure importer
const orgStructureImporter = new NewTreeStructureGenerator({
  buttonSelector: '[data-import="organization"]',
  gridId: "org-structure-grid",
  gridColumns: [
    {
      editor: {
        xtype: "Input",
        name: "dept_code",
        label: "部门编码",
        maxLength: 20,
      },
      dataIndex: "dept_code",
      header: "部门编码",
    },
    {
      editor: {
        xtype: "Input",
        name: "dept_name",
        label: "部门名称",
        maxLength: 100,
      },
      dataIndex: "dept_name",
      header: "部门名称",
    },
    {
      editor: {
        xtype: "Input",
        name: "manager",
        label: "部门负责人",
        maxLength: 50,
      },
      dataIndex: "manager",
      header: "部门负责人",
    },
    {
      editor: {
        xtype: "InputNumber",
        name: "employee_count",
        label: "员工数量",
        min: 0,
      },
      dataIndex: "employee_count",
      header: "员工数量",
    },
  ],
});

// HTML template
/*
<button data-import="organization" class="btn-secondary">
    导入组织架构
</button>
*/
```

### Example 3: Product Category Hierarchy

This example demonstrates importing a product category tree structure.

**Sample Excel Data:**

```csv
分类路径,分类编码,分类名称,描述,排序号
电子产品,ELEC001,电子产品,,1
电子产品.手机,ELEC002,手机,智能手机分类,1
电子产品.手机.安卓手机,ELEC003,安卓手机,,1
电子产品.手机.iOS手机,ELEC004,iOS手机,,2
电子产品.电脑,ELEC005,电脑,,2
家居用品,HOME001,家居用品,,2
家居用品.家具,HOME002,家具,,1
```

**Advanced Implementation:**

```javascript
class ProductCategoryImporter extends NewTreeStructureGenerator {
  constructor(options = {}) {
    super({
      buttonSelector: '[data-import="categories"]',
      gridId: "product-category-grid",
      ...options,
    });

    // Add custom validation
    this.customValidators = {
      categoryCode: (value) => /^[A-Z0-9]{6}$/.test(value),
      sortOrder: (value) => !isNaN(value) && value >= 0,
    };
  }

  // Override field processing for custom logic
  processFieldValue(fieldName, rawValue) {
    const result = super.processFieldValue(fieldName, rawValue);

    // Add custom processing
    if (fieldName === "category_code") {
      result[fieldName] = result[fieldName].toUpperCase();
    }

    return result;
  }

  // Add batch processing capability
  async importBatchData(fileList) {
    for (const file of fileList) {
      await this.processSingleFile(file);
    }
  }
}

// Usage
const categoryImporter = new ProductCategoryImporter({
  gridColumns: [
    {
      editor: {
        xtype: "Input",
        name: "category_code",
        label: "分类编码",
        maxLength: 20,
        required: true,
      },
      dataIndex: "category_code",
      header: "分类编码",
    },
    {
      editor: {
        xtype: "Input",
        name: "category_name",
        label: "分类名称",
        maxLength: 100,
        required: true,
      },
      dataIndex: "category_name",
      header: "分类名称",
    },
    {
      editor: {
        xtype: "Input",
        name: "description",
        label: "描述",
        maxLength: 500,
      },
      dataIndex: "description",
      header: "描述",
    },
    {
      editor: {
        xtype: "InputNumber",
        name: "sort_order",
        label: "排序号",
        min: 0,
      },
      dataIndex: "sort_order",
      header: "排序号",
    },
  ],
});
```

### Example 4: Multi-language Content Import

This example shows handling multi-language content with EXName support.

**Sample Excel Data:**

```csv
层级路径,内容ID,中文标题,英文标题,创建人,状态
首页内容,CNT001,欢迎页面,Welcome Page,admin,active
首页内容.产品介绍,CNT002,产品展示,Product Showcase,admin,active
首页内容.关于我们,CNT003,公司简介,About Us,admin,active
```

**Implementation with EXName Support:**

```javascript
const contentImporter = new NewTreeStructureGenerator({
  buttonSelector: '[data-import="content"]',
  gridId: "content-management-grid",
  gridColumns: [
    {
      editor: {
        xtype: "Input",
        name: "content_id",
        label: "内容ID",
        maxLength: 20,
      },
      dataIndex: "content_id",
      header: "内容ID",
    },
    {
      editor: {
        xtype: "Input",
        name: "title_zh",
        label: "中文标题",
        maxLength: 200,
      },
      dataIndex: "title_zh",
      header: "中文标题",
    },
    {
      editor: {
        xtype: "Input",
        name: "title_en",
        label: "英文标题",
        maxLength: 200,
      },
      dataIndex: "title_en",
      header: "英文标题",
    },
    {
      editor: {
        xtype: "Input",
        name: "created_by",
        label: "创建人",
        maxLength: 50,
      },
      dataIndex: "created_by",
      header: "创建人",
    },
    {
      editor: {
        xtype: "Input",
        name: "status",
        label: "状态",
        maxLength: 20,
      },
      dataIndex: "status",
      header: "状态",
    },
  ],
});

// The component automatically handles EXName fields for reference data
// Fields like created_by will automatically get created_by_EXName support
```

### Example 5: Complex Financial Data Import

This example demonstrates importing complex financial data with calculations.

**Sample Excel Data:**

```csv
科目路径,科目编码,科目名称,期初余额,本期借方,本期贷方,期末余额,科目类型
资产类,ASSET001,流动资产,,0,0,,资产
资产类.现金,ASSET002,库存现金,100000,50000,30000,,资产
资产类.银行存款,ASSET003,银行存款,500000,200000,150000,,资产
负债类,LIAB001,流动负债,,0,0,,负债
负债类.应付账款,LIAB002,应付账款,200000,100000,80000,,负债
```

**Advanced Financial Implementation:**

```javascript
class FinancialDataImporter extends NewTreeStructureGenerator {
  constructor(options = {}) {
    super({
      buttonSelector: '[data-import="financial"]',
      gridId: "financial-data-grid",
      ...options,
    });
  }

  // Override tree data generation for financial calculations
  generateTreeData(data, fieldMappings, levelField, separator) {
    const treeData = super.generateTreeData(
      data,
      fieldMappings,
      levelField,
      separator,
    );

    // Add financial calculations
    this.calculateFinancialBalances(treeData);

    return treeData;
  }

  calculateFinancialBalances(treeData) {
    // Calculate ending balances: Beginning + Debit - Credit
    treeData.forEach((item) => {
      const beginning = parseFloat(item.beginning_balance) || 0;
      const debit = parseFloat(item.debit_amount) || 0;
      const credit = parseFloat(item.credit_amount) || 0;

      item.ending_balance = beginning + debit - credit;
    });

    // Recalculate parent node balances
    this.updateParentBalances(treeData);
  }

  updateParentBalances(treeData) {
    // Implementation for aggregating child balances to parents
    // This would typically involve tree traversal logic
  }
}

// Usage
const financialImporter = new FinancialDataImporter({
  gridColumns: [
    {
      editor: {
        xtype: "Input",
        name: "account_code",
        label: "科目编码",
        maxLength: 20,
      },
      dataIndex: "account_code",
      header: "科目编码",
    },
    {
      editor: {
        xtype: "Input",
        name: "account_name",
        label: "科目名称",
        maxLength: 100,
      },
      dataIndex: "account_name",
      header: "科目名称",
    },
    {
      editor: {
        xtype: "InputNumber",
        name: "beginning_balance",
        label: "期初余额",
        precision: 2,
      },
      dataIndex: "beginning_balance",
      header: "期初余额",
    },
    {
      editor: {
        xtype: "InputNumber",
        name: "debit_amount",
        label: "本期借方",
        precision: 2,
      },
      dataIndex: "debit_amount",
      header: "本期借方",
    },
    {
      editor: {
        xtype: "InputNumber",
        name: "credit_amount",
        label: "本期贷方",
        precision: 2,
      },
      dataIndex: "credit_amount",
      header: "本期贷方",
    },
    {
      editor: {
        xtype: "InputNumber",
        name: "ending_balance",
        label: "期末余额",
        precision: 2,
        readOnly: true,
      },
      dataIndex: "ending_balance",
      header: "期末余额",
    },
    {
      editor: {
        xtype: "Input",
        name: "account_type",
        label: "科目类型",
        maxLength: 20,
      },
      dataIndex: "account_type",
      header: "科目类型",
    },
  ],
});
```

These examples demonstrate the versatility and power of the ImportTree component for handling various hierarchical data import scenarios, from simple organizational structures to complex financial data with custom processing requirements.
