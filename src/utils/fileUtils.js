// 从HTML字符串中提取CSS内容
export const extractCSS = (htmlContent) => {
  const cssRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  let cssContent = '';
  
  while ((match = cssRegex.exec(htmlContent)) !== null) {
    cssContent += match[1] + '\n';
  }
  
  return cssContent.trim();
};

// 从HTML字符串中提取JavaScript内容
export const extractJS = (htmlContent) => {
  const jsRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let jsContent = '';
  
  while ((match = jsRegex.exec(htmlContent)) !== null) {
    // 排除带有src属性的script标签
    const scriptTag = match[0];
    if (!scriptTag.includes('src=')) {
      jsContent += match[1] + '\n';
    }
  }
  
  return jsContent.trim();
};

// 从HTML字符串中提取HTML内容（移除CSS和JS）
export const extractHTML = (htmlContent) => {
  // 移除style标签及其内容
  let result = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 移除不带src属性的script标签及其内容
  result = result.replace(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi, '');
  
  return result.trim();
};

// 将HTML、CSS和JS合并成一个HTML文件
export const mergeToHTML = (htmlContent, cssContent, jsContent) => {
  // 检查HTML是否包含head和body标签
  const hasHead = /<head[^>]*>[\s\S]*?<\/head>/i.test(htmlContent);
  const hasBody = /<body[^>]*>[\s\S]*?<\/body>/i.test(htmlContent);
  
  let result = htmlContent;
  
  // 如果没有完整的HTML结构，创建一个
  if (!hasHead && !hasBody) {
    result = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>合并的HTML文档</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }
  
  // 添加CSS到head标签
  if (cssContent) {
    if (hasHead) {
      result = result.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
    } else {
      result = result.replace('<head>', `<head>\n<style>\n${cssContent}\n</style>`);
    }
  }
  
  // 添加JS到body标签结束前
  if (jsContent) {
    if (hasBody) {
      result = result.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
    } else {
      result = result.replace('</html>', `<script>\n${jsContent}\n</script>\n</html>`);
    }
  }
  
  return result;
};

// 下载单个文件
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 下载多个文件为ZIP
export const downloadAsZip = async (files, zipName) => {
  try {
    // 动态导入JSZip，避免初始化时的错误
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // 添加文件到zip
    files.forEach(file => {
      zip.file(file.filename, file.content);
    });
    
    // 生成zip并下载
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载ZIP文件失败:', error);
    // 如果ZIP下载失败，尝试单独下载每个文件
    for (const file of files) {
      downloadFile(file.content, file.filename);
    }
  }
};

// 解析HTML文档结构
export const parseHTMLStructure = (htmlContent) => {
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  return {
    doctype: doc.doctype ? new XMLSerializer().serializeToString(doc.doctype) : '<!DOCTYPE html>',
    html: doc.documentElement.outerHTML
  };
};

// 从HTML中提取外部资源链接
export const extractExternalResources = (htmlContent) => {
  const resources = {
    css: [],
    js: []
  };
  
  // 提取外部CSS链接
  const cssLinkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let cssMatch;
  while ((cssMatch = cssLinkRegex.exec(htmlContent)) !== null) {
    resources.css.push(cssMatch[1]);
  }
  
  // 提取外部JS链接
  const jsScriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  let jsMatch;
  while ((jsMatch = jsScriptRegex.exec(htmlContent)) !== null) {
    resources.js.push(jsMatch[1]);
  }
  
  return resources;
};
