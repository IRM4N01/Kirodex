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

export async function searchMedia(text, type = 'ANIME') {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: { search: text, type }
    })
  });

  if (!res.ok) throw new Error(`AniList error: ${res.status}`);

  const json = await res.json();
  return json.data.Page.media.map(m => toResult(m, type));
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