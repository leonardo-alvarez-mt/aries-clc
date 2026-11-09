/**
 * Navigation model for the Legal Solutions chrome shell.
 *
 * Extracted from the Chrome Shell navigation model, reduced to a flat list of
 * CLC (Corporate Legal & Claims) products. This is the single source of truth
 * for both the sidebar and the breadcrumb trail (see `lib/shellBreadcrumbs`) —
 * a nav item's ancestors here are its breadcrumb ancestors, and its `path` is
 * its route.
 *
 * Only ARIES has a page behind it in this prototype. The other products are
 * kept so the sidebar reads like the real Legal Solutions shell; they fall
 * through to the catch-all route and return to Home.
 */

import { ShellNavIcon } from '../components/shell/shellNavIcons';

const I = ShellNavIcon;

export const alyneNavSections = [
  {
    id: 'main',
    label: '',
    items: [
      { id: 'aries', label: 'ARIES™', icon: I.aries, activeIcon: I.aries, path: '/aries' },
      { id: 'teamconnect', label: 'TeamConnect', icon: I.teamconnect, activeIcon: I.teamconnect, path: '/teamconnect' },
      { id: 'hotdocs', label: 'HotDocs', icon: I.hotdocs, activeIcon: I.hotdocs, path: '/hotdocs' },
      { id: 'inszoom', label: 'INSZoom', icon: I.inszoom, activeIcon: I.inszoom, path: '/inszoom' },
      { id: 'tap', label: 'TAP', icon: I.tap, activeIcon: I.tap, path: '/tap' },
      { id: 'legalhold', label: 'LegalHold', icon: I.legalhold, activeIcon: I.legalhold, path: '/legalhold' },
      { id: 'mbr', label: 'MBR', icon: I.mbr, activeIcon: I.mbr, path: '/mbr' },
    ],
  },
];

export const productNavSections = {
  alyne: alyneNavSections,
};

/**
 * This is the only nav tree in this prototype, so it's also the fallback the
 * shell reaches for when no product-specific tree matches (and the tree the
 * mobile drawer renders).
 */
export const primaryNavSections = alyneNavSections;
