import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { FaRegCopy, FaUpload, FaDownload } from 'react-icons/fa';

const Editor = ({ 
  title, 
  value, 
  onChange, 
  readOnly = false, 
  onImport = null,
  onExport = null,
  placeholder = '',
  language = 'html'
}) => {
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (onImport) {
        onImport(event.target.result);
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入，以便可以再次选择同一文件
    e.target.value = '';
  };

  const handleCopy = () => {
    toast.success('已复制到剪贴板');
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title">{title}</div>
        <div className="editor-actions">
          {onImport && (
            <>
              <input
                type="file"
                id={`file-import-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="file-input"
                onChange={handleFileImport}
              />
              <label 
                htmlFor={`file-import-${title.replace(/\s+/g, '-').toLowerCase()}`}
                className="btn btn-sm btn-secondary btn-icon"
              >
                <FaUpload /> 导入
              </label>
            </>
          )}
          
          {onExport && (
            <button 
              className="btn btn-sm btn-success btn-icon" 
              onClick={handleExport}
              disabled={!value}
            >
              <FaDownload /> 下载
            </button>
          )}
          
          <CopyToClipboard text={value} onCopy={handleCopy}>
            <button 
              className="btn btn-sm btn-secondary btn-icon" 
              disabled={!value}
            >
              <FaRegCopy /> 复制
            </button>
          </CopyToClipboard>
        </div>
      </div>
      <div className="editor-content">
        <textarea
          className="editor-textarea"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default Editor;
