export interface ApiError {
  error: "invalid_request" | "rate_limited" | "upstream" | "timeout" | "schema";
  message: string;
  retryAfterSeconds?: number;
}

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
    const res = await fetch(
      "https://paleobiodb.org/data1.2/occs/list.json?cc=US&interval=Triassic&limit=500&show=coords,ident,strat",
      {
        signal: AbortSignal.timeout(8000),
      },
    );

    if (res.status === 429)
      return Response.json(
        {
          error: "rate_limited",
          message: "rate limited!",
          retryAfterSeconds: Number(res.headers.get("Retry-After") ?? "2"),
        } satisfies ApiError,
        {
          status: 429,
          headers: {
            "Retry-After": res.headers.get("Retry-After") ?? "2",
          },
        },
      );

    if (!res.ok)
      return Response.json(
        {
          error: "upstream",
          message: "upstream error!",
        } satisfies ApiError,
        {
          status: 502,
        },
      );

    return Response.json(await res.json(), {
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
