export type DwLocalize = (key: string) => string;

export function buildDwLocalize(): DwLocalize {
  return (key: string): string => game.i18n?.localize(key) ?? key;
}

export function localizeRecord(
  map: Record<string, string>,
  localize: DwLocalize
): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [key, localize(value)]));
}
