// Page code: Siaran Pers (Item) — URL /siaran-pers/{slug}
// Layout: #customElement1 (<review-ui part="top">), #text747 (press release, server-rendered),
// #customElement2 (<review-ui part="bottom">). Canonical points to the VRITIMES original.
import wixData from 'wix-data';
import wixSeoFrontend from 'wix-seo-frontend';
import wixWindowFrontend from 'wix-window-frontend';

const NAVY = '#0B2A4A';
const INK = '#14181F';
const BODY = '#1F2630';
const SUB = '#5F6B7A';
const SERIF = "font-family:'Source Serif 4',Georgia,serif";
const SANS = "font-family:'IBM Plex Sans',system-ui,sans-serif";
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function date(d) {
  if (!d) return '';
  const x = new Date(new Date(d).getTime() + 7 * 3600 * 1000);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

// Keep only simple tags, drop attributes (except href), add explicit colours and fonts.
function clean(html) {
  const h = String(html || '')
    .replace(/<(script|style|iframe|figure|table)[\s\S]*?<\/\1>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, `<a href="$1" target="_blank" rel="nofollow noopener"><span style="color:${NAVY}"><u>$2</u></span></a>`)
    .replace(/<(\/?)(p|ul|ol|li|strong|b|em|i|br|h2|h3|h4)(\s[^>]*)?>/gi, '<$1$2>')
    .replace(/<(?!\/?(p|ul|ol|li|strong|b|em|i|br|h2|h3|h4|a|span|u)\b)[^>]*>/gi, '')
    .replace(/<h[24]>/gi, '<h3>').replace(/<\/h[24]>/gi, '</h3>')
    .replace(/<\/?(ul|ol)>/gi, '')
    .replace(/<li>/gi, '<p>•&nbsp;&nbsp;').replace(/<\/li>/gi, '</p>')
    .replace(/<p>\s*<\/p>/gi, '');
  return h
    .replace(/<p>/g, `<p style="font-size:19px; line-height:1.7"><span style="${SERIF}; color:${BODY}">`).replace(/<\/p>/g, '</span></p>')
    .replace(/<h3>/g, `<h3 style="font-size:24px; line-height:1.3"><span style="${SERIF}; color:${INK}"><strong>`).replace(/<\/h3>/g, '</strong></span></h3>');
}

$w.onReady(async function () {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;

  const lang = (wixWindowFrontend.multilingual && wixWindowFrontend.multilingual.currentLanguage) || 'id';
  const base = lang && lang !== 'en' ? '/' + lang : '';
  const chrome = { base, narrow: true, now: new Date().toISOString(), active: 'siaran-pers' };
  const top = $w('#customElement1');
  const bottom = $w('#customElement2');
  top.setAttribute('part', 'top');
  bottom.setAttribute('part', 'bottom');
  top.setAttribute('data', JSON.stringify(chrome));

  const more = await wixData.query('ReviewArticles').le('publishAt', new Date()).descending('publishAt').limit(3).find()
    .then((r) => r.items).catch(() => []);
  bottom.setAttribute('data', JSON.stringify(Object.assign({}, chrome, {
    relatedTitle: 'Analisis Terbaru dari Redaksi',
    related: more.map((r) => ({ slug: r.slug, title: r.title, category: r.category, heroImage: r.heroImage || '' })),
  })));

  const parts = [];
  parts.push(`<p style="font-size:13px"><span style="${SANS}; color:${SUB}"><a href="/review"><span style="color:${SUB}">Berita</span></a> &nbsp;›&nbsp; <a href="/review?kategori=siaran-pers"><span style="color:${SUB}">Siaran Pers</span></a></span></p>`);
  parts.push(`<p style="font-size:12px; letter-spacing:0.1em"><span style="${SANS}; color:#4A5361"><strong>SIARAN PERS</strong></span><span style="${SANS}; color:${SUB}"> &nbsp;·&nbsp; BUKAN KONTEN REDAKSI</span></p>`);
  parts.push(`<h1 style="font-size:40px; line-height:1.15"><span style="${SERIF}; color:${INK}"><strong>${esc(item.title)}</strong></span></h1>`);
  parts.push(`<p style="font-size:14px; line-height:1.6"><span style="${SANS}; color:#4A5361">${esc(date(item.publishedDate))} &nbsp;·&nbsp; Didistribusikan melalui VRITIMES</span></p>`);
  parts.push(`<p style="font-size:12px; line-height:1"><span>&nbsp;</span></p>`);
  parts.push(clean(item.bodyHtml || `<p>${esc(item.excerpt)}</p>`));
  parts.push(`<p style="font-size:12px; line-height:1"><span>&nbsp;</span></p>`);
  parts.push(`<p style="font-size:14px; line-height:1.6"><span style="${SANS}; color:${SUB}">Konten ini adalah siaran pers dari perusahaan terkait dan didistribusikan melalui VRITIMES. Redaksi B2B Tech Asia Review tidak mengubah isinya. </span><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener"><span style="${SANS}; color:${NAVY}"><u>Baca versi asli di VRITIMES</u></span></a></p>`);
  $w('#text747').html = parts.join('');

  const desc = String(item.excerpt || '').slice(0, 155);
  wixSeoFrontend.setTitle(`${item.title} | Siaran Pers | B2B Tech Asia Review`);
  wixSeoFrontend.setMetaTags([
    { name: 'description', content: desc },
    { property: 'og:title', content: item.title },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: 'article' },
  ].concat(item.imageUrl ? [{ property: 'og:image', content: item.imageUrl }] : []));
  if (item.sourceUrl) {
    wixSeoFrontend.setLinks([{ rel: 'canonical', href: item.sourceUrl }]);
  }
});
