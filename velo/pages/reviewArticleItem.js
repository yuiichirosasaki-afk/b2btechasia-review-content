// Page code: Review Articles (Item) — URL /review/{slug}
// Layout (top to bottom): #customElement1 (<review-ui part="top">), #text747 (headline block, server-rendered),
// #image262 (hero data graphic), #text748 (article body, server-rendered),
// #customElement2 (<review-ui part="bottom">: related articles, Expo band, footer). Article text stays in Wix text elements so it is indexable.

import wixData from 'wix-data';
import wixSeoFrontend from 'wix-seo-frontend';
import wixWindowFrontend from 'wix-window-frontend';

const NAVY = '#0B2A4A';
const RED = '#B42318';
const INK = '#14181F';
const BODY = '#1F2630';
const SUB = '#5F6B7A';
const SERIF = "font-family:'Source Serif 4',Georgia,serif";
const SANS = "font-family:'IBM Plex Sans',system-ui,sans-serif";
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const TYPE_LABEL = { analisis: 'Analisis', berita: 'Berita', penjelasan: 'Penjelasan' };
const CAT_SLUG = { 'Cybersecurity': 'cybersecurity', 'AI & Data': 'ai-data', 'Cloud & Data Center': 'cloud-data-center', 'Enterprise Adoption': 'enterprise-adoption', 'Regulasi': 'regulasi', 'Deals': 'deals' };

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wib(d) { return new Date(new Date(d).getTime() + 7 * 3600 * 1000); }
function dateTime(d) {
  const x = wib(d);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}, ${String(x.getUTCHours()).padStart(2, '0')}.${String(x.getUTCMinutes()).padStart(2, '0')} WIB`;
}
function words(h) { return String(h || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }

function kicker(text, color) {
  return `<h2 style="font-size:13px; letter-spacing:0.1em; line-height:1.4"><span style="${SANS}; color:${color || NAVY}"><strong>${text}</strong></span></h2>`;
}

// Article HTML (p, ul, ol, li, h3, strong, em, a) → styled HTML. Lists become paragraphs with
// explicit markers because the site theme hides list bullets.
function body(html, opts) {
  const o = opts || {};
  const size = o.size || 19;
  const font = o.sans ? SANS : SERIF;
  let s = String(html || '');
  s = s.replace(/<ol>([\s\S]*?)<\/ol>/g, (m, inner) => {
    let n = 0;
    return inner.replace(/<li>([\s\S]*?)<\/li>/g, (mm, li) => `<p style="font-size:${size - 2}px; line-height:1.65; margin-left:26px; text-indent:-26px"><span style="${font}; color:${BODY}"><strong>${++n}.</strong>&nbsp;&nbsp;${li}</span></p>`);
  });
  s = s.replace(/<ul>([\s\S]*?)<\/ul>/g, (m, inner) =>
    inner.replace(/<li>([\s\S]*?)<\/li>/g, (mm, li) => `<p style="font-size:${size - 2}px; line-height:1.65; margin-left:22px; text-indent:-18px"><span style="${font}; color:${BODY}">•&nbsp;&nbsp;${li}</span></p>`));
  return s
    .replace(/<p>/g, `<p style="font-size:${size}px; line-height:1.7"><span style="${font}; color:${BODY}">`).replace(/<\/p>/g, '</span></p>')
    .replace(/<h3>/g, `<h3 style="font-size:24px; line-height:1.3"><span style="${SERIF}; color:${INK}"><strong>`).replace(/<\/h3>/g, '</strong></span></h3>')
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, `<a href="$1" target="_blank" rel="noopener"><span style="color:${NAVY}"><u>$2</u></span></a>`);
}

function gap(px) { return `<p style="font-size:${px}px; line-height:1"><span>&nbsp;</span></p>`; }

$w.onReady(async function () {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;

  const lang = (wixWindowFrontend.multilingual && wixWindowFrontend.multilingual.currentLanguage) || 'id';
  const base = lang && lang !== 'en' ? '/' + lang : '';
  const catSlug = CAT_SLUG[item.category] || '';
  const type = TYPE_LABEL[item.articleType] || 'Analisis';
  const readMin = Math.max(2, Math.round((words(item.summaryHtml) + words(item.analysisHtml) + words(item.actionHtml) + words(item.faqHtml)) / 200));

  const related = await wixData.query('ReviewArticles')
    .eq('category', item.category).ne('slug', item.slug).le('publishAt', new Date())
    .descending('publishAt').limit(3).find().then((r) => r.items).catch(() => []);
  const latest = related.length ? related : await wixData.query('ReviewArticles')
    .ne('slug', item.slug).le('publishAt', new Date()).descending('publishAt').limit(3).find().then((r) => r.items).catch(() => []);

  const chrome = { base, narrow: true, now: new Date().toISOString(), active: catSlug };
  const top = $w('#customElement1');
  const bottom = $w('#customElement2');
  top.setAttribute('part', 'top');
  bottom.setAttribute('part', 'bottom');
  top.setAttribute('data', JSON.stringify(chrome));
  bottom.setAttribute('data', JSON.stringify(Object.assign({}, chrome, {
    article: { category: item.category, audience: item.audience || [] },
    relatedTitle: related.length ? 'Lainnya di ' + item.category : 'Berita Terkait',
    related: latest.map((r) => ({ slug: r.slug, title: r.title, category: r.category, heroImage: r.heroImage || '' })),
  })));

  // Headline block
  const head = [];
  head.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}"><a href="/review"><span style="color:${SUB}">Berita</span></a> &nbsp;›&nbsp; <a href="/review?kategori=${catSlug}"><span style="color:${SUB}">${esc(item.category)}</span></a> &nbsp;›&nbsp; ${type}</span></p>`);
  head.push(gap(8));
  head.push(`<p style="font-size:12px; letter-spacing:0.1em"><span style="${SANS}; color:${RED}"><strong>${type.toUpperCase()}</strong></span><span style="${SANS}; color:${NAVY}"><strong> &nbsp;·&nbsp; ${esc(item.category).toUpperCase()}</strong></span></p>`);
  head.push(`<h1 style="font-size:46px; line-height:1.12"><span style="${SERIF}; color:${INK}"><strong>${esc(item.title)}</strong></span></h1>`);
  head.push(gap(6));
  head.push(`<p style="font-size:21px; line-height:1.5"><span style="${SERIF}; color:#333B47">${esc(item.dek)}</span></p>`);
  head.push(gap(6));
  head.push(`<p style="font-size:14px; line-height:1.6"><span style="${SANS}; color:${INK}"><strong>Redaksi B2B Tech Asia Review</strong></span><span style="${SANS}; color:#4A5361"> &nbsp;·&nbsp; ${dateTime(item.publishAt)} &nbsp;·&nbsp; ${readMin} menit baca</span></p>`);
  $w('#text747').html = head.join('');

  // Hero data graphic
  if (item.heroImage) {
    $w('#image262').src = item.heroImage;
    $w('#image262').alt = `${item.dataFigure || ''} ${item.dataLabel || ''}`.trim();
  } else {
    $w('#image262').collapse();
  }

  // Body
  const b = [];
  if (item.dataSource) {
    b.push(`<p style="font-size:13px; line-height:1.5"><span style="${SANS}; color:${SUB}">Grafis: B2B Tech Asia Review. Data: ${esc(item.dataSource)}.</span></p>`);
    b.push(gap(18));
  }
  b.push(kicker('RINGKASAN BERITA'));
  b.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}">Disusun dari laporan media. Kutipan langsung ditandai dan sumber dicantumkan.</span></p>`);
  b.push(body(item.summaryHtml, { sans: true, size: 17 }));
  b.push(gap(24));
  b.push(kicker(item.articleType === 'penjelasan' ? 'PENJELASAN' : 'DI BALIK BERITA', RED));
  b.push(body(item.analysisHtml));
  b.push(gap(24));
  b.push(kicker('APA ARTINYA BAGI ANDA', RED));
  b.push(body(item.actionHtml));
  if (item.faqHtml) {
    b.push(gap(24));
    b.push(kicker('PERTANYAAN YANG SERING DIAJUKAN'));
    b.push(body(item.faqHtml));
  }
  b.push(gap(24));
  b.push(kicker('SUMBER'));
  b.push(body(item.sourcesHtml, { sans: true, size: 16 }));
  b.push(`<p style="font-size:13px; line-height:1.6"><span style="${SANS}; color:${SUB}">Kutipan digunakan secara terbatas dengan menyebut sumber. Hak cipta kutipan tetap milik media masing-masing. Analisis adalah pandangan redaksi B2B Tech Asia Review.</span></p>`);
  $w('#text748').html = b.join('');

  const description = item.seoDescription || item.dek;
  await wixSeoFrontend.setTitle((item.seoTitle || item.title) + ' | B2B Tech Asia Review');
  await wixSeoFrontend.setMetaTags([
    { name: 'description', content: description },
    { property: 'og:title', content: item.seoTitle || item.title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' },
  ].concat(item.heroImage ? [{ property: 'og:image', content: item.heroImage }] : []));
  await wixSeoFrontend.setStructuredData([{
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description,
    image: item.heroImage ? [item.heroImage] : undefined,
    datePublished: new Date(item.publishAt).toISOString(),
    dateModified: new Date(item._updatedDate || item.publishAt).toISOString(),
    inLanguage: 'id',
    articleSection: item.category,
    author: { '@type': 'Organization', name: 'Redaksi B2B Tech Asia Review' },
    publisher: { '@type': 'Organization', name: 'B2B Tech Asia Review' },
  }]);
});
