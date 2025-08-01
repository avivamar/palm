'use client'

export function ScarcityBanner() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-center animate-pulse">
        <p className="text-sm text-orange-700 font-medium">
          ⚠️ 仅剩 <span className="font-bold">23</span> 个免费名额
        </p>
      </div>
    </div>
  )
}