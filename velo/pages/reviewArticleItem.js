// Page code: Review Articles (Item) — URL /review/{slug}
// The same code runs on the Japanese item page /jp/review/{slug} (a second dynamic item page on ReviewArticles).
// Layout (top to bottom): #customElement1 (<review-ui part="top">), #text747 (headline block, server-rendered),
// #image262 (hero data graphic), #text748 (article body, server-rendered),
// #customElement2 (<review-ui part="bottom">: related articles, Expo band, footer). Article text stays in Wix text elements so it is indexable.

import wixData from 'wix-data';
import wixSeoFrontend from 'wix-seo-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import wixLocationFrontend from 'wix-location-frontend';

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
const JA_TYPE = { analisis: '分析', berita: 'ニュース', penjelasan: '解説' };
const TXT = {
  id: {
    news: 'Berita', byline: 'Redaksi VRI B2B Tech Asia Review', minRead: 'menit baca', graphic: 'Grafis: VRI B2B Tech Asia Review. Data:',
    summary: 'RINGKASAN BERITA', summaryNote: 'Disusun dari laporan media. Kutipan langsung ditandai dan sumber dicantumkan.',
    behind: 'DI BALIK BERITA', explainer: 'PENJELASAN', action: 'APA ARTINYA BAGI ANDA', faq: 'PERTANYAAN YANG SERING DIAJUKAN', sources: 'SUMBER',
    rights: 'Kutipan digunakan secara terbatas dengan menyebut sumber. Hak cipta kutipan tetap milik media masing-masing. Analisis adalah pandangan redaksi VRI B2B Tech Asia Review.',
    moreIn: (c) => 'Lainnya di ' + c, related: 'Berita Terkait', author: 'Redaksi VRI B2B Tech Asia Review',
  },
  en: {
    news: 'News', byline: 'VRI B2B Tech Asia Review editors', minRead: 'min read', graphic: 'Graphic: VRI B2B Tech Asia Review. Data:',
    summary: 'NEWS IN BRIEF', summaryNote: 'Compiled from media reports. Direct quotes are marked and sources are listed.',
    behind: 'BEHIND THE NEWS', explainer: 'EXPLAINER', action: 'WHAT IT MEANS FOR YOU', faq: 'FREQUENTLY ASKED QUESTIONS', sources: 'SOURCES',
    rights: 'Quotations are used sparingly and credited to their source. Copyright in quoted material remains with each publisher. Analysis reflects the view of the VRI B2B Tech Asia Review editors.',
    moreIn: (c) => 'More in ' + c, related: 'Related', author: 'VRI B2B Tech Asia Review editors',
  },
  ja: {
    news: 'ニュース', byline: 'VRI B2B Tech Asia Review 編集部', minRead: '分で読めます', graphic: '図表：VRI B2B Tech Asia Review　データ：',
    summary: 'ニュースの要点', summaryNote: '報道をもとに編集部が要約。直接の引用は明示し、出典を記載しています。',
    behind: 'ニュースの背景', explainer: '解説', action: 'あなたにとっての意味', faq: 'よくある質問', sources: '出典',
    rights: '引用は必要な範囲にとどめ、出典を明記しています。引用部分の著作権は各媒体に帰属します。分析はVRI B2B Tech Asia Review編集部の見解です。',
    moreIn: (c) => c + 'の記事', related: '関連記事', author: 'VRI B2B Tech Asia Review 編集部',
  },
};
const SITE = 'https://www.b2btechasia.com';
// Language of this page: /jp/review/… is Japanese; otherwise Wix Multilingual decides (en = /, id = /id).
function pageLang() {
  if (/\/jp\/review(\/|\?|#|$)/.test(wixLocationFrontend.url || '')) return 'ja';
  return (wixWindowFrontend.multilingual && wixWindowFrontend.multilingual.currentLanguage) || 'id';
}
function langLinks(path, lang) {
  const href = { id: SITE + '/id' + path, en: SITE + path, ja: SITE + '/jp' + path };
  return [{ rel: 'canonical', href: href[lang] }]
    .concat(['id', 'en', 'ja'].map((l) => ({ rel: 'alternate', hreflang: l, href: href[l] })))
    .concat([{ rel: 'alternate', hreflang: 'x-default', href: href.en }]);
}
// Categories = VRI B2B Tech Asia 2027 zones. Keep in sync with taxonomy.json.
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
function dateTime(d, isEn, isJa) {
  const x = wib(d);
  const hh = String(x.getUTCHours()).padStart(2, '0');
  const mm = String(x.getUTCMinutes()).padStart(2, '0');
  if (isJa) return `${x.getUTCFullYear()}年${x.getUTCMonth() + 1}月${x.getUTCDate()}日 ${hh}:${mm}（ジャカルタ時間）`;
  return isEn
    ? `${x.getUTCDate()} ${EN_MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}, ${hh}:${mm} WIB`
    : `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}, ${hh}.${mm} WIB`;
}
// English fields come from enJson, Japanese from jaJson; Indonesian is the fallback.
function localize(a, lang) {
  const j = lang === 'en' ? a.enJson : (lang === 'ja' ? a.jaJson : '');
  if (!j) return a;
  try { return Object.assign({}, a, JSON.parse(j)); } catch (e) { return a; }
}
// Japanese has no spaces: count about 500 characters as one minute.
function words(h) {
  const t = String(h || '').replace(/<[^>]+>/g, ' ');
  const cjk = (t.match(/[\u3040-\u30ff\u4e00-\u9fff]/g) || []).length;
  return t.split(/\s+/).filter(Boolean).length + Math.round(cjk / 2.5);
}

function kicker(text, color) {
  return `<h2 style="font-size:13px; letter-spacing:0.1em; line-height:1.4"><span style="${SANS}; color:${color || NAVY}"><strong>${text}</strong></span></h2>`;
}

// Article HTML (p, ul, ol, li, h3, strong, em, a) → styled HTML. Lists become paragraphs with
// explicit markers because the site theme hides list bullets.
function body(html, opts) {
  const o = opts || {};
  const size = o.size || S(19, 17, 16);
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
    .replace(/<h3>/g, `<h3 style="font-size:${S(24, 20, 19)}px; line-height:1.3"><span style="${SERIF}; color:${INK}"><strong>`).replace(/<\/h3>/g, '</strong></span></h3>')
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, `<a href="$1" target="_blank" rel="noopener"><span style="color:${NAVY}"><u>$2</u></span></a>`);
}

// Mobile (Wix mobile site, about 320px wide): smaller type. Set in onReady.
let MOBILE = false;
let JA = false;
// Font size for the current device: S(desktop, mobile, mobileJapanese).
function S(desk, mob, mobJa) { return MOBILE ? (JA && mobJa ? mobJa : mob) : desk; }

function gap(px) { return `<p style="font-size:${px}px; line-height:1"><span>&nbsp;</span></p>`; }

$w.onReady(async function () {
  const raw = $w('#dynamicDataset').getCurrentItem();
  if (!raw) return;

  const lang = pageLang();
  const isJa = lang === 'ja';
  MOBILE = wixWindowFrontend.formFactor === 'Mobile';
  JA = isJa;
  const isEn = lang === 'en';
  const base = isJa ? '/jp' : (lang && lang !== 'en' ? '/' + lang : '');
  const t = TXT[isJa ? 'ja' : (isEn ? 'en' : 'id')];
  const item = localize(raw, lang);
  const zi = zoneInfo(item.category);
  const catSlug = zi.zoneSlug;
  const catLabel = zi.zone;
  const type = (isJa ? JA_TYPE : (isEn ? EN_TYPE : TYPE_LABEL))[item.articleType] || (isJa ? '分析' : (isEn ? 'Analysis' : 'Analisis'));
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

  const chrome = { base, siteBase: isJa ? '' : base, lang: isJa ? 'ja' : (isEn ? 'en' : 'id'), path: '/review/' + item.slug, narrow: true, now: new Date().toISOString(), active: catSlug };
  const top = $w('#customElement1');
  const bottom = $w('#customElement2');
  top.setAttribute('part', 'top');
  bottom.setAttribute('part', 'bottom');
  top.setAttribute('data', JSON.stringify(chrome));
  bottom.setAttribute('data', JSON.stringify(Object.assign({}, chrome, {
    article: { category: item.category, audience: item.audience || [] },
    relatedTitle: related.length ? t.moreIn(catLabel) : (sameHub.length ? t.moreIn(zi.hub) : t.related),
    related: latest.map((r) => localize(r, lang)).map((r) => ({ slug: r.slug, title: r.title, category: r.category, heroImage: r.heroImage || '' })),
  })));

  // Headline block
  const head = [];
  head.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}"><a href="${base}/review"><span style="color:${SUB}">${t.news}</span></a>${zi.hubSlug ? ` &nbsp;›&nbsp; <a href="${base}/review?kategori=${zi.hubSlug}"><span style="color:${SUB}">${esc(zi.hub)}</span></a>` : ''} &nbsp;›&nbsp; <a href="${base}/review?kategori=${catSlug}"><span style="color:${SUB}">${esc(catLabel)}</span></a> &nbsp;›&nbsp; ${type}</span></p>`);
  head.push(gap(8));
  head.push(`<p style="font-size:12px; letter-spacing:0.1em"><span style="${SANS}; color:${RED}"><strong>${type.toUpperCase()}</strong></span><span style="${SANS}; color:${NAVY}"><strong> &nbsp;·&nbsp; ${esc(catLabel).toUpperCase()}</strong></span></p>`);
  head.push(`<h1 style="font-size:${S(46, 27, 23)}px; line-height:${MOBILE ? 1.3 : 1.12}"><span style="${SERIF}; color:${INK}"><strong>${esc(item.title)}</strong></span></h1>`);
  head.push(gap(6));
  head.push(`<p style="font-size:${S(21, 17, 16)}px; line-height:1.55"><span style="${SERIF}; color:#333B47">${esc(item.dek)}</span></p>`);
  head.push(gap(6));
  head.push(`<p style="font-size:14px; line-height:1.6"><span style="${SANS}; color:${INK}"><strong>${t.byline}</strong></span><span style="${SANS}; color:#4A5361"> &nbsp;·&nbsp; ${dateTime(item.publishAt, isEn, isJa)} &nbsp;·&nbsp; ${readMin} ${t.minRead}</span></p>`);
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
    b.push(`<p style="font-size:13px; line-height:1.5"><span style="${SANS}; color:${SUB}">${t.graphic}${isJa ? '' : ' '}${esc(item.dataSource)}${isJa ? '' : '.'}</span></p>`);
    b.push(gap(18));
  }
  b.push(kicker(t.summary));
  b.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}">${t.summaryNote}</span></p>`);
  b.push(body(item.summaryHtml, { sans: true, size: S(17, 15) }));
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
  b.push(body(item.sourcesHtml, { sans: true, size: S(16, 14) }));
  b.push(`<p style="font-size:13px; line-height:1.6"><span style="${SANS}; color:${SUB}">${t.rights}</span></p>`);
  $w('#text748').html = b.join('');

  const description = item.seoDescription || item.dek;
  await wixSeoFrontend.setTitle((item.seoTitle || item.title) + ' | VRI B2B Tech Asia Review');
  await wixSeoFrontend.setMetaTags([
    { name: 'description', content: description },
    { property: 'og:title', content: item.seoTitle || item.title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' },
  ].concat(item.heroImage ? [{ property: 'og:image', content: item.heroImage }] : [])
    .concat(isJa ? [{ property: 'og:locale', content: 'ja_JP' }] : []));
  try { await wixSeoFrontend.setLinks(langLinks('/review/' + item.slug, lang)); } catch (e) { /* keep Wix defaults */ }
  await wixSeoFrontend.setStructuredData([{
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description,
    image: item.heroImage ? [item.heroImage] : undefined,
    datePublished: new Date(item.publishAt).toISOString(),
    dateModified: new Date(item._updatedDate || item.publishAt).toISOString(),
    inLanguage: lang === 'ja' ? 'ja' : (isEn ? 'en' : 'id'),
    articleSection: catLabel,
    author: { '@type': 'Organization', name: t.author },
    publisher: { '@type': 'Organization', name: 'VRI B2B Tech Asia Review' },
  }]);
});
