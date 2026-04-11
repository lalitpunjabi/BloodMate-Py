import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, ShieldAlert, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

function AdminLogin({ setAuth }) {
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
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/admin-login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', 'admin');
      
      setAuth(true);
      navigate('/dashboard'); // Both use dashboard, but UI logic is determined by role via Layout
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className=" flex justify-center text-red-500 mb-4">
          <ShieldCheck size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Restricted to BloodMate Staff and Admins.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 py-8 px-4 shadow-xl border border-slate-800 sm:rounded-xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md flex items-center text-sm">
                <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Admin Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-slate-800 text-white"
                placeholder="admin@bloodmate.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Master Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-slate-800 text-white pr-10"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? 'Authenticating...' : <>Authenticate <ArrowRight className="ml-2 h-4 w-4" /></>}
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-col space-y-3 pt-4 border-t border-slate-800">
             <Link to="/login" className="flex items-center justify-center text-sm text-slate-400 hover:text-white transition-colors">
                <HeartPulse className="w-4 h-4 mr-1" />
                Return to standard User Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
