var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export var VerificationAction;
(function (VerificationAction) {
    VerificationAction["VERIFY"] = "VERIFIED";
    VerificationAction["REJECT"] = "REJECTED";
    VerificationAction["DISPUTE"] = "DISPUTED";
})(VerificationAction || (VerificationAction = {}));
export class VerifyCollectionDto {
    status;
    notes;
    signature;
}
__decorate([
    ApiProperty({ enum: VerificationAction }),
    IsEnum(VerificationAction),
    IsNotEmpty(),
    __metadata("design:type", String)
], VerifyCollectionDto.prototype, "status", void 0);
__decorate([
    ApiProperty({ required: false }),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], VerifyCollectionDto.prototype, "notes", void 0);
__decorate([
    ApiProperty({ description: 'Digital signature from OTP verification' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], VerifyCollectionDto.prototype, "signature", void 0);
//# sourceMappingURL=verify-collection.dto.js.map