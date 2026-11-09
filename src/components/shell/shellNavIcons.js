/**
 * Shared Duo icon registry for chrome-shell primary navigation.
 * One concept → one icon, reused across all products for consistency.
 */
import { createElement } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  App,
  AppDots,
  Approved,
  Bank,
  Bell,
  Book,
  Building,
  Calendar,
  Certificate,
  ChartPie,
  CheckCircle,
  Clipboard,
  Compass,
  Dashboard,
  File,
  FolderOpen,
  IdCard,
  Settings,
  User,
} from '@duo-icons/react';
import { publicPath } from '../../lib/publicPath';

/**
 * Three-diamond sparkle for ARIES. Same duotone treatment as @duo-icons:
 * the two smaller stars sit on the secondary layer (30% opacity) and the
 * large star is the primary layer.
 */
export function AriesSparkle({ size = 24, className, ...props }) {
  return createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg',
      className: className ? `duo-icons ${className}` : 'duo-icons',
      ...props,
    },
    createElement('path', {
      fill: 'currentColor',
      className: 'duo-icons-secondary-layer',
      opacity: '.3',
      d: 'M18.4 3 19.45 5.35 21.8 6.4 19.45 7.45 18.4 9.8 17.35 7.45 15 6.4 17.35 5.35ZM17.2 15.45 17.84 16.96 19.35 17.6 17.84 18.24 17.2 19.75 16.56 18.24 15.05 17.6 16.56 16.96Z',
    }),
    createElement('path', {
      fill: 'currentColor',
      className: 'duo-icons-primary-layer',
      d: 'M9.2 6.8 10.71 11.89 15.8 13.4 10.71 14.91 9.2 20 7.69 14.91 2.6 13.4 7.69 11.89Z',
    }),
  );
}

/**
 * Official CLC product marks from the Styles file (new-favicons).
 * The exported SVGs are stored upside down; the Figma frame flips them
 * with scaleY(-1), and we do the same so the artwork matches the source.
 * Native width/height keep the sticker's aspect ratio inside the nav slot.
 */
function productMark(src, nativeW, nativeH) {
  function ProductMark({ size = 20, className, style, color: _color, ...props }) {
    const max = Number(size) || 20;
    const scale = max / Math.max(nativeW, nativeH);
    return createElement('img', {
      src: publicPath(src),
      alt: '',
      width: nativeW * scale,
      height: nativeH * scale,
      draggable: false,
      'aria-hidden': true,
      className,
      ...props,
      style: { display: 'block', transform: 'scaleY(-1)', ...style },
    });
  }
  return ProductMark;
}

export const ShellNavIcon = {
  home: Compass,
  aries: AriesSparkle,
  dashboard: Dashboard,
  analytics: ChartPie,
  reports: File,
  documents: FolderOpen,
  library: Book,
  tasks: CheckCircle,
  risk: AlertTriangle,
  incidents: AlertOctagon,
  users: User,
  settings: Settings,
  notifications: Bell,
  organization: Bank,
  entities: Building,
  compliance: Approved,
  clipboard: Clipboard,
  apps: App,
  more: AppDots,
  calendar: Calendar,
  training: Certificate,
  roles: IdCard,
  // Legal Solutions (CLC) product marks — Styles / new-favicons
  teamconnect: productMark('/product-icons/teamconnect.svg', 52.9885, 53.3584),
  hotdocs: productMark('/product-icons/hotdocs.svg', 50.6142, 58.9384),
  inszoom: productMark('/product-icons/inszoom.svg', 55.4524, 55.5051),
  tap: productMark('/product-icons/tap.svg', 49.4141, 60.0885),
  legalhold: productMark('/product-icons/legalhold.svg', 49.9416, 60.0229),
  mbr: productMark('/product-icons/mbr.svg', 68.5947, 41.1),
};
