import Link from 'next/link';
import SeoJsonLd from './SeoJsonLd';

export default function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((it, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": it.name,
      "item": `https://syntance.com${it.href}`
    }))
  };

  return (
    <nav aria-label="Ścieżka nawigacji" className="text-sm text-gray-500 mb-6">
      <ol className="flex gap-2 items-center">
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-gray-400">›</span>}
            {i === items.length - 1 ? (
              <span className="text-gray-300">{it.name}</span>
            ) : (
              <Link href={it.href} className="hover:text-white transition-colors">
                {it.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <SeoJsonLd json={json} />
    </nav>
  );
}
