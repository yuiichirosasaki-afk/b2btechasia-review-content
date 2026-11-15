// public/custom-elements/review-ui.js
// <review-ui part="front|top|side|bottom" data='{...}'>
// Renders the B2B Tech Asia Review design (see the design mockup "Beranda" / "Halaman Artikel")
// into the light DOM. Page code passes the data as a JSON string in the "data" attribute.
//   front  — the whole front page (masthead, lead story, Terbaru, Di Balik Berita, categories, Siaran Pers, Expo band, footer)
//   top    — top bar + compact masthead + category nav (article and Siaran Pers pages)
//   side   — article sidebar (Ditulis untuk, Berita Terkait, Expo card)
//   bottom — Expo band + footer

const NAVY = '#0B2A4A';
const RED = '#B42318';
const INK = '#14181F';
const MUTED = '#4A5361';
const SUB = '#5F6B7A';
const LINE = '#D9DDE3';
const PANEL = '#F4F5F7';
const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

const CATEGORIES = [
  ['Cybersecurity', 'cybersecurity'],
  ['AI & Data', 'ai-data'],
  ['Cloud & Data Center', 'cloud-data-center'],
  ['Enterprise Adoption', 'enterprise-adoption'],
  ['Regulasi', 'regulasi'],
  ['Deals', 'deals'],
];
const TYPE_LABEL = { analisis: 'Analisis', berita: 'Berita', penjelasan: 'Penjelasan' };
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wib(d) { return new Date(new Date(d).getTime() + 7 * 3600 * 1000); }
function longDate(d) { const x = wib(d); return `${DAYS[x.getUTCDay()]}, ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function date(d) { const x = wib(d); return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function shortDate(d) { const x = wib(d); return `${x.getUTCDate()} ${MON[x.getUTCMonth()]}`; }
function catSlug(name) { const c = CATEGORIES.find((x) => x[0] === name); return c ? c[1] : ''; }

const CSS = `
review-ui{display:block;width:100%;font-family:${SANS};color:${INK};-webkit-font-smoothing:antialiased}
review-ui *{box-sizing:border-box}
review-ui a{color:${INK};text-decoration:none}
review-ui a:hover{color:${RED}}
review-ui .rv-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
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
    const part = this.getAttribute('part') || 'front';
    const base = d.base || '';
    const L = (path) => base + path;
    let html = '';
    if (part === 'front') html = this.front(d, L);
    else if (part === 'top') html = this.topbar(d, L) + this.compactHeader(d, L);
    else if (part === 'side') html = this.side(d, L);
    else if (part === 'bottom') html = this.expoBand(d, L, true) + this.footer(d, L);
    this.innerHTML = html;
  }

  topbar(d, L) {
    return `<div class="rv-topbar"><div class="rv-wrap">
<span>${esc(longDate(d.now || Date.now()))} · Jakarta</span>
<a href="${L('/')}" style="color:${NAVY};font-weight:600">B2B Tech Asia Expo 2027 →</a>
</div></div>`;
  }

  navLinks(d, L, active) {
    const items = [['Terbaru', L('/review'), !active]]
      .concat(CATEGORIES.map(([n, s]) => [n, L('/review?kategori=' + s), active === s]))
      .concat([['Siaran Pers', L('/review?kategori=siaran-pers'), active === 'siaran-pers']]);
    return items.map(([n, h, on]) => `<a href="${h}" style="color:${on ? RED : (n === 'Siaran Pers' ? MUTED : INK)}">${esc(n)}</a>`).join('');
  }

  masthead(d, L) {
    return `<header class="rv-wrap" style="padding-top:28px">
<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-end;padding-bottom:20px">
<a href="${L('/review')}" style="display:flex;flex-direction:column;gap:6px">
<span class="rv-logo rv-masthead-logo" style="font-size:44px">B2B Tech Asia <span>Review</span></span>
<span style="font-size:14px;color:${MUTED}">Berita dan analisis teknologi B2B untuk pengambil keputusan</span>
</a>
</div>
<nav aria-label="Kategori" style="border-top:3px solid ${NAVY};border-bottom:1px solid ${LINE}"><div class="rv-nav">${this.navLinks(d, L, d.active)}</div></nav>
</header>`;
  }

  compactHeader(d, L) {
    return `<header class="rv-wrap" style="padding-top:20px">
<div style="display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;align-items:center">
<a href="${L('/review')}" class="rv-logo" style="font-size:30px;padding:6px 0">B2B Tech Asia <span>Review</span></a>
<nav aria-label="Kategori"><div class="rv-nav" style="font-size:14px;gap:0 22px">${this.navLinks(d, L, d.active)}</div></nav>
</div>
<div style="border-top:3px solid ${NAVY};margin-top:6px"></div>
</header>`;
  }

  heroImage(a, L, label) {
    if (a && a.heroImage) {
      return `<img class="rv-img" src="${esc(a.heroImage)}" alt="${esc((a.dataFigure || '') + ' ' + (a.dataLabel || ''))}" loading="lazy">`;
    }
    return `<div class="rv-ph" style="background:${NAVY};color:#C9D6E8">${esc(label || (a && a.category) || '')}</div>`;
  }

  front(d, L) {
    const arts = d.articles || [];
    const lead = arts[0];
    const latest = arts.slice(1, 7);
    const analysis = arts.filter((a) => a !== lead && (a.articleType === 'analisis' || a.articleType === 'penjelasan')).slice(0, 3);
    const used = new Set([lead && lead.slug].concat(analysis.map((a) => a.slug)));
    const sections = CATEGORIES.map(([n, s]) => ({ n, s, items: arts.filter((a) => a.category === n) }))
      .filter((x) => x.items.length);
    const pr = d.releases || [];
    const out = [];
    out.push(this.topbar(d, L));
    out.push(this.masthead(d, L));
    out.push(`<main class="rv-wrap" style="padding-top:32px">`);

    if (lead) {
      out.push(`<section style="display:flex;flex-wrap:wrap;gap:40px">
<article style="flex:999 1 640px;min-width:0;display:flex;flex-direction:column;gap:18px">
<a href="${L('/review/' + lead.slug)}">${this.heroImage(lead, L)}</a>
<div class="rv-kicker" style="display:flex;gap:12px;align-items:center"><a href="${L('/review?kategori=' + catSlug(lead.category))}" style="color:${RED}">${esc(lead.category)}</a><span style="color:#9AA3AF" aria-hidden="true">/</span><span style="color:${NAVY}">${esc(TYPE_LABEL[lead.articleType] || 'Analisis')}</span></div>
<h1 style="margin:0"><a class="rv-serif rv-lead-title" href="${L('/review/' + lead.slug)}" style="font-size:44px;line-height:1.12;font-weight:700;letter-spacing:-.5px">${esc(lead.title)}</a></h1>
<p class="rv-serif" style="margin:0;font-size:20px;line-height:1.5;color:#333B47">${esc(lead.dek)}</p>
<div style="font-size:13px;color:${SUB}">Redaksi B2B Tech Asia Review · ${esc(date(lead.publishAt))}${lead.readMin ? ' · ' + lead.readMin + ' menit baca' : ''}</div>
</article>
<aside style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column" aria-label="Berita terbaru">
<h2 class="rv-kicker" style="margin:0 0 4px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">Terbaru</h2>
${latest.map((n) => `<a href="${L('/review/' + n.slug)}" style="display:flex;gap:16px;padding:14px 0;border-bottom:1px solid ${LINE}">
<span style="flex:0 0 52px;font-size:13px;font-weight:600;color:${SUB};padding-top:2px">${esc(shortDate(n.publishAt))}</span>
<span style="display:flex;flex-direction:column;gap:4px"><span class="rv-kicker" style="font-size:11px;color:${RED}">${esc(n.category)}</span>
<span class="rv-serif" style="font-size:17px;line-height:1.35;font-weight:600">${esc(n.title)}</span></span></a>`).join('')}
</aside>
</section>`);
    }

    if (analysis.length) {
      out.push(`<section style="margin-top:56px" aria-labelledby="rv-dbb">
<div class="rv-sechead"><h2 id="rv-dbb" class="rv-serif" style="margin:0;font-size:28px;font-weight:700;color:${NAVY}">Di Balik Berita</h2>
<span style="font-size:14px;color:${MUTED}">Kutipan berita, ditambah analisis redaksi tentang apa artinya bagi bisnis Anda</span></div>
<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:24px">
${analysis.map((a) => `<a href="${L('/review/' + a.slug)}" style="display:flex;flex-direction:column;gap:10px">
${this.heroImage(a, L)}
<span class="rv-kicker" style="font-size:11px;color:${RED};margin-top:4px">${esc(a.category)}</span>
<span class="rv-serif" style="font-size:22px;line-height:1.25;font-weight:700">${esc(a.title)}</span>
<span style="font-size:15px;line-height:1.55;color:${MUTED}">${esc(a.dek)}</span>
${(a.audience || []).length ? `<span style="font-size:13px;color:${SUB}">Untuk: ${esc(a.audience.join(', '))}</span>` : ''}
</a>`).join('')}
</div></section>`);
    }

    if (sections.length) {
      out.push(`<section class="rv-grid" style="margin-top:56px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:40px">
${sections.map((s) => `<div style="display:flex;flex-direction:column">
<h2 class="rv-serif" style="margin:0;font-size:22px;font-weight:700;padding:12px 0 14px;border-top:3px solid ${NAVY}"><a href="${L('/review?kategori=' + s.s)}" style="color:${NAVY}">${esc(s.n)}</a></h2>
<a href="${L('/review/' + s.items[0].slug)}">${this.heroImage(s.items[0], L)}</a>
${s.items.slice(0, 3).map((it) => `<a href="${L('/review/' + it.slug)}" style="display:flex;flex-direction:column;gap:6px;padding:14px 0;border-bottom:1px solid ${LINE}">
<span class="rv-serif" style="font-size:17px;line-height:1.35;font-weight:600">${esc(it.title)}</span>
<span style="font-size:13px;color:${SUB}">${esc(TYPE_LABEL[it.articleType] || 'Analisis')} · ${esc(date(it.publishAt))}</span></a>`).join('')}
</div>`).join('')}
</section>`);
    }

    if (pr.length) {
      out.push(`<section style="margin-top:64px" aria-labelledby="rv-pr">
<div class="rv-sechead" style="border-top-color:${MUTED}">
<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 16px"><h2 id="rv-pr" class="rv-serif" style="margin:0;font-size:28px;font-weight:700">Siaran Pers</h2>
<span style="font-size:14px;color:${MUTED}">Disediakan oleh perusahaan melalui VRITIMES, bukan konten redaksi</span></div>
<a href="${L('/review?kategori=siaran-pers')}" style="font-size:14px;font-weight:600;color:${NAVY}">Lihat semua siaran pers →</a></div>
<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px;margin-top:24px">
${pr.slice(0, 4).map((r) => `<a href="${L('/siaran-pers/' + r.slug)}" style="display:flex;flex-direction:column;gap:10px">
${r.imageUrl ? `<img class="rv-img" src="${esc(r.imageUrl)}" alt="" loading="lazy" style="background:${PANEL}">` : `<div class="rv-ph">Siaran Pers</div>`}
<span class="rv-kicker" style="font-size:11px;display:flex;gap:8px;align-items:center"><span style="color:${MUTED};border:1px solid #9AA3AF;padding:2px 6px">Siaran Pers</span></span>
<span class="rv-serif" style="font-size:18px;line-height:1.35;font-weight:600">${esc(r.title)}</span>
<span style="font-size:13px;color:${SUB}">${esc(date(r.publishedDate))} · via VRITIMES</span></a>`).join('')}
</div></section>`);
    }

    out.push(`</main>`);
    out.push(this.expoBand(d, L, false));
    out.push(this.footer(d, L));
    return out.join('');
  }

  side(d, L) {
    const a = d.article || {};
    const rel = d.related || [];
    const out = [];
    if ((a.audience || []).length) {
      out.push(`<section style="margin-bottom:32px"><h2 class="rv-kicker" style="margin:0 0 12px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">Ditulis untuk</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px">${a.audience.map((x) => `<span style="font-size:13px;font-weight:600;border:1px solid #C4CAD3;padding:6px 10px;color:${INK}">${esc(x)}</span>`).join('')}</div></section>`);
    }
    if (rel.length) {
      out.push(`<section style="margin-bottom:32px"><h2 class="rv-kicker" style="margin:0 0 4px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">Berita Terkait</h2>
${rel.map((r) => `<a href="${L('/review/' + r.slug)}" class="rv-serif" style="display:block;padding:12px 0;border-bottom:1px solid ${LINE};font-size:17px;line-height:1.35;font-weight:600">${esc(r.title)}</a>`).join('')}</section>`);
    }
    out.push(`<section style="background:${NAVY};color:#fff;padding:24px">
<span class="rv-kicker" style="font-size:11px;color:#C9D6E8">${esc(d.expoDates || '14–15 Juli 2027')} · Jakarta</span>
<h2 class="rv-serif" style="margin:8px 0;font-size:22px;line-height:1.3;color:#fff">Temui penyedia ${esc((a.category || 'teknologi'))} di B2B Tech Asia Expo 2027</h2>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#E3EAF3">Pameran SaaS, AI, dan keamanan siber untuk perusahaan di Indonesia. ${esc(d.expoVenue || 'The Ritz-Carlton Jakarta, Pacific Place')}.</p>
<a href="${L('/register-now-2')}" class="rv-btn" style="background:#fff;color:${NAVY}">Daftar sebagai Pengunjung</a>
</section>`);
    return out.join('');
  }

  expoBand(d, L, standalone) {
    return `<div class="rv-wrap" style="margin-top:${standalone ? 24 : 64}px">
<section style="background:${NAVY};color:#fff;display:flex;flex-wrap:wrap;gap:24px 40px;align-items:center;justify-content:space-between;padding:36px 40px" aria-label="B2B Tech Asia Expo">
<div style="display:flex;flex-direction:column;gap:8px;flex:1 1 420px">
<span class="rv-kicker" style="color:#C9D6E8">Pameran · Jakarta · ${esc(d.expoDates || '14–15 Juli 2027')}</span>
<span class="rv-serif" style="font-size:30px;font-weight:700;line-height:1.2">B2B Tech Asia Expo 2027</span>
<span style="font-size:16px;line-height:1.5;color:#E3EAF3">Bertemu langsung dengan penyedia SaaS, AI, dan keamanan siber yang Anda baca di sini. ${esc(d.expoVenue || 'The Ritz-Carlton Jakarta, Pacific Place')}.</span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:12px">
<a href="${L('/register-now-2')}" class="rv-btn" style="background:#fff;color:${NAVY}">Daftar sebagai Pengunjung</a>
<a href="${L(d.exhibitorPath || '/copy-of-agenda-2027')}" class="rv-btn" style="border:1px solid #fff;color:#fff;font-weight:600">Lihat Exhibitor</a>
</div>
</section></div>`;
  }

  footer(d, L) {
    return `<footer style="margin-top:64px;border-top:1px solid ${LINE};background:${PANEL}">
<div class="rv-wrap" style="padding-top:36px;padding-bottom:36px;display:flex;flex-wrap:wrap;gap:32px;justify-content:space-between;font-size:14px;color:${MUTED}">
<div style="display:flex;flex-direction:column;gap:8px;flex:1 1 360px">
<span class="rv-logo" style="font-size:22px">B2B Tech Asia <span>Review</span></span>
<span style="line-height:1.6">Diterbitkan oleh B2B Tech Asia Expo. Setiap kutipan mencantumkan sumber aslinya. Hak cipta kutipan tetap milik media masing-masing. Analisis ditulis oleh redaksi B2B Tech Asia Review.</span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:40px">
<div style="display:flex;flex-direction:column;gap:10px"><strong style="color:${INK}">Topik</strong>${CATEGORIES.map(([n, s]) => `<a href="${L('/review?kategori=' + s)}" style="color:${MUTED}">${esc(n)}</a>`).join('')}<a href="${L('/review?kategori=siaran-pers')}" style="color:${MUTED}">Siaran Pers</a></div>
<div style="display:flex;flex-direction:column;gap:10px"><strong style="color:${INK}">Expo</strong><a href="${L('/')}" style="color:${MUTED}">B2B Tech Asia Expo</a><a href="${L('/register-now-2')}" style="color:${MUTED}">Daftar sebagai Pengunjung</a><a href="${L(d.exhibitorPath || '/copy-of-agenda-2027')}" style="color:${MUTED}">Exhibitor</a></div>
</div></div></footer>`;
  }
}

if (!customElements.get('review-ui')) customElements.define('review-ui', ReviewUi);
