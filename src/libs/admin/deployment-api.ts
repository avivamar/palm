/**
 * Deployment API
 * Following CLAUDE.md: 商业价值优先，最小化代码
 */

export type DeploymentRequest = {
  type: 'build' | 'deploy' | 'build-and-deploy';
  branch?: string;
  environment?: 'production' | 'staging';
};

export type DeploymentResponse = {
  success: boolean;
  deploymentId: string;
  status: 'building' | 'deploying' | 'success' | 'failed';
  logs: string[];
  timestamp: string;
  error?: string;
};

export type DeploymentStatusResponse = {
  deploymentId: string;
  status: 'building' | 'deploying' | 'success' | 'failed';
  logs: string[];
  startTime: string;
  endTime?: string;
  duration?: number;
};

export async function startDeployment(request: DeploymentRequest): Promise<DeploymentResponse> {
  const response = await fetch('/api/admin/deployment/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to start deployment: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getDeploymentStatus(deploymentId: string): Promise<DeploymentStatusResponse> {
  const response = await fetch(`/api/admin/deployment/status?id=${deploymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get deployment status: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getRecentDeployments(): Promise<DeploymentStatusResponse[]> {
  const response = await fetch('/api/admin/deployment/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get deployment history: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
