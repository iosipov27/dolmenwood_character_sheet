import type { HtmlRoot } from "../types.js";

function readFieldValue(target: HTMLElement): unknown {
  if (target instanceof HTMLInputElement) {
    if (target.type === "checkbox") return target.checked;

    if (target.type === "number") {
      if (target.value.trim() === "") return null;

      const parsed = Number(target.value);

      return Number.isFinite(parsed) ? parsed : null;
    }

    return target.value;
  }

  if (target instanceof HTMLTextAreaElement) return target.value;
  if (target instanceof HTMLSelectElement) return target.value;

  return undefined;
}

export function registerFormChangeListener(
  html: HtmlRoot,
  { onFieldChange }: { onFieldChange: (name: string, value: unknown) => Promise<void> | void }
): void {
  html.on("submit", (event) => {
    event.preventDefault();
  });

  html.on("change", "input[name], textarea[name], select[name]", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) return;

    const name = target.getAttribute("name");

    if (!name) return;

    const value = readFieldValue(target);

    if (value === undefined) return;

    await onFieldChange(name, value);
  });
}
