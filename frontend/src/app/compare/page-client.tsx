"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Minus, Save, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-states";
import { Magnetic } from "@/components/magnetic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { CollegeCard } from "@/types/api";

type ComparisonCollege = Pick<
  CollegeCard,
  "id" | "name" | "location" | "annualFees" | "placementRate" | "rating"
>;

export function ComparePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<ComparisonCollege[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [colleges, setColleges] = useState<ComparisonCollege[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedIds = useMemo(() => {
    const raw = searchParams.get("ids") ?? "";
    return raw.split(",").filter(Boolean).slice(0, 3);
  }, [searchParams]);

  useEffect(() => {
    void apiRequest<{ colleges: ComparisonCollege[] }>("/compare/options").then(({ ok, payload }) => {
      if (ok) {
        setCatalog(payload.colleges);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedIds.length < 2) {
      queueMicrotask(() => {
        setColleges([]);
        setLoading(false);
      });
      return;
    }

    void apiRequest<{ colleges: ComparisonCollege[] }>("/compare", {
      method: "POST",
      body: {
        collegeIds: selectedIds
      }
    })
      .then(({ ok, payload }) => {
        if (ok) {
          setColleges(payload.colleges);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedIds]);

  function toggleSelection(collegeId: string) {
    setLoading(true);
    const nextIds = selectedIds.includes(collegeId)
      ? selectedIds.filter((id) => id !== collegeId)
      : [...selectedIds, collegeId].slice(0, 3);
    setSelectedOption("");
    router.replace(`/compare?ids=${nextIds.join(",")}`);
  }

  async function saveComparison() {
    if (!user) {
      setMessage("Please login to save comparison.");
      return;
    }

    const { ok, payload } = await apiRequest<{ message?: string }>("/saved/comparisons", {
      method: "POST",
      body: {
        name: name.trim() || undefined,
        collegeIds: selectedIds
      }
    });

    setMessage(ok ? "Comparison saved." : payload.message ?? "Failed to save comparison.");
  }

  const bestFees = colleges.length ? Math.min(...colleges.map((college) => college.annualFees)) : 0;
  const bestPlacements = colleges.length
    ? Math.max(...colleges.map((college) => college.placementRate))
    : 0;
  const bestRating = colleges.length ? Math.max(...colleges.map((college) => college.rating)) : 0;
  const metricRows = [
    {
      label: "Location",
      render: (college: ComparisonCollege) => college.location
    },
    {
      label: "Fees",
      render: (college: ComparisonCollege) => formatCurrency(college.annualFees),
      highlight: (college: ComparisonCollege) => college.annualFees === bestFees
    },
    {
      label: "Placement %",
      render: (college: ComparisonCollege) => `${college.placementRate}%`,
      highlight: (college: ComparisonCollege) => college.placementRate === bestPlacements
    },
    {
      label: "Rating",
      render: (college: ComparisonCollege) => college.rating.toFixed(1),
      highlight: (college: ComparisonCollege) => college.rating === bestRating
    },
    {
      label: "Fee gap",
      render: (college: ComparisonCollege) =>
        college.annualFees === bestFees ? "Best" : `+${formatCurrency(college.annualFees - bestFees)}`
    },
    {
      label: "Placement gap",
      render: (college: ComparisonCollege) =>
        college.placementRate === bestPlacements
          ? "Best"
          : `-${(bestPlacements - college.placementRate).toFixed(0)} pts`
    },
    {
      label: "Rating gap",
      render: (college: ComparisonCollege) =>
        college.rating === bestRating ? "Best" : `-${(bestRating - college.rating).toFixed(1)}`
    }
  ];

  function RemoveIconButton({
    label,
    onClick
  }: {
    label: string;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-300 bg-red-50 text-[11px] font-bold leading-none text-red-600 transition hover:bg-red-100 hover:text-red-700"
      >
        <Minus className="h-3 w-3" />
      </button>
    );
  }

  return (
    <main className="flex w-full flex-col gap-5">
      <section className="page-intro">
        <span className="page-kicker">
          <BarChart3 className="h-3.5 w-3.5" />
          Compare
        </span>
        <h1 className="text-3xl md:text-4xl">Shortlist with clarity</h1>
        <p className="max-w-2xl text-[var(--ink-700)]">
          Build a side-by-side decision board and see which college wins on cost, rating, and placement outcomes.
        </p>
      </section>
      <section className="split-layout">
        <Magnetic strength={12} rotate className="sticky-panel">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                <BarChart3 className="h-4 w-4" />
                Decision board
              </div>
              <CardTitle>Build Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={selectedOption}
                onChange={(event) => {
                  const nextCollegeId = event.target.value;
                  setSelectedOption(nextCollegeId);
                  if (nextCollegeId) {
                    toggleSelection(nextCollegeId);
                  }
                }}
                className="field-control"
              >
                <option value="">Select a college to compare</option>
                {catalog.map((college) => (
                  <option
                    key={college.id}
                    value={college.id}
                    disabled={selectedIds.includes(college.id) || selectedIds.length >= 3}
                  >
                    {college.name} - {college.location}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--ink-700)]">
                <span className="theme-chip">
                  <Target className="h-3.5 w-3.5" />
                  Pick 2 to 3 options
                </span>
                <span className="theme-chip">
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-highlight best values
                </span>
              </div>
              {selectedIds.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedIds.map((selectedId) => {
                    const selectedCollege =
                      colleges.find((college) => college.id === selectedId) ??
                      catalog.find((college) => college.id === selectedId);

                    return (
                      <div
                        key={selectedId}
                        className="selected-chip flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm"
                      >
                        <span className="selected-chip-label">{selectedCollege?.name ?? "Selected college"}</span>
                        <RemoveIconButton
                          label={`Remove ${selectedCollege?.name ?? "college"} from comparison`}
                          onClick={() => toggleSelection(selectedId)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <p className="text-sm text-[var(--ink-700)]">
                Select 2-3 colleges. Current selection: {selectedIds.length}
              </p>
            </CardContent>
          </Card>
        </Magnetic>

        <div className="section-stack">

      {loading ? <LoadingState label="Building comparison..." /> : null}

      {!loading && selectedIds.length < 2 ? (
        <EmptyState
          title="Choose at least 2 colleges."
          detail="The compare view becomes useful when you put two or three real options side by side."
        />
      ) : null}

      {!loading && selectedIds.length >= 2 && colleges.length === 0 ? (
        <ErrorState title="Comparison data could not be loaded." />
      ) : null}

      {!loading && colleges.length >= 2 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
              <Sparkles className="h-4 w-4" />
              Side-by-side metrics
            </div>
            <CardTitle>Decision Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="comparison-grid hidden gap-3 lg:grid" style={{ gridTemplateColumns: `minmax(140px, 0.9fr) repeat(${colleges.length}, minmax(0, 1fr))` }}>
              <div className="comparison-metric-head">Metric</div>
              {colleges.map((college) => (
                <div key={college.id} className="comparison-college-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="comparison-college-title">{college.name}</p>
                      <p className="comparison-college-subtitle">{college.location}</p>
                    </div>
                    <RemoveIconButton
                      label={`Remove ${college.name} from comparison`}
                      onClick={() => toggleSelection(college.id)}
                    />
                  </div>
                </div>
              ))}

              {metricRows.map((row) => (
                <div
                  key={row.label}
                  className="contents"
                >
                  <div key={`${row.label}-label`} className="comparison-metric-label">
                    {row.label}
                  </div>
                  {colleges.map((college) => (
                    <div
                      key={`${row.label}-${college.id}`}
                      className={`comparison-metric-cell ${
                        row.highlight?.(college) ? "comparison-metric-cell-best" : ""
                      }`}
                    >
                      {row.render(college)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:hidden">
              {colleges.map((college) => (
                <div key={college.id} className="comparison-mobile-card">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="comparison-college-title">{college.name}</p>
                      <p className="comparison-college-subtitle">{college.location}</p>
                    </div>
                    <RemoveIconButton
                      label={`Remove ${college.name} from comparison`}
                      onClick={() => toggleSelection(college.id)}
                    />
                  </div>
                  <div className="grid gap-2">
                    {metricRows.map((row) => (
                      <div key={`${college.id}-${row.label}`} className="comparison-mobile-row">
                        <span className="comparison-mobile-label">{row.label}</span>
                        <span
                          className={`comparison-mobile-value ${
                            row.highlight?.(college) ? "comparison-metric-cell-best" : ""
                          }`}
                        >
                          {row.render(college)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Optional saved comparison name"
              />
              <Button type="button" onClick={() => void saveComparison()}>
                <Save className="mr-2 h-4 w-4" />
                Save Comparison
              </Button>
            </div>
            {message ? <p className="text-sm text-[var(--ink-700)]">{message}</p> : null}
          </CardContent>
        </Card>
      ) : null}
        </div>
      </section>
    </main>
  );
}
