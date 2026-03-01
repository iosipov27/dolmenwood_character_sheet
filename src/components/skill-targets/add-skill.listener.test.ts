import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerAddSkillListener } from "./add-skill.listener.js";

describe("registerAddSkillListener", () => {
  it("reads existing extra skills from form and appends new empty skill", async () => {
    document.body.innerHTML = `
      <button data-action="dw-add-skill"></button>
      <input name="dw.extraSkills.0.name" value="Forage" />
      <input name="dw.extraSkills.0.target" value="6" />
      <input name="dw.extraSkills.1.name" value="Tracking" />
      <input name="dw.extraSkills.1.target" value="9" />
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(() => ({ extraSkills: [] }) as never);
    const applyDwPatch = vi.fn(async () => {});

    registerAddSkillListener(html, { getDwFlags, applyDwPatch });

    html.find("[data-action='dw-add-skill']").trigger("click");
    await flushPromises();

    expect(applyDwPatch).toHaveBeenCalledTimes(1);
    expect(applyDwPatch).toHaveBeenCalledWith({
      extraSkills: [
        { name: "Forage", target: 6 },
        { name: "Tracking", target: 9 },
        { name: "", target: 6 }
      ]
    });
  });
});
