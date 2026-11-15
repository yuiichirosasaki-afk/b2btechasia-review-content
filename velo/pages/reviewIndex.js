// Page code: Review Articles (List) — URL /review (Indonesian: /id/review)
// Front page and category pages (?kategori=<slug>) of B2B Tech Asia Review,
// rendered into one text element (#title). Layout helpers: public/reviewUi.js.
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import wixSeoFrontend from 'wix-seo-frontend';
import { C, CATEGORIES, TYPE_LABEL, esc, fmtDate, p, a, rule, masthead, expoBox, footer, categorySlug } from 'public/reviewUi.js';

const SERIF = "font-family:'playfair display',georgia,serif";

function meta(x) {
  return p(`<strong>${a('/review?kategori=' + categorySlug(x.category), esc(x.category).toUpperCase(), C.red)}</strong><span style="color:${C.muted}"> · ${esc(TYPE_LABEL[x.articleType] || 'Analisis')} · ${esc(fmtDate(x.publishAt))}</span>`, 12, C.red, 'letter-spacing:0.06em');
}

function lead(x) {
  const out = [meta(x), `<h2 style="font-size:34px; line-height:1.2">${a('/review/' + x.slug, esc(x.title), C.head)}</h2>`];
  if (x.dataFigure) {
    out.push(`<p style="font-size:44px; line-height:1.1; ${SERIF}"><span style="color:${C.navy}">${esc(x.dataFigure)}</span></p>`);
    out.push(p(esc(x.dataLabel || ''), 15, C.muted));
  }
  out.push(p(esc(x.dek), 18, C.ink));
  out.push(p(a('/review/' + x.slug, 'Baca analisis lengkap →', C.accent), 15, C.accent));
  return out.join('');
}

function item(x, withDek) {
  const out = [meta(x), `<h3 style="font-size:22px; line-height:1.3">${a('/review/' + x.slug, esc(x.title), C.head)}</h3>`];
  if (withDek) out.push(p(esc(x.dek), 16, C.ink));
  out.push(p('&nbsp;', 6, C.ink));
  return out.join('');
}

function sectionTitle(text, href) {
  return [
    p('&nbsp;', 6, C.ink),
    `<h2 style="font-size:24px; line-height:1.3">${href ? a(href, esc(text) + ' →', C.head) : `<span style="color:${C.head}">${esc(text)}</span>`}</h2>`,
    rule(),
  ].join('');
}

function prList(items) {
  return items.map((x) => [
    `<h3 style="font-size:18px; line-height:1.35">${a('/siaran-pers/' + x.slug, esc(x.title), C.head)}</h3>`,
    p(`${esc(fmtDate(x.publishedDate))} · VRITIMES`, 13, C.muted),
  ].join('')).join('');
}

$w.onReady(async function () {
  const kategori = String(wixLocationFrontend.query.kategori || '');
  const cat = CATEGORIES.find((c) => c.slug === kategori);
  const isPR = kategori === 'siaran-pers';
  const now = new Date();
  const html = [masthead(cat ? cat.slug : (isPR ? 'siaran-pers' : ''), !cat && !isPR)];
  let title = 'B2B Tech Asia Review — Berita & Analisis Teknologi B2B Indonesia';
  let desc = 'Berita dan analisis teknologi B2B Indonesia: keamanan siber, AI, cloud, adopsi teknologi perusahaan, regulasi, dan transaksi.';

  if (isPR) {
    const pr = await wixData.query('SiaranPers').descending('publishedDate').limit(50).find();
    html.push(`<h1 style="font-size:36px"><span style="color:${C.head}">Siaran Pers</span></h1>`);
    html.push(p('Siaran pers dari perusahaan, didistribusikan melalui VRITIMES. Isi siaran pers adalah tanggung jawab perusahaan penerbit.', 16, C.muted));
    html.push(rule());
    html.push(prList(pr.items));
    title = 'Siaran Pers Teknologi & Bisnis | B2B Tech Asia Review';
    desc = 'Siaran pers terbaru dari perusahaan teknologi dan bisnis di Indonesia, didistribusikan melalui VRITIMES.';
  } else if (cat) {
    const res = await wixData.query('ReviewArticles').eq('category', cat.name).le('publishAt', now).descending('publishAt').limit(50).find();
    html.push(`<h1 style="font-size:36px"><span style="color:${C.head}">${esc(cat.name)}</span></h1>`);
    html.push(rule());
    if (res.items.length) {
      html.push(lead(res.items[0]));
      html.push(rule());
      res.items.slice(1).forEach((x) => html.push(item(x, true)));
    } else {
      html.push(p('Belum ada artikel di kategori ini.', 17, C.ink));
    }
    title = `${cat.name} — Berita & Analisis | B2B Tech Asia Review`;
    desc = `Berita dan analisis ${cat.name} untuk perusahaan di Indonesia dari B2B Tech Asia Review.`;
  } else {
    const [arts, pr] = await Promise.all([
      wixData.query('ReviewArticles').le('publishAt', now).descending('publishAt').limit(100).find(),
      wixData.query('SiaranPers').descending('publishedDate').limit(8).find(),
    ]);
    const list = arts.items;
    if (list.length) {
      html.push(lead(list[0]));
      const shown = new Set([list[0].slug]);
      const latest = list.slice(1, 5);
      if (latest.length) {
        html.push(sectionTitle('Terbaru'));
        latest.forEach((x) => { shown.add(x.slug); html.push(item(x, true)); });
      }
      CATEGORIES.forEach((c) => {
        const inCat = list.filter((x) => x.category === c.name && !shown.has(x.slug)).slice(0, 3);
        if (!inCat.length) return;
        html.push(sectionTitle(c.name, '/review?kategori=' + c.slug));
        inCat.forEach((x) => html.push(item(x, false)));
      });
    } else {
      html.push(p('Artikel pertama akan segera terbit.', 17, C.ink));
    }
    if (pr.items.length) {
      html.push(sectionTitle('Siaran Pers', '/review?kategori=siaran-pers'));
      html.push(prList(pr.items));
    }
  }

  html.push(expoBox());
  html.push(footer());
  $w('#title').html = html.join('');

  wixSeoFrontend.setTitle(title);
  wixSeoFrontend.setMetaTags([
    { name: 'description', content: desc },
    { property: 'og:title', content: title },
    { property: 'og:description', content: desc },
    { property: 'og:type', content: 'website' },
  ]);
});
