import { API_BASE_URL } from './constants/api';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
          Manufacturing CRM
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          BDA Team Module
        </h1>
        <p className="mt-3 text-slate-600">
          Base project is ready. Features will be added in upcoming phases.
        </p>
        <p className="mt-6 text-xs text-slate-400 font-mono break-all">
          API: {API_BASE_URL}
        </p>
      </div>
    </div>
  );
}

export default App;
