"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Ctx = {
  ids: string[];
  isFav: (id: string) => boolean;
  toggle: (id: string) => void;
};

const FavoritesContext = createContext<Ctx | null>(null);
const KEY = "conv:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {}
  }, [ids]);

  const isFav = (id: string) => ids.includes(id);
  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <FavoritesContext.Provider value={{ ids, isFav, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
