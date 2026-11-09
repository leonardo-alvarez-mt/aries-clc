import { publicPath } from '../../../lib/publicPath';

/** Compact home starters. The row scrolls; shuffle reorders them. */
export const HOME_USE_CASES = [
  {
    id: 'question-refinement',
    label: 'Scope a new matter',
    icon: 'sparkles',
    prompt: 'Help me scope a new TeamConnect matter for a vendor contract dispute',
  },
  {
    id: 'nl-sql',
    label: 'Explore legal spend',
    icon: 'database',
    prompt: 'What was our total outside counsel spend by practice area last quarter?',
  },
  {
    id: 'visual-results',
    label: 'Show spend trends',
    icon: 'chart',
    prompt: 'Show me our legal spend trends by vendor for this fiscal year',
  },
  {
    id: 'bcp',
    label: 'Draft a document',
    icon: 'file',
    prompt: 'Draft an NDA using our HotDocs template for a new vendor engagement',
  },
  {
    id: 'questionnaire',
    label: 'Check a case status',
    icon: 'search',
    prompt: "What's the status of pending H-1B renewals in INSZoom this month?",
  },
  {
    id: 'glossary',
    label: 'Automate an intake',
    icon: 'book',
    prompt: 'Help me build a TAP workflow for new matter intake requests',
  },
  {
    id: 'controls',
    label: 'Review litigation holds',
    icon: 'shield',
    prompt: 'List all active legal holds and the custodians nearing a compliance deadline',
  },
  {
    id: 'findings',
    label: 'Summarize a matter',
    icon: 'list',
    prompt: 'Summarize the open tasks, budget status, and next deadlines for the Acme Corp litigation matter',
  },
];

/** Exact card model from ARIES-widget `noAgentAccessConfig.ts`. */
export const WELCOME_CARDS = [
  {
    id: 'question-refinement',
    label: 'Refine a legal request',
    icon: publicPath('aries/icon-question-refinement.svg'),
    description:
      'I help refine your questions about matters, workflows, and compliance to get more accurate and useful answers. This includes:',
    bullets: [
      'Clarifying ambiguities in your requests',
      'Adding matter, vendor, or jurisdiction context that might be missing',
      'Suggesting better ways to phrase your queries',
      'Breaking complex legal questions into simpler parts',
    ],
    prompt: 'Help me scope a new TeamConnect matter for a vendor contract dispute',
  },
  {
    id: 'nl-sql',
    label: 'Explore legal spend data',
    icon: publicPath('aries/icon-nl-sql.svg'),
    description:
      'I convert your plain-English questions into queries across your legal spend and matter data so you can explore it without writing reports. This includes:',
    bullets: ['Natural Language Processing', 'Query generation across TeamConnect & MBR data', 'Automatic Execution'],
    prompt: 'What was our total outside counsel spend by practice area last quarter?',
  },
  {
    id: 'visual-results',
    label: 'Visualize matter & spend trends',
    icon: publicPath('aries/icon-visual-results.svg'),
    description: 'I can present legal operations data in visual formats to make it easier to understand. Features include:',
    bullets: [
      'Converting spend and matter data into charts and graphs',
      'Creating tables for structured case and budget information',
      'Highlighting key metrics with visualizations',
      'Generating dashboards for comprehensive legal ops overviews',
    ],
    prompt: 'Show me our legal spend trends by vendor for this fiscal year',
  },
];

export const LIMITATIONS = [
  {
    id: 'ai-assistant',
    label: 'I am an AI-enabled chat assistant, not a person.',
    icon: publicPath('aries/icon-robot.svg'),
  },
  {
    id: 'reliable-data',
    label: 'I use reliable data, but I may not always fully understand your question.',
    icon: publicPath('aries/icon-warning.svg'),
  },
  {
    id: 'response-time',
    label: 'My responses may take a few seconds to generate.',
    icon: publicPath('aries/icon-timelapse.svg'),
  },
];

export const ICON_EXPAND = publicPath('aries/icon-expand.svg');
export const ICON_CLOSE = publicPath('aries/icon-close.svg');
export const AVATAR_BUTTON = publicPath('aries/avatar-button.svg');
