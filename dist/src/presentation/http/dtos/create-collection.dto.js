var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsEnum, IsOptional, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export var CollectionGrade;
(function (CollectionGrade) {
    CollectionGrade["A"] = "A";
    CollectionGrade["B"] = "B";
    CollectionGrade["C"] = "C";
})(CollectionGrade || (CollectionGrade = {}));
export class CreateCollectionDto {
    farmerId;
    produceTypeId;
    weightKg;
    qualityGrade;
    notes;
}
__decorate([
    ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    IsUUID(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCollectionDto.prototype, "farmerId", void 0);
__decorate([
    ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    IsUUID(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreateCollectionDto.prototype, "produceTypeId", void 0);
__decorate([
    ApiProperty({ example: 150.5 }),
    IsNumber(),
    Min(0.1),
    __metadata("design:type", Number)
], CreateCollectionDto.prototype, "weightKg", void 0);
__decorate([
    ApiProperty({ enum: CollectionGrade, example: 'A' }),
    IsEnum(CollectionGrade),
    __metadata("design:type", String)
], CreateCollectionDto.prototype, "qualityGrade", void 0);
__decorate([
    ApiProperty({ required: false }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateCollectionDto.prototype, "notes", void 0);
//# sourceMappingURL=create-collection.dto.js.map