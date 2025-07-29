// App.jsx
import { AiProvider } from './contexts/AiContext';
import AppRoutes from './routes/Routes';

function App() {
  return (
    <AiProvider>
      <AppRoutes />
    </AiProvider>
  );
}

export default App;