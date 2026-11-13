import { loadList, saveList } from './storage.js';
import { renderList, renderResults } from './render.js';
import { searchMedia } from './api.js';
import { runSplash } from './splash.js';

runSplash();

const container = document.querySelector('#list');
const filtersEl = document.querySelector('.filters');   
let list = loadList();
let currentType = 'ANIME';
let currentStatus = 'CURRENT';   

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


function setFilter(status) {
  currentStatus = status;
  for (const f of filtersEl.querySelectorAll('[data-status]')) {
    f.setAttribute('aria-pressed', f.dataset.status === status ? 'true' : 'false');
  }
  refresh();
}


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
  const btn = container.querySelector(`[data-action="plus"][data-id="${mediaId}"]`);
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
  setFilter('PLANNING');   
  renderResults(lastResults, resultsEl, list);
}

container.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'plus') addOne(id);
  if (btn.dataset.action === 'edit') openEdit(id);
});


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

  setFilter('CURRENT');   
});

// Edit panel
const dialog = document.querySelector('#edit-dialog');
const editForm = document.querySelector('#edit-form');
const editTitle = document.querySelector('#edit-title');
const progressLabel = document.querySelector('#edit-progress-label');
const progressInput = document.querySelector('#edit-progress');
const totalEl = document.querySelector('#edit-total');
const statusSelect = document.querySelector('#edit-status');
let editingId = null;

function openEdit(mediaId) {
  const entry = list.find(e => e.mediaId === mediaId);
  if (!entry) return;

  editingId = mediaId;
  const isAnime = entry.type === 'ANIME';

  editTitle.textContent = entry.title;
  progressLabel.textContent = isAnime ? 'Episodes watched' : 'Chapters read';
  progressInput.value = entry.progress;

  if (entry.total) {
    progressInput.max = entry.total;
    totalEl.textContent = `of ${entry.total}`;
  } else {
    progressInput.removeAttribute('max');
    totalEl.textContent = isAnime ? 'of TBA' : 'ongoing';
  }

  statusSelect.value = entry.status;
  statusSelect.querySelector('[value="CURRENT"]').textContent = isAnime ? 'Watching' : 'Reading';
  statusSelect.querySelector('[value="PLANNING"]').textContent = isAnime ? 'Plan to watch' : 'Plan to read';

  dialog.showModal();
}

// Cancel button
dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
  dialog.close();
});

// Tap the dimmed background to close
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

// Save
editForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const entry = list.find(item => item.mediaId === editingId);
  if (!entry) {
    dialog.close();
    return;
  }

  // Clean up the typed number: whole number, 0 to total
  let progress = Math.max(0, Math.floor(Number(progressInput.value) || 0));
  if (entry.total) progress = Math.min(progress, entry.total);

  let status = statusSelect.value;
  const progressChanged = progress !== entry.progress;
  const statusChanged = status !== entry.status;

  // Whichever field you changed decides
  if (statusChanged && status === 'COMPLETED' && entry.total) {
    progress = entry.total;
  }
  if (progressChanged && entry.total && progress >= entry.total) {
    status = 'COMPLETED';
  }
  if (progressChanged && status === 'PLANNING' && progress > 0) {
    status = 'CURRENT';
  }

  const movedFilter = status !== entry.status;

  entry.progress = progress;
  entry.status = status;
  entry.updatedAt = Date.now();

  saveList(list);
  dialog.close();

  // If it moved to another filter, follow it there so it doesn't seem to vanish
  if (movedFilter) {
    setFilter(status);
  } else {
    refresh();
  }
});

// Remove (tap twice to confirm)
const removeBtn = dialog.querySelector('[data-action="remove"]');

function resetRemove() {
  delete removeBtn.dataset.confirm;
  removeBtn.textContent = 'Remove';
}

removeBtn.addEventListener('click', () => {
  if (!removeBtn.dataset.confirm) {
    removeBtn.dataset.confirm = 'true';
    removeBtn.textContent = 'Tap again to remove';
    return;
  }

  list = list.filter(item => item.mediaId !== editingId);
  saveList(list);
  dialog.close();
  refresh();
  renderResults(lastResults, resultsEl, list);
});

// Whenever the panel closes (any way), reset the Remove button
dialog.addEventListener('close', resetRemove);

refresh();

document.addEventListener('touchstart', () => {}, { passive: true });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
