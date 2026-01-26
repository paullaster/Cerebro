import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ILogger } from '../../domain/adapters/logger.service.ts';
import { ICollectionRepository } from '../../domain/repositories/collection.repository.ts';
import { IMetricsService } from '../../domain/adapters/metrics.service.ts';
export declare class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    private readonly collectionRepository;
    private readonly metricsService;
    server: Server;
    private readonly updateIntervals;
    constructor(logger: ILogger, collectionRepository: ICollectionRepository, metricsService: IMetricsService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): any;
    handleDisconnect(client: Socket): void;
    handleDashboardSubscribe(client: Socket, data: {
        metrics: string[];
        interval?: number;
    }): any;
    handleDashboardUnsubscribe(client: Socket): void;
    private getDashboardData;
    private getRequestedMetrics;
    private startMetricsBroadcast;
}
