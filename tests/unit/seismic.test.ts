import { describe, expect, it } from "vitest";
import { distanceKm, severity, toSeismicEvent } from "@/domain/seismic";

describe("Venezuela seismic monitor", () => {
  const event = toSeismicEvent({
    id: "test-event",
    properties: {
      mag: 5.2,
      place: "10 km north of La Guaira, Venezuela",
      time: 1_784_000_000_000,
      updated: 1_784_000_001_000,
      status: "reviewed",
      tsunami: 0,
      alert: "yellow",
      detail: "https://example.test/detail",
      url: "https://example.test/event",
    },
    geometry: { coordinates: [-66.93, 10.6, 12] },
  });

  it("normalizes an official GeoJSON event", () => {
    expect(event).toMatchObject({
      magnitude: 5.2,
      depthKm: 12,
      status: "reviewed",
    });
    expect(severity(event!)).toBe("high");
  });

  it("rejects invalid feed records and calculates local distance", () => {
    expect(
      toSeismicEvent({
        id: "bad",
        properties: {},
        geometry: { coordinates: [] },
      }),
    ).toBeNull();
    expect(distanceKm([-66.93, 10.6], [-66.93, 10.6])).toBe(0);
  });
});
