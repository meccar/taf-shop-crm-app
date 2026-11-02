export interface WorkspaceSettings {
  tenantId: string;
  organizationName: string;
  primaryContactEmail: string;
  clusterRegion: string;
  defaultTaxRate: number;
  defaultLowStockThreshold: number;
  posAutoSyncEnabled: boolean;
  enforceUniqueSkuPerStore: boolean;
  updatedAt: string;
}
