import { describe, expect, it, vi } from "vitest";
import { registerExtraSkillRollListener } from "./extra-skill-roll.listener.js";

describe("registerExtraSkillRollListener", () => {
  it("rolls extra skill on mouse down using row inputs", async () => {
    document.body.innerHTML = `
      <div class="dw-skill__extra">
        <button data-action="dw-roll-extra-skill" data-name="fallback"></button>
        <input class="dw-skill__name" value="Stealth" />
        <input class="dw-target" value="8" />
      </div>
    `;
    const html = $(document.body);
    const actor = {} as Actor;
    const rollTargetCheck = vi.fn(async () => ({ roll: {} as Roll, success: true, target: 8 }));

    registerExtraSkillRollListener(html, { actor, rollTargetCheck });

    html.find("[data-action='dw-roll-extra-skill']").trigger("mousedown");
    await Promise.resolve();
    await Promise.resolve();

    expect(rollTargetCheck).toHaveBeenCalledTimes(1);
    expect(rollTargetCheck).toHaveBeenCalledWith(actor, "Skill: STEALTH", 8);
  });
});
