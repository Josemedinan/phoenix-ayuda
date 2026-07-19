import { describe, expect, it } from "vitest";
import { buildFacilityVerificationQueue } from "@/domain/facility-priority";

describe("facility verification queue", () => {
  it("prioritizes a nearby unassessed hospital without calling it damaged", () => {
    const queue = buildFacilityVerificationQueue(
      [
        {
          id: "hospital",
          geometry: { coordinates: [-66.96, 10.61] },
          properties: { name: "Hospital", amenity: "hospital" },
        },
        {
          id: "clinic",
          geometry: { coordinates: [-67.3, 10.2] },
          properties: { name: "Clinic", amenity: "clinic" },
        },
      ],
      [],
    );
    expect(queue[0]).toMatchObject({ id: "hospital", state: "unassessed" });
    expect(queue[0].reasons.join(" ")).toContain("not a damage claim");
  });
});
