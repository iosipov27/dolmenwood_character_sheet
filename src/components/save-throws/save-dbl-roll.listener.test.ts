import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSaveDblRollListener } from "./save-dbl-roll.listener.js";

describe("registerSaveDblRollListener", () => {
  it("rolls save on double click with input value", async () => {
    document.body.innerHTML = `<input data-dw-dblroll="save" data-key="ray" value="9" />`;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollTargetCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 9 }));
    const prettyKey = vi.fn((key: string) => key.toUpperCase());

    registerSaveDblRollListener(html, { actor, rollTargetCheck, prettyKey });

    html.find("input[data-dw-dblroll='save']").trigger("dblclick");
    await flushPromises();

    expect(prettyKey).toHaveBeenCalledWith("ray");
    expect(rollTargetCheck).toHaveBeenCalledTimes(1);
    expect(rollTargetCheck).toHaveBeenCalledWith(actor, "Save: RAY", 9);
  });
});
