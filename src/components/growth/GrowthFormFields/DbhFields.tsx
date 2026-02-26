import React from 'react';

interface DbhFieldsProps {
  dbhCm: string;
  onChange: (value: string) => void;
}

const DbhFields: React.FC<DbhFieldsProps> = ({ dbhCm, onChange }) => (
  <div className="border-t border-gray-100 pt-4 mt-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
      ── ข้อมูลเฉพาะ (ไม้ป่า / ยางพารา / ไม้ผล) ──
    </p>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        DBH — เส้นผ่าศูนย์กลางที่อก (ซม.)
      </label>
      <input
        type="number"
        step="0.1"
        min="0"
        value={dbhCm}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="0.0"
      />
    </div>
  </div>
);

export default DbhFields;
