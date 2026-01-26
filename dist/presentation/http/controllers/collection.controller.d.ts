import { CreateCollectionUseCase } from '../../../application/use-cases/collection/create-collection.use-case';
import { VerifyCollectionUseCase } from '../../../application/use-cases/collection/verify-collection.use-case';
import { CreateCollectionDto } from '../dtos/create-collection.dto';
import { VerifyCollectionDto } from '../dtos/verify-collection.dto';
import { CollectionResponseDto } from '../dtos/collection-response.dto';
export declare class CollectionController {
    private readonly createCollectionUseCase;
    private readonly verifyCollectionUseCase;
    constructor(createCollectionUseCase: CreateCollectionUseCase, verifyCollectionUseCase: VerifyCollectionUseCase);
    createCollection(dto: CreateCollectionDto): Promise<{
        data: CollectionResponseDto;
    }>;
    verifyCollection(id: string, dto: VerifyCollectionDto): Promise<{
        data: CollectionResponseDto;
    }>;
    getCollections(farmerId?: string, agentId?: string, status?: string, startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        data: CollectionResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
