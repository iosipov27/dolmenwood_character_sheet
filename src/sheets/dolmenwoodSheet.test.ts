import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DwFlags, HtmlRoot } from "../types/index.js";
import { MODULE_ID } from "../constants/moduleId.js";
import { flushPromises } from "../test/flushPromises.js";

const registerFormChangeListenerMock = vi.fn();
const registerSheetListenersMock = vi.fn();
const buildDwFlagsFromActorMock = vi.fn();
const buildFieldUpdatePayloadMock = vi.fn();
const buildDwUpdatePayloadMock = vi.fn();
let baseCloseMock: ReturnType<typeof vi.fn>;

vi.mock("../listeners/registerFormChangeListener.js", () => ({
  registerFormChangeListener: registerFormChangeListenerMock
}));

vi.mock("../listeners/registerSheetListeners.js", () => ({
  registerSheetListeners: registerSheetListenersMock
}));

vi.mock("../models/buildDwFlagsFromActor.js", () => ({
  buildDwFlagsFromActor: buildDwFlagsFromActorMock
}));

vi.mock("../handlers/sheetUpdateBuilder.js", () => ({
  buildFieldUpdatePayload: buildFieldUpdatePayloadMock,
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
    baseCloseMock = vi.fn(async () => {});

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

      async close(): Promise<void> {
        await baseCloseMock();
      }

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

  it("sends form field changes through the shared update flow", async () => {
    const actor = {
      update: vi.fn(async () => {})
    } as unknown as Actor;
    const html = $(document.body) as HtmlRoot;
    const updatePayload = { name: "Rook" };

    buildFieldUpdatePayloadMock.mockReturnValue(updatePayload);

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    sheet.activateListeners(html);

    const [{ onFieldChange }] = registerFormChangeListenerMock.mock.calls.map((call) => call[1]);

    await onFieldChange("name", "Rook");

    expect(buildFieldUpdatePayloadMock).toHaveBeenCalledWith(actor, "name", "Rook");
    expect(actor.update).toHaveBeenCalledWith(updatePayload);
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
    const html = $(document.body) as HtmlRoot;

    buildFieldUpdatePayloadMock.mockReturnValue({});

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    sheet.activateListeners(html);

    const [{ onFieldChange }] = registerFormChangeListenerMock.mock.calls.map((call) => call[1]);

    await onFieldChange(`flags.${MODULE_ID}.dw.meta.otherNotes`, "<p>ignored</p>");

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
    const html = $(document.body) as HtmlRoot;

    buildFieldUpdatePayloadMock
      .mockReturnValueOnce({ name: "First" })
      .mockReturnValueOnce({ name: "Second" });

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    sheet.activateListeners(html);

    const [{ onFieldChange }] = registerFormChangeListenerMock.mock.calls.map((call) => call[1]);

    const firstCall = onFieldChange("name", "First");
    await flushPromises();

    expect(actor.update).toHaveBeenCalledTimes(1);
    expect(actor.update).toHaveBeenNthCalledWith(1, { name: "First" });

    const secondCall = onFieldChange("name", "Second");
    await flushPromises();

    expect(actor.update).toHaveBeenCalledTimes(1);

    resolveFirstUpdate?.();
    await firstCall;
    await secondCall;

    expect(actor.update).toHaveBeenCalledTimes(2);
    expect(actor.update).toHaveBeenNthCalledWith(2, { name: "Second" });
  });

  it("flushes the active field before closing and waits for queued updates", async () => {
    let resolveUpdate: (() => void) | null = null;
    const pendingUpdate = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    const actor = {
      update: vi.fn(async () => {
        await pendingUpdate;
      })
    } as unknown as Actor;

    buildFieldUpdatePayloadMock.mockReturnValue({ name: "Rook" });

    document.body.innerHTML = `<form><input name="name" value="Rook" /></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const input = form.querySelector("input") as HTMLInputElement;
    const html = $(form) as HtmlRoot;
    const blurSpy = vi.spyOn(input, "blur");

    const DolmenwoodSheet = await loadSheet();
    const sheet = new DolmenwoodSheet(actor);

    Object.defineProperty(sheet, "form", {
      configurable: true,
      value: form
    });

    sheet.activateListeners(html);
    input.focus();

    const [{ onFieldChange }] = registerFormChangeListenerMock.mock.calls.map((call) => call[1]);

    const updatePromise = onFieldChange("name", "Rook");
    await flushPromises();

    const closePromise = sheet.close();
    await flushPromises();

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(baseCloseMock).not.toHaveBeenCalled();

    resolveUpdate?.();
    await updatePromise;
    await closePromise;

    expect(baseCloseMock).toHaveBeenCalledTimes(1);
  });
});
