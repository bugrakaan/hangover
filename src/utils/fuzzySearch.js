import Fuse from 'fuse.js';

const FUSE_OPTIONS = {
  keys: ['label'],
  threshold: 0.4,
  ignoreLocation: true,
  shouldSort: false,
};

export function getMatchingItemIds(items, query) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return null;
  }

  const searchableItems = items.filter(item => item.id && item.label);

  if (searchableItems.length === 0) {
    return new Set();
  }

  const fuse = new Fuse(searchableItems, FUSE_OPTIONS);

  return new Set(fuse.search(normalizedQuery).map(result => result.item.id));
}