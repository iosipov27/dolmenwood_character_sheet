import { readDwFlags } from "../../repositories/dwFlagsRepository.js";
import { RollChecks } from "../../sheets/rollChecks.js";
import { prettyKey } from "../../utils/prettyKey.js";

export async function handleSaveRollAction({
  actor,
  event,
  target
}: {
  actor: Actor;
  event?: Event;
  target?: HTMLElement;
}): Promise<void> {
  event?.preventDefault();
  const key = target?.dataset.key;

  if (!key) return;

  const targetValue = Number(foundry.utils.getProperty(readDwFlags(actor), `saves.${key}`) ?? 0);

  await RollChecks.rollTargetCheck(
    actor,
    `${game.i18n?.localize("DOLMENWOOD.Roll.SavePrefix") ?? "DOLMENWOOD.Roll.SavePrefix"}: ${prettyKey(key)}`,
    targetValue
  );
}
