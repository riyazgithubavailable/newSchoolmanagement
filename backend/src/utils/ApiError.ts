// Throw this anywhere in a route/service; errorHandler turns it into JSON.
// `code` is stable and meant for clients (web + Kotlin) to switch on.

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new ApiError(400, code, message, details);
  }
  static unauthorized(code = "UNAUTHORIZED", message = "Authentication required.") {
    return new ApiError(401, code, message);
  }
  static forbidden(code = "FORBIDDEN", message = "You don't have permission to do this.") {
    return new ApiError(403, code, message);
  }
  static notFound(code = "NOT_FOUND", message = "Resource not found.") {
    return new ApiError(404, code, message);
  }
  static conflict(code: string, message: string) {
    return new ApiError(409, code, message);
  }
}
