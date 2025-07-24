/**
 * Deployment Store - In-memory deployment tracking
 * Following CLAUDE.md: 商业价值优先，最小化代码
 */

type DeploymentRecord = {
  id: string;
  status: 'building' | 'deploying' | 'success' | 'failed';
  logs: string[];
  startTime: string;
  endTime?: string;
  type: string;
  branch?: string;
};

// Store active deployments in memory (in production, use Redis or database)
const activeDeployments = new Map<string, DeploymentRecord>();

export function addDeployment(deployment: DeploymentRecord) {
  activeDeployments.set(deployment.id, deployment);
}

export function updateDeployment(id: string, updates: Partial<DeploymentRecord>) {
  const deployment = activeDeployments.get(id);
  if (deployment) {
    activeDeployments.set(id, { ...deployment, ...updates });
  }
}

export function getDeployment(id: string): DeploymentRecord | undefined {
  return activeDeployments.get(id);
}

export function getAllDeployments(): DeploymentRecord[] {
  return Array.from(activeDeployments.values()).sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  ).slice(0, 10); // Return last 10 deployments
}
