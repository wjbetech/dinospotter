import {
  buildOccsUrls,
  parseOccs,
  groupByTid,
  normalizeCc,
  fame,
  artworkFor,
} from "../packages/utils/dist/index.mjs";
import type { Era } from "../packages/utils/dist/index.mjs";

export interface ApiError {
  error: "invalid_request" | "rate_limited" | "upstream" | "timeout" | "schema";
  message: string;
  retryAfterSeconds?: number;
}

export type OccsJson = {
  records: Record<string, unknown>[];
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if ([...url.searchParams.keys()].some((key) => !["cc", "era"].includes(key))) {
    return Response.json(
      {
        error: "invalid_request",
        message: "bad param(s)!",
      } satisfies ApiError,
      { status: 400 },
    );
  }

  try {
    const cc = normalizeCc(url.searchParams.get("cc") ?? "US");
    const era = url.searchParams.get("era") as Era;

    if (!era || !["Paleozoic", "Mesozoic", "Cenozoic"].includes(era)) {
      return Response.json(
        {
          error: "invalid_request",
          message: "bad era!",
        } satisfies ApiError,
        { status: 400 },
      );
    }

    const urls = buildOccsUrls(cc, era);
    const results = await Promise.all(
      urls.map((url) =>
        fetch(url, {
          signal: AbortSignal.timeout(8000),
        }),
      ),
    );

    for (const result of results) {
      if (result.status === 429) {
        return Response.json(
          {
            error: "rate_limited",
            message: "rate limited!",
            retryAfterSeconds: Number(result.headers.get("Retry-After") ?? "2"),
          } satisfies ApiError,
          {
            status: 429,
            headers: {
              "Retry-After": result.headers.get("Retry-After") ?? "2",
            },
          },
        );
      }
    }

    for (const result of results) {
      if (!result.ok) {
        return Response.json(
          {
            error: "upstream",
            message: "upstream error!",
          } satisfies ApiError,
          {
            status: 502,
          },
        );
      }
    }

    const parsed = await Promise.all(results.map((r) => r.json() as Promise<OccsJson>));
    const rows = parsed.flatMap((p) => parseOccs(p).rows);
    // Targeted PBDB clade queries expand the sample without making the main
    // fossil record depend on the supplementary requests succeeding.
    const groups = [
      ["Theropoda", "theropod"],
      ["Sauropoda", "sauropod"],
      ["Ornithischia", "ornithischian"],
    ] as const;
    if (era === "Mesozoic") {
      const extra = await Promise.allSettled(
        groups.map(async ([clade, verifiedGroup]) => {
          const query = new URL("https://paleobiodb.org/data1.2/occs/list.json");
          query.search = new URLSearchParams({
            cc,
            interval: era,
            base_name: clade,
            limit: "250",
            show: "coords,ident,strat,class",
          }).toString();
          const response = await fetch(query, { signal: AbortSignal.timeout(8000) });
          if (!response.ok) throw new Error("supplementary query failed");
          const json = (await response.json()) as OccsJson;
          return parseOccs(json).rows.map((site) => ({ ...site, verifiedGroup }));
        }),
      );
      const byOccurrence = new Map(rows.map((site) => [site.oid, site]));
      for (const result of extra) {
        if (result.status === "fulfilled") {
          for (const site of result.value) byOccurrence.set(site.oid, site);
        }
      }
      rows.splice(0, rows.length, ...byOccurrence.values());
    }
    const dropped = parsed.reduce((sum, p) => sum + parseOccs(p).dropped, 0);
    const total = parsed.reduce((sum, p) => sum + parseOccs(p).total, 0);

    return Response.json(
      {
        cc,
        era,
        updatedAt: new Date().toISOString(),
        stale: false,
        dropped,
        total,
        cards: (() => {
          const candidates = groupByTid(rows);
          const verified = candidates.filter((card) => card.verifiedGroup);
          const selected: typeof verified = [];
          for (const [, group] of groups) {
            const picks = verified
              .filter((card) => card.verifiedGroup === group)
              .sort((a, b) => {
                const specific = (card: (typeof verified)[number]) =>
                  card.rank !== undefined &&
                  card.rank <= 5 &&
                  !/[IF]/i.test(card.taxonFlags ?? "") &&
                  artworkFor(card.tna, card) === group;
                return (
                  Number(specific(b)) - Number(specific(a)) ||
                  (specific(a) && specific(b) ? (a.rank ?? 99) - (b.rank ?? 99) : 0) ||
                  fame(b.tna) - fame(a.tna) ||
                  b.sites.length - a.sites.length
                );
              });
            selected.push(...picks.slice(0, 2));
          }
          for (const card of candidates) {
            if (!selected.includes(card)) selected.push(card);
            if (selected.length >= 12) break;
          }
          return selected;
        })(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    const name = error instanceof Error ? error.name : "";

    if (name === "AbortError" || name === "TimeoutError") {
      return Response.json(
        {
          error: "timeout",
          message: "timed out!",
        } satisfies ApiError,
        {
          status: 504,
        },
      );
    }

    if ((error as DOMException).name === "AbortError") {
      return Response.json(
        {
          error: "timeout",
          message: "timed out!",
        } satisfies ApiError,
        {
          status: 504,
        },
      );
    }
    return Response.json(
      {
        error: "upstream",
        message: "upstream error!",
      } satisfies ApiError,
      {
        status: 502,
      },
    );
  }
}
