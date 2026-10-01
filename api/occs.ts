import { buildOccsUrls, parseOccs, groupByTid, normalizeCc } from "../packages/utils/src/index.ts";
import type { Era } from "../packages/utils/src/timescale.ts";

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
        cards: groupByTid(rows),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
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
