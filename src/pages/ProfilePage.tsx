import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, profile, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState(profile?.fullname ?? '');
  const [position, setPosition] = useState(profile?.position ?? '');
  const [organization, setOrganization] = useState(profile?.organization ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({ fullname, position, organization });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-5">โปรไฟล์ของฉัน</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-[#2d5a27]/10 flex items-center justify-center text-2xl font-bold text-[#2d5a27]">
              {(profile?.fullname ?? user?.email ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.fullname ?? user?.email}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                {profile?.role ?? 'pending'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {[
              { label: 'ชื่อ-นามสกุล', value: fullname, setter: setFullname },
              { label: 'ตำแหน่ง', value: position, setter: setPosition },
              { label: 'หน่วยงาน', value: organization, setter: setOrganization },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-medium rounded-lg hover:bg-[#234820] transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saved ? 'บันทึกแล้ว ✓' : isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut size={15} />
          ออกจากระบบ
        </button>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
