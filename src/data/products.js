/**
 * Products the shell knows about. This prototype ships a single shell entry —
 * Mitratech Legal Solutions (the CLC product suite) — so the product switcher
 * has a single entry and `activeProductId` never changes. The internal id
 * stays `alyne` (it keys the nav tree in `data/navigation.js` and the page
 * folder in `pages/alyne/`); only user-facing fields changed.
 */
export const products = [
  {
    id: 'alyne',
    name: 'Legal Solutions',
    tagline: 'Corporate Legal & Claims',
    iconLabel: 'MLS',
    url: '#',
    logoSrc: '/product-logos/legal-solutions.svg',
    iconSrc: '/product-icons/legal-solutions.svg',
    isCurrent: true,
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}
