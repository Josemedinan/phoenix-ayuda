export type SafetyState = "safe" | "damaged" | "trapped";
export type WaterState = "enough" | "uncertain" | "none";

export interface ContinuityProfile {
  area: string;
  people: number;
  safety: SafetyState;
  medicationDays: number;
  chronicCare: boolean;
  pregnancyOrInfant: boolean;
  water: WaterState;
}

export interface ContinuityPlan {
  tier: "RED" | "AMBER" | "GREEN";
  title: string;
  actions: string[];
  waterLitres: number;
  handoffCode: string;
  sms: string;
}

export interface FieldSignal {
  id: string;
  area: string;
  people: number;
  safety: SafetyState;
  medicationDays: number;
  chronicCare: boolean;
  pregnancyOrInfant: boolean;
  water: WaterState;
  tier: "RED" | "AMBER" | "GREEN";
}

const checksum = (value: string) =>
  [...value]
    .reduce(
      (total, character) => (total * 31 + character.charCodeAt(0)) % 65535,
      17,
    )
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

export function buildContinuityPlan(
  profile: ContinuityProfile,
): ContinuityPlan {
  const red = profile.safety === "trapped" || profile.safety === "damaged";
  const amber =
    profile.medicationDays <= 1 ||
    profile.pregnancyOrInfant ||
    profile.water !== "enough" ||
    profile.chronicCare;
  const tier = red ? "RED" : amber ? "AMBER" : "GREEN";
  const actions: string[] = [];

  if (profile.safety === "trapped")
    actions.push(
      "If you can: text your location landmark, tap a pipe or wall, cover your mouth from dust, and conserve phone power.",
    );
  if (profile.safety === "damaged")
    actions.push(
      "Do not re-enter a damaged building. Move away from walls, wires, leaks, and falling hazards; wait for official clearance.",
    );
  if (profile.medicationDays <= 1)
    actions.push(
      "Show this card at the next available health point today. Keep medicine names, doses, and packaging together.",
    );
  if (profile.pregnancyOrInfant)
    actions.push(
      "Prioritize prenatal, newborn, infant-feeding, and vaccination continuity when asking for health support.",
    );
  if (profile.water !== "enough")
    actions.push(
      "Use only protected water for drinking, cooking, and brushing teeth. Keep containers closed and follow local health guidance on treatment.",
    );
  if (actions.length === 0)
    actions.push(
      "Keep shoes, water, a light, medicines, and this card within reach. Drop, cover, and hold on during an aftershock.",
    );
  actions.push(
    "Choose one trusted person who can carry or read this card if your phone loses power.",
  );

  const base = `PHX72|A=${profile.area}|P=${profile.people}|S=${profile.safety}|M=${profile.medicationDays}|C=${Number(profile.chronicCare)}|I=${Number(profile.pregnancyOrInfant)}|W=${profile.water}`;
  const handoffCode = `${base}|X=${checksum(base)}`;
  const need =
    tier === "RED"
      ? "urgent rescue / structural safety support"
      : tier === "AMBER"
        ? "health continuity and safe-water support"
        : "aftershock readiness support";
  return {
    tier,
    title:
      tier === "RED"
        ? "Act now"
        : tier === "AMBER"
          ? "Do this today"
          : "Stay ready",
    actions,
    waterLitres: profile.people * 15,
    handoffCode,
    sms: `PHOENIX 72H: ${need}. Area: ${profile.area}. People: ${profile.people}. Please read this offline card: ${handoffCode}`,
  };
}

/** Validates a privacy-bounded card received by copy, QR, or a messaging app. */
export function decodeFieldSignal(value: string): FieldSignal | null {
  const match = value
    .trim()
    .match(/(PHX72\|[\s\S]*?\|X=[A-F0-9]{4})(?![A-Za-z0-9])/);
  if (!match) return null;
  const code = match[1];
  const parts = Object.fromEntries(
    code
      .split("|")
      .slice(1)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), part.slice(index + 1)];
      }),
  );
  const base = code.slice(0, code.lastIndexOf("|X="));
  if (
    parts.X !== checksum(base) ||
    !parts.A ||
    !["safe", "damaged", "trapped"].includes(parts.S) ||
    !["enough", "uncertain", "none"].includes(parts.W)
  )
    return null;
  const people = Number(parts.P);
  const medicationDays = Number(parts.M);
  if (
    !Number.isInteger(people) ||
    people < 1 ||
    people > 20 ||
    !Number.isInteger(medicationDays) ||
    medicationDays < 0 ||
    medicationDays > 3
  )
    return null;
  const profile: ContinuityProfile = {
    area: parts.A,
    people,
    safety: parts.S as SafetyState,
    medicationDays,
    chronicCare: parts.C === "1",
    pregnancyOrInfant: parts.I === "1",
    water: parts.W as WaterState,
  };
  return { id: code, ...profile, tier: buildContinuityPlan(profile).tier };
}

export function summarizeSignals(signals: FieldSignal[]) {
  return {
    totalSignals: signals.length,
    totalPeople: signals.reduce((total, signal) => total + signal.people, 0),
    red: signals.filter((signal) => signal.tier === "RED").length,
    medication: signals.filter((signal) => signal.medicationDays <= 1).length,
    water: signals.filter((signal) => signal.water !== "enough").length,
    maternalOrInfant: signals.filter((signal) => signal.pregnancyOrInfant)
      .length,
    areas: [...new Set(signals.map((signal) => signal.area))],
  };
}
