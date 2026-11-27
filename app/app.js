// DealHound app logic: render the deal cards, run the search and filters,
// sort best-deals-first, and build the cross-store comparison table.
// All data lives in deals.js; nothing is fetched from the network.

import { DEALS, STORES, CATEGORIES, CHECKED_ON } from "./deals.js";

const grid = document.getElementById("grid");
const emptyNote = document.getElementById("empty");
const resultLine = document.getElementById("result-line");
const statsLine = document.getElementById("stats");
const compareGrid = document.getElementById("compare-grid");

const searchBox = document.getElementById("search");
const categorySel = document.getElementById("category");
const storeSel = document.getElementById("store");
const minDiscountSel = document.getElementById("mindiscount");
const sortSel = document.getElementById("sort");

const VERDICT_LABEL = {
  low: "NEW LOW",
  strong: "STRONG DEAL",
  good: "GOOD PRICE",
  routine: "ROUTINE SALE",
};

function discountPct(deal) {
  return Math.round(((deal.was - deal.sale) / deal.was) * 100);
}

function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

function dealScore(deal) {
  // Best-deals-first: new lows lead, then bigger discounts, then bigger savings.
  const bonus = { low: 1000, strong: 500, good: 100, routine: 0 }[deal.flag] || 0;
  return bonus + discountPct(deal) * 10 + Math.min((deal.was - deal.sale) / 10, 50);
}

function fillSelect(select, items, allLabel) {
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  select.appendChild(all);
  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  }
}

function makeCard(deal) {
  const pct = discountPct(deal);
  const card = document.createElement("article");
  card.className = "card";

  const top = document.createElement("div");
  top.className = "card-top";
  const storeChip = document.createElement("span");
  storeChip.className = "store-chip";
  storeChip.textContent = deal.store;
  const catChip = document.createElement("span");
  catChip.className = "cat-chip";
  catChip.textContent = deal.cat;
  top.append(storeChip, catChip);

  const title = document.createElement("h3");
  title.textContent = deal.name;

  const prices = document.createElement("div");
  prices.className = "price-row";
  const sale = document.createElement("span");
  sale.className = "sale";
  sale.textContent = money(deal.sale);
  const was = document.createElement("span");
  was.className = "was";
  was.textContent = money(deal.was);
  const off = document.createElement("span");
  off.className = "off";
  off.textContent = pct + "% OFF";
  prices.append(sale, was, off);

  const save = document.createElement("p");
  save.className = "save-line";
  save.textContent = "You save " + money(deal.was - deal.sale) + " vs the usual price.";

  const badge = document.createElement("span");
  badge.className = "badge badge-" + deal.flag;
  badge.textContent = VERDICT_LABEL[deal.flag];

  const evidence = document.createElement("p");
  evidence.className = "evidence";
  evidence.textContent = deal.evidence + ".";

  const source = document.createElement("p");
  source.className = "source-line";
  source.textContent = "Checked " + CHECKED_ON + " · Source: " + deal.source;

  const spacer = document.createElement("div");
  spacer.className = "spacer";

  const link = document.createElement("a");
  link.className = "store-link";
  link.href = deal.link;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "View at " + deal.store + " \u2197";

  card.append(top, title, prices, save, badge, evidence, source, spacer, link);
  return card;
}

function currentFilters() {
  return {
    q: searchBox.value.trim().toLowerCase(),
    cat: categorySel.value,
    store: storeSel.value,
    min: Number(minDiscountSel.value),
    sort: sortSel.value,
  };
}

function applyFilters(list, f) {
  return list.filter((deal) => {
    if (f.cat && deal.cat !== f.cat) return false;
    if (f.store && deal.store !== f.store) return false;
    if (discountPct(deal) < f.min) return false;
    if (f.q) {
      const hay = (deal.name + " " + deal.store + " " + deal.cat).toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  });
}

function sortDeals(list, mode) {
  const sorted = [...list];
  if (mode === "discount") sorted.sort((a, b) => discountPct(b) - discountPct(a));
  else if (mode === "saving") sorted.sort((a, b) => (b.was - b.sale) - (a.was - a.sale));
  else if (mode === "price-low") sorted.sort((a, b) => a.sale - b.sale);
  else if (mode === "price-high") sorted.sort((a, b) => b.sale - a.sale);
  else sorted.sort((a, b) => dealScore(b) - dealScore(a));
  return sorted;
}

function render() {
  const f = currentFilters();
  const shown = sortDeals(applyFilters(DEALS, f), f.sort);
  grid.replaceChildren(...shown.map(makeCard));
  emptyNote.hidden = shown.length > 0;
  const best = shown.length ? discountPct(shown[0]) : 0;
  resultLine.innerHTML = "";
  const strong = document.createElement("b");
  strong.textContent = shown.length + " deal" + (shown.length === 1 ? "" : "s");
  resultLine.append(strong, document.createTextNode(
    " shown" + (shown.length ? " · biggest discount here: " + best + "% off" : "") +
    " · prices checked " + CHECKED_ON + "."
  ));
}

function renderCompare() {
  const groups = {};
  for (const deal of DEALS) {
    if (!deal.group) continue;
    (groups[deal.group] ||= []).push(deal);
  }
  const cards = [];
  for (const key of Object.keys(groups)) {
    const rows = [...groups[key]].sort((a, b) => a.sale - b.sale);
    const card = document.createElement("div");
    card.className = "compare-card";
    const title = document.createElement("h3");
    title.textContent = rows[0].name;
    card.appendChild(title);
    rows.forEach((deal, i) => {
      const row = document.createElement("div");
      row.className = "compare-row" + (i === 0 ? " best" : "");
      const store = document.createElement("span");
      store.className = "store";
      store.textContent = deal.store;
      if (i === 0) {
        const tag = document.createElement("span");
        tag.className = "best-tag";
        tag.textContent = "CHEAPEST";
        store.appendChild(tag);
      }
      const price = document.createElement("span");
      price.className = "price";
      price.textContent = money(deal.sale) + "  (" + discountPct(deal) + "% off)";
      row.append(store, price);
      card.appendChild(row);
    });
    const note = document.createElement("p");
    note.className = "compare-save";
    note.textContent = "Best price saves " + money(rows[rows.length - 1].sale - rows[0].sale) +
      " vs the other store. Checked " + CHECKED_ON + ".";
    card.appendChild(note);
    cards.push(card);
  }
  compareGrid.replaceChildren(...cards);
}

function readUrlState() {
  // Shareable filter links: ?q=&cat=&store=&min=&sort= — used by the
  // screenshots to show a filtered view, and by shoppers to share a search.
  const params = new URLSearchParams(location.search);
  if (params.get("q")) searchBox.value = params.get("q");
  if (params.get("cat")) categorySel.value = params.get("cat");
  if (params.get("store")) storeSel.value = params.get("store");
  if (params.get("min")) minDiscountSel.value = params.get("min");
  if (params.get("sort")) sortSel.value = params.get("sort");
}

function init() {
  fillSelect(categorySel, CATEGORIES, "All categories");
  fillSelect(storeSel, STORES, "All stores");
  const lows = DEALS.filter((d) => d.flag === "low").length;
  const totalSaved = DEALS.reduce((sum, d) => sum + (d.was - d.sale), 0);
  statsLine.innerHTML = "";
  const b1 = document.createElement("b");
  b1.textContent = DEALS.length + " deals";
  const b2 = document.createElement("b");
  b2.textContent = STORES.length + " stores";
  const b3 = document.createElement("b");
  b3.textContent = lows + " new lows";
  const b4 = document.createElement("b");
  b4.textContent = "$" + Math.round(totalSaved).toLocaleString("en-US") + " total savings";
  statsLine.append(b1, document.createTextNode(" across "), b2,
    document.createTextNode(" · "), b3, document.createTextNode(" · "), b4,
    document.createTextNode(" if you bought one of each."));
  readUrlState();
  renderCompare();
  render();
  for (const el of [searchBox, categorySel, storeSel, minDiscountSel, sortSel]) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  }
}

init();
