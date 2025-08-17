'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step6Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step6Birth({ 
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step6Props) {
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: ''
  })
  const [canContinue, setCanContinue] = useState(false)
  
  useEffect(() => {
    trackEvent('palm_birth_view', { 
      timestamp: Date.now(),
      step: 6
    })
  }, [])
  
  useEffect(() => {
    // 检查是否可以继续（年月日必填）
    setCanContinue(!!(formData.year && formData.month && formData.day))
  }, [formData])
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 如果选择了年份和月份，更新日期选项
    if (field === 'year' || field === 'month') {
      if (field === 'month' && formData.day) {
        // 检查当前选择的日期是否在新月份中有效
        const yearValue = formData.year
        const monthValue = value // Since we know field === 'month' here
        const daysInMonth = getDaysInMonth(yearValue, monthValue)
        if (parseInt(formData.day) > daysInMonth) {
          setFormData(prev => ({ ...prev, day: '' }))
        }
      }
    }
  }
  
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31
    return new Date(parseInt(year), parseInt(month), 0).getDate()
  }
  
  const handleContinue = () => {
    if (canContinue) {
      updateUserData({
        birthDate: `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`,
        birthTime: formData.hour && formData.minute ? `${formData.hour.padStart(2, '0')}:${formData.minute.padStart(2, '0')}` : undefined
      })
      
      trackEvent('palm_birth_complete', { 
        hasTime: !!(formData.hour && formData.minute),
        date: `${formData.year}-${formData.month}-${formData.day}`
      })
      
      goToNextStep()
    }
  }
  
  // 生成年份选项（1950-2010）
  const yearOptions = Array.from({ length: 61 }, (_, i) => 2010 - i)
  
  // 生成月份选项
  const monthOptions = [
    { value: '1', label: '1月' }, { value: '2', label: '2月' },
    { value: '3', label: '3月' }, { value: '4', label: '4月' },
    { value: '5', label: '5月' }, { value: '6', label: '6月' },
    { value: '7', label: '7月' }, { value: '8', label: '8月' },
    { value: '9', label: '9月' }, { value: '10', label: '10月' },
    { value: '11', label: '11月' }, { value: '12', label: '12月' }
  ]
  
  // 生成日期选项
  const dayOptions = Array.from({ 
    length: getDaysInMonth(formData.year, formData.month) 
  }, (_, i) => i + 1)
  
  // 生成小时选项
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  
  // 生成分钟选项
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  
  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[412px] min-h-screen px-6 pt-6 pb-20 bg-white text-gray-900">
        {/* LOGO */}
        <img src="/palm/img/logo.svg" className="h-6 mx-auto mb-6 select-none" alt="ThePalmistryLife" />

        {/* PROGRESS */}
        <div className="relative w-full max-w-[340px] h-1.5 mx-auto bg-violet-100 rounded-full">
          <div className="h-full w-[88%] bg-violet-500 rounded-full"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 6 / 7</span>
        </div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-2xl font-bold leading-snug"
        >
          您的出生日期是？
        </motion.h1>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 space-y-5"
        >
          {/* DATE SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">出生日期</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {/* YEAR */}
              <div className="relative">
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full h-12 px-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="" disabled hidden>年份</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {/* MONTH */}
              <div className="relative">
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', e.target.value)}
                  className="w-full h-12 px-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="" disabled hidden>月份</option>
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {/* DAY */}
              <div className="relative">
                <select
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                  className="w-full h-12 px-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
                  required
                  disabled={!formData.year || !formData.month}
                >
                  <option value="" disabled hidden>日</option>
                  {dayOptions.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* TIME SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">出生时刻（可选）</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* HOUR */}
              <div className="relative">
                <select
                  value={formData.hour}
                  onChange={(e) => handleInputChange('hour', e.target.value)}
                  className="w-full h-12 px-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
                >
                  <option value="">小时</option>
                  {hourOptions.map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}时
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {/* MINUTE */}
              <div className="relative">
                <select
                  value={formData.minute}
                  onChange={(e) => handleInputChange('minute', e.target.value)}
                  className="w-full h-12 px-4 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
                >
                  <option value="">分钟</option>
                  {minuteOptions.map(minute => (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}分
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 leading-relaxed">
            💡 <strong>出生时间</strong>能帮助我们生成更精确的手相对应的星盘和财富分析。
            如果不记得具体时间也没关系，我们会使用默认的中午12点进行计算。
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={handleContinue}
          disabled={!canContinue}
          className={`mt-10 w-full h-14 rounded-xl text-lg font-semibold shadow-md transition ${
            canContinue
              ? 'bg-violet-600 text-white hover:bg-violet-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          继续 →
        </motion.button>

        {/* Legal */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4"
        >
          继续即代表您同意我们的
          <a href="/privacy" className="underline">隐私政策</a>、
          <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
        </motion.p>
      </main>
    </div>
  )
}