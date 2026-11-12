export function renderList(list, container) {
  container.innerHTML = '';

  for (const entry of list) {
    const li = document.createElement('li');
    li.className = 'card';

    const title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = entry.title;

    const progress = document.createElement('p');
    progress.className = 'card-progress';
    const unit = entry.type === 'ANIME' ? 'Ep' : 'Ch';
    progress.textContent = entry.total
      ? `${unit} ${entry.progress} / ${entry.total}`
      : `${unit} ${entry.progress} · ongoing`;

    li.append(title, progress);

    if (entry.status !== 'COMPLETED') {
      const btn = document.createElement('button');
      btn.className = 'plus-btn';
      btn.textContent = '+1';
      btn.dataset.action = 'plus';
      btn.dataset.id = entry.mediaId;
      li.append(btn);
    }

    container.append(li);
  }
}

export function renderResults(results, container) {
  container.innerHTML = '';

  if (results.length === 0) {
    const li = document.createElement('li');
    li.className = 'status-msg';
    li.textContent = 'No results found.';
    container.append(li);
    return;
  }

  for (const r of results) {
    const li = document.createElement('li');
    li.className = 'card';

    const img = document.createElement('img');
    img.src = r.cover;
    img.alt = '';
    img.className = 'cover';

    const title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = r.title;

    const meta = document.createElement('p');
    meta.className = 'card-progress';
    const unit = r.type === 'ANIME' ? 'episodes' : 'chapters';
    if (r.total) {
        meta.textContent = `${r.total} ${unit}`;
    } else {
        meta.textContent = r.type === 'ANIME' ? 'Episodes TBA' : 'Ongoing';
    }

    li.append(img, title, meta);
    container.append(li);
  }
}