const FORMULA_PATTERN = /\b\d+d\d+(?:\s*[+\-*/]\s*\d+)*\b/gi;
const SPELL_FORMULA_PATHS = [
  "system.duration.value",
  "system.duration",
  "system.damage",
  "system.roll",
  "system.formula",
  "system.description.value",
  "system.description"
];

function getProperty(target: unknown, path: string): unknown {
  const foundryGetProperty = globalThis.foundry?.utils?.getProperty as
    | ((source: unknown, sourcePath: string) => unknown)
    | undefined;

  if (typeof foundryGetProperty === "function") {
    return foundryGetProperty(target, path);
  }

  return path
    .split(".")
    .reduce<unknown>(
      (value, key) => (value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined),
      target
    );
}

export function isValidRollFormula(formula: string): boolean {
  const normalized = String(formula ?? "").trim();

  if (!normalized) return false;

  const RollCtor = globalThis.Roll as
    | ({
        new (formula: string): { formula?: string };
        validate?: (formula: string) => boolean;
      } & Function)
    | undefined;

  if (!RollCtor) return false;

  if (typeof RollCtor.validate === "function") {
    return Boolean(RollCtor.validate(normalized));
  }

  try {
    // Construction is enough to validate syntax in environments without Roll.validate.
    // eslint-disable-next-line no-new
    new RollCtor(normalized);

    return true;
  } catch {
    return false;
  }
}

function firstFormulaFromText(text: string): string | null {
  for (const match of text.matchAll(FORMULA_PATTERN)) {
    const formula = String(match[0] ?? "").trim();

    if (isValidRollFormula(formula)) return formula;
  }

  return null;
}

function collectStrings(value: unknown, out: string[], depth = 0): void {
  if (depth > 5 || value == null) return;

  if (typeof value === "string") {
    out.push(value);

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out, depth + 1);

    return;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, out, depth + 1);
  }
}

export function findFirstValidRollFormula(source: unknown): string | null {
  if (typeof source === "string") {
    return firstFormulaFromText(source);
  }

  const texts: string[] = [];

  collectStrings(source, texts);

  for (const text of texts) {
    const formula = firstFormulaFromText(text);

    if (formula) return formula;
  }

  return null;
}

export function extractSpellRollFormula(item: Item.Implementation): string | null {
  for (const path of SPELL_FORMULA_PATHS) {
    const formula = findFirstValidRollFormula(getProperty(item, path));

    if (formula) return formula;
  }

  return findFirstValidRollFormula(getProperty(item, "system"));
}
