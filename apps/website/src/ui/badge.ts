export function renderBadge(status: string, onRetry: () => void): HTMLElement | null {
  if (status !== "degraded" && status !== "error") return null;

  const div = document.createElement("div");
  div.textContent =
    status === "degraded"
      ? "PBDB unavailable - showing cached data. Data may be incomplete or out of date."
      : "PBDB unavailable. Please try again.";

  const btn = Object.assign(document.createElement("button"), {
    textContent: "Retry",
    onClick: onRetry,
  });

  div.append(btn);

  return div;
}
