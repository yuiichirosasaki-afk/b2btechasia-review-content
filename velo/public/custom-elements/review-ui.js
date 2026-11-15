// public/custom-elements/review-ui.js
// <review-ui part="front|top|side|bottom" data='{...}'>
// Renders the B2B Tech Asia Review design (see the design mockup "Beranda" / "Halaman Artikel")
// into the light DOM. Page code passes the data as a JSON string in the "data" attribute.
//   front  — the whole front page (masthead, lead story, Terbaru, Di Balik Berita, categories, Siaran Pers, Expo band, footer)
//   top    — top bar (with ID|EN switch) + compact masthead + category nav + Expo leaderboard (article and Siaran Pers pages)
//   side   — article sidebar (Ditulis untuk, Berita Terkait, Expo card)
//   bottom — related articles + vendor banner + Expo band + footer
// Language: d.lang = 'id' | 'en'; d.path = language-neutral path for the ID|EN switch.
// Banners: leader() visitor leaderboard, vendorWide() exhibitor banner, rect() side banner, expoBand().

const NAVY = '#0B2A4A';
const RED = '#B42318';
const INK = '#14181F';
const MUTED = '#4A5361';
const SUB = '#5F6B7A';
const LINE = '#D9DDE3';
const PANEL = '#F4F5F7';
const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

// Categories = B2B Tech Asia Expo 2027 zones (3 hubs x 4 zones). Keep in sync with taxonomy.json.
const HUBS = [
  { n: 'AI & Automation Hub', s: 'ai-automation-hub', no: 1, color: '#8E3B3F',
    id: 'Keputusan teknis dan infrastruktur', en: 'Technical & infrastructure decisions', who: 'CTO, IT Director, Infrastructure Lead',
    zones: [['AI & Automation', 'ai-automation'], ['Cloud & IT Infrastructure', 'cloud-it-infrastructure'], ['Cybersecurity & Data Protection', 'cybersecurity-data-protection'], ['Enterprise Software & ERP', 'enterprise-software-erp']] },
  { n: 'Growth & Revenue Hub', s: 'growth-revenue-hub', no: 2, color: '#2C4A68',
    id: 'Akuisisi dan retensi pelanggan', en: 'Customer acquisition & retention', who: 'CMO, Head of Sales, Growth Lead',
    zones: [['Marketing Technology', 'marketing-technology'], ['Sales & CRM', 'sales-crm'], ['Customer Engagement & CX', 'customer-engagement-cx'], ['E-Commerce & Retail Tech', 'ecommerce-retail-tech']] },
  { n: 'Back Office & Operations Hub', s: 'back-office-operations-hub', no: 3, color: '#3E5A44',
    id: 'Fungsi yang menjaga bisnis tetap berjalan', en: 'Functions that keep business running', who: 'CFO, HR Director, Operations Head',
    zones: [['FinTech & Financial Operations', 'fintech-financial-operations'], ['HR Tech & Workforce Management', 'hr-tech-workforce'], ['Legal, Compliance & Governance Tech', 'legal-compliance-governance'], ['Logistics & Supply Chain Tech', 'logistics-supply-chain']] },
];
const LEGACY = { Cybersecurity: 'Cybersecurity & Data Protection', 'AI & Data': 'AI & Automation', 'Cloud & Data Center': 'Cloud & IT Infrastructure', Regulasi: 'Legal, Compliance & Governance Tech' };
const ZONES = HUBS.reduce((acc, h) => acc.concat(h.zones.map(([n, s]) => ({ n, s, hub: h }))), []);
function zoneOf(name) { const n = LEGACY[name] || name; return ZONES.find((z) => z.n === n) || null; }
function hubOf(slug) { return HUBS.find((h) => h.s === slug || h.zones.some((z) => z[1] === slug)) || null; }
const TYPE_LABEL = { analisis: 'Analisis', berita: 'Berita', penjelasan: 'Penjelasan' };
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_TYPE = { analisis: 'Analysis', berita: 'News', penjelasan: 'Explainer' };

// UI text. Page code sets d.lang = 'id' | 'en'.
const TEXT = {
  id: {
    latest: 'Terbaru', pr: 'Siaran Pers', tagline: 'Berita dan analisis teknologi B2B untuk pengambil keputusan',
    behind: 'Di Balik Berita', behindSub: 'Kutipan berita, ditambah analisis redaksi tentang apa artinya bagi bisnis Anda',
    prSub: 'Disediakan oleh perusahaan melalui VRITIMES, bukan konten redaksi', prAll: 'Lihat semua siaran pers →', via: 'via VRITIMES',
    byline: 'Redaksi B2B Tech Asia Review', minRead: 'menit baca', forWho: 'Untuk', writtenFor: 'Ditulis untuk', related: 'Berita Terkait',
    empty: 'Belum ada artikel di bagian ini.', expoLink: 'B2B Tech Asia Expo 2027 →', register: 'Daftar sebagai Pengunjung',
    exhibitors: 'Lihat Exhibitor', proposal: 'Minta Proposal Exhibitor', expoDates: '14–15 Juli 2027', ad: 'Iklan',
    expoKicker: 'Pameran · Jakarta', expoDesc: 'Bertemu langsung dengan penyedia SaaS, AI, dan keamanan siber yang Anda baca di sini.',
    expoShort: 'Pameran SaaS, AI, dan keamanan siber untuk perusahaan di Indonesia.',
    sideTitle: (c) => `Temui penyedia ${c} di B2B Tech Asia Expo 2027`,
    vendorTitle: 'Untuk vendor teknologi', vendorHead: 'Tampilkan solusi Anda kepada pengambil keputusan TI di Indonesia',
    vendorDesc: 'Jadi exhibitor atau sponsor di B2B Tech Asia Expo 2027.',
    about: 'Diterbitkan oleh B2B Tech Asia Expo. Setiap kutipan mencantumkan sumber aslinya. Hak cipta kutipan tetap milik media masing-masing. Analisis ditulis oleh redaksi B2B Tech Asia Review.',
    topics: 'Topik', allZones: 'Semua zona', expo: 'Expo', exhibitor: 'Exhibitor', navLabel: 'Kategori', langLabel: 'Bahasa',
  },
  en: {
    latest: 'Latest', pr: 'Press Releases', tagline: 'B2B technology news and analysis for decision makers',
    behind: 'Behind the News', behindSub: 'News in brief, plus our editors’ analysis of what it means for your business',
    prSub: 'Supplied by companies via VRITIMES (in Indonesian), not editorial content', prAll: 'All press releases →', via: 'via VRITIMES',
    byline: 'B2B Tech Asia Review editors', minRead: 'min read', forWho: 'For', writtenFor: 'Written for', related: 'Related',
    empty: 'No articles in this section yet.', expoLink: 'B2B Tech Asia Expo 2027 →', register: 'Register to Visit',
    exhibitors: 'See Exhibitors', proposal: 'Request Exhibitor Proposal', expoDates: '14–15 July 2027', ad: 'Advertisement',
    expoKicker: 'Exhibition · Jakarta', expoDesc: 'Meet the SaaS, AI and cybersecurity providers you read about here, in person.',
    expoShort: 'The SaaS, AI and cybersecurity exhibition for companies in Indonesia.',
    sideTitle: (c) => `Meet ${c} providers at B2B Tech Asia Expo 2027`,
    vendorTitle: 'For technology vendors', vendorHead: 'Put your solution in front of IT decision makers in Indonesia',
    vendorDesc: 'Exhibit or sponsor at B2B Tech Asia Expo 2027.',
    about: 'Published by B2B Tech Asia Expo. Every quotation credits its original source; copyright in quoted material remains with each publisher. Analysis is written by the B2B Tech Asia Review editors.',
    topics: 'Topics', allZones: 'All zones', expo: 'Expo', exhibitor: 'Exhibitors', navLabel: 'Categories', langLabel: 'Language',
  },
};
const VENUE = 'The Ritz-Carlton Jakarta, Pacific Place';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wib(d) { return new Date(new Date(d).getTime() + 7 * 3600 * 1000); }
let LANG = 'id';
const en = () => LANG === 'en';
function longDate(d) { const x = wib(d); return `${(en() ? EN_DAYS : DAYS)[x.getUTCDay()]}, ${x.getUTCDate()} ${(en() ? EN_MONTHS : MONTHS)[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function date(d) { if (!d) return ''; const x = wib(d); return `${x.getUTCDate()} ${(en() ? EN_MONTHS : MONTHS)[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function shortDate(d) { const x = wib(d); return `${x.getUTCDate()} ${(en() ? EN_MON : MON)[x.getUTCMonth()]}`; }
function catSlug(name) { const z = zoneOf(name); return z ? z.s : ''; }
function catName(name) { const z = zoneOf(name); return z ? z.n : (name || ''); }
function typeName(t) { return (en() ? EN_TYPE : TYPE_LABEL)[t] || (en() ? 'Analysis' : 'Analisis'); }
function T() { return TEXT[LANG] || TEXT.id; }

const CSS = `
[data-testid="colorUnderlay"]{background-color:#FFFFFF!important}
review-ui{display:block;width:100%;font-family:${SANS};color:${INK};-webkit-font-smoothing:antialiased}
review-ui *{box-sizing:border-box}
review-ui a{color:${INK};text-decoration:none}
review-ui a:hover{color:${RED}}
review-ui .rv-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
review-ui.rv-narrow .rv-wrap{max-width:1028px}
review-ui.rv-side .rv-wrap{padding:0}
review-ui .rv-topbar{border-bottom:1px solid ${LINE};background:${PANEL}}
review-ui .rv-topbar .rv-wrap{padding-top:8px;padding-bottom:8px;display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;align-items:center;font-size:13px;color:${MUTED}}
review-ui .rv-logo{font-family:${SERIF};font-weight:700;letter-spacing:-.5px;line-height:1;color:${NAVY}}
review-ui .rv-logo span{color:${RED}}
review-ui .rv-nav{display:flex;flex-wrap:wrap;gap:0 28px;font-size:15px;font-weight:600}
review-ui .rv-nav a{padding:12px 0;display:inline-block}
review-ui .rv-kicker{font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase}
review-ui .rv-serif{font-family:${SERIF}}
review-ui .rv-img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:${NAVY}}
review-ui .rv-ph{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:16/9;background:${PANEL};border:1px solid ${LINE};color:${MUTED};font-size:13px;text-align:center;padding:16px}
review-ui .rv-grid{display:grid;gap:32px}
review-ui .rv-sechead{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;border-top:3px solid ${NAVY};padding-top:12px}
review-ui .rv-btn{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;font-weight:700;font-size:15px;border-radius:2px}
review-ui .rv-lang a{padding:2px 4px;color:${MUTED}}
review-ui .rv-lang a.on{color:${NAVY};font-weight:700;border-bottom:2px solid ${RED}}
review-ui .rv-adlabel{display:block;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8A94A3;margin-bottom:4px}
review-ui a.rv-ad{display:flex;flex-wrap:wrap;align-items:center;gap:12px 28px;background:${NAVY};color:#fff;padding:18px 24px;border-left:6px solid ${RED}}
review-ui a.rv-ad:hover{color:#fff;background:#0E3560}
review-ui a.rv-ad .rv-adcta{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;background:#fff;color:${NAVY};font-weight:700;font-size:14px;border-radius:2px;white-space:nowrap}
review-ui a.rv-ad.rv-ad-alt{background:${PANEL};color:${INK};border:1px solid ${LINE};border-left:6px solid ${NAVY}}
review-ui a.rv-ad.rv-ad-alt:hover{background:#EBEDF0;color:${INK}}
review-ui a.rv-ad.rv-ad-alt .rv-adcta{background:${NAVY};color:#fff}
review-ui a.rv-ad.rv-ad-rect{flex-direction:column;align-items:flex-start;gap:10px;padding:22px}
@media (max-width:760px){
 review-ui .rv-lead-title{font-size:32px!important}
 review-ui .rv-masthead-logo{font-size:32px!important}
}
`;

function ensureAssets() {
  if (document.getElementById('rv-fonts')) return;
  const l = document.createElement('link');
  l.id = 'rv-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap';
  document.head.appendChild(l);
  const s = document.createElement('style');
  s.id = 'rv-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

class ReviewUi extends HTMLElement {
  static get observedAttributes() { return ['data', 'part']; }
  connectedCallback() { ensureAssets(); this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  get d() {
    try { return JSON.parse(this.getAttribute('data') || '{}'); } catch (e) { return {}; }
  }

  render() {
    const d = this.d;
    LANG = d.lang === 'en' ? 'en' : 'id';
    this.setAttribute('lang', LANG);
    const part = this.getAttribute('part') || 'front';
    const base = d.base || '';
    const L = (path) => base + path;
    this.classList.toggle('rv-narrow', !!d.narrow);
    let html = '';
    if (part === 'front') html = d.view === 'list' ? this.list(d, L) : this.front(d, L);
    else if (part === 'top') html = this.topbar(d, L) + this.compactHeader(d, L) + this.leader(d, L, 16);
    else if (part === 'side') html = this.side(d, L);
    else if (part === 'bottom') html = this.related(d, L) + this.expoBand(d, L, true) + this.footer(d, L);
    this.innerHTML = html;
  }

  // Links to the same page in the other language. d.path is language-neutral (e.g. /review/slug).
  langSwitch(d) {
    const path = d.path || '/review';
    const on = (l) => (LANG === l ? ' class="on" aria-current="true"' : '');
    return `<span class="rv-lang" aria-label="${T().langLabel}" style="display:inline-flex;gap:6px;align-items:center;font-weight:600">
<a href="${esc('/id' + path)}" hreflang="id"${on('id')}>ID</a><span style="color:#B7BEC8">|</span><a href="${esc(path)}" hreflang="en"${on('en')}>EN</a></span>`;
  }

  topbar(d, L) {
    return `<div class="rv-topbar"><div class="rv-wrap">
<span>${esc(longDate(d.now || Date.now()))} · Jakarta</span>
<span style="display:inline-flex;gap:20px;align-items:center;flex-wrap:wrap">
<a href="${L('/')}" style="color:${NAVY};font-weight:600">${T().expoLink}</a>
${this.langSwitch(d)}
</span>
</div></div>`;
  }

  navLinks(d, L, active) {
    const hub = hubOf(active);
    const items = [[T().latest, L('/review'), !active, false]]
      .concat(HUBS.map((h) => [h.n, L('/review?kategori=' + h.s), !!hub && hub.s === h.s, false]))
      .concat([[T().pr, L('/review?kategori=siaran-pers'), active === 'siaran-pers', true]]);
    return items.map(([n, h, on, pr]) => `<a href="${h}" style="color:${on ? RED : (pr ? MUTED : INK)}">${esc(n)}</a>`).join('');
  }

  masthead(d, L) {
    return `<header class="rv-wrap" style="padding-top:28px">
<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-end;padding-bottom:20px">
<a href="${L('/review')}" style="display:flex;flex-direction:column;gap:6px">
<span class="rv-logo rv-masthead-logo" style="font-size:44px">B2B Tech Asia <span>Review</span></span>
<span style="font-size:14px;color:${MUTED}">${T().tagline}</span>
</a>
</div>
<nav aria-label="${T().navLabel}" style="border-top:3px solid ${NAVY};border-bottom:1px solid ${LINE}"><div class="rv-nav">${this.navLinks(d, L, d.active)}</div></nav>
</header>`;
  }

  compactHeader(d, L) {
    return `<header class="rv-wrap" style="padding-top:20px">
<div style="display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;align-items:center">
<a href="${L('/review')}" class="rv-logo" style="font-size:30px;padding:6px 0">B2B Tech Asia <span>Review</span></a>
<nav aria-label="${T().navLabel}"><div class="rv-nav" style="font-size:14px;gap:0 22px">${this.navLinks(d, L, d.active)}</div></nav>
</div>
<div style="border-top:3px solid ${NAVY};margin-top:6px"></div>
</header>`;
  }

  // ---------- Expo banners (house ads) ----------
  // Leaderboard: under the masthead / category nav on every page. Links to visitor registration.
  leader(d, L, top, inGrid) {
    const t = T();
    return `<div ${inGrid ? 'style="grid-column:1/-1"' : `class="rv-wrap" style="margin-top:${top == null ? 24 : top}px"`}><span class="rv-adlabel">${t.ad}</span>
<a class="rv-ad" href="${L('/register-now-2')}" aria-label="B2B Tech Asia Expo 2027 — ${esc(t.register)}">
<span style="display:flex;flex-direction:column;gap:4px;flex:1 1 420px">
<span class="rv-kicker" style="font-size:11px;color:#C9D6E8">B2B Tech Asia Expo 2027 · ${t.expoDates} · ${VENUE}</span>
<span class="rv-serif" style="font-size:22px;font-weight:700;line-height:1.25">${t.expoShort}</span>
</span>
<span class="rv-adcta">${t.register} →</span>
</a></div>`;
  }

  // Exhibitor banner (wide, light): for vendors. Links to the proposal request form.
  vendorWide(d, L) {
    const t = T();
    return `<div style="grid-column:1/-1"><span class="rv-adlabel">${t.ad}</span>
<a class="rv-ad rv-ad-alt" href="${L('/request-proposal-form')}">
<span style="display:flex;flex-direction:column;gap:4px;flex:1 1 420px">
<span class="rv-kicker" style="font-size:11px;color:${RED}">${t.vendorTitle} · ${t.expoDates}</span>
<span class="rv-serif" style="font-size:22px;font-weight:700;line-height:1.25">${t.vendorHead}</span>
<span style="font-size:14px;color:${MUTED}">${t.vendorDesc} ${VENUE}.</span>
</span>
<span class="rv-adcta">${t.proposal} →</span>
</a></div>`;
  }

  // Rectangle banner for side columns.
  rect(d, L, vendor) {
    const t = T();
    if (vendor) {
      return `<div style="margin-top:24px"><span class="rv-adlabel">${t.ad}</span>
<a class="rv-ad rv-ad-alt rv-ad-rect" href="${L('/request-proposal-form')}">
<span class="rv-kicker" style="font-size:11px;color:${RED}">${t.vendorTitle}</span>
<span class="rv-serif" style="font-size:20px;font-weight:700;line-height:1.3">${t.vendorHead}</span>
<span style="font-size:14px;line-height:1.5;color:${MUTED}">${t.vendorDesc}</span>
<span class="rv-adcta">${t.proposal} →</span></a></div>`;
    }
    return `<div style="margin-top:24px"><span class="rv-adlabel">${t.ad}</span>
<a class="rv-ad rv-ad-rect" href="${L('/register-now-2')}">
<span class="rv-kicker" style="font-size:11px;color:#C9D6E8">${t.expoKicker} · ${t.expoDates}</span>
<span class="rv-serif" style="font-size:24px;font-weight:700;line-height:1.2">B2B Tech Asia Expo 2027</span>
<span style="font-size:14px;line-height:1.5;color:#E3EAF3">${t.expoShort} ${VENUE}.</span>
<span class="rv-adcta">${t.register} →</span></a></div>`;
  }

  heroImage(a, L, label) {
    if (a && a.heroImage) {
      return `<img class="rv-img" src="${esc(a.heroImage)}" alt="${esc((a.dataFigure || '') + ' ' + (a.dataLabel || ''))}" loading="lazy">`;
    }
    return `<div class="rv-ph" style="background:${NAVY};color:#C9D6E8">${esc(label || (a && catName(a.category)) || '')}</div>`;
  }

  front(d, L) {
    const t = T();
    const arts = d.articles || [];
    const lead = arts[0];
    const latest = arts.slice(1, 7);
    const analysis = arts.filter((a) => a !== lead && (a.articleType === 'analisis' || a.articleType === 'penjelasan')).slice(0, 3);
    const pr = d.releases || [];
    const out = [];
    out.push(this.topbar(d, L));
    out.push(this.masthead(d, L));
    out.push(this.leader(d, L));
    out.push(`<main class="rv-wrap" style="padding-top:32px">`);

    if (lead) {
      out.push(`<section style="display:flex;flex-wrap:wrap;gap:40px">
<article style="flex:999 1 640px;min-width:0;display:flex;flex-direction:column;gap:18px">
<a href="${L('/review/' + lead.slug)}">${this.heroImage(lead, L)}</a>
<div class="rv-kicker" style="display:flex;gap:12px;align-items:center"><a href="${L('/review?kategori=' + catSlug(lead.category))}" style="color:${RED}">${esc(catName(lead.category))}</a><span style="color:#9AA3AF" aria-hidden="true">/</span><span style="color:${NAVY}">${esc(typeName(lead.articleType))}</span></div>
<h1 style="margin:0"><a class="rv-serif rv-lead-title" href="${L('/review/' + lead.slug)}" style="font-size:44px;line-height:1.12;font-weight:700;letter-spacing:-.5px">${esc(lead.title)}</a></h1>
<p class="rv-serif" style="margin:0;font-size:20px;line-height:1.5;color:#333B47">${esc(lead.dek)}</p>
<div style="font-size:13px;color:${SUB}">${t.byline} · ${esc(date(lead.publishAt))}${lead.readMin ? ' · ' + lead.readMin + ' ' + t.minRead : ''}</div>
</article>
<aside style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column" aria-label="${t.latest}">
<h2 class="rv-kicker" style="margin:0 0 4px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">${t.latest}</h2>
${latest.map((n) => `<a href="${L('/review/' + n.slug)}" style="display:flex;gap:16px;padding:14px 0;border-bottom:1px solid ${LINE}">
<span style="flex:0 0 52px;font-size:13px;font-weight:600;color:${SUB};padding-top:2px">${esc(shortDate(n.publishAt))}</span>
<span style="display:flex;flex-direction:column;gap:4px"><span class="rv-kicker" style="font-size:11px;color:${RED}">${esc(catName(n.category))}</span>
<span class="rv-serif" style="font-size:17px;line-height:1.35;font-weight:600">${esc(n.title)}</span></span></a>`).join('')}
${this.rect(d, L, false)}
</aside>
</section>`);
    }

    if (analysis.length) {
      out.push(`<section style="margin-top:56px" aria-labelledby="rv-dbb">
<div class="rv-sechead"><h2 id="rv-dbb" class="rv-serif" style="margin:0;font-size:28px;font-weight:700;color:${NAVY}">${t.behind}</h2>
<span style="font-size:14px;color:${MUTED}">${t.behindSub}</span></div>
<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:24px">
${analysis.map((a) => `<a href="${L('/review/' + a.slug)}" style="display:flex;flex-direction:column;gap:10px">
${this.heroImage(a, L)}
<span class="rv-kicker" style="font-size:11px;color:${RED};margin-top:4px">${esc(catName(a.category))}</span>
<span class="rv-serif" style="font-size:22px;line-height:1.25;font-weight:700">${esc(a.title)}</span>
<span style="font-size:15px;line-height:1.55;color:${MUTED}">${esc(a.dek)}</span>
${(a.audience || []).length ? `<span style="font-size:13px;color:${SUB}">${t.forWho}: ${esc(a.audience.join(', '))}</span>` : ''}
</a>`).join('')}
</div></section>`);
    }

    out.push(`<div style="margin-top:48px">${this.vendorWide(d, L)}</div>`);

    out.push(`<section class="rv-grid" style="margin-top:48px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:40px">
${HUBS.map((h) => this.hubColumn(h, arts.filter((a) => { const z = zoneOf(a.category); return z && z.hub === h; }), L)).join('')}
</section>`);

    if (pr.length) {
      out.push(`<section style="margin-top:64px" aria-labelledby="rv-pr">
<div class="rv-sechead" style="border-top-color:${MUTED}">
<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 16px"><h2 id="rv-pr" class="rv-serif" style="margin:0;font-size:28px;font-weight:700">${t.pr}</h2>
<span style="font-size:14px;color:${MUTED}">${t.prSub}</span></div>
<a href="${L('/review?kategori=siaran-pers')}" style="font-size:14px;font-weight:600;color:${NAVY}">${t.prAll}</a></div>
<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px;margin-top:24px">
${pr.slice(0, 4).map((r) => this.prCard(r, L, true)).join('')}
</div></section>`);
    }

    out.push(`</main>`);
    out.push(this.expoBand(d, L, false));
    out.push(this.footer(d, L));
    return out.join('');
  }

  hubBadge(h, size) {
    const px = size || 28;
    return `<span aria-hidden="true" style="flex:0 0 ${px}px;width:${px}px;height:${px}px;border-radius:50%;background:${h.color};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(px * 0.5)}px">${h.no}</span>`;
  }

  // One hub on the front page: name, description, zone links, latest articles of the hub.
  hubColumn(h, items, L) {
    const t = T();
    return `<div style="display:flex;flex-direction:column">
<div style="border-top:3px solid ${NAVY};padding-top:12px;display:flex;gap:12px;align-items:center">
${this.hubBadge(h)}
<h2 class="rv-serif" style="margin:0;font-size:22px;font-weight:700"><a href="${L('/review?kategori=' + h.s)}" style="color:${NAVY}">${esc(h.n)}</a></h2>
</div>
<span style="font-size:14px;color:${MUTED};margin:6px 0 10px">${esc(en() ? h.en : h.id)} · ${t.forWho}: ${esc(h.who)}</span>
<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${h.zones.map(([n, s]) => `<a href="${L('/review?kategori=' + s)}" style="font-size:12px;font-weight:600;border:1px solid #C4CAD3;padding:4px 8px;color:${INK}">${esc(n)}</a>`).join('')}</div>
${items.length ? `<a href="${L('/review/' + items[0].slug)}">${this.heroImage(items[0], L)}</a>
${items.slice(0, 3).map((it) => `<a href="${L('/review/' + it.slug)}" style="display:flex;flex-direction:column;gap:6px;padding:14px 0;border-bottom:1px solid ${LINE}">
<span class="rv-kicker" style="font-size:11px;color:${RED}">${esc(catName(it.category))}</span>
<span class="rv-serif" style="font-size:17px;line-height:1.35;font-weight:600">${esc(it.title)}</span>
<span style="font-size:13px;color:${SUB}">${esc(typeName(it.articleType))} · ${esc(date(it.publishAt))}</span></a>`).join('')}`
    : `<p style="margin:0;font-size:15px;color:${MUTED}">${t.empty}</p>`}
</div>`;
  }

  // Zone filter under a hub or zone heading.
  zoneChips(d, L) {
    const h = hubOf(d.active);
    if (!h) return '';
    const chip = (label, slug) => {
      const on = d.active === slug;
      return `<a href="${L('/review?kategori=' + slug)}" style="font-size:13px;font-weight:600;padding:6px 12px;border:1px solid ${on ? NAVY : '#C4CAD3'};background:${on ? NAVY : '#fff'};color:${on ? '#fff' : INK}">${esc(label)}</a>`;
    };
    return `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">${chip(T().allZones, h.s)}${h.zones.map(([n, s]) => chip(n, s)).join('')}</div>`;
  }

  prCard(r, L, label) {
    const t = T();
    return `<a href="${L('/siaran-pers/' + r.slug)}" style="display:flex;flex-direction:column;gap:10px">
${r.imageUrl ? `<img class="rv-img" src="${esc(r.imageUrl)}" alt="" loading="lazy" style="background:${PANEL}">` : `<div class="rv-ph">${t.pr}</div>`}
${label ? `<span class="rv-kicker" style="font-size:11px;display:flex;gap:8px;align-items:center"><span style="color:${MUTED};border:1px solid #9AA3AF;padding:2px 6px">${t.pr}</span></span>` : ''}
<span class="rv-serif" style="font-size:18px;line-height:1.35;font-weight:600">${esc(r.title)}</span>
<span style="font-size:13px;color:${SUB}">${esc(date(r.publishedDate))} · ${t.via}</span></a>`;
  }

  list(d, L) {
    const t = T();
    const arts = d.articles || [];
    const pr = d.releases || [];
    const out = [this.topbar(d, L), this.masthead(d, L), this.leader(d, L), `<main class="rv-wrap" style="padding-top:32px">`];
    const lh = hubOf(d.active);
    out.push(`${d.kicker ? `<div class="rv-kicker" style="font-size:12px;margin-bottom:8px"><a href="${L('/review?kategori=' + (lh ? lh.s : ''))}" style="color:${RED}">${esc(d.kicker)}</a></div>` : ''}
<div class="rv-sechead" style="border-top:none;padding-top:0"><h1 class="rv-serif" style="margin:0;font-size:40px;font-weight:700;color:${NAVY};display:flex;gap:14px;align-items:center">${lh && lh.s === d.active ? this.hubBadge(lh, 40) : ''}${esc(d.heading || '')}</h1>
${d.intro ? `<span style="font-size:14px;color:${MUTED}">${esc(d.intro)}</span>` : ''}</div>
${this.zoneChips(d, L)}`);
    // A banner after every 6 cards; the first one is for visitors, the next for vendors.
    const withAds = (cards) => cards.map((c, i) => c + ((i + 1) % 6 === 0 && i + 1 < cards.length
      ? (((i + 1) / 6) % 2 === 1 ? this.vendorWide(d, L) : this.leader(d, L, 0, true)) : '')).join('');
    if (arts.length) {
      out.push(`<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-top:28px;gap:40px 32px">
${withAds(arts.map((a) => `<a href="${L('/review/' + a.slug)}" style="display:flex;flex-direction:column;gap:10px">
${this.heroImage(a, L)}
<span class="rv-kicker" style="font-size:11px;color:${RED};margin-top:4px">${esc(catName(a.category))} · ${esc(typeName(a.articleType))}</span>
<span class="rv-serif" style="font-size:22px;line-height:1.25;font-weight:700">${esc(a.title)}</span>
<span style="font-size:15px;line-height:1.55;color:${MUTED}">${esc(a.dek)}</span>
<span style="font-size:13px;color:${SUB}">${esc(date(a.publishAt))}</span></a>`))}
</div>`);
    } else if (pr.length) {
      out.push(`<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:36px 28px;margin-top:28px">
${withAds(pr.map((r) => this.prCard(r, L, false)))}
</div>`);
    } else {
      out.push(`<p style="margin-top:28px;font-size:17px;color:${MUTED}">${t.empty}</p>`);
    }
    out.push(`<div class="rv-grid" style="margin-top:48px">${this.vendorWide(d, L)}</div>`);
    out.push(`</main>`);
    out.push(this.expoBand(d, L, false));
    out.push(this.footer(d, L));
    return out.join('');
  }

  related(d, L) {
    const t = T();
    const a = d.article || {};
    const rel = d.related || [];
    return `<div class="rv-wrap" style="margin-top:24px"><div style="display:flex;flex-wrap:wrap;gap:32px 56px;border-top:3px solid ${NAVY};padding-top:16px">
${rel.length ? `<section style="flex:2 1 420px"><h2 class="rv-kicker" style="margin:0 0 4px;font-size:13px;color:${NAVY}">${esc(d.relatedTitle || t.related)}</h2>
${rel.map((r) => `<a href="${L('/review/' + r.slug)}" style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:1px solid ${LINE}">
${r.heroImage ? `<img src="${esc(r.heroImage)}" alt="" loading="lazy" style="flex:0 0 160px;width:160px;aspect-ratio:16/9;object-fit:cover;background:${NAVY}">` : ''}
<span style="display:flex;flex-direction:column;gap:4px"><span class="rv-kicker" style="font-size:11px;color:${RED}">${esc(catName(r.category || ''))}</span>
<span class="rv-serif" style="font-size:18px;line-height:1.35;font-weight:600">${esc(r.title)}</span></span></a>`).join('')}</section>` : ''}
<section style="flex:1 1 280px">
${(a.audience || []).length ? `<h2 class="rv-kicker" style="margin:0 0 12px;font-size:13px;color:${NAVY}">${t.writtenFor}</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px">${a.audience.map((x) => `<span style="font-size:13px;font-weight:600;border:1px solid #C4CAD3;padding:6px 10px;color:${INK}">${esc(x)}</span>`).join('')}</div>` : ''}
${this.rect(d, L, true)}
</section>
</div></div>`;
  }

  side(d, L) {
    const t = T();
    const a = d.article || {};
    const rel = d.related || [];
    const out = [];
    if ((a.audience || []).length) {
      out.push(`<section style="margin-bottom:32px"><h2 class="rv-kicker" style="margin:0 0 12px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">${t.writtenFor}</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px">${a.audience.map((x) => `<span style="font-size:13px;font-weight:600;border:1px solid #C4CAD3;padding:6px 10px;color:${INK}">${esc(x)}</span>`).join('')}</div></section>`);
    }
    if (rel.length) {
      out.push(`<section style="margin-bottom:32px"><h2 class="rv-kicker" style="margin:0 0 4px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">${t.related}</h2>
${rel.map((r) => `<a href="${L('/review/' + r.slug)}" class="rv-serif" style="display:block;padding:12px 0;border-bottom:1px solid ${LINE};font-size:17px;line-height:1.35;font-weight:600">${esc(r.title)}</a>`).join('')}</section>`);
    }
    out.push(`<section style="background:${NAVY};color:#fff;padding:24px">
<span class="rv-kicker" style="font-size:11px;color:#C9D6E8">${t.expoDates} · Jakarta</span>
<h2 class="rv-serif" style="margin:8px 0;font-size:22px;line-height:1.3;color:#fff">${esc(t.sideTitle(catName(a.category || 'teknologi')))}</h2>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#E3EAF3">${t.expoShort} ${VENUE}.</p>
<a href="${L('/register-now-2')}" class="rv-btn" style="background:#fff;color:${NAVY}">${t.register}</a>
</section>`);
    return out.join('');
  }

  expoBand(d, L, standalone) {
    const t = T();
    return `<div class="rv-wrap" style="margin-top:${standalone ? 32 : 64}px">
<section style="background:${NAVY};color:#fff;display:flex;flex-wrap:wrap;gap:24px 40px;align-items:center;justify-content:space-between;padding:36px 40px" aria-label="B2B Tech Asia Expo">
<div style="display:flex;flex-direction:column;gap:8px;flex:1 1 420px">
<span class="rv-kicker" style="color:#C9D6E8">${t.expoKicker} · ${t.expoDates}</span>
<span class="rv-serif" style="font-size:30px;font-weight:700;line-height:1.2">B2B Tech Asia Expo 2027</span>
<span style="font-size:16px;line-height:1.5;color:#E3EAF3">${t.expoDesc} ${VENUE}.</span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:12px">
<a href="${L('/register-now-2')}" class="rv-btn" style="background:#fff;color:${NAVY}">${t.register}</a>
<a href="${L(d.exhibitorPath || '/copy-of-agenda-2027')}" class="rv-btn" style="border:1px solid #fff;color:#fff;font-weight:600">${t.exhibitors}</a>
</div>
</section></div>`;
  }

  footer(d, L) {
    const t = T();
    return `<footer style="margin-top:64px;border-top:1px solid ${LINE};background:${PANEL}">
<div class="rv-wrap" style="padding-top:36px;padding-bottom:36px;display:flex;flex-wrap:wrap;gap:32px;justify-content:space-between;font-size:14px;color:${MUTED}">
<div style="display:flex;flex-direction:column;gap:8px;flex:1 1 360px">
<span class="rv-logo" style="font-size:22px">B2B Tech Asia <span>Review</span></span>
<span style="line-height:1.6">${t.about}</span>
<span>${this.langSwitch(d)}</span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:40px">
${HUBS.map((h) => `<div style="display:flex;flex-direction:column;gap:10px;max-width:220px"><a href="${L('/review?kategori=' + h.s)}" style="color:${INK}"><strong>${esc(h.n)}</strong></a>${h.zones.map(([n, s]) => `<a href="${L('/review?kategori=' + s)}" style="color:${MUTED}">${esc(n)}</a>`).join('')}</div>`).join('')}
<div style="display:flex;flex-direction:column;gap:10px"><strong style="color:${INK}">${t.pr}</strong><a href="${L('/review?kategori=siaran-pers')}" style="color:${MUTED}">${t.prAll.replace(' →', '')}</a></div>
<div style="display:flex;flex-direction:column;gap:10px"><strong style="color:${INK}">${t.expo}</strong><a href="${L('/')}" style="color:${MUTED}">B2B Tech Asia Expo</a><a href="${L('/register-now-2')}" style="color:${MUTED}">${t.register}</a><a href="${L(d.exhibitorPath || '/copy-of-agenda-2027')}" style="color:${MUTED}">${t.exhibitor}</a><a href="${L('/request-proposal-form')}" style="color:${MUTED}">${t.proposal}</a></div>
</div></div></footer>`;
  }
}

if (!customElements.get('review-ui')) customElements.define('review-ui', ReviewUi);
