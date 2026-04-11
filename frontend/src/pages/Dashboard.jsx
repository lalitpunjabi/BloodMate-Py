import { useState, useEffect } from 'react';
import { Users, Droplet, AlertCircle, Activity, X, Award, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function StatCard({ title, value, icon: Icon, trend, trendUp }) {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="text-primary" size={24} />
        </div>
      </div>
      {(trend || trend === 0) && (
      <div className="mt-4 flex items-center text-sm">
        <span className={trendUp ? "text-green-500 font-medium" : "text-destructive font-medium"}>
          {trendUp ? '+' : ''}{trend}
        </span>
        <span className="text-muted-foreground ml-2">vs last week</span>
      </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = localStorage.getItem('role') === 'admin';
  
  // Modal Form State
  const [campaign, setCampaign] = useState({ name: '', location: '', date: '', organizer: '' });

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      // Need ISO datetime format assuming input="datetime-local"
      await api.post('/campaigns/', {
        ...campaign,
        date: new Date(campaign.date).toISOString()
      });
      setIsModalOpen(false);
      alert('Blood Drive successfully scheduled!');
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create campaign.");
    }
  };

  // Dummy chart data until analytics implements historical timeseries explicitly
  const chartData = [
    { name: 'Mon', donations: 40, requests: 24 },
    { name: 'Tue', donations: 30, requests: 13 },
    { name: 'Wed', donations: 20, requests: 98 },
    { name: 'Thu', donations: 27, requests: 39 },
    { name: 'Fri', donations: 18, requests: 48 },
    { name: 'Sat', donations: 23, requests: 38 },
    { name: 'Sun', donations: 34, requests: 43 },
  ];

  if (loading) return <div className="p-10 flex justify-center text-primary"><Activity className="animate-spin" size={40} /></div>;

  // Assuming active emergencies are computed (requests pending + emergency tag)
  const activeEmergencies = stats ? Math.floor(stats.pending_requests / 3) : 0; 
  
  // Compute Available Units loosely for stats bar
  const totalUnits = stats ? stats.inventory_data.reduce((acc, curr) => acc + curr.count, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor blood bank activity and emergency alerts.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            + New Blood Drive
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl flex flex-col pt-6 pb-8 px-6 relative animate-in zoom-in-95 duration-200 border">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:bg-muted p-1 rounded-md">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Schedule a Blood Drive</h2>
            <form onSubmit={handleCampaignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input required type="text" value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-background focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Summer Donor Drive"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input required type="text" value={campaign.location} onChange={e => setCampaign({...campaign, location: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-background focus:ring-1 focus:ring-primary focus:outline-none" placeholder="City Central Park"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input required type="datetime-local" value={campaign.date} onChange={e => setCampaign({...campaign, date: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-background focus:ring-1 focus:ring-primary focus:outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organizer (Dept/Hospital)</label>
                <input required type="text" value={campaign.organizer} onChange={e => setCampaign({...campaign, organizer: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-background focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Red Cross Partner"/>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 mt-4 rounded-md font-medium transition-colors">
                Publish Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Donors" value={stats?.donor_count || 0} icon={Users} trend={2} trendUp={true} />
        <StatCard title="Available Units" value={totalUnits} icon={Droplet} trend={5} trendUp={true} />
        <StatCard title="Pending Requests" value={stats?.pending_requests || 0} icon={Activity} trend={0} trendUp={true} />
        <StatCard title="Active Emergencies" value={activeEmergencies} icon={AlertCircle} trend={0} trendUp={true} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="donations" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorDonations)" />
                <Area type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gamification / Leaderboard */}
        <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Award className="text-primary"/> Achievement Board</h2>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">All-Time</span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[300px]">
            {stats?.leaderboard && stats.leaderboard.length > 0 ? (
              stats.leaderboard.map((donor, i) => {
                let badgeColor = "text-amber-700 bg-amber-100 dark:bg-amber-900/30"; // Bronze
                let badgeName = "Bronze";
                if (donor.points >= 400) { badgeColor = "text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30"; badgeName = "Platinum"; }
                else if (donor.points >= 300) { badgeColor = "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30"; badgeName = "Gold"; }
                else if (donor.points >= 200) { badgeColor = "text-slate-400 bg-slate-100 dark:bg-slate-800"; badgeName = "Silver"; }

                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{donor.name}</p>
                        <p className="text-xs text-muted-foreground">{donor.points} pts</p>
                      </div>
                    </div>
                    <div title={`${badgeName} Tier`} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>
                       <Shield size={14} /> {badgeName}
                    </div>
                  </div>
                );
            })) : (
              <p className="text-sm text-muted-foreground text-center py-4">No donors found yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
