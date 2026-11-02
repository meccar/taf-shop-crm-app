"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useActiveStore } from "@/stores/active-store-context";

const MAX_ACTIONS = 3;

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /**
   * undefined -> default "active store name + code" line
   * ReactNode -> custom eyebrow
   * null / false -> no eyebrow
   */
  eyebrow?: React.ReactNode;
  /** Right-side controls. Max 3 are rendered; extra ones are dropped. */
  actions?: React.ReactNode;
  className?: string;
}

/** Flattens fragments so <>{a}{b}</> counts as two actions, not one. */
function flattenActions(node: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(node).flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? flattenActions((child.props as { children?: React.ReactNode }).children)
      : [child],
  );
}

function ActiveStoreEyebrow() {
  const { activeStoreId, stores } = useActiveStore();
  const activeStore = stores.find((store) => store.id === activeStoreId);

  return (
    <span>
      <strong className="font-semibold text-primary">
        {activeStore?.name ?? "Loading..."}
      </strong>{" "}
      {activeStore?.code ?? "..."}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  const eyebrowContent =
    eyebrow === undefined ? <ActiveStoreEyebrow /> : eyebrow;

  const visibleActions = flattenActions(actions).slice(0, MAX_ACTIONS);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {eyebrowContent && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {eyebrowContent}
          </div>
        )}
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {visibleActions.length > 0 && (
        <div
          className={cn(
            // < sm: 2-column grid, a lone last item spans the full row
            "grid w-full grid-cols-2 gap-2.5",
            "[&>*:last-child:nth-child(odd)]:col-span-2",
            // sm+: wrapping flex row, left aligned
            "sm:flex sm:w-auto sm:flex-wrap sm:items-center",
            // lg+: right aligned, never wider than 40rem, never squeezed
            "lg:max-w-[40rem] lg:shrink-0 lg:justify-end lg:pt-5",
          )}
        >
          {visibleActions.map((action, index) => (
            <div
              key={index}
              className={cn(
                "min-w-0",
                // each action: full width of its cell on mobile,
                // capped at 13rem from sm up
                "[&>*]:w-full [&>*]:max-w-full [&>*]:overflow-hidden",
                "sm:max-w-52 sm:[&>*]:w-auto",
              )}
            >
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
