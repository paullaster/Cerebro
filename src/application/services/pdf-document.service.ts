import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ILogger } from '../../domain/adapters/logger.service';

@Injectable()
export class PDFDocument implements OnModuleDestroy {
  private browser: Browser | null = null;
  private browserPromise: Promise<Browser> | null = null;
  private readonly maxPages = 50; // Maximum pages before restart
  private pageCount = 0;

  constructor(@Inject('ILogger') private readonly logger: ILogger) {}

  async generate(
    html: string,
    options?: {
      format?: 'A4' | 'A3' | 'Letter' | 'Legal';
      margin?: { top: string; right: string; bottom: string; left: string };
      landscape?: boolean;
      header?: boolean;
      footer?: boolean;
      quality?: 'standard' | 'premium';
    },
  ): Promise<Buffer> {
    const startTime = Date.now();
    let page: Page | null = null;

    try {
      const browser = await this.getBrowser();

      // Create new page or reuse
      page = await browser.newPage();
      this.pageCount++;

      // Set content
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
        timeout: 30000,
      });

      // Wait for fonts and images to load
      await page.evaluateHandle('document.fonts.ready');
      await page.waitForFunction(
        () => {
          const images = Array.from(document.images);
          return images.every((img) => img.complete);
        },
        { timeout: 10000 },
      );

      // PDF generation options
      const pdfOptions: any = {
        format: options?.format || 'A4',
        margin: options?.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
        landscape: options?.landscape || false,
        preferCSSPageSize: true,
        timeout: 30000,
      };

      // Quality settings
      if (options?.quality === 'premium') {
        pdfOptions.scale = 1.5;
        pdfOptions.omitBackground = false;
      }

      // Generate PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      const duration = Date.now() - startTime;
      this.logger.debug('PDFDocument', 'PDF generated successfully', {
        duration,
        size: pdfBuffer.length,
        format: options?.format,
        quality: options?.quality,
      });

      // Restart browser if page count exceeds limit
      if (this.pageCount >= this.maxPages) {
        await this.restartBrowser();
      }

      return pdfBuffer;
    } catch (error) {
      this.logger.error('PDFDocument', 'PDF generation failed', error);

      // Attempt browser restart on error
      await this.restartBrowser();
      throw error;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.browserPromise) {
      return this.browserPromise;
    }

    this.browserPromise = this.launchBrowser();
    this.browser = await this.browserPromise;
    this.browserPromise = null;

    return this.browser;
  }

  private async launchBrowser(): Promise<Browser> {
    this.logger.info('PDFDocument', 'Launching Puppeteer browser');

    return puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--shm-size=2gb',
        '--single-process',
      ],
      timeout: 30000,
    });
  }

  private async restartBrowser(): Promise<void> {
    this.logger.info('PDFDocument', 'Restarting Puppeteer browser');

    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        this.logger.warn('PDFDocument', 'Error closing browser', error);
      }
      this.browser = null;
    }

    this.pageCount = 0;
    await this.getBrowser();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
