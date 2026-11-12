export function renderList(list, container, emptyMessage = 'Nothing here yet.') {
  container.innerHTML = '';

  if (list.length === 0) {
    const li = document.createElement('li');
    li.className = 'status-msg';
    li.textContent = emptyMessage;
    container.append(li);
    return;
  }

  for (const entry of list) {
    const li = document.createElement('li');
    li.className = 'card';

    if (entry.cover) {
        const img = document.createElement('img');
        img.src = entry.cover;
        img.alt = '';
        img.className = 'cover';
        li.append(img);
    }

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

export function renderResults(results, container, list) {
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

    const added = list.some(e => e.mediaId === r.mediaId);

    const btn = document.createElement('button');
    btn.className = 'add-btn';
    btn.textContent = added ? 'Added': 'Add';
    btn.disabled = added;
    btn.dataset.action = 'add';
    btn.dataset.id = r.mediaId;
    btn.setAttribute('aria-label', added
        ? `${r.title} is already in your list`
        : `Add ${r.title} to your list`);

    li.append(img, title, meta, btn);
    container.append(li);
  }
}