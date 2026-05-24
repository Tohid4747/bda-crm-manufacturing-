import { useState } from 'react';
import { ACTIVITY_TYPES } from '../constants/activities';
import ErrorAlert from './ErrorAlert';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

const emptyForm = {
  type: 'Call',
  notes: '',
  followUpDate: '',
};

export default function ActivityForm({ leadId, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSuccess({
        leadId,
        type: form.type,
        notes: form.notes,
        followUpDate: form.followUpDate || null,
      });
      setForm(emptyForm);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to log activity. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Log Activity</h3>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Follow-up date
          </label>
          <input
            type="date"
            name="followUpDate"
            value={form.followUpDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          placeholder="What was discussed or planned..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? 'Saving...' : 'Log Activity'}
      </button>
    </form>
  );
}
