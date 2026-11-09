/**
 * Content for the Legal Solutions (CLC) products that don't have a built-out
 * page in this prototype yet. Descriptions are grounded in the real products'
 * positioning so the placeholder reads like the thing it stands in for,
 * rather than a generic "coming soon" stub.
 */
export const PRODUCT_PLACEHOLDERS = {
  teamconnect: {
    name: 'TeamConnect',
    tagline: 'Enterprise Legal Management',
    description:
      "TeamConnect is Mitratech's matter management and e-billing platform for legal operations teams — tracking litigation, regulatory, IP, and compliance matters alongside budgets, vendor invoices, and outside counsel collaboration.",
    bullets: [
      'Matter lifecycle management across litigation, regulatory, IP, and compliance',
      'E-billing and budget collaboration with outside counsel and vendors',
      'Reporting and analytics for data-driven legal operations',
    ],
    icon: 'teamconnect',
  },
  hotdocs: {
    name: 'HotDocs',
    tagline: 'Document Automation',
    description:
      'HotDocs generates contracts and legal documents from intelligent templates, pulling in matter and party data so teams produce consistent, accurate documents in a fraction of the time of manual drafting.',
    bullets: [
      'Template-driven contract and document generation',
      'Conditional logic and clause libraries for consistent output',
      'Integration with matter and case data to pre-populate documents',
    ],
    icon: 'hotdocs',
  },
  inszoom: {
    name: 'INSZoom',
    tagline: 'Immigration Case Management',
    description:
      'INSZoom streamlines the immigration process for corporate immigration teams and law firms — tracking visa cases end to end, automating form filling, and giving Foreign National employees a self-service portal to upload documents and check status.',
    bullets: [
      'End-to-end visa and immigration case tracking',
      'I-9 / E-Verify compliance and audit-ready records',
      'Self-service Foreign National portal with automated reminders',
    ],
    icon: 'inszoom',
  },
  tap: {
    name: 'TAP',
    tagline: 'Workflow Automation',
    description:
      'TAP is a no-code workflow designer that lets legal and business teams build and deploy intake forms and approval workflows — new matter intake, NDAs, litigation holds, trademark requests — without engineering support.',
    bullets: [
      'No-code form and workflow designer, business-user owned',
      'Pre-built legal workflows: intake, NDAs, contract routing, litigation holds',
      'Reporting on cycle time, volume, and bottlenecks',
    ],
    icon: 'tap',
  },
  legalhold: {
    name: 'LegalHold',
    tagline: 'Legal Hold Management',
    description:
      'LegalHold manages the litigation hold lifecycle — issuing hold notices, tracking custodian acknowledgments, and keeping an audit-ready record of preservation obligations across every matter.',
    bullets: [
      'Custodian notices, acknowledgments, and reminders',
      'Centralized hold tracking across matters and data sources',
      'Audit-ready compliance reporting',
    ],
    icon: 'legalhold',
  },
  mbr: {
    name: 'MBR',
    tagline: 'Legal Spend Management & Analytics',
    description:
      'MBR gives legal operations visibility into outside counsel spend — budgets, invoices, and analytics across vendors and practice areas — to help teams control costs and benchmark performance.',
    bullets: [
      'Budget tracking and variance analysis by matter and vendor',
      'Spend analytics and benchmarking across practice areas',
      'Dashboards and reporting for legal ops leadership',
    ],
    icon: 'mbr',
  },
};

export function getProductPlaceholder(slug) {
  return PRODUCT_PLACEHOLDERS[slug];
}
