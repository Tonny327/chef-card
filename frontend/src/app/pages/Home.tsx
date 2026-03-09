import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, ArrowRight, X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { RecipeDto } from '../api';
import { getPublicRecipes, getImageUrl } from '../api';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDto | null>(null);
  const [showUI, setShowUI] = useState(true);
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getPublicRecipes()
      .then((data) => {
        setRecipes(data);
      })
      .catch((err) => {
        setError('Не удалось загрузить рецепты. Попробуйте ещё раз.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const visibleRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return recipes;
    }
    return recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(query)
    );
  }, [recipes, searchQuery]);

  // Prevent background scrolling when modal is open and reset UI state
  useEffect(() => {
    if (selectedRecipe) {
      document.body.style.overflow = 'hidden';
      setShowUI(true); // Always show text initially when opening a new recipe
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedRecipe]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8 text-[#1f2937] break-words">
          Ваши <span className="text-[#047857] italic font-serif">технологические</span> карты
        </h1>
        
        {/* Smart Search */}
        <div className="relative max-w-2xl mx-auto mt-8 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-[#1f2937]/40 group-focus-within:text-[#047857] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-[#1f2937]/10 bg-white shadow-sm focus:border-[#047857] focus:ring-0 sm:text-lg transition-all outline-none placeholder-[#1f2937]/40 text-[#1f2937]"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-12">
        {isLoading && (
          <div className="col-span-full py-10 text-center text-[#1f2937]/50 text-lg">
            Загрузка рецептов...
          </div>
        )}
        {error && !isLoading && (
          <div className="col-span-full py-10 text-center text-red-500 text-lg">
            {error}
          </div>
        )}
        {!isLoading && !error && visibleRecipes.length > 0 ? (
          visibleRecipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="group cursor-pointer flex flex-col h-full"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 shadow-md bg-white">
                <img
                  src={getImageUrl(recipe.imageUrl)}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-sm font-medium text-[#1f2937]">
                  <Clock className="w-4 h-4 text-[#047857]" />
                  <span>{recipe.preparationTime} мин</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-[#047857] transition-colors line-clamp-1 break-words">
                {recipe.title}
              </h3>
              <p className="text-[#1f2937]/70 text-base leading-relaxed mb-4 flex-1 line-clamp-2 break-words">
                {recipe.description}
              </p>
              <div className="flex items-center text-[#047857] font-medium text-sm mt-auto group-hover:gap-2 transition-all">
                Открыть ТТК <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        ) : !isLoading && !error && (
          <div className="col-span-full py-20 text-center text-[#1f2937]/50 text-lg">
            {searchQuery.trim()
              ? 'По вашему запросу ничего не найдено.'
              : 'Начните вводить название блюда, чтобы найти технологические карты.'}
          </div>
        )}
      </div>

      {/* Fullscreen Recipe Modal with Zoom */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] bg-black/95 animate-in fade-in duration-300 flex flex-col min-h-dvh w-full">
          {/* Header Controls */}
          {showUI && (
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-4 sm:p-6 pointer-events-none bg-gradient-to-b from-black/60 to-transparent">
              <div className="text-white drop-shadow-md pointer-events-auto max-w-[75%]">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{selectedRecipe.title}</h3>
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{selectedRecipe.preparationTime} мин</span>
                </div>
              </div>
              
              <button 
                className="p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-colors text-white pointer-events-auto shadow-lg"
                onClick={() => setSelectedRecipe(null)}
                aria-label="Закрыть"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Interactive Zoomable Image Area */}
          <div
            className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing"
            onClick={() => setShowUI((prev) => !prev)}
          >
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                    <img 
                      src={getImageUrl(selectedRecipe.imageUrl)} 
                      alt={selectedRecipe.title} 
                      className="w-full max-w-full max-h-dvh object-contain select-none"
                      draggable={false}
                    />
                  </TransformComponent>

                  {/* Right-side Controls Overlay */}
                  {showUI && (
                    <div
                      className="absolute right-4 bottom-32 sm:bottom-8 sm:right-8 flex flex-col gap-2 z-10 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Zoom Controls */}
                      <button 
                        onClick={() => zoomIn()} 
                        className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors shadow-lg"
                        aria-label="Увеличить"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => zoomOut()} 
                        className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors shadow-lg"
                        aria-label="Уменьшить"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => resetTransform()} 
                        className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors shadow-lg"
                        aria-label="Сбросить масштаб"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </TransformWrapper>
          </div>

          {/* Description Footer */}
          {showUI && (
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-8 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <div className="max-w-3xl mx-auto pointer-events-auto">
                <p className="text-white/90 text-sm sm:text-base leading-relaxed drop-shadow-md pb-4 sm:pb-0">
                  {selectedRecipe.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}