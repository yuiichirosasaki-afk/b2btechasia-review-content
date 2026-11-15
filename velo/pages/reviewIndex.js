// Page code: Review Articles (List) — URL /review (Indonesian: /id/review)
// Builds the front page of B2B Tech Asia Review into one text element (#title).
import wixData from 'wix-data';
import wixSeoFrontend from 'wix-seo-frontend';

const INK = '#1F2630';
const HEAD = '#14181F';
const MUTED = '#5B6573';
const ACCENT = '#0B4F8A';
const CATEGORIES = ['Cybersecurity', 'AI & Data', 'Cloud & Data Center', 'Enterprise Adoption', 'Regulasi', 'Deals'];
const TYPE_LABEL = { analisis: 'Analisis', berita: 'Berita', penjelasan: 'Penjelasan' };

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const x = new Date(d);
  return `${x.getDate()} ${months[x.getMonth()]} ${x.getFullYear()}`;
}

function p(text, size, color, extra) {
  return `<p style="font-size:${size}px; line-height:1.55${extra ? '; ' + extra : ''}"><span style="color:${color}">${text}</span></p>`;
}

function link(href, text, color) {
  return `<a href="${href}"><span style="color:${color || HEAD}">${text}</span></a>`;
}

function articleBlock(a, lead) {
  const meta = `${esc(a.category).toUpperCase()} · ${esc(TYPE_LABEL[a.articleType] || 'Analisis')} · ${esc(fmtDate(a.publishAt))}`;
  const out = [];
  out.push(p(meta, 12, ACCENT, 'letter-spacing:0.08em'));
  if (lead) {
    out.push(`<h2 style="font-size:32px; line-height:1.25">${link('/review/' + a.slug, esc(a.title))}</h2>`);
    if (a.dataFigure) out.push(p(`<strong>${esc(a.dataFigure)}</strong> — ${esc(a.dataLabel || '')}`, 18, HEAD));
    out.push(p(esc(a.dek), 18, INK));
  } else {
    out.push(`<h3 style="font-size:22px; line-height:1.3">${link('/review/' + a.slug, esc(a.title))}</h3>`);
    out.push(p(esc(a.dek), 16, INK));
  }
  out.push(p('&nbsp;', 8, INK));
  return out.join('');
}

$w.onReady(async function () {
  const now = new Date();
  const [arts, pr] = await Promise.all([
    wixData.query('ReviewArticles').le('publishAt', now).descending('publishAt').limit(60).find(),
    wixData.query('SiaranPers').descending('publishedDate').limit(15).find(),
  ]);
  const list = arts.items;
  const html = [];

  html.push(p('B2B TECH ASIA REVIEW', 13, ACCENT, 'letter-spacing:0.12em'));
  html.push(`<h1 style="font-size:40px; line-height:1.2"><span style="color:${HEAD}">Berita dan analisis teknologi B2B untuk pengambil keputusan di Indonesia</span></h1>`);
  html.push(p('Keamanan siber, AI, cloud, adopsi teknologi di perusahaan besar, regulasi, dan transaksi. Setiap artikel merangkum berita dari sumber terpercaya dan menjelaskan apa artinya bagi bisnis Anda.', 17, MUTED));
  html.push(p(CATEGORIES.map((c) => esc(c)).join(' · '), 13, ACCENT, 'letter-spacing:0.04em'));
  html.push(p('&nbsp;', 8, INK));

  if (list.length) {
    html.push(articleBlock(list[0], true));
    html.push(`<h2 style="font-size:24px"><span style="color:${HEAD}">Terbaru</span></h2>`);
    list.slice(1, 30).forEach((a) => html.push(articleBlock(a, false)));
  } else {
    html.push(p('Artikel pertama akan segera terbit.', 17, INK));
  }

  if (pr.items.length) {
    html.push(`<h2 style="font-size:24px"><span style="color:${HEAD}">Siaran Pers</span></h2>`);
    html.push(p('Siaran pers dari perusahaan, didistribusikan melalui VRITIMES.', 14, MUTED));
    const lis = pr.items.map((x) => `<li style="font-size:16px; line-height:1.5"><span style="color:${INK}">${link('/siaran-pers/' + x.slug, esc(x.title), HEAD)} <span style="color:${MUTED}">· ${esc(fmtDate(x.publishedDate))}</span></span></li>`);
    html.push(`<ul>${lis.join('')}</ul>`);
  }

  html.push(p('&nbsp;', 8, INK));
  html.push(`<h2 style="font-size:22px"><span style="color:${HEAD}">B2B Tech Asia Expo 2027</span></h2>`);
  html.push(p('14–15 Juli 2027 · The Ritz-Carlton Jakarta, Pacific Place. Pameran SaaS dan AI untuk perusahaan di Asia Tenggara.', 16, INK));
  html.push(p(`<a href="https://www.b2btechasia.com/"><span style="color:${ACCENT}">Lihat informasi pameran →</span></a>`, 16, ACCENT));

  $w('#title').html = html.join('');

  const desc = 'Berita dan analisis teknologi B2B Indonesia: keamanan siber, AI, cloud, adopsi teknologi perusahaan, regulasi, dan transaksi.';
  wixSeoFrontend.setTitle('B2B Tech Asia Review — Berita & Analisis Teknologi B2B Indonesia');
  wixSeoFrontend.setMetaTags([
    { name: 'description', content: desc },
    { property: 'og:title', content: 'B2B Tech Asia Review' },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: 'website' },
  ]);
});
