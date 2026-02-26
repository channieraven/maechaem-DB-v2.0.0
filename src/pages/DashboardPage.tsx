import React from 'react';
import AppShell from '../components/layout/AppShell';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const DashboardPage: React.FC = () => (
  <AppShell>
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">📊 แดชบอร์ด</h1>
        <p className="text-sm text-gray-500 mt-1">ภาพรวมการฟื้นฟูป่าทุกแปลง</p>
      </div>
      <DashboardOverview />
    </div>
  </AppShell>
);

export default DashboardPage;
