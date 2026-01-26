var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
let SanitizationMiddleware = class SanitizationMiddleware {
    use(req, res, next) {
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
    sanitize(data) {
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
        const sanitized = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitized[key] = this.sanitize(data[key]);
            }
        }
        return sanitized;
    }
};
SanitizationMiddleware = __decorate([
    Injectable()
], SanitizationMiddleware);
export { SanitizationMiddleware };
//# sourceMappingURL=sanitization.middleware.js.map