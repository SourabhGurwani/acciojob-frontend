import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from '../pages/DashboardPage';
import AiComponentGenerator from '../pages/AiComponentGenerator';
import ComponentCreate from '../pages/ComponentCreate';
import ComponentEditor from '../pages/ComponentEditor';
import LoginPage from '../pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/components/ai-generate"
        element={
          <ProtectedRoute>
            <AiComponentGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/components/new"
        element={
          <ProtectedRoute>
            <ComponentCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/components/:id"
        element={
          <ProtectedRoute>
            <ComponentEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Simple 404 Handling */}
      <Route
        path="*"
        element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <button onClick={() => window.history.back()}>Go Back</button>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;