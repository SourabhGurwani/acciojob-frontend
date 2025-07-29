import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import CodeEditor from '../components/CodeEditor';
import componentService from '../api/components';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';

const ComponentCreate = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [component, setComponent] = useState({
    name: '',
    jsxCode: 'function MyComponent() {\n  return <div>Hello</div>;\n}',
    cssCode: '',
    testCode: '',
    storybookCode: '',
    prompt: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (state?.generatedComponent) {
      setComponent(prev => ({
        ...prev,
        name: state.generatedComponent.componentName || prev.name,
        jsxCode: state.generatedComponent.jsx || prev.jsxCode,
        cssCode: state.generatedComponent.css || prev.cssCode,
        testCode: state.generatedComponent.tests || prev.testCode,
        storybookCode: state.generatedComponent.storybook || prev.storybookCode,
        prompt: state.prompt || prev.prompt
      }));
    }
  }, [state]);

  const handleSave = async () => {
    if (!component.name.trim()) {
      setError('Component name is required');
      return;
    }

    if (!component.jsxCode.trim() || 
        !component.jsxCode.includes('function') || 
        !component.jsxCode.includes('return')) {
      setError('Valid component code is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const savedComponent = await componentService.createComponent(
        {
          name: component.name,
          jsxCode: component.jsxCode,
          cssCode: component.cssCode,
          testCode: component.testCode,
          storybookCode: component.storybookCode,
          prompt: component.prompt
        },
        user.token
      );

      navigate(`/components/${savedComponent._id}`);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save component');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        {component.name || 'New Component'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Prompt Section - Collapsible */}
      <Accordion 
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="prompt-content"
          sx={{
            backgroundColor: expanded ? '#f5f5f5' : 'transparent',
            minHeight: '48px !important',
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          <InfoIcon color="primary" />
          <Typography variant="subtitle1">Component Prompt</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={component.prompt}
            onChange={(e) => setComponent({...component, prompt: e.target.value})}
            placeholder="Describe what this component should do..."
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            This prompt will be saved with your component for future reference.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <TextField
        label="Component Name"
        fullWidth
        value={component.name}
        onChange={(e) => setComponent({...component, name: e.target.value})}
        sx={{ mb: 3 }}
      />

      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
        >
          <Tab label="Component" />
          <Tab label="Styles" />
          <Tab label="Preview" />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, minHeight: 0, mb: 3 }}>
        {activeTab === 0 && (
          <CodeEditor
            language="javascript"
            value={component.jsxCode}
            onChange={(value) => setComponent({...component, jsxCode: value})}
            readOnly={false}
          />
        )}
        
        {activeTab === 1 && (
          <CodeEditor
            language="css"
            value={component.cssCode || '/* Your styles here */'}
            onChange={(value) => setComponent({...component, cssCode: value})}
            readOnly={false}
          />
        )}
        
        {activeTab === 2 && (
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>${component.cssCode}</style>
                </head>
                <body>
                  <div id="root"></div>
                  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                  <script>
                    try {
                      ${component.jsxCode.replace('export default', 'const Component =')}
                      ReactDOM.render(React.createElement(Component), document.getElementById('root'));
                    } catch (error) {
                      document.getElementById('root').innerHTML = 
                        '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
                    }
                  </script>
                </body>
              </html>
            `}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Component Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/components')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Component'}
        </Button>
      </Box>
    </Box>
  );
};

export default ComponentCreate;