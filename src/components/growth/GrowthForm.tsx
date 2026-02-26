import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, CheckCircle2, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import type { TreeWithDetails } from '../../hooks/useTrees';
import type { PlantCategory } from '../../lib/database.types';
import CommonFields from './GrowthFormFields/CommonFields';
import DbhFields from './GrowthFormFields/DbhFields';
import BambooFields from './GrowthFormFields/BambooFields';
import BananaFields from './GrowthFormFields/BananaFields';

interface GrowthFormProps {
  tree: TreeWithDetails;
}

interface FormState {
  surveyDate: string;
  heightM: string;
  status: string;
  flowering: boolean;
  note: string;
  // dbh
  dbhCm: string;
  // bamboo
  culmCount: string;
  dbh1Cm: string;
  dbh2Cm: string;
  dbh3Cm: string;
  // banana
  totalPlants: string;
  plants1yr: string;
  yieldBunches: string;
  yieldHands: string;
  pricePerHand: string;
}

const initState = (): FormState => ({
  surveyDate: new Date().toLocaleDateString('sv'),
  heightM: '',
  status: 'alive',
  flowering: false,
  note: '',
  dbhCm: '',
  culmCount: '',
  dbh1Cm: '',
  dbh2Cm: '',
  dbh3Cm: '',
  totalPlants: '',
  plants1yr: '',
  yieldBunches: '',
  yieldHands: '',
  pricePerHand: '',
});

const GrowthForm: React.FC<GrowthFormProps> = ({ tree }) => {
  const { profile } = useAuth();
  const { submitGrowthLog, isOnline } = useOfflineSync();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; queued?: boolean; message?: string } | null>(null);

  const plantCategory = tree.species.plant_category as PlantCategory;

  const handleChange = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const result = await submitGrowthLog({
      tree_id: tree.id,
      survey_date: form.surveyDate,
      recorder_id: profile?.id ?? null,
      height_m: form.heightM ? parseFloat(form.heightM) : null,
      status: form.status || null,
      flowering: form.flowering,
      note: form.note || null,
      plantCategory,
      // dbh
      dbh_cm: form.dbhCm ? parseFloat(form.dbhCm) : null,
      // bamboo
      culm_count: form.culmCount ? parseInt(form.culmCount) : null,
      dbh_1_cm: form.dbh1Cm ? parseFloat(form.dbh1Cm) : null,
      dbh_2_cm: form.dbh2Cm ? parseFloat(form.dbh2Cm) : null,
      dbh_3_cm: form.dbh3Cm ? parseFloat(form.dbh3Cm) : null,
      // banana
      total_plants: form.totalPlants ? parseInt(form.totalPlants) : null,
      plants_1yr: form.plants1yr ? parseInt(form.plants1yr) : null,
      yield_bunches: form.yieldBunches ? parseInt(form.yieldBunches) : null,
      yield_hands: form.yieldHands ? parseInt(form.yieldHands) : null,
      price_per_hand: form.pricePerHand ? parseFloat(form.pricePerHand) : null,
    });

    setIsSubmitting(false);
    setResult(result);
    if (result.success) setForm(initState());
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={16} />
          <span>ย้อนกลับ</span>
        </button>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: `#${tree.species.hex_color}` }}
          >
            {tree.species.species_code}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">📝 บันทึกการเจริญเติบโต</h2>
            <p className="text-sm text-gray-600">
              ต้นไม้: <span className="font-mono font-semibold">{tree.tree_code}</span>
              {' '}({tree.species.name_th})
            </p>
            <p className="text-xs text-gray-400">
              แปลง: {tree.plot.name_short} | แถว: {tree.row_main}{tree.row_sub ? `-${tree.row_sub}` : ''}
            </p>
          </div>
        </div>
        {!isOnline && (
          <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
            <WifiOff size={13} />
            <span>ออฟไลน์ — ข้อมูลจะถูกบันทึกในเครื่องและส่งเมื่อมีสัญญาณ</span>
          </div>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
          ) : null}
          <div className="text-sm">
      {result?.success
              ? result.queued
                ? '✅ บันทึกในเครื่องแล้ว — รอส่งข้อมูลเมื่อมีสัญญาณ'
                : '✅ บันทึกข้อมูลสำเร็จ'
              : `❌ ${result?.message || 'เกิดข้อผิดพลาด'}`}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <CommonFields
          surveyDate={form.surveyDate}
          heightM={form.heightM}
          status={form.status}
          flowering={form.flowering}
          note={form.note}
          onChange={handleChange}
        />

        {/* Plant-specific fields */}
        {(plantCategory === 'forest' || plantCategory === 'rubber' || plantCategory === 'fruit') && (
          <DbhFields dbhCm={form.dbhCm} onChange={(v) => handleChange('dbhCm', v)} />
        )}
        {plantCategory === 'bamboo' && (
          <BambooFields
            culmCount={form.culmCount}
            dbh1Cm={form.dbh1Cm}
            dbh2Cm={form.dbh2Cm}
            dbh3Cm={form.dbh3Cm}
            onChange={handleChange}
          />
        )}
        {plantCategory === 'banana' && (
          <BananaFields
            totalPlants={form.totalPlants}
            plants1yr={form.plants1yr}
            yieldBunches={form.yieldBunches}
            yieldHands={form.yieldHands}
            pricePerHand={form.pricePerHand}
            onChange={handleChange}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#234820] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrowthForm;
