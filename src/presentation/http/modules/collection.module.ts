import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../infrastructure/database/database.module';
import { CollectionController } from '../controllers/collection.controller';
import { CreateCollectionUseCase } from '../../../application/use-cases/collection/create-collection.use-case';
import { VerifyCollectionUseCase } from '../../../application/use-cases/collection/verify-collection.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionController],
  providers: [CreateCollectionUseCase, VerifyCollectionUseCase],
})
export class CollectionModule {}
