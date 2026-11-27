// Kirodex's AniList client IDs (public, safe to commit)
const CLIENTS = {
  'https://irm4n01.github.io': '57983',
  'http://localhost:5500': '57984'
};

const TOKEN_KEY = 'kirodex.anilistToken';

// 1. Send the user to AniList to log in
export function login() {
  const clientId = CLIENTS[location.origin];
  if (!clientId) {
    console.error(`No AniList client set up for ${location.origin}`);
    return;
  }
  location.href =
    `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
}

// 2. When AniList sends us back, take the token out of the address
export function handleRedirect() {
  if (!location.hash.includes('access_token')) return;

  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get('access_token');
  const expiresIn = Number(params.get('expires_in'));

  if (token) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({
      token,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null
    }));
  }

  // Remove the token from the address bar
  history.replaceState(null, '', location.pathname + location.search);
}

// 3. Get the saved token (or null if logged out or expired)
export function getToken() {
  try {
    const saved = JSON.parse(localStorage.getItem(TOKEN_KEY));
    if (!saved) return null;
    if (saved.expiresAt && Date.now() > saved.expiresAt) {
      logout();
      return null;
    }
    return saved.token;
  } catch {
    return null;
  }
}

// 4. Forget the token
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}