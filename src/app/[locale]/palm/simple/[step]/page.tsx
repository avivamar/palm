import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import path from 'path'

type Props = {
  params: Promise<{ step: string; locale: string }>
}

export default async function SimplePalmPage({ params }: Props) {
  const { step, locale } = await params
  const stepNum = parseInt(step)
  
  if (isNaN(stepNum) || stepNum < 0 || stepNum > 20) {
    notFound()
  }
  
  try {
    // 直接读取原始HTML文件
    const htmlPath = path.join(process.cwd(), 'palmpage', `${stepNum}.html`)
    const htmlContent = await readFile(htmlPath, 'utf-8')
    
    // 替换静态路径为动态路径
    const modifiedHtml = htmlContent
      .replace(/href="(\d+)\.html"/g, `href="/${locale}/palm/simple/$1"`)
      .replace(/src="img\//g, 'src="/palm/img/')
      .replace(/href="css\//g, 'href="/palm/css/')
    
    return (
      <div dangerouslySetInnerHTML={{ __html: modifiedHtml }} />
    )
  } catch (error) {
    console.error('Failed to load palm page:', error)
    notFound()
  }
}

// 生成静态路径
export function generateStaticParams() {
  const steps = Array.from({ length: 21 }, (_, i) => i.toString())
  const locales = ['en', 'es', 'ja', 'zh-HK']
  
  return locales.flatMap(locale =>
    steps.map(step => ({
      locale,
      step
    }))
  )
}

// 启用动态渲染以避免404
export const dynamic = 'force-dynamic'