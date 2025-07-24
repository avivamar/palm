/**
 * Scripts Executor Component
 * Following .cursorrules: TypeScript strict mode, business value focused
 */

'use client';

import { CheckCircle, Clock, Code, Play, Terminal, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

type ScriptStatus = 'idle' | 'running' | 'success' | 'error';

type ScriptInfo = {
  name: string;
  description: string;
  category: 'validation' | 'deployment' | 'maintenance' | 'testing';
  filename: string;
  estimatedTime: string;
};

const availableScripts: ScriptInfo[] = [
  {
    name: 'Environment Check',
    description: 'Validate all environment variables configuration',
    category: 'validation',
    filename: 'check-env.js',
    estimatedTime: '< 5s',
  },
  {
    name: 'Stripe Validation',
    description: 'Test Stripe API connection and configuration',
    category: 'validation',
    filename: 'check-stripe.js',
    estimatedTime: '< 10s',
  },
  {
    name: 'Supabase Check',
    description: 'Verify Supabase connection and authentication',
    category: 'validation',
    filename: 'check-supabase.js',
    estimatedTime: '< 5s',
  },
  {
    name: 'Database Status',
    description: 'Check PostgreSQL database connectivity',
    category: 'validation',
    filename: 'check-db-status.js',
    estimatedTime: '< 5s',
  },
  {
    name: 'Railway Safe Build',
    description: 'Execute Railway deployment with safety checks',
    category: 'deployment',
    filename: 'railway-safe-build.sh',
    estimatedTime: '2-5min',
  },
  {
    name: 'Pre-push Validation',
    description: 'Run all pre-push validation checks',
    category: 'testing',
    filename: 'pre-push-validation.sh',
    estimatedTime: '30s',
  },
  {
    name: 'Locale Validation',
    description: 'Validate internationalization files',
    category: 'validation',
    filename: 'validate-locales.js',
    estimatedTime: '< 5s',
  },
  {
    name: 'Color Sync',
    description: 'Synchronize brand colors across the application',
    category: 'maintenance',
    filename: 'sync-colors.js',
    estimatedTime: '< 5s',
  },
];

function getCategoryBadge(category: ScriptInfo['category']) {
  const variants = {
    validation: { variant: 'default' as const, label: 'Validation' },
    deployment: { variant: 'destructive' as const, label: 'Deployment' },
    maintenance: { variant: 'secondary' as const, label: 'Maintenance' },
    testing: { variant: 'outline' as const, label: 'Testing' },
  };

  const config = variants[category];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getStatusIcon(status: ScriptStatus) {
  switch (status) {
    case 'running':
      return <Terminal className="h-4 w-4 text-blue-500 animate-pulse" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Play className="h-4 w-4 text-muted-foreground" />;
  }
}

export function ScriptsExecutor() {
  const [scriptStatuses, setScriptStatuses] = useState<Record<string, ScriptStatus>>({});
  const [scriptOutputs, setScriptOutputs] = useState<Record<string, string>>({});

  const executeScript = async (script: ScriptInfo) => {
    const scriptId = script.filename;

    setScriptStatuses(prev => ({ ...prev, [scriptId]: 'running' }));
    setScriptOutputs(prev => ({ ...prev, [scriptId]: 'Executing...' }));

    try {
      const response = await fetch('/api/admin/scripts/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptName: script.filename,
          category: script.category,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScriptStatuses(prev => ({ ...prev, [scriptId]: 'success' }));
        setScriptOutputs(prev => ({
          ...prev,
          [scriptId]: `✅ ${script.name} completed successfully\nExecution time: ${result.executionTime}ms\n\n${result.output}`,
        }));
      } else {
        setScriptStatuses(prev => ({ ...prev, [scriptId]: 'error' }));
        setScriptOutputs(prev => ({
          ...prev,
          [scriptId]: `❌ ${script.name} failed\n${result.output}\n${result.error ? `\nError: ${result.error}` : ''}`,
        }));
      }
    } catch (error) {
      setScriptStatuses(prev => ({ ...prev, [scriptId]: 'error' }));
      setScriptOutputs(prev => ({
        ...prev,
        [scriptId]: `❌ Failed to execute ${script.name}\nConnection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  };

  const filterScriptsByCategory = (category: ScriptInfo['category']) => {
    return availableScripts.filter(script => script.category === category);
  };

  const executeMultipleScripts = async (scripts: ScriptInfo[]) => {
    for (const script of scripts) {
      await executeScript(script);
      // Add small delay between scripts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const runAllValidations = () => {
    const validationScripts = filterScriptsByCategory('validation');
    executeMultipleScripts(validationScripts);
  };

  const runPreDeploymentCheck = () => {
    const preDeployScripts = [
      ...filterScriptsByCategory('validation'),
      ...filterScriptsByCategory('testing'),
    ];
    executeMultipleScripts(preDeployScripts);
  };

  const categories: ScriptInfo['category'][] = ['validation', 'deployment', 'maintenance', 'testing'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Terminal className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Scripts Executor</h2>
        <Badge variant="outline">
          {availableScripts.length}
          {' '}
          scripts available
        </Badge>
      </div>

      {/* Scripts by Category */}
      {categories.map((category) => {
        const scripts = filterScriptsByCategory(category);
        if (scripts.length === 0) {
          return null;
        }

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">
                  {category}
                  {' '}
                  Scripts
                </CardTitle>
                {getCategoryBadge(category)}
              </div>
              <CardDescription>
                {category === 'validation' && 'Scripts to validate system configuration and connectivity'}
                {category === 'deployment' && 'Scripts for deployment and build processes'}
                {category === 'maintenance' && 'Maintenance and synchronization scripts'}
                {category === 'testing' && 'Testing and quality assurance scripts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scripts.map((script) => {
                  const scriptId = script.filename;
                  const status = scriptStatuses[scriptId] || 'idle';
                  const output = scriptOutputs[scriptId];

                  return (
                    <div key={scriptId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <h4 className="font-medium">{script.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {script.estimatedTime}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => executeScript(script)}
                          disabled={status === 'running'}
                          variant={status === 'success' ? 'outline' : 'default'}
                        >
                          {status === 'running'
                            ? (
                                <>
                                  <Terminal className="mr-2 h-4 w-4 animate-pulse" />
                                  Running...
                                </>
                              )
                            : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  {status === 'success' ? 'Run Again' : 'Execute'}
                                </>
                              )}
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{script.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <Code className="inline mr-1 h-3 w-3" />
                        scripts/
                        {script.filename}
                      </p>

                      {output && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm font-mono whitespace-pre-line">
                          {output}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Run common script combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start" onClick={runAllValidations}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Run All Validations
            </Button>
            <Button variant="outline" className="justify-start" onClick={runPreDeploymentCheck}>
              <Terminal className="mr-2 h-4 w-4" />
              Pre-deployment Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
