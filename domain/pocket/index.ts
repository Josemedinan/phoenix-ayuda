export type NeedCode =
  | "INJURY"
  | "MEDICATION"
  | "WATER"
  | "SHELTER"
  | "MOBILITY"
  | "MATERNAL"
  | "CHILD"
  | "TRAPPED";
export interface HouseholdProfile {
  areaCode: string;
  people: number;
  days: number;
  needs: NeedCode[];
  unsafeBuilding: boolean;
  coastal: boolean;
}
export interface SafetyAction {
  id: string;
  level: "immediate" | "today" | "prepare";
  title: string;
  instruction: string;
  sourceId: string;
}
export interface PocketPlan {
  waterLitres: number;
  actions: SafetyAction[];
  privacySafeCode: string;
  limitations: string[];
}
const checksum = (value: string) =>
  [...value]
    .reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 65535, 7)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
export function buildPocketPlan(
  profile: HouseholdProfile,
  createdAt = "2026-07-18T19:00:00-06:00",
): PocketPlan {
  const actions: SafetyAction[] = [];
  if (profile.needs.includes("TRAPPED"))
    actions.push({
      id: "trapped",
      level: "immediate",
      title: "If you are trapped",
      instruction:
        "Send a text if you can, tap a wall or pipe, or use a whistle. Protect your mouth, nose, and eyes from dust.",
      sourceId: "cdc-after-earthquake",
    });
  if (profile.unsafeBuilding)
    actions.push({
      id: "building",
      level: "immediate",
      title: "Do not re-enter",
      instruction:
        "Move away from damaged buildings and downed wires. Wait for official authorization before returning.",
      sourceId: "cdc-after-earthquake",
    });
  if (profile.needs.includes("INJURY"))
    actions.push({
      id: "injury",
      level: "immediate",
      title: "Seek urgent care",
      instruction:
        "Seek first aid and health care as soon as possible. PHOENIX does not diagnose injuries or replace health professionals.",
      sourceId: "cdc-after-earthquake",
    });
  if (
    profile.needs.some((x) => ["MEDICATION", "MATERNAL", "CHILD"].includes(x))
  )
    actions.push({
      id: "continuity",
      level: "today",
      title: "Protect continuity of care",
      instruction:
        "Keep prescriptions, medicine names and doses, prenatal records, and vaccination information; ask health staff for continuity of care.",
      sourceId: "paho-recovery-2026",
    });
  if (profile.needs.includes("WATER"))
    actions.push({
      id: "water",
      level: "today",
      title: "Prioritize safe water",
      instruction:
        "Use clean, covered containers. If water safety is uncertain, follow a treatment method advised by WHO or health authorities.",
      sourceId: "who-household-water",
    });
  if (profile.needs.includes("SHELTER"))
    actions.push({
      id: "shelter",
      level: "today",
      title: "Find a structurally safe place",
      instruction:
        "Do not use a mapped location as shelter until you confirm it is open and authorized.",
      sourceId: "cdc-after-earthquake",
    });
  if (profile.needs.includes("MOBILITY"))
    actions.push({
      id: "mobility",
      level: "today",
      title: "Make mobility support visible",
      instruction:
        "Keep your assistive device or support with you and show the MOBILITY code when asking for help moving.",
      sourceId: "phoenix-device-plan",
    });
  if (profile.coastal)
    actions.push({
      id: "coast",
      level: "today",
      title: "Watch official coastal alerts",
      instruction:
        "Move to high ground only after an official tsunami alert or clear natural warning signs; follow routes set by authorities.",
      sourceId: "cdc-after-earthquake",
    });
  actions.push({
    id: "aftershock",
    level: "prepare",
    title: "Prepare for aftershocks",
    instruction:
      "If shaking starts: drop, cover, and hold on. Keep shoes, a flashlight, water, and medicines within reach.",
    sourceId: "cdc-after-earthquake",
  });
  const base = `PHX1|A=${profile.areaCode}|P=${profile.people}|D=${profile.days}|N=${[...profile.needs].sort().join(",") || "INFO"}|U=${profile.unsafeBuilding ? 1 : 0}|T=${createdAt.slice(0, 16)}`;
  return {
    waterLitres: profile.people * profile.days * 15,
    actions,
    privacySafeCode: `${base}|C=${checksum(base)}`,
    limitations: [
      "It contains no names, diagnoses, or exact location.",
      "It does not send the request automatically.",
      "The 15 litres per person per day is a Sphere minimum reference and must fit the context.",
    ],
  };
}
export function distanceKm(a: [number, number], b: [number, number]) {
  const r = 6371,
    p1 = (a[1] * Math.PI) / 180,
    p2 = (b[1] * Math.PI) / 180,
    dp = ((b[1] - a[1]) * Math.PI) / 180,
    dl = ((b[0] - a[0]) * Math.PI) / 180;
  return (
    2 *
    r *
    Math.asin(
      Math.sqrt(
        Math.sin(dp / 2) ** 2 +
          Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2,
      ),
    )
  );
}
export function nearestFacilities(
  location: [number, number],
  features: Array<{
    id?: string | number;
    geometry: { coordinates: number[] };
    properties: { name?: unknown };
  }>,
  limit = 5,
) {
  return features
    .map((f) => ({
      id: String(f.id),
      name: String(f.properties.name || "Unnamed facility"),
      distanceKm: distanceKm(
        location,
        f.geometry.coordinates as [number, number],
      ),
      status: "unknown" as const,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
