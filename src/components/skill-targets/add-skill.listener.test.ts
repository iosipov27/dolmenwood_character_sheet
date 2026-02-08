import { describe, expect, it, vi } from "vitest";
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
    const setDwFlags = vi.fn(async () => {});

    registerAddSkillListener(html, { getDwFlags, setDwFlags });

    html.find("[data-action='dw-add-skill']").trigger("click");
    await Promise.resolve();
    await Promise.resolve();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        extraSkills: [
          { name: "Forage", target: 6 },
          { name: "Tracking", target: 9 },
          { name: "", target: 0 }
        ]
      })
    );
  });
});
