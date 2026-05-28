"use client";

import { useEffect, useState } from "react";
import { BookmarkCheck, MapPin, Scale, Star, Trash2, Trophy, Wallet } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Magnetic } from "@/components/magnetic";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

type SavedCollege = {
  id: string;
  name: string;
  location: string;
  annualFees: number;
  rating: number;
  placementRate: number;
};

type SavedComparison = {
  id: string;
  name: string | null;
  createdAt: string;
  colleges: SavedCollege[];
};

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSaved() {
    setLoading(true);
    const [collegesRes, comparisonsRes] = await Promise.all([
      apiRequest<{ colleges: SavedCollege[] }>("/saved/colleges"),
      apiRequest<{ comparisons: SavedComparison[] }>("/saved/comparisons")
    ]);

    if (!collegesRes.ok || !comparisonsRes.ok) {
      setError("Failed to load saved items.");
      setLoading(false);
      return;
    }

    setSavedColleges(collegesRes.payload.colleges);
    setSavedComparisons(comparisonsRes.payload.comparisons);
    setError("");
    setLoading(false);
  }

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    queueMicrotask(() => {
      void loadSaved();
    });
  }, [user]);

  async function removeCollege(collegeId: string) {
    const { ok, payload } = await apiRequest<{ message?: string }>(`/saved/colleges/${collegeId}`, {
      method: "DELETE"
    });
    if (!ok) {
      setError(payload.message ?? "Failed to remove saved college.");
      return;
    }
    setMessage("Removed saved college.");
    await loadSaved();
  }

  async function removeComparison(id: string) {
    const { ok, payload } = await apiRequest<{ message?: string }>(`/saved/comparisons/${id}`, {
      method: "DELETE"
    });
    if (!ok) {
      setError(payload.message ?? "Failed to remove saved comparison.");
      return;
    }
    setMessage("Removed saved comparison.");
    await loadSaved();
  }

  if (authLoading) {
    return <LoadingState label="Checking session..." />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Login required."
        detail="Saved colleges and comparisons are attached to your account."
      />
    );
  }

  return (
    <main className="flex w-full flex-col gap-5">
      <section className="page-intro">
        <span className="page-kicker">
          <BookmarkCheck className="h-3.5 w-3.5" />
          Saved
        </span>
        <h1 className="text-3xl md:text-4xl">Return to your shortlist</h1>
        <p className="max-w-2xl text-[var(--ink-700)]">
          Keep your saved colleges and decision boards in one place so you can revisit them without rebuilding context.
        </p>
      </section>
      {loading ? <LoadingState label="Loading saved items..." /> : null}
      {!loading && error ? <ErrorState title={error} /> : null}
      {!loading && message ? <LoadingState label={message} /> : null}

      {!loading ? (
        <section className="split-layout">
          <Magnetic strength={12} rotate className="sticky-panel">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                  <BookmarkCheck className="h-4 w-4" />
                  Personal shortlist
                </div>
                <CardTitle>Saved Colleges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedColleges.length ? (
                  savedColleges.map((college) => (
                    <div
                      key={college.id}
                      className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold">{college.name}</p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-[var(--ink-700)]">
                          <MapPin className="h-4 w-4 text-[var(--brand)]" />
                          {college.location}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--ink-700)]">
                          <span className="inline-flex items-center gap-1.5">
                            <Wallet className="h-4 w-4 text-[var(--brand)]" />
                            {formatCurrency(college.annualFees)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-[var(--brand)]" />
                            {college.rating.toFixed(1)} rating
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Trophy className="h-4 w-4 text-[var(--brand)]" />
                            {college.placementRate}% placements
                          </span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" onClick={() => void removeCollege(college.id)}>
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No saved colleges yet." detail="Shortlist a few programs from the discover page." />
                )}
              </CardContent>
            </Card>
          </Magnetic>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                <Scale className="h-4 w-4" />
                Saved decision boards
              </div>
              <CardTitle>Saved Comparisons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedComparisons.length ? (
                savedComparisons.map((comparison) => (
                  <div key={comparison.id} className="rounded-lg border border-black/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{comparison.name || "Untitled Comparison"}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void removeComparison(comparison.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Remove
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-[var(--ink-700)]">
                      {comparison.colleges.map((college) => (
                        <p key={college.id}>
                          {college.name} ({college.location}) - {formatCurrency(college.annualFees)}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No saved comparisons yet." detail="Save a comparison table after evaluating 2-3 colleges." />
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  );
}
