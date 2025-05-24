import React, { useState } from 'react';
import Editor from '../common/Editor';
import ConversionControls from '../common/ConversionControls';
import { htmlToChromeExtension, chromeExtensionToHtml } from '../../utils/converters';
import { downloadAsZip, downloadFile } from '../../utils/fileUtils';
import { toast } from 'react-toastify';

const HtmlToChromeExtension = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [extensionOutput, setExtensionOutput] = useState({});
  const [selectedFile, setSelectedFile] = useState('manifest.json');
  
  const [extensionInput, setExtensionInput] = useState({
    'popup.html': '',
    'css/styles.css': '',
    'js/popup.js': ''
  });
  const [selectedInputFile, setSelectedInputFile] = useState('popup.html');
  const [htmlOutput, setHtmlOutput] = useState('');
  
  // HTML转换为Chrome扩展
  const handleConvertToExtension = () => {
    if (!htmlInput.trim()) {
      toast.error('请输入HTML内容');
      return;
    }
    
    try {
      const extensionFiles = htmlToChromeExtension(htmlInput);
      setExtensionOutput(extensionFiles);
      setSelectedFile('manifest.json');
      toast.success('转换为Chrome扩展成功');
    } catch (error) {
      toast.error('转换失败: ' + error.message);
    }
  };
  
  // Chrome扩展转换为HTML
  const handleConvertToHtml = () => {
    if (!extensionInput['popup.html'].trim()) {
      toast.error('请输入popup.html内容');
      return;
    }
    
    try {
      const html = chromeExtensionToHtml(extensionInput);
      setHtmlOutput(html);
      toast.success('转换为HTML成功');
    } catch (error) {
      toast.error('转换失败: ' + error.message);
    }
  };
  
  // 导入HTML文件
  const handleImportHtml = (content) => {
    setHtmlInput(content);
  };
  
  // 导入扩展文件
  const handleImportExtensionFile = (content) => {
    setExtensionInput({
      ...extensionInput,
      [selectedInputFile]: content
    });
  };
  
  // 更新扩展输入文件内容
  const handleExtensionInputChange = (content) => {
    setExtensionInput({
      ...extensionInput,
      [selectedInputFile]: content
    });
  };
  
  // 下载扩展文件
  const handleExportExtension = () => {
    if (Object.keys(extensionOutput).length === 0) {
      toast.error('没有可下载的内容');
      return;
    }
    
    const files = Object.entries(extensionOutput).map(([filename, content]) => ({
      filename,
      content
    }));
    
    downloadAsZip(files, 'chrome-extension.zip');
  };
  
  // 下载HTML文件
  const handleExportHtml = () => {
    if (!htmlOutput) {
      toast.error('没有可下载的内容');
      return;
    }
    
    downloadFile(htmlOutput, 'converted.html', 'text/html');
  };
  
  return (
    <div>
      <h2 className="mb-4">HTML ⟷ Chrome插件</h2>
      
      <div className="card mb-4">
        <h3 className="mb-2">HTML → Chrome插件</h3>
        <p className="mb-4 text-secondary">将HTML文件转换为Chrome插件所需的文件结构</p>
        
        <div className="mb-4">
          <Editor 
            title="输入HTML" 
            value={htmlInput} 
            onChange={setHtmlInput}
            onImport={handleImportHtml}
            placeholder="请输入完整的HTML代码..."
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleConvertToExtension}
          forwardLabel="转换为Chrome插件 →"
          disableForward={!htmlInput}
          disableBackward={true}
        />
        
        <div className="mt-4">
          <div className="mb-2">
            <label className="form-label">选择文件查看:</label>
            <select 
              className="form-control" 
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              {Object.keys(extensionOutput).map(filename => (
                <option key={filename} value={filename}>{filename}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <Editor 
              title={`输出: ${selectedFile}`} 
              value={extensionOutput[selectedFile] || ''}
              readOnly={true}
              language={selectedFile.endsWith('.json') ? 'json' : selectedFile.endsWith('.css') ? 'css' : selectedFile.endsWith('.js') ? 'javascript' : 'html'}
            />
          </div>
          
          <div className="text-center">
            <button 
              className="btn btn-success btn-icon" 
              onClick={handleExportExtension}
              disabled={Object.keys(extensionOutput).length === 0}
            >
              <i className="fas fa-download"></i> 下载Chrome插件文件
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-2">Chrome插件 → HTML</h3>
        <p className="mb-4 text-secondary">将Chrome插件文件转换回单个HTML文件</p>
        
        <div className="mb-2">
          <label className="form-label">选择文件编辑:</label>
          <select 
            className="form-control" 
            value={selectedInputFile}
            onChange={(e) => setSelectedInputFile(e.target.value)}
          >
            <option value="popup.html">popup.html</option>
            <option value="css/styles.css">css/styles.css</option>
            <option value="js/popup.js">js/popup.js</option>
          </select>
        </div>
        
        <div className="mb-4">
          <Editor 
            title={`输入: ${selectedInputFile}`} 
            value={extensionInput[selectedInputFile]} 
            onChange={handleExtensionInputChange}
            onImport={handleImportExtensionFile}
            placeholder={`请输入${selectedInputFile}内容...`}
            language={selectedInputFile.endsWith('.css') ? 'css' : selectedInputFile.endsWith('.js') ? 'javascript' : 'html'}
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleConvertToHtml}
          forwardLabel="转换为HTML →"
          disableForward={!extensionInput['popup.html']}
          disableBackward={true}
        />
        
        <div className="mt-4">
          <Editor 
            title="HTML输出" 
            value={htmlOutput} 
            readOnly={true}
            onExport={handleExportHtml}
          />
        </div>
      </div>
    </div>
  );
};

export default HtmlToChromeExtension;
