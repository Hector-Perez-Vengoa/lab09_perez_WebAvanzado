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

type OmdbDetailLite = {
  imdbID: string;
  imdbRating?: string;
  Plot?: string;
  Released?: string;
  Runtime?: string;
  Language?: string;
};

type OmdbDetail = {
  imdbID?: string;
  Title?: string;
  Year?: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  Runtime?: string;
  Poster?: string;
  imdbRating?: string;
  Rated?: string;
  Released?: string;
  Type?: string;
  Country?: string;
  Language?: string;
  Writer?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Metascore?: string;
  imdbVotes?: string;
  BoxOffice?: string;
  Awards?: string;
  Website?: string;
};

// Componente de búsqueda interactiva
export default function SearchClient() {
  // Estado para la búsqueda y los resultados
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OmdbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OmdbDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liteMap, setLiteMap] = useState<Record<string, OmdbDetailLite>>({});

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

  // Cargar detalle ligero (rating, plot y metadatos) para cada resultado
  useEffect(() => {
    let canceled = false;
    async function loadLite() {
      if (!results || results.length === 0) {
        setLiteMap({});
        return;
      }
      try {
        const arr = await Promise.all(
          results.map(async (r) => {
            const res = await fetch(
              `https://www.omdbapi.com/?apikey=71ecabd0&i=${r.imdbID}`
            );
            const data = await res.json();
            const d: OmdbDetailLite = {
              imdbID: r.imdbID,
              imdbRating: data?.imdbRating,
              Plot: data?.Plot,
              Released: data?.Released,
              Runtime: data?.Runtime,
              Language: data?.Language,
            };
            return d;
          })
        );
        if (!canceled) {
          const obj: Record<string, OmdbDetailLite> = {};
          for (const d of arr) obj[d.imdbID] = d;
          setLiteMap(obj);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadLite();
    return () => {
      canceled = true;
    };
  }, [results]);

  // Auto-seleccionar el primer resultado cuando cambian los resultados
  useEffect(() => {
    if (results && results.length > 0) {
      const firstId = results[0].imdbID;
      if (firstId !== selectedId) {
        handleSelect(firstId);
      }
    } else {
      // Si no hay resultados, limpiar selección
      setSelected(null);
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Función que obtiene los detalles de una película seleccionada
  const handleSelect = async (id: string) => {
    try {
      setSelectedId(id);
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
    <div className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-gray-900 via-gray-900 to-red-950/30 p-6 shadow-2xl">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Búsqueda de películas</h2>
      <input
        type="text"
        placeholder="Busca una película o serie (ej. Matrix, Suits...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl bg-gray-800 px-5 py-4 outline-none ring-2 ring-gray-700 focus:ring-red-500 focus:ring-2 transition-all shadow-lg text-white placeholder:text-gray-400"
      />

      {/* Estado de carga */}
      {loading && (
        <p className="mt-4 text-red-400 animate-pulse">Buscando…</p>
      )}

      {/* Resultados en una sola columna (lista) con imagen izquierda y datos derecha */}
      <div className="mt-6 grid grid-cols-1 gap-5">
        {results.map((item) => (
          <button
            key={item.imdbID}
            onClick={() => handleSelect(item.imdbID)}
            className="group w-full text-left rounded-xl bg-gray-950 border-2 border-gray-800 hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/30"
          >
            <div className="flex items-start gap-4 p-3">
              <div className="relative w-24 sm:w-28 md:w-32 aspect-[2/3] bg-gray-900 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.Poster === "N/A" ? "/placeholder.png" : item.Poster}
                  alt={item.Title}
                  fill
                  className="object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">
                  {item.Title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {item.Year} • {item.Type}
                </p>
                {/* Detalle ligero visible sin selección */}
                <p className="text-sm text-gray-300 mt-1">
                  IMDb: {liteMap[item.imdbID]?.imdbRating ?? "N/A"}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300">
                  <p><b>Año:</b> {item.Year}</p>
                  {liteMap[item.imdbID]?.Released && (
                    <p><b>Estreno:</b> {liteMap[item.imdbID]?.Released}</p>
                  )}
                  {liteMap[item.imdbID]?.Runtime && (
                    <p><b>Duración:</b> {liteMap[item.imdbID]?.Runtime}</p>
                  )}
                  <p><b>Tipo:</b> {item.Type}</p>
                  {liteMap[item.imdbID]?.Language && (
                    <p className="col-span-2"><b>Idioma:</b> {liteMap[item.imdbID]?.Language}</p>
                  )}
                </div>
                {liteMap[item.imdbID]?.Plot && (
                  <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                    {liteMap[item.imdbID]?.Plot}
                  </p>
                )}

                {/* Detalles inline cuando el item está seleccionado */}
                {selected && selectedId === item.imdbID && (
                  <div className="mt-3 space-y-3 text-sm text-gray-300 border-t border-gray-800 pt-3">
                    {/* Información general */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {selected.Year && <p><b>Año:</b> {selected.Year}</p>}
                      {selected.Rated && <p><b>Clasificación:</b> {selected.Rated}</p>}
                      {selected.Released && (
                        <p className="col-span-2"><b>Fecha de estreno:</b> {selected.Released}</p>
                      )}
                      {selected.Runtime && <p><b>Duración:</b> {selected.Runtime}</p>}
                      {selected.Genre && (
                        <p className="col-span-2"><b>Género:</b> {selected.Genre}</p>
                      )}
                      {selected.Type && <p><b>Tipo:</b> {selected.Type}</p>}
                      {selected.Country && <p><b>País:</b> {selected.Country}</p>}
                      {selected.Language && (
                        <p className="col-span-2"><b>Idioma:</b> {selected.Language}</p>
                      )}
                    </div>

                    {/* Personas */}
                    <div className="border-t border-gray-800 pt-3 space-y-1 text-gray-200">
                      {selected.Director && <p><b>Director:</b> {selected.Director}</p>}
                      {selected.Writer && <p><b>Guionistas:</b> {selected.Writer}</p>}
                      {selected.Actors && <p><b>Actores:</b> {selected.Actors}</p>}
                    </div>

                    {/* Calificaciones */}
                    {selected.Ratings && selected.Ratings.length > 0 && (
                      <div className="border-t border-gray-800 pt-3">
                        <h4 className="text-sm font-semibold mb-2">Calificaciones</h4>
                        <ul className="space-y-1">
                          {selected.Ratings.map((r) => (
                            <li key={`${r.Source}-${r.Value}`}>
                              <b>{r.Source}:</b> {r.Value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Métricas */}
                    <div className="border-t border-gray-800 pt-3 space-y-1">
                      {selected.Metascore && <p><b>Metascore:</b> {selected.Metascore}</p>}
                      {selected.imdbRating && <p><b>IMDb Rating:</b> {selected.imdbRating}</p>}
                      {selected.imdbVotes && <p><b>Votos:</b> {selected.imdbVotes}</p>}
                      {selected.BoxOffice && <p><b>Recaudación:</b> {selected.BoxOffice}</p>}
                      {selected.Awards && <p><b>Premios:</b> {selected.Awards}</p>}
                    </div>

                    {/* Sinopsis */}
                    {selected.Plot && (
                      <div className="border-t border-gray-800 pt-3">
                        <h4 className="text-sm font-semibold mb-1">Sinopsis</h4>
                        <p className="text-gray-200 leading-relaxed">{selected.Plot}</p>
                      </div>
                    )}

                    {/* Web */}
                    {selected.Website && selected.Website !== "N/A" && (
                      <div className="border-t border-gray-800 pt-3">
                        <a
                          href={selected.Website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-300 hover:underline font-semibold"
                        >
                          Sitio web oficial
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
