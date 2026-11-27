const ENDPOINT = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query ($search: String, $type: MediaType) {
    Page(perPage: 8) {
      media(search: $search, type: $type, sort: SEARCH_MATCH) {
        id
        title { romaji english }
        episodes
        chapters
        coverImage { medium }
      }
    }
  }
`;

// Every AniList request goes through here
async function request(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    const err = new Error(json.errors?.[0]?.message ?? `AniList error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return json.data;
}

export async function searchMedia(text, type = 'ANIME') {
  const data = await request(SEARCH_QUERY, { search: text, type });
  return data.Page.media.map(m => toResult(m, type));
}

// Who is logged in?
export async function getViewer(token) {
  const data = await request(`query { Viewer { id name } }`, {}, token);
  return data.Viewer;
}

const LIST_QUERY = `
  query ($userId: Int, $type: MediaType) {
    MediaListCollection(userId: $userId, type: $type) {
      lists {
        entries {
          id
          status
          progress
          updatedAt
          media {
            id
            title { romaji english }
            episodes
            chapters
            coverImage { medium }
          }
        }
      }
    }
  }
`;

// Load the logged-in user's anime or manga list, in Kirodex's format
export async function getMediaList(token, userId, type) {
  const data = await request(LIST_QUERY, { userId, type }, token);

  // AniList splits entries into several lists (Watching, Completed, custom lists...)
  const entries = data.MediaListCollection.lists.flatMap(l => l.entries);

  // A show can appear in more than one list, so keep one per show
  const unique = new Map(entries.map(e => [e.media.id, e]));

  return [...unique.values()].map(e => ({
    ...toResult(e.media, type),
    entryId: e.id,
    progress: e.progress ?? 0,
    status: e.status,
    updatedAt: e.updatedAt * 1000
  }));
}

const SAVE_MUTATION = `
  mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status, progress: $progress) {
      id
      updatedAt
    }
  }
`;

// Create or update one entry on AniList
export async function saveEntry(token, entry) {
  const data = await request(SAVE_MUTATION, {
    mediaId: entry.mediaId,
    status: entry.status,
    progress: entry.progress
  }, token);

  return {
    entryId: data.SaveMediaListEntry.id,
    updatedAt: data.SaveMediaListEntry.updatedAt * 1000
  };
}

function toResult(m, type) {
  return {
    mediaId: m.id,
    type,
    title: m.title.english ?? m.title.romaji,
    cover: m.coverImage.medium,
    total: type === 'ANIME' ? m.episodes : m.chapters
  };
}