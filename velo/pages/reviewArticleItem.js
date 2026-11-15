// Page code: Review Articles (Item) — URL /review/{slug}
// The whole article is rendered into one text element (#text747) so it is
// server-rendered and indexable. Layout helpers live in public/reviewUi.js.

import wixData from 'wix-data';
import wixSeoFrontend from 'wix-seo-frontend';
import { C, TYPE_LABEL, esc, fmtDate, p, a, rule, masthead, expoBox, footer, ink, categorySlug } from 'public/reviewUi.js';

const SERIF = "font-family:'playfair display',georgia,serif";

function heading(text) {
  return `<h2 style="font-size:26px; line-height:1.3"><span style="color:${C.navy}">${text}</span></h2>`;
}

$w.onReady(async function () {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;

  const related = await wixData.query('ReviewArticles')
    .eq('category', item.category).ne('slug', item.slug).le('publishAt', new Date())
    .descending('publishAt').limit(3).find().then((r) => r.items).catch(() => []);

  const parts = [masthead(categorySlug(item.category))];

  parts.push(p(`<strong>${a('/review?kategori=' + categorySlug(item.category), esc(item.category).toUpperCase(), C.red)}</strong><span style="color:${C.muted}"> · ${TYPE_LABEL[item.articleType] || 'Analisis'}</span>`, 13, C.red, 'letter-spacing:0.06em'));
  parts.push(`<h1 style="font-size:38px; line-height:1.15"><span style="color:${C.head}">${esc(item.title)}</span></h1>`);
  parts.push(p(esc(item.dek), 20, '#333B47', 'line-height:1.5'));
  parts.push(p(`Redaksi B2B Tech Asia Review · ${fmtDate(item.publishAt)}`, 14, C.muted));
  parts.push(p('&nbsp;', 6, C.ink));

  if (item.dataFigure) {
    parts.push(rule());
    parts.push(`<p style="font-size:60px; line-height:1.05; ${SERIF}"><span style="color:${C.navy}">${esc(item.dataFigure)}</span></p>`);
    parts.push(p(esc(item.dataLabel), 17, '#333B47'));
    parts.push(p(`Sumber: ${esc(item.dataSource)}`, 12, C.muted));
    parts.push(rule());
  }

  parts.push(heading('Ringkasan Berita'));
  parts.push(p('Disusun dari laporan media. Kutipan langsung ditandai dan sumber dicantumkan.', 13, C.muted));
  parts.push(ink(item.summaryHtml));
  parts.push(heading(item.articleType === 'penjelasan' ? 'Penjelasan' : 'Di Balik Berita'));
  parts.push(ink(item.analysisHtml));
  parts.push(heading('Apa Artinya bagi Anda'));
  parts.push(ink(item.actionHtml));
  if (item.faqHtml) {
    parts.push(heading('Pertanyaan yang Sering Diajukan'));
    parts.push(ink(item.faqHtml));
  }
  parts.push(heading('Sumber'));
  parts.push(ink(item.sourcesHtml));
  parts.push(p('Kutipan digunakan secara terbatas dengan menyebut sumber. Hak cipta kutipan tetap milik media masing-masing. Analisis adalah pandangan redaksi B2B Tech Asia Review.', 13, C.muted));

  parts.push(expoBox());

  if (related.length) {
    parts.push(`<h2 style="font-size:22px"><span style="color:${C.head}">Lainnya di ${esc(item.category)}</span></h2>`);
    related.forEach((r) => {
      parts.push(`<h3 style="font-size:19px; line-height:1.35">${a('/review/' + r.slug, esc(r.title), C.head)}</h3>`);
      parts.push(p(fmtDate(r.publishAt), 13, C.muted));
    });
  }
  parts.push(p(a('/review', '← Semua artikel B2B Tech Asia Review', C.accent), 16, C.accent));
  parts.push(footer());

  $w('#text747').html = parts.join('');

  const description = item.seoDescription || item.dek;
  await wixSeoFrontend.setTitle((item.seoTitle || item.title) + ' | B2B Tech Asia Review');
  await wixSeoFrontend.setMetaTags([
    { name: 'description', content: description },
    { property: 'og:title', content: item.seoTitle || item.title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' },
  ]);
  await wixSeoFrontend.setStructuredData([{
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description,
    datePublished: new Date(item.publishAt).toISOString(),
    dateModified: new Date(item._updatedDate || item.publishAt).toISOString(),
    inLanguage: 'id',
    articleSection: item.category,
    author: { '@type': 'Organization', name: 'Redaksi B2B Tech Asia Review' },
    publisher: { '@type': 'Organization', name: 'B2B Tech Asia Review' },
  }]);
});
