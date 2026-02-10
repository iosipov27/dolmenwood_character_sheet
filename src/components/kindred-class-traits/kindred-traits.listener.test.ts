import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerKindredTraitsListener } from "./kindred-traits.listener.js";
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
      kindredClassTraits: "Old traits",
      background: "",
      alignment: "",
      affiliation: "",
      moonSign: "",
      languages: "",
      xp: 0,
      level: 1,
      nextLevel: 2000,
      modifier: 0
    }
  };
}

describe("registerKindredTraitsListener", () => {
  it("saves contenteditable value on blur", async () => {
    document.body.innerHTML = `
      <div
        class="dw-kindred-traits-editable contenteditable"
        contenteditable="plaintext-only"
        data-field="kindredClassTraits"
      >Old traits</div>
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerKindredTraitsListener(html, { getDwFlags, setDwFlags });

    const editable = html.find(".dw-kindred-traits-editable").get(0) as HTMLElement;

    editable.innerText = "Updated traits";
    $(editable).trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ kindredClassTraits: "Updated traits" })
      })
    );
    expect(editable.textContent).toBe("Updated traits");
  });
});
