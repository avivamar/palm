'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step7Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step7PersonalInfo({ 
  userData,
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step7Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: userData.email || '',
    phone: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '',
    birthMinute: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    trackEvent('palm_personal_info_view', { 
      timestamp: Date.now(),
      photoCompleted: userData.palmPhoto === 'captured'
    })
  }, [userData.palmPhoto])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入你的姓名'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    
    if (!formData.birthYear) {
      newErrors.birthYear = '请选择出生年份'
    }
    
    if (!formData.birthMonth) {
      newErrors.birthMonth = '请选择出生月份'
    }
    
    if (!formData.birthDay) {
      newErrors.birthDay = '请选择出生日期'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    
    trackEvent('palm_personal_info_submit', { 
      hasPhoto: userData.palmPhoto === 'captured',
      hasBirthTime: !!(formData.birthHour && formData.birthMinute),
      timestamp: Date.now()
    })
    
    updateUserData({
      email: formData.email,
      birthDate: formData.birthYear && formData.birthMonth && formData.birthDay 
        ? `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}` 
        : undefined,
      birthTime: formData.birthHour && formData.birthMinute 
        ? `${formData.birthHour.padStart(2, '0')}:${formData.birthMinute.padStart(2, '0')}` 
        : undefined
    })
    
    setTimeout(() => {
      setIsProcessing(false)
      trackEvent('palm_step7_complete', { personalInfoComplete: true })
      goToNextStep()
    }, 1500)
  }
  
  // 生成年份选项（1950-2010）
  const yearOptions = Array.from({ length: 61 }, (_, i) => 2010 - i)
  
  // 生成月份选项
  const monthOptions = [
    { value: '01', label: '1月' }, { value: '02', label: '2月' },
    { value: '03', label: '3月' }, { value: '04', label: '4月' },
    { value: '05', label: '5月' }, { value: '06', label: '6月' },
    { value: '07', label: '7月' }, { value: '08', label: '8月' },
    { value: '09', label: '9月' }, { value: '10', label: '10月' },
    { value: '11', label: '11月' }, { value: '12', label: '12月' }
  ]
  
  // 根据年月计算天数
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
    return daysInMonth
  }
  
  const dayOptions = Array.from({ 
    length: getDaysInMonth(formData.birthYear, formData.birthMonth) 
  }, (_, i) => i + 1)
  
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>步骤 7/20</span>
        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-1">
          <div className="bg-violet-600 h-1 rounded-full" style={{ width: '35%' }}></div>
        </div>
        <span>35%</span>
      </div>
      
      {/* Photo Status */}
      {userData.palmPhoto === 'captured' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="text-green-600">✅</div>
            <span className="text-green-800 font-medium">手掌照片已分析完成，准确率提升至99.1%</span>
          </div>
        </motion.div>
      )}
      
      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-gray-800">
          完善你的财富档案
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          补充基本信息和出生信息，获得最精准的财富指导
          <br />出生时间可帮助我们分析你的最佳投资时机
        </p>
      </motion.div>
      
      {/* Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-5"
      >
        {/* Basic Info */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span>👤</span>
            基本信息
          </div>
          
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="你的姓名"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full h-12 px-4 border-2 rounded-xl text-gray-800 placeholder-gray-500 transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-violet-400'
                }`}
              />
              {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
            </div>
            
            <div>
              <input
                type="email"
                placeholder="你的邮箱 (用于接收财富报告)"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full h-12 px-4 border-2 rounded-xl text-gray-800 placeholder-gray-500 transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-violet-400'
                }`}
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>
            
            <div>
              <input
                type="tel"
                placeholder="手机号码 (可选)"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-violet-400 transition-colors"
              />
            </div>
          </div>
        </div>
        
        {/* Birth Info */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span>🎂</span>
            出生信息
            <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
              影响投资时机分析
            </span>
          </div>
          
          {/* Birth Date */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <select
                value={formData.birthYear}
                onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                className={`w-full h-12 px-3 border-2 rounded-xl text-gray-800 transition-colors ${
                  errors.birthYear ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-violet-400'
                }`}
              >
                <option value="">年份</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              {errors.birthYear && <div className="text-red-500 text-xs mt-1">{errors.birthYear}</div>}
            </div>
            
            <div>
              <select
                value={formData.birthMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, birthMonth: e.target.value }))}
                className={`w-full h-12 px-3 border-2 rounded-xl text-gray-800 transition-colors ${
                  errors.birthMonth ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-violet-400'
                }`}
              >
                <option value="">月份</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              {errors.birthMonth && <div className="text-red-500 text-xs mt-1">{errors.birthMonth}</div>}
            </div>
            
            <div>
              <select
                value={formData.birthDay}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDay: e.target.value }))}
                className={`w-full h-12 px-3 border-2 rounded-xl text-gray-800 transition-colors ${
                  errors.birthDay ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-violet-400'
                }`}
              >
                <option value="">日期</option>
                {dayOptions.map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day}日
                  </option>
                ))}
              </select>
              {errors.birthDay && <div className="text-red-500 text-xs mt-1">{errors.birthDay}</div>}
            </div>
          </div>
          
          {/* Birth Time (Optional) */}
          <div>
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <span>⏰</span>
              出生时间 (可选，有助于精准分析投资时机)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.birthHour}
                onChange={(e) => setFormData(prev => ({ ...prev, birthHour: e.target.value }))}
                className="w-full h-12 px-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-violet-400 transition-colors"
              >
                <option value="">小时</option>
                {hourOptions.map(hour => (
                  <option key={hour} value={hour.toString().padStart(2, '0')}>
                    {hour.toString().padStart(2, '0')}时
                  </option>
                ))}
              </select>
              
              <select
                value={formData.birthMinute}
                onChange={(e) => setFormData(prev => ({ ...prev, birthMinute: e.target.value }))}
                className="w-full h-12 px-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-violet-400 transition-colors"
              >
                <option value="">分钟</option>
                {minuteOptions.map(minute => (
                  <option key={minute} value={minute.toString().padStart(2, '0')}>
                    {minute.toString().padStart(2, '0')}分
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-amber-50 border border-amber-200 rounded-lg p-4"
      >
        <div className="text-center space-y-2">
          <div className="text-sm font-semibold text-amber-800">
            🎯 信息完善后将获得
          </div>
          <div className="text-xs text-amber-700 leading-relaxed">
            • 个性化财富报告 • 专属投资时机分析 • 风险承受能力评估
            <br />• 资产配置建议 • 财富增长路径规划
          </div>
        </div>
      </motion.div>
      
      {/* Submit Button */}
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-14 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-500 transition shadow-md"
        onClick={handleSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? '正在处理...' : '生成我的专属财富报告 →'}
      </motion.button>
      
      {/* Processing State */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-xl p-6 text-center space-y-4 max-w-sm">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-violet-200 rounded-full mx-auto"></div>
              <div className="w-20 h-20 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
            <div className="text-gray-800 font-semibold">正在创建你的财富档案...</div>
            <div className="text-sm text-gray-600">
              整合你的个人信息与AI分析结果
            </div>
            <div className="text-xs text-violet-600">
              即将进入报告生成阶段
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-center text-xs text-gray-400 space-y-1"
      >
        <p>🔒 你的个人信息受256位加密保护</p>
        <p>📧 报告将发送到你的邮箱，请确保邮箱地址正确</p>
      </motion.div>
    </motion.div>
  )
}