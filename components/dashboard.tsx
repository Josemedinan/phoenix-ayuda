"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  Clipboard,
  CloudOff,
  Droplets,
  ExternalLink,
  HeartPulse,
  Home,
  Languages,
  LocateFixed,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Phone,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { RelayBuilder } from "@/components/relay-builder";
import facilitiesDoc from "@/data/normalized/facilities.json";
import {
  buildPocketPlan,
  nearestFacilities,
  type HouseholdProfile,
  type NeedCode,
  type PocketPlan,
} from "@/domain/pocket";

type View =
  "inicio" | "plan" | "cerca" | "solicitud" | "relay" | "guia" | "evidencia";
const views: [View, string, typeof Home][] = [
  ["inicio", "Home", Home],
  ["plan", "My plan", PackageCheck],
  ["cerca", "Near me", MapPin],
  ["solicitud", "Ask for help", MessageSquareText],
  ["relay", "Bilingual relay", Languages],
  ["guia", "Offline guide", CloudOff],
  ["evidencia", "Sources", ShieldCheck],
];
const needs: { id: NeedCode; label: string; icon: typeof HeartPulse }[] = [
  { id: "INJURY", label: "Injury or urgent care", icon: HeartPulse },
  { id: "MEDICATION", label: "Medication or treatment", icon: PackageCheck },
  { id: "WATER", label: "Safe water", icon: Droplets },
  { id: "SHELTER", label: "A safe place", icon: Home },
  { id: "MOBILITY", label: "Mobility support", icon: LocateFixed },
  { id: "MATERNAL", label: "Pregnancy or maternal care", icon: HeartPulse },
  { id: "CHILD", label: "Children's needs", icon: ShieldCheck },
  { id: "TRAPPED", label: "A trapped person", icon: AlertTriangle },
];
const sourceNames: Record<string, string> = {
  "cdc-after-earthquake": "CDC · Post-earthquake safety",
  "paho-recovery-2026": "PAHO/WHO · Health recovery · 14 Jul 2026",
  "who-household-water": "WHO · Safe water in emergencies",
  "phoenix-device-plan": "PHOENIX · Local profile adaptation",
};
const initialProfile: HouseholdProfile = {
  areaCode: "LG",
  people: 1,
  days: 3,
  needs: [],
  unsafeBuilding: false,
  coastal: true,
};
const subscribeOnline = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};
const getOnlineSnapshot = () => navigator.onLine;
const getOnlineServerSnapshot = () => true;
function Pill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const c = {
    blue: "border-sky-300/40 bg-sky-50 text-sky-900",
    green: "border-emerald-300 bg-emerald-50 text-emerald-900",
    amber: "border-amber-300 bg-amber-50 text-amber-950",
    red: "border-red-300 bg-red-50 text-red-900",
  }[tone];
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[.08em] ${c}`}
    >
      {children}
    </span>
  );
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [view, setView] = useState<View>("inicio"),
    [profile, setProfile] = useState(initialProfile),
    [plan, setPlan] = useState<PocketPlan | null>(null),
    [installed, setInstalled] = useState(false);
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot,
  );
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then(() => navigator.serviceWorker.ready)
        .then(
          () =>
            new Promise<void>((resolve) => {
              if (navigator.serviceWorker.controller) return resolve();
              navigator.serviceWorker.addEventListener(
                "controllerchange",
                () => resolve(),
                { once: true },
              );
            }),
        )
        .then(() => setInstalled(true))
        .catch(() => setInstalled(false));
  }, []);
  const createPlan = (next = profile) => {
    const generated = buildPocketPlan(next, new Date().toISOString());
    setProfile(next);
    setPlan(generated);
    setView("plan");
  };
  const quick = (ids: NeedCode[]) =>
    createPlan({ ...profile, needs: [...new Set([...profile.needs, ...ids])] });
  return (
    <div className="min-h-screen bg-[#f4f0e8] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#fffdf8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#f5c95e]">
              <Activity size={21} />
            </div>
            <div>
              <p className="font-black tracking-[.15em]">PHOENIX AID</p>
              <p className="text-[10px] text-slate-500">
                VENEZUELA · WORKS OFFLINE
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Pill tone={online ? "green" : "amber"}>
              {online ? (
                <>
                  <Wifi className="mr-1 inline" size={11} />
                  ONLINE
                </>
              ) : (
                <>
                  <WifiOff className="mr-1 inline" size={11} />
                  OFFLINE
                </>
              )}
            </Pill>
            {installed && (
              <Pill>
                <Check className="mr-1 inline" size={11} />
                OFFLINE READY
              </Pill>
            )}
          </div>
        </div>
      </header>
      <nav className="sticky top-16 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl overflow-x-auto px-3">
          {views.map(([id, label, Icon]) => (
            <button
              data-testid={`nav-${id}`}
              key={id}
              onClick={() => setView(id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold ${view === id ? "border-slate-950 text-slate-950" : "border-transparent text-slate-500"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        {view === "inicio" && <HomeView quick={quick} navigate={setView} />}{" "}
        {view === "plan" && (
          <PlanView
            profile={profile}
            setProfile={setProfile}
            plan={plan}
            generate={() => createPlan(profile)}
            openRequest={() => setView("solicitud")}
          />
        )}{" "}
        {view === "cerca" && <Nearby />}{" "}
        {view === "solicitud" && (
          <RequestCard
            plan={plan}
            goPlan={() => setView("plan")}
            openRelay={() => setView("relay")}
          />
        )}{" "}
        {view === "relay" && (
          <RelayBuilder
            profile={profile}
            plan={plan}
            goPlan={() => setView("plan")}
          />
        )}{" "}
        {view === "guia" && <OfflineGuide />}{" "}
        {view === "evidencia" && <Evidence />}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-3 text-center text-[11px] leading-5 text-slate-500">
        PHOENIX does not replace emergency services or medical care. Your plan,
        location, and bilingual relay stay on your device. No API key, name, or
        exact coordinate is needed.
      </footer>
    </div>
  );
}

function HomeView({
  quick,
  navigate,
}: {
  quick: (n: NeedCode[]) => void;
  navigate: (v: View) => void;
}) {
  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-[#07131b] p-6 text-white md:p-9">
        <div className="max-w-3xl">
          <Pill tone="amber">LOCAL HELP · PRIVATE · NO ACCOUNT</Pill>
          <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            What do you need to solve now?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Turn needs into a verifiable household plan, calculate a minimum
            water reference, find mapped services, and create a bilingual relay
            with no name or exact location.
          </p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickButton
            testid="quick-danger"
            tone="red"
            icon={AlertTriangle}
            title="I am in danger"
            detail="A trapped person or urgent injury"
            onClick={() => quick(["TRAPPED", "INJURY"])}
          />
          <QuickButton
            tone="amber"
            icon={HeartPulse}
            title="I need care"
            detail="An injury or medication continuity"
            onClick={() => quick(["INJURY", "MEDICATION"])}
          />
          <QuickButton
            testid="quick-water"
            tone="blue"
            icon={Droplets}
            title="I need water"
            detail="Calculate and protect safe water"
            onClick={() => quick(["WATER"])}
          />
          <QuickButton
            tone="green"
            icon={Home}
            title="I need a safe place"
            detail="Shelter or a nearby facility"
            onClick={() => quick(["SHELTER"])}
          />
        </div>
      </section>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-[10px] font-bold tracking-widest text-slate-500">
            1 · PLAN ON YOUR DEVICE
          </p>
          <h2 className="mt-3 text-xl font-bold">
            Decide the next thing, not everything
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The plan orders immediate risks, continuity of care, water, and
            aftershock readiness.
          </p>
          <button
            onClick={() => navigate("plan")}
            className="mt-4 text-xs font-bold"
          >
            CREATE MY PLAN <ChevronRight className="inline" size={14} />
          </button>
        </Card>
        <Card>
          <p className="text-[10px] font-bold tracking-widest text-slate-500">
            2 · PRIVATE LOCATION
          </p>
          <h2 className="mt-3 text-xl font-bold">
            Nearby services, no tracking
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Distance is calculated on your phone. PHOENIX does not send or save
            your coordinates.
          </p>
          <button
            onClick={() => navigate("cerca")}
            className="mt-4 text-xs font-bold"
          >
            FIND NEARBY <ChevronRight className="inline" size={14} />
          </button>
        </Card>
        <Card>
          <p className="text-[10px] font-bold tracking-widest text-slate-500">
            3 · RELAY INTEGRITY
          </p>
          <h2 className="mt-3 text-xl font-bold">
            A request that crosses languages
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            It works offline in Spanish and English. The message is generated
            from the exact facts in the household plan—nothing else.
          </p>
          <button
            onClick={() => navigate("relay")}
            className="mt-4 text-xs font-bold"
          >
            OPEN RELAY <ChevronRight className="inline" size={14} />
          </button>
        </Card>
      </div>
      <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-bold">Current public-health context</p>
        <p className="mt-1 text-xs leading-5 text-amber-950">
          PAHO warns of higher diarrheal and respiratory disease risk,
          vector-borne and vaccine-preventable diseases, and interruptions to
          chronic and maternal care. Updated: 14 Jul 2026.
        </p>
      </div>
    </>
  );
}

function QuickButton({
  icon: Icon,
  title,
  detail,
  tone,
  onClick,
  testid,
}: {
  icon: typeof Home;
  title: string;
  detail: string;
  tone: "red" | "amber" | "blue" | "green";
  onClick: () => void;
  testid?: string;
}) {
  const c = {
    red: "border-red-400/40 bg-red-400/10 hover:bg-red-400/20",
    amber: "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20",
    blue: "border-sky-400/40 bg-sky-400/10 hover:bg-sky-400/20",
    green: "border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20",
  }[tone];
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${c}`}
    >
      <Icon size={23} />
      <p className="mt-4 font-bold">{title}</p>
      <p className="mt-1 text-xs text-slate-300">{detail}</p>
    </button>
  );
}

function PlanView({
  profile,
  setProfile,
  plan,
  generate,
  openRequest,
}: {
  profile: HouseholdProfile;
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
  plan: PocketPlan | null;
  generate: () => void;
  openRequest: () => void;
}) {
  const toggle = (id: NeedCode) =>
    setProfile((p) => ({
      ...p,
      needs: p.needs.includes(id)
        ? p.needs.filter((x) => x !== id)
        : [...p.needs, id],
    }));
  return (
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <Card className={plan ? "order-2 lg:order-1" : ""}>
        <p className="text-[10px] font-bold tracking-widest text-slate-500">
          MY HOUSEHOLD · NO NAMES
        </p>
        <h1 className="mt-2 text-2xl font-black">Offline household plan</h1>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="text-xs font-bold">
            People
            <input
              aria-label="People in the household"
              type="number"
              min="1"
              max="20"
              value={profile.people}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  people: Math.min(20, Math.max(1, Number(e.target.value))),
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-base"
            />
          </label>
          <label className="text-xs font-bold">
            Days to plan for
            <input
              aria-label="Days to plan for"
              type="number"
              min="1"
              max="7"
              value={profile.days}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  days: Math.min(7, Math.max(1, Number(e.target.value))),
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-base"
            />
          </label>
        </div>
        <label className="mt-4 block text-xs font-bold">
          Broad area
          <select
            value={profile.areaCode}
            onChange={(e) => {
              const areaCode = e.target.value;
              setProfile((p) => ({
                ...p,
                areaCode,
                coastal: ["LG", "MI", "AR", "CA"].includes(areaCode),
              }));
            }}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3"
          >
            <option value="LG">La Guaira</option>
            <option value="CCS">Caracas</option>
            <option value="MI">Miranda</option>
            <option value="AR">Aragua</option>
            <option value="CA">Carabobo</option>
            <option value="YA">Yaracuy</option>
            <option value="OTR">Otra</option>
          </select>
        </label>
        <div className="mt-5 space-y-2">
          {needs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm ${profile.needs.includes(id) ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200"}`}
            >
              <Icon size={17} />
              {label}
              {profile.needs.includes(id) && (
                <Check className="ml-auto" size={15} />
              )}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-3 text-sm">
          <input
            type="checkbox"
            checked={profile.unsafeBuilding}
            onChange={(e) =>
              setProfile((p) => ({ ...p, unsafeBuilding: e.target.checked }))
            }
          />
          The building appears damaged or unsafe
        </label>
        <label className="mt-3 flex items-center gap-3 rounded-xl bg-sky-50 p-3 text-sm">
          <input
            type="checkbox"
            checked={profile.coastal}
            onChange={(e) =>
              setProfile((p) => ({ ...p, coastal: e.target.checked }))
            }
          />
          I am in a coastal area
        </label>
        <button
          data-testid="generate-plan"
          onClick={generate}
          className="mt-5 w-full rounded-xl bg-[#f5c95e] p-3 text-sm font-black"
        >
          GENERATE PLAN ON THIS DEVICE
        </button>
      </Card>
      <div className={plan ? "order-1 lg:order-2" : ""}>
        {!plan ? (
          <Card className="grid min-h-72 place-items-center text-center">
            <div>
              <PackageCheck className="mx-auto text-slate-300" size={44} />
              <h2 className="mt-4 text-xl font-bold">
                Your plan will appear here
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                It is calculated locally and never leaves your phone.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Pill tone="green">GENERATED ON YOUR DEVICE</Pill>
                  <h2 className="mt-3 text-2xl font-black">
                    Actions by urgency
                  </h2>
                </div>
                {profile.needs.includes("WATER") && (
                  <div className="rounded-xl bg-sky-50 p-3 text-right">
                    <p className="text-2xl font-black text-sky-900">
                      {plan.waterLitres} L
                    </p>
                    <p className="text-[10px] text-sky-800">
                      minimum reference · {profile.people}{" "}
                      {profile.people === 1 ? "person" : "people"} ·{" "}
                      {profile.days} days
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-5 space-y-3">
                {plan.actions.map((a, i) => (
                  <div
                    data-testid={`plan-action-${a.id}`}
                    key={a.id}
                    className={`rounded-xl border p-4 ${a.level === "immediate" ? "border-red-300 bg-red-50" : a.level === "today" ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}
                  >
                    <div className="flex gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black">
                        {i + 1}
                      </span>
                      <div>
                        <Pill
                          tone={
                            a.level === "immediate"
                              ? "red"
                              : a.level === "today"
                                ? "amber"
                                : "blue"
                          }
                        >
                          {a.level === "immediate"
                            ? "NOW"
                            : a.level === "today"
                              ? "TODAY"
                              : "PREPARE"}
                        </Pill>
                        <h3 className="mt-2 font-bold">{a.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {a.instruction}
                        </p>
                        <p className="mt-2 text-[10px] text-slate-500">
                          Source: {sourceNames[a.sourceId] ?? a.sourceId}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                data-testid="open-request"
                onClick={openRequest}
                className="mt-5 w-full rounded-xl bg-slate-950 p-3 text-sm font-bold text-white"
              >
                CREATE AN SMS / QR REQUEST
              </button>
            </Card>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The water quantity is a Sphere planning reference, not a maximum.
              Adjust it for climate, age, health, and availability.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Nearby() {
  const [location, setLocation] = useState<[number, number] | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const results = location
    ? nearestFacilities(location, facilitiesDoc.features)
    : [];
  const locate = () => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("This device does not provide location.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation([p.coords.longitude, p.coords.latitude]);
        setLoading(false);
      },
      () => {
        setError(
          "Location could not be obtained. You can still use the mapped list without sharing coordinates.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <Card>
        <LocateFixed size={32} />
        <h1 className="mt-4 text-2xl font-black">Mapped help near you</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Calculation happens in the browser. Coordinates are not stored, are
          not included in requests, and are never sent to PHOENIX.
        </p>
        <button
          data-testid="locate-me"
          onClick={locate}
          className="mt-5 w-full rounded-xl bg-slate-950 p-3 text-sm font-bold text-white"
        >
          {loading ? "GETTING LOCATION…" : "USE MY LOCATION JUST NOW"}
        </button>
        {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <b>Important:</b> “Nearby” does not mean “open.” These locations come
          from OpenStreetMap and have no verified operation or capacity.
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Nearest mapped facilities</h2>
          <Pill tone="amber">STATUS UNKNOWN</Pill>
        </div>
        {!location ? (
          <div className="grid h-64 place-items-center text-center text-sm text-slate-500">
            <div>
              <MapPin className="mx-auto text-slate-300" size={36} />
              <p className="mt-3">
                Enable location to sort {facilitiesDoc.features.length} mapped
                facilities by distance.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {results.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
              >
                <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-xs font-black">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold">{r.name}</p>
                  <p className="text-xs text-slate-500">
                    {r.distanceKm.toFixed(1)} km straight-line · confirm before
                    travelling
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function RequestCard({
  plan,
  goPlan,
  openRelay,
}: {
  plan: PocketPlan | null;
  goPlan: () => void;
  openRelay: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!plan)
    return (
      <Card className="mx-auto max-w-xl text-center">
        <MessageSquareText className="mx-auto text-slate-300" size={44} />
        <h1 className="mt-4 text-2xl font-black">Create your plan first</h1>
        <p className="mt-2 text-sm text-slate-500">
          The request uses only a broad area, household size, and need
          categories.
        </p>
        <button
          onClick={goPlan}
          className="mt-5 rounded-xl bg-[#f5c95e] px-5 py-3 text-sm font-bold"
        >
          CREATE A PLAN
        </button>
      </Card>
    );
  const copy = async () => {
    await navigator.clipboard.writeText(plan.privacySafeCode);
    setCopied(true);
  };
  const share = async () => {
    if (navigator.share)
      await navigator.share({
        title: "PHOENIX request",
        text: plan.privacySafeCode,
      });
    else await copy();
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <Card className="text-center">
        <p className="text-[10px] font-bold tracking-widest text-slate-500">
          IDENTITY-FREE NEED CODE
        </p>
        <div className="mx-auto mt-5 w-fit rounded-2xl border border-slate-200 bg-white p-4">
          <QRCodeSVG value={plan.privacySafeCode} size={220} level="M" />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          It can be scanned directly between devices, even offline.
        </p>
      </Card>
      <Card>
        <Pill tone="green">NO NAMES OR COORDINATES</Pill>
        <h1 className="mt-4 text-2xl font-black">
          Share only with someone you trust
        </h1>
        <p
          data-testid="request-code"
          className="mt-5 break-all rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-300"
        >
          {plan.privacySafeCode}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            data-testid="copy-request"
            onClick={copy}
            className="rounded-xl border border-slate-300 p-3 text-sm font-bold"
          >
            <Clipboard className="mr-2 inline" size={16} />
            {copied ? "COPIED" : "COPY FOR SMS"}
          </button>
          <button
            onClick={share}
            className="rounded-xl bg-[#f5c95e] p-3 text-sm font-bold"
          >
            <Phone className="mr-2 inline" size={16} />
            SHARE
          </button>
        </div>
        <button
          onClick={openRelay}
          className="mt-3 w-full rounded-xl bg-slate-950 p-3 text-sm font-bold text-white"
        >
          <Languages className="mr-2 inline" size={16} />
          CREATE BILINGUAL RELAY
        </button>
        <div className="mt-5 space-y-2">
          {plan.limitations.map((x) => (
            <p key={x} className="text-xs text-slate-500">
              • {x}
            </p>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-3 text-xs leading-5 text-red-900">
          This card does not call emergency services or guarantee receipt. In
          immediate danger, use available official channels or ask a nearby
          person to get help.
        </div>
      </Card>
    </div>
  );
}

function OfflineGuide() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GuideCard
        tone="red"
        title="During an aftershock"
        steps={[
          "Drop, cover, and hold on.",
          "Move away from windows and falling objects.",
          "Do not run to stairs while the ground is moving.",
        ]}
        source="CDC · Post-earthquake safety"
      />
      <GuideCard
        tone="amber"
        title="Damaged building"
        steps={[
          "Do not re-enter until officials authorize it.",
          "Move away if you hear cracking or shifting.",
          "Avoid downed wires and visible leaks.",
        ]}
        source="CDC · Post-earthquake safety"
      />
      <GuideCard
        tone="blue"
        title="Safe water"
        steps={[
          "Store water in clean, closed, covered containers.",
          "If water safety is uncertain, use only treatment methods advised by WHO or health authorities.",
          "Do not use contaminated water for drinking, cooking, or brushing teeth.",
        ]}
        source="WHO · Household water treatment and storage"
      />
      <GuideCard
        tone="green"
        title="Continuity of care"
        steps={[
          "Keep a list of medicines, doses, and allergies.",
          "Keep prenatal records and vaccination information.",
          "Seek support when chronic care or treatment is interrupted.",
        ]}
        source="PAHO · Venezuela health recovery · 14 Jul 2026"
      />
      <Card className="md:col-span-2">
        <p className="text-[10px] font-bold tracking-widest text-slate-500">
          THIS GUIDE STAYS AVAILABLE OFFLINE
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          The service worker saves the app and visited resources after the first
          load. Check the “Offline ready” indicator before relying on it without
          a connection.
        </p>
      </Card>
    </div>
  );
}
function GuideCard({
  title,
  steps,
  source,
  tone,
}: {
  title: string;
  steps: string[];
  source: string;
  tone: "red" | "amber" | "blue" | "green";
}) {
  return (
    <Card>
      <Pill tone={tone}>{title.toUpperCase()}</Pill>
      <ol className="mt-5 space-y-3">
        {steps.map((x, i) => (
          <li key={x} className="flex gap-3 text-sm leading-6">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold">
              {i + 1}
            </span>
            {x}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-[10px] text-slate-500">Source: {source}</p>
    </Card>
  );
}

function Evidence() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <Pill tone="green">OFFICIAL UPDATE</Pill>
        <h2 className="mt-4 text-xl font-bold">PAHO/WHO · Health recovery</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Water and sanitation risks, communicable disease, interrupted care,
          mental health, and needs in shelters.
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold"
          href="https://www.paho.org/es/noticias/14-7-2026-respuesta-sanitaria-al-terremoto-venezuela-entra-fase-recuperacion-temprana"
          target="_blank"
          rel="noreferrer"
        >
          OPEN SOURCE <ExternalLink size={13} />
        </a>
      </Card>
      <Card>
        <Pill tone="green">OFFICIAL GUIDANCE</Pill>
        <h2 className="mt-4 text-xl font-bold">CDC · Post-earthquake safety</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Aftershocks, damaged buildings, trapped people, electrical risks, and
          coastal alerts.
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold"
          href="https://www.cdc.gov/earthquakes/safety/stay-safe-after-an-earthquake.html"
          target="_blank"
          rel="noreferrer"
        >
          OPEN SOURCE <ExternalLink size={13} />
        </a>
      </Card>
      <Card>
        <Pill tone="green">OFFICIAL GUIDANCE</Pill>
        <h2 className="mt-4 text-xl font-bold">
          WHO · Safe water in emergencies
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Household treatment and safe storage after emergencies and disasters.
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold"
          href="https://www.who.int/publications/m/item/household-water-treatment-and-safe-storage-following-emergencies-and-disasters"
          target="_blank"
          rel="noreferrer"
        >
          OPEN SOURCE <ExternalLink size={13} />
        </a>
      </Card>
      <Card>
        <Pill tone="amber">CONTEXTUAL STANDARD</Pill>
        <h2 className="mt-4 text-xl font-bold">Sphere · Minimum water</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          15 litres per person per day is a minimum reference for drinking and
          household hygiene; it is not a maximum and must fit the context.
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold"
          href="https://spherestandards.org/handbook/"
          target="_blank"
          rel="noreferrer"
        >
          OPEN SOURCE <ExternalLink size={13} />
        </a>
      </Card>
      <Card className="md:col-span-2">
        <Pill tone="amber">UNVERIFIED MAPPING</Pill>
        <h2 className="mt-4 text-xl font-bold">
          OpenStreetMap · {facilitiesDoc.features.length} facilities
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          They are used only for proximity. PHOENIX does not claim they are
          open, safe, or have capacity. Location stays on the device.
        </p>
      </Card>
      <Card className="md:col-span-2">
        <Pill tone="blue">INTEGRITY BY DESIGN</Pill>
        <h2 className="mt-4 text-xl font-bold">
          A transparent, offline message boundary
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The bilingual relay is generated from allowlisted plan fields only. It
          has no free-form input, account, API key, name, or exact location.
          Critical safety instructions remain deterministic and work offline.
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold"
          href="https://github.com/Josemedinan/phoenix-ayuda#why-the-relay-is-trustworthy"
          target="_blank"
          rel="noreferrer"
        >
          VIEW THE DESIGN <ExternalLink size={13} />
        </a>
      </Card>
    </div>
  );
}
