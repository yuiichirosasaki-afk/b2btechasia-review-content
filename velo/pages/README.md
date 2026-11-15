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
