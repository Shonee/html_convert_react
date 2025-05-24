import React from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const ConversionControls = ({ 
  onConvertForward, 
  onConvertBackward,
  forwardLabel = '转换 →',
  backwardLabel = '← 转换',
  disableForward = false,
  disableBackward = false
}) => {
  return (
    <div className="converter-controls">
      <button 
        className="btn btn-primary btn-icon" 
        onClick={onConvertBackward}
        disabled={disableBackward}
      >
        <FaArrowLeft /> {backwardLabel}
      </button>
      <div style={{ width: '20px' }}></div>
      <button 
        className="btn btn-primary btn-icon" 
        onClick={onConvertForward}
        disabled={disableForward}
      >
        {forwardLabel} <FaArrowRight />
      </button>
    </div>
  );
};

export default ConversionControls;
