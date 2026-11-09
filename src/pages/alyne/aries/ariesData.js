/** Seed data and scripted replies for the ARIES full-page prototype. */

export const ACCESS_LEVELS = [
  { id: 'none', label: 'No access' },
  { id: 'run', label: 'Can run' },
  { id: 'approval', label: 'Run with approval' },
  { id: 'edit', label: 'Run and edit' },
];

export const SKILL_SOURCES = [
  { id: 'personal', label: 'Personal' },
  { id: 'organisational', label: 'Organisational' },
  { id: 'aries', label: 'By ARIES' },
  { id: 'mitratech', label: 'By Mitratech' },
];

export const VISIBILITY_OPTIONS = [
  { id: 'me', label: 'Only me' },
  { id: 'team', label: 'My team' },
  { id: 'org', label: 'Organization' },
];

export const STARTER_PROMPTS = [
  {
    id: 'bcp',
    label: 'Matter budgets',
    description: 'See which open matters are off the approved outside counsel budget.',
    bullets: ['Compare fees to the matter budget', 'Flag the largest variances', 'Export the budget table'],
    prompt: 'Show the open matters where outside counsel spend is off budget',
  },
  {
    id: 'questionnaire',
    label: 'Legal holds',
    description: 'Find holds whose custodians are close to an acknowledgment deadline.',
    bullets: ['List active holds', 'Flag missing acknowledgments', 'Name the nearest deadline'],
    prompt: 'List active legal holds and the custodians nearing a compliance deadline',
  },
  {
    id: 'glossary',
    label: 'Draft an NDA',
    description: 'Start a vendor NDA from the HotDocs template and the matter record.',
    bullets: ['Pull parties from the matter', 'Apply the standard mutual NDA', 'Call out fields still missing'],
    prompt: 'Draft an NDA using our HotDocs template for a new vendor engagement',
  },
];

export const INITIAL_COMPANY_PROFILE = {
  name: 'Design Corp',
  industry: 'Financial services',
  regions: 'EMEA, North America',
  riskAppetite: 'Moderate — prefer controls that reduce residual risk below Medium',
  summary: 'Global design and technology services firm with regulated clients in banking and insurance.',
};

export const INITIAL_FRAMEWORKS = [
  { id: 'fw-iso', name: 'ISO 27001', inScope: true, type: 'framework' },
  { id: 'fw-soc2', name: 'SOC 2 Type II', inScope: true, type: 'framework' },
  { id: 'fw-gdpr', name: 'GDPR', inScope: true, type: 'framework' },
  { id: 'pol-isp', name: 'Information Security Policy', inScope: true, type: 'policy', uploaded: false },
  { id: 'pol-bcp', name: 'Business Continuity Policy', inScope: true, type: 'policy', uploaded: false },
];

export const INITIAL_GLOSSARY = [
  { id: 'g1', term: 'Residual risk', definition: 'Risk remaining after controls and mitigations are applied.' },
  { id: 'g2', term: 'Control owner', definition: 'Person accountable for operating and evidencing a control.' },
  { id: 'g3', term: 'Inherent risk', definition: 'Risk level before any control or mitigation is applied.' },
  { id: 'g4', term: 'Risk appetite', definition: 'The amount and type of risk the organisation is willing to retain.' },
];

export const INITIAL_SKILLS = [
  {
    id: 'sk-matter',
    name: 'Scope a matter',
    description: 'Turns a request into a TeamConnect matter: type, parties, jurisdiction, counsel, and budget.',
    source: 'aries',
    showOnHome: true,
  },
  {
    id: 'sk-spend',
    name: 'Outside counsel spend',
    description: 'Answers spend questions from MBR and TeamConnect by matter, vendor, and practice area.',
    source: 'mitratech',
    showOnHome: true,
  },
  {
    id: 'sk-draft',
    name: 'Draft from template',
    description: 'Generates an NDA, engagement letter, or contract from a HotDocs template and matter data.',
    source: 'mitratech',
    showOnHome: true,
  },
  {
    id: 'sk-intake',
    name: 'Matter intake',
    description: 'Builds a TAP intake for new matters, NDAs, and contract requests, including routing.',
    source: 'organisational',
    showOnHome: false,
  },
  {
    id: 'sk-hold',
    name: 'Legal hold check',
    description: 'Lists active holds, custodian acknowledgments, and notices nearing a deadline in LegalHold.',
    source: 'aries',
    showOnHome: false,
  },
  {
    id: 'sk-immigration',
    name: 'Immigration status',
    description: 'Summarizes INSZoom cases: pending filings, upcoming expirations, and missing documents.',
    source: 'organisational',
    showOnHome: false,
  },
  {
    id: 'sk-briefing',
    name: 'Matter briefing',
    description: 'Summarizes open tasks, budget, and the next deadlines for one TeamConnect matter.',
    source: 'personal',
    showOnHome: false,
  },
  {
    id: 'sk-invoice',
    name: 'Invoice review',
    description: 'Flags outside counsel invoice lines that fall outside billing guidelines or the matter budget.',
    source: 'personal',
    showOnHome: false,
  },
];

export const INITIAL_AGENTS = [
  {
    id: 'ag-weekly',
    name: 'Weekly questionnaire risk scan',
    instructions: 'Every week, look into questionnaire responses and create risks for material gaps.',
    visibility: 'org',
    schedule: 'Weekly',
    skillId: null,
  },
  {
    id: 'ag-bcp',
    name: 'BCP drafting agent',
    instructions: 'Analyse the open risk portfolio and draft a Business Continuity Plan.',
    visibility: 'team',
    schedule: null,
    skillId: null,
  },
];

export const TEAM_KNOWLEDGE = [
  { id: 'company', label: 'Company profile' },
  { id: 'frameworks', label: 'Frameworks & policies' },
  { id: 'glossary', label: 'Glossary' },
];

export const INITIAL_TEAMS = [
  {
    id: 'tm-grc',
    name: 'GRC Core',
    description: 'Owns the risk register, control testing and board reporting.',
    lead: 'Alex Chen',
    members: ['Alex Chen', 'Sam Rivera', 'Jordan Lee'],
    origin: 'aries',
    knowledge: ['company', 'frameworks', 'glossary'],
    sharedAgentIds: ['urgent-risk', 'daily-review', 'incident-recovery', 'vendor-survey'],
  },
  {
    id: 'tm-risk',
    name: 'Risk Operations',
    description: 'Runs the daily risk review and vendor assessments.',
    lead: 'Priya Nair',
    members: ['Priya Nair', 'Chris Wong'],
    origin: 'alyne',
    knowledge: ['frameworks', 'glossary'],
    sharedAgentIds: ['daily-review', 'vendor-survey'],
  },
  {
    id: 'tm-owners',
    name: 'Control Owners',
    description: 'Accountable for operating and evidencing controls.',
    lead: 'Alex Chen',
    members: ['Alex Chen', 'Morgan Blake'],
    origin: 'alyne',
    isOwner: true,
    knowledge: ['company', 'frameworks', 'glossary'],
    sharedAgentIds: ['urgent-risk', 'daily-review', 'incident-recovery'],
  },
];

export const CURRENT_USER = 'Alex Chen';

export const WORKSPACE_PEOPLE = [
  { name: 'Alex Chen', email: 'alex.chen@designcorp.com' },
  { name: 'Sam Rivera', email: 'sam.rivera@designcorp.com' },
  { name: 'Jordan Lee', email: 'jordan.lee@designcorp.com' },
  { name: 'Priya Nair', email: 'priya.nair@designcorp.com' },
  { name: 'Chris Wong', email: 'chris.wong@designcorp.com' },
  { name: 'Morgan Blake', email: 'morgan.blake@designcorp.com' },
  { name: 'Elena Fischer', email: 'elena.fischer@designcorp.com' },
  { name: 'Tomás Ortega', email: 'tomas.ortega@designcorp.com' },
  { name: 'Hannah Weber', email: 'hannah.weber@designcorp.com' },
];

/** access[teamId][resourceId] -> level id */
export const INITIAL_ACCESS = {
  'tm-grc': {
    'ag-weekly': 'edit',
    'ag-bcp': 'edit',
    'sk-matter': 'edit',
    'sk-spend': 'edit',
    'sk-draft': 'run',
    'sk-intake': 'run',
    'sk-hold': 'edit',
    'sk-immigration': 'none',
    'sk-briefing': 'run',
    'sk-invoice': 'approval',
  },
  'tm-risk': {
    'ag-weekly': 'run',
    'ag-bcp': 'approval',
    'sk-matter': 'run',
    'sk-spend': 'run',
    'sk-draft': 'approval',
    'sk-intake': 'none',
    'sk-hold': 'run',
    'sk-immigration': 'none',
    'sk-briefing': 'run',
    'sk-invoice': 'none',
  },
  'tm-owners': {
    'ag-weekly': 'edit',
    'ag-bcp': 'edit',
    'sk-matter': 'edit',
    'sk-spend': 'edit',
    'sk-draft': 'edit',
    'sk-intake': 'edit',
    'sk-hold': 'edit',
    'sk-immigration': 'edit',
    'sk-briefing': 'edit',
    'sk-invoice': 'edit',
  },
};

export const BCP_TABLE_ROWS = [
  { id: 'M-101', title: 'Acme Corp — contract dispute', rating: 'High', recovery: '$186k over', owner: 'Litigation' },
  { id: 'M-118', title: 'Northwind Cloud — vendor agreement', rating: 'Medium', recovery: '$48k over', owner: 'Commercial' },
  { id: 'M-142', title: 'Helios patent filing', rating: 'High', recovery: '$92k over', owner: 'Intellectual Property' },
  { id: 'M-155', title: 'Regional employment claim', rating: 'Low', recovery: '$12k over', owner: 'Employment' },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d.toISOString();
}

export const VENDOR_BRIEFING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Northwind Cloud — engagement briefing</title>
<style>
  body { margin: 0; background: #f4f7fb; color: #0f172a; font: 14px/1.5 "Segoe UI", sans-serif; }
  main { max-width: 720px; margin: 0 auto; padding: 28px 24px 40px; }
  header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  h1 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
  .meta { margin: 4px 0 0; color: #64748b; font-size: 12px; }
  .decision { margin: 0; border-radius: 999px; background: #0067d2; color: #fff; padding: 6px 12px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
  .metric { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
  .metric span { display: block; color: #64748b; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
  .metric strong { display: block; margin-top: 4px; font-size: 18px; }
  .high { color: #b42318; }
  .medium { color: #b54708; }
  section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin-top: 12px; }
  h2 { margin: 0 0 8px; font-size: 14px; }
  ul, ol { margin: 0; padding-left: 18px; }
  li { margin: 6px 0; }
  footer { margin-top: 16px; color: #64748b; font-size: 12px; }
</style>
</head>
<body>
<main>
  <header>
    <div>
      <h1>Northwind Cloud</h1>
      <p class="meta">Outside counsel engagement · Design Corp · Legal operations</p>
    </div>
    <p class="decision">Approve with conditions</p>
  </header>
  <div class="metrics">
    <div class="metric"><span>Fees to date</span><strong>$248k</strong></div>
    <div class="metric"><span>Approved budget</span><strong>$200k</strong></div>
    <div class="metric"><span>Variance</span><strong class="high">$48k over</strong></div>
  </div>
  <section>
    <h2>Why this matter is in front of legal operations</h2>
    <p>Northwind Cloud is a vendor agreement in TeamConnect (M-118), staffed by outside counsel in Commercial. Fees are already past the approved budget, and the next invoice is in review in MBR.</p>
  </section>
  <section>
    <h2>Invoice and guideline issues</h2>
    <ul>
      <li><strong>Block billing on the last invoice.</strong> 18 hours are grouped into a single narrative, which the billing guidelines do not allow.</li>
      <li><strong>Rate above the agreed fee schedule.</strong> A senior associate billed $85 above the matter rate card.</li>
      <li><strong>No budget comment from the matter lead.</strong> The $48k variance has no written explanation on the TeamConnect record.</li>
    </ul>
  </section>
  <section>
    <h2>Conditions before the next invoice is approved</h2>
    <ol>
      <li>Ask counsel to reissue the invoice with task-level entries.</li>
      <li>Adjust the senior associate time to the agreed rate, or document an approved exception.</li>
      <li>Have the Commercial lead add a budget note and a revised forecast on M-118.</li>
    </ol>
  </section>
  <footer>Prepared for legal operations from the TeamConnect matter and the open MBR invoice. The variance stays $48k over until all three conditions are met.</footer>
</main>
</body>
</html>`;

export const INITIAL_CHATS = [
  {
    id: 'ch-today',
    title: 'Matters over outside counsel budget',
    skillId: 'sk-spend',
    updatedAt: daysAgo(0),
    messages: [
      { id: 'm1', role: 'user', content: 'Show the open matters where outside counsel spend is off budget' },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'I compared approved budgets in TeamConnect with invoices in MBR. Four open matters are over budget. Acme Corp is the largest variance at $186k; the regional employment claim is $12k over.\n\nThe budget table is below.',
        outputId: 'out-bcp',
        sources: ['TeamConnect', 'MBR'],
        related: [
          'Which matter is furthest over budget?',
          'Draft a note to Litigation on the Acme variance',
          'Who should own the budget exception?',
        ],
      },
    ],
  },
  {
    id: 'ch-vendor-html',
    title: 'Northwind Cloud engagement briefing',
    skillId: 'sk-briefing',
    updatedAt: daysAgo(1),
    messages: [
      {
        id: 'm1',
        role: 'user',
        content:
          'Turn the Northwind Cloud vendor agreement into an HTML briefing for legal operations. Cover fees, the budget variance, invoice issues, and a decision.',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'I prepared a one-page briefing for legal operations. Matter M-118 is $48k over its $200k budget, and the decision is Approve with conditions: reissue the block-billed invoice, correct the rate, and add a budget note before the next invoice is paid.\n\nThe HTML report is below.',
        outputId: 'out-vendor-html',
        sources: ['TeamConnect', 'MBR'],
        related: [
          'What if we reject the next invoice?',
          'Draft the fee-cap clause for Northwind',
          'Who should approve these conditions?',
        ],
      },
    ],
  },
  {
    id: 'ch-week',
    title: 'Holds nearing a deadline',
    skillId: 'sk-hold',
    updatedAt: daysAgo(2),
    messages: [
      { id: 'm1', role: 'user', content: 'List active legal holds and the custodians nearing a compliance deadline' },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Three active holds in LegalHold have custodians who have not acknowledged. The Acme litigation hold is closest: 4 custodians are due in 3 days. The Helios patent hold has 2 outstanding, due in 9 days. The employment claim hold is fully acknowledged.',
        sources: ['LegalHold', 'TeamConnect'],
        related: [
          'Which hold is closest to the deadline?',
          'Draft a reminder for the custodians who have not acknowledged',
        ],
      },
    ],
  },
  {
    id: 'ch-older',
    title: 'Vendor NDA from HotDocs',
    skillId: 'sk-draft',
    updatedAt: daysAgo(12),
    messages: [
      { id: 'm1', role: 'user', content: 'Draft an NDA using our HotDocs template for a new vendor engagement' },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'I drafted a mutual NDA from the HotDocs vendor template for a new Northwind engagement. Parties, purpose, and a two-year term are filled in. Governing law and the notice address are still blank on the matter record.',
        sources: ['HotDocs', 'TeamConnect'],
        related: ['Set the governing law to New York', 'Which template fields are still empty?'],
      },
    ],
  },
];

export function titleFromPrompt(prompt) {
  const trimmed = prompt.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}…`;
}

export function scriptedReply(prompt, profile) {
  const lower = prompt.toLowerCase();
  const org = profile.name || 'your organisation';

  if (
    lower.includes('off budget') ||
    lower.includes('outside counsel') ||
    lower.includes('furthest over budget') ||
    lower.includes('budget exception') ||
    lower.includes('acme variance')
  ) {
    return {
      content: `I compared approved budgets in TeamConnect with invoices in MBR for ${org}. Four open matters are over budget. Acme Corp is the largest variance at $186k; the regional employment claim is $12k over.\n\nThe budget table is below.`,
      outputId: 'out-bcp',
      skillId: 'sk-spend',
      sources: ['TeamConnect', 'MBR'],
      related: [
        'Which matter is furthest over budget?',
        'Draft a note to Litigation on the Acme variance',
        'Who should own the budget exception?',
      ],
    };
  }
  if (
    lower.includes('html briefing') ||
    lower.includes('html report') ||
    lower.includes('engagement briefing') ||
    (lower.includes('northwind') && (lower.includes('html') || lower.includes('briefing')))
  ) {
    return {
      content:
        'I prepared a one-page briefing for legal operations. Matter M-118, Northwind Cloud, is $48k over its $200k budget. The decision is Approve with conditions: reissue the block-billed invoice, correct the rate, and add a budget note before the next invoice is paid.\n\nThe HTML report is below.',
      outputId: 'out-vendor-html',
      skillId: 'sk-briefing',
      sources: ['TeamConnect', 'MBR'],
      related: [
        'What if we reject the next invoice?',
        'Draft the fee-cap clause for Northwind',
        'Who should approve these conditions?',
      ],
    };
  }
  if (lower.includes('legal hold') || lower.includes('custodian') || lower.includes('holds')) {
    return {
      content:
        'Three active holds in LegalHold have custodians who have not acknowledged. The Acme litigation hold is closest: 4 custodians are due in 3 days. The Helios patent hold has 2 outstanding, due in 9 days. The employment claim hold is fully acknowledged.',
      skillId: 'sk-hold',
      sources: ['LegalHold', 'TeamConnect'],
      related: [
        'Which hold is closest to the deadline?',
        'Draft a reminder for the custodians who have not acknowledged',
      ],
    };
  }
  if (lower.includes('hotdocs') || lower.includes('nda') || lower.includes('governing law') || lower.includes('template field')) {
    return {
      content:
        'I drafted a mutual NDA from the HotDocs vendor template. Parties, purpose, and a two-year term are filled in from the matter. Governing law and the notice address are still blank.',
      skillId: 'sk-draft',
      sources: ['HotDocs', 'TeamConnect'],
      related: ['Set the governing law to New York', 'Which template fields are still empty?'],
    };
  }
  if (lower.includes('intake') || lower.includes('tap')) {
    return {
      content:
        'A TAP intake for a new matter needs the requesting team, matter type, counterparty, and whether outside counsel is required. I can route NDAs to Commercial and litigation holds to the hold coordinator.',
      skillId: 'sk-intake',
      sources: ['TAP', 'TeamConnect'],
      related: ['Add outside counsel as a required field', 'Who should approve a new matter request?'],
    };
  }
  if (lower.includes('inszoom') || lower.includes('h-1b') || lower.includes('immigration') || lower.includes('visa')) {
    return {
      content:
        'INSZoom shows 6 H-1B renewals pending this month. Two are missing the employee’s passport scan, and one filing date is inside 14 days.',
      skillId: 'sk-immigration',
      sources: ['INSZoom'],
      related: ['Which renewal is closest to the filing date?', 'Draft a reminder for the missing passport scans'],
    };
  }
  return {
    content: `Here’s a first pass for ${org}. I used the open TeamConnect matters and the related Legal Solutions records so the answer stays tied to the matter, the budget, and the documents already on file.`,
    sources: ['TeamConnect'],
    related: ['Show the matters that are over budget', 'Summarize the next deadlines'],
  };
}

export function exportCsv(rows) {
  const headers = Object.keys(rows[0] || { id: '', title: '', rating: '', recovery: '', owner: '' });
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aries-output.csv';
  a.click();
  URL.revokeObjectURL(url);
}
