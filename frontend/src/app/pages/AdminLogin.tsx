import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';

export function AdminLogin() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      setError('Пожалуйста, укажите логин и пароль.');
      return;
    }

    const token = window.btoa(`${login}:${password}`);
    window.localStorage.setItem('adminAuthToken', token);
    setError(null);
    navigate('/admin');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-[#fdfbf7]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 sm:p-14 border border-[#1f2937]/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#047857]" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#fdfbf7] p-4 rounded-full mb-6 text-[#047857]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-center text-[#1f2937]">Вход в панель</h2>
          <p className="text-center text-[#1f2937]/50 mt-3 text-sm">
            Доступ только для администраторов
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Логин</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 bg-[#fdfbf7] border border-[#1f2937]/10 rounded-xl focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] outline-none transition-all text-[#1f2937] placeholder-[#1f2937]/30"
              placeholder="admin@example.com"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Пароль</label>
            <input
              type="password"
              required
              className="w-full px-5 py-3.5 bg-[#fdfbf7] border border-[#1f2937]/10 rounded-xl focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] outline-none transition-all text-[#1f2937] placeholder-[#1f2937]/30"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#047857] text-[#fdfbf7] py-4 rounded-xl font-semibold hover:bg-[#064e3b] transition-colors shadow-sm shadow-[#047857]/20 mt-8"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}