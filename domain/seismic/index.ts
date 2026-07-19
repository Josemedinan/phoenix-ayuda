export type SeismicEvent = {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  updated: number;
  status: string;
  tsunami: boolean;
  alert: "green" | "yellow" | "orange" | "red" | null;
  longitude: number;
  latitude: number;
  depthKm: number;
  detailUrl: string;
  eventUrl: string;
};

export function severity(
  event: Pick<SeismicEvent, "magnitude" | "alert" | "tsunami">,
) {
  if (
    event.tsunami ||
    event.alert === "red" ||
    event.alert === "orange" ||
    event.magnitude >= 6
  )
    return "critical" as const;
  if (event.alert === "yellow" || event.magnitude >= 4.5)
    return "high" as const;
  if (event.magnitude >= 3) return "moderate" as const;
  return "low" as const;
}

export function distanceKm(from: [number, number], to: [number, number]) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function toSeismicEvent(feature: {
  id: string;
  properties: Record<string, unknown>;
  geometry: { coordinates: unknown[] };
}): SeismicEvent | null {
  const { properties, geometry } = feature;
  const [longitude, latitude, depthKm] = geometry.coordinates.map(Number);
  const magnitude = Number(properties.mag);
  const time = Number(properties.time);
  if (
    !feature.id ||
    !Number.isFinite(magnitude) ||
    !Number.isFinite(time) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(depthKm)
  )
    return null;
  return {
    id: feature.id,
    magnitude,
    place: String(properties.place || "Location pending"),
    time,
    updated: Number(properties.updated || time),
    status: String(properties.status || "automatic"),
    tsunami: Number(properties.tsunami) === 1,
    alert: ["green", "yellow", "orange", "red"].includes(
      String(properties.alert),
    )
      ? (properties.alert as SeismicEvent["alert"])
      : null,
    longitude,
    latitude,
    depthKm,
    detailUrl: String(properties.detail || ""),
    eventUrl: String(properties.url || ""),
  };
}
