import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';

import 'prismjs/themes/prism-tomorrow.css' // Theme
import 'prismjs/components/prism-javascript' // JS support
import 'prismjs/components/prism-jsx' // JSX support
import 'prismjs/components/prism-css' // CSS support
import 'prismjs/components/prism-typescript' // TS support if needed
import 'prismjs/components/prism-json' // JSON support if needed

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);