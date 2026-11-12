import { loadList, saveList } from './storage.js';
import { renderList, renderResults } from './render.js';
import { searchMedia } from './api.js';

const container = document.querySelector('#list');
let list = loadList();

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
  renderList(list, container);
}

//Adds a search result to the list
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
  renderList(list, container);
  renderResults(lastResults, resultsEl, list);
}

// One listener on the list handles every +1 button, even ones added later
container.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="plus"]');
  if (btn) addOne(Number(btn.dataset.id));
});

renderList(list, container);

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

// one listener on the results handles every Add button
resultsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="add"]');
  if (btn) addToList(Number(btn.dataset.id));
});

async function runSearch(text) {
  resultsEl.innerHTML = '<li class="status-msg">Searching…</li>';

  try {
    const results = await searchMedia(text);

    if (text !== input.value.trim()) return;

    lastResults = results;
    renderResults(results, resultsEl, list);
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = '<li class="status-msg">Search failed. Check your connection.</li>';
  }
}
