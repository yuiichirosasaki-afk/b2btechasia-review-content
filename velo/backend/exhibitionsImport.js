// backend/exhibitionsImport.js
// VRI B2B Tech Asia Review: imports the Indonesian exhibition database (exhibitions.json) into ReviewExhibitions.
// Runs from backend/jobs.config every hour. Entries are upserted by slug and never deleted
// (past editions stay online as the archive).

import { fetch } from 'wix-fetch';
import wixData from 'wix-data';

const EXHIBITIONS_URL = 'https://raw.githubusercontent.com/yuiichirosasaki-afk/b2btechasia-review-content/main/exhibitions.json';
const OPTS = { suppressAuth: true };
const COLLECTION = 'ReviewExhibitions';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toDate(s) {
  return s ? new Date(s + 'T00:00:00+07:00') : null;
}

export async function importExhibitions() {
  const res = await fetch(EXHIBITIONS_URL + '?t=' + Date.now(), { method: 'get' });
  if (!res.ok) throw new Error('exhibitions.json HTTP ' + res.status);
  const feed = await res.json();
  return upsertExhibitions(feed.exhibitions || []);
}

// Manual import: run from the Velo code panel with an array of entries as the parameter.
export async function importExhibitionsManual(list) {
  return upsertExhibitions(list || []);
}

async function upsertExhibitions(list) {
  let inserted = 0, updated = 0;
  for (const e of list) {
    const sourcesHtml = '<ol>' + (e.sources || []).map((s) =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}</a> — ${esc(s.title)}${s.date ? ', ' + esc(s.date) : ''}</li>`
    ).join('') + '</ol>';
    const id = e.id || {};

    const item = {
      title: e.name,
      slug: e.slug,
      seriesId: e.seriesId,
      isOwnEvent: !!e.isOwnEvent,
      city: e.city,
      venue: e.venue || '',
      organizer: e.organizer,
      startDate: toDate(e.startDate),
      endDate: toDate(e.endDate),
      dateStatus: e.dateStatus,
      status: e.status,
      zones: e.zones || [],
      relevance: e.relevance,
      admission: e.admission,
      exhibitorsJson: e.exhibitors ? JSON.stringify(e.exhibitors) : '',
      visitorsJson: e.visitors ? JSON.stringify(e.visitors) : '',
      lastEditionJson: e.lastEdition ? JSON.stringify(e.lastEdition) : '',
      officialUrl: e.officialUrl,
      sourcesHtml,
      sourcesJson: JSON.stringify(e.sources || []),
      verifiedAt: toDate(e.verifiedAt),
      summaryHtml: id.summaryHtml || '',
      faqHtml: id.faqHtml || '',
      seoTitle: id.seoTitle || e.name,
      seoDescription: id.seoDescription || '',
      enJson: e.en ? JSON.stringify(e.en) : '',
      jaJson: e.ja ? JSON.stringify(e.ja) : ''
    };

    const found = await wixData.query(COLLECTION).eq('slug', e.slug).limit(1).find(OPTS);
    if (found.items[0]) {
      await wixData.update(COLLECTION, { ...found.items[0], ...item }, OPTS);
      updated++;
    } else {
      await wixData.insert(COLLECTION, item, OPTS);
      inserted++;
    }
  }
  return { inserted, updated };
}
