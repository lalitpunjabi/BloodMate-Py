import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Activity, Download } from 'lucide-react';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';

function Inventory() {
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem('role') === 'admin';

  const fetchData = async () => {
    try {
      // Fetch Requests
      const reqRes = await api.get('/requests/');
      setRequests(reqRes.data);

      // Fetch Inventory Stats from analytics
      // The backend analytics endpoint returns { inventory_data: [{blood_group, count}] }
      const statRes = await api.get('/analytics/dashboard');
      
      // Standardize Blood Groups
      const standardGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      const fetchedCountMap = {};
      (statRes.data.inventory_data || []).forEach(item => {
        fetchedCountMap[item.blood_group] = item.count;
      });
      
      const mappedInventory = standardGroups.map(group => {
        const units = fetchedCountMap[group] || 0;
        let status = 'Optimal';
        if (units < 10) status = 'Critical';
        else if (units < 30) status = 'Low';
        
        return { group, units, status };
      });
      
      setInventory(mappedInventory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/requests/${id}/status?status=${newStatus}`);
      fetchData(); // Refresh natively
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleExport = () => {
    const formattedData = requests.map(r => ({
      RequestID: r.id,
      Hospital: r.hospital,
      Patient: r.patient_name,
      BloodGroup: r.blood_group,
      Units: r.units_required,
      Urgency: r.urgency_level,
      Status: r.status,
      SubmittedAt: new Date(r.created_at).toLocaleDateString()
    }));
    exportToCsv('BloodMate_Requests', formattedData, ['RequestID', 'Hospital', 'Patient', 'BloodGroup', 'Units', 'Urgency', 'Status', 'SubmittedAt']);
  };

  const activeRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory & Requests</h1>
        <p className="text-muted-foreground mt-1">Manage live blood stock levels and hospital requests.</p>
      </div>

      {/* Requests Section */}
      <div className="relative min-h-[200px]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 className="text-xl font-semibold flex items-center">
            Live Requests
            <span className="ml-3 bg-primary/10 text-primary text-xs py-1 px-2 rounded-full font-bold">
              {activeRequests} Active
            </span>
          </h2>
          <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-medium transition-colors shadow-sm">
            <Download size={16} />
            <span>Export Requests</span>
          </button>
        </div>
        
        {loading ? (
             <div className="absolute inset-0 flex justify-center items-center text-primary">
                <Activity className="animate-spin" size={32} />
             </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.length === 0 && <p className="text-muted-foreground">No current requests found.</p>}
          {requests.map((req) => (
            <div key={req.id} className={`bg-card border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${req.urgency_level === 'Emergency' ? 'border-destructive' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {req.blood_group}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">x{req.units_required} units</span>
                </div>
                {req.urgency_level === 'Emergency' && (
                  <span className="text-destructive flex items-center text-xs font-bold animate-pulse">
                    <AlertTriangle size={14} className="mr-1" /> Emergency
                  </span>
                )}
              </div>
              
              <h3 className="font-medium text-foreground">{req.patient_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Hospital: {req.hospital}</p>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center text-sm">
                  {req.status === 'pending' ? (
                    <span className="text-amber-500 flex items-center font-medium">
                      <Clock size={16} className="mr-1" /> Pending
                    </span>
                  ) : req.status === 'fulfilled' ? (
                    <span className="text-green-500 flex items-center font-medium">
                      <CheckCircle size={16} className="mr-1" /> Fulfilled
                    </span>
                  ) : (
                    <span className="text-blue-500 flex items-center font-medium">
                      <CheckCircle size={16} className="mr-1" /> {req.status}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</span>
              </div>
              
              {isAdmin && req.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleUpdateStatus(req.id, 'fulfilled')} className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Fulfill
                  </button>
                  <button onClick={() => handleUpdateStatus(req.id, 'cancelled')} className="flex-1 bg-muted text-foreground py-2 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors">
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Inventory Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Stock Levels</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {!loading && inventory.map((item) => (
            <div key={item.group} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black mb-2 ${
                item.status === 'Critical' ? 'text-destructive' : 
                item.status === 'Low' ? 'text-amber-500' : 'text-primary'
              }`}>
                {item.group}
              </span>
              <span className="text-3xl font-light text-foreground">{item.units}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Units</span>
              
              <span className={`mt-3 text-xs font-bold px-2 py-1 rounded-full ${
                item.status === 'Critical' ? 'bg-destructive/10 text-destructive' : 
                item.status === 'Low' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
