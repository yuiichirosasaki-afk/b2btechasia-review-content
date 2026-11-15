// backend/reviewImport.js
// B2B Tech Asia Review: imports articles from the GitHub feed and press releases from VRITIMES.
// Runs from backend/jobs.config every hour.

import { fetch } from 'wix-fetch';
import wixData from 'wix-data';

// Set FEED_URL to the raw URL of feed.json in the GitHub repo.
const FEED_URL = 'https://raw.githubusercontent.com/yuiichirosasaki-afk/b2btechasia-review-content/main/feed.json';
const VRITIMES_RSS = 'https://rss.vritimes-api.com/api/v2/rss/505ecc5a-87d3-4e9c-a4ab-6c5a1dcf850b';
const OPTS = { suppressAuth: true };

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function findOne(collection, field, value) {
  const res = await wixData.query(collection).eq(field, value).limit(1).find(OPTS);
  return res.items[0] || null;
}

// ---------- Review articles (GitHub feed) ----------

export async function importReviewFeed() {
  const res = await fetch(FEED_URL + '?t=' + Date.now(), { method: 'get' });
  if (!res.ok) throw new Error('feed.json HTTP ' + res.status);
  const feed = await res.json();
  return upsertArticles(feed.articles || []);
}

// Manual import: run from the Velo code panel with an array of articles as the parameter.
export async function importArticlesManual(articles) {
  return upsertArticles(articles || []);
}

async function upsertArticles(list) {
  const now = new Date();
  let inserted = 0, updated = 0, waiting = 0;

  for (const a of list) {
    const publishAt = new Date(a.publishAt);
    // An article appears on the site only after its publish time has passed.
    if (publishAt > now) { waiting++; continue; }

    const sourcesHtml = '<ol>' + (a.sources || []).map((s) =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}</a> — ${esc(s.title)}${s.date ? ', ' + esc(s.date) : ''}</li>`
    ).join('') + '</ol>';

    const item = {
      title: a.title,
      slug: a.slug,
      category: a.category,
      articleType: a.articleType,
      dek: a.dek,
      summaryHtml: a.summaryHtml,
      analysisHtml: a.analysisHtml,
      actionHtml: a.actionHtml,
      faqHtml: a.faqHtml || '',
      dataFigure: a.dataFigure || '',
      dataLabel: a.dataLabel || '',
      dataSource: a.dataSource || '',
      audience: a.audience || [],
      tags: a.tags || [],
      sourcesHtml,
      sourcesJson: JSON.stringify(a.sources || []),
      heroImage: a.heroImage || '',
      chartJson: a.chart ? JSON.stringify(a.chart) : '',
      enJson: a.en ? JSON.stringify(a.en) : '',
      seoTitle: a.seoTitle,
      seoDescription: a.seoDescription,
      publishAt,
      language: a.language || 'id'
    };

    const existing = await findOne('ReviewArticles', 'slug', a.slug);
    if (existing) {
      await wixData.update('ReviewArticles', { ...existing, ...item }, OPTS);
      updated++;
    } else {
      await wixData.insert('ReviewArticles', item, OPTS);
      inserted++;
    }
  }
  return { inserted, updated, waiting };
}

// ---------- Siaran Pers (VRITIMES RSS) ----------

function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>'));
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
}

function attr(xml, name, attribute) {
  const m = xml.match(new RegExp('<' + name + '[^>]*\\s' + attribute + '="([^"]*)"'));
  return m ? m[1] : '';
}

function decode(s) {
  return String(s || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

function plain(html) {
  return decode(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '')
    .trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80).replace(/-$/, '');
}

export async function importVritimes() {
  const res = await fetch(VRITIMES_RSS, { method: 'get' });
  if (!res.ok) throw new Error('VRITIMES RSS HTTP ' + res.status);
  const xml = await res.text();
  const items = xml.split('<item>').slice(1).map((s) => s.split('</item>')[0]);
  let inserted = 0, skipped = 0;

  for (const it of items) {
    const guid = tag(it, 'guid') || tag(it, 'link');
    if (!guid) { skipped++; continue; }
    if (await findOne('SiaranPers', 'guid', guid)) { skipped++; continue; }

    const title = plain(tag(it, 'title'));
    const bodyHtml = decode(tag(it, 'content:encoded')) || decode(tag(it, 'description'));
    const text = plain(bodyHtml);
    await wixData.insert('SiaranPers', {
      title,
      slug: slugify(title) + '-' + guid.replace(/[^a-z0-9]/gi, '').slice(-8).toLowerCase(),
      excerpt: text.length > 220 ? text.slice(0, 217) + '…' : text,
      bodyHtml,
      imageUrl: attr(it, 'enclosure', 'url'),
      sourceUrl: tag(it, 'link'),
      guid,
      publishedDate: new Date(tag(it, 'pubDate') || Date.now())
    }, OPTS);
    inserted++;
  }
  return { inserted, skipped };
}
