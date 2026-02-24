import { registerAction } from "../../utils/registerAction.js";
import { DW_ADD_SKILL } from "../../constants/templateAttributes.js";
import type { DwExtraSkill, GetDwFlags, HtmlRoot, SetDwFlags } from "../../types/index.js";

export function registerAddSkillListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  registerAction(html, DW_ADD_SKILL, async () => {
    const dw = getDwFlags();

    dw.extraSkills = readExtraSkillsFromForm(html, dw.extraSkills);

    if (dw.extraSkills.length >= 10) return;

    dw.extraSkills.push({ name: "", target: 6 });
    await setDwFlags(dw);
  });
}

function readExtraSkillsFromForm(html: HtmlRoot, fallback: DwExtraSkill[]): DwExtraSkill[] {
  const fields = html.find("input[name^='dw.extraSkills.']");

  if (!fields.length) return Array.isArray(fallback) ? fallback : [];

  const byIndex = new Map<number, DwExtraSkill>();

  fields.each((_, element) => {
    const input = element as HTMLInputElement;
    const match = input.name.match(/^dw\.extraSkills\.(\d+)\.(name|target)$/);

    if (!match) return;

    const index = Number(match[1]);
    const key = match[2];

    if (!Number.isFinite(index)) return;

    const current = byIndex.get(index) ?? { name: "", target: 6 };

    if (key === "name") current.name = input.value ?? "";

    if (key === "target") {
      const targetRaw = Number(input.value ?? 6);

      current.target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;
    }
    byIndex.set(index, current);
  });

  return Array.from(byIndex.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, skill]) => skill);
}
