import { OnModuleDestroy } from '@nestjs/common';
import { ILogger } from '../../domain/adapters/logger.service';
export declare class PDFDocument implements OnModuleDestroy {
    private readonly logger;
    private browser;
    private browserPromise;
    private readonly maxPages;
    private pageCount;
    constructor(logger: ILogger);
    generate(html: string, options?: {
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
    }): Promise<Buffer>;
    private getBrowser;
    private launchBrowser;
    private restartBrowser;
    onModuleDestroy(): Promise<void>;
}
