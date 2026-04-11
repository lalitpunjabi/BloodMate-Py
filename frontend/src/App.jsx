import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import VoiceAssistant from './components/VoiceAssistant';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Donors from './pages/Donors';
import Inventory from './pages/Inventory';

// Protected Route Wrapper
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Sync auth state if token drops
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="/admin/login" element={<AdminLogin setAuth={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="donors" element={<Donors />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
        </Routes>
        {isAuthenticated && <VoiceAssistant />}
      </div>
    </BrowserRouter>
  );
}

export default App;
