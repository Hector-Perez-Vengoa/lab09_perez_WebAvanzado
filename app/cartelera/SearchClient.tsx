// components/SearchClient.tsx
"use client"; // Indicamos que este componente se renderiza en el cliente

import { useState, useEffect } from "react";
import Image from "next/image";

// Tipos para datos
type OmdbItem = {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
};

type OmdbDetail = {
  Title?: string;
  Year?: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  Runtime?: string;
  Poster?: string;
  imdbRating?: string;
};

// Componente de búsqueda interactiva
export default function SearchClient() {
  // Estado para la búsqueda y los resultados
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OmdbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OmdbDetail | null>(null);

  // Efecto que ejecuta la búsqueda cada vez que cambia "query"
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setSelected(null);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        // Consumimos directamente la API pública (CSR)
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=71ecabd0&s=${query}`
        );
        const data = await res.json();
        setResults(data.Search ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500); // pequeño retraso para evitar spam

    return () => clearTimeout(delay);
  }, [query]);

  // Función que obtiene los detalles de una película seleccionada
  const handleSelect = async (id: string) => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=71ecabd0&i=${id}`
      );
      const data = await res.json();
      setSelected(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="text-xl font-semibold mb-3">🔍 Búsqueda (CSR)</h2>
      <input
        type="text"
        placeholder="Busca una película o serie (ej. Matrix, Suits...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl bg-gray-800 px-4 py-3 outline-none ring-1 ring-gray-700 focus:ring-2 focus:ring-indigo-500"
      />

      {/* Estado de carga */}
      {loading && <p className="mt-3 text-gray-400">Buscando...</p>}

      {/* Resultados */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {results.map((item) => (
          <button
            key={item.imdbID}
            onClick={() => handleSelect(item.imdbID)}
            className="text-left rounded-xl overflow-hidden bg-gray-950 border border-gray-800 hover:border-indigo-500 transition"
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={item.Poster !== "N/A" ? item.Poster : "/placeholder.png"}
                alt={item.Title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold line-clamp-2">{item.Title}</h3>
              <p className="text-sm text-gray-400">
                {item.Year} • {item.Type}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Detalles mostrados dentro de la página */}
      {selected && (
        <div className="mt-10 p-5 rounded-xl bg-gray-800 border border-gray-700">
          <h3 className="text-2xl font-bold mb-3">{selected.Title}</h3>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="relative w-full sm:w-48 aspect-[2/3] rounded-lg overflow-hidden">
              <Image
                src={
                  selected.Poster && selected.Poster !== "N/A"
                    ? selected.Poster
                    : "/placeholder.png"
                }
                alt={selected.Title ?? "Poster"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <p><b>Año:</b> {selected.Year}</p>
              <p><b>Duración:</b> {selected.Runtime}</p>
              <p><b>Género:</b> {selected.Genre}</p>
              <p><b>Director:</b> {selected.Director}</p>
              <p><b>Actores:</b> {selected.Actors}</p>
              <p><b>IMDb:</b> {selected.imdbRating}</p>
              <p className="mt-2 text-gray-300"><b>Sinopsis:</b> {selected.Plot}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
