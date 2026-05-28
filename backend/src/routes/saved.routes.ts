import { Router } from "express";
import { z } from "zod";
import { sendError } from "../lib/http.js";
import { moderationMessage } from "../lib/moderation.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const saveCollegeSchema = z.object({
  collegeId: z.string().min(1)
});

const saveComparisonSchema = z.object({
  name: z.string().trim().max(80).optional(),
  collegeIds: z
    .array(z.string().min(1))
    .min(2)
    .max(3)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Please choose distinct colleges for a saved comparison."
    })
});

router.get("/colleges", requireAuth, async (request, response) => {
  const saved = await prisma.savedCollege.findMany({
    where: {
      userId: request.authUser!.userId
    },
    include: {
      college: {
        select: {
          id: true,
          name: true,
          location: true,
          annualFees: true,
          rating: true,
          placementRate: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  response.json({
    colleges: saved.map((item: (typeof saved)[number]) => item.college)
  });
});

router.post("/colleges", requireAuth, async (request, response) => {
  const parsed = saveCollegeSchema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Invalid payload.");
    return;
  }

  const college = await prisma.college.findUnique({
    where: { id: parsed.data.collegeId },
    select: { id: true }
  });
  if (!college) {
    sendError(request, response, 404, "College not found.");
    return;
  }

  await prisma.savedCollege.upsert({
    where: {
      userId_collegeId: {
        userId: request.authUser!.userId,
        collegeId: parsed.data.collegeId
      }
    },
    update: {},
    create: {
      userId: request.authUser!.userId,
      collegeId: parsed.data.collegeId
    }
  });

  response.json({ ok: true });
});

router.delete("/colleges/:collegeId", requireAuth, async (request, response) => {
  await prisma.savedCollege.deleteMany({
    where: {
      userId: request.authUser!.userId,
      collegeId: request.params.collegeId
    }
  });

  response.json({ ok: true });
});

router.get("/comparisons", requireAuth, async (request, response) => {
  const savedComparisons = await prisma.savedComparison.findMany({
    where: {
      userId: request.authUser!.userId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const allCollegeIds = [
    ...new Set(savedComparisons.flatMap((entry: (typeof savedComparisons)[number]) => entry.collegeIds))
  ];
  const colleges = await prisma.college.findMany({
    where: {
      id: {
        in: allCollegeIds
      }
    },
    select: {
      id: true,
      name: true,
      location: true,
      annualFees: true,
      rating: true,
      placementRate: true
    }
  });
  const collegeById = new Map(colleges.map((college: (typeof colleges)[number]) => [college.id, college]));

  type SavedComparisonCollege = (typeof colleges)[number];

  const comparisons = savedComparisons.map((entry: (typeof savedComparisons)[number]) => ({
    id: entry.id,
    name: entry.name,
    createdAt: entry.createdAt,
    colleges: entry.collegeIds
      .map((id: string) => collegeById.get(id))
      .filter((college: SavedComparisonCollege | undefined): college is SavedComparisonCollege =>
        Boolean(college)
      )
  }));

  response.json({ comparisons });
});

router.post("/comparisons", requireAuth, async (request, response) => {
  const parsed = saveComparisonSchema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Invalid comparison payload.");
    return;
  }

  if (parsed.data.name) {
    const moderationIssue = moderationMessage(parsed.data.name);
    if (moderationIssue) {
      sendError(request, response, 400, moderationIssue);
      return;
    }
  }

  const colleges = await prisma.college.findMany({
    where: { id: { in: parsed.data.collegeIds } },
    select: { id: true }
  });
  if (colleges.length !== parsed.data.collegeIds.length) {
    sendError(request, response, 400, "One or more selected colleges are invalid.");
    return;
  }

  const comparison = await prisma.savedComparison.create({
    data: {
      userId: request.authUser!.userId,
      name: parsed.data.name,
      collegeIds: parsed.data.collegeIds
    }
  });

  response.status(201).json({ comparison });
});

router.delete("/comparisons/:id", requireAuth, async (request, response) => {
  await prisma.savedComparison.deleteMany({
    where: {
      id: request.params.id,
      userId: request.authUser!.userId
    }
  });

  response.json({ ok: true });
});

export default router;
