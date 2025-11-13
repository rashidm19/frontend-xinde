export class UpstreamServiceError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? (status >= 500 ? 'Upstream service unavailable' : 'Upstream request failed'));
    this.status = status;
    this.name = 'UpstreamServiceError';
  }

  static fromStatus(status: number, message?: string) {
    return new UpstreamServiceError(status, message);
  }
}

export const isUpstreamServiceError = (error: unknown): error is UpstreamServiceError =>
  error instanceof UpstreamServiceError;
