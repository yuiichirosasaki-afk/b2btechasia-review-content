// Page code: Review Exhibitions (Item) — URL /review/expo/{slug} (Indonesian: /id/review/expo/{slug})
// The same code runs on the Japanese item page /jp/review/expo/{slug}.
// One page per exhibition edition from the ReviewExhibitions collection (EXHIBITIONS.md).
// Layout (top to bottom): #customElement1 (<review-ui part="top">), #text747 (name, status, facts — server-rendered),
// #text748 (summary, organiser figures, FAQ, sources — server-rendered), #customElement2 (<review-ui part="expoBottom">:
// official site, add to calendar, other exhibitions, Expo band, footer). The text stays in Wix text elements so it is indexable.

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
const SITE = 'https://www.b2btechasia.com';
const EXPO_PATH = '/review/expo';
const MONTHS = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const DAYS = {
  id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
};
const TXT = {
  id: {
    news: 'Berita', cal: 'Kalender Pameran', confirmed: 'TANGGAL RESMI', tba: 'TANGGAL BELUM DIUMUMKAN', cancelled: 'DIBATALKAN', own: 'DISELENGGARAKAN OLEH PENERBIT SITUS INI',
    date: 'Tanggal', notYet: 'Belum diumumkan penyelenggara', cancelledDate: 'Dibatalkan', place: 'Lokasi', organizer: 'Penyelenggara', last: 'Edisi sebelumnya', admission: 'Tiket masuk', site: 'Situs resmi', zones: 'Zona',
    adm: { free: 'Gratis', paid: 'Berbayar', mixed: 'Pameran gratis, konferensi berbayar' },
    summary: 'RINGKASAN', figures: (y) => `ANGKA PENYELENGGARA, EDISI ${y}`, exhibitors: 'exhibitor', visitors: 'pengunjung', figNote: 'Menurut penyelenggara', faq: 'PERTANYAAN YANG SERING DIAJUKAN', sources: 'SUMBER',
    checked: (d) => `Terakhir diperiksa ${d}. Jadwal dapat berubah; pastikan kembali ke penyelenggara.`,
    num: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), sep: ': ', comma: ', ',
  },
  en: {
    news: 'News', cal: 'Exhibition Calendar', confirmed: 'OFFICIAL DATES', tba: 'DATES NOT ANNOUNCED', cancelled: 'CANCELLED', own: 'ORGANISED BY THE PUBLISHER OF THIS SITE',
    date: 'Dates', notYet: 'Not yet announced by the organiser', cancelledDate: 'Cancelled', place: 'Venue', organizer: 'Organiser', last: 'Previous edition', admission: 'Admission', site: 'Official site', zones: 'Zones',
    adm: { free: 'Free', paid: 'Paid', mixed: 'Free exhibition, paid conference' },
    summary: 'OVERVIEW', figures: (y) => `ORGANISER FIGURES, ${y} EDITION`, exhibitors: 'exhibitors', visitors: 'visitors', figNote: 'According to the organiser', faq: 'FREQUENTLY ASKED QUESTIONS', sources: 'SOURCES',
    checked: (d) => `Last checked ${d}. Schedules can change; confirm with the organiser.`,
    num: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','), sep: ': ', comma: ', ',
  },
  ja: {
    news: 'ニュース', cal: '展示会カレンダー', confirmed: '公式発表の日程', tba: '日程未発表', cancelled: '中止', own: '当サイトの発行元が主催',
    date: '日程', notYet: '主催者から未発表', cancelledDate: '中止', place: '会場', organizer: '主催', last: '前回', admission: '入場', site: '公式サイト', zones: 'ゾーン',
    adm: { free: '無料', paid: '有料', mixed: '展示会は無料、カンファレンスは有料' },
    summary: '概要', figures: (y) => `主催者発表の数字（${y}年）`, exhibitors: '出展者', visitors: '来場者', figNote: '主催者発表', faq: 'よくある質問', sources: '出典',
    checked: (d) => `最終確認 ${d}。日程は変更されることがあります。主催者に最新の情報をご確認ください。`,
    num: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','), sep: '：', comma: '、',
  },
};

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
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function parse(j) { try { return j ? JSON.parse(j) : null; } catch (e) { return null; } }
// Dates are stored as 00:00 WIB; the page works with plain Jakarta days ('YYYY-MM-DD').
function day(d) { return d ? new Date(new Date(d).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10) : ''; }
function ymd(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3], dow: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay() } : null;
}
// "4–5 Agustus 2027 (Rabu–Kamis)" / "4–5 August 2027 (Wednesday–Thursday)" / "2027年8月4〜5日（水〜木）"
function dateRange(s, e, lang, withDays) {
  const a = ymd(s); const b = ymd(e) || a;
  if (!a) return '';
  const one = a.y === b.y && a.m === b.m && a.d === b.d;
  if (lang === 'ja') {
    const dow = withDays ? `（${DAYS.ja[a.dow]}${one ? '' : '〜' + DAYS.ja[b.dow]}）` : '';
    if (a.y === b.y && a.m === b.m) return `${a.y}年${a.m + 1}月${a.d}${one ? '' : '〜' + b.d}日${dow}`;
    return `${a.y}年${a.m + 1}月${a.d}日〜${a.y === b.y ? '' : b.y + '年'}${b.m + 1}月${b.d}日${dow}`;
  }
  const M = MONTHS[lang] || MONTHS.id;
  const D = DAYS[lang] || DAYS.id;
  const dow = withDays ? ` (${D[a.dow]}${one ? '' : '–' + D[b.dow]})` : '';
  if (a.y === b.y && a.m === b.m) return `${a.d}${one ? '' : '–' + b.d} ${M[a.m]} ${a.y}${dow}`;
  if (a.y === b.y) return `${a.d} ${M[a.m]} – ${b.d} ${M[b.m]} ${a.y}${dow}`;
  return `${a.d} ${M[a.m]} ${a.y} – ${b.d} ${M[b.m]} ${b.y}${dow}`;
}
function expoStatus(e, today) {
  if (e.dateStatus === 'cancelled') return 'cancelled';
  const s = day(e.startDate);
  if (e.dateStatus !== 'confirmed' || !s) return 'tba';
  return today < s ? 'upcoming' : (today <= (day(e.endDate) || s) ? 'ongoing' : 'past');
}

// Mobile (Wix mobile site, about 320px wide): smaller type. Set in onReady.
let MOBILE = false;
let JA = false;
function S(desk, mob, mobJa) { return MOBILE ? (JA && mobJa ? mobJa : mob) : desk; }
function gap(px) { return `<p style="font-size:${px}px; line-height:1"><span>&nbsp;</span></p>`; }
function kicker(text, color) {
  return `<h2 style="font-size:13px; letter-spacing:0.1em; line-height:1.4"><span style="${SANS}; color:${color || NAVY}"><strong>${text}</strong></span></h2>`;
}
// Entry HTML (p, ul, ol, li, h3, strong, em, a) → styled HTML. Lists become paragraphs with explicit markers
// because the site theme hides list bullets. Outside links are nofollow.
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
    .replace(/<h3>/g, `<h3 style="font-size:${S(22, 19, 18)}px; line-height:1.3"><span style="${SERIF}; color:${INK}"><strong>`).replace(/<\/h3>/g, '</strong></span></h3>')
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, `<a href="$1" target="_blank" rel="noopener nofollow"><span style="color:${NAVY}"><u>$2</u></span></a>`);
}
function fact(label, value) {
  return `<p style="font-size:${S(17, 15)}px; line-height:1.6"><span style="${SANS}; color:${SUB}">${label}</span><span style="${SANS}; color:${INK}"> &nbsp; <strong>${value}</strong></span></p>`;
}
function setHtml(id, html) { try { $w(id).html = html; } catch (e) { /* element missing on this page */ } }

$w.onReady(async function () {
  let raw = null;
  try { raw = $w('#dynamicDataset').getCurrentItem(); } catch (e) { /* no dataset on this page */ }
  if (!raw || !raw.dateStatus) {
    const p = wixLocationFrontend.path || [];
    raw = await wixData.query('ReviewExhibitions').eq('slug', p[p.length - 1] || '').limit(1).find().then((r) => r.items[0]).catch(() => null);
  }
  if (!raw) return;

  const lang = pageLang();
  const isJa = lang === 'ja';
  const isEn = lang === 'en';
  const L = isJa ? 'ja' : (isEn ? 'en' : 'id');
  MOBILE = wixWindowFrontend.formFactor === 'Mobile';
  JA = isJa;
  const base = isJa ? '/jp' : (isEn ? '' : '/id');
  const t = TXT[L];
  // Indonesian text is on the item; English and Japanese come from enJson / jaJson.
  const tx = Object.assign({ summaryHtml: raw.summaryHtml, faqHtml: raw.faqHtml, seoTitle: raw.seoTitle, seoDescription: raw.seoDescription }, L === 'id' ? {} : (parse(raw[L + 'Json']) || {}));
  const now = new Date();
  const today = day(now);
  const start = day(raw.startDate);
  const end = day(raw.endDate) || start;
  const status = expoStatus(raw, today);
  const dated = raw.dateStatus === 'confirmed' && !!start;
  const last = parse(raw.lastEditionJson);
  const zones = raw.zones || [];
  const place = [raw.venue, raw.city].filter(Boolean).join(t.comma);
  const path = EXPO_PATH + '/' + raw.slug;

  // Other exhibitions: same zone first (not past, not cancelled), otherwise any.
  const slim = (e) => ({ slug: e.slug, name: e.title, city: e.city || '', venue: e.venue || '', start: day(e.startDate), end: day(e.endDate), dateStatus: e.dateStatus, status: expoStatus(e, today), last: parse(e.lastEditionJson) });
  const open = (list) => list.map(slim).filter((e) => e.status !== 'past' && e.status !== 'cancelled')
    .sort((a, b) => (a.start || '9999') < (b.start || '9999') ? -1 : 1).slice(0, 3);
  const same = open(await wixData.query('ReviewExhibitions').hasSome('zones', zones).ne('slug', raw.slug).limit(50).find().then((r) => r.items).catch(() => []));
  const others = same.length ? same : open(await wixData.query('ReviewExhibitions').ne('slug', raw.slug).limit(50).find().then((r) => r.items).catch(() => []));

  const chrome = { base, siteBase: isJa ? '' : base, lang: L, path, narrow: true, now: now.toISOString(), active: 'expo' };
  try {
    const top = $w('#customElement1');
    top.setAttribute('part', 'top');
    top.setAttribute('data', JSON.stringify(chrome));
  } catch (e) { /* element missing */ }
  try {
    const bottom = $w('#customElement2');
    bottom.setAttribute('part', 'expoBottom');
    bottom.setAttribute('data', JSON.stringify(Object.assign({}, chrome, {
      expo: { slug: raw.slug, name: raw.title, start, end, dateStatus: raw.dateStatus, venue: raw.venue || '', city: raw.city || '', officialUrl: raw.officialUrl || '', own: !!raw.isOwnEvent },
      related: others, sameZone: same.length > 0,
    })));
  } catch (e) { /* element missing */ }
  try { $w('#image262').collapse(); } catch (e) { /* no image on this page */ }

  // Name, status and facts
  const badge = status === 'cancelled' ? t.cancelled : (dated ? t.confirmed : t.tba);
  const head = [];
  head.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}"><a href="${base}/review"><span style="color:${SUB}">${t.news}</span></a> &nbsp;›&nbsp; <a href="${base}${EXPO_PATH}"><span style="color:${SUB}">${t.cal}</span></a> &nbsp;›&nbsp; ${esc(raw.title)}</span></p>`);
  head.push(gap(8));
  head.push(`<p style="font-size:12px; letter-spacing:0.1em"><span style="${SANS}; color:${status === 'cancelled' || !dated ? RED : NAVY}"><strong>${badge}</strong></span>${raw.isOwnEvent ? `<span style="${SANS}; color:${SUB}"><strong> &nbsp;·&nbsp; ${t.own}</strong></span>` : ''}</p>`);
  head.push(`<h1 style="font-size:${S(44, 27, 24)}px; line-height:${MOBILE ? 1.3 : 1.14}"><span style="${SERIF}; color:${INK}"><strong>${esc(raw.title)}</strong></span></h1>`);
  if (tx.seoDescription) {
    head.push(gap(6));
    head.push(`<p style="font-size:${S(20, 17, 16)}px; line-height:1.55"><span style="${SERIF}; color:#333B47">${esc(tx.seoDescription)}</span></p>`);
  }
  head.push(gap(10));
  head.push(fact(t.date, status === 'cancelled' ? t.cancelledDate : (dated ? esc(dateRange(start, end, L, true)) : t.notYet)));
  if (place) head.push(fact(t.place, esc(place)));
  if (raw.organizer) head.push(fact(t.organizer, esc(raw.organizer)));
  if (last && last.startDate) head.push(fact(t.last, esc(dateRange(last.startDate, last.endDate, L) + (last.venue ? t.comma + last.venue : ''))));
  if (t.adm[raw.admission]) head.push(fact(t.admission, t.adm[raw.admission]));
  if (zones.length) head.push(fact(t.zones, esc(zones.join(' · '))));
  if (raw.officialUrl && !raw.isOwnEvent) {
    const host = String(raw.officialUrl).replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
    head.push(fact(t.site, `<a href="${esc(raw.officialUrl)}" target="_blank" rel="noopener nofollow"><span style="color:${NAVY}"><u>${esc(host)}</u></span></a>`));
  }
  setHtml('#text747', head.join(''));

  // Summary, organiser figures, FAQ, sources
  const b = [];
  b.push(kicker(t.summary));
  b.push(body(tx.summaryHtml));
  const figs = [['exhibitors', parse(raw.exhibitorsJson)], ['visitors', parse(raw.visitorsJson)]].filter((f) => f[1] && f[1].value);
  if (figs.length) {
    b.push(gap(24));
    b.push(kicker(t.figures(esc(figs[0][1].edition || ''))));
    figs.forEach(([k, f]) => b.push(`<p style="font-size:${S(19, 17, 16)}px; line-height:1.6"><span style="${SERIF}; color:${NAVY}"><strong>${t.num(f.value)}</strong></span><span style="${SANS}; color:${BODY}"> ${t[k]}</span></p>`));
    b.push(`<p style="font-size:13px; line-height:1.5"><span style="${SANS}; color:${SUB}">${t.figNote}${figs[0][1].sourceUrl ? ` — <a href="${esc(figs[0][1].sourceUrl)}" target="_blank" rel="noopener nofollow"><span style="color:${SUB}"><u>${esc(String(figs[0][1].sourceUrl).replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, ''))}</u></span></a>` : ''}</span></p>`);
  }
  if (tx.faqHtml) {
    b.push(gap(24));
    b.push(kicker(t.faq));
    b.push(body(tx.faqHtml));
  }
  b.push(gap(24));
  b.push(kicker(t.sources));
  b.push(body(raw.sourcesHtml, { sans: true, size: S(16, 14) }));
  if (raw.verifiedAt) b.push(`<p style="font-size:13px; line-height:1.6"><span style="${SANS}; color:${SUB}">${t.checked(esc(dateRange(day(raw.verifiedAt), '', L)))}</span></p>`);
  setHtml('#text748', b.join(''));

  const description = tx.seoDescription || '';
  await wixSeoFrontend.setTitle((tx.seoTitle || raw.title) + ' | VRI B2B Tech Asia Review');
  await wixSeoFrontend.setMetaTags([
    { name: 'description', content: description },
    { property: 'og:title', content: tx.seoTitle || raw.title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
  ].concat(isJa ? [{ property: 'og:locale', content: 'ja_JP' }] : []));
  try { await wixSeoFrontend.setLinks(langLinks(path, lang)); } catch (e) { /* keep Wix defaults */ }
  // Event structured data only when the organiser has confirmed the dates (Google requires startDate).
  if (dated || raw.dateStatus === 'cancelled') {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: raw.title,
      description,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: raw.dateStatus === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
      location: { '@type': 'Place', name: raw.venue || raw.city, address: { '@type': 'PostalAddress', addressLocality: raw.city, addressCountry: 'ID' } },
      organizer: { '@type': 'Organization', name: raw.organizer, url: raw.officialUrl },
      url: SITE + base + path,
    };
    if (dated) {
      ld.startDate = start;
      ld.endDate = end;
      try { await wixSeoFrontend.setStructuredData([ld]); } catch (e) { /* optional */ }
    }
  }
});
