import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Send, Clear, Code, Style, Build } from '@mui/icons-material';
import { useAi } from '../../contexts/AiContext';

const AISidebar = () => {
  const { generate, isGenerating, generationError } = useAi();
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const messageEndRef = useRef(null);

  const quickActions = [
    { icon: <Code />, label: 'Button', prompt: 'Create a reusable button component with hover effects' },
    { icon: <Style />, label: 'Card', prompt: 'Generate a responsive card component with image placeholder' },
    { icon: <Build />, label: 'Modal', prompt: 'Build an accessible modal dialog with overlay' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Add user message
    const userMessage = { 
      role: 'user', 
      content: prompt,
      timestamp: new Date().toLocaleTimeString() 
    };
    setConversation(prev => [...prev, userMessage]);
    setPrompt('');

    try {
      // Add loading indicator
      setConversation(prev => [...prev, { 
        role: 'ai', 
        isLoading: true,
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Generate response
      const result = await generate(prompt);
      
      // Replace loading with actual response
      setConversation(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'ai', 
          content: result.jsx || 'Component generated successfully!',
          timestamp: new Date().toLocaleTimeString(),
          component: result
        }
      ]);
    } catch (error) {
      setConversation(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'ai', 
          content: generationError || 'Failed to generate component',
          isError: true,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <Box sx={{ 
      width: 350,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #eee',
      bgcolor: 'background.paper'
    }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h6">AI Component Assistant</Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Generate</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quickActions.map((action, i) => (
            <Chip
              key={i}
              icon={action.icon}
              label={action.label}
              onClick={() => {
                setPrompt(action.prompt);
                document.getElementById('ai-prompt-input')?.focus();
              }}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>
      <Divider />

      {/* Conversation History */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {conversation.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Describe what you need or try a quick action
          </Typography>
        ) : (
          <List>
            {conversation.map((msg, i) => (
              <ListItem 
                key={i} 
                sx={{ 
                  alignItems: 'flex-start',
                  bgcolor: msg.role === 'ai' ? 'action.hover' : 'transparent',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Avatar sx={{ 
                  width: 24, 
                  height: 24, 
                  mr: 1,
                  bgcolor: msg.isError ? 'error.main' : 
                          msg.role === 'ai' ? 'primary.main' : 'grey.500'
                }}>
                  {msg.role === 'ai' ? 'AI' : 'U'}
                </Avatar>
                <ListItemText
                  primary={msg.isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      <Typography variant="body2">Generating...</Typography>
                    </Box>
                  ) : (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        color: msg.isError ? 'error.main' : 'text.primary',
                        fontFamily: msg.component ? 'monospace' : 'inherit'
                      }}
                    >
                      {msg.content}
                    </Typography>
                  )}
                  secondary={msg.timestamp}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            <div ref={messageEndRef} />
          </List>
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            id="ai-prompt-input"
            fullWidth
            size="small"
            placeholder="Describe your component..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            InputProps={{
              endAdornment: (
                <>
                  {prompt && (
                    <IconButton 
                      size="small" 
                      onClick={() => setPrompt('')}
                      disabled={isGenerating}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton 
                    type="submit" 
                    size="small" 
                    disabled={!prompt.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Send fontSize="small" />
                    )}
                  </IconButton>
                </>
              )
            }}
          />
        </form>
        {generationError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {generationError.includes('API key') ? (
              <>
                API key not configured. Please add to your .env file:
                <code style={{ display: 'block', marginTop: 4 }}>
                  VITE_AI_API_KEY=your_key_here
                </code>
              </>
            ) : (
              generationError
            )}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AISidebar;