/**
 * Deployment Tools Component
 * Following .cursorrules: TypeScript strict mode, business value focused
 */

'use client';

import { AlertTriangle, CheckCircle, Clock, GitBranch, Rocket, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

type DeploymentStatus = 'idle' | 'building' | 'deploying' | 'success' | 'failed';

type DeploymentRecord = {
  deploymentId: string;
  status: DeploymentStatus;
  logs: string[];
  startTime: string;
  endTime?: string;
  duration?: number;
  type?: string;
  branch?: string;
};

export function DeploymentTools() {
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [currentDeploymentId, setCurrentDeploymentId] = useState<string | null>(null);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentRecord[]>([]);

  // Load deployment history on component mount
  useEffect(() => {
    loadDeploymentHistory();
  }, []);

  // Poll deployment status if there's an active deployment
  useEffect(() => {
    if (currentDeploymentId && (status === 'building' || status === 'deploying')) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/admin/deployment/status?id=${currentDeploymentId}`);
          if (response.ok) {
            const deployment = await response.json();
            setStatus(deployment.status);
            setLogs(deployment.logs);

            if (deployment.status === 'success' || deployment.status === 'failed') {
              setCurrentDeploymentId(null);
              loadDeploymentHistory(); // Refresh history
            }
          }
        } catch (error) {
          console.error('Failed to poll deployment status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [currentDeploymentId, status]);

  const loadDeploymentHistory = async () => {
    try {
      const response = await fetch('/api/admin/deployment/history');
      if (response.ok) {
        const history = await response.json();
        setDeploymentHistory(history);
      }
    } catch (error) {
      console.error('Failed to load deployment history:', error);
    }
  };

  const startDeployment = async (type: 'build' | 'deploy' | 'build-and-deploy', branch: string = 'main') => {
    try {
      setStatus('building');
      setLogs(['🚀 Initiating deployment...']);

      const response = await fetch('/api/admin/deployment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          branch,
          environment: 'production',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentDeploymentId(result.deploymentId);
        setStatus(result.status);
        setLogs(result.logs);
      } else {
        const error = await response.json();
        setStatus('failed');
        setLogs([`❌ Failed to start deployment: ${error.error}`]);
      }
    } catch (error) {
      setStatus('failed');
      setLogs([`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'building':
        return <Terminal className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'deploying':
        return <Rocket className="h-5 w-5 text-orange-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Rocket className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'building':
        return <Badge variant="outline" className="text-blue-600">Building</Badge>;
      case 'deploying':
        return <Badge variant="outline" className="text-orange-600">Deploying</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Deployment Tools</h2>
        </div>
        {getStatusBadge()}
      </div>

      {/* Deployment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle>Current Deployment Status</CardTitle>
          </div>
          <CardDescription>
            Manage build and deployment processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => startDeployment('build-and-deploy')}
              disabled={status === 'building' || status === 'deploying'}
              className="w-full"
            >
              {status === 'building' || status === 'deploying'
                ? (
                    <>
                      <Terminal className="mr-2 h-4 w-4 animate-pulse" />
                      {status === 'building' ? 'Building...' : 'Deploying...'}
                    </>
                  )
                : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Deploy to Railway
                    </>
                  )}
            </Button>

            {logs.length > 0 && (
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{new Date().toLocaleTimeString()}</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Deploy Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Deploy Options</CardTitle>
          <CardDescription>Pre-configured deployment scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start" onClick={() => startDeployment('build-and-deploy', 'main')}>
              <GitBranch className="mr-2 h-4 w-4" />
              Deploy from Main Branch
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => startDeployment('build')}>
              <Rocket className="mr-2 h-4 w-4" />
              Build Only
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => startDeployment('deploy')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Deploy Only
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => startDeployment('build-and-deploy')}>
              <Terminal className="mr-2 h-4 w-4" />
              Full Build & Deploy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deploymentHistory.length === 0
              ? (
                  <p className="text-muted-foreground text-center py-4">No deployments yet</p>
                )
              : (
                  deploymentHistory.map(deployment => (
                    <div key={deployment.deploymentId} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {deployment.status === 'success'
                          ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )
                          : deployment.status === 'failed'
                            ? (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )
                            : (
                                <Terminal className="h-4 w-4 text-blue-500 animate-pulse" />
                              )}
                        <div>
                          <p className="font-mono text-sm">{deployment.deploymentId.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {deployment.type}
                            {' '}
                            •
                            {deployment.branch || 'main'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={deployment.status === 'success' ? 'default' : deployment.status === 'failed' ? 'destructive' : 'outline'}>
                          {deployment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {deployment.duration ? `${deployment.duration}s` : 'Running...'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
