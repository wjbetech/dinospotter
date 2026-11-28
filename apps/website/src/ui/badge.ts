export function renderBadge(status: string, onRetry: () => void): HTMLElement | null {
  if (status !== "degraded" && status !== "error") return null;

  const div = document.createElement("div");
  div.className =
    "my-3 rounded-xl border border-amber-300 bg-amber-50 p-4 leading-relaxed text-amber-950";
  div.textContent =
    status === "degraded"
      ? "PBDB unavailable - showing cached data. Data may be incomplete or out of date."
      : "PBDB unavailable. Please try again.";

  const btn = document.createElement("button");
  btn.className =
    "mt-3 rounded-lg border border-amber-400 bg-white px-3 py-2 font-semibold text-amber-950 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  btn.textContent = "Retry";
  btn.addEventListener("click", onRetry);

  div.classList.add("badge");
  div.append(btn);

  return div;
}
