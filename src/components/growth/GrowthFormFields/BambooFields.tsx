import React from 'react';

interface BambooFieldsProps {
  culmCount: string;
  dbh1Cm: string;
  dbh2Cm: string;
  dbh3Cm: string;
  onChange: (field: string, value: string) => void;
}

const BambooFields: React.FC<BambooFieldsProps> = ({
  culmCount, dbh1Cm, dbh2Cm, dbh3Cm, onChange,
}) => (
  <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      ── ข้อมูลเฉพาะ (ไผ่) ──
    </p>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนลำ</label>
      <input
        type="number"
        min="0"
        value={culmCount}
        onChange={(e) => onChange('culmCount', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="0"
      />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[
        { field: 'dbh1Cm', value: dbh1Cm, label: 'DBH ลำที่ 1 (ซม.)' },
        { field: 'dbh2Cm', value: dbh2Cm, label: 'DBH ลำที่ 2 (ซม.)' },
        { field: 'dbh3Cm', value: dbh3Cm, label: 'DBH ลำที่ 3 (ซม.)' },
      ].map(({ field, value, label }) => (
        <div key={field}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.0"
          />
        </div>
      ))}
    </div>
  </div>
);

export default BambooFields;
