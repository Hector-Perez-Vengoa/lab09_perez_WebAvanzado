import axios from 'axios'

interface Pokemon {
  name: string
  sprites: {
    front_default: string
  }
  types: Array<{
    type: {
      name: string
    }
  }>
}

async function getPokemon(): Promise<Pokemon> {
  const randomId = Math.floor(Math.random() * 150) + 1
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
  return response.data;
}

export default async function PokemonSSR() {
  const pokemon = await getPokemon()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-400 text-center py-3 px-6 rounded-t-xl border-4 border-black">
          <h1 className="text-3xl font-bold">⚡ Pokémon SSR</h1>
          <p className="text-sm mt-1">Server-Side Rendering</p>
        </div>
        
        <div className="bg-white rounded-b-xl shadow-2xl p-8 border-4 border-black border-t-0">
          <div className="text-center">
            <img 
              src={pokemon.sprites.front_default} 
              alt={pokemon.name}
              className="w-48 h-48 mx-auto"
            />
            <h2 className="text-gray-700 text-4xl font-bold capitalize mt-4">{pokemon.name}</h2>
            <div className="flex gap-2 justify-center mt-4">
              {pokemon.types.map((type) => (
                <span 
                  key={type.type.name}
                  className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold"
                >
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <p className="text-sm text-green-800">
              💡 <strong>SSR:</strong> Los datos se obtienen en el servidor antes de enviar el HTML.
              ¡Ve el código fuente de la página para ver el contenido ya renderizado!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
