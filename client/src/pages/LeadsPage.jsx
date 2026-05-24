import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LeadFormModal from '../components/LeadFormModal';
import LeadsTable from '../components/LeadsTable';
import LeadsKanbanBoard from '../components/LeadsKanbanBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';
import { LEAD_STATUSES } from '../constants/leads';
import { exportLeadsToCsv } from '../utils/exportLeadsCsv';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import * as leadService from '../services/leadService';
import * as userService from '../services/userService';

const VIEWS = {
  TABLE: 'table',
  KANBAN: 'kanban',
};

export default function LeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [leads, setLeads] = useState([]);
  const [bdaUsers, setBdaUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState(VIEWS.TABLE);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

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
      setError(getApiErrorMessage(err, 'Failed to load leads'));
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
      setError(getApiErrorMessage(err, 'Failed to delete lead'));
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
      setError(getApiErrorMessage(err, 'Failed to update assignment'));
    } finally {
      setAssigningId(null);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const previousLeads = leads;
    setUpdatingLeadId(leadId);
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    try {
      await leadService.updateLead(leadId, { status: newStatus });
    } catch (err) {
      setLeads(previousLeads);
      setError(getApiErrorMessage(err, 'Failed to update lead status'));
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      setError('No leads to export');
      return;
    }
    exportLeadsToCsv(leads);
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

  const leadsBasePath = isAdmin ? '/admin/leads' : '/bda/leads';

  const pageTitle = useMemo(
    () => (isAdmin ? 'Admin — Lead Management' : 'BDA — My Leads'),
    [isAdmin]
  );

  return (
    <DashboardLayout title={pageTitle}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Leads
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isAdmin
              ? 'Manage and assign leads across your team'
              : 'View and update leads assigned to you'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setView(VIEWS.TABLE)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === VIEWS.TABLE
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView(VIEWS.KANBAN)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === VIEWS.KANBAN
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban
            </button>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loading || leads.length === 0}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Export CSV
          </button>
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
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

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
        className="mb-4"
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <LoadingSpinner label="Loading leads..." />
        </div>
      ) : view === VIEWS.KANBAN ? (
        <LeadsKanbanBoard
          leads={leads}
          onStatusChange={handleStatusChange}
          updatingLeadId={updatingLeadId}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <LeadsTable
            leads={leads}
            isAdmin={isAdmin}
            bdaUsers={bdaUsers}
            assigningId={assigningId}
            leadsBasePath={leadsBasePath}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onAssignChange={handleAssignChange}
          />
        </div>
      )}

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
