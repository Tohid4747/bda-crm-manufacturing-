function escapeCsvValue(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportLeadsToCsv(leads) {
  const headers = [
    'Name',
    'Company',
    'Contact',
    'Email',
    'Status',
    'Assigned BDA',
    'Notes',
    'Created',
  ];

  const rows = leads.map((lead) => [
    lead.name,
    lead.company,
    lead.contact,
    lead.email,
    lead.status,
    lead.assignedTo?.name || 'Unassigned',
    lead.notes,
    lead.createdAt
      ? new Date(lead.createdAt).toLocaleDateString()
      : '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
