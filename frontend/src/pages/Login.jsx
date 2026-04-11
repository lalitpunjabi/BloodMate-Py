import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

function Login({ setAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects username
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Store token
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', 'user');
      
      setAuth(true); // Propagate to Layout
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 403) {
         setError("Admins cannot use the User portal.");
      } else {
         setError(err.response?.data?.detail || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -m-32 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className=" flex justify-center text-primary mb-4">
          <HeartPulse size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to your BloodMate account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-card py-8 px-4 shadow-xl border sm:rounded-xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center text-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground">Email address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                placeholder="user@bloodmate.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background pr-10"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? 'Signing in...' : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-col space-y-3 pt-4 border-t border-border">
             <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="font-medium text-primary hover:underline">Register Now</Link>
             </div>
             <Link to="/admin/login" className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <ShieldCheck className="w-4 h-4 mr-1 text-muted-foreground group-hover:text-primary transition-colors" />
                Staff / Admin Portal
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
