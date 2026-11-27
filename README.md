# DealHound — Real Black Friday Deal Finder

[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/karmilanerila/black-friday-deal-finder-01/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/karmilanerila/black-friday-deal-finder-01/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

A Black Friday deal finder with real prices, checked deal by deal on 27 Nov 2026 at Amazon, Best Buy, Walmart, Target and Dell.

## What it does

- **58 real deals** across 9 categories and 5 stores — each with its product, store, store link, sale price, usual price, discount and the time its price was checked.
- **Honest verdict on every deal**: NEW LOW, STRONG DEAL, GOOD PRICE or ROUTINE SALE, with the evidence for the call. The discount on every card is computed from the two prices shown.
- **Search and filters that work**: text search, category, store, minimum discount, and five sort orders (best deals first by default).
- **Same product, compared across stores**: AirPods Pro 3, MacBook Air M5 and the Dyson V9 are shown head-to-head so the cheapest price wins.
- **Static and fast**: plain files under `app/`, no network requests, no framework. Works on desktop and phone.

## How prices were checked

Each price was read on 27 Nov 2026 at the named store or in a deals roundup that names the store (9to5Toys, TechSpot, Mashable, Yahoo Shopping). The source is named on every deal card, and the method is explained on the site itself.

## Run it

Serve `app/` with any static server, for example:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 — no build step, no network.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

---

Built for the [Black Friday deal finder bounty](https://make.fun/c/black-friday-deal-finder-01?ref=h379tqrk) on make.fun.
