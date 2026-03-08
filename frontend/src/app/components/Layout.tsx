import React from 'react';
import { Outlet, Link } from 'react-router';
import { ChefHat } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fdfbf7] text-[#1f2937] font-sans flex flex-col">
      <header className="border-b border-[#1f2937]/10 bg-[#fdfbf7]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#047857] p-2 rounded-xl group-hover:bg-[#064e3b] transition-colors">
                <ChefHat className="w-6 h-6 text-[#fdfbf7]" />
              </div>
              <span className="text-xl font-bold tracking-tight">Шеф<span className="text-[#047857]">Карта</span></span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-[#1f2937]/70 hover:text-[#047857] transition-colors">
                ТТК
              </Link>
              <Link to="/login" className="text-sm font-medium text-[#1f2937]/70 hover:text-[#047857] transition-colors">
                Войти
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#1f2937]/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[#1f2937]/50">
          <p>© {new Date().getFullYear()} ШефКарта. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}