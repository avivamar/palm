'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input, 
  Label, 
  Button, 
  Badge, 
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  Save,
  X,
  Globe,
  Tag
} from 'lucide-react';
import type { AIPromptTemplate } from '../types';

// 模拟数据
const mockPrompts: AIPromptTemplate[] = [
  {
    id: '1',
    name: 'Product Description',
    category: 'ecommerce',
    content: 'Generate a compelling product description for {{productName}} with features: {{features}}. Target audience: {{targetAudience}}. Tone: {{tone}}.',
    variables: ['productName', 'features', 'targetAudience', 'tone'],
    metadata: {
      title: 'Product Description Generator',
      description: 'Generate compelling product descriptions for e-commerce',
      version: '1.0.0',
      tags: ['ecommerce', 'marketing', 'product'],
      temperature: 0.8,
      maxTokens: 500
    },
    locale: 'en',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Customer Support',
    category: 'customer-service',
    content: 'You are a helpful customer service representative for Rolitt AI products. Answer the following question: {{question}}. Be professional and helpful.',
    variables: ['question'],
    metadata: {
      title: 'Customer Support Assistant',
      description: 'Handle customer inquiries professionally',
      version: '1.2.0',
      tags: ['support', 'customer-service'],
      temperature: 0.3,
      maxTokens: 300
    },
    locale: 'en',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'Marketing Copy',
    category: 'content',
    content: 'Create engaging marketing copy for {{productName}}. Focus on {{keyBenefits}}. Style: {{style}}. Length: {{length}}.',
    variables: ['productName', 'keyBenefits', 'style', 'length'],
    metadata: {
      title: 'Marketing Copy Generator',
      description: 'Create engaging marketing content',
      version: '1.1.0',
      tags: ['marketing', 'content', 'copywriting'],
      temperature: 0.9,
      maxTokens: 400
    },
    locale: 'en',
    createdAt: '2024-01-12T16:20:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
    createdBy: 'admin'
  }
];

const categories = ['ecommerce', 'customer-service', 'content', 'system', 'other'];
const locales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ja', name: '日本語' },
  { code: 'zh-HK', name: '繁體中文' }
];

export function PromptManager() {
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>(mockPrompts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocale, setSelectedLocale] = useState<string>('all');
  const [editingPrompt, setEditingPrompt] = useState<AIPromptTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 过滤逻辑
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesLocale = selectedLocale === 'all' || prompt.locale === selectedLocale;
    
    return matchesSearch && matchesCategory && matchesLocale;
  });

  const handleCreatePrompt = () => {
    const newPrompt: AIPromptTemplate = {
      id: Date.now().toString(),
      name: 'New Prompt',
      category: 'system',
      content: '',
      variables: [],
      metadata: {
        title: 'New Prompt',
        description: '',
        version: '1.0.0',
        tags: [],
        temperature: 0.7,
        maxTokens: 500
      },
      locale: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };
    setEditingPrompt(newPrompt);
    setIsDialogOpen(true);
  };

  const handleEditPrompt = (prompt: AIPromptTemplate) => {
    setEditingPrompt({ ...prompt });
    setIsDialogOpen(true);
  };

  const handleSavePrompt = () => {
    if (!editingPrompt) return;

    if (editingPrompt.id && prompts.find(p => p.id === editingPrompt.id)) {
      // 更新现有提示词
      setPrompts(prev => prev.map(p => 
        p.id === editingPrompt.id 
          ? { ...editingPrompt, updatedAt: new Date().toISOString() }
          : p
      ));
    } else {
      // 创建新提示词
      setPrompts(prev => [...prev, { ...editingPrompt, id: Date.now().toString() }]);
    }

    setIsDialogOpen(false);
    setEditingPrompt(null);
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicatePrompt = (prompt: AIPromptTemplate) => {
    const duplicated: AIPromptTemplate = {
      ...prompt,
      id: Date.now().toString(),
      name: `${prompt.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPrompts(prev => [...prev, duplicated]);
  };

  // 提取变量
  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? [...new Set(matches.map(m => m.slice(2, -2)))] : [];
  };

  const updatePromptContent = (content: string) => {
    if (!editingPrompt) return;
    const variables = extractVariables(content);
    setEditingPrompt({
      ...editingPrompt,
      content,
      variables
    });
  };

  return (
    <div className="space-y-6">
      {/* 标题和操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Prompt Templates</h2>
          <p className="text-muted-foreground">
            Manage AI prompt templates with multi-language support
          </p>
        </div>
        <Button onClick={handleCreatePrompt}>
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocale} onValueChange={setSelectedLocale}>
              <SelectTrigger className="w-[150px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {locales.map(locale => (
                  <SelectItem key={locale.code} value={locale.code}>
                    {locale.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 提示词列表 */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Templates ({filteredPrompts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prompt.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {prompt.metadata.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {prompt.category.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {locales.find(l => l.code === prompt.locale)?.name || prompt.locale}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prompt.variables.slice(0, 3).map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {prompt.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{prompt.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{prompt.metadata.version}</code>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(prompt.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPrompt(prompt)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePrompt(prompt)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt?.id ? 'Edit Prompt Template' : 'Create Prompt Template'}
            </DialogTitle>
            <DialogDescription>
              Configure your AI prompt template with variables and metadata
            </DialogDescription>
          </DialogHeader>

          {editingPrompt && (
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt-name">Name</Label>
                      <Input
                        id="prompt-name"
                        value={editingPrompt.name}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          name: e.target.value,
                          metadata: { ...editingPrompt.metadata, title: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prompt-category">Category</Label>
                      <Select 
                        value={editingPrompt.category} 
                        onValueChange={(value) => setEditingPrompt({
                          ...editingPrompt,
                          category: value
                        })}
                      >
                        <SelectTrigger id="prompt-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-description">Description</Label>
                    <Input
                      id="prompt-description"
                      value={editingPrompt.metadata.description}
                      onChange={(e) => setEditingPrompt({
                        ...editingPrompt,
                        metadata: { ...editingPrompt.metadata, description: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt-locale">Language</Label>
                      <Select 
                        value={editingPrompt.locale} 
                        onValueChange={(value) => setEditingPrompt({
                          ...editingPrompt,
                          locale: value
                        })}
                      >
                        <SelectTrigger id="prompt-locale">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locales.map(locale => (
                            <SelectItem key={locale.code} value={locale.code}>
                              {locale.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prompt-version">Version</Label>
                      <Input
                        id="prompt-version"
                        value={editingPrompt.metadata.version}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          metadata: { ...editingPrompt.metadata, version: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-tags">Tags (comma-separated)</Label>
                    <Input
                      id="prompt-tags"
                      value={editingPrompt.metadata.tags.join(', ')}
                      onChange={(e) => setEditingPrompt({
                        ...editingPrompt,
                        metadata: { 
                          ...editingPrompt.metadata, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }
                      })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt-content">Prompt Content</Label>
                    <Textarea
                      id="prompt-content"
                      value={editingPrompt.content}
                      onChange={(e) => updatePromptContent(e.target.value)}
                      placeholder="Write your prompt template here. Use {{variableName}} for variables."
                      className="min-h-[200px] font-mono"
                    />
                    <div className="text-sm text-muted-foreground">
                      Use double curly braces for variables: {'{'}{'}'} variableName {'}'}{'}'}
                    </div>
                  </div>

                  {editingPrompt.variables.length > 0 && (
                    <div className="space-y-2">
                      <Label>Detected Variables</Label>
                      <div className="flex flex-wrap gap-2">
                        {editingPrompt.variables.map(variable => (
                          <Badge key={variable} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={editingPrompt.metadata.temperature || 0.7}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          metadata: { 
                            ...editingPrompt.metadata, 
                            temperature: parseFloat(e.target.value) 
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">Max Tokens</Label>
                      <Input
                        id="max-tokens"
                        type="number"
                        min="1"
                        max="4000"
                        value={editingPrompt.metadata.maxTokens || 500}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          metadata: { 
                            ...editingPrompt.metadata, 
                            maxTokens: parseInt(e.target.value) 
                          }
                        })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSavePrompt}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}