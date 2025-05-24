import React, { useState } from 'react';
import Editor from '../common/Editor';
import ConversionControls from '../common/ConversionControls';
import { htmlToMarkdown, markdownToHtml } from '../../utils/converters';
import { downloadFile } from '../../utils/fileUtils';
import { toast } from 'react-toastify';

const HtmlToMarkdown = () => {
  const [htmlInput, setHtmlInput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  
  const [markdownInput, setMarkdownInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  
  // HTML转换为Markdown
  const handleConvertToMarkdown = async () => {
    if (!htmlInput.trim()) {
      toast.error('请输入HTML内容');
      return;
    }
    
    try {
      const markdown = await htmlToMarkdown(htmlInput);
      setMarkdownOutput(markdown);
      toast.success('转换为Markdown成功');
    } catch (error) {
      toast.error('转换失败: ' + error.message);
    }
  };
  
  // Markdown转换为HTML
  const handleConvertToHtml = async () => {
    if (!markdownInput.trim()) {
      toast.error('请输入Markdown内容');
      return;
    }
    
    try {
      const html = await markdownToHtml(markdownInput);
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
  
  // 导入Markdown文件
  const handleImportMarkdown = (content) => {
    setMarkdownInput(content);
  };
  
  // 下载Markdown文件
  const handleExportMarkdown = () => {
    if (!markdownOutput) {
      toast.error('没有可下载的内容');
      return;
    }
    
    downloadFile(markdownOutput, 'converted.md', 'text/markdown');
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
      <h2 className="mb-4">HTML ⟷ Markdown</h2>
      
      <div className="card mb-4">
        <h3 className="mb-2">HTML → Markdown</h3>
        <p className="mb-4 text-secondary">将HTML文件转换为Markdown格式</p>
        
        <div className="mb-4">
          <Editor 
            title="输入HTML" 
            value={htmlInput} 
            onChange={setHtmlInput}
            onImport={handleImportHtml}
            placeholder="请输入HTML代码..."
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleConvertToMarkdown}
          forwardLabel="转换为Markdown →"
          disableForward={!htmlInput}
          disableBackward={true}
        />
        
        <div className="mt-4">
          <Editor 
            title="Markdown输出" 
            value={markdownOutput} 
            readOnly={true}
            onExport={handleExportMarkdown}
            language="markdown"
          />
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-2">Markdown → HTML</h3>
        <p className="mb-4 text-secondary">将Markdown文件转换为HTML格式</p>
        
        <div className="mb-4">
          <Editor 
            title="输入Markdown" 
            value={markdownInput} 
            onChange={setMarkdownInput}
            onImport={handleImportMarkdown}
            placeholder="请输入Markdown代码..."
            language="markdown"
          />
        </div>
        
        <ConversionControls 
          onConvertForward={handleConvertToHtml}
          forwardLabel="转换为HTML →"
          disableForward={!markdownInput}
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

export default HtmlToMarkdown;
