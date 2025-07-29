import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import componentService from '../api/components';

const ComponentGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    preset: 'REACT',
    includeStyles: true,
    includeTests: false,
    includeStorybook: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const newErrors = {
      prompt: formData.prompt.trim().length < 2 ? 'Prompt must be at least 2 characters' : '',
      name: !formData.name.trim() ? 'Component name is required' : ''
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await componentService.generateComponent(
        {
          name: formData.name,
          prompt: formData.prompt,
          preset: formData.preset,
          options: {
            styles: formData.includeStyles,
            tests: formData.includeTests,
            storybook: formData.includeStorybook
          }
        },
        user.token
      );

      navigate('/components/new', { 
        state: { 
          generatedComponent: response,
          prompt: formData.prompt 
        } 
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate component');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Generate New Component
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          name="name"
          label="Component Name *"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Component Preset *</InputLabel>
          <Select
            name="preset"
            value={formData.preset}
            label="Component Preset *"
            onChange={handleChange}
            required
          >
            <MenuItem value="REACT">React (Default)</MenuItem>
            <MenuItem value="MUI">Material UI</MenuItem>
            <MenuItem value="VUE">Vue</MenuItem>
          </Select>
        </FormControl>

        <TextField
          name="prompt"
          label="Prompt *"
          fullWidth
          margin="normal"
          multiline
          rows={6}
          value={formData.prompt}
          onChange={handleChange}
          error={!!errors.prompt}
          helperText={errors.prompt || 'Describe the component you want to generate in detail'}
          required
        />

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.includeStyles} 
                onChange={handleChange} 
                name="includeStyles" 
              />
            }
            label="Include CSS Styles"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.includeTests} 
                onChange={handleChange} 
                name="includeTests" 
              />
            }
            label="Include Test Files"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.includeStorybook} 
                onChange={handleChange} 
                name="includeStorybook" 
              />
            }
            label="Include Storybook File"
          />
        </FormGroup>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Generating...' : 'Generate Component'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ComponentGenerator;