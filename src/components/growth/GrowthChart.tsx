import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { GrowthLogFull } from '../../hooks/useGrowthLogs';

interface GrowthChartProps {
  logs: GrowthLogFull[];
  showDbh?: boolean;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ logs, showDbh = false }) => {
  const data = logs.map((log) => ({
    date: log.survey_date,
    height: log.height_m ?? null,
    dbh: log.growth_dbh?.dbh_cm ?? null,
  }));

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl">
        ยังไม่มีข้อมูลการเจริญเติบโต
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">กราฟการเจริญเติบโต</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: any, name: string) => [
              `${value} ${name === 'height' ? 'ม.' : 'ซม.'}`,
              name === 'height' ? 'ความสูง' : 'DBH',
            ]}
          />
          <Legend formatter={(v) => (v === 'height' ? 'ความสูง (ม.)' : 'DBH (ซม.)')} />
          <Line
            type="monotone"
            dataKey="height"
            stroke="#2d5a27"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          {showDbh && (
            <Line
              type="monotone"
              dataKey="dbh"
              stroke="#4a7c42"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
