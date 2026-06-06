/** Structured detail attached to validation errors (matches Zod issue shape). */
export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details: ErrorDetail[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: ErrorDetail[] = []) {
    super("VALIDATION_FAILED", 400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized. Please sign in.") {
    super("UNAUTHORIZED", 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied. You do not own this resource.") {
    super("FORBIDDEN", 403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found.") {
    super("NOT_FOUND", 404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", 409, message);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please slow down.") {
    super("RATE_LIMIT_EXCEEDED", 429, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "An unexpected error occurred.") {
    super("INTERNAL_SERVER_ERROR", 500, message);
  }
}
