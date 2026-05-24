import StatusBadge from './StatusBadge';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function LeadsTable({
  leads,
  isAdmin,
  bdaUsers,
  assigningId,
  onEdit,
  onDelete,
  onAssignChange,
}) {
  if (leads.length === 0) {
    return <p className="p-8 text-center text-slate-600">No leads found.</p>;
  }

  return (
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
                    onChange={(e) => onAssignChange(lead.id, e.target.value)}
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
                  onClick={() => onEdit(lead)}
                  className="text-blue-600 hover:underline mr-3"
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDelete(lead.id)}
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
  );
}
