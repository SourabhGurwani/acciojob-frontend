import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Collapse,
  IconButton
} from '@mui/material';
import { useAi } from '../contexts/AiContext';
import { useNavigate } from 'react-router-dom';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const AiComponentGenerator = () => {
  const { generate, isGenerating, generationError } = useAi();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState({
    preset: 'REACT',
    styleMethod: 'CSS Modules',
    features: ['typescript'],
    advanced: false
  });
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const result = await generate(prompt, {
        ...config,
        features: config.features.filter(f => f !== 'advanced') // Remove the toggle flag
      });
      
      navigate('/components/new', { 
        state: { 
          generatedComponent: result,
          prompt 
        } 
      });
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Component Generator
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Describe your component"
            placeholder="e.g., A login form with email and password fields"
            fullWidth
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Advanced Options</Typography>
              <IconButton onClick={() => setExpanded(!expanded)} size="small">
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expanded}>
              <Box sx={{ pl: 2, borderLeft: '2px solid #eee' }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Preset</InputLabel>
                  <Select
                    value={config.preset}
                    label="Preset"
                    onChange={(e) => setConfig({...config, preset: e.target.value})}
                  >
                    <MenuItem value="REACT">React</MenuItem>
                    <MenuItem value="MUI">Material UI</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Styling Method</InputLabel>
                  <Select
                    value={config.styleMethod}
                    label="Styling Method"
                    onChange={(e) => setConfig({...config, styleMethod: e.target.value})}
                  >
                    <MenuItem value="CSS Modules">CSS Modules</MenuItem>
                    <MenuItem value="Tailwind">Tailwind CSS</MenuItem>
                    <MenuItem value="Styled Components">Styled Components</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Features</Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={<Checkbox 
                      checked={config.features.includes('typescript')} 
                      onChange={(e) => setConfig({
                        ...config,
                        features: e.target.checked 
                          ? [...config.features, 'typescript'] 
                          : config.features.filter(f => f !== 'typescript')
                      })} 
                    />} 
                    label="TypeScript" 
                  />
                  <FormControlLabel 
                    control={<Checkbox 
                      checked={config.features.includes('tests')} 
                      onChange={(e) => setConfig({
                        ...config,
                        features: e.target.checked 
                          ? [...config.features, 'tests'] 
                          : config.features.filter(f => f !== 'tests')
                      })} 
                    />} 
                    label="Include Tests" 
                  />
                  <FormControlLabel 
                    control={<Checkbox 
                      checked={config.features.includes('storybook')} 
                      onChange={(e) => setConfig({
                        ...config,
                        features: e.target.checked 
                          ? [...config.features, 'storybook'] 
                          : config.features.filter(f => f !== 'storybook')
                      })} 
                    />} 
                    label="Include Storybook" 
                  />
                </FormGroup>
              </Box>
            </Collapse>
          </Box>

          {generationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generationError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isGenerating || !prompt.trim()}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
            fullWidth
          >
            {isGenerating ? 'Generating...' : 'Generate Component'}
          </Button>
        </form>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Tip: Be as specific as possible in your description. Include details about:
      </Typography>
      <ul style={{ color: 'text.secondary', paddingLeft: 20 }}>
        <li>Purpose of the component</li>
        <li>Required props/inputs</li>
        <li>Styling preferences</li>
        <li>Any special functionality</li>
      </ul>
    </Box>
  );
};

export default AiComponentGenerator;