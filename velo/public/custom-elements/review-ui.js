// public/custom-elements/review-ui.js
// <review-ui part="front|top|side|bottom" data='{...}'>
// Renders the VRI B2B Tech Asia Review design (see the design mockup "Beranda" / "Halaman Artikel")
// into the light DOM. Page code passes the data as a JSON string in the "data" attribute.
//   front  — the whole front page (masthead, lead story, Terbaru, Di Balik Berita, categories, Siaran Pers, Expo band, footer)
//   top    — top bar (with ID|EN switch) + compact masthead + category nav + Expo leaderboard (article and Siaran Pers pages)
//   side   — article sidebar (Ditulis untuk, Berita Terkait, Expo card)
//   bottom — related articles + vendor banner + Expo band + footer
//   expoBottom — bottom of an exhibition page (official site, other exhibitions, Expo band, footer)
// The exhibition calendar list is part="front" with d.view = 'expo' (d.expos = entries of ReviewExhibitions).
// Language: d.lang = 'id' | 'en' | 'ja'; d.path = language-neutral path for the ID|EN|JP switch.
// Japanese pages live at /jp/review…; d.siteBase is the prefix for Expo and press-release links (the Expo site has no /jp).
// Banners: leader() visitor leaderboard, vendorWide() exhibitor banner, rect() side banner, expoBand().

const NAVY = '#0B2A4A';
const RED = '#B42318';
const INK = '#14181F';
const MUTED = '#4A5361';
const SUB = '#5F6B7A';
const LINE = '#D9DDE3';
const PANEL = '#F4F5F7';
const SERIF = "'Source Serif 4', 'Noto Serif JP', Georgia, serif";
const SANS = "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, 'Segoe UI', sans-serif";

// Categories = VRI B2B Tech Asia 2027 zones (3 hubs x 4 zones). Keep in sync with taxonomy.json.
const HUBS = [
  { n: 'AI & Automation Hub', s: 'ai-automation-hub', no: 1, color: '#8E3B3F', tint: '#F7EFEF', ink: '#5A2427',
    id: 'Keputusan teknis dan infrastruktur', en: 'Technical & infrastructure decisions', ja: '技術とインフラの意思決定', who: 'CTO, IT Director, Infrastructure Lead',
    zones: [['AI & Automation', 'ai-automation', 'AI'], ['Cloud & IT Infrastructure', 'cloud-it-infrastructure', 'Cloud'], ['Cybersecurity & Data Protection', 'cybersecurity-data-protection', 'Cybersecurity'], ['Enterprise Software & ERP', 'enterprise-software-erp', 'ERP']] },
  { n: 'Growth & Revenue Hub', s: 'growth-revenue-hub', no: 2, color: '#2C4A68', tint: '#EEF2F7', ink: '#1E3550',
    id: 'Akuisisi dan retensi pelanggan', en: 'Customer acquisition & retention', ja: '顧客の獲得と維持', who: 'CMO, Head of Sales, Growth Lead',
    zones: [['Marketing Technology', 'marketing-technology', 'MarTech'], ['Sales & CRM', 'sales-crm', 'Sales & CRM'], ['Customer Engagement & CX', 'customer-engagement-cx', 'CX'], ['E-Commerce & Retail Tech', 'ecommerce-retail-tech', 'E-Commerce']] },
  { n: 'Back Office & Operations Hub', s: 'back-office-operations-hub', no: 3, color: '#3E5A44', tint: '#EEF3EF', ink: '#2C4231',
    id: 'Fungsi yang menjaga bisnis tetap berjalan', en: 'Functions that keep business running', ja: '事業を支えるバックオフィス機能', who: 'CFO, HR Director, Operations Head',
    zones: [['FinTech & Financial Operations', 'fintech-financial-operations', 'FinTech'], ['HR Tech & Workforce Management', 'hr-tech-workforce', 'HR Tech'], ['Legal, Compliance & Governance Tech', 'legal-compliance-governance', 'Legal & Compliance'], ['Logistics & Supply Chain Tech', 'logistics-supply-chain', 'Logistics']] },
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
const JA_TYPE = { analisis: '分析', berita: 'ニュース', penjelasan: '解説' };
const JA_DAYS = ['日', '月', '火', '水', '木', '金', '土'];

// UI text. Page code sets d.lang = 'id' | 'en' | 'ja'.
const TEXT = {
  id: {
    latest: 'Terbaru', top: 'Berita Utama', pr: 'Siaran Pers', tagline: 'Berita dan analisis teknologi B2B untuk pengambil keputusan',
    behind: 'Di Balik Berita', behindSub: 'Kutipan berita, ditambah analisis redaksi tentang apa artinya bagi bisnis Anda',
    prSub: 'Disediakan oleh perusahaan melalui VRITIMES, bukan konten redaksi', prAll: 'Lihat semua siaran pers →', via: 'via VRITIMES',
    byline: 'Redaksi VRI B2B Tech Asia Review', minRead: 'menit baca', forWho: 'Untuk', writtenFor: 'Ditulis untuk', related: 'Berita Terkait',
    empty: 'Belum ada artikel di bagian ini.', expoLink: 'VRI B2B Tech Asia 2027 →', register: 'Daftar sebagai Pengunjung',
    exhibitors: 'Lihat Exhibitor', proposal: 'Minta Proposal Exhibitor', expoDates: '14–15 Juli 2027', ad: 'Iklan', cta: 'Lihat Detail Acara', dateLabel: 'Tanggal', venueLabel: 'Tempat', expoTagline: 'Ajang software B2B terbesar di Asia Tenggara',
    expoKicker: 'Pameran · Jakarta', expoDesc: 'Bertemu langsung dengan penyedia SaaS, AI, dan keamanan siber yang Anda baca di sini.',
    expoShort: 'Pameran SaaS, AI, dan keamanan siber untuk perusahaan di Indonesia.',
    sideTitle: (c) => `Temui penyedia ${c} di VRI B2B Tech Asia 2027`,
    vendorTitle: 'Untuk vendor teknologi', vendorHead: 'Jadi exhibitor di VRI B2B Tech Asia 2027',
    vendorDesc: '3 hub dan 12 zona, disusun sesuai cara komite pembelian mengambil keputusan.',
    about: 'Diterbitkan oleh VRI B2B Tech Asia. Setiap kutipan mencantumkan sumber aslinya. Hak cipta kutipan tetap milik media masing-masing. Analisis ditulis oleh redaksi VRI B2B Tech Asia Review.',
    topics: 'Topik', allZones: 'Semua zona', allIn: (h) => 'Semua di ' + h, expo: 'Expo', exhibitor: 'Exhibitor', navLabel: 'Kategori', langLabel: 'Bahasa',
  },
  en: {
    latest: 'Latest', top: 'Top Stories', pr: 'Press Releases', tagline: 'B2B technology news and analysis for decision makers',
    behind: 'Behind the News', behindSub: 'News in brief, plus our editors’ analysis of what it means for your business',
    prSub: 'Supplied by companies via VRITIMES (in Indonesian), not editorial content', prAll: 'All press releases →', via: 'via VRITIMES',
    byline: 'VRI B2B Tech Asia Review editors', minRead: 'min read', forWho: 'For', writtenFor: 'Written for', related: 'Related',
    empty: 'No articles in this section yet.', expoLink: 'VRI B2B Tech Asia 2027 →', register: 'Register to Visit',
    exhibitors: 'See Exhibitors', proposal: 'Request Exhibitor Proposal', expoDates: '14–15 July 2027', ad: 'Advertisement', cta: 'See Event Details', dateLabel: 'Date', venueLabel: 'Venue', expoTagline: 'The Biggest Event for B2B Software only in Southeast Asia',
    expoKicker: 'Exhibition · Jakarta', expoDesc: 'Meet the SaaS, AI and cybersecurity providers you read about here, in person.',
    expoShort: 'The SaaS, AI and cybersecurity exhibition for companies in Indonesia.',
    sideTitle: (c) => `Meet ${c} providers at VRI B2B Tech Asia 2027`,
    vendorTitle: 'For technology vendors', vendorHead: 'Exhibit at VRI B2B Tech Asia 2027',
    vendorDesc: '3 hubs and 12 zones, organized around how buying committees actually decide.',
    about: 'Published by VRI B2B Tech Asia. Every quotation credits its original source; copyright in quoted material remains with each publisher. Analysis is written by the VRI B2B Tech Asia Review editors.',
    topics: 'Topics', allZones: 'All zones', allIn: (h) => 'All of ' + h, expo: 'Expo', exhibitor: 'Exhibitors', navLabel: 'Categories', langLabel: 'Language',
  },
  ja: {
    latest: '最新', top: '注目ニュース', pr: 'プレスリリース', tagline: 'インドネシアのB2Bテクノロジーを意思決定者のために読み解く',
    behind: 'ニュースの背景', behindSub: 'ニュースの要点と、ビジネスへの意味を読み解く編集部の分析',
    prSub: '企業がVRITIMESを通じて配信（インドネシア語）。編集部の記事ではありません', prAll: 'プレスリリース一覧 →', via: 'VRITIMES経由',
    byline: 'VRI B2B Tech Asia Review 編集部', minRead: '分で読めます', forWho: '対象', writtenFor: 'こんな方に', related: '関連記事',
    empty: 'このセクションにはまだ記事がありません。', expoLink: 'VRI B2B Tech Asia 2027 →', register: '来場登録',
    exhibitors: '出展企業を見る', proposal: '出展資料を請求', expoDates: '2027年7月14〜15日', ad: '広告', cta: 'イベント詳細を見る', dateLabel: '日程', venueLabel: '会場', expoTagline: '東南アジア最大のB2Bソフトウェア展示会',
    expoKicker: '展示会・ジャカルタ', expoDesc: 'ここで読んだSaaS、AI、サイバーセキュリティの提供企業に、会場で直接会えます。',
    expoShort: 'インドネシアの企業向けSaaS・AI・サイバーセキュリティ展示会。',
    sideTitle: (c) => `VRI B2B Tech Asia 2027で${c}の提供企業に会う`,
    vendorTitle: 'テクノロジーベンダーの方へ', vendorHead: 'VRI B2B Tech Asia 2027に出展する',
    vendorDesc: '3つのハブと12のゾーン。購買委員会の意思決定の流れに沿って構成しています。',
    about: '発行：VRI B2B Tech Asia。引用にはすべて出典を明記しています。引用部分の著作権は各媒体に帰属します。分析はVRI B2B Tech Asia Review編集部によるものです。',
    topics: 'トピック', allZones: 'すべてのゾーン', allIn: (h) => h + 'のすべて', expo: 'Expo', exhibitor: '出展企業', navLabel: 'カテゴリー', langLabel: '言語',
  },
};
const VENUE = 'The Ritz-Carlton Jakarta, Pacific Place';
// Expo brand (from b2btechasia.com): Montserrat, navy #121A3A / #1F2853, indigo #4E54C8. Images are the Expo site's own.
const BN_NAVY = '#121A3A';
const BN_NAVY2 = '#1F2853';
const BN_INDIGO = '#4E54C8';
const BN_STAGE = '80144b_72f1adf44dcb4f41bae4c154407b9f27~mv2.jpg';
const BN_HALL = '80144b_ec554645915a4df1a596eaccf2e1fa72~mv2.jpg';
const BN_MONAS = '80144b_731c79dc65bd49faa80d901d09f3646f~mv2.png';
const BN_LOGO = 'https://static.wixstatic.com/media/80144b_bbe3ee75b8714275ab435868f7522989~mv2.jpeg/v1/crop/x_0,y_84,w_2048,h_1889/fill/w_56,h_52,al_c,q_85/b2bta-logo.jpeg';
function bnMonas(w, h) { return `https://static.wixstatic.com/media/${BN_MONAS}/v1/crop/x_0,y_250,w_937,h_620/fill/w_${w},h_${h},al_c,q_85,enc_auto/jakarta-sunrise.jpg`; }
function bnImg(id, w, h) { return `https://static.wixstatic.com/media/${id}/v1/fill/w_${w},h_${h},al_c,q_80,enc_auto/b2bta.jpg`; }

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wib(d) { return new Date(new Date(d).getTime() + 7 * 3600 * 1000); }
let LANG = 'id';
const en = () => LANG === 'en';
const ja = () => LANG === 'ja';
function longDate(d) { const x = wib(d); if (ja()) return `${x.getUTCFullYear()}年${x.getUTCMonth() + 1}月${x.getUTCDate()}日（${JA_DAYS[x.getUTCDay()]}）`; return `${(en() ? EN_DAYS : DAYS)[x.getUTCDay()]}, ${x.getUTCDate()} ${(en() ? EN_MONTHS : MONTHS)[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function date(d) { if (!d) return ''; const x = wib(d); if (ja()) return `${x.getUTCFullYear()}年${x.getUTCMonth() + 1}月${x.getUTCDate()}日`; return `${x.getUTCDate()} ${(en() ? EN_MONTHS : MONTHS)[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function shortDate(d) { const x = wib(d); if (ja()) return `${x.getUTCMonth() + 1}月${x.getUTCDate()}日`; return `${x.getUTCDate()} ${(en() ? EN_MON : MON)[x.getUTCMonth()]}`; }
function catSlug(name) { const z = zoneOf(name); return z ? z.s : ''; }
function catName(name) { const z = zoneOf(name); return z ? z.n : (name || ''); }
function typeName(t) { if (ja()) return JA_TYPE[t] || '分析'; return (en() ? EN_TYPE : TYPE_LABEL)[t] || (en() ? 'Analysis' : 'Analisis'); }
function T() { return TEXT[LANG] || TEXT.id; }

// ---------- Exhibition calendar (/review/expo, EXHIBITIONS.md) ----------
// Text for the calendar list (part="front", d.view = 'expo') and the bottom of an exhibition page (part="expoBottom").
const EXPO_PATH = '/review/expo';
const CONTACT = 'marketing@vritimes.com';
const XT = {
  id: {
    nav: 'Kalender Pameran', all: 'Semua', hub: 'Hub', search: 'Cari', searchPh: 'Nama pameran, penyelenggara, atau lokasi', city: 'Kota', allCities: 'Semua kota',
    dateStatus: 'Status tanggal', confirmed: 'Resmi', tba: 'Belum diumumkan', cancelled: 'Dibatalkan', ongoing: 'Sedang berlangsung',
    count: (n) => `${n} pameran`, dated: (n) => `${n} sudah memiliki tanggal`, checked: 'Terakhir diperiksa', listLabel: 'Daftar pameran',
    tbaGroup: 'Tanggal belum diumumkan', pastGroup: 'Sudah berlangsung', cancelledGroup: 'Dibatalkan',
    last: 'Edisi sebelumnya', detail: 'Lihat detail →', organizer: 'Penyelenggara', own: 'Diselenggarakan oleh penerbit situs ini',
    ownDesc: 'Pameran khusus software B2B. Lantai pameran ditata dalam 3 hub dan 12 zona menurut fungsi pembeli, sehingga pengunjung langsung menuju solusi untuk departemennya.',
    exhibit: 'Jadi Exhibitor', none: 'Tidak ada pameran yang cocok dengan filter ini.', empty: 'Belum ada pameran yang tercantum.',
    howTitle: 'Cara kami menyusun kalender ini',
    how: 'Redaksi mengumpulkan jadwal dari situs resmi penyelenggara, siaran pers penyelenggara, dan kalender resmi tempat acara, lalu memeriksanya ulang setiap bulan. Tanggal yang belum diumumkan penyelenggara tidak kami tampilkan. Sebelum memesan perjalanan atau stan, pastikan kembali ke penyelenggara.',
    legendTitle: 'Keterangan status tanggal',
    legendConfirmed: 'Tanggal diumumkan penyelenggara di situs atau siaran pers resminya.',
    legendTba: 'Tanggal edisi berikutnya belum diumumkan. Kami tampilkan edisi sebelumnya sebagai acuan.',
    fixTitle: 'Koreksi dan penambahan', fix: 'Ada jadwal yang berubah, atau pameran yang belum tercantum? Kirimkan ke redaksi.',
    official: 'Kunjungi situs resmi', addCal: 'Tambahkan ke kalender', report: 'Laporkan koreksi', reportSubject: 'Koreksi kalender pameran',
    sameZone: 'Pameran lain di zona yang sama', others: 'Pameran lain', allCal: 'Lihat seluruh kalender →',
    days: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  },
  en: {
    nav: 'Exhibition Calendar', all: 'All', hub: 'Hub', search: 'Search', searchPh: 'Event, organiser or venue', city: 'City', allCities: 'All cities',
    dateStatus: 'Date status', confirmed: 'Official', tba: 'Not announced', cancelled: 'Cancelled', ongoing: 'Now on',
    count: (n) => `${n} ${n === 1 ? 'event' : 'events'}`, dated: (n) => `${n} with dates`, checked: 'Last checked', listLabel: 'Exhibitions',
    tbaGroup: 'Dates not yet announced', pastGroup: 'Past events', cancelledGroup: 'Cancelled',
    last: 'Previous edition', detail: 'Details →', organizer: 'Organiser', own: 'Organised by the publisher of this site',
    ownDesc: 'A B2B software-only exhibition. The floor is arranged in 3 hubs and 12 zones by buyer function, so visitors go straight to the solutions for their department.',
    exhibit: 'Become an Exhibitor', none: 'No events match these filters.', empty: 'No events listed yet.',
    howTitle: 'How we compile this calendar',
    how: 'Our editors collect dates from organisers’ official websites, their press releases and venues’ official calendars, and re-check them every month. Dates the organiser has not announced are not shown. Before booking travel or a booth, confirm with the organiser.',
    legendTitle: 'About the date status',
    legendConfirmed: 'Dates announced by the organiser on its website or in an official press release.',
    legendTba: 'Dates of the next edition have not been announced. The previous edition is shown for reference.',
    fixTitle: 'Corrections and additions', fix: 'Has a date changed, or is an event missing? Tell our editors.',
    official: 'Visit the official site', addCal: 'Add to calendar', report: 'Report a correction', reportSubject: 'Exhibition calendar correction',
    sameZone: 'Other events in the same zone', others: 'Other events', allCal: 'See the full calendar →',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  ja: {
    nav: '展示会カレンダー', all: 'すべて', hub: 'Hub', search: '検索', searchPh: '展示会名、主催者、会場', city: '都市', allCities: 'すべての都市',
    dateStatus: '日程の状態', confirmed: '公式発表', tba: '未発表', cancelled: '中止', ongoing: '開催中',
    count: (n) => `${n}件`, dated: (n) => `日程あり ${n}件`, checked: '最終確認', listLabel: '展示会の一覧',
    tbaGroup: '日程未発表', pastGroup: '開催済み', cancelledGroup: '中止',
    last: '前回', detail: '詳細を見る →', organizer: '主催', own: '当サイトの発行元が主催',
    ownDesc: 'B2Bソフトウェア専門の展示会。会場は買い手の部門に合わせて3つのハブと12のゾーンに分かれており、来場者は自部門向けのソリューションをまっすぐ見て回れる。',
    exhibit: '出展する', none: '条件に合う展示会はありません。', empty: '掲載中の展示会はまだありません。',
    howTitle: 'このカレンダーの作り方',
    how: '編集部が主催者の公式サイト、主催者のプレスリリース、会場の公式の催事予定から日程を集め、毎月確認し直しています。主催者が発表していない日程は掲載しません。出張や出展を手配する前に、主催者に最新の情報をご確認ください。',
    legendTitle: '日程の状態について',
    legendConfirmed: '主催者が公式サイトまたはプレスリリースで発表した日程です。',
    legendTba: '次回の日程は発表されていません。参考として前回の開催実績を表示しています。',
    fixTitle: '訂正・追加のご連絡', fix: '日程の変更や、掲載されていない展示会があればお知らせください。',
    official: '公式サイトを見る', addCal: 'カレンダーに追加', report: '訂正を連絡する', reportSubject: '展示会カレンダーの訂正',
    sameZone: '同じゾーンの展示会', others: 'ほかの展示会', allCal: 'カレンダー全体を見る →',
    days: JA_DAYS,
  },
};
function X() { return XT[LANG] || XT.id; }
// Exhibition dates are plain 'YYYY-MM-DD' strings (Jakarta calendar days), never shifted by time zone.
function ymd(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3], dow: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay() } : null;
}
function monthTitle(y, m) { return ja() ? `${y}年${m + 1}月` : `${(en() ? EN_MONTHS : MONTHS)[m]} ${y}`; }
// "4–5 Agustus 2027" / "4–5 August 2027" / "2027年8月4〜5日"
function dateRange(s, e) {
  const a = ymd(s); const b = ymd(e) || a;
  if (!a) return '';
  if (ja()) {
    if (a.y === b.y && a.m === b.m) return `${a.y}年${a.m + 1}月${a.d}${a.d === b.d ? '' : '〜' + b.d}日`;
    return `${a.y}年${a.m + 1}月${a.d}日〜${a.y === b.y ? '' : b.y + '年'}${b.m + 1}月${b.d}日`;
  }
  const M = en() ? EN_MONTHS : MONTHS;
  if (a.y === b.y && a.m === b.m) return `${a.d}${a.d === b.d ? '' : '–' + b.d} ${M[a.m]} ${a.y}`;
  if (a.y === b.y) return `${a.d} ${M[a.m]} – ${b.d} ${M[b.m]} ${a.y}`;
  return `${a.d} ${M[a.m]} ${a.y} – ${b.d} ${M[b.m]} ${b.y}`;
}
// Date column of the list: "4–5" (the month is the group heading); across months "29/10–1/11".
function dayRange(s, e) {
  const a = ymd(s); const b = ymd(e) || a;
  if (!a) return '';
  if (a.m === b.m) return a.d === b.d ? String(a.d) : `${a.d}–${b.d}`;
  return `${a.d}/${a.m + 1}–${b.d}/${b.m + 1}`;
}
function dowRange(s, e) {
  const a = ymd(s); const b = ymd(e) || a;
  if (!a) return '';
  const D = X().days;
  if (s === e || !e) return D[a.dow];
  return D[a.dow] + (ja() ? '〜' : '–') + D[b.dow];
}
function hubsOfZones(zones) {
  const out = [];
  (zones || []).forEach((n) => { const z = zoneOf(n); if (z && out.indexOf(z.hub) < 0) out.push(z.hub); });
  return out;
}
function statusBadge(kind, onDark) {
  const x = X();
  const base = 'display:inline-flex;align-items:center;height:26px;padding:0 10px;font-size:12px;font-weight:700;letter-spacing:.4px;white-space:nowrap;';
  if (kind === 'confirmed') return `<span style="${base}background:${onDark ? '#fff' : NAVY};color:${onDark ? NAVY : '#fff'}">${x.confirmed}</span>`;
  if (kind === 'ongoing') return `<span style="${base}background:${RED};color:#fff">${x.ongoing}</span>`;
  if (kind === 'cancelled') return `<span style="${base}background:#fff;color:${RED};border:1px solid ${RED}">${x.cancelled}</span>`;
  return `<span style="${base}background:#E6E9ED;color:${MUTED}">${x.tba}</span>`;
}
// One line for an entry without dates: "Edisi sebelumnya: 15–16 September 2026, venue".
function lastLine(e) {
  const l = e.last;
  if (!l || !l.startDate) return '';
  return `${X().last}${ja() ? '：' : ': '}${dateRange(l.startDate, l.endDate)}${l.venue ? (ja() ? '、' : ', ') + l.venue : ''}`;
}

const CSS = `
[data-testid="colorUnderlay"]{background-color:#FFFFFF!important}
review-ui{min-height:0!important;height:auto!important}
[id^="comp-"]:has(> review-ui){height:auto!important;min-height:0!important}
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
review-ui .rv-nav a.rv-hubtab{border-bottom:3px solid transparent;padding-bottom:9px}
review-ui .rv-nav a.rv-hubtab.on,review-ui .rv-nav a.rv-hubtab:hover{border-bottom-color:var(--hub);color:var(--hub)!important}
review-ui .rv-zrow{display:flex;align-items:center;gap:8px 26px;padding:10px 14px;font-size:14px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
review-ui .rv-zrow::-webkit-scrollbar{display:none}
review-ui .rv-zrow a:hover{text-decoration:underline;text-underline-offset:5px}
review-ui .rv-kicker{font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase}
review-ui .rv-serif{font-family:${SERIF}}
review-ui .rv-img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:${NAVY}}
review-ui .rv-ph{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:16/9;background:${PANEL};border:1px solid ${LINE};color:${MUTED};font-size:13px;text-align:center;padding:16px}
review-ui .rv-grid{display:grid;gap:32px}
review-ui .rv-front{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(0,1fr) minmax(0,1.15fr);gap:32px;align-items:start}
review-ui .rv-front-seconds{display:flex;flex-direction:column;gap:24px}
review-ui .rv-front-second{display:flex;flex-direction:column;padding-bottom:20px;border-bottom:1px solid ${LINE}}
review-ui .rv-front-latest{display:flex;flex-direction:column;min-width:0}
@media (max-width:1080px){review-ui .rv-front{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}review-ui .rv-front-latest{grid-column:1 / -1}}
review-ui .rv-sechead{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;border-top:3px solid ${NAVY};padding-top:12px}
review-ui .rv-btn{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;font-weight:700;font-size:15px;border-radius:2px}
review-ui .rv-lang a{padding:2px 4px;color:${MUTED}}
review-ui .rv-lang a.on{color:${NAVY};font-weight:700;border-bottom:2px solid ${RED}}
review-ui .rv-adlabel{display:block;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8A94A3;margin-bottom:4px}
review-ui .xp-hide{display:none!important}
review-ui .xp-input{font-family:inherit;font-size:15px;padding:0 12px;height:44px;width:100%;border:1px solid #C4CAD3;border-radius:2px;color:${INK};background:#fff}
review-ui .xp-hubbtn{font-family:inherit;font-size:14px;font-weight:600;min-height:44px;padding:0 16px;border:1px solid #C4CAD3;background:#fff;color:${INK};border-radius:2px;cursor:pointer}
review-ui .xp-hubbtn[aria-pressed="true"]{border-color:${NAVY};background:${NAVY};color:#fff}
review-ui .xp-row a:hover{text-decoration:underline;text-underline-offset:4px}
review-ui .xp-own a:hover{color:#fff}
review-ui .bn{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;color:#fff;font-family:'Montserrat',${SANS};background-color:${BN_NAVY};background-size:cover;background-position:center right;border-radius:10px;overflow:hidden;text-decoration:none}
review-ui a.bn:hover{color:#fff;filter:brightness(1.06)}
review-ui .bn-leader{padding:22px 28px;min-height:132px}
review-ui .bn-vendor{padding:28px;min-height:170px}
review-ui .bn-band{padding:44px 44px;min-height:280px;justify-content:space-between}
review-ui .bn-col{display:flex;flex-direction:column;gap:6px;flex:1 1 360px;min-width:0}
review-ui .bn-logo{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;background:#fff;color:${BN_NAVY};font-weight:700;font-size:13px;letter-spacing:.3px;padding:6px 12px 6px 6px;border-radius:8px}
review-ui .bn-logo img{display:block;width:28px;height:26px;object-fit:contain}
review-ui .bn-date{font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#B9BDF7}
review-ui .bn-title{font-size:30px;font-weight:800;line-height:1.15;letter-spacing:.2px;color:#fff}
review-ui .bn-sub{font-size:14px;line-height:1.5;color:#E4E7F5;font-weight:500}
review-ui .bn-cta{display:inline-flex;align-items:center;min-height:46px;padding:0 22px;background:#fff;color:${BN_NAVY2}!important;font-weight:700;font-size:15px;border-radius:999px;white-space:nowrap;font-family:'Montserrat',${SANS}}
review-ui .bn-cta-ghost{background:transparent;color:#fff!important;border:2px solid #fff}
review-ui .bn-hubs{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
review-ui .bn-hub{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);padding:4px 10px 4px 4px;border-radius:999px}
review-ui .bn-hub i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:700}
review-ui .bn-rect{flex-direction:column;align-items:stretch;gap:0}
review-ui .bn-photo{position:relative;display:block;flex:0 0 auto;height:0;padding-top:56.25%;background-size:cover;background-position:center}
review-ui .bn-pill{position:absolute;left:14px;bottom:12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:${BN_INDIGO};color:#fff;padding:5px 10px;border-radius:999px}
review-ui .bn-body{display:flex;flex-direction:column;gap:10px;padding:18px 20px 22px}
review-ui .bn-rect .bn-cta{align-self:flex-start;margin-top:4px}
review-ui .tk{display:flex;min-height:170px;text-decoration:none;color:${BN_NAVY};font-family:'Montserrat',${SANS};filter:drop-shadow(0 2px 6px rgba(18,26,58,.14))}
review-ui a.tk:hover{color:${BN_NAVY};filter:drop-shadow(0 4px 12px rgba(18,26,58,.22))}
review-ui .tk-stub{position:relative;flex:0 0 34%;border-radius:10px 0 0 10px;background-size:cover;background-position:62% 55%;background-color:#F2C48D;display:block}
review-ui .tk-tag{position:absolute;left:14px;top:12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fff;background:rgba(18,26,58,.55);padding:4px 8px;border-radius:4px}
review-ui .tk-body{flex:1 1 auto;display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between;background:#FFF8EF;border-radius:0 10px 10px 0;padding:20px 28px;border-left:2px dashed #E3B98A;min-width:0}
review-ui .tk-label{font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#C0651A}
review-ui .tk-title{font-size:28px;font-weight:800;line-height:1.15;color:${BN_NAVY}}
review-ui .tk-rows{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:14px;margin-top:2px}
review-ui .tk-k{color:#8A94A3;font-weight:600}
review-ui .tk-v{font-weight:700;color:${BN_NAVY}}
review-ui .tk-cta{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;background:${BN_NAVY};color:#fff!important;font-weight:700;font-size:15px;border-radius:999px;white-space:nowrap;font-family:'Montserrat',${SANS}}
review-ui .tk-cta-ghost{background:transparent;color:${BN_NAVY}!important;border:2px solid ${BN_NAVY}}
review-ui .tk-vert{flex-direction:column}
review-ui .tk-vert .tk-stub{flex:0 0 auto;height:0;padding-top:52%;border-radius:10px 10px 0 0}
review-ui .tk-vert .tk-body{flex-direction:column;align-items:stretch;gap:8px;border-left:none;border-top:2px dashed #E3B98A;border-radius:0 0 10px 10px;padding:18px 20px 22px}
review-ui .tk-band{min-height:300px}
review-ui .tk-band .tk-stub{flex:0 0 38%}
review-ui .tk-band .tk-body{padding:32px 36px}
@media (max-width:760px){review-ui .tk{flex-direction:column}review-ui .tk .tk-stub{flex:0 0 auto;height:0;padding-top:42%;border-radius:10px 10px 0 0}review-ui .tk .tk-body{border-left:none;border-top:2px dashed #E3B98A;border-radius:0 0 10px 10px;padding:18px 20px}review-ui .tk-title{font-size:22px!important}}
@media (max-width:760px){review-ui .bn-title{font-size:22px!important}review-ui .bn-band{padding:28px 22px}review-ui .bn-leader,review-ui .bn-vendor{padding:20px}}
@media (max-width:760px){
 review-ui .rv-lead-title{font-size:32px!important}
 review-ui .rv-wrap{padding:0 16px}
 review-ui .rv-logo{white-space:nowrap}
 review-ui .rv-masthead-logo{font-size:21px!important}
 review-ui .rv-compact-logo{font-size:20px!important}
 review-ui .rv-topbar .rv-wrap{flex-wrap:nowrap;gap:8px;font-size:12px;padding-top:6px;padding-bottom:6px}
 review-ui .rv-topbar .rv-wrap>span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 review-ui .rv-topbar-expo{display:none!important}
 review-ui .rv-nav{flex-wrap:nowrap!important;overflow-x:auto;white-space:nowrap;gap:0 18px!important;font-size:14px!important;scrollbar-width:none;-webkit-overflow-scrolling:touch}
 review-ui .rv-nav::-webkit-scrollbar{display:none}
 review-ui .rv-nav a{flex:0 0 auto}
 review-ui .rv-zrow{gap:8px 18px;padding:9px 12px;font-size:13px}
 review-ui .rv-compact-nav{width:100%}
 review-ui .rv-hide-mobile{display:none!important}
 review-ui .rv-grid{grid-template-columns:minmax(0,1fr)!important;gap:32px!important}
 review-ui .rv-front{grid-template-columns:minmax(0,1fr)!important;gap:28px!important}
 review-ui .rv-front-latest{grid-column:auto!important}
 review-ui .rv-front-second{display:grid!important;grid-template-columns:128px minmax(0,1fr);column-gap:12px;align-items:start}
 review-ui .rv-front-second > .rv-img, review-ui .rv-front-second > .rv-ph{grid-row:1 / span 3}
 review-ui .rv-front-second > .rv-kicker{margin-top:0!important}
 review-ui .rv-front-second > .rv-serif{font-size:16px!important}
 review-ui .rv-front-seconds{gap:16px!important}
 review-ui .rv-lead-title{font-size:26px!important;line-height:1.25!important}
 review-ui[lang="ja"] .rv-lead-title{font-size:23px!important;letter-spacing:0!important}
 review-ui .rv-lead-title + p, review-ui h1 + p.rv-serif{font-size:16px!important}
 review-ui .rv-list-title{font-size:26px!important;gap:10px!important;align-items:flex-start!important;line-height:1.2}
 review-ui .rv-list-title > span[aria-hidden]{flex:0 0 30px!important;width:30px!important;height:30px!important;font-size:15px!important;margin-top:2px}
 review-ui .rv-sechead h2{font-size:22px!important}
 review-ui .rv-rel{flex-direction:column;gap:10px!important}
 review-ui .rv-rel img{flex:0 0 auto!important;width:100%!important}
 review-ui .rv-rel-title{font-size:17px!important}
 review-ui .tk .tk-stub{padding-top:34%!important}
 review-ui .xp-date{flex:1 1 100%!important;flex-direction:row!important;align-items:baseline;gap:10px!important}
 review-ui .xp-own{padding:24px 20px!important}
 review-ui .xp-own .rv-serif{font-size:26px!important}
 review-ui .xp-filter{padding:16px!important}
}
/* Wix's mobile view can keep a wide window and only narrow the page column: same rules by the element's own width. */
review-ui{container:rv / inline-size}
@container rv (max-width:760px){review-ui .tk{flex-direction:column}review-ui .tk .tk-stub{flex:0 0 auto;height:0;padding-top:42%;border-radius:10px 10px 0 0}review-ui .tk .tk-body{border-left:none;border-top:2px dashed #E3B98A;border-radius:0 0 10px 10px;padding:18px 20px}review-ui .tk-title{font-size:22px!important}}
@container rv (max-width:760px){review-ui .bn-title{font-size:22px!important}review-ui .bn-band{padding:28px 22px}review-ui .bn-leader,review-ui .bn-vendor{padding:20px}}
@container rv (max-width:760px){
 review-ui .rv-lead-title{font-size:32px!important}
 review-ui .rv-wrap{padding:0 16px}
 review-ui .rv-logo{white-space:nowrap}
 review-ui .rv-masthead-logo{font-size:21px!important}
 review-ui .rv-compact-logo{font-size:20px!important}
 review-ui .rv-topbar .rv-wrap{flex-wrap:nowrap;gap:8px;font-size:12px;padding-top:6px;padding-bottom:6px}
 review-ui .rv-topbar .rv-wrap>span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 review-ui .rv-topbar-expo{display:none!important}
 review-ui .rv-nav{flex-wrap:nowrap!important;overflow-x:auto;white-space:nowrap;gap:0 18px!important;font-size:14px!important;scrollbar-width:none;-webkit-overflow-scrolling:touch}
 review-ui .rv-nav::-webkit-scrollbar{display:none}
 review-ui .rv-nav a{flex:0 0 auto}
 review-ui .rv-zrow{gap:8px 18px;padding:9px 12px;font-size:13px}
 review-ui .rv-compact-nav{width:100%}
 review-ui .rv-hide-mobile{display:none!important}
 review-ui .rv-grid{grid-template-columns:minmax(0,1fr)!important;gap:32px!important}
 review-ui .rv-front{grid-template-columns:minmax(0,1fr)!important;gap:28px!important}
 review-ui .rv-front-latest{grid-column:auto!important}
 review-ui .rv-front-second{display:grid!important;grid-template-columns:128px minmax(0,1fr);column-gap:12px;align-items:start}
 review-ui .rv-front-second > .rv-img, review-ui .rv-front-second > .rv-ph{grid-row:1 / span 3}
 review-ui .rv-front-second > .rv-kicker{margin-top:0!important}
 review-ui .rv-front-second > .rv-serif{font-size:16px!important}
 review-ui .rv-front-seconds{gap:16px!important}
 review-ui .rv-lead-title{font-size:26px!important;line-height:1.25!important}
 review-ui[lang="ja"] .rv-lead-title{font-size:23px!important;letter-spacing:0!important}
 review-ui .rv-lead-title + p, review-ui h1 + p.rv-serif{font-size:16px!important}
 review-ui .rv-list-title{font-size:26px!important;gap:10px!important;align-items:flex-start!important;line-height:1.2}
 review-ui .rv-list-title > span[aria-hidden]{flex:0 0 30px!important;width:30px!important;height:30px!important;font-size:15px!important;margin-top:2px}
 review-ui .rv-sechead h2{font-size:22px!important}
 review-ui .rv-rel{flex-direction:column;gap:10px!important}
 review-ui .rv-rel img{flex:0 0 auto!important;width:100%!important}
 review-ui .rv-rel-title{font-size:17px!important}
 review-ui .tk .tk-stub{padding-top:34%!important}
 review-ui .xp-date{flex:1 1 100%!important;flex-direction:row!important;align-items:baseline;gap:10px!important}
 review-ui .xp-own{padding:24px 20px!important}
 review-ui .xp-own .rv-serif{font-size:26px!important}
 review-ui .xp-filter{padding:16px!important}
}
`;

// Wix's mobile Quick Action Bar ("Free Ticket" / "Chat") is site-wide; Review pages don't need it.
// It has no stable id, so find the fixed bar that holds the "Free Ticket" action and hide it on pages with <review-ui>.
function hideQuickActionBar() {
  const hide = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (/Free Ticket/i.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP) });
    let n;
    while ((n = w.nextNode())) {
      if (n.parentElement && n.parentElement.closest('review-ui')) continue;
      let el = n.parentElement;
      while (el && el !== document.body && getComputedStyle(el).position !== 'fixed') el = el.parentElement;
      if (el && el !== document.body && !el.dataset.rvHidden) { el.style.setProperty('display', 'none', 'important'); el.dataset.rvHidden = '1'; }
    }
  };
  hide();
  const mo = new MutationObserver(hide);
  mo.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => mo.disconnect(), 20000);
}

function ensureAssets() {
  if (document.getElementById('rv-fonts')) return;
  try { hideQuickActionBar(); } catch (e) { /* never break the page for this */ }
  const l = document.createElement('link');
  l.id = 'rv-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap';
  document.head.appendChild(l);
  if (document.documentElement.lang === 'ja' || /^\/jp(\/|$)/.test(location.pathname)) {
    const j = document.createElement('link');
    j.rel = 'stylesheet';
    j.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700&display=swap';
    document.head.appendChild(j);
  }
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
    LANG = d.lang === 'en' || d.lang === 'ja' ? d.lang : 'id';
    this.setAttribute('lang', LANG);
    const part = this.getAttribute('part') || 'front';
    const base = d.base || '';
    const L = (path) => base + path;
    const siteBase = d.siteBase != null ? d.siteBase : base;
    L.site = (path) => siteBase + path; // Expo pages and press releases (no Japanese version)
    this.classList.toggle('rv-narrow', !!d.narrow);
    let html = '';
    if (part === 'front') html = d.view === 'expo' ? this.expoList(d, L) : (d.view === 'list' ? this.list(d, L) : this.front(d, L));
    else if (part === 'top') html = this.topbar(d, L) + this.compactHeader(d, L) + this.leader(d, L, 16);
    else if (part === 'side') html = this.side(d, L);
    else if (part === 'bottom') html = this.related(d, L) + this.expoBand(d, L, true) + this.footer(d, L);
    else if (part === 'expoBottom') html = this.expoBottom(d, L) + this.footer(d, L);
    this.innerHTML = html;
    this.bindNav();
    this.bindExpo();
  }

  // Links to the same page in the other language. d.path is language-neutral (e.g. /review/slug).
  langSwitch(d) {
    const path = d.path || '/review';
    const on = (l) => (LANG === l ? ' class="on" aria-current="true"' : '');
    // Press releases have no Japanese page: JP goes to the Japanese Review front page.
    const jaPath = path.indexOf('/siaran-pers') === 0 ? '/jp/review' : '/jp' + path;
    return `<span class="rv-lang" aria-label="${T().langLabel}" style="display:inline-flex;gap:6px;align-items:center;font-weight:600">
<a href="${esc('/id' + path)}" hreflang="id"${on('id')}>ID</a><span style="color:#B7BEC8">|</span><a href="${esc(path)}" hreflang="en"${on('en')}>EN</a><span style="color:#B7BEC8">|</span><a href="${esc(jaPath)}" hreflang="ja"${on('ja')}>JP</a></span>`;
  }

  topbar(d, L) {
    return `<div class="rv-topbar"><div class="rv-wrap">
<span>${esc(longDate(d.now || Date.now()))}<span class="rv-hide-mobile"> · Jakarta</span></span>
<span style="display:inline-flex;gap:20px;align-items:center;flex-wrap:wrap">
<a href="${L.site('/')}" class="rv-topbar-expo" style="color:${NAVY};font-weight:600">${T().expoLink}</a>
${this.langSwitch(d)}
</span>
</div></div>`;
  }

  // Main menu (design option A): Terbaru, the 3 hubs as tabs, Kalender Pameran, Siaran Pers.
  // The active hub has an underline in its colour; hovering a hub shows its zones in the row below.
  navLinks(d, L, active) {
    const hub = hubOf(active);
    const link = (n, h, on, color) => `<a href="${h}" style="color:${on ? RED : color}">${esc(n)}</a>`;
    const hubs = HUBS.map((h) => {
      const on = !!hub && hub.s === h.s;
      return `<a href="${L('/review?kategori=' + h.s)}" class="rv-hubtab${on ? ' on' : ''}" data-hub="${h.s}" style="--hub:${h.color};color:${on ? h.color : INK}">${esc(h.n)}</a>`;
    }).join('');
    return link(T().latest, L('/review'), !active, INK) + hubs + link(X().nav, L(EXPO_PATH), active === 'expo', INK) + link(T().pr, L('/review?kategori=siaran-pers'), active === 'siaran-pers', MUTED);
  }

  // Second row: the 4 zones of one hub, full names, on the hub's tint. Shows the current hub
  // (or the first hub on the front page); the other hubs' rows are swapped in on hover.
  subNav(d, L) {
    const cur = hubOf(d.active) || HUBS[0];
    return `<div class="rv-zrows">${HUBS.map((h) => `<nav aria-label="${esc(h.n)}" class="rv-zrow" data-hub="${h.s}" style="background:${h.tint};color:${h.ink}${h === cur ? '' : ';display:none'}">
<a href="${L('/review?kategori=' + h.s)}" style="color:${h.ink};${d.active === h.s ? 'font-weight:700;text-decoration:underline;text-underline-offset:5px' : 'font-weight:600'}">${esc(T().allZones)}</a>
${h.zones.map(([n, s]) => `<a href="${L('/review?kategori=' + s)}" style="color:${h.ink};${d.active === s ? 'font-weight:700;text-decoration:underline;text-underline-offset:5px' : ''}">${esc(n)}</a>`).join('')}
</nav>`).join('')}</div>`;
  }

  // Hover on a hub tab → show that hub's zones; leaving the menu → back to the current hub.
  bindNav() {
    this.querySelectorAll('header').forEach((hd) => {
      const rows = [...hd.querySelectorAll('.rv-zrow')];
      if (!rows.length) return;
      const show = (slug) => rows.forEach((r) => { r.style.display = r.dataset.hub === slug ? 'flex' : 'none'; });
      const home = (rows.find((r) => r.style.display !== 'none') || rows[0]).dataset.hub;
      hd.querySelectorAll('.rv-hubtab').forEach((a) => a.addEventListener('mouseenter', () => show(a.dataset.hub)));
      hd.addEventListener('mouseleave', () => show(home));
    });
  }

  masthead(d, L) {
    return `<header class="rv-wrap" style="padding-top:28px">
<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-end;padding-bottom:20px">
<a href="${L('/review')}" style="display:flex;flex-direction:column;gap:6px">
<span class="rv-logo rv-masthead-logo" style="font-size:44px">VRI B2B Tech Asia <span>Review</span></span>
<span style="font-size:14px;color:${MUTED}">${T().tagline}</span>
</a>
</div>
<nav aria-label="${T().navLabel}" style="border-top:3px solid ${NAVY};border-bottom:1px solid ${LINE}"><div class="rv-nav">${this.navLinks(d, L, d.active)}</div></nav>
${this.subNav(d, L)}
</header>`;
  }

  compactHeader(d, L) {
    return `<header class="rv-wrap" style="padding-top:20px">
<div style="display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;align-items:center">
<a href="${L('/review')}" class="rv-logo rv-compact-logo" style="font-size:30px;padding:6px 0">VRI B2B Tech Asia <span>Review</span></a>
<nav aria-label="${T().navLabel}" class="rv-compact-nav"><div class="rv-nav" style="font-size:14px;gap:0 22px">${this.navLinks(d, L, d.active)}</div></nav>
</div>
<div style="border-top:3px solid ${NAVY};margin-top:6px"></div>
${this.subNav(d, L)}
</header>`;
  }

  // ---------- Expo banners (house ads) ----------
  // Visuals come from the Expo site (b2btechasia.com): logo, main-stage and exhibition-hall photos,
  // the Monas skyline, Montserrat and the Expo navy/indigo. Text uses only facts from that site.
  logoChip(dark) {
    return `<span class="bn-logo${dark ? ' bn-logo-dark' : ''}"><img src="${BN_LOGO}" alt="" width="28" height="26">VRI B2B TECH ASIA</span>`;
  }

  // Ticket rows: date and venue (design C).
  ticketRows() {
    const t = T();
    return `<span class="tk-rows"><span class="tk-k">${t.dateLabel}</span><span class="tk-v">${t.expoDates}</span><span class="tk-k">${t.venueLabel}</span><span class="tk-v">${VENUE}</span></span>`;
  }

  // Leaderboard (design C, ticket): sunrise photo stub + perforation + date/venue. → Expo top page.
  leader(d, L, top, inGrid) {
    const t = T();
    return `<div ${inGrid ? 'style="grid-column:1/-1"' : `class="rv-wrap" style="margin-top:${top == null ? 24 : top}px"`}><span class="rv-adlabel">${t.ad}</span>
<a class="tk" href="${L.site('/')}" aria-label="VRI B2B Tech Asia 2027 — ${esc(t.cta)}">
<span class="tk-stub" style="background-image:url('${bnMonas(760, 380)}')"><span class="tk-tag">Jakarta · 2027</span></span>
<span class="tk-body">
<span class="bn-col" style="gap:6px">
<span class="tk-label">${t.expoTagline}</span>
<span class="tk-title">VRI B2B TECH ASIA 2027</span>
${this.ticketRows()}
</span>
<span class="tk-cta">${t.cta} →</span>
</span></a></div>`;
  }

  // Exhibitor banner (wide): vendors → proposal request form.
  vendorWide(d, L) {
    const t = T();
    return `<div style="grid-column:1/-1"><span class="rv-adlabel">${t.ad}</span>
<a class="bn bn-vendor" href="${L.site('/request-proposal-form')}" style="background-image:linear-gradient(90deg,rgba(78,84,200,.96) 0%,rgba(31,40,83,.92) 55%,rgba(18,26,58,.45) 100%),url('${bnImg(BN_HALL, 1400, 420)}')">
<span class="bn-col">
<span class="bn-date">${t.vendorTitle} · ${t.expoDates}</span>
<span class="bn-title" style="font-size:26px">${t.vendorHead}</span>
<span class="bn-sub">${t.vendorDesc}</span>
<span class="bn-hubs">${HUBS.map((h) => `<span class="bn-hub"><i style="background:${h.color}">${h.no}</i>${esc(h.n.replace(' Hub', ''))}</span>`).join('')}</span>
</span>
<span class="bn-cta">${t.proposal} →</span>
</a></div>`;
  }

  // Rectangle banners for side columns: photo on top, text below.
  rect(d, L, vendor) {
    const t = T();
    if (vendor) {
      return `<div style="margin-top:24px"><span class="rv-adlabel">${t.ad}</span>
<a class="bn bn-rect" href="${L.site('/request-proposal-form')}" style="background:${BN_NAVY2}">
<span class="bn-photo" style="background-image:linear-gradient(180deg,rgba(18,26,58,0) 40%,rgba(31,40,83,.9) 100%),url('${bnImg(BN_HALL, 640, 360)}')"><span class="bn-pill">${t.vendorTitle}</span></span>
<span class="bn-body">
<span class="bn-title" style="font-size:20px">${t.vendorHead}</span>
<span class="bn-sub">${t.vendorDesc}</span>
<span class="bn-cta">${t.proposal} →</span>
</span></a></div>`;
    }
    return `<div style="margin-top:24px"><span class="rv-adlabel">${t.ad}</span>
<a class="tk tk-vert" href="${L.site('/')}">
<span class="tk-stub" style="background-image:url('${bnMonas(640, 360)}')"><span class="tk-tag">Jakarta · 2027</span></span>
<span class="tk-body">
<span class="tk-label">${t.expoTagline}</span>
<span class="tk-title" style="font-size:22px">VRI B2B TECH ASIA 2027</span>
${this.ticketRows()}
<span class="tk-cta" style="align-self:flex-start;margin-top:4px">${t.cta} →</span>
</span></a></div>`;
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
    // Front page like a news site: one lead (moderate size), two secondary stories with images,
    // a latest list, then a row of analysis cards. Nothing shown twice above the hub columns.
    const seconds = arts.slice(1, 3);
    const latest = arts.slice(3, 9);
    const shown = new Set([lead, ...seconds, ...latest]);
    const analysis = arts.filter((a) => !shown.has(a) && (a.articleType === 'analisis' || a.articleType === 'penjelasan')).slice(0, 4);
    const pr = d.releases || [];
    const out = [];
    out.push(this.topbar(d, L));
    out.push(this.masthead(d, L));
    out.push(this.leader(d, L));
    out.push(`<main class="rv-wrap" style="padding-top:32px">`);

    if (lead) {
      out.push(`<section class="rv-front" aria-label="${t.top}">
<article class="rv-front-lead">
<a href="${L('/review/' + lead.slug)}">${this.heroImage(lead, L)}</a>
<div class="rv-kicker" style="display:flex;gap:12px;align-items:center;margin-top:16px"><a href="${L('/review?kategori=' + catSlug(lead.category))}" style="color:${RED}">${esc(catName(lead.category))}</a><span style="color:#9AA3AF" aria-hidden="true">/</span><span style="color:${NAVY}">${esc(typeName(lead.articleType))}</span></div>
<h1 style="margin:10px 0 0"><a class="rv-serif rv-lead-title" href="${L('/review/' + lead.slug)}" style="font-size:32px;line-height:1.22;font-weight:700;letter-spacing:-.3px">${esc(lead.title)}</a></h1>
<p class="rv-serif" style="margin:12px 0 0;font-size:17px;line-height:1.55;color:#333B47">${esc(lead.dek)}</p>
<div style="font-size:13px;color:${SUB};margin-top:10px">${t.byline} · ${esc(date(lead.publishAt))}${lead.readMin ? ' · ' + lead.readMin + ' ' + t.minRead : ''}</div>
</article>
<div class="rv-front-seconds">
${seconds.map((n) => `<a href="${L('/review/' + n.slug)}" class="rv-front-second">
${this.heroImage(n, L)}
<span class="rv-kicker" style="font-size:11px;color:${RED};margin-top:10px">${esc(catName(n.category))}</span>
<span class="rv-serif" style="font-size:19px;line-height:1.35;font-weight:700;margin-top:4px">${esc(n.title)}</span>
<span style="font-size:13px;color:${SUB};margin-top:6px">${esc(date(n.publishAt))}</span></a>`).join('')}
</div>
<aside class="rv-front-latest" aria-label="${t.latest}">
<h2 class="rv-kicker" style="margin:0 0 4px;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">${t.latest}</h2>
${latest.map((n) => `<a href="${L('/review/' + n.slug)}" style="display:flex;flex-direction:column;gap:4px;padding:12px 0;border-bottom:1px solid ${LINE}">
<span style="display:flex;gap:10px;align-items:baseline"><span style="font-size:12px;font-weight:600;color:${SUB};white-space:nowrap">${esc(shortDate(n.publishAt))}</span><span class="rv-kicker" style="font-size:11px;color:${RED}">${esc(catName(n.category))}</span></span>
<span class="rv-serif" style="font-size:16px;line-height:1.4;font-weight:600">${esc(n.title)}</span></a>`).join('')}
</aside>
</section>`);
    }

    if (analysis.length) {
      out.push(`<section style="margin-top:56px" aria-labelledby="rv-dbb">
<div class="rv-sechead"><h2 id="rv-dbb" class="rv-serif" style="margin:0;font-size:28px;font-weight:700;color:${NAVY}">${t.behind}</h2>
<span style="font-size:14px;color:${MUTED}">${t.behindSub}</span></div>
<div class="rv-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:24px">
${analysis.map((a) => `<a href="${L('/review/' + a.slug)}" style="display:flex;flex-direction:column;gap:10px">
${this.heroImage(a, L)}
<span class="rv-kicker" style="font-size:11px;color:${RED};margin-top:4px">${esc(catName(a.category))}</span>
<span class="rv-serif" style="font-size:19px;line-height:1.3;font-weight:700">${esc(a.title)}</span>
<span style="font-size:14px;line-height:1.55;color:${MUTED}">${esc(a.dek)}</span>
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
<span style="font-size:14px;color:${MUTED};margin:6px 0 10px">${esc(ja() ? h.ja : (en() ? h.en : h.id))} · ${t.forWho}: ${esc(h.who)}</span>
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
    return `<a href="${L.site('/siaran-pers/' + r.slug)}" style="display:flex;flex-direction:column;gap:10px">
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
<div class="rv-sechead" style="border-top:none;padding-top:0"><h1 class="rv-serif rv-list-title" style="margin:0;font-size:40px;font-weight:700;color:${NAVY};display:flex;gap:14px;align-items:center">${lh && lh.s === d.active ? this.hubBadge(lh, 40) : ''}${esc(d.heading || '')}</h1>
${d.intro ? `<span style="font-size:14px;color:${MUTED}">${esc(d.intro)}</span>` : ''}</div>`);
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
${rel.map((r) => `<a href="${L('/review/' + r.slug)}" class="rv-rel" style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:1px solid ${LINE}">
${r.heroImage ? `<img src="${esc(r.heroImage)}" alt="" loading="lazy" style="flex:0 0 160px;width:160px;aspect-ratio:16/9;object-fit:cover;background:${NAVY}">` : ''}
<span style="display:flex;flex-direction:column;gap:4px"><span class="rv-kicker" style="font-size:11px;color:${RED}">${esc(catName(r.category || ''))}</span>
<span class="rv-serif rv-rel-title" style="font-size:18px;line-height:1.35;font-weight:600">${esc(r.title)}</span></span></a>`).join('')}</section>` : ''}
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
<a href="${L.site('/')}" class="rv-btn" style="background:#fff;color:${NAVY}">${t.register}</a>
</section>`);
    return out.join('');
  }

  // Big ticket above the footer (design C): details + exhibitors.
  expoBand(d, L, standalone) {
    const t = T();
    return `<div class="rv-wrap" style="margin-top:${standalone ? 32 : 64}px">
<section class="tk tk-band" aria-label="VRI B2B Tech Asia 2027">
<a class="tk-stub" href="${L.site('/')}" style="background-image:url('${bnMonas(900, 600)}')"><span class="tk-tag">Jakarta · 2027</span></a>
<span class="tk-body">
<span class="bn-col" style="gap:10px;flex:1 1 380px">
${this.logoChip()}
<span class="tk-label">${t.expoTagline}</span>
<span class="tk-title" style="font-size:34px">VRI B2B TECH ASIA 2027</span>
${this.ticketRows()}
<span style="font-size:15px;line-height:1.55;color:#4A5361;max-width:520px">${t.expoDesc}</span>
</span>
<span style="display:flex;flex-direction:column;gap:10px">
<a href="${L.site('/')}" class="tk-cta">${t.cta} →</a>
<a href="${L.site(d.exhibitorPath || '/copy-of-agenda-2027')}" class="tk-cta tk-cta-ghost">${t.exhibitors}</a>
</span>
</span></section></div>`;
  }

  // ---------- Exhibition calendar (/review/expo) ----------
  expoPlace(e) { return [e.venue, e.city].filter(Boolean).join(ja() ? '、' : ', '); }

  // One exhibition in the list. inMonth: the group heading already names the month.
  expoRow(e, L, inMonth) {
    const x = X();
    const t = T();
    const href = L(EXPO_PATH + '/' + e.slug);
    const dated = e.dateStatus === 'confirmed' && !!e.start;
    const attrs = `class="xp-row${e.own ? ' xp-own' : ''}" data-hubs="${hubsOfZones(e.zones).map((h) => h.s).join(' ')}" data-status="${esc(e.dateStatus)}" data-city="${esc(e.city || '')}" data-q="${esc([e.name, e.organizer, e.venue, e.city].join(' ').toLowerCase())}"`;
    if (e.own) {
      return `<article ${attrs} style="margin:16px 0 4px;background:${NAVY};color:#fff;padding:32px 36px;display:flex;flex-wrap:wrap;gap:24px 40px;align-items:flex-end;justify-content:space-between">
<div style="flex:1 1 380px;min-width:0;display:flex;flex-direction:column;gap:10px">
<div style="display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center">${statusBadge(dated ? 'confirmed' : 'tba', true)}<span class="rv-kicker" style="color:#C9D6E8">${x.own}</span></div>
<a href="${href}" class="rv-serif" style="font-size:34px;font-weight:700;line-height:1.15;color:#fff">${esc(e.name)}</a>
<span style="font-size:17px;font-weight:600;color:#fff">${dated ? `${esc(dateRange(e.start, e.end))}${ja() ? `（${dowRange(e.start, e.end)}）` : ` (${dowRange(e.start, e.end)})`} · ` : ''}${esc(this.expoPlace(e))}</span>
<span style="font-size:16px;line-height:1.5;color:#E3EAF3">${x.ownDesc}</span>
<span style="font-size:13px;color:#C9D6E8">${x.organizer}${ja() ? '：' : ': '}${esc(e.organizer)} · <a href="${href}" style="color:#fff;text-decoration:underline;text-underline-offset:3px">${x.detail}</a></span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:12px">
<a href="${L.site('/register-now-2')}" style="display:inline-flex;align-items:center;min-height:48px;padding:0 24px;background:#fff;color:${NAVY};font-weight:700;font-size:15px;border-radius:2px">${t.register}</a>
<a href="${L.site('/request-proposal-form')}" style="display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border:1px solid #fff;color:#fff;font-weight:600;font-size:15px;border-radius:2px">${x.exhibit}</a>
</div></article>`;
    }
    const a = ymd(e.start);
    const badge = e.status === 'cancelled' ? 'cancelled' : (e.status === 'ongoing' ? 'ongoing' : (dated ? 'confirmed' : 'tba'));
    const dateCol = dated
      ? `<span class="rv-serif" style="font-size:28px;font-weight:700;line-height:1.1;color:${NAVY}">${dayRange(e.start, e.end)}</span><span style="font-size:13px;color:${SUB}">${inMonth ? dowRange(e.start, e.end) : monthTitle(a.y, a.m)}</span>`
      : `<span class="rv-serif" style="font-size:28px;font-weight:700;line-height:1.1;color:#9AA3AF" aria-hidden="true">—</span>`;
    const last = dated ? '' : lastLine(e);
    return `<article ${attrs} style="display:flex;flex-wrap:wrap;gap:12px 24px;padding:20px 0;border-bottom:1px solid ${LINE}">
<div class="xp-date" style="flex:0 0 112px;display:flex;flex-direction:column;gap:2px">${dateCol}</div>
<div style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:6px">
<a href="${href}" class="rv-serif" style="font-size:21px;line-height:1.25;font-weight:700">${esc(e.name)}</a>
<span style="font-size:14px;line-height:1.45;color:#333B47">${esc(this.expoPlace(e))}</span>
${last ? `<span style="font-size:14px;line-height:1.45;color:#333B47">${esc(last)}</span>` : ''}
<span style="font-size:13px;line-height:1.45;color:${SUB}">${esc(e.organizer || '')}</span>
<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${(e.zones || []).map((z) => `<span style="font-size:12px;font-weight:600;color:${NAVY};border:1px solid #C4CAD3;padding:3px 8px">${esc(z)}</span>`).join('')}</div>
</div>
<div style="flex:0 0 auto;display:flex;flex-direction:column;gap:10px;align-items:flex-start">${statusBadge(badge)}<a href="${href}" style="font-size:14px;font-weight:600;color:${NAVY}">${x.detail}</a></div>
</article>`;
  }

  expoGroup(title, items, L, inMonth) {
    return `<div class="xp-group" style="margin-top:32px">
<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;border-top:3px solid ${NAVY};padding:12px 0 4px">
<h2 class="rv-serif" style="margin:0;font-size:26px;font-weight:700;color:${NAVY}">${esc(title)}</h2>
<span style="font-size:14px;color:${MUTED}">${X().count(items.length)}</span></div>
${items.map((e) => this.expoRow(e, L, inMonth)).join('')}</div>`;
  }

  expoList(d, L) {
    const x = X();
    const all = d.expos || [];
    const live = all.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
    const tba = all.filter((e) => e.status === 'tba');
    const past = all.filter((e) => e.status === 'past');
    const gone = all.filter((e) => e.status === 'cancelled');
    const months = [];
    live.forEach((e) => {
      const a = ymd(e.start);
      const key = a.y * 12 + a.m;
      let g = months.find((m) => m.key === key);
      if (!g) { g = { key, title: monthTitle(a.y, a.m), items: [] }; months.push(g); }
      g.items.push(e);
    });
    months.sort((p, q) => p.key - q.key);
    const cities = all.map((e) => e.city).filter((c, i, arr) => c && arr.indexOf(c) === i).sort();
    const label = `font-size:13px;font-weight:600;color:${MUTED}`;
    const nStatus = (s) => all.filter((e) => e.dateStatus === s).length;
    const out = [this.topbar(d, L), this.masthead(d, L), this.leader(d, L), `<main class="rv-wrap" style="padding-top:32px">`];
    out.push(`<div class="rv-kicker" style="font-size:12px;margin-bottom:8px;color:${RED}">${x.nav}</div>
<h1 class="rv-serif rv-list-title" style="margin:0;font-size:40px;line-height:1.15;font-weight:700;color:${NAVY}">${esc(d.heading || x.nav)}</h1>
${d.intro ? `<p class="rv-serif" style="margin:12px 0 0;font-size:19px;line-height:1.5;color:#333B47;max-width:820px">${esc(d.intro)}</p>` : ''}
<div style="display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:14px;font-size:14px;color:${MUTED}"><span><strong style="color:${INK}">${x.count(all.length - gone.length)}</strong></span><span>${x.dated(live.length)}</span>${d.verified ? `<span>${x.checked} ${esc(dateRange(d.verified, d.verified))}</span>` : ''}</div>`);
    if (!all.length) {
      out.push(`<p style="margin-top:28px;font-size:17px;color:${MUTED}">${x.empty}</p>`);
    } else {
      out.push(`<form class="xp-filter" role="search" style="display:flex;flex-direction:column;gap:14px;margin-top:24px;padding:20px 24px;background:${PANEL};border:1px solid ${LINE}">
<div style="display:flex;flex-wrap:wrap;gap:16px">
<div style="flex:2 1 320px;display:flex;flex-direction:column;gap:6px"><label for="xp-q" style="${label}">${x.search}</label><input id="xp-q" class="xp-input xp-q" type="search" placeholder="${esc(x.searchPh)}" autocomplete="off"></div>
${cities.length > 1 ? `<div style="flex:1 1 200px;display:flex;flex-direction:column;gap:6px"><label for="xp-city" style="${label}">${x.city}</label><select id="xp-city" class="xp-input xp-city"><option value="">${x.allCities}</option>${cities.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>` : ''}
</div>
<div style="display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center"><span style="${label};flex:0 0 96px">${x.hub}</span>
<div style="display:flex;flex-wrap:wrap;gap:8px"><button type="button" class="xp-hubbtn" data-hub="" aria-pressed="true">${x.all} (${all.length})</button>${HUBS.map((h) => `<button type="button" class="xp-hubbtn" data-hub="${h.s}" aria-pressed="false">${esc(h.n.replace(' Hub', ''))} (${all.filter((e) => hubsOfZones(e.zones).indexOf(h) >= 0).length})</button>`).join('')}</div></div>
<div style="display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center"><span style="${label};flex:0 0 96px">${x.dateStatus}</span>
<div style="display:flex;flex-wrap:wrap;gap:4px 20px">${['confirmed', 'tba'].map((s) => `<label style="display:inline-flex;align-items:center;gap:8px;min-height:44px;font-size:14px;cursor:pointer"><input type="checkbox" class="xp-st" value="${s}" checked style="width:18px;height:18px;accent-color:${NAVY}">${x[s]} (${nStatus(s)})</label>`).join('')}</div></div>
</form>`);
      out.push(`<div style="display:flex;flex-wrap:wrap;gap:40px;margin-top:12px">
<section style="flex:999 1 640px;min-width:0" aria-label="${x.listLabel}">
${months.map((m) => this.expoGroup(m.title, m.items, L, true)).join('')}
${tba.length ? this.expoGroup(x.tbaGroup, tba, L, false) : ''}
${past.length ? this.expoGroup(x.pastGroup, past, L, false) : ''}
${gone.length ? this.expoGroup(x.cancelledGroup, gone, L, false) : ''}
<p class="xp-none xp-hide" style="margin:28px 0 0;font-size:17px;color:${MUTED}">${x.none}</p>
<div style="margin-top:40px;padding:20px 24px;border:1px solid ${LINE};display:flex;flex-direction:column;gap:8px">
<h2 style="margin:0;font-size:15px;font-weight:700;color:${INK}">${x.howTitle}</h2>
<p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED}">${x.how}</p></div>
</section>
<aside style="flex:1 1 280px;min-width:0;display:flex;flex-direction:column;gap:32px;margin-top:32px">
<div style="display:flex;flex-direction:column;gap:14px">
<h2 class="rv-kicker" style="margin:0;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">${x.legendTitle}</h2>
<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">${statusBadge('confirmed')}<span style="font-size:14px;line-height:1.5;color:${MUTED}">${x.legendConfirmed}</span></div>
<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">${statusBadge('tba')}<span style="font-size:14px;line-height:1.5;color:${MUTED}">${x.legendTba}</span></div>
</div>
<div style="display:flex;flex-direction:column;gap:10px">
<h2 class="rv-kicker" style="margin:0;font-size:13px;color:${NAVY};padding-bottom:10px;border-bottom:3px solid ${NAVY}">${x.fixTitle}</h2>
<p style="margin:0;font-size:14px;line-height:1.55;color:${MUTED}">${x.fix}</p>
<a href="mailto:${CONTACT}?subject=${encodeURIComponent(x.reportSubject)}" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border:1px solid ${NAVY};color:${NAVY};font-size:14px;font-weight:600;border-radius:2px">${CONTACT}</a>
</div>
<div class="rv-hide-mobile">${this.rect(d, L, true)}</div>
</aside></div>`);
    }
    out.push(`</main>`);
    out.push(this.expoBand(d, L, false));
    out.push(this.footer(d, L));
    return out.join('');
  }

  // Filters of the calendar: search, city, hub, date status. Rows and groups are hidden with .xp-hide.
  bindExpo() {
    const form = this.querySelector('.xp-filter');
    if (!form) return;
    const rows = [...this.querySelectorAll('.xp-row')];
    const groups = [...this.querySelectorAll('.xp-group')];
    const none = this.querySelector('.xp-none');
    const q = form.querySelector('.xp-q');
    const city = form.querySelector('.xp-city');
    const boxes = [...form.querySelectorAll('.xp-st')];
    const btns = [...form.querySelectorAll('.xp-hubbtn')];
    let hub = '';
    const apply = () => {
      const text = (q.value || '').trim().toLowerCase();
      const c = city ? city.value : '';
      const st = boxes.filter((b) => b.checked).map((b) => b.value);
      let shown = 0;
      rows.forEach((r) => {
        const s = r.dataset.status;
        const ok = (!text || r.dataset.q.indexOf(text) >= 0) && (!hub || (' ' + r.dataset.hubs + ' ').indexOf(' ' + hub + ' ') >= 0)
          && (!c || r.dataset.city === c) && (st.indexOf(s) >= 0 || (s !== 'confirmed' && s !== 'tba'));
        r.classList.toggle('xp-hide', !ok);
        if (ok) shown++;
      });
      groups.forEach((g) => g.classList.toggle('xp-hide', !g.querySelector('.xp-row:not(.xp-hide)')));
      if (none) none.classList.toggle('xp-hide', shown > 0);
    };
    form.addEventListener('submit', (ev) => ev.preventDefault());
    q.addEventListener('input', apply);
    if (city) city.addEventListener('change', apply);
    boxes.forEach((b) => b.addEventListener('change', apply));
    btns.forEach((b) => b.addEventListener('click', () => {
      hub = b.dataset.hub;
      btns.forEach((o) => o.setAttribute('aria-pressed', o === b ? 'true' : 'false'));
      apply();
    }));
  }

  // Bottom of an exhibition page: official site / calendar / correction, other exhibitions, then the Expo band
  // (not on the VRI B2B Tech Asia page itself, which gets its own register / exhibit buttons).
  expoBottom(d, L) {
    const x = X();
    const t = T();
    const e = d.expo || {};
    const rel = d.related || [];
    const btn = 'display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 22px;font-size:15px;border-radius:2px;';
    const solid = `${btn}background:${NAVY};color:#fff;font-weight:700`;
    const ghost = `${btn}border:1px solid ${NAVY};color:${NAVY};font-weight:600`;
    let cal = '';
    const a = ymd(e.start);
    const b = ymd(e.end) || a;
    if (e.dateStatus === 'confirmed' && a) {
      const n = (y, m, dd) => new Date(Date.UTC(y, m, dd)).toISOString().slice(0, 10).replace(/-/g, '');
      cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.name || '')}&dates=${n(a.y, a.m, a.d)}/${n(b.y, b.m, b.d + 1)}&location=${encodeURIComponent(this.expoPlace(e))}&details=${encodeURIComponent(e.officialUrl || '')}`;
    }
    const actions = [];
    if (e.own) {
      actions.push(`<a href="${L.site('/register-now-2')}" style="${solid}">${t.register}</a>`);
      actions.push(`<a href="${L.site('/request-proposal-form')}" style="${ghost}">${x.exhibit}</a>`);
    } else if (e.officialUrl) {
      actions.push(`<a href="${esc(e.officialUrl)}" target="_blank" rel="noopener nofollow" style="${solid}">${x.official} ↗</a>`);
    }
    if (cal) actions.push(`<a href="${esc(cal)}" target="_blank" rel="noopener nofollow" style="${ghost}">${x.addCal}</a>`);
    actions.push(`<a href="mailto:${CONTACT}?subject=${encodeURIComponent(x.reportSubject + ': ' + (e.name || ''))}" style="${ghost}">${x.report}</a>`);
    const line = (r) => (r.dateStatus === 'confirmed' && r.start
      ? `${dateRange(r.start, r.end)} · ${this.expoPlace(r)}`
      : (lastLine(r) || this.expoPlace(r)));
    return `<div class="rv-wrap" style="margin-top:24px">
<div style="display:flex;flex-wrap:wrap;gap:12px">${actions.join('')}</div>
${rel.length ? `<section style="margin-top:40px;border-top:3px solid ${NAVY};padding-top:16px">
<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px"><h2 class="rv-kicker" style="margin:0;font-size:13px;color:${NAVY}">${d.sameZone ? x.sameZone : x.others}</h2>
<a href="${L(EXPO_PATH)}" style="font-size:14px;font-weight:600;color:${NAVY}">${x.allCal}</a></div>
${rel.map((r) => `<a href="${L(EXPO_PATH + '/' + r.slug)}" style="display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;padding:14px 0;border-bottom:1px solid ${LINE}">
${statusBadge(r.status === 'cancelled' ? 'cancelled' : (r.dateStatus === 'confirmed' ? 'confirmed' : 'tba'))}
<span style="display:flex;flex-direction:column;gap:4px;flex:1 1 300px;min-width:0"><span class="rv-serif rv-rel-title" style="font-size:18px;line-height:1.35;font-weight:600">${esc(r.name)}</span>
<span style="font-size:14px;color:${MUTED}">${esc(line(r))}</span></span></a>`).join('')}</section>`
    : `<p style="margin:24px 0 0"><a href="${L(EXPO_PATH)}" style="font-size:14px;font-weight:600;color:${NAVY}">${x.allCal}</a></p>`}
</div>${e.own ? '' : this.expoBand(d, L, true)}`;
  }

  footer(d, L) {
    const t = T();
    return `<footer style="margin-top:64px;border-top:1px solid ${LINE};background:${PANEL}">
<div class="rv-wrap" style="padding-top:36px;padding-bottom:36px;display:flex;flex-wrap:wrap;gap:32px;justify-content:space-between;font-size:14px;color:${MUTED}">
<div style="display:flex;flex-direction:column;gap:8px;flex:1 1 360px">
<span class="rv-logo" style="font-size:22px">VRI B2B Tech Asia <span>Review</span></span>
<span style="line-height:1.6">${t.about}</span>
<span>${this.langSwitch(d)}</span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:40px">
${HUBS.map((h) => `<div style="display:flex;flex-direction:column;gap:10px;max-width:220px"><a href="${L('/review?kategori=' + h.s)}" style="color:${INK}"><strong>${esc(h.n)}</strong></a>${h.zones.map(([n, s]) => `<a href="${L('/review?kategori=' + s)}" style="color:${MUTED}">${esc(n)}</a>`).join('')}</div>`).join('')}
<div style="display:flex;flex-direction:column;gap:10px"><strong style="color:${INK}">${t.pr}</strong><a href="${L('/review?kategori=siaran-pers')}" style="color:${MUTED}">${t.prAll.replace(' →', '')}</a><a href="${L(EXPO_PATH)}" style="color:${MUTED}">${X().nav}</a></div>
<div style="display:flex;flex-direction:column;gap:10px"><strong style="color:${INK}">${t.expo}</strong><a href="${L.site('/')}" style="color:${MUTED}">VRI B2B Tech Asia</a><a href="${L.site('/register-now-2')}" style="color:${MUTED}">${t.register}</a><a href="${L.site(d.exhibitorPath || '/copy-of-agenda-2027')}" style="color:${MUTED}">${t.exhibitor}</a><a href="${L.site('/request-proposal-form')}" style="color:${MUTED}">${t.proposal}</a></div>
</div></div></footer>`;
  }
}

if (!customElements.get('review-ui')) customElements.define('review-ui', ReviewUi);
