import React, { useState } from 'react';
import Editor from '../common/Editor';
import ConversionControls from '../common/ConversionControls';
import { htmlToUtoolsPlugin, utoolsPluginToHtml } from '../../utils/converters';
import { downloadAsZip, downloadFile } from '../../utils/fileUtils';
import { toast } from 'react-toastify';

const HtmlToUtoolsPlugin = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [pluginOutput, setPluginOutput] = useState({});
  const [selectedFile, setSelectedFile] = useState('plugin.json');
  
  const [pluginInput, setPluginInput] = useState({
    'index.html': '',
    'styles.css': '',
    'script.js': ''
  });
  const [selectedInputFile, setSelectedInputFile] = useState('index.html');
  const [htmlOutput, setHtmlOutput] = useState('');
  
  // HTML转换为uTools插件
  const handleConvertToPlugin = () => {
    if (!htmlInput.trim()) {
      toast.error('请输入HTML内容');
      return;
    }
    
    try {
      const pluginFiles = htmlToUtoolsPlugin(htmlInput);
      setPluginOutput(pluginFiles);
      setSelectedFile('plugin.json');
      toast.success('转换为uTools插件成功');
    } catch (error) {
      toast.error('转换失败: ' + error.message);
    }
  };
  
  // uTools插件转换为HTML
  const handleConvertToHtml = () => {
    if (!pluginInput['index.html'].trim()) {
      toast.error('请输入index.html内容');
      return;
    }
    
    try {
      const html = utoolsPluginToHtml(pluginInput);
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
  
  // 导入插件文件
  const handleImportPluginFile = (content) => {
    setPluginInput({
      ...pluginInput,
      [selectedInputFile]: content
    });
  };
  
  // 更新插件输入文件内容
  const handlePluginInputChange = (content) => {
    setPluginInput({
      ...pluginInput,
      [selectedInputFile]: content
    });
  };
  
  // 下载插件文件
  const handleExportPlugin = () => {
    if (Object.keys(pluginOutput).length === 0) {
      toast.error('没有可下载的内容');
      return;
    }
    
    const files = Object.entries(pluginOutput).map(([filename, content]) => ({
      filename,
      content
    }));
    
    downloadAsZip(files, 'utools-plugin.zip');
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
      <h2 className="mb-4">HTML ⟷ uTools插件</h2>
      
      <div className="card mb-4">
        <h3 className="mb-2">HTML → uTools插件</h3>
        <p className="mb-4 text-secondary">将HTML文件转换为uTools插件所需的文件结构</p>
        
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
          onConvertForward={handleConvertToPlugin}
          forwardLabel="转换为uTools插件 →"
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
              {Object.keys(pluginOutput).map(filename => (
                <option key={filename} value={filename}>{filename}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <Editor 
              title={`输出: ${selectedFile}`} 
              value={pluginOutput[selectedFile] || ''}
              readOnly={true}
              language={
                selectedFile.endsWith('.json') ? 'json' : 
                selectedFile.endsWith('.css') ? 'css' : 
                selectedFile.endsWith('.js') ? 'javascript' : 
                selectedFile.endsWith('.html') ? 'html' : 'text'
              }
            />
          </div>
          
          <div className="text-center">
            <button 
              className="btn btn-success btn-icon" 
              onClick={handleExportPlugin}
              disabled={Object.keys(pluginOutput).length === 0}
            >
              <i className="fas fa-download"></i> 下载uTools插件文件
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-2">uTools插件 → HTML</h3>
        <p className="mb-4 text-secondary">将uTools插件文件转换回单个HTML文件</p>
        
        <div className="mb-2">
          <label className="form-label">选择文件编辑:</label>
          <select 
            className="form-control" 
            value={selectedInputFile}
            onChange={(e) => setSelectedInputFile(e.target.value)}
          >
            <option value="index.html">index.html</option>
            <option value="styles.css">styles.css</option>
            <option value="script.js">script.js</option>
          </select>
        </div>
        
        <div className="mb-4">
          <Editor 
            title={`输入: ${selectedInputFile}`} 
            value={pluginInput[selectedInputFile]} 
            onChange={handlePluginInputChange}
            onImport={handleImportPluginFile}
            placeholder={`请输入${selectedInputFile}内容...`}
            language={
              selectedInputFile.endsWith('.css') ? 'css' : 
              selectedInputFile.endsWith('.js') ? 'javascript' : 
              selectedInputFile.endsWith('.html') ? 'html' : 'text'
            }
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleConvertToHtml}
          forwardLabel="转换为HTML →"
          disableForward={!pluginInput['index.html']}
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

export default HtmlToUtoolsPlugin;
