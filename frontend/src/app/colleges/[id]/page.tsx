"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BadgeIndianRupee,
  BookOpenText,
  BriefcaseBusiness,
  CalendarRange,
  MapPin,
  MessagesSquare,
  Star,
  Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Magnetic } from "@/components/magnetic";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-states";
import { formatCurrency } from "@/lib/format";
import { apiRequest } from "@/lib/api-client";
import type { CollegeDetail } from "@/types/api";

type Section = "courses" | "placements" | "reviews";

export default function CollegeDetailPage() {
  const params = useParams<{ id: string }>();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("courses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiRequest<{ college: CollegeDetail }>(`/colleges/${params.id}`)
      .then(({ ok, payload }) => {
        if (!ok) {
          setError("College not found.");
          return;
        }
        setCollege(payload.college);
        setError("");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <LoadingState label="Loading college detail..." />;
  }

  if (error || !college) {
    return <ErrorState title={error || "College not found."} />;
  }

  return (
    <main className="flex w-full flex-col gap-6">
      <section className="page-intro">
        <span className="page-kicker">
          <BookOpenText className="h-3.5 w-3.5" />
          College Detail
        </span>
        <h1 className="text-3xl md:text-4xl">{college.name}</h1>
        <p className="max-w-2xl text-[var(--ink-700)]">
          Review courses, placements, reviews, and cutoffs in one place before adding this college to your shortlist.
        </p>
      </section>
      <section className="split-layout">
        <Magnetic strength={12} rotate className="sticky-panel">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{college.type}</Badge>
                <Badge>{college.establishedIn}</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{college.name}</CardTitle>
              <p className="flex items-center gap-2 text-sm text-[var(--ink-700)]">
                <MapPin className="h-4 w-4 text-[var(--brand)]" />
                {college.location}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[var(--ink-700)]">{college.description}</p>
              <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <p className="flex items-center gap-2">
                  <BadgeIndianRupee className="h-4 w-4 text-[var(--brand)]" />
                  Fees: {formatCurrency(college.annualFees)}/year
                </p>
                <p className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[var(--brand)]" />
                  Rating: {college.rating.toFixed(1)} / 5
                </p>
                <p className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[var(--brand)]" />
                  Placement: {college.placementRate}%
                </p>
              </div>
            </CardContent>
          </Card>
        </Magnetic>

        <Card>
          <CardContent className="space-y-5 pt-5">
            <div className="flex flex-wrap gap-2">
              {(["courses", "placements", "reviews"] as Section[]).map((section) => (
                <Button
                  key={section}
                  type="button"
                  variant={activeSection === section ? "default" : "outline"}
                  onClick={() => setActiveSection(section)}
                >
                  {section === "courses" ? <BookOpenText className="mr-2 h-4 w-4" /> : null}
                  {section === "placements" ? <BriefcaseBusiness className="mr-2 h-4 w-4" /> : null}
                  {section === "reviews" ? <MessagesSquare className="mr-2 h-4 w-4" /> : null}
                  {section[0].toUpperCase() + section.slice(1)}
                </Button>
              ))}
            </div>

            {activeSection === "courses" ? (
              <div className="space-y-3">
                {college.courses.map((course) => (
                  <div key={course.id} className="rounded-lg border border-black/10 p-4">
                    <h3 className="font-semibold">{course.name}</h3>
                    <p className="flex items-center gap-2 text-sm text-[var(--ink-700)]">
                      <CalendarRange className="h-4 w-4 text-[var(--brand)]" />
                      {course.duration}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--ink-700)]">
                      <span>Seats: {course.seats}</span>
                      <span>Total Fee: {formatCurrency(course.totalFee)}</span>
                      <span>Avg CTC: {course.averageCtc.toFixed(1)} LPA</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {activeSection === "placements" ? (
              college.placements.length ? (
                <div className="space-y-3">
                  {college.placements.map((placement) => (
                    <div key={placement.id} className="rounded-lg border border-black/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{placement.year} placements</p>
                        <Badge>{placement.placementRate}% placed</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--ink-700)]">
                        <span>Median CTC: {placement.medianCtc.toFixed(1)} LPA</span>
                        <span>Highest CTC: {placement.highestCtc.toFixed(1)} LPA</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--ink-700)]">
                        Top recruiters: {placement.topRecruiters.join(", ")}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-black/10 p-4">
                    <p className="font-semibold">Exam cutoffs</p>
                    <ul className="mt-2 space-y-1 text-sm text-[var(--ink-700)]">
                      {college.cutoffs.map((cutoff) => (
                        <li key={cutoff.id}>
                          {cutoff.exam}: up to rank {cutoff.maxRank} ({cutoff.scoreBand})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No placement history available."
                  detail="Placement records can be added as soon as verified annual data is available."
                />
              )
            ) : null}

            {activeSection === "reviews" ? (
              college.reviews.length ? (
                <div className="space-y-3">
                  {college.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-black/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{review.headline}</p>
                        <Badge>{review.rating.toFixed(1)}/5</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--ink-700)]">{review.body}</p>
                      <p className="mt-2 text-xs text-[var(--ink-600)]">
                        {review.authorName} | {review.sourceType.replaceAll("_", " ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reviews available yet."
                  detail="Review data will appear here when enough moderated feedback is available."
                />
              )
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
