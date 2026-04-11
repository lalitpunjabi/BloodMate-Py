import { useState, useEffect } from 'react';
import { Search, Filter, Download, Activity } from 'lucide-react';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';

function Donors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: Only admins can view the donors page per our layout routing
  // However, the backend also restricts this securely

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await api.get('/donors/');
        setDonors(response.data);
      } catch (err) {
        console.error("Failed to load donors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const handleExport = () => {
    const formattedData = donors.map(d => ({
      Name: d.user?.full_name || 'Unknown',
      Email: d.user?.email || 'N/A',
      BloodGroup: d.blood_group,
      Status: d.eligibility_status ? 'Eligible' : 'Ineligible',
      Phone: d.phone || 'N/A',
      LastDonation: d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : 'Never'
    }));
    exportToCsv('BloodMate_Donors', formattedData, ['Name', 'Email', 'BloodGroup', 'Status', 'Phone', 'LastDonation']);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donor Management</h1>
          <p className="text-muted-foreground mt-1">Manage donor profiles and track eligibility dynamically.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search database..."
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleExport} className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {loading ? (
             <div className="absolute inset-0 flex justify-center items-center text-primary">
                <Activity className="animate-spin" size={32} />
             </div>
          ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Email</th>
                <th className="px-6 py-4 font-medium">Blood Group</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Last Donation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donors.filter(d => (d.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((donor) => (
                <tr key={donor.id} className="bg-card hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                     {donor.user?.full_name || 'Unknown'}
                     <div className="text-xs text-muted-foreground font-normal mt-0.5">{donor.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      !donor.eligibility_status 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                    }`}>
                      {donor.eligibility_status ? 'Eligible' : 'Ineligible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{donor.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                     {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
              {donors.length === 0 && (
                <tr>
                   <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No donors found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Donors;
