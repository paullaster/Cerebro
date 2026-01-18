import { ILogger } from '../../domain/adapters/logger.service.ts';

export abstract class BaseUseCase<Input, Output> {
    protected readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    abstract validate(input: Input): Promise<void>;
    abstract execute(input: Input): Promise<Output>;

    async run(input: Input): Promise<Output> {
        const startTime = Date.now();
        const context = this.constructor.name;

        try {
            this.logger.debug(context, 'Starting use case execution', { input });

            await this.validate(input);

            const result = await this.execute(input);

            const duration = Date.now() - startTime;
            this.logger.info(context, 'Use case completed successfully', {
                duration,
                input,
            });

            return result;
        } catch (error: any) {
            const duration = Date.now() - startTime;
            this.logger.error(context, 'Use case execution failed', error, {
                duration,
                input,
            });

            throw error;
        }
    }
}