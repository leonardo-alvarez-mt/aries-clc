# ARIES CLC — Legal Solutions prototype

Clickable prototype of the **Mitratech Legal Solutions** (CLC, Corporate Legal &
Claims) product suite, built around **ARIES™**, the AI legal workspace. It is a
usability-testing build: the shell, navigation, and data are realistic, but all
matters, vendors, people, and figures are sample data.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Dev server at `/`                                         |
| `npm run build`       | Production build (honours `VITE_BASE_PATH`)               |
| `npm run build:local` | Production build served from `/`                          |
| `npm run preview`     | Serve the last build locally                              |

## What's in the prototype

### Product shell

The left rail lists the Legal Solutions products: **ARIES™**, **TeamConnect**,
**HotDocs**, **INSZoom**, **TAP**, **LegalHold**, and **MBR**. Each product has
its own icon from the Figma source of truth. The rail collapses to icons and
shows flyouts on hover.

| Product      | Positioning                                              | Status in prototype        |
| ------------ | -------------------------------------------------------- | -------------------------- |
| ARIES™       | AI legal workspace (chat, agents, skills, knowledge)     | Built out (see below)      |
| TeamConnect  | Enterprise legal management and e-billing                | Placeholder landing page   |
| HotDocs      | Document and contract automation                         | Placeholder landing page   |
| INSZoom      | Immigration case management                              | Placeholder landing page   |
| TAP          | No-code workflow automation                              | Placeholder landing page   |
| LegalHold    | Legal hold management                                    | Placeholder landing page   |
| MBR          | Legal spend management and analytics                     | Placeholder landing page   |

### ARIES™ workspace (`/aries`)

- **Chat** — recent chats list, with scripted replies. Keywords
  open side panels: "budget" or "outside counsel" opens the **Matter budgets**
  table (open matters over budget, with CSV export), and "briefing" or
  "Northwind" opens the **Northwind Cloud engagement briefing** (HTML output).
  Holds and NDA prompts route to the matching skills.
- **Agents** — agent registry and the workflow designer
  (`/aries/agents/:agentId/flow`).
- **Knowledge** — **Company profile** (Design Corp sample company),
  **Frameworks & policies** (ISO 27001, SOC 2 Type II, GDPR, and policies in
  scope), **Skills**, and **Glossary**.
- **Admin** — **Teams** (GRC Core, Risk Operations, Control Owners) and
  **Workflow access** (per-team run and edit permissions).

Skills are CLC-specific: matter scoping, outside counsel spend, draft from
template (HotDocs), matter intake (TAP), legal hold check, immigration status
(INSZoom), matter briefing, and invoice review. Each skill is tagged personal,
organisational, by ARIES, or by Mitratech.

Starter prompts: **Matter budgets**, **Legal holds**, and **Draft an NDA**.

### Other surfaces

The original Alyne pages are still routed and reachable from the code, though
they are not in the product rail: Governance controls, Control Sets (with
detail pages), Compliance questionnaires, and Risk management. The home page
(`/`) is the Alyne home.

## Project layout

- `src/App.jsx` — routes. ARIES is mounted at `/aries`; each CLC product
  placeholder is mounted at its slug (`/hotdocs`, `/tap`, and so on).
- `src/data/navigation.js` — product rail tree (single source for sidebar and
  breadcrumbs).
- `src/data/productPlaceholders.js` — copy for the six placeholder pages.
- `src/pages/alyne/aries/` — ARIES workspace. Sample data lives in
  `ariesData.js` (chats, skills, agents, teams, budget table, briefing HTML,
  and the scripted reply rules).
- `src/components/shell/` — shared app frame (header, sidebar, breadcrumbs,
  flyout nav, menus, appearance panel).
- `public/product-icons/` — CLC product marks from Figma, loaded through
  `src/lib/publicPath.js` so they resolve under the Pages subpath.

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds on every
push to `main` and publishes to GitHub Pages. It sets `VITE_BASE_PATH` to
`/<repo-name>/` so assets resolve on a project site, and copies `index.html` to
`404.html` so client-side routes survive a deep link (Pages has no rewrite
rules).

> [!WARNING]
> **Publishing exposes this prototype to the open internet.** This repository
> is public, and a GitHub Pages site in this organisation is public regardless
> of repository visibility (the GitHub Team plan does not offer private Pages;
> that requires GitHub Enterprise Cloud). Do not enable Pages until this has
> been cleared with **AI@mitratech.com**. Until Pages is enabled, the deploy
> job has nothing to publish to and will fail.

## Known limitations

- **Most sidebar entries have no page.** Only ARIES and the six placeholder
  products are reachable from the rail. Other nav entries fall through to the
  catch-all route and return to Home.
- **Chat replies are scripted.** Only the keyword rules in `scriptedReply()`
  (`src/pages/alyne/aries/ariesData.js`) produce answers; anything else gets a
  generic reply.
- **Agent names still reflect the earlier GRC scope.** The agents "Weekly
  questionnaire risk scan" and "BCP drafting agent" have not been renamed to
  CLC use cases.
- **Row-level detail pages exist only for Control Sets.** Clicking a row in
  the Alyne Controls, Questionnaires, or Risks tables leads nowhere useful.
