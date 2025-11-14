export type TelemetryConfig = {
  analyticsEnabled: boolean;
  posthogKey?: string;
  posthogHost?: string;
  otelEnabled: boolean;
  otelServiceName?: string;
  metricsEndpoint?: string;
  environment?: string;
};

export type TelemetryUser = {
  id?: string | number;
};

export type TelemetryTrackProperties = Record<string, unknown>;

export type BootstrapTelemetryParams = {
  config: TelemetryConfig;
  user?: TelemetryUser | null;
};
