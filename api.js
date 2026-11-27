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

function toResult(m, type) {
  return {
    mediaId: m.id,
    type,
    title: m.title.english ?? m.title.romaji,
    cover: m.coverImage.medium,
    total: type === 'ANIME' ? m.episodes : m.chapters
  };
}