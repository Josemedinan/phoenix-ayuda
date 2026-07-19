import { describe, expect, it } from "vitest";
import {
  buildLocalRelay,
  lockFacts,
  relayRequestSchema,
  sameLockedFacts,
  type RelayFacts,
} from "@/domain/relay";

const facts: RelayFacts = {
  areaCode: "LG",
  people: 3,
  needs: ["WATER", "MEDICATION"],
  unsafeBuilding: true,
  privacySafeCode:
    "PHX1|A=LG|P=3|D=3|N=MEDICATION,WATER|U=1|T=2026-07-18T19:00|C=1234",
};

describe("PHOENIX Relay integrity", () => {
  it("builds a useful bilingual message without a network", () => {
    const result = buildLocalRelay(facts);
    expect(result.source).toBe("local");
    expect(result.spanishMessage).toContain("3 personas");
    expect(result.spanishMessage).toContain("agua segura");
    expect(result.englishMessage).toContain("3 people");
    expect(result.englishMessage).toContain("safe water");
    expect(result.spanishMessage).not.toContain(facts.privacySafeCode);
  });

  it("rejects a transformed payload that changes a critical fact", () => {
    const expected = lockFacts(facts);
    expect(sameLockedFacts(expected, expected)).toBe(true);
    expect(sameLockedFacts(expected, { ...expected, people: 4 })).toBe(false);
    expect(sameLockedFacts(expected, { ...expected, needs: ["WATER"] })).toBe(
      false,
    );
  });

  it("does not accept free-form or identifying fields", () => {
    const result = relayRequestSchema.safeParse({
      facts: { ...facts, name: "Persona identificable" },
      anonymousId: "ce3851ac-552a-4a4b-989c-3d542b7c93b2",
      notes: "free-form prompt",
    });
    expect(result.success).toBe(false);
  });

  it("rejects exact coordinates and unsupported need codes", () => {
    const result = relayRequestSchema.safeParse({
      facts: {
        ...facts,
        areaCode: "10.4806,-66.9036",
        needs: ["CASH"],
      },
      anonymousId: "ce3851ac-552a-4a4b-989c-3d542b7c93b2",
    });
    expect(result.success).toBe(false);
  });
});
