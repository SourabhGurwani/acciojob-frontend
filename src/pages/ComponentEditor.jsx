import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Tabs, 
  Tab,
  Alert,
  TextField,
  CircularProgress,
  Stack
} from '@mui/material';
import CodeEditor from '../components/CodeEditor';
import { useParams } from 'react-router-dom';
import componentService from '../api/components';

const ComponentEditor = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [component, setComponent] = useState({
    name: '',
    code: '',
    props: []
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Default component template
  const defaultComponent = {
    name: 'New Component',
    code: `import PropTypes from 'prop-types';\n\nconst MyComponent = () => {\n  return <div>Hello World</div>;\n};\n\nMyComponent.propTypes = {};\n\nexport default MyComponent;`,
    props: []
  };

  // Load component data
  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const data = id === 'new' 
          ? defaultComponent
          : await componentService.getComponent(id);
        
        setComponent(data);
      } catch (err) {
        console.error('Failed to load component:', err);
        setError('Failed to load component. Please try again.');
        // Set default component when loading fails
        setComponent(defaultComponent);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [id]);

  const handleCodeChange = (newCode) => {
    setComponent(prev => ({
      ...prev,
      code: newCode
    }));
    setError('');
  };

  const handleNameChange = (e) => {
    setComponent(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setError('');
      
      // Basic validation
      if (!component.name.trim()) {
        throw new Error('Component name is required');
      }
      if (!component.code.includes('export default')) {
        throw new Error('Component must have default export');
      }

      // Save logic would go here
      console.log('Saving component:', component);
      alert('Component saved successfully!');
      
    } catch (err) {
      setError(err.message);
      console.error('Save error:', err);
    }
  };

  // Generate preview HTML with error handling
  const getPreviewHTML = () => {
    try {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script>
            ${component.code}
            try {
              ReactDOM.render(
                React.createElement(MyComponent),
                document.getElementById('root')
              );
            } catch (error) {
              document.getElementById('root').innerHTML = 
                '<div style="color: red; padding: 20px;">' + error.message + '</div>';
            }
          </script>
        </head>
        <body>
          <div id="root"></div>
        </body>
        </html>
      `;
    } catch (err) {
      return `
        <!DOCTYPE html>
        <html>
        <body>
          <div id="root" style="color: red; padding: 20px;">
            Error generating preview
          </div>
        </body>
        </html>
      `;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Component Editor
      </Typography>

      <TextField
        label="Component Name"
        fullWidth
        value={component.name}
        onChange={handleNameChange}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Code" />
          <Tab label="Preview" />
          <Tab label="Props" />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {activeTab === 0 && (
          <CodeEditor 
            code={component.code} 
            onChange={handleCodeChange}
            editable={true}
            language="javascript"
          />
        )}

        {activeTab === 1 && (
          <Box sx={{ 
            p: 2, 
            border: '1px dashed', 
            borderColor: 'divider',
            height: '100%',
            bgcolor: 'background.paper'
          }}>
            <iframe
              srcDoc={getPreviewHTML()}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Component Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Component Props
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No props defined
            </Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button 
          variant="contained" 
          onClick={handleSave}
          size="large"
        >
          Save Component
        </Button>
      </Stack>
    </Box>
  );
};

export default ComponentEditor;