/**
 * EXECUTOR AUTOMATIZADO - FASE 1: PPTX Processing Real
 * Objetivo: Implementar processamento real de arquivos PPTX
 * Status Atual: Iniciando implementação
 */

import { PptxGenJS } from 'pptxgenjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

// Interfaces
interface PPTXLayout {
  name: string;
  type: string;
  elements: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

interface PPTXSlide {
  slideNumber: number;
  title: string;
  content: string[];
  images: PPTXImage[];
  notes: string;
  layout: PPTXLayout;
  backgroundImage?: string;
}

interface PPTXImage {
  url: string;
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
  };
}

// Configuração do Parser PPTX
export class PPTXProcessor {
  private pptx: PptxGenJS;
  private s3Client: S3Client;
  private prisma: PrismaClient;

  constructor() {
    this.pptx = new PptxGenJS();
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.prisma = new PrismaClient();
  }

  /**
   * Processa um arquivo PPTX e extrai seu conteúdo
   * @param filePath Caminho do arquivo PPTX
   */
  async processPPTX(filePath: string): Promise<PPTXSlide[]> {
     try {
       // Ler o arquivo PPTX
       const fileBuffer = await fs.promises.readFile(filePath);
       
       // Carregar o arquivo no PptxGenJS
       await this.pptx.load(fileBuffer);
       
       const slides: PPTXSlide[] = [];
       const slideCount = this.pptx.slides.length;
       
       // Processar cada slide
       for (let i = 0; i < slideCount; i++) {
         const currentSlide = this.pptx.slides[i];
         
         // Extrair conteúdo do slide
         const content = await this.extractSlideContent(currentSlide);
         
         // Processar imagens (será implementado em seguida)
         const images = await this.processImages(currentSlide.images || []);
         
         // Extrair layout do slide
          const layout = this.extractLayout(currentSlide);

          // Criar objeto do slide
          const slide: PPTXSlide = {
            slideNumber: i + 1,
            title: content[0] || '', // Primeiro item do conteúdo como título
            content: content.slice(1), // Resto do conteúdo
            images: images,
            notes: currentSlide.notes || '',
            layout: layout,
            backgroundImage: currentSlide.background?.image
          };
         
         slides.push(slide);
       }
       
       // Salvar no banco de dados
       await this.saveToDatabase(slides);
       
       return slides;
     } catch (error) {
       console.error('Erro ao processar PPTX:', error);
       throw error;
     }
   }

  /**
   * Extrai texto e conteúdo dos slides
   * @param slide Slide do PPTX
   */
  private async extractSlideContent(slide: any): Promise<string[]> {
    const content: string[] = [];
    
    // Extrair título se existir
    if (slide.title) {
      content.push(slide.title.text || '');
    }
    
    // Extrair texto de todos os elementos de texto
    if (slide.shapes) {
      for (const shape of slide.shapes) {
        if (shape.text) {
          content.push(shape.text);
        }
      }
    }
    
    // Extrair texto de tabelas
    if (slide.tables) {
      for (const table of slide.tables) {
        for (const row of table.rows) {
          for (const cell of row.cells) {
            if (cell.text) {
              content.push(cell.text);
            }
          }
        }
      }
    }
    
    // Extrair texto de notas
    if (slide.notes) {
      content.push(slide.notes);
    }
    
    // Remover linhas vazias e fazer trim
    return content
      .filter(text => text.trim().length > 0)
      .map(text => text.trim());
   }

  /**
   * Processa e faz upload de imagens para S3
   * @param images Imagens do slide
   */
  private async processImages(images: any[]): Promise<PPTXImage[]> {
    const processedImages: PPTXImage[] = [];
    
    for (const image of images) {
      try {
        // Extrair dados da imagem
        const imageBuffer = image.buffer;
        const imageType = image.type || 'image/png';
        const fileName = `slide-image-${Date.now()}-${Math.random().toString(36).substring(7)}.${imageType.split('/')[1]}`;
        
        // Upload para S3
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: `slides/${fileName}`,
          Body: imageBuffer,
          ContentType: imageType,
          ACL: 'public-read'
        };
        
        await this.s3Client.send(new PutObjectCommand(uploadParams));
        
        // Criar URL pública
        const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/slides/${fileName}`;
        
        // Adicionar à lista de imagens processadas
        processedImages.push({
          url: imageUrl,
          width: image.width || 0,
          height: image.height || 0,
          position: {
            x: image.x || 0,
            y: image.y || 0
          }
        });
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        // Continuar com próxima imagem em caso de erro
      }
    }
    
    return processedImages;
   }

  /**
   * Salva os dados processados no banco
   * @param slides Slides processados
   */
  /**
   * Extrai informações detalhadas do layout do slide
   * @param slide Slide do PPTX
   */
  private extractLayout(slide: any): PPTXLayout {
    const layout: PPTXLayout = {
      name: slide.layout?.name || 'default',
      type: slide.layout?.type || 'standard',
      elements: []
    };

    // Processar elementos do slide
    if (slide.shapes) {
      for (const shape of slide.shapes) {
        layout.elements.push({
          type: shape.type || 'shape',
          x: shape.x || 0,
          y: shape.y || 0,
          width: shape.width || 0,
          height: shape.height || 0
        });
      }
    }

    // Processar elementos de texto
    if (slide.texts) {
      for (const text of slide.texts) {
        layout.elements.push({
          type: 'text',
          x: text.x || 0,
          y: text.y || 0,
          width: text.width || 0,
          height: text.height || 0
        });
      }
    }

    // Processar tabelas
    if (slide.tables) {
      for (const table of slide.tables) {
        layout.elements.push({
          type: 'table',
          x: table.x || 0,
          y: table.y || 0,
          width: table.width || 0,
          height: table.height || 0
        });
      }
    }

    return layout;
  }

  private async saveToDatabase(slides: PPTXSlide[]): Promise<void> {
    try {
      // Criar uma nova apresentação no banco
      const presentation = await this.prisma.presentation.create({
        data: {
          title: 'Apresentação PPTX',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'processed'
        }
      });

      // Salvar cada slide
      for (const slide of slides) {
        await this.prisma.slide.create({
          data: {
            presentationId: presentation.id,
            slideNumber: slide.slideNumber,
            title: slide.title,
            content: slide.content,
            notes: slide.notes,
            layout: slide.layout as any, // Converter para JSONB
            backgroundImage: slide.backgroundImage,
            images: {
              create: slide.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
                positionX: image.position.x,
                positionY: image.position.y
              }))
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      throw error;
    }
   }
}

// Exporta a classe para uso
export default PPTXProcessor;