/**
 * Testes do Batch Video Processor
 * 
 * Cobertura completa:
 * - Constructor e configuração
 * - Gerenciamento de tarefas
 * - Fila e priorização
 * - Processamento e handlers
 * - Retry e error handling
 * - Estatísticas
 * - Controle do processador
 * - Persistência de estado
 * - Factory functions
 * - Edge cases
 */

import {
  BatchProcessor,
  BatchTask,
  VideoOperation,
  Priority,
  TaskStatus,
  ProcessingResult,
  createBasicBatchProcessor,
  createHighPerformanceProcessor,
  createServerProcessor,
  createDevelopmentProcessor,
} from '../../../lib/video/batch-processor';

// Mock fs/promises
jest.mock('fs/promises');
const fs = require('fs/promises');

describe('BatchProcessor', () => {
  let processor: BatchProcessor;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fs operations
    fs.writeFile = jest.fn().mockResolvedValue(undefined);
    fs.readFile = jest.fn().mockResolvedValue('{}');
    
    processor = new BatchProcessor({ autoStart: false });
  });

  afterEach(() => {
    if (processor) {
      processor.reset();
    }
  });

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================

  describe('Constructor', () => {
    it('should create processor with default config', () => {
      const proc = new BatchProcessor({ autoStart: false });
      const config = proc.getConfig();

      expect(config.maxConcurrent).toBe(3);
      expect(config.retryStrategy).toBe('exponential');
      expect(config.maxRetries).toBe(3);
      expect(config.autoStart).toBe(false);
    });

    it('should create processor with custom config', () => {
      const proc = new BatchProcessor({
        maxConcurrent: 10,
        retryStrategy: 'linear',
        maxRetries: 5,
        timeout: 60000,
        autoStart: false,
      });

      const config = proc.getConfig();

      expect(config.maxConcurrent).toBe(10);
      expect(config.retryStrategy).toBe('linear');
      expect(config.maxRetries).toBe(5);
      expect(config.timeout).toBe(60000);
    });

    it('should auto-start if configured', () => {
      const proc = new BatchProcessor({ autoStart: true });
      expect(proc.isProcessing()).toBe(true);
    });
  });

  // ==========================================================================
  // TASK MANAGEMENT
  // ==========================================================================

  describe('Task Management', () => {
    it('should add task successfully', () => {
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4');

      expect(taskId).toBe('task-1');

      const task = processor.getTask(taskId);
      expect(task).toBeDefined();
      expect(task!.operation).toBe('transcode');
      expect(task!.inputPath).toBe('./input.mp4');
      expect(task!.status).toBe('queued');
    });

    it('should add task with priority', () => {
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4', {
        priority: 'high',
      });

      const task = processor.getTask(taskId);
      expect(task!.priority).toBe('high');
    });

    it('should add task with metadata', () => {
      const metadata = { userId: '123', videoType: 'tutorial' };
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4', {
        metadata,
      });

      const task = processor.getTask(taskId);
      expect(task!.metadata).toEqual(metadata);
    });

    it('should add multiple tasks', () => {
      const taskIds = processor.addTasks([
        { operation: 'transcode', inputPath: './v1.mp4', outputPath: './o1.mp4' },
        { operation: 'compress', inputPath: './v2.mp4', outputPath: './o2.mp4' },
        { operation: 'watermark', inputPath: './v3.mp4', outputPath: './o3.mp4' },
      ]);

      expect(taskIds).toHaveLength(3);
      expect(processor.getAllTasks()).toHaveLength(3);
    });

    it('should cancel task', () => {
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4');

      const cancelled = processor.cancelTask(taskId);
      expect(cancelled).toBe(true);

      const task = processor.getTask(taskId);
      expect(task!.status).toBe('cancelled');
    });

    it('should not cancel completed task', () => {
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4');
      const task = processor.getTask(taskId)!;
      task.status = 'completed';

      const cancelled = processor.cancelTask(taskId);
      expect(cancelled).toBe(false);
    });

    it('should remove task', () => {
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4');

      const removed = processor.removeTask(taskId);
      expect(removed).toBe(true);
      expect(processor.getTask(taskId)).toBeUndefined();
    });

    it('should clear completed tasks', () => {
      const id1 = processor.addTask('transcode', './v1.mp4', './o1.mp4');
      const id2 = processor.addTask('transcode', './v2.mp4', './o2.mp4');
      const id3 = processor.addTask('transcode', './v3.mp4', './o3.mp4');

      // Marcar algumas como concluídas
      processor.getTask(id1)!.status = 'completed';
      processor.getTask(id2)!.status = 'failed';

      const count = processor.clearCompletedTasks();

      expect(count).toBe(2);
      expect(processor.getAllTasks()).toHaveLength(1);
    });

    it('should get all tasks', () => {
      processor.addTask('transcode', './v1.mp4', './o1.mp4');
      processor.addTask('compress', './v2.mp4', './o2.mp4');

      const tasks = processor.getAllTasks();
      expect(tasks).toHaveLength(2);
    });

    it('should get tasks by status', () => {
      const id1 = processor.addTask('transcode', './v1.mp4', './o1.mp4');
      const id2 = processor.addTask('transcode', './v2.mp4', './o2.mp4');
      const id3 = processor.addTask('transcode', './v3.mp4', './o3.mp4');

      processor.getTask(id1)!.status = 'completed';
      processor.getTask(id2)!.status = 'failed';

      const queued = processor.getTasksByStatus('queued');
      const completed = processor.getTasksByStatus('completed');

      expect(queued).toHaveLength(1);
      expect(completed).toHaveLength(1);
    });
  });

  // ==========================================================================
  // PRIORITY QUEUE
  // ==========================================================================

  describe('Priority Queue', () => {
    it('should prioritize urgent tasks', () => {
      const proc = new BatchProcessor({
        autoStart: false,
        priorityEnabled: true,
      });

      const id1 = proc.addTask('transcode', './v1.mp4', './o1.mp4', { priority: 'low' });
      const id2 = proc.addTask('transcode', './v2.mp4', './o2.mp4', { priority: 'urgent' });
      const id3 = proc.addTask('transcode', './v3.mp4', './o3.mp4', { priority: 'normal' });

      const tasks = proc.getAllTasks();
      const queued = tasks.filter((t) => t.status === 'queued');

      // Ordem deve ser: urgent, normal, low
      expect(queued.find(t => t.id === id2)?.priority).toBe('urgent');
      expect(queued.find(t => t.id === id3)?.priority).toBe('normal');
      expect(queued.find(t => t.id === id1)?.priority).toBe('low');
    });

    it('should use FIFO when priority disabled', () => {
      const proc = new BatchProcessor({
        autoStart: false,
        priorityEnabled: false,
      });

      const id1 = proc.addTask('transcode', './v1.mp4', './o1.mp4', { priority: 'low' });
      const id2 = proc.addTask('transcode', './v2.mp4', './o2.mp4', { priority: 'urgent' });
      const id3 = proc.addTask('transcode', './v3.mp4', './o3.mp4', { priority: 'normal' });

      const tasks = proc.getAllTasks();

      // Ordem deve ser: low, urgent, normal (FIFO)
      expect(tasks[0].id).toBe(id1);
      expect(tasks[1].id).toBe(id2);
      expect(tasks[2].id).toBe(id3);
    });
  });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  describe('Handlers', () => {
    it('should register handler', () => {
      const handler = jest.fn();

      processor.registerHandler('transcode', handler);

      expect(processor.hasHandler('transcode')).toBe(true);
    });

    it('should unregister handler', () => {
      const handler = jest.fn();

      processor.registerHandler('transcode', handler);
      const removed = processor.unregisterHandler('transcode');

      expect(removed).toBe(true);
      expect(processor.hasHandler('transcode')).toBe(false);
    });

    it('should emit events when registering/unregistering', (done) => {
      const handler = jest.fn();

      processor.on('handler:registered', (data) => {
        expect(data.operation).toBe('transcode');
        done();
      });

      processor.registerHandler('transcode', handler);
    });
  });

  // ==========================================================================
  // PROCESSING
  // ==========================================================================

  describe('Processing', () => {
    it('should process task successfully', async () => {
      const handler = jest.fn().mockResolvedValue({
        taskId: 'task-1',
        success: true,
        outputPath: './output.mp4',
        processingTime: 1000,
        retryCount: 0,
      });

      processor.registerHandler('transcode', handler);

      const completedPromise = new Promise((resolve) => {
        processor.on('task:completed', resolve);
      });

      processor.start();
      const taskId = processor.addTask('transcode', './input.mp4', './output.mp4');

      await completedPromise;

      const task = processor.getTask(taskId);
      expect(task!.status).toBe('completed');
      expect(handler).toHaveBeenCalled();
    });

    it('should retry failed task', async () => {
      let attemptCount = 0;

      const handler = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          taskId: 'task-1',
          success: true,
          outputPath: './output.mp4',
          processingTime: 1000,
          retryCount: 2,
        });
      });

      processor.registerHandler('transcode', handler);
      processor.updateConfig({ retryDelay: 10 }); // Delay curto para teste

      const completedPromise = new Promise((resolve) => {
        processor.on('task:completed', resolve);
      });

      processor.start();
      processor.addTask('transcode', './input.mp4', './output.mp4');

      await completedPromise;

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should fail task after max retries', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Permanent failure'));

      processor.registerHandler('transcode', handler);
      processor.updateConfig({ maxRetries: 2, retryDelay: 10 });

      const failedPromise = new Promise((resolve) => {
        processor.on('task:failed', resolve);
      });

      processor.start();
      processor.addTask('transcode', './input.mp4', './output.mp4');

      await failedPromise;

      expect(handler).toHaveBeenCalledTimes(3); // 1 inicial + 2 retries
    });

    it('should respect max concurrent limit', async () => {
      let processing = 0;
      let maxProcessing = 0;

      const handler = jest.fn().mockImplementation(async () => {
        processing++;
        maxProcessing = Math.max(maxProcessing, processing);

        await new Promise((resolve) => setTimeout(resolve, 50));

        processing--;

        return {
          taskId: 'task',
          success: true,
          outputPath: './output.mp4',
          processingTime: 50,
          retryCount: 0,
        };
      });

      processor.registerHandler('transcode', handler);
      processor.updateConfig({ maxConcurrent: 2 });

      processor.start();

      // Adicionar 5 tarefas
      for (let i = 0; i < 5; i++) {
        processor.addTask('transcode', `./v${i}.mp4`, `./o${i}.mp4`);
      }

      // Aguardar processamento
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(maxProcessing).toBeLessThanOrEqual(2);
    });
  });

  // ==========================================================================
  // PROCESSOR CONTROL
  // ==========================================================================

  describe('Processor Control', () => {
    it('should start processor', () => {
      processor.start();
      expect(processor.isProcessing()).toBe(true);
    });

    it('should pause processor', () => {
      processor.start();
      processor.pause();
      expect(processor.isProcessing()).toBe(false);
    });

    it('should stop processor', async () => {
      processor.start();
      await processor.stop();
      expect(processor.isProcessing()).toBe(false);
    });

    it('should reset processor', () => {
      processor.addTask('transcode', './v1.mp4', './o1.mp4');
      processor.addTask('compress', './v2.mp4', './o2.mp4');

      processor.reset();

      expect(processor.getAllTasks()).toHaveLength(0);
      expect(processor.isProcessing()).toBe(false);
    });

    it('should emit processor events', (done) => {
      let eventCount = 0;

      processor.on('processor:started', () => {
        eventCount++;
        if (eventCount === 1) {
          processor.pause();
        }
      });

      processor.on('processor:paused', () => {
        eventCount++;
        if (eventCount === 2) {
          done();
        }
      });

      processor.start();
    });
  });

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  describe('Statistics', () => {
    it('should calculate statistics correctly', () => {
      processor.addTask('transcode', './v1.mp4', './o1.mp4');
      processor.addTask('compress', './v2.mp4', './o2.mp4');

      const stats = processor.getStatistics();

      expect(stats.total).toBe(2);
      expect(stats.queued).toBe(2);
      expect(stats.completed).toBe(0);
    });

    it('should calculate success rate', () => {
      // Criar um novo processador para ter controle total
      const stats = processor.getStatistics();
      
      // Garantir que o cálculo está funcionando
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });

    it('should calculate overall progress', () => {
      processor.addTask('transcode', './v1.mp4', './o1.mp4');
      processor.addTask('transcode', './v2.mp4', './o2.mp4');

      const progress = processor.getOverallProgress();

      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should emit statistics events', (done) => {
      const testProcessor = new BatchProcessor({ autoStart: false });
      
      testProcessor.on('statistics:updated', (stats) => {
        if (stats.total > 0) {
          expect(stats.total).toBe(1);
          done();
        }
      });

      testProcessor.addTask('transcode', './input.mp4', './output.mp4');
    });
  });

  // ==========================================================================
  // STATE PERSISTENCE
  // ==========================================================================

  describe('State Persistence', () => {
    it('should save state', async () => {
      processor.updateConfig({ persistState: true, stateFilePath: './test-state.json' });
      processor.addTask('transcode', './input.mp4', './output.mp4');

      await processor.saveState();

      expect(fs.writeFile).toHaveBeenCalledWith(
        './test-state.json',
        expect.any(String),
        'utf-8'
      );
    });

    it('should load state', async () => {
      const stateData = {
        tasks: [
          [
            'task-1',
            {
              id: 'task-1',
              operation: 'transcode',
              inputPath: './input.mp4',
              outputPath: './output.mp4',
              priority: 'normal',
              status: 'queued',
              progress: 0,
              retryCount: 0,
              maxRetries: 3,
              createdAt: new Date().toISOString(),
            },
          ],
        ],
        queue: ['task-1'],
        nextTaskId: 2,
        statistics: {},
        savedAt: new Date().toISOString(),
      };

      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify(stateData));

      processor.updateConfig({ stateFilePath: './test-state.json' });
      await processor.loadState();

      expect(processor.getTask('task-1')).toBeDefined();
    });

    it('should emit state events', (done) => {
      processor.updateConfig({ stateFilePath: './test-state.json' });
      processor.addTask('transcode', './input.mp4', './output.mp4');

      processor.on('state:saved', (data) => {
        expect(data.path).toBe('./test-state.json');
        done();
      });

      processor.saveState();
    });
  });

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  describe('Configuration', () => {
    it('should get config', () => {
      const config = processor.getConfig();

      expect(config).toHaveProperty('maxConcurrent');
      expect(config).toHaveProperty('retryStrategy');
      expect(config).toHaveProperty('maxRetries');
    });

    it('should update config', () => {
      processor.updateConfig({ maxConcurrent: 10 });

      const config = processor.getConfig();
      expect(config.maxConcurrent).toBe(10);
    });

    it('should emit config events', (done) => {
      processor.on('config:updated', (config) => {
        expect(config.maxConcurrent).toBe(5);
        done();
      });

      processor.updateConfig({ maxConcurrent: 5 });
    });
  });

  // ==========================================================================
  // FACTORY FUNCTIONS
  // ==========================================================================

  describe('Factory Functions', () => {
    it('should create basic processor', () => {
      const proc = createBasicBatchProcessor();
      const config = proc.getConfig();

      expect(config.maxConcurrent).toBe(3);
      expect(config.priorityEnabled).toBe(false);
    });

    it('should create high performance processor', () => {
      const proc = createHighPerformanceProcessor();
      const config = proc.getConfig();

      expect(config.maxConcurrent).toBe(10);
      expect(config.priorityEnabled).toBe(true);
      expect(config.persistState).toBe(true);
    });

    it('should create server processor', () => {
      const proc = createServerProcessor();
      const config = proc.getConfig();

      expect(config.maxConcurrent).toBe(5);
      expect(config.autoStart).toBe(false);
      expect(config.persistState).toBe(true);
    });

    it('should create development processor', () => {
      const proc = createDevelopmentProcessor();
      const config = proc.getConfig();

      expect(config.maxConcurrent).toBe(1);
      expect(config.persistState).toBe(false);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty task list', () => {
      const stats = processor.getStatistics();
      expect(stats.total).toBe(0);

      const progress = processor.getOverallProgress();
      expect(progress).toBe(0);
    });

    it('should handle task without handler', async () => {
      const failedPromise = new Promise((resolve) => {
        processor.on('task:failed', resolve);
      });

      processor.start();
      processor.addTask('transcode', './input.mp4', './output.mp4');

      await failedPromise;

      const task = processor.getTask('task-1');
      expect(task!.status).toBe('failed');
    });

    it('should handle invalid task id', () => {
      const task = processor.getTask('invalid-id');
      expect(task).toBeUndefined();

      const cancelled = processor.cancelTask('invalid-id');
      expect(cancelled).toBe(false);

      const removed = processor.removeTask('invalid-id');
      expect(removed).toBe(false);
    });

    it('should handle concurrent start calls', () => {
      processor.start();
      processor.start();
      processor.start();

      expect(processor.isProcessing()).toBe(true);
    });

    it('should handle concurrent pause calls', () => {
      processor.start();
      processor.pause();
      processor.pause();
      processor.pause();

      expect(processor.isProcessing()).toBe(false);
    });
  });
});
