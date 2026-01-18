import { Injectable, Inject } from '@nestjs/common';
import { Worker } from 'bullmq';
import { Readable } from 'stream';
import { ILogger } from '../../domain/adapters/logger.service';
import { IStorageService } from '../../domain/adapters/storage.service';
import { IInvoiceRepository } from '../../domain/repositories/invoice.repository';
import { ICollectionRepository } from '../../domain/repositories/collection.repository';
import { ConfigService } from '../../config/config.service';
import { PDFDocument } from './pdf-document.service';

export interface PdfGenerationRequest {
    type: 'invoice' | 'receipt' | 'report' | 'certificate';
    template: string;
    data: any;
    options?: {
        format?: 'A4' | 'A3' | 'Letter' | 'Legal';
        margin?: { top: string; right: string; bottom: string; left: string };
        landscape?: boolean;
        header?: boolean;
        footer?: boolean;
        quality?: 'standard' | 'premium';
    };
}

export interface PdfGenerationResult {
    url: string;
    key: string;
    size: number;
    generatedAt: Date;
    metadata: Record<string, any>;
}

@Injectable()
export class PdfGenerationService {
    private worker: Worker;

    constructor(
        @Inject('ILogger') private readonly logger: ILogger,
        @Inject('IStorageService') private readonly storageService: IStorageService,
        @Inject('ICollectionRepository') private readonly collectionRepository: ICollectionRepository,
        private readonly configService: ConfigService,
        private readonly pdfDocument: PDFDocument,
    ) {
        this.setupWorker();
    }

    private setupWorker(): void {
        this.worker = new Worker(
            'pdf-generation',
            async (job) => {
                return await this.processJob(job);
            },
            {
                connection: {
                    url: this.configService.redisUrl,
                },
                concurrency: 2, // Limit due to Puppeteer memory
                limiter: {
                    max: 10,
                    duration: 1000, // 10 per second
                },
            }
        );

        this.worker.on('completed', (job) => {
            this.logger.info('PdfGenerationService', 'PDF generation completed', {
                jobId: job.id,
                type: job.data.type,
                duration: job.finishedOn - job.processedOn,
            });
        });

        this.worker.on('failed', (job, error) => {
            this.logger.error('PdfGenerationService', 'PDF generation failed', error, {
                jobId: job?.id,
                type: job?.data.type,
            });
        });
    }

    async generateInvoice(collectionId: string): Promise<PdfGenerationResult> {
        // Fetch full dependency chain
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) {
            throw new Error('Collection not found');
        }

        // In practice, fetch farmer, agent, produce details
        const invoiceData = {
            invoiceNumber: `INV-${collectionId.substring(0, 8).toUpperCase()}`,
            date: new Date().toISOString().split('T')[0],
            collection: {
                id: collection.getId().toString(),
                weight: collection.getWeightKg(),
                grade: collection.getQualityGrade(),
                rate: collection.getAppliedRate().getAmount(),
                amount: collection.getCalculatedPayoutAmount().getAmount(),
            },
            farmer: {
                name: 'John Doe', // Would come from farmer profile
                id: collection.getFarmerId().toString(),
                location: 'Nairobi, Kenya',
            },
            agent: {
                name: 'Jane Smith', // Would come from agent profile
                id: collection.getStoreAgentId().toString(),
                store: 'Central Collection Point',
            },
            qrCode: this.generateQRCode(collectionId),
        };

        const request: PdfGenerationRequest = {
            type: 'invoice',
            template: 'invoice-template',
            data: invoiceData,
            options: {
                format: 'A4',
                quality: 'premium',
                header: true,
                footer: true,
            },
        };

        return this.queueGeneration(request);
    }

    async generateReceipt(payoutId: string): Promise<PdfGenerationResult> {
        // Similar to invoice but for receipts
        const receiptData = {
            receiptNumber: `RCP-${payoutId.substring(0, 8).toUpperCase()}`,
            date: new Date().toISOString().split('T')[0],
            // ... receipt data
        };

        const request: PdfGenerationRequest = {
            type: 'receipt',
            template: 'receipt-template',
            data: receiptData,
            options: {
                format: 'A4',
                quality: 'premium',
            },
        };

        return this.queueGeneration(request);
    }

    async generateAnalyticsReport(params: {
        farmerId?: string;
        agentId?: string;
        dateRange: { start: Date; end: Date };
        reportType: 'summary' | 'detailed' | 'comparative';
    }): Promise<PdfGenerationResult> {
        // Generate comprehensive analytics report
        const reportData = await this.compileReportData(params);

        const request: PdfGenerationRequest = {
            type: 'report',
            template: 'analytics-report',
            data: reportData,
            options: {
                format: 'A3',
                landscape: true,
                quality: 'premium',
                margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
            },
        };

        return this.queueGeneration(request);
    }

    private async queueGeneration(request: PdfGenerationRequest): Promise<PdfGenerationResult> {
        const job = await this.worker.add(
            `generate-${request.type}`,
            request,
            {
                jobId: `${request.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: 100, // Keep last 100 jobs
                removeOnFail: 50, // Keep last 50 failed jobs
            }
        );

        // Wait for completion with timeout
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('PDF generation timeout'));
            }, 30000); // 30 second timeout

            this.worker.on('completed', (completedJob) => {
                if (completedJob.id === job.id) {
                    clearTimeout(timeout);
                    resolve(completedJob.returnvalue);
                }
            });

            this.worker.on('failed', (failedJob, error) => {
                if (failedJob.id === job.id) {
                    clearTimeout(timeout);
                    reject(error);
                }
            });
        });
    }

    private async processJob(job: any): Promise<PdfGenerationResult> {
        const { type, template, data, options } = job.data;

        this.logger.debug('PdfGenerationService', 'Processing PDF generation job', {
            jobId: job.id,
            type,
            template,
        });

        try {
            // Generate HTML from template
            const html = await this.renderTemplate(template, data);

            // Generate PDF
            const pdfBuffer = await this.pdfDocument.generate(html, options);

            // Upload to storage
            const key = `documents/${type}/${Date.now()}-${data.id || job.id}.pdf`;
            const result = await this.storageService.upload(key, pdfBuffer, {
                contentType: 'application/pdf',
                metadata: {
                    type,
                    template,
                    generatedAt: new Date().toISOString(),
                    jobId: job.id,
                },
            });

            return {
                url: result.url,
                key: result.key,
                size: pdfBuffer.length,
                generatedAt: new Date(),
                metadata: {
                    type,
                    template,
                    dataId: data.id,
                    options,
                },
            };
        } catch (error) {
            this.logger.error('PdfGenerationService', 'PDF generation failed in job', error, {
                jobId: job.id,
                type,
            });
            throw error;
        }
    }

    private async renderTemplate(templateName: string, data: any): Promise<string> {
        // Use a template engine like Handlebars, EJS, or custom
        // For this example, using a simple template system
        const templates = {
            'invoice-template': `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            /* Google-standard typography and design */
            :root {
              --primary-color: #1a73e8;
              --secondary-color: #34a853;
              --text-color: #202124;
              --border-color: #dadce0;
            }
            
            body {
              font-family: 'Google Sans', Roboto, Arial, sans-serif;
              color: var(--text-color);
              margin: 0;
              padding: 20px;
              line-height: 1.6;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid var(--primary-color);
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: var(--primary-color);
            }
            
            .invoice-title {
              font-size: 32px;
              font-weight: 300;
              color: var(--text-color);
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .detail-item {
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            
            .detail-label {
              font-size: 12px;
              color: #5f6368;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .detail-value {
              font-size: 16px;
              font-weight: 500;
              margin-top: 5px;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            
            .table th {
              background: #f8f9fa;
              padding: 12px;
              text-align: left;
              font-weight: 500;
              color: #5f6368;
              border-bottom: 1px solid var(--border-color);
            }
            
            .table td {
              padding: 12px;
              border-bottom: 1px solid var(--border-color);
            }
            
            .total {
              text-align: right;
              font-size: 18px;
              font-weight: 500;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid var(--border-color);
            }
            
            .qr-code {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid var(--border-color);
              font-size: 12px;
              color: #5f6368;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AgriCollect</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Invoice Number</div>
              <div class="detail-value">{{invoiceNumber}}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date</div>
              <div class="detail-value">{{date}}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Farmer</div>
              <div class="detail-value">{{farmer.name}}</div>
              <div class="detail-value">{{farmer.id}}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Collection Agent</div>
              <div class="detail-value">{{agent.name}}</div>
              <div class="detail-value">{{agent.store}}</div>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Produce Collection (Grade {{collection.grade}})</td>
                <td>{{collection.weight}} kg</td>
                <td>${{ collection.rate }}/kg</td>
                <td>${{ collection.amount }}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: ${{ collection.amount }}
          </div>
          
          <div class="qr-code">
            <p>Scan to verify this invoice</p>
            <img src="{{qrCode}}" alt="QR Code" width="150" height="150">
            <p>Invoice ID: {{collection.id}}</p>
          </div>
          
          <div class="footer">
            <p>This is an official document generated by AgriCollect System</p>
            <p>Generated on: ${new Date().toISOString()}</p>
          </div>
        </body>
        </html>
      `,
        };

        let templateHtml = templates[templateName];
        if (!templateHtml) {
            throw new Error(`Template not found: ${templateName}`);
        }

        // Simple templating (replace with Handlebars in production)
        Object.keys(data).forEach(key => {
            const value = typeof data[key] === 'object'
                ? JSON.stringify(data[key])
                : data[key];
            templateHtml = templateHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        return templateHtml;
    }

    private generateQRCode(data: string): string {
        // Generate QR code URL using a service
        // For production, use qrcode library
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
    }

    private async compileReportData(params: any): Promise<any> {
        // Complex data compilation for reports
        // This would aggregate data from multiple sources
        return {
            summary: await this.getSummaryData(params),
            trends: await this.getTrendData(params),
            comparisons: await this.getComparisonData(params),
            recommendations: await this.generateRecommendations(params),
        };
    }

    private async getSummaryData(params: any): Promise<any> {
        // Implementation for summary data
        return {};
    }

    private async getTrendData(params: any): Promise<any> {
        // Implementation for trend data
        return {};
    }

    private async getComparisonData(params: any): Promise<any> {
        // Implementation for comparison data
        return {};
    }

    private async generateRecommendations(params: any): Promise<any> {
        // AI/ML based recommendations
        return {};
    }
}