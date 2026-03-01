import { registerActions } from "../../utils/registerActions.js";
import { DW_REMOVE_SKILL } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type {
  ActionEvent,
  ApplyDwPatch,
  DwExtraSkill,
  GetDwFlags,
  HtmlRoot
} from "../../types/index.js";

export function registerRemoveSkillListener(
  html: HtmlRoot,
  { getDwFlags, applyDwPatch }: { getDwFlags: GetDwFlags; applyDwPatch: ApplyDwPatch }
): void {
  registerActions(html, {
    [DW_REMOVE_SKILL]: async (ev: ActionEvent) => {
      const { index } = getDataset(ev);
      const skillIndex = Number(index);

      if (!Number.isFinite(skillIndex)) return;

      const extraSkills = readExtraSkillsFromForm(html, getDwFlags().extraSkills);

      if (skillIndex < 0 || skillIndex >= extraSkills.length) return;
      const confirmed = await confirmRemoveSkill();

      if (!confirmed) return;

      extraSkills.splice(skillIndex, 1);
      await applyDwPatch({
        extraSkills
      });
    }
  });
}

async function confirmRemoveSkill(): Promise<boolean> {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;
  const title = localize("DOLMENWOOD.UI.RemoveSkillTitle");
  const content = `<p>${localize("DOLMENWOOD.UI.RemoveSkillConfirm")}</p>`;
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: { title },
    content,
    modal: true,
    rejectClose: false
  });

  return Boolean(confirmed);
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
