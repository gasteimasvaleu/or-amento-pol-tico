import { Loader2 } from "lucide-react";

interface Props {
  refreshing: boolean;
  pullDistance: number;
  threshold?: number;
}

export function PullToRefreshIndicator({ refreshing, pullDistance, threshold = 80 }: Props) {
  if (!refreshing && pullDistance <= 0) return null;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all"
      style={{ height: refreshing ? 40 : Math.min(pullDistance, threshold + 20) }}
    >
      <Loader2
        className={`h-5 w-5 text-primary ${refreshing ? "animate-spin" : ""}`}
        style={{
          opacity: refreshing ? 1 : Math.min(pullDistance / threshold, 1),
          transform: refreshing ? "none" : `rotate(${(pullDistance / threshold) * 360}deg)`,
        }}
      />
    </div>
  );
}
