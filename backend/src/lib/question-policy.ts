import { prisma } from "./prisma.js";

const cooldownMs = 60 * 1000;

export async function enforceQuestionCooldown(userId: string) {
  const latestQuestion = await prisma.question.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true }
  });

  if (!latestQuestion) {
    return null;
  }

  const elapsedMs = Date.now() - latestQuestion.createdAt.getTime();
  if (elapsedMs >= cooldownMs) {
    return null;
  }

  return {
    remainingSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000)
  };
}

export async function enforceAnswerCooldown(userId: string) {
  const latestAnswer = await prisma.answer.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true }
  });

  if (!latestAnswer) {
    return null;
  }

  const elapsedMs = Date.now() - latestAnswer.createdAt.getTime();
  if (elapsedMs >= cooldownMs) {
    return null;
  }

  return {
    remainingSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000)
  };
}
