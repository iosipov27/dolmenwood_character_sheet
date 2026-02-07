import { registerAction } from "../utils/registerAction.js";
import { DW_REMOVE_SKILL } from "../constants/templateAttributes.js";
import { getDataset } from "../utils/getDataset.js";
import type {
  ActionEvent,
  DwExtraSkill,
  GetDwFlags,
  HtmlRoot,
  SetDwFlags
} from "../types.js";

export function registerRemoveSkillListener(
  html: HtmlRoot,
  {
    getDwFlags,
    setDwFlags
  }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  registerAction(html, DW_REMOVE_SKILL, async (ev: ActionEvent) => {
    const { index } = getDataset(ev);
    const skillIndex = Number(index);

    if (!Number.isFinite(skillIndex)) return;

    const dw = getDwFlags();

    dw.extraSkills = readExtraSkillsFromForm(html, dw.extraSkills);

    if (skillIndex < 0 || skillIndex >= dw.extraSkills.length) return;
    const confirmed = await confirmRemoveSkill();
    if (!confirmed) return;

    dw.extraSkills.splice(skillIndex, 1);
    await setDwFlags(dw);
  });
}

async function confirmRemoveSkill(): Promise<boolean> {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;

  return Dialog.confirm({
    title: localize("DOLMENWOOD.UI.RemoveSkillTitle"),
    content: `<p>${localize("DOLMENWOOD.UI.RemoveSkillConfirm")}</p>`,
    yes: () => true,
    no: () => false,
    defaultYes: false
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

    const current = byIndex.get(index) ?? { name: "", target: 0 };
    if (key === "name") current.name = input.value ?? "";
    if (key === "target") current.target = Number(input.value ?? 0) || 0;
    byIndex.set(index, current);
  });

  return Array.from(byIndex.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, skill]) => skill);
}
