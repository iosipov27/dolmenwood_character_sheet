import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerLanguagesListener } from "./languages.listener.js";
import type { DwFlags } from "../../types.js";

function buildDwFlags(): DwFlags {
  return {
    saves: { doom: 1, hold: 1, spell: 1, ray: 1, blast: 1, magic: 1 },
    skills: { listen: 1, search: 1, survival: 1 },
    extraSkills: [],
    movement: { speed: 120, exploring: 40, overland: 24 },
    combat: { attack: 0 },
    meta: {
      kindredClass: "",
      kindredClassTraits: "",
      background: "",
      alignment: "",
      affiliation: "",
      moonSign: "",
      languages: "Old language",
      xp: 0,
      level: 1,
      nextLevel: 2000,
      modifier: 0
    }
  };
}

describe("registerLanguagesListener", () => {
  it("opens textarea on content click and saves by blur", async () => {
    document.body.innerHTML = `
      <div class="dw-languages-display">
        <div class="dw-languages-content">Old language</div>
      </div>
      <textarea class="dw-languages-textarea" style="display:none;"></textarea>
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerLanguagesListener(html, { getDwFlags, setDwFlags });

    const content = html.find(".dw-languages-content");
    const textarea = html.find(".dw-languages-textarea");

    content.trigger("click");
    textarea.val("Elvish, Woldish");
    textarea.trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ languages: "Elvish, Woldish" })
      })
    );
    expect(content.text()).toBe("Elvish, Woldish");
  });
});
