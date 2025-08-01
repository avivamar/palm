import Link from 'next/link'
import { PalmStepConfig } from '@/libs/palm/config'

interface Step12Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step12Upload({ locale }: Step12Props) {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[100%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 12 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            上传手掌照片
          </h1>
          <p className="text-gray-600 leading-relaxed">
            AI将分析你的掌纹特征，提供精准的财富分析
          </p>
        </section>

        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">📷</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">选择上传方式</h3>
            <p className="text-sm text-gray-600 mb-6">选择最适合你的方式上传手掌照片</p>
            
            <div className="space-y-4">
              <Link
                href={`/${locale}/palm/stable/13`}
                className="block w-full h-12 bg-violet-600 text-white text-lg font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg flex items-center justify-center"
              >
                📷 现在拍照
              </Link>
              
              <label className="block w-full h-12 bg-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center">
                📁 从相册选择
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📝 拍照提示</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 保持手掌平整，纹理清晰</li>
            <li>• 光线充足，避免阴影</li>
            <li>• 手掌完整在画面中</li>
          </ul>
        </div>
      </main>
    </div>
  )
}