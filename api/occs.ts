export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const cc = searchParams.get("cc");

  return Response.json({ cc });
}
