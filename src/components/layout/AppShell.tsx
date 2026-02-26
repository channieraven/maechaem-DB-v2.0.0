import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Trees, Map, BarChart3, ClipboardList, Settings, LogOut, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import OfflineIndicator from './OfflineIndicator';

interface AppShellProps {
  children: React.ReactNode;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const { pendingCount } = useOffline();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Offline / sync indicator */}
      <OfflineIndicator />

      {/* Top header (mobile) */}
      <header className="bg-[#2d5a27] text-white shadow-lg lg:hidden sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees size={22} className="text-green-300" />
            <span className="font-bold text-base">แม่แจ่ม DB</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
            <NavLink to="/profile" className="p-1">
              <User size={20} className="text-white/80" />
            </NavLink>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-60 bg-[#2d5a27] text-white shrink-0">
          <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
            <Trees size={26} className="text-green-300" />
            <div>
              <p className="font-bold text-base leading-tight">แม่แจ่ม DB</p>
              <p className="text-xs text-white/60">ระบบติดตามการฟื้นฟูป่า</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            <NavItem to="/plots" icon={<Trees size={18} />} label="แปลงปลูก" />
            <NavItem to="/survey" icon={<ClipboardList size={18} />} label="สำรวจภาคสนาม" />
            <NavItem to="/dashboard" icon={<BarChart3 size={18} />} label="แดชบอร์ด" />
            {profile?.role === 'admin' && (
              <NavItem to="/admin" icon={<Settings size={18} />} label="จัดการระบบ" />
            )}
          </nav>

          <div className="px-3 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {profile?.fullname?.[0] ?? user?.email?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.fullname ?? user?.email}</p>
                <p className="text-xs text-white/60 capitalize">{profile?.role ?? 'pending'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        <BottomNavItem to="/plots" icon={<Trees size={20} />} label="แปลง" />
        <BottomNavItem to="/survey" icon={<ClipboardList size={20} />} label="สำรวจ" />
        <BottomNavItem to="/dashboard" icon={<BarChart3 size={20} />} label="สถิติ" />
        {profile?.role === 'admin' && (
          <BottomNavItem to="/admin" icon={<Settings size={20} />} label="จัดการ" />
        )}
        <BottomNavItem to="/profile" icon={<User size={20} />} label="โปรไฟล์" />
      </nav>
    </div>
  );
};

const BottomNavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
        isActive ? 'text-[#2d5a27]' : 'text-gray-500 hover:text-gray-700'
      }`
    }
  >
    {icon}
    <span className="mt-0.5">{label}</span>
  </NavLink>
);

export default AppShell;
