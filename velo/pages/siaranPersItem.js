// Page code: Siaran Pers (Item) — URL /siaran-pers/{slug}
// Press releases imported from VRITIMES. Canonical points to the VRITIMES original.
import wixSeoFrontend from 'wix-seo-frontend';
import { C, esc, fmtDate, p, a, masthead, expoBox, footer } from 'public/reviewUi.js';

// Keep only simple tags, drop attributes (except href), then add explicit colours.
function clean(html) {
  let h = String(html || '')
    .replace(/<(script|style|iframe|figure|table)[\s\S]*?<\/\1>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, `<a href="$1" target="_blank" rel="nofollow noopener"><span style="color:${C.accent}">$2</span></a>`)
    .replace(/<(\/?)(p|ul|ol|li|strong|b|em|i|br|h2|h3|h4)(\s[^>]*)?>/gi, '<$1$2>')
    .replace(/<(?!\/?(p|ul|ol|li|strong|b|em|i|br|h2|h3|h4|a|span)\b)[^>]*>/gi, '')
    .replace(/<h[24]>/gi, '<h3>').replace(/<\/h[24]>/gi, '</h3>')
    .replace(/<\/?(ul|ol)>/gi, '')
    .replace(/<li>/gi, '<p>•&nbsp;&nbsp;').replace(/<\/li>/gi, '</p>')
    .replace(/<p>\s*<\/p>/gi, '');
  return h
    .replace(/<p>/g, `<p style="font-size:18px; line-height:1.7"><span style="color:${C.ink}">`).replace(/<\/p>/g, '</span></p>')
    .replace(/<h3>/g, `<h3 style="font-size:21px; line-height:1.35"><span style="color:${C.head}">`).replace(/<\/h3>/g, '</span></h3>');
}

$w.onReady(function () {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;

  const parts = [masthead('siaran-pers')];
  parts.push(p(`<strong>${a('/review?kategori=siaran-pers', 'SIARAN PERS', C.red)}</strong>`, 13, C.red, 'letter-spacing:0.06em'));
  parts.push(`<h1 style="font-size:34px; line-height:1.25"><span style="color:${C.head}">${esc(item.title)}</span></h1>`);
  parts.push(p(`Siaran pers · ${esc(fmtDate(item.publishedDate))} · Didistribusikan melalui VRITIMES`, 14, C.muted));
  parts.push(clean(item.bodyHtml || `<p>${esc(item.excerpt)}</p>`));
  parts.push(p(`Konten ini adalah siaran pers dari perusahaan terkait dan didistribusikan melalui VRITIMES. Redaksi B2B Tech Asia Review tidak mengubah isinya. ${a(esc(item.sourceUrl), 'Baca versi asli di VRITIMES', C.accent, true)}`, 14, C.muted));
  parts.push(expoBox());
  parts.push(p(a('/review?kategori=siaran-pers', '← Semua siaran pers', C.accent), 16, C.accent));
  parts.push(footer());
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
