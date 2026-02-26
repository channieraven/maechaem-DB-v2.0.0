import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trees, CheckCircle2, CalendarDays, BarChart3 } from 'lucide-react';

interface PlotCardProps {
  plotCode: string;
  nameShort: string;
  ownerName: string;
  groupNumber: number;
  treeCount: number;
  aliveCount: number;
  latestSurveyDate: string | null;
}

const PlotCard: React.FC<PlotCardProps> = ({
  plotCode,
  nameShort,
  ownerName,
  groupNumber,
  treeCount,
  aliveCount,
  latestSurveyDate,
}) => {
  const navigate = useNavigate();
  const survivalRate = treeCount > 0 ? Math.round((aliveCount / treeCount) * 100) : null;

  const survivalColor =
    survivalRate === null
      ? 'text-gray-400'
      : survivalRate >= 90
      ? 'text-green-600'
      : survivalRate >= 75
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <button
      onClick={() => navigate(`/plots/${plotCode}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md hover:border-green-200 transition-all active:scale-95 w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="inline-block bg-[#2d5a27] text-white text-xs font-bold px-2 py-0.5 rounded mb-1">
            {nameShort}
          </span>
          <p className="text-xs text-gray-500">กลุ่มที่ {groupNumber}</p>
        </div>
        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
          <Trees size={18} className="text-[#2d5a27]" />
        </div>
      </div>

      {/* Owner name */}
      <p className="text-sm font-semibold text-gray-800 mb-3 leading-tight">{ownerName}</p>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Trees size={12} />
          <span>{treeCount} ต้น</span>
        </div>

        {survivalRate !== null && (
          <div className={`flex items-center gap-1 ${survivalColor}`}>
            <CheckCircle2 size={12} />
            <span>{survivalRate}%</span>
          </div>
        )}

        {latestSurveyDate && (
          <div className="flex items-center gap-1 text-gray-400">
            <CalendarDays size={12} />
            <span>{latestSurveyDate}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default PlotCard;
