import * as Sentry from "@sentry/nextjs";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (error instanceof AppError && error.isOperational) {
    console.error(`[${error.code}] ${error.message}`);
    return;
  }
  Sentry.captureException(error, { extra: context });
  console.error("Unexpected error:", error);
}

export const ErrorCodes = {
  TWILIO_INVALID_SIGNATURE: "TWILIO_INVALID_SIGNATURE",
  TWILIO_SEND_FAILED: "TWILIO_SEND_FAILED",
  STRIPE_INVALID_SIGNATURE: "STRIPE_INVALID_SIGNATURE",
  STRIPE_PAYMENT_FAILED: "STRIPE_PAYMENT_FAILED",
  CLAUDE_API_ERROR: "CLAUDE_API_ERROR",
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
