import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Trees, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login, loginWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/plots');
    } else {
      setError(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleMagicLink = async () => {
    setError('');
    setNotice('');
    if (!isEmailValid) {
      setError('กรุณากรอกอีเมลให้ถูกต้องก่อนส่ง Magic Link');
      return;
    }
    setIsMagicLoading(true);
    const result = await loginWithMagicLink(email);
    setIsMagicLoading(false);
    if (result.success) {
      setNotice(result.message || 'ส่งลิงก์เข้าสู่ระบบแล้ว');
    } else {
      setError(result.message || 'ไม่สามารถส่ง Magic Link ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d5a27] to-[#4a7c42] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Trees size={32} className="text-[#2d5a27]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">แม่แจ่ม DB</h1>
          <p className="text-sm text-gray-500 mt-1">ระบบติดตามการฟื้นฟูป่า</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2d5a27] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#234820] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={isMagicLoading || !isEmailValid}
            title={!isEmailValid ? 'กรุณากรอกอีเมลให้ถูกต้องก่อนส่ง Magic Link' : undefined}
            className="w-full border border-[#2d5a27] text-[#2d5a27] rounded-lg py-3 text-sm font-semibold hover:bg-green-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isMagicLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isMagicLoading ? 'กำลังส่งลิงก์...' : 'ส่ง Magic Link เข้าอีเมล'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-[#2d5a27] font-semibold hover:underline">
            ลงทะเบียน
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
