import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Stack,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Add, Search, Code, Palette, Widgets } from '@mui/icons-material';
import componentService from '../api/components';
import AISidebar from '../components/AISidebar/AISidebar';

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true);
      setError('');
      try {
        const { components } = await componentService.getComponents(
          user.token,
          1,
          100,
          searchTerm,
          filterType
        );
        setComponents(components);
      } catch (err) {
        setError('Failed to load components');
        setComponents([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchComponents();
    }
  }, [user?.token, searchTerm, filterType]);

  const countByType = (type) => {
    return components.filter(c => c.type === type).length;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'button': return <Palette fontSize="small" />;
      case 'card': return <Widgets fontSize="small" />;
      default: return <Code fontSize="small" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AISidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {/* Header Section */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Component Library
              </Typography>
              <Typography variant="subtitle1">
                Welcome back, {user?.name}!
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => navigate('/components/new')}
                sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    opacity: 0.9
                  }
                }}
              >
                New Component
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Search and Filter */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search components..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="button">Buttons</MenuItem>
              <MenuItem value="card">Cards</MenuItem>
              <MenuItem value="form">Forms</MenuItem>
              <MenuItem value="modal">Modals</MenuItem>
            </Select>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Code />
                </Avatar>
                <Box>
                  <Typography variant="h6">{components.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Components</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <Palette />
                </Avatar>
                <Box>
                  <Typography variant="h6">{countByType('button')}</Typography>
                  <Typography variant="body2" color="text.secondary">Buttons</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Widgets />
                </Avatar>
                <Box>
                  <Typography variant="h6">{countByType('card')}</Typography>
                  <Typography variant="body2" color="text.secondary">Cards</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Widgets />
                </Avatar>
                <Box>
                  <Typography variant="h6">{countByType('modal')}</Typography>
                  <Typography variant="body2" color="text.secondary">Modals</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Components Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : components.length === 0 ? (
          <Paper elevation={0} sx={{ 
            textAlign: 'center', 
            p: 4, 
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom>
              No components found
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => navigate('/components/new')}
              sx={{ mt: 2 }}
            >
              Create Your First Component
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {components.map((component) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={component._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    borderColor: 'primary.main'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      {getTypeIcon(component.type)}
                      <Typography variant="h6" component="div" noWrap>
                        {component.name}
                      </Typography>
                    </Stack>
                    <Chip 
                      label={component.type || 'component'} 
                      size="small" 
                      sx={{ mb: 2 }}
                      color={
                        component.type === 'button' ? 'primary' :
                        component.type === 'card' ? 'secondary' : 'default'
                      }
                    />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {component.description || 'No description available'}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Last updated: {component.updatedAt ? new Date(component.updatedAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/components/${component._id}`)}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default DashboardPage;