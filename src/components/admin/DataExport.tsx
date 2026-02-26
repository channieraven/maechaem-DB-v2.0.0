import React from 'react';
import supabase from '../../lib/supabase';
import { Download } from 'lucide-react';

const DataExport: React.FC = () => {
  const handleExport = async () => {
    const { data } = await supabase
      .from('growth_logs')
      .select(`
        survey_date,
        height_m,
        status,
        flowering,
        note,
        tree:trees!inner ( tree_code, plot:plots!inner ( plot_code ) ),
        growth_dbh ( dbh_cm )
      `)
      .order('survey_date', { ascending: false });

    if (!data) return;

    const rows = (data as any[]).map((row) => ({
      plot_code: row.tree?.plot?.plot_code ?? '',
      tree_code: row.tree?.tree_code ?? '',
      survey_date: row.survey_date,
      height_m: row.height_m ?? '',
      dbh_cm: row.growth_dbh?.dbh_cm ?? '',
      status: row.status ?? '',
      flowering: row.flowering ? 'yes' : 'no',
      note: row.note ?? '',
    }));

    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => JSON.stringify((r as any)[h] ?? '')).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth_logs_${new Date().toLocaleDateString('sv')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-2">ส่งออกข้อมูล</h3>
      <p className="text-sm text-gray-500 mb-4">ดาวน์โหลดข้อมูลการเจริญเติบโตทั้งหมดเป็นไฟล์ CSV</p>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-medium rounded-lg hover:bg-[#234820] transition-colors"
      >
        <Download size={15} />
        ดาวน์โหลด CSV
      </button>
    </div>
  );
};

export default DataExport;
