export function SkeletonCard() {
  return (
    <div
      className="bg-white/80 dark:bg-white/5 rounded-[20px] p-5 w-full max-w-sm flex flex-col gap-3"
      style={{ boxShadow: "var(--shadow-sm)" }}
      aria-hidden="true"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="huddle-skeleton h-5 w-3/5" />
        <div className="huddle-skeleton h-4 w-10" />
      </div>
      <div className="flex gap-2">
        <div className="huddle-skeleton h-6 w-16" />
        <div className="huddle-skeleton h-6 w-16" />
        <div className="huddle-skeleton h-6 w-16" />
      </div>
      <div className="flex gap-3">
        <div className="huddle-skeleton w-24 h-24" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="huddle-skeleton h-3 w-full" />
          <div className="huddle-skeleton h-3 w-4/5" />
          <div className="huddle-skeleton h-3 w-3/5" />
        </div>
      </div>
      <div className="huddle-skeleton h-9 w-full" style={{ borderRadius: 14 }} />
    </div>
  );
}

export function SkeletonGroupCard() {
  return (
    <div
      className="bg-white/80 dark:bg-white/5 rounded-[20px] p-5 w-full max-w-sm flex flex-col gap-3"
      style={{ boxShadow: "var(--shadow-sm)" }}
      aria-hidden="true"
    >
      <div className="huddle-skeleton h-5 w-1/2" />
      <div className="huddle-skeleton h-3 w-2/5" />
      <div className="flex gap-2">
        <div className="huddle-skeleton h-6 w-20" />
        <div className="huddle-skeleton h-6 w-16" />
      </div>
      <div className="huddle-skeleton h-9 w-full" style={{ borderRadius: 14 }} />
    </div>
  );
}

export function SkeletonStack({ count = 3, groupCard = false }) {
  return (
    <div className="w-full flex flex-col gap-4" data-testid="skeleton-stack">
      {Array.from({ length: count }).map((_, i) =>
        groupCard ? <SkeletonGroupCard key={i} /> : <SkeletonCard key={i} />,
      )}
    </div>
  );
}

export function EmptyState({ icon = "🔎", title, body, action }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center gap-2 py-10 px-4"
      role="status"
    >
      <div className="text-4xl" aria-hidden="true">
        {icon}
      </div>
      <p
        className="h-section dark:!text-[--huddle-text]"
        style={{ fontSize: "1rem" }}
      >
        {title}
      </p>
      {body && (
        <p className="caption-text dark:!text-[--huddle-text-sub] max-w-[240px]">
          {body}
        </p>
      )}
      {action}
    </div>
  );
}
