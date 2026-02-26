import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import PlotCard from './PlotCard';
import { usePlots } from '../../hooks/usePlots';

const PlotList: React.FC = () => {
  const { plots, isLoading, error } = usePlots();
  const [search, setSearch] = useState('');

  const filtered = plots.filter(
    (p) =>
      p.owner_name.includes(search) ||
      p.plot_code.toLowerCase().includes(search.toLowerCase()) ||
      p.name_short.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#2d5a27]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 text-sm">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาแปลง..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">ไม่พบแปลงที่ค้นหา</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((plot) => (
            <PlotCard
              key={plot.id}
              plotCode={plot.plot_code}
              nameShort={plot.name_short}
              ownerName={plot.owner_name}
              groupNumber={plot.group_number}
              treeCount={plot.tree_count}
              aliveCount={plot.alive_count}
              latestSurveyDate={plot.latest_survey_date}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlotList;
