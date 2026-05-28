import type { Request, Response } from "express";

export function sendError(
  request: Request,
  response: Response,
  status: number,
  message: string,
  extra?: Record<string, unknown>
) {
  response.status(status).json({
    message,
    requestId: request.requestId,
    ...extra
  });
}
