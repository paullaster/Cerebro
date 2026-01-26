import { ConfigService } from '../../config/config.service.ts';
import { IStorageService } from '../../domain/adapters/storage.service.ts';
export declare class PdfGenerationWorker {
    private readonly configService;
    private readonly storageService;
    private readonly logger;
    private worker;
    private templateCache;
    constructor(configService: ConfigService, storageService: IStorageService);
    private registerHelpers;
    start(): Promise<void>;
    private generatePdf;
    private renderTemplate;
    stop(): Promise<void>;
}
