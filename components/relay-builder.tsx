"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Languages, LockKeyhole } from "lucide-react";
import type { HouseholdProfile, PocketPlan } from "@/domain/pocket";
import { buildLocalRelay, relayFactsSchema } from "@/domain/relay";

export function RelayBuilder({
  profile,
  plan,
  goPlan,
}: {
  profile: HouseholdProfile;
  plan: PocketPlan | null;
  goPlan: () => void;
}) {
  const [copied, setCopied] = useState<"es" | "en" | null>(null);
  const facts = useMemo(() => {
    if (!plan) return null;
    const candidate = relayFactsSchema.safeParse({
      areaCode: profile.areaCode,
      people: profile.people,
      needs: profile.needs,
      unsafeBuilding: profile.unsafeBuilding,
      privacySafeCode: plan.privacySafeCode,
    });
    return candidate.success ? candidate.data : null;
  }, [plan, profile]);
  const relay = useMemo(() => (facts ? buildLocalRelay(facts) : null), [facts]);

  if (!facts || !plan || !relay) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Languages className="mx-auto text-slate-300" size={44} />
        <h1 className="mt-4 text-2xl font-black">Create your plan first</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The relay is built only from validated fields: broad area, household
          size, needs, and structural risk.
        </p>
        <button
          onClick={goPlan}
          className="mt-5 rounded-xl bg-[#f5c95e] px-5 py-3 text-sm font-bold"
        >
          CREATE A PLAN
        </button>
      </section>
    );
  }

  const copy = async (language: "es" | "en") => {
    const body =
      language === "es" ? relay.spanishMessage : relay.englishMessage;
    await navigator.clipboard.writeText(`${body}\n${plan.privacySafeCode}`);
    setCopied(language);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
      <section className="rounded-2xl bg-[#07131b] p-6 text-white shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5c95e] text-slate-950">
          <Languages size={24} />
        </div>
        <p className="mt-5 text-[10px] font-bold tracking-[.16em] text-amber-300">
          PHOENIX RELAY
        </p>
        <h1 className="mt-2 text-3xl font-black">
          One need. Two languages. No invented facts.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          PHOENIX creates a ready-to-share Spanish and English request directly
          on the device. It works with no account, no network, and no API key.
        </p>
        <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4 text-xs leading-5 text-slate-300">
          <LockKeyhole className="mr-2 inline text-emerald-300" size={15} />
          No names, free-form notes, or exact coordinates enter this relay. Its
          message is a transparent transformation of the plan you can inspect.
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[.15em] text-slate-500">
              LOCAL RELAY · AVAILABLE OFFLINE
            </p>
            <h2 className="mt-2 text-2xl font-black">Message ready to share</h2>
          </div>
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-wider text-emerald-900">
            <Check className="mr-1 inline" size={12} /> VERIFIED PAYLOAD
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold tracking-widest text-slate-500">
              SIMPLE SPANISH
            </p>
            <p data-testid="relay-spanish" className="mt-3 text-sm leading-6">
              {relay.spanishMessage}
            </p>
            <button
              onClick={() => copy("es")}
              className="mt-4 text-xs font-black"
            >
              <Clipboard className="mr-1 inline" size={14} />{" "}
              {copied === "es" ? "COPIED" : "COPY + CODE"}
            </button>
          </article>
          <article className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold tracking-widest text-slate-500">
              INTERNATIONAL ENGLISH
            </p>
            <p data-testid="relay-english" className="mt-3 text-sm leading-6">
              {relay.englishMessage}
            </p>
            <button
              onClick={() => copy("en")}
              className="mt-4 text-xs font-black"
            >
              <Clipboard className="mr-1 inline" size={14} />{" "}
              {copied === "en" ? "COPIED" : "COPY + CODE"}
            </button>
          </article>
        </div>
        <div className="mt-4 rounded-xl bg-sky-50 p-4">
          <p className="text-[10px] font-bold tracking-widest text-sky-900">
            READ-ALOUD VERSION
          </p>
          <p className="mt-2 text-sm leading-6 text-sky-950">
            {relay.readAloudSpanish}
          </p>
        </div>
        <p className="mt-4 break-all font-mono text-[10px] leading-5 text-slate-500">
          {plan.privacySafeCode}
        </p>
        <p className="mt-4 text-xs leading-5 text-red-800">
          This does not dispatch help or replace official channels. In immediate
          danger, use available official services or ask a nearby person for
          help.
        </p>
      </section>
    </div>
  );
}
