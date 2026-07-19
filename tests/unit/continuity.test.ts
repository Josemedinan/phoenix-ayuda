import { describe, expect, it } from "vitest";
import { buildContinuityPlan } from "@/domain/continuity";

describe("PHOENIX 72H continuity card", () => {
  it("escalates structural danger above every other need", () => {
    const plan = buildContinuityPlan({
      area: "La Guaira",
      people: 2,
      safety: "trapped",
      medicationDays: 3,
      chronicCare: false,
      pregnancyOrInfant: false,
      water: "enough",
    });
    expect(plan.tier).toBe("RED");
    expect(plan.actions[0]).toContain("text your location landmark");
  });

  it("creates a privacy-bounded card for treatment and water continuity", () => {
    const plan = buildContinuityPlan({
      area: "Caracas",
      people: 3,
      safety: "safe",
      medicationDays: 0,
      chronicCare: true,
      pregnancyOrInfant: false,
      water: "none",
    });
    expect(plan.tier).toBe("AMBER");
    expect(plan.waterLitres).toBe(45);
    expect(plan.handoffCode).toContain("PHX72|A=Caracas|P=3");
    expect(plan.handoffCode).not.toContain("name");
    expect(plan.sms).toContain("health continuity");
  });
});
