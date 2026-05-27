# Global Error Handling Architecture

This document specifies the global error handling standards and implementations for the Next.js backend APIs. A robust, unified error handling system is essential for:
1. **Security**: Preventing raw system, database, or stack trace leaks to client applications.
2. **Developer Experience**: Providing consistent, parseable error responses.
3. **Auditability**: Logging errors server-side with structured metadata for diagnosis.

---

## 🛑 1. The Global Error Schema

All API error responses **MUST** return a standardized JSON structure with a `4xx` or `5xx` HTTP status code:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable description of what went wrong",
    "details": [] 
  }
}
```

* **`code`**: A snake_case uppercase string uniquely identifying the error class (e.g. `UNAUTHORIZED`, `VALIDATION_FAILED`).
* **`message`**: A generic, user-friendly error message. **Never** include database errors or internal details here.
* **`details`**: An optional array containing detailed validation issues (e.g., Zod error locations and fields).

---

## 🛠️ 2. Core Application Error Classes

We define a class-based error structure extending the native JavaScript `Error` class to carry HTTP metadata.

### The Base `AppError`
```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details: any[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Specialized Subclasses

| Error Class | HTTP Status | Error Code | Purpose |
|:---|:---|:---|:---|
| **`ValidationError`** | `400 Bad Request` | `VALIDATION_FAILED` | Input payload validation failed (e.g. Zod failures) |
| **`UnauthorizedError`**| `401 Unauthorized`| `UNAUTHORIZED` | Missing, invalid, or expired session cookies |
| **`ForbiddenError`** | `403 Forbidden` | `FORBIDDEN` | Authenticated but lacks ownership of the target resource |
| **`NotFoundError`** | `404 Not Found` | `NOT_FOUND` | Resource does not exist or user doesn't own it |
| **`ConflictError`** | `409 Conflict` | `CONFLICT` | Resource collision (e.g. duplicating unique credentials) |
| **`RateLimitError`** | `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Client has executed too many requests in a given window |
| **`InternalServerError`**| `500 Internal Error`| `INTERNAL_SERVER_ERROR`| Uncaught operational failures, database timeout, network issues |

---

## 🛡️ 3. Unified Error Interception Wrapper

To enforce this globally without repeating try/catch blocks in every API route, we implement a **Higher-Order Function (Wrapper)** for Next.js App Router API handlers.

### Wrapper Implementation Plan (`lib/api-handler.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";
import { ZodError } from "zod";

type ApiHandler = (
  request: NextRequest,
  context: any
) => Promise<NextResponse> | NextResponse;

export function withApiHandler(handler: ApiHandler) {
  return async (request: NextRequest, context: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      // 1. Handle Known Application Errors
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          },
          { status: error.statusCode }
        );
      }

      // 2. Handle Zod Schema Failures
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_FAILED",
              message: "Input validation failed. Please check details.",
              details,
            },
          },
          { status: 400 }
        );
      }

      // 3. Log Uncaught Server Failures (Exclude sensitive details in response)
      console.error("[SERVER_UNHANDLED_ERROR]:", {
        path: request.nextUrl.pathname,
        message: error.message,
        stack: error.stack,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred. Please try again later.",
          },
        },
        { status: 500 }
      );
    }
  };
}
```

---

## 📈 4. Database-to-HTTP Exception Mapping

Prisma operational throwables are mapped transparently by the error wrapper into user-friendly `AppError` models:

* **`P2002` (Unique Constraint Violation)**: Map directly to `ConflictError` (`409`). E.g., *"This link has already been saved."*
* **`P2025` (Record to update/delete not found)**: Map directly to `NotFoundError` (`404`). E.g., *"Target link not found or you do not have permission."*
* **`P1001` / `P1002` (Database not reachable)**: Log as high-severity alert, return `InternalServerError` (`500`) to visitor.
