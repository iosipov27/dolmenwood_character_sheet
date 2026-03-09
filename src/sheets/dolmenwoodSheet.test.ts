import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DwFlags, HtmlRoot } from "../types/index.js";
import { MODULE_ID } from "../constants/moduleId.js";
import { flushPromises } from "../test/flushPromises.js";

const registerSheetListenersMock = vi.fn();
const buildDwFlagsFromActorMock = vi.fn();
const buildDwUpdatePayloadMock = vi.fn();

vi.mock("../listeners/registerSheetListeners.js", () => ({
  registerSheetListeners: registerSheetListenersMock
}));

vi.mock("../models/buildDwFlagsFromActor.js", () => ({
  buildDwFlagsFromActor: buildDwFlagsFromActorMock
}));

vi.mock("../handlers/sheetUpdateBuilder.js", () => ({
  buildDwUpdatePayload: buildDwUpdatePayloadMock
}));

vi.mock("../models/dolmenwoodSheetData.js", () => ({
  DolmenwoodSheetData: {
    populate: vi.fn((data: unknown) => data)
  }
}));

describe("DolmenwoodSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    class MockActorSheet {
      actor: Actor;

      constructor(actor: Actor) {
        this.actor = actor;
      }

      static get defaultOptions(): ActorSheet.Options {
        return {};
      }

      getData(): Record<string, unknown> {
        return {};
      }

      activateListeners(): void {}

      protected async _onDropItem(): Promise<null> {
        return null;
      }
    }

    vi.stubGlobal("ActorSheet", MockActorSheet);
    vi.stubGlobal("CONFIG", {
      Actor: {
        sheetClasses: {
          character: {}
        }
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function loadSheet(): Promise<typeof import("./dolmenwoodSheet.js").DolmenwoodSheet> {
    const module = await import("./dolmenwoodSheet.js");

    return module.DolmenwoodSheet;
  }

  it("submits native form data through the shared update flow", async () => {
    const actor = {
      update: vi.fn(async () => {})
    } as unknown as Actor;
    const dwUpdatePayload = {
      [`flags.${MODULE_ID}.dw`]: {
        meta: {
          otherNotes: "<p>Updated</p>"
        }
      }
    };

    buildDwUpdatePayloadMock.mockReturnValue(dwUpdatePayload);

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    await sheet._updateObject(new Event("submit"), {
      name: "Rook",
      "flags.yakov-dolmenwood-sheet.dw.meta.otherNotes": "<p>Updated</p>"
    });

    expect(buildDwUpdatePayloadMock).toHaveBeenCalledWith(actor, {
      meta: {
        otherNotes: "<p>Updated</p>"
      }
    });
    expect(actor.update).toHaveBeenCalledWith({
      name: "Rook",
      ...dwUpdatePayload
    });
  });

  it("sends dw patches through the shared update flow", async () => {
    const actor = {
      update: vi.fn(async () => {})
    } as unknown as Actor;
    const html = $(document.body) as HtmlRoot;
    const nextDw = {
      meta: {
        spellsCollapsed: true
      }
    } as unknown as DwFlags;
    const updatePayload = {
      [`flags.${MODULE_ID}.dw`]: nextDw
    };

    buildDwUpdatePayloadMock.mockReturnValue(updatePayload);

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    sheet.activateListeners(html);

    const [{ applyDwPatch }] = registerSheetListenersMock.mock.calls.map((call) => call[1]);

    await applyDwPatch(nextDw);

    expect(buildDwUpdatePayloadMock).toHaveBeenCalledWith(actor, nextDw);
    expect(actor.update).toHaveBeenCalledWith(updatePayload);
  });

  it("skips actor.update when the computed update payload is empty", async () => {
    const actor = {
      update: vi.fn(async () => {})
    } as unknown as Actor;

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    await sheet._updateObject(new Event("submit"), {});

    expect(actor.update).not.toHaveBeenCalled();
  });

  it("queues actor updates so later changes wait for earlier writes", async () => {
    let resolveFirstUpdate: (() => void) | null = null;
    const firstUpdate = new Promise<void>((resolve) => {
      resolveFirstUpdate = resolve;
    });
    const actor = {
      update: vi
        .fn<(...args: unknown[]) => Promise<void>>()
        .mockImplementationOnce(async () => {
          await firstUpdate;
        })
        .mockResolvedValueOnce()
    } as unknown as Actor;

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    const firstCall = sheet._updateObject(new Event("submit"), { name: "First" });
    await flushPromises();

    expect(actor.update).toHaveBeenCalledTimes(1);
    expect(actor.update).toHaveBeenNthCalledWith(1, { name: "First" });

    const secondCall = sheet._updateObject(new Event("submit"), { name: "Second" });
    await flushPromises();

    expect(actor.update).toHaveBeenCalledTimes(1);

    resolveFirstUpdate?.();
    await firstCall;
    await secondCall;

    expect(actor.update).toHaveBeenCalledTimes(2);
    expect(actor.update).toHaveBeenNthCalledWith(2, { name: "Second" });
  });
});
