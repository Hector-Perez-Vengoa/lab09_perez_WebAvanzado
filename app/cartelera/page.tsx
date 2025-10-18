// app/page.tsx
import Image from "next/image";
import SearchClient from "./SearchClient";

// Tipo para los resultados de OMDb
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

// Función asíncrona para obtener películas iniciales desde el servidor
async function fetchInitial(): Promise<OmdbItem[]> {
  const key = "71ecabd0";
  // Buscamos algo popular (por ejemplo “marvel”)
  const url = `https://www.omdbapi.com/?apikey=${key}&s=marvel&page=1`;

  // Renderizado del servidor con revalidación cada 60 segundos
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return data.Search ?? [];
}

// Obtener detalle mínimo (solo rating) para cada título
async function fetchDetailLite(id: string): Promise<OmdbDetailLite> {
  const key = "71ecabd0";
  const url = `https://www.omdbapi.com/?apikey=${key}&i=${id}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return {
    imdbID: id,
    imdbRating: data?.imdbRating,
    Plot: data?.Plot,
    Released: data?.Released,
    Runtime: data?.Runtime,
    Language: data?.Language,
  };
}

// Página principal (SSR)
export default async function Home() {
  const initial = await fetchInitial();
  // Traemos ratings en paralelo
  const details = await Promise.all(initial.map((it) => fetchDetailLite(it.imdbID)));
  const detailById = new Map(details.map((d) => [d.imdbID, d]));

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
            Galería de Películas y Series
          </h1>
          <p className="text-gray-400 text-lg">
            Esta página usa SSR para mostrar películas populares y CSR para las búsquedas interactivas.
          </p>
        </div>

        {/* Bloque SSR: Lista inicial */}
        <h2 className="text-2xl font-bold mb-4 text-red-500">Populares (SSR)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initial.map((item) => (
            <article
              key={item.imdbID}
              className="group rounded-xl bg-gray-900 border-2 border-gray-800 hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/30"
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
                  <p className="text-sm text-gray-300 mt-1">
                    IMDb: {detailById.get(item.imdbID)?.imdbRating ?? "N/A"}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300">
                    <p><b>Año:</b> {item.Year}</p>
                    {detailById.get(item.imdbID)?.Released && (
                      <p><b>Estreno:</b> {detailById.get(item.imdbID)?.Released}</p>
                    )}
                    {detailById.get(item.imdbID)?.Runtime && (
                      <p><b>Duración:</b> {detailById.get(item.imdbID)?.Runtime}</p>
                    )}
                    <p><b>Tipo:</b> {item.Type}</p>
                    {detailById.get(item.imdbID)?.Language && (
                      <p className="col-span-2"><b>Idioma:</b> {detailById.get(item.imdbID)?.Language}</p>
                    )}
                  </div>
                  {detailById.get(item.imdbID)?.Plot && (
                    <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                      {detailById.get(item.imdbID)?.Plot}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Componente de búsqueda (CSR) */}
        <section className="mt-12">
          <SearchClient />
        </section>
      </section>
    </main>
  );
}
