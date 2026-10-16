/** Denúncia como o denunciante a vê (GET /reports/mine): sem dados de terceiros nem triagem interna. */
export type ReportView = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
};
