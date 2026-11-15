// Page code: Review Articles (List) — URL /review (Indonesian: /id/review)
// Front page and section pages (?kategori=<slug>) of B2B Tech Asia Review.
// The layout is drawn by the <review-ui> custom element (#customElement1,
// public/custom-elements/wix-default-custom-element.js); this code loads the data.
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import wixSeoFrontend from 'wix-seo-frontend';

const CATEGORIES = [
  ['Cybersecurity', 'cybersecurity'],
  ['AI & Data', 'ai-data'],
  ['Cloud & Data Center', 'cloud-data-center'],
  ['Enterprise Adoption', 'enterprise-adoption'],
  ['Regulasi', 'regulasi'],
  ['Deals', 'deals'],
];

const EN_CAT = { Regulasi: 'Regulation' };

// English fields come from enJson (the `en` object in the feed); Indonesian is the fallback.
function localize(a, lang) {
  if (lang !== 'en' || !a.enJson) return a;
  try { return Object.assign({}, a, JSON.parse(a.enJson)); } catch (e) { return a; }
}

function slim(raw, lang) {
  const a = localize(raw, lang);
  return {
    slug: a.slug, title: a.title, category: a.category, articleType: a.articleType, dek: a.dek,
    publishAt: a.publishAt, heroImage: a.heroImage || '', dataFigure: a.dataFigure || '', dataLabel: a.dataLabel || '',
    audience: a.audience || [],
    readMin: Math.max(2, Math.round(String((a.summaryHtml || '') + (a.analysisHtml || '') + (a.actionHtml || '')).replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200)),
  };
}

function slimPr(r) {
  return { slug: r.slug, title: r.title, publishedDate: r.publishedDate, imageUrl: r.imageUrl || '' };
}

$w.onReady(async function () {
  try { $w('#title').collapse(); } catch (e) { /* old text element may be gone */ }

  const lang = (wixWindowFrontend.multilingual && wixWindowFrontend.multilingual.currentLanguage) || 'id';
  const base = lang && lang !== 'en' ? '/' + lang : '';
  const kategori = String(wixLocationFrontend.query.kategori || '');
  const cat = CATEGORIES.find((c) => c[1] === kategori);
  const isPR = kategori === 'siaran-pers';
  const now = new Date();
  const isEn = lang === 'en';
  const path = '/review' + (kategori ? '?kategori=' + encodeURIComponent(kategori) : '');
  const data = { base, lang: isEn ? 'en' : 'id', path, now: now.toISOString(), active: cat ? cat[1] : (isPR ? 'siaran-pers' : '') };
  const catLabel = cat ? (isEn ? (EN_CAT[cat[0]] || cat[0]) : cat[0]) : '';

  let title = isEn ? 'B2B Tech Asia Review — Indonesia B2B Technology News & Analysis' : 'B2B Tech Asia Review — Berita & Analisis Teknologi B2B Indonesia';
  let desc = isEn
    ? 'News and analysis on B2B technology in Indonesia: cybersecurity, AI, cloud, enterprise adoption, regulation and deals.'
    : 'Berita dan analisis teknologi B2B Indonesia: keamanan siber, AI, cloud, adopsi teknologi perusahaan, regulasi, dan transaksi.';

  if (isPR) {
    const pr = await wixData.query('SiaranPers').descending('publishedDate').limit(60).find();
    Object.assign(data, {
      view: 'list', heading: isEn ? 'Press Releases' : 'Siaran Pers',
      intro: isEn ? 'Supplied by companies via VRITIMES (in Indonesian), not editorial content' : 'Disediakan oleh perusahaan melalui VRITIMES, bukan konten redaksi',
      releases: pr.items.map(slimPr),
    });
    title = isEn ? 'Technology & Business Press Releases | B2B Tech Asia Review' : 'Siaran Pers Teknologi & Bisnis | B2B Tech Asia Review';
    desc = isEn ? 'The latest press releases from technology and business companies in Indonesia, distributed via VRITIMES.'
      : 'Siaran pers terbaru dari perusahaan teknologi dan bisnis di Indonesia, didistribusikan melalui VRITIMES.';
  } else if (cat) {
    const res = await wixData.query('ReviewArticles').eq('category', cat[0]).le('publishAt', now).descending('publishAt').limit(60).find();
    Object.assign(data, {
      view: 'list', heading: catLabel,
      intro: isEn ? 'News and analysis for decision makers in Indonesia' : 'Berita dan analisis untuk pengambil keputusan di Indonesia',
      articles: res.items.map((a) => slim(a, lang)),
    });
    title = isEn ? `${catLabel} — News & Analysis | B2B Tech Asia Review` : `${catLabel} — Berita & Analisis | B2B Tech Asia Review`;
    desc = isEn ? `${catLabel} news and analysis for companies in Indonesia from B2B Tech Asia Review.`
      : `Berita dan analisis ${catLabel} untuk perusahaan di Indonesia dari B2B Tech Asia Review.`;
  } else {
    const [arts, pr] = await Promise.all([
      wixData.query('ReviewArticles').le('publishAt', now).descending('publishAt').limit(60).find(),
      wixData.query('SiaranPers').descending('publishedDate').limit(4).find(),
    ]);
    Object.assign(data, { view: 'front', articles: arts.items.map((a) => slim(a, lang)), releases: pr.items.map(slimPr) });
  }

  $w('#customElement1').setAttribute('data', JSON.stringify(data));

  wixSeoFrontend.setTitle(title);
  wixSeoFrontend.setMetaTags([
    { name: 'description', content: desc },
    { property: 'og:title', content: title },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: 'website' },
  ]);
});
