import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import LeadFormModal from '../components/LeadFormModal';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';
import { LEAD_STATUSES } from '../constants/leads';
import * as leadService from '../services/leadService';
import * as userService from '../services/userService';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function LeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [leads, setLeads] = useState([]);
  const [bdaUsers, setBdaUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (isAdmin && assignedFilter) params.assignedTo = assignedFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await leadService.getLeads(params);
      setLeads(response.data.data.leads);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, assignedFilter, dateFrom, dateTo, isAdmin]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!isAdmin) return;

    userService
      .getBdaUsers()
      .then((res) => setBdaUsers(res.data.data.users))
      .catch(() => setBdaUsers([]));
  }, [isAdmin]);

  const handleCreate = async (payload) => {
    await leadService.createLead(payload);
    await fetchLeads();
  };

  const handleUpdate = async (payload) => {
    await leadService.updateLead(editingLead.id, payload);
    await fetchLeads();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await leadService.deleteLead(id);
      await fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleAssignChange = async (leadId, assignedTo) => {
    setAssigningId(leadId);
    try {
      if (assignedTo) {
        await leadService.assignLead(leadId, assignedTo);
      } else {
        await leadService.updateLead(leadId, { assignedTo: null });
      }
      await fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setAssigningId(null);
    }
  };

  const openAddModal = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLead(null);
  };

  const pageTitle = useMemo(
    () => (isAdmin ? 'Admin — Lead Management' : 'BDA — My Leads'),
    [isAdmin]
  );

  return (
    <DashboardLayout title={pageTitle}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Leads</h2>
          <p className="text-sm text-slate-600 mt-1">
            {isAdmin
              ? 'Manage and assign leads across your team'
              : 'View and update leads assigned to you'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Lead
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Search
            </label>
            <input
              type="search"
              placeholder="Name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Assigned BDA
              </label>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All BDAs</option>
                <option value="unassigned">Unassigned</option>
                {bdaUsers.map((bda) => (
                  <option key={bda.id} value={bda.id}>
                    {bda.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              From date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              To date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-600">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="p-8 text-center text-slate-600">No leads found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isAdmin && (
                    <th className="px-4 py-3 font-medium">Assigned BDA</th>
                  )}
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{lead.company}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{lead.contact || '—'}</div>
                      {lead.email && (
                        <div className="text-xs text-slate-400">{lead.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <select
                          value={lead.assignedTo?.id || ''}
                          disabled={assigningId === lead.id}
                          onChange={(e) =>
                            handleAssignChange(lead.id, e.target.value)
                          }
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs min-w-[140px]"
                        >
                          <option value="">Unassigned</option>
                          {bdaUsers.map((bda) => (
                            <option key={bda.id} value={bda.id}>
                              {bda.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(lead)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeadFormModal
        open={modalOpen}
        title={editingLead ? 'Edit Lead' : 'Add Lead'}
        initialData={editingLead}
        bdaUsers={bdaUsers}
        isAdmin={isAdmin}
        onClose={closeModal}
        onSubmit={editingLead ? handleUpdate : handleCreate}
      />
    </DashboardLayout>
  );
}
