import React from 'react';

interface BananaFieldsProps {
  totalPlants: string;
  plants1yr: string;
  yieldBunches: string;
  yieldHands: string;
  pricePerHand: string;
  onChange: (field: string, value: string) => void;
}

const BananaFields: React.FC<BananaFieldsProps> = ({
  totalPlants, plants1yr, yieldBunches, yieldHands, pricePerHand, onChange,
}) => (
  <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      ── ข้อมูลเฉพาะ (กล้วย) ──
    </p>
    <div className="grid grid-cols-2 gap-3">
      {[
        { field: 'totalPlants', value: totalPlants, label: 'จำนวนต้นทั้งหมด' },
        { field: 'plants1yr', value: plants1yr, label: 'จำนวนต้นอายุ 1 ปี' },
        { field: 'yieldBunches', value: yieldBunches, label: 'ผลผลิต (เครือ)' },
        { field: 'yieldHands', value: yieldHands, label: 'ผลผลิต (หวี)' },
      ].map(({ field, value, label }) => (
        <div key={field}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
        </div>
      ))}
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ราคาต่อหวี (บาท)</label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={pricePerHand}
        onChange={(e) => onChange('pricePerHand', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="0.00"
      />
    </div>
  </div>
);

export default BananaFields;
