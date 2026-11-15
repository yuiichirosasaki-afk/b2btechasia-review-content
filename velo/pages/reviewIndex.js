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

function slim(a) {
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
  const data = { base, now: now.toISOString(), active: cat ? cat[1] : (isPR ? 'siaran-pers' : '') };

  let title = 'B2B Tech Asia Review — Berita & Analisis Teknologi B2B Indonesia';
  let desc = 'Berita dan analisis teknologi B2B Indonesia: keamanan siber, AI, cloud, adopsi teknologi perusahaan, regulasi, dan transaksi.';

  if (isPR) {
    const pr = await wixData.query('SiaranPers').descending('publishedDate').limit(60).find();
    Object.assign(data, { view: 'list', heading: 'Siaran Pers', intro: 'Disediakan oleh perusahaan melalui VRITIMES, bukan konten redaksi', releases: pr.items.map(slimPr) });
    title = 'Siaran Pers Teknologi & Bisnis | B2B Tech Asia Review';
    desc = 'Siaran pers terbaru dari perusahaan teknologi dan bisnis di Indonesia, didistribusikan melalui VRITIMES.';
  } else if (cat) {
    const res = await wixData.query('ReviewArticles').eq('category', cat[0]).le('publishAt', now).descending('publishAt').limit(60).find();
    Object.assign(data, { view: 'list', heading: cat[0], intro: 'Berita dan analisis untuk pengambil keputusan di Indonesia', articles: res.items.map(slim) });
    title = `${cat[0]} — Berita & Analisis | B2B Tech Asia Review`;
    desc = `Berita dan analisis ${cat[0]} untuk perusahaan di Indonesia dari B2B Tech Asia Review.`;
  } else {
    const [arts, pr] = await Promise.all([
      wixData.query('ReviewArticles').le('publishAt', now).descending('publishAt').limit(60).find(),
      wixData.query('SiaranPers').descending('publishedDate').limit(4).find(),
    ]);
    Object.assign(data, { view: 'front', articles: arts.items.map(slim), releases: pr.items.map(slimPr) });
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
