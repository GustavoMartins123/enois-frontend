import type { MonitoringCount } from "./monitoring-count";
import type { MonitoringEvent } from "./monitoring-event";
import type { MonitoringJvm } from "./monitoring-jvm";
import type { MonitoringMinutePoint } from "./monitoring-minute-point";

export type MonitoringOverview = {
  generatedAt: string;
  uptimeSeconds: number;
  requestsLastMinute: number;
  errors4xxLastMinute: number;
  errors5xxLastMinute: number;
  errorRate: number;
  p95Ms: number;
  droppedEvents: number;
  series: MonitoringMinutePoint[];
  levels24h: MonitoringCount[];
  types24h: MonitoringCount[];
  topRoutes: MonitoringCount[];
  recent: MonitoringEvent[];
  jvm: MonitoringJvm;
};
