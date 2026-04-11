import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Role is automatically set to "user" by backend
      await api.post('/auth/signup', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });
      navigate('/login', { state: { message: "Account created! Please log in." }});
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
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
          Join BloodMate
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign up to track donations and requests
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text" required
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground">Email address</label>
              <input
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                placeholder="user@bloodmate.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background pr-10"
                  placeholder="••••••••"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"} required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-background pr-10"
                  placeholder="••••••••"
                />
                <button 
                  type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? 'Creating account...' : <><ArrowRight className="mr-2 h-4 w-4" /> Sign Up</>}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
             <span className="text-muted-foreground">Already have an account? </span>
             <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
