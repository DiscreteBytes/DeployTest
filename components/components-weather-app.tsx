'use client'

import React, { useState, useEffect } from 'react'
import { Thermometer, Droplets, Wind, Sun, Search, Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
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
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchCity, setSearchCity] = useState('')

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
        uvIndex: 0
      })

      const fiveDayForecast = forecastData.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((day: any) => ({
          day: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.main.temp),
          condition: day.weather[0].main
        }))

      setForecast(fiveDayForecast)
    } catch (error) {
      setError('Failed to fetch weather data. Please try again.')
      console.error('Error fetching weather data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData('London')
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCity.trim()) {
      fetchWeatherData(searchCity)
      setSearchCity('')
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 text-yellow-300" />
      case 'clouds':
        return <Cloud className="w-16 h-16 text-gray-300" />
      case 'rain':
        return <CloudRain className="w-16 h-16 text-blue-300" />
      case 'snow':
        return <CloudSnow className="w-16 h-16 text-white" />
      case 'thunderstorm':
        return <Zap className="w-16 h-16 text-yellow-400" />
      default:
        return <Sun className="w-16 h-16 text-yellow-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 text-white p-4">
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
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">{weatherData.city}</h1>
          <div className="mb-4">
            {getWeatherIcon(weatherData.condition)}
          </div>
          <div className="text-6xl font-light mb-2">{weatherData.temperature}°<span className="text-3xl">C</span></div>
          <div className="text-2xl mb-4">{weatherData.condition}</div>
          <div className="mb-4">
            {weatherData.date.toLocaleTimeString()}<br />
            {weatherData.date.toLocaleDateString()}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
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
            <h2 className="text-2xl font-semibold mb-4">5-Day Forecast</h2>
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
        </div>
      )}
    </div>
  )
}