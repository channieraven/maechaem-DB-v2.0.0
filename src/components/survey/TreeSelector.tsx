import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrees } from '../../hooks/useTrees';
import { useGrowthLogs } from '../../hooks/useGrowthLogs';
import { Search, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface TreeSelectorProps {
  plotCode: string;
  plotId: string;
}

const TreeSelector: React.FC<TreeSelectorProps> = ({ plotCode, plotId }) => {
  const navigate = useNavigate();
  const { trees, isLoading } = useTrees(plotId);
  const { logs } = useGrowthLogs(plotId);
  const [search, setSearch] = useState('');

  const today = new Date().toLocaleDateString('sv');

  // Which tree_ids have been surveyed today?
  const surveyedTodayIds = new Set(
    logs.filter((l) => l.survey_date === today).map((l) => l.tree_id)
  );

  const filtered = trees.filter(
    (t) =>
      !search ||
      t.tree_code.toLowerCase().includes(search.toLowerCase()) ||
      t.species.name_th.includes(search)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#2d5a27]" />
      </div>
    );
  }

  const surveyedCount = trees.filter((t) => surveyedTodayIds.has(t.id)).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
        <span>สำรวจวันนี้: <strong className="text-[#2d5a27]">{surveyedCount}</strong> / {trees.length} ต้น</span>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาต้นไม้..."
          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((tree) => {
          const done = surveyedTodayIds.has(tree.id);
          return (
            <button
              key={tree.id}
              onClick={() => navigate(`/trees/${tree.tree_code}/add-log`)}
              className={`w-full bg-white rounded-xl border px-4 py-4 flex items-center gap-4 text-left transition-all active:scale-95 ${
                done
                  ? 'border-green-200 bg-green-50 opacity-75'
                  : 'border-gray-100 hover:shadow-md hover:border-green-200'
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: `#${tree.species.hex_color}` }}
              >
                {tree.species.species_code}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 font-mono">{tree.tree_code}</p>
                <p className="text-xs text-gray-500">{tree.species.name_th}</p>
              </div>
              {done ? (
                <CheckCircle2 size={20} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={20} className="text-gray-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TreeSelector;
