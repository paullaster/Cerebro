import { ApiProperty } from '@nestjs/swagger';

export class CollectionResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    farmerId: string;

    @ApiProperty()
    agentId: string;

    @ApiProperty()
    produceTypeId: string;

    @ApiProperty()
    weightKg: number;

    @ApiProperty()
    grade: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    payoutAmount: number;

    @ApiProperty()
    createdAt: string;

    static fromEntity(entity: any): CollectionResponseDto {
        // This is a mapper that would normally use a real entity type
        return {
            id: entity.id?.toString() || entity.id,
            farmerId: entity.farmerId?.toString() || entity.farmerId,
            agentId: entity.agentId?.toString() || entity.agentId,
            produceTypeId: entity.produceTypeId?.toString() || entity.produceTypeId,
            weightKg: Number(entity.weightKg),
            grade: entity.qualityGrade || entity.grade,
            status: entity.status,
            payoutAmount: Number(entity.calculatedPayoutAmount || 0),
            createdAt: entity.createdAt?.toISOString() || new Date().toISOString(),
        };
    }
}
