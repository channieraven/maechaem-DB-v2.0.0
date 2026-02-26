import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Trees, Loader2 } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
    organization: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (form.password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    setIsLoading(true);
    const result = await register({
      email: form.email,
      password: form.password,
      fullname: form.fullname,
      position: form.position,
      organization: form.organization,
    });
    setIsLoading(false);
    if (result.success) {
      setSuccess(result.message || 'ลงทะเบียนสำเร็จ');
    } else {
      setError(result.message || 'ลงทะเบียนไม่สำเร็จ');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d5a27] to-[#4a7c42] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trees size={32} className="text-[#2d5a27]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">ลงทะเบียนสำเร็จ!</h2>
          <p className="text-sm text-gray-600 mb-6">{success}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#234820] transition-colors"
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d5a27] to-[#4a7c42] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
            <Trees size={28} className="text-[#2d5a27]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">ลงทะเบียน</h1>
          <p className="text-xs text-gray-500 mt-1">บัญชีจะได้รับการอนุมัติจากผู้ดูแลระบบ</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { name: 'fullname', label: 'ชื่อ-นามสกุล', type: 'text', required: true, placeholder: 'ชื่อ นามสกุล', hint: '' },
            { name: 'email', label: 'อีเมล', type: 'email', required: true, placeholder: 'your@email.com', hint: '' },
            { name: 'password', label: 'รหัสผ่าน', type: 'password', required: true, placeholder: '••••••••', hint: 'อย่างน้อย 8 ตัวอักษร' },
            { name: 'confirmPassword', label: 'ยืนยันรหัสผ่าน', type: 'password', required: true, placeholder: '••••••••', hint: '' },
            { name: 'position', label: 'ตำแหน่ง/หน้าที่', type: 'text', required: false, placeholder: 'เจ้าหน้าที่สำรวจ', hint: '' },
            { name: 'organization', label: 'หน่วยงาน', type: 'text', required: false, placeholder: 'องค์กร / มหาวิทยาลัย', hint: '' },
          ].map(({ name, label, type, required, placeholder, hint }) => (
            <div key={name}>
              <label htmlFor={`reg-${name}`} className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input
                id={`reg-${name}`}
                type={type}
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={placeholder}
                required={required}
                aria-describedby={hint ? `hint-${name}` : undefined}
              />
              {hint && <p id={`hint-${name}`} className="text-xs text-gray-400 mt-0.5">{hint}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#234820] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          มีบัญชีแล้ว?{' '}
          <a href="/login" className="text-[#2d5a27] font-semibold hover:underline">เข้าสู่ระบบ</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
