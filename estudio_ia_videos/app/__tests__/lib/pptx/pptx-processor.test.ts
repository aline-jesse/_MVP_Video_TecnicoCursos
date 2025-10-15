import { PPTXProcessor } from '../../../lib/pptx/pptx-processor';
import JSZip from 'jszip';

// Mock all dependencies
jest.mock('jszip');
jest.mock('@/lib/pptx/parsers/text-parser');
jest.mock('@/lib/pptx/parsers/image-parser');
jest.mock('@/lib/pptx/parsers/layout-parser');

// Mock the parsers
const mockTextParser = {
  extractText: jest.fn()
};

const mockImageParser = {
  extractImages: jest.fn()
};

const mockLayoutParser = {
  detectLayout: jest.fn()
};

jest.mock('../../../lib/pptx/parsers/text-parser', () => ({
  PPTXTextParser: jest.fn().mockImplementation(() => mockTextParser)
}));

jest.mock('../../../lib/pptx/parsers/image-parser', () => ({
  PPTXImageParser: jest.fn().mockImplementation(() => mockImageParser)
}));

jest.mock('../../../lib/pptx/parsers/layout-parser', () => ({
  PPTXLayoutParser: jest.fn().mockImplementation(() => mockLayoutParser)
}));

describe('PPTXProcessor', () => {
  let processor: PPTXProcessor;
  let mockProgressCallback: jest.Mock;

  beforeEach(() => {
    processor = new PPTXProcessor();
    mockProgressCallback = jest.fn();
    jest.clearAllMocks();
  });

  describe('processFile', () => {
    it('should process PPTX file successfully', async () => {
      const mockBuffer = Buffer.from('fake-pptx-data');
      const projectId = 'test-project';

      // Mock JSZip
      const mockZip = {
        loadAsync: jest.fn().mockResolvedValue(true),
        file: jest.fn(),
        filter: jest.fn()
      };
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => mockZip as any);

      // Mock parser responses
      mockTextParser.extractText.mockResolvedValue([
        {
          slideNumber: 1,
          text: 'Slide 1 content',
          formatting: [],
          bulletPoints: ['Point 1', 'Point 2'],
          hyperlinks: []
        },
        {
          slideNumber: 2,
          text: 'Slide 2 content',
          formatting: [],
          bulletPoints: [],
          hyperlinks: []
        }
      ]);

      mockImageParser.extractImages.mockResolvedValue([
        {
          originalName: 'image1.jpg',
          s3Key: 'test-project/images/image1.jpg',
          s3Url: 'https://s3.example.com/image1.jpg',
          type: 'image/jpeg',
          size: 12345
        }
      ]);

      mockLayoutParser.detectLayout.mockResolvedValue({
        layoutType: 'content',
        confidence: 0.85,
        elements: [
          { type: 'title', position: { x: 0, y: 0, width: 100, height: 20 }, content: 'Title' },
          { type: 'content', position: { x: 0, y: 30, width: 100, height: 60 }, content: 'Content' }
        ]
      });

      // Mock metadata extraction
      mockZip.file.mockImplementation((path: string) => {
        if (path === 'docProps/app.xml') {
          return {
            async: jest.fn().mockResolvedValue(`
              <Properties>
                <Application>Microsoft Office PowerPoint</Application>
                <TotalTime>120</TotalTime>
                <Slides>2</Slides>
              </Properties>
            `)
          };
        }
        if (path === 'docProps/core.xml') {
          return {
            async: jest.fn().mockResolvedValue(`
              <cp:coreProperties>
                <dc:title>Test Presentation</dc:title>
                <dc:creator>Test Author</dc:creator>
                <dcterms:created>2024-01-01T00:00:00Z</dcterms:created>
              </cp:coreProperties>
            `)
          };
        }
        if (path === 'ppt/presentation.xml') {
          return {
            async: jest.fn().mockResolvedValue(`
              <p:presentation>
                <p:sldSz cx="9144000" cy="6858000"/>
              </p:presentation>
            `)
          };
        }
        return null;
      });

      const options = {
        extractImages: true,
        processText: true,
        detectLayouts: true,
        generateThumbnails: false
      };

      const result = await processor.processFile(mockBuffer, projectId, options, mockProgressCallback);

      expect(result).toMatchObject({
        metadata: expect.objectContaining({
          title: 'Test Presentation',
          author: 'Test Author',
          totalSlides: 2
        }),
        slides: expect.arrayContaining([
          expect.objectContaining({
            slideNumber: 1,
            text: 'Slide 1 content',
            layout: expect.objectContaining({
              layoutType: 'content',
              confidence: 0.85
            })
          })
        ]),
        assets: expect.objectContaining({
          images: expect.arrayContaining([
            expect.objectContaining({
              originalName: 'image1.jpg',
              s3Url: 'https://s3.example.com/image1.jpg'
            })
          ])
        }),
        timeline: expect.objectContaining({
          totalDuration: expect.any(Number),
          scenes: expect.any(Array)
        }),
        stats: expect.objectContaining({
          textBlocks: 2,
          images: 1,
          processingTime: expect.any(Number)
        })
      });

      expect(mockProgressCallback).toHaveBeenCalledWith('Processamento concluído', 100);
    });

    it('should handle processing errors gracefully', async () => {
      const mockBuffer = Buffer.from('invalid-pptx-data');
      const projectId = 'test-project';

      // Mock JSZip to throw error
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => {
        throw new Error('Invalid PPTX file');
      });

      const options = {
        extractImages: true,
        processText: true,
        detectLayouts: true,
        generateThumbnails: false
      };

      await expect(
        processor.processFile(mockBuffer, projectId, options, mockProgressCallback)
      ).rejects.toThrow('Invalid PPTX file');
    });

    it('should skip image extraction when disabled', async () => {
      const mockBuffer = Buffer.from('fake-pptx-data');
      const projectId = 'test-project';

      const mockZip = {
        loadAsync: jest.fn().mockResolvedValue(true),
        file: jest.fn().mockReturnValue(null),
        filter: jest.fn().mockReturnValue([])
      };
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => mockZip as any);

      mockTextParser.extractText.mockResolvedValue([]);
      mockLayoutParser.detectLayout.mockResolvedValue({
        layoutType: 'unknown',
        confidence: 0,
        elements: []
      });

      const options = {
        extractImages: false, // Disabled
        processText: true,
        detectLayouts: true,
        generateThumbnails: false
      };

      const result = await processor.processFile(mockBuffer, projectId, options, mockProgressCallback);

      expect(mockImageParser.extractImages).not.toHaveBeenCalled();
      expect(result.assets.images).toHaveLength(0);
    });

    it('should skip text processing when disabled', async () => {
      const mockBuffer = Buffer.from('fake-pptx-data');
      const projectId = 'test-project';

      const mockZip = {
        loadAsync: jest.fn().mockResolvedValue(true),
        file: jest.fn().mockReturnValue(null),
        filter: jest.fn().mockReturnValue([])
      };
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => mockZip as any);

      mockImageParser.extractImages.mockResolvedValue([]);
      mockLayoutParser.detectLayout.mockResolvedValue({
        layoutType: 'unknown',
        confidence: 0,
        elements: []
      });

      const options = {
        extractImages: true,
        processText: false, // Disabled
        detectLayouts: true,
        generateThumbnails: false
      };

      const result = await processor.processFile(mockBuffer, projectId, options, mockProgressCallback);

      expect(mockTextParser.extractText).not.toHaveBeenCalled();
      expect(result.slides).toHaveLength(0);
    });

    it('should skip layout detection when disabled', async () => {
      const mockBuffer = Buffer.from('fake-pptx-data');
      const projectId = 'test-project';

      const mockZip = {
        loadAsync: jest.fn().mockResolvedValue(true),
        file: jest.fn().mockReturnValue(null),
        filter: jest.fn().mockReturnValue([])
      };
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => mockZip as any);

      mockTextParser.extractText.mockResolvedValue([
        { slideNumber: 1, text: 'Test', formatting: [], bulletPoints: [], hyperlinks: [] }
      ]);
      mockImageParser.extractImages.mockResolvedValue([]);

      const options = {
        extractImages: true,
        processText: true,
        detectLayouts: false, // Disabled
        generateThumbnails: false
      };

      const result = await processor.processFile(mockBuffer, projectId, options, mockProgressCallback);

      expect(mockLayoutParser.detectLayout).not.toHaveBeenCalled();
      expect(result.slides[0].layout).toBeUndefined();
    });
  });

  describe('validatePPTXFile', () => {
    it('should validate valid PPTX file', async () => {
      const mockBuffer = Buffer.from('PK\x03\x04'); // ZIP signature
      
      const mockZip = {
        loadAsync: jest.fn().mockResolvedValue(true),
        file: jest.fn().mockReturnValue({ async: jest.fn() })
      };
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => mockZip as any);

      const isValid = await PPTXProcessor.validatePPTXFile(mockBuffer);
      expect(isValid).toBe(true);
    });

    it('should reject invalid PPTX file', async () => {
      const mockBuffer = Buffer.from('invalid data');
      
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => {
        throw new Error('Invalid ZIP');
      });

      const isValid = await PPTXProcessor.validatePPTXFile(mockBuffer);
      expect(isValid).toBe(false);
    });

    it('should reject file without presentation.xml', async () => {
      const mockBuffer = Buffer.from('PK\x03\x04');
      
      const mockZip = {
        loadAsync: jest.fn().mockResolvedValue(true),
        file: jest.fn().mockReturnValue(null) // No presentation.xml
      };
      (JSZip as jest.MockedClass<typeof JSZip>).mockImplementation(() => mockZip as any);

      const isValid = await PPTXProcessor.validatePPTXFile(mockBuffer);
      expect(isValid).toBe(false);
    });
  });

  describe('extractMetadata', () => {
    it('should extract metadata from PPTX files', async () => {
      const mockZip = {
        file: jest.fn().mockImplementation((path: string) => {
          if (path === 'docProps/core.xml') {
            return {
              async: jest.fn().mockResolvedValue(`
                <cp:coreProperties>
                  <dc:title>Test Title</dc:title>
                  <dc:creator>Test Author</dc:creator>
                  <dcterms:created>2024-01-01T00:00:00Z</dcterms:created>
                  <dcterms:modified>2024-01-02T00:00:00Z</dcterms:modified>
                </cp:coreProperties>
              `)
            };
          }
          if (path === 'docProps/app.xml') {
            return {
              async: jest.fn().mockResolvedValue(`
                <Properties>
                  <Application>Microsoft Office PowerPoint</Application>
                  <Slides>5</Slides>
                </Properties>
              `)
            };
          }
          if (path === 'ppt/presentation.xml') {
            return {
              async: jest.fn().mockResolvedValue(`
                <p:presentation>
                  <p:sldSz cx="9144000" cy="6858000"/>
                </p:presentation>
              `)
            };
          }
          return null;
        })
      };

      const metadata = await processor['extractMetadata'](mockZip as any);

      expect(metadata).toMatchObject({
        title: 'Test Title',
        author: 'Test Author',
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-02T00:00:00Z',
        totalSlides: 5,
        application: 'Microsoft Office PowerPoint',
        dimensions: { width: 9144000, height: 6858000 }
      });
    });

    it('should handle missing metadata files', async () => {
      const mockZip = {
        file: jest.fn().mockReturnValue(null)
      };

      const metadata = await processor['extractMetadata'](mockZip as any);

      expect(metadata).toMatchObject({
        title: 'Untitled Presentation',
        author: 'Unknown',
        totalSlides: 0,
        application: 'Unknown',
        dimensions: { width: 9144000, height: 6858000 }
      });
    });
  });

  describe('generateTimeline', () => {
    it('should generate timeline from slides', () => {
      const slides = [
        { slideNumber: 1, text: 'Slide 1', formatting: [], bulletPoints: [], hyperlinks: [] },
        { slideNumber: 2, text: 'Slide 2', formatting: [], bulletPoints: [], hyperlinks: [] },
        { slideNumber: 3, text: 'Slide 3', formatting: [], bulletPoints: [], hyperlinks: [] }
      ];

      const timeline = processor['generateTimeline'](slides);

      expect(timeline.scenes).toHaveLength(3);
      expect(timeline.totalDuration).toBeGreaterThan(0);
      
      timeline.scenes.forEach((scene, index) => {
        expect(scene.sceneId).toBe(`scene_${index + 1}`);
        expect(scene.slideNumber).toBe(index + 1);
        expect(scene.startTime).toBeGreaterThanOrEqual(0);
        expect(scene.endTime).toBeGreaterThan(scene.startTime);
      });
    });

    it('should handle empty slides array', () => {
      const timeline = processor['generateTimeline']([]);

      expect(timeline.scenes).toHaveLength(0);
      expect(timeline.totalDuration).toBe(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate processing statistics', () => {
      const slides = [
        { slideNumber: 1, text: 'Text 1', formatting: [], bulletPoints: [], hyperlinks: [] },
        { slideNumber: 2, text: 'Text 2', formatting: [], bulletPoints: [], hyperlinks: [] }
      ];
      
      const images = [
        { originalName: 'img1.jpg', s3Url: 'url1', type: 'image/jpeg', size: 1000 },
        { originalName: 'img2.png', s3Url: 'url2', type: 'image/png', size: 2000 }
      ];

      const processingTime = 5.5;

      const stats = processor['calculateStats'](slides, images, processingTime);

      expect(stats).toMatchObject({
        textBlocks: 2,
        images: 2,
        shapes: 0,
        charts: 0,
        tables: 0,
        processingTime: 5.5
      });
    });
  });
});