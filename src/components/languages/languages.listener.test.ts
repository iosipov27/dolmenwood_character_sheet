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
  it("saves contenteditable value on blur", async () => {
    document.body.innerHTML = `
      <div
        class="dw-languages-editable contenteditable"
        contenteditable="plaintext-only"
        data-field="languages"
      >Old language</div>
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerLanguagesListener(html, { getDwFlags, setDwFlags });

    const editable = html.find(".dw-languages-editable").get(0) as HTMLElement;

    editable.innerText = "Elvish, Woldish";
    $(editable).trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ languages: "Elvish, Woldish" })
      })
    );
    expect(editable.textContent).toBe("Elvish, Woldish");
  });
});
