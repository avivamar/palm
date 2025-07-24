/**
 * Script Execution API
 * Following CLAUDE.md: 商业价值优先，最小化代码
 */

export type ScriptExecutionRequest = {
  scriptName: string;
  category: 'validation' | 'deployment' | 'maintenance' | 'testing';
};

export type ScriptExecutionResponse = {
  success: boolean;
  output: string;
  executionTime: number;
  timestamp: string;
  error?: string;
};

export async function executeScript(request: ScriptExecutionRequest): Promise<ScriptExecutionResponse> {
  const response = await fetch('/api/admin/scripts/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to execute script: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function executeMultipleScripts(scripts: ScriptExecutionRequest[]): Promise<ScriptExecutionResponse[]> {
  const response = await fetch('/api/admin/scripts/execute-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scripts }),
  });

  if (!response.ok) {
    throw new Error(`Failed to execute scripts: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
