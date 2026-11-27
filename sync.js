// Compare Kirodex's list with AniList's, by show ID
export function compareLists(local, remote) {
  const remoteById = new Map(remote.map(e => [e.mediaId, e]));
  const localIds = new Set(local.map(e => e.mediaId));

  const onlyLocal = local.filter(e => !remoteById.has(e.mediaId));
  const onlyRemote = remote.filter(e => !localIds.has(e.mediaId));
  const both = local
    .filter(e => remoteById.has(e.mediaId))
    .map(e => ({ local: e, remote: remoteById.get(e.mediaId) }));

  return { onlyLocal, onlyRemote, both };
}

// Work out what needs downloading and what needs uploading
export function planSync(local, remote) {
  const { onlyLocal, onlyRemote, both } = compareLists(local, remote);

  const toUpload = [...onlyLocal];
  const toDownload = [...onlyRemote];

  for (const pair of both) {
    const same = pair.local.status === pair.remote.status
      && pair.local.progress === pair.remote.progress;
    if (same) continue;

    if (pair.remote.updatedAt > pair.local.updatedAt) {
      toDownload.push(pair.remote);
    } else {
      toUpload.push(pair.local);
    }
  }

  return { toUpload, toDownload };
}