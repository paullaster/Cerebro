import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VerificationAction {
  VERIFY = 'VERIFIED',
  REJECT = 'REJECTED',
  DISPUTE = 'DISPUTED',
}

export class VerifyCollectionDto {
  @ApiProperty({ enum: VerificationAction })
  @IsEnum(VerificationAction)
  @IsNotEmpty()
  status: VerificationAction;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Digital signature from OTP verification' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
