import { taxonUrl, toTaxonDetail } from "../packages/utils/src/taxon.ts";

export async function GET(_req: Request): Promise<Response> {
  const idParam = new URL(_req.url).searchParams.get("id") ?? "";
  const rawId = idParam.replace(/^txn:/, "");

  if (!/^\d+$/.test(rawId)) {
    return Response.json({ error: "invalid request", message: "bad id" }, { status: 400 });
  }

  const pbdbRes = await fetch(taxonUrl(rawId), {
    signal: AbortSignal.timeout(8000),
  });

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
}
