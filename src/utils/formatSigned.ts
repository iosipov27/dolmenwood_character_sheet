export function formatSigned(n: number): string {
    const x = Number(n ?? 0);
    if (!Number.isFinite(x)) return "0";
    return x >= 0 ? `+${x}` : `${x}`;
}
