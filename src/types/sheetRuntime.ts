import type { DwFlags } from "./dw.js";

export type GetDwFlags = () => DwFlags;
export type DwPatch = Record<string, unknown>;
export type ApplyDwPatch = (dwPatch: DwPatch) => Promise<void> | void;
export type RenderSheet = () => void;
