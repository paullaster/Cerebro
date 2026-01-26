import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../infrastructure/database/database.module';
import { CalculatePayoutUseCase } from '../../../application/use-cases/financial/calculate-payout.use-case';
import { ProcessPayoutUseCase } from '../../../application/use-cases/financial/process-payout.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [CalculatePayoutUseCase, ProcessPayoutUseCase],
})
export class FinancialModule {}
