import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, LayoutGrid } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import type { RecipeDto } from '../api';
import { getAllRecipes, deleteRecipe, getImageUrl } from '../api';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authToken = window.localStorage.getItem('adminAuthToken') ?? '';

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    getAllRecipes(authToken)
      .then((data) => setRecipes(data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Ошибка загрузки рецептов';
        setError(message);
        if (message.toLowerCase().includes('401') || message.toLowerCase().includes('unauthorized')) {
          window.localStorage.removeItem('adminAuthToken');
          navigate('/login');
        }
      })
      .finally(() => setIsLoading(false));
  }, [authToken, navigate]);

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот рецепт?')) {
      deleteRecipe(authToken, id)
        .then(() => {
          setRecipes((prev) => prev.filter((r) => r.id !== id));
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Не удалось удалить рецепт';
          alert(message);
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1f2937] mb-2">Управление рецептами</h1>
          <p className="text-[#1f2937]/60 text-lg">Панель администратора для управления контентом.</p>
        </div>
        
        <Link 
          to="/admin/new" 
          className="inline-flex items-center gap-2 bg-[#047857] text-[#fdfbf7] px-6 py-3.5 rounded-xl font-medium shadow-sm hover:bg-[#064e3b] transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Добавить новый рецепт
        </Link>
      </div>

      <div className="bg-white border border-[#1f2937]/5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fdfbf7] border-b border-[#1f2937]/10">
                <th className="px-8 py-5 text-sm font-semibold text-[#1f2937]/50 uppercase tracking-wider">Название</th>
                <th className="px-8 py-5 text-sm font-semibold text-[#1f2937]/50 uppercase tracking-wider">Изображение</th>
                <th className="px-8 py-5 text-sm font-semibold text-[#1f2937]/50 uppercase tracking-wider">Дата добавления</th>
                <th className="px-8 py-5 text-sm font-semibold text-[#1f2937]/50 uppercase tracking-wider text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/5">
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-[#fdfbf7]/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-semibold text-lg text-[#1f2937] group-hover:text-[#047857] transition-colors">
                      {recipe.title}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm bg-[#fdfbf7]">
                      <img 
                        src={getImageUrl(recipe.imageUrl)} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[#1f2937]/60">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">ID: {recipe.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2.5 text-[#1f2937]/40 hover:text-[#047857] hover:bg-[#047857]/5 rounded-lg transition-all"
                        aria-label="Редактировать"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(recipe.id)}
                        className="p-2.5 text-[#1f2937]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Удалить"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && recipes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-[#1f2937]/50 text-lg">
                    <div className="flex flex-col items-center gap-4">
                      <LayoutGrid className="w-12 h-12 opacity-20" />
                      <p>Рецептов пока нет. Добавьте первый!</p>
                    </div>
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-[#1f2937]/50 text-lg">
                    Загрузка рецептов...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-red-500 text-lg">
                    {error}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}