import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSaveRollListener } from "./save-roll.listener.js";

describe("registerSaveRollListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rolls save with target from dw flags", async () => {
    vi.stubGlobal("game", {
      i18n: {
        localize: (key: string) => (key === "DOLMENWOOD.Roll.SavePrefix" ? "Save" : key)
      }
    });

    document.body.innerHTML = `<button data-action="dw-roll-save" data-key="doom"></button>`;
    const html = $(document.body);
    const actor = {} as Actor;
    const getDwFlags = vi.fn(() => ({ saves: { doom: 11 } }) as never);
    const rollTargetCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 11 }));
    const prettyKey = vi.fn((key: string) => key.toUpperCase());

    registerSaveRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey });

    html.find("[data-action='dw-roll-save']").trigger("click");
    await flushPromises();

    expect(prettyKey).toHaveBeenCalledWith("doom");
    expect(rollTargetCheck).toHaveBeenCalledTimes(1);
    expect(rollTargetCheck).toHaveBeenCalledWith(actor, "Save: DOOM", 11);
  });
});
