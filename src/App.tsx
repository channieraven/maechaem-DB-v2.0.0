import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlotsPage from './pages/PlotsPage';
import PlotDetailPage from './pages/PlotDetailPage';
import { TreeDetailPage, AddGrowthLogPage } from './pages/TreeDetailPage';
import { SurveyPage, SurveyPlotPage } from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

// Pending approval page (inline)
const PendingApprovalPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">รอการอนุมัติ</h2>
        <p className="text-sm text-gray-500 mb-6">
          บัญชีของคุณยังรอการอนุมัติจากผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งาน
        </p>
        <button
          onClick={logout}
          className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/pending-approval" element={<PendingApprovalPage />} />

    {/* Protected */}
    <Route path="/plots" element={
      <ProtectedRoute><PlotsPage /></ProtectedRoute>
    } />
    <Route path="/plots/:plotCode" element={
      <ProtectedRoute><PlotDetailPage /></ProtectedRoute>
    } />

    <Route path="/trees/:treeCode" element={
      <ProtectedRoute><TreeDetailPage /></ProtectedRoute>
    } />
    <Route path="/trees/:treeCode/add-log" element={
      <ProtectedRoute allowedRoles={['staff', 'researcher', 'admin']}>
        <AddGrowthLogPage />
      </ProtectedRoute>
    } />

    <Route path="/survey" element={
      <ProtectedRoute><SurveyPage /></ProtectedRoute>
    } />
    <Route path="/survey/:plotCode" element={
      <ProtectedRoute><SurveyPlotPage /></ProtectedRoute>
    } />

    <Route path="/dashboard" element={
      <ProtectedRoute><DashboardPage /></ProtectedRoute>
    } />

    <Route path="/admin" element={
      <ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>
    } />

    <Route path="/profile" element={
      <ProtectedRoute><ProfilePage /></ProtectedRoute>
    } />

    {/* Default redirect */}
    <Route path="/" element={<Navigate to="/plots" replace />} />
    <Route path="*" element={<Navigate to="/plots" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <AuthProvider>
      <OfflineProvider>
        <AppRoutes />
      </OfflineProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
