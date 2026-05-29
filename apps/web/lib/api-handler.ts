import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, InternalServerError, ValidationError, ConflictError, NotFoundError } from "./errors";
import { rateLimiter } from "./rate-limiter";

type ApiResponsePayload = {
  success: boolean;
  data?: any;
  message?: string;
  [key: string]: any;
};

type ApiResponse = 
  | ApiResponsePayload 
  | { status: number; body: ApiResponsePayload }
  | NextResponse;

type ApiHandler = (
  request: NextRequest,
  context: any
) => Promise<ApiResponse> | ApiResponse;

/**
 * Helper to recursively search through an object and convert all BigInt values
 * into safe standard Javascript Numbers (or strings if they exceed Number.MAX_SAFE_INTEGER).
 * This prevents the JSON serializer from crashing when returning Prisma objects.
 */
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    // If it's safe to cast to standard Number, do it. Otherwise fallback to string.
    return obj <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(obj) : obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    // Handle Date object specifically
    if (obj instanceof Date) return obj;

    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

/**
 * Higher-Order Function (Wrapper) that intercepts incoming Next.js Route requests
 * to inject CORS, perform database-to-HTTP error mapping, rate-limiting, and serialize BigInt timestamps.
 */
export function withApiHandler(handler: ApiHandler) {
  return async (request: NextRequest, context: any) => {
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
        const serializedBody = serializeBigInt(result.body);
        response = NextResponse.json(serializedBody, { status: result.status });
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
    } catch (error: any) {
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
      // C. Prisma unique constraint violation (code P2002)
      else if (error.code === "P2002") {
        appError = new ConflictError("This record has already been saved and must be unique.");
      } 
      // D. Prisma record to update/delete not found (code P2025)
      else if (error.code === "P2025") {
        appError = new NotFoundError("Target record not found or you lack permission to manage it.");
      }
      // E. Database connection failures (codes P1001, P1002, P1008, etc.)
      else if (error.code && error.code.startsWith("P1")) {
        console.error("[DATABASE_CONNECTION_ERROR]:", {
          code: error.code,
          message: error.message,
        });
        appError = new InternalServerError("The database is currently unreachable. Please try again later.");
      }
      // F. Unhandled exceptions (Log internally to keep details secure)
      else {
        console.error("[SERVER_UNHANDLED_ERROR]:", {
          path: request.nextUrl.pathname,
          message: error.message,
          stack: error.stack,
        });
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
