import React from 'react';

interface CommonFieldsProps {
  surveyDate: string;
  heightM: string;
  status: string;
  flowering: boolean;
  note: string;
  onChange: (field: string, value: string | boolean) => void;
}

const CommonFields: React.FC<CommonFieldsProps> = ({
  surveyDate,
  heightM,
  status,
  flowering,
  note,
  onChange,
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สำรวจ</label>
      <input
        type="date"
        value={surveyDate}
        onChange={(e) => onChange('surveyDate', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">ความสูง (เมตร)</label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={heightM}
        onChange={(e) => onChange('heightM', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="0.00"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
      <div className="flex gap-3">
        {[
          { value: 'alive', label: '🟢 มีชีวิต' },
          { value: 'dead', label: '🔴 ตาย' },
          { value: 'missing', label: '🟠 ไม่พบ' },
        ].map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value={value}
              checked={status === value}
              onChange={() => onChange('status', value)}
              className="accent-green-600 w-4 h-4"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={flowering}
          onChange={(e) => onChange('flowering', e.target.checked)}
          className="accent-green-600 w-5 h-5"
        />
        <span className="text-sm font-medium text-gray-700">ออกดอก / ติดผล</span>
      </label>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
      <textarea
        value={note}
        onChange={(e) => onChange('note', e.target.value)}
        rows={2}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        placeholder="หมายเหตุ (ถ้ามี)"
      />
    </div>
  </div>
);

export default CommonFields;
