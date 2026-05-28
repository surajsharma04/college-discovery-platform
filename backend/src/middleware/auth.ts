import { NextFunction, Request, Response } from "express";
import { getSessionToken } from "../lib/cookies.js";
import { sendError } from "../lib/http.js";
import { getSessionUser } from "../lib/session.js";

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = getSessionToken(request);
  const session = await getSessionUser(token);

  if (!session) {
    sendError(request, response, 401, "Unauthorized.");
    return;
  }

  request.authUser = {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name
  };
  next();
}
