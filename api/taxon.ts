import { taxonUrl, toTaxonDetail } from "utils";

export async function GET(_req: Request): Promise<Response> {
  const idParam = new URL(_req.url).searchParams.get("id") ?? "";
  const rawId = idParam.replace(/^txn:/, "");

  if (!/^\d+$/.test(rawId)) {
    return Response.json({ error: "invalid request", message: "bad id" }, { status: 400 });
  }

  try {
    const pbdbRes = await fetch(taxonUrl(rawId), {
      signal: AbortSignal.timeout(8000),
    });

    if (pbdbRes.status === 429) {
      return Response.json(
        {
          error: "rate_limited",
          message: "rate limited!",
          retryAfterSeconds: Number(pbdbRes.headers.get("Retry-After") ?? "2"),
        },
        {
          status: 429,
          headers: {
            "Retry-After": pbdbRes.headers.get("Retry-After") ?? "2",
          },
        },
      );
    }

    if (!pbdbRes.ok) {
      return Response.json(
        {
          error: "upstream",
          message: "upstream error!",
        },
        {
          status: 502,
        },
      );
    }

    const json = (await pbdbRes.json()) as {
      records: Record<string, string | number | null>[];
    };

    if (!json.records?.[0]) {
      return Response.json(
        { error: "schema", message: "taxonomical record not found!" },
        { status: 502 },
      );
    }

    return Response.json(toTaxonDetail(json.records[0]), {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if ((error as DOMException).name === "AbortError") {
      return Response.json(
        {
          error: "timeout",
          message: "timed out!",
        },
        {
          status: 504,
        },
      );
    }

    return Response.json(
      {
        error: "upstream",
        message: "upstream error!",
      },
      {
        status: 502,
      },
    );
  }
}
