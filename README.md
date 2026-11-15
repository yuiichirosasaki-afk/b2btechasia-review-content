# b2btechasia-review-content

Content feed for **B2B Tech Asia Review** (`/id/review/`), the news section of the B2B Tech Asia Expo website (Wix).

## How it works

1. A scheduled Claude task runs every weekday around 03:00 WIB. It researches news for six categories, writes the articles in Bahasa Indonesia, checks them against the publishing rules below, and commits them here.
2. `feed.json` holds the articles from the last 30 days. Wix (Velo backend job, hourly) reads the raw file, upserts each article into the `ReviewArticles` CMS collection by `slug`, and the dynamic page `/review/{slug}` shows it once `publishAt` has passed.
3. Press releases do not go through this repo. Wix reads the VRITIMES RSS feed directly into the `SiaranPers` collection.

## Files

- `feed.json` — the feed Wix reads (do not rename)
- `articles/YYYY-MM-DD/<slug>.json` — one file per article, kept as the archive
- `schema/article.schema.json` — the article format
- `velo/backend/` — the Wix Velo code (copied into the Wix site by hand)

## Categories

Cybersecurity · AI & Data · Cloud & Data Center · Enterprise Adoption · Regulasi · Deals

## Publishing rules (checked before every commit)

- Every number, date, person and company name appears in a cited source.
- At least two sources per article; at most one short quote per source.
- Original analysis ("Apa Artinya bagi Anda") is at least half the article.
- A company is named as a breach victim only if the company or a regulator confirmed it.
- If an article fails any rule, it is not published. A category with no qualifying news gets an explainer or is skipped that day.
