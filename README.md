# Fiveg Nexus Lab

Build a polished, portfolio-quality full-stack web app named "5G Standalone Core Network Lab with Monitoring and Troubleshooting" for a junior Network & Communications Engineer applying to telecom Core Network roles. This is a monitoring and troubleshooting console for a separate Open5GS + UERANSIM lab running on Ubuntu; the web app does NOT itself deploy or implement a 5G core.

Primary goal: a usable responsive NOC-style dashboard that can demonstrate 5G SA concepts honestly. Use a professional telecom/NOC design: dark navy/slate background, restrained cyan/blue accents, strong contrast, dense but readable layout, desktop-first but responsive, no marketing landing page.

Build these screens/features:
1. Overview dashboard: status cards for AMF, SMF, UPF, AUSF, UDM, NRF; UE registrations; PDU sessions; registration success rate; recent alarms; uptime/test-run summary. Clearly display a persistent "DEMO DATA" label whenever showing seeded/sample data.
2. 5G Core topology view: UE -> UERANSIM gNB -> AMF/SMF/UPF and supporting AUSF/UDM/NRF. Use accurate, concise descriptions and distinguish control-plane from user-plane links. Do not imply this app is a 3GPP simulator.
3. Sessions table: subscriber/UE identifier (masked or fictional), registration state, PDU session state, assigned UE IP, last event, timestamp; searchable/filterable with detail drawer.
4. Events and alarms: severity, timestamp, network function, event type, message, status; filter by severity/function; acknowledge/resolve actions should work locally and update UI.
5. Troubleshooting workspace: selectable scenarios for failed UE registration, PDU session failure, unreachable UPF/user-plane connectivity, and a network function health check. For each, show symptoms, checks, example commands/log clues, likely causes, and verification steps. Keep command examples safe and appropriate for a local lab.
6. Test runs page: run history and outcomes for registration/session checks. Add a working "Run demo test" interaction that appends a clearly labeled simulated result; do not claim to contact a real core.
7. Data source/settings page: show current mode as "Demo data"; document a future integration contract for a local collector/API. Provide an import action for JSON data if practical, with validation and clear errors. Never invent real-time connectivity. Keep secrets out of frontend.
8. About/architecture page with project purpose, accurate Open5GS/UERANSIM context, limitations, and setup/integration notes.

Engineering requirements:
- Build functional interactions, not static-only mockup. Use the platform's normal stack and available database only if it genuinely helps; do not require paid external services.
- Seed realistic but fictional demo data; label it conspicuously as simulated. Include empty/error/loading states where relevant.
- Reuse consistent types and components; accessible labels; responsive tables/cards; no broken links or fake integration claims.
- Include a README-style in-app documentation section explaining architecture, which metrics/events are simulated, and how a future local collector could send JSON to an API endpoint. Avoid exposing any credentials.
- Include accurate terminology: 5G SA, UE, gNB, AMF, SMF, UPF, AUSF, UDM, NRF, registration, PDU session, N2/N3/N4 only where relevant. Do not conflate 5G Core with EPC.
- Make the initial version finishable and reliable. Prioritize Overview, Topology, Sessions, Events, Troubleshooting, Test Runs, and honest demo mode over unnecessary features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e72a4a53-5152-4f1e-8130-d83ab7869da5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
