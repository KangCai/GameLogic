const fs = require('fs');
const path = require('path');

// 需要复制的文件列表
const filesToCopy = [
  'index.html',
  'images2spritesheet.html',
  'image-processor.html',
  'style.css',
  'script.js',
  'jszip.min.js',
  'icon.png'
];

// 目标目录
const distDir = path.join(__dirname, 'dist');

// 创建 dist 目录（如果不存在）
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 复制文件
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ 已复制: ${file}`);
  } else {
    console.warn(`⚠ 文件不存在: ${file}`);
  }
});

console.log('\n✅ 构建完成！文件已输出到 dist 目录');

