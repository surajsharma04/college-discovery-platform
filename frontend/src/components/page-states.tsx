import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 px-5 py-4 text-sm text-[var(--ink-700)]">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-soft)]/35 text-[var(--brand)] shadow-[0_10px_24px_var(--shadow-soft)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
        </span>
        <span>{label}</span>
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  title = "Something went wrong.",
  detail
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <Card className="overflow-hidden border-red-300/50 bg-red-500/8">
      <CardContent className="space-y-2 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-500">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <p className="font-medium text-red-500">{title}</p>
        </div>
        {detail ? <p className="text-sm text-red-400">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  detail
}: {
  title: string;
  detail: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-2 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-soft)]/30 text-[var(--brand)]">
            <Inbox className="h-4 w-4" />
          </span>
          <p className="font-medium">{title}</p>
        </div>
        <p className="text-sm text-[var(--ink-700)]">{detail}</p>
      </CardContent>
    </Card>
  );
}
