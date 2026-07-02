import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useDistributors } from './hooks/useDistributors';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DistributorForm from './pages/DistributorForm';
import DistributorDetail from './pages/DistributorDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { currentUser, register, login, logout } = useAuth();
  const { distributors, add, bulkAdd, update, remove, toggleStatus, getById } = useDistributors(currentUser?.id, currentUser?.role);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login onLogin={login} />
          </PublicRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <PublicRoute>
            <Register onRegister={register} />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout user={currentUser} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Dashboard
              user={currentUser}
              distributors={distributors}
              onToggleStatus={toggleStatus}
              onDelete={remove}
              onBulkAdd={bulkAdd}
            />
          }
        />
        <Route
          path="nova"
          element={
            <DistributorForm
              getById={getById}
              onAdd={add}
              onUpdate={update}
            />
          }
        />
        <Route
          path="editar/:id"
          element={
            <DistributorForm
              getById={getById}
              onAdd={add}
              onUpdate={update}
            />
          }
        />
        <Route
          path="detalhes/:id"
          element={
            <DistributorDetail
              getById={getById}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
