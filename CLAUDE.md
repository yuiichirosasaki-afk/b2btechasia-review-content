# VRI B2B Tech Asia Review — daily article run

This repo is the article feed for **VRI B2B Tech Asia Review** (https://www.b2btechasia.com/id/review/<slug>), the news section of VRI B2B Tech Asia (14–15 July 2027, The Ritz-Carlton Jakarta, Pacific Place). Wix reads `feed.json` every hour and publishes each article once its `publishAt` time has passed.

The purpose of the site is to bring Indonesian B2B tech decision makers (CIO, CISO, CTO, directors, IT buyers, tech vendors) to the Expo through organic search. Tone: a serious business newspaper (like Nikkei). Language: Bahasa Indonesia (formal, clear, no hype).

There is no human review. Nobody approves articles and nobody is notified. Quality and legal safety depend entirely on the checks below.

## The daily run (weekdays, ~03:00 WIB)

The exhibition database (`exhibitions/`, `exhibitions.json`) is maintained by a separate weekly run (`EXHIBITIONS.md`). The daily run does not touch those files and does not write exhibition listings or calendars as articles. A news story about one event (e.g. a government announcement made at a summit) is still a normal article.


1. `python3 scripts/recent_slugs.py` — lists articles from the last 30 days, so you do not repeat a story, and the zone coverage of the last 7 days.
2. Research news from the last 72 hours (Indonesia first, then Southeast Asia if it affects Indonesian companies). Categories follow the **VRI B2B Tech Asia 2027 zones** (`taxonomy.json`): 3 hubs × 4 zones. An article's `category` is exactly one zone name.
   - **AI & Automation Hub** (CTO, IT Director, Infrastructure Lead): `AI & Automation` · `Cloud & IT Infrastructure` · `Cybersecurity & Data Protection` · `Enterprise Software & ERP`
   - **Growth & Revenue Hub** (CMO, Head of Sales, Growth Lead): `Marketing Technology` · `Sales & CRM` · `Customer Engagement & CX` · `E-Commerce & Retail Tech`
   - **Back Office & Operations Hub** (CFO, HR Director, Operations Head): `FinTech & Financial Operations` · `HR Tech & Workforce Management` · `Legal, Compliance & Governance Tech` · `Logistics & Supply Chain Tech`
   See `scope` in `taxonomy.json` for what each zone covers. Regulation goes in the zone it affects most, or in `Legal, Compliance & Governance Tech` when it is about compliance itself. **Enterprise adoption** (a named bank, telco, BUMN, retailer or manufacturer adopting technology — the most valuable kind of story) and **deals** (funding, M&A, partnerships, large contracts) are angles, not categories: put the story in its zone and add the tag `Enterprise Adoption` or `Deals`.
   Use WebSearch (Indonesian and English queries) and WebFetch to read the actual articles. Prefer primary sources (regulator, company press release, filings) plus at least one reputable outlet (Kontan, Bisnis.com, Katadata, CNBC Indonesia, Kompas, Tempo, The Jakarta Post, Reuters, DealStreetAsia, Tech in Asia, KrASIA).
3. Write **6 articles per day: 2 per hub, each in a different zone**, in Bahasa Indonesia, **and** each article's English version in the `en` field and Japanese version in the `ja` field (see Article format). Use the zone coverage printed by `recent_slugs.py` to favour zones with few articles in the last 7 days, so all 12 zones get covered over the week — but news quality comes first: never force a weak story into a zone. If a hub has no news that passes the rules, write a `penjelasan` (explainer) on a current issue in one of its zones, or skip that slot. Never invent news to fill a slot.
4. Save each article as `articles/YYYY-MM-DD/<slug>.json` (date = publish date, WIB) following `schema/article.schema.json`.
5. `python3 scripts/make_images.py articles/YYYY-MM-DD` — renders the hero data graphic (`images/<slug>.png`) and sets `heroImage`.
6. `python3 scripts/validate.py articles/YYYY-MM-DD` — must print `OK` for every file. Fix and re-run until it does. Delete any article you cannot fix.
7. `python3 scripts/build_feed.py` — rebuilds `feed.json` from the last 30 days of `articles/`.
8. `git pull --rebase origin main`, then commit and push to `main` (including `images/`) with message `Articles YYYY-MM-DD (n)`. Done. Do not send any message, Slack post or email.

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
- `en`: the English version for readers of /review (English site). Same facts, numbers, sources and structure as the Indonesian text — a faithful translation, not a new article. Fields: `title`, `dek`, `summaryHtml`, `analysisHtml`, `actionHtml`, `faqHtml`, `dataFigure` (English number format, e.g. "2.2 million", "US$365M"), `dataLabel`, `dataSource`, `seoTitle` (≤ 60), `seoDescription` (≤ 155), `audience` (English role names), and `chart` (same bars as `chart`, English `label`/`display`) when `chart` is set. Direct quotes become English paraphrase with attribution unless the original quote was in English. `make_images.py` renders `images/<slug>-en.png` and sets `en.heroImage`.
- `ja`: the Japanese version for readers of /jp/review (Japanese executives and Japanese companies doing business in Indonesia). Same facts, numbers, sources and structure as the Indonesian text — a faithful translation, not a new article. Style: 日本経済新聞のような硬めのビジネス文体（だ・である調）, natural Japanese, not word-for-word. Keep company names in their official form (Latin script; add katakana only if widely used, e.g. 「インドネシア銀行（BI）」「インドネシア金融庁（OJK）」 on first mention). Rupiah: "Rp71兆5800億" or "約71.6兆ルピア"; use 万・億・兆 (e.g. "220万件", "US$3億6500万"). Zone names stay in English. Fields: same as `en` (`title` 15–80 chars, `dek`, `summaryHtml`, `analysisHtml` with the same `<h3>` sections, `actionHtml` with Japanese role names in `<h3>`, `faqHtml`, `dataFigure` (≤ 8 chars, e.g. "220万件", "67.22%"), `dataLabel`, `dataSource`, `seoTitle` (≤ 40 chars), `seoDescription` (≤ 120 chars), `audience` (Japanese role names, e.g. "CIO", "経理・財務責任者"), and `chart` (same bars, Japanese `label`/`display`) when `chart` is set). Direct quotes become Japanese paraphrase with attribution (「〜と述べた」). `make_images.py` renders `images/<slug>-ja.png` and sets `ja.heroImage`.
- `sources`: 2–5 entries `{name, title, url, date}`; URLs must be ones you actually opened.
- `seoTitle` ≤ 60 chars, `seoDescription` ≤ 155 chars, both in Indonesian with the main keyword.
- `slug`: lowercase Indonesian keywords, hyphens, ≤ 80 chars, unique.
- `publishAt`: spread through the day in WIB, e.g. 06:00, 07:30, 09:00, 10:30, 12:00, 13:30 (`2026-11-16T06:00:00+07:00`). Put the strongest story first.
- `audience` (2–4 roles) and `tags` (3–8 names/keywords).
- HTML allowed: `p, ul, ol, li, h3, strong, em, a`. No inline styles, no images, no `<h1>`/`<h2>`.

## Publishing rules (non-negotiable)

1. **Facts only from sources** (in all three languages). Every number, date, person, company and quote must appear in a source you opened. If two sources disagree, say so.
2. **Quotation, not copying.** At most one direct quote per source, under 15 words, in quotation marks with attribution. Everything else in your own words. Do not mirror the source article's structure.
3. **Original analysis ≥ half** of the article text (analysisHtml + actionHtml + faqHtml vs summaryHtml).
4. **Breach victims:** name a company as a victim of a breach or leak only if the company itself or a regulator/authority confirmed it. Otherwise write "sebuah perusahaan [sektor]" and attribute the claim ("menurut klaim kelompok peretas…").
5. **No defamation, no accusations** of crimes or wrongdoing beyond what courts, regulators or the company stated.
6. **No investment advice**, no stock recommendations.
7. **No political opinion.** Report government policy neutrally with its effect on business.
8. **No duplication:** do not repeat a story already covered in the last 30 days unless there is a material new development (then link the angle as an update).
9. Do not mention VRI B2B Tech Asia inside the article body (the page template adds the Expo box automatically).
10. Press releases are NOT written here (Siaran Pers comes from VRITIMES automatically).

## Cost

Keep each run efficient: about 3–6 searches per article, fetch only the articles you will cite. One run per weekday.
