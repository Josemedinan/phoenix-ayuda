import type { FieldSignal } from "@/domain/continuity";

export type FacilityState =
  "unassessed" | "functional" | "constrained" | "unsafe";

type FacilityFeature = {
  id?: string | number;
  geometry: { coordinates: number[] };
  properties: {
    name?: unknown;
    amenity?: unknown;
    operationalStatus?: unknown;
  };
};

export interface FacilityPriority {
  id: string;
  name: string;
  kind: "hospital" | "clinic";
  score: number;
  state: FacilityState;
  reasons: string[];
  check: string[];
}

const haversineKm = (a: number[], b: number[]) => {
  const radius = 6371;
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(b[1] - a[1]);
  const dLon = radians(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a[1])) * Math.cos(radians(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
};

/**
 * A verification queue, not a damage or capacity prediction.  It ranks where a
 * scarce field assessment is most informative given public facility geometry.
 */
export function buildFacilityVerificationQueue(
  features: FacilityFeature[],
  signals: FieldSignal[],
  states: Record<string, FacilityState> = {},
): FacilityPriority[] {
  const highImpactAnchor = [-66.96, 10.61]; // La Guaira response focus; not a damage boundary.
  const communityPressure = Math.min(
    15,
    signals.length * 3 + signals.filter((s) => s.tier === "RED").length * 4,
  );
  return features
    .map((feature) => {
      const id = String(feature.id ?? feature.properties.name ?? "unknown");
      const coordinates = feature.geometry.coordinates;
      const kind: FacilityPriority["kind"] =
        feature.properties.amenity === "hospital" ? "hospital" : "clinic";
      const nearestKm = Math.min(
        ...features
          .filter((other) => other !== feature)
          .map((other) => haversineKm(coordinates, other.geometry.coordinates)),
      );
      const exposure = Math.max(
        0,
        25 - haversineKm(coordinates, highImpactAnchor) * 2,
      );
      const isolation = Math.min(20, nearestKm * 4);
      const state = states[id] ?? "unassessed";
      const statePenalty =
        state === "unassessed"
          ? 20
          : state === "constrained"
            ? 15
            : state === "unsafe"
              ? 10
              : 0;
      const score = Math.round(
        (kind === "hospital" ? 35 : 18) +
          exposure +
          isolation +
          communityPressure +
          statePenalty,
      );
      const reasons = [
        kind === "hospital"
          ? "Hospital-level service is high criticality."
          : "Primary-care continuity can prevent secondary emergencies.",
        `${haversineKm(coordinates, highImpactAnchor).toFixed(1)} km from the La Guaira response-focus anchor (proximity only; not a damage claim).`,
        `${nearestKm.toFixed(1)} km to the nearest mapped alternative; isolation raises the value of verification.`,
        `${signals.length} locally imported community signal${signals.length === 1 ? "" : "s"} increase the value of current information.`,
      ];
      return {
        id,
        name: String(feature.properties.name || "Unnamed facility"),
        kind,
        score,
        state,
        reasons,
        check: [
          "Structural safety / access",
          "Water, electricity, oxygen, and fuel",
          "Staffing and essential medicines",
          "Service capacity and referral pathway",
        ],
      };
    })
    .sort((a, b) => b.score - a.score);
}
