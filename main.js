import { loadList, saveList } from './storage.js';
import { renderList, renderResults } from './render.js';
import { searchMedia } from './api.js';
import { runSplash } from './splash.js';

runSplash();

const container = document.querySelector('#list');
const filtersEl = document.querySelector('.filters');   // NEW
let list = loadList();
let currentType = 'ANIME';
let currentStatus = 'CURRENT';   // NEW: which filter is on

function refresh() {
  const visible = list.filter(e =>
    e.type === currentType && e.status === currentStatus
  );

  const isAnime = currentType === 'ANIME';
  const emptyMessages = {
    CURRENT: isAnime ? "You're not watching anything yet." : "You're not reading anything yet.",
    COMPLETED: 'Nothing completed yet.',
    PLANNING: 'Your plan list is empty. Search above to add something.'
  };

  renderList(visible, container, emptyMessages[currentStatus]);
  updateFilters();
}

// NEW: switch filter, update the buttons, redraw
function setFilter(status) {
  currentStatus = status;
  for (const f of filtersEl.querySelectorAll('[data-status]')) {
    f.setAttribute('aria-pressed', f.dataset.status === status ? 'true' : 'false');
  }
  refresh();
}

// NEW: "Watching" vs "Reading" depending on the tab
function updateFilters() {
  const isAnime = currentType === 'ANIME';
  const labels = {
    CURRENT: isAnime ? 'Watching' : 'Reading',
    COMPLETED: 'Completed',
    PLANNING: isAnime ? 'Plan to watch' : 'Plan to read'
  };

  for (const btn of filtersEl.querySelectorAll('[data-status]')) {
    const status = btn.dataset.status;
    const count = list.filter(e => e.type === currentType && e.status === status).length;

    btn.querySelector('.filter-label').textContent = labels[status];
    btn.querySelector('.filter-count').textContent = count;
  }
}

function addOne(mediaId) {
  const entry = list.find(e => e.mediaId === mediaId);
  if (!entry) return;

  entry.progress += 1;
  if (entry.status === 'PLANNING') entry.status = 'CURRENT';
  if (entry.total && entry.progress >= entry.total) {
    entry.progress = entry.total;
    entry.status = 'COMPLETED';
  }
  entry.updatedAt = Date.now();

  saveList(list);
  refresh();

  // Play a bump on the freshly drawn +1 button
  const btn = container.querySelector(`[data-id="${mediaId}"]`);
  if (btn) btn.classList.add('bump');
}

function addToList(mediaId) {
  if (list.some(e => e.mediaId === mediaId)) return;

  const result = lastResults.find(r => r.mediaId === mediaId);
  if (!result) return;

  list.push({
    ...result,
    progress: 0,
    status: 'PLANNING',
    updatedAt: Date.now()
  });

  saveList(list);
  setFilter('PLANNING');   // CHANGED: show the Plan list so you can see what you just added
  renderResults(lastResults, resultsEl, list);
}

container.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="plus"]');
  if (btn) addOne(Number(btn.dataset.id));
});

// NEW: filter clicks
filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-status]');
  if (btn) setFilter(btn.dataset.status);
});

const input = document.querySelector('#search-input');
const resultsEl = document.querySelector('#results');
let searchTimer;
let lastResults = [];

input.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const text = input.value.trim();

  if (text.length < 2) {
    resultsEl.innerHTML = '';
    return;
  }

  searchTimer = setTimeout(() => runSearch(text), 400);
});

resultsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="add"]');
  if (btn) addToList(Number(btn.dataset.id));
});

async function runSearch(text) {
  resultsEl.innerHTML = '<li class="status-msg">Searching…</li>';

  try {
    const results = await searchMedia(text, currentType);

    if (text !== input.value.trim()) return;

    lastResults = results;
    renderResults(results, resultsEl, list);
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = '<li class="status-msg">Search failed. Check your connection.</li>';
  }
}

const tabsEl = document.querySelector('.tabs');

tabsEl.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-type]');
  if (!tab) return;

  currentType = tab.dataset.type;

  for (const t of tabsEl.querySelectorAll('[data-type]')) {
    t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
  }

  const isAnime = currentType === 'ANIME';
  input.placeholder = isAnime ? 'Search anime...' : 'Search manga...';

  input.value = '';
  resultsEl.innerHTML = '';
  lastResults = [];

  input.value = '';
  resultsEl.innerHTML = '';
  lastResults = [];

  setFilter('CURRENT');   
});

refresh();

document.addEventListener('touchstart', () => {}, { passive: true });

