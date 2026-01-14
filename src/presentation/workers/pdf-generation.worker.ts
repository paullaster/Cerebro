import { Worker, Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { createTransport } from 'nodemailer';
import { ConfigService } from '../../config/config.service';
import { IStorageService } from '../../domain/adapters/storage.service';

export class PdfGenerationWorker {
    private readonly logger = new Logger(PdfGenerationWorker.name);
    private worker: Worker;

    constructor(
        private readonly configService: ConfigService,
        private readonly storageService: IStorageService,
    ) { }

    async start(): Promise<void> {
        this.worker = new Worker(
            'pdf-generation',
            async (job: Job) => {
                return await this.generatePdf(job.data);
            },
            {
                connection: {
                    url: this.configService.redisUrl,
                },
                concurrency: 2, // Limit concurrency due to Puppeteer memory usage
            },
        );

        this.worker.on('completed', (job: Job) => {
            this.logger.log(`PDF generated for job ${job.id}`);
        });

        this.worker.on('failed', (job: Job, error: Error) => {
            this.logger.error(`PDF generation failed for job ${job.id}:`, error);
        });
    }

    private async generatePdf(data: {
        type: 'invoice' | 'receipt' | 'report';
        template: string;
        data: any;
        options?: {
            format?: 'A4' | 'Letter';
            margin?: { top: string; right: string; bottom: string; left: string };
            landscape?: boolean;
        };
    }): Promise<{ url: string; key: string }> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();

            // Render HTML template
            const html = this.renderTemplate(data.template, data.data);

            await page.setContent(html, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: data.options?.format || 'A4',
                margin: data.options?.margin || {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm',
                },
                printBackground: true,
                landscape: data.options?.landscape || false,
            });

            // Upload to storage
            const key = `documents/${data.type}/${Date.now()}-${data.data.id}.pdf`;
            const url = await this.storageService.upload(key, pdfBuffer);

            return { url, key };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    private renderTemplate(template: string, data: any): string {
        // Implementation using a template engine like Handlebars
        // This is a simplified version
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { margin: 20px 0; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title || 'AgriCollect Document'}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${template}
          </div>
          <div class="footer">
            <p>This is an official document from AgriCollect</p>
            <p>Document ID: ${data.id}</p>
          </div>
        </body>
      </html>
    `;
    }

    async stop(): Promise<void> {
        if (this.worker) {
            await this.worker.close();
        }
    }
}