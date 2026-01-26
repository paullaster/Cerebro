export declare class CollectionResponseDto {
    id: string;
    farmerId: string;
    agentId: string;
    produceTypeId: string;
    weightKg: number;
    grade: string;
    status: string;
    payoutAmount: number;
    createdAt: string;
    static fromEntity(entity: any): CollectionResponseDto;
}
