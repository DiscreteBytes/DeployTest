"use client"

import { useState, useEffect } from 'react'
import { Thermometer, Droplets, Wind, Sun, Search, Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Define the API key and base URL
const API_KEY = '7363985548cfa0def7d3b27c7d286a02' // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

interface WeatherData {
  city: string
  temperature: number
  condition: string
  date: Date
  realFeel: number
  humidity: number
  wind: number
  uvIndex: number
}

interface ForecastDay {
  day: string
  temp: number
  condition: string
}

export function WeatherAppComponent() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [searchCity, setSearchCity] = useState('')
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeatherData('London') // Default city
  }, [])

  const fetchWeatherData = async (city: string) => {
    setLoading(true)
    setError(null)
    try {
      const weatherResponse = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`)
      const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`)
      
      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const weatherData = await weatherResponse.json()
      const forecastData = await forecastResponse.json()

      setWeatherData({
        city: weatherData.name,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        date: new Date(weatherData.dt * 1000),
        realFeel: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        wind: weatherData.wind.speed,
        uvIndex: 0 // OpenWeatherMap doesn't provide UV index in the free tier
      })

      const fiveDayForecast = forecastData.list
        .filter((_: any, index: number) => index % 8 === 0) // Get data for every 24 hours
        .slice(0, 5)
        .map((day: any) => ({
          day: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.main.temp),
          condition: day.weather[0].main
        }))

      setForecast(fiveDayForecast)
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCity.trim()) {
      fetchWeatherData(searchCity)
      setSearchCity('')
    }
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, '0')
    return `${formattedHours}:${formattedMinutes} ${ampm}`
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 md:w-24 md:h-24 text-yellow-300" />
      case 'clouds':
        return <Cloud className="w-16 h-16 md:w-24 md:h-24 text-gray-300" />
      case 'rain':
        return <CloudRain className="w-16 h-16 md:w-24 md:h-24 text-blue-300" />
      case 'snow':
        return <CloudSnow className="w-16 h-16 md:w-24 md:h-24 text-white" />
      case 'thunderstorm':
        return <Zap className="w-16 h-16 md:w-24 md:h-24 text-yellow-400" />
      default:
        return <Sun className="w-16 h-16 md:w-24 md:h-24 text-yellow-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 text-white p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            type="text"
            placeholder="Search city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="flex-grow bg-white/20 border-white/30 text-white placeholder-white/70"
          />
          <Button type="submit" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-300">{error}</div>}

        {weatherData && !loading && !error && (
          <main className="text-center">
            <div className="md:flex md:justify-between md:items-center mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold mb-4">{weatherData.city}</h1>
                <div className="text-xl md:text-2xl mb-2">
                  {formatTime(weatherData.date)}<br />
                  {formatDate(weatherData.date)}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className="mb-4">
                  {getWeatherIcon(weatherData.condition)}
                </div>
                <div className="text-6xl md:text-8xl font-light">{weatherData.temperature}°<span className="text-3xl md:text-4xl">C</span></div>
                <div className="text-2xl md:text-3xl mt-2">{weatherData.condition}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center justify-center bg-white/10 rounded-lg p-4">
                <Thermometer className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-semibold">RealFeel®</div>
                  <div>{weatherData.realFeel}°</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white/10 rounded-lg p-4">
                <Droplets className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-semibold">Humidity</div>
                  <div>{weatherData.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white/10 rounded-lg p-4">
                <Wind className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-semibold">Wind</div>
                  <div>{weatherData.wind} m/s</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white/10 rounded-lg p-4">
                <Sun className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-semibold">UV Index</div>
                  <div>N/A</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">5-Day Forecast</h2>
              <div className="grid grid-cols-5 gap-2 bg-white/10 rounded-lg p-4">
                {forecast.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="font-semibold mb-2">{day.day}</div>
                    {getWeatherIcon(day.condition)}
                    <div className="mt-2 text-lg font-medium">{day.temp}°C</div>
                    <div className="text-xs mt-1">{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}