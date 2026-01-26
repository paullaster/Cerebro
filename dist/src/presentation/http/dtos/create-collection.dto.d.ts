export declare enum CollectionGrade {
    A = "A",
    B = "B",
    C = "C"
}
export declare class CreateCollectionDto {
    farmerId: string;
    produceTypeId: string;
    weightKg: number;
    qualityGrade: CollectionGrade;
    notes?: string;
}
