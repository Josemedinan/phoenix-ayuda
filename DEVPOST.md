# Devpost submission kit — PHOENIX Seismo

- **Track:** Apps for Your Life
- **Tagline:** A Venezuela-focused earthquake monitor that turns real-time public seismic data into clear local action.

## Ready-to-paste story

### Inspiration

In a seismic emergency, people do not need another generic dashboard. They need to know: did an event occur near Venezuela, where was its epicenter, how deep was it, how recent is the information, and what should I do right now? Public seismic data exists, but it is not designed around a person holding a phone after shaking.

PHOENIX Seismo is the focused layer between a public scientific feed and a Venezuelan resident. It keeps the uncertainty visible rather than creating false confidence.

### What it does

PHOENIX Seismo polls the USGS public GeoJSON feed every minute through a fixed, server-side Venezuela monitor window. It presents current events with magnitude, depth, epicenter coordinates, event time in Venezuela, review status, a simple event map, and the original USGS detail link.

People can choose an alert threshold and enable native browser notifications while the web app is open or installed. They can optionally calculate their approximate distance to an epicenter; coordinates remain in the browser and are never transmitted. The app also gives immediate, short guidance for shaking, damaged buildings, aftershocks, and coastal risk.

### Why it is different

The innovation is not claiming impossible earthquake prediction. It is **trustworthy attention management under uncertainty**: a local, understandable interface that couples a live scientific source with explicit alert boundaries and safe actions.

Unlike a map that treats every dot equally, PHOENIX explains the event’s magnitude, depth, distance, status, and source; lets the person select the signal level that merits interruption; and labels preliminary data as preliminary. It intentionally refuses to pretend an app can provide an official warning, dispatch rescue, or determine local damage.

### How we built it

We used Next.js route handlers, React, TypeScript, the USGS FDSN/GeoJSON interface, browser Notifications, browser Geolocation, a service worker, and Vitest/Playwright. The server endpoint fixes its own bounds and query parameters; the client never exposes a secret and the application requires no key.

Codex and GPT-5.6 were core development collaborators during Build Week. They helped challenge and replace the previous idea, research the official feed contract, design safety boundaries, implement the route handler and monitor, and validate it with type, unit, build, browser, and offline checks.

### Safety and limitations

PHOENIX is not an official Venezuelan warning authority, earthquake prediction system, emergency dispatch service, or tsunami warning source. Browser alerts work only while the app is open or active; a true background warning network requires formal authority integration and durable push infrastructure. Every event preserves a link back to USGS, and users are told to follow official Venezuelan authorities.

### What is next

We would validate the experience with Civil Protection, FUNVISIS, and residents using low-end Android devices; add an authorized national seismic feed when available; build a formally operated Web Push service; add accessibility-first audible/vibration patterns; and field-test language, threshold defaults, and aftershock guidance.

## Three-minute demo script (2:35)

**0:00–0:20 — The need.** “After shaking, people need trusted details quickly. PHOENIX Seismo is not a prediction app and does not imitate an official authority.”

**0:20–0:50 — Live source.** Show the live badge, refresh action, USGS source statement, latest magnitude, time, depth, and event status. Open the original USGS event link.

**0:50–1:20 — Epicenter.** Show the Venezuela-focused event view and a recent event card. Explain that the app distinguishes epicenter, depth, local distance, and impact; distance alone is not risk.

**1:20–1:45 — Personal alert.** Adjust the magnitude slider, request browser notification permission, and explain the monitor refreshes every minute while open/active.

**1:45–2:05 — Privacy and safety.** Use local distance. Point out that coordinates never leave the browser. Show the clear “during shaking” and “after shaking” actions.

**2:05–2:25 — Reliability.** Show the test suite and offline app shell. Explain that a stale cache cannot silently serve an old UI bundle.

**2:25–2:35 — Codex.** “Codex and GPT-5.6 helped us turn an unfocused concept into this live, tested, transparent seismic monitor. The person-facing product needs no OpenAI API.”

## Submission checklist

- [ ] Track: **Apps for Your Life**
- [ ] Add a public deployed URL.
- [ ] Add `https://github.com/Josemedinan/phoenix-ayuda`.
- [ ] Record a public YouTube demo shorter than three minutes.
- [ ] Explain Codex and GPT-5.6 contribution in the video audio.
- [ ] Add the required Codex `/feedback` Session ID.
- [ ] Verify browser notification permission and a live USGS event before recording.
- [ ] Submit before the official deadline.
