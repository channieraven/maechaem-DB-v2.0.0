import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import GrowthForm from '../components/growth/GrowthForm';
import GrowthChart from '../components/growth/GrowthChart';
import { useTree } from '../hooks/useTrees';
import { useTreeGrowthLogs } from '../hooks/useGrowthLogs';

// ── Tree Detail ───────────────────────────────────────────────────────────────

export const TreeDetailPage: React.FC = () => {
  const { treeCode } = useParams<{ treeCode: string }>();
  const navigate = useNavigate();
  const { tree, isLoading: treeLoading } = useTree(treeCode);
  const { logs, isLoading: logsLoading } = useTreeGrowthLogs(tree?.id);

  if (treeLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#2d5a27]" />
        </div>
      </AppShell>
    );
  }

  if (!tree) {
    return (
      <AppShell>
        <div className="p-4 text-center text-gray-500">ไม่พบข้อมูลต้นไม้</div>
      </AppShell>
    );
  }

  const showDbh =
    tree.species.plant_category === 'forest' ||
    tree.species.plant_category === 'rubber' ||
    tree.species.plant_category === 'fruit';

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          <span>ย้อนกลับ</span>
        </button>

        {/* Tree header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
              style={{ backgroundColor: `#${tree.species.hex_color}` }}
            >
              {tree.species.species_code}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 font-mono">{tree.tree_code}</h1>
              <p className="text-gray-700 font-medium">{tree.species.name_th}</p>
              {tree.species.name_sci && (
                <p className="text-gray-400 text-sm italic">{tree.species.name_sci}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                แปลง {tree.plot.name_short} · แถว {tree.row_main}{tree.row_sub ? `-${tree.row_sub}` : ''}
                {tree.tag_label ? ` · ป้าย ${tree.tag_label}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Growth chart */}
        {!logsLoading && logs.length > 0 && (
          <div className="mb-4">
            <GrowthChart logs={logs} showDbh={showDbh} />
          </div>
        )}

        {/* Log history table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800">ประวัติการสำรวจ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {(showDbh
                    ? ['วันที่', 'ความสูง (ม.)', 'DBH (ซม.)', 'สถานะ', 'หมายเหตุ']
                    : ['วันที่', 'ความสูง (ม.)', 'สถานะ', 'หมายเหตุ']
                  ).map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center">
                      <Loader2 size={18} className="animate-spin text-[#2d5a27] mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">ยังไม่มีข้อมูลการสำรวจ</td>
                  </tr>
                ) : (
                  [...logs].reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-600">{log.survey_date}</td>
                      <td className="px-4 py-2.5">{log.height_m ?? '—'}</td>
                      {showDbh && <td className="px-4 py-2.5">{log.growth_dbh?.dbh_cm ?? '—'}</td>}
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          log.status === 'alive' ? 'bg-green-100 text-green-700' :
                          log.status === 'dead' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {log.status === 'alive' ? 'มีชีวิต' : log.status === 'dead' ? 'ตาย' : log.status ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{log.note ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

// ── Add Growth Log ────────────────────────────────────────────────────────────

export const AddGrowthLogPage: React.FC = () => {
  const { treeCode } = useParams<{ treeCode: string }>();
  const { tree, isLoading } = useTree(treeCode);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#2d5a27]" />
        </div>
      </AppShell>
    );
  }

  if (!tree) {
    return (
      <AppShell>
        <div className="p-4 text-center text-gray-500">ไม่พบข้อมูลต้นไม้</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-6">
        <GrowthForm tree={tree} />
      </div>
    </AppShell>
  );
};
