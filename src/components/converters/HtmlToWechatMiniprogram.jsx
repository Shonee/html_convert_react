import React, { useState } from 'react';
import Editor from '../common/Editor';
import ConversionControls from '../common/ConversionControls';
import { htmlToWechatMiniprogram, wechatMiniprogramToHtml } from '../../utils/converters';
import { downloadAsZip, downloadFile } from '../../utils/fileUtils';
import { toast } from 'react-toastify';

const HtmlToWechatMiniprogram = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [miniprogramOutput, setMiniprogramOutput] = useState({});
  const [selectedFile, setSelectedFile] = useState('app.json');
  
  const [miniprogramInput, setMiniprogramInput] = useState({
    'pages/index/index.wxml': '',
    'pages/index/index.wxss': '',
    'pages/index/index.js': ''
  });
  const [selectedInputFile, setSelectedInputFile] = useState('pages/index/index.wxml');
  const [htmlOutput, setHtmlOutput] = useState('');
  
  // HTML转换为微信小程序
  const handleConvertToMiniprogram = () => {
    if (!htmlInput.trim()) {
      toast.error('请输入HTML内容');
      return;
    }
    
    try {
      const miniprogramFiles = htmlToWechatMiniprogram(htmlInput);
      setMiniprogramOutput(miniprogramFiles);
      setSelectedFile('app.json');
      toast.success('转换为微信小程序成功');
    } catch (error) {
      toast.error('转换失败: ' + error.message);
    }
  };
  
  // 微信小程序转换为HTML
  const handleConvertToHtml = () => {
    if (!miniprogramInput['pages/index/index.wxml'].trim()) {
      toast.error('请输入WXML内容');
      return;
    }
    
    try {
      const html = wechatMiniprogramToHtml(miniprogramInput);
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
  
  // 导入小程序文件
  const handleImportMiniprogramFile = (content) => {
    setMiniprogramInput({
      ...miniprogramInput,
      [selectedInputFile]: content
    });
  };
  
  // 更新小程序输入文件内容
  const handleMiniprogramInputChange = (content) => {
    setMiniprogramInput({
      ...miniprogramInput,
      [selectedInputFile]: content
    });
  };
  
  // 下载小程序文件
  const handleExportMiniprogram = () => {
    if (Object.keys(miniprogramOutput).length === 0) {
      toast.error('没有可下载的内容');
      return;
    }
    
    const files = Object.entries(miniprogramOutput).map(([filename, content]) => ({
      filename,
      content
    }));
    
    downloadAsZip(files, 'wechat-miniprogram.zip');
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
      <h2 className="mb-4">HTML ⟷ 微信小程序</h2>
      
      <div className="card mb-4">
        <h3 className="mb-2">HTML → 微信小程序</h3>
        <p className="mb-4 text-secondary">将HTML文件转换为微信小程序所需的文件结构</p>
        
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
          onConvertForward={handleConvertToMiniprogram}
          forwardLabel="转换为微信小程序 →"
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
              {Object.keys(miniprogramOutput).map(filename => (
                <option key={filename} value={filename}>{filename}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <Editor 
              title={`输出: ${selectedFile}`} 
              value={miniprogramOutput[selectedFile] || ''}
              readOnly={true}
              language={
                selectedFile.endsWith('.json') ? 'json' : 
                selectedFile.endsWith('.wxss') ? 'css' : 
                selectedFile.endsWith('.js') ? 'javascript' : 
                selectedFile.endsWith('.wxml') ? 'html' : 'text'
              }
            />
          </div>
          
          <div className="text-center">
            <button 
              className="btn btn-success btn-icon" 
              onClick={handleExportMiniprogram}
              disabled={Object.keys(miniprogramOutput).length === 0}
            >
              <i className="fas fa-download"></i> 下载微信小程序文件
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-2">微信小程序 → HTML</h3>
        <p className="mb-4 text-secondary">将微信小程序文件转换回单个HTML文件</p>
        
        <div className="mb-2">
          <label className="form-label">选择文件编辑:</label>
          <select 
            className="form-control" 
            value={selectedInputFile}
            onChange={(e) => setSelectedInputFile(e.target.value)}
          >
            <option value="pages/index/index.wxml">pages/index/index.wxml</option>
            <option value="pages/index/index.wxss">pages/index/index.wxss</option>
            <option value="pages/index/index.js">pages/index/index.js</option>
          </select>
        </div>
        
        <div className="mb-4">
          <Editor 
            title={`输入: ${selectedInputFile}`} 
            value={miniprogramInput[selectedInputFile]} 
            onChange={handleMiniprogramInputChange}
            onImport={handleImportMiniprogramFile}
            placeholder={`请输入${selectedInputFile}内容...`}
            language={
              selectedInputFile.endsWith('.wxss') ? 'css' : 
              selectedInputFile.endsWith('.js') ? 'javascript' : 
              selectedInputFile.endsWith('.wxml') ? 'html' : 'text'
            }
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleConvertToHtml}
          forwardLabel="转换为HTML →"
          disableForward={!miniprogramInput['pages/index/index.wxml']}
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

export default HtmlToWechatMiniprogram;
