import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, InternalServerError, ValidationError, ConflictError, NotFoundError, type ErrorDetail } from "./errors";
import { rateLimiter } from "./rate-limiter";

type ApiResponsePayload = {
  success: boolean;
  data?: unknown;
  message?: string;
  [key: string]: unknown;
};

type ApiResponse =
  | ApiResponsePayload
  | { status: number; body: ApiResponsePayload }
  | NextResponse;

// Removed non-generic ApiHandler to allow flexible context parameters for route handlers

/**
 * Detects whether an unknown value is an object containing a string `code` property (Prisma-style error).
 *
 * @returns `true` if `error` is a non-null object with a string `code` property, `false` otherwise.
 */
function isPrismaError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}

/**
 * Recursively converts `bigint` values into JSON-safe primitives.
 *
 * Accepts any value and returns an equivalent value where:
 * - `bigint` is converted to a `number` when its magnitude is <= `Number.MAX_SAFE_INTEGER`, otherwise to a `string`.
 * - Arrays and plain objects have their elements/properties processed recursively.
 * - `Date` instances are returned unchanged.
 * - `null` and `undefined` are returned as-is.
 *
 * @param obj - The value to serialize for JSON compatibility
 * @returns The input value with all `bigint` occurrences replaced by `number` or `string`, preserving other values
 */
export function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    // Cast to Number when safe; fall back to string for values exceeding MAX_SAFE_INTEGER.
    return obj <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(obj) : obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    if (obj instanceof Date) return obj;

    const serialized: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      serialized[key] = serializeBigInt((obj as Record<string, unknown>)[key]);
    }
    return serialized;
  }

  return obj;
}

/**
 * Wraps a Next.js route handler to apply dynamic CORS, centralized rate limiting,
 * BigInt-safe serialization, and centralized error mapping from database/validation errors to HTTP responses.
 *
 * @param handler - The route handler to invoke. It receives the incoming `NextRequest` and a typed `context` and may return a `NextResponse`, an object with `{ status, body }`, or a payload object.
 * @returns A function accepting `(request, context)` that executes the handler and returns a normalized `NextResponse` with applied CORS and rate-limit headers, automatic `OPTIONS` preflight handling, and mapped error responses (including `429` for rate limits and mapped status codes for validation/Prisma errors).
 */
export function withApiHandler<T>(
  handler: (request: NextRequest, context: T) => Promise<ApiResponse> | ApiResponse
) {
  return async (request: NextRequest, context: T) => {
    // 1. DYNAMIC CORS HANDLING
    // We dynamically verify the incoming request origin to prevent cross-origin bottlenecks.
    const origin = request.headers.get("origin");
    const isAllowedOrigin = origin && (
      origin.startsWith("chrome-extension://") ||
      origin === process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development" && origin.startsWith("http://localhost:")) ||
      /https?:\/\/(www\.)?(linkedin\.com|instagram\.com|x\.com|twitter\.com|facebook\.com|reddit\.com|threads\.net)/.test(origin)
    );

    const corsHeaders: Record<string, string> = {};
    if (isAllowedOrigin) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Access-Control-Allow-Credentials"] = "true";
      corsHeaders["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS";
      corsHeaders["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Cookie";
    }

    // Handle OPTIONS Preflight request automatically
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 2. CENTRALIZED RATE LIMIT CHECK
    // Runs at edge entry point to protect authentication, database operations, and server load.
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const tier = request.method === "GET" ? "read" : "write";
    const rate = await rateLimiter.check(ip, tier);

    const rateLimitHeaders: Record<string, string> = {
      "X-RateLimit-Limit": rate.limit.toString(),
      "X-RateLimit-Remaining": rate.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rate.reset / 1000).toString(),
    };

    // Combine CORS and Rate Limit headers
    const combinedHeaders = {
      ...corsHeaders,
      ...rateLimitHeaders,
    };

    if (!rate.success) {
      const resetSeconds = Math.ceil((rate.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many requests. Please slow down and try again in ${resetSeconds} seconds.`,
          },
        },
        {
          status: 429,
          headers: combinedHeaders,
        }
      );
    }

    try {
      // 3. RUN DELEGATED HANDLER
      const result = await handler(request, context);

      let response: NextResponse;

      // A. If the handler returned a native NextResponse, use it directly
      if (result instanceof NextResponse) {
        response = result;
      }
      // B. If the handler returned an custom status/body object, process and serialize it
      else if (result && typeof result === "object" && "status" in result && "body" in result) {
        const statusObj = result as { status: number; body: unknown };
        const serializedBody = serializeBigInt(statusObj.body);
        response = NextResponse.json(serializedBody, { status: statusObj.status });
      }
      // C. Otherwise, assume it returned a success payload and serialize with default 200 status
      else {
        const serializedBody = serializeBigInt(result);
        response = NextResponse.json(serializedBody);
      }

      // Append combined headers (CORS + Rate Limits) to successful response
      for (const [key, value] of Object.entries(combinedHeaders)) {
        response.headers.set(key, value);
      }

      return response;
    } catch (error: unknown) {
      // 4. EXCEPTION HANDLING & DATABASE-TO-HTTP ERROR MAPPING
      let appError: AppError;

      // A. Known AppError subclasses (ValidationError, UnauthorizedError, etc.)
      if (error instanceof AppError) {
        appError = error;
      }
      // B. Zod schema validation errors
      else if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        appError = new ValidationError("Input validation failed. Please check details.", details);
      }
      // C–E. Prisma error codes — narrow with type guard before accessing `.code`
      else if (isPrismaError(error)) {
        if (error.code === "P2002") {
          // Unique constraint violation
          appError = new ConflictError("This record has already been saved and must be unique.");
        } else if (error.code === "P2025") {
          // Record not found during update/delete
          appError = new NotFoundError("Target record not found or you lack permission to manage it.");
        } else if (error.code.startsWith("P1")) {
          // Database connection failures (P1001, P1002, P1008, etc.)
          console.error("[DATABASE_CONNECTION_ERROR]:", {
            code: error.code,
            message: error.message,
          });
          appError = new InternalServerError("The database is currently unreachable. Please try again later.");
        } else {
          console.error("[SERVER_UNHANDLED_ERROR]:", { path: request.nextUrl.pathname, error });
          appError = new InternalServerError("An unexpected internal server error occurred.");
        }
      }
      // F. Unhandled exceptions — log internally to avoid leaking details
      else {
        console.error("[SERVER_UNHANDLED_ERROR]:", { path: request.nextUrl.pathname, error });
        appError = new InternalServerError("An unexpected internal server error occurred.");
      }

      // Build safe JSON error payload
      const errorPayload = {
        success: false,
        error: {
          code: appError.code,
          message: appError.message,
          details: appError.details,
        },
      };

      const errorResponse = NextResponse.json(errorPayload, {
        status: appError.statusCode,
      });

      // Append CORS and Rate Limit headers to error response
      for (const [key, value] of Object.entries(combinedHeaders)) {
        errorResponse.headers.set(key, value);
      }

      return errorResponse;
    }
  };
}
