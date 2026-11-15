# B2B Tech Asia Review — daily article run

This repo is the article feed for **B2B Tech Asia Review** (https://www.b2btechasia.com/id/review/<slug>), the news section of B2B Tech Asia Expo (14–15 July 2027, The Ritz-Carlton Jakarta, Pacific Place). Wix reads `feed.json` every hour and publishes each article once its `publishAt` time has passed.

The purpose of the site is to bring Indonesian B2B tech decision makers (CIO, CISO, CTO, directors, IT buyers, tech vendors) to the Expo through organic search. Tone: a serious business newspaper (like Nikkei). Language: Bahasa Indonesia (formal, clear, no hype).

There is no human review. Nobody approves articles and nobody is notified. Quality and legal safety depend entirely on the checks below.

## The daily run (weekdays, ~03:00 WIB)

1. `python3 scripts/recent_slugs.py` — lists articles from the last 30 days, so you do not repeat a story.
2. Research news from the last 72 hours (Indonesia first, then Southeast Asia if it affects Indonesian companies) for each of the 6 categories:
   - **Cybersecurity** — incidents, threats, BSSN / OJK / Komdigi actions, vendor research
   - **AI & Data** — enterprise AI, data platforms, AI cost and governance
   - **Cloud & Data Center** — hyperscaler regions, data center capacity, power, pricing
   - **Enterprise Adoption** — named companies (banks, telcos, BUMN, retailers, manufacturers) adopting technology; this is the most valuable category
   - **Regulasi** — PDP law, OJK/BI rules, Komdigi, AI regulation, tax on digital services
   - **Deals** — funding, M&A, partnerships, large contracts
   Use WebSearch (Indonesian and English queries) and WebFetch to read the actual articles. Prefer primary sources (regulator, company press release, filings) plus at least one reputable outlet (Kontan, Bisnis.com, Katadata, CNBC Indonesia, Kompas, Tempo, The Jakarta Post, Reuters, DealStreetAsia, Tech in Asia, KrASIA).
3. Write **one article per category** (6 per day). If a category has no news that passes the rules, write a `penjelasan` (explainer) on a current issue in that category, or skip the category that day. Never invent news to fill a slot.
4. Save each article as `articles/YYYY-MM-DD/<slug>.json` (date = publish date, WIB) following `schema/article.schema.json`.
5. `python3 scripts/make_images.py articles/YYYY-MM-DD` — renders the hero data graphic (`images/<slug>.png`) and sets `heroImage`.
6. `python3 scripts/validate.py articles/YYYY-MM-DD` — must print `OK` for every file. Fix and re-run until it does. Delete any article you cannot fix.
7. `python3 scripts/build_feed.py` — rebuilds `feed.json` from the last 30 days of `articles/`.
8. Commit and push to `main` (including `images/`) with message `Articles YYYY-MM-DD (n)`. Done. Do not send any message, Slack post or email.

## Article format

- `articleType`: `analisis` (news + analysis, default), `berita` (straight news with context), or `penjelasan` (explainer).
- `title`: specific and factual, contains the key number or name. 60–110 chars. No clickbait, no question-only titles.
- `dek`: 2–3 sentences, plain text: what happened and why it matters.
- `summaryHtml` ("Ringkasan Berita"): `<ul><li>` 3–5 bullets of facts, all from the sources, in your own words.
- `analysisHtml` ("Di Balik Berita"): 3–4 `<h3>` sections with `<p>`. This is the value of the site: what the reader would not see from the headline — the context, the numbers compared, who wins and loses, what is likely next, what the news does NOT say. Reason carefully; label speculation as such ("kemungkinan", "perlu dicermati").
- `actionHtml` ("Apa Artinya bagi Anda"): concrete steps by role (`<h3>Untuk CIO dan CISO</h3><ol><li>…`), for vendors as well where relevant.
- `faqHtml`: 2–3 `<h3>` question + `<p>` answer pairs that match what people search on Google.
- `dataFigure` / `dataLabel` / `dataSource`: one key number for the hero graphic (e.g. "2,2 juta" / "percobaan serangan siber dalam 24 jam" / "FortiGuard Labs, 10 November 2026").
- `chart` (optional, recommended when the sources give a series or a comparison): `{"bars": [{"label": "7 Nov", "value": 350600, "display": "351rb"}, ...]}` — 2–6 bars, labels ≤ 12 chars, display ≤ 10 chars, the highlighted (last) bar is the key value. Every value must come from the sources. Keep `dataFigure` short (≤ 10 chars, e.g. "2,2 juta", "74%", "US$365 jt").
- `sources`: 2–5 entries `{name, title, url, date}`; URLs must be ones you actually opened.
- `seoTitle` ≤ 60 chars, `seoDescription` ≤ 155 chars, both in Indonesian with the main keyword.
- `slug`: lowercase Indonesian keywords, hyphens, ≤ 80 chars, unique.
- `publishAt`: spread through the day in WIB, e.g. 06:00, 07:30, 09:00, 10:30, 12:00, 13:30 (`2026-11-16T06:00:00+07:00`). Put the strongest story first.
- `audience` (2–4 roles) and `tags` (3–8 names/keywords).
- HTML allowed: `p, ul, ol, li, h3, strong, em, a`. No inline styles, no images, no `<h1>`/`<h2>`.

## Publishing rules (non-negotiable)

1. **Facts only from sources.** Every number, date, person, company and quote must appear in a source you opened. If two sources disagree, say so.
2. **Quotation, not copying.** At most one direct quote per source, under 15 words, in quotation marks with attribution. Everything else in your own words. Do not mirror the source article's structure.
3. **Original analysis ≥ half** of the article text (analysisHtml + actionHtml + faqHtml vs summaryHtml).
4. **Breach victims:** name a company as a victim of a breach or leak only if the company itself or a regulator/authority confirmed it. Otherwise write "sebuah perusahaan [sektor]" and attribute the claim ("menurut klaim kelompok peretas…").
5. **No defamation, no accusations** of crimes or wrongdoing beyond what courts, regulators or the company stated.
6. **No investment advice**, no stock recommendations.
7. **No political opinion.** Report government policy neutrally with its effect on business.
8. **No duplication:** do not repeat a story already covered in the last 30 days unless there is a material new development (then link the angle as an update).
9. Do not mention B2B Tech Asia Expo inside the article body (the page template adds the Expo box automatically).
10. Press releases are NOT written here (Siaran Pers comes from VRITIMES automatically).

## Cost

Keep each run efficient: about 3–6 searches per category, fetch only the articles you will cite. One run per weekday.
