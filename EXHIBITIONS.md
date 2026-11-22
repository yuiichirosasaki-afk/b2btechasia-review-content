# VRI B2B Tech Asia Review — exhibition database (weekly run)

This file is the instruction for the **weekly exhibition run**. The daily article run (CLAUDE.md) does not touch `exhibitions/` or `exhibitions.json`.

## What this is

A database of **B2B technology exhibitions and conferences held in Indonesia**, one page per edition, in three languages (Indonesian `/id/review/expo/<slug>`, English `/review/expo/<slug>`, Japanese `/jp/review/expo/<slug>`). Wix reads `exhibitions.json` every hour and upserts each entry into the `ReviewExhibitions` collection.

Why it exists: people who search "pameran teknologi Jakarta 2027", "IndoSec 2027 tanggal" or 「インドネシア IT 展示会 2027」 are exactly the exhibitors and visitors of VRI B2B Tech Asia. The page template adds the Expo box; the entry itself stays neutral and factual.

There is no human review. Nobody approves entries and nobody is notified. A wrong date on an event page sends people to the wrong place on the wrong day, so the rules below are stricter than for articles.

## Scope

- **Country: Indonesia only.** Any city (Jakarta, Surabaya, Bali, Batam, …). Events elsewhere in Southeast Asia are out of scope.
- **B2B technology only**: at least one of the 12 zones in `taxonomy.json` must clearly fit (AI, cloud/data centre, cybersecurity, enterprise software, martech, sales/CRM, CX, e-commerce tech, fintech, HR tech, legal/compliance tech, logistics tech).
- Trade shows **and** conferences/summits that have an exhibition or sponsor booths.
- Out of scope: consumer shows (gadgets, games, retail sales), pure manufacturing/machinery, construction, defence, physical security equipment, academic conferences, webinars, meetups, events of under ~300 attendees.
- VRI B2B Tech Asia itself is included (`isOwnEvent: true`), using the facts on https://www.b2btechasia.com.

## The weekly run (Saturday)

1. `git pull origin main`, then `python3 scripts/validate_exhibitions.py` to see the current state.
2. **Re-verify** (at most 10 entries per run, most urgent first):
   - entries whose event starts within the next 60 days,
   - entries with `dateStatus: "tba"` (the organiser may have announced dates),
   - entries whose `verifiedAt` is more than 28 days old.
   Open the `officialUrl` (and the organiser's press release if needed). Update dates, venue and figures if they changed, set `verifiedAt` to today (WIB). If the event was cancelled or postponed without new dates, set `dateStatus: "cancelled"` or `"tba"` and say so in all three summaries.
3. **Add new entries** (at most 5 per run). Start with the leads in `exhibitions/candidates.tsv` (rows with `status` = `todo`); when they are done, search for more (Indonesian, English and Japanese queries: "pameran teknologi 2027", "summit Jakarta 2027 cybersecurity", "konferensi fintech Indonesia 2027", "Jakarta tech conference 2027", 「ジャカルタ 展示会 IT 2027」, organiser and venue calendars of JIExpo, JICC, ICE BSD, NICE). After working a lead, set its `status` to `done` or `out-of-scope` (with a short reason in `note`).
4. Save each entry as `exhibitions/<slug>.json` following `schema/exhibition.schema.json` (format below).
5. `python3 scripts/validate_exhibitions.py` — every file must print `OK`. Fix and re-run; delete an entry you cannot fix.
6. `python3 scripts/build_exhibitions_feed.py` — rebuilds `exhibitions.json`.
7. `git pull --rebase origin main`, then commit and push to `main` with the message `Exhibitions YYYY-MM-DD (+n new, m updated)`. If nothing changed, push nothing. Do not send any message, Slack post or email.

## Entry format

One file per **edition** (year). When the next year's edition is announced, create a new file with a new slug and the same `seriesId`; never overwrite a past edition (past pages stay online as the archive).

- `slug`: lowercase English, hyphens, ends with the year, e.g. `indosec-2027`, `digital-transformation-indonesia-2027`. ≤ 80 chars, unique.
- `seriesId`: the same across years, e.g. `indosec`.
- `name`: the official name as the organiser writes it, with the year.
- `isOwnEvent`: `true` only for VRI B2B Tech Asia.
- `country`: always `"Indonesia"`. `city`, `venue` (official venue name, or `null` if not announced), `organizer` (company as on the official site).
- `startDate`, `endDate`: `YYYY-MM-DD`, or `null`.
- `dateStatus`:
  - `"confirmed"` — **only** when the organiser's own website, its press release or the venue's official calendar states the dates of this edition. Both dates required.
  - `"tba"` — not announced, or only listed on aggregator sites. Dates must be `null`; the page shows the last edition instead.
  - `"cancelled"` — the organiser said so.
- `zones`: 1–4 zone names from `taxonomy.json`, exactly as written there.
- `relevance`: `"A"` (same buyers as VRI B2B Tech Asia: enterprise IT, CIO/CISO/CTO, SaaS buyers) or `"B"` (adjacent: one vertical, e.g. data-centre engineering, telco). Used only for sort order; never shown.
- `exhibitors`, `visitors`: `{"value": 755, "edition": "2026", "sourceUrl": "…"}` as stated by the organiser for a past edition, or `null`. Never estimate.
- `admission`: `"free"`, `"paid"`, `"mixed"` (free expo, paid conference) or `"unknown"`.
- `lastEdition`: `{"startDate", "endDate", "venue"}` of the most recent past edition, or `null`.
- `officialUrl`: the organiser's page for this event.
- `sources`: 1–5 entries `{name, title, url, date}` — pages you actually opened that state the facts in the entry. The official page must be one of them.
- `verifiedAt`: today's date (WIB) when you last opened the sources.
- `id`, `en`, `ja`: the text for each language version, each with:
  - `summaryHtml`: 2–3 `<p>` (80–180 words in id/en, 200–450 characters in ja): what the event is, who exhibits and who attends, which topics it covers, what is new in this edition if the organiser says so. Your own words.
  - `faqHtml`: 2–4 `<h3>` question + `<p>` answer pairs that people search for: when and where, whether it is free, how to register or exhibit, how it differs from a similar event (only facts).
  - `seoTitle`: id/en ≤ 60 chars, ja ≤ 40 chars, e.g. "IndoSec 2027: Tanggal, Lokasi dan Agenda", 「IndoSec 2027 日程・会場・概要」.
  - `seoDescription`: id/en ≤ 155 chars, ja ≤ 120 chars.
  - Japanese style: 日本経済新聞のような硬めの文体（だ・である調）. Event, organiser and venue names stay in Latin script; add katakana only when widely used. Dates as 「2027年8月4〜5日」.
- HTML allowed: `p, ul, ol, li, h3, strong, em, a`.

## Rules (non-negotiable)

1. **Dates, venue, organiser, figures: only from the organiser's own pages, its press releases, or the venue's official calendar.** Aggregator and directory sites (10times, showsbee, expomap, eventseye, tradefairdates, cantonfair.net, clocate, ntradeshows, expobeds, happeningnext, luminik, wokeey, beri.net, dealroom, crunchbase and similar) and LinkedIn posts are **leads only**: never a source, never enough for `"confirmed"`. `validate_exhibitions.py` rejects them.
2. **No copying.** Describe the event in your own words; do not reuse the organiser's marketing copy or structure. At most one short quote (under 15 words) per entry, attributed.
3. **No superlatives of your own.** "The largest …" only as the organiser's claim ("menurut penyelenggara", 「主催者によると」).
4. **No ranking or recommendation between events**, and no criticism of any event or organiser. Comparisons in the FAQ only on facts (dates, topics, audience).
5. **Do not mention VRI B2B Tech Asia** in the text of other events (the page template adds the Expo box). In its own entry, use only facts from b2btechasia.com.
6. Fees: say free/paid only if the official page says so; do not quote ticket prices (they change).
7. If two official sources disagree, use the most recent one and say so in the summary.

## Cost

About 2–4 page fetches per entry. At most 10 re-checks and 5 new entries per run. One run per week.
