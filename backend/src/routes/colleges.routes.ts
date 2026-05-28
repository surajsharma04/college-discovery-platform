import { Router } from "express";
import { getLocalCollegeById, getLocalCollegesCatalog } from "../data/india-colleges.js";
import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

router.get("/", async (request, response) => {
  const search = (request.query.search as string | undefined)?.trim() ?? "";
  const location = (request.query.location as string | undefined)?.trim() ?? "";
  const course = (request.query.course as string | undefined)?.trim() ?? "";
  const sort = (request.query.sort as string | undefined)?.trim() ?? "rating-desc";
  const maxFeesRaw = request.query.maxFees as string | undefined;
  const minRatingRaw = request.query.minRating as string | undefined;
  const minPlacementRaw = request.query.minPlacement as string | undefined;
  const page = clamp(Number(request.query.page ?? "1") || 1, 1, 1000);
  const pageSize = clamp(Number(request.query.pageSize ?? "6") || 6, 1, 50);
  const maxFees = maxFeesRaw ? Number(maxFeesRaw) : undefined;
  const minRating = minRatingRaw ? Number(minRatingRaw) : undefined;
  const minPlacement = minPlacementRaw ? Number(minPlacementRaw) : undefined;

  const orderBy =
    sort === "fees-asc"
      ? [{ annualFees: "asc" as const }, { rating: "desc" as const }]
      : sort === "fees-desc"
        ? [{ annualFees: "desc" as const }, { rating: "desc" as const }]
        : sort === "placements-desc"
          ? [{ placementRate: "desc" as const }, { rating: "desc" as const }]
          : sort === "rating-asc"
            ? [{ rating: "asc" as const }, { name: "asc" as const }]
            : [{ rating: "desc" as const }, { name: "asc" as const }];

  const where = {
    name: search
      ? {
          contains: search,
          mode: "insensitive" as const
        }
      : undefined,
    state: location
      ? {
          contains: location,
          mode: "insensitive" as const
        }
      : undefined,
    annualFees: maxFees ? { lte: maxFees } : undefined,
    rating: minRating ? { gte: minRating } : undefined,
    placementRate: minPlacement ? { gte: minPlacement } : undefined,
    courses: course
      ? {
          some: {
            name: {
              contains: course,
              mode: "insensitive" as const
            }
          }
        }
      : undefined
  };

  const facetWhere = {
    name: where.name,
    annualFees: where.annualFees,
    rating: where.rating,
    placementRate: where.placementRate,
    courses: where.courses
  };

  try {
    const [total, colleges, states, courseNames, collegeNames] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          location: true,
          city: true,
          state: true,
          annualFees: true,
          rating: true,
          placementRate: true,
          type: true
        }
      }),
      prisma.college.findMany({
        where: facetWhere,
        distinct: ["state"],
        orderBy: { state: "asc" },
        select: { state: true }
      }),
      prisma.collegeCourse.findMany({
        where: {
          college: facetWhere
        },
        distinct: ["name"],
        orderBy: { name: "asc" },
        select: { name: true }
      }),
      prisma.college.findMany({
        where: {
          annualFees: where.annualFees,
          rating: where.rating,
          placementRate: where.placementRate,
          courses: where.courses
        },
        distinct: ["name"],
        orderBy: { name: "asc" },
        select: { name: true }
      })
    ]);

    if (total > 0) {
      response.json({
        colleges,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        filters: {
          states: states.map((row: { state: string }) => row.state),
          courses: courseNames.map((row: { name: string }) => row.name),
          colleges: collegeNames.map((row: { name: string }) => row.name)
        }
      });
      return;
    }
  } catch {
    // Fall back to the local India dataset when Prisma is unavailable.
  }

  response.json(
    getLocalCollegesCatalog({
      search,
      location,
      course,
      sort,
      maxFees,
      minRating,
      minPlacement,
      page,
      pageSize
    })
  );
});

router.get("/:id", async (request, response) => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: request.params.id },
      include: {
        courses: {
          orderBy: { averageCtc: "desc" }
        },
        cutoffs: {
          orderBy: { exam: "asc" }
        },
        placements: {
          orderBy: { year: "desc" }
        },
        reviews: {
          orderBy: [{ createdAt: "desc" }]
        }
      }
    });

    if (college) {
      response.json({ college });
      return;
    }
  } catch {
    // Fall back to the local India dataset when Prisma is unavailable.
  }

  const college = getLocalCollegeById(request.params.id);
  if (!college) {
    sendError(request, response, 404, "College not found.");
    return;
  }

  response.json({ college });
});

export default router;
