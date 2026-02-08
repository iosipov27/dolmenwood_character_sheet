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
    vi.stubGlobal("Dialog", {
      confirm: vi.fn(async () => true)
    });

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

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        extraSkills: [{ name: "Tracking", target: 9 }]
      })
    );
  });
});
