// Page code: Review Articles (List) — URL /review (Indonesian: /id/review)
// The same code runs on the Japanese list page /jp/review (a second dynamic list page on ReviewArticles).
// Front page and section pages (?kategori=<slug>) of VRI B2B Tech Asia Review.
// The same code also runs on the exhibition calendar /review/expo (and /id/review/expo, /jp/review/expo):
// list pages whose URL ends in /review/expo, or ?kategori=expo, show the ReviewExhibitions collection.
// The layout is drawn by the <review-ui> custom element (#customElement1,
// public/custom-elements/wix-default-custom-element.js); this code loads the data.
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import wixSeoFrontend from 'wix-seo-frontend';

// Categories = VRI B2B Tech Asia 2027 zones (3 hubs x 4 zones). Keep in sync with taxonomy.json.
const HUBS = [
  { n: 'AI & Automation Hub', s: 'ai-automation-hub', id: 'Keputusan teknis dan infrastruktur', en: 'Technical & infrastructure decisions', ja: '技術とインフラの意思決定',
    zones: [['AI & Automation', 'ai-automation'], ['Cloud & IT Infrastructure', 'cloud-it-infrastructure'], ['Cybersecurity & Data Protection', 'cybersecurity-data-protection'], ['Enterprise Software & ERP', 'enterprise-software-erp']] },
  { n: 'Growth & Revenue Hub', s: 'growth-revenue-hub', id: 'Akuisisi dan retensi pelanggan', en: 'Customer acquisition & retention', ja: '顧客の獲得と維持',
    zones: [['Marketing Technology', 'marketing-technology'], ['Sales & CRM', 'sales-crm'], ['Customer Engagement & CX', 'customer-engagement-cx'], ['E-Commerce & Retail Tech', 'ecommerce-retail-tech']] },
  { n: 'Back Office & Operations Hub', s: 'back-office-operations-hub', id: 'Fungsi yang menjaga bisnis tetap berjalan', en: 'Functions that keep business running', ja: '事業を支えるバックオフィス機能',
    zones: [['FinTech & Financial Operations', 'fintech-financial-operations'], ['HR Tech & Workforce Management', 'hr-tech-workforce'], ['Legal, Compliance & Governance Tech', 'legal-compliance-governance'], ['Logistics & Supply Chain Tech', 'logistics-supply-chain']] },
];
// Old category slugs (before the zone structure) → zone slugs.
const LEGACY_SLUG = { cybersecurity: 'cybersecurity-data-protection', 'ai-data': 'ai-automation', 'cloud-data-center': 'cloud-it-infrastructure', regulasi: 'legal-compliance-governance' };

// English fields come from enJson, Japanese from jaJson (the `en` / `ja` objects in the feed); Indonesian is the fallback.
function localize(a, lang) {
  const j = lang === 'en' ? a.enJson : (lang === 'ja' ? a.jaJson : '');
  if (!j) return a;
  try { return Object.assign({}, a, JSON.parse(j)); } catch (e) { return a; }
}

const SITE = 'https://www.b2btechasia.com';
// Language of this page: /jp/review… is Japanese; otherwise Wix Multilingual decides (en = /, id = /id).
function pageLang() {
  if (/\/jp\/review(\/|\?|#|$)/.test(wixLocationFrontend.url || '')) return 'ja';
  return (wixWindowFrontend.multilingual && wixWindowFrontend.multilingual.currentLanguage) || 'id';
}
// canonical + hreflang for the three language versions of a language-neutral path (e.g. /review?kategori=x).
function langLinks(path, lang) {
  const href = { id: SITE + '/id' + path, en: SITE + path, ja: SITE + '/jp' + path };
  return [{ rel: 'canonical', href: href[lang] }]
    .concat(['id', 'en', 'ja'].map((l) => ({ rel: 'alternate', hreflang: l, href: href[l] })))
    .concat([{ rel: 'alternate', hreflang: 'x-default', href: href.en }]);
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

// ---------- Exhibition calendar (EXHIBITIONS.md) ----------
// Dates are stored as 00:00 WIB; the calendar works with plain Jakarta days ('YYYY-MM-DD').
function day(d) { return d ? new Date(new Date(d).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10) : ''; }
function parse(j) { try { return j ? JSON.parse(j) : null; } catch (e) { return null; } }
// Worked out on every page view (the feed's own `status` is only refreshed by the monthly run).
function expoStatus(e, today) {
  if (e.dateStatus === 'cancelled') return 'cancelled';
  const s = day(e.startDate);
  if (e.dateStatus !== 'confirmed' || !s) return 'tba';
  return today < s ? 'upcoming' : (today <= (day(e.endDate) || s) ? 'ongoing' : 'past');
}
function slimExpo(e, today) {
  return {
    slug: e.slug, name: e.title, city: e.city || '', venue: e.venue || '', organizer: e.organizer || '',
    start: day(e.startDate), end: day(e.endDate), dateStatus: e.dateStatus, status: expoStatus(e, today),
    zones: e.zones || [], own: !!e.isOwnEvent, last: parse(e.lastEditionJson), relevance: e.relevance || 'B', verified: day(e.verifiedAt),
  };
}
const EXPO_ORDER = { ongoing: 0, upcoming: 0, tba: 1, past: 2, cancelled: 3 };
function sortExpos(a, b) {
  if (EXPO_ORDER[a.status] !== EXPO_ORDER[b.status]) return EXPO_ORDER[a.status] - EXPO_ORDER[b.status];
  if (a.status === 'upcoming' || a.status === 'ongoing') return a.start < b.start ? -1 : (a.start > b.start ? 1 : a.name.localeCompare(b.name));
  if (a.status === 'past') return a.start < b.start ? 1 : -1;
  if (a.relevance !== b.relevance) return a.relevance < b.relevance ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function slimPr(r) {
  return { slug: r.slug, title: r.title, publishedDate: r.publishedDate, imageUrl: r.imageUrl || '' };
}

$w.onReady(async function () {
  try { $w('#title').collapse(); } catch (e) { /* old text element may be gone */ }

  const lang = pageLang();
  const isJa = lang === 'ja';
  const base = isJa ? '/jp' : (lang && lang !== 'en' ? '/' + lang : '');
  const kategori = LEGACY_SLUG[String(wixLocationFrontend.query.kategori || '')] || String(wixLocationFrontend.query.kategori || '');
  const hub = HUBS.find((h) => h.s === kategori);
  const zoneHub = HUBS.find((h) => h.zones.some((z) => z[1] === kategori));
  const zone = zoneHub ? zoneHub.zones.find((z) => z[1] === kategori) : null;
  const isPR = kategori === 'siaran-pers';
  const isExpo = kategori === 'expo' || /\/review\/expo(\/|\?|#|$)/.test(wixLocationFrontend.url || '');
  const now = new Date();
  const isEn = lang === 'en';
  const path = isExpo ? '/review/expo' : '/review' + (kategori ? '?kategori=' + encodeURIComponent(kategori) : '');
  const data = { base, siteBase: isJa ? '' : base, lang: isJa ? 'ja' : (isEn ? 'en' : 'id'), path, now: now.toISOString(), active: isExpo ? 'expo' : (hub || zone ? kategori : (isPR ? 'siaran-pers' : '')) };
  // Text in the page language: X(id, en, ja).
  const X = (id, en, ja) => (isJa ? ja : (isEn ? en : id));
  const catLabel = hub ? hub.n : (zone ? zone[0] : '');

  let title = X('VRI B2B Tech Asia Review — Berita & Analisis Teknologi B2B Indonesia', 'VRI B2B Tech Asia Review — Indonesia B2B Technology News & Analysis', 'VRI B2B Tech Asia Review — インドネシアのB2Bテクノロジー・ニュースと分析');
  let desc = X('Berita dan analisis teknologi B2B Indonesia: keamanan siber, AI, cloud, adopsi teknologi perusahaan, regulasi, dan transaksi.',
    'News and analysis on B2B technology in Indonesia: cybersecurity, AI, cloud, enterprise adoption, regulation and deals.',
    'インドネシアのB2Bテクノロジーのニュースと分析。サイバーセキュリティ、AI、クラウド、企業のIT導入、規制、M&A・資金調達を日本語で解説。');

  let structured = null;
  if (isExpo) {
    const today = day(now);
    const res = await wixData.query('ReviewExhibitions').limit(500).find().catch(() => ({ items: [] }));
    const cutoff = day(new Date(now.getTime() - 90 * 86400000));
    const expos = res.items.map((e) => slimExpo(e, today))
      // a cancelled event leaves the list 90 days after it was last checked
      .filter((e) => !(e.status === 'cancelled' && e.verified && e.verified < cutoff))
      .sort(sortExpos);
    const years = expos.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').map((e) => e.start.slice(0, 4)).sort();
    const yr = years.length ? (years[0] === years[years.length - 1] ? years[0] : years[0] + '–' + years[years.length - 1]) : String(now.getUTCFullYear() + (now.getUTCMonth() >= 9 ? 1 : 0));
    const heading = X(`Kalender Pameran Teknologi B2B Indonesia ${yr}`, `Indonesia B2B Technology Exhibition Calendar ${yr}`, `インドネシアのB2Bテクノロジー展示会カレンダー ${yr}`);
    Object.assign(data, {
      view: 'expo', heading,
      intro: X('Jadwal, lokasi, dan penyelenggara pameran serta konferensi teknologi untuk bisnis di Indonesia, dalam satu halaman. Tanggal hanya kami cantumkan bila sudah diumumkan penyelenggara.',
        'Dates, venues and organisers of business technology exhibitions and conferences in Indonesia, on one page. Dates are listed only once the organiser has announced them.',
        'インドネシアで開かれるビジネス向けテクノロジーの展示会とカンファレンスについて、日程、会場、主催者を1ページにまとめました。日程は主催者が発表したものだけを掲載しています。'),
      expos, verified: expos.map((e) => e.verified).sort().pop() || '',
    });
    title = `${heading} | VRI B2B Tech Asia Review`;
    desc = X('Jadwal, lokasi, dan penyelenggara pameran serta konferensi teknologi B2B di Indonesia. Tanggal dari pengumuman resmi penyelenggara, diperiksa ulang setiap bulan.',
      'Dates, venues and organisers of B2B technology exhibitions and conferences in Indonesia. Dates come from organisers’ official announcements and are re-checked monthly.',
      'インドネシアのB2Bテクノロジー展示会・カンファレンスの日程、会場、主催者の一覧。日程は主催者の公式発表にもとづき、毎月確認している。');
    const langPrefix = isJa ? '/jp' : (isEn ? '' : '/id');
    structured = {
      '@context': 'https://schema.org', '@type': 'ItemList', name: heading,
      itemListElement: expos.filter((e) => e.status !== 'past' && e.status !== 'cancelled').map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: SITE + langPrefix + '/review/expo/' + e.slug })),
    };
  } else if (isPR) {
    const pr = await wixData.query('SiaranPers').descending('publishedDate').limit(60).find();
    Object.assign(data, {
      view: 'list', heading: X('Siaran Pers', 'Press Releases', 'プレスリリース'),
      intro: X('Disediakan oleh perusahaan melalui VRITIMES, bukan konten redaksi', 'Supplied by companies via VRITIMES (in Indonesian), not editorial content', '企業がVRITIMESを通じて配信（インドネシア語）。編集部の記事ではありません'),
      releases: pr.items.map(slimPr),
    });
    title = X('Siaran Pers Teknologi & Bisnis | VRI B2B Tech Asia Review', 'Technology & Business Press Releases | VRI B2B Tech Asia Review', 'テクノロジー・ビジネスのプレスリリース | VRI B2B Tech Asia Review');
    desc = X('Siaran pers terbaru dari perusahaan teknologi dan bisnis di Indonesia, didistribusikan melalui VRITIMES.',
      'The latest press releases from technology and business companies in Indonesia, distributed via VRITIMES.',
      'VRITIMESを通じて配信された、インドネシアのテクノロジー・ビジネス企業の最新プレスリリース（インドネシア語）。');
  } else if (hub || zone) {
    const names = hub ? hub.zones.map((z) => z[0]) : [zone[0]];
    const res = await wixData.query('ReviewArticles').hasSome('category', names).le('publishAt', now).descending('publishAt').limit(60).find();
    const h = hub || zoneHub;
    Object.assign(data, {
      view: 'list', heading: catLabel,
      kicker: hub ? '' : h.n,
      intro: hub ? X(h.id, h.en, h.ja) : X('Berita dan analisis untuk pengambil keputusan di Indonesia', 'News and analysis for decision makers in Indonesia', 'インドネシアの意思決定者のためのニュースと分析'),
      articles: res.items.map((a) => slim(a, lang)),
    });
    title = X(`${catLabel} — Berita & Analisis | VRI B2B Tech Asia Review`, `${catLabel} — News & Analysis | VRI B2B Tech Asia Review`, `${catLabel}のニュースと分析 | VRI B2B Tech Asia Review`);
    desc = X(`Berita dan analisis ${catLabel} untuk perusahaan di Indonesia dari VRI B2B Tech Asia Review.`,
      `${catLabel} news and analysis for companies in Indonesia from VRI B2B Tech Asia Review.`,
      `インドネシアの企業に向けた${catLabel}のニュースと分析（VRI B2B Tech Asia Review）。`);
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
  ].concat(isJa ? [{ property: 'og:locale', content: 'ja_JP' }] : []));
  try { await wixSeoFrontend.setLinks(langLinks(path, lang)); } catch (e) { /* keep Wix defaults */ }
  if (structured) { try { await wixSeoFrontend.setStructuredData([structured]); } catch (e) { /* optional */ } }
});
