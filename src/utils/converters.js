import { extractCSS, extractJS, extractHTML, mergeToHTML } from './fileUtils';

// HTML 拆分为 HTML+CSS+JS
export const splitHTML = (htmlContent) => {
  const cssContent = extractCSS(htmlContent);
  const jsContent = extractJS(htmlContent);
  const cleanedHTML = extractHTML(htmlContent);
  
  // 在清理后的HTML中添加CSS和JS的引用
  let resultHTML = cleanedHTML;
  
  // 如果有head标签，在其中添加CSS引用
  if (/<\/head>/.test(resultHTML)) {
    resultHTML = resultHTML.replace('</head>', '<link rel="stylesheet" href="styles.css">\n</head>');
  } else if (/<html[^>]*>/.test(resultHTML)) {
    resultHTML = resultHTML.replace(/<html([^>]*)>/, '<html$1>\n<head>\n<link rel="stylesheet" href="styles.css">\n</head>');
  }
  
  // 如果有body标签，在其结束前添加JS引用
  if (/<\/body>/.test(resultHTML)) {
    resultHTML = resultHTML.replace('</body>', '<script src="script.js"></script>\n</body>');
  } else if (/<\/html>/.test(resultHTML)) {
    resultHTML = resultHTML.replace('</html>', '<script src="script.js"></script>\n</html>');
  }
  
  return {
    html: resultHTML,
    css: cssContent,
    js: jsContent
  };
};

// HTML+CSS+JS 合并为单个HTML
export const mergeFiles = (htmlContent, cssContent, jsContent) => {
  return mergeToHTML(htmlContent, cssContent, jsContent);
};

// HTML 转换为 Chrome 扩展文件
export const htmlToChromeExtension = (htmlContent) => {
  const { html, css, js } = splitHTML(htmlContent);
  
  // 创建manifest.json
  const manifest = {
    "manifest_version": 3,
    "name": "HTML转换的Chrome扩展",
    "version": "1.0",
    "description": "由HTML转换工具生成的Chrome扩展",
    "action": {
      "default_popup": "popup.html",
      "default_icon": {
        "16": "images/icon16.png",
        "48": "images/icon48.png",
        "128": "images/icon128.png"
      }
    },
    "permissions": []
  };
  
  // 创建popup.html
  const popupHtml = html.replace(/<link rel="stylesheet" href="styles.css">/, '<link rel="stylesheet" href="css/styles.css">')
                        .replace(/<script src="script.js"><\/script>/, '<script src="js/popup.js"></script>');
  
  return {
    "manifest.json": JSON.stringify(manifest, null, 2),
    "popup.html": popupHtml,
    "css/styles.css": css,
    "js/popup.js": js,
    // 添加一个简单的图标占位符说明
    "images/README.txt": "请在此目录放置以下图标文件：\nicon16.png (16x16)\nicon48.png (48x48)\nicon128.png (128x128)"
  };
};

// Chrome 扩展文件转换为 HTML
export const chromeExtensionToHtml = (files) => {
  let htmlContent = files["popup.html"] || "";
  let cssContent = files["css/styles.css"] || "";
  let jsContent = files["js/popup.js"] || "";
  
  return mergeToHTML(htmlContent, cssContent, jsContent);
};

// HTML 转换为微信小程序文件
export const htmlToWechatMiniprogram = (htmlContent) => {
  const { html, css, js } = splitHTML(htmlContent);
  
  // 提取HTML中的内容部分（body内容）
  let bodyContent = "";
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  } else {
    bodyContent = html;
  }
  
  // 转换HTML为WXML
  let wxmlContent = bodyContent
    // 替换class为class
    .replace(/class=/g, 'class=')
    // 替换onclick为bindtap
    .replace(/onclick=/g, 'bindtap=')
    // 替换input的type
    .replace(/<input type="button"/g, '<button')
    .replace(/<\/input>/g, '</button>')
    // 替换a标签为navigator
    .replace(/<a href="([^"]+)"([^>]*)>/g, '<navigator url="$1"$2>')
    .replace(/<\/a>/g, '</navigator>')
    // 替换img标签
    .replace(/<img src="([^"]+)"([^>]*)>/g, '<image src="$1"$2/>')
    // 移除script标签
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
  
  // 转换CSS为WXSS
  let wxssContent = css
    // 替换一些不支持的CSS属性
    .replace(/position:\s*fixed/g, 'position: absolute')
    // 添加一些小程序特有的样式
    .concat('\n\n/* 小程序特有样式 */\npage { width: 100%; height: 100%; }');
  
  // 转换JS为小程序JS
  let jsPageContent = `Page({
  data: {
    // 页面数据
  },
  onLoad: function() {
    // 页面加载时执行
  },
  // 自定义方法
  customFunction: function(e) {
    // 自定义函数
  }
});\n`;

  // 尝试从原始JS中提取函数和变量
  const functionMatches = js.match(/function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/g) || [];
  let extractedFunctions = '';
  
  functionMatches.forEach(func => {
    const funcName = func.match(/function\s+(\w+)/)[1];
    extractedFunctions += `  ${funcName}: function(e) {\n    // 从原始代码转换\n    // ${func.replace(/\n/g, '\n    ')}\n  },\n`;
  });
  
  if (extractedFunctions) {
    jsPageContent = jsPageContent.replace('  // 自定义方法\n  customFunction: function(e) {\n    // 自定义函数\n  }', extractedFunctions.slice(0, -2));
  }
  
  // 创建app.json
  const appJson = {
    "pages": [
      "pages/index/index"
    ],
    "window": {
      "backgroundTextStyle": "light",
      "navigationBarBackgroundColor": "#fff",
      "navigationBarTitleText": "HTML转换的小程序",
      "navigationBarTextStyle": "black"
    },
    "style": "v2",
    "sitemapLocation": "sitemap.json"
  };
  
  // 创建project.config.json
  const projectConfigJson = {
    "description": "项目配置文件",
    "packOptions": {
      "ignore": []
    },
    "setting": {
      "bundle": false,
      "userConfirmedBundleSwitch": false,
      "urlCheck": true,
      "scopeDataCheck": false,
      "coverView": true,
      "es6": true,
      "postcss": true,
      "compileHotReLoad": false,
      "lazyloadPlaceholderEnable": false,
      "preloadBackgroundData": false,
      "minified": true,
      "autoAudits": false,
      "newFeature": false,
      "uglifyFileName": false,
      "uploadWithSourceMap": true,
      "useIsolateContext": true,
      "nodeModules": false,
      "enhance": true,
      "useMultiFrameRuntime": true,
      "useApiHook": true,
      "useApiHostProcess": true,
      "showShadowRootInWxmlPanel": true,
      "packNpmManually": false,
      "packNpmRelationList": [],
      "minifyWXSS": true,
      "showES6CompileOption": false,
      "minifyWXML": true
    },
    "compileType": "miniprogram",
    "libVersion": "2.19.4",
    "appid": "wx123456789",
    "projectname": "HTML转换的小程序",
    "debugOptions": {
      "hidedInDevtools": []
    },
    "scripts": {},
    "staticServerOptions": {
      "baseURL": "",
      "servePath": ""
    },
    "isGameTourist": false,
    "condition": {
      "search": {
        "list": []
      },
      "conversation": {
        "list": []
      },
      "game": {
        "list": []
      },
      "plugin": {
        "list": []
      },
      "gamePlugin": {
        "list": []
      },
      "miniprogram": {
        "list": []
      }
    }
  };
  
  // 创建sitemap.json
  const sitemapJson = {
    "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
    "rules": [{
      "action": "allow",
      "page": "*"
    }]
  };
  
  // 创建app.js
  const appJs = `App({
  onLaunch() {
    // 小程序启动时执行
  },
  globalData: {
    // 全局数据
  }
})`;
  
  // 创建app.wxss
  const appWxss = `/**app.wxss**/
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
} 
`;
  
  return {
    "app.json": JSON.stringify(appJson, null, 2),
    "app.js": appJs,
    "app.wxss": appWxss,
    "project.config.json": JSON.stringify(projectConfigJson, null, 2),
    "sitemap.json": JSON.stringify(sitemapJson, null, 2),
    "pages/index/index.wxml": wxmlContent,
    "pages/index/index.wxss": wxssContent,
    "pages/index/index.js": jsPageContent,
    "pages/index/index.json": JSON.stringify({
      "usingComponents": {},
      "navigationBarTitleText": "首页"
    }, null, 2)
  };
};

// 微信小程序文件转换为 HTML
export const wechatMiniprogramToHtml = (files) => {
  let wxmlContent = files["pages/index/index.wxml"] || "";
  let wxssContent = files["pages/index/index.wxss"] || "";
  let jsContent = files["pages/index/index.js"] || "";
  
  // 转换WXML为HTML
  let htmlContent = wxmlContent
    // 替换navigator为a标签
    .replace(/<navigator url="([^"]+)"([^>]*)>/g, '<a href="$1"$2>')
    .replace(/<\/navigator>/g, '</a>')
    // 替换image标签为img
    .replace(/<image src="([^"]+)"([^>]*)\/>/g, '<img src="$1"$2>')
    // 替换bindtap为onclick
    .replace(/bindtap=/g, 'onclick=');
  
  // 包装成完整的HTML
  htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>从微信小程序转换的HTML</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
  
  // 转换JS
  let convertedJs = "";
  
  // 尝试从Page中提取方法
  const pageMethodsMatch = jsContent.match(/Page\(\{[\s\S]*\}\);/);
  if (pageMethodsMatch) {
    const pageContent = pageMethodsMatch[0];
    
    // 提取方法
    const methodMatches = pageContent.match(/(\w+):\s*function\s*\([^)]*\)\s*\{[\s\S]*?\},/g) || [];
    
    methodMatches.forEach(method => {
      const methodName = method.match(/(\w+):/)[1];
      if (methodName !== 'onLoad' && methodName !== 'onReady' && methodName !== 'onShow') {
        const methodBody = method.match(/\{([\s\S]*)\},$/)[1];
        convertedJs += `function ${methodName}(e) {${methodBody}}\n\n`;
      }
    });
    
    // 提取onLoad方法作为window.onload
    const onLoadMatch = pageContent.match(/onLoad:\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\},/);
    if (onLoadMatch) {
      convertedJs += `window.onload = function() {${onLoadMatch[1]}}\n`;
    }
  }
  
  return mergeToHTML(htmlContent, wxssContent, convertedJs);
};

// HTML 转换为 uTools 插件文件
export const htmlToUtoolsPlugin = (htmlContent) => {
  const { html, css, js } = splitHTML(htmlContent);
  
  // 创建plugin.json
  const pluginJson = {
    "pluginName": "HTML转换的uTools插件",
    "description": "由HTML转换工具生成的uTools插件",
    "main": "index.html",
    "version": "1.0.0",
    "logo": "logo.png",
    "author": "HTML转换工具",
    "preload": "preload.js",
    "features": [
      {
        "code": "html_converter",
        "explain": "HTML转换工具",
        "cmds": ["html转换", "HTML转换"]
      }
    ]
  };
  
  // 创建preload.js
  const preloadJs = `window.exports = {
  "html_converter": {
    mode: "none",
    args: {
      enter: (action) => {
        window.utools.hideMainWindow();
        // 执行进入插件时的逻辑
      }
    }
  }
};`;
  
  return {
    "plugin.json": JSON.stringify(pluginJson, null, 2),
    "preload.js": preloadJs,
    "index.html": html,
    "styles.css": css,
    "script.js": js,
    "README.txt": "请在此目录放置一个名为logo.png的图标文件，尺寸建议为128x128像素。"
  };
};

// uTools 插件文件转换为 HTML
export const utoolsPluginToHtml = (files) => {
  let htmlContent = files["index.html"] || "";
  let cssContent = files["styles.css"] || "";
  let jsContent = files["script.js"] || "";
  
  return mergeToHTML(htmlContent, cssContent, jsContent);
};

// HTML 转换为 Markdown
export const htmlToMarkdown = async (htmlContent) => {
  try {
    // 动态导入TurndownService
    const TurndownService = (await import('turndown')).default;
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    
    // 添加一些自定义规则
    turndownService.addRule('strikethrough', {
      filter: ['del', 's', 'strike'],
      replacement: function (content) {
        return '~~' + content + '~~';
      }
    });
    
    return turndownService.turndown(htmlContent);
  } catch (error) {
    console.error('Markdown转换失败:', error);
    // 简单的HTML到Markdown转换备用方案
    return simpleHtmlToMarkdown(htmlContent);
  }
};

// 简单的HTML到Markdown转换备用方案
const simpleHtmlToMarkdown = (html) => {
  let markdown = html;
  
  // 替换标题
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');
  
  // 替换段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // 替换链接
  markdown = markdown.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // 替换加粗和斜体
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // 替换图片
  markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*>/gi, '![]($1)');
  
  // 替换列表
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, function(match, content) {
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  });
  
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, function(match, content) {
    let index = 1;
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(match, item) {
      return (index++) + '. ' + item + '\n';
    });
  });
  
  // 替换代码块
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');
  
  // 替换内联代码
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // 替换水平线
  markdown = markdown.replace(/<hr[^>]*>/gi, '---\n');
  
  // 替换引用
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, function(match, content) {
    return content.split('\n').map(line => '> ' + line).join('\n');
  });
  
  // 移除HTML标签
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // 处理特殊字符
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&apos;/g, "'");
  
  return markdown.trim();
};

// Markdown 转换为 HTML
export const markdownToHtml = async (markdownContent) => {
  try {
    // 动态导入showdown
    const showdown = (await import('showdown')).default;
    const converter = new showdown.Converter({
      tables: true,
      tasklists: true,
      strikethrough: true,
      emoji: true
    });
    
    const htmlContent = converter.makeHtml(markdownContent);
    return generateHtmlDocument(htmlContent);
  } catch (error) {
    console.error('HTML转换失败:', error);
    // 简单的Markdown到HTML转换备用方案
    return generateHtmlDocument(simpleMarkdownToHtml(markdownContent));
  }
};

// 简单的Markdown到HTML转换备用方案
const simpleMarkdownToHtml = (markdown) => {
  let html = markdown;
  
  // 替换标题
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
  html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
  
  // 替换段落
  html = html.replace(/^([^<#\-\*\d].*?)$/gm, '<p>$1</p>');
  
  // 替换链接
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // 替换加粗和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 替换图片
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
  
  // 替换无序列表
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
  
  // 替换有序列表
  html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n)+/g, '<ol>$&</ol>');
  
  // 替换代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // 替换内联代码
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // 替换水平线
  html = html.replace(/^---$/gm, '<hr>');
  
  // 替换引用
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  return html;
};

// 生成完整的HTML文档
const generateHtmlDocument = (htmlContent) => {
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>从Markdown转换的HTML</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 4px;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    img {
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
};
