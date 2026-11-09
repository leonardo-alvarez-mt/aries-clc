export const REGISTRY_AGENTS = [
  {
    id: 'urgent-risk',
    name: 'Urgent Risk Report with Mitigation Gap Analysis',
    cadence: 'Manual',
    owner: 'Brian Wardell',
    ownerInitials: 'BW',
    status: 'active',
    subAgents: ['Risk Mitigation Agent', 'Compliance Agent'],
    steps: [
      { name: 'Collect high-severity risks', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Map mitigation coverage', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Check control gaps', subAgent: 'Compliance Agent', gate: false },
      { name: 'Approve and send the report', subAgent: 'Compliance Agent', gate: true },
    ],
    lastRun: 'Sept 21, 13:21',
    lastRunOutcome: 'held',
    lastRunNote: 'Held at “Approve and send the report”',
    pending: [
      { step: 'Approve and send the report', requested: 'Sept 21', ageDays: 16, assignee: 'Brian Wardell' },
    ],
  },
  {
    id: 'daily-review',
    name: 'Daily review of critical risks',
    cadence: 'Scheduled, daily',
    owner: 'Brian Wardell',
    ownerInitials: 'BW',
    status: 'active',
    subAgents: ['Risk Mitigation Agent'],
    steps: [
      { name: 'Pull critical risks', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Summarize changes since yesterday', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Post the digest', subAgent: 'Risk Mitigation Agent', gate: false },
    ],
    lastRun: 'Oct 7, 09:15',
    lastRunOutcome: 'completed',
    lastRunNote: 'Completed all 3 steps',
    pending: [],
  },
  {
    id: 'vendor-survey',
    name: 'Vendor Survey Assessment Agent',
    cadence: 'Manual',
    owner: 'Priya Nair',
    ownerInitials: 'PN',
    status: 'active',
    subAgents: ['Vendor Survey Agent'],
    steps: [
      { name: 'Send the vendor survey', subAgent: 'Vendor Survey Agent', gate: false },
      { name: 'Score the responses', subAgent: 'Vendor Survey Agent', gate: false },
      { name: 'Approve the vendor rating', subAgent: 'Vendor Survey Agent', gate: true },
    ],
    lastRun: 'Oct 6, 16:40',
    lastRunOutcome: 'failed',
    lastRunNote: 'Failed at “Score the responses”',
    pending: [],
  },
  {
    id: 'incident-recovery',
    name: 'Incident recovery summary',
    cadence: 'Scheduled, weekly',
    owner: 'Continuity Manager',
    ownerInitials: 'CM',
    ownerNote: 'Owner is a role',
    status: 'active',
    subAgents: ['Continuity Agent', 'Risk Mitigation Agent'],
    steps: [
      { name: 'Gather the incident timeline', subAgent: 'Continuity Agent', gate: false },
      { name: 'Approve the recovery summary', subAgent: 'Continuity Agent', gate: true },
      { name: 'Approve the residual risk update', subAgent: 'Risk Mitigation Agent', gate: true },
    ],
    lastRun: 'Oct 5, 08:00',
    lastRunOutcome: 'completed',
    lastRunNote: 'Completed, 2 approvals still open',
    pending: [
      { step: 'Approve the recovery summary', requested: 'Oct 5', ageDays: 3, assignee: 'Continuity Manager' },
      { step: 'Approve the residual risk update', requested: 'Oct 7', ageDays: 1, assignee: 'Continuity Manager' },
    ],
  },
  {
    id: 'e2e-test',
    name: 'E2E Scheduled Test Agent 2',
    cadence: 'Scheduled, monthly',
    owner: 'Platform QA',
    ownerInitials: 'QA',
    status: 'inactive',
    subAgents: ['Risk Mitigation Agent'],
    steps: [
      { name: 'Run the scheduled checks', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Record the results', subAgent: 'Risk Mitigation Agent', gate: false },
    ],
    lastRun: 'Sept 30, 17:36',
    lastRunOutcome: 'completed',
    lastRunNote: 'Completed all 2 steps',
    pending: [],
  },
  {
    id: 'vendor-decision',
    name: 'Vendor decision routing',
    cadence: 'Event, vendor assessment completed',
    owner: 'Priya Nair',
    ownerInitials: 'PN',
    status: 'active',
    subAgents: ['Vendor Survey Agent', 'Risk Mitigation Agent'],
    steps: [
      { name: 'Read the assessment', subAgent: 'Vendor Survey Agent', gate: false },
      { name: 'Residual rating', subAgent: 'Decision', gate: false },
      { name: 'Draft conditions', subAgent: 'Risk Mitigation Agent', gate: false },
      { name: 'Approve conditions', subAgent: 'Risk Mitigation Agent', gate: true },
      { name: 'Record the decision', subAgent: 'Vendor Survey Agent', gate: false },
    ],
    lastRun: 'Oct 8, 11:04',
    lastRunOutcome: 'ended',
    lastRunNote: 'Ended because residual rating was High. 3 steps skipped.',
    pending: [],
    graph: {
      nodes: {
        trigger: {
          type: 'trigger',
          title: 'Assessment completed',
          schedule: 'manual',
        },
        read: {
          type: 'agent',
          title: 'Read the assessment',
          agent: 'Vendor Survey Agent',
          instruction:
            'Read the assessment and list the control gaps a risk officer would act on. Do not use anything that was not passed in.',
          inputs: ['trigger'],
          gate: false,
        },
        decision: {
          type: 'decision',
          title: 'Residual rating',
          instruction: 'Rate the residual risk from the assessment.',
          inputs: ['read'],
          gate: false,
          questions: [
            { id: 'rating', name: 'rating', type: 'choice', options: ['High', 'Medium', 'Low'] },
          ],
          endRuns: [
            {
              id: 'end-high',
              match: 'all',
              comparisons: [{ questionId: 'rating', operator: 'equals', values: ['High'] }],
              reason: 'Residual risk is High and requires remediation before approval.',
            },
          ],
          sample: { selected: 'High', confidence: '0.91' },
        },
        draft: {
          type: 'agent',
          title: 'Draft conditions',
          agent: 'Risk Mitigation Agent',
          instruction: 'Draft the conditions a risk officer would impose before this vendor goes live.',
          inputs: ['decision'],
          gate: false,
        },
        approve: {
          type: 'agent',
          title: 'Approve conditions',
          agent: 'Risk Mitigation Agent',
          instruction: 'Ask the owner to approve the conditions before they are recorded.',
          inputs: ['draft'],
          gate: true,
        },
        record: {
          type: 'agent',
          title: 'Record the decision',
          agent: 'Vendor Survey Agent',
          instruction: 'Record the vendor decision on the assessment.',
          inputs: ['decision'],
          gate: false,
        },
      },
      edges: [
        { from: 'trigger', to: 'read', kind: 'next' },
        { from: 'read', to: 'decision', kind: 'next' },
        {
          from: 'decision',
          to: 'draft',
          kind: 'conditional',
          match: 'all',
          comparisons: [{ questionId: 'rating', operator: 'equals', values: ['Medium'] }],
        },
        { from: 'draft', to: 'approve', kind: 'next' },
        { from: 'approve', to: 'record', kind: 'next' },
        { from: 'decision', to: 'record', kind: 'default' },
      ],
      runs: [
        {
          id: 'run-low',
          time: 'Oct 21, 16:40',
          status: 'completed',
          summary: 'Default path · rating is Low',
          pathTaken: 'Default',
          steps: {
            trigger: { state: 'completed', duration: '0.1 s' },
            read: { state: 'completed', duration: '1.1 s' },
            decision: {
              state: 'completed',
              duration: '0.1 s',
              answers: [
                {
                  questionId: 'rating',
                  name: 'rating',
                  options: ['High', 'Medium', 'Low'],
                  selected: 'Low',
                  confidence: '0.88',
                  decidedBy: 'Decision model',
                },
              ],
              endRuns: [{ id: 'end-high', met: false }],
            },
            draft: { state: 'not-taken' },
            approve: { state: 'not-taken' },
            record: { state: 'completed', duration: '0.6 s' },
          },
        },
        {
          id: 'run-high',
          time: 'Oct 8, 11:04',
          status: 'ended-early',
          summary: 'Ended early · rating is High',
          reason: 'Residual risk is High and requires remediation before approval.',
          pathTaken: 'End run · rating is High',
          steps: {
            trigger: { state: 'completed', duration: '0.1 s' },
            read: { state: 'completed', duration: '1.4 s' },
            decision: {
              state: 'completed',
              duration: '0.1 s',
              answers: [
                {
                  questionId: 'rating',
                  name: 'rating',
                  options: ['High', 'Medium', 'Low'],
                  selected: 'High',
                  confidence: '0.91',
                  decidedBy: 'Decision model',
                },
              ],
              endRuns: [{ id: 'end-high', met: true }],
            },
            draft: { state: 'ended-earlier' },
            approve: { state: 'ended-earlier' },
            record: { state: 'ended-earlier' },
          },
        },
        {
          id: 'run-failed',
          time: 'Oct 2, 09:18',
          status: 'failed',
          summary: 'Residual rating · decision model error',
          reason: 'The decision model returned no option.',
          failedStep: 'decision',
          steps: {
            trigger: { state: 'completed', duration: '0.1 s' },
            read: { state: 'completed', duration: '0.8 s' },
            decision: {
              state: 'failed',
              duration: '0.4 s',
              reason: 'The decision model returned no option.',
            },
            draft: { state: 'ended-earlier' },
            approve: { state: 'ended-earlier' },
            record: { state: 'ended-earlier' },
          },
        },
      ],
    },
  },
];

export function agentHealth(agent) {
  if (agent.status === 'inactive') return 'inactive';
  if (agent.lastRunOutcome === 'failed') return 'failed';
  if (agent.pending.length > 0) return 'waiting';
  return 'healthy';
}

export function oldestPendingDays(agent) {
  return agent.pending.reduce((oldest, item) => Math.max(oldest, item.ageDays), 0);
}

export const REGISTRY_OWNERS = [...new Set(REGISTRY_AGENTS.map((agent) => agent.owner))];

export const REGISTRY_SUMMARY = (() => {
  const active = REGISTRY_AGENTS.filter((agent) => agent.status === 'active').length;
  const waitingAgents = REGISTRY_AGENTS.filter((agent) => agent.pending.length > 0);
  const oldest = REGISTRY_AGENTS.reduce((best, agent) =>
    oldestPendingDays(agent) > oldestPendingDays(best) ? agent : best
  );
  const failed = REGISTRY_AGENTS.filter((agent) => agent.lastRunOutcome === 'failed');
  return {
    total: REGISTRY_AGENTS.length,
    active,
    inactive: REGISTRY_AGENTS.length - active,
    pending: waitingAgents.reduce((sum, agent) => sum + agent.pending.length, 0),
    waitingAgents: waitingAgents.length,
    oldest,
    oldestDays: oldestPendingDays(oldest),
    failed,
  };
})();
