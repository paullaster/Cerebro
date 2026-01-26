import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }
    if (req.query) {
      req.query = this.sanitize(req.query);
    }
    if (req.params) {
      req.params = this.sanitize(req.params);
    }
    next();
  }

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      if (typeof data === 'string') {
        return sanitizeHtml(data, {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = this.sanitize(data[key]);
      }
    }
    return sanitized;
  }
}
