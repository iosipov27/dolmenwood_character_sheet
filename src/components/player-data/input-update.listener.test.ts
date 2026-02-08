import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { MODULE_ID } from "../../constants/moduleId.js";
import { registerInputUpdateListeners } from "./input-update.listener.js";

describe("registerInputUpdateListeners", () => {
  it("updates actor field on blur for regular input", async () => {
    document.body.innerHTML = `
      <div>
        <span class="editable-field">Old value</span>
        <input class="edit-input" name="system.details.background" style="display:none;" />
      </div>
    `;

    const html = $(document.body);
    const update = vi.fn(async () => {});
    const sheet = { actor: { update } } as unknown as foundry.appv1.sheets.ActorSheet;

    registerInputUpdateListeners(html, sheet);

    const span = html.find(".editable-field");
    const input = html.find("input.edit-input");

    span.trigger("click");
    input.val("New value");
    input.trigger("blur");
    await flushPromises(1);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ "system.details.background": "New value" });
    expect(span.text()).toBe("New value");
  });

  it("updates dw flag path on blur for dw.* input", async () => {
    document.body.innerHTML = `
      <div>
        <span class="editable-field">Old language</span>
        <input class="edit-input" name="dw.meta.languages" style="display:none;" />
      </div>
    `;

    const html = $(document.body);
    const setFlag = vi.fn(async () => {});
    const getFlag = vi.fn(() => ({ meta: { languages: "Old language" } }));
    const sheet = {
      actor: {
        update: vi.fn(async () => {}),
        getFlag,
        setFlag
      }
    } as unknown as foundry.appv1.sheets.ActorSheet;

    registerInputUpdateListeners(html, sheet);

    const span = html.find(".editable-field");
    const input = html.find("input.edit-input");

    span.trigger("click");
    input.val("Elvish");
    input.trigger("blur");
    await flushPromises();

    expect(getFlag).toHaveBeenCalledWith(MODULE_ID, "dw");
    expect(setFlag).toHaveBeenCalledTimes(1);
    expect(setFlag).toHaveBeenCalledWith(
      MODULE_ID,
      "dw",
      expect.objectContaining({
        meta: expect.objectContaining({ languages: "Elvish" })
      })
    );
  });
});



