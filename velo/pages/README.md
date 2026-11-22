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

Indonesian B2B tech exhibitions, maintained by the weekly run in `EXHIBITIONS.md`. Not built in Wix yet. To switch it on:

1. Run `setupExhibitionsCollection()` (backend/setupCollections.js) once from the Velo code panel.
2. Add `backend/exhibitionsImport.js` and the `importExhibitions` entry in `backend/jobs.config` (hourly, :50). Run `importExhibitions()` once by hand to fill the collection.
3. Build the pages like the article pages: a dynamic list page `/review/expo` and an item page `/review/expo/{slug}` (Indonesian and English through Wix Multilingual), plus Japanese copies `/jp/review/expo` and `/jp/review/expo/{slug}` that read `jaJson`; the English pages read `enJson`.
   - List: `status` upcoming/ongoing first by `startDate`, then `tba`, then `past`; filter by zone; hide `cancelled` older than 90 days. Highlight the `isOwnEvent` entry.
   - Item: name, dates (or "Tanggal belum diumumkan" + last edition when `dateStatus` is `tba`), city/venue, organiser, zones, admission, organiser figures with their edition year, summary, FAQ, official site (nofollow), sources, "Terakhir diperiksa: verifiedAt", and the VRI B2B Tech Asia box from the article template (not on the `isOwnEvent` page).
   - SEO: title/description from `seoTitle`/`seoDescription` (or the `en`/`ja` JSON), canonical + hreflang for the three language paths, and `Event` structured data:

```js
// item page, after loading `item` and `lang`
const t = lang === 'id' ? item : JSON.parse(item[lang + 'Json'] || '{}');
const ld = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: item.title,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: item.dateStatus === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
  location: { '@type': 'Place', name: item.venue || item.city, address: { '@type': 'PostalAddress', addressLocality: item.city, addressCountry: 'ID' } },
  organizer: { '@type': 'Organization', name: item.organizer, url: item.officialUrl },
  description: t.seoDescription
};
// Only when the dates are confirmed: Google requires startDate for Event results.
if (item.dateStatus === 'confirmed') {
  ld.startDate = item.startDate.toISOString().slice(0, 10);
  ld.endDate = item.endDate.toISOString().slice(0, 10);
  await wixSeoFrontend.setStructuredData([ld]);
}
```
