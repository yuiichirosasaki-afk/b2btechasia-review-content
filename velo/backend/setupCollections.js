// backend/setupCollections.js
// Run once from the Velo code panel to create the two CMS collections.

import { collections } from 'wix-data.v2';
import { elevate } from 'wix-auth';

const createCollection = elevate(collections.createDataCollection);
const permissions = { read: 'ANYONE', insert: 'ADMIN', update: 'ADMIN', remove: 'ADMIN' };

const text = (key, displayName) => ({ key, displayName, type: 'TEXT' });
const rich = (key, displayName) => ({ key, displayName, type: 'RICH_TEXT' });

export async function setupCollections() {
  const results = [];

  results.push(await createCollection({
    _id: 'ReviewArticles',
    displayName: 'Review Articles',
    permissions,
    fields: [
      text('title', 'Title'),
      text('slug', 'Slug'),
      text('category', 'Category'),
      text('articleType', 'Article type'),
      text('dek', 'Lead'),
      rich('summaryHtml', 'Ringkasan Berita'),
      rich('analysisHtml', 'Di Balik Berita'),
      rich('actionHtml', 'Apa Artinya bagi Anda'),
      rich('faqHtml', 'FAQ'),
      text('dataFigure', 'Data figure'),
      text('dataLabel', 'Data label'),
      text('dataSource', 'Data source'),
      { key: 'audience', displayName: 'Ditulis untuk', type: 'ARRAY_STRING' },
      { key: 'tags', displayName: 'Tags', type: 'ARRAY_STRING' },
      rich('sourcesHtml', 'Sumber'),
      text('seoTitle', 'SEO title'),
      text('seoDescription', 'SEO description'),
      { key: 'publishAt', displayName: 'Publish at', type: 'DATETIME' },
      text('language', 'Language')
    ]
  }).then(() => 'ReviewArticles created').catch((e) => 'ReviewArticles: ' + e.message));

  results.push(await createCollection({
    _id: 'SiaranPers',
    displayName: 'Siaran Pers',
    permissions,
    fields: [
      text('title', 'Title'),
      text('slug', 'Slug'),
      text('excerpt', 'Excerpt'),
      rich('bodyHtml', 'Body'),
      { key: 'imageUrl', displayName: 'Image URL', type: 'URL' },
      { key: 'sourceUrl', displayName: 'VRITIMES URL (canonical)', type: 'URL' },
      text('guid', 'GUID'),
      { key: 'publishedDate', displayName: 'Published', type: 'DATETIME' }
    ]
  }).then(() => 'SiaranPers created').catch((e) => 'SiaranPers: ' + e.message));

  return results;
}

// Run once from the Velo code panel to create the exhibition database collection (EXHIBITIONS.md).
export async function setupExhibitionsCollection() {
  const date = (key, displayName) => ({ key, displayName, type: 'DATETIME' });
  return createCollection({
    _id: 'ReviewExhibitions',
    displayName: 'Review Exhibitions',
    permissions,
    fields: [
      text('title', 'Name'),
      text('slug', 'Slug'),
      text('seriesId', 'Series'),
      { key: 'isOwnEvent', displayName: 'VRI B2B Tech Asia', type: 'BOOLEAN' },
      text('city', 'City'),
      text('venue', 'Venue'),
      text('organizer', 'Organizer'),
      date('startDate', 'Start date'),
      date('endDate', 'End date'),
      text('dateStatus', 'Date status (confirmed/tba/cancelled)'),
      text('status', 'Status (upcoming/ongoing/past/tba/cancelled)'),
      { key: 'zones', displayName: 'Zones', type: 'ARRAY_STRING' },
      text('relevance', 'Relevance (A/B, sort only)'),
      text('admission', 'Admission'),
      text('exhibitorsJson', 'Exhibitors (JSON)'),
      text('visitorsJson', 'Visitors (JSON)'),
      text('lastEditionJson', 'Last edition (JSON)'),
      { key: 'officialUrl', displayName: 'Official site', type: 'URL' },
      rich('sourcesHtml', 'Sumber'),
      text('sourcesJson', 'Sources (JSON)'),
      date('verifiedAt', 'Verified at'),
      rich('summaryHtml', 'Ringkasan (id)'),
      rich('faqHtml', 'FAQ (id)'),
      text('seoTitle', 'SEO title (id)'),
      text('seoDescription', 'SEO description (id)'),
      text('enJson', 'English (JSON)'),
      text('jaJson', 'Japanese (JSON)')
    ]
  }).then(() => 'ReviewExhibitions created').catch((e) => 'ReviewExhibitions: ' + e.message);
}
