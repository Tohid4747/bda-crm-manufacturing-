import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import ActivityForm from '../components/ActivityForm';
import ActivityTimeline from '../components/ActivityTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';
import * as leadService from '../services/leadService';
import * as activityService from '../services/activityService';

export default function LeadDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingLead, setLoadingLead] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState('');

  const listPath = isAdmin ? '/admin/leads' : '/bda/leads';

  const fetchLead = useCallback(async () => {
    setLoadingLead(true);
    setError('');
    try {
      const response = await leadService.getLeadById(id);
      setLead(response.data.data.lead);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load lead'));
      setLead(null);
    } finally {
      setLoadingLead(false);
    }
  }, [id]);

  const fetchActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const response = await activityService.getActivitiesByLead(id);
      setActivities(response.data.data.activities);
    } catch (err) {
      setActivities([]);
      setError(getApiErrorMessage(err, 'Failed to load activities'));
    } finally {
      setLoadingActivities(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
    fetchActivities();
  }, [fetchLead, fetchActivities]);

  const handleLogActivity = async (payload) => {
    await activityService.createActivity(payload);
    await fetchActivities();
  };

  const pageTitle = useMemo(
    () => (isAdmin ? 'Admin — Lead Details' : 'BDA — Lead Details'),
    [isAdmin]
  );

  return (
    <DashboardLayout title={pageTitle}>
      <Link
        to={listPath}
        className="inline-flex text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Leads
      </Link>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
        className="mb-4"
      />

      {loadingLead ? (
        <LoadingSpinner label="Loading lead..." />
      ) : lead ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {lead.name}
                  </h2>
                  <p className="text-slate-600 mt-1">{lead.company}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Contact</dt>
                  <dd className="text-slate-900">{lead.contact || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-900">{lead.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Assigned BDA</dt>
                  <dd className="text-slate-900">
                    {lead.assignedTo?.name || 'Unassigned'}
                  </dd>
                </div>
                {lead.notes && (
                  <div>
                    <dt className="text-slate-500">Lead notes</dt>
                    <dd className="text-slate-900 whitespace-pre-wrap">
                      {lead.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <ActivityForm leadId={lead.id} onSuccess={handleLogActivity} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Activity Timeline
              </h3>
              <p className="text-sm text-slate-600 mt-1 mb-6">
                History of calls, emails, and meetings for this lead
              </p>
              <ActivityTimeline
                activities={activities}
                loading={loadingActivities}
              />
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
