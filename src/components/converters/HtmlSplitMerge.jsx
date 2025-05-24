import React, { useState } from 'react';
import Editor from '../common/Editor';
import ConversionControls from '../common/ConversionControls';
import { splitHTML, mergeFiles } from '../../utils/converters';
import { downloadFile, downloadAsZip } from '../../utils/fileUtils';
import { toast } from 'react-toastify';

const HtmlSplitMerge = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [cssOutput, setCssOutput] = useState('');
  const [jsOutput, setJsOutput] = useState('');
  
  const [mergeHtmlInput, setMergeHtmlInput] = useState('');
  const [mergeCssInput, setMergeCssInput] = useState('');
  const [mergeJsInput, setMergeJsInput] = useState('');
  const [mergeOutput, setMergeOutput] = useState('');
  
  // HTML拆分为HTML+CSS+JS
  const handleSplit = () => {
    if (!htmlInput.trim()) {
      toast.error('请输入HTML内容');
      return;
    }
    
    try {
      const { html, css, js } = splitHTML(htmlInput);
      setHtmlOutput(html);
      setCssOutput(css);
      setJsOutput(js);
      toast.success('HTML拆分成功');
    } catch (error) {
      toast.error('HTML拆分失败: ' + error.message);
    }
  };
  
  // HTML+CSS+JS合并为单个HTML
  const handleMerge = () => {
    if (!mergeHtmlInput.trim()) {
      toast.error('请输入HTML内容');
      return;
    }
    
    try {
      const merged = mergeFiles(mergeHtmlInput, mergeCssInput, mergeJsInput);
      setMergeOutput(merged);
      toast.success('文件合并成功');
    } catch (error) {
      toast.error('文件合并失败: ' + error.message);
    }
  };
  
  // 导入HTML文件
  const handleImportHtml = (content) => {
    setHtmlInput(content);
  };
  
  // 导入合并用的HTML文件
  const handleImportMergeHtml = (content) => {
    setMergeHtmlInput(content);
  };
  
  // 导入合并用的CSS文件
  const handleImportMergeCss = (content) => {
    setMergeCssInput(content);
  };
  
  // 导入合并用的JS文件
  const handleImportMergeJs = (content) => {
    setMergeJsInput(content);
  };
  
  // 下载拆分后的文件
  const handleExportSplit = () => {
    if (!htmlOutput && !cssOutput && !jsOutput) {
      toast.error('没有可下载的内容');
      return;
    }
    
    const files = [];
    
    if (htmlOutput) {
      files.push({
        filename: 'index.html',
        content: htmlOutput
      });
    }
    
    if (cssOutput) {
      files.push({
        filename: 'styles.css',
        content: cssOutput
      });
    }
    
    if (jsOutput) {
      files.push({
        filename: 'script.js',
        content: jsOutput
      });
    }
    
    downloadAsZip(files, 'html-split.zip');
  };
  
  // 下载合并后的HTML文件
  const handleExportMerged = () => {
    if (!mergeOutput) {
      toast.error('没有可下载的内容');
      return;
    }
    
    downloadFile(mergeOutput, 'merged.html', 'text/html');
  };
  
  return (
    <div>
      <h2 className="mb-4">HTML 拆分/合并</h2>
      
      <div className="card mb-4">
        <h3 className="mb-2">HTML 拆分</h3>
        <p className="mb-4 text-secondary">将单个HTML文件拆分为HTML、CSS和JavaScript三个独立文件</p>
        
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
          onConvertForward={handleSplit}
          forwardLabel="拆分 →"
          disableForward={!htmlInput}
          disableBackward={true}
        />
        
        <div className="mt-4">
          <div className="mb-4">
            <Editor 
              title="HTML输出" 
              value={htmlOutput} 
              readOnly={true}
            />
          </div>
          
          <div className="mb-4">
            <Editor 
              title="CSS输出" 
              value={cssOutput} 
              readOnly={true}
              language="css"
            />
          </div>
          
          <div className="mb-4">
            <Editor 
              title="JavaScript输出" 
              value={jsOutput} 
              readOnly={true}
              language="javascript"
            />
          </div>
          
          <div className="text-center">
            <button 
              className="btn btn-success btn-icon" 
              onClick={handleExportSplit}
              disabled={!htmlOutput && !cssOutput && !jsOutput}
            >
              <i className="fas fa-download"></i> 下载所有文件
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-2">HTML 合并</h3>
        <p className="mb-4 text-secondary">将HTML、CSS和JavaScript三个独立文件合并为单个HTML文件</p>
        
        <div className="mb-4">
          <Editor 
            title="HTML输入" 
            value={mergeHtmlInput} 
            onChange={setMergeHtmlInput}
            onImport={handleImportMergeHtml}
            placeholder="请输入HTML代码..."
          />
        </div>
        
        <div className="mb-4">
          <Editor 
            title="CSS输入" 
            value={mergeCssInput} 
            onChange={setMergeCssInput}
            onImport={handleImportMergeCss}
            placeholder="请输入CSS代码..."
            language="css"
          />
        </div>
        
        <div className="mb-4">
          <Editor 
            title="JavaScript输入" 
            value={mergeJsInput} 
            onChange={setMergeJsInput}
            onImport={handleImportMergeJs}
            placeholder="请输入JavaScript代码..."
            language="javascript"
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleMerge}
          forwardLabel="合并 →"
          disableForward={!mergeHtmlInput}
          disableBackward={true}
        />
        
        <div className="mt-4">
          <Editor 
            title="合并输出" 
            value={mergeOutput} 
            readOnly={true}
            onExport={handleExportMerged}
          />
        </div>
      </div>
    </div>
  );
};

export default HtmlSplitMerge;
