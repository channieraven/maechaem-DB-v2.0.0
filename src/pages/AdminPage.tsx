import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import UserManagement from '../components/admin/UserManagement';
import DataExport from '../components/admin/DataExport';
import { Users, Download, Settings } from 'lucide-react';

type Tab = 'users' | 'export';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'จัดการผู้ใช้', icon: <Users size={16} /> },
    { id: 'export', label: 'ส่งออกข้อมูล', icon: <Download size={16} /> },
  ];

  return (
    <AppShell>
      <div className="p-4 lg:p-6">
        <div className="mb-5 flex items-center gap-3">
          <Settings size={20} className="text-[#2d5a27]" />
          <h1 className="text-xl font-bold text-gray-900">จัดการระบบ</h1>
        </div>

        {/* Tab strip */}
        <div className="flex gap-2 mb-5 border-b border-gray-200">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-[#2d5a27] text-[#2d5a27]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {tab === 'users' && <UserManagement />}
        {tab === 'export' && <DataExport />}
      </div>
    </AppShell>
  );
};

export default AdminPage;
