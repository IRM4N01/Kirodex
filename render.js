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