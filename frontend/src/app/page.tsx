"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownWideNarrow,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Filter,
  GraduationCap,
  Layers3,
  MapPin,
  Star,
  Trophy,
  Wallet
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-states";
import { Magnetic } from "@/components/magnetic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { CollegeCard } from "@/types/api";

type CollegesResponse = {
  colleges: CollegeCard[];
  page: number;
  totalPages: number;
  total: number;
  filters: { states: string[]; courses: string[]; colleges: string[] };
};

const pageSize = 12;

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [colleges, setColleges] = useState<CollegeCard[]>([]);
  const [collegeNames, setCollegeNames] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [location, setLocation] = useState("");
  const [course, setCourse] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minPlacement, setMinPlacement] = useState("");
  const [sort, setSort] = useState("rating-desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCompare, setSelectedCompare] = useState<string[]>([]);

  const compareHref = useMemo(
    () => `/compare?ids=${selectedCompare.join(",")}`,
    [selectedCompare]
  );

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort
    });

    if (selectedCollege) params.set("search", selectedCollege);
    if (location) params.set("location", location);
    if (course) params.set("course", course);
    if (maxFees) params.set("maxFees", maxFees);
    if (minRating) params.set("minRating", minRating);
    if (minPlacement) params.set("minPlacement", minPlacement);

    void apiRequest<CollegesResponse>(`/colleges?${params.toString()}`)
      .then(({ ok, payload }) => {
        if (!ok) {
          setError("Unable to load colleges.");
          return;
        }

        setError("");
        setColleges(payload.colleges);
        setCollegeNames(payload.filters.colleges);
        setStates(payload.filters.states);
        setCourses(payload.filters.courses);
        setTotalPages(payload.totalPages || 1);
      })
      .catch(() => setError("Unable to load colleges."))
      .finally(() => setLoading(false));
  }, [course, location, maxFees, minPlacement, minRating, page, selectedCollege, sort]);

  function toggleCompare(id: string) {
    setSelectedCompare((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, id];
    });
  }

  async function saveCollege(collegeId: string) {
    if (!user) {
      router.push("/auth");
      return;
    }

    const { ok, payload } = await apiRequest<{ message?: string }>("/saved/colleges", {
      method: "POST",
      body: { collegeId }
    });

    setMessage(ok ? "College saved." : payload.message ?? "Failed to save college.");
  }

  return (
    <main className="flex w-full flex-col gap-6">
      <section className="hero-panel panel soft-grid relative overflow-hidden p-5 md:p-7">
        <div className="split-layout">
          <div className="section-stack">
            <div className="page-intro">
              <span className="page-kicker">
                <GraduationCap className="h-3.5 w-3.5" />
                Discovery Studio
              </span>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
                Find your best-fit campus without losing momentum
              </h1>
              <p className="max-w-xl text-[var(--ink-700)]">
                Browse Indian colleges with guided dropdown filters, then build a compare-ready shortlist from a tighter decision workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-tile">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-600)]">Visible now</p>
                <p className="mt-2 text-3xl font-semibold">{colleges.length}</p>
                <p className="mt-1 text-sm text-[var(--ink-700)]">campuses on this page</p>
              </div>
              <div className="metric-tile">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-600)]">Comparison</p>
                <p className="mt-2 text-3xl font-semibold">{selectedCompare.length}/3</p>
                <p className="mt-1 text-sm text-[var(--ink-700)]">slots filled</p>
              </div>
              <div className="metric-tile">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-600)]">Catalog lens</p>
                <p className="mt-2 text-3xl font-semibold">{states.length || 0}</p>
                <p className="mt-1 text-sm text-[var(--ink-700)]">states in current scope</p>
              </div>
            </div>
          </div>

          <Magnetic strength={12} rotate className="h-full">
            <div className="panel h-full p-4 md:p-5">
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--ink-700)]">
                <span className="theme-chip">
                  <Filter className="h-3.5 w-3.5" />
                  Live filters
                </span>
                <span className="theme-chip">
                  <Layers3 className="h-3.5 w-3.5" />
                  Compact shortlist flow
                </span>
                <span className="theme-chip">
                  <Bookmark className="h-3.5 w-3.5" />
                  Save when ready
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={selectedCollege}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setSelectedCollege(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="">All colleges</option>
                  {collegeNames.map((collegeName) => (
                    <option key={collegeName} value={collegeName}>
                      {collegeName}
                    </option>
                  ))}
                </select>
                <select
                  value={location}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setLocation(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="">All states</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <select
                  value={course}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setCourse(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="">All courses</option>
                  {courses.map((courseOption) => (
                    <option key={courseOption} value={courseOption}>
                      {courseOption}
                    </option>
                  ))}
                </select>
                <select
                  value={maxFees}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setMaxFees(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="">Any annual fee</option>
                  <option value="100000">Up to Rs 1 lakh</option>
                  <option value="200000">Up to Rs 2 lakh</option>
                  <option value="300000">Up to Rs 3 lakh</option>
                  <option value="500000">Up to Rs 5 lakh</option>
                </select>
                <select
                  value={minRating}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setMinRating(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
                <select
                  value={minPlacement}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setMinPlacement(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="">Any placement rate</option>
                  <option value="90">90%+</option>
                  <option value="80">80%+</option>
                  <option value="70">70%+</option>
                </select>
                <select
                  value={sort}
                  onChange={(event) => {
                    setLoading(true);
                    setPage(1);
                    setSort(event.target.value);
                  }}
                  className="field-control"
                >
                  <option value="rating-desc">Rating: high to low</option>
                  <option value="rating-asc">Rating: low to high</option>
                  <option value="fees-asc">Fees: low to high</option>
                  <option value="fees-desc">Fees: high to low</option>
                  <option value="placements-desc">Placements: high to low</option>
                </select>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="flex flex-wrap gap-2">
                  <span className="theme-chip">
                    <Filter className="h-3.5 w-3.5" />
                    Filter in place
                  </span>
                  <span className="theme-chip">
                    <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                    Compare up to 3
                  </span>
                </div>
                <Button
                  type="button"
                  disabled={selectedCompare.length < 2}
                  onClick={() => router.push(compareHref)}
                  className="h-11 rounded-2xl px-5"
                >
                  <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                  Compare {selectedCompare.length}/3
                </Button>
              </div>
            </div>
          </Magnetic>
        </div>
      </section>

      {message ? <LoadingState label={message} /> : null}
      {error ? <ErrorState title={error} /> : null}

      {loading ? (
        <LoadingState label="Loading colleges..." />
      ) : colleges.length === 0 ? (
        <EmptyState
          title="No colleges match these filters."
          detail="Try clearing one or two filters, or widen fees and placement thresholds."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-3">
          {colleges.map((college) => {
            const selected = selectedCompare.includes(college.id);
            return (
              <Magnetic key={college.id} strength={10} rotate>
                <Card className="h-full">
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    {college.type}
                  </CardDescription>
                  <CardTitle className="text-xl">{college.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[var(--brand)]" />
                    {college.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm text-[var(--ink-700)]">
                    <p className="flex items-center gap-2"><Wallet className="h-4 w-4" />Fees: {formatCurrency(college.annualFees)}/year</p>
                    <p className="flex items-center gap-2"><Star className="h-4 w-4" />Rating: {college.rating.toFixed(1)}/5</p>
                    <p className="flex items-center gap-2"><Trophy className="h-4 w-4" />Placement: {college.placementRate}%</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/colleges/${college.id}`}
                      className="solid-link"
                    >
                      View details
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toggleCompare(college.id)}
                      className={selected ? "border-[var(--brand)] text-[var(--brand)]" : undefined}
                    >
                      <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                      {selected ? "Selected" : "Compare"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void saveCollege(college.id)}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardContent>
                </Card>
              </Magnetic>
            );
          })}
        </section>
      )}

      <div className="flex justify-end">
        <div className="surface-panel flex items-center gap-2 rounded-full px-2 py-2">
          <Button
            type="button"
            variant="ghost"
            disabled={page === 1}
            onClick={() => {
              setLoading(true);
              setPage((prev) => Math.max(1, prev - 1));
            }}
            className="h-10 w-10 rounded-full p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[116px] text-center text-sm font-medium text-[var(--ink-900)]">
            Page {page} of {Math.max(totalPages, 1)}
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => {
              setLoading(true);
              setPage((prev) => prev + 1);
            }}
            className="h-10 w-10 rounded-full p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
