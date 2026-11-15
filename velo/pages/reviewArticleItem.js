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
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EN_TYPE = { analisis: 'Analysis', berita: 'News', penjelasan: 'Explainer' };
const TXT = {
  id: {
    news: 'Berita', byline: 'Redaksi B2B Tech Asia Review', minRead: 'menit baca', graphic: 'Grafis: B2B Tech Asia Review. Data:',
    summary: 'RINGKASAN BERITA', summaryNote: 'Disusun dari laporan media. Kutipan langsung ditandai dan sumber dicantumkan.',
    behind: 'DI BALIK BERITA', explainer: 'PENJELASAN', action: 'APA ARTINYA BAGI ANDA', faq: 'PERTANYAAN YANG SERING DIAJUKAN', sources: 'SUMBER',
    rights: 'Kutipan digunakan secara terbatas dengan menyebut sumber. Hak cipta kutipan tetap milik media masing-masing. Analisis adalah pandangan redaksi B2B Tech Asia Review.',
    moreIn: (c) => 'Lainnya di ' + c, related: 'Berita Terkait', author: 'Redaksi B2B Tech Asia Review',
  },
  en: {
    news: 'News', byline: 'B2B Tech Asia Review editors', minRead: 'min read', graphic: 'Graphic: B2B Tech Asia Review. Data:',
    summary: 'NEWS IN BRIEF', summaryNote: 'Compiled from media reports. Direct quotes are marked and sources are listed.',
    behind: 'BEHIND THE NEWS', explainer: 'EXPLAINER', action: 'WHAT IT MEANS FOR YOU', faq: 'FREQUENTLY ASKED QUESTIONS', sources: 'SOURCES',
    rights: 'Quotations are used sparingly and credited to their source. Copyright in quoted material remains with each publisher. Analysis reflects the view of the B2B Tech Asia Review editors.',
    moreIn: (c) => 'More in ' + c, related: 'Related', author: 'B2B Tech Asia Review editors',
  },
};
// Categories = B2B Tech Asia Expo 2027 zones. Keep in sync with taxonomy.json.
const HUBS = [
  ['AI & Automation Hub', 'ai-automation-hub', [['AI & Automation', 'ai-automation'], ['Cloud & IT Infrastructure', 'cloud-it-infrastructure'], ['Cybersecurity & Data Protection', 'cybersecurity-data-protection'], ['Enterprise Software & ERP', 'enterprise-software-erp']]],
  ['Growth & Revenue Hub', 'growth-revenue-hub', [['Marketing Technology', 'marketing-technology'], ['Sales & CRM', 'sales-crm'], ['Customer Engagement & CX', 'customer-engagement-cx'], ['E-Commerce & Retail Tech', 'ecommerce-retail-tech']]],
  ['Back Office & Operations Hub', 'back-office-operations-hub', [['FinTech & Financial Operations', 'fintech-financial-operations'], ['HR Tech & Workforce Management', 'hr-tech-workforce'], ['Legal, Compliance & Governance Tech', 'legal-compliance-governance'], ['Logistics & Supply Chain Tech', 'logistics-supply-chain']]],
];
function zoneInfo(name) {
  for (const [hn, hs, zones] of HUBS) {
    const z = zones.find((x) => x[0] === name);
    if (z) return { zone: z[0], zoneSlug: z[1], hub: hn, hubSlug: hs, hubZones: zones.map((x) => x[0]) };
  }
  return { zone: name || '', zoneSlug: '', hub: '', hubSlug: '', hubZones: [name] };
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wib(d) { return new Date(new Date(d).getTime() + 7 * 3600 * 1000); }
function dateTime(d, isEn) {
  const x = wib(d);
  const hh = String(x.getUTCHours()).padStart(2, '0');
  const mm = String(x.getUTCMinutes()).padStart(2, '0');
  return isEn
    ? `${x.getUTCDate()} ${EN_MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}, ${hh}:${mm} WIB`
    : `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}, ${hh}.${mm} WIB`;
}
// English fields come from enJson (the `en` object in the feed); Indonesian is the fallback.
function localize(a, isEn) {
  if (!isEn || !a.enJson) return a;
  try { return Object.assign({}, a, JSON.parse(a.enJson)); } catch (e) { return a; }
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
  const raw = $w('#dynamicDataset').getCurrentItem();
  if (!raw) return;

  const lang = (wixWindowFrontend.multilingual && wixWindowFrontend.multilingual.currentLanguage) || 'id';
  const base = lang && lang !== 'en' ? '/' + lang : '';
  const isEn = lang === 'en';
  const t = TXT[isEn ? 'en' : 'id'];
  const item = localize(raw, isEn);
  const zi = zoneInfo(item.category);
  const catSlug = zi.zoneSlug;
  const catLabel = zi.zone;
  const type = (isEn ? EN_TYPE : TYPE_LABEL)[item.articleType] || (isEn ? 'Analysis' : 'Analisis');
  const readMin = Math.max(2, Math.round((words(item.summaryHtml) + words(item.analysisHtml) + words(item.actionHtml) + words(item.faqHtml)) / 200));

  const related = await wixData.query('ReviewArticles')
    .eq('category', item.category).ne('slug', item.slug).le('publishAt', new Date())
    .descending('publishAt').limit(3).find().then((r) => r.items).catch(() => []);
  // Same zone first, then the same hub, then the latest articles.
  const sameHub = related.length ? [] : await wixData.query('ReviewArticles')
    .hasSome('category', zi.hubZones).ne('slug', item.slug).le('publishAt', new Date())
    .descending('publishAt').limit(3).find().then((r) => r.items).catch(() => []);
  const latest = related.length ? related : (sameHub.length ? sameHub : await wixData.query('ReviewArticles')
    .ne('slug', item.slug).le('publishAt', new Date()).descending('publishAt').limit(3).find().then((r) => r.items).catch(() => []));

  const chrome = { base, lang: isEn ? 'en' : 'id', path: '/review/' + item.slug, narrow: true, now: new Date().toISOString(), active: catSlug };
  const top = $w('#customElement1');
  const bottom = $w('#customElement2');
  top.setAttribute('part', 'top');
  bottom.setAttribute('part', 'bottom');
  top.setAttribute('data', JSON.stringify(chrome));
  bottom.setAttribute('data', JSON.stringify(Object.assign({}, chrome, {
    article: { category: item.category, audience: item.audience || [] },
    relatedTitle: related.length ? t.moreIn(catLabel) : (sameHub.length ? t.moreIn(zi.hub) : t.related),
    related: latest.map((r) => localize(r, isEn)).map((r) => ({ slug: r.slug, title: r.title, category: r.category, heroImage: r.heroImage || '' })),
  })));

  // Headline block
  const head = [];
  head.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}"><a href="/review"><span style="color:${SUB}">${t.news}</span></a>${zi.hubSlug ? ` &nbsp;›&nbsp; <a href="/review?kategori=${zi.hubSlug}"><span style="color:${SUB}">${esc(zi.hub)}</span></a>` : ''} &nbsp;›&nbsp; <a href="/review?kategori=${catSlug}"><span style="color:${SUB}">${esc(catLabel)}</span></a> &nbsp;›&nbsp; ${type}</span></p>`);
  head.push(gap(8));
  head.push(`<p style="font-size:12px; letter-spacing:0.1em"><span style="${SANS}; color:${RED}"><strong>${type.toUpperCase()}</strong></span><span style="${SANS}; color:${NAVY}"><strong> &nbsp;·&nbsp; ${esc(catLabel).toUpperCase()}</strong></span></p>`);
  head.push(`<h1 style="font-size:46px; line-height:1.12"><span style="${SERIF}; color:${INK}"><strong>${esc(item.title)}</strong></span></h1>`);
  head.push(gap(6));
  head.push(`<p style="font-size:21px; line-height:1.5"><span style="${SERIF}; color:#333B47">${esc(item.dek)}</span></p>`);
  head.push(gap(6));
  head.push(`<p style="font-size:14px; line-height:1.6"><span style="${SANS}; color:${INK}"><strong>${t.byline}</strong></span><span style="${SANS}; color:#4A5361"> &nbsp;·&nbsp; ${dateTime(item.publishAt, isEn)} &nbsp;·&nbsp; ${readMin} ${t.minRead}</span></p>`);
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
    b.push(`<p style="font-size:13px; line-height:1.5"><span style="${SANS}; color:${SUB}">${t.graphic} ${esc(item.dataSource)}.</span></p>`);
    b.push(gap(18));
  }
  b.push(kicker(t.summary));
  b.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}">${t.summaryNote}</span></p>`);
  b.push(body(item.summaryHtml, { sans: true, size: 17 }));
  b.push(gap(24));
  b.push(kicker(item.articleType === 'penjelasan' ? t.explainer : t.behind, RED));
  b.push(body(item.analysisHtml));
  b.push(gap(24));
  b.push(kicker(t.action, RED));
  b.push(body(item.actionHtml));
  if (item.faqHtml) {
    b.push(gap(24));
    b.push(kicker(t.faq));
    b.push(body(item.faqHtml));
  }
  b.push(gap(24));
  b.push(kicker(t.sources));
  b.push(body(item.sourcesHtml, { sans: true, size: 16 }));
  b.push(`<p style="font-size:13px; line-height:1.6"><span style="${SANS}; color:${SUB}">${t.rights}</span></p>`);
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
    inLanguage: isEn ? 'en' : 'id',
    articleSection: catLabel,
    author: { '@type': 'Organization', name: t.author },
    publisher: { '@type': 'Organization', name: 'B2B Tech Asia Review' },
  }]);
});
