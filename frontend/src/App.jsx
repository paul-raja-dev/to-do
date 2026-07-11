import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// ─── PROTECTED ROUTE WRAPPER ──────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] animate-pulse">
          [ Authenticating... ]
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ─── PUBLIC ROUTE WRAPPER (redirect if already logged in) ─────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] animate-pulse">
          [ Loading... ]
        </span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch-all: redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
