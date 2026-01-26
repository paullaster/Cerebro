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
var _a;
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { ILogger } from '../../domain/adapters/logger.service';
let PDFDocument = class PDFDocument {
    logger;
    browser = null;
    browserPromise = null;
    maxPages = 50;
    pageCount = 0;
    constructor(logger) {
        this.logger = logger;
    }
    async generate(html, options) {
        const startTime = Date.now();
        let page = null;
        try {
            const browser = await this.getBrowser();
            page = await browser.newPage();
            this.pageCount++;
            await page.setContent(html, {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
                timeout: 30000,
            });
            await page.evaluateHandle('document.fonts.ready');
            await page.waitForFunction(() => {
                const images = Array.from(document.images);
                return images.every((img) => img.complete);
            }, { timeout: 10000 });
            const pdfOptions = {
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
            if (options?.quality === 'premium') {
                pdfOptions.scale = 1.5;
                pdfOptions.omitBackground = false;
            }
            const pdfBuffer = await page.pdf(pdfOptions);
            const duration = Date.now() - startTime;
            this.logger.debug('PDFDocument', 'PDF generated successfully', {
                duration,
                size: pdfBuffer.length,
                format: options?.format,
                quality: options?.quality,
            });
            if (this.pageCount >= this.maxPages) {
                await this.restartBrowser();
            }
            return pdfBuffer;
        }
        catch (error) {
            this.logger.error('PDFDocument', 'PDF generation failed', error);
            await this.restartBrowser();
            throw error;
        }
        finally {
            if (page) {
                await page.close().catch(() => { });
            }
        }
    }
    async getBrowser() {
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
    async launchBrowser() {
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
    async restartBrowser() {
        this.logger.info('PDFDocument', 'Restarting Puppeteer browser');
        if (this.browser) {
            try {
                await this.browser.close();
            }
            catch (error) {
                this.logger.warn('PDFDocument', 'Error closing browser', error);
            }
            this.browser = null;
        }
        this.pageCount = 0;
        await this.getBrowser();
    }
    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
        }
    }
};
PDFDocument = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger !== "undefined" && ILogger) === "function" ? _a : Object])
], PDFDocument);
export { PDFDocument };
//# sourceMappingURL=pdf-document.service.js.map