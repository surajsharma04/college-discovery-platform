import type { Request, Response } from "express";

const sessionCookieName = "campus_compass_session";

function cookieSameSite() {
  return process.env.NODE_ENV === "production" ? "none" : "lax";
}

export function parseCookies(request: Request) {
  const rawCookie = request.headers.cookie;
  if (!rawCookie) {
    return {};
  }

  return rawCookie.split(";").reduce<Record<string, string>>((accumulator, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (!name) {
      return accumulator;
    }
    accumulator[name] = decodeURIComponent(valueParts.join("="));
    return accumulator;
  }, {});
}

export function getSessionToken(request: Request) {
  return parseCookies(request)[sessionCookieName] ?? null;
}

export function setSessionCookie(response: Response, token: string) {
  response.cookie(sessionCookieName, token, {
    httpOnly: true,
    sameSite: cookieSameSite(),
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/"
  });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: cookieSameSite(),
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}
