export interface RecipeDto {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  preparationTime: number;
  createdAt: string;
}

export interface CreateOrUpdateRecipePayload {
  title: string;
  description?: string;
  imageUrl?: string;
  preparationTime: number;
}

/** Базовый URL API (для продакшена — URL бэкенда на Fly.io) */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Полный URL для изображений (нужен, когда фронт и бэк на разных доменах) */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_BASE ? `${API_BASE}${url}` : url;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const message = text || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function searchRecipes(query: string, signal?: AbortSignal): Promise<RecipeDto[]> {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({ query: query.trim() });
  const response = await fetch(`${API_BASE}/api/recipes/search?${params.toString()}`, {
    signal,
  });
  return handleResponse<RecipeDto[]>(response);
}

export async function getPublicRecipes(): Promise<RecipeDto[]> {
  const response = await fetch(`${API_BASE}/api/recipes`);
  return handleResponse<RecipeDto[]>(response);
}

export async function getAllRecipes(authToken: string): Promise<RecipeDto[]> {
  const response = await fetch(`${API_BASE}/admin/recipes`, {
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  });
  return handleResponse<RecipeDto[]>(response);
}

export async function createRecipe(authToken: string, payload: CreateOrUpdateRecipePayload): Promise<RecipeDto> {
  const response = await fetch(`${API_BASE}/admin/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authToken}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<RecipeDto>(response);
}

export async function createRecipeWithImage(authToken: string, formData: FormData): Promise<RecipeDto> {
  const response = await fetch(`${API_BASE}/admin/recipes`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authToken}`,
    },
    body: formData,
  });
  return handleResponse<RecipeDto>(response);
}

export async function updateRecipe(
  authToken: string,
  id: number,
  payload: CreateOrUpdateRecipePayload
): Promise<RecipeDto> {
  const response = await fetch(`${API_BASE}/admin/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authToken}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<RecipeDto>(response);
}

export async function updateRecipeWithImage(
  authToken: string,
  id: number,
  formData: FormData
): Promise<RecipeDto> {
  const response = await fetch(`${API_BASE}/admin/recipes/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${authToken}`,
    },
    body: formData,
  });
  return handleResponse<RecipeDto>(response);
}

export async function deleteRecipe(authToken: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/recipes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const message = text || `Delete failed with status ${response.status}`;
    throw new Error(message);
  }
}

