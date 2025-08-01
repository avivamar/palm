'use server'

import { redirect } from 'next/navigation'

// 统一的表单处理函数
export async function handlePalmFormSubmission(
  locale: string, 
  currentStep: number,
  formData: FormData
) {
  const nextStep = currentStep + 1
  
  // 收集表单数据
  const data: Record<string, string> = {}
  
  // 确保 formData 是有效的 FormData 对象
  if (formData && typeof formData.entries === 'function') {
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && key !== 'action') {
        data[key] = value
      }
    }
  } else {
    console.error('Invalid FormData received:', formData)
    throw new Error('Invalid FormData object')
  }
  
  // 构建查询参数
  const searchParams = new URLSearchParams()
  
  // 添加新的表单数据
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })
  
  // 重定向到下一步
  const queryString = searchParams.toString()
  const redirectUrl = `/${locale}/palm/stable/${nextStep}${queryString ? '?' + queryString : ''}`
  
  redirect(redirectUrl)
}

// 专门处理多选表单（如动机选择）
export async function handleMultiSelectForm(
  locale: string,
  currentStep: number,
  fieldName: string,
  formData: FormData
) {
  // 确保 formData 是有效的 FormData 对象
  if (!formData || typeof formData.getAll !== 'function') {
    console.error('Invalid FormData received:', formData)
    throw new Error('Invalid FormData object')
  }
  
  const selectedValues = formData.getAll(fieldName) as string[]
  const data = { [fieldName]: selectedValues.join(',') }
  
  const searchParams = new URLSearchParams()
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })
  
  const nextStep = currentStep + 1
  const queryString = searchParams.toString()
  const redirectUrl = `/${locale}/palm/stable/${nextStep}${queryString ? '?' + queryString : ''}`
  
  redirect(redirectUrl)
}