"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CircleAlert,
  Clock3,
  Crosshair,
  ExternalLink,
  LocateFixed,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
  WifiOff,
} from "lucide-react";
import { distanceKm, severity, type SeismicEvent } from "@/domain/seismic";

type Feed = {
  source: string;
  generated: number;
  events: SeismicEvent[];
  error?: string;
};
type NotificationState = "unsupported" | "default" | "granted" | "denied";
const POLL_MS = 60_000;
const SERVICE_WORKER_VERSION = "phoenix-seismo-v7";

const formatTime = (time: number) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Caracas",
  }).format(time);
const tone = (event: SeismicEvent) =>
  ({
    critical: "border-red-300 bg-red-50 text-red-950",
    high: "border-orange-300 bg-orange-50 text-orange-950",
    moderate: "border-amber-300 bg-amber-50 text-amber-950",
    low: "border-sky-200 bg-sky-50 text-sky-950",
  })[severity(event)];
const label = (event: SeismicEvent) =>
  ({
    critical: "ACT NOW",
    high: "HIGH ATTENTION",
    moderate: "FELT-LEVEL WATCH",
    low: "INFORMATION",
  })[severity(event)];

export default function Dashboard() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [threshold, setThreshold] = useState(4.5);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState("");
  const [notification, setNotification] =
    useState<NotificationState>("unsupported");
  const seen = useRef(new Set<string>());
  const firstLoad = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/earthquakes", { cache: "no-store" });
      const next = (await response.json()) as Feed;
      if (!response.ok) throw new Error(next.error || "Live feed unavailable");
      const alertable = next.events.filter(
        (event) => event.magnitude >= threshold,
      );
      if (!firstLoad.current && Notification.permission === "granted") {
        for (const event of alertable) {
          if (!seen.current.has(event.id))
            new Notification(`M ${event.magnitude.toFixed(1)} earthquake`, {
              body: `${event.place} · ${event.depthKm.toFixed(0)} km deep`,
              tag: event.id,
            });
        }
      }
      seen.current = new Set(next.events.map((event) => event.id));
      firstLoad.current = false;
      setFeed(next);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Live feed unavailable",
      );
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNotification(
        typeof Notification === "undefined"
          ? "unsupported"
          : Notification.permission,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker
      .register(`/sw.js?v=${SERVICE_WORKER_VERSION}`, {
        scope: "/",
        updateViaCache: "none",
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);
  const enableAlerts = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotification(result);
  };
  const useLocation = () => {
    setLocationError("");
    if (!navigator.geolocation)
      return setLocationError("This device does not provide location.");
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation([position.coords.longitude, position.coords.latitude]),
      () =>
        setLocationError(
          "Location was not shared. The monitor still works without it.",
        ),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };
  const events = useMemo(() => feed?.events || [], [feed]);
  const latest = events[0];
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-[#061827] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#ef5350]">
              <TriangleAlert size={22} />
            </div>
            <div>
              <p className="font-black tracking-[.16em]">PHOENIX SEISMO</p>
              <p className="text-[10px] tracking-wider text-sky-200">
                VENEZUELA EARTHQUAKE MONITOR
              </p>
            </div>
          </div>
          <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-[10px] font-black tracking-widest">
            LIVE USGS FEED
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7 md:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-red-700">
              VENEZUELA-FOCUSED · UPDATED EVERY MINUTE
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
              Know the shaking. Know what to do next.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              PHOENIX Seismo monitors public USGS earthquake data for Venezuela
              and nearby waters. It surfaces epicenter, depth, magnitude, and
              local browser alerts—without an account, API key, or tracking your
              location.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black tracking-widest text-slate-500">
              ALERT STATUS
            </p>
            <div className="mt-3 flex items-center gap-3">
              {notification === "granted" ? (
                <BellRing className="text-emerald-600" />
              ) : (
                <Bell className="text-slate-500" />
              )}
              <p className="font-bold">
                {notification === "granted"
                  ? `Alerting for M ${threshold.toFixed(1)}+`
                  : notification === "denied"
                    ? "Notifications blocked in browser"
                    : "Alerts are off"}
              </p>
            </div>
            <label className="mt-5 block text-sm font-bold">
              Minimum magnitude: M {threshold.toFixed(1)}
              <input
                aria-label="Alert magnitude"
                type="range"
                min="3"
                max="6"
                step="0.5"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
                className="mt-3 w-full accent-red-600"
              />
            </label>
            <button
              data-testid="enable-alerts"
              type="button"
              disabled={
                notification === "unsupported" || notification === "denied"
              }
              onClick={() => void enableAlerts()}
              className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white disabled:bg-slate-300"
            >
              {notification === "granted"
                ? "BROWSER ALERTS ENABLED"
                : "ENABLE LOCAL ALERTS"}
            </button>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Alerts work while this tab or installed app is open. This is not
              an official early-warning system and cannot predict earthquakes.
            </p>
          </div>
        </section>
        <section className="mt-8 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <div className="rounded-3xl bg-[#071f33] p-6 text-white">
            <p className="text-xs font-black tracking-widest text-sky-200">
              LATEST DETECTED EVENT
            </p>
            {loading && !latest ? (
              <p className="mt-5 text-lg">Connecting to seismic feed…</p>
            ) : latest ? (
              <>
                <p className="mt-5 text-6xl font-black">
                  M {latest.magnitude.toFixed(1)}
                </p>
                <p className="mt-3 text-lg font-bold leading-6">
                  {latest.place}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  {formatTime(latest.time)} · {latest.depthKm.toFixed(1)} km
                  deep
                </p>
                <a
                  href={latest.eventUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950"
                >
                  USGS EVENT DETAILS <ExternalLink size={14} />
                </a>
              </>
            ) : (
              <p className="mt-5 text-lg">
                No M2.5+ events in the monitored area over the last 24 hours.
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black tracking-widest text-slate-500">
                  VENEZUELA SEISMIC WINDOW
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Recent events and epicenters
                </h2>
              </div>
              <button
                data-testid="refresh-feed"
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black"
              >
                <RefreshCw
                  className={loading ? "animate-spin" : ""}
                  size={14}
                />
                REFRESH
              </button>
            </div>
            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-900"
              >
                <WifiOff className="mr-2 inline" size={16} />
                {error}. The last successful data remains visible when
                available.
              </div>
            ) : (
              <EventMap events={events} />
            )}
            <p className="mt-3 text-[11px] text-slate-500">
              Map is a schematic geographic view; it is not a navigation or
              hazard map.
            </p>
          </div>
        </section>
        <section className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <LocateFixed className="text-slate-700" />
              <div>
                <p className="text-xs font-black tracking-widest text-slate-500">
                  OPTIONAL DISTANCE
                </p>
                <h2 className="font-black">How far is an epicenter?</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your coordinates are used only in this browser to calculate
              distance; they are never sent to PHOENIX or USGS.
            </p>
            <button
              type="button"
              onClick={useLocation}
              className="mt-4 rounded-xl border border-slate-300 px-4 py-3 text-xs font-black"
            >
              <Crosshair className="mr-2 inline" size={14} />
              {location ? "LOCATION USED LOCALLY" : "CALCULATE DISTANCE"}
            </button>
            {locationError && (
              <p className="mt-3 text-xs font-bold text-red-800">
                {locationError}
              </p>
            )}
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-950">
              <b>Distance is not impact.</b> Local soil, building condition,
              depth, and official advisories determine risk.
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Earthquakes in the last 24 hours
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {events.length} EVENTS
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {events.map((event) => (
                <EventRow key={event.id} event={event} location={location} />
              ))}
              {!loading && events.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No M2.5+ earthquakes reported in the monitored Venezuela
                  window during the last 24 hours.
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Guide
            icon={ShieldAlert}
            title="During shaking"
            text="Drop, cover, and hold on. Stay away from windows. Do not run outside while the ground is moving."
          />
          <Guide
            icon={AlertTriangle}
            title="After shaking"
            text="Move away from damaged structures and downed wires. Expect aftershocks; follow official Civil Protection instructions."
          />
          <Guide
            icon={CircleAlert}
            title="Coastal areas"
            text="Follow official tsunami and coastal notices. Do not use this app as a tsunami warning source."
          />
        </section>
        <section className="mt-8 border-t border-slate-200 pt-6 text-xs leading-6 text-slate-500">
          <p>
            <b>Data:</b> USGS Earthquake Hazards Program public GeoJSON feed,
            refreshed every minute. PHOENIX filters a Venezuela-centered window
            (0–14°N, 74–57°W) and displays preliminary events as reported by
            USGS.
          </p>
          <p className="mt-2">
            <b>Safety:</b> PHOENIX Seismo is an information monitor, not a
            government warning authority, emergency dispatch service, or
            earthquake prediction tool. Follow official Venezuelan authorities
            in an emergency.
          </p>
        </section>
      </main>
    </div>
  );
}

function EventRow({
  event,
  location,
}: {
  event: SeismicEvent;
  location: [number, number] | null;
}) {
  const distance = location
    ? distanceKm(location, [event.longitude, event.latitude])
    : null;
  return (
    <article
      data-testid="event-row"
      className={`rounded-2xl border p-4 ${tone(event)}`}
    >
      <div className="flex gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-lg font-black">
          M{event.magnitude.toFixed(1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black">{event.place}</p>
            <span className="text-[10px] font-black tracking-wider">
              {label(event)}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5">
            Epicenter: {event.latitude.toFixed(3)}°,{" "}
            {event.longitude.toFixed(3)}° · depth {event.depthKm.toFixed(1)} km
            {distance !== null
              ? ` · about ${distance.toFixed(0)} km from you`
              : ""}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px]">
            <Clock3 size={12} />
            {formatTime(event.time)} · {event.status}
          </p>
        </div>
      </div>
    </article>
  );
}

function EventMap({ events }: { events: SeismicEvent[] }) {
  return (
    <div
      data-testid="epicenter-map"
      className="relative mt-5 h-64 overflow-hidden rounded-2xl border border-sky-200 bg-[radial-gradient(circle_at_35%_60%,#c8e5ed_0_1px,transparent_1px),linear-gradient(140deg,#dff3f8,#c3dce7)]"
    >
      <div className="absolute inset-y-0 left-[57%] w-[42%] rounded-l-[48%] bg-[#d6e3b8] opacity-90" />
      <span className="absolute right-5 top-6 text-xs font-black text-emerald-950">
        VENEZUELA
      </span>
      <span className="absolute left-4 bottom-4 text-[10px] font-black tracking-widest text-sky-900">
        CARIBBEAN SEA
      </span>
      {events.slice(0, 20).map((event) => (
        <span
          key={event.id}
          title={`${event.magnitude} ${event.place}`}
          className={`absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[10px] font-black shadow ${severity(event) === "critical" ? "bg-red-600 text-white" : severity(event) === "high" ? "bg-orange-500 text-white" : "bg-amber-400 text-slate-950"}`}
          style={{
            left: `${Math.min(93, Math.max(6, ((event.longitude + 74) / 17) * 100))}%`,
            top: `${Math.min(91, Math.max(8, ((14 - event.latitude) / 14) * 100))}%`,
          }}
        >
          M{event.magnitude.toFixed(1)}
        </span>
      ))}
    </div>
  );
}

function Guide({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldAlert;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon className="text-red-600" size={22} />
      <h2 className="mt-3 font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
