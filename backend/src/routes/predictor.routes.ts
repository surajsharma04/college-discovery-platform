import { Router } from "express";
import { z } from "zod";
import { getLocalPredictorMatches } from "../data/india-colleges.js";
import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const schema = z.object({
  exam: z.string().trim().min(2),
  rank: z.coerce.number().int().positive().max(2000000)
});

router.post("/", async (request, response) => {
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Invalid predictor input.");
    return;
  }

  const exam = parsed.data.exam.toUpperCase();
  const rank = parsed.data.rank;

  try {
    const qualifyingCutoffs = await prisma.collegeCutoff.findMany({
      where: {
        exam: {
          equals: exam,
          mode: "insensitive"
        },
        maxRank: {
          gte: rank
        }
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
      orderBy: [{ maxRank: "asc" }, { college: { rating: "desc" } }]
    });

    if (qualifyingCutoffs.length > 0) {
      response.json({
        exam,
        rank,
        colleges: qualifyingCutoffs.map((cutoff: (typeof qualifyingCutoffs)[number]) => ({
          ...cutoff.college,
          qualifyingRank: cutoff.maxRank,
          matchedExam: cutoff.exam,
          cutoffBand: cutoff.scoreBand,
          confidence:
            rank <= cutoff.maxRank * 0.65
              ? "safe"
              : rank <= cutoff.maxRank * 0.9
                ? "target"
                : "ambitious",
          explanation: `Matched on ${cutoff.exam} because your rank ${rank} is within the cutoff threshold ${cutoff.maxRank} (${cutoff.scoreBand}).`
        }))
      });
      return;
    }
  } catch {
    // Fall back to the local India dataset when Prisma is unavailable.
  }

  response.json({
    exam,
    rank,
    colleges: getLocalPredictorMatches(exam, rank)
  });
});

export default router;
