import React from 'react';
import AppShell from '../components/layout/AppShell';
import PlotList from '../components/plots/PlotList';

const PlotsPage: React.FC = () => (
  <AppShell>
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">🌲 แปลงฟื้นฟูป่าแม่แจ่ม</h1>
        <p className="text-sm text-gray-500 mt-1">โครงการปลูกป่าอเนกประสงค์ อ.แม่แจ่ม จ.เชียงใหม่</p>
      </div>
      <PlotList />
    </div>
  </AppShell>
);

export default PlotsPage;
