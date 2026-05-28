import { type Request, Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { clearSessionCookie, getSessionToken, setSessionCookie } from "../lib/cookies.js";
import { sendError } from "../lib/http.js";
import {
  createSession,
  getSessionUser,
  revokeSession,
  rotateSessionIfNeeded
} from "../lib/session.js";
import { createRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/)
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

function getRequestTokens(request: Request) {
  const cookieToken = getSessionToken(request);
  return [...new Set([cookieToken].filter(Boolean))] as string[];
}

router.post("/register", createRateLimiter("register", 5, 10 * 60 * 1000), async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstMessage =
      fieldErrors.name?.[0] ??
      fieldErrors.email?.[0] ??
      fieldErrors.password?.[0] ??
      "Please provide a valid name, email, and a strong password.";
    sendError(request, response, 400, firstMessage);
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    sendError(request, response, 409, "Email is already registered.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10)
    }
  });

  const { rawToken } = await createSession(user.id);
  setSessionCookie(response, rawToken);

  response.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

router.post("/login", createRateLimiter("login", 8, 10 * 60 * 1000), async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Invalid login payload.");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() }
  });

  if (!user) {
    sendError(request, response, 401, "Invalid credentials.");
    return;
  }

  const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    sendError(request, response, 401, "Invalid credentials.");
    return;
  }

  const { rawToken } = await createSession(user.id);
  setSessionCookie(response, rawToken);

  response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

router.get("/me", async (request, response) => {
  const [token] = getRequestTokens(request);
  if (!token) {
    response.json({ user: null });
    return;
  }
  const session = await getSessionUser(token);
  if (!session) {
    response.json({ user: null });
    return;
  }

  const rotated = await rotateSessionIfNeeded(token);
  if (rotated) {
    setSessionCookie(response, rotated.rawToken);
  }

  const user = session.user;
  response.json({ user });
});

router.post("/logout", async (request, response) => {
  const tokens = getRequestTokens(request);
  await Promise.all(tokens.map((token) => revokeSession(token)));
  clearSessionCookie(response);
  response.json({ ok: true });
});

export default router;
