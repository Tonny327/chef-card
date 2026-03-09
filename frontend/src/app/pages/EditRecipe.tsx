import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import type { RecipeDto } from '../api';
import { updateRecipe, updateRecipeWithImage, getImageUrl } from '../api';

interface LocationState {
  recipe?: RecipeDto;
}

export function EditRecipe() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const existing = state?.recipe;

  const id = Number(params.id);

  const [formData, setFormData] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    preparationTime: existing?.preparationTime?.toString() ?? '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('adminAuthToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!existing || Number.isNaN(id)) {
      navigate('/admin');
    }
  }, [existing, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = window.localStorage.getItem('adminAuthToken');
    if (!token || !existing || Number.isNaN(id)) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const preparationTimeNumber = Number(formData.preparationTime);

    if (!Number.isFinite(preparationTimeNumber) || preparationTimeNumber <= 0) {
      setIsSubmitting(false);
      setError('Время приготовления должно быть положительным числом (в минутах).');
      return;
    }

    try {
      if (imageFile) {
        const multipart = new FormData();
        multipart.append('title', formData.title);
        multipart.append('description', formData.description);
        multipart.append('preparationTime', preparationTimeNumber.toString());
        multipart.append('imageFile', imageFile);
        await updateRecipeWithImage(token, id, multipart);
      } else {
        await updateRecipe(token, id, {
          title: formData.title,
          description: formData.description,
          preparationTime: preparationTimeNumber,
          imageUrl: existing.imageUrl ?? undefined,
        });
      }
      navigate('/admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить рецепт';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="mb-10 flex items-center gap-4">
        <Link 
          to="/admin" 
          className="p-3 bg-white border border-[#1f2937]/10 rounded-xl hover:bg-[#fdfbf7] hover:border-[#1f2937]/20 transition-all text-[#1f2937]/60"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1f2937]">Редактирование рецепта</h1>
          <p className="text-[#1f2937]/60 mt-2 text-lg">Измените данные и сохраните обновлённый рецепт.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#1f2937]/5 p-8 sm:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 mb-4 rounded-2xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
              <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Название блюда</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[#fdfbf7] border border-[#1f2937]/10 rounded-2xl focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] outline-none transition-all text-[#1f2937] placeholder-[#1f2937]/30 text-lg"
                placeholder="Название рецепта"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Описание и шаги</label>
              <textarea
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-[#fdfbf7] border border-[#1f2937]/10 rounded-2xl focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] outline-none transition-all text-[#1f2937] placeholder-[#1f2937]/30 resize-none text-lg"
                placeholder="Подробно опишите процесс приготовления..."
              />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Время приготовления</label>
                <input
                  type="number"
                  name="preparationTime"
                  required
                  value={formData.preparationTime}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-[#fdfbf7] border border-[#1f2937]/10 rounded-2xl focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] outline-none transition-all text-[#1f2937] placeholder-[#1f2937]/30 text-lg"
                  placeholder="Например: 25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Изображение блюда</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-[#1f2937]/30" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImageFile(file);
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-[#fdfbf7] border border-[#1f2937]/10 rounded-2xl focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] outline-none transition-all text-[#1f2937] placeholder-[#1f2937]/30 text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-[#1f2937]/80 mb-2">Текущее / новое фото</label>
              <div className="w-full aspect-[4/5] bg-[#fdfbf7] rounded-3xl border-2 border-dashed border-[#1f2937]/10 flex flex-col items-center justify-center overflow-hidden relative">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : existing?.imageUrl ? (
                  <img
                    src={getImageUrl(existing.imageUrl)}
                    alt={existing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 opacity-40">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                    <span className="text-sm font-medium">Загрузите файл для предпросмотра</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#1f2937]/10 flex flex-col sm:flex-row gap-4 sm:justify-end">
            <Link
              to="/admin"
              className="px-8 py-4 rounded-xl font-medium border border-[#1f2937]/10 text-[#1f2937]/70 hover:bg-[#fdfbf7] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <X className="w-5 h-5" />
              Отмена
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 rounded-xl font-medium bg-[#047857] text-[#fdfbf7] hover:bg-[#064e3b] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-[#047857]/20 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

