const KEY = 'kirodex.list.v1';

export function loadList() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveList(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}