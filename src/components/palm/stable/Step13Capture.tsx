import Link from 'next/link'
import { PalmStepConfig } from '@/libs/palm/config'

interface Step13Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step13Capture({ locale }: Step13Props) {
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-white/30 rounded-full mb-2">
            <div className="h-full w-[100%] bg-white rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-white/70">Step 13 / 21</span>
        </header>

        <section className="text-center mb-8 text-white">
          <h1 className="text-2xl font-bold mb-3">
            拍照你的手掌
          </h1>
          <p className="text-white/80 leading-relaxed">
            按照指引拍照，确保掌纹清晰可见
          </p>
        </section>

        {/* 模拟相机界面 */}
        <div className="relative bg-black rounded-2xl overflow-hidden mb-8" style={{aspectRatio: '3/4'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white/60">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-white/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">📷</span>
              </div>
              <p className="text-sm">相机预览</p>
              <p className="text-xs mt-1">将手掌放在画面中央</p>
            </div>
          </div>
          
          {/* 对焦框 */}
          <div className="absolute inset-4 border-2 border-green-400 rounded-xl opacity-60"></div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center items-center space-x-8 mb-8">
          <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white">
            🖼️
          </button>
          
          <Link
            href={`/${locale}/palm/stable/14`}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors shadow-lg"
          >
            📷
          </Link>
          
          <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white">
            🔄
          </button>
        </div>

        {/* 提示 */}
        <div className="bg-white/10 rounded-xl p-4">
          <h4 className="font-semibold text-white mb-2">📝 拍照技巧</h4>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• 手掌平整向上，五指张开</li>
            <li>• 距离相机15-20厘米</li>
            <li>• 确保光线充足且均匀</li>
          </ul>
        </div>
      </main>
    </div>
  )
}