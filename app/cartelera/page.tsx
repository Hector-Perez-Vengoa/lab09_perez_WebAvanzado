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

// Página principal (SSR)
export default async function Home() {
  const initial = await fetchInitial();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Galería de Películas y Series</h1>
        <p className="text-gray-400 mb-6">
          Esta página usa SSR para mostrar películas populares y CSR para las búsquedas interactivas.
        </p>

        {/* Bloque SSR: Lista inicial */}
        <h2 className="text-xl font-semibold mb-4">Populares (SSR)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {initial.map((item) => (
            <article
              key={item.imdbID}
              className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800"
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
