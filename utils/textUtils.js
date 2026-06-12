function cleanText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function matchAfter(label, source) {
  const pattern = new RegExp(`${label}\\s*:?\\s*([^\\n|]+)`, 'i');
  const match = source.match(pattern);
  return cleanText(match?.[1] || '');
}

function extractRecipeId(url) {
  const match = url.match(/-(\d+)r?\/?$/i) || url.match(/[?&]recipeid=(\d+)/i);
  return match?.[1] || '';
}

module.exports = { cleanText, matchAfter, extractRecipeId };
