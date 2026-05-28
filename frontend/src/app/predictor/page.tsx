"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BrainCircuit,
  MapPin,
  SearchCode,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Wallet,
  Zap
} from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Magnetic } from "@/components/magnetic";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { PredictorResult } from "@/types/api";

export default function PredictorPage() {
  const [exam, setExam] = useState("JEE");
  const [rank, setRank] = useState("");
  const [result, setResult] = useState<PredictorResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function runPredictor() {
    if (!rank) {
      setMessage("Please enter rank.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { ok, payload } = await apiRequest<PredictorResult & { message?: string }>(
      "/predictor",
      {
        method: "POST",
        body: { exam, rank: Number(rank) }
      }
    );

    setLoading(false);
    if (!ok) {
      setResult(null);
      setMessage(payload.message ?? "Prediction failed.");
      return;
    }

    setResult(payload);
  }

  return (
    <main className="flex w-full flex-col gap-5">
      <section className="page-intro">
        <span className="page-kicker">
          <BrainCircuit className="h-3.5 w-3.5" />
          Predictor
        </span>
        <h1 className="text-3xl md:text-4xl">Estimate realistic options</h1>
        <p className="max-w-2xl text-[var(--ink-700)]">
          Enter your exam and rank to separate safe picks from target and ambitious options with cutoff-based reasoning.
        </p>
      </section>
      <section className="split-layout">
        <Magnetic strength={12} rotate className="sticky-panel">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                <BrainCircuit className="h-4 w-4" />
                Fit forecast
              </div>
              <CardTitle>Simple Predictor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <select
                  value={exam}
                  onChange={(event) => setExam(event.target.value)}
                  className="field-control"
                >
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="CLAT">CLAT</option>
                  <option value="NATA">NATA</option>
                </select>
                <Input
                  value={rank}
                  onChange={(event) => setRank(event.target.value.replace(/\D/g, ""))}
                  placeholder="Rank"
                />
                <Button type="button" onClick={() => void runPredictor()} disabled={loading}>
                  <SearchCode className="mr-2 h-4 w-4" />
                  {loading ? "Predicting..." : "Predict Colleges"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Magnetic>

        <div className="section-stack">

      {loading ? <LoadingState label="Running predictor..." /> : null}
      {!loading && message ? <ErrorState title={message} /> : null}

      {!loading && !message && result?.colleges?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Predicted Colleges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.colleges.map((college) => (
              <div key={college.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{college.name}</p>
                  <Badge className="capitalize">{college.confidence}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm text-[var(--ink-700)]">
                  <MapPin className="h-4 w-4 text-[var(--brand)]" />
                  {college.location}
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--ink-700)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-[var(--brand)]" />
                    Fees: {formatCurrency(college.annualFees)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-[var(--brand)]" />
                    Rating: {college.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-[var(--brand)]" />
                    Placement: {college.placementRate}%
                  </span>
                  <span>Qualifying rank: {college.qualifyingRank}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Safe
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                    <Target className="h-3.5 w-3.5" />
                    Target
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                    <Zap className="h-3.5 w-3.5" />
                    Ambitious
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--ink-700)]">{college.explanation}</p>
                <p className="mt-1 text-xs text-[var(--ink-600)]">
                  <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                  Cutoff band: {college.cutoffBand} via {college.matchedExam}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!loading && !message && !result?.colleges?.length ? (
        <EmptyState
          title="No prediction yet."
          detail="Submit an exam and rank to see safe, target, and ambitious college matches."
        />
      ) : null}
        </div>
      </section>
    </main>
  );
}
