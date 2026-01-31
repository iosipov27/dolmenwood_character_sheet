export function getDataset(ev: Event): DOMStringMap {
  const el = ev.currentTarget;

  if (el instanceof HTMLElement) return el.dataset;

  return {};
}
