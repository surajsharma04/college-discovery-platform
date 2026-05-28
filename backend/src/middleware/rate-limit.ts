import { NextFunction, Request, Response } from "express";
import { sendError } from "../lib/http.js";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function keyForRequest(request: Request, namespace: string) {
  return `${namespace}:${request.ip ?? "unknown"}`;
}

export function createRateLimiter(namespace: string, limit: number, windowMs: number) {
  return function rateLimiter(request: Request, response: Response, next: NextFunction) {
    const key = keyForRequest(request, namespace);
    const currentTime = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= currentTime) {
      const nextBucket = {
        count: 1,
        resetAt: currentTime + windowMs
      };
      buckets.set(key, nextBucket);
      response.setHeader("x-ratelimit-limit", String(limit));
      response.setHeader("x-ratelimit-remaining", String(limit - nextBucket.count));
      response.setHeader("x-ratelimit-reset", String(Math.ceil(nextBucket.resetAt / 1000)));
      next();
      return;
    }

    if (current.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - currentTime) / 1000));
      response.setHeader("x-ratelimit-limit", String(limit));
      response.setHeader("x-ratelimit-remaining", "0");
      response.setHeader("x-ratelimit-reset", String(Math.ceil(current.resetAt / 1000)));
      response.setHeader("retry-after", String(retryAfterSeconds));
      sendError(request, response, 429, "Too many requests. Please wait before trying again.");
      return;
    }

    current.count += 1;
    response.setHeader("x-ratelimit-limit", String(limit));
    response.setHeader("x-ratelimit-remaining", String(Math.max(0, limit - current.count)));
    response.setHeader("x-ratelimit-reset", String(Math.ceil(current.resetAt / 1000)));
    next();
  };
}
