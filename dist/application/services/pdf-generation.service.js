var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
import { Injectable, Inject } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ILogger } from '../../domain/adapters/logger.service';
import { IStorageService } from '../../domain/adapters/storage.service';
import { ICollectionRepository } from '../../domain/repositories/collection.repository';
import { ConfigService } from '../../config/config.service';
import { PDFDocument } from './pdf-document.service';
let PdfGenerationService = class PdfGenerationService {
    logger;
    storageService;
    collectionRepository;
    configService;
    pdfDocument;
    worker;
    constructor(logger, storageService, collectionRepository, configService, pdfDocument) {
        this.logger = logger;
        this.storageService = storageService;
        this.collectionRepository = collectionRepository;
        this.configService = configService;
        this.pdfDocument = pdfDocument;
        this.setupWorker();
    }
    setupWorker() {
        this.worker = new Worker('pdf-generation', async (job) => {
            return await this.processJob(job);
        }, {
            connection: {
                url: this.configService.redisUrl,
            },
            concurrency: 2,
            limiter: {
                max: 10,
                duration: 1000,
            },
        });
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
    async generateInvoice(collectionId) {
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) {
            throw new Error('Collection not found');
        }
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
                name: 'John Doe',
                id: collection.getFarmerId().toString(),
                location: 'Nairobi, Kenya',
            },
            agent: {
                name: 'Jane Smith',
                id: collection.getStoreAgentId().toString(),
                store: 'Central Collection Point',
            },
            qrCode: this.generateQRCode(collectionId),
        };
        const request = {
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
    async generateReceipt(payoutId) {
        const receiptData = {
            receiptNumber: `RCP-${payoutId.substring(0, 8).toUpperCase()}`,
            date: new Date().toISOString().split('T')[0],
        };
        const request = {
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
    async generateAnalyticsReport(params) {
        const reportData = await this.compileReportData(params);
        const request = {
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
    async queueGeneration(request) {
        const job = await this.worker.add(`generate-${request.type}`, request, {
            jobId: `${request.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 50,
        });
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('PDF generation timeout'));
            }, 30000);
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
    async processJob(job) {
        const { type, template, data, options } = job.data;
        this.logger.debug('PdfGenerationService', 'Processing PDF generation job', {
            jobId: job.id,
            type,
            template,
        });
        try {
            const html = await this.renderTemplate(template, data);
            const pdfBuffer = await this.pdfDocument.generate(html, options);
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
        }
        catch (error) {
            this.logger.error('PdfGenerationService', 'PDF generation failed in job', error, {
                jobId: job.id,
                type,
            });
            throw error;
        }
    }
    async renderTemplate(templateName, data) {
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
                <td>\${{ collection.rate }}/kg</td>
                <td>\${{ collection.amount }}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: \${{ collection.amount }}
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
        Object.keys(data).forEach((key) => {
            const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
            templateHtml = templateHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return templateHtml;
    }
    generateQRCode(data) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
    }
    async compileReportData(params) {
        return {
            summary: await this.getSummaryData(params),
            trends: await this.getTrendData(params),
            comparisons: await this.getComparisonData(params),
            recommendations: await this.generateRecommendations(params),
        };
    }
    async getSummaryData(params) {
        return {};
    }
    async getTrendData(params) {
        return {};
    }
    async getComparisonData(params) {
        return {};
    }
    async generateRecommendations(params) {
        return {};
    }
};
PdfGenerationService = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IStorageService')),
    __param(2, Inject('ICollectionRepository')),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger !== "undefined" && ILogger) === "function" ? _a : Object, typeof (_b = typeof IStorageService !== "undefined" && IStorageService) === "function" ? _b : Object, typeof (_c = typeof ICollectionRepository !== "undefined" && ICollectionRepository) === "function" ? _c : Object, typeof (_d = typeof ConfigService !== "undefined" && ConfigService) === "function" ? _d : Object, typeof (_e = typeof PDFDocument !== "undefined" && PDFDocument) === "function" ? _e : Object])
], PdfGenerationService);
export { PdfGenerationService };
//# sourceMappingURL=pdf-generation.service.js.map