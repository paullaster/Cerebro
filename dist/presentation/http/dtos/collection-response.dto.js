var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
export class CollectionResponseDto {
    id;
    farmerId;
    agentId;
    produceTypeId;
    weightKg;
    grade;
    status;
    payoutAmount;
    createdAt;
    static fromEntity(entity) {
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
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "farmerId", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "agentId", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "produceTypeId", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Number)
], CollectionResponseDto.prototype, "weightKg", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "grade", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "status", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", Number)
], CollectionResponseDto.prototype, "payoutAmount", void 0);
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], CollectionResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=collection-response.dto.js.map