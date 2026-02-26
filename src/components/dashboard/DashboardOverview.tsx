import React from 'react';
import { Trees, CheckCircle2, CalendarDays, BarChart3 } from 'lucide-react';
import { usePlots } from '../../hooks/usePlots';
import SurvivalChart from './SurvivalChart';

const DashboardOverview: React.FC = () => {
  const { plots, isLoading } = usePlots();

  const totalTrees = plots.reduce((s, p) => s + p.tree_count, 0);
  const totalAlive = plots.reduce((s, p) => s + p.alive_count, 0);
  const overallRate = totalTrees > 0 ? Math.round((totalAlive / totalTrees) * 100) : null;

  const stats = [
    {
      label: 'ต้นไม้ทั้งหมด',
      value: totalTrees.toLocaleString(),
      icon: <Trees size={20} className="text-[#2d5a27]" />,
      bg: 'bg-green-50',
    },
    {
      label: 'อัตราการรอดตาย',
      value: overallRate !== null ? `${overallRate}%` : '—',
      icon: <CheckCircle2 size={20} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      label: 'จำนวนแปลง',
      value: plots.length.toString(),
      icon: <BarChart3 size={20} className="text-blue-600" />,
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg} border border-white shadow-sm`}>
            <div className="flex items-center gap-3 mb-2">
              {icon}
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : value}</p>
          </div>
        ))}
      </div>

      {/* Survival chart */}
      <SurvivalChart />
    </div>
  );
};

export default DashboardOverview;
