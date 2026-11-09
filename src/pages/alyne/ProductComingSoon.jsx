import { Sparkles } from 'lucide-react';
import { pageShellClass, t } from './alyneTokens';
import { ShellNavIcon } from '../../components/shell/shellNavIcons';
import { getProductPlaceholder } from '../../data/productPlaceholders';

/** Placeholder landing page for a Legal Solutions product that doesn't have
 *  a built-out surface in this prototype yet. Reachable from the sidebar so
 *  clicking a product shows a real description instead of silently
 *  redirecting to Home. */
export default function ProductComingSoon({ slug }) {
  const product = getProductPlaceholder(slug);
  if (!product) return null;

  const Icon = ShellNavIcon[product.icon] ?? Sparkles;

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-2xl px-8 py-16">
        <div
          className="mb-5 flex size-12 items-center justify-center rounded-xl"
          style={{ background: '#EEF3F8' }}
        >
          <Icon size={24} className="text-[#0067D2]" aria-hidden />
        </div>

        <h1 className="mb-1 text-[26px] font-bold leading-tight" style={{ color: t.textPrimary }}>
          {product.name}
        </h1>
        <p className="mb-5 text-sm font-medium" style={{ color: t.accent }}>
          {product.tagline}
        </p>

        <p className="mb-6 text-[15px] leading-relaxed" style={{ color: t.textSecondary }}>
          {product.description}
        </p>

        <ul className="mb-8 flex flex-col gap-2.5">
          {product.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm" style={{ color: t.textSecondary }}>
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: t.accent }}
                aria-hidden="true"
              />
              {bullet}
            </li>
          ))}
        </ul>

        <div
          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium"
          style={{ background: t.bgHeader, color: t.textMuted, border: `1px solid ${t.borderSubtle}` }}
        >
          This surface isn't built out in this prototype yet — ARIES is the only product
          with a working experience here.
        </div>
      </div>
    </div>
  );
}
