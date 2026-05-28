import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 7;
const rotationThresholdMs = 1000 * 60 * 60 * 24;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(48).toString("hex");
}

async function createSessionRecord(
  userId: string,
  rotatedFromId?: string,
  tx: typeof prisma | Prisma.TransactionClient = prisma
) {
  const token = generateToken();
  const session = await tx.userSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + sessionLifetimeMs),
      rotatedFromId
    }
  });

  return {
    rawToken: token,
    session
  };
}

export async function createSession(userId: string, rotatedFromId?: string) {
  return createSessionRecord(userId, rotatedFromId);
}

export async function revokeSession(rawToken: string | null | undefined) {
  if (!rawToken) {
    return;
  }

  await prisma.userSession.updateMany({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

export async function getSessionUser(rawToken: string | null | undefined) {
  if (!rawToken) {
    return null;
  }

  const session = await prisma.userSession.findUnique({
    where: {
      tokenHash: hashToken(rawToken)
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  await prisma.userSession.update({
    where: {
      id: session.id
    },
    data: {
      lastUsedAt: new Date()
    }
  });

  return session;
}

export async function rotateSessionIfNeeded(rawToken: string | null | undefined) {
  if (!rawToken) {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const now = Date.now();

  return prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    const current = await transaction.userSession.findUnique({
      where: {
        tokenHash
      }
    });

    if (!current || current.revokedAt || current.expiresAt.getTime() <= now) {
      return null;
    }

    const ageMs = now - current.createdAt.getTime();
    if (ageMs < rotationThresholdMs) {
      return null;
    }

    const revoked = await transaction.userSession.updateMany({
      where: {
        id: current.id,
        revokedAt: null
      },
      data: {
        revokedAt: new Date(now)
      }
    });

    if (revoked.count !== 1) {
      return null;
    }

    return createSessionRecord(current.userId, current.id, transaction);
  });
}
