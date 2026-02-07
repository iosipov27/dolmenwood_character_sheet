import { MODULE_ID } from "../constants/moduleId.js";
import type { DwFlagsInput, HtmlRoot } from "../types.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { reportError } from "../utils/reportError.js";

export function registerInputUpdateListeners(
  html: HtmlRoot,
  sheet: foundry.appv1.sheets.ActorSheet
): void {
  const editableFields = html.find(".editable-field");
  const editInputs = html.find("input.edit-input");

  editableFields.on("click", function () {
    const span = $(this);
    const input = span.siblings("input.edit-input");

    if (!input.length) return;
    span.hide();
    input.val(span.text());
    input.show().focus();
  });

  function saveField(input: JQuery<HTMLElement>, span: JQuery<HTMLElement>) {
    const value = input.val() as string;

    span.text(value);
    input.hide();
    span.show();

    // Prepare form data for update
    const field = input.attr("name");

    if (!field) return;

    const actor = sheet.actor;

    if (!actor) return;

    const persistPromise = field.startsWith("dw.")
      ? persistDwField(actor, field, value)
      : actor.update({ [field]: value });

    void persistPromise.catch((error) => {
      reportError("Failed to update actor field.", error);
    });
  }

  editInputs.on("blur", function () {
    const input = $(this);
    const span = input.siblings(".editable-field");

    saveField(input, span);
  });

  editInputs.on("keydown", function (e) {
    if (e.key === "Enter") {
      const input = $(this);
      const span = input.siblings(".editable-field");

      saveField(input, span);
    }
  });
}

async function persistDwField(actor: Actor, field: string, value: string): Promise<void> {
  const actorWithFlags = actor as Actor & {
    getFlag?(scope: string, key: string): unknown;
    setFlag?(scope: string, key: string, fieldValue: unknown): Promise<unknown>;
  };

  const current = (actorWithFlags.getFlag?.(MODULE_ID, "dw") as DwFlagsInput | undefined) ?? {};
  const next = foundry.utils.duplicate(current) as Record<string, unknown>;
  const fieldPath = field.slice("dw.".length);

  foundry.utils.setProperty(next, fieldPath, value);
  await actorWithFlags.setFlag?.(MODULE_ID, "dw", normalizeDwFlags(next as DwFlagsInput));
}
