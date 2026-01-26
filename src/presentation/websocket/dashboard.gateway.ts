import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject } from '@nestjs/common';
import { WsAdminGuard } from '../middleware/guards/ws-admin.guard.ts';
import { ILogger } from '../../domain/adapters/logger.service.ts';
import { ICollectionRepository } from '../../domain/repositories/collection.repository.ts';
import { IMetricsService } from '../../domain/adapters/metrics.service.ts';

@WebSocketGateway({
  namespace: 'dashboard',
  cors: true,
  transports: ['websocket'], // Only websocket for dashboard (lower overhead)
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly updateIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('ICollectionRepository')
    private readonly collectionRepository: ICollectionRepository,
    @Inject('IMetricsService') private readonly metricsService: IMetricsService,
  ) {}

  afterInit(server: Server) {
    this.logger.info(
      'DashboardGateway',
      'Dashboard WebSocket Gateway initialized',
    );

    // Start broadcasting metrics
    this.startMetricsBroadcast();
  }

  async handleConnection(client: Socket) {
    try {
      const user = client.data.user;
      if (!user || user.role !== 'ADMIN') {
        client.disconnect();
        return;
      }

      client.join('admin:dashboard');

      // Send initial dashboard data
      const dashboardData = await this.getDashboardData();
      client.emit('dashboard:init', dashboardData);

      this.logger.info('DashboardGateway', 'Admin dashboard connected', {
        socketId: client.id,
        userId: user.id,
      });
    } catch (error) {
      this.logger.error('DashboardGateway', 'Connection error', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (userId) {
      this.logger.info('DashboardGateway', 'Admin dashboard disconnected', {
        socketId: client.id,
        userId,
      });
    }
  }

  @UseGuards(WsAdminGuard)
  @SubscribeMessage('dashboard:subscribe')
  async handleDashboardSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { metrics: string[]; interval?: number },
  ) {
    const interval = data.interval || 5000; // Default 5 seconds

    // Clear existing interval for this client
    const existingInterval = this.updateIntervals.get(client.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new interval
    const newInterval = setInterval(async () => {
      try {
        const metrics = await this.getRequestedMetrics(data.metrics);
        client.volatile.emit('dashboard:update', {
          timestamp: new Date().toISOString(),
          metrics,
        });
      } catch (error) {
        this.logger.error('DashboardGateway', 'Failed to fetch metrics', error);
      }
    }, interval);

    this.updateIntervals.set(client.id, newInterval);

    this.logger.debug('DashboardGateway', 'Dashboard subscription started', {
      socketId: client.id,
      metrics: data.metrics,
      interval,
    });
  }

  @SubscribeMessage('dashboard:unsubscribe')
  handleDashboardUnsubscribe(@ConnectedSocket() client: Socket) {
    const interval = this.updateIntervals.get(client.id);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(client.id);
    }

    this.logger.debug('DashboardGateway', 'Dashboard subscription stopped', {
      socketId: client.id,
    });
  }

  private async getDashboardData() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [dailySummary, topFarmers, topAgents, systemMetrics] =
      await Promise.all([
        this.collectionRepository.getDailySummary(today),
        this.collectionRepository.getTopFarmers(5, {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          end: now,
        }),
        this.collectionRepository.getTopAgents(5, {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        }),
        this.metricsService.getSystemMetrics(),
      ]);

    return {
      timestamp: now.toISOString(),
      daily: dailySummary,
      topFarmers,
      topAgents,
      system: systemMetrics,
    };
  }

  private async getRequestedMetrics(metrics: string[]) {
    const result: Record<string, any> = {};
    const now = new Date();

    for (const metric of metrics) {
      switch (metric) {
        case 'collections:realtime':
          const recent = await this.collectionRepository.listRecent(20);
          result[metric] = recent.map((col) => ({
            id: col.getId().toString(),
            farmerId: col.getFarmerId().toString(),
            amount: col.getCalculatedPayoutAmount().getAmount(),
            weight: col.getWeightKg(),
            grade: col.getQualityGrade(),
            status: col.getStatus(),
            collectedAt: col.getCollectedAt(),
          }));
          break;

        case 'transactions:volume':
          const hourStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
          );
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

          const count = await this.collectionRepository.countByStatus(
            'VERIFIED',
            {
              start: hourStart,
              end: hourEnd,
            },
          );

          result[metric] = {
            count,
            period: 'hourly',
            start: hourStart.toISOString(),
            end: hourEnd.toISOString(),
          };
          break;

        case 'system:health':
          result[metric] = await this.metricsService.getHealthStatus();
          break;

        case 'wastage:today':
          // Get today's wastage
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          // Implementation would use wastage repository
          result[metric] = {
            totalWeight: 0,
            count: 0,
            byReason: {},
          };
          break;
      }
    }

    return result;
  }

  private startMetricsBroadcast(): void {
    // Broadcast system-wide metrics every 30 seconds
    setInterval(async () => {
      try {
        const metrics = await this.metricsService.getAggregatedMetrics();
        this.server.to('admin:dashboard').volatile.emit('system:metrics', {
          timestamp: new Date().toISOString(),
          ...metrics,
        });
      } catch (error) {
        this.logger.error(
          'DashboardGateway',
          'Failed to broadcast metrics',
          error,
        );
      }
    }, 30000);
  }
}
