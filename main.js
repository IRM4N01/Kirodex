import { loadList, saveList } from './storage.js';
import { renderList } from './render.js';

const container = document.querySelector('#list');
let list = loadList();

// Test data so there's something to see. Delete once search works.
if (list.length === 0) {
  list = [
    { mediaId: 1, type: 'ANIME', title: 'Cowboy Bebop', cover: '',
      progress: 25, total: 26, status: 'CURRENT', updatedAt: Date.now() }
  ];
  saveList(list);
}

function addOne(mediaId) {
  const entry = list.find(e => e.mediaId === mediaId);
  if (!entry) return;

  entry.progress += 1;
  if (entry.total && entry.progress >= entry.total) {
    entry.progress = entry.total;
    entry.status = 'COMPLETED';
  }
  entry.updatedAt = Date.now();

  saveList(list);
  renderList(list, container);
}

// One listener on the list handles every +1 button, even ones added later
container.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="plus"]');
  if (btn) addOne(Number(btn.dataset.id));
});

renderList(list, container);