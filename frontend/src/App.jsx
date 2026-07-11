import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Server, Globe } from 'lucide-react';

function App() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failure'
  const [error, setError] = useState(null);
  const [responseDetails, setResponseDetails] = useState(null);
  const [backendUrl, setBackendUrl] = useState('http://127.0.0.1:8000');

  const checkConnection = useCallback(async (urlToCheck = backendUrl) => {
    setStatus('loading');
    setError(null);
    setResponseDetails(null);

    let targetUrl = urlToCheck.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });

      clearTimeout(id);

      if (res.ok) {
        let text = '';
        try {
          text = await res.text();
        } catch {
          text = '(Empty response body)';
        }

        setStatus('success');
        setResponseDetails({
          status: res.status,
          statusText: res.statusText || 'OK',
          data: text.slice(0, 200) + (text.length > 200 ? '...' : '')
        });
      } else {
        setStatus('failure');
        setError(`Server returned status: ${res.status} (${res.statusText || 'Error'})`);
      }
    } catch (err) {
      setStatus('failure');
      if (err.name === 'AbortError') {
        setError('Request timed out (server took too long to respond)');
      } else {
        setError(err.message || 'Network error / CORS issue (Failed to fetch)');
      }
    }
  }, [backendUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkConnection();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkConnection]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e1b4b,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_75%,#0f172a,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Backend Status Check
            </h1>
            <p className="text-xs text-slate-400">
              Verify connectivity to the backend server
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
              <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-300">Checking connection...</p>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-full">{backendUrl}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400">
              <div className="p-3 bg-emerald-500/10 rounded-full mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <p className="text-lg font-semibold text-emerald-400">SUCCESS</p>
              <p className="text-sm font-medium text-emerald-200 mt-1">Backend is reachable!</p>

              {responseDetails && (
                <div className="w-full mt-4 p-3 bg-slate-950/60 rounded-lg text-left text-xs font-mono text-slate-300 border border-slate-800">
                  <div className="text-emerald-500 font-semibold mb-1">Response details:</div>
                  <div>Status: {responseDetails.status} {responseDetails.statusText}</div>
                  {responseDetails.data && (
                    <div className="mt-2 text-slate-400 max-h-20 overflow-y-auto break-all">
                      Data: {responseDetails.data}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {status === 'failure' && (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-full mb-4">
                <XCircle className="w-10 h-10" />
              </div>
              <p className="text-lg font-semibold text-rose-400">FAILURE</p>
              <p className="text-sm font-medium text-rose-200 mt-1 text-center">Cannot reach the backend server</p>

              {error && (
                <div className="w-full mt-4 p-3 bg-slate-950/60 rounded-lg text-left text-xs font-mono text-slate-300 border border-slate-800">
                  <div className="text-rose-500 font-semibold mb-1">Error message:</div>
                  <div className="text-slate-300 whitespace-pre-wrap break-all">{error}</div>
                  <div className="mt-2 text-[10px] text-slate-500 leading-normal">
                    * Make sure your backend server is running on <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">127.0.0.1:8000</code> and CORS is enabled if requesting from different origins.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input and Action */}
        <div className="space-y-4">
          <div>
            <label htmlFor="backend-url-input" className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Target Backend URL:
            </label>
            <input
              id="backend-url-input"
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="e.g. http://127.0.0.1:8000"
            />
          </div>

          <button
            onClick={() => checkConnection()}
            disabled={status === 'loading'}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            Check Connection Now
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
