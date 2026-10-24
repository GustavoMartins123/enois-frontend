export type MonitoringMinutePoint = {
  minute: string;
  requests: number;
  errors4xx: number;
  errors5xx: number;
  p95Ms: number;
};
