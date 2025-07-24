'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save, 
  X,
  Mail,
  Globe,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useEmailTemplates, useEmailPreview } from '../hooks';
import type { EmailTemplate } from '../types';
import type { EmailTemplateType, SupportedLocale } from '@rolitt/email';
import { SUPPORTED_LOCALES } from '@rolitt/email';

const EMAIL_TEMPLATE_TYPES: EmailTemplateType[] = [
  'confirmation',
  'recovery', 
  'invite',
  'magic_link',
  'email_change',
  'reauthentication'
];

const TEMPLATE_TYPE_LABELS: Record<EmailTemplateType, string> = {
  confirmation: 'Email Confirmation',
  recovery: 'Password Recovery',
  invite: 'User Invitation',
  magic_link: 'Magic Link',
  email_change: 'Email Change',
  reauthentication: 'Re-authentication'
};

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  'zh-HK': '繁體中文',
  ja: '日本語',
  es: 'Español'
};

export const TemplateManager: React.FC = () => {
  const {
    templates,
    currentTemplate,
    isEditing,
    isSaving,
    createTemplate,
    deleteTemplate,
    duplicateTemplate,
    setCurrentTemplate,
    updateCurrentTemplate,
    saveCurrentTemplate,
  } = useEmailTemplates();

  const {
    generatePreview,
    setPreviewMode,
  } = useEmailPreview();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [newTemplateType, setNewTemplateType] = useState<EmailTemplateType>('confirmation');
  const [newTemplateLocale, setNewTemplateLocale] = useState<SupportedLocale>('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EmailTemplateType | 'all'>('all');
  const [filterLocale, setFilterLocale] = useState<SupportedLocale | 'all'>('all');

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         TEMPLATE_TYPE_LABELS[template.type].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesLocale = filterLocale === 'all' || template.locale === filterLocale;
    
    return matchesSearch && matchesType && matchesLocale;
  });

  const handleCreateTemplate = async () => {
    await createTemplate(newTemplateType, newTemplateLocale);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
  };

  const handlePreviewTemplate = async (template: EmailTemplate) => {
    await generatePreview(template.type, template.locale, template.variables);
    setPreviewMode(true);
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    await duplicateTemplate(template.id);
  };

  const handleSaveTemplate = async () => {
    await saveCurrentTemplate();
  };

  const handleCancelEdit = () => {
    setCurrentTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterType} onValueChange={(value) => setFilterType(value as EmailTemplateType | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EMAIL_TEMPLATE_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {TEMPLATE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLocale} onValueChange={(value) => setFilterLocale(value as SupportedLocale | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {SUPPORTED_LOCALES.map(locale => (
                <SelectItem key={locale} value={locale}>
                  {LOCALE_LABELS[locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Email Template</DialogTitle>
              <DialogDescription>
                Choose the template type and language for your new email template.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template-type">Template Type</Label>
                <Select value={newTemplateType} onValueChange={(value) => setNewTemplateType(value as EmailTemplateType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {TEMPLATE_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-locale">Language</Label>
                <Select value={newTemplateLocale} onValueChange={(value) => setNewTemplateLocale(value as SupportedLocale)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LOCALES.map(locale => (
                      <SelectItem key={locale} value={locale}>
                        {LOCALE_LABELS[locale]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Editor */}
      {isEditing && currentTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editing: {TEMPLATE_TYPE_LABELS[currentTemplate.type]} ({LOCALE_LABELS[currentTemplate.locale]})
            </CardTitle>
            <CardDescription>
              Make changes to your email template. Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={currentTemplate.subject}
                  onChange={(e) => updateCurrentTemplate({ subject: e.target.value })}
                  placeholder="Enter email subject..."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="html-content">HTML Content</Label>
                <Textarea
                  id="html-content"
                  value={currentTemplate.htmlContent}
                  onChange={(e) => updateCurrentTemplate({ htmlContent: e.target.value })}
                  placeholder="Enter HTML content..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="text-content">Text Content (Optional)</Label>
                <Textarea
                  id="text-content"
                  value={currentTemplate.textContent || ''}
                  onChange={(e) => updateCurrentTemplate({ textContent: e.target.value })}
                  placeholder="Enter plain text content..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="is-active"
                  checked={currentTemplate.isActive}
                  onCheckedChange={(checked) => updateCurrentTemplate({ isActive: checked })}
                />
                <Label htmlFor="is-active">Active Template</Label>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveTemplate} disabled={isSaving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handlePreviewTemplate(currentTemplate)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates ({filteredTemplates.length})
          </CardTitle>
          <CardDescription>
            Manage your email templates for different types and languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {TEMPLATE_TYPE_LABELS[template.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {LOCALE_LABELS[template.locale]}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {template.lastModified.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(template);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No templates found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {templateToDelete && (
            <div className="py-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="font-medium">
                  {TEMPLATE_TYPE_LABELS[templateToDelete.type]} ({LOCALE_LABELS[templateToDelete.locale]})
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {templateToDelete.subject}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};