import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "onboarding5411:favorites";

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Favoritos por navegador (no sincroniza entre dispositivos ni personas) —
// alcanza para "anclar" las secciones que cada uno consulta seguido sin
// necesitar una tabla nueva en Supabase.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage bloqueado (modo privado, etc.) — los favoritos quedan
      // solo en memoria para esta sesión, no es crítico.
    }
  }, [favorites]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
