import { NextFunction, Request, Response } from "express";

type RequestWithContext = Request & {
  requestId?: string;
};

export function attachRequestContext(
  request: RequestWithContext,
  response: Response,
  next: NextFunction
) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      JSON.stringify({
        requestId,
        userId: request.authUser?.userId ?? null,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs
      })
    );
  });

  next();
}
