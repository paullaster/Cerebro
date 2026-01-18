import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CollectionGrade {
    A = 'A',
    B = 'B',
    C = 'C',
}

export class CreateCollectionDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    @IsNotEmpty()
    farmerId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    @IsNotEmpty()
    produceTypeId: string;

    @ApiProperty({ example: 150.5 })
    @IsNumber()
    @Min(0.1)
    weightKg: number;

    @ApiProperty({ enum: CollectionGrade, example: 'A' })
    @IsEnum(CollectionGrade)
    qualityGrade: CollectionGrade;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}
