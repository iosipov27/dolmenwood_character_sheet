export const DW_ENCUMBRANCE_MAX_LOAD = 1600;
export const DW_ENCUMBRANCE_BREAKPOINTS = [400, 600, 800] as const;

export interface DwEncumbranceSummary {
  current: number;
  max: number;
  currentLabel: string;
  maxLabel: string;
  label: string;
  fillPercent: string;
  breakpoints: {
    value: number;
    leftPercent: string;
  }[];
}

export function parseDwLoadValue(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  return 0;
}

export function sumDwLoadValues(values: Iterable<unknown>): number {
  let total = 0;

  for (const value of values) {
    total += parseDwLoadValue(value);
  }

  return total;
}

export function formatDwLoad(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

export function buildDwEncumbranceSummary(currentLoad: number): DwEncumbranceSummary {
  const current = Math.max(0, currentLoad);
  const fillPercent = Math.min(current, DW_ENCUMBRANCE_MAX_LOAD) / DW_ENCUMBRANCE_MAX_LOAD * 100;

  return {
    current,
    max: DW_ENCUMBRANCE_MAX_LOAD,
    currentLabel: formatDwLoad(current),
    maxLabel: String(DW_ENCUMBRANCE_MAX_LOAD),
    label: `${formatDwLoad(current)} / ${DW_ENCUMBRANCE_MAX_LOAD}`,
    fillPercent: formatDwPercent(fillPercent),
    breakpoints: DW_ENCUMBRANCE_BREAKPOINTS.map((value) => ({
      value,
      leftPercent: formatDwPercent(value / DW_ENCUMBRANCE_MAX_LOAD * 100)
    }))
  };
}

function formatDwPercent(value: number): string {
  const rounded = Number(value.toFixed(2));

  return `${rounded}%`;
}
