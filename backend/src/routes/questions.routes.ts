import { Prisma } from "@prisma/client";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { sendError } from "../lib/http.js";
import { moderationMessage } from "../lib/moderation.js";
import {
  enforceAnswerCooldown,
  enforceQuestionCooldown
} from "../lib/question-policy.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

const questionSchema = z.object({
  title: z.string().trim().min(5).max(140),
  body: z.string().trim().min(12).max(2000)
});

const answerSchema = z.object({
  body: z.string().trim().min(6).max(1500)
});

function rejectModeration(request: Request, text: string, response: Response) {
  const issue = moderationMessage(text);
  if (!issue) {
    return false;
  }

  sendError(request, response, 400, issue);
  return true;
}

router.get("/", async (_request, response) => {
  const questions = await prisma.question.findMany({
    where: {
      deletedAt: null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      answers: {
        where: {
          deletedAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  response.json({ questions });
});

router.post(
  "/",
  requireAuth,
  createRateLimiter("questions-create", 5, 10 * 60 * 1000),
  async (request, response) => {
    const parsed = questionSchema.safeParse(request.body);
    if (!parsed.success) {
      sendError(request, response, 400, "Invalid question payload.");
      return;
    }

    if (
      rejectModeration(request, parsed.data.title, response) ||
      rejectModeration(request, parsed.data.body, response)
    ) {
      return;
    }

    const cooldown = await enforceQuestionCooldown(request.authUser!.userId);
    if (cooldown) {
      sendError(
        request,
        response,
        429,
        `Please wait ${cooldown.remainingSeconds}s before posting another question.`
      );
      return;
    }

    const question = await prisma.question.create({
      data: {
        userId: request.authUser!.userId,
        title: parsed.data.title,
        body: parsed.data.body
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    response.status(201).json({ question });
  }
);

router.patch("/:id", requireAuth, async (request, response) => {
  const parsed = questionSchema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Invalid question payload.");
    return;
  }

  if (
    rejectModeration(request, parsed.data.title, response) ||
    rejectModeration(request, parsed.data.body, response)
  ) {
    return;
  }

  const existing = await prisma.question.findUnique({
    where: { id: request.params.id },
    select: { userId: true, title: true, body: true, deletedAt: true }
  });

  if (!existing || existing.deletedAt) {
    sendError(request, response, 404, "Question not found.");
    return;
  }

  if (existing.userId !== request.authUser!.userId) {
    sendError(request, response, 403, "You can only edit your own question.");
    return;
  }

  const question = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    await transaction.questionRevision.create({
      data: {
        questionId: request.params.id,
        title: existing.title,
        body: existing.body
      }
    });

    return transaction.question.update({
      where: { id: request.params.id },
      data: {
        title: parsed.data.title,
        body: parsed.data.body
      }
    });
  });

  response.json({ question });
});

router.delete("/:id", requireAuth, async (request, response) => {
  const existing = await prisma.question.findUnique({
    where: { id: request.params.id },
    select: { userId: true, deletedAt: true }
  });

  if (!existing || existing.deletedAt) {
    sendError(request, response, 404, "Question not found.");
    return;
  }

  if (existing.userId !== request.authUser!.userId) {
    sendError(request, response, 403, "You can only delete your own question.");
    return;
  }

  await prisma.question.update({
    where: { id: request.params.id },
    data: {
      deletedAt: new Date()
    }
  });

  response.json({ ok: true });
});

router.post(
  "/:id/answers",
  requireAuth,
  createRateLimiter("answers-create", 8, 10 * 60 * 1000),
  async (request, response) => {
    const parsed = answerSchema.safeParse(request.body);
    if (!parsed.success) {
      sendError(request, response, 400, "Invalid answer payload.");
      return;
    }

    if (rejectModeration(request, parsed.data.body, response)) {
      return;
    }

    const cooldown = await enforceAnswerCooldown(request.authUser!.userId);
    if (cooldown) {
      sendError(
        request,
        response,
        429,
        `Please wait ${cooldown.remainingSeconds}s before posting another answer.`
      );
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: request.params.id },
      select: { id: true, deletedAt: true }
    });
    if (!question || question.deletedAt) {
      sendError(request, response, 404, "Question not found.");
      return;
    }

    const answer = await prisma.answer.create({
      data: {
        questionId: request.params.id,
        userId: request.authUser!.userId,
        body: parsed.data.body
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    response.status(201).json({ answer });
  }
);

router.patch("/answers/:answerId", requireAuth, async (request, response) => {
  const parsed = answerSchema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Invalid answer payload.");
    return;
  }

  if (rejectModeration(request, parsed.data.body, response)) {
    return;
  }

  const existing = await prisma.answer.findUnique({
    where: { id: request.params.answerId },
    select: { userId: true, body: true, deletedAt: true }
  });

  if (!existing || existing.deletedAt) {
    sendError(request, response, 404, "Answer not found.");
    return;
  }

  if (existing.userId !== request.authUser!.userId) {
    sendError(request, response, 403, "You can only edit your own answer.");
    return;
  }

  const answer = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    await transaction.answerRevision.create({
      data: {
        answerId: request.params.answerId,
        body: existing.body
      }
    });

    return transaction.answer.update({
      where: { id: request.params.answerId },
      data: { body: parsed.data.body }
    });
  });

  response.json({ answer });
});

router.delete("/answers/:answerId", requireAuth, async (request, response) => {
  const existing = await prisma.answer.findUnique({
    where: { id: request.params.answerId },
    select: { userId: true, deletedAt: true }
  });

  if (!existing || existing.deletedAt) {
    sendError(request, response, 404, "Answer not found.");
    return;
  }

  if (existing.userId !== request.authUser!.userId) {
    sendError(request, response, 403, "You can only delete your own answer.");
    return;
  }

  await prisma.answer.update({
    where: { id: request.params.answerId },
    data: {
      deletedAt: new Date()
    }
  });

  response.json({ ok: true });
});

export default router;
