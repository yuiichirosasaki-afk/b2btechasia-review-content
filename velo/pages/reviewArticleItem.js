// Page code: Review Articles (Item) — URL /review/{slug}
// The whole article is rendered into one text element (#text747) so it is
// server-rendered and indexable.

import wixSeoFrontend from 'wix-seo-frontend';

const NAVY = '#0B2A4A';
const RED = '#B42318';
const GREY = '#5F6B7A';
const INK = '#14181F';
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const TYPE_LABEL = { analisis: 'Analisis · Di Balik Berita', berita: 'Berita', penjelasan: 'Penjelasan' };

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tanggal(d) {
  const x = new Date(d);
  return x.getDate() + ' ' + BULAN[x.getMonth()] + ' ' + x.getFullYear();
}

// The site theme's default text color is near-white, so every block from the
// CMS gets an explicit dark color and size.
function ink(html) {
  return String(html || '')
    .replace(/<p>/g, '<p style="font-size:18px; line-height:1.7"><span style="color:#1F2630">')
    .replace(/<\/p>/g, '</span></p>')
    .replace(/<li>/g, '<li style="font-size:17px; line-height:1.6"><span style="color:#1F2630">')
    .replace(/<\/li>/g, '</span></li>')
    .replace(/<h3>/g, '<h3 style="font-size:21px; line-height:1.35"><span style="color:#14181F">')
    .replace(/<\/h3>/g, '</span></h3>');
}

function heading(text) {
  return `<h2 style="font-size:26px; line-height:1.3"><span style="color:${NAVY}">${text}</span></h2>`;
}

$w.onReady(async function () {
  const item = $w('#dynamicDataset').getCurrentItem();
  if (!item) return;

  const parts = [];
  parts.push(`<p style="font-size:13px"><span style="color:${RED}"><strong>${esc(item.category).toUpperCase()}</strong></span><span style="color:${GREY}"> · ${TYPE_LABEL[item.articleType] || 'Berita'}</span></p>`);
  parts.push(`<h1 style="font-size:38px; line-height:1.15"><span style="color:${INK}">${esc(item.title)}</span></h1>`);
  parts.push(`<p style="font-size:20px; line-height:1.5"><span style="color:#333B47">${esc(item.dek)}</span></p>`);
  parts.push(`<p style="font-size:14px"><span style="color:${GREY}">Redaksi B2B Tech Asia Review · ${tanggal(item.publishAt)}</span></p>`);
  parts.push('<p><br></p>');

  if (item.dataFigure) {
    parts.push(`<p style="font-size:56px; line-height:1.1"><span style="color:${NAVY}"><strong>${esc(item.dataFigure)}</strong></span></p>`);
    parts.push(`<p style="font-size:16px"><span style="color:#333B47">${esc(item.dataLabel)}</span></p>`);
    parts.push(`<p style="font-size:12px"><span style="color:${GREY}">Sumber: ${esc(item.dataSource)}</span></p>`);
    parts.push('<p><br></p>');
  }

  parts.push(heading('Ringkasan Berita'));
  parts.push(`<p style="font-size:13px"><span style="color:${GREY}">Disusun dari laporan media. Kutipan langsung ditandai dan sumber dicantumkan.</span></p>`);
  parts.push(ink(item.summaryHtml));
  parts.push(heading(item.articleType === 'penjelasan' ? 'Penjelasan' : 'Di Balik Berita'));
  parts.push(ink(item.analysisHtml));
  parts.push(heading('Apa Artinya bagi Anda'));
  parts.push(ink(item.actionHtml));
  if (item.faqHtml) {
    parts.push(heading('Pertanyaan yang Sering Diajukan'));
    parts.push(ink(item.faqHtml));
  }
  parts.push(heading('Sumber'));
  parts.push(ink(item.sourcesHtml));
  parts.push(`<p style="font-size:13px"><span style="color:${GREY}">Kutipan digunakan secara terbatas dengan menyebut sumber. Hak cipta kutipan tetap milik media masing-masing. Analisis adalah pandangan redaksi B2B Tech Asia Review, yang diterbitkan oleh B2B Tech Asia Expo.</span></p>`);
  parts.push('<p><br></p>');
  parts.push(`<p style="font-size:18px"><span style="color:${NAVY}"><strong>B2B Tech Asia Expo 2027 · 14–15 Juli 2027 · The Ritz-Carlton Jakarta, Pacific Place</strong></span></p>`);
  parts.push(`<p style="font-size:16px"><span style="color:#1F2630">Temui penyedia SaaS, AI, dan keamanan siber yang dibahas di sini. </span><a href="https://www.b2btechasia.com/" target="_self"><span style="color:#0B2A4A"><u>Lihat informasi pameran</u></span></a></p>`);

  $w('#text747').html = parts.join('');

  const description = item.seoDescription || item.dek;
  await wixSeoFrontend.setTitle((item.seoTitle || item.title) + ' | B2B Tech Asia Review');
  await wixSeoFrontend.setMetaTags([
    { name: 'description', content: description },
    { property: 'og:title', content: item.seoTitle || item.title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' }
  ]);
  await wixSeoFrontend.setStructuredData([{
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description,
    datePublished: new Date(item.publishAt).toISOString(),
    dateModified: new Date(item._updatedDate || item.publishAt).toISOString(),
    inLanguage: 'id',
    articleSection: item.category,
    author: { '@type': 'Organization', name: 'Redaksi B2B Tech Asia Review' },
    publisher: { '@type': 'Organization', name: 'B2B Tech Asia Expo' }
  }]);
});
