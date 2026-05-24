export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide text-center">
          Manufacturing CRM
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 text-center">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-600 text-center">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
