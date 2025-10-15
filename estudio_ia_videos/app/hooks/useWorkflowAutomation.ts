'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'webhook' | 'manual' | 'condition';
  name: string;
  description?: string;
  config: {
    // Event triggers
    eventType?: 'element_added' | 'element_updated' | 'element_deleted' | 'project_saved' | 'user_action';
    elementType?: string;
    
    // Schedule triggers
    schedule?: {
      type: 'interval' | 'cron' | 'once';
      interval?: number; // milliseconds
      cronExpression?: string;
      executeAt?: Date;
    };
    
    // Webhook triggers
    webhook?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      authentication?: {
        type: 'none' | 'basic' | 'bearer' | 'api_key';
        credentials?: Record<string, string>;
      };
    };
    
    // Condition triggers
    condition?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
      value: any;
      logicalOperator?: 'and' | 'or';
      conditions?: WorkflowCondition[];
    };
  };
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
}

export interface WorkflowAction {
  id: string;
  type: 'api_call' | 'email' | 'notification' | 'data_transform' | 'file_operation' | 'ai_process' | 'custom_script';
  name: string;
  description?: string;
  config: {
    // API Call actions
    apiCall?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      headers?: Record<string, string>;
      body?: any;
      authentication?: {
        type: 'none' | 'basic' | 'bearer' | 'api_key';
        credentials?: Record<string, string>;
      };
      retryPolicy?: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier: number;
      };
    };
    
    // Email actions
    email?: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      isHtml: boolean;
      attachments?: {
        name: string;
        content: string;
        contentType: string;
      }[];
    };
    
    // Notification actions
    notification?: {
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
      recipients: string[];
      channels: ('in_app' | 'email' | 'sms' | 'push')[];
    };
    
    // Data Transform actions
    dataTransform?: {
      inputData: string; // JSON path or variable name
      transformScript: string; // JavaScript code
      outputVariable: string;
    };
    
    // File Operation actions
    fileOperation?: {
      operation: 'create' | 'read' | 'update' | 'delete' | 'copy' | 'move';
      sourcePath?: string;
      targetPath?: string;
      content?: string;
      encoding?: string;
    };
    
    // AI Process actions
    aiProcess?: {
      type: 'text_generation' | 'image_generation' | 'content_analysis' | 'translation' | 'summarization';
      model: string;
      prompt?: string;
      parameters?: Record<string, any>;
      outputVariable: string;
    };
    
    // Custom Script actions
    customScript?: {
      language: 'javascript' | 'python' | 'bash';
      code: string;
      timeout: number;
      environment?: Record<string, string>;
    };
  };
  order: number;
  isActive: boolean;
  continueOnError: boolean;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  description?: string;
  isGlobal: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  variables: WorkflowVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  category: string;
  version: string;
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTime: number;
  successRate: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggerData: any;
  variables: Record<string, any>;
  actionResults: WorkflowActionResult[];
  error?: string;
  logs: WorkflowLog[];
}

export interface WorkflowActionResult {
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input: any;
  output?: any;
  error?: string;
  retryCount: number;
}

export interface WorkflowLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  actionId?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount' | 'lastExecuted' | 'averageExecutionTime' | 'successRate'>;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  author: string;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  mostUsedWorkflows: { workflowId: string; name: string; count: number }[];
  recentExecutions: WorkflowExecution[];
  errorRate: number;
  performanceMetrics: {
    executionsPerDay: { date: string; count: number }[];
    executionTimeDistribution: { range: string; count: number }[];
    errorsByType: { type: string; count: number }[];
  };
}

export const useWorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  
  const executionEngineRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const webhookListenersRef = useRef<Map<string, any>>(new Map());

  // Load workflows and templates
  const loadWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [workflowsResponse, templatesResponse] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/workflows/templates')
      ]);

      if (!workflowsResponse.ok || !templatesResponse.ok) {
        throw new Error('Failed to load workflows');
      }

      const workflowsData = await workflowsResponse.json();
      const templatesData = await templatesResponse.json();

      setWorkflows(workflowsData);
      setTemplates(templatesData);

      // Initialize active workflows
      workflowsData.filter((w: Workflow) => w.isActive).forEach((workflow: Workflow) => {
        initializeWorkflow(workflow);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize workflow triggers
  const initializeWorkflow = useCallback((workflow: Workflow) => {
    workflow.triggers.forEach(trigger => {
      if (!trigger.isActive) return;

      switch (trigger.type) {
        case 'schedule':
          initializeScheduleTrigger(workflow.id, trigger);
          break;
        case 'webhook':
          initializeWebhookTrigger(workflow.id, trigger);
          break;
        case 'event':
          initializeEventTrigger(workflow.id, trigger);
          break;
      }
    });
  }, []);

  // Initialize schedule trigger
  const initializeScheduleTrigger = useCallback((workflowId: string, trigger: WorkflowTrigger) => {
    const schedule = trigger.config.schedule;
    if (!schedule) return;

    let timeout: NodeJS.Timeout;

    switch (schedule.type) {
      case 'interval':
        if (schedule.interval) {
          timeout = setInterval(() => {
            executeWorkflow(workflowId, trigger.id, {});
          }, schedule.interval);
        }
        break;
      
      case 'once':
        if (schedule.executeAt) {
          const delay = schedule.executeAt.getTime() - Date.now();
          if (delay > 0) {
            timeout = setTimeout(() => {
              executeWorkflow(workflowId, trigger.id, {});
            }, delay);
          }
        }
        break;
      
      case 'cron':
        // For cron expressions, you would typically use a library like node-cron
        // This is a simplified implementation
        if (schedule.cronExpression) {
          // Parse cron and set up recurring execution
          console.log('Cron trigger setup:', schedule.cronExpression);
        }
        break;
    }

    if (timeout!) {
      executionEngineRef.current.set(`${workflowId}_${trigger.id}`, timeout);
    }
  }, []);

  // Initialize webhook trigger
  const initializeWebhookTrigger = useCallback((workflowId: string, trigger: WorkflowTrigger) => {
    const webhook = trigger.config.webhook;
    if (!webhook) return;

    // Register webhook endpoint
    const webhookId = `${workflowId}_${trigger.id}`;
    webhookListenersRef.current.set(webhookId, {
      workflowId,
      triggerId: trigger.id,
      config: webhook
    });
  }, []);

  // Initialize event trigger
  const initializeEventTrigger = useCallback((workflowId: string, trigger: WorkflowTrigger) => {
    const eventType = trigger.config.eventType;
    if (!eventType) return;

    // Listen for custom events
    const handleEvent = (event: CustomEvent) => {
      const shouldTrigger = evaluateConditions(trigger.config.condition, event.detail);
      if (shouldTrigger) {
        executeWorkflow(workflowId, trigger.id, event.detail);
      }
    };

    window.addEventListener(`workflow:${eventType}`, handleEvent as EventListener);
  }, []);

  // Evaluate workflow conditions
  const evaluateConditions = useCallback((condition: any, data: any): boolean => {
    if (!condition) return true;

    const { field, operator, value, logicalOperator, conditions } = condition;

    const evaluateCondition = (cond: WorkflowCondition, data: any): boolean => {
      const fieldValue = getNestedValue(data, cond.field);
      
      switch (cond.operator) {
        case 'equals':
          return fieldValue === cond.value;
        case 'not_equals':
          return fieldValue !== cond.value;
        case 'greater_than':
          return fieldValue > cond.value;
        case 'less_than':
          return fieldValue < cond.value;
        case 'contains':
          return String(fieldValue).includes(String(cond.value));
        case 'starts_with':
          return String(fieldValue).startsWith(String(cond.value));
        case 'ends_with':
          return String(fieldValue).endsWith(String(cond.value));
        default:
          return false;
      }
    };

    // Evaluate main condition
    let result = evaluateCondition({ field, operator, value }, data);

    // Evaluate additional conditions
    if (conditions && conditions.length > 0) {
      for (const cond of conditions) {
        const condResult = evaluateCondition(cond, data);
        
        if (logicalOperator === 'and') {
          result = result && condResult;
        } else if (logicalOperator === 'or') {
          result = result || condResult;
        }
      }
    }

    return result;
  }, []);

  // Get nested value from object
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId: string, triggerId: string, triggerData: any) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow || !workflow.isActive) return;

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      triggerId,
      status: 'running',
      startTime: new Date(),
      triggerData,
      variables: {},
      actionResults: [],
      logs: []
    };

    setExecutions(prev => [execution, ...prev]);

    try {
      // Initialize variables
      const variables: Record<string, any> = {};
      workflow.variables.forEach(variable => {
        variables[variable.name] = variable.value;
      });
      variables['trigger_data'] = triggerData;

      execution.variables = variables;

      // Execute actions in order
      const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);
      
      for (const action of sortedActions) {
        if (!action.isActive) {
          execution.actionResults.push({
            actionId: action.id,
            status: 'skipped',
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            input: null,
            retryCount: 0
          });
          continue;
        }

        const actionResult = await executeAction(action, variables, execution);
        execution.actionResults.push(actionResult);

        if (actionResult.status === 'failed' && !action.continueOnError) {
          execution.status = 'failed';
          execution.error = actionResult.error;
          break;
        }

        // Update variables with action output
        if (actionResult.output && action.config.dataTransform?.outputVariable) {
          variables[action.config.dataTransform.outputVariable] = actionResult.output;
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
      }

    } catch (err) {
      execution.status = 'failed';
      execution.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      // Update execution in state
      setExecutions(prev => 
        prev.map(exec => exec.id === execution.id ? execution : exec)
      );

      // Update workflow statistics
      updateWorkflowStats(workflowId, execution);
    }
  }, [workflows]);

  // Execute individual action
  const executeAction = useCallback(async (
    action: WorkflowAction, 
    variables: Record<string, any>,
    execution: WorkflowExecution
  ): Promise<WorkflowActionResult> => {
    const result: WorkflowActionResult = {
      actionId: action.id,
      status: 'running',
      startTime: new Date(),
      input: action.config,
      retryCount: 0
    };

    try {
      let output: any;

      switch (action.type) {
        case 'api_call':
          output = await executeApiCall(action.config.apiCall!, variables);
          break;
        case 'email':
          output = await executeEmail(action.config.email!, variables);
          break;
        case 'notification':
          output = await executeNotification(action.config.notification!, variables);
          break;
        case 'data_transform':
          output = await executeDataTransform(action.config.dataTransform!, variables);
          break;
        case 'file_operation':
          output = await executeFileOperation(action.config.fileOperation!, variables);
          break;
        case 'ai_process':
          output = await executeAiProcess(action.config.aiProcess!, variables);
          break;
        case 'custom_script':
          output = await executeCustomScript(action.config.customScript!, variables);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      result.status = 'completed';
      result.output = output;

    } catch (err) {
      result.status = 'failed';
      result.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
    }

    return result;
  }, []);

  // Execute API call action
  const executeApiCall = useCallback(async (config: any, variables: Record<string, any>) => {
    const { url, method, headers, body, authentication, retryPolicy } = config;
    
    const requestHeaders: Record<string, string> = { ...headers };
    
    // Add authentication
    if (authentication) {
      switch (authentication.type) {
        case 'bearer':
          requestHeaders['Authorization'] = `Bearer ${authentication.credentials?.token}`;
          break;
        case 'basic':
          const credentials = btoa(`${authentication.credentials?.username}:${authentication.credentials?.password}`);
          requestHeaders['Authorization'] = `Basic ${credentials}`;
          break;
        case 'api_key':
          requestHeaders[authentication.credentials?.headerName || 'X-API-Key'] = authentication.credentials?.apiKey;
          break;
      }
    }

    // Replace variables in URL and body
    const processedUrl = replaceVariables(url, variables);
    const processedBody = body ? replaceVariables(JSON.stringify(body), variables) : undefined;

    let attempt = 0;
    const maxRetries = retryPolicy?.maxRetries || 0;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(processedUrl, {
          method,
          headers: requestHeaders,
          body: processedBody
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

      } catch (err) {
        attempt++;
        if (attempt > maxRetries) {
          throw err;
        }
        
        // Wait before retry
        const delay = (retryPolicy?.retryDelay || 1000) * Math.pow(retryPolicy?.backoffMultiplier || 2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, []);

  // Execute email action
  const executeEmail = useCallback(async (config: any, variables: Record<string, any>) => {
    const { to, cc, bcc, subject, body, isHtml, attachments } = config;
    
    const emailData = {
      to: to.map((email: string) => replaceVariables(email, variables)),
      cc: cc?.map((email: string) => replaceVariables(email, variables)),
      bcc: bcc?.map((email: string) => replaceVariables(email, variables)),
      subject: replaceVariables(subject, variables),
      body: replaceVariables(body, variables),
      isHtml,
      attachments
    };

    const response = await fetch('/api/workflows/actions/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  }, []);

  // Execute notification action
  const executeNotification = useCallback(async (config: any, variables: Record<string, any>) => {
    const { type, title, message, recipients, channels } = config;
    
    const notificationData = {
      type,
      title: replaceVariables(title, variables),
      message: replaceVariables(message, variables),
      recipients,
      channels
    };

    // Emit notification event
    window.dispatchEvent(new CustomEvent('workflow:notification', {
      detail: notificationData
    }));

    return notificationData;
  }, []);

  // Execute data transform action
  const executeDataTransform = useCallback(async (config: any, variables: Record<string, any>) => {
    const { inputData, transformScript, outputVariable } = config;
    
    const input = getNestedValue(variables, inputData);
    
    // Create a safe execution context
    const context = {
      input,
      variables,
      console: {
        log: (...args: any[]) => console.log('[Workflow Transform]', ...args)
      }
    };

    // Execute transform script
    const func = new Function('context', `
      with (context) {
        ${transformScript}
      }
    `);

    const result = func(context);
    return result;
  }, []);

  // Execute file operation action
  const executeFileOperation = useCallback(async (config: any, variables: Record<string, any>) => {
    const { operation, sourcePath, targetPath, content, encoding } = config;
    
    const fileData = {
      operation,
      sourcePath: sourcePath ? replaceVariables(sourcePath, variables) : undefined,
      targetPath: targetPath ? replaceVariables(targetPath, variables) : undefined,
      content: content ? replaceVariables(content, variables) : undefined,
      encoding: encoding || 'utf8'
    };

    const response = await fetch('/api/workflows/actions/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileData)
    });

    if (!response.ok) {
      throw new Error('File operation failed');
    }

    return await response.json();
  }, []);

  // Execute AI process action
  const executeAiProcess = useCallback(async (config: any, variables: Record<string, any>) => {
    const { type, model, prompt, parameters, outputVariable } = config;
    
    const aiData = {
      type,
      model,
      prompt: prompt ? replaceVariables(prompt, variables) : undefined,
      parameters
    };

    const response = await fetch('/api/workflows/actions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiData)
    });

    if (!response.ok) {
      throw new Error('AI process failed');
    }

    return await response.json();
  }, []);

  // Execute custom script action
  const executeCustomScript = useCallback(async (config: any, variables: Record<string, any>) => {
    const { language, code, timeout, environment } = config;
    
    const scriptData = {
      language,
      code: replaceVariables(code, variables),
      timeout: timeout || 30000,
      environment: { ...environment, ...variables }
    };

    const response = await fetch('/api/workflows/actions/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scriptData)
    });

    if (!response.ok) {
      throw new Error('Script execution failed');
    }

    return await response.json();
  }, []);

  // Replace variables in text
  const replaceVariables = useCallback((text: string, variables: Record<string, any>): string => {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const value = getNestedValue(variables, variableName.trim());
      return value !== undefined ? String(value) : match;
    });
  }, []);

  // Update workflow statistics
  const updateWorkflowStats = useCallback((workflowId: string, execution: WorkflowExecution) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const newExecutionCount = workflow.executionCount + 1;
        const newAverageTime = (workflow.averageExecutionTime * workflow.executionCount + (execution.duration || 0)) / newExecutionCount;
        const successfulExecutions = execution.status === 'completed' ? 1 : 0;
        const newSuccessRate = ((workflow.successRate * workflow.executionCount) + successfulExecutions) / newExecutionCount;

        return {
          ...workflow,
          executionCount: newExecutionCount,
          lastExecuted: execution.endTime,
          averageExecutionTime: newAverageTime,
          successRate: newSuccessRate
        };
      }
      return workflow;
    }));
  }, []);

  // Workflow management functions
  const createWorkflow = useCallback(async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted' | 'averageExecutionTime' | 'successRate'>) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      const newWorkflow = await response.json();
      setWorkflows(prev => [...prev, newWorkflow]);

      if (newWorkflow.isActive) {
        initializeWorkflow(newWorkflow);
      }

      return newWorkflow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
      return null;
    }
  }, [initializeWorkflow]);

  const updateWorkflow = useCallback(async (workflowId: string, updates: Partial<Workflow>) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      const updatedWorkflow = await response.json();
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));

      // Reinitialize if active status changed
      if (updates.isActive !== undefined) {
        if (updates.isActive) {
          initializeWorkflow(updatedWorkflow);
        } else {
          stopWorkflow(workflowId);
        }
      }

      return updatedWorkflow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
      return null;
    }
  }, [initializeWorkflow]);

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      stopWorkflow(workflowId);
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      setExecutions(prev => prev.filter(e => e.workflowId !== workflowId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
      return false;
    }
  }, []);

  const stopWorkflow = useCallback((workflowId: string) => {
    // Stop all timers for this workflow
    for (const [key, timeout] of executionEngineRef.current.entries()) {
      if (key.startsWith(workflowId)) {
        clearTimeout(timeout);
        clearInterval(timeout);
        executionEngineRef.current.delete(key);
      }
    }

    // Remove webhook listeners
    for (const [key, listener] of webhookListenersRef.current.entries()) {
      if (key.startsWith(workflowId)) {
        webhookListenersRef.current.delete(key);
      }
    }
  }, []);

  const triggerWorkflow = useCallback(async (workflowId: string, triggerData: any = {}) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const manualTrigger = workflow.triggers.find(t => t.type === 'manual');
    if (!manualTrigger) {
      throw new Error('Workflow does not have a manual trigger');
    }

    await executeWorkflow(workflowId, manualTrigger.id, triggerData);
  }, [workflows, executeWorkflow]);

  // Calculate statistics
  const calculateStats = useCallback((): WorkflowStats => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.isActive).length;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;
    
    const averageExecutionTime = executions.length > 0
      ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
      : 0;

    const errorRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

    const mostUsedWorkflows = workflows
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, 5)
      .map(w => ({ workflowId: w.id, name: w.name, count: w.executionCount }));

    const recentExecutions = executions
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 10);

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      mostUsedWorkflows,
      recentExecutions,
      errorRate,
      performanceMetrics: {
        executionsPerDay: [],
        executionTimeDistribution: [],
        errorsByType: []
      }
    };
  }, [workflows, executions]);

  // Update stats when data changes
  useEffect(() => {
    setStats(calculateStats());
  }, [workflows, executions, calculateStats]);

  // Load data on mount
  useEffect(() => {
    loadWorkflows();

    return () => {
      // Cleanup on unmount
      for (const timeout of executionEngineRef.current.values()) {
        clearTimeout(timeout);
        clearInterval(timeout);
      }
      executionEngineRef.current.clear();
      webhookListenersRef.current.clear();
    };
  }, [loadWorkflows]);

  return {
    // State
    workflows,
    executions,
    templates,
    isLoading,
    error,
    stats,

    // Workflow management
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    triggerWorkflow,
    stopWorkflow,

    // Execution management
    executeWorkflow,

    // Utilities
    loadWorkflows,
    calculateStats
  };
};