const fs = require('fs');
const path = require('path');

// 获取当前目录（Components 目录）
const currentDir = __dirname || path.dirname(require.main.filename);

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath)
        .filter(file => 
            fs.statSync(path.join(srcPath, file)).isDirectory()
        );
}

function getJSFilesInDir(srcPath) {
    if (!fs.existsSync(srcPath)) {
        return [];
    }
    
    return fs.readdirSync(srcPath)
        .filter(file => 
            !fs.statSync(path.join(srcPath, file)).isDirectory() && 
            path.extname(file) === '.js'
        )
        .map(file => path.join(srcPath, file));
}

function getBestVersionDir(componentDir) {
    const versions = getDirectories(componentDir).filter(v => /^V[1-9]\d*$/.test(v));
    
    if (versions.length === 0) {
        return null;
    }
    
    // 按版本号排序，选择最高版本
    const sortedVersions = versions.sort((a, b) => {
        const verA = parseInt(a.substring(1));
        const verB = parseInt(b.substring(1));
        return verB - verA; // 降序排列，取最大版本
    });
    
    return path.join(componentDir, sortedVersions[0]);
}

function bundleComponents() {
    const componentDirs = getDirectories(currentDir);
    let bundleContent = '';
    
    console.log('开始打包组件...');
    
    for (const componentDir of componentDirs) {
        const componentPath = path.join(currentDir, componentDir);
        const bestVersionPath = getBestVersionDir(componentPath);
        
        if (bestVersionPath) {
            const jsFiles = getJSFilesInDir(bestVersionPath);
            
            for (const jsFile of jsFiles) {
                console.log(`正在添加文件: ${jsFile}`);
                
                try {
                    const fileContent = fs.readFileSync(jsFile, 'utf8');
                    
                    // 添加文件注释标记
                    bundleContent += `\n/*\n * File: ${jsFile}\n */\n`;
                    bundleContent += `${fileContent}\n`;
                } catch (err) {
                    console.error(`读取文件失败 ${jsFile}:`, err);
                }
            }
        }
    }
    
    // 输出到 Components.all.js
    const outputPath = path.join(currentDir, 'Components.all.js');
    fs.writeFileSync(outputPath, bundleContent);
    
    console.log(`打包完成! 输出文件: ${outputPath}`);
    console.log(`总共处理了 ${componentDirs.length} 个组件`);
}

// 运行打包函数
bundleComponents();