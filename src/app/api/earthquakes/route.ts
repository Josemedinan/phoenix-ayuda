import { toSeismicEvent } from "@/domain/seismic";

const USGS_VENEZUELA_FEED = "https://earthquake.usgs.gov/fdsnws/event/1/query";

export async function GET() {
  try {
    const query = new URLSearchParams({
      format: "geojson",
      starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      minlatitude: "0",
      maxlatitude: "14",
      minlongitude: "-74",
      maxlongitude: "-57",
      minmagnitude: "2.5",
      orderby: "time",
      limit: "100",
    });
    const response = await fetch(`${USGS_VENEZUELA_FEED}?${query}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/geo+json, application/json" },
    });
    if (!response.ok) throw new Error(`USGS returned ${response.status}`);
    const payload = (await response.json()) as {
      metadata?: { generated?: number; title?: string };
      features?: Array<{
        id: string;
        properties: Record<string, unknown>;
        geometry: { coordinates: unknown[] };
      }>;
    };
    const events = (payload.features || [])
      .map(toSeismicEvent)
      .filter((event): event is NonNullable<typeof event> => event !== null);
    return Response.json(
      {
        source: "USGS Earthquake Hazards Program",
        generated: payload.metadata?.generated || Date.now(),
        events,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return Response.json(
      {
        error: "The live seismic feed is temporarily unavailable.",
        events: [],
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
