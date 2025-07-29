import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';

const CodeEditor = ({ 
  code, 
  onChange, 
  language = 'javascript', 
  editable = true,
  style = {}
}) => {
  const codeRef = useRef(null);
  const [currentCode, setCurrentCode] = useState(code);

  useEffect(() => {
    setCurrentCode(code);
  }, [code]);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [currentCode, language]);

  const handleChange = (e) => {
    const newCode = e.currentTarget.textContent;
    setCurrentCode(newCode);
    if (onChange) onChange(newCode);
  };

  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        borderRadius: 1,
        backgroundColor: '#2d2d2d',
        overflow: 'auto',
        maxHeight: '100%',
        cursor: editable ? 'text' : 'default',
        ...style
      }}
    >
      <code
        ref={codeRef}
        className={`language-${language}`}
        style={{ whiteSpace: 'pre-wrap' }}
        contentEditable={editable}
        onInput={handleChange}
        suppressContentEditableWarning
      >
        {currentCode}
      </code>
    </Box>
  );
};

export default CodeEditor;