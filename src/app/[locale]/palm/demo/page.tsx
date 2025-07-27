"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowRight, Hand } from "lucide-react";

export default function PalmDemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAnalysis = () => {
    setIsLoading(true);
    // 跳转到分析页面
    router.push("/palm/analysis");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI 手相分析系统
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            结合古老的掌相学智慧与现代AI技术，为您提供专业的手相解读服务
          </p>
        </div>

        {/* 功能展示卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <CardTitle>双手拍照上传</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                支持左右手独立拍照或上传，获得更全面的分析结果。左手展示天赋潜力，右手反映现实发展。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle>AI 智能分析</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                采用先进的图像识别技术，精准识别手掌线条、形状和特征点，提供专业的分析报告。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle>详细解读报告</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                提供性格分析、健康洞察、事业发展、感情运势等多维度解读，支持PDF导出。
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 分析流程展示 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">分析流程</CardTitle>
            <CardDescription>简单三步，开启您的手相之旅</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤚</span>
                </div>
                <h3 className="font-semibold mb-2">1. 上传手掌照片</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  拍摄或上传清晰的左右手掌照片
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="font-semibold mb-2">2. AI 分析处理</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  系统自动识别和分析手掌特征
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="font-semibold mb-2">3. 获取专业报告</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  查看详细的分析结果和建议
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 示例展示 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">双手上传界面预览</CardTitle>
            <CardDescription>支持拖拽上传或拍照功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左手示例 */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <div className="mb-4">
                  <span className="text-4xl">🤚</span>
                </div>
                <h4 className="font-semibold mb-2">左手照片</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  代表天赋和潜力
                </p>
                <Button variant="outline" size="sm">
                  点击上传或拍照
                </Button>
              </div>

              {/* 右手示例 */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <div className="mb-4">
                  <span className="text-4xl">✋</span>
                </div>
                <h4 className="font-semibold mb-2">右手照片</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  代表现实和发展
                </p>
                <Button variant="outline" size="sm">
                  点击上传或拍照
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 行动按钮 */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>正在跳转...</>
            ) : (
              <>
                <Hand className="mr-2 h-5 w-5" />
                开始分析您的手相
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            首次分析免费 • 支持多语言 • 数据安全保护
          </p>
        </div>
      </div>
    </div>
  );
}