'use client';

import { ArrowLeft, Home, Search, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  const t = useTranslations('NotFound');

  // 俏皮的 404 消息数组
  const funMessages = [
    '🤖 我们的 AI 伙伴也找不到这个页面...',
    '🔍 页面去度假了，但忘了告诉我们',
    '🚀 这个页面可能飞到了另一个维度',
    '🎭 页面在玩捉迷藏，而且它赢了',
    '🌟 也许这个页面还在未来等着被创造',
  ];

  const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 px-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* 动画 404 数字 */}
          <div className="mx-auto mb-6 relative">
            <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text animate-pulse">
              404
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-pink-400 animate-bounce delay-300" />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('title')}
          </CardTitle>

          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
            {t('description')}
          </CardDescription>

          {/* 俏皮消息 */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {randomMessage}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 主要操作按钮 */}
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                {t('back_home')}
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleGoBack} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回上页
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">
                  <Search className="w-4 h-4 mr-2" />
                  联系我们
                </Link>
              </Button>
            </div>
          </div>

          {/* 热门页面推荐 */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
              或者访问这些热门页面：
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link
                href="/pre-order"
                className="text-blue-600 dark:text-blue-400 hover:underline text-center py-1"
              >
                🛒 预购产品
              </Link>
              <Link
                href="/about"
                className="text-blue-600 dark:text-blue-400 hover:underline text-center py-1"
              >
                ℹ️ 关于我们
              </Link>
              <Link
                href="/blog"
                className="text-blue-600 dark:text-blue-400 hover:underline text-center py-1"
              >
                📝 博客
              </Link>
              <Link
                href="/faq"
                className="text-blue-600 dark:text-blue-400 hover:underline text-center py-1"
              >
                ❓ 常见问题
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
