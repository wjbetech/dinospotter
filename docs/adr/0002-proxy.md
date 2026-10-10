# ADR-002: Live PBDB via thin cached proxy (design resolution for quirks 2, 13, 14)

Status: accepted 2026-09-06 (production host locked; cache mechanism remains an implementation constraint).
Decision: static frontend plus two root-level Vercel functions (`GET /api/occs?cc=&era=` and `GET /api/taxon?id=`) forwarding validated requests to PBDB `data1.2`; the browser never fetches PBDB.
Cache contract: successful responses advertise `Cache-Control: public, max-age=60, stale-while-revalidate=86400` and carry `updatedAt`. Set `stale=true` only when the chosen cache can prove an older payload was returned. CDN SWR alone does not prove that field.
Failure contract: one bounded 8-second upstream-attempt deadline; a 429 returns a typed error and `Retry-After`, while the client retries after 2s then 8s, at most twice. Typed JSON errors follow exhausted retries. Client fallback uses matching memory/session data or the exact US/Mesozoic seed.
Why: fair-use, downtime, and 429 handling (quirk 2); keeps the 250KB budget (`show=coords,ident,strat`, bounded Period requests, `limit=500`); supersedes the precompute-only note in `pbdb-api.md` (quirk 13).
Host: Vercel (static + functions co-located) — locked (quirk 14/D1 closed). T0.0 must document project root, runtime, build/output settings, preview checks, and local function execution.
