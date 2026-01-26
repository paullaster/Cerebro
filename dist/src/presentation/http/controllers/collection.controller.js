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
var _a, _b, _c, _d, _e, _f, _g;
import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, HttpStatus, HttpCode, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, } from '@nestjs/swagger';
import { CreateCollectionUseCase } from '../../../application/use-cases/collection/create-collection.use-case';
import { VerifyCollectionUseCase } from '../../../application/use-cases/collection/verify-collection.use-case';
import { JwtAuthGuard } from '../../middleware/guards/jwt-auth.guard';
import { RolesGuard } from '../../middleware/guards/roles.guard';
import { Roles } from '../../middleware/decorators/roles.decorator';
import { UserRole } from '../../../domain/entities/user.entity';
import { CreateCollectionDto } from '../dtos/create-collection.dto';
import { VerifyCollectionDto } from '../dtos/verify-collection.dto';
import { CollectionResponseDto } from '../dtos/collection-response.dto';
import { ApiResponseEnvelope } from '../decorators/api-response.decorator';
let CollectionController = class CollectionController {
    createCollectionUseCase;
    verifyCollectionUseCase;
    constructor(createCollectionUseCase, verifyCollectionUseCase) {
        this.createCollectionUseCase = createCollectionUseCase;
        this.verifyCollectionUseCase = verifyCollectionUseCase;
    }
    async createCollection(dto) {
        const collection = await this.createCollectionUseCase.execute(dto);
        return {
            data: CollectionResponseDto.fromEntity(collection),
        };
    }
    async verifyCollection(id, dto) {
        const collection = await this.verifyCollectionUseCase.execute({
            collectionId: id,
            ...dto,
        });
        return {
            data: CollectionResponseDto.fromEntity(collection),
        };
    }
    async getCollections(farmerId, agentId, status, startDate, endDate, page = '1', limit = '20') {
        return {
            data: [],
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                totalPages: 0,
            },
        };
    }
};
__decorate([
    Post(),
    Roles(UserRole.AGENT_COLLECTION),
    ApiOperation({ summary: 'Create a new collection' }),
    ApiResponse({ status: 201, description: 'Collection created successfully' }),
    ApiResponse({ status: 400, description: 'Invalid input data' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 409, description: 'Conflict with existing data' }),
    ApiResponseEnvelope(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof CreateCollectionDto !== "undefined" && CreateCollectionDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CollectionController.prototype, "createCollection", null);
__decorate([
    Put(':id/verify'),
    Roles(UserRole.AGENT_COLLECTION, UserRole.ADMIN),
    ApiOperation({ summary: 'Verify a collection' }),
    ApiParam({ name: 'id', description: 'Collection UUID' }),
    ApiResponse({ status: 200, description: 'Collection verified successfully' }),
    ApiResponse({ status: 404, description: 'Collection not found' }),
    ApiResponse({ status: 400, description: 'Invalid verification data' }),
    HttpCode(HttpStatus.OK),
    ApiResponseEnvelope(),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof VerifyCollectionDto !== "undefined" && VerifyCollectionDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], CollectionController.prototype, "verifyCollection", null);
__decorate([
    Get(),
    Roles(UserRole.ADMIN, UserRole.AGENT_COLLECTION, UserRole.AGENT_STORE, UserRole.FARMER),
    ApiOperation({ summary: 'Get collections with filters' }),
    ApiResponse({ status: 200, description: 'Collections retrieved' }),
    ApiResponseEnvelope(),
    __param(0, Query('farmerId')),
    __param(1, Query('agentId')),
    __param(2, Query('status')),
    __param(3, Query('startDate')),
    __param(4, Query('endDate')),
    __param(5, Query('page')),
    __param(6, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CollectionController.prototype, "getCollections", null);
CollectionController = __decorate([
    ApiTags('collections'),
    Controller('api/v1/collections'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof CreateCollectionUseCase !== "undefined" && CreateCollectionUseCase) === "function" ? _a : Object, typeof (_b = typeof VerifyCollectionUseCase !== "undefined" && VerifyCollectionUseCase) === "function" ? _b : Object])
], CollectionController);
export { CollectionController };
//# sourceMappingURL=collection.controller.js.map