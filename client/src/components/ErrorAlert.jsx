export default function ErrorAlert({ message, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start justify-between gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 ${className}`}
      role="alert"
    >
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-red-500 hover:text-red-700"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}
