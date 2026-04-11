import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, LogOut, Moon, Sun, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

function Layout({ isAuthenticated, setIsAuthenticated }) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const role = localStorage.getItem('role') || 'user';
  const isAdmin = role === 'admin';

  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, adminOnly: false },
    { name: 'Donors', path: '/donors', icon: Users, adminOnly: true },
    { name: 'Inventory & Requests', path: '/inventory', icon: Activity, adminOnly: false },
  ];

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex flex-col space-y-1">
            <Link to="/dashboard" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <HeartPulse size={32} strokeWidth={2.5} />
              <span className="text-2xl font-bold tracking-tight">BloodMate</span>
            </Link>
            <span className={`text-xs ml-10 font-bold uppercase tracking-wider ${isAdmin ? 'text-red-500' : 'text-blue-500'}`}>
              {isAdmin ? '🛡️ Admin Portal' : '👤 User Portal'}
            </span>
          </div>
          <nav className="px-4 space-y-1">
            {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t space-y-2">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center space-x-3 w-full px-4 py-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b">
          <Link to="/dashboard" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <HeartPulse size={24} />
            <span className="text-xl font-bold">BloodMate</span>
          </Link>
          <button onClick={() => setIsDark(!isDark)} className="p-2">
             {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
