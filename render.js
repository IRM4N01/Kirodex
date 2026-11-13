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
    const isAnime = entry.type === 'ANIME';
    const isDone = entry.status === 'COMPLETED';

    const li = document.createElement('li');
    li.className = isDone ? 'card is-done' : 'card';

        // Tappable area: cover + info. Opens the edit panel.
    const main = document.createElement('button');
    main.className = 'card-main';
    main.dataset.action = 'edit';
    main.dataset.id = entry.mediaId;

    if (entry.cover) {
      const img = document.createElement('img');
      img.src = entry.cover;
      img.alt = '';
      img.className = 'cover';
      main.append(img);
    }

    const body = document.createElement('span');
    body.className = 'card-body';

    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = entry.title;

    const progress = document.createElement('span');
    progress.className = 'card-progress';
    progress.textContent = progressText(entry);

    body.append(title, progress);

    if (entry.total && entry.progress > 0) {
      const track = document.createElement('span');
      track.className = 'progress-track';

      const bar = document.createElement('span');
      bar.className = 'progress-bar';
      bar.style.width = `${Math.round((entry.progress / entry.total) * 100)}%`;

      track.append(bar);
      body.append(track);
    }

    main.append(body);
    li.append(main);

    // Right side: +1 button, or a Done badge
    if (isDone) {
      const badge = document.createElement('span');
      badge.className = 'done-badge';
      badge.textContent = 'Done';
      li.append(badge);
    } else {
      const btn = document.createElement('button');
      btn.className = 'plus-btn';
      btn.textContent = '+1';
      btn.dataset.action = 'plus';
      btn.dataset.id = entry.mediaId;
      btn.setAttribute('aria-label', `Add one ${isAnime ? 'episode' : 'chapter'} to ${entry.title}`);
      li.append(btn);
    }

    container.append(li);
  }
}

function progressText(entry) {
  const isAnime = entry.type === 'ANIME';
  const unit = isAnime ? 'Ep' : 'Ch';
  const unitWord = isAnime ? 'episodes' : 'chapters';

  if (entry.status === 'PLANNING' && entry.progress === 0) {
    return entry.total ? `Not started · ${entry.total} ${unitWord}` : 'Not started';
  }
  if (entry.total) {
    return `${unit} ${entry.progress} / ${entry.total}`;
  }
  return `${unit} ${entry.progress} · ${isAnime ? 'TBA' : 'ongoing'}`;
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

    const body = document.createElement('div');
    body.className = 'card-body';
    body.append(title, meta);

    li.append(img, body, btn);
    container.append(li);
  }
}