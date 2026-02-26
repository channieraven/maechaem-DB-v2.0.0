import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlots } from '../../hooks/usePlots';
import { Trees, ChevronRight, Loader2 } from 'lucide-react';

const PlotSelector: React.FC = () => {
  const navigate = useNavigate();
  const { plots, isLoading } = usePlots();
  const [search, setSearch] = useState('');

  const filtered = plots.filter(
    (p) =>
      p.owner_name.includes(search) ||
      p.plot_code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-[#2d5a27]" />
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ค้นหาแปลง..."
        className="w-full mb-4 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="space-y-2">
        {filtered.map((plot) => (
          <button
            key={plot.id}
            onClick={() => navigate(`/survey/${plot.plot_code}`)}
            className="w-full bg-white rounded-xl border border-gray-100 px-4 py-4 flex items-center gap-4 hover:shadow-md hover:border-green-200 transition-all active:scale-95 text-left"
          >
            <div className="w-12 h-12 bg-[#2d5a27]/10 rounded-xl flex items-center justify-center shrink-0">
              <Trees size={22} className="text-[#2d5a27]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{plot.name_short} — {plot.owner_name}</p>
              <p className="text-xs text-gray-500">{plot.tree_count} ต้น · กลุ่มที่ {plot.group_number}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlotSelector;
