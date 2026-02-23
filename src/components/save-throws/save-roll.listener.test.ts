import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSaveRollListener } from "./save-roll.listener.js";
import { RollChecks } from "../../sheets/rollChecks.js";
import * as dwFlagsRepositoryModule from "../../repositories/dwFlagsRepository.js";

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
    vi.spyOn(dwFlagsRepositoryModule, "readDwFlags").mockReturnValue({ saves: { doom: 11 } } as never);
    const rollTargetCheck = vi
      .spyOn(RollChecks, "rollTargetCheck")
      .mockResolvedValue({ roll: {} as Roll, success: true, target: 11 });
    registerSaveRollListener(html, { actor });

    html.find("[data-action='dw-roll-save']").trigger("click");
    await flushPromises();

    expect(rollTargetCheck).toHaveBeenCalledTimes(1);
    expect(rollTargetCheck).toHaveBeenCalledWith(actor, "Save: DOOM", 11);
  });
});
