# Devpost submission kit — PHOENIX 72H

- **Track:** Apps for Your Life
- **Tagline:** An offline continuity card that helps earthquake survivors protect treatment, water, and a safe handoff in the first 72 hours.

## Ready-to-paste story

### Inspiration

When an earthquake disrupts clinics, water, power, and communications, the most dangerous need is often invisible: a person whose medication is about to run out, a newborn who needs continuity of care, or a family with unsafe water. Generic dashboards cannot solve the moment when a neighbor has a low-battery phone and needs to explain what matters to the next health worker.

We built PHOENIX 72H around that moment. It is not a coordination platform. It is an offline, private **continuity card** a person can physically hand to another person.

### What it does

PHOENIX asks five short questions: structural safety, broad area, household size, medication window, care-continuity flags, and drinking-water state. Its deterministic safety kernel produces an immediate priority tier and a short sequence of safe, source-aligned next actions.

It then creates a `PHX72` QR/SMS handoff card. The card carries only what a helper needs to understand urgency: broad area, household size, structural state, medication time remaining, continuity flags, and water state. It never includes names, exact coordinates, phone numbers, diagnoses, accounts, or a claim that help has been dispatched.

The app runs after its first load without connectivity. A trusted person can carry the QR, read the code, or copy the SMS at a health point. The browser-local card can be erased in one tap.

### Why it is different

Humanitarian technology often asks people to report into a system. PHOENIX makes the **human handoff** itself safer and more legible when there may be no system to report into.

Its innovation is a small, auditable protocol for “continuity triage”: it compresses the information most likely to become dangerous over the next 72 hours into a privacy-bounded, device-to-device artifact. The same deterministic rules that choose the priority lane also define the payload, so the app cannot invent a facility, a diagnosis, availability, or a rescue promise.

### How we built it

We used Next.js, React, TypeScript, a deterministic TypeScript rules engine, a service worker, local browser storage, QR encoding, and Playwright/Vitest tests. The service worker is versioned and uses a network-first strategy for application bundles, so a stale offline cache cannot leave the visible app with broken click handlers.

Codex and GPT-5.6 were core collaborators during Build Week: they challenged the original dashboard concept, researched the humanitarian context, helped design and implement the new workflow, and helped run the safety and browser/offline validation loop.

The deployed experience uses **no OpenAI API, API key, server, account, or paid runtime**. That is a deliberate resilience decision, not a missing feature.

### Challenges and lessons

The challenge was resisting attractive but unsafe features: live facility maps without verified operational data, unbounded AI chat in a medical/emergency scenario, and central data collection from people in crisis. We learned that a useful emergency product should make fewer promises, preserve more agency, and fail gracefully.

### What is next

We would validate the wording and workflow with Venezuelan health workers, disability advocates, caregivers, and people using low-end devices; add accessibility and locally translated packs; create signed, versioned guidance updates; and explore voluntary Bluetooth/Nearby Share transport without centralizing personal data.

## Three-minute demo script (2:40)

**0:00–0:20 — Problem.** “After an earthquake, injury is not the only emergency. People lose medication, safe water, records, power, and the words to explain what matters. PHOENIX 72H is an offline continuity card—not a dashboard.”

**0:20–0:55 — Check-in.** Select damaged building, choose La Guaira, choose one day of medication, and mark water uncertain. Show the priority instantly becoming **Act now** or **Do this today**. Explain that the logic is deterministic and visible.

**0:55–1:25 — Actionable output.** Show the ordered actions: do not re-enter, preserve medication information, seek care today, protect water. Point out the 15 L/person/day is labelled as a planning reference, not a supply promise.

**1:25–1:55 — Handoff.** Show the QR, compact `PHX72` code, and copied SMS. Explain exactly what it includes and excludes. “A neighbor can carry this to a health point; it does not pretend that a referral was sent.”

**1:55–2:15 — Privacy.** Reload the browser to show the card persists locally; press erase to show it disappears. Explain no account, GPS, name, diagnosis, or cloud database is involved.

**2:15–2:35 — Offline.** Switch the browser offline and reload after **READY** appears. Create or show the card again.

**2:35–2:40 — Codex.** “Codex and GPT-5.6 helped us replace a generic dashboard with this tested, offline-first product. The survivor-facing path needs no paid API.”

## Submission checklist

- [ ] Category: **Apps for Your Life**
- [ ] Add the English story above.
- [ ] Add a public demo URL.
- [ ] Add `https://github.com/Josemedinan/phoenix-ayuda`.
- [ ] Upload a public YouTube video under three minutes with spoken Codex/GPT-5.6 contribution.
- [ ] Run `/feedback` and add the required Codex Session ID.
- [ ] Test in a private window and offline after **READY** appears.
- [ ] Submit before the deadline on the [official rules page](https://openai.devpost.com/rules).
