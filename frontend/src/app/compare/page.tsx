import { Suspense } from "react";
import { LoadingState } from "@/components/page-states";
import { ComparePageClient } from "./page-client";

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading comparison..." />}>
      <ComparePageClient />
    </Suspense>
  );
}
