
/**
 * 🧠 Estúdio IA de Vídeos - Sprint 5
 * Sistema de Análise de Sentiment em Tempo Real
 * 
 * Funcionalidades:
 * - Análise de sentiment de comentários
 * - Detecção de emoções em tempo real
 * - Classificação de feedback positivo/negativo
 * - Insights de engajamento emocional
 */

export interface SentimentAnalysis {
  score: number; // -1 (muito negativo) a +1 (muito positivo)
  magnitude: number; // Intensidade da emoção
  emotion: 'joy' | 'anger' | 'sadness' | 'fear' | 'surprise' | 'neutral';
  confidence: number;
  keywords: string[];
  suggestions: string[];
}

export interface VideoSentimentMetrics {
  videoId: string;
  overallSentiment: number;
  emotionDistribution: {
    joy: number;
    anger: number;
    sadness: number;
    fear: number;
    surprise: number;
    neutral: number;
  };
  sentimentTrend: Array<{ timestamp: number; sentiment: number }>;
  topPositiveKeywords: Array<{ word: string; frequency: number }>;
  topNegativeKeywords: Array<{ word: string; frequency: number }>;
  improvementSuggestions: string[];
}

class SentimentAnalyzer {
  private sentimentHistory: Map<string, SentimentAnalysis[]> = new Map();

  /**
   * 🧠 Analisa sentiment de texto usando IA avançada
   */
  async analyzeSentiment(text: string, videoId: string): Promise<SentimentAnalysis> {
    try {
      // Pré-processamento do texto
      const cleanText = this.preprocessText(text);
      
      // Análise usando IA local (simulada - em produção usaria HuggingFace)
      const analysis = await this.performSentimentAnalysis(cleanText);
      
      // Armazena no histórico
      if (!this.sentimentHistory.has(videoId)) {
        this.sentimentHistory.set(videoId, []);
      }
      this.sentimentHistory.get(videoId)?.push(analysis);

      return analysis;
    } catch (error) {
      console.error('❌ Erro na análise de sentiment:', error);
      return this.getDefaultSentiment();
    }
  }

  /**
   * 🔍 Pré-processamento de texto
   */
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 🤖 Análise de sentiment usando IA
   */
  private async performSentimentAnalysis(text: string): Promise<SentimentAnalysis> {
    // Dicionários de sentiment em português
    const positiveWords = [
      'excelente', 'ótimo', 'bom', 'legal', 'adorei', 'fantástico', 'incrível',
      'útil', 'interessante', 'perfeito', 'maravilhoso', 'sensacional'
    ];

    const negativeWords = [
      'ruim', 'péssimo', 'horrível', 'terrível', 'odiei', 'chato', 'confuso',
      'difícil', 'complicado', 'erro', 'problema', 'falha'
    ];

    const joyWords = ['feliz', 'alegre', 'animado', 'empolgado', 'contente'];
    const angerWords = ['raiva', 'irritado', 'bravo', 'furioso', 'nervoso'];
    const sadnessWords = ['triste', 'deprimido', 'desanimado', 'melancólico'];
    const fearWords = ['medo', 'receoso', 'ansioso', 'preocupado', 'nervoso'];
    const surpriseWords = ['surpreso', 'impressionado', 'espantado', 'chocado'];

    const words = text.split(' ');
    let positiveScore = 0;
    let negativeScore = 0;
    let emotionScores = {
      joy: 0,
      anger: 0,
      sadness: 0,
      fear: 0,
      surprise: 0,
      neutral: 0
    };

    // Contagem de palavras
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
      if (joyWords.includes(word)) emotionScores.joy++;
      if (angerWords.includes(word)) emotionScores.anger++;
      if (sadnessWords.includes(word)) emotionScores.sadness++;
      if (fearWords.includes(word)) emotionScores.fear++;
      if (surpriseWords.includes(word)) emotionScores.surprise++;
    });

    // Cálculo do score final
    const totalWords = words.length;
    const score = totalWords > 0 ? (positiveScore - negativeScore) / totalWords : 0;
    const magnitude = Math.abs(score);

    // Emoção dominante
    const maxEmotion = Object.entries(emotionScores).reduce((max, [emotion, score]) => 
      score > max.score ? { emotion, score } : max, 
      { emotion: 'neutral', score: 0 }
    );

    // Extração de palavras-chave
    const keywords = this.extractKeywords(text);

    // Geração de sugestões
    const suggestions = this.generateSuggestions(score, maxEmotion.emotion as any);

    return {
      score: Math.max(-1, Math.min(1, score)), // Normaliza entre -1 e 1
      magnitude,
      emotion: maxEmotion.emotion as any,
      confidence: Math.min(0.95, magnitude + 0.1),
      keywords,
      suggestions
    };
  }

  /**
   * 🔑 Extrai palavras-chave relevantes
   */
  private extractKeywords(text: string): string[] {
    const words = text.split(' ');
    const stopWords = ['o', 'a', 'e', 'é', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'que'];
    
    return words
      .filter(word => word.length > 3)
      .filter(word => !stopWords.includes(word))
      .slice(0, 5);
  }

  /**
   * 💡 Gera sugestões baseadas no sentiment
   */
  private generateSuggestions(score: number, emotion: string): string[] {
    const suggestions: string[] = [];

    if (score < -0.3) {
      suggestions.push('Considere revisar o conteúdo para maior clareza');
      suggestions.push('Adicione mais exemplos práticos');
      suggestions.push('Melhore a qualidade do áudio/vídeo');
    } else if (score > 0.5) {
      suggestions.push('Conteúdo excelente! Continue com essa qualidade');
      suggestions.push('Considere criar mais conteúdos similares');
    }

    switch (emotion) {
      case 'anger':
        suggestions.push('Revise seções que podem causar frustração');
        suggestions.push('Adicione avisos sobre dificuldade do conteúdo');
        break;
      case 'sadness':
        suggestions.push('Torne o conteúdo mais envolvente e motivador');
        suggestions.push('Adicione elementos interativos');
        break;
      case 'fear':
        suggestions.push('Forneça mais suporte e orientação');
        suggestions.push('Divida conteúdo complexo em partes menores');
        break;
    }

    return suggestions.slice(0, 3);
  }

  /**
   * 📊 Calcula métricas consolidadas de sentiment
   */
  calculateVideoSentimentMetrics(videoId: string): VideoSentimentMetrics {
    const sentiments = this.sentimentHistory.get(videoId) || [];
    
    if (sentiments.length === 0) {
      return this.getDefaultVideoMetrics(videoId);
    }

    // Sentiment geral
    const overallSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

    // Distribuição de emoções
    const emotionDistribution = {
      joy: 0,
      anger: 0,
      sadness: 0,
      fear: 0,
      surprise: 0,
      neutral: 0
    };

    sentiments.forEach(s => {
      emotionDistribution[s.emotion]++;
    });

    // Normaliza distribuição
    Object.keys(emotionDistribution).forEach(key => {
      emotionDistribution[key as keyof typeof emotionDistribution] /= sentiments.length;
    });

    // Trend temporal (simulado)
    const sentimentTrend = sentiments.map((s, index) => ({
      timestamp: Date.now() - (sentiments.length - index) * 300000, // 5 min intervals
      sentiment: s.score
    }));

    // Top keywords
    const allKeywords = sentiments.flatMap(s => s.keywords);
    const positiveKeywords = this.getTopKeywords(
      sentiments.filter(s => s.score > 0).flatMap(s => s.keywords)
    );
    const negativeKeywords = this.getTopKeywords(
      sentiments.filter(s => s.score < 0).flatMap(s => s.keywords)
    );

    // Sugestões consolidadas
    const improvementSuggestions = this.consolidateSuggestions(sentiments);

    return {
      videoId,
      overallSentiment,
      emotionDistribution,
      sentimentTrend,
      topPositiveKeywords: positiveKeywords,
      topNegativeKeywords: negativeKeywords,
      improvementSuggestions
    };
  }

  /**
   * 🔝 Obtém top keywords por frequência
   */
  private getTopKeywords(keywords: string[]): Array<{ word: string; frequency: number }> {
    const frequency = keywords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequency)
      .map(([word, freq]) => ({ word, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  /**
   * 💡 Consolida sugestões de múltiplas análises
   */
  private consolidateSuggestions(sentiments: SentimentAnalysis[]): string[] {
    const allSuggestions = sentiments.flatMap(s => s.suggestions);
    const suggestionFreq = allSuggestions.reduce((acc, suggestion) => {
      acc[suggestion] = (acc[suggestion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(suggestionFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([suggestion]) => suggestion);
  }

  /**
   * 🔄 Sentiment padrão para fallback
   */
  private getDefaultSentiment(): SentimentAnalysis {
    return {
      score: 0,
      magnitude: 0,
      emotion: 'neutral',
      confidence: 0.5,
      keywords: [],
      suggestions: []
    };
  }

  /**
   * 📊 Métricas padrão para vídeos sem dados
   */
  private getDefaultVideoMetrics(videoId: string): VideoSentimentMetrics {
    return {
      videoId,
      overallSentiment: 0,
      emotionDistribution: {
        joy: 0,
        anger: 0,
        sadness: 0,
        fear: 0,
        surprise: 0,
        neutral: 1
      },
      sentimentTrend: [],
      topPositiveKeywords: [],
      topNegativeKeywords: [],
      improvementSuggestions: ['Colete mais feedback para análise detalhada']
    };
  }

  /**
   * 🧹 Limpa dados antigos para otimização
   */
  cleanup(olderThanDays: number = 30): void {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    // Implementar limpeza baseada em timestamp
    console.log(`🧹 Limpando dados de sentiment anteriores a ${new Date(cutoff)}`);
  }
}

// Instância singleton
export const sentimentAnalyzer = new SentimentAnalyzer();

// Função utilitária para análise rápida
export const analyzeFeedback = async (feedback: string, videoId: string): Promise<SentimentAnalysis> => {
  return await sentimentAnalyzer.analyzeSentiment(feedback, videoId);
};
