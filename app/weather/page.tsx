import axios from 'axios'
import ClientWeatherWidget from './ClientWeatherWidget'

interface WeatherData {
  current_weather: {
    temperature: number
    windspeed: number
    weathercode: number
  }
}

async function getWeatherServer() {
  // Lima, Perú
  const response = await axios.get(
    'https://api.open-meteo.com/v1/forecast?latitude=-12.04&longitude=-77.03&current_weather=true'
  )
  return response.data as WeatherData
}

export default async function WeatherDashboard() {
  const serverWeather = await getWeatherServer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          ☁️ Dashboard del Clima
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SSR Card */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-6 border-4 border-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-gray-800">Lima - SSR</h2>
            </div>
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {serverWeather.current_weather.temperature}°C
            </div>
            <p className="text-gray-600">
              Viento: {serverWeather.current_weather.windspeed} km/h
            </p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-xs text-green-800">
                ✅ Datos obtenidos en el servidor - SEO friendly
              </p>
            </div>
          </div>

          {/* CSR Card */}
          <ClientWeatherWidget />
        </div>

        {/* Tabla comparativa */}
        <div className="mt-8 bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-6 border-4 border-white">
          <h3 className="text-gray-700 text-2xl font-bold mb-4">📊 Comparación SSR vs CSR</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-gray-700 px-4 py-2 text-left">Característica</th>
                  <th className="text-gray-700 px-4 py-2 text-left">SSR</th>
                  <th className="text-gray-700 px-4 py-2 text-left">CSR</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="text-gray-700 px-4 py-2 font-semibold">SEO</td>
                  <td className="px-4 py-2 text-green-600">✅ Excelente</td>
                  <td className="px-4 py-2 text-red-600">❌ Limitado</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="text-gray-700 px-4 py-2 font-semibold">Tiempo inicial</td>
                  <td className="px-4 py-2 text-green-600">✅ Rápido</td>
                  <td className="px-4 py-2 text-yellow-600">⚠️ Más lento</td>
                </tr>
                <tr className="border-t">
                  <td className="text-gray-700 px-4 py-2 font-semibold">Interactividad</td>
                  <td className="px-4 py-2 text-yellow-600">⚠️ Recarga página</td>
                  <td className="px-4 py-2 text-green-600">✅ Dinámica</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="text-gray-700 px-4 py-2 font-semibold">Carga del servidor</td>
                  <td className="px-4 py-2 text-red-600">❌ Alta</td>
                  <td className="px-4 py-2 text-green-600">✅ Baja</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}