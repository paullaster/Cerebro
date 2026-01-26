export class BaseUseCase {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async run(input) {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(context, 'Use case execution failed', error, {
                duration,
                input,
            });
            throw error;
        }
    }
}
//# sourceMappingURL=base.use-case.js.map