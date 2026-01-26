import { ILogger } from '../../domain/adapters/logger.service.ts';
import { IStorageService } from '../../domain/adapters/storage.service.js';
import { ICollectionRepository } from '../../domain/repositories/collection.repository';
import { ConfigService } from '../../config/config.service';
import { PDFDocument } from './pdf-document.service';
export interface PdfGenerationRequest {
    type: 'invoice' | 'receipt' | 'report' | 'certificate';
    template: string;
    data: any;
    options?: {
        format?: 'A4' | 'A3' | 'Letter' | 'Legal';
        margin?: {
            top: string;
            right: string;
            bottom: string;
            left: string;
        };
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
export declare class PdfGenerationService {
    private readonly logger;
    private readonly storageService;
    private readonly collectionRepository;
    private readonly configService;
    private readonly pdfDocument;
    private worker;
    constructor(logger: ILogger, storageService: IStorageService, collectionRepository: ICollectionRepository, configService: ConfigService, pdfDocument: PDFDocument);
    private setupWorker;
    generateInvoice(collectionId: string): Promise<PdfGenerationResult>;
    generateReceipt(payoutId: string): Promise<PdfGenerationResult>;
    generateAnalyticsReport(params: {
        farmerId?: string;
        agentId?: string;
        dateRange: {
            start: Date;
            end: Date;
        };
        reportType: 'summary' | 'detailed' | 'comparative';
    }): Promise<PdfGenerationResult>;
    private queueGeneration;
    private processJob;
    private renderTemplate;
    private generateQRCode;
    private compileReportData;
    private getSummaryData;
    private getTrendData;
    private getComparisonData;
    private generateRecommendations;
}
