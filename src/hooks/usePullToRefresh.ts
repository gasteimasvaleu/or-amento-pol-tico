import { useRef, useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UsePullToRefreshOptions {
  queryKeys?: string[][];
  threshold?: number;
}

export function usePullToRefresh({ queryKeys, threshold = 80 }: UsePullToRefreshOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (queryKeys?.length) {
      await Promise.all(queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
    } else {
      await queryClient.invalidateQueries();
    }
    setRefreshing(false);
  }, [queryClient, queryKeys]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, threshold + 20));
      }
    };

    const onTouchEnd = () => {
      if (pullDistance >= threshold && !refreshing) {
        handleRefresh();
      }
      pulling.current = false;
      setPullDistance(0);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullDistance, refreshing, threshold, handleRefresh]);

  return { containerRef, refreshing, pullDistance };
}
