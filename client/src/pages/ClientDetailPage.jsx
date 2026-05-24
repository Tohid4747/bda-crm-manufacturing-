import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
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
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const listPath = isAdmin ? '/admin/clients' : '/bda/clients';

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clientService.getClientById(id);
      setClient(response.data.data.client);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load client'));
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const pageTitle = useMemo(
    () => (isAdmin ? 'Admin — Client Details' : 'BDA — Client Details'),
    [isAdmin]
  );

  return (
    <DashboardLayout title={pageTitle}>
      <Link
        to={listPath}
        className="inline-flex text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Clients
      </Link>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
        className="mb-4"
      />

      {loading ? (
        <LoadingSpinner label="Loading client..." />
      ) : client ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-8 py-6 border-b border-slate-200 bg-slate-50/50">
            <p className="text-sm font-medium text-blue-600">Client</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {client.name}
            </h2>
            <p className="text-slate-600 mt-1">{client.company}</p>
          </div>

          <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <section>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Contact Information
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Contact</dt>
                  <dd className="text-slate-900 mt-0.5">
                    {client.contact || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-900 mt-0.5">
                    {client.email || '—'}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Deal & Ownership
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Deal Value</dt>
                  <dd className="text-2xl font-semibold text-emerald-700 mt-0.5">
                    {formatCurrency(client.dealValue)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Assigned BDA</dt>
                  <dd className="text-slate-900 mt-0.5">
                    {client.assignedTo ? (
                      <>
                        <span className="font-medium">
                          {client.assignedTo.name}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">
                          {client.assignedTo.email}
                        </span>
                      </>
                    ) : (
                      'Unassigned'
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="md:col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Conversion
              </h3>
              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Converted from lead</dt>
                  <dd className="text-slate-900 mt-0.5">
                    {client.convertedFrom ? (
                      <>
                        {client.convertedFrom.name}
                        <span className="text-slate-500">
                          {' '}
                          ({client.convertedFrom.company})
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Client since</dt>
                  <dd className="text-slate-900 mt-0.5">
                    {formatDate(client.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
