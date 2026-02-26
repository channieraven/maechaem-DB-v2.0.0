import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { usePlots } from '../../hooks/usePlots';

const SurvivalChart: React.FC = () => {
  const { plots, isLoading } = usePlots();

  const data = plots.map((p) => ({
    name: p.name_short,
    rate: p.tree_count > 0 ? Math.round((p.alive_count / p.tree_count) * 100) : 0,
  }));

  if (isLoading || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">อัตราการรอดตาย (%) รายแปลง</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip formatter={(v: any) => [`${v}%`, 'อัตราการรอดตาย']} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.rate >= 90 ? '#2d5a27' : entry.rate >= 75 ? '#ca8a04' : '#dc2626'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SurvivalChart;
