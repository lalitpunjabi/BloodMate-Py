import { useEffect, useState } from 'react';
import { Activity, HeartPulse, PlusCircle, Users } from 'lucide-react';

import api from '../services/api';

const initialForm = {
  full_name: '',
  blood_group: 'O+',
  hospital: '',
  phone: '',
  diagnosis: '',
  notes: '',
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function Recipients() {
  const [form, setForm] = useState(initialForm);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchRecipients = async () => {
    try {
      const response = await api.get('/recipients/');
      setRecipients(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load recipient profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/recipients/', form);
      setForm(initialForm);
      await fetchRecipients();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save recipient profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipient Management</h1>
          <p className="text-muted-foreground mt-1">
            Register patients, capture hospital details, and prepare blood request matching.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
          <Users size={16} className="text-primary" />
          {recipients.length} recipient profiles
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <PlusCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">New Recipient Profile</h2>
              <p className="text-sm text-muted-foreground">
                Add a patient record so staff can reuse details for urgent requests.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Patient Name</label>
              <input
                required
                type="text"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Aarav Sharma"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Blood Group</label>
                <select
                  value={form.blood_group}
                  onChange={(event) => setForm({ ...form, blood_group: event.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Hospital</label>
              <input
                required
                type="text"
                value={form.hospital}
                onChange={(event) => setForm({ ...form, hospital: event.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="City Care Hospital"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Diagnosis</label>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(event) => setForm({ ...form, diagnosis: event.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Emergency surgery / Thalassemia / Trauma"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Clinical Notes</label>
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add urgency context, physician notes, or handling instructions."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? <Activity size={16} className="animate-spin" /> : <HeartPulse size={16} />}
              {saving ? 'Saving Profile...' : 'Create Recipient Profile'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-semibold">Registered Recipients</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recipient records stay separate from donors so emergency handling remains explicit.
            </p>
          </div>

          <div className="max-h-[620px] overflow-auto">
            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center text-primary">
                <Activity className="animate-spin" size={32} />
              </div>
            ) : recipients.length === 0 ? (
              <div className="px-6 py-10 text-center text-muted-foreground">
                No recipient profiles exist yet.
              </div>
            ) : (
              <div className="divide-y">
                {recipients.map((recipient) => (
                  <article key={recipient.id} className="px-6 py-5 transition-colors hover:bg-muted/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{recipient.full_name}</h3>
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                            {recipient.blood_group}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{recipient.hospital}</p>
                        {recipient.diagnosis && (
                          <p className="mt-2 text-sm text-foreground/90">
                            Diagnosis: {recipient.diagnosis}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground sm:text-right">
                        <p>{recipient.phone || 'No phone added'}</p>
                        <p className="mt-1">
                          Created {new Date(recipient.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {recipient.notes && (
                      <p className="mt-3 rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground">
                        {recipient.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Recipients;
