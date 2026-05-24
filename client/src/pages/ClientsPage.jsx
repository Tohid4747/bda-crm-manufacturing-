import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';
import * as clientService from '../services/clientService';

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ClientsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const basePath = isAdmin ? '/admin/clients' : '/bda/clients';

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clientService.getClients();
      setClients(response.data.data.clients);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const pageTitle = useMemo(
    () => (isAdmin ? 'Admin — Client Management' : 'BDA — My Clients'),
    [isAdmin]
  );

  return (
    <DashboardLayout title={pageTitle}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Clients</h2>
        <p className="text-sm text-slate-600 mt-1">
          {isAdmin
            ? 'Clients converted from won leads across your team'
            : 'Clients converted from your won leads'}
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-600">Loading clients...</p>
        ) : clients.length === 0 ? (
          <p className="p-8 text-center text-slate-600">
            No clients yet. Move a lead to <strong>Closed Won</strong> to create a
            client automatically.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Deal Value</th>
                  <th className="px-4 py-3 font-medium">Assigned BDA</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {client.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{client.company}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {formatCurrency(client.dealValue)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {client.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`${basePath}/${client.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
