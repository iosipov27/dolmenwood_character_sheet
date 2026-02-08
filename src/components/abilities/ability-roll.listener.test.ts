import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerAbilityRollListener } from "./ability-roll.listener.js";

describe("registerAbilityRollListener", () => {
  it("calls ability check with label and target from dataset", async () => {
    document.body.innerHTML = `<button data-action="dw-roll-ability" data-label="Strength" data-target="14"></button>`;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollAbilityCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 14 }));

    registerAbilityRollListener(html, { actor, rollAbilityCheck });

    html.find("[data-action='dw-roll-ability']").trigger("click");
    await flushPromises();

    expect(rollAbilityCheck).toHaveBeenCalledTimes(1);
    expect(rollAbilityCheck).toHaveBeenCalledWith(actor, "Strength", 14);
  });
});
