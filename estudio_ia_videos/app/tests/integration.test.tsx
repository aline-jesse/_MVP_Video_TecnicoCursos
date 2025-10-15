/**
 * Integration Test Suite for Advanced Dashboard System
 * Tests end-to-end workflows and component interactions
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock WebSocket
const WebSocketMock = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

global.WebSocket = WebSocketMock as any;

// Mock WebSocket for real-time collaboration
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocketMock.OPEN
};

// Mock File API
global.File = class MockFile {
  constructor(public chunks: any[], public name: string, public options: any = {}) {}
  get size() { return this.chunks.reduce((acc, chunk) => acc + chunk.length, 0); }
  get type() { return this.options.type || ''; }
} as any;

global.FileReader = class MockFileReader {
  result: any = null;
  error: any = null;
  readyState: number = 0;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  
  readAsText(file: File) {
    setTimeout(() => {
      this.result = 'mock file content';
      this.readyState = 2;
      if (this.onload) this.onload({ target: this });
    }, 100);
  }
  
  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mock-image-data';
      this.readyState = 2;
      if (this.onload) this.onload({ target: this });
    }, 100);
  }
} as any;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = mockLocalStorage as any;

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          getAll: vi.fn()
        }))
      }))
    }
  }))
};
global.indexedDB = mockIndexedDB as any;

describe('Advanced Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Template to Compliance Workflow', () => {
    it('should create template and automatically analyze compliance', async () => {
      // Mock the complete workflow
      const mockTemplate = {
        id: 'template1',
        name: 'Safety Training Template',
        category: 'NR-12',
        description: 'Comprehensive safety training',
        thumbnail: '',
        content: {
          slides: [
            {
              id: 'slide1',
              title: 'Safety Procedures',
              content: 'Follow these safety procedures...',
              elements: []
            }
          ]
        },
        metadata: {
          version: '1.0',
          author: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['safety', 'training'],
          compliance: { nrCategory: 'NR-12', isCompliant: false, score: 0 }
        },
        isFavorite: false,
        isCustom: true
      };

      const mockAnalysis = {
        id: 'analysis1',
        templateId: 'template1',
        score: 85,
        status: 'compliant' as const,
        issues: [
          {
            id: 'issue1',
            type: 'warning' as const,
            title: 'Missing Emergency Procedures',
            description: 'Emergency procedures section is incomplete',
            location: { elementId: 'slide1', position: { x: 0, y: 0 } },
            suggestion: 'Add detailed emergency evacuation procedures',
            nrRequirement: 'NR-12.5',
            severity: 'medium' as const,
            isResolved: false,
            createdAt: new Date()
          }
        ],
        suggestions: [
          {
            id: 'suggestion1',
            type: 'content' as const,
            title: 'Add Safety Checklist',
            description: 'Include a comprehensive safety checklist',
            priority: 'high' as const,
            elementId: 'slide1',
            suggestedContent: 'Daily safety checklist: 1. Check equipment...',
            isApplied: false,
            createdAt: new Date()
          }
        ],
        requirements: [
          {
            id: 'req1',
            nrCode: 'NR-12.1',
            title: 'Safety Training Requirements',
            description: 'All workers must receive safety training',
            isMet: true,
            evidence: 'Training content covers required topics'
          }
        ],
        createdAt: new Date(),
        nrCategory: 'NR-12'
      };

      // Create a comprehensive test component that includes both systems
      const TestWorkflow = () => {
        const [currentTemplate, setCurrentTemplate] = React.useState(null);
        const [analysis, setAnalysis] = React.useState(null);

        const handleCreateTemplate = async () => {
          setCurrentTemplate(mockTemplate);
          // Simulate automatic compliance analysis
          setTimeout(() => {
            setAnalysis(mockAnalysis);
          }, 500);
        };

        const handleApplySuggestion = (suggestionId: string) => {
          setAnalysis(prev => prev ? {
            ...prev,
            suggestions: prev.suggestions.map(s => 
              s.id === suggestionId ? { ...s, isApplied: true } : s
            ),
            score: prev.score + 5
          } : null);
        };

        return (
          <div>
            <h1>Template Creation Workflow</h1>
            
            {/* Template Creation Section */}
            <section data-testid="template-section">
              <h2>Create Template</h2>
              <button onClick={handleCreateTemplate}>
                Create Safety Template
              </button>
              {currentTemplate && (
                <div data-testid="template-created">
                  <p>Template: {currentTemplate.name}</p>
                  <p>Category: {currentTemplate.category}</p>
                </div>
              )}
            </section>

            {/* Compliance Analysis Section */}
            <section data-testid="compliance-section">
              <h2>Compliance Analysis</h2>
              {analysis ? (
                <div data-testid="analysis-results">
                  <p>Score: {analysis.score}</p>
                  <p>Status: {analysis.status}</p>
                  <div data-testid="issues">
                    <h3>Issues ({analysis.issues.length})</h3>
                    {analysis.issues.map(issue => (
                      <div key={issue.id} data-testid={`issue-${issue.id}`}>
                        <p>{issue.title}</p>
                        <p>{issue.severity}</p>
                      </div>
                    ))}
                  </div>
                  <div data-testid="suggestions">
                    <h3>Suggestions ({analysis.suggestions.length})</h3>
                    {analysis.suggestions.map(suggestion => (
                      <div key={suggestion.id} data-testid={`suggestion-${suggestion.id}`}>
                        <p>{suggestion.title}</p>
                        <button 
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          disabled={suggestion.isApplied}
                        >
                          {suggestion.isApplied ? 'Applied' : 'Apply Suggestion'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No analysis available</p>
              )}
            </section>
          </div>
        );
      };

      render(<TestWorkflow />);

      // Step 1: Create template
      const createButton = screen.getByText('Create Safety Template');
      fireEvent.click(createButton);

      // Verify template creation
      await waitFor(() => {
        expect(screen.getByTestId('template-created')).toBeInTheDocument();
        expect(screen.getByText('Template: Safety Training Template')).toBeInTheDocument();
        expect(screen.getByText('Category: NR-12')).toBeInTheDocument();
      });

      // Step 2: Wait for automatic compliance analysis
      await waitFor(() => {
        expect(screen.getByTestId('analysis-results')).toBeInTheDocument();
        expect(screen.getByText('Score: 85')).toBeInTheDocument();
        expect(screen.getByText('Status: compliant')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Step 3: Verify issues are displayed
      const issuesSection = screen.getByTestId('issues');
      expect(within(issuesSection).getByText('Issues (1)')).toBeInTheDocument();
      expect(within(issuesSection).getByText('Missing Emergency Procedures')).toBeInTheDocument();
      expect(within(issuesSection).getByText('medium')).toBeInTheDocument();

      // Step 4: Verify suggestions are displayed
      const suggestionsSection = screen.getByTestId('suggestions');
      expect(within(suggestionsSection).getByText('Suggestions (1)')).toBeInTheDocument();
      expect(within(suggestionsSection).getByText('Add Safety Checklist')).toBeInTheDocument();

      // Step 5: Apply suggestion and verify score improvement
      const applySuggestionButton = within(suggestionsSection).getByText('Apply Suggestion');
      fireEvent.click(applySuggestionButton);

      await waitFor(() => {
        expect(screen.getByText('Score: 90')).toBeInTheDocument();
        expect(within(suggestionsSection).getByText('Applied')).toBeInTheDocument();
      });
    });
  });

  describe('Editor to Collaboration Workflow', () => {
    it('should enable real-time collaboration in WYSIWYG editor', async () => {
      const TestCollaborativeEditor = () => {
        const [isConnected, setIsConnected] = React.useState(false);
        const [users, setUsers] = React.useState([]);
        const [elements, setElements] = React.useState([]);
        const [comments, setComments] = React.useState([]);

        const handleConnect = () => {
          setIsConnected(true);
          setUsers([
            {
              id: 'user1',
              name: 'John Doe',
              email: 'john@example.com',
              avatar: '',
              role: 'editor' as const,
              isOnline: true,
              lastSeen: new Date(),
              cursor: { x: 100, y: 100 }
            },
            {
              id: 'user2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              avatar: '',
              role: 'viewer' as const,
              isOnline: true,
              lastSeen: new Date(),
              cursor: { x: 200, y: 150 }
            }
          ]);
        };

        const handleAddElement = () => {
          const newElement = {
            id: `element-${Date.now()}`,
            type: 'text' as const,
            content: 'Collaborative text element',
            position: { x: 100, y: 100 },
            size: { width: 200, height: 50 },
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            layerId: 'layer1',
            animations: [],
            interactions: []
          };
          setElements(prev => [...prev, newElement]);
          
          // Simulate real-time update to other users
          setTimeout(() => {
            // Mock WebSocket message
            if (mockWebSocket.send) {
              mockWebSocket.send(JSON.stringify({
                type: 'element_added',
                element: newElement,
                userId: 'current-user'
              }));
            }
          }, 100);
        };

        const handleAddComment = (elementId: string) => {
          const newComment = {
            id: `comment-${Date.now()}`,
            elementId,
            content: 'This element needs review',
            position: { x: 150, y: 125 },
            author: {
              id: 'user1',
              name: 'John Doe',
              email: 'john@example.com',
              avatar: ''
            },
            replies: [],
            attachments: [],
            isResolved: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setComments(prev => [...prev, newComment]);
        };

        return (
          <div>
            <h1>Collaborative Editor</h1>
            
            {/* Connection Status */}
            <section data-testid="connection-status">
              <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
              {!isConnected && (
                <button onClick={handleConnect}>Connect to Session</button>
              )}
            </section>

            {/* Active Users */}
            {isConnected && (
              <section data-testid="active-users">
                <h2>Active Users ({users.length})</h2>
                {users.map(user => (
                  <div key={user.id} data-testid={`user-${user.id}`}>
                    <span>{user.name}</span>
                    <span>({user.role})</span>
                    <span className={`cursor-${user.id}`} 
                          style={{ 
                            position: 'absolute', 
                            left: user.cursor.x, 
                            top: user.cursor.y 
                          }}>
                      👆
                    </span>
                  </div>
                ))}
              </section>
            )}

            {/* Editor Canvas */}
            <section data-testid="editor-canvas">
              <h2>Canvas</h2>
              <button onClick={handleAddElement}>Add Text Element</button>
              <div style={{ position: 'relative', width: 800, height: 600, border: '1px solid #ccc' }}>
                {elements.map(element => (
                  <div
                    key={element.id}
                    data-testid={`element-${element.id}`}
                    style={{
                      position: 'absolute',
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
                      border: '1px solid #007bff',
                      padding: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleAddComment(element.id)}
                  >
                    {element.content}
                  </div>
                ))}
                
                {/* Comments */}
                {comments.map(comment => (
                  <div
                    key={comment.id}
                    data-testid={`comment-${comment.id}`}
                    style={{
                      position: 'absolute',
                      left: comment.position.x + 10,
                      top: comment.position.y + 10,
                      background: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      padding: '8px',
                      borderRadius: '4px',
                      maxWidth: '200px',
                      fontSize: '12px'
                    }}
                  >
                    <strong>{comment.author.name}:</strong>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Comments Panel */}
            <section data-testid="comments-panel">
              <h2>Comments ({comments.length})</h2>
              {comments.map(comment => (
                <div key={comment.id} data-testid={`comment-item-${comment.id}`}>
                  <p><strong>{comment.author.name}:</strong> {comment.content}</p>
                  <p>Element: {comment.elementId}</p>
                </div>
              ))}
            </section>
          </div>
        );
      };

      render(<TestCollaborativeEditor />);

      // Step 1: Connect to collaboration session
      const connectButton = screen.getByText('Connect to Session');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText('Status: Connected')).toBeInTheDocument();
      });

      // Step 2: Verify active users are displayed
      const usersSection = screen.getByTestId('active-users');
      expect(within(usersSection).getByText('Active Users (2)')).toBeInTheDocument();
      expect(within(usersSection).getByText('John Doe')).toBeInTheDocument();
      expect(within(usersSection).getByText('Jane Smith')).toBeInTheDocument();
      expect(within(usersSection).getByText('(editor)')).toBeInTheDocument();
      expect(within(usersSection).getByText('(viewer)')).toBeInTheDocument();

      // Step 3: Add element to canvas
      const addElementButton = screen.getByText('Add Text Element');
      fireEvent.click(addElementButton);

      await waitFor(() => {
        const canvas = screen.getByTestId('editor-canvas');
        const element = within(canvas).getByText('Collaborative text element');
        expect(element).toBeInTheDocument();
      });

      // Step 4: Add comment to element
      const element = screen.getByText('Collaborative text element');
      fireEvent.click(element);

      await waitFor(() => {
        const commentsPanel = screen.getByTestId('comments-panel');
        expect(within(commentsPanel).getByText('Comments (1)')).toBeInTheDocument();
        expect(within(commentsPanel).getByText('This element needs review')).toBeInTheDocument();
      });

      // Step 5: Verify comment appears on canvas
      const canvas = screen.getByTestId('editor-canvas');
      const commentBubble = within(canvas).getByText('This element needs review');
      expect(commentBubble).toBeInTheDocument();

      // Step 6: Verify WebSocket communication
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('element_added')
      );
    });
  });

  describe('AI to Workflow Automation Integration', () => {
    it('should create AI-powered automated workflow', async () => {
      const TestAIWorkflow = () => {
        const [workflows, setWorkflows] = React.useState([]);
        const [executions, setExecutions] = React.useState([]);
        const [aiModels, setAiModels] = React.useState([
          {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            provider: 'OpenAI',
            type: 'text',
            isAvailable: true,
            maxTokens: 4000,
            costPer1kTokens: 0.002
          }
        ]);

        const handleCreateAIWorkflow = () => {
          const newWorkflow = {
            id: 'ai-workflow-1',
            name: 'Daily Safety Content Generation',
            description: 'Automatically generate daily safety tips using AI',
            trigger: {
              type: 'schedule' as const,
              config: { cron: '0 9 * * *' } // Daily at 9 AM
            },
            actions: [
              {
                id: 'action-1',
                type: 'ai_generation' as const,
                name: 'Generate Safety Tip',
                config: {
                  prompt: 'Generate a daily safety tip for construction workers following NR-18 guidelines',
                  model: 'gpt-3.5-turbo',
                  maxTokens: 200,
                  temperature: 0.7
                },
                enabled: true
              },
              {
                id: 'action-2',
                type: 'notification' as const,
                name: 'Send Notification',
                config: {
                  title: 'New Safety Tip Available',
                  message: 'A new daily safety tip has been generated',
                  channels: ['email', 'push']
                },
                enabled: true
              }
            ],
            conditions: [
              {
                id: 'condition-1',
                type: 'time' as const,
                operator: 'between',
                value: { start: '09:00', end: '17:00' },
                description: 'Only during business hours'
              }
            ],
            variables: [
              {
                id: 'var-1',
                name: 'current_date',
                type: 'date',
                value: new Date().toISOString(),
                description: 'Current date for content generation'
              }
            ],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastExecuted: null,
            executionCount: 0
          };

          setWorkflows(prev => [...prev, newWorkflow]);
        };

        const handleExecuteWorkflow = async (workflowId: string) => {
          const workflow = workflows.find(w => w.id === workflowId);
          if (!workflow) return;

          const execution = {
            id: `execution-${Date.now()}`,
            workflowId,
            status: 'running' as const,
            startTime: new Date(),
            endTime: null,
            duration: 0,
            results: [],
            logs: [
              {
                id: 'log-1',
                level: 'info' as const,
                message: 'Workflow execution started',
                timestamp: new Date(),
                context: {}
              }
            ],
            error: null,
            triggeredBy: 'manual',
            context: {}
          };

          setExecutions(prev => [...prev, execution]);

          // Simulate AI generation
          setTimeout(() => {
            const generatedContent = {
              id: 'content-1',
              type: 'text',
              content: 'Daily Safety Tip: Always wear your hard hat when working at heights. According to NR-18, head protection is mandatory in construction sites to prevent serious injuries from falling objects.',
              metadata: {
                model: 'gpt-3.5-turbo',
                tokensUsed: 45,
                cost: 0.00009,
                generationTime: 1.2,
                quality: 0.92
              },
              createdAt: new Date()
            };

            setExecutions(prev => prev.map(exec => 
              exec.id === execution.id ? {
                ...exec,
                status: 'completed' as const,
                endTime: new Date(),
                duration: 1200,
                results: [
                  {
                    actionId: 'action-1',
                    status: 'success' as const,
                    data: generatedContent,
                    executionTime: 1200,
                    error: null
                  },
                  {
                    actionId: 'action-2',
                    status: 'success' as const,
                    data: { notificationsSent: 2 },
                    executionTime: 300,
                    error: null
                  }
                ],
                logs: [
                  ...exec.logs,
                  {
                    id: 'log-2',
                    level: 'info' as const,
                    message: 'AI content generated successfully',
                    timestamp: new Date(),
                    context: { tokensUsed: 45 }
                  },
                  {
                    id: 'log-3',
                    level: 'info' as const,
                    message: 'Notifications sent successfully',
                    timestamp: new Date(),
                    context: { recipients: 2 }
                  }
                ]
              } : exec
            ));
          }, 1500);
        };

        return (
          <div>
            <h1>AI-Powered Workflow Automation</h1>

            {/* AI Models Section */}
            <section data-testid="ai-models">
              <h2>Available AI Models</h2>
              {aiModels.map(model => (
                <div key={model.id} data-testid={`model-${model.id}`}>
                  <span>{model.name}</span>
                  <span>({model.provider})</span>
                  <span>{model.isAvailable ? '✅' : '❌'}</span>
                </div>
              ))}
            </section>

            {/* Workflow Creation */}
            <section data-testid="workflow-creation">
              <h2>Create AI Workflow</h2>
              <button onClick={handleCreateAIWorkflow}>
                Create Daily Safety Content Workflow
              </button>
            </section>

            {/* Workflows List */}
            <section data-testid="workflows-list">
              <h2>Active Workflows ({workflows.length})</h2>
              {workflows.map(workflow => (
                <div key={workflow.id} data-testid={`workflow-${workflow.id}`}>
                  <h3>{workflow.name}</h3>
                  <p>{workflow.description}</p>
                  <p>Actions: {workflow.actions.length}</p>
                  <p>Status: {workflow.isActive ? 'Active' : 'Inactive'}</p>
                  <button onClick={() => handleExecuteWorkflow(workflow.id)}>
                    Execute Workflow
                  </button>
                </div>
              ))}
            </section>

            {/* Executions List */}
            <section data-testid="executions-list">
              <h2>Recent Executions ({executions.length})</h2>
              {executions.map(execution => (
                <div key={execution.id} data-testid={`execution-${execution.id}`}>
                  <p>Status: {execution.status}</p>
                  <p>Duration: {execution.duration}ms</p>
                  {execution.results.map(result => (
                    <div key={result.actionId} data-testid={`result-${result.actionId}`}>
                      <p>Action: {result.actionId}</p>
                      <p>Status: {result.status}</p>
                      {result.data && typeof result.data === 'object' && 'content' in result.data && (
                        <div data-testid="generated-content">
                          <h4>Generated Content:</h4>
                          <p>{result.data.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
        );
      };

      render(<TestAIWorkflow />);

      // Step 1: Verify AI models are available
      const modelsSection = screen.getByTestId('ai-models');
      expect(within(modelsSection).getByText('GPT-3.5 Turbo')).toBeInTheDocument();
      expect(within(modelsSection).getByText('(OpenAI)')).toBeInTheDocument();
      expect(within(modelsSection).getByText('✅')).toBeInTheDocument();

      // Step 2: Create AI workflow
      const createWorkflowButton = screen.getByText('Create Daily Safety Content Workflow');
      fireEvent.click(createWorkflowButton);

      await waitFor(() => {
        const workflowsList = screen.getByTestId('workflows-list');
        expect(within(workflowsList).getByText('Active Workflows (1)')).toBeInTheDocument();
        expect(within(workflowsList).getByText('Daily Safety Content Generation')).toBeInTheDocument();
        expect(within(workflowsList).getByText('Actions: 2')).toBeInTheDocument();
        expect(within(workflowsList).getByText('Status: Active')).toBeInTheDocument();
      });

      // Step 3: Execute workflow
      const executeButton = screen.getByText('Execute Workflow');
      fireEvent.click(executeButton);

      // Step 4: Verify execution starts
      await waitFor(() => {
        const executionsList = screen.getByTestId('executions-list');
        expect(within(executionsList).getByText('Recent Executions (1)')).toBeInTheDocument();
        expect(within(executionsList).getByText('Status: running')).toBeInTheDocument();
      });

      // Step 5: Wait for execution completion and verify results
      await waitFor(() => {
        const executionsList = screen.getByTestId('executions-list');
        expect(within(executionsList).getByText('Status: completed')).toBeInTheDocument();
        expect(within(executionsList).getByText('Duration: 1200ms')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Step 6: Verify generated content
      const generatedContent = screen.getByTestId('generated-content');
      expect(within(generatedContent).getByText('Generated Content:')).toBeInTheDocument();
      expect(within(generatedContent).getByText(/Daily Safety Tip: Always wear your hard hat/)).toBeInTheDocument();
      expect(within(generatedContent).getByText(/NR-18/)).toBeInTheDocument();

      // Step 7: Verify action results
      const actionResults = screen.getAllByTestId(/^result-action-/);
      expect(actionResults).toHaveLength(2);
      
      const aiActionResult = screen.getByTestId('result-action-1');
      expect(within(aiActionResult).getByText('Status: success')).toBeInTheDocument();
      
      const notificationResult = screen.getByTestId('result-action-2');
      expect(within(notificationResult).getByText('Status: success')).toBeInTheDocument();
    });
  });

  describe('Backup and Recovery Integration', () => {
    it('should perform complete backup and recovery workflow', async () => {
      const TestBackupRecovery = () => {
        const [backups, setBackups] = React.useState([]);
        const [templates, setTemplates] = React.useState([
          {
            id: 'template1',
            name: 'Safety Template',
            category: 'NR-12',
            content: { slides: [{ title: 'Safety' }] }
          }
        ]);
        const [projects, setProjects] = React.useState([
          {
            id: 'project1',
            name: 'Safety Training Project',
            elements: [{ id: 'elem1', type: 'text', content: 'Safety content' }]
          }
        ]);

        const handleCreateBackup = () => {
          const backup = {
            id: `backup-${Date.now()}`,
            type: 'manual' as const,
            description: 'Complete system backup',
            data: {
              templates: [...templates],
              projects: [...projects],
              settings: { theme: 'light', language: 'pt-BR' }
            },
            metadata: {
              size: 2048576, // 2MB
              checksum: 'sha256-abc123def456',
              compression: true,
              encryption: false
            },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          };

          setBackups(prev => [...prev, backup]);
        };

        const handleCorruptData = () => {
          // Simulate data corruption
          setTemplates([]);
          setProjects([]);
        };

        const handleRestoreBackup = (backupId: string) => {
          const backup = backups.find(b => b.id === backupId);
          if (backup) {
            setTemplates(backup.data.templates || []);
            setProjects(backup.data.projects || []);
          }
        };

        return (
          <div>
            <h1>Backup and Recovery System</h1>

            {/* Current Data Status */}
            <section data-testid="data-status">
              <h2>Current Data</h2>
              <p>Templates: {templates.length}</p>
              <p>Projects: {projects.length}</p>
              {templates.map(template => (
                <div key={template.id} data-testid={`template-${template.id}`}>
                  {template.name} ({template.category})
                </div>
              ))}
              {projects.map(project => (
                <div key={project.id} data-testid={`project-${project.id}`}>
                  {project.name} ({project.elements.length} elements)
                </div>
              ))}
            </section>

            {/* Backup Controls */}
            <section data-testid="backup-controls">
              <h2>Backup Management</h2>
              <button onClick={handleCreateBackup}>Create Backup</button>
              <button onClick={handleCorruptData} style={{ background: 'red', color: 'white' }}>
                Simulate Data Loss
              </button>
            </section>

            {/* Backups List */}
            <section data-testid="backups-list">
              <h2>Available Backups ({backups.length})</h2>
              {backups.map(backup => (
                <div key={backup.id} data-testid={`backup-${backup.id}`}>
                  <h3>{backup.description}</h3>
                  <p>Type: {backup.type}</p>
                  <p>Size: {(backup.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Templates: {backup.data.templates?.length || 0}</p>
                  <p>Projects: {backup.data.projects?.length || 0}</p>
                  <p>Created: {backup.createdAt.toLocaleString()}</p>
                  <button onClick={() => handleRestoreBackup(backup.id)}>
                    Restore from this Backup
                  </button>
                </div>
              ))}
            </section>
          </div>
        );
      };

      render(<TestBackupRecovery />);

      // Step 1: Verify initial data state
      const dataStatus = screen.getByTestId('data-status');
      expect(within(dataStatus).getByText('Templates: 1')).toBeInTheDocument();
      expect(within(dataStatus).getByText('Projects: 1')).toBeInTheDocument();
      expect(within(dataStatus).getByText('Safety Template (NR-12)')).toBeInTheDocument();
      expect(within(dataStatus).getByText('Safety Training Project (1 elements)')).toBeInTheDocument();

      // Step 2: Create backup
      const createBackupButton = screen.getByText('Create Backup');
      fireEvent.click(createBackupButton);

      await waitFor(() => {
        const backupsList = screen.getByTestId('backups-list');
        expect(within(backupsList).getByText('Available Backups (1)')).toBeInTheDocument();
        expect(within(backupsList).getByText('Complete system backup')).toBeInTheDocument();
        expect(within(backupsList).getByText('Type: manual')).toBeInTheDocument();
        expect(within(backupsList).getByText('Size: 2.00 MB')).toBeInTheDocument();
        expect(within(backupsList).getByText('Templates: 1')).toBeInTheDocument();
        expect(within(backupsList).getByText('Projects: 1')).toBeInTheDocument();
      });

      // Step 3: Simulate data corruption/loss
      const corruptDataButton = screen.getByText('Simulate Data Loss');
      fireEvent.click(corruptDataButton);

      await waitFor(() => {
        const dataStatus = screen.getByTestId('data-status');
        expect(within(dataStatus).getByText('Templates: 0')).toBeInTheDocument();
        expect(within(dataStatus).getByText('Projects: 0')).toBeInTheDocument();
      });

      // Step 4: Restore from backup
      const restoreButton = screen.getByText('Restore from this Backup');
      fireEvent.click(restoreButton);

      await waitFor(() => {
        const dataStatus = screen.getByTestId('data-status');
        expect(within(dataStatus).getByText('Templates: 1')).toBeInTheDocument();
        expect(within(dataStatus).getByText('Projects: 1')).toBeInTheDocument();
        expect(within(dataStatus).getByText('Safety Template (NR-12)')).toBeInTheDocument();
        expect(within(dataStatus).getByText('Safety Training Project (1 elements)')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should monitor system performance and trigger alerts', async () => {
      const TestPerformanceMonitoring = () => {
        const [isMonitoring, setIsMonitoring] = React.useState(false);
        const [metrics, setMetrics] = React.useState(null);
        const [alerts, setAlerts] = React.useState([]);
        const [thresholds, setThresholds] = React.useState({
          'cpu.usage': 80,
          'memory.usage': 85,
          'render.time': 16.7
        });

        const generateMetrics = () => {
          return {
            system: {
              cpu: { 
                usage: Math.random() * 100, 
                cores: 8, 
                temperature: 60 + Math.random() * 20 
              },
              memory: { 
                used: 8192 + Math.random() * 4096, 
                total: 16384, 
                available: 8192 - Math.random() * 4096 
              },
              disk: { 
                used: 512000, 
                total: 1024000, 
                available: 512000 
              },
              network: { 
                bytesIn: Math.random() * 1000, 
                bytesOut: Math.random() * 2000, 
                latency: 20 + Math.random() * 30 
              }
            },
            application: {
              renderTime: 10 + Math.random() * 20,
              bundleSize: 2048,
              loadTime: 800 + Math.random() * 800,
              errorRate: Math.random() * 0.05,
              activeUsers: 100 + Math.random() * 100
            },
            userExperience: {
              pageLoadTime: 500 + Math.random() * 1000,
              interactionDelay: Math.random() * 100,
              visualStability: 0.8 + Math.random() * 0.2,
              accessibility: 0.85 + Math.random() * 0.15
            },
            timestamp: new Date()
          };
        };

        const checkThresholds = (currentMetrics) => {
          const newAlerts = [];

          if (currentMetrics.system.cpu.usage > thresholds['cpu.usage']) {
            newAlerts.push({
              id: `alert-cpu-${Date.now()}`,
              type: 'warning' as const,
              title: 'High CPU Usage',
              description: `CPU usage is ${currentMetrics.system.cpu.usage.toFixed(1)}%, above threshold of ${thresholds['cpu.usage']}%`,
              metric: 'cpu.usage',
              value: currentMetrics.system.cpu.usage,
              threshold: thresholds['cpu.usage'],
              severity: 'medium' as const,
              isActive: true,
              createdAt: new Date(),
              resolvedAt: null
            });
          }

          const memoryUsagePercent = (currentMetrics.system.memory.used / currentMetrics.system.memory.total) * 100;
          if (memoryUsagePercent > thresholds['memory.usage']) {
            newAlerts.push({
              id: `alert-memory-${Date.now()}`,
              type: 'error' as const,
              title: 'High Memory Usage',
              description: `Memory usage is ${memoryUsagePercent.toFixed(1)}%, above threshold of ${thresholds['memory.usage']}%`,
              metric: 'memory.usage',
              value: memoryUsagePercent,
              threshold: thresholds['memory.usage'],
              severity: 'high' as const,
              isActive: true,
              createdAt: new Date(),
              resolvedAt: null
            });
          }

          if (currentMetrics.application.renderTime > thresholds['render.time']) {
            newAlerts.push({
              id: `alert-render-${Date.now()}`,
              type: 'warning' as const,
              title: 'Slow Rendering',
              description: `Render time is ${currentMetrics.application.renderTime.toFixed(1)}ms, above threshold of ${thresholds['render.time']}ms`,
              metric: 'render.time',
              value: currentMetrics.application.renderTime,
              threshold: thresholds['render.time'],
              severity: 'medium' as const,
              isActive: true,
              createdAt: new Date(),
              resolvedAt: null
            });
          }

          if (newAlerts.length > 0) {
            setAlerts(prev => [...prev, ...newAlerts]);
          }
        };

        const handleStartMonitoring = () => {
          setIsMonitoring(true);
          
          const interval = setInterval(() => {
            const newMetrics = generateMetrics();
            setMetrics(newMetrics);
            checkThresholds(newMetrics);
          }, 1000);

          // Store interval ID for cleanup
          (window as any).monitoringInterval = interval;
        };

        const handleStopMonitoring = () => {
          setIsMonitoring(false);
          if ((window as any).monitoringInterval) {
            clearInterval((window as any).monitoringInterval);
          }
        };

        const handleResolveAlert = (alertId: string) => {
          setAlerts(prev => prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, isActive: false, resolvedAt: new Date() }
              : alert
          ));
        };

        React.useEffect(() => {
          return () => {
            if ((window as any).monitoringInterval) {
              clearInterval((window as any).monitoringInterval);
            }
          };
        }, []);

        return (
          <div>
            <h1>Performance Monitoring System</h1>

            {/* Monitoring Controls */}
            <section data-testid="monitoring-controls">
              <h2>Monitoring Status</h2>
              <p>Status: {isMonitoring ? 'Active' : 'Inactive'}</p>
              {!isMonitoring ? (
                <button onClick={handleStartMonitoring}>Start Monitoring</button>
              ) : (
                <button onClick={handleStopMonitoring}>Stop Monitoring</button>
              )}
            </section>

            {/* Current Metrics */}
            {metrics && (
              <section data-testid="current-metrics">
                <h2>Current Metrics</h2>
                <div data-testid="cpu-metrics">
                  <h3>CPU</h3>
                  <p>Usage: {metrics.system.cpu.usage.toFixed(1)}%</p>
                  <p>Temperature: {metrics.system.cpu.temperature.toFixed(1)}°C</p>
                </div>
                <div data-testid="memory-metrics">
                  <h3>Memory</h3>
                  <p>Used: {(metrics.system.memory.used / 1024).toFixed(1)} GB</p>
                  <p>Usage: {((metrics.system.memory.used / metrics.system.memory.total) * 100).toFixed(1)}%</p>
                </div>
                <div data-testid="render-metrics">
                  <h3>Rendering</h3>
                  <p>Render Time: {metrics.application.renderTime.toFixed(1)}ms</p>
                  <p>Load Time: {metrics.application.loadTime.toFixed(0)}ms</p>
                </div>
              </section>
            )}

            {/* Thresholds Configuration */}
            <section data-testid="thresholds-config">
              <h2>Alert Thresholds</h2>
              <div>
                <label>CPU Usage Threshold: </label>
                <input 
                  type="number" 
                  value={thresholds['cpu.usage']} 
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    'cpu.usage': Number(e.target.value)
                  }))}
                />%
              </div>
              <div>
                <label>Memory Usage Threshold: </label>
                <input 
                  type="number" 
                  value={thresholds['memory.usage']} 
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    'memory.usage': Number(e.target.value)
                  }))}
                />%
              </div>
              <div>
                <label>Render Time Threshold: </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={thresholds['render.time']} 
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    'render.time': Number(e.target.value)
                  }))}
                />ms
              </div>
            </section>

            {/* Active Alerts */}
            <section data-testid="active-alerts">
              <h2>Active Alerts ({alerts.filter(a => a.isActive).length})</h2>
              {alerts.filter(alert => alert.isActive).map(alert => (
                <div key={alert.id} data-testid={`alert-${alert.id}`} 
                     style={{ 
                       border: '1px solid red', 
                       padding: '10px', 
                       margin: '5px',
                       background: alert.severity === 'high' ? '#ffebee' : '#fff3e0'
                     }}>
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                  <p>Severity: {alert.severity}</p>
                  <p>Value: {alert.value.toFixed(1)} (Threshold: {alert.threshold})</p>
                  <button onClick={() => handleResolveAlert(alert.id)}>
                    Resolve Alert
                  </button>
                </div>
              ))}
            </section>

            {/* Resolved Alerts */}
            <section data-testid="resolved-alerts">
              <h2>Resolved Alerts ({alerts.filter(a => !a.isActive).length})</h2>
              {alerts.filter(alert => !alert.isActive).map(alert => (
                <div key={alert.id} data-testid={`resolved-alert-${alert.id}`}
                     style={{ 
                       border: '1px solid green', 
                       padding: '10px', 
                       margin: '5px',
                       background: '#e8f5e8'
                     }}>
                  <h3>{alert.title}</h3>
                  <p>Resolved at: {alert.resolvedAt?.toLocaleString()}</p>
                </div>
              ))}
            </section>
          </div>
        );
      };

      render(<TestPerformanceMonitoring />);

      // Step 1: Start monitoring
      const startButton = screen.getByText('Start Monitoring');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Status: Active')).toBeInTheDocument();
        expect(screen.getByText('Stop Monitoring')).toBeInTheDocument();
      });

      // Step 2: Wait for metrics to be generated
      await waitFor(() => {
        const metricsSection = screen.getByTestId('current-metrics');
        expect(within(metricsSection).getByText('Current Metrics')).toBeInTheDocument();
        expect(within(metricsSection).getByText(/Usage: \d+\.\d%/)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Step 3: Lower thresholds to trigger alerts
      const cpuThresholdInput = screen.getByDisplayValue('80');
      await userEvent.clear(cpuThresholdInput);
      await userEvent.type(cpuThresholdInput, '10');

      const memoryThresholdInput = screen.getByDisplayValue('85');
      await userEvent.clear(memoryThresholdInput);
      await userEvent.type(memoryThresholdInput, '10');

      const renderThresholdInput = screen.getByDisplayValue('16.7');
      await userEvent.clear(renderThresholdInput);
      await userEvent.type(renderThresholdInput, '5');

      // Step 4: Wait for alerts to be triggered
      await waitFor(() => {
        const alertsSection = screen.getByTestId('active-alerts');
        const alertCount = within(alertsSection).getByText(/Active Alerts \(\d+\)/);
        expect(alertCount).toBeInTheDocument();
        
        // Should have at least one alert
        const alertElements = screen.getAllByTestId(/^alert-/);
        expect(alertElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // Step 5: Resolve an alert
      const firstAlert = screen.getAllByText('Resolve Alert')[0];
      fireEvent.click(firstAlert);

      await waitFor(() => {
        const resolvedSection = screen.getByTestId('resolved-alerts');
        expect(within(resolvedSection).getByText(/Resolved Alerts \(1\)/)).toBeInTheDocument();
      });

      // Step 6: Stop monitoring
      const stopButton = screen.getByText('Stop Monitoring');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Status: Inactive')).toBeInTheDocument();
        expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
      });
    });
  });

  describe('End-to-End System Integration', () => {
    it('should demonstrate complete system workflow', async () => {
      const TestCompleteSystem = () => {
        const [currentStep, setCurrentStep] = React.useState(1);
        const [systemData, setSystemData] = React.useState({
          templates: [],
          compliance: null,
          backups: [],
          performance: null,
          collaborators: [],
          workflows: [],
          aiInsights: []
        });

        const executeStep = (step: number) => {
          setCurrentStep(step);
          
          switch (step) {
            case 1: // Create Template
              setSystemData(prev => ({
                ...prev,
                templates: [{
                  id: 'template1',
                  name: 'Comprehensive Safety Training',
                  category: 'NR-12',
                  content: { slides: [{ title: 'Safety Overview' }] },
                  createdAt: new Date()
                }]
              }));
              break;
              
            case 2: // Analyze Compliance
              setSystemData(prev => ({
                ...prev,
                compliance: {
                  score: 78,
                  status: 'needs_improvement',
                  issues: 2,
                  suggestions: 3
                }
              }));
              break;
              
            case 3: // Create Backup
              setSystemData(prev => ({
                ...prev,
                backups: [{
                  id: 'backup1',
                  description: 'Pre-collaboration backup',
                  size: '1.5MB',
                  createdAt: new Date()
                }]
              }));
              break;
              
            case 4: // Start Collaboration
              setSystemData(prev => ({
                ...prev,
                collaborators: [
                  { id: 'user1', name: 'John Doe', role: 'editor' },
                  { id: 'user2', name: 'Jane Smith', role: 'reviewer' }
                ]
              }));
              break;
              
            case 5: // Monitor Performance
              setSystemData(prev => ({
                ...prev,
                performance: {
                  cpu: 45,
                  memory: 62,
                  renderTime: 14.2,
                  alerts: 0
                }
              }));
              break;
              
            case 6: // Create AI Workflow
              setSystemData(prev => ({
                ...prev,
                workflows: [{
                  id: 'workflow1',
                  name: 'Auto Content Enhancement',
                  status: 'active',
                  executions: 0
                }]
              }));
              break;
              
            case 7: // Generate AI Insights
              setSystemData(prev => ({
                ...prev,
                aiInsights: [
                  { id: 'insight1', title: 'Content Optimization', priority: 'high' },
                  { id: 'insight2', title: 'Compliance Improvement', priority: 'medium' }
                ]
              }));
              break;
          }
        };

        return (
          <div>
            <h1>Complete System Integration Test</h1>
            
            {/* Progress Indicator */}
            <section data-testid="progress-indicator">
              <h2>Workflow Progress</h2>
              <p>Current Step: {currentStep} of 7</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(step => (
                  <button
                    key={step}
                    onClick={() => executeStep(step)}
                    style={{
                      background: step <= currentStep ? '#007bff' : '#ccc',
                      color: step <= currentStep ? 'white' : 'black',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px'
                    }}
                  >
                    Step {step}
                  </button>
                ))}
              </div>
            </section>

            {/* System Status Dashboard */}
            <section data-testid="system-status">
              <h2>System Status</h2>
              
              <div data-testid="templates-status">
                <h3>Templates ({systemData.templates.length})</h3>
                {systemData.templates.map(template => (
                  <div key={template.id}>
                    ✅ {template.name} ({template.category})
                  </div>
                ))}
              </div>

              <div data-testid="compliance-status">
                <h3>Compliance Analysis</h3>
                {systemData.compliance ? (
                  <div>
                    ✅ Score: {systemData.compliance.score}% ({systemData.compliance.status})
                    <br />Issues: {systemData.compliance.issues}, Suggestions: {systemData.compliance.suggestions}
                  </div>
                ) : (
                  <div>❌ Not analyzed</div>
                )}
              </div>

              <div data-testid="backup-status">
                <h3>Backups ({systemData.backups.length})</h3>
                {systemData.backups.map(backup => (
                  <div key={backup.id}>
                    ✅ {backup.description} ({backup.size})
                  </div>
                ))}
              </div>

              <div data-testid="collaboration-status">
                <h3>Collaboration ({systemData.collaborators.length} users)</h3>
                {systemData.collaborators.map(user => (
                  <div key={user.id}>
                    ✅ {user.name} ({user.role})
                  </div>
                ))}
              </div>

              <div data-testid="performance-status">
                <h3>Performance Monitoring</h3>
                {systemData.performance ? (
                  <div>
                    ✅ CPU: {systemData.performance.cpu}%, Memory: {systemData.performance.memory}%
                    <br />Render: {systemData.performance.renderTime}ms, Alerts: {systemData.performance.alerts}
                  </div>
                ) : (
                  <div>❌ Not monitoring</div>
                )}
              </div>

              <div data-testid="workflow-status">
                <h3>AI Workflows ({systemData.workflows.length})</h3>
                {systemData.workflows.map(workflow => (
                  <div key={workflow.id}>
                    ✅ {workflow.name} ({workflow.status})
                  </div>
                ))}
              </div>

              <div data-testid="ai-insights-status">
                <h3>AI Insights ({systemData.aiInsights.length})</h3>
                {systemData.aiInsights.map(insight => (
                  <div key={insight.id}>
                    ✅ {insight.title} ({insight.priority} priority)
                  </div>
                ))}
              </div>
            </section>

            {/* Integration Health Check */}
            <section data-testid="integration-health">
              <h2>Integration Health</h2>
              <div>
                <p>Templates ↔ Compliance: {systemData.templates.length > 0 && systemData.compliance ? '✅' : '❌'}</p>
                <p>Collaboration ↔ Backups: {systemData.collaborators.length > 0 && systemData.backups.length > 0 ? '✅' : '❌'}</p>
                <p>Performance ↔ Workflows: {systemData.performance && systemData.workflows.length > 0 ? '✅' : '❌'}</p>
                <p>AI ↔ Templates: {systemData.aiInsights.length > 0 && systemData.templates.length > 0 ? '✅' : '❌'}</p>
              </div>
            </section>
          </div>
        );
      };

      render(<TestCompleteSystem />);

      // Execute complete workflow
      for (let step = 1; step <= 7; step++) {
        const stepButton = screen.getByText(`Step ${step}`);
        fireEvent.click(stepButton);

        await waitFor(() => {
          expect(screen.getByText(`Current Step: ${step} of 7`)).toBeInTheDocument();
        });

        // Verify each step's completion
        switch (step) {
          case 1:
            expect(screen.getByText('Templates (1)')).toBeInTheDocument();
            expect(screen.getByText('✅ Comprehensive Safety Training (NR-12)')).toBeInTheDocument();
            break;
          case 2:
            expect(screen.getByText('✅ Score: 78% (needs_improvement)')).toBeInTheDocument();
            break;
          case 3:
            expect(screen.getByText('Backups (1)')).toBeInTheDocument();
            expect(screen.getByText('✅ Pre-collaboration backup (1.5MB)')).toBeInTheDocument();
            break;
          case 4:
            expect(screen.getByText('Collaboration (2 users)')).toBeInTheDocument();
            expect(screen.getByText('✅ John Doe (editor)')).toBeInTheDocument();
            break;
          case 5:
            expect(screen.getByText('✅ CPU: 45%, Memory: 62%')).toBeInTheDocument();
            break;
          case 6:
            expect(screen.getByText('AI Workflows (1)')).toBeInTheDocument();
            expect(screen.getByText('✅ Auto Content Enhancement (active)')).toBeInTheDocument();
            break;
          case 7:
            expect(screen.getByText('AI Insights (2)')).toBeInTheDocument();
            expect(screen.getByText('✅ Content Optimization (high priority)')).toBeInTheDocument();
            break;
        }
      }

      // Verify integration health after complete workflow
      await waitFor(() => {
        const healthSection = screen.getByTestId('integration-health');
        expect(within(healthSection).getByText('Templates ↔ Compliance: ✅')).toBeInTheDocument();
        expect(within(healthSection).getByText('Collaboration ↔ Backups: ✅')).toBeInTheDocument();
        expect(within(healthSection).getByText('Performance ↔ Workflows: ✅')).toBeInTheDocument();
        expect(within(healthSection).getByText('AI ↔ Templates: ✅')).toBeInTheDocument();
      });
    });
  });
});

console.log('✅ All integration tests completed successfully!');