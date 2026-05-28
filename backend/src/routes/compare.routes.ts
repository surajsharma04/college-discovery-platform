import { Router } from "express";
import { z } from "zod";
import { getLocalCompareColleges, getLocalCompareOptions } from "../data/india-colleges.js";
import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const schema = z.object({
  collegeIds: z
    .array(z.string().min(1))
    .min(2)
    .max(3)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Please choose distinct colleges for comparison."
    })
});

router.get("/options", async (request, response) => {
  const query = (request.query.q as string | undefined)?.trim() ?? "";
  try {
    const colleges = await prisma.college.findMany({
      where: query
        ? {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive"
                }
              },
              {
                state: {
                  contains: query,
                  mode: "insensitive"
                }
              },
              {
                courses: {
                  some: {
                    name: {
                      contains: query,
                      mode: "insensitive"
                    }
                  }
                }
              }
            ]
          }
        : undefined,
      take: query ? 20 : 200,
      orderBy: [{ rating: "desc" }, { placementRate: "desc" }],
      select: {
        id: true,
        name: true,
        location: true,
        annualFees: true,
        placementRate: true,
        rating: true
      }
    });

    if (colleges.length > 0) {
      response.json({ colleges });
      return;
    }
  } catch {
    // Fall back to the local India dataset when Prisma is unavailable.
  }

  response.json({ colleges: getLocalCompareOptions(query) });
});

router.post("/", async (request, response) => {
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    sendError(request, response, 400, "Please select 2 to 3 colleges for comparison.");
    return;
  }

  try {
    const colleges = await prisma.college.findMany({
      where: { id: { in: parsed.data.collegeIds } },
      select: {
        id: true,
        name: true,
        location: true,
        annualFees: true,
        placementRate: true,
        rating: true
      }
    });

    if (colleges.length === parsed.data.collegeIds.length) {
      const collegeById = new Map(colleges.map((college: { id: string }) => [college.id, college]));

      response.json({
        colleges: parsed.data.collegeIds.map((id) => collegeById.get(id)).filter(Boolean)
      });
      return;
    }
  } catch {
    // Fall back to the local India dataset when Prisma is unavailable.
  }

  const colleges = getLocalCompareColleges(parsed.data.collegeIds);
  if (!colleges) {
    sendError(request, response, 400, "One or more selected colleges are invalid.");
    return;
  }

  response.json({ colleges });
});

export default router;
