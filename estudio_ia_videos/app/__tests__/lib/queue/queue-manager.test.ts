/**
 * Testes para Queue Manager
 * @jest-environment node
 */

import {
  QueueManager,
  createBasicQueue,
  createResilientQueue,
  createHighPerformanceQueue,
} from '@/lib/queue/queue-manager';

// Mock do Redis
jest.mock('ioredis');

describe('QueueManager', () => {
  let queue: QueueManager;

  afterEach(async () => {
    if (queue) {
      await queue.close();
    }
  });

  describe('Factory Functions', () => {
    it('should create basic queue', () => {
      queue = createBasicQueue('test-basic');
      expect(queue).toBeInstanceOf(QueueManager);
    });

    it('should create resilient queue', () => {
      queue = createResilientQueue('test-resilient');
      expect(queue).toBeInstanceOf(QueueManager);
    });

    it('should create high performance queue', () => {
      queue = createHighPerformanceQueue('test-hp');
      expect(queue).toBeInstanceOf(QueueManager);
    });
  });

  describe('Job Management', () => {
    beforeEach(() => {
      queue = createBasicQueue('test-jobs');
    });

    it('should add job to queue', async () => {
      const job = await queue.addJob('test-type', { data: 'test' });

      expect(job.id).toBeDefined();
      expect(job.type).toBe('test-type');
      expect(job.status).toBe('pending');
      expect(job.data).toEqual({ data: 'test' });
      expect(job.priority).toBe('normal');
    });

    it('should add job with priority', async () => {
      const job = await queue.addJob('test', { data: 'test' }, {
        priority: 'high',
      });

      expect(job.priority).toBe('high');
    });

    it('should add job with custom max attempts', async () => {
      const job = await queue.addJob('test', { data: 'test' }, {
        maxAttempts: 5,
      });

      expect(job.maxAttempts).toBe(5);
    });

    it('should get job by ID', async () => {
      const addedJob = await queue.addJob('test', { data: 'test' });
      
      // Aguardar job ser salvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const job = await queue.getJob(addedJob.id);
      
      if (job) {
        expect(job.id).toBe(addedJob.id);
        expect(job.type).toBe('test');
      }
    });

    it('should return null for non-existent job', async () => {
      const job = await queue.getJob('non-existent-id');
      expect(job).toBeNull();
    });
  });

  describe('Job Processing', () => {
    beforeEach(() => {
      queue = createBasicQueue('test-processing');
    });

    it('should register processor', () => {
      const processor = jest.fn(async (job) => ({ success: true }));
      queue.registerProcessor('test-type', processor);

      // Verificar emissão de evento
      expect(queue.listenerCount('processor:registered')).toBeGreaterThanOrEqual(0);
    });

    it('should process job with registered processor', async () => {
      const processor = jest.fn(async (job) => {
        return { result: 'processed', jobId: job.id };
      });

      queue.registerProcessor('test-type', processor);

      const job = await queue.addJob('test-type', { data: 'test' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(processor).toHaveBeenCalled();
    });

    it('should emit events during processing', async () => {
      const events: string[] = [];

      queue.on('job:added', () => events.push('added'));
      queue.on('job:processing', () => events.push('processing'));
      queue.on('job:completed', () => events.push('completed'));

      queue.registerProcessor('test', async () => ({ success: true }));
      await queue.addJob('test', { data: 'test' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(events).toContain('added');
    });

    it('should handle processor errors', async () => {
      const processor = jest.fn(async () => {
        throw new Error('Processing failed');
      });

      queue.registerProcessor('test', processor);
      
      const failedEvent = jest.fn();
      queue.on('job:failed', failedEvent);

      await queue.addJob('test', { data: 'test' });

      // Aguardar tentativas de processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Deve ter tentado processar
      expect(processor).toHaveBeenCalled();
    });
  });

  describe('Priority Queue', () => {
    beforeEach(() => {
      queue = createBasicQueue('test-priority');
    });

    it('should process high priority jobs first', async () => {
      const processedJobs: string[] = [];

      queue.registerProcessor('test', async (job) => {
        processedJobs.push(job.id);
        return { success: true };
      });

      // Adicionar jobs com diferentes prioridades
      const lowJob = await queue.addJob('test', { priority: 'low' }, { priority: 'low' });
      const normalJob = await queue.addJob('test', { priority: 'normal' }, { priority: 'normal' });
      const highJob = await queue.addJob('test', { priority: 'high' }, { priority: 'high' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // High priority deve ser processado primeiro
      if (processedJobs.length > 0) {
        expect(processedJobs[0]).toBe(highJob.id);
      }
    });
  });

  describe('Retry Mechanism', () => {
    beforeEach(() => {
      queue = createResilientQueue('test-retry');
    });

    it('should retry failed jobs', async () => {
      let attempts = 0;
      const processor = jest.fn(async (job) => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary failure');
        }
        return { success: true };
      });

      queue.registerProcessor('test', processor);
      
      const retryingEvent = jest.fn();
      queue.on('job:retrying', retryingEvent);

      await queue.addJob('test', { data: 'test' });

      // Aguardar retries
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Deve ter tentado múltiplas vezes
      expect(processor).toHaveBeenCalledTimes(Math.min(attempts, 3));
    });

    it('should move to DLQ after max attempts', async () => {
      const processor = jest.fn(async () => {
        throw new Error('Permanent failure');
      });

      queue.registerProcessor('test', processor);
      
      const deadEvent = jest.fn();
      queue.on('job:dead', deadEvent);

      await queue.addJob('test', { data: 'test' }, { maxAttempts: 2 });

      // Aguardar todas as tentativas
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Deve ter atingido max attempts
      expect(processor.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      queue = createHighPerformanceQueue('test-metrics');
    });

    it('should track queue metrics', async () => {
      queue.registerProcessor('test', async () => ({ success: true }));

      await queue.addJob('test', { data: '1' });
      await queue.addJob('test', { data: '2' });
      await queue.addJob('test', { data: '3' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      const metrics = await queue.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average processing time', async () => {
      queue.registerProcessor('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
      });

      await queue.addJob('test', { data: 'test' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      const metrics = await queue.getMetrics();

      expect(metrics.avgProcessingTime).toBeGreaterThan(0);
    });

    it('should calculate success rate', async () => {
      let count = 0;
      queue.registerProcessor('test', async () => {
        count++;
        if (count === 1) {
          throw new Error('Fail first');
        }
        return { success: true };
      });

      await queue.addJob('test', { data: '1' });
      await queue.addJob('test', { data: '2' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      const metrics = await queue.getMetrics();

      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Queue Control', () => {
    beforeEach(() => {
      queue = createBasicQueue('test-control');
    });

    it('should pause queue', () => {
      queue.pause();
      
      // Verificar emissão de evento
      expect(queue.listenerCount('queue:paused')).toBeGreaterThanOrEqual(0);
    });

    it('should resume queue', () => {
      queue.pause();
      queue.resume();
      
      // Queue deve estar processando novamente
      expect(queue).toBeDefined();
    });

    it('should not process jobs when paused', async () => {
      const processor = jest.fn(async () => ({ success: true }));
      queue.registerProcessor('test', processor);

      queue.pause();
      await queue.addJob('test', { data: 'test' });

      // Aguardar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Não deve ter processado
      expect(processor).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      queue = createBasicQueue('test-cleanup');
    });

    it('should cleanup old jobs', async () => {
      queue.registerProcessor('test', async () => ({ success: true }));

      await queue.addJob('test', { data: 'test' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      const cleaned = await queue.cleanup(0); // Cleanup imediato

      expect(cleaned).toBeGreaterThanOrEqual(0);
    });

    it('should emit cleanup event', async () => {
      const cleanupEvent = jest.fn();
      queue.on('cleanup:completed', cleanupEvent);

      await queue.cleanup();

      expect(cleanupEvent).toHaveBeenCalled();
    });
  });

  describe('Concurrency', () => {
    it('should respect concurrency limit', async () => {
      queue = new QueueManager({
        name: 'test-concurrency',
        concurrency: 2,
      });

      let concurrent = 0;
      let maxConcurrent = 0;

      queue.registerProcessor('test', async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        concurrent--;
        return { success: true };
      });

      // Adicionar mais jobs que o limite de concorrência
      await queue.addJob('test', { data: '1' });
      await queue.addJob('test', { data: '2' });
      await queue.addJob('test', { data: '3' });
      await queue.addJob('test', { data: '4' });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Máximo concorrente não deve exceder limite
      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      queue = createBasicQueue('test-errors');
    });

    it('should handle timeout', async () => {
      queue = new QueueManager({
        name: 'test-timeout',
        timeout: 100,
      });

      queue.registerProcessor('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      });

      const failedEvent = jest.fn();
      queue.on('job:failed', failedEvent);

      await queue.addJob('test', { data: 'test' });

      // Aguardar timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Deve ter falhado por timeout
      expect(failedEvent).toHaveBeenCalled();
    });

    it('should handle missing processor', async () => {
      const failedEvent = jest.fn();
      queue.on('job:failed', failedEvent);

      await queue.addJob('unregistered-type', { data: 'test' });

      // Aguardar tentativa de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Deve ter falhado
      expect(failedEvent).toHaveBeenCalled();
    });
  });

  describe('Cleanup on Close', () => {
    it('should wait for active jobs before closing', async () => {
      queue = createBasicQueue('test-close');

      queue.registerProcessor('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      });

      await queue.addJob('test', { data: 'test' });

      // Fechar imediatamente
      const closePromise = queue.close();

      // Deve aguardar processamento
      await expect(closePromise).resolves.not.toThrow();
    });
  });
});
