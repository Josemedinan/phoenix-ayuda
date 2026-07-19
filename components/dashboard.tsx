"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Droplets,
  HeartPulse,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  Signal,
  Stethoscope,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  buildContinuityPlan,
  type ContinuityProfile,
  type SafetyState,
  type WaterState,
} from "@/domain/continuity";

const STORAGE_KEY = "phoenix-72h-profile-v1";
const SERVICE_WORKER_VERSION = "phoenix-aid-v5";
const initialProfile: ContinuityProfile = {
  area: "La Guaira",
  people: 1,
  safety: "safe",
  medicationDays: 3,
  chronicCare: false,
  pregnancyOrInfant: false,
  water: "uncertain",
};

const subscribeOnline = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  document.execCommand("copy");
  field.remove();
}

function Badge({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "red" | "amber" | "green";
}) {
  const styles = {
    dark: "border-slate-700 bg-slate-900 text-white",
    red: "border-red-300 bg-red-50 text-red-900",
    amber: "border-amber-300 bg-amber-50 text-amber-950",
    green: "border-emerald-300 bg-emerald-50 text-emerald-950",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[.12em] ${styles}`}
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
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [profile, setProfile] = useState<ContinuityProfile>(initialProfile);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<"sms" | "card" | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const plan = buildContinuityPlan(profile);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setProfile({ ...initialProfile, ...JSON.parse(saved) });
      } catch {}
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [loaded, profile]);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(`/sw.js?v=${SERVICE_WORKER_VERSION}`, {
        scope: "/",
        updateViaCache: "none",
      })
      .then(async (registration) => {
        await registration.update();
        await navigator.serviceWorker.ready;
        setOfflineReady(true);
      })
      .catch(() => setOfflineReady(false));
  }, []);

  const copy = async (kind: "sms" | "card") => {
    try {
      await copyText(kind === "sms" ? plan.sms : plan.handoffCode);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  };
  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(initialProfile);
    setCopied(null);
  };
  const update = <K extends keyof ContinuityProfile>(
    key: K,
    value: ContinuityProfile[K],
  ) => setProfile((current) => ({ ...current, [key]: value }));

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-slate-950">
      <header className="border-b border-slate-200 bg-[#08151f] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#f8c85c] text-slate-950">
              <Signal size={21} />
            </div>
            <div>
              <p className="font-black tracking-[.16em]">PHOENIX 72H</p>
              <p className="text-[10px] text-slate-300">
                PRIVATE EARTHQUAKE CONTINUITY CARD
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge tone={online ? "green" : "amber"}>
              {online ? (
                <Wifi className="mr-1" size={12} />
              ) : (
                <WifiOff className="mr-1" size={12} />
              )}
              {online ? "ONLINE" : "OFFLINE"}
            </Badge>
            {offlineReady && (
              <Badge tone="green">
                <Check className="mr-1" size={12} />
                READY
              </Badge>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <Badge tone="amber">FOR THE FIRST 72 HOURS</Badge>
            <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
              A health card that still works when the network does not.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              After an earthquake, people can lose medicines, safe water,
              records, power, and a way to explain what matters. PHOENIX turns a
              private 60-second check-in into a plain-language card another
              person can carry, scan, or read offline.
            </p>
          </div>
          <Card className="border-amber-300 bg-[#fff9e8]">
            <p className="text-xs font-black tracking-widest text-slate-500">
              WHY THIS EXISTS
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Post-quake health demand is not only trauma. Interrupted chronic
              treatment, maternal and infant care, and unsafe water become
              urgent when clinics and communications are disrupted.
            </p>
            <a
              className="mt-4 inline-block text-xs font-black underline"
              target="_blank"
              rel="noreferrer"
              href="https://www.paho.org/en/emergencies"
            >
              READ THE HEALTH CONTEXT
            </a>
          </Card>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
          <Card>
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-slate-100">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-black tracking-widest text-slate-500">
                  PRIVATE CHECK-IN
                </p>
                <h2 className="text-xl font-black">What must not be missed?</h2>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              <fieldset>
                <legend className="text-sm font-bold">
                  1. Is anyone in immediate structural danger?
                </legend>
                <div className="mt-2 grid gap-2">
                  {(
                    [
                      ["safe", "Everyone is outside or in a safe place"],
                      ["damaged", "The building is damaged or unsafe"],
                      ["trapped", "Someone is trapped or cannot leave"],
                    ] as [SafetyState, string][]
                  ).map(([value, label]) => (
                    <Choice
                      key={value}
                      active={profile.safety === value}
                      tone={value === "trapped" ? "red" : "dark"}
                      onClick={() => update("safety", value)}
                    >
                      {label}
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-bold">
                2. Broad area only
                <select
                  aria-label="Broad area"
                  value={profile.area}
                  onChange={(event) => update("area", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-medium"
                >
                  <option>La Guaira</option>
                  <option>Caracas</option>
                  <option>Miranda</option>
                  <option>Aragua</option>
                  <option>Carabobo</option>
                  <option>Other area</option>
                </select>
              </label>
              <label className="block text-sm font-bold">
                3. People relying on this card
                <input
                  aria-label="People"
                  type="number"
                  min="1"
                  max="20"
                  value={profile.people}
                  onChange={(event) =>
                    update(
                      "people",
                      Math.min(20, Math.max(1, Number(event.target.value))),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-medium"
                />
              </label>
              <label className="block text-sm font-bold">
                4. Days of essential medication left
                <select
                  aria-label="Medication days"
                  value={profile.medicationDays}
                  onChange={(event) =>
                    update("medicationDays", Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-medium"
                >
                  <option value={0}>None</option>
                  <option value={1}>One day or less</option>
                  <option value={2}>Two days</option>
                  <option value={3}>Three or more days</option>
                </select>
              </label>
              <Toggle
                checked={profile.chronicCare}
                onChange={(checked) => update("chronicCare", checked)}
                icon={Stethoscope}
              >
                A person needs ongoing treatment (for example, diabetes, blood
                pressure, dialysis, or disability support)
              </Toggle>
              <Toggle
                checked={profile.pregnancyOrInfant}
                onChange={(checked) => update("pregnancyOrInfant", checked)}
                icon={HeartPulse}
              >
                Pregnancy, a newborn, or an infant needs care continuity
              </Toggle>
              <fieldset>
                <legend className="text-sm font-bold">5. Drinking water</legend>
                <div className="mt-2 grid gap-2">
                  {(
                    [
                      ["enough", "Protected water available"],
                      ["uncertain", "Water source or storage is uncertain"],
                      ["none", "No protected drinking water"],
                    ] as [WaterState, string][]
                  ).map(([value, label]) => (
                    <Choice
                      key={value}
                      active={profile.water === value}
                      tone={value === "none" ? "red" : "dark"}
                      onClick={() => update("water", value)}
                    >
                      {label}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 text-xs font-black text-slate-500 underline"
            >
              <RotateCcw size={14} />
              ERASE THIS DEVICE&apos;S CARD
            </button>
          </Card>

          <section aria-live="polite">
            <Card
              className={
                plan.tier === "RED"
                  ? "border-red-400 bg-red-50"
                  : plan.tier === "AMBER"
                    ? "border-amber-400 bg-amber-50"
                    : "border-emerald-400 bg-emerald-50"
              }
            >
              <Badge
                tone={
                  plan.tier === "RED"
                    ? "red"
                    : plan.tier === "AMBER"
                      ? "amber"
                      : "green"
                }
              >
                {plan.tier} PRIORITY
              </Badge>
              <h2
                data-testid="priority-title"
                className="mt-4 text-4xl font-black"
              >
                {plan.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                This is a decision aid, not a diagnosis or emergency dispatch.
                In immediate danger, ask a nearby person to contact available
                official emergency services.
              </p>
              <div className="mt-6 space-y-3">
                {plan.actions.map((action, index) => (
                  <div
                    key={action}
                    className="flex gap-3 rounded-2xl bg-white/80 p-4"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-6">{action}</p>
                  </div>
                ))}
              </div>
              {profile.water !== "enough" && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-sky-300 bg-sky-50 p-4">
                  <Droplets className="text-sky-800" />
                  <p className="text-sm">
                    <b>{plan.waterLitres} L/day</b> is the Sphere planning
                    reference for {profile.people}{" "}
                    {profile.people === 1 ? "person" : "people"}. It is a
                    minimum reference, not a promise of supply.
                  </p>
                </div>
              )}
            </Card>
            <Card className="mt-6 overflow-hidden bg-[#08151f] text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black tracking-widest text-slate-300">
                    OFFLINE HANDOFF CARD
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Carry the signal, not your identity.
                  </h2>
                </div>
                <Users className="text-[#f8c85c]" size={28} />
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr]">
                <div className="w-fit rounded-2xl bg-white p-3">
                  <QRCodeSVG value={plan.handoffCode} size={155} level="M" />
                </div>
                <div>
                  <p
                    data-testid="handoff-code"
                    className="break-all rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-5 text-emerald-200"
                  >
                    {plan.handoffCode}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-slate-300">
                    Contains only broad area, household count, safety and
                    continuity flags. No name, phone number, precise location,
                    diagnosis, or cloud account.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      data-testid="copy-card"
                      type="button"
                      onClick={() => copy("card")}
                      className="rounded-xl border border-slate-500 px-3 py-3 text-xs font-black"
                    >
                      <Clipboard className="mr-2 inline" size={14} />
                      {copied === "card" ? "CARD COPIED" : "COPY CARD"}
                    </button>
                    <button
                      data-testid="copy-sms"
                      type="button"
                      onClick={() => copy("sms")}
                      className="rounded-xl bg-[#f8c85c] px-3 py-3 text-xs font-black text-slate-950"
                    >
                      <AlertTriangle className="mr-2 inline" size={14} />
                      {copied === "sms" ? "SMS COPIED" : "COPY SMS"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <LockKeyhole size={20} />
            <h2 className="mt-3 font-black">Private by default</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The check-in is saved only in this browser, so the card remains
              useful after a reload. Erase it with one tap.
            </p>
          </Card>
          <Card>
            <Signal size={20} />
            <h2 className="mt-3 font-black">Designed for a handoff</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A neighbor can show the QR or copied SMS at a health point without
              needing an account or a data plan.
            </p>
          </Card>
          <Card>
            <Droplets size={20} />
            <h2 className="mt-3 font-black">No fabricated availability</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              PHOENIX never claims a clinic is open, a rescuer is coming, or aid
              has been allocated.
            </p>
          </Card>
        </section>
      </main>
      <footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-[11px] leading-5 text-slate-500">
        Built with Codex and GPT-5.6 during OpenAI Build Week. The production
        app has no OpenAI API, backend, account, or paid runtime dependency.
      </footer>
    </div>
  );
}

function Choice({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: "dark" | "red";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left text-sm font-medium transition ${active ? (tone === "red" ? "border-red-600 bg-red-100 text-red-950" : "border-slate-950 bg-slate-950 text-white") : "border-slate-200 bg-white hover:border-slate-400"}`}
    >
      {active && <Check className="mr-2 inline" size={15} />} {children}
    </button>
  );
}
function Toggle({
  checked,
  onChange,
  icon: Icon,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: typeof Stethoscope;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-sm leading-5 ${checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200"}`}
    >
      <input
        className="mt-1"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <Icon className="mt-0.5 shrink-0" size={18} />
      <span>{children}</span>
    </label>
  );
}
