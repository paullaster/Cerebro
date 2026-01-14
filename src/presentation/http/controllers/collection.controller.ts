import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('collections')
@Controller('api/v1/collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollectionController {
    constructor(
        private readonly createCollectionUseCase: CreateCollectionUseCase,
        private readonly verifyCollectionUseCase: VerifyCollectionUseCase,
    ) { }

    @Post()
    @Roles(UserRole.AGENT)
    @ApiOperation({ summary: 'Create a new collection' })
    @ApiResponse({ status: 201, description: 'Collection created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Conflict with existing data' })
    @ApiResponseEnvelope()
    async createCollection(
        @Body() dto: CreateCollectionDto,
    ): Promise<{ data: CollectionResponseDto }> {
        const collection = await this.createCollectionUseCase.execute(dto);
        return {
            data: CollectionResponseDto.fromEntity(collection),
        };
    }

    @Put(':id/verify')
    @Roles(UserRole.AGENT, UserRole.ADMIN)
    @ApiOperation({ summary: 'Verify a collection' })
    @ApiParam({ name: 'id', description: 'Collection UUID' })
    @ApiResponse({ status: 200, description: 'Collection verified successfully' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    @ApiResponse({ status: 400, description: 'Invalid verification data' })
    @HttpCode(HttpStatus.OK)
    @ApiResponseEnvelope()
    async verifyCollection(
        @Param('id') id: string,
        @Body() dto: VerifyCollectionDto,
    ): Promise<{ data: CollectionResponseDto }> {
        const collection = await this.verifyCollectionUseCase.execute({
            collectionId: id,
            ...dto,
        });
        return {
            data: CollectionResponseDto.fromEntity(collection),
        };
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.FARMER)
    @ApiOperation({ summary: 'Get collections with filters' })
    @ApiResponse({ status: 200, description: 'Collections retrieved' })
    @ApiResponseEnvelope()
    async getCollections(
        @Query('farmerId') farmerId?: string,
        @Query('agentId') agentId?: string,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ): Promise<{
        data: CollectionResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        // Implementation for paginated collection retrieval
        // This would use a separate use case
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
}