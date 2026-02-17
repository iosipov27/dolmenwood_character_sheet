import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerRemoveSkillListener } from "./remove-skill.listener.js";

describe("registerRemoveSkillListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("removes selected extra skill after confirm", async () => {
    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => key }
    });
    const confirm = vi.fn(async () => true);
    const originalFoundry = globalThis.foundry as Record<string, unknown> | undefined;
    const foundryWithDialogConfirm = {
      ...(originalFoundry ?? {}),
      applications: {
        ...((originalFoundry as { applications?: Record<string, unknown> } | undefined)?.applications ??
          {}),
        api: {
          ...((originalFoundry as { applications?: { api?: Record<string, unknown> } } | undefined)
            ?.applications?.api ?? {}),
          DialogV2: { confirm }
        }
      }
    };

    vi.stubGlobal("foundry", foundryWithDialogConfirm);

    document.body.innerHTML = `
      <button data-action="dw-remove-skill" data-index="0"></button>
      <input name="dw.extraSkills.0.name" value="Forage" />
      <input name="dw.extraSkills.0.target" value="6" />
      <input name="dw.extraSkills.1.name" value="Tracking" />
      <input name="dw.extraSkills.1.target" value="9" />
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(() => ({ extraSkills: [] }) as never);
    const setDwFlags = vi.fn(async () => {});

    registerRemoveSkillListener(html, { getDwFlags, setDwFlags });

    html.find("[data-action='dw-remove-skill']").trigger("click");
    await flushPromises(3);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        extraSkills: [{ name: "Tracking", target: 9 }]
      })
    );
  });
});
