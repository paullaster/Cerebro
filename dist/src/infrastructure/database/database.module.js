var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service.ts';
import { PrismaCollectionRepository } from './repositories/prisma-collection.repository.ts';
import { PrismaWastageRecordRepository } from './repositories/prisma-wastage-record.repository.ts';
import { PrismaInvoiceRepository } from './repositories/prisma-invoice.repository.ts';
import { PrismaUserRepository } from './repositories/prisma-user.repository.ts';
import { PrismaFarmerRepository } from './repositories/prisma-farmer.repository.ts';
import { PrismaOtpVerificationRepository } from './repositories/prisma-otp-verification.repository.ts';
let DatabaseModule = class DatabaseModule {
};
DatabaseModule = __decorate([
    Global(),
    Module({
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
], DatabaseModule);
export { DatabaseModule };
//# sourceMappingURL=database.module.js.map