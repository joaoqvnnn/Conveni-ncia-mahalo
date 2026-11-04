"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "./FavoritesProvider";

export default function FavoriteButton({ id }: { id: string }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(id);
  return (
    <button
      onClick={() => toggle(id)}
      aria-label="Favoritar"
      className={`p-3 border transition-colors ${
        fav ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
      }`}
    >
      <Heart size={18} fill={fav ? "white" : "none"} />
    </button>
  );
}
