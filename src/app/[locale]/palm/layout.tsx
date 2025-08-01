import { Metadata } from 'next'
import { PalmProvider } from '@/components/palm/PalmProvider'
import { PalmAnalytics } from '@/components/palm/PalmAnalytics'

export const metadata: Metadata = {
  title: 'Palm AI 财富分析 - 发现你的投资天赋',
  description: '基于AI的手相财富分析，3分钟发现你的投资潜力和财富机会',
  keywords: '手相分析,财富分析,投资天赋,AI分析,掌纹识别',
}

export default async function PalmLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <PalmProvider locale={locale}>
      <div className="min-h-screen bg-gray-50">
        {children}
        <PalmAnalytics />
      </div>
    </PalmProvider>
  )
}