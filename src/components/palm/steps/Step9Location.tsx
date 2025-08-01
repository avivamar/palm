'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step9Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

interface LocationResult {
  display_name: string
  name: string
  lat: string
  lon: string
  address?: {
    country?: string
    state?: string
    province?: string
  }
}

interface BirthLocation {
  name: string
  fullName: string
  latitude: number
  longitude: number
  country: string
  state: string
  raw: LocationResult
}

export default function Step9Location({ 
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step9Props) {
  const [locationInput, setLocationInput] = useState('')
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<BirthLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentLocation, setCurrentLocation] = useState('检测当前位置中…')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    trackEvent('palm_location_view', { 
      timestamp: Date.now(),
      step: 9
    })
    
    // 获取当前位置显示
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        setCurrentLocation(`${d.country_name || ""} ${d.region || ""}`)
      })
      .catch(() => {
        setCurrentLocation("")
      })
  }, [])
  
  // 地点搜索功能
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setShowResults(false)
      return
    }
    
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&accept-language=zh-CN,zh,en`
      )
      
      const data = await response.json()
      setSearchResults(data)
      setShowResults(true)
      
    } catch (error) {
      console.error('搜索地点时出错:', error)
      setSearchResults([])
      setShowResults(true)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim()
    setLocationInput(query)
    
    // 如果有选中的地点且输入值改变，清除选择
    if (selectedLocation && query !== selectedLocation.name) {
      setSelectedLocation(null)
    }
    
    // 防抖搜索
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query)
    }, 300)
  }
  
  // 选择地点
  const selectLocation = (locationData: LocationResult) => {
    const shortName = locationData.name || locationData.display_name.split(',')[0] || locationData.display_name
    const country = locationData.address?.country || ''
    const state = locationData.address?.state || locationData.address?.province || ''
    
    const birthLocation: BirthLocation = {
      name: shortName,
      fullName: locationData.display_name,
      latitude: parseFloat(locationData.lat),
      longitude: parseFloat(locationData.lon),
      country: country,
      state: state,
      raw: locationData
    }
    
    setSelectedLocation(birthLocation)
    setLocationInput(shortName)
    setShowResults(false)
    
    trackEvent('palm_location_select', {
      location: birthLocation,
      timestamp: Date.now()
    })
  }
  
  // 清除选择
  const clearSelection = () => {
    setSelectedLocation(null)
    setLocationInput('')
    setShowResults(false)
  }
  
  // 继续到下一步
  const handleContinue = () => {
    if (selectedLocation) {
      updateUserData({ birthLocation: selectedLocation.fullName })
      trackEvent('palm_step9_complete', { 
        location: selectedLocation
      })
      goToNextStep()
    }
  }
  
  // 点击外部隐藏搜索结果
  const handleClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.location-search') && !target.closest('.search-results')) {
      setShowResults(false)
    }
  }
  
  useEffect(() => {
    document.addEventListener('click', handleClickOutside as any)
    return () => {
      document.removeEventListener('click', handleClickOutside as any)
    }
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-[412px] px-4 pb-16"
    >
      {/* Logo */}
      <header className="py-4 flex justify-center">
        <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
      </header>

      {/* Progress */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
        <div className="h-full w-[90%] bg-violet-500 rounded-full transition-all"></div>
        <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 9 / 10</span>
      </div>

      {/* Title */}
      <section className="text-center space-y-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">你的出生地点是？</h1>
        <p className="text-gray-600 leading-snug">
          准确的出生地点对生成精确的星盘至关重要
        </p>
      </section>

      {/* Location Input */}
      <div className="space-y-4 mb-8">
        {/* 搜索输入框 */}
        <div className="relative location-search">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12.414a6 6 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414z"></path>
            </svg>
          </div>
          <input
            type="text"
            value={locationInput}
            onChange={handleInputChange}
            placeholder="输入城市名称，如：北京、上海、纽约..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition bg-white"
            autoComplete="off"
          />
          {/* 加载指示器 */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500"></div>
            </div>
          )}
        </div>

        {/* 搜索结果列表 */}
        {showResults && (
          <div className="search-results space-y-2 max-h-64 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">未找到相关地点</div>
            ) : (
              searchResults.map((result, index) => {
                const shortName = result.name || result.display_name.split(',')[0]
                const country = result.address?.country || ''
                const state = result.address?.state || result.address?.province || ''
                
                return (
                  <button
                    key={index}
                    className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition"
                    onClick={() => selectLocation(result)}
                  >
                    <div className="font-medium text-gray-800">{shortName}</div>
                    <div className="text-sm text-gray-600">{country}{state ? ', ' + state : ''}</div>
                    <div className="text-xs text-gray-400 mt-1">{result.display_name}</div>
                  </button>
                )
              })
            )}
          </div>
        )}

        {/* 选中的地点显示 */}
        {selectedLocation && (
          <div className="p-4 bg-violet-50 border-2 border-violet-600 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12.414a6 6 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{selectedLocation.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedLocation.country}{selectedLocation.state ? ', ' + selectedLocation.state : ''} ({selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)})
                  </div>
                </div>
              </div>
              <button 
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <div className="text-center text-sm text-gray-500">
          <p>💡 提示：输入您出生的具体城市名称</p>
          <p className="mt-1">我们需要准确的经纬度来计算星盘</p>
        </div>
      </div>

      {/* Continue CTA */}
      <button
        onClick={handleContinue}
        disabled={!selectedLocation}
        className={`w-full h-14 rounded-xl text-white text-lg font-semibold shadow-md transition ${
          selectedLocation 
            ? 'bg-violet-600 hover:bg-violet-500' 
            : 'bg-violet-400 opacity-40 cursor-not-allowed'
        }`}
      >
        继续 →
      </button>

      {/* Legal & location */}
      <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
        继续即代表您同意我们的
        <a href="/privacy" className="underline">隐私政策</a>、
        <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
      </p>
      <p className="mt-2 text-center text-[10px] text-gray-400">
        <span>{currentLocation}</span>&nbsp;节点
      </p>
    </motion.div>
  )
}