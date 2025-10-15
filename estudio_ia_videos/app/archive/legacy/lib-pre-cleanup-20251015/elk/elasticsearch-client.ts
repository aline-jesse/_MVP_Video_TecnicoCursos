
/**
 * SPRINT 34 - ELASTICSEARCH CLIENT
 * Client for direct Elasticsearch operations
 */

export interface ElasticsearchQuery {
  index: string;
  query: any;
  size?: number;
  from?: number;
  sort?: any[];
  aggs?: any;
}

export interface ElasticsearchResponse {
  hits: {
    total: { value: number };
    hits: Array<{
      _id: string;
      _source: any;
      _score: number;
    }>;
  };
  aggregations?: any;
}

class ElasticsearchClient {
  private baseUrl: string;
  private username?: string;
  private password?: string;

  constructor() {
    this.baseUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    this.username = process.env.ELASTICSEARCH_USERNAME;
    this.password = process.env.ELASTICSEARCH_PASSWORD;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.username && this.password) {
      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    return headers;
  }

  async search(params: ElasticsearchQuery): Promise<ElasticsearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${params.index}/_search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: params.query,
          size: params.size || 10,
          from: params.from || 0,
          sort: params.sort,
          aggs: params.aggs,
        }),
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      throw error;
    }
  }

  async count(index: string, query: any): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/${index}/_count`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch count failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Elasticsearch count error:', error);
      throw error;
    }
  }

  async getLogsByService(
    service: string,
    startDate: Date,
    endDate: Date,
    level?: string
  ): Promise<any[]> {
    const query: any = {
      bool: {
        must: [
          { match: { service } },
          {
            range: {
              timestamp: {
                gte: startDate.toISOString(),
                lte: endDate.toISOString(),
              },
            },
          },
        ],
      },
    };

    if (level) {
      query.bool.must.push({ match: { level } });
    }

    const result = await this.search({
      index: 'logs-*',
      query,
      size: 100,
      sort: [{ timestamp: { order: 'desc' } }],
    });

    return result.hits.hits.map((hit) => hit._source);
  }

  async getErrorLogs(hours: number = 24): Promise<any[]> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const endDate = new Date();

    const query = {
      bool: {
        must: [
          {
            bool: {
              should: [{ match: { level: 'error' } }, { match: { level: 'fatal' } }],
            },
          },
          {
            range: {
              timestamp: {
                gte: startDate.toISOString(),
                lte: endDate.toISOString(),
              },
            },
          },
        ],
      },
    };

    const result = await this.search({
      index: 'logs-*',
      query,
      size: 100,
      sort: [{ timestamp: { order: 'desc' } }],
    });

    return result.hits.hits.map((hit) => hit._source);
  }

  async getPerformanceMetrics(hours: number = 1): Promise<any> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const endDate = new Date();

    const query = {
      bool: {
        must: [
          { exists: { field: 'metadata.responseTime' } },
          {
            range: {
              timestamp: {
                gte: startDate.toISOString(),
                lte: endDate.toISOString(),
              },
            },
          },
        ],
      },
    };

    const result = await this.search({
      index: 'logs-*',
      query,
      size: 0,
      aggs: {
        avg_response_time: {
          avg: { field: 'metadata.responseTime' },
        },
        max_response_time: {
          max: { field: 'metadata.responseTime' },
        },
        percentiles: {
          percentiles: {
            field: 'metadata.responseTime',
            percents: [50, 95, 99],
          },
        },
        requests_by_endpoint: {
          terms: {
            field: 'metadata.endpoint.keyword',
            size: 10,
          },
        },
      },
    });

    return result.aggregations;
  }
}

// Global singleton
let elasticsearchClient: ElasticsearchClient | null = null;

export function getElasticsearchClient(): ElasticsearchClient {
  if (!elasticsearchClient) {
    elasticsearchClient = new ElasticsearchClient();
  }
  return elasticsearchClient;
}
