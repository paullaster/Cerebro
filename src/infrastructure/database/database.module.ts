import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service.ts';
import { PrismaCollectionRepository } from './repositories/prisma-collection.repository.ts';
import { PrismaWastageRecordRepository } from './repositories/prisma-wastage-record.repository.ts';
import { PrismaInvoiceRepository } from './repositories/prisma-invoice.repository.ts';

import { PrismaUserRepository } from './repositories/prisma-user.repository.ts';
import { PrismaFarmerRepository } from './repositories/prisma-farmer.repository.ts';
import { PrismaOtpVerificationRepository } from './repositories/prisma-otp-verification.repository.ts';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'ICollectionRepository',
      useClass: PrismaCollectionRepository,
    },
    {
      provide: 'IWastageRecordRepository',
      useClass: PrismaWastageRecordRepository,
    },
    {
      provide: 'IInvoiceRepository',
      useClass: PrismaInvoiceRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IFarmerRepository',
      useClass: PrismaFarmerRepository,
    },
    {
      provide: 'IOtpVerificationRepository',
      useClass: PrismaOtpVerificationRepository,
    },
  ],
  exports: [
    PrismaService,
    'ICollectionRepository',
    'IWastageRecordRepository',
    'IInvoiceRepository',
    'IUserRepository',
    'IFarmerRepository',
    'IOtpVerificationRepository',
  ],
})
export class DatabaseModule {}
