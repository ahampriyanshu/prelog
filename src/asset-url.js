// Public data and symbols must share Vite's deployment base path.
export function assetUrl(path, base = import.meta.env?.BASE_URL ?? '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${base.replace(/\/?$/, '/')}${path.slice(1)}`;
}
