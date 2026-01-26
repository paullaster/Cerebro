import { Worker } from 'bullmq';
import { Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
export class PdfGenerationWorker {
    configService;
    storageService;
    logger = new Logger(PdfGenerationWorker.name);
    worker;
    templateCache = new Map();
    constructor(configService, storageService) {
        this.configService = configService;
        this.storageService = storageService;
        this.registerHelpers();
    }
    registerHelpers() {
        handlebars.registerHelper('formatCurrency', (amount) => {
            return new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
            }).format(amount);
        });
        handlebars.registerHelper('formatDate', (date) => {
            return new Date(date).toLocaleDateString('en-KE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        });
    }
    async start() {
        this.worker = new Worker('pdf-generation', async (job) => {
            return await this.generatePdf(job.data);
        }, {
            connection: {
                url: this.configService.redisUrl,
            },
            concurrency: this.configService.pdfWorkerConcurrency || 2,
        });
        this.worker.on('completed', (job) => {
            this.logger.log(`PDF generated for job ${job.id}`);
        });
        this.worker.on('failed', (job, error) => {
            this.logger.error(`PDF generation failed for job ${job.id}:`, error);
        });
    }
    async generatePdf(data) {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            const html = this.renderTemplate(data.template, data.data);
            await page.setContent(html, { waitUntil: 'networkidle0' });
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
            const key = `documents/${data.type}/${Date.now()}-${data.data.id}.pdf`;
            const url = await this.storageService.upload(key, pdfBuffer);
            return { url, key };
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    renderTemplate(templateName, templateSource, data) {
        let compiledTemplate = this.templateCache.get(templateName);
        if (!compiledTemplate) {
            compiledTemplate = handlebars.compile(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
              body { 
                font-family: 'Inter', sans-serif; 
                margin: 0; 
                padding: 40px; 
                color: #1a1a1a;
                line-height: 1.6;
              }
              .header { 
                display: flex; 
                justify-content: space-between; 
                border-bottom: 2px solid #f0f0f0; 
                padding-bottom: 20px;
                margin-bottom: 40px;
              }
              .logo { font-size: 24px; font-weight: bold; color: #2e7d32; }
              .document-info { text-align: right; }
              .title { font-size: 28px; margin: 0 0 10px 0; color: #333; }
              .section { margin-bottom: 30px; }
              .section-title { 
                font-size: 14px; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
                color: #666; 
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
              }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
              th { font-weight: 700; color: #444; background-color: #fafafa; }
              .total-row { font-size: 18px; font-weight: bold; background-color: #f9f9f9; }
              .footer { 
                margin-top: 60px; 
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px; 
                color: #999; 
                text-align: center;
              }
              .qr-code { width: 100px; height: 100px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">AgriCollect</div>
              <div class="document-info">
                <div class="title">{{title}}</div>
                <div>ID: {{id}}</div>
                <div>Date: {{formatDate createdAt}}</div>
              </div>
            </div>
            <div class="content">
              ${templateSource}
            </div>
            <div class="footer">
              <p>This is an electronically generated document. No signature required.</p>
              <p>&copy; 2026 AgriCollect Ltd. All rights reserved.</p>
            </div>
          </body>
        </html>
      `);
            this.templateCache.set(templateName, compiledTemplate);
        }
        return compiledTemplate(data);
    }
    async stop() {
        if (this.worker) {
            await this.worker.close();
        }
    }
}
//# sourceMappingURL=pdf-generation.worker.js.map