// 极简的localStorage工具函数 - 服务端安全
export const PalmStorage = {
  // 获取数据
  getData: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem('palm-data')
      if (!data) return null
      const parsed = JSON.parse(data)
      return parsed[key] || null
    } catch (e) {
      console.warn('Failed to get palm data:', e)
      return null
    }
  },

  // 保存数据
  setData: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      const current = localStorage.getItem('palm-data')
      const data = current ? JSON.parse(current) : {}
      data[key] = value
      localStorage.setItem('palm-data', JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save palm data:', e)
    }
  },

  // 获取所有数据
  getAllData: () => {
    if (typeof window === 'undefined') return {}
    try {
      const data = localStorage.getItem('palm-data')
      return data ? JSON.parse(data) : {}
    } catch (e) {
      console.warn('Failed to get all palm data:', e)
      return {}
    }
  },

  // 清除数据
  clearData: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('palm-data')
  }
}