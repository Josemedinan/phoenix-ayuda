import { describe, expect, it } from "vitest";
import { buildPocketPlan, nearestFacilities } from "@/domain/pocket";
describe("PHOENIX pocket assistance", () => {
  it("creates a privacy-safe actionable plan", () => {
    const needs = ["WATER", "MEDICATION"] as const;
    const plan = buildPocketPlan({
      areaCode: "LG",
      people: 4,
      days: 3,
      needs: [...needs],
      unsafeBuilding: true,
      coastal: true,
    });
    expect(plan.waterLitres).toBe(180);
    expect(plan.actions[0].level).toBe("immediate");
    expect(plan.privacySafeCode).not.toContain("name");
    expect(plan.privacySafeCode).toContain("A=LG");
    expect(plan.privacySafeCode).toContain("U=1");
    expect(needs).toEqual(["WATER", "MEDICATION"]);
  });
  it("prioritizes trapped people first", () => {
    const plan = buildPocketPlan({
      areaCode: "CA",
      people: 1,
      days: 1,
      needs: ["TRAPPED", "WATER"],
      unsafeBuilding: false,
      coastal: false,
    });
    expect(plan.actions[0].id).toBe("trapped");
  });
  it("sorts mapped facilities locally by distance", () => {
    const result = nearestFacilities(
      [-67, 10.6],
      [
        {
          id: "far",
          geometry: { coordinates: [-66, 10.6] },
          properties: { name: "B" },
        },
        {
          id: "near",
          geometry: { coordinates: [-67.01, 10.6] },
          properties: { name: "A" },
        },
      ],
    );
    expect(result[0].id).toBe("near");
    expect(result[0].status).toBe("unknown");
  });
});
