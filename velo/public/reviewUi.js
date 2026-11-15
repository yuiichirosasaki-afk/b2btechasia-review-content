// public/reviewUi.js
// Shared layout for B2B Tech Asia Review pages (index, article, Siaran Pers).
// All pages render into one Wix text element, so everything here returns HTML strings.
// Colours are set explicitly because the site theme's default text colour is near-white.

export const C = {
  ink: '#1F2630',
  head: '#14181F',
  muted: '#5B6573',
  accent: '#0B4F8A',
  red: '#B3261E',
  navy: '#0B2A4A',
  rule: '#C9CED6',
};

const SERIF = "font-family:'playfair display',georgia,serif";

export const CATEGORIES = [
  { name: 'Cybersecurity', slug: 'cybersecurity' },
  { name: 'AI & Data', slug: 'ai-data' },
  { name: 'Cloud & Data Center', slug: 'cloud-data-center' },
  { name: 'Enterprise Adoption', slug: 'enterprise-adoption' },
  { name: 'Regulasi', slug: 'regulasi' },
  { name: 'Deals', slug: 'deals' },
];

export const TYPE_LABEL = { analisis: 'Analisis', berita: 'Berita', penjelasan: 'Penjelasan' };

// Links to the Expo site (relative, so Wix Multilingual keeps the reader's language).
export const EXPO = {
  home: '/',
  register: '/register-now-2',
  exhibitors: '/copy-of-agenda-2027',
  dates: '14–15 Juli 2027',
  venue: 'The Ritz-Carlton Jakarta, Pacific Place',
};

export function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Dates are shown in WIB (UTC+7) regardless of the reader's or server's time zone.
function wib(d) {
  return new Date(new Date(d).getTime() + 7 * 3600 * 1000);
}

export function fmtDate(d) {
  if (!d) return '';
  const x = wib(d);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

export function fmtLongDate(d) {
  const x = wib(d);
  return `${DAYS[x.getUTCDay()]}, ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

export function p(text, size, color, extra) {
  return `<p style="font-size:${size}px; line-height:1.55${extra ? '; ' + extra : ''}"><span style="color:${color}">${text}</span></p>`;
}

export function a(href, text, color, external) {
  const t = external ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${href}"${t}><span style="color:${color || C.head}">${text}</span></a>`;
}

export function rule() {
  return p('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 10, C.rule, 'letter-spacing:-1px; overflow:hidden; white-space:nowrap');
}

export function categorySlug(name) {
  const c = CATEGORIES.find((x) => x.name === name);
  return c ? c.slug : '';
}

// Masthead shown at the top of every Review page (the Expo site header is hidden on these pages).
export function masthead(activeSlug, isHome) {
  const nav = [a('/review', activeSlug ? 'Terbaru' : '<strong>Terbaru</strong>', C.head)]
    .concat(CATEGORIES.map((c) => a(`/review?kategori=${c.slug}`, c.slug === activeSlug ? `<strong>${esc(c.name)}</strong>` : esc(c.name), C.head)))
    .concat([a('/review?kategori=siaran-pers', activeSlug === 'siaran-pers' ? '<strong>Siaran Pers</strong>' : 'Siaran Pers', C.head)]);
  return [
    p(`${esc(fmtLongDate(new Date()))} · Edisi Indonesia`, 12, C.muted, 'letter-spacing:0.04em'),
    `<p style="font-size:44px; line-height:1.1; ${SERIF}">${a('/review', 'B2B Tech Asia Review', C.head)}</p>`,
    isHome
      ? `<h1 style="font-size:14px; line-height:1.55; font-weight:normal"><span style="color:${C.muted}">Berita dan analisis teknologi B2B untuk pengambil keputusan di Indonesia</span></h1>`
      : p('Berita dan analisis teknologi B2B untuk pengambil keputusan di Indonesia', 14, C.muted),
    rule(),
    p(nav.join('<span style="color:#9AA3AE">&nbsp;&nbsp;·&nbsp;&nbsp;</span>'), 14, C.head),
    rule(),
    p('&nbsp;', 6, C.ink),
  ].join('');
}

// Box that sends readers from the media to the Expo (one direction only).
export function expoBox(context) {
  const lead = context || 'Temui penyedia SaaS, AI, cloud, dan keamanan siber yang dibahas di B2B Tech Asia Review secara langsung.';
  return [
    p('&nbsp;', 6, C.ink),
    rule(),
    p('B2B TECH ASIA EXPO 2027', 12, C.red, 'letter-spacing:0.12em'),
    `<p style="font-size:24px; line-height:1.3; ${SERIF}"><span style="color:${C.head}">${EXPO.dates} · ${EXPO.venue}</span></p>`,
    p(esc(lead), 16, C.ink),
    p(`${a(EXPO.register, '<strong>Daftar sebagai pengunjung →</strong>', C.accent)}&nbsp;&nbsp;&nbsp;${a(EXPO.exhibitors, 'Lihat exhibitor →', C.accent)}&nbsp;&nbsp;&nbsp;${a(EXPO.home, 'Tentang pameran →', C.accent)}`, 16, C.accent),
    rule(),
  ].join('');
}

export function footer() {
  return [
    p('&nbsp;', 8, C.ink),
    p(`<strong>B2B Tech Asia Review</strong> diterbitkan oleh ${a(EXPO.home, 'B2B Tech Asia Expo', C.accent)}. Artikel merangkum berita dari sumber yang dicantumkan dan menambahkan analisis redaksi. Kutipan langsung ditandai dan dibatasi.`, 13, C.muted),
    p(`© ${new Date().getFullYear()} B2B Tech Asia Expo · ${a('/review', 'Beranda Review', C.accent)}`, 12, C.muted),
  ].join('');
}

// Article body HTML (p, ul, ol, li, h3, strong, em, a) → styled HTML.
// Lists become paragraphs with explicit markers because the theme hides list bullets.
export function ink(html) {
  let s = String(html || '');
  s = s.replace(/<ol>([\s\S]*?)<\/ol>/g, (m, inner) => {
    let n = 0;
    return inner.replace(/<li>([\s\S]*?)<\/li>/g, (mm, li) => `<p style="font-size:17px; line-height:1.6; margin-left:24px; text-indent:-24px"><span style="color:${C.ink}"><strong>${++n}.</strong>&nbsp;&nbsp;${li}</span></p>`);
  });
  s = s.replace(/<ul>([\s\S]*?)<\/ul>/g, (m, inner) =>
    inner.replace(/<li>([\s\S]*?)<\/li>/g, (mm, li) => `<p style="font-size:17px; line-height:1.6; margin-left:24px; text-indent:-18px"><span style="color:${C.ink}">•&nbsp;&nbsp;${li}</span></p>`));
  s = s
    .replace(/<p>/g, `<p style="font-size:18px; line-height:1.7"><span style="color:${C.ink}">`).replace(/<\/p>/g, '</span></p>')
    .replace(/<h3>/g, `<h3 style="font-size:21px; line-height:1.35"><span style="color:${C.head}">`).replace(/<\/h3>/g, '</span></h3>')
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, `<a href="$1" target="_blank" rel="noopener"><span style="color:${C.accent}">$2</span></a>`);
  return s;
}
