# Devpost submission kit

## Submission identity

- **Project:** PHOENIX Aid
- **Track:** Apps for Your Life
- **Tagline:** An offline household lifeline for Venezuela that turns urgent needs into a verified plan and bilingual relay.
- **Differentiation:** PHOENIX makes the critical path work without a connection, account, location trail, API key, or a model call.

## Ready-to-paste project story

### Inspiration

Humanitarian products often begin with a map or an operations dashboard. We began with the person holding a low-battery phone after an earthquake: connectivity may disappear, exact location can be sensitive, a mapped hospital may not be open, and a long form is the last thing anyone needs. The useful question was: “What can this household safely do and communicate right now?”

### What it does

PHOENIX turns a handful of privacy-preserving choices into an ordered, source-attributed household plan that works offline. It calculates a transparent minimum-water reference, stores an offline safety guide, ranks mapped facilities by distance entirely in the browser, and creates a compact QR/SMS request with no name or coordinate.

Its signature feature is PHOENIX Relay: a Spanish and English message created directly from the exact plan fields. It has no free-form prompt, account, API key, or connection requirement. The same visible fields—broad area, household size, need codes, and structural risk—are used in the plan, compact code, and relay, so users can inspect the message before they share it.

### How we built it

We used Next.js, React, TypeScript, Zod, a service worker, QR encoding, and reviewed OpenStreetMap-derived facility data. Critical guidance is a deterministic TypeScript rules engine with explicit source IDs. Geospatial ranking runs on-device.

Codex and GPT-5.6 were core development collaborators throughout Build Week. They helped reframe the product away from a non-actionable coordination dashboard, inspect the competition rules, research primary humanitarian sources, implement and refactor the app, build the pipeline, and verify it with unit, type, build, browser, mobile, and offline tests.

### Challenges

The hardest design problem was avoiding a fragile dependency where the app needs a paid model or a live network at the exact moment a household needs help. We chose a progressive, offline-first architecture: deterministic source-attributed guidance, privacy-safe local calculation, and a bilingual relay built from an allowlist of visible facts.

Another challenge was being honest about humanitarian data. Facility points are useful for proximity but not proof of operational status. PHOENIX labels that uncertainty instead of implying live availability.

### Accomplishments

- The core experience remains useful after the network is switched off.
- No account, name, exact coordinate, free-form prompt, or paid API is required.
- Every critical plan action is traceable to a visible source.
- The repository includes reviewed public data and automated tests.
- The language relay is available without asking a remote system to invent or reinterpret emergency facts.

### What we learned

In high-stakes consumer software, graceful degradation is a product feature. The essential path should be deterministic, inspectable, and usable with limited connectivity. AI was valuable in the development process for research synthesis, engineering iteration, and testing; the deployed emergency workflow must remain useful without it.

### What's next

Next steps are field testing with Venezuelan families and accessibility experts; community-reviewed indigenous-language packs; signed, versioned offline source updates; local device-to-device relay over Bluetooth; and partnerships that can supply verified facility status without turning PHOENIX into a centralized tracker.

## Three-minute demo script (target: 2:45)

**0:00–0:18 — Problem.** “After a disaster, maps and dashboards do not help if a household has no connection, cannot expose its location, or cannot explain its needs. PHOENIX is a household lifeline, not a coordination platform.”

**0:18–0:48 — Immediate value.** On mobile, tap **I need water**. Show the ordered plan, the 45 L reference for one person over three days, source labels, and the limitation explaining that 15 L/person/day is contextual—not a maximum.

**0:48–1:12 — Privacy and low bandwidth.** Open **Ask for help**. Show the QR and compact `PHX1` code. Point out that it carries a broad area and need categories, not a name or coordinate.

**1:12–1:38 — Bilingual relay.** Open **Bilingual relay**. Show the Spanish, English, and read-aloud messages. Explain that all three are generated locally from the same verified plan fields, with no API key or network.

**1:38–2:00 — Privacy-aware proximity.** Open **Near me** and explain that ranking happens inside the browser and every mapped facility is marked status unknown.

**2:00–2:20 — Evidence and safety.** Open **Sources**. Show PAHO/WHO, CDC, WHO, Sphere, and OSM limitations.

**2:20–2:45 — Codex + resilience.** Briefly show the repository tests and architecture. Switch the browser offline, reload, and show the plan, guide, request, and relay still working. Explain that Codex and GPT-5.6 were used to build and validate PHOENIX, while the deployed emergency path remains usable without paid services.

The video must be public on YouTube, under three minutes, and its audio must explain Codex and GPT-5.6 collaboration under the [official rules](https://openai.devpost.com/rules).

## Submission checklist

- [ ] Create the Devpost submission under **Apps for Your Life**.
- [ ] Add the English project description above.
- [ ] Add the public, unrestricted demo URL: `[ADD DEMO URL]`.
- [ ] Add this repository URL: `https://github.com/Josemedinan/phoenix-ayuda`.
- [ ] Record a public YouTube demo shorter than 3:00: `[ADD VIDEO URL]`.
- [ ] Explain how Codex and GPT-5.6 were core collaborators in the video's audio.
- [ ] Run `/feedback` in the Codex session and add the Session ID: `[ADD CODEX SESSION ID]`.
- [ ] Test the deployed URL in a private window without signing in.
- [ ] Test offline reload after the service worker reports **OFFLINE READY**.
- [ ] Submit before the deadline shown on the [official competition page](https://openai.devpost.com/).

## Judging criteria map

| Criterion                    | What to demonstrate                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Technological implementation | Offline PWA, deterministic safety kernel, local privacy boundary, QR/SMS protocol, reproducible data validation, automated tests               |
| Design                       | Four-tap water journey, clear offline state, mobile-first cards, readable uncertainty and privacy boundaries, no account                       |
| Potential impact             | Works under degraded connectivity, preserves privacy, crosses a language barrier, supports a household's next action without claiming dispatch |
| Quality of idea              | A reliable household lifeline designed for the actual disaster context instead of a generic dashboard or chatbot                               |
