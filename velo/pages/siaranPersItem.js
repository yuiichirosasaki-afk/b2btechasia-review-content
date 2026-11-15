// Page code: Siaran Pers (Item) — URL /siaran-pers/{slug}
// Press releases imported from VRITIMES. Canonical points to the VRITIMES original.
import wixSeoFrontend from 'wix-seo-frontend';

const INK = '#1F2630';
const MUTED = '#5B6573';
const ACCENT = '#0B4F8A';

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Keep only simple tags, drop attributes (except href), then add explicit colours (theme text is near-white).
function clean(html) {
  let h = String(html || '')
    .replace(/<(script|style|iframe|figure|table)[\s\S]*?<\/\1>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>/gi, '<a href="$1" target="_blank" rel="nofollow noopener">')
    .replace(/<(\/?)(p|ul|ol|li|strong|b|em|i|br|h2|h3|h4)(\s[^>]*)?>/gi, '<$1$2>')
    .replace(/<(?!\/?(p|ul|ol|li|strong|b|em|i|br|h2|h3|h4|a)\b)[^>]*>/gi, '')
    .replace(/<h[24]>/gi, '<h3>').replace(/<\/h[24]>/gi, '</h3>')
    .replace(/<p>\s*<\/p>/gi, '');
  return h
    .replace(/<p>/g, `<p style="font-size:18px; line-height:1.7"><span style="color:${INK}">`).replace(/<\/p>/g, '</span></p>')
    .replace(/<li>/g, `<li style="font-size:17px; line-height:1.6"><span style="color:${INK}">`).replace(/<\/li>/g, '</span></li>')
    .replace(/<h3>/g, `<h3 style="font-size:21px; line-height:1.35"><span style="color:#14181F">`).replace(/<\/h3>/g, '</span></h3>');
}

function fmtDate(d) {
  if (!d) return '';
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const x = new Date(d);
  return `${x.getDate()} ${months[x.getMonth()]} ${x.getFullYear()}`;
}

$w.onReady(function () {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;

  const parts = [];
  parts.push(`<p style="font-size:13px; letter-spacing:0.08em"><span style="color:${ACCENT}"><a href="/id/review">B2B TECH ASIA REVIEW</a> · SIARAN PERS</span></p>`);
  parts.push(`<h1 style="font-size:34px; line-height:1.25"><span style="color:#14181F">${esc(item.title)}</span></h1>`);
  parts.push(`<p style="font-size:14px"><span style="color:${MUTED}">Siaran pers · ${esc(fmtDate(item.publishedDate))} · Sumber: VRITIMES</span></p>`);
  parts.push(clean(item.bodyHtml || `<p>${esc(item.excerpt)}</p>`));
  parts.push(`<p style="font-size:14px"><span style="color:${MUTED}">Konten ini adalah siaran pers dari perusahaan terkait dan didistribusikan melalui VRITIMES. Redaksi B2B Tech Asia Review tidak mengubah isinya. </span><span style="color:${ACCENT}"><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">Baca versi asli di VRITIMES</a></span></p>`);
  parts.push(`<p style="font-size:16px"><span style="color:${ACCENT}"><a href="/id/review">← Kembali ke B2B Tech Asia Review</a></span></p>`);
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
