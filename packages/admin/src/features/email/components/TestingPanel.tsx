'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  Mail,
  Send,
  TestTube,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import type { EmailTemplateType, SupportedLocale } from '@rolitt/email';
import { useEmailTesting } from '../hooks';

const EMAIL_TYPES: { value: EmailTemplateType; label: string; description: string }[] = [
  { value: 'confirmation', label: 'Confirmation', description: 'Email confirmation for new users' },
  { value: 'recovery', label: 'Password Recovery', description: 'Password reset email' },
  { value: 'invite', label: 'Invitation', description: 'Team invitation email' },
  { value: 'magic_link', label: 'Magic Link', description: 'Passwordless login email' },
  { value: 'email_change', label: 'Email Change', description: 'Email address change confirmation' },
  { value: 'reauthentication', label: 'Reauthentication', description: 'Reauthentication required email' },
];

const SAMPLE_VARIABLES: Record<EmailTemplateType, Record<string, string>> = {
  confirmation: {
    user_name: 'John Doe',
    confirmation_url: 'https://app.rolitt.com/confirm?token=abc123',
    company_name: 'Rolitt',
    support_email: 'support@rolitt.com',
  },
  recovery: {
    user_name: 'John Doe',
    recovery_url: 'https://app.rolitt.com/reset?token=xyz789',
    company_name: 'Rolitt',
    support_email: 'support@rolitt.com',
  },
  invite: {
    user_name: 'John Doe',
    inviter_name: 'Jane Smith',
    invite_url: 'https://app.rolitt.com/invite?token=ghi789',
    company_name: 'Rolitt',
    support_email: 'support@rolitt.com',
  },
  magic_link: {
    user_name: 'John Doe',
    magic_link_url: 'https://app.rolitt.com/magic?token=def456',
    company_name: 'Rolitt',
    support_email: 'support@rolitt.com',
  },
  email_change: {
    user_name: 'John Doe',
    old_email: 'old@example.com',
    new_email: 'new@example.com',
    confirmation_url: 'https://app.rolitt.com/confirm-email-change?token=abc123',
    company_name: 'Rolitt',
    support_email: 'support@rolitt.com',
  },
  reauthentication: {
    user_name: 'John Doe',
    reauthentication_url: 'https://app.rolitt.com/reauth?token=jkl012',
    company_name: 'Rolitt',
    support_email: 'support@rolitt.com',
  },
};

export const TestingPanel: React.FC = () => {
  const {
    testResults,
    isTesting,
    sendTestEmail,
  } = useEmailTesting();

  const [selectedType, setSelectedType] = useState<EmailTemplateType>('confirmation');
  const [customVariables, setCustomVariables] = useState<string>(
    JSON.stringify(SAMPLE_VARIABLES[selectedType], null, 2)
  );
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [variables, setVariables] = useState<Record<string, string>>(SAMPLE_VARIABLES[selectedType]);

  const handleTypeChange = (type: EmailTemplateType) => {
    setSelectedType(type);
    setCustomVariables(JSON.stringify(SAMPLE_VARIABLES[type], null, 2));
    setVariables(SAMPLE_VARIABLES[type]);
  };

  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      // In a real implementation, this would call the email generation API
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${EMAIL_TYPES.find(t => t.value === selectedType)?.label}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #EBFF7F; border-bottom: 2px solid #EBFF7F; padding-bottom: 10px;">
                ${EMAIL_TYPES.find(t => t.value === selectedType)?.label}
              </h1>
              <p>Hello ${variables?.user_name || 'User'},</p>
              <p>This is a preview of your ${selectedType} email template.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Variables:</strong>
                <pre style="margin: 10px 0; font-size: 12px;">${JSON.stringify(variables, null, 2)}</pre>
              </div>
              <p>Best regards,<br>Your Team</p>
            </div>
          </body>
        </html>
      `;
      setPreviewHtml(mockHtml);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSendTest = async () => {
    if (!recipientEmail) {
      alert('Please enter a recipient email address');
      return;
    }
    
    await sendTestEmail({
      emailType: selectedType,
      locale: locale,
      recipient: recipientEmail,
      variables: variables,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Compose Test
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Results
          </TabsTrigger>
        </TabsList>

        {/* Compose Test */}
        <TabsContent value="compose">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>
                  Configure your email test parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Email Type</Label>
                  <div className="grid gap-2">
                    {EMAIL_TYPES.map(type => (
                      <div 
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedType === type.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleTypeChange(type.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                          {selectedType === type.value && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="recipient-email">Recipient Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="locale">Language</Label>
                  <select
                     id="locale"
                     value={locale}
                     onChange={(e) => setLocale(e.target.value as SupportedLocale)}
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   >
                    <option value="en">English</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Variables Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>
                  Customize the variables that will be used in the email template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="variables">Variables (JSON)</Label>
                  <Textarea
                    id="variables"
                    value={customVariables}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      const value = e.target.value;
                      setCustomVariables(value);
                      try {
                        const parsed = JSON.parse(value);
                        setVariables(parsed);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder="Enter JSON variables..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground">
                    Enter valid JSON with the variables you want to test
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleGeneratePreview}
                    disabled={isGeneratingPreview}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isGeneratingPreview ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Generate Preview
                  </Button>
                  
                  <Button 
                    onClick={handleSendTest}
                    disabled={isTesting || !recipientEmail}
                    className="flex items-center gap-2"
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>
                Preview how your email will look to recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewHtml ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-3 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email Preview</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md border">{selectedType}</span>
                    </div>
                  </div>
                  <div className="bg-white">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-[600px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No preview available</p>
                  <p className="text-sm">Generate a preview from the Compose Test tab</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                View the results of your email tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.slice().reverse().map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-medium">
                            {result.success ? 'Test Successful' : 'Test Failed'}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md border">{result.emailType}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid gap-2 text-sm">
                        <div><strong>Recipient:</strong> {result.recipient}</div>
                        <div><strong>Language:</strong> {result.locale}</div>
                        <div><strong>Time:</strong> {result.timestamp.toLocaleString()}</div>
                        {result.messageId && (
                          <div><strong>Message ID:</strong> {result.messageId}</div>
                        )}
                        {result.error && (
                          <div className="flex items-start gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Error:</strong> {result.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet</p>
                  <p className="text-sm">Send a test email to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};