# Page code for the dynamic pages

## Review article page — `/review/{slug}` (collection: ReviewArticles)

```js
import wixSeoFrontend from 'wix-seo-frontend';

$w.onReady(async () => {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;
  await wixSeoFrontend.setTitle(item.seoTitle || item.title);
  await wixSeoFrontend.setMetaTags([
    { name: 'description', content: item.seoDescription || item.dek }
  ]);
  await wixSeoFrontend.setStructuredData([{
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.seoDescription || item.dek,
    datePublished: new Date(item.publishAt).toISOString(),
    dateModified: new Date(item._updatedDate).toISOString(),
    inLanguage: 'id',
    articleSection: item.category,
    author: { '@type': 'Organization', name: 'Redaksi B2B Tech Asia Review' },
    publisher: { '@type': 'Organization', name: 'B2B Tech Asia Expo' }
  }]);
});
```

## Siaran Pers page — `/siaran-pers/{slug}` (collection: SiaranPers)

The full text also lives on VRITIMES and its partner media, so the page points search engines to the original.

```js
import wixSeoFrontend from 'wix-seo-frontend';

$w.onReady(async () => {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item || !item.sourceUrl) return;
  await wixSeoFrontend.setLinks([{ rel: 'canonical', href: item.sourceUrl }]);
});
```

## Exhibition database — `/review/expo` and `/review/expo/{slug}` (collection: ReviewExhibitions)

Indonesian B2B tech exhibitions, maintained by the monthly run in `EXHIBITIONS.md`. Live since 2026-11-22.

| Wix page | URL | Wix code file | Repo file |
|---|---|---|---|
| Review Expo (List) — a copy of Review Articles (List) | `/review/expo`, `/id/review/expo` | `public/pages/nso4f.js` | `velo/pages/reviewIndex.js` |
| Review Expo JP (List) — a copy of the Japanese list page | `/jp/review/expo` | `public/pages/rrwic.js` | `velo/pages/reviewIndex.js` |
| Review Exhibitions (Item) — dynamic item page on ReviewExhibitions | `/review/expo/{slug}`, `/id/review/expo/{slug}` | `public/pages/rxfcg.js` | `velo/pages/reviewExpoItem.js` |
| Review Expo JP (Item) — a copy of the item page | `/jp/review/expo/{slug}` | `public/pages/riqwz.js` | `velo/pages/reviewExpoItem.js` |

- `reviewIndex.js` is the same file on all four list pages (articles and calendar): a URL ending in `/review/expo` (or `?kategori=expo`) shows the calendar.
- The item pages hold the same five elements as the article page (`#customElement1`, `#text747`, `#image262`, `#text748`, `#customElement2`); the image is collapsed by the page code. All four pages use the layout "No header & footer".
- Backend: `backend/exhibitionsImport.js` (hourly, :50, in `backend/jobs.config`) upserts `exhibitions.json` into ReviewExhibitions. The collection was created with `setupExhibitionsCollection()`.
- List: upcoming/ongoing by month, then "dates not announced" (last edition shown), then past; a cancelled event leaves the list 90 days after it was last checked. Filters: search, city (when there is more than one), hub, date status. The `isOwnEvent` entry is the navy block.
- Item: name, status, dates (or "not yet announced" + previous edition), venue, organiser, zones, admission, official site (nofollow), summary, organiser figures with their edition, FAQ, sources, "last checked"; then official site / add to calendar / report a correction, other exhibitions, and the Expo band (not on the `isOwnEvent` page, which gets register / exhibit buttons instead).
- SEO: title and description from `seoTitle`/`seoDescription` (or the `en`/`ja` JSON), canonical + hreflang for the three language paths, `ItemList` on the list, and `Event` structured data on item pages only when `dateStatus` is `confirmed`.
- To change code: edit the repo file, then replace the matching Wix code file in the editor (Dev Mode) and publish.
