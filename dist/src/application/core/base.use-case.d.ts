import { ILogger } from '../../domain/adapters/logger.service.ts';
export declare abstract class BaseUseCase<Input, Output> {
    protected readonly logger: ILogger;
    constructor(logger: ILogger);
    abstract validate(input: Input): Promise<void>;
    abstract execute(input: Input): Promise<Output>;
    run(input: Input): Promise<Output>;
}
