import { z } from "zod";

export const areaCodes = ["LG", "CCS", "MI", "AR", "CA", "YA", "OTR"] as const;
export const relayNeedCodes = [
  "INJURY",
  "MEDICATION",
  "WATER",
  "SHELTER",
  "MOBILITY",
  "MATERNAL",
  "CHILD",
  "TRAPPED",
] as const;

export const relayFactsSchema = z
  .object({
    areaCode: z.enum(areaCodes),
    people: z.number().int().min(1).max(20),
    needs: z.array(z.enum(relayNeedCodes)).max(relayNeedCodes.length),
    unsafeBuilding: z.boolean(),
    privacySafeCode: z
      .string()
      .regex(/^PHX1\|/)
      .max(320),
  })
  .strict();

export const relayRequestSchema = z
  .object({
    facts: relayFactsSchema,
    anonymousId: z.string().uuid(),
  })
  .strict();

export const lockedFactsSchema = z
  .object({
    areaCode: z.enum(areaCodes),
    people: z.number().int().min(1).max(20),
    needs: z.array(z.enum(relayNeedCodes)).max(relayNeedCodes.length),
    unsafeBuilding: z.boolean(),
  })
  .strict();

export const relayModelOutputSchema = z
  .object({
    lockedFacts: lockedFactsSchema,
    spanishMessage: z.string().min(20).max(420),
    englishMessage: z.string().min(20).max(420),
    readAloudSpanish: z.string().min(20).max(420),
  })
  .strict();

export type RelayFacts = z.infer<typeof relayFactsSchema>;
export type LockedFacts = z.infer<typeof lockedFactsSchema>;
export type RelayModelOutput = z.infer<typeof relayModelOutputSchema>;
export type RelayResult = RelayModelOutput & {
  source: "local";
  verified: boolean;
};

export const areaLabels: Record<(typeof areaCodes)[number], string> = {
  LG: "La Guaira",
  CCS: "Caracas",
  MI: "Miranda",
  AR: "Aragua",
  CA: "Carabobo",
  YA: "Yaracuy",
  OTR: "otra zona de Venezuela",
};

export const needLabels: Record<
  (typeof relayNeedCodes)[number],
  { es: string; en: string }
> = {
  INJURY: { es: "atención por lesión", en: "injury care" },
  MEDICATION: {
    es: "medicamentos o continuidad de tratamiento",
    en: "medication or continuity of treatment",
  },
  WATER: { es: "agua segura", en: "safe water" },
  SHELTER: { es: "un lugar seguro", en: "safe shelter" },
  MOBILITY: { es: "apoyo de movilidad", en: "mobility support" },
  MATERNAL: { es: "atención materna", en: "maternal care" },
  CHILD: { es: "apoyo para niñas o niños", en: "support for children" },
  TRAPPED: {
    es: "ayuda para una persona atrapada",
    en: "help for a trapped person",
  },
};

export function lockFacts(facts: RelayFacts): LockedFacts {
  return {
    areaCode: facts.areaCode,
    people: facts.people,
    needs: [...new Set(facts.needs)].sort() as LockedFacts["needs"],
    unsafeBuilding: facts.unsafeBuilding,
  };
}

export function sameLockedFacts(a: LockedFacts, b: LockedFacts) {
  return (
    a.areaCode === b.areaCode &&
    a.people === b.people &&
    a.unsafeBuilding === b.unsafeBuilding &&
    [...a.needs].sort().join("|") === [...b.needs].sort().join("|")
  );
}

const joinList = (items: string[], fallback: string) =>
  items.length ? items.join(", ") : fallback;

export function buildLocalRelay(facts: RelayFacts): RelayResult {
  const lockedFacts = lockFacts(facts);
  const area = areaLabels[facts.areaCode];
  const esNeeds = joinList(
    lockedFacts.needs.map((need) => needLabels[need].es),
    "información confiable",
  );
  const enNeeds = joinList(
    lockedFacts.needs.map((need) => needLabels[need].en),
    "reliable information",
  );
  const riskEs = facts.unsafeBuilding
    ? " El edificio parece dañado o inseguro."
    : "";
  const riskEn = facts.unsafeBuilding
    ? " The building appears damaged or unsafe."
    : "";

  return {
    lockedFacts,
    spanishMessage: `Solicitud PHOENIX desde ${area} para un hogar de ${facts.people} ${facts.people === 1 ? "persona" : "personas"}. Necesitamos ${esNeeds}.${riskEs}`,
    englishMessage: `PHOENIX request from ${area} for a household of ${facts.people} ${facts.people === 1 ? "person" : "people"}. We need ${enNeeds}.${riskEn}`,
    readAloudSpanish: `Estoy en ${area}. Somos ${facts.people} ${facts.people === 1 ? "persona" : "personas"}. Necesitamos ${esNeeds}.${riskEs}`,
    source: "local",
    verified: true,
  };
}
