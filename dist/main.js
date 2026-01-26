import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { setupGracefulShutdown } from './core/graceful-shutdown';
import { HttpExceptionFilter } from './presentation/http/filters/http-exception.filter';
import { TransformInterceptor } from './presentation/http/interceptors/transform.interceptor';
async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        bufferLogs: true,
        snapshot: true,
        abortOnError: false,
    });
    const configService = app.get(ConfigService);
    const helmet = await import('helmet');
    const compression = await import('compression');
    const rateLimit = await import('express-rate-limit');
    app.use(helmet.default({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://fonts.googleapis.com',
                ],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", 'https:', 'wss:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use(compression.default({
        level: 6,
        threshold: 100 * 1024,
    }));
    app.use(rateLimit.default({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            return req.ip === '127.0.0.1' || req.ip === '::1';
        },
    }));
    app.enableCors({
        origin: configService.frontendUrls,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-API-Key',
            'X-Request-ID',
        ],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
        maxAge: 86400,
    });
    app.setGlobalPrefix('api/v1', {
        exclude: ['health', 'metrics', 'docs'],
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        validationError: {
            target: false,
            value: false,
        },
    }));
    app.useGlobalFilters(new HttpExceptionFilter(app.get('ILogger')));
    app.useGlobalInterceptors(new TransformInterceptor());
    setupGracefulShutdown(app);
    const port = configService.port;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📊 Metrics available at: http://localhost:${port}/metrics`);
    logger.log(`📚 API Documentation at: http://localhost:${port}/docs`);
    if (cluster.worker) {
        logger.log(`🔄 Worker ${process.pid} started`);
    }
}
if (import.meta.main) {
    const configService = new ConfigService();
    if (configService.clusterEnabled && cluster.isPrimary) {
        const workersCount = configService.workersCount === 'auto'
            ? availableParallelism()
            : configService.workersCount;
        const logger = new Logger('Cluster');
        logger.log(`🎯 Primary process ${process.pid} is running`);
        logger.log(`👥 Forking ${workersCount} workers...`);
        cluster.setupPrimary({
            exec: import.meta.url,
            args: process.argv.slice(2),
            silent: false,
        });
        for (let i = 0; i < workersCount; i++) {
            cluster.fork();
        }
        cluster.on('fork', (worker) => {
            logger.log(`✅ Worker ${worker.process.pid} forked`);
        });
        cluster.on('exit', (worker, code, signal) => {
            logger.error(`💥 Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
            const restartDelay = Math.min(1000 * Math.pow(2, worker.restartCount || 0), 30000);
            setTimeout(() => {
                logger.log(`🔄 Restarting worker...`);
                const newWorker = cluster.fork();
                newWorker.restartCount = (worker.restartCount || 0) + 1;
            }, restartDelay);
        });
        process.on('SIGINT', () => {
            logger.log('🛑 Received SIGINT, shutting down cluster...');
            for (const id in cluster.workers) {
                cluster.workers[id].kill('SIGTERM');
            }
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            logger.log('🛑 Received SIGTERM, shutting down cluster...');
            for (const id in cluster.workers) {
                cluster.workers[id].kill('SIGTERM');
            }
            process.exit(0);
        });
    }
    else {
        bootstrap().catch((error) => {
            console.error('❌ Failed to bootstrap application:', error);
            process.exit(1);
        });
    }
}
//# sourceMappingURL=main.js.map