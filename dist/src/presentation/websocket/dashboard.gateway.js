var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject } from '@nestjs/common';
import { WsAdminGuard } from '../middleware/guards/ws-admin.guard.ts';
import { IMetricsService } from '../../domain/adapters/metrics.service.ts';
let DashboardGateway = class DashboardGateway {
    logger;
    collectionRepository;
    metricsService;
    server;
    updateIntervals = new Map();
    constructor(logger, collectionRepository, metricsService) {
        this.logger = logger;
        this.collectionRepository = collectionRepository;
        this.metricsService = metricsService;
    }
    afterInit(server) {
        this.logger.info('DashboardGateway', 'Dashboard WebSocket Gateway initialized');
        this.startMetricsBroadcast();
    }
    async handleConnection(client) {
        try {
            const user = client.data.user;
            if (!user || user.role !== 'ADMIN') {
                client.disconnect();
                return;
            }
            client.join('admin:dashboard');
            const dashboardData = await this.getDashboardData();
            client.emit('dashboard:init', dashboardData);
            this.logger.info('DashboardGateway', 'Admin dashboard connected', {
                socketId: client.id,
                userId: user.id,
            });
        }
        catch (error) {
            this.logger.error('DashboardGateway', 'Connection error', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.user?.id;
        if (userId) {
            this.logger.info('DashboardGateway', 'Admin dashboard disconnected', {
                socketId: client.id,
                userId,
            });
        }
    }
    async handleDashboardSubscribe(client, data) {
        const interval = data.interval || 5000;
        const existingInterval = this.updateIntervals.get(client.id);
        if (existingInterval) {
            clearInterval(existingInterval);
        }
        const newInterval = setInterval(async () => {
            try {
                const metrics = await this.getRequestedMetrics(data.metrics);
                client.volatile.emit('dashboard:update', {
                    timestamp: new Date().toISOString(),
                    metrics,
                });
            }
            catch (error) {
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
    handleDashboardUnsubscribe(client) {
        const interval = this.updateIntervals.get(client.id);
        if (interval) {
            clearInterval(interval);
            this.updateIntervals.delete(client.id);
        }
        this.logger.debug('DashboardGateway', 'Dashboard subscription stopped', {
            socketId: client.id,
        });
    }
    async getDashboardData() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [dailySummary, topFarmers, topAgents, systemMetrics] = await Promise.all([
            this.collectionRepository.getDailySummary(today),
            this.collectionRepository.getTopFarmers(5, {
                start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
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
    async getRequestedMetrics(metrics) {
        const result = {};
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
                    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
                    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
                    const count = await this.collectionRepository.countByStatus('VERIFIED', {
                        start: hourStart,
                        end: hourEnd,
                    });
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
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
    startMetricsBroadcast() {
        setInterval(async () => {
            try {
                const metrics = await this.metricsService.getAggregatedMetrics();
                this.server.to('admin:dashboard').volatile.emit('system:metrics', {
                    timestamp: new Date().toISOString(),
                    ...metrics,
                });
            }
            catch (error) {
                this.logger.error('DashboardGateway', 'Failed to broadcast metrics', error);
            }
        }, 30000);
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", typeof (_b = typeof Server !== "undefined" && Server) === "function" ? _b : Object)
], DashboardGateway.prototype, "server", void 0);
__decorate([
    UseGuards(WsAdminGuard),
    SubscribeMessage('dashboard:subscribe'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Socket !== "undefined" && Socket) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], DashboardGateway.prototype, "handleDashboardSubscribe", null);
__decorate([
    SubscribeMessage('dashboard:unsubscribe'),
    __param(0, ConnectedSocket()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof Socket !== "undefined" && Socket) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], DashboardGateway.prototype, "handleDashboardUnsubscribe", null);
DashboardGateway = __decorate([
    WebSocketGateway({
        namespace: 'dashboard',
        cors: true,
        transports: ['websocket'],
    }),
    __param(0, Inject('ILogger')),
    __param(1, Inject('ICollectionRepository')),
    __param(2, Inject('IMetricsService')),
    __metadata("design:paramtypes", [Object, Object, typeof (_a = typeof IMetricsService !== "undefined" && IMetricsService) === "function" ? _a : Object])
], DashboardGateway);
export { DashboardGateway };
//# sourceMappingURL=dashboard.gateway.js.map