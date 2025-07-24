'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Label, 
  Button, 
  Textarea, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Progress, 
  Slider 
} from '@/components/ui';
import { 
  Play, 
  Square, 
  RotateCcw,
  Copy,
  Download,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  Cpu,
  Cloud,
  MessageSquare,
  FileText
} from 'lucide-react';
import type { AIProvider, AITestResult } from '../types';

const providers: { value: AIProvider; label: string; icon: React.ReactNode }[] = [
  { value: 'openai', label: 'OpenAI', icon: <Brain className="h-4 w-4" /> },
  { value: 'claude', label: 'Claude', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'gemini', label: 'Gemini', icon: <Cpu className="h-4 w-4" /> },
  { value: 'azure', label: 'Azure', icon: <Cloud className="h-4 w-4" /> },
];

const models: Record<AIProvider, string[]> = {
  openai: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  gemini: ['gemini-pro', 'gemini-pro-vision'],
  azure: ['gpt-4-azure', 'gpt-35-turbo-azure'],
};

const samplePrompts = [
  {
    name: 'Product Description',
    prompt: 'Write a compelling product description for a premium AI companion device that helps users with daily tasks. Include key features like voice interaction, smart home integration, and personalized assistance.',
  },
  {
    name: 'Customer Support',
    prompt: 'A customer is asking about refund policy for an AI device they purchased 3 weeks ago. The device is not working properly. Please provide a helpful and professional response.',
  },
  {
    name: 'Technical Explanation',
    prompt: 'Explain how machine learning algorithms work in simple terms that a non-technical person can understand. Use analogies and examples.',
  },
];

export function AITesting() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<AITestResult[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<AIProvider[]>(['openai', 'claude']);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      if (compareMode) {
        // 比较模式：同时测试多个提供商
        const promises = selectedProviders.map(async (provider) => {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
          
          return {
            provider,
            model: models[provider][0] || 'unknown',
            prompt,
            response: `Sample response from ${provider} for the prompt: "${prompt.slice(0, 50)}..." This is a mock response for testing purposes.`,
            responseTime: 1200 + Math.random() * 800,
            tokens: Math.floor(Math.random() * 500) + 200,
            cost: (Math.random() * 0.05 + 0.01),
            timestamp: new Date().toISOString(),
          };
        });

        const compareResults = await Promise.all(promises);
        setResults(compareResults);
      } else {
        // 单一模式
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const result: AITestResult = {
          provider: selectedProvider,
          model: selectedModel || 'unknown',
          prompt,
          response: `Sample response from ${selectedProvider} using ${selectedModel}. This is a detailed response to demonstrate the testing interface. The response includes multiple paragraphs and shows how the AI model processes the given prompt with the specified parameters.`,
          responseTime: 1200 + Math.random() * 800,
          tokens: Math.floor(Math.random() * 500) + 200,
          cost: (Math.random() * 0.05 + 0.01),
          timestamp: new Date().toISOString(),
        };

        setResults([result]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSample = (sample: typeof samplePrompts[0]) => {
    setPrompt(sample.prompt);
  };

  const handleCopyResponse = (response: string) => {
    navigator.clipboard.writeText(response);
  };

  const handleExportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-test-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Testing Studio</h2>
          <p className="text-muted-foreground">
            Test and compare AI models with different prompts and parameters
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={compareMode ? "default" : "outline"}
            onClick={() => setCompareMode(!compareMode)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare Mode
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={handleExportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧配置面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 模型配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {compareMode ? (
                <div className="space-y-2">
                  <Label>Select Providers to Compare</Label>
                  <div className="space-y-2">
                    {providers.map(provider => (
                      <div key={provider.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={provider.value}
                          checked={selectedProviders.includes(provider.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProviders(prev => [...prev, provider.value]);
                            } else {
                              setSelectedProviders(prev => prev.filter(p => p !== provider.value));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={provider.value} className="flex items-center gap-2 cursor-pointer">
                          {provider.icon}
                          {provider.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as AIProvider)}>
                      <SelectTrigger id="provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider.value} value={provider.value}>
                            <div className="flex items-center gap-2">
                              {provider.icon}
                              {provider.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger id="model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models[selectedProvider].map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 参数配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <span className="text-sm text-muted-foreground">{temperature[0]}</span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onValueChange={setTemperature}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <span className="text-sm text-muted-foreground">{maxTokens[0]}</span>
                </div>
                <Slider
                  id="max-tokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                />
              </div>
            </CardContent>
          </Card>

          {/* 示例提示词 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {samplePrompts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleLoadSample(sample)}
                >
                  <div>
                    <div className="font-medium">{sample.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {sample.prompt}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 右侧主要区域 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 输入区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Prompt Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Characters: {prompt.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPrompt('')}
                    disabled={!prompt}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 生成进度 */}
          {isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating response...</span>
                    <span>Please wait</span>
                  </div>
                  <Progress value={33} className="animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 结果显示 */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compareMode ? (
                  <Tabs defaultValue={results[0]?.provider} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                      {results.map(result => (
                        <TabsTrigger key={result.provider} value={result.provider}>
                          <div className="flex items-center gap-1">
                            {providers.find(p => p.value === result.provider)?.icon}
                            <span className="capitalize">{result.provider}</span>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {results.map(result => (
                      <TabsContent key={result.provider} value={result.provider} className="space-y-4">
                        {/* 指标 */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              <Clock className="h-4 w-4" />
                              {result.responseTime.toFixed(0)}ms
                            </div>
                            <div className="text-sm text-muted-foreground">Response Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              <Zap className="h-4 w-4" />
                              {result.tokens}
                            </div>
                            <div className="text-sm text-muted-foreground">Tokens</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {result.cost.toFixed(4)}
                            </div>
                            <div className="text-sm text-muted-foreground">Cost</div>
                          </div>
                        </div>

                        {/* 响应内容 */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Response</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyResponse(result.response)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap text-sm">{result.response}</p>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={index} className="space-y-4">
                        {/* 指标 */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              <Clock className="h-4 w-4" />
                              {result.responseTime.toFixed(0)}ms
                            </div>
                            <div className="text-sm text-muted-foreground">Response Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              <Zap className="h-4 w-4" />
                              {result.tokens}
                            </div>
                            <div className="text-sm text-muted-foreground">Tokens</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold flex items-center justify-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {result.cost.toFixed(4)}
                            </div>
                            <div className="text-sm text-muted-foreground">Cost</div>
                          </div>
                        </div>

                        {/* 响应内容 */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Response</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyResponse(result.response)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap text-sm">{result.response}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}